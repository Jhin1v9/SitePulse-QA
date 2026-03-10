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
};

const DEFAULT_TARGET = "https://example.com";

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
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  scopeButtons: Array.from(document.querySelectorAll("[data-scope]")),
  depthButtons: Array.from(document.querySelectorAll("[data-depth]")),
  severityFilterButtons: Array.from(document.querySelectorAll("[data-issue-filter]")),
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
  headlineStatus: document.getElementById("headlineStatus"),
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
  compareHeadline: document.getElementById("compareHeadline"),
  compareIssueDelta: document.getElementById("compareIssueDelta"),
  compareSeoDelta: document.getElementById("compareSeoDelta"),
  compareRiskDelta: document.getElementById("compareRiskDelta"),
  compareRouteDelta: document.getElementById("compareRouteDelta"),
  compareActionDelta: document.getElementById("compareActionDelta"),
  compareNewIssuesList: document.getElementById("compareNewIssuesList"),
  compareResolvedIssuesList: document.getElementById("compareResolvedIssuesList"),
  pinCurrentBaseline: document.getElementById("pinCurrentBaseline"),
  clearBaseline: document.getElementById("clearBaseline"),
  copyCompareDigest: document.getElementById("copyCompareDigest"),
  quickPromptBox: document.getElementById("quickPromptBox"),
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
  toastStack: document.getElementById("toastStack"),
};

const uiState = {
  companionState: null,
  report: null,
  logs: ["[studio] waiting for engine telemetry"],
  mode: "desktop",
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
  commandPaletteQuery: "",
};

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

function normalizeDepth(value) {
  return value === "deep" ? "deep" : "signal";
}

function parseSeverity(value, code = "") {
  if (value === "high" || value === "medium" || value === "low") return value;
  if (["HTTP_5XX", "JS_RUNTIME_ERROR", "VISUAL_SECTION_ORDER_INVALID", "ROUTE_LOAD_FAIL"].includes(code)) return "high";
  if (["HTTP_4XX", "BTN_CLICK_ERROR", "NET_REQUEST_FAILED", "VISUAL_SECTION_MISSING"].includes(code)) return "medium";
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
    assistantHint: issue.assistantHint && typeof issue.assistantHint === "object" ? issue.assistantHint : {},
    diagnosis: normalizeDiagnosis(issue.diagnosis && typeof issue.diagnosis === "object" ? issue.diagnosis : {}),
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
    },
    summary: {
      auditScope: normalizeScope(summary.auditScope || meta.auditScope || "full"),
      routesChecked: toNumber(summary.routesChecked, routes.length),
      buttonsChecked: toNumber(summary.buttonsChecked, actions.length),
      totalIssues: toNumber(summary.totalIssues, issues.length),
      actionsMapped: toNumber(summary.actionsMapped, actions.length || summary.buttonsChecked),
      visualSectionOrderInvalid: toNumber(summary.visualSectionOrderInvalid, 0),
      buttonsNoEffect: toNumber(summary.buttonsNoEffect, 0),
      consoleErrors: toNumber(summary.consoleErrors, 0),
      seoScore: toNumber(summary.seoScore, seo.overallScore),
      seoCriticalIssues: toNumber(summary.seoCriticalIssues, 0),
      seoTotalIssues: toNumber(summary.seoTotalIssues, 0),
      seoPagesAnalyzed: toNumber(summary.seoPagesAnalyzed, seo.pagesAnalyzed),
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
    scope: report.summary.auditScope,
    depth: report.meta.auditDepth || "signal",
    risk: scoreFromIssues(report.issues),
    topIssue: report.issues[0]
      ? {
          code: report.issues[0].code,
          severity: report.issues[0].severity,
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

function updateSegmentButtons(buttons, fieldName, activeValue) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[fieldName] === activeValue);
  });
}

function switchView(viewName) {
  uiState.activeView = viewName;
  stateEl.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });
  stateEl.viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === viewName);
  });
}

function renderOnboarding() {
  stateEl.onboardingOverlay.classList.toggle("hidden", uiState.onboardingDismissed);
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
    scope: uiState.scope,
    noServer: stateEl.noServer.checked,
    headed: stateEl.headed.checked,
    fullAudit: forceFullAudit === null ? uiState.depth === "deep" : forceFullAudit,
    elevated: stateEl.elevated.checked,
  };
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
    return "No issues are loaded in SitePulse Studio.";
  }

  return report.issues
    .slice(0, 12)
    .map((issue, index) => `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""} | ${issue.detail}`)
    .join("\n");
}

function buildRouteDigest(report) {
  if (!report || !report.routes.length) {
    return "No route coverage is loaded in SitePulse Studio.";
  }

  return report.routes
    .slice(0, 20)
    .map((route, index) => `${index + 1}. ${route.route} | load=${route.loadOk ? "ok" : "failed"} | discovered=${route.buttonsDiscovered} | clicked=${route.buttonsClicked}`)
    .join("\n");
}

function buildActionDigest(report) {
  if (!report || !report.actions.length) {
    return "No action coverage is loaded in SitePulse Studio.";
  }

  return report.actions
    .slice(0, 20)
    .map((action, index) => `${index + 1}. ${action.route} | ${action.label} | expected=${action.expectedForUser || action.expectedFunction || "n/a"} | actual=${action.actualFunction || action.detail || action.statusLabel || "n/a"}`)
    .join("\n");
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

  return {
    issueDelta: currentReport.summary.totalIssues - referenceReport.summary.totalIssues,
    seoDelta: currentReport.summary.seoScore - referenceReport.summary.seoScore,
    riskDelta: scoreFromIssues(currentReport.issues) - scoreFromIssues(referenceReport.issues),
    routeDelta: currentReport.summary.routesChecked - referenceReport.summary.routesChecked,
    actionDelta: currentReport.summary.actionsMapped - referenceReport.summary.actionsMapped,
    newIssues,
    resolvedIssues,
  };
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
    return "Comparison data is unavailable.";
  }

  const lines = [
    `Current target: ${report.meta.baseUrl}`,
    `Compared against: ${reference.label}`,
    `Issue delta: ${signedDelta(comparison.issueDelta)}`,
    `SEO delta: ${signedDelta(comparison.seoDelta)}`,
    `Risk delta: ${signedDelta(comparison.riskDelta)}`,
    `Route delta: ${signedDelta(comparison.routeDelta)}`,
    `Action delta: ${signedDelta(comparison.actionDelta)}`,
  ];

  if (comparison.newIssues.length) {
    lines.push("New findings:");
    comparison.newIssues.slice(0, 6).forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.code} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""}`);
    });
  }

  if (comparison.resolvedIssues.length) {
    lines.push("Resolved findings:");
    comparison.resolvedIssues.slice(0, 6).forEach((issue, index) => {
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
  updateSegmentButtons(stateEl.scopeButtons, "scope", uiState.scope);
  updateSegmentButtons(stateEl.depthButtons, "depth", uiState.depth);
  updateSegmentButtons(stateEl.severityFilterButtons, "issueFilter", uiState.issueFilter);
  stateEl.currentMode.textContent = uiState.mode;
  stateEl.currentScope.textContent = uiState.scope;
  stateEl.currentDepth.textContent = currentDepthLabel();
}

function renderMissionBrief() {
  const bridgeRunning = uiState.companionState?.bridge?.running === true;
  const audit = uiState.companionState?.audit || {};

  if (!bridgeRunning) {
    stateEl.missionBrief.textContent = "The local engine is offline. Start the engine before relying on the board.";
    return;
  }

  if (audit.running === true) {
    stateEl.missionBrief.textContent = `Audit running against ${audit.baseUrl || "the selected target"}. Follow the live log while the engine builds evidence.`;
    return;
  }

  if (!uiState.report) {
    stateEl.missionBrief.textContent = "SitePulse Studio is ready. Define a target and start the first audit run.";
    return;
  }

  const topIssue = uiState.report.issues[0];
  if (!topIssue) {
    stateEl.missionBrief.textContent = `Latest run finished clean for ${uiState.report.meta.baseUrl}. Treat this as a baseline and re-run after every structural change.`;
    return;
  }

  const route = topIssue.route === "/" ? "home route" : topIssue.route;
  stateEl.missionBrief.textContent = `Primary pressure point: ${topIssue.group} on ${route}${topIssue.action ? ` via "${topIssue.action}"` : ""}. Resolve high-impact failures before the next validation pass.`;
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
  stateEl.visualSignal.textContent = String(countByCode(issues, ["VISUAL_SECTION_ORDER_INVALID", "VISUAL_SECTION_MISSING"]));
  stateEl.seoSignal.textContent = String(report.summary.seoCriticalIssues || 0);
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

function renderIssueMeta(report, filteredIssues) {
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
    stateEl.findingsHeadline.textContent = "No issues for the active filter. Either the report is clean or this severity band is empty.";
    return;
  }

  stateEl.findingsHeadline.textContent = `Top visible finding: ${lead.group}${lead.action ? ` via "${lead.action}"` : ""}. Fix this band before moving down.`;
}

function renderIssueGroups(report, filteredIssues) {
  if (!report || !filteredIssues.length) {
    stateEl.issueGroupGrid.innerHTML = '<article class="empty-state">No findings loaded yet.</article>';
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
              <div class="history-meta">buttons discovered ${route.buttonsDiscovered} | buttons clicked ${route.buttonsClicked}</div>
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
              <div class="history-meta">${escapeHtml(action.route)}${action.kind ? ` | ${escapeHtml(action.kind)}` : ""}</div>
            </div>
            <span class="pill">${escapeHtml(action.statusLabel || action.status || "mapped")}</span>
          </div>
          <code>${escapeHtml(action.expectedForUser || action.expectedFunction || "Expected behavior not described in this run.")}</code>
          <div class="history-copy">${escapeHtml(action.actualFunction || action.detail || "No actual behavior captured for this action.")}</div>
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
            <div class="history-meta">${escapeHtml(issue.route)}${issue.action ? ` | ${escapeHtml(issue.action)}` : ""}</div>
          </div>
          <span class="severity-pill severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
        </div>
        <div class="history-copy">${escapeHtml(issue.detail)}</div>
      </article>
    `)
    .join("");
}

function renderComparison(report) {
  if (!report) {
    stateEl.compareHeadline.textContent = "Run two audits to unlock comparison.";
    stateEl.compareIssueDelta.textContent = "n/a";
    stateEl.compareSeoDelta.textContent = "n/a";
    stateEl.compareRiskDelta.textContent = "n/a";
    stateEl.compareRouteDelta.textContent = "n/a";
    stateEl.compareActionDelta.textContent = "n/a";
    renderCompareIssueList(stateEl.compareNewIssuesList, [], "No comparison baseline yet.");
    renderCompareIssueList(stateEl.compareResolvedIssuesList, [], "No comparison baseline yet.");
    return;
  }

  const reference = getReferenceSnapshot(report);
  if (!reference?.snapshot?.report) {
    stateEl.compareHeadline.textContent = "Pin a baseline or keep two runs in history to compare drift.";
    stateEl.compareIssueDelta.textContent = "n/a";
    stateEl.compareSeoDelta.textContent = "n/a";
    stateEl.compareRiskDelta.textContent = "n/a";
    stateEl.compareRouteDelta.textContent = "n/a";
    stateEl.compareActionDelta.textContent = "n/a";
    renderCompareIssueList(stateEl.compareNewIssuesList, [], "No baseline is available yet.");
    renderCompareIssueList(stateEl.compareResolvedIssuesList, [], "No baseline is available yet.");
    return;
  }

  const comparison = compareReports(report, reference.snapshot.report);
  stateEl.compareHeadline.textContent = `Comparing current run against ${reference.label}.`;
  stateEl.compareIssueDelta.textContent = signedDelta(comparison.issueDelta);
  stateEl.compareSeoDelta.textContent = signedDelta(comparison.seoDelta);
  stateEl.compareRiskDelta.textContent = signedDelta(comparison.riskDelta);
  stateEl.compareRouteDelta.textContent = signedDelta(comparison.routeDelta);
  stateEl.compareActionDelta.textContent = signedDelta(comparison.actionDelta);
  renderCompareIssueList(stateEl.compareNewIssuesList, comparison.newIssues, "No new findings versus the reference run.");
  renderCompareIssueList(stateEl.compareResolvedIssuesList, comparison.resolvedIssues, "No findings were cleared versus the reference run.");
}

function buildIssueCard(issue, actionContext) {
  const priority = issue.assistantHint?.priority ? `<span class="pill">${escapeHtml(issue.assistantHint.priority)}</span>` : "";
  const firstChecks = Array.isArray(issue.assistantHint?.firstChecks) ? issue.assistantHint.firstChecks.slice(0, 3) : [];
  const shouldDo = actionContext?.expectedForUser || actionContext?.expectedFunction || issue.diagnosis.laymanExplanation || "The flow should complete the expected action without breaking.";
  const actualDid = actionContext?.actualFunction || issue.detail;
  const whyItMatters = issue.diagnosis.laymanExplanation || issue.diagnosis.technicalExplanation || "This issue can reduce trust, break navigation or hide failures from operators.";
  const technicalLead = issue.diagnosis.technicalChecks[0] || issue.diagnosis.likelyAreas[0] || "";
  const commands = issue.diagnosis.commandHints.slice(0, 2);

  return `
    <article class="issue-card">
      <div class="issue-top">
        <div>
          <p class="issue-title">${escapeHtml(issue.group)}</p>
          <div class="issue-route">${escapeHtml(issue.route)}${issue.action ? ` -> ${escapeHtml(issue.action)}` : ""}</div>
        </div>
        <div class="issue-meta">
          ${priority}
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
    </article>
  `;
}

function renderIssues(report) {
  if (!report) {
    stateEl.issuesList.innerHTML = '<article class="empty-state">No report loaded yet. Run the engine to populate the board.</article>';
    renderIssueMeta(null, []);
    renderIssueGroups(null, []);
    return;
  }

  const filteredIssues = getFilteredIssues(report);
  renderIssueMeta(report, filteredIssues);
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

function renderReportSummary(report) {
  if (!report) {
    stateEl.currentTarget.textContent = "none";
    stateEl.currentMode.textContent = uiState.mode;
    stateEl.currentScope.textContent = uiState.scope;
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
  stateEl.currentMode.textContent = reportMode;
  stateEl.currentScope.textContent = report.summary.auditScope || audit.scope || uiState.scope;
  stateEl.currentDepth.textContent = currentDepthLabel(reportDepth);
  stateEl.currentDuration.textContent = formatDuration(audit.durationMs || report.summary.durationMs || 0);
  stateEl.currentCommand.textContent = audit.lastCommand || report.meta.replayCommand || report.assistantGuide.replayCommand || "Run an audit to generate a replay command.";
  stateEl.reportsHeadline.textContent = `${uiState.history.length} stored snapshot${uiState.history.length === 1 ? "" : "s"} | last run ${formatLocalDate(report.meta.generatedAt)}`;
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
              <div class="history-meta">${escapeHtml(formatLocalDate(item.stamp))} | ${escapeHtml(item.mode || "desktop")} | scope ${escapeHtml(item.scope)} | ${escapeHtml(currentDepthLabel(item.depth || "signal"))} | risk ${escapeHtml(String(item.risk))}</div>
            </div>
            <div class="issue-meta">
              <span class="pill">${escapeHtml(`${item.issueCount} issues`)}</span>
              <span class="pill ok">${escapeHtml(`SEO ${item.seoScore}`)}</span>
            </div>
          </div>
          <p class="history-copy">${topIssue ? escapeHtml(`${topIssue.code}${topIssue.action ? ` | ${topIssue.action}` : ""} | ${topIssue.detail}`) : "Clean run snapshot."}</p>
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
    { id: "copy-compare", label: "Copy compare digest", hint: "", description: "Copy the current delta summary against baseline.", action: () => copyText(buildCompareDigest(uiState.report), "[studio] comparison digest copied.") },
    { id: "copy-prompt", label: "Copy fix prompt", hint: "", description: "Copy the current professional fix prompt.", action: () => copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied.") },
    { id: "switch-overview", label: "Go to overview", hint: "Ctrl+1", description: "Open mission control and execution profile.", action: () => switchView("overview") },
    { id: "switch-findings", label: "Go to findings", hint: "Ctrl+2", description: "Open the issue board and filters.", action: () => switchView("findings") },
    { id: "switch-reports", label: "Go to reports", hint: "Ctrl+3", description: "Open evidence, comparison and history.", action: () => switchView("reports") },
    { id: "switch-settings", label: "Go to settings", hint: "Ctrl+4", description: "Open engine controls and paths.", action: () => switchView("settings") },
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
  const busy = audit.running === true;

  stateEl.auditStatus.textContent = status;
  stateEl.runAudit.disabled = busy;
  stateEl.runCmd.disabled = busy;
  stateEl.quickAuditButton.disabled = busy;
  stateEl.deepAuditButton.disabled = busy;
  stateEl.startBridge.disabled = busy || uiState.companionState?.bridge?.running === true;
  stateEl.stopBridge.disabled = busy || uiState.companionState?.bridge?.running !== true;
  stateEl.runAudit.textContent = busy ? "Audit running..." : "Run native audit";

  if (busy) {
    setChip(stateEl.auditChip, "audit running", "warn");
    stateEl.headlineStatus.textContent = `Engine is auditing ${audit.baseUrl || "the selected target"}. Evidence is being collected now.`;
    return;
  }

  if (status === "failed") {
    setChip(stateEl.auditChip, "audit failed", "bad");
    stateEl.headlineStatus.textContent = audit.lastError || "The engine failed to complete the run.";
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
  renderMissionBrief();
  renderReportSummary(uiState.report);
}

function renderAllReportState(report) {
  uiState.report = report;
  renderMetrics(report);
  renderSignals(report);
  renderSteps(report);
  renderRouteFilterOptions(report);
  renderIssues(report);
  renderCoverageExplorers(report);
  renderPrompt(report);
  renderReportSummary(report);
  renderComparison(report);
  renderMissionBrief();
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
  if (payload.usedFallback === true) {
    appendLog("[studio] run completed with fallback mode active.");
    showToast("Audit finished with fallback mode active.", "warn");
  }
  showToast(report.summary.totalIssues > 0 ? "Audit finished with findings." : "Audit finished clean.", report.summary.totalIssues > 0 ? "warn" : "ok");
  switchView(report.summary.totalIssues > 0 ? "findings" : "reports");
}

async function openCmdWindow() {
  const input = collectRunInput(true);
  if (!input.baseUrl) {
    stateEl.headlineStatus.textContent = "Target URL is required before opening the CMD flow.";
    showToast("Target URL is required before opening CMD.", "warn");
    return;
  }

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
  if (!uiState.report) {
    showToast("No report is loaded yet.", "warn");
    return;
  }

  const payload = await window.sitePulseCompanion.exportReportFile(uiState.report);
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
  const result = await window.sitePulseCompanion.openLatestEvidence();
  if (!result?.ok) {
    appendLog(`[studio] latest evidence unavailable: ${result?.detail || result?.error || "unknown"}`);
    showToast("No recent evidence file was found.", "warn");
    return;
  }

  appendLog(`[studio] latest evidence opened from ${result.path}`);
  showToast("Latest evidence opened in Explorer.", "ok");
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
  renderComparison(uiState.report);
  appendLog(`[studio] baseline pinned from ${snapshot.baseUrl} at ${snapshot.stamp}`);
  showToast("Current report pinned as comparison baseline.", "ok");
}

function clearBaseline() {
  persistBaseline(null);
  renderHistory();
  renderComparison(uiState.report);
  appendLog("[studio] comparison baseline cleared.");
  showToast("Comparison baseline cleared.", "warn");
}

function applyPresetFirstAudit() {
  uiState.mode = "desktop";
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
      renderIssues(uiState.report);
    });
  });

  stateEl.findingsSearch.addEventListener("input", () => {
    uiState.findingsSearch = stateEl.findingsSearch.value.trim();
    renderIssues(uiState.report);
  });

  stateEl.findingsRouteFilter.addEventListener("change", () => {
    uiState.findingsRoute = stateEl.findingsRouteFilter.value || "all";
    renderIssues(uiState.report);
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
}

function bindButtons() {
  stateEl.runAudit.addEventListener("click", async () => handleAuditRun());
  stateEl.quickAuditButton.addEventListener("click", async () => handleAuditRun("signal"));
  stateEl.deepAuditButton.addEventListener("click", async () => handleAuditRun("deep"));
  stateEl.runCmd.addEventListener("click", openCmdWindow);
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
  stateEl.copyIssueDigest.addEventListener("click", async () => copyText(buildIssueDigest(uiState.report), "[studio] issue digest copied."));
  stateEl.copyRouteDigest.addEventListener("click", async () => copyText(buildRouteDigest(uiState.report), "[studio] route digest copied."));
  stateEl.copyActionDigest.addEventListener("click", async () => copyText(buildActionDigest(uiState.report), "[studio] action digest copied."));
  stateEl.copyCompareDigest.addEventListener("click", async () => copyText(buildCompareDigest(uiState.report), "[studio] comparison digest copied."));
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
  stateEl.revealOnboarding.addEventListener("click", () => {
    persistOnboardingState(false);
    renderOnboarding();
  });
  stateEl.dismissOnboarding.addEventListener("click", () => {
    persistOnboardingState(true);
    renderOnboarding();
  });
  stateEl.startTourAudit.addEventListener("click", applyPresetFirstAudit);
  stateEl.openShortcuts.addEventListener("click", () => toggleShortcutsOverlay());
  stateEl.openCommandPalette.addEventListener("click", () => toggleCommandPalette());
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
  stateEl.commandPaletteList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-command-id]");
    if (!(button instanceof HTMLElement)) return;
    await executeCommandPaletteAction(button.dataset.commandId);
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
      renderComparison(uiState.report);
      appendLog(`[studio] baseline set from history snapshot ${snapshot.baseUrl}.`);
      showToast("History snapshot set as baseline.", "ok");
      return;
    }
    renderAllReportState(snapshot.report);
    switchView("reports");
    appendLog(`[studio] loaded snapshot ${snapshot.baseUrl} from history.`);
    showToast("Stored snapshot loaded.", "ok");
  });
}

function bindKeyboardShortcuts() {
  document.addEventListener("keydown", async (event) => {
    const target = event.target;
    const targetTag = target instanceof HTMLElement ? target.tagName : "";
    const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || targetTag === "SELECT";

    if (event.key === "Escape") {
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

    if (event.ctrlKey && !event.shiftKey && ["1", "2", "3", "4"].includes(event.key)) {
      event.preventDefault();
      const map = {
        "1": "overview",
        "2": "findings",
        "3": "reports",
        "4": "settings",
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

  window.sitePulseCompanion.onWindowState((payload) => {
    stateEl.winMaximize.textContent = payload?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  });
}

async function bootstrap() {
  restoreProfile();
  renderStaticSelections();
  renderOnboarding();

  const savedReport = restoreLastReport();
  if (savedReport) {
    renderAllReportState(savedReport);
  } else {
    renderAllReportState(null);
  }
  renderHistory();
  renderLogs();
  renderCommandPalette();
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
}

bootstrap().catch((error) => {
  appendLog(`[studio] bootstrap failed: ${error?.message || error}`);
});
