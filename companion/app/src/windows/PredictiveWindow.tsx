/**
 * PredictiveWindow - Motor Preditivo
 * Threat forecasting & trend analysis interface
 */

import React from 'react';
import { useEngineStore } from '@/stores';
import { Eye, TrendingUp, AlertTriangle, Calendar, Target } from 'lucide-react';

export function PredictiveWindow({ windowId }: { windowId: string }) {
  const { engines } = useEngineStore();

  const predictions = [
    { id: 1, threat: 'XSS in /admin panel', probability: 87, timeframe: '3 days', severity: 'high' },
    { id: 2, threat: 'Credential stuffing attack', probability: 72, timeframe: '1 week', severity: 'critical' },
    { id: 3, threat: 'API rate limit bypass', probability: 45, timeframe: '2 weeks', severity: 'medium' },
    { id: 4, threat: 'Supply chain vulnerability', probability: 23, timeframe: '1 month', severity: 'low' },
  ];

  const trends = [
    { label: 'SQL Injection', current: 45, predicted: 62, change: '+37%' },
    { label: 'XSS Attacks', current: 38, predicted: 41, change: '+8%' },
    { label: 'Auth Bypass', current: 22, predicted: 18, change: '-18%' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div
        style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), transparent)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Eye size={24} style={{ color: '#3B82F6' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff' }}>Threat Forecasting</h2>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
          AI-powered predictions based on historical patterns and current threat landscape.
        </p>
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', flex: 1 }}>
        {/* Predictions List */}
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
            Predicted Threats
          </div>
          <div style={{ overflow: 'auto', flex: 1 }}>
            {predictions.map((pred) => (
              <div
                key={pred.id}
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
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: `conic-gradient(#3B82F6 ${pred.probability * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'rgba(15, 15, 25, 0.95)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3B82F6' }}>
                      {pred.probability}%
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', color: '#fff', fontWeight: 500, marginBottom: '4px' }}>
                    {pred.threat}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(255,255,255,0.5)' }}>
                      <Calendar size={12} />
                      {pred.timeframe}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    background:
                      pred.severity === 'critical'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : pred.severity === 'high'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(99, 102, 241, 0.2)',
                    color:
                      pred.severity === 'critical'
                        ? '#EF4444'
                        : pred.severity === 'high'
                        ? '#F59E0B'
                        : '#6366F1',
                  }}
                >
                  {pred.severity}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Trend Chart */}
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
              Attack Trend Predictions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {trends.map((trend, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{trend.label}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: trend.change.startsWith('+') ? '#EF4444' : '#10B981',
                      }}
                    >
                      {trend.change}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        width: `${(trend.current / 80) * 100}%`,
                        background: '#3B82F6',
                        borderRadius: '4px',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(trend.current / 80) * 100}%`,
                        top: 0,
                        height: '100%',
                        width: `${((trend.predicted - trend.current) / 80) * 100}%`,
                        background: 'rgba(59, 130, 246, 0.4)',
                        borderRadius: '0 4px 4px 0',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px' }}>
                    <span style={{ color: '#3B82F6' }}>Current: {trend.current}</span>
                    <span style={{ color: 'rgba(59, 130, 246, 0.7)' }}>Predicted: {trend.predicted}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Stats */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Target size={18} style={{ color: '#3B82F6' }} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Model Accuracy</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#3B82F6' }}>87.3%</span>
              <span style={{ fontSize: '12px', color: '#10B981' }}>+2.1%</span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
              Based on 1,247 predictions in the last 90 days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PredictiveWindow;
