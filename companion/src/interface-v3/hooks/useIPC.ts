/**
 * SITEPULSE STUDIO v3.0 - IPC HOOK
 * Hook para comunicação com o processo principal do Electron
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { 
  IPCChannel, 
  IPCInvokeChannel, 
  AuditState, 
  Notification,
  NotificationType 
} from '../types';

// Declaração do Electron API exposta pelo preload
declare global {
  interface Window {
    electron?: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
      removeListener: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Verificar se está rodando no Electron
const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!window.electron;
};

// Hook principal de IPC
export function useIPC() {
  const [isReady, setIsReady] = useState(false);
  const listenersRef = useRef<Map<string, Set<Function>>>(new Map());

  useEffect(() => {
    setIsReady(isElectron());
  }, []);

  // Invocar método no main process
  const invoke = useCallback(async <T = any>(
    channel: IPCInvokeChannel,
    ...args: any[]
  ): Promise<T> => {
    if (!isElectron()) {
      console.warn(`[IPC] Cannot invoke '${channel}': not in Electron environment`);
      throw new Error('Not in Electron environment');
    }
    return window.electron!.invoke(channel, ...args);
  }, []);

  // Registrar listener para eventos do main
  const on = useCallback(<T = any>(
    channel: IPCChannel,
    callback: (data: T) => void
  ): (() => void) => {
    if (!isElectron()) {
      console.warn(`[IPC] Cannot listen to '${channel}': not in Electron environment`);
      return () => {};
    }

    // Armazenar listener para cleanup
    if (!listenersRef.current.has(channel)) {
      listenersRef.current.set(channel, new Set());
    }
    listenersRef.current.get(channel)!.add(callback);

    // Registrar no Electron
    const cleanup = window.electron!.on(channel, callback);
    
    return () => {
      cleanup?.();
      listenersRef.current.get(channel)?.delete(callback);
    };
  }, []);

  // Remover listener específico
  const off = useCallback(<T = any>(
    channel: IPCChannel,
    callback: (data: T) => void
  ): void => {
    if (!isElectron()) return;
    
    window.electron?.removeListener(channel, callback as any);
    listenersRef.current.get(channel)?.delete(callback);
  }, []);

  return {
    isReady,
    isElectron: isReady,
    invoke,
    on,
    off,
  };
}

// Hook para estado da auditoria
export function useAuditState() {
  const { on, invoke, isReady } = useIPC();
  const [state, setState] = useState<AuditState | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isReady) return;

    // Buscar estado inicial
    invoke<AuditState>('companion:get-state')
      .then(setState)
      .catch(console.error);

    // Ouvir mudanças de estado
    const unsubscribe = on<AuditState>('companion:state', (newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, [isReady, invoke, on]);

  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = on<string>('companion:log', (logLine) => {
      setLogs(prev => [logLine, ...prev].slice(0, 100));
    });

    return unsubscribe;
  }, [isReady, on]);

  const startAudit = useCallback(async (input: {
    baseUrl: string;
    mode: 'desktop' | 'mobile';
    scope: 'full' | 'seo' | 'actions' | 'visual';
    fullAudit?: boolean;
  }) => {
    return invoke('companion:start-audit', input);
  }, [invoke]);

  const cancelAudit = useCallback(async () => {
    return invoke('companion:cancel-audit');
  }, [invoke]);

  return {
    state,
    logs,
    startAudit,
    cancelAudit,
  };
}

// Hook para notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { on, isReady } = useIPC();

  useEffect(() => {
    if (!isReady) return;

    const unsubscribe = on<Notification>('companion:notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Auto-remove após duration
      if (notification.duration !== 0) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);
      }
    });

    return unsubscribe;
  }, [isReady, on]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}

// Hook para controles da janela
export function useWindowControls() {
  const { invoke, isReady } = useIPC();

  const minimize = useCallback(async () => {
    return invoke('companion:minimize');
  }, [invoke]);

  const maximize = useCallback(async () => {
    return invoke('companion:maximize');
  }, [invoke]);

  const close = useCallback(async () => {
    return invoke('companion:close');
  }, [invoke]);

  return {
    canControl: isReady,
    minimize,
    maximize,
    close,
  };
}
