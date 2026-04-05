/**
 * Engine Store - Zustand
 * Gerencia os 10 motores neurais com integração real via IPC
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Engine, EngineId, EngineStatus, EngineMetrics } from '@/types/os';
import { engineService, type EngineStatus as ServiceEngineStatus } from '@/services/engines';

interface EngineStore {
  engines: Record<EngineId, Engine>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEngines: () => Promise<void>;
  activateEngine: (id: EngineId) => Promise<void>;
  deactivateEngine: (id: EngineId) => Promise<void>;
  updateEngineStatus: (id: EngineId, status: EngineStatus) => void;
  updateEngineMetrics: (id: EngineId, metrics: Partial<EngineMetrics>) => void;
  getActiveEngines: () => Engine[];
  getEngineById: (id: EngineId) => Engine | undefined;
}

const defaultMetrics: EngineMetrics = {
  operationsPerSecond: 0,
  accuracyRate: 0,
  responseTime: 0,
  memoryUsage: 0,
};

const initialEngines: Record<EngineId, Engine> = {
  intent: {
    id: 'intent',
    name: 'Intent Engine',
    codename: 'ORACLE',
    description: 'Pattern recognition & intent analysis',
    color: '#EC4899',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
    icon: 'Target',
    status: 'active',
    isActive: true,
    power: 94,
    efficiency: 91,
    metrics: { ...defaultMetrics, operationsPerSecond: 12500, accuracyRate: 94.7 },
  },
  context: {
    id: 'context',
    name: 'Context Engine',
    codename: 'SAGE',
    description: 'Business context & asset mapping',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
    icon: 'Globe',
    status: 'active',
    isActive: true,
    power: 88,
    efficiency: 93,
    metrics: { ...defaultMetrics, operationsPerSecond: 8400, accuracyRate: 91.2 },
  },
  evidence: {
    id: 'evidence',
    name: 'Evidence Engine',
    codename: 'PROOF',
    description: 'Evidence collection & validation',
    color: '#06B6D4',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
    icon: 'FileSearch',
    status: 'processing',
    isActive: true,
    power: 96,
    efficiency: 89,
    metrics: { ...defaultMetrics, operationsPerSecond: 15200, accuracyRate: 96.3 },
  },
  memory: {
    id: 'memory',
    name: 'Memory Engine',
    codename: 'MNEMOS',
    description: 'Pattern storage & historical analysis',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    icon: 'Database',
    status: 'active',
    isActive: true,
    power: 82,
    efficiency: 95,
    metrics: { ...defaultMetrics, operationsPerSecond: 6200, accuracyRate: 89.5 },
  },
  learning: {
    id: 'learning',
    name: 'Learning Engine',
    codename: 'EVOLVE',
    description: 'Continuous learning & adaptation',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    icon: 'TrendingUp',
    status: 'learning',
    isActive: true,
    power: 91,
    efficiency: 87,
    metrics: { ...defaultMetrics, operationsPerSecond: 7800, accuracyRate: 92.8 },
  },
  decision: {
    id: 'decision',
    name: 'Decision Engine',
    codename: 'ARBITER',
    description: 'Multi-criteria decision making',
    color: '#6366F1',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
    icon: 'GitBranch',
    status: 'active',
    isActive: true,
    power: 89,
    efficiency: 92,
    metrics: { ...defaultMetrics, operationsPerSecond: 11200, accuracyRate: 93.5 },
  },
  action: {
    id: 'action',
    name: 'Action Engine',
    codename: 'EXECUTOR',
    description: 'Automated remediation & response',
    color: '#EF4444',
    gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    icon: 'Zap',
    status: 'dormant',
    isActive: false,
    power: 0,
    efficiency: 0,
    metrics: { ...defaultMetrics, operationsPerSecond: 0, accuracyRate: 0 },
  },
  predictive: {
    id: 'predictive',
    name: 'Predictive Engine',
    codename: 'PROPHET',
    description: 'Threat forecasting & trend analysis',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    icon: 'Eye',
    status: 'active',
    isActive: true,
    power: 86,
    efficiency: 88,
    metrics: { ...defaultMetrics, operationsPerSecond: 5400, accuracyRate: 87.3 },
  },
  autonomous: {
    id: 'autonomous',
    name: 'Autonomous Engine',
    codename: 'SENTINEL',
    description: 'Self-healing & autonomous operation',
    color: '#14B8A6',
    gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
    icon: 'Bot',
    status: 'active',
    isActive: true,
    power: 78,
    efficiency: 96,
    metrics: { ...defaultMetrics, operationsPerSecond: 9600, accuracyRate: 95.1 },
  },
  security: {
    id: 'security',
    name: 'Security Engine',
    codename: 'GUARDIAN',
    description: 'Platform protection & integrity',
    color: '#DC2626',
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    icon: 'Shield',
    status: 'active',
    isActive: true,
    power: 98,
    efficiency: 94,
    metrics: { ...defaultMetrics, operationsPerSecond: 18500, accuracyRate: 98.7 },
  },
};

export const useEngineStore = create<EngineStore>()(
  devtools(
    (set, get) => ({
      engines: initialEngines,
      isLoading: false,
      error: null,

      fetchEngines: async () => {
        set({ isLoading: true, error: null });
        try {
          const engines = await engineService.list();
          // Merge com dados locais para manter cores, ícones, etc
          const mergedEngines = { ...get().engines };
          engines.forEach((engine: ServiceEngineStatus) => {
            if (mergedEngines[engine.id as EngineId]) {
              mergedEngines[engine.id as EngineId] = {
                ...mergedEngines[engine.id as EngineId],
                status: engine.status as EngineStatus,
                isActive: engine.isActive,
                power: engine.power,
                efficiency: engine.efficiency,
                metrics: {
                  ...mergedEngines[engine.id as EngineId].metrics,
                  ...engine.metrics,
                },
              };
            }
          });
          set({ engines: mergedEngines, isLoading: false });
        } catch (error) {
          console.error('[EngineStore] Erro ao carregar motores:', error);
          set({ error: 'Falha ao carregar motores', isLoading: false });
        }
      },

      activateEngine: async (id: EngineId) => {
        const success = await engineService.activate(id);
        if (success) {
          set(state => ({
            engines: {
              ...state.engines,
              [id]: {
                ...state.engines[id],
                isActive: true,
                status: 'active',
              },
            },
          }));
        }
      },

      deactivateEngine: async (id: EngineId) => {
        const success = await engineService.deactivate(id);
        if (success) {
          set(state => ({
            engines: {
              ...state.engines,
              [id]: {
                ...state.engines[id],
                isActive: false,
                status: 'dormant',
              },
            },
          }));
        }
      },

      updateEngineStatus: (id: EngineId, status: EngineStatus) => {
        set(state => ({
          engines: {
            ...state.engines,
            [id]: {
              ...state.engines[id],
              status,
            },
          },
        }));
      },

      updateEngineMetrics: (id: EngineId, metrics: Partial<EngineMetrics>) => {
        set(state => ({
          engines: {
            ...state.engines,
            [id]: {
              ...state.engines[id],
              metrics: {
                ...state.engines[id].metrics,
                ...metrics,
              },
            },
          },
        }));
      },

      getActiveEngines: () => {
        return Object.values(get().engines).filter(e => e.isActive);
      },

      getEngineById: (id: EngineId) => {
        return get().engines[id];
      },
    }),
    { name: 'EngineStore' }
  )
);

export default useEngineStore;
