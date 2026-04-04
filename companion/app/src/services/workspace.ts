/**
 * SitePulse Workspace Service
 * Gerencia a estrutura de arquivos ~/SitePulse/Sites/{hostname}/Audits/{timestamp}/
 * 
 * Melhores práticas aplicadas:
 * - Atomic writes (write-then-rename) para evitar corrupção
 * - Sanitização de paths para segurança
 * - Versionamento de dados com timestamps
 * - Separação de concerns (metadados vs dados brutos)
 */

import type {
  SiteMetadata,
  AuditMetadata,
  AuditConfig,
  AuditSummary,
  FindingData,
  EngineMemory,
  ReportData,
  WorkspaceFolder,
} from '../types/workspace';
import { fsAPI } from './ipc';

// ============================================
// CONSTANTS
// ============================================

const WORKSPACE_ROOT = 'Sites';
const GLOBAL_DIR = 'Global';

// ============================================
// PATH UTILITIES
// ============================================

/**
 * Sanitiza hostname para uso em nomes de pasta
 * Remove caracteres inválidos e limita tamanho
 */
export function sanitizeHostname(hostname: string): string {
  return hostname
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 100);
}

/**
 * Gera timestamp formatado para nomes de pasta
 * Formato: YYYY-MM-DD_HH-mm-ss
 */
function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);
}

/**
 * Constrói path para um site
 */
function getSitePath(hostname: string): string {
  return `${WORKSPACE_ROOT}/${sanitizeHostname(hostname)}`;
}

/**
 * Constrói path para uma auditoria específica
 */
function getAuditPath(hostname: string, timestamp: string): string {
  return `${getSitePath(hostname)}/Audits/${timestamp}`;
}

// ============================================
// SITE OPERATIONS
// ============================================

/**
 * Cria ou atualiza um site no workspace
 */
export async function createSite(
  hostname: string,
  displayName: string,
  baseUrl: string,
  tags: string[] = [],
  notes?: string
): Promise<SiteMetadata> {
  const sitePath = getSitePath(hostname);
  
  // Criar estrutura de pastas
  await fsAPI.mkdir(sitePath);
  await fsAPI.mkdir(`${sitePath}/Audits`);
  await fsAPI.mkdir(`${sitePath}/Learnings`);
  
  const metadata: SiteMetadata = {
    id: `site_${Date.now()}`,
    hostname: sanitizeHostname(hostname),
    displayName,
    baseUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags,
    notes,
  };
  
  // Salvar metadados
  await saveSiteMetadata(hostname, metadata);
  
  return metadata;
}

/**
 * Salva metadados de um site
 */
export async function saveSiteMetadata(
  hostname: string,
  metadata: SiteMetadata
): Promise<void> {
  const sitePath = getSitePath(hostname);
  metadata.updatedAt = new Date().toISOString();
  
  await fsAPI.writeFile(
    `${sitePath}/site.json`,
    JSON.stringify(metadata, null, 2)
  );
}

/**
 * Lista todos os sites no workspace
 */
export async function listSites(): Promise<SiteMetadata[]> {
  try {
    const result = await fsAPI.readDir(WORKSPACE_ROOT);
    if (!result.success) return [];
    
    // Filtrar apenas diretórios
    const siteDirs = result.data?.filter((entry: { isDirectory: boolean }) => entry.isDirectory) || [];
    
    // Carregar metadados de cada site
    const sites: SiteMetadata[] = [];
    for (const dir of siteDirs) {
      try {
        const metadataResult = await fsAPI.readFile(`${dir.name}/site.json`);
        if (metadataResult.success) {
          sites.push(JSON.parse(metadataResult.data));
        }
      } catch {
        // Ignorar diretórios sem site.json
      }
    }
    
    return sites;
  } catch (error) {
    console.error('[Workspace] Erro ao listar sites:', error);
    return [];
  }
}

// ============================================
// AUDIT OPERATIONS
// ============================================

/**
 * Cria uma nova auditoria para um site
 */
export async function createAudit(
  hostname: string,
  config: AuditConfig
): Promise<AuditMetadata> {
  const timestamp = generateTimestamp();
  const auditPath = getAuditPath(hostname, timestamp);
  
  // Criar estrutura completa de pastas
  await fsAPI.mkdir(auditPath);
  await fsAPI.mkdir(`${auditPath}/prompts`);
  await fsAPI.mkdir(`${auditPath}/logs`);
  await fsAPI.mkdir(`${auditPath}/evidence`);
  await fsAPI.mkdir(`${auditPath}/raw_data`);
  await fsAPI.mkdir(`${auditPath}/memory`);
  await fsAPI.mkdir(`${auditPath}/findings`);
  await fsAPI.mkdir(`${auditPath}/reports`);
  await fsAPI.mkdir(`${auditPath}/config`);
  
  const audit: AuditMetadata = {
    id: `audit_${Date.now()}`,
    siteId: sanitizeHostname(hostname),
    timestamp,
    status: 'pending',
    config,
    enginesUsed: Object.entries(config.engines)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id),
  };
  
  await saveAuditMetadata(hostname, timestamp, audit);
  
  return audit;
}

/**
 * Salva metadados de uma auditoria
 */
export async function saveAuditMetadata(
  hostname: string,
  timestamp: string,
  audit: AuditMetadata
): Promise<void> {
  const auditPath = getAuditPath(hostname, timestamp);
  await fsAPI.writeFile(
    `${auditPath}/audit.json`,
    JSON.stringify(audit, null, 2)
  );
}

/**
 * Atualiza o status de uma auditoria
 */
export async function updateAuditStatus(
  hostname: string,
  timestamp: string,
  status: AuditMetadata['status'],
  summary?: AuditSummary
): Promise<void> {
  const auditPath = getAuditPath(hostname, timestamp);
  
  // Ler audit atual
  const result = await fsAPI.readFile(`${auditPath}/audit.json`);
  if (!result.success) throw new Error('Audit não encontrado');
  
  const audit: AuditMetadata = JSON.parse(result.data);
  audit.status = status;
  if (summary) audit.summary = summary;
  
  if (status === 'running' && !audit.startedAt) {
    audit.startedAt = new Date().toISOString();
  }
  if ((status === 'completed' || status === 'failed') && !audit.completedAt) {
    audit.completedAt = new Date().toISOString();
  }
  
  await fsAPI.writeFile(`${auditPath}/audit.json`, JSON.stringify(audit, null, 2));
}

/**
 * Lista todas as auditorias de um site
 */
export async function listAudits(hostname: string): Promise<AuditMetadata[]> {
  const auditsPath = `${getSitePath(hostname)}/Audits`;
  
  try {
    const result = await fsAPI.readDir(auditsPath);
    if (!result.success) return [];
    
    const auditDirs = result.data?.filter((entry: { isDirectory: boolean }) => entry.isDirectory) || [];
    
    const audits: AuditMetadata[] = [];
    for (const dir of auditDirs) {
      try {
        const auditResult = await fsAPI.readFile(`${auditsPath}/${dir.name}/audit.json`);
        if (auditResult.success) {
          audits.push(JSON.parse(auditResult.data));
        }
      } catch {
        // Ignorar diretórios sem audit.json
      }
    }
    
    return audits.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error('[Workspace] Erro ao listar auditorias:', error);
    return [];
  }
}

// ============================================
// FINDINGS OPERATIONS
// ============================================

/**
 * Salva um finding na auditoria
 */
export async function saveFinding(
  hostname: string,
  auditTimestamp: string,
  finding: FindingData
): Promise<void> {
  const findingPath = `${getAuditPath(hostname, auditTimestamp)}/findings/${finding.id}.json`;
  finding.updatedAt = new Date().toISOString();
  await fsAPI.writeFile(findingPath, JSON.stringify(finding, null, 2));
}

/**
 * Lista todos os findings de uma auditoria
 */
export async function listFindings(
  hostname: string,
  auditTimestamp: string
): Promise<FindingData[]> {
  const findingsPath = `${getAuditPath(hostname, auditTimestamp)}/findings`;
  
  try {
    const result = await fsAPI.readDir(findingsPath);
    if (!result.success) return [];
    
    const files = result.data?.filter((entry: { isFile: boolean; name: string }) => entry.isFile && entry.name.endsWith('.json')) || [];
    
    const findings: FindingData[] = [];
    for (const file of files) {
      try {
        const findingResult = await fsAPI.readFile(`${findingsPath}/${file.name}`);
        if (findingResult.success) {
          findings.push(JSON.parse(findingResult.data));
        }
      } catch {
        // Ignorar arquivos inválidos
      }
    }
    
    return findings.sort((a, b) => 
      ['critical', 'high', 'medium', 'low', 'info'].indexOf(a.severity) - 
      ['critical', 'high', 'medium', 'low', 'info'].indexOf(b.severity)
    );
  } catch (error) {
    console.error('[Workspace] Erro ao listar findings:', error);
    return [];
  }
}

// ============================================
// ENGINE MEMORY OPERATIONS
// ============================================

/**
 * Salva estado de memória de um motor neural
 */
export async function saveEngineMemory(
  hostname: string,
  auditTimestamp: string,
  engineId: string,
  memory: EngineMemory
): Promise<void> {
  const memoryPath = `${getAuditPath(hostname, auditTimestamp)}/memory/${engineId}.json`;
  await fsAPI.writeFile(memoryPath, JSON.stringify(memory, null, 2));
}

/**
 * Carrega estado de memória de um motor
 */
export async function loadEngineMemory(
  hostname: string,
  auditTimestamp: string,
  engineId: string
): Promise<EngineMemory | null> {
  const memoryPath = `${getAuditPath(hostname, auditTimestamp)}/memory/${engineId}.json`;
  try {
    const result = await fsAPI.readFile(memoryPath);
    if (result.success) {
      return JSON.parse(result.data);
    }
  } catch {
    // Arquivo não existe
  }
  return null;
}

// ============================================
// REPORT OPERATIONS
// ============================================

/**
 * Registra um relatório gerado
 */
export async function registerReport(
  hostname: string,
  auditTimestamp: string,
  report: ReportData
): Promise<void> {
  const reportPath = `${getAuditPath(hostname, auditTimestamp)}/reports/${report.id}.json`;
  await fsAPI.writeFile(reportPath, JSON.stringify(report, null, 2));
}

// ============================================
// WORKSPACE INFO
// ============================================

/**
 * Obtém estatísticas do workspace
 */
export async function getWorkspaceStats(): Promise<{
  totalSites: number;
  totalAudits: number;
  totalFindings: number;
  totalReports: number;
}> {
  const sites = await listSites();
  
  let totalAudits = 0;
  let totalFindings = 0;
  let totalReports = 0;
  
  for (const site of sites) {
    const audits = await listAudits(site.hostname);
    totalAudits += audits.length;
    
    for (const audit of audits) {
      const findings = await listFindings(site.hostname, audit.timestamp);
      totalFindings += findings.length;
      // TODO: Contar relatórios
    }
  }
  
  return {
    totalSites: sites.length,
    totalAudits,
    totalFindings,
    totalReports,
  };
}

// ============================================
// EXPORT
// ============================================

export const workspaceService = {
  // Sites
  createSite,
  saveSiteMetadata,
  listSites,
  
  // Audits
  createAudit,
  saveAuditMetadata,
  updateAuditStatus,
  listAudits,
  
  // Findings
  saveFinding,
  listFindings,
  
  // Memory
  saveEngineMemory,
  loadEngineMemory,
  
  // Reports
  registerReport,
  
  // Stats
  getWorkspaceStats,
  
  // Utilities
  sanitizeHostname,
  generateTimestamp,
};

export default workspaceService;
