/**
 * CAUSAL INFERENCE ENGINE - Decision Engine v3.0 Supremo
 * Inferencia causal com DAGs e metodos de identificacao
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE CAUSALIDADE
// ============================================================================

export interface Variable {
  name: string;
  type: 'continuous' | 'discrete' | 'binary';
  domain?: number[] | string[];
}

export interface CausalGraph {
  variables: Variable[];
  edges: Array<{
    from: string;
    to: string;
    strength: number;
    type: 'direct' | 'indirect' | 'confounding';
  }>;
}

export interface CausalEffect {
  treatment: string;
  outcome: string;
  effect: number;
  confidence: number;
  method: string;
  biasCorrection: number;
}

export interface Counterfactual {
  factual: Record<string, number>;
  counterfactual: Record<string, number>;
  effect: number;
  probability: number;
}

export interface CausalDiscovery {
  relationships: Array<{
    cause: string;
    effect: string;
    confidence: number;
    mechanism?: string;
  }>;
  confounders: string[];
  colliders: string[];
  mediators: string[];
}

export interface DoCalculus {
  query: string;
  identifiable: boolean;
  formula?: string;
  adjustmentSet?: string[];
}

export interface PropensityScore {
  treatment: string;
  score: number;
  matched: boolean;
  weight: number;
}

// ============================================================================
// CAUSAL INFERENCE ENGINE
// ============================================================================

export class CausalInferenceEngine extends EventEmitter {
  private graphs: Map<string, CausalGraph> = new Map();
  private data: Map<string, Array<Record<string, number>>> = new Map();

  /**
   * Constroi grafo causal
   */
  buildGraph(id: string, variables: Variable[], edges: CausalGraph['edges']): CausalGraph {
    const graph: CausalGraph = { variables, edges };
    this.graphs.set(id, graph);

    this.emit('graph:built', { id, variables: variables.length, edges: edges.length });
    return graph;
  }

  /**
   * Carrega dados observacionais
   */
  loadData(id: string, data: Array<Record<string, number>>): void {
    this.data.set(id, data);
    this.emit('data:loaded', { id, samples: data.length });
  }

  /**
   * Calcula efeito causal usando diferenca de medias
   */
  calculateAverageTreatmentEffect(
    dataId: string,
    treatment: string,
    outcome: string
  ): CausalEffect {
    const data = this.data.get(dataId);
    if (!data) throw new Error(`Data ${dataId} not found`);

    console.log(`Calculating ATE for ${treatment} -> ${outcome}...`);
    this.emit('effect:calculating', { method: 'ATE', treatment, outcome });

    // Separar grupos
    const treated = data.filter(d => d[treatment] === 1);
    const control = data.filter(d => d[treatment] === 0);

    if (treated.length === 0 || control.length === 0) {
      return {
        treatment,
        outcome,
        effect: 0,
        confidence: 0,
        method: 'ATE_naive',
        biasCorrection: 0,
      };
    }

    const treatedMean = treated.reduce((sum, d) => sum + d[outcome], 0) / treated.length;
    const controlMean = control.reduce((sum, d) => sum + d[outcome], 0) / control.length;

    const effect = treatedMean - controlMean;

    // Calcular erro padrao
    const treatedVar = this.calculateVariance(treated.map(d => d[outcome]));
    const controlVar = this.calculateVariance(control.map(d => d[outcome]));
    const se = Math.sqrt(treatedVar / treated.length + controlVar / control.length);

    // Intervalo de confianca (95%)
    const ci = 1.96 * se;
    const confidence = Math.max(0, 1 - ci / Math.abs(effect));

    this.emit('effect:calculated', { effect, confidence });

    return {
      treatment,
      outcome,
      effect,
      confidence,
      method: 'ATE_naive',
      biasCorrection: 0,
    };
  }

  /**
   * Calcula efeito com propensity score matching
   */
  calculateATEWithMatching(
    dataId: string,
    treatment: string,
    outcome: string,
    covariates: string[]
  ): CausalEffect {
    const data = this.data.get(dataId);
    if (!data) throw new Error(`Data ${dataId} not found`);

    console.log(`Calculating ATE with propensity score matching...`);
    this.emit('effect:calculating', { method: 'PSM', treatment, outcome });

    // Calcular propensity scores (simplificado - regressao logistica linear)
    const propensityScores = this.calculatePropensityScores(data, treatment, covariates);

    // Fazer matching
    const matched = this.matchByPropensity(data, propensityScores);

    // Calcular efeito nos pares matchados
    let totalEffect = 0;
    let validPairs = 0;

    for (const pair of matched) {
      if (pair.treated && pair.control) {
        totalEffect += pair.treated[outcome] - pair.control[outcome];
        validPairs++;
      }
    }

    const effect = validPairs > 0 ? totalEffect / validPairs : 0;
    const confidence = Math.min(1, validPairs / data.length);

    this.emit('effect:calculated', { effect, confidence, matchedPairs: validPairs });

    return {
      treatment,
      outcome,
      effect,
      confidence,
      method: 'PSM',
      biasCorrection: confidence,
    };
  }

  /**
   * Calcula propensity scores
   */
  private calculatePropensityScores(
    data: Array<Record<string, number>>,
    treatment: string,
    covariates: string[]
  ): PropensityScore[] {
    // Modelo linear simplificado
    const scores: PropensityScore[] = [];

    for (const row of data) {
      // Score baseado em media normalizada dos covariates
      let score = 0;
      for (const cov of covariates) {
        const mean = data.reduce((sum, d) => sum + d[cov], 0) / data.length;
        const variance = this.calculateVariance(data.map(d => d[cov]));
        score += variance > 0 ? (row[cov] - mean) / Math.sqrt(variance) : 0;
      }
      score = 1 / (1 + Math.exp(-score / covariates.length)); // Sigmoid

      scores.push({
        treatment,
        score,
        matched: false,
        weight: row[treatment] === 1 ? 1 / score : 1 / (1 - score),
      });
    }

    return scores;
  }

  /**
   * Faz matching por propensity score
   */
  private matchByPropensity(
    data: Array<Record<string, number>>,
    scores: PropensityScore[]
  ): Array<{ treated?: Record<string, number>; control?: Record<string, number> }> {
    const pairs: Array<{ treated?: Record<string, number>; control?: Record<string, number> }> = [];
    const used = new Set<number>();

    for (let i = 0; i < data.length; i++) {
      if (used.has(i)) continue;
      const isTreated = data[i]['treatment'] === 1;

      // Encontrar match mais proximo do grupo oposto
      let bestMatch = -1;
      let bestDistance = Infinity;

      for (let j = 0; j < data.length; j++) {
        if (i === j || used.has(j)) continue;
        if (data[j]['treatment'] === data[i]['treatment']) continue;

        const distance = Math.abs(scores[i].score - scores[j].score);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestMatch = j;
        }
      }

      if (bestMatch >= 0 && bestDistance < 0.2) {
        pairs.push({
          treated: isTreated ? data[i] : data[bestMatch],
          control: isTreated ? data[bestMatch] : data[i],
        });
        used.add(i);
        used.add(bestMatch);
      }
    }

    return pairs;
  }

  /**
   * Descobre relacoes causais automaticamente
   */
  discoverCausalRelationships(
    dataId: string,
    variables: string[]
  ): CausalDiscovery {
    const data = this.data.get(dataId);
    if (!data) throw new Error(`Data ${dataId} not found`);

    console.log(`Discovering causal relationships...`);
    this.emit('discovery:started', { variables: variables.length });

    const relationships: CausalDiscovery['relationships'] = [];
    const confounders: string[] = [];
    const colliders: string[] = [];
    const mediators: string[] = [];

    // Testar todas as combinacoes
    for (let i = 0; i < variables.length; i++) {
      for (let j = i + 1; j < variables.length; j++) {
        const v1 = variables[i];
        const v2 = variables[j];

        // Testar correlacao
        const corr = this.calculateCorrelation(
          data.map(d => d[v1]),
          data.map(d => d[v2])
        );

        if (Math.abs(corr) > 0.3) {
          // Testar causalidade de Granger (simplificada)
          const grangerV1 = this.grangerCausality(data, v1, v2);
          const grangerV2 = this.grangerCausality(data, v2, v1);

          if (grangerV1 && !grangerV2) {
            relationships.push({
              cause: v1,
              effect: v2,
              confidence: Math.abs(corr),
              mechanism: grangerV1 ? 'temporal_precedence' : undefined,
            });
          } else if (grangerV2 && !grangerV1) {
            relationships.push({
              cause: v2,
              effect: v1,
              confidence: Math.abs(corr),
              mechanism: grangerV2 ? 'temporal_precedence' : undefined,
            });
          } else {
            // Possivel confounder
            confounders.push(`${v1}_${v2}`);
          }
        }
      }
    }

    // Identificar mediadores
    for (const rel1 of relationships) {
      for (const rel2 of relationships) {
        if (rel1.effect === rel2.cause) {
          mediators.push(rel1.effect);
        }
      }
    }

    this.emit('discovery:completed', {
      relationships: relationships.length,
      confounders: confounders.length,
    });

    return {
      relationships,
      confounders,
      colliders,
      mediators,
    };
  }

  /**
   * Testa causalidade de Granger (simplificada)
   */
  private grangerCausality(
    data: Array<Record<string, number>>,
    cause: string,
    effect: string
  ): boolean {
    // Verificar se cause precede effect temporalmente
    // Simplificado: verificar correlacao com lag
    const lag = 1;
    if (data.length <= lag) return false;

    const causeLagged = data.slice(0, -lag).map(d => d[cause]);
    const effectFuture = data.slice(lag).map(d => d[effect]);

    const corr = this.calculateCorrelation(causeLagged, effectFuture);
    return corr > 0.3;
  }

  /**
   * Calcula contrafactual
   */
  calculateCounterfactual(
    dataId: string,
    observation: Record<string, number>,
    intervention: Record<string, number>
  ): Counterfactual {
    const data = this.data.get(dataId);
    if (!data) throw new Error(`Data ${dataId} not found`);

    console.log(`Calculating counterfactual...`);

    // Encontrar observacoes similares
    const similar = this.findSimilarObservations(data, observation, 10);

    // Aplicar intervencao e prever resultado
    const counterfactualOutcome = this.predictCounterfactual(similar, intervention);
    const factualOutcome = this.predictCounterfactual(similar, observation);

    return {
      factual: observation,
      counterfactual: { ...observation, ...intervention },
      effect: counterfactualOutcome - factualOutcome,
      probability: similar.length / data.length,
    };
  }

  /**
   * Encontra observacoes similares
   */
  private findSimilarObservations(
    data: Array<Record<string, number>>,
    target: Record<string, number>,
    k: number
  ): Array<Record<string, number>> {
    const similarities = data.map(d => ({
      data: d,
      distance: Object.keys(target).reduce(
        (sum, key) => sum + Math.pow(d[key] - target[key], 2),
        0
      ),
    }));

    similarities.sort((a, b) => a.distance - b.distance);
    return similarities.slice(0, k).map(s => s.data);
  }

  /**
   * Prediz contrafactual
   */
  private predictCounterfactual(
    similar: Array<Record<string, number>>,
    intervention: Record<string, number>
  ): number {
    // Media ponderada pela distancia
    let totalWeight = 0;
    let weightedSum = 0;

    for (const obs of similar) {
      const weight = 1 / (1 + Object.keys(intervention).reduce(
        (sum, key) => sum + Math.pow(obs[key] - intervention[key], 2),
        0
      ));

      // Assumir que existe uma coluna 'outcome'
      weightedSum += weight * (obs['outcome'] || 0);
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Aplica do-calculus para identificar efeito
   */
  applyDoCalculus(graphId: string, query: string): DoCalculus {
    const graph = this.graphs.get(graphId);
    if (!graph) throw new Error(`Graph ${graphId} not found`);

    console.log(`Applying do-calculus for query: ${query}...`);

    // Parse query: P(Y|do(X))
    const match = query.match(/P\((\w+)\|do\((\w+)\)\)/);
    if (!match) {
      return { query, identifiable: false };
    }

    const [, outcome, treatment] = match;

    // Encontrar conjunto de ajuste
    const adjustmentSet = this.findAdjustmentSet(graph, treatment, outcome);

    if (adjustmentSet !== null) {
      const formula = adjustmentSet.length > 0
        ? `Σ_${adjustmentSet.join(',')} P(${outcome}|${treatment},${adjustmentSet.join(',')}) * P(${adjustmentSet.join(',')})`
        : `P(${outcome}|${treatment})`;

      return {
        query,
        identifiable: true,
        formula,
        adjustmentSet,
      };
    }

    return { query, identifiable: false };
  }

  /**
   * Encontra conjunto de ajuste
   */
  private findAdjustmentSet(graph: CausalGraph, treatment: string, outcome: string): string[] | null {
    // Regra do cofundo: incluir confounders comuns
    const confounders: string[] = [];

    for (const edge of graph.edges) {
      // Verificar se existe caminho confounding
      if (edge.type === 'confounding') {
        const hasPathToTreatment = this.hasPath(graph, edge.from, treatment);
        const hasPathToOutcome = this.hasPath(graph, edge.from, outcome);

        if (hasPathToTreatment && hasPathToOutcome) {
          confounders.push(edge.from);
        }
      }
    }

    return confounders;
  }

  /**
   * Verifica se existe caminho no grafo
   */
  private hasPath(graph: CausalGraph, from: string, to: string): boolean {
    const visited = new Set<string>();
    const queue = [from];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === to) return true;

      if (visited.has(current)) continue;
      visited.add(current);

      for (const edge of graph.edges) {
        if (edge.from === current) {
          queue.push(edge.to);
        }
      }
    }

    return false;
  }

  /**
   * Calcula correlacao
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
   * Calcula Intervalo de Confiança de Fisher
   */
  calculateConfidenceInterval(
    dataId: string,
    treatment: string,
    outcome: string,
    confidence: number = 0.95
  ): { lower: number; upper: number; estimate: number } {
    const effect = this.calculateAverageTreatmentEffect(dataId, treatment, outcome);

    const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
    const margin = (1 - effect.confidence) * z;

    return {
      lower: effect.effect - margin,
      upper: effect.effect + margin,
      estimate: effect.effect,
    };
  }

  /**
   * Retorna estatisticas
   */
  getStats(): {
    graphs: number;
    datasets: number;
  } {
    return {
      graphs: this.graphs.size,
      datasets: this.data.size,
    };
  }

  /**
   * Limpa dados
   */
  clear(): void {
    this.graphs.clear();
    this.data.clear();
    this.emit('engine:cleared');
  }
}
