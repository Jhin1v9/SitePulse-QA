/**
 * MemoryWindow - Motor de Memória
 * Pattern storage & historical analysis interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Database, History, TrendingUp, Brain, Search } from 'lucide-react';

export function MemoryWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const patterns = [
    { id: 1, name: 'SQL Injection Family', occurrences: 234, firstSeen: '2023-08-15', trend: 'increasing' },
    { id: 2, name: 'XSS Variants', occurrences: 189, firstSeen: '2023-09-02', trend: 'stable' },
    { id: 3, name: 'CSRF Patterns', occurrences: 67, firstSeen: '2023-10-10', trend: 'decreasing' },
    { id: 4, name: 'Path Traversal', occurrences: 145, firstSeen: '2023-08-28', trend: 'increasing' },
    { id: 5, name: 'Auth Bypass', occurrences: 98, firstSeen: '2023-11-05', trend: 'stable' },
  ];

  const timeline = [
    { date: '2024-01-15', event: 'New pattern discovered: GraphQL Injection', type: 'discovery' },
    { date: '2024-01-12', event: 'Pattern "SQLi Family" updated with 12 variants', type: 'update' },
    { date: '2024-01-08', event: 'Historical analysis completed: 2023 Q4', type: 'analysis' },
    { date: '2024-01-05', event: 'Pattern correlation: XSS → DOM-based', type: 'correlation' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div
          style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <Database size={20} style={{ color: '#F59E0B', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>12,847</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Stored Patterns</div>
        </div>
        <div
          style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <Brain size={20} style={{ color: '#F59E0B', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>89.5%</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Recognition Rate</div>
        </div>
        <div
          style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <History size={20} style={{ color: '#F59E0B', marginBottom: '8px' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>180d</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Data Retention</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', flex: 1 }}>
        {/* Pattern Database */}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Pattern Database</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
              }}
            >
              <Search size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
              <input
                type="text"
                placeholder="Search patterns..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '12px',
                  width: '150px',
                }}
              />
            </div>
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {patterns.map((pattern) => (
              <div
                key={pattern.id}
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
                    background: 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Brain size={16} style={{ color: '#F59E0B' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{pattern.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    First seen: {pattern.firstSeen}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{pattern.occurrences}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>occurrences</div>
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    textTransform: 'capitalize',
                    background:
                      pattern.trend === 'increasing'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : pattern.trend === 'decreasing'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)',
                    color:
                      pattern.trend === 'increasing'
                        ? '#10B981'
                        : pattern.trend === 'decreasing'
                        ? '#EF4444'
                        : '#F59E0B',
                  }}
                >
                  {pattern.trend}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Activity Timeline */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.05)',
              padding: '16px',
              flex: 1,
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Recent Activity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {timeline.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#F59E0B',
                      marginTop: '4px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
                      {item.date}
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff' }}>{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Graph */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '16px',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Knowledge Graph
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
              847 interconnected patterns forming security intelligence network
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['SQLi', 'XSS', 'CSRF', 'Auth', 'Crypto'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '4px 10px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#F59E0B',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemoryWindow;
