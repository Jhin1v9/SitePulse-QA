import {
  SupremeActionEngine,
  CircuitBreaker,
  CheckpointManager,
  RollbackManager,
  SandboxExecutor,
  Action,
  ActionHandler,
  ActionStatus,
  ExecutionContext,
  ActionExecution,
} from '../index';

describe('SupremeActionEngine', () => {
  let engine: SupremeActionEngine;

  const mockHandler: ActionHandler = {
    type: 'scan',
    name: 'Test Scan Handler',
    description: 'Handler for testing',
    validate: async () => [{ check: 'test', passed: true, message: 'OK', severity: 'low' }],
    execute: async (action, context) => ({
      success: true,
      output: { scanned: true },
      metrics: { cpuUsage: 10, memoryUsage: 100, networkCalls: 1, diskIO: 0, duration: 100 },
      artifacts: [],
      sideEffects: [],
      validationResults: [],
    }),
    rollback: async () => true,
    estimateImpact: () => ({
      duration: 100,
      resourceUsage: { maxCpuPercent: 50, maxMemoryMB: 256, maxDiskMB: 10, maxNetworkMbps: 1, maxExecutionTime: 5000 },
      riskLevel: 'low' as const,
      affectedSystems: ['test'],
      potentialSideEffects: [],
    }),
  };

  beforeEach(() => {
    engine = new SupremeActionEngine();
    engine.registerHandler(mockHandler);
  });

  afterEach(() => {
    engine.clear();
  });

  describe('Basic Operations', () => {
    test('should register handler', () => {
      const handler: ActionHandler = {
        type: 'test',
        name: 'Test',
        description: 'Test handler',
        validate: async () => [],
        execute: async () => ({ success: true, output: {}, metrics: {} as any, artifacts: [], sideEffects: [], validationResults: [] }),
        estimateImpact: () => ({ duration: 0, resourceUsage: {} as any, riskLevel: 'low', affectedSystems: [], potentialSideEffects: [] }),
      };

      engine.registerHandler(handler);
      expect(engine.getStats().handlers).toBe(2);
    });

    test('should execute action', async () => {
      const action: Action = {
        id: 'test-1',
        type: 'scan',
        name: 'Test Scan',
        description: 'Test',
        parameters: {},
        target: { type: 'url', identifier: 'http://test.com', environment: 'testing' },
        dependencies: [],
        timeout: 5000,
        retries: 0,
        riskLevel: 'low',
        requiresApproval: false,
        metadata: { createdAt: new Date(), createdBy: 'test', priority: 1, tags: [], estimatedDuration: 100, maxImpact: 'none' },
      };

      const execution = await engine.executeAction(action);

      expect(execution).toBeDefined();
      expect(execution.status).toBe('completed');
      expect(execution.result?.success).toBe(true);
    });

    test('should track executions', async () => {
      const action: Action = {
        id: 'test-2',
        type: 'scan',
        name: 'Test',
        description: 'Test',
        parameters: {},
        target: { type: 'url', identifier: 'test', environment: 'testing' },
        dependencies: [],
        timeout: 5000,
        retries: 0,
        riskLevel: 'low',
        requiresApproval: false,
        metadata: { createdAt: new Date(), createdBy: 'test', priority: 1, tags: [], estimatedDuration: 100, maxImpact: 'none' },
      };

      await engine.executeAction(action);

      const stats = engine.getStats();
      expect(stats.totalExecutions).toBe(1);
      expect(stats.completed).toBe(1);
    });
  });

  describe('Circuit Breaker', () => {
    test('should create circuit breaker', () => {
      const cb = new CircuitBreaker('test', 3, 1000);
      expect(cb.getState().status).toBe('closed');
    });

    test('should open circuit after failures', async () => {
      const cb = new CircuitBreaker('test', 2, 1000);

      // Primeira falha
      await expect(cb.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
      expect(cb.getState().status).toBe('closed');

      // Segunda falha - deve abrir
      await expect(cb.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
      expect(cb.getState().status).toBe('open');

      // Tentativa em circuito aberto
      await expect(cb.execute(async () => 'success')).rejects.toThrow('Circuit breaker');
    });

    test('should reset circuit breaker', async () => {
      const cb = new CircuitBreaker('test', 1, 1000);
      await expect(cb.execute(async () => { throw new Error('fail'); })).rejects.toThrow();
      expect(cb.getState().status).toBe('open');

      cb.reset();
      expect(cb.getState().status).toBe('closed');
    });
  });

  describe('Checkpoint Manager', () => {
    test('should create checkpoint', async () => {
      const cm = new CheckpointManager();
      const checkpoint = await cm.createCheckpoint('exec-1', { data: 'test' });

      expect(checkpoint).toBeDefined();
      expect(checkpoint.id).toBeDefined();
      expect(checkpoint.canRollback).toBe(true);
    });

    test('should restore checkpoint', async () => {
      const cm = new CheckpointManager();
      const state = { data: 'original' };
      const checkpoint = await cm.createCheckpoint('exec-1', state);

      const restored = await cm.restoreToCheckpoint('exec-1', checkpoint.id);
      expect(restored).toEqual(state);
    });

    test('should get checkpoint count', async () => {
      const cm = new CheckpointManager();
      await cm.createCheckpoint('exec-1', { data: 1 });
      await cm.createCheckpoint('exec-1', { data: 2 });

      expect(cm.getCheckpointCount('exec-1')).toBe(2);
    });
  });

  describe('Rollback Manager', () => {
    test('should determine if can rollback', async () => {
      const cm = new CheckpointManager();
      const rm = new RollbackManager(cm);

      const execution: ActionExecution = {
        action: { id: 'test', type: 'scan' as const, name: 'Test', description: '', parameters: {}, target: {} as any, dependencies: [], timeout: 1000, retries: 0, riskLevel: 'low' as const, requiresApproval: false, metadata: {} as any },
        executionId: 'exec-1',
        status: 'completed' as ActionStatus,
        duration: 0,
        auditLog: [],
        checkpoints: [],
      };

      expect(rm.canRollback(execution)).toBe(false);

      await cm.createCheckpoint('exec-1', { state: 'test' });
      expect(rm.canRollback(execution)).toBe(true);
    });
  });

  describe('Sandbox Executor', () => {
    test('should execute within sandbox', async () => {
      const sandbox = new SandboxExecutor({
        enabled: true,
        networkIsolation: true,
        filesystemIsolation: true,
        resourceLimits: { maxCpuPercent: 80, maxMemoryMB: 512, maxDiskMB: 100, maxNetworkMbps: 10, maxExecutionTime: 5000 },
        allowedOperations: ['read', 'write'],
        blockedOperations: ['delete'],
      });

      const result = await sandbox.execute(async () => 'success', {
        maxCpuPercent: 80,
        maxMemoryMB: 512,
        maxDiskMB: 100,
        maxNetworkMbps: 10,
        maxExecutionTime: 1000,
      });

      expect(result).toBe('success');
    });

    test('should timeout long operations', async () => {
      const sandbox = new SandboxExecutor({
        enabled: true,
        networkIsolation: true,
        filesystemIsolation: true,
        resourceLimits: { maxCpuPercent: 80, maxMemoryMB: 512, maxDiskMB: 100, maxNetworkMbps: 10, maxExecutionTime: 5000 },
        allowedOperations: [],
        blockedOperations: [],
      });

      await expect(
        sandbox.execute(async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return 'completed';
        }, { maxCpuPercent: 80, maxMemoryMB: 512, maxDiskMB: 100, maxNetworkMbps: 10, maxExecutionTime: 100 })
      ).rejects.toThrow('timeout');
    });
  });

  describe('Execution Plan', () => {
    test('should execute sequential plan', async () => {
      const executions: Action[] = [];

      const handler: ActionHandler = {
        type: 'test',
        name: 'Test',
        description: 'Test',
        validate: async () => [],
        execute: async (action) => {
          executions.push(action);
          return { success: true, output: {}, metrics: {} as any, artifacts: [], sideEffects: [], validationResults: [] };
        },
        estimateImpact: () => ({ duration: 0, resourceUsage: {} as any, riskLevel: 'low', affectedSystems: [], potentialSideEffects: [] }),
      };

      engine.registerHandler(handler);

      const actions: Action[] = [
        { id: 'action-1', type: 'test', name: 'A1', description: '', parameters: {}, target: {} as any, dependencies: [], timeout: 1000, retries: 0, riskLevel: 'low', requiresApproval: false, metadata: {} as any },
        { id: 'action-2', type: 'test', name: 'A2', description: '', parameters: {}, target: {} as any, dependencies: [], timeout: 1000, retries: 0, riskLevel: 'low', requiresApproval: false, metadata: {} as any },
      ];

      const plan = {
        id: 'plan-1',
        name: 'Test Plan',
        description: 'Test',
        actions,
        executionOrder: 'sequential' as const,
        dependencies: { nodes: [], edges: [] },
        rollbackStrategy: { automatic: false, onFailure: false, onPartialSuccess: false, maxRollbackAttempts: 1, preserveState: false },
        checkpoints: [],
      };

      const results = await engine.executePlan(plan);

      expect(results).toHaveLength(2);
      expect(executions).toHaveLength(2);
    });
  });

  describe('Events', () => {
    test('should emit execution events', (done) => {
      engine.once('execution:started', () => {
        done();
      });

      const action: Action = {
        id: 'event-test',
        type: 'scan',
        name: 'Event Test',
        description: 'Test',
        parameters: {},
        target: { type: 'url', identifier: 'test', environment: 'testing' },
        dependencies: [],
        timeout: 1000,
        retries: 0,
        riskLevel: 'low',
        requiresApproval: false,
        metadata: { createdAt: new Date(), createdBy: 'test', priority: 1, tags: [], estimatedDuration: 100, maxImpact: 'none' },
      };

      engine.executeAction(action);
    });
  });
});
