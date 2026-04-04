// SitePulse V3 — Abstract AI Provider
// Defines the contract all AI providers must implement.

import type {
  AIProviderName,
  AIMessage,
  AIRequestOptions,
  AIResponse,
  CostEstimate,
  Finding,
  CodeContext,
  CodeAnalysis,
  Patch,
} from '../core/types.js';

export interface AIProviderStatus {
  name: AIProviderName;
  healthy: boolean;
  latencyMs: number;
  lastCheckedAt: string;
  errorCount: number;
}

export abstract class AIProvider {
  abstract readonly name: AIProviderName;

  abstract chat(messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse>;

  abstract analyzeCode(code: string, context: CodeContext): Promise<CodeAnalysis>;

  abstract generatePatch(finding: Finding, projectContext: string): Promise<Patch>;

  abstract explainFinding(finding: Finding, language: string): Promise<string>;

  abstract estimateCost(messages: AIMessage[], options?: AIRequestOptions): CostEstimate;

  abstract checkHealth(): Promise<AIProviderStatus>;

  protected buildHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
  }

  protected estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 chars for English, 2 chars for code
    return Math.ceil(text.length / 3.5);
  }
}
