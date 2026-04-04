/**
 * Dock - macOS-style dock
 * Shows pinned apps, running apps, with bounce animation
 */

import { useState } from 'react';
import { useWindowStore, useEngineStore, useAuditStore } from '@/stores';
import {
  Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield, Settings, Trash2,
  Folder, LayoutDashboard, Search, Plus
} from 'lucide-react';
import type { EngineId } from '@/types/os';

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield,
};

const engineColors: Record<EngineId, string> = {
  intent: '#EC4899',
  context: '#8B5CF6',
  evidence: '#06B6D4',
  memory: '#F59E0B',
  learning: '#10B981',
  decision: '#6366F1',
  action: '#EF4444',
  predictive: '#3B82F6',
  autonomous: '#14B8A6',
  security: '#DC2626',
};

// Fixed dock items
const fixedItems = [
  { id: 'finder', name: 'Finder', icon: Folder, color: '#F59E0B', isPinned: true },
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: '#6366F1', isPinned: true },
];

// Right side items
const rightItems = [
  { id: 'settings', name: 'Settings', icon: Settings, color: '#9CA3AF', isPinned: true },
  { id: 'trash', name: 'Trash', icon: Trash2, color: '#6B7280', isPinned: true },
];

export function Dock() {
  const { 
    openEngineWindow, 
    openAuditWindow, 
    openFinderWindow,
    restoreOrOpen,
    getWindowsByEngine,
    isWindowOpen,
    windows 
  } = useWindowStore();
  const { engines } = useEngineStore();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [bouncingItem, setBouncingItem] = useState<string | null>(null);

  const engineList = Object.values(engines);

  const handleEngineClick = (engineId: EngineId) => {
    const engineWindows = getWindowsByEngine(engineId);
    
    if (engineWindows.length > 0) {
      // Restore first minimized or focus first one
      const minimizedWindow = engineWindows.find(w => w.isMinimized);
      if (minimizedWindow) {
        useWindowStore.getState().restoreWindow(minimizedWindow.id);
      } else {
        useWindowStore.getState().focusWindow(engineWindows[0].id);
        useWindowStore.getState().bringToFront(engineWindows[0].id);
      }
    } else {
      // Trigger bounce animation
      setBouncingItem(engineId);
      setTimeout(() => setBouncingItem(null), 500);
      
      const engine = engines[engineId];
      if (engine) {
        openEngineWindow(engineId, engine.name);
      }
    }
  };

  const handleFixedItemClick = (id: string) => {
    setBouncingItem(id);
    setTimeout(() => setBouncingItem(null), 500);

    switch (id) {
      case 'finder':
        restoreOrOpen('finder', 'Finder');
        break;
      case 'dashboard':
        restoreOrOpen('dashboard', 'Dashboard');
        break;
      case 'audit':
        openAuditWindow();
        break;
      default:
        break;
    }
  };

  const isEngineRunning = (engineId: EngineId) => {
    return getWindowsByEngine(engineId).length > 0;
  };

  const renderDockItem = (
    id: string,
    name: string,
    Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>,
    color: string,
    isRunning: boolean,
    onClick: () => void
  ) => {
    const isHovered = hoveredItem === id;
    const isBouncing = bouncingItem === id;

    return (
      <div
        key={id}
        onClick={onClick}
        onMouseEnter={() => setHoveredItem(id)}
        onMouseLeave={() => setHoveredItem(null)}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
        }}
      >
        {/* Tooltip */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              marginBottom: '12px',
              padding: '6px 12px',
              background: 'rgba(0,0,0,0.9)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#fff',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'fadeIn 0.15s ease',
              zIndex: 1000,
            }}
          >
            {name}
          </div>
        )}

        {/* Icon */}
        <div
          style={{
            width: isHovered ? '56px' : '48px',
            height: isHovered ? '56px' : '48px',
            borderRadius: '14px',
            background: `linear-gradient(135deg, ${color}40, ${color}20)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isRunning
              ? `0 0 20px ${color}50, 0 4px 12px rgba(0,0,0,0.3)`
              : '0 4px 12px rgba(0,0,0,0.3)',
            border: `1px solid ${color}50`,
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isBouncing ? 'translateY(-12px)' : isHovered ? 'translateY(-8px)' : 'translateY(0)',
            animation: isBouncing ? 'dockBounce 0.5s ease' : 'none',
          }}
        >
          <Icon size={isHovered ? 26 : 22} style={{ color: '#fff' }} />
        </div>

        {/* Running indicator */}
        {isRunning && (
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${color}`,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        )}

        {!isRunning && <div style={{ width: '4px', height: '4px' }} />}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        padding: '12px 16px',
        background: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)',
      }}
    >
      {/* Fixed items */}
      {fixedItems.map(item => 
        renderDockItem(
          item.id,
          item.name,
          item.icon,
          item.color,
          isWindowOpen(item.id as 'finder' | 'dashboard'),
          () => handleFixedItemClick(item.id)
        )
      )}

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 4px',
        }}
      />

      {/* Audit button */}
      {renderDockItem(
        'audit',
        'New Audit',
        Search,
        '#10B981',
        isWindowOpen('audit'),
        () => handleFixedItemClick('audit')
      )}

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 4px',
        }}
      />

      {/* Engine items */}
      {engineList.map((engine) => {
        const IconComponent = iconMap[engine.icon] || Target;
        return renderDockItem(
          engine.id,
          engine.name,
          IconComponent,
          engine.color,
          isEngineRunning(engine.id),
          () => handleEngineClick(engine.id)
        );
      })}

      {/* Separator */}
      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 4px',
        }}
      />

      {/* Right items */}
      {rightItems.map(item => 
        renderDockItem(
          item.id,
          item.name,
          item.icon,
          item.color,
          false,
          () => handleFixedItemClick(item.id)
        )
      )}
    </div>
  );
}

export default Dock;
