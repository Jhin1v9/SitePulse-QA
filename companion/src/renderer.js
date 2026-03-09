const stateEl = {
  service: document.getElementById("service"),
  runtime: document.getElementById("runtime"),
  webRuntime: document.getElementById("webRuntime"),
  bridge: document.getElementById("bridge"),
  hub: document.getElementById("hub"),
  reports: document.getElementById("reports"),
  autostart: document.getElementById("autostart"),
  log: document.getElementById("log"),
  startBtn: document.getElementById("startBridge"),
  stopBtn: document.getElementById("stopBridge"),
  refreshHubBtn: document.getElementById("refreshHub"),
  recoverWorkspaceBtn: document.getElementById("recoverWorkspace"),
  openReportWorkspaceBtn: document.getElementById("openReportWorkspace"),
  openReportsBtn: document.getElementById("openReports"),
  openReportsNavBtn: document.getElementById("openReportsNav"),
  reloadWorkspaceNavBtn: document.getElementById("reloadWorkspaceNav"),
  copyBridgeBtn: document.getElementById("copyBridgeUrl"),
  loginToggle: document.getElementById("launchOnLogin"),
  bridgeChip: document.getElementById("bridgeChip"),
  hubChip: document.getElementById("hubChip"),
  modeChip: document.getElementById("modeChip"),
  workspaceTitle: document.getElementById("workspaceTitle"),
  workspaceSubtitle: document.getElementById("workspaceSubtitle"),
  overlay: document.getElementById("workspaceOverlay"),
  overlayTitle: document.getElementById("overlayTitle"),
  overlayText: document.getElementById("overlayText"),
  frame: document.getElementById("hubFrame"),
  clearLogBtn: document.getElementById("clearLog"),
  navItems: Array.from(document.querySelectorAll(".nav-item[data-route]")),
  winMinimize: document.getElementById("winMinimize"),
  winMaximize: document.getElementById("winMaximize"),
  winClose: document.getElementById("winClose"),
};

let currentState = null;
let currentRoute = "/";
let localLogs = ["[desktop-shell] pronto"];

function shortPath(value) {
  const text = value || "n/a";
  return text.length > 72 ? `...${text.slice(-69)}` : text;
}

function setMetaChip(el, text, tone = "default") {
  if (!el) return;
  el.textContent = text;
  el.classList.remove("ok", "warn");
  if (tone === "ok") el.classList.add("ok");
  if (tone === "warn") el.classList.add("warn");
}

function renderLogs() {
  stateEl.log.textContent = localLogs.join("\n");
}

function appendLog(line) {
  localLogs = [line, ...localLogs].slice(0, 500);
  renderLogs();
}

function replaceLogs(lines) {
  localLogs = Array.isArray(lines) && lines.length ? [...lines] : ["[desktop-shell] pronto"];
  renderLogs();
}

function buildWorkspaceUrl(route = "/") {
  const baseUrl = currentState?.hub?.url;
  if (!baseUrl) return "";
  const url = new URL(baseUrl);
  url.pathname = route;
  url.searchParams.set("autologin", "1");
  url.searchParams.set("desktop", "1");
  return url.toString();
}

function setActiveNav(route) {
  stateEl.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.route === route);
  });
}

function setWorkspaceRoute(route = "/", force = false) {
  currentRoute = route;
  setActiveNav(route);

  const url = buildWorkspaceUrl(route);
  if (!url) {
    stateEl.frame.removeAttribute("src");
    stateEl.frame.classList.remove("loaded");
    return;
  }

  if (force || stateEl.frame.dataset.route !== route || stateEl.frame.src !== url) {
    stateEl.frame.dataset.route = route;
    stateEl.frame.classList.remove("loaded");
    stateEl.frame.src = url;
  }
}

function setOverlayState(payload) {
  const hubRunning = payload?.hub?.running === true;
  const bridgeRunning = payload?.bridge?.running === true;

  if (hubRunning) {
    stateEl.overlay.classList.add("hidden");
    stateEl.workspaceTitle.textContent = currentRoute === "/relatorio" ? "Relatorio detalhado embutido" : "Hub local embutido";
    stateEl.workspaceSubtitle.textContent = bridgeRunning
      ? "Hub e motor local online. O programa está pronto para auditoria completa."
      : "Hub online, mas o motor local está parado. Reative o bridge para auditorias completas.";
    return;
  }

  stateEl.overlay.classList.remove("hidden");
  stateEl.overlayTitle.textContent = bridgeRunning ? "Hub local indisponivel" : "Motor e Hub locais offline";
  stateEl.overlayText.textContent = bridgeRunning
    ? "O bridge está ativo, mas o workspace do Hub não respondeu. Tente recarregar o workspace."
    : "O shell está online, mas a camada local do programa ainda não subiu completamente.";
  stateEl.workspaceTitle.textContent = "Workspace aguardando Hub";
  stateEl.workspaceSubtitle.textContent = "Assim que o Hub local subir, ele aparece aqui dentro sem abrir navegador externo.";
}

function setWindowState(payload) {
  const maximized = payload?.maximized === true;
  stateEl.winMaximize.textContent = maximized ? "❐" : "□";
  stateEl.winMaximize.setAttribute("aria-label", maximized ? "Restaurar" : "Maximizar");
}

function setBridgeState(payload) {
  currentState = payload;

  const bridgeRunning = payload?.bridge?.running === true;
  const hubRunning = payload?.hub?.running === true;

  stateEl.service.textContent = payload?.serviceName ?? "SitePulse Desktop";
  stateEl.runtime.textContent = shortPath(payload?.qaRuntimeDir);
  stateEl.webRuntime.textContent = shortPath(payload?.webRuntimeDir);
  stateEl.reports.textContent = shortPath(payload?.reportsDir);
  stateEl.bridge.textContent = bridgeRunning
    ? `${payload.bridge.host}:${payload.bridge.port}`
    : "offline";
  stateEl.hub.textContent = hubRunning
    ? `${payload.hub.host}:${payload.hub.port}`
    : "offline";
  stateEl.autostart.textContent = payload?.launchOnLogin ? "ativado" : "desativado";
  stateEl.loginToggle.checked = !!payload?.launchOnLogin;
  stateEl.startBtn.disabled = bridgeRunning;
  stateEl.stopBtn.disabled = !bridgeRunning;

  setMetaChip(stateEl.bridgeChip, bridgeRunning ? "bridge online" : "bridge offline", bridgeRunning ? "ok" : "warn");
  setMetaChip(stateEl.hubChip, hubRunning ? "hub online" : "hub offline", hubRunning ? "ok" : "warn");
  setMetaChip(stateEl.modeChip, "workspace desktop", "ok");

  replaceLogs(payload?.logs);
  setOverlayState(payload);

  if (hubRunning && !stateEl.frame.src.startsWith("http://")) {
    setWorkspaceRoute(currentRoute, true);
  }
}

async function ensureWorkspace(route = currentRoute, force = false) {
  const result = await window.sitePulseCompanion.openHub();
  if (!result.ok) {
    appendLog(`[workspace] falha ao abrir Hub: ${result.error || result.detail || "unknown"}`);
    return;
  }
  appendLog(`[workspace] hub pronto em ${result.url}`);
  setWorkspaceRoute(route, force);
}

async function refreshWorkspace() {
  const result = await window.sitePulseCompanion.refreshHub();
  if (!result.ok) {
    appendLog(`[workspace] falha ao atualizar Hub: ${result.error || result.detail || "unknown"}`);
    return;
  }
  appendLog("[workspace] Hub local revalidado.");
  setBridgeState(await window.sitePulseCompanion.getState());
  setWorkspaceRoute(currentRoute, true);
}

stateEl.startBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.startBridge();
  if (!result.ok) {
    appendLog(`[engine] falha ao iniciar bridge: ${result.detail || result.error}`);
    return;
  }
  appendLog("[engine] motor local ativado.");
  await refreshWorkspace();
});

stateEl.stopBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.stopBridge();
  if (!result.ok) {
    appendLog(`[engine] falha ao parar bridge: ${result.detail || result.error}`);
    return;
  }
  appendLog("[engine] motor local parado.");
  setBridgeState(await window.sitePulseCompanion.getState());
});

stateEl.refreshHubBtn.addEventListener("click", async () => {
  await refreshWorkspace();
});

stateEl.recoverWorkspaceBtn.addEventListener("click", async () => {
  await refreshWorkspace();
});

stateEl.openReportWorkspaceBtn.addEventListener("click", async () => {
  await ensureWorkspace("/relatorio", true);
});

stateEl.openReportsBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.openReports();
  appendLog(result.ok ? "[reports] pasta local aberta." : `[reports] falha ao abrir: ${result.error || "unknown"}`);
});

stateEl.openReportsNavBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.openReports();
  appendLog(result.ok ? "[reports] vault local aberto." : `[reports] falha ao abrir vault: ${result.error || "unknown"}`);
});

stateEl.reloadWorkspaceNavBtn.addEventListener("click", async () => {
  await refreshWorkspace();
});

stateEl.copyBridgeBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.copyBridgeUrl();
  appendLog(result.ok ? "[bridge] URL copiada." : `[bridge] falha ao copiar URL: ${result.error || "unknown"}`);
});

stateEl.loginToggle.addEventListener("change", async () => {
  const result = await window.sitePulseCompanion.setLaunchOnLogin(stateEl.loginToggle.checked);
  appendLog(
    result.ok
      ? `[desktop] iniciar com Windows ${result.enabled ? "ativado" : "desativado"}.`
      : `[desktop] falha ao alterar autostart: ${result.error || "unknown"}`
  );
});

stateEl.clearLogBtn.addEventListener("click", () => {
  localLogs = ["[desktop-shell] log limpo localmente"];
  renderLogs();
});

stateEl.navItems.forEach((item) => {
  item.addEventListener("click", async () => {
    const route = item.dataset.route || "/";
    await ensureWorkspace(route, true);
  });
});

stateEl.frame.addEventListener("load", () => {
  stateEl.frame.classList.add("loaded");
  appendLog(`[workspace] frame carregado: ${currentRoute}`);
});

stateEl.winMinimize.addEventListener("click", async () => {
  await window.sitePulseCompanion.minimizeWindow();
});

stateEl.winMaximize.addEventListener("click", async () => {
  const payload = await window.sitePulseCompanion.toggleMaximizeWindow();
  if (payload?.ok) setWindowState(payload);
});

stateEl.winClose.addEventListener("click", async () => {
  await window.sitePulseCompanion.closeWindow();
});

window.sitePulseCompanion.onLog((line) => {
  appendLog(line);
});

window.sitePulseCompanion.onState((payload) => {
  setBridgeState(payload);
});

window.sitePulseCompanion.onWindowState((payload) => {
  setWindowState(payload);
});

async function bootstrap() {
  const [payload, windowState] = await Promise.all([
    window.sitePulseCompanion.getState(),
    window.sitePulseCompanion.getWindowState(),
  ]);
  setBridgeState(payload);
  setWindowState(windowState);
  if (payload?.hub?.running) {
    setWorkspaceRoute("/", true);
  }
}

bootstrap().catch((error) => {
  appendLog(`[desktop-shell] falha ao carregar estado inicial: ${error?.message || error}`);
});
