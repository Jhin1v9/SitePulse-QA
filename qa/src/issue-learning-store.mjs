import fs from "node:fs/promises";
import path from "node:path";

const STORE_VERSION = 1;

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function createEmptyLearningStore() {
  return {
    version: STORE_VERSION,
    updatedAt: "",
    processedRuns: [],
    entries: {},
    lastRunByContext: {},
  };
}

function normalizeCase(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `case-${index + 1}`),
    outcome: String(item.outcome || ""),
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

function normalizeContext(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `context-${index + 1}`),
    route: normalizeText(item.route || "/"),
    action: normalizeText(item.action),
    baseUrl: normalizeText(item.baseUrl),
    auditScope: normalizeText(item.auditScope),
    viewportLabel: normalizeText(item.viewportLabel),
    detail: normalizeText(item.detail),
    lastResult: normalizeText(item.lastResult),
    lastSeenAt: normalizeText(item.lastSeenAt),
  };
}

function normalizeEntry(input, key) {
  const item = input && typeof input === "object" ? input : {};
  return {
    key: String(item.key || key),
    issueCode: normalizeText(item.issueCode),
    title: normalizeText(item.title),
    category: normalizeText(item.category),
    severity: normalizeText(item.severity || "low"),
    route: normalizeText(item.route || "/"),
    action: normalizeText(item.action),
    possibleResolution: normalizeText(item.possibleResolution),
    finalResolution: normalizeText(item.finalResolution),
    recommendedResolution: normalizeText(item.recommendedResolution),
    learningSource: normalizeText(item.learningSource),
    resolutionConfidence: normalizeText(item.resolutionConfidence),
    finalResolutionOrigin: normalizeText(item.finalResolutionOrigin),
    promotionSource: normalizeText(item.promotionSource),
    promotionCount: Number.isFinite(Number(item.promotionCount)) ? Number(item.promotionCount) : 0,
    lastValidatedAt: normalizeText(item.lastValidatedAt),
    manualOverrideCount: Number.isFinite(Number(item.manualOverrideCount)) ? Number(item.manualOverrideCount) : 0,
    lastManualOverrideAt: normalizeText(item.lastManualOverrideAt),
    lastManualOverrideBy: normalizeText(item.lastManualOverrideBy),
    lastManualOverrideNote: normalizeText(item.lastManualOverrideNote),
    firstSeenAt: normalizeText(item.firstSeenAt),
    lastSeenAt: normalizeText(item.lastSeenAt),
    aggregateCounts: {
      seen: Number.isFinite(Number(item.aggregateCounts?.seen)) ? Number(item.aggregateCounts.seen) : 0,
      validated: Number.isFinite(Number(item.aggregateCounts?.validated)) ? Number(item.aggregateCounts.validated) : 0,
      failed: Number.isFinite(Number(item.aggregateCounts?.failed)) ? Number(item.aggregateCounts.failed) : 0,
      partial: Number.isFinite(Number(item.aggregateCounts?.partial)) ? Number(item.aggregateCounts.partial) : 0,
      revalidated: Number.isFinite(Number(item.aggregateCounts?.revalidated)) ? Number(item.aggregateCounts.revalidated) : 0,
      zeroed: Number.isFinite(Number(item.aggregateCounts?.zeroed)) ? Number(item.aggregateCounts.zeroed) : 0,
    },
    contexts: Array.isArray(item.contexts) ? item.contexts.map(normalizeContext).filter((entry) => entry.route) : [],
    cases: Array.isArray(item.cases) ? item.cases.map(normalizeCase).filter((entry) => entry.title) : [],
    manualOverrides: Array.isArray(item.manualOverrides)
      ? item.manualOverrides
          .map((override, index) => ({
            id: String(override?.id || `override-${index + 1}`),
            type: normalizeText(override?.type || "manual_override"),
            finalResolution: normalizeText(override?.finalResolution),
            note: normalizeText(override?.note),
            actor: normalizeText(override?.actor),
            source: normalizeText(override?.source || "manual override"),
            timestamp: normalizeText(override?.timestamp),
          }))
          .filter((entry) => entry.finalResolution)
      : [],
  };
}

function normalizeRunObservation(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `observation-${index + 1}`),
    entryKey: normalizeText(item.entryKey),
    issueCode: normalizeText(item.issueCode),
    title: normalizeText(item.title),
    category: normalizeText(item.category),
    severity: normalizeText(item.severity || "low"),
    route: normalizeText(item.route || "/"),
    action: normalizeText(item.action),
    detail: normalizeText(item.detail),
    possibleResolution: normalizeText(item.possibleResolution),
    finalResolution: normalizeText(item.finalResolution),
    recommendedResolution: normalizeText(item.recommendedResolution),
    learningSource: normalizeText(item.learningSource),
  };
}

function normalizeRunContext(input, key) {
  const item = input && typeof input === "object" ? input : {};
  return {
    contextKey: normalizeText(item.contextKey || key),
    runId: normalizeText(item.runId),
    baseUrl: normalizeText(item.baseUrl),
    auditScope: normalizeText(item.auditScope),
    viewportLabel: normalizeText(item.viewportLabel),
    finishedAt: normalizeText(item.finishedAt),
    observations: Array.isArray(item.observations)
      ? item.observations.map(normalizeRunObservation).filter((entry) => entry.entryKey)
      : [],
  };
}

function normalizeLearningStore(raw) {
  if (!raw || typeof raw !== "object") {
    return createEmptyLearningStore();
  }

  const store = createEmptyLearningStore();
  store.version = STORE_VERSION;
  store.updatedAt = normalizeText(raw.updatedAt);
  store.processedRuns = Array.isArray(raw.processedRuns)
    ? raw.processedRuns.map((item) => normalizeText(item)).filter(Boolean).slice(-120)
    : [];

  if (raw.entries && typeof raw.entries === "object") {
    for (const [key, value] of Object.entries(raw.entries)) {
      const normalized = normalizeEntry(value, key);
      if (normalized.key) {
        store.entries[normalized.key] = normalized;
      }
    }
  }

  if (raw.lastRunByContext && typeof raw.lastRunByContext === "object") {
    for (const [key, value] of Object.entries(raw.lastRunByContext)) {
      const normalized = normalizeRunContext(value, key);
      if (normalized.contextKey) {
        store.lastRunByContext[normalized.contextKey] = normalized;
      }
    }
  }

  return store;
}

export function resolveIssueLearningStorePath(reportDir) {
  const absoluteReportDir = path.resolve(reportDir || process.cwd());
  const memoryDir = path.join(path.dirname(absoluteReportDir), "operational-memory");
  return path.join(memoryDir, "issue-learning-store.json");
}

export async function loadIssueLearningStore(reportDir) {
  const storePath = resolveIssueLearningStorePath(reportDir);
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return {
      storePath,
      store: normalizeLearningStore(JSON.parse(raw)),
    };
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : "";
    if (code === "ENOENT") {
      return {
        storePath,
        store: createEmptyLearningStore(),
      };
    }
    throw error;
  }
}

export async function saveIssueLearningStore(reportDir, store) {
  const storePath = resolveIssueLearningStorePath(reportDir);
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const normalized = normalizeLearningStore({
    ...store,
    updatedAt: new Date().toISOString(),
  });
  await fs.writeFile(storePath, JSON.stringify(normalized, null, 2), "utf8");
  return storePath;
}

export function createEmptyOperationalMemory() {
  return createEmptyLearningStore();
}
