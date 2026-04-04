/**
 * SITEPULSE STUDIO v3.0 - GLOBAL STORE
 * Estado global usando Zustand-like pattern
 */

import { useState, useEffect, useCallback } from 'react';
import { eventBus, SystemEvents } from './useEventBus';
import type { EngineState, AuditState } from '../types';

// Store state interface
interface StoreState {
  // Engines
  engines: EngineState[];
  setEngines: (engines: EngineState[]) => void;
  updateEngine: (id: string, updates: Partial<EngineState>) => void;
  
  // Audit
  auditState: AuditState | null;
  setAuditState: (state: AuditState | null) => void;
  
  // UI
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  
  // Selections
  selectedEngines: Set<string>;
  toggleEngineSelection: (id: string) => void;
  clearEngineSelection: () => void;
  
  // Filters
  globalFilter: string;
  setGlobalFilter: (filter: string) => void;
}

// Create store singleton
const createStore = (): StoreState => {
  const state: any = {
    engines: [],
    auditState: null,
    isLoading: false,
    sidebarOpen: true,
    selectedEngines: new Set(),
    globalFilter: '',
  };

  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    get engines() { return state.engines; },
    setEngines: (engines: EngineState[]) => {
      state.engines = engines;
      notify();
      eventBus.emit(SystemEvents.DATA_UPDATED, { type: 'engines', data: engines });
    },
    
    updateEngine: (id: string, updates: Partial<EngineState>) => {
      const index = state.engines.findIndex((e: EngineState) => e.id === id);
      if (index >= 0) {
        state.engines[index] = { ...state.engines[index], ...updates };
        notify();
        eventBus.emit(SystemEvents.ENGINE_STATUS_CHANGED, { id, ...updates });
      }
    },

    get auditState() { return state.auditState; },
    setAuditState: (auditState: AuditState | null) => {
      state.auditState = auditState;
      notify();
      if (auditState) {
        eventBus.emit(SystemEvents.AUDIT_PROGRESS, auditState);
      }
    },

    get isLoading() { return state.isLoading; },
    setIsLoading: (loading: boolean) => {
      state.isLoading = loading;
      notify();
    },

    get sidebarOpen() { return state.sidebarOpen; },
    setSidebarOpen: (open: boolean) => {
      state.sidebarOpen = open;
      notify();
    },

    get selectedEngines() { return state.selectedEngines; },
    toggleEngineSelection: (id: string) => {
      if (state.selectedEngines.has(id)) {
        state.selectedEngines.delete(id);
      } else {
        state.selectedEngines.add(id);
      }
      notify();
    },
    clearEngineSelection: () => {
      state.selectedEngines.clear();
      notify();
    },

    get globalFilter() { return state.globalFilter; },
    setGlobalFilter: (filter: string) => {
      state.globalFilter = filter;
      notify();
      eventBus.emit(SystemEvents.FILTERS_CHANGED, filter);
    },
  };
};

// Singleton store instance
const store = createStore();

// Hook to use store
export function useStore<T>(selector: (state: StoreState) => T): T {
  const [value, setValue] = useState(() => selector(store));

  useEffect(() => {
    const listener = () => setValue(selector(store));
    // Simple subscription mechanism
    const interval = setInterval(listener, 100);
    return () => clearInterval(interval);
  }, [selector]);

  return value;
}

// Hook for specific store actions
export function useStoreActions() {
  return {
    setEngines: store.setEngines,
    updateEngine: store.updateEngine,
    setAuditState: store.setAuditState,
    setIsLoading: store.setIsLoading,
    setSidebarOpen: store.setSidebarOpen,
    toggleEngineSelection: store.toggleEngineSelection,
    clearEngineSelection: store.clearEngineSelection,
    setGlobalFilter: store.setGlobalFilter,
  };
}

// Direct store access for non-component code
export { store };

export default useStore;
