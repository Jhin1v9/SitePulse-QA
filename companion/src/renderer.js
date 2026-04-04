import { inferIntent } from "./ai/intent/intentEngine.js";
import { buildContextSnapshot } from "./ai/context/contextEngine.js";
import { buildEvidenceResult } from "./ai/evidence/evidenceEngine.js";
import { buildPatternMemory } from "./ai/memory/memoryEngine.js";
import { buildLearningSnapshot } from "./ai/learning/learningEngine.js";
import { buildPredictiveState } from "./ai/predictive/predictiveEngine.js";
import { buildDecisionPlan } from "./ai/decision/decisionEngine.js";
import { buildInvestigationPlan } from "./ai/investigation/investigationPlanner.js";
import { checkAutonomy } from "./ai/autonomy/autonomyGovernance.js";
import { canExecute } from "./ai/supervisor/executionSupervisor.js";
import { executeActionStep } from "./ai/action/actionEngine.js";
import { initWorkspaceSystem } from "./workspace-system/index.js";

const STORAGE_KEYS = {
  lastReport: "sitepulse-studio:last-report-v1",
  lastProfile: "sitepulse-studio:last-profile-v1",
  runHistory: "sitepulse-studio:run-history-v1",
  onboarding: "sitepulse-studio:onboarding-v1",
  baseline: "sitepulse-studio:baseline-v1",
  assistantConversation: "sitepulse-studio:assistant-conversation-v1",
  assistantConversationList: "sitepulse-studio:assistant-conversation-list-v1",
  assistantConversationMessages: "sitepulse-studio:assistant-conversation-messages-v1",
  assistantCurrentConversationId: "sitepulse-studio:assistant-current-conversation-id-v1",
  assistantSavedPrompts: "sitepulse-studio:assistant-saved-prompts-v1",
  assistantWorkspaceUI: "sitepulse-studio:assistant-workspace-ui-v1",
};

const WORKSPACE_SYSTEM_FLAG_KEY = "sitepulse:workspace-system:enabled";
const WORKSPACE_PHASE1_KEY = "sitepulse:workspace-phase1";
let workspaceSystemManager = null;

/** Mapa completo (operator/seo/compare/…) — flag legacy `workspace-system:enabled` ou ?workspaceSystem=1 */
function isLegacyWorkspaceFullEnabled() {
  const fromWindow = window.__SITEPULSE_ENABLE_WORKSPACE_SYSTEM__ === true;
  const fromWindowOff = window.__SITEPULSE_ENABLE_WORKSPACE_SYSTEM__ === false;
  const fromQueryOff = new URLSearchParams(window.location.search).get("workspaceSystem") === "0";
  const fromQuery = new URLSearchParams(window.location.search).get("workspaceSystem") === "1";
  const fromStorage = window.localStorage?.getItem(WORKSPACE_SYSTEM_FLAG_KEY) === "1";
  const fromStorageOff = window.localStorage?.getItem(WORKSPACE_SYSTEM_FLAG_KEY) === "0";
  if (fromWindowOff || fromQueryOff || fromStorageOff) return false;
  if (fromWindow || fromQuery || fromStorage) return true;
  return false;
}

/** Fase 1: apenas Settings + Findings como workspaces independentes (init lazy). */
function isWorkspacePhase1Enabled() {
  const fromWindowOff = window.__SITEPULSE_WORKSPACE_PHASE1__ === false;
  const fromQueryOff = new URLSearchParams(window.location.search).get("workspacePhase1") === "0";
  const fromStorageOff = window.localStorage?.getItem(WORKSPACE_PHASE1_KEY) === "0";
  if (fromWindowOff || fromQueryOff || fromStorageOff) return false;
  const fromWindow = window.__SITEPULSE_WORKSPACE_PHASE1__ === true;
  const fromQuery = new URLSearchParams(window.location.search).get("workspacePhase1") === "1";
  const fromStorage = window.localStorage?.getItem(WORKSPACE_PHASE1_KEY) === "1";
  if (fromWindow || fromQuery || fromStorage) return true;
  return false;
}

function isWorkspaceSystemEnabled() {
  return isLegacyWorkspaceFullEnabled() || isWorkspacePhase1Enabled();
}

function maybeInitWorkspaceSystem() {
  if (!isWorkspaceSystemEnabled()) return null;
  if (workspaceSystemManager) return workspaceSystemManager;
  try {
    const phase1Only = isWorkspacePhase1Enabled() && !isLegacyWorkspaceFullEnabled();
    workspaceSystemManager = initWorkspaceSystem({
      defaultWorkspace: phase1Only ? null : "operator",
      skipInitialSwitch: phase1Only,
    });
    if (phase1Only) {
      setWorkspaceHostVisible(false);
      appendLog("[workspace-system] phase1 (Settings + Findings) — lazy init, Control Center visível até navegar.");
    } else {
      appendLog("[workspace-system] full map enabled.");
    }
    return workspaceSystemManager;
  } catch (error) {
    appendLog(`[workspace-system] init failed: ${error?.message || error}`);
    return null;
  }
}

function mapViewToWorkspace(viewName) {
  if (!isWorkspaceSystemEnabled()) return "";
  const view = String(viewName || "").toLowerCase();
  if (isWorkspacePhase1Enabled() && !isLegacyWorkspaceFullEnabled()) {
    if (view === "settings") return "settings";
    if (view === "findings") return "findings";
    return "";
  }
  if (view === "settings") return "settings";
  if (view === "overview" || view === "operator") return "operator";
  if (view === "findings") return "findings";
  if (view === "seo") return "seo";
  if (view === "compare") return "compare";
  return "";
}

function setWorkspaceHostVisible(isVisible) {
  const host = document.getElementById("workspace-host");
  if (!host) return;
  // Tailwind `.hidden` — toggle class so visibility matches intent (inline "" would not override .hidden).
  host.classList.toggle("hidden", !isVisible);
}

const ISSUE_GROUP = {
  ROUTE_LOAD_FAIL: "Route load failure",
  BTN_CLICK_ERROR: "Action failed",
  BTN_NO_EFFECT: "No visible effect",
  HTTP_4XX: "Client request failure",
  HTTP_5XX: "Server request failure",
  NET_REQUEST_FAILED: "Network failure",
  JS_RUNTIME_ERROR: "Runtime JavaScript failure",
  CONSOLE_ERROR: "Console error",
  CONTENT_LANGUAGE_CONFLICT: "Language conflict",
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
  VISUAL_HIERARCHY_COLLAPSE: "Hierarchy collapse",
  VISUAL_CLUSTER_COLLISION: "Cluster collision",
};

const DEFAULT_TARGET = "https://example.com";
const HISTORY_TOTAL_LIMIT = 12;
const HISTORY_PER_TARGET_LIMIT = 6;
const HISTORY_COMPARABLE_LIMIT = 8;
const HISTORY_RECURRENCE_LIMIT = 6;
const CONVERSATION_LIST_LIMIT = 50;
const CONVERSATION_MESSAGE_LIMIT = 100;

const VIEW_META = {
  overview: {
    eyebrow: "operational control",
    title: "Control Center",
    description: "System state, priority queue and next action. Mission status, run history, Do next.",
  },
  preview: {
    eyebrow: "preview",
    title: "Preview",
    description: "Embedded target surface. Aligned with current route when headed.",
  },
  operations: {
    eyebrow: "live operations",
    title: "Operations",
    description: "Engine progress, live protocol, stage evidence and runtime logs.",
  },
  findings: {
    eyebrow: "fix sequence",
    title: "Findings",
    description: "Triaging, route coverage and action intent. Work the queue.",
  },
  seo: {
    eyebrow: "search performance",
    title: "SEO",
    description: "Search diagnostics, score deltas and priority recommendations.",
  },
  prompts: {
    eyebrow: "operator prompts",
    title: "Prompts",
    description: "Fix prompts, replay commands and digests. Copy and reuse.",
  },
  compare: {
    eyebrow: "comparison room",
    title: "Compare",
    description: "What improved, regressed or unresolved vs baseline.",
  },
  reports: {
    eyebrow: "evidence room",
    title: "Reports",
    description: "Proof, route sheets and run history. Evidence package.",
  },
  settings: {
    eyebrow: "system controls",
    title: "Settings",
    description: "Runtime paths, engine lifecycle and workstation policy.",
  },
};

const WORKSPACE_HELP = {
  overview: {
    title: "Overview",
    description: "Use this surface to define the target, choose scope and depth, then hand the run to the native engine or CMD flow.",
    steps: [
      "Set the target URL and execution profile before starting a run.",
      "Use Native Audit for the default engine flow and CMD Flow when you need the full local replay path.",
      "Copy the replay command when you want to revalidate after a fix.",
    ],
    actions: [{ id: "switch-overview", label: "Stay on overview" }],
  },
  operations: {
    title: "Operations",
    description: "This is the live execution room. Follow the timeline, stage board and runtime log while the engine moves across routes and actions.",
    steps: [
      "Use the live protocol to see what the engine is checking right now.",
      "Watch the stage board for route discovery, loading and runtime boot checkpoints.",
      "When something fails, open logs first before jumping into prompts.",
    ],
    actions: [{ id: "switch-operations", label: "Open operations" }],
  },
  findings: {
    title: "Findings",
    description: "This board is the fix queue. Filter severity, search by route/action/code and inspect the learning memory attached to each issue.",
    steps: [
      "Start with high severity items and issues without validated memory.",
      "Use the learning block on each card to see validated patterns or failed attempts.",
      "Promote a final solution manually only when you can justify it.",
    ],
    actions: [{ id: "switch-findings", label: "Open findings" }],
  },
  seo: {
    title: "SEO",
    description: "This workspace combines internal SEO diagnostics with optional Search Console data.",
    steps: [
      "Use the internal SEO score and recommendation list first.",
      "Refresh Google data only when you need live position, clicks and impressions.",
      "Copy the SEO digest when you want a compact search-focused brief.",
    ],
    actions: [{ id: "switch-seo", label: "Open SEO" }],
  },
  prompts: {
    title: "Prompt Workspace",
    description: "This workspace turns the current report into reusable prompts, digests and replay commands.",
    steps: [
      "Use the professional fix prompt for Codex or another coding agent.",
      "Use comparison, route and action digests when you need narrower operational context.",
      "The fix prompt is memory-aware and will cite validated and failed patterns when they exist.",
    ],
    actions: [{ id: "switch-prompts", label: "Open prompts" }],
  },
  compare: {
    title: "Compare",
    description: "Use this surface to understand what improved, what regressed and what is still unresolved versus baseline or previous run.",
    steps: [
      "Pin a clean baseline from Reports or History first.",
      "Read critical regressions before looking at raw issue delta.",
      "Use the compare digest when you need a concise summary for another engineer.",
    ],
    actions: [{ id: "switch-compare", label: "Open compare" }],
  },
  reports: {
    title: "Reports",
    description: "This room keeps evidence, route contact sheets and stored snapshots for replay and review.",
    steps: [
      "Use History to load a previous snapshot or set a baseline.",
      "Open evidence or reveal artifacts when you need proof for a fix or a client discussion.",
      "This is the fastest way to recover context from an earlier run.",
    ],
    actions: [{ id: "switch-reports", label: "Open reports" }],
  },
  settings: {
    title: "Settings",
    description: "This is where runtime policy, updates and operational memory live.",
    steps: [
      "Use Validated Learnings to inspect patterns that already worked or failed before.",
      "Apply manual override only when you want to mark a resolution deliberately with traceability.",
      "Use filters to isolate failed, validated, partial, auto-promoted or manual patterns.",
    ],
    actions: [{ id: "switch-settings", label: "Open settings" }],
  },
};

const stateEl = {
  serviceName: document.getElementById("serviceName"),
  bridgeStatus: document.getElementById("bridgeStatus"),
  auditStatus: document.getElementById("auditStatus"),
  versionText: document.getElementById("versionText"),
  runtimePath: document.getElementById("runtimePath"),
  reportsPath: document.getElementById("reportsPath"),
  learningMemorySummary: document.getElementById("learningMemorySummary"),
  learningMemoryList: document.getElementById("learningMemoryList"),
  learningMemoryStatusFilter: document.getElementById("learningMemoryStatusFilter"),
  learningMemoryIssueFilter: document.getElementById("learningMemoryIssueFilter"),
  learningMemoryCategoryFilter: document.getElementById("learningMemoryCategoryFilter"),
  learningMemorySeverityFilter: document.getElementById("learningMemorySeverityFilter"),
  learningMemorySourceFilter: document.getElementById("learningMemorySourceFilter"),
  learningMemorySort: document.getElementById("learningMemorySort"),
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
  appBody: document.getElementById("appBody"),
  mainGrid: document.getElementById("mainGrid"),
  operatorBelowSticky: document.getElementById("operatorBelowSticky"),
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
  doNext: document.getElementById("doNext"),
  runAudit: document.getElementById("runAudit"),
  runAuditOverview: document.getElementById("runAuditOverview"),
  runCmd: document.getElementById("runCmd"),
  copyReplayCommand: document.getElementById("copyReplayCommand"),
  copyQuickPrompt: document.getElementById("copyQuickPrompt"),
  copyQuickPromptSecondary: document.getElementById("copyQuickPromptSecondary"),
  openAssistant: document.getElementById("openAssistant"),
  openCommandPalette: document.getElementById("openCommandPalette"),
  topbarContext: document.getElementById("topbarContext"),
  runAuditTopbar: document.getElementById("runAuditTopbar"),
  loadReportTopbar: document.getElementById("loadReportTopbar"),
  menuFlyout: document.getElementById("menuFlyout"),
  workspaceEyebrow: document.getElementById("workspaceEyebrow"),
  workspaceTitle: document.getElementById("workspaceTitle"),
  workspaceDescription: document.getElementById("workspaceDescription"),
  workspaceHeader: document.getElementById("workspaceHeader"),
  workspaceShell: document.getElementById("workspaceShell"),
  workspaceSummary: document.getElementById("workspaceSummary"),
  engineSummaryStrip: document.getElementById("engineSummaryStrip"),
  headlineStatus: document.getElementById("headlineStatus"),
  auditProgressLabel: document.getElementById("auditProgressLabel"),
  auditProgressPercent: document.getElementById("auditProgressPercent"),
  auditProgressCounters: document.getElementById("auditProgressCounters"),
  auditProgressElapsed: document.getElementById("auditProgressElapsed"),
  auditProgressEta: document.getElementById("auditProgressEta"),
  auditProgressPace: document.getElementById("auditProgressPace"),
  auditProgressFill: document.getElementById("auditProgressFill"),
  auditProgressDetail: document.getElementById("auditProgressDetail"),
  timelineHeadline: document.getElementById("timelineHeadline"),
  timelineList: document.getElementById("timelineList"),
  stageBoard: document.getElementById("stageBoard"),
  findingsHeadline: document.getElementById("findingsHeadline"),
  reportsHeadline: document.getElementById("reportsHeadline"),
  findingsSearch: document.getElementById("findingsSearch"),
  findingsRouteFilter: document.getElementById("findingsRouteFilter"),
  findingsQualityFilter: document.getElementById("findingsQualityFilter"),
  findingsPriorityFilter: document.getElementById("findingsPriorityFilter"),
  findingsPredictiveRiskFilter: document.getElementById("findingsPredictiveRiskFilter"),
  findingsTrajectoryFilter: document.getElementById("findingsTrajectoryFilter"),
  findingsHealingFilter: document.getElementById("findingsHealingFilter"),
  findingsMemoryFilter: document.getElementById("findingsMemoryFilter"),
  findingsResolutionFilter: document.getElementById("findingsResolutionFilter"),
  findingsImpactFilter: document.getElementById("findingsImpactFilter"),
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
  visualHierarchyCount: document.getElementById("visualHierarchyCount"),
  visualClusterCount: document.getElementById("visualClusterCount"),
  visualSectionsCount: document.getElementById("visualSectionsCount"),
  visualQualityHeadline: document.getElementById("visualQualityHeadline"),
  visualQualityDetail: document.getElementById("visualQualityDetail"),
  stepsList: document.getElementById("stepsList"),
  executiveSummaryHeadline: document.getElementById("executiveSummaryHeadline"),
  executivePriorityP0: document.getElementById("executivePriorityP0"),
  executivePriorityP1: document.getElementById("executivePriorityP1"),
  executivePriorityP2: document.getElementById("executivePriorityP2"),
  executiveQualityScore: document.getElementById("executiveQualityScore"),
  executiveQualityTrajectory: document.getElementById("executiveQualityTrajectory"),
  executiveTrendSeo: document.getElementById("executiveTrendSeo"),
  executiveTrendRuntime: document.getElementById("executiveTrendRuntime"),
  executiveTrendUx: document.getElementById("executiveTrendUx"),
  executivePredictiveHighRisk: document.getElementById("executivePredictiveHighRisk"),
  executivePredictiveRecurring: document.getElementById("executivePredictiveRecurring"),
  executiveSummaryTopRisks: document.getElementById("executiveSummaryTopRisks"),
  executiveSummaryTopOpportunities: document.getElementById("executiveSummaryTopOpportunities"),
  executiveSummaryActionOrder: document.getElementById("executiveSummaryActionOrder"),
  executiveSummaryPatterns: document.getElementById("executiveSummaryPatterns"),
  executiveSummaryPredictiveAlerts: document.getElementById("executiveSummaryPredictiveAlerts"),
  qualityDashboardHeadline: document.getElementById("qualityDashboardHeadline"),
  qualityDashboardOverall: document.getElementById("qualityDashboardOverall"),
  qualityDashboardSeo: document.getElementById("qualityDashboardSeo"),
  qualityDashboardUx: document.getElementById("qualityDashboardUx"),
  qualityDashboardPerformance: document.getElementById("qualityDashboardPerformance"),
  qualityDashboardTechnical: document.getElementById("qualityDashboardTechnical"),
  qualityDashboardVisual: document.getElementById("qualityDashboardVisual"),
  qualityTimelineHeadline: document.getElementById("qualityTimelineHeadline"),
  qualityTimelineList: document.getElementById("qualityTimelineList"),
  riskMapHeadline: document.getElementById("riskMapHeadline"),
  riskMapSeo: document.getElementById("riskMapSeo"),
  riskMapUx: document.getElementById("riskMapUx"),
  riskMapPerformance: document.getElementById("riskMapPerformance"),
  riskMapTechnical: document.getElementById("riskMapTechnical"),
  priorityViewHeadline: document.getElementById("priorityViewHeadline"),
  priorityViewList: document.getElementById("priorityViewList"),
  priorityQueueTableBody: document.getElementById("priorityQueueTableBody"),
  runHistoryTableBody: document.getElementById("runHistoryTableBody"),
  systemStateIssues: document.getElementById("systemStateIssues"),
  systemStateMemory: document.getElementById("systemStateMemory"),
  systemStateHealingReady: document.getElementById("systemStateHealingReady"),
  systemStatePredictiveAlerts: document.getElementById("systemStatePredictiveAlerts"),
  systemStateOptimization: document.getElementById("systemStateOptimization"),
  systemStateTrajectory: document.getElementById("systemStateTrajectory"),
  nextActionDescription: document.getElementById("nextActionDescription"),
  nextActionOpenIssue: document.getElementById("nextActionOpenIssue"),
  nextActionPrepareHealing: document.getElementById("nextActionPrepareHealing"),
  nextActionGeneratePrompt: document.getElementById("nextActionGeneratePrompt"),
  optimizationHeadline: document.getElementById("optimizationHeadline"),
  optimizationTopImprovements: document.getElementById("optimizationTopImprovements"),
  optimizationClusters: document.getElementById("optimizationClusters"),
  qualityControlHeadline: document.getElementById("qualityControlHeadline"),
  qualityControlFalsePositives: document.getElementById("qualityControlFalsePositives"),
  qualityControlInconsistencies: document.getElementById("qualityControlInconsistencies"),
  qualityControlWarnings: document.getElementById("qualityControlWarnings"),
  qualityControlWarningsList: document.getElementById("qualityControlWarningsList"),
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
  seoExternalHeadline: document.getElementById("seoExternalHeadline"),
  seoExternalDetail: document.getElementById("seoExternalDetail"),
  seoPropertyInput: document.getElementById("seoPropertyInput"),
  seoAccessTokenInput: document.getElementById("seoAccessTokenInput"),
  seoLookbackDaysInput: document.getElementById("seoLookbackDaysInput"),
  refreshSeoSource: document.getElementById("refreshSeoSource"),
  saveSeoSource: document.getElementById("saveSeoSource"),
  updateCurrentVersion: document.getElementById("updateCurrentVersion"),
  updateRemoteVersion: document.getElementById("updateRemoteVersion"),
  updateStatusLabel: document.getElementById("updateStatusLabel"),
  updateProgressLabel: document.getElementById("updateProgressLabel"),
  updateDetailBox: document.getElementById("updateDetailBox"),
  checkForUpdates: document.getElementById("checkForUpdates"),
  downloadUpdate: document.getElementById("downloadUpdate"),
  installUpdate: document.getElementById("installUpdate"),
  googlePosition: document.getElementById("googlePosition"),
  googleClicks: document.getElementById("googleClicks"),
  googleImpressions: document.getElementById("googleImpressions"),
  googleCtr: document.getElementById("googleCtr"),
  googleTopQuery: document.getElementById("googleTopQuery"),
  googleTopPage: document.getElementById("googleTopPage"),
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
  selfHealingSummary: document.getElementById("selfHealingSummary"),
  selfHealingList: document.getElementById("selfHealingList"),
  copySelfHealingSummary: document.getElementById("copySelfHealingSummary"),
  autonomousQaSummary: document.getElementById("autonomousQaSummary"),
  autonomousQaLoop: document.getElementById("autonomousQaLoop"),
  copyAutonomousSummary: document.getElementById("copyAutonomousSummary"),
  copyAutonomousLoop: document.getElementById("copyAutonomousLoop"),
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
  baselineIndicator: document.getElementById("baselineIndicator"),
  baselineIndicatorWrap: document.getElementById("baselineIndicatorWrap"),
  compactRunHistory: document.getElementById("compactRunHistory"),
  compactRunHistoryWrap: document.getElementById("compactRunHistoryWrap"),
  clearLog: document.getElementById("clearLog"),
  logOutput: document.getElementById("logOutput"),
  openShortcuts: document.getElementById("openShortcuts"),
  winMinimize: document.getElementById("winMinimize"),
  winMaximize: document.getElementById("winMaximize"),
  winClose: document.getElementById("winClose"),
  bridgeMissingBanner: document.getElementById("bridgeMissingBanner"),
  engineOfflineBanner: document.getElementById("engineOfflineBanner"),
  engineOfflineGoSettings: document.getElementById("engineOfflineGoSettings"),
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
  assistantWorkspace: document.getElementById("assistantWorkspace"),
  dismissAssistant: document.getElementById("dismissAssistant"),
  assistantExpand: document.getElementById("assistantExpand"),
  assistantFocus: document.getElementById("assistantFocus"),
  assistantBackToDock: document.getElementById("assistantBackToDock"),
  assistantDockResizeHandle: document.getElementById("assistantDockResizeHandle"),
  assistantEyebrow: document.getElementById("assistantEyebrow"),
  assistantTitle: document.getElementById("assistantTitle"),
  assistantContextPills: document.getElementById("assistantContextPills"),
  assistantInput: document.getElementById("assistantInput"),
  assistantInputLabel: document.getElementById("assistantInputLabel"),
  assistantAsk: document.getElementById("assistantAsk"),
  assistantQuickPriorities: document.getElementById("assistantQuickPriorities"),
  assistantQuickSeo: document.getElementById("assistantQuickSeo"),
  assistantQuickPrompt: document.getElementById("assistantQuickPrompt"),
  assistantQuickGuide: document.getElementById("assistantQuickGuide"),
  assistantQuickStartEngine: document.getElementById("assistantQuickStartEngine"),
  assistantContextSummary: document.getElementById("assistantContextSummary"),
  assistantModePill: document.getElementById("assistantModePill"),
  assistantIntentPill: document.getElementById("assistantIntentPill"),
  assistantLanguagePill: document.getElementById("assistantLanguagePill"),
  assistantOperatorStatus: document.getElementById("assistantOperatorStatus"),
  assistantOperatorStatusText: document.getElementById("assistantOperatorStatusText"),
  assistantLanguageLabel: document.getElementById("assistantLanguageLabel"),
  assistantLanguageSelect: document.getElementById("assistantLanguageSelect"),
  assistantModeSummary: document.getElementById("assistantModeSummary"),
  assistantViewButtons: Array.from(document.querySelectorAll("[data-assistant-view]")),
  assistantViewPanels: Array.from(document.querySelectorAll("[data-assistant-view-panel]")),
  assistantInsights: document.getElementById("assistantInsights"),
  assistantResponse: document.getElementById("assistantResponse"),
  assistantChatScroll: document.getElementById("assistantChatScroll"),
  assistantActions: document.getElementById("assistantActions"),
  assistantConsoleContext: document.getElementById("assistantConsoleContext"),
  assistantConsoleRisk: document.getElementById("assistantConsoleRisk"),
  assistantConsolePriority: document.getElementById("assistantConsolePriority"),
  assistantConsoleNextActions: document.getElementById("assistantConsoleNextActions"),
  assistantApplyAction: document.getElementById("assistantApplyAction"),
  assistantPillRun: document.getElementById("assistantPillRun"),
  assistantPillWorkspace: document.getElementById("assistantPillWorkspace"),
  assistantPillFocus: document.getElementById("assistantPillFocus"),
  assistantPillLang: document.getElementById("assistantPillLang"),
  assistantMemorySummary: document.getElementById("assistantMemorySummary"),
  assistantHealingSummary: document.getElementById("assistantHealingSummary"),
  assistantNewChat: document.getElementById("assistantNewChat"),
  assistantConversationSearch: document.getElementById("assistantConversationSearch"),
  assistantConversationList: document.getElementById("assistantConversationList"),
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
  longRunOverlay: document.getElementById("longRunOverlay"),
  dismissLongRunOverlay: document.getElementById("dismissLongRunOverlay"),
  dismissLongRunSecondary: document.getElementById("dismissLongRunSecondary"),
  longRunSummary: document.getElementById("longRunSummary"),
  longRunElapsed: document.getElementById("longRunElapsed"),
  longRunExpected: document.getElementById("longRunExpected"),
  longRunPlan: document.getElementById("longRunPlan"),
  applyFastMode: document.getElementById("applyFastMode"),
  toastStack: document.getElementById("toastStack"),
};

let patternRailController = null;

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
  findingsIntelligenceFilters: {
    quality: "all",
    priority: "all",
    predictiveRisk: "all",
    trajectory: "all",
    healing: "all",
    memory: "all",
    resolution: "all",
    impact: "all",
  },
  history: loadHistory(),
  historyIndexCache: null,
  historyContextCache: null,
  baseline: loadBaseline(),
  onboardingDismissed: loadOnboardingState(),
  shortcutsOpen: false,
  commandPaletteOpen: false,
  assistantOpen: true,
  assistantExpanded: false,
  aiWorkspaceMode: "docked",
  aiDockHeightVh: 55,
  lastNonFocusMode: "docked",
  assistantView: "conversation",
  activeMenu: "",
  commandPaletteQuery: "",
  assistantQuery: "",
  assistantResult: null,
  assistantConversation: loadAssistantConversation(),
  currentConversationId: loadCurrentConversationId(),
  conversationList: loadConversationList(),
  assistantConversationSearch: "",
  assistantSavedPrompts: loadAssistantSavedPrompts(),
  assistantService: null,
  adaptiveLanguageService: null,
  assistantLanguageState: null,
  assistantIntentSnapshot: null,
  assistantContextSnapshot: null,
  assistantDecisionPlan: null,
  lastExecutedStepIntent: null,
  lastAuditRunAt: 0,
  assistantThinkingPhaseIndex: 0,
  assistantThinkingRotationInterval: null,
  learningMemorySnapshot: null,
  learningMemoryRefreshInFlight: false,
  selfHealingSnapshot: null,
  selfHealingRefreshInFlight: false,
  continuousIntelligenceCache: null,
  dataIntelligenceService: null,
  dataIntelligenceCache: null,
  optimizationService: null,
  optimizationCache: null,
  qualityControlService: null,
  qualityControlCache: null,
  predictiveService: null,
  predictiveCache: null,
  autonomousQaService: null,
  autonomousQaCache: null,
  desktopIntelligenceCache: null,
  learningMemoryFilters: {
    status: "all",
    issueCode: "",
    category: "all",
    severity: "all",
    source: "",
    sort: "recent",
  },
  auditRequestInFlight: false,
  activeEvidence: null,
  activeEvidenceReference: null,
  seoSource: {
    property: "",
    hasAccessToken: false,
    lookbackDays: 28,
    lastSyncedAt: "",
    lastError: "",
    snapshot: null,
  },
  preview: {
    requestedUrl: "",
    loadedUrl: "",
    detail: "Enter a target URL to load the embedded preview surface.",
    mode: "idle",
    followAudit: true,
    available: false,
    timerId: 0,
  },
  longRunAdvisor: {
    shownForRunKey: "",
    activeRunKey: "",
    open: false,
  },
  slowWatch: {
    runKey: "",
    routeKey: "",
    routeStartedAtMs: 0,
    routeWarnedKey: "",
    actionKey: "",
    actionStartedAtMs: 0,
    actionWarnedKey: "",
    events: [],
  },
  runtimeTickerId: 0,
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function safeDateValue(value) {
  const stamp = Date.parse(String(value || ""));
  return Number.isFinite(stamp) ? stamp : 0;
}

function normalizeSeoSource(input) {
  const snapshot = input?.snapshot && typeof input.snapshot === "object" ? input.snapshot : null;
  return {
    property: String(input?.property || ""),
    hasAccessToken: input?.hasAccessToken === true,
    lookbackDays: Math.min(90, Math.max(3, toNumber(input?.lookbackDays, 28))),
    lastSyncedAt: String(input?.lastSyncedAt || ""),
    lastError: String(input?.lastError || ""),
    snapshot: snapshot
      ? {
          source: String(snapshot.source || "google-search-console"),
          property: String(snapshot.property || ""),
          startDate: String(snapshot.startDate || ""),
          endDate: String(snapshot.endDate || ""),
          lookbackDays: Math.min(90, Math.max(3, toNumber(snapshot.lookbackDays, 28))),
          clicks: toNumber(snapshot.clicks, 0),
          impressions: toNumber(snapshot.impressions, 0),
          ctr: toNumber(snapshot.ctr, 0),
          position: toNumber(snapshot.position, 0),
          topQuery: String(snapshot.topQuery || ""),
          topQueryClicks: toNumber(snapshot.topQueryClicks, 0),
          topPage: String(snapshot.topPage || ""),
          topPageClicks: toNumber(snapshot.topPageClicks, 0),
          syncedAt: String(snapshot.syncedAt || ""),
        }
      : null,
  };
}

function formatPercent(value) {
  const amount = toNumber(value, 0);
  if (!amount) return "0%";
  return `${(amount * 100).toFixed(2)}%`;
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

function formatDurationWindow(durationMs) {
  const normalized = toNumber(durationMs, 0);
  if (!normalized) return "calibrating";
  return `~${formatDuration(normalized)}`;
}

function toFileSrc(filePath) {
  const value = String(filePath || "").trim();
  if (!value) return "";
  return encodeURI(`file:///${value.replace(/\\/g, "/")}`);
}

function setInputValueIfIdle(element, value) {
  if (!element) return;
  if (document.activeElement === element) return;
  element.value = String(value || "");
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

function classifyRunPace(elapsedMs, estimatedTotalMs) {
  if (!(elapsedMs > 0) || !(estimatedTotalMs > 0)) return "Pace calibrating";
  const ratio = elapsedMs / estimatedTotalMs;
  if (ratio >= 1.2) return "Pace slower than baseline";
  if (ratio <= 0.8) return "Pace ahead of baseline";
  return "Pace on baseline";
}

function getAuditRunKey(audit = {}) {
  return [
    String(audit.baseUrl || "").trim(),
    String(audit.startedAt || "").trim(),
    String(audit.mode || "").trim(),
    String(audit.scope || "").trim(),
    String(audit.depth || "").trim(),
  ].join("|");
}

function buildFastModeProfile(source = {}) {
  const currentScope = normalizeScope(source.scope || uiState.scope);
  return {
    mode: normalizeMode(source.mode || uiState.mode),
    mobileSweep: normalizeMode(source.mode || uiState.mode) === "mobile" ? "single" : "single",
    scope: currentScope === "full" ? "experience" : currentScope,
    depth: "signal",
    headed: false,
  };
}

function canResumeCurrentRunInFastMode(audit = {}) {
  if (audit?.running !== true) return false;
  if (String(audit?.source || "native") !== "native") return false;
  if (normalizeMode(audit?.mode || uiState.mode) === "mobile" && normalizeMobileSweep(uiState.mobileSweep) === "family") {
    return false;
  }
  return true;
}

function buildFastModeResumeInput(audit = {}) {
  const profile = buildFastModeProfile(audit);
  return {
    baseUrl: String(audit?.baseUrl || stateEl.targetUrl.value || "").trim(),
    mode: normalizeMode(audit?.mode || profile.mode),
    mobileSweep: normalizeMode(audit?.mode || profile.mode) === "mobile" ? normalizeMobileSweep(profile.mobileSweep) : "single",
    scope: normalizeScope(profile.scope),
    noServer: stateEl.noServer.checked,
    headed: profile.headed === true,
    fullAudit: normalizeDepth(profile.depth) === "deep",
  };
}

function createEmptySlowWatch() {
  return {
    runKey: "",
    routeKey: "",
    routeStartedAtMs: 0,
    routeWarnedKey: "",
    actionKey: "",
    actionStartedAtMs: 0,
    actionWarnedKey: "",
    events: [],
  };
}

function describeFastModePlan(profile) {
  const changes = [];
  changes.push("switch to signal sweep");
  if (profile.scope === "experience" && normalizeScope(uiState.scope) === "full") {
    changes.push("focus on UX/runtime first");
  }
  if (normalizeMode(uiState.mode) === "mobile" && normalizeMobileSweep(uiState.mobileSweep) === "family") {
    changes.push("reduce mobile coverage to a single viewport");
  }
  if (stateEl.headed.checked === true) {
    changes.push("disable headed preview overhead");
  }
  return changes.join(" | ");
}

function applyFastModeProfile(profile) {
  uiState.mode = normalizeMode(profile.mode);
  uiState.mobileSweep = normalizeMobileSweep(profile.mobileSweep);
  uiState.scope = normalizeScope(profile.scope);
  uiState.depth = normalizeDepth(profile.depth);
  stateEl.headed.checked = profile.headed === true;
  renderStaticSelections();
  persistProfile();
  renderPreviewWorkspace();
  renderMissionBrief();
  renderReportSummary(getVisibleReport(), { transient: !!uiState.liveReport });
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

function getPreparedTargetUrl() {
  return normalizePreviewUrl(stateEl.targetUrl?.value);
}

function getReportBaseUrl(report) {
  return normalizePreviewUrl(report?.meta?.baseUrl);
}

function isPreparedTargetAlignedWithReport(report) {
  const preparedTargetUrl = getPreparedTargetUrl();
  const reportBaseUrl = getReportBaseUrl(report);
  if (!preparedTargetUrl || !reportBaseUrl) return true;
  return preparedTargetUrl === reportBaseUrl;
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
    "CONTENT_LANGUAGE_CONFLICT",
    "VISUAL_SECTION_MISSING",
    "VISUAL_LAYOUT_OVERFLOW",
    "VISUAL_LAYER_OVERLAP",
    "VISUAL_TIGHT_SPACING",
    "VISUAL_EDGE_HUGGING",
    "VISUAL_BOUNDARY_COLLISION",
    "VISUAL_CLUSTER_COLLISION",
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

function priorityRank(priorityLevel) {
  switch (String(priorityLevel || "").toUpperCase()) {
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
  return pruneHistoryEntries(history);
}

function persistHistory() {
  uiState.history = pruneHistoryEntries(uiState.history);
  writeStorage(STORAGE_KEYS.runHistory, uiState.history);
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
  const stored = readStorage(STORAGE_KEYS.onboarding, null);
  if (stored === null) return true;
  return stored === true;
}

function persistOnboardingState(value) {
  uiState.onboardingDismissed = value === true;
  writeStorage(STORAGE_KEYS.onboarding, uiState.onboardingDismissed);
}

function normalizeAssistantConversationEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const role = String(entry.role || "");
  if (!["user", "assistant"].includes(role)) return null;
  return {
    id: String(entry.id || `${role}-${Date.now()}`),
    role,
    text: String(entry.text || ""),
    lead: String(entry.lead || ""),
    body: Array.isArray(entry.body) ? entry.body.map((item) => String(item || "")).filter(Boolean) : [],
    followUp: String(entry.followUp || ""),
    modeKey: String(entry.modeKey || ""),
    toneKey: String(entry.toneKey || ""),
    intentId: String(entry.intentId || ""),
    at: String(entry.at || ""),
    isProgress: Boolean(entry.isProgress),
    isThinking: Boolean(entry.isThinking),
    plan: Array.isArray(entry.plan) ? entry.plan.map((s) => ({ id: String(s.id || ""), label: String(s.label || "") })) : [],
  };
}

function pruneAssistantConversation(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeAssistantConversationEntry(entry))
    .filter(Boolean)
    .slice(-20);
}

function loadConversationList() {
  const raw = readStorage(STORAGE_KEYS.assistantConversationList, []);
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((c) => c && typeof c === "object" && c.id)
    .map((c) => ({
      id: String(c.id),
      title: String(c.title || "New chat"),
      createdAt: String(c.createdAt || c.at || ""),
      updatedAt: String(c.updatedAt || c.createdAt || c.at || ""),
      pinned: Boolean(c.pinned),
    }))
    .slice(-CONVERSATION_LIST_LIMIT);
}

function saveConversationList(list) {
  writeStorage(STORAGE_KEYS.assistantConversationList, list.slice(-CONVERSATION_LIST_LIMIT));
}

function deleteConversationMessages(conversationId) {
  const store = readStorage(STORAGE_KEYS.assistantConversationMessages, {});
  if (!store || typeof store !== "object") return;
  const next = { ...store };
  delete next[conversationId];
  writeStorage(STORAGE_KEYS.assistantConversationMessages, next);
}

function deleteConversation(conversationId) {
  if (!conversationId) return;
  const list = uiState.conversationList.filter((c) => c.id !== conversationId);
  const wasCurrent = uiState.currentConversationId === conversationId;
  saveConversationList(list);
  deleteConversationMessages(conversationId);
  uiState.conversationList = loadConversationList();
  if (wasCurrent) {
    const nextId = list.length > 0 ? list[list.length - 1].id : null;
    if (nextId) {
      uiState.currentConversationId = nextId;
      uiState.assistantConversation = loadConversationMessages(nextId);
      saveCurrentConversationId(nextId);
    } else {
      const id = `conv-${Date.now()}`;
      const now = new Date().toISOString();
      saveConversationList([{ id, title: "New chat", createdAt: now, updatedAt: now, pinned: false }]);
      saveCurrentConversationId(id);
      uiState.currentConversationId = id;
      uiState.assistantConversation = [];
    }
    uiState.conversationList = loadConversationList();
  }
  renderConversationList();
  renderAssistantState();
}

function loadConversationMessages(conversationId) {
  const store = readStorage(STORAGE_KEYS.assistantConversationMessages, {});
  const entries = store && typeof store === "object" && store[conversationId];
  return pruneAssistantConversation(Array.isArray(entries) ? entries : []);
}

function saveConversationMessages(conversationId, entries) {
  const store = readStorage(STORAGE_KEYS.assistantConversationMessages, {});
  const next = { ...(store && typeof store === "object" ? store : {}), [conversationId]: pruneAssistantConversation(entries) };
  writeStorage(STORAGE_KEYS.assistantConversationMessages, next);
}

function loadCurrentConversationId() {
  return String(readStorage(STORAGE_KEYS.assistantCurrentConversationId, "") || "").trim() || null;
}

function saveCurrentConversationId(id) {
  writeStorage(STORAGE_KEYS.assistantCurrentConversationId, id || "");
}

function migrateLegacyAssistantConversationToConversations() {
  const list = loadConversationList();
  if (list.length > 0) return;
  const legacy = readStorage(STORAGE_KEYS.assistantConversation, []);
  const entries = pruneAssistantConversation(Array.isArray(legacy) ? legacy : []);
  if (entries.length === 0) return;
  const id = `conv-${Date.now()}`;
  const now = new Date().toISOString();
  const firstUser = entries.find((e) => e.role === "user");
  const title = firstUser && firstUser.text ? String(firstUser.text).slice(0, 48).trim() || "New chat" : "New chat";
  const meta = { id, title, createdAt: now, updatedAt: now, pinned: false };
  saveConversationList([meta]);
  saveConversationMessages(id, entries);
  saveCurrentConversationId(id);
}

function loadAssistantConversation() {
  migrateLegacyAssistantConversationToConversations();
  const list = loadConversationList();
  let currentId = loadCurrentConversationId();
  if (!currentId && list.length > 0) currentId = list[list.length - 1].id;
  if (!currentId) {
    const id = `conv-${Date.now()}`;
    const now = new Date().toISOString();
    saveConversationList([{ id, title: "New chat", createdAt: now, updatedAt: now, pinned: false }]);
    saveCurrentConversationId(id);
    return [];
  }
  return loadConversationMessages(currentId);
}

function persistAssistantConversation() {
  uiState.assistantConversation = pruneAssistantConversation(uiState.assistantConversation);
  const id = uiState.currentConversationId;
  if (id) {
    saveConversationMessages(id, uiState.assistantConversation);
    const list = loadConversationList();
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      const meta = list[idx];
      const firstUser = uiState.assistantConversation.find((e) => e.role === "user");
      let title = meta.title;
      if ((!title || title === "New chat") && firstUser && firstUser.text) {
        title = String(firstUser.text).slice(0, 48).trim() || "New chat";
      }
      list[idx] = { ...meta, title, updatedAt: new Date().toISOString() };
      saveConversationList(list);
      uiState.conversationList = loadConversationList();
    }
  } else {
    writeStorage(STORAGE_KEYS.assistantConversation, uiState.assistantConversation);
  }
}

function loadAssistantSavedPrompts() {
  const source = readStorage(STORAGE_KEYS.assistantSavedPrompts, []);
  if (!Array.isArray(source)) return [];
  return source
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      id: String(entry.id || `prompt-${Date.now()}`),
      title: String(entry.title || ""),
      context: String(entry.context || ""),
      promptText: String(entry.promptText || ""),
      at: String(entry.at || ""),
    }))
    .slice(-12);
}

function persistAssistantSavedPrompts() {
  writeStorage(STORAGE_KEYS.assistantSavedPrompts, uiState.assistantSavedPrompts.slice(-12));
}

const AI_WORKSPACE_MODE_HIDDEN = "hidden";
const AI_WORKSPACE_MODE_DOCKED = "docked";
const AI_WORKSPACE_MODE_EXPANDED = "expanded";
const AI_WORKSPACE_MODE_FOCUS = "focus";

function loadAssistantWorkspaceUIPrefs() {
  const raw = readStorage(STORAGE_KEYS.assistantWorkspaceUI, null);
  if (raw && typeof raw === "object") {
    const mode = String(raw.mode || "").toLowerCase();
    if ([AI_WORKSPACE_MODE_HIDDEN, AI_WORKSPACE_MODE_DOCKED, AI_WORKSPACE_MODE_EXPANDED, AI_WORKSPACE_MODE_FOCUS].includes(mode)) {
      uiState.aiWorkspaceMode = mode;
    }
    const vh = Number(raw.dockHeightVh);
    if (Number.isFinite(vh) && vh >= 28 && vh <= 80) uiState.aiDockHeightVh = vh;
    const last = String(raw.lastNonFocusMode || "").toLowerCase();
    if (last === AI_WORKSPACE_MODE_DOCKED || last === AI_WORKSPACE_MODE_EXPANDED) uiState.lastNonFocusMode = last;
  }
  uiState.assistantOpen = uiState.aiWorkspaceMode !== AI_WORKSPACE_MODE_HIDDEN;
  uiState.assistantExpanded = uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_EXPANDED;
}

function saveAssistantWorkspaceUIPrefs() {
  writeStorage(STORAGE_KEYS.assistantWorkspaceUI, {
    mode: uiState.aiWorkspaceMode,
    dockHeightVh: uiState.aiDockHeightVh,
    lastNonFocusMode: uiState.lastNonFocusMode,
  });
}

function setAiWorkspaceMode(mode) {
  const prev = uiState.aiWorkspaceMode;
  if (mode === AI_WORKSPACE_MODE_FOCUS) {
    if (prev === AI_WORKSPACE_MODE_DOCKED || prev === AI_WORKSPACE_MODE_EXPANDED) {
      uiState.lastNonFocusMode = prev;
    }
  } else if (prev === AI_WORKSPACE_MODE_FOCUS && (mode === AI_WORKSPACE_MODE_DOCKED || mode === AI_WORKSPACE_MODE_EXPANDED)) {
    uiState.lastNonFocusMode = mode;
  }
  uiState.aiWorkspaceMode = mode;
  uiState.assistantOpen = mode !== AI_WORKSPACE_MODE_HIDDEN;
  uiState.assistantExpanded = mode === AI_WORKSPACE_MODE_EXPANDED;
  saveAssistantWorkspaceUIPrefs();
  renderAssistantWorkspaceLayout();
  if (uiState.assistantOpen) {
    renderAssistantState();
    window.setTimeout(() => {
      if (stateEl.assistantInput) {
        stateEl.assistantInput.focus();
      }
    }, 0);
  } else {
    const assistantEl = document.getElementById("assistantWorkspace");
    if (assistantEl) assistantEl.classList.remove("assistant-workspace-react-active");
  }
}

function ensureAdaptiveLanguageService() {
  if (uiState.adaptiveLanguageService) return uiState.adaptiveLanguageService;
  if (typeof window.createSitePulseAdaptiveLanguageService !== "function") {
    return null;
  }
  uiState.adaptiveLanguageService = window.createSitePulseAdaptiveLanguageService();
  uiState.assistantLanguageState = uiState.adaptiveLanguageService.getState();
  return uiState.adaptiveLanguageService;
}

function getAssistantLanguageState() {
  const service = ensureAdaptiveLanguageService();
  if (!service) {
    return {
      assistantLanguageMode: "auto",
      assistantPreferredLanguage: "en",
      activeLanguage: "en",
      assistantDetectedLanguageHistory: [],
      lastLanguageConfidence: 0,
      lastLanguageUpdatedAt: "",
      voiceReadiness: {
        supportsTranscriptSignals: true,
        supportsVoiceInput: false,
        transcriptLanguageSignal: true,
      },
    };
  }
  uiState.assistantLanguageState = service.getState();
  return uiState.assistantLanguageState;
}

function getAssistantLanguage() {
  return getAssistantLanguageState().activeLanguage || "en";
}

function getAssistantUiText() {
  const service = ensureAdaptiveLanguageService();
  return service ? service.getUiText(getAssistantLanguage()) : null;
}

function localizePromptLine(languageKey, values) {
  switch (languageKey) {
    case "pt":
      return values.pt;
    case "es":
      return values.es;
    case "ca":
      return values.ca;
    default:
      return values.en;
  }
}

function formatAssistantLanguagePill(state) {
  const service = ensureAdaptiveLanguageService();
  if (!service) return "Language: auto";
  const uiText = service.getUiText(state.activeLanguage);
  if (state.assistantLanguageMode === "manual") {
    return service.translateUiText("languagePillManual", { label: service.getLanguageLabel(state.activeLanguage) }, state.activeLanguage);
  }
  return uiText.languagePillAuto;
}

function renderAssistantLanguageUi() {
  const service = ensureAdaptiveLanguageService();
  const state = getAssistantLanguageState();
  if (!service) {
    return;
  }
  const uiText = service.getUiText(state.activeLanguage);
  if (stateEl.assistantEyebrow) {
    stateEl.assistantEyebrow.textContent = uiText.title;
  }
  if (stateEl.assistantTitle) {
    stateEl.assistantTitle.textContent = localizePromptLine(state.activeLanguage, {
      pt: "Workspace de IA sobre o estado real do app",
      es: "Workspace de IA sobre el estado real de la app",
      en: "AI workspace over the real app state",
      ca: "Workspace d'IA sobre l'estat real de l'app",
    });
  }
  if (stateEl.dismissAssistant) {
    stateEl.dismissAssistant.textContent = localizePromptLine(state.activeLanguage, {
      pt: "Recolher",
      es: "Plegar",
      en: "Collapse",
      ca: "Plegar",
    });
  }
  if (stateEl.assistantLanguageLabel) {
    stateEl.assistantLanguageLabel.textContent = uiText.languageLabel;
  }
  if (stateEl.assistantInputLabel) {
    stateEl.assistantInputLabel.textContent = uiText.askLabel;
  }
  if (stateEl.assistantInput) {
    stateEl.assistantInput.placeholder = uiText.askPlaceholder;
  }
  if (stateEl.assistantAsk) {
    stateEl.assistantAsk.textContent = uiText.askButton;
  }
  if (stateEl.assistantQuickPriorities) {
    stateEl.assistantQuickPriorities.textContent = uiText.quickPriorities;
  }
  if (stateEl.assistantQuickSeo) {
    stateEl.assistantQuickSeo.textContent = uiText.quickSeo;
  }
  if (stateEl.assistantQuickPrompt) {
    stateEl.assistantQuickPrompt.textContent = uiText.quickPrompt;
  }
  if (stateEl.assistantQuickGuide) {
    stateEl.assistantQuickGuide.textContent = uiText.quickGuide;
  }
  if (stateEl.assistantQuickStartEngine) {
    stateEl.assistantQuickStartEngine.textContent = uiText.quickStartEngine || "Start engine";
  }
  if (stateEl.assistantLanguageSelect) {
    const options = service.getLanguageOptions();
    stateEl.assistantLanguageSelect.innerHTML = options
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("");
    stateEl.assistantLanguageSelect.value = state.assistantLanguageMode === "manual"
      ? state.activeLanguage
      : "auto";
  }
  if (stateEl.assistantLanguagePill) {
    stateEl.assistantLanguagePill.textContent = formatAssistantLanguagePill(state);
  }
  if (Array.isArray(stateEl.assistantViewButtons)) {
    stateEl.assistantViewButtons.forEach((button) => {
      if (button.dataset.assistantView === "conversation") {
        button.textContent = localizePromptLine(state.activeLanguage, {
          pt: "Chat",
          es: "Chat",
          en: "Chat",
          ca: "Chat",
        });
      } else if (button.dataset.assistantView === "actions") {
        button.textContent = localizePromptLine(state.activeLanguage, {
          pt: "Ações",
          es: "Acciones",
          en: "Actions",
          ca: "Accions",
        });
      } else if (button.dataset.assistantView === "insights") {
        button.textContent = localizePromptLine(state.activeLanguage, {
          pt: "Insights",
          es: "Insights",
          en: "Insights",
          ca: "Insights",
        });
      } else if (button.dataset.assistantView === "diagnostics") {
        button.textContent = localizePromptLine(state.activeLanguage, {
          pt: "Diagnósticos",
          es: "Diagnósticos",
          en: "Diagnostics",
          ca: "Diagnòstics",
        });
      }
    });
  }
}

function getLocalizedAssistantModeMeta(modeKey, languageKey = getAssistantLanguage()) {
  const service = ensureAdaptiveLanguageService();
  return service
    ? service.getAssistantModeMeta(modeKey, languageKey)
    : { name: "Operational", description: "" };
}

function localizeAssistantLine(value, languageKey = getAssistantLanguage()) {
  const service = ensureAdaptiveLanguageService();
  return service ? service.localizeAssistantTextLine(value, languageKey) : String(value || "");
}

function localizeAssistantActionLabel(label, languageKey = getAssistantLanguage()) {
  const service = ensureAdaptiveLanguageService();
  return service ? service.localizeAssistantActionLabel(label, languageKey) : String(label || "");
}

function getAssistantQuickQuery(queryKey) {
  const service = ensureAdaptiveLanguageService();
  const quickQueries = service ? service.getQuickQueries(getAssistantLanguage()) : null;
  return String(quickQueries?.[queryKey] || "").trim();
}

function buildAssistantPromptRequest(issueCode = "") {
  const service = ensureAdaptiveLanguageService();
  return service
    ? service.buildPromptRequest(issueCode, getAssistantLanguage())
    : (issueCode ? `generate a prompt to fix issue ${issueCode}` : "generate a prompt to fix the top issue");
}

function buildAssistantStarterEntry(languageKey = getAssistantLanguage()) {
  return {
    id: "assistant-starter",
    role: "assistant",
    lead: localizePromptLine(languageKey, {
      pt: "Olá 👋",
      es: "Hola 👋",
      en: "Hi 👋",
      ca: "Hola 👋",
    }),
    body: [
      localizePromptLine(languageKey, {
        pt: "Como posso te ajudar hoje?",
        es: "¿Cómo puedo ayudarte hoy?",
        en: "How can I help you today?",
        ca: "Com et puc ajudar avui?",
      }),
      localizePromptLine(languageKey, {
        pt: "Posso, por exemplo:\n• rodar uma auditoria\n• analisar SEO de um site\n• revisar a última execução\n• explicar problemas encontrados",
        es: "Puedo, por ejemplo:\n• ejecutar una auditoría\n• analizar SEO de un sitio\n• revisar la última ejecución\n• explicar problemas encontrados",
        en: "I can, for example:\n• run an audit\n• analyze a site's SEO\n• review the latest run\n• explain issues found",
        ca: "Puc, per exemple:\n• executar una auditoria\n• analitzar SEO d’un lloc\n• revisar l’última execució\n• explicar problemes trobats",
      }),
    ],
    followUp: "",
    modeKey: "product_guide",
    toneKey: "friendly",
    intentId: "greeting",
    at: "",
  };
}

function formatAssistantToneLabel(toneKey, languageKey = getAssistantLanguage()) {
  switch (String(toneKey || "")) {
    case "technical":
      return localizePromptLine(languageKey, { pt: "tecnico", es: "tecnico", en: "technical", ca: "tecnic" });
    case "advanced_engineer":
      return localizePromptLine(languageKey, { pt: "engenharia avancada", es: "ingenieria avanzada", en: "advanced engineer", ca: "enginyeria avancada" });
    case "executive_summary":
      return localizePromptLine(languageKey, { pt: "resumo executivo", es: "resumen ejecutivo", en: "executive summary", ca: "resum executiu" });
    case "prompt_engineer":
      return localizePromptLine(languageKey, { pt: "prompt engineer", es: "prompt engineer", en: "prompt engineer", ca: "prompt engineer" });
    case "simple":
      return localizePromptLine(languageKey, { pt: "simples", es: "simple", en: "simple", ca: "simple" });
    case "operational":
      return localizePromptLine(languageKey, { pt: "operacional", es: "operacional", en: "operational", ca: "operacional" });
    default:
      return localizePromptLine(languageKey, { pt: "humano", es: "humano", en: "human", ca: "huma" });
  }
}

function appendAssistantConversationEntry(entry) {
  const normalized = normalizeAssistantConversationEntry(entry);
  if (!normalized) return;
  uiState.assistantConversation = pruneAssistantConversation([...uiState.assistantConversation, normalized]);
  persistAssistantConversation();
}

function createAssistantUserEntry(text) {
  return {
    id: `assistant-user-${Date.now()}`,
    role: "user",
    text: String(text || ""),
    at: new Date().toISOString(),
  };
}

const ASSISTANT_PROGRESS_MESSAGES = {
  "run-audit": { pt: "Iniciando auditoria...", es: "Iniciando auditoría...", en: "Starting audit...", ca: "Iniciant auditoria..." },
  "switch-findings": { pt: "Abrindo findings...", es: "Abriendo findings...", en: "Opening findings...", ca: "Obrint findings..." },
  "findings-search": { pt: "Abrindo findings...", es: "Abriendo findings...", en: "Opening findings...", ca: "Obrint findings..." },
  "open-issue": { pt: "Abrindo issue...", es: "Abriendo issue...", en: "Opening issue...", ca: "Obrint issue..." },
  "open-healing": { pt: "Abrindo healing...", es: "Abriendo healing...", en: "Opening healing...", ca: "Obrint healing..." },
  "prepare-healing": { pt: "Preparando healing...", es: "Preparando healing...", en: "Preparing healing...", ca: "Preparant healing..." },
  "generate-prompt": { pt: "Gerando prompt...", es: "Generando prompt...", en: "Generating prompt...", ca: "Generant prompt..." },
  "switch-compare": { pt: "Abrindo compare...", es: "Abriendo compare...", en: "Opening compare...", ca: "Obrint compare..." },
};

const ASSISTANT_THINKING_MESSAGES = {
  pt: ["Pensando…", "Analisando…", "Consultando evidências…", "Verificando padrões…", "Preparando resposta…"],
  es: ["Pensando…", "Analizando…", "Consultando evidencias…", "Verificando patrones…", "Preparando respuesta…"],
  en: ["Thinking…", "Analyzing…", "Checking evidence…", "Verifying patterns…", "Preparing response…"],
  ca: ["Pensant…", "Analitzant…", "Consultant evidències…", "Verificant patrons…", "Preparant resposta…"],
};

function getAssistantProgressMessage(actionId) {
  const lang = getAssistantLanguage();
  const map = ASSISTANT_PROGRESS_MESSAGES[String(actionId || "")];
  return map ? (map[lang] || map.en) : null;
}

function createAssistantProgressEntry(text) {
  return {
    id: `assistant-progress-${Date.now()}`,
    role: "assistant",
    isProgress: true,
    lead: String(text || ""),
    body: [],
    followUp: "",
    modeKey: "",
    toneKey: "",
    intentId: "",
    at: new Date().toISOString(),
  };
}

function createAssistantThinkingEntry() {
  return {
    id: `assistant-thinking-${Date.now()}`,
    role: "assistant",
    isThinking: true,
    lead: "",
    body: [],
    followUp: "",
    modeKey: "",
    toneKey: "",
    intentId: "",
    at: new Date().toISOString(),
  };
}

function stopThinkingRotation() {
  if (uiState.assistantThinkingRotationInterval != null) {
    clearInterval(uiState.assistantThinkingRotationInterval);
    uiState.assistantThinkingRotationInterval = null;
  }
  uiState.assistantThinkingPhaseIndex = 0;
}

function startThinkingRotation() {
  stopThinkingRotation();
  const messages = ASSISTANT_THINKING_MESSAGES[getAssistantLanguage()] || ASSISTANT_THINKING_MESSAGES.en;
  if (messages.length === 0) return;
  uiState.assistantThinkingRotationInterval = setInterval(() => {
    if (!uiState.assistantConversation.some((e) => e.isThinking)) {
      stopThinkingRotation();
      return;
    }
    uiState.assistantThinkingPhaseIndex = (uiState.assistantThinkingPhaseIndex + 1) % messages.length;
    renderAssistantConversation();
    const scrollContainer = stateEl.assistantChatScroll || stateEl.assistantResponse;
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }, 1600);
}

function removeAssistantThinkingEntry() {
  stopThinkingRotation();
  uiState.assistantConversation = uiState.assistantConversation.filter((e) => !e.isThinking);
  persistAssistantConversation();
}

function appendAssistantProgressMessage(text) {
  const msg = String(text || "").trim();
  if (!msg) return;
  appendAssistantConversationEntry(createAssistantProgressEntry(msg));
  renderAssistantConversation();
  const scrollContainer = stateEl.assistantChatScroll || stateEl.assistantResponse;
  if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

function createAssistantResultEntry(result) {
  const plan = Array.isArray(result?.plan) ? result.plan.map((s) => ({ id: String(s.id || ""), label: String(s.label || "") })) : [];
  return {
    id: `assistant-reply-${Date.now()}`,
    role: "assistant",
    lead: String(result?.assistantLead || result?.summary || ""),
    body: Array.isArray(result?.assistantBody) ? result.assistantBody.map((item) => String(item || "")).filter(Boolean) : [],
    followUp: String(result?.assistantFollowUp || ""),
    modeKey: String(result?.modeKey || ""),
    toneKey: String(result?.toneKey || ""),
    intentId: String(result?.intentId || ""),
    at: new Date().toISOString(),
    plan,
  };
}

function createNewConversation() {
  const id = `conv-${Date.now()}`;
  const now = new Date().toISOString();
  const list = [...uiState.conversationList, { id, title: "New chat", createdAt: now, updatedAt: now, pinned: false }];
  uiState.conversationList = list.slice(-CONVERSATION_LIST_LIMIT);
  uiState.currentConversationId = id;
  uiState.assistantConversation = [];
  saveConversationList(uiState.conversationList);
  saveCurrentConversationId(id);
  saveConversationMessages(id, []);
  renderAssistantState();
}

function selectConversation(conversationId) {
  if (!conversationId || conversationId === uiState.currentConversationId) return;
  persistAssistantConversation();
  uiState.currentConversationId = conversationId;
  uiState.assistantConversation = loadConversationMessages(conversationId);
  saveCurrentConversationId(conversationId);
  renderAssistantState();
}

function renderConversationList() {
  if (!stateEl.assistantConversationList) return;
  const q = String(uiState.assistantConversationSearch || "").trim().toLowerCase();
  let items = uiState.conversationList.slice().sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  if (items.some((c) => c.pinned)) {
    items = [...items.filter((c) => c.pinned), ...items.filter((c) => !c.pinned)];
  }
  if (q) items = items.filter((c) => (c.title || "").toLowerCase().includes(q));
  stateEl.assistantConversationList.innerHTML = items.map((c) => {
    const active = c.id === uiState.currentConversationId ? " active" : "";
    const title = escapeHtml(c.title || "New chat");
    const meta = c.updatedAt ? new Date(c.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
    return `<div class="assistant-conversation-item-wrap" data-conversation-id="${escapeHtml(c.id)}">
      <button type="button" class="assistant-conversation-item${active}" role="listitem"><span class="conversation-title">${title}</span>${meta ? `<span class="conversation-meta">${escapeHtml(meta)}</span>` : ""}</button>
      <button type="button" class="assistant-conversation-item-delete" aria-label="Delete conversation" title="Delete conversation">×</button>
    </div>`;
  }).join("");
  stateEl.assistantConversationList.querySelectorAll(".assistant-conversation-item-wrap").forEach((wrap) => {
    const id = wrap.getAttribute("data-conversation-id");
    const btn = wrap.querySelector(".assistant-conversation-item");
    const delBtn = wrap.querySelector(".assistant-conversation-item-delete");
    if (btn) btn.addEventListener("click", () => selectConversation(id));
    if (delBtn) {
      delBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        deleteConversation(id);
      });
    }
  });
}

function renderAssistantConversation() {
  if (!stateEl.assistantResponse) return;
  const languageKey = getAssistantLanguage();
  const entries = uiState.assistantConversation.length
    ? uiState.assistantConversation
    : [buildAssistantStarterEntry(languageKey)];

  stateEl.assistantResponse.innerHTML = entries.map((entry) => {
    if (entry.role === "user") {
      return `
        <article class="assistant-message assistant-message-user">
          <div class="assistant-message-meta">${escapeHtml(localizePromptLine(languageKey, { pt: "voce", es: "tu", en: "you", ca: "tu" }))}</div>
          <div class="assistant-message-bubble">${escapeHtml(entry.text)}</div>
        </article>
      `;
    }
    if (entry.isProgress) {
      return `
        <article class="assistant-message assistant-message-assistant assistant-message-progress">
          <div class="assistant-message-bubble">${escapeHtml(localizeAssistantLine(entry.lead, languageKey))}</div>
        </article>
      `;
    }
    if (entry.isThinking) {
      const messages = ASSISTANT_THINKING_MESSAGES[languageKey] || ASSISTANT_THINKING_MESSAGES.en;
      const thinkingText = messages.length ? messages[uiState.assistantThinkingPhaseIndex % messages.length] : "Thinking…";
      return `
        <article class="assistant-message assistant-message-assistant assistant-message-thinking" aria-live="polite">
          <div class="assistant-message-bubble assistant-thinking-bubble">
            <span class="assistant-thinking-dots"><span></span><span></span><span></span></span>
            <span class="assistant-thinking-text">${escapeHtml(thinkingText)}</span>
          </div>
        </article>
      `;
    }
    const localizedMode = entry.modeKey ? getLocalizedAssistantModeMeta(entry.modeKey, languageKey).name : "";
    const toneLabel = entry.toneKey ? formatAssistantToneLabel(entry.toneKey, languageKey) : "";
    const body = Array.isArray(entry.body) && entry.body.length
      ? `<div class="assistant-message-body">${entry.body.map((item) => `<p>${escapeHtml(localizeAssistantLine(item, languageKey))}</p>`).join("")}</div>`
      : "";
    const planBlock = Array.isArray(entry.plan) && entry.plan.length
      ? `<ol class="assistant-message-plan" aria-label="${escapeHtml(localizePromptLine(languageKey, { pt: "Plano", es: "Plan", en: "Plan", ca: "Pla" }))}">${entry.plan.map((s) => `<li>${escapeHtml(localizeAssistantLine(s.label, languageKey))}</li>`).join("")}</ol>`
      : "";
    const followUp = entry.followUp
      ? `<div class="assistant-message-followup">${escapeHtml(localizeAssistantLine(entry.followUp, languageKey))}</div>`
      : "";
    const meta = [localizedMode, toneLabel].filter(Boolean).join(" · ");
    return `
      <article class="assistant-message assistant-message-assistant">
        <div class="assistant-message-meta">${escapeHtml(meta || localizePromptLine(languageKey, { pt: "assistente", es: "asistente", en: "assistant", ca: "assistent" }))}</div>
        <div class="assistant-message-bubble">
          <strong>${escapeHtml(localizeAssistantLine(entry.lead, languageKey))}</strong>
          ${planBlock}
          ${body}
          ${followUp}
        </div>
      </article>
    `;
  }).join("");
  const scrollContainer = stateEl.assistantChatScroll || stateEl.assistantResponse;
  if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

function saveAssistantPromptCard(card) {
  if (!card || !String(card.promptText || "").trim()) return;
  uiState.assistantSavedPrompts = [
    ...uiState.assistantSavedPrompts,
    {
      id: `assistant-saved-prompt-${Date.now()}`,
      title: String(card.title || "Prompt"),
      context: String(card.context || ""),
      promptText: String(card.promptText || ""),
      at: new Date().toISOString(),
    },
  ].slice(-12);
  persistAssistantSavedPrompts();
  showToast("Prompt saved in the local assistant memory.", "ok");
}

function sendAssistantPromptCardToWorkspace(card) {
  if (!card || !String(card.promptText || "").trim()) return;
  stateEl.quickPromptBox.textContent = String(card.promptText || "");
  stateEl.promptWorkspaceFix.textContent = String(card.promptText || "");
  switchView("prompts");
  showToast("Prompt sent to the Prompt Workspace.", "ok");
}

function renderAssistantCards(result) {
  if (!stateEl.assistantActions) return;
  if (!result) {
    const uiText = getAssistantUiText();
    stateEl.assistantActions.innerHTML = `<article class="empty-state">${escapeHtml(uiText?.actionsDefault || "Action suggestions will appear here when the assistant has enough context.")}</article>`;
    return;
  }
  const promptCard = result.promptCard && typeof result.promptCard === "object" ? result.promptCard : null;
  const actionCards = Array.isArray(result.actionCards) ? result.actionCards : [];
  const sections = [];

  if (promptCard) {
    sections.push(`
      <article class="assistant-prompt-card ai-workspace-card">
        <span class="ai-workspace-card-label" aria-hidden="true">Prompt card</span>
        <div class="assistant-card-top">
          <div>
            <span class="info-label">${escapeHtml(promptCard.title || "Prompt")}</span>
            <strong>${escapeHtml(promptCard.context || "")}</strong>
          </div>
        </div>
        <pre class="assistant-prompt-card-body">${escapeHtml(promptCard.promptText || "")}</pre>
        <div class="assistant-card-actions">
          <button type="button" data-assistant-card-action="copy-prompt">${escapeHtml(promptCard.copyLabel || "Copy")}</button>
          <button type="button" data-assistant-card-action="send-prompt">${escapeHtml(promptCard.sendLabel || "Send to Prompt Workspace")}</button>
          <button type="button" data-assistant-card-action="save-prompt">${escapeHtml(promptCard.saveLabel || "Save")}</button>
        </div>
      </article>
    `);
  }

  if (actionCards.length) {
    sections.push(actionCards.map((action, index) => `
      <button type="button" class="assistant-action-card ai-workspace-card" data-assistant-index="${index}">
        <span class="ai-workspace-card-label" aria-hidden="true">Action card</span>
        <div class="assistant-card-top">
          <span class="info-label">${escapeHtml(action.id || "action")}</span>
          <strong>${escapeHtml(localizeAssistantActionLabel(action.label || action.id || `action-${index + 1}`, getAssistantLanguage()))}</strong>
        </div>
        <p>${escapeHtml(action.description || "")}</p>
      </button>
    `).join(""));
  }

  if (!sections.length) {
    const uiText = getAssistantUiText();
    stateEl.assistantActions.innerHTML = `<article class="empty-state">${escapeHtml(uiText?.noDirectAction || "No direct action was suggested for this answer.")}</article>`;
    return;
  }
  stateEl.assistantActions.innerHTML = sections.join("");
}

const ASSISTANT_VIEW_KEYS = ["conversation", "actions", "insights", "diagnostics"];

function switchAssistantView(viewKey) {
  const key = String(viewKey || "").toLowerCase();
  uiState.assistantView = ASSISTANT_VIEW_KEYS.includes(key) ? key : "conversation";
  if (Array.isArray(stateEl.assistantViewButtons)) {
    stateEl.assistantViewButtons.forEach((button) => {
      const isActive = button.dataset.assistantView === uiState.assistantView;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }
  if (Array.isArray(stateEl.assistantViewPanels)) {
    stateEl.assistantViewPanels.forEach((panel) => {
      const isActive = panel.dataset.assistantViewPanel === uiState.assistantView;
      panel.classList.toggle("active", isActive);
      panel.classList.toggle("hidden", !isActive);
    });
  }
}

function renderAssistantWorkspaceLayout() {
  const mode = uiState.aiWorkspaceMode;
  const isOpen = mode !== AI_WORKSPACE_MODE_HIDDEN;
  const isExpanded = mode === AI_WORKSPACE_MODE_EXPANDED;
  const isFocus = mode === AI_WORKSPACE_MODE_FOCUS;
  const stickyContextBar = document.getElementById("stickyContextBar");
  const expandOverviewBtn = document.getElementById("expandOverviewBtn");

  if (stateEl.appBody) {
    stateEl.appBody.classList.toggle("ai-inspector-open", isOpen && !isFocus);
    stateEl.appBody.classList.toggle("ai-inspector-expanded", isExpanded);
    stateEl.appBody.classList.toggle("ai-workspace-focus", isFocus);
    stateEl.appBody.style.setProperty("--ai-dock-height-vh", String(uiState.aiDockHeightVh));
  }
  if (stateEl.operatorBelowSticky) {
    stateEl.operatorBelowSticky.classList.toggle("hidden", isFocus);
  } else if (stateEl.mainGrid) {
    stateEl.mainGrid.classList.toggle("hidden", isFocus);
  }
  if (stateEl.assistantWorkspace) {
    stateEl.assistantWorkspace.classList.toggle("hidden", !isOpen);
    stateEl.assistantWorkspace.classList.toggle("expanded", isExpanded);
    stateEl.assistantWorkspace.classList.toggle("ai-workspace-focus-mode", isFocus);
  }
  if (stateEl.openAssistant) {
    stateEl.openAssistant.classList.toggle("ok", isOpen);
    stateEl.openAssistant.setAttribute("aria-pressed", isOpen ? "true" : "false");
  }
  if (stateEl.assistantExpand) {
    stateEl.assistantExpand.textContent = localizePromptLine(getAssistantLanguage(), {
      pt: isExpanded ? "Painel menor" : "Expandir painel",
      es: isExpanded ? "Panel menor" : "Expandir panel",
      en: isExpanded ? "Shrink panel" : "Expand panel",
      ca: isExpanded ? "Panel més petit" : "Expandir panel",
    });
  }
  if (stateEl.assistantFocus) {
    stateEl.assistantFocus.classList.toggle("hidden", isFocus);
  }
  if (stateEl.assistantBackToDock) {
    stateEl.assistantBackToDock.classList.toggle("hidden", !isFocus);
  }
  if (stateEl.assistantDockResizeHandle) {
    stateEl.assistantDockResizeHandle.classList.toggle("hidden", !isExpanded || isFocus);
  }
  if (stickyContextBar) {
    /* Mantém a sticky como superfície viva no fluxo (sem position: fixed/sticky). */
    stickyContextBar.classList.add("sticky-visible");
    stickyContextBar.classList.remove("hidden");
    stickyContextBar.classList.toggle("sticky-as-hero", isFocus);
  }
  const stickyEnterFocusAi = document.getElementById("stickyEnterFocusAi");
  if (stickyEnterFocusAi) {
    stickyEnterFocusAi.classList.toggle("hidden", isFocus);
  }
  if (stateEl.workspaceHeader) {
    stateEl.workspaceHeader.classList.toggle("hero-collapsed", isFocus);
  }
  if (expandOverviewBtn) {
    expandOverviewBtn.classList.toggle("hidden", !isFocus);
  }
  switchAssistantView(uiState.assistantView);
}

function buildAssistantContextPills(report, intelligenceSnapshot) {
  const languageKey = getAssistantLanguage();
  const dataIntelligence = intelligenceSnapshot.dataIntelligence || {};
  const qualityState = dataIntelligence.QUALITY_STATE || {};
  const riskState = dataIntelligence.RISK_STATE || {};
  const nextAction = intelligenceSnapshot.autonomous?.nextActions?.[0] || riskState.priorityQueue?.[0] || null;
  const focusIssue = nextAction?.issueCode || report?.issues?.[0]?.code || "";
  const pills = [
    localizePromptLine(languageKey, {
      pt: `Run: ${report ? "carregada" : "nenhuma"}`,
      es: `Run: ${report ? "cargada" : "ninguna"}`,
      en: `Run: ${report ? "loaded" : "none"}`,
      ca: `Run: ${report ? "carregada" : "cap"}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Escopo: ${uiState.activeView}`,
      es: `Scope: ${uiState.activeView}`,
      en: `Scope: ${uiState.activeView}`,
      ca: `Abast: ${uiState.activeView}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Trajetoria: ${qualityState.trajectory || "stable"}`,
      es: `Trayectoria: ${qualityState.trajectory || "stable"}`,
      en: `Trajectory: ${qualityState.trajectory || "stable"}`,
      ca: `Trajectoria: ${qualityState.trajectory || "stable"}`,
    }),
    localizePromptLine(languageKey, {
      pt: `High risk: ${riskState.highRiskAlertCount || 0}`,
      es: `High risk: ${riskState.highRiskAlertCount || 0}`,
      en: `High risk: ${riskState.highRiskAlertCount || 0}`,
      ca: `High risk: ${riskState.highRiskAlertCount || 0}`,
    }),
  ];
  if (focusIssue) {
    pills.push(localizePromptLine(languageKey, {
      pt: `Foco: ${focusIssue}`,
      es: `Foco: ${focusIssue}`,
      en: `Focus: ${focusIssue}`,
      ca: `Focus: ${focusIssue}`,
    }));
  }
  return pills;
}

function buildAssistantInsightsMarkup(report, intelligenceSnapshot) {
  if (!stateEl.assistantInsights) return;
  const languageKey = getAssistantLanguage();
  const dataIntelligence = intelligenceSnapshot.dataIntelligence || {};
  const qualityState = dataIntelligence.QUALITY_STATE || {};
  const riskState = dataIntelligence.RISK_STATE || {};
  const trendState = dataIntelligence.TREND_STATE || {};
  const memory = intelligenceSnapshot.learningMemory || {};
  const healing = intelligenceSnapshot.selfHealing || {};
  const optimization = intelligenceSnapshot.optimization || {};
  const nextActions = intelligenceSnapshot.autonomous?.nextActions || [];
  const predictiveAlerts = intelligenceSnapshot.predictive?.alerts || [];
  const cards = [
    {
      label: localizePromptLine(languageKey, { pt: "Current context", es: "Contexto actual", en: "Current context", ca: "Context actual" }),
      title: report ? String(report.meta?.baseUrl || "") : localizePromptLine(languageKey, { pt: "Nenhuma auditoria carregada", es: "Ninguna auditoria cargada", en: "No audit loaded", ca: "Cap auditoria carregada" }),
      items: [
        localizePromptLine(languageKey, {
          pt: `View ativa: ${uiState.activeView}`,
          es: `Vista activa: ${uiState.activeView}`,
          en: `Active view: ${uiState.activeView}`,
          ca: `Vista activa: ${uiState.activeView}`,
        }),
        localizePromptLine(languageKey, {
          pt: `Modo da IA: ${uiState.assistantResult?.modeName || uiState.assistantResult?.modeKey || "auto"}`,
          es: `Modo de IA: ${uiState.assistantResult?.modeName || uiState.assistantResult?.modeKey || "auto"}`,
          en: `AI mode: ${uiState.assistantResult?.modeName || uiState.assistantResult?.modeKey || "auto"}`,
          ca: `Mode d'IA: ${uiState.assistantResult?.modeName || uiState.assistantResult?.modeKey || "auto"}`,
        }),
      ],
    },
    {
      label: localizePromptLine(languageKey, { pt: "Quality", es: "Quality", en: "Quality", ca: "Quality" }),
      title: localizePromptLine(languageKey, {
        pt: `Score ${qualityState.overallScore || 0} · ${qualityState.trajectory || "stable"}`,
        es: `Score ${qualityState.overallScore || 0} · ${qualityState.trajectory || "stable"}`,
        en: `Score ${qualityState.overallScore || 0} · ${qualityState.trajectory || "stable"}`,
        ca: `Score ${qualityState.overallScore || 0} · ${qualityState.trajectory || "stable"}`,
      }),
      items: [
        `SEO ${qualityState.seoScore || 0}`,
        `UX ${Math.round(toNumber(qualityState.dimensions?.uxQuality, 0))}`,
        localizePromptLine(languageKey, {
          pt: `Confianca ${Math.round(toNumber(qualityState.trajectoryConfidence, 0) * 100)}%`,
          es: `Confianza ${Math.round(toNumber(qualityState.trajectoryConfidence, 0) * 100)}%`,
          en: `Confidence ${Math.round(toNumber(qualityState.trajectoryConfidence, 0) * 100)}%`,
          ca: `Confianca ${Math.round(toNumber(qualityState.trajectoryConfidence, 0) * 100)}%`,
        }),
      ],
    },
    {
      label: localizePromptLine(languageKey, { pt: "Risk", es: "Riesgo", en: "Risk", ca: "Risc" }),
      title: localizePromptLine(languageKey, {
        pt: `${riskState.highRiskAlertCount || 0} alertas altas`,
        es: `${riskState.highRiskAlertCount || 0} alertas altas`,
        en: `${riskState.highRiskAlertCount || 0} high alerts`,
        ca: `${riskState.highRiskAlertCount || 0} alertes altes`,
      }),
      items: (predictiveAlerts.slice(0, 3).map((alert) => String(alert?.summary || alert?.title || "").trim()).filter(Boolean)),
    },
    {
      label: localizePromptLine(languageKey, { pt: "Next actions", es: "Siguientes acciones", en: "Next actions", ca: "Següents accions" }),
      title: localizePromptLine(languageKey, {
        pt: nextActions[0]?.actionLabel || "Nenhuma acao lider",
        es: nextActions[0]?.actionLabel || "Ninguna accion lider",
        en: nextActions[0]?.actionLabel || "No lead action",
        ca: nextActions[0]?.actionLabel || "Cap accio lider",
      }),
      items: nextActions.slice(0, 3).map((item) => `${item.issueCode || ""} · ${item.playbookTitle || item.actionLabel || ""}`),
    },
    {
      label: localizePromptLine(languageKey, { pt: "Memory and healing", es: "Memoria y healing", en: "Memory and healing", ca: "Memoria i healing" }),
      title: localizePromptLine(languageKey, {
        pt: `${memory?.summary?.entries || 0} patterns · ${healing?.summary?.eligible || 0} elegiveis`,
        es: `${memory?.summary?.entries || 0} patterns · ${healing?.summary?.eligible || 0} elegibles`,
        en: `${memory?.summary?.entries || 0} patterns · ${healing?.summary?.eligible || 0} eligible`,
        ca: `${memory?.summary?.entries || 0} patterns · ${healing?.summary?.eligible || 0} elegibles`,
      }),
      items: [
        localizePromptLine(languageKey, {
          pt: `Trend ${trendState.overallDirection || "stable"}`,
          es: `Trend ${trendState.overallDirection || "stable"}`,
          en: `Trend ${trendState.overallDirection || "stable"}`,
          ca: `Trend ${trendState.overallDirection || "stable"}`,
        }),
        localizePromptLine(languageKey, {
          pt: `${optimization?.topImprovements?.length || 0} oportunidades estruturais`,
          es: `${optimization?.topImprovements?.length || 0} oportunidades estructurales`,
          en: `${optimization?.topImprovements?.length || 0} structural opportunities`,
          ca: `${optimization?.topImprovements?.length || 0} oportunitats estructurals`,
        }),
      ],
    },
  ];
  stateEl.assistantInsights.innerHTML = cards.map((card) => `
    <article class="assistant-insight-card">
      <span class="info-label">${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.title || "")}</strong>
      <div class="assistant-insight-items">
        ${(Array.isArray(card.items) && card.items.length
          ? card.items.map((item) => `<p>${escapeHtml(String(item || ""))}</p>`).join("")
          : `<p>${escapeHtml(localizePromptLine(languageKey, {
              pt: "Sem sinal relevante nesta area ainda.",
              es: "Sin señal relevante en esta área todavía.",
              en: "No relevant signal in this area yet.",
              ca: "Sense cap senyal rellevant en aquesta àrea encara.",
            }))}</p>`)}
      </div>
    </article>
  `).join("");
}

function renderAssistantConsoleStrip(report, intelligenceSnapshot) {
  const languageKey = getAssistantLanguage();
  const dataIntelligence = intelligenceSnapshot?.dataIntelligence || {};
  const riskState = dataIntelligence.RISK_STATE || {};
  const qualityState = dataIntelligence.QUALITY_STATE || {};
  const nextActions = intelligenceSnapshot?.autonomous?.nextActions || [];
  const t = (pt, es, en, ca) => localizePromptLine(languageKey, { pt, es, en, ca });
  const context = report
    ? `${String(report.meta?.baseUrl || "").slice(0, 32)}${(report.meta?.baseUrl || "").length > 32 ? "…" : ""} · ${report.summary?.totalIssues ?? 0} issues`
    : t("Nenhuma run", "Ninguna run", "No report", "Cap report");
  const risk = report
    ? `${riskState.highRiskAlertCount ?? 0} high · ${qualityState.trajectory || "stable"}`
    : "—";
  const priority = report
    ? `P0 ${report.summary?.priorityP0 ?? 0} / P1 ${report.summary?.priorityP1 ?? 0}`
    : "—";
  const next = nextActions[0]?.actionLabel || (report ? t("Ver Findings", "Ver Findings", "Open Findings", "Obrir Findings") : t("Carregar report", "Cargar report", "Load report", "Carregar report"));
  if (stateEl.assistantConsoleContext) stateEl.assistantConsoleContext.textContent = context;
  if (stateEl.assistantConsoleRisk) stateEl.assistantConsoleRisk.textContent = risk;
  if (stateEl.assistantConsolePriority) stateEl.assistantConsolePriority.textContent = priority;
  if (stateEl.assistantConsoleNextActions) {
    const code = nextActions[0]?.issueCode;
    if (report && code) {
      stateEl.assistantConsoleNextActions.innerHTML = `<button type="button" class="action-link open-findings-search ai-workspace-next-btn" data-findings-search="${escapeHtml(String(code))}">${escapeHtml(next)}</button>`;
      stateEl.assistantConsoleNextActions.classList.remove("hidden");
    } else {
      stateEl.assistantConsoleNextActions.textContent = next;
      stateEl.assistantConsoleNextActions.classList.toggle("hidden", !report);
    }
  }
  if (stateEl.assistantPillRun) stateEl.assistantPillRun.textContent = report ? `Run: ${String(report.meta?.baseUrl || "").slice(0, 20)}${(report.meta?.baseUrl || "").length > 20 ? "…" : ""}` : "Run: not loaded";
  if (stateEl.assistantPillWorkspace) stateEl.assistantPillWorkspace.textContent = `Workspace: ${uiState.activeView || "overview"}`;
  if (stateEl.assistantPillFocus) stateEl.assistantPillFocus.textContent = nextActions[0]?.issueCode ? `Focus: ${nextActions[0].issueCode}` : "Focus: —";
  const langSelect = document.getElementById("assistantLanguageSelect");
  if (stateEl.assistantPillLang) stateEl.assistantPillLang.textContent = langSelect ? `Lang: ${langSelect.value || "auto"}` : "Lang: auto";
}

function renderAssistantMemoryHealingSummaries(report, intelligenceSnapshot) {
  const languageKey = getAssistantLanguage();
  const memory = intelligenceSnapshot?.learningMemory || {};
  const healing = intelligenceSnapshot?.selfHealing || {};
  const t = (pt, es, en, ca) => localizePromptLine(languageKey, { pt, es, en, ca });
  const memEntries = memory?.summary?.entries ?? 0;
  const memValidated = memory?.summary?.validated ?? 0;
  const memFailed = memory?.summary?.failed ?? 0;
  const healEligible = healing?.summary?.eligible ?? 0;
  const healReady = healing?.summary?.promptReady ?? 0;
  const memoryText = report
    ? t(
        `${memEntries} entradas · ${memValidated} validadas · ${memFailed} falhas`,
        `${memEntries} entradas · ${memValidated} validadas · ${memFailed} fallos`,
        `${memEntries} entries · ${memValidated} validated · ${memFailed} failed`,
        `${memEntries} entrades · ${memValidated} validades · ${memFailed} fallades`
      )
    : t("Nenhuma memoria", "Ninguna memoria", "No memory snapshot", "Cap memòria");
  const healingText = report
    ? t(
        `${healEligible} elegiveis · ${healReady} prontos`,
        `${healEligible} elegibles · ${healReady} listos`,
        `${healEligible} eligible · ${healReady} ready`,
        `${healEligible} elegibles · ${healReady} llestos`
      )
    : t("Nenhum healing", "Ningún healing", "No healing snapshot", "Cap healing");
  if (stateEl.assistantMemorySummary) stateEl.assistantMemorySummary.textContent = memoryText;
  if (stateEl.assistantHealingSummary) stateEl.assistantHealingSummary.textContent = healingText;
}

function rerenderAssistantInActiveLanguage() {
  const service = ensureAssistantService();
  if (!service) {
    renderAssistantState();
    return;
  }
  if (uiState.assistantQuery) {
    uiState.assistantResult = service.respond(uiState.assistantQuery);
    const latestAssistantIndex = [...uiState.assistantConversation]
      .map((entry, index) => ({ entry, index }))
      .reverse()
      .find((item) => item.entry?.role === "assistant")?.index;
    if (typeof latestAssistantIndex === "number") {
      uiState.assistantConversation[latestAssistantIndex] = createAssistantResultEntry(uiState.assistantResult);
      persistAssistantConversation();
    }
  }
  renderAssistantState();
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
    if (uiState.assistantOpen) {
      toggleAssistant(false);
    }
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

function ensureKimiReactStylesLoaded() {
  if (window.__sitepulseKimiReactStylesLoaded) return;
  window.__sitepulseKimiReactStylesLoaded = true;

  // Load Kimi tailwind only when AI workspace is opened.
  if (document.getElementById("kimi-tailwind-link")) return;
  const link = document.createElement("link");
  link.id = "kimi-tailwind-link";
  link.rel = "stylesheet";
  link.href = "./kimi-tailwind.css";
  document.head.appendChild(link);
}

function ensureKimiReactBundleLoaded() {
  if (window.__sitepulseKimiReactBundleLoaded) return;
  window.__sitepulseKimiReactBundleLoaded = true;

  // React operator UI (SitePulseScreen) is loaded lazily.
  if (document.querySelector('script[src="./kimi-react.bundle.js"]')) return;
  ensureKimiReactStylesLoaded();
  const script = document.createElement("script");
  script.src = "./kimi-react.bundle.js";
  script.async = true;
  script.addEventListener("load", () => {
    // React may mount asynchronously; refresh refs a few times to catch DOM creation.
    refreshStateElRefs();
    setTimeout(refreshStateElRefs, 60);
    setTimeout(refreshStateElRefs, 250);
  });
  document.body.appendChild(script);
}

function enableAssistantReactWorkspace() {
  // Não adicionar assistant-workspace-react-active aqui: esconde o shell vanilla e mostra
  // #assistantWorkspaceReactRoot vazio até o bundle React montar — o chat parecia “morto”.
  ensureKimiReactBundleLoaded();
}

/** Full-screen AI focus: collapses overview hero, shows sticky as command strip, expands AI workspace. */
function enterAiFocusMode() {
  setAiWorkspaceMode(AI_WORKSPACE_MODE_FOCUS);
  enableAssistantReactWorkspace();
  hideMenuFlyout();
  if (uiState.commandPaletteOpen) toggleCommandPalette(false);
  renderAssistantState();
}

/** Leave focus but keep AI open as an expanded bottom dock (overview + hero visible). */
function enterAiDetachedExpandedMode() {
  setAiWorkspaceMode(AI_WORKSPACE_MODE_EXPANDED);
  enableAssistantReactWorkspace();
  renderAssistantState();
}

function toggleAssistant(forceOpen = null) {
  appendLog("[studio] AI / Assistant button triggered.");
  const nextOpen = forceOpen === null ? uiState.aiWorkspaceMode !== AI_WORKSPACE_MODE_FOCUS : forceOpen === true;
  if (nextOpen) {
    enterAiFocusMode();
  } else {
    setAiWorkspaceMode(AI_WORKSPACE_MODE_HIDDEN);
    renderAssistantState();
  }
}

/** Atalho para Settings workspace / shell actions — dock expandido sem Focus AI. */
function openAssistantDockExpandedFromShell() {
  enableAssistantReactWorkspace();
  setAiWorkspaceMode(AI_WORKSPACE_MODE_EXPANDED);
  if (uiState.aiDockHeightVh < 44) uiState.aiDockHeightVh = 52;
  if (stateEl.appBody) stateEl.appBody.style.setProperty("--ai-dock-height-vh", String(uiState.aiDockHeightVh));
  renderAssistantWorkspaceLayout();
  renderAssistantState();
  refreshStateElRefs();
}

function toggleAssistantExpanded(forceExpanded = null) {
  const nextExpanded = forceExpanded === null ? !uiState.assistantExpanded : forceExpanded === true;
  setAiWorkspaceMode(nextExpanded ? AI_WORKSPACE_MODE_EXPANDED : AI_WORKSPACE_MODE_DOCKED);
}

function bindAssistantDockResize() {
  const handle = stateEl.assistantDockResizeHandle;
  if (!handle || !stateEl.appBody) return;
  let moveHandler = null;
  let upHandler = null;
  handle.addEventListener("mousedown", (e) => {
    if (e.button !== 0 || uiState.aiWorkspaceMode !== AI_WORKSPACE_MODE_EXPANDED) return;
    e.preventDefault();
    const startY = e.clientY;
    const startVh = uiState.aiDockHeightVh;
    moveHandler = (ev) => {
      const dy = startY - ev.clientY;
      const vhDelta = (dy / window.innerHeight) * 100;
      let next = startVh + vhDelta;
      next = Math.max(28, Math.min(80, next));
      uiState.aiDockHeightVh = Math.round(next);
      stateEl.appBody.style.setProperty("--ai-dock-height-vh", String(uiState.aiDockHeightVh));
    };
    upHandler = () => {
      document.removeEventListener("mousemove", moveHandler);
      document.removeEventListener("mouseup", upHandler);
      moveHandler = null;
      upHandler = null;
      saveAssistantWorkspaceUIPrefs();
    };
    document.addEventListener("mousemove", moveHandler);
    document.addEventListener("mouseup", upHandler);
  });
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
    item.viewportLabel || item.viewport || "",
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
      reference.item.viewportLabel || reference.item.viewport || "",
      reference.item.variant ? `variant=${reference.item.variant}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    stateEl.evidenceReferenceImage.src = toFileSrc(reference.item.path);
    stateEl.evidenceReferenceImage.alt = reference.item.label || "Reference evidence preview";
    stateEl.evidenceReferenceStage.classList.remove("hidden");
    stateEl.evidenceCompareState.textContent = `Before/after compare active against ${reference.label}${item.viewportLabel || item.viewport ? ` on ${item.viewportLabel || item.viewport}` : ""}. Use the left frame for the current run and the right frame for the reference run.`;
  } else {
    stateEl.evidenceReferenceImage.removeAttribute("src");
    stateEl.evidenceReferenceMeta.textContent = "No matching baseline evidence.";
    stateEl.evidenceReferenceStage.classList.add("hidden");
    stateEl.evidenceCompareState.textContent = "No matching baseline evidence was found for this visual proof yet.";
  }
  stateEl.evidenceLightbox.classList.remove("hidden");
}

function ensureCompanion() {
  const ok = typeof window.sitePulseCompanion === "object" && window.sitePulseCompanion !== null;
  if (stateEl.bridgeMissingBanner) {
    stateEl.bridgeMissingBanner.classList.toggle("hidden", ok);
  }
  if (ok) return true;
  const msg = "App bridge not ready. Restart SitePulse Studio and try again.";
  appendLog(`[studio] ${msg}`);
  if (typeof showToast === "function") showToast(msg, "bad");
  return false;
}

async function syncAuthoritativeState() {
  if (!ensureCompanion()) return null;
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
    viewportLabel: String(item.viewportLabel || ""),
    viewport: String(item.viewport || ""),
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

function normalizeLearningMemory(input) {
  const source = input && typeof input === "object" ? input : {};
  const entries = Array.isArray(source.entries)
    ? source.entries.map((item, index) => ({
        key: String(item?.key || item?.id || `memory-${index + 1}`),
        id: String(item?.key || `memory-${index + 1}`),
        issueCode: String(item?.issueCode || "UNKNOWN"),
        title: String(item?.title || "Operational memory"),
        category: String(item?.category || "general"),
        severity: String(item?.severity || "low"),
        route: String(item?.route || "/"),
        action: String(item?.action || ""),
        possibleResolution: String(item?.possibleResolution || ""),
        finalResolution: String(item?.finalResolution || ""),
        finalResolutionOrigin: String(item?.finalResolutionOrigin || ""),
        learningSource: String(item?.learningSource || ""),
        resolutionConfidence: String(item?.resolutionConfidence || ""),
        promotionSource: String(item?.promotionSource || ""),
        promotionCount: toNumber(item?.promotionCount, 0),
        lastValidatedAt: String(item?.lastValidatedAt || ""),
        manualOverrideCount: toNumber(item?.manualOverrideCount, 0),
        lastManualOverrideAt: String(item?.lastManualOverrideAt || ""),
        lastManualOverrideBy: String(item?.lastManualOverrideBy || ""),
        lastManualOverrideNote: String(item?.lastManualOverrideNote || ""),
        lastSeenAt: String(item?.lastSeenAt || ""),
        latestValidatedFix: String(item?.latestValidatedFix || ""),
        avoidText: String(item?.avoidText || ""),
        learningCounts: {
          validated: toNumber(item?.learningCounts?.validated, 0),
          failed: toNumber(item?.learningCounts?.failed, 0),
          partial: toNumber(item?.learningCounts?.partial, 0),
        },
      }))
    : [];

  return {
    updatedAt: String(source.updatedAt || ""),
    contextKey: String(source.contextKey || ""),
    storePath: String(source.storePath || ""),
    summary: {
      entries: toNumber(source.summary?.entries, entries.length),
      validatedEntries: toNumber(source.summary?.validatedEntries, entries.filter((item) => item.learningCounts.validated > 0).length),
      failedEntries: toNumber(source.summary?.failedEntries, entries.filter((item) => item.learningCounts.failed > 0).length),
      partialEntries: toNumber(source.summary?.partialEntries, entries.filter((item) => item.learningCounts.partial > 0).length),
      promotedEntries: toNumber(source.summary?.promotedEntries, entries.filter((item) => item.promotionCount > 0).length),
      manualOverrideEntries: toNumber(source.summary?.manualOverrideEntries, entries.filter((item) => item.manualOverrideCount > 0).length),
    },
    entries,
  };
}

function normalizeSelfHealingAttempt(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  return {
    id: String(item.id || `healing-attempt-${index + 1}`),
    issueKey: String(item.issueKey || ""),
    issueCode: String(item.issueCode || "UNKNOWN"),
    title: String(item.title || item.issueCode || `Healing attempt ${index + 1}`),
    route: String(item.route || "/"),
    action: String(item.action || ""),
    severity: String(item.severity || "low"),
    eligibility: String(item.eligibility || "blocked"),
    healingMode: String(item.healingMode || "suggest_only"),
    confidenceScore: toNumber(item.confidenceScore, 0),
    confidenceLevel: String(item.confidenceLevel || ""),
    strategyId: String(item.strategyId || ""),
    strategySummary: String(item.strategySummary || ""),
    suggestedNextStep: String(item.suggestedNextStep || ""),
    attemptedResolution: String(item.attemptedResolution || ""),
    promptText: String(item.promptText || ""),
    requiresConfirmation: item.requiresConfirmation === true,
    promptReady: item.promptReady === true,
    directActionAvailable: item.directActionAvailable === true,
    status: String(item.status || "prepared"),
    outcome: String(item.outcome || "pending"),
    outcomeSummary: String(item.outcomeSummary || ""),
    collateralRegressionCount: toNumber(item.collateralRegressionCount, 0),
    updatedAt: String(item.updatedAt || item.createdAt || ""),
    revalidatedAt: String(item.revalidatedAt || ""),
  };
}

function normalizeSelfHealingStrategy(input, index = 0) {
  const item = input && typeof input === "object" ? input : {};
  const hasIdentity = [
    item.issueKey,
    item.issueCode,
    item.strategyId,
    item.eligibility,
    item.promptText,
    item.resolutionLead,
  ].some((value) => String(value || "").trim().length > 0);
  if (!hasIdentity) {
    return null;
  }
  const rationale = Array.isArray(item.rationale) ? item.rationale.map((entry) => String(entry)).filter(Boolean) : [];
  const lastAttemptInput = item.lastAttempt && typeof item.lastAttempt === "object" ? item.lastAttempt : {};
  return {
    issueKey: String(item.issueKey || `healing-issue-${index + 1}`),
    issueCode: String(item.issueCode || item.code || "UNKNOWN"),
    route: String(item.route || "/"),
    action: String(item.action || ""),
    severity: String(item.severity || "low"),
    eligibility: String(item.eligibility || "blocked"),
    healingMode: String(item.healingMode || "suggest_only"),
    confidenceScore: toNumber(item.confidenceScore, 0),
    confidenceLabel: String(item.confidenceLabel || ""),
    confidenceReason: String(item.confidenceReason || ""),
    strategyId: String(item.strategyId || ""),
    strategyDescription: String(item.strategyDescription || ""),
    resolutionLead: String(item.resolutionLead || ""),
    resolutionSource: String(item.resolutionSource || ""),
    promptReady: item.promptReady === true,
    directActionAvailable: item.directActionAvailable === true,
    requiresConfirmation: item.requiresConfirmation === true,
    suggestedNextStep: String(item.suggestedNextStep || ""),
    avoidText: String(item.avoidText || ""),
    promptText: String(item.promptText || ""),
    rationale,
    lastAttempt: String(lastAttemptInput.id || "")
      ? {
          id: String(lastAttemptInput.id || ""),
          status: String(lastAttemptInput.status || "prepared"),
          outcome: String(lastAttemptInput.outcome || "pending"),
          updatedAt: String(lastAttemptInput.updatedAt || ""),
          confidenceLevel: String(lastAttemptInput.confidenceLevel || ""),
          healingMode: String(lastAttemptInput.healingMode || ""),
        }
      : null,
  };
}

function normalizeSelfHealingSnapshot(input) {
  const source = input && typeof input === "object" ? input : {};
  const issues = Array.isArray(source.issues) ? source.issues.map(normalizeSelfHealingStrategy).filter(Boolean) : [];
  const attempts = Array.isArray(source.attempts) ? source.attempts.map(normalizeSelfHealingAttempt) : [];
  return {
    updatedAt: String(source.updatedAt || ""),
    contextKey: String(source.contextKey || ""),
    storePath: String(source.storePath || ""),
    summary: {
      issues: toNumber(source.summary?.issues, issues.length),
      eligible: toNumber(source.summary?.eligible, issues.filter((item) => item.eligibility === "eligible_for_healing").length),
      assistOnly: toNumber(source.summary?.assistOnly, issues.filter((item) => item.eligibility === "assist_only").length),
      manualOnly: toNumber(source.summary?.manualOnly, issues.filter((item) => item.eligibility === "manual_only").length),
      blocked: toNumber(source.summary?.blocked, issues.filter((item) => item.eligibility === "blocked").length),
      unsafe: toNumber(source.summary?.unsafe, issues.filter((item) => item.eligibility === "unsafe").length),
      promptReady: toNumber(source.summary?.promptReady, issues.filter((item) => item.promptReady === true).length),
      orchestrated: toNumber(source.summary?.orchestrated, issues.filter((item) => item.healingMode === "orchestrated_healing").length),
      pendingAttempts: toNumber(source.summary?.pendingAttempts, attempts.filter((item) => item.outcome === "pending").length),
      validatedAttempts: toNumber(source.summary?.validatedAttempts, attempts.filter((item) => item.outcome === "validated").length),
      failedAttempts: toNumber(source.summary?.failedAttempts, attempts.filter((item) => item.outcome === "failed").length),
      partialAttempts: toNumber(source.summary?.partialAttempts, attempts.filter((item) => item.outcome === "partial").length),
    },
    issues,
    attempts,
  };
}

function normalizeLearningCase(item, index) {
  const entry = item && typeof item === "object" ? item : {};
  return {
    id: String(entry.id || `learning-${index + 1}`),
    outcome: String(entry.outcome || ""),
    title: String(entry.title || `Learning case ${index + 1}`),
    symptom: String(entry.symptom || ""),
    attempt: String(entry.attempt || ""),
    result: String(entry.result || ""),
    finalFix: String(entry.finalFix || ""),
    source: String(entry.source || ""),
  };
}

function normalizeIssue(item, index) {
  const issue = item && typeof item === "object" ? item : {};
  const code = String(issue.code || "UNKNOWN");
  const learningCases = Array.isArray(issue.learningCases) ? issue.learningCases.map(normalizeLearningCase) : [];
  return {
    id: String(issue.id || `issue-${index + 1}`),
    code,
    severity: parseSeverity(issue.severity, code),
    route: String(issue.route || "/"),
    action: String(issue.action || ""),
    detail: String(issue.detail || "No detail provided."),
    recommendedResolution: String(issue.recommendedResolution || "Review the root cause and validate with a fresh run."),
    possibleResolution: String(issue.possibleResolution || ""),
    finalResolution: String(issue.finalResolution || ""),
    learningSource: String(issue.learningSource || ""),
    learningStatus: String(issue.learningStatus || ""),
    finalResolutionOrigin: String(issue.finalResolutionOrigin || ""),
    resolutionConfidence: String(issue.resolutionConfidence || ""),
    promotionSource: String(issue.promotionSource || ""),
    promotionCount: toNumber(issue.promotionCount, 0),
    lastValidatedAt: String(issue.lastValidatedAt || ""),
    manualOverrideCount: toNumber(issue.manualOverrideCount, 0),
    lastManualOverrideAt: String(issue.lastManualOverrideAt || ""),
    lastManualOverrideBy: String(issue.lastManualOverrideBy || ""),
    lastManualOverrideNote: String(issue.lastManualOverrideNote || ""),
    learningCounts: {
      validated: toNumber(issue.learningCounts?.validated, learningCases.filter((item) => item.outcome === "validated").length),
      failed: toNumber(issue.learningCounts?.failed, learningCases.filter((item) => item.outcome === "failed").length),
      partial: toNumber(issue.learningCounts?.partial, learningCases.filter((item) => item.outcome === "partial").length),
    },
    learningCases,
    group: ISSUE_GROUP[code] || "Other issue",
    viewportLabel: String(issue.viewportLabel || ""),
    viewport: String(issue.viewport || ""),
    assistantHint: issue.assistantHint && typeof issue.assistantHint === "object" ? issue.assistantHint : {},
    diagnosis: normalizeDiagnosis(issue.diagnosis && typeof issue.diagnosis === "object" ? issue.diagnosis : {}),
    evidence: Array.isArray(issue.evidence) ? issue.evidence.map(normalizeEvidenceItem).filter((item) => item.path) : [],
    impact: normalizeImpact(issue.impact),
    selfHealing: normalizeSelfHealingStrategy(issue.selfHealing, index),
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

function normalizeImpact(input) {
  const source = input && typeof input === "object" ? input : {};
  return {
    impactScore: toNumber(source.impactScore, 0),
    impactCategory: String(source.impactCategory || ""),
    priorityLevel: String(source.priorityLevel || "P4"),
    riskType: String(source.riskType || ""),
    confidence: String(source.confidence || ""),
    recurringCount: toNumber(source.recurringCount, 0),
    rationale: Array.isArray(source.rationale) ? source.rationale.map((item) => String(item)).filter(Boolean) : [],
  };
}

function normalizeIntelligence(input) {
  const source = input && typeof input === "object" ? input : {};
  const executiveSummary = source.executiveSummary && typeof source.executiveSummary === "object" ? source.executiveSummary : {};
  const patterns = Array.isArray(source.patterns)
    ? source.patterns.map((item, index) => ({
        id: String(item?.id || `pattern-${index + 1}`),
        type: String(item?.type || ""),
        label: String(item?.label || ""),
        count: toNumber(item?.count, 0),
        detail: String(item?.detail || ""),
      })).filter((item) => item.label)
    : [];
  const topIssues = Array.isArray(source.topIssues)
    ? source.topIssues.map((item) => ({
        code: String(item?.code || "UNKNOWN"),
        route: String(item?.route || "/"),
        action: String(item?.action || ""),
        severity: String(item?.severity || "low"),
        detail: String(item?.detail || ""),
        impactScore: toNumber(item?.impactScore, 0),
        impactCategory: String(item?.impactCategory || ""),
        priorityLevel: String(item?.priorityLevel || "P4"),
        riskType: String(item?.riskType || ""),
        confidence: String(item?.confidence || ""),
      }))
    : [];
  return {
    updatedAt: String(source.updatedAt || ""),
    contextKey: String(source.contextKey || ""),
    summary: {
      p0: toNumber(source.summary?.p0, 0),
      p1: toNumber(source.summary?.p1, 0),
      p2: toNumber(source.summary?.p2, 0),
      p3: toNumber(source.summary?.p3, 0),
      p4: toNumber(source.summary?.p4, 0),
      highImpactIssues: toNumber(source.summary?.highImpactIssues, 0),
      recurringPatterns: toNumber(source.summary?.recurringPatterns, 0),
      validatedPatterns: toNumber(source.summary?.validatedPatterns, 0),
      failedPatterns: toNumber(source.summary?.failedPatterns, 0),
      averageImpactScore: toNumber(source.summary?.averageImpactScore, 0),
    },
    executiveSummary: {
      headline: String(executiveSummary.headline || ""),
      topRisks: Array.isArray(executiveSummary.topRisks) ? executiveSummary.topRisks.map((item) => String(item)).filter(Boolean) : [],
      topOpportunities: Array.isArray(executiveSummary.topOpportunities) ? executiveSummary.topOpportunities.map((item) => String(item)).filter(Boolean) : [],
      criticalFixes: Array.isArray(executiveSummary.criticalFixes) ? executiveSummary.criticalFixes.map((item) => String(item)).filter(Boolean) : [],
      recommendedActionOrder: Array.isArray(executiveSummary.recommendedActionOrder) ? executiveSummary.recommendedActionOrder.map((item) => String(item)).filter(Boolean) : [],
    },
    patterns,
    topIssues,
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
  const intelligence = normalizeIntelligence(source.intelligence);
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
      visualHierarchyCollapse: toNumber(summary.visualHierarchyCollapse, countByCode(issues, ["VISUAL_HIERARCHY_COLLAPSE"])),
      visualClusterCollision: toNumber(summary.visualClusterCollision, countByCode(issues, ["VISUAL_CLUSTER_COLLISION"])),
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
          "VISUAL_HIERARCHY_COLLAPSE",
          "VISUAL_CLUSTER_COLLISION",
        ]),
      ),
      buttonsNoEffect: toNumber(summary.buttonsNoEffect, 0),
      consoleErrors: toNumber(summary.consoleErrors, 0),
      seoScore: toNumber(summary.seoScore, seo.overallScore),
      seoCriticalIssues: toNumber(summary.seoCriticalIssues, 0),
      seoTotalIssues: toNumber(summary.seoTotalIssues, 0),
      seoPagesAnalyzed: toNumber(summary.seoPagesAnalyzed, seo.pagesAnalyzed),
      priorityP0: toNumber(summary.priorityP0, issues.filter((item) => item.impact?.priorityLevel === "P0").length),
      priorityP1: toNumber(summary.priorityP1, issues.filter((item) => item.impact?.priorityLevel === "P1").length),
      priorityP2: toNumber(summary.priorityP2, issues.filter((item) => item.impact?.priorityLevel === "P2").length),
      priorityP3: toNumber(summary.priorityP3, issues.filter((item) => item.impact?.priorityLevel === "P3").length),
      priorityP4: toNumber(summary.priorityP4, issues.filter((item) => item.impact?.priorityLevel === "P4").length),
      topImpactScore: toNumber(summary.topImpactScore, Math.max(...issues.map((item) => Number(item.impact?.impactScore || 0)), 0)),
      mobileProfilesAnalyzed: toNumber(summary.mobileProfilesAnalyzed, meta.mobileSweep?.profiles?.length || 0),
      durationMs,
    },
    assistantGuide,
    intelligence,
    seo: {
      overallScore: toNumber(seo.overallScore, 0),
      topRecommendations: Array.isArray(seo.topRecommendations) ? seo.topRecommendations.map((item) => String(item)).filter(Boolean) : [],
    },
    learningMemory: normalizeLearningMemory(source.learningMemory),
    selfHealing: normalizeSelfHealingSnapshot(source.selfHealing),
    issues: issues.sort((left, right) =>
      priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel)
      || toNumber(right.impact?.impactScore, 0) - toNumber(left.impact?.impactScore, 0)
      || severityRank(right.severity) - severityRank(left.severity)),
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
    // Start with a fresh session: do not preload any target URL.
    // Persisted profile is used only for non-visual defaults (mode/scope/depth).
    stateEl.targetUrl.value = "";
    return;
  }

  // Do not rehydrate the last target URL into the visible UI.
  // This avoids leaking the previous site to the next session.
  stateEl.targetUrl.value = "";
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

function renderEngineSummaryStrip(report) {
  const el = stateEl.engineSummaryStrip;
  if (!el) return;
  if (!report) {
    el.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  const snap = buildDesktopIntelligenceSnapshot(report);
  const memory = snap.learningMemory?.summary?.entries ?? 0;
  const healingReady = snap.selfHealing?.summary?.promptReady ?? 0;
  const healingEligible = snap.selfHealing?.summary?.eligible ?? 0;
  const issues = report.summary?.totalIssues ?? 0;
  const predictiveN = snap.predictive?.summary?.highRiskAlerts ?? 0;
  const qualityState = snap.dataIntelligence?.QUALITY_STATE || {};
  const trajectory = qualityState.trajectory || "stable";
  const optCount = Array.isArray(snap.optimization?.topImprovements) ? snap.optimization.topImprovements.length : 0;
  const qcWarnings = Array.isArray(snap.qualityControl?.topWarnings) ? snap.qualityControl.topWarnings.length : 0;
  const baselineSet = !!(uiState.baseline && uiState.baseline.report);
  const segments = [];
  const issuesClass = issues > 0 ? " engine-strip-issues-bad" : "";
  segments.push(`<button type="button" class="engine-strip-link engine-strip-issues${issuesClass}" data-strip-view="findings">Issues ${issues}</button>`);
  segments.push(`<button type="button" class="engine-strip-link engine-strip-memory" data-strip-view="settings">Memory ${memory}</button>`);
  segments.push(`<button type="button" class="engine-strip-link engine-strip-healing" data-strip-view="prompts">Healing ${healingReady} ready</button>`);
  if (predictiveN > 0) segments.push(`<button type="button" class="engine-strip-link engine-strip-predictive engine-strip-predictive-warn" data-strip-view="overview">Predictive ${predictiveN}</button>`);
  if (optCount > 0) segments.push(`<button type="button" class="engine-strip-link engine-strip-optimization" data-strip-view="overview" data-strip-scroll="optimization">Optimization ${optCount}</button>`);
  if (qcWarnings > 0) segments.push(`<button type="button" class="engine-strip-link engine-strip-qc engine-strip-qc-warn" data-strip-view="overview" data-strip-scroll="qualityControl">QC ${qcWarnings}</button>`);
  const trajectoryClass = trajectory === "improving" ? " engine-strip-trajectory-ok" : trajectory === "degrading" ? " engine-strip-trajectory-bad" : "";
  segments.push(`<span class="engine-strip-text engine-strip-trajectory${trajectoryClass}">Trajectory ${trajectory}</span>`);
  const baselineClass = baselineSet ? " engine-strip-baseline-ok" : "";
  segments.push(`<button type="button" class="engine-strip-link engine-strip-baseline${baselineClass}" data-strip-view="compare">${baselineSet ? "Baseline set" : "Baseline none"}</button>`);
  el.classList.remove("hidden");
  el.innerHTML = segments.join(" · ");
}

function renderSystemStateStrip(report) {
  if (!stateEl.systemStateIssues) return;
  if (!report) {
    stateEl.systemStateIssues.textContent = "0";
    if (stateEl.systemStateMemory) stateEl.systemStateMemory.textContent = "0";
    if (stateEl.systemStateHealingReady) stateEl.systemStateHealingReady.textContent = "0";
    if (stateEl.systemStatePredictiveAlerts) stateEl.systemStatePredictiveAlerts.textContent = "0";
    if (stateEl.systemStateOptimization) stateEl.systemStateOptimization.textContent = "0";
    if (stateEl.systemStateTrajectory) stateEl.systemStateTrajectory.textContent = "—";
    return;
  }
  const snap = buildDesktopIntelligenceSnapshot(report);
  const memory = snap.learningMemory?.summary?.entries ?? 0;
  const healingReady = snap.selfHealing?.summary?.promptReady ?? 0;
  const issues = report.summary?.totalIssues ?? 0;
  const predictiveN = snap.predictive?.summary?.highRiskAlerts ?? 0;
  const optCount = Array.isArray(snap.optimization?.topImprovements) ? snap.optimization.topImprovements.length : 0;
  const qualityState = snap.dataIntelligence?.QUALITY_STATE || {};
  const trajectory = qualityState.trajectory || "stable";
  stateEl.systemStateIssues.textContent = String(issues);
  if (stateEl.systemStateMemory) stateEl.systemStateMemory.textContent = String(memory);
  if (stateEl.systemStateHealingReady) stateEl.systemStateHealingReady.textContent = String(healingReady);
  if (stateEl.systemStatePredictiveAlerts) stateEl.systemStatePredictiveAlerts.textContent = String(predictiveN);
  if (stateEl.systemStateOptimization) stateEl.systemStateOptimization.textContent = String(optCount);
  if (stateEl.systemStateTrajectory) stateEl.systemStateTrajectory.textContent = String(trajectory);
}

function renderNextActionBlock(report) {
  if (!stateEl.nextActionDescription) return;
  const snap = report ? buildDesktopIntelligenceSnapshot(report) : null;
  const riskState = snap?.dataIntelligence?.RISK_STATE || {};
  const nextActions = Array.isArray(snap?.autonomous?.nextActions) ? snap.autonomous.nextActions : [];
  const priorityQueue = Array.isArray(riskState.priorityQueue) ? riskState.priorityQueue : [];
  const lead = nextActions[0] || priorityQueue[0] || null;
  uiState.nextActionLead = lead;
  if (!lead) {
    stateEl.nextActionDescription.textContent = "Run an audit to generate the next recommended action.";
    if (stateEl.nextActionOpenIssue) stateEl.nextActionOpenIssue.disabled = true;
    if (stateEl.nextActionPrepareHealing) stateEl.nextActionPrepareHealing.disabled = true;
    if (stateEl.nextActionGeneratePrompt) stateEl.nextActionGeneratePrompt.disabled = true;
    return;
  }
  const routeLabel = lead.route === "/" ? "home" : (lead.route || "").replace(/^\//, "") || "—";
  const actionLabel = lead.actionLabel || lead.playbookTitle || `${lead.issueCode || "issue"}`;
  stateEl.nextActionDescription.textContent = `Fix ${actionLabel} on /${routeLabel}`;
  if (stateEl.nextActionOpenIssue) stateEl.nextActionOpenIssue.disabled = false;
  if (stateEl.nextActionPrepareHealing) stateEl.nextActionPrepareHealing.disabled = false;
  if (stateEl.nextActionGeneratePrompt) stateEl.nextActionGeneratePrompt.disabled = false;
}

function renderCompactRunHistory() {
  const el = stateEl.compactRunHistory;
  const wrap = stateEl.compactRunHistoryWrap;
  if (!el) return;
  const history = Array.isArray(uiState.history) ? uiState.history.slice(0, 8) : [];
  if (!history.length) {
    if (wrap) wrap.classList.add("hidden");
    el.innerHTML = "";
    return;
  }
  if (wrap) wrap.classList.remove("hidden");
  el.innerHTML = history.map((item, index) => {
    const prev = history[index + 1];
    let purpose = "—";
    if (index === 0 && !prev) purpose = "latest";
    else if (prev && Number.isFinite(item.issueCount) && Number.isFinite(prev.issueCount)) {
      if (item.issueCount < prev.issueCount) purpose = "↓ better";
      else if (item.issueCount > prev.issueCount) purpose = "↑ worse";
      else purpose = "→ stable";
    }
    const baseUrlShort = (item.baseUrl || "").length > 20 ? (item.baseUrl || "").slice(0, 17) + "…" : (item.baseUrl || "");
    const isBaseline = uiState.baseline?.stamp === item.stamp;
    const isLastStable = index === 0 && purpose === "→ stable";
    return `
      <div class="compact-run-row">
        <span class="compact-run-meta">${escapeHtml(formatLocalDate(item.stamp))} · ${escapeHtml(String(item.issueCount || 0))} issues</span>
        ${baseUrlShort ? `<span class="compact-run-url" title="${escapeHtml(item.baseUrl || "")}">${escapeHtml(baseUrlShort)}</span>` : ""}
        <span class="compact-run-purpose">${escapeHtml(purpose)}</span>
        ${isBaseline ? '<span class="pill ok baseline-tag">baseline</span>' : ""}
        ${isLastStable ? '<span class="pill">last stable</span>' : ""}
        <button type="button" class="op-btn-secondary compact-run-action" data-history-index="${index}" data-history-action="load">Load</button>
        <button type="button" class="op-btn-secondary compact-run-action" data-history-index="${index}" data-history-action="baseline">Baseline</button>
      </div>
    `;
  }).join("");
}

function renderWorkspaceHeader(viewName) {
  const meta = VIEW_META[viewName] || VIEW_META.overview;
  if (stateEl.workspaceEyebrow) stateEl.workspaceEyebrow.textContent = meta.eyebrow;
  if (stateEl.workspaceTitle) stateEl.workspaceTitle.textContent = meta.title;
  if (stateEl.workspaceDescription) stateEl.workspaceDescription.textContent = meta.description;
  if (stateEl.topbarContext) stateEl.topbarContext.textContent = meta.title;
  if (stateEl.workspaceHeader) {
    stateEl.workspaceHeader.classList.toggle("workspace-header-overview", viewName === "overview");
  }
  if (stateEl.workspaceShell) {
    stateEl.workspaceShell.setAttribute("data-view", viewName);
    stateEl.workspaceShell.className = stateEl.workspaceShell.className.replace(/\bworkspace-view-\S+/g, "").trim();
    stateEl.workspaceShell.classList.add("workspace-view-" + viewName);
  }
  renderBaselineIndicator();
  renderCompactRunHistory();
  renderEngineSummaryStrip(getVisibleReport());
}

function renderBaselineIndicator() {
  if (!stateEl.baselineIndicator) return;
  const baseline = uiState.baseline && uiState.baseline.report ? uiState.baseline : null;
  if (stateEl.baselineIndicatorWrap) stateEl.baselineIndicatorWrap.classList.toggle("hidden", !baseline);
  stateEl.baselineIndicator.textContent = baseline ? `Baseline: ${formatLocalDate(baseline.stamp)}` : "None";
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
      { id: "tools-update-check", label: "Check for Updates", hint: "", action: () => checkForUpdates() },
      { id: "tools-update-download", label: "Download Update", hint: "", action: () => downloadUpdate() },
      { id: "tools-update-install", label: "Install Update and Restart", hint: "", action: () => installUpdate() },
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

function workspaceSurfaceEl() {
  return document.getElementById("workspaceSurfaceInner") || document.getElementById("workspace-host");
}

function getReportIssues(report) {
  if (!report || typeof report !== "object") return [];
  const candidates = [
    report.issues,
    report.issueList,
    report.findings,
    report.findingsList,
    report.summary?.issues,
    report.audit?.issues,
    report.result?.issues,
  ];

  for (const entry of candidates) {
    if (Array.isArray(entry)) return entry.filter(Boolean);
  }

  return [];
}

function getIssueCode(issue) {
  return String(
    issue?.code ||
    issue?.issueCode ||
    issue?.group ||
    issue?.type ||
    issue?.id ||
    "Unknown issue"
  );
}

function getIssueSeverity(issue) {
  return String(issue?.severity || issue?.priority || issue?.level || "unknown").toLowerCase();
}

function escapeHtmlSafe(value) {
  return escapeHtml(String(value == null ? "" : value));
}

function summarizeWorkspaceData(report) {
  const issues = getReportIssues(report);
  const summary = report?.summary || {};
  const snapshot =
    typeof buildDesktopIntelligenceSnapshot === "function" && report
      ? buildDesktopIntelligenceSnapshot(report)
      : null;

  const dataIntelligence = snapshot?.dataIntelligence || {};
  const riskState = dataIntelligence.RISK_STATE || {};
  const trendState = dataIntelligence.TREND_STATE || {};
  const compare =
    typeof buildCompareSnapshot === "function"
      ? buildCompareSnapshot(report, uiState.baseline)
      : null;

  const severityGroups = issues.reduce((acc, issue) => {
    const key = getIssueSeverity(issue);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topIssues = issues
    .slice()
    .sort((a, b) => {
      const rank = { critical: 5, high: 4, medium: 3, low: 2, info: 1, unknown: 0 };
      return (rank[getIssueSeverity(b)] || 0) - (rank[getIssueSeverity(a)] || 0);
    })
    .slice(0, 6);

  return {
    report,
    issues,
    topIssues,
    summary,
    snapshot,
    compare,
    severityGroups,
    counts: {
      totalIssues: Number(summary.totalIssues || issues.length || 0),
      routes: Number(summary.routesChecked || summary.totalRoutes || report?.routes?.length || 0),
      actions: Number(summary.actionsMapped || summary.totalActions || report?.actions?.length || 0),
      seo: Number(summary.seoScore || report?.seo?.score || 0),
      quality: Number(summary.overallScore || report?.quality?.score || report?.score || 0),
      riskHigh: Number(riskState.highRiskCount || snapshot?.predictive?.highRiskAlerts || 0),
      recurring: Number(riskState.recurringPatterns || snapshot?.predictive?.recurringPatterns || 0),
      newIssues: Number(compare?.newIssues?.length || 0),
      resolvedIssues: Number(compare?.resolvedIssues?.length || 0),
      regressions: Number(compare?.regressions?.length || 0),
      persistent: Number(compare?.persistentIssues?.length || 0),
      memory: Number(snapshot?.learningMemory?.entries?.length || snapshot?.learningMemory?.totalEntries || 0),
      healing: Number(snapshot?.selfHealing?.summary?.readyCount || snapshot?.selfHealing?.readyCount || 0),
    },
    trend: {
      seo: trendState.seoTrend || snapshot?.continuous?.trends?.seo || "stable",
      runtime: trendState.runtimeTrend || snapshot?.continuous?.trends?.runtime || "stable",
      ux: trendState.uxTrend || snapshot?.continuous?.trends?.ux || "stable",
      trajectory: snapshot?.optimization?.summary?.trajectory || summary.trajectory || "stable",
    },
  };
}

function renderMetricCard(label, value, detail) {
  return `
    <div class="workspace-card">
      <p class="workspace-kicker">${escapeHtmlSafe(label)}</p>
      <p class="mt-3 workspace-big-number">${escapeHtmlSafe(value)}</p>
      <p class="mt-2 text-[12px] text-text-tertiary">${escapeHtmlSafe(detail)}</p>
    </div>
  `;
}

function renderListBlock(title, items, emptyText) {
  const rows = (items || []).length
    ? items.map((item, index) => `
        <div class="workspace-list-item">
          <span class="workspace-list-index">${index + 1}</span>
          <div class="min-w-0">
            <p class="text-[13px] font-medium text-text-primary">${escapeHtmlSafe(item.title || item.label || item.name || item)}</p>
            ${item.detail ? `<p class="mt-1 text-[12px] leading-6 text-text-tertiary">${escapeHtmlSafe(item.detail)}</p>` : ""}
          </div>
        </div>
      `).join("")
    : `<div class="workspace-list-item"><div class="min-w-0"><p class="text-[13px] text-text-tertiary">${escapeHtmlSafe(emptyText)}</p></div></div>`;

  return `
    <section class="workspace-card">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="workspace-kicker">Group</p>
          <h3 class="mt-1 text-[16px] font-medium text-text-primary">${escapeHtmlSafe(title)}</h3>
        </div>
      </div>
      <div class="workspace-list mt-4">${rows}</div>
    </section>
  `;
}

function buildWorkspaceSurface(viewName, report) {
  const data = summarizeWorkspaceData(report);

  const severityPills = [
    { label: `critical ${data.severityGroups.critical || 0}` },
    { label: `high ${data.severityGroups.high || 0}` },
    { label: `medium ${data.severityGroups.medium || 0}` },
    { label: `low ${data.severityGroups.low || 0}` },
  ];

  const topIssueRows = data.topIssues.map((issue) => ({
    title: getIssueCode(issue),
    detail: `${getIssueSeverity(issue)} · ${issue?.route || issue?.page || issue?.url || issue?.selector || issue?.summary || issue?.message || "needs operator review"}`,
  }));

  const templates = {
    overview: {
      eyebrow: "Operator workspace",
      title: "Living command room",
      desc: "This is no longer a mirrored shell. It behaves like a breathing operator room: mission state, signal pressure, memory posture and command lanes in one dedicated surface.",
      tabs: ["Mission", "Signals", "Memory", "Actions"],
      metrics: [
        ["Quality", data.counts.quality, `${data.counts.totalIssues} active findings in this snapshot`],
        ["Routes", data.counts.routes, `${data.counts.actions} mapped actions`],
        ["Memory", data.counts.memory, `${data.counts.healing} healing candidates ready`],
        ["Trajectory", data.trend.trajectory, `SEO ${data.trend.seo} · Runtime ${data.trend.runtime}`],
      ],
      leftTitle: "What the operator should touch now",
      leftItems: topIssueRows,
      rightTitle: "Active lanes",
      rightItems: [
        { title: "Mission brief", detail: `Target: ${report?.meta?.targetUrl || report?.targetUrl || uiState.preview?.requestedUrl || "no target loaded"}` },
        { title: "Run posture", detail: `Mode ${uiState.mode} · scope ${uiState.scope} · depth ${uiState.depth}` },
        { title: "Current pressure", detail: `${data.counts.riskHigh} high-risk alerts and ${data.counts.recurring} recurring patterns detected.` },
      ],
      groups: [
        {
          title: "Command lanes",
          items: [
            { label: "Open findings", sublabel: "Jump straight into the priority queue", action: "open-findings" },
            { label: "Open compare", sublabel: "Read delta and regression posture", action: "open-compare" },
            { label: "Open SEO", sublabel: "Inspect search pressure as its own room", action: "open-seo" },
          ],
        },
        {
          title: "System pulse",
          items: [
            { label: "Engine", sublabel: "Operator ready · live posture synced" },
            { label: "Memory", sublabel: `${data.counts.memory} entries available for prompts and triage` },
            { label: "Healing", sublabel: `${data.counts.healing} candidates waiting for replay validation` },
          ],
        },
      ],
    },

    findings: {
      eyebrow: "Findings workspace",
      title: "Issue command board",
      desc: "No more mirrored overview. Findings becomes its own board with triage groups, visual pressure, route pressure and memory-backed action lanes.",
      tabs: ["Queue", "Critical", "Visual", "Routes"],
      metrics: [
        ["Total issues", data.counts.totalIssues, `Critical ${data.severityGroups.critical || 0} · High ${data.severityGroups.high || 0}`],
        ["High risk", data.counts.riskHigh, `${data.counts.recurring} recurring patterns`],
        ["Routes affected", data.counts.routes, `${data.counts.actions} action surfaces involved`],
        ["Healing ready", data.counts.healing, `${data.counts.memory} memory entries linked`],
      ],
      leftTitle: "Priority queue",
      leftItems: topIssueRows,
      rightTitle: "Triage groups",
      rightItems: [
        { title: "Critical first", detail: `Resolve severity pressure before cosmetic work. ${data.severityGroups.critical || 0} critical items detected.` },
        { title: "Memory-backed", detail: `${data.counts.memory} learned entries can enrich prompts and resolution paths.` },
        { title: "Visual system", detail: "Use dedicated visual lane for spacing, overlap, boundary and hierarchy issues." },
      ],
      groups: [
        {
          title: "Quick triage",
          items: [
            { label: "Why is score down?", sublabel: "Injects a command into the operator dock", action: "ask-score-down" },
            { label: "Show SEO issues", sublabel: "Filters the work toward search-related findings", action: "ask-seo-issues" },
            { label: "Generate fix plan", sublabel: "Opens the planning path from the issue board", action: "ask-fix-plan" },
          ],
        },
        {
          title: "Board posture",
          items: [
            { label: "Severity pressure", sublabel: `${data.severityGroups.critical || 0} critical · ${data.severityGroups.high || 0} high` },
            { label: "Recurring patterns", sublabel: `${data.counts.recurring} patterns surfaced across comparable runs` },
            { label: "Route footprint", sublabel: `${data.counts.routes} routes touched by the current snapshot` },
          ],
        },
      ],
    },

    seo: {
      eyebrow: "SEO workspace",
      title: "Search command center",
      desc: "A proper SEO room: score, technical pressure, content pressure and opportunity clusters in an independent surface.",
      tabs: ["Executive", "Technical", "Content", "Clusters"],
      metrics: [
        ["SEO score", data.counts.seo, `Trajectory ${data.trend.seo}`],
        ["Issues", data.counts.totalIssues, `Search and metadata signals combined`],
        ["Risk alerts", data.counts.riskHigh, `${data.counts.recurring} recurring SEO patterns`],
        ["Opportunity groups", data.snapshot?.optimization?.opportunityGroups?.length || 0, `Structural fixes over one-off noise`],
      ],
      leftTitle: "Top SEO pressure",
      leftItems: topIssueRows
        .filter((row) => /seo|meta|canon|schema|lang|index/i.test(row.title + " " + row.detail))
        .slice(0, 6),
      rightTitle: "SEO groups",
      rightItems: [
        { title: "Technical SEO", detail: "Canonical, language, schema, indexability and crawl integrity." },
        { title: "Content clarity", detail: "Search intent coverage, duplication, metadata and structure." },
        { title: "Opportunity clusters", detail: `${data.snapshot?.optimization?.topImprovements?.length || 0} structural improvements surfaced by optimization intelligence.` },
      ],
      groups: [
        {
          title: "SEO lanes",
          items: [
            { label: "Technical lane", sublabel: "Canonical, schema, indexability, language" },
            { label: "Content lane", sublabel: "Metadata, headings, coverage, duplication" },
            { label: "Opportunity lane", sublabel: "Prioritize structural gains over scattered noise" },
          ],
        },
        {
          title: "Operator moves",
          items: [
            { label: "Back to findings", sublabel: "Return to the fix queue with SEO context", action: "open-findings" },
            { label: "Open compare", sublabel: "Measure whether SEO changes improved the run", action: "open-compare" },
            { label: "Ask for SEO issues", sublabel: "Pushes a direct question to the dock", action: "ask-seo-issues" },
          ],
        },
      ],
    },

    compare: {
      eyebrow: "Compare workspace",
      title: "Delta and regression room",
      desc: "A real compare room with new, resolved, persistent and regression groups instead of a text swap inside the main shell.",
      tabs: ["Delta", "Regressions", "Resolved", "Persistent"],
      metrics: [
        ["New", data.counts.newIssues, `New findings vs baseline or previous comparable run`],
        ["Resolved", data.counts.resolvedIssues, `Items that disappeared after change or rerun`],
        ["Regressions", data.counts.regressions, `Things that got worse`],
        ["Persistent", data.counts.persistent, `Unresolved repeated pressure`],
      ],
      leftTitle: "Comparison signals",
      leftItems: [
        { title: "New issues", detail: `${data.counts.newIssues} detected in the current comparable context.` },
        { title: "Resolved issues", detail: `${data.counts.resolvedIssues} removed from the latest delta.` },
        { title: "Regressions", detail: `${data.counts.regressions} worsened or reintroduced issues.` },
      ],
      rightTitle: "Interpretation",
      rightItems: [
        { title: "Use one comparable context", detail: "Compare should stay aligned with the same target, mode, scope and mobile sweep." },
        { title: "Read regressions first", detail: "Regression pressure should rank above raw issue count changes." },
        { title: "Turn results into action", detail: "The compare room should feed findings, prompts and memory instead of sitting isolated." },
      ],
      groups: [
        {
          title: "Compare moves",
          items: [
            { label: "Open findings", sublabel: "Send unresolved regressions back to the board", action: "open-findings" },
            { label: "Open reports", sublabel: "Load evidence and older snapshots", action: "open-reports" },
            { label: "Ask for fix plan", sublabel: "Turn comparison pressure into execution steps", action: "ask-fix-plan" },
          ],
        },
        {
          title: "Delta logic",
          items: [
            { label: "New", sublabel: `${data.counts.newIssues} issues introduced or newly surfaced` },
            { label: "Resolved", sublabel: `${data.counts.resolvedIssues} issues cleared from the previous context` },
            { label: "Persistent", sublabel: `${data.counts.persistent} pressures stayed alive across runs` },
          ],
        },
      ],
    },

    settings: {
      eyebrow: "Settings workspace",
      title: "Runtime and intelligence policy",
      desc: "Settings becomes a control room for runtime, memory, healing and operator policy — still in the same visual language, but now as its own page group.",
      tabs: ["Runtime", "Memory", "Healing", "Policy"],
      metrics: [
        ["Memory entries", data.counts.memory, `Validated learnings linked to this workstation`],
        ["Healing ready", data.counts.healing, `Prompt-assisted correction candidates`],
        ["Baseline state", uiState.baseline ? "Pinned" : "Open", uiState.baseline ? "Comparison baseline is available" : "No baseline pinned yet"],
        ["Audit mode", uiState.mode, `Scope ${uiState.scope} · depth ${uiState.depth}`],
      ],
      leftTitle: "Operational controls",
      leftItems: [
        { title: "Runtime", detail: "Bridge, reports path, launch rules and engine lifecycle controls." },
        { title: "Memory", detail: "Validated, failed and partial learnings with traceability." },
        { title: "Healing", detail: "Queue eligibility, pending revalidation and prompt-assisted strategies." },
      ],
      rightTitle: "Policy notes",
      rightItems: [
        { title: "Traceability first", detail: "Manual override and auto-promotion must stay visually distinct." },
        { title: "No fake success", detail: "Never mark healing as complete until rerun evidence confirms it." },
        { title: "Operational, not decorative", detail: "Settings should help govern runtime and intelligence, not just hold generic preferences." },
      ],
      groups: [
        {
          title: "Control links",
          items: [
            { label: "Open reports", sublabel: "Jump into evidence and stored snapshots", action: "open-reports" },
            { label: "Open compare", sublabel: "Check baseline and regression posture", action: "open-compare" },
            { label: "Open findings", sublabel: "Return to the live queue after policy changes", action: "open-findings" },
          ],
        },
        {
          title: "Governance posture",
          items: [
            { label: "Traceability", sublabel: "Every promoted learning must point back to evidence" },
            { label: "Validation", sublabel: "Healing stays pending until rerun proves it" },
            { label: "Operator control", sublabel: "The system assists, but the workstation remains explicit" },
          ],
        },
      ],
    },
  };

  const t = templates[viewName] || templates.overview;
  const metricsHtml = t.metrics.map(([label, value, detail]) => renderMetricCard(label, value, detail)).join("");
  const pillsHtml = severityPills.map((pill) => `<span class="workspace-pill">${escapeHtmlSafe(pill.label)}</span>`).join("");
  const tabsHtml = (t.tabs || []).map((tab, index) => `<span class="workspace-seg-tab ${index === 0 ? "is-active" : ""}">${escapeHtmlSafe(tab)}</span>`).join("");

  const groupsHtml = (t.groups || []).map((group) => {
    const rows = (group.items || []).map((item) => {
      const actionBtn = item.action
        ? `<button type="button" class="mt-3 inline-flex items-center gap-2 rounded-full border border-accent-blue/20 bg-accent-blue/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-blue-200 transition hover:bg-accent-blue/15" data-workspace-action="${escapeHtmlSafe(item.action)}">Open</button>`
        : "";

      return `
        <div class="workspace-list-item">
          <div class="min-w-0">
            <p class="text-[13px] font-medium text-text-primary">${escapeHtmlSafe(item.label || item.title || "Lane")}</p>
            <p class="mt-1 text-[12px] leading-6 text-text-tertiary">${escapeHtmlSafe(item.sublabel || item.detail || "")}</p>
            ${actionBtn}
          </div>
        </div>
      `;
    }).join("");

    return `
      <section class="workspace-card">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="workspace-kicker">Zone</p>
            <h3 class="mt-1 text-[16px] font-medium text-text-primary">${escapeHtmlSafe(group.title)}</h3>
          </div>
        </div>
        <div class="workspace-list mt-4">${rows}</div>
      </section>
    `;
  }).join("");

  return `
    <div class="workspace-page-shell p-6 md:p-8">
      <div class="workspace-hero-grid">
        <section class="workspace-card">
          <p class="workspace-kicker">${escapeHtmlSafe(t.eyebrow)}</p>

          <div class="mt-4 flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-text-tertiary">
                <span class="relative inline-flex h-2.5 w-2.5">
                  <span class="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping"></span>
                  <span class="relative rounded-full bg-emerald-400 h-2.5 w-2.5"></span>
                </span>
                Live workspace
              </div>

              <h2 class="mt-4 text-[34px] font-semibold tracking-[-0.04em] text-text-primary">${escapeHtmlSafe(t.title)}</h2>
              <p class="mt-3 max-w-3xl text-[14px] leading-7 text-text-secondary">${escapeHtmlSafe(t.desc)}</p>
            </div>

            <div class="workspace-pill-row">${pillsHtml}</div>
          </div>

          <div class="workspace-seg-tabs mt-5">${tabsHtml}</div>
        </section>

        <section class="workspace-card">
          <p class="workspace-kicker">Live posture</p>

          <div class="workspace-list mt-4">
            <div class="workspace-list-item">
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-text-primary">Target</p>
                <p class="mt-1 text-[12px] text-text-tertiary">${escapeHtmlSafe(report?.meta?.targetUrl || report?.targetUrl || uiState.preview?.requestedUrl || "No target loaded")}</p>
              </div>
            </div>

            <div class="workspace-list-item">
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-text-primary">Execution profile</p>
                <p class="mt-1 text-[12px] text-text-tertiary">Mode ${escapeHtmlSafe(uiState.mode)} · scope ${escapeHtmlSafe(uiState.scope)} · depth ${escapeHtmlSafe(uiState.depth)}</p>
              </div>
            </div>

            <div class="workspace-list-item">
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-text-primary">Signals</p>
                <p class="mt-1 text-[12px] text-text-tertiary">SEO ${escapeHtmlSafe(data.trend.seo)} · Runtime ${escapeHtmlSafe(data.trend.runtime)} · UX ${escapeHtmlSafe(data.trend.ux)}</p>
              </div>
            </div>

            <div class="workspace-list-item">
              <div class="min-w-0">
                <p class="text-[13px] font-medium text-text-primary">Memory pulse</p>
                <p class="mt-1 text-[12px] text-text-tertiary">${escapeHtmlSafe(`${data.counts.memory} linked entries · ${data.counts.healing} healing-ready`)}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section class="workspace-section-grid mt-4">
        ${metricsHtml}
      </section>

      <section class="workspace-section-grid mt-4">
        ${renderListBlock(t.leftTitle, t.leftItems, "No rows available yet for this workspace.")}
        ${renderListBlock(t.rightTitle, t.rightItems, "No grouped notes available yet.")}
      </section>

      <section class="workspace-section-grid mt-4">
        ${groupsHtml || ""}
      </section>
    </div>
  `;
}

function renderWorkspaceSurface(viewName, report) {
  const mount = workspaceSurfaceEl();
  if (!mount) return false;
  mount.innerHTML = buildWorkspaceSurface(viewName, report);
  return true;
}

function shouldUseLocalWorkspaceSurface(viewName) {
  return ["overview", "findings", "seo", "compare", "settings"].includes(
    String(viewName || "").toLowerCase()
  );
}

function handleWorkspaceSurfaceAction(action) {
  const nextAction = String(action || "").trim();
  if (!nextAction) return;

  if (nextAction === "open-findings") {
    switchView("findings");
    return;
  }

  if (nextAction === "open-seo") {
    switchView("seo");
    return;
  }

  if (nextAction === "open-compare") {
    switchView("compare");
    return;
  }

  if (nextAction === "open-reports") {
    switchView("reports");
    return;
  }

  if (nextAction === "ask-score-down") {
    const ask = document.getElementById("dockWhyScoreDown");
    if (ask instanceof HTMLElement) ask.click();
    else if (typeof setInputAndAsk === "function") setInputAndAsk("Why is score down?");
    return;
  }

  if (nextAction === "ask-seo-issues") {
    const ask = document.getElementById("dockShowSeoIssues");
    if (ask instanceof HTMLElement) ask.click();
    else if (typeof setInputAndAsk === "function") setInputAndAsk("Show SEO issues");
    return;
  }

  if (nextAction === "ask-fix-plan") {
    const ask = document.getElementById("dockGenerateFixPlan");
    if (ask instanceof HTMLElement) ask.click();
    else if (typeof setInputAndAsk === "function") setInputAndAsk("Generate fix plan");
  }
}

function bindWorkspaceSurfaceActions() {
  const host = document.getElementById("workspace-host");
  if (!(host instanceof HTMLElement) || host.dataset.boundWorkspaceActions === "1") return;

  host.dataset.boundWorkspaceActions = "1";

  host.addEventListener("click", (event) => {
    const target = event.target instanceof Element
      ? event.target.closest("[data-workspace-action]")
      : null;

    if (!(target instanceof HTMLElement)) return;

    event.preventDefault();
    handleWorkspaceSurfaceAction(target.dataset.workspaceAction);
  });
}

function switchView(viewName) {
  const previousView = uiState.activeView;
  const nextView = VIEW_META[viewName] ? viewName : "overview";

  uiState.activeView = nextView;

  const mappedWorkspace = mapViewToWorkspace(nextView);
  const manager = workspaceSystemManager || (mappedWorkspace ? maybeInitWorkspaceSystem() : null);
  const workspaceHeader = document.getElementById("workspaceHeader");

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

  ensurePatternRailController()?.syncActiveFromView(nextView);

  bindWorkspaceSurfaceActions();

  const localSurfaceHandled =
    shouldUseLocalWorkspaceSurface(nextView) &&
    renderWorkspaceSurface(nextView, getVisibleReport());

  if (localSurfaceHandled) {
    setWorkspaceHostVisible(true);

    if (stateEl.mainGrid) stateEl.mainGrid.classList.add("hidden");
    if (workspaceHeader) workspaceHeader.classList.add("hidden");

    if (
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_FOCUS ||
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_EXPANDED
    ) {
      setAiWorkspaceMode(AI_WORKSPACE_MODE_HIDDEN);
      renderAssistantWorkspaceLayout();
    }

    return;
  }

  const legacyShellViews = ["preview", "operations", "prompts", "reports"];

  if (manager && mappedWorkspace) {
    setWorkspaceHostVisible(true);

    if (stateEl.mainGrid) stateEl.mainGrid.classList.add("hidden");
    if (workspaceHeader) workspaceHeader.classList.add("hidden");

    if (
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_FOCUS ||
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_EXPANDED
    ) {
      setAiWorkspaceMode(AI_WORKSPACE_MODE_HIDDEN);
      renderAssistantWorkspaceLayout();
    }

    if (nextView === "preview") queuePreviewSync("view_switch");

    void manager.switchTo(mappedWorkspace).catch(() => {});
    return;
  }

  if (manager && !mappedWorkspace) {
    setWorkspaceHostVisible(false);
    if (stateEl.mainGrid) stateEl.mainGrid.classList.remove("hidden");
    if (workspaceHeader) workspaceHeader.classList.remove("hidden");
  }

  if (nextView === "settings") {
    setWorkspaceHostVisible(false);
    if (stateEl.mainGrid) stateEl.mainGrid.classList.remove("hidden");

    enableAssistantReactWorkspace();
    setAiWorkspaceMode(AI_WORKSPACE_MODE_EXPANDED);

    if (uiState.aiDockHeightVh < 44) uiState.aiDockHeightVh = 52;
    if (stateEl.appBody) {
      stateEl.appBody.style.setProperty("--ai-dock-height-vh", String(uiState.aiDockHeightVh));
    }

    renderAssistantWorkspaceLayout();
    renderAssistantState();
    refreshStateElRefs();
    return;
  }

  if (legacyShellViews.includes(nextView)) {
    setWorkspaceHostVisible(false);
    if (stateEl.mainGrid) stateEl.mainGrid.classList.remove("hidden");

    if (
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_FOCUS ||
      uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_EXPANDED
    ) {
      setAiWorkspaceMode(AI_WORKSPACE_MODE_HIDDEN);
      renderAssistantWorkspaceLayout();
    }
  }

  if (!manager) {
    setWorkspaceHostVisible(false);
    if (stateEl.mainGrid) stateEl.mainGrid.classList.remove("hidden");
  }

  if (nextView === "preview") {
    queuePreviewSync("view_switch");
  }
}

function openFindingsWithSearch(searchText) {
  const q = String(searchText || "").trim();
  uiState.findingsSearch = q;
  if (stateEl.findingsSearch) {
    stateEl.findingsSearch.value = q;
  }
  switchView("findings");
  renderIssues(getVisibleReport());
}

function executeDoNext() {
  const report = getVisibleReport();
  if (!report) {
    switchView("overview");
    return;
  }
  const snapshot = buildDesktopIntelligenceSnapshot(report);
  const autonomous = snapshot?.autonomous || {};
  const riskState = snapshot?.dataIntelligence?.RISK_STATE || {};
  const nextActions = Array.isArray(autonomous.nextActions) ? autonomous.nextActions : [];
  const recommendedOrder = Array.isArray(riskState.recommendedActionOrder) ? riskState.recommendedActionOrder : [];
  const priorityQueue = Array.isArray(riskState.priorityQueue) ? riskState.priorityQueue : [];
  let lead = nextActions[0] || null;
  if (!lead && recommendedOrder.length > 0) {
    const firstCode = String(recommendedOrder[0] || "").trim();
    if (firstCode) lead = { issueCode: firstCode, route: "/", action: "" };
  }
  if (!lead && priorityQueue.length > 0) lead = priorityQueue[0];
  if (!lead) {
    switchView("overview");
    return;
  }
  const issueCode = lead.issueCode || (typeof lead === "string" ? lead : "");
  const route = lead.route || "/";
  const action = lead.action || "";
  const issue = findVisibleIssue(issueCode, route, action);
  const healing = issue?.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
  if (issue && healing && ["eligible_for_healing", "assist_only"].includes(healing.eligibility)) {
    requestHealingPreparation(issue);
    return;
  }
  openFindingsWithSearch(issueCode || (lead.actionLabel || ""));
}

function previewSurfaceSupportsEmbedding() {
  return !!(stateEl.sitePreview && typeof stateEl.sitePreview.loadURL === "function");
}

function currentPreviewBaseUrl() {
  const audit = uiState.companionState?.audit || {};
  const auditBaseUrl = audit.running === true ? normalizePreviewUrl(audit.baseUrl) : "";
  return auditBaseUrl || getPreparedTargetUrl();
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
  if (stateEl.logOutput) stateEl.logOutput.textContent = uiState.logs.join("\n");
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
    if (profile.mobileSweep && String(item.mobileSweep || "") !== String(profile.mobileSweep)) return false;
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

function buildAuditEstimateContext(audit = {}, percentage = 0, elapsedMs = 0) {
  const historyEstimateMs = estimateRunDurationMs({
    baseUrl: audit.baseUrl,
    mode: audit.mode,
    mobileSweep: audit.mode === "mobile" && toNumber(audit?.progress?.sweepProfileTotal, 0) > 1 ? "family" : "single",
    scope: audit.scope,
    depth: audit.depth,
  });
  const progressEstimateMs = percentage >= 10 && elapsedMs > 0
    ? Math.round(elapsedMs / Math.max(percentage / 100, 0.1))
    : 0;
  const totalEstimateMs = median([historyEstimateMs, progressEstimateMs].filter((value) => value > 0));
  return {
    historyEstimateMs,
    progressEstimateMs,
    totalEstimateMs,
  };
}

function createSlowTimelineEntry(kind, audit, elapsedMs, thresholdMs) {
  const progress = audit?.progress && typeof audit.progress === "object" ? audit.progress : {};
  const isAction = kind === "action";
  const route = String(progress.currentRoute || "").trim();
  const action = String(progress.currentAction || "").trim();
  return {
    id: `${isAction ? "slow-action" : "slow-route"}-${getAuditRunKey(audit)}-${route}-${action}-${Math.round(elapsedMs)}`,
    stage: isAction ? "actions" : "routes",
    label: isAction ? "Slow action detected" : "Slow route detected",
    status: "issue",
    detail: isAction
      ? `${action || "Current action"} has been running for ${formatDuration(elapsedMs)}. The expected window for this action was ${formatDuration(thresholdMs)}.`
      : `${route || "Current route"} has been active for ${formatDuration(elapsedMs)}. The expected window for this route was ${formatDuration(thresholdMs)}.`,
    route,
    action: isAction ? action : "",
    at: new Date().toISOString(),
  };
}

function getSlowThresholds(audit = {}) {
  const progress = audit?.progress && typeof audit.progress === "object" ? audit.progress : {};
  const totalRoutes = Math.max(0, toNumber(progress.totalRoutes, 0));
  const totalLabels = Math.max(0, toNumber(progress.totalLabels, 0));
  const elapsedMs = audit.startedAt ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime()) : 0;
  const estimate = buildAuditEstimateContext(audit, toNumber(progress.percentage, 0), elapsedMs);
  const routeThresholdMs = Math.max(
    audit.depth === "deep" ? 45000 : 25000,
    totalRoutes > 0 && estimate.totalEstimateMs > 0 ? Math.round((estimate.totalEstimateMs / totalRoutes) * 1.35) : 0,
  );
  const actionThresholdMs = Math.max(
    audit.depth === "deep" ? 15000 : 8000,
    routeThresholdMs > 0 ? Math.round((routeThresholdMs / Math.max(totalLabels || 6, 6)) * 1.6) : 0,
  );
  return {
    routeThresholdMs,
    actionThresholdMs,
  };
}

function syncSlowTimeline(audit = {}) {
  const runKey = getAuditRunKey(audit);
  const running = audit.running === true;
  if (!running || !runKey) {
    uiState.slowWatch = createEmptySlowWatch();
    return;
  }

  if (uiState.slowWatch.runKey !== runKey) {
    uiState.slowWatch = {
      ...createEmptySlowWatch(),
      runKey,
    };
  }

  const progress = audit?.progress && typeof audit.progress === "object" ? audit.progress : {};
  const route = String(progress.currentRoute || "").trim();
  const action = String(progress.currentAction || "").trim();
  const routeIndex = Math.max(0, toNumber(progress.routeIndex, 0));
  const labelIndex = Math.max(0, toNumber(progress.labelIndex, 0));
  const routeKey = route ? `${routeIndex}|${route}` : "";
  const actionKey = action ? `${routeKey}|${labelIndex}|${action}` : "";
  const nowMs = Date.now();

  if (routeKey !== uiState.slowWatch.routeKey) {
    uiState.slowWatch.routeKey = routeKey;
    uiState.slowWatch.routeStartedAtMs = routeKey ? nowMs : 0;
  }
  if (actionKey !== uiState.slowWatch.actionKey) {
    uiState.slowWatch.actionKey = actionKey;
    uiState.slowWatch.actionStartedAtMs = actionKey ? nowMs : 0;
  }

  const { routeThresholdMs, actionThresholdMs } = getSlowThresholds(audit);
  const routeElapsedMs = routeKey && uiState.slowWatch.routeStartedAtMs > 0 ? nowMs - uiState.slowWatch.routeStartedAtMs : 0;
  const actionElapsedMs = actionKey && uiState.slowWatch.actionStartedAtMs > 0 ? nowMs - uiState.slowWatch.actionStartedAtMs : 0;

  if (routeKey && routeElapsedMs >= routeThresholdMs && uiState.slowWatch.routeWarnedKey !== routeKey) {
    uiState.slowWatch.routeWarnedKey = routeKey;
    uiState.slowWatch.events = [createSlowTimelineEntry("route", audit, routeElapsedMs, routeThresholdMs), ...uiState.slowWatch.events].slice(0, 10);
  }

  if (actionKey && actionElapsedMs >= actionThresholdMs && uiState.slowWatch.actionWarnedKey !== actionKey) {
    uiState.slowWatch.actionWarnedKey = actionKey;
    uiState.slowWatch.events = [createSlowTimelineEntry("action", audit, actionElapsedMs, actionThresholdMs), ...uiState.slowWatch.events].slice(0, 10);
  }
}

function createCompactStoredReport(report, limits = {}) {
  const issueLimit = toNumber(limits.issueLimit, 180);
  const actionLimit = toNumber(limits.actionLimit, 120);
  const routeLimit = toNumber(limits.routeLimit, 80);
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  return {
    meta: report.meta,
    summary: report.summary,
    assistantGuide: report.assistantGuide,
    seo: report.seo,
    learningMemory: report.learningMemory,
    selfHealing: report.selfHealing,
    intelligence: report.intelligence,
    predictive: intelligenceSnapshot.predictive,
    autonomous: intelligenceSnapshot.autonomous,
    dataIntelligence: intelligenceSnapshot.dataIntelligence,
    optimization: intelligenceSnapshot.optimization,
    qualityControl: intelligenceSnapshot.qualityControl,
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
    .map((issue, index) => {
      const learningEntry = getLearningEntryForIssue(issue);
      const learningTail = learningEntry?.finalResolution
        ? ` | final=${learningEntry.finalResolution}`
        : learningEntry?.avoidText
        ? ` | avoid=${learningEntry.avoidText}`
        : "";
      return `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.code}${issue.viewportLabel ? ` | ${issue.viewportLabel}` : ""} | ${issue.route}${issue.action ? ` | ${issue.action}` : ""} | ${issue.detail}${learningTail}`;
    })
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

function getOperationalMemorySnapshot(report = null) {
  return uiState.learningMemorySnapshot || report?.learningMemory || null;
}

function getVisibleSelfHealing(report = null) {
  return uiState.selfHealingSnapshot || report?.selfHealing || null;
}

function createEmptyDataIntelligenceSnapshot() {
  if (typeof window.createSitePulseDataIntelligenceService === "function") {
    const service = ensureDataIntelligenceService();
    if (service?.createEmptyDataIntelligenceSnapshot) {
      return service.createEmptyDataIntelligenceSnapshot();
    }
  }
  return {
    updatedAt: "",
    contextKey: "",
    SITE_STATE: {
      baseUrl: "",
      generatedAt: "",
      mode: "",
      scope: "",
      viewportLabel: "",
      totalIssues: 0,
      routesChecked: 0,
      actionsMapped: 0,
      historyDepth: 0,
    },
    QUALITY_STATE: {
      overallScore: 0,
      trajectory: "stable",
      trajectoryConfidence: 0,
      seoScore: 0,
      dimensions: {},
      rationale: [],
      topImprovements: [],
      qualityHistory: [],
    },
    RISK_STATE: {
      topRisks: [],
      familyRiskMap: {},
      priorityQueue: [],
      predictiveAlerts: [],
      priorityCounts: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 },
      highRiskAlertCount: 0,
      healingEligibleCount: 0,
      recommendedActionOrder: [],
      highestImpactIssue: null,
    },
    TREND_STATE: {
      overallDirection: "stable",
      overallConfidence: 0,
      seo: { direction: "stable", text: "SEO = stable" },
      runtime: { direction: "stable", text: "Runtime = stable" },
      ux: { direction: "stable", text: "UX = stable" },
      predictiveOverview: {},
      systemicPatterns: [],
      recurringIssues: [],
    },
    ISSUE_STATE: [],
    ISSUE_MAP: {},
  };
}

function createEmptyOptimizationSnapshot() {
  if (typeof window.createSitePulseOptimizationEngineService === "function") {
    const service = ensureOptimizationService();
    if (service?.createEmptyOptimizationSnapshot) {
      return service.createEmptyOptimizationSnapshot();
    }
  }
  return {
    updatedAt: "",
    contextKey: "",
    summary: {
      seoOpportunities: 0,
      uxImprovements: 0,
      performanceGains: 0,
      structuralRecommendations: 0,
    },
    clusters: [],
    topImprovements: [],
    structuralRecommendations: [],
    opportunityGroups: {
      seo: [],
      ux: [],
      performance: [],
    },
  };
}

function createEmptyQualityControlSnapshot() {
  if (typeof window.createSitePulseQualityControlEngine === "function") {
    const service = ensureQualityControlService();
    if (service?.createEmptyQualityControlSnapshot) {
      return service.createEmptyQualityControlSnapshot();
    }
  }
  return {
    updatedAt: "",
    contextKey: "",
    summary: {
      suspectedFalsePositives: 0,
      inconsistentIssues: 0,
      validationWarnings: 0,
    },
    issues: [],
    issueMap: {},
    topWarnings: [],
  };
}

function buildHealingIssueKey(issueLike) {
  return [
    String(issueLike?.code || issueLike?.issueCode || "").trim().toUpperCase(),
    String(issueLike?.route || "/").trim(),
    String(issueLike?.action || "").trim(),
  ].join("|");
}

function buildHealingIssueFingerprint(issueLike) {
  return [
    String(issueLike?.code || issueLike?.issueCode || "").trim().toUpperCase(),
    String(issueLike?.route || "/").trim(),
    String(issueLike?.action || "").trim(),
    String(issueLike?.severity || "low").trim(),
  ].join("|");
}

function formatHealingEligibility(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "eligible_for_healing") return "healing available";
  if (normalized === "assist_only") return "assist only";
  if (normalized === "manual_only") return "manual only";
  if (normalized === "unsafe") return "unsafe";
  if (normalized === "blocked") return "blocked";
  return normalized || "blocked";
}

function formatHealingMode(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "orchestrated_healing") return "orchestrated";
  if (normalized === "prompt_assisted") return "prompt assisted";
  if (normalized === "suggest_only") return "suggest only";
  if (normalized === "direct_action") return "direct action";
  return normalized || "suggest only";
}

function getLearningEntryForIssue(issueLike, memoryInput = null) {
  const memory = memoryInput || getOperationalMemorySnapshot(getVisibleReport());
  if (!memory || !Array.isArray(memory.entries)) return null;
  const code = String(issueLike?.code || issueLike || "").trim().toUpperCase();
  const route = String(issueLike?.route || "/").trim();
  const action = String(issueLike?.action || "").trim();
  const exact = memory.entries.find((entry) =>
    String(entry.issueCode || "").trim().toUpperCase() === code
    && String(entry.route || "/").trim() === route
    && String(entry.action || "").trim() === action);
  if (exact) return exact;
  return memory.entries.find((entry) => String(entry.issueCode || "").trim().toUpperCase() === code) || null;
}

function buildLearningAwareIssuePrompt(issueCode = "", languageKey = getAssistantLanguage()) {
  const report = getVisibleReport();
  if (!report) {
    return localizePromptLine(languageKey, {
      pt: "Execute uma auditoria para gerar um prompt guiado por memória.",
      es: "Ejecuta una auditoría para generar un prompt guiado por memoria.",
      en: "Run an audit to generate a learning-aware prompt.",
      ca: "Executa una auditoria per generar un prompt guiat per memòria.",
    });
  }

  const targetIssue = issueCode
    ? report.issues.find((issue) => String(issue.code).toUpperCase() === String(issueCode).toUpperCase())
    : report.issues[0];

  if (!targetIssue) {
    return localizePromptLine(languageKey, {
      pt: "Nenhuma issue correspondente está carregada no SitePulse Studio.",
      es: "No hay ninguna issue correspondiente cargada en SitePulse Studio.",
      en: "No matching issue is loaded in SitePulse Studio.",
      ca: "No hi ha cap issue corresponent carregada a SitePulse Studio.",
    });
  }

  const learningEntry = getLearningEntryForIssue(targetIssue);
  const healing = targetIssue.selfHealing && typeof targetIssue.selfHealing === "object" ? targetIssue.selfHealing : null;
  if (healing?.promptReady && healing?.promptText) {
    return healing.promptText;
  }
  const lines = [
    localizePromptLine(languageKey, {
      pt: "Atue como um engenheiro de software sênior focado em causa raiz, evidência e revalidação.",
      es: "Actúa como un ingeniero de software senior centrado en causa raíz, evidencia y revalidación.",
      en: "Act as a senior software engineer focused on root cause, evidence and revalidation.",
      ca: "Actua com un enginyer de programari sènior centrat en causa arrel, evidència i revalidació.",
    }),
    localizePromptLine(languageKey, {
      pt: `Issue alvo: ${targetIssue.code}`,
      es: `Issue objetivo: ${targetIssue.code}`,
      en: `Target issue: ${targetIssue.code}`,
      ca: `Issue objectiu: ${targetIssue.code}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Severidade: ${targetIssue.severity}`,
      es: `Severidad: ${targetIssue.severity}`,
      en: `Severity: ${targetIssue.severity}`,
      ca: `Severitat: ${targetIssue.severity}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Rota: ${targetIssue.route}${targetIssue.action ? ` | ação: ${targetIssue.action}` : ""}`,
      es: `Ruta: ${targetIssue.route}${targetIssue.action ? ` | acción: ${targetIssue.action}` : ""}`,
      en: `Route: ${targetIssue.route}${targetIssue.action ? ` | action: ${targetIssue.action}` : ""}`,
      ca: `Ruta: ${targetIssue.route}${targetIssue.action ? ` | acció: ${targetIssue.action}` : ""}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Problema observado: ${targetIssue.detail}`,
      es: `Problema observado: ${targetIssue.detail}`,
      en: `Observed problem: ${targetIssue.detail}`,
      ca: `Problema observat: ${targetIssue.detail}`,
    }),
    localizePromptLine(languageKey, {
      pt: `Direção de correção recomendada: ${targetIssue.recommendedResolution}`,
      es: `Dirección de corrección recomendada: ${targetIssue.recommendedResolution}`,
      en: `Recommended fix direction: ${targetIssue.recommendedResolution}`,
      ca: `Direcció de correcció recomanada: ${targetIssue.recommendedResolution}`,
    }),
  ];

  if (learningEntry?.finalResolution) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Resolução final validada disponível: ${learningEntry.finalResolution}`,
      es: `Resolución final validada disponible: ${learningEntry.finalResolution}`,
      en: `Validated final resolution available: ${learningEntry.finalResolution}`,
      ca: `Resolució final validada disponible: ${learningEntry.finalResolution}`,
    }));
    if (learningEntry.finalResolutionOrigin) {
      lines.push(localizePromptLine(languageKey, {
        pt: `Origem da resolução final: ${learningEntry.finalResolutionOrigin}`,
        es: `Origen de la resolución final: ${learningEntry.finalResolutionOrigin}`,
        en: `Final resolution origin: ${learningEntry.finalResolutionOrigin}`,
        ca: `Origen de la resolució final: ${learningEntry.finalResolutionOrigin}`,
      }));
    }
  } else if (targetIssue.finalResolution) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Resolução final atual anexada ao relatório: ${targetIssue.finalResolution}`,
      es: `Resolución final actual adjunta al reporte: ${targetIssue.finalResolution}`,
      en: `Current final resolution attached to the report: ${targetIssue.finalResolution}`,
      ca: `Resolució final actual adjunta a l'informe: ${targetIssue.finalResolution}`,
    }));
  }

  if (learningEntry?.possibleResolution || targetIssue.possibleResolution) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Melhor hipótese atual: ${learningEntry?.possibleResolution || targetIssue.possibleResolution}`,
      es: `Mejor hipótesis actual: ${learningEntry?.possibleResolution || targetIssue.possibleResolution}`,
      en: `Best current hypothesis: ${learningEntry?.possibleResolution || targetIssue.possibleResolution}`,
      ca: `Millor hipòtesi actual: ${learningEntry?.possibleResolution || targetIssue.possibleResolution}`,
    }));
  }

  if (learningEntry?.latestValidatedFix) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Padrão validado: ${learningEntry.latestValidatedFix}`,
      es: `Patrón validado: ${learningEntry.latestValidatedFix}`,
      en: `Validated pattern: ${learningEntry.latestValidatedFix}`,
      ca: `Patró validat: ${learningEntry.latestValidatedFix}`,
    }));
  }

  if (learningEntry?.avoidText) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Evite repetir isto: ${learningEntry.avoidText}`,
      es: `Evita repetir esto: ${learningEntry.avoidText}`,
      en: `Avoid repeating this: ${learningEntry.avoidText}`,
      ca: `Evita repetir això: ${learningEntry.avoidText}`,
    }));
  } else if (targetIssue.learningCases?.some((item) => item.outcome === "failed")) {
    const failedCase = targetIssue.learningCases.find((item) => item.outcome === "failed");
    lines.push(localizePromptLine(languageKey, {
      pt: `Evite repetir isto: ${failedCase?.result || failedCase?.attempt || "Uma tentativa anterior já falhou."}`,
      es: `Evita repetir esto: ${failedCase?.result || failedCase?.attempt || "Un intento anterior ya falló."}`,
      en: `Avoid repeating this: ${failedCase?.result || failedCase?.attempt || "A previous attempt already failed."}`,
      ca: `Evita repetir això: ${failedCase?.result || failedCase?.attempt || "Un intent anterior ja va fallar."}`,
    }));
  }

  if (healing) {
    lines.push(localizePromptLine(languageKey, {
      pt: `Elegibilidade de self-healing: ${formatHealingEligibility(healing.eligibility)}`,
      es: `Elegibilidad de self-healing: ${formatHealingEligibility(healing.eligibility)}`,
      en: `Self-healing eligibility: ${formatHealingEligibility(healing.eligibility)}`,
      ca: `Elegibilitat de self-healing: ${formatHealingEligibility(healing.eligibility)}`,
    }));
    lines.push(localizePromptLine(languageKey, {
      pt: `Modo de self-healing: ${formatHealingMode(healing.healingMode)}`,
      es: `Modo de self-healing: ${formatHealingMode(healing.healingMode)}`,
      en: `Self-healing mode: ${formatHealingMode(healing.healingMode)}`,
      ca: `Mode de self-healing: ${formatHealingMode(healing.healingMode)}`,
    }));
    lines.push(localizePromptLine(languageKey, {
      pt: `Confiança de self-healing: ${healing.confidenceLabel || "n/a"}${Number.isFinite(Number(healing.confidenceScore)) ? ` (${healing.confidenceScore}/100)` : ""}`,
      es: `Confianza de self-healing: ${healing.confidenceLabel || "n/a"}${Number.isFinite(Number(healing.confidenceScore)) ? ` (${healing.confidenceScore}/100)` : ""}`,
      en: `Self-healing confidence: ${healing.confidenceLabel || "n/a"}${Number.isFinite(Number(healing.confidenceScore)) ? ` (${healing.confidenceScore}/100)` : ""}`,
      ca: `Confiança de self-healing: ${healing.confidenceLabel || "n/a"}${Number.isFinite(Number(healing.confidenceScore)) ? ` (${healing.confidenceScore}/100)` : ""}`,
    }));
    if (healing.resolutionLead) {
      lines.push(localizePromptLine(languageKey, {
        pt: `Melhor lead de healing: ${healing.resolutionLead}`,
        es: `Mejor lead de healing: ${healing.resolutionLead}`,
        en: `Best healing lead: ${healing.resolutionLead}`,
        ca: `Millor lead de healing: ${healing.resolutionLead}`,
      }));
    }
    if (healing.avoidText) {
      lines.push(localizePromptLine(languageKey, {
        pt: `Lista do que evitar no healing: ${healing.avoidText}`,
        es: `Lista de lo que hay que evitar en healing: ${healing.avoidText}`,
        en: `Healing avoid list: ${healing.avoidText}`,
        ca: `Llista del que cal evitar a healing: ${healing.avoidText}`,
      }));
    }
    if (Array.isArray(healing.rationale) && healing.rationale.length) {
      lines.push(localizePromptLine(languageKey, {
        pt: `Racional do healing: ${healing.rationale.slice(0, 3).join(" | ")}`,
        es: `Racional del healing: ${healing.rationale.slice(0, 3).join(" | ")}`,
        en: `Healing rationale: ${healing.rationale.slice(0, 3).join(" | ")}`,
        ca: `Racional del healing: ${healing.rationale.slice(0, 3).join(" | ")}`,
      }));
    }
  }

  lines.push(
    localizePromptLine(languageKey, {
      pt: "Restrições:",
      es: "Restricciones:",
      en: "Constraints:",
      ca: "Restriccions:",
    }),
    localizePromptLine(languageKey, {
      pt: "- não proponha correções cosméticas",
      es: "- no propongas correcciones cosméticas",
      en: "- do not propose cosmetic fixes",
      ca: "- no proposis correccions cosmètiques",
    }),
    localizePromptLine(languageKey, {
      pt: "- priorize primeiro a solução com a evidência mais forte",
      es: "- prioriza primero la solución con la evidencia más fuerte",
      en: "- prioritize the solution with the strongest evidence first",
      ca: "- prioritza primer la solució amb l'evidència més forta",
    }),
    localizePromptLine(languageKey, {
      pt: "- se a resolução final for apenas manual override, diga que ainda precisa de confirmação técnica",
      es: "- si la resolución final es solo manual override, indica que todavía necesita confirmación técnica",
      en: "- if the final resolution is only a manual override, mention that it still needs technical confirmation",
      ca: "- si la resolució final és només manual override, indica que encara necessita confirmació tècnica",
    }),
    localizePromptLine(languageKey, {
      pt: `Comando de replay: ${report.meta.replayCommand || report.assistantGuide?.replayCommand || "n/a"}`,
      es: `Comando de replay: ${report.meta.replayCommand || report.assistantGuide?.replayCommand || "n/a"}`,
      en: `Replay command: ${report.meta.replayCommand || report.assistantGuide?.replayCommand || "n/a"}`,
      ca: `Comanda de replay: ${report.meta.replayCommand || report.assistantGuide?.replayCommand || "n/a"}`,
    }),
    localizePromptLine(languageKey, {
      pt: "Termine com um plano curto de validação.",
      es: "Termina con un plan corto de validación.",
      en: "End with a short validation plan.",
      ca: "Acaba amb un pla curt de validació.",
    }),
  );

  return lines.join("\n");
}

function buildLearningAwareFixPrompt(report) {
  if (!report) {
    return "Run an audit to generate a professional fix prompt.";
  }

  const prioritized = [...report.issues].sort((left, right) => {
    const byPriority = priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel);
    if (byPriority !== 0) return byPriority;
    const byImpact = toNumber(right.impact?.impactScore, 0) - toNumber(left.impact?.impactScore, 0);
    if (byImpact !== 0) return byImpact;
    const leftRank = left.severity === "high" ? 3 : left.severity === "medium" ? 2 : 1;
    const rightRank = right.severity === "high" ? 3 : right.severity === "medium" ? 2 : 1;
    if (rightRank !== leftRank) return rightRank - leftRank;
    const leftValidated = Number(getLearningEntryForIssue(left)?.learningCounts?.validated || left.learningCounts?.validated || 0);
    const rightValidated = Number(getLearningEntryForIssue(right)?.learningCounts?.validated || right.learningCounts?.validated || 0);
    return leftValidated - rightValidated;
  });

  const lines = [
    "Act as a senior software engineer with a bias for operational clarity and clean verification.",
    `Current target: ${report.meta.baseUrl}`,
    `Total issues: ${report.summary.totalIssues}`,
    `SEO score: ${report.summary.seoScore}`,
    `Self-healing ready: ${report.selfHealing?.summary?.eligible || 0} eligible | ${report.selfHealing?.summary?.promptReady || 0} prompt-ready | ${report.selfHealing?.summary?.pendingAttempts || 0} pending attempt(s)`,
    "Attack order:",
    "- high severity without a validated final resolution",
    "- medium severity with repeated failed attempts",
    "- low severity and residual cleanup after revalidation",
    "",
    "Priority issues:",
  ];

  prioritized.slice(0, 6).forEach((issue, index) => {
    const memory = getLearningEntryForIssue(issue);
    const resolutionLead = memory?.finalResolution
      ? `final=${memory.finalResolution}`
      : memory?.possibleResolution
      ? `possible=${memory.possibleResolution}`
      : `recommended=${issue.recommendedResolution}`;
    const failedLead = memory?.avoidText ? ` | avoid=${memory.avoidText}` : "";
    lines.push(`${index + 1}. [${issue.code}] (${issue.severity}) ${issue.route}${issue.action ? ` -> ${issue.action}` : ""} | ${issue.detail} | ${resolutionLead}${failedLead}`);
  });

  lines.push("", `Replay command: ${report.meta.replayCommand || report.assistantGuide?.replayCommand || "n/a"}`, "Finish with a concrete revalidation sequence.");
  return lines.join("\n");
}

function buildSeoDigest(report) {
  if (!report) {
    return "No SEO report is currently loaded in SitePulse Studio.";
  }

  const googleSnapshot = uiState.seoSource?.snapshot;
  const lines = [
    "SitePulse internal SEO diagnostics",
    `Target: ${report.meta.baseUrl}`,
    `SEO score: ${report.summary.seoScore}`,
    `SEO critical issues: ${report.summary.seoCriticalIssues || 0}`,
    `SEO issues total: ${report.summary.seoTotalIssues || 0}`,
    `Pages analyzed: ${report.summary.seoPagesAnalyzed || report.seo?.pagesAnalyzed || 0}`,
  ];

  if (googleSnapshot) {
    lines.push(
      "",
      "Google Search Console",
    );
    lines.push(
      `Google property: ${googleSnapshot.property}`,
      `Google avg position: ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}`,
      `Google clicks: ${googleSnapshot.clicks}`,
      `Google impressions: ${googleSnapshot.impressions}`,
      `Google CTR: ${formatPercent(googleSnapshot.ctr)}`,
      `Top query: ${googleSnapshot.topQuery || "n/a"}`,
      `Top page: ${googleSnapshot.topPage || "n/a"}`,
    );
  } else {
    lines.push(
      "",
      "Google Search Console",
      "Google ranking data is not connected. Internal SitePulse SEO diagnostics above are still valid.",
    );
  }

  const recommendations = Array.isArray(report.seo?.topRecommendations) ? report.seo.topRecommendations.filter(Boolean) : [];
  if (recommendations.length) {
    lines.push("", "Top recommendations:");
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
  const googleSnapshot = uiState.seoSource?.snapshot;
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
    ...(googleSnapshot
      ? [
          `Google average position: ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}`,
          `Google clicks: ${googleSnapshot.clicks}`,
          `Google impressions: ${googleSnapshot.impressions}`,
          `Google CTR: ${formatPercent(googleSnapshot.ctr)}`,
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
  const googleSnapshot = uiState.seoSource?.snapshot;
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
  const googleLine = googleSnapshot
    ? `On top of the internal audit, verified Google Search Console data shows an average position of ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}, ${googleSnapshot.impressions} impressions, ${googleSnapshot.clicks} clicks and a CTR of ${formatPercent(googleSnapshot.ctr)} over the last ${googleSnapshot.lookbackDays} days.`
    : "If needed, I can also connect verified Google Search Console data to measure real position, impressions, clicks and CTR instead of relying only on internal SEO heuristics.";

  return [
    `Hi, I reviewed ${report.meta.baseUrl} and found a few issues that are worth fixing before they start costing you trust, conversions and visibility.`,
    "",
    `The main problems I detected were ${issuesLine}. In practice, this means parts of the site can feel unreliable, some actions can break or create friction, and the overall quality signal of the website drops for both users and search engines.`,
    "",
    seoLine,
    "",
    googleLine,
    "",
    `This is exactly the kind of technical debt that often stays invisible until traffic, leads or indexing quality start slipping. Fixing it now is usually much cheaper than waiting until it becomes a visible business problem.`,
    "",
    "If you want, I can turn this audit into a prioritized fix plan and show exactly what should be corrected first.",
  ].join("\n");
}

function issueSignature(issue) {
  return [issue.code, issue.route, issue.action || "", issue.group, issue.viewportLabel || "", issue.viewport || ""].join("|");
}

function buildHistoryGroupKey(report) {
  if (!report) return "";
  return [
    normalizeText(report.meta?.baseUrl),
    normalizeText(report.meta?.auditMode || "desktop"),
    normalizeText(report.summary?.auditScope),
    normalizeText(report.meta?.mobileSweep?.id),
  ].join("::");
}

function isComparableHistoryReport(currentReport, candidateReport) {
  if (!currentReport || !candidateReport) return false;
  return buildHistoryGroupKey(currentReport) === buildHistoryGroupKey(candidateReport);
}

function normalizeHistoryEntry(entry) {
  if (!entry || typeof entry !== "object" || !entry.report) return null;
  const stamp = String(entry.stamp || entry.report.meta?.generatedAt || "");
  if (!stamp) return null;
  const targetKey = buildHistoryGroupKey(entry.report);
  if (!targetKey) return null;
  return {
    ...entry,
    stamp,
    targetKey,
  };
}

function compareHistoryEntries(left, right) {
  return safeDateValue(right?.stamp) - safeDateValue(left?.stamp);
}

function pruneHistoryEntries(entries) {
  const normalized = (Array.isArray(entries) ? entries : [])
    .map((entry) => normalizeHistoryEntry(entry))
    .filter(Boolean)
    .sort(compareHistoryEntries);
  const seen = new Set();
  const perTargetCounts = new Map();
  const pruned = [];
  for (const entry of normalized) {
    const dedupeKey = `${entry.targetKey}::${entry.stamp}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    const targetCount = perTargetCounts.get(entry.targetKey) || 0;
    if (targetCount >= HISTORY_PER_TARGET_LIMIT) {
      continue;
    }
    seen.add(dedupeKey);
    perTargetCounts.set(entry.targetKey, targetCount + 1);
    pruned.push({
      ...entry,
      targetKey: undefined,
    });
    if (pruned.length >= HISTORY_TOTAL_LIMIT) {
      break;
    }
  }
  return pruned;
}

function mapHistoryRunEntry(entry) {
  if (!entry?.report) return null;
  return {
    stamp: String(entry.stamp || entry.report.meta?.generatedAt || ""),
    report: entry.report,
  };
}

function buildHistoryIndex() {
  const cacheKey = buildRecentHistoryStamp(HISTORY_TOTAL_LIMIT);
  if (uiState.historyIndexCache?.key === cacheKey) {
    return uiState.historyIndexCache.value;
  }
  const byTarget = new Map();
  for (const entry of uiState.history) {
    const targetKey = buildHistoryGroupKey(entry?.report);
    if (!targetKey) {
      continue;
    }
    const list = byTarget.get(targetKey) || [];
    list.push(entry);
    byTarget.set(targetKey, list);
  }
  for (const list of byTarget.values()) {
    list.sort(compareHistoryEntries);
  }
  const index = {
    byTarget,
  };
  uiState.historyIndexCache = {
    key: cacheKey,
    value: index,
  };
  return index;
}

function resolveComparableHistoryEntries(report, limit = HISTORY_COMPARABLE_LIMIT) {
  if (!report) return [];
  const targetKey = buildHistoryGroupKey(report);
  if (!targetKey) return [];
  const historyIndex = buildHistoryIndex();
  return (historyIndex.byTarget.get(targetKey) || [])
    .filter((entry) => entry?.report && entry.stamp !== report.meta?.generatedAt)
    .slice(0, limit);
}

function resolveReferenceSnapshot(report, comparableEntries = null) {
  if (!report) return null;
  if (
    uiState.baseline?.report
    && uiState.baseline.stamp !== report.meta.generatedAt
    && isComparableHistoryReport(report, uiState.baseline.report)
  ) {
    return {
      label: `baseline ${formatLocalDate(uiState.baseline.stamp)}`,
      snapshot: uiState.baseline,
    };
  }

  const entries = Array.isArray(comparableEntries) ? comparableEntries : resolveComparableHistoryEntries(report, 1);
  const previous = entries.find((entry) => entry?.report && entry.stamp !== report.meta.generatedAt);
  if (previous?.report) {
    return {
      label: `previous run ${formatLocalDate(previous.stamp)}`,
      snapshot: previous,
    };
  }

  return null;
}

function buildComparableHistoryContext(report, limit = HISTORY_COMPARABLE_LIMIT) {
  if (!report) {
    return {
      targetKey: "",
      reference: null,
      comparableEntries: [],
      comparableReports: [],
      recurrenceReports: [],
      runHistory: [],
      series: [],
      previousComparable: null,
    };
  }

  const cacheKey = [
    buildLiveReportKey(report),
    String(uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_TOTAL_LIMIT),
    buildHistoryGroupKey(report),
    String(limit),
  ].join("::");
  if (uiState.historyContextCache?.key === cacheKey) {
    return uiState.historyContextCache.value;
  }

  const comparableEntries = resolveComparableHistoryEntries(report, limit);
  const reference = resolveReferenceSnapshot(report, comparableEntries);
  const seriesEntries = [];
  if (reference?.snapshot?.report) {
    seriesEntries.push({
      stamp: String(reference.snapshot.stamp || reference.snapshot.report.meta?.generatedAt || ""),
      report: reference.snapshot.report,
    });
  }
  for (const entry of [...comparableEntries].reverse()) {
    seriesEntries.push({
      stamp: String(entry.stamp || entry.report?.meta?.generatedAt || ""),
      report: entry.report,
    });
  }
  seriesEntries.push({
    stamp: String(report.meta?.generatedAt || ""),
    report,
  });

  const dedupedSeries = [];
  const seen = new Set();
  for (const entry of seriesEntries.sort((left, right) => safeDateValue(left.stamp) - safeDateValue(right.stamp))) {
    const dedupeKey = `${buildHistoryGroupKey(entry.report)}::${entry.stamp}`;
    if (!entry.report || seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    dedupedSeries.push(entry);
  }

  const previousComparable = dedupedSeries.length > 1 ? dedupedSeries[dedupedSeries.length - 2] : null;
  const context = {
    targetKey: buildHistoryGroupKey(report),
    reference,
    comparableEntries,
    comparableReports: comparableEntries.map((entry) => entry.report),
    recurrenceReports: [report, ...comparableEntries.slice(0, HISTORY_RECURRENCE_LIMIT).map((entry) => entry.report)],
    runHistory: comparableEntries.slice(0, limit).map((entry) => mapHistoryRunEntry(entry)).filter(Boolean),
    series: dedupedSeries.slice(-limit),
    previousComparable,
  };
  uiState.historyContextCache = {
    key: cacheKey,
    value: context,
  };
  return context;
}

function signedDelta(value) {
  const amount = toNumber(value, 0);
  if (amount === 0) return "0";
  return amount > 0 ? `+${amount}` : `${amount}`;
}

function getReferenceSnapshot(report) {
  return resolveReferenceSnapshot(report);
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
  const reducedIssues = [...currentIssues.entries()]
    .filter(([signature]) => referenceIssues.has(signature))
    .map(([signature, issue]) => ({
      current: issue,
      previous: referenceIssues.get(signature),
    }))
    .filter(({ current, previous }) => severityRank(current.severity) < severityRank(previous?.severity || "low"))
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
    reducedIssues,
    criticalRegressions,
  };
}

function summarizeCategoryIssues(report, categories) {
  const allowed = new Set(categories);
  return (report?.issues || []).filter((issue) => allowed.has(String(issue.group || "").toLowerCase()) || allowed.has(String(issue.code || "").split("_")[0].toLowerCase())).length;
}

function buildTrendDescriptor(label, currentValue, previousValue, threshold = 1) {
  if (!Number.isFinite(currentValue) || !Number.isFinite(previousValue)) {
    return { label, direction: "stable", symbol: "=", delta: 0, text: `${label} = stable` };
  }
  const delta = currentValue - previousValue;
  if (delta >= threshold) {
    return { label, direction: "regression", symbol: "▼", delta, text: `${label} ▼ regression (${signedDelta(delta)})` };
  }
  if (delta <= -threshold) {
    return { label, direction: "improving", symbol: "▲", delta, text: `${label} ▲ improving (${signedDelta(-delta)})` };
  }
  return { label, direction: "stable", symbol: "=", delta, text: `${label} = stable` };
}

function buildRecentHistoryStamp(limit = 8) {
  return uiState.history
    .slice(0, limit)
    .map((entry) => `${buildHistoryGroupKey(entry?.report)}@${String(entry?.stamp || "")}`)
    .join("|");
}

function buildContinuousIntelligence(report) {
  if (!report) {
    return createEmptyContinuousIntelligenceSnapshot();
  }

  const historyContext = buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_RECURRENCE_LIMIT),
  ].join("::");
  if (uiState.continuousIntelligenceCache?.key === cacheKey) {
    return uiState.continuousIntelligenceCache.value;
  }

  const reference = historyContext.reference;
  const comparison = reference?.snapshot?.report ? compareReports(report, reference.snapshot.report) : null;
  const recurrenceMap = new Map();
  for (const snapshot of historyContext.recurrenceReports) {
    const seen = new Set();
    for (const issue of snapshot?.issues || []) {
      const signature = issueSignature(issue);
      if (seen.has(signature)) continue;
      seen.add(signature);
      recurrenceMap.set(signature, (recurrenceMap.get(signature) || 0) + 1);
    }
  }

  const reducedSet = new Set((comparison?.reducedIssues || []).map((issue) => issueSignature(issue)));
  const regressionSet = new Set([...(comparison?.criticalRegressions || []), ...(comparison?.newIssues || [])].map((issue) => issueSignature(issue)));
  const persistentSet = new Set((comparison?.persistentIssues || []).map((issue) => issueSignature(issue)));
  const issueTrends = Object.fromEntries((report.issues || []).map((issue) => {
    const signature = issueSignature(issue);
    const recurringCount = recurrenceMap.get(signature) || 1;
    let trend = "stable";
    if (reducedSet.has(signature)) trend = "improving";
    else if (regressionSet.has(signature)) trend = "regression";
    else if (persistentSet.has(signature)) trend = "stable";
    return [signature, { trend, recurringCount }];
  }));

  const recurringIssues = (report.issues || [])
    .map((issue) => ({ issue, recurringCount: recurrenceMap.get(issueSignature(issue)) || 1 }))
    .filter((item) => item.recurringCount >= 2)
    .sort((left, right) => right.recurringCount - left.recurringCount || toNumber(right.issue.impact?.impactScore, 0) - toNumber(left.issue.impact?.impactScore, 0))
    .slice(0, 6);

  const previousComparableReport = historyContext.previousComparable?.report || reference?.snapshot?.report || null;
  const runtimeCurrent = (report.issues || []).filter((issue) => ["ROUTE_LOAD_FAIL", "HTTP_5XX", "NET_REQUEST_FAILED", "JS_RUNTIME_ERROR", "CONSOLE_ERROR"].includes(String(issue.code || ""))).length;
  const runtimePrevious = comparison ? (previousComparableReport?.issues || []).filter((issue) => ["ROUTE_LOAD_FAIL", "HTTP_5XX", "NET_REQUEST_FAILED", "JS_RUNTIME_ERROR", "CONSOLE_ERROR"].includes(String(issue.code || ""))).length : Number.NaN;
  const uxCurrent = (report.issues || []).filter((issue) => String(issue.code || "").startsWith("VISUAL_") || String(issue.code || "").startsWith("BTN_")).length;
  const uxPrevious = comparison ? (previousComparableReport?.issues || []).filter((issue) => String(issue.code || "").startsWith("VISUAL_") || String(issue.code || "").startsWith("BTN_")).length : Number.NaN;

  const intelligence = {
    executiveSummary: report.intelligence?.executiveSummary || normalizeIntelligence(null).executiveSummary,
    patterns: Array.isArray(report.intelligence?.patterns) ? report.intelligence.patterns : [],
    comparison,
    topIssues: Array.isArray(report.intelligence?.topIssues) ? report.intelligence.topIssues : [],
    recurringIssues,
    trendSummary: {
      seo: buildTrendDescriptor("SEO", Number(report.summary?.seoScore || 0), Number(reference?.snapshot?.report?.summary?.seoScore ?? Number.NaN), 3),
      runtime: buildTrendDescriptor("Runtime", runtimeCurrent, runtimePrevious, 1),
      ux: buildTrendDescriptor("UX", uxCurrent, uxPrevious, 1),
    },
    issueTrends,
  };
  uiState.continuousIntelligenceCache = {
    key: cacheKey,
    value: intelligence,
  };
  return intelligence;
}

function createEmptyPredictiveSnapshot() {
  if (typeof window.createSitePulsePredictiveIntelligenceService === "function") {
    const service = ensurePredictiveService();
    if (service?.createEmptyPredictiveSnapshot) {
      return service.createEmptyPredictiveSnapshot();
    }
  }
  return {
    updatedAt: "",
    contextKey: "",
    historyDepth: 0,
    summary: {
      degradingIssues: 0,
      improvingIssues: 0,
      oscillatingIssues: 0,
      stableIssues: 0,
      highRiskAlerts: 0,
      mediumRiskAlerts: 0,
      recurringPatterns: 0,
    },
    trendOverview: {
      seo: { direction: "stable", strength: 0, confidence: 0, text: "SEO = stable" },
      runtime: { direction: "stable", strength: 0, confidence: 0, text: "Runtime = stable" },
      ux: { direction: "stable", strength: 0, confidence: 0, text: "UX = stable" },
    },
    alerts: [],
    systemicPatterns: [],
    issueSignals: {},
    topPredictiveRisks: [],
  };
}

function ensurePredictiveService() {
  if (uiState.predictiveService) return uiState.predictiveService;
  if (typeof window.createSitePulsePredictiveIntelligenceService !== "function") {
    return null;
  }
  uiState.predictiveService = window.createSitePulsePredictiveIntelligenceService({
    getHistory: () => [...uiState.history],
    getComparableSeries: (report) => buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT).series,
    getReferenceSnapshot,
    issueSignature,
    severityRank,
  });
  return uiState.predictiveService;
}

function ensureDataIntelligenceService() {
  if (uiState.dataIntelligenceService) return uiState.dataIntelligenceService;
  if (typeof window.createSitePulseDataIntelligenceService !== "function") {
    return null;
  }
  uiState.dataIntelligenceService = window.createSitePulseDataIntelligenceService({
    issueSignature,
    priorityRank,
  });
  return uiState.dataIntelligenceService;
}

function ensureOptimizationService() {
  if (uiState.optimizationService) return uiState.optimizationService;
  if (typeof window.createSitePulseOptimizationEngineService !== "function") {
    return null;
  }
  uiState.optimizationService = window.createSitePulseOptimizationEngineService();
  return uiState.optimizationService;
}

function ensureQualityControlService() {
  if (uiState.qualityControlService) return uiState.qualityControlService;
  if (typeof window.createSitePulseQualityControlEngine !== "function") {
    return null;
  }
  uiState.qualityControlService = window.createSitePulseQualityControlEngine();
  return uiState.qualityControlService;
}

function buildPredictiveIntelligence(report) {
  if (!report) {
    return createEmptyPredictiveSnapshot();
  }
  const historyContext = buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_COMPARABLE_LIMIT),
  ].join("::");
  if (uiState.predictiveCache?.key === cacheKey) {
    return uiState.predictiveCache.value;
  }
  const service = ensurePredictiveService();
  const predictive = service?.buildPredictiveIntelligence
    ? service.buildPredictiveIntelligence(report)
    : createEmptyPredictiveSnapshot();
  uiState.predictiveCache = {
    key: cacheKey,
    value: predictive,
  };
  return predictive;
}

function createEmptyAutonomousQaSnapshot() {
  if (typeof window.createSitePulseAutonomousQaService === "function") {
    const service = ensureAutonomousQaService();
    if (service?.createEmptyAutonomousSnapshot) {
      return service.createEmptyAutonomousSnapshot();
    }
  }
  return {
    updatedAt: "",
    qualityScore: {
      total: 0,
      dimensions: {
        seoQuality: 0,
        uxQuality: 0,
        performanceQuality: 0,
        visualIntegrity: 0,
        technicalIntegrity: 0,
        trendStability: 0,
      },
      rationale: [],
    },
    qualityTrajectory: {
      direction: "stable",
      confidence: 0,
      currentScore: 0,
      previousScore: 0,
      evidence: [],
    },
    nextActions: [],
    playbooks: {},
    insights: {
      topRisks: [],
      topImprovements: [],
      criticalRegressions: [],
      recommendedActions: [],
    },
    observability: {
      loop: [],
    },
  };
}

function ensureAutonomousQaService() {
  if (uiState.autonomousQaService) return uiState.autonomousQaService;
  if (typeof window.createSitePulseAutonomousQaService !== "function") {
    return null;
  }
  uiState.autonomousQaService = window.createSitePulseAutonomousQaService({
    issueSignature,
    severityRank,
    priorityRank: (priorityLevel) => {
      switch (String(priorityLevel || "").toUpperCase()) {
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
    },
  });
  return uiState.autonomousQaService;
}

function buildAutonomousQa(report, contextInput = null) {
  if (!report) {
    return createEmptyAutonomousQaSnapshot();
  }
  const learningMemory = contextInput?.learningMemory || getOperationalMemorySnapshot(report);
  const selfHealing = contextInput?.selfHealing || getVisibleSelfHealing(report);
  const historyContext = contextInput?.historyContext || buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_COMPARABLE_LIMIT),
    String(selfHealing?.updatedAt || ""),
    String(learningMemory?.updatedAt || ""),
    String(learningMemory?.summary?.entries || 0),
  ].join("::");
  if (uiState.autonomousQaCache?.key === cacheKey) {
    return uiState.autonomousQaCache.value;
  }
  const service = ensureAutonomousQaService();
  const autonomous = service?.buildAutonomousQa
    ? service.buildAutonomousQa(report, {
        learningMemory,
        selfHealing,
        intelligence: contextInput?.intelligence || buildContinuousIntelligence(report),
        predictive: contextInput?.predictive || buildPredictiveIntelligence(report),
        runHistory: historyContext.runHistory,
      })
    : createEmptyAutonomousQaSnapshot();
  uiState.autonomousQaCache = {
    key: cacheKey,
    value: autonomous,
  };
  return autonomous;
}

function buildOptimizationSnapshot(report, contextInput = null) {
  if (!report) {
    return createEmptyOptimizationSnapshot();
  }
  const historyContext = contextInput?.historyContext || buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_COMPARABLE_LIMIT),
  ].join("::");
  if (uiState.optimizationCache?.key === cacheKey) {
    return uiState.optimizationCache.value;
  }
  const service = ensureOptimizationService();
  const optimization = service?.buildOptimizationSnapshot
    ? service.buildOptimizationSnapshot(report, {
        dataIntelligence: contextInput?.dataIntelligence || createEmptyDataIntelligenceSnapshot(),
        predictive: contextInput?.predictive || createEmptyPredictiveSnapshot(),
        autonomous: contextInput?.autonomous || createEmptyAutonomousQaSnapshot(),
      })
    : createEmptyOptimizationSnapshot();
  uiState.optimizationCache = {
    key: cacheKey,
    value: optimization,
  };
  return optimization;
}

function buildQualityControlSnapshot(report, contextInput = null) {
  if (!report) {
    return createEmptyQualityControlSnapshot();
  }
  const historyContext = contextInput?.historyContext || buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_COMPARABLE_LIMIT),
  ].join("::");
  if (uiState.qualityControlCache?.key === cacheKey) {
    return uiState.qualityControlCache.value;
  }
  const service = ensureQualityControlService();
  const qualityControl = service?.buildQualityControlSnapshot
    ? service.buildQualityControlSnapshot(report, {
        dataIntelligence: contextInput?.dataIntelligence || createEmptyDataIntelligenceSnapshot(),
      })
    : createEmptyQualityControlSnapshot();
  uiState.qualityControlCache = {
    key: cacheKey,
    value: qualityControl,
  };
  return qualityControl;
}

function buildDesktopIntelligenceSnapshot(report) {
  if (!report) {
    return {
      learningMemory: getOperationalMemorySnapshot(null),
      selfHealing: getVisibleSelfHealing(null),
      intelligence: createEmptyContinuousIntelligenceSnapshot(),
      predictive: createEmptyPredictiveSnapshot(),
      autonomous: createEmptyAutonomousQaSnapshot(),
      dataIntelligence: createEmptyDataIntelligenceSnapshot(),
      optimization: createEmptyOptimizationSnapshot(),
      qualityControl: createEmptyQualityControlSnapshot(),
    };
  }

  const learningMemory = getOperationalMemorySnapshot(report);
  const selfHealing = getVisibleSelfHealing(report);
  const historyContext = buildComparableHistoryContext(report, HISTORY_COMPARABLE_LIMIT);
  const cacheKey = [
    buildLiveReportKey(report),
    String(historyContext.reference?.snapshot?.stamp || uiState.baseline?.stamp || ""),
    buildRecentHistoryStamp(HISTORY_COMPARABLE_LIMIT),
    String(selfHealing?.updatedAt || ""),
    String(learningMemory?.updatedAt || ""),
    String(learningMemory?.summary?.entries || 0),
  ].join("::");
  if (uiState.desktopIntelligenceCache?.key === cacheKey) {
    return uiState.desktopIntelligenceCache.value;
  }

  const intelligence = buildContinuousIntelligence(report);
  const predictive = buildPredictiveIntelligence(report);
  const autonomous = buildAutonomousQa(report, {
    learningMemory,
    selfHealing,
    intelligence,
    predictive,
    historyContext,
  });
  const dataIntelligenceService = ensureDataIntelligenceService();
  const dataIntelligence = dataIntelligenceService?.buildDataIntelligence
    ? dataIntelligenceService.buildDataIntelligence(report, {
        learningMemory,
        selfHealing,
        intelligence,
        predictive,
        autonomous,
        runHistory: historyContext.runHistory,
      })
    : createEmptyDataIntelligenceSnapshot();
  const optimization = buildOptimizationSnapshot(report, {
    historyContext,
    dataIntelligence,
    predictive,
    autonomous,
  });
  const qualityControl = buildQualityControlSnapshot(report, {
    historyContext,
    dataIntelligence,
  });
  const snapshot = {
    learningMemory,
    selfHealing,
    intelligence,
    predictive,
    autonomous,
    dataIntelligence,
    optimization,
    qualityControl,
  };
  uiState.desktopIntelligenceCache = {
    key: cacheKey,
    value: snapshot,
  };
  return snapshot;
}

function createEmptyContinuousIntelligenceSnapshot() {
  return {
    executiveSummary: normalizeIntelligence(null).executiveSummary,
    patterns: [],
    comparison: null,
    topIssues: [],
    recurringIssues: [],
    trendSummary: {
      seo: buildTrendDescriptor("SEO", Number.NaN, Number.NaN, 1),
      runtime: buildTrendDescriptor("Runtime", Number.NaN, Number.NaN, 1),
      ux: buildTrendDescriptor("UX", Number.NaN, Number.NaN, 1),
    },
    issueTrends: {},
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
  const targetViewportLabel = String(item.viewportLabel || "").trim();
  const targetViewport = String(item.viewport || "").trim();

  const bestMatch = collectReportEvidence(reference.snapshot.report)
    .map((candidate) => {
      let score = 0;
      if (String(candidate.issueCode || candidate.code || "") === targetCode) score += 5;
      if (String(candidate.issueRoute || candidate.route || "/") === targetRoute) score += 4;
      if (String(candidate.variant || "") === targetVariant) score += 3;
      if (String(candidate.issueGroup || "") === targetGroup) score += 2;
      if (targetViewportLabel) {
        score += String(candidate.viewportLabel || "").trim() === targetViewportLabel ? 5 : -8;
      }
      if (targetViewport) {
        score += String(candidate.viewport || "").trim() === targetViewport ? 4 : -6;
      }
      return { candidate, score };
    })
    .filter((entry) => entry.score >= (targetViewportLabel || targetViewport ? 13 : 9))
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
    `Reduced issues: ${comparison.reducedIssues.length}`,
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

  if (comparison.reducedIssues.length) {
    lines.push("Improving issues:");
    comparison.reducedIssues.slice(0, 6).forEach((issue, index) => {
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

function getIssueMemoryStatus(issue) {
  const validated = toNumber(issue?.learningCounts?.validated, 0);
  const failed = toNumber(issue?.learningCounts?.failed, 0);
  const partial = toNumber(issue?.learningCounts?.partial, 0);
  if (validated > 0) return "validated";
  if (partial > 0) return "partial";
  if (failed > 0) return "failed";
  return "none";
}

function getIssueResolutionSource(issue) {
  return normalizeText(issue?.finalResolutionOrigin || "").toLowerCase() || "none";
}

function getIssueImpactBand(issue) {
  const score = toNumber(issue?.impact?.impactScore, 0);
  if (score >= 0.7) return "high";
  if (score >= 0.4) return "medium";
  return "low";
}

function getIssueHealingBand(issueContext) {
  const score = toNumber(issueContext?.healing?.confidenceScore, 0);
  if (!score) return "none";
  if (score >= 75) return "high";
  if (score >= 45) return "medium";
  return "low";
}

function getIssueQualityStatus(issue, qualityControlContext) {
  return normalizeText(qualityControlContext?.issueMap?.[issueSignature(issue)]?.status || "ok").toLowerCase();
}

function buildOperationalIssueMaps(report, intelligenceSnapshot) {
  const nextActionMap = new Map();
  const nextActionByCode = new Map();
  const priorityMap = new Map();
  const priorityByCode = new Map();
  const nextActions = Array.isArray(intelligenceSnapshot?.autonomous?.nextActions) ? intelligenceSnapshot.autonomous.nextActions : [];
  nextActions.forEach((item, index) => {
    const key = [String(item.issueCode || "").trim().toUpperCase(), String(item.route || "/").trim(), String(item.action || "").trim()].join("|");
    const payload = {
      score: toNumber(item.score, 0),
      rank: index,
    };
    nextActionMap.set(key, payload);
    if (!nextActionByCode.has(String(item.issueCode || "").trim().toUpperCase())) {
      nextActionByCode.set(String(item.issueCode || "").trim().toUpperCase(), payload);
    }
  });
  const priorityQueue = Array.isArray(intelligenceSnapshot?.dataIntelligence?.RISK_STATE?.priorityQueue)
    ? intelligenceSnapshot.dataIntelligence.RISK_STATE.priorityQueue
    : [];
  priorityQueue.forEach((item, index) => {
    const key = [String(item.issueCode || "").trim().toUpperCase(), String(item.route || "/").trim(), String(item.action || "").trim()].join("|");
    const payload = {
      score: toNumber(item.compositeScore, 0),
      rank: index,
    };
    priorityMap.set(key, payload);
    if (!priorityByCode.has(String(item.issueCode || "").trim().toUpperCase())) {
      priorityByCode.set(String(item.issueCode || "").trim().toUpperCase(), payload);
    }
  });
  return {
    nextActionMap,
    nextActionByCode,
    priorityMap,
    priorityByCode,
    currentTrajectory: normalizeText(intelligenceSnapshot?.dataIntelligence?.QUALITY_STATE?.trajectory || "").toLowerCase() || "stable",
  };
}

function getOperationalPriorityEntry(issueLike, operationalMaps) {
  const code = String(issueLike?.issueCode || issueLike?.code || "").trim().toUpperCase();
  const route = String(issueLike?.route || "/").trim();
  const action = String(issueLike?.action || "").trim();
  const key = [code, route, action].join("|");
  return {
    nextAction: operationalMaps.nextActionMap.get(key) || operationalMaps.nextActionByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
    priority: operationalMaps.priorityMap.get(key) || operationalMaps.priorityByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
  };
}

function compareOperationalPriority(left, right, operationalMaps, fallback) {
  const leftEntry = getOperationalPriorityEntry(left, operationalMaps);
  const rightEntry = getOperationalPriorityEntry(right, operationalMaps);
  if (rightEntry.nextAction.score !== leftEntry.nextAction.score) {
    return rightEntry.nextAction.score - leftEntry.nextAction.score;
  }
  if (leftEntry.nextAction.rank !== rightEntry.nextAction.rank) {
    return leftEntry.nextAction.rank - rightEntry.nextAction.rank;
  }
  if (rightEntry.priority.score !== leftEntry.priority.score) {
    return rightEntry.priority.score - leftEntry.priority.score;
  }
  if (leftEntry.priority.rank !== rightEntry.priority.rank) {
    return leftEntry.priority.rank - rightEntry.priority.rank;
  }
  return typeof fallback === "function" ? fallback(left, right) : 0;
}

function getFilteredIssues(report) {
  if (!report) return [];
  const query = uiState.findingsSearch.trim().toLowerCase();
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const dataIntelligenceContext = intelligenceSnapshot.dataIntelligence;
  const qualityControlContext = intelligenceSnapshot.qualityControl;
  const operationalMaps = buildOperationalIssueMaps(report, intelligenceSnapshot);
  return report.issues.filter((issue) => {
    const severityMatch = uiState.issueFilter === "all" || issue.severity === uiState.issueFilter;
    const routeMatch = uiState.findingsRoute === "all" || issue.route === uiState.findingsRoute;
    const issueContext = dataIntelligenceContext?.ISSUE_MAP?.[issueSignature(issue)] || null;
    const qualityMatch = uiState.findingsIntelligenceFilters.quality === "all"
      || getIssueQualityStatus(issue, qualityControlContext) === uiState.findingsIntelligenceFilters.quality;
    const priorityMatch = uiState.findingsIntelligenceFilters.priority === "all"
      || normalizeText(issueContext?.impact?.priority || issue.impact?.priorityLevel || "P4").toUpperCase() === uiState.findingsIntelligenceFilters.priority;
    const predictiveLevel = normalizeText(issueContext?.predictiveRisk?.level || "").toLowerCase() || "none";
    const predictiveMatch = uiState.findingsIntelligenceFilters.predictiveRisk === "all"
      || predictiveLevel === uiState.findingsIntelligenceFilters.predictiveRisk;
    const trajectoryDirection = normalizeText(issueContext?.trend?.direction || operationalMaps.currentTrajectory || "stable").toLowerCase();
    const trajectoryMatch = uiState.findingsIntelligenceFilters.trajectory === "all"
      || trajectoryDirection === uiState.findingsIntelligenceFilters.trajectory;
    const healingMatch = uiState.findingsIntelligenceFilters.healing === "all"
      || getIssueHealingBand(issueContext) === uiState.findingsIntelligenceFilters.healing;
    const memoryMatch = uiState.findingsIntelligenceFilters.memory === "all"
      || getIssueMemoryStatus(issue) === uiState.findingsIntelligenceFilters.memory;
    const resolutionMatch = uiState.findingsIntelligenceFilters.resolution === "all"
      || getIssueResolutionSource(issue) === uiState.findingsIntelligenceFilters.resolution;
    const impactMatch = uiState.findingsIntelligenceFilters.impact === "all"
      || getIssueImpactBand(issue) === uiState.findingsIntelligenceFilters.impact;
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
    return severityMatch
      && routeMatch
      && qualityMatch
      && priorityMatch
      && predictiveMatch
      && trajectoryMatch
      && healingMatch
      && memoryMatch
      && resolutionMatch
      && impactMatch
      && searchMatch;
  }).sort((left, right) =>
    compareOperationalPriority(left, right, operationalMaps, (fallbackLeft, fallbackRight) => {
      const byPriority = priorityRank(fallbackLeft.impact?.priorityLevel) - priorityRank(fallbackRight.impact?.priorityLevel);
      if (byPriority !== 0) {
        return byPriority;
      }
      const byImpact = toNumber(fallbackRight.impact?.impactScore, 0) - toNumber(fallbackLeft.impact?.impactScore, 0);
      if (byImpact !== 0) {
        return byImpact;
      }
      const leftHealingScore = toNumber((dataIntelligenceContext?.ISSUE_MAP?.[issueSignature(fallbackLeft)] || {}).healing?.confidenceScore, 0);
      const rightHealingScore = toNumber((dataIntelligenceContext?.ISSUE_MAP?.[issueSignature(fallbackRight)] || {}).healing?.confidenceScore, 0);
      const byHealing = rightHealingScore - leftHealingScore;
      if (byHealing !== 0) {
        return byHealing;
      }
      return severityRank(right.severity) - severityRank(left.severity);
    }));
}

function renderStaticSelections() {
  updateSegmentButtons(stateEl.modeButtons, "mode", uiState.mode);
  updateSegmentButtons(stateEl.mobileSweepButtons, "mobileSweep", uiState.mobileSweep);
  updateSegmentButtons(stateEl.scopeButtons, "scope", uiState.scope);
  updateSegmentButtons(stateEl.depthButtons, "depth", uiState.depth);
  updateSegmentButtons(stateEl.severityFilterButtons, "issueFilter", uiState.issueFilter);
  if (stateEl.findingsQualityFilter) stateEl.findingsQualityFilter.value = uiState.findingsIntelligenceFilters.quality;
  if (stateEl.findingsPriorityFilter) stateEl.findingsPriorityFilter.value = uiState.findingsIntelligenceFilters.priority;
  if (stateEl.findingsPredictiveRiskFilter) stateEl.findingsPredictiveRiskFilter.value = uiState.findingsIntelligenceFilters.predictiveRisk;
  if (stateEl.findingsTrajectoryFilter) stateEl.findingsTrajectoryFilter.value = uiState.findingsIntelligenceFilters.trajectory;
  if (stateEl.findingsHealingFilter) stateEl.findingsHealingFilter.value = uiState.findingsIntelligenceFilters.healing;
  if (stateEl.findingsMemoryFilter) stateEl.findingsMemoryFilter.value = uiState.findingsIntelligenceFilters.memory;
  if (stateEl.findingsResolutionFilter) stateEl.findingsResolutionFilter.value = uiState.findingsIntelligenceFilters.resolution;
  if (stateEl.findingsImpactFilter) stateEl.findingsImpactFilter.value = uiState.findingsIntelligenceFilters.impact;
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
  const preparedTargetUrl = getPreparedTargetUrl();
  const reportAlignedWithPreparedTarget = isPreparedTargetAlignedWithReport(visibleReport);
  const evidenceCount = visibleReport ? collectReportEvidence(visibleReport).length : 0;
  const baselineSet = !!(uiState.baseline && uiState.baseline.report);
  const desktopSnap = visibleReport ? buildDesktopIntelligenceSnapshot(visibleReport) : null;
  const healingN = desktopSnap?.selfHealing?.summary?.promptReady ?? 0;
  const healingReady = healingN > 0;

  function setMissionStatus(shortLine, longTooltip) {
    if (!stateEl.missionBrief) return;
    stateEl.missionBrief.textContent = shortLine;
    if (longTooltip) stateEl.missionBrief.setAttribute("title", longTooltip);
    else stateEl.missionBrief.removeAttribute("title");
  }

  if (!bridgeRunning) {
    setMissionStatus("Engine offline. Start the engine before running audits.", "The local engine is offline. Start the engine before trusting the board.");
    return;
  }

  if (audit.running === true) {
    setMissionStatus("Run in progress.", visibleReport
      ? `Audit running. Live snapshot: ${visibleReport.summary.totalIssues} issue(s), ${visibleReport.summary.routesChecked} route(s), SEO ${visibleReport.summary.seoScore}, ${evidenceCount} evidence file(s).`
      : "Follow the live log while the engine produces evidence.");
    return;
  }

  if (!visibleReport) {
    setMissionStatus("No report loaded.", preparedTargetUrl ? `Target: ${preparedTargetUrl}. Run the first audit.` : "Define a target and start the first audit.");
    return;
  }

  const n = visibleReport.summary?.totalIssues ?? 0;
  const p0 = visibleReport.summary?.priorityP0 ?? 0;
  const p1 = visibleReport.summary?.priorityP1 ?? 0;

  if (baselineSet && healingN > 0) {
    setMissionStatus(`Report loaded — ${n} issues, P0 ${p0} P1 ${p1}. Baseline set — compare available. ${healingN} healing attempt(s) ready.`, null);
    return;
  }
  if (baselineSet) {
    setMissionStatus(`Report loaded — ${n} issues, P0 ${p0} P1 ${p1}. Baseline set — compare available.`, null);
    return;
  }
  if (healingN > 0) {
    setMissionStatus(`Report loaded — ${n} issues, P0 ${p0} P1 ${p1}. ${healingN} healing attempt(s) ready.`, null);
    return;
  }

  if (!reportAlignedWithPreparedTarget && preparedTargetUrl) {
    setMissionStatus(`Report from another target. Prepared: ${preparedTargetUrl}. Run again to refresh.`, null);
    return;
  }

  if (visibleReport.meta?.mobileSweep?.profiles?.length) {
    const worstProfile = [...visibleReport.meta.mobileSweep.profiles].sort((left, right) => (right.totalIssues || 0) - (left.totalIssues || 0))[0];
    setMissionStatus(worstProfile
      ? `Mobile sweep — ${visibleReport.meta.baseUrl}. Worst: ${worstProfile?.label} (${worstProfile?.totalIssues} issues).`
      : `Mobile sweep loaded — ${visibleReport.meta.baseUrl}.`, null);
    return;
  }

  const topIssue = visibleReport.issues?.[0];
  if (!topIssue) {
    setMissionStatus(`Report loaded — ${n} issues, P0 ${p0} P1 ${p1}. Latest run clean — use as baseline.`, null);
    return;
  }

  setMissionStatus(`Report loaded — ${n} issues, P0 ${p0} P1 ${p1}. Top pressure: ${topIssue.group}.`, null);
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
    "VISUAL_HIERARCHY_COLLAPSE",
    "VISUAL_CLUSTER_COLLISION",
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
    stateEl.visualHierarchyCount.textContent = "0";
    stateEl.visualClusterCount.textContent = "0";
    stateEl.visualSectionsCount.textContent = "0";
    stateEl.visualQualityHeadline.textContent = "No visual evidence yet.";
    stateEl.visualQualityDetail.textContent = "Run an audit to measure overflow, overlap, alignment drift, spacing discipline, edge pressure, boundary collisions, fold pressure, hierarchy contrast, cluster density and section-level visual rules.";
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
  stateEl.visualHierarchyCount.textContent = String(summary.visualHierarchyCollapse || 0);
  stateEl.visualClusterCount.textContent = String(summary.visualClusterCollision || 0);
  stateEl.visualSectionsCount.textContent = String(sectionRuleIssues);

  const lead = report.issues.find((issue) => issue.code.startsWith("VISUAL_"));
  if (!lead) {
    stateEl.visualQualityHeadline.textContent = total > 0
      ? `${total} visual issue(s) classified.`
      : "No visual quality issues detected in the current report.";
    stateEl.visualQualityDetail.textContent = total > 0
      ? "Open Findings to inspect route-level visual evidence."
      : "Layout spacing, block alignment, edge clearance, width discipline, fold density, hierarchy contrast, cluster separation and section order look stable in this pass.";
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

function setElText(el, text) {
  if (el) el.textContent = text;
}

function setElHtml(el, html) {
  if (el) el.innerHTML = html;
}

function renderExecutiveSummary(report) {
  if (!report) {
    setElText(stateEl.executiveSummaryHeadline, "Run an audit to generate impact scoring, priority and trend intelligence.");
    setElText(stateEl.executivePriorityP0, "P0 0");
    setElText(stateEl.executivePriorityP1, "P1 0");
    setElText(stateEl.executivePriorityP2, "P2 0");
    setElText(stateEl.executiveQualityScore, "Quality 0");
    setElText(stateEl.executiveQualityTrajectory, "Trajectory = stable");
    setElText(stateEl.executiveTrendSeo, "SEO = stable");
    setElText(stateEl.executiveTrendRuntime, "Runtime = stable");
    setElText(stateEl.executiveTrendUx, "UX = stable");
    setElText(stateEl.executivePredictiveHighRisk, "High risk 0");
    setElText(stateEl.executivePredictiveRecurring, "Patterns 0");
    setElHtml(stateEl.executiveSummaryTopRisks, "<li>No impact summary loaded yet.</li>");
    setElHtml(stateEl.executiveSummaryTopOpportunities, "<li>No opportunity snapshot loaded yet.</li>");
    setElHtml(stateEl.executiveSummaryActionOrder, "<li>Run an audit to generate action order.</li>");
    setElHtml(stateEl.executiveSummaryPatterns, "<li>No recurring pattern is loaded yet.</li>");
    setElHtml(stateEl.executiveSummaryPredictiveAlerts, "<li>No predictive alert is available yet.</li>");
    return;
  }

  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const intelligence = intelligenceSnapshot.intelligence;
  const predictive = intelligenceSnapshot.predictive;
  const autonomous = intelligenceSnapshot.autonomous;
  const executive = report.intelligence?.executiveSummary || {};
  setElText(stateEl.executiveSummaryHeadline, executive.headline || "Impact scoring is available for the current run.");
  setElText(stateEl.executivePriorityP0, `P0 ${report.summary.priorityP0 || 0}`);
  setElText(stateEl.executivePriorityP1, `P1 ${report.summary.priorityP1 || 0}`);
  setElText(stateEl.executivePriorityP2, `P2 ${report.summary.priorityP2 || 0}`);
  setElText(stateEl.executiveQualityScore, `Quality ${autonomous.qualityScore.total || 0}`);
  setElText(stateEl.executiveQualityTrajectory, `Trajectory ${formatIssueTrend(autonomous.qualityTrajectory.direction)}`);
  setElText(stateEl.executiveTrendSeo, intelligence.trendSummary.seo.text);
  setElText(stateEl.executiveTrendRuntime, intelligence.trendSummary.runtime.text);
  setElText(stateEl.executiveTrendUx, intelligence.trendSummary.ux.text);
  setElText(stateEl.executivePredictiveHighRisk, `High risk ${predictive.summary.highRiskAlerts || 0}`);
  setElText(stateEl.executivePredictiveRecurring, `Patterns ${predictive.summary.recurringPatterns || 0}`);
  setElHtml(stateEl.executiveSummaryTopRisks, (executive.topRisks || []).length
    ? executive.topRisks.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No top risk summary was attached to this run.</li>");
  setElHtml(stateEl.executiveSummaryTopOpportunities, (executive.topOpportunities || []).length
    ? executive.topOpportunities.slice(0, 4).map((item) => `<li>${escapeHtml(item)}</li>`).join("")
    : "<li>No fast opportunity is attached to this run yet.</li>");
  const actionOrder = (executive.recommendedActionOrder || []).slice(0, 4);
  setElHtml(stateEl.executiveSummaryActionOrder, actionOrder.length
    ? actionOrder.map((code) => {
        const issue = (report.issues || []).find((i) => String(i.code || "").toUpperCase() === String(code || "").toUpperCase());
        const healing = issue?.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
        const canPrepare = healing && ["eligible_for_healing", "assist_only"].includes(String(healing.eligibility || ""));
        const safeCode = escapeHtml(String(code));
        return `<li><button type="button" class="action-link open-findings-search" data-findings-search="${safeCode}">Open issue</button>${canPrepare ? ` <button type="button" class="action-link" data-issue-action="prepare-healing" data-issue-code="${safeCode}">Prepare healing</button>` : ""} <span class="op-muted">${safeCode}</span></li>`;
      }).join("")
    : "<li>No action order is available yet.</li>");
  const patterns = [...(report.intelligence?.patterns || []), ...intelligence.recurringIssues.slice(0, 2).map((item) => ({
    label: `${item.issue.code} recurring in ${item.recurringCount} run(s).`,
  })), ...predictive.systemicPatterns.slice(0, 2).map((item) => ({
    label: item.label,
  }))].slice(0, 4);
  setElHtml(stateEl.executiveSummaryPatterns, patterns.length
    ? patterns.map((item) => `<li>${escapeHtml(item.label || "")}</li>`).join("")
    : "<li>No recurring pattern is loaded yet.</li>");
  setElHtml(stateEl.executiveSummaryPredictiveAlerts, predictive.alerts.length
    ? predictive.alerts.slice(0, 4).map((item) => `<li>${escapeHtml(item.label || "")}</li>`).join("")
    : "<li>No predictive alert is available yet.</li>");
}

function shellBindTextAll(selector, text) {
  const t = String(text ?? "");
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = t;
  });
}

function shellRunLabel(report) {
  if (!report) return "—";
  const fromMeta = report.meta && report.meta.runLabel ? String(report.meta.runLabel).trim() : "";
  if (fromMeta) return fromMeta;
  const ix = (uiState.history || []).findIndex((h) => h && h.stamp === report.meta.generatedAt);
  if (ix >= 0) return `#${ix + 1}`;
  const n = (uiState.history || []).length;
  return n ? `#${n}` : "—";
}

class PatternRailController {
  constructor() {
    this.btnPriority = document.getElementById("railPriority");
    this.btnIssues = document.getElementById("railIssues");
    this.btnEvidence = document.getElementById("railEvidence");
    this.btnPlan = document.getElementById("railPlan");
    this.btnCompare = document.getElementById("railCompare");

    this.activeKey = "priority";
    this.bindHandlers();
    this.syncActiveFromView(uiState.activeView);
  }

  bindHandlers() {
    this.btnPriority?.addEventListener("click", () => this.goTo("priority"));
    this.btnIssues?.addEventListener("click", () => this.goTo("issues"));
    this.btnEvidence?.addEventListener("click", () => this.goTo("evidence"));
    this.btnPlan?.addEventListener("click", () => this.goTo("plan"));
    this.btnCompare?.addEventListener("click", () => this.goTo("compare"));
  }

  goTo(key) {
    // Quando estiver em Focus AI, o painel operador fica invisível;
    // então a ação deve sair do focus para permitir navegação.
    if (uiState.aiWorkspaceMode === AI_WORKSPACE_MODE_FOCUS) {
      setAiWorkspaceMode(uiState.lastNonFocusMode || AI_WORKSPACE_MODE_DOCKED);
    }

    if (key === "priority") {
      switchView("overview");
      this.setActive("priority");
      return;
    }
    if (key === "issues") {
      switchView("findings");
      this.setActive("issues");
      return;
    }
    if (key === "evidence") {
      switchView("reports");
      this.setActive("evidence");
      openLatestEvidence();
      return;
    }
    if (key === "plan") {
      switchView("prompts");
      this.setActive("plan");
      return;
    }
    if (key === "compare") {
      switchView("compare");
      this.setActive("compare");
    }
  }

  setActive(key) {
    const set = (btn, isActive) => {
      if (!btn) return;
      btn.classList.toggle("active", !!isActive);
    };
    set(this.btnPriority, key === "priority");
    set(this.btnIssues, key === "issues");
    set(this.btnEvidence, key === "evidence");
    set(this.btnPlan, key === "plan");
    set(this.btnCompare, key === "compare");
    this.activeKey = key;
    window.dispatchEvent(new CustomEvent("cognitive-pattern-change", { detail: { pattern: key, timestamp: Date.now() } }));
  }

  syncActiveFromView(viewName) {
    if (viewName === "findings") return this.setActive("issues");
    if (viewName === "reports") return this.setActive("evidence");
    if (viewName === "prompts") return this.setActive("plan");
    if (viewName === "compare") return this.setActive("compare");
    // default:
    return this.setActive("priority");
  }
}

function ensurePatternRailController() {
  if (patternRailController) return patternRailController;
  const any = document.getElementById("railPriority") || document.getElementById("railIssues");
  if (!any) return null;
  patternRailController = new PatternRailController();
  return patternRailController;
}

/** Marketing / operator shell: mirrors motor outputs into visible [data-shell] nodes (IDs stay unique). */
function syncOperatorShell(report) {
  const preparedTargetUrl = getPreparedTargetUrl();
  const baseUrl = report ? (getReportBaseUrl(report) || report.meta.baseUrl || "") : "";
  const targetLine = preparedTargetUrl || baseUrl || "—";

  shellBindTextAll('[data-shell="target"]', targetLine);

  const snap = report ? buildDesktopIntelligenceSnapshot(report) : null;
  const q = snap ? Number(snap.dataIntelligence?.QUALITY_STATE?.overallScore ?? snap.autonomous?.qualityScore?.total ?? 0) : 0;
  const qSafe = Number.isFinite(q) ? Math.max(0, Math.round(q)) : 0;
  shellBindTextAll('[data-shell="qualityScore"]', String(qSafe));
  shellBindTextAll('[data-shell="qualityChip"]', `overallScore ${qSafe}`);

  const p0 = report ? Number(report.summary.priorityP0 || 0) : 0;
  const p1 = report ? Number(report.summary.priorityP1 || 0) : 0;
  const p2 = report ? Number(report.summary.priorityP2 || 0) : 0;
  const pSum = p0 + p1;
  shellBindTextAll('[data-shell="p0p1"]', String(pSum));
  shellBindTextAll('[data-shell="p0p1Count"]', String(pSum));
  shellBindTextAll('[data-shell="p0Count"]', String(p0));
  shellBindTextAll('[data-shell="p1Count"]', String(p1));
  shellBindTextAll('[data-shell="p2Count"]', String(p2));
  shellBindTextAll('[data-shell="p0p1Chip"]', `P0/P1: ${pSum}`);
  shellBindTextAll('[data-shell="impactSubline"]', `P0 ${p0} · P1 ${p1}`);

  shellBindTextAll('[data-shell="runBadge"]', shellRunLabel(report));

  const evidenceCount = report ? collectReportEvidence(report).length : 0;
  shellBindTextAll('[data-shell="evidenceCount"]', String(evidenceCount));

  const healN = snap ? Number(snap.selfHealing?.summary?.promptReady ?? 0) : 0;
  shellBindTextAll('[data-shell="healingPending"]', `promptReady ${healN}`);
  shellBindTextAll('[data-shell="healingReadyCount"]', String(healN));
  shellBindTextAll('[data-shell="healingCount"]', String(healN));

  const healEligible = snap ? Number(snap.selfHealing?.summary?.eligible ?? 0) : 0;
  shellBindTextAll('[data-shell="healingEligibleCount"]', String(healEligible));

  /* Root Cause: espelha diagnóstico do "focus issue" (motor -> DOM).
     Aqui a gente só copia o que já existe no report normalizado. */
  let derivedFocus = {
    code: "—",
    route: "—",
    action: "—",
    severity: "—",
    diagnosisTitle: "—",
    laymanExplanation: "—",
    technicalExplanation: "—",
    technicalChecks: "—",
    recommendedActions: "—",
    commandHints: "—",
    likelyAreas: "—",
    recommendedResolution: "—",
    evidenceCount: "0",
  };
  try {
    const riskState = snap?.dataIntelligence?.RISK_STATE || {};
    const nextActions = Array.isArray(snap?.autonomous?.nextActions) ? snap.autonomous.nextActions : [];
    const priorityQueue = Array.isArray(riskState.priorityQueue) ? riskState.priorityQueue : [];
    const lead = nextActions[0] || priorityQueue[0] || null;

    const focusCode = String(lead?.issueCode || report?.issues?.[0]?.code || "").trim();
    if (!focusCode) {
      shellBindTextAll('[data-shell="focusIssueCode"]', "—");
      shellBindTextAll('[data-shell="focusIssueRoute"]', "—");
      shellBindTextAll('[data-shell="focusIssueAction"]', "—");
      shellBindTextAll('[data-shell="focusIssueSeverity"]', "—");
      shellBindTextAll('[data-shell="focusIssueDiagnosisTitle"]', "—");
      shellBindTextAll('[data-shell="focusIssueLaymanExplanation"]', "—");
      shellBindTextAll('[data-shell="focusIssueTechnicalExplanation"]', "—");
      shellBindTextAll('[data-shell="focusIssueProbableCauses"]', "—");
      shellBindTextAll('[data-shell="focusIssueTechnicalChecks"]', "—");
      shellBindTextAll('[data-shell="focusIssueRecommendedActions"]', "—");
      shellBindTextAll('[data-shell="focusIssueCommandHints"]', "—");
      shellBindTextAll('[data-shell="focusIssueLikelyAreas"]', "—");
      shellBindTextAll('[data-shell="focusIssueRecommendedResolution"]', "—");
      shellBindTextAll('[data-shell="focusIssueEvidenceCount"]', "0");
    } else {
      const normCode = focusCode.toUpperCase();
      const leadRoute = lead?.route != null ? String(lead.route).trim() : "";
      const leadAction = lead?.action != null ? String(lead.action).trim() : "";

      const issues = Array.isArray(report?.issues) ? report.issues : [];
      const focusIssue =
        issues.find((it) => String(it?.code || "").trim().toUpperCase() === normCode
          && (leadRoute ? String(it?.route || "/").trim() === leadRoute : true)
          && (leadAction ? String(it?.action || "").trim() === leadAction : true),
        ) || issues.find((it) => String(it?.code || "").trim().toUpperCase() === normCode) || null;

      const diagnosis = focusIssue?.diagnosis && typeof focusIssue.diagnosis === "object" ? focusIssue.diagnosis : {};

      const toJoined = (arr) =>
        Array.isArray(arr)
          ? arr.map((x) => String(x)).filter((x) => x.trim().length > 0).join("\n")
          : "";
      const likelyAreas = toJoined(diagnosis?.likelyAreas);
      const probableCauses = toJoined(diagnosis?.probableCauses);
      const technicalChecks = toJoined(diagnosis?.technicalChecks);
      const recommendedActions = toJoined(diagnosis?.recommendedActions);
      const commandHints = toJoined(diagnosis?.commandHints);

      const layman = String(diagnosis?.laymanExplanation || "").trim();
      const technical = String(diagnosis?.technicalExplanation || "").trim();
      const title = String(diagnosis?.title || "").trim();
      const evidenceCount = String(Array.isArray(focusIssue?.evidence) ? focusIssue.evidence.length : 0);

      const hasDiagnosis = !!(layman || technical || probableCauses || technicalChecks || recommendedActions || commandHints || likelyAreas || (Array.isArray(diagnosis?.probableCauses) && diagnosis.probableCauses.length > 0));

      derivedFocus = {
        code: String(focusIssue?.code || focusCode),
        route: String(focusIssue?.route || leadRoute || "—"),
        action: String(focusIssue?.action || leadAction || "—"),
        severity: String(focusIssue?.severity || "—"),
        diagnosisTitle: title || "—",
        laymanExplanation: hasDiagnosis && layman ? layman : "—",
        technicalExplanation: hasDiagnosis && technical ? technical : "—",
        technicalChecks: hasDiagnosis && technicalChecks ? technicalChecks : "—",
        recommendedActions: hasDiagnosis && recommendedActions ? recommendedActions : "—",
        commandHints: hasDiagnosis && commandHints ? commandHints : "—",
        likelyAreas: hasDiagnosis && likelyAreas ? likelyAreas : "—",
        recommendedResolution: hasDiagnosis && focusIssue?.recommendedResolution ? String(focusIssue.recommendedResolution).trim() : "—",
        evidenceCount,
      };

      shellBindTextAll('[data-shell="focusIssueCode"]', String(focusIssue?.code || focusCode));
      shellBindTextAll('[data-shell="focusIssueRoute"]', String(focusIssue?.route || leadRoute || "—"));
      shellBindTextAll('[data-shell="focusIssueAction"]', String(focusIssue?.action || leadAction || "—"));
      shellBindTextAll('[data-shell="focusIssueSeverity"]', String(focusIssue?.severity || "—"));
      shellBindTextAll('[data-shell="focusIssueDiagnosisTitle"]', title || "—");
      shellBindTextAll('[data-shell="focusIssueLaymanExplanation"]', hasDiagnosis && layman ? layman : "—");
      shellBindTextAll('[data-shell="focusIssueTechnicalExplanation"]', hasDiagnosis && technical ? technical : "—");
      shellBindTextAll('[data-shell="focusIssueProbableCauses"]', hasDiagnosis && probableCauses ? probableCauses : "—");
      shellBindTextAll('[data-shell="focusIssueTechnicalChecks"]', hasDiagnosis && technicalChecks ? technicalChecks : "—");
      shellBindTextAll('[data-shell="focusIssueRecommendedActions"]', hasDiagnosis && recommendedActions ? recommendedActions : "—");
      shellBindTextAll('[data-shell="focusIssueCommandHints"]', hasDiagnosis && commandHints ? commandHints : "—");
      shellBindTextAll('[data-shell="focusIssueLikelyAreas"]', hasDiagnosis && likelyAreas ? likelyAreas : "—");
      shellBindTextAll('[data-shell="focusIssueRecommendedResolution"]', hasDiagnosis && focusIssue?.recommendedResolution ? String(focusIssue.recommendedResolution).trim() : "—");
      shellBindTextAll('[data-shell="focusIssueEvidenceCount"]', evidenceCount);
    }
  } catch (e) {
    // Se falhar, não quebra o HUD. Mantém placeholders.
    // (Sem console.error para não poluir logs do operador.)
  }

  {
    const railPlan = document.getElementById("railPlan");
    if (railPlan) {
      if (healN > 0) railPlan.setAttribute("data-pulse", "healing");
      else railPlan.removeAttribute("data-pulse");
    }
  }

  const memoryN = snap ? Number(snap.learningMemory?.summary?.entries ?? 0) : 0;
  shellBindTextAll('[data-shell="memoryEntries"]', String(memoryN));

  const pSumPred = snap?.predictive?.summary || {};
  const predRisk = Number(pSumPred.highRiskAlerts ?? 0);
  const predMed = Number(pSumPred.mediumRiskAlerts ?? 0);
  const predPat = Number(pSumPred.recurringPatterns ?? 0);
  const predDeg = Number(pSumPred.degradingIssues ?? 0);
  const predImp = Number(pSumPred.improvingIssues ?? 0);
  shellBindTextAll('[data-shell="predictiveHighRiskAlerts"]', String(predRisk));
  shellBindTextAll('[data-shell="predictiveMediumRiskAlerts"]', String(predMed));
  shellBindTextAll('[data-shell="predictiveRecurringPatterns"]', String(predPat));
  shellBindTextAll('[data-shell="predictiveDegradingIssues"]', String(predDeg));
  shellBindTextAll('[data-shell="predictiveImprovingIssues"]', String(predImp));
  shellBindTextAll(
    '[data-shell="predictiveChip"]',
    `highRiskAlerts ${predRisk} · mediumRiskAlerts ${predMed} · recurringPatterns ${predPat}`,
  );
  shellBindTextAll('[data-shell="predictiveHero"]', String(Number.isFinite(predRisk) ? predRisk : 0));
  shellBindTextAll(
    '[data-shell="predictiveSubline"]',
    `degradingIssues ${predDeg} · improvingIssues ${predImp} · recurringPatterns ${predPat}`,
  );

  const modeLabel = uiState.mode === "mobile" && uiState.mobileSweep === "family" ? "mobile family" : uiState.mode;
  shellBindTextAll('[data-shell="modeChip"]', `Mode: ${modeLabel}`);

  const bridgeRunning = uiState.companionState?.bridge?.running === true;
  shellBindTextAll("[data-shell=\"engineChip\"]", bridgeRunning ? "engine ready" : "engine offline");

  if (stateEl.executiveQualityTrajectory) {
    shellBindTextAll('[data-shell="qualityTrajectory"]', stateEl.executiveQualityTrajectory.textContent || "quality");
  }

  const bar = document.querySelector('[data-shell="qualityBar"]');
  if (bar && bar instanceof HTMLElement) {
    bar.style.width = `${Math.min(100, Math.max(0, qSafe))}%`;
  }

  /* Comparativo: mesmo contrato que buildCompareDigest (compareReports + getReferenceSnapshot). */
  const refSnap = report ? getReferenceSnapshot(report) : null;
  const comparison = report && refSnap?.snapshot?.report ? compareReports(report, refSnap.snapshot.report) : null;
  shellBindTextAll('[data-shell="stickyRef"]', refSnap?.label && report ? String(refSnap.label) : "—");
  shellBindTextAll(
    '[data-shell="compareDeltaBadge"]',
    comparison ? signedDelta(comparison.issueDelta) : "—",
  );
  // Edge lighting state driven by motor outputs (no simulated values).
  {
    const sticky = document.getElementById("stickyContextBar");
    if (sticky) {
      let cognitiveState = "monitoring";
      if (healN > 0) cognitiveState = "healing";
      else if (
        predRisk > 0
        || pSum > 0
        || comparison?.criticalRegressions?.length > 0
        || (Number.isFinite(comparison?.issueDelta) && comparison.issueDelta > 0)
      ) cognitiveState = "alert";
      sticky.setAttribute("data-cognitive-state", cognitiveState);
    }
  }
  if (comparison) {
    shellBindTextAll('[data-shell="stickyDeltaIssues"]', `Issue delta ${signedDelta(comparison.issueDelta)}`);
    shellBindTextAll('[data-shell="stickyDeltaSeo"]', `SEO delta ${signedDelta(comparison.seoDelta)}`);
    shellBindTextAll('[data-shell="stickyDeltaRisk"]', `Risk delta ${signedDelta(comparison.riskDelta)}`);
    shellBindTextAll(
      '[data-shell="stickyCompareRoutesActions"]',
      `Route delta ${signedDelta(comparison.routeDelta)} · Action delta ${signedDelta(comparison.actionDelta)}`,
    );
  } else {
    shellBindTextAll('[data-shell="stickyDeltaIssues"]', "—");
    shellBindTextAll('[data-shell="stickyDeltaSeo"]', "—");
    shellBindTextAll('[data-shell="stickyDeltaRisk"]', "—");
    shellBindTextAll('[data-shell="stickyCompareRoutesActions"]', "—");
  }

  /* OperatorBelowSticky: queue + operator cards + fix plan step (data-shell derived from same motor snapshot). */
  const sevRaw = String(derivedFocus.severity || "—").toLowerCase();
  const severityBand = sevRaw.includes("p0") ? "P0" : sevRaw.includes("p1") ? "P1" : sevRaw.includes("p2") ? "P2" : "—";

  const trajText = String(stateEl.executiveQualityTrajectory?.textContent || "").toLowerCase();
  const trajectoryBand = trajText.includes("degrad") ? "degrading" : trajText.includes("improv") ? "improving" : "stable";

  const pickSubtitle = () => {
    if (derivedFocus.laymanExplanation && derivedFocus.laymanExplanation !== "—") return derivedFocus.laymanExplanation;
    if (derivedFocus.technicalExplanation && derivedFocus.technicalExplanation !== "—") return derivedFocus.technicalExplanation;
    if (derivedFocus.recommendedActions && derivedFocus.recommendedActions !== "—") return derivedFocus.recommendedActions;
    return "—";
  };

  const queue0Title = derivedFocus.diagnosisTitle !== "—" ? derivedFocus.diagnosisTitle : derivedFocus.code;
  const queue0Subtitle = pickSubtitle();
  const queue0Memory = memoryN > 0 ? `${memoryN} entries` : "—";
  const queue0Healing = healN > 0 ? `ready ${healN}` : healEligible > 0 ? `eligible ${healEligible}` : "—";
  const queue0Route = derivedFocus.route;
  const queue0Impact = `Q ${qSafe}`;

  const bandCounts = [
    { band: "P0", n: p0 },
    { band: "P1", n: p1 },
    { band: "P2", n: p2 },
  ].sort((a, b) => b.n - a.n);
  let queue1Band = "—";
  if (severityBand !== "—") {
    const alt = bandCounts.find((x) => x.band !== severityBand && x.n > 0);
    if (alt) queue1Band = alt.band;
  }
  if (queue1Band === "—") {
    queue1Band = (bandCounts.find((x) => x.n > 0) || { band: severityBand }).band;
  }

  const queue1Title = queue1Band !== "—" ? `${queue1Band} signal` : "—";
  const queue1Subtitle = derivedFocus.technicalChecks !== "—" ? derivedFocus.technicalChecks : derivedFocus.recommendedActions;
  const queue1Memory = queue0Memory;
  const queue1Healing = queue0Healing;
  const queue1Route = derivedFocus.route;
  const queue1Impact = queue0Impact;

  /* Bind text shells. */
  shellBindTextAll('[data-shell="queue0Title"]', queue0Title);
  shellBindTextAll('[data-shell="queue0Band"]', severityBand);
  shellBindTextAll('[data-shell="queue0Trajectory"]', trajectoryBand);
  shellBindTextAll('[data-shell="queue0Memory"]', queue0Memory);
  shellBindTextAll('[data-shell="queue0Healing"]', queue0Healing);
  shellBindTextAll('[data-shell="queue0Route"]', queue0Route);
  shellBindTextAll('[data-shell="queue0Subtitle"]', queue0Subtitle);
  shellBindTextAll('[data-shell="queue0Impact"]', queue0Impact);

  shellBindTextAll('[data-shell="queue1Title"]', queue1Title);
  shellBindTextAll('[data-shell="queue1Band"]', queue1Band);
  shellBindTextAll('[data-shell="queue1Healing"]', queue1Healing);
  shellBindTextAll('[data-shell="queue1Route"]', queue1Route);
  shellBindTextAll('[data-shell="queue1Subtitle"]', queue1Subtitle);
  shellBindTextAll('[data-shell="queue1Impact"]', queue1Impact);

  shellBindTextAll('[data-shell="operatorMemorySubtitle"]', memoryN > 0 ? `${memoryN} entries` : "0 entries");
  shellBindTextAll('[data-shell="operatorHealSubtitle"]', `Eligible ${healEligible} · Ready ${healN}`);
  shellBindTextAll(
    '[data-shell="operatorHealState"]',
    healN > 0 ? `Ready ${healN}` : healEligible > 0 ? `Eligible ${healEligible}` : "Waiting",
  );
  shellBindTextAll(
    '[data-shell="operatorCompareSubtitle"]',
    comparison
      ? `Route delta ${signedDelta(comparison.routeDelta)} · Action delta ${signedDelta(comparison.actionDelta)}`
      : "—",
  );
  shellBindTextAll('[data-shell="operatorCompareDelta"]', comparison ? signedDelta(comparison.issueDelta) : "—");

  const fixPlanStep = healN > 0 ? 4 : healEligible > 0 ? 2 : 1;
  shellBindTextAll('[data-shell="fixPlanStepLabel"]', `Step ${fixPlanStep}/4`);
  {
    const bar = document.querySelector('[data-fixplan-step-bar]');
    if (bar && bar instanceof HTMLElement) bar.style.width = `${Math.round((fixPlanStep / 4) * 100)}%`;
  }

  /* Queue styling overrides (colors derived from data-shell band). */
  const bandStyle = {
    P0: { bg: "#EF4444", border: "rgba(239,68,68,0.35)", fg: "#FDE2E2" },
    P1: { bg: "#F59E0B", border: "rgba(245,158,11,0.35)", fg: "#FEF3C7" },
    P2: { bg: "#3B82F6", border: "rgba(59,130,246,0.35)", fg: "#DBEAFE" },
    "—": { bg: "#9CA3AF", border: "rgba(156,163,175,0.25)", fg: "#E5E7EB" },
  };
  const styleBandEl = (selector, band) => {
    const s = bandStyle[band] || bandStyle["—"];
    const el = document.querySelector(selector);
    if (el && el instanceof HTMLElement) {
      el.style.backgroundColor = s.bg;
      el.style.borderColor = s.border;
      el.style.color = s.fg;
    }
  };
  const styleDotEl = (selector, band) => {
    const s = bandStyle[band] || bandStyle["—"];
    const dot = document.querySelector(selector);
    if (dot && dot instanceof HTMLElement) {
      dot.style.backgroundColor = s.bg;
      dot.style.boxShadow = `0 0 6px ${s.border}`;
    }
  };

  styleBandEl('[data-shell="queue0Band"]', severityBand);
  styleBandEl('[data-shell="queue1Band"]', queue1Band);
  styleDotEl('[data-queue-dot-0]', severityBand);
  styleDotEl('[data-queue-dot-1]', queue1Band);

  ensurePatternRailController()?.syncActiveFromView(uiState.activeView);
}

function renderQualityVisuals(report) {
  if (!report) {
    stateEl.qualityDashboardHeadline.textContent = "Run an audit to load quality dimensions.";
    stateEl.qualityDashboardOverall.textContent = "0";
    stateEl.qualityDashboardSeo.textContent = "0";
    stateEl.qualityDashboardUx.textContent = "0";
    stateEl.qualityDashboardPerformance.textContent = "0";
    stateEl.qualityDashboardTechnical.textContent = "0";
    stateEl.qualityDashboardVisual.textContent = "0";
    stateEl.qualityTimelineHeadline.textContent = "Need comparable history to draw the quality timeline.";
    stateEl.qualityTimelineList.innerHTML = '<article class="empty-state">Run an audit and keep history for the same target to unlock the quality timeline.</article>';
    stateEl.riskMapHeadline.textContent = "Run an audit to classify SEO, UX, performance and technical risk.";
    stateEl.riskMapSeo.textContent = "low";
    stateEl.riskMapUx.textContent = "low";
    stateEl.riskMapPerformance.textContent = "low";
    stateEl.riskMapTechnical.textContent = "low";
    stateEl.priorityViewHeadline.textContent = "Run an audit to rank issues by impact, predictive risk and healing confidence.";
    if (stateEl.priorityQueueTableBody) stateEl.priorityQueueTableBody.innerHTML = '<tr><td colspan="4" class="op-table-empty">No ranked issue queue loaded yet.</td></tr>';
    if (stateEl.priorityViewList) stateEl.priorityViewList.innerHTML = '<article class="empty-state">No ranked issue queue is loaded yet.</article>';
    return;
  }

  const dataIntelligence = buildDesktopIntelligenceSnapshot(report).dataIntelligence;
  const qualityState = dataIntelligence.QUALITY_STATE;
  const riskState = dataIntelligence.RISK_STATE;
  const qualityDimensions = qualityState.dimensions || {};

  stateEl.qualityDashboardHeadline.textContent = `Quality ${qualityState.overallScore || 0} | trajectory ${qualityState.trajectory || "stable"} | confidence ${Number(qualityState.trajectoryConfidence || 0).toFixed(2)}`;
  stateEl.qualityDashboardOverall.textContent = String(qualityState.overallScore || 0);
  stateEl.qualityDashboardSeo.textContent = String(qualityState.seoScore || 0);
  stateEl.qualityDashboardUx.textContent = String(toNumber(qualityDimensions.uxQuality, 0));
  stateEl.qualityDashboardPerformance.textContent = String(toNumber(qualityDimensions.performanceQuality, 0));
  stateEl.qualityDashboardTechnical.textContent = String(toNumber(qualityDimensions.technicalIntegrity, 0));
  stateEl.qualityDashboardVisual.textContent = String(toNumber(qualityDimensions.visualIntegrity, 0));

  const history = Array.isArray(qualityState.qualityHistory) ? qualityState.qualityHistory : [];
  stateEl.qualityTimelineHeadline.textContent = history.length > 1
    ? `${history.length} comparable run(s) loaded for ${report.meta.baseUrl}.`
    : "Need at least one previous comparable run to read the full trajectory.";
  stateEl.qualityTimelineList.innerHTML = history.length
    ? history.map((item, index) => {
        const hasQualityScore = Number.isFinite(Number(item.qualityScore));
        const score = hasQualityScore ? Number(item.qualityScore) : 0;
        const width = hasQualityScore ? clamp(score, 0, 100) : 0;
        const label = item.stamp ? formatLocalDate(item.stamp) : `Run ${index + 1}`;
        return `
          <article class="explorer-item">
            <div class="split-head" style="align-items:center; gap:12px;">
              <div class="history-meta">${escapeHtml(label)}</div>
              <div class="nav-title">Quality ${escapeHtml(hasQualityScore ? String(score) : "n/a")}</div>
            </div>
            <div style="margin-top:8px; display:flex; align-items:center; gap:12px;">
              <div style="flex:1; height:10px; border-radius:999px; background:rgba(125,145,180,0.18); overflow:hidden;">
                <div style="width:${width}%; height:100%; border-radius:999px; background:${score >= 80 ? "#22c55e" : score >= 60 ? "#38bdf8" : score >= 40 ? "#f59e0b" : "#ef4444"};"></div>
              </div>
              <span class="pill">${escapeHtml(`SEO ${toNumber(item.seoScore, 0)}`)}</span>
              <span class="pill">${escapeHtml(`UX ${toNumber(item.uxScore, 0)}`)}</span>
              <span class="pill">${escapeHtml(`Visual ${toNumber(item.visualScore, 0)}`)}</span>
              <span class="pill">${escapeHtml(`${toNumber(item.totalIssues, 0)} issues`)}</span>
              <span class="pill">${escapeHtml(`${item.trajectoryState || "stable"} | conf ${Number(toNumber(item.trendConfidence, 0)).toFixed(2)}`)}</span>
            </div>
          </article>
        `;
      }).join("")
    : '<article class="empty-state">No quality timeline is available yet.</article>';

  const familyRiskMap = riskState.familyRiskMap || {};
  const formatFamilyRisk = (familyKey) => {
    const family = familyRiskMap[familyKey];
    if (!family) return "low";
    return `${family.riskLevel || "low"} | ${Number(toNumber(family.riskConfidence, 0)).toFixed(2)} | ${family.issueCount || 0} issue(s)`;
  };
  stateEl.riskMapHeadline.textContent = riskState.topRisks?.[0]
    ? `Top risk: ${riskState.topRisks[0]}`
    : "Risk map is based on predictive signals, impact and recurring issue families.";
  stateEl.riskMapSeo.textContent = formatFamilyRisk("seo");
  stateEl.riskMapUx.textContent = formatFamilyRisk("ux");
  stateEl.riskMapPerformance.textContent = formatFamilyRisk("performance");
  stateEl.riskMapTechnical.textContent = formatFamilyRisk("technical");

  const priorityQueue = Array.isArray(riskState.priorityQueue) ? riskState.priorityQueue : [];
  stateEl.priorityViewHeadline.textContent = priorityQueue.length
    ? `${priorityQueue.length} issue(s) ranked by impact, predictive risk and healing confidence.`
    : "No ranked issue queue is available for the current run.";
  if (stateEl.priorityQueueTableBody) {
    stateEl.priorityQueueTableBody.innerHTML = priorityQueue.length
      ? priorityQueue.map((item) => {
          const impact = Number(toNumber(item.impactScore, 0)).toFixed(2);
          const confidence = item.healingConfidence ? `${item.healingConfidence.label || "n/a"} ${item.healingConfidence.score}` : (item.predictiveRisk ? `${item.predictiveRisk.level} ${Number(toNumber(item.predictiveRisk.confidence, 0)).toFixed(2)}` : "n/a");
          const code = escapeHtml(String(item.issueCode || ""));
          const route = escapeHtml(String(item.route || "/"));
          const action = escapeHtml(String(item.action || ""));
          const issue = (report.issues || []).find((i) =>
            String(i.code || "").toUpperCase() === String(item.issueCode || "").toUpperCase()
            && String(i.route || "/").trim() === String(item.route || "/").trim()
            && String(i.action || "").trim() === String(item.action || "").trim()) || (report.issues || []).find((i) => String(i.code || "").toUpperCase() === String(item.issueCode || "").toUpperCase());
          const healing = issue?.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
          const canPrepare = healing && ["eligible_for_healing", "assist_only"].includes(String(healing.eligibility || ""));
          const prepareBtn = canPrepare ? ` <button type="button" class="op-btn-secondary op-table-action" data-issue-action="prepare-healing" data-issue-code="${code}" data-issue-route="${route}" data-issue-action-name="${action}">Prepare healing</button>` : "";
          return `<tr data-findings-search="${code}" data-priority-route="${route}" data-priority-action="${action}">
            <td><button type="button" class="op-table-link open-findings-search" data-findings-search="${code}">${code}</button></td>
            <td>${impact}</td>
            <td>${escapeHtml(confidence)}</td>
            <td><button type="button" class="op-btn-secondary op-table-action open-findings-search" data-findings-search="${code}">Open issue</button>${prepareBtn}</td>
          </tr>`;
        }).join("")
      : '<tr><td colspan="4" class="op-table-empty">No ranked issue queue loaded yet.</td></tr>';
  }
  if (stateEl.priorityViewList) {
    stateEl.priorityViewList.innerHTML = priorityQueue.length
      ? priorityQueue.map((item, index) => {
          const issue = (report.issues || []).find((i) => String(i.code || "").toUpperCase() === String(item.issueCode || "").toUpperCase()) || null;
          const healing = issue?.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
          const canPrepare = healing && ["eligible_for_healing", "assist_only"].includes(String(healing.eligibility || ""));
          const code = escapeHtml(String(item.issueCode || ""));
          const prepareBtn = canPrepare ? ` <button type="button" class="op-btn-secondary small" data-issue-action="prepare-healing" data-issue-code="${code}" data-issue-route="${escapeHtml(String(item.route || "/"))}" data-issue-action-name="${escapeHtml(String(item.action || ""))}">Prepare healing</button>` : "";
          return `
          <article class="explorer-item explorer-item-clickable" data-findings-search="${code}">
            <div class="split-head" style="align-items:flex-start; gap:12px;">
              <div>
                <div class="nav-title">${escapeHtml(`${index + 1}. ${item.issueCode}`)}</div>
                <div class="history-meta">${escapeHtml(item.route)}${item.action ? ` -> ${escapeHtml(item.action)}` : ""}</div>
              </div>
              <span class="pill">${escapeHtml(`score ${Number(toNumber(item.compositeScore, 0)).toFixed(2)}`)}</span>
            </div>
            <div class="history-copy" style="margin-top:8px;">
              ${escapeHtml(`impact ${Number(toNumber(item.impactScore, 0)).toFixed(2)} | predictive ${item.predictiveRisk ? `${item.predictiveRisk.level} ${Number(toNumber(item.predictiveRisk.confidence, 0)).toFixed(2)}` : "n/a"} | healing ${item.healingConfidence ? `${item.healingConfidence.label || "n/a"} ${item.healingConfidence.score}` : "n/a"}`)}
            </div>
            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;"><button type="button" class="op-btn-secondary small open-findings-search" data-findings-search="${code}">Open issue</button>${prepareBtn}</div>
          </article>
      `;
        }).join("")
    : '<article class="empty-state">No ranked issue queue is loaded yet.</article>';
  }
}

function renderRunHistoryTable() {
  if (!stateEl.runHistoryTableBody) return;
  const history = Array.isArray(uiState.history) ? uiState.history.slice(0, 8) : [];
  if (!history.length) {
    stateEl.runHistoryTableBody.innerHTML = '<tr><td colspan="5" class="op-table-empty">No run history yet.</td></tr>';
    return;
  }
  stateEl.runHistoryTableBody.innerHTML = history.map((item, index) => {
    const prev = history[index + 1];
    let trend = "—";
    if (index === 0 && !prev) trend = "latest";
    else if (prev && Number.isFinite(item.issueCount) && Number.isFinite(prev.issueCount)) {
      if (item.issueCount < prev.issueCount) trend = "↓ better";
      else if (item.issueCount > prev.issueCount) trend = "↑ worse";
      else trend = "→ stable";
    }
    const stamp = escapeHtml(formatLocalDate(item.stamp));
    const issues = escapeHtml(String(item.issueCount || 0));
    const baseUrlShort = (item.baseUrl || "").length > 28 ? (item.baseUrl || "").slice(0, 25) + "…" : (item.baseUrl || "");
    const isBaseline = uiState.baseline?.stamp === item.stamp;
    const isLastStable = index === 0 && trend === "→ stable";
    return `<tr>
      <td>${stamp}</td>
      <td>${issues}</td>
      <td><span class="op-muted" title="${escapeHtml(item.baseUrl || "")}">${escapeHtml(baseUrlShort)}</span></td>
      <td>${escapeHtml(trend)}${isBaseline ? ' <span class="pill ok">baseline</span>' : ""}${isLastStable ? ' <span class="pill">last stable</span>' : ""}</td>
      <td>
        <button type="button" class="op-btn-secondary op-table-action" data-history-index="${index}" data-history-action="load">Load</button>
        <button type="button" class="op-btn-secondary op-table-action" data-history-index="${index}" data-history-action="baseline">Baseline</button>
      </td>
    </tr>`;
  }).join("");
}

function renderOptimizationSummary(report) {
  if (!report) {
    stateEl.optimizationHeadline.textContent = "Run an audit to detect SEO opportunities, UX improvements and performance gains.";
    stateEl.optimizationTopImprovements.innerHTML = "<li>No structural improvement list is available yet.</li>";
    stateEl.optimizationClusters.innerHTML = "<li>No issue cluster is available yet.</li>";
    return;
  }

  const optimization = buildDesktopIntelligenceSnapshot(report).optimization;
  const summary = optimization.summary || {};
  const topImprovements = Array.isArray(optimization.topImprovements) ? optimization.topImprovements : [];
  const clusters = Array.isArray(optimization.clusters) ? optimization.clusters : [];

  stateEl.optimizationHeadline.textContent = `${summary.seoOpportunities || 0} SEO opportunity cluster(s) | ${summary.uxImprovements || 0} UX improvement cluster(s) | ${summary.performanceGains || 0} performance gain cluster(s)`;
  stateEl.optimizationTopImprovements.innerHTML = topImprovements.length
    ? topImprovements.map((item) => {
        const label = `${item.title} | score ${Number(toNumber(item.compositeScore, 0)).toFixed(2)} | ${item.issueCount} issue(s)`;
        return `<li class="op-drill-row"><span>${escapeHtml(label)}</span> <button type="button" class="engine-strip-link op-drill-btn" data-strip-view="findings">Open Findings</button></li>`;
      }).join("")
    : "<li>No structural improvement list is available yet.</li>";
  stateEl.optimizationClusters.innerHTML = clusters.length
    ? clusters.slice(0, 5).map((cluster) => `<li class="op-drill-row"><span>${escapeHtml(`${cluster.title}: ${cluster.recommendation}`)}</span> <button type="button" class="engine-strip-link op-drill-btn" data-strip-view="findings">Open Findings</button></li>`).join("")
    : "<li>No issue cluster is available yet.</li>";
}

function renderQualityControlSummary(report) {
  if (!report) {
    stateEl.qualityControlHeadline.textContent = "Run an audit to validate scoring consistency and false-positive signals.";
    stateEl.qualityControlFalsePositives.textContent = "0";
    stateEl.qualityControlInconsistencies.textContent = "0";
    stateEl.qualityControlWarnings.textContent = "0";
    stateEl.qualityControlWarningsList.innerHTML = "<li>No quality-control warning is available yet.</li>";
    return;
  }

  const qualityControl = buildDesktopIntelligenceSnapshot(report).qualityControl;
  const summary = qualityControl.summary || {};
  stateEl.qualityControlHeadline.textContent = `${summary.suspectedFalsePositives || 0} suspected false positive(s) | ${summary.inconsistentIssues || 0} inconsistent issue(s) | ${summary.validationWarnings || 0} validation warning(s)`;
  stateEl.qualityControlFalsePositives.textContent = String(summary.suspectedFalsePositives || 0);
  stateEl.qualityControlInconsistencies.textContent = String(summary.inconsistentIssues || 0);
  stateEl.qualityControlWarnings.textContent = String(summary.validationWarnings || 0);
  stateEl.qualityControlWarningsList.innerHTML = Array.isArray(qualityControl.topWarnings) && qualityControl.topWarnings.length
    ? qualityControl.topWarnings.slice(0, 6).map((item) => `<li class="op-drill-row"><span>${escapeHtml(item)}</span> <button type="button" class="engine-strip-link op-drill-btn" data-strip-view="findings">Open Findings</button></li>`).join("")
    : "<li>No quality-control warning is available yet.</li>";
}

function renderIssueMeta(report, filteredIssues, options = {}) {
  if (!report) {
    stateEl.issueMetaPills.innerHTML = "";
    stateEl.findingsHeadline.textContent = "Use this board to drive the fix sequence.";
    return;
  }

  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const qualityState = intelligenceSnapshot.dataIntelligence.QUALITY_STATE || {};
  const riskState = intelligenceSnapshot.dataIntelligence.RISK_STATE || {};
  const counts = getSeverityCounts(report.issues);
  const filteredCount = filteredIssues.length;
  const seoCritical = report.summary.seoCriticalIssues || 0;
  stateEl.issueMetaPills.innerHTML = [
    `<span class="pill bad">P0 ${report.summary.priorityP0 || 0}</span>`,
    `<span class="pill warn">P1 ${report.summary.priorityP1 || 0}</span>`,
    `<span class="pill ok">quality ${qualityState.overallScore || 0}</span>`,
    `<span class="pill">${escapeHtml(`trajectory ${qualityState.trajectory || "stable"}`)}</span>`,
    `<span class="pill">${escapeHtml(`high risk ${riskState.highRiskAlertCount || 0}`)}</span>`,
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

  const nextActionLead = intelligenceSnapshot.autonomous?.nextActions?.[0] || null;
  stateEl.findingsHeadline.textContent = nextActionLead
    ? `Top visible finding: ${lead.group}${lead.action ? ` via "${lead.action}"` : ""}. Operational lead: ${nextActionLead.actionLabel}. Showing ${filteredCount} issue(s) after severity, route and intelligence filters.`
    : `Top visible finding: ${lead.group}${lead.action ? ` via "${lead.action}"` : ""}. Clear this band before moving to the next one.`;
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

function renderCompareIssueList(element, issues, emptyText, trendKind = "") {
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
          <div class="issue-meta">
            ${issue.impact?.priorityLevel ? `<span class="pill">${escapeHtml(issue.impact.priorityLevel)}</span>` : ""}
            ${trendKind ? `<span class="pill">${escapeHtml(trendKind)}</span>` : ""}
            <span class="severity-pill severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
          </div>
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
        viewportLabel: item.viewportLabel || issue.viewportLabel,
        viewport: item.viewport || issue.viewport,
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
            <div class="history-meta">${escapeHtml(item.issueRoute || item.route || "/")}${item.viewportLabel ? ` | ${escapeHtml(item.viewportLabel)}` : ""} | ${escapeHtml(item.issueCode || "")}</div>
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
              <span class="route-sheet-thumb-label">${escapeHtml(`${item.viewportLabel ? `${item.viewportLabel} | ` : ""}${item.variant || item.issueCode || "evidence"}`)}</span>
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
  renderCompareIssueList(stateEl.compareNewIssuesList, comparison.newIssues, "No new issues versus the reference run.", "new");
  renderCompareIssueList(stateEl.compareResolvedIssuesList, comparison.resolvedIssues, "No issues were resolved versus the reference run.", "resolved");
  renderCompareIssueList(stateEl.comparePersistentIssuesList, comparison.persistentIssues, "No issues persisted from the reference run.", "=");
  renderCompareIssueList(stateEl.compareRegressionIssuesList, comparison.criticalRegressions, "No critical regression was detected.", "▼");
}

function formatIssueTrend(trend) {
  if (trend === "improving") return "▲ improving";
  if (trend === "regression" || trend === "degrading") return "▼ degrading";
  if (trend === "oscillating") return "~ oscillating";
  return "= stable";
}

function buildIssueCard(issue, actionContext, dataIntelligenceContext, qualityControlContext, intelligenceContext, predictiveContext, autonomousContext) {
  const priority = issue.assistantHint?.priority ? `<span class="pill">${escapeHtml(issue.assistantHint.priority)}</span>` : "";
  const firstChecks = Array.isArray(issue.assistantHint?.firstChecks) ? issue.assistantHint.firstChecks.slice(0, 3) : [];
  const shouldDo = actionContext?.expectedForUser || actionContext?.expectedFunction || issue.diagnosis.laymanExplanation || "The flow should complete the expected action without breaking.";
  const actualDid = actionContext?.actualFunction || issue.detail;
  const whyItMatters = issue.diagnosis.laymanExplanation || issue.diagnosis.technicalExplanation || "This issue can reduce trust, break navigation or hide failures from operators.";
  const technicalLead = issue.diagnosis.technicalChecks[0] || issue.diagnosis.likelyAreas[0] || "";
  const commands = issue.diagnosis.commandHints.slice(0, 2);
  const validatedLearning = Array.isArray(issue.learningCases) ? issue.learningCases.filter((item) => item.outcome === "validated") : [];
  const failedLearning = Array.isArray(issue.learningCases) ? issue.learningCases.filter((item) => item.outcome === "failed") : [];
  const learningSummary = issue.learningStatus
    ? `${issue.learningStatus} | ${issue.learningCounts.validated} validated | ${issue.learningCounts.failed} failed${issue.learningCounts.partial ? ` | ${issue.learningCounts.partial} partial` : ""}`
    : "";
  const validatedPattern = validatedLearning[0]
    ? `${validatedLearning[0].title}: ${validatedLearning[0].finalFix || validatedLearning[0].result || validatedLearning[0].attempt}`
    : "";
  const failedPattern = failedLearning[0]
    ? `${failedLearning[0].title}: ${failedLearning[0].result || failedLearning[0].attempt}`
    : "";
  const healing = issue.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
  const healingSummary = healing
    ? `${formatHealingEligibility(healing.eligibility)} | ${formatHealingMode(healing.healingMode)} | ${healing.confidenceLabel || "n/a"}${Number.isFinite(Number(healing.confidenceScore)) ? ` (${healing.confidenceScore}/100)` : ""}`
    : "";
  const healingAttempt = healing?.lastAttempt
    ? `${healing.lastAttempt.outcome || healing.lastAttempt.status}${healing.lastAttempt.updatedAt ? ` | ${formatLocalDate(healing.lastAttempt.updatedAt)}` : ""}`
    : "";
  const issueContext = dataIntelligenceContext?.ISSUE_MAP?.[issueSignature(issue)] || null;
  const issueQualityControl = qualityControlContext?.issueMap?.[issueSignature(issue)] || null;
  const predictiveMeta = predictiveContext?.issueSignals?.[issueSignature(issue)] || null;
  const trendMeta = issueContext?.trend
    ? { trend: issueContext.trend.direction, recurringCount: issueContext.history?.recurringCount || 1 }
    : predictiveMeta
    ? { trend: predictiveMeta.trendDirection, recurringCount: predictiveMeta.recurringCount || Number(issue.impact?.recurringCount || 0) }
    : intelligenceContext?.issueTrends?.[issueSignature(issue)] || { trend: "stable", recurringCount: Number(issue.impact?.recurringCount || 0) };
  const impactSummary = issue.impact?.impactScore
    ? `${issue.impact.priorityLevel || "P4"} | impact ${issue.impact.impactScore.toFixed(2)} | ${issue.impact.riskType || issue.impact.impactCategory || "operational risk"}`
    : "";
  const impactWhy = Array.isArray(issue.impact?.rationale) ? issue.impact.rationale.slice(0, 2).join(" | ") : "";
  const predictiveSummary = issueContext?.predictiveRisk
    ? `${issueContext.predictiveRisk.level} | ${issueContext.predictiveRisk.category} | confidence ${Number(issueContext.predictiveRisk.confidence || 0).toFixed(2)}`
    : predictiveMeta
    ? `${predictiveMeta.riskLevel} | ${predictiveMeta.riskCategory} | confidence ${predictiveMeta.riskConfidence.toFixed(2)}`
    : "";
  const predictiveWhy = issueContext?.predictiveRisk?.evidence?.length
    ? issueContext.predictiveRisk.evidence.slice(0, 2).join(" | ")
    : predictiveMeta?.evidence?.length
    ? predictiveMeta.evidence.slice(0, 2).join(" | ")
    : "";
  const autonomousMeta = autonomousContext?.playbooks?.[issueSignature(issue)] || null;
  const qualityControlSummary = issueQualityControl
    ? `${issueQualityControl.status} | score ${Number(toNumber(issueQualityControl.controlScore, 0)).toFixed(2)} | ${issueQualityControl.summary || "n/a"}`
    : "";
  const canPrepareHealing = healing && ["eligible_for_healing", "assist_only"].includes(healing.eligibility) && healing.promptReady === true;
  const canRevalidateHealing = healing?.lastAttempt?.outcome === "pending";
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
          ${issue.impact?.priorityLevel ? `<span class="pill">${escapeHtml(issue.impact.priorityLevel)}</span>` : ""}
          ${issue.impact?.impactScore ? `<span class="pill">${escapeHtml(issue.impact.impactScore.toFixed(2))}</span>` : ""}
          ${issue.impact?.confidence ? `<span class="pill">${escapeHtml(issue.impact.confidence)}</span>` : ""}
          <span class="pill">${escapeHtml(formatIssueTrend(trendMeta.trend))}</span>
          ${predictiveMeta?.riskLevel ? `<span class="pill">${escapeHtml(`risk ${predictiveMeta.riskLevel}`)}</span>` : ""}
          ${issue.viewportLabel ? `<span class="pill">${escapeHtml(issue.viewportLabel)}</span>` : ""}
          <span class="severity-pill severity-${escapeHtml(issue.severity)}">${escapeHtml(issue.severity)}</span>
          <span class="pill">${escapeHtml(issue.code)}</span>
        </div>
      </div>
      <p class="issue-detail"><strong>Should do:</strong> ${escapeHtml(shouldDo)}</p>
      <p class="issue-detail"><strong>Actually did:</strong> ${escapeHtml(actualDid)}</p>
      <p class="issue-detail"><strong>Why it matters:</strong> ${escapeHtml(whyItMatters)}</p>
      ${impactSummary ? `<p class="issue-checks"><strong>Impact:</strong> ${escapeHtml(impactSummary)}</p>` : ""}
      ${impactWhy ? `<p class="issue-checks"><strong>Impact rationale:</strong> ${escapeHtml(impactWhy)}</p>` : ""}
      ${predictiveSummary ? `<p class="issue-checks"><strong>Predictive risk:</strong> ${escapeHtml(predictiveSummary)}</p>` : ""}
      ${predictiveWhy ? `<p class="issue-checks"><strong>Predictive evidence:</strong> ${escapeHtml(predictiveWhy)}</p>` : ""}
      ${qualityControlSummary ? `<p class="issue-checks"><strong>Quality control:</strong> ${escapeHtml(qualityControlSummary)}</p>` : ""}
      ${autonomousMeta?.title ? `<p class="issue-checks"><strong>Playbook:</strong> ${escapeHtml(`${autonomousMeta.title}${autonomousMeta.nextActionLabel ? ` | ${autonomousMeta.nextActionLabel}` : ""}`)}</p>` : ""}
      ${autonomousMeta?.revalidationRule ? `<p class="issue-checks"><strong>Revalidation rule:</strong> ${escapeHtml(autonomousMeta.revalidationRule)}</p>` : ""}
      ${trendMeta.recurringCount > 1 ? `<p class="issue-checks"><strong>Trend memory:</strong> ${escapeHtml(`Recurring in ${trendMeta.recurringCount} run(s) for this target.`)}</p>` : ""}
      ${issueContext?.history?.runsObserved ? `<p class="issue-checks"><strong>History:</strong> ${escapeHtml(`${issueContext.history.runsObserved} comparable run(s) observed${issueContext.history.reappeared ? " | reappeared after disappearing" : ""}`)}</p>` : ""}
      <p class="issue-fix"><strong>Recommended fix:</strong> ${escapeHtml(issue.recommendedResolution)}</p>
      ${issue.possibleResolution ? `<p class="issue-checks"><strong>Possible solution:</strong> ${escapeHtml(issue.possibleResolution)}</p>` : ""}
      ${issue.finalResolution ? `<p class="issue-checks"><strong>Final solution:</strong> ${escapeHtml(issue.finalResolution)}</p>` : ""}
      ${issue.learningSource ? `<p class="issue-checks"><strong>Learning source:</strong> ${escapeHtml(issue.learningSource)}</p>` : ""}
      ${learningSummary ? `<p class="issue-checks"><strong>Learning memory:</strong> ${escapeHtml(learningSummary)}</p>` : ""}
      ${validatedPattern ? `<p class="issue-checks"><strong>Validated pattern:</strong> ${escapeHtml(validatedPattern)}</p>` : ""}
      ${failedPattern ? `<p class="issue-checks"><strong>Avoid this:</strong> ${escapeHtml(failedPattern)}</p>` : ""}
      ${issue.manualOverrideCount ? `<p class="issue-checks"><strong>Manual override:</strong> ${escapeHtml(`${issue.manualOverrideCount} recorded${issue.lastManualOverrideNote ? ` | ${issue.lastManualOverrideNote}` : ""}`)}</p>` : ""}
      ${healingSummary ? `<p class="issue-checks"><strong>Self-healing:</strong> ${escapeHtml(healingSummary)}</p>` : ""}
      ${healing?.strategyDescription ? `<p class="issue-checks"><strong>Healing strategy:</strong> ${escapeHtml(healing.strategyDescription)}</p>` : ""}
      ${healing?.resolutionLead ? `<p class="issue-checks"><strong>Best healing lead:</strong> ${escapeHtml(healing.resolutionLead)}</p>` : ""}
      ${healing?.suggestedNextStep ? `<p class="issue-checks"><strong>Healing next step:</strong> ${escapeHtml(healing.suggestedNextStep)}</p>` : ""}
      ${healingAttempt ? `<p class="issue-checks"><strong>Last healing attempt:</strong> ${escapeHtml(healingAttempt)}</p>` : ""}
      ${technicalLead ? `<p class="issue-checks"><strong>First technical check:</strong> ${escapeHtml(technicalLead)}</p>` : ""}
      ${firstChecks.length ? `<p class="issue-checks"><strong>Next checks:</strong> ${escapeHtml(firstChecks.join(" | "))}</p>` : ""}
      ${commands.length ? `<p class="issue-checks"><strong>Command hints:</strong> ${escapeHtml(commands.join(" | "))}</p>` : ""}
      <div class="history-actions wrap">
        <button type="button" class="ghost small" data-issue-action="open-memory" data-issue-code="${escapeHtml(issue.code)}">Open memory</button>
        <button type="button" class="ghost small" data-issue-action="generate-prompt" data-issue-code="${escapeHtml(issue.code)}">Generate prompt</button>
        ${canPrepareHealing ? `<button type="button" class="ghost small" data-issue-action="prepare-healing" data-issue-code="${escapeHtml(issue.code)}">Prepare healing</button>` : ""}
        ${healing?.promptReady && healing?.promptText ? `<button type="button" class="ghost small" data-issue-action="copy-healing-prompt" data-issue-code="${escapeHtml(issue.code)}">Copy healing prompt</button>` : ""}
        ${canRevalidateHealing ? `<button type="button" class="ghost small" data-issue-action="revalidate-healing" data-issue-code="${escapeHtml(issue.code)}">Revalidate</button>` : ""}
        ${(issue.possibleResolution || issue.finalResolution || issue.recommendedResolution) ? `<button type="button" class="ghost small" data-issue-action="manual-override" data-issue-code="${escapeHtml(issue.code)}">Promote solution</button>` : ""}
      </div>
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
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const dataIntelligenceContext = intelligenceSnapshot.dataIntelligence;
  const qualityControlContext = intelligenceSnapshot.qualityControl;
  const intelligenceContext = intelligenceSnapshot.intelligence;
  const predictiveContext = intelligenceSnapshot.predictive;
  const autonomousContext = intelligenceSnapshot.autonomous;
  renderIssueMeta(report, filteredIssues, options);
  renderIssueGroups(report, filteredIssues);

  if (!filteredIssues.length) {
    stateEl.issuesList.innerHTML = '<article class="empty-state">No issues for the active filter.</article>';
    return;
  }

  stateEl.issuesList.innerHTML = filteredIssues
    .slice(0, 18)
    .map((issue) => buildIssueCard(issue, findActionContext(report, issue), dataIntelligenceContext, qualityControlContext, intelligenceContext, predictiveContext, autonomousContext))
    .join("");
}

function renderPrompt(report) {
  stateEl.quickPromptBox.textContent = buildLearningAwareFixPrompt(report);
}

function renderGoogleSeoSource(sourceInput) {
  const source = normalizeSeoSource(sourceInput);
  uiState.seoSource = source;

  setInputValueIfIdle(stateEl.seoPropertyInput, source.property);
  setInputValueIfIdle(stateEl.seoLookbackDaysInput, String(source.lookbackDays || 28));
  if (document.activeElement !== stateEl.seoAccessTokenInput) {
    stateEl.seoAccessTokenInput.value = "";
  }

  if (!source.snapshot) {
    stateEl.googlePosition.textContent = "n/a";
    stateEl.googleClicks.textContent = "0";
    stateEl.googleImpressions.textContent = "0";
    stateEl.googleCtr.textContent = "n/a";
    stateEl.googleTopQuery.textContent = "n/a";
    stateEl.googleTopPage.textContent = "n/a";
    stateEl.seoExternalHeadline.textContent = source.hasAccessToken
      ? "Google source saved locally. Refresh to pull Search Console metrics."
      : "Connect Search Console only if you want real Google ranking metrics.";
    stateEl.seoExternalDetail.textContent = source.lastError
      ? `Google sync failed: ${source.lastError}`
      : source.hasAccessToken
      ? "A token is already saved locally. Internal SitePulse SEO is already active. Refresh to append Google Search Console data."
      : "Internal SitePulse SEO diagnostics are active even without Google. Search Console is optional and only adds real external ranking, impressions, clicks and CTR.";
    return;
  }

  stateEl.googlePosition.textContent = source.snapshot.position > 0 ? source.snapshot.position.toFixed(1) : "n/a";
  stateEl.googleClicks.textContent = String(source.snapshot.clicks);
  stateEl.googleImpressions.textContent = String(source.snapshot.impressions);
  stateEl.googleCtr.textContent = formatPercent(source.snapshot.ctr);
  stateEl.googleTopQuery.textContent = source.snapshot.topQuery || "n/a";
  stateEl.googleTopPage.textContent = source.snapshot.topPage || "n/a";
  stateEl.seoExternalHeadline.textContent = `Google ranking snapshot | avg position ${stateEl.googlePosition.textContent} | impressions ${source.snapshot.impressions} | clicks ${source.snapshot.clicks}`;
  stateEl.seoExternalDetail.textContent = source.lastError
    ? `The last refresh reported an error, but the previous Google snapshot is still loaded: ${source.lastError}`
    : `Verified Search Console data for ${source.snapshot.property}. Window: ${source.snapshot.startDate} to ${source.snapshot.endDate}. Synced ${formatLocalDate(source.snapshot.syncedAt || source.lastSyncedAt)}.`;
}

function renderUpdateState(updateInput) {
  const update = updateInput && typeof updateInput === "object" ? updateInput : {};
  const currentVersion = String(update.currentVersion || stateEl.versionText.textContent || "1.0.0");
  const remoteVersion = String(update.remoteVersion || "").trim();
  const status = String(update.status || "idle");
  const progress = Number.isFinite(Number(update.downloadProgress)) ? Math.max(0, Math.min(100, Number(update.downloadProgress))) : 0;
  const detail = String(update.detail || "Updates have not been checked yet.");
  const canDownload = update.available === true && update.downloaded !== true && update.downloading !== true;
  const canInstall = update.downloaded === true;

  stateEl.updateCurrentVersion.textContent = currentVersion;
  stateEl.updateRemoteVersion.textContent = remoteVersion || "n/a";
  stateEl.updateStatusLabel.textContent = status;
  stateEl.updateProgressLabel.textContent = `${progress.toFixed(0)}%`;
  stateEl.updateDetailBox.textContent = detail;
  stateEl.checkForUpdates.disabled = update.checkInFlight === true || status === "checking";
  stateEl.downloadUpdate.disabled = !canDownload;
  stateEl.installUpdate.disabled = !canInstall;
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
  const googleSnapshot = uiState.seoSource?.snapshot;
  stateEl.seoWorkspaceHeadline.textContent = transient === true
    ? `Live internal SEO snapshot | score ${report.summary.seoScore} | critical ${report.summary.seoCriticalIssues || 0}${googleSnapshot ? ` | Google avg position ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}` : ""}`
    : `Internal SEO score ${report.summary.seoScore} | critical ${report.summary.seoCriticalIssues || 0} | pages ${report.summary.seoPagesAnalyzed || report.seo?.pagesAnalyzed || 0}${googleSnapshot ? ` | Google avg position ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}` : ""}`;
  stateEl.seoWorkspaceSummary.textContent = recommendations.length
    ? `The current run attached ${recommendations.length} internal SEO recommendation(s). ${googleSnapshot ? `External Google data is also loaded: avg position ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}, ${googleSnapshot.clicks} clicks, ${googleSnapshot.impressions} impressions.` : "Search Console is not connected. The internal SEO diagnostics and recommendations shown here are still valid."}`
    : googleSnapshot
    ? `No additional SEO recommendation was attached to this run. External Google data is loaded: avg position ${googleSnapshot.position > 0 ? googleSnapshot.position.toFixed(1) : "n/a"}, ${googleSnapshot.clicks} clicks, ${googleSnapshot.impressions} impressions and CTR ${formatPercent(googleSnapshot.ctr)}.`
    : "No additional internal SEO recommendation was attached to this run. The SEO audit still executed; this usually means the pass did not surface search-specific guidance beyond the score summary.";
}

function renderPromptWorkspace(report) {
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const autonomous = intelligenceSnapshot.autonomous;
  stateEl.promptWorkspaceFix.textContent = buildLearningAwareFixPrompt(report);
  stateEl.promptWorkspaceReplay.textContent = report?.meta?.replayCommand || report?.assistantGuide?.replayCommand || "Run an audit to generate a replay command.";
  stateEl.promptWorkspaceIssues.textContent = buildIssueDigest(report);
  stateEl.promptWorkspaceCompare.textContent = buildCompareDigest(report);
  stateEl.promptWorkspaceRoutes.textContent = buildRouteDigest(report);
  stateEl.promptWorkspaceActions.textContent = buildActionDigest(report);
  stateEl.promptWorkspaceClientPrompt.textContent = buildClientOutreachPrompt(report);
  stateEl.promptWorkspaceClientMessage.textContent = buildClientOutreachMessage(report);
  stateEl.autonomousQaSummary.textContent = report
    ? [
        `SitePulse Quality Score: ${autonomous.qualityScore.total}`,
        `Trajectory: ${autonomous.qualityTrajectory.direction} | confidence ${Number(autonomous.qualityTrajectory.confidence || 0).toFixed(2)}`,
        `Top risk: ${autonomous.insights.topRisks[0] || "No top risk attached."}`,
        `Recommended next action: ${autonomous.nextActions[0]?.actionLabel || "No next action generated."}`,
        `Top improvement: ${autonomous.insights.topImprovements[0] || "No improvement detected yet."}`,
        `Critical regression: ${autonomous.insights.criticalRegressions[0] || "No critical regression detected."}`,
        "",
        "Dimensions:",
        ...Object.entries(autonomous.qualityScore.dimensions || {}).map(([key, value]) => `${key}: ${value}`),
        "",
        "Recommended action order:",
        ...(autonomous.insights.recommendedActions.length ? autonomous.insights.recommendedActions : ["No recommended action order attached."]),
      ].join("\n")
    : "Run an audit to generate the autonomous QA brief.";
  stateEl.autonomousQaLoop.textContent = report
    ? [
        "Loop trace:",
        ...(autonomous.observability.loop.length
          ? autonomous.observability.loop.map((entry, index) => `${index + 1}. ${entry.stage} | ${entry.status} | ${entry.evidence}`)
          : ["No loop trace attached."]),
        "",
        "Playbook leads:",
        ...(autonomous.nextActions.length
          ? autonomous.nextActions.slice(0, 4).map((item, index) => `${index + 1}. ${item.issueCode} | ${item.playbookTitle} | ${item.actionLabel}`)
          : ["No playbook lead attached."]),
      ].join("\n")
    : "Run an audit to generate the autonomous QA loop trace.";
  renderSelfHealingPanel(report);
  stateEl.promptWorkspaceHeadline.textContent = report
    ? "Prompt pack loaded from the current report and operational memory. Copy technical, operational or client-facing material from one workspace."
    : "Run an audit to generate prompts and digests.";
}

function renderReportSummary(report, options = {}) {
  const preparedTargetUrl = getPreparedTargetUrl();
  const audit = uiState.companionState?.audit || {};

  if (!report) {
    stateEl.currentTarget.textContent = preparedTargetUrl || "none";
    stateEl.currentMode.textContent = uiState.mode === "mobile" && uiState.mobileSweep === "family" ? "mobile family" : uiState.mode;
    stateEl.currentScope.textContent = currentScopeLabel(uiState.scope);
    stateEl.currentDepth.textContent = currentDepthLabel();
    const liveDurationMs = audit.running === true && audit.startedAt
      ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime())
      : 0;
    stateEl.currentDuration.textContent = formatDuration(liveDurationMs);
    stateEl.currentCommand.textContent = audit.lastCommand || "Run an audit to generate a replay command.";
    stateEl.reportsHeadline.textContent = preparedTargetUrl
      ? `Prepared target ${preparedTargetUrl} | run an audit to generate a replayable evidence trail.`
      : "Each run leaves a replayable evidence trail.";
    syncOperatorShell(null);
    return;
  }

  const reportMode = normalizeMode(report.meta.auditMode || audit.mode || uiState.mode);
  const reportDepth = normalizeDepth(report.meta.auditDepth || audit.depth || uiState.depth);
  const reportBaseUrl = getReportBaseUrl(report) || report.meta.baseUrl;
  const reportAlignedWithPreparedTarget = isPreparedTargetAlignedWithReport(report);
  stateEl.currentTarget.textContent = preparedTargetUrl || reportBaseUrl;
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
    syncOperatorShell(report);
    return;
  }
  if (!reportAlignedWithPreparedTarget && preparedTargetUrl) {
    stateEl.reportsHeadline.textContent = `Prepared target ${preparedTargetUrl} | loaded snapshot belongs to ${reportBaseUrl} | last run ${formatLocalDate(report.meta.generatedAt)} | evidence ${evidenceCount}`;
    syncOperatorShell(report);
    return;
  }
  stateEl.reportsHeadline.textContent = `${uiState.history.length} stored snapshot${uiState.history.length === 1 ? "" : "s"} | last run ${formatLocalDate(report.meta.generatedAt)} | evidence ${evidenceCount}`;
  syncOperatorShell(report);
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

function getFilteredLearningMemoryEntries(memory) {
  const source = memory && Array.isArray(memory.entries) ? memory.entries : [];
  const filters = uiState.learningMemoryFilters;
  const filtered = source.filter((entry) => {
    const status = String(filters.status || "all");
    if (status === "validated" && Number(entry.learningCounts.validated || 0) <= 0) return false;
    if (status === "failed" && Number(entry.learningCounts.failed || 0) <= 0) return false;
    if (status === "partial" && Number(entry.learningCounts.partial || 0) <= 0) return false;
    if (status === "auto-promoted" && Number(entry.promotionCount || 0) <= 0) return false;
    if (status === "manual-override" && Number(entry.manualOverrideCount || 0) <= 0) return false;
    if (filters.issueCode && !String(entry.issueCode || "").toLowerCase().includes(filters.issueCode.toLowerCase())) return false;
    if (filters.category !== "all" && String(entry.category || "").toLowerCase() !== filters.category) return false;
    if (filters.severity !== "all" && String(entry.severity || "").toLowerCase() !== filters.severity) return false;
    if (filters.source && !String(entry.learningSource || "").toLowerCase().includes(filters.source.toLowerCase())) return false;
    return true;
  });

  const sortKey = String(filters.sort || "recent");
  filtered.sort((left, right) => {
    if (sortKey === "most-validated") {
      return Number(right.learningCounts.validated || 0) - Number(left.learningCounts.validated || 0)
        || String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
    }
    if (sortKey === "most-failed") {
      return Number(right.learningCounts.failed || 0) - Number(left.learningCounts.failed || 0)
        || String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
    }
    return String(right.lastSeenAt || "").localeCompare(String(left.lastSeenAt || ""));
  });
  return filtered;
}

function getVisibleLearningMemory(report) {
  return getOperationalMemorySnapshot(report);
}

function patchVisibleReportLearning(entry) {
  const reports = [uiState.report, uiState.liveReport].filter(Boolean);
  for (const report of reports) {
    const normalizedEntry = normalizeLearningMemory({ entries: [entry], summary: {} }).entries[0];
    if (Array.isArray(report.learningMemory?.entries)) {
      const existingIndex = report.learningMemory.entries.findIndex((item) => item.key === entry.key || (
        String(item.issueCode || "").toUpperCase() === String(entry.issueCode || "").toUpperCase()
        && String(item.route || "/") === String(entry.route || "/")
        && String(item.action || "") === String(entry.action || "")
      ));
      if (existingIndex >= 0) {
        report.learningMemory.entries[existingIndex] = normalizedEntry;
      } else {
        report.learningMemory.entries = [normalizedEntry, ...report.learningMemory.entries];
      }
    }
    if (Array.isArray(report.issues)) {
      report.issues = report.issues.map((issue) => {
        if (
          String(issue.code || "").toUpperCase() === String(entry.issueCode || "").toUpperCase()
          && String(issue.route || "/") === String(entry.route || "/")
          && String(issue.action || "") === String(entry.action || "")
        ) {
          return {
            ...issue,
            finalResolution: String(entry.finalResolution || issue.finalResolution || ""),
            possibleResolution: String(entry.possibleResolution || issue.possibleResolution || ""),
            learningSource: String(entry.learningSource || issue.learningSource || ""),
            finalResolutionOrigin: String(entry.finalResolutionOrigin || issue.finalResolutionOrigin || ""),
            resolutionConfidence: String(entry.resolutionConfidence || issue.resolutionConfidence || ""),
            promotionSource: String(entry.promotionSource || issue.promotionSource || ""),
            promotionCount: toNumber(entry.promotionCount, issue.promotionCount || 0),
            lastValidatedAt: String(entry.lastValidatedAt || issue.lastValidatedAt || ""),
            manualOverrideCount: toNumber(entry.manualOverrideCount, issue.manualOverrideCount || 0),
            lastManualOverrideAt: String(entry.lastManualOverrideAt || issue.lastManualOverrideAt || ""),
            lastManualOverrideBy: String(entry.lastManualOverrideBy || issue.lastManualOverrideBy || ""),
            lastManualOverrideNote: String(entry.lastManualOverrideNote || issue.lastManualOverrideNote || ""),
            learningCounts: {
              validated: toNumber(entry.learningCounts?.validated, issue.learningCounts?.validated || 0),
              failed: toNumber(entry.learningCounts?.failed, issue.learningCounts?.failed || 0),
              partial: toNumber(entry.learningCounts?.partial, issue.learningCounts?.partial || 0),
            },
          };
        }
        return issue;
      });
    }
  }
}

function patchVisibleReportSelfHealing(snapshotInput) {
  const snapshot = normalizeSelfHealingSnapshot(snapshotInput);
  const reports = [uiState.report, uiState.liveReport].filter(Boolean);
  for (const report of reports) {
    report.selfHealing = snapshot;
    if (Array.isArray(report.issues)) {
      report.issues = report.issues.map((issue, index) => {
        const issueKey = buildHealingIssueKey(issue);
        const strategy = snapshot.issues.find((entry) => entry.issueKey === issue.selfHealing?.issueKey || entry.issueKey === issueKey)
          || snapshot.issues.find((entry) =>
            String(entry.issueCode || "").toUpperCase() === String(issue.code || "").toUpperCase()
            && String(entry.route || "/") === String(issue.route || "/")
            && String(entry.action || "") === String(issue.action || ""));
        return {
          ...issue,
          selfHealing: strategy ? normalizeSelfHealingStrategy(strategy, index) : normalizeSelfHealingStrategy(issue.selfHealing, index),
        };
      });
    }
  }
}

async function refreshOperationalMemorySnapshot() {
  if (uiState.learningMemoryRefreshInFlight === true) return;
  if (!window.sitePulseCompanion || typeof window.sitePulseCompanion.getLearningMemory !== "function") return;
  uiState.learningMemoryRefreshInFlight = true;
  try {
    const result = await window.sitePulseCompanion.getLearningMemory();
    if (result?.ok && result.snapshot) {
      uiState.learningMemorySnapshot = normalizeLearningMemory(result.snapshot);
      renderLearningMemory(getVisibleReport());
      renderPromptWorkspace(getVisibleReport());
      await refreshSelfHealingSnapshot();
    }
  } finally {
    uiState.learningMemoryRefreshInFlight = false;
  }
}

async function refreshSelfHealingSnapshot() {
  if (uiState.selfHealingRefreshInFlight === true) return;
  if (!window.sitePulseCompanion || typeof window.sitePulseCompanion.getHealingSnapshot !== "function") return;
  const report = getVisibleReport();
  if (!report) return;
  uiState.selfHealingRefreshInFlight = true;
  try {
    const result = await window.sitePulseCompanion.getHealingSnapshot({
      report: createCompactStoredReport(report, { issueLimit: 180, actionLimit: 120, routeLimit: 80 }),
    });
    if (result?.ok && result.snapshot) {
      uiState.selfHealingSnapshot = normalizeSelfHealingSnapshot(result.snapshot);
      patchVisibleReportSelfHealing(uiState.selfHealingSnapshot);
      renderIssues(getVisibleReport());
      renderPrompt(getVisibleReport());
      renderPromptWorkspace(getVisibleReport());
      renderAssistantState();
    }
  } finally {
    uiState.selfHealingRefreshInFlight = false;
  }
}

function buildSelfHealingSummary(report) {
  const healing = getVisibleSelfHealing(report);
  if (!report || !healing || !Array.isArray(healing.issues) || healing.issues.length === 0) {
    return "No self-healing context is loaded yet. Run or load an audit first.";
  }

  const lines = [
    `Target: ${report.meta.baseUrl}`,
    `Eligible: ${healing.summary.eligible} | Assist only: ${healing.summary.assistOnly} | Manual only: ${healing.summary.manualOnly} | Unsafe: ${healing.summary.unsafe}`,
    `Prompt-ready: ${healing.summary.promptReady} | Orchestrated: ${healing.summary.orchestrated} | Pending attempts: ${healing.summary.pendingAttempts}`,
    "",
    "Top healing candidates:",
  ];

  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const operationalMaps = buildOperationalIssueMaps(report, intelligenceSnapshot);
  const topIssues = [...healing.issues]
    .sort((left, right) =>
      compareOperationalPriority(left, right, operationalMaps, (fallbackLeft, fallbackRight) =>
        severityRank(fallbackRight.severity) - severityRank(fallbackLeft.severity)
        || toNumber(fallbackRight.confidenceScore, 0) - toNumber(fallbackLeft.confidenceScore, 0)))
    .slice(0, 8);

  topIssues.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.issueCode} | ${item.route}${item.action ? ` | ${item.action}` : ""} | ${formatHealingEligibility(item.eligibility)} | ${formatHealingMode(item.healingMode)} | ${item.confidenceLabel || "n/a"}${item.resolutionLead ? ` | lead=${item.resolutionLead}` : ""}`,
    );
  });

  return lines.join("\n");
}

function renderSelfHealingPanel(report) {
  const healing = getVisibleSelfHealing(report);
  if (!report || !healing || !Array.isArray(healing.issues) || healing.issues.length === 0) {
    stateEl.selfHealingSummary.textContent = "Run an audit to see which issues are eligible for assisted correction.";
    stateEl.selfHealingList.innerHTML = '<article class="empty-state">No self-healing context is loaded yet.</article>';
    return;
  }

  stateEl.selfHealingSummary.textContent = buildSelfHealingSummary(report);
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const operationalMaps = buildOperationalIssueMaps(report, intelligenceSnapshot);
  const items = [...healing.issues]
    .sort((left, right) =>
      compareOperationalPriority(left, right, operationalMaps, (fallbackLeft, fallbackRight) =>
        severityRank(fallbackRight.severity) - severityRank(fallbackLeft.severity)
        || toNumber(fallbackRight.confidenceScore, 0) - toNumber(fallbackLeft.confidenceScore, 0)))
    .slice(0, 10);

  stateEl.selfHealingList.innerHTML = items
    .map((item) => {
      const canPrepare = ["eligible_for_healing", "assist_only"].includes(item.eligibility) && item.promptReady === true;
      const canRevalidate = item.lastAttempt?.outcome === "pending";
      return `
        <article class="history-item">
          <div class="issue-top">
            <div>
              <p class="issue-title">${escapeHtml(item.issueCode)}</p>
              <div class="history-meta">${escapeHtml(item.route)}${item.action ? ` | ${escapeHtml(item.action)}` : ""} | ${escapeHtml(item.strategyId || "healing-strategy")}</div>
            </div>
            <div class="issue-meta">
              <span class="severity-pill severity-${escapeHtml(item.severity)}">${escapeHtml(item.severity)}</span>
              <span class="pill">${escapeHtml(formatHealingEligibility(item.eligibility))}</span>
              <span class="pill">${escapeHtml(formatHealingMode(item.healingMode))}</span>
              <span class="pill ok">${escapeHtml(item.confidenceLabel || "n/a")}</span>
            </div>
          </div>
          ${item.strategyDescription ? `<p class="issue-checks"><strong>Strategy:</strong> ${escapeHtml(item.strategyDescription)}</p>` : ""}
          ${item.resolutionLead ? `<p class="issue-checks"><strong>Best known correction:</strong> ${escapeHtml(item.resolutionLead)}</p>` : ""}
          ${item.avoidText ? `<p class="issue-checks"><strong>Avoid this:</strong> ${escapeHtml(item.avoidText)}</p>` : ""}
          ${item.suggestedNextStep ? `<p class="issue-checks"><strong>Next step:</strong> ${escapeHtml(item.suggestedNextStep)}</p>` : ""}
          ${item.lastAttempt ? `<p class="issue-checks"><strong>Last attempt:</strong> ${escapeHtml(`${item.lastAttempt.outcome || item.lastAttempt.status}${item.lastAttempt.updatedAt ? ` | ${formatLocalDate(item.lastAttempt.updatedAt)}` : ""}`)}</p>` : ""}
          <div class="history-actions wrap">
            ${canPrepare ? `<button type="button" data-healing-action="prepare" data-healing-code="${escapeHtml(item.issueCode)}" data-healing-route="${escapeHtml(item.route)}" data-healing-action-name="${escapeHtml(item.action)}">Prepare healing</button>` : ""}
            ${item.promptReady && item.promptText ? `<button type="button" class="ghost" data-healing-action="copy-prompt" data-healing-code="${escapeHtml(item.issueCode)}">Copy healing prompt</button>` : ""}
            ${canRevalidate ? `<button type="button" class="ghost" data-healing-action="revalidate" data-healing-code="${escapeHtml(item.issueCode)}">Revalidate</button>` : ""}
            <button type="button" class="ghost" data-healing-action="open-memory" data-healing-code="${escapeHtml(item.issueCode)}">Open memory</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function findVisibleIssue(issueCode, route = "/", action = "") {
  const report = getVisibleReport();
  if (!report || !Array.isArray(report.issues)) return null;
  const normalizedCode = String(issueCode || "").trim().toUpperCase();
  const normalizedRoute = String(route || "/").trim();
  const normalizedAction = String(action || "").trim();
  const exact = report.issues.find((issue) =>
    String(issue.code || "").trim().toUpperCase() === normalizedCode
    && String(issue.route || "/").trim() === normalizedRoute
    && String(issue.action || "").trim() === normalizedAction);
  if (exact) return exact;
  return report.issues.find((issue) => String(issue.code || "").trim().toUpperCase() === normalizedCode) || null;
}

async function requestHealingPreparation(issueLike) {
  if (!window.sitePulseCompanion || typeof window.sitePulseCompanion.prepareHealingAttempt !== "function") {
    showToast("This runtime does not expose self-healing preparation yet.", "warn");
    return;
  }
  const report = getVisibleReport();
  const issue = issueLike && typeof issueLike === "object" ? issueLike : null;
  const healing = issue?.selfHealing && typeof issue.selfHealing === "object" ? issue.selfHealing : null;
  if (!report || !issue || !healing) {
    showToast("No self-healing context is loaded for the selected issue.", "warn");
    return;
  }
  if (!["eligible_for_healing", "assist_only"].includes(healing.eligibility)) {
    showToast(`This issue is marked as ${formatHealingEligibility(healing.eligibility)}. Review it manually instead of preparing healing.`, "warn");
    return;
  }
  const confirmed = window.confirm(
    `Prepare a ${formatHealingMode(healing.healingMode)} flow for ${issue.code}?\n\nEligibility: ${formatHealingEligibility(healing.eligibility)}\nConfidence: ${healing.confidenceLabel || "n/a"} (${healing.confidenceScore || 0}/100)\nStrategy: ${healing.strategyDescription || healing.strategyId || "n/a"}`,
  );
  if (!confirmed) {
    return;
  }
  const note = window.prompt("Optional operator note for this healing attempt. Leave blank if not needed.", "");
  const result = await window.sitePulseCompanion.prepareHealingAttempt({
    contextKey: String(report.selfHealing?.contextKey || "").trim(),
    runId: [
      String(report.meta.baseUrl || "").trim(),
      String(report.meta.generatedAt || "").trim(),
      String(report.summary.totalIssues || 0),
    ].join("|"),
    issueKey: String(healing.issueKey || buildHealingIssueKey(issue)).trim(),
    issueCode: String(issue.code || "").trim(),
    title: String(issue.group || issue.code || "Self-healing issue").trim(),
    route: String(issue.route || "/").trim(),
    action: String(issue.action || "").trim(),
    category: String(issue.group || "general").trim(),
    severity: String(issue.severity || "medium").trim(),
    baseUrl: String(report.meta.baseUrl || "").trim(),
    auditScope: String(report.summary.auditScope || uiState.scope || "full").trim(),
    viewportLabel: String(issue.viewportLabel || report.meta.viewportLabel || report.meta.viewport || "").trim(),
    eligibility: String(healing.eligibility || "blocked").trim(),
    healingMode: String(healing.healingMode || "suggest_only").trim(),
    confidenceScore: toNumber(healing.confidenceScore, 0),
    confidenceLevel: String(healing.confidenceLabel || "").trim(),
    confidenceReason: String(healing.confidenceReason || "").trim(),
    strategyId: String(healing.strategyId || "").trim(),
    strategySource: "self_healing_engine",
    strategySummary: String(healing.strategyDescription || healing.strategyId || "").trim(),
    suggestedNextStep: String(healing.suggestedNextStep || "").trim(),
    requiresConfirmation: healing.requiresConfirmation === true,
    promptReady: healing.promptReady === true,
    directActionAvailable: healing.directActionAvailable === true,
    recommendedResolution: String(issue.recommendedResolution || "").trim(),
    possibleResolution: String(issue.possibleResolution || "").trim(),
    finalResolution: String(issue.finalResolution || "").trim(),
    attemptedResolution: String(healing.resolutionLead || issue.finalResolution || issue.possibleResolution || issue.recommendedResolution || "").trim(),
    avoidText: String(healing.avoidText || "").trim(),
    promptText: String(healing.promptText || buildLearningAwareIssuePrompt(issue.code)).trim(),
    replayCommand: String(report.meta.replayCommand || report.assistantGuide?.replayCommand || "").trim(),
    baselineIssueKey: String(healing.issueKey || buildHealingIssueKey(issue)).trim(),
    baselineSeverity: String(issue.severity || "medium").trim(),
    baselineTotalIssues: toNumber(report.summary.totalIssues, 0),
    baselineIssueKeys: Array.isArray(report.issues) ? report.issues.map((entry) => buildHealingIssueFingerprint(entry)).filter(Boolean) : [],
    origin: "self_healing_engine",
    note: String(note || "").trim(),
    actor: "desktop-operator",
  });

  if (!result?.ok || !result.attempt) {
    appendLog(`[healing] preparation failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Could not prepare the self-healing flow.", "bad");
    return;
  }

  appendLog(`[healing] prepared ${result.attempt.healingMode} for ${result.attempt.issueCode}.`);
  showToast("Self-healing flow prepared. Apply the fix and rerun the audit to validate the outcome.", "ok");
  await refreshSelfHealingSnapshot();
  switchView("prompts");
  const languageKey = getAssistantLanguage();
  const localizedMode = getLocalizedAssistantModeMeta("operator", languageKey);
  uiState.assistantResult = {
    title: localizePromptLine(languageKey, {
      pt: `Self-healing preparado | ${issue.code}`,
      es: `Self-healing preparado | ${issue.code}`,
      en: `Self-healing prepared | ${issue.code}`,
      ca: `Self-healing preparat | ${issue.code}`,
    }),
    summary: localizePromptLine(languageKey, {
      pt: `Preparado ${formatHealingMode(result.attempt.healingMode)} com confianca ${result.attempt.confidenceLevel || "n/a"}.`,
      es: `Preparado ${formatHealingMode(result.attempt.healingMode)} con confianza ${result.attempt.confidenceLevel || "n/a"}.`,
      en: `Prepared ${formatHealingMode(result.attempt.healingMode)} with ${result.attempt.confidenceLevel || "n/a"} confidence.`,
      ca: `Preparat ${formatHealingMode(result.attempt.healingMode)} amb confianca ${result.attempt.confidenceLevel || "n/a"}.`,
    }),
    analysis: [
      localizeAssistantLine(`Eligibility: ${formatHealingEligibility(result.attempt.eligibility)}`, languageKey),
      localizeAssistantLine(`Strategy: ${result.attempt.strategySummary || result.attempt.strategyId || "n/a"}`, languageKey),
      localizePromptLine(languageKey, {
        pt: `Proximo passo: ${result.attempt.suggestedNextStep || "Aplicar a correcao e rerodar a auditoria."}`,
        es: `Siguiente paso: ${result.attempt.suggestedNextStep || "Aplicar la correccion y volver a ejecutar la auditoria."}`,
        en: `Next step: ${result.attempt.suggestedNextStep || "Apply the fix and rerun the audit."}`,
        ca: `Seguent pas: ${result.attempt.suggestedNextStep || "Aplicar la correccio i tornar a executar l'auditoria."}`,
      }),
    ],
    modeKey: "operator",
    modeName: localizedMode.name,
    modeDescription: localizedMode.description,
    intentId: "healing_prepare",
    promptText: String(result.attempt.promptText || "").trim(),
    actions: [
      result.attempt.promptText
        ? { id: "copy-text", label: localizePromptLine(languageKey, { pt: "Copiar healing prompt", es: "Copiar healing prompt", en: "Copy healing prompt", ca: "Copiar healing prompt" }), payload: { text: result.attempt.promptText, successMessage: "[studio] healing prompt copied." } }
        : null,
      { id: "revalidate-healing", label: localizePromptLine(languageKey, { pt: "Revalidar apos a correcao", es: "Revalidar despues de la correccion", en: "Revalidate after fix", ca: "Revalidar despres de la correccio" }), payload: { issueCode: issue.code } },
      { id: "open-memory", label: localizeAssistantActionLabel("Open learning memory", languageKey), payload: { issueCode: issue.code } },
    ].filter(Boolean),
  };
  renderAssistantState();
}

async function requestHealingRevalidation(issueLike) {
  const issue = issueLike && typeof issueLike === "object" ? issueLike : null;
  const report = getVisibleReport();
  if (!issue || !report) {
    showToast("No issue is loaded for revalidation.", "warn");
    return;
  }
  const confirmed = window.confirm(`Rerun the audit for ${report.meta.baseUrl} and let the Self-Healing Engine validate the latest attempt for ${issue.code}?`);
  if (!confirmed) {
    return;
  }
  stateEl.targetUrl.value = String(report.meta.baseUrl || stateEl.targetUrl.value || "").trim();
  appendLog(`[healing] revalidation requested for ${issue.code}.`);
  showToast("Revalidation requested. The next run will resolve pending healing attempts.", "ok");
  await handleAuditRun();
}

async function requestManualOverride(issueLike) {
  if (!window.sitePulseCompanion || typeof window.sitePulseCompanion.applyLearningManualOverride !== "function") {
    showToast("This runtime does not expose manual override yet.", "warn");
    return;
  }
  const subject = issueLike && typeof issueLike === "object" ? issueLike : {};
  const suggestedResolution = String(subject.finalResolution || subject.possibleResolution || subject.recommendedResolution || "").trim();
  const resolution = window.prompt(
    `Promote or override the final resolution for ${subject.code || subject.issueCode || "this issue"}. Edit the text before saving if needed.`,
    suggestedResolution,
  );
  if (!String(resolution || "").trim()) {
    return;
  }
  const confirmed = window.confirm(`Apply this final resolution to ${subject.code || subject.issueCode || "the selected issue"} and record it as a manual override?`);
  if (!confirmed) {
    return;
  }
  const note = window.prompt("Optional note for traceability. Leave blank if you do not need to add one.", "");
  const result = await window.sitePulseCompanion.applyLearningManualOverride({
    issueCode: String(subject.code || subject.issueCode || "").trim(),
    route: String(subject.route || "/").trim(),
    action: String(subject.action || "").trim(),
    title: String(subject.group || subject.title || subject.issueCode || subject.code || "Operational memory").trim(),
    category: String(subject.category || "").trim(),
    severity: String(subject.severity || "medium").trim(),
    possibleResolution: String(subject.possibleResolution || "").trim(),
    recommendedResolution: String(subject.recommendedResolution || "").trim(),
    finalResolution: String(resolution || "").trim(),
    note: String(note || "").trim(),
    type: "manual_override",
    actor: "desktop-operator",
    baseUrl: String(getVisibleReport()?.meta?.baseUrl || "").trim(),
    auditScope: String(getVisibleReport()?.summary?.auditScope || uiState.scope || "full").trim(),
    viewportLabel: String(getVisibleReport()?.meta?.viewportLabel || getVisibleReport()?.meta?.viewport || "").trim(),
    detail: String(subject.detail || "").trim(),
  });

  if (!result?.ok || !result.entry) {
    appendLog(`[memory] manual override failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Could not save the manual override.", "bad");
    return;
  }

  uiState.learningMemorySnapshot = normalizeLearningMemory(result.snapshot || {});
  patchVisibleReportLearning(result.entry);
  renderIssues(getVisibleReport());
  renderPrompt(getVisibleReport());
  renderPromptWorkspace(getVisibleReport());
  renderLearningMemory(getVisibleReport());
  await refreshSelfHealingSnapshot();
  appendLog(`[memory] manual override applied to ${result.entry.issueCode}.`);
  showToast("Manual override saved in operational memory.", "ok");
}

function renderLearningMemory(report) {
  const memory = getVisibleLearningMemory(report);
  if (!memory || !Array.isArray(memory.entries) || memory.entries.length === 0) {
    stateEl.learningMemorySummary.textContent = "Run the engine to build persistent operational memory from validated, failed and partial outcomes.";
    stateEl.learningMemoryList.innerHTML = '<article class="empty-state">No operational learnings loaded yet.</article>';
    return;
  }

  const entries = getFilteredLearningMemoryEntries(memory);
  stateEl.learningMemorySummary.textContent =
    `${memory.summary.entries} learned pattern(s) | ${memory.summary.validatedEntries} with validated history | ${memory.summary.failedEntries} with failed attempts | ${memory.summary.promotedEntries} auto-promoted resolution(s) | ${memory.summary.manualOverrideEntries || 0} manual override(s)` +
    (memory.updatedAt ? ` | updated ${formatLocalDate(memory.updatedAt)}` : "");

  if (!entries.length) {
    stateEl.learningMemoryList.innerHTML = '<article class="empty-state">No learned pattern matches the active filters.</article>';
    return;
  }

  stateEl.learningMemoryList.innerHTML = entries
    .map((entry) => `
      <article class="history-item">
        <div class="issue-top">
          <div>
            <p class="issue-title">${escapeHtml(entry.title)}</p>
            <div class="history-meta">${escapeHtml(entry.issueCode)} | ${escapeHtml(entry.route)}${entry.action ? ` | ${escapeHtml(entry.action)}` : ""}</div>
          </div>
          <div class="issue-meta">
            <span class="severity-pill severity-${escapeHtml(entry.severity)}">${escapeHtml(entry.severity)}</span>
            ${entry.resolutionConfidence ? `<span class="pill ok">${escapeHtml(entry.resolutionConfidence)}</span>` : ""}
            ${entry.finalResolutionOrigin ? `<span class="pill">${escapeHtml(entry.finalResolutionOrigin)}</span>` : ""}
            <span class="pill">${escapeHtml(`ok ${entry.learningCounts.validated}`)}</span>
            <span class="pill">${escapeHtml(`fail ${entry.learningCounts.failed}`)}</span>
            ${entry.learningCounts.partial ? `<span class="pill">${escapeHtml(`partial ${entry.learningCounts.partial}`)}</span>` : ""}
          </div>
        </div>
        ${entry.possibleResolution ? `<p class="issue-checks"><strong>Possible solution:</strong> ${escapeHtml(entry.possibleResolution)}</p>` : ""}
        ${entry.finalResolution ? `<p class="issue-checks"><strong>Final solution:</strong> ${escapeHtml(entry.finalResolution)}</p>` : ""}
        ${entry.latestValidatedFix ? `<p class="issue-checks"><strong>Validated pattern:</strong> ${escapeHtml(entry.latestValidatedFix)}</p>` : ""}
        ${entry.avoidText ? `<p class="issue-checks"><strong>Avoid this:</strong> ${escapeHtml(entry.avoidText)}</p>` : ""}
        ${entry.learningSource ? `<p class="issue-checks"><strong>Source:</strong> ${escapeHtml(entry.learningSource)}</p>` : ""}
        <div class="history-meta">
          ${entry.lastValidatedAt ? `last validated ${escapeHtml(formatLocalDate(entry.lastValidatedAt))}` : "not validated yet"}
          ${entry.promotionSource ? ` | promoted via ${escapeHtml(entry.promotionSource)} (${escapeHtml(String(entry.promotionCount))}x)` : ""}
          ${entry.manualOverrideCount ? ` | manual override ${escapeHtml(String(entry.manualOverrideCount))}x` : ""}
        </div>
        ${entry.lastManualOverrideNote ? `<p class="issue-checks"><strong>Override note:</strong> ${escapeHtml(entry.lastManualOverrideNote)}</p>` : ""}
        <div class="history-actions wrap">
          <button type="button" data-learning-action="open-memory" data-learning-code="${escapeHtml(entry.issueCode)}">Focus entry</button>
          <button type="button" data-learning-action="manual-override" data-learning-code="${escapeHtml(entry.issueCode)}" data-learning-route="${escapeHtml(entry.route)}" data-learning-entry="${escapeHtml(entry.key || entry.id)}">Promote solution</button>
        </div>
      </article>
    `)
    .join("");
}

function focusLearningMemoryIssue(issueCode) {
  if (!issueCode) return;
  uiState.learningMemoryFilters.issueCode = String(issueCode || "").trim();
  if (stateEl.learningMemoryIssueFilter) {
    stateEl.learningMemoryIssueFilter.value = uiState.learningMemoryFilters.issueCode;
  }
  switchView("settings");
  renderLearningMemory(getVisibleReport());
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
    { id: "refresh-google-seo", label: "Refresh Google SEO data", hint: "", description: "Pull real Search Console metrics for the configured property.", action: () => refreshSeoSource() },
    { id: "check-updates", label: "Check for Updates", hint: "", description: "Query the SitePulse release channel for a newer version.", action: () => checkForUpdates() },
    { id: "download-update", label: "Download Update", hint: "", description: "Download the newest available SitePulse release.", action: () => downloadUpdate() },
    { id: "install-update", label: "Install Update and Restart", hint: "", description: "Apply the downloaded release and restart the workstation.", action: () => installUpdate() },
    { id: "copy-compare", label: "Copy compare digest", hint: "", description: "Copy the current delta summary against baseline.", action: () => copyText(buildCompareDigest(getVisibleReport()), "[studio] comparison digest copied.") },
    { id: "copy-seo", label: "Copy SEO digest", hint: "", description: "Copy the current SEO summary and recommendation block.", action: () => copyText(buildSeoDigest(getVisibleReport()), "[studio] SEO digest copied.") },
    { id: "copy-prompt", label: "Copy fix prompt", hint: "", description: "Copy the current professional fix prompt.", action: () => copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied.") },
    { id: "copy-client-prompt", label: "Copy client outreach prompt", hint: "", description: "Copy the AI-ready commercial prompt based on the current audit.", action: () => copyText(buildClientOutreachPrompt(getVisibleReport()), "[studio] client outreach prompt copied.") },
    { id: "copy-client-message", label: "Copy client outreach message", hint: "", description: "Copy the ready-to-send client-facing pitch based on the current audit.", action: () => copyText(buildClientOutreachMessage(getVisibleReport()), "[studio] client outreach message copied.") },
    { id: "open-assistant", label: "Open operational assistant", hint: "Ctrl+J", description: "Ask the local assistant about runs, memory, prompts and next actions.", action: () => toggleAssistant(true) },
    { id: "switch-overview", label: "Go to overview", hint: "Ctrl+1", description: "Open setup, target profile and top-level mission control.", action: () => switchView("overview") },
    { id: "switch-preview", label: "Go to preview", hint: "Ctrl+9", description: "Open the embedded operator preview and follow the current route.", action: () => switchView("preview") },
    { id: "switch-operations", label: "Go to operations", hint: "Ctrl+2", description: "Open live progress, stage evidence and the engine log.", action: () => switchView("operations") },
    { id: "switch-findings", label: "Go to findings", hint: "Ctrl+3", description: "Open the issue board, visual quality and coverage panels.", action: () => switchView("findings") },
    { id: "switch-seo", label: "Go to SEO", hint: "Ctrl+4", description: "Open the dedicated SEO workspace.", action: () => switchView("seo") },
    { id: "switch-prompts", label: "Go to prompts", hint: "Ctrl+5", description: "Open prompt pack, replay and digest workspaces.", action: () => switchView("prompts") },
    { id: "switch-compare", label: "Go to compare", hint: "Ctrl+6", description: "Open baseline deltas, regressions and resolved work.", action: () => switchView("compare") },
    { id: "switch-reports", label: "Go to reports", hint: "Ctrl+7", description: "Open evidence, contact sheets and history.", action: () => switchView("reports") },
    { id: "switch-settings", label: "Go to settings", hint: "Ctrl+8", description: "Open engine controls and runtime settings.", action: () => switchView("settings") },
    { id: "open-memory", label: "Open validated learnings", hint: "", description: "Open the operational memory panel and inspect learned patterns.", action: () => switchView("settings") },
    { id: "open-healing", label: "Open self-healing queue", hint: "", description: "Open the assisted correction queue and review healing strategies.", action: () => switchView("prompts") },
    { id: "start-engine", label: "Start engine", hint: "", description: "Start the local bridge/runtime if it is offline.", action: () => startEngine() },
    { id: "ligar-motor", label: "Ligar motor", hint: "", description: "Inicia o bridge/engine local (sem abrir Settings).", action: () => startEngine() },
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
        <p class="command-item-description">${escapeHtml(item.description)}</p>
      </button>
    `)
    .join("");
}

function ensureAssistantService() {
  if (uiState.assistantService) return uiState.assistantService;
  if (typeof window.createSitePulseAssistantService !== "function") {
    return null;
  }

  /**
   * Build a lightweight ContextEngineInput from the current UI state and history.
   * This is intentionally defensive and only uses primitives already available in the renderer.
   */
  const buildAssistantContextSnapshot = () => {
    const report = getVisibleReport();
    const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
    const memory = intelligenceSnapshot.learningMemory;
    const healing = intelligenceSnapshot.selfHealing;
    const predictive = intelligenceSnapshot.predictive;
    const optimization = intelligenceSnapshot.optimization;
    const autonomous = intelligenceSnapshot.autonomous;
    const trendOverall = intelligenceSnapshot.intelligence?.trendSummary?.overall;

    const system = {
      issues: report && report.summary ? toNumber(report.summary.totalIssues, 0) : 0,
      memory: memory && memory.summary ? toNumber(memory.summary.entries, 0) : 0,
      healingReady: healing && healing.summary ? toNumber(healing.summary.eligible, 0) : 0,
      predictiveAlerts: predictive && predictive.summary ? toNumber(predictive.summary.highRiskAlerts, 0) : 0,
      optimizationSignals: Array.isArray(optimization?.topImprovements) ? optimization.topImprovements.length : 0,
      trajectory: trendOverall?.direction || autonomous?.qualityTrajectory?.direction || "unknown",
    };

    const runs = {
      history: Array.isArray(uiState.history) ? uiState.history : [],
      latestRunId: uiState.history && uiState.history[0] ? String(uiState.history[0].runId || uiState.history[0].id || "") : "",
    };

    const workspace = {
      workspace: uiState.activeView,
      focusIssueCode: uiState.activeEvidence?.issueCode || null,
      searchQuery: uiState.findingsSearch || "",
    };

    const issues = { report };

    return buildContextSnapshot({ workspace, system, runs, issues });
  };

  uiState.assistantService = window.createSitePulseAssistantService({
    getContext: () => {
      const report = getVisibleReport();
      const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
      const contextSnapshot = uiState.assistantContextSnapshot || buildAssistantContextSnapshot();
      const evidenceSnapshot = buildEvidenceResult({ logs: uiState.logs, report });
      const patternMemory = buildPatternMemory(uiState.history, { maxRuns: 20 });
      const learningSnapshot = buildLearningSnapshot(patternMemory.frequencyByCode, report, { maxIssues: 50 });
      const predictiveState = buildPredictiveState(patternMemory.runSnapshots, { maxPoints: 15 });
      const intentSnapshot = uiState.assistantIntentSnapshot;
      const investigationPlan = intentSnapshot
        ? buildInvestigationPlan(intentSnapshot, evidenceSnapshot)
        : { steps: [], summary: "", timestamps: { capturedAt: new Date().toISOString() } };
      const decisionPlan = intentSnapshot
        ? buildDecisionPlan(intentSnapshot, contextSnapshot, evidenceSnapshot, patternMemory)
        : { diagnosis: "", reasoning: "", steps: [] };
      uiState.assistantDecisionPlan = decisionPlan;
      return {
        activeView: uiState.activeView,
        report,
        learningMemory: intelligenceSnapshot.learningMemory,
        selfHealing: intelligenceSnapshot.selfHealing,
        intelligence: intelligenceSnapshot.intelligence,
        predictive: intelligenceSnapshot.predictive,
        autonomous: intelligenceSnapshot.autonomous,
        dataIntelligence: intelligenceSnapshot.dataIntelligence,
        optimization: intelligenceSnapshot.optimization,
        qualityControl: intelligenceSnapshot.qualityControl,
        assistantLanguage: getAssistantLanguageState(),
        logs: [...uiState.logs],
        intentSnapshot: uiState.assistantIntentSnapshot,
        contextSnapshot,
        evidenceSnapshot,
        patternMemory,
        learningSnapshot,
        predictiveState,
        investigationPlan,
        decisionPlan,
        rawQuery: uiState.assistantQuery,
        compareDigest: buildCompareDigest(report),
        runHistory: uiState.history.slice(0, 8).map((entry) => ({
          stamp: String(entry?.stamp || ""),
          baseUrl: String(entry?.baseUrl || entry?.meta?.baseUrl || ""),
          totalIssues: toNumber(entry?.summary?.totalIssues, 0),
          seoScore: toNumber(entry?.summary?.seoScore, 0),
        })),
        availableCommands: getCommandPaletteItems().map((item) => ({
          id: String(item.id || ""),
          label: String(item.label || ""),
          description: String(item.description || ""),
        })),
        workspaceHelp: WORKSPACE_HELP,
        buildIssuePrompt: (issueCode) => buildLearningAwareIssuePrompt(issueCode, getAssistantLanguage()),
      };
    },
  });
  return uiState.assistantService;
}

function renderAssistantState() {
  renderAssistantLanguageUi();
  renderAssistantWorkspaceLayout();
  renderConversationList();
  const report = getVisibleReport();
  const intelligenceSnapshot = buildDesktopIntelligenceSnapshot(report);
  const memory = intelligenceSnapshot.learningMemory;
  const healing = intelligenceSnapshot.selfHealing;
  const intelligence = intelligenceSnapshot.intelligence;
  const predictive = intelligenceSnapshot.predictive;
  const autonomous = intelligenceSnapshot.autonomous;
  const dataIntelligence = intelligenceSnapshot.dataIntelligence;
  const optimization = intelligenceSnapshot.optimization;
  const languageKey = getAssistantLanguage();
  const uiText = getAssistantUiText() || {
    contextDefault: "The assistant uses the current report, memory, logs and UI state.",
    modePillAuto: "Mode: auto",
    intentWaiting: "Intent: waiting",
    modeSummaryDefault: "The assistant auto-routes each request into the correct operational mode.",
    responseDefault: "Ask something operational. The assistant will answer from the loaded report, memory, logs and UI state.",
    actionsDefault: "Action suggestions will appear here when the assistant has enough context.",
    noDirectAction: "No direct action was suggested for this answer.",
  };
  if (stateEl.assistantContextSummary) stateEl.assistantContextSummary.textContent = report
    ? localizePromptLine(languageKey, {
        pt: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${dataIntelligence.QUALITY_STATE.seoScore || report.summary.seoScore} | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | ${dataIntelligence.QUALITY_STATE.trajectory || autonomous.qualityTrajectory.direction} | P0 ${report.summary.priorityP0 || 0} / P1 ${report.summary.priorityP1 || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegiveis | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunidades | trend ${intelligence.trendSummary.seo.symbol}/${intelligence.trendSummary.runtime.symbol}/${intelligence.trendSummary.ux.symbol} | view ${uiState.activeView}`,
        es: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${dataIntelligence.QUALITY_STATE.seoScore || report.summary.seoScore} | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | ${dataIntelligence.QUALITY_STATE.trajectory || autonomous.qualityTrajectory.direction} | P0 ${report.summary.priorityP0 || 0} / P1 ${report.summary.priorityP1 || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegibles | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunidades | trend ${intelligence.trendSummary.seo.symbol}/${intelligence.trendSummary.runtime.symbol}/${intelligence.trendSummary.ux.symbol} | view ${uiState.activeView}`,
        en: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${dataIntelligence.QUALITY_STATE.seoScore || report.summary.seoScore} | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | ${dataIntelligence.QUALITY_STATE.trajectory || autonomous.qualityTrajectory.direction} | P0 ${report.summary.priorityP0 || 0} / P1 ${report.summary.priorityP1 || 0} | memory ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} eligible | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} opportunities | trend ${intelligence.trendSummary.seo.symbol}/${intelligence.trendSummary.runtime.symbol}/${intelligence.trendSummary.ux.symbol} | view ${uiState.activeView}`,
        ca: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${dataIntelligence.QUALITY_STATE.seoScore || report.summary.seoScore} | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | ${dataIntelligence.QUALITY_STATE.trajectory || autonomous.qualityTrajectory.direction} | P0 ${report.summary.priorityP0 || 0} / P1 ${report.summary.priorityP1 || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegibles | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunitats | trend ${intelligence.trendSummary.seo.symbol}/${intelligence.trendSummary.runtime.symbol}/${intelligence.trendSummary.ux.symbol} | view ${uiState.activeView}`,
      })
    : localizePromptLine(languageKey, {
        pt: `Nenhuma auditoria carregada | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegiveis | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunidades | view ${uiState.activeView}`,
        es: `Ninguna auditoria cargada | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegibles | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunidades | view ${uiState.activeView}`,
        en: `No audit loaded yet | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | memory ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} eligible | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} opportunities | view ${uiState.activeView}`,
        ca: `Cap auditoria carregada | quality ${dataIntelligence.QUALITY_STATE.overallScore || autonomous.qualityScore.total || 0} | memoria ${memory?.summary?.entries || 0} pattern(s) | healing ${healing?.summary?.eligible || 0} elegibles | predictive ${dataIntelligence.RISK_STATE.highRiskAlertCount || predictive.summary.highRiskAlerts || 0} high risk | optimization ${optimization?.topImprovements?.length || 0} oportunitats | view ${uiState.activeView}`,
      });
  if (stateEl.assistantContextPills && !stateEl.assistantPillRun) {
    stateEl.assistantContextPills.innerHTML = buildAssistantContextPills(report, intelligenceSnapshot)
      .map((pill) => `<span class="assistant-context-chip">${escapeHtml(pill)}</span>`)
      .join("");
  }
  buildAssistantInsightsMarkup(report, intelligenceSnapshot);
  renderAssistantConsoleStrip(report, intelligenceSnapshot);
  renderAssistantMemoryHealingSummaries(report, intelligenceSnapshot);

  const result = uiState.assistantResult;
  if (!result) {
    if (stateEl.assistantModePill) stateEl.assistantModePill.textContent = uiText.modePillAuto;
    if (stateEl.assistantIntentPill) {
      const intent = uiState.assistantIntentSnapshot;
      if (!intent) {
        stateEl.assistantIntentPill.textContent = uiText.intentWaiting;
      } else {
        const pct = Math.round(intent.confidence * 100);
        stateEl.assistantIntentPill.textContent = localizePromptLine(languageKey, {
          pt: `Intencao: ${intent.intent} · ${pct}%`,
          es: `Intencion: ${intent.intent} · ${pct}%`,
          en: `Intent: ${intent.intent} · ${pct}%`,
          ca: `Intencio: ${intent.intent} · ${pct}%`,
        });
      }
    }
    if (stateEl.assistantApplyAction) stateEl.assistantApplyAction.classList.add("hidden");
    if (stateEl.assistantModeSummary) stateEl.assistantModeSummary.textContent = uiText.modeSummaryDefault;
    renderAssistantConversation();
    renderAssistantCards(null);
    return;
  }

  const localizedMode = getLocalizedAssistantModeMeta(result.modeKey, languageKey);
  if (stateEl.assistantModePill) stateEl.assistantModePill.textContent = localizePromptLine(languageKey, {
    pt: `Modo: ${localizedMode.name || result.modeName || "Operacional"}`,
    es: `Modo: ${localizedMode.name || result.modeName || "Operacional"}`,
    en: `Mode: ${localizedMode.name || result.modeName || "Operational"}`,
    ca: `Mode: ${localizedMode.name || result.modeName || "Operacional"}`,
  });
  if (stateEl.assistantIntentPill) {
    const intent = uiState.assistantIntentSnapshot;
    if (!intent) {
      stateEl.assistantIntentPill.textContent = localizePromptLine(languageKey, {
        pt: `Intencao: ${result.intentId || "desconhecida"}`,
        es: `Intencion: ${result.intentId || "desconocida"}`,
        en: `Intent: ${result.intentId || "unknown"}`,
        ca: `Intencio: ${result.intentId || "desconeguda"}`,
      });
    } else {
      const pct = Math.round(intent.confidence * 100);
      stateEl.assistantIntentPill.textContent = localizePromptLine(languageKey, {
        pt: `Intencao: ${intent.intent} · ${pct}%`,
        es: `Intencion: ${intent.intent} · ${pct}%`,
        en: `Intent: ${intent.intent} · ${pct}%`,
        ca: `Intencio: ${intent.intent} · ${pct}%`,
      });
    }
  }
  if (stateEl.assistantModeSummary) stateEl.assistantModeSummary.textContent = localizedMode.description
    || result.modeDescription
    || uiText.modeSummaryDefault;
  const plan = uiState.assistantDecisionPlan;
  const intentForApply = uiState.assistantIntentSnapshot;
  const canApply = intentForApply && intentForApply.confidence >= 0.7 && plan && plan.steps && plan.steps.length > 0;
  if (stateEl.assistantApplyAction) stateEl.assistantApplyAction.classList.toggle("hidden", !canApply);
  renderAssistantConversation();
  renderAssistantCards(result);
}

async function executeAssistantAction(action) {
  if (!action || typeof action !== "object") return;
  const payload = action.payload && typeof action.payload === "object" ? action.payload : {};
  const progressMsg = getAssistantProgressMessage(action.id);
  if (progressMsg) appendAssistantProgressMessage(progressMsg);

  if (action.id === "copy-text") {
    await copyText(String(payload.text || ""), payload.successMessage || "[studio] assistant output copied.");
    return;
  }
  if (action.id === "run-audit") {
    if (payload.baseUrl) {
      stateEl.targetUrl.value = payload.baseUrl;
      persistProfile();
      queuePreviewSync("assistant");
    }
    switchView("overview");
    await handleAuditRun();
    return;
  }
  if (action.id === "findings-search") {
    stateEl.findingsSearch.value = String(payload.query || "");
    uiState.findingsSearch = stateEl.findingsSearch.value.trim();
    switchView("findings");
    renderIssues(getVisibleReport());
    return;
  }
  if (action.id === "open-issue" || action.id === "open-findings") {
    openFindingsWithSearch(payload.issueCode || payload.query || "");
    return;
  }
  if (action.id === "open-memory") {
    if (payload.issueCode) {
      focusLearningMemoryIssue(payload.issueCode);
    } else {
      switchView("settings");
    }
    return;
  }
  if (action.id === "open-healing") {
    switchView("prompts");
    renderPromptWorkspace(getVisibleReport());
    return;
  }
  if (action.id === "switch-compare") {
    switchView("compare");
    return;
  }
  if (action.id === "generate-prompt") {
    const request = buildAssistantPromptRequest(payload.issueCode || "");
    stateEl.assistantInput.value = request;
    await runAssistantQuery(request);
    return;
  }
  if (action.id === "prepare-healing") {
    const issue = findVisibleIssue(payload.issueCode || "", payload.route || "/", payload.action || "");
    if (issue) {
      await requestHealingPreparation(issue);
    } else {
      showToast("The requested healing issue is not loaded right now.", "warn");
    }
    return;
  }
  if (action.id === "revalidate-healing") {
    const issue = findVisibleIssue(payload.issueCode || "", payload.route || "/", payload.action || "");
    if (issue) {
      await requestHealingRevalidation(issue);
    } else {
      showToast("The requested healing issue is not loaded right now.", "warn");
    }
    return;
  }
  if (action.id === "manual-override") {
    const issue = getVisibleReport()?.issues?.find((item) => String(item.code || "").toUpperCase() === String(payload.issueCode || "").toUpperCase());
    if (issue) {
      await requestManualOverride(issue);
    } else {
      showToast("The requested issue is not loaded right now.", "warn");
    }
    return;
  }

  const commandItem = getCommandPaletteItems().find((item) => item.id === action.id);
  if (commandItem) {
    await commandItem.action();
  }
}

async function runAssistantQuery(rawQuery) {
  const service = ensureAssistantService();
  if (!service) {
    showToast("Assistant service is not available.", "bad");
    return;
  }

  // Ensure assistant UI (mounted lazily by React) is ready before we render conversation/state.
  enableAssistantReactWorkspace();
  refreshStateElRefs();
  const assistantUiReady = await (async () => {
    const timeoutMs = 950;
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      refreshStateElRefs();
      if (stateEl.assistantResponse) return true;
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    refreshStateElRefs();
    return !!stateEl.assistantResponse;
  })();

  uiState.assistantQuery = String(rawQuery || "").trim();
  if (!uiState.assistantQuery) {
    if (assistantUiReady && stateEl.assistantContextSummary) renderAssistantState();
    return;
  }
  if (stateEl.assistantInput) stateEl.assistantInput.value = "";

  // Intent Engine: transform imperfect input into a structured intent snapshot.
  uiState.assistantIntentSnapshot = inferIntent(uiState.assistantQuery);
  // Context Engine: capture a fresh snapshot of the operational state for this query.
  uiState.assistantContextSnapshot = null; // lazy-built on first getContext() call

  const adaptiveLanguage = ensureAdaptiveLanguageService();
  if (adaptiveLanguage && uiState.assistantQuery) {
    uiState.assistantLanguageState = adaptiveLanguage.recordTextSignal(uiState.assistantQuery);
  }
  appendAssistantConversationEntry(createAssistantUserEntry(uiState.assistantQuery));
  appendAssistantConversationEntry(createAssistantThinkingEntry());
  if (assistantUiReady) {
    renderAssistantConversation();
    startThinkingRotation();
    const scrollContainer = stateEl.assistantChatScroll || stateEl.assistantResponse;
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }

  const thinkingMinMs = 520;
  const thinkingStart = Date.now();
  await new Promise((resolve) => setTimeout(resolve, thinkingMinMs));

  uiState.assistantResult = service.respond(uiState.assistantQuery);
  removeAssistantThinkingEntry();
  const resultEntry = createAssistantResultEntry(uiState.assistantResult);
  appendAssistantConversationEntry(resultEntry);
  persistAssistantConversation();
  if (assistantUiReady && stateEl.assistantContextSummary) renderAssistantState();
  const elapsed = Date.now() - thinkingStart;
  if (elapsed < thinkingMinMs + 80) {
    await new Promise((resolve) => setTimeout(resolve, thinkingMinMs + 100 - elapsed));
  }
  if (assistantUiReady) revealAssistantResponseStreaming(resultEntry);

  const stepResult = executeAssistantSuggestedStep();
  if (stepResult.executed) {
    showToast("Action applied.", "ok");
    if (assistantUiReady && stateEl.assistantContextSummary) renderAssistantState();
  } else if (stepResult.reason) {
    showToast(stepResult.reason, "warn");
  }
}

function getAssistantStepRunner() {
  return {
    openFindings: (payload) => openFindingsWithSearch((payload && payload.issueCode) || (payload && payload.query) || ""),
    runAudit: (payload) => handleAuditRun((payload && payload.depth === "deep") ? "deep" : null),
    doNext: () => executeDoNext(),
    showLogs: () => switchView("operations"),
    openEvidence: () => { switchView("reports"); openLatestEvidence(); },
    loadReport: (payload) => {
      const runId = payload && payload.runId ? String(payload.runId) : "";
      const snapshot = (uiState.history || []).find((h) => (h.runId || h.id) === runId);
      if (snapshot && snapshot.report) {
        renderAllReportState(snapshot.report);
        switchView("reports");
      }
    },
    generateFixPrompt: (payload) => {
      const issueCode = payload && payload.issueCode ? String(payload.issueCode) : "";
      if (issueCode) {
        const request = buildAssistantPromptRequest(issueCode);
        if (stateEl.assistantInput) stateEl.assistantInput.value = request;
        toggleAssistant(true);
      }
    },
    showScreenshot: () => { switchView("reports"); openLatestEvidence(); },
    switchView: (view) => switchView(view),
  };
}

/**
 * Execute the first suggested assistant step (if allowed by autonomy and supervisor).
 * @returns {{ executed: boolean, reason?: string }}
 */
function executeAssistantSuggestedStep() {
  const plan = uiState.assistantDecisionPlan;
  const intent = uiState.assistantIntentSnapshot;
  if (!intent || intent.confidence < 0.7 || !plan || !plan.steps || plan.steps.length === 0) {
    return { executed: false, reason: "No suggested action or confidence too low." };
  }
  const step = plan.steps[0];
  const governance = checkAutonomy(step, "assisted");
  if (governance.verdict !== "allowed") {
    return { executed: false, reason: governance.reason || "Action requires confirmation or is not allowed." };
  }
  const supervisorResult = canExecute(step, {
    lastExecutedStepIntent: uiState.lastExecutedStepIntent || undefined,
    lastAuditRunAt: uiState.lastAuditRunAt || 0,
  });
  if (!supervisorResult.allowed) {
    return { executed: false, reason: supervisorResult.reason || "Execution blocked by supervisor." };
  }
  const runner = getAssistantStepRunner();
  executeActionStep(step, runner);
  uiState.lastExecutedStepIntent = step.intent;
  if (step.intent === "audit_run") uiState.lastAuditRunAt = Date.now();
  return { executed: true };
}

function revealAssistantResponseStreaming(resultEntry) {
  if (!resultEntry || !stateEl.assistantResponse) return;
  const lead = String(resultEntry.lead || "").trim();
  const planLines = Array.isArray(resultEntry.plan) ? resultEntry.plan.map((s) => String(s.label || "").trim()) : [];
  const bodyLines = Array.isArray(resultEntry.body) ? resultEntry.body.map((s) => String(s || "").trim()) : [];
  const followUp = String(resultEntry.followUp || "").trim();
  const lastBubble = stateEl.assistantResponse.querySelector(".assistant-message-assistant:last-child .assistant-message-bubble");
  if (!lastBubble) return;
  const strongEl = lastBubble.querySelector("strong");
  const planOl = lastBubble.querySelector("ol.assistant-message-plan");
  const bodyDiv = lastBubble.querySelector(".assistant-message-body");
  const followUpDiv = lastBubble.querySelector(".assistant-message-followup");
  const liEls = planOl ? Array.from(planOl.querySelectorAll("li")) : [];
  const pEls = bodyDiv ? Array.from(bodyDiv.querySelectorAll("p")) : [];
  const segments = [];
  const targets = [];
  if (lead.length > 0 && strongEl) { segments.push(lead); targets.push(strongEl); }
  planLines.forEach((line, i) => { if (liEls[i]) { segments.push(line); targets.push(liEls[i]); } });
  bodyLines.forEach((line, i) => { if (pEls[i]) { segments.push(line); targets.push(pEls[i]); } });
  if (followUp.length > 0 && followUpDiv) { segments.push(followUp); targets.push(followUpDiv); }
  if (!segments.length || segments.length !== targets.length) return;
  targets.forEach((el) => { el.textContent = ""; });
  let segmentIndex = 0;
  let charIndex = 0;
  const chunkSize = 4;
  const interval = 22;
  const streamId = `stream-${Date.now()}`;
  uiState.assistantStreamId = streamId;
  function tick() {
    if (uiState.assistantStreamId !== streamId) return;
    if (segmentIndex >= segments.length) {
      targets.forEach((el) => el.classList.remove("assistant-streaming"));
      return;
    }
    const segment = segments[segmentIndex];
    const target = targets[segmentIndex];
    if (charIndex < segment.length) {
      const next = Math.min(charIndex + chunkSize, segment.length);
      target.textContent += segment.slice(charIndex, next);
      charIndex = next;
      target.classList.add("assistant-streaming");
    } else {
      target.classList.remove("assistant-streaming");
      segmentIndex += 1;
      charIndex = 0;
    }
    const scrollContainer = stateEl.assistantChatScroll || stateEl.assistantResponse;
    if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    setTimeout(tick, interval);
  }
  setTimeout(tick, 60);
}

async function executeCommandPaletteAction(commandId) {
  const item = getCommandPaletteItems().find((entry) => entry.id === commandId);
  if (!item) return;
  toggleCommandPalette(false);
  await item.action();
}

function pushHistory(report) {
  const snapshot = createReportSnapshot(createCompactStoredReport(report, { issueLimit: 40, actionLimit: 30, routeLimit: 20 }));
  uiState.history = pruneHistoryEntries([snapshot, ...uiState.history]);
  persistHistory();
  renderHistory();
}

function renderAuditState(audit = {}) {
  const status = String(audit.status || "idle");
  const pending = uiState.auditRequestInFlight === true && audit.running !== true;
  const busy = audit.running === true || pending;

  stateEl.auditStatus.textContent = auditStatusLabel(status);
  stateEl.runAudit.disabled = busy;
  if (stateEl.runAuditOverview) {
    stateEl.runAuditOverview.disabled = busy;
    stateEl.runAuditOverview.textContent = busy ? (audit.running === true ? "Running…" : "Starting…") : "Run";
  }
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

  if (status === "paused") {
    setChip(stateEl.auditChip, "audit paused", "warn");
    stateEl.headlineStatus.textContent = "The run paused safely and kept its checkpoint. Resume it to continue without losing the collected evidence.";
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
  const sweepProfileIndex = toNumber(progress.sweepProfileIndex, 0);
  const sweepProfileTotal = toNumber(progress.sweepProfileTotal, 0);
  const sweepProfileLabel = String(progress.sweepProfileLabel || "").trim();
  const sweepProfilePercentage = Math.max(0, Math.min(100, toNumber(progress.sweepProfilePercentage, 0)));
  const sweepProfileStartedAtMs = toNumber(progress.sweepProfileStartedAtMs, 0);

  let counters = "Waiting for the next run.";
  if (audit.running) {
    const profilePrefix = sweepProfileTotal > 1 ? `Profile ${Math.max(sweepProfileIndex, 1)}/${sweepProfileTotal}${sweepProfileLabel ? ` · ${sweepProfileLabel}` : ""}` : "";
    if (totalRoutes > 0 && totalLabels > 0) {
      counters = `Route ${Math.max(routeIndex, 1)}/${totalRoutes} · action ${Math.max(labelIndex, 1)}/${totalLabels}`;
    } else if (totalRoutes > 0) {
      counters = `Route ${Math.max(routeIndex, 1)}/${totalRoutes}`;
    } else {
      counters = "Preparing the run map...";
    }
    if (profilePrefix) {
      counters = `${profilePrefix} · ${counters}`;
    }
  } else if (audit.status === "clean" || audit.status === "issues") {
    counters = "Run finished.";
  } else if (audit.status === "failed") {
    counters = "Run stopped with failure.";
  }

  const elapsedMs = audit.startedAt ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime()) : 0;
  let etaText = "ETA calibrating";
  let paceText = "Pace standby";
  if (audit.running) {
    const { totalEstimateMs } = buildAuditEstimateContext(audit, percentage, elapsedMs);
    paceText = classifyRunPace(elapsedMs, totalEstimateMs);
    if (sweepProfileTotal > 1) {
      const profileElapsedMs = sweepProfileStartedAtMs > 0 ? Math.max(0, Date.now() - sweepProfileStartedAtMs) : 0;
      const profileHistoryEstimateMs = totalEstimateMs > 0 ? Math.round(totalEstimateMs / sweepProfileTotal) : 0;
      const profileProgressEstimateMs = sweepProfilePercentage >= 10 && profileElapsedMs > 0
        ? Math.round(profileElapsedMs / Math.max(sweepProfilePercentage / 100, 0.1))
        : 0;
      const profileEstimateMs = median([profileHistoryEstimateMs, profileProgressEstimateMs].filter((value) => value > 0));
      const familyRemainingMs = totalEstimateMs > 0 ? Math.max(0, totalEstimateMs - elapsedMs) : 0;
      const profileRemainingMs = profileEstimateMs > 0 ? Math.max(0, profileEstimateMs - profileElapsedMs) : 0;
      const profileName = sweepProfileLabel || `Profile ${Math.max(sweepProfileIndex, 1)}`;
      etaText = [
        profileEstimateMs > 0
          ? `${profileName} ETA ${profileRemainingMs > 0 ? formatDuration(profileRemainingMs) : "ending soon"}`
          : (profileElapsedMs > 0 ? `${profileName} elapsed ${formatDuration(profileElapsedMs)}` : ""),
        totalEstimateMs > 0
          ? `Family ETA ${familyRemainingMs > 0 ? formatDuration(familyRemainingMs) : "ending soon"}`
          : (elapsedMs > 0 ? `Family elapsed ${formatDuration(elapsedMs)}` : ""),
      ].filter(Boolean).join(" · ") || "ETA calibrating";
    } else if (totalEstimateMs > 0) {
      const remainingMs = Math.max(0, totalEstimateMs - elapsedMs);
      etaText = remainingMs > 0 ? `ETA ${formatDuration(remainingMs)}` : "Ending soon";
    } else if (elapsedMs > 0) {
      etaText = `Elapsed ${formatDuration(elapsedMs)}`;
    }
  } else if (audit.status === "clean" || audit.status === "issues") {
    etaText = "Completed";
    paceText = "Pace complete";
  } else if (audit.status === "paused") {
    etaText = "Paused";
    paceText = "Checkpoint saved";
  } else if (audit.status === "failed") {
    etaText = "Interrupted";
    paceText = "Pace interrupted";
  }

  stateEl.auditProgressLabel.textContent = phaseLabel;
  stateEl.auditProgressPercent.textContent = `${percentage}%`;
  stateEl.auditProgressCounters.textContent = counters;
  stateEl.auditProgressElapsed.textContent = `Elapsed ${formatDuration(elapsedMs)}`;
  stateEl.auditProgressEta.textContent = etaText;
  stateEl.auditProgressPace.textContent = paceText;
  stateEl.auditProgressDetail.textContent = detail;
  stateEl.auditProgressFill.style.width = `${percentage}%`;
}

function closeLongRunAdvisor() {
  uiState.longRunAdvisor.open = false;
  stateEl.longRunOverlay.classList.add("hidden");
}

function computeLongRunThresholdMs(audit = {}) {
  const historyEstimateMs = estimateRunDurationMs({
    baseUrl: audit.baseUrl,
    mode: audit.mode,
    scope: audit.scope,
    depth: audit.depth,
  });
  const minimumMs = audit.mode === "mobile" && normalizeMobileSweep(uiState.mobileSweep) === "family"
    ? 180000
    : audit.depth === "deep"
      ? 150000
      : 90000;
  return Math.max(minimumMs, historyEstimateMs > 0 ? Math.round(historyEstimateMs * 1.35) : 0);
}

function updateLongRunAdvisor(audit = {}) {
  const running = audit.running === true;
  const runKey = getAuditRunKey(audit);
  if (!running || !runKey) {
    uiState.longRunAdvisor.activeRunKey = "";
    closeLongRunAdvisor();
    return;
  }

  const elapsedMs = audit.startedAt ? Math.max(0, Date.now() - new Date(audit.startedAt).getTime()) : 0;
  const thresholdMs = computeLongRunThresholdMs(audit);
  const shouldPrompt = elapsedMs >= thresholdMs && uiState.longRunAdvisor.shownForRunKey !== runKey;
  const expectedText = thresholdMs > 0 ? formatDurationWindow(thresholdMs) : "calibrating";
  const fastProfile = buildFastModeProfile(audit);
  const resumable = canResumeCurrentRunInFastMode(audit);

  if (shouldPrompt) {
    uiState.longRunAdvisor.shownForRunKey = runKey;
    uiState.longRunAdvisor.activeRunKey = runKey;
    uiState.longRunAdvisor.open = true;
    stateEl.longRunSummary.textContent = resumable
      ? "SitePulse detected that this run is taking longer than expected. You can pause safely now and resume from the checkpoint in a faster profile without losing the evidence already collected."
      : "SitePulse detected that this run is taking longer than expected. Fast mode will be armed for the next run because this flow cannot switch in place safely.";
    stateEl.longRunOverlay.classList.remove("hidden");
  }

  if (!uiState.longRunAdvisor.open || uiState.longRunAdvisor.activeRunKey !== runKey) {
    return;
  }

  stateEl.longRunElapsed.textContent = formatDuration(elapsedMs);
  stateEl.longRunExpected.textContent = expectedText;
  stateEl.longRunPlan.textContent = describeFastModePlan(fastProfile) || "switch to signal sweep";
  stateEl.applyFastMode.textContent = resumable ? "Switch now and resume" : "Arm fast mode";
}

function refreshRuntimeTicker() {
  const audit = uiState.companionState?.audit || {};
  syncSlowTimeline(audit);
  renderAuditProgress(audit);
  renderReportSummary(getVisibleReport(), { transient: !!uiState.liveReport });
  updateLongRunAdvisor(audit);
  renderExecutionState(audit);
}

function syncRuntimeTicker() {
  const running = uiState.companionState?.audit?.running === true;
  if (running && uiState.runtimeTickerId === 0) {
    uiState.runtimeTickerId = window.setInterval(() => {
      refreshRuntimeTicker();
    }, 1000);
    refreshRuntimeTicker();
    return;
  }
  if (!running && uiState.runtimeTickerId !== 0) {
    window.clearInterval(uiState.runtimeTickerId);
    uiState.runtimeTickerId = 0;
    refreshRuntimeTicker();
  }
}

function renderExecutionState(audit = {}) {
  const timeline = Array.isArray(audit.timeline) ? audit.timeline : [];
  const mergedTimeline = [...(uiState.slowWatch.events || []), ...timeline]
    .sort((left, right) => new Date(right.at || 0).getTime() - new Date(left.at || 0).getTime());
  const stageBoard = Array.isArray(audit.stageBoard) ? audit.stageBoard : [];
  const busy = audit.running === true;

  stateEl.timelineHeadline.textContent = busy
    ? (uiState.slowWatch.events.length
        ? "The engine is moving through phases. Slow route/action markers are added when execution drifts beyond its expected window."
        : "The engine is moving through phases and updating evidence as each step finishes.")
    : mergedTimeline.length
      ? "Latest execution trail from the most recent run."
      : "The workstation will register each engine phase as evidence appears.";

  if (!mergedTimeline.length) {
    stateEl.timelineList.innerHTML = '<article class="empty-state">Run an audit to populate the execution timeline.</article>';
  } else {
    stateEl.timelineList.innerHTML = mergedTimeline
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
    uiState.selfHealingSnapshot = report?.selfHealing?.issues?.length ? report.selfHealing : null;
  }

  renderMetrics(report);
  renderSystemStateStrip(report);
  renderNextActionBlock(report);
  renderMobileCoveragePanel(report);
  renderSignals(report);
  renderVisualQuality(report);
  renderSteps(report);
  renderExecutiveSummary(report);
  renderQualityVisuals(report);
  renderRunHistoryTable();
  renderOptimizationSummary(report);
  renderQualityControlSummary(report);
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
  renderLearningMemory(report);
  renderMissionBrief();
  renderAssistantState();
}

function clearLiveReportState() {
  if (!uiState.liveReport) return;
  uiState.liveReport = null;
  uiState.liveReportKey = "";
  const fallbackReport = getVisibleReport();
  renderMetrics(fallbackReport);
  renderSystemStateStrip(fallbackReport);
  renderNextActionBlock(fallbackReport);
  renderMobileCoveragePanel(fallbackReport);
  renderSignals(fallbackReport);
  renderVisualQuality(fallbackReport);
  renderSteps(fallbackReport);
  renderRunHistoryTable();
  renderRouteFilterOptions(fallbackReport);
  renderIssues(fallbackReport);
  renderCoverageExplorers(fallbackReport);
  renderPrompt(fallbackReport);
  renderSeoWorkspace(fallbackReport);
  renderPromptWorkspace(fallbackReport);
  renderEvidenceGallery(fallbackReport);
  renderRouteContactSheet(fallbackReport);
  renderExecutiveSummary(fallbackReport);
  renderQualityVisuals(fallbackReport);
  renderReportSummary(fallbackReport);
  renderComparison(fallbackReport);
  renderLearningMemory(fallbackReport);
  renderMissionBrief();
  renderAssistantState();
}

function renderCompanionState(payload) {
  uiState.companionState = payload;
  document.title = payload?.packaged === false ? "SitePulse Studio (Dev)" : "SitePulse Studio";
  stateEl.serviceName.textContent = payload?.serviceName || "SitePulse Studio";
  stateEl.versionText.textContent = payload?.version || "1.0.0";
  stateEl.runtimePath.textContent = shortPath(payload?.qaRuntimeDir);
  stateEl.reportsPath.textContent = shortPath(payload?.reportsDir);
  stateEl.bridgeAddress.textContent = payload?.bridge ? `http://${payload.bridge.host}:${payload.bridge.port}` : "loading...";
  stateEl.launchOnLogin.checked = payload?.launchOnLogin === true;

  const bridgeRunning = payload?.bridge?.running === true;
  stateEl.bridgeStatus.textContent = bridgeRunning ? `${payload.bridge.host}:${payload.bridge.port}` : "offline";
  setChip(stateEl.bridgeChip, bridgeRunning ? "engine online" : "engine offline", bridgeRunning ? "ok" : "bad");
  if (stateEl.engineOfflineBanner) stateEl.engineOfflineBanner.classList.toggle("hidden", bridgeRunning);
  setChip(stateEl.buildChip, `studio ${payload?.version || "1.0.0"}`, "ok");
  renderGoogleSeoSource(payload?.seoSource || {});
  renderUpdateState(payload?.update || null);
  syncRuntimeTicker();
  syncSlowTimeline(payload?.audit || {});

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
  renderAssistantState();
}

function renderAllReportState(report) {
  renderWorkspaceReport(report, { transient: false });
  renderEngineSummaryStrip(report || getVisibleReport());
  void refreshOperationalMemorySnapshot();
  void refreshSelfHealingSnapshot();
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

async function saveSeoSource() {
  const payload = {
    property: stateEl.seoPropertyInput.value,
    accessToken: stateEl.seoAccessTokenInput.value,
    lookbackDays: stateEl.seoLookbackDaysInput.value,
  };
  const result = await window.sitePulseCompanion.saveSeoSource(payload);
  if (!result?.ok) {
    showToast("The SEO source could not be saved.", "bad");
    return;
  }
  renderGoogleSeoSource(result.source || {});
  appendLog("[seo] source settings saved.");
  showToast("SEO source saved locally.", "ok");
}

async function refreshSeoSource() {
  const payload = {
    baseUrl: stateEl.targetUrl.value,
    property: stateEl.seoPropertyInput.value,
    accessToken: stateEl.seoAccessTokenInput.value,
    lookbackDays: stateEl.seoLookbackDaysInput.value,
  };
  stateEl.seoExternalHeadline.textContent = "Refreshing Google data...";
  const result = await window.sitePulseCompanion.refreshSeoSource(payload);
  renderGoogleSeoSource(result?.source || {});
  if (!result?.ok) {
    showToast("Google data refresh failed. Review the SEO panel for the exact reason.", "bad");
    return;
  }
  appendLog("[seo] real Google data refreshed.");
  showToast("Real Google data loaded into the SEO workspace.", "ok");
}

async function checkForUpdates() {
  const result = await window.sitePulseCompanion.checkForUpdates();
  if (!result?.ok) {
    appendLog(`[update] check failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Update check failed.", "bad");
    return;
  }

  renderUpdateState(result.state || uiState.companionState?.update || null);
  if (result.available === true) {
    appendLog(`[update] new version available: ${result.manifest?.version || result.state?.remoteVersion || "unknown"}`);
    showToast("New version available.", "warn");
    return;
  }

  appendLog("[update] application is up to date.");
  showToast("Application is up to date.", "ok");
}

async function downloadUpdate() {
  const result = await window.sitePulseCompanion.downloadUpdate();
  if (!result?.ok) {
    appendLog(`[update] download failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Update download failed.", "bad");
    return;
  }

  renderUpdateState(result.state || uiState.companionState?.update || null);
  appendLog("[update] download started.");
  showToast("Update download started.", "ok");
}

async function installUpdate() {
  const result = await window.sitePulseCompanion.installUpdate();
  if (!result?.ok) {
    appendLog(`[update] install failed: ${result?.detail || result?.error || "unknown"}`);
    showToast("Update install could not start.", "bad");
    return;
  }

  renderUpdateState(result.state || uiState.companionState?.update || null);
  appendLog("[update] installing downloaded update.");
  showToast("Installing update and restarting SitePulse Studio.", "warn");
}

async function handleAuditRun(forceDepth = null) {
  appendLog("[studio] Run audit button triggered.");
  if (!ensureCompanion()) return;
  if (uiState.companionState?.bridge?.running !== true) {
    showToast(
      "Engine offline. Start the bridge: Tools → Start engine, command palette “Ligar motor”, or the IA panel “Ligar motor” — then try again.",
      "bad",
    );
    return;
  }
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
    if (payload?.paused === true && payload?.report) {
      const report = normalizeReport(payload.report);
      report.meta.auditMode = input.mode;
      report.meta.auditDepth = input.fullAudit ? "deep" : "signal";
      persistLastReport(report);
      renderAllReportState(report);
      appendLog("[studio] audit paused safely. checkpoint preserved.");
      stateEl.headlineStatus.textContent = "Run paused safely. Resume from the checkpoint to continue without losing progress.";
      showToast("Audit paused safely and kept its checkpoint.", "warn");
      switchView("operations");
      return;
    }
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
  } catch (err) {
    const msg = err?.message || String(err);
    appendLog(`[studio] audit run error: ${msg}`);
    stateEl.headlineStatus.textContent = msg;
    showToast(msg.length > 60 ? "Audit failed. See status bar and log." : msg, "bad");
  } finally {
    uiState.auditRequestInFlight = false;
    renderAuditState(uiState.companionState?.audit || {});
  }
}

async function openCmdWindow() {
  if (!ensureCompanion()) return;
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
  if (!ensureCompanion()) return;
  const result = await window.sitePulseCompanion.openReports();
  appendLog(result.ok ? "[studio] report vault opened." : `[studio] could not open report vault: ${result.error || "unknown"}`);
  showToast(result.ok ? "Report vault opened." : "Could not open the report vault.", result.ok ? "ok" : "bad");
}

async function copyBridgeUrl() {
  if (!ensureCompanion()) return;
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
  appendLog("[studio] Load report button triggered.");
  if (!ensureCompanion()) return;
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
  if (!ensureCompanion()) return;
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
  if (!ensureCompanion()) return;
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
  renderBaselineIndicator();
  renderHistory();
  renderComparison(getVisibleReport());
  appendLog(`[studio] baseline pinned from ${snapshot.baseUrl} at ${snapshot.stamp}`);
  showToast("Current report pinned as the comparison baseline.", "ok");
}

function clearBaseline() {
  persistBaseline(null);
  renderBaselineIndicator();
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

function bindNavigation() {
  document.body.addEventListener("click", (e) => {
    const clicked = e.target && e.target.nodeType === Node.ELEMENT_NODE ? e.target : (e.target && e.target.parentElement);
    if (!clicked || typeof clicked.closest !== "function") return;
    if (!clicked.closest(".app-sidebar")) return;
    const target = clicked.closest("button[data-view]");
    if (!target || target.disabled || !target.getAttribute("data-view")) return;
    e.preventDefault();
    e.stopPropagation();
    switchView(target.getAttribute("data-view") || "overview");
  }, true);
}

function bindSelectionEvents() {
  (stateEl.modeButtons || []).forEach((button) => {
    button.addEventListener("click", () => {
      uiState.mode = normalizeMode(button.dataset.mode);
      renderStaticSelections();
      persistProfile();
    });
  });

  (stateEl.mobileSweepButtons || []).forEach((button) => {
    button.addEventListener("click", () => {
      uiState.mobileSweep = normalizeMobileSweep(button.dataset.mobileSweep);
      renderStaticSelections();
      persistProfile();
    });
  });

  (stateEl.scopeButtons || []).forEach((button) => {
    button.addEventListener("click", () => {
      uiState.scope = normalizeScope(button.dataset.scope);
      renderStaticSelections();
      persistProfile();
    });
  });

  (stateEl.depthButtons || []).forEach((button) => {
    button.addEventListener("click", () => {
      uiState.depth = normalizeDepth(button.dataset.depth);
      renderStaticSelections();
      persistProfile();
    });
  });

  (stateEl.severityFilterButtons || []).forEach((button) => {
    button.addEventListener("click", () => {
      uiState.issueFilter = button.dataset.issueFilter || "all";
      renderStaticSelections();
      renderIssues(getVisibleReport());
    });
  });

  if (stateEl.findingsSearch) {
    stateEl.findingsSearch.addEventListener("input", () => {
      uiState.findingsSearch = stateEl.findingsSearch.value.trim();
      renderIssues(getVisibleReport());
    });
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest && (e.target.closest(".open-findings-search") || e.target.closest(".explorer-item-clickable[data-findings-search]"));
    if (!el || !el.getAttribute) return;
    const search = el.getAttribute("data-findings-search");
    if (search != null) {
      e.preventDefault();
      openFindingsWithSearch(search);
    }
  });
  document.addEventListener("click", (e) => {
    const btn = e.target.closest && e.target.closest(".engine-strip-link");
    if (!btn) return;
    const view = btn.dataset.view || btn.dataset.stripView;
    if (!view) return;
    e.preventDefault();
    switchView(view);
    const scrollId = btn.dataset.stripScroll;
    if (scrollId && view === "overview") {
      requestAnimationFrame(() => {
        const panel = document.getElementById(scrollId + "Panel");
        if (panel && typeof panel.scrollIntoView === "function") {
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }
  });
  if (stateEl.findingsRouteFilter) {
    stateEl.findingsRouteFilter.addEventListener("change", () => {
      uiState.findingsRoute = stateEl.findingsRouteFilter.value || "all";
      renderIssues(getVisibleReport());
    });
  }

  [
    [stateEl.findingsQualityFilter, "quality"],
    [stateEl.findingsPriorityFilter, "priority"],
    [stateEl.findingsPredictiveRiskFilter, "predictiveRisk"],
    [stateEl.findingsTrajectoryFilter, "trajectory"],
    [stateEl.findingsHealingFilter, "healing"],
    [stateEl.findingsMemoryFilter, "memory"],
    [stateEl.findingsResolutionFilter, "resolution"],
    [stateEl.findingsImpactFilter, "impact"],
  ].forEach(([node, key]) => {
    if (!node || !(node instanceof HTMLSelectElement)) return;
    node.addEventListener("change", () => {
      uiState.findingsIntelligenceFilters[key] = node.value || "all";
      renderIssues(getVisibleReport());
    });
  });

  if (stateEl.commandPaletteSearch) {
    stateEl.commandPaletteSearch.addEventListener("input", () => {
      uiState.commandPaletteQuery = stateEl.commandPaletteSearch.value.trim();
      renderCommandPalette();
    });
  }

  [
    stateEl.learningMemoryStatusFilter,
    stateEl.learningMemoryCategoryFilter,
    stateEl.learningMemorySeverityFilter,
    stateEl.learningMemorySort,
  ].forEach((node) => {
    if (!node) return;
    node.addEventListener("change", () => {
      uiState.learningMemoryFilters.status = stateEl.learningMemoryStatusFilter.value || "all";
      uiState.learningMemoryFilters.category = stateEl.learningMemoryCategoryFilter.value || "all";
      uiState.learningMemoryFilters.severity = stateEl.learningMemorySeverityFilter.value || "all";
      uiState.learningMemoryFilters.sort = stateEl.learningMemorySort.value || "recent";
      renderLearningMemory(getVisibleReport());
    });
  });

  if (stateEl.learningMemoryIssueFilter) {
    stateEl.learningMemoryIssueFilter.addEventListener("input", () => {
      uiState.learningMemoryFilters.issueCode = stateEl.learningMemoryIssueFilter.value.trim();
      renderLearningMemory(getVisibleReport());
    });
  }
  if (stateEl.learningMemorySourceFilter) {
    stateEl.learningMemorySourceFilter.addEventListener("input", () => {
      uiState.learningMemoryFilters.source = stateEl.learningMemorySourceFilter.value.trim();
      renderLearningMemory(getVisibleReport());
    });
  }
}

function bindPersistenceEvents() {
  [stateEl.targetUrl, stateEl.noServer, stateEl.headed, stateEl.elevated].filter(Boolean).forEach((node) => {
    node.addEventListener("input", persistProfile);
    node.addEventListener("change", persistProfile);
  });
  const refreshPreparedTargetState = () => {
    queuePreviewSync("profile");
    renderPreviewWorkspace();
    renderMissionBrief();
    renderReportSummary(getVisibleReport());
  };
  if (stateEl.targetUrl) {
    stateEl.targetUrl.addEventListener("input", refreshPreparedTargetState);
    stateEl.targetUrl.addEventListener("change", refreshPreparedTargetState);
  }
  if (stateEl.headed) stateEl.headed.addEventListener("change", () => renderPreviewWorkspace());
}

function bindButtons() {
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
  on(stateEl.engineOfflineGoSettings, "click", () => switchView("settings"));
  if (stateEl.doNext) on(stateEl.doNext, "click", () => executeDoNext());
  if (stateEl.nextActionOpenIssue) on(stateEl.nextActionOpenIssue, "click", () => {
    const lead = uiState.nextActionLead;
    if (lead?.issueCode) openFindingsWithSearch(lead.issueCode);
  });
  if (stateEl.nextActionPrepareHealing) on(stateEl.nextActionPrepareHealing, "click", async () => {
    const lead = uiState.nextActionLead;
    if (!lead) return;
    const issue = findVisibleIssue(lead.issueCode || "", lead.route || "/", lead.action || "");
    if (issue) await requestHealingPreparation(issue);
    else showToast("The requested healing issue is not loaded right now.", "warn");
  });
  if (stateEl.nextActionGeneratePrompt) on(stateEl.nextActionGeneratePrompt, "click", async () => {
    const lead = uiState.nextActionLead;
    if (!lead?.issueCode) return;
    const request = buildAssistantPromptRequest(lead.issueCode);
    stateEl.assistantInput.value = request;
    toggleAssistant(true);
    await runAssistantQuery(request);
  });
  on(stateEl.runAudit, "click", () => handleAuditRun());
  on(stateEl.runAuditTopbar, "click", () => handleAuditRun());
  on(stateEl.runAuditOverview, "click", () => handleAuditRun());
  on(stateEl.quickAuditButton, "click", () => handleAuditRun("signal"));
  on(stateEl.deepAuditButton, "click", () => handleAuditRun("deep"));
  on(stateEl.runCmd, "click", openCmdWindow);
  on(stateEl.previewReload, "click", reloadPreview);
  on(stateEl.previewOpenExternal, "click", openPreviewExternal);
  on(stateEl.previewToggleFollow, "click", togglePreviewFollowMode);
  on(stateEl.loadReportFile, "click", loadReportFromFile);
  on(stateEl.loadReportTopbar, "click", loadReportFromFile);
  on(stateEl.exportCurrentReport, "click", exportCurrentReport);
  on(stateEl.openLatestEvidence, "click", openLatestEvidence);
  on(stateEl.startBridge, "click", startEngine);
  on(stateEl.stopBridge, "click", stopEngine);
  on(stateEl.openReports, "click", openReportsVault);
  on(stateEl.openReportsSecondary, "click", openReportsVault);
  on(stateEl.copyBridgeUrl, "click", copyBridgeUrl);
  on(stateEl.copyBridgeUrlSecondary, "click", copyBridgeUrl);
  on(stateEl.copyReplayCommand, "click", () => copyText(stateEl.currentCommand?.textContent || "", "[studio] replay command copied."));
  on(stateEl.copyQuickPrompt, "click", () => copyText(stateEl.quickPromptBox?.textContent || "", "[studio] fix prompt copied."));
  on(stateEl.copyQuickPromptSecondary, "click", () => copyText(stateEl.quickPromptBox?.textContent || "", "[studio] fix prompt copied."));
  on(stateEl.copyQuickPromptPrimary, "click", () => copyText(stateEl.promptWorkspaceFix?.textContent || "", "[studio] fix prompt copied."));
  on(stateEl.copySelfHealingSummary, "click", () => copyText(buildSelfHealingSummary(getVisibleReport()), "[studio] self-healing summary copied."));
  on(stateEl.copyAutonomousSummary, "click", () => copyText(stateEl.autonomousQaSummary?.textContent || "", "[studio] autonomous QA summary copied."));
  on(stateEl.copyAutonomousLoop, "click", () => copyText(stateEl.autonomousQaLoop?.textContent || "", "[studio] autonomous QA loop copied."));
  on(stateEl.copyReplayCommandPrimary, "click", () => copyText(stateEl.promptWorkspaceReplay?.textContent || "", "[studio] replay command copied."));
  on(stateEl.copyReplayCommandSecondary, "click", () => copyText(stateEl.promptWorkspaceReplay?.textContent || "", "[studio] replay command copied."));
  on(stateEl.copyIssueDigest, "click", () => copyText(buildIssueDigest(getVisibleReport()), "[studio] issue digest copied."));
  on(stateEl.copyIssueDigestPrimary, "click", () => copyText(stateEl.promptWorkspaceIssues?.textContent || "", "[studio] issue digest copied."));
  on(stateEl.copyRouteDigest, "click", () => copyText(buildRouteDigest(getVisibleReport()), "[studio] route digest copied."));
  on(stateEl.copyRouteDigestPrimary, "click", () => copyText(stateEl.promptWorkspaceRoutes?.textContent || "", "[studio] route digest copied."));
  on(stateEl.copyActionDigest, "click", () => copyText(buildActionDigest(getVisibleReport()), "[studio] action digest copied."));
  on(stateEl.copyActionDigestPrimary, "click", () => copyText(stateEl.promptWorkspaceActions?.textContent || "", "[studio] action digest copied."));
  on(stateEl.copyClientOutreachPrompt, "click", () => copyText(stateEl.promptWorkspaceClientPrompt?.textContent || "", "[studio] client outreach prompt copied."));
  on(stateEl.copyClientOutreachMessage, "click", () => copyText(stateEl.promptWorkspaceClientMessage?.textContent || "", "[studio] client outreach message copied."));
  on(stateEl.copyCompareDigest, "click", () => copyText(buildCompareDigest(getVisibleReport()), "[studio] comparison digest copied."));
  on(stateEl.copyCompareDigestPrimary, "click", () => copyText(stateEl.promptWorkspaceCompare?.textContent || "", "[studio] comparison digest copied."));
  on(stateEl.copySeoDigest, "click", () => copyText(buildSeoDigest(getVisibleReport()), "[studio] SEO digest copied."));
  on(stateEl.refreshSeoSource, "click", refreshSeoSource);
  on(stateEl.saveSeoSource, "click", saveSeoSource);
  on(stateEl.checkForUpdates, "click", checkForUpdates);
  on(stateEl.downloadUpdate, "click", downloadUpdate);
  on(stateEl.installUpdate, "click", installUpdate);
  on(stateEl.copyPromptPack, "click", () => copyText(
    [
      stateEl.promptWorkspaceFix?.textContent ?? "",
      "",
      stateEl.autonomousQaSummary?.textContent ?? "",
      "",
      stateEl.autonomousQaLoop?.textContent ?? "",
      "",
      stateEl.promptWorkspaceReplay?.textContent ?? "",
      "",
      stateEl.promptWorkspaceIssues?.textContent ?? "",
      "",
      stateEl.promptWorkspaceCompare?.textContent ?? "",
      "",
      stateEl.promptWorkspaceRoutes?.textContent ?? "",
      "",
      stateEl.promptWorkspaceActions?.textContent ?? "",
      "",
      stateEl.promptWorkspaceClientPrompt?.textContent ?? "",
      "",
      stateEl.promptWorkspaceClientMessage?.textContent ?? "",
    ].join("\n"),
    "[studio] prompt pack copied.",
  ));
  on(stateEl.seoOnlyPreset, "click", () => {
    uiState.scope = "seo";
    renderStaticSelections();
    persistProfile();
    switchView("overview");
    showToast("SEO-only profile selected.", "ok");
  });
  on(stateEl.pinCurrentBaseline, "click", pinCurrentReportAsBaseline);
  on(stateEl.clearBaseline, "click", clearBaseline);
  on(stateEl.clearLog, "click", () => {
    uiState.logs = ["[studio] local log cleared"];
    renderLogs();
    showToast("Live log cleared.", "ok");
  });
  on(stateEl.clearHistory, "click", () => {
    uiState.history = [];
    persistHistory();
    renderHistory();
    showToast("Run history cleared.", "warn");
  });
  on(stateEl.revealOnboarding, "click", revealOnboarding);
  on(stateEl.dismissOnboarding, "click", () => {
    persistOnboardingState(true);
    renderOnboarding();
  });
  on(stateEl.startTourAudit, "click", applyPresetFirstAudit);
  on(stateEl.openShortcuts, "click", () => toggleShortcutsOverlay());
  on(stateEl.openAssistant, "click", () => toggleAssistant());
  on(stateEl.openCommandPalette, "click", () => toggleCommandPalette());
  (stateEl.menuButtons || []).forEach((button) => {
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
  on(stateEl.dismissShortcuts, "click", () => toggleShortcutsOverlay(false));
  on(stateEl.shortcutsOverlay, "click", (event) => {
    if (event.target === stateEl.shortcutsOverlay) {
      toggleShortcutsOverlay(false);
    }
  });
  on(stateEl.dismissAssistant, "click", () => toggleAssistant(false));
  on(stateEl.assistantExpand, "click", () => toggleAssistantExpanded());
  if (stateEl.assistantFocus) {
    on(stateEl.assistantFocus, "click", () => enterAiFocusMode());
  }
  const stickyEnterFocusAi = document.getElementById("stickyEnterFocusAi");
  if (stickyEnterFocusAi) {
    on(stickyEnterFocusAi, "click", () => enterAiFocusMode());
  }
  const aiAgentFullscreenBtn = document.getElementById("aiAgentFullscreenBtn");
  if (aiAgentFullscreenBtn) {
    on(aiAgentFullscreenBtn, "click", () => enterAiFocusMode());
  }
  const aiAgentDetachBtn = document.getElementById("aiAgentDetachBtn");
  if (aiAgentDetachBtn) {
    on(aiAgentDetachBtn, "click", () => enterAiDetachedExpandedMode());
  }
  if (stateEl.assistantApplyAction) {
    on(stateEl.assistantApplyAction, "click", () => {
      const stepResult = executeAssistantSuggestedStep();
      if (stepResult.executed) {
        showToast("Action applied.", "ok");
        renderAssistantState();
      } else if (stepResult.reason) {
        showToast(stepResult.reason, "warn");
      }
    });
  }
  if (stateEl.assistantBackToDock) {
    on(stateEl.assistantBackToDock, "click", () => setAiWorkspaceMode(uiState.lastNonFocusMode));
  }
  const expandOverviewBtn = document.getElementById("expandOverviewBtn");
  if (expandOverviewBtn) {
    on(expandOverviewBtn, "click", () => setAiWorkspaceMode(uiState.lastNonFocusMode));
  }
  const dockRunAudit = document.getElementById("dockRunAudit");
  if (dockRunAudit) {
    on(dockRunAudit, "click", () => handleAuditRun());
  }
  const dockOpenFindings = document.getElementById("dockOpenFindings");
  if (dockOpenFindings) {
    on(dockOpenFindings, "click", () => switchView("findings"));
  }
  const dockCompare = document.getElementById("dockCompare");
  if (dockCompare) {
    on(dockCompare, "click", () => switchView("compare"));
  }
  bindAssistantDockResize();
  if (stateEl.assistantNewChat) {
    stateEl.assistantNewChat.addEventListener("click", () => createNewConversation());
  }
  if (stateEl.assistantConversationSearch) {
    stateEl.assistantConversationSearch.addEventListener("input", () => {
      uiState.assistantConversationSearch = stateEl.assistantConversationSearch.value || "";
      renderConversationList();
    });
  }
  (stateEl.assistantViewButtons || []).forEach((button) => {
    button.addEventListener("click", () => switchAssistantView(button.dataset.assistantView || "conversation"));
  });
  on(stateEl.assistantAsk, "click", () => runAssistantQuery(stateEl.assistantInput?.value || ""));
  on(stateEl.assistantQuickPriorities, "click", async () => {
    if (stateEl.assistantInput) stateEl.assistantInput.value = getAssistantQuickQuery("priorities");
    await runAssistantQuery(getAssistantQuickQuery("priorities"));
  });
  on(stateEl.assistantQuickSeo, "click", async () => {
    if (stateEl.assistantInput) stateEl.assistantInput.value = getAssistantQuickQuery("seo");
    await runAssistantQuery(getAssistantQuickQuery("seo"));
  });
  on(stateEl.assistantQuickPrompt, "click", async () => {
    const code = getVisibleReport()?.issues?.[0]?.code || "";
    const text = buildAssistantPromptRequest(code);
    if (stateEl.assistantInput) stateEl.assistantInput.value = text;
    await runAssistantQuery(text);
  });
  on(stateEl.assistantQuickGuide, "click", async () => {
    if (stateEl.assistantInput) stateEl.assistantInput.value = getAssistantQuickQuery("guide");
    await runAssistantQuery(getAssistantQuickQuery("guide"));
  });
  on(stateEl.assistantQuickStartEngine, "click", async () => {
    if (stateEl.assistantInput) stateEl.assistantInput.value = getAssistantQuickQuery("startEngine");
    if (!ensureCompanion()) {
      showToast("App bridge not ready. Restart SitePulse Studio.", "bad");
      return;
    }
    await startEngine();
  });
  if (stateEl.assistantLanguageSelect) stateEl.assistantLanguageSelect.addEventListener("change", () => {
    const adaptiveLanguage = ensureAdaptiveLanguageService();
    if (!adaptiveLanguage) return;
    uiState.assistantLanguageState = stateEl.assistantLanguageSelect.value === "auto"
      ? adaptiveLanguage.setAutoMode()
      : adaptiveLanguage.setManualLanguage(stateEl.assistantLanguageSelect.value);
    rerenderAssistantInActiveLanguage();
  });
  on(stateEl.dismissCommandPalette, "click", () => toggleCommandPalette(false));
  on(stateEl.commandPaletteOverlay, "click", (event) => {
    if (event.target === stateEl.commandPaletteOverlay) {
      toggleCommandPalette(false);
    }
  });
  if (stateEl.assistantActions) stateEl.assistantActions.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const cardActionButton = target.closest("[data-assistant-card-action]");
    if (cardActionButton instanceof HTMLElement) {
      const actionId = String(cardActionButton.dataset.assistantCardAction || "");
      const promptCard = uiState.assistantResult?.promptCard;
      if (actionId === "copy-prompt" && promptCard) {
        await copyText(String(promptCard.promptText || ""), "[studio] assistant prompt copied.");
      } else if (actionId === "send-prompt" && promptCard) {
        sendAssistantPromptCardToWorkspace(promptCard);
      } else if (actionId === "save-prompt" && promptCard) {
        saveAssistantPromptCard(promptCard);
      }
      return;
    }
    const button = target.closest("[data-assistant-index]");
    if (!(button instanceof HTMLElement)) return;
    const index = Number(button.dataset.assistantIndex);
    const actionCards = Array.isArray(uiState.assistantResult?.actionCards) ? uiState.assistantResult.actionCards : [];
    const actions = Array.isArray(uiState.assistantResult?.actions) ? uiState.assistantResult.actions : [];
    const action = actionCards[index] ? { id: actionCards[index].id, label: actionCards[index].label, payload: actionCards[index].payload || {} } : actions[index];
    await executeAssistantAction(action);
  });
  on(stateEl.dismissEvidenceLightbox, "click", closeEvidencePreview);
  on(stateEl.evidenceLightbox, "click", (event) => {
    if (event.target === stateEl.evidenceLightbox) {
      closeEvidencePreview();
    }
  });
  on(stateEl.evidenceOpenImage, "click", async () => {
    await openArtifactFile(uiState.activeEvidence?.path || "");
  });
  on(stateEl.evidenceRevealImage, "click", async () => {
    await openArtifactPath(uiState.activeEvidence?.path || "");
  });
  on(stateEl.dismissLongRunOverlay, "click", closeLongRunAdvisor);
  on(stateEl.dismissLongRunSecondary, "click", closeLongRunAdvisor);
  on(stateEl.longRunOverlay, "click", (event) => {
    if (event.target === stateEl.longRunOverlay) {
      closeLongRunAdvisor();
    }
  });
  on(stateEl.applyFastMode, "click", async () => {
    const audit = uiState.companionState?.audit || {};
    if (canResumeCurrentRunInFastMode(audit)) {
      const result = await window.sitePulseCompanion.switchAuditToFastMode(buildFastModeResumeInput(audit));
      if (!result?.ok) {
        appendLog(`[studio] fast mode handoff failed: ${result?.detail || result?.error || "unknown"}`);
        showToast("Could not switch the current run safely.", "bad");
        return;
      }
      appendLog("[studio] fast mode handoff requested. current evidence will be preserved.");
      showToast("Safe pause requested. SitePulse will resume from checkpoint in fast mode.", "ok");
      closeLongRunAdvisor();
      return;
    }

    applyFastModeProfile(buildFastModeProfile(audit));
    appendLog("[studio] fast mode armed after long-run advisory.");
    showToast("Fast mode armed. The next run will use a lighter profile.", "ok");
    closeLongRunAdvisor();
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
  if (stateEl.launchOnLogin) stateEl.launchOnLogin.addEventListener("change", async () => {
    const result = await window.sitePulseCompanion.setLaunchOnLogin(stateEl.launchOnLogin.checked);
    appendLog(result.ok ? `[studio] open on login ${result.enabled ? "enabled" : "disabled"}.` : `[studio] launch on login failed: ${result.error || "unknown"}`);
    showToast(result.ok ? `Open on login ${result.enabled ? "enabled" : "disabled"}.` : "Could not change startup behavior.", result.ok ? "ok" : "bad");
  });
  on(stateEl.winMinimize, "click", async () => {
    await window.sitePulseCompanion.minimizeWindow();
  });
  on(stateEl.winMaximize, "click", async () => {
    const payload = await window.sitePulseCompanion.toggleMaximizeWindow();
    if (!payload?.ok) return;
    stateEl.winMaximize.textContent = payload.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  });
  on(stateEl.winClose, "click", async () => {
    await window.sitePulseCompanion.closeWindow();
  });
  function handleHistoryAction(event) {
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
      renderBaselineIndicator();
      renderHistory();
      renderRunHistoryTable();
      renderComparison(getVisibleReport());
      renderWorkspaceHeader(uiState.activeView);
      appendLog(`[studio] baseline set from history snapshot ${snapshot.baseUrl}.`);
      showToast("History snapshot set as baseline.", "ok");
      return;
    }
    renderAllReportState(snapshot.report);
    switchView("reports");
    appendLog(`[studio] loaded snapshot ${snapshot.baseUrl} from history.`);
    showToast("Stored snapshot loaded.", "ok");
  }
  if (stateEl.historyList) stateEl.historyList.addEventListener("click", handleHistoryAction);
  if (stateEl.compactRunHistory) stateEl.compactRunHistory.addEventListener("click", handleHistoryAction);
  if (stateEl.runHistoryTableBody) stateEl.runHistoryTableBody.addEventListener("click", handleHistoryAction);
  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const issueActionButton = target.closest("[data-issue-action]");
    if (issueActionButton instanceof HTMLElement) {
      const inIssues = stateEl.issuesList && stateEl.issuesList.contains(issueActionButton);
      const inGallery = stateEl.evidenceGallery && stateEl.evidenceGallery.contains(issueActionButton);
      const inContact = stateEl.routeContactSheet && stateEl.routeContactSheet.contains(issueActionButton);
      if (inIssues || inGallery || inContact) return;
      const issueCode = issueActionButton.dataset.issueCode || "";
      const issueAction = issueActionButton.dataset.issueAction || "";
      const route = issueActionButton.dataset.issueRoute || "/";
      const actionName = issueActionButton.dataset.issueActionName || "";
      if (issueAction === "prepare-healing") {
        const issue = findVisibleIssue(issueCode, route, actionName);
        if (issue) await requestHealingPreparation(issue);
      }
    }
  });
  [stateEl.issuesList, stateEl.evidenceGallery, stateEl.routeContactSheet].forEach((container) => {
    if (!container) return;
    container.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const issueActionButton = target.closest("[data-issue-action]");
      if (issueActionButton instanceof HTMLElement) {
        const issueCode = issueActionButton.dataset.issueCode || "";
        const issueAction = issueActionButton.dataset.issueAction || "";
        if (issueAction === "open-memory") {
          focusLearningMemoryIssue(issueCode);
          return;
        }
        if (issueAction === "generate-prompt") {
          toggleAssistant(true);
          stateEl.assistantInput.value = buildAssistantPromptRequest(issueCode);
          await runAssistantQuery(stateEl.assistantInput.value);
          return;
        }
        if (issueAction === "prepare-healing") {
          const issue = findVisibleIssue(issueCode);
          if (issue) {
            await requestHealingPreparation(issue);
          }
          return;
        }
        if (issueAction === "copy-healing-prompt") {
          const issue = findVisibleIssue(issueCode);
          const promptText = String(issue?.selfHealing?.promptText || "").trim();
          await copyText(promptText, "[studio] healing prompt copied.");
          return;
        }
        if (issueAction === "revalidate-healing") {
          const issue = findVisibleIssue(issueCode);
          if (issue) {
            await requestHealingRevalidation(issue);
          }
          return;
        }
        if (issueAction === "manual-override") {
          const issue = getVisibleReport()?.issues?.find((item) => String(item.code || "").toUpperCase() === String(issueCode || "").toUpperCase());
          if (issue) {
            await requestManualOverride(issue);
          }
          return;
        }
      }
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
  if (stateEl.learningMemoryList) stateEl.learningMemoryList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-learning-action]");
    if (!(button instanceof HTMLElement)) return;
    const action = button.dataset.learningAction || "";
    const issueCode = button.dataset.learningCode || "";
    if (action === "open-memory") {
      focusLearningMemoryIssue(issueCode);
      return;
    }
    if (action === "manual-override") {
      const memory = getVisibleLearningMemory(getVisibleReport());
      const entry = memory?.entries?.find((item) => String(item.issueCode || "").toUpperCase() === String(issueCode || "").toUpperCase());
      if (entry) {
        await requestManualOverride(entry);
      }
    }
  });
  if (stateEl.selfHealingList) stateEl.selfHealingList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest("[data-healing-action]");
    if (!(button instanceof HTMLElement)) return;
    const action = button.dataset.healingAction || "";
    const issueCode = button.dataset.healingCode || "";
    if (action === "open-memory") {
      focusLearningMemoryIssue(issueCode);
      return;
    }
    const issue = findVisibleIssue(issueCode, button.dataset.healingRoute || "/", button.dataset.healingActionName || "");
    if (!issue) {
      showToast("The requested healing issue is not loaded right now.", "warn");
      return;
    }
    if (action === "prepare") {
      await requestHealingPreparation(issue);
      return;
    }
    if (action === "copy-prompt") {
      await copyText(String(issue.selfHealing?.promptText || "").trim(), "[studio] healing prompt copied.");
      return;
    }
    if (action === "revalidate") {
      await requestHealingRevalidation(issue);
    }
  });
}

function verifyCriticalButtons() {
  const critical = [
    { id: "runAudit", el: stateEl.runAudit },
    { id: "runAuditTopbar", el: stateEl.runAuditTopbar },
    { id: "runAuditOverview", el: stateEl.runAuditOverview },
    { id: "loadReportFile", el: stateEl.loadReportFile },
    { id: "loadReportTopbar", el: stateEl.loadReportTopbar },
    { id: "openAssistant", el: stateEl.openAssistant },
    { id: "openCommandPalette", el: stateEl.openCommandPalette },
    { id: "doNext", el: stateEl.doNext },
    { id: "quickAuditButton", el: stateEl.quickAuditButton },
    { id: "deepAuditButton", el: stateEl.deepAuditButton },
  ];
  const missing = critical.filter(({ el }) => !el).map(({ id }) => id);
  if (missing.length) {
    appendLog(`[studio] critical buttons missing (IDs not in DOM): ${missing.join(", ")}. Check renderer.html has these ids.`);
  }
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
      if (uiState.assistantOpen) {
        event.preventDefault();
        toggleAssistant(false);
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

    if (event.ctrlKey && event.key.toLowerCase() === "j") {
      event.preventDefault();
      toggleAssistant();
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

    if (uiState.assistantOpen && event.key === "Enter" && !event.shiftKey) {
      if (document.activeElement === stateEl.assistantInput) {
        event.preventDefault();
        await runAssistantQuery(stateEl.assistantInput.value);
        return;
      }
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
  if (typeof window.sitePulseCompanion !== "object" || window.sitePulseCompanion === null) {
    return;
  }
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

function refreshStateElRefs() {
  const criticalIds = [
    "runAudit", "runAuditTopbar", "runAuditOverview", "loadReportFile", "loadReportTopbar",
    "openAssistant", "openCommandPalette", "doNext", "quickAuditButton", "deepAuditButton",
    "engineOfflineGoSettings", "runCmd", "exportCurrentReport", "openLatestEvidence",
    "startBridge", "stopBridge", "openReports", "openReportsSecondary", "copyBridgeUrl", "copyBridgeUrlSecondary",
    "nextActionOpenIssue", "nextActionPrepareHealing", "nextActionGeneratePrompt",
    "winMinimize", "winMaximize", "winClose",
    "menuFlyout", "workspaceShell", "workspaceHeader", "targetUrl", "findingsSearch",

    // Assistant UI (mounted lazily by React) + notifications
    "toastStack",
    "assistantWorkspace",
    "assistantExpand",
    "assistantFocus",
    "assistantBackToDock",
    "assistantDockResizeHandle",
    "assistantEyebrow",
    "assistantTitle",
    "assistantContextPills",
    "assistantInput",
    "assistantInputLabel",
    "assistantAsk",
    "assistantQuickPriorities",
    "assistantQuickSeo",
    "assistantQuickPrompt",
    "assistantQuickGuide",
    "assistantQuickStartEngine",
    "assistantContextSummary",
    "assistantModePill",
    "assistantIntentPill",
    "assistantLanguagePill",
    "assistantOperatorStatus",
    "assistantOperatorStatusText",
    "assistantLanguageLabel",
    "assistantLanguageSelect",
    "assistantModeSummary",
    "assistantInsights",
    "assistantResponse",
    "assistantChatScroll",
    "assistantActions",
    "assistantConsoleContext",
    "assistantConsoleRisk",
    "assistantConsolePriority",
    "assistantConsoleNextActions",
    "assistantApplyAction",
    "assistantPillRun",
    "assistantPillWorkspace",
    "assistantPillFocus",
    "assistantPillLang",
    "assistantMemorySummary",
    "assistantHealingSummary",
    "assistantNewChat",
    "assistantConversationSearch",
    "assistantConversationList",
  ];
  criticalIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el && Object.prototype.hasOwnProperty.call(stateEl, id)) stateEl[id] = el;
  });
  const logOutputEl = document.getElementById("logOutput");
  if (logOutputEl) stateEl.logOutput = logOutputEl;
  stateEl.assistantViewButtons = Array.from(document.querySelectorAll("[data-assistant-view]"));
  stateEl.assistantViewPanels = Array.from(document.querySelectorAll("[data-assistant-view-panel]"));
}

/** IDs criados no painel real — remover fantasmas do compatGhostRoot para evitar duplicados. */
const ASSISTANT_WORKSPACE_SHELL_IDS = new Set([
  "assistantWorkspaceReactRoot",
  "assistantNewChat",
  "assistantConversationSearch",
  "assistantConversationList",
  "assistantExpand",
  "assistantFocus",
  "assistantBackToDock",
  "dismissAssistant",
  "assistantEyebrow",
  "assistantTitle",
  "assistantContextPills",
  "assistantQuickPriorities",
  "assistantQuickSeo",
  "assistantQuickPrompt",
  "assistantQuickGuide",
  "assistantQuickStartEngine",
  "assistantContextSummary",
  "assistantModePill",
  "assistantIntentPill",
  "assistantLanguagePill",
  "assistantPillRun",
  "assistantPillWorkspace",
  "assistantPillFocus",
  "assistantPillLang",
  "assistantOperatorStatus",
  "assistantOperatorStatusText",
  "assistantLanguageLabel",
  "assistantLanguageSelect",
  "assistantModeSummary",
  "assistantInsights",
  "assistantChatScroll",
  "assistantResponse",
  "assistantActions",
  "assistantConsoleContext",
  "assistantConsoleRisk",
  "assistantConsolePriority",
  "assistantConsoleNextActions",
  "assistantApplyAction",
  "assistantMemorySummary",
  "assistantHealingSummary",
  "assistantDockResizeHandle",
]);

function stripCompatGhostAssistantDuplicates() {
  const ghost = document.getElementById("compatGhostRoot");
  if (!ghost) return;
  ghost.querySelectorAll("[id]").forEach((el) => {
    if (ASSISTANT_WORKSPACE_SHELL_IDS.has(el.id)) el.remove();
  });
}

/**
 * O compatGhostRoot criava #assistantResponse (etc.) escondidos; o painel #assistantWorkspace ficava vazio
 * e o chat renderizava fora da vista. Montamos o shell real aqui antes de refreshStateElRefs/bindButtons.
 */
function ensureAssistantWorkspaceShell() {
  const host = document.getElementById("assistantWorkspace");
  if (!host || host.querySelector("#assistantResponse")) return;
  stripCompatGhostAssistantDuplicates();
  host.innerHTML = `
    <div id="assistantWorkspaceReactRoot" aria-hidden="true"></div>
    <div class="assistant-workspace-layout">
      <div class="assistant-conversation-history">
        <div class="assistant-history-head">
          <div class="assistant-head-actions">
            <button type="button" id="assistantNewChat" class="ai-workspace-btn">New chat</button>
          </div>
          <label class="visually-hidden" for="assistantConversationSearch">Search conversations</label>
          <input id="assistantConversationSearch" class="toolbar-input assistant-history-search" type="search" placeholder="Search" autocomplete="off" />
        </div>
        <div id="assistantConversationList" class="assistant-conversation-list"></div>
      </div>
      <div class="ai-workspace-premium" style="min-height:0;display:flex;flex-direction:column;flex:1;overflow:hidden;">
        <div class="assistant-workspace-shell ai-workspace-premium-inner">
          <div class="assistant-workspace-head">
            <div>
              <p id="assistantEyebrow" class="text-[11px] uppercase tracking-wide text-text-tertiary">Assistant</p>
              <h3 id="assistantTitle" class="text-[15px] font-semibold text-text-primary m-0">Operational co-pilot</h3>
            </div>
            <div class="assistant-head-actions">
              <button type="button" id="dismissAssistant" class="ai-workspace-btn" title="Collapse">Collapse</button>
              <button type="button" id="assistantExpand" class="ai-workspace-btn">Expand</button>
              <button type="button" id="assistantFocus" class="ai-workspace-btn">Focus</button>
              <button type="button" id="assistantBackToDock" class="ai-workspace-btn hidden">Back</button>
            </div>
          </div>
          <div id="assistantContextPills" class="assistant-context-pills"></div>
          <div class="assistant-workspace-tabs">
            <button type="button" class="active" data-assistant-view="conversation">Conversation</button>
            <button type="button" data-assistant-view="actions">Actions</button>
            <button type="button" data-assistant-view="insights">Insights</button>
            <button type="button" data-assistant-view="diagnostics">Diagnostics</button>
          </div>
          <section data-assistant-view-panel="conversation" class="assistant-workspace-body active">
            <div id="assistantOperatorStatus" class="assistant-operator-status hidden">
              <span class="assistant-operator-status-label">Operator</span>
              <span id="assistantOperatorStatusText" class="assistant-operator-status-text"></span>
            </div>
            <p id="assistantContextSummary" class="text-[12px] text-text-secondary leading-relaxed"></p>
            <div class="assistant-identity-row flex flex-wrap gap-2 mb-2">
              <span id="assistantModePill" class="ai-workspace-pill"></span>
              <span id="assistantIntentPill" class="ai-workspace-pill"></span>
              <span id="assistantLanguagePill" class="ai-workspace-pill"></span>
              <span id="assistantPillRun" class="ai-workspace-pill"></span>
              <span id="assistantPillWorkspace" class="ai-workspace-pill"></span>
              <span id="assistantPillFocus" class="ai-workspace-pill"></span>
              <span id="assistantPillLang" class="ai-workspace-pill"></span>
            </div>
            <p id="assistantModeSummary" class="text-[12px] text-text-tertiary"></p>
            <div class="assistant-quick-grid mb-2">
              <button type="button" id="assistantQuickPriorities" class="ai-workspace-btn">Priorities</button>
              <button type="button" id="assistantQuickSeo" class="ai-workspace-btn">SEO</button>
              <button type="button" id="assistantQuickPrompt" class="ai-workspace-btn">Prompt</button>
              <button type="button" id="assistantQuickGuide" class="ai-workspace-btn">Guide</button>
              <button type="button" id="assistantQuickStartEngine" class="ai-workspace-btn" style="border-color:rgba(34,197,94,0.35);background:rgba(34,197,94,0.12);color:#bbf7d0;" title="startBridge / engine">Ligar motor</button>
            </div>
            <div class="flex flex-wrap items-center gap-2 mb-2">
              <label id="assistantLanguageLabel" for="assistantLanguageSelect" class="text-[12px] text-text-tertiary"></label>
              <select id="assistantLanguageSelect" class="ai-workspace-lang-select">
                <option value="auto">Auto</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
                <option value="es">Español</option>
                <option value="ca">Català</option>
              </select>
              <button type="button" id="assistantApplyAction" class="hidden ai-workspace-btn">Apply plan</button>
            </div>
            <div class="assistant-chat-primary">
              <div id="assistantChatScroll" style="overflow:auto;min-height:120px;max-height:48vh;flex:1;">
                <div id="assistantResponse" class="assistant-chat-thread ai-workspace-messages"></div>
              </div>
            </div>
            <div id="assistantActions" class="assistant-actions-grid mt-2"></div>
          </section>
          <section data-assistant-view-panel="actions" class="assistant-workspace-body hidden">
            <p class="text-[12px] text-text-tertiary">Suggested actions appear in Conversation after each reply.</p>
          </section>
          <section data-assistant-view-panel="insights" class="assistant-workspace-body hidden">
            <div id="assistantInsights" class="assistant-insights-stack"></div>
          </section>
          <section data-assistant-view-panel="diagnostics" class="assistant-workspace-body hidden">
            <div class="ai-operator-console">
              <div class="console-row text-[12px] text-text-secondary"><span id="assistantConsoleContext"></span></div>
              <div class="console-row text-[12px] text-text-secondary"><span id="assistantConsoleRisk"></span></div>
              <div class="console-row text-[12px] text-text-secondary"><span id="assistantConsolePriority"></span></div>
              <div class="console-row text-[12px]" id="assistantConsoleNextActions"></div>
            </div>
            <div class="mt-2 text-[12px] text-text-tertiary">
              <span id="assistantMemorySummary"></span> · <span id="assistantHealingSummary"></span>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div id="assistantDockResizeHandle" class="assistant-dock-resize" style="height:6px;cursor:ns-resize;flex-shrink:0;"></div>
  `;
}

async function bootstrap() {
  document.body.classList.add("studio-ready");
  window.__SITEPULSE_RENDERER_BOOT = true;
  ensureAssistantWorkspaceShell();
  refreshStateElRefs();
  ensureCompanion();
  bindNavigation();
  bindSelectionEvents();
  bindPersistenceEvents();
  bindButtons();
  verifyCriticalButtons();
  bindKeyboardShortcuts();
  bindRuntimeEvents();

  restoreProfile();
  renderStaticSelections();
  renderOnboarding();
  bindPreviewSurface();

  renderAllReportState(null);
  renderHistory();
  renderLogs();
  renderCommandPalette();
  renderPreviewWorkspace();
  switchView("overview");

  if (!ensureCompanion()) {
    showToast("App bridge not ready. Restart SitePulse Studio.", "bad");
    appendLog("[studio] bootstrap: sitePulseCompanion unavailable; some actions will show a message when used.");
    loadAssistantWorkspaceUIPrefs();
    renderAssistantWorkspaceLayout();
    return;
  }
  try {
    const [payload, windowState] = await Promise.all([
      window.sitePulseCompanion.getState(),
      window.sitePulseCompanion.getWindowState(),
    ]);
    renderCompanionState(payload);
    stateEl.winMaximize.textContent = windowState?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
    await refreshOperationalMemorySnapshot();
    loadAssistantWorkspaceUIPrefs();
    renderAssistantState();
    renderAssistantWorkspaceLayout();
    queuePreviewSync("bootstrap");
  } catch (err) {
    appendLog(`[studio] bootstrap state sync failed: ${err?.message || err}`);
    showToast("Could not load app state. Buttons may not work until you restart.", "bad");
  }
}

function onDomReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

window.addEventListener("error", (event) => {
  const msg = event?.message || event?.error?.message || String(event);
  appendLog(`[studio] error: ${msg}`);
  if (typeof showToast === "function") showToast("An error occurred. Check the log.", "bad");
});
window.addEventListener("unhandledrejection", (event) => {
  const msg = event?.reason?.message || String(event?.reason || event);
  appendLog(`[studio] unhandled rejection: ${msg}`);
  if (typeof showToast === "function") showToast("An error occurred. Check the log.", "bad");
});

onDomReady(() => {
  bootstrap().catch((error) => {
    appendLog(`[studio] bootstrap failed: ${error?.message || error}`);
    if (typeof showToast === "function") showToast("Startup failed. Check the log.", "bad");
    if (typeof console !== "undefined" && console.error) console.error("[studio] bootstrap", error);
  });
});

window.sitepulseShellActions = {
  startEngine,
  stopEngine,
  copyBridgeUrl,
  runAudit: () => handleAuditRun(),
  openReportsVault,
  openAssistant: () => openAssistantDockExpandedFromShell(),
  reloadShell: () => {
    try {
      window.location.reload();
    } catch {
      /* ignore */
    }
  },
  scrollToLog: () => {
    switchView("operations");
    const logEl = document.getElementById("logOutput");
    if (logEl && typeof logEl.scrollIntoView === "function") {
      logEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },
};

window.sitePulseWorkspaceSystem = {
  enable() {
    window.localStorage?.setItem(WORKSPACE_SYSTEM_FLAG_KEY, "1");
    return maybeInitWorkspaceSystem();
  },
  enablePhase1() {
    window.localStorage?.setItem(WORKSPACE_PHASE1_KEY, "1");
    return maybeInitWorkspaceSystem();
  },
  disable() {
    window.localStorage?.removeItem(WORKSPACE_SYSTEM_FLAG_KEY);
    return true;
  },
  disablePhase1() {
    window.localStorage?.removeItem(WORKSPACE_PHASE1_KEY);
    return true;
  },
  isEnabled() {
    return isWorkspaceSystemEnabled();
  },
  isPhase1() {
    return isWorkspacePhase1Enabled();
  },
  manager() {
    return workspaceSystemManager;
  },
  /** Para testes / consola: navega sem depender do clique na sidebar (síncrono; troca de workspace é async em background). */
  navigateToView(viewName) {
    switchView(viewName);
  },
};

/**
 * SitePulse Renderer Bridge
 * Expõe funções para a interface React (app/src) interagir com o sistema legado
 */
window.sitepulseRenderer = {
  // Navegação entre views
  switchView(viewName) {
    if (typeof switchView === "function") {
      switchView(viewName);
    }
  },

  // Controle do assistente
  toggleAssistant(forceOpen) {
    if (typeof toggleAssistant === "function") {
      toggleAssistant(forceOpen);
    }
  },

  toggleAssistantExpanded(forceExpanded) {
    if (typeof toggleAssistantExpanded === "function") {
      toggleAssistantExpanded(forceExpanded);
    }
  },

  // Conversação
  createNewConversation() {
    if (typeof createNewConversation === "function") {
      createNewConversation();
    }
  },

  runAssistantQuery(query) {
    if (typeof runAssistantQuery === "function") {
      return runAssistantQuery(query);
    }
  },

  // Snapshot do assistente para o React
  getAssistantSnapshot() {
    const report = getVisibleReport();
    if (!report) {
      return {
        hasReport: false,
        meta: null,
        summary: null,
        seoScore: 0,
        qualityScore: 0,
        issues: [],
      };
    }
    return {
      hasReport: true,
      meta: report.meta || null,
      summary: report.summary || null,
      seoScore: report.summary?.seoScore || 0,
      qualityScore: report.summary?.qualityScore || 0,
      issues: report.issues || [],
    };
  },

  getAssistantConversationSnapshot() {
    return uiState.assistantConversation || [];
  },

  // Executar auditoria
  handleAuditRun(forceDepth) {
    if (typeof handleAuditRun === "function") {
      return handleAuditRun(forceDepth);
    }
  },
};


