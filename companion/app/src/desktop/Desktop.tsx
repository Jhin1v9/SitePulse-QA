/**
 * Desktop - Main Desktop Area
 * Shows wallpaper, engine icons, and handles desktop interactions
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDesktopStore, useWindowStore, useEngineStore, useAuditStore } from '@/stores';
import type { EngineId } from '@/types/os';
import {
  Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield, Folder, Search
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield, Folder, Search
};

// Desktop icons (shortcuts)
const desktopIcons = [
  { id: 'projects', name: 'Projects', icon: 'Folder', color: '#F59E0B', x: 40, y: 40 },
  { id: 'new-audit', name: 'New Audit', icon: 'Search', color: '#10B981', x: 160, y: 40 },
];

export function Desktop() {
  const { selectedIconIds, selectIcon, deselectAll } = useDesktopStore();
  const { openEngineWindow, openAuditWindow, openFinderWindow } = useWindowStore();
  const { engines } = useEngineStore();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  // Handle desktop click (deselect all)
  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if (e.target === desktopRef.current) {
      deselectAll();
      setContextMenu(null);
    }
  }, [deselectAll]);

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle icon double click
  const handleIconDoubleClick = useCallback((iconId: string) => {
    switch (iconId) {
      case 'projects':
        openFinderWindow();
        break;
      case 'new-audit':
        openAuditWindow();
        break;
      default:
        // Check if it's an engine
        if (iconId in engines) {
          const engine = engines[iconId as EngineId];
          openEngineWindow(iconId as EngineId, engine.name);
        }
        break;
    }
  }, [engines, openEngineWindow, openAuditWindow, openFinderWindow]);

  // Handle icon click (selection)
  const handleIconClick = useCallback((e: React.MouseEvent, iconId: string) => {
    e.stopPropagation();
    const multi = e.shiftKey || e.ctrlKey || e.metaKey;
    selectIcon(iconId, multi);
    setContextMenu(null);
  }, [selectIcon]);

  const isSelected = (iconId: string) => selectedIconIds.includes(iconId);

  return (
    <div
      ref={desktopRef}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
      style={{
        position: 'fixed',
        top: '28px',
        left: 0,
        right: 0,
        bottom: '70px',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Desktop Icons */}
      {desktopIcons.map((icon) => {
        const IconComponent = iconMap[icon.icon];
        const selected = isSelected(icon.id);

        return (
          <div
            key={icon.id}
            onClick={(e) => handleIconClick(e, icon.id)}
            onDoubleClick={() => handleIconDoubleClick(icon.id)}
            style={{
              position: 'absolute',
              left: icon.x,
              top: icon.y,
              width: '80px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              background: selected ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
              border: selected ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid transparent',
              transition: 'all 0.15s ease',
              userSelect: 'none',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${icon.color}30, ${icon.color}10)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                border: `1px solid ${icon.color}40`,
              }}
            >
              {IconComponent && <IconComponent size={28} style={{ color: icon.color }} />}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: '11px',
                color: '#fff',
                textAlign: 'center',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                fontWeight: selected ? 500 : 400,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                padding: '2px 6px',
                borderRadius: '4px',
                background: selected ? 'transparent' : 'rgba(0,0,0,0.4)',
              }}
            >
              {icon.name}
            </span>
          </div>
        );
      })}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            minWidth: '160px',
            background: 'rgba(25, 25, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {[
            { label: 'New Audit', action: () => { openAuditWindow(); setContextMenu(null); } },
            { label: 'New Folder', action: () => { setContextMenu(null); } },
            { separator: true },
            { label: 'Open Finder', action: () => { openFinderWindow(); setContextMenu(null); } },
            { separator: true },
            { label: 'Refresh', action: () => { setContextMenu(null); } },
          ].map((item, idx) => (
            item.separator ? (
              <div
                key={idx}
                style={{
                  height: '1px',
                  background: 'rgba(255,255,255,0.1)',
                  margin: '4px 0',
                }}
              />
            ) : (
              <button
                key={idx}
                onClick={item.action}
                style={{
                  width: '100%',
                  padding: '8px 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.label}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default Desktop;
