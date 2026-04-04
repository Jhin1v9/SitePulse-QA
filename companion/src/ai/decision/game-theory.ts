/**
 * GAME THEORY ENGINE - Decision Engine v3.0 Supremo
 * Equilibrio de Nash e estrategias em jogos
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE JOGOS
// ============================================================================

export type GameType = 'zero_sum' | 'cooperative' | 'non_cooperative' | 'sequential' | 'simultaneous';
export type PlayerStrategy = 'dominant' | 'mixed' | 'pure' | 'nash';

export interface Player {
  id: string;
  name: string;
  strategies: string[];
  payoffs?: Record<string, Record<string, number>>;
}

export interface PayoffMatrix {
  players: string[];
  strategies: Record<string, string[]>;
  payoffs: Record<string, Record<string, Record<string, number>>>;
}

export interface NashEquilibrium {
  strategies: Record<string, string>;
  payoffs: Record<string, number>;
  isPure: boolean;
  stability: number;
  paretoOptimal: boolean;
}

export interface DominantStrategy {
  player: string;
  strategy: string;
  type: 'strictly' | 'weakly';
  advantage: number;
}

export interface GameAnalysis {
  gameType: GameType;
  nashEquilibria: NashEquilibrium[];
  dominantStrategies: DominantStrategy[];
  paretoOptimal: Array<Record<string, string>>;
  maxMinStrategy: Record<string, string>;
  recommendations: StrategyRecommendation[];
  expectedValue: Record<string, number>;
}

export interface StrategyRecommendation {
  player: string;
  strategy: string;
  reason: string;
  confidence: number;
}

export interface SequentialGame {
  players: Player[];
  tree: GameTreeNode;
}

export interface GameTreeNode {
  id: string;
  player?: string;
  actions: Array<{
    name: string;
    payoff?: Record<string, number>;
    child?: GameTreeNode;
  }>;
  isTerminal: boolean;
}

// ============================================================================
// GAME THEORY ENGINE
// ============================================================================

export class GameTheoryEngine extends EventEmitter {
  private payoffMatrices: Map<string, PayoffMatrix> = new Map();
  private sequentialGames: Map<string, SequentialGame> = new Map();

  /**
   * Cria matriz de payoffs para jogo
   */
  createPayoffMatrix(
    id: string,
    players: Player[],
    payoffFunction: (p1: string, p2: string) => [number, number]
  ): PayoffMatrix {
    const strategies: Record<string, string[]> = {};
    const payoffs: Record<string, Record<string, Record<string, number>>> = {};

    for (const player of players) {
      strategies[player.id] = player.strategies;
    }

    // Gerar payoffs
    for (const p1 of players) {
      payoffs[p1.id] = {};
      for (const s1 of p1.strategies) {
        payoffs[p1.id][s1] = {};
        for (const p2 of players) {
          if (p1.id === p2.id) continue;
          for (const s2 of p2.strategies) {
            const [p1Payoff, p2Payoff] = payoffFunction(s1, s2);
            payoffs[p1.id][s1][`${p2.id}_${s2}`] = p1Payoff;
            if (!payoffs[p2.id]) payoffs[p2.id] = {};
            if (!payoffs[p2.id][s2]) payoffs[p2.id][s2] = {};
            payoffs[p2.id][s2][`${p1.id}_${s1}`] = p2Payoff;
          }
        }
      }
    }

    const matrix: PayoffMatrix = { players: players.map(p => p.id), strategies, payoffs };
    this.payoffMatrices.set(id, matrix);

    this.emit('matrix:created', { id, players: players.length });
    return matrix;
  }

  /**
   * Encontra equilibrios de Nash
   */
  findNashEquilibria(matrixId: string): NashEquilibrium[] {
    const matrix = this.payoffMatrices.get(matrixId);
    if (!matrix) throw new Error(`Matrix ${matrixId} not found`);

    console.log(`Finding Nash equilibria for game ${matrixId}...`);
    this.emit('analysis:started', { type: 'nash', matrixId });

    const equilibria: NashEquilibrium[] = [];
    const playerIds = matrix.players;

    // Para cada combinacao de estrategias
    const generateCombinations = (players: string[], index: number, current: Record<string, string>): void => {
      if (index === players.length) {
        // Verificar se eh equilibrio
        if (this.isNashEquilibrium(matrix, current)) {
          const payoffs: Record<string, number> = {};
          for (const pid of playerIds) {
            payoffs[pid] = this.calculatePayoff(matrix, pid, current);
          }

          equilibria.push({
            strategies: { ...current },
            payoffs,
            isPure: true,
            stability: this.calculateStability(matrix, current),
            paretoOptimal: this.isParetoOptimal(matrix, current),
          });
        }
        return;
      }

      const player = players[index];
      for (const strategy of matrix.strategies[player]) {
        current[player] = strategy;
        generateCombinations(players, index + 1, current);
      }
    };

    generateCombinations(playerIds, 0, {});

    // Procurar equilibrios mistos para jogos 2x2
    if (playerIds.length === 2) {
      const mixedEquilibria = this.findMixedEquilibria(matrix);
      equilibria.push(...mixedEquilibria);
    }

    this.emit('analysis:completed', {
      type: 'nash',
      equilibria: equilibria.length,
    });

    return equilibria;
  }

  /**
   * Verifica se combinacao eh equilibrio de Nash
   */
  private isNashEquilibrium(matrix: PayoffMatrix, combination: Record<string, string>): boolean {
    for (const player of matrix.players) {
      const currentStrategy = combination[player];
      const currentPayoff = this.calculatePayoff(matrix, player, combination);

      // Verificar se existe estrategia melhor
      for (const strategy of matrix.strategies[player]) {
        if (strategy === currentStrategy) continue;

        const testCombination = { ...combination, [player]: strategy };
        const testPayoff = this.calculatePayoff(matrix, player, testCombination);

        if (testPayoff > currentPayoff) {
          return false; // Existe desvio lucrativo
        }
      }
    }

    return true;
  }

  /**
   * Calcula payoff para jogador em combinacao
   */
  private calculatePayoff(
    matrix: PayoffMatrix,
    player: string,
    combination: Record<string, string>
  ): number {
    const strategy = combination[player];
    let payoff = 0;

    for (const otherPlayer of matrix.players) {
      if (otherPlayer === player) continue;
      const otherStrategy = combination[otherPlayer];
      const key = `${otherPlayer}_${otherStrategy}`;
      payoff += matrix.payoffs[player][strategy][key] || 0;
    }

    return payoff;
  }

  /**
   * Encontra equilibrios mistos
   */
  private findMixedEquilibria(matrix: PayoffMatrix): NashEquilibrium[] {
    const [p1, p2] = matrix.players;
    const s1 = matrix.strategies[p1];
    const s2 = matrix.strategies[p2];

    if (s1.length !== 2 || s2.length !== 2) return [];

    const equilibria: NashEquilibrium[] = [];

    // Para jogador 1: encontrar probabilidade que iguala payoffs de p2
    const payoffP2S1 = matrix.payoffs[p2][s2[0]][`${p1}_${s1[0]}`] + matrix.payoffs[p2][s2[0]][`${p1}_${s1[1]}`];
    const payoffP2S2 = matrix.payoffs[p2][s2[1]][`${p1}_${s1[0]}`] + matrix.payoffs[p2][s2[1]][`${p1}_${s1[1]}`];

    if (Math.abs(payoffP2S1 - payoffP2S2) > 0.001) {
      const p = (payoffP2S2 - payoffP2S1) / (payoffP2S1 + payoffP2S2);

      if (p >= 0 && p <= 1) {
        equilibria.push({
          strategies: {
            [p1]: `mixed(${s1[0]}:${p.toFixed(2)}, ${s1[1]}:${(1 - p).toFixed(2)})`,
            [p2]: `mixed(${s2[0]}:0.5, ${s2[1]}:0.5)`,
          },
          payoffs: { [p1]: 0, [p2]: 0 },
          isPure: false,
          stability: 0.5,
          paretoOptimal: false,
        });
      }
    }

    return equilibria;
  }

  /**
   * Calcula estabilidade do equilibrio
   */
  private calculateStability(matrix: PayoffMatrix, combination: Record<string, string>): number {
    let minAdvantage = Infinity;

    for (const player of matrix.players) {
      const currentStrategy = combination[player];
      const currentPayoff = this.calculatePayoff(matrix, player, combination);

      for (const strategy of matrix.strategies[player]) {
        if (strategy === currentStrategy) continue;

        const testCombination = { ...combination, [player]: strategy };
        const testPayoff = this.calculatePayoff(matrix, player, testCombination);
        const advantage = currentPayoff - testPayoff;

        if (advantage < minAdvantage) {
          minAdvantage = advantage;
        }
      }
    }

    return minAdvantage === Infinity ? 1 : Math.min(1, Math.max(0, minAdvantage / 10));
  }

  /**
   * Verifica se combinacao eh Pareto otima
   */
  private isParetoOptimal(matrix: PayoffMatrix, combination: Record<string, string>): boolean {
    const currentPayoffs: Record<string, number> = {};
    for (const player of matrix.players) {
      currentPayoffs[player] = this.calculatePayoff(matrix, player, combination);
    }

    // Verificar se existe combinacao que melhora alguem sem piorar ninguem
    const checkPareto = (players: string[], index: number, testCombo: Record<string, string>): boolean => {
      if (index === players.length) {
        let improvesSomeone = false;

        for (const player of matrix.players) {
          const testPayoff = this.calculatePayoff(matrix, player, testCombo);
          if (testPayoff < currentPayoffs[player]) {
            return true; // Piora alguem, nao domina
          }
          if (testPayoff > currentPayoffs[player]) {
            improvesSomeone = true;
          }
        }

        return !improvesSomeone; // Se melhora alguem sem piorar, nao eh Pareto otima
      }

      const player = players[index];
      for (const strategy of matrix.strategies[player]) {
        testCombo[player] = strategy;
        if (!checkPareto(players, index + 1, testCombo)) {
          return false;
        }
      }

      return true;
    };

    return checkPareto(matrix.players, 0, {});
  }

  /**
   * Encontra estrategias dominantes
   */
  findDominantStrategies(matrixId: string): DominantStrategy[] {
    const matrix = this.payoffMatrices.get(matrixId);
    if (!matrix) throw new Error(`Matrix ${matrixId} not found`);

    const dominant: DominantStrategy[] = [];

    for (const player of matrix.players) {
      const strategies = matrix.strategies[player];

      for (let i = 0; i < strategies.length; i++) {
        for (let j = i + 1; j < strategies.length; j++) {
          const s1 = strategies[i];
          const s2 = strategies[j];

          const dominance = this.checkDominance(matrix, player, s1, s2);
          if (dominance) {
            dominant.push({
              player,
              strategy: dominance.dominant,
              type: dominance.type,
              advantage: dominance.advantage,
            });
          }
        }
      }
    }

    return dominant;
  }

  /**
   * Verifica dominancia entre estrategias
   */
  private checkDominance(
    matrix: PayoffMatrix,
    player: string,
    s1: string,
    s2: string
  ): { dominant: string; type: 'strictly' | 'weakly'; advantage: number } | null {
    let s1Better = 0;
    let s2Better = 0;
    let equal = 0;
    let totalAdvantage = 0;

    const otherPlayers = matrix.players.filter(p => p !== player);

    // Para cada combinacao de estrategias dos outros jogadores
    const checkAllOpponents = (players: string[], index: number, current: Record<string, string>): void => {
      if (index === players.length) {
        const p1Payoff = matrix.payoffs[player][s1][`${players[0]}_${current[players[0]]}`] || 0;
        const p2Payoff = matrix.payoffs[player][s2][`${players[0]}_${current[players[0]]}`] || 0;

        if (p1Payoff > p2Payoff) {
          s1Better++;
          totalAdvantage += p1Payoff - p2Payoff;
        } else if (p2Payoff > p1Payoff) {
          s2Better++;
          totalAdvantage += p2Payoff - p1Payoff;
        } else {
          equal++;
        }
        return;
      }

      const p = players[index];
      for (const strat of matrix.strategies[p]) {
        current[p] = strat;
        checkAllOpponents(players, index + 1, current);
      }
    };

    checkAllOpponents(otherPlayers, 0, {});

    const total = s1Better + s2Better + equal;

    if (s1Better === total - equal) {
      return { dominant: s1, type: equal === 0 ? 'strictly' : 'weakly', advantage: totalAdvantage / total };
    }
    if (s2Better === total - equal) {
      return { dominant: s2, type: equal === 0 ? 'strictly' : 'weakly', advantage: totalAdvantage / total };
    }

    return null;
  }

  /**
   * Resolve jogo sequencial usando backward induction
   */
  solveSequentialGame(gameId: string): { equilibriumPath: string[]; payoffs: Record<string, number> } {
    const game = this.sequentialGames.get(gameId);
    if (!game) throw new Error(`Sequential game ${gameId} not found`);

    console.log(`Solving sequential game ${gameId}...`);

    const solveNode = (node: GameTreeNode): { value: Record<string, number>; path: string[] } => {
      if (node.isTerminal) {
        return { value: node.actions[0].payoff || {}, path: [] };
      }

      let bestAction = node.actions[0];
      let bestValue: Record<string, number> = {};
      let bestPath: string[] = [];

      for (const action of node.actions) {
        if (action.child) {
          const result = solveNode(action.child);

          // Maximizar payoff do jogador atual
          const currentPlayer = node.player!;
          if (!bestValue[currentPlayer] || (result.value[currentPlayer] || 0) > bestValue[currentPlayer]) {
            bestAction = action;
            bestValue = result.value;
            bestPath = [action.name, ...result.path];
          }
        }
      }

      return { value: bestValue, path: bestPath };
    };

    const result = solveNode(game.tree);

    this.emit('sequential:solved', { gameId, path: result.path });

    return {
      equilibriumPath: result.path,
      payoffs: result.value,
    };
  }

  /**
   * Analisa jogo completo
   */
  analyzeGame(matrixId: string): GameAnalysis {
    const matrix = this.payoffMatrices.get(matrixId);
    if (!matrix) throw new Error(`Matrix ${matrixId} not found`);

    const nashEquilibria = this.findNashEquilibria(matrixId);
    const dominantStrategies = this.findDominantStrategies(matrixId);
    const maxMinStrategy = this.findMaxMinStrategy(matrix);

    // Encontrar Pareto otimas
    const paretoOptimal: Array<Record<string, string>> = [];
    const generateAndCheck = (players: string[], index: number, current: Record<string, string>): void => {
      if (index === players.length) {
        if (this.isParetoOptimal(matrix, current)) {
          paretoOptimal.push({ ...current });
        }
        return;
      }

      const player = players[index];
      for (const strategy of matrix.strategies[player]) {
        current[player] = strategy;
        generateAndCheck(players, index + 1, current);
      }
    };
    generateAndCheck(matrix.players, 0, {});

    // Gerar recomendacoes
    const recommendations: StrategyRecommendation[] = [];

    for (const dom of dominantStrategies) {
      recommendations.push({
        player: dom.player,
        strategy: dom.strategy,
        reason: `Dominant ${dom.type} strategy - always optimal`,
        confidence: dom.type === 'strictly' ? 1.0 : 0.9,
      });
    }

    for (const eq of nashEquilibria.filter(e => e.isPure)) {
      for (const [player, strategy] of Object.entries(eq.strategies)) {
        if (!recommendations.find(r => r.player === player)) {
          recommendations.push({
            player,
            strategy,
            reason: 'Nash equilibrium - no profitable deviation',
            confidence: eq.stability,
          });
        }
      }
    }

    // Calcular valor esperado
    const expectedValue: Record<string, number> = {};
    if (nashEquilibria.length > 0) {
      const bestEq = nashEquilibria.reduce((best, eq) =>
        eq.stability > best.stability ? eq : best
      );
      Object.assign(expectedValue, bestEq.payoffs);
    }

    return {
      gameType: this.classifyGame(matrix),
      nashEquilibria,
      dominantStrategies,
      paretoOptimal,
      maxMinStrategy,
      recommendations,
      expectedValue,
    };
  }

  /**
   * Encontra estrategia MaxMin
   */
  private findMaxMinStrategy(matrix: PayoffMatrix): Record<string, string> {
    const result: Record<string, string> = {};

    for (const player of matrix.players) {
      let maxMin = -Infinity;
      let bestStrategy = matrix.strategies[player][0];

      for (const strategy of matrix.strategies[player]) {
        let minPayoff = Infinity;

        // Encontrar pior caso
        for (const otherPlayer of matrix.players) {
          if (otherPlayer === player) continue;
          for (const otherStrategy of matrix.strategies[otherPlayer]) {
            const payoff = matrix.payoffs[player][strategy][`${otherPlayer}_${otherStrategy}`] || 0;
            if (payoff < minPayoff) {
              minPayoff = payoff;
            }
          }
        }

        if (minPayoff > maxMin) {
          maxMin = minPayoff;
          bestStrategy = strategy;
        }
      }

      result[player] = bestStrategy;
    }

    return result;
  }

  /**
   * Classifica tipo de jogo
   */
  private classifyGame(matrix: PayoffMatrix): GameType {
    // Verificar se eh zero-sum
    let isZeroSum = true;

    for (const p1 of matrix.players) {
      for (const s1 of matrix.strategies[p1]) {
        for (const p2 of matrix.players) {
          if (p1 === p2) continue;
          for (const s2 of matrix.strategies[p2]) {
            const payoff1 = matrix.payoffs[p1][s1][`${p2}_${s2}`] || 0;
            const payoff2 = matrix.payoffs[p2][s2][`${p1}_${s1}`] || 0;
            if (Math.abs(payoff1 + payoff2) > 0.001) {
              isZeroSum = false;
              break;
            }
          }
        }
      }
    }

    return isZeroSum ? 'zero_sum' : 'non_cooperative';
  }

  /**
   * Adiciona jogo sequencial
   */
  addSequentialGame(id: string, game: SequentialGame): void {
    this.sequentialGames.set(id, game);
    this.emit('sequential:added', { id });
  }

  /**
   * Retorna estatisticas
   */
  getStats(): {
    matrices: number;
    sequentialGames: number;
  } {
    return {
      matrices: this.payoffMatrices.size,
      sequentialGames: this.sequentialGames.size,
    };
  }

  /**
   * Limpa dados
   */
  clear(): void {
    this.payoffMatrices.clear();
    this.sequentialGames.clear();
    this.emit('engine:cleared');
  }
}
