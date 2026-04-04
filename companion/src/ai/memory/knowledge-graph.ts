/**
 * KNOWLEDGE GRAPH ENGINE - Memory Engine v3.0 Supremo
 * Grafo de conhecimento semantico com inferencia
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE ENTIDADES E RELACIONAMENTOS
// ============================================================================

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  properties: Record<string, unknown>;
  embeddings?: number[];
  confidence: number;
  createdAt: Date;
  updatedAt: Date;
  sources: string[];
}

export type EntityType =
  | 'issue'
  | 'vulnerability'
  | 'fix'
  | 'pattern'
  | 'technology'
  | 'component'
  | 'user'
  | 'project'
  | 'scan'
  | 'report'
  | 'rule'
  | 'configuration'
  | 'deployment'
  | 'incident'
  | 'knowledge'
  | 'solution';

export interface Relationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationType;
  properties: Record<string, unknown>;
  confidence: number;
  bidirectional: boolean;
  weight: number; // 0-1
  createdAt: Date;
}

export type RelationType =
  | 'causes'
  | 'fixes'
  | 'precedes'
  | 'follows'
  | 'similar_to'
  | 'related_to'
  | 'depends_on'
  | 'part_of'
  | 'uses'
  | 'affects'
  | 'detected_by'
  | 'resolved_by'
  | 'implements'
  | 'requires'
  | 'suggests';

export interface KnowledgeTriple {
  subject: Entity;
  predicate: RelationType;
  object: Entity;
  confidence: number;
}

// ============================================================================
// ESTRUTURAS DE BUSCA E INFERENCIA
// ============================================================================

export interface GraphQuery {
  entityTypes?: EntityType[];
  relationTypes?: RelationType[];
  entityName?: string;
  entityProperties?: Record<string, unknown>;
  maxDepth?: number;
  minConfidence?: number;
  limit?: number;
}

export interface GraphPath {
  nodes: Entity[];
  edges: Relationship[];
  totalWeight: number;
  confidence: number;
}

export interface InferenceResult {
  inferredRelationships: Relationship[];
  inferredEntities: Entity[];
  reasoning: string[];
  confidence: number;
}

// ============================================================================
// KNOWLEDGE GRAPH ENGINE
// ============================================================================

export class KnowledgeGraphEngine extends EventEmitter {
  private entities: Map<string, Entity> = new Map();
  private relationships: Map<string, Relationship> = new Map();
  private adjacencyList: Map<string, Set<string>> = new Map(); // entityId -> relationshipIds

  private readonly embeddingSize = 128;

  // ============================================================================
  // OPERACOES CRUD
  // ============================================================================

  /**
   * Adiciona ou atualiza uma entidade
   */
  addEntity(entity: Omit<Entity, 'createdAt' | 'updatedAt'>): Entity {
    const now = new Date();
    const fullEntity: Entity = {
      ...entity,
      createdAt: this.entities.has(entity.id) ? this.entities.get(entity.id)!.createdAt : now,
      updatedAt: now,
    };

    // Gerar embeddings se nao existirem
    if (!fullEntity.embeddings) {
      fullEntity.embeddings = this.generateEmbeddings(fullEntity);
    }

    this.entities.set(entity.id, fullEntity);
    this.emit('entity:added', fullEntity);

    return fullEntity;
  }

  /**
   * Adiciona um relacionamento
   */
  addRelationship(
    relationship: Omit<Relationship, 'id' | 'createdAt'>
  ): Relationship {
    const id = `rel-${relationship.source}-${relationship.target}-${relationship.type}-${Date.now()}`;
    
    const fullRelationship: Relationship = {
      ...relationship,
      id,
      createdAt: new Date(),
    };

    this.relationships.set(id, fullRelationship);

    // Atualizar lista de adjacencia
    if (!this.adjacencyList.has(relationship.source)) {
      this.adjacencyList.set(relationship.source, new Set());
    }
    this.adjacencyList.get(relationship.source)!.add(id);

    if (relationship.bidirectional) {
      if (!this.adjacencyList.has(relationship.target)) {
        this.adjacencyList.set(relationship.target, new Set());
      }
      this.adjacencyList.get(relationship.target)!.add(id);
    }

    this.emit('relationship:added', fullRelationship);

    return fullRelationship;
  }

  /**
   * Obtem entidade por ID
   */
  getEntity(id: string): Entity | undefined {
    return this.entities.get(id);
  }

  /**
   * Busca entidades por tipo
   */
  getEntitiesByType(type: EntityType): Entity[] {
    return Array.from(this.entities.values()).filter(e => e.type === type);
  }

  /**
   * Busca entidades por propriedade
   */
  findEntitiesByProperty(
    property: string,
    value: unknown
  ): Entity[] {
    return Array.from(this.entities.values()).filter(
      e => e.properties[property] === value
    );
  }

  /**
   * Remove entidade e seus relacionamentos
   */
  removeEntity(id: string): boolean {
    const entity = this.entities.get(id);
    if (!entity) return false;

    // Remover relacionamentos
    const relatedRelationships = this.adjacencyList.get(id);
    if (relatedRelationships) {
      relatedRelationships.forEach(relId => {
        this.relationships.delete(relId);
      });
    }

    this.adjacencyList.delete(id);
    this.entities.delete(id);

    this.emit('entity:removed', entity);
    return true;
  }

  // ============================================================================
  // BUSCA E NAVEGACAO
  // ============================================================================

  /**
   * Busca no grafo
   */
  query(query: GraphQuery): { entities: Entity[]; relationships: Relationship[] } {
    let matchingEntities = Array.from(this.entities.values());

    // Filtrar por tipo
    if (query.entityTypes && query.entityTypes.length > 0) {
      matchingEntities = matchingEntities.filter(e =>
        query.entityTypes!.includes(e.type)
      );
    }

    // Filtrar por nome
    if (query.entityName) {
      const nameLower = query.entityName.toLowerCase();
      matchingEntities = matchingEntities.filter(e =>
        e.name.toLowerCase().includes(nameLower)
      );
    }

    // Filtrar por propriedades
    if (query.entityProperties) {
      matchingEntities = matchingEntities.filter(e =>
        Object.entries(query.entityProperties!).every(
          ([key, value]) => e.properties[key] === value
        )
      );
    }

    // Filtrar por confianca
    if (query.minConfidence !== undefined) {
      matchingEntities = matchingEntities.filter(
        e => e.confidence >= query.minConfidence!
      );
    }

    // Limitar resultados
    if (query.limit) {
      matchingEntities = matchingEntities.slice(0, query.limit);
    }

    // Buscar relacionamentos entre entidades encontradas
    const entityIds = new Set(matchingEntities.map(e => e.id));
    const matchingRelationships = Array.from(this.relationships.values()).filter(
      r =>
        entityIds.has(r.source) &&
        entityIds.has(r.target) &&
        (!query.relationTypes || query.relationTypes.includes(r.type)) &&
        (!query.minConfidence || r.confidence >= query.minConfidence)
    );

    return {
      entities: matchingEntities,
      relationships: matchingRelationships,
    };
  }

  /**
   * Busca por similaridade semantica
   */
  semanticSearch(query: string, limit: number = 5): Entity[] {
    const queryEmbedding = this.generateQueryEmbeddings(query);

    const scored = Array.from(this.entities.values()).map(entity => ({
      entity,
      similarity: entity.embeddings
        ? this.cosineSimilarity(queryEmbedding, entity.embeddings)
        : 0,
    }));

    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit).map(s => s.entity);
  }

  /**
   * Encontra caminho entre duas entidades
   */
  findPath(
    startId: string,
    endId: string,
    maxDepth: number = 5
  ): GraphPath | null {
    // BFS com tracking de caminho
    const queue: Array<{ nodeId: string; path: GraphPath }> = [
      {
        nodeId: startId,
        path: { nodes: [], edges: [], totalWeight: 0, confidence: 1 },
      },
    ];

    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === endId) {
        return path;
      }

      if (visited.has(nodeId) || path.nodes.length >= maxDepth) {
        continue;
      }

      visited.add(nodeId);

      const entity = this.entities.get(nodeId);
      if (!entity) continue;

      const newPath: GraphPath = {
        nodes: [...path.nodes, entity],
        edges: [...path.edges],
        totalWeight: path.totalWeight,
        confidence: path.confidence * entity.confidence,
      };

      // Explorar vizinhos
      const neighborRelationships = this.adjacencyList.get(nodeId);
      if (neighborRelationships) {
        for (const relId of neighborRelationships) {
          const rel = this.relationships.get(relId);
          if (!rel) continue;

          const nextNodeId = rel.source === nodeId ? rel.target : rel.source;

          if (!visited.has(nextNodeId)) {
            queue.push({
              nodeId: nextNodeId,
              path: {
                ...newPath,
                edges: [...newPath.edges, rel],
                totalWeight: newPath.totalWeight + rel.weight,
                confidence: newPath.confidence * rel.confidence,
              },
            });
          }
        }
      }
    }

    return null;
  }

  /**
   * Encontra entidades relacionadas
   */
  findRelated(
    entityId: string,
    relationTypes?: RelationType[],
    minConfidence?: number
  ): Array<{ entity: Entity; relationship: Relationship }> {
    const entity = this.entities.get(entityId);
    if (!entity) return [];

    const related: Array<{ entity: Entity; relationship: Relationship }> = [];
    const relationshipIds = this.adjacencyList.get(entityId);

    if (relationshipIds) {
      for (const relId of relationshipIds) {
        const rel = this.relationships.get(relId);
        if (!rel) continue;

        if (relationTypes && !relationTypes.includes(rel.type)) continue;
        if (minConfidence && rel.confidence < minConfidence) continue;

        const otherId = rel.source === entityId ? rel.target : rel.source;
        const otherEntity = this.entities.get(otherId);

        if (otherEntity) {
          related.push({ entity: otherEntity, relationship: rel });
        }
      }
    }

    return related.sort((a, b) => b.relationship.weight - a.relationship.weight);
  }

  // ============================================================================
  // INFERENCIA
  // ============================================================================

  /**
   * Realiza inferencias no grafo
   */
  infer(entityId: string): InferenceResult {
    const inferredRelationships: Relationship[] = [];
    const inferredEntities: Entity[] = [];
    const reasoning: string[] = [];

    const entity = this.entities.get(entityId);
    if (!entity) {
      return { inferredRelationships, inferredEntities, reasoning, confidence: 0 };
    }

    // Inferencia 1: Transividade (A -> B, B -> C => A -> C)
    const transitiveInferences = this.inferTransitivity(entity);
    inferredRelationships.push(...transitiveInferences.relationships);
    inferredEntities.push(...transitiveInferences.entities);
    reasoning.push(...transitiveInferences.reasoning);

    // Inferencia 2: Similaridade (A similar B, B affects C => A affects C)
    const similarityInferences = this.inferFromSimilarity(entity);
    inferredRelationships.push(...similarityInferences.relationships);
    inferredEntities.push(...similarityInferences.entities);
    reasoning.push(...similarityInferences.reasoning);

    // Inferencia 3: Causalidade reversa
    const causalInferences = this.inferReverseCausality(entity);
    inferredRelationships.push(...causalInferences.relationships);
    reasoning.push(...causalInferences.reasoning);

    const confidence = inferredRelationships.length > 0
      ? inferredRelationships.reduce((sum, r) => sum + r.confidence, 0) / inferredRelationships.length
      : 0;

    return {
      inferredRelationships,
      inferredEntities,
      reasoning,
      confidence,
    };
  }

  private inferTransitivity(entity: Entity): {
    relationships: Relationship[];
    entities: Entity[];
    reasoning: string[];
  } {
    const relationships: Relationship[] = [];
    const entities: Entity[] = [];
    const reasoning: string[] = [];

    // Para cada relacionamento A -> B
    const outgoing = this.findRelated(entity.id).filter(
      r => r.relationship.source === entity.id
    );

    for (const { entity: targetEntity, relationship: rel1 } of outgoing) {
      // Encontrar relacionamentos B -> C
      const targetOutgoing = this.findRelated(targetEntity.id).filter(
        r => r.relationship.source === targetEntity.id
      );

      for (const { entity: finalEntity, relationship: rel2 } of targetOutgoing) {
        // Inferir A -> C
        if (finalEntity.id !== entity.id) {
          const inferredRel = this.addRelationship({
            source: entity.id,
            target: finalEntity.id,
            type: this.inferRelationType(rel1.type, rel2.type),
            properties: {
              inferred: true,
              sourceRelationships: [rel1.id, rel2.id],
            },
            confidence: rel1.confidence * rel2.confidence * 0.8,
            bidirectional: false,
            weight: (rel1.weight + rel2.weight) / 2,
          });

          relationships.push(inferredRel);
          reasoning.push(
            `Transitive: ${entity.name} ${rel1.type} ${targetEntity.name} ${rel2.type} ${finalEntity.name}`
          );
        }
      }
    }

    return { relationships, entities, reasoning };
  }

  private inferFromSimilarity(entity: Entity): {
    relationships: Relationship[];
    entities: Entity[];
    reasoning: string[];
  } {
    const relationships: Relationship[] = [];
    const entities: Entity[] = [];
    const reasoning: string[] = [];

    // Encontrar entidades similares
    const similarEntities = this.findSimilarEntities(entity);

    for (const similar of similarEntities) {
      if (similar.entity.id === entity.id) continue;

      // Para cada relacionamento da entidade similar
      const similarRelations = this.findRelated(similar.entity.id);

      for (const { entity: target, relationship: rel } of similarRelations) {
        // Inferir que a entidade original tambem tem este relacionamento
        const exists = this.relationships.has(
          `rel-${entity.id}-${target.id}-${rel.type}-${Date.now()}`
        );

        if (!exists) {
          const inferredRel = this.addRelationship({
            source: entity.id,
            target: target.id,
            type: rel.type,
            properties: {
              inferred: true,
              fromSimilarEntity: similar.entity.id,
            },
            confidence: rel.confidence * similar.similarity * 0.7,
            bidirectional: rel.bidirectional,
            weight: rel.weight * similar.similarity,
          });

          relationships.push(inferredRel);
          reasoning.push(
            `Similarity: ${entity.name} is similar to ${similar.entity.name}, which ${rel.type} ${target.name}`
          );
        }
      }
    }

    return { relationships, entities, reasoning };
  }

  private inferReverseCausality(entity: Entity): {
    relationships: Relationship[];
    reasoning: string[];
  } {
    const relationships: Relationship[] = [];
    const reasoning: string[] = [];

    // Para relacionamentos causais, inferir reversos
    const causalRelations = ['causes', 'affects', 'precedes'];
    const reverseRelations: Record<string, string> = {
      causes: 'caused_by',
      affects: 'affected_by',
      precedes: 'follows',
    };

    const related = this.findRelated(entity.id).filter(r =>
      causalRelations.includes(r.relationship.type)
    );

    for (const { entity: target, relationship: rel } of related) {
      const reverseType = reverseRelations[rel.type];
      if (reverseType) {
        // Verificar se ja existe
        const exists = Array.from(this.relationships.values()).some(
          r => r.source === target.id && r.target === entity.id && r.type === reverseType
        );

        if (!exists) {
          const inferredRel = this.addRelationship({
            source: target.id,
            target: entity.id,
            type: reverseType as RelationType,
            properties: { inferred: true, reverseOf: rel.id },
            confidence: rel.confidence * 0.9,
            bidirectional: false,
            weight: rel.weight,
          });

          relationships.push(inferredRel);
          reasoning.push(`Reverse causality: if A ${rel.type} B, then B ${reverseType} A`);
        }
      }
    }

    return { relationships, reasoning };
  }

  private inferRelationType(type1: RelationType, type2: RelationType): RelationType {
    // Logica para inferir tipo de relacionamento composto
    if (type1 === 'precedes' && type2 === 'precedes') return 'precedes';
    if (type1 === 'causes' && type2 === 'causes') return 'causes';
    if (type1 === 'depends_on' && type2 === 'depends_on') return 'depends_on';
    return 'related_to';
  }

  // ============================================================================
  // UTILITARIOS
  // ============================================================================

  private generateEmbeddings(entity: Entity): number[] {
    // Gerar embeddings baseados nas propriedades da entidade
    const text = `${entity.name} ${entity.type} ${JSON.stringify(entity.properties)}`;
    return this.generateQueryEmbeddings(text);
  }

  private generateQueryEmbeddings(text: string): number[] {
    // Implementacao simplificada de embeddings
    const embedding = new Array(this.embeddingSize).fill(0);
    const words = text.toLowerCase().split(/\s+/);

    words.forEach((word, i) => {
      const hash = this.hashCode(word);
      embedding[Math.abs(hash) % this.embeddingSize] += 1;
      embedding[(Math.abs(hash) * 2) % this.embeddingSize] += 0.5;
    });

    // Normalizar
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / (magnitude || 1));
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
  }

  private findSimilarEntities(entity: Entity): Array<{ entity: Entity; similarity: number }> {
    if (!entity.embeddings) return [];

    const similar: Array<{ entity: Entity; similarity: number }> = [];

    for (const other of this.entities.values()) {
      if (other.id !== entity.id && other.embeddings) {
        const similarity = this.cosineSimilarity(entity.embeddings, other.embeddings);
        if (similarity > 0.6) {
          similar.push({ entity: other, similarity });
        }
      }
    }

    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  // ============================================================================
  // ESTATISTICAS E EXPORTACAO
  // ============================================================================

  getStats(): {
    entityCount: number;
    relationshipCount: number;
    entityTypes: Record<EntityType, number>;
    relationTypes: Record<RelationType, number>;
    density: number;
  } {
    const entityTypes = {} as Record<EntityType, number>;
    const relationTypes = {} as Record<RelationType, number>;

    this.entities.forEach(e => {
      entityTypes[e.type] = (entityTypes[e.type] || 0) + 1;
    });

    this.relationships.forEach(r => {
      relationTypes[r.type] = (relationTypes[r.type] || 0) + 1;
    });

    const n = this.entities.size;
    const maxEdges = n * (n - 1) / 2;
    const density = maxEdges > 0 ? this.relationships.size / maxEdges : 0;

    return {
      entityCount: this.entities.size,
      relationshipCount: this.relationships.size,
      entityTypes,
      relationTypes,
      density,
    };
  }

  exportToJSON(): string {
    return JSON.stringify(
      {
        entities: Array.from(this.entities.values()),
        relationships: Array.from(this.relationships.values()),
      },
      null,
      2
    );
  }

  clear(): void {
    this.entities.clear();
    this.relationships.clear();
    this.adjacencyList.clear();
    this.emit('graph:cleared');
  }
}
