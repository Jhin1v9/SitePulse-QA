/**
 * SITEPULSE STUDIO v3.0 - EVENT BUS
 * Sistema de eventos para comunicação entre componentes
 */

import { useEffect, useCallback, useRef } from 'react';

type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  on<T>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${event}:`, error);
      }
    });
  }

  once<T>(event: string, callback: EventCallback<T>): void {
    const unsubscribe = this.on<T>(event, (data) => {
      unsubscribe();
      callback(data);
    });
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Hook para usar o event bus
export function useEventBus<T = any>(
  event: string,
  callback: EventCallback<T>,
  deps: React.DependencyList = []
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const wrappedCallback = (data: T) => callbackRef.current(data);
    return eventBus.on(event, wrappedCallback);
  }, [event, ...deps]);
}

// Hook para emitir eventos
export function useEmit() {
  return useCallback(<T>(event: string, data: T) => {
    eventBus.emit(event, data);
  }, []);
}

// Eventos predefinidos do sistema
export const SystemEvents = {
  // Engine events
  ENGINE_STATUS_CHANGED: 'engine:status-changed',
  ENGINE_METRICS_UPDATED: 'engine:metrics-updated',
  ENGINE_ERROR: 'engine:error',
  
  // Audit events
  AUDIT_STARTED: 'audit:started',
  AUDIT_PROGRESS: 'audit:progress',
  AUDIT_COMPLETED: 'audit:completed',
  AUDIT_CANCELLED: 'audit:cancelled',
  AUDIT_ERROR: 'audit:error',
  
  // UI events
  NOTIFICATION_SHOW: 'ui:notification-show',
  MODAL_OPEN: 'ui:modal-open',
  MODAL_CLOSE: 'ui:modal-close',
  SIDEBAR_TOGGLE: 'ui:sidebar-toggle',
  
  // Data events
  DATA_REFRESH: 'data:refresh',
  DATA_UPDATED: 'data:updated',
  FILTERS_CHANGED: 'data:filters-changed',
} as const;

export default EventBus;
