/**
 * NLP CORE - Intent Engine v3.0 Supremo
 * Processamento de linguagem natural de nível supremo
 */

import {
  UserInput,
  ConversationContext,
  Entity,
  EntityType,
} from '../../shared/types/user-input';

import {
  Intent,
  PrimaryIntent,
  IntentCategory,
  IntentAnalysisResult,
  AlternativeIntent,
  EmotionalState,
  SentimentScore,
  Emotion,
  EntityReference,
  ComplexityLevel,
} from '../../shared/types/intent';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface NLPCoreConfig {
  models: {
    primary: 'multilingual-bert' | 'gpt4' | 't5' | 'ensemble';
    fallback: string[];
  };
  languages: {
    supported: string[];
    default: string;
    autoDetect: boolean;
  };
  entityRecognition: {
    enabled: boolean;
    types: EntityType[];
    customEntities: string[];
  };
  confidenceThresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// ============================================================================
// MODELOS DE NLP
// ============================================================================

interface ModelPrediction {
  model: string;
  intent: PrimaryIntent;
  confidence: number;
  entities: Entity[];
  latency: number;
}

interface EnsembleResult {
  intent: PrimaryIntent;
  confidence: number;
  modelContributions: Map<string, number>;
  consensus: number;
}

// ============================================================================
// NLP CORE SUPREMO
// ============================================================================

export class NLPCoreSupremo {
  private config: NLPCoreConfig;
  private modelWeights: Map<string, number> = new Map();
  private languageDetector: LanguageDetector;
  private entityExtractor: EntityExtractor;
  private intentClassifier: IntentClassifier;

  constructor(config: NLPCoreConfig) {
    this.config = config;
    this.initializeWeights();
    this.languageDetector = new LanguageDetector();
    this.entityExtractor = new EntityExtractor(config.entityRecognition);
    this.intentClassifier = new IntentClassifier();
  }

  private initializeWeights(): void {
    // Pesos iniciais baseados em performance histórica
    this.modelWeights.set('multilingual-bert', 0.35);
    this.modelWeights.set('gpt4', 0.40);
    this.modelWeights.set('t5', 0.25);
  }

  /**
   * Processa a entrada do usuário e retorna análise completa de intent
   */
  async process(input: UserInput, context: ConversationContext): Promise<IntentAnalysisResult> {
    const startTime = Date.now();

    // 1. Detectar idioma
    const language = await this.detectLanguage(input.content);

    // 2. Extrair entidades
    const entities = await this.entityExtractor.extract(input.content, language);

    // 3. Classificar intent com ensemble
    const ensembleResult = await this.classifyWithEnsemble(input, context, entities);

    // 4. Calcular ambiguidade
    const ambiguity = this.calculateAmbiguity(ensembleResult);

    // 5. Detectar emoções
    const emotionalState = await this.detectEmotions(input.content, language);

    // 6. Calcular urgência
    const urgency = this.calculateUrgency(input.content, emotionalState);

    // 7. Gerar alternativas
    const alternatives = await this.generateAlternatives(ensembleResult, input, context);

    // 8. Verificar necessidade de clarificação
    const clarificationNeeded = ambiguity !== 'none' && ensembleResult.confidence < 0.8;

    // 9. Calcular complexidade
    const complexity = this.estimateComplexity(ensembleResult.intent, entities);

    // 10. Estimar duração
    const estimatedDuration = this.estimateDuration(complexity);

    const intent: Intent = {
      id: `intent-${Date.now()}`,
      primary: ensembleResult.intent,
      confidence: ensembleResult.confidence,
      ambiguity,
      emotionalState,
      urgency,
      entities: this.convertToEntityReferences(entities),
      parameters: this.extractParameters(entities, ensembleResult.intent),
      expectedOutcome: this.predictOutcome(ensembleResult.intent),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '3.0',
      correlationId: input.id,
    };

    const processingTime = Date.now() - startTime;

    return {
      intent,
      alternatives,
      clarificationNeeded,
      suggestedQuestions: clarificationNeeded ? this.generateClarificationQuestions(intent) : undefined,
      estimatedComplexity: complexity,
      estimatedDuration,
      requiredPermissions: this.determineRequiredPermissions(ensembleResult.intent),
    };
  }

  /**
   * Classificação com ensemble de múltiplos modelos
   */
  private async classifyWithEnsemble(
    input: UserInput,
    context: ConversationContext,
    entities: Entity[]
  ): Promise<EnsembleResult> {
    const predictions: ModelPrediction[] = [];

    // Executar predições em paralelo
    const predictionPromises = [
      this.predictWithBERT(input, context, entities),
      this.predictWithGPT4(input, context, entities),
      this.predictWithT5(input, context, entities),
    ];

    const results = await Promise.allSettled(predictionPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        predictions.push(result.value);
      } else {
        console.warn(`Model ${index} failed:`, result.reason);
      }
    });

    if (predictions.length === 0) {
      throw new Error('All models failed to predict');
    }

    // Calcular ensemble weighted voting
    return this.computeEnsemble(predictions);
  }

  private async predictWithBERT(
    input: UserInput,
    context: ConversationContext,
    entities: Entity[]
  ): Promise<ModelPrediction> {
    const startTime = Date.now();

    // Simulação: Na implementação real, usaría @xenova/transformers
    const bertIntent = this.simulateBERTClassification(input.content);

    return {
      model: 'multilingual-bert',
      intent: bertIntent,
      confidence: 0.92,
      entities,
      latency: Date.now() - startTime,
    };
  }

  private async predictWithGPT4(
    input: UserInput,
    context: ConversationContext,
    entities: Entity[]
  ): Promise<ModelPrediction> {
    const startTime = Date.now();

    // Simulação: Na implementação real, usaría OpenAI API
    const gpt4Intent = this.simulateGPT4Analysis(input.content, context);

    return {
      model: 'gpt4',
      intent: gpt4Intent,
      confidence: 0.95,
      entities,
      latency: Date.now() - startTime,
    };
  }

  private async predictWithT5(
    input: UserInput,
    context: ConversationContext,
    entities: Entity[]
  ): Promise<ModelPrediction> {
    const startTime = Date.now();

    // Simulação: Na implementação real, usaría T5 para classification
    const t5Intent = this.simulateT5Classification(input.content);

    return {
      model: 't5',
      intent: t5Intent,
      confidence: 0.88,
      entities,
      latency: Date.now() - startTime,
    };
  }

  private computeEnsemble(predictions: ModelPrediction[]): EnsembleResult {
    // Agrupar predições por categoria de intent
    const intentGroups = new Map<string, ModelPrediction[]>();

    predictions.forEach(pred => {
      const key = `${pred.intent.category}:${pred.intent.action}`;
      if (!intentGroups.has(key)) {
        intentGroups.set(key, []);
      }
      intentGroups.get(key)!.push(pred);
    });

    // Calcular score ponderado para cada grupo
    let bestIntent: PrimaryIntent | null = null;
    let bestScore = 0;
    const modelContributions = new Map<string, number>();

    intentGroups.forEach((group, key) => {
      let weightedScore = 0;

      group.forEach(pred => {
        const weight = this.modelWeights.get(pred.model) || 0.33;
        weightedScore += pred.confidence * weight;
        modelContributions.set(pred.model, pred.confidence * weight);
      });

      if (weightedScore > bestScore) {
        bestScore = weightedScore;
        bestIntent = group[0].intent;
      }
    });

    // Calcular consenso (quantos modelos concordam)
    const consensus = Math.max(...Array.from(intentGroups.values()).map(g => g.length)) / predictions.length;

    return {
      intent: bestIntent!,
      confidence: Math.min(bestScore, 0.99),
      modelContributions,
      consensus,
    };
  }

  // ============================================================================
  // DETECÇÃO DE IDIOMA
  // ============================================================================

  private async detectLanguage(content: string): Promise<string> {
    return this.languageDetector.detect(content);
  }

  // ============================================================================
  // ANÁLISE EMOCIONAL
  // ============================================================================

  private async detectEmotions(content: string, language: string): Promise<EmotionalState> {
    const sentiment = this.analyzeSentiment(content, language);
    const emotions = this.detectEmotionTypes(content, language);
    const frustration = this.calculateFrustration(content, emotions);
    const confidence = this.estimateUserConfidence(content);
    const urgencyIndicators = this.extractUrgencyIndicators(content);

    return {
      sentiment,
      emotions,
      frustration,
      confidence,
      urgencyIndicators,
    };
  }

  private analyzeSentiment(content: string, language: string): SentimentScore {
    // Análise de sentimento usando léxico multilíngue
    const positiveWords = this.getPositiveWords(language);
    const negativeWords = this.getNegativeWords(language);
    const intensifiers = this.getIntensifiers(language);

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const words = content.toLowerCase().split(/\s+/);
    let intensifier = 1;

    words.forEach((word, index) => {
      if (intensifiers.includes(word)) {
        intensifier = 1.5;
        return;
      }

      if (positiveWords.includes(word)) {
        positive += intensifier;
        intensifier = 1;
      } else if (negativeWords.includes(word)) {
        negative += intensifier;
        intensifier = 1;
      } else {
        neutral++;
      }
    });

    const total = positive + negative + neutral || 1;
    const overall = (positive - negative) / (positive + negative || 1);

    return {
      overall: Math.max(-1, Math.min(1, overall)),
      positive: positive / total,
      negative: negative / total,
      neutral: neutral / total,
    };
  }

  private detectEmotionTypes(content: string, language: string): Emotion[] {
    const emotions: Emotion[] = [];
    const emotionPatterns = this.getEmotionPatterns(language);

    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(content.toLowerCase())) {
          emotions.push(emotion as Emotion);
          break;
        }
      }
    }

    return [...new Set(emotions)];
  }

  private calculateFrustration(content: string, emotions: Emotion[]): number {
    let frustration = 0;

    // Palavras indicadoras de frustração
    const frustrationIndicators = [
      'again', 'still', 'never', 'always', 'broken', 'doesn\'t work',
      'not working', 'failed', 'error', 'bug', 'issue', 'problem',
      'frustrating', 'annoying', 'terrible', 'awful', 'worst'
    ];

    const contentLower = content.toLowerCase();
    frustrationIndicators.forEach(indicator => {
      if (contentLower.includes(indicator)) {
        frustration += 0.2;
      }
    });

    // Pontuação excessiva indica frustração
    const excessivePunctuation = (content.match(/[!]{2,}/g) || []).length;
    frustration += excessivePunctuation * 0.1;

    // Caps lock indica frustração
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) {
      frustration += 0.15;
    }

    // Emoções detectadas
    if (emotions.includes('frustration')) frustration += 0.3;
    if (emotions.includes('anger')) frustration += 0.4;

    return Math.min(1, frustration);
  }

  private estimateUserConfidence(content: string): number {
    let confidence = 0.7; // baseline

    // Perguntas indicam incerteza
    const questionCount = (content.match(/\?/g) || []).length;
    confidence -= questionCount * 0.1;

    // Hesitações verbais
    const hesitationWords = ['maybe', 'perhaps', 'i think', 'not sure', 'confused'];
    hesitationWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        confidence -= 0.1;
      }
    });

    // Comandos diretos indicam confiança
    const commandWords = ['scan', 'run', 'check', 'analyze', 'fix', 'do'];
    commandWords.forEach(word => {
      if (content.toLowerCase().startsWith(word)) {
        confidence += 0.1;
      }
    });

    return Math.max(0, Math.min(1, confidence));
  }

  private extractUrgencyIndicators(content: string): string[] {
    const indicators: string[] = [];
    const urgencyPatterns = [
      { pattern: /\b(urgent|urgente|critical|crítico|asap|immediately|agora|hoje)\b/gi, indicator: 'time_constraint' },
      { pattern: /\b(down|offline|broken|not working|quebrou|parou|caiu)\b/gi, indicator: 'system_failure' },
      { pattern: /\b(production|produção|live|client|customer|cliente)\b/gi, indicator: 'business_impact' },
      { pattern: /\b(deadline|prazo|due|vence|expira)\b/gi, indicator: 'deadline' },
    ];

    urgencyPatterns.forEach(({ pattern, indicator }) => {
      if (pattern.test(content)) {
        indicators.push(indicator);
      }
    });

    return [...new Set(indicators)];
  }

  // ============================================================================
  // CÁLCULO DE URGÊNCIA
  // ============================================================================

  private calculateUrgency(content: string, emotionalState: EmotionalState): 'low' | 'normal' | 'high' | 'critical' | 'emergency' {
    let score = 0;

    // Indicadores de urgência no texto
    const urgencyIndicators = this.extractUrgencyIndicators(content);
    score += urgencyIndicators.length * 2;

    // Estado emocional
    if (emotionalState.frustration > 0.7) score += 3;
    if (emotionalState.emotions.includes('urgency')) score += 2;

    // Palavras críticas
    const criticalWords = ['emergency', 'crisis', 'breach', 'attack', 'hacked'];
    criticalWords.forEach(word => {
      if (content.toLowerCase().includes(word)) score += 4;
    });

    if (score >= 8) return 'emergency';
    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 1) return 'normal';
    return 'low';
  }

  // ============================================================================
  // CÁLCULO DE AMBIGUIDADE
  // ============================================================================

  private calculateAmbiguity(ensembleResult: EnsembleResult): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    const { confidence, consensus } = ensembleResult;

    if (confidence > 0.95 && consensus > 0.8) return 'none';
    if (confidence > 0.85 && consensus > 0.6) return 'low';
    if (confidence > 0.70 && consensus > 0.4) return 'medium';
    if (confidence > 0.50) return 'high';
    return 'critical';
  }

  // ============================================================================
  // GERAÇÃO DE ALTERNATIVAS
  // ============================================================================

  private async generateAlternatives(
    ensembleResult: EnsembleResult,
    input: UserInput,
    context: ConversationContext
  ): Promise<AlternativeIntent[]> {
    const alternatives: AlternativeIntent[] = [];

    // Gerar top-3 alternativas baseadas em similaridade semântica
    const possibleIntents = this.getAllPossibleIntents();

    for (const intent of possibleIntents) {
      if (intent.category === ensembleResult.intent.category &&
          intent.action === ensembleResult.intent.action) {
        continue;
      }

      const similarity = this.calculateSemanticSimilarity(
        input.content,
        intent,
        context
      );

      if (similarity > 0.3) {
        alternatives.push({
          intent,
          confidence: similarity,
          reason: this.generateAlternativeReason(intent, similarity),
        });
      }
    }

    // Ordenar por confiança e retornar top 3
    return alternatives
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  private convertToEntityReferences(entities: Entity[]): EntityReference[] {
    return entities.map(e => ({
      name: e.type,
      type: e.type,
      value: e.value,
      confidence: e.confidence,
      required: this.isRequiredEntity(e.type),
      resolved: true,
    }));
  }

  private isRequiredEntity(type: string): boolean {
    const requiredTypes = ['url', 'target', 'project'];
    return requiredTypes.includes(type);
  }

  private extractParameters(entities: Entity[], intent: PrimaryIntent): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    entities.forEach(entity => {
      params[entity.type] = entity.value;
    });

    // Adicionar parâmetros específicos do intent
    if (intent.scope) {
      params.scope = intent.scope;
    }

    return params;
  }

  private predictOutcome(intent: PrimaryIntent): string {
    const outcomes: Record<string, string> = {
      'security_scan': 'vulnerability_report',
      'qa_analysis': 'quality_report',
      'information_request': 'information_response',
      'configuration': 'configuration_update',
      'action_execution': 'action_completion',
    };

    return outcomes[intent.category] || 'general_response';
  }

  private estimateComplexity(intent: PrimaryIntent, entities: Entity[]): ComplexityLevel {
    let score = 0;

    // Baseado na categoria
    const complexityMap: Record<string, number> = {
      'information_request': 1,
      'status_check': 1,
      'configuration': 2,
      'security_scan': 3,
      'qa_analysis': 3,
      'pentest': 5,
      'automation_setup': 4,
    };

    score += complexityMap[intent.category] || 3;

    // Baseado no número de entidades
    score += Math.floor(entities.length / 3);

    // Baseado no escopo
    if (intent.scope === 'full') score += 2;
    if (intent.scope === 'domain') score += 1;

    if (score <= 1) return 'trivial';
    if (score <= 2) return 'simple';
    if (score <= 4) return 'moderate';
    if (score <= 6) return 'complex';
    return 'very_complex';
  }

  private estimateDuration(complexity: ComplexityLevel): number {
    const durations: Record<ComplexityLevel, number> = {
      'trivial': 1,
      'simple': 5,
      'moderate': 15,
      'complex': 60,
      'very_complex': 300,
    };

    return durations[complexity];
  }

  private determineRequiredPermissions(intent: PrimaryIntent): string[] {
    const permissions: Record<string, string[]> = {
      'security_scan': ['scan:read', 'vulnerability:read'],
      'qa_analysis': ['qa:read', 'test:execute'],
      'configuration': ['config:write', 'system:configure'],
      'action_execution': ['action:execute'],
      'pentest': ['pentest:execute', 'security:admin'],
    };

    return permissions[intent.category] || ['basic:read'];
  }

  private generateClarificationQuestions(intent: Intent): string[] {
    const questions: string[] = [];

    if (!intent.parameters.target && !intent.parameters.url) {
      questions.push('Qual é o alvo que você gostaria de analisar?');
    }

    if (intent.ambiguity === 'high' || intent.ambiguity === 'critical') {
      questions.push(`Você quer ${intent.primary.action} ou prefere outra ação?`);
    }

    if (intent.primary.scope === undefined) {
      questions.push('Qual o escopo da análise (página única, domínio completo, etc.)?');
    }

    return questions;
  }

  private calculateSemanticSimilarity(content: string, intent: PrimaryIntent, context: ConversationContext): number {
    // Implementação simplificada - na versão real usaría embeddings
    const keywords: Record<string, string[]> = {
      'security_scan': ['scan', 'security', 'vulnerability', 'check', 'analyze', 'test'],
      'qa_analysis': ['qa', 'quality', 'test', 'check', 'analyze'],
      'information_request': ['what', 'how', 'why', 'when', 'where', 'info', 'tell'],
    };

    const intentKeywords = keywords[intent.category] || [];
    const contentWords = content.toLowerCase().split(/\s+/);

    let matches = 0;
    intentKeywords.forEach(keyword => {
      if (contentWords.some(word => word.includes(keyword))) {
        matches++;
      }
    });

    return matches / intentKeywords.length;
  }

  private getAllPossibleIntents(): PrimaryIntent[] {
    const categories: IntentCategory[] = [
      'security_scan', 'qa_analysis', 'information_request',
      'configuration', 'action_execution', 'status_check'
    ];

    return categories.map(cat => ({
      category: cat,
      action: this.getDefaultAction(cat),
    }));
  }

  private getDefaultAction(category: IntentCategory): string {
    const actions: Record<string, string> = {
      'security_scan': 'scan',
      'qa_analysis': 'analyze',
      'information_request': 'provide',
      'configuration': 'configure',
      'action_execution': 'execute',
      'status_check': 'check',
    };

    return actions[category] || 'process';
  }

  private generateAlternativeReason(intent: PrimaryIntent, similarity: number): string {
    if (similarity > 0.7) {
      return `Similar semantic meaning to "${intent.category}"`;
    }
    if (similarity > 0.5) {
      return `Possible related intent: "${intent.category}"`;
    }
    return `Alternative interpretation as "${intent.category}"`;
  }

  // ============================================================================
  // SIMULAÇÕES (seriam substituídas por implementações reais)
  // ============================================================================

  private simulateBERTClassification(content: string): PrimaryIntent {
    return this.classifyByKeywords(content);
  }

  private simulateGPT4Analysis(content: string, context: ConversationContext): PrimaryIntent {
    return this.classifyByKeywords(content);
  }

  private simulateT5Classification(content: string): PrimaryIntent {
    return this.classifyByKeywords(content);
  }

  private classifyByKeywords(content: string): PrimaryIntent {
    const lower = content.toLowerCase();

    if (lower.includes('scan') || lower.includes('security') || lower.includes('vulnerability')) {
      return { category: 'security_scan', action: 'scan', target: this.extractTarget(lower) };
    }

    if (lower.includes('qa') || lower.includes('quality') || lower.includes('test')) {
      return { category: 'qa_analysis', action: 'analyze', target: this.extractTarget(lower) };
    }

    if (lower.match(/\b(what|how|why|when|where)\b/)) {
      return { category: 'information_request', action: 'provide' };
    }

    if (lower.includes('config') || lower.includes('setting')) {
      return { category: 'configuration', action: 'configure' };
    }

    if (lower.includes('status') || lower.includes('check')) {
      return { category: 'status_check', action: 'check' };
    }

    return { category: 'action_execution', action: 'process' };
  }

  private extractTarget(content: string): string | undefined {
    const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) return urlMatch[1];

    const domainMatch = content.match(/\b([a-z0-9]+\.(com|org|net|io|dev))\b/);
    if (domainMatch) return domainMatch[1];

    return undefined;
  }

  // ============================================================================
  // DADOS DE SUPORTE MULTILÍNGUE
  // ============================================================================

  private getPositiveWords(language: string): string[] {
    const words: Record<string, string[]> = {
      'en': ['good', 'great', 'excellent', 'amazing', 'awesome', 'perfect', 'love', 'best', 'thanks', 'please'],
      'pt': ['bom', 'ótimo', 'excelente', 'incrível', 'perfeito', 'amei', 'obrigado', 'por favor'],
      'es': ['bueno', 'excelente', 'increíble', 'perfecto', 'gracias', 'por favor'],
    };

    return words[language] || words['en'];
  }

  private getNegativeWords(language: string): string[] {
    const words: Record<string, string[]> = {
      'en': ['bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'error', 'bug', 'broken', 'fail'],
      'pt': ['ruim', 'terrível', 'horrível', 'ódio', 'pior', 'erro', 'bug', 'quebrado', 'falha'],
      'es': ['malo', 'terrible', 'horrible', 'odio', 'peor', 'error', 'fallo'],
    };

    return words[language] || words['en'];
  }

  private getIntensifiers(language: string): string[] {
    return ['very', 'extremely', 'really', 'totally', 'absolutely', 'completely', 'muito', 'muy'];
  }

  private getEmotionPatterns(language: string): Record<string, RegExp[]> {
    return {
      'frustration': [
        /\b(frustrat|annoy|irritat|angry|mad)\w*\b/gi,
        /\b(de novo|again|still|sempre|always)\b/gi,
      ],
      'confusion': [
        /\b(confus|lost|don't understand|não entendi|no entiendo)\w*\b/gi,
        /\b(what\?|how\?|why\?|como\?|o quê\?)\b/gi,
      ],
      'urgency': [
        /\b(urgent|hurry|rush|quick|asap|agora|now|ya)\b/gi,
        /\b(emergency|crisis|critical|crítico)\b/gi,
      ],
      'concern': [
        /\b(worried|concern|afraid|scared|preocup|medo)\w*\b/gi,
        /\b(issue|problem|problema)\b/gi,
      ],
    };
  }
}

// ============================================================================
// CLASSES AUXILIARES
// ============================================================================

class LanguageDetector {
  async detect(content: string): Promise<string> {
    // Implementação simplificada
    // Na versão real, usaría franc-min ou similar

    const patterns: Record<string, RegExp[]> = {
      'pt': [/\b(oi|olá|como|você|obrigado|por favor|ajuda)\b/gi],
      'es': [/\b(hola|cómo|usted|gracias|por favor|ayuda)\b/gi],
      'fr': [/\b(bonjour|comment|vous|merci|s'il vous plaît|aide)\b/gi],
      'de': [/\b(hallo|wie|sie|danke|bitte|hilfe)\b/gi],
    };

    for (const [lang, regexes] of Object.entries(patterns)) {
      for (const regex of regexes) {
        if (regex.test(content)) {
          return lang;
        }
      }
    }

    return 'en';
  }
}

class EntityExtractor {
  private config: { enabled: boolean; types: EntityType[]; customEntities: string[] };

  constructor(config: { enabled: boolean; types: EntityType[]; customEntities: string[] }) {
    this.config = config;
  }

  async extract(content: string, language: string): Promise<Entity[]> {
    if (!this.config.enabled) return [];

    const entities: Entity[] = [];

    // Extrair URLs
    const urlMatches = content.matchAll(/(https?:\/\/[^\s]+)/g);
    for (const match of urlMatches) {
      entities.push({
        type: 'url',
        value: match[1],
        startPos: match.index!,
        endPos: match.index! + match[1].length,
        confidence: 0.95,
      });
    }

    // Extrair emails
    const emailMatches = content.matchAll(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g);
    for (const match of emailMatches) {
      entities.push({
        type: 'email',
        value: match[1],
        startPos: match.index!,
        endPos: match.index! + match[1].length,
        confidence: 0.98,
      });
    }

    // Extrair IPs
    const ipMatches = content.matchAll(/\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g);
    for (const match of ipMatches) {
      entities.push({
        type: 'ip_address',
        value: match[1],
        startPos: match.index!,
        endPos: match.index! + match[1].length,
        confidence: 0.90,
      });
    }

    // Extrair CVEs
    const cveMatches = content.matchAll(/\b(CVE-\d{4}-\d{4,})\b/gi);
    for (const match of cveMatches) {
      entities.push({
        type: 'cve',
        value: match[1].toUpperCase(),
        startPos: match.index!,
        endPos: match.index! + match[1].length,
        confidence: 0.99,
      });
    }

    return entities;
  }
}

class IntentClassifier {
  // Placeholder para classificador específico
}
