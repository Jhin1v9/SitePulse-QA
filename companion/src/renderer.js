const LAST_REPORT_KEY = "sitepulse-studio:last-report-v1";
const LAST_PROFILE_KEY = "sitepulse-studio:last-profile-v1";

const ISSUE_GROUP = {
  ROUTE_LOAD_FAIL: "Route load failure",
  BTN_CLICK_ERROR: "Action failed",
  BTN_NO_EFFECT: "No effect detected",
  HTTP_4XX: "Client request failure",
  HTTP_5XX: "Server failure",
  NET_REQUEST_FAILED: "Network failure",
  JS_RUNTIME_ERROR: "Runtime JavaScript failure",
  CONSOLE_ERROR: "Console error",
  VISUAL_SECTION_ORDER_INVALID: "Visual order mismatch",
  VISUAL_SECTION_MISSING: "Missing section",
};

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
  copyBridgeUrl: document.getElementById("copyBridgeUrl"),
  targetUrl: document.getElementById("targetUrl"),
  modeButtons: Array.from(document.querySelectorAll("[data-mode]")),
  scopeButtons: Array.from(document.querySelectorAll("[data-scope]")),
  depthButtons: Array.from(document.querySelectorAll("[data-depth]")),
  noServer: document.getElementById("noServer"),
  headed: document.getElementById("headed"),
  elevated: document.getElementById("elevated"),
  runAudit: document.getElementById("runAudit"),
  runCmd: document.getElementById("runCmd"),
  copyReplayCommand: document.getElementById("copyReplayCommand"),
  copyQuickPrompt: document.getElementById("copyQuickPrompt"),
  headlineStatus: document.getElementById("headlineStatus"),
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
  issueMetaPills: document.getElementById("issueMetaPills"),
  currentTarget: document.getElementById("currentTarget"),
  currentMode: document.getElementById("currentMode"),
  currentScope: document.getElementById("currentScope"),
  currentDepth: document.getElementById("currentDepth"),
  currentDuration: document.getElementById("currentDuration"),
  currentCommand: document.getElementById("currentCommand"),
  quickPromptBox: document.getElementById("quickPromptBox"),
  clearLog: document.getElementById("clearLog"),
  logOutput: document.getElementById("logOutput"),
  winMinimize: document.getElementById("winMinimize"),
  winMaximize: document.getElementById("winMaximize"),
  winClose: document.getElementById("winClose"),
};

let currentState = null;
let currentReport = null;
let currentMode = "desktop";
let currentScope = "full";
let currentDepth = "signal";
let localLogs = ["[studio] waiting for engine telemetry"];

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseSeverity(value, fallbackCode = "") {
  if (value === "high" || value === "medium" || value === "low") return value;
  if (["HTTP_5XX", "JS_RUNTIME_ERROR", "VISUAL_SECTION_ORDER_INVALID"].includes(fallbackCode)) return "high";
  if (["HTTP_4XX", "BTN_CLICK_ERROR", "NET_REQUEST_FAILED"].includes(fallbackCode)) return "medium";
  return "low";
}

function normalizeScope(value) {
  if (value === "seo" || value === "experience" || value === "full") return value;
  return "full";
}

function formatDuration(durationMs) {
  const ms = toNumber(durationMs, 0);
  if (!ms) return "0s";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}m ${remain}s`;
}

function shortPath(value) {
  const text = String(value || "n/a");
  return text.length > 84 ? `...${text.slice(-81)}` : text;
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

function setChip(el, text, tone = "default") {
  el.textContent = text;
  el.classList.remove("ok", "warn", "bad");
  if (tone === "ok") el.classList.add("ok");
  if (tone === "warn") el.classList.add("warn");
  if (tone === "bad") el.classList.add("bad");
}

function renderLogs() {
  stateEl.logOutput.textContent = localLogs.join("\n");
}

function appendLog(line) {
  localLogs = [line, ...localLogs].slice(0, 500);
  renderLogs();
}

function replaceLogs(lines) {
  localLogs = Array.isArray(lines) && lines.length ? [...lines] : ["[studio] waiting for engine telemetry"];
  renderLogs();
}

function persistProfile() {
  const payload = {
    targetUrl: stateEl.targetUrl.value.trim(),
    mode: currentMode,
    scope: currentScope,
    depth: currentDepth,
    noServer: stateEl.noServer.checked,
    headed: stateEl.headed.checked,
    elevated: stateEl.elevated.checked,
  };
  localStorage.setItem(LAST_PROFILE_KEY, JSON.stringify(payload));
}

function restoreProfile() {
  try {
    const raw = localStorage.getItem(LAST_PROFILE_KEY);
    if (!raw) {
      stateEl.targetUrl.value = "https://example.com";
      return;
    }
    const payload = JSON.parse(raw);
    stateEl.targetUrl.value = String(payload.targetUrl || "https://example.com");
    currentMode = payload.mode === "mobile" ? "mobile" : "desktop";
    currentScope = normalizeScope(payload.scope);
    currentDepth = payload.depth === "deep" ? "deep" : "signal";
    stateEl.noServer.checked = payload.noServer !== false;
    stateEl.headed.checked = payload.headed === true;
    stateEl.elevated.checked = payload.elevated === true;
  } catch {
    stateEl.targetUrl.value = "https://example.com";
  }
}

function persistReport(raw) {
  localStorage.setItem(LAST_REPORT_KEY, JSON.stringify(raw));
}

function restoreReport() {
  try {
    const raw = localStorage.getItem(LAST_REPORT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeReport(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const meta = source.meta && typeof source.meta === "object" ? source.meta : {};
  const summary = source.summary && typeof source.summary === "object" ? source.summary : {};
  const guide = source.assistantGuide && typeof source.assistantGuide === "object" ? source.assistantGuide : {};
  const seo = source.seo && typeof source.seo === "object" ? source.seo : {};
  const issuesRaw = Array.isArray(source.issues) ? source.issues : [];
  const issues = issuesRaw.map((item, index) => {
    const issue = item && typeof item === "object" ? item : {};
    const code = String(issue.code || "UNKNOWN");
    const severity = parseSeverity(issue.severity, code);
    return {
      id: String(issue.id || `issue-${index + 1}`),
      code,
      severity,
      route: String(issue.route || "/"),
      action: String(issue.action || ""),
      detail: String(issue.detail || "No detail provided."),
      recommendedResolution: String(issue.recommendedResolution || "Review the root cause and validate with a new run."),
      group: ISSUE_GROUP[code] || "Other issue",
      assistantHint: issue.assistantHint && typeof issue.assistantHint === "object" ? issue.assistantHint : {},
    };
  });
  const actionSweep = Array.isArray(source.actionSweep) ? source.actionSweep : [];

  return {
    meta: {
      baseUrl: String(meta.baseUrl || "https://example.com"),
      generatedAt: String(meta.generatedAt || meta.finishedAt || new Date().toISOString()),
      auditScope: normalizeScope(summary.auditScope || meta.auditScope || currentScope),
    },
    summary: {
      routesChecked: toNumber(summary.routesChecked, 0),
      buttonsChecked: toNumber(summary.buttonsChecked, 0),
      totalIssues: toNumber(summary.totalIssues, issues.length),
      visualSectionOrderInvalid: toNumber(summary.visualSectionOrderInvalid, 0),
      buttonsNoEffect: toNumber(summary.buttonsNoEffect, 0),
      consoleErrors: toNumber(summary.consoleErrors, 0),
      actionsMapped: toNumber(summary.actionsMapped, actionSweep.length || toNumber(summary.buttonsChecked, 0)),
      seoScore: toNumber(summary.seoScore, toNumber(seo.overallScore, 0)),
      seoCriticalIssues: toNumber(summary.seoCriticalIssues, 0),
    },
    assistantGuide: {
      replayCommand: String(guide.replayCommand || "Run an audit to generate the replay command."),
      immediateSteps: Array.isArray(guide.immediateSteps) ? guide.immediateSteps.map((item) => String(item)) : [],
      quickStartPrompt: String(guide.quickStartPrompt || "Run an audit to generate the professional fix prompt."),
    },
    seo: {
      overallScore: toNumber(seo.overallScore, 0),
      topRecommendations: Array.isArray(seo.topRecommendations) ? seo.topRecommendations.map((item) => String(item)) : [],
    },
    issues,
  };
}

function setActiveButton(buttons, activeValue, fieldName) {
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset[fieldName] === activeValue);
  });
}

function currentDepthLabel() {
  return currentDepth === "deep" ? "deep crawl" : "signal sweep";
}

function collectRunInput(forceFullAudit = null) {
  persistProfile();
  return {
    baseUrl: stateEl.targetUrl.value.trim(),
    mode: currentMode,
    scope: currentScope,
    noServer: stateEl.noServer.checked,
    headed: stateEl.headed.checked,
    fullAudit: forceFullAudit === null ? currentDepth === "deep" : forceFullAudit,
    elevated: stateEl.elevated.checked,
  };
}

function updateStaticSelections() {
  setActiveButton(stateEl.modeButtons, currentMode, "mode");
  setActiveButton(stateEl.scopeButtons, currentScope, "scope");
  setActiveButton(stateEl.depthButtons, currentDepth, "depth");
  stateEl.currentMode.textContent = currentMode;
  stateEl.currentScope.textContent = currentScope;
  stateEl.currentDepth.textContent = currentDepthLabel();
}

function renderAuditState(audit = {}) {
  const status = String(audit.status || "idle");
  stateEl.auditStatus.textContent = status;
  stateEl.currentTarget.textContent = audit.baseUrl || "none";
  stateEl.currentMode.textContent = audit.mode || currentMode;
  stateEl.currentScope.textContent = audit.scope || currentScope;
  stateEl.currentDepth.textContent = currentDepthLabel();
  stateEl.currentDuration.textContent = formatDuration(audit.durationMs);
  stateEl.currentCommand.textContent = audit.lastCommand || "Run an audit to generate a replay command.";

  const busy = audit.running === true;
  stateEl.runAudit.disabled = busy;
  stateEl.runCmd.disabled = busy;
  stateEl.startBridge.disabled = busy || currentState?.bridge?.running === true;
  stateEl.stopBridge.disabled = busy || currentState?.bridge?.running !== true;
  stateEl.runAudit.textContent = busy ? "Audit running..." : "Run native audit";

  if (busy) {
    setChip(stateEl.auditChip, "audit running", "warn");
    stateEl.headlineStatus.textContent = `Engine is auditing ${audit.baseUrl || "the selected target"}. Logs and evidence are streaming live.`;
    return;
  }

  if (status === "failed") {
    setChip(stateEl.auditChip, "audit failed", "bad");
    stateEl.headlineStatus.textContent = audit.lastError || "The engine failed to complete the run.";
    return;
  }

  if (status === "issues") {
    setChip(stateEl.auditChip, "issues detected", "warn");
    stateEl.headlineStatus.textContent = "The audit completed and detected issues worth fixing before the next validation run.";
    return;
  }

  if (status === "clean") {
    setChip(stateEl.auditChip, "clean run", "ok");
    stateEl.headlineStatus.textContent = "The latest run completed clean. Keep this as your baseline and monitor regressions.";
    return;
  }

  setChip(stateEl.auditChip, "audit idle", "default");
  stateEl.headlineStatus.textContent = "Ready to run a new audit.";
}

function renderCompanionState(payload) {
  currentState = payload;
  stateEl.serviceName.textContent = payload?.serviceName || "SitePulse Studio";
  stateEl.versionText.textContent = payload?.version || "1.0.0";
  stateEl.runtimePath.textContent = shortPath(payload?.qaRuntimeDir);
  stateEl.reportsPath.textContent = shortPath(payload?.reportsDir);
  stateEl.bridgeAddress.textContent = `${payload?.bridge?.host || "127.0.0.1"}:${payload?.bridge?.port || "47891"}`;
  stateEl.launchOnLogin.checked = payload?.launchOnLogin === true;

  const bridgeRunning = payload?.bridge?.running === true;
  stateEl.bridgeStatus.textContent = bridgeRunning ? `${payload.bridge.host}:${payload.bridge.port}` : "offline";
  setChip(stateEl.bridgeChip, bridgeRunning ? "engine online" : "engine offline", bridgeRunning ? "ok" : "bad");
  setChip(stateEl.buildChip, `studio ${payload?.version || "1.0.0"}`, "ok");

  replaceLogs(payload?.logs);
  renderAuditState(payload?.audit || {});
}

function renderSteps(report) {
  const steps = [
    ...(report?.assistantGuide?.immediateSteps || []),
    ...(report?.seo?.topRecommendations || []),
  ].filter(Boolean).slice(0, 6);

  if (!steps.length) {
    stateEl.stepsList.innerHTML = "<li>Run an audit to generate the first operating brief.</li>";
    return;
  }

  stateEl.stepsList.innerHTML = steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderIssueMeta(report) {
  if (!report) {
    stateEl.issueMetaPills.innerHTML = "";
    return;
  }

  const issues = report.issues;
  const high = issues.filter((item) => item.severity === "high").length;
  const medium = issues.filter((item) => item.severity === "medium").length;
  const low = issues.filter((item) => item.severity === "low").length;
  stateEl.issueMetaPills.innerHTML = [
    `<span class="pill bad">high ${high}</span>`,
    `<span class="pill warn">medium ${medium}</span>`,
    `<span class="pill">low ${low}</span>`,
  ].join("");
}

function renderIssues(report) {
  if (!report || !report.issues.length) {
    stateEl.issuesList.innerHTML = '<article class="empty-state">No issues in the latest report. The board is clean.</article>';
    renderIssueMeta(report);
    return;
  }

  renderIssueMeta(report);
  const topIssues = report.issues.slice(0, 10);
  stateEl.issuesList.innerHTML = topIssues
    .map((issue) => {
      const checks = Array.isArray(issue.assistantHint?.firstChecks) ? issue.assistantHint.firstChecks.slice(0, 3) : [];
      const priority = issue.assistantHint?.priority ? `<span class="pill">${escapeHtml(issue.assistantHint.priority)}</span>` : "";
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
          <p class="issue-detail">${escapeHtml(issue.detail)}</p>
          <p class="issue-fix"><strong>Recommended fix:</strong> ${escapeHtml(issue.recommendedResolution)}</p>
          ${checks.length ? `<p class="issue-checks"><strong>First checks:</strong> ${escapeHtml(checks.join(" | "))}</p>` : ""}
        </article>
      `;
    })
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
  stateEl.visualSignal.textContent = String(countByCode(issues, ["VISUAL_SECTION_ORDER_INVALID", "VISUAL_SECTION_MISSING"]));
  stateEl.seoSignal.textContent = String(report.summary.seoCriticalIssues || 0);
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

function renderPrompt(report) {
  stateEl.quickPromptBox.textContent = report?.assistantGuide?.quickStartPrompt || "Run an audit to generate the professional fix prompt.";
}

function renderReport(report) {
  currentReport = report;
  renderMetrics(report);
  renderSignals(report);
  renderSteps(report);
  renderIssues(report);
  renderPrompt(report);
}

function syncSelectionButtons() {
  updateStaticSelections();
}

async function copyText(text, successMessage) {
  const payload = String(text || "").trim();
  if (!payload) {
    appendLog("[studio] nothing to copy yet.");
    return;
  }
  await window.sitePulseCompanion.copyText(payload);
  appendLog(successMessage);
}

async function runAudit() {
  const input = collectRunInput();
  if (!input.baseUrl) {
    stateEl.headlineStatus.textContent = "Target URL is required before the engine can start.";
    return;
  }

  const payload = await window.sitePulseCompanion.runAudit(input);
  if (!payload?.ok || !payload?.report) {
    stateEl.headlineStatus.textContent = payload?.detail || payload?.error || "The audit failed before producing a report.";
    appendLog(`[studio] audit failed: ${payload?.detail || payload?.error || "unknown"}`);
    return;
  }

  const report = normalizeReport(payload.report);
  persistReport(payload.report);
  renderReport(report);
  stateEl.currentCommand.textContent = payload.command || report.assistantGuide.replayCommand;
  if (payload.usedFallback === true) {
    appendLog("[studio] run completed with fallback mode active.");
  }
}

async function openCmdWindow() {
  const input = collectRunInput(true);
  if (!input.baseUrl) {
    stateEl.headlineStatus.textContent = "Target URL is required before opening the CMD flow.";
    return;
  }
  const payload = await window.sitePulseCompanion.openCmdWindow(input);
  if (payload?.ok) {
    appendLog(`[studio] ${payload.message || "cmd flow requested."}`);
    stateEl.headlineStatus.textContent = payload.message || "CMD flow requested.";
    if (payload.recommendedCommand) {
      stateEl.currentCommand.textContent = payload.recommendedCommand;
    }
    return;
  }

  stateEl.headlineStatus.textContent = payload?.detail || payload?.error || "The CMD flow could not be opened.";
}

stateEl.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode === "mobile" ? "mobile" : "desktop";
    syncSelectionButtons();
    persistProfile();
  });
});

stateEl.scopeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentScope = normalizeScope(button.dataset.scope);
    syncSelectionButtons();
    persistProfile();
  });
});

stateEl.depthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentDepth = button.dataset.depth === "deep" ? "deep" : "signal";
    syncSelectionButtons();
    persistProfile();
  });
});

[stateEl.targetUrl, stateEl.noServer, stateEl.headed, stateEl.elevated].forEach((node) => {
  node.addEventListener("input", () => persistProfile());
  node.addEventListener("change", () => persistProfile());
});

stateEl.runAudit.addEventListener("click", async () => {
  await runAudit();
});

stateEl.runCmd.addEventListener("click", async () => {
  await openCmdWindow();
});

stateEl.startBridge.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.startBridge();
  appendLog(result.ok ? "[studio] engine started." : `[studio] engine start failed: ${result.detail || result.error || "unknown"}`);
});

stateEl.stopBridge.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.stopBridge();
  appendLog(result.ok ? "[studio] engine stopped." : `[studio] engine stop failed: ${result.detail || result.error || "unknown"}`);
});

stateEl.openReports.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.openReports();
  appendLog(result.ok ? "[studio] report vault opened." : `[studio] could not open report vault: ${result.error || "unknown"}`);
});

stateEl.copyBridgeUrl.addEventListener("click", async () => {
  const result = await window.sitePulseCompanion.copyBridgeUrl();
  appendLog(result.ok ? "[studio] bridge URL copied." : `[studio] could not copy bridge URL: ${result.error || "unknown"}`);
});

stateEl.copyReplayCommand.addEventListener("click", async () => {
  await copyText(stateEl.currentCommand.textContent, "[studio] replay command copied.");
});

stateEl.copyQuickPrompt.addEventListener("click", async () => {
  await copyText(stateEl.quickPromptBox.textContent, "[studio] fix prompt copied.");
});

stateEl.launchOnLogin.addEventListener("change", async () => {
  const result = await window.sitePulseCompanion.setLaunchOnLogin(stateEl.launchOnLogin.checked);
  appendLog(result.ok ? `[studio] open on login ${result.enabled ? "enabled" : "disabled"}.` : `[studio] launch on login failed: ${result.error || "unknown"}`);
});

stateEl.clearLog.addEventListener("click", () => {
  localLogs = ["[studio] local log cleared"];
  renderLogs();
});

stateEl.winMinimize.addEventListener("click", async () => {
  await window.sitePulseCompanion.minimizeWindow();
});

stateEl.winMaximize.addEventListener("click", async () => {
  const payload = await window.sitePulseCompanion.toggleMaximizeWindow();
  if (!payload?.ok) return;
  const glyph = payload.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  stateEl.winMaximize.textContent = glyph;
});

stateEl.winClose.addEventListener("click", async () => {
  await window.sitePulseCompanion.closeWindow();
});

window.sitePulseCompanion.onLog((line) => {
  appendLog(line);
});

window.sitePulseCompanion.onState((payload) => {
  renderCompanionState(payload);
});

window.sitePulseCompanion.onWindowState((payload) => {
  const glyph = payload?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  stateEl.winMaximize.textContent = glyph;
});

async function bootstrap() {
  restoreProfile();
  syncSelectionButtons();

  const savedReport = restoreReport();
  if (savedReport) {
    renderReport(normalizeReport(savedReport));
  } else {
    renderReport(null);
  }

  const [payload, windowState] = await Promise.all([
    window.sitePulseCompanion.getState(),
    window.sitePulseCompanion.getWindowState(),
  ]);

  renderCompanionState(payload);
  const glyph = windowState?.maximized ? String.fromCharCode(10064) : String.fromCharCode(9633);
  stateEl.winMaximize.textContent = glyph;
}

bootstrap().catch((error) => {
  appendLog(`[studio] bootstrap failed: ${error?.message || error}`);
});
