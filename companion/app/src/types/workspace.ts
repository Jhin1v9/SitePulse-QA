/**
 * SitePulse Workspace - Types
 * Estrutura de dados para organização hierárquica de auditorias
 * 
 * ~/SitePulse/
 * ├── Sites/
 * │   └── {hostname}/
 * │       ├── site.json              # Metadados do site
 * │       ├── Audits/
 * │       │   └── {timestamp}/
 * │       │       ├── audit.json     # Configuração da auditoria
 * │       │       ├── prompts/       # Prompts enviados aos motores
 * │       │       ├── logs/          # Logs de execução
 * │       │       ├── evidence/      # Screenshots, HTML, traces
 * │       │       ├── raw_data/      # Dados brutos coletados
 * │       │       ├── memory/        # Estado dos motores neural
 * │       │       ├── findings/      # Achados/processados
 * │       │       └── reports/       # Relatórios gerados
 * │       └── Learnings/             # Aprendizados acumulados do site
 * └── Global/
 *     ├── config.json                # Configurações globais
 *     └── knowledge-base/            # Base de conhecimento compartilhada
 */

export interface SiteMetadata {
  id: string;
  hostname: string;
  displayName: string;
  baseUrl: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes?: string;
}

export interface AuditMetadata {
  id: string;
  siteId: string;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  config: AuditConfig;
  summary?: AuditSummary;
  enginesUsed: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface AuditConfig {
  scope: 'full' | 'routes' | 'buttons' | 'seo' | 'accessibility' | 'custom';
  routes?: string[];
  viewports: ViewportConfig[];
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
    maxDepth: number;
    timeout: number;
  };
}

export interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile: boolean;
}

export interface AuditSummary {
  totalRoutes: number;
  totalButtons: number;
  issuesFound: number;
  criticalIssues: number;
  warningIssues: number;
  infoIssues: number;
  seoScore: number;
  accessibilityScore: number;
  performanceScore: number;
}

export interface WorkspaceFolder {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modifiedAt: string;
  children?: WorkspaceFolder[];
}

export interface FindingData {
  id: string;
  auditId: string;
  type: 'bug' | 'improvement' | 'security' | 'seo' | 'accessibility' | 'ux';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  location: {
    route: string;
    selector?: string;
    line?: number;
  };
  evidence: {
    screenshots: string[];
    htmlSnapshot?: string;
    consoleLogs?: string[];
    networkLogs?: string[];
  };
  suggestedFix?: string;
  status: 'open' | 'confirmed' | 'fixed' | 'false-positive' | 'wont-fix';
  createdAt: string;
  updatedAt: string;
}

export interface EngineMemory {
  auditId: string;
  engineId: string;
  timestamp: string;
  context: Record<string, unknown>;
  decisions: EngineDecision[];
  learnings: string[];
}

export interface EngineDecision {
  timestamp: string;
  input: unknown;
  output: unknown;
  confidence: number;
  reasoning: string;
}

export interface ReportData {
  id: string;
  auditId: string;
  type: 'executive' | 'technical' | 'detailed' | 'compliance';
  format: 'html' | 'pdf' | 'json' | 'csv';
  filePath: string;
  generatedAt: string;
  fileSize: number;
}
