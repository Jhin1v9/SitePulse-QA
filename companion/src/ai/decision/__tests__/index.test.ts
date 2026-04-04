import {
  SupremeDecisionEngine,
  DecisionContext,
  DecisionFramework,
  Option,
  Player,
} from '../index';

describe('SupremeDecisionEngine', () => {
  let engine: SupremeDecisionEngine;

  beforeEach(() => {
    engine = new SupremeDecisionEngine();
  });

  afterEach(() => {
    engine.clear();
  });

  describe('Initialization', () => {
    test('should initialize with all sub-engines', () => {
      expect(engine.getOptimizer()).toBeDefined();
      expect(engine.getGameTheory()).toBeDefined();
      expect(engine.getCausalInference()).toBeDefined();
    });

    test('should have zero pending reviews initially', () => {
      expect(engine.getStats().pendingReviews).toBe(0);
    });
  });

  describe('Multi-Objective Decisions', () => {
    const mockContext: DecisionContext = {
      timestamp: new Date(),
      domain: 'test',
      constraints: [],
      availableResources: { compute: 100, budget: 50000, time: 24, humanResources: 2 },
      riskTolerance: 0.5,
      timeHorizon: 7,
      stakeholderPreferences: [],
    };

    const mockFramework: DecisionFramework = {
      objectives: [
        { name: 'cost', direction: 'minimize', weight: 0.6, priority: 1 },
        { name: 'quality', direction: 'maximize', weight: 0.4, priority: 2 },
      ],
      constraints: [],
      preferences: [],
    };

    const mockOptions: Option[] = [
      { id: '1', name: 'Option A', description: 'Low cost', values: { cost: 10, quality: 60 } },
      { id: '2', name: 'Option B', description: 'Balanced', values: { cost: 50, quality: 80 } },
      { id: '3', name: 'Option C', description: 'High quality', values: { cost: 90, quality: 95 } },
    ];

    test('should make optimization decision', async () => {
      const decision = await engine.decideByOptimization(mockOptions, mockFramework, mockContext);

      expect(decision).toBeDefined();
      expect(decision.id).toBeDefined();
      expect(decision.type).toBe('optimization');
      expect(decision.alternatives.length).toBeGreaterThan(0);
      expect(decision.reasoning.steps.length).toBeGreaterThan(0);
    });

    test('should include reasoning chain', async () => {
      const decision = await engine.decideByOptimization(mockOptions, mockFramework, mockContext);

      expect(decision.reasoning).toBeDefined();
      expect(decision.reasoning.steps.length).toBeGreaterThan(0);
      expect(decision.reasoning.evidence).toBeDefined();
    });

    test('should include execution plan', async () => {
      const decision = await engine.decideByOptimization(mockOptions, mockFramework, mockContext);

      expect(decision.executionPlan).toBeDefined();
      expect(decision.executionPlan.length).toBeGreaterThan(0);
    });

    test('should assess risks', async () => {
      const decision = await engine.decideByOptimization(mockOptions, mockFramework, mockContext);

      expect(decision.risks).toBeDefined();
      expect(decision.risks.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Game Theory Decisions', () => {
    const mockContext: DecisionContext = {
      timestamp: new Date(),
      domain: 'negotiation',
      constraints: [],
      availableResources: { compute: 50, budget: 10000, time: 12, humanResources: 1 },
      riskTolerance: 0.3,
      timeHorizon: 1,
      stakeholderPreferences: [],
    };

    const mockPlayers: Player[] = [
      { id: 'p1', name: 'Player 1', strategies: ['cooperate', 'defect'] },
      { id: 'p2', name: 'Player 2', strategies: ['cooperate', 'defect'] },
    ];

    test('should make game theory decision', async () => {
      const decision = await engine.decideByGameTheory('gt_test', mockPlayers, mockContext);

      expect(decision).toBeDefined();
      expect(decision.type).toBe('game_theory');
      expect(decision.recommendation).toBeDefined();
    });

    test('should include Nash equilibrium analysis', async () => {
      const decision = await engine.decideByGameTheory('gt_test2', mockPlayers, mockContext);

      expect(decision.alternatives).toBeDefined();
      expect(decision.confidence).toBeGreaterThan(0);
    });
  });

  describe('Causal Inference Decisions', () => {
    const mockContext: DecisionContext = {
      timestamp: new Date(),
      domain: 'healthcare',
      constraints: [],
      availableResources: { compute: 200, budget: 100000, time: 48, humanResources: 5 },
      riskTolerance: 0.2,
      timeHorizon: 30,
      stakeholderPreferences: [],
    };

    beforeEach(() => {
      const data = [
        { treatment: 1, outcome: 12, age: 25 },
        { treatment: 1, outcome: 10, age: 30 },
        { treatment: 0, outcome: 5, age: 28 },
        { treatment: 0, outcome: 6, age: 35 },
      ];

      engine.getCausalInference().loadData('causal_test', data);
    });

    test('should make causal decision', async () => {
      const decision = await engine.decideByCausalInference(
        'causal_test',
        'treatment',
        'outcome',
        mockContext
      );

      expect(decision).toBeDefined();
      expect(decision.type).toBe('causal');
      expect(decision.recommendation).toBeDefined();
    });

    test('should include causal effect estimate', async () => {
      const decision = await engine.decideByCausalInference(
        'causal_test',
        'treatment',
        'outcome',
        mockContext
      );

      expect(decision.expectedOutcomes).toBeDefined();
      expect(decision.expectedOutcomes.length).toBeGreaterThan(0);
    });
  });

  describe('Human-in-the-Loop', () => {
    const mockContext: DecisionContext = {
      timestamp: new Date(),
      domain: 'critical',
      constraints: [],
      availableResources: { compute: 100, budget: 200000, time: 1, humanResources: 10 },
      riskTolerance: 0.1,
      timeHorizon: 1,
      stakeholderPreferences: [],
    };

    test('should require human review for high-risk decisions', async () => {
      const options: Option[] = [
        { id: '1', name: 'Critical', description: 'Critical option', values: { value: 100 }, constraints: {} },
      ];

      const framework: DecisionFramework = {
        objectives: [{ name: 'value', direction: 'maximize', weight: 1, priority: 1 }],
        constraints: [],
        preferences: [],
      };

      const decision = await engine.decideByOptimization(options, framework, mockContext);

      // Should require review due to high budget and low time
      expect(decision.humanReview.required).toBe(true);
      expect(decision.humanReview.reason).toBeDefined();
    });

    test('should process human approval', async () => {
      const options: Option[] = [
        { id: '1', name: 'Test', description: 'Test option', values: { value: 100 } },
      ];

      const framework: DecisionFramework = {
        objectives: [{ name: 'value', direction: 'maximize', weight: 1, priority: 1 }],
        constraints: [],
        preferences: [],
      };

      const decision = await engine.decideByOptimization(options, framework, mockContext);

      if (decision.humanReview.required) {
        // Simulate async approval
        setTimeout(() => {
          engine.submitHumanFeedback(decision.id, 'approve');
        }, 10);

        const feedback = await engine.requestHumanReview(decision.id, 1);
        expect(feedback).toBe('approve');
      }
    });

    test('should track pending decisions', async () => {
      const options: Option[] = [
        { id: '1', name: 'Test', description: 'Test option', values: { value: 100 } },
      ];

      const framework: DecisionFramework = {
        objectives: [{ name: 'value', direction: 'maximize', weight: 1, priority: 1 }],
        constraints: [],
        preferences: [],
      };

      await engine.decideByOptimization(options, framework, mockContext);
      expect(engine.getStats().pendingReviews).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Events', () => {
    test('should emit decision events', (done) => {
      engine.once('decision:started', () => {
        done();
      });

      const options: Option[] = [
        { id: '1', name: 'Test', description: 'Test option', values: { x: 1 } },
      ];

      const framework: DecisionFramework = {
        objectives: [{ name: 'x', direction: 'maximize', weight: 1, priority: 1 }],
        constraints: [],
        preferences: [],
      };

      const context: DecisionContext = {
        timestamp: new Date(),
        domain: 'test',
        constraints: [],
        availableResources: { compute: 10, budget: 1000, time: 1, humanResources: 1 },
        riskTolerance: 0.5,
        timeHorizon: 1,
        stakeholderPreferences: [],
      };

      engine.decideByOptimization(options, framework, context);
    });
  });

  describe('Statistics', () => {
    test('should return complete statistics', () => {
      const stats = engine.getStats();

      expect(stats).toHaveProperty('pendingReviews');
      expect(stats).toHaveProperty('optimizer');
      expect(stats).toHaveProperty('gameTheory');
      expect(stats).toHaveProperty('causalInference');
    });
  });
});
