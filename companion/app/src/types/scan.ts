/**
 * SitePulse Scan Types
 * Tipagens para sistema de auditoria em tempo real
 */

export type ScanStatus = 'idle' | 'initializing' | 'scanning' | 'paused' | 'completed' | 'failed' | 'cancelled';

export type ScanPhase = 
  | 'setup'           // Configurando ambiente
  | 'discovery'       // Descobrindo rotas
  | 'analysis'        // Analisando páginas
  | 'evidence'        // Coletando evidências
  | 'processing'      // Processando dados
  | 'reporting';      // Gerando relatórios

export interface ScanConfig {
  target: string;
  siteId?: string;
  auditId?: string;
  scope: {
    include: string[];
    exclude: string[];
    maxDepth: number;
    maxPages: number;
  };
  viewports: Array<{
    name: string;
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
  }>;
  engines: {
    intent: boolean;
    context: boolean;
    evidence: boolean;
    memory: boolean;
    learning: boolean;
    decision: boolean;
    action: boolean;
    predictive: boolean;
    autonomous: boolean;
    security: boolean;
  };
  options: {
    headless: boolean;
    captureScreenshots: boolean;
    saveHtmlSnapshots: boolean;
    followRedirects: boolean;
    respectRobotsTxt: boolean;
    timeout: number;
    concurrency: number;
  };
}

export interface ScanProgress {
  scanId: string;
  status: ScanStatus;
  phase: ScanPhase;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  currentUrl?: string;
  currentAction?: string;
  engines: Record<string, {
    status: 'waiting' | 'running' | 'completed' | 'error';
    progress: number;
    findings: number;
  }>;
  metrics: {
    pagesScanned: number;
    buttonsTested: number;
    issuesFound: number;
    startTime: string;
    estimatedEndTime?: string;
  };
  errors: Array<{
    timestamp: string;
    message: string;
    url?: string;
    severity: 'warning' | 'error' | 'critical';
  }>;
}

export interface ScanResult {
  scanId: string;
  siteId: string;
  auditId: string;
  config: ScanConfig;
  status: ScanStatus;
  summary: {
    totalPages: number;
    totalButtons: number;
    issuesFound: number;
    criticalIssues: number;
    warningIssues: number;
    infoIssues: number;
    seoScore: number;
    accessibilityScore: number;
    performanceScore: number;
  };
  findings: string[]; // IDs dos findings
  reports: string[]; // IDs dos relatórios gerados
  startTime: string;
  endTime?: string;
  duration?: number; // em segundos
}

export interface ScanEvent {
  type: 'status' | 'progress' | 'phase' | 'engine' | 'error' | 'complete';
  timestamp: string;
  scanId: string;
  data: unknown;
}

// Eventos específicos
export interface ScanStatusEvent {
  status: ScanStatus;
  previousStatus: ScanStatus;
  message?: string;
}

export interface ScanProgressEvent {
  current: number;
  total: number;
  percentage: number;
  currentUrl?: string;
  currentAction?: string;
}

export interface ScanPhaseEvent {
  phase: ScanPhase;
  previousPhase: ScanPhase;
  message?: string;
}

export interface ScanEngineEvent {
  engineId: string;
  status: 'waiting' | 'running' | 'completed' | 'error';
  progress: number;
  findings: number;
  message?: string;
}

export interface ScanErrorEvent {
  message: string;
  url?: string;
  severity: 'warning' | 'error' | 'critical';
  stack?: string;
}

export const SCAN_PHASES: ScanPhase[] = [
  'setup',
  'discovery', 
  'analysis',
  'evidence',
  'processing',
  'reporting'
];

export const SCAN_PHASE_LABELS: Record<ScanPhase, string> = {
  setup: 'Configurando',
  discovery: 'Descobrindo rotas',
  analysis: 'Analisando páginas',
  evidence: 'Coletando evidências',
  processing: 'Processando dados',
  reporting: 'Gerando relatórios',
};

export const SCAN_STATUS_LABELS: Record<ScanStatus, string> = {
  idle: 'Ocioso',
  initializing: 'Inicializando',
  scanning: 'Escaneando',
  paused: 'Pausado',
  completed: 'Concluído',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};
