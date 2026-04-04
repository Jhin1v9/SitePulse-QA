/**
 * Unit Tests - Learning Engine v3.0 Supremo
 */

import { LearningEngineSupremo } from '../../src/ai/learning';
import type { State, Action } from '../../src/ai/learning/rl-engine';
import type { Domain, Model } from '../../src/ai/learning/transfer-learning';

describe('LearningEngineSupremo', () => {
  let engine: LearningEngineSupremo;

  beforeEach(async () => {
    engine = new LearningEngineSupremo();
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(engine.name).toBe('LearningEngineSupremo');
      expect(engine.version).toBe('3.0.0');
    });

    it('should start with ready status', async () => {
      expect(engine.status).toBe('ready');
    });

    it('should have all components operational', async () => {
      const health = await engine.health();
      expect(health.checks).toHaveLength(3);
      expect(health.checks.every(c => c.status === 'pass')).toBe(true);
    });
  });

  describe('Reinforcement Learning', () => {
    it('should select action', async () => {
      const state: State = {
        id: 'state-1',
        features: { vulnerability_count: 0.8, severity: 0.9 },
        context: {},
        timestamp: new Date(),
      };

      const actions: Action[] = [
        { id: 'scan', type: 'security_scan', parameters: {} },
        { id: 'ignore', type: 'ignore', parameters: {} },
      ];

      const result = await engine.decide(state, actions);

      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('exploration');
    });

    it('should learn from feedback', async () => {
      const state: State = {
        id: 'state-1',
        features: { risk: 0.9 },
        context: {},
        timestamp: new Date(),
      };

      const action: Action = {
        id: 'scan',
        type: 'security_scan',
        parameters: {},
      };

      const nextState: State = {
        id: 'state-2',
        features: { risk: 0.3 },
        context: {},
        timestamp: new Date(),
      };

      await engine.learn(state, action, 'success', { duration: 1000, accuracy: 0.95 }, nextState);

      // Verificar se a experiencia foi adicionada
      const stats = engine.getRLEngine().getStats();
      expect(stats.totalExperiences).toBeGreaterThan(0);
    });

    it('should track episodes', async () => {
      engine.startEpisode();

      const state: State = {
        id: 'state-1',
        features: { feature1: 0.5 },
        context: {},
        timestamp: new Date(),
      };

      const action: Action = {
        id: 'action-1',
        type: 'test',
        parameters: {},
      };

      const nextState: State = {
        id: 'state-2',
        features: { feature1: 0.6 },
        context: {},
        timestamp: new Date(),
      };

      await engine.learn(state, action, 'success', { duration: 100 }, nextState);

      const result = engine.endEpisode();

      expect(result).toHaveProperty('episode');
      expect(result).toHaveProperty('epsilon');
    });

    it('should calculate reward', async () => {
      const rl = engine.getRLEngine();

      const reward = rl.calculateReward('success', {
        duration: 500,
        accuracy: 0.9,
        resourceUsage: 0.3,
      });

      expect(reward).toHaveProperty('value');
      expect(reward).toHaveProperty('components');
      expect(reward.value).toBeGreaterThan(0);
    });
  });

  describe('Transfer Learning', () => {
    it('should register domain', async () => {
      const domain: Domain = {
        id: 'security-domain',
        name: 'Security Audits',
        type: 'security',
        features: ['vulnerabilities', 'severity', 'exposure'],
        dataDistribution: {
          vulnerabilities: { mean: 10, std: 5, min: 0, max: 50 },
        },
        sampleCount: 1000,
      };

      engine.registerDomain(domain);

      const stats = engine.getTransferEngine().getStats();
      expect(stats.totalDomains).toBe(1);
    });

    it('should calculate domain similarity', async () => {
      const sourceDomain: Domain = {
        id: 'source',
        name: 'Source',
        type: 'security',
        features: ['feature1', 'feature2'],
        dataDistribution: {
          feature1: { mean: 10, std: 2, min: 0, max: 20 },
        },
        sampleCount: 100,
      };

      const targetDomain: Domain = {
        id: 'target',
        name: 'Target',
        type: 'security',
        features: ['feature1', 'feature2'],
        dataDistribution: {
          feature1: { mean: 11, std: 2.5, min: 0, max: 22 },
        },
        sampleCount: 50,
      };

      engine.registerDomain(sourceDomain);
      engine.registerDomain(targetDomain);

      const similarity = engine.getTransferEngine().calculateDomainSimilarity('source', 'target');

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should find best source models', async () => {
      const domain: Domain = {
        id: 'test-domain',
        name: 'Test',
        type: 'security',
        features: ['f1'],
        dataDistribution: {},
        sampleCount: 100,
      };

      const model: Model = {
        id: 'model-1',
        domain: 'test-domain',
        type: 'classifier',
        parameters: {},
        performance: {
          accuracy: 0.9,
          precision: 0.88,
          recall: 0.85,
          f1Score: 0.865,
        },
        trainedAt: new Date(),
        version: '1.0',
      };

      engine.registerDomain(domain);
      engine.registerModel(model);

      const bestModels = engine.getTransferEngine().findBestSourceModels('test-domain', 3);

      expect(bestModels).toBeInstanceOf(Array);
    });
  });

  describe('Explainability', () => {
    it('should generate SHAP explanation', async () => {
      const xai = engine.getXAIEngine();

      const explanation = xai.explainSHAP(
        'critical_vulnerability',
        { severity: 0.9, exposure: 0.8, impact: 0.95 },
        {}
      );

      expect(explanation).toHaveProperty('prediction');
      expect(explanation).toHaveProperty('featureImportance');
      expect(explanation).toHaveProperty('naturalLanguage');
      expect(explanation.featureImportance.length).toBeGreaterThan(0);
    });

    it('should generate LIME explanation', async () => {
      const xai = engine.getXAIEngine();

      const explanation = xai.explainLIME(
        'high_risk',
        { risk_score: 0.85, exposure: 0.7 },
        100
      );

      expect(explanation).toHaveProperty('prediction');
      expect(explanation).toHaveProperty('featureImportance');
    });

    it('should detect bias', async () => {
      const xai = engine.getXAIEngine();

      const predictions = [
        { features: { group: 'A', sensitive: 1 }, prediction: 'positive' },
        { features: { group: 'A', sensitive: 1 }, prediction: 'positive' },
        { features: { group: 'B', sensitive: 0 }, prediction: 'negative' },
        { features: { group: 'B', sensitive: 0 }, prediction: 'negative' },
      ];

      const biasReport = xai.detectBias(predictions, ['sensitive']);

      expect(biasReport).toHaveProperty('detected');
      expect(biasReport).toHaveProperty('metrics');
      expect(biasReport).toHaveProperty('recommendations');
    });

    it('should generate counterfactuals', async () => {
      const xai = engine.getXAIEngine();

      const counterfactuals = xai.generateCounterfactuals(
        { severity: 0.9, exposure: 0.8 },
        'low_risk',
        2
      );

      expect(counterfactuals).toBeInstanceOf(Array);
      expect(counterfactuals.length).toBeGreaterThan(0);
    });
  });

  describe('Decision with Explanation', () => {
    it('should provide explanation with decision', async () => {
      const state: State = {
        id: 'risky-state',
        features: { vulnerability_count: 0.9, severity: 0.85 },
        context: {},
        timestamp: new Date(),
      };

      const actions: Action[] = [
        { id: 'immediate_scan', type: 'scan', parameters: {} },
        { id: 'schedule_scan', type: 'schedule', parameters: {} },
      ];

      const result = await engine.decide(state, actions);

      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('explanation');
      expect(result).toHaveProperty('confidence');
    });
  });

  describe('Training Stats', () => {
    it('should track training statistics', async () => {
      const initialStats = engine.getTrainingStats();

      engine.startEpisode();

      const state: State = {
        id: 'state-1',
        features: { f1: 0.5 },
        context: {},
        timestamp: new Date(),
      };

      const action: Action = {
        id: 'action-1',
        type: 'test',
        parameters: {},
      };

      const nextState: State = {
        id: 'state-2',
        features: { f1: 0.6 },
        context: {},
        timestamp: new Date(),
      };

      await engine.learn(state, action, 'success', { duration: 100 }, nextState);

      engine.endEpisode();

      const finalStats = engine.getTrainingStats();

      expect(finalStats.totalEpisodes).toBeGreaterThan(initialStats.totalEpisodes);
    });
  });

  describe('Metrics', () => {
    it('should track metrics', async () => {
      const initialMetrics = engine.getMetrics();

      const state: State = {
        id: 'state-1',
        features: { f1: 0.5 },
        context: {},
        timestamp: new Date(),
      };

      const actions: Action[] = [
        { id: 'action-1', type: 'test', parameters: {} },
      ];

      await engine.decide(state, actions);

      const finalMetrics = engine.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
    });
  });
});
