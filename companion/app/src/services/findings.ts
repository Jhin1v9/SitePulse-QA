/**
 * SitePulse Findings Service
 * Gerencia achados de auditoria com persistência
 */

import type { FindingData } from '../types/workspace';
import { findingsAPI } from './ipc';
import { workspaceService } from './workspace';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'open' | 'confirmed' | 'fixed' | 'false-positive' | 'wont-fix';
export type FindingType = 'bug' | 'improvement' | 'security' | 'seo' | 'accessibility' | 'ux';

export interface Finding {
  id: string;
  auditId: string;
  type: FindingType;
  severity: FindingSeverity;
  category: string;
  title: string;
  description: string;
  location: {
    route: string;
    selector?: string;
    line?: number;
    column?: number;
  };
  evidence: {
    screenshots: string[];
    htmlSnapshot?: string;
    consoleLogs?: string[];
    networkLogs?: string[];
  };
  suggestedFix?: string;
  status: FindingStatus;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindingFilters {
  severity?: FindingSeverity[];
  type?: FindingType[];
  status?: FindingStatus[];
  category?: string[];
  engine?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface FindingStats {
  total: number;
  bySeverity: Record<FindingSeverity, number>;
  byType: Record<FindingType, number>;
  byStatus: Record<FindingStatus, number>;
  openCritical: number;
  openHigh: number;
}

class FindingsService {
  /**
   * Cria um novo finding
   */
  async createFinding(
    hostname: string,
    auditTimestamp: string,
    finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Finding | null> {
    try {
      const newFinding: Finding = {
        ...finding,
        id: `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await workspaceService.saveFinding(hostname, auditTimestamp, newFinding);
      return newFinding;
    } catch (error) {
      console.error('[FindingsService] Erro ao criar finding:', error);
      return null;
    }
  }

  /**
   * Lista todos os findings de uma auditoria
   */
  async listFindings(
    hostname: string,
    auditTimestamp: string,
    filters?: FindingFilters
  ): Promise<Finding[]> {
    try {
      const findings = await workspaceService.listFindings(hostname, auditTimestamp);
      
      if (!filters) return findings;

      // Aplicar filtros
      return findings.filter(finding => {
        if (filters.severity?.length && !filters.severity.includes(finding.severity)) return false;
        if (filters.type?.length && !filters.type.includes(finding.type)) return false;
        if (filters.status?.length && !filters.status.includes(finding.status)) return false;
        if (filters.category?.length && !filters.category.includes(finding.category)) return false;
        if (filters.dateFrom && new Date(finding.createdAt) < filters.dateFrom) return false;
        if (filters.dateTo && new Date(finding.createdAt) > filters.dateTo) return false;
        return true;
      });
    } catch (error) {
      console.error('[FindingsService] Erro ao listar findings:', error);
      return [];
    }
  }

  /**
   * Obtém um finding específico
   */
  async getFinding(
    hostname: string,
    auditTimestamp: string,
    findingId: string
  ): Promise<Finding | null> {
    try {
      const findings = await this.listFindings(hostname, auditTimestamp);
      return findings.find(f => f.id === findingId) || null;
    } catch (error) {
      console.error('[FindingsService] Erro ao obter finding:', error);
      return null;
    }
  }

  /**
   * Atualiza um finding
   */
  async updateFinding(
    hostname: string,
    auditTimestamp: string,
    findingId: string,
    updates: Partial<Finding>
  ): Promise<boolean> {
    try {
      const finding = await this.getFinding(hostname, auditTimestamp, findingId);
      if (!finding) return false;

      const updatedFinding: Finding = {
        ...finding,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await workspaceService.saveFinding(hostname, auditTimestamp, updatedFinding);
      return true;
    } catch (error) {
      console.error('[FindingsService] Erro ao atualizar finding:', error);
      return false;
    }
  }

  /**
   * Atualiza status de um finding
   */
  async updateStatus(
    hostname: string,
    auditTimestamp: string,
    findingId: string,
    status: FindingStatus
  ): Promise<boolean> {
    return this.updateFinding(hostname, auditTimestamp, findingId, { status });
  }

  /**
   * Atribui finding a alguém
   */
  async assignFinding(
    hostname: string,
    auditTimestamp: string,
    findingId: string,
    assignedTo: string
  ): Promise<boolean> {
    return this.updateFinding(hostname, auditTimestamp, findingId, { assignedTo });
  }

  /**
   * Define data de vencimento
   */
  async setDueDate(
    hostname: string,
    auditTimestamp: string,
    findingId: string,
    dueDate: string
  ): Promise<boolean> {
    return this.updateFinding(hostname, auditTimestamp, findingId, { dueDate });
  }

  /**
   * Obtém estatísticas de findings
   */
  async getStats(
    hostname: string,
    auditTimestamp: string
  ): Promise<FindingStats> {
    const findings = await this.listFindings(hostname, auditTimestamp);
    
    const stats: FindingStats = {
      total: findings.length,
      bySeverity: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
      byType: { bug: 0, improvement: 0, security: 0, seo: 0, accessibility: 0, ux: 0 },
      byStatus: { open: 0, confirmed: 0, fixed: 0, 'false-positive': 0, 'wont-fix': 0 },
      openCritical: 0,
      openHigh: 0,
    };

    findings.forEach(finding => {
      stats.bySeverity[finding.severity]++;
      stats.byType[finding.type]++;
      stats.byStatus[finding.status]++;
      
      if (finding.status === 'open') {
        if (finding.severity === 'critical') stats.openCritical++;
        if (finding.severity === 'high') stats.openHigh++;
      }
    });

    return stats;
  }

  /**
   * Obtém todas as categorias únicas
   */
  async getCategories(
    hostname: string,
    auditTimestamp: string
  ): Promise<string[]> {
    const findings = await this.listFindings(hostname, auditTimestamp);
    const categories = new Set(findings.map(f => f.category));
    return Array.from(categories).sort();
  }

  /**
   * Exporta findings para JSON
   */
  exportToJSON(findings: Finding[]): string {
    return JSON.stringify(findings, null, 2);
  }

  /**
   * Exporta findings para CSV
   */
  exportToCSV(findings: Finding[]): string {
    const headers = ['ID', 'Título', 'Tipo', 'Severidade', 'Status', 'Categoria', 'Rota', 'Criado em'];
    const rows = findings.map(f => [
      f.id,
      f.title,
      f.type,
      f.severity,
      f.status,
      f.category,
      f.location.route,
      f.createdAt,
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Importa findings de JSON
   */
  async importFromJSON(
    hostname: string,
    auditTimestamp: string,
    json: string
  ): Promise<number> {
    try {
      const findings: Omit<Finding, 'id' | 'createdAt' | 'updatedAt'>[] = JSON.parse(json);
      let imported = 0;
      
      for (const finding of findings) {
        const created = await this.createFinding(hostname, auditTimestamp, finding);
        if (created) imported++;
      }
      
      return imported;
    } catch (error) {
      console.error('[FindingsService] Erro ao importar:', error);
      return 0;
    }
  }
}

export const findingsService = new FindingsService();
export default findingsService;
