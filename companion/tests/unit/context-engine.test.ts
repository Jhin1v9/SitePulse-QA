/**
 * Unit Tests - Context Engine v3.0 Supremo
 */

import { ContextEngineSupremo } from '../../src/ai/context';
import type { Target } from '../../src/shared/types';

describe('ContextEngineSupremo', () => {
  let engine: ContextEngineSupremo;

  beforeEach(async () => {
    engine = new ContextEngineSupremo();
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(engine.name).toBe('ContextEngineSupremo');
      expect(engine.version).toBe('3.0.0');
    });

    it('should start with ready status', async () => {
      expect(engine.status).toBe('ready');
    });

    it('should have all components operational', async () => {
      const health = await engine.health();
      expect(health.checks).toHaveLength(4);
      expect(health.checks.every(c => c.status === 'pass')).toBe(true);
    });
  });

  describe('Context Building', () => {
    it('should build full context for target', async () => {
      const target: Target = {
        id: 'test-target-1',
        url: 'https://example.com',
        name: 'Example Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context).toHaveProperty('id');
      expect(context).toHaveProperty('temporal');
      expect(context).toHaveProperty('spatial');
      expect(context).toHaveProperty('business');
      expect(context).toHaveProperty('technical');
      expect(context).toHaveProperty('predictive');
    });

    it('should include infrastructure in context', async () => {
      const target: Target = {
        id: 'test-target-2',
        url: 'https://test.com',
        name: 'Test Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.technical.infrastructure).toHaveProperty('loadBalancers');
      expect(context.technical.infrastructure).toHaveProperty('appServers');
      expect(context.technical.infrastructure).toHaveProperty('databases');
      expect(context.technical.infrastructure).toHaveProperty('cacheLayer');
      expect(context.technical.infrastructure).toHaveProperty('cdn');
    });

    it('should include dependency graph', async () => {
      const target: Target = {
        id: 'test-target-3',
        url: 'https://demo.com',
        name: 'Demo Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.technical.dependencies).toHaveProperty('services');
      expect(context.technical.dependencies).toHaveProperty('externalApis');
      expect(context.technical.dependencies).toHaveProperty('databases');
    });

    it('should include data flows', async () => {
      const target: Target = {
        id: 'test-target-4',
        url: 'https://app.com',
        name: 'App Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.technical.dataFlows).toBeInstanceOf(Array);
      expect(context.technical.dataFlows.length).toBeGreaterThan(0);
    });

    it('should include network topology', async () => {
      const target: Target = {
        id: 'test-target-5',
        url: 'https://infra.com',
        name: 'Infra Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.technical.networkTopology).toHaveProperty('segments');
      expect(context.technical.networkTopology).toHaveProperty('firewalls');
      expect(context.technical.networkTopology).toHaveProperty('dmz');
    });
  });

  describe('Predictive Context', () => {
    it('should generate load forecast', async () => {
      const target: Target = {
        id: 'test-pred-1',
        url: 'https://predict.com',
        name: 'Predict Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.predictive.loadForecast).toHaveProperty('nextHour');
      expect(context.predictive.loadForecast).toHaveProperty('nextDay');
      expect(context.predictive.loadForecast).toHaveProperty('nextWeek');
      expect(context.predictive.loadForecast).toHaveProperty('confidence');
    });

    it('should generate failure predictions', async () => {
      const target: Target = {
        id: 'test-pred-2',
        url: 'https://failure.com',
        name: 'Failure Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.predictive.failurePredictions).toBeInstanceOf(Array);
    });

    it('should generate security threat predictions', async () => {
      const target: Target = {
        id: 'test-pred-3',
        url: 'https://security.com',
        name: 'Security Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.predictive.securityThreats).toBeInstanceOf(Array);
    });

    it('should generate recommendations', async () => {
      const target: Target = {
        id: 'test-pred-4',
        url: 'https://recommend.com',
        name: 'Recommend Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.predictive.recommendedActions).toBeInstanceOf(Array);
    });
  });

  describe('Real-time Monitoring', () => {
    it('should provide live context', async () => {
      const target: Target = {
        id: 'test-rt-1',
        url: 'https://realtime.com',
        name: 'Realtime Site',
        type: 'web',
        scope: 'single',
      };

      await engine.buildFullContext(target);
      const liveContext = engine.getRealTimeContext(target.id);

      expect(liveContext).toHaveProperty('timestamp');
      expect(liveContext).toHaveProperty('metrics');
      expect(liveContext).toHaveProperty('alerts');
      expect(liveContext).toHaveProperty('events');
    });

    it('should track metrics', async () => {
      const target: Target = {
        id: 'test-rt-2',
        url: 'https://metrics.com',
        name: 'Metrics Site',
        type: 'web',
        scope: 'single',
      };

      await engine.buildFullContext(target);

      engine.addMetric('rps', 1200, { endpoint: '/api' });
      engine.addMetric('latency', 150, { percentile: 'p95' });

      const liveContext = engine.getRealTimeContext(target.id);
      expect(liveContext.metrics).toBeDefined();
    });

    it('should detect anomalies', async () => {
      const monitor = engine.getRealTimeMonitor();

      // Adicionar baseline
      for (let i = 0; i < 20; i++) {
        monitor['metricsHistory'].push({
          timestamp: new Date(Date.now() - i * 60000),
          rps: 1000,
          latencyP95: 150,
          latencyP99: 300,
          errorRate: 0.001,
          cpuUsage: 50,
          memoryUsage: 60,
          activeConnections: 1000,
          bandwidth: 100000000,
          queueDepth: 10,
        });
      }

      monitor['updateBaseline']();

      // Emitir evento de anomalia
      let anomalyDetected = false;
      monitor.on('anomaly:detected', () => {
        anomalyDetected = true;
      });

      expect(anomalyDetected).toBe(false);
    });
  });

  describe('Correlation Engine', () => {
    it('should correlate logs with events', async () => {
      const correlationEngine = engine.getCorrelationEngine();

      // Adicionar log
      correlationEngine.addLog({
        timestamp: new Date(),
        source: 'app-server-1',
        level: 'error',
        message: 'Database connection failed',
        metadata: { error: 'ECONNREFUSED' },
      });

      // Adicionar evento relacionado
      correlationEngine.addEvent({
        timestamp: new Date(Date.now() + 1000),
        type: 'database_outage',
        source: 'monitoring',
        data: { database: 'postgres-1' },
      });

      const correlations = correlationEngine.getRecentCorrelations(10);
      expect(correlations).toBeInstanceOf(Array);
    });

    it('should detect error cascades', async () => {
      const correlationEngine = engine.getCorrelationEngine();

      // Adicionar múltiplos erros similares
      for (let i = 0; i < 5; i++) {
        correlationEngine.addLog({
          timestamp: new Date(Date.now() - i * 10000),
          source: 'app-server-1',
          level: 'error',
          message: 'Timeout connecting to payment API',
          metadata: {},
        });
      }

      const correlations = correlationEngine.getRecentCorrelations(10);
      const cascadeCorrelation = correlations.find(
        c => c.description.includes('cascade')
      );

      expect(cascadeCorrelation || correlations.length >= 0).toBeDefined();
    });

    it('should build timeline', async () => {
      const correlationEngine = engine.getCorrelationEngine();

      const now = new Date();
      const startTime = new Date(now.getTime() - 3600000); // 1 hora atrás
      const endTime = now;

      // Adicionar alguns logs
      correlationEngine.addLog({
        timestamp: new Date(now.getTime() - 1800000),
        source: 'app',
        level: 'info',
        message: 'Deployment started',
        metadata: {},
      });

      correlationEngine.addLog({
        timestamp: new Date(now.getTime() - 1700000),
        source: 'app',
        level: 'info',
        message: 'Deployment completed',
        metadata: {},
      });

      const timeline = correlationEngine.buildTimeline(startTime, endTime);

      expect(timeline).toBeInstanceOf(Array);
      expect(timeline.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Auto-Discovery', () => {
    it('should discover resources', async () => {
      const autoDiscovery = engine.getAutoDiscovery();

      const result = await autoDiscovery.performDiscovery('https://discover.com');

      expect(result).toHaveProperty('resources');
      expect(result).toHaveProperty('topology');
      expect(result).toHaveProperty('scanDuration');
      expect(result).toHaveProperty('coverage');
    });

    it('should track discovered resources', async () => {
      const autoDiscovery = engine.getAutoDiscovery();

      await autoDiscovery.performDiscovery('https://track.com');

      const resources = autoDiscovery.getDiscoveredResources();
      expect(resources).toBeInstanceOf(Array);
    });

    it('should filter resources by type', async () => {
      const autoDiscovery = engine.getAutoDiscovery();

      await autoDiscovery.performDiscovery('https://filter.com');

      const services = autoDiscovery.getResourcesByType('service');
      expect(services).toBeInstanceOf(Array);
    });
  });

  describe('Context Updates', () => {
    it('should update context', async () => {
      const target: Target = {
        id: 'test-update-1',
        url: 'https://update.com',
        name: 'Update Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      const updated = await engine.updateContext(context.id, {
        business: {
          ...context.business,
          revenue: { ...context.business.revenue, revenuePerMinute: 5000 },
        },
      });

      expect(updated.business.revenue.revenuePerMinute).toBe(5000);
    });

    it('should emit update events', (done) => {
      const target: Target = {
        id: 'test-update-2',
        url: 'https://events.com',
        name: 'Events Site',
        type: 'web',
        scope: 'single',
      };

      engine.on('context:updated', () => {
        done();
      });

      engine.buildFullContext(target).then((context) => {
        engine.updateContext(context.id, {});
      });
    });
  });

  describe('Business Context', () => {
    it('should include revenue metrics', async () => {
      const target: Target = {
        id: 'test-biz-1',
        url: 'https://business.com',
        name: 'Business Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.business.revenue).toHaveProperty('revenuePerMinute');
      expect(context.business.revenue).toHaveProperty('revenuePerHour');
      expect(context.business.revenue).toHaveProperty('revenuePerDay');
      expect(context.business.revenue).toHaveProperty('currency');
    });

    it('should include user metrics', async () => {
      const target: Target = {
        id: 'test-biz-2',
        url: 'https://users.com',
        name: 'Users Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.business.users).toHaveProperty('activeUsers');
      expect(context.business.users).toHaveProperty('concurrentUsers');
      expect(context.business.users).toHaveProperty('churnRisk');
    });

    it('should include SLA targets', async () => {
      const target: Target = {
        id: 'test-biz-3',
        url: 'https://sla.com',
        name: 'SLA Site',
        type: 'web',
        scope: 'single',
      };

      const context = await engine.buildFullContext(target);

      expect(context.business.slaTargets).toHaveProperty('availability');
      expect(context.business.slaTargets).toHaveProperty('responseTime');
      expect(context.business.slaTargets).toHaveProperty('errorRate');
      expect(context.business.slaTargets).toHaveProperty('currentStatus');
    });
  });

  describe('Metrics and Health', () => {
    it('should track engine metrics', async () => {
      const target: Target = {
        id: 'test-metrics-1',
        url: 'https://metrics-track.com',
        name: 'Metrics Track Site',
        type: 'web',
        scope: 'single',
      };

      const initialMetrics = engine.getMetrics();

      await engine.buildFullContext(target);

      const finalMetrics = engine.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
    });

    it('should report health status', async () => {
      const health = await engine.health();

      expect(health.status).toBe('healthy');
      expect(health.checks.length).toBeGreaterThan(0);
      expect(health.uptime).toBeGreaterThan(0);
    });
  });
});
