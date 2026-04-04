/**
 * SUPREME ACTION ENGINE v3.0 - Semana 14-15
 * Execução de ações com segurança, rollback e circuit breaker
 */

import { EventEmitter } from 'events';
import {
  Action,
  ActionExecution,
  ActionResult,
  ActionError,
  ActionStatus,
  ActionHandler,
  ExecutionContext,
  ExecutionPlan,
  Checkpoint,
  AuditEntry,
  CircuitBreakerState,
  SandboxConfig,
  ResourceLimits,
  ValidationResult,
  RollbackStrategy,
} from './types';

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState;

  constructor(
    private name: string,
    private threshold: number = 5,
    private timeout: number = 60000
  ) {
    super();
    this.state = {
      status: 'closed',
      failureCount: 0,
      successCount: 0,
      threshold,
      timeout,
    };
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state.status === 'open') {
      if (Date.now() - (this.state.lastFailureTime?.getTime() || 0) > this.timeout) {
        this.state.status = 'half_open';
        this.emit('state:changed', { name: this.name, status: 'half_open' });
      } else {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.state.successCount++;
    this.state.lastSuccessTime = new Date();

    if (this.state.status === 'half_open') {
      this.state.status = 'closed';
      this.state.failureCount = 0;
      this.emit('state:changed', { name: this.name, status: 'closed' });
    }
  }

  private onFailure(): void {
    this.state.failureCount++;
    this.state.lastFailureTime = new Date();

    if (this.state.failureCount >= this.threshold) {
      this.state.status = 'open';
      this.emit('state:changed', { name: this.name, status: 'open' });
      this.emit('circuit:tripped', { name: this.name, failures: this.state.failureCount });
    }
  }

  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  reset(): void {
    this.state = {
      status: 'closed',
      failureCount: 0,
      successCount: 0,
      threshold: this.threshold,
      timeout: this.timeout,
    };
    this.emit('state:changed', { name: this.name, status: 'closed' });
  }
}

// ============================================================================
// SANDBOX EXECUTOR
// ============================================================================

export class SandboxExecutor extends EventEmitter {
  constructor(private config: SandboxConfig) {
    super();
  }

  async execute<T>(
    operation: () => Promise<T>,
    limits: ResourceLimits
  ): Promise<T> {
    if (!this.config.enabled) {
      return operation();
    }

    this.emit('sandbox:started', { limits });

    // Configurar timeouts e limits
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Sandbox execution timeout after ${limits.maxExecutionTime}ms`));
      }, limits.maxExecutionTime);
    });

    // Monitorar recursos
    const resourceMonitor = this.startResourceMonitoring(limits);

    try {
      const result = await Promise.race([operation(), timeoutPromise]);
      this.emit('sandbox:completed', { success: true });
      return result;
    } catch (error) {
      this.emit('sandbox:failed', { error });
      throw error;
    } finally {
      resourceMonitor.stop();
    }
  }

  private startResourceMonitoring(limits: ResourceLimits): { stop: () => void } {
    // Simulação de monitoramento - em produção, usar métricas reais
    const interval = setInterval(() => {
      this.emit('resource:check', {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
      });
    }, 1000);

    return {
      stop: () => clearInterval(interval),
    };
  }

  validateOperation(operation: string): boolean {
    if (this.config.blockedOperations.includes(operation)) {
      return false;
    }
    if (this.config.allowedOperations.length > 0) {
      return this.config.allowedOperations.includes(operation);
    }
    return true;
  }
}

// ============================================================================
// CHECKPOINT MANAGER
// ============================================================================

export class CheckpointManager extends EventEmitter {
  private checkpoints: Map<string, Checkpoint[]> = new Map();

  async createCheckpoint(executionId: string, state: unknown): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      canRollback: true,
    };

    if (!this.checkpoints.has(executionId)) {
      this.checkpoints.set(executionId, []);
    }

    this.checkpoints.get(executionId)!.push(checkpoint);
    this.emit('checkpoint:created', { executionId, checkpointId: checkpoint.id });

    return checkpoint;
  }

  async getLastCheckpoint(executionId: string): Promise<Checkpoint | undefined> {
    const checkpoints = this.checkpoints.get(executionId);
    return checkpoints?.[checkpoints.length - 1];
  }

  async getCheckpoint(executionId: string, checkpointId: string): Promise<Checkpoint | undefined> {
    const checkpoints = this.checkpoints.get(executionId);
    return checkpoints?.find(cp => cp.id === checkpointId);
  }

  async restoreToCheckpoint(executionId: string, checkpointId: string): Promise<unknown> {
    const checkpoint = await this.getCheckpoint(executionId, checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }

    this.emit('checkpoint:restored', { executionId, checkpointId });
    return checkpoint.state;
  }

  clearCheckpoints(executionId: string): void {
    this.checkpoints.delete(executionId);
    this.emit('checkpoints:cleared', { executionId });
  }

  getCheckpointCount(executionId: string): number {
    return this.checkpoints.get(executionId)?.length || 0;
  }
}

// ============================================================================
// ROLLBACK MANAGER
// ============================================================================

export class RollbackManager extends EventEmitter {
  private rollbackHistory: Map<string, Array<{ timestamp: Date; success: boolean; error?: string }>> = new Map();

  constructor(private checkpointManager: CheckpointManager) {
    super();
  }

  async rollback(execution: ActionExecution): Promise<boolean> {
    this.emit('rollback:started', { executionId: execution.executionId });

    try {
      // 1. Restaurar estado do último checkpoint
      const lastCheckpoint = await this.checkpointManager.getLastCheckpoint(execution.executionId);
      if (lastCheckpoint) {
        await this.checkpointManager.restoreToCheckpoint(execution.executionId, lastCheckpoint.id);
      }

      // 2. Executar rollback action se disponível
      if (execution.action.rollbackAction) {
        // Aqui seria chamado o handler de rollback
        this.emit('rollback:action_executed', {
          executionId: execution.executionId,
          rollbackAction: execution.action.rollbackAction,
        });
      }

      // 3. Registrar sucesso
      this.recordRollback(execution.executionId, true);

      execution.status = 'rolled_back';
      this.emit('rollback:completed', { executionId: execution.executionId, success: true });

      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.recordRollback(execution.executionId, false, errorMsg);
      this.emit('rollback:failed', { executionId: execution.executionId, error: errorMsg });
      return false;
    }
  }

  private recordRollback(executionId: string, success: boolean, error?: string): void {
    if (!this.rollbackHistory.has(executionId)) {
      this.rollbackHistory.set(executionId, []);
    }

    this.rollbackHistory.get(executionId)!.push({
      timestamp: new Date(),
      success,
      error,
    });
  }

  getRollbackHistory(executionId: string): Array<{ timestamp: Date; success: boolean; error?: string }> {
    return this.rollbackHistory.get(executionId) || [];
  }

  canRollback(execution: ActionExecution): boolean {
    return this.checkpointManager.getCheckpointCount(execution.executionId) > 0;
  }
}

// ============================================================================
// SUPREME ACTION ENGINE
// ============================================================================

export class SupremeActionEngine extends EventEmitter {
  private handlers: Map<string, ActionHandler> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private executions: Map<string, ActionExecution> = new Map();
  private checkpointManager: CheckpointManager;
  private rollbackManager: RollbackManager;
  private sandbox: SandboxExecutor;

  constructor(private defaultSandboxConfig: SandboxConfig = DEFAULT_SANDBOX_CONFIG) {
    super();
    this.checkpointManager = new CheckpointManager();
    this.rollbackManager = new RollbackManager(this.checkpointManager);
    this.sandbox = new SandboxExecutor(defaultSandboxConfig);

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    // Forward events from sub-components
    this.checkpointManager.on('checkpoint:created', (data) => this.emit('checkpoint:created', data));
    this.rollbackManager.on('rollback:started', (data) => this.emit('rollback:started', data));
    this.rollbackManager.on('rollback:completed', (data) => this.emit('rollback:completed', data));
  }

  /**
   * Registra um handler de ação
   */
  registerHandler(handler: ActionHandler): void {
    this.handlers.set(handler.type, handler);
    this.emit('handler:registered', { type: handler.type, name: handler.name });
  }

  /**
   * Executa uma ação única
   */
  async executeAction(action: Action): Promise<ActionExecution> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const execution: ActionExecution = {
      action,
      executionId,
      status: 'pending',
      duration: 0,
      auditLog: [],
      checkpoints: [],
    };

    this.executions.set(executionId, execution);
    this.emit('execution:started', { executionId, actionType: action.type });

    const startTime = Date.now();

    try {
      // 1. Validação
      execution.status = 'validating';
      await this.validateAction(action, execution);

      // 2. Verificar circuit breaker
      const cb = this.getCircuitBreaker(action.type);

      // 3. Execução com circuit breaker e sandbox
      execution.status = 'executing';
      execution.startTime = new Date();

      const result = await cb.execute(async () => {
        return this.sandbox.execute(
          () => this.runActionHandler(action, execution),
          {
            maxCpuPercent: 80,
            maxMemoryMB: 512,
            maxDiskMB: 100,
            maxNetworkMbps: 10,
            maxExecutionTime: action.timeout,
          }
        );
      });

      execution.result = result;
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;

      this.addAuditEntry(execution, 'execution_completed', { result });
      this.emit('execution:completed', { executionId, status: 'completed', duration: execution.duration });

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;
      execution.error = this.normalizeError(error);

      this.addAuditEntry(execution, 'execution_failed', { error: execution.error });
      this.emit('execution:failed', { executionId, error: execution.error });

      // Tentar rollback automático
      if (action.riskLevel === 'critical' || action.riskLevel === 'high') {
        await this.attemptRollback(execution);
      }
    }

    return execution;
  }

  /**
   * Executa um plano de execução completo
   */
  async executePlan(plan: ExecutionPlan): Promise<ActionExecution[]> {
    this.emit('plan:started', { planId: plan.id, actionCount: plan.actions.length });

    const executions: ActionExecution[] = [];

    if (plan.executionOrder === 'sequential') {
      for (const action of plan.actions) {
        const execution = await this.executeAction(action);
        executions.push(execution);

        if (execution.status === 'failed') {
          if (plan.rollbackStrategy.automatic && plan.rollbackStrategy.onFailure) {
            await this.rollbackPlan(executions);
          }
          break;
        }

        // Criar checkpoint se configurado
        const checkpointConfig = plan.checkpoints.find(cp => cp.afterAction === action.id);
        if (checkpointConfig) {
          await this.checkpointManager.createCheckpoint(execution.executionId, execution);
        }
      }
    } else if (plan.executionOrder === 'parallel') {
      // Executar em paralelo respeitando dependências
      const results = await Promise.all(
        plan.actions.map(action => this.executeAction(action))
      );
      executions.push(...results);
    }

    this.emit('plan:completed', { planId: plan.id, executions: executions.length });
    return executions;
  }

  /**
   * Valida uma ação antes da execução
   */
  private async validateAction(action: Action, execution: ActionExecution): Promise<void> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    const validations = await handler.validate(action);
    const failed = validations.filter(v => !v.passed && v.severity === 'critical');

    if (failed.length > 0) {
      throw new Error(`Validation failed: ${failed.map(f => f.message).join(', ')}`);
    }

    this.addAuditEntry(execution, 'validation_passed', { validations });
  }

  /**
   * Executa o handler da ação
   */
  private async runActionHandler(action: Action, execution: ActionExecution): Promise<ActionResult> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }

    // Criar contexto de execução
    const context: ExecutionContext = {
      executionId: execution.executionId,
      sandbox: this.defaultSandboxConfig,
      credentials: new Map(),
      variables: new Map(),
      checkpoint: async (state: unknown) => {
        await this.checkpointManager.createCheckpoint(execution.executionId, state);
      },
    };

    // Criar checkpoint antes da execução
    await this.checkpointManager.createCheckpoint(execution.executionId, { action, status: 'pre_execution' });

    const result = await handler.execute(action, context);

    // Criar checkpoint após execução
    await this.checkpointManager.createCheckpoint(execution.executionId, { action, status: 'post_execution', result });

    return result;
  }

  /**
   * Tenta fazer rollback de uma execução
   */
  private async attemptRollback(execution: ActionExecution): Promise<void> {
    if (this.rollbackManager.canRollback(execution)) {
      this.emit('rollback:attempting', { executionId: execution.executionId });
      await this.rollbackManager.rollback(execution);
    }
  }

  /**
   * Faz rollback de um plano completo
   */
  private async rollbackPlan(executions: ActionExecution[]): Promise<void> {
    this.emit('plan:rollback_started', { executionCount: executions.length });

    // Rollback na ordem inversa
    for (let i = executions.length - 1; i >= 0; i--) {
      await this.rollbackManager.rollback(executions[i]);
    }

    this.emit('plan:rollback_completed', { executionCount: executions.length });
  }

  /**
   * Obtém ou cria circuit breaker para um tipo de ação
   */
  private getCircuitBreaker(type: string): CircuitBreaker {
    if (!this.circuitBreakers.has(type)) {
      const cb = new CircuitBreaker(type, 5, 60000);
      this.circuitBreakers.set(type, cb);
    }
    return this.circuitBreakers.get(type)!;
  }

  /**
   * Normaliza erro para formato padrão
   */
  private normalizeError(error: unknown): ActionError {
    if (error instanceof Error) {
      return {
        code: error.name,
        message: error.message,
        stackTrace: error.stack,
        recoverable: false,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      recoverable: false,
    };
  }

  /**
   * Adiciona entrada ao audit log
   */
  private addAuditEntry(execution: ActionExecution, event: string, details: Record<string, unknown>): void {
    execution.auditLog.push({
      timestamp: new Date(),
      event,
      actor: 'system',
      details,
    });
  }

  /**
   * Obtém execução pelo ID
   */
  getExecution(executionId: string): ActionExecution | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Lista todas as execuções
   */
  getAllExecutions(): ActionExecution[] {
    return Array.from(this.executions.values());
  }

  /**
   * Cancela uma execução
   */
  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.executions.get(executionId);
    if (!execution) return false;

    if (execution.status === 'pending' || execution.status === 'validating') {
      execution.status = 'cancelled';
      this.emit('execution:cancelled', { executionId });
      return true;
    }

    return false;
  }

  /**
   * Retorna estatísticas
   */
  getStats(): {
    totalExecutions: number;
    completed: number;
    failed: number;
    rolledBack: number;
    handlers: number;
    circuitBreakers: number;
  } {
    const executions = this.getAllExecutions();
    return {
      totalExecutions: executions.length,
      completed: executions.filter(e => e.status === 'completed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      rolledBack: executions.filter(e => e.status === 'rolled_back').length,
      handlers: this.handlers.size,
      circuitBreakers: this.circuitBreakers.size,
    };
  }

  /**
   * Limpa dados
   */
  clear(): void {
    this.handlers.clear();
    this.circuitBreakers.clear();
    this.executions.clear();
    this.checkpointManager.clearCheckpoints('all');
    this.emit('engine:cleared');
  }
}

// Configuração padrão de sandbox
const DEFAULT_SANDBOX_CONFIG: SandboxConfig = {
  enabled: true,
  networkIsolation: true,
  filesystemIsolation: true,
  resourceLimits: {
    maxCpuPercent: 80,
    maxMemoryMB: 512,
    maxDiskMB: 100,
    maxNetworkMbps: 10,
    maxExecutionTime: 300000, // 5 minutos
  },
  allowedOperations: ['read', 'write', 'execute'],
  blockedOperations: ['delete', 'format'],
};
