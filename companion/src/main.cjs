const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const process = require("node:process");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, clipboard, dialog, ipcMain, shell } = require("electron");

const IS_SMOKE_MODE = process.argv.includes("--smoke-test") || process.env.SITEPULSE_DESKTOP_SMOKE === "1";
const BRIDGE_HOST = "127.0.0.1";
const BRIDGE_PORT = Number(process.env.SITEPULSE_BRIDGE_PORT || (IS_SMOKE_MODE ? "47991" : "47891"));
const BOOTSTRAP_TRACE_FILE = process.env.APPDATA
  ? path.join(process.env.APPDATA, "sitepulse-desktop", "bootstrap.log")
  : path.join(process.cwd(), "sitepulse-desktop-bootstrap.log");

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
  };
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

function applyLiveReportProgress(report, options = {}) {
  if (!report || typeof report !== "object") return;
  const nextProgress = deriveProgressFromLiveReport(report, auditState.progress || createEmptyAuditProgress());
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
    const syntheticEvent = buildSyntheticLiveEventFromReport(nextProgress);
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
  auditState = {
    ...auditState,
    progress: deriveProgressFromLiveEvent(event, auditState.progress || createEmptyAuditProgress()),
    timeline: appendTimelineEvent(auditState.timeline, event),
    stageBoard: updateStageBoardFromEvent(auditState.stageBoard, event),
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

async function ensureQaRuntimeIntegrity(sourceDir, targetDir) {
  const requiredEntries = [
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

  const repaired = [];
  for (const entry of requiredEntries) {
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
  await fs.rm(targetDir, {
    recursive: true,
    force: true,
    maxRetries: 12,
    retryDelay: 250,
  });
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir);
  for (const entry of entries) {
    const from = path.join(sourceDir, entry);
    const to = path.join(targetDir, entry);
    await copyPathRobust(from, to);
  }
  await ensureQaRuntimeIntegrity(sourceDir, targetDir);
  qaRuntimeDir = targetDir;
  reportsDir = path.join(targetDir, "reports");
  await fs.mkdir(reportsDir, { recursive: true });
  pushLog(`[runtime] QA runtime preparado em ${qaRuntimeDir}`);
}

async function loadBridgeCore() {
  const modulePath = path.join(qaRuntimeDir, "src", "local-bridge-core.mjs");
  return await import(pathToFileURL(modulePath).href);
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

async function runAuditViaBridge(input) {
  const startedAt = nowIso();
  stopLiveReportPolling({
    preserveSnapshot: false,
    notifyState: false,
    notifyRenderer: true,
  });
  setAuditState({
    running: true,
    status: "running",
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
      phaseLabel: "Preparing runtime",
      detail: `Preparing audit for ${input.baseUrl}`,
      percentage: 2,
    },
    liveReport: null,
    timeline: [
      {
        id: `run-start-${startedAt}`,
        stage: "boot",
        label: "Run scheduled",
        status: "active",
        detail: `Preparing audit for ${input.baseUrl}`,
        route: "",
        action: "",
        at: startedAt,
      },
    ],
    stageBoard: createInitialStageBoard(`Preparing audit for ${input.baseUrl}`),
  });
  pushLog(`[audit] iniciando ${input.mode}/${input.scope} para ${input.baseUrl}`);

  try {
    await startLiveReportPolling(input.mode, {
      source: "native",
      baseUrl: input.baseUrl,
      scope: input.scope,
      depth: input.fullAudit ? "deep" : "signal",
      startedAtMs: new Date(startedAt).getTime(),
    });
    const { status, payload } = await postBridgeJson("/run", input);
    const finishedAt = nowIso();
    const durationMs = Date.now() - new Date(startedAt).getTime();

    if (payload?.ok) {
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

    const detail = String(payload?.detail || payload?.error || `bridge_status_${status}`);
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

function getStatePayload() {
  return {
    serviceName: "SitePulse Studio",
    version: app.getVersion(),
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
    logs: [...logLines],
    logFile: desktopLogFile,
  };
}

async function loadDesktopShell() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  await mainWindow.loadFile(path.join(__dirname, "renderer.html"));
  notifyState();
  notifyWindowState();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1660,
    height: 1020,
    minWidth: 1360,
    minHeight: 880,
    frame: false,
    backgroundColor: "#0a0f16",
    autoHideMenuBar: true,
    show: false,
    title: "SitePulse Studio",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      notifyWindowState();
    }
  });

  mainWindow.on("maximize", () => notifyWindowState());
  mainWindow.on("unmaximize", () => notifyWindowState());
  mainWindow.on("focus", () => notifyWindowState());
  mainWindow.on("blur", () => notifyWindowState());
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

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
