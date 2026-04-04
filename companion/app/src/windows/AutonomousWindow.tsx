/**
 * AutonomousWindow - Motor Autônomo
 * Self-healing & autonomous operation interface
 */

import React, { useState } from 'react';
import { useEngineStore } from '@/stores';
import { Bot, Power, Activity, Shield, CheckCircle, Clock, Settings } from 'lucide-react';

export function AutonomousWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();
  const [isAutonomous, setIsAutonomous] = useState(true);

  const actions = [
    { id: 1, action: 'Blocked suspicious IP 203.0.113.45', time: '2 min ago', type: 'security' },
    { id: 2, action: 'Auto-patched dependency vulnerability', time: '15 min ago', type: 'patch' },
    { id: 3, action: 'Optimized database query performance', time: '32 min ago', type: 'performance' },
    { id: 4, action: 'Rotated expired SSL certificate', time: '1 hour ago', type: 'security' },
    { id: 5, action: 'Scaled resources based on load', time: '2 hours ago', type: 'scaling' },
  ];

  const stats = [
    { label: 'Uptime', value: '99.97%', icon: Activity },
    { label: 'Actions Taken', value: '1,247', icon: CheckCircle },
    { label: 'Avg Response', value: '234ms', icon: Clock },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Toggle */}
      <div
        style={{
          padding: '20px',
          background: isAutonomous
            ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.2), transparent)'
            : 'linear-gradient(135deg, rgba(107, 114, 128, 0.2), transparent)',
          borderRadius: '12px',
          border: `1px solid ${isAutonomous ? 'rgba(20, 184, 166, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: isAutonomous ? 'rgba(20, 184, 166, 0.3)' : 'rgba(107, 114, 128, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Bot size={26} style={{ color: isAutonomous ? '#14B8A6' : '#9CA3AF' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
              Autonomous Mode
            </h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              {isAutonomous
                ? 'System is operating autonomously with self-healing enabled'
                : 'Autonomous mode is disabled. Manual intervention required.'}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setIsAutonomous(!isAutonomous)}
          style={{
            width: '64px',
            height: '34px',
            borderRadius: '17px',
            background: isAutonomous ? '#14B8A6' : 'rgba(255,255,255,0.2)',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '3px',
              left: isAutonomous ? '33px' : '3px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fff',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          />
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {stats.map((stat, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              background: 'rgba(20, 184, 166, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(20, 184, 166, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <stat.icon size={20} style={{ color: '#14B8A6' }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', flex: 1 }}>
        {/* Action Log */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            Autonomous Actions
            <span
              style={{
                padding: '4px 10px',
                background: 'rgba(20, 184, 166, 0.2)',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#14B8A6',
              }}
            >
              Live
            </span>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {actions.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background:
                      item.type === 'security'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : item.type === 'patch'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(20, 184, 166, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.type === 'security' ? (
                    <Shield size={14} style={{ color: '#EF4444' }} />
                  ) : item.type === 'patch' ? (
                    <Settings size={14} style={{ color: '#F59E0B' }} />
                  ) : (
                    <Activity size={14} style={{ color: '#14B8A6' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#fff' }}>{item.action}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Health Status */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.05))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(20, 184, 166, 0.2)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              System Health
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'CPU', value: 34, color: '#14B8A6' },
                { label: 'Memory', value: 52, color: '#14B8A6' },
                { label: 'Network', value: 18, color: '#14B8A6' },
              ].map((metric) => (
                <div key={metric.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{metric.label}</span>
                    <span style={{ fontSize: '11px', color: '#fff' }}>{metric.value}%</span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${metric.value}%`,
                        background: metric.color,
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Capabilities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                'Self-healing',
                'Auto-scaling',
                'Threat response',
                'Performance optimization',
                'Security patching',
              ].map((cap) => (
                <div
                  key={cap}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: 'rgba(20, 184, 166, 0.1)',
                    borderRadius: '6px',
                  }}
                >
                  <CheckCircle size={14} style={{ color: '#14B8A6' }} />
                  <span style={{ fontSize: '12px', color: '#fff' }}>{cap}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AutonomousWindow;
