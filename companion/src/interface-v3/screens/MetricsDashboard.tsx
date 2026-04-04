/**
 * SITEPULSE STUDIO v3.0 - METRICS DASHBOARD
 * Dashboard de métricas em tempo real dos 10 motores
 */

import React, { useEffect, useState } from 'react';
import { useEngines, ENGINE_CONFIG } from '../hooks/useEngines';
import { useAuditState } from '../hooks/useIPC';
import { Gauge, MiniGauge } from '../components/charts/Gauge';
import { SparklineWithValue } from '../components/charts/Sparkline';
import { HorizontalBarChart } from '../components/charts/BarChart';
import type { EngineId } from '../types';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  sparklineData?: number[];
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  sparklineData,
  color = '#6366F1',
}) => {
  const trendColor =
    trend === undefined ? '#6B7280' : trend >= 0 ? '#22C55E' : '#EF4444';
  const trendIcon = trend === undefined ? '' : trend >= 0 ? '↑' : '↓';

  return (
    <div
      className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-4"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary sp-mb-2">
        {label}
      </p>
      <div className="sp-flex sp-items-end sp-justify-between">
        <div>
          <div className="sp-flex sp-items-baseline sp-gap-1">
            <span className="sp-text-2xl sp-font-bold sp-text-white">
              {value.toLocaleString()}
            </span>
            {unit && (
              <span className="sp-text-sm sp-text-text-secondary">{unit}</span>
            )}
          </div>
          {trend !== undefined && (
            <span
              className="sp-text-sm sp-font-medium"
              style={{ color: trendColor }}
            >
              {trendIcon} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {sparklineData && (
          <SparklineWithValue
            data={sparklineData}
            width={100}
            height={30}
            color={color}
            label=""
            value={0}
          />
        )}
      </div>
    </div>
  );
};

interface EngineMetricCardProps {
  engineId: EngineId;
  metrics: {
    confidence?: number;
    accuracy?: number;
    latency?: number;
    processed?: number;
  };
}

const EngineMetricCard: React.FC<EngineMetricCardProps> = ({
  engineId,
  metrics,
}) => {
  const config = ENGINE_CONFIG[engineId];

  return (
    <div
      className="sp-rounded-xl sp-border sp-p-4 sp-transition-all hover:sp-border-opacity-30"
      style={{
        borderColor: `${config.color}30`,
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div className="sp-flex sp-items-center sp-gap-3 sp-mb-4">
        <div
          className="sp-w-10 sp-h-10 sp-rounded-xl sp-flex sp-items-center sp-justify-center sp-text-xl"
          style={{
            background: `${config.color}15`,
            border: `1px solid ${config.color}30`,
          }}
        >
          {config.icon}
        </div>
        <div>
          <h3 className="sp-font-medium sp-text-white">{config.name}</h3>
          <p className="sp-text-xs sp-text-text-tertiary">{config.description}</p>
        </div>
      </div>

      <div className="sp-grid sp-grid-cols-2 sp-gap-3">
        <div className="sp-text-center sp-p-2 sp-rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <MiniGauge value={metrics.confidence || 0} size={32} color={config.color} />
          <p className="sp-text-xs sp-text-text-tertiary sp-mt-1">Confiança</p>
        </div>
        <div className="sp-text-center sp-p-2 sp-rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
          <span className="sp-text-lg sp-font-bold" style={{ color: config.color }}>
            {(metrics.processed || 0).toLocaleString()}
          </span>
          <p className="sp-text-xs sp-text-text-tertiary sp-mt-1">Processado</p>
        </div>
      </div>
    </div>
  );
};

export const MetricsDashboard: React.FC = () => {
  const { engines, overallHealth } = useEngines();
  const { state } = useAuditState();
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Dados simulados para sparklines
  const generateTrend = () =>
    Array.from({ length: 20 }, () => Math.random() * 50 + 50);

  const [trends] = useState({
    requests: generateTrend(),
    latency: generateTrend(),
    errors: generateTrend(),
    cpu: generateTrend(),
  });

  // Métricas de performance por motor
  const enginePerformance = engines.map((engine) => ({
    label: engine.name,
    value: engine.metrics.accuracy || 0,
    color: ENGINE_CONFIG[engine.id].color,
  }));

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div className="sp-flex sp-items-center sp-justify-between">
        <div>
          <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-1">
            Metrics Dashboard
          </h1>
          <p className="sp-text-text-secondary">
            Métricas em tempo real dos 10 motores de IA
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="sp-flex sp-gap-2">
          {(['1h', '24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`sp-px-3 sp-py-1.5 sp-rounded-lg sp-text-sm sp-transition-colors ${
                timeRange === range
                  ? 'sp-bg-primary sp-text-white'
                  : 'sp-bg-white/[0.05] sp-text-text-secondary hover:sp-text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Health Score */}
      <div
        className="sp-rounded-2xl sp-border sp-p-6 sp-flex sp-items-center sp-justify-between"
        style={{
          borderColor:
            overallHealth === 'healthy'
              ? 'rgba(34,197,94,0.3)'
              : overallHealth === 'busy'
              ? 'rgba(245,158,11,0.3)'
              : 'rgba(239,68,68,0.3)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="sp-flex sp-items-center sp-gap-6">
          <Gauge
            value={
              overallHealth === 'healthy'
                ? 95
                : overallHealth === 'busy'
                ? 75
                : overallHealth === 'degraded'
                ? 50
                : 30
            }
            size={100}
            strokeWidth={8}
          />
          <div>
            <h2 className="sp-text-xl sp-font-semibold sp-text-white sp-capitalize">
              System Health: {overallHealth}
            </h2>
            <p className="sp-text-text-secondary sp-mt-1">
              {engines.filter((e) => e.status === 'online').length} de {engines.length} motores online
            </p>
            {state?.running && (
              <div className="sp-flex sp-items-center sp-gap-2 sp-mt-3">
                <span className="sp-w-2 sp-h-2 sp-rounded-full sp-bg-primary sp-animate-pulse" />
                <span className="sp-text-sm sp-text-primary">Auditoria em andamento</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="sp-flex sp-gap-8">
          <div className="sp-text-center">
            <p className="sp-text-3xl sp-font-bold sp-text-white">
              {state?.lastSummary?.routesChecked || 0}
            </p>
            <p className="sp-text-sm sp-text-text-tertiary">Rotas Analisadas</p>
          </div>
          <div className="sp-text-center">
            <p className="sp-text-3xl sp-font-bold sp-text-white">
              {state?.lastSummary?.totalIssues || 0}
            </p>
            <p className="sp-text-sm sp-text-text-tertiary">Issues Encontrados</p>
          </div>
          <div className="sp-text-center">
            <p className="sp-text-3xl sp-font-bold sp-text-white">
              {Math.round(state?.lastSummary?.seoScore || 0)}
            </p>
            <p className="sp-text-sm sp-text-text-tertiary">SEO Score</p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="sp-grid sp-grid-cols-4 sp-gap-4">
        <MetricCard
          label="Requests/min"
          value={1247}
          trend={12.5}
          sparklineData={trends.requests}
          color="#6366F1"
        />
        <MetricCard
          label="Avg Latency"
          value={45}
          unit="ms"
          trend={-8.2}
          sparklineData={trends.latency}
          color="#22C55E"
        />
        <MetricCard
          label="Error Rate"
          value={0.8}
          unit="%"
          trend={-15.3}
          sparklineData={trends.errors}
          color="#EF4444"
        />
        <MetricCard
          label="CPU Usage"
          value={42}
          unit="%"
          trend={5.1}
          sparklineData={trends.cpu}
          color="#F59E0B"
        />
      </div>

      {/* Two Column Layout */}
      <div className="sp-grid sp-grid-cols-2 sp-gap-6">
        {/* Engine Performance */}
        <div
          className="sp-rounded-xl sp-border sp-border-white/[0.06] sp-p-6"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">
            Performance dos Motores
          </h3>
          <HorizontalBarChart
            data={enginePerformance}
            width={400}
            barHeight={28}
          />
        </div>

        {/* Engine Grid */}
        <div className="sp-grid sp-grid-cols-2 sp-gap-4">
          {engines.slice(0, 4).map((engine) => (
            <EngineMetricCard
              key={engine.id}
              engineId={engine.id}
              metrics={engine.metrics}
            />
          ))}
        </div>
      </div>

      {/* All Engines */}
      <div>
        <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">
          Todos os Motores
        </h3>
        <div className="sp-grid sp-grid-cols-5 sp-gap-4">
          {engines.map((engine) => (
            <div
              key={engine.id}
              className="sp-rounded-xl sp-border sp-p-4 sp-text-center sp-transition-all hover:sp-border-opacity-50"
              style={{
                borderColor: `${ENGINE_CONFIG[engine.id].color}30`,
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              <div
                className="sp-w-12 sp-h-12 sp-rounded-xl sp-flex sp-items-center sp-justify-center sp-text-2xl sp-mx-auto sp-mb-3"
                style={{
                  background: `${ENGINE_CONFIG[engine.id].color}15`,
                  border: `1px solid ${ENGINE_CONFIG[engine.id].color}30`,
                }}
              >
                {ENGINE_CONFIG[engine.id].icon}
              </div>
              <p className="sp-text-sm sp-font-medium sp-text-white sp-truncate">
                {ENGINE_CONFIG[engine.id].name}
              </p>
              <div className="sp-flex sp-items-center sp-justify-center sp-gap-2 sp-mt-2">
                <span
                  className="sp-w-2 sp-h-2 sp-rounded-full"
                  style={{
                    background:
                      engine.status === 'online'
                        ? '#22C55E'
                        : engine.status === 'busy'
                        ? '#F59E0B'
                        : '#6B7280',
                    boxShadow:
                      engine.status === 'online'
                        ? '0 0 6px #22C55E'
                        : undefined,
                  }}
                />
                <span className="sp-text-xs sp-text-text-secondary sp-capitalize">
                  {engine.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;

