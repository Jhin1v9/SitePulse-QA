import type {
  EngineListResponse,
  EngineGetResponse,
  EngineActivateResponse,
  FileReadDirResponse,
  FileWriteFileResponse,
  FileReadFileResponse,
  ScanStartRequest,
  ScanStartResponse,
  ScanStopResponse,
  FindingsListResponse,
  ReportGenerateResponse,
  SitePulseAPI,
} from '../types/ipc';

// Usar a declaração global de types/ipc.ts
declare global {
  interface Window {
    sitepulse?: SitePulseAPI;
  }
}

/**
 * Verifica se a API IPC está disponível
 */
export function isIPCAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.sitepulse;
}

/**
 * Ping para testar conectividade
 */
export async function ping(): Promise<string> {
  if (!window.sitepulse) {
    throw new Error('API IPC não disponível - executando em modo browser?');
  }
  return window.sitepulse.ping();
}

/**
 * Obtém versão da aplicação
 */
export async function getVersion(): Promise<string> {
  if (!window.sitepulse) {
    throw new Error('API IPC não disponível');
  }
  return window.sitepulse.getVersion();
}

/**
 * API de Motores
 */
export const engineAPI = {
  list: (): Promise<EngineListResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.engine.list();
  },
  
  get: (id: string): Promise<EngineGetResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.engine.get(id);
  },
  
  activate: (id: string): Promise<EngineActivateResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.engine.activate(id);
  },
  
  deactivate: (id: string): Promise<EngineActivateResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.engine.deactivate(id);
  },
};

/**
 * API de Sistema de Arquivos
 */
export const fsAPI = {
  readDir: (path: string): Promise<FileReadDirResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.readDir(path);
  },
  
  mkdir: (path: string): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.mkdir(path);
  },
  
  exists: (path: string): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.exists(path);
  },
  
  readFile: (path: string): Promise<FileReadFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.readFile(path);
  },
  
  writeFile: (path: string, content: string): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.writeFile(path, content);
  },
  
  delete: (path: string, recursive?: boolean): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.delete(path, recursive);
  },
  
  stat: (path: string): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.stat(path);
  },
  
  getRoot: (): Promise<FileWriteFileResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.fs.getRoot();
  },
};

/**
 * API de Scans
 */
export const scanAPI = {
  start: (config: ScanStartRequest): Promise<ScanStartResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.scan.start(config);
  },
  
  stop: (scanId: string): Promise<ScanStopResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.scan.stop(scanId);
  },
};

/**
 * API de Findings
 */
export const findingsAPI = {
  list: (): Promise<FindingsListResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.findings.list();
  },
  
  update: (id: string, data: unknown): Promise<EngineActivateResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.findings.update(id, data);
  },
};

/**
 * API de Relatórios
 */
export const reportAPI = {
  generate: (options: unknown): Promise<ReportGenerateResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.report.generate(options);
  },
  
  export: (id: string, format: string): Promise<EngineActivateResponse> => {
    if (!window.sitepulse) throw new Error('API IPC não disponível');
    return window.sitepulse.report.export(id, format);
  },
};

/**
 * Registra listener de eventos
 */
export function onIPCEvent(channel: string, callback: (payload: unknown) => void): (() => void) {
  if (!window.sitepulse) {
    console.warn(`Não pode registrar listener para ${channel}: API IPC não disponível`);
    return () => {};
  }
  return window.sitepulse.on(channel, callback);
}

export default {
  ping,
  getVersion,
  isIPCAvailable,
  engine: engineAPI,
  fs: fsAPI,
  scan: scanAPI,
  findings: findingsAPI,
  report: reportAPI,
  on: onIPCEvent,
};
