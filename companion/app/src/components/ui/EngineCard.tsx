/**
 * EngineCard - Supreme Engine Card
 * Glassmorphism card with living animations and rich information
 */

import type { Engine } from '@/types/supreme';
import { EngineOrb } from './EngineOrb';
import { Power, Activity, Cpu, ChevronRight } from 'lucide-react';

interface EngineCardProps {
  engine: Engine;
  onToggle?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export function EngineCard({ engine, onToggle, onClick, compact = false }: EngineCardProps) {
  const isActive = engine.isActive;

  if (compact) {
    return (
      <div
        className="relative p-4 rounded-2xl cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02]"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isActive ? engine.color + '40' : 'rgba(255,255,255,0.08)'}`,
        }}
        onClick={onClick}
      >
        {/* Glow effect */}
        {isActive && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${engine.color}30, transparent 70%)`,
            }}
          />
        )}

        <div className="relative flex items-center gap-4">
          <EngineOrb engine={engine} size="sm" showStatus={false} />

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{engine.name}</h3>
            <p className="text-white/40 text-xs truncate">{engine.codename}</p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: isActive ? engine.color + '20' : 'rgba(255,255,255,0.05)',
                  color: isActive ? engine.color : 'rgba(255,255,255,0.4)',
                }}
              >
                {isActive ? engine.status : 'dormant'}
              </span>
            </div>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="p-2 rounded-xl transition-all"
            style={{
              background: isActive ? engine.color + '20' : 'rgba(255,255,255,0.05)',
              color: isActive ? engine.color : 'rgba(255,255,255,0.4)',
            }}
          >
            <Power size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative p-6 rounded-3xl cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        backdropFilter: 'blur(24px) saturate(150%)',
        border: `1px solid ${isActive ? engine.color + '30' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isActive
          ? `0 0 60px ${engine.color}15, inset 0 1px 0 rgba(255,255,255,0.05)`
          : 'inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
      onClick={onClick}
    >
      {/* Animated gradient background */}
      {isActive && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `radial-gradient(circle at 50% -20%, ${engine.color}20, transparent 60%)`,
            animationDuration: '4s',
          }}
        />
      )}

      {/* Shimmer effect */}
      {isActive && (
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <EngineOrb engine={engine} size="md" showStatus={false} />
            <div>
              <h3 className="text-white font-bold text-lg">{engine.name}</h3>
              <p className="text-white/40 text-sm font-mono">{engine.codename}</p>
            </div>
          </div>

          <button
            onClick={e => {
              e.stopPropagation();
              onToggle?.();
            }}
            className="relative p-3 rounded-xl transition-all overflow-hidden"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${engine.color}30, ${engine.color}10)`
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${isActive ? engine.color + '50' : 'rgba(255,255,255,0.1)'}`,
              color: isActive ? engine.color : 'rgba(255,255,255,0.4)',
            }}
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-xl animate-ping"
                style={{
                  background: engine.color + '40',
                  animationDuration: '1.5s',
                }}
              />
            )}
            <Power size={20} className="relative z-10" />
          </button>
        </div>

        {/* Description */}
        <p className="text-white/60 text-sm mb-6 line-clamp-2">{engine.description}</p>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
              <Activity size={12} />
              <span>OPS/s</span>
            </div>
            <p className="text-white font-semibold text-sm">
              {engine.metrics.operationsPerSecond > 1000
                ? (engine.metrics.operationsPerSecond / 1000).toFixed(1) + 'K'
                : engine.metrics.operationsPerSecond}
            </p>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
              <Cpu size={12} />
              <span>Accuracy</span>
            </div>
            <p className="text-white font-semibold text-sm">
              {engine.metrics.accuracyRate.toFixed(1)}%
            </p>
          </div>

          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">
              <span>Power</span>
            </div>
            <p className="text-white font-semibold text-sm">{engine.power}%</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isActive ? engine.color : 'rgba(255,255,255,0.2)',
                boxShadow: isActive ? `0 0 8px ${engine.color}` : 'none',
              }}
            />
            <span className="text-white/40 text-xs">{isActive ? engine.status : 'offline'}</span>
          </div>

          <div className="flex items-center gap-1 text-white/40 text-xs">
            <span>Details</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EngineCard;
