// SitePulse V3 — Healing Engine Connector
// Bridges the frontend with qa/healing-engine-service.mjs

import type { 
  Finding, 
  HealingSession, 
  HealingStrategy,
  Patch,
  UUID 
} from '../core/types.js';
import { eventBus } from '../core/event-bus.js';

// IPC Bridge for Electron
interface IPCBridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  on: (channel: string, callback: (...args: unknown[]) => void) => void;
}

interface HealingEngineAPI {
  analyzeFinding: (findingId: UUID) => Promise<HealingAnalysisResult>;
  generateStrategies: (findingId: UUID) => Promise<HealingStrategy[]>;
  applyHealing: (sessionId: UUID, mode: 'shadow' | 'staging' | 'autonomous') => Promise<HealingResult>;
  rollbackHealing: (sessionId: UUID) => Promise<boolean>;
  verifyHealing: (sessionId: UUID) => Promise<VerificationResult>;
  getHealingHistory: (findingId?: UUID) => Promise<HealingSession[]>;
}

interface HealingAnalysisResult {
  findingId: UUID;
  analyzable: boolean;
  complexity: number;
  estimatedTokens: number;
  suggestedApproaches: string[];
  confidence: number;
}

interface HealingResult {
  success: boolean;
  sessionId?: UUID;
  error?: string;
  filesModified: string[];
  diff: Patch['diff'];
}

interface VerificationResult {
  passed: boolean;
  testsRun: number;
  testsPassed: number;
  issues: string[];
}

export class HealingConnector implements HealingEngineAPI {
  private _ipc: IPCBridge | null = null;
  private _mockMode = false;
  private _pendingSessions = new Map<UUID, HealingSession>();

  constructor() {
    this._detectIPC();
  }

  private _detectIPC(): void {
    if (typeof window !== 'undefined') {
      const w = window as unknown as { electronAPI?: IPCBridge };
      this._ipc = w.electronAPI ?? null;
    }
    
    if (!this._ipc) {
      console.warn('[HealingConnector] IPC not available, using mock mode');
      this._mockMode = true;
    }
  }

  async analyzeFinding(findingId: UUID): Promise<HealingAnalysisResult> {
    if (this._mockMode) {
      return this._mockAnalyze(findingId);
    }

    try {
      const result = await this._ipc!.invoke('healing:analyze', findingId);
      return result as HealingAnalysisResult;
    } catch (error) {
      console.error('[HealingConnector] analyze failed:', error);
      throw error;
    }
  }

  async generateStrategies(findingId: UUID): Promise<HealingStrategy[]> {
    if (this._mockMode) {
      return this._mockStrategies(findingId);
    }

    try {
      const result = await this._ipc!.invoke('healing:generate-strategies', findingId);
      return result as HealingStrategy[];
    } catch (error) {
      console.error('[HealingConnector] generateStrategies failed:', error);
      throw error;
    }
  }

  async applyHealing(
    sessionId: UUID, 
    mode: 'shadow' | 'staging' | 'autonomous'
  ): Promise<HealingResult> {
    eventBus.emit({
      type: 'HEALING_STARTED',
      payload: { sessionId, mode }
    });

    if (this._mockMode) {
      const result = await this._mockApply(sessionId, mode);
      this._emitCompleted(sessionId, result);
      return result;
    }

    try {
      const result = await this._ipc!.invoke('healing:apply', sessionId, mode) as HealingResult;
      this._emitCompleted(sessionId, result);
      return result;
    } catch (error) {
      console.error('[HealingConnector] applyHealing failed:', error);
      throw error;
    }
  }

  async rollbackHealing(sessionId: UUID): Promise<boolean> {
    if (this._mockMode) {
      return this._mockRollback(sessionId);
    }

    try {
      const result = await this._ipc!.invoke('healing:rollback', sessionId);
      
      eventBus.emit({
        type: 'HEALING_ROLLED_BACK',
        payload: { sessionId, success: result }
      });
      
      return result as boolean;
    } catch (error) {
      console.error('[HealingConnector] rollback failed:', error);
      return false;
    }
  }

  async verifyHealing(sessionId: UUID): Promise<VerificationResult> {
    if (this._mockMode) {
      return this._mockVerify(sessionId);
    }

    try {
      const result = await this._ipc!.invoke('healing:verify', sessionId);
      return result as VerificationResult;
    } catch (error) {
      console.error('[HealingConnector] verify failed:', error);
      throw error;
    }
  }

  async getHealingHistory(findingId?: UUID): Promise<HealingSession[]> {
    if (this._mockMode) {
      return this._mockHistory(findingId);
    }

    try {
      const result = await this._ipc!.invoke('healing:history', findingId);
      return result as HealingSession[];
    } catch (error) {
      console.error('[HealingConnector] getHistory failed:', error);
      return [];
    }
  }

  private _emitCompleted(sessionId: UUID, result: HealingResult): void {
    eventBus.emit({
      type: 'HEALING_COMPLETED',
      payload: { 
        sessionId, 
        success: result.success,
        filesModified: result.filesModified 
      }
    });
  }

  // Mock implementations for development
  private async _mockAnalyze(findingId: UUID): Promise<HealingAnalysisResult> {
    await this._delay(500);
    return {
      findingId,
      analyzable: true,
      complexity: Math.floor(Math.random() * 10) + 1,
      estimatedTokens: 1500 + Math.floor(Math.random() * 2000),
      suggestedApproaches: ['DIRECT_FIX', 'REFACTOR'],
      confidence: 0.7 + Math.random() * 0.25
    };
  }

  private async _mockStrategies(findingId: UUID): Promise<HealingStrategy[]> {
    await this._delay(800);
    return [
      {
        id: `strat-${Date.now()}-1`,
        approach: 'DIRECT_FIX',
        confidence: 0.92,
        estimatedRisk: 'low',
        filesAffected: ['src/utils/helpers.js'],
        rollbackComplexity: 1,
        description: 'Aplica verificación de null directamente en la línea afectada.',
        patch: {
          id: `patch-${Date.now()}`,
          diff: {
            hunks: [],
            fromFile: 'src/utils/helpers.js',
            toFile: 'src/utils/helpers.js',
            summary: 'Add null check'
          },
          description: 'Direct fix',
          generatedAt: new Date().toISOString()
        },
        efficacy: 0.95,
        elegance: 0.7,
        performanceImpact: 0.99
      },
      {
        id: `strat-${Date.now()}-2`,
        approach: 'REFACTOR',
        confidence: 0.85,
        estimatedRisk: 'medium',
        filesAffected: ['src/utils/helpers.js', 'src/types/index.ts'],
        rollbackComplexity: 2,
        description: 'Refactoriza la función para usar optional chaining.',
        patch: {
          id: `patch-${Date.now()}-2`,
          diff: {
            hunks: [],
            fromFile: 'src/utils/helpers.js',
            toFile: 'src/utils/helpers.js',
            summary: 'Refactor to use optional chaining'
          },
          description: 'Refactor approach',
          generatedAt: new Date().toISOString()
        },
        efficacy: 0.98,
        elegance: 0.95,
        performanceImpact: 0.98
      }
    ];
  }

  private async _mockApply(
    sessionId: UUID, 
    mode: string
  ): Promise<HealingResult> {
    await this._delay(1500);
    return {
      success: true,
      sessionId,
      filesModified: ['src/utils/helpers.js'],
      diff: {
        hunks: [],
        fromFile: 'src/utils/helpers.js',
        toFile: 'src/utils/helpers.js',
        summary: 'Applied healing patch'
      }
    };
  }

  private async _mockRollback(sessionId: UUID): Promise<boolean> {
    await this._delay(800);
    return true;
  }

  private async _mockVerify(sessionId: UUID): Promise<VerificationResult> {
    await this._delay(2000);
    return {
      passed: true,
      testsRun: 12,
      testsPassed: 12,
      issues: []
    };
  }

  private async _mockHistory(findingId?: UUID): Promise<HealingSession[]> {
    return [];
  }

  private _delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton
let _connector: HealingConnector | null = null;

export function getHealingConnector(): HealingConnector {
  if (!_connector) {
    _connector = new HealingConnector();
  }
  return _connector;
}
