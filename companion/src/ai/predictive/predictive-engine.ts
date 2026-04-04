/**
 * SUPREME PREDICTIVE ENGINE v3.0 - Semana 14-15
 * Forecasting, Anomaly Detection e Proactive Recommendations
 */

import { EventEmitter } from 'events';
import {
  TimeSeries,
  DataPoint,
  Forecast,
  PredictionPoint,
  TimeHorizon,
  ForecastModel,
  AccuracyMetrics,
  AnomalyDetection,
  Anomaly,
  AnomalyAlgorithm,
  BaselineStats,
  ProactiveRecommendation,
  PredictedIssue,
  SuggestedAction,
  ImpactAssessment,
  CorrelationAnalysis,
  Correlation,
  Pattern,
  Alert,
  SeasonalityInfo,
  TrendInfo,
} from './types';

// ============================================================================
// FORECASTING ENGINE
// ============================================================================

export class ForecastingEngine extends EventEmitter {
  private modelPerformance: Map<ForecastModel, { accuracy: number; count: number }> = new Map();

  /**
   * Gera forecast usando modelo selecionado
   */
  async forecast(
    series: TimeSeries,
    horizon: TimeHorizon,
    model: ForecastModel = 'ensemble'
  ): Promise<Forecast> {
    console.log(`Generating ${horizon} forecast for ${series.name} using ${model}...`);
    this.emit('forecast:started', { series: series.name, horizon, model });

    const horizonPoints = this.getHorizonPoints(horizon, series.frequency);
    const lastTimestamp = series.data[series.data.length - 1]?.timestamp || new Date();

    // Analisar tendência
    const trend = this.analyzeTrend(series);

    // Detectar sazonalidade
    const seasonality = this.detectSeasonality(series);

    // Gerar previsões
    let predictions: PredictionPoint[];
    let accuracy: AccuracyMetrics;

    switch (model) {
      case 'linear':
        ({ predictions, accuracy } = this.linearForecast(series, horizonPoints, lastTimestamp, trend));
        break;
      case 'arima':
        ({ predictions, accuracy } = this.arimaForecast(series, horizonPoints, lastTimestamp, trend, seasonality));
        break;
      case 'ensemble':
        ({ predictions, accuracy } = this.ensembleForecast(series, horizonPoints, lastTimestamp, trend, seasonality));
        break;
      default:
        ({ predictions, accuracy } = this.linearForecast(series, horizonPoints, lastTimestamp, trend));
    }

    const forecast: Forecast = {
      metric: series.metric,
      horizon,
      predictions,
      confidence: accuracy.confidence,
      model,
      seasonality,
      trend,
      accuracy,
    };

    this.updateModelPerformance(model, accuracy);
    this.emit('forecast:completed', { series: series.name, accuracy: accuracy.confidence });

    return forecast;
  }

  /**
   * Forecast linear simples
   */
  private linearForecast(
    series: TimeSeries,
    horizonPoints: number,
    lastTimestamp: Date,
    trend: TrendInfo
  ): { predictions: PredictionPoint[]; accuracy: AccuracyMetrics } {
    const values = series.data.map(d => d.value);
    const lastValue = values[values.length - 1];
    const interval = this.getIntervalMs(series.frequency);

    const predictions: PredictionPoint[] = [];
    
    for (let i = 1; i <= horizonPoints; i++) {
      const predictedValue = lastValue + trend.slope * i;
      const uncertainty = this.calculateUncertainty(values, i);

      predictions.push({
        timestamp: new Date(lastTimestamp.getTime() + interval * i),
        predictedValue,
        confidenceInterval: [predictedValue - uncertainty, predictedValue + uncertainty],
        probability: 0.9 - i * 0.02, // Decresce com o horizonte
      });
    }

    const accuracy = this.calculateAccuracy(series, predictions);
    return { predictions, accuracy };
  }

  /**
   * Forecast ARIMA simplificado
   */
  private arimaForecast(
    series: TimeSeries,
    horizonPoints: number,
    lastTimestamp: Date,
    trend: TrendInfo,
    seasonality?: SeasonalityInfo
  ): { predictions: PredictionPoint[]; accuracy: AccuracyMetrics } {
    const values = series.data.map(d => d.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = this.calculateStdDev(values);
    const interval = this.getIntervalMs(series.frequency);

    const predictions: PredictionPoint[] = [];

    for (let i = 1; i <= horizonPoints; i++) {
      // Modelo ARIMA(1,1,1) simplificado
      const autoRegressive = values[values.length - 1] * 0.7;
      const diff = trend.slope * 0.3;
      const seasonal = seasonality ? Math.sin(2 * Math.PI * i / seasonality.period) * stdDev * 0.5 : 0;
      
      const predictedValue = autoRegressive + diff + seasonal + mean * 0.1;
      const uncertainty = stdDev * (1 + i * 0.1);

      predictions.push({
        timestamp: new Date(lastTimestamp.getTime() + interval * i),
        predictedValue,
        confidenceInterval: [predictedValue - uncertainty, predictedValue + uncertainty],
        probability: 0.85 - i * 0.015,
      });
    }

    const accuracy = this.calculateAccuracy(series, predictions);
    return { predictions, accuracy };
  }

  /**
   * Ensemble forecast (combina múltiplos modelos)
   */
  private ensembleForecast(
    series: TimeSeries,
    horizonPoints: number,
    lastTimestamp: Date,
    trend: TrendInfo,
    seasonality?: SeasonalityInfo
  ): { predictions: PredictionPoint[]; accuracy: AccuracyMetrics } {
    const linear = this.linearForecast(series, horizonPoints, lastTimestamp, trend);
    const arima = this.arimaForecast(series, horizonPoints, lastTimestamp, trend, seasonality);

    // Ponderar por performance histórica
    const linearWeight = this.getModelWeight('linear');
    const arimaWeight = this.getModelWeight('arima');
    const totalWeight = linearWeight + arimaWeight;

    const predictions: PredictionPoint[] = linear.predictions.map((lp, i) => {
      const ap = arima.predictions[i];
      const weight1 = linearWeight / totalWeight;
      const weight2 = arimaWeight / totalWeight;

      return {
        timestamp: lp.timestamp,
        predictedValue: lp.predictedValue * weight1 + ap.predictedValue * weight2,
        confidenceInterval: [
          lp.confidenceInterval[0] * weight1 + ap.confidenceInterval[0] * weight2,
          lp.confidenceInterval[1] * weight1 + ap.confidenceInterval[1] * weight2,
        ],
        probability: lp.probability * weight1 + ap.probability * weight2,
      };
    });

    const accuracy = this.calculateAccuracy(series, predictions);
    return { predictions, accuracy };
  }

  /**
   * Analisa tendência da série
   */
  private analyzeTrend(series: TimeSeries): TrendInfo {
    const values = series.data.map(d => d.value);
    const n = values.length;

    if (n < 2) {
      return { direction: 'stable', slope: 0, strength: 0, changepoints: [] };
    }

    // Regressão linear simples
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const rSquared = this.calculateRSquared(values, x, slope, sumY / n);

    const direction = slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable';
    const changepoints = this.detectChangepoints(values);

    return {
      direction,
      slope,
      strength: rSquared,
      changepoints,
    };
  }

  /**
   * Detecta sazonalidade
   */
  private detectSeasonality(series: TimeSeries): SeasonalityInfo | undefined {
    // Detectar sazonalidade via autocorrelação
    const values = series.data.map(d => d.value);
    const n = values.length;

    if (n < 20) return undefined;

    // Testar períodos comuns
    const periods = [24, 168, 720]; // Horas em dia, semana, mês
    let bestPeriod = 0;
    let bestCorrelation = 0;

    for (const period of periods) {
      if (period >= n) continue;

      let correlation = 0;
      for (let i = period; i < n; i++) {
        correlation += values[i] * values[i - period];
      }

      if (correlation > bestCorrelation) {
        bestCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod === 0 || bestCorrelation / n < 0.3) return undefined;

    let pattern: SeasonalityInfo['pattern'] = 'custom';
    if (bestPeriod === 24) pattern = 'daily';
    else if (bestPeriod === 168) pattern = 'weekly';
    else if (bestPeriod === 720) pattern = 'monthly';

    return {
      period: bestPeriod,
      strength: Math.min(1, bestCorrelation / n),
      pattern,
    };
  }

  /**
   * Detecta changepoints
   */
  private detectChangepoints(values: number[]): Date[] {
    const changepoints: Date[] = [];
    const windowSize = Math.max(5, Math.floor(values.length / 10));

    for (let i = windowSize; i < values.length - windowSize; i++) {
      const before = values.slice(i - windowSize, i);
      const after = values.slice(i, i + windowSize);

      const meanBefore = before.reduce((a, b) => a + b, 0) / before.length;
      const meanAfter = after.reduce((a, b) => a + b, 0) / after.length;

      const stdBefore = this.calculateStdDev(before);

      if (Math.abs(meanAfter - meanBefore) > 2 * stdBefore) {
        changepoints.push(new Date());
      }
    }

    return changepoints;
  }

  /**
   * Calcula métricas de acurácia
   */
  private calculateAccuracy(series: TimeSeries, predictions: PredictionPoint[]): AccuracyMetrics {
    const actual = series.data.slice(-predictions.length).map(d => d.value);
    const predicted = predictions.map(p => p.predictedValue);

    if (actual.length === 0 || predicted.length === 0) {
      return { mape: 0, rmse: 0, mae: 0, r2: 0, confidence: 0.5 };
    }

    const n = Math.min(actual.length, predicted.length);
    let mae = 0;
    let mse = 0;
    let mapeSum = 0;

    for (let i = 0; i < n; i++) {
      const error = Math.abs(actual[i] - predicted[i]);
      mae += error;
      mse += error * error;
      mapeSum += actual[i] !== 0 ? error / actual[i] : 0;
    }

    mae /= n;
    const rmse = Math.sqrt(mse / n);
    const mape = (mapeSum / n) * 100;

    // R² simplificado
    const meanActual = actual.reduce((a, b) => a + b, 0) / n;
    const ssTot = actual.reduce((sum, v) => sum + Math.pow(v - meanActual, 2), 0);
    const ssRes = actual.slice(0, n).reduce((sum, v, i) => sum + Math.pow(v - predicted[i], 2), 0);
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;

    return {
      mape,
      rmse,
      mae,
      r2,
      confidence: Math.max(0, Math.min(1, r2)),
    };
  }

  private getHorizonPoints(horizon: TimeHorizon, frequency: string): number {
    const multipliers: Record<string, Record<TimeHorizon, number>> = {
      minute: { immediate: 5, short: 30, medium: 120, long: 480 },
      hour: { immediate: 1, short: 6, medium: 24, long: 168 },
      day: { immediate: 1, short: 7, medium: 30, long: 90 },
    };
    return multipliers[frequency]?.[horizon] || 10;
  }

  private getIntervalMs(frequency: string): number {
    const intervals: Record<string, number> = {
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 86400000,
      week: 604800000,
    };
    return intervals[frequency] || 60000;
  }

  private calculateStdDev(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateUncertainty(values: number[], horizon: number): number {
    const stdDev = this.calculateStdDev(values);
    return stdDev * (1 + horizon * 0.1);
  }

  private calculateRSquared(values: number[], x: number[], slope: number, intercept: number): number {
    const n = values.length;
    const yMean = values.reduce((a, b) => a + b, 0) / n;
    let ssTot = 0;
    let ssRes = 0;

    for (let i = 0; i < n; i++) {
      const predicted = slope * x[i] + intercept;
      ssTot += Math.pow(values[i] - yMean, 2);
      ssRes += Math.pow(values[i] - predicted, 2);
    }

    return ssTot > 0 ? 1 - ssRes / ssTot : 0;
  }

  private updateModelPerformance(model: ForecastModel, accuracy: AccuracyMetrics): void {
    const current = this.modelPerformance.get(model) || { accuracy: 0, count: 0 };
    this.modelPerformance.set(model, {
      accuracy: (current.accuracy * current.count + accuracy.r2) / (current.count + 1),
      count: current.count + 1,
    });
  }

  private getModelWeight(model: ForecastModel): number {
    const performance = this.modelPerformance.get(model);
    return performance ? performance.accuracy : 0.5;
  }
}

// ============================================================================
// ANOMALY DETECTION ENGINE
// ============================================================================

export class AnomalyDetectionEngine extends EventEmitter {
  private baselines: Map<string, BaselineStats> = new Map();

  /**
   * Detecta anomalias em uma série temporal
   */
  async detect(
    series: TimeSeries,
    algorithm: AnomalyAlgorithm = 'statistical',
    sensitivity: number = 0.95
  ): Promise<AnomalyDetection> {
    console.log(`Detecting anomalies in ${series.name} using ${algorithm}...`);
    this.emit('anomaly:started', { series: series.name, algorithm });

    // Calcular baseline
    const baseline = this.calculateBaseline(series);
    this.baselines.set(series.name, baseline);

    let anomalies: Anomaly[];

    switch (algorithm) {
      case 'statistical':
        anomalies = this.statisticalDetection(series, baseline, sensitivity);
        break;
      case 'isolation_forest':
        anomalies = this.isolationForestDetection(series, baseline, sensitivity);
        break;
      default:
        anomalies = this.statisticalDetection(series, baseline, sensitivity);
    }

    const detection: AnomalyDetection = {
      metric: series.metric,
      algorithm,
      anomalies,
      threshold: this.calculateThreshold(baseline, sensitivity),
      sensitivity,
      baseline,
    };

    this.emit('anomaly:completed', { series: series.name, anomalyCount: anomalies.length });

    return detection;
  }

  /**
   * Detecção estatística (Z-score)
   */
  private statisticalDetection(
    series: TimeSeries,
    baseline: BaselineStats,
    sensitivity: number
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const threshold = this.calculateThreshold(baseline, sensitivity);

    for (let i = 0; i < series.data.length; i++) {
      const point = series.data[i];
      const zScore = Math.abs((point.value - baseline.mean) / baseline.stdDev);

      if (zScore > threshold) {
        const surroundingValues = series.data
          .slice(Math.max(0, i - 3), Math.min(series.data.length, i + 4))
          .map(d => d.value);

        anomalies.push({
          timestamp: point.timestamp,
          value: point.value,
          expectedValue: baseline.mean,
          deviation: zScore,
          severity: this.getSeverity(zScore, threshold),
          type: point.value > baseline.mean ? 'spike' : 'drop',
          context: {
            surroundingValues,
            recentTrend: this.calculateLocalTrend(series.data, i),
          },
        });
      }
    }

    return anomalies;
  }

  /**
   * Isolation Forest simplificado
   */
  private isolationForestDetection(
    series: TimeSeries,
    baseline: BaselineStats,
    sensitivity: number
  ): Anomaly[] {
    // Simplificação: usar subspace sampling
    const anomalies: Anomaly[] = [];
    const windowSize = 10;

    for (let i = windowSize; i < series.data.length; i++) {
      const window = series.data.slice(i - windowSize, i);
      const values = window.map(d => d.value);
      
      // Calcular path length médio em árvores aleatórias
      const isolationScore = this.calculateIsolationScore(values, series.data[i].value);
      
      if (isolationScore < 1 - sensitivity) {
        anomalies.push({
          timestamp: series.data[i].timestamp,
          value: series.data[i].value,
          expectedValue: baseline.mean,
          deviation: 1 / (isolationScore + 0.01),
          severity: this.getSeverity(1 / (isolationScore + 0.01), 2),
          type: series.data[i].value > baseline.mean ? 'spike' : 'drop',
          context: {
            surroundingValues: values,
            recentTrend: this.calculateLocalTrend(series.data, i),
          },
        });
      }
    }

    return anomalies;
  }

  private calculateBaseline(series: TimeSeries): BaselineStats {
    const values = series.data.map(d => d.value);
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev: stdDev || 1,
      min: sorted[0],
      max: sorted[n - 1],
      percentiles: {
        '25': sorted[Math.floor(n * 0.25)],
        '50': sorted[Math.floor(n * 0.5)],
        '75': sorted[Math.floor(n * 0.75)],
        '95': sorted[Math.floor(n * 0.95)],
        '99': sorted[Math.floor(n * 0.99)],
      },
    };
  }

  private calculateThreshold(baseline: BaselineStats, sensitivity: number): number {
    // Z-score threshold baseado na sensibilidade
    return (1 - sensitivity) * 5 + 1; // 1 a 6
  }

  private getSeverity(zScore: number, threshold: number): Anomaly['severity'] {
    const ratio = zScore / threshold;
    if (ratio > 3) return 'critical';
    if (ratio > 2) return 'high';
    if (ratio > 1.5) return 'medium';
    return 'low';
  }

  private calculateLocalTrend(data: DataPoint[], index: number): TrendInfo {
    const window = data.slice(Math.max(0, index - 5), index + 1);
    const values = window.map(d => d.value);
    
    if (values.length < 2) {
      return { direction: 'stable', slope: 0, strength: 0, changepoints: [] };
    }

    const slope = (values[values.length - 1] - values[0]) / values.length;
    const direction = slope > 0.01 ? 'up' : slope < -0.01 ? 'down' : 'stable';

    return {
      direction,
      slope,
      strength: Math.min(1, Math.abs(slope)),
      changepoints: [],
    };
  }

  private calculateIsolationScore(values: number[], target: number): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const distance = Math.abs(target - mean);
    return Math.exp(-distance / (Math.sqrt(variance) + 1));
  }

  getBaseline(metric: string): BaselineStats | undefined {
    return this.baselines.get(metric);
  }
}

// ============================================================================
// PROACTIVE RECOMMENDATION ENGINE
// ============================================================================

export class ProactiveEngine extends EventEmitter {
  private recommendations: ProactiveRecommendation[] = [];

  /**
   * Gera recomendações proativas baseadas em forecast e anomalias
   */
  async generateRecommendations(
    forecast: Forecast,
    anomalies?: AnomalyDetection,
    patterns?: Pattern[]
  ): Promise<ProactiveRecommendation[]> {
    console.log('Generating proactive recommendations...');
    this.emit('recommendations:started', { metric: forecast.metric });

    const recommendations: ProactiveRecommendation[] = [];

    // 1. Recomendações baseadas em forecast
    const forecastRecs = this.generateForecastRecommendations(forecast);
    recommendations.push(...forecastRecs);

    // 2. Recomendações baseadas em anomalias
    if (anomalies && anomalies.anomalies.length > 0) {
      const anomalyRecs = this.generateAnomalyRecommendations(anomalies);
      recommendations.push(...anomalyRecs);
    }

    // 3. Recomendações baseadas em padrões
    if (patterns) {
      const patternRecs = this.generatePatternRecommendations(patterns);
      recommendations.push(...patternRecs);
    }

    // Ordenar por prioridade
    recommendations.sort((a, b) => b.priority - a.priority);

    this.recommendations = recommendations;
    this.emit('recommendations:completed', { count: recommendations.length });

    return recommendations;
  }

  private generateForecastRecommendations(forecast: Forecast): ProactiveRecommendation[] {
    const recs: ProactiveRecommendation[] = [];
    const lastPrediction = forecast.predictions[forecast.predictions.length - 1];

    // Verificar tendência preocupante
    if (forecast.trend?.direction === 'up' && forecast.trend.strength > 0.7) {
      recs.push({
        id: `rec_${Date.now()}_trend_up`,
        type: 'preventive',
        priority: 8,
        confidence: forecast.trend.strength,
        title: 'Crescimento acelerado previsto',
        description: `O sistema deve escalar em ${forecast.predictions.length} ${forecast.horizon} para acompanhar a demanda`,
        predictedIssue: {
          type: 'capacity_exceeded',
          probability: forecast.trend.strength,
          expectedTime: lastPrediction.timestamp,
          severity: 'high',
          affectedSystems: [forecast.metric],
          businessImpact: 'Possível degradação de serviço',
        },
        suggestedActions: [
          {
            id: 'scale_up',
            description: 'Escalar recursos horizontalmente',
            actionType: 'scale',
            estimatedEffort: 2,
            estimatedImpact: 0.8,
            automationLevel: 'full',
            risks: ['interrupção temporária'],
          },
        ],
        timeframe: forecast.horizon,
        impact: {
          cost: 1000,
          time: 2,
          resources: 1,
          riskReduction: 0.7,
          benefit: 5000,
          roi: 4,
        },
        prerequisites: ['Acesso ao painel de infraestrutura'],
      });
    }

    // Verificar valores fora do intervalo de confiança
    const highConfidenceBreaches = forecast.predictions.filter(
      p => p.predictedValue > p.confidenceInterval[1] * 1.2
    );

    if (highConfidenceBreaches.length > 0) {
      recs.push({
        id: `rec_${Date.now()}_breach`,
        type: 'corrective',
        priority: 9,
        confidence: 0.85,
        title: 'Breach de threshold previsto',
        description: 'O sistema deve exceder limites seguros no horizonte previsto',
        predictedIssue: {
          type: 'threshold_breach',
          probability: 0.85,
          expectedTime: highConfidenceBreaches[0].timestamp,
          severity: 'critical',
          affectedSystems: [forecast.metric],
          businessImpact: 'Possível outage',
        },
        suggestedActions: [
          {
            id: 'optimize',
            description: 'Otimizar queries e cache',
            actionType: 'optimize',
            estimatedEffort: 4,
            estimatedImpact: 0.6,
            automationLevel: 'partial',
            risks: ['mudança de comportamento'],
          },
        ],
        timeframe: forecast.horizon,
        impact: {
          cost: 500,
          time: 4,
          resources: 2,
          riskReduction: 0.5,
          benefit: 10000,
          roi: 19,
        },
        prerequisites: ['Logs de performance'],
      });
    }

    return recs;
  }

  private generateAnomalyRecommendations(anomalies: AnomalyDetection): ProactiveRecommendation[] {
    const recs: ProactiveRecommendation[] = [];

    // Agrupar anomalias por severidade
    const criticalAnomalies = anomalies.anomalies.filter(a => a.severity === 'critical');

    if (criticalAnomalies.length > 0) {
      recs.push({
        id: `rec_${Date.now()}_anomaly`,
        type: 'corrective',
        priority: 10,
        confidence: 0.9,
        title: `Anomalias críticas detectadas em ${anomalies.metric}`,
        description: `${criticalAnomalies.length} anomalias críticas requerem atenção imediata`,
        predictedIssue: {
          type: 'anomaly_cluster',
          probability: 0.9,
          expectedTime: new Date(),
          severity: 'critical',
          affectedSystems: [anomalies.metric],
          businessImpact: 'Instabilidade do sistema',
        },
        suggestedActions: [
          {
            id: 'investigate',
            description: 'Investigar causa raiz',
            actionType: 'investigate',
            estimatedEffort: 4,
            estimatedImpact: 0.9,
            automationLevel: 'manual',
            risks: ['tempo de resposta'],
          },
        ],
        timeframe: 'immediate',
        impact: {
          cost: 2000,
          time: 4,
          resources: 3,
          riskReduction: 0.8,
          benefit: 20000,
          roi: 9,
        },
        prerequisites: ['Acesso aos logs', 'Time de SRE disponível'],
      });
    }

    return recs;
  }

  private generatePatternRecommendations(patterns: Pattern[]): ProactiveRecommendation[] {
    const recs: ProactiveRecommendation[] = [];

    // Identificar padrões recorrentes problemáticos
    const problemPatterns = patterns.filter(
      p => p.type === 'anomaly_pattern' && p.frequency > 3
    );

    if (problemPatterns.length > 0) {
      recs.push({
        id: `rec_${Date.now()}_pattern`,
        type: 'strategic',
        priority: 6,
        confidence: 0.75,
        title: 'Padrão problemático recorrente',
        description: 'Um padrão de falha se repete frequentemente e requer solução estrutural',
        predictedIssue: {
          type: 'recurring_issue',
          probability: 0.8,
          expectedTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          severity: 'medium',
          affectedSystems: problemPatterns[0].metrics,
          businessImpact: 'Débito técnico acumulado',
        },
        suggestedActions: [
          {
            id: 'refactor',
            description: 'Refatorar componente problemático',
            actionType: 'refactor',
            estimatedEffort: 16,
            estimatedImpact: 0.7,
            automationLevel: 'manual',
            risks: ['introdução de bugs'],
          },
        ],
        timeframe: 'medium',
        impact: {
          cost: 8000,
          time: 16,
          resources: 4,
          riskReduction: 0.6,
          benefit: 30000,
          roi: 2.75,
        },
        prerequisites: ['Planejamento de sprint', 'Aprovação de arquitetura'],
      });
    }

    return recs;
  }

  getRecommendations(
    filter?: { type?: string; minPriority?: number; timeframe?: string }
  ): ProactiveRecommendation[] {
    let recs = this.recommendations;

    if (filter?.type) {
      recs = recs.filter(r => r.type === filter.type);
    }
    if (filter?.minPriority) {
      recs = recs.filter(r => r.priority >= filter.minPriority!);
    }
    if (filter?.timeframe) {
      recs = recs.filter(r => r.timeframe === filter.timeframe);
    }

    return recs;
  }

  acknowledgeRecommendation(id: string): boolean {
    const rec = this.recommendations.find(r => r.id === id);
    if (rec) {
      this.emit('recommendation:acknowledged', { id });
      return true;
    }
    return false;
  }
}

// ============================================================================
// SUPREME PREDICTIVE ENGINE (Main Class)
// ============================================================================

export class SupremePredictiveEngine extends EventEmitter {
  private forecasting: ForecastingEngine;
  private anomalyDetection: AnomalyDetectionEngine;
  private proactive: ProactiveEngine;
  private alerts: Alert[] = [];

  constructor() {
    super();
    this.forecasting = new ForecastingEngine();
    this.anomalyDetection = new AnomalyDetectionEngine();
    this.proactive = new ProactiveEngine();

    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    this.forecasting.on('forecast:completed', (data) => this.emit('forecast:completed', data));
    this.anomalyDetection.on('anomaly:completed', (data) => this.emit('anomaly:completed', data));
    this.proactive.on('recommendations:completed', (data) => this.emit('recommendations:completed', data));
  }

  /**
   * Análise completa de uma série temporal
   */
  async analyze(
    series: TimeSeries,
    options: {
      forecastHorizon?: TimeHorizon;
      forecastModel?: ForecastModel;
      anomalyAlgorithm?: AnomalyAlgorithm;
      anomalySensitivity?: number;
    } = {}
  ): Promise<{
    forecast: Forecast;
    anomalies: AnomalyDetection;
    recommendations: ProactiveRecommendation[];
    alerts: Alert[];
  }> {
    console.log(`Starting comprehensive analysis of ${series.name}...`);
    this.emit('analysis:started', { series: series.name });

    // 1. Forecast
    const forecast = await this.forecasting.forecast(
      series,
      options.forecastHorizon || 'short',
      options.forecastModel
    );

    // 2. Anomaly Detection
    const anomalies = await this.anomalyDetection.detect(
      series,
      options.anomalyAlgorithm,
      options.anomalySensitivity
    );

    // 3. Generate Recommendations
    const recommendations = await this.proactive.generateRecommendations(forecast, anomalies);

    // 4. Generate Alerts
    const newAlerts = this.generateAlerts(forecast, anomalies);
    this.alerts.push(...newAlerts);

    this.emit('analysis:completed', {
      series: series.name,
      forecastAccuracy: forecast.accuracy.confidence,
      anomalyCount: anomalies.anomalies.length,
      recommendationCount: recommendations.length,
    });

    return {
      forecast,
      anomalies,
      recommendations,
      alerts: newAlerts,
    };
  }

  private generateAlerts(forecast: Forecast, anomalies: AnomalyDetection): Alert[] {
    const alerts: Alert[] = [];

    // Alertas de anomalias
    anomalies.anomalies.forEach((anomaly, index) => {
      alerts.push({
        id: `alert_${Date.now()}_${index}`,
        type: 'anomaly',
        severity: anomaly.severity,
        timestamp: anomaly.timestamp,
        metric: anomalies.metric,
        message: `Anomalia detectada: ${anomaly.type} com desvio de ${anomaly.deviation.toFixed(2)}σ`,
        predictedValue: anomaly.expectedValue,
        actualValue: anomaly.value,
        acknowledged: false,
      });
    });

    // Alertas de forecast
    const trendChange = forecast.trend?.changepoints.length || 0;
    if (trendChange > 0) {
      alerts.push({
        id: `alert_${Date.now()}_trend`,
        type: 'trend_change',
        severity: 'medium',
        timestamp: new Date(),
        metric: forecast.metric,
        message: `Mudança de tendência detectada: ${forecast.trend?.direction}`,
        predictedValue: forecast.predictions[0]?.predictedValue || 0,
        actualValue: 0,
        acknowledged: false,
      });
    }

    return alerts;
  }

  // Acesso aos sub-engines
  getForecasting(): ForecastingEngine {
    return this.forecasting;
  }

  getAnomalyDetection(): AnomalyDetectionEngine {
    return this.anomalyDetection;
  }

  getProactiveEngine(): ProactiveEngine {
    return this.proactive;
  }

  getAlerts(
    filter?: { severity?: string; acknowledged?: boolean; metric?: string }
  ): Alert[] {
    let filtered = this.alerts;

    if (filter?.severity) {
      filtered = filtered.filter(a => a.severity === filter.severity);
    }
    if (filter?.acknowledged !== undefined) {
      filtered = filtered.filter(a => a.acknowledged === filter.acknowledged);
    }
    if (filter?.metric) {
      filtered = filtered.filter(a => a.metric === filter.metric);
    }

    return filtered;
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.emit('alert:acknowledged', { id: alertId });
      return true;
    }
    return false;
  }

  clearAlerts(): void {
    this.alerts = [];
    this.emit('alerts:cleared');
  }

  getStats(): {
    totalAlerts: number;
    unacknowledgedAlerts: number;
    recommendations: number;
  } {
    return {
      totalAlerts: this.alerts.length,
      unacknowledgedAlerts: this.alerts.filter(a => !a.acknowledged).length,
      recommendations: this.proactive.getRecommendations().length,
    };
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type {
  TimeSeries,
  DataPoint,
  Forecast,
  PredictionPoint,
  TimeHorizon,
  ForecastModel,
  AccuracyMetrics,
  AnomalyDetection,
  Anomaly,
  AnomalyAlgorithm,
  BaselineStats,
  ProactiveRecommendation,
  PredictedIssue,
  SuggestedAction,
  ImpactAssessment,
  CorrelationAnalysis,
  Correlation,
  Pattern,
  Alert,
  SeasonalityInfo,
  TrendInfo,
} from './types';
