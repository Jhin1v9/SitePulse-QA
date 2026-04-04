import { CausalInferenceEngine, Variable } from '../causal-inference';

describe('CausalInferenceEngine', () => {
  let engine: CausalInferenceEngine;

  beforeEach(() => {
    engine = new CausalInferenceEngine();
  });

  describe('Basic Operations', () => {
    test('should build causal graph', () => {
      const variables: Variable[] = [
        { name: 'treatment', type: 'binary' },
        { name: 'outcome', type: 'continuous' },
      ];

      const edges = [
        { from: 'treatment', to: 'outcome', strength: 0.5, type: 'direct' as const },
      ];

      const graph = engine.buildGraph('g1', variables, edges);

      expect(graph).toBeDefined();
      expect(graph.variables).toHaveLength(2);
    });

    test('should load data', () => {
      const data = [
        { treatment: 1, outcome: 10 },
        { treatment: 0, outcome: 5 },
      ];

      engine.loadData('d1', data);
      expect(engine.getStats().datasets).toBe(1);
    });

    test('should clear all data', () => {
      engine.clear();
      expect(engine.getStats().graphs).toBe(0);
    });
  });

  describe('Causal Effect Estimation', () => {
    beforeEach(() => {
      const data = [
        { treatment: 1, outcome: 12 },
        { treatment: 1, outcome: 10 },
        { treatment: 0, outcome: 5 },
        { treatment: 0, outcome: 6 },
      ];

      engine.loadData('test_data', data);
    });

    test('should calculate ATE', () => {
      const effect = engine.calculateAverageTreatmentEffect('test_data', 'treatment', 'outcome');

      expect(effect).toBeDefined();
      expect(effect.effect).toBeGreaterThan(0);
      expect(effect.method).toBe('ATE_naive');
    });

    test('should calculate confidence interval', () => {
      const ci = engine.calculateConfidenceInterval('test_data', 'treatment', 'outcome');

      expect(ci).toBeDefined();
      expect(ci.lower).toBeLessThan(ci.upper);
    });
  });

  describe('Causal Discovery', () => {
    beforeEach(() => {
      const data = Array.from({ length: 50 }, (_, i) => ({
        x: i + Math.random() * 10,
        y: 2 * i + Math.random() * 10,
      }));

      engine.loadData('discover_data', data);
    });

    test('should discover relationships', () => {
      const discovery = engine.discoverCausalRelationships('discover_data', ['x', 'y']);

      expect(discovery).toBeDefined();
      expect(discovery.relationships).toBeDefined();
    });
  });

  describe('Counterfactual', () => {
    beforeEach(() => {
      const data = Array.from({ length: 30 }, () => ({
        treatment: Math.random() > 0.5 ? 1 : 0,
        outcome: Math.random() * 100,
      }));

      engine.loadData('cf_data', data);
    });

    test('should calculate counterfactual', () => {
      const observation = { treatment: 0, outcome: 40 };
      const intervention = { treatment: 1 };

      const counterfactual = engine.calculateCounterfactual('cf_data', observation, intervention);

      expect(counterfactual).toBeDefined();
      expect(counterfactual.counterfactual).toHaveProperty('treatment', 1);
    });
  });

  describe('Events', () => {
    test('should emit events', (done) => {
      engine.once('data:loaded', () => {
        done();
      });

      engine.loadData('e1', [{ x: 1 }]);
    });
  });
});
