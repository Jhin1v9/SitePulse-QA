/**
 * MULTI-OBJECTIVE OPTIMIZER - Decision Engine v3.0 Supremo
 * Otimizacao multi-objetivo com fronteira de Pareto
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE OTIMIZACAO
// ============================================================================

export interface Objective {
  name: string;
  direction: 'minimize' | 'maximize';
  weight: number;
  priority: number;
  constraint?: { min?: number; max?: number };
}

export interface Option {
  id: string;
  name: string;
  description: string;
  values: Record<string, number>;
  metadata?: Record<string, unknown>;
  constraints?: Record<string, { min?: number; max?: number }>;
}

export interface Constraint {
  name: string;
  type: 'hard' | 'soft';
  evaluate: (option: Option) => boolean;
  violationPenalty: number;
}

export interface ParetoSolution {
  option: Option;
  objectives: Record<string, number>;
  dominatedBy: number;
  dominates: number;
  rank: number;
  crowdingDistance: number;
}

export interface OptimizationResult {
  paretoFront: ParetoSolution[];
  dominatedSolutions: ParetoSolution[];
  bestCompromise: ParetoSolution;
  tradeOffs: TradeOffAnalysis;
  sensitivity: SensitivityAnalysis;
  confidence: number;
}

export interface TradeOffAnalysis {
  pairs: Array<{
    objective1: string;
    objective2: string;
    correlation: number;
    conflicts: number;
  }>;
  recommendations: string[];
}

export interface SensitivityAnalysis {
  robustOptions: Option[];
  sensitiveObjectives: string[];
  weightImpact: Record<string, number>;
}

// ============================================================================
// MULTI-OBJECTIVE OPTIMIZER
// ============================================================================

export class MultiObjectiveOptimizer extends EventEmitter {
  private objectives: Objective[] = [];
  private constraints: Constraint[] = [];

  /**
   * Adiciona objetivo
   */
  addObjective(objective: Objective): void {
    this.objectives.push(objective);
    this.emit('objective:added', objective);
  }

  /**
   * Adiciona restricao
   */
  addConstraint(constraint: Constraint): void {
    this.constraints.push(constraint);
    this.emit('constraint:added', constraint);
  }

  /**
   * Executa otimizacao multi-objetivo
   */
  optimize(options: Option[]): OptimizationResult {
    console.log(`Starting multi-objective optimization with ${options.length} options...`);
    this.emit('optimization:started', { options: options.length, objectives: this.objectives.length });

    // 1. Normalizar valores dos objetivos
    const normalizedOptions = this.normalizeObjectives(options);

    // 2. Avaliar restricoes
    const feasibleOptions = this.evaluateConstraints(normalizedOptions);

    // 3. Calcular fronteira de Pareto
    const paretoFront = this.calculateParetoFront(feasibleOptions);

    // 4. Calcular rank e crowding distance
    this.calculateRankAndCrowding(paretoFront);

    // 5. Encontrar melhor compromisso
    const bestCompromise = this.findBestCompromise(paretoFront);

    // 6. Analisar trade-offs
    const tradeOffs = this.analyzeTradeOffs(paretoFront);

    // 7. Analisar sensibilidade
    const sensitivity = this.analyzeSensitivity(paretoFront);

    const result: OptimizationResult = {
      paretoFront: paretoFront.filter(p => p.rank === 1),
      dominatedSolutions: paretoFront.filter(p => p.rank > 1),
      bestCompromise,
      tradeOffs,
      sensitivity,
      confidence: this.calculateConfidence(paretoFront),
    };

    this.emit('optimization:completed', {
      paretoSize: result.paretoFront.length,
      bestOption: bestCompromise.option.id,
    });

    return result;
  }

  /**
   * Normaliza valores dos objetivos para [0, 1]
   */
  private normalizeObjectives(options: Option[]): Array<{ option: Option; normalized: Record<string, number> }> {
    // Encontrar min/max para cada objetivo
    const ranges: Record<string, { min: number; max: number }> = {};

    for (const obj of this.objectives) {
      const values = options.map(o => o.values[obj.name]).filter(v => v !== undefined);
      ranges[obj.name] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }

    // Normalizar
    return options.map(option => {
      const normalized: Record<string, number> = {};

      for (const obj of this.objectives) {
        const value = option.values[obj.name];
        const range = ranges[obj.name];

        if (range.max === range.min) {
          normalized[obj.name] = 0.5;
        } else {
          let normValue = (value - range.min) / (range.max - range.min);

          // Inverter se for minimizacao
          if (obj.direction === 'minimize') {
            normValue = 1 - normValue;
          }

          normalized[obj.name] = normValue;
        }
      }

      return { option, normalized };
    });
  }

  /**
   * Avalia restricoes
   */
  private evaluateConstraints(
    options: Array<{ option: Option; normalized: Record<string, number> }>
  ): Array<{ option: Option; normalized: Record<string, number>; penalty: number }> {
    return options.map(({ option, normalized }) => {
      let penalty = 0;

      for (const constraint of this.constraints) {
        if (!constraint.evaluate(option)) {
          penalty += constraint.violationPenalty;
        }
      }

      return { option, normalized, penalty };
    });
  }

  /**
   * Calcula fronteira de Pareto
   */
  private calculateParetoFront(
    options: Array<{ option: Option; normalized: Record<string, number>; penalty: number }>
  ): ParetoSolution[] {
    const solutions: ParetoSolution[] = [];

    for (let i = 0; i < options.length; i++) {
      let dominatedBy = 0;
      let dominates = 0;

      for (let j = 0; j < options.length; j++) {
        if (i === j) continue;

        const comparison = this.compareSolutions(options[i], options[j]);

        if (comparison === 'dominates') {
          dominates++;
        } else if (comparison === 'dominated') {
          dominatedBy++;
        }
      }

      solutions.push({
        option: options[i].option,
        objectives: options[i].normalized,
        dominatedBy,
        dominates,
        rank: dominatedBy === 0 ? 1 : 2,
        crowdingDistance: 0,
      });
    }

    return solutions;
  }

  /**
   * Compara duas solucoes
   */
  private compareSolutions(
    a: { normalized: Record<string, number>; penalty: number },
    b: { normalized: Record<string, number>; penalty: number }
  ): 'dominates' | 'dominated' | 'non_dominated' {
    // Considerar penalidade
    if (a.penalty > b.penalty) return 'dominated';
    if (a.penalty < b.penalty) return 'dominates';

    let aBetter = false;
    let bBetter = false;

    for (const obj of this.objectives) {
      const aVal = a.normalized[obj.name];
      const bVal = b.normalized[obj.name];

      if (aVal > bVal) aBetter = true;
      if (bVal > aVal) bBetter = true;
    }

    if (aBetter && !bBetter) return 'dominates';
    if (bBetter && !aBetter) return 'dominated';
    return 'non_dominated';
  }

  /**
   * Calcula rank e crowding distance
   */
  private calculateRankAndCrowding(solutions: ParetoSolution[]): void {
    // Ordenar por cada objetivo e calcular crowding distance
    for (const obj of this.objectives) {
      const sorted = [...solutions].sort(
        (a, b) => b.objectives[obj.name] - a.objectives[obj.name]
      );

      // Extremos tem distancia infinita
      sorted[0].crowdingDistance = Infinity;
      sorted[sorted.length - 1].crowdingDistance = Infinity;

      // Calcular para os demais
      for (let i = 1; i < sorted.length - 1; i++) {
        const distance =
          sorted[i + 1].objectives[obj.name] - sorted[i - 1].objectives[obj.name];
        sorted[i].crowdingDistance += distance;
      }
    }
  }

  /**
   * Encontra melhor compromisso (ponto ideal)
   */
  private findBestCompromise(solutions: ParetoSolution[]): ParetoSolution {
    // Calcular ponto ideal (melhor em todos os objetivos)
    const ideal: Record<string, number> = {};
    for (const obj of this.objectives) {
      ideal[obj.name] = 1; // Valor maximo normalizado
    }

    // Encontrar solucao mais proxima do ideal ponderado
    let bestSolution = solutions[0];
    let bestDistance = Infinity;

    for (const sol of solutions) {
      if (sol.rank > 1) continue; // Apenas solucoes nao dominadas

      let distance = 0;
      for (const obj of this.objectives) {
        const diff = ideal[obj.name] - sol.objectives[obj.name];
        distance += obj.weight * diff * diff;
      }

      if (distance < bestDistance) {
        bestDistance = distance;
        bestSolution = sol;
      }
    }

    return bestSolution;
  }

  /**
   * Analisa trade-offs entre objetivos
   */
  private analyzeTradeOffs(solutions: ParetoSolution[]): TradeOffAnalysis {
    const pairs: TradeOffAnalysis['pairs'] = [];

    for (let i = 0; i < this.objectives.length; i++) {
      for (let j = i + 1; j < this.objectives.length; j++) {
        const obj1 = this.objectives[i].name;
        const obj2 = this.objectives[j].name;

        // Calcular correlacao
        const values1 = solutions.map(s => s.objectives[obj1]);
        const values2 = solutions.map(s => s.objectives[obj2]);
        const correlation = this.calculateCorrelation(values1, values2);

        // Contar conflitos
        let conflicts = 0;
        for (let k = 0; k < solutions.length; k++) {
          for (let l = k + 1; l < solutions.length; l++) {
            if (
              (values1[k] > values1[l] && values2[k] < values2[l]) ||
              (values1[k] < values1[l] && values2[k] > values2[l])
            ) {
              conflicts++;
            }
          }
        }

        pairs.push({
          objective1: obj1,
          objective2: obj2,
          correlation,
          conflicts,
        });
      }
    }

    // Gerar recomendacoes
    const recommendations: string[] = [];
    const conflictingPairs = pairs.filter(p => p.correlation < -0.5);

    if (conflictingPairs.length > 0) {
      recommendations.push(
        `Strong trade-off detected between: ${conflictingPairs.map(p => `${p.objective1} vs ${p.objective2}`).join(', ')}`
      );
    }

    return { pairs, recommendations };
  }

  /**
   * Analisa sensibilidade
   */
  private analyzeSensitivity(solutions: ParetoSolution[]): SensitivityAnalysis {
    // Identificar opcoes robustas (presentes em diferentes cenarios)
    const robustOptions = solutions
      .filter(s => s.crowdingDistance > 0.5)
      .map(s => s.option);

    // Identificar objetivos sensiveis
    const sensitiveObjectives: string[] = [];
    for (const obj of this.objectives) {
      const values = solutions.map(s => s.objectives[obj.name]);
      const variance = this.calculateVariance(values);
      if (variance > 0.1) {
        sensitiveObjectives.push(obj.name);
      }
    }

    // Analisar impacto dos pesos
    const weightImpact: Record<string, number> = {};
    for (const obj of this.objectives) {
      // Simular mudanca de 10% no peso
      const impact = this.simulateWeightChange(obj.name, 0.1, solutions);
      weightImpact[obj.name] = impact;
    }

    return {
      robustOptions,
      sensitiveObjectives,
      weightImpact,
    };
  }

  /**
   * Calcula correlacao de Pearson
   */
  private calculateCorrelation(a: number[], b: number[]): number {
    const n = a.length;
    const sumA = a.reduce((sum, v) => sum + v, 0);
    const sumB = b.reduce((sum, v) => sum + v, 0);
    const sumAB = a.reduce((sum, v, i) => sum + v * b[i], 0);
    const sumA2 = a.reduce((sum, v) => sum + v * v, 0);
    const sumB2 = b.reduce((sum, v) => sum + v * v, 0);

    const numerator = n * sumAB - sumA * sumB;
    const denominator = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Calcula variancia
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }

  /**
   * Simula mudanca no peso
   */
  private simulateWeightChange(
    objectiveName: string,
    delta: number,
    solutions: ParetoSolution[]
  ): number {
    const originalBest = this.findBestCompromise(solutions);

    // Aplicar nova ponderacao
    const modifiedObjectives = this.objectives.map(obj => ({
      ...obj,
      weight: obj.name === objectiveName ? obj.weight + delta : obj.weight,
    }));

    // Recalcular melhor solucao
    let newBest = solutions[0];
    let bestScore = -Infinity;

    for (const sol of solutions) {
      let score = 0;
      for (const obj of modifiedObjectives) {
        score += obj.weight * sol.objectives[obj.name];
      }
      if (score > bestScore) {
        bestScore = score;
        newBest = sol;
      }
    }

    // Retornar mudanca (1 se mudou, 0 se igual)
    return originalBest.option.id !== newBest.option.id ? 1 : 0;
  }

  /**
   * Calcula confianca do resultado
   */
  private calculateConfidence(solutions: ParetoSolution[]): number {
    const paretoSize = solutions.filter(s => s.rank === 1).length;
    const totalSize = solutions.length;

    // Mais solucoes na fronteira = maior confianca
    const coverage = paretoSize / totalSize;

    // Crowding distance media
    const avgCrowding =
      solutions
        .filter(s => s.rank === 1 && s.crowdingDistance !== Infinity)
        .reduce((sum, s) => sum + s.crowdingDistance, 0) / paretoSize;

    return Math.min(1, (1 - coverage) * 0.5 + avgCrowding * 0.5 + 0.5);
  }

  /**
   * Retorna estatisticas
   */
  getStats(): {
    objectives: number;
    constraints: number;
  } {
    return {
      objectives: this.objectives.length,
      constraints: this.constraints.length,
    };
  }

  /**
   * Limpa objetivos e restricoes
   */
  clear(): void {
    this.objectives = [];
    this.constraints = [];
    this.emit('optimizer:cleared');
  }
}
