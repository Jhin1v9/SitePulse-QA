import { engines, neuralMetrics, systemHealth, findings } from '@/data/engines';
import { Shield, Activity, Zap, Target, ChevronRight, Sparkles } from 'lucide-react';

export function Dashboard() {
  const activeEngines = engines.filter(e => e.isActive);
  const criticalFindings = findings.filter(f => f.severity === 'critical');

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#000', position: 'relative' }}>
      {/* Background with gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
        {/* Base gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, #000000 0%, #050508 50%, #0a0a0f 100%)',
          }}
        />

        {/* Purple orb */}
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.35) 0%, transparent 70%)',
            filter: 'blur(60px)',
            top: '-100px',
            left: '-100px',
            animationDuration: '20s',
          }}
        />

        {/* Cyan orb */}
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
            top: '30%',
            right: '-100px',
            animationDuration: '15s',
            animationDelay: '2s',
          }}
        />

        {/* Pink orb */}
        <div
          className="animate-float"
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 45, 149, 0.25) 0%, transparent 70%)',
            filter: 'blur(40px)',
            bottom: '10%',
            left: '30%',
            animationDuration: '18s',
            animationDelay: '4s',
          }}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.02,
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, padding: '32px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Sparkles style={{ width: '24px', height: '24px', color: '#818cf8' }} />
            <span
              style={{
                color: '#818cf8',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Neural Security Platform
            </span>
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
            SitePulse{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Supreme
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '18px', maxWidth: '640px' }}>
            Ten neural engines working in harmony to protect your digital infrastructure. Real-time
            threat detection with autonomous response capabilities.
          </p>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          <MetricCard
            label="Total Findings"
            value={neuralMetrics.totalFindings}
            trend="+12%"
            icon={<Shield size={20} />}
            color="#6366f1"
          />
          <MetricCard
            label="Threat Detection"
            value={`${neuralMetrics.threatDetectionRate}%`}
            trend="+2.3%"
            icon={<Target size={20} />}
            color="#10b981"
          />
          <MetricCard
            label="Active Engines"
            value={`${activeEngines.length}/10`}
            icon={<Activity size={20} />}
            color="#06b6d4"
          />
          <MetricCard
            label="Avg Accuracy"
            value={`${neuralMetrics.averageAccuracy}%`}
            trend="+0.8%"
            icon={<Zap size={20} />}
            color="#f59e0b"
          />
        </div>

        {/* Main Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          {/* Engines */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#fff' }}>Neural Engines</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>
                  {activeEngines.length} active
                </span>
                <div
                  className="animate-pulse"
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '16px',
              }}
            >
              {engines.map(engine => (
                <div
                  key={engine.id}
                  style={{
                    padding: '24px',
                    borderRadius: '24px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${engine.isActive ? engine.color + '30' : 'rgba(255,255,255,0.06)'}`,
                    backdropFilter: 'blur(24px)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = engine.isActive
                      ? engine.color + '50'
                      : 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = engine.isActive
                      ? engine.color + '30'
                      : 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Engine glow effect */}
                  {engine.isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: `radial-gradient(ellipse at 50% 0%, ${engine.color}15, transparent 60%)`,
                        borderRadius: '24px 24px 0 0',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${engine.color}40, ${engine.color}20)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: engine.isActive ? `0 0 30px ${engine.color}40` : 'none',
                        border: `1px solid ${engine.color}60`,
                      }}
                    >
                      <span style={{ color: engine.color, fontSize: '20px', fontWeight: 'bold' }}>
                        {engine.codename[0]}
                      </span>
                    </div>
                    <div>
                      <h3 style={{ color: '#fff', fontWeight: 'bold', fontSize: '18px' }}>{engine.name}</h3>
                      <p
                        style={{
                          color: 'rgba(255,255,255,0.4)',
                          fontSize: '14px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {engine.codename}
                      </p>
                    </div>
                    <div
                      style={{
                        marginLeft: 'auto',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: engine.isActive ? engine.color + '20' : 'rgba(255,255,255,0.05)',
                        color: engine.isActive ? engine.color : 'rgba(255,255,255,0.4)',
                        fontSize: '12px',
                      }}
                    >
                      {engine.isActive ? engine.status : 'offline'}
                    </div>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '16px' }}>
                    {engine.description}
                  </p>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        flex: 1,
                      }}
                    >
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>OPS/s</p>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                        {engine.metrics.operationsPerSecond > 1000
                          ? (engine.metrics.operationsPerSecond / 1000).toFixed(1) + 'K'
                          : engine.metrics.operationsPerSecond}
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        flex: 1,
                      }}
                    >
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Accuracy</p>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                        {engine.metrics.accuracyRate.toFixed(1)}%
                      </p>
                    </div>
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.03)',
                        flex: 1,
                      }}
                    >
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Power</p>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>{engine.power}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* System Status */}
            <div
              style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <h3 style={{ color: '#fff', fontWeight: 600, marginBottom: '16px' }}>System Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Status</span>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                    }}
                  >
                    {systemHealth.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Version</span>
                  <span style={{ color: '#fff', fontSize: '14px', fontFamily: 'monospace' }}>
                    {systemHealth.version}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Uptime</span>
                  <span style={{ color: '#fff', fontSize: '14px' }}>
                    {Math.floor(systemHealth.uptime / 86400)}d{' '}
                    {Math.floor((systemHealth.uptime % 86400) / 3600)}h
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Latency</span>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{systemHealth.networkLatency}ms</span>
                </div>
              </div>

              {/* Resource bars */}
              <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'CPU', value: systemHealth.cpuUsage, color: '#6366f1' },
                  { label: 'Memory', value: systemHealth.memoryUsage, color: '#06b6d4' },
                  { label: 'Disk', value: systemHealth.diskUsage, color: '#f59e0b' },
                ].map(resource => (
                  <div key={resource.label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>{resource.label}</span>
                      <span style={{ color: '#fff' }}>{resource.value}%</span>
                    </div>
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '9999px',
                        background: 'rgba(255,255,255,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '9999px',
                          background: resource.color,
                          width: `${resource.value}%`,
                          transition: 'width 1s ease-out',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Findings */}
            <div
              style={{
                padding: '24px',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                backdropFilter: 'blur(24px)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ color: '#fff', fontWeight: 600 }}>Recent Findings</h3>
                {criticalFindings.length > 0 && (
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                    }}
                  >
                    {criticalFindings.length} critical
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {findings.slice(0, 4).map(finding => (
                  <div
                    key={finding.id}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          marginTop: '6px',
                          background:
                            finding.severity === 'critical'
                              ? '#ef4444'
                              : finding.severity === 'high'
                                ? '#f59e0b'
                                : finding.severity === 'medium'
                                  ? '#3b82f6'
                                  : '#6b7280',
                          boxShadow: finding.severity === 'critical' ? '0 0 8px #ef4444' : 'none',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {finding.title}
                        </p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
                          {finding.id} • {finding.engine}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  trend,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
        e.currentTarget.style.transform = 'scale(1.02)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Subtle gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
          opacity: 0.3,
          pointerEvents: 'none',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div
          style={{
            padding: '8px',
            borderRadius: '12px',
            background: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </div>
        {trend && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '9999px',
              fontSize: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
            }}
          >
            {trend}
          </div>
        )}
      </div>
      <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{value}</p>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{label}</p>
    </div>
  );
}

export default Dashboard;
