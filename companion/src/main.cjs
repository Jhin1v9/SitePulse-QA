const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const process = require("node:process");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, clipboard, ipcMain, shell } = require("electron");

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
let auditState = {
  running: false,
  status: "idle",
  baseUrl: "",
  mode: "desktop",
  scope: "full",
  startedAt: "",
  finishedAt: "",
  durationMs: 0,
  lastCommand: "",
  lastError: "",
  usedFallback: false,
  lastSummary: null,
};

function nowIso() {
  return new Date().toISOString();
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

function setAuditState(patch) {
  auditState = {
    ...auditState,
    ...patch,
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

async function ensureQaRuntime() {
  const sourceDir = resolveBundledQaDir();
  const targetDir = path.join(app.getPath("userData"), "qa-runtime");
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
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

async function runAuditViaBridge(input) {
  const startedAt = nowIso();
  setAuditState({
    running: true,
    status: "running",
    baseUrl: input.baseUrl,
    mode: input.mode,
    scope: input.scope,
    startedAt,
    finishedAt: "",
    durationMs: 0,
    lastError: "",
    lastCommand: "",
    usedFallback: false,
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
        finishedAt,
        durationMs,
        lastCommand: String(payload.command || ""),
        usedFallback: payload.usedFallback === true,
        lastSummary: summary,
        lastError: "",
      });
      pushLog(`[audit] concluida | issues=${summary.totalIssues} | seo=${summary.seoScore}`);
      return payload;
    }

    const detail = String(payload?.detail || payload?.error || `bridge_status_${status}`);
    setAuditState({
      running: false,
      status: "failed",
      finishedAt,
      durationMs,
      lastCommand: String(payload?.command || ""),
      usedFallback: payload?.usedFallback === true,
      lastError: detail,
    });
    pushLog(`[audit] falhou: ${detail}`);
    return payload;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "audit_failed");
    setAuditState({
      running: false,
      status: "failed",
      finishedAt: nowIso(),
      durationMs: Date.now() - new Date(startedAt).getTime(),
      lastError: message,
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
