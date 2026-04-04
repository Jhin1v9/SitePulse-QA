/**
 * SITEPULSE STUDIO v3.0 - REPORTS SCREEN
 * Histórico de relatórios, exportações e agendamentos
 */

import React, { useState } from 'react';

interface Report {
  id: string;
  name: string;
  date: string;
  url: string;
  score: number;
  issues: number;
  size: string;
  format: 'json' | 'pdf' | 'html';
}

const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    name: 'Auditoria Completa - Abril',
    date: '2026-04-03',
    url: 'https://example.com',
    score: 85,
    issues: 12,
    size: '2.4 MB',
    format: 'json',
  },
  {
    id: '2',
    name: 'Auditoria SEO - Março',
    date: '2026-03-28',
    url: 'https://example.com',
    score: 82,
    issues: 15,
    size: '1.8 MB',
    format: 'pdf',
  },
  {
    id: '3',
    name: 'Auditoria Mobile - Março',
    date: '2026-03-21',
    url: 'https://example.com',
    score: 78,
    issues: 18,
    size: '3.1 MB',
    format: 'html',
  },
];

interface ScheduledReport {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  url: string;
  nextRun: string;
  enabled: boolean;
}

const MOCK_SCHEDULED: ScheduledReport[] = [
  {
    id: '1',
    name: 'Auditoria Semanal',
    frequency: 'weekly',
    url: 'https://example.com',
    nextRun: '2026-04-10',
    enabled: true,
  },
  {
    id: '2',
    name: 'Auditoria Mensal SEO',
    frequency: 'monthly',
    url: 'https://example.com',
    nextRun: '2026-05-01',
    enabled: false,
  },
];

export const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'history' | 'scheduled'>('history');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = MOCK_REPORTS.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return '{ }';
      case 'pdf':
        return '📄';
      case 'html':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div className="sp-flex sp-items-center sp-justify-between">
        <div>
          <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-1">Reports</h1>
          <p className="sp-text-text-secondary">Histórico, exportações e agendamentos</p>
        </div>
        <button className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-font-medium hover:sp-brightness-110 sp-transition-all">
          Agendar Novo
        </button>
      </div>

      {/* Tabs */}
      <div className="sp-flex sp-gap-2 sp-border-b sp-border-white/[0.06]">
        {(['history', 'scheduled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`sp-px-4 sp-py-3 sp-text-sm sp-font-medium sp-capitalize sp-transition-colors sp-relative ${
              activeTab === tab
                ? 'sp-text-white'
                : 'sp-text-text-secondary hover:sp-text-white'
            }`}
          >
            {tab === 'history' ? 'Histórico' : 'Agendados'}
            {activeTab === tab && (
              <div className="sp-absolute sp-bottom-0 sp-left-0 sp-right-0 sp-h-0.5 sp-bg-primary sp-rounded-full" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'history' && (
        <>
          {/* Search */}
          <div className="sp-relative">
            <svg
              className="sp-absolute sp-left-3 sp-top-1/2 sp--translate-y-1/2 sp-w-5 sp-h-5 sp-text-text-tertiary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar relatórios..."
              className="sp-w-full sp-pl-10 sp-pr-4 sp-py-2.5 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-placeholder-text-tertiary sp-focus:border-primary sp-focus:outline-none"
            />
          </div>

          {/* Reports List */}
          <div className="sp-space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="sp-group sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-xl sp-border sp-border-white/[0.06] hover:sp-border-white/[0.1] sp-transition-all"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                {/* Format Icon */}
                <div
                  className="sp-w-12 sp-h-12 sp-rounded-xl sp-flex sp-items-center sp-justify-center sp-text-xl"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  {getFormatIcon(report.format)}
                </div>

                {/* Info */}
                <div className="sp-flex-1 sp-min-w-0">
                  <h3 className="sp-font-medium sp-text-white sp-truncate">
                    {report.name}
                  </h3>
                  <p className="sp-text-sm sp-text-text-secondary">
                    {report.url} • {report.date}
                  </p>
                </div>

                {/* Stats */}
                <div className="sp-flex sp-items-center sp-gap-6">
                  <div className="sp-text-center">
                    <p className="sp-text-lg sp-font-bold sp-text-white">
                      {report.score}
                    </p>
                    <p className="sp-text-xs sp-text-text-tertiary">Score</p>
                  </div>
                  <div className="sp-text-center">
                    <p className="sp-text-lg sp-font-bold sp-text-white">
                      {report.issues}
                    </p>
                    <p className="sp-text-xs sp-text-text-tertiary">Issues</p>
                  </div>
                  <div className="sp-text-center">
                    <p className="sp-text-lg sp-font-bold sp-text-white">
                      {report.size}
                    </p>
                    <p className="sp-text-xs sp-text-text-tertiary">Tamanho</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="sp-flex sp-gap-2 sp-opacity-0 group-hover:sp-opacity-100 sp-transition-opacity">
                  <button className="sp-px-3 sp-py-2 sp-rounded-lg sp-border sp-border-white/[0.06] sp-text-sm sp-text-text-secondary hover:sp-text-white sp-transition-colors">
                    Visualizar
                  </button>
                  <button className="sp-px-3 sp-py-2 sp-rounded-lg sp-bg-primary sp-text-sm sp-text-white hover:sp-brightness-110 sp-transition-all">
                    Download
                  </button>
                </div>
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="sp-text-center sp-py-12 sp-text-text-secondary">
                Nenhum relatório encontrado
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'scheduled' && (
        <div className="sp-space-y-3">
          {MOCK_SCHEDULED.map((scheduled) => (
            <div
              key={scheduled.id}
              className="sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-xl sp-border sp-border-white/[0.06]"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Status */}
              <div
                className="sp-w-3 sp-h-3 sp-rounded-full"
                style={{
                  background: scheduled.enabled ? '#22C55E' : '#6B7280',
                  boxShadow: scheduled.enabled
                    ? '0 0 8px rgba(34,197,94,0.5)'
                    : undefined,
                }}
              />

              {/* Info */}
              <div className="sp-flex-1">
                <h3 className="sp-font-medium sp-text-white">{scheduled.name}</h3>
                <p className="sp-text-sm sp-text-text-secondary">
                  {scheduled.url} • Próxima execução: {scheduled.nextRun}
                </p>
              </div>

              {/* Frequency */}
              <span
                className="sp-px-3 sp-py-1 sp-rounded-full sp-text-xs sp-capitalize"
                style={{
                  background: scheduled.enabled
                    ? 'rgba(99,102,241,0.1)'
                    : 'rgba(107,114,128,0.1)',
                  color: scheduled.enabled ? '#6366F1' : '#6B7280',
                }}
              >
                {scheduled.frequency}
              </span>

              {/* Actions */}
              <button
                className={`sp-px-4 sp-py-2 sp-rounded-lg sp-text-sm sp-font-medium sp-transition-colors ${
                  scheduled.enabled
                    ? 'sp-bg-red-500/20 sp-text-red-400 hover:sp-bg-red-500/30'
                    : 'sp-bg-green-500/20 sp-text-green-400 hover:sp-bg-green-500/30'
                }`}
              >
                {scheduled.enabled ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;

