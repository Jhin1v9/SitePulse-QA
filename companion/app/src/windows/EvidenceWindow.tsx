/**
 * EvidenceWindow - Motor de Evidência
 * Evidence collection & validation interface
 */

import React, { useState } from 'react';
import { useEngineStore } from '@/stores';
import { FileSearch, CheckCircle, XCircle, Clock, Copy, Download, Eye } from 'lucide-react';

export function EvidenceWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();
  const [selectedEvidence, setSelectedEvidence] = useState<number | null>(1);

  const evidences = [
    {
      id: 1,
      title: 'SQL Injection Payload',
      type: 'payload',
      status: 'validated',
      timestamp: '2024-01-15 14:32:18',
      severity: 'critical',
      content: `GET /api/users?id=1' OR '1'='1' -- HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0

Response: 200 OK
{
  "users": [...]
}`,
    },
    {
      id: 2,
      title: 'XSS Script Injection',
      type: 'code',
      status: 'pending',
      timestamp: '2024-01-15 14:28:42',
      severity: 'high',
      content: `<script>alert('XSS')</script>`,
    },
    {
      id: 3,
      title: 'Authentication Bypass',
      type: 'request',
      status: 'validated',
      timestamp: '2024-01-15 14:15:33',
      severity: 'critical',
      content: `POST /login HTTP/1.1
Content-Type: application/json

{
  "username": "admin",
  "password": "' OR '1'='1"
}`,
    },
    {
      id: 4,
      title: 'Directory Traversal',
      type: 'payload',
      status: 'rejected',
      timestamp: '2024-01-15 13:58:21',
      severity: 'medium',
      content: `GET /download?file=../../../etc/passwd HTTP/1.1`,
    },
  ];

  const stats = [
    { label: 'Validated', value: 156, color: '#10B981', icon: CheckCircle },
    { label: 'Pending', value: 23, color: '#F59E0B', icon: Clock },
    { label: 'Rejected', value: 8, color: '#EF4444', icon: XCircle },
  ];

  const selectedItem = evidences.find(e => e.id === selectedEvidence);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Header */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: '16px',
              background: `${stat.color}15`,
              borderRadius: '10px',
              border: `1px solid ${stat.color}30`,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <stat.icon size={20} style={{ color: stat.color }} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px', flex: 1, minHeight: 0 }}>
        {/* Evidence List */}
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
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            Evidence Chain
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {evidences.map((evidence) => (
              <div
                key={evidence.id}
                onClick={() => setSelectedEvidence(evidence.id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  background: selectedEvidence === evidence.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                  borderLeft: selectedEvidence === evidence.id ? '3px solid #06B6D4' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <FileSearch size={14} style={{ color: '#06B6D4' }} />
                  <span style={{ fontSize: '13px', color: '#fff', flex: 1 }}>{evidence.title}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background:
                        evidence.status === 'validated'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : evidence.status === 'rejected'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(245, 158, 11, 0.2)',
                      color:
                        evidence.status === 'validated'
                          ? '#10B981'
                          : evidence.status === 'rejected'
                          ? '#EF4444'
                          : '#F59E0B',
                    }}
                  >
                    {evidence.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{evidence.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Detail */}
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
          {selectedItem ? (
            <>
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                    {selectedItem.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    <span>{selectedItem.type}</span>
                    <span>•</span>
                    <span>{selectedItem.timestamp}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Copy size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                  <button
                    style={{
                      padding: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                <pre
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: '#06B6D4',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  }}
                >
                  {selectedItem.content}
                </pre>
              </div>
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <button
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#10B981',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle size={14} />
                  Validate
                </button>
                <button
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#EF4444',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <XCircle size={14} />
                  Reject
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              Select an evidence to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EvidenceWindow;
