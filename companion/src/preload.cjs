const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sitePulseCompanion", {
  getState: () => ipcRenderer.invoke("companion:get-state"),
  startBridge: () => ipcRenderer.invoke("companion:start-bridge"),
  stopBridge: () => ipcRenderer.invoke("companion:stop-bridge"),
  runAudit: (payload) => ipcRenderer.invoke("companion:run-audit", payload),
  openCmdWindow: (payload) => ipcRenderer.invoke("companion:open-cmd-window", payload),
  openReports: () => ipcRenderer.invoke("companion:open-reports"),
  copyBridgeUrl: () => ipcRenderer.invoke("companion:copy-bridge-url"),
  copyText: (value) => ipcRenderer.invoke("companion:copy-text", value),
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
  onWindowState: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:window-state", wrapped);
    return () => ipcRenderer.removeListener("companion:window-state", wrapped);
  },
});
