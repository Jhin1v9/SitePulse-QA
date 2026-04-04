/**
 * LearningWindow - Motor de Aprendizado
 * Continuous learning & adaptation interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { TrendingUp, BookOpen, Award, RefreshCw, BarChart3, Target } from 'lucide-react';

export function LearningWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const metrics = [
    { label: 'Model Accuracy', value: '92.8%', change: '+1.2%', trend: 'up' },
    { label: 'Training Epochs', value: '1,247', change: '+23', trend: 'up' },
    { label: 'Dataset Size', value: '45.2K', change: '+1.8K', trend: 'up' },
    { label: 'Loss Rate', value: '0.042', change: '-0.008', trend: 'down' },
  ];

  const recentLearnings = [
    { id: 1, pattern: 'JWT Token Bypass', confidence: 89, date: '2 hours ago' },
    { id: 2, pattern: 'Prototype Pollution', confidence: 94, date: '5 hours ago' },
    { id: 3, pattern: 'NoSQL Injection', confidence: 87, date: '1 day ago' },
    { id: 4, pattern: 'SSRF Vector', confidence: 91, date: '2 days ago' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            style={{
              padding: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
              {metric.label}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{metric.value}</span>
              <span
                style={{
                  fontSize: '11px',
                  color: metric.trend === 'up' ? '#10B981' : '#F59E0B',
                }}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', flex: 1 }}>
        {/* Training Progress */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Training Progress</h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#10B981',
              }}
            >
              <RefreshCw size={14} style={{ animation: 'spin 2s linear infinite' }} />
              Training...
            </div>
          </div>

          {/* Progress Chart Simulation */}
          <div
            style={{
              height: '200px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '10px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,120 Q50,100 100,90 T200,70 T300,50 T400,30 L400,150 L0,150 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,120 Q50,100 100,90 T200,70 T300,50 T400,30"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              Accuracy over time
            </div>
          </div>

          {/* Training Stats */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Current Epoch</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>247 / 500</div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>ETA</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>12m 34s</div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Batch Size</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>64</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Recent Learnings */}
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
              Recently Learned
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLearnings.map((learning) => (
                <div
                  key={learning.id}
                  style={{
                    padding: '12px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <BookOpen size={14} style={{ color: '#10B981' }} />
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>{learning.pattern}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{learning.date}</span>
                    <span style={{ color: '#10B981' }}>{learning.confidence}% confidence</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Award size={20} style={{ color: '#10B981' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Learning Milestone</span>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              Model has improved accuracy by 15% in the last 30 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearningWindow;
