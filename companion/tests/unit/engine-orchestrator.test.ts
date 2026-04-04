/**
 * Unit Tests - Supreme Engine Orchestrator
 * SitePulse Studio v3.0
 */

import { SupremeEngineOrchestrator } from '../../src/bridge/engine-orchestrator';
import type { OrchestratorConfig, UserInput } from '../../src/shared/types';

describe('SupremeEngineOrchestrator', () => {
  let orchestrator: SupremeEngineOrchestrator;

  beforeEach(() => {
    orchestrator = new SupremeEngineOrchestrator();
  });

  afterEach(async () => {
    await orchestrator.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(orchestrator.name).toBe('SupremeEngineOrchestrator');
      expect(orchestrator.version).toBe('3.0.0');
    });

    it('should start with initializing status', () => {
      expect(orchestrator.status).toBe('initializing');
    });

    it('should initialize successfully with valid config', async () => {
      const config: OrchestratorConfig = {
        engines: {
          intent: { name: 'intent', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          context: { name: 'context', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          evidence: { name: 'evidence', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          memory: { name: 'memory', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          learning: { name: 'learning', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          decision: { name: 'decision', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          action: { name: 'action', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          predictive: { name: 'predictive', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          autonomous: { name: 'autonomous', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          security: { name: 'security', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
        },
        features: {
          parallelExecution: true,
          cacheEnabled: true,
          securityValidation: true,
          explainability: true,
          humanInTheLoop: false,
        },
        limits: {
          maxProcessingTime: 30000,
          maxContextLength: 100000,
          maxActionsPerRequest: 10,
        },
      };

      await orchestrator.initialize(config);
      expect(orchestrator.status).toBe('ready');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const health = await orchestrator.health();
      
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('lastCheck');
      expect(health).toHaveProperty('checks');
      expect(health).toHaveProperty('uptime');
      expect(health.checks).toBeInstanceOf(Array);
    });
  });

  describe('Metrics', () => {
    it('should return metrics object', () => {
      const metrics = orchestrator.getMetrics();
      
      expect(metrics).toHaveProperty('totalRequests');
      expect(metrics).toHaveProperty('successfulRequests');
      expect(metrics).toHaveProperty('failedRequests');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('errorRate');
    });
  });

  describe('Request Processing', () => {
    it('should process user request and return response', async () => {
      const config: OrchestratorConfig = {
        engines: {
          intent: { name: 'intent', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          context: { name: 'context', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          evidence: { name: 'evidence', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          memory: { name: 'memory', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          learning: { name: 'learning', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          decision: { name: 'decision', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          action: { name: 'action', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          predictive: { name: 'predictive', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          autonomous: { name: 'autonomous', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          security: { name: 'security', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
        },
        features: {
          parallelExecution: true,
          cacheEnabled: true,
          securityValidation: true,
          explainability: true,
          humanInTheLoop: false,
        },
        limits: {
          maxProcessingTime: 30000,
          maxContextLength: 100000,
          maxActionsPerRequest: 10,
        },
      };

      await orchestrator.initialize(config);

      const input: UserInput = {
        id: 'test-input-1',
        content: 'Run security scan on example.com',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-correlation-1',
      };

      const response = await orchestrator.processUserRequest(input);

      expect(response).toHaveProperty('requestId');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('intent');
      expect(response).toHaveProperty('context');
      expect(response).toHaveProperty('decision');
      expect(response).toHaveProperty('response');
      expect(response.input.id).toBe(input.id);
    });
  });

  describe('Security Scans', () => {
    it('should run security scan', async () => {
      const config: OrchestratorConfig = {
        engines: {
          intent: { name: 'intent', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          context: { name: 'context', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          evidence: { name: 'evidence', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          memory: { name: 'memory', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          learning: { name: 'learning', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          decision: { name: 'decision', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          action: { name: 'action', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          predictive: { name: 'predictive', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          autonomous: { name: 'autonomous', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
          security: { name: 'security', version: '1.0', enabled: true, logging: { level: 'info', destination: 'console', format: 'json', retention: 30 }, performance: { maxConcurrency: 10, timeoutMs: 5000, retryAttempts: 3, retryDelayMs: 1000, cacheEnabled: true, cacheTtlMs: 3600000 }, security: { encryptionEnabled: true, auditLogEnabled: true, maxInputSize: 10000000, sanitizeInput: true, rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 } } },
        },
        features: {
          parallelExecution: true,
          cacheEnabled: true,
          securityValidation: true,
          explainability: true,
          humanInTheLoop: false,
        },
        limits: {
          maxProcessingTime: 30000,
          maxContextLength: 100000,
          maxActionsPerRequest: 10,
        },
      };

      await orchestrator.initialize(config);

      const scanConfig = {
        target: {
          id: 'test-target-1',
          url: 'https://example.com',
          name: 'Example Site',
          type: 'web' as const,
          scope: 'single' as const,
        },
        scanTypes: ['sqli', 'xss', 'headers'] as const,
        intensity: 'passive' as const,
        complianceFrameworks: ['owasp10'] as const,
        scope: {
          includePaths: [],
          excludePaths: [],
          maxDepth: 3,
          maxPages: 100,
          respectRobotsTxt: true,
          followRedirects: true,
        },
      };

      const result = await orchestrator.runSecurityScan(scanConfig);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('config');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('vulnerabilitiesFound');
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', async () => {
      await orchestrator.shutdown();
      expect(orchestrator.status).toBe('shutdown');
    });
  });
});
