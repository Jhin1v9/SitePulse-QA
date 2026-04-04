/**
 * SUPREME DECISION ENGINE v3.0
 * Motor de Decisao Supremo com otimizacao multi-objetivo,
 * teoria dos jogos, inferencia causal e interacao humana.
 */

import { EventEmitter } from 'events';
import { MultiObjectiveOptimizer, Objective, Option, OptimizationResult } from './multi-objective';
import {
  GameTheoryEngine,
  Player,
  PayoffMatrix,
  GameAnalysis,
  SequentialGame,
  GameTreeNode,
} from './game-theory';
import {
  CausalInferenceEngine,
  Variable,
  CausalGraph,
  CausalEffect,
  Counterfactual,
} from './causal-inference';

// ============================================================================
// TIPOS DO DECISION ENGINE
// ============================================================================

export type DecisionType = 'optimization' | 'game_theory' | 'causal' | 'hybrid';
export type ConfidenceLevel = 'critical' | 'high' | 'medium' | 'low';
export type HumanFeedback = 'approve' | 'reject' | 'modify' | 'request_info';

export interface DecisionContext {
  timestamp: Date;
  domain: string;
  constraints: string[];
  availableResources: ResourceAllocation;
  riskTolerance: number;
  timeHorizon: number;
  stakeholderPreferences: StakeholderPreference[];
}

export interface ResourceAllocation {
  compute: number;
  budget: number;
  time: number;
  humanResources: number;
}

export interface StakeholderPreference {
  stakeholder: string;
  objectives: Record<string, number>;
  weight: number;
}

export interface Decision {
  id: string;
  type: DecisionType;
  recommendation: string;
  alternatives: Alternative[];
  confidence: number;
  reasoning: ReasoningChain;
  humanReview: HumanReviewStatus;
  executionPlan: ExecutionStep[];
  risks: RiskAssessment[];
  expectedOutcomes: OutcomePrediction[];
}

export interface Alternative {
  id: string;
  description: string;
  expectedValue: number;
  uncertainty: number;
  tradeoffs: Record<string, number>;
  feasibility: number;
}

export interface ReasoningChain {
  steps: string[];
  evidence: string[];
  assumptions: string[];
  logicalStructure: string;
}

export interface HumanReviewStatus {
  required: boolean;
  reason: string;
  deadline?: Date;
  feedback?: HumanFeedback;
  modifications?: Partial<Decision>;
  reviewer?: string;
}

export interface ExecutionStep {
  order: number;
  action: string;
  responsible: string;
  dependencies: number[];
  deadline?: Date;
  rollbackProcedure?: string;
}

export interface RiskAssessment {
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
  contingencyPlan?: string;
}

export interface OutcomePrediction {
  metric: string;
  predictedValue: number;
  confidenceInterval: [number, number];
  probability: number;
}

export interface DecisionFramework {
  objectives: Objective[];
  constraints: Array<{
    name: string;
    type: 'hard' | 'soft';
    evaluate: (option: Option) => boolean;
  }>;
  preferences: StakeholderPreference[];
}

// ============================================================================
// SUPREME DECISION ENGINE
// ============================================================================

export class SupremeDecisionEngine extends EventEmitter {
  private optimizer: MultiObjectiveOptimizer;
  private gameTheory: GameTheoryEngine;
  private causalInference: CausalInferenceEngine;

  // Human-in-the-loop
  private pendingDecisions: Map<string, Decision> = new Map();
  private humanReviewCallbacks: Map<string, (feedback: HumanFeedback) => void> = new Map();

  constructor() {
    super();
    this.optimizer = new MultiObjectiveOptimizer();
    this.gameTheory = new GameTheoryEngine();
    this.causalInference = new CausalInferenceEngine();

    this.setupEventForwarding();
  }

  /**
   * Configura forwarding de eventos
   */
  private setupEventForwarding(): void {
    this.optimizer.on('optimization:completed', data =>
      this.emit('optimization:completed', data)
    );
    this.gameTheory.on('analysis:completed', data =>
      this.emit('game_theory:analysis_completed', data)
    );
    this.causalInference.on('effect:calculated', data =>
      this.emit('causal:effect_calculated', data)
    );
  }

  // ============================================================================
  // DECISAO POR OTIMIZACAO MULTI-OBJETIVO
  // ============================================================================

  /**
   * Decide usando otimizacao multi-objetivo
   */
  async decideByOptimization(
    options: Option[],
    framework: DecisionFramework,
    context: DecisionContext
  ): Promise<Decision> {
    console.log('Starting multi-objective decision...');
    this.emit('decision:started', { type: 'optimization', options: options.length });

    // Configurar objetivos no optimizer
    this.optimizer.clear();
    for (const obj of framework.objectives) {
      this.optimizer.addObjective(obj);
    }

    // Adicionar restricoes
    for (const constraint of framework.constraints) {
      this.optimizer.addConstraint({
        name: constraint.name,
        type: constraint.type,
        evaluate: constraint.evaluate,
        violationPenalty: constraint.type === 'hard' ? 1000 : 100,
      });
    }

    // Executar otimizacao
    const result = this.optimizer.optimize(options);

    // Verificar se precisa de revisao humana
    const requiresHumanReview = this.shouldRequireHumanReview(result, context);

    // Construir decisao
    const decision: Decision = {
      id: `dec_opt_${Date.now()}`,
      type: 'optimization',
      recommendation: result.bestCompromise.option.name,
      alternatives: result.paretoFront.map(sol => ({
        id: sol.option.id,
        description: sol.option.description,
        expectedValue: Object.values(sol.objectives).reduce((a, b) => a + b, 0) / Object.values(sol.objectives).length,
        uncertainty: 1 - result.confidence,
        tradeoffs: sol.objectives,
        feasibility: sol.rank === 1 ? 1 : 0.5,
      })),
      confidence: result.confidence,
      reasoning: {
        steps: [
          `Evaluated ${options.length} options against ${framework.objectives.length} objectives`,
          `Found ${result.paretoFront.length} Pareto-optimal solutions`,
          `Selected best compromise based on stakeholder weights`,
          `Robustness verified through sensitivity analysis`,
        ],
        evidence: result.tradeOffs.recommendations,
        assumptions: ['Objectives are independent', 'Weights reflect true preferences'],
        logicalStructure: 'Multi-objective optimization with Pareto analysis',
      },
      humanReview: {
        required: requiresHumanReview,
        reason: requiresHumanReview
          ? 'High uncertainty or critical impact requires human verification'
          : 'Decision within acceptable confidence thresholds',
      },
      executionPlan: this.generateExecutionPlan(result.bestCompromise.option),
      risks: this.assessRisks(result, context),
      expectedOutcomes: this.predictOutcomes(result.bestCompromise, framework.objectives),
    };

    if (requiresHumanReview) {
      this.pendingDecisions.set(decision.id, decision);
    }

    this.emit('decision:completed', { id: decision.id, type: 'optimization' });
    return decision;
  }

  // ============================================================================
  // DECISAO POR TEORIA DOS JOGOS
  // ============================================================================

  /**
   * Decide usando teoria dos jogos
   */
  async decideByGameTheory(
    gameId: string,
    players: Player[],
    context: DecisionContext
  ): Promise<Decision> {
    console.log('Starting game theory analysis...');
    this.emit('decision:started', { type: 'game_theory', players: players.length });

    // Criar matriz de payoffs
    const matrix = this.createPayoffMatrix(gameId, players);

    // Analisar jogo
    const analysis = this.gameTheory.analyzeGame(gameId);

    // Identificar estrategia recomendada
    const recommendation = analysis.recommendations[0];
    const nashEq = analysis.nashEquilibria[0];

    // Verificar necessidade de revisao humana
    const requiresHumanReview =
      analysis.nashEquilibria.length === 0 || analysis.nashEquilibria.length > 3;

    const decision: Decision = {
      id: `dec_gt_${Date.now()}`,
      type: 'game_theory',
      recommendation: recommendation
        ? `${recommendation.player} should choose ${recommendation.strategy}`
        : 'No clear recommendation - multiple equilibria exist',
      alternatives: analysis.nashEquilibria.map((eq, i) => ({
        id: `eq_${i}`,
        description: `Nash Equilibrium: ${JSON.stringify(eq.strategies)}`,
        expectedValue: Object.values(eq.payoffs).reduce((a, b) => a + b, 0) / Object.values(eq.payoffs).length,
        uncertainty: 1 - eq.stability,
        tradeoffs: eq.payoffs,
        feasibility: eq.stability,
      })),
      confidence: analysis.nashEquilibria.length > 0 ? 0.8 : 0.4,
      reasoning: {
        steps: [
          `Analyzed ${analysis.gameType} game with ${players.length} players`,
          `Found ${analysis.nashEquilibria.length} Nash equilibria`,
          `Identified ${analysis.dominantStrategies.length} dominant strategies`,
          analysis.paretoOptimal.length > 0
            ? `${analysis.paretoOptimal.length} Pareto-optimal outcomes identified`
            : 'No Pareto-optimal outcomes found',
        ],
        evidence: analysis.recommendations.map(r => r.reason),
        assumptions: ['Players are rational', 'Payoffs are correctly estimated'],
        logicalStructure: 'Game theory analysis with Nash equilibrium refinement',
      },
      humanReview: {
        required: requiresHumanReview,
        reason: requiresHumanReview
          ? analysis.nashEquilibria.length === 0
            ? 'No equilibrium found - requires strategic insight'
            : 'Multiple equilibria - coordination needed'
          : 'Clear equilibrium identified',
      },
      executionPlan: recommendation
        ? [
            {
              order: 1,
              action: `Execute strategy: ${recommendation.strategy}`,
              responsible: recommendation.player,
              dependencies: [],
            },
          ]
        : [],
      risks: [
        {
          risk: 'Opponent deviation from predicted strategy',
          probability: 0.3,
          impact: 0.7,
          mitigation: 'Monitor opponent actions and adapt',
        },
      ],
      expectedOutcomes: nashEq
        ? Object.entries(nashEq.payoffs).map(([player, payoff]) => ({
            metric: `Payoff_${player}`,
            predictedValue: payoff,
            confidenceInterval: [payoff * 0.8, payoff * 1.2],
            probability: nashEq.stability,
          }))
        : [],
    };

    if (requiresHumanReview) {
      this.pendingDecisions.set(decision.id, decision);
    }

    this.emit('decision:completed', { id: decision.id, type: 'game_theory' });
    return decision;
  }

  /**
   * Cria matriz de payoffs
   */
  private createPayoffMatrix(gameId: string, players: Player[]): PayoffMatrix {
    return this.gameTheory.createPayoffMatrix(
      gameId,
      players,
      (s1: string, s2: string) => {
        // Payoff simples baseado em nomes de estrategias
        const base = s1.localeCompare(s2);
        return [base * 10, -base * 10];
      }
    );
  }

  // ============================================================================
  // DECISAO POR INFERENCIA CAUSAL
  // ============================================================================

  /**
   * Decide usando inferencia causal
   */
  async decideByCausalInference(
    dataId: string,
    intervention: string,
    outcome: string,
    context: DecisionContext
  ): Promise<Decision> {
    console.log('Starting causal inference decision...');
    this.emit('decision:started', { type: 'causal', intervention, outcome });

    // Calcular efeito causal
    const effect = this.causalInference.calculateAverageTreatmentEffect(
      dataId,
      intervention,
      outcome
    );

    // Calcular intervalo de confianca
    const ci = this.causalInference.calculateConfidenceInterval(
      dataId,
      intervention,
      outcome
    );

    // Verificar necessidade de revisao humana
    const requiresHumanReview = effect.confidence < 0.7 || Math.abs(effect.effect) < 0.1;

    const decision: Decision = {
      id: `dec_ci_${Date.now()}`,
      type: 'causal',
      recommendation:
        effect.effect > 0
          ? `Apply intervention: ${intervention}`
          : `Avoid intervention: ${intervention}`,
      alternatives: [
        {
          id: 'intervene',
          description: `Apply ${intervention}`,
          expectedValue: effect.effect,
          uncertainty: 1 - effect.confidence,
          tradeoffs: { [intervention]: effect.effect },
          feasibility: effect.confidence,
        },
        {
          id: 'no_intervene',
          description: 'Status quo',
          expectedValue: 0,
          uncertainty: 0.1,
          tradeoffs: {},
          feasibility: 1,
        },
      ],
      confidence: effect.confidence,
      reasoning: {
        steps: [
          `Analyzed causal effect of ${intervention} on ${outcome}`,
          `Estimated ATE: ${effect.effect.toFixed(3)}`,
          `95% CI: [${ci.lower.toFixed(3)}, ${ci.upper.toFixed(3)}]`,
          `Method: ${effect.method}`,
          `Bias correction: ${(effect.biasCorrection * 100).toFixed(1)}%`,
        ],
        evidence: [`Effect size: ${effect.effect}`, `Confidence: ${effect.confidence}`],
        assumptions: ['No unmeasured confounding', 'Positivity assumption holds'],
        logicalStructure: 'Causal inference with potential outcomes framework',
      },
      humanReview: {
        required: requiresHumanReview,
        reason: requiresHumanReview
          ? effect.confidence < 0.7
            ? 'Low confidence in causal estimate'
            : 'Small effect size - may not be practically significant'
          : 'Strong causal evidence',
      },
      executionPlan: [
        {
          order: 1,
          action: effect.effect > 0 ? `Apply ${intervention}` : 'Maintain status quo',
          responsible: 'system',
          dependencies: [],
        },
      ],
      risks: [
        {
          risk: 'Unmeasured confounding',
          probability: 0.2,
          impact: 0.6,
          mitigation: 'Collect additional covariates',
        },
      ],
      expectedOutcomes: [
        {
          metric: outcome,
          predictedValue: ci.estimate,
          confidenceInterval: [ci.lower, ci.upper],
          probability: effect.confidence,
        },
      ],
    };

    if (requiresHumanReview) {
      this.pendingDecisions.set(decision.id, decision);
    }

    this.emit('decision:completed', { id: decision.id, type: 'causal' });
    return decision;
  }

  // ============================================================================
  // HUMAN-IN-THE-LOOP
  // ============================================================================

  /**
   * Solicita revisao humana
   */
  async requestHumanReview(decisionId: string, deadlineMinutes: number = 30): Promise<HumanFeedback> {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) {
      throw new Error(`Decision ${decisionId} not found or does not require review`);
    }

    console.log(`Requesting human review for decision ${decisionId}...`);
    this.emit('human:review_requested', { decisionId, deadline: deadlineMinutes });

    // Criar promise que sera resolvida quando feedback for recebido
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.humanReviewCallbacks.delete(decisionId);
        reject(new Error('Human review timeout'));
      }, deadlineMinutes * 60 * 1000);

      this.humanReviewCallbacks.set(decisionId, (feedback: HumanFeedback) => {
        clearTimeout(timeout);
        this.processHumanFeedback(decisionId, feedback);
        resolve(feedback);
      });
    });
  }

  /**
   * Recebe feedback humano
   */
  submitHumanFeedback(decisionId: string, feedback: HumanFeedback, modifications?: Partial<Decision>): void {
    const callback = this.humanReviewCallbacks.get(decisionId);
    if (!callback) {
      throw new Error(`No pending review for decision ${decisionId}`);
    }

    const decision = this.pendingDecisions.get(decisionId);
    if (decision) {
      decision.humanReview.feedback = feedback;
      decision.humanReview.modifications = modifications;
    }

    callback(feedback);
  }

  /**
   * Processa feedback humano
   */
  private processHumanFeedback(decisionId: string, feedback: HumanFeedback): void {
    const decision = this.pendingDecisions.get(decisionId);
    if (!decision) return;

    console.log(`Processing human feedback for ${decisionId}: ${feedback}`);

    switch (feedback) {
      case 'approve':
        decision.humanReview.required = false;
        this.emit('human:approved', { decisionId });
        break;
      case 'reject':
        decision.humanReview.required = true;
        this.emit('human:rejected', { decisionId });
        break;
      case 'modify':
        if (decision.humanReview.modifications) {
          Object.assign(decision, decision.humanReview.modifications);
        }
        this.emit('human:modified', { decisionId });
        break;
      case 'request_info':
        this.emit('human:info_requested', { decisionId });
        break;
    }

    this.pendingDecisions.delete(decisionId);
    this.humanReviewCallbacks.delete(decisionId);
  }

  /**
   * Verifica se deve requerer revisao humana
   */
  private shouldRequireHumanReview(result: OptimizationResult, context: DecisionContext): boolean {
    // Cenarios criticos que requerem revisao humana
    if (result.confidence < 0.6) return true;
    if (context.riskTolerance < 0.3) return true;
    if (context.timeHorizon < 1) return true;

    // Impacto financeiro alto
    if (context.availableResources.budget > 100000) return true;

    return false;
  }

  // ============================================================================
  // METODOS AUXILIARES
  // ============================================================================

  /**
   * Gera plano de execucao
   */
  private generateExecutionPlan(option: Option): ExecutionStep[] {
    return [
      {
        order: 1,
        action: `Initialize execution of ${option.name}`,
        responsible: 'system',
        dependencies: [],
      },
      {
        order: 2,
        action: `Execute ${option.description}`,
        responsible: 'system',
        dependencies: [1],
      },
      {
        order: 3,
        action: 'Monitor outcomes and adapt',
        responsible: 'system',
        dependencies: [2],
      },
    ];
  }

  /**
   * Avalia riscos
   */
  private assessRisks(result: OptimizationResult, context: DecisionContext): RiskAssessment[] {
    const risks: RiskAssessment[] = [];

    // Risco de sensibilidade
    if (result.sensitivity.sensitiveObjectives.length > 0) {
      risks.push({
        risk: `Sensitive to changes in: ${result.sensitivity.sensitiveObjectives.join(', ')}`,
        probability: 0.4,
        impact: 0.6,
        mitigation: 'Monitor these objectives closely',
      });
    }

    // Risco de recursos
    if (context.availableResources.time < 24) {
      risks.push({
        risk: 'Time constraint may affect execution',
        probability: 0.5,
        impact: 0.7,
        mitigation: 'Prioritize critical steps',
      });
    }

    return risks;
  }

  /**
   * Prediz outcomes
   */
  private predictOutcomes(
    solution: { option: Option; objectives: Record<string, number> },
    objectives: Objective[]
  ): OutcomePrediction[] {
    return objectives.map(obj => {
      const value = solution.objectives[obj.name];
      return {
        metric: obj.name,
        predictedValue: value,
        confidenceInterval: [value * 0.9, value * 1.1],
        probability: 0.9,
      };
    });
  }

  // ============================================================================
  // ACESSO AOS MOTORES
  // ============================================================================

  getOptimizer(): MultiObjectiveOptimizer {
    return this.optimizer;
  }

  getGameTheory(): GameTheoryEngine {
    return this.gameTheory;
  }

  getCausalInference(): CausalInferenceEngine {
    return this.causalInference;
  }

  // ============================================================================
  // ESTATISTICAS E LIMPEZA
  // ============================================================================

  /**
   * Retorna estatisticas
   */
  getStats(): {
    pendingReviews: number;
    optimizer: ReturnType<MultiObjectiveOptimizer['getStats']>;
    gameTheory: ReturnType<GameTheoryEngine['getStats']>;
    causalInference: ReturnType<CausalInferenceEngine['getStats']>;
  } {
    return {
      pendingReviews: this.pendingDecisions.size,
      optimizer: this.optimizer.getStats(),
      gameTheory: this.gameTheory.getStats(),
      causalInference: this.causalInference.getStats(),
    };
  }

  /**
   * Limpa dados
   */
  clear(): void {
    this.optimizer.clear();
    this.gameTheory.clear();
    this.causalInference.clear();
    this.pendingDecisions.clear();
    this.humanReviewCallbacks.clear();
    this.emit('engine:cleared');
  }
}

// Exportar modulos individuais
export { MultiObjectiveOptimizer, Objective, Option } from './multi-objective';
export { GameTheoryEngine, Player, GameAnalysis } from './game-theory';
export { CausalInferenceEngine, Variable, CausalEffect } from './causal-inference';
