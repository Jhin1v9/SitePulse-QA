// SitePulse V3 — Typed Domain Event Bus
// Central nervous system: typed pub/sub with DataBridge interop.

import type { DomainEvent, DomainEventType, UUID } from './types.js';

// ── Helpers ─────────────────────────────────────────────────────────
function generateId(): UUID {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Types ───────────────────────────────────────────────────────────
export type EventHandler = (event: DomainEvent) => void;

export interface EmitInput {
  type: DomainEventType;
  payload: Record<string, unknown>;
  correlationId?: UUID;
  causationId?: UUID;
}

// ── DataBridge Interop ──────────────────────────────────────────────
interface DataBridgeCompat {
  write: (key: string, value: unknown) => void;
}

function getDataBridge(): DataBridgeCompat | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  const bridge = w['workspaceDataBridge'];
  if (bridge && typeof (bridge as DataBridgeCompat).write === 'function') {
    return bridge as DataBridgeCompat;
  }
  return null;
}

// ── Event Bus ───────────────────────────────────────────────────────
export class EventBus {
  private readonly _handlers = new Map<DomainEventType, Set<EventHandler>>();
  private readonly _wildcardHandlers = new Set<EventHandler>();
  private readonly _recentEvents: DomainEvent[] = [];
  private static readonly MAX_RECENT = 100;

  emit(input: EmitInput): DomainEvent {
    const correlationId = input.correlationId ?? generateId();
    const event: DomainEvent = {
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
      try { bridge.write(`__event__${event.type}`, JSON.stringify(event)); } catch { /* silent */ }
    }

    // Dispatch to typed handlers
    const handlers = this._handlers.get(event.type);
    if (handlers) {
      for (const h of handlers) {
        try { h(event); } catch (e) { console.error(`[EventBus] handler error on ${event.type}`, e); }
      }
    }

    // Dispatch to wildcard handlers
    for (const h of this._wildcardHandlers) {
      try { h(event); } catch (e) { console.error('[EventBus] wildcard handler error', e); }
    }

    return event;
  }

  on(type: DomainEventType, handler: EventHandler): () => void {
    if (!this._handlers.has(type)) {
      this._handlers.set(type, new Set());
    }
    this._handlers.get(type)!.add(handler);
    return () => { this._handlers.get(type)?.delete(handler); };
  }

  onAny(handler: EventHandler): () => void {
    this._wildcardHandlers.add(handler);
    return () => { this._wildcardHandlers.delete(handler); };
  }

  off(type: DomainEventType, handler: EventHandler): void {
    this._handlers.get(type)?.delete(handler);
  }

  offAll(type?: DomainEventType): void {
    if (type) {
      this._handlers.delete(type);
    } else {
      this._handlers.clear();
      this._wildcardHandlers.clear();
    }
  }

  /** Get the last N events, optionally filtered by type. */
  recent(count: number = 20, type?: DomainEventType): readonly DomainEvent[] {
    const source = type
      ? this._recentEvents.filter((e) => e.type === type)
      : this._recentEvents;
    return source.slice(-count);
  }
}

// ── Singleton ───────────────────────────────────────────────────────
export const eventBus = new EventBus();
