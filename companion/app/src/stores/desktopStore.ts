/**
 * Desktop Store - Zustand
 * Manages desktop state, icons, wallpaper, and selection
 */

import { create } from 'zustand';
import type { DesktopIcon, EngineId } from '@/types/os';

interface DesktopStore {
  wallpaper: string;
  icons: DesktopIcon[];
  selectedIconIds: string[];
  contextMenu: {
    isOpen: boolean;
    position: { x: number; y: number };
    items: ContextMenuItem[];
  } | null;

  // Actions
  setWallpaper: (url: string) => void;
  moveIcon: (id: string, position: { x: number; y: number }) => void;
  selectIcon: (id: string, multi: boolean) => void;
  selectAll: () => void;
  deselectAll: () => void;
  openContextMenu: (position: { x: number; y: number }, items: ContextMenuItem[]) => void;
  closeContextMenu: () => void;
  initializeIcons: (engines: Array<{ id: EngineId; name: string; color: string; icon: string }>) => void;
}

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  separator?: boolean;
}

const GRID_SIZE = 100;
const SNAP_THRESHOLD = 20;

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  wallpaper: 'gradient',
  icons: [],
  selectedIconIds: [],
  contextMenu: null,

  setWallpaper: (url: string) => set({ wallpaper: url }),

  moveIcon: (id: string, position: { x: number; y: number }) => {
    // Snap to grid
    const snappedX = Math.round(position.x / GRID_SIZE) * GRID_SIZE;
    const snappedY = Math.round(position.y / GRID_SIZE) * GRID_SIZE;

    set(state => ({
      icons: state.icons.map(icon =>
        icon.id === id ? { ...icon, position: { x: snappedX, y: snappedY } } : icon
      ),
    }));
  },

  selectIcon: (id: string, multi: boolean) => {
    const { selectedIconIds } = get();
    
    if (multi) {
      // Toggle selection
      if (selectedIconIds.includes(id)) {
        set({ selectedIconIds: selectedIconIds.filter(i => i !== id) });
      } else {
        set({ selectedIconIds: [...selectedIconIds, id] });
      }
    } else {
      // Single selection
      set({ selectedIconIds: [id] });
    }
  },

  selectAll: () => {
    set(state => ({ selectedIconIds: state.icons.map(i => i.id) }));
  },

  deselectAll: () => {
    set({ selectedIconIds: [] });
  },

  openContextMenu: (position: { x: number; y: number }, items: ContextMenuItem[]) => {
    set({ contextMenu: { isOpen: true, position, items } });
  },

  closeContextMenu: () => {
    set({ contextMenu: null });
  },

  initializeIcons: (engines: Array<{ id: EngineId; name: string; color: string; icon: string }>) => {
    const icons: DesktopIcon[] = engines.map((engine, index) => ({
      id: engine.id,
      name: engine.name,
      icon: engine.icon,
      color: engine.color,
      position: {
        x: 40 + (index % 2) * 120,
        y: 40 + Math.floor(index / 2) * 120,
      },
    }));
    set({ icons });
  },
}));
