/**
 * MenuBar - Top system bar
 * Shows app menu, status, clock, notifications
 */

import { useState, useEffect } from 'react';
import { useSystemStore, useEngineStore, useWindowStore } from '@/stores';
import { Sparkles, Wifi, Volume2, Battery, Search, Bell, ChevronDown } from 'lucide-react';
import type { MenuItem } from '@/types/os';

export function MenuBar() {
  const { notifications, aiState, openSpotlight } = useSystemStore();
  const { engines } = useEngineStore();
  const { openAuditWindow, openFinderWindow, closeAllWindows } = useWindowStore();
  const [timeString, setTimeString] = useState('');
  const [dateString, setDateString] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }));
      setDateString(now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeEngines = Object.values(engines).filter(e => e.isActive);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const menus: Record<string, MenuItem[]> = {
    sitepulse: [
      { label: 'About SitePulse OS', action: () => {} },
      { separator: true },
      { label: 'Preferences...', shortcut: '⌘,', action: () => {} },
      { separator: true },
      { label: 'Hide SitePulse', shortcut: '⌘H', action: () => {} },
      { label: 'Hide Others', shortcut: '⌥⌘H', action: () => {} },
      { separator: true },
      { label: 'Quit SitePulse', shortcut: '⌘Q', action: () => {} },
    ],
    file: [
      { label: 'New Audit', shortcut: '⌘N', action: () => openAuditWindow() },
      { label: 'Open Project...', shortcut: '⌘O', action: () => openFinderWindow() },
      { separator: true },
      { label: 'Close Window', shortcut: '⌘W', action: () => {} },
      { label: 'Close All', shortcut: '⌥⌘W', action: () => closeAllWindows() },
    ],
    edit: [
      { label: 'Undo', shortcut: '⌘Z', action: () => {} },
      { label: 'Redo', shortcut: '⇧⌘Z', action: () => {} },
      { separator: true },
      { label: 'Cut', shortcut: '⌘X', action: () => {} },
      { label: 'Copy', shortcut: '⌘C', action: () => {} },
      { label: 'Paste', shortcut: '⌘V', action: () => {} },
      { separator: true },
      { label: 'Select All', shortcut: '⌘A', action: () => {} },
    ],
    view: [
      { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => {} },
      { separator: true },
      { label: 'Show Sidebar', action: () => {} },
      { label: 'Show Status Bar', action: () => {} },
    ],
    window: [
      { label: 'Minimize', shortcut: '⌘M', action: () => {} },
      { label: 'Zoom', action: () => {} },
      { separator: true },
      { label: 'Bring All to Front', action: () => {} },
    ],
    help: [
      { label: 'SitePulse Help', action: () => {} },
      { separator: true },
      { label: 'Documentation', action: () => {} },
      { label: 'Report Issue', action: () => {} },
    ],
  };

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.action && !item.disabled) {
      item.action();
    }
    setActiveMenu(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '28px',
        background: 'rgba(10, 10, 15, 0.9)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '13px',
        color: '#fff',
        userSelect: 'none',
      }}
    >
      {/* Left Section - App Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Logo */}
        <div
          onClick={() => handleMenuClick('sitepulse')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            background: activeMenu === 'sitepulse' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
        >
          <Sparkles size={14} style={{ color: '#6366F1' }} />
          <span>SitePulse</span>
        </div>

        {/* Menu Items */}
        {[
          { key: 'file', label: 'File' },
          { key: 'edit', label: 'Edit' },
          { key: 'view', label: 'View' },
          { key: 'window', label: 'Window' },
          { key: 'help', label: 'Help' },
        ].map((menu) => (
          <div key={menu.key} style={{ position: 'relative' }}>
            <button
              onClick={() => handleMenuClick(menu.key)}
              style={{
                padding: '4px 10px',
                background: activeMenu === menu.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {menu.label}
            </button>

            {/* Dropdown Menu */}
            {activeMenu === menu.key && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  minWidth: '200px',
                  background: 'rgba(25, 25, 35, 0.98)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                  zIndex: 1001,
                  overflow: 'hidden',
                }}
              >
                {menus[menu.key]?.map((item, idx) => (
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
                      onClick={() => handleMenuItemClick(item)}
                      disabled={item.disabled}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 14px',
                        background: 'transparent',
                        border: 'none',
                        color: item.disabled ? 'rgba(255,255,255,0.4)' : '#fff',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.disabled) {
                          e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                          {item.shortcut}
                        </span>
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Center Section - Active Engines Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {activeEngines.slice(0, 5).map(engine => (
          <div
            key={engine.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: '4px',
              background: `${engine.color}15`,
              fontSize: '11px',
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: engine.color,
                animation: engine.status === 'processing' ? 'pulse 1s ease-in-out infinite' : 'none',
              }}
            />
            <span style={{ color: engine.color }}>{engine.codename}</span>
          </div>
        ))}
        {activeEngines.length > 5 && (
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
            +{activeEngines.length - 5}
          </span>
        )}
      </div>

      {/* Right Section - System Icons & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* AI Assistant Icon */}
        <div
          onClick={() => useSystemStore.getState().setAIState('listening')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: aiState === 'listening' ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: aiState === 'idle' ? '#10B981' : aiState === 'listening' ? '#F59E0B' : '#6366F1',
              animation: aiState !== 'idle' ? 'pulse 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>AI</span>
        </div>

        {/* Spotlight */}
        <div
          onClick={openSpotlight}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            padding: '2px',
            borderRadius: '4px',
          }}
        >
          <Search size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </div>

        {/* System Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wifi size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <Volume2 size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          <Battery size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
        </div>

        {/* Notifications */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Bell size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
          {unreadNotifications > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#EF4444',
                fontSize: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {unreadNotifications}
            </div>
          )}
        </div>

        {/* Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '2px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>{dateString}</span>
          <span style={{ color: '#fff', fontWeight: 500 }}>{timeString}</span>
        </div>
      </div>
    </div>
  );
}

export default MenuBar;
