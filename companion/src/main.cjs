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
      return `Route ${safeFiniteNumber(event.routeIndex, currentProgress.routeIndex)}/${totalRoutes || "?"} · action ${safeFiniteNumber(event.labelIndex, currentProgress.labelIndex)}/${totalLabels || "?"} · ${currentAction}`;
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
  };
  notifyState();
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

async function copyDirectoryEntries(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir);
  for (const entry of entries) {
    await fs.cp(path.join(sourceDir, entry), path.join(targetDir, entry), {
      recursive: true,
      force: true,
    });
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
    if (entry === "node_modules") {
      await copyDirectoryEntries(from, to);
      continue;
    }
    await fs.cp(from, to, {
      recursive: true,
      force: true,
    });
  }
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

  const entries = await fs.readdir(reportsDir, { withFileTypes: true });
  const candidates = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/-sitepulse-(report-final\.json|report-final\.md|issues-final\.log|assistant-final\.txt)$/i.test(entry.name)) continue;
    const fullPath = path.join(reportsDir, entry.name);
    const stats = await fs.stat(fullPath);
    candidates.push({ path: fullPath, mtimeMs: stats.mtimeMs });
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
  });
  pushLog(`[audit] iniciando ${input.mode}/${input.scope} para ${input.baseUrl}`);

  try {
    const { status, payload } = await postBridgeJson("/run", input);
    const finishedAt = nowIso();
    const durationMs = Date.now() - new Date(startedAt).getTime();

    if (payload?.ok) {
      const summary = summarizeReport(payload.report);
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
    setAuditState({
      running: false,
      status: "failed",
      depth: input.fullAudit ? "deep" : "signal",
      finishedAt,
      durationMs,
      lastCommand: String(payload?.command || ""),
      usedFallback: payload?.usedFallback === true,
      lastError: detail,
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "failed",
        phaseLabel: "Run failed",
        detail,
      },
    });
    pushLog(`[audit] falhou: ${detail}`);
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "audit_failed");
    setAuditState({
      running: false,
      status: "failed",
      depth: input.fullAudit ? "deep" : "signal",
      finishedAt: nowIso(),
      durationMs: Date.now() - new Date(startedAt).getTime(),
      lastError: message,
      progress: {
        ...(auditState.progress || createEmptyAuditProgress()),
        phase: "failed",
        phaseLabel: "Run failed",
        detail: message,
      },
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
  try {
    const { payload } = await postBridgeJson("/open-cmd", input);
    if (payload?.ok) {
      pushLog(`[cmd] ${String(payload.message || "janela CMD solicitada.")}`);
    } else {
      pushLog(`[cmd] falha: ${String(payload?.detail || payload?.error || "cmd_launch_failed")}`);
    }
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "cmd_launch_failed");
    pushLog(`[cmd] falha: ${message}`);
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

ipcMain.handle("companion:get-state", async () => getStatePayload());
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
    shell.showItemInFolder(latest.path);
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
