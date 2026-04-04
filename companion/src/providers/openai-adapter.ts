// SitePulse V3 — OpenAI Provider Adapter
// Implements AIProvider for OpenAI API (GPT-4 family).

import { AIProvider } from './ai-provider.js';
import type { AIProviderStatus } from './ai-provider.js';
import type {
  AIMessage,
  AIRequestOptions,
  AIResponse,
  CostEstimate,
  Finding,
  CodeContext,
  CodeAnalysis,
  Patch,
  UUID,
} from '../core/types.js';

// Pricing per 1M tokens (USD) — GPT-4o as default
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o':      { input: 2.50, output: 10.00 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'gpt-4-turbo': { input: 10.00, output: 30.00 },
};

function generateId(): UUID {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export class OpenAIAdapter extends AIProvider {
  readonly name = 'openai' as const;
  private _apiKey: string;
  private _baseUrl: string;
  private _defaultModel: string;
  private _errorCount = 0;

  constructor(config: { apiKey: string; baseUrl?: string; defaultModel?: string }) {
    super();
    this._apiKey = config.apiKey;
    this._baseUrl = config.baseUrl ?? 'https://api.openai.com/v1';
    this._defaultModel = config.defaultModel ?? 'gpt-4o';
  }

  setApiKey(key: string): void { this._apiKey = key; }

  async chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> {
    const model = options?.model ?? this._defaultModel;
    const start = performance.now();

    const body = {
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
      stream: false,
    };

    const res = await fetch(`${this._baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.buildHeaders(this._apiKey),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      this._errorCount++;
      const errText = await res.text().catch(() => 'unknown');
      throw new Error(`[OpenAI] ${res.status}: ${errText}`);
    }

    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
      model: string;
    };

    const latencyMs = Math.round(performance.now() - start);
    const usage = data.usage;
    const pricing = PRICING[model] ?? PRICING['gpt-4o'];
    const costEstimate =
      (usage.prompt_tokens / 1_000_000) * pricing.input +
      (usage.completion_tokens / 1_000_000) * pricing.output;

    return {
      content: data.choices[0]?.message.content ?? '',
      model: data.model,
      provider: 'openai',
      tokensUsed: usage.total_tokens,
      costEstimate,
      latencyMs,
    };
  }

  async analyzeCode(code: string, context: CodeContext): Promise<CodeAnalysis> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are a code analysis engine for ${context.language} files. Return a JSON object with fields: issues (array of {id, code, title, severity, route, evidence, timestamp}), suggestions (string[]), confidence (0-1). No markdown, just valid JSON.`,
      },
      {
        role: 'user',
        content: `Analyze this code from ${context.filePath}:\n\n${code}\n\nSurrounding context:\n${context.surrounding}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.1, maxTokens: 4096 });
    try {
      return JSON.parse(response.content) as CodeAnalysis;
    } catch {
      return { issues: [], suggestions: [response.content], confidence: 0.3 };
    }
  }

  async generatePatch(finding: Finding, projectContext: string): Promise<Patch> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are a code healing engine. Generate a unified diff patch to fix the described issue. Return JSON: {diff: {hunks, fromFile, toFile, summary}, description}. No markdown wrapping.',
      },
      {
        role: 'user',
        content: `Finding: ${finding.title}\nCode: ${finding.code}\nSeverity: ${finding.severity}\nRoute: ${finding.route}\n\nProject context:\n${projectContext}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.2, maxTokens: 4096 });
    try {
      const parsed = JSON.parse(response.content) as { diff: Patch['diff']; description: string };
      return {
        id: generateId(),
        diff: parsed.diff,
        description: parsed.description,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return {
        id: generateId(),
        diff: { hunks: [], fromFile: '', toFile: '', summary: response.content },
        description: response.content,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  async explainFinding(finding: Finding, language: string): Promise<string> {
    const langMap: Record<string, string> = { es: 'español', en: 'English', pt: 'português' };
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `Explain the following issue to a web engineer in ${langMap[language] ?? language}. Be concise and surgical. Include business impact estimation.`,
      },
      {
        role: 'user',
        content: `Issue: ${finding.title}\nCode: ${finding.code}\nSeverity: ${finding.severity}\nRoute: ${finding.route}`,
      },
    ];

    const response = await this.chat(messages, { temperature: 0.4, maxTokens: 1024 });
    return response.content;
  }

  estimateCost(messages: AIMessage[], options?: AIRequestOptions): CostEstimate {
    const model = options?.model ?? this._defaultModel;
    const inputText = messages.map((m) => m.content).join(' ');
    const inputTokens = this.estimateTokens(inputText);
    const outputTokens = options?.maxTokens ?? 2048;
    const pricing = PRICING[model] ?? PRICING['gpt-4o'];

    return {
      inputTokens,
      outputTokens,
      estimatedCostUsd:
        (inputTokens / 1_000_000) * pricing.input +
        (outputTokens / 1_000_000) * pricing.output,
    };
  }

  async checkHealth(): Promise<AIProviderStatus> {
    const start = performance.now();
    try {
      const res = await fetch(`${this._baseUrl}/models`, {
        headers: this.buildHeaders(this._apiKey),
        signal: AbortSignal.timeout(5000),
      });
      return {
        name: 'openai',
        healthy: res.ok,
        latencyMs: Math.round(performance.now() - start),
        lastCheckedAt: new Date().toISOString(),
        errorCount: this._errorCount,
      };
    } catch {
      this._errorCount++;
      return {
        name: 'openai',
        healthy: false,
        latencyMs: Math.round(performance.now() - start),
        lastCheckedAt: new Date().toISOString(),
        errorCount: this._errorCount,
      };
    }
  }
}
