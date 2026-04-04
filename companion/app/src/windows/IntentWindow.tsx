/**
 * IntentWindow - Motor de Intenção
 * Pattern recognition & intent analysis interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Target, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export function IntentWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();
  const engine = engines.intent;

  // Mock data for visualization
  const patterns = [
    { id: 1, name: 'SQL Injection Pattern', confidence: 94, severity: 'critical', status: 'detected' },
    { id: 2, name: 'XSS Attack Vector', confidence: 87, severity: 'high', status: 'analyzing' },
    { id: 3, name: 'CSRF Token Bypass', confidence: 72, severity: 'medium', status: 'pending' },
    { id: 4, name: 'Path Traversal', confidence: 91, severity: 'high', status: 'detected' },
  ];

  const stats = [
    { label: 'Patterns Recognized', value: '2,847', change: '+12%' },
    { label: 'Accuracy Rate', value: '94.7%', change: '+2.3%' },
    { label: 'Active Scans', value: '3', change: '' },
    { label: 'Threats Blocked', value: '156', change: '+8' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(236, 72, 153, 0.2)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              {stat.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{stat.value}</span>
              {stat.change && (
                <span style={{ fontSize: '11px', color: '#10B981' }}>{stat.change}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flex: 1 }}>
        {/* Pattern Detection Radar */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Intent Detection Radar
          </h3>
          <div
            style={{
              aspectRatio: '1',
              background: `radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)`,
              borderRadius: '50%',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Radar circles */}
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: `${i * 25}%`,
                  height: `${i * 25}%`,
                  borderRadius: '50%',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                }}
              />
            ))}
            {/* Center point */}
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#EC4899',
                boxShadow: '0 0 20px #EC4899',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            {/* Detection points */}
            {patterns.map((pattern, idx) => {
              const angle = (idx * 90 + 45) * (Math.PI / 180);
              const distance = 30 + pattern.confidence * 0.3;
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;

              return (
                <div
                  key={pattern.id}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: pattern.severity === 'critical' ? '#EF4444' : '#F59E0B',
                    boxShadow: `0 0 10px ${pattern.severity === 'critical' ? '#EF4444' : '#F59E0B'}`,
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${idx * 0.2}s`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Detected Patterns List */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Detected Patterns</h3>
          {patterns.map(pattern => (
            <div
              key={pattern.id}
              style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                borderLeft: `3px solid ${pattern.severity === 'critical' ? '#EF4444' : '#F59E0B'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: '#fff' }}>{pattern.name}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  {pattern.confidence}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                {pattern.status === 'detected' ? (
                  <CheckCircle size={12} style={{ color: '#10B981' }} />
                ) : (
                  <Activity size={12} style={{ color: '#F59E0B' }} />
                )}
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                  {pattern.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Metrics */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          background: 'rgba(236, 72, 153, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(236, 72, 153, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={16} style={{ color: '#EC4899' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Neural Network: <strong style={{ color: '#fff' }}>Active</strong>
          </span>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={16} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Learning Rate: <strong style={{ color: '#fff' }}>0.001</strong>
          </span>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Queue: <strong style={{ color: '#fff' }}>23 items</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default IntentWindow;
