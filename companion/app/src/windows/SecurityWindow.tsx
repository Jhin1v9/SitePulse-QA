/**
 * SecurityWindow - Motor de Segurança
 * Platform protection & integrity interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Shield, Lock, AlertTriangle, CheckCircle, XCircle, Activity, Eye } from 'lucide-react';

export function SecurityWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const threats = [
    { id: 1, type: 'Intrusion Attempt', source: '185.220.101.42', status: 'blocked', time: '2 min ago' },
    { id: 2, type: 'Suspicious API Call', source: 'internal', status: 'blocked', time: '5 min ago' },
    { id: 3, type: 'Failed Auth', source: 'user@example.com', status: 'monitoring', time: '12 min ago' },
    { id: 4, type: 'DDoS Pattern', source: 'multiple', status: 'mitigated', time: '1 hour ago' },
  ];

  const modules = [
    { name: 'Firewall', status: 'active', health: 100 },
    { name: 'IDS/IPS', status: 'active', health: 98 },
    { name: 'WAF', status: 'active', health: 100 },
    { name: 'Anti-Malware', status: 'active', health: 96 },
    { name: 'Encryption', status: 'active', health: 100 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Status Banner */}
      <div
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), transparent)',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(220, 38, 38, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          >
            <Shield size={28} style={{ color: '#DC2626' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>System Secure</h2>
              <span
                style={{
                  padding: '4px 10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#10B981',
                }}
              >
                PROTECTED
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              All security modules operational. 156 threats blocked today.
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#DC2626' }}>98.7%</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Protection Score</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', flex: 1 }}>
        {/* Threat Log */}
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
            Threat Log
            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  padding: '4px 10px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#10B981',
                }}
              >
                156 blocked today
              </span>
            </div>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {threats.map((threat) => (
              <div
                key={threat.id}
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
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background:
                      threat.status === 'blocked'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : threat.status === 'mitigated'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {threat.status === 'blocked' ? (
                    <XCircle size={16} style={{ color: '#10B981' }} />
                  ) : threat.status === 'mitigated' ? (
                    <CheckCircle size={16} style={{ color: '#6366F1' }} />
                  ) : (
                    <Eye size={16} style={{ color: '#F59E0B' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{threat.type}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Source: {threat.source}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background:
                        threat.status === 'blocked'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : threat.status === 'mitigated'
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        threat.status === 'blocked'
                          ? '#10B981'
                          : threat.status === 'mitigated'
                          ? '#6366F1'
                          : '#F59E0B',
                    }}
                  >
                    {threat.status}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    {threat.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Modules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
              Security Modules
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {modules.map((module) => (
                <div
                  key={module.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'rgba(220, 38, 38, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Lock size={16} style={{ color: '#DC2626' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{module.name}</div>
                    <div
                      style={{
                        height: '4px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '2px',
                        marginTop: '6px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${module.health}%`,
                          background: module.health > 95 ? '#10B981' : '#F59E0B',
                          borderRadius: '2px',
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      borderRadius: '12px',
                      fontSize: '10px',
                      color: '#10B981',
                      textTransform: 'uppercase',
                    }}
                  >
                    {module.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(220, 38, 38, 0.05))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(220, 38, 38, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Activity size={18} style={{ color: '#DC2626' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Security Metrics</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  padding: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>2.4K</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Requests/min</div>
              </div>
              <div
                style={{
                  padding: '12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>99.9%</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityWindow;
