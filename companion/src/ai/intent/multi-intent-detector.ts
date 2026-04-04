/**
 * MULTI-INTENT DETECTOR - Intent Engine v3.0 Supremo
 * Detecção de múltiplas intenções em uma única entrada
 */

import { UserInput, ConversationContext } from '../../shared/types/user-input';
import { Intent, PrimaryIntent, IntentCategory } from '../../shared/types/intent';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface MultiIntentConfig {
  enabled: boolean;
  maxIntents: number;
  minConfidence: number;
  dependencyDetection: boolean;
  temporalAnalysis: boolean;
}

// ============================================================================
// ESTRUTURAS DE MULTI-INTENT
// ============================================================================

export interface DetectedIntent {
  intent: PrimaryIntent;
  confidence: number;
  segment: TextSegment;
  priority: number;
  dependencies: string[]; // IDs de intents dependentes
}

export interface TextSegment {
  text: string;
  startPos: number;
  endPos: number;
  type: 'command' | 'condition' | 'conjunction' | 'context';
}

export interface IntentRelationship {
  source: string;
  target: string;
  type: 'sequential' | 'conditional' | 'parallel' | 'dependent';
  strength: number;
}

export interface MultiIntentResult {
  primaryIntent: DetectedIntent;
  secondaryIntents: DetectedIntent[];
  relationships: IntentRelationship[];
  executionOrder: string[]; // Ordem sugerida de execução
  canBatch: boolean;
  requiresConfirmation: boolean;
}

// ============================================================================
// MULTI-INTENT DETECTOR
// ============================================================================

export class MultiIntentDetector {
  private config: MultiIntentConfig;
  private segmenter: TextSegmenter;
  private relationshipAnalyzer: RelationshipAnalyzer;

  constructor(config: MultiIntentConfig) {
    this.config = config;
    this.segmenter = new TextSegmenter();
    this.relationshipAnalyzer = new RelationshipAnalyzer();
  }

  /**
   * Detecta múltiplas intenções em uma entrada de usuário
   */
  async detect(
    input: UserInput,
    context: ConversationContext
  ): Promise<MultiIntentResult> {
    // 1. Segmentar o texto em partes semanticamente distintas
    const segments = this.segmenter.segment(input.content);

    // 2. Classificar cada segmento
    const detectedIntents: DetectedIntent[] = [];

    for (const segment of segments) {
      if (segment.type === 'command') {
        const intent = await this.classifySegment(segment, input, context);
        if (intent && intent.confidence >= this.config.minConfidence) {
          detectedIntents.push(intent);
        }
      }
    }

    // 3. Se não detectou múltiplos intents, retornar resultado simples
    if (detectedIntents.length <= 1) {
      return {
        primaryIntent: detectedIntents[0] || this.createDefaultIntent(),
        secondaryIntents: [],
        relationships: [],
        executionOrder: detectedIntents.length === 1 ? [detectedIntents[0].intent.action] : [],
        canBatch: false,
        requiresConfirmation: false,
      };
    }

    // 4. Priorizar intents
    const prioritized = this.prioritizeIntents(detectedIntents);

    // 5. Analisar relacionamentos
    const relationships = this.relationshipAnalyzer.analyze(prioritized, segments);

    // 6. Resolver dependências
    const resolved = this.resolveDependencies(prioritized, relationships);

    // 7. Determinar ordem de execução
    const executionOrder = this.determineExecutionOrder(resolved, relationships);

    // 8. Verificar se pode executar em batch
    const canBatch = this.canBatchExecution(resolved, relationships);

    // 9. Verificar se requer confirmação
    const requiresConfirmation = this.requiresConfirmation(resolved);

    return {
      primaryIntent: resolved[0],
      secondaryIntents: resolved.slice(1),
      relationships,
      executionOrder,
      canBatch,
      requiresConfirmation,
    };
  }

  /**
   * Classifica um segmento de texto em um intent
   */
  private async classifySegment(
    segment: TextSegment,
    input: UserInput,
    context: ConversationContext
  ): Promise<DetectedIntent | null> {
    // Usar classificação por padrões para identificar o intent
    const classification = this.classifyByPatterns(segment.text);

    if (!classification) {
      return null;
    }

    // Calcular confiança baseada na clareza do segmento
    const confidence = this.calculateSegmentConfidence(segment, classification);

    return {
      intent: classification,
      confidence,
      segment,
      priority: this.calculatePriority(classification),
      dependencies: [],
    };
  }

  /**
   * Classifica por padrões linguísticos
   */
  private classifyByPatterns(text: string): PrimaryIntent | null {
    const lower = text.toLowerCase().trim();

    // Padrões de segurança
    if (this.matchesAny(lower, [
      'scan', 'security scan', 'vulnerability scan', 'check security',
      'scan for', 'security check', 'pentest', 'penetration test',
      'scanear', 'varredura', 'verificar segurança'
    ])) {
      return {
        category: 'security_scan',
        action: 'scan',
        target: this.extractTarget(lower),
      };
    }

    // Padrões de QA
    if (this.matchesAny(lower, [
      'test', 'run tests', 'qa', 'quality check', 'analyze quality',
      'check performance', 'accessibility test',
      'testar', 'qualidade', 'análise de qualidade'
    ])) {
      return {
        category: 'qa_analysis',
        action: 'analyze',
        target: this.extractTarget(lower),
      };
    }

    // Padrões de relatório
    if (this.matchesAny(lower, [
      'report', 'generate report', 'send report', 'email report',
      'create report', 'export results',
      'relatório', 'gerar relatório', 'enviar'
    ])) {
      return {
        category: 'action_execution',
        action: 'generate_report',
        target: this.extractTarget(lower),
      };
    }

    // Padrões de configuração
    if (this.matchesAny(lower, [
      'configure', 'set up', 'settings', 'change config',
      'update settings', 'adjust',
      'configurar', 'configuração', 'ajustar'
    ])) {
      return {
        category: 'configuration',
        action: 'configure',
      };
    }

    // Padrões de informação
    if (this.matchesAny(lower, [
      'what is', 'how to', 'tell me', 'explain', 'show me',
      'what are', 'describe',
      'o que é', 'como', 'explique', 'mostre'
    ])) {
      return {
        category: 'information_request',
        action: 'provide',
      };
    }

    // Padrões de comparação
    if (this.matchesAny(lower, [
      'compare', 'versus', 'vs', 'difference between',
      'compare with', 'benchmark against',
      'comparar', 'diferença entre'
    ])) {
      return {
        category: 'action_execution',
        action: 'compare',
      };
    }

    // Padrões de notificação
    if (this.matchesAny(lower, [
      'notify', 'alert', 'send notification', 'let me know',
      'inform me', 'when done',
      'notificar', 'alertar', 'avise-me'
    ])) {
      return {
        category: 'action_execution',
        action: 'notify',
      };
    }

    return null;
  }

  /**
   * Verifica se o texto corresponde a algum dos padrões
   */
  private matchesAny(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Extrai o alvo do comando
   */
  private extractTarget(text: string): string | undefined {
    // Extrair URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) return urlMatch[1];

    // Extrair domínio
    const domainMatch = text.match(/\b([a-z0-9.-]+\.(com|org|net|io|dev|app))\b/);
    if (domainMatch) return domainMatch[1];

    // Extrair nome entre aspas
    const quotedMatch = text.match(/["']([^"']+)["']/);
    if (quotedMatch) return quotedMatch[1];

    return undefined;
  }

  /**
   * Calcula a confiança da classificação de um segmento
   */
  private calculateSegmentConfidence(segment: TextSegment, intent: PrimaryIntent): number {
    let confidence = 0.7; // baseline

    // Aumentar confiança baseado na clareza do segmento
    if (segment.text.length > 10 && segment.text.length < 100) {
      confidence += 0.1;
    }

    // Presença de palavras-chave claras
    const clearKeywords = ['scan', 'test', 'report', 'configure', 'analyze'];
    if (clearKeywords.some(k => segment.text.toLowerCase().includes(k))) {
      confidence += 0.1;
    }

    // Ter um alvo específico aumenta confiança
    if (intent.target) {
      confidence += 0.1;
    }

    return Math.min(0.98, confidence);
  }

  /**
   * Calcula a prioridade de um intent
   */
  private calculatePriority(intent: PrimaryIntent): number {
    const priorityMap: Record<string, number> = {
      'security_scan': 10,
      'qa_analysis': 8,
      'action_execution': 7,
      'configuration': 6,
      'information_request': 5,
      'status_check': 9,
    };

    return priorityMap[intent.category] || 5;
  }

  /**
   * Prioriza intents baseado em múltiplos fatores
   */
  private prioritizeIntents(intents: DetectedIntent[]): DetectedIntent[] {
    return intents.sort((a, b) => {
      // Prioridade base
      const priorityDiff = b.priority - a.priority;
      if (priorityDiff !== 0) return priorityDiff;

      // Confiança
      const confidenceDiff = b.confidence - a.confidence;
      if (confidenceDiff !== 0) return confidenceDiff;

      // Posição no texto (primeiro vem primeiro)
      return a.segment.startPos - b.segment.startPos;
    });
  }

  /**
   * Resolve dependências entre intents
   */
  private resolveDependencies(
    intents: DetectedIntent[],
    relationships: IntentRelationship[]
  ): DetectedIntent[] {
    const resolved = [...intents];

    // Para cada intent, identificar suas dependências
    relationships.forEach(rel => {
      if (rel.type === 'dependent') {
        const targetIndex = resolved.findIndex(i => i.intent.action === rel.target);
        const sourceIndex = resolved.findIndex(i => i.intent.action === rel.source);

        if (targetIndex !== -1 && sourceIndex !== -1) {
          resolved[targetIndex].dependencies.push(rel.source);
        }
      }
    });

    return resolved;
  }

  /**
   * Determina a ordem de execução ótima
   */
  private determineExecutionOrder(
    intents: DetectedIntent[],
    relationships: IntentRelationship[]
  ): string[] {
    const order: string[] = [];
    const visited = new Set<string>();

    // Função recursiva para ordenação topológica
    const visit = (intent: DetectedIntent) => {
      if (visited.has(intent.intent.action)) return;

      // Visitar dependências primeiro
      intent.dependencies.forEach(depId => {
        const dep = intents.find(i => i.intent.action === depId);
        if (dep) visit(dep);
      });

      visited.add(intent.intent.action);
      order.push(intent.intent.action);
    };

    // Visitar todos os intents
    intents.forEach(intent => visit(intent));

    return order;
  }

  /**
   * Verifica se os intents podem ser executados em batch
   */
  private canBatchExecution(
    intents: DetectedIntent[],
    relationships: IntentRelationship[]
  ): boolean {
    // Não pode fazer batch se houver dependências complexas
    const hasComplexDependencies = relationships.some(
      r => r.type === 'conditional' || r.type === 'dependent'
    );

    if (hasComplexDependencies) return false;

    // Não pode fazer batch se os intents afetam o mesmo recurso
    const targets = new Set(intents.map(i => i.intent.target).filter(Boolean));
    if (targets.size < intents.length) return false;

    // Verificar se todos os intents são do mesmo tipo ou compatíveis
    const categories = new Set(intents.map(i => i.intent.category));
    if (categories.size > 2) return false;

    return true;
  }

  /**
   * Verifica se requer confirmação do usuário
   */
  private requiresConfirmation(intents: DetectedIntent[]): boolean {
    // Requer confirmação se houver muitos intents
    if (intents.length > 3) return true;

    // Requer confirmação se houver intents destrutivos
    const destructiveActions = ['delete', 'remove', 'purge', 'reset'];
    const hasDestructive = intents.some(i =>
      destructiveActions.includes(i.intent.action)
    );

    if (hasDestructive) return true;

    // Requer confirmação se o custo total for alto
    const highCostCategories = ['pentest', 'full_scan', 'load_test'];
    const highCostCount = intents.filter(i =>
      highCostCategories.includes(i.intent.category)
    ).length;

    if (highCostCount >= 2) return true;

    return false;
  }

  /**
   * Cria um intent padrão quando nenhum é detectado
   */
  private createDefaultIntent(): DetectedIntent {
    return {
      intent: {
        category: 'information_request',
        action: 'clarify',
      },
      confidence: 0.5,
      segment: {
        text: '',
        startPos: 0,
        endPos: 0,
        type: 'context',
      },
      priority: 1,
      dependencies: [],
    };
  }
}

// ============================================================================
// SEGMENTADOR DE TEXTO
// ============================================================================

class TextSegmenter {
  private conjunctions: string[] = [
    'and', 'e', 'y',
    'then', 'depois', 'luego',
    'also', 'também', 'tambien',
    'plus', 'mais',
  ];

  private conditionalWords: string[] = [
    'if', 'se', 'si',
    'when', 'quando', 'cuando',
    'after', 'depois que', 'después',
    'once', 'uma vez que', 'una vez',
  ];

  /**
   * Segmenta o texto em partes semanticamente distintas
   */
  segment(text: string): TextSegment[] {
    const segments: TextSegment[] = [];

    // Primeiro, dividir por pontuação forte
    const mainParts = this.splitByPunctuation(text);

    mainParts.forEach((part, index) => {
      const startPos = text.indexOf(part);
      const endPos = startPos + part.length;

      // Identificar tipo do segmento
      const type = this.identifySegmentType(part);

      // Se for uma conjunção complexa, subdividir
      if (type === 'conjunction' && part.length > 20) {
        const subSegments = this.splitByConjunctions(part, startPos);
        segments.push(...subSegments);
      } else {
        segments.push({
          text: part.trim(),
          startPos,
          endPos,
          type,
        });
      }
    });

    return segments;
  }

  /**
   * Divide o texto por pontuação forte
   */
  private splitByPunctuation(text: string): string[] {
    // Preservar pontuação dentro de URLs
    const urlPlaceholder = '___URL___';
    const urls: string[] = [];
    let processedText = text.replace(/(https?:\/\/[^\s]+)/g, (match) => {
      urls.push(match);
      return urlPlaceholder;
    });

    // Dividir por pontuação
    const parts = processedText
      .split(/[.!?](?:\s+|$)/)
      .filter(p => p.trim().length > 0);

    // Restaurar URLs
    return parts.map(part => {
      let result = part;
      urls.forEach((url, i) => {
        result = result.replace(urlPlaceholder, url);
      });
      return result;
    });
  }

  /**
   * Divide um segmento por conjunções
   */
  private splitByConjunctions(text: string, basePos: number): TextSegment[] {
    const segments: TextSegment[] = [];

    // Criar regex para conjunções
    const conjPattern = new RegExp(
      `\\b(${this.conjunctions.join('|')})\\b`,
      'gi'
    );

    let lastIndex = 0;
    let match;

    while ((match = conjPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const segmentText = text.substring(lastIndex, match.index).trim();
        if (segmentText.length > 5) {
          segments.push({
            text: segmentText,
            startPos: basePos + lastIndex,
            endPos: basePos + match.index,
            type: this.identifySegmentType(segmentText),
          });
        }
      }
      lastIndex = match.index + match[0].length;
    }

    // Adicionar segmento final
    if (lastIndex < text.length) {
      const segmentText = text.substring(lastIndex).trim();
      if (segmentText.length > 5) {
        segments.push({
          text: segmentText,
          startPos: basePos + lastIndex,
          endPos: basePos + text.length,
          type: this.identifySegmentType(segmentText),
        });
      }
    }

    // Se não conseguiu segmentar, retornar o texto original
    if (segments.length === 0) {
      segments.push({
        text: text.trim(),
        startPos: basePos,
        endPos: basePos + text.length,
        type: 'command',
      });
    }

    return segments;
  }

  /**
   * Identifica o tipo de um segmento
   */
  private identifySegmentType(text: string): TextSegment['type'] {
    const lower = text.toLowerCase();

    // Verificar se é condicional
    if (this.conditionalWords.some(w => lower.startsWith(w))) {
      return 'condition';
    }

    // Verificar se é conjunção
    if (this.conjunctions.some(w => lower.includes(w))) {
      return 'conjunction';
    }

    // Verificar se é comando
    const commandVerbs = [
      'scan', 'test', 'run', 'check', 'analyze', 'generate',
      'create', 'configure', 'set', 'update', 'send',
      'scaneie', 'teste', 'execute', 'verifique', 'analise',
      'genere', 'crie', 'configure', 'envie',
    ];

    if (commandVerbs.some(v => lower.includes(v))) {
      return 'command';
    }

    return 'context';
  }
}

// ============================================================================
// ANALISADOR DE RELACIONAMENTOS
// ============================================================================

class RelationshipAnalyzer {
  /**
   * Analisa relacionamentos entre intents
   */
  analyze(intents: DetectedIntent[], segments: TextSegment[]): IntentRelationship[] {
    const relationships: IntentRelationship[] = [];

    for (let i = 0; i < intents.length; i++) {
      for (let j = i + 1; j < intents.length; j++) {
        const source = intents[i];
        const target = intents[j];

        const relationship = this.identifyRelationship(source, target, segments);

        if (relationship) {
          relationships.push({
            source: source.intent.action,
            target: target.intent.action,
            type: relationship.type,
            strength: relationship.strength,
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Identifica o tipo de relacionamento entre dois intents
   */
  private identifyRelationship(
    source: DetectedIntent,
    target: DetectedIntent,
    segments: TextSegment[]
  ): { type: IntentRelationship['type']; strength: number } | null {
    // Verificar proximidade no texto
    const textDistance = target.segment.startPos - source.segment.endPos;

    // Sequencial: um vem logo após o outro
    if (textDistance < 50) {
      return { type: 'sequential', strength: 0.8 };
    }

    // Dependente: um usa o output do outro
    if (this.isDependent(source, target)) {
      return { type: 'dependent', strength: 0.9 };
    }

    // Condicional: um é condicionado ao outro
    if (this.isConditional(source, target)) {
      return { type: 'conditional', strength: 0.7 };
    }

    // Paralelo: podem executar simultaneamente
    if (this.isParallel(source, target)) {
      return { type: 'parallel', strength: 0.6 };
    }

    return null;
  }

  /**
   * Verifica se target depende de source
   */
  private isDependent(source: DetectedIntent, target: DetectedIntent): boolean {
    // Report depende de scan/test
    if (target.intent.action === 'generate_report' &&
        (source.intent.category === 'security_scan' ||
         source.intent.category === 'qa_analysis')) {
      return true;
    }

    // Notificação depende de ação
    if (target.intent.action === 'notify' &&
        source.intent.category !== 'information_request') {
      return true;
    }

    return false;
  }

  /**
   * Verifica se há relação condicional
   */
  private isConditional(source: DetectedIntent, target: DetectedIntent): boolean {
    return target.segment.type === 'condition';
  }

  /**
   * Verifica se os intents podem executar em paralelo
   */
  private isParallel(source: DetectedIntent, target: DetectedIntent): boolean {
    // Mesma categoria geralmente pode ser paralela
    if (source.intent.category === target.intent.category) {
      // Mas não se afetam o mesmo target
      if (source.intent.target && source.intent.target === target.intent.target) {
        return false;
      }
      return true;
    }

    return false;
  }
}
