/**
 * CONTEXT RETENTION ENGINE - Intent Engine v3.0 Supremo
 * Memória de conversação de longo prazo com compressão inteligente
 */

import { ConversationContext, ConversationTurn, UserProfile } from '../../shared/types/user-input';
import { Intent } from '../../shared/types/intent';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface ContextRetentionConfig {
  maxTurnsInMemory: number;
  compressionThreshold: number;
  semanticSimilarityThreshold: number;
  retentionPeriod: number; // dias
  enableSummarization: boolean;
  enableEntityTracking: boolean;
}

// ============================================================================
// ESTRUTURAS DE MEMÓRIA
// ============================================================================

export interface MemoryEntry {
  id: string;
  timestamp: Date;
  type: 'turn' | 'summary' | 'entity' | 'intent' | 'action';
  content: unknown;
  importance: number; // 0-1
  embeddings?: number[];
  compressed: boolean;
}

export interface CompressedMemory {
  originalTurns: string[]; // IDs das turns originais
  summary: string;
  keyEntities: string[];
  keyIntents: string[];
  timestamp: Date;
  compressionRatio: number;
}

export interface EntityState {
  entity: string;
  type: string;
  value: unknown;
  firstMentioned: Date;
  lastMentioned: Date;
  mentionCount: number;
  currentValue: unknown;
}

export interface ContextSummary {
  topic: string;
  turns: number;
  duration: number; // minutos
  keyPoints: string[];
  unresolvedItems: string[];
  userGoals: string[];
}

// ============================================================================
// CONTEXT RETENTION ENGINE
// ============================================================================

export class ContextRetentionEngine {
  private config: ContextRetentionConfig;
  private memories: Map<string, MemoryEntry> = new Map();
  private entityTracker: EntityTracker;
  private summarizer: ConversationSummarizer;
  private compressor: MemoryCompressor;
  private relevanceScorer: RelevanceScorer;

  constructor(config: ContextRetentionConfig) {
    this.config = config;
    this.entityTracker = new EntityTracker();
    this.summarizer = new ConversationSummarizer();
    this.compressor = new MemoryCompressor();
    this.relevanceScorer = new RelevanceScorer();
  }

  /**
   * Adiciona uma nova turn à memória
   */
  async addTurn(
    turn: ConversationTurn,
    intent?: Intent
  ): Promise<void> {
    // Calcular importância da turn
    const importance = this.calculateTurnImportance(turn, intent);

    const entry: MemoryEntry = {
      id: `turn-${turn.turnId}`,
      timestamp: turn.createdAt,
      type: 'turn',
      content: turn,
      importance,
      compressed: false,
    };

    this.memories.set(entry.id, entry);

    // Extrair e rastrear entidades
    if (this.config.enableEntityTracking) {
      await this.entityTracker.extractAndTrack(turn);
    }

    // Armazenar intent se disponível
    if (intent) {
      this.addIntent(intent, turn.turnId);
    }

    // Verificar necessidade de compressão
    await this.checkAndCompress();
  }

  /**
   * Recupera contexto relevante para uma query
   */
  async retrieveRelevantContext(
    query: string,
    currentContext: ConversationContext,
    maxTokens: number = 4000
  ): Promise<RetrievedContext> {
    // 1. Calcular relevância de todas as memórias
    const scoredMemories = await this.scoreRelevance(query);

    // 2. Separar memórias recentes e relevantes
    const recentCutoff = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos

    const recentMemories = scoredMemories.filter(
      m => m.entry.timestamp > recentCutoff
    );

    const relevantMemories = scoredMemories.filter(
      m => m.score > 0.6 && m.entry.timestamp <= recentCutoff
    );

    // 3. Ordenar por relevância
    relevantMemories.sort((a, b) => b.score - a.score);

    // 4. Construir contexto dentro do limite de tokens
    const selectedMemories: MemoryEntry[] = [];
    let tokenCount = 0;

    // Primeiro, adicionar memórias recentes
    for (const { entry } of recentMemories) {
      const tokens = this.estimateTokens(entry);
      if (tokenCount + tokens <= maxTokens * 0.6) { // 60% para recentes
        selectedMemories.push(entry);
        tokenCount += tokens;
      }
    }

    // Depois, adicionar memórias relevantes
    for (const { entry } of relevantMemories) {
      if (selectedMemories.find(m => m.id === entry.id)) continue;

      const tokens = this.estimateTokens(entry);
      if (tokenCount + tokens <= maxTokens) {
        selectedMemories.push(entry);
        tokenCount += tokens;
      } else {
        break;
      }
    }

    // 5. Ordenar por timestamp
    selectedMemories.sort((a, b) =>
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // 6. Extrair entidades relevantes
    const relevantEntities = this.entityTracker.getRelevantEntities(query);

    return {
      turns: selectedMemories
        .filter(m => m.type === 'turn')
        .map(m => m.content as ConversationTurn),
      summaries: selectedMemories
        .filter(m => m.type === 'summary')
        .map(m => m.content as CompressedMemory),
      entities: relevantEntities,
      tokenCount,
    };
  }

  /**
   * Obtém um resumo da conversa atual
   */
  async getConversationSummary(
    contextId: string,
    turnsBack: number = 10
  ): Promise<ContextSummary> {
    const recentTurns = this.getRecentTurns(turnsBack);

    if (recentTurns.length === 0) {
      return {
        topic: 'Nova conversa',
        turns: 0,
        duration: 0,
        keyPoints: [],
        unresolvedItems: [],
        userGoals: [],
      };
    }

    const startTime = recentTurns[0].createdAt;
    const endTime = recentTurns[recentTurns.length - 1].createdAt;
    const duration = (endTime.getTime() - startTime.getTime()) / 60000;

    const summary = await this.summarizer.summarize(recentTurns);

    return {
      topic: summary.topic,
      turns: recentTurns.length,
      duration,
      keyPoints: summary.keyPoints,
      unresolvedItems: summary.unresolvedItems,
      userGoals: summary.userGoals,
    };
  }

  /**
   * Busca memórias por similaridade semântica
   */
  async semanticSearch(
    query: string,
    limit: number = 5
  ): Promise<MemoryEntry[]> {
    // Calcular embeddings da query (simplificado)
    const queryEmbedding = await this.generateEmbeddings(query);

    // Calcular similaridade com todas as memórias
    const similarities: Array<{ entry: MemoryEntry; similarity: number }> = [];

    for (const entry of this.memories.values()) {
      if (!entry.compressed) {
        const entryEmbedding = entry.embeddings ||
          await this.generateEmbeddings(this.memoryToText(entry));

        const similarity = this.cosineSimilarity(queryEmbedding, entryEmbedding);

        similarities.push({ entry, similarity });
      }
    }

    // Ordenar por similaridade
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, limit).map(s => s.entry);
  }

  /**
   * Mantém apenas memórias relevantes (pruning)
   */
  async pruneOldMemories(): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - this.config.retentionPeriod);

    let removed = 0;

    for (const [id, entry] of this.memories) {
      // Nunca remover memórias de alta importância
      if (entry.importance > 0.8) continue;

      // Remover memórias antigas de baixa importância
      if (entry.timestamp < cutoff && entry.importance < 0.3) {
        this.memories.delete(id);
        removed++;
        continue;
      }

      // Comprimir memórias antigas de importância média
      if (entry.timestamp < cutoff && !entry.compressed) {
        await this.compressMemory(entry);
      }
    }

    return removed;
  }

  /**
   * Recupera estado atual de uma entidade
   */
  getEntityState(entityName: string): EntityState | undefined {
    return this.entityTracker.getState(entityName);
  }

  /**
   * Lista todas as entidades ativas
   */
  getActiveEntities(): EntityState[] {
    return this.entityTracker.getAllActive();
  }

  /**
   * Obtém estatísticas da memória
   */
  getStats(): MemoryStats {
    const entries = Array.from(this.memories.values());

    return {
      totalEntries: entries.length,
      compressedEntries: entries.filter(e => e.compressed).length,
      turnEntries: entries.filter(e => e.type === 'turn').length,
      summaryEntries: entries.filter(e => e.type === 'summary').length,
      entityCount: this.entityTracker.getCount(),
      avgImportance: entries.reduce((sum, e) => sum + e.importance, 0) / entries.length || 0,
      oldestEntry: entries.length > 0
        ? new Date(Math.min(...entries.map(e => e.timestamp.getTime())))
        : undefined,
      newestEntry: entries.length > 0
        ? new Date(Math.max(...entries.map(e => e.timestamp.getTime())))
        : undefined,
    };
  }

  // ============================================================================
  // MÉTODOS PRIVADOS
  // ============================================================================

  private addIntent(intent: Intent, turnId: string): void {
    const entry: MemoryEntry = {
      id: `intent-${intent.id}`,
      timestamp: new Date(),
      type: 'intent',
      content: { intent, turnId },
      importance: this.calculateIntentImportance(intent),
      compressed: false,
    };

    this.memories.set(entry.id, entry);
  }

  private calculateTurnImportance(turn: ConversationTurn, intent?: Intent): number {
    let importance = 0.5; // baseline

    // Ações têm mais importância
    if (turn.actions && turn.actions.length > 0) {
      importance += 0.2;
    }

    // Intents de ação têm mais importância
    if (intent) {
      const highImportanceCategories = ['security_scan', 'action_execution', 'configuration'];
      if (highImportanceCategories.includes(intent.primary.category)) {
        importance += 0.2;
      }

      // Intents ambíguos têm menos importância
      if (intent.ambiguity === 'high' || intent.ambiguity === 'critical') {
        importance -= 0.1;
      }
    }

    // Mensagens curtas têm menos importância
    if (turn.content.length < 20) {
      importance -= 0.1;
    }

    return Math.max(0, Math.min(1, importance));
  }

  private calculateIntentImportance(intent: Intent): number {
    let importance = 0.6;

    if (intent.confidence > 0.9) importance += 0.1;
    if (intent.urgency === 'critical' || intent.urgency === 'emergency') importance += 0.2;
    if (intent.emotionalState.frustration > 0.7) importance += 0.1;

    return Math.min(1, importance);
  }

  private async scoreRelevance(
    query: string
  ): Promise<Array<{ entry: MemoryEntry; score: number }>> {
    const scored: Array<{ entry: MemoryEntry; score: number }> = [];

    for (const entry of this.memories.values()) {
      const score = await this.relevanceScorer.score(entry, query);
      scored.push({ entry, score });
    }

    return scored;
  }

  private async checkAndCompress(): Promise<void> {
    const turns = Array.from(this.memories.values()).filter(
      m => m.type === 'turn' && !m.compressed
    );

    if (turns.length > this.config.compressionThreshold) {
      // Comprimir turns antigas
      const toCompress = turns
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(0, Math.floor(turns.length * 0.3)); // Comprimir 30% mais antigas

      for (const entry of toCompress) {
        await this.compressMemory(entry);
      }
    }
  }

  private async compressMemory(entry: MemoryEntry): Promise<void> {
    if (entry.type !== 'turn') return;

    const turn = entry.content as ConversationTurn;
    const compressed = await this.compressor.compress(turn);

    entry.type = 'summary';
    entry.content = compressed;
    entry.compressed = true;
  }

  private estimateTokens(entry: MemoryEntry): number {
    if (entry.compressed) {
      return 100; // Resumos têm ~100 tokens
    }

    if (entry.type === 'turn') {
      const turn = entry.content as ConversationTurn;
      return Math.ceil(turn.content.length / 4); // ~4 caracteres por token
    }

    return 50;
  }

  private getRecentTurns(count: number): ConversationTurn[] {
    return Array.from(this.memories.values())
      .filter(m => m.type === 'turn')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count)
      .map(m => m.content as ConversationTurn)
      .reverse();
  }

  private async generateEmbeddings(text: string): Promise<number[]> {
    // Placeholder: Na implementação real, usaría um modelo de embeddings
    // Como OpenAI Ada, sentence-transformers, etc.

    // Gerar embeddings simples baseados em hash
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(128).fill(0);

    words.forEach((word, i) => {
      const hash = this.simpleHash(word);
      embedding[hash % 128] += 1;
      embedding[(hash * 2) % 128] += 0.5;
    });

    // Normalizar
    const magnitude = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => v / (magnitude || 1));
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
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

  private memoryToText(entry: MemoryEntry): string {
    if (entry.type === 'turn') {
      const turn = entry.content as ConversationTurn;
      return `${turn.role}: ${turn.content}`;
    }

    if (entry.type === 'summary') {
      const summary = entry.content as CompressedMemory;
      return summary.summary;
    }

    return JSON.stringify(entry.content);
  }
}

// ============================================================================
// RASTREADOR DE ENTIDADES
// ============================================================================

class EntityTracker {
  private entities: Map<string, EntityState> = new Map();

  async extractAndTrack(turn: ConversationTurn): Promise<void> {
    // Extrair entidades do texto
    const extracted = this.extractEntities(turn.content);

    for (const entity of extracted) {
      this.trackEntity(entity, turn.createdAt);
    }
  }

  private extractEntities(text: string): Array<{ name: string; type: string; value: string }> {
    const entities: Array<{ name: string; type: string; value: string }> = [];

    // URLs
    const urlMatches = text.matchAll(/(https?:\/\/[^\s]+)/g);
    for (const match of urlMatches) {
      entities.push({
        name: 'url',
        type: 'url',
        value: match[1],
      });
    }

    // Emails
    const emailMatches = text.matchAll(/([\w.-]+@[\w.-]+\.\w+)/g);
    for (const match of emailMatches) {
      entities.push({
        name: 'email',
        type: 'email',
        value: match[1],
      });
    }

    // Domínios
    const domainMatches = text.matchAll(/\b([a-z0-9.-]+\.(com|org|net|io|dev))\b/gi);
    for (const match of domainMatches) {
      entities.push({
        name: 'domain',
        type: 'domain',
        value: match[1],
      });
    }

    // Projetos mencionados
    const projectMatches = text.matchAll(/\b(project|projeto)\s+["']?([^"']+)["']?/gi);
    for (const match of projectMatches) {
      entities.push({
        name: match[2],
        type: 'project',
        value: match[2],
      });
    }

    return entities;
  }

  private trackEntity(
    entity: { name: string; type: string; value: string },
    timestamp: Date
  ): void {
    const key = `${entity.type}:${entity.name}`;

    if (this.entities.has(key)) {
      const state = this.entities.get(key)!;
      state.lastMentioned = timestamp;
      state.mentionCount++;
      state.currentValue = entity.value;
    } else {
      this.entities.set(key, {
        entity: entity.name,
        type: entity.type,
        value: entity.value,
        firstMentioned: timestamp,
        lastMentioned: timestamp,
        mentionCount: 1,
        currentValue: entity.value,
      });
    }
  }

  getState(entityName: string): EntityState | undefined {
    for (const [key, state] of this.entities) {
      if (state.entity === entityName) {
        return state;
      }
    }
    return undefined;
  }

  getAllActive(): EntityState[] {
    const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutos

    return Array.from(this.entities.values())
      .filter(e => e.lastMentioned > cutoff)
      .sort((a, b) => b.mentionCount - a.mentionCount);
  }

  getRelevantEntities(query: string): EntityState[] {
    const queryLower = query.toLowerCase();

    return this.getAllActive().filter(entity =>
      queryLower.includes(entity.entity.toLowerCase()) ||
      queryLower.includes(entity.type.toLowerCase())
    );
  }

  getCount(): number {
    return this.entities.size;
  }
}

// ============================================================================
// SUMARIZADOR DE CONVERSA
// ============================================================================

class ConversationSummarizer {
  async summarize(turns: ConversationTurn[]): Promise<{
    topic: string;
    keyPoints: string[];
    unresolvedItems: string[];
    userGoals: string[];
  }> {
    if (turns.length === 0) {
      return {
        topic: 'Empty conversation',
        keyPoints: [],
        unresolvedItems: [],
        userGoals: [],
      };
    }

    // Identificar tópico principal
    const topic = this.identifyTopic(turns);

    // Extrair pontos-chave
    const keyPoints = this.extractKeyPoints(turns);

    // Identificar itens não resolvidos
    const unresolvedItems = this.identifyUnresolved(turns);

    // Identificar objetivos do usuário
    const userGoals = this.identifyGoals(turns);

    return {
      topic,
      keyPoints,
      unresolvedItems,
      userGoals,
    };
  }

  private identifyTopic(turns: ConversationTurn[]): string {
    // Analisar primeiras e últimas mensagens
    const firstUserTurn = turns.find(t => t.role === 'user');
    const lastUserTurn = [...turns].reverse().find(t => t.role === 'user');

    if (firstUserTurn) {
      const content = firstUserTurn.content.toLowerCase();

      if (content.includes('scan') || content.includes('security')) {
        return 'Security Analysis';
      }
      if (content.includes('test') || content.includes('qa')) {
        return 'Quality Assurance';
      }
      if (content.includes('report')) {
        return 'Reporting';
      }
      if (content.includes('configure') || content.includes('setup')) {
        return 'Configuration';
      }
    }

    return 'General Discussion';
  }

  private extractKeyPoints(turns: ConversationTurn[]): string[] {
    const points: string[] = [];

    turns.forEach(turn => {
      if (turn.role === 'assistant' && turn.actions && turn.actions.length > 0) {
        turn.actions.forEach(action => {
          points.push(`${action.type}: ${action.status}`);
        });
      }
    });

    return points.slice(-5); // Últimos 5 pontos
  }

  private identifyUnresolved(turns: ConversationTurn[]): string[] {
    const unresolved: string[] = [];

    // Procurar por perguntas sem resposta
    turns.forEach((turn, index) => {
      if (turn.role === 'user' && turn.content.includes('?')) {
        // Verificar se foi respondido nas próximas turns
        const answered = turns.slice(index + 1).some(t =>
          t.role === 'assistant' &&
          !t.content.includes('?')
        );

        if (!answered) {
          unresolved.push(turn.content.substring(0, 50) + '...');
        }
      }
    });

    return unresolved.slice(-3);
  }

  private identifyGoals(turns: ConversationTurn[]): string[] {
    const goals: string[] = [];

    turns.forEach(turn => {
      if (turn.role === 'user') {
        const content = turn.content.toLowerCase();

        if (content.includes('want') || content.includes('need') || content.includes('quero')) {
          goals.push(turn.content);
        }
      }
    });

    return goals.slice(-3);
  }
}

// ============================================================================
// COMPRESSOR DE MEMÓRIA
// ============================================================================

class MemoryCompressor {
  async compress(turn: ConversationTurn): Promise<CompressedMemory> {
    // Na implementação real, usaría um modelo de LLM para sumarização

    const summary = this.generateSimpleSummary(turn);

    return {
      originalTurns: [turn.turnId],
      summary,
      keyEntities: this.extractEntityNames(turn.content),
      keyIntents: [],
      timestamp: turn.createdAt,
      compressionRatio: 0.5,
    };
  }

  private generateSimpleSummary(turn: ConversationTurn): string {
    const content = turn.content;

    if (content.length <= 100) {
      return content;
    }

    // Extrair sentença mais importante
    const sentences = content.split(/[.!?]+/);
    return sentences[0].trim() + (sentences.length > 1 ? '...' : '');
  }

  private extractEntityNames(text: string): string[] {
    const entities: string[] = [];

    // URLs
    const urls = text.match(/(https?:\/\/[^\s]+)/g);
    if (urls) entities.push(...urls);

    // Domínios
    const domains = text.match(/\b([a-z0-9.-]+\.(com|org|net|io|dev))\b/gi);
    if (domains) entities.push(...domains);

    return [...new Set(entities)];
  }
}

// ============================================================================
// SCORER DE RELEVÂNCIA
// ============================================================================

class RelevanceScorer {
  async score(entry: MemoryEntry, query: string): Promise<number> {
    let score = 0;

    // Relevância temporal (mais recente = mais relevante)
    const ageHours = (Date.now() - entry.timestamp.getTime()) / (1000 * 60 * 60);
    const temporalScore = Math.exp(-ageHours / 24); // Decaimento exponencial diário
    score += temporalScore * 0.3;

    // Importância da memória
    score += entry.importance * 0.3;

    // Relevância semântica (simplificada)
    const semanticScore = this.calculateSemanticRelevance(entry, query);
    score += semanticScore * 0.4;

    return score;
  }

  private calculateSemanticRelevance(entry: MemoryEntry, query: string): number {
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    let entryText = '';

    if (entry.type === 'turn') {
      entryText = (entry.content as ConversationTurn).content;
    } else if (entry.type === 'summary') {
      entryText = (entry.content as CompressedMemory).summary;
    }

    const entryWords = new Set(entryText.toLowerCase().split(/\s+/));

    const intersection = new Set([...queryWords].filter(x => entryWords.has(x)));
    const union = new Set([...queryWords, ...entryWords]);

    return intersection.size / (union.size || 1);
  }
}

// ============================================================================
// INTERFACES DE SAÍDA
// ============================================================================

export interface RetrievedContext {
  turns: ConversationTurn[];
  summaries: CompressedMemory[];
  entities: EntityState[];
  tokenCount: number;
}

interface MemoryStats {
  totalEntries: number;
  compressedEntries: number;
  turnEntries: number;
  summaryEntries: number;
  entityCount: number;
  avgImportance: number;
  oldestEntry?: Date;
  newestEntry?: Date;
}
