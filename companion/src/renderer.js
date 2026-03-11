const STORAGE_KEYS = {
  lastReport: "sitepulse-studio:last-report-v1",
  lastProfile: "sitepulse-studio:last-profile-v1",
  runHistory: "sitepulse-studio:run-history-v1",
  onboarding: "sitepulse-studio:onboarding-v1",
  baseline: "sitepulse-studio:baseline-v1",
};

const ISSUE_GROUP = {
  ROUTE_LOAD_FAIL: "Route load failure",
  BTN_CLICK_ERROR: "Action failed",
  BTN_NO_EFFECT: "No visible effect",
  HTTP_4XX: "Client request failure",
  HTTP_5XX: "Server request failure",
  NET_REQUEST_FAILED: "Network failure",
  JS_RUNTIME_ERROR: "Runtime JavaScript failure",
  CONSOLE_ERROR: "Console error",
  VISUAL_SECTION_ORDER_INVALID: "Visual order mismatch",
  VISUAL_SECTION_MISSING: "Missing section",
  VISUAL_LAYOUT_OVERFLOW: "Layout overflow",
  VISUAL_LAYER_OVERLAP: "Layer overlap",
  VISUAL_ALIGNMENT_DRIFT: "Alignment drift",
  VISUAL_TIGHT_SPACING: "Tight spacing",
  VISUAL_GAP_INCONSISTENCY: "Gap inconsistency",
  VISUAL_EDGE_HUGGING: "Edge hugging",
  VISUAL_WIDTH_INCONSISTENCY: "Width inconsistency",
  VISUAL_BOUNDARY_COLLISION: "Boundary collision",
  VISUAL_FOLD_PRESSURE: "Fold pressure",
};

const DEFAULT_TARGET = "https://example.com";

const VIEW_META = {
  overview: {
    eyebrow: "mission control",
    title: "Overview",
    description: "Configure the target, define execution depth and prepare the run before moving into live operations.",
  },
  preview: {
    eyebrow: "operator preview",
    title: "Preview",
    description: "Inspect the current target in an embedded surface. When headed mode is enabled, SitePulse keeps this workspace aligned with the route currently being exercised.",
  },
  operations: {
    eyebrow: "live operations",
    title: "Operations",
    description: "Follow the engine while it runs: progress, live protocol, stage evidence and runtime logs stay in one operational surface.",
  },
  findings: {
    eyebrow: "fix sequence",
    title: "Findings",
    description: "Triaging, visual quality, route coverage and action intent live here so the operator can work the queue without dashboard clutter.",
  },
  seo: {
    eyebrow: "search performance",
    title: "SEO",
    description: "Search-focused diagnostics, score deltas and priority recommendations live here as a dedicated workspace.",
  },
  prompts: {
    eyebrow: "operator prompts",
    title: "Prompts",
    description: "Fix prompts, replay commands and reusable digests are separated here so operators can copy exactly what they need.",
  },
  compare: {
    eyebrow: "comparison room",
    title: "Compare",
    description: "Track what improved, what regressed and what is still unresolved against a baseline or the previous run.",
  },
  reports: {
    eyebrow: "evidence room",
    title: "Reports",
    description: "Captured proof, route contact sheets and stored run history stay here as a reusable evidence package.",
  },
  settings: {
    eyebrow: "system controls",
    title: "Settings",
    description: "Runtime paths, engine lifecycle and workstation policy are isolated from the audit workflow.",
  },
};

const stateEl = {
  serviceName: document.getElementById("serviceName"),
  bridgeStatus: document.getElementById("bridgeStatus"),
  auditStatus: document.getElementById("auditStatus"),
  versionText: document.getElementById("versionText"),
  runtimePath: document.getElementById("runtimePath"),
  reportsPath: document.getElementById("reportsPath"),
  bridgeAddress: document.getElementById("bridgeAddress"),
  launchOnLogin: document.getElementById("launchOnLogin"),
  startBridge: document.getElementById("startBridge"),
  stopBridge: document.getElementById("stopBridge"),
  openReports: document.getElementById("openReports"),
  openReportsSecondary: document.getElementById("openReportsSecondary"),
  openLatestEvidence: document.getElementById("openLatestEvidence"),
  loadReportFile: document.getElementById("loadReportFile"),
  exportCurrentReport: document.getElementById("exportCurrentReport"),
  copyBridgeUrl: document.getElementById("copyBridgeUrl"),
  copyBridgeUrlSecondary: document.getElementById("copyBridgeUrlSecondary"),
  quickAuditButton: document.getElementById("quickAuditButton"),
  deepAuditButton: document.getElementById("deepAuditButton"),
  targetUrl: document.getElementById("targetUrl"),
  previewLocation: document.getElementById("previewLocation"),
  previewStatus: document.getElementById("previewStatus"),
  previewModePill: document.getElementById("previewModePill"),
  previewRoutePill: document.getElementById("previewRoutePill"),
  previewActionPill: document.getElementById("previewActionPill"),
  previewChromeUrl: document.getElementById("previewChromeUrl"),
  previewReload: document.getElementById("previewReload"),
  previewOpenExternal: document.getElementById("previewOpenExternal"),
  previewToggleFollow: document.getElementById("previewToggleFollow"),
  previewFallback: document.getElementById("previewFallback"),
  sitePreview: document.getElementById("sitePreview"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  mobileSweepButtons: Array.from(document.querySelectorAll("[data-mobile-sweep]")),
  scopeButtons: Array.from(document.querySelectorAll("[data-scope]")),
  depthButtons: Array.from(document.querySelectorAll("[data-depth]")),
  severityFilterButtons: Array.from(document.querySelectorAll("[data-issue-filter]")),
  menuButtons: Array.from(document.querySelectorAll("[data-menu-action]")),
  navButtons: Array.from(document.querySelectorAll("[data-view]")),
  viewPanels: Array.from(document.querySelectorAll("[data-view-panel]")),
  noServer: document.getElementById("noServer"),
  headed: document.getElementById("headed"),
  elevated: document.getElementById("elevated"),
  runAudit: document.getElementById("runAudit"),
  runCmd: document.getElementById("runCmd"),
  copyReplayCommand: document.getElementById("copyReplayCommand"),
  copyQuickPrompt: document.getElementById("copyQuickPrompt"),
  copyQuickPromptSecondary: document.getElementById("copyQuickPromptSecondary"),
  openCommandPalette: document.getElementById("openCommandPalette"),
  menuFlyout: document.getElementById("menuFlyout"),
  workspaceEyebrow: document.getElementById("workspaceEyebrow"),
  workspaceTitle: document.getElementById("workspaceTitle"),
  workspaceDescription: document.getElementById("workspaceDescription"),
  headlineStatus: document.getElementById("headlineStatus"),
  auditProgressLabel: document.getElementById("auditProgressLabel"),
  auditProgressPercent: document.getElementById("auditProgressPercent"),
  auditProgressCounters: document.getElementById("auditProgressCounters"),
  auditProgressEta: document.getElementById("auditProgressEta"),
  auditProgressFill: document.getElementById("auditProgressFill"),
  auditProgressDetail: document.getElementById("auditProgressDetail"),
  timelineHeadline: document.getElementById("timelineHeadline"),
  timelineList: document.getElementById("timelineList"),
  stageBoard: document.getElementById("stageBoard"),
  findingsHeadline: document.getElementById("findingsHeadline"),
  reportsHeadline: document.getElementById("reportsHeadline"),
  findingsSearch: document.getElementById("findingsSearch"),
  findingsRouteFilter: document.getElementById("findingsRouteFilter"),
  copyIssueDigest: document.getElementById("copyIssueDigest"),
  bridgeChip: document.getElementById("bridgeChip"),
  auditChip: document.getElementById("auditChip"),
  buildChip: document.getElementById("buildChip"),
  routesMetric: document.getElementById("routesMetric"),
  actionsMetric: document.getElementById("actionsMetric"),
  issuesMetric: document.getElementById("issuesMetric"),
  seoMetric: document.getElementById("seoMetric"),
  riskMetric: document.getElementById("riskMetric"),
  routeSignal: document.getElementById("routeSignal"),
  runtimeSignal: document.getElementById("runtimeSignal"),
  networkSignal: document.getElementById("networkSignal"),
  buttonSignal: document.getElementById("buttonSignal"),
  visualSignal: document.getElementById("visualSignal"),
  seoSignal: document.getElementById("seoSignal"),
  visualOverflowCount: document.getElementById("visualOverflowCount"),
  visualOverlapCount: document.getElementById("visualOverlapCount"),
  visualAlignmentCount: document.getElementById("visualAlignmentCount"),
  visualSpacingCount: document.getElementById("visualSpacingCount"),
  visualGapConsistencyCount: document.getElementById("visualGapConsistencyCount"),
  visualEdgeCount: document.getElementById("visualEdgeCount"),
  visualWidthCount: document.getElementById("visualWidthCount"),
  visualBoundaryCount: document.getElementById("visualBoundaryCount"),
  visualFoldCount: document.getElementById("visualFoldCount"),
  visualSectionsCount: document.getElementById("visualSectionsCount"),
  visualQualityHeadline: document.getElementById("visualQualityHeadline"),
  visualQualityDetail: document.getElementById("visualQualityDetail"),
  stepsList: document.getElementById("stepsList"),
  issuesList: document.getElementById("issuesList"),
  issueGroupGrid: document.getElementById("issueGroupGrid"),
  issueMetaPills: document.getElementById("issueMetaPills"),
  currentTarget: document.getElementById("currentTarget"),
  currentMode: document.getElementById("currentMode"),
  currentScope: document.getElementById("currentScope"),
  currentDepth: document.getElementById("currentDepth"),
  currentDuration: document.getElementById("currentDuration"),
  currentCommand: document.getElementById("currentCommand"),
  mobileSweepControls: document.getElementById("mobileSweepControls"),
  mobileSweepHint: document.getElementById("mobileSweepHint"),
  mobileMatrixPanel: document.getElementById("mobileMatrixPanel"),
  mobileMatrixHeadline: document.getElementById("mobileMatrixHeadline"),
  mobileMatrixGrid: document.getElementById("mobileMatrixGrid"),
  compareHeadline: document.getElementById("compareHeadline"),
  compareIssueDelta: document.getElementById("compareIssueDelta"),
  compareSeoDelta: document.getElementById("compareSeoDelta"),
  compareRiskDelta: document.getElementById("compareRiskDelta"),
  compareRouteDelta: document.getElementById("compareRouteDelta"),
  compareActionDelta: document.getElementById("compareActionDelta"),
  compareRegressionDelta: document.getElementById("compareRegressionDelta"),
  comparePersistentDelta: document.getElementById("comparePersistentDelta"),
  compareNewIssuesList: document.getElementById("compareNewIssuesList"),
  compareResolvedIssuesList: document.getElementById("compareResolvedIssuesList"),
  comparePersistentIssuesList: document.getElementById("comparePersistentIssuesList"),
  compareRegressionIssuesList: document.getElementById("compareRegressionIssuesList"),
  seoWorkspaceHeadline: document.getElementById("seoWorkspaceHeadline"),
  seoWorkspaceScore: document.getElementById("seoWorkspaceScore"),
  seoWorkspaceCritical: document.getElementById("seoWorkspaceCritical"),
  seoWorkspaceTotal: document.getElementById("seoWorkspaceTotal"),
  seoWorkspacePages: document.getElementById("seoWorkspacePages"),
  seoWorkspaceDelta: document.getElementById("seoWorkspaceDelta"),
  seoRecommendationsList: document.getElementById("seoRecommendationsList"),
  seoWorkspaceSummary: document.getElementById("seoWorkspaceSummary"),
  copySeoDigest: document.getElementById("copySeoDigest"),
  seoOnlyPreset: document.getElementById("seoOnlyPreset"),
  pinCurrentBaseline: document.getElementById("pinCurrentBaseline"),
  clearBaseline: document.getElementById("clearBaseline"),
  copyCompareDigest: document.getElementById("copyCompareDigest"),
  evidenceHeadline: document.getElementById("evidenceHeadline"),
  evidenceGallery: document.getElementById("evidenceGallery"),
  routeContactHeadline: document.getElementById("routeContactHeadline"),
  routeContactSheet: document.getElementById("routeContactSheet"),
  quickPromptBox: document.getElementById("quickPromptBox"),
  promptWorkspaceHeadline: document.getElementById("promptWorkspaceHeadline"),
  promptWorkspaceFix: document.getElementById("promptWorkspaceFix"),
  promptWorkspaceReplay: document.getElementById("promptWorkspaceReplay"),
  promptWorkspaceIssues: document.getElementById("promptWorkspaceIssues"),
  promptWorkspaceCompare: document.getElementById("promptWorkspaceCompare"),
  promptWorkspaceRoutes: document.getElementById("promptWorkspaceRoutes"),
  promptWorkspaceActions: document.getElementById("promptWorkspaceActions"),
  promptWorkspaceClientPrompt: document.getElementById("promptWorkspaceClientPrompt"),
  promptWorkspaceClientMessage: document.getElementById("promptWorkspaceClientMessage"),
  copyPromptPack: document.getElementById("copyPromptPack"),
  copyQuickPromptPrimary: document.getElementById("copyQuickPromptPrimary"),
  copyReplayCommandPrimary: document.getElementById("copyReplayCommandPrimary"),
  copyReplayCommandSecondary: document.getElementById("copyReplayCommandSecondary"),
  copyIssueDigestPrimary: document.getElementById("copyIssueDigestPrimary"),
  copyCompareDigestPrimary: document.getElementById("copyCompareDigestPrimary"),
  copyRouteDigestPrimary: document.getElementById("copyRouteDigestPrimary"),
  copyActionDigestPrimary: document.getElementById("copyActionDigestPrimary"),
  copyClientOutreachPrompt: document.getElementById("copyClientOutreachPrompt"),
  copyClientOutreachMessage: document.getElementById("copyClientOutreachMessage"),
  historyList: document.getElementById("historyList"),
  clearHistory: document.getElementById("clearHistory"),
  routeList: document.getElementById("routeList"),
  actionList: document.getElementById("actionList"),
  copyRouteDigest: document.getElementById("copyRouteDigest"),
  copyActionDigest: document.getElementById("copyActionDigest"),
  missionBrief: document.getElementById("missionBrief"),
  clearLog: document.getElementById("clearLog"),
  logOutput: document.getElementById("logOutput"),
  openShortcuts: document.getElementById("openShortcuts"),
  winMinimize: document.getElementById("winMinimize"),
  winMaximize: document.getElementById("winMaximize"),
  winClose: document.getElementById("winClose"),
  onboardingOverlay: document.getElementById("onboardingOverlay"),
  dismissOnboarding: document.getElementById("dismissOnboarding"),
  startTourAudit: document.getElementById("startTourAudit"),
  revealOnboarding: document.getElementById("revealOnboarding"),
  shortcutsOverlay: document.getElementById("shortcutsOverlay"),
  dismissShortcuts: document.getElementById("dismissShortcuts"),
  commandPaletteOverlay: document.getElementById("commandPaletteOverlay"),
  dismissCommandPalette: document.getElementById("dismissCommandPalette"),
  commandPaletteSearch: document.getElementById("commandPaletteSearch"),
  commandPaletteList: document.getElementById("commandPaletteList"),
  evidenceLightbox: document.getElementById("evidenceLightbox"),
  dismissEvidenceLightbox: document.getElementById("dismissEvidenceLightbox"),
  evidenceLightboxTitle: document.getElementById("evidenceLightboxTitle"),
  evidenceLightboxImage: document.getElementById("evidenceLightboxImage"),
  evidenceLightboxMeta: document.getElementById("evidenceLightboxMeta"),
  evidenceLightboxDetail: document.getElementById("evidenceLightboxDetail"),
  evidenceReferenceStage: document.getElementById("evidenceReferenceStage"),
  evidenceReferenceImage: document.getElementById("evidenceReferenceImage"),
  evidenceReferenceMeta: document.getElementById("evidenceReferenceMeta"),
  evidenceCompareState: document.getElementById("evidenceCompareState"),
  evidenceOpenImage: document.getElementById("evidenceOpenImage"),
  evidenceRevealImage: document.getElementById("evidenceRevealImage"),
  toastStack: document.getElementById("toastStack"),
};

const uiState = {
  companionState: null,
  report: null,
  liveReport: null,
  liveReportKey: "",
  logs: ["[studio] waiting for engine telemetry"],
  mode: "desktop",
  mobileSweep: "single",
  scope: "full",
  depth: "signal",
  activeView: "overview",
  issueFilter: "all",
  findingsSearch: "",
  findingsRoute: "all",
  history: loadHistory(),
  baseline: loadBaseline(),
  onboardingDismissed: loadOnboardingState(),
  shortcutsOpen: false,
  commandPaletteOpen: false,
  activeMenu: "",
  commandPaletteQuery: "",
  auditRequestInFlight: false,
  activeEvidence: null,
  activeEvidenceReference: null,
  preview: {
    requestedUrl: "",
    loadedUrl: "",
    detail: "Enter a target URL to load the embedded preview surface.",
    mode: "idle",
    followAudit: true,
    available: false,
    timerId: 0,
  },
};

function getVisibleReport() {
  return uiState.liveReport || uiState.report;
}

function buildLiveReportKey(report) {
  if (!report) return "";
  return [
    report.meta.generatedAt,
    report.summary.totalIssues,
    report.summary.routesChecked,
    report.summary.actionsMapped,
    report.summary.seoScore,
    report.issues.length,
    report.actions.length,
    report.routes.length,
  ].join("|");
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatLocalDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return date.toLocaleString();
}

function formatDuration(durationMs) {
  const ms = toNumber(durationMs, 0);
  if (!ms) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  if (minutes < 60) return `${minutes}m ${remain}s`;
  const hours = Math.floor(minutes / 60);
  const minutesRemain = minutes % 60;
  return `${hours}h ${minutesRemain}m`;
}

function toFileSrc(filePath) {
  const value = String(filePath || "").trim();
  if (!value) return "";
  return encodeURI(`file:///${value.replace(/\\/g, "/")}`);
}

function median(values) {
  const list = [...values]
    .map((value) => toNumber(value, 0))
    .filter((value) => value > 0)
    .sort((left, right) => left - right);
  if (!list.length) return 0;
  const middle = Math.floor(list.length / 2);
  if (list.length % 2 === 1) return list[middle];
  return Math.round((list[middle - 1] + list[middle]) / 2);
}

function shortPath(value) {
  const text = String(value || "n/a");
  return text.length > 84 ? `...${text.slice(-81)}` : text;
}

function normalizeScope(value) {
  if (value === "seo" || value === "experience" || value === "full") return value;
  return "full";
}

function normalizeMode(value) {
  return value === "mobile" ? "mobile" : "desktop";
}

function normalizeMobileSweep(value) {
  return value === "family" ? "family" : "single";
}

function normalizeDepth(value) {
  return value === "deep" ? "deep" : "signal";
}

function normalizePreviewUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const seeded = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const parsed = new URL(seeded);
    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function buildPreviewRouteUrl(baseUrl, route) {
  const normalizedBase = normalizePreviewUrl(baseUrl);
  if (!normalizedBase) return "";
  const rawRoute = String(route || "").trim();
  if (!rawRoute) return normalizedBase;
  try {
    return new URL(rawRoute, normalizedBase).toString();
  } catch {
    return normalizedBase;
  }
}

function parseSeverity(value, code = "") {
  if (value === "high" || value === "medium" || value === "low") return value;
  if (["HTTP_5XX", "JS_RUNTIME_ERROR", "VISUAL_SECTION_ORDER_INVALID", "ROUTE_LOAD_FAIL"].includes(code)) return "high";
  if ([
    "HTTP_4XX",
    "BTN_CLICK_ERROR",
    "NET_REQUEST_FAILED",
    "VISUAL_SECTION_MISSING",
    "VISUAL_LAYOUT_OVERFLOW",
    "VISUAL_LAYER_OVERLAP",
    "VISUAL_TIGHT_SPACING",
    "VISUAL_EDGE_HUGGING",
    "VISUAL_BOUNDARY_COLLISION",
  ].includes(code)) {
    return "medium";
  }
  return "low";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function severityRank(severity) {
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function scoreFromIssues(issues) {
  const high = issues.filter((issue) => issue.severity === "high").length;
  const medium = issues.filter((issue) => issue.severity === "medium").length;
  const low = issues.filter((issue) => issue.severity === "low").length;
  return Math.min(100, high * 34 + medium * 14 + low * 6);
}

function countByCode(issues, codeList) {
  return issues.filter((issue) => codeList.includes(issue.code)).length;
}

function setChip(element, text, tone = "default") {
  if (!element) return;
  element.textContent = text;
  element.classList.remove("ok", "warn", "bad");
  if (tone === "ok") element.classList.add("ok");
  if (tone === "warn") element.classList.add("warn");
  if (tone === "bad") element.classList.add("bad");
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function loadHistory() {
  const history = readStorage(STORAGE_KEYS.runHistory, []);
  if (!Array.isArray(history)) return [];
  return history.filter((item) => item && typeof item === "object" && item.report);
}

function persistHistory() {
  writeStorage(STORAGE_KEYS.runHistory, uiState.history.slice(0, 12));
}

function loadBaseline() {
  const baseline = readStorage(STORAGE_KEYS.baseline, null);
  if (!baseline || typeof baseline !== "object" || !baseline.report) return null;
  return baseline;
}

function persistBaseline(snapshot) {
  uiState.baseline = snapshot && snapshot.report ? snapshot : null;
  writeStorage(STORAGE_KEYS.baseline, uiState.baseline);
}

function loadOnboardingState() {
  return readStorage(STORAGE_KEYS.onboarding, false) === true;
}

function persistOnboardingState(value) {
  uiState.onboardingDismissed = value === true;
  writeStorage(STORAGE_KEYS.onboarding, uiState.onboardingDismissed);
}

function toggleShortcutsOverlay(forceOpen = null) {
  uiState.shortcutsOpen = forceOpen === null ? !uiState.shortcutsOpen : forceOpen === true;
  stateEl.shortcutsOverlay.classList.toggle("hidden", !uiState.shortcutsOpen);
  if (uiState.shortcutsOpen) hideMenuFlyout();
}

function toggleCommandPalette(forceOpen = null) {
  uiState.commandPaletteOpen = forceOpen === null ? !uiState.commandPaletteOpen : forceOpen === true;
  stateEl.commandPaletteOverlay.classList.toggle("hidden", !uiState.commandPaletteOpen);
  if (uiState.commandPaletteOpen) {
    window.setTimeout(() => {
      stateEl.commandPaletteSearch.focus();
      stateEl.commandPaletteSearch.select();
    }, 0);
  } else {
    uiState.commandPaletteQuery = "";
    stateEl.commandPaletteSearch.value = "";
  }
  if (uiState.commandPaletteOpen) hideMenuFlyout();
  renderCommandPalette();
}

function showToast(message, tone = "ok") {
  if (!stateEl.toastStack) return;
  const toast = document.createElement("article");
  toast.className = `toast ${tone}`;
  toast.textContent = String(message || "");
  stateEl.toastStack.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, 3600);
}

function closeEvidencePreview() {
  uiState.activeEvidence = null;
  uiState.activeEvidenceReference = null;
  stateEl.evidenceLightbox.classList.add("hidden");
  stateEl.evidenceLightboxImage.removeAttribute("src");
  stateEl.evidenceReferenceImage.removeAttribute("src");
  stateEl.evidenceReferenceStage.classList.add("hidden");
  stateEl.evidenceLightboxTitle.textContent = "Evidence preview";
  stateEl.evidenceLightboxMeta.textContent = "No evidence selected.";
  stateEl.evidenceReferenceMeta.textContent = "No matching baseline evidence.";
  stateEl.evidenceLightboxDetail.textContent = "Open a screenshot from the evidence room or issue board to inspect it here.";
  stateEl.evidenceCompareState.textContent = "Load a screenshot with a matching baseline to compare visual changes here.";
}

function openEvidencePreview(item) {
  if (!item?.path) {
    showToast("This evidence item has no file attached.", "warn");
    return;
  }

  uiState.activeEvidence = item;
  const reference = findReferenceEvidenceItem(item, getVisibleReport());
  uiState.activeEvidenceReference = reference?.item || null;
  stateEl.evidenceLightboxTitle.textContent = item.label || item.issueGroup || item.issueCode || "Evidence preview";
  stateEl.evidenceLightboxMeta.textContent = [
    item.issueRoute || item.route || "/",
    item.issueCode || "",
    item.variant ? `variant=${item.variant}` : "",
    item.severity || "",
  ]
    .filter(Boolean)
    .join(" | ");
  stateEl.evidenceLightboxDetail.textContent =
    item.note ||
    item.detail ||
    "Visual proof attached to the current issue.";
  stateEl.evidenceLightboxImage.src = toFileSrc(item.path);
  stateEl.evidenceLightboxImage.alt = item.label || "Evidence preview";
  if (reference?.item?.path) {
    stateEl.evidenceReferenceMeta.textContent = [
      reference.label,
      reference.item.issueRoute || reference.item.route || "/",
      reference.item.variant ? `variant=${reference.item.variant}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    stateEl.evidenceReferenceImage.src = toFileSrc(reference.item.path);
    stateEl.evidenceReferenceImage.alt = reference.item.label || "Reference evidence preview";
    stateEl.evidenceReferenceStage.classList.remove("hidden");
    stateEl.evidenceCompareState.textContent = `Before/after compare active against ${reference.label}. Use the left frame for the current run and the right frame for the reference run.`;
  } else {
    stateEl.evidenceReferenceImage.removeAttribute("src");
    stateEl.evidenceReferenceMeta.textContent = "No matching baseline evidence.";
    stateEl.evidenceReferenceStage.classList.add("hidden");
    stateEl.evidenceCompareState.textContent = "No matching baseline evidence was found for this visual proof yet.";
  }
  stateEl.evidenceLightbox.classList.remove("hidden");
}

async function syncAuthoritativeState() {
  try {
    const payload = await window.sitePulseCompanion.getState();
    renderCompanionState(payload);
    return payload;
  } catch (error) {
    appendLog(`[studio] authoritative state sync failed: ${error?.message || error}`);
    return null;
  }
}

function deriveGeneratedAt(meta = {}) {
  return meta.generatedAt || meta.finishedAt || meta.startedAt || new Date().toISOString();
}

function normalizeDiagnosis(diagnosis = {}) {
  return {
    title: String(diagnosis.title || ""),
    category: String(diagnosis.category || ""),
    laymanExplanation: String(diagnosis.laymanExplanation || ""),
    technicalExplanation: String(diagnosis.technicalExplanation || ""),
    probableCauses: Array.isArray(diagnosis.probableCauses) ? diagnosis.probableCauses.map((item) => String(item)).filter(Boolean) : [],
    technicalChecks: Array.isArray(diagnosis.technicalChecks) ? diagnosis.technicalChecks.map((item) => String(item)).filter(Boolean) : [],
    recommendedActions: Array.isArray(diagnosis.recommendedActions) ? diagnosis.recommendedActions.map((item) => String(item)).filter(Boolean) : [],
    commandHints: Array.isArray(diagnosis.commandHints) ? diagnosis.commandHints.map((item) => String(item)).filter(Boolean) : [],
    likelyAreas: Array.isArray(diagnosis.likelyAreas) ? diagnosis.likelyAreas.map((item) => String(item)).filter(Boolean) : [],
  };
}

function normalizeEvidenceItem(item = {}) {
  return {
    type: String(item.type || "evidence"),
    path: String(item.path || ""),
    label: String(item.label || ""),
    route: String(item.route || "/"),
    code: String(item.code || ""),
    variant: String(item.variant || ""),
    note: String(item.note || ""),
  };
}

function normalizeMobileSweepMeta(input) {
  if (!input || typeof input !== "object") return null;
  const profiles = Array.isArray(input.profiles)
    ? input.profiles.map((item, index) => ({
        id: String(item?.id || `profile-${index + 1}`),
        label: String(item?.label || `Profile ${index + 1}`),
        viewport: String(item?.viewport || ""),
        width: toNumber(item?.width, 0),
        height: toNumber(item?.height, 0),
        status: String(item?.status || "ok"),
        routesChecked: toNumber(item?.routesChecked, 0),
        actionsMapped: toNumber(item?.actionsMapped, 0),
        totalIssues: toNumber(item?.totalIssues, 0),
        seoScore: toNumber(item?.seoScore, 0),
        error: String(item?.error || ""),
      }))
    : [];
  return {
    id: normalizeMobileSweep(input.id),
    label: String(input.label || "Mobile sweep"),
    profiles,
  };
}

function normalizeIssue(item, index) {
  const issue = item && typeof item === "object" ? item : {};
  const code = String(issue.code || "UNKNOWN");
  return {
    id: String(issue.id || `issue-${index + 1}`),
    code,
    severity: parseSeverity(issue.severity, code),
    route: String(issue.route || "/"),
    action: String(issue.action || ""),
    detail: String(issue.detail || "No detail provided."),
    recommendedResolution: String(issue.recommendedResolution || "Review the root cause and validate with a fresh run."),
    group: ISSUE_GROUP[code] || "Other issue",
    viewportLabel: String(issue.viewportLabel || ""),
    viewport: String(issue.viewport || ""),
    assistantHint: issue.assistantHint && typeof issue.assistantHint === "object" ? issue.assistantHint : {},
    diagnosis: normalizeDiagnosis(issue.diagnosis && typeof issue.diagnosis === "object" ? issue.diagnosis : {}),
    evidence: Array.isArray(issue.evidence) ? issue.evidence.map(normalizeEvidenceItem).filter((item) => item.path) : [],
  };
}

function normalizeAction(item, index) {
  const action = item && typeof item === "object" ? item : {};
  return {
    id: String(action.id || `action-${index + 1}`),
    route: String(action.route || "/"),
    label: String(action.label || "Unnamed action"),
    kind: String(action.kind || ""),
    href: String(action.href || ""),
    expectedFunction: String(action.expectedFunction || ""),
    expectedTechnical: String(action.expectedTechnical || ""),
    expectedForUser: String(action.expectedForUser || ""),
    status: String(action.status || ""),
    statusLabel: String(action.statusLabel || ""),
    actualFunction: String(action.actualFunction || ""),
    detail: String(action.detail || ""),
    area: String(action.area || ""),
    viewportLabel: String(action.viewportLabel || ""),
    viewport: String(action.viewport || ""),
    signals: Array.isArray(action.signals) ? action.signals.map((signal) => String(signal)) : [],
  };
}

function normalizeRoute(item, index) {
  const route = item && typeof item === "object" ? item : {};
  return {
    id: String(route.route || `route-${index + 1}`),
    route: String(route.route || "/"),
    loadOk: route.loadOk !== false,
    buttonsDiscovered: toNumber(route.buttonsDiscovered, 0),
    buttonsClicked: toNumber(route.buttonsClicked, 0),
    viewportLabel: String(route.viewportLabel || ""),
    viewport: String(route.viewport || ""),
  };
}

function summarizeAssistantGuide(guide = {}) {
  return {
    status: String(guide.status || ""),
    issueCount: toNumber(guide.issueCount, 0),
    immediateSteps: Array.isArray(guide.immediateSteps) ? guide.immediateSteps.map((item) => String(item)).filter(Boolean) : [],
    replayCommand: String(guide.replayCommand || ""),
    quickStartPrompt: String(guide.quickStartPrompt || ""),
    routePriority: Array.isArray(guide.routePriority) ? guide.routePriority.map((item) => ({
      route: String(item.route || "/"),
      totalIssues: toNumber(item.totalIssues, 0),
      high: toNumber(item.high, 0),
      medium: toNumber(item.medium, 0),
      low: toNumber(item.low, 0),
    })) : [],
  };
}

function normalizeReport(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const meta = source.meta && typeof source.meta === "object" ? source.meta : {};
  const summary = source.summary && typeof source.summary === "object" ? source.summary : {};
  const seo = source.seo && typeof source.seo === "object" ? source.seo : {};
  const issues = Array.isArray(source.issues) ? source.issues.map(normalizeIssue) : [];
  const actions = Array.isArray(source.actionSweep) ? source.actionSweep.slice(0, 160).map(normalizeAction) : [];
  const routes = Array.isArray(source.routeSweep) ? source.routeSweep.slice(0, 120).map(normalizeRoute) : [];
  const assistantGuide = summarizeAssistantGuide(source.assistantGuide && typeof source.assistantGuide === "object" ? source.assistantGuide : {});
  const generatedAt = deriveGeneratedAt(meta);
  const startedAt = String(meta.startedAt || "");
  const finishedAt = String(meta.finishedAt || generatedAt);
  const durationMs = startedAt && finishedAt ? Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime()) : 0;

  return {
    meta: {
      baseUrl: String(meta.baseUrl || DEFAULT_TARGET),
      generatedAt,
      startedAt,
      finishedAt,
      replayCommand: String(meta.replayCommand || assistantGuide.replayCommand || ""),
      auditMode: normalizeMode(meta.auditMode || meta.mode || "desktop"),
      auditDepth: normalizeDepth(meta.auditDepth || (meta.fullAudit === true ? "deep" : "signal")),
      viewport: String(meta.viewport || ""),
      viewportLabel: String(meta.viewportLabel || ""),
      mobileSweep: normalizeMobileSweepMeta(meta.mobileSweep),
    },
    summary: {
      auditScope: normalizeScope(summary.auditScope || meta.auditScope || "full"),
      routesChecked: toNumber(summary.routesChecked, routes.length),
      buttonsChecked: toNumber(summary.buttonsChecked, actions.length),
      totalIssues: toNumber(summary.totalIssues, issues.length),
      actionsMapped: toNumber(summary.actionsMapped, actions.length || summary.buttonsChecked),
      visualSectionOrderInvalid: toNumber(summary.visualSectionOrderInvalid, countByCode(issues, ["VISUAL_SECTION_ORDER_INVALID"])),
      visualSectionMissing: toNumber(summary.visualSectionMissing, countByCode(issues, ["VISUAL_SECTION_MISSING"])),
      visualLayoutOverflow: toNumber(summary.visualLayoutOverflow, countByCode(issues, ["VISUAL_LAYOUT_OVERFLOW"])),
      visualLayerOverlap: toNumber(summary.visualLayerOverlap, countByCode(issues, ["VISUAL_LAYER_OVERLAP"])),
      visualAlignmentDrift: toNumber(summary.visualAlignmentDrift, countByCode(issues, ["VISUAL_ALIGNMENT_DRIFT"])),
      visualTightSpacing: toNumber(summary.visualTightSpacing, countByCode(issues, ["VISUAL_TIGHT_SPACING"])),
      visualGapInconsistency: toNumber(summary.visualGapInconsistency, countByCode(issues, ["VISUAL_GAP_INCONSISTENCY"])),
      visualEdgeHugging: toNumber(summary.visualEdgeHugging, countByCode(issues, ["VISUAL_EDGE_HUGGING"])),
      visualWidthInconsistency: toNumber(summary.visualWidthInconsistency, countByCode(issues, ["VISUAL_WIDTH_INCONSISTENCY"])),
      visualBoundaryCollision: toNumber(summary.visualBoundaryCollision, countByCode(issues, ["VISUAL_BOUNDARY_COLLISION"])),
      visualFoldPressure: toNumber(summary.visualFoldPressure, countByCode(issues, ["VISUAL_FOLD_PRESSURE"])),
      visualQualityIssues: toNumber(
        summary.visualQualityIssues,
        countByCode(issues, [
          "VISUAL_SECTION_ORDER_INVALID",
          "VISUAL_SECTION_MISSING",
          "VISUAL_LAYOUT_OVERFLOW",
          "VISUAL_LAYER_OVERLAP",
          "VISUAL_ALIGNMENT_DRIFT",
          "VISUAL_TIGHT_SPACING",
          "VISUAL_GAP_INCONSISTENCY",
          "VISUAL_EDGE_HUGGING",
          "VISUAL_WIDTH_INCONSISTENCY",
          "VISUAL_BOUNDARY_COLLISION",
          "VISUAL_FOLD_PRESSURE",
        ]),
      ),
      buttonsNoEffect: toNumber(summary.buttonsNoEffect, 0),
      consoleErrors: toNumber(summary.consoleErrors, 0),
      seoScore: toNumber(summary.seoScore, seo.overallScore),
      seoCriticalIssues: toNumber(summary.seoCriticalIssues, 0),
      seoTotalIssues: toNumber(summary.seoTotalIssues, 0),
      seoPagesAnalyzed: toNumber(summary.seoPagesAnalyzed, seo.pagesAnalyzed),
      mobileProfilesAnalyzed: toNumber(summary.mobileProfilesAnalyzed, meta.mobileSweep?.profiles?.length || 0),
      durationMs,
    },
    assistantGuide,
    seo: {
      overallScore: toNumber(seo.overallScore, 0),
      topRecommendations: Array.isArray(seo.topRecommendations) ? seo.topRecommendations.map((item) => String(item)).filter(Boolean) : [],
    },
    issues: issues.sort((left, right) => severityRank(right.severity) - severityRank(left.severity)),
    actions,
    routes,
  };
}

function createReportSnapshot(report) {
  return {
    report,
    stamp: report.meta.generatedAt,
    baseUrl: report.meta.baseUrl,
    issueCount: report.summary.totalIssues,
    seoScore: report.summary.seoScore,
    mode: report.meta.auditMode || "desktop",
    mobileSweep: report.meta.mobileSweep?.id || "",
    scope: report.summary.auditScope,
    depth: report.meta.auditDepth || "signal",
    durationMs: report.summary.durationMs || 0,
    risk: scoreFromIssues(report.issues),
    topIssue: report.issues[0]
      ? {
          code: report.issues[0].code,
          severity: report.issues[0].severity,
          viewportLabel: report.issues[0].viewportLabel || "",
          route: report.issues[0].route,
          action: report.issues[0].action,
          detail: report.issues[0].detail,
        }
      : null,
  };
}

function persistProfile() {
  writeStorage(STORAGE_KEYS.lastProfile, {
    targetUrl: stateEl.targetUrl.value.trim(),
    mode: uiState.mode,
    mobileSweep: uiState.mobileSweep,
    scope: uiState.scope,
    depth: uiState.depth,
    noServer: stateEl.noServer.checked,
    headed: stateEl.headed.checked,
    elevated: stateEl.elevated.checked,
  });
}

function restoreProfile() {
  const payload = readStorage(STORAGE_KEYS.lastProfile, null);
  if (!payload) {
    stateEl.targetUrl.value = DEFAULT_TARGET;
    return;
  }

  stateEl.targetUrl.value = String(payload.targetUrl || DEFAULT_TARGET);
  uiState.mode = normalizeMode(payload.mode);
  uiState.mobileSweep = normalizeMobileSweep(payload.mobileSweep);
  uiState.scope = normalizeScope(payload.scope);
  uiState.depth = normalizeDepth(payload.depth);
  stateEl.noServer.checked = payload.noServer !== false;
  stateEl.headed.checked = payload.headed === true;
  stateEl.elevated.checked = payload.elevated === true;
}

function persistLastReport(report) {
  writeStorage(STORAGE_KEYS.lastReport, createCompactStoredReport(report));
}

function restoreLastReport() {
  const report = readStorage(STORAGE_KEYS.lastReport, null);
  if (!report || typeof report !== "object") return null;
  if (Array.isArray(report.actions) && Array.isArray(report.routes) && report.meta && report.summary) {
    return report;
  }
  return normalizeReport(report);
}

function currentDepthLabel(depth = uiState.depth) {
  return normalizeDepth(depth) === "deep" ? "deep crawl" : "signal sweep";
}

function currentScopeLabel(scope = uiState.scope) {
  const normalized = normalizeScope(scope);
  if (normalized === "seo") return "SEO only";
  if (normalized === "experience") return "UX only";
  return "Full stack";
}

function auditStatusLabel(status = "idle") {
  if (status === "running") return "running";
  if (status === "issues") return "issues detected";
  if (status === "clean") return "clean run";
  if (status === "failed") return "failed";
  return "idle";
}

function updateSegmentButtons(buttons, fieldName, activeValue) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[fieldName] === activeValue);
  });
}

function renderWorkspaceHeader(viewName) {
  const meta = VIEW_META[viewName] || VIEW_META.overview;
  if (stateEl.workspaceEyebrow) stateEl.workspaceEyebrow.textContent = meta.eyebrow;
  if (stateEl.workspaceTitle) stateEl.workspaceTitle.textContent = meta.title;
  if (stateEl.workspaceDescription) stateEl.workspaceDescription.textContent = meta.description;
}

function getMenuItems(menuName) {
  const visibleReport = getVisibleReport();
  return {
    file: [
      { id: "file-load", label: "Load Report File", hint: "Ctrl+O", action: () => loadReportFromFile() },
      { id: "file-export", label: "Export Current Report", hint: "Ctrl+S", action: () => exportCurrentReport() },
      { id: "file-vault", label: "Open Report Vault", hint: "", action: () => openReportsVault() },
    ],
    run: [
      { id: "run-native", label: "Run Native Audit", hint: "Ctrl+Enter", action: () => handleAuditRun() },
      { id: "run-quick", label: "Run Quick Audit", hint: "", action: () => handleAuditRun("signal") },
      { id: "run-deep", label: "Run Deep Audit", hint: "Ctrl+Shift+Enter", action: () => handleAuditRun("deep") },
      { id: "run-cmd", label: "Open Full CMD Flow", hint: "Ctrl+Shift+C", action: () => openCmdWindow() },
    ],
    inspect: [
      { id: "inspect-preview", label: "Open Preview", hint: "Ctrl+9", action: () => switchView("preview") },
      { id: "inspect-operations", label: "Open Operations", hint: "Ctrl+2", action: () => switchView("operations") },
      { id: "inspect-findings", label: "Open Findings", hint: "Ctrl+3", action: () => switchView("findings") },
      { id: "inspect-seo", label: "Open SEO", hint: "Ctrl+4", action: () => switchView("seo") },
      { id: "inspect-prompts", label: "Open Prompts", hint: "Ctrl+5", action: () => switchView("prompts") },
      { id: "inspect-compare", label: "Open Compare", hint: "Ctrl+6", action: () => switchView("compare") },
      { id: "inspect-reports", label: "Open Reports", hint: "Ctrl+7", action: () => switchView("reports") },
    ],
    reports: [
      { id: "reports-evidence", label: "Open Latest Evidence", hint: "", action: () => openLatestEvidence() },
      { id: "reports-baseline", label: "Pin Current As Baseline", hint: "", action: () => pinCurrentReportAsBaseline() },
      { id: "reports-compare", label: "Copy Comparison Digest", hint: "", action: () => copyText(buildCompareDigest(visibleReport), "[studio] comparison digest copied.") },
    ],
    tools: [
      { id: "tools-settings", label: "Open Settings", hint: "Ctrl+8", action: () => switchView("settings") },
      { id: "tools-start", label: "Start Engine", hint: "", action: () => startEngine() },
      { id: "tools-stop", label: "Stop Engine", hint: "", action: () => stopEngine() },
      { id: "tools-bridge", label: "Copy Bridge URL", hint: "", action: () => copyBridgeUrl() },
    ],
    help: [
      { id: "help-onboarding", label: "Show Onboarding", hint: "", action: () => revealOnboarding() },
      { id: "help-shortcuts", label: "Show Shortcuts", hint: "?", action: () => toggleShortcutsOverlay(true) },
      { id: "help-palette", label: "Open Command Palette", hint: "Ctrl+K", action: () => toggleCommandPalette(true) },
    ],
  }[menuName] || [];
}

function hideMenuFlyout() {
  uiState.activeMenu = "";
  if (!stateEl.menuFlyout) return;
  stateEl.menuFlyout.classList.add("hidden");
  stateEl.menuFlyout.innerHTML = "";
  stateEl.menuButtons.forEach((button) => button.classList.remove("active"));
}

function showMenuFlyout(menuName, anchor) {
  if (!stateEl.menuFlyout || !(anchor instanceof HTMLElement)) return;
  const items = getMenuItems(menuName);
  if (!items.length) {
    hideMenuFlyout();
    return;
  }

  uiState.activeMenu = menuName;
  stateEl.menuButtons.forEach((button) => button.classList.toggle("active", button.dataset.menuAction === menuName));
  stateEl.menuFlyout.innerHTML = items
    .map((item) => `
      <button class="menu-item" type="button" data-menu-item="${escapeHtml(item.id)}">
        <span>${escapeHtml(item.label)}</span>
        ${item.hint ? `<code>${escapeHtml(item.hint)}</code>` : ""}
      </button>
    `)
    .join("");
  stateEl.menuFlyout.classList.remove("hidden");
  const rect = anchor.getBoundingClientRect();
  stateEl.menuFlyout.style.left = `${Math.round(rect.left)}px`;
  stateEl.menuFlyout.style.top = `${Math.round(rect.bottom + 8)}px`;
}

async function executeMenuAction(menuName, itemId) {
  const item = getMenuItems(menuName).find((entry) => entry.id === itemId);
  hideMenuFlyout();
  if (!item) return;
  await item.action();
}

function switchView(viewName) {
  const nextView = VIEW_META[viewName] ? viewName : "overview";
  uiState.activeView = nextView;
  hideMenuFlyout();
  stateEl.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === nextView);
  });
  stateEl.viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === nextView);
  });
  renderWorkspaceHeader(nextView);
  const workspaceBody = document.querySelector(".workspace-body");
  if (workspaceBody instanceof HTMLElement) {
    workspaceBody.scrollTop = 0;
  }
  if (nextView === "preview") {
    queuePreviewSync("view_switch");
  }
}

function previewSurfaceSupportsEmbedding() {
  return !!(stateEl.sitePreview && typeof stateEl.sitePreview.loadURL === "function");
}

function currentPreviewBaseUrl() {
  const auditBaseUrl = String(uiState.companionState?.audit?.baseUrl || "").trim();
  return normalizePreviewUrl(auditBaseUrl || stateEl.targetUrl.value);
}

function resolvePreviewTargetUrl(audit = uiState.companionState?.audit || {}) {
  const baseUrl = currentPreviewBaseUrl();
  if (!baseUrl) return "";
  const liveRouteSyncActive = uiState.preview.followAudit === true
    && audit.running === true
    && (stateEl.headed.checked === true || uiState.activeView === "preview");
  if (!liveRouteSyncActive) {
    return baseUrl;
  }

  const candidates = [
    audit?.progress?.currentRoute,
    audit?.timeline?.find((entry) => typeof entry?.route === "string" && entry.route.trim())?.route,
    audit?.stageBoard?.find((entry) => typeof entry?.route === "string" && entry.route.trim())?.route,
  ];
  const route = candidates.find((value) => typeof value === "string" && value.trim()) || "";
  return buildPreviewRouteUrl(baseUrl, route);
}

function setPreviewSurfaceUrl(url, options = {}) {
  const force = options.force === true;
  const nextUrl = String(url || "").trim() || "about:blank";
  if (!force && uiState.preview.requestedUrl === nextUrl) return;

  uiState.preview.requestedUrl = nextUrl;
  const surface = stateEl.sitePreview;
  if (surface) {
    try {
      surface.src = nextUrl;
    } catch {
      surface.setAttribute("src", nextUrl);
    }
    if (previewSurfaceSupportsEmbedding() && typeof surface.loadURL === "function") {
      try {
        surface.loadURL(nextUrl);
      } catch {
        surface.setAttribute("src", nextUrl);
      }
    }
  }
  if (!uiState.preview.loadedUrl || force) {
    uiState.preview.loadedUrl = nextUrl;
  }
}

function renderPreviewWorkspace(audit = uiState.companionState?.audit || {}) {
  const baseUrl = currentPreviewBaseUrl();
  const previewUrl = uiState.preview.loadedUrl || uiState.preview.requestedUrl || baseUrl || "about:blank";
  const currentRoute = String(audit?.progress?.currentRoute || "").trim();
  const currentAction = String(audit?.progress?.currentAction || "").trim();
  const headed = stateEl.headed.checked;
  const liveRouteSyncActive = uiState.preview.followAudit === true
    && audit.running === true
    && (headed === true || uiState.activeView === "preview");
  const canEmbed = previewSurfaceSupportsEmbedding();

  uiState.preview.available = canEmbed;
  const modeLabel = liveRouteSyncActive
    ? (headed ? "Live headed sync" : "Live route sync")
    : uiState.preview.followAudit === true
      ? (headed ? "Headed preview armed" : "Passive preview")
      : "Manual preview";

  let status = "Enter a target URL to load the embedded preview surface.";
  if (!baseUrl) {
    status = "A valid target URL is required before SitePulse can build a preview.";
  } else if (!canEmbed) {
    status = "Embedded preview is only active inside the packaged desktop runtime. This environment shows a placeholder.";
  } else if (liveRouteSyncActive) {
    status = currentRoute
      ? `Preview is following ${currentRoute} while the engine works.`
      : "Preview is aligned with the current audit run and waiting for the first routed checkpoint.";
  } else if (headed) {
    status = "Headed mode is armed. When the run starts, SitePulse will switch here and keep the preview aligned with the active route.";
  } else {
    status = "Preview is loaded from the target URL so you can inspect the surface before or after a run.";
  }

  uiState.preview.mode = modeLabel;
  uiState.preview.detail = status;
  stateEl.previewStatus.textContent = status;
  stateEl.previewModePill.textContent = modeLabel;
  stateEl.previewModePill.classList.toggle("ok", audit.running !== true);
  stateEl.previewModePill.classList.toggle("warn", audit.running === true);
  stateEl.previewRoutePill.textContent = currentRoute ? `Route ${currentRoute}` : "Route n/a";
  stateEl.previewActionPill.textContent = currentAction ? `Action ${currentAction}` : "Action n/a";
  stateEl.previewLocation.value = previewUrl === "about:blank" ? "" : previewUrl;
  stateEl.previewChromeUrl.textContent = previewUrl;
  stateEl.previewToggleFollow.textContent = uiState.preview.followAudit ? "Live route sync on" : "Live route sync off";
  stateEl.previewToggleFollow.classList.toggle("preview-toggle-active", uiState.preview.followAudit);
  stateEl.previewFallback.classList.toggle("hidden", canEmbed);
  stateEl.sitePreview.classList.toggle("hidden", !canEmbed);
}

function queuePreviewSync(reason = "profile") {
  if (uiState.preview.timerId) {
    window.clearTimeout(uiState.preview.timerId);
  }

  uiState.preview.timerId = window.setTimeout(() => {
    uiState.preview.timerId = 0;
    const nextUrl = resolvePreviewTargetUrl();
    if (!nextUrl) {
      uiState.preview.requestedUrl = "";
      uiState.preview.loadedUrl = "about:blank";
      renderPreviewWorkspace();
      return;
    }
    setPreviewSurfaceUrl(nextUrl, { force: reason === "reload" });
    renderPreviewWorkspace();
  }, reason === "route" ? 140 : 320);
}

function bindPreviewSurface() {
  const surface = stateEl.sitePreview;
  if (!surface) return;

  const syncLoadedUrl = (fallbackUrl = "") => {
    const resolved = typeof surface.getURL === "function" ? surface.getURL() : String(fallbackUrl || surface.getAttribute("src") || "");
    uiState.preview.loadedUrl = String(resolved || uiState.preview.requestedUrl || "about:blank");
    renderPreviewWorkspace();
  };

  surface.addEventListener("did-start-loading", () => {
    uiState.preview.detail = "Loading embedded preview surface.";
    renderPreviewWorkspace();
  });
  surface.addEventListener("dom-ready", () => {
    syncLoadedUrl();
  });
  surface.addEventListener("did-stop-loading", () => {
    syncLoadedUrl();
  });
  surface.addEventListener("did-navigate", (event) => {
    syncLoadedUrl(event?.url);
  });
  surface.addEventListener("did-navigate-in-page", (event) => {
    syncLoadedUrl(event?.url);
  });
  surface.addEventListener("did-fail-load", (event) => {
    if (Number(event?.errorCode) === -3) return;
    uiState.preview.detail = `Preview load failed: ${String(event?.errorDescription || "unknown error")}`;
    renderPreviewWorkspace();
  });
}

function renderOnboarding() {
  stateEl.onboardingOverlay.classList.toggle("hidden", uiState.onboardingDismissed);
}

function revealOnboarding() {
  persistOnboardingState(false);
  renderOnboarding();
}

function renderLogs() {
  stateEl.logOutput.textContent = uiState.logs.join("\n");
}

function appendLog(line) {
  uiState.logs = [line, ...uiState.logs].slice(0, 500);
  renderLogs();
}

function replaceLogs(lines) {
  uiState.logs = Array.isArray(lines) && lines.length ? [...lines] : ["[studio] waiting for engine telemetry"];
  renderLogs();
}

function collectRunInput(forceFullAudit = null) {
  persistProfile();
  return {
    baseUrl: stateEl.targetUrl.value.trim(),
    mode: uiState.mode,
    mobileSweep: uiState.mode === "mobile" ? uiState.mobileSweep : "single",
    scope: uiState.scope,
    noServer: stateEl.noServer.checked,
    headed: stateEl.headed.checked,
    fullAudit: forceFullAudit === null ? uiState.depth === "deep" : forceFullAudit,
    elevated: stateEl.elevated.checked,
  };
}

function estimateRunDurationMs(profile = {}) {
  const history = Array.isArray(uiState.history) ? uiState.history : [];
  const matching = history.filter((item) => {
    if (!item?.report?.summary?.durationMs) return false;
    if (profile.baseUrl && item.baseUrl !== profile.baseUrl) return false;
    if (profile.mode && item.mode !== profile.mode) return false;
    if (profile.scope && item.scope !== profile.scope) return false;
    if (profile.depth && item.depth !== profile.depth) return false;
    return true;
  });

  const preferred = matching.length
    ? matching
    : history.filter((item) => {
        if (!item?.report?.summary?.durationMs) return false;
        if (profile.mode && item.mode !== profile.mode) return false;
        if (profile.scope && item.scope !== profile.scope) return false;
        if (profile.depth && item.depth !== profile.depth) return false;
        return true;
      });

  return median(preferred.slice(0, 6).map((item) => item.durationMs || item.report?.summary?.durationMs || 0));
}

function createCompactStoredReport(report, limits = {}) {
  const issueLimit = toNumber(limits.issueLimit, 180);
  const actionLimit = toNumber(limits.actionLimit, 120);
  const routeLimit = toNumber(limits.routeLimit, 80);
  return {
    meta: report.meta,
    summary: report.summary,
    assistantGuide: report.assistantGuide,
    seo: report.seo,
    issues: report.issues.slice(0, issueLimit),
    actions: report.actions.slice(0, actionLimit),
    routes: report.routes.slice(0, routeLimit),
  };
}

function buildIssueDigest(report) {
  if (!report || !report.issues.length) {
    return "No issues are currently loaded in SitePulse Studio.";
  }

  return report.issues
    .slice(0, 12)
    .map(
      (issue, index) =>
        `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.code}${issue.viewportLabel ? ` | ${issue.viewportLabel}` : ""} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""} | ${issue.detail}`,
    )
    .join("\n");
}

function buildRouteDigest(report) {
  if (!report || !report.routes.length) {
    return "No route coverage is currently loaded in SitePulse Studio.";
  }

  return report.routes
    .slice(0, 20)
    .map(
      (route, index) =>
        `${index + 1}. ${route.viewportLabel ? `[${route.viewportLabel}] ` : ""}${route.route} | load=${route.loadOk ? "ok" : "failed"} | discovered=${route.buttonsDiscovered} | clicked=${route.buttonsClicked}`,
    )
    .join("\n");
}

function buildActionDigest(report) {
  if (!report || !report.actions.length) {
    return "No action coverage is currently loaded in SitePulse Studio.";
  }

  return report.actions
    .slice(0, 20)
    .map(
      (action, index) =>
        `${index + 1}. ${action.viewportLabel ? `[${action.viewportLabel}] ` : ""}${action.route} | ${action.label} | expected=${action.expectedForUser || action.expectedFunction || "n/a"} | actual=${action.actualFunction || action.detail || action.statusLabel || "n/a"}`,
    )
    .join("\n");
}

function buildSeoDigest(report) {
  if (!report) {
    return "No SEO report is currently loaded in SitePulse Studio.";
  }

  const lines = [
    `Target: ${report.meta.baseUrl}`,
    `SEO score: ${report.summary.seoScore}`,
    `SEO critical issues: ${report.summary.seoCriticalIssues || 0}`,
    `SEO issues total: ${report.summary.seoTotalIssues || 0}`,
    `Pages analyzed: ${report.summary.seoPagesAnalyzed || report.seo?.pagesAnalyzed || 0}`,
  ];

  const recommendations = Array.isArray(report.seo?.topRecommendations) ? report.seo.topRecommendations.filter(Boolean) : [];
  if (recommendations.length) {
    lines.push("Top recommendations:");
    recommendations.slice(0, 8).forEach((item, index) => {
      lines.push(`${index + 1}. ${item}`);
    });
  }

  return lines.join("\n");
}

function buildClientOutreachPrompt(report) {
  if (!report) {
    return "Run an audit to generate a client outreach prompt.";
  }

  const topIssues = report.issues.slice(0, 4);
  const seoAvailable = (report.summary.seoPagesAnalyzed || 0) > 0 || (report.summary.seoTotalIssues || 0) > 0;
  const lines = [
    "Act as a senior website consultant who can sell technical work clearly and credibly.",
    "Write a short outreach message in English for the site owner after reviewing their website.",
    "The message must sound human, confident and specific, not generic or spammy.",
    "",
    "Objectives:",
    "- explain the most relevant problems found on the site",
    "- connect each problem to business impact, trust, conversions and user experience",
    ...(seoAvailable ? ["- explain how unresolved technical and SEO issues can weaken indexing, crawl quality and Google visibility"] : []),
    "- make the value of fixing the site obvious",
    "- end with a clear invitation to discuss the fixes",
    "",
    "Constraints:",
    "- use plain English",
    "- no buzzwords or fake urgency",
    "- mention only concrete findings from the audit",
    "- keep it concise but persuasive",
    "",
    `Target site: ${report.meta.baseUrl}`,
    `Total issues: ${report.summary.totalIssues}`,
    `Risk score: ${scoreFromIssues(report.issues)}/100`,
    `Routes checked: ${report.summary.routesChecked}`,
    `Actions mapped: ${report.summary.actionsMapped}`,
    ...(seoAvailable
      ? [
          `SEO score: ${report.summary.seoScore}`,
          `SEO critical issues: ${report.summary.seoCriticalIssues || 0}`,
          `SEO total issues: ${report.summary.seoTotalIssues || 0}`,
        ]
      : []),
    "",
    "Top findings:",
    ...(topIssues.length
      ? topIssues.map((issue, index) => `${index + 1}. ${issue.group} | route=${issue.route}${issue.action ? ` | action=${issue.action}` : ""} | detail=${issue.detail}`)
      : ["1. No issue details were attached to this run."]),
  ];

  return lines.join("\n");
}

function buildClientOutreachMessage(report) {
  if (!report) {
    return "Run an audit to generate a ready-to-send client outreach message.";
  }

  const seoAvailable = (report.summary.seoPagesAnalyzed || 0) > 0 || (report.summary.seoTotalIssues || 0) > 0;
  const leadIssues = report.issues.slice(0, 3).map((issue) => {
    const route = issue.route === "/" ? "the home page" : issue.route;
    return `${issue.group.toLowerCase()} on ${route}${issue.action ? ` via ${issue.action}` : ""}`;
  });
  const issuesLine = leadIssues.length
    ? leadIssues.join("; ")
    : "technical and structural problems that deserve attention";
  const seoLine = seoAvailable
    ? `I also found SEO pressure points: the current SEO score is ${report.summary.seoScore}, with ${report.summary.seoCriticalIssues || 0} critical search issue(s) and ${report.summary.seoTotalIssues || 0} total SEO issue(s). That can weaken crawl quality, indexation stability and how confidently Google understands the site.`
    : "Even without a dedicated SEO pass, unresolved technical failures still reduce trust and can quietly hurt discoverability.";

  return [
    `Hi, I reviewed ${report.meta.baseUrl} and found a few issues that are worth fixing before they start costing you trust, conversions and visibility.`,
    "",
    `The main problems I detected were ${issuesLine}. In practice, this means parts of the site can feel unreliable, some actions can break or create friction, and the overall quality signal of the website drops for both users and search engines.`,
    "",
    seoLine,
    "",
    `This is exactly the kind of technical debt that often stays invisible until traffic, leads or indexing quality start slipping. Fixing it now is usually much cheaper than waiting until it becomes a visible business problem.`,
    "",
    "If you want, I can turn this audit into a prioritized fix plan and show exactly what should be corrected first.",
  ].join("\n");
}

function issueSignature(issue) {
  return [issue.code, issue.route, issue.action || "", issue.group].join("|");
}

function signedDelta(value) {
  const amount = toNumber(value, 0);
  if (amount === 0) return "0";
  return amount > 0 ? `+${amount}` : `${amount}`;
}

function getReferenceSnapshot(report) {
  if (!report) return null;
  if (uiState.baseline?.report && uiState.baseline.stamp !== report.meta.generatedAt) {
    return {
      label: `baseline ${formatLocalDate(uiState.baseline.stamp)}`,
      snapshot: uiState.baseline,
    };
  }

  const previous = uiState.history.find((item) => item?.stamp && item.stamp !== report.meta.generatedAt);
  if (previous?.report) {
    return {
      label: `previous run ${formatLocalDate(previous.stamp)}`,
      snapshot: previous,
    };
  }

  return null;
}

function compareReports(currentReport, referenceReport) {
  if (!currentReport || !referenceReport) return null;

  const currentIssues = new Map(currentReport.issues.map((issue) => [issueSignature(issue), issue]));
  const referenceIssues = new Map(referenceReport.issues.map((issue) => [issueSignature(issue), issue]));

  const newIssues = [...currentIssues.entries()]
    .filter(([signature]) => !referenceIssues.has(signature))
    .map(([, issue]) => issue);
  const resolvedIssues = [...referenceIssues.entries()]
    .filter(([signature]) => !currentIssues.has(signature))
    .map(([, issue]) => issue);
  const persistentIssues = [...currentIssues.entries()]
    .filter(([signature]) => referenceIssues.has(signature))
    .map(([, issue]) => issue);
  const escalatedIssues = [...currentIssues.entries()]
    .filter(([signature]) => referenceIssues.has(signature))
    .map(([signature, issue]) => ({
      current: issue,
      previous: referenceIssues.get(signature),
    }))
    .filter(({ current, previous }) => severityRank(current.severity) > severityRank(previous?.severity || "low"))
    .map(({ current }) => current);
  const criticalRegressions = [...newIssues, ...escalatedIssues]
    .filter((issue, index, list) => issue.severity === "high" && list.findIndex((candidate) => issueSignature(candidate) === issueSignature(issue)) === index);

  return {
    issueDelta: currentReport.summary.totalIssues - referenceReport.summary.totalIssues,
    seoDelta: currentReport.summary.seoScore - referenceReport.summary.seoScore,
    riskDelta: scoreFromIssues(currentReport.issues) - scoreFromIssues(referenceReport.issues),
    routeDelta: currentReport.summary.routesChecked - referenceReport.summary.routesChecked,
    actionDelta: currentReport.summary.actionsMapped - referenceReport.summary.actionsMapped,
    newIssues,
    resolvedIssues,
    persistentIssues,
    criticalRegressions,
  };
}

function findReferenceEvidenceItem(item, report) {
  if (!item || !report) return null;
  const reference = getReferenceSnapshot(report);
  if (!reference?.snapshot?.report) return null;

  const targetCode = String(item.issueCode || item.code || "");
  const targetRoute = String(item.issueRoute || item.route || "/");
  const targetVariant = String(item.variant || "");
  const targetGroup = String(item.issueGroup || "");

  const bestMatch = collectReportEvidence(reference.snapshot.report)
    .map((candidate) => {
      let score = 0;
      if (String(candidate.issueCode || candidate.code || "") === targetCode) score += 5;
      if (String(candidate.issueRoute || candidate.route || "/") === targetRoute) score += 4;
      if (String(candidate.variant || "") === targetVariant) score += 3;
      if (String(candidate.issueGroup || "") === targetGroup) score += 2;
      return { candidate, score };
    })
    .filter((entry) => entry.score >= 9)
    .sort((left, right) => right.score - left.score)[0];

  return bestMatch
    ? {
        label: reference.label,
        item: bestMatch.candidate,
      }
    : null;
}

function buildCompareDigest(report) {
  if (!report) {
    return "No current report is loaded in SitePulse Studio.";
  }

  const reference = getReferenceSnapshot(report);
  if (!reference?.snapshot?.report) {
    return "No baseline or previous run is available for comparison.";
  }

  const comparison = compareReports(report, reference.snapshot.report);
  if (!comparison) {
    return "Comparison data is not available.";
  }

  const lines = [
    `Current target: ${report.meta.baseUrl}`,
    `Compared with: ${reference.label}`,
    `Issue delta: ${signedDelta(comparison.issueDelta)}`,
    `SEO delta: ${signedDelta(comparison.seoDelta)}`,
    `Risk delta: ${signedDelta(comparison.riskDelta)}`,
    `Route delta: ${signedDelta(comparison.routeDelta)}`,
    `Action delta: ${signedDelta(comparison.actionDelta)}`,
    `Critical regressions: ${comparison.criticalRegressions.length}`,
    `Persistent issues: ${comparison.persistentIssues.length}`,
  ];

  if (comparison.newIssues.length) {
    lines.push("New issues:");
    comparison.newIssues.slice(0, 6).forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""}`);
    });
  }

  if (comparison.resolvedIssues.length) {
    lines.push("Resolved issues:");
    comparison.resolvedIssues.slice(0, 6).forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""}`);
    });
  }

  if (comparison.persistentIssues.length) {
    lines.push("Persistent issues:");
    comparison.persistentIssues.slice(0, 6).forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""}`);
    });
  }

  if (comparison.criticalRegressions.length) {
    lines.push("Critical regressions:");
    comparison.criticalRegressions.slice(0, 6).forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""}`);
    });
  }

  return lines.join("\n");
}

function findActionContext(report, issue) {
  if (!report || !issue.action) return null;
  return (
    report.actions.find((action) => action.route === issue.route && action.label === issue.action) ||
    report.actions.find((action) => action.label === issue.action) ||
    null
  );
}

function getSeverityCounts(issues) {
  return {
    high: issues.filter((issue) => issue.severity === "high").length,
    medium: issues.filter((issue) => issue.severity === "medium").length,
    low: issues.filter((issue) => issue.severity === "low").length,
  };
}

function getFilteredIssues(report) {
  if (!report) return [];
  const query = uiState.findingsSearch.trim().toLowerCase();
  return report.issues.filter((issue) => {
    const severityMatch = uiState.issueFilter === "all" || issue.severity === uiState.issueFilter;
    const routeMatch = uiState.findingsRoute === "all" || issue.route === uiState.findingsRoute;
    const searchMatch =
      !query ||
      [
        issue.code,
        issue.group,
        issue.route,
        issue.action,
        issue.detail,
        issue.recommendedResolution,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    return severityMatch && routeMatch && searchMatch;
  });
}

function renderStaticSelections() {
  updateSegmentButtons(stateEl.modeButtons, "mode", uiState.mode);
  updateSegmentButtons(stateEl.mobileSweepButtons, "mobileSweep", uiState.mobileSweep);
  updateSegmentButtons(stateEl.scopeButtons, "scope", uiState.scope);
  updateSegmentButtons(stateEl.depthButtons, "depth", uiState.depth);
  updateSegmentButtons(stateEl.severityFilterButtons, "issueFilter", uiState.issueFilter);
  stateEl.currentMode.textContent = uiState.mode === "mobile" && uiState.mobileSweep === "family" ? "mobile family" : uiState.mode;
  stateEl.currentScope.textContent = currentScopeLabel(uiState.scope);
  stateEl.currentDepth.textContent = currentDepthLabel();
  if (stateEl.mobileSweepControls) {
    stateEl.mobileSweepControls.classList.toggle("hidden", uiState.mode !== "mobile");
  }
  if (stateEl.mobileSweepHint) {
    stateEl.mobileSweepHint.textContent =
      uiState.mobileSweep === "family"
        ? "Family sweep runs Small, Medium, Large, XL and XXL phone viewports one after another and merges the analytics into a mobile-only report."
        : "Single device keeps the run deterministic. Use it when you want an exact replay command for one mobile viewport.";
  }
  stateEl.runCmd.disabled = uiState.mode === "mobile" && uiState.mobileSweep === "family";
  stateEl.runCmd.textContent =
    uiState.mode === "mobile" && uiState.mobileSweep === "family" ? "CMD unavailable for family sweep" : "Open full CMD flow";
  renderPreviewWorkspace();
  renderMobileCoveragePanel(getVisibleReport());
}

function summarizeAuditError(detail) {
  const normalized = String(detail || "")
    .replace(/SPLIVE\s+\{.*$/gim, "")
    .replace(/\[LIVE\].*$/gim, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "The engine failed to complete the run.";
  if (normalized.length <= 180) return normalized;
  return `${normalized.slice(0, 177).trimEnd()}...`;
}

function renderMissionBrief() {
  const bridgeRunning = uiState.companionState?.bridge?.running === true;
  const audit = uiState.companionState?.audit || {};
  const visibleReport = getVisibleReport();
  const evidenceCount = visibleReport ? collectReportEvidence(visibleReport).length : 0;

  if (!bridgeRunning) {
    stateEl.missionBrief.textContent = "The local engine is offline. Start the engine before trusting the board.";
    return;
  }

  if (audit.running === true) {
    if (visibleReport) {
      stateEl.missionBrief.textContent = `Audit running on ${audit.baseUrl || "the selected target"}. The live snapshot currently shows ${visibleReport.summary.totalIssues} issue(s), ${visibleReport.summary.routesChecked} route(s), SEO ${visibleReport.summary.seoScore} and ${evidenceCount} evidence file(s).`;
      return;
    }
    stateEl.missionBrief.textContent = `Audit running on ${audit.baseUrl || "the selected target"}. Follow the live log while the engine produces evidence.`;
    return;
  }

  if (!visibleReport) {
    stateEl.missionBrief.textContent = "SitePulse Studio is ready. Define a target and start the first audit.";
    return;
  }

  if (visibleReport.meta.mobileSweep?.profiles?.length) {
    const worstProfile = [...visibleReport.meta.mobileSweep.profiles].sort((left, right) => right.totalIssues - left.totalIssues)[0];
    stateEl.missionBrief.textContent = worstProfile
      ? `Mobile family sweep loaded for ${visibleReport.meta.baseUrl}. ${visibleReport.summary.mobileProfilesAnalyzed} profile(s) completed. Highest pressure is ${worstProfile.label} (${worstProfile.viewport}) with ${worstProfile.totalIssues} issue(s).`
      : `Mobile family sweep loaded for ${visibleReport.meta.baseUrl}.`;
    return;
  }

  const topIssue = visibleReport.issues[0];
  if (!topIssue) {
    stateEl.missionBrief.textContent = `The latest run finished clean on ${visibleReport.meta.baseUrl}. Treat it as the regression baseline and run again after each structural change.`;
    return;
  }

  const route = topIssue.route === "/" ? "home route" : topIssue.route;
  stateEl.missionBrief.textContent = `Primary pressure point: ${topIssue.group} on ${route}${topIssue.action ? ` via "${topIssue.action}"` : ""}. ${evidenceCount > 0 ? `There are ${evidenceCount} captured evidence file(s) attached to the run.` : "No screenshot proof was attached to this run."} Resolve the highest-impact failures before the next validation pass.`;
}

function renderMetrics(report) {
  if (!report) {
    stateEl.routesMetric.textContent = "0";
    stateEl.actionsMetric.textContent = "0";
    stateEl.issuesMetric.textContent = "0";
    stateEl.seoMetric.textContent = "0";
    stateEl.riskMetric.textContent = "0";
    return;
  }

  stateEl.routesMetric.textContent = String(report.summary.routesChecked || 0);
  stateEl.actionsMetric.textContent = String(report.summary.actionsMapped || report.summary.buttonsChecked || 0);
  stateEl.issuesMetric.textContent = String(report.summary.totalIssues || 0);
  stateEl.seoMetric.textContent = String(report.summary.seoScore || 0);
  stateEl.riskMetric.textContent = String(scoreFromIssues(report.issues));
}

function renderMobileCoveragePanel(report) {
  if (!stateEl.mobileMatrixPanel || !stateEl.mobileMatrixHeadline || !stateEl.mobileMatrixGrid) {
    return;
  }

  const modeIsMobile = uiState.mode === "mobile";
  const mobileSweep = report?.meta?.mobileSweep || null;
  const shouldShow = modeIsMobile || !!mobileSweep;
  stateEl.mobileMatrixPanel.classList.toggle("hidden", !shouldShow);

  if (!shouldShow) {
    return;
  }

  if (!mobileSweep?.profiles?.length) {
    stateEl.mobileMatrixHeadline.textContent =
      uiState.mobileSweep === "family"
        ? "Run a family sweep to build a viewport-by-viewport mobile matrix."
        : "Single-device mode is active. Switch to Family sweep when you want the full phone matrix.";
    stateEl.mobileMatrixGrid.innerHTML = '<article class="empty-state">No mobile viewport analytics are loaded yet.</article>';
    return;
  }

  const totalProfiles = report.summary.mobileProfilesAnalyzed || mobileSweep.profiles.length;
  const failingProfiles = mobileSweep.profiles.filter((item) => item.status === "failed").length;
  stateEl.mobileMatrixHeadline.textContent =
    failingProfiles > 0
      ? `${totalProfiles} mobile profile(s) completed and ${failingProfiles} failed. Start with the profiles carrying the heaviest issue count.`
      : `${totalProfiles} mobile profile(s) completed. Review issue density and SEO consistency before treating mobile as stable.`;

  stateEl.mobileMatrixGrid.innerHTML = mobileSweep.profiles
    .map((profile) => `
      <article class="mobile-profile-card">
        <div class="mobile-profile-head">
          <div>
            <div class="nav-title">${escapeHtml(profile.label)}</div>
            <div class="history-meta">${escapeHtml(profile.viewport || "mobile viewport")}</div>
          </div>
          <span class="pill ${profile.status === "failed" ? "bad" : "ok"}">${escapeHtml(profile.status)}</span>
        </div>
        <div class="mobile-profile-stats">
          <div class="mobile-profile-stat">
            <span class="info-label">Issues</span>
            <strong>${escapeHtml(String(profile.totalIssues))}</strong>
          </div>
          <div class="mobile-profile-stat">
            <span class="info-label">SEO</span>
            <strong>${escapeHtml(String(profile.seoScore))}</strong>
          </div>
          <div class="mobile-profile-stat">
            <span class="info-label">Routes</span>
            <strong>${escapeHtml(String(profile.routesChecked))}</strong>
          </div>
          <div class="mobile-profile-stat">
            <span class="info-label">Actions</span>
            <strong>${escapeHtml(String(profile.actionsMapped))}</strong>
          </div>
        </div>
        ${profile.error ? `<div class="history-copy">${escapeHtml(profile.error)}</div>` : ""}
      </article>
    `)
    .join("");
}

function renderSignals(report) {
  if (!report) {
    stateEl.routeSignal.textContent = "0";
    stateEl.runtimeSignal.textContent = "0";
    stateEl.networkSignal.textContent = "0";
    stateEl.buttonSignal.textContent = "0";
    stateEl.visualSignal.textContent = "0";
    stateEl.seoSignal.textContent = "0";
    return;
  }

  const issues = report.issues;
  stateEl.routeSignal.textContent = String(countByCode(issues, ["ROUTE_LOAD_FAIL"]));
  stateEl.runtimeSignal.textContent = String(countByCode(issues, ["JS_RUNTIME_ERROR", "CONSOLE_ERROR"]));
  stateEl.networkSignal.textContent = String(countByCode(issues, ["HTTP_4XX", "HTTP_5XX", "NET_REQUEST_FAILED"]));
  stateEl.buttonSignal.textContent = String(countByCode(issues, ["BTN_CLICK_ERROR", "BTN_NO_EFFECT"]));
  stateEl.visualSignal.textContent = String(countByCode(issues, [
    "VISUAL_SECTION_ORDER_INVALID",
    "VISUAL_SECTION_MISSING",
    "VISUAL_LAYOUT_OVERFLOW",
    "VISUAL_LAYER_OVERLAP",
    "VISUAL_ALIGNMENT_DRIFT",
    "VISUAL_TIGHT_SPACING",
    "VISUAL_GAP_INCONSISTENCY",
    "VISUAL_EDGE_HUGGING",
    "VISUAL_WIDTH_INCONSISTENCY",
    "VISUAL_BOUNDARY_COLLISION",
    "VISUAL_FOLD_PRESSURE",
  ]));
  stateEl.seoSignal.textContent = String(report.summary.seoCriticalIssues || 0);
}

function renderVisualQuality(report) {
  if (!report) {
    stateEl.visualOverflowCount.textContent = "0";
    stateEl.visualOverlapCount.textContent = "0";
    stateEl.visualAlignmentCount.textContent = "0";
    stateEl.visualSpacingCount.textContent = "0";
    stateEl.visualGapConsistencyCount.textContent = "0";
    stateEl.visualEdgeCount.textContent = "0";
    stateEl.visualWidthCount.textContent = "0";
    stateEl.visualBoundaryCount.textContent = "0";
    stateEl.visualFoldCount.textContent = "0";
    stateEl.visualSectionsCount.textContent = "0";
    stateEl.visualQualityHeadline.textContent = "No visual evidence yet.";
    stateEl.visualQualityDetail.textContent = "Run an audit to measure overflow, overlap, alignment drift, spacing discipline, edge pressure, boundary collisions, fold pressure and section-level visual rules.";
    return;
  }

  const summary = report.summary || {};
  const total = Number(summary.visualQualityIssues || 0);
  const sectionRuleIssues = Number(summary.visualSectionOrderInvalid || 0) + Number(summary.visualSectionMissing || 0);
  stateEl.visualOverflowCount.textContent = String(summary.visualLayoutOverflow || 0);
  stateEl.visualOverlapCount.textContent = String(summary.visualLayerOverlap || 0);
  stateEl.visualAlignmentCount.textContent = String(summary.visualAlignmentDrift || 0);
  stateEl.visualSpacingCount.textContent = String(summary.visualTightSpacing || 0);
  stateEl.visualGapConsistencyCount.textContent = String(summary.visualGapInconsistency || 0);
  stateEl.visualEdgeCount.textContent = String(summary.visualEdgeHugging || 0);
  stateEl.visualWidthCount.textContent = String(summary.visualWidthInconsistency || 0);
  stateEl.visualBoundaryCount.textContent = String(summary.visualBoundaryCollision || 0);
  stateEl.visualFoldCount.textContent = String(summary.visualFoldPressure || 0);
  stateEl.visualSectionsCount.textContent = String(sectionRuleIssues);

  const lead = report.issues.find((issue) => issue.code.startsWith("VISUAL_"));
  if (!lead) {
    stateEl.visualQualityHeadline.textContent = total > 0
      ? `${total} visual issue(s) classified.`
      : "No visual quality issues detected in the current report.";
    stateEl.visualQualityDetail.textContent = total > 0
      ? "Open Findings to inspect route-level visual evidence."
      : "Layout spacing, block alignment, edge clearance, width discipline, fold density and section order look stable in this pass.";
    return;
  }

  stateEl.visualQualityHeadline.textContent = `${lead.group} on ${lead.route || "current route"}.`;
  stateEl.visualQualityDetail.textContent = lead.detail || "The visual analyzer detected a layout consistency problem.";
}

function renderSteps(report) {
  const steps = report
    ? [
        ...(report.assistantGuide.immediateSteps || []),
        ...(report.seo.topRecommendations || []),
      ].filter(Boolean).slice(0, 6)
    : [];

  if (!steps.length) {
    stateEl.stepsList.innerHTML = "<li>Run an audit to generate the first operating brief.</li>";
    return;
  }

  stateEl.stepsList.innerHTML = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

function renderIssueMeta(report, filteredIssues, options = {}) {
  if (!report) {
    stateEl.issueMetaPills.innerHTML = "";
    stateEl.findingsHeadline.textContent = "Use this board to drive the fix sequence.";
    return;
  }

  const counts = getSeverityCounts(report.issues);
  const filteredCount = filteredIssues.length;
  const seoCritical = report.summary.seoCriticalIssues || 0;
  stateEl.issueMetaPills.innerHTML = [
    `<span class="pill bad">high ${counts.high}</span>`,
    `<span class="pill warn">medium ${counts.medium}</span>`,
    `<span class="pill">low ${counts.low}</span>`,
    `<span class="pill ok">seo critical ${seoCritical}</span>`,
    `<span class="pill">showing ${filteredCount}</span>`,
  ].join("");

  const lead = filteredIssues[0];
  if (!lead) {
    stateEl.findingsHeadline.textContent = options.transient === true
      ? "The live snapshot is active. No issues match the current filter."
      : "No issues for the active filter. Either the report is clean or this severity band is empty.";
    return;
  }

  if (options.transient === true) {
    const audit = uiState.companionState?.audit || {};
    const stateLead = audit.running === true ? "Live snapshot" : "Partial snapshot";
    stateEl.findingsHeadline.textContent = `${stateLead}: ${filteredIssues.length} visible issue(s) right now. Final classification settles when the run finishes.`;
    return;
  }

  stateEl.findingsHeadline.textContent = `Top visible finding: ${lead.group}${lead.action ? ` via "${lead.action}"` : ""}. Clear this band before moving to the next one.`;
}

function renderIssueGroups(report, filteredIssues) {
  if (!report || !filteredIssues.length) {
    stateEl.issueGroupGrid.innerHTML = '<article class="empty-state">No issues loaded yet.</article>';
    return;
  }

  const groups = new Map();
  filteredIssues.forEach((issue) => {
    if (!groups.has(issue.group)) {
      groups.set(issue.group, { total: 0, high: 0, medium: 0, low: 0 });
    }
    const bucket = groups.get(issue.group);
    bucket.total += 1;
    bucket[issue.severity] += 1;
  });

  stateEl.issueGroupGrid.innerHTML = [...groups.entries()]
    .sort((left, right) => right[1].total - left[1].total)
    .slice(0, 8)
    .map(([group, bucket]) => `
      <article class="group-item">
        <div>
          <div class="nav-title">${escapeHtml(group)}</div>
          <div class="history-meta">high ${bucket.high} | medium ${bucket.medium} | low ${bucket.low}</div>
        </div>
        <strong>${bucket.total}</strong>
      </article>
    `)
    .join("");
}

function renderRouteFilterOptions(report) {
  const currentValue = uiState.findingsRoute;
  const routes = report?.routes?.map((route) => route.route).filter(Boolean) || [];
  const uniqueRoutes = [...new Set(routes)].sort();
  stateEl.findingsRouteFilter.innerHTML = [
    '<option value="all">All routes</option>',
    ...uniqueRoutes.map((route) => `<option value="${escapeHtml(route)}">${escapeHtml(route)}</option>`),
  ].join("");

  if (uniqueRoutes.includes(currentValue)) {
    stateEl.findingsRouteFilter.value = currentValue;
  } else {
    uiState.findingsRoute = "all";
    stateEl.findingsRouteFilter.value = "all";
  }
}

function renderCoverageExplorers(report) {
  if (!report) {
    stateEl.routeList.innerHTML = '<article class="empty-state">Run an audit to load route coverage.</article>';
    stateEl.actionList.innerHTML = '<article class="empty-state">Run an audit to load action coverage.</article>';
    return;
  }

  if (!report.routes.length) {
    stateEl.routeList.innerHTML = '<article class="empty-state">No routes were recorded in this run.</article>';
  } else {
    stateEl.routeList.innerHTML = report.routes
      .slice(0, 20)
      .map((route) => `
        <article class="explorer-item">
          <div class="explorer-item-top">
            <div>
              <div class="nav-title">${escapeHtml(route.route)}</div>
              <div class="history-meta">${route.viewportLabel ? `${escapeHtml(route.viewportLabel)} | ` : ""}buttons discovered ${route.buttonsDiscovered} | buttons clicked ${route.buttonsClicked}</div>
            </div>
            <span class="pill ${route.loadOk ? "ok" : "bad"}">${route.loadOk ? "load ok" : "load failed"}</span>
          </div>
        </article>
      `)
      .join("");
  }

  if (!report.actions.length) {
    stateEl.actionList.innerHTML = '<article class="empty-state">No mapped actions were recorded in this run.</article>';
  } else {
    stateEl.actionList.innerHTML = report.actions
      .slice(0, 24)
      .map((action) => `
        <article class="explorer-item">
          <div class="explorer-item-top">
            <div>
              <div class="nav-title">${escapeHtml(action.label)}</div>
              <div class="history-meta">${action.viewportLabel ? `${escapeHtml(action.viewportLabel)} | ` : ""}${escapeHtml(action.route)}${action.kind ? ` | ${escapeHtml(action.kind)}` : ""}</div>
            </div>
            <span class="pill">${escapeHtml(action.statusLabel || action.status || "mapped")}</span>
          </div>
          <code>${escapeHtml(action.expectedForUser || action.expectedFunction || "Expected behavior was not described in this run.")}</code>
          <div class="history-copy">${escapeHtml(action.actualFunction || action.detail || "No actual behavior was captured for this action.")}</div>
        </article>
      `)
      .join("");
  }
}

function renderCompareIssueList(element, issues, emptyText) {
  if (!issues.length) {
    element.innerHTML = `<article class="empty-state">${escapeHtml(emptyText)}</article>`;
    return;
  }

  element.innerHTML = issues
    .slice(0, 12)
    .map((issue) => `
      <article class="explorer-item">
        <div class="explorer-item-top">
          <div>
            <div class="nav-title">${escapeHtml(issue.group)}</div>
            <div class="history-meta">${issue.viewportLabel ? `${escapeHtml(issue.viewportLabel)} | ` : ""}${escapeHtml(issue.route)}${issue.action ? ` | ${escapeHtml(issue.action)}` : ""}</div>
          </div>
          <span class="severity-pill severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
        </div>
        <div class="history-copy">${escapeHtml(issue.detail)}</div>
      </article>
    `)
    .join("");
}

function collectReportEvidence(report) {
  if (!report?.issues?.length) return [];
  const evidence = [];
  report.issues.forEach((issue) => {
    (issue.evidence || []).forEach((item) => {
      if (!item?.path) return;
      evidence.push({
        ...item,
        issueCode: issue.code,
        issueGroup: issue.group,
        issueRoute: issue.route,
        severity: issue.severity,
        detail: issue.detail,
      });
    });
  });
  return evidence.sort((left, right) => {
    const variantScore = (item) => {
      if (item?.variant === "fullpage") return 4;
      if (item?.variant === "context") return 3;
      if (item?.variant === "focus") return 2;
      return 1;
    };
    return variantScore(right) - variantScore(left);
  });
}

function buildRouteContactGroups(report) {
  const groups = new Map();
  collectReportEvidence(report).forEach((item) => {
    const route = String(item.issueRoute || item.route || "/");
    if (!groups.has(route)) {
      groups.set(route, []);
    }
    groups.get(route).push(item);
  });

  return [...groups.entries()]
    .map(([route, items]) => ({ route, items }))
    .sort((left, right) => right.items.length - left.items.length || left.route.localeCompare(right.route));
}

function findEvidenceItemByPath(filePath) {
  const target = String(filePath || "").trim();
  if (!target) return null;
  const report = getVisibleReport();
  return collectReportEvidence(report).find((item) => String(item.path || "").trim() === target) || null;
}

function renderEvidenceGallery(report, options = {}) {
  if (!report) {
    stateEl.evidenceHeadline.textContent = "Run an audit to capture visual evidence.";
    stateEl.evidenceGallery.innerHTML = '<article class="empty-state">Visual screenshots will appear here when the engine detects layout problems.</article>';
    return;
  }

  const evidence = collectReportEvidence(report);
  if (!evidence.length) {
    stateEl.evidenceHeadline.textContent = options.transient === true
      ? "The live snapshot has no visual screenshots yet."
      : "No visual screenshot evidence is attached to this report.";
    stateEl.evidenceGallery.innerHTML = '<article class="empty-state">No screenshot proof was attached to the current report.</article>';
    return;
  }

  stateEl.evidenceHeadline.textContent = `${evidence.length} screenshot${evidence.length === 1 ? "" : "s"} attached to the current run.`;
  stateEl.evidenceGallery.innerHTML = evidence
    .slice(0, 8)
    .map((item, index) => `
      <article class="evidence-card">
        <div class="evidence-preview-wrap">
          <img
            class="evidence-preview"
            src="${escapeHtml(toFileSrc(item.path))}"
            alt="${escapeHtml(item.label || `evidence-${index + 1}`)}"
            loading="lazy"
            data-evidence-preview="true"
            data-evidence-path="${escapeHtml(item.path)}"
          />
        </div>
        <div class="evidence-meta">
          <div>
            <div class="nav-title">${escapeHtml(item.label || item.issueGroup || item.issueCode)}</div>
            <div class="history-meta">${escapeHtml(item.issueRoute || item.route || "/")} | ${escapeHtml(item.issueCode || "")}</div>
          </div>
          <div class="history-actions wrap">
            ${item.variant ? `<span class="evidence-variant">${escapeHtml(item.variant)}</span>` : ""}
            <span class="severity-pill severity-${escapeHtml(item.severity || "low")}">${escapeHtml(item.severity || "info")}</span>
          </div>
        </div>
        <div class="history-copy">${escapeHtml(item.note || item.detail || "Visual evidence attached to the current issue.")}</div>
        <div class="history-actions wrap">
          <button
            type="button"
            data-evidence-preview="true"
            data-evidence-path="${escapeHtml(item.path)}"
          >Inspect here</button>
          <button type="button" data-artifact-file="${escapeHtml(item.path)}">Open image</button>
          <button type="button" data-artifact-path="${escapeHtml(item.path)}">Reveal in folder</button>
        </div>
      </article>
    `)
    .join("");
}

function renderRouteContactSheet(report, options = {}) {
  if (!report) {
    stateEl.routeContactHeadline.textContent = "Run an audit to build route contact sheets.";
    stateEl.routeContactSheet.innerHTML = '<article class="empty-state">Route-level contact sheets will appear here when visual evidence is available.</article>';
    return;
  }

  const groups = buildRouteContactGroups(report);
  if (!groups.length) {
    stateEl.routeContactHeadline.textContent = options.transient === true
      ? "The live snapshot has not attached route sheets yet."
      : "No route contact sheet is available for the current report.";
    stateEl.routeContactSheet.innerHTML = '<article class="empty-state">No visual evidence was grouped by route in this run.</article>';
    return;
  }

  stateEl.routeContactHeadline.textContent = `${groups.length} route sheet${groups.length === 1 ? "" : "s"} generated from the current run.`;
  stateEl.routeContactSheet.innerHTML = groups
    .slice(0, 8)
    .map((group) => `
      <article class="route-sheet-card">
        <div class="route-sheet-head">
          <div>
            <div class="nav-title">${escapeHtml(group.route)}</div>
            <div class="history-meta">${group.items.length} screenshot${group.items.length === 1 ? "" : "s"} | ${escapeHtml(group.items.map((item) => item.issueCode).filter(Boolean).slice(0, 3).join(" | "))}</div>
          </div>
        </div>
        <div class="route-sheet-grid">
          ${group.items.slice(0, 6).map((item, index) => `
            <button
              type="button"
              class="route-sheet-thumb"
              data-evidence-preview="true"
              data-evidence-path="${escapeHtml(item.path)}"
              aria-label="${escapeHtml(item.label || `route-evidence-${index + 1}`)}"
            >
              <img
                class="route-sheet-thumb-image"
                src="${escapeHtml(toFileSrc(item.path))}"
                alt="${escapeHtml(item.label || `route-evidence-${index + 1}`)}"
                loading="lazy"
                data-evidence-preview="true"
                data-evidence-path="${escapeHtml(item.path)}"
              />
              <span class="route-sheet-thumb-label">${escapeHtml(item.variant || item.issueCode || "evidence")}</span>
            </button>
          `).join("")}
        </div>
      </article>
    `)
    .join("");
}

function renderComparison(report, options = {}) {
  if (!report) {
    stateEl.compareHeadline.textContent = "Run two audits to unlock comparison.";
    stateEl.compareIssueDelta.textContent = "n/a";
    stateEl.compareSeoDelta.textContent = "n/a";
    stateEl.compareRiskDelta.textContent = "n/a";
    stateEl.compareRouteDelta.textContent = "n/a";
    stateEl.compareActionDelta.textContent = "n/a";
    stateEl.compareRegressionDelta.textContent = "n/a";
    stateEl.comparePersistentDelta.textContent = "n/a";
    renderCompareIssueList(stateEl.compareNewIssuesList, [], "No comparison baseline yet.");
    renderCompareIssueList(stateEl.compareResolvedIssuesList, [], "No comparison baseline yet.");
    renderCompareIssueList(stateEl.comparePersistentIssuesList, [], "No comparison baseline yet.");
    renderCompareIssueList(stateEl.compareRegressionIssuesList, [], "No comparison baseline yet.");
    return;
  }

  const reference = getReferenceSnapshot(report);
  if (!reference?.snapshot?.report) {
    stateEl.compareHeadline.textContent = options.transient === true
      ? "The live snapshot is active. Pin a baseline or keep two runs in history to compare drift."
      : "Pin a baseline or keep two runs in history to compare drift.";
    stateEl.compareIssueDelta.textContent = "n/a";
    stateEl.compareSeoDelta.textContent = "n/a";
    stateEl.compareRiskDelta.textContent = "n/a";
    stateEl.compareRouteDelta.textContent = "n/a";
    stateEl.compareActionDelta.textContent = "n/a";
    stateEl.compareRegressionDelta.textContent = "n/a";
    stateEl.comparePersistentDelta.textContent = "n/a";
    renderCompareIssueList(stateEl.compareNewIssuesList, [], "No baseline available yet.");
    renderCompareIssueList(stateEl.compareResolvedIssuesList, [], "No baseline available yet.");
    renderCompareIssueList(stateEl.comparePersistentIssuesList, [], "No baseline available yet.");
    renderCompareIssueList(stateEl.compareRegressionIssuesList, [], "No baseline available yet.");
    return;
  }

  const comparison = compareReports(report, reference.snapshot.report);
  stateEl.compareHeadline.textContent = options.transient === true
    ? `Comparing the live snapshot with ${reference.label}. Values may still change before completion.`
    : `Comparing the current run with ${reference.label}.`;
  stateEl.compareIssueDelta.textContent = signedDelta(comparison.issueDelta);
  stateEl.compareSeoDelta.textContent = signedDelta(comparison.seoDelta);
  stateEl.compareRiskDelta.textContent = signedDelta(comparison.riskDelta);
  stateEl.compareRouteDelta.textContent = signedDelta(comparison.routeDelta);
  stateEl.compareActionDelta.textContent = signedDelta(comparison.actionDelta);
  stateEl.compareRegressionDelta.textContent = String(comparison.criticalRegressions.length);
  stateEl.comparePersistentDelta.textContent = String(comparison.persistentIssues.length);
  renderCompareIssueList(stateEl.compareNewIssuesList, comparison.newIssues, "No new issues versus the reference run.");
  renderCompareIssueList(stateEl.compareResolvedIssuesList, comparison.resolvedIssues, "No issues were resolved versus the reference run.");
  renderCompareIssueList(stateEl.comparePersistentIssuesList, comparison.persistentIssues, "No issues persisted from the reference run.");
  renderCompareIssueList(stateEl.compareRegressionIssuesList, comparison.criticalRegressions, "No critical regression was detected.");
}

function buildIssueCard(issue, actionContext) {
  const priority = issue.assistantHint?.priority ? `<span class="pill">${escapeHtml(issue.assistantHint.priority)}</span>` : "";
  const firstChecks = Array.isArray(issue.assistantHint?.firstChecks) ? issue.assistantHint.firstChecks.slice(0, 3) : [];
  const shouldDo = actionContext?.expectedForUser || actionContext?.expectedFunction || issue.diagnosis.laymanExplanation || "The flow should complete the expected action without breaking.";
  const actualDid = actionContext?.actualFunction || issue.detail;
  const whyItMatters = issue.diagnosis.laymanExplanation || issue.diagnosis.technicalExplanation || "This issue can reduce trust, break navigation or hide failures from operators.";
  const technicalLead = issue.diagnosis.technicalChecks[0] || issue.diagnosis.likelyAreas[0] || "";
  const commands = issue.diagnosis.commandHints.slice(0, 2);
  const evidence = Array.isArray(issue.evidence) ? issue.evidence.slice(0, 2) : [];
  const evidenceMarkup = evidence.length
    ? `
      <div class="issue-evidence-strip">
        ${evidence.map((item, index) => `
          <article class="issue-evidence-card">
            <div class="issue-evidence-preview-wrap">
              <img
                class="issue-evidence-preview"
                src="${escapeHtml(toFileSrc(item.path))}"
                alt="${escapeHtml(item.label || `evidence-${index + 1}`)}"
                loading="lazy"
                data-evidence-preview="true"
                data-evidence-path="${escapeHtml(item.path)}"
              />
            </div>
            <div class="issue-evidence-meta">
              <span>${escapeHtml(item.label || "Visual proof")}</span>
              <div class="history-actions wrap">
                <button type="button" class="ghost small" data-evidence-preview="true" data-evidence-path="${escapeHtml(item.path)}">Inspect</button>
                <button type="button" class="ghost small" data-artifact-path="${escapeHtml(item.path)}">Reveal</button>
              </div>
            </div>
          </article>
        `).join("")}
      </div>
    `
    : "";

  return `
    <article class="issue-card">
      <div class="issue-top">
        <div>
          <p class="issue-title">${escapeHtml(issue.group)}</p>
          <div class="issue-route">${issue.viewportLabel ? `${escapeHtml(issue.viewportLabel)} | ` : ""}${escapeHtml(issue.route)}${issue.action ? ` -> ${escapeHtml(issue.action)}` : ""}</div>
        </div>
        <div class="issue-meta">
          ${priority}
          ${issue.viewportLabel ? `<span class="pill">${escapeHtml(issue.viewportLabel)}</span>` : ""}
          <span class="severity-pill severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
          <span class="pill">${escapeHtml(issue.code)}</span>
        </div>
      </div>
      <p class="issue-detail"><strong>Should do:</strong> ${escapeHtml(shouldDo)}</p>
      <p class="issue-detail"><strong>Actually did:</strong> ${escapeHtml(actualDid)}</p>
      <p class="issue-detail"><strong>Why it matters:</strong> ${escapeHtml(whyItMatters)}</p>
      <p class="issue-fix"><strong>Recommended fix:</strong> ${escapeHtml(issue.recommendedResolution)}</p>
      ${technicalLead ? `<p class="issue-checks"><strong>First technical check:</strong> ${escapeHtml(technicalLead)}</p>` : ""}
      ${firstChecks.length ? `<p class="issue-checks"><strong>Next checks:</strong> ${escapeHtml(firstChecks.join(" | "))}</p>` : ""}
      ${commands.length ? `<p class="issue-checks"><strong>Command hints:</strong> ${escapeHtml(commands.join(" | "))}</p>` : ""}
      ${evidenceMarkup}
    </article>
  `;
}

function renderIssues(report, options = {}) {
  if (!report) {
    stateEl.issuesList.innerHTML = '<article class="empty-state">No report loaded yet. Run the engine to populate the board.</article>';
    renderIssueMeta(null, []);
    renderIssueGroups(null, []);
    return;
  }

  const filteredIssues = getFilteredIssues(report);
  renderIssueMeta(report, filteredIssues, options);
  renderIssueGroups(report, filteredIssues);

  if (!filteredIssues.length) {
    stateEl.issuesList.innerHTML = '<article class="empty-state">No issues for the active filter.</article>';
    return;
  }

  stateEl.issuesList.innerHTML = filteredIssues
    .slice(0, 18)
    .map((issue) => buildIssueCard(issue, findActionContext(report, issue)))
    .join("");
}

function renderPrompt(report) {
  stateEl.quickPromptBox.textContent = report?.assistantGuide.quickStartPrompt || "Run an audit to generate a professional fix prompt.";
}

function renderSeoWorkspace(report, options = {}) {
  const transient = options.transient === true;
  if (!report) {
    stateEl.seoWorkspaceHeadline.textContent = "Run an audit to load SEO diagnostics.";
    stateEl.seoWorkspaceScore.textContent = "0";
    stateEl.seoWorkspaceCritical.textContent = "0";
    stateEl.seoWorkspaceTotal.textContent = "0";
    stateEl.seoWorkspacePages.textContent = "0";
    stateEl.seoWorkspaceDelta.textContent = "n/a";
    stateEl.seoRecommendationsList.innerHTML = "<li>Run an audit to load SEO recommendations.</li>";
    stateEl.seoWorkspaceSummary.textContent = "No SEO report loaded yet.";
    return;
  }

  const reference = getReferenceSnapshot(report);
  const comparison = reference?.snapshot?.report ? compareReports(report, reference.snapshot.report) : null;
  const recommendations = Array.isArray(report.seo?.topRecommendations) ? report.seo.topRecommendations.filter(Boolean) : [];

  stateEl.seoWorkspaceScore.textContent = String(report.summary.seoScore || 0);
  stateEl.seoWorkspaceCritical.textContent = String(report.summary.seoCriticalIssues || 0);
  stateEl.seoWorkspaceTotal.textContent = String(report.summary.seoTotalIssues || 0);
  stateEl.seoWorkspacePages.textContent = String(report.summary.seoPagesAnalyzed || report.seo?.pagesAnalyzed || 0);
  stateEl.seoWorkspaceDelta.textContent = comparison ? signedDelta(comparison.seoDelta) : "n/a";
  stateEl.seoRecommendationsList.innerHTML = recommendations.length
    ? recommendations.slice(0, 10).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No SEO recommendation was attached to this run.</li>";
  stateEl.seoWorkspaceHeadline.textContent = transient === true
    ? `Live SEO snapshot | score ${report.summary.seoScore} | critical ${report.summary.seoCriticalIssues || 0}`
    : `SEO score ${report.summary.seoScore} | critical ${report.summary.seoCriticalIssues || 0} | pages ${report.summary.seoPagesAnalyzed || report.seo?.pagesAnalyzed || 0}`;
  stateEl.seoWorkspaceSummary.textContent = recommendations.length
    ? `The current run attached ${recommendations.length} SEO recommendation(s). Use this workspace when you want search work isolated from the rest of the board.`
    : "No SEO recommendation was attached to this run. This usually means the current pass did not surface search-specific guidance beyond the score summary.";
}

function renderPromptWorkspace(report) {
  stateEl.promptWorkspaceFix.textContent = report?.assistantGuide.quickStartPrompt || "Run an audit to generate a professional fix prompt.";
  stateEl.promptWorkspaceReplay.textContent = report?.meta?.replayCommand || report?.assistantGuide?.replayCommand || "Run an audit to generate a replay command.";
  stateEl.promptWorkspaceIssues.textContent = buildIssueDigest(report);
  stateEl.promptWorkspaceCompare.textContent = buildCompareDigest(report);
  stateEl.promptWorkspaceRoutes.textContent = buildRouteDigest(report);
  stateEl.promptWorkspaceActions.textContent = buildActionDigest(report);
  stateEl.promptWorkspaceClientPrompt.textContent = buildClientOutreachPrompt(report);
  stateEl.promptWorkspaceClientMessage.textContent = buildClientOutreachMessage(report);
  stateEl.promptWorkspaceHeadline.textContent = report
    ? "Prompt pack loaded from the current report. Copy technical, operational or client-facing material from one workspace."
    : "Run an audit to generate prompts and digests.";
}

function renderReportSummary(report, options = {}) {
  if (!report) {
    stateEl.currentTarget.textContent = "none";
    stateEl.currentMode.textContent = uiState.mode === "mobile" && uiState.mobileSweep === "family" ? "mobile family" : uiState.mode;
    stateEl.currentScope.textContent = currentScopeLabel(uiState.scope);
    stateEl.currentDepth.textContent = currentDepthLabel();
    stateEl.currentDuration.textContent = "0s";
    stateEl.currentCommand.textContent = "Run an audit to generate a replay command.";
    stateEl.reportsHeadline.textContent = "Each run leaves a replayable evidence trail.";
    return;
  }

  const audit = uiState.companionState?.audit || {};
  const reportMode = normalizeMode(report.meta.auditMode || audit.mode || uiState.mode);
  const reportDepth = normalizeDepth(report.meta.auditDepth || audit.depth || uiState.depth);
  stateEl.currentTarget.textContent = report.meta.baseUrl;
  stateEl.currentMode.textContent =
    report.meta.mobileSweep?.profiles?.length ? "mobile family" : reportMode;
  stateEl.currentScope.textContent = currentScopeLabel(report.summary.auditScope || audit.scope || uiState.scope);
  stateEl.currentDepth.textContent = currentDepthLabel(reportDepth);
  const liveDurationMs = audit.running === true && audit.startedAt
    ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime())
    : (audit.durationMs || report.summary.durationMs || 0);
  const evidenceCount = collectReportEvidence(report).length;
  stateEl.currentDuration.textContent = formatDuration(liveDurationMs);
  stateEl.currentCommand.textContent = audit.lastCommand || report.meta.replayCommand || report.assistantGuide.replayCommand || "Run an audit to generate a replay command.";
  if (options.transient === true) {
    const lead = audit.running === true ? "Live snapshot" : "Partial snapshot";
    stateEl.reportsHeadline.textContent = `${lead} | ${report.summary.totalIssues} issue(s) so far | ${report.summary.routesChecked} route(s) | SEO ${report.summary.seoScore} | evidence ${evidenceCount}`;
    return;
  }
  stateEl.reportsHeadline.textContent = `${uiState.history.length} stored snapshot${uiState.history.length === 1 ? "" : "s"} | last run ${formatLocalDate(report.meta.generatedAt)} | evidence ${evidenceCount}`;
}

function renderHistory() {
  if (!uiState.history.length) {
    stateEl.historyList.innerHTML = '<article class="empty-state">No stored run snapshots yet.</article>';
    return;
  }

  stateEl.historyList.innerHTML = uiState.history
    .map((item, index) => {
      const topIssue = item.topIssue;
      return `
        <article class="history-item">
          <div class="issue-top">
            <div>
              <p class="issue-title">${escapeHtml(item.baseUrl)}</p>
              <div class="history-meta">${escapeHtml(formatLocalDate(item.stamp))} | ${escapeHtml(item.mobileSweep === "family" ? "mobile family" : item.mode || "desktop")} | scope ${escapeHtml(item.scope)} | ${escapeHtml(currentDepthLabel(item.depth || "signal"))} | risk ${escapeHtml(String(item.risk))}</div>
            </div>
            <div class="issue-meta">
              <span class="pill">${escapeHtml(`${item.issueCount} issues`)}</span>
              <span class="pill ok">${escapeHtml(`SEO ${item.seoScore}`)}</span>
            </div>
          </div>
          <p class="history-copy">${topIssue ? escapeHtml(`${topIssue.code}${topIssue.viewportLabel ? ` | ${topIssue.viewportLabel}` : ""}${topIssue.action ? ` | ${topIssue.action}` : ""} | ${topIssue.detail}`) : "Clean run snapshot."}</p>
          <div class="history-actions">
            <button type="button" data-history-index="${index}" data-history-action="load">Load snapshot</button>
            <button type="button" data-history-index="${index}" data-history-action="baseline">Use as baseline</button>
            ${uiState.baseline?.stamp === item.stamp ? '<span class="pill ok baseline-tag">baseline</span>' : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function getCommandPaletteItems() {
  return [
    { id: "run-native", label: "Run native audit", hint: "Ctrl+Enter", description: "Run the engine with the current profile.", action: () => handleAuditRun() },
    { id: "run-deep", label: "Run deep audit", hint: "Ctrl+Shift+Enter", description: "Force a deep crawl immediately.", action: () => handleAuditRun("deep") },
    { id: "open-cmd", label: "Open full CMD flow", hint: "Ctrl+Shift+C", description: "Launch the full local CMD replay path.", action: () => openCmdWindow() },
    { id: "load-report", label: "Load report file", hint: "Ctrl+O", description: "Import a JSON or log report into the workstation.", action: () => loadReportFromFile() },
    { id: "export-report", label: "Export current report", hint: "Ctrl+S", description: "Save the current report snapshot to disk.", action: () => exportCurrentReport() },
    { id: "open-vault", label: "Open report vault", hint: "", description: "Open the reports folder in Explorer.", action: () => openReportsVault() },
    { id: "open-evidence", label: "Open latest evidence", hint: "", description: "Jump to the latest evidence artifact.", action: () => openLatestEvidence() },
    { id: "preview-reload", label: "Reload preview", hint: "", description: "Reload the embedded target preview surface.", action: () => reloadPreview() },
    { id: "preview-external", label: "Open preview in browser", hint: "", description: "Open the current preview URL in the system browser.", action: () => openPreviewExternal() },
    { id: "copy-compare", label: "Copy compare digest", hint: "", description: "Copy the current delta summary against baseline.", action: () => copyText(buildCompareDigest(getVisibleReport()), "[studio] comparison digest copied.") },
    { id: "copy-seo", label: "Copy SEO digest", hint: "", description: "Copy the current SEO summary and recommendation block.", action: () => copyText(buildSeoDigest(getVisibleReport()), "[studio] SEO digest copied.") },
    { id: "copy-prompt", label: "Copy fix prompt", hint: "", description: "Copy the current professional fix prompt.", action: () => copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied.") },
    { id: "copy-client-prompt", label: "Copy client outreach prompt", hint: "", description: "Copy the AI-ready commercial prompt based on the current audit.", action: () => copyText(buildClientOutreachPrompt(getVisibleReport()), "[studio] client outreach prompt copied.") },
    { id: "copy-client-message", label: "Copy client outreach message", hint: "", description: "Copy the ready-to-send client-facing pitch based on the current audit.", action: () => copyText(buildClientOutreachMessage(getVisibleReport()), "[studio] client outreach message copied.") },
    { id: "switch-overview", label: "Go to overview", hint: "Ctrl+1", description: "Open setup, target profile and top-level mission control.", action: () => switchView("overview") },
    { id: "switch-preview", label: "Go to preview", hint: "Ctrl+9", description: "Open the embedded operator preview and follow the current route.", action: () => switchView("preview") },
    { id: "switch-operations", label: "Go to operations", hint: "Ctrl+2", description: "Open live progress, stage evidence and the engine log.", action: () => switchView("operations") },
    { id: "switch-findings", label: "Go to findings", hint: "Ctrl+3", description: "Open the issue board, visual quality and coverage panels.", action: () => switchView("findings") },
    { id: "switch-seo", label: "Go to SEO", hint: "Ctrl+4", description: "Open the dedicated SEO workspace.", action: () => switchView("seo") },
    { id: "switch-prompts", label: "Go to prompts", hint: "Ctrl+5", description: "Open prompt pack, replay and digest workspaces.", action: () => switchView("prompts") },
    { id: "switch-compare", label: "Go to compare", hint: "Ctrl+6", description: "Open baseline deltas, regressions and resolved work.", action: () => switchView("compare") },
    { id: "switch-reports", label: "Go to reports", hint: "Ctrl+7", description: "Open evidence, contact sheets and history.", action: () => switchView("reports") },
    { id: "switch-settings", label: "Go to settings", hint: "Ctrl+8", description: "Open engine controls and runtime settings.", action: () => switchView("settings") },
    { id: "start-engine", label: "Start engine", hint: "", description: "Start the local bridge/runtime if it is offline.", action: () => startEngine() },
    { id: "stop-engine", label: "Stop engine", hint: "", description: "Stop the local bridge/runtime.", action: () => stopEngine() },
  ];
}

function renderCommandPalette() {
  const query = uiState.commandPaletteQuery.trim().toLowerCase();
  const items = getCommandPaletteItems().filter((item) => {
    if (!query) return true;
    return [item.label, item.description, item.hint, item.id].some((value) => String(value || "").toLowerCase().includes(query));
  });

  if (!items.length) {
    stateEl.commandPaletteList.innerHTML = '<article class="empty-state">No command matches the current search.</article>';
    return;
  }

  stateEl.commandPaletteList.innerHTML = items
    .map((item) => `
      <button class="command-item" type="button" data-command-id="${escapeHtml(item.id)}">
        <div class="command-item-top">
          <strong>${escapeHtml(item.label)}</strong>
          ${item.hint ? `<span class="pill">${escapeHtml(item.hint)}</span>` : ""}
        </div>
        <span>${escapeHtml(item.description)}</span>
      </button>
    `)
    .join("");
}

async function executeCommandPaletteAction(commandId) {
  const item = getCommandPaletteItems().find((entry) => entry.id === commandId);
  if (!item) return;
  toggleCommandPalette(false);
  await item.action();
}

function pushHistory(report) {
  const snapshot = createReportSnapshot(createCompactStoredReport(report, { issueLimit: 40, actionLimit: 30, routeLimit: 20 }));
  uiState.history = [snapshot, ...uiState.history.filter((item) => item.stamp !== snapshot.stamp)].slice(0, 12);
  persistHistory();
  renderHistory();
}

function renderAuditState(audit = {}) {
  const status = String(audit.status || "idle");
  const pending = uiState.auditRequestInFlight === true && audit.running !== true;
  const busy = audit.running === true || pending;

  stateEl.auditStatus.textContent = auditStatusLabel(status);
  stateEl.runAudit.disabled = busy;
  stateEl.runCmd.disabled = busy;
  stateEl.quickAuditButton.disabled = busy;
  stateEl.deepAuditButton.disabled = busy;
  stateEl.startBridge.disabled = busy || uiState.companionState?.bridge?.running === true;
  stateEl.stopBridge.disabled = busy || uiState.companionState?.bridge?.running !== true;
  stateEl.runAudit.textContent = busy ? (audit.running === true ? "Audit running..." : "Starting audit...") : "Run native audit";

  if (busy) {
    if (pending) {
      setChip(stateEl.auditChip, "audit starting", "warn");
      stateEl.headlineStatus.textContent = "Handing the run to the local engine and waiting for live telemetry.";
      return;
    }
    const percentage = Math.max(0, Math.min(100, toNumber(audit?.progress?.percentage, 0)));
    setChip(stateEl.auditChip, "audit running", "warn");
    stateEl.headlineStatus.textContent = `Engine is auditing ${audit.baseUrl || "the selected target"} · ${percentage}% complete.`;
    return;
  }

  if (status === "failed") {
    setChip(stateEl.auditChip, "audit failed", "bad");
    stateEl.headlineStatus.textContent = summarizeAuditError(audit.lastError);
    return;
  }

  if (status === "issues") {
    setChip(stateEl.auditChip, "issues detected", "warn");
    stateEl.headlineStatus.textContent = "The audit completed with findings. Use the board to remove high-risk failures first.";
    return;
  }

  if (status === "clean") {
    setChip(stateEl.auditChip, "clean run", "ok");
    stateEl.headlineStatus.textContent = "The latest run completed clean. Keep this as the regression baseline.";
    return;
  }

  setChip(stateEl.auditChip, "audit idle", "default");
  stateEl.headlineStatus.textContent = "Ready to run a new audit.";
}

function renderAuditProgress(audit = {}) {
  const progress = audit?.progress && typeof audit.progress === "object" ? audit.progress : {};
  const percentage = Math.max(0, Math.min(100, toNumber(progress.percentage, 0)));
  const phaseLabel = String(progress.phaseLabel || (audit.running ? "Preparing runtime" : "Ready"));
  const detail = String(progress.detail || (audit.running ? "The engine is collecting evidence." : "The engine will show the current phase while it audits."));
  const routeIndex = toNumber(progress.routeIndex, 0);
  const totalRoutes = toNumber(progress.totalRoutes, 0);
  const labelIndex = toNumber(progress.labelIndex, 0);
  const totalLabels = toNumber(progress.totalLabels, 0);

  let counters = "Waiting for the next run.";
  if (audit.running) {
    if (totalRoutes > 0 && totalLabels > 0) {
      counters = `Route ${Math.max(routeIndex, 1)}/${totalRoutes} · action ${Math.max(labelIndex, 1)}/${totalLabels}`;
    } else if (totalRoutes > 0) {
      counters = `Route ${Math.max(routeIndex, 1)}/${totalRoutes}`;
    } else {
      counters = "Preparing the run map...";
    }
  } else if (audit.status === "clean" || audit.status === "issues") {
    counters = "Run finished.";
  } else if (audit.status === "failed") {
    counters = "Run stopped with failure.";
  }

  let etaText = "ETA calibrating";
  if (audit.running) {
    const elapsedMs = audit.startedAt ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime()) : 0;
    const historyEstimateMs = estimateRunDurationMs({
      baseUrl: audit.baseUrl,
      mode: audit.mode,
      scope: audit.scope,
      depth: audit.depth,
    });
    const progressEstimateMs = percentage >= 10 && elapsedMs > 0
      ? Math.round(elapsedMs / Math.max(percentage / 100, 0.1))
      : 0;
    const totalEstimateMs = median([historyEstimateMs, progressEstimateMs].filter((value) => value > 0));
    if (totalEstimateMs > 0) {
      const remainingMs = Math.max(0, totalEstimateMs - elapsedMs);
      etaText = remainingMs > 0 ? `ETA ${formatDuration(remainingMs)}` : "Ending soon";
    } else if (elapsedMs > 0) {
      etaText = `Elapsed ${formatDuration(elapsedMs)}`;
    }
  } else if (audit.status === "clean" || audit.status === "issues") {
    etaText = "Completed";
  } else if (audit.status === "failed") {
    etaText = "Interrupted";
  }

  stateEl.auditProgressLabel.textContent = phaseLabel;
  stateEl.auditProgressPercent.textContent = `${percentage}%`;
  stateEl.auditProgressCounters.textContent = counters;
  stateEl.auditProgressEta.textContent = etaText;
  stateEl.auditProgressDetail.textContent = detail;
  stateEl.auditProgressFill.style.width = `${percentage}%`;
}

function renderExecutionState(audit = {}) {
  const timeline = Array.isArray(audit.timeline) ? audit.timeline : [];
  const stageBoard = Array.isArray(audit.stageBoard) ? audit.stageBoard : [];
  const busy = audit.running === true;

  stateEl.timelineHeadline.textContent = busy
    ? "The engine is moving through phases and updating evidence as each step finishes."
    : timeline.length
      ? "Latest execution trail from the most recent run."
      : "The workstation will register each engine phase as evidence appears.";

  if (!timeline.length) {
    stateEl.timelineList.innerHTML = '<article class="empty-state">Run an audit to populate the execution timeline.</article>';
  } else {
    stateEl.timelineList.innerHTML = timeline
      .slice(0, 14)
      .map((entry) => `
        <article class="timeline-entry timeline-${escapeHtml(entry.status || "active")}">
          <div class="timeline-top">
            <div>
              <div class="nav-title">${escapeHtml(entry.label || "Engine event")}</div>
              <div class="history-meta">${escapeHtml(formatLocalDate(entry.at || new Date().toISOString()))}${entry.route ? ` | ${escapeHtml(entry.route)}` : ""}${entry.action ? ` | ${escapeHtml(entry.action)}` : ""}</div>
            </div>
            <span class="pill ${entry.status === "failed" ? "bad" : entry.status === "issue" ? "warn" : entry.status === "done" ? "ok" : ""}">${escapeHtml(entry.status || "active")}</span>
          </div>
          <div class="history-copy">${escapeHtml(entry.detail || "No detail captured for this phase.")}</div>
        </article>
      `)
      .join("");
  }

  if (!stageBoard.length) {
    stateEl.stageBoard.innerHTML = '<article class="empty-state">Stage evidence will appear here during execution.</article>';
    return;
  }

  stateEl.stageBoard.innerHTML = stageBoard
    .map((stage) => `
      <article class="stage-card stage-${escapeHtml(stage.status || "idle")}">
        <div class="stage-card-top">
          <div>
            <div class="nav-title">${escapeHtml(stage.label)}</div>
            <div class="history-meta">${escapeHtml(stage.updatedAt ? formatLocalDate(stage.updatedAt) : "not reached yet")}</div>
          </div>
          <span class="pill ${stage.status === "failed" ? "bad" : stage.status === "issue" ? "warn" : stage.status === "done" ? "ok" : stage.status === "active" ? "" : ""}">${escapeHtml(stage.status || "idle")}</span>
        </div>
        <div class="history-copy">${escapeHtml(stage.detail || "Waiting for this phase.")}</div>
        <div class="stage-evidence-row">
          <span>evidence ${escapeHtml(String(stage.evidenceCount || 0))}</span>
          <span>${escapeHtml(stage.route || stage.action || "no route/action yet")}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderWorkspaceReport(report, options = {}) {
  const transient = options.transient === true;
  if (transient) {
    uiState.liveReport = report;
  } else {
    uiState.report = report;
    uiState.liveReport = null;
    uiState.liveReportKey = "";
  }

  renderMetrics(report);
  renderMobileCoveragePanel(report);
  renderSignals(report);
  renderVisualQuality(report);
  renderSteps(report);
  renderRouteFilterOptions(report);
  renderIssues(report, { transient });
  renderCoverageExplorers(report);
  renderPrompt(report);
  renderSeoWorkspace(report, { transient });
  renderPromptWorkspace(report);
  renderEvidenceGallery(report, { transient });
  renderRouteContactSheet(report, { transient });
  renderReportSummary(report, { transient });
  renderComparison(report, { transient });
  renderMissionBrief();
}

function clearLiveReportState() {
  if (!uiState.liveReport) return;
  uiState.liveReport = null;
  uiState.liveReportKey = "";
  const fallbackReport = getVisibleReport();
  renderMetrics(fallbackReport);
  renderMobileCoveragePanel(fallbackReport);
  renderSignals(fallbackReport);
  renderVisualQuality(fallbackReport);
  renderSteps(fallbackReport);
  renderRouteFilterOptions(fallbackReport);
  renderIssues(fallbackReport);
  renderCoverageExplorers(fallbackReport);
  renderPrompt(fallbackReport);
  renderSeoWorkspace(fallbackReport);
  renderPromptWorkspace(fallbackReport);
  renderEvidenceGallery(fallbackReport);
  renderRouteContactSheet(fallbackReport);
  renderReportSummary(fallbackReport);
  renderComparison(fallbackReport);
  renderMissionBrief();
}

function renderCompanionState(payload) {
  uiState.companionState = payload;
  stateEl.serviceName.textContent = payload?.serviceName || "SitePulse Studio";
  stateEl.versionText.textContent = payload?.version || "1.0.0";
  stateEl.runtimePath.textContent = shortPath(payload?.qaRuntimeDir);
  stateEl.reportsPath.textContent = shortPath(payload?.reportsDir);
  stateEl.bridgeAddress.textContent = payload?.bridge ? `http://${payload.bridge.host}:${payload.bridge.port}` : "loading...";
  stateEl.launchOnLogin.checked = payload?.launchOnLogin === true;

  const bridgeRunning = payload?.bridge?.running === true;
  stateEl.bridgeStatus.textContent = bridgeRunning ? `${payload.bridge.host}:${payload.bridge.port}` : "offline";
  setChip(stateEl.bridgeChip, bridgeRunning ? "engine online" : "engine offline", bridgeRunning ? "ok" : "bad");
  setChip(stateEl.buildChip, `studio ${payload?.version || "1.0.0"}`, "ok");

  replaceLogs(payload?.logs);
  renderAuditState(payload?.audit || {});
  renderAuditProgress(payload?.audit || {});
  renderExecutionState(payload?.audit || {});
  renderPreviewWorkspace(payload?.audit || {});
  queuePreviewSync(payload?.audit?.running === true ? "route" : "state");
  const livePayload = payload?.audit?.liveReport && typeof payload.audit.liveReport === "object" ? payload.audit.liveReport : null;
  if (livePayload) {
    const liveReport = normalizeReport(livePayload);
    liveReport.meta.auditMode = normalizeMode(payload?.audit?.mode || liveReport.meta.auditMode);
    liveReport.meta.auditDepth = normalizeDepth(payload?.audit?.depth || liveReport.meta.auditDepth);
    liveReport.summary.auditScope = normalizeScope(payload?.audit?.scope || liveReport.summary.auditScope);

    if (payload?.audit?.running !== true && String(liveReport.meta.finishedAt || "").trim()) {
      clearLiveReportState();
      persistLastReport(liveReport);
      pushHistory(liveReport);
      renderAllReportState(liveReport);
      return;
    }

    const liveKey = buildLiveReportKey(liveReport);
    if (liveKey !== uiState.liveReportKey) {
      uiState.liveReportKey = liveKey;
      renderLiveReportState(liveReport);
      return;
    }
    renderMissionBrief();
    renderReportSummary(getVisibleReport(), { transient: true });
    return;
  }

  if (payload?.audit?.hasLiveReport === true && uiState.liveReport) {
    renderMissionBrief();
    renderReportSummary(getVisibleReport(), { transient: true });
    return;
  }

  clearLiveReportState();
  renderMissionBrief();
  renderReportSummary(getVisibleReport());
}

function renderAllReportState(report) {
  renderWorkspaceReport(report, { transient: false });
}

function renderLiveReportState(report) {
  renderWorkspaceReport(report, { transient: true });
}

async function copyText(value, successMessage) {
  const payload = String(value || "").trim();
  if (!payload) {
    appendLog("[studio] nothing to copy yet.");
    showToast("There is nothing to copy yet.", "warn");
    return;
  }
  await window.sitePulseCompanion.copyText(payload);
  appendLog(successMessage);
  showToast(successMessage.replace(/^\[studio\]\s*/i, ""), "ok");
}

async function handleAuditRun(forceDepth = null) {
  if (uiState.auditRequestInFlight === true || uiState.companionState?.audit?.running === true) {
    showToast("An audit is already in progress.", "warn");
    return;
  }

  if (forceDepth) {
    uiState.depth = forceDepth;
    renderStaticSelections();
  }

  const input = collectRunInput();
  if (!input.baseUrl) {
    stateEl.headlineStatus.textContent = "Target URL is required before the engine can start.";
    showToast("Target URL is required before the audit can start.", "warn");
    return;
  }

  uiState.auditRequestInFlight = true;
  renderAuditState(uiState.companionState?.audit || {});
  if (input.headed === true) {
    switchView("preview");
    queuePreviewSync("run_start");
  }

  try {
    const payload = await window.sitePulseCompanion.runAudit(input);
    if (!payload?.ok || !payload?.report) {
      const detail = payload?.detail || payload?.error || "audit_failed";
      appendLog(`[studio] audit failed: ${detail}`);
      stateEl.headlineStatus.textContent = detail;
      showToast("The audit failed. Review the live log and fix the root cause.", "bad");
      return;
    }

    const report = normalizeReport(payload.report);
    report.meta.auditMode = input.mode;
    report.meta.auditDepth = input.fullAudit ? "deep" : "signal";
    persistLastReport(report);
    pushHistory(report);
    renderAllReportState(report);
    stateEl.currentCommand.textContent = payload.command || report.meta.replayCommand || report.assistantGuide.replayCommand;
    await syncAuthoritativeState();
    if (payload.usedFallback === true) {
      appendLog("[studio] run completed with fallback mode active.");
      showToast("Audit finished with fallback mode active.", "warn");
    }
    showToast(report.summary.totalIssues > 0 ? "Audit finished with findings." : "Audit finished clean.", report.summary.totalIssues > 0 ? "warn" : "ok");
    switchView(report.summary.totalIssues > 0 ? "findings" : "reports");
  } finally {
    uiState.auditRequestInFlight = false;
    renderAuditState(uiState.companionState?.audit || {});
  }
}

async function openCmdWindow() {
  if (uiState.auditRequestInFlight === true || uiState.companionState?.audit?.running === true) {
    showToast("An audit is already in progress.", "warn");
    return;
  }

  if (uiState.mode === "mobile" && uiState.mobileSweep === "family") {
    showToast("Family sweep is available in native audit only. Use single-device mode if you need CMD replay.", "warn");
    return;
  }

  const input = collectRunInput(true);
  if (!input.baseUrl) {
    stateEl.headlineStatus.textContent = "Target URL is required before opening the CMD flow.";
    showToast("Target URL is required before opening CMD.", "warn");
    return;
  }

  uiState.auditRequestInFlight = true;
  renderAuditState(uiState.companionState?.audit || {});
  if (input.headed === true) {
    switchView("preview");
    queuePreviewSync("run_start");
  }

  try {
    const payload = await window.sitePulseCompanion.openCmdWindow(input);
    if (payload?.ok) {
      appendLog(`[studio] ${payload.message || "cmd flow requested."}`);
      stateEl.headlineStatus.textContent = payload.message || "CMD flow requested.";
      showToast(payload.message || "CMD flow requested.", "ok");
      if (payload.recommendedCommand) {
        stateEl.currentCommand.textContent = payload.recommendedCommand;
      }
      return;
    }

    const detail = payload?.detail || payload?.error || "cmd_launch_failed";
    appendLog(`[studio] cmd flow failed: ${detail}`);
    stateEl.headlineStatus.textContent = detail;
    showToast("CMD flow failed to open.", "bad");
  } finally {
    uiState.auditRequestInFlight = false;
    renderAuditState(uiState.companionState?.audit || {});
  }
}

async function openReportsVault() {
  const result = await window.sitePulseCompanion.openReports();
  appendLog(result.ok ? "[studio] report vault opened." : `[studio] could not open report vault: ${result.error || "unknown"}`);
  showToast(result.ok ? "Report vault opened." : "Could not open the report vault.", result.ok ? "ok" : "bad");
}

async function copyBridgeUrl() {
  const result = await window.sitePulseCompanion.copyBridgeUrl();
  appendLog(result.ok ? "[studio] bridge URL copied." : `[studio] could not copy bridge URL: ${result.error || "unknown"}`);
  showToast(result.ok ? "Bridge URL copied." : "Could not copy bridge URL.", result.ok ? "ok" : "bad");
}

async function reloadPreview() {
  const baseUrl = resolvePreviewTargetUrl();
  if (!baseUrl) {
    showToast("Target URL is required before the preview can reload.", "warn");
    return;
  }
  setPreviewSurfaceUrl(baseUrl, { force: true });
  renderPreviewWorkspace();
  appendLog(`[studio] preview reloaded for ${baseUrl}`);
  showToast("Embedded preview reloaded.", "ok");
}

async function openPreviewExternal() {
  const previewUrl = String(uiState.preview.loadedUrl || uiState.preview.requestedUrl || currentPreviewBaseUrl()).trim();
  if (!previewUrl || previewUrl === "about:blank") {
    showToast("No preview URL is ready yet.", "warn");
    return;
  }
  const result = await window.sitePulseCompanion.openExternalUrl(previewUrl);
  if (!result?.ok) {
    appendLog(`[studio] preview external open failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Could not open the preview in the system browser.", "bad");
    return;
  }
  appendLog(`[studio] preview opened externally for ${previewUrl}`);
  showToast("Preview opened in the system browser.", "ok");
}

function togglePreviewFollowMode() {
  uiState.preview.followAudit = !uiState.preview.followAudit;
  renderPreviewWorkspace();
  queuePreviewSync("profile");
  appendLog(`[studio] preview live route sync ${uiState.preview.followAudit ? "enabled" : "disabled"}.`);
  showToast(`Live route sync ${uiState.preview.followAudit ? "enabled" : "disabled"}.`, uiState.preview.followAudit ? "ok" : "warn");
}

async function loadReportFromFile() {
  const result = await window.sitePulseCompanion.pickReportFile();
  if (!result?.ok || !result?.report) {
    if (result?.error !== "file_pick_cancelled") {
      appendLog(`[studio] failed to load report file: ${result?.detail || result?.error || "unknown"}`);
      showToast("Could not load the selected report file.", "bad");
    }
    return;
  }

  const report = normalizeReport(result.report);
  persistLastReport(report);
  pushHistory(report);
  renderAllReportState(report);
  switchView(report.summary.totalIssues > 0 ? "findings" : "reports");
  appendLog(`[studio] loaded report file ${result.path}`);
  showToast("Report file loaded into the desktop board.", "ok");
}

async function exportCurrentReport() {
  const report = getVisibleReport();
  if (!report) {
    showToast("No report is loaded yet.", "warn");
    return;
  }

  const payload = await window.sitePulseCompanion.exportReportFile(report);
  if (!payload?.ok) {
    if (payload?.error !== "file_save_cancelled") {
      appendLog(`[studio] export failed: ${payload?.detail || payload?.error || "unknown"}`);
      showToast("Could not export the current report.", "bad");
    }
    return;
  }

  appendLog(`[studio] report exported to ${payload.path}`);
  showToast("Current report exported.", "ok");
}

async function openLatestEvidence() {
  const currentEvidence = collectReportEvidence(getVisibleReport());
  if (currentEvidence.length) {
    switchView("reports");
    openEvidencePreview(currentEvidence[0]);
    showToast("Latest evidence opened inside the studio.", "ok");
    return;
  }

  const result = await window.sitePulseCompanion.openLatestEvidence();
  if (!result?.ok) {
    appendLog(`[studio] latest evidence unavailable: ${result?.detail || result?.error || "unknown"}`);
    showToast("No recent evidence file was found.", "warn");
    return;
  }

  openEvidencePreview({
    path: result.path,
    label: "Latest evidence artifact",
    detail: "This file was found as the latest visual artifact in the report vault.",
    variant: "external",
  });
  appendLog(`[studio] latest evidence loaded from ${result.path}`);
  showToast("Latest evidence loaded into the studio.", "ok");
}

async function openArtifactPath(filePath) {
  const value = String(filePath || "").trim();
  if (!value) {
    showToast("No artifact path is attached to this item.", "warn");
    return;
  }
  const result = await window.sitePulseCompanion.openArtifactPath(value);
  if (!result?.ok) {
    appendLog(`[studio] artifact open failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Could not open the selected artifact.", "bad");
    return;
  }
  appendLog(`[studio] artifact opened from ${result.path}`);
  showToast("Artifact opened in Explorer.", "ok");
}

async function openArtifactFile(filePath) {
  const value = String(filePath || "").trim();
  if (!value) {
    showToast("No artifact file is attached to this item.", "warn");
    return;
  }
  const result = await window.sitePulseCompanion.openArtifactFile(value);
  if (!result?.ok) {
    appendLog(`[studio] artifact file open failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Could not open the selected image.", "bad");
    return;
  }
  appendLog(`[studio] artifact file opened from ${result.path}`);
}

async function startEngine() {
  const result = await window.sitePulseCompanion.startBridge();
  appendLog(result.ok ? "[studio] engine started." : `[studio] engine start failed: ${result.detail || result.error || "unknown"}`);
  showToast(result.ok ? "Engine started." : "Engine failed to start.", result.ok ? "ok" : "bad");
}

async function stopEngine() {
  const result = await window.sitePulseCompanion.stopBridge();
  appendLog(result.ok ? "[studio] engine stopped." : `[studio] engine stop failed: ${result.detail || result.error || "unknown"}`);
  showToast(result.ok ? "Engine stopped." : "Engine failed to stop.", result.ok ? "warn" : "bad");
}

function pinCurrentReportAsBaseline() {
  if (!uiState.report) {
    showToast("No current report is loaded yet.", "warn");
    return;
  }

  const snapshot = createReportSnapshot(createCompactStoredReport(uiState.report, { issueLimit: 120, actionLimit: 80, routeLimit: 60 }));
  persistBaseline(snapshot);
  renderHistory();
  renderComparison(getVisibleReport());
  appendLog(`[studio] baseline pinned from ${snapshot.baseUrl} at ${snapshot.stamp}`);
  showToast("Current report pinned as the comparison baseline.", "ok");
}

function clearBaseline() {
  persistBaseline(null);
  renderHistory();
  renderComparison(getVisibleReport());
  appendLog("[studio] comparison baseline cleared.");
  showToast("Comparison baseline cleared.", "warn");
}

function applyPresetFirstAudit() {
  uiState.mode = "desktop";
  uiState.mobileSweep = "single";
  uiState.scope = "full";
  uiState.depth = "signal";
  stateEl.targetUrl.value = stateEl.targetUrl.value.trim() || DEFAULT_TARGET;
  stateEl.noServer.checked = true;
  stateEl.headed.checked = false;
  stateEl.elevated.checked = false;
  persistProfile();
  renderStaticSelections();
  persistOnboardingState(true);
  renderOnboarding();
  switchView("overview");
}

function bindSelectionEvents() {
  stateEl.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      uiState.mode = normalizeMode(button.dataset.mode);
      renderStaticSelections();
      persistProfile();
    });
  });

  stateEl.mobileSweepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      uiState.mobileSweep = normalizeMobileSweep(button.dataset.mobileSweep);
      renderStaticSelections();
      persistProfile();
    });
  });

  stateEl.scopeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      uiState.scope = normalizeScope(button.dataset.scope);
      renderStaticSelections();
      persistProfile();
    });
  });

  stateEl.depthButtons.forEach((button) => {
    button.addEventListener("click", () => {
      uiState.depth = normalizeDepth(button.dataset.depth);
      renderStaticSelections();
      persistProfile();
    });
  });

  stateEl.severityFilterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      uiState.issueFilter = button.dataset.issueFilter || "all";
      renderStaticSelections();
      renderIssues(getVisibleReport());
    });
  });

  stateEl.findingsSearch.addEventListener("input", () => {
    uiState.findingsSearch = stateEl.findingsSearch.value.trim();
    renderIssues(getVisibleReport());
  });

  stateEl.findingsRouteFilter.addEventListener("change", () => {
    uiState.findingsRoute = stateEl.findingsRouteFilter.value || "all";
    renderIssues(getVisibleReport());
  });

  stateEl.commandPaletteSearch.addEventListener("input", () => {
    uiState.commandPaletteQuery = stateEl.commandPaletteSearch.value.trim();
    renderCommandPalette();
  });

  stateEl.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view || "overview"));
  });
}

function bindPersistenceEvents() {
  [stateEl.targetUrl, stateEl.noServer, stateEl.headed, stateEl.elevated].forEach((node) => {
    node.addEventListener("input", persistProfile);
    node.addEventListener("change", persistProfile);
  });
  stateEl.targetUrl.addEventListener("input", () => queuePreviewSync("profile"));
  stateEl.targetUrl.addEventListener("change", () => queuePreviewSync("profile"));
  stateEl.headed.addEventListener("change", () => renderPreviewWorkspace());
}

function bindButtons() {
  stateEl.runAudit.addEventListener("click", async () => handleAuditRun());
  stateEl.quickAuditButton.addEventListener("click", async () => handleAuditRun("signal"));
  stateEl.deepAuditButton.addEventListener("click", async () => handleAuditRun("deep"));
  stateEl.runCmd.addEventListener("click", openCmdWindow);
  stateEl.previewReload.addEventListener("click", reloadPreview);
  stateEl.previewOpenExternal.addEventListener("click", openPreviewExternal);
  stateEl.previewToggleFollow.addEventListener("click", togglePreviewFollowMode);
  stateEl.loadReportFile.addEventListener("click", loadReportFromFile);
  stateEl.exportCurrentReport.addEventListener("click", exportCurrentReport);
  stateEl.openLatestEvidence.addEventListener("click", openLatestEvidence);
  stateEl.startBridge.addEventListener("click", startEngine);
  stateEl.stopBridge.addEventListener("click", stopEngine);
  stateEl.openReports.addEventListener("click", openReportsVault);
  stateEl.openReportsSecondary.addEventListener("click", openReportsVault);
  stateEl.copyBridgeUrl.addEventListener("click", copyBridgeUrl);
  stateEl.copyBridgeUrlSecondary.addEventListener("click", copyBridgeUrl);
  stateEl.copyReplayCommand.addEventListener("click", async () => copyText(stateEl.currentCommand.textContent, "[studio] replay command copied."));
  stateEl.copyQuickPrompt.addEventListener("click", async () => copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied."));
  stateEl.copyQuickPromptSecondary.addEventListener("click", async () => copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied."));
  stateEl.copyQuickPromptPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceFix.textContent, "[studio] fix prompt copied."));
  stateEl.copyReplayCommandPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceReplay.textContent, "[studio] replay command copied."));
  stateEl.copyReplayCommandSecondary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceReplay.textContent, "[studio] replay command copied."));
  stateEl.copyIssueDigest.addEventListener("click", async () => copyText(buildIssueDigest(getVisibleReport()), "[studio] issue digest copied."));
  stateEl.copyIssueDigestPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceIssues.textContent, "[studio] issue digest copied."));
  stateEl.copyRouteDigest.addEventListener("click", async () => copyText(buildRouteDigest(getVisibleReport()), "[studio] route digest copied."));
  stateEl.copyRouteDigestPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceRoutes.textContent, "[studio] route digest copied."));
  stateEl.copyActionDigest.addEventListener("click", async () => copyText(buildActionDigest(getVisibleReport()), "[studio] action digest copied."));
  stateEl.copyActionDigestPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceActions.textContent, "[studio] action digest copied."));
  stateEl.copyClientOutreachPrompt.addEventListener("click", async () => copyText(stateEl.promptWorkspaceClientPrompt.textContent, "[studio] client outreach prompt copied."));
  stateEl.copyClientOutreachMessage.addEventListener("click", async () => copyText(stateEl.promptWorkspaceClientMessage.textContent, "[studio] client outreach message copied."));
  stateEl.copyCompareDigest.addEventListener("click", async () => copyText(buildCompareDigest(getVisibleReport()), "[studio] comparison digest copied."));
  stateEl.copyCompareDigestPrimary.addEventListener("click", async () => copyText(stateEl.promptWorkspaceCompare.textContent, "[studio] comparison digest copied."));
  stateEl.copySeoDigest.addEventListener("click", async () => copyText(buildSeoDigest(getVisibleReport()), "[studio] SEO digest copied."));
  stateEl.copyPromptPack.addEventListener("click", async () => copyText(
    [
      stateEl.promptWorkspaceFix.textContent,
      "",
      stateEl.promptWorkspaceReplay.textContent,
      "",
      stateEl.promptWorkspaceIssues.textContent,
      "",
      stateEl.promptWorkspaceCompare.textContent,
      "",
      stateEl.promptWorkspaceRoutes.textContent,
      "",
      stateEl.promptWorkspaceActions.textContent,
      "",
      stateEl.promptWorkspaceClientPrompt.textContent,
      "",
      stateEl.promptWorkspaceClientMessage.textContent,
    ].join("\n"),
    "[studio] prompt pack copied.",
  ));
  stateEl.seoOnlyPreset.addEventListener("click", () => {
    uiState.scope = "seo";
    renderStaticSelections();
    persistProfile();
    switchView("overview");
    showToast("SEO-only profile selected.", "ok");
  });
  stateEl.pinCurrentBaseline.addEventListener("click", pinCurrentReportAsBaseline);
  stateEl.clearBaseline.addEventListener("click", clearBaseline);
  stateEl.clearLog.addEventListener("click", () => {
    uiState.logs = ["[studio] local log cleared"];
    renderLogs();
    showToast("Live log cleared.", "ok");
  });
  stateEl.clearHistory.addEventListener("click", () => {
    uiState.history = [];
    persistHistory();
    renderHistory();
    showToast("Run history cleared.", "warn");
  });
  stateEl.revealOnboarding.addEventListener("click", revealOnboarding);
  stateEl.dismissOnboarding.addEventListener("click", () => {
    persistOnboardingState(true);
    renderOnboarding();
  });
  stateEl.startTourAudit.addEventListener("click", applyPresetFirstAudit);
  stateEl.openShortcuts.addEventListener("click", () => toggleShortcutsOverlay());
  stateEl.openCommandPalette.addEventListener("click", () => toggleCommandPalette());
  stateEl.menuButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const menuName = button.dataset.menuAction || "";
      if (!menuName) return;
      if (uiState.activeMenu === menuName) {
        hideMenuFlyout();
        return;
      }
      showMenuFlyout(menuName, event.currentTarget);
    });
  });
  stateEl.dismissShortcuts.addEventListener("click", () => toggleShortcutsOverlay(false));
  stateEl.shortcutsOverlay.addEventListener("click", (event) => {
    if (event.target === stateEl.shortcutsOverlay) {
      toggleShortcutsOverlay(false);
    }
  });
  stateEl.dismissCommandPalette.addEventListener("click", () => toggleCommandPalette(false));
  stateEl.commandPaletteOverlay.addEventListener("click", (event) => {
    if (event.target === stateEl.commandPaletteOverlay) {
      toggleCommandPalette(false);
    }
  });
  stateEl.dismissEvidenceLightbox.addEventListener("click", closeEvidencePreview);
  stateEl.evidenceLightbox.addEventListener("click", (event) => {
    if (event.target === stateEl.evidenceLightbox) {
      closeEvidencePreview();
    }
  });
  stateEl.evidenceOpenImage.addEventListener("click", async () => {
    await openArtifactFile(uiState.activeEvidence?.path || "");
  });
  stateEl.evidenceRevealImage.addEventListener("click", async () => {
    await openArtifactPath(uiState.activeEvidence?.path || "");
  });
  stateEl.commandPaletteList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-command-id]");
    if (!(button instanceof HTMLElement)) return;
    await executeCommandPaletteAction(button.dataset.commandId);
  });
  stateEl.menuFlyout?.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-menu-item]");
    if (!(button instanceof HTMLElement)) return;
    await executeMenuAction(uiState.activeMenu, button.dataset.menuItem || "");
  });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("[data-menu-action]") || target.closest("#menuFlyout")) return;
    hideMenuFlyout();
  });
  stateEl.launchOnLogin.addEventListener("change", async () => {
    const result = await window.sitePulseCompanion.setLaunchOnLogin(stateEl.launchOnLogin.checked);
    appendLog(result.ok ? `[studio] open on login ${result.enabled ? "enabled" : "disabled"}.` : `[studio] launch on login failed: ${result.error || "unknown"}`);
    showToast(result.ok ? `Open on login ${result.enabled ? "enabled" : "disabled"}.` : "Could not change startup behavior.", result.ok ? "ok" : "bad");
  });
  stateEl.winMinimize.addEventListener("click", async () => {
    await window.sitePulseCompanion.minimizeWindow();
  });
  stateEl.winMaximize.addEventListener("click", async () => {
    const payload = await window.sitePulseCompanion.toggleMaximizeWindow();
    if (!payload?.ok) return;
    stateEl.winMaximize.textContent = payload.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  });
  stateEl.winClose.addEventListener("click", async () => {
    await window.sitePulseCompanion.closeWindow();
  });
  stateEl.historyList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-history-index]");
    if (!(button instanceof HTMLElement)) return;
    const index = button.dataset.historyIndex;
    if (index === undefined) return;
    const snapshot = uiState.history[Number(index)];
    if (!snapshot?.report) return;
    const action = button.dataset.historyAction || "load";
    if (action === "baseline") {
      persistBaseline(snapshot);
      renderHistory();
      renderComparison(getVisibleReport());
      appendLog(`[studio] baseline set from history snapshot ${snapshot.baseUrl}.`);
      showToast("History snapshot set as baseline.", "ok");
      return;
    }
    renderAllReportState(snapshot.report);
    switchView("reports");
    appendLog(`[studio] loaded snapshot ${snapshot.baseUrl} from history.`);
    showToast("Stored snapshot loaded.", "ok");
  });
  [stateEl.issuesList, stateEl.evidenceGallery, stateEl.routeContactSheet].forEach((container) => {
    container.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const preview = target.closest("[data-evidence-preview]");
      if (preview instanceof HTMLElement) {
        const item = findEvidenceItemByPath(preview.dataset.evidencePath || "");
        if (item) {
          openEvidencePreview(item);
        }
        return;
      }
      const openFileButton = target.closest("[data-artifact-file]");
      if (openFileButton instanceof HTMLElement) {
        await openArtifactFile(openFileButton.dataset.artifactFile || "");
        return;
      }
      const button = target.closest("[data-artifact-path]");
      if (!(button instanceof HTMLElement)) return;
      await openArtifactPath(button.dataset.artifactPath || "");
    });
  });
}

function bindKeyboardShortcuts() {
  document.addEventListener("keydown", async (event) => {
    const target = event.target;
    const targetTag = target instanceof HTMLElement ? target.tagName : "";
    const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || targetTag === "SELECT";

    if (event.key === "Escape") {
      if (!stateEl.evidenceLightbox.classList.contains("hidden")) {
        event.preventDefault();
        closeEvidencePreview();
        return;
      }
      if (uiState.activeMenu) {
        event.preventDefault();
        hideMenuFlyout();
        return;
      }
      if (uiState.commandPaletteOpen) {
        event.preventDefault();
        toggleCommandPalette(false);
        return;
      }
      if (uiState.shortcutsOpen) {
        event.preventDefault();
        toggleShortcutsOverlay(false);
      }
      return;
    }

    if (!event.ctrlKey && event.key === "?") {
      event.preventDefault();
      toggleShortcutsOverlay();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "k") {
      event.preventDefault();
      toggleCommandPalette();
      return;
    }

    if (uiState.commandPaletteOpen && event.key === "Enter") {
      event.preventDefault();
      const firstCommand = stateEl.commandPaletteList.querySelector("[data-command-id]");
      if (firstCommand instanceof HTMLElement) {
        await executeCommandPaletteAction(firstCommand.dataset.commandId);
      }
      return;
    }

    if (editing && !(event.ctrlKey && ["Enter", "f", "o", "s"].includes(event.key.toLowerCase()))) {
      return;
    }

    if (event.ctrlKey && !event.shiftKey && ["1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(event.key)) {
      event.preventDefault();
      const map = {
        "1": "overview",
        "2": "operations",
        "3": "findings",
        "4": "seo",
        "5": "prompts",
        "6": "compare",
        "7": "reports",
        "8": "settings",
        "9": "preview",
      };
      switchView(map[event.key]);
      return;
    }

    if (event.ctrlKey && event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleAuditRun();
      return;
    }

    if (event.ctrlKey && event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      await handleAuditRun("deep");
      return;
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      await openCmdWindow();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "o") {
      event.preventDefault();
      await loadReportFromFile();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "s") {
      event.preventDefault();
      await exportCurrentReport();
      return;
    }

    if (event.ctrlKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      switchView("findings");
      stateEl.findingsSearch.focus();
      stateEl.findingsSearch.select();
    }
  });
}

function bindRuntimeEvents() {
  window.sitePulseCompanion.onLog((line) => {
    appendLog(line);
  });

  window.sitePulseCompanion.onState((payload) => {
    renderCompanionState(payload);
  });

  window.sitePulseCompanion.onLiveReport((report) => {
    const nextState = {
      ...(uiState.companionState || {}),
      audit: {
        ...(uiState.companionState?.audit || {}),
        liveReport: report && typeof report === "object" ? report : null,
        hasLiveReport: !!report,
      },
    };
    renderCompanionState(nextState);
  });

  window.sitePulseCompanion.onWindowState((payload) => {
    stateEl.winMaximize.textContent = payload?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  });
}

async function bootstrap() {
  restoreProfile();
  renderStaticSelections();
  renderOnboarding();
  bindPreviewSurface();

  const savedReport = restoreLastReport();
  if (savedReport) {
    renderAllReportState(savedReport);
  } else {
    renderAllReportState(null);
  }
  renderHistory();
  renderLogs();
  renderCommandPalette();
  renderPreviewWorkspace();
  switchView("overview");

  bindSelectionEvents();
  bindPersistenceEvents();
  bindButtons();
  bindKeyboardShortcuts();
  bindRuntimeEvents();

  const [payload, windowState] = await Promise.all([
    window.sitePulseCompanion.getState(),
    window.sitePulseCompanion.getWindowState(),
  ]);

  renderCompanionState(payload);
  stateEl.winMaximize.textContent = windowState?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  queuePreviewSync("bootstrap");
}

bootstrap().catch((error) => {
  appendLog(`[studio] bootstrap failed: ${error?.message || error}`);
});


