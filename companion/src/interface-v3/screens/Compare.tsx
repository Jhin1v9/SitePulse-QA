/**
 * SITEPULSE STUDIO v3.0 - COMPARE SCREEN
 * Comparação de auditorias e identificação de regressões
 */

import React, { useState } from 'react';

interface AuditSnapshot {
  id: string;
  date: string;
  score: number;
  issues: number;
  routes: number;
}

const MOCK_SNAPSHOTS: AuditSnapshot[] = [
  { id: '1', date: '2026-04-03', score: 85, issues: 12, routes: 24 },
  { id: '2', date: '2026-03-28', score: 82, issues: 15, routes: 22 },
  { id: '3', date: '2026-03-21', score: 78, issues: 18, routes: 20 },
  { id: '4', date: '2026-03-14', score: 80, issues: 16, routes: 21 },
];

interface DeltaProps {
  current: number;
  previous: number;
  invert?: boolean;
}

const Delta: React.FC<DeltaProps> = ({ current, previous, invert }) => {
  const diff = current - previous;
  const isPositive = invert ? diff < 0 : diff > 0;
  const color = isPositive ? '#22C55E' : diff === 0 ? '#6B7280' : '#EF4444';
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

  return (
    <span className="sp-text-sm sp-font-medium" style={{ color }}>
      {arrow} {Math.abs(diff)}
    </span>
  );
};

export const Compare: React.FC = () => {
  const [baselineId, setBaselineId] = useState<string>('');
  const [currentId, setCurrentId] = useState<string>('1');

  const baseline = MOCK_SNAPSHOTS.find((s) => s.id === baselineId);
  const current = MOCK_SNAPSHOTS.find((s) => s.id === currentId);

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div>
        <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-1">Compare</h1>
        <p className="sp-text-text-secondary">Delta, regressões e baseline</p>
      </div>

      {/* Snapshot Selectors */}
      <div className="sp-grid sp-grid-cols-2 sp-gap-6">
        <div
          className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <label className="sp-block sp-text-sm sp-text-text-secondary sp-mb-2">
            Baseline (referência)
          </label>
          <select
            value={baselineId}
            onChange={(e) => setBaselineId(e.target.value)}
            className="sp-w-full sp-px-3 sp-py-2 sp-rounded-lg sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:outline-none"
          >
            <option value="">Selecionar...</option>
            {MOCK_SNAPSHOTS.filter((s) => s.id !== currentId).map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} - Score: {s.score}
              </option>
            ))}
          </select>
        </div>

        <div
          className="sp-rounded-xl sp-border sp-border-primary/30 sp-p-4"
          style={{ background: 'rgba(99,102,241,0.05)' }}
        >
          <label className="sp-block sp-text-sm sp-text-text-secondary sp-mb-2">
            Atual
          </label>
          <select
            value={currentId}
            onChange={(e) => setCurrentId(e.target.value)}
            className="sp-w-full sp-px-3 sp-py-2 sp-rounded-lg sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:outline-none"
          >
            {MOCK_SNAPSHOTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.date} - Score: {s.score}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Results */}
      {baseline && current && (
        <div className="sp-space-y-6">
          {/* Summary Cards */}
          <div className="sp-grid sp-grid-cols-3 sp-gap-4">
            <ComparisonCard
              label="SEO Score"
              current={current.score}
              previous={baseline.score}
              higherIsBetter
            />
            <ComparisonCard
              label="Issues"
              current={current.issues}
              previous={baseline.issues}
              higherIsBetter={false}
            />
            <ComparisonCard
              label="Rotas"
              current={current.routes}
              previous={baseline.routes}
              higherIsBetter
            />
          </div>

          {/* Changes List */}
          <div
            className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">
              Mudanças Detectadas
            </h3>

            <div className="sp-space-y-3">
              {/* New Issues */}
              <div className="sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-lg sp-bg-red-500/10 sp-border sp-border-red-500/20">
                <span className="sp-text-2xl">🐛</span>
                <div className="sp-flex-1">
                  <p className="sp-text-white sp-font-medium">Novos Issues</p>
                  <p className="sp-text-sm sp-text-text-secondary">
                    3 novos problemas encontrados desde o baseline
                  </p>
                </div>
                <span className="sp-px-3 sp-py-1 sp-rounded-full sp-bg-red-500/20 sp-text-red-400 sp-text-sm sp-font-medium">
                  +3
                </span>
              </div>

              {/* Fixed Issues */}
              <div className="sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-lg sp-bg-green-500/10 sp-border sp-border-green-500/20">
                <span className="sp-text-2xl">✅</span>
                <div className="sp-flex-1">
                  <p className="sp-text-white sp-font-medium">Issues Resolvidos</p>
                  <p className="sp-text-sm sp-text-text-secondary">
                    6 problemas foram corrigidos
                  </p>
                </div>
                <span className="sp-px-3 sp-py-1 sp-rounded-full sp-bg-green-500/20 sp-text-green-400 sp-text-sm sp-font-medium">
                  -6
                </span>
              </div>

              {/* Regressions */}
              <div className="sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-lg sp-bg-yellow-500/10 sp-border sp-border-yellow-500/20">
                <span className="sp-text-2xl">⚠️</span>
                <div className="sp-flex-1">
                  <p className="sp-text-white sp-font-medium">Regressões</p>
                  <p className="sp-text-sm sp-text-text-secondary">
                    2 métricas pioraram desde o baseline
                  </p>
                </div>
                <span className="sp-px-3 sp-py-1 sp-rounded-full sp-bg-yellow-500/20 sp-text-yellow-400 sp-text-sm sp-medium">
                  2
                </span>
              </div>

              {/* Improvements */}
              <div className="sp-flex sp-items-center sp-gap-4 sp-p-4 sp-rounded-lg sp-bg-blue-500/10 sp-border sp-border-blue-500/20">
                <span className="sp-text-2xl">📈</span>
                <div className="sp-flex-1">
                  <p className="sp-text-white sp-font-medium">Melhorias</p>
                  <p className="sp-text-sm sp-text-text-secondary">
                    4 métricas melhoraram significativamente
                  </p>
                </div>
                <span className="sp-px-3 sp-py-1 sp-rounded-full sp-bg-blue-500/20 sp-text-blue-400 sp-text-sm sp-font-medium">
                  +4
                </span>
              </div>
            </div>
          </div>

          {/* Trend Chart Placeholder */}
          <div
            className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-6"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">
              Tendência
            </h3>
            <div className="sp-h-48 sp-flex sp-items-end sp-justify-between sp-gap-2">
              {MOCK_SNAPSHOTS.map((s, i) => (
                <div key={s.id} className="sp-flex-1 sp-flex sp-flex-col sp-items-center sp-gap-2">
                  <div
                    className="sp-w-full sp-rounded-t-lg sp-transition-all"
                    style={{
                      height: `${s.score * 2}px`,
                      background:
                        s.id === currentId
                          ? '#6366F1'
                          : s.id === baselineId
                          ? '#8B5CF6'
                          : 'rgba(255,255,255,0.1)',
                    }}
                  />
                  <span className="sp-text-xs sp-text-text-tertiary">{s.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!baseline && (
        <div className="sp-text-center sp-py-12 sp-text-text-secondary">
          Selecione um baseline para comparar
        </div>
      )}
    </div>
  );
};

const ComparisonCard: React.FC<{
  label: string;
  current: number;
  previous: number;
  higherIsBetter: boolean;
}> = ({ label, current, previous, higherIsBetter }) => {
  const diff = current - previous;
  const isPositive = higherIsBetter ? diff > 0 : diff < 0;
  const color = isPositive ? '#22C55E' : diff === 0 ? '#6B7280' : '#EF4444';

  return (
    <div
      className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary sp-mb-2">
        {label}
      </p>
      <div className="sp-flex sp-items-baseline sp-gap-3">
        <span className="sp-text-3xl sp-font-bold sp-text-white">{current}</span>
        <span className="sp-text-lg sp-font-medium" style={{ color }}>
          {diff > 0 ? '+' : ''}
          {diff}
        </span>
      </div>
      <p className="sp-text-xs sp-text-text-secondary sp-mt-1">vs {previous} anterior</p>
    </div>
  );
};

export default Compare;

