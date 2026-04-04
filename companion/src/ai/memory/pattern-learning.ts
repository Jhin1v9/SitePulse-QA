/**
 * PATTERN LEARNING ENGINE - Memory Engine v3.0 Supremo
 * Aprendizado automatico de padroes a partir de experiencias
 */

import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE PADROES
// ============================================================================

export interface Pattern {
  id: string;
  name: string;
  description: string;
  type: PatternType;
  elements: PatternElement[];
  frequency: number;
  confidence: number;
  firstObserved: Date;
  lastObserved: Date;
  occurrences: PatternOccurrence[];
  successRate: number;
  context: PatternContext;
  metadata: Record<string, unknown>;
}

export type PatternType =
  | 'sequential'      // Sequencia de eventos
  | 'causal'          // Relacao causa-efeito
  | 'temporal'        // Padrao temporal
  | 'spatial'         // Padrao espacial
  | 'associative'     // Associacao entre entidades
  | 'anomaly'         // Padrao de anomalia
  | 'cyclical';       // Padrao ciclico

export interface PatternElement {
  type: 'event' | 'condition' | 'action' | 'entity';
  value: string;
  properties: Record<string, unknown>;
  optional: boolean;
  position?: number;
}

export interface PatternOccurrence {
  timestamp: Date;
  context: string;
  outcome: 'success' | 'failure' | 'partial' | 'unknown';
  details: Record<string, unknown>;
}

export interface PatternContext {
  applicableTo: string[];
  prerequisites: string[];
  consequences: string[];
  confidenceFactors: string[];
}

// ============================================================================
// EXPERIENCIA
// ============================================================================

export interface Experience {
  id: string;
  timestamp: Date;
  type: string;
  data: unknown;
  outcome: 'success' | 'failure' | 'partial';
  context: Record<string, unknown>;
  duration: number;
  resources: string[];
}

// ============================================================================
// RESULTADOS DE APRENDIZADO
// ============================================================================

export interface LearningResult {
  patterns: Pattern[];
  statistics: {
    totalExperiences: number;
    patternsFound: number;
    learningTime: number;
    confidence: number;
  };
}

export interface PatternPrediction {
  pattern: Pattern;
  probability: number;
  nextElements: PatternElement[];
  expectedOutcome: string;
  recommendedAction?: string;
}

// ============================================================================
// PATTERN LEARNING ENGINE
// ============================================================================

export class PatternLearningEngine extends EventEmitter {
  private experiences: Experience[] = [];
  private patterns: Map<string, Pattern> = new Map();
  private patternIndex: Map<string, Set<string>> = new Map(); // type -> patternIds

  private config = {
    minOccurrences: 3,
    minConfidence: 0.6,
    maxPatternAge: 365 * 24 * 60 * 60 * 1000, // 1 ano
    similarityThreshold: 0.8,
  };

  // ============================================================================
  // APRENDIZADO
  // ============================================================================

  /**
   * Adiciona uma experiencia para aprendizado
   */
  addExperience(experience: Experience): void {
    this.experiences.push(experience);
    this.emit('experience:added', experience);

    // Tentar extrair padroes da nova experiencia
    this.extractPatternsFromExperience(experience);
  }

  /**
   * Aprendizado em batch sobre todas as experiencias
   */
  async learn(): Promise<LearningResult> {
    const startTime = Date.now();

    console.log(`Starting pattern learning from ${this.experiences.length} experiences...`);
    this.emit('learning:started', { experienceCount: this.experiences.length });

    // 1. Agrupar experiencias por tipo
    const grouped = this.groupExperiencesByType();

    // 2. Extrair padroes de cada grupo
    for (const [type, experiences] of grouped) {
      await this.extractPatternsFromGroup(type, experiences);
    }

    // 3. Consolidar padroes similares
    this.consolidatePatterns();

    // 4. Remover padroes obsoletos
    this.removeObsoletePatterns();

    // 5. Calcular estatisticas
    const result: LearningResult = {
      patterns: Array.from(this.patterns.values()),
      statistics: {
        totalExperiences: this.experiences.length,
        patternsFound: this.patterns.size,
        learningTime: Date.now() - startTime,
        confidence: this.calculateOverallConfidence(),
      },
    };

    this.emit('learning:completed', result.statistics);

    return result;
  }

  /**
   * Extrai padroes de uma unica experiencia
   */
  private extractPatternsFromExperience(experience: Experience): void {
    // Procurar por padroes similares ja existentes
    for (const pattern of this.patterns.values()) {
      if (this.matchesPattern(experience, pattern)) {
        this.updatePatternWithOccurrence(pattern, experience);
      }
    }
  }

  /**
   * Extrai padroes de um grupo de experiencias
   */
  private async extractPatternsFromGroup(
    type: string,
    experiences: Experience[]
  ): Promise<void> {
    if (experiences.length < this.config.minOccurrences) return;

    // Padrao sequencial
    const sequentialPattern = this.extractSequentialPattern(experiences);
    if (sequentialPattern) {
      this.registerPattern(sequentialPattern);
    }

    // Padrao causal
    const causalPattern = this.extractCausalPattern(experiences);
    if (causalPattern) {
      this.registerPattern(causalPattern);
    }

    // Padrao temporal
    const temporalPattern = this.extractTemporalPattern(experiences);
    if (temporalPattern) {
      this.registerPattern(temporalPattern);
    }
  }

  /**
   * Extrai padrao sequencial
   */
  private extractSequentialPattern(experiences: Experience[]): Pattern | null {
    // Encontrar sequencias comuns de eventos
    const sequences = this.findCommonSequences(experiences);

    if (sequences.length === 0) return null;

    const mostCommon = sequences[0];

    return {
      id: `pattern-seq-${Date.now()}`,
      name: `Sequential pattern ${mostCommon.sequence.join(' -> ')}`,
      description: `Sequence of ${mostCommon.sequence.length} events`,
      type: 'sequential',
      elements: mostCommon.sequence.map((event, i) => ({
        type: 'event',
        value: event,
        properties: {},
        optional: false,
        position: i,
      })),
      frequency: mostCommon.count,
      confidence: mostCommon.count / experiences.length,
      firstObserved: experiences[0].timestamp,
      lastObserved: experiences[experiences.length - 1].timestamp,
      occurrences: experiences.map(e => ({
        timestamp: e.timestamp,
        context: JSON.stringify(e.context),
        outcome: e.outcome,
        details: e.data as Record<string, unknown>,
      })),
      successRate: this.calculateSuccessRate(experiences),
      context: {
        applicableTo: [experiences[0].type],
        prerequisites: [],
        consequences: [],
        confidenceFactors: ['frequency', 'consistency'],
      },
      metadata: { source: 'sequential_extraction' },
    };
  }

  /**
   * Extrai padrao causal
   */
  private extractCausalPattern(experiences: Experience[]): Pattern | null {
    // Analisar relacoes causa-efeito
    const causalRelations = this.findCausalRelations(experiences);

    if (causalRelations.length === 0) return null;

    const strongest = causalRelations[0];

    return {
      id: `pattern-causal-${Date.now()}`,
      name: `Causal: ${strongest.cause} -> ${strongest.effect}`,
      description: `${strongest.cause} causes ${strongest.effect} with ${(strongest.strength * 100).toFixed(1)}% confidence`,
      type: 'causal',
      elements: [
        { type: 'condition', value: strongest.cause, properties: {}, optional: false },
        { type: 'event', value: strongest.effect, properties: {}, optional: false },
      ],
      frequency: strongest.occurrences,
      confidence: strongest.strength,
      firstObserved: experiences[0].timestamp,
      lastObserved: experiences[experiences.length - 1].timestamp,
      occurrences: experiences
        .filter(e => this.containsCauseAndEffect(e, strongest.cause, strongest.effect))
        .map(e => ({
          timestamp: e.timestamp,
          context: JSON.stringify(e.context),
          outcome: e.outcome,
          details: e.data as Record<string, unknown>,
        })),
      successRate: this.calculateSuccessRate(experiences),
      context: {
        applicableTo: [experiences[0].type],
        prerequisites: [strongest.cause],
        consequences: [strongest.effect],
        confidenceFactors: ['correlation', 'temporal_order'],
      },
      metadata: { source: 'causal_extraction' },
    };
  }

  /**
   * Extrai padrao temporal
   */
  private extractTemporalPattern(experiences: Experience[]): Pattern | null {
    // Analisar padroes de tempo
    const timePattern = this.findTimePattern(experiences);

    if (!timePattern) return null;

    return {
      id: `pattern-temporal-${Date.now()}`,
      name: `Temporal pattern: ${timePattern.description}`,
      description: `Occurs ${timePattern.description}`,
      type: 'temporal',
      elements: [
        { type: 'event', value: experiences[0].type, properties: timePattern.properties, optional: false },
      ],
      frequency: experiences.length,
      confidence: timePattern.confidence,
      firstObserved: experiences[0].timestamp,
      lastObserved: experiences[experiences.length - 1].timestamp,
      occurrences: experiences.map(e => ({
        timestamp: e.timestamp,
        context: JSON.stringify(e.context),
        outcome: e.outcome,
        details: e.data as Record<string, unknown>,
      })),
      successRate: this.calculateSuccessRate(experiences),
      context: {
        applicableTo: [experiences[0].type],
        prerequisites: [],
        consequences: [],
        confidenceFactors: ['time_consistency'],
      },
      metadata: { source: 'temporal_extraction', pattern: timePattern },
    };
  }

  // ============================================================================
  // PREDICAO
  // ============================================================================

  /**
   * Prediz padroes baseado no contexto atual
   */
  predict(context: Record<string, unknown>): PatternPrediction[] {
    const predictions: PatternPrediction[] = [];

    for (const pattern of this.patterns.values()) {
      const relevance = this.calculateRelevance(pattern, context);

      if (relevance > 0.5) {
        predictions.push({
          pattern,
          probability: relevance * pattern.confidence,
          nextElements: this.predictNextElements(pattern, context),
          expectedOutcome: this.predictOutcome(pattern),
          recommendedAction: this.recommendAction(pattern),
        });
      }
    }

    return predictions.sort((a, b) => b.probability - a.probability);
  }

  /**
   * Prediz o proximo elemento em uma sequencia
   */
  predictNext(patternId: string, currentElements: PatternElement[]): PatternElement | null {
    const pattern = this.patterns.get(patternId);
    if (!pattern) return null;

    const currentLength = currentElements.length;

    if (currentLength < pattern.elements.length) {
      return pattern.elements[currentLength];
    }

    return null;
  }

  // ============================================================================
  // UTILITARIOS DE APRENDIZADO
  // ============================================================================

  private groupExperiencesByType(): Map<string, Experience[]> {
    const grouped = new Map<string, Experience[]>();

    this.experiences.forEach(exp => {
      if (!grouped.has(exp.type)) {
        grouped.set(exp.type, []);
      }
      grouped.get(exp.type)!.push(exp);
    });

    return grouped;
  }

  private findCommonSequences(experiences: Experience[]): Array<{ sequence: string[]; count: number }> {
    const sequences = new Map<string, number>();

    // Extrair sequencias de cada experiencia
    experiences.forEach(exp => {
      const data = exp.data as { events?: string[] };
      if (data?.events) {
        const key = data.events.join('|');
        sequences.set(key, (sequences.get(key) || 0) + 1);
      }
    });

    return Array.from(sequences.entries())
      .map(([key, count]) => ({ sequence: key.split('|'), count }))
      .sort((a, b) => b.count - a.count);
  }

  private findCausalRelations(experiences: Experience[]): Array<{
    cause: string;
    effect: string;
    strength: number;
    occurrences: number;
  }> {
    const relations = new Map<string, { count: number; success: number }>();

    experiences.forEach(exp => {
      const data = exp.data as { cause?: string; effect?: string };
      if (data?.cause && data?.effect) {
        const key = `${data.cause}->${data.effect}`;
        const existing = relations.get(key) || { count: 0, success: 0 };
        existing.count++;
        if (exp.outcome === 'success') existing.success++;
        relations.set(key, existing);
      }
    });

    return Array.from(relations.entries())
      .map(([key, data]) => {
        const [cause, effect] = key.split('->');
        return {
          cause,
          effect,
          strength: data.success / data.count,
          occurrences: data.count,
        };
      })
      .sort((a, b) => b.strength - a.strength);
  }

  private findTimePattern(experiences: Experience[]): {
    description: string;
    confidence: number;
    properties: Record<string, unknown>;
  } | null {
    if (experiences.length < 3) return null;

    const hours = experiences.map(e => e.timestamp.getHours());
    const hourCounts = new Map<number, number>();
    hours.forEach(h => hourCounts.set(h, (hourCounts.get(h) || 0) + 1));

    const mostCommon = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0];

    if (mostCommon && mostCommon[1] >= experiences.length * 0.5) {
      return {
        description: `at ${mostCommon[0]}:00`,
        confidence: mostCommon[1] / experiences.length,
        properties: { preferredHour: mostCommon[0] },
      };
    }

    return null;
  }

  private matchesPattern(experience: Experience, pattern: Pattern): boolean {
    // Verificar se a experiencia corresponde ao padrao
    const data = experience.data as { events?: string[] };
    if (!data?.events) return false;

    return pattern.elements.every((elem, i) =>
      data.events![i] === elem.value || elem.optional
    );
  }

  private updatePatternWithOccurrence(pattern: Pattern, experience: Experience): void {
    pattern.frequency++;
    pattern.lastObserved = experience.timestamp;
    pattern.occurrences.push({
      timestamp: experience.timestamp,
      context: JSON.stringify(experience.context),
      outcome: experience.outcome,
      details: experience.data as Record<string, unknown>,
    });

    // Recalcular taxa de sucesso
    pattern.successRate = this.calculateSuccessRateFromOccurrences(pattern.occurrences);
  }

  private registerPattern(pattern: Pattern): void {
    // Verificar se padrao similar ja existe
    const existing = this.findSimilarPattern(pattern);

    if (existing) {
      // Merge com padrao existente
      this.mergePatterns(existing, pattern);
    } else {
      this.patterns.set(pattern.id, pattern);

      if (!this.patternIndex.has(pattern.type)) {
        this.patternIndex.set(pattern.type, new Set());
      }
      this.patternIndex.get(pattern.type)!.add(pattern.id);

      this.emit('pattern:discovered', pattern);
    }
  }

  private findSimilarPattern(pattern: Pattern): Pattern | null {
    const candidates = this.patternIndex.get(pattern.type);
    if (!candidates) return null;

    for (const id of candidates) {
      const existing = this.patterns.get(id)!;
      if (this.calculatePatternSimilarity(existing, pattern) > this.config.similarityThreshold) {
        return existing;
      }
    }

    return null;
  }

  private calculatePatternSimilarity(p1: Pattern, p2: Pattern): number {
    if (p1.type !== p2.type) return 0;
    if (p1.elements.length !== p2.elements.length) return 0;

    let matches = 0;
    for (let i = 0; i < p1.elements.length; i++) {
      if (p1.elements[i].value === p2.elements[i].value) {
        matches++;
      }
    }

    return matches / p1.elements.length;
  }

  private mergePatterns(existing: Pattern, new_: Pattern): void {
    existing.frequency += new_.frequency;
    existing.occurrences.push(...new_.occurrences);
    existing.confidence = Math.max(existing.confidence, new_.confidence);
    existing.lastObserved = new Date(
      Math.max(existing.lastObserved.getTime(), new_.lastObserved.getTime())
    );
    existing.successRate = this.calculateSuccessRateFromOccurrences(existing.occurrences);
  }

  private consolidatePatterns(): void {
    // Remover padroes duplicados ou muito similares
    const toRemove: string[] = [];

    for (const [id1, p1] of this.patterns) {
      for (const [id2, p2] of this.patterns) {
        if (id1 >= id2) continue;

        const similarity = this.calculatePatternSimilarity(p1, p2);
        if (similarity > 0.9) {
          // Manter o padrao com maior confianca
          if (p1.confidence >= p2.confidence) {
            toRemove.push(id2);
          } else {
            toRemove.push(id1);
          }
        }
      }
    }

    toRemove.forEach(id => this.patterns.delete(id));
  }

  private removeObsoletePatterns(): void {
    const now = Date.now();

    for (const [id, pattern] of this.patterns) {
      const age = now - pattern.lastObserved.getTime();

      if (age > this.config.maxPatternAge && pattern.frequency < this.config.minOccurrences) {
        this.patterns.delete(id);
        this.emit('pattern:obsolete', pattern);
      }
    }
  }

  private containsCauseAndEffect(exp: Experience, cause: string, effect: string): boolean {
    const data = exp.data as { cause?: string; effect?: string };
    return data?.cause === cause && data?.effect === effect;
  }

  private calculateSuccessRate(experiences: Experience[]): number {
    const successes = experiences.filter(e => e.outcome === 'success').length;
    return experiences.length > 0 ? successes / experiences.length : 0;
  }

  private calculateSuccessRateFromOccurrences(occurrences: PatternOccurrence[]): number {
    const successes = occurrences.filter(o => o.outcome === 'success').length;
    return occurrences.length > 0 ? successes / occurrences.length : 0;
  }

  private calculateOverallConfidence(): number {
    if (this.patterns.size === 0) return 0;

    const totalConfidence = Array.from(this.patterns.values())
      .reduce((sum, p) => sum + p.confidence, 0);

    return totalConfidence / this.patterns.size;
  }

  private calculateRelevance(pattern: Pattern, context: Record<string, unknown>): number {
    // Verificar quantos elementos do contexto correspondem ao padrao
    let matches = 0;

    for (const elem of pattern.elements) {
      if (context[elem.value] !== undefined) {
        matches++;
      }
    }

    return matches / pattern.elements.length;
  }

  private predictNextElements(pattern: Pattern, context: Record<string, unknown>): PatternElement[] {
    // Determinar proximos elementos baseado no contexto
    const currentPosition = pattern.elements.findIndex(
      e => context[e.value] === undefined
    );

    if (currentPosition >= 0) {
      return pattern.elements.slice(currentPosition);
    }

    return [];
  }

  private predictOutcome(pattern: Pattern): string {
    const successRate = pattern.successRate;

    if (successRate > 0.8) return 'likely success';
    if (successRate > 0.5) return 'uncertain';
    return 'likely failure';
  }

  private recommendAction(pattern: Pattern): string | undefined {
    if (pattern.successRate < 0.3) {
      return 'Review pattern applicability before applying';
    }

    if (pattern.type === 'causal') {
      return `Ensure ${pattern.elements[0].value} before expecting ${pattern.elements[1].value}`;
    }

    return undefined;
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  getPatterns(type?: PatternType): Pattern[] {
    if (type) {
      const ids = this.patternIndex.get(type);
      if (!ids) return [];
      return Array.from(ids).map(id => this.patterns.get(id)!).filter(Boolean);
    }

    return Array.from(this.patterns.values());
  }

  getPattern(id: string): Pattern | undefined {
    return this.patterns.get(id);
  }

  getStats(): {
    patternCount: number;
    experienceCount: number;
    byType: Record<string, number>;
    avgSuccessRate: number;
  } {
    const byType: Record<string, number> = {};

    this.patterns.forEach(p => {
      byType[p.type] = (byType[p.type] || 0) + 1;
    });

    const avgSuccessRate = this.patterns.size > 0
      ? Array.from(this.patterns.values()).reduce((sum, p) => sum + p.successRate, 0) / this.patterns.size
      : 0;

    return {
      patternCount: this.patterns.size,
      experienceCount: this.experiences.length,
      byType,
      avgSuccessRate,
    };
  }
}
