/**
 * IPC Types - Comunicação entre SitePulse OS e Backend
 */

// Canais de comunicação (nomes dos eventos)
export const IPC_CHANNELS = {
  // Sistema
  PING: 'app:ping',
  PONG: 'app:pong',
  GET_VERSION: 'app:get-version',
  
  // Motores
  ENGINE_LIST: 'engine:list',
  ENGINE_GET: 'engine:get',
  ENGINE_ACTIVATE: 'engine:activate',
  ENGINE_DEACTIVATE: 'engine:deactivate',
  ENGINE_STATUS: 'engine:status',
  ENGINE_METRICS: 'engine:metrics',
  
  // Scans
  SCAN_START: 'scan:start',
  SCAN_STOP: 'scan:stop',
  SCAN_STATUS: 'scan:status',
  SCAN_PROGRESS: 'scan:progress',
  SCAN_COMPLETE: 'scan:complete',
  
  // Findings
  FINDINGS_LIST: 'findings:list',
  FINDING_GET: 'finding:get',
  FINDING_UPDATE: 'finding:update',
  FINDING_EVIDENCE: 'finding:evidence',
  
  // Arquivos/Sistema
  FS_READ_DIR: 'fs:read-dir',
  FS_READ_FILE: 'fs:read-file',
  FS_WRITE_FILE: 'fs:write-file',
  FS_DELETE: 'fs:delete',
  FS_MKDIR: 'fs:mkdir',
  
  // Relatórios
  REPORT_GENERATE: 'report:generate',
  REPORT_EXPORT: 'report:export',
  REPORT_LIST: 'report:list',
  
  // Target
  TARGET_SET: 'target:set',
  TARGET_GET: 'target:get',
  TARGET_HISTORY: 'target:history',
} as const;

// Tipos de resposta IPC
export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Tipos específicos de resposta
export type EngineListResponse = IpcResponse<Array<{ id: string; name: string; status: string; power: number }>>;
export type EngineGetResponse = IpcResponse<{ id: string; name: string; status: string; power?: number }>;
export type FileReadFileResponse = IpcResponse<string>;
export type EngineActivateResponse = IpcResponse<void>;
export type FileReadDirResponse = IpcResponse<Array<{ name: string; isDirectory: boolean; isFile: boolean }>>;
export type FileWriteFileResponse = IpcResponse<void>;
export interface ScanStartRequest {
  target: string;
  engines: string[];
  scope?: { include?: string[]; exclude?: string[] };
}
export type ScanStartResponse = IpcResponse<{ scanId: string }>;
export type ScanStopResponse = IpcResponse<void>;
export type FindingsListResponse = IpcResponse<Finding[]>;
export type ReportGenerateResponse = IpcResponse<{ reportId: string }>;

// API exposta ao window
export interface SitePulseAPI {
  // Sistema
  ping: () => Promise<string>;
  getVersion: () => Promise<string>;
  
  // Motores (nested)
  engine: {
    list: () => Promise<EngineListResponse>;
    get: (id: string) => Promise<EngineGetResponse>;
    activate: (id: string) => Promise<EngineActivateResponse>;
    deactivate: (id: string) => Promise<EngineActivateResponse>;
  };
  
  // Sistema de Arquivos (nested)
  fs: {
    readDir: (path: string) => Promise<FileReadDirResponse>;
    readFile: (path: string) => Promise<FileReadFileResponse>;
    writeFile: (path: string, content: string) => Promise<FileWriteFileResponse>;
    delete: (path: string, recursive?: boolean) => Promise<FileWriteFileResponse>;
    mkdir: (path: string) => Promise<FileWriteFileResponse>;
    exists: (path: string) => Promise<FileWriteFileResponse>;
    stat: (path: string) => Promise<FileWriteFileResponse>;
    getRoot: () => Promise<FileWriteFileResponse>;
  };
  
  // Scans (nested)
  scan: {
    start: (config: ScanConfig) => Promise<ScanStartResponse>;
    stop: (scanId: string) => Promise<ScanStopResponse>;
  };
  
  // Findings (nested)
  findings: {
    list: () => Promise<FindingsListResponse>;
    update: (id: string, data: Partial<Finding>) => Promise<EngineActivateResponse>;
  };
  
  // Relatórios (nested)
  report: {
    generate: (options: ReportOptions) => Promise<ReportGenerateResponse>;
    export: (id: string, format: string) => Promise<EngineActivateResponse>;
  };
  
  // Eventos (listeners)
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  off?: (channel: string, callback: (...args: any[]) => void) => void;
}

// Configs e filtros
export interface ScanConfig {
  target: string;
  engines: string[];
  scope?: {
    include?: string[];
    exclude?: string[];
  };
  depth?: number;
  auth?: {
    type: 'none' | 'basic' | 'bearer';
    credentials?: Record<string, string>;
  };
}

export interface FindingFilters {
  severity?: ('critical' | 'high' | 'medium' | 'low' | 'info')[];
  engine?: string[];
  status?: ('new' | 'investigating' | 'resolved' | 'false_positive')[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  engine: string;
  status: 'new' | 'investigating' | 'resolved' | 'false_positive';
  target: string;
  evidence: Evidence[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Evidence {
  id: string;
  type: 'screenshot' | 'log' | 'request' | 'response' | 'code';
  content: string;
  metadata?: Record<string, any>;
}

export interface ReportOptions {
  scanId: string;
  template: 'executive' | 'technical' | 'compliance';
  format: 'pdf' | 'html' | 'json';
  includeEvidence?: boolean;
}

// Declaração global
declare global {
  interface Window {
    sitepulse?: SitePulseAPI;
  }
}
