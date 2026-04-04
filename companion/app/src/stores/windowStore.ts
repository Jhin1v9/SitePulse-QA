/**
 * Window Store - Zustand
 * Manages all window instances, focus, z-index, and window operations
 */

import { create } from 'zustand';
import type { WindowInstance, EngineId, WindowType } from '@/types/os';

interface WindowStore extends WindowManagerState {
  // Actions
  openWindow: (type: WindowType, title: string, engineId?: EngineId, data?: Record<string, unknown>) => string;
  openEngineWindow: (engineId: EngineId, title: string) => string;
  openAuditWindow: () => string;
  openFinderWindow: () => string;
  openAIWindow: () => string;
  openDashboardWindow: () => string;
  openSettingsWindow: () => string;
  closeWindow: (windowId: string) => void;
  closeAllWindows: () => void;
  focusWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  moveWindow: (windowId: string, position: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;
  bringToFront: (windowId: string) => void;
  getWindowsByType: (type: WindowType) => WindowInstance[];
  getWindowsByEngine: (engineId: EngineId) => WindowInstance[];
  isEngineRunning: (engineId: EngineId) => boolean;
  isWindowOpen: (type: WindowType) => boolean;
  restoreOrOpen: (type: WindowType, title: string, engineId?: EngineId) => string;
}

interface WindowManagerState {
  windows: WindowInstance[];
  focusedWindowId: string | null;
  nextZIndex: number;
}

const DEFAULT_WINDOW_SIZE = { width: 900, height: 600 };
const MIN_WINDOW_SIZE = { width: 400, height: 300 };
const CASCADE_OFFSET = 30;

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedWindowId: null,
  nextZIndex: 100,

  openWindow: (type: WindowType, title: string, engineId?: EngineId, data?: Record<string, unknown>) => {
    const { windows, nextZIndex } = get();
    
    // Calculate cascade position based on existing windows of same type
    const sameTypeWindows = windows.filter(w => w.type === type);
    const cascadeIndex = sameTypeWindows.length;
    const position = {
      x: 100 + cascadeIndex * CASCADE_OFFSET,
      y: 80 + cascadeIndex * CASCADE_OFFSET,
    };

    const newWindow: WindowInstance = {
      id: `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      engineId,
      title,
      position,
      size: { ...DEFAULT_WINDOW_SIZE },
      isMinimized: false,
      isMaximized: false,
      isFocused: true,
      zIndex: nextZIndex + 1,
      data,
    };

    set({
      windows: [...windows.map(w => ({ ...w, isFocused: false })), newWindow],
      focusedWindowId: newWindow.id,
      nextZIndex: nextZIndex + 1,
    });

    return newWindow.id;
  },

  openEngineWindow: (engineId: EngineId, title: string) => {
    return get().openWindow('engine', title, engineId);
  },

  openAuditWindow: () => {
    return get().openWindow('audit', 'Nova Auditoria');
  },

  openFinderWindow: () => {
    return get().openWindow('finder', 'Finder');
  },

  openAIWindow: () => {
    return get().openWindow('ai', 'AI Assistant');
  },

  openDashboardWindow: () => {
    return get().openWindow('dashboard', 'Dashboard');
  },

  openSettingsWindow: () => {
    return get().openWindow('settings', 'Settings');
  },

  closeWindow: (windowId: string) => {
    const { windows, focusedWindowId } = get();
    const filteredWindows = windows.filter(w => w.id !== windowId);
    
    // If closing focused window, focus the last one
    let newFocusedId = focusedWindowId;
    if (focusedWindowId === windowId && filteredWindows.length > 0) {
      const lastWindow = filteredWindows[filteredWindows.length - 1];
      lastWindow.isFocused = true;
      newFocusedId = lastWindow.id;
    }

    set({
      windows: filteredWindows,
      focusedWindowId: newFocusedId,
    });
  },

  closeAllWindows: () => {
    set({
      windows: [],
      focusedWindowId: null,
    });
  },

  focusWindow: (windowId: string) => {
    const { windows } = get();
    
    set({
      windows: windows.map(w => ({
        ...w,
        isFocused: w.id === windowId,
      })),
      focusedWindowId: windowId,
    });

    get().bringToFront(windowId);
  },

  minimizeWindow: (windowId: string) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.id === windowId ? { ...w, isMinimized: true, isFocused: false } : w
      ),
    });
  },

  maximizeWindow: (windowId: string) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.id === windowId ? { ...w, isMaximized: true } : w
      ),
    });
  },

  restoreWindow: (windowId: string) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.id === windowId
          ? { ...w, isMinimized: false, isMaximized: false, isFocused: true }
          : { ...w, isFocused: false }
      ),
      focusedWindowId: windowId,
    });
    get().bringToFront(windowId);
  },

  moveWindow: (windowId: string, position: { x: number; y: number }) => {
    const { windows } = get();
    set({
      windows: windows.map(w =>
        w.id === windowId ? { ...w, position } : w
      ),
    });
  },

  resizeWindow: (windowId: string, size: { width: number; height: number }) => {
    const { windows } = get();
    const clampedSize = {
      width: Math.max(MIN_WINDOW_SIZE.width, size.width),
      height: Math.max(MIN_WINDOW_SIZE.height, size.height),
    };
    set({
      windows: windows.map(w =>
        w.id === windowId ? { ...w, size: clampedSize } : w
      ),
    });
  },

  bringToFront: (windowId: string) => {
    const { windows, nextZIndex } = get();
    set({
      windows: windows.map(w =>
        w.id === windowId ? { ...w, zIndex: nextZIndex + 1 } : w
      ),
      nextZIndex: nextZIndex + 1,
    });
  },

  getWindowsByType: (type: WindowType) => {
    return get().windows.filter(w => w.type === type && !w.isMinimized);
  },

  getWindowsByEngine: (engineId: EngineId) => {
    return get().windows.filter(w => w.engineId === engineId && !w.isMinimized);
  },

  isEngineRunning: (engineId: EngineId) => {
    return get().windows.some(w => w.engineId === engineId);
  },

  isWindowOpen: (type: WindowType) => {
    return get().windows.some(w => w.type === type && !w.isMinimized);
  },

  restoreOrOpen: (type: WindowType, title: string, engineId?: EngineId) => {
    const { windows, restoreWindow, openWindow } = get();
    
    // Check if there's a minimized window of this type
    const minimizedWindow = windows.find(w => w.type === type && w.isMinimized);
    if (minimizedWindow) {
      restoreWindow(minimizedWindow.id);
      return minimizedWindow.id;
    }
    
    // Otherwise open a new window
    return openWindow(type, title, engineId);
  },
}));
