import crypto from "node:crypto";
import { getHealingStrategyProfile } from "./healing-strategy-registry.mjs";
import { recordHealingOutcome } from "./issue-learning-service.mjs";

const MAX_ATTEMPTS_IN_SNAPSHOT = 18;

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function severityRank(level) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function normalizeEligibility(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (["eligible_for_healing", "assist_only", "manual_only", "blocked", "unsafe"].includes(normalized)) {
    return normalized;
  }
  return "blocked";
}

function normalizeHealingMode(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (["suggest_only", "prompt_assisted", "orchestrated_healing", "direct_action"].includes(normalized)) {
    return normalized;
  }
  return "suggest_only";
}

function confidenceLabel(score) {
  if (score >= 75) return "high confidence";
  if (score >= 50) return "medium confidence";
  if (score >= 25) return "low confidence";
  return "unsafe";
}

function buildContextKey(report) {
  return [
    normalizeText(report?.meta?.baseUrl),
    normalizeText(report?.meta?.auditScope || report?.summary?.auditScope),
    normalizeText(report?.meta?.viewportLabel || report?.meta?.viewport),
  ].join("|");
}

function buildIssueKey(issueLike) {
  return [
    normalizeText(issueLike?.code).toUpperCase(),
    normalizeText(issueLike?.route || "/"),
    normalizeText(issueLike?.action),
  ].join("|");
}

function buildRunId(report) {
  return [
    buildContextKey(report),
    normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt),
    String(report?.issues?.length || report?.summary?.totalIssues || 0),
  ].join("|");
}

function summarizeIssueFingerprint(issue) {
  return [
    normalizeText(issue?.code).toUpperCase(),
    normalizeText(issue?.route || "/"),
    normalizeText(issue?.action),
    normalizeText(issue?.severity),
  ].join("|");
}

function getResolutionLead(issue) {
  return normalizeText(issue?.finalResolution)
    || normalizeText(issue?.possibleResolution)
    || normalizeText(issue?.recommendedResolution);
}

function computeConfidence(issue, profile) {
  let score = profile.riskLevel === "low" ? 38 : profile.riskLevel === "medium" ? 28 : 12;

  if (issue.finalResolutionOrigin === "curated") score += 40;
  else if (issue.finalResolutionOrigin === "manual_override") score += 28;
  else if (issue.finalResolutionOrigin === "auto_promoted") score += 22;

  score += Math.min(Number(issue.learningCounts?.validated || 0) * 12, 30);
  score += Math.min(Number(issue.learningCounts?.partial || 0) * 5, 10);
  score -= Math.min(Number(issue.learningCounts?.failed || 0) * 12, 36);

  if (!getResolutionLead(issue)) score -= 24;
  if (issue.severity === "high" && profile.riskLevel !== "low") score -= 10;
  if (issue.manualOverrideCount > 0) score += 6;

  return clamp(score, 0, 100);
}

function resolveEligibility(issue, profile, score, resolutionLead) {
  if (!normalizeText(issue?.code) || !normalizeText(issue?.route || "/")) {
    return "blocked";
  }
  if (profile.defaultEligibility === "unsafe") {
    return "unsafe";
  }
  if (profile.defaultEligibility === "manual_only") {
    return "manual_only";
  }
  if (!resolutionLead && Number(issue.learningCounts?.validated || 0) === 0 && Number(issue.learningCounts?.partial || 0) === 0) {
    return profile.defaultEligibility === "eligible_for_healing" ? "assist_only" : "manual_only";
  }
  if (score < 20) return "unsafe";
  if (score < 45) return "assist_only";
  if (profile.defaultEligibility === "eligible_for_healing" || score >= 60) {
    return "eligible_for_healing";
  }
  return "assist_only";
}

function resolveHealingMode(eligibility, profile, score, promptReady) {
  if (eligibility === "unsafe" || eligibility === "blocked" || eligibility === "manual_only") {
    return "suggest_only";
  }
  if (eligibility === "assist_only") {
    return promptReady ? "prompt_assisted" : "suggest_only";
  }
  if (promptReady && score >= 55 && profile.supportedModes.includes("orchestrated_healing")) {
    return "orchestrated_healing";
  }
  if (promptReady && profile.supportedModes.includes("prompt_assisted")) {
    return "prompt_assisted";
  }
  return "suggest_only";
}

function buildRationale(issue, profile, eligibility, score, resolutionLead) {
  const lines = [
    `Strategy profile: ${profile.id} (${profile.riskLevel} risk).`,
    `Confidence score: ${score}.`,
  ];
  if (issue.finalResolution) {
    lines.push(`Known final resolution available (${issue.finalResolutionOrigin || "runtime"}).`);
  } else if (issue.possibleResolution) {
    lines.push("No final resolution is locked yet, but there is a possible resolution in memory.");
  } else if (issue.recommendedResolution) {
    lines.push("The engine only has a recommended resolution direction right now.");
  }
  if (Number(issue.learningCounts?.failed || 0) > 0) {
    lines.push(`There are ${issue.learningCounts.failed} failed attempt(s) recorded for this pattern.`);
  }
  if (!resolutionLead) {
    lines.push("No concrete resolution lead is available yet, so the engine must stay conservative.");
  }
  if (eligibility === "unsafe") {
    lines.push("This pattern is not safe for assisted correction in the current maturity level.");
  } else if (eligibility === "manual_only") {
    lines.push("This pattern requires human judgment before any correction attempt.");
  }
  return lines;
}

function buildHealingPrompt(issue, strategy, report) {
  const lines = [
    "Act as a senior software engineer executing a safe self-healing workflow.",
    `Issue code: ${issue.code}`,
    `Severity: ${issue.severity}`,
    `Route: ${issue.route}${issue.action ? ` | action: ${issue.action}` : ""}`,
    `Observed problem: ${issue.detail}`,
    `Healing eligibility: ${strategy.eligibility}`,
    `Healing mode: ${strategy.healingMode}`,
    `Confidence: ${strategy.confidenceLabel} (${strategy.confidenceScore}/100)`,
    `Strategy profile: ${strategy.strategyId}`,
    `Best known correction lead: ${strategy.resolutionLead || issue.recommendedResolution}`,
  ];

  if (issue.finalResolution) {
    lines.push(`Validated final resolution: ${issue.finalResolution}`);
  } else if (issue.possibleResolution) {
    lines.push(`Current possible resolution: ${issue.possibleResolution}`);
  }

  if (strategy.avoidText) {
    lines.push(`Avoid repeating this failed pattern: ${strategy.avoidText}`);
  }

  lines.push(
    "Requirements:",
    "- fix the real root cause instead of masking the symptom",
    "- preserve current working flows",
    "- keep the change minimal and targeted",
    "- explain what was changed and why it is safer",
    "",
    "Mandatory revalidation:",
    `- rerun with: ${report?.meta?.replayCommand || "n/a"}`,
    "- compare before/after and confirm whether the issue was zeroed, reduced, unchanged or regressed",
    "- call out any collateral regression introduced by the fix",
  );

  return lines.join("\n");
}

function buildStrategy(issue, report, store) {
  const profile = getHealingStrategyProfile(issue.code);
  const resolutionLead = getResolutionLead(issue);
  const confidenceScore = computeConfidence(issue, profile);
  const eligibility = resolveEligibility(issue, profile, confidenceScore, resolutionLead);
  const promptReady = Boolean(issue.code && issue.route && (resolutionLead || issue.recommendedResolution));
  const healingMode = resolveHealingMode(eligibility, profile, confidenceScore, promptReady);
  const confidence = confidenceLabel(confidenceScore);
  const attempts = Array.isArray(store?.attempts)
    ? store.attempts
        .filter((entry) => entry.issueKey === buildIssueKey(issue))
        .sort((left, right) => String(right.updatedAt || right.createdAt).localeCompare(String(left.updatedAt || left.createdAt)))
    : [];
  const lastAttempt = attempts[0] || null;
  const suggestedNextStep =
    eligibility === "eligible_for_healing"
      ? "Prepare the healing package, apply the fix in Codex/LLM and rerun the audit."
      : eligibility === "assist_only"
      ? "Generate a healing prompt and keep the fix human-reviewed before revalidation."
      : eligibility === "manual_only"
      ? "Review the issue manually before creating a healing attempt."
      : eligibility === "unsafe"
      ? "Do not automate this issue yet. Investigate it manually."
      : "Collect more context before attempting correction.";

  return {
    issueKey: buildIssueKey(issue),
    issueCode: issue.code,
    route: issue.route,
    action: issue.action,
    strategyId: profile.id,
    strategyDescription: profile.description,
    riskLevel: profile.riskLevel,
    eligibility: normalizeEligibility(eligibility),
    healingMode: normalizeHealingMode(healingMode),
    supportedModes: [...profile.supportedModes],
    directActionAvailable: profile.directActionEnabled === true,
    requiresConfirmation: profile.requiresConfirmation === true || healingMode !== "suggest_only",
    confidenceScore,
    confidenceLabel: confidence,
    confidenceReason: `${profile.id} | ${confidence} | score ${confidenceScore}`,
    resolutionLead,
    resolutionSource: issue.finalResolution
      ? (issue.finalResolutionOrigin || "runtime")
      : issue.possibleResolution
      ? "possible_resolution"
      : "recommended_resolution",
    promptReady,
    avoidText:
      normalizeText(issue?.learningCases?.find((item) => item.outcome === "failed")?.result)
      || normalizeText(issue?.learningCases?.find((item) => item.outcome === "failed")?.attempt),
    rationale: buildRationale(issue, profile, eligibility, confidenceScore, resolutionLead),
    suggestedNextStep,
    promptText: promptReady ? buildHealingPrompt(issue, {
      strategyId: profile.id,
      eligibility,
      healingMode,
      confidenceLabel: confidence,
      confidenceScore,
      resolutionLead,
      avoidText:
        normalizeText(issue?.learningCases?.find((item) => item.outcome === "failed")?.result)
        || normalizeText(issue?.learningCases?.find((item) => item.outcome === "failed")?.attempt),
    }, report) : "",
    lastAttempt: lastAttempt
      ? {
          id: lastAttempt.id,
          status: lastAttempt.status,
          outcome: lastAttempt.outcome,
          updatedAt: lastAttempt.updatedAt || lastAttempt.createdAt,
          confidenceLevel: lastAttempt.confidenceLevel,
          healingMode: lastAttempt.healingMode,
        }
      : null,
  };
}

function summarizeAttemptsForContext(store, contextKey) {
  return (store?.attempts || [])
    .filter((entry) => entry.contextKey === contextKey)
    .sort((left, right) => String(right.updatedAt || right.createdAt).localeCompare(String(left.updatedAt || left.createdAt)))
    .slice(0, MAX_ATTEMPTS_IN_SNAPSHOT)
    .map((entry) => ({ ...entry }));
}

function summarizeStoreCounts(issues, attempts) {
  return issues.reduce((acc, issue) => {
    acc.issues += 1;
    if (issue.selfHealing?.eligibility === "eligible_for_healing") acc.eligible += 1;
    if (issue.selfHealing?.eligibility === "assist_only") acc.assistOnly += 1;
    if (issue.selfHealing?.eligibility === "manual_only") acc.manualOnly += 1;
    if (issue.selfHealing?.eligibility === "blocked") acc.blocked += 1;
    if (issue.selfHealing?.eligibility === "unsafe") acc.unsafe += 1;
    if (issue.selfHealing?.promptReady) acc.promptReady += 1;
    if (issue.selfHealing?.healingMode === "orchestrated_healing") acc.orchestrated += 1;
    return acc;
  }, {
    issues: 0,
    eligible: 0,
    assistOnly: 0,
    manualOnly: 0,
    blocked: 0,
    unsafe: 0,
    promptReady: 0,
    orchestrated: 0,
    pendingAttempts: attempts.filter((item) => item.outcome === "pending").length,
    validatedAttempts: attempts.filter((item) => item.outcome === "validated").length,
    failedAttempts: attempts.filter((item) => item.outcome === "failed").length,
    partialAttempts: attempts.filter((item) => item.outcome === "partial").length,
  });
}

function buildOutcomeSummary(outcome, attempt, currentIssue, collateralRegressionCount) {
  if (outcome === "validated") {
    return collateralRegressionCount > 0
      ? `Issue zeroed after revalidation, but ${collateralRegressionCount} collateral issue(s) appeared.`
      : "Issue zeroed after revalidation.";
  }
  if (outcome === "partial") {
    return currentIssue
      ? `Issue still exists, but the latest run suggests reduced severity or narrower scope (${currentIssue.severity}).`
      : "Issue improved, but related traces still remain in the run.";
  }
  return `Issue remained open after revalidation for ${attempt.issueCode}.`;
}

function findMatchingIssue(report, attempt) {
  const issues = Array.isArray(report?.issues) ? report.issues : [];
  const exact = issues.find((issue) => buildIssueKey(issue) === attempt.issueKey);
  if (exact) return exact;
  return issues.find((issue) => normalizeText(issue.code).toUpperCase() === normalizeText(attempt.issueCode).toUpperCase()) || null;
}

function resolveOutcomeForAttempt(report, attempt) {
  const currentIssue = findMatchingIssue(report, attempt);
  if (!currentIssue) {
    return { outcome: "validated", currentIssue: null };
  }
  if (normalizeText(currentIssue.route || "/") !== normalizeText(attempt.route || "/")) {
    return { outcome: "partial", currentIssue };
  }
  if (severityRank(currentIssue.severity) < severityRank(attempt.baselineSeverity || attempt.severity || "low")) {
    return { outcome: "partial", currentIssue };
  }
  return { outcome: "failed", currentIssue };
}

export function createEmptySelfHealingSnapshot() {
  return {
    updatedAt: "",
    contextKey: "",
    storePath: "",
    summary: {
      issues: 0,
      eligible: 0,
      assistOnly: 0,
      manualOnly: 0,
      blocked: 0,
      unsafe: 0,
      promptReady: 0,
      orchestrated: 0,
      pendingAttempts: 0,
      validatedAttempts: 0,
      failedAttempts: 0,
      partialAttempts: 0,
    },
    issues: [],
    attempts: [],
  };
}

export function prepareHealingAttempt(storeInput, payloadInput) {
  const store = storeInput && typeof storeInput === "object" ? storeInput : { attempts: [], updatedAt: "" };
  const payload = payloadInput && typeof payloadInput === "object" ? payloadInput : {};
  const issueCode = normalizeText(payload.issueCode).toUpperCase();
  const contextKey = normalizeText(payload.contextKey);
  const issueKey = normalizeText(payload.issueKey);
  if (!issueCode || !contextKey || !issueKey) {
    throw new Error("healing_prepare_requires_issue_context");
  }

  const now = normalizeText(payload.timestamp || new Date().toISOString());
  const attempt = {
    id: crypto.randomUUID(),
    contextKey,
    runId: normalizeText(payload.runId),
    issueKey,
    issueCode,
    title: normalizeText(payload.title || issueCode),
    route: normalizeText(payload.route || "/"),
    action: normalizeText(payload.action),
    category: normalizeText(payload.category),
    severity: normalizeText(payload.severity || "medium"),
    baseUrl: normalizeText(payload.baseUrl),
    auditScope: normalizeText(payload.auditScope),
    viewportLabel: normalizeText(payload.viewportLabel),
    eligibility: normalizeEligibility(payload.eligibility),
    healingMode: normalizeHealingMode(payload.healingMode),
    confidenceScore: Number.isFinite(Number(payload.confidenceScore)) ? Number(payload.confidenceScore) : 0,
    confidenceLevel: normalizeText(payload.confidenceLevel || "low"),
    confidenceReason: normalizeText(payload.confidenceReason),
    strategyId: normalizeText(payload.strategyId),
    strategySource: normalizeText(payload.strategySource || "self_healing_engine"),
    strategySummary: normalizeText(payload.strategySummary),
    suggestedNextStep: normalizeText(payload.suggestedNextStep),
    requiresConfirmation: payload.requiresConfirmation === true,
    promptReady: payload.promptReady === true,
    directActionAvailable: payload.directActionAvailable === true,
    recommendedResolution: normalizeText(payload.recommendedResolution),
    possibleResolution: normalizeText(payload.possibleResolution),
    finalResolution: normalizeText(payload.finalResolution),
    attemptedResolution: normalizeText(payload.attemptedResolution || payload.finalResolution || payload.possibleResolution || payload.recommendedResolution),
    avoidText: normalizeText(payload.avoidText),
    promptText: normalizeText(payload.promptText),
    replayCommand: normalizeText(payload.replayCommand),
    baselineIssueKey: normalizeText(payload.baselineIssueKey || issueKey),
    baselineSeverity: normalizeText(payload.baselineSeverity || payload.severity),
    baselineTotalIssues: Number.isFinite(Number(payload.baselineTotalIssues)) ? Number(payload.baselineTotalIssues) : 0,
    baselineIssueKeys: Array.isArray(payload.baselineIssueKeys) ? payload.baselineIssueKeys.map((entry) => normalizeText(entry)).filter(Boolean).slice(0, 200) : [],
    origin: normalizeText(payload.origin || "self_healing_engine"),
    note: normalizeText(payload.note),
    actor: normalizeText(payload.actor || "desktop-operator"),
    status: "prepared",
    outcome: "pending",
    outcomeSummary: "",
    collateralRegressionCount: 0,
    createdAt: now,
    updatedAt: now,
    revalidatedAt: "",
    revalidationRunId: "",
    lastSeenAt: now,
  };

  store.attempts = [attempt, ...(Array.isArray(store.attempts) ? store.attempts : [])].slice(0, 240);
  store.updatedAt = now;
  return { store, attempt };
}

export function ingestCompletedHealingRun(storeInput, learningStoreInput, report) {
  const store = storeInput && typeof storeInput === "object" ? storeInput : { attempts: [], updatedAt: "" };
  const learningStore = learningStoreInput && typeof learningStoreInput === "object"
    ? learningStoreInput
    : { entries: {}, lastRunByContext: {}, processedRuns: [], updatedAt: "" };
  const contextKey = buildContextKey(report);
  const runId = buildRunId(report);
  const timestamp = normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt || new Date().toISOString());
  const attempts = Array.isArray(store.attempts) ? store.attempts : [];
  const pendingAttempts = attempts.filter((entry) => entry.contextKey === contextKey && entry.outcome === "pending");
  const currentFingerprints = new Set((report?.issues || []).map((issue) => summarizeIssueFingerprint(issue)));
  const resolvedAttempts = [];

  for (const attempt of pendingAttempts) {
    const outcomeData = resolveOutcomeForAttempt(report, attempt);
    const collateralRegressionCount = Array.isArray(attempt.baselineIssueKeys)
      ? Array.from(currentFingerprints).filter((fingerprint) => !attempt.baselineIssueKeys.includes(fingerprint)).length
      : 0;
    attempt.status = "resolved";
    attempt.outcome = outcomeData.outcome;
    attempt.revalidatedAt = timestamp;
    attempt.revalidationRunId = runId;
    attempt.updatedAt = timestamp;
    attempt.lastSeenAt = timestamp;
    attempt.collateralRegressionCount = collateralRegressionCount;
    attempt.outcomeSummary = buildOutcomeSummary(outcomeData.outcome, attempt, outcomeData.currentIssue, collateralRegressionCount);
    resolvedAttempts.push({ ...attempt });

    const learningResult = recordHealingOutcome(learningStore, {
      issueCode: attempt.issueCode,
      route: attempt.route,
      action: attempt.action,
      title: attempt.title,
      category: attempt.category,
      severity: attempt.severity,
      attemptedResolution: attempt.attemptedResolution,
      finalResolution: attempt.finalResolution,
      possibleResolution: attempt.possibleResolution,
      recommendedResolution: attempt.recommendedResolution,
      strategySummary: attempt.strategySummary,
      learningSource: `Self-healing ${attempt.healingMode} outcome recorded in SitePulse Desktop.`,
      outcome: attempt.outcome,
      outcomeSummary: attempt.outcomeSummary,
      baseUrl: attempt.baseUrl,
      auditScope: attempt.auditScope,
      viewportLabel: attempt.viewportLabel,
      detail: outcomeData.currentIssue?.detail || attempt.strategySummary,
      timestamp,
      revalidated: true,
      zeroedIssue: attempt.outcome === "validated",
      caseTitle: `${attempt.issueCode} self-healing ${attempt.outcome}`,
    });
    learningStore.entries = learningResult.store.entries;
    learningStore.lastRunByContext = learningResult.store.lastRunByContext;
    learningStore.processedRuns = learningResult.store.processedRuns;
    learningStore.updatedAt = timestamp;
  }

  store.updatedAt = timestamp;
  return { store, learningStore, resolvedAttempts };
}

export function attachHealingSnapshot(storeInput, report, storePath = "") {
  const store = storeInput && typeof storeInput === "object" ? storeInput : { attempts: [], updatedAt: "" };
  const snapshot = createEmptySelfHealingSnapshot();
  const contextKey = buildContextKey(report);
  const attempts = summarizeAttemptsForContext(store, contextKey);
  const issues = Array.isArray(report?.issues) ? report.issues : [];

  report.issues = issues.map((issue) => {
    const strategy = buildStrategy(issue, report, store);
    return {
      ...issue,
      selfHealing: strategy,
    };
  });

  snapshot.updatedAt = normalizeText(store.updatedAt || report?.meta?.finishedAt || report?.meta?.startedAt);
  snapshot.contextKey = contextKey;
  snapshot.storePath = storePath;
  snapshot.issues = report.issues.map((issue) => ({
    issueKey: issue.selfHealing.issueKey,
    issueCode: issue.code,
    route: issue.route,
    action: issue.action,
    severity: issue.severity,
    eligibility: issue.selfHealing.eligibility,
    healingMode: issue.selfHealing.healingMode,
    confidenceScore: issue.selfHealing.confidenceScore,
    confidenceLabel: issue.selfHealing.confidenceLabel,
    strategyId: issue.selfHealing.strategyId,
    strategyDescription: issue.selfHealing.strategyDescription,
    resolutionLead: issue.selfHealing.resolutionLead,
    resolutionSource: issue.selfHealing.resolutionSource,
    promptReady: issue.selfHealing.promptReady,
    suggestedNextStep: issue.selfHealing.suggestedNextStep,
    avoidText: issue.selfHealing.avoidText,
    promptText: issue.selfHealing.promptText,
    rationale: issue.selfHealing.rationale,
    lastAttempt: issue.selfHealing.lastAttempt,
  }));
  snapshot.attempts = attempts;
  snapshot.summary = summarizeStoreCounts(report.issues, attempts);
  return snapshot;
}
