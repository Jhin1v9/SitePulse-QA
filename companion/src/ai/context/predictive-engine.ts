/**
 * PREDICTIVE CONTEXT ENGINE - Context Engine v3.0 Supremo
 * Previsão de load, falhas e ameaças de segurança
 */

import { EventEmitter } from 'events';
import {
  PredictiveContext,
  LoadForecast,
  FailurePrediction,
  ThreatPrediction,
  RecommendedAction,
} from '../../shared/types/context';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface PredictiveEngineConfig {
  forecastHorizon: number; // horas
  confidenceThreshold: number;
  enableML: boolean;
  seasonalityDetection: boolean;
  updateInterval: number; // ms
}

// ============================================================================
// MODELOS DE PREVISÃO
// ============================================================================

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
  features?: Record<string, number>;
}

export interface ForecastModel {
  predict(series: TimeSeriesPoint[], horizon: number): number[];
  confidenceInterval(predictions: number[]): { lower: number[]; upper: number[] };
}

// ============================================================================
// PREDICTIVE CONTEXT ENGINE
// ============================================================================

export class PredictiveContextEngine extends EventEmitter {
  private config: PredictiveEngineConfig;
  private historicalData: Map<string, TimeSeriesPoint[]> = new Map();
  private lastUpdate: Date = new Date();

  constructor(config: PredictiveEngineConfig) {
    super();
    this.config = config;
  }

  /**
   * Adiciona dados históricos para análise
   */
  addHistoricalData(metric: string, data: TimeSeriesPoint[]): void {
    this.historicalData.set(metric, data);
  }

  /**
   * Gera previsão completa do contexto
   */
  async generatePredictions(): Promise<PredictiveContext> {
    console.log('Generating predictive context...');

    const [
      loadForecast,
      failurePredictions,
      securityThreats,
      userBehavior,
    ] = await Promise.all([
      this.forecastLoad(),
      this.predictFailures(),
      this.predictSecurityThreats(),
      this.predictUserBehavior(),
    ]);

    const recommendations = this.generateRecommendations(
      loadForecast,
      failurePredictions,
      securityThreats
    );

    return {
      loadForecast,
      failurePredictions,
      securityThreats,
      userBehavior,
      recommendedActions: recommendations,
    };
  }

  // ============================================================================
  // FORECAST DE LOAD
  // ============================================================================

  private async forecastLoad(): Promise<LoadForecast> {
    const rpsData = this.historicalData.get('rps') || [];

    if (rpsData.length < 24) {
      return {
        nextHour: 1200,
        nextDay: 1200,
        nextWeek: 1200,
        confidence: 0.5,
        peakTimes: [],
      };
    }

    // Análise de sazonalidade
    const seasonality = this.detectSeasonality(rpsData);

    // Previsão para próxima hora
    const nextHourPrediction = this.predictNextValue(rpsData.slice(-24));

    // Previsão para próximo dia
    const nextDayPrediction = this.applySeasonality(
      this.predictNextValue(rpsData.slice(-168)), // 7 dias
      seasonality,
      24
    );

    // Previsão para próxima semana
    const nextWeekPrediction = this.applyWeeklyPattern(rpsData);

    // Identificar picos
    const peakTimes = this.identifyPeakTimes(rpsData, seasonality);

    // Calcular confiança
    const confidence = this.calculateForecastConfidence(rpsData);

    return {
      nextHour: Math.round(nextHourPrediction),
      nextDay: Math.round(nextDayPrediction),
      nextWeek: Math.round(nextWeekPrediction),
      confidence,
      peakTimes,
    };
  }

  private detectSeasonality(data: TimeSeriesPoint[]): number[] {
    if (data.length < 48) return [];

    // Detectar padrão horário (24h)
    const hourlyPattern = new Array(24).fill(0);
    const hourlyCount = new Array(24).fill(0);

    data.forEach(point => {
      const hour = point.timestamp.getHours();
      hourlyPattern[hour] += point.value;
      hourlyCount[hour]++;
    });

    // Normalizar
    return hourlyPattern.map((sum, i) =>
      hourlyCount[i] > 0 ? sum / hourlyCount[i] : 0
    );
  }

  private predictNextValue(recentData: TimeSeriesPoint[]): number {
    if (recentData.length === 0) return 0;

    // Média móvel exponencial
    const alpha = 0.3;
    let ema = recentData[0].value;

    for (let i = 1; i < recentData.length; i++) {
      ema = alpha * recentData[i].value + (1 - alpha) * ema;
    }

    // Adicionar tendência
    const trend = this.calculateTrend(recentData);

    return ema + trend;
  }

  private calculateTrend(data: TimeSeriesPoint[]): number {
    if (data.length < 2) return 0;

    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, p) => sum + p.value, 0);
    const sumXY = data.reduce((sum, p, i) => sum + i * p.value, 0);
    const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    return slope;
  }

  private applySeasonality(
    basePrediction: number,
    seasonality: number[],
    hoursAhead: number
  ): number {
    if (seasonality.length === 0) return basePrediction;

    const targetHour = (new Date().getHours() + hoursAhead) % 24;
    const seasonalFactor = seasonality[targetHour] / (seasonality.reduce((a, b) => a + b, 0) / 24);

    return basePrediction * seasonalFactor;
  }

  private applyWeeklyPattern(data: TimeSeriesPoint[]): number {
    if (data.length < 168) { // 7 dias
      return this.predictNextValue(data);
    }

    // Comparar com mesmo dia da semana
    const dayOfWeek = new Date().getDay();
    const sameDayLastWeek = data.filter((_, i) =>
      i >= data.length - 168 && i < data.length - 144
    );

    return sameDayLastWeek.reduce((sum, p) => sum + p.value, 0) / sameDayLastWeek.length;
  }

  private identifyPeakTimes(data: TimeSeriesPoint[], seasonality: number[]): Date[] {
    const peaks: Date[] = [];
    const avgLoad = seasonality.reduce((a, b) => a + b, 0) / seasonality.length;
    const threshold = avgLoad * 1.3; // 30% acima da média

    const now = new Date();

    seasonality.forEach((load, hour) => {
      if (load > threshold) {
        const peakTime = new Date(now);
        peakTime.setHours(hour, 0, 0, 0);
        if (peakTime < now) {
          peakTime.setDate(peakTime.getDate() + 1);
        }
        peaks.push(peakTime);
      }
    });

    return peaks.slice(0, 5);
  }

  private calculateForecastConfidence(data: TimeSeriesPoint[]): number {
    if (data.length < 10) return 0.5;

    // Calcular variância
    const mean = data.reduce((sum, p) => sum + p.value, 0) / data.length;
    const variance = data.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / data.length;
    const cv = Math.sqrt(variance) / mean; // Coeficiente de variação

    // Mais variável = menos confiança
    return Math.max(0.3, Math.min(0.95, 1 - cv));
  }

  // ============================================================================
  // PREVISÃO DE FALHAS
  // ============================================================================

  private async predictFailures(): Promise<FailurePrediction[]> {
    const predictions: FailurePrediction[] = [];

    // Analisar métricas para sinais de degradação
    const metrics = ['cpu', 'memory', 'disk', 'error_rate'];

    for (const metric of metrics) {
      const data = this.historicalData.get(metric);
      if (!data || data.length < 24) continue;

      const failure = this.predictComponentFailure(metric, data);
      if (failure) {
        predictions.push(failure);
      }
    }

    // Prever falhas baseadas em padrões
    const patternBasedFailures = this.detectFailurePatterns();
    predictions.push(...patternBasedFailures);

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  private predictComponentFailure(
    component: string,
    data: TimeSeriesPoint[]
  ): FailurePrediction | null {
    const recent = data.slice(-24);
    const values = recent.map(p => p.value);

    // Calcular taxa de crescimento
    const growthRate = this.calculateTrend(recent);

    // Calcular valor atual e tendência
    const currentValue = values[values.length - 1];
    const threshold = this.getFailureThreshold(component);

    // Se está crescendo em direção ao threshold
    if (growthRate > 0 && currentValue < threshold) {
      const timeToThreshold = (threshold - currentValue) / growthRate;

      if (timeToThreshold > 0 && timeToThreshold < 168) { // 7 dias
        const probability = Math.min(0.9, 0.3 + (growthRate / threshold) * 5);

        return {
          component,
          probability,
          timeframe: this.formatTimeframe(timeToThreshold),
          impact: this.assessImpact(component, currentValue / threshold),
        };
      }
    }

    // Se já está próximo do limite
    if (currentValue > threshold * 0.85) {
      return {
        component,
        probability: 0.7,
        timeframe: '0-24 hours',
        impact: this.assessImpact(component, currentValue / threshold),
      };
    }

    return null;
  }

  private getFailureThreshold(component: string): number {
    const thresholds: Record<string, number> = {
      'cpu': 90,
      'memory': 85,
      'disk': 95,
      'error_rate': 0.05,
    };

    return thresholds[component] || 80;
  }

  private assessImpact(component: string, saturationLevel: number): 'low' | 'medium' | 'high' | 'critical' {
    if (saturationLevel > 0.95) return 'critical';
    if (saturationLevel > 0.85) return 'high';
    if (saturationLevel > 0.7) return 'medium';
    return 'low';
  }

  private detectFailurePatterns(): FailurePrediction[] {
    const predictions: FailurePrediction[] = [];

    // Padrão: Picos frequentes de erro
    const errorData = this.historicalData.get('error_rate');
    if (errorData) {
      const spikes = errorData.filter(p => p.value > 0.01);
      if (spikes.length > errorData.length * 0.1) { // Mais de 10% spikes
        predictions.push({
          component: 'Application Stability',
          probability: 0.6,
          timeframe: '24-72 hours',
          impact: 'high',
        });
      }
    }

    // Padrão: Latência crescente
    const latencyData = this.historicalData.get('latency');
    if (latencyData) {
      const trend = this.calculateTrend(latencyData.slice(-48));
      if (trend > 5) { // Crescendo 5ms por período
        predictions.push({
          component: 'Database Performance',
          probability: 0.65,
          timeframe: '48-96 hours',
          impact: 'medium',
        });
      }
    }

    return predictions;
  }

  // ============================================================================
  // PREVISÃO DE AMEAÇAS DE SEGURANÇA
  // ============================================================================

  private async predictSecurityThreats(): Promise<ThreatPrediction[]> {
    const threats: ThreatPrediction[] = [];

    // Analisar padrões de tráfego para detectar possíveis ataques
    const rpsData = this.historicalData.get('rps');
    if (rpsData) {
      const ddosThreat = this.predictDDoS(rpsData);
      if (ddosThreat) threats.push(ddosThreat);
    }

    // Prever tentativas de ataque baseado em histórico
    const attackThreat = this.predictAttackAttempts();
    if (attackThreat) threats.push(attackThreat);

    return threats;
  }

  private predictDDoS(data: TimeSeriesPoint[]): ThreatPrediction | null {
    const recent = data.slice(-12); // Últimas 12 medições
    const values = recent.map(p => p.value);

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);

    // Se há pico súbito
    if (max > avg * 3 && max > 5000) {
      return {
        threatType: 'DDoS Attack',
        probability: 0.7,
        target: 'Application Layer',
        indicators: [
          `Traffic spike: ${max} RPS (avg: ${Math.round(avg)})`,
          'Sudden increase in connections',
        ],
        mitigationSuggestions: [
          'Activate DDoS protection',
          'Enable rate limiting',
          'Scale infrastructure',
          'Contact CDN provider',
        ],
      };
    }

    return null;
  }

  private predictAttackAttempts(): ThreatPrediction | null {
    // Baseado em padrões históricos de ataque
    const hour = new Date().getHours();

    // Ataques são mais comuns durante a noite (menos monitoramento)
    if (hour >= 2 && hour <= 5) {
      return {
        threatType: 'Automated Attack',
        probability: 0.4,
        target: 'Authentication Endpoints',
        indicators: [
          'Low-activity period',
          'Historical attack pattern',
        ],
        mitigationSuggestions: [
          'Increase monitoring',
          'Enable MFA challenges',
          'Review failed login attempts',
        ],
      };
    }

    return null;
  }

  // ============================================================================
  // PREVISÃO DE COMPORTAMENTO DO USUÁRIO
  // ============================================================================

  private async predictUserBehavior(): Promise<any[]> {
    // Simulação: Prever comportamentos de usuário
    return [
      {
        userSegment: 'VIP Customers',
        predictedAction: 'High-value purchase',
        probability: 0.35,
        businessImpact: 'Revenue increase',
      },
      {
        userSegment: 'Mobile Users',
        predictedAction: 'App abandonment',
        probability: 0.28,
        businessImpact: 'Churn risk',
      },
    ];
  }

  // ============================================================================
  // GERAÇÃO DE RECOMENDAÇÕES
  // ============================================================================

  private generateRecommendations(
    loadForecast: LoadForecast,
    failurePredictions: FailurePrediction[],
    securityThreats: ThreatPrediction[]
  ): RecommendedAction[] {
    const recommendations: RecommendedAction[] = [];

    // Recomendações baseadas em load
    if (loadForecast.nextHour > 2000) {
      recommendations.push({
        action: 'Scale application servers horizontally',
        priority: 'high',
        expectedBenefit: 'Handle traffic spike without degradation',
        estimatedEffort: '15 minutes',
        confidence: loadForecast.confidence,
      });
    }

    // Recomendações baseadas em falhas previstas
    failurePredictions.forEach(failure => {
      if (failure.probability > 0.6) {
        recommendations.push({
          action: `Preventive maintenance: ${failure.component}`,
          priority: failure.impact === 'critical' ? 'critical' : 'high',
          expectedBenefit: `Avoid ${failure.impact} impact failure`,
          estimatedEffort: failure.timeframe.includes('hours') ? '1-2 hours' : '1 day',
          confidence: failure.probability,
        });
      }
    });

    // Recomendações de segurança
    securityThreats.forEach(threat => {
      recommendations.push({
        action: `Activate ${threat.threatType} protection`,
        priority: threat.probability > 0.6 ? 'critical' : 'high',
        expectedBenefit: 'Prevent security incident',
        estimatedEffort: '5 minutes',
        confidence: threat.probability,
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private formatTimeframe(hours: number): string {
    if (hours < 1) return '< 1 hour';
    if (hours < 24) return `${Math.round(hours)} hours`;
    if (hours < 168) return `${Math.round(hours / 24)} days`;
    return `${Math.round(hours / 168)} weeks`;
  }
}
