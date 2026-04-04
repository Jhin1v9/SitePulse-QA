/**
 * SITEPULSE STUDIO v3.0 - ENGINE DETAIL SCREEN
 * Visualização detalhada de um motor específico
 */

import React, { useState } from 'react';
import { useEngine, ENGINE_CONFIG } from '../hooks/useEngines';
import type { EngineId } from '../types';

interface EngineDetailProps {
  engineId: EngineId;
  onBack?: () => void;
}

export const EngineDetail: React.FC<EngineDetailProps> = ({ engineId, onBack }) => {
  const { engine, isLoading, execute, config } = useEngine(engineId);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'config'>('overview');
  const [isExecuting, setIsExecuting] = useState(false);

  if (isLoading || !engine) {
    return (
      <div className="sp-flex sp-items-center sp-justify-center sp-h-96">
        <div className="sp-flex sp-flex-col sp-items-center sp-gap-4">
          <div 
            className="sp-w-12 sp-h-12 sp-rounded-xl sp-animate-pulse"
            style={{ background: config.color }}
          />
          <p className="sp-text-text-secondary">Carregando motor...</p>
        </div>
      </div>
    );
  }

  const handleAction = async (action: string) => {
    setIsExecuting(true);
    try {
      await execute(action);
    } catch (error) {
      console.error(`[EngineDetail] Action failed:`, error);
    } finally {
      setIsExecuting(false);
    }
  };

  const isOnline = engine.status === 'online' || engine.status === 'busy';

  return (
    <div className="sp-space-y-6">
      {/* Header */}
      <div className="sp-flex sp-items-center sp-gap-4">
        {onBack && (
          <button 
            onClick={onBack}
            className="sp-p-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-text-secondary hover:sp-bg-white/[0.04] sp-transition-colors"
          >
            <svg className="sp-w-5 sp-h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}
        <div 
          className="sp-flex sp-items-center sp-justify-center sp-w-14 sp-h-14 sp-rounded-2xl sp-border"
          style={{
            borderColor: `${config.color}40`,
            background: `${config.color}15`,
            boxShadow: `0 0 30px ${config.color}25`,
          }}
        >
          <span className="sp-text-3xl">{config.icon}</span>
        </div>
        <div className="sp-flex-1">
          <h1 className="sp-text-2xl sp-font-bold sp-text-white">{config.name}</h1>
          <p className="sp-text-text-secondary">{config.description}</p>
        </div>
        <div 
          className="sp-px-4 sp-py-2 sp-rounded-full sp-text-sm sp-font-medium sp-capitalize"
          style={{
            background: isOnline ? `${config.color}15` : 'rgba(107,114,128,0.15)',
            color: isOnline ? config.color : '#9CA3AF',
            border: `1px solid ${isOnline ? `${config.color}30` : 'rgba(107,114,128,0.3)'}`,
          }}
        >
          {engine.status}
        </div>
      </div>

      {/* Tabs */}
      <div className="sp-flex sp-gap-2 sp-border-b sp-border-white/[0.06] sp-pb-px">
        {(['overview', 'logs', 'config'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`sp-px-4 sp-py-2 sp-text-sm sp-font-medium sp-capitalize sp-transition-colors sp-relative ${
              activeTab === tab ? 'sp-text-white' : 'sp-text-text-secondary hover:sp-text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div 
                className="sp-absolute sp-bottom-0 sp-left-0 sp-right-0 sp-h-0.5 sp-rounded-full"
                style={{ background: config.color }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="sp-mt-6">
        {activeTab === 'overview' && (
          <OverviewTab engine={engine} config={config} isExecuting={isExecuting} onAction={handleAction} />
        )}
        {activeTab === 'logs' && <LogsTab engineId={engineId} color={config.color} />}
        {activeTab === 'config' && <ConfigTab engineId={engineId} color={config.color} />}
      </div>
    </div>
  );
};

// Overview Tab
const OverviewTab: React.FC<{
  engine: any;
  config: any;
  isExecuting: boolean;
  onAction: (action: string) => void;
}> = ({ engine, config, isExecuting, onAction }) => {
  const metrics = [
    { label: 'Confiança', value: `${engine.metrics.confidence}%`, icon: '🎯' },
    { label: 'Precisão', value: `${engine.metrics.accuracy}%`, icon: '📊' },
    { label: 'Latência', value: `${engine.metrics.latency}ms`, icon: '⚡' },
    { label: 'Processado', value: engine.metrics.processed?.toLocaleString(), icon: '📦' },
  ];

  const actions = [
    { id: 'diagnose', label: 'Diagnóstico', icon: '🔍' },
    { id: 'optimize', label: 'Otimizar', icon: '⚙️' },
    { id: 'reset', label: 'Reset', icon: '🔄' },
  ];

  return (
    <div className="sp-grid sp-grid-cols-1 lg:sp-grid-cols-2 sp-gap-6">
      {/* Metrics Card */}
      <div 
        className="sp-rounded-2xl sp-border sp-p-6"
        style={{
          borderColor: `${config.color}20`,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">Métricas</h3>
        <div className="sp-grid sp-grid-cols-2 sp-gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className="sp-rounded-xl sp-p-4"
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="sp-flex sp-items-center sp-gap-2 sp-mb-2">
                <span className="sp-text-lg">{metric.icon}</span>
                <span className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary">{metric.label}</span>
              </div>
              <p className="sp-text-2xl sp-font-bold sp-text-white">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Card */}
      <div 
        className="sp-rounded-2xl sp-border sp-p-6"
        style={{
          borderColor: `${config.color}20`,
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">Ações</h3>
        <div className="sp-space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action.id)}
              disabled={isExecuting || engine.status !== 'online'}
              className="sp-w-full sp-flex sp-items-center sp-gap-3 sp-px-4 sp-py-3 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-transition-all hover:sp-bg-white/[0.04] disabled:sp-opacity-50 disabled:sp-cursor-not-allowed"
            >
              <span className="sp-text-xl">{action.icon}</span>
              <span className="sp-flex-1 sp-text-left sp-font-medium">{action.label}</span>
              {isExecuting && <span className="sp-text-text-secondary">...</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Logs Tab (placeholder)
const LogsTab: React.FC<{ engineId: EngineId; color: string }> = ({ engineId, color }) => {
  const logs = [
    { time: '10:23:45', level: 'info', message: `Motor ${engineId} inicializado` },
    { time: '10:23:46', level: 'info', message: 'Configurações carregadas' },
    { time: '10:23:47', level: 'success', message: 'Conexão estabelecida' },
    { time: '10:24:12', level: 'info', message: 'Processando batch #1234' },
  ];

  const levelColors = {
    info: '#60A5FA',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
  };

  return (
    <div 
      className="sp-rounded-2xl sp-border sp-p-4 sp-font-mono sp-text-sm"
      style={{
        borderColor: `${color}20`,
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div className="sp-space-y-2">
        {logs.map((log, i) => (
          <div key={i} className="sp-flex sp-gap-3">
            <span className="sp-text-text-tertiary">{log.time}</span>
            <span 
              className="sp-uppercase sp-text-xs sp-font-bold sp-px-2 sp-py-0.5 sp-rounded"
              style={{ 
                background: `${levelColors[log.level as keyof typeof levelColors]}20`,
                color: levelColors[log.level as keyof typeof levelColors],
              }}
            >
              {log.level}
            </span>
            <span className="sp-text-text-secondary">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Config Tab (placeholder)
const ConfigTab: React.FC<{ engineId: EngineId; color: string }> = ({ engineId, color }) => {
  return (
    <div 
      className="sp-rounded-2xl sp-border sp-p-6"
      style={{
        borderColor: `${color}20`,
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <h3 className="sp-text-lg sp-font-semibold sp-text-white sp-mb-4">Configurações</h3>
      <div className="sp-space-y-4">
        <div>
          <label className="sp-block sp-text-sm sp-text-text-secondary sp-mb-2">Timeout (ms)</label>
          <input 
            type="number" 
            defaultValue={30000}
            className="sp-w-full sp-px-4 sp-py-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:border-primary sp-focus:outline-none"
          />
        </div>
        <div>
          <label className="sp-block sp-text-sm sp-text-text-secondary sp-mb-2">Max Retries</label>
          <input 
            type="number" 
            defaultValue={3}
            className="sp-w-full sp-px-4 sp-py-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-white sp-focus:border-primary sp-focus:outline-none"
          />
        </div>
        <div className="sp-flex sp-items-center sp-gap-3">
          <input 
            type="checkbox" 
            id="auto-retry"
            defaultChecked
            className="sp-w-4 sp-h-4 sp-rounded sp-border-white/[0.06]"
          />
          <label htmlFor="auto-retry" className="sp-text-sm sp-text-text-secondary">Auto-retry on failure</label>
        </div>
      </div>
    </div>
  );
};

