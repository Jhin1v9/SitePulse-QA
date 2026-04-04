/**
 * ActionWindow - Motor de Ação
 * Automated remediation & response interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Zap, Play, RotateCcw, CheckCircle, XCircle, Clock, Terminal, AlertTriangle } from 'lucide-react';

export function ActionWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const actions = [
    {
      id: 1,
      name: 'Block Malicious IP',
      target: '192.168.1.100',
      status: 'completed',
      duration: '2.3s',
      output: 'IP blocked successfully. Firewall rule added.',
    },
    {
      id: 2,
      name: 'Rotate API Keys',
      target: 'production-api',
      status: 'running',
      duration: '12s',
      output: 'Generating new keys...',
    },
    {
      id: 3,
      name: 'Quarantine File',
      target: 'hash:a3f2b8c9...',
      status: 'queued',
      duration: '-',
      output: 'Waiting for execution...',
    },
    {
      id: 4,
      name: 'Enable Rate Limiting',
      target: '/api/login',
      status: 'completed',
      duration: '0.8s',
      output: 'Rate limit enabled: 5 req/min',
    },
  ];

  const consoleOutput = `
[14:32:18] ActionEngine: Initializing...
[14:32:19] ActionEngine: Connected to firewall
[14:32:19] ActionEngine: Executing: Block IP 192.168.1.100
[14:32:21] Firewall: Rule added - DROP from 192.168.1.100
[14:32:21] ActionEngine: Action completed in 2.3s
[14:32:25] ActionEngine: Executing: Rotate API Keys
[14:32:25] KeyManager: Generating new RSA key pair...
[14:32:30] KeyManager: Keys generated successfully
[14:32:30] ActionEngine: Updating services...
`;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), transparent)',
          borderRadius: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={22} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Action Engine</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Automated remediation & response</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              padding: '10px 18px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: '#10B981',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Play size={14} />
            Execute All
          </button>
          <button
            style={{
              padding: '10px 18px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={14} />
            Rollback
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Action Queue */}
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
            }}
          >
            Action Queue
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {actions.map((action) => (
              <div
                key={action.id}
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
                      action.status === 'completed'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : action.status === 'running'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {action.status === 'completed' ? (
                    <CheckCircle size={16} style={{ color: '#10B981' }} />
                  ) : action.status === 'running' ? (
                    <Zap size={16} style={{ color: '#F59E0B', animation: 'pulse 1s infinite' }} />
                  ) : (
                    <Clock size={16} style={{ color: 'rgba(255,255,255,0.4)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{action.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{action.target}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background:
                        action.status === 'completed'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : action.status === 'running'
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255,255,255,0.1)',
                      color:
                        action.status === 'completed'
                          ? '#10B981'
                          : action.status === 'running'
                          ? '#F59E0B'
                          : 'rgba(255,255,255,0.5)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {action.status}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                    {action.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console Output */}
        <div
          style={{
            background: 'rgba(0,0,0,0.4)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Terminal size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Console Output</span>
          </div>
          <pre
            style={{
              flex: 1,
              padding: '16px',
              margin: 0,
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#10B981',
              overflow: 'auto',
              lineHeight: 1.6,
            }}
          >
            {consoleOutput}
          </pre>
        </div>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '14px 16px',
          background: 'rgba(239, 68, 68, 0.05)',
          borderRadius: '10px',
          border: '1px solid rgba(239, 68, 68, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} style={{ color: '#10B981' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Completed: <strong style={{ color: '#fff' }}>156</strong>
          </span>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={16} style={{ color: '#F59E0B', animation: 'pulse 1s infinite' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Running: <strong style={{ color: '#fff' }}>3</strong>
          </span>
        </div>
        <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} style={{ color: '#EF4444' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            Failed: <strong style={{ color: '#fff' }}>2</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ActionWindow;
