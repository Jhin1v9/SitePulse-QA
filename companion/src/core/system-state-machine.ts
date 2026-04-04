// SitePulse V3 — System Mode Finite State Machine
// 8 states with guarded transitions and side effects.

import type { SystemMode, SystemContext } from './types.js';
import { eventBus } from './event-bus.js';

export interface Transition {
  from: SystemMode;
  to: SystemMode;
  guard: (context: SystemContext) => boolean;
}

// ── Transition Table ────────────────────────────────────────────────
const TRANSITIONS: readonly Transition[] = [
  // GENESIS — startup
  { from: 'GENESIS', to: 'RECONNAISSANCE', guard: (ctx) => ctx.isOnline },
  { from: 'GENESIS', to: 'STASIS', guard: (ctx) => !ctx.isOnline },

  // RECONNAISSANCE — mapping project
  { from: 'RECONNAISSANCE', to: 'ANALYSIS', guard: (ctx) => ctx.hasReport },
  { from: 'RECONNAISSANCE', to: 'STASIS', guard: (ctx) => !ctx.hasActiveRun && !ctx.hasReport },

  // ANALYSIS — auditing
  { from: 'ANALYSIS', to: 'SIMULATION', guard: (ctx) => ctx.threatLevel === 'high' || ctx.threatLevel === 'critical' },
  { from: 'ANALYSIS', to: 'HEALING', guard: (ctx) => ctx.threatLevel === 'medium' || ctx.threatLevel === 'low' },
  { from: 'ANALYSIS', to: 'STASIS', guard: (ctx) => ctx.threatLevel === 'none' },
  { from: 'ANALYSIS', to: 'CRISIS', guard: (ctx) => ctx.threatLevel === 'critical' },

  // SIMULATION — attack path simulation
  { from: 'SIMULATION', to: 'HEALING', guard: () => true },
  { from: 'SIMULATION', to: 'STASIS', guard: (ctx) => ctx.threatLevel === 'none' },

  // HEALING — applying patches
  { from: 'HEALING', to: 'VALIDATION', guard: () => true },

  // VALIDATION — re-audit after healing
  { from: 'VALIDATION', to: 'STASIS', guard: (ctx) => ctx.threatLevel === 'none' },
  { from: 'VALIDATION', to: 'CRISIS', guard: (ctx) => ctx.threatLevel === 'critical' },
  { from: 'VALIDATION', to: 'ANALYSIS', guard: (ctx) => ctx.threatLevel !== 'none' && ctx.threatLevel !== 'critical' },

  // STASIS — monitoring
  { from: 'STASIS', to: 'RECONNAISSANCE', guard: (ctx) => ctx.hasActiveRun },
  { from: 'STASIS', to: 'CRISIS', guard: (ctx) => ctx.threatLevel === 'critical' },
  { from: 'STASIS', to: 'ANALYSIS', guard: (ctx) => ctx.hasReport },

  // CRISIS — critical regression
  { from: 'CRISIS', to: 'HEALING', guard: (ctx) => ctx.isOnline },
  { from: 'CRISIS', to: 'STASIS', guard: (ctx) => ctx.threatLevel === 'none' },
] as const;

// ── State Machine ───────────────────────────────────────────────────
export class SystemStateMachine {
  private _current: SystemMode;
  private _context: SystemContext;
  private readonly _listeners: Array<(from: SystemMode, to: SystemMode, context: SystemContext) => void> = [];
  private readonly _history: Array<{ from: SystemMode; to: SystemMode; at: string }> = [];

  constructor(initialContext: SystemContext) {
    this._current = initialContext.mode;
    this._context = { ...initialContext };
  }

  get current(): SystemMode {
    return this._current;
  }

  get context(): Readonly<SystemContext> {
    return this._context;
  }

  get history(): ReadonlyArray<{ from: SystemMode; to: SystemMode; at: string }> {
    return this._history;
  }

  updateContext(partial: Partial<SystemContext>): void {
    this._context = { ...this._context, ...partial };
  }

  getValidTransitions(): SystemMode[] {
    return TRANSITIONS
      .filter((t) => t.from === this._current && t.guard(this._context))
      .map((t) => t.to);
  }

  canTransitionTo(target: SystemMode): boolean {
    return TRANSITIONS.some(
      (t) => t.from === this._current && t.to === target && t.guard(this._context),
    );
  }

  transition(target: SystemMode): boolean {
    const t = TRANSITIONS.find(
      (tr) => tr.from === this._current && tr.to === target && tr.guard(this._context),
    );

    if (!t) {
      console.warn(
        `[SystemFSM] blocked: ${this._current} → ${target}`,
        `valid targets: [${this.getValidTransitions().join(', ')}]`,
      );
      return false;
    }

    const from = this._current;
    this._current = target;
    this._context = { ...this._context, mode: target };
    this._history.push({ from, to: target, at: new Date().toISOString() });

    // Keep history bounded
    if (this._history.length > 50) this._history.shift();

    console.info(`[SystemFSM] ${from} → ${target}`);
    
    // Notify local listeners
    for (const cb of this._listeners) {
      try { cb(from, target, this._context); } catch (e) { console.error('[SystemFSM] listener error', e); }
    }
    
    // Emit to global event bus
    eventBus.emit({
      type: 'SYSTEM_MODE_CHANGED',
      payload: {
        from,
        to: target,
        context: this._context
      }
    });
    
    return true;
  }

  /** Pick the first valid transition by priority (order in TRANSITIONS). */
  autoTransition(): boolean {
    const valid = TRANSITIONS.filter(
      (t) => t.from === this._current && t.guard(this._context),
    );
    if (valid.length === 0) return false;
    return this.transition(valid[0].to);
  }

  onTransition(cb: (from: SystemMode, to: SystemMode, context: SystemContext) => void): () => void {
    this._listeners.push(cb);
    return () => {
      const idx = this._listeners.indexOf(cb);
      if (idx >= 0) this._listeners.splice(idx, 1);
    };
  }
}

// ── Singleton ───────────────────────────────────────────────────────
let _instance: SystemStateMachine | null = null;

export function getSystemFSM(): SystemStateMachine {
  if (!_instance) {
    _instance = new SystemStateMachine({
      mode: 'GENESIS',
      aiState: 'DORMANT',
      threatLevel: 'none',
      hasActiveRun: false,
      hasReport: false,
      isOnline: true,
      activeProviders: [],
    });
  }
  return _instance;
}

export function resetSystemFSM(): void {
  _instance = null;
}
