/**
 * SITEPULSE STUDIO v3.0 - INTERFACE V3 EXPORTS
 * Exportações públicas da interface v3
 */

// Hooks
export { useIPC, useAuditState, useNotifications, useWindowControls } from './hooks/useIPC';
export { useEngines, useEngine } from './hooks/useEngines';
export { useEventBus, useEmit, SystemEvents, eventBus } from './hooks/useEventBus';
export { useStore, useStoreActions, store } from './hooks/useStore';

// Components
export { Layout } from './components/Layout';
export { ToastContainer, useToast, type Toast, type ToastType } from './components/Toast';
export { CommandPalette, useCommandPalette, type Command } from './components/CommandPalette';
export { LogViewer, useLogs, type LogEntry, type LogLevel } from './components/LogViewer';
export { BatchActions, type BatchAction } from './components/BatchActions';
export { Table, type TableColumn } from './components/Table';
export * from './components/charts';

// Screens
export { Dashboard } from './screens/Dashboard';
export { EngineDetail } from './screens/EngineDetail';
export { Orchestrator } from './screens/Orchestrator';
export { Findings } from './screens/Findings';
export { SEO } from './screens/SEO';
export { Compare } from './screens/Compare';
export { Reports } from './screens/Reports';

// Types
export type * from './types';

// App
export { App } from './App';
