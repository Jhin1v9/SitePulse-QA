const stateEl = {
  service: document.getElementById("service"),
  runtime: document.getElementById("runtime"),
  bridge: document.getElementById("bridge"),
  reports: document.getElementById("reports"),
  autostart: document.getElementById("autostart"),
  log: document.getElementById("log"),
  startBtn: document.getElementById("startBridge"),
  stopBtn: document.getElementById("stopBridge"),
  openHubBtn: document.getElementById("openHub"),
  openReportsBtn: document.getElementById("openReports"),
  copyBridgeBtn: document.getElementById("copyBridgeUrl"),
  loginToggle: document.getElementById("launchOnLogin")
};

function appendLog(line) {
  stateEl.log.textContent = `${line}\n${stateEl.log.textContent}`.trim();
}

function setBridgeState(payload) {
  const running = payload?.bridge?.running === true;
  stateEl.service.textContent = payload?.serviceName ?? "sitepulse-companion-bridge";
  stateEl.runtime.textContent = payload?.qaRuntimeDir ?? "n/a";
  stateEl.bridge.textContent = running
    ? `${payload.bridge.host}:${payload.bridge.port} (${payload.bridge.service})`
    : "offline";
  stateEl.reports.textContent = payload?.reportsDir ?? "n/a";
  stateEl.autostart.textContent = payload?.launchOnLogin ? "ativado" : "desativado";
  stateEl.startBtn.disabled = running;
  stateEl.stopBtn.disabled = !running;
  stateEl.loginToggle.checked = !!payload?.launchOnLogin;
}

async function refreshState() {
  const payload = await window.sitePulseCompanion.getState();
  setBridgeState(payload);
}

stateEl.startBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.startBridge();
  if (!result.ok) appendLog(`[ui] falha ao iniciar bridge: ${result.detail || result.error}`);
});

stateEl.stopBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.stopBridge();
  if (!result.ok) appendLog(`[ui] falha ao parar bridge: ${result.detail || result.error}`);
});

stateEl.openHubBtn.addEventListener("click", async () => {
  await window.sitePulseCompanion.openHub();
});

stateEl.openReportsBtn.addEventListener("click", async () => {
  await window.sitePulseCompanion.openReports();
});

stateEl.copyBridgeBtn.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.copyBridgeUrl();
  appendLog(result.ok ? "[ui] url do bridge copiada." : `[ui] falha ao copiar: ${result.error || "unknown"}`);
});

stateEl.loginToggle.addEventListener("change", async () => {
  const result = await window.sitePulseCompanion.setLaunchOnLogin(stateEl.loginToggle.checked);
  appendLog(result.ok ? `[ui] iniciar com Windows: ${result.enabled ? "ativado" : "desativado"}` : `[ui] falha ao alterar autostart: ${result.error || "unknown"}`);
});

window.sitePulseCompanion.onLog((line) => {
  appendLog(line);
});

window.sitePulseCompanion.onState((payload) => {
  setBridgeState(payload);
});

refreshState().catch((error) => {
  appendLog(`[ui] falha ao carregar estado inicial: ${error?.message || error}`);
});
