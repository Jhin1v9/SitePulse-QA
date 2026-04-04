/**
 * DecisionWindow - Motor de Decisão
 * Multi-criteria decision making interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { GitBranch, CheckCircle, Clock, AlertTriangle, Scale, TrendingUp } from 'lucide-react';

export function DecisionWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const decisions = [
    {
      id: 1,
      title: 'Block IP 192.168.1.100',
      priority: 'high',
      impact: 'medium',
      status: 'pending',
      engines: ['intent', 'context'],
      time: '2 min ago',
    },
    {
      id: 2,
      title: 'Escalate to Security Team',
      priority: 'critical',
      impact: 'high',
      status: 'approved',
      engines: ['security', 'evidence'],
      time: '5 min ago',
    },
    {
      id: 3,
      title: 'Enable WAF Rule #442',
      priority: 'medium',
      impact: 'low',
      status: 'executed',
      engines: ['action'],
      time: '12 min ago',
    },
    {
      id: 4,
      title: 'Quarantine File hash:a3f2...',
      priority: 'high',
      impact: 'medium',
      status: 'pending',
      engines: ['security', 'evidence'],
      time: '18 min ago',
    },
  ];

  const matrix = [
    { action: 'Block IP', urgency: 9, impact: 6, risk: 'medium' },
    { action: 'WAF Rule', urgency: 6, impact: 4, risk: 'low' },
    { action: 'Escalate', urgency: 10, impact: 9, risk: 'critical' },
    { action: 'Quarantine', urgency: 8, impact: 7, risk: 'high' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Priority Matrix */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
          Priority Matrix
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {matrix.map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                background:
                  item.risk === 'critical'
                    ? 'rgba(239, 68, 68, 0.15)'
                    : item.risk === 'high'
                    ? 'rgba(245, 158, 11, 0.15)'
                    : item.risk === 'medium'
                    ? 'rgba(99, 102, 241, 0.15)'
                    : 'rgba(16, 185, 129, 0.15)',
                borderRadius: '10px',
                border: `1px solid ${
                  item.risk === 'critical'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : item.risk === 'high'
                    ? 'rgba(245, 158, 11, 0.3)'
                    : item.risk === 'medium'
                    ? 'rgba(99, 102, 241, 0.3)'
                    : 'rgba(16, 185, 129, 0.3)'
                }`,
              }}
            >
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500, marginBottom: '8px' }}>
                {item.action}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>U: {item.urgency}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>I: {item.impact}</span>
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  background:
                    item.risk === 'critical'
                      ? 'rgba(239, 68, 68, 0.3)'
                      : item.risk === 'high'
                      ? 'rgba(245, 158, 11, 0.3)'
                      : item.risk === 'medium'
                      ? 'rgba(99, 102, 241, 0.3)'
                      : 'rgba(16, 185, 129, 0.3)',
                  color:
                    item.risk === 'critical'
                      ? '#EF4444'
                      : item.risk === 'high'
                      ? '#F59E0B'
                      : item.risk === 'medium'
                      ? '#6366F1'
                      : '#10B981',
                }}
              >
                {item.risk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Queue */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.05)',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Decision Queue</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                padding: '4px 10px',
                background: 'rgba(245, 158, 11, 0.2)',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#F59E0B',
              }}
            >
              4 pending
            </span>
          </div>
        </div>

        <div>
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scale size={18} style={{ color: '#6366F1' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, marginBottom: '4px' }}>
                  {decision.title}
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Engines: {decision.engines.join(', ')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{decision.time}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                    background:
                      decision.priority === 'critical'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : decision.priority === 'high'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)',
                    color:
                      decision.priority === 'critical'
                        ? '#EF4444'
                        : decision.priority === 'high'
                        ? '#F59E0B'
                        : '#6366F1',
                  }}
                >
                  {decision.priority}
                </span>

                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    textTransform: 'capitalize',
                    background:
                      decision.status === 'executed'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : decision.status === 'approved'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    color:
                      decision.status === 'executed'
                        ? '#10B981'
                        : decision.status === 'approved'
                        ? '#6366F1'
                        : '#F59E0B',
                  }}
                >
                  {decision.status}
                </span>
              </div>

              {decision.status === 'pending' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '6px',
                      color: '#10B981',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Approve
                  </button>
                  <button
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '6px',
                      color: '#EF4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DecisionWindow;
