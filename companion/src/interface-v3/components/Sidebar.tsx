/**
 * SIDEBAR - SitePulse Studio v3.0
 * Baseado na interface antiga (renderer.html)
 * CSS Puro - Sem Tailwind
 */

import React from 'react';
import { 
  Target, 
  List, 
  Search, 
  BarChart3, 
  Database, 
  HeartPulse, 
  FileText, 
  Settings 
} from 'lucide-react';

interface Workspace {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  isLive?: boolean;
  badge?: string | number;
}

const workspaces: Workspace[] = [
  {
    id: 'operator',
    label: 'Operator',
    sublabel: 'AI workspace · command execution',
    icon: <Target size={15} />,
    color: '#5B8CFF',
    isLive: true,
  },
  {
    id: 'findings',
    label: 'Findings',
    sublabel: 'Issue board · severity · triage',
    icon: <List size={15} />,
    color: '#f87171',
    badge: 0,
  },
  {
    id: 'seo',
    label: 'SEO',
    sublabel: 'Visibility · metadata · indexing',
    icon: <Search size={15} />,
    color: '#34d399',
    badge: 0,
  },
  {
    id: 'compare',
    label: 'Compare',
    sublabel: 'Delta · regressions · baseline',
    icon: <BarChart3 size={15} />,
    color: '#a78bfa',
    badge: 'Δ',
  },
];

const intelligenceWorkspaces: Workspace[] = [
  {
    id: 'memory',
    label: 'Memory',
    sublabel: 'Learned patterns · recall',
    icon: <Database size={15} />,
    color: '#38bdf8',
    badge: 0,
  },
  {
    id: 'healing',
    label: 'Healing',
    sublabel: 'Remediation · replay · correction',
    icon: <HeartPulse size={15} />,
    color: '#86efac',
    badge: 0,
  },
  {
    id: 'reports',
    label: 'Reports',
    sublabel: 'Evidence · exports · archive',
    icon: <FileText size={15} />,
    color: '#f9a8d4',
    badge: '—',
  },
];

interface SidebarProps {
  activeWorkspace: string;
  onWorkspaceChange: (id: string) => void;
  currentTarget?: string;
  qualityScore?: number;
  p0p1Count?: number;
  runBadge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeWorkspace,
  onWorkspaceChange,
  currentTarget = '—',
  qualityScore = 0,
  p0p1Count = 0,
  runBadge = '—',
}) => {
  return (
    <aside className="app-sidebar glass-shell">
      {/* Header */}
      <div className="border-b border-white-6 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-0" style={{ flexDirection: 'row-reverse' }}>
          <button className="ml-auto inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white-6 bg-white/[0.02] text-text-tertiary transition-all hover:border-white/[0.10] hover:bg-white/[0.04] hover:text-text-primary">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.05] to-transparent shadow-soft hover:shadow-glow-blue transition-all duration-500 cursor-pointer group">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4 text-white group-hover:text-accent-blue transition-colors">
                <path d="M4 12h6M14 6h6M14 18h6M4 6h4M4 18h2" strokeLinecap="round" />
                <circle cx="11" cy="12" r="2.5" />
                <circle cx="10" cy="6" r="2" />
                <circle cx="8" cy="18" r="2" />
              </svg>
            </div>
            <div style={{ minWidth: 0, maxWidth: 'calc(100% - 2.75rem)' }}>
              <p className="text-[15px] font-semibold tracking-tight text-text-primary">SitePulse</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary tracking-wide" style={{ 
                fontSize: 'clamp(0.56rem, 0.48rem + 0.2vw, 0.66rem)',
                lineHeight: 1.15,
                letterSpacing: '0.02em'
              }}>
                Intelligence Operating System
              </p>
            </div>
          </div>
        </div>

        {/* Context Card */}
        <div className="context-card mt-5">
          <div className="flex items-start gap-3">
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <p className="text-[10px] uppercase tracking-widest text-text-tertiary nowrap">Loaded Context</p>
              <p className="mt-1 font-mono text-[12px] text-text-primary tracking-tight group-hover:text-accent-blue transition-colors truncate">
                {currentTarget}
              </p>
              <div className="relative mt-2 flex items-center gap-1.5 rounded-full border border-green-400/30 bg-green-400/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-green-300 nowrap">
                <span className="status-dot relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                </span>
                <span>ENGINE ONLINE</span>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="context-metrics mt-5">
            <div className="group/metric">
              <p className="metric-label">Score</p>
              <div className="flex items-end gap-1 mt-0.5">
                <p className="metric-value text-amber-400">{qualityScore}</p>
                <svg className="h-3 w-3 text-amber-400/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="group/metric">
              <p className="metric-label">P0/P1</p>
              <p className="metric-value text-text-primary group-hover/metric:text-red-400 transition-colors">{p0p1Count}</p>
            </div>
            <div className="group/metric">
              <p className="metric-label">Run</p>
              <p className="metric-value text-text-primary font-mono nowrap">{runBadge}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspaces */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4">
        <p className="ws-section-label">Workspaces</p>
        <div className="space-y-1">
          {workspaces.map((ws) => (
            <WorkspaceButton
              key={ws.id}
              workspace={ws}
              isActive={activeWorkspace === ws.id}
              onClick={() => onWorkspaceChange(ws.id)}
            />
          ))}
        </div>

        <p className="ws-section-label ws-section-sep">Intelligence</p>
        <div className="space-y-1">
          {intelligenceWorkspaces.map((ws) => (
            <WorkspaceButton
              key={ws.id}
              workspace={ws}
              isActive={activeWorkspace === ws.id}
              onClick={() => onWorkspaceChange(ws.id)}
            />
          ))}
        </div>

        {/* Engines Section */}
        <p className="ws-section-label ws-section-sep">Engines</p>
        <div className="engine-flow-layout">
          <div className="min-w-0 flex-1 space-y-1 text-[12px]">
            <div className="engine-row group flex min-w-0 items-center justify-between rounded-[20px] px-3 py-2.5 transition-all hover:bg-white/[0.02] cursor-pointer">
              <span className="flex-1 min-w-0 whitespace-nowrap text-text-secondary group-hover:text-text-primary transition-colors">Data Intelligence</span>
              <span className="engine-status shrink-0 whitespace-nowrap flex items-center gap-1.5 text-green-300 text-[11px]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400 shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                </span>
                <span className="font-medium">live</span>
              </span>
            </div>
            <div className="engine-row group flex items-center justify-between rounded-[20px] px-3 py-2.5 transition-all hover:bg-white/[0.02] cursor-pointer">
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">Predictive</span>
              <span className="engine-status flex items-center gap-1.5 text-amber-200 text-[11px]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="font-medium">watching</span>
              </span>
            </div>
            <div className="engine-row group flex items-center justify-between rounded-[20px] px-3 py-2.5 transition-all hover:bg-white/[0.02] cursor-pointer">
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">Healing</span>
              <span className="engine-status flex items-center gap-1.5 text-text-tertiary text-[11px]">
                <span className="h-2 w-2 rounded-full bg-accent-purple shadow-[0_0_6px_rgba(168,85,247,0.5)] animate-pulse-slow" />
                <span className="font-medium">0 pending</span>
              </span>
            </div>
            <div className="engine-row group flex items-center justify-between rounded-[20px] px-3 py-2.5 transition-all hover:bg-white/[0.02] cursor-pointer">
              <span className="text-text-secondary group-hover:text-text-primary transition-colors">Memory</span>
              <span className="engine-status flex items-center gap-1.5 text-green-300 text-[11px]">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="font-medium">0 patterns</span>
              </span>
            </div>
          </div>
          <div className="engine-flow-track" aria-hidden="true">
            <div className="engine-flow-beam" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white-6 p-3">
        <div className="context-card" style={{ minHeight: 'auto', padding: '0.75rem' }}>
          <p className="text-[11px] uppercase tracking-widest text-text-tertiary nowrap">System Status</p>
          <p className="mt-1 text-[12px] text-text-primary leading-5">Operator online · memory attached</p>
          <div className="mt-3 flex items-center justify-between border-t border-white-6 pt-3">
            <button 
              onClick={() => onWorkspaceChange('settings')}
              className="ws-nav-btn" 
              style={{ 
                width: 'auto', 
                padding: '6px 10px', 
                borderRadius: 12,
                '--ws-color': '#94a3b8',
                '--ws-glow': 'rgba(148,163,184,0.06)',
                '--ws-border': 'rgba(148,163,184,0.18)',
                '--ws-bg': 'rgba(148,163,184,0.05)',
                '--ws-icon-border': 'rgba(148,163,184,0.18)',
                '--ws-icon-bg': 'rgba(148,163,184,0.08)'
              } as React.CSSProperties}
            >
              <span className="ws-icon" style={{ width: 26, height: 26, borderRadius: 8 }}>
                <Settings size={13} />
              </span>
              <span className="ws-label" style={{ fontSize: 12 }}>Settings</span>
            </button>
            <div className="h-8 w-8 rounded-full border border-white/[0.08] bg-gradient-to-br from-accent-blue/30 to-accent-purple/30 shadow-[0_0_10px_rgba(91,140,255,0.3)]" />
          </div>
        </div>
      </div>
    </aside>
  );
};

// Componente de Botão de Workspace
interface WorkspaceButtonProps {
  workspace: Workspace;
  isActive: boolean;
  onClick: () => void;
}

const WorkspaceButton: React.FC<WorkspaceButtonProps> = ({ workspace, isActive, onClick }) => {
  const buttonId = `sidebar${workspace.label}`;
  
  return (
    <button
      id={buttonId}
      onClick={onClick}
      className={`ws-nav-btn ${isActive ? 'ws-active' : ''}`}
      style={{
        '--ws-color': workspace.color,
        '--ws-glow': `${workspace.color}12`,
        '--ws-border': `${workspace.color}35`,
        '--ws-bg': `${workspace.color}10`,
        '--ws-shadow': `0 0 18px ${workspace.color}15`,
        '--ws-icon-border': `${workspace.color}35`,
        '--ws-icon-bg': `${workspace.color}15`,
        '--ws-icon-glow': `0 0 10px ${workspace.color}20`,
      } as React.CSSProperties}
    >
      <span className="ws-icon">{workspace.icon}</span>
      <div className="ws-text">
        <div className="ws-label">
          {workspace.label}
          {workspace.isLive && (
            <span className="ws-live-badge">
              <span className="ws-live-dot" />
              <span>Live</span>
            </span>
          )}
          {workspace.badge !== undefined && !workspace.isLive && (
            <span className="ws-count">{workspace.badge}</span>
          )}
        </div>
        <p className="ws-sublabel">{workspace.sublabel}</p>
      </div>
    </button>
  );
};
