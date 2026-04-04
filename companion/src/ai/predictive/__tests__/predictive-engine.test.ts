import {
  SupremePredictiveEngine,
  ForecastingEngine,
  AnomalyDetectionEngine,
  ProactiveEngine,
  TimeSeries,
} from '../predictive-engine';

describe('SupremePredictiveEngine', () => {
  let engine: SupremePredictiveEngine;

  const mockSeries: TimeSeries = {
    name: 'cpu_usage',
    metric: 'cpu_percent',
    data: Array.from({ length: 100 }, (_, i) => ({
      timestamp: new Date(Date.now() - (100 - i) * 60000),
      value: 40 + Math.sin(i / 10) * 10 + Math.random() * 5,
    })),
    frequency: 'minute',
  };

  beforeEach(() => {
    engine = new SupremePredictiveEngine();
  });

  describe('Basic Operations', () => {
    test('should initialize with all sub-engines', () => {
      expect(engine.getForecasting()).toBeDefined();
      expect(engine.getAnomalyDetection()).toBeDefined();
      expect(engine.getProactiveEngine()).toBeDefined();
    });

    test('should have zero alerts initially', () => {
      expect(engine.getStats().totalAlerts).toBe(0);
    });
  });

  describe('Comprehensive Analysis', () => {
    test('should perform complete analysis', async () => {
      const result = await engine.analyze(mockSeries, {
        forecastHorizon: 'short',
        forecastModel: 'linear',
      });

      expect(result).toBeDefined();
      expect(result.forecast).toBeDefined();
      expect(result.anomalies).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    test('should generate forecast', async () => {
      const result = await engine.analyze(mockSeries);

      expect(result.forecast.predictions).toBeDefined();
      expect(result.forecast.predictions.length).toBeGreaterThan(0);
      expect(result.forecast.accuracy).toBeDefined();
    });

    test('should detect anomalies', async () => {
      // Serie com anomalia
      const seriesWithAnomaly: TimeSeries = {
        name: 'anomaly_test',
        metric: 'test',
        data: [
          ...Array.from({ length: 20 }, (_, i) => ({
            timestamp: new Date(Date.now() - (20 - i) * 60000),
            value: 50,
          })),
          { timestamp: new Date(), value: 200 }, // Anomalia
        ],
        frequency: 'minute',
      };

      const result = await engine.analyze(seriesWithAnomaly);

      expect(result.anomalies.anomalies.length).toBeGreaterThan(0);
    });

    test('should generate recommendations', async () => {
      const result = await engine.analyze(mockSeries);

      expect(result.recommendations).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Forecasting Engine', () => {
    let forecasting: ForecastingEngine;

    beforeEach(() => {
      forecasting = engine.getForecasting();
    });

    test('should forecast with different models', async () => {
      const linear = await forecasting.forecast(mockSeries, 'short', 'linear');
      expect(linear.model).toBe('linear');
      expect(linear.predictions.length).toBeGreaterThan(0);

      const arima = await forecasting.forecast(mockSeries, 'short', 'arima');
      expect(arima.model).toBe('arima');

      const ensemble = await forecasting.forecast(mockSeries, 'short', 'ensemble');
      expect(ensemble.model).toBe('ensemble');
    });

    test('should calculate accuracy metrics', async () => {
      const forecasting = engine.getForecasting();
      const forecast = await forecasting.forecast(mockSeries, 'short', 'linear');

      expect(forecast.accuracy).toBeDefined();
      expect(forecast.accuracy.mape).toBeDefined();
      expect(forecast.accuracy.rmse).toBeDefined();
      expect(forecast.accuracy.r2).toBeDefined();
    });

    test('should detect trend', async () => {
      const trendingSeries: TimeSeries = {
        name: 'trending',
        metric: 'value',
        data: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - (50 - i) * 60000),
          value: i * 2 + Math.random() * 5,
        })),
        frequency: 'minute',
      };

      const forecast = await forecasting.forecast(trendingSeries, 'short', 'linear');

      expect(forecast.trend).toBeDefined();
      expect(forecast.trend?.direction).toBe('up');
    });
  });

  describe('Anomaly Detection', () => {
    test('should detect with different algorithms', async () => {
      const anomalyEngine = engine.getAnomalyDetection();

      const seriesWithOutliers: TimeSeries = {
        name: 'outliers',
        metric: 'value',
        data: [
          ...Array.from({ length: 30 }, () => ({
            timestamp: new Date(),
            value: 50 + Math.random() * 5,
          })),
          { timestamp: new Date(), value: 200 },
          { timestamp: new Date(), value: 10 },
        ],
        frequency: 'minute',
      };

      const statistical = await anomalyEngine.detect(seriesWithOutliers, 'statistical', 0.95);
      expect(statistical.algorithm).toBe('statistical');

      const isolationForest = await anomalyEngine.detect(seriesWithOutliers, 'isolation_forest', 0.95);
      expect(isolationForest.algorithm).toBe('isolation_forest');
    });

    test('should calculate baseline stats', async () => {
      const anomalyEngine = engine.getAnomalyDetection();
      await anomalyEngine.detect(mockSeries, 'statistical');

      const baseline = anomalyEngine.getBaseline(mockSeries.name);
      expect(baseline).toBeDefined();
      expect(baseline?.mean).toBeDefined();
      expect(baseline?.stdDev).toBeDefined();
    });

    test('should classify anomaly severity', async () => {
      const anomalyEngine = engine.getAnomalyDetection();

      const series: TimeSeries = {
        name: 'severity_test',
        metric: 'value',
        data: Array.from({ length: 50 }, (_, i) => ({
          timestamp: new Date(Date.now() - (50 - i) * 60000),
          value: i === 25 ? 500 : 50, // Spike severo
        })),
        frequency: 'minute',
      };

      const result = await anomalyEngine.detect(series, 'statistical', 0.9);
      
      if (result.anomalies.length > 0) {
        expect(['critical', 'high', 'medium', 'low']).toContain(result.anomalies[0].severity);
      }
    });
  });

  describe('Proactive Engine', () => {
    test('should generate forecast recommendations', async () => {
      const proactive = engine.getProactiveEngine();
      const forecasting = engine.getForecasting();

      const forecast = await forecasting.forecast(mockSeries, 'short', 'linear');
      const recommendations = await proactive.generateRecommendations(forecast);

      expect(recommendations).toBeDefined();
    });

    test('should filter recommendations', async () => {
      const proactive = engine.getProactiveEngine();
      const forecasting = engine.getForecasting();

      const forecast = await forecasting.forecast(mockSeries, 'short', 'linear');
      await proactive.generateRecommendations(forecast);

      const allRecs = proactive.getRecommendations();
      const highPriority = proactive.getRecommendations({ minPriority: 8 });

      expect(highPriority.length).toBeLessThanOrEqual(allRecs.length);
    });
  });

  describe('Alerts', () => {
    test('should generate alerts from anomalies', async () => {
      const seriesWithAnomaly: TimeSeries = {
        name: 'alert_test',
        metric: 'value',
        data: [
          ...Array.from({ length: 40 }, () => ({ timestamp: new Date(), value: 50 })),
          { timestamp: new Date(), value: 300 },
        ],
        frequency: 'minute',
      };

      await engine.analyze(seriesWithAnomaly);

      const alerts = engine.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });

    test('should acknowledge alert', async () => {
      const seriesWithAnomaly: TimeSeries = {
        name: 'ack_test',
        metric: 'value',
        data: [
          ...Array.from({ length: 40 }, () => ({ timestamp: new Date(), value: 50 })),
          { timestamp: new Date(), value: 300 },
        ],
        frequency: 'minute',
      };

      await engine.analyze(seriesWithAnomaly);

      const alerts = engine.getAlerts({ acknowledged: false });
      if (alerts.length > 0) {
        const result = engine.acknowledgeAlert(alerts[0].id);
        expect(result).toBe(true);

        const acknowledged = engine.getAlerts({ acknowledged: true });
        expect(acknowledged.length).toBeGreaterThan(0);
      }
    });

    test('should filter alerts', async () => {
      const seriesWithAnomaly: TimeSeries = {
        name: 'filter_test',
        metric: 'value',
        data: [
          ...Array.from({ length: 40 }, () => ({ timestamp: new Date(), value: 50 })),
          { timestamp: new Date(), value: 300 },
        ],
        frequency: 'minute',
      };

      await engine.analyze(seriesWithAnomaly);

      const allAlerts = engine.getAlerts();
      const criticalAlerts = engine.getAlerts({ severity: 'critical' });

      expect(criticalAlerts.length).toBeLessThanOrEqual(allAlerts.length);
    });
  });

  describe('Events', () => {
    test('should emit analysis events', (done) => {
      engine.once('analysis:started', () => {
        done();
      });

      engine.analyze(mockSeries);
    });
  });

  describe('Statistics', () => {
    test('should return complete statistics', async () => {
      const seriesWithAnomaly: TimeSeries = {
        name: 'stats_test',
        metric: 'value',
        data: [
          ...Array.from({ length: 40 }, () => ({ timestamp: new Date(), value: 50 })),
          { timestamp: new Date(), value: 300 },
        ],
        frequency: 'minute',
      };

      await engine.analyze(seriesWithAnomaly);

      const stats = engine.getStats();
      expect(stats).toHaveProperty('totalAlerts');
      expect(stats).toHaveProperty('unacknowledgedAlerts');
      expect(stats).toHaveProperty('recommendations');
    });
  });
});
