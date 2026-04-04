/**
 * SitePulse Engine Service
 * Integração com os 10 motores neurais via IPC
 */

import type {
  EngineListResponse,
  EngineGetResponse,
  EngineActivateResponse,
} from '../types/ipc';
import { engineAPI } from './ipc';

// Tipos específicos dos motores
export interface EngineStatus {
  id: string;
  name: string;
  codename: string;
  status: 'active' | 'idle' | 'processing' | 'error' | 'disabled';
  power: number;
  efficiency: number;
  isActive: boolean;
  lastActivity?: string;
  metrics?: {
    operationsPerSecond?: number;
    accuracyRate?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
}

export interface EngineMetrics {
  engineId: string;
  timestamp: string;
  operationsTotal: number;
  operationsSuccess: number;
  operationsFailed: number;
  averageResponseTime: number;
  memoryUsage: number;
}

// Mapeamento dos 10 motores
export const ENGINE_DEFINITIONS = {
  intent: {
    id: 'intent',
    name: 'Intent Engine',
    codename: 'ORACLE',
    description: 'Analisa intenções de usuários e propósitos de páginas',
    capabilities: ['intent-analysis', 'user-journey', 'conversion-optimization'],
  },
  context: {
    id: 'context',
    name: 'Context Engine',
    codename: 'SAGE',
    description: 'Entende contexto de negócio e domínio do site',
    capabilities: ['context-analysis', 'business-logic', 'domain-understanding'],
  },
  evidence: {
    id: 'evidence',
    name: 'Evidence Engine',
    codename: 'PROOF',
    description: 'Coleta e analisa evidências visuais e comportamentais',
    capabilities: ['screenshots', 'dom-analysis', 'visual-regression'],
  },
  memory: {
    id: 'memory',
    name: 'Memory Engine',
    codename: 'MNEMOS',
    description: 'Armazena e recupera conhecimento entre sessões',
    capabilities: ['state-persistence', 'learning', 'pattern-recognition'],
  },
  learning: {
    id: 'learning',
    name: 'Learning Engine',
    codename: 'SYNAPSE',
    description: 'Aprende com cada auditoria e melhora continuamente',
    capabilities: ['ml-training', 'pattern-learning', 'adaptation'],
  },
  decision: {
    id: 'decision',
    name: 'Decision Engine',
    codename: 'JUDGE',
    description: 'Toma decisões sobre prioridades e severidade',
    capabilities: ['priority-analysis', 'severity-assessment', 'triaging'],
  },
  action: {
    id: 'action',
    name: 'Action Engine',
    codename: 'EXECUTOR',
    description: 'Executa ações e interações no site auditado',
    capabilities: ['interaction', 'navigation', 'form-testing'],
  },
  predictive: {
    id: 'predictive',
    name: 'Predictive Engine',
    codename: 'PROPHET',
    description: 'Prevê problemas antes que ocorram',
    capabilities: ['risk-prediction', 'trend-analysis', 'forecasting'],
  },
  autonomous: {
    id: 'autonomous',
    name: 'Autonomous QA',
    codename: 'AUTO',
    description: 'Opera de forma autônoma com mínima intervenção',
    capabilities: ['self-directed', 'automated-testing', 'continuous-monitoring'],
  },
  security: {
    id: 'security',
    name: 'Security Engine',
    codename: 'GUARDIAN',
    description: 'Detecta vulnerabilidades e problemas de segurança',
    capabilities: ['vulnerability-scanning', 'security-audit', 'compliance-check'],
  },
} as const;

export type EngineId = keyof typeof ENGINE_DEFINITIONS;

/**
 * Lista todos os motores disponíveis
 */
export async function listEngines(): Promise<EngineStatus[]> {
  try {
    const response = await engineAPI.list();
    if (response.success && response.data) {
      return response.data.map(engine => ({
        ...engine,
        codename: ENGINE_DEFINITIONS[engine.id as EngineId]?.codename || 'UNKNOWN',
        description: ENGINE_DEFINITIONS[engine.id as EngineId]?.description || '',
        capabilities: ENGINE_DEFINITIONS[engine.id as EngineId]?.capabilities || [],
      }));
    }
    return [];
  } catch (error) {
    console.error('[EngineService] Erro ao listar motores:', error);
    // Retorna motores com status offline em caso de erro
    return Object.values(ENGINE_DEFINITIONS).map(def => ({
      ...def,
      status: 'disabled' as const,
      power: 0,
      efficiency: 0,
      isActive: false,
    }));
  }
}

/**
 * Obtém detalhes de um motor específico
 */
export async function getEngine(id: EngineId): Promise<EngineStatus | null> {
  try {
    const response = await engineAPI.get(id);
    if (response.success && response.data) {
      return {
        ...response.data,
        codename: ENGINE_DEFINITIONS[id]?.codename || 'UNKNOWN',
        description: ENGINE_DEFINITIONS[id]?.description || '',
        capabilities: ENGINE_DEFINITIONS[id]?.capabilities || [],
      };
    }
    return null;
  } catch (error) {
    console.error(`[EngineService] Erro ao obter motor ${id}:`, error);
    return null;
  }
}

/**
 * Ativa um motor neural
 */
export async function activateEngine(id: EngineId): Promise<boolean> {
  try {
    const response = await engineAPI.activate(id);
    return response.success;
  } catch (error) {
    console.error(`[EngineService] Erro ao ativar motor ${id}:`, error);
    return false;
  }
}

/**
 * Desativa um motor neural
 */
export async function deactivateEngine(id: EngineId): Promise<boolean> {
  try {
    const response = await engineAPI.deactivate(id);
    return response.success;
  } catch (error) {
    console.error(`[EngineService] Erro ao desativar motor ${id}:`, error);
    return false;
  }
}

/**
 * Ativa múltiplos motores de uma vez
 */
export async function activateEngines(ids: EngineId[]): Promise<Record<EngineId, boolean>> {
  const results = {} as Record<EngineId, boolean>;
  
  await Promise.all(
    ids.map(async (id) => {
      results[id] = await activateEngine(id);
    })
  );
  
  return results;
}

/**
 * Obtém métricas de todos os motores ativos
 */
export async function getEnginesMetrics(): Promise<EngineMetrics[]> {
  // TODO: Implementar quando backend tiver endpoint de métricas
  console.log('[EngineService] Métricas em desenvolvimento');
  return [];
}

/**
 * Verifica se um motor está disponível
 */
export function isEngineAvailable(id: string): id is EngineId {
  return id in ENGINE_DEFINITIONS;
}

/**
 * Obtém definição de um motor
 */
export function getEngineDefinition(id: EngineId) {
  return ENGINE_DEFINITIONS[id];
}

/**
 * Lista todas as capabilities disponíveis
 */
export function listAllCapabilities(): string[] {
  const capabilities = new Set<string>();
  Object.values(ENGINE_DEFINITIONS).forEach(engine => {
    engine.capabilities.forEach(cap => capabilities.add(cap));
  });
  return Array.from(capabilities);
}

// Exporta o serviço completo
export const engineService = {
  list: listEngines,
  get: getEngine,
  activate: activateEngine,
  deactivate: deactivateEngine,
  activateMultiple: activateEngines,
  getMetrics: getEnginesMetrics,
  isAvailable: isEngineAvailable,
  getDefinition: getEngineDefinition,
  listCapabilities: listAllCapabilities,
  definitions: ENGINE_DEFINITIONS,
};

export default engineService;
