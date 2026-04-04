/**
 * TIPOS BASE PARA TODOS OS ENGINES SUPREMO v3.0
 * SitePulse Studio - All Engines Supremo
 */

// ============================================================================
// TIPOS FUNDAMENTAIS
// ============================================================================

export type EngineStatus = 'initializing' | 'ready' | 'busy' | 'error' | 'shutdown';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ConfidenceLevel = 'certain' | 'high' | 'medium' | 'low' | 'uncertain';

export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Identifiable {
  id: string;
  version: string;
  correlationId: string;
}

// ============================================================================
// CONFIGURAÇÃO BASE
// ============================================================================

export interface EngineConfig {
  name: string;
  version: string;
  enabled: boolean;
  logging: LogConfig;
  performance: PerformanceConfig;
  security: SecurityConfig;
}

export interface LogConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  destination: 'console' | 'file' | 'remote' | 'all';
  format: 'json' | 'pretty' | 'structured';
  retention: number; // dias
}

export interface PerformanceConfig {
  maxConcurrency: number;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  cacheEnabled: boolean;
  cacheTtlMs: number;
}

export interface SecurityConfig {
  encryptionEnabled: boolean;
  auditLogEnabled: boolean;
  maxInputSize: number;
  sanitizeInput: boolean;
  rateLimiting: RateLimitConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
}

// ============================================================================
// MÉTRICAS E SAÚDE
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  checks: HealthCheck[];
  uptime: number; // segundos
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  responseTime: number;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface EngineMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  lastUpdated: Date;
}

// ============================================================================
// INTERFACE BASE DO ENGINE
// ============================================================================

export interface EngineBase {
  readonly name: string;
  readonly version: string;
  readonly status: EngineStatus;

  initialize(config: EngineConfig): Promise<void>;
  health(): Promise<HealthStatus>;
  getMetrics(): EngineMetrics;
  shutdown(): Promise<void>;
  reset(): Promise<void>;
}

// ============================================================================
// UTILITÁRIOS DE TIPO
// ============================================================================

export type AsyncResult<T, E = Error> = 
  | { success: true; data: T; metadata?: Record<string, unknown> }
  | { success: false; error: E; code: string; recoverable: boolean };

export type EventHandler<T> = (event: T) => void | Promise<void>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface TimeRange {
  start: Date;
  end: Date;
  timezone?: string;
}

// ============================================================================
// EVENTOS DO SISTEMA
// ============================================================================

export interface SystemEvent extends Identifiable, Timestamped {
  type: string;
  source: string;
  payload: unknown;
  priority: SeverityLevel;
}

export interface EngineEvent extends SystemEvent {
  engineName: string;
  operation: string;
  duration: number;
  success: boolean;
}
