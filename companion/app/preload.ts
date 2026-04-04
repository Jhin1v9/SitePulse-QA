/**
 * SitePulse OS - Preload Script
 * Expõe API segura ao renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { SitePulseAPI, IpcResponse, ScanConfig, FindingFilters, Finding, ReportOptions } from './src/types/ipc';

// API exposta ao window.sitepulse
const sitepulseAPI: SitePulseAPI = {
  // ===== SISTEMA =====
  ping: async () => {
    return ipcRenderer.invoke('app:ping');
  },
  
  getVersion: async () => {
    return ipcRenderer.invoke('app:get-version');
  },

  // ===== MOTORES =====
  getEngines: async () => {
    return ipcRenderer.invoke('engine:list');
  },
  
  getEngine: async (id: string) => {
    return ipcRenderer.invoke('engine:get', id);
  },
  
  activateEngine: async (id: string) => {
    return ipcRenderer.invoke('engine:activate', id);
  },
  
  deactivateEngine: async (id: string) => {
    return ipcRenderer.invoke('engine:deactivate', id);
  },

  // ===== SCANS =====
  startScan: async (config: ScanConfig) => {
    return ipcRenderer.invoke('scan:start', config);
  },
  
  stopScan: async (scanId: string) => {
    return ipcRenderer.invoke('scan:stop', scanId);
  },

  // ===== FINDINGS =====
  getFindings: async (filters?: FindingFilters) => {
    return ipcRenderer.invoke('findings:list', filters);
  },
  
  updateFinding: async (id: string, data: Partial<Finding>) => {
    return ipcRenderer.invoke('finding:update', id, data);
  },

  // ===== ARQUIVOS =====
  readDir: async (path: string) => {
    return ipcRenderer.invoke('fs:read-dir', path);
  },
  
  readFile: async (path: string) => {
    return ipcRenderer.invoke('fs:read-file', path);
  },
  
  writeFile: async (path: string, content: string) => {
    return ipcRenderer.invoke('fs:write-file', path, content);
  },
  
  deleteFile: async (path: string) => {
    return ipcRenderer.invoke('fs:delete', path);
  },
  
  mkdir: async (path: string) => {
    return ipcRenderer.invoke('fs:mkdir', path);
  },
  
  exists: async (path: string) => {
    return ipcRenderer.invoke('fs:exists', path);
  },

  // ===== RELATÓRIOS =====
  generateReport: async (options: ReportOptions) => {
    return ipcRenderer.invoke('report:generate', options);
  },
  
  exportReport: async (id: string, format: string) => {
    return ipcRenderer.invoke('report:export', id, format);
  },

  // ===== EVENTOS (LISTENERS) =====
  on: (channel: string, callback: (...args: any[]) => void) => {
    // Validar canal permitido
    const validChannels = [
      'engine:status',
      'engine:metrics',
      'scan:progress',
      'scan:complete',
      'findings:new',
      'system:notification',
    ];
    
    if (validChannels.includes(channel)) {
      const wrappedCallback = (_event: any, ...args: any[]) => callback(...args);
      ipcRenderer.on(channel, wrappedCallback);
    } else {
      console.warn(`Canal não permitido: ${channel}`);
    }
  },
  
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// Expor API ao window
contextBridge.exposeInMainWorld('sitepulse', sitepulseAPI);

// Log para debug
console.log('[Preload] SitePulse API exposta ao window.sitepulse');
