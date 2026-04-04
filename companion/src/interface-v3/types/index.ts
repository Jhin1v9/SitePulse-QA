/**
 * SITEPULSE STUDIO v3.0 - TIPAGENS DA INTERFACE
 * Typescript definitions for the v3 React interface
 */

// ===== IPC CHANNELS =====
export type IPCChannel =
  | 'companion:state'
  | 'companion:log'
  | 'companion:live-report'
  | 'companion:window-state'
  | 'companion:notification'
  | 'companion:engine-status';

export type IPCInvokeChannel =
  | 'companion:get-state'
  | 'companion:get-engines'
  | 'companion:minimize'
  | 'companion:maximize'
  | 'companion:close'
  | 'companion:start-audit'
  | 'companion:cancel-audit'
  | 'companion:export-report'
  | 'companion:pick-report'
  | 'companion:select-directory'
  | 'companion:get-app-version'
  | 'companion:engine-action';

// ===== ESTADO DA AUDITORIA =====
export interface AuditProgress {
  percentage: number;
  phase: string;
  phaseLabel: string;
  detail: string;
  routeIndex: number;
  totalRoutes: number;
  labelIndex: number;
  totalLabels: number;
  currentRoute: string;
  currentAction: string;
  lastEventType: string;
  sweepProfileIndex?: number;
  sweepProfileTotal?: number;
  sweepProfileLabel?: string;
  sweepProfileViewport?: string;
  sweepProfilePercentage?: number;
  sweepProfileStartedAtMs?: number;
}

export interface TimelineEntry {
  id: string;
  stage: string;
  label: string;
  status: 'idle' | 'active' | 'done' | 'failed' | 'issue';
  detail: string;
  route: string;
  action: string;
  at: string;
}

export interface StageBoardEntry {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'done' | 'failed' | 'issue';
  detail: string;
  evidenceCount: number;
  route: string;
  action: string;
  updatedAt: string;
}

export interface AuditSummary {
  auditScope: string;
  routesChecked: number;
  buttonsChecked: number;
  totalIssues: number;
  seoScore: number;
  seoCriticalIssues: number;
  seoTotalIssues: number;
  seoPagesAnalyzed: number;
  buttonsNoEffect: number;
  visualSectionOrderInvalid: number;
  consoleErrors: number;
  durationMs: number;
  mobileProfilesAnalyzed?: number;
}

export interface AuditState {
  running: boolean;
  status: 'idle' | 'running' | 'clean' | 'issues' | 'failed' | 'paused';
  source: 'native' | 'cmd';
  baseUrl: string;
  mode: 'desktop' | 'mobile';
  scope: 'full' | 'seo' | 'actions' | 'visual';
  depth: 'signal' | 'deep';
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  lastCommand: string;
  lastError: string;
  usedFallback: boolean;
  lastSummary: AuditSummary | null;
  progress: AuditProgress;
  liveReport: any | null;
  timeline: TimelineEntry[];
  stageBoard: StageBoardEntry[];
}

// ===== MOTORES AI =====
export type EngineId =
  | 'intent'
  | 'context'
  | 'evidence'
  | 'memory'
  | 'learning'
  | 'decision'
  | 'action'
  | 'predictive'
  | 'autonomous'
  | 'security';

export type EngineStatus = 'offline' | 'booting' | 'online' | 'busy' | 'error';

export interface EngineState {
  id: EngineId;
  name: string;
  description: string;
  status: EngineStatus;
  metrics: {
    confidence?: number;
    accuracy?: number;
    latency?: number;
    processed?: number;
  };
  lastActivity?: string;
  error?: string;
}

// ===== WORKSPACE =====
export type WorkspaceId =
  | 'operator'
  | 'findings'
  | 'seo'
  | 'compare'
  | 'memory'
  | 'healing'
  | 'reports'
  | 'settings';

export interface Workspace {
  id: WorkspaceId;
  label: string;
  sublabel: string;
  icon: string;
  color: string;
  badge?: number | string;
  isLive?: boolean;
}

// ===== NOTIFICAÇÕES =====
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ===== CONFIGURAÇÕES =====
export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  notifications: boolean;
  autoUpdate: boolean;
  defaultAuditMode: 'desktop' | 'mobile';
  defaultScope: 'full' | 'seo' | 'actions' | 'visual';
  apiKeys: {
    openai?: string;
    deepseek?: string;
    googleSearchConsole?: string;
  };
}

// ===== REPORT =====
export interface ReportIssue {
  id: string;
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  route: string;
  action?: string;
  detail: string;
  recommendedResolution: string;
  viewport?: string;
  viewportLabel?: string;
}

export interface ReportAction {
  id: string;
  label: string;
  route: string;
  status: 'ok' | 'no-effect' | 'error';
  viewport?: string;
  viewportLabel?: string;
}

export interface ReportRoute {
  route: string;
  status: 'ok' | 'error';
  loadTime?: number;
  viewport?: string;
  viewportLabel?: string;
}

export interface SitePulseReport {
  meta: {
    baseUrl: string;
    startedAt: string;
    finishedAt: string;
    auditMode: 'desktop' | 'mobile';
    auditDepth: 'signal' | 'deep';
    viewport?: string;
    viewportLabel?: string;
  };
  summary: AuditSummary;
  issues: ReportIssue[];
  actionSweep: ReportAction[];
  routeSweep: ReportRoute[];
  seo: {
    overallScore: number;
    pagesAnalyzed: number;
    topRecommendations: string[];
  };
}
