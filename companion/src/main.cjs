const fs = require("node:fs/promises");
const path = require("node:path");
const process = require("node:process");
const { pathToFileURL } = require("node:url");
const { app, BrowserWindow, clipboard, ipcMain, shell } = require("electron");

const BRIDGE_HOST = "127.0.0.1";
const BRIDGE_PORT = 47891;
const HUB_URL = process.env.SITEPULSE_HUB_URL || "https://site-pulse-qa.vercel.app/?autologin=1";

let mainWindow = null;
let bridgeHandle = null;
let qaRuntimeDir = "";
let reportsDir = "";
let launchOnLogin = false;
const logLines = [];

function pushLog(line) {
  const formatted = `[${new Date().toLocaleTimeString()}] ${line}`;
  logLines.unshift(formatted);
  if (logLines.length > 300) logLines.length = 300;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("companion:log", formatted);
  }
}

function notifyState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("companion:state", getStatePayload());
}

function getNodePathForRuntime() {
  return path.join(app.getAppPath(), "node_modules");
}

function resolveBundledRuntimeDir() {
  const packaged = path.join(process.resourcesPath, "app.asar.unpacked", "runtime-source", "qa");
  const dev = path.resolve(__dirname, "..", "runtime-source", "qa");
  return app.isPackaged ? packaged : dev;
}

async function ensureQaRuntime() {
  const sourceDir = resolveBundledRuntimeDir();
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
  const { startLocalBridgeServer } = await loadBridgeCore();
  bridgeHandle = await startLocalBridgeServer({
    host: BRIDGE_HOST,
    port: BRIDGE_PORT,
    qaDir: qaRuntimeDir,
    serviceName: "sitepulse-companion-bridge",
    nodeExecPath: process.execPath,
    runAsNode: true,
    extraEnv: {
      NODE_PATH: getNodePathForRuntime()
    },
    recommendedCommandFactory() {
      return "Use o SitePulse Companion ativo e rode a auditoria completa pelo Hub web.";
    },
    logger(message) {
      pushLog(message);
    }
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

function getStatePayload() {
  return {
    serviceName: "SitePulse Companion",
    qaRuntimeDir,
    reportsDir,
    launchOnLogin,
    bridge: bridgeHandle
      ? {
          running: true,
          host: BRIDGE_HOST,
          port: BRIDGE_PORT,
          service: bridgeHandle.serviceName
        }
      : {
          running: false,
          host: BRIDGE_HOST,
          port: BRIDGE_PORT,
          service: "offline"
        },
    logs: [...logLines]
  };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: "#07111f",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "renderer.html"));
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function runSmokeTest() {
  pushLog("[smoke] iniciando smoke test do companion");
  await ensureQaRuntime();
  await startBridge();
  const res = await fetch(`http://${BRIDGE_HOST}:${BRIDGE_PORT}/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`health_failed_${res.status}`);
  }
  const payload = await res.json();
  if (!payload.ok) {
    throw new Error("health_payload_invalid");
  }
  pushLog("[smoke] health OK");
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
  await shell.openExternal(HUB_URL);
  return { ok: true };
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

app.whenReady().then(async () => {
  launchOnLogin = app.getLoginItemSettings().openAtLogin;

  if (process.argv.includes("--smoke-test")) {
    try {
      await runSmokeTest();
      process.stdout.write("SITEPULSE_COMPANION_SMOKE_OK\n");
      app.quit();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "smoke_failed");
      process.stderr.write(`SITEPULSE_COMPANION_SMOKE_FAIL ${message}\n`);
      app.exit(1);
    }
    return;
  }

  await ensureQaRuntime();
  await startBridge();
  createWindow();
  notifyState();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", async (event) => {
  if (!bridgeHandle) return;
  event.preventDefault();
  const handle = bridgeHandle;
  bridgeHandle = null;
  try {
    await handle.stop();
  } finally {
    app.exit(0);
  }
});
