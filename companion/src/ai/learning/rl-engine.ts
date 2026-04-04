/**
 * REINFORCEMENT LEARNING ENGINE - Learning Engine v3.0 Supremo
 * Aprendizado por reforço com políticas adaptativas
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE RL
// ============================================================================

export interface State {
  id: string;
  features: Record<string, number>;
  context: Record<string, unknown>;
  timestamp: Date;
}

export interface Action {
  id: string;
  type: string;
  parameters: Record<string, unknown>;
  expectedOutcome?: string;
}

export interface Reward {
  value: number;
  components: RewardComponent[];
  timestamp: Date;
}

export interface RewardComponent {
  name: string;
  value: number;
  weight: number;
  description: string;
}

export interface Experience {
  state: State;
  action: Action;
  reward: Reward;
  nextState: State;
  done: boolean;
  timestamp: Date;
}

export interface Policy {
  state: string;
  actionProbabilities: Map<string, number>;
  value: number;
  visitCount: number;
}

// ============================================================================
// CONFIGURACAO
// ============================================================================

export interface RLEngineConfig {
  learningRate: number;
  discountFactor: number;
  epsilon: number; // Exploration rate
  epsilonDecay: number;
  epsilonMin: number;
  replayBufferSize: number;
  batchSize: number;
  targetUpdateFrequency: number;
}

// ============================================================================
// REINFORCEMENT LEARNING ENGINE
// ============================================================================

export class RLEngine extends EventEmitter {
  private config: RLEngineConfig;
  private replayBuffer: Experience[] = [];
  private policyTable: Map<string, Policy> = new Map();
  private valueTable: Map<string, number> = new Map();
  
  private episodeCount = 0;
  private totalReward = 0;
  private actionCount = 0;

  constructor(config: Partial<RLEngineConfig> = {}) {
    super();
    
    this.config = {
      learningRate: 0.1,
      discountFactor: 0.95,
      epsilon: 0.1,
      epsilonDecay: 0.995,
      epsilonMin: 0.01,
      replayBufferSize: 10000,
      batchSize: 32,
      targetUpdateFrequency: 100,
      ...config,
    };
  }

  /**
   * Seleciona acao baseado na política atual (epsilon-greedy)
   */
  selectAction(state: State, availableActions: Action[]): Action {
    const stateKey = this.serializeState(state);
    
    // Exploration vs Exploitation
    if (Math.random() < this.config.epsilon) {
      // Exploration: ação aleatória
      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      this.emit('action:exploration', { state: stateKey, action: randomAction.id });
      return randomAction;
    }

    // Exploitation: melhor ação conhecida
    const policy = this.policyTable.get(stateKey);
    
    if (policy) {
      // Encontrar ação com maior probabilidade
      let bestAction: Action | null = null;
      let bestProb = -1;

      for (const action of availableActions) {
        const prob = policy.actionProbabilities.get(action.id) || 0;
        if (prob > bestProb) {
          bestProb = prob;
          bestAction = action;
        }
      }

      if (bestAction) {
        this.emit('action:exploitation', { state: stateKey, action: bestAction.id, probability: bestProb });
        return bestAction;
      }
    }

    // Se não há política, escolher aleatoriamente
    return availableActions[Math.floor(Math.random() * availableActions.length)];
  }

  /**
   * Treina com uma experiência
   */
  train(experience: Experience): void {
    // Adicionar ao replay buffer
    this.replayBuffer.push(experience);
    
    if (this.replayBuffer.length > this.config.replayBufferSize) {
      this.replayBuffer.shift();
    }

    this.totalReward += experience.reward.value;
    this.actionCount++;

    // Treinar se tiver batch suficiente
    if (this.replayBuffer.length >= this.config.batchSize) {
      this.trainBatch();
    }

    this.emit('experience:learned', {
      state: experience.state.id,
      action: experience.action.id,
      reward: experience.reward.value,
    });
  }

  /**
   * Treina com um batch de experiências
   */
  private trainBatch(): void {
    // Amostrar batch aleatório
    const batch = this.sampleBatch();

    for (const exp of batch) {
      this.updateQValue(exp);
    }

    // Decay epsilon
    this.config.epsilon = Math.max(
      this.config.epsilonMin,
      this.config.epsilon * this.config.epsilonDecay
    );

    this.emit('batch:trained', { size: batch.length, epsilon: this.config.epsilon });
  }

  /**
   * Atualiza Q-value usando Q-learning
   */
  private updateQValue(exp: Experience): void {
    const stateKey = this.serializeState(exp.state);
    const nextStateKey = this.serializeState(exp.nextState);
    const actionKey = `${stateKey}:${exp.action.id}`;

    // Q-value atual
    const currentQ = this.valueTable.get(actionKey) || 0;

    // Max Q-value para próximo estado
    const nextMaxQ = this.getMaxQValue(nextStateKey);

    // Calcular target
    const target = exp.reward.value + this.config.discountFactor * nextMaxQ * (exp.done ? 0 : 1);

    // Atualizar Q-value
    const newQ = currentQ + this.config.learningRate * (target - currentQ);
    this.valueTable.set(actionKey, newQ);

    // Atualizar política
    this.updatePolicy(stateKey, exp.action.id, newQ);
  }

  /**
   * Atualiza a política para um estado
   */
  private updatePolicy(stateKey: string, actionId: string, qValue: number): void {
    let policy = this.policyTable.get(stateKey);

    if (!policy) {
      policy = {
        state: stateKey,
        actionProbabilities: new Map(),
        value: 0,
        visitCount: 0,
      };
      this.policyTable.set(stateKey, policy);
    }

    policy.visitCount++;
    policy.actionProbabilities.set(actionId, qValue);

    // Normalizar probabilidades (softmax)
    const expSum = Array.from(policy.actionProbabilities.values())
      .reduce((sum, q) => sum + Math.exp(q), 0);

    for (const [action, q] of policy.actionProbabilities) {
      const prob = Math.exp(q) / expSum;
      policy.actionProbabilities.set(action, prob);
    }

    // Atualizar valor do estado
    policy.value = Array.from(policy.actionProbabilities.values())
      .reduce((sum, prob) => sum + prob, 0) / policy.actionProbabilities.size;
  }

  /**
   * Obtém o maior Q-value para um estado
   */
  private getMaxQValue(stateKey: string): number {
    const policy = this.policyTable.get(stateKey);
    if (!policy || policy.actionProbabilities.size === 0) return 0;

    return Math.max(...policy.actionProbabilities.values());
  }

  /**
   * Amostra batch do replay buffer
   */
  private sampleBatch(): Experience[] {
    const batch: Experience[] = [];
    const bufferSize = this.replayBuffer.length;

    for (let i = 0; i < this.config.batchSize; i++) {
      const idx = Math.floor(Math.random() * bufferSize);
      batch.push(this.replayBuffer[idx]);
    }

    return batch;
  }

  /**
   * Serializa estado para chave
   */
  private serializeState(state: State): string {
    // Criar representação simplificada do estado
    const features = Object.entries(state.features)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v.toFixed(2)}`)
      .join('|');

    return `${state.id}|[${features}]`;
  }

  /**
   * Calcula recompensa composta
   */
  calculateReward(
    outcome: 'success' | 'failure' | 'partial',
    metrics: Record<string, number>
  ): Reward {
    const components: RewardComponent[] = [];
    let totalValue = 0;

    // Componente de resultado
    const outcomeReward = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : -1;
    components.push({
      name: 'outcome',
      value: outcomeReward,
      weight: 0.4,
      description: `Action ${outcome}`,
    });

    // Componente de tempo
    if (metrics.duration !== undefined) {
      const timeReward = metrics.duration < 1000 ? 0.5 : metrics.duration < 5000 ? 0.2 : -0.2;
      components.push({
        name: 'time_efficiency',
        value: timeReward,
        weight: 0.2,
        description: `Duration: ${metrics.duration}ms`,
      });
    }

    // Componente de precisão
    if (metrics.accuracy !== undefined) {
      components.push({
        name: 'accuracy',
        value: metrics.accuracy * 2 - 1, // Normalizar para [-1, 1]
        weight: 0.2,
        description: `Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`,
      });
    }

    // Componente de economia de recursos
    if (metrics.resourceUsage !== undefined) {
      const resourceReward = 1 - metrics.resourceUsage;
      components.push({
        name: 'resource_efficiency',
        value: resourceReward,
        weight: 0.2,
        description: `Resource usage: ${(metrics.resourceUsage * 100).toFixed(1)}%`,
      });
    }

    // Calcular recompensa total ponderada
    totalValue = components.reduce((sum, c) => sum + c.value * c.weight, 0);

    return {
      value: totalValue,
      components,
      timestamp: new Date(),
    };
  }

  /**
   * Inicia novo episódio
   */
  startEpisode(): void {
    this.episodeCount++;
    this.emit('episode:started', { episode: this.episodeCount });
  }

  /**
   * Finaliza episódio
   */
  endEpisode(): void {
    const avgReward = this.actionCount > 0 ? this.totalReward / this.actionCount : 0;
    
    this.emit('episode:ended', {
      episode: this.episodeCount,
      totalReward: this.totalReward,
      actionCount: this.actionCount,
      averageReward: avgReward,
      epsilon: this.config.epsilon,
    });

    // Resetar contadores
    this.totalReward = 0;
    this.actionCount = 0;
  }

  /**
   * Retorna estatísticas de treinamento
   */
  getStats(): {
    episodeCount: number;
    replayBufferSize: number;
    policyTableSize: number;
    valueTableSize: number;
    currentEpsilon: number;
    totalExperiences: number;
  } {
    return {
      episodeCount: this.episodeCount,
      replayBufferSize: this.replayBuffer.length,
      policyTableSize: this.policyTable.size,
      valueTableSize: this.valueTable.size,
      currentEpsilon: this.config.epsilon,
      totalExperiences: this.replayBuffer.length,
    };
  }

  /**
   * Exporta política treinada
   */
  exportPolicy(): Record<string, Policy> {
    const exported: Record<string, Policy> = {};
    
    for (const [key, policy] of this.policyTable) {
      exported[key] = {
        ...policy,
        actionProbabilities: new Map(policy.actionProbabilities),
      };
    }

    return exported;
  }

  /**
   * Importa política
   */
  importPolicy(policies: Record<string, Policy>): void {
    for (const [key, policy] of Object.entries(policies)) {
      this.policyTable.set(key, {
        ...policy,
        actionProbabilities: new Map(policy.actionProbabilities),
      });
    }

    this.emit('policy:imported', { count: Object.keys(policies).length });
  }
}
