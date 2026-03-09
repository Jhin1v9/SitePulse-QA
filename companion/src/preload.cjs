const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("sitePulseCompanion", {
  getState: () => ipcRenderer.invoke("companion:get-state"),
  startBridge: () => ipcRenderer.invoke("companion:start-bridge"),
  stopBridge: () => ipcRenderer.invoke("companion:stop-bridge"),
  openHub: () => ipcRenderer.invoke("companion:open-hub"),
  openReports: () => ipcRenderer.invoke("companion:open-reports"),
  copyBridgeUrl: () => ipcRenderer.invoke("companion:copy-bridge-url"),
  getLaunchOnLogin: () => ipcRenderer.invoke("companion:get-launch-on-login"),
  setLaunchOnLogin: (enabled) => ipcRenderer.invoke("companion:set-launch-on-login", !!enabled),
  onLog: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:log", wrapped);
    return () => ipcRenderer.removeListener("companion:log", wrapped);
  },
  onState: (callback) => {
    const wrapped = (_event, payload) => callback(payload);
    ipcRenderer.on("companion:state", wrapped);
    return () => ipcRenderer.removeListener("companion:state", wrapped);
  }
});
