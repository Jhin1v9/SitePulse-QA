// SitePulse V3 — Typed Domain Event Bus
// Central nervous system: typed pub/sub with DataBridge interop.
// ── Helpers ─────────────────────────────────────────────────────────
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function getDataBridge() {
    if (typeof window === 'undefined')
        return null;
    const w = window;
    const bridge = w['workspaceDataBridge'];
    if (bridge && typeof bridge.write === 'function') {
        return bridge;
    }
    return null;
}
// ── Event Bus ───────────────────────────────────────────────────────
class EventBus {
    _handlers = new Map();
    _wildcardHandlers = new Set();
    _recentEvents = [];
    static MAX_RECENT = 100;
    emit(input) {
        const correlationId = input.correlationId ?? generateId();
        const event = {
            id: generateId(),
            timestamp: new Date().toISOString(),
            type: input.type,
            payload: input.payload,
            metadata: {
                correlationId,
                causationId: input.causationId ?? correlationId,
            },
        };
        // Persist in recent log
        this._recentEvents.push(event);
        if (this._recentEvents.length > EventBus.MAX_RECENT) {
            this._recentEvents.shift();
        }
        console.debug(`[EventBus] ${event.type}`, event.payload);
        // DataBridge interop (write event so existing MutationObserver-based code can react)
        const bridge = getDataBridge();
        if (bridge) {
            try {
                bridge.write(`__event__${event.type}`, JSON.stringify(event));
            }
            catch { /* silent */ }
        }
        // Dispatch to typed handlers
        const handlers = this._handlers.get(event.type);
        if (handlers) {
            for (const h of handlers) {
                try {
                    h(event);
                }
                catch (e) {
                    console.error(`[EventBus] handler error on ${event.type}`, e);
                }
            }
        }
        // Dispatch to wildcard handlers
        for (const h of this._wildcardHandlers) {
            try {
                h(event);
            }
            catch (e) {
                console.error('[EventBus] wildcard handler error', e);
            }
        }
        return event;
    }
    on(type, handler) {
        if (!this._handlers.has(type)) {
            this._handlers.set(type, new Set());
        }
        this._handlers.get(type).add(handler);
        return () => { this._handlers.get(type)?.delete(handler); };
    }
    onAny(handler) {
        this._wildcardHandlers.add(handler);
        return () => { this._wildcardHandlers.delete(handler); };
    }
    off(type, handler) {
        this._handlers.get(type)?.delete(handler);
    }
    offAll(type) {
        if (type) {
            this._handlers.delete(type);
        }
        else {
            this._handlers.clear();
            this._wildcardHandlers.clear();
        }
    }
    /** Get the last N events, optionally filtered by type. */
    recent(count = 20, type) {
        const source = type
            ? this._recentEvents.filter((e) => e.type === type)
            : this._recentEvents;
        return source.slice(-count);
    }
}
// ── Singleton ───────────────────────────────────────────────────────
export const eventBus = new EventBus();
