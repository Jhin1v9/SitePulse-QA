/**
 * Spotlight - Command+K search palette
 * Raycast-style command palette for quick access
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSystemStore, useWindowStore, useEngineStore } from '@/stores';
import {
  Search, Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield, Command, Settings,
  Folder, FileText, Play, FolderOpen
} from 'lucide-react';
import type { EngineId } from '@/types/os';

const iconMap: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  Target, Globe, FileSearch, Database, TrendingUp,
  GitBranch, Zap, Eye, Bot, Shield,
  Command, Settings, Folder, FileText, Play, FolderOpen
};

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  shortcut?: string;
  action: () => void;
  category: 'motor' | 'file' | 'system' | 'action';
}

export function Spotlight() {
  const { spotlightOpen, closeSpotlight } = useSystemStore();
  const { openEngineWindow, openAuditWindow, openFinderWindow } = useWindowStore();
  const { engines } = useEngineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate commands from engines
  const commands: Command[] = [
    // Engine commands
    ...Object.values(engines).map(engine => ({
      id: `engine-${engine.id}`,
      title: engine.name,
      subtitle: engine.description,
      icon: engine.icon,
      iconColor: engine.color,
      category: 'motor' as const,
      action: () => {
        openEngineWindow(engine.id, engine.name);
        closeSpotlight();
      },
    })),

    // System commands
    {
      id: 'system-audit',
      title: 'New Audit',
      subtitle: 'Start a new security audit',
      icon: 'Play',
      iconColor: '#10B981',
      shortcut: '⌘N',
      category: 'system' as const,
      action: () => {
        openAuditWindow();
        closeSpotlight();
      },
    },
    {
      id: 'system-finder',
      title: 'Open Finder',
      subtitle: 'Browse files and folders',
      icon: 'FolderOpen',
      iconColor: '#F59E0B',
      shortcut: '⌘O',
      category: 'system' as const,
      action: () => {
        openFinderWindow();
        closeSpotlight();
      },
    },
    {
      id: 'system-settings',
      title: 'Settings',
      subtitle: 'System preferences and configuration',
      icon: 'Settings',
      iconColor: '#9CA3AF',
      shortcut: '⌘,',
      category: 'system' as const,
      action: () => {
        closeSpotlight();
      },
    },

    // Action commands
    {
      id: 'action-scan',
      title: 'Quick Scan',
      subtitle: 'Run a quick security scan',
      icon: 'Target',
      iconColor: '#EC4899',
      category: 'action' as const,
      action: () => {
        openEngineWindow('intent', 'Intent Engine');
        closeSpotlight();
      },
    },
    {
      id: 'action-report',
      title: 'Generate Report',
      subtitle: 'Create a security assessment report',
      icon: 'FileText',
      iconColor: '#10B981',
      category: 'action' as const,
      action: () => {
        closeSpotlight();
      },
    },
  ];

  // Filter commands based on search
  const filteredCommands = commands.filter(cmd => {
    const query = searchQuery.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(query) ||
      cmd.subtitle?.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  });

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (spotlightOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [spotlightOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!spotlightOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          Math.min(prev + 1, filteredCommands.length - 1)
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeSpotlight();
        break;
    }
  }, [spotlightOpen, filteredCommands, selectedIndex, closeSpotlight]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle Cmd+K to open
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSystemStore.getState().toggleSpotlight();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  if (!spotlightOpen) return null;

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, Command[]>);

  const categoryOrder = ['motor', 'action', 'system', 'file'];
  const categoryLabels: Record<string, string> = {
    motor: 'Neural Engines',
    action: 'Actions',
    system: 'System',
    file: 'Files',
  };

  return (
    <div
      onClick={closeSpotlight}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
        animation: 'fadeIn 0.1s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '640px',
          maxWidth: '90vw',
          background: 'rgba(20, 20, 30, 0.98)',
          backdropFilter: 'blur(30px) saturate(180%)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 25px 100px rgba(0,0,0,0.7)',
          overflow: 'hidden',
          animation: 'scaleIn 0.15s ease',
        }}
      >
        {/* Search Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <Search size={20} style={{ color: 'rgba(255,255,255,0.5)' }} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search engines, commands, or files..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '16px',
              fontFamily: 'inherit',
            }}
          />
          <div
            style={{
              padding: '4px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            ESC
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            maxHeight: '400px',
            overflow: 'auto',
            padding: '8px 0',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              No results found
            </div>
          ) : (
            categoryOrder.map(category => {
              const cmds = groupedCommands[category];
              if (!cmds || cmds.length === 0) return null;

              return (
                <div key={category}>
                  <div
                    style={{
                      padding: '8px 20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {categoryLabels[category]}
                  </div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    const IconComponent = iconMap[cmd.icon];

                    return (
                      <div
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 20px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                          borderLeft: isSelected ? '3px solid #6366F1' : '3px solid transparent',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        {IconComponent && (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              background: cmd.iconColor ? `${cmd.iconColor}20` : 'rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconComponent size={16} style={{ color: cmd.iconColor || '#fff' }} />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                            {cmd.title}
                          </div>
                          {cmd.subtitle && (
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
                              {cmd.subtitle}
                            </div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <div
                            style={{
                              padding: '2px 6px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.5)',
                            }}
                          >
                            {cmd.shortcut}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 20px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <div>{filteredCommands.length} results</div>
        </div>
      </div>
    </div>
  );
}

export default Spotlight;
