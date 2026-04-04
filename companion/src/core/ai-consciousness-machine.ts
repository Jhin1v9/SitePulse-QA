// SitePulse V3 — AI Consciousness State Machine
// 8 consciousness states with visual configs and trigger-based transitions.

import type { AIConsciousnessState, ThreatLevel, Timestamp } from './types.js';
import { eventBus } from './event-bus.js';

// ── Visual Configuration per State ──────────────────────────────────
export interface AIStateConfig {
  readonly color: string;
  readonly animationClass: string;
  readonly breathingDurationMs: number;
  readonly label: string;
  readonly description: string;
  readonly glowIntensity: number; // 0–1
}

export const AI_STATE_CONFIGS: Readonly<Record<AIConsciousnessState, AIStateConfig>> = {
  DORMANT: {
    color: '#6366f1',
    animationClass: 'ai-state--dormant',
    breathingDurationMs: 4000,
    label: 'En espera',
    description: 'Respiración mínima, esperando input',
    glowIntensity: 0.15,
  },
  AWARE: {
    color: '#818cf8',
    animationClass: 'ai-state--aware',
    breathingDurationMs: 2500,
    label: 'Activo',
    description: 'Sensores activados, procesando contexto',
    glowIntensity: 0.3,
  },
  ANALYZING: {
    color: '#ec4899',
    animationClass: 'ai-state--analyzing',
    breathingDurationMs: 1200,
    label: 'Analizando',
    description: 'Procesando hallazgos y evidencia',
    glowIntensity: 0.55,
  },
  HYPOTHESIZING: {
    color: '#a855f7',
    animationClass: 'ai-state--hypothesizing',
    breathingDurationMs: 1000,
    label: 'Hipotetizando',
    description: 'Generando múltiples teorías de solución',
    glowIntensity: 0.65,
  },
  EXECUTING: {
    color: '#10b981',
    animationClass: 'ai-state--executing',
    breathingDurationMs: 800,
    label: 'Ejecutando',
    description: 'Aplicando cambios al sistema',
    glowIntensity: 0.7,
  },
  REFLECTING: {
    color: '#38bdf8',
    animationClass: 'ai-state--reflecting',
    breathingDurationMs: 2000,
    label: 'Reflexionando',
    description: 'Evaluando resultados post-acción',
    glowIntensity: 0.4,
  },
  WARNING: {
    color: '#f43f5e',
    animationClass: 'ai-state--warning',
    breathingDurationMs: 600,
    label: 'Alerta',
    description: 'Anomalía crítica detectada',
    glowIntensity: 0.9,
  },
  TEACHING: {
    color: '#f59e0b',
    animationClass: 'ai-state--teaching',
    breathingDurationMs: 3000,
    label: 'Explicando',
    description: 'Compartiendo conocimiento operacional',
    glowIntensity: 0.45,
  },
};

// ── Personality Modes (Cognitive Personas) ───────────────────────────
export type PersonalityMode =
  | 'engineer'
  | 'guardian'
  | 'optimizer'
  | 'oracle'
  | 'surgeon';

export interface PersonalityConfig {
  readonly label: string;
  readonly auraColor: string;
  readonly priorityEngines: string[];
  readonly responseStyle: string;
}

export const PERSONALITY_CONFIGS: Readonly<Record<PersonalityMode, PersonalityConfig>> = {
  engineer: {
    label: 'El Ingeniero',
    auraColor: '#3b82f6',
    priorityEngines: ['code_analysis', 'architecture', 'runtime'],
    responseStyle: 'technical',
  },
  guardian: {
    label: 'El Guardián',
    auraColor: '#ef4444',
    priorityEngines: ['security', 'headers', 'vulnerability'],
    responseStyle: 'protective',
  },
  optimizer: {
    label: 'El Optimizador',
    auraColor: '#10b981',
    priorityEngines: ['performance', 'seo', 'efficiency'],
    responseStyle: 'analytical',
  },
  oracle: {
    label: 'El Oráculo',
    auraColor: '#8b5cf6',
    priorityEngines: ['predictive', 'trends', 'patterns'],
    responseStyle: 'predictive',
  },
  surgeon: {
    label: 'El Cirujano',
    auraColor: '#f8fafc',
    priorityEngines: ['healing', 'patches', 'minimal_fix'],
    responseStyle: 'surgical',
  },
};

// ── Trigger-Based Transitions ───────────────────────────────────────
interface AITransition {
  readonly from: AIConsciousnessState;
  readonly to: AIConsciousnessState;
  readonly trigger: string;
}

const AI_TRANSITIONS: readonly AITransition[] = [
  // DORMANT
  { from: 'DORMANT', to: 'AWARE', trigger: 'USER_INTERACTION' },
  { from: 'DORMANT', to: 'WARNING', trigger: 'CRITICAL_FINDING' },
  { from: 'DORMANT', to: 'ANALYZING', trigger: 'ENGINE_STARTED' },

  // AWARE
  { from: 'AWARE', to: 'ANALYZING', trigger: 'ENGINE_STARTED' },
  { from: 'AWARE', to: 'ANALYZING', trigger: 'FINDINGS_LOADED' },
  { from: 'AWARE', to: 'TEACHING', trigger: 'USER_QUESTION' },
  { from: 'AWARE', to: 'DORMANT', trigger: 'IDLE_TIMEOUT' },
  { from: 'AWARE', to: 'WARNING', trigger: 'CRITICAL_FINDING' },

  // ANALYZING
  { from: 'ANALYZING', to: 'HYPOTHESIZING', trigger: 'ANALYSIS_COMPLETE' },
  { from: 'ANALYZING', to: 'WARNING', trigger: 'CRITICAL_FINDING' },
  { from: 'ANALYZING', to: 'TEACHING', trigger: 'USER_QUESTION' },
  { from: 'ANALYZING', to: 'AWARE', trigger: 'ANALYSIS_IDLE' },

  // HYPOTHESIZING
  { from: 'HYPOTHESIZING', to: 'EXECUTING', trigger: 'STRATEGY_SELECTED' },
  { from: 'HYPOTHESIZING', to: 'TEACHING', trigger: 'USER_QUESTION' },
  { from: 'HYPOTHESIZING', to: 'ANALYZING', trigger: 'NEW_DATA' },
  { from: 'HYPOTHESIZING', to: 'AWARE', trigger: 'HYPOTHESIS_IDLE' },

  // EXECUTING
  { from: 'EXECUTING', to: 'REFLECTING', trigger: 'ACTION_COMPLETE' },
  { from: 'EXECUTING', to: 'WARNING', trigger: 'ACTION_FAILED' },

  // REFLECTING
  { from: 'REFLECTING', to: 'AWARE', trigger: 'REFLECTION_DONE' },
  { from: 'REFLECTING', to: 'ANALYZING', trigger: 'NEW_DATA' },
  { from: 'REFLECTING', to: 'HYPOTHESIZING', trigger: 'NEEDS_REVISION' },

  // WARNING
  { from: 'WARNING', to: 'ANALYZING', trigger: 'ACKNOWLEDGED' },
  { from: 'WARNING', to: 'EXECUTING', trigger: 'AUTO_HEAL' },
  { from: 'WARNING', to: 'AWARE', trigger: 'THREAT_CLEARED' },

  // TEACHING
  { from: 'TEACHING', to: 'AWARE', trigger: 'TEACHING_DONE' },
  { from: 'TEACHING', to: 'ANALYZING', trigger: 'NEW_DATA' },
  { from: 'TEACHING', to: 'WARNING', trigger: 'CRITICAL_FINDING' },
] as const;

// ── Machine ─────────────────────────────────────────────────────────
export interface AIConsciousnessContext {
  cognitiveLoad?: number;
  currentFocus?: string[];
  threatLevel?: ThreatLevel;
  hasFindings?: boolean;
  healingInProgress?: boolean;
  lastUserInteraction?: number;
}

export class AIConsciousnessMachine {
  private _current: AIConsciousnessState = 'DORMANT';
  private _personality: PersonalityMode = 'engineer';
  private _cognitiveLoad: number = 0;
  private _currentFocus: string[] = [];
  private _threatLevel: ThreatLevel = 'none';
  private _hasFindings = false;
  private _healingInProgress = false;
  private _lastUserInteraction: number = Date.now();
  private readonly _listeners: Array<(state: AIConsciousnessState, config: AIStateConfig) => void> = [];
  private _idleTimer: ReturnType<typeof setTimeout> | null = null;
  private static readonly IDLE_TIMEOUT_MS = 30_000;
  
  constructor(context: AIConsciousnessContext = {}) {
    if (context.cognitiveLoad !== undefined) this._cognitiveLoad = context.cognitiveLoad;
    if (context.currentFocus !== undefined) this._currentFocus = context.currentFocus;
    if (context.threatLevel !== undefined) this._threatLevel = context.threatLevel;
    if (context.hasFindings !== undefined) this._hasFindings = context.hasFindings;
    if (context.healingInProgress !== undefined) this._healingInProgress = context.healingInProgress;
    if (context.lastUserInteraction !== undefined) this._lastUserInteraction = context.lastUserInteraction;
  }

  get current(): AIConsciousnessState { return this._current; }
  get config(): AIStateConfig { return AI_STATE_CONFIGS[this._current]; }
  get personality(): PersonalityMode { return this._personality; }
  get personalityConfig(): PersonalityConfig { return PERSONALITY_CONFIGS[this._personality]; }
  get cognitiveLoad(): number { return this._cognitiveLoad; }
  get currentFocus(): readonly string[] { return this._currentFocus; }
  get threatLevel(): ThreatLevel { return this._threatLevel; }

  setPersonality(mode: PersonalityMode): void {
    this._personality = mode;
    this._notify();
  }

  setCognitiveLoad(load: number): void {
    this._cognitiveLoad = Math.max(0, Math.min(100, load));
  }

  setFocus(items: string[]): void {
    this._currentFocus = [...items];
  }

  setThreatLevel(level: ThreatLevel): void {
    const prev = this._threatLevel;
    this._threatLevel = level;
    if ((level === 'critical' || level === 'high') && prev !== level) {
      this.trigger('CRITICAL_FINDING');
    } else if (level === 'none' && this._current === 'WARNING') {
      this.trigger('THREAT_CLEARED');
    }
  }

  trigger(event: string): boolean {
    const match = AI_TRANSITIONS.find(
      (t) => t.from === this._current && t.trigger === event,
    );
    if (!match) return false;

    const prev = this._current;
    this._current = match.to;
    this._resetIdleTimer();
    this._notify();
    console.info(`[AIConsciousness] ${prev} → ${this._current} (${event})`);
    return true;
  }

  forceState(state: AIConsciousnessState): void {
    this._current = state;
    this._resetIdleTimer();
    this._notify();
  }

  onStateChange(cb: (state: AIConsciousnessState, config: AIStateConfig) => void): () => void {
    this._listeners.push(cb);
    return () => {
      const idx = this._listeners.indexOf(cb);
      if (idx >= 0) this._listeners.splice(idx, 1);
    };
  }

  getValidTriggers(): string[] {
    return AI_TRANSITIONS
      .filter((t) => t.from === this._current)
      .map((t) => t.trigger);
  }

  private _notify(): void {
    const config = AI_STATE_CONFIGS[this._current];
    
    // Notify local listeners
    for (const cb of this._listeners) {
      try { cb(this._current, config); } catch (e) { console.error('[AIConsciousness] listener error', e); }
    }
    
    // Emit to global event bus
    eventBus.emit({
      type: 'AI_STATE_CHANGED',
      payload: {
        state: this._current,
        config,
        personality: this._personality,
        cognitiveLoad: this._cognitiveLoad,
        currentFocus: this._currentFocus,
        threatLevel: this._threatLevel
      }
    });
  }

  private _resetIdleTimer(): void {
    if (this._idleTimer !== null) clearTimeout(this._idleTimer);
    if (this._current === 'AWARE') {
      this._idleTimer = setTimeout(() => {
        this.trigger('IDLE_TIMEOUT');
      }, AIConsciousnessMachine.IDLE_TIMEOUT_MS);
    }
  }

  destroy(): void {
    if (this._idleTimer !== null) clearTimeout(this._idleTimer);
    this._listeners.length = 0;
  }
}

// ── Singleton ───────────────────────────────────────────────────────
let _instance: AIConsciousnessMachine | null = null;

export function getAIConsciousness(context?: AIConsciousnessContext): AIConsciousnessMachine {
  if (!_instance) {
    _instance = new AIConsciousnessMachine(context);
  }
  return _instance;
}

export function resetAIConsciousness(): void {
  _instance?.destroy();
  _instance = null;
}
