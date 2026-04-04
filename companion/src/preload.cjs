const { contextBridge, ipcRenderer } = require("electron");

// API para interface v3 (compatível com React hooks)
contextBridge.exposeInMainWorld("electron", {
  invoke: (channel, ...args) => {
    const validChannels = [
      "companion:get-state",
      "companion:minimize",
      "companion:maximize",
      "companion:close",
      "companion:start-audit",
      "companion:cancel-audit",
      "companion:export-report",
      "companion:pick-report",
      "companion:select-directory",
      "companion:get-app-version",
      "companion:engine-action",
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },
  on: (channel, callback) => {
    const validChannels = [
      "companion:state",
      "companion:log",
      "companion:live-report",
      "companion:window-state",
      "companion:notification",
      "companion:engine-status",
    ];
    if (validChannels.includes(channel)) {
      const wrapped = (_event, payload) => callback(payload);
      ipcRenderer.on(channel, wrapped);
      return () => ipcRenderer.removeListener(channel, wrapped);
    }
    return () => {};
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});

// API legada para interface antiga
contextBridge.exposeInMainWorld("sitePulseCompanion", {
  getState: () => ipcRenderer.invoke("companion:get-state"),
  startBridge: () => ipcRenderer.invoke("companion:start-bridge"),
  stopBridge: () => ipcRenderer.invoke("companion:stop-bridge"),
  runAudit: (payload) => ipcRenderer.invoke("companion:run-audit", payload),
  switchAuditToFastMode: (payload) => ipcRenderer.invoke("companion:switch-audit-fast", payload),
  openCmdWindow: (payload) => ipcRenderer.invoke("companion:open-cmd-window", payload),
  openReports: () => ipcRenderer.invoke("companion:open-reports"),
  openLatestEvidence: () => ipcRenderer.invoke("companion:open-latest-evidence"),
  openArtifactFile: (filePath) => ipcRenderer.invoke("companion:open-artifact-file", filePath),
  openArtifactPath: (filePath) => ipcRenderer.invoke("companion:open-artifact-path", filePath),
  openExternalUrl: (value) => ipcRenderer.invoke("companion:open-external-url", value),
  copyBridgeUrl: () => ipcRenderer.invoke("companion:copy-bridge-url"),
  copyText: (value) => ipcRenderer.invoke("companion:copy-text", value),
  pickReportFile: () => ipcRenderer.invoke("companion:pick-report-file"),
  exportReportFile: (payload) => ipcRenderer.invoke("companion:export-report-file", payload),
  getLearningMemory: () => ipcRenderer.invoke("companion:get-learning-memory"),
  applyLearningManualOverride: (payload) => ipcRenderer.invoke("companion:apply-learning-manual-override", payload),
  getHealingSnapshot: (payload) => ipcRenderer.invoke("companion:get-healing-snapshot", payload),
  prepareHealingAttempt: (payload) => ipcRenderer.invoke("companion:prepare-healing-attempt", payload),
  checkForUpdates: () => ipcRenderer.invoke("companion:check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("companion:download-update"),
  installUpdate: () => ipcRenderer.invoke("companion:install-update"),
  getSeoSource: () => ipcRenderer.invoke("companion:get-seo-source"),
  saveSeoSource: (payload) => ipcRenderer.invoke("companion:save-seo-source", payload),
  refreshSeoSource: (payload) => ipcRenderer.invoke("companion:refresh-seo-source", payload),
  getLaunchOnLogin: () => ipcRenderer.invoke("companion:get-launch-on-login"),
  setLaunchOnLogin: (enabled) => ipcRenderer.invoke("companion:set-launch-on-login", !!enabled),
  getWindowState: () => ipcRenderer.invoke("companion:get-window-state"),
  minimizeWindow: () => ipcRenderer.invoke("companion:window-minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("companion:window-maximize-toggle"),
  closeWindow: () => ipcRenderer.invoke("companion:window-close"),
  onLog: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:log", wrapped);
    return () => ipcRenderer.removeListener("companion:log", wrapped);
  },
  onState: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:state", wrapped);
    return () => ipcRenderer.removeListener("companion:state", wrapped);
  },
  onLiveReport: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:live-report", wrapped);
    return () => ipcRenderer.removeListener("companion:live-report", wrapped);
  },
  onWindowState: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:window-state", wrapped);
    return () => ipcRenderer.removeListener("companion:window-state", wrapped);
  },
});

// ============================================
// SITEPULSE OS API (Desktop OS Interface)
// ============================================
contextBridge.exposeInMainWorld("sitepulse", {
  // Sistema
  ping: () => ipcRenderer.invoke('app:ping'),
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  
  // Motores (10 Neural Engines)
  engine: {
    list: () => ipcRenderer.invoke('engine:list'),
    get: (id) => ipcRenderer.invoke('engine:get', id),
    activate: (id) => ipcRenderer.invoke('engine:activate', id),
    deactivate: (id) => ipcRenderer.invoke('engine:deactivate', id),
  },
  
  // Sistema de Arquivos
  fs: {
    readDir: (path) => ipcRenderer.invoke('fs:read-dir', path),
    mkdir: (path) => ipcRenderer.invoke('fs:mkdir', path),
    exists: (path) => ipcRenderer.invoke('fs:exists', path),
    readFile: (path) => ipcRenderer.invoke('fs:read-file', path),
    writeFile: (path, content) => ipcRenderer.invoke('fs:write-file', path, content),
    delete: (path, recursive) => ipcRenderer.invoke('fs:delete', path, recursive),
    stat: (path) => ipcRenderer.invoke('fs:stat', path),
    getRoot: () => ipcRenderer.invoke('workspace:get-root'),
  },
  
  // Scans
  scan: {
    start: (config) => ipcRenderer.invoke('scan:start', config),
    stop: (scanId) => ipcRenderer.invoke('scan:stop', scanId),
  },
  
  // Findings (Achados de auditoria)
  findings: {
    list: () => ipcRenderer.invoke('findings:list'),
    update: (id, data) => ipcRenderer.invoke('finding:update', id, data),
  },
  
  // Relatórios
  report: {
    generate: (options) => ipcRenderer.invoke('report:generate', options),
    export: (id, format) => ipcRenderer.invoke('report:export', id, format),
  },
  
  // Eventos (on/once/off)
  on: (channel, callback) => {
    const validChannels = [
      'scan:progress',
      'engine:status-changed',
      'notification',
    ];
    if (validChannels.includes(channel)) {
      const wrapped = (_event, payload) => callback(payload);
      ipcRenderer.on(channel, wrapped);
      return () => ipcRenderer.removeListener(channel, wrapped);
    }
    console.warn(`Canal inválido: ${channel}`);
    return () => {};
  },
});

console.log('[Preload] APIs registradas: electron, sitePulseCompanion, sitepulse');
