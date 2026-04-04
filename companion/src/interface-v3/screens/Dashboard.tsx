/**
 * DASHBOARD - SitePulse Studio v3.0
 * Visão geral do sistema
 */

import React from 'react';
import { 
  Target, 
  Brain, 
  FileSearch, 
  Database, 
  TrendingUp, 
  GitBranch, 
  Zap, 
  Eye, 
  Bot, 
  Shield 
} from 'lucide-react';

interface Engine {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  status: 'live' | 'watching' | 'idle' | 'learning';
  metric: number;
  metricLabel: string;
}

const engines: Engine[] = [
  { id: 'intent', name: 'Intent', icon: <Target size={20} />, color: '#EC4899', status: 'live', metric: 94, metricLabel: 'accuracy' },
  { id: 'context', name: 'Context', icon: <Brain size={20} />, color: '#8B5CF6', status: 'live', metric: 87, metricLabel: 'mapped' },
  { id: 'evidence', name: 'Evidence', icon: <FileSearch size={20} />, color: '#06B6D4', status: 'watching', metric: 42, metricLabel: 'collected' },
  { id: 'memory', name: 'Memory', icon: <Database size={20} />, color: '#F59E0B', status: 'live', metric: 156, metricLabel: 'patterns' },
  { id: 'learning', name: 'Learning', icon: <TrendingUp size={20} />, color: '#10B981', status: 'learning', metric: 78, metricLabel: 'progress' },
  { id: 'decision', name: 'Decision', icon: <GitBranch size={20} />, color: '#6366F1', status: 'live', metric: 23, metricLabel: 'decisions' },
  { id: 'action', name: 'Action', icon: <Zap size={20} />, color: '#EF4444', status: 'idle', metric: 0, metricLabel: 'pending' },
  { id: 'predictive', name: 'Predictive', icon: <Eye size={20} />, color: '#3B82F6', status: 'watching', metric: 12, metricLabel: 'alerts' },
  { id: 'autonomous', name: 'Autonomous', icon: <Bot size={20} />, color: '#14B8A6', status: 'live', metric: 99.9, metricLabel: 'uptime' },
  { id: 'security', name: 'Security', icon: <Shield size={20} />, color: '#DC2626', status: 'live', metric: 72, metricLabel: 'score' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="hero-grid">
        {/* Main Panel */}
        <div className="live-hero-panel">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-purple/5 blur-[100px] pointer-events-none" />
          
          <div className="relative">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="chip chip-blue">
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-blue" />
                </span>
                Operator
              </span>
              <span className="chip chip-red animate-pulse-slow">
                Critical
              </span>
              <span className="chip">
                Desktop
              </span>
            </div>

            <div className="grid grid-cols-[1fr,380px] gap-8">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-text-tertiary mb-2">Overview</p>
                <h1 className="text-[48px] font-semibold tracking-tight text-text-primary mb-4">
                  Dashboard
                </h1>
                <p className="text-base leading-8 text-text-secondary max-w-2xl mb-6">
                  SitePulse Intelligence Operating System está monitorando seu ambiente 
                  com 10 motores de IA trabalhando em conjunto para detectar, analisar 
                  e corrigir vulnerabilidades em tempo real.
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <span className="chip chip-red">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
                    </svg>
                    Top risk: commercial SEO leakage
                  </span>
                  <span className="chip chip-amber">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 5v14M19 12l-7 7-7-7" />
                    </svg>
                    Trajectory: degrading
                  </span>
                  <span className="chip" style={{ borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)', color: '#86efac' }}>
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Memory confidence: strong
                  </span>
                </div>
              </div>

              {/* 4-quad Metrics */}
              <div className="metrics-grid">
                <MetricCard 
                  label="Impact"
                  value="2"
                  sublabel="high-priority issues"
                  color="red"
                  bars={[1, 0.6, 0.3, 0.1]}
                />
                <MetricCard 
                  label="Predictive"
                  value="12"
                  sublabel="high / critical alerts"
                  color="amber"
                  icon={<Eye size={14} />}
                />
                <MetricCard 
                  label="Healing"
                  value="0"
                  sublabel="pending attempts"
                  color="purple"
                  bars={[0.4, 0.4, 0.4]}
                />
                <MetricCard 
                  label="Quality"
                  value="72"
                  sublabel="Trajectory stable"
                  color="neutral"
                  showTrend
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Summary Panel */}
        <div className="live-hero-panel">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 blur-[60px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-5 relative">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-text-tertiary">System Summary</p>
              <p className="mt-1 text-[15px] text-text-primary">What matters right now</p>
            </div>
            <span className="chip chip-green">
              <span className="chip-dot" style={{ background: '#4ade80' }} />
              aligned
            </span>
          </div>

          <div className="space-y-5 border-t border-white-6 pt-5">
            <SummaryItem label="Top Opportunity" color="#5B8CFF">
              SQL Injection em endpoint /api/users requer atenção imediata
            </SummaryItem>
            <SummaryItem label="Pattern" color="#A855F7">
              Falhas de login em sequência detectadas nos últimos 15 minutos
            </SummaryItem>
            <SummaryItem label="Recommended Order" color="#F59E0B" mono>
              1. Patch SQLi → 2. Update CSP → 3. Review Auth
            </SummaryItem>
          </div>
        </div>
      </section>

      {/* Engines Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">AI Engines</h2>
          <span className="text-sm text-text-secondary">10 motores ativos</span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {engines.map((engine) => (
            <EngineCard key={engine.id} engine={engine} />
          ))}
        </div>
      </section>
    </div>
  );
};

// Componente de Card de Engine
interface EngineCardProps {
  engine: Engine;
}

const EngineCard: React.FC<EngineCardProps> = ({ engine }) => {
  const statusColors = {
    live: '#22C55E',
    watching: '#F59E0B',
    idle: '#5A6578',
    learning: '#3B82F6',
  };

  return (
    <div 
      className="live-hero-panel p-4 cursor-pointer group"
      style={{ 
        borderColor: `${engine.color}20`,
        background: `linear-gradient(to bottom, ${engine.color}08, transparent)`
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div 
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ 
            background: `${engine.color}15`,
            border: `1px solid ${engine.color}30`,
            color: engine.color
          }}
        >
          {engine.icon}
        </div>
        <div className="flex items-center gap-1.5">
          <span 
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ 
              background: statusColors[engine.status],
              boxShadow: `0 0 8px ${statusColors[engine.status]}`
            }} 
          />
          <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
            {engine.status}
          </span>
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-text-primary mb-1">{engine.name}</h3>
      
      <div className="flex items-end gap-2">
        <span className="text-2xl font-semibold tracking-tight" style={{ color: engine.color }}>
          {engine.metric}
        </span>
        <span className="text-[10px] text-text-tertiary mb-1">{engine.metricLabel}</span>
      </div>
    </div>
  );
};

// Componente de Card de Métrica
interface MetricCardProps {
  label: string;
  value: string;
  sublabel: string;
  color: 'red' | 'amber' | 'purple' | 'neutral';
  bars?: number[];
  icon?: React.ReactNode;
  showTrend?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  sublabel, 
  color, 
  bars, 
  icon,
  showTrend 
}) => {
  const colorMap = {
    red: { text: '#f87171', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
    amber: { text: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    purple: { text: '#d8b4fe', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
    neutral: { text: '#F0F4F8', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.06)' },
  };

  const c = colorMap[color];

  return (
    <div 
      className="rounded-2xl border p-4 relative overflow-hidden group cursor-pointer transition-all hover:shadow-lg"
      style={{ borderColor: c.border, background: `linear-gradient(to bottom right, ${c.bg}, transparent)` }}
    >
      <div 
        className="absolute inset-0 animate-pulse-slow"
        style={{ background: c.bg, opacity: 0.5 }}
      />
      <div className="relative">
        <p className="text-[10px] uppercase tracking-widest text-text-tertiary">{label}</p>
        <div className="flex items-end gap-2 mt-2">
          <p className="text-[28px] font-semibold tracking-tight" style={{ color: c.text }}>
            {value}
          </p>
          {showTrend && (
            <svg className="h-4 w-4 text-amber-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          )}
          {icon && <span className="text-text-tertiary mb-1">{icon}</span>}
        </div>
        <p className="mt-1 text-[11px] text-text-tertiary">{sublabel}</p>
        
        {bars && (
          <div className="mt-3 flex gap-1">
            {bars.map((bar, i) => (
              <div 
                key={i} 
                className="h-1.5 flex-1 rounded-full metric-bar"
                style={{ 
                  background: bar >= 0.4 ? c.text : 'rgba(255,255,255,0.1)',
                  opacity: bar
                }} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Item de Summary
interface SummaryItemProps {
  label: string;
  children: React.ReactNode;
  color: string;
  mono?: boolean;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, children, color, mono }) => (
  <div className="group cursor-pointer">
    <p 
      className="text-[10px] uppercase tracking-widest transition-colors"
      style={{ color: '#5A6578' }}
    >
      {label}
    </p>
    <p 
      className={`mt-1 text-sm text-text-primary leading-relaxed group-hover:text-white transition-colors ${mono ? 'font-mono text-[13px]' : ''}`}
      style={{ '--hover-color': color } as React.CSSProperties}
    >
      {children}
    </p>
  </div>
);
