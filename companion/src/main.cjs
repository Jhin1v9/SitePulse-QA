const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const process = require("node:process");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, clipboard, dialog, ipcMain, screen, shell } = require("electron");
const { fetchSearchConsoleSnapshot, normalizeSiteProperty } = require("./search-console-service.cjs");
const { UpdateService } = require("./update-service.cjs");

const IS_SMOKE_MODE = process.argv.includes("--smoke-test") || process.env.SITEPULSE_DESKTOP_SMOKE === "1";
const BRIDGE_HOST = "127.0.0.1";
const BRIDGE_PORT = Number(process.env.SITEPULSE_BRIDGE_PORT || (IS_SMOKE_MODE ? "47991" : "47891"));
const BOOTSTRAP_TRACE_FILE = process.env.APPDATA
  ? path.join(process.env.APPDATA, "sitepulse-desktop", "bootstrap.log")
  : path.join(process.cwd(), "sitepulse-desktop-bootstrap.log");
const WINDOW_DEFAULT_WIDTH = 1660;
const WINDOW_DEFAULT_HEIGHT = 1020;
const WINDOW_MIN_WIDTH = 900;
const WINDOW_MIN_HEIGHT = 560;

let mainWindow = null;
let bridgeHandle = null;
let qaRuntimeDir = "";
let reportsDir = "";
let desktopLogFile = "";
let launchOnLogin = false;
let shuttingDown = false;
const logLines = [];
let liveReportPoller = null;
let liveReportCheckpointPath = "";
let liveReportLastMtimeMs = 0;
let liveReportReadInFlight = false;
let liveReportContext = null;
let seoSourceState = null;
let updateService = null;
let fastResumePlan = null;
let displayMetricsHandler = null;

function createEmptySeoSourceState() {
  return {
    property: "",
    accessToken: "",
    lookbackDays: 28,
    snapshot: null,
    lastSyncedAt: "",
    lastError: "",
  };
}

function normalizeLookbackDays(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return 28;
  return Math.min(90, Math.max(3, parsed));
}

function getSeoSourceStatePath() {
  return path.join(app.getPath("userData"), "seo-source.json");
}

function sanitizeSeoSourceState(input) {
  const state = input && typeof input === "object" ? input : createEmptySeoSourceState();
  return {
    property: String(state.property || ""),
    hasAccessToken: String(state.accessToken || "").trim().length > 0,
    lookbackDays: normalizeLookbackDays(state.lookbackDays),
    lastSyncedAt: String(state.lastSyncedAt || ""),
    lastError: String(state.lastError || ""),
    snapshot: state.snapshot && typeof state.snapshot === "object"
      ? {
          source: String(state.snapshot.source || "google-search-console"),
          property: String(state.snapshot.property || ""),
          startDate: String(state.snapshot.startDate || ""),
          endDate: String(state.snapshot.endDate || ""),
          lookbackDays: normalizeLookbackDays(state.snapshot.lookbackDays),
          clicks: Number(state.snapshot.clicks || 0),
          impressions: Number(state.snapshot.impressions || 0),
          ctr: Number(state.snapshot.ctr || 0),
          position: Number(state.snapshot.position || 0),
          topQuery: String(state.snapshot.topQuery || ""),
          topQueryClicks: Number(state.snapshot.topQueryClicks || 0),
          topPage: String(state.snapshot.topPage || ""),
          topPageClicks: Number(state.snapshot.topPageClicks || 0),
          syncedAt: String(state.snapshot.syncedAt || ""),
        }
      : null,
  };
}

async function readSeoSourceState() {
  const defaults = createEmptySeoSourceState();
  try {
    const raw = await fs.readFile(getSeoSourceStatePath(), "utf8");
    const parsed = JSON.parse(raw);
    const property = normalizeSiteProperty(parsed?.property);
    return {
      property,
      accessToken: String(parsed?.accessToken || "").trim(),
      lookbackDays: normalizeLookbackDays(parsed?.lookbackDays),
      snapshot: parsed?.snapshot && typeof parsed.snapshot === "object" ? parsed.snapshot : null,
      lastSyncedAt: String(parsed?.lastSyncedAt || ""),
      lastError: String(parsed?.lastError || ""),
    };
  } catch {
    return defaults;
  }
}

async function persistSeoSourceState(nextState) {
  seoSourceState = {
    property: normalizeSiteProperty(nextState?.property),
    accessToken: String(nextState?.accessToken || "").trim(),
    lookbackDays: normalizeLookbackDays(nextState?.lookbackDays),
    snapshot: nextState?.snapshot && typeof nextState.snapshot === "object" ? nextState.snapshot : null,
    lastSyncedAt: String(nextState?.lastSyncedAt || ""),
    lastError: String(nextState?.lastError || ""),
  };
  await fs.writeFile(getSeoSourceStatePath(), `${JSON.stringify(seoSourceState, null, 2)}\n`, "utf8");
}

async function ensureSeoSourceState() {
  if (!seoSourceState) {
    seoSourceState = await readSeoSourceState();
  }
  return seoSourceState;
}

function isSafeHttpUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function createEmptyAuditProgress() {
  return {
    percentage: 0,
    phase: "idle",
    phaseLabel: "Ready",
    detail: "Waiting for the next run.",
    routeIndex: 0,
    totalRoutes: 0,
    labelIndex: 0,
    totalLabels: 0,
    currentRoute: "",
    currentAction: "",
    lastEventType: "",
    sweepProfileIndex: 0,
    sweepProfileTotal: 0,
    sweepProfileLabel: "",
    sweepProfileViewport: "",
    sweepProfilePercentage: 0,
    sweepProfileStartedAtMs: 0,
  };
}

function normalizeMobileSweep(value) {
  return value === "family" ? "family" : "single";
}

const MOBILE_FAMILY_PROFILES = [
  { id: "small", label: "Small phone", width: 360, height: 740 },
  { id: "medium", label: "Medium phone", width: 390, height: 844 },
  { id: "large", label: "Large phone", width: 412, height: 915 },
  { id: "xl", label: "XL phone", width: 430, height: 932 },
  { id: "xxl", label: "XXL phone", width: 480, height: 1040 },
];

function formatViewport(width, height) {
  return `${width}x${height}`;
}

const RUN_STAGE_DEFINITIONS = [
  { id: "boot", label: "Runtime boot" },
  { id: "discovery", label: "Route discovery" },
  { id: "routes", label: "Route loading" },
  { id: "visual", label: "Visual validation" },
  { id: "actions", label: "Action mapping" },
  { id: "briefing", label: "Operator brief" },
  { id: "finish", label: "Finalization" },
];

function createEmptyStageBoard() {
  return RUN_STAGE_DEFINITIONS.map((stage) => ({
    id: stage.id,
    label: stage.label,
    status: "idle",
    detail: "Waiting for this phase.",
    evidenceCount: 0,
    route: "",
    action: "",
    updatedAt: "",
  }));
}

function createInitialStageBoard(detail = "Preparing runtime.") {
  const board = createEmptyStageBoard();
  board[0] = {
    ...board[0],
    status: "active",
    detail,
    updatedAt: nowIso(),
  };
  return board;
}

function resolveEventStage(eventType) {
  switch (eventType) {
    case "runner_ready":
    case "runner_engine":
      return "boot";
    case "route_discovery_start":
    case "route_discovery_done":
    case "route_discovered":
      return "discovery";
    case "route_start":
    case "route_loaded":
    case "route_error":
      return "routes";
    case "layout_check_start":
    case "layout_check_issue":
      return "visual";
    case "button_sweep_skipped":
    case "button_route_skipped":
    case "button_click_start":
    case "button_click_result":
    case "button_click_skip":
    case "button_click_error":
      return "actions";
    case "assistant_hint_ready":
      return "briefing";
    case "runner_finished":
      return "finish";
    default:
      return "";
  }
}

function resolveTimelineStatus(event) {
  switch (event?.type) {
    case "route_error":
    case "button_click_error":
      return "failed";
    case "layout_check_issue":
      return "issue";
    case "route_discovery_done":
    case "route_loaded":
    case "button_click_result":
    case "button_click_skip":
    case "button_sweep_skipped":
    case "button_route_skipped":
    case "assistant_hint_ready":
    case "runner_finished":
      return "done";
    default:
      return "active";
  }
}

function buildTimelineDetail(event) {
  if (typeof event?.detail === "string" && event.detail.trim()) {
    return event.detail.trim();
  }
  if (typeof event?.route === "string" && event.route.trim()) {
    if (typeof event?.action === "string" && event.action.trim()) {
      return `${event.route} | ${event.action}`;
    }
    return event.route;
  }
  if (typeof event?.action === "string" && event.action.trim()) {
    return event.action;
  }
  return deriveProgressLabel(event?.type);
}

function buildTimelineEntry(event) {
  return {
    id: `${event?.type || "event"}-${event?.at || nowIso()}-${event?.routeIndex || 0}-${event?.labelIndex || 0}`,
    stage: resolveEventStage(event?.type),
    label: deriveProgressLabel(event?.type),
    status: resolveTimelineStatus(event),
    detail: buildTimelineDetail(event),
    route: typeof event?.route === "string" ? event.route : "",
    action: typeof event?.action === "string" ? event.action : "",
    at: String(event?.at || nowIso()),
  };
}

function updateStageBoardFromEvent(stageBoard, event) {
  const nextBoard = Array.isArray(stageBoard) ? stageBoard.map((item) => ({ ...item })) : createEmptyStageBoard();
  const stageId = resolveEventStage(event?.type);
  if (!stageId) return nextBoard;

  const currentIndex = RUN_STAGE_DEFINITIONS.findIndex((stage) => stage.id === stageId);
  nextBoard.forEach((stage, index) => {
    if (index < currentIndex && stage.status === "active") {
      stage.status = "done";
    }
  });

  const stage = nextBoard.find((item) => item.id === stageId);
  if (!stage) return nextBoard;

  stage.status = resolveTimelineStatus(event);
  stage.detail = buildTimelineDetail(event);
  stage.evidenceCount += 1;
  stage.route = typeof event?.route === "string" ? event.route : stage.route;
  stage.action = typeof event?.action === "string" ? event.action : stage.action;
  stage.updatedAt = String(event?.at || nowIso());
  return nextBoard;
}

function appendTimelineEvent(timeline, event) {
  const entry = buildTimelineEntry(event);
  return [entry, ...(Array.isArray(timeline) ? timeline : [])].slice(0, 24);
}

let auditState = {
  running: false,
  status: "idle",
  source: "native",
  baseUrl: "",
  mode: "desktop",
  scope: "full",
  depth: "signal",
  startedAt: "",
  finishedAt: "",
  durationMs: 0,
  lastCommand: "",
  lastError: "",
  usedFallback: false,
  lastSummary: null,
  progress: createEmptyAuditProgress(),
  liveReport: null,
  timeline: [],
  stageBoard: createEmptyStageBoard(),
};

function nowIso() {
  return new Date().toISOString();
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeFiniteNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getWindowStatePayload() {
  return {
    focused: !!mainWindow && !mainWindow.isDestroyed() && mainWindow.isFocused(),
    maximized: !!mainWindow && !mainWindow.isDestroyed() && mainWindow.isMaximized(),
    minimized: !!mainWindow && !mainWindow.isDestroyed() && mainWindow.isMinimized(),
  };
}

function notifyWindowState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("companion:window-state", getWindowStatePayload());
}

function notifyLiveReport(report) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("companion:live-report", report || null);
}

function writeBootstrapTrace(message) {
  try {
    fsSync.mkdirSync(path.dirname(BOOTSTRAP_TRACE_FILE), { recursive: true });
    fsSync.appendFileSync(BOOTSTRAP_TRACE_FILE, `[${nowIso()}] ${message}\n`, "utf8");
  } catch {}
}

writeBootstrapTrace(`main loaded | pid=${process.pid} | exec=${process.execPath}`);

if (IS_SMOKE_MODE) {
  const smokeUserData = path.join(os.tmpdir(), "sitepulse-desktop-smoke");
  app.setPath("userData", smokeUserData);
  writeBootstrapTrace(`smoke userData override=${smokeUserData}`);
}

function getDesktopLogFile() {
  if (desktopLogFile) return desktopLogFile;
  const logDir = path.join(app.getPath("userData"), "logs");
  fsSync.mkdirSync(logDir, { recursive: true });
  desktopLogFile = path.join(logDir, `desktop-${nowIso().slice(0, 10)}.log`);
  return desktopLogFile;
}

function getNodePathForRuntime() {
  return path.join(app.getAppPath(), "node_modules");
}

function summarizeReport(report) {
  const source = report && typeof report === "object" ? report : {};
  const summary = source.summary && typeof source.summary === "object" ? source.summary : {};
  const seo = source.seo && typeof source.seo === "object" ? source.seo : {};
  return {
    auditScope: String(summary.auditScope || source?.meta?.auditScope || auditState.scope || "full"),
    routesChecked: Number(summary.routesChecked || 0),
    buttonsChecked: Number(summary.buttonsChecked || 0),
    totalIssues: Number(summary.totalIssues || 0),
    seoScore: Number(summary.seoScore ?? seo.overallScore ?? 0),
    buttonsNoEffect: Number(summary.buttonsNoEffect || 0),
    visualSectionOrderInvalid: Number(summary.visualSectionOrderInvalid || 0),
    consoleErrors: Number(summary.consoleErrors || 0),
    seoCriticalIssues: Number(summary.seoCriticalIssues || 0),
  };
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).map((value) => String(value || "").trim()).filter(Boolean))];
}

function buildViewportTaggedIssue(issue, profile) {
  return {
    ...issue,
    viewportLabel: profile.label,
    viewport: formatViewport(profile.width, profile.height),
    viewportWidth: profile.width,
    viewportHeight: profile.height,
  };
}

function buildViewportTaggedAction(action, profile) {
  return {
    ...action,
    viewportLabel: profile.label,
    viewport: formatViewport(profile.width, profile.height),
    viewportWidth: profile.width,
    viewportHeight: profile.height,
  };
}

function buildViewportTaggedRoute(route, profile) {
  return {
    ...route,
    viewportLabel: profile.label,
    viewport: formatViewport(profile.width, profile.height),
    viewportWidth: profile.width,
    viewportHeight: profile.height,
  };
}

function buildMobileSweepPrompt(baseUrl, profileCount) {
  return [
    "Act as a senior QA and frontend engineer focused on mobile quality.",
    `The current SitePulse run aggregated ${profileCount} mobile viewport profiles for ${baseUrl}.`,
    "Prioritize regressions that only appear on one viewport family, then validate spacing, overflow, collisions and broken actions across the whole mobile surface.",
    "Do not apply cosmetic-only fixes. Preserve interaction quality, readability and viewport discipline.",
  ].join(" ");
}

function aggregateMobileSweepReport(input, successfulRuns, failedRuns, startedAt, finishedAt) {
  const successful = Array.isArray(successfulRuns) ? successfulRuns : [];
  const failed = Array.isArray(failedRuns) ? failedRuns : [];
  const summaries = successful.map((item) => ({
    profile: item.profile,
    summary: summarizeReport(item.report),
    report: item.report,
    command: String(item.command || ""),
  }));
  const successfulProfiles = summaries.map((item) => ({
    id: item.profile.id,
    label: item.profile.label,
    width: item.profile.width,
    height: item.profile.height,
    viewport: formatViewport(item.profile.width, item.profile.height),
    status: "ok",
    routesChecked: item.summary.routesChecked,
    actionsMapped: item.summary.buttonsChecked || item.summary.actionsMapped,
    totalIssues: item.summary.totalIssues,
    seoScore: item.summary.seoScore,
  }));
  const failedProfiles = failed.map((item) => ({
    id: item.profile.id,
    label: item.profile.label,
    width: item.profile.width,
    height: item.profile.height,
    viewport: formatViewport(item.profile.width, item.profile.height),
    status: "failed",
    routesChecked: 0,
    actionsMapped: 0,
    totalIssues: 1,
    seoScore: 0,
    error: String(item.detail || item.error || "profile_failed"),
  }));

  const issues = successful.flatMap((item) =>
    (Array.isArray(item.report?.issues) ? item.report.issues : []).map((issue) => buildViewportTaggedIssue(issue, item.profile)),
  );
  const actions = successful.flatMap((item) =>
    (Array.isArray(item.report?.actionSweep) ? item.report.actionSweep : []).map((action) =>
      buildViewportTaggedAction(action, item.profile),
    ),
  );
  const routes = successful.flatMap((item) =>
    (Array.isArray(item.report?.routeSweep) ? item.report.routeSweep : []).map((route) => buildViewportTaggedRoute(route, item.profile)),
  );

  failed.forEach((item, index) => {
    issues.push({
      id: `mobile-sweep-failed-${index + 1}`,
      code: "ROUTE_LOAD_FAIL",
      severity: "high",
      route: "/",
      action: `mobile_sweep:${item.profile.id}`,
      detail: `The ${item.profile.label} pass (${formatViewport(item.profile.width, item.profile.height)}) did not complete: ${String(item.detail || item.error || "profile_failed")}`,
      recommendedResolution: "Re-run the failing viewport in mobile single-device mode and inspect the live log to isolate the root cause.",
      viewportLabel: item.profile.label,
      viewport: formatViewport(item.profile.width, item.profile.height),
      viewportWidth: item.profile.width,
      viewportHeight: item.profile.height,
    });
  });

  const totalSeoScore = successfulProfiles.reduce((sum, item) => sum + item.seoScore, 0);
  const averageSeoScore = successfulProfiles.length ? Math.round(totalSeoScore / successfulProfiles.length) : 0;
  const routesChecked = summaries.reduce((max, item) => Math.max(max, item.summary.routesChecked), 0);
  const buttonsChecked = summaries.reduce((sum, item) => sum + item.summary.buttonsChecked, 0);
  const actionsMapped = summaries.reduce((sum, item) => sum + (item.summary.buttonsChecked || item.summary.actionsMapped), 0);
  const visualSectionOrderInvalid = summaries.reduce((sum, item) => sum + item.summary.visualSectionOrderInvalid, 0);
  const consoleErrors = summaries.reduce((sum, item) => sum + item.summary.consoleErrors, 0);
  const seoCriticalIssues = summaries.reduce((sum, item) => sum + item.summary.seoCriticalIssues, 0);
  const buttonsNoEffect = summaries.reduce((sum, item) => sum + item.summary.buttonsNoEffect, 0);
  const seoPagesAnalyzed = successful.reduce((sum, item) => {
    const pagesAnalyzed = item.report?.seo && typeof item.report.seo === "object" ? Number(item.report.seo.pagesAnalyzed || 0) : 0;
    return sum + (Number.isFinite(pagesAnalyzed) ? pagesAnalyzed : 0);
  }, 0);
  const preferredReplay =
    summaries.find((item) => item.profile.id === "medium")?.command ||
    summaries[0]?.command ||
    "";
  const topRecommendations = uniqueStrings(
    successful.flatMap((item) =>
      item.report?.seo && Array.isArray(item.report.seo.topRecommendations) ? item.report.seo.topRecommendations : [],
    ),
  ).slice(0, 10);
  const worstProfile = [...successfulProfiles, ...failedProfiles].sort((left, right) => right.totalIssues - left.totalIssues)[0] || null;
  const durationMs = Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime());

  return {
    meta: {
      baseUrl: input.baseUrl,
      startedAt,
      finishedAt,
      replayCommand: preferredReplay,
      auditMode: "mobile",
      auditDepth: input.fullAudit ? "deep" : "signal",
      viewport: "mobile-family",
      viewportLabel: "Mobile family sweep",
      mobileSweep: {
        id: normalizeMobileSweep(input.mobileSweep),
        label: "Mobile family sweep",
        profiles: [...successfulProfiles, ...failedProfiles],
      },
    },
    summary: {
      auditScope: input.scope,
      routesChecked,
      buttonsChecked,
      actionsMapped,
      totalIssues: issues.length,
      seoScore: averageSeoScore,
      seoCriticalIssues,
      seoTotalIssues: summaries.reduce(
        (sum, item) => sum + Number(item.report?.summary?.seoTotalIssues || item.report?.seo?.issues?.length || 0),
        0,
      ),
      seoPagesAnalyzed,
      buttonsNoEffect,
      visualSectionOrderInvalid,
      consoleErrors,
      durationMs,
      mobileProfilesAnalyzed: successfulProfiles.length,
    },
    routeSweep: routes,
    actionSweep: actions,
    issues,
    seo: {
      overallScore: averageSeoScore,
      pagesAnalyzed: seoPagesAnalyzed,
      topRecommendations,
    },
    assistantGuide: {
      status: issues.length > 0 ? "issues" : "clean",
      issueCount: issues.length,
      immediateSteps: uniqueStrings([
        worstProfile
          ? `Start with ${worstProfile.label} (${worstProfile.viewport}) because it currently carries the heaviest mobile pressure.`
          : "",
        failedProfiles.length ? "Re-run the failed viewport passes in single-device mode before treating the mobile family as stable." : "",
        "Fix issues that repeat across multiple mobile sizes before polishing isolated edge cases.",
      ]).slice(0, 6),
      replayCommand: preferredReplay,
      quickStartPrompt: buildMobileSweepPrompt(input.baseUrl, successfulProfiles.length + failedProfiles.length),
      routePriority: [],
    },
  };
}

function deriveProgressLabel(eventType) {
  const map = {
    runner_ready: "Preparing runtime",
    runner_engine: "Launching browser engine",
    route_discovery_start: "Discovering routes",
    route_discovery_done: "Route map ready",
    route_start: "Loading route",
    route_loaded: "Route loaded",
    route_error: "Route load failed",
    layout_check_start: "Checking visual structure",
    layout_check_issue: "Visual issue detected",
    button_sweep_skipped: "Skipping button sweep",
    button_route_skipped: "Action route skipped",
    button_click_start: "Testing action",
    button_click_result: "Action checked",
    button_click_skip: "Action skipped",
    button_click_error: "Action failed",
    assistant_hint_ready: "Writing operator brief",
    runner_finished: "Run finished",
  };
  return map[eventType] || "Running audit";
}

function deriveProgressPercent(event, currentProgress) {
  const totalRoutes = Math.max(0, safeFiniteNumber(event.totalRoutes, currentProgress.totalRoutes));
  const routeIndex = clampNumber(safeFiniteNumber(event.routeIndex, currentProgress.routeIndex), 0, Math.max(totalRoutes, 0));
  const totalLabels = Math.max(0, safeFiniteNumber(event.totalLabels, currentProgress.totalLabels));
  const labelIndex = clampNumber(safeFiniteNumber(event.labelIndex, currentProgress.labelIndex), 0, Math.max(totalLabels, 0));

  const routeBodyPercent = (() => {
    if (!totalRoutes) return 0;
    let routeFraction = Math.max(routeIndex - 1, 0);
    let innerFraction = 0;

    switch (event.type) {
      case "route_start":
        innerFraction = 0.08;
        break;
      case "route_loaded":
        innerFraction = 0.24;
        break;
      case "route_error":
        innerFraction = 1;
        break;
      case "layout_check_start":
        innerFraction = 0.38;
        break;
      case "layout_check_issue":
        innerFraction = 0.5;
        break;
      case "button_sweep_skipped":
      case "button_route_skipped":
        innerFraction = 1;
        break;
      case "button_click_start":
        innerFraction = totalLabels > 0 ? clampNumber(0.28 + ((Math.max(labelIndex - 1, 0) / totalLabels) * 0.62), 0, 0.94) : 0.64;
        break;
      case "button_click_result":
      case "button_click_skip":
      case "button_click_error":
        innerFraction = totalLabels > 0 ? clampNumber(0.34 + ((labelIndex / totalLabels) * 0.62), 0, 1) : 0.82;
        break;
      default:
        innerFraction = routeIndex > 0 ? 0.12 : 0;
        break;
    }

    routeFraction += innerFraction;
    return 20 + Math.round((routeFraction / totalRoutes) * 72);
  })();

  switch (event.type) {
    case "runner_ready":
      return 4;
    case "runner_engine":
      return 10;
    case "route_discovery_start":
      return 14;
    case "route_discovery_done":
      return 20;
    case "assistant_hint_ready":
      return 96;
    case "runner_finished":
      return 100;
    default:
      return clampNumber(routeBodyPercent || currentProgress.percentage || 0, 0, 99);
  }
}

function deriveProgressFromLiveEvent(event, currentProgress) {
  const totalRoutes = Math.max(0, safeFiniteNumber(event.totalRoutes, currentProgress.totalRoutes));
  const totalLabels = Math.max(0, safeFiniteNumber(event.totalLabels, currentProgress.totalLabels));
  const percentage = deriveProgressPercent(event, currentProgress);
  const currentRoute = typeof event.route === "string" ? event.route : currentProgress.currentRoute;
  const currentAction = typeof event.action === "string" ? event.action : currentProgress.currentAction;
  const detail = (() => {
    if (typeof event.detail === "string" && event.detail.trim()) return event.detail.trim();
    if (event.type === "button_click_start" && currentAction) {
      return `Route ${safeFiniteNumber(event.routeIndex, currentProgress.routeIndex)}/${totalRoutes || "?"} | action ${safeFiniteNumber(event.labelIndex, currentProgress.labelIndex)}/${totalLabels || "?"} | ${currentAction}`;
    }
    if (event.type === "route_start" && currentRoute) {
      return `Loading ${currentRoute} (${safeFiniteNumber(event.routeIndex, currentProgress.routeIndex)}/${totalRoutes || "?"})`;
    }
    return currentProgress.detail;
  })();

  return {
    percentage,
    phase: event.type || currentProgress.phase,
    phaseLabel: deriveProgressLabel(event.type),
    detail,
    routeIndex: safeFiniteNumber(event.routeIndex, currentProgress.routeIndex),
    totalRoutes,
    labelIndex: safeFiniteNumber(event.labelIndex, currentProgress.labelIndex),
    totalLabels,
    currentRoute,
    currentAction,
    lastEventType: event.type || currentProgress.lastEventType,
  };
}

function deriveProgressFromLiveReport(report, currentProgress) {
  const reportProgress = report?.progress && typeof report.progress === "object" ? report.progress : {};
  const summary = report?.summary && typeof report.summary === "object" ? report.summary : {};
  const routeSweep = Array.isArray(report?.routeSweep) ? report.routeSweep : [];
  const actionSweep = Array.isArray(report?.actionSweep) ? report.actionSweep : [];
  const seo = report?.seo && typeof report.seo === "object" ? report.seo : {};

  const totalRoutes = Math.max(0, safeFiniteNumber(reportProgress.totalRoutes, currentProgress.totalRoutes));
  const completedRoutes = clampNumber(
    safeFiniteNumber(reportProgress.nextRouteIndex, summary.routesChecked || currentProgress.routeIndex),
    0,
    Math.max(totalRoutes, 0),
  );
  const labelIndex = Math.max(0, safeFiniteNumber(reportProgress.nextLabelIndex, currentProgress.labelIndex));
  const currentRoute = (() => {
    const lastRoute = routeSweep[routeSweep.length - 1];
    if (lastRoute && typeof lastRoute.route === "string" && lastRoute.route.trim()) return lastRoute.route.trim();
    return currentProgress.currentRoute;
  })();
  const currentAction = (() => {
    const lastAction = actionSweep[actionSweep.length - 1];
    if (lastAction && typeof lastAction.label === "string" && lastAction.label.trim()) return lastAction.label.trim();
    return currentProgress.currentAction;
  })();

  const routeRatio = totalRoutes > 0 ? completedRoutes / totalRoutes : 0;
  const actionsObserved = Math.max(0, actionSweep.length, safeFiniteNumber(summary.buttonsChecked, 0), safeFiniteNumber(summary.actionsMapped, 0));
  const seoSignals = Math.max(0, safeFiniteNumber(seo.pagesAnalyzed, 0), Array.isArray(seo.issues) ? seo.issues.length : 0);
  const finished = !!String(report?.meta?.finishedAt || "").trim();

  let phase = "route_loaded";
  let percentage = totalRoutes > 0 ? 20 + Math.round(routeRatio * 68) : 18;
  let detail = currentRoute
    ? `Collecting evidence on ${currentRoute} (${Math.min(completedRoutes + (completedRoutes < totalRoutes ? 1 : 0), totalRoutes || 1)}/${totalRoutes || "?"})`
    : "The engine is collecting route evidence.";

  if (!routeSweep.length && completedRoutes === 0) {
    phase = "route_discovery_start";
    percentage = 14;
    detail = "Discovering the route map and preparing the crawl order.";
  }

  if (routeSweep.length > 0 || completedRoutes > 0) {
    phase = "route_loaded";
    percentage = Math.max(percentage, 24);
  }

  if (actionsObserved > 0 || labelIndex > 0) {
    phase = "button_click_result";
    percentage = Math.max(percentage, clampNumber(46 + Math.round(routeRatio * 38), 46, 92));
    detail = currentAction ? `Checking ${currentAction}${currentRoute ? ` on ${currentRoute}` : ""}.` : `Mapped ${actionsObserved} action(s) so far.`;
  }

  if (seoSignals > 0 && String(summary.auditScope || report?.meta?.auditScope || "full") === "seo") {
    phase = "assistant_hint_ready";
    percentage = Math.max(percentage, 78);
    detail = `SEO evaluation is consolidating ${seoSignals} live signal(s).`;
  }

  if (finished) {
    phase = "runner_finished";
    percentage = 100;
    detail = safeFiniteNumber(summary.totalIssues, 0) > 0 ? `Run completed with ${safeFiniteNumber(summary.totalIssues, 0)} issue(s).` : "Run completed clean.";
  }

  return {
    percentage: clampNumber(percentage, 0, finished ? 100 : 99),
    phase,
    phaseLabel: deriveProgressLabel(phase),
    detail,
    routeIndex: completedRoutes,
    totalRoutes,
    labelIndex,
    totalLabels: Math.max(currentProgress.totalLabels || 0, labelIndex),
    currentRoute,
    currentAction,
    lastEventType: phase,
  };
}

function buildSyntheticLiveEventFromReport(progress) {
  return {
    type: progress.phase || "route_loaded",
    detail: progress.detail,
    route: progress.currentRoute,
    action: progress.currentAction,
    routeIndex: progress.routeIndex,
    totalRoutes: progress.totalRoutes,
    labelIndex: progress.labelIndex,
    totalLabels: progress.totalLabels,
    at: nowIso(),
  };
}

function getActiveSweepContext() {
  const total = safeFiniteNumber(liveReportContext?.sweepProfileTotal, 0);
  const index = safeFiniteNumber(liveReportContext?.sweepProfileIndex, 0);
  if (total <= 1 || index <= 0) return null;
  return {
    total,
    index,
    label: String(liveReportContext?.sweepProfileLabel || "").trim(),
    viewport: String(liveReportContext?.sweepProfileViewport || "").trim(),
  };
}

function prefixSweepDetail(detail, context) {
  const prefixParts = [context?.label, context?.viewport].filter(Boolean);
  const prefix = prefixParts.join(" ");
  const text = String(detail || "").trim();
  if (!prefix) return text;
  if (!text) return prefix;
  return text.startsWith(prefix) ? text : `${prefix} | ${text}`;
}

function scaleProgressForSweep(progress) {
  const context = getActiveSweepContext();
  if (!context) return progress;

  const completedProfiles = Math.max(0, context.index - 1);
  const perProfileRatio = clampNumber(safeFiniteNumber(progress.percentage, 0), 0, 100) / 100;
  const scaled = 4 + Math.round(((completedProfiles + perProfileRatio) / context.total) * 92);
  const finished = progress.phase === "runner_finished" && context.index >= context.total;

  return {
    ...progress,
    percentage: clampNumber(scaled, 0, finished ? 100 : 99),
    detail: prefixSweepDetail(progress.detail, context),
    sweepProfileIndex: context.index,
    sweepProfileTotal: context.total,
    sweepProfileLabel: context.label,
    sweepProfileViewport: context.viewport,
    sweepProfilePercentage: clampNumber(safeFiniteNumber(progress.percentage, 0), 0, 100),
    sweepProfileStartedAtMs: safeFiniteNumber(liveReportContext?.startedAtMs, 0),
  };
}

function decorateEventForSweep(event) {
  const context = getActiveSweepContext();
  if (!context) return event;
  return {
    ...event,
    detail: prefixSweepDetail(event?.detail, context),
  };
}

function applyLiveReportProgress(report, options = {}) {
  if (!report || typeof report !== "object") return;
  const nextProgress = scaleProgressForSweep(
    deriveProgressFromLiveReport(report, auditState.progress || createEmptyAuditProgress()),
  );
  let nextTimeline = auditState.timeline || [];
  let nextStageBoard = auditState.stageBoard || createEmptyStageBoard();

  const snapshotKey = JSON.stringify([
    nextProgress.phase,
    nextProgress.routeIndex,
    nextProgress.totalRoutes,
    nextProgress.labelIndex,
    nextProgress.currentRoute,
    nextProgress.currentAction,
    safeFiniteNumber(report?.summary?.totalIssues, 0),
    safeFiniteNumber(report?.summary?.seoScore, 0),
    String(report?.meta?.finishedAt || ""),
  ]);

    if (options.source === "cmd" && liveReportContext?.lastSnapshotKey !== snapshotKey) {
    liveReportContext = {
      ...(liveReportContext || {}),
      lastSnapshotKey: snapshotKey,
    };
    const syntheticEvent = decorateEventForSweep(buildSyntheticLiveEventFromReport(nextProgress));
    nextTimeline = appendTimelineEvent(nextTimeline, syntheticEvent);
    nextStageBoard = updateStageBoardFromEvent(nextStageBoard, syntheticEvent);
  }

  auditState = {
    ...auditState,
    progress: nextProgress,
    timeline: nextTimeline,
    stageBoard: nextStageBoard,
  };
  notifyState();
}

function setAuditState(patch) {
  auditState = {
    ...auditState,
    ...patch,
  };
  notifyState();
}

function applyLiveAuditEvent(event) {
  if (!event || typeof event !== "object") return;
  const decoratedEvent = decorateEventForSweep(event);
  auditState = {
    ...auditState,
    progress: scaleProgressForSweep(
      deriveProgressFromLiveEvent(decoratedEvent, auditState.progress || createEmptyAuditProgress()),
    ),
    timeline: appendTimelineEvent(auditState.timeline, decoratedEvent),
    stageBoard: updateStageBoardFromEvent(auditState.stageBoard, decoratedEvent),
  };
  notifyState();
}

function setLiveReport(report, options = {}) {
  const nextReport = report && typeof report === "object" ? report : null;
  auditState = {
    ...auditState,
    liveReport: nextReport,
  };
  if (options.notifyState !== false) {
    notifyState();
  }
  if (options.notifyRenderer !== false) {
    notifyLiveReport(nextReport);
  }
}

function pushLog(line) {
  const formatted = `[${new Date().toLocaleTimeString()}] ${line}`;
  logLines.unshift(formatted);
  if (logLines.length > 400) logLines.length = 400;
  try {
    fsSync.appendFileSync(getDesktopLogFile(), `${formatted}\n`, "utf8");
  } catch {}
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("companion:log", formatted);
    mainWindow.webContents.send("companion:state", getStatePayload());
  }
}

function notifyState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("companion:state", getStatePayload());
}

function buildAuditRunKey(descriptor = {}) {
  return [
    String(descriptor.baseUrl || "").trim(),
    String(descriptor.startedAt || "").trim(),
    String(descriptor.mode || "").trim(),
    String(descriptor.scope || "").trim(),
    String(descriptor.depth || "").trim(),
    String(descriptor.source || "").trim(),
  ].join("|");
}

function resolveBundledQaDir() {
  const packaged = path.join(process.resourcesPath, "app.asar.unpacked", "runtime-source", "qa");
  const dev = path.resolve(__dirname, "..", "runtime-source", "qa");
  return app.isPackaged ? packaged : dev;
}

function getCheckpointPathForMode(mode = "desktop") {
  if (!reportsDir) return "";
  return path.join(reportsDir, mode === "mobile" ? "default-mobile-checkpoint.json" : "default-checkpoint.json");
}

function getCmdStatePathForMode(mode = "desktop") {
  if (!reportsDir) return "";
  return path.join(reportsDir, mode === "mobile" ? "default-mobile-cmd-state.txt" : "default-cmd-state.txt");
}

function parseIsoMs(value) {
  if (!value) return 0;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

async function statMaybe(filePath) {
  if (!filePath) return null;
  try {
    return await fs.stat(filePath);
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function readCheckpointReport(checkpointPath) {
  if (!checkpointPath) return null;
  let lastError = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const raw = await fs.readFile(checkpointPath, "utf8");
      if (!raw.trim()) return null;
      const payload = JSON.parse(raw);
      if (!payload || typeof payload !== "object" || !payload.report || typeof payload.report !== "object") {
        return null;
      }
      return payload.report;
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") {
        return null;
      }
      lastError = error;
      const message = error instanceof Error ? error.message : String(error || "unknown");
      const retryableSyntax = /unexpected end of json input|unterminated string/i.test(message);
      if (!retryableSyntax || attempt === 3) {
        pushLog(`[audit] live snapshot read failed: ${message}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 90 * (attempt + 1)));
    }
  }
  if (lastError) {
    pushLog(`[audit] live snapshot read failed: ${lastError instanceof Error ? lastError.message : String(lastError || "unknown")}`);
  }
  return null;
}

async function readTextMaybe(filePath) {
  if (!filePath) return "";
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

async function readJsonMaybe(filePath) {
  const raw = await readTextMaybe(filePath);
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function matchesFinalReportContext(report, context = {}) {
  if (!report || typeof report !== "object") return false;

  const reportBaseUrl = String(report?.meta?.baseUrl || "").trim();
  if (context.baseUrl && reportBaseUrl && reportBaseUrl !== context.baseUrl) {
    return false;
  }

  const finishedMs = parseIsoMs(report?.meta?.finishedAt);
  if (context.startedAtMs && finishedMs && finishedMs + 1500 < context.startedAtMs) {
    return false;
  }

  return true;
}

async function findLatestFinalReportJson(context = {}) {
  if (!reportsDir) {
    await ensureQaRuntime();
  }

  const entries = await fs.readdir(reportsDir, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/-sitepulse-report-final\.json$/i.test(entry.name)) continue;
    const fullPath = path.join(reportsDir, entry.name);
    const stats = await fs.stat(fullPath);
    if (context.startedAtMs && stats.mtimeMs + 1500 < context.startedAtMs) continue;
    candidates.push({ path: fullPath, mtimeMs: stats.mtimeMs });
  }

  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);

  for (const candidate of candidates.slice(0, 10)) {
    const report = await readJsonMaybe(candidate.path);
    if (matchesFinalReportContext(report, context)) {
      return {
        path: candidate.path,
        mtimeMs: candidate.mtimeMs,
        report,
      };
    }
  }

  return null;
}

function finalizeCmdAuditState(report, context) {
  const summary = summarizeReport(report);
  const finalProgress = deriveProgressFromLiveReport(report, auditState.progress || createEmptyAuditProgress());
  const finishedAt = String(report?.meta?.finishedAt || nowIso());
  const detail = summary.totalIssues > 0 ? `Run completed with ${summary.totalIssues} issue(s).` : "Run completed clean.";

  stopLiveReportPolling({
    preserveSnapshot: true,
    notifyState: false,
    notifyRenderer: false,
  });
  setLiveReport(report, {
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: false,
    status: summary.totalIssues > 0 ? "issues" : "clean",
    finishedAt,
    durationMs: Math.max(0, Date.now() - (context.startedAtMs || Date.now())),
    lastCommand: context.recommendedCommand || auditState.lastCommand || "",
    lastSummary: summary,
    lastError: "",
    progress: {
      ...finalProgress,
      percentage: 100,
      phase: "runner_finished",
      phaseLabel: "Run finished",
      detail,
    },
    timeline: [
      {
        id: `cmd-finished-${finishedAt}`,
        stage: "finish",
        label: "Run finished",
        status: "done",
        detail,
        route: finalProgress.currentRoute || "",
        action: finalProgress.currentAction || "",
        at: finishedAt,
      },
      ...(auditState.timeline || []),
    ].slice(0, 24),
    stageBoard: updateStageBoardFromEvent(auditState.stageBoard, {
      type: "runner_finished",
      detail,
      route: finalProgress.currentRoute || "",
      action: finalProgress.currentAction || "",
      at: finishedAt,
    }),
  });
  pushLog(`[cmd] run finished | issues=${summary.totalIssues} | seo=${summary.seoScore}`);
}

function failCmdAuditState(detail, context) {
  const failedAt = nowIso();
  stopLiveReportPolling({
    preserveSnapshot: true,
  });
  setAuditState({
    running: false,
    status: "failed",
    finishedAt: failedAt,
    durationMs: Math.max(0, Date.now() - (context.startedAtMs || Date.now())),
    lastCommand: context.recommendedCommand || auditState.lastCommand || "",
    lastError: detail,
    timeline: [
      {
        id: `cmd-failed-${failedAt}`,
        stage: "finish",
        label: "CMD flow failed",
        status: "failed",
        detail,
        route: "",
        action: "",
        at: failedAt,
      },
      ...(auditState.timeline || []),
    ].slice(0, 24),
    progress: {
      ...(auditState.progress || createEmptyAuditProgress()),
      phase: "failed",
      phaseLabel: "Run failed",
      detail,
    },
    stageBoard: updateStageBoardFromEvent(auditState.stageBoard, {
      type: "runner_finished",
      detail,
      at: failedAt,
    }).map((stage) => (stage.id === "finish" ? { ...stage, status: "failed", detail } : stage)),
  });
  pushLog(`[cmd] run failed: ${detail}`);
}

async function refreshLiveReportSnapshot() {
  if ((!liveReportCheckpointPath && !liveReportContext?.cmdStatePath) || liveReportReadInFlight) return;
  liveReportReadInFlight = true;
  try {
    const context = liveReportContext ? { ...liveReportContext } : null;
    const stats = await statMaybe(liveReportCheckpointPath);
    if (stats && stats.isFile() && stats.mtimeMs > liveReportLastMtimeMs) {
      const report = await readCheckpointReport(liveReportCheckpointPath);
      if (report) {
        liveReportLastMtimeMs = stats.mtimeMs;
        setLiveReport(report, {
          notifyState: true,
          notifyRenderer: true,
        });
        if (context?.source === "cmd" && auditState.running === true) {
          applyLiveReportProgress(report, { source: "cmd" });
        }
      }
    }

    if (context?.source === "cmd" && auditState.running === true) {
      const cmdStateStats = await statMaybe(context.cmdStatePath);
      if (cmdStateStats && cmdStateStats.isFile() && (!context.startedAtMs || cmdStateStats.mtimeMs + 250 >= context.startedAtMs)) {
        const cmdStateRaw = String(await readTextMaybe(context.cmdStatePath)).trim();
        if (cmdStateRaw) {
          liveReportContext = {
            ...(liveReportContext || context),
            cmdStateValue: cmdStateRaw,
            cmdStateMtimeMs: cmdStateStats.mtimeMs,
          };

          if (cmdStateRaw.startsWith("finished|")) {
            const exitCode = safeFiniteNumber(cmdStateRaw.split("|")[1], 0);
            const finalArtifact = await findLatestFinalReportJson({
              baseUrl: context.baseUrl,
              startedAtMs: context.startedAtMs,
            });

            if (finalArtifact?.report) {
              finalizeCmdAuditState(finalArtifact.report, context);
              return;
            }

            const finishedAtMs = liveReportContext?.cmdFinishedAtMs || cmdStateStats.mtimeMs;
            liveReportContext = {
              ...(liveReportContext || context),
              cmdFinishedAtMs: finishedAtMs,
            };

            if (exitCode !== 0 || Date.now() - finishedAtMs > 6000) {
              const detail =
                exitCode !== 0
                  ? `CMD flow exited with code ${exitCode}. Review the external terminal output.`
                  : "CMD flow finished but the final report was not found in time.";
              failCmdAuditState(detail, context);
            }
          }
        }
      }
    }
  } finally {
    liveReportReadInFlight = false;
  }
}

async function startLiveReportPolling(mode = "desktop", options = {}) {
  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: false,
  });
  if (!reportsDir) {
    await ensureQaRuntime();
  }

  liveReportCheckpointPath = getCheckpointPathForMode(mode);
  const existing = await statMaybe(liveReportCheckpointPath);
  liveReportLastMtimeMs = existing?.mtimeMs || 0;
  liveReportReadInFlight = false;
  liveReportContext = {
    source: options.source || "native",
    mode,
    baseUrl: String(options.baseUrl || "").trim(),
    scope: String(options.scope || "").trim(),
    depth: String(options.depth || "").trim(),
    startedAtMs: Number.isFinite(options.startedAtMs) ? Number(options.startedAtMs) : Date.now(),
    recommendedCommand: String(options.recommendedCommand || "").trim(),
    cmdStatePath: String(options.cmdStatePath || (options.source === "cmd" ? getCmdStatePathForMode(mode) : "")).trim(),
    sweepProfileIndex: Number.isFinite(options.sweepProfileIndex) ? Number(options.sweepProfileIndex) : 0,
    sweepProfileTotal: Number.isFinite(options.sweepProfileTotal) ? Number(options.sweepProfileTotal) : 0,
    sweepProfileLabel: String(options.sweepProfileLabel || "").trim(),
    sweepProfileViewport: String(options.sweepProfileViewport || "").trim(),
    lastSnapshotKey: "",
    cmdStateValue: "",
    cmdFinishedAtMs: 0,
  };
  liveReportPoller = setInterval(() => {
    void refreshLiveReportSnapshot();
  }, 700);
}

function stopLiveReportPolling(options = {}) {
  if (liveReportPoller) {
    clearInterval(liveReportPoller);
    liveReportPoller = null;
  }
  liveReportCheckpointPath = "";
  liveReportLastMtimeMs = 0;
  liveReportReadInFlight = false;
  liveReportContext = null;
  if (options.preserveSnapshot === true) return;
  setLiveReport(null, {
    notifyState: options.notifyState !== false,
    notifyRenderer: options.notifyRenderer !== false,
  });
}

async function copyPathRobust(sourcePath, targetPath, options = {}) {
  const retries = Number.isFinite(options.retries) ? options.retries : 4;
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      await fs.cp(sourcePath, targetPath, {
        recursive: true,
        force: true,
        verbatimSymlinks: true,
      });
      return;
    } catch (error) {
      lastError = error;
      const code = error && typeof error === "object" ? error.code : "";
      const retryable = ["ENOENT", "EPERM", "EBUSY"].includes(code);
      if (!retryable || attempt === retries) {
        throw lastError;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw lastError;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const QA_RUNTIME_SIGNATURE_PATH = ".sitepulse-runtime-signature.json";

function getQaRuntimeIntegrityEntries(sourceDir, targetDir) {
  return [
    {
      label: "src",
      source: path.join(sourceDir, "src"),
      target: path.join(targetDir, "src"),
      probe: path.join(targetDir, "src", "local-bridge-core.mjs"),
    },
    {
      label: "shared",
      source: path.join(sourceDir, "shared"),
      target: path.join(targetDir, "shared"),
      probe: path.join(targetDir, "shared", "windows-cmd-launch.js"),
    },
    {
      label: "audit.default.json",
      source: path.join(sourceDir, "audit.default.json"),
      target: path.join(targetDir, "audit.default.json"),
      probe: path.join(targetDir, "audit.default.json"),
    },
  ];
}

async function getQaRuntimeSignature(sourceDir) {
  const relativePaths = [
    "package.json",
    "package-lock.json",
    path.join("src", "index.mjs"),
    path.join("src", "local-bridge-core.mjs"),
    path.join("shared", "windows-cmd-launch.js"),
    "audit.default.json",
  ];

  const files = [];
  for (const relativePath of relativePaths) {
    const absolutePath = path.join(sourceDir, relativePath);
    try {
      const stats = await fs.stat(absolutePath);
      files.push({
        path: relativePath.replace(/\\/g, "/"),
        size: stats.size,
        mtimeMs: Math.trunc(stats.mtimeMs),
      });
    } catch (error) {
      if (error && typeof error === "object" && error.code === "ENOENT") continue;
      throw error;
    }
  }

  return JSON.stringify({ files });
}

async function readQaRuntimeSignature(targetDir) {
  const signaturePath = path.join(targetDir, QA_RUNTIME_SIGNATURE_PATH);
  try {
    return await fs.readFile(signaturePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return "";
    }
    throw error;
  }
}

async function writeQaRuntimeSignature(targetDir, signature) {
  const signaturePath = path.join(targetDir, QA_RUNTIME_SIGNATURE_PATH);
  await fs.writeFile(signaturePath, signature, "utf8");
}

async function syncQaRuntimeInPlace(sourceDir, targetDir) {
  const entries = await fs.readdir(sourceDir);
  for (const entry of entries) {
    const from = path.join(sourceDir, entry);
    const to = path.join(targetDir, entry);
    await copyPathRobust(from, to);
  }
}

async function ensureQaRuntimeIntegrity(sourceDir, targetDir) {
  const repaired = [];
  for (const entry of getQaRuntimeIntegrityEntries(sourceDir, targetDir)) {
    if (await pathExists(entry.probe)) continue;
    await copyPathRobust(entry.source, entry.target);
    repaired.push(entry.label);
  }

  if (repaired.length) {
    pushLog(`[runtime] repaired missing runtime entries: ${repaired.join(", ")}`);
  }
}

async function ensureQaRuntime() {
  const sourceDir = resolveBundledQaDir();
  const targetDir = path.join(app.getPath("userData"), "qa-runtime");
  await fs.mkdir(targetDir, { recursive: true });

  const sourceSignature = await getQaRuntimeSignature(sourceDir);
  const targetSignature = await readQaRuntimeSignature(targetDir);
  const needsSync = sourceSignature !== targetSignature;

  if (needsSync) {
    pushLog("[runtime] syncing QA runtime in place...");
    await syncQaRuntimeInPlace(sourceDir, targetDir);
  }
  await ensureQaRuntimeIntegrity(sourceDir, targetDir);
  await writeQaRuntimeSignature(targetDir, sourceSignature);
  qaRuntimeDir = targetDir;
  reportsDir = path.join(targetDir, "reports");
  await fs.mkdir(reportsDir, { recursive: true });
  pushLog(`[runtime] QA runtime preparado em ${qaRuntimeDir}`);
}

async function loadBridgeCore() {
  const modulePath = path.join(qaRuntimeDir, "src", "local-bridge-core.mjs");
  return await import(pathToFileURL(modulePath).href);
}

async function runLearningAdmin(action, payload = {}) {
  if (!qaRuntimeDir) {
    await ensureQaRuntime();
  }

  const modulePath = path.join(qaRuntimeDir, "src", "issue-learning-admin.mjs");
  const input = JSON.stringify(payload);
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [modulePath, action], {
      cwd: qaRuntimeDir,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        NODE_PATH: getNodePathForRuntime(),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error((stderr || stdout || `learning_admin_failed_${code}`).trim()));
        return;
      }
      try {
        resolve(JSON.parse(stdout || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.end(input);
  });
}

async function runHealingAdmin(action, payload = {}) {
  if (!qaRuntimeDir) {
    await ensureQaRuntime();
  }

  const modulePath = path.join(qaRuntimeDir, "src", "healing-admin.mjs");
  const input = JSON.stringify(payload);
  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [modulePath, action], {
      cwd: qaRuntimeDir,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        NODE_PATH: getNodePathForRuntime(),
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error((stderr || stdout || `healing_admin_failed_${code}`).trim()));
        return;
      }
      try {
        resolve(JSON.parse(stdout || "{}"));
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.end(input);
  });
}

async function startBridge() {
  if (bridgeHandle) return { ok: true, alreadyRunning: true };
  if (!qaRuntimeDir) {
    await ensureQaRuntime();
  }

  const { startLocalBridgeServer } = await loadBridgeCore();
  bridgeHandle = await startLocalBridgeServer({
    host: BRIDGE_HOST,
    port: BRIDGE_PORT,
    qaDir: qaRuntimeDir,
    serviceName: "sitepulse-desktop-bridge",
    nodeExecPath: process.execPath,
    runAsNode: true,
    extraEnv: {
      NODE_PATH: getNodePathForRuntime(),
    },
    recommendedCommandFactory() {
      return "Use o SitePulse Studio aberto e rode a auditoria completa pelo proprio programa.";
    },
    liveEvent(event) {
      applyLiveAuditEvent(event);
    },
    logger(message) {
      pushLog(message);
    },
  });
  pushLog(`[bridge] iniciado em http://${BRIDGE_HOST}:${BRIDGE_PORT}`);
  notifyState();
  return { ok: true };
}

async function stopBridge() {
  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: true,
  });
  if (!bridgeHandle) return { ok: true, alreadyStopped: true };
  await bridgeHandle.stop();
  bridgeHandle = null;
  pushLog("[bridge] encerrado");
  notifyState();
  return { ok: true };
}

async function postBridgeJson(pathname, payload) {
  if (!bridgeHandle) {
    await startBridge();
  }

  const response = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  try {
    return {
      status: response.status,
      payload: JSON.parse(rawText),
    };
  } catch {
    return {
      status: response.status,
      payload: {
        ok: false,
        error: "invalid_bridge_response",
        detail: rawText.slice(0, 1400),
      },
    };
  }
}

async function requestBridgeCancel() {
  if (!bridgeHandle) {
    await startBridge();
  }

  const response = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}/cancel-run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({ requestedAt: nowIso() }),
  });

  const rawText = await response.text();
  try {
    return {
      status: response.status,
      payload: JSON.parse(rawText),
    };
  } catch {
    return {
      status: response.status,
      payload: {
        ok: false,
        error: "invalid_bridge_response",
        detail: rawText.slice(0, 1400),
      },
    };
  }
}

async function findLatestReportArtifact() {
  if (!reportsDir) {
    await ensureQaRuntime();
  }

  const candidates = [];
  const queue = [reportsDir];
  while (queue.length) {
    const currentDir = queue.shift();
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === "visual-evidence") {
          queue.push(fullPath);
        }
        continue;
      }
      if (!entry.isFile()) continue;
      if (!/\.png$/i.test(entry.name)) {
        continue;
      }
      const stats = await fs.stat(fullPath);
      candidates.push({ path: fullPath, mtimeMs: stats.mtimeMs });
    }
  }

  candidates.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return candidates[0] || null;
}

async function pickReportFile() {
  const selection = await dialog.showOpenDialog(mainWindow || undefined, {
    title: "Load SitePulse report",
    properties: ["openFile"],
    filters: [
      { name: "SitePulse report", extensions: ["json"] },
      { name: "All files", extensions: ["*"] },
    ],
  });

  if (selection.canceled || !selection.filePaths.length) {
    return { ok: false, error: "file_pick_cancelled" };
  }

  const selectedPath = selection.filePaths[0];
  const raw = await fs.readFile(selectedPath, "utf8");
  const report = JSON.parse(raw);
  return {
    ok: true,
    path: selectedPath,
    report,
  };
}

async function exportReportFile(reportPayload) {
  const selection = await dialog.showSaveDialog(mainWindow || undefined, {
    title: "Export SitePulse snapshot",
    defaultPath: path.join(app.getPath("documents"), `sitepulse-snapshot-${nowIso().replace(/[:.]/g, "-")}.json`),
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (selection.canceled || !selection.filePath) {
    return { ok: false, error: "file_save_cancelled" };
  }

  await fs.writeFile(selection.filePath, `${JSON.stringify(reportPayload, null, 2)}\n`, "utf8");
  return {
    ok: true,
    path: selection.filePath,
  };
}

async function runSingleAuditViaBridge(input, options = {}) {
  const startedAt = nowIso();
  const runKey = buildAuditRunKey({
    baseUrl: input.baseUrl,
    startedAt,
    mode: input.mode,
    scope: input.scope,
    depth: input.fullAudit ? "deep" : "signal",
    source: "native",
  });

  stopLiveReportPolling({
    preserveSnapshot: options.preserveSnapshot === true,
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: true,
    status: "running",
    source: "native",
    baseUrl: input.baseUrl,
    mode: input.mode,
    scope: input.scope,
    depth: input.fullAudit ? "deep" : "signal",
    startedAt,
    finishedAt: "",
    durationMs: 0,
    lastError: "",
    lastCommand: "",
    usedFallback: false,
    progress: {
      ...createEmptyAuditProgress(),
      phase: "boot",
      phaseLabel: options.resumedFromCheckpoint === true ? "Resuming from checkpoint" : "Preparing runtime",
      detail:
        options.resumedFromCheckpoint === true
          ? `Checkpoint detected. Resuming a lighter audit for ${input.baseUrl}`
          : `Preparing audit for ${input.baseUrl}`,
      percentage: options.resumedFromCheckpoint === true ? 6 : 2,
    },
    liveReport: options.preserveSnapshot === true ? auditState.liveReport : null,
    timeline: [
      {
        id: `run-start-${startedAt}`,
        stage: "boot",
        label: options.resumedFromCheckpoint === true ? "Run resumed" : "Run scheduled",
        status: "active",
        detail:
          options.resumedFromCheckpoint === true
            ? `Resuming audit for ${input.baseUrl} from the preserved checkpoint.`
            : `Preparing audit for ${input.baseUrl}`,
        route: "",
        action: "",
        at: startedAt,
      },
      ...(options.preserveSnapshot === true ? (auditState.timeline || []) : []),
    ],
    stageBoard: options.preserveSnapshot === true
      ? updateStageBoardFromEvent(auditState.stageBoard, {
          type: "runner_ready",
          detail: `Resuming audit for ${input.baseUrl} from the preserved checkpoint.`,
          at: startedAt,
        })
      : createInitialStageBoard(`Preparing audit for ${input.baseUrl}`),
  });
  pushLog(
    options.resumedFromCheckpoint === true
      ? `[audit] retomando checkpoint ${input.mode}/${input.scope} para ${input.baseUrl}`
      : `[audit] iniciando ${input.mode}/${input.scope} para ${input.baseUrl}`,
  );

  try {
    await startLiveReportPolling(input.mode, {
      source: "native",
      baseUrl: input.baseUrl,
      scope: input.scope,
      depth: input.fullAudit ? "deep" : "signal",
      startedAtMs: new Date(startedAt).getTime(),
    });
    const { status, payload } = await postBridgeJson("/run", {
      ...input,
      fresh: options.fresh !== false,
      resume: options.resume !== false,
    });
    const finishedAt = nowIso();
    const durationMs = Date.now() - new Date(startedAt).getTime();

    if (payload?.ok) {
      if (fastResumePlan?.runKey === runKey) {
        fastResumePlan = null;
      }
      const summary = summarizeReport(payload.report);
      stopLiveReportPolling({
        preserveSnapshot: true,
        notifyState: false,
        notifyRenderer: false,
      });
      setAuditState({
        running: false,
        status: summary.totalIssues > 0 ? "issues" : "clean",
        depth: input.fullAudit ? "deep" : "signal",
        finishedAt,
        durationMs,
        lastCommand: String(payload.command || ""),
        usedFallback: payload.usedFallback === true,
        lastSummary: summary,
        lastError: "",
        progress: {
          ...(auditState.progress || createEmptyAuditProgress()),
          percentage: 100,
          phase: "runner_finished",
          phaseLabel: "Run finished",
          detail: summary.totalIssues > 0 ? `Run completed with ${summary.totalIssues} issue(s).` : "Run completed clean.",
        },
      });
      pushLog(`[audit] concluida | issues=${summary.totalIssues} | seo=${summary.seoScore}`);
      return payload;
    }

    if (payload?.paused === true && payload?.report) {
      const summary = summarizeReport(payload.report);
      stopLiveReportPolling({
        preserveSnapshot: true,
        notifyState: false,
        notifyRenderer: false,
      });

      const shouldResumeFast = fastResumePlan?.runKey === runKey;
      if (shouldResumeFast) {
        const nextPlan = fastResumePlan;
        fastResumePlan = null;
        const handoffAt = nowIso();
        setLiveReport(payload.report, {
          notifyState: false,
          notifyRenderer: false,
        });
        setAuditState({
          running: true,
          status: "running",
          source: "native",
          baseUrl: nextPlan.input.baseUrl,
          mode: nextPlan.input.mode,
          scope: nextPlan.input.scope,
          depth: nextPlan.input.fullAudit ? "deep" : "signal",
          finishedAt: "",
          durationMs: 0,
          lastError: "",
          lastCommand: "",
          progress: {
            ...(auditState.progress || createEmptyAuditProgress()),
            phase: "resume_handoff",
            phaseLabel: "Switching to fast mode",
            detail: "Checkpoint saved. Resuming the audit with a lighter profile without discarding collected evidence.",
            percentage: Math.max(8, safeFiniteNumber(auditState?.progress?.percentage, 0)),
          },
          timeline: [
            {
              id: `fast-handoff-${handoffAt}`,
              stage: "finish",
              label: "Fast mode handoff",
              status: "active",
              detail: "Checkpoint saved. Resuming the audit with a lighter profile.",
              route: "",
              action: "",
              at: handoffAt,
            },
            ...(auditState.timeline || []),
          ].slice(0, 24),
        });
        pushLog("[audit] checkpoint preservado. retomando em fast mode.");
        return await runSingleAuditViaBridge(nextPlan.input, {
          fresh: false,
          resume: true,
          preserveSnapshot: true,
          resumedFromCheckpoint: true,
        });
      }

      setLiveReport(payload.report, {
        notifyState: false,
        notifyRenderer: false,
      });
      setAuditState({
        running: false,
        status: "paused",
        source: "native",
        depth: input.fullAudit ? "deep" : "signal",
        finishedAt,
        durationMs,
        lastCommand: String(payload.command || ""),
        usedFallback: payload.usedFallback === true,
        lastSummary: summary,
        lastError: "",
        progress: {
          ...(auditState.progress || createEmptyAuditProgress()),
          phase: "paused",
          phaseLabel: "Run paused",
          detail: "Checkpoint saved. Resume the audit to continue without losing the evidence already collected.",
        },
      });
      pushLog(`[audit] pausada | issues=${summary.totalIssues} | seo=${summary.seoScore}`);
      return payload;
    }

    const detail = String(payload?.detail || payload?.error || `bridge_status_${status}`);
    if (fastResumePlan?.runKey === runKey) {
      fastResumePlan = null;
    }
    stopLiveReportPolling({
      preserveSnapshot: true,
    });
    setAuditState({
      running: false,
      status: "failed",
      depth: input.fullAudit ? "deep" : "signal",
      finishedAt,
      durationMs,
      lastCommand: String(payload?.command || ""),
      usedFallback: payload?.usedFallback === true,
      lastError: detail,
      timeline: [
        {
          id: `run-failed-${finishedAt}`,
          stage: "finish",
          label: "Run failed",
          status: "failed",
          detail,
          route: "",
          action: "",
          at: finishedAt,
        },
        ...(auditState.timeline || []),
      ].slice(0, 24),
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "failed",
        phaseLabel: "Run failed",
        detail,
      },
      stageBoard: updateStageBoardFromEvent(auditState.stageBoard, {
        type: "runner_finished",
        detail,
        at: finishedAt,
      }).map((stage) => (stage.id === "finish" ? { ...stage, status: "failed", detail } : stage)),
    });
    pushLog(`[audit] falhou: ${detail}`);
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "audit_failed");
    if (fastResumePlan?.runKey === runKey) {
      fastResumePlan = null;
    }
    stopLiveReportPolling({
      preserveSnapshot: true,
    });
    setAuditState({
      running: false,
      status: "failed",
      depth: input.fullAudit ? "deep" : "signal",
      finishedAt: nowIso(),
      durationMs: Date.now() - new Date(startedAt).getTime(),
      lastError: message,
      timeline: [
        {
          id: `run-failed-${nowIso()}`,
          stage: "finish",
          label: "Run failed",
          status: "failed",
          detail: message,
          route: "",
          action: "",
          at: nowIso(),
        },
        ...(auditState.timeline || []),
      ].slice(0, 24),
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "failed",
        phaseLabel: "Run failed",
        detail: message,
      },
      stageBoard: updateStageBoardFromEvent(auditState.stageBoard, {
        type: "runner_finished",
        detail: message,
        at: nowIso(),
      }).map((stage) => (stage.id === "finish" ? { ...stage, status: "failed", detail: message } : stage)),
    });
    pushLog(`[audit] falhou: ${message}`);
    return {
      ok: false,
      error: "audit_failed",
      detail: message,
    };
  }
}

async function runMobileFamilyAudit(input) {
  const startedAt = nowIso();
  const startedAtMs = new Date(startedAt).getTime();
  const profiles = MOBILE_FAMILY_PROFILES;
  const successfulRuns = [];
  const failedRuns = [];

  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: true,
    status: "running",
    source: "native",
    baseUrl: input.baseUrl,
    mode: "mobile",
    scope: input.scope,
    depth: input.fullAudit ? "deep" : "signal",
    startedAt,
    finishedAt: "",
    durationMs: 0,
    lastError: "",
    lastCommand: "",
    usedFallback: false,
    progress: {
      ...createEmptyAuditProgress(),
      phase: "boot",
      phaseLabel: "Preparing mobile family",
      detail: `Preparing a ${profiles.length}-profile mobile family sweep for ${input.baseUrl}`,
      percentage: 2,
    },
    liveReport: null,
    timeline: [
      {
        id: `mobile-family-start-${startedAt}`,
        stage: "boot",
        label: "Mobile family scheduled",
        status: "active",
        detail: `Preparing ${profiles.length} mobile viewport passes for ${input.baseUrl}`,
        route: "",
        action: "",
        at: startedAt,
      },
    ],
    stageBoard: createInitialStageBoard(`Preparing ${profiles.length} mobile viewport passes for ${input.baseUrl}`),
  });
  pushLog(`[audit] starting mobile family sweep | scope=${input.scope} | depth=${input.fullAudit ? "deep" : "signal"} | target=${input.baseUrl}`);

  for (let index = 0; index < profiles.length; index += 1) {
    const profile = profiles[index];
    const profileInput = {
      ...input,
      mode: "mobile",
      viewportWidth: profile.width,
      viewportHeight: profile.height,
      viewportLabel: profile.label,
    };
    const profileStartedAtMs = Date.now();

    setAuditState({
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "runner_ready",
        phaseLabel: "Preparing mobile profile",
        detail: `${profile.label} ${formatViewport(profile.width, profile.height)} | pass ${index + 1}/${profiles.length}`,
        percentage: 4 + Math.round((index / profiles.length) * 92),
        sweepProfileIndex: index + 1,
        sweepProfileTotal: profiles.length,
        sweepProfileLabel: profile.label,
        sweepProfileViewport: formatViewport(profile.width, profile.height),
        sweepProfilePercentage: 0,
        sweepProfileStartedAtMs: profileStartedAtMs,
      },
    });
    pushLog(`[audit] mobile profile ${index + 1}/${profiles.length} | ${profile.label} ${formatViewport(profile.width, profile.height)}`);

    try {
      await startLiveReportPolling("mobile", {
        source: "native",
        baseUrl: input.baseUrl,
        scope: input.scope,
        depth: input.fullAudit ? "deep" : "signal",
        startedAtMs: profileStartedAtMs,
        sweepProfileIndex: index + 1,
        sweepProfileTotal: profiles.length,
        sweepProfileLabel: profile.label,
        sweepProfileViewport: formatViewport(profile.width, profile.height),
      });
      const { status, payload } = await postBridgeJson("/run", profileInput);
      if (payload?.ok && payload?.report) {
        successfulRuns.push({
          profile,
          report: payload.report,
          command: String(payload.command || ""),
          status,
          usedFallback: payload.usedFallback === true,
        });
        pushLog(`[audit] mobile profile completed | ${profile.label} | issues=${summarizeReport(payload.report).totalIssues} | seo=${summarizeReport(payload.report).seoScore}`);
        continue;
      }

      const detail = String(payload?.detail || payload?.error || `bridge_status_${status}`);
      failedRuns.push({
        profile,
        error: payload?.error || "audit_failed",
        detail,
      });
      pushLog(`[audit] mobile profile failed | ${profile.label} | ${detail}`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error || "audit_failed");
      failedRuns.push({
        profile,
        error: "audit_failed",
        detail,
      });
      pushLog(`[audit] mobile profile failed | ${profile.label} | ${detail}`);
    } finally {
      stopLiveReportPolling({
        preserveSnapshot: true,
        notifyState: false,
        notifyRenderer: false,
      });
    }
  }

  if (!successfulRuns.length) {
    const message = failedRuns[0]?.detail || "The mobile family sweep did not produce any successful report.";
    stopLiveReportPolling({
      preserveSnapshot: true,
    });
    setAuditState({
      running: false,
      status: "failed",
      finishedAt: nowIso(),
      durationMs: Math.max(0, Date.now() - startedAtMs),
      lastError: message,
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "failed",
        phaseLabel: "Run failed",
        detail: message,
      },
    });
    return {
      ok: false,
      error: "audit_failed",
      detail: message,
    };
  }

  const finishedAt = nowIso();
  const aggregate = aggregateMobileSweepReport(input, successfulRuns, failedRuns, startedAt, finishedAt);
  const summary = summarizeReport(aggregate);
  const usedFallback = successfulRuns.some((item) => item.usedFallback === true);
  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: false,
    status: summary.totalIssues > 0 ? "issues" : "clean",
    depth: input.fullAudit ? "deep" : "signal",
    finishedAt,
    durationMs: Math.max(0, Date.now() - startedAtMs),
    lastCommand: String(aggregate.meta.replayCommand || ""),
    usedFallback,
    lastSummary: summary,
    lastError: "",
    liveReport: null,
    progress: {
      ...(auditState.progress || createEmptyAuditProgress()),
      percentage: 100,
      phase: "runner_finished",
      phaseLabel: "Mobile family finished",
      detail:
        failedRuns.length > 0
          ? `Mobile family sweep finished with ${summary.totalIssues} issue(s) and ${failedRuns.length} failed profile(s).`
          : `Mobile family sweep finished with ${summary.totalIssues} issue(s).`,
    },
  });
  pushLog(`[audit] mobile family completed | profiles=${successfulRuns.length}/${profiles.length} | issues=${summary.totalIssues} | seo=${summary.seoScore}`);
  return {
    ok: true,
    report: aggregate,
    command: String(aggregate.meta.replayCommand || ""),
    usedFallback,
  };
}

async function runAuditViaBridge(input) {
  if (input.mode === "mobile" && normalizeMobileSweep(input.mobileSweep) === "family") {
    return await runMobileFamilyAudit(input);
  }
  return await runSingleAuditViaBridge(input);
}

async function openCmdViaBridge(input) {
  const startedAt = nowIso();
  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: true,
    status: "running",
    source: "cmd",
    baseUrl: input.baseUrl,
    mode: input.mode,
    scope: input.scope,
    depth: input.fullAudit ? "deep" : "signal",
    startedAt,
    finishedAt: "",
    durationMs: 0,
    lastError: "",
    lastCommand: "",
    usedFallback: false,
    progress: {
      ...createEmptyAuditProgress(),
      phase: "boot",
      phaseLabel: "Opening CMD flow",
      detail: `Opening the external CMD flow for ${input.baseUrl}`,
      percentage: 2,
    },
    liveReport: null,
    timeline: [
      {
        id: `cmd-start-${startedAt}`,
        stage: "boot",
        label: "CMD flow requested",
        status: "active",
        detail: `Opening the external CMD flow for ${input.baseUrl}`,
        route: "",
        action: "",
        at: startedAt,
      },
    ],
    stageBoard: createInitialStageBoard(`Opening the external CMD flow for ${input.baseUrl}`),
  });
  pushLog(`[cmd] opening ${input.mode}/${input.scope} for ${input.baseUrl}`);

  try {
    const { payload } = await postBridgeJson("/open-cmd", input);
    if (payload?.ok) {
      const launchedAt = nowIso();
      await startLiveReportPolling(input.mode, {
        source: "cmd",
        baseUrl: input.baseUrl,
        scope: input.scope,
        depth: input.fullAudit ? "deep" : "signal",
        startedAtMs: new Date(startedAt).getTime(),
        recommendedCommand: String(payload.recommendedCommand || payload.command || ""),
        cmdStatePath: String(payload.stateFile || getCmdStatePathForMode(input.mode)),
      });
      setAuditState({
        lastCommand: String(payload.recommendedCommand || payload.command || ""),
        progress: {
          ...(auditState.progress || createEmptyAuditProgress()),
          phase: "runner_ready",
          phaseLabel: "CMD flow opened",
          detail: "External CMD flow opened. Waiting for live checkpoints.",
          percentage: 4,
        },
        timeline: [
          {
            id: `cmd-opened-${launchedAt}`,
            stage: "boot",
            label: "CMD flow opened",
            status: "active",
            detail: "External CMD flow opened. Waiting for live checkpoints.",
            route: "",
            action: "",
            at: launchedAt,
          },
          ...(auditState.timeline || []),
        ].slice(0, 24),
        stageBoard: updateStageBoardFromEvent(auditState.stageBoard, {
          type: "runner_ready",
          detail: "External CMD flow opened. Waiting for live checkpoints.",
          at: launchedAt,
        }),
      });
      pushLog(`[cmd] ${String(payload.message || "CMD flow launched.")}`);
    } else {
      const detail = String(payload?.detail || payload?.error || "cmd_launch_failed");
      failCmdAuditState(detail, {
        startedAtMs: new Date(startedAt).getTime(),
        recommendedCommand: String(payload?.recommendedCommand || payload?.command || ""),
      });
    }
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "cmd_launch_failed");
    failCmdAuditState(message, {
      startedAtMs: new Date(startedAt).getTime(),
    });
    return {
      ok: false,
      error: "cmd_launch_failed",
      detail: message,
    };
  }
}

async function requestFastModeResume(input) {
  const runningAudit = auditState && typeof auditState === "object" ? auditState : {};
  if (runningAudit.running !== true) {
    return {
      ok: false,
      error: "no_running_audit",
      detail: "There is no active audit to switch.",
    };
  }

  if (String(runningAudit.source || "native") !== "native") {
    return {
      ok: false,
      error: "fast_resume_unsupported_source",
      detail: "Fast checkpoint resume is available for native audits only.",
    };
  }

  if (runningAudit.mode === "mobile" && normalizeMobileSweep(input?.mobileSweep) === "family") {
    return {
      ok: false,
      error: "fast_resume_family_unsupported",
      detail: "Switching in place is not available during mobile family sweep. Use single-device mode for resumable fast handoff.",
    };
  }

  const resumeInput = {
    baseUrl: String(runningAudit.baseUrl || input?.baseUrl || "").trim(),
    mode: runningAudit.mode === "mobile" ? "mobile" : "desktop",
    scope: input?.scope === "seo" ? "seo" : input?.scope === "experience" ? "experience" : "full",
    noServer: input?.noServer !== false,
    headed: input?.headed === true,
    fullAudit: input?.fullAudit !== false,
    mobileSweep: runningAudit.mode === "mobile" ? normalizeMobileSweep(input?.mobileSweep) : "single",
    viewportWidth: Number.isFinite(Number(input?.viewportWidth)) ? Math.max(320, Number(input.viewportWidth)) : null,
    viewportHeight: Number.isFinite(Number(input?.viewportHeight)) ? Math.max(320, Number(input.viewportHeight)) : null,
    viewportLabel: String(input?.viewportLabel || "").trim(),
  };

  if (!resumeInput.baseUrl) {
    return {
      ok: false,
      error: "resume_target_missing",
      detail: "The current target URL is not available for the fast resume handoff.",
    };
  }

  const runKey = buildAuditRunKey({
    baseUrl: runningAudit.baseUrl,
    startedAt: runningAudit.startedAt,
    mode: runningAudit.mode,
    scope: runningAudit.scope,
    depth: runningAudit.depth,
    source: runningAudit.source || "native",
  });

  fastResumePlan = {
    runKey,
    input: resumeInput,
    requestedAt: nowIso(),
  };

  const { payload } = await requestBridgeCancel();
  if (!payload?.ok) {
    fastResumePlan = null;
    return payload;
  }

  const detail = "Safe pause requested. SitePulse will preserve the current evidence and resume from checkpoint in fast mode.";
  setAuditState({
    progress: {
      ...(auditState.progress || createEmptyAuditProgress()),
      phase: "resume_handoff",
      phaseLabel: "Switching to fast mode",
      detail,
      percentage: Math.max(5, safeFiniteNumber(auditState?.progress?.percentage, 0)),
    },
    timeline: [
      {
        id: `fast-resume-request-${nowIso()}`,
        stage: "finish",
        label: "Fast mode requested",
        status: "active",
        detail,
        route: "",
        action: "",
        at: nowIso(),
      },
      ...(auditState.timeline || []),
    ].slice(0, 24),
  });
  pushLog("[audit] pausa segura solicitada. o motor vai retomar do checkpoint em fast mode.");
  return {
    ok: true,
    detail,
    input: resumeInput,
  };
}

function getStatePayload() {
  return {
    serviceName: "SitePulse Studio",
    version: app.getVersion(),
    packaged: app.isPackaged,
    qaRuntimeDir,
    reportsDir,
    launchOnLogin,
    platform: process.platform,
    bridge: bridgeHandle
      ? {
          running: true,
          host: BRIDGE_HOST,
          port: BRIDGE_PORT,
          service: bridgeHandle.serviceName,
        }
      : {
          running: false,
          host: BRIDGE_HOST,
          port: BRIDGE_PORT,
          service: "offline",
        },
    audit: {
      ...auditState,
      liveReport: null,
      hasLiveReport: !!auditState.liveReport,
    },
    seoSource: sanitizeSeoSourceState(seoSourceState),
    update: updateService ? updateService.getState() : null,
    logs: [...logLines],
    logFile: desktopLogFile,
  };
}

async function installDownloadedUpdate() {
  if (!updateService) {
    return { ok: false, error: "update_service_unavailable" };
  }

  const payload = await updateService.installUpdate();
  if (!payload?.ok || payload.installNow !== true) {
    return payload;
  }

  pushLog("[update] installing downloaded update.");
  shuttingDown = true;
  try {
    if (bridgeHandle) {
      await stopBridge();
    }
  } finally {
    updateService.applyUpdateAndRestart();
  }

  return payload;
}

async function loadDesktopShell() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  await mainWindow.loadFile(path.join(__dirname, "renderer.html"));
  notifyState();
  notifyWindowState();
}

function centerBounds(workArea, width, height) {
  const x = workArea.x + Math.max(0, Math.floor((workArea.width - width) / 2));
  const y = workArea.y + Math.max(0, Math.floor((workArea.height - height) / 2));
  return { x, y, width, height };
}

function computeWindowSizing(workArea) {
  const minWidth = Math.min(WINDOW_MIN_WIDTH, workArea.width);
  const minHeight = Math.min(WINDOW_MIN_HEIGHT, workArea.height);
  const width = Math.max(minWidth, Math.min(WINDOW_DEFAULT_WIDTH, workArea.width));
  const height = Math.max(minHeight, Math.min(WINDOW_DEFAULT_HEIGHT, workArea.height));
  return { minWidth, minHeight, width, height };
}

function normalizeWindowBounds(win, recenter = false) {
  if (!win || win.isDestroyed()) return;

  const currentBounds = win.getBounds();
  const display = screen.getDisplayMatching(currentBounds);
  const workArea = display?.workArea || screen.getPrimaryDisplay().workArea;
  const sizing = computeWindowSizing(workArea);
  win.setMinimumSize(sizing.minWidth, sizing.minHeight);

  const width = Math.max(sizing.minWidth, Math.min(currentBounds.width, workArea.width));
  const height = Math.max(sizing.minHeight, Math.min(currentBounds.height, workArea.height));
  let x = currentBounds.x;
  let y = currentBounds.y;

  if (recenter || !Number.isFinite(x) || !Number.isFinite(y)) {
    const centered = centerBounds(workArea, width, height);
    x = centered.x;
    y = centered.y;
  } else {
    const maxX = workArea.x + workArea.width - width;
    const maxY = workArea.y + workArea.height - height;
    x = Math.max(workArea.x, Math.min(x, maxX));
    y = Math.max(workArea.y, Math.min(y, maxY));
  }

  win.setBounds({ x, y, width, height });
}

function createWindow() {
  const primaryWorkArea = screen.getPrimaryDisplay().workArea;
  const initialSizing = computeWindowSizing(primaryWorkArea);
  const initialBounds = centerBounds(primaryWorkArea, initialSizing.width, initialSizing.height);

  mainWindow = new BrowserWindow({
    x: initialBounds.x,
    y: initialBounds.y,
    width: initialBounds.width,
    height: initialBounds.height,
    minWidth: initialSizing.minWidth,
    minHeight: initialSizing.minHeight,
    frame: false,
    backgroundColor: "#0a0f16",
    autoHideMenuBar: true,
    show: false,
    title: "SitePulse Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
    },
  });

  mainWindow.webContents.on("will-attach-webview", (event, webPreferences, params) => {
    const src = String(params?.src || "");
    if (src && src !== "about:blank" && !isSafeHttpUrl(src)) {
      event.preventDefault();
      return;
    }
    delete webPreferences.preload;
    webPreferences.nodeIntegration = false;
    webPreferences.contextIsolation = true;
    webPreferences.sandbox = true;
    webPreferences.webSecurity = true;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeHttpUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      normalizeWindowBounds(mainWindow);
      mainWindow.show();
      notifyWindowState();
    }
  });

  if (!displayMetricsHandler) {
    displayMetricsHandler = () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      normalizeWindowBounds(mainWindow);
    };
    screen.on("display-metrics-changed", displayMetricsHandler);
  }

  mainWindow.on("maximize", () => notifyWindowState());
  mainWindow.on("unmaximize", () => notifyWindowState());
  mainWindow.on("focus", () => notifyWindowState());
  mainWindow.on("blur", () => notifyWindowState());
  mainWindow.on("closed", () => {
    if (displayMetricsHandler) {
      screen.off("display-metrics-changed", displayMetricsHandler);
      displayMetricsHandler = null;
    }
    mainWindow = null;
  });
}

app.on("web-contents-created", (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (isSafeHttpUrl(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
});

async function runSmokeTest() {
  pushLog("[smoke] iniciando smoke test do desktop app");
  await ensureQaRuntime();
  await startBridge();

  const bridgeRes = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}/health`, { cache: "no-store" });
  if (!bridgeRes.ok) {
    throw new Error(`bridge_health_failed_${bridgeRes.status}`);
  }

  const payload = await runAuditViaBridge({
    baseUrl: "https://example.com",
    mode: "desktop",
    scope: "seo",
    noServer: true,
    headed: false,
    fullAudit: false,
  });

  if (!payload?.ok || !payload?.report) {
    throw new Error(`desktop_audit_smoke_failed: ${payload?.detail || payload?.error || "unknown"}`);
  }

  pushLog("[smoke] bridge OK");
  pushLog("[smoke] auditoria curta OK");
  await stopBridge();
}

ipcMain.handle("companion:get-state", async () => ({
  ...getStatePayload(),
  audit: {
    ...auditState,
    hasLiveReport: !!auditState.liveReport,
  },
}));
ipcMain.handle("companion:check-for-updates", async () => {
  if (!updateService) {
    return { ok: false, error: "update_service_unavailable" };
  }
  return await updateService.checkForUpdates({ silent: false });
});
ipcMain.handle("companion:download-update", async () => {
  if (!updateService) {
    return { ok: false, error: "update_service_unavailable" };
  }
  return await updateService.downloadUpdate();
});
ipcMain.handle("companion:install-update", async () => {
  return await installDownloadedUpdate();
});
ipcMain.handle("companion:start-bridge", async () => {
  try {
    return await startBridge();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "start_failed");
    pushLog(`[bridge] falha ao iniciar: ${message}`);
    return { ok: false, error: "start_failed", detail: message };
  }
});
ipcMain.handle("companion:stop-bridge", async () => {
  try {
    return await stopBridge();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "stop_failed");
    pushLog(`[bridge] falha ao parar: ${message}`);
    return { ok: false, error: "stop_failed", detail: message };
  }
});
ipcMain.handle("companion:run-audit", async (_event, input) => {
  return await runAuditViaBridge({
    baseUrl: String(input?.baseUrl || "").trim(),
    mode: input?.mode === "mobile" ? "mobile" : "desktop",
    scope: input?.scope === "seo" ? "seo" : input?.scope === "experience" ? "experience" : "full",
    noServer: input?.noServer !== false,
    headed: input?.headed === true,
    fullAudit: input?.fullAudit !== false,
    mobileSweep: normalizeMobileSweep(input?.mobileSweep),
    viewportWidth: Number.isFinite(Number(input?.viewportWidth)) ? Math.max(320, Number(input.viewportWidth)) : null,
    viewportHeight: Number.isFinite(Number(input?.viewportHeight)) ? Math.max(320, Number(input.viewportHeight)) : null,
    viewportLabel: String(input?.viewportLabel || "").trim(),
  });
});
ipcMain.handle("companion:switch-audit-fast", async (_event, input) => {
  return await requestFastModeResume({
    baseUrl: String(input?.baseUrl || "").trim(),
    mode: input?.mode === "mobile" ? "mobile" : "desktop",
    scope: input?.scope === "seo" ? "seo" : input?.scope === "experience" ? "experience" : "full",
    noServer: input?.noServer !== false,
    headed: input?.headed === true,
    fullAudit: input?.fullAudit !== false,
    mobileSweep: normalizeMobileSweep(input?.mobileSweep),
    viewportWidth: Number.isFinite(Number(input?.viewportWidth)) ? Math.max(320, Number(input.viewportWidth)) : null,
    viewportHeight: Number.isFinite(Number(input?.viewportHeight)) ? Math.max(320, Number(input.viewportHeight)) : null,
    viewportLabel: String(input?.viewportLabel || "").trim(),
  });
});
ipcMain.handle("companion:open-cmd-window", async (_event, input) => {
  return await openCmdViaBridge({
    baseUrl: String(input?.baseUrl || "").trim(),
    mode: input?.mode === "mobile" ? "mobile" : "desktop",
    scope: input?.scope === "seo" ? "seo" : input?.scope === "experience" ? "experience" : "full",
    noServer: input?.noServer !== false,
    headed: input?.headed === true,
    fullAudit: input?.fullAudit !== false,
    elevated: input?.elevated === true,
    mobileSweep: normalizeMobileSweep(input?.mobileSweep),
    viewportWidth: Number.isFinite(Number(input?.viewportWidth)) ? Math.max(320, Number(input.viewportWidth)) : null,
    viewportHeight: Number.isFinite(Number(input?.viewportHeight)) ? Math.max(320, Number(input.viewportHeight)) : null,
    viewportLabel: String(input?.viewportLabel || "").trim(),
  });
});
ipcMain.handle("companion:open-reports", async () => {
  if (!reportsDir) {
    await ensureQaRuntime();
  }
  if (!reportsDir) return { ok: false, error: "reports_dir_unavailable" };
  await shell.openPath(reportsDir);
  return { ok: true };
});
ipcMain.handle("companion:copy-bridge-url", async () => {
  clipboard.writeText(`http://${BRIDGE_HOST}:${BRIDGE_PORT}`);
  return { ok: true };
});
ipcMain.handle("companion:copy-text", async (_event, value) => {
  clipboard.writeText(String(value || ""));
  return { ok: true };
});
ipcMain.handle("companion:open-external-url", async (_event, value) => {
  try {
    const target = String(value || "").trim();
    if (!isSafeHttpUrl(target)) {
      return { ok: false, error: "invalid_external_url" };
    }
    await shell.openExternal(target);
    return { ok: true, url: target };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "open_external_failed");
    pushLog(`[desktop] failed to open external url: ${message}`);
    return { ok: false, error: "open_external_failed", detail: message };
  }
});
ipcMain.handle("companion:pick-report-file", async () => {
  try {
    return await pickReportFile();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "report_pick_failed");
    pushLog(`[reports] falha ao carregar report: ${message}`);
    return { ok: false, error: "report_pick_failed", detail: message };
  }
});
ipcMain.handle("companion:export-report-file", async (_event, reportPayload) => {
  try {
    return await exportReportFile(reportPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "report_export_failed");
    pushLog(`[reports] falha ao exportar report: ${message}`);
    return { ok: false, error: "report_export_failed", detail: message };
  }
});
ipcMain.handle("companion:get-learning-memory", async () => {
  try {
    if (!reportsDir) {
      await ensureQaRuntime();
    }
    const payload = await runLearningAdmin("snapshot", { reportDir: reportsDir });
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "learning_memory_failed");
    pushLog(`[memory] failed to load learning snapshot: ${message}`);
    return { ok: false, error: "learning_memory_failed", detail: message };
  }
});
ipcMain.handle("companion:apply-learning-manual-override", async (_event, payload) => {
  try {
    if (!reportsDir) {
      await ensureQaRuntime();
    }
    const result = await runLearningAdmin("manual-override", {
      reportDir: reportsDir,
      override: payload && typeof payload === "object" ? payload : {},
    });
    pushLog(`[memory] manual override saved for ${String(payload?.issueCode || "UNKNOWN")}.`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "manual_override_failed");
    pushLog(`[memory] failed to save manual override: ${message}`);
    return { ok: false, error: "manual_override_failed", detail: message };
  }
});
ipcMain.handle("companion:get-healing-snapshot", async (_event, payload) => {
  try {
    if (!reportsDir) {
      await ensureQaRuntime();
    }
    const result = await runHealingAdmin("snapshot", {
      reportDir: reportsDir,
      report: payload && typeof payload === "object" ? payload.report : null,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "healing_snapshot_failed");
    pushLog(`[healing] failed to load self-healing snapshot: ${message}`);
    return { ok: false, error: "healing_snapshot_failed", detail: message };
  }
});
ipcMain.handle("companion:prepare-healing-attempt", async (_event, payload) => {
  try {
    if (!reportsDir) {
      await ensureQaRuntime();
    }
    const result = await runHealingAdmin("prepare-attempt", {
      reportDir: reportsDir,
      ...(payload && typeof payload === "object" ? payload : {}),
    });
    pushLog(`[healing] prepared attempt for ${String(payload?.issueCode || "UNKNOWN")}.`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "healing_prepare_failed");
    pushLog(`[healing] failed to prepare attempt: ${message}`);
    return { ok: false, error: "healing_prepare_failed", detail: message };
  }
});
ipcMain.handle("companion:open-latest-evidence", async () => {
  try {
    const latest = await findLatestReportArtifact();
    if (!latest) {
      return { ok: false, error: "latest_evidence_missing" };
    }
    return {
      ok: true,
      path: latest.path,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "latest_evidence_failed");
    pushLog(`[reports] falha ao abrir evidencia recente: ${message}`);
    return { ok: false, error: "latest_evidence_failed", detail: message };
  }
});
ipcMain.handle("companion:open-artifact-file", async (_event, filePath) => {
  try {
    const target = String(filePath || "").trim();
    if (!target) {
      return { ok: false, error: "artifact_path_missing" };
    }
    await fs.access(target);
    const openResult = await shell.openPath(target);
    if (openResult) {
      return { ok: false, error: "artifact_open_failed", detail: openResult };
    }
    return { ok: true, path: target };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "artifact_open_failed");
    pushLog(`[reports] failed to open artifact file: ${message}`);
    return { ok: false, error: "artifact_open_failed", detail: message };
  }
});
ipcMain.handle("companion:open-artifact-path", async (_event, filePath) => {
  try {
    const target = String(filePath || "").trim();
    if (!target) {
      return { ok: false, error: "artifact_path_missing" };
    }
    await fs.access(target);
    shell.showItemInFolder(target);
    return { ok: true, path: target };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "artifact_open_failed");
    pushLog(`[reports] failed to open artifact path: ${message}`);
    return { ok: false, error: "artifact_open_failed", detail: message };
  }
});
ipcMain.handle("companion:get-seo-source", async () => ({
  ok: true,
  source: sanitizeSeoSourceState(await ensureSeoSourceState()),
}));
ipcMain.handle("companion:save-seo-source", async (_event, payload) => {
  const current = await ensureSeoSourceState();
  const property = normalizeSiteProperty(payload?.property, current.property);
  const accessToken = String(payload?.accessToken || "").trim() || current.accessToken;
  const lookbackDays = normalizeLookbackDays(payload?.lookbackDays || current.lookbackDays);
  const next = {
    ...current,
    property,
    accessToken,
    lookbackDays,
    lastError: "",
  };
  await persistSeoSourceState(next);
  notifyState();
  return { ok: true, source: sanitizeSeoSourceState(next) };
});
ipcMain.handle("companion:refresh-seo-source", async (_event, payload) => {
  const current = await ensureSeoSourceState();
  const property = normalizeSiteProperty(payload?.property, payload?.baseUrl || current.property);
  const accessToken = String(payload?.accessToken || "").trim() || current.accessToken;
  const lookbackDays = normalizeLookbackDays(payload?.lookbackDays || current.lookbackDays);
  if (!property || !accessToken) {
    const error = !property ? "search_console_property_required" : "search_console_access_token_required";
    const next = {
      ...current,
      property,
      lookbackDays,
      lastError: error,
    };
    await persistSeoSourceState(next);
    notifyState();
    return { ok: false, error, source: sanitizeSeoSourceState(next) };
  }

  try {
    const snapshot = await fetchSearchConsoleSnapshot({
      property,
      accessToken,
      lookbackDays,
      baseUrl: payload?.baseUrl,
    });
    const next = {
      ...current,
      property,
      accessToken,
      lookbackDays,
      snapshot,
      lastSyncedAt: snapshot.syncedAt,
      lastError: "",
    };
    await persistSeoSourceState(next);
    pushLog(`[seo] google data synced | property=${property} | position=${snapshot.position} | clicks=${snapshot.clicks}`);
    notifyState();
    return { ok: true, source: sanitizeSeoSourceState(next), snapshot };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "search_console_refresh_failed");
    const next = {
      ...current,
      property,
      accessToken,
      lookbackDays,
      lastError: message,
    };
    await persistSeoSourceState(next);
    pushLog(`[seo] google data sync failed | ${message}`);
    notifyState();
    return { ok: false, error: message, source: sanitizeSeoSourceState(next) };
  }
});
ipcMain.handle("companion:get-launch-on-login", async () => ({ ok: true, enabled: launchOnLogin }));
ipcMain.handle("companion:set-launch-on-login", async (_event, enabled) => {
  launchOnLogin = !!enabled;
  app.setLoginItemSettings({ openAtLogin: launchOnLogin });
  notifyState();
  return { ok: true, enabled: launchOnLogin };
});
ipcMain.handle("companion:get-window-state", async () => getWindowStatePayload());
ipcMain.handle("companion:window-minimize", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, error: "window_unavailable" };
  mainWindow.minimize();
  return { ok: true };
});
ipcMain.handle("companion:window-maximize-toggle", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, error: "window_unavailable" };
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
  notifyWindowState();
  return { ok: true, ...getWindowStatePayload() };
});
ipcMain.handle("companion:window-close", async () => {
  if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, error: "window_unavailable" };
  mainWindow.close();
  return { ok: true };
});

app.whenReady().then(async () => {
  writeBootstrapTrace("whenReady entered");
  pushLog(`[desktop] boot iniciado | packaged=${app.isPackaged}`);
  pushLog(`[desktop] userData=${app.getPath("userData")}`);
  launchOnLogin = app.getLoginItemSettings().openAtLogin;
  seoSourceState = await readSeoSourceState();
  updateService = new UpdateService({
    log: (line) => pushLog(line),
    notify: () => notifyState(),
  });
  updateService.initialize();

  if (IS_SMOKE_MODE) {
    try {
      await runSmokeTest();
      process.stdout.write("SITEPULSE_DESKTOP_SMOKE_OK\n");
      app.quit();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "smoke_failed");
      process.stderr.write(`SITEPULSE_DESKTOP_SMOKE_FAIL ${message}\n`);
      app.exit(1);
    }
    return;
  }

  createWindow();
  writeBootstrapTrace("main window created");
  pushLog("[desktop] janela principal criada");
  await loadDesktopShell();

  try {
    await ensureQaRuntime();
    await startBridge();
    notifyState();
    writeBootstrapTrace("desktop boot completed");
    void updateService.checkForUpdates({ silent: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "desktop_boot_failed");
    writeBootstrapTrace(`desktop boot failed: ${message}`);
    pushLog(`[desktop] falha ao subir motor local: ${message}`);
    await loadDesktopShell();
  }
});

process.on("uncaughtException", (error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error || "uncaught_exception");
  writeBootstrapTrace(`uncaughtException: ${message}`);
  pushLog(`[fatal] uncaughtException: ${message}`);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.stack || reason.message : String(reason || "unhandled_rejection");
  writeBootstrapTrace(`unhandledRejection: ${message}`);
  pushLog(`[fatal] unhandledRejection: ${message}`);
});

process.on("exit", (code) => {
  writeBootstrapTrace(`process exit code=${code}`);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  if (shuttingDown) return;
  if (!bridgeHandle) return;
  event.preventDefault();
  shuttingDown = true;
  try {
    await stopBridge();
  } finally {
    app.exit(0);
  }
});
