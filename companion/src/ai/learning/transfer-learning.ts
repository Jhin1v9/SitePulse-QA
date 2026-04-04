/**
 * TRANSFER LEARNING ENGINE - Learning Engine v3.0 Supremo
 * Transferencia de conhecimento entre dominios
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE DOMINIO E MODELO
// ============================================================================

export interface Domain {
  id: string;
  name: string;
  type: 'security' | 'qa' | 'performance' | 'general';
  features: string[];
  dataDistribution: Record<string, { mean: number; std: number }>;
  sampleCount: number;
}

export interface Model {
  id: string;
  domain: string;
  type: 'classifier' | 'regressor' | 'policy' | 'embedding';
  parameters: Record<string, unknown>;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  trainedAt: Date;
  version: string;
}

export interface TransferTask {
  sourceDomain: Domain;
  targetDomain: Domain;
  model: Model;
  strategy: TransferStrategy;
}

export type TransferStrategy =
  | 'fine_tuning'
  | 'feature_extraction'
  | 'domain_adaptation'
  | 'multi_task'
  | 'knowledge_distillation';

// ============================================================================
// RESULTADO DE TRANSFERENCIA
// ============================================================================

export interface TransferResult {
  success: boolean;
  transferredModel: Model;
  performanceGain: number;
  similarity: number;
  trainingTime: number;
  samplesUsed: number;
  adaptationLayers: string[];
}

// ============================================================================
// TRANSFER LEARNING ENGINE
// ============================================================================

export class TransferLearningEngine extends EventEmitter {
  private domains: Map<string, Domain> = new Map();
  private models: Map<string, Model> = new Map();
  private transferHistory: TransferResult[] = [];

  /**
   * Registra um novo dominio
   */
  registerDomain(domain: Domain): void {
    this.domains.set(domain.id, domain);
    this.emit('domain:registered', domain);
  }

  /**
   * Registra um modelo treinado
   */
  registerModel(model: Model): void {
    this.models.set(model.id, model);
    this.emit('model:registered', model);
  }

  /**
   * Calcula similaridade entre dominios
   */
  calculateDomainSimilarity(sourceId: string, targetId: string): number {
    const source = this.domains.get(sourceId);
    const target = this.domains.get(targetId);

    if (!source || !target) return 0;

    // 1. Similaridade de features (Jaccard)
    const sourceFeatures = new Set(source.features);
    const targetFeatures = new Set(target.features);
    const intersection = new Set([...sourceFeatures].filter(f => targetFeatures.has(f)));
    const union = new Set([...sourceFeatures, ...targetFeatures]);
    const featureSimilarity = intersection.size / union.size;

    // 2. Similaridade de distribuicao de dados
    let distributionSimilarity = 0;
    let commonFeatures = 0;

    for (const [feature, sourceStats] of Object.entries(source.dataDistribution)) {
      const targetStats = target.dataDistribution[feature];
      if (targetStats) {
        // Distancia normalizada entre medias
        const meanDiff = Math.abs(sourceStats.mean - targetStats.mean);
        const pooledStd = Math.sqrt((sourceStats.std ** 2 + targetStats.std ** 2) / 2);
        const distance = pooledStd > 0 ? meanDiff / pooledStd : 0;
        
        distributionSimilarity += Math.max(0, 1 - distance);
        commonFeatures++;
      }
    }

    if (commonFeatures > 0) {
      distributionSimilarity /= commonFeatures;
    }

    // 3. Similaridade de tipo
    const typeSimilarity = source.type === target.type ? 1 : 0.5;

    // Combinar similaridades
    return (
      featureSimilarity * 0.4 +
      distributionSimilarity * 0.4 +
      typeSimilarity * 0.2
    );
  }

  /**
   * Encontra os melhores modelos fonte para transferencia
   */
  findBestSourceModels(targetDomainId: string, limit: number = 3): Array<{
    model: Model;
    similarity: number;
    estimatedGain: number;
  }> {
    const target = this.domains.get(targetDomainId);
    if (!target) return [];

    const candidates: Array<{
      model: Model;
      similarity: number;
      estimatedGain: number;
    }> = [];

    for (const model of this.models.values()) {
      const similarity = this.calculateDomainSimilarity(model.domain, targetDomainId);
      
      if (similarity > 0.3) { // Threshold minimo
        // Estimar ganho baseado em similaridade e performance do modelo fonte
        const estimatedGain = this.estimatePerformanceGain(similarity, model.performance);
        
        candidates.push({
          model,
          similarity,
          estimatedGain,
        });
      }
    }

    // Ordenar por ganho estimado
    candidates.sort((a, b) => b.estimatedGain - a.estimatedGain);

    return candidates.slice(0, limit);
  }

  /**
   * Realiza transferencia de aprendizado
   */
  async transfer(task: TransferTask): Promise<TransferResult> {
    console.log(`Starting transfer from ${task.sourceDomain.name} to ${task.targetDomain.name}...`);
    this.emit('transfer:started', task);

    const startTime = Date.now();

    // 1. Calcular similaridade
    const similarity = this.calculateDomainSimilarity(
      task.sourceDomain.id,
      task.targetDomain.id
    );

    // 2. Selecionar estrategia baseada na similaridade
    const strategy = this.selectStrategy(similarity, task.strategy);

    // 3. Adaptar modelo
    const adaptedModel = await this.adaptModel(
      task.model,
      task.sourceDomain,
      task.targetDomain,
      strategy
    );

    // 4. Calcular ganho de performance
    const performanceGain = this.calculatePerformanceGain(
      task.model,
      adaptedModel
    );

    const result: TransferResult = {
      success: performanceGain > 0,
      transferredModel: adaptedModel,
      performanceGain,
      similarity,
      trainingTime: Date.now() - startTime,
      samplesUsed: task.targetDomain.sampleCount,
      adaptationLayers: this.identifyAdaptationLayers(strategy),
    };

    this.transferHistory.push(result);
    this.emit('transfer:completed', result);

    return result;
  }

  /**
   * Seleciona a melhor estrategia de transferencia
   */
  private selectStrategy(
    similarity: number,
    preferred?: TransferStrategy
  ): TransferStrategy {
    if (preferred) return preferred;

    if (similarity > 0.8) return 'fine_tuning';
    if (similarity > 0.5) return 'feature_extraction';
    if (similarity > 0.3) return 'domain_adaptation';
    return 'knowledge_distillation';
  }

  /**
   * Adapta modelo para o dominio alvo
   */
  private async adaptModel(
    sourceModel: Model,
    sourceDomain: Domain,
    targetDomain: Domain,
    strategy: TransferStrategy
  ): Promise<Model> {
    const adaptedModel: Model = {
      id: `adapted-${Date.now()}`,
      domain: targetDomain.id,
      type: sourceModel.type,
      parameters: { ...sourceModel.parameters },
      performance: { ...sourceModel.performance },
      trainedAt: new Date(),
      version: `${sourceModel.version}-adapted`,
    };

    switch (strategy) {
      case 'fine_tuning':
        this.applyFineTuning(adaptedModel, sourceDomain, targetDomain);
        break;

      case 'feature_extraction':
        this.applyFeatureExtraction(adaptedModel, sourceDomain, targetDomain);
        break;

      case 'domain_adaptation':
        this.applyDomainAdaptation(adaptedModel, sourceDomain, targetDomain);
        break;

      case 'multi_task':
        this.applyMultiTaskLearning(adaptedModel, sourceDomain, targetDomain);
        break;

      case 'knowledge_distillation':
        this.applyKnowledgeDistillation(adaptedModel, sourceModel, targetDomain);
        break;
    }

    // Ajustar performance baseado na qualidade da transferencia
    adaptedModel.performance = this.projectPerformance(
      sourceModel.performance,
      sourceDomain,
      targetDomain
    );

    this.registerModel(adaptedModel);

    return adaptedModel;
  }

  /**
   * Aplica fine-tuning
   */
  private applyFineTuning(
    model: Model,
    sourceDomain: Domain,
    targetDomain: Domain
  ): void {
    // Em fine-tuning, ajustamos todos os parametros com learning rate menor
    model.parameters['learningRate'] = 0.0001;
    model.parameters['frozenLayers'] = [];
    model.parameters['trainableLayers'] = 'all';
    model.parameters['transferMethod'] = 'fine_tuning';
  }

  /**
   * Aplica feature extraction
   */
  private applyFeatureExtraction(
    model: Model,
    sourceDomain: Domain,
    targetDomain: Domain
  ): void {
    // Congelar camadas de feature extraction, treinar apenas classifier
    model.parameters['frozenLayers'] = ['conv', 'encoder', 'backbone'];
    model.parameters['trainableLayers'] = ['classifier', 'head'];
    model.parameters['transferMethod'] = 'feature_extraction';
  }

  /**
   * Aplica domain adaptation
   */
  private applyDomainAdaptation(
    model: Model,
    sourceDomain: Domain,
    targetDomain: Domain
  ): void {
    // Adicionar camadas de adaptacao de dominio
    model.parameters['domainAdaptation'] = true;
    model.parameters['adaptationLayers'] = ['domain_classifier', 'gradient_reversal'];
    model.parameters['transferMethod'] = 'domain_adaptation';
    
    // Calcular diferenca de distribuicao
    const distributionShift = this.calculateDistributionShift(sourceDomain, targetDomain);
    model.parameters['distributionShift'] = distributionShift;
  }

  /**
   * Aplica multi-task learning
   */
  private applyMultiTaskLearning(
    model: Model,
    sourceDomain: Domain,
    targetDomain: Domain
  ): void {
    // Compartilhar representacoes, cabecas especificas por dominio
    model.parameters['multiTask'] = true;
    model.parameters['sharedLayers'] = ['encoder', 'backbone'];
    model.parameters['taskSpecificLayers'] = {
      [sourceDomain.id]: ['head_source'],
      [targetDomain.id]: ['head_target'],
    };
    model.parameters['transferMethod'] = 'multi_task';
  }

  /**
   * Aplica knowledge distillation
   */
  private applyKnowledgeDistillation(
    model: Model,
    teacherModel: Model,
    targetDomain: Domain
  ): void {
    // Usar modelo fonte como teacher, treinar student menor
    model.parameters['knowledgeDistillation'] = true;
    model.parameters['teacherModel'] = teacherModel.id;
    model.parameters['temperature'] = 4.0;
    model.parameters['alpha'] = 0.5; // Peso entre soft e hard targets
    model.parameters['transferMethod'] = 'knowledge_distillation';
  }

  /**
   * Calcula shift de distribuicao entre dominios
   */
  private calculateDistributionShift(
    source: Domain,
    target: Domain
  ): Record<string, number> {
    const shifts: Record<string, number> = {};

    for (const [feature, sourceStats] of Object.entries(source.dataDistribution)) {
      const targetStats = target.dataDistribution[feature];
      if (targetStats) {
        const meanShift = Math.abs(sourceStats.mean - targetStats.mean);
        const stdShift = Math.abs(sourceStats.std - targetStats.std);
        shifts[feature] = (meanShift + stdShift) / 2;
      }
    }

    return shifts;
  }

  /**
   * Projeta performance no dominio alvo
   */
  private projectPerformance(
    sourcePerformance: Model['performance'],
    sourceDomain: Domain,
    targetDomain: Domain
  ): Model['performance'] {
    const similarity = this.calculateDomainSimilarity(sourceDomain.id, targetDomain.id);
    
    // Performance degradada pela diferenca de dominio
    const degradationFactor = 0.8 + similarity * 0.2; // 0.8 a 1.0

    return {
      accuracy: sourcePerformance.accuracy * degradationFactor,
      precision: sourcePerformance.precision * degradationFactor,
      recall: sourcePerformance.recall * degradationFactor,
      f1Score: sourcePerformance.f1Score * degradationFactor,
    };
  }

  /**
   * Estima ganho de performance
   */
  private estimatePerformanceGain(
    similarity: number,
    sourcePerformance: Model['performance']
  ): number {
    // Ganho potencial baseado em similaridade e performance fonte
    const baseGain = sourcePerformance.f1Score * similarity;
    const transferEfficiency = 0.7 + similarity * 0.3; // Eficiencia de transferencia
    
    return baseGain * transferEfficiency;
  }

  /**
   * Calcula ganho real de performance
   */
  private calculatePerformanceGain(
    sourceModel: Model,
    adaptedModel: Model
  ): number {
    const sourceF1 = sourceModel.performance.f1Score;
    const adaptedF1 = adaptedModel.performance.f1Score;

    if (sourceF1 === 0) return 0;

    return ((adaptedF1 - sourceF1) / sourceF1) * 100;
  }

  /**
   * Identifica camadas adaptadas
   */
  private identifyAdaptationLayers(strategy: TransferStrategy): string[] {
    const layers: Record<TransferStrategy, string[]> = {
      fine_tuning: ['all_layers'],
      feature_extraction: ['classifier', 'head'],
      domain_adaptation: ['domain_classifier', 'feature_extractor'],
      multi_task: ['task_heads', 'shared_backbone'],
      knowledge_distillation: ['student_layers'],
    };

    return layers[strategy] || [];
  }

  /**
   * Retorna estatisticas de transferencia
   */
  getStats(): {
    totalDomains: number;
    totalModels: number;
    totalTransfers: number;
    averagePerformanceGain: number;
    successfulTransfers: number;
  } {
    const successful = this.transferHistory.filter(t => t.success).length;
    const avgGain = this.transferHistory.length > 0
      ? this.transferHistory.reduce((sum, t) => sum + t.performanceGain, 0) / this.transferHistory.length
      : 0;

    return {
      totalDomains: this.domains.size,
      totalModels: this.models.size,
      totalTransfers: this.transferHistory.length,
      averagePerformanceGain: avgGain,
      successfulTransfers: successful,
    };
  }

  /**
   * Retorna historico de transferencias
   */
  getTransferHistory(): TransferResult[] {
    return [...this.transferHistory];
  }
}
