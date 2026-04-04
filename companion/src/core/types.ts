// SitePulse V3 — Shared domain types
// All types are erased at compile time; this file produces an empty .js module.

export type UUID = string;
export type Timestamp = string; // ISO 8601

// ── System State Machine ────────────────────────────────────────────
export type SystemMode =
  | 'GENESIS'
  | 'RECONNAISSANCE'
  | 'ANALYSIS'
  | 'SIMULATION'
  | 'HEALING'
  | 'VALIDATION'
  | 'STASIS'
  | 'CRISIS';

// ── AI Consciousness States ─────────────────────────────────────────
export type AIConsciousnessState =
  | 'DORMANT'
  | 'AWARE'
  | 'ANALYZING'
  | 'HYPOTHESIZING'
  | 'EXECUTING'
  | 'REFLECTING'
  | 'WARNING'
  | 'TEACHING';

// ── Threat & Severity ───────────────────────────────────────────────
export type ThreatLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type Severity = 'critical' | 'high' | 'medium' | 'low';

// ── Evidence ────────────────────────────────────────────────────────
export type EvidenceKind =
  | 'log'
  | 'screenshot'
  | 'finding'
  | 'seo'
  | 'runtime_error'
  | 'metric';

export interface Evidence {
  kind: EvidenceKind;
  id: UUID;
  summary?: string;
  path?: string;
  capturedAt?: Timestamp;
}

// ── Findings ────────────────────────────────────────────────────────
export interface Finding {
  id: UUID;
  code: string;
  title: string;
  severity: Severity;
  route: string;
  evidence: Evidence[];
  timestamp: Timestamp;
}

// ── Diff / Patch ────────────────────────────────────────────────────
export interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'context';
  lineNumber: number;
  content: string;
  newLineNumber?: number;
}

export interface DiffHunk {
  startLine: number;
  endLine: number;
  lines: DiffLine[];
}

export interface Diff {
  hunks: DiffHunk[];
  fromFile: string;
  toFile: string;
  summary: string;
}

export interface Patch {
  id: UUID;
  diff: Diff;
  description: string;
  generatedAt: Timestamp;
}

// ── Healing ─────────────────────────────────────────────────────────
export type HealingStage =
  | 'TRIAGE'
  | 'INVESTIGATION'
  | 'STRATEGY'
  | 'GENERATION'
  | 'VALIDATION'
  | 'SIMULATION'
  | 'APPLICATION'
  | 'VERIFICATION'
  | 'DOCUMENTATION';

export type HealingApproach =
  | 'DIRECT_FIX'
  | 'REFACTOR'
  | 'CONFIG_CHANGE'
  | 'DEPENDENCY_UPDATE'
  | 'ARCHITECTURAL_SHIFT';

export type HealingConfidenceMode = 'shadow' | 'staging' | 'autonomous';

export interface HealingStrategy {
  id: UUID;
  approach: HealingApproach;
  confidence: number;
  estimatedRisk: 'low' | 'medium' | 'high';
  filesAffected: string[];
  rollbackComplexity: number;
  description: string;
  patch: Patch;
  efficacy: number;
  elegance: number;
  performanceImpact: number;
}

export interface CodeSnapshot {
  id: UUID;
  timestamp: Timestamp;
  files: Record<string, string>;
  gitHash?: string;
}

export interface HealingSession {
  id: UUID;
  timestamp: Timestamp;
  findingId: UUID;
  strategy: HealingStrategy;
  originalSnapshot: CodeSnapshot;
  result: 'success' | 'partial' | 'failure' | 'rolled_back';
  verificationEvidence?: Record<string, unknown>;
  rollbackAvailable: boolean;
}

// ── Domain Events ───────────────────────────────────────────────────
export type DomainEventType =
  | 'FINDING_DISCOVERED'
  | 'PATCH_GENERATED'
  | 'SECURITY_BREACH_SIMULATED'
  | 'BASELINE_SHIFTED'
  | 'AI_STATE_CHANGED'
  | 'ENGINE_COMPLETED'
  | 'SYSTEM_MODE_CHANGED'
  | 'HEALING_STARTED'
  | 'HEALING_COMPLETED'
  | 'HEALING_ROLLED_BACK'
  | 'PROVIDER_SWITCHED'
  | 'PROVIDER_FAILED';

export interface DomainEvent {
  id: UUID;
  timestamp: Timestamp;
  type: DomainEventType;
  payload: Record<string, unknown>;
  metadata: {
    correlationId: UUID;
    causationId: UUID;
  };
}

// ── System Context ──────────────────────────────────────────────────
export interface SystemContext {
  mode: SystemMode;
  aiState: AIConsciousnessState;
  threatLevel: ThreatLevel;
  hasActiveRun: boolean;
  hasReport: boolean;
  isOnline: boolean;
  activeProviders: string[];
}

// ── AI Provider ─────────────────────────────────────────────────────
export type AIProviderName = 'openai' | 'deepseek' | 'offline';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProviderName;
  tokensUsed: number;
  costEstimate: number;
  latencyMs: number;
}

export interface CostEstimate {
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

export interface CodeContext {
  language: string;
  filePath: string;
  surrounding: string;
  projectType?: string;
}

export interface CodeAnalysis {
  issues: Finding[];
  suggestions: string[];
  confidence: number;
}

// ── Security ────────────────────────────────────────────────────────
export type SurfaceNodeType = 'endpoint' | 'asset' | 'form' | 'api' | 'script';

export interface SurfaceNode {
  id: UUID;
  type: SurfaceNodeType;
  url: string;
  label: string;
  criticalityScore: number;
  pageRank?: number;
}

export interface SurfaceEdge {
  from: UUID;
  to: UUID;
  relation: 'dataflow' | 'call' | 'dependency' | 'redirect';
  weight: number;
}

export interface CoreVulnerabilitySignature {
  id: string;
  name: string;
  cweId: string;
  cweName: string;
  severity: Severity;
  category: 'injection' | 'xss' | 'auth' | 'crypto' | 'config' | 'leak' | 'logic';
  patterns: RegExp[];
  description: string;
  impact: string;
  remediation: string;
  references: string[];
  confidence: number;
}

// ── Knowledge Graph ─────────────────────────────────────────────────
export type KGNodeType = 'file' | 'bug' | 'fix' | 'decision' | 'pattern';
export type KGRelation =
  | 'caused_by'
  | 'fixed_by'
  | 'similar_to'
  | 'depends_on'
  | 'introduced_by'
  | 'mitigated_by';

export interface KGNode {
  id: UUID;
  type: KGNodeType;
  label: string;
  data: Record<string, unknown>;
  weight: number;
  createdAt: Timestamp;
}

export interface KGEdge {
  id: UUID;
  from: UUID;
  to: UUID;
  relation: KGRelation;
  strength: number;
  createdAt: Timestamp;
}
