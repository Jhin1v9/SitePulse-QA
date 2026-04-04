/**
 * REAL-TIME MONITOR - Context Engine v3.0 Supremo
 * Monitoramento em tempo real de métricas e eventos
 */

import { EventEmitter } from 'events';
import {
  LiveContext,
  LiveMetrics,
  Alert,
  ContextSystemEvent,
} from '../../shared/types/context.js';

// Alias for backward compatibility
type SystemEvent = ContextSystemEvent;

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface RealTimeMonitorConfig {
  metricsInterval: number; // ms
  alertThresholds: {
    latency: number; // ms
    errorRate: number; // percentage
    cpu: number; // percentage
    memory: number; // percentage
  };
  enablePrediction: boolean;
  anomalyDetection: boolean;
  retentionWindow: number; // segundos
}

// ============================================================================
// MÉTRICAS EM TEMPO REAL
// ============================================================================

export interface MetricStream {
  timestamp: Date;
  rps: number;
  latencyP95: number;
  latencyP99: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  bandwidth: number;
  queueDepth: number;
}

export interface Anomaly {
  id: string;
  timestamp: Date;
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  possibleCause: string;
}

// ============================================================================
// REAL-TIME MONITOR
// ============================================================================

export class RealTimeMonitor extends EventEmitter {
  private config: RealTimeMonitorConfig;
  private metricsHistory: MetricStream[] = [];
  private alerts: Alert[] = [];
  private events: SystemEvent[] = [];
  private monitorInterval?: NodeJS.Timeout;
  private isRunning = false;

  // Baseline para detecção de anomalias
  private baseline: Map<string, { mean: number; std: number }> = new Map();

  constructor(config: RealTimeMonitorConfig) {
    super();
    this.config = config;
  }

  /**
   * Inicia monitoramento em tempo real
   */
  start(target: string): void {
    if (this.isRunning) return;

    console.log(`Starting real-time monitoring for ${target}...`);
    this.isRunning = true;

    // Coletar métricas periodicamente
    this.monitorInterval = setInterval(() => {
      this.collectMetrics(target);
    }, this.config.metricsInterval);

    this.emit('monitor:started', { target, timestamp: new Date() });
  }

  /**
   * Para o monitoramento
   */
  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = undefined;
    }
    this.isRunning = false;
    this.emit('monitor:stopped', { timestamp: new Date() });
  }

  /**
   * Coleta métricas atuais
   */
  private async collectMetrics(target: string): Promise<void> {
    const metrics = await this.fetchCurrentMetrics(target);

    // Adicionar ao histórico
    this.metricsHistory.push(metrics);

    // Manter apenas janela de retenção
    const cutoff = new Date(Date.now() - this.config.retentionWindow * 1000);
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp > cutoff);

    // Atualizar baseline
    this.updateBaseline();

    // Verificar alertas
    this.checkAlertThresholds(metrics);

    // Detectar anomalias
    if (this.config.anomalyDetection) {
      const anomalies = this.detectAnomalies(metrics);
      anomalies.forEach(a => this.emit('anomaly:detected', a));
    }

    // Emitir métricas atualizadas
    this.emit('metrics:updated', metrics);
  }

  /**
   * Busca métricas atuais (simulação)
   */
  private async fetchCurrentMetrics(target: string): Promise<MetricStream> {
    // Simulação: Na implementação real, consultaria Prometheus, DataDog, etc
    const now = new Date();

    // Gerar métricas realistas com variação
    const baseRps = 1200;
    const variation = () => (Math.random() - 0.5) * 0.2; // +/- 10%

    return {
      timestamp: now,
      rps: Math.round(baseRps * (1 + variation())),
      latencyP95: Math.round(145 * (1 + variation())),
      latencyP99: Math.round(280 * (1 + variation())),
      errorRate: parseFloat((0.003 * (1 + variation())).toFixed(4)),
      cpuUsage: Math.round(45 * (1 + variation())),
      memoryUsage: Math.round(62 * (1 + variation())),
      activeConnections: Math.round(1250 * (1 + variation())),
      bandwidth: Math.round(150000000 * (1 + variation())),
      queueDepth: Math.round(12 * (1 + variation())),
    };
  }

  /**
   * Atualiza baseline estatístico
   */
  private updateBaseline(): void {
    if (this.metricsHistory.length < 10) return;

    const metrics = ['rps', 'latencyP95', 'errorRate', 'cpuUsage', 'memoryUsage'] as const;

    metrics.forEach(metric => {
      const values = this.metricsHistory.map(m => m[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      this.baseline.set(metric, { mean, std });
    });
  }

  /**
   * Verifica thresholds de alerta
   */
  private checkAlertThresholds(metrics: MetricStream): void {
    const checks = [
      {
        condition: metrics.latencyP95 > this.config.alertThresholds.latency,
        severity: 'warning' as const,
        message: `Latency P95 (${metrics.latencyP95}ms) exceeded threshold (${this.config.alertThresholds.latency}ms)`,
        source: 'latency',
      },
      {
        condition: metrics.errorRate > this.config.alertThresholds.errorRate,
        severity: 'critical' as const,
        message: `Error rate (${(metrics.errorRate * 100).toFixed(2)}%) exceeded threshold (${(this.config.alertThresholds.errorRate * 100).toFixed(2)}%)`,
        source: 'error_rate',
      },
      {
        condition: metrics.cpuUsage > this.config.alertThresholds.cpu,
        severity: 'warning' as const,
        message: `CPU usage (${metrics.cpuUsage}%) exceeded threshold (${this.config.alertThresholds.cpu}%)`,
        source: 'cpu',
      },
      {
        condition: metrics.memoryUsage > this.config.alertThresholds.memory,
        severity: 'warning' as const,
        message: `Memory usage (${metrics.memoryUsage}%) exceeded threshold (${this.config.alertThresholds.memory}%)`,
        source: 'memory',
      },
    ];

    checks.forEach(check => {
      if (check.condition) {
        const alert: Alert = {
          id: `alert-${Date.now()}-${Math.random()}`,
          severity: check.severity,
          message: check.message,
          source: check.source,
          timestamp: new Date(),
        };

        this.alerts.push(alert);
        this.emit('alert:triggered', alert);
      }
    });
  }

  /**
   * Detecta anomalias estatísticas
   */
  private detectAnomalies(metrics: MetricStream): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const [metric, stats] of this.baseline) {
      const value = metrics[metric as keyof MetricStream] as number;
      const zScore = (value - stats.mean) / (stats.std || 1);

      // Z-score > 3 ou < -3 indica anomalia
      if (Math.abs(zScore) > 3) {
        anomalies.push({
          id: `anomaly-${Date.now()}-${metric}`,
          timestamp: new Date(),
          metric,
          expectedValue: stats.mean,
          actualValue: value,
          deviation: zScore,
          severity: Math.abs(zScore) > 4 ? 'critical' : Math.abs(zScore) > 3.5 ? 'high' : 'medium',
          possibleCause: this.inferCause(metric, zScore),
        });
      }
    }

    return anomalies;
  }

  /**
   * Infere causa provável de anomalia
   */
  private inferCause(metric: string, deviation: number): string {
    const causes: Record<string, string[]> = {
      'rps': ['Traffic spike', 'DDoS attack', 'Viral content', 'Marketing campaign'],
      'latencyP95': ['Database slowdown', 'Cache miss', 'Third-party API latency', 'GC pause'],
      'errorRate': ['Deployment issue', 'Dependency failure', 'Database connection pool exhaustion'],
      'cpuUsage': ['Infinite loop', 'Heavy computation', 'Traffic increase', 'Crypto mining'],
      'memoryUsage': ['Memory leak', 'Large dataset processing', 'Increased cache size'],
    };

    const possibleCauses = causes[metric] || ['Unknown cause'];
    return possibleCauses[Math.floor(Math.random() * possibleCauses.length)];
  }

  /**
   * Obtém contexto ao vivo atual
   */
  getLiveContext(): LiveContext {
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];

    return {
      timestamp: new Date(),
      metrics: latestMetrics ? this.convertToLiveMetrics(latestMetrics) : this.getEmptyMetrics(),
      alerts: this.getActiveAlerts(),
      events: this.getRecentEvents(10),
    };
  }

  private convertToLiveMetrics(stream: MetricStream): LiveMetrics {
    return {
      rps: stream.rps,
      latencyP95: stream.latencyP95,
      errorRate: stream.errorRate,
      cpuUsage: stream.cpuUsage,
      memoryUsage: stream.memoryUsage,
      activeConnections: stream.activeConnections,
    };
  }

  private getEmptyMetrics(): LiveMetrics {
    return {
      rps: 0,
      latencyP95: 0,
      errorRate: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      activeConnections: 0,
    };
  }

  private getActiveAlerts(): Alert[] {
    const cutoff = new Date(Date.now() - 3600000); // 1 hora
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  private getRecentEvents(limit: number): SystemEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Adiciona evento do sistema
   */
  addEvent(event: SystemEvent): void {
    this.events.push(event);
    this.emit('event:added', event);
  }

  /**
   * Obtém histórico de métricas
   */
  getMetricsHistory(timeRange: { start: Date; end: Date }): MetricStream[] {
    return this.metricsHistory.filter(
      m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * Calcula tendências
   */
  calculateTrends(): Record<string, 'up' | 'down' | 'stable'> {
    if (this.metricsHistory.length < 10) {
      return {};
    }

    const recent = this.metricsHistory.slice(-10);
    const older = this.metricsHistory.slice(-20, -10);

    if (older.length === 0) return {};

    const trends: Record<string, 'up' | 'down' | 'stable'> = {};

    const calcTrend = (metric: keyof MetricStream) => {
      const recentAvg = recent.reduce((sum, m) => sum + (m[metric] as number), 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + (m[metric] as number), 0) / older.length;

      const change = (recentAvg - olderAvg) / olderAvg;

      if (change > 0.1) return 'up';
      if (change < -0.1) return 'down';
      return 'stable';
    };

    trends['rps'] = calcTrend('rps');
    trends['latency'] = calcTrend('latencyP95');
    trends['errorRate'] = calcTrend('errorRate');
    trends['cpu'] = calcTrend('cpuUsage');
    trends['memory'] = calcTrend('memoryUsage');

    return trends;
  }
}
