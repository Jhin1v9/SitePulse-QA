/**
 * SITEPULSE STUDIO v3.0 - ORCHESTRATOR SCREEN
 * Controle central de todos os motores
 */

import React, { useState } from 'react';
import { useEngines, ENGINE_CONFIG } from '../hooks/useEngines';
import { useAuditState } from '../hooks/useIPC';
import type { EngineId } from '../types';

export const Orchestrator: React.FC = () => {
  const { engines, overallHealth, executeEngineAction } = useEngines();
  const { state, startAudit, cancelAudit } = useAuditState();
  const [selectedEngines, setSelectedEngines] = useState<Set<EngineId>>(new Set());
  const [isRunning, setIsRunning] = useState(false);

  const toggleEngine = (id: EngineId) => {
    const next = new Set(selectedEngines);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedEngines(next);
  };

  const selectAll = () => {
    setSelectedEngines(new Set(engines.map(e => e.id)));
  };

  const deselectAll = () => {
    setSelectedEngines(new Set());
  };

  const runSelected = async () => {
    setIsRunning(true);
    for (const engineId of selectedEngines) {
      await executeEngineAction(engineId, 'run');
    }
    setIsRunning(false);
  };

  const onlineCount = engines.filter(e => e.status === 'online').length;
  const busyCount = engines.filter(e => e.status === 'busy').length;

  return (
    <div className="sp-space-y-8">
      {/* Header */}
      <div>
        <h1 className="sp-text-3xl sp-font-bold sp-text-white sp-mb-2">Orchestrator</h1>
        <p className="sp-text-text-secondary">
          Controle central dos 10 motores de IA
        </p>
      </div>

      {/* Stats Overview */}
      <div className="sp-grid sp-grid-cols-4 sp-gap-4">
        <StatCard 
          label="Online" 
          value={onlineCount} 
          total={engines.length}
          color="#22C55E"
        />
        <StatCard 
          label="Busy" 
          value={busyCount} 
          total={engines.length}
          color="#3B82F6"
        />
        <StatCard 
          label="Selected" 
          value={selectedEngines.size} 
          total={engines.length}
          color="#F59E0B"
        />
        <div 
          className="sp-rounded-2xl sp-border sp-p-4 sp-flex sp-flex-col sp-justify-center"
          style={{
            borderColor: overallHealth === 'healthy' ? 'rgba(34,197,94,0.3)' : 
                        overallHealth === 'busy' ? 'rgba(245,158,11,0.3)' :
                        'rgba(239,68,68,0.3)',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary">Health</p>
          <p 
            className="sp-text-2xl sp-font-bold sp-capitalize"
            style={{
              color: overallHealth === 'healthy' ? '#4ADE80' :
                     overallHealth === 'busy' ? '#FBBF24' :
                     '#F87171',
            }}
          >
            {overallHealth}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="sp-flex sp-items-center sp-gap-4">
        <div className="sp-flex sp-gap-2">
          <button
            onClick={selectAll}
            className="sp-px-4 sp-py-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-text-secondary hover:sp-text-white hover:sp-bg-white/[0.04] sp-transition-colors sp-text-sm"
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            className="sp-px-4 sp-py-2 sp-rounded-xl sp-border sp-border-white/[0.06] sp-bg-white/[0.02] sp-text-text-secondary hover:sp-text-white hover:sp-bg-white/[0.04] sp-transition-colors sp-text-sm"
          >
            Deselect All
          </button>
        </div>
        <div className="sp-flex-1" />
        <button
          onClick={runSelected}
          disabled={selectedEngines.size === 0 || isRunning}
          className="sp-px-6 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-font-medium sp-transition-all hover:sp-brightness-110 disabled:sp-opacity-50 disabled:sp-cursor-not-allowed sp-flex sp-items-center sp-gap-2"
        >
          {isRunning && (
            <svg className="sp-w-4 sp-h-4 sp-animate-spin" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="60" strokeDashoffset="20"/>
            </svg>
          )}
          Run Selected ({selectedEngines.size})
        </button>
      </div>

      {/* Engines Grid */}
      <div className="sp-grid sp-grid-cols-2 lg:sp-grid-cols-3 xl:sp-grid-cols-5 sp-gap-4">
        {engines.map((engine) => {
          const config = ENGINE_CONFIG[engine.id];
          const isSelected = selectedEngines.has(engine.id);
          const isOnline = engine.status === 'online' || engine.status === 'busy';

          return (
            <div
              key={engine.id}
              onClick={() => toggleEngine(engine.id)}
              className={`sp-relative sp-rounded-2xl sp-border sp-p-4 sp-cursor-pointer sp-transition-all ${
                isSelected ? 'sp-ring-2' : ''
              }`}
              style={{
                borderColor: isSelected ? config.color : 'rgba(255,255,255,0.06)',
                background: isSelected ? `${config.color}10` : 'rgba(255,255,255,0.02)',
              }}
            >
              {/* Selection indicator */}
              <div 
                className="sp-absolute sp-top-3 sp-right-3 sp-w-5 sp-h-5 sp-rounded-full sp-border sp-flex sp-items-center sp-justify-center sp-transition-colors"
                style={{
                  borderColor: isSelected ? config.color : 'rgba(255,255,255,0.2)',
                  background: isSelected ? config.color : 'transparent',
                }}
              >
                {isSelected && (
                  <svg className="sp-w-3 sp-h-3 sp-text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12l5 5L20 7"/>
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div 
                className="sp-w-10 sp-h-10 sp-rounded-xl sp-flex sp-items-center sp-justify-center sp-text-xl sp-mb-3"
                style={{
                  background: `${config.color}15`,
                  border: `1px solid ${config.color}30`,
                }}
              >
                {config.icon}
              </div>

              {/* Info */}
              <h3 className="sp-text-sm sp-font-semibold sp-text-white sp-mb-1">{config.name}</h3>
              <div className="sp-flex sp-items-center sp-gap-2">
                <span 
                  className="sp-w-2 sp-h-2 sp-rounded-full"
                  style={{ 
                    background: isOnline ? config.color : '#6B7280',
                    boxShadow: isOnline ? `0 0 6px ${config.color}` : undefined,
                  }}
                />
                <span className="sp-text-xs sp-text-text-tertiary sp-capitalize">{engine.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Control */}
      <div 
        className="sp-rounded-2xl sp-border sp-p-6"
        style={{
          borderColor: state?.running ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div className="sp-flex sp-items-center sp-justify-between sp-mb-4">
          <div>
            <h3 className="sp-text-lg sp-font-semibold sp-text-white">Audit Control</h3>
            <p className="sp-text-sm sp-text-text-secondary">Gerenciar auditoria em andamento</p>
          </div>
          {state?.running ? (
            <button
              onClick={cancelAudit}
              className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-red-500/20 sp-text-red-400 sp-font-medium hover:sp-bg-red-500/30 sp-transition-colors"
            >
              Cancel Audit
            </button>
          ) : (
            <button
              onClick={() => startAudit({ 
                baseUrl: 'https://example.com', 
                mode: 'desktop', 
                scope: 'full' 
              })}
              className="sp-px-4 sp-py-2 sp-rounded-xl sp-bg-primary sp-text-white sp-font-medium hover:sp-brightness-110 sp-transition-all"
            >
              Start Audit
            </button>
          )}
        </div>

        {state?.running && (
          <div>
            <div className="sp-flex sp-justify-between sp-text-sm sp-mb-2">
              <span className="sp-text-text-secondary">{state.progress.detail}</span>
              <span className="sp-text-white sp-font-medium">{state.progress.percentage}%</span>
            </div>
            <div className="sp-h-2 sp-rounded-full sp-bg-white/[0.06] sp-overflow-hidden">
              <div 
                className="sp-h-full sp-rounded-full sp-transition-all sp-duration-500"
                style={{
                  width: `${state.progress.percentage}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                  boxShadow: '0 0 10px rgba(59,130,246,0.5)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  label: string;
  value: number;
  total: number;
  color: string;
}> = ({ label, value, total, color }) => (
  <div 
    className="sp-rounded-2xl sp-border sp-p-4"
    style={{
      borderColor: `${color}30`,
      background: 'rgba(255,255,255,0.02)',
    }}
  >
    <p className="sp-text-xs sp-uppercase sp-tracking-wider sp-text-text-tertiary">{label}</p>
    <div className="sp-flex sp-items-baseline sp-gap-2">
      <p className="sp-text-2xl sp-font-bold" style={{ color }}>{value}</p>
      <p className="sp-text-sm sp-text-text-tertiary">/ {total}</p>
    </div>
    <div className="sp-mt-2 sp-h-1.5 sp-rounded-full sp-bg-white/[0.06] sp-overflow-hidden">
      <div 
        className="sp-h-full sp-rounded-full"
        style={{
          width: `${(value / total) * 100}%`,
          background: color,
        }}
      />
    </div>
  </div>
);

