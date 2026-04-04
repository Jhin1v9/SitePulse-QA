/**
 * WindowManager - Manages all open windows
 * Renders the window layer and handles global window operations
 */

import { useEffect, useCallback } from 'react';
import { useWindowStore, useEngineStore } from '@/stores';
import { BaseWindow } from '@/windows/BaseWindow';
import { AuditWindow } from '@/windows/AuditWindow';
import { FinderWindow } from '@/windows/FinderWindow';
import { IntentWindow } from '@/windows/IntentWindow';
import { ContextWindow } from '@/windows/ContextWindow';
import { EvidenceWindow } from '@/windows/EvidenceWindow';
import { MemoryWindow } from '@/windows/MemoryWindow';
import { LearningWindow } from '@/windows/LearningWindow';
import { DecisionWindow } from '@/windows/DecisionWindow';
import { ActionWindow } from '@/windows/ActionWindow';
import { PredictiveWindow } from '@/windows/PredictiveWindow';
import { AutonomousWindow } from '@/windows/AutonomousWindow';
import { SecurityWindow } from '@/windows/SecurityWindow';
import type { EngineId } from '@/types/os';

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

export function WindowManager() {
  const { windows, focusWindow, closeWindow } = useWindowStore();
  const { engines } = useEngineStore();

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl+W to close focused window
    if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
      e.preventDefault();
      const focusedWindow = windows.find(w => w.isFocused);
      if (focusedWindow) {
        closeWindow(focusedWindow.id);
      }
    }

    // Cmd/Ctrl+M to minimize focused window
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      const focusedWindow = windows.find(w => w.isFocused);
      if (focusedWindow) {
        useWindowStore.getState().minimizeWindow(focusedWindow.id);
      }
    }

    // Escape to close modals/overlays
    if (e.key === 'Escape') {
      // Could close context menus, etc.
    }
  }, [windows, closeWindow]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Sort windows by zIndex
  const sortedWindows = [...windows].sort((a, b) => a.zIndex - b.zIndex);

  const renderWindowContent = (window: typeof sortedWindows[0]) => {
    switch (window.type) {
      case 'audit':
        return <AuditWindow />;
      case 'finder':
        return <FinderWindow />;
      case 'engine':
        if (window.engineId) {
          switch (window.engineId) {
            case 'intent':
              return <IntentWindow windowId={window.id} />;
            case 'context':
              return <ContextWindow windowId={window.id} />;
            case 'evidence':
              return <EvidenceWindow windowId={window.id} />;
            case 'memory':
              return <MemoryWindow windowId={window.id} />;
            case 'learning':
              return <LearningWindow windowId={window.id} />;
            case 'decision':
              return <DecisionWindow windowId={window.id} />;
            case 'action':
              return <ActionWindow windowId={window.id} />;
            case 'predictive':
              return <PredictiveWindow windowId={window.id} />;
            case 'autonomous':
              return <AutonomousWindow windowId={window.id} />;
            case 'security':
              return <SecurityWindow windowId={window.id} />;
            default:
              return <div>Unknown Engine</div>;
          }
        }
        return <div>Engine not specified</div>;
      default:
        return <div>Unknown Window Type</div>;
    }
  };

  const getWindowColor = (window: typeof sortedWindows[0]): string => {
    if (window.type === 'engine' && window.engineId) {
      return engineColors[window.engineId];
    }
    if (window.type === 'audit') return '#6366F1';
    if (window.type === 'finder') return '#F59E0B';
    return '#6366F1';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '28px',
        left: 0,
        right: 0,
        bottom: '70px',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {sortedWindows.map(window => {
        const color = getWindowColor(window);

        return (
          <div
            key={window.id}
            style={{
              pointerEvents: 'auto',
            }}
          >
            <BaseWindow
              window={window}
              color={color}
              onClose={() => closeWindow(window.id)}
            >
              {renderWindowContent(window)}
            </BaseWindow>
          </div>
        );
      })}
    </div>
  );
}

export default WindowManager;
