/**
 * SitePulse Report Service
 * Gera relatórios em múltiplos formatos
 */

import type { Finding } from './findings';
import { reportAPI } from './ipc';
import { workspaceService } from './workspace';

export type ReportFormat = 'html' | 'pdf' | 'json' | 'csv' | 'markdown';
export type ReportTemplate = 'executive' | 'technical' | 'detailed' | 'compliance';

export interface ReportConfig {
  auditId: string;
  siteId: string;
  hostname: string;
  auditTimestamp: string;
  template: ReportTemplate;
  format: ReportFormat;
  includeEvidence: boolean;
  includeScreenshots: boolean;
  includeRecommendations: boolean;
  logoUrl?: string;
  companyName?: string;
  preparedBy?: string;
}

export interface ReportSummary {
  totalPages: number;
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scanDuration: number;
  enginesUsed: string[];
}

export interface GeneratedReport {
  id: string;
  config: ReportConfig;
  summary: ReportSummary;
  content: string;
  filePath: string;
  fileSize: number;
  generatedAt: string;
}

class ReportService {
  /**
   * Gera um relatório
   */
  async generateReport(
    config: ReportConfig,
    findings: Finding[]
  ): Promise<GeneratedReport | null> {
    try {
      const reportId = `report_${Date.now()}`;
      
      // Calcular resumo
      const summary: ReportSummary = {
        totalPages: 0, // TODO: Obter do scan
        totalFindings: findings.length,
        criticalCount: findings.filter(f => f.severity === 'critical').length,
        highCount: findings.filter(f => f.severity === 'high').length,
        mediumCount: findings.filter(f => f.severity === 'medium').length,
        lowCount: findings.filter(f => f.severity === 'low').length,
        infoCount: findings.filter(f => f.severity === 'info').length,
        scanDuration: 0, // TODO: Obter do scan
        enginesUsed: [], // TODO: Obter do scan
      };

      // Gerar conteúdo baseado no formato
      let content: string;
      let filePath: string;

      switch (config.format) {
        case 'html':
          content = this.generateHTML(config, findings, summary);
          filePath = `reports/${reportId}.html`;
          break;
        case 'json':
          content = this.generateJSON(config, findings, summary);
          filePath = `reports/${reportId}.json`;
          break;
        case 'csv':
          content = this.generateCSV(findings);
          filePath = `reports/${reportId}.csv`;
          break;
        case 'markdown':
          content = this.generateMarkdown(config, findings, summary);
          filePath = `reports/${reportId}.md`;
          break;
        case 'pdf':
          // PDF requer geração especial
          content = this.generateHTML(config, findings, summary);
          filePath = `reports/${reportId}.pdf`;
          break;
        default:
          throw new Error(`Formato não suportado: ${config.format}`);
      }

      // Salvar arquivo
      const fullPath = `${config.hostname}/${config.auditTimestamp}/${filePath}`;
      await workspaceService.fs.writeFile(fullPath, content);

      // Registrar relatório
      const reportData = {
        id: reportId,
        auditId: config.auditId,
        type: config.template,
        format: config.format,
        filePath: fullPath,
        generatedAt: new Date().toISOString(),
        fileSize: new Blob([content]).size,
      };
      
      await workspaceService.registerReport(
        config.hostname,
        config.auditTimestamp,
        reportData
      );

      return {
        id: reportId,
        config,
        summary,
        content,
        filePath: fullPath,
        fileSize: new Blob([content]).size,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[ReportService] Erro ao gerar relatório:', error);
      return null;
    }
  }

  /**
   * Gera relatório HTML
   */
  private generateHTML(
    config: ReportConfig,
    findings: Finding[],
    summary: ReportSummary
  ): string {
    const severityColors = {
      critical: '#EF4444',
      high: '#F59E0B',
      medium: '#3B82F6',
      low: '#6B7280',
      info: '#10B981',
    };

    const findingsHTML = findings.map(f => `
      <div class="finding ${f.severity}">
        <div class="finding-header">
          <span class="severity-badge" style="background: ${severityColors[f.severity]}">
            ${f.severity.toUpperCase()}
          </span>
          <h3>${f.title}</h3>
        </div>
        <p class="description">${f.description}</p>
        <div class="location">
          <strong>Localização:</strong> ${f.location.route}
          ${f.location.line ? `(linha ${f.location.line})` : ''}
        </div>
        ${config.includeRecommendations && f.suggestedFix ? `
          <div class="recommendation">
            <strong>Recomendação:</strong> ${f.suggestedFix}
          </div>
        ` : ''}
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório de Auditoria - ${config.hostname}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 40px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #6366F1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1f2937;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .meta {
      color: #6b7280;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 15px;
      margin: 30px 0;
    }
    .stat-box {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      color: #6366F1;
    }
    .stat-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .finding {
      background: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid #ccc;
    }
    .finding.critical { border-left-color: #EF4444; }
    .finding.high { border-left-color: #F59E0B; }
    .finding.medium { border-left-color: #3B82F6; }
    .finding.low { border-left-color: #6B7280; }
    .finding.info { border-left-color: #10B981; }
    .finding-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .severity-badge {
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
    }
    .finding h3 {
      font-size: 16px;
      color: #1f2937;
    }
    .description {
      color: #4b5563;
      margin-bottom: 10px;
    }
    .location {
      font-size: 13px;
      color: #6b7280;
      font-family: monospace;
      background: #e5e7eb;
      padding: 8px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .recommendation {
      background: #dbeafe;
      padding: 12px;
      border-radius: 4px;
      font-size: 14px;
      color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Relatório de Auditoria de Segurança</h1>
      <div class="meta">
        <p><strong>Site:</strong> ${config.hostname}</p>
        <p><strong>Template:</strong> ${config.template}</p>
        <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        ${config.preparedBy ? `<p><strong>Preparado por:</strong> ${config.preparedBy}</p>` : ''}
      </div>
    </div>

    <div class="summary">
      <div class="stat-box">
        <div class="stat-number">${summary.totalFindings}</div>
        <div class="stat-label">Total de Achados</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #EF4444">${summary.criticalCount}</div>
        <div class="stat-label">Críticos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #F59E0B">${summary.highCount}</div>
        <div class="stat-label">Altos</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #3B82F6">${summary.mediumCount}</div>
        <div class="stat-label">Médios</div>
      </div>
      <div class="stat-box">
        <div class="stat-number" style="color: #6B7280">${summary.lowCount}</div>
        <div class="stat-label">Baixos</div>
      </div>
    </div>

    <h2>📋 Achados Detalhados</h2>
    ${findingsHTML}
  </div>
</body>
</html>`;
  }

  /**
   * Gera relatório JSON
   */
  private generateJSON(
    config: ReportConfig,
    findings: Finding[],
    summary: ReportSummary
  ): string {
    return JSON.stringify({
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0.0',
        ...config,
      },
      summary,
      findings: findings.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        severity: f.severity,
        type: f.type,
        category: f.category,
        location: f.location,
        status: f.status,
        suggestedFix: f.suggestedFix,
        createdAt: f.createdAt,
      })),
    }, null, 2);
  }

  /**
   * Gera relatório CSV
   */
  private generateCSV(findings: Finding[]): string {
    const headers = ['ID', 'Título', 'Severidade', 'Tipo', 'Status', 'Categoria', 'Rota', 'Criado em'];
    const rows = findings.map(f => [
      f.id,
      `"${f.title.replace(/"/g, '""')}"`,
      f.severity,
      f.type,
      f.status,
      f.category,
      f.location.route,
      f.createdAt,
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Gera relatório Markdown
   */
  private generateMarkdown(
    config: ReportConfig,
    findings: Finding[],
    summary: ReportSummary
  ): string {
    const severityEmoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '⚪',
      info: '🔵',
    };

    const findingsMD = findings.map(f => `
### ${severityEmoji[f.severity]} ${f.title}

**Severidade:** ${f.severity.toUpperCase()}  
**Tipo:** ${f.type}  
**Status:** ${f.status}  
**Localização:** ${f.location.route}${f.location.line ? ` (linha ${f.location.line})` : ''}

${f.description}

${f.suggestedFix ? `**Recomendação:** ${f.suggestedFix}` : ''}
---
`).join('\n');

    return `# 🔒 Relatório de Auditoria de Segurança

## Informações Gerais

- **Site:** ${config.hostname}
- **Template:** ${config.template}
- **Gerado em:** ${new Date().toLocaleString('pt-BR')}
${config.preparedBy ? `- **Preparado por:** ${config.preparedBy}` : ''}

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de Achados | ${summary.totalFindings} |
| Críticos | ${summary.criticalCount} |
| Altos | ${summary.highCount} |
| Médios | ${summary.mediumCount} |
| Baixos | ${summary.lowCount} |
| Info | ${summary.infoCount} |

## Achados Detalhados

${findingsMD}
`;
  }

  /**
   * Lista relatórios de uma auditoria
   */
  async listReports(
    hostname: string,
    auditTimestamp: string
  ): Promise<Array<{
    id: string;
    type: string;
    format: string;
    generatedAt: string;
    fileSize: number;
  }>> {
    try {
      const result = await workspaceService.fs.readDir(
        `${hostname}/${auditTimestamp}/reports`
      );
      
      if (!result.success) return [];
      
      // TODO: Carregar metadados de cada relatório
      return [];
    } catch (error) {
      console.error('[ReportService] Erro ao listar relatórios:', error);
      return [];
    }
  }

  /**
   * Obtém template padrão de relatório
   */
  getDefaultTemplate(): ReportTemplate {
    return 'technical';
  }

  /**
   * Lista templates disponíveis
   */
  getAvailableTemplates(): Array<{ id: ReportTemplate; name: string; description: string }> {
    return [
      { id: 'executive', name: 'Executivo', description: 'Resumo de alto nível para stakeholders' },
      { id: 'technical', name: 'Técnico', description: 'Detalhes técnicos completos' },
      { id: 'detailed', name: 'Detalhado', description: 'Análise completa com evidências' },
      { id: 'compliance', name: 'Compliance', description: 'Focado em conformidade normativa' },
    ];
  }

  /**
   * Lista formatos disponíveis
   */
  getAvailableFormats(): Array<{ id: ReportFormat; name: string; extension: string }> {
    return [
      { id: 'html', name: 'HTML', extension: 'html' },
      { id: 'pdf', name: 'PDF', extension: 'pdf' },
      { id: 'json', name: 'JSON', extension: 'json' },
      { id: 'csv', name: 'CSV', extension: 'csv' },
      { id: 'markdown', name: 'Markdown', extension: 'md' },
    ];
  }
}

export const reportService = new ReportService();
export default reportService;
