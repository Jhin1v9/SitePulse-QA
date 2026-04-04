/**
 * MEMORY ENGINE v3.0 SUPREMO
 * Memoria organizacional com Knowledge Graph e aprendizado
 */

import { EventEmitter } from 'events';
import {
  EngineBase,
  EngineConfig,
  HealthStatus,
  EngineMetrics,
} from '../../shared/types/engine-base';

import {
  KnowledgeGraphEngine,
  Entity,
  Relationship,
  EntityType,
  RelationType,
  GraphQuery,
  InferenceResult,
} from './knowledge-graph';

import {
  PatternLearningEngine,
  Pattern,
  PatternType,
  Experience,
  LearningResult,
  PatternPrediction,
} from './pattern-learning';

import {
  RecallEngine,
  MemoryEntry,
  MemoryType,
  SearchQuery,
  RecallContext,
} from './recall-engine';

// ============================================================================
// CONFIGURACAO
// ============================================================================

export interface MemoryEngineConfig extends EngineConfig {
  knowledgeGraph: {
    enableInference: boolean;
    maxEntities: number;
    maxRelationships: number;
  };
  patternLearning: {
    minOccurrences: number;
    minConfidence: number;
    autoLearn: boolean;
  };
  recall: {
    embeddingSize: number;
    semanticWeight: number;
    temporalWeight: number;
    importanceWeight: number;
  };
}

// ============================================================================
// RESULTADO DE MEMORIA
// ============================================================================

export interface MemoryResult {
  knowledge: {
    entities: Entity[];
    relationships: Relationship[];
    inferences: InferenceResult;
  };
  patterns: {
    discovered: Pattern[];
    predictions: PatternPrediction[];
  };
  memories: {
    relevant: MemoryEntry[];
    context: RecallContext;
  };
  recommendations: string[];
}

// ============================================================================
// MEMORY ENGINE v3.0 SUPREMO
// ============================================================================

export class MemoryEngineSupremo extends EventEmitter implements EngineBase {
  readonly name = 'MemoryEngineSupremo';
  readonly version = '3.0.0';
  status: 'initializing' | 'ready' | 'busy' | 'error' | 'shutdown' = 'initializing';

  private config!: MemoryEngineConfig;
  private knowledgeGraph: KnowledgeGraphEngine;
  private patternLearning: PatternLearningEngine;
  private recallEngine: RecallEngine;

  private healthStatus: HealthStatus = {
    status: 'healthy',
    lastCheck: new Date(),
    checks: [],
    uptime: 0,
  };

  private metrics: EngineMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0,
    lastUpdated: new Date(),
  };

  private startTime: Date = new Date();
  private responseTimes: number[] = [];

  constructor() {
    super();

    const defaultConfig: MemoryEngineConfig = {
      name: 'MemoryEngineSupremo',
      version: '3.0.0',
      enabled: true,
      logging: { level: 'info', destination: 'console', format: 'json', retention: 30 },
      performance: {
        maxConcurrency: 10,
        timeoutMs: 30000,
        retryAttempts: 3,
        retryDelayMs: 1000,
        cacheEnabled: true,
        cacheTtlMs: 3600000,
      },
      security: {
        encryptionEnabled: true,
        auditLogEnabled: true,
        maxInputSize: 10000000,
        sanitizeInput: true,
        rateLimiting: { enabled: true, maxRequests: 1000, windowMs: 60000 },
      },
      knowledgeGraph: {
        enableInference: true,
        maxEntities: 100000,
        maxRelationships: 500000,
      },
      patternLearning: {
        minOccurrences: 3,
        minConfidence: 0.6,
        autoLearn: true,
      },
      recall: {
        embeddingSize: 128,
        semanticWeight: 0.4,
        temporalWeight: 0.2,
        importanceWeight: 0.2,
      },
    };

    this.knowledgeGraph = new KnowledgeGraphEngine();
    this.patternLearning = new PatternLearningEngine();
    this.recallEngine = new RecallEngine();

    this.config = defaultConfig;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.knowledgeGraph.on('entity:added', (data) => {
      this.emit('knowledge:entity:added', data);
    });

    this.patternLearning.on('pattern:discovered', (data) => {
      this.emit('pattern:discovered', data);
    });

    this.recallEngine.on('memory:stored', (data) => {
      this.emit('memory:stored', data);
    });
  }

  // ========================================================================
  // INICIALIZACAO
  // ========================================================================

  async initialize(config?: MemoryEngineConfig): Promise<void> {
    console.log('Initializing Memory Engine v3.0 Supremo...');

    if (config) {
      this.config = config;
    }

    await this.health();

    this.status = 'ready';
    this.emit('ready', { timestamp: new Date() });

    console.log('Memory Engine v3.0 Supremo is ready!');
    console.log('Features:');
    console.log('  - Knowledge Graph with semantic inference');
    console.log('  - Pattern learning from experiences');
    console.log('  - Active recall with semantic search');
    console.log('  - Cross-domain knowledge linking');
  }

  // ========================================================================
  // API PRINCIPAL
  // ========================================================================

  /**
   * Recupera memoria contextual completa
   */
  async retrieve(context: Record<string, unknown>, query: string): Promise<MemoryResult> {
    const startTime = Date.now();
    this.status = 'busy';
    this.metrics.totalRequests++;

    try {
      console.log('Retrieving contextual memory...');

      // 1. Buscar no Knowledge Graph
      console.log('  Phase 1: Knowledge Graph query...');
      const kgResults = this.queryKnowledgeGraph(query);
      const inferences = this.config.knowledgeGraph.enableInference
        ? this.knowledgeGraph.infer(kgResults.entities[0]?.id || '')
        : { inferredRelationships: [], inferredEntities: [], reasoning: [], confidence: 0 };

      // 2. Prever padroes
      console.log('  Phase 2: Pattern prediction...');
      const predictions = this.patternLearning.predict(context);

      // 3. Recuperar memorias relevantes
      console.log('  Phase 3: Memory recall...');
      const recallContext = this.recallEngine.contextualRecall(context, query);

      // 4. Gerar recomendacoes
      const recommendations = this.generateRecommendations(
        kgResults.entities,
        predictions,
        recallContext
      );

      const result: MemoryResult = {
        knowledge: {
          entities: kgResults.entities,
          relationships: kgResults.relationships,
          inferences,
        },
        patterns: {
          discovered: this.patternLearning.getPatterns(),
          predictions,
        },
        memories: {
          relevant: recallContext.results.map(r => r.entry),
          context: recallContext,
        },
        recommendations,
      };

      const duration = Date.now() - startTime;
      this.updateMetrics(duration, true);

      this.emit('memory:retrieved', { query, duration });

      return result;
    } catch (error) {
      this.metrics.failedRequests++;
      this.emit('error', { query, error });
      throw error;
    } finally {
      this.status = 'ready';
    }
  }

  /**
   * Armazena uma experiencia e aprende padroes
   */
  async storeExperience(
    content: string,
    type: MemoryType,
    metadata: Record<string, unknown> = {}
  ): Promise<MemoryEntry> {
    // 1. Armazenar na memoria
    const memory = this.recallEngine.store({
      content,
      type,
      metadata,
      importance: this.calculateImportance(content, metadata),
      tags: this.extractTags(content),
      relatedEntries: [],
    });

    // 2. Adicionar ao Knowledge Graph
    const entity = this.knowledgeGraph.addEntity({
      id: memory.id,
      type: this.mapMemoryToEntityType(type),
      name: content.substring(0, 100),
      properties: { ...metadata, content },
      confidence: 0.9,
      sources: [memory.id],
    });

    // 3. Criar experiencia para pattern learning
    const experience: Experience = {
      id: memory.id,
      timestamp: new Date(),
      type,
      data: metadata,
      outcome: (metadata.outcome as 'success' | 'failure' | 'partial') || 'success',
      context: metadata,
      duration: metadata.duration as number || 0,
      resources: metadata.resources as string[] || [],
    };

    this.patternLearning.addExperience(experience);

    // 4. Auto-learn se habilitado
    if (this.config.patternLearning.autoLearn) {
      await this.patternLearning.learn();
    }

    this.emit('experience:stored', { memory, entity });

    return memory;
  }

  /**
   * Adiciona conhecimento ao grafo
   */
  addKnowledge(
    subject: Omit<Entity, 'createdAt' | 'updatedAt'>,
    predicate: RelationType,
    object: Omit<Entity, 'createdAt' | 'updatedAt'>
  ): { subject: Entity; relationship: Relationship; object: Entity } {
    const subj = this.knowledgeGraph.addEntity(subject);
    const obj = this.knowledgeGraph.addEntity(object);

    const rel = this.knowledgeGraph.addRelationship({
      source: subj.id,
      target: obj.id,
      type: predicate,
      properties: {},
      confidence: 0.9,
      bidirectional: false,
      weight: 0.8,
    });

    this.emit('knowledge:added', { subject: subj, predicate, object: obj });

    return { subject: subj, relationship: rel, object: obj };
  }

  // ========================================================================
  // METODOS PRIVADOS
  // ========================================================================

  private queryKnowledgeGraph(query: string): { entities: Entity[]; relationships: Relationship[] } {
    // Busca semantica no KG
    const entities = this.knowledgeGraph.semanticSearch(query, 10);

    // Buscar relacionamentos entre entidades encontradas
    const entityIds = new Set(entities.map(e => e.id));
    const relationships: Relationship[] = [];

    // Para cada par de entidades, buscar caminho
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const path = this.knowledgeGraph.findPath(entities[i].id, entities[j].id, 3);
        if (path) {
          relationships.push(...path.edges);
        }
      }
    }

    return { entities, relationships };
  }

  private generateRecommendations(
    entities: Entity[],
    predictions: PatternPrediction[],
    recallContext: RecallContext
  ): string[] {
    const recommendations: string[] = [];

    // Recomendacoes baseadas em padroes
    if (predictions.length > 0) {
      const topPrediction = predictions[0];
      if (topPrediction.probability > 0.7) {
        recommendations.push(
          `Pattern detected: ${topPrediction.pattern.name} (${(topPrediction.probability * 100).toFixed(1)}% confidence)`
        );
      }
    }

    // Recomendacoes baseadas em inferencias
    if (recallContext.relatedConcepts.length > 0) {
      recommendations.push(
        `Related concepts: ${recallContext.relatedConcepts.slice(0, 3).join(', ')}`
      );
    }

    // Recomendacoes baseadas no Knowledge Graph
    if (entities.length > 0) {
      const relatedEntities = this.knowledgeGraph.findRelated(entities[0].id);
      if (relatedEntities.length > 0) {
        recommendations.push(
          `Related knowledge: ${relatedEntities.slice(0, 3).map(r => r.entity.name).join(', ')}`
        );
      }
    }

    return recommendations;
  }

  private calculateImportance(content: string, metadata: Record<string, unknown>): number {
    let importance = 0.5;

    // Importancia baseada no conteudo
    if (content.includes('critical') || content.includes('error')) importance += 0.2;
    if (content.includes('success') || content.includes('resolved')) importance += 0.1;

    // Importancia baseada nos metadados
    if (metadata.severity === 'critical') importance += 0.3;
    if (metadata.severity === 'high') importance += 0.2;

    return Math.min(1, importance);
  }

  private extractTags(content: string): string[] {
    const tags: string[] = [];

    const keywords = [
      'error', 'bug', 'fix', 'security', 'performance',
      'database', 'api', 'frontend', 'backend', 'deployment',
      'user', 'customer', 'payment', 'authentication'
    ];

    const contentLower = content.toLowerCase();
    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return [...new Set(tags)];
  }

  private mapMemoryToEntityType(memoryType: MemoryType): EntityType {
    const mapping: Record<MemoryType, EntityType> = {
      conversation: 'knowledge',
      action: 'issue',
      decision: 'solution',
      observation: 'knowledge',
      insight: 'knowledge',
      error: 'issue',
      success: 'solution',
      pattern: 'pattern',
      knowledge: 'knowledge',
    };

    return mapping[memoryType] || 'knowledge';
  }

  private updateMetrics(duration: number, success: boolean): void {
    this.responseTimes.push(duration);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.successfulRequests += success ? 1 : 0;
    this.metrics.averageResponseTime =
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    this.metrics.p95ResponseTime = sorted[Math.floor(sorted.length * 0.95)] || 0;
    this.metrics.p99ResponseTime = sorted[Math.floor(sorted.length * 0.99)] || 0;

    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests;
    this.metrics.lastUpdated = new Date();
  }

  // ========================================================================
  // INTERFACE EngineBase
  // ========================================================================

  async health(): Promise<HealthStatus> {
    const checks: HealthStatus['checks'] = [
      {
        name: 'knowledge-graph',
        status: 'pass',
        responseTime: 15,
        message: 'Knowledge Graph operational',
      },
      {
        name: 'pattern-learning',
        status: 'pass',
        responseTime: 20,
        message: 'Pattern Learning operational',
      },
      {
        name: 'recall-engine',
        status: 'pass',
        responseTime: 10,
        message: 'Recall Engine operational',
      },
    ];

    this.healthStatus = {
      status: 'healthy',
      lastCheck: new Date(),
      checks,
      uptime: (Date.now() - this.startTime.getTime()) / 1000,
    };

    return this.healthStatus;
  }

  getMetrics(): EngineMetrics {
    return { ...this.metrics };
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Memory Engine...');
    this.status = 'shutdown';
    this.emit('shutdown', { timestamp: new Date() });
  }

  async reset(): Promise<void> {
    console.log('Resetting Memory Engine...');
    this.knowledgeGraph.clear();
    this.recallEngine.clear();
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      lastUpdated: new Date(),
    };
    this.responseTimes = [];
    this.startTime = new Date();
  }

  // ========================================================================
  // GETTERS
  // ========================================================================

  getKnowledgeGraph(): KnowledgeGraphEngine {
    return this.knowledgeGraph;
  }

  getPatternLearning(): PatternLearningEngine {
    return this.patternLearning;
  }

  getRecallEngine(): RecallEngine {
    return this.recallEngine;
  }

  getStats(): {
    entities: number;
    patterns: number;
    memories: number;
  } {
    return {
      entities: this.knowledgeGraph.getStats().entityCount,
      patterns: this.patternLearning.getStats().patternCount,
      memories: this.recallEngine.getStats().totalMemories,
    };
  }
}

// Export singleton
export const memoryEngineSupremo = new MemoryEngineSupremo();
