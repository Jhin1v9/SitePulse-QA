/**
 * SITEPULSE STUDIO v3.0 - SEO SCREEN
 * Análise completa de SEO com métricas e recomendações
 */

import React, { useState } from 'react';

interface SEOMetric {
  name: string;
  score: number;
  weight: number;
  status: 'good' | 'needs-improvement' | 'poor';
  issues: string[];
}

const SEO_METRICS: SEOMetric[] = [
  {
    name: 'Meta Tags',
    score: 85,
    weight: 20,
    status: 'good',
    issues: ['3 páginas sem meta description'],
  },
  {
    name: 'Heading Structure',
    score: 72,
    weight: 15,
    status: 'needs-improvement',
    issues: ['H1 duplicado em 2 páginas', 'Hierarquia incorreta em /blog'],
  },
  {
    name: 'Image Optimization',
    score: 45,
    weight: 15,
    status: 'poor',
    issues: ['12 imagens sem alt text', '5 imagens sem compressão'],
  },
  {
    name: 'Internal Links',
    score: 90,
    weight: 10,
    status: 'good',
    issues: [],
  },
  {
    name: 'Mobile Friendly',
    score: 95,
    weight: 20,
    status: 'good',
    issues: [],
  },
  {
    name: 'Page Speed',
    score: 68,
    weight: 20,
    status: 'needs-improvement',
    issues: ['LCP > 2.5s em /checkout', 'CLS > 0.1 em /home'],
  },
];

const RECOMMENDATIONS = [
  'Adicionar meta descriptions únicas para todas as páginas',
  'Otimizar imagens com lazy loading e WebP',
  'Corrigir hierarquia de headings no blog',
  'Implementar schema markup para produtos',
  'Melhorar LCP reduzindo tamanho do hero image',
];

export const SEO: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pages' | 'keywords'>('overview');

  const overallScore = Math.round(
    SEO_METRICS.reduce((acc, m) => acc + m.score * (m.weight / 100), 0)
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22C55E';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div className="sp-flex sp-items-center sp-justify-between">
        <div>
          <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-1">SEO Analysis</h1>
          <p className="sp-text-text-secondary">Visibilidade, metadata e indexação</p>
        </div>
        <button className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-font-medium hover:sp-brightness-110 sp-transition-all">
          Exportar Relatório
        </button>
      </div>

      {/* Score Overview */}
      <div className="sp-grid sp-grid-cols-1 lg:sp-grid-cols-3 sp-gap-6">
        {/* Overall Score */}
        <div
          className="sp-rounded-2xl sp-border sp-p-6 sp-flex sp-flex-col sp-items-center sp-justify-center"
          style={{
            borderColor: `${getScoreColor(overallScore)}40`,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div className="sp-relative sp-w-32 sp-h-32 sp-mb-4">
            <svg className="sp-w-full sp-h-full sp--rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallScore * 2.83} 283`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="sp-absolute sp-inset-0 sp-flex sp-items-center sp-justify-center">
              <span
                className="sp-text-4xl sp-font-bold"
                style={{ color: getScoreColor(overallScore) }}
              >
                {overallScore}
              </span>
            </div>
          </div>
          <p className="sp-text-lg sp-font-medium sp-text-white">SEO Score</p>
          <p className="sp-text-sm sp-text-text-secondary">
            {overallScore >= 90
              ? 'Excelente'
              : overallScore >= 70
              ? 'Bom'
              : 'Precisa melhorar'}
          </p>
        </div>

        {/* Stats */}
        <div className="lg:sp-col-span-2 sp-grid sp-grid-cols-2 sp-gap-4">
          <StatBox label="Páginas Analisadas" value="24" />
          <StatBox label="Indexed" value="22" />
          <StatBox label="Issues Críticos" value="3" color="#EF4444" />
          <StatBox label="Warnings" value="8" color="#F59E0B" />
        </div>
      </div>

      {/* Tabs */}
      <div className="sp-flex sp-gap-2 sp-border-b sp-border-white/[0.06]">
        {(['overview', 'pages', 'keywords'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`sp-px-4 sp-py-3 sp-text-sm sp-font-medium sp-capitalize sp-transition-colors sp-relative ${
              activeTab === tab
                ? 'sp-text-white'
                : 'sp-text-text-secondary hover:sp-text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="sp-absolute sp-bottom-0 sp-left-0 sp-right-0 sp-h-0.5 sp-bg-primary sp-rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="sp-grid sp-grid-cols-1 lg:sp-grid-cols-2 sp-gap-6">
          {/* Metrics */}
          <div className="sp-space-y-4">
            <h3 className="sp-text-lg sp-font-semibold sp-text-white">Métricas</h3>
            {SEO_METRICS.map((metric) => (
              <div
                key={metric.name}
                className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="sp-flex sp-items-center sp-justify-between sp-mb-2">
                  <span className="sp-text-white sp-font-medium">{metric.name}</span>
                  <div className="sp-flex sp-items-center sp-gap-2">
                    <span
                      className="sp-text-lg sp-font-bold"
                      style={{ color: getScoreColor(metric.score) }}
                    >
                      {metric.score}
                    </span>
                    <span className="sp-text-xs sp-text-text-tertiary">/100</span>
                  </div>
                </div>
                <div className="sp-h-2 sp-rounded-full sp-bg-white/[0.06] sp-overflow-hidden">
                  <div
                    className="sp-h-full sp-rounded-full sp-transition-all"
                    style={{
                      width: `${metric.score}%`,
                      background: getScoreColor(metric.score),
                    }}
                  />
                </div>
                {metric.issues.length > 0 && (
                  <ul className="sp-mt-3 sp-space-y-1">
                    {metric.issues.map((issue, i) => (
                      <li key={i} className="sp-text-sm sp-text-text-secondary sp-flex sp-items-center sp-gap-2">
                        <span className="sp-w-1 sp-h-1 sp-rounded-full sp-bg-text-tertiary" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">Recomendações</h3>
            <div className="sp-space-y-3">
              {RECOMMENDATIONS.map((rec, i) => (
                <div
                  key={i}
                  className="sp-flex sp-items-start sp-gap-3 sp-p-4 sp-rounded-xl sp-border sp-border-white/[0.06]"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="sp-flex sp-items-center sp-justify-center sp-w-6 sp-h-6 sp-rounded-lg sp-bg-primary/20 sp-text-primary sp-text-sm sp-font-bold">
                    {i + 1}
                  </span>
                  <p className="sp-text-white sp-flex-1">{rec}</p>
                  <button className="sp-text-xs sp-text-primary hover:sp-underline">
                    Aplicar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pages' && (
        <div className="sp-text-center sp-py-12 sp-text-text-secondary">
          Lista de páginas em desenvolvimento
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="sp-text-center sp-py-12 sp-text-text-secondary">
          Análise de keywords em desenvolvimento
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color,
}) => (
  <div
    className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
    style={{ background: 'rgba(255,255,255,0.02)' }}
  >
    <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary sp-mb-1">
      {label}
    </p>
    <p className="sp-text-3xl sp-font-bold" style={{ color: color || 'white' }}>
      {value}
    </p>
  </div>
);

export default SEO;

