/**
 * RECALL ENGINE - Memory Engine v3.0 Supremo
 * Recuperacao inteligente de memoria com busca semantica
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE MEMORIA
// ============================================================================

export interface MemoryEntry {
  id: string;
  content: string;
  type: MemoryType;
  metadata: MemoryMetadata;
  embeddings?: number[];
  importance: number;
  timestamp: Date;
  accessCount: number;
  lastAccessed: Date;
  tags: string[];
  relatedEntries: string[];
}

export type MemoryType =
  | 'conversation'
  | 'action'
  | 'decision'
  | 'observation'
  | 'insight'
  | 'error'
  | 'success'
  | 'pattern'
  | 'knowledge';

export interface MemoryMetadata {
  context?: Record<string, unknown>;
  userId?: string;
  projectId?: string;
  sessionId?: string;
  source?: string;
  confidence?: number;
}

export interface SearchQuery {
  query: string;
  types?: MemoryType[];
  tags?: string[];
  userId?: string;
  projectId?: string;
  timeRange?: { start: Date; end: Date };
  minImportance?: number;
  limit?: number;
}

export interface SearchResult {
  entry: MemoryEntry;
  relevanceScore: number;
  semanticScore: number;
  temporalScore: number;
  importanceScore: number;
  matchType: 'exact' | 'semantic' | 'related' | 'inferred';
}

export interface RecallContext {
  query: string;
  results: SearchResult[];
  suggestions: string[];
  relatedConcepts: string[];
  confidence: number;
}

// ============================================================================
// RECALL ENGINE
// ============================================================================

export class RecallEngine extends EventEmitter {
  private memories: Map<string, MemoryEntry> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();
  private typeIndex: Map<string, Set<string>> = new Map();

  private embeddingSize = 128;

  // Pesos para scoring
  private weights = {
    semantic: 0.4,
    temporal: 0.2,
    importance: 0.2,
    frequency: 0.2,
  };

  // ============================================================================
  // OPERACOES CRUD
  // ============================================================================

  /**
   * Armazena uma nova memoria
   */
  store(entry: Omit<MemoryEntry, 'id' | 'timestamp' | 'accessCount' | 'lastAccessed'>): MemoryEntry {
    const now = new Date();

    const fullEntry: MemoryEntry = {
      ...entry,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
    };

    // Gerar embeddings se nao existirem
    if (!fullEntry.embeddings) {
      fullEntry.embeddings = this.generateEmbeddings(fullEntry.content);
    }

    this.memories.set(fullEntry.id, fullEntry);

    // Indexar por tags
    fullEntry.tags.forEach(tag => {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(fullEntry.id);
    });

    // Indexar por tipo
    if (!this.typeIndex.has(fullEntry.type)) {
      this.typeIndex.set(fullEntry.type, new Set());
    }
    this.typeIndex.get(fullEntry.type)!.add(fullEntry.id);

    this.emit('memory:stored', fullEntry);

    return fullEntry;
  }

  /**
   * Recupera memoria por ID
   */
  retrieve(id: string): MemoryEntry | undefined {
    const entry = this.memories.get(id);

    if (entry) {
      this.updateAccessStats(entry);
    }

    return entry;
  }

  /**
   * Remove memoria
   */
  forget(id: string): boolean {
    const entry = this.memories.get(id);
    if (!entry) return false;

    // Remover dos indices
    entry.tags.forEach(tag => {
      this.tagIndex.get(tag)?.delete(id);
    });
    this.typeIndex.get(entry.type)?.delete(id);

    this.memories.delete(id);
    this.emit('memory:forgotten', entry);

    return true;
  }

  /**
   * Atualiza memoria existente
   */
  update(id: string, updates: Partial<Omit<MemoryEntry, 'id'>>): MemoryEntry | null {
    const entry = this.memories.get(id);
    if (!entry) return null;

    const updated: MemoryEntry = {
      ...entry,
      ...updates,
      embeddings: updates.content
        ? this.generateEmbeddings(updates.content)
        : entry.embeddings,
    };

    this.memories.set(id, updated);
    this.emit('memory:updated', updated);

    return updated;
  }

  // ============================================================================
  // BUSCA
  // ============================================================================

  /**
   * Busca semantica avancada
   */
  search(query: SearchQuery): SearchResult[] {
    const queryEmbedding = this.generateQueryEmbeddings(query.query);

    // Filtrar candidatos
    let candidates = this.filterCandidates(query);

    // Calcular scores
    const scored = candidates.map(entry => ({
      entry,
      semanticScore: this.calculateSemanticScore(entry, queryEmbedding),
      temporalScore: this.calculateTemporalScore(entry, query.timeRange),
      importanceScore: entry.importance,
      frequencyScore: Math.min(1, entry.accessCount / 10),
    }));

    // Calcular relevance score combinado
    const results: SearchResult[] = scored.map(s => ({
      entry: s.entry,
      relevanceScore:
        s.semanticScore * this.weights.semantic +
        s.temporalScore * this.weights.temporal +
        s.importanceScore * this.weights.importance +
        s.frequencyScore * this.weights.frequency,
      semanticScore: s.semanticScore,
      temporalScore: s.temporalScore,
      importanceScore: s.importanceScore,
      matchType: s.semanticScore > 0.8 ? 'exact' : s.semanticScore > 0.5 ? 'semantic' : 'related',
    }));

    // Ordenar por relevancia
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limitar resultados
    const limited = query.limit ? results.slice(0, query.limit) : results;

    // Atualizar estatisticas de acesso
    limited.forEach(r => this.updateAccessStats(r.entry));

    this.emit('search:completed', { query: query.query, results: limited.length });

    return limited;
  }

  /**
   * Busca por similaridade
   */
  findSimilar(content: string, limit: number = 5): SearchResult[] {
    const queryEmbedding = this.generateQueryEmbeddings(content);

    const results = Array.from(this.memories.values())
      .map(entry => ({
        entry,
        relevanceScore: this.cosineSimilarity(queryEmbedding, entry.embeddings || []),
        semanticScore: 0,
        temporalScore: 0,
        importanceScore: 0,
        matchType: 'semantic' as const,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    results.forEach(r => this.updateAccessStats(r.entry));

    return results;
  }

  /**
   * Busca contextual
   */
  contextualRecall(context: Record<string, unknown>, query: string): RecallContext {
    // Buscar memorias relevantes ao contexto
    const contextMemories = this.search({
      query: JSON.stringify(context),
      limit: 10,
    });

    // Buscar memorias relevantes a query
    const queryMemories = this.search({
      query,
      limit: 10,
    });

    // Combinar e remover duplicatas
    const combined = new Map<string, SearchResult>();

    [...contextMemories, ...queryMemories].forEach(result => {
      const existing = combined.get(result.entry.id);
      if (existing) {
        existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore);
      } else {
        combined.set(result.entry.id, result);
      }
    });

    const results = Array.from(combined.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    return {
      query,
      results,
      suggestions: this.generateSuggestions(results),
      relatedConcepts: this.extractRelatedConcepts(results),
      confidence: results.length > 0
        ? results.reduce((sum, r) => sum + r.relevanceScore, 0) / results.length
        : 0,
    };
  }

  /**
   * Recupera memoria por associacao
   */
  recallByAssociation(entryId: string, hops: number = 2): MemoryEntry[] {
    const visited = new Set<string>();
    const queue: Array<{ id: string; depth: number }> = [{ id: entryId, depth: 0 }];
    const results: MemoryEntry[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      if (visited.has(id) || depth > hops) continue;
      visited.add(id);

      const entry = this.memories.get(id);
      if (!entry) continue;

      if (depth > 0) {
        results.push(entry);
      }

      // Adicionar entradas relacionadas a fila
      entry.relatedEntries.forEach(relatedId => {
        if (!visited.has(relatedId)) {
          queue.push({ id: relatedId, depth: depth + 1 });
        }
      });

      // Adicionar entradas com tags em comum
      entry.tags.forEach(tag => {
        const taggedEntries = this.tagIndex.get(tag);
        if (taggedEntries) {
          taggedEntries.forEach(taggedId => {
            if (taggedId !== id && !visited.has(taggedId)) {
              queue.push({ id: taggedId, depth: depth + 1 });
            }
          });
        }
      });
    }

    return results;
  }

  // ============================================================================
  // COMPRESSAO E PRUNING
  // ============================================================================

  /**
   * Comprime memorias antigas ou de baixa importancia
   */
  compress(options: {
    maxAge?: number;
    minImportance?: number;
    minAccessCount?: number;
  } = {}): number {
    const {
      maxAge = 30 * 24 * 60 * 60 * 1000, // 30 dias
      minImportance = 0.3,
      minAccessCount = 1,
    } = options;

    const now = Date.now();
    let compressed = 0;

    for (const [id, entry] of this.memories) {
      const age = now - entry.timestamp.getTime();
      const isOld = age > maxAge;
      const isUnimportant = entry.importance < minImportance;
      const isUnused = entry.accessCount < minAccessCount;

      if (isOld && isUnimportant && isUnused) {
        // Comprimir: manter apenas sumario
        this.compressEntry(entry);
        compressed++;
      }
    }

    this.emit('memory:compressed', { count: compressed });

    return compressed;
  }

  /**
   * Remove memorias obsoletas
   */
  prune(maxSize?: number): number {
    if (!maxSize || this.memories.size <= maxSize) return 0;

    const entries = Array.from(this.memories.values());

    // Score para pruning: mais antigo + menos importante + menos acessado
    const scored = entries.map(entry => ({
      entry,
      score:
        entry.importance * 0.3 +
        (entry.accessCount / 100) * 0.3 +
        (entry.timestamp.getTime() / Date.now()) * 0.4,
    }));

    scored.sort((a, b) => a.score - b.score);

    const toRemove = scored.slice(0, this.memories.size - maxSize);

    toRemove.forEach(({ entry }) => {
      this.forget(entry.id);
    });

    return toRemove.length;
  }

  // ============================================================================
  // UTILITARIOS
  // ============================================================================

  private filterCandidates(query: SearchQuery): MemoryEntry[] {
    let candidates = Array.from(this.memories.values());

    // Filtrar por tipo
    if (query.types && query.types.length > 0) {
      candidates = candidates.filter(e => query.types!.includes(e.type));
    }

    // Filtrar por tags
    if (query.tags && query.tags.length > 0) {
      candidates = candidates.filter(e =>
        query.tags!.some(tag => e.tags.includes(tag))
      );
    }

    // Filtrar por userId
    if (query.userId) {
      candidates = candidates.filter(
        e => e.metadata.userId === query.userId
      );
    }

    // Filtrar por projectId
    if (query.projectId) {
      candidates = candidates.filter(
        e => e.metadata.projectId === query.projectId
      );
    }

    // Filtrar por timeRange
    if (query.timeRange) {
      candidates = candidates.filter(
        e =>
          e.timestamp >= query.timeRange!.start &&
          e.timestamp <= query.timeRange!.end
      );
    }

    // Filtrar por importancia
    if (query.minImportance !== undefined) {
      candidates = candidates.filter(
        e => e.importance >= query.minImportance!
      );
    }

    return candidates;
  }

  private generateEmbeddings(content: string): number[] {
    const embedding = new Array(this.embeddingSize).fill(0);
    const words = content.toLowerCase().split(/\s+/);

    words.forEach(word => {
      const hash = this.hashCode(word);
      embedding[Math.abs(hash) % this.embeddingSize] += 1;
    });

    // Normalizar
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / (magnitude || 1));
  }

  private generateQueryEmbeddings(query: string): number[] {
    return this.generateEmbeddings(query);
  }

  private calculateSemanticScore(entry: MemoryEntry, queryEmbedding: number[]): number {
    if (!entry.embeddings) return 0;
    return this.cosineSimilarity(queryEmbedding, entry.embeddings);
  }

  private calculateTemporalScore(
    entry: MemoryEntry,
    timeRange?: { start: Date; end: Date }
  ): number {
    if (!timeRange) return 0.5;

    const entryTime = entry.timestamp.getTime();
    const rangeStart = timeRange.start.getTime();
    const rangeEnd = timeRange.end.getTime();

    if (entryTime < rangeStart || entryTime > rangeEnd) return 0;

    // Score maior para entradas mais recentes no range
    const normalized = (entryTime - rangeStart) / (rangeEnd - rangeStart);
    return 0.5 + normalized * 0.5;
  }

  private updateAccessStats(entry: MemoryEntry): void {
    entry.accessCount++;
    entry.lastAccessed = new Date();
  }

  private compressEntry(entry: MemoryEntry): void {
    // Manter apenas sumario
    entry.content = this.summarize(entry.content);
    entry.embeddings = undefined; // Remover embeddings para economizar espaco
  }

  private summarize(content: string): string {
    if (content.length < 200) return content;

    // Extrair primeiras e ultimas sentencas
    const sentences = content.split(/[.!?]+/);
    if (sentences.length <= 3) return content;

    return `${sentences[0].trim()}. [...] ${sentences[sentences.length - 2].trim()}.`;
  }

  private generateSuggestions(results: SearchResult[]): string[] {
    const suggestions: string[] = [];

    // Sugerir tags relacionadas
    const tagFreq = new Map<string, number>();
    results.forEach(r => {
      r.entry.tags.forEach(tag => {
        tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    if (topTags.length > 0) {
      suggestions.push(`Related topics: ${topTags.join(', ')}`);
    }

    // Sugerir memorias relacionadas
    if (results.length > 0) {
      const related = results[0].entry.relatedEntries.slice(0, 3);
      if (related.length > 0) {
        suggestions.push(`See also: ${related.length} related entries`);
      }
    }

    return suggestions;
  }

  private extractRelatedConcepts(results: SearchResult[]): string[] {
    const concepts = new Set<string>();

    results.forEach(r => {
      r.entry.tags.forEach(tag => concepts.add(tag));
    });

    return Array.from(concepts).slice(0, 5);
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

  // ============================================================================
  // GETTERS
  // ============================================================================

  getStats(): {
    totalMemories: number;
    byType: Record<string, number>;
    byTag: Record<string, number>;
    avgImportance: number;
    totalAccesses: number;
  } {
    const byType: Record<string, number> = {};
    const byTag: Record<string, number> = {};

    this.memories.forEach(m => {
      byType[m.type] = (byType[m.type] || 0) + 1;
      m.tags.forEach(tag => {
        byTag[tag] = (byTag[tag] || 0) + 1;
      });
    });

    const avgImportance = this.memories.size > 0
      ? Array.from(this.memories.values()).reduce((sum, m) => sum + m.importance, 0) / this.memories.size
      : 0;

    const totalAccesses = Array.from(this.memories.values())
      .reduce((sum, m) => sum + m.accessCount, 0);

    return {
      totalMemories: this.memories.size,
      byType,
      byTag,
      avgImportance,
      totalAccesses,
    };
  }

  getMemoriesByType(type: MemoryType): MemoryEntry[] {
    return Array.from(this.memories.values()).filter(m => m.type === type);
  }

  getMemoriesByTag(tag: string): MemoryEntry[] {
    const ids = this.tagIndex.get(tag);
    if (!ids) return [];
    return Array.from(ids).map(id => this.memories.get(id)!).filter(Boolean);
  }

  clear(): void {
    this.memories.clear();
    this.tagIndex.clear();
    this.typeIndex.clear();
    this.emit('memory:cleared');
  }
}
