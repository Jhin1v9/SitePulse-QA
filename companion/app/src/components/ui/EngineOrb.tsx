/**
 * EngineOrb - Living Engine Visualization
 * A breathing, pulsing orb that represents an engine's state
 */

import type { Engine } from '@/types/supreme';
import {
  Target,
  Globe,
  Microscope,
  Database,
  Brain,
  GitBranch,
  Zap,
  Eye,
  Bot,
  Shield,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Target,
  Globe,
  Microscope,
  Database,
  Brain,
  GitBranch,
  Zap,
  Eye,
  Bot,
  Shield,
};

interface EngineOrbProps {
  engine: Engine;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showStatus?: boolean;
}

const sizeConfig = {
  sm: { container: 80, orb: 60, icon: 24, ring: 70 },
  md: { container: 120, orb: 90, icon: 36, ring: 105 },
  lg: { container: 160, orb: 120, icon: 48, ring: 140 },
  xl: { container: 200, orb: 150, icon: 60, ring: 175 },
};

export function EngineOrb({ engine, size = 'md', onClick, showStatus = true }: EngineOrbProps) {
  const config = sizeConfig[size];
  const Icon = iconMap[engine.icon] || Target;

  const isActive = engine.isActive;
  const isProcessing = engine.status === 'processing' || engine.status === 'learning';

  return (
    <div
      className="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-98"
      style={{ width: config.container, height: config.container }}
      onClick={onClick}
    >
      {/* Outer glow ring */}
      {isActive && (
        <div
          className={`absolute rounded-full ${isProcessing ? 'animate-pulse' : ''}`}
          style={{
            width: config.ring,
            height: config.ring,
            border: `2px solid ${engine.color}`,
            opacity: isProcessing ? 0.6 : 0.3,
            animationDuration: isProcessing ? '1.5s' : '3s',
          }}
        />
      )}

      {/* Secondary ring */}
      {isActive && (
        <div
          className="absolute rounded-full animate-spin-slow"
          style={{
            width: config.ring * 0.85,
            height: config.ring * 0.85,
            border: `1px solid ${engine.color}`,
            opacity: 0.2,
          }}
        />
      )}

      {/* Main orb */}
      <div
        className={`relative rounded-full flex items-center justify-center overflow-hidden ${isProcessing ? 'animate-pulse' : ''}`}
        style={{
          width: config.orb,
          height: config.orb,
          background: isActive
            ? `radial-gradient(circle at 30% 30%, ${engine.color}40, ${engine.color}20, transparent)`
            : 'radial-gradient(circle, rgba(255,255,255,0.05), transparent)',
          boxShadow: isActive
            ? `0 0 ${config.orb * 0.4}px ${engine.color}60, inset 0 0 ${config.orb * 0.2}px ${engine.color}30`
            : 'none',
          border: `1px solid ${isActive ? engine.color + '60' : 'rgba(255,255,255,0.1)'}`,
          animationDuration: '2s',
        }}
      >
        {/* Inner gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: engine.gradient,
            opacity: isActive ? 0.3 : 0.1,
          }}
        />

        {/* Icon */}
        <div
          className={`${isProcessing ? 'animate-pulse' : ''}`}
          style={{
            color: isActive ? engine.color : 'rgba(255,255,255,0.3)',
            animationDuration: '1.5s',
          }}
        >
          <Icon size={config.icon} />
        </div>

        {/* Scanline effect */}
        {isProcessing && (
          <div
            className="absolute inset-0 animate-scanline"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
              height: '30%',
            }}
          />
        )}
      </div>

      {/* Status indicator */}
      {showStatus && isActive && (
        <div
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full animate-pulse"
          style={{
            background: engine.color,
            boxShadow: `0 0 10px ${engine.color}`,
            animationDuration: '2s',
          }}
        />
      )}
    </div>
  );
}

export default EngineOrb;
