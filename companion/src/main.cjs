const fsSync = require("node:fs");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const process = require("node:process");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, clipboard, ipcMain, shell } = require("electron");

const IS_SMOKE_MODE = process.argv.includes("--smoke-test") || process.env.SITEPULSE_DESKTOP_SMOKE === "1";
const BRIDGE_HOST = "127.0.0.1";
const BRIDGE_PORT = Number(process.env.SITEPULSE_BRIDGE_PORT || (IS_SMOKE_MODE ? "47991" : "47891"));
const HUB_HOST = "127.0.0.1";
const HUB_PORT = Number(process.env.SITEPULSE_HUB_PORT || (IS_SMOKE_MODE ? "47992" : "47892"));
const HUB_QUERY = "?autologin=1&desktop=1";
const BOOTSTRAP_TRACE_FILE = process.env.APPDATA
  ? path.join(process.env.APPDATA, "sitepulse-desktop", "bootstrap.log")
  : path.join(process.cwd(), "sitepulse-desktop-bootstrap.log");

let mainWindow = null;
let bridgeHandle = null;
let hubHandle = null;
let qaRuntimeDir = "";
let webRuntimeDir = "";
let reportsDir = "";
let desktopLogFile = "";
let launchOnLogin = false;
let shuttingDown = false;
const logLines = [];

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
    fsSync.appendFileSync(
      BOOTSTRAP_TRACE_FILE,
      `[${new Date().toISOString()}] ${message}\n`,
      "utf8",
    );
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
  desktopLogFile = path.join(logDir, `desktop-${new Date().toISOString().slice(0, 10)}.log`);
  return desktopLogFile;
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

function getNodePathForRuntime() {
  return path.join(app.getAppPath(), "node_modules");
}

function getDesktopHubUrl() {
  return `http://${HUB_HOST}:${HUB_PORT}/${HUB_QUERY}`;
}

function resolveBundledQaDir() {
  const packaged = path.join(process.resourcesPath, "app.asar.unpacked", "runtime-source", "qa");
  const dev = path.resolve(__dirname, "..", "runtime-source", "qa");
  return app.isPackaged ? packaged : dev;
}

function resolveBundledWebDir() {
  const packaged = path.join(process.resourcesPath, "app.asar.unpacked", "runtime-source", "web");
  const dev = path.resolve(__dirname, "..", "runtime-source", "web");
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

async function ensureWebRuntime() {
  const sourceDir = resolveBundledWebDir();
  const targetDir = path.join(app.getPath("userData"), "hub-runtime");
  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
  await fs.cp(sourceDir, targetDir, { recursive: true, force: true });
  webRuntimeDir = targetDir;
  pushLog(`[runtime] Hub runtime preparado em ${webRuntimeDir}`);
}

async function loadBridgeCore() {
  const modulePath = path.join(qaRuntimeDir, "src", "local-bridge-core.mjs");
  return await import(pathToFileURL(modulePath).href);
}

async function waitForUrl(url, validate, attempts = 80, delayMs = 350) {
  let lastError = "";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (typeof validate === "function") {
        const ok = await validate(res);
        if (ok) return true;
      } else if (res.ok) {
        return true;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error || "request_failed");
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(lastError || `wait_for_url_failed: ${url}`);
}

async function stopChildProcess(child, label) {
  if (!child || child.exitCode !== null || typeof child.pid !== "number") return;

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
        windowsHide: true,
      });
      killer.on("close", () => resolve(undefined));
      killer.on("error", () => resolve(undefined));
    });
    pushLog(`[${label}] processo encerrado com taskkill.`);
    return;
  }

  child.kill("SIGTERM");
  await new Promise((resolve) => {
    child.once("close", () => resolve(undefined));
    setTimeout(() => resolve(undefined), 3000);
  });
}

async function startBridge() {
  if (bridgeHandle) return { ok: true, alreadyRunning: true };
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
      return "Use o SitePulse Desktop aberto e rode a auditoria completa pelo proprio app.";
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

async function startHubServer() {
  if (hubHandle) return { ok: true, alreadyRunning: true, url: hubHandle.url };

  const serverPath = path.join(webRuntimeDir, "server.js");
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    PORT: String(HUB_PORT),
    HOSTNAME: HUB_HOST,
    NEXT_TELEMETRY_DISABLED: "1",
  };

  const child = spawn(process.execPath, [serverPath], {
    cwd: webRuntimeDir,
    env,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    const text = String(chunk).trimEnd();
    if (text) pushLog(`[hub stdout] ${text}`);
  });
  child.stderr.on("data", (chunk) => {
    const text = String(chunk).trimEnd();
    if (text) pushLog(`[hub stderr] ${text}`);
  });
  child.on("close", (code) => {
    if (hubHandle?.child?.pid === child.pid) {
      hubHandle = null;
      notifyState();
      if (!shuttingDown) {
        pushLog(`[hub] servidor local encerrou com codigo ${typeof code === "number" ? code : "?"}.`);
        void loadDesktopShell();
      }
    }
  });

  const url = getDesktopHubUrl();
  try {
    await waitForUrl(
      `http://${HUB_HOST}:${HUB_PORT}/api/health`,
      async (res) => {
        if (!res.ok) return false;
        const payload = await res.json().catch(() => null);
        return payload?.ok === true;
      },
      90,
      400,
    );
    await waitForUrl(url, async (res) => res.ok, 90, 400);
  } catch (error) {
    await stopChildProcess(child, "hub");
    throw error;
  }

  hubHandle = {
    child,
    host: HUB_HOST,
    port: HUB_PORT,
    url,
  };
  pushLog(`[hub] iniciado em ${url}`);
  notifyState();
  return { ok: true, url };
}

async function stopHubServer() {
  if (!hubHandle) return { ok: true, alreadyStopped: true };
  const current = hubHandle;
  hubHandle = null;
  await stopChildProcess(current.child, "hub");
  pushLog("[hub] encerrado");
  notifyState();
  return { ok: true };
}

function getStatePayload() {
  return {
    serviceName: "SitePulse Desktop",
    qaRuntimeDir,
    webRuntimeDir,
    reportsDir,
    launchOnLogin,
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
    hub: hubHandle
      ? {
          running: true,
          host: HUB_HOST,
          port: HUB_PORT,
          url: hubHandle.url,
        }
      : {
          running: false,
          host: HUB_HOST,
          port: HUB_PORT,
          url: "",
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
    width: 1540,
    height: 980,
    minWidth: 1280,
    minHeight: 820,
    frame: false,
    backgroundColor: "#050914",
    autoHideMenuBar: true,
    show: false,
    title: "SitePulse Desktop",
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

  mainWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedUrl) => {
    if (validatedUrl.startsWith("http://")) {
      pushLog(`[window] falha ao abrir Hub local: ${errorCode} ${errorDescription}`);
      void loadDesktopShell();
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
  await ensureWebRuntime();
  await startBridge();
  await startHubServer();

  const bridgeRes = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}/health`, { cache: "no-store" });
  if (!bridgeRes.ok) {
    throw new Error(`bridge_health_failed_${bridgeRes.status}`);
  }

  const hubHealth = await fetch(`http://${HUB_HOST}:${HUB_PORT}/api/health`, { cache: "no-store" });
  if (!hubHealth.ok) {
    throw new Error(`hub_health_failed_${hubHealth.status}`);
  }

  const hubPage = await fetch(getDesktopHubUrl(), { cache: "no-store" });
  const html = await hubPage.text();
  if (!hubPage.ok || !html.includes("SitePulse Hub")) {
    throw new Error("hub_page_invalid");
  }

  const auditRes = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      baseUrl: "https://example.com",
      mode: "desktop",
      scope: "seo",
      noServer: true,
      headed: false,
      fullAudit: false,
    }),
  });
  const auditPayload = await auditRes.json().catch(() => null);
  if (!auditRes.ok || !auditPayload?.ok) {
    throw new Error(`desktop_audit_smoke_failed: ${auditPayload?.detail || auditPayload?.error || auditRes.status}`);
  }

  pushLog("[smoke] bridge OK");
  pushLog("[smoke] hub OK");
  pushLog("[smoke] auditoria curta OK");
  await stopHubServer();
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
ipcMain.handle("companion:open-hub", async () => {
  if (!hubHandle) {
    await startHubServer();
  }
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  notifyState();
  return { ok: true, url: hubHandle?.url || getDesktopHubUrl() };
});
ipcMain.handle("companion:refresh-hub", async () => {
  if (!hubHandle) {
    await startHubServer();
  }
  notifyState();
  return { ok: true, url: hubHandle?.url || getDesktopHubUrl() };
});
ipcMain.handle("companion:open-reports", async () => {
  if (!reportsDir) return { ok: false, error: "reports_dir_unavailable" };
  await shell.openPath(reportsDir);
  return { ok: true };
});
ipcMain.handle("companion:copy-bridge-url", async () => {
  clipboard.writeText(`http://${BRIDGE_HOST}:${BRIDGE_PORT}`);
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
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
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
    await ensureWebRuntime();
    await startBridge();
    await startHubServer();
    notifyState();
    writeBootstrapTrace("desktop boot completed");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error || "desktop_boot_failed");
    writeBootstrapTrace(`desktop boot failed: ${message}`);
    pushLog(`[desktop] falha ao subir hub local: ${message}`);
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
  if (!bridgeHandle && !hubHandle) return;
  event.preventDefault();
  shuttingDown = true;
  try {
    await stopBridge();
    await stopHubServer();
  } finally {
    app.exit(0);
  }
});
