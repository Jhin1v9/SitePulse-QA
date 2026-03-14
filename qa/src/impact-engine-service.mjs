function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value) {
  return Math.round(clamp(value, 0, 0.99) * 100) / 100;
}

function categoryFromCode(code) {
  const normalized = normalizeText(code).toUpperCase();
  if (normalized.startsWith("SEO_")) return "seo";
  if (normalized.startsWith("VISUAL_")) return "visual";
  if (normalized.includes("HTTP")) return "http";
  if (normalized.includes("NET")) return "network";
  if (normalized.includes("JS_RUNTIME") || normalized.includes("CONSOLE")) return "runtime";
  if (normalized.includes("ROUTE_LOAD")) return "runtime";
  if (normalized.includes("BTN")) return "interaction";
  if (normalized.includes("LANGUAGE")) return "content";
  return "general";
}

function severityBase(severity) {
  if (severity === "high") return 0.44;
  if (severity === "medium") return 0.26;
  return 0.12;
}

function categoryBase(category) {
  switch (category) {
    case "runtime":
      return 0.22;
    case "http":
      return 0.2;
    case "network":
      return 0.18;
    case "interaction":
      return 0.16;
    case "seo":
      return 0.15;
    case "visual":
      return 0.14;
    case "content":
      return 0.1;
    default:
      return 0.08;
  }
}

function routeCriticality(issue) {
  const route = normalizeText(issue?.route || "/").toLowerCase();
  const action = normalizeText(issue?.action);
  let score = 0;
  if (!route || route === "/") score += 0.09;
  if (/(pricing|checkout|cart|contact|login|signup|product|servicios|service)/.test(route)) score += 0.07;
  if (action) score += 0.04;
  return clamp(score, 0, 0.12);
}

function evidenceWeight(issue) {
  const evidenceCount = Array.isArray(issue?.evidence) ? issue.evidence.length : 0;
  return clamp(evidenceCount * 0.02, 0, 0.08);
}

function recurrenceWeight(issue) {
  const counts = issue?.learningCounts && typeof issue.learningCounts === "object" ? issue.learningCounts : {};
  const recurrence = Number(counts.validated || 0) + Number(counts.failed || 0) + Number(counts.partial || 0);
  return {
    recurrence,
    weight: clamp(recurrence * 0.02, 0, 0.12),
  };
}

function unresolvedWeight(issue) {
  if (normalizeText(issue?.finalResolution)) return 0;
  if (normalizeText(issue?.possibleResolution)) return 0.03;
  return 0.06;
}

function failedHistoryWeight(issue) {
  const failed = Number(issue?.learningCounts?.failed || 0);
  return {
    failed,
    weight: clamp(failed * 0.025, 0, 0.08),
  };
}

function resolveImpactCategory(issue, category) {
  const code = normalizeText(issue?.code).toUpperCase();
  if (code.startsWith("SEO_")) return "search visibility";
  if (code.includes("BTN")) return "conversion path";
  if (code.includes("JS_RUNTIME") || code.includes("CONSOLE") || code.includes("ROUTE_LOAD")) return "release stability";
  if (code.includes("HTTP") || code.includes("NET")) return "availability";
  if (code.startsWith("VISUAL_")) return "experience quality";
  if (code.includes("LANGUAGE")) return "content consistency";
  return category === "general" ? "operational hygiene" : category;
}

function resolveRiskType(issue) {
  const code = normalizeText(issue?.code).toUpperCase();
  if (code === "SEO_CANONICAL_MISSING") return "SEO fragmentation";
  if (code === "SEO_LANG_MISSING") return "International targeting mismatch";
  if (code.startsWith("SEO_")) return "Search visibility erosion";
  if (code.includes("ROUTE_LOAD") || code.includes("HTTP_5XX") || code.includes("NET_REQUEST_FAILED")) return "Release stability failure";
  if (code.includes("JS_RUNTIME") || code.includes("CONSOLE")) return "Runtime stability regression";
  if (code.includes("BTN")) return "Conversion flow interruption";
  if (code.startsWith("VISUAL_")) return "UX trust degradation";
  if (code.includes("LANGUAGE")) return "Content consistency drift";
  return "Operational quality risk";
}

function resolveConfidence(issue, score, recurrence, failed, evidence) {
  let points = 0;
  if (normalizeText(issue?.detail)) points += 1;
  if (evidence > 0) points += 1;
  if (recurrence > 0) points += 1;
  if (normalizeText(issue?.riskType || resolveRiskType(issue))) points += 1;
  if (score >= 0.72) points += 1;
  if (failed > 0) points += 1;
  if (points >= 6) return "high";
  if (points >= 5) return "medium-high";
  if (points >= 3) return "medium";
  return "low";
}

function resolvePriority(issue, score) {
  const category = categoryFromCode(issue?.code);
  const route = normalizeText(issue?.route || "/").toLowerCase();
  if (
    score >= 0.9
    || (
      issue?.severity === "high"
      && ["runtime", "http", "network"].includes(category)
      && (!route || route === "/" || /(pricing|checkout|contact|login)/.test(route))
    )
  ) {
    return "P0";
  }
  if (score >= 0.72) return "P1";
  if (score >= 0.52) return "P2";
  if (score >= 0.32) return "P3";
  return "P4";
}

function buildImpactRationale(issue, meta) {
  const lines = [
    `${capitalize(issue.severity || "low")} severity contributed ${meta.severityContribution.toFixed(2)} to the impact score.`,
    `${capitalize(meta.category)} risk profile contributed ${meta.categoryContribution.toFixed(2)}.`,
  ];
  if (meta.routeContribution > 0) {
    lines.push(`Route/action criticality added ${meta.routeContribution.toFixed(2)} because this finding affects ${normalizeText(issue.route || "/")}${normalizeText(issue.action) ? ` -> ${normalizeText(issue.action)}` : ""}.`);
  }
  if (meta.evidenceContribution > 0) {
    lines.push(`Captured evidence added ${meta.evidenceContribution.toFixed(2)}.`);
  }
  if (meta.recurrence > 0) {
    lines.push(`Operational memory shows this pattern ${meta.recurrence} time(s), adding ${meta.recurrenceContribution.toFixed(2)}.`);
  }
  if (meta.failedAttempts > 0) {
    lines.push(`There are ${meta.failedAttempts} failed attempt(s) on record, which raises delivery risk by ${meta.failedContribution.toFixed(2)}.`);
  }
  if (meta.unresolvedContribution > 0) {
    lines.push(`No locked final resolution exists yet, which adds ${meta.unresolvedContribution.toFixed(2)} to urgency.`);
  }
  return lines;
}

function capitalize(value) {
  const text = normalizeText(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function computeIssueImpact(issue) {
  const category = categoryFromCode(issue?.code);
  const severityContribution = severityBase(issue?.severity);
  const categoryContribution = categoryBase(category);
  const routeContribution = routeCriticality(issue);
  const evidenceContribution = evidenceWeight(issue);
  const recurrenceMeta = recurrenceWeight(issue);
  const failedMeta = failedHistoryWeight(issue);
  const unresolvedContribution = unresolvedWeight(issue);
  const score = roundScore(
    severityContribution
    + categoryContribution
    + routeContribution
    + evidenceContribution
    + recurrenceMeta.weight
    + failedMeta.weight
    + unresolvedContribution,
  );
  const priorityLevel = resolvePriority(issue, score);
  const riskType = resolveRiskType(issue);
  const impactCategory = resolveImpactCategory(issue, category);
  const confidence = resolveConfidence(issue, score, recurrenceMeta.recurrence, failedMeta.failed, evidenceContribution);
  const meta = {
    category,
    severityContribution,
    categoryContribution,
    routeContribution,
    evidenceContribution,
    recurrence: recurrenceMeta.recurrence,
    recurrenceContribution: recurrenceMeta.weight,
    failedAttempts: failedMeta.failed,
    failedContribution: failedMeta.weight,
    unresolvedContribution,
  };
  return {
    impactScore: score,
    impactCategory,
    priorityLevel,
    riskType,
    confidence,
    recurringCount: recurrenceMeta.recurrence,
    rationale: buildImpactRationale(issue, meta),
  };
}

function buildContextKey(report) {
  return [
    normalizeText(report?.meta?.baseUrl),
    normalizeText(report?.meta?.auditScope || report?.summary?.auditScope),
    normalizeText(report?.meta?.viewportLabel || report?.meta?.viewport),
  ].join("|");
}

function issueLabel(issue) {
  return `${issue.code} on ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}`;
}

function getSortableImpact(issue) {
  return Number(issue?.impact?.impactScore || 0);
}

function getPriorityRank(priorityLevel) {
  switch (priorityLevel) {
    case "P0":
      return 0;
    case "P1":
      return 1;
    case "P2":
      return 2;
    case "P3":
      return 3;
    default:
      return 4;
  }
}

function buildPatternSnapshot(report) {
  const entries = Array.isArray(report?.learningMemory?.entries) ? report.learningMemory.entries : [];
  const currentCodes = new Set((report?.issues || []).map((issue) => normalizeText(issue.code).toUpperCase()));
  const relevant = entries.filter((entry) => currentCodes.has(normalizeText(entry.issueCode).toUpperCase()));
  const patterns = [];

  relevant
    .filter((entry) => Number(entry.learningCounts?.validated || 0) > 0 && normalizeText(entry.finalResolution))
    .sort((left, right) => Number(right.learningCounts?.validated || 0) - Number(left.learningCounts?.validated || 0))
    .slice(0, 2)
    .forEach((entry) => {
      patterns.push({
        type: "validated_fix",
        label: `${entry.issueCode} has ${entry.learningCounts.validated} validated fix cycle(s).`,
        count: Number(entry.learningCounts.validated || 0),
        detail: normalizeText(entry.finalResolution || entry.latestValidatedFix),
      });
    });

  relevant
    .filter((entry) => Number(entry.learningCounts?.failed || 0) > 0)
    .sort((left, right) => Number(right.learningCounts?.failed || 0) - Number(left.learningCounts?.failed || 0))
    .slice(0, 2)
    .forEach((entry) => {
      patterns.push({
        type: "failed_pattern",
        label: `${entry.issueCode} has ${entry.learningCounts.failed} failed correction attempt(s).`,
        count: Number(entry.learningCounts.failed || 0),
        detail: normalizeText(entry.avoidText || entry.lastManualOverrideNote || entry.possibleResolution),
      });
    });

  const recurring = (report?.issues || [])
    .filter((issue) => Number(issue?.impact?.recurringCount || 0) >= 2)
    .sort((left, right) => Number(right.impact?.recurringCount || 0) - Number(left.impact?.recurringCount || 0))
    .slice(0, 2);
  for (const issue of recurring) {
    patterns.push({
      type: "recurring_issue",
      label: `${issue.code} is recurring in operational memory.`,
      count: Number(issue.impact?.recurringCount || 0),
      detail: normalizeText(issue.route || "/"),
    });
  }

  return patterns.slice(0, 6);
}

function buildExecutiveSummary(sortedIssues, report) {
  if (!sortedIssues.length) {
    return {
      headline: "Current run is clean. Keep this as the next regression baseline.",
      topRisks: [],
      topOpportunities: ["Pin this run as baseline and monitor future drift against it."],
      criticalFixes: [],
      recommendedActionOrder: [
        "Preserve the clean run as baseline.",
        "Use the replay command after the next structural change.",
      ],
    };
  }

  const topRisks = sortedIssues
    .slice(0, 3)
    .map((issue) => `${issue.impact.priorityLevel} ${issueLabel(issue)} | ${issue.impact.riskType} | impact ${issue.impact.impactScore.toFixed(2)}`);

  const topOpportunities = sortedIssues
    .filter((issue) => normalizeText(issue.finalResolution) || issue.selfHealing?.promptReady === true)
    .slice(0, 3)
    .map((issue) => `${issueLabel(issue)} | ${normalizeText(issue.finalResolution) ? "validated resolution available" : "healing prompt ready"} | ${issue.impact.priorityLevel}`);

  const criticalFixes = sortedIssues
    .filter((issue) => ["P0", "P1"].includes(issue.impact.priorityLevel))
    .slice(0, 4)
    .map((issue) => `${issueLabel(issue)} | ${issue.recommendedResolution}`);

  const recommendedActionOrder = sortedIssues.slice(0, 4).map((issue, index) => {
    const lead = normalizeText(issue.finalResolution || issue.possibleResolution || issue.recommendedResolution);
    return `${index + 1}. ${issue.impact.priorityLevel} ${issue.code} | ${issue.impact.riskType} | ${lead}`;
  });

  return {
    headline: `${sortedIssues.filter((issue) => ["P0", "P1"].includes(issue.impact.priorityLevel)).length} high-pressure issue(s) need attention first. Highest impact risk: ${sortedIssues[0].impact.riskType}.`,
    topRisks,
    topOpportunities,
    criticalFixes,
    recommendedActionOrder,
  };
}

export function createEmptyImpactSnapshot() {
  return {
    updatedAt: "",
    contextKey: "",
    summary: {
      p0: 0,
      p1: 0,
      p2: 0,
      p3: 0,
      p4: 0,
      highImpactIssues: 0,
      recurringPatterns: 0,
      validatedPatterns: 0,
      failedPatterns: 0,
      averageImpactScore: 0,
    },
    topIssues: [],
    patterns: [],
    executiveSummary: {
      headline: "",
      topRisks: [],
      topOpportunities: [],
      criticalFixes: [],
      recommendedActionOrder: [],
    },
  };
}

export function attachImpactAnalysis(report) {
  const snapshot = createEmptyImpactSnapshot();
  if (!report || !Array.isArray(report.issues)) {
    return snapshot;
  }

  report.issues = report.issues.map((issue) => ({
    ...issue,
    impact: computeIssueImpact(issue),
  }));

  const sortedIssues = [...report.issues].sort((left, right) => {
    const byPriority = getPriorityRank(left.impact?.priorityLevel) - getPriorityRank(right.impact?.priorityLevel);
    if (byPriority !== 0) return byPriority;
    return getSortableImpact(right) - getSortableImpact(left);
  });

  const patterns = buildPatternSnapshot(report);
  const executiveSummary = buildExecutiveSummary(sortedIssues, report);
  const counts = {
    p0: sortedIssues.filter((issue) => issue.impact?.priorityLevel === "P0").length,
    p1: sortedIssues.filter((issue) => issue.impact?.priorityLevel === "P1").length,
    p2: sortedIssues.filter((issue) => issue.impact?.priorityLevel === "P2").length,
    p3: sortedIssues.filter((issue) => issue.impact?.priorityLevel === "P3").length,
    p4: sortedIssues.filter((issue) => issue.impact?.priorityLevel === "P4").length,
  };
  const averageImpactScore = sortedIssues.length
    ? Math.round((sortedIssues.reduce((sum, issue) => sum + Number(issue.impact?.impactScore || 0), 0) / sortedIssues.length) * 100) / 100
    : 0;

  snapshot.updatedAt = normalizeText(report?.meta?.finishedAt || report?.meta?.startedAt);
  snapshot.contextKey = buildContextKey(report);
  snapshot.summary = {
    ...counts,
    highImpactIssues: sortedIssues.filter((issue) => Number(issue.impact?.impactScore || 0) >= 0.72).length,
    recurringPatterns: patterns.filter((item) => item.type === "recurring_issue").length,
    validatedPatterns: patterns.filter((item) => item.type === "validated_fix").length,
    failedPatterns: patterns.filter((item) => item.type === "failed_pattern").length,
    averageImpactScore,
  };
  snapshot.topIssues = sortedIssues.slice(0, 10).map((issue) => ({
    code: issue.code,
    route: issue.route,
    action: issue.action,
    severity: issue.severity,
    detail: issue.detail,
    impactScore: issue.impact.impactScore,
    impactCategory: issue.impact.impactCategory,
    priorityLevel: issue.impact.priorityLevel,
    riskType: issue.impact.riskType,
    confidence: issue.impact.confidence,
  }));
  snapshot.patterns = patterns;
  snapshot.executiveSummary = executiveSummary;
  return snapshot;
}
