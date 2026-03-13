const { contextBridge, ipcRenderer } = require("electron");

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
