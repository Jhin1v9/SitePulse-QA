import fs from "node:fs/promises";
import path from "node:path";

const STORE_VERSION = 1;
const MAX_ATTEMPTS = 240;

function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
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

function normalizeOutcome(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (["pending", "validated", "failed", "partial"].includes(normalized)) {
    return normalized;
  }
  return "pending";
}

function normalizeAttemptStatus(value) {
  const normalized = normalizeText(value).toLowerCase();
  if (["prepared", "revalidation_requested", "resolved"].includes(normalized)) {
    return normalized;
  }
  return "prepared";
}

function createEmptyHealingStore() {
  return {
    version: STORE_VERSION,
    updatedAt: "",
    attempts: [],
  };
}

function normalizeAttempt(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `healing-attempt-${index + 1}`),
    contextKey: normalizeText(item.contextKey),
    runId: normalizeText(item.runId),
    issueKey: normalizeText(item.issueKey),
    issueCode: normalizeText(item.issueCode),
    title: normalizeText(item.title),
    route: normalizeText(item.route || "/"),
    action: normalizeText(item.action),
    category: normalizeText(item.category),
    severity: normalizeText(item.severity || "low"),
    baseUrl: normalizeText(item.baseUrl),
    auditScope: normalizeText(item.auditScope),
    viewportLabel: normalizeText(item.viewportLabel),
    eligibility: normalizeEligibility(item.eligibility),
    healingMode: normalizeHealingMode(item.healingMode),
    confidenceScore: Number.isFinite(Number(item.confidenceScore)) ? Number(item.confidenceScore) : 0,
    confidenceLevel: normalizeText(item.confidenceLevel || "low"),
    confidenceReason: normalizeText(item.confidenceReason),
    strategyId: normalizeText(item.strategyId),
    strategySource: normalizeText(item.strategySource),
    strategySummary: normalizeText(item.strategySummary),
    suggestedNextStep: normalizeText(item.suggestedNextStep),
    requiresConfirmation: item.requiresConfirmation === true,
    promptReady: item.promptReady === true,
    directActionAvailable: item.directActionAvailable === true,
    recommendedResolution: normalizeText(item.recommendedResolution),
    possibleResolution: normalizeText(item.possibleResolution),
    finalResolution: normalizeText(item.finalResolution),
    attemptedResolution: normalizeText(item.attemptedResolution),
    avoidText: normalizeText(item.avoidText),
    promptText: normalizeText(item.promptText),
    replayCommand: normalizeText(item.replayCommand),
    baselineIssueKey: normalizeText(item.baselineIssueKey),
    baselineSeverity: normalizeText(item.baselineSeverity),
    baselineTotalIssues: Number.isFinite(Number(item.baselineTotalIssues)) ? Number(item.baselineTotalIssues) : 0,
    baselineIssueKeys: Array.isArray(item.baselineIssueKeys) ? item.baselineIssueKeys.map((entry) => normalizeText(entry)).filter(Boolean).slice(0, 200) : [],
    origin: normalizeText(item.origin || "self_healing_engine"),
    note: normalizeText(item.note),
    actor: normalizeText(item.actor || "desktop-operator"),
    status: normalizeAttemptStatus(item.status),
    outcome: normalizeOutcome(item.outcome),
    outcomeSummary: normalizeText(item.outcomeSummary),
    collateralRegressionCount: Number.isFinite(Number(item.collateralRegressionCount)) ? Number(item.collateralRegressionCount) : 0,
    createdAt: normalizeText(item.createdAt),
    updatedAt: normalizeText(item.updatedAt),
    revalidatedAt: normalizeText(item.revalidatedAt),
    revalidationRunId: normalizeText(item.revalidationRunId),
    lastSeenAt: normalizeText(item.lastSeenAt),
  };
}

function normalizeHealingStore(raw) {
  if (!raw || typeof raw !== "object") {
    return createEmptyHealingStore();
  }
  return {
    version: STORE_VERSION,
    updatedAt: normalizeText(raw.updatedAt),
    attempts: Array.isArray(raw.attempts)
      ? raw.attempts
          .map((entry, index) => normalizeAttempt(entry, index))
          .filter((entry) => entry.issueCode && entry.contextKey)
          .slice(-MAX_ATTEMPTS)
      : [],
  };
}

export function resolveHealingStorePath(reportDir) {
  const absoluteReportDir = path.resolve(reportDir || process.cwd());
  const memoryDir = path.join(path.dirname(absoluteReportDir), "operational-memory");
  return path.join(memoryDir, "healing-store.json");
}

export async function loadHealingStore(reportDir) {
  const storePath = resolveHealingStorePath(reportDir);
  try {
    const raw = await fs.readFile(storePath, "utf8");
    return {
      storePath,
      store: normalizeHealingStore(JSON.parse(raw)),
    };
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : "";
    if (code === "ENOENT") {
      return {
        storePath,
        store: createEmptyHealingStore(),
      };
    }
    throw error;
  }
}

export async function saveHealingStore(reportDir, store) {
  const storePath = resolveHealingStorePath(reportDir);
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  const normalized = normalizeHealingStore({
    ...store,
    updatedAt: new Date().toISOString(),
  });
  await fs.writeFile(storePath, JSON.stringify(normalized, null, 2), "utf8");
  return storePath;
}

export function createEmptyHealingMemory() {
  return createEmptyHealingStore();
}
