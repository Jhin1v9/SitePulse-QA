import { getIssueLearning } from "./issue-learning-library.mjs";

const MAX_CASES_PER_ENTRY = 18;
const MAX_CONTEXTS_PER_ENTRY = 8;
const MAX_PANEL_ENTRIES = 18;

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function severityRank(level) {
  if (level === "high") return 3;
  if (level === "medium") return 2;
  return 1;
}

function capitalize(value) {
  const text = normalizeText(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function codeToTitle(code) {
  return normalizeText(code)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((token) => capitalize(token))
    .join(" ");
}

function normalizeOutcome(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (normalized === "validated") return "validated";
  if (normalized === "failed") return "failed";
  if (normalized === "partial") return "partial";
  return "";
}

function normalizeCase(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `case-${index + 1}`),
    outcome: normalizeOutcome(item.outcome),
    title: normalizeText(item.title || `Case ${index + 1}`),
    symptom: normalizeText(item.symptom),
    attempt: normalizeText(item.attempt),
    result: normalizeText(item.result),
    finalFix: normalizeText(item.finalFix),
    source: normalizeText(item.source),
    route: normalizeText(item.route || "/"),
    action: normalizeText(item.action),
    baseUrl: normalizeText(item.baseUrl),
    timestamp: normalizeText(item.timestamp),
    revalidated: item.revalidated === true,
    zeroedIssue: item.zeroedIssue === true,
  };
}

function summarizeCases(cases) {
  const counts = {
    validated: 0,
    failed: 0,
    partial: 0,
  };
  for (const item of cases) {
    if (item.outcome === "validated") counts.validated += 1;
    if (item.outcome === "failed") counts.failed += 1;
    if (item.outcome === "partial") counts.partial += 1;
  }
  return counts;
}

function mergeCounts(left, right) {
  return {
    validated: Number(left?.validated || 0) + Number(right?.validated || 0),
    failed: Number(left?.failed || 0) + Number(right?.failed || 0),
    partial: Number(left?.partial || 0) + Number(right?.partial || 0),
  };
}

function deriveCategory(code) {
  const normalized = normalizeText(code).toUpperCase();
  if (normalized.startsWith("SEO_")) return "seo";
  if (normalized.startsWith("VISUAL_")) return "visual";
  if (normalized.includes("HTTP")) return "http";
  if (normalized.includes("NET")) return "network";
  if (normalized.includes("JS_RUNTIME") || normalized.includes("CONSOLE")) return "runtime";
  if (normalized.includes("BTN")) return "interaction";
  if (normalized.includes("LANGUAGE")) return "content";
  return "general";
}

function buildEntryKey(issueLike) {
  const code = normalizeText(issueLike?.code).toUpperCase();
  const route = normalizeText(issueLike?.route || issueLike?.affectedRoutes?.[0] || "/");
  const action = normalizeText(issueLike?.action || issueLike?.category || "");
  return `${code}|${route}|${action}`;
}

function buildObservationTitle(issueLike) {
  return normalizeText(issueLike?.group || issueLike?.title || codeToTitle(issueLike?.code));
}

function toObservation(issueLike, report) {
  const route =
    normalizeText(issueLike?.route) ||
    (Array.isArray(issueLike?.affectedRoutes) && issueLike.affectedRoutes.length ? normalizeText(issueLike.affectedRoutes[0]) : "/");
  const action = normalizeText(issueLike?.action || (issueLike?.category ? `seo:${issueLike.category}` : ""));
  return {
    id: `${buildEntryKey({ ...issueLike, route, action })}|${normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt)}`,
    entryKey: buildEntryKey({ ...issueLike, route, action }),
    issueCode: normalizeText(issueLike?.code).toUpperCase(),
    title: buildObservationTitle(issueLike),
    category: deriveCategory(issueLike?.code),
    severity: normalizeText(issueLike?.severity || "low"),
    route,
    action,
    detail: normalizeText(issueLike?.detail || issueLike?.symptom || ""),
    possibleResolution: normalizeText(issueLike?.possibleResolution),
    finalResolution: normalizeText(issueLike?.finalResolution),
    recommendedResolution: normalizeText(issueLike?.recommendedResolution || issueLike?.recommendation),
    learningSource: normalizeText(issueLike?.learningSource),
    baseUrl: normalizeText(report?.meta?.baseUrl),
    auditScope: normalizeText(report?.meta?.auditScope || report?.summary?.auditScope),
    viewportLabel: normalizeText(report?.meta?.viewportLabel || report?.meta?.viewport),
  };
}

function buildRunContextKey(report) {
  return [
    normalizeText(report?.meta?.baseUrl),
    normalizeText(report?.meta?.auditScope || report?.summary?.auditScope),
    normalizeText(report?.meta?.viewportLabel || report?.meta?.viewport),
  ].join("|");
}

function buildRunId(report) {
  return [
    buildRunContextKey(report),
    normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt),
    String(report?.summary?.totalIssues ?? 0),
    String(report?.summary?.routesChecked ?? 0),
    String(report?.summary?.seoScore ?? 0),
  ].join("|");
}

function dedupeCases(cases) {
  const map = new Map();
  for (const item of cases.map((entry, index) => normalizeCase(entry, index))) {
    const key = [
      item.outcome,
      item.title.toLowerCase(),
      item.attempt.toLowerCase(),
      item.result.toLowerCase(),
      item.route.toLowerCase(),
      item.action.toLowerCase(),
      item.timestamp,
    ].join("|");
    map.set(key, item);
  }
  return Array.from(map.values())
    .sort((left, right) => String(right.timestamp).localeCompare(String(left.timestamp)))
    .slice(0, MAX_CASES_PER_ENTRY);
}

function dedupeContexts(contexts) {
  const map = new Map();
  for (const item of contexts ?? []) {
    const context = {
      id: String(item.id || `${item.route || "/"}|${item.action || ""}`),
      route: normalizeText(item.route || "/"),
      action: normalizeText(item.action),
      baseUrl: normalizeText(item.baseUrl),
      auditScope: normalizeText(item.auditScope),
      viewportLabel: normalizeText(item.viewportLabel),
      detail: normalizeText(item.detail),
      lastResult: normalizeText(item.lastResult),
      lastSeenAt: normalizeText(item.lastSeenAt),
    };
    const key = `${context.route}|${context.action}|${context.baseUrl}|${context.auditScope}|${context.viewportLabel}`;
    map.set(key, context);
  }
  return Array.from(map.values())
    .sort((left, right) => String(right.lastSeenAt).localeCompare(String(left.lastSeenAt)))
    .slice(0, MAX_CONTEXTS_PER_ENTRY);
}

function ensureEntry(store, observation, timestamp) {
  const existing = store.entries[observation.entryKey];
  if (existing) {
    existing.lastSeenAt = timestamp;
    existing.severity = severityRank(observation.severity) >= severityRank(existing.severity) ? observation.severity : existing.severity;
    if (!existing.title && observation.title) existing.title = observation.title;
    if (!existing.route && observation.route) existing.route = observation.route;
    if (!existing.action && observation.action) existing.action = observation.action;
    if (!existing.possibleResolution && observation.possibleResolution) existing.possibleResolution = observation.possibleResolution;
    if (!existing.recommendedResolution && observation.recommendedResolution) existing.recommendedResolution = observation.recommendedResolution;
    if (!existing.learningSource && observation.learningSource) existing.learningSource = observation.learningSource;
    existing.aggregateCounts.seen += 1;
    existing.contexts = dedupeContexts([
      ...existing.contexts,
      {
        route: observation.route,
        action: observation.action,
        baseUrl: observation.baseUrl,
        auditScope: observation.auditScope,
        viewportLabel: observation.viewportLabel,
        detail: observation.detail,
        lastResult: "seen",
        lastSeenAt: timestamp,
      },
    ]);
    return existing;
  }

  const created = {
    key: observation.entryKey,
    issueCode: observation.issueCode,
    title: observation.title,
    category: observation.category,
    severity: observation.severity,
    route: observation.route,
    action: observation.action,
    possibleResolution: observation.possibleResolution,
    finalResolution: observation.finalResolution,
    recommendedResolution: observation.recommendedResolution,
    learningSource: observation.learningSource,
    resolutionConfidence: "",
    promotionSource: "",
    promotionCount: 0,
    lastValidatedAt: "",
    firstSeenAt: timestamp,
    lastSeenAt: timestamp,
    aggregateCounts: {
      seen: 1,
      validated: 0,
      failed: 0,
      partial: 0,
      revalidated: 0,
      zeroed: 0,
    },
    contexts: dedupeContexts([
      {
        route: observation.route,
        action: observation.action,
        baseUrl: observation.baseUrl,
        auditScope: observation.auditScope,
        viewportLabel: observation.viewportLabel,
        detail: observation.detail,
        lastResult: "seen",
        lastSeenAt: timestamp,
      },
    ]),
    cases: [],
  };
  store.entries[observation.entryKey] = created;
  return created;
}

function registerCase(entry, caseInput) {
  const caseRecord = normalizeCase(caseInput, entry.cases.length);
  if (!caseRecord.title) return;
  entry.cases = dedupeCases([caseRecord, ...entry.cases]);
  if (caseRecord.outcome === "validated") {
    entry.aggregateCounts.validated += 1;
    entry.aggregateCounts.revalidated += caseRecord.revalidated ? 1 : 0;
    entry.aggregateCounts.zeroed += caseRecord.zeroedIssue ? 1 : 0;
    entry.lastValidatedAt = caseRecord.timestamp || entry.lastValidatedAt;
  }
  if (caseRecord.outcome === "failed") {
    entry.aggregateCounts.failed += 1;
  }
  if (caseRecord.outcome === "partial") {
    entry.aggregateCounts.partial += 1;
  }
}

function maybePromoteResolution(entry, observation, caseRecord) {
  const curated = getIssueLearning(observation.issueCode);
  if (normalizeText(curated?.finalSolution)) {
    entry.resolutionConfidence = "curated";
    return;
  }

  const attemptedResolution =
    normalizeText(observation.finalResolution) ||
    normalizeText(observation.possibleResolution) ||
    normalizeText(observation.recommendedResolution);
  if (!attemptedResolution || caseRecord.outcome !== "validated" || caseRecord.zeroedIssue !== true) {
    return;
  }

  const validatedMatches = entry.cases.filter(
    (item) => item.outcome === "validated" && normalizeText(item.attempt).toLowerCase() === attemptedResolution.toLowerCase(),
  ).length;
  const failedMatches = entry.cases.filter(
    (item) => item.outcome === "failed" && normalizeText(item.attempt).toLowerCase() === attemptedResolution.toLowerCase(),
  ).length;
  if (validatedMatches < 1 || validatedMatches < failedMatches) {
    return;
  }

  entry.finalResolution = attemptedResolution;
  entry.promotionSource = "auto_revalidation";
  entry.promotionCount = validatedMatches;
  entry.resolutionConfidence = validatedMatches >= 2 ? "high" : "medium";
  entry.lastValidatedAt = caseRecord.timestamp || entry.lastValidatedAt;
  if (!entry.learningSource) {
    entry.learningSource = "Promoted automatically from runtime revalidation.";
  }
}

function compareObservation(previousObservation, currentObservation) {
  if (!currentObservation) {
    return "validated";
  }
  if (severityRank(currentObservation.severity) < severityRank(previousObservation.severity)) {
    return "partial";
  }
  if (normalizeText(currentObservation.detail).toLowerCase() !== normalizeText(previousObservation.detail).toLowerCase()) {
    return "partial";
  }
  return "failed";
}

function buildRuntimeCaseTitle(observation, outcome) {
  if (outcome === "validated") {
    return `${observation.issueCode} zeroed after revalidation`;
  }
  if (outcome === "partial") {
    return `${observation.issueCode} improved but persisted`;
  }
  return `${observation.issueCode} persisted after revalidation`;
}

function buildRuntimeCaseResult(observation, currentObservation, outcome) {
  if (outcome === "validated") {
    return `Issue disappeared in the next run for the same context (${observation.route}).`;
  }
  if (outcome === "partial") {
    return currentObservation
      ? `Issue stayed open but changed on the next run (${currentObservation.severity}).`
      : `Issue improved but was not fully removed.`;
  }
  return `Issue remained open in the next run for the same context (${observation.route}).`;
}

function buildRuntimeSnapshot(store, report) {
  const sortedEntries = Object.values(store.entries)
    .sort((left, right) => {
      const validatedDiff = Number(right.aggregateCounts.validated || 0) - Number(left.aggregateCounts.validated || 0);
      if (validatedDiff !== 0) return validatedDiff;
      const seenDiff = Number(right.aggregateCounts.seen || 0) - Number(left.aggregateCounts.seen || 0);
      if (seenDiff !== 0) return seenDiff;
      return String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
    });
  const entries = sortedEntries
    .slice(0, MAX_PANEL_ENTRIES)
    .map((entry) => ({
      key: entry.key,
      issueCode: entry.issueCode,
      title: entry.title || codeToTitle(entry.issueCode),
      category: entry.category,
      severity: entry.severity,
      route: entry.route,
      action: entry.action,
      possibleResolution: entry.possibleResolution,
      finalResolution: entry.finalResolution,
      learningSource: entry.learningSource,
      resolutionConfidence: entry.resolutionConfidence,
      promotionSource: entry.promotionSource,
      promotionCount: entry.promotionCount,
      lastValidatedAt: entry.lastValidatedAt,
      lastSeenAt: entry.lastSeenAt,
      learningCounts: {
        validated: Number(entry.aggregateCounts.validated || 0),
        failed: Number(entry.aggregateCounts.failed || 0),
        partial: Number(entry.aggregateCounts.partial || 0),
      },
      avoidText:
        entry.cases.find((item) => item.outcome === "failed")?.result ||
        entry.cases.find((item) => item.outcome === "failed")?.attempt ||
        "",
      latestValidatedFix:
        entry.cases.find((item) => item.outcome === "validated")?.finalFix ||
        entry.cases.find((item) => item.outcome === "validated")?.attempt ||
        "",
    }));

  const summary = sortedEntries.reduce(
    (acc, entry) => {
      acc.entries += 1;
      if (Number(entry.aggregateCounts.validated || 0) > 0) acc.validatedEntries += 1;
      if (Number(entry.aggregateCounts.failed || 0) > 0) acc.failedEntries += 1;
      if (Number(entry.aggregateCounts.partial || 0) > 0) acc.partialEntries += 1;
      if (Number(entry.promotionCount || 0) > 0) acc.promotedEntries += 1;
      return acc;
    },
    { entries: 0, validatedEntries: 0, failedEntries: 0, partialEntries: 0, promotedEntries: 0 },
  );

  return {
    updatedAt: store.updatedAt || normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt),
    contextKey: buildRunContextKey(report),
    storePath: "",
    summary,
    entries,
  };
}

export function resolveLearningForIssue(store, issueLike) {
  const code = normalizeText(issueLike?.code).toUpperCase();
  const curated = getIssueLearning(code);
  const entryKey = buildEntryKey(issueLike);
  const exact = store?.entries?.[entryKey] ?? null;
  const fallbackEntries = exact
    ? [exact]
    : Object.values(store?.entries ?? {})
        .filter((item) => item.issueCode === code)
        .sort((left, right) => {
          const routeMatchLeft = normalizeText(left.route) === normalizeText(issueLike?.route || issueLike?.affectedRoutes?.[0] || "/") ? 1 : 0;
          const routeMatchRight = normalizeText(right.route) === normalizeText(issueLike?.route || issueLike?.affectedRoutes?.[0] || "/") ? 1 : 0;
          if (routeMatchRight !== routeMatchLeft) return routeMatchRight - routeMatchLeft;
          const validatedDiff = Number(right.aggregateCounts.validated || 0) - Number(left.aggregateCounts.validated || 0);
          if (validatedDiff !== 0) return validatedDiff;
          return String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
        });
  const runtime = exact || fallbackEntries[0] || null;

  const curatedCases = Array.isArray(curated?.cases) ? curated.cases.map((item, index) => normalizeCase(item, index)) : [];
  const runtimeCases = Array.isArray(runtime?.cases) ? runtime.cases.map((item, index) => normalizeCase(item, index)) : [];
  const combinedCases = dedupeCases([...runtimeCases, ...curatedCases]);
  const curatedCounts = summarizeCases(curatedCases);
  const runtimeCounts = {
    validated: Number(runtime?.aggregateCounts?.validated || 0),
    failed: Number(runtime?.aggregateCounts?.failed || 0),
    partial: Number(runtime?.aggregateCounts?.partial || 0),
  };
  const learningCounts = mergeCounts(curatedCounts, runtimeCounts);

  const finalSolution =
    normalizeText(curated?.finalSolution) ||
    (normalizeText(runtime?.finalResolution) &&
    ["high", "medium", "curated"].includes(normalizeText(runtime?.resolutionConfidence).toLowerCase())
      ? normalizeText(runtime.finalResolution)
      : "");
  const possibleSolution =
    normalizeText(runtime?.possibleResolution) ||
    normalizeText(curated?.possibleSolution);
  const learningSource = [normalizeText(curated?.source), normalizeText(runtime?.learningSource)]
    .filter(Boolean)
    .join(" | ");
  const resolutionConfidence = normalizeText(curated?.finalSolution)
    ? "curated"
    : normalizeText(runtime?.resolutionConfidence);
  const promotionSource = normalizeText(runtime?.promotionSource);
  const promotionCount = Number(runtime?.promotionCount || 0);
  const lastValidatedAt = normalizeText(runtime?.lastValidatedAt);

  let learningStatus = "";
  if (normalizeText(curated?.finalSolution) || (finalSolution && learningCounts.validated > 0)) {
    learningStatus = "validated";
  } else if (learningCounts.partial > 0 && learningCounts.validated === 0) {
    learningStatus = "partial";
  } else if (learningCounts.failed > 0 && learningCounts.validated === 0) {
    learningStatus = "failed";
  }

  return {
    source: learningSource,
    possibleSolution,
    finalSolution,
    cases: combinedCases,
    learningCounts,
    learningStatus,
    resolutionConfidence,
    promotionSource,
    promotionCount,
    lastValidatedAt,
    avoidPattern:
      combinedCases.find((item) => item.outcome === "failed")?.result ||
      combinedCases.find((item) => item.outcome === "failed")?.attempt ||
      "",
  };
}

export function ingestCompletedRun(storeInput, report) {
  const store = storeInput && typeof storeInput === "object" ? storeInput : { entries: {}, lastRunByContext: {}, processedRuns: [] };
  const timestamp = normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt || new Date().toISOString());
  const runId = buildRunId(report);
  if (Array.isArray(store.processedRuns) && store.processedRuns.includes(runId)) {
    return {
      store,
      snapshot: buildRuntimeSnapshot(store, report),
    };
  }

  const observations = [
    ...(Array.isArray(report?.issues) ? report.issues.map((issue) => toObservation(issue, report)) : []),
    ...(Array.isArray(report?.seo?.issues) ? report.seo.issues.map((issue) => toObservation(issue, report)) : []),
  ].filter((item) => item.entryKey && item.issueCode);

  for (const observation of observations) {
    ensureEntry(store, observation, timestamp);
  }

  const contextKey = buildRunContextKey(report);
  const previousRun = store.lastRunByContext?.[contextKey] ?? null;
  const currentByKey = new Map(observations.map((item) => [item.entryKey, item]));

  if (previousRun?.observations?.length) {
    for (const previousObservation of previousRun.observations) {
      const entry = ensureEntry(store, previousObservation, timestamp);
      const currentObservation = currentByKey.get(previousObservation.entryKey) ?? null;
      const outcome = compareObservation(previousObservation, currentObservation);
      const attemptedResolution =
        normalizeText(previousObservation.finalResolution) ||
        normalizeText(previousObservation.possibleResolution) ||
        normalizeText(previousObservation.recommendedResolution);
      const caseRecord = {
        outcome,
        title: buildRuntimeCaseTitle(previousObservation, outcome),
        symptom: previousObservation.detail,
        attempt: attemptedResolution,
        result: buildRuntimeCaseResult(previousObservation, currentObservation, outcome),
        finalFix: outcome === "validated" ? attemptedResolution : "",
        source: "Runtime memory from completed revalidation.",
        route: previousObservation.route,
        action: previousObservation.action,
        baseUrl: previousObservation.baseUrl,
        timestamp,
        revalidated: true,
        zeroedIssue: currentObservation === null,
      };
      registerCase(entry, caseRecord);
      entry.contexts = dedupeContexts([
        ...entry.contexts,
        {
          route: previousObservation.route,
          action: previousObservation.action,
          baseUrl: previousObservation.baseUrl,
          auditScope: previousObservation.auditScope,
          viewportLabel: previousObservation.viewportLabel,
          detail: currentObservation?.detail || previousObservation.detail,
          lastResult: outcome,
          lastSeenAt: timestamp,
        },
      ]);
      maybePromoteResolution(entry, previousObservation, caseRecord);
    }
  }

  store.lastRunByContext[contextKey] = {
    contextKey,
    runId,
    baseUrl: normalizeText(report?.meta?.baseUrl),
    auditScope: normalizeText(report?.meta?.auditScope || report?.summary?.auditScope),
    viewportLabel: normalizeText(report?.meta?.viewportLabel || report?.meta?.viewport),
    finishedAt: timestamp,
    observations: observations.map((item) => ({
      id: item.id,
      entryKey: item.entryKey,
      issueCode: item.issueCode,
      title: item.title,
      category: item.category,
      severity: item.severity,
      route: item.route,
      action: item.action,
      detail: item.detail,
      possibleResolution: item.possibleResolution,
      finalResolution: item.finalResolution,
      recommendedResolution: item.recommendedResolution,
      learningSource: item.learningSource,
    })),
  };
  store.processedRuns = [...(store.processedRuns || []).filter((item) => item !== runId), runId].slice(-120);
  store.updatedAt = timestamp;

  return {
    store,
    snapshot: buildRuntimeSnapshot(store, report),
  };
}

export function attachLearningSnapshot(store, report, storePath = "") {
  const snapshot = buildRuntimeSnapshot(store, report);
  snapshot.storePath = storePath;
  return snapshot;
}
