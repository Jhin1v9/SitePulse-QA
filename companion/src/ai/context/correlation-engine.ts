/**
 * CORRELATION ENGINE - Context Engine v3.0 Supremo
 * Correlação de logs, eventos e métricas entre sistemas
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE CORRELAÇÃO
// ============================================================================

export interface LogEntry {
  timestamp: Date;
  source: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  metadata: Record<string, unknown>;
  traceId?: string;
  spanId?: string;
}

export interface MetricPoint {
  timestamp: Date;
  name: string;
  value: number;
  tags: Record<string, string>;
}

export interface Event {
  timestamp: Date;
  type: string;
  source: string;
  data: unknown;
  correlationId?: string;
}

export interface CorrelationResult {
  id: string;
  timestamp: Date;
  type: 'causal' | 'temporal' | 'logical';
  confidence: number;
  sources: string[];
  description: string;
  rootCause?: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  relatedEvents: string[];
  recommendedAction?: string;
}

export interface TimelineEvent {
  timestamp: Date;
  source: string;
  type: 'log' | 'metric' | 'event' | 'change';
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  data: unknown;
  correlations: string[];
}

// ============================================================================
// CORRELATION ENGINE
// ============================================================================

export class CorrelationEngine extends EventEmitter {
  private logs: LogEntry[] = [];
  private metrics: MetricPoint[] = [];
  private events: Event[] = [];
  private correlations: CorrelationResult[] = [];

  private maxHistorySize = 10000;

  // ============================================================================
  // INGESTÃO DE DADOS
  // ============================================================================

  addLog(log: LogEntry): void {
    this.logs.push(log);
    this.trimHistory();
    this.analyzeNewLog(log);
  }

  addMetric(metric: MetricPoint): void {
    this.metrics.push(metric);
    this.trimHistory();
    this.analyzeNewMetric(metric);
  }

  addEvent(event: Event): void {
    this.events.push(event);
    this.trimHistory();
    this.analyzeNewEvent(event);
  }

  private trimHistory(): void {
    if (this.logs.length > this.maxHistorySize) {
      this.logs = this.logs.slice(-this.maxHistorySize);
    }
    if (this.metrics.length > this.maxHistorySize) {
      this.metrics = this.metrics.slice(-this.maxHistorySize);
    }
    if (this.events.length > this.maxHistorySize) {
      this.events = this.events.slice(-this.maxHistorySize);
    }
  }

  // ============================================================================
  // ANÁLISE DE CORRELAÇÃO
  // ============================================================================

  private analyzeNewLog(log: LogEntry): void {
    // Procurar correlações com eventos recentes
    const recentEvents = this.getRecentEvents(5);

    for (const event of recentEvents) {
      const correlation = this.correlateLogWithEvent(log, event);
      if (correlation.confidence > 0.7) {
        this.correlations.push(correlation);
        this.emit('correlation:detected', correlation);
      }
    }

    // Analisar padrões de erro
    if (log.level === 'error' || log.level === 'fatal') {
      this.analyzeErrorPattern(log);
    }
  }

  private analyzeNewMetric(metric: MetricPoint): void {
    // Detectar anomalias em métricas
    const anomaly = this.detectMetricAnomaly(metric);
    if (anomaly) {
      this.emit('metric:anomaly', anomaly);

      // Buscar logs relacionados
      const relatedLogs = this.findRelatedLogs(anomaly);
      if (relatedLogs.length > 0) {
        const correlation: CorrelationResult = {
          id: `corr-${Date.now()}`,
          timestamp: new Date(),
          type: 'causal',
          confidence: 0.8,
          sources: ['metrics', 'logs'],
          description: `Metric anomaly correlated with ${relatedLogs.length} log entries`,
          rootCause: this.inferRootCause(relatedLogs),
          impact: this.assessImpact(anomaly),
          relatedEvents: relatedLogs.map(l => l.message),
          recommendedAction: this.suggestAction(anomaly, relatedLogs),
        };

        this.correlations.push(correlation);
        this.emit('correlation:detected', correlation);
      }
    }
  }

  private analyzeNewEvent(event: Event): void {
    // Procurar métricas anômalas próximas no tempo
    const nearbyMetrics = this.getNearbyMetrics(event.timestamp, 60000); // 1 minuto

    for (const metric of nearbyMetrics) {
      if (this.isAnomalous(metric)) {
        const correlation: CorrelationResult = {
          id: `corr-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
          type: 'temporal',
          confidence: 0.75,
          sources: ['events', 'metrics'],
          description: `Event "${event.type}" coincides with metric anomaly`,
          impact: 'medium',
          relatedEvents: [event.type, metric.name],
        };

        this.correlations.push(correlation);
        this.emit('correlation:detected', correlation);
      }
    }
  }

  // ============================================================================
  // MÉTODOS DE CORRELAÇÃO
  // ============================================================================

  private correlateLogWithEvent(log: LogEntry, event: Event): CorrelationResult {
    const timeDiff = Math.abs(log.timestamp.getTime() - event.timestamp.getTime());
    const timeScore = Math.max(0, 1 - timeDiff / 60000); // 1 minuto = score máximo

    const contentScore = this.calculateContentSimilarity(log.message, event.type);
    const confidence = (timeScore + contentScore) / 2;

    return {
      id: `corr-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type: confidence > 0.8 ? 'causal' : 'temporal',
      confidence,
      sources: [log.source, event.source],
      description: `Log from ${log.source} correlates with event ${event.type}`,
      impact: log.level === 'error' ? 'high' : 'low',
      relatedEvents: [log.message, event.type],
    };
  }

  private analyzeErrorPattern(errorLog: LogEntry): void {
    // Buscar erros similares recentes
    const similarErrors = this.logs.filter(
      l =>
        l.level === errorLog.level &&
        this.similarity(l.message, errorLog.message) > 0.7 &&
        l.timestamp > new Date(Date.now() - 3600000) // 1 hora
    );

    if (similarErrors.length >= 3) {
      // Padrão de erro em cascata
      const correlation: CorrelationResult = {
        id: `corr-${Date.now()}`,
        timestamp: new Date(),
        type: 'causal',
        confidence: 0.9,
        sources: [errorLog.source],
        description: `Error cascade detected: ${similarErrors.length} similar errors`,
        rootCause: errorLog.message,
        impact: 'critical',
        relatedEvents: similarErrors.map(e => e.message),
        recommendedAction: 'Investigate root cause and implement circuit breaker',
      };

      this.correlations.push(correlation);
      this.emit('pattern:cascade_error', correlation);
    }
  }

  private detectMetricAnomaly(metric: MetricPoint): MetricPoint | null {
    // Calcular baseline para esta métrica
    const baseline = this.calculateBaseline(metric.name);

    if (!baseline) return null;

    const deviation = Math.abs(metric.value - baseline.mean) / baseline.std;

    if (deviation > 3) {
      return metric;
    }

    return null;
  }

  private calculateBaseline(metricName: string): { mean: number; std: number } | null {
    const history = this.metrics
      .filter(m => m.name === metricName)
      .slice(-100);

    if (history.length < 10) return null;

    const values = history.map(m => m.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

    return { mean, std: Math.sqrt(variance) || 1 };
  }

  private findRelatedLogs(anomaly: MetricPoint): LogEntry[] {
    const timeWindow = 300000; // 5 minutos

    return this.logs.filter(
      l =>
        Math.abs(l.timestamp.getTime() - anomaly.timestamp.getTime()) < timeWindow &&
        (l.level === 'error' || l.level === 'warn')
    );
  }

  private inferRootCause(logs: LogEntry[]): string {
    // Agrupar por mensagem
    const groups = new Map<string, number>();

    logs.forEach(log => {
      const count = groups.get(log.message) || 0;
      groups.set(log.message, count + 1);
    });

    // Encontrar mais comum
    let maxCount = 0;
    let rootCause = 'Unknown';

    groups.forEach((count, message) => {
      if (count > maxCount) {
        maxCount = count;
        rootCause = message;
      }
    });

    return rootCause;
  }

  private assessImpact(anomaly: MetricPoint): 'low' | 'medium' | 'high' | 'critical' {
    const baseline = this.calculateBaseline(anomaly.name);
    if (!baseline) return 'medium';

    const deviation = Math.abs(anomaly.value - baseline.mean) / baseline.std;

    if (deviation > 5) return 'critical';
    if (deviation > 4) return 'high';
    if (deviation > 3) return 'medium';
    return 'low';
  }

  private suggestAction(anomaly: MetricPoint, logs: LogEntry[]): string {
    if (logs.some(l => l.message.includes('database') || l.message.includes('connection'))) {
      return 'Check database connection pool and query performance';
    }

    if (logs.some(l => l.message.includes('memory') || l.message.includes('heap'))) {
      return 'Investigate memory leak and consider restart';
    }

    if (logs.some(l => l.message.includes('timeout'))) {
      return 'Review timeout configurations and dependency health';
    }

    return 'Investigate anomalous metric and related logs';
  }

  private isAnomalous(metric: MetricPoint): boolean {
    return this.detectMetricAnomaly(metric) !== null;
  }

  // ============================================================================
  // RECONSTRUÇÃO DE TIMELINE
  // ============================================================================

  /**
   * Reconstrói timeline de eventos correlacionados
   */
  buildTimeline(
    startTime: Date,
    endTime: Date,
    filters?: { sources?: string[]; severity?: string[] }
  ): TimelineEvent[] {
    const timeline: TimelineEvent[] = [];

    // Adicionar logs
    this.logs
      .filter(
        l =>
          l.timestamp >= startTime &&
          l.timestamp <= endTime &&
          (!filters?.sources || filters.sources.includes(l.source)) &&
          (!filters?.severity || filters.severity.includes(l.level))
      )
      .forEach(log => {
        timeline.push({
          timestamp: log.timestamp,
          source: log.source,
          type: 'log',
          description: log.message,
          severity: this.mapLogLevel(log.level),
          data: log,
          correlations: this.findCorrelationsForTimestamp(log.timestamp),
        });
      });

    // Adicionar eventos
    this.events
      .filter(
        e =>
          e.timestamp >= startTime &&
          e.timestamp <= endTime &&
          (!filters?.sources || filters.sources.includes(e.source))
      )
      .forEach(event => {
        timeline.push({
          timestamp: event.timestamp,
          source: event.source,
          type: 'event',
          description: event.type,
          severity: 'info',
          data: event,
          correlations: this.findCorrelationsForTimestamp(event.timestamp),
        });
      });

    // Adicionar métricas anômalas
    this.metrics
      .filter(
        m =>
          m.timestamp >= startTime &&
          m.timestamp <= endTime &&
          this.isAnomalous(m)
      )
      .forEach(metric => {
        timeline.push({
          timestamp: metric.timestamp,
          source: 'metrics',
          type: 'metric',
          description: `Anomaly: ${metric.name} = ${metric.value}`,
          severity: 'warning',
          data: metric,
          correlations: this.findCorrelationsForTimestamp(metric.timestamp),
        });
      });

    // Ordenar por timestamp
    timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return timeline;
  }

  private mapLogLevel(level: string): 'info' | 'warning' | 'error' | 'critical' {
    const mapping: Record<string, 'info' | 'warning' | 'error' | 'critical'> = {
      debug: 'info',
      info: 'info',
      warn: 'warning',
      error: 'error',
      fatal: 'critical',
    };

    return mapping[level] || 'info';
  }

  private findCorrelationsForTimestamp(timestamp: Date): string[] {
    const window = 60000; // 1 minuto

    return this.correlations
      .filter(
        c =>
          Math.abs(c.timestamp.getTime() - timestamp.getTime()) < window
      )
      .map(c => c.id);
  }

  // ============================================================================
  // ANÁLISE DE CAUSALIDADE
  // ============================================================================

  /**
   * Analisa causalidade entre eventos
   */
  analyzeCausality(eventIds: string[]): Array<{ cause: string; effect: string; strength: number }> {
    const causalities: Array<{ cause: string; effect: string; strength: number }> = [];

    const events = this.events.filter(e => eventIds.includes(e.correlationId || ''));

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const cause = events[i];
        const effect = events[j];

        const timeDiff = effect.timestamp.getTime() - cause.timestamp.getTime();

        // Se o efeito veio depois (até 5 minutos)
        if (timeDiff > 0 && timeDiff < 300000) {
          const strength = this.calculateCausalStrength(cause, effect);

          if (strength > 0.5) {
            causalities.push({
              cause: cause.type,
              effect: effect.type,
              strength,
            });
          }
        }
      }
    }

    return causalities;
  }

  private calculateCausalStrength(cause: Event, effect: Event): number {
    let strength = 0.5;

    // Proximidade temporal aumenta força causal
    const timeDiff = effect.timestamp.getTime() - cause.timestamp.getTime();
    const timeScore = Math.max(0, 1 - timeDiff / 300000);
    strength += timeScore * 0.3;

    // Similaridade de dados
    const contentScore = this.calculateContentSimilarity(
      JSON.stringify(cause.data),
      JSON.stringify(effect.data)
    );
    strength += contentScore * 0.2;

    return Math.min(1, strength);
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private getRecentEvents(seconds: number): Event[] {
    const cutoff = new Date(Date.now() - seconds * 1000);
    return this.events.filter(e => e.timestamp > cutoff);
  }

  private getNearbyMetrics(timestamp: Date, windowMs: number): MetricPoint[] {
    return this.metrics.filter(
      m => Math.abs(m.timestamp.getTime() - timestamp.getTime()) < windowMs
    );
  }

  private calculateContentSimilarity(a: string, b: string): number {
    const tokensA = new Set(a.toLowerCase().split(/\s+/));
    const tokensB = new Set(b.toLowerCase().split(/\s+/));

    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return intersection.size / union.size;
  }

  private similarity(a: string, b: string): number {
    return this.calculateContentSimilarity(a, b);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  getCorrelations(): CorrelationResult[] {
    return this.correlations;
  }

  getRecentCorrelations(limit: number): CorrelationResult[] {
    return this.correlations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getStats(): {
    totalLogs: number;
    totalMetrics: number;
    totalEvents: number;
    totalCorrelations: number;
  } {
    return {
      totalLogs: this.logs.length,
      totalMetrics: this.metrics.length,
      totalEvents: this.events.length,
      totalCorrelations: this.correlations.length,
    };
  }
}
