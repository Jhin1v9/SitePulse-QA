/**
 * ACTION ENGINE TYPES - Semana 14-15 v3.0 Supremo
 */

export type ActionType = 
  | 'scan' 
  | 'test' 
  | 'deploy' 
  | 'configure' 
  | 'remediate' 
  | 'notify' 
  | 'collect'
  | 'analyze';

export type ActionStatus = 
  | 'pending' 
  | 'validating' 
  | 'executing' 
  | 'completed' 
  | 'failed' 
  | 'rolled_back' 
  | 'cancelled';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

export interface Action {
  id: string;
  type: ActionType;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  target: ActionTarget;
  dependencies: string[];
  rollbackAction?: string;
  timeout: number;
  retries: number;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  metadata: ActionMetadata;
}

export interface ActionTarget {
  type: 'url' | 'api' | 'database' | 'server' | 'container' | 'service';
  identifier: string;
  credentials?: CredentialRef;
  environment: 'production' | 'staging' | 'development' | 'testing';
}

export interface CredentialRef {
  id: string;
  type: 'api_key' | 'oauth' | 'certificate' | 'basic_auth';
  scope: string[];
}

export interface ActionMetadata {
  createdAt: Date;
  createdBy: string;
  priority: number;
  tags: string[];
  estimatedDuration: number;
  maxImpact: string;
}

export interface ActionExecution {
  action: Action;
  executionId: string;
  status: ActionStatus;
  startTime?: Date;
  endTime?: Date;
  duration: number;
  result?: ActionResult;
  error?: ActionError;
  auditLog: AuditEntry[];
  checkpoints: Checkpoint[];
}

export interface ActionResult {
  success: boolean;
  output: unknown;
  metrics: ExecutionMetrics;
  artifacts: Artifact[];
  sideEffects: SideEffect[];
  validationResults: ValidationResult[];
}

export interface ExecutionMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkCalls: number;
  diskIO: number;
  duration: number;
}

export interface Artifact {
  id: string;
  type: string;
  name: string;
  path: string;
  size: number;
  checksum: string;
}

export interface SideEffect {
  type: string;
  description: string;
  severity: RiskLevel;
  reversible: boolean;
}

export interface ValidationResult {
  check: string;
  passed: boolean;
  message: string;
  severity: RiskLevel;
}

export interface ActionError {
  code: string;
  message: string;
  stackTrace?: string;
  recoverable: boolean;
  suggestedAction?: string;
}

export interface AuditEntry {
  timestamp: Date;
  event: string;
  actor: string;
  details: Record<string, unknown>;
}

export interface Checkpoint {
  id: string;
  timestamp: Date;
  state: unknown;
  canRollback: boolean;
}

// Circuit Breaker
export interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half_open';
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  threshold: number;
  timeout: number;
}

// Sandbox
export interface SandboxConfig {
  enabled: boolean;
  networkIsolation: boolean;
  filesystemIsolation: boolean;
  resourceLimits: ResourceLimits;
  allowedOperations: string[];
  blockedOperations: string[];
}

export interface ResourceLimits {
  maxCpuPercent: number;
  maxMemoryMB: number;
  maxDiskMB: number;
  maxNetworkMbps: number;
  maxExecutionTime: number;
}

// Execution Plan
export interface ExecutionPlan {
  id: string;
  name: string;
  description: string;
  actions: Action[];
  executionOrder: 'sequential' | 'parallel' | ' DAG';
  dependencies: DependencyGraph;
  rollbackStrategy: RollbackStrategy;
  checkpoints: CheckpointConfig[];
}

export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string; type: 'hard' | 'soft' }>;
}

export interface RollbackStrategy {
  automatic: boolean;
  onFailure: boolean;
  onPartialSuccess: boolean;
  maxRollbackAttempts: number;
  preserveState: boolean;
}

export interface CheckpointConfig {
  afterAction: string;
  persistState: boolean;
  validateBefore: boolean;
}

// Action Registry
export interface ActionHandler {
  type: ActionType;
  name: string;
  description: string;
  validate: (action: Action) => Promise<ValidationResult[]>;
  execute: (action: Action, context: ExecutionContext) => Promise<ActionResult>;
  rollback?: (execution: ActionExecution) => Promise<boolean>;
  estimateImpact: (action: Action) => ImpactEstimate;
}

export interface ExecutionContext {
  executionId: string;
  sandbox: SandboxConfig;
  credentials: Map<string, unknown>;
  variables: Map<string, unknown>;
  checkpoint: (state: unknown) => Promise<void>;
}

export interface ImpactEstimate {
  duration: number;
  resourceUsage: ResourceLimits;
  riskLevel: RiskLevel;
  affectedSystems: string[];
  potentialSideEffects: string[];
}
