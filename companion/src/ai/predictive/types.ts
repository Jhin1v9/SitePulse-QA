/**
 * PREDICTIVE ENGINE TYPES - Semana 14-15 v3.0 Supremo
 */

export type ForecastModel = 'arima' | 'prophet' | 'lstm' | 'ensemble' | 'linear';
export type AnomalyAlgorithm = 'isolation_forest' | 'lof' | 'one_class_svm' | 'statistical' | 'autoencoder';
export type TimeHorizon = 'immediate' | 'short' | 'medium' | 'long';

export interface TimeSeries {
  name: string;
  metric: string;
  data: DataPoint[];
  frequency: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month';
  seasonality?: number;
  trend?: TrendInfo;
}

export interface DataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}

export interface TrendInfo {
  direction: 'up' | 'down' | 'stable';
  slope: number;
  strength: number;
  changepoints: Date[];
}

export interface Forecast {
  metric: string;
  horizon: TimeHorizon;
  predictions: PredictionPoint[];
  confidence: number;
  model: ForecastModel;
  seasonality?: SeasonalityInfo;
  trend?: TrendInfo;
  accuracy: AccuracyMetrics;
}

export interface PredictionPoint {
  timestamp: Date;
  predictedValue: number;
  confidenceInterval: [number, number];
  probability: number;
}

export interface SeasonalityInfo {
  period: number;
  strength: number;
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
}

export interface AccuracyMetrics {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
  mae: number; // Mean Absolute Error
  r2: number; // R-squared
  confidence: number;
}

export interface AnomalyDetection {
  metric: string;
  algorithm: AnomalyAlgorithm;
  anomalies: Anomaly[];
  threshold: number;
  sensitivity: number;
  baseline: BaselineStats;
}

export interface Anomaly {
  timestamp: Date;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'spike' | 'drop' | 'trend_change' | 'seasonality_break';
  context: AnomalyContext;
}

export interface AnomalyContext {
  surroundingValues: number[];
  recentTrend: TrendInfo;
  similarAnomalies?: string[];
  possibleCauses?: string[];
}

export interface BaselineStats {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  percentiles: Record<string, number>;
}

export interface ProactiveRecommendation {
  id: string;
  type: 'preventive' | 'optimizing' | 'corrective' | 'strategic';
  priority: number;
  confidence: number;
  title: string;
  description: string;
  predictedIssue: PredictedIssue;
  suggestedActions: SuggestedAction[];
  timeframe: TimeHorizon;
  impact: ImpactAssessment;
  prerequisites: string[];
}

export interface PredictedIssue {
  type: string;
  probability: number;
  expectedTime: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedSystems: string[];
  businessImpact: string;
}

export interface SuggestedAction {
  id: string;
  description: string;
  actionType: string;
  estimatedEffort: number;
  estimatedImpact: number;
  automationLevel: 'full' | 'partial' | 'manual';
  risks: string[];
}

export interface ImpactAssessment {
  cost: number;
  time: number;
  resources: number;
  riskReduction: number;
  benefit: number;
  roi: number;
}

export interface CorrelationAnalysis {
  metrics: string[];
  correlations: Correlation[];
  lagCorrelations: LagCorrelation[];
  causalRelationships: CausalRelationship[];
}

export interface Correlation {
  metric1: string;
  metric2: string;
  coefficient: number;
  significance: number;
  direction: 'positive' | 'negative';
  strength: 'strong' | 'moderate' | 'weak';
}

export interface LagCorrelation {
  metric1: string;
  metric2: string;
  lag: number;
  coefficient: number;
  direction: 'lead' | 'lag';
}

export interface CausalRelationship {
  cause: string;
  effect: string;
  strength: number;
  confidence: number;
  mechanism?: string;
}

export interface Pattern {
  id: string;
  name: string;
  type: 'seasonal' | 'trend' | 'cycle' | 'anomaly_pattern' | 'correlation';
  description: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  frequency: number;
  metrics: string[];
}

export interface PredictionContext {
  domain: string;
  timeRange: { start: Date; end: Date };
  granularity: string;
  filters: Record<string, string[]>;
  externalFactors: ExternalFactor[];
}

export interface ExternalFactor {
  name: string;
  type: 'economic' | 'seasonal' | 'event' | 'competitor' | 'regulatory';
  impact: number;
  timeframe: { start: Date; end: Date };
}

export interface ModelPerformance {
  model: ForecastModel;
  accuracy: AccuracyMetrics;
  trainingTime: number;
  predictionTime: number;
  lastTrained: Date;
  datasetSize: number;
}

export interface Alert {
  id: string;
  type: 'forecast_deviation' | 'anomaly' | 'trend_change' | 'threshold_breach';
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  metric: string;
  message: string;
  predictedValue: number;
  actualValue: number;
  recommendation?: string;
  acknowledged: boolean;
}
