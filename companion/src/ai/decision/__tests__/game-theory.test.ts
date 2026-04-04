import { GameTheoryEngine, Player } from '../game-theory';

describe('GameTheoryEngine', () => {
  let engine: GameTheoryEngine;

  beforeEach(() => {
    engine = new GameTheoryEngine();
  });

  describe('Basic Operations', () => {
    test('should create payoff matrix', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', strategies: ['A', 'B'] },
        { id: 'p2', name: 'Player 2', strategies: ['X', 'Y'] },
      ];

      const matrix = engine.createPayoffMatrix('game1', players, (s1, s2) => [10, -10]);

      expect(matrix).toBeDefined();
      expect(matrix.players).toContain('p1');
      expect(matrix.players).toContain('p2');
      expect(engine.getStats().matrices).toBe(1);
    });

    test('should clear all data', () => {
      engine.clear();
      expect(engine.getStats().matrices).toBe(0);
    });
  });

  describe('Nash Equilibrium', () => {
    beforeEach(() => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', strategies: ['cooperate', 'defect'] },
        { id: 'p2', name: 'Player 2', strategies: ['cooperate', 'defect'] },
      ];

      engine.createPayoffMatrix('pd', players, (s1, s2) => {
        if (s1 === 'cooperate' && s2 === 'cooperate') return [3, 3];
        if (s1 === 'cooperate' && s2 === 'defect') return [0, 5];
        if (s1 === 'defect' && s2 === 'cooperate') return [5, 0];
        return [1, 1];
      });
    });

    test('should find Nash equilibrium', () => {
      const equilibria = engine.findNashEquilibria('pd');

      expect(equilibria.length).toBeGreaterThan(0);
      const eq = equilibria[0];
      expect(eq.strategies).toHaveProperty('p1', 'defect');
      expect(eq.strategies).toHaveProperty('p2', 'defect');
    });

    test('should analyze game completely', () => {
      const analysis = engine.analyzeGame('pd');

      expect(analysis).toBeDefined();
      expect(analysis.nashEquilibria.length).toBeGreaterThan(0);
    });
  });

  describe('Dominant Strategies', () => {
    beforeEach(() => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', strategies: ['A', 'B'] },
        { id: 'p2', name: 'Player 2', strategies: ['X', 'Y'] },
      ];

      engine.createPayoffMatrix('dom', players, (s1, s2) => {
        if (s1 === 'A') return [10, -5];
        return [5, -10];
      });
    });

    test('should find dominant strategies', () => {
      const dominant = engine.findDominantStrategies('dom');

      expect(dominant.length).toBeGreaterThan(0);
    });
  });

  describe('Zero-Sum Games', () => {
    beforeEach(() => {
      const players: Player[] = [
        { id: 'p1', name: 'Player 1', strategies: ['rock', 'paper', 'scissors'] },
        { id: 'p2', name: 'Player 2', strategies: ['rock', 'paper', 'scissors'] },
      ];

      engine.createPayoffMatrix('rps', players, (s1, s2) => {
        if (s1 === s2) return [0, 0];
        if (
          (s1 === 'rock' && s2 === 'scissors') ||
          (s1 === 'paper' && s2 === 'rock') ||
          (s1 === 'scissors' && s2 === 'paper')
        ) {
          return [1, -1];
        }
        return [-1, 1];
      });
    });

    test('should classify as zero-sum', () => {
      const analysis = engine.analyzeGame('rps');
      expect(analysis.gameType).toBe('zero_sum');
    });
  });

  describe('Events', () => {
    test('should emit events', (done) => {
      engine.once('matrix:created', () => {
        done();
      });

      const players: Player[] = [
        { id: 'p1', name: 'Player 1', strategies: ['A'] },
        { id: 'p2', name: 'Player 2', strategies: ['X'] },
      ];

      engine.createPayoffMatrix('test', players, () => [0, 0]);
    });
  });
});
