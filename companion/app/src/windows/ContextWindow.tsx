/**
 * ContextWindow - Motor de Contexto
 * Business context & asset mapping interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Globe, MapPin, Shield, Layers, AlertCircle } from 'lucide-react';

export function ContextWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();
  const engine = engines.context;

  const assets = [
    { id: 1, name: 'API Gateway', type: 'infrastructure', criticality: 'high', status: 'monitored' },
    { id: 2, name: 'User Database', type: 'data', criticality: 'critical', status: 'protected' },
    { id: 3, name: 'Payment Service', type: 'application', criticality: 'critical', status: 'alert' },
    { id: 4, name: 'Auth Service', type: 'application', criticality: 'high', status: 'monitored' },
    { id: 5, name: 'File Storage', type: 'data', criticality: 'medium', status: 'monitored' },
  ];

  const complianceFrameworks = [
    { name: 'GDPR', status: 'compliant', progress: 94 },
    { name: 'PCI DSS', status: 'compliant', progress: 87 },
    { name: 'SOC 2', status: 'in-progress', progress: 72 },
    { name: 'ISO 27001', status: 'compliant', progress: 91 },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), transparent)',
          borderRadius: '12px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Globe size={24} style={{ color: '#8B5CF6' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Business Context Mapping</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          Understanding your infrastructure to prioritize security efforts based on business impact.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', flex: 1 }}>
        {/* Asset Map */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Asset Topology
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {assets.map((asset, idx) => (
              <div
                key={asset.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '10px',
                  borderLeft: `3px solid ${
                    asset.criticality === 'critical' ? '#EF4444' : 
                    asset.criticality === 'high' ? '#F59E0B' : '#10B981'
                  }`,
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Layers size={18} style={{ color: '#8B5CF6' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500 }}>{asset.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>
                    {asset.type} • {asset.criticality} priority
                  </div>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textTransform: 'capitalize',
                    background: asset.status === 'alert' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: asset.status === 'alert' ? '#EF4444' : '#10B981',
                  }}
                >
                  {asset.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Compliance */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Compliance Status
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {complianceFrameworks.map((framework) => (
                <div key={framework.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{framework.name}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: framework.status === 'compliant' ? '#10B981' : '#F59E0B',
                      }}
                    >
                      {framework.status}
                    </span>
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
                        width: `${framework.progress}%`,
                        background: framework.status === 'compliant' ? '#10B981' : '#F59E0B',
                        borderRadius: '2px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Score */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              Overall Risk Score
            </h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#8B5CF6' }}>72</span>
              <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>/ 100</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '8px' }}>
              Medium risk level. 3 critical assets need attention.
            </p>
          </div>

          {/* Quick Actions */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                style={{
                  padding: '10px',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <MapPin size={14} />
                Map New Asset
              </button>
              <button
                style={{
                  padding: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Shield size={14} />
                Review Policies
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContextWindow;
