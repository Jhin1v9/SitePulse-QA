// SitePulse V3 — Provider Registry
// Cascading provider management with automatic fallback.

import type { AIProvider } from './ai-provider.js';
import { IntelligentRouter } from './intelligent-router.js';
import type { AITaskType } from './intelligent-router.js';
import type {
  AIProviderName,
  AIMessage,
  AIRequestOptions,
  AIResponse,
} from '../core/types.js';
import { eventBus } from '../core/event-bus.js';
import { getSystemFSM } from '../core/system-state-machine.js';

// ── Offline fallback (heuristic-only, no API) ───────────────────────
class OfflineProvider {
  readonly name: AIProviderName = 'offline';

  chat(messages: AIMessage[]): AIResponse {
    const lastUser = messages.filter((m) => m.role === 'user').pop();
    return {
      content: `[Modo offline] No hay proveedores de IA disponibles. Consulta original: "${lastUser?.content.slice(0, 80) ?? ''}..."`,
      model: 'offline-heuristic',
      provider: 'offline',
      tokensUsed: 0,
      costEstimate: 0,
      latencyMs: 0,
    };
  }
}

// ── Registry ────────────────────────────────────────────────────────
export class ProviderRegistry {
  private readonly _router = new IntelligentRouter();
  private readonly _offline = new OfflineProvider();
  private _totalCostUsd = 0;
  private _totalTokens = 0;

  get router(): IntelligentRouter { return this._router; }
  get totalCostUsd(): number { return this._totalCostUsd; }
  get totalTokens(): number { return this._totalTokens; }

  registerProvider(provider: AIProvider): void {
    this._router.register(provider);
    console.info(`[ProviderRegistry] registered: ${provider.name}`);
  }

  async chat(
    messages: AIMessage[],
    taskType: AITaskType = 'CHAT',
    complexity: number = 5,
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    const tokenEstimate = messages.reduce(
      (sum, m) => sum + Math.ceil(m.content.length / 3.5), 0,
    );

    const decision = this._router.route(taskType, complexity, tokenEstimate);

    // Try each provider in the fallback chain
    for (const providerName of decision.fallbackChain) {
      if (providerName === 'offline') {
        const response = this._offline.chat(messages);
        this._enterStasisIfNeeded();
        return response;
      }

      const provider = this._router.getProvider(providerName);
      if (!provider) continue;

      try {
        const response = await provider.chat(messages, options);

        this._router.recordSuccess(providerName, response.latencyMs);
        this._totalCostUsd += response.costEstimate;
        this._totalTokens += response.tokensUsed;

        if (providerName !== decision.fallbackChain[0]) {
          eventBus.emit({
            type: 'PROVIDER_SWITCHED',
            payload: {
              from: decision.fallbackChain[0],
              to: providerName,
              reason: decision.reason,
            },
          });
        }

        return response;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        this._router.recordFailure(providerName, errMsg);
        console.warn(`[ProviderRegistry] ${providerName} failed: ${errMsg}, trying next...`);
      }
    }

    // All failed → offline mode
    const response = this._offline.chat(messages);
    this._enterStasisIfNeeded();
    return response;
  }

  async refreshAllHealth(): Promise<void> {
    await this._router.refreshHealth();
  }

  getStats(): {
    totalCostUsd: number;
    totalTokens: number;
    metrics: Record<string, unknown>;
  } {
    return {
      totalCostUsd: this._totalCostUsd,
      totalTokens: this._totalTokens,
      metrics: this._router.getMetrics(),
    };
  }

  private _enterStasisIfNeeded(): void {
    const fsm = getSystemFSM();
    fsm.updateContext({ activeProviders: [], isOnline: false });
    if (fsm.canTransitionTo('STASIS')) {
      fsm.transition('STASIS');
      console.warn('[ProviderRegistry] all providers failed — entered STASIS mode');
    }
  }
}

// ── Singleton ───────────────────────────────────────────────────────
let _registry: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!_registry) {
    _registry = new ProviderRegistry();
  }
  return _registry;
}

export function resetProviderRegistry(): void {
  _registry = null;
}
