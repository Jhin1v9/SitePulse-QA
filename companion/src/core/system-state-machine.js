// SitePulse V3 — System Mode Finite State Machine
// 8 states with guarded transitions and side effects.
// ── Transition Table ────────────────────────────────────────────────
const TRANSITIONS = [
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
];
// ── State Machine ───────────────────────────────────────────────────
export class SystemStateMachine {
    _current;
    _context;
    _listeners = [];
    _history = [];
    constructor(initialContext) {
        this._current = initialContext.mode;
        this._context = { ...initialContext };
    }
    get current() {
        return this._current;
    }
    get context() {
        return this._context;
    }
    get history() {
        return this._history;
    }
    updateContext(partial) {
        this._context = { ...this._context, ...partial };
    }
    getValidTransitions() {
        return TRANSITIONS
            .filter((t) => t.from === this._current && t.guard(this._context))
            .map((t) => t.to);
    }
    canTransitionTo(target) {
        return TRANSITIONS.some((t) => t.from === this._current && t.to === target && t.guard(this._context));
    }
    transition(target) {
        const t = TRANSITIONS.find((tr) => tr.from === this._current && tr.to === target && tr.guard(this._context));
        if (!t) {
            console.warn(`[SystemFSM] blocked: ${this._current} → ${target}`, `valid targets: [${this.getValidTransitions().join(', ')}]`);
            return false;
        }
        const from = this._current;
        this._current = target;
        this._context = { ...this._context, mode: target };
        this._history.push({ from, to: target, at: new Date().toISOString() });
        // Keep history bounded
        if (this._history.length > 50)
            this._history.shift();
        console.info(`[SystemFSM] ${from} → ${target}`);
        for (const cb of this._listeners) {
            try {
                cb(from, target, this._context);
            }
            catch (e) {
                console.error('[SystemFSM] listener error', e);
            }
        }
        return true;
    }
    /** Pick the first valid transition by priority (order in TRANSITIONS). */
    autoTransition() {
        const valid = TRANSITIONS.filter((t) => t.from === this._current && t.guard(this._context));
        if (valid.length === 0)
            return false;
        return this.transition(valid[0].to);
    }
    onTransition(cb) {
        this._listeners.push(cb);
        return () => {
            const idx = this._listeners.indexOf(cb);
            if (idx >= 0)
                this._listeners.splice(idx, 1);
        };
    }
}
// ── Singleton ───────────────────────────────────────────────────────
let _instance = null;
export function getSystemFSM() {
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
export function resetSystemFSM() {
    _instance = null;
}
