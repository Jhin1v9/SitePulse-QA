/**
 * SITEPULSE STUDIO v3.0 - FINDINGS SCREEN
 * Issue board com severity, triage e filtros
 */

import React, { useState } from 'react';
import type { ReportIssue } from '../types';

type SeverityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'info';
type StatusFilter = 'all' | 'open' | 'in_progress' | 'resolved';

const SEVERITY_CONFIG = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', label: 'Critical' },
  high: { color: '#F97316', bg: 'rgba(249,115,22,0.1)', label: 'High' },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', label: 'Medium' },
  low: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', label: 'Low' },
  info: { color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Info' },
};

// Dados mock para demonstração
const MOCK_ISSUES: ReportIssue[] = [
  {
    id: '1',
    code: 'LAYOUT_SHIFT',
    severity: 'critical',
    route: '/checkout',
    action: 'submit-payment',
    detail: 'Layout shift detected during payment submission',
    recommendedResolution: 'Add size attributes to images and ads',
  },
  {
    id: '2',
    code: 'BUTTON_NO_EFFECT',
    severity: 'high',
    route: '/dashboard',
    action: 'export-report',
    detail: 'Button click has no visible effect',
    recommendedResolution: 'Add loading state and success feedback',
  },
  {
    id: '3',
    code: 'CONSOLE_ERROR',
    severity: 'medium',
    route: '/analytics',
    detail: 'Uncaught TypeError: Cannot read property of undefined',
    recommendedResolution: 'Add null checks before accessing nested properties',
  },
  {
    id: '4',
    code: 'SEO_MISSING_META',
    severity: 'low',
    route: '/blog/article-1',
    detail: 'Meta description is missing',
    recommendedResolution: 'Add descriptive meta description',
  },
];

export const Findings: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  const filteredIssues = MOCK_ISSUES.filter((issue) => {
    const matchesSeverity = severityFilter === 'all' || issue.severity === severityFilter;
    const matchesSearch =
      searchQuery === '' ||
      issue.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const stats = {
    total: MOCK_ISSUES.length,
    critical: MOCK_ISSUES.filter((i) => i.severity === 'critical').length,
    high: MOCK_ISSUES.filter((i) => i.severity === 'high').length,
    medium: MOCK_ISSUES.filter((i) => i.severity === 'medium').length,
    low: MOCK_ISSUES.filter((i) => i.severity === 'low').length,
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIssues);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIssues(next);
  };

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div className="sp-flex sp-items-center sp-justify-between">
        <div>
          <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-1">Findings</h1>
          <p className="sp-text-text-secondary">Issues encontrados nas auditorias</p>
        </div>
        <div className="sp-flex sp-gap-3">
          <button className="sp-px-4 sp-py-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-text-secondary hover:sp-text-white sp-transition-colors">
            Exportar
          </button>
          <button className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-font-medium hover:sp-brightness-110 sp-transition-all">
            Auto-Fix
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="sp-grid sp-grid-cols-5 sp-gap-4">
        <StatCard label="Total" value={stats.total} color="#6366F1" />
        <StatCard label="Critical" value={stats.critical} color="#EF4444" />
        <StatCard label="High" value={stats.high} color="#F97316" />
        <StatCard label="Medium" value={stats.medium} color="#F59E0B" />
        <StatCard label="Low" value={stats.low} color="#3B82F6" />
      </div>

      {/* Filters */}
      <div className="sp-flex sp-items-center sp-gap-4">
        <div className="sp-flex-1 sp-relative">
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
            placeholder="Buscar issues..."
            className="sp-w-full sp-pl-10 sp-pr-4 sp-py-2.5 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-placeholder-text-tertiary sp-focus:border-primary sp-focus:outline-none"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
          className="sp-px-4 sp-py-2.5 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:outline-none"
        >
          <option value="all">Todas severidades</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="sp-px-4 sp-py-2.5 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:outline-none"
        >
          <option value="all">Todos status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="sp-space-y-3">
        {filteredIssues.map((issue) => {
          const severity = SEVERITY_CONFIG[issue.severity];
          const isSelected = selectedIssues.has(issue.id);

          return (
            <div
              key={issue.id}
              onClick={() => toggleSelection(issue.id)}
              className={`sp-group sp-rounded-xl sp-border sp-p-4 sp-cursor-pointer sp-transition-all ${
                isSelected
                  ? 'sp-border-primary/50 sp-bg-primary/5'
                  : 'sp-border-white/[0.06] hover:sp-border-white/[0.1]'
              }`}
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="sp-flex sp-items-start sp-gap-4">
                {/* Checkbox */}
                <div
                  className={`sp-w-5 sp-h-5 sp-rounded sp-border sp-flex sp-items-center sp-justify-center sp-transition-colors ${
                    isSelected
                      ? 'sp-bg-primary sp-border-primary'
                      : 'sp-border-white/[0.2] group-hover:sp-border-white/[0.4]'
                  }`}
                >
                  {isSelected && (
                    <svg className="sp-w-3 sp-h-3 sp-text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12l5 5L20 7" />
                    </svg>
                  )}
                </div>

                {/* Severity Badge */}
                <span
                  className="sp-px-3 sp-py-1 sp-rounded-full sp-text-xs sp-font-medium sp-uppercase"
                  style={{
                    background: severity.bg,
                    color: severity.color,
                  }}
                >
                  {severity.label}
                </span>

                {/* Content */}
                <div className="sp-flex-1 sp-min-w-0">
                  <div className="sp-flex sp-items-center sp-gap-2 sp-mb-1">
                    <code className="sp-text-xs sp-text-primary sp-bg-primary/10 sp-px-2 sp-py-0.5 sp-rounded">
                      {issue.code}
                    </code>
                    <span className="sp-text-xs sp-text-text-tertiary">{issue.route}</span>
                    {issue.action && (
                      <>
                        <span className="sp-text-text-tertiary">→</span>
                        <span className="sp-text-xs sp-text-text-secondary">{issue.action}</span>
                      </>
                    )}
                  </div>
                  <p className="sp-text-white sp-mb-2">{issue.detail}</p>
                  <p className="sp-text-sm sp-text-text-secondary">
                    <span className="sp-text-text-tertiary">Resolução: </span>
                    {issue.recommendedResolution}
                  </p>
                </div>

                {/* Actions */}
                <div className="sp-flex sp-gap-2 sp-opacity-0 group-hover:sp-opacity-100 sp-transition-opacity">
                  <button className="sp-px-3 sp-py-1.5 sp-rounded-lg sp-border sp-border-white/[0.06] sp-text-xs sp-text-text-secondary hover:sp-text-white hover:sp-border-white/[0.2] sp-transition-colors">
                    Ignorar
                  </button>
                  <button className="sp-px-3 sp-py-1.5 sp-rounded-lg sp-bg-primary/20 sp-text-xs sp-text-primary hover:sp-bg-primary/30 sp-transition-colors">
                    Ver detalhes
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredIssues.length === 0 && (
          <div className="sp-text-center sp-py-12 sp-text-text-secondary">
            Nenhum issue encontrado com os filtros atuais
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    className="sp-rounded-xl sp-border sp-p-4"
    style={{ borderColor: `${color}30`, background: 'rgba(255,255,255,0.02)' }}
  >
    <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary sp-mb-1">
      {label}
    </p>
    <p className="sp-text-2xl sp-font-bold" style={{ color }}>
      {value}
    </p>
  </div>
);

export default Findings;

