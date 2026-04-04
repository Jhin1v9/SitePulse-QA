import { MultiObjectiveOptimizer, Objective, Option } from '../multi-objective';

describe('MultiObjectiveOptimizer', () => {
  let optimizer: MultiObjectiveOptimizer;

  beforeEach(() => {
    optimizer = new MultiObjectiveOptimizer();
  });

  describe('Basic Operations', () => {
    test('should add objectives', () => {
      const objective: Objective = {
        name: 'cost',
        direction: 'minimize',
        weight: 0.5,
        priority: 1,
      };

      optimizer.addObjective(objective);
      expect(optimizer.getStats().objectives).toBe(1);
    });

    test('should add constraints', () => {
      optimizer.addConstraint({
        name: 'budget',
        type: 'hard',
        evaluate: () => true,
        violationPenalty: 100,
      });

      expect(optimizer.getStats().constraints).toBe(1);
    });

    test('should clear all data', () => {
      optimizer.addObjective({
        name: 'cost',
        direction: 'minimize',
        weight: 0.5,
        priority: 1,
      });

      optimizer.clear();
      expect(optimizer.getStats().objectives).toBe(0);
    });
  });

  describe('Optimization', () => {
    beforeEach(() => {
      optimizer.addObjective({ name: 'cost', direction: 'minimize', weight: 0.6, priority: 1 });
      optimizer.addObjective({ name: 'quality', direction: 'maximize', weight: 0.4, priority: 2 });
    });

    test('should optimize with multiple objectives', () => {
      const options: Option[] = [
        { id: '1', name: 'Cheap', description: 'Low cost, low quality', values: { cost: 10, quality: 50 } },
        { id: '2', name: 'Balanced', description: 'Medium cost, medium quality', values: { cost: 50, quality: 70 } },
        { id: '3', name: 'Premium', description: 'High cost, high quality', values: { cost: 100, quality: 95 } },
      ];

      const result = optimizer.optimize(options);

      expect(result.paretoFront).toBeDefined();
      expect(result.paretoFront.length).toBeGreaterThan(0);
      expect(result.bestCompromise).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
    });

    test('should find Pareto-optimal solutions', () => {
      const options: Option[] = [
        { id: '1', name: 'A', description: 'Option A', values: { cost: 10, quality: 80 } },
        { id: '2', name: 'B', description: 'Option B', values: { cost: 20, quality: 70 } },
        { id: '3', name: 'C', description: 'Option C', values: { cost: 10, quality: 70 } },
      ];

      const result = optimizer.optimize(options);

      expect(result.paretoFront.length).toBeGreaterThanOrEqual(1);
    });

    test('should calculate trade-offs', () => {
      const options: Option[] = [
        { id: '1', name: 'A', description: 'Option A', values: { cost: 100, quality: 100 } },
        { id: '2', name: 'B', description: 'Option B', values: { cost: 50, quality: 50 } },
        { id: '3', name: 'C', description: 'Option C', values: { cost: 0, quality: 0 } },
      ];

      const result = optimizer.optimize(options);

      expect(result.tradeOffs.pairs).toBeDefined();
      expect(result.tradeOffs.pairs.length).toBeGreaterThan(0);
    });

    test('should calculate sensitivity', () => {
      const options: Option[] = [
        { id: '1', name: 'A', description: 'Option A', values: { cost: 10, quality: 80 } },
        { id: '2', name: 'B', description: 'Option B', values: { cost: 20, quality: 70 } },
      ];

      const result = optimizer.optimize(options);

      expect(result.sensitivity).toBeDefined();
      expect(result.sensitivity.weightImpact).toBeDefined();
    });
  });

  describe('Constraints', () => {
    beforeEach(() => {
      optimizer.addObjective({ name: 'value', direction: 'maximize', weight: 1, priority: 1 });
    });

    test('should respect hard constraints', () => {
      optimizer.addConstraint({
        name: 'max_cost',
        type: 'hard',
        evaluate: (option) => (option.values.cost as number) <= 50,
        violationPenalty: 1000,
      });

      const options: Option[] = [
        { id: '1', name: 'Valid', description: 'Valid option', values: { value: 100, cost: 40 } },
        { id: '2', name: 'Invalid', description: 'Invalid option', values: { value: 200, cost: 100 } },
      ];

      const result = optimizer.optimize(options);
      expect(result.bestCompromise.option.id).toBe('1');
    });
  });

  describe('Events', () => {
    test('should emit events', (done) => {
      optimizer.once('optimization:started', () => {
        done();
      });

      optimizer.addObjective({ name: 'x', direction: 'maximize', weight: 1, priority: 1 });
      optimizer.optimize([{ id: '1', name: 'test', description: 'test', values: { x: 1 } }]);
    });
  });
});
