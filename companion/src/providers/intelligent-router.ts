// SitePulse V3 — Intelligent Provider Router
// Routes AI tasks to the optimal provider based on heuristics.

import type { AIProvider, AIProviderStatus } from './ai-provider.js';
import type { AIProviderName, AIMessage, AIRequestOptions } from '../core/types.js';
import { eventBus } from '../core/event-bus.js';

export type AITaskType =
  | 'CHAT'
  | 'CODE_ANALYSIS'
  | 'PATCH_GENERATION'
  | 'EXPLANATION'
  | 'SECURITY_ANALYSIS';

export interface RouteDecision {
  provider: AIProviderName;
  reason: string;
  fallbackChain: AIProviderName[];
}

interface ProviderMetrics {
  avgLatencyMs: number;
  successRate: number;
  totalRequests: number;
  lastError: string | null;
}

export class IntelligentRouter {
  private readonly _providers = new Map<AIProviderName, AIProvider>();
  private readonly _metrics = new Map<AIProviderName, ProviderMetrics>();
  private readonly _healthCache = new Map<AIProviderName, AIProviderStatus>();
  private _defaultProvider: AIProviderName = 'deepseek';

  register(provider: AIProvider): void {
    this._providers.set(provider.name, provider);
    this._metrics.set(provider.name, {
      avgLatencyMs: 0,
      successRate: 1,
      totalRequests: 0,
      lastError: null,
    });
  }

  setDefault(name: AIProviderName): void {
    this._defaultProvider = name;
  }

  getProvider(name: AIProviderName): AIProvider | undefined {
    return this._providers.get(name);
  }

  route(taskType: AITaskType, complexity: number, tokenEstimate: number): RouteDecision {
    // Heuristic routing rules:
    // 1. Critical/complex tasks → OpenAI (more capable)
    // 2. Long context / cheap tasks → DeepSeek (cost-efficient)
    // 3. Fallback by latency and health

    const deepseekHealthy = this._isHealthy('deepseek');
    const openaiHealthy = this._isHealthy('openai');
    const deepseekMetrics = this._metrics.get('deepseek');
    const deepseekSlow = (deepseekMetrics?.avgLatencyMs ?? 0) > 2000;

    // Code generation + high complexity → OpenAI
    if (taskType === 'PATCH_GENERATION' && complexity > 7) {
      return {
        provider: openaiHealthy ? 'openai' : (deepseekHealthy ? 'deepseek' : 'offline'),
        reason: 'high-complexity patch generation requires stronger model',
        fallbackChain: ['openai', 'deepseek', 'offline'],
      };
    }

    // Security analysis → OpenAI (safer for critical tasks)
    if (taskType === 'SECURITY_ANALYSIS') {
      return {
        provider: openaiHealthy ? 'openai' : (deepseekHealthy ? 'deepseek' : 'offline'),
        reason: 'security analysis routed to most reliable provider',
        fallbackChain: ['openai', 'deepseek', 'offline'],
      };
    }

    // Long context (>4000 tokens) → DeepSeek (cheaper)
    if (tokenEstimate > 4000 && deepseekHealthy && !deepseekSlow) {
      return {
        provider: 'deepseek',
        reason: 'long context routed to cost-efficient provider',
        fallbackChain: ['deepseek', 'openai', 'offline'],
      };
    }

    // DeepSeek slow → fallback to OpenAI
    if (deepseekSlow && openaiHealthy) {
      return {
        provider: 'openai',
        reason: 'DeepSeek latency > 2000ms, fallback to OpenAI',
        fallbackChain: ['openai', 'deepseek', 'offline'],
      };
    }

    // Default cascade: DeepSeek (cheap) → OpenAI → Offline
    if (deepseekHealthy) {
      return {
        provider: 'deepseek',
        reason: 'default route to cost-efficient provider',
        fallbackChain: ['deepseek', 'openai', 'offline'],
      };
    }

    if (openaiHealthy) {
      return {
        provider: 'openai',
        reason: 'DeepSeek unavailable, fallback to OpenAI',
        fallbackChain: ['openai', 'offline'],
      };
    }

    return {
      provider: 'offline',
      reason: 'all providers unavailable — offline mode',
      fallbackChain: ['offline'],
    };
  }

  recordSuccess(name: AIProviderName, latencyMs: number): void {
    const m = this._metrics.get(name);
    if (!m) return;
    m.totalRequests++;
    m.avgLatencyMs = m.avgLatencyMs * 0.8 + latencyMs * 0.2; // EMA
    m.successRate = (m.successRate * (m.totalRequests - 1) + 1) / m.totalRequests;
  }

  recordFailure(name: AIProviderName, error: string): void {
    const m = this._metrics.get(name);
    if (!m) return;
    m.totalRequests++;
    m.successRate = (m.successRate * (m.totalRequests - 1)) / m.totalRequests;
    m.lastError = error;

    eventBus.emit({
      type: 'PROVIDER_FAILED',
      payload: { provider: name, error },
    });
  }

  async refreshHealth(): Promise<void> {
    const checks = Array.from(this._providers.entries()).map(
      async ([name, provider]) => {
        try {
          const status = await provider.checkHealth();
          this._healthCache.set(name, status);
        } catch {
          this._healthCache.set(name, {
            name,
            healthy: false,
            latencyMs: -1,
            lastCheckedAt: new Date().toISOString(),
            errorCount: (this._metrics.get(name)?.totalRequests ?? 0),
          });
        }
      },
    );
    await Promise.allSettled(checks);
  }

  getMetrics(): Record<string, ProviderMetrics> {
    const result: Record<string, ProviderMetrics> = {};
    for (const [name, m] of this._metrics) {
      result[name] = { ...m };
    }
    return result;
  }

  private _isHealthy(name: AIProviderName): boolean {
    if (!this._providers.has(name)) return false;
    const cached = this._healthCache.get(name);
    if (!cached) return true; // Assume healthy until proven otherwise
    return cached.healthy;
  }
}
