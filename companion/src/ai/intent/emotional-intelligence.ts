/**
 * EMOTIONAL INTELLIGENCE ENGINE - Intent Engine v3.0 Supremo
 * Detecção e resposta a estados emocionais do usuário
 */

import { EmotionalState, SentimentScore, Emotion } from '../../shared/types/intent';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface EmotionalIntelligenceConfig {
  enabled: boolean;
  empathyLevel: 'low' | 'medium' | 'high' | 'adaptive';
  culturalAwareness: boolean;
  personalityAdaptation: boolean;
  crisisDetection: boolean;
  toneMatching: boolean;
}

// ============================================================================
// PERFIL EMOCIONAL DO USUÁRIO
// ============================================================================

export interface EmotionalProfile {
  userId: string;
  baselineEmotions: Map<string, number>; // Emoção -> frequência
  typicalFrustrationLevel: number;
  communicationStyle: 'formal' | 'casual' | 'technical' | 'emotional';
  preferredTone: 'professional' | 'friendly' | 'empathetic' | 'direct';
  triggers: string[];
  calmingPatterns: string[];
  history: EmotionalSnapshot[];
}

export interface EmotionalSnapshot {
  timestamp: Date;
  state: EmotionalState;
  context: string;
  interactionOutcome: 'positive' | 'neutral' | 'negative';
}

// ============================================================================
// MOTOR DE EMPATIA ADAPTATIVA
// ============================================================================

export interface EmpathyResponse {
  tone: ResponseTone;
  language: string[];
  pacing: 'urgent' | 'normal' | 'deliberate';
  structure: 'concise' | 'detailed' | 'step_by_step';
  emotionalValidation?: string;
  proactiveSupport?: string[];
}

export type ResponseTone =
  | 'professional_neutral'
  | 'friendly_supportive'
  | 'empathetic_understanding'
  | 'urgent_focused'
  | 'reassuring_confident'
  | 'collaborative';

// ============================================================================
// EMOTIONAL INTELLIGENCE ENGINE
// ============================================================================

export class EmotionalIntelligenceEngine {
  private config: EmotionalIntelligenceConfig;
  private userProfiles: Map<string, EmotionalProfile> = new Map();
  private crisisPatterns: CrisisPattern[];
  private culturalContext: CulturalContextEngine;

  constructor(config: EmotionalIntelligenceConfig) {
    this.config = config;
    this.crisisPatterns = this.initializeCrisisPatterns();
    this.culturalContext = new CulturalContextEngine();
  }

  /**
   * Análise completa do estado emocional
   */
  async analyze(
    content: string,
    userId: string,
    conversationHistory: string[]
  ): Promise<EmotionalAnalysis> {
    // 1. Análise léxica de sentimento
    const sentiment = this.analyzeSentiment(content);

    // 2. Detecção de emoções específicas
    const emotions = this.detectEmotions(content);

    // 3. Análise de intensidade
    const intensity = this.calculateIntensity(content, emotions);

    // 4. Detecção de frustração
    const frustration = this.detectFrustration(content, conversationHistory);

    // 5. Detecção de urgência
    const urgency = this.detectUrgencySignals(content);

    // 6. Análise de confiança do usuário
    const confidence = this.assessUserConfidence(content, conversationHistory);

    // 7. Detecção de crise
    const crisisIndicators = this.detectCrisis(content, emotions);

    // 8. Contexto cultural
    const culturalFactors = await this.culturalContext.analyze(content);

    // 9. Atualizar perfil do usuário
    await this.updateUserProfile(userId, {
      sentiment,
      emotions: emotions.map(e => e.type),
      frustration,
      confidence,
    });

    const state: EmotionalState = {
      sentiment,
      emotions: emotions.map(e => e.type),
      frustration,
      confidence,
      urgencyIndicators: urgency,
    };

    return {
      state,
      intensity,
      crisisIndicators,
      culturalFactors,
      recommendedResponse: this.generateEmpathyResponse(state, userId),
      riskLevel: this.calculateRiskLevel(state, crisisIndicators),
    };
  }

  /**
   * Gera resposta empática adaptada ao estado emocional
   */
  generateEmpathyResponse(state: EmotionalState, userId: string): EmpathyResponse {
    const profile = this.userProfiles.get(userId);

    // Determinar tom base
    let tone: ResponseTone = 'professional_neutral';
    let pacing: EmpathyResponse['pacing'] = 'normal';
    let structure: EmpathyResponse['structure'] = 'detailed';

    // Adaptar baseado no estado emocional
    if (state.frustration > 0.7) {
      tone = 'empathetic_understanding';
      pacing = 'urgent';
      structure = 'concise';
    } else if (state.emotions.includes('urgency')) {
      tone = 'urgent_focused';
      pacing = 'urgent';
    } else if (state.frustration > 0.4) {
      tone = 'reassuring_confident';
    } else if (state.sentiment.overall > 0.3) {
      tone = 'friendly_supportive';
    }

    // Adaptar baseado no perfil do usuário
    if (profile) {
      if (profile.communicationStyle === 'technical') {
        structure = 'detailed';
      }
      if (profile.preferredTone === 'direct') {
        tone = 'professional_neutral';
        structure = 'concise';
      }
    }

    // Gerar validação emocional
    const emotionalValidation = this.generateEmotionalValidation(state);

    // Gerar suporte proativo
    const proactiveSupport = this.generateProactiveSupport(state, profile);

    return {
      tone,
      language: this.selectLanguagePatterns(tone),
      pacing,
      structure,
      emotionalValidation,
      proactiveSupport,
    };
  }

  /**
   * Detecta se a interação requer intervenção humana
   */
  requiresHumanIntervention(analysis: EmotionalAnalysis): boolean {
    if (analysis.riskLevel === 'critical') return true;
    if (analysis.crisisIndicators.length > 2) return true;
    if (analysis.state.frustration > 0.9) return true;
    if (analysis.state.emotions.includes('anger') && analysis.state.confidence < 0.3) return true;
    return false;
  }

  // ============================================================================
  // ANÁLISE DE SENTIMENTO AVANÇADA
  // ============================================================================

  private analyzeSentiment(content: string): SentimentScore {
    const words = this.tokenize(content);
    let positive = 0;
    let negative = 0;
    let neutral = 0;

    const sentimentLexicon = this.getSentimentLexicon();

    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (sentimentLexicon.positive.includes(lowerWord)) {
        positive++;
      } else if (sentimentLexicon.negative.includes(lowerWord)) {
        negative++;
      } else if (sentimentLexicon.intensifiers.includes(lowerWord)) {
        // Intensificadores não contam diretamente
      } else {
        neutral++;
      }
    });

    // Aplicar intensificadores
    const intensifierCount = words.filter(w =>
      sentimentLexicon.intensifiers.includes(w.toLowerCase())
    ).length;

    const multiplier = 1 + (intensifierCount * 0.2);
    positive *= multiplier;
    negative *= multiplier;

    const total = positive + negative + neutral || 1;
    const overall = (positive - negative) / Math.max(positive + negative, 1);

    return {
      overall: Math.max(-1, Math.min(1, overall)),
      positive: positive / total,
      negative: negative / total,
      neutral: neutral / total,
    };
  }

  // ============================================================================
  // DETECÇÃO DE EMOÇÕES
  // ============================================================================

  private detectEmotions(content: string): Array<{ type: Emotion; intensity: number }> {
    const emotions: Array<{ type: Emotion; intensity: number }> = [];
    const lowerContent = content.toLowerCase();

    // Padrões de emoção com pesos
    const emotionPatterns: Array<{ emotion: Emotion; patterns: RegExp[]; weight: number }> = [
      {
        emotion: 'frustration',
        patterns: [
          /\b(argh|ugh|grr|damn|hell|stupid|ridiculous)\b/gi,
          /\b(again|still|never|always)\s+(?:the\s+)?same\b/gi,
          /\b(not?\s+working|broken|useless|waste)\b/gi,
          /[!]{2,}/g,
          /\b(can'?t|cannot|unable)\s+(?:get|make|do)\b/gi,
        ],
        weight: 1.0,
      },
      {
        emotion: 'confusion',
        patterns: [
          /\b(confused|lost|don'?t\s+understand|não\s+entendi|no\s+entiendo)\b/gi,
          /\b(what|how|why)\s+(?:do|does|is|are|to)\b/gi,
          /\b(where|when)\s+(?:is|are|do)\b/gi,
          /\?/g,
          /\b(not?\s+sure|unclear|puzzled)\b/gi,
        ],
        weight: 0.8,
      },
      {
        emotion: 'urgency',
        patterns: [
          /\b(urgent|urgente|asap|immediately|now|hurry|quick)\b/gi,
          /\b(deadline|due|expires|vence|prazo)\b/gi,
          /\b(emergency|crisis|critical|down|offline)\b/gi,
          /\b(customer|client|boss|manager)\s+(?:is|will be)\s+(?:waiting|angry)\b/gi,
        ],
        weight: 1.2,
      },
      {
        emotion: 'concern',
        patterns: [
          /\b(worried|concerned|afraid|scared|anxious|nervous)\b/gi,
          /\b(security|breach|hack|attack|vulnerable)\b/gi,
          /\b(data|information)\s+(?:lost|stolen|leaked)\b/gi,
          /\b(risk|danger|threat|problem|issue)\b/gi,
        ],
        weight: 1.0,
      },
      {
        emotion: 'satisfaction',
        patterns: [
          /\b(great|awesome|excellent|perfect|love|amazing|thank)\b/gi,
          /\b(working|fixed|solved|resolved)\b/gi,
          /\b(exactly|precisely|exactamente)\b/gi,
          /[:)]/g,
        ],
        weight: 0.9,
      },
      {
        emotion: 'excitement',
        patterns: [
          /\b(excited|awesome|can'?t\s+wait|looking\s+forward)\b/gi,
          /[!]{1,2}/g,
          /\b(woohoo|yay|yes\!|great\s+news)\b/gi,
        ],
        weight: 0.7,
      },
      {
        emotion: 'disappointment',
        patterns: [
          /\b(disappoint|expected\s+better|hoped|thought)\b/gi,
          /\b(not?\s+what\s+i\s+(?:wanted|expected|needed))\b/gi,
          /\b(sad|unfortunate|too\s+bad)\b/gi,
        ],
        weight: 0.8,
      },
      {
        emotion: 'anger',
        patterns: [
          /\b(angry|furious|outraged|pissed|mad)\b/gi,
          /\b([A-Z]{3,})/g, // CAPS
          /\b(hate|detest|ridiculous|outrageous)\b/gi,
          /[!]{3,}/g,
          /\b(unacceptable|intolerable)\b/gi,
        ],
        weight: 1.5,
      },
      {
        emotion: 'curiosity',
        patterns: [
          /\b(curious|wonder|interested|learn|know\s+more)\b/gi,
          /\b(what\s+if|how\s+about|tell\s+me)\b/gi,
          /\b(can\s+i|is\s+it\s+possible|would\s+it)\b/gi,
        ],
        weight: 0.6,
      },
    ];

    emotionPatterns.forEach(({ emotion, patterns, weight }) => {
      let matchCount = 0;
      patterns.forEach(pattern => {
        const matches = lowerContent.match(pattern);
        if (matches) {
          matchCount += matches.length;
        }
      });

      if (matchCount > 0) {
        const intensity = Math.min(1, (matchCount * weight) / 3);
        emotions.push({ type: emotion, intensity });
      }
    });

    // Ordenar por intensidade
    return emotions.sort((a, b) => b.intensity - a.intensity);
  }

  // ============================================================================
  // CÁLCULO DE INTENSIDADE
  // ============================================================================

  private calculateIntensity(
    content: string,
    emotions: Array<{ type: Emotion; intensity: number }>
  ): number {
    if (emotions.length === 0) return 0.5;

    // Média ponderada das intensidades das emoções
    const totalIntensity = emotions.reduce((sum, e) => sum + e.intensity, 0);
    const avgIntensity = totalIntensity / emotions.length;

    // Ajustar baseado no conteúdo
    const hasIntensifiers = /\b(very|extremely|incredibly|so|really|very much|muito|muitíssimo)\b/i.test(
      content
    );

    const hasCaps = /[A-Z]{3,}/.test(content);
    const hasMultiplePunctuation = /[!?]{2,}/.test(content);

    let adjustment = 0;
    if (hasIntensifiers) adjustment += 0.1;
    if (hasCaps) adjustment += 0.1;
    if (hasMultiplePunctuation) adjustment += 0.1;

    return Math.min(1, avgIntensity + adjustment);
  }

  // ============================================================================
  // DETECÇÃO DE FRUSTRAÇÃO
  // ============================================================================

  private detectFrustration(content: string, history: string[]): number {
    let frustrationScore = 0;
    const lowerContent = content.toLowerCase();

    // Padrões de frustração
    const frustrationIndicators = [
      { pattern: /\b(again|still|yet again|once more)\b/gi, weight: 0.3 },
      { pattern: /\b(not?\s+working|doesn'?t\s+work|broken)\b/gi, weight: 0.4 },
      { pattern: /\b(tried|attempted)\s+(?:everything|all|multiple)\b/gi, weight: 0.3 },
      { pattern: /\b(wasting\s+time|hours|days)\b/gi, weight: 0.5 },
      { pattern: /[!]{2,}/g, weight: 0.2 },
      { pattern: /[?]{2,}/g, weight: 0.15 },
      { pattern: /\b(seriously|come on|give me a break)\b/gi, weight: 0.3 },
    ];

    frustrationIndicators.forEach(({ pattern, weight }) => {
      const matches = lowerContent.match(pattern);
      if (matches) {
        frustrationScore += matches.length * weight;
      }
    });

    // Análise de histórico
    if (history.length > 0) {
      const repeatedQuestions = history.filter(h =>
        this.similarity(h, content) > 0.7
      ).length;
      frustrationScore += repeatedQuestions * 0.2;
    }

    // Verificar se o usuário está repetindo a mesma questão
    if (history.length >= 2) {
      const lastTwo = history.slice(-2);
      if (this.similarity(lastTwo[0], lastTwo[1]) > 0.8) {
        frustrationScore += 0.3;
      }
    }

    return Math.min(1, frustrationScore);
  }

  // ============================================================================
  // DETECÇÃO DE SINAIS DE URGÊNCIA
  // ============================================================================

  private detectUrgencySignals(content: string): string[] {
    const indicators: string[] = [];
    const lowerContent = content.toLowerCase();

    const urgencyPatterns = [
      { pattern: /\b(urgent|urgente|priority|prioridade)\b/gi, indicator: 'explicit_urgency' },
      { pattern: /\b(asap|as soon as possible|immediately|right now|agora)\b/gi, indicator: 'time_pressure' },
      { pattern: /\b(deadline|due|expires|vence|prazo|limite)\b/gi, indicator: 'deadline_approaching' },
      { pattern: /\b(down|offline|not responding|parado|caiu)\b/gi, indicator: 'system_down' },
      { pattern: /\b(production|produção|live|customer facing)\b/gi, indicator: 'production_impact' },
      { pattern: /\b(ceo|cto|boss|manager|cliente importante)\b/gi, indicator: 'escalation' },
      { pattern: /\b(losing money|revenue|sales|perdendo)\b/gi, indicator: 'financial_impact' },
    ];

    urgencyPatterns.forEach(({ pattern, indicator }) => {
      if (pattern.test(lowerContent)) {
        indicators.push(indicator);
      }
    });

    return [...new Set(indicators)];
  }

  // ============================================================================
  // AVALIAÇÃO DE CONFIANÇA DO USUÁRIO
  // ============================================================================

  private assessUserConfidence(content: string, history: string[]): number {
    let confidence = 0.7; // baseline

    // Indicadores de baixa confiança
    const lowConfidenceIndicators = [
      /\b(maybe|perhaps|i think|not sure|unsure)\b/gi,
      /\b(confused|lost|don'?t know|não sei|no sé)\b/gi,
      /\b(help|assist|support|ajuda|ayuda)\b/gi,
      /\?/g,
    ];

    lowConfidenceIndicators.forEach(pattern => {
      if (pattern.test(content.toLowerCase())) {
        confidence -= 0.1;
      }
    });

    // Indicadores de alta confiança
    const highConfidenceIndicators = [
      /\b(certainly|definitely|absolutely|for sure|com certeza)\b/gi,
      /\b(run|execute|perform|start|do it)\b/gi,
      /\b(scan|analyze|check|test)\s+(?:the|this|my)\b/gi,
    ];

    highConfidenceIndicators.forEach(pattern => {
      if (pattern.test(content.toLowerCase())) {
        confidence += 0.1;
      }
    });

    // Comprimento do histórico (mais interações = mais confiança)
    confidence += Math.min(0.1, history.length * 0.02);

    return Math.max(0, Math.min(1, confidence));
  }

  // ============================================================================
  // DETECÇÃO DE CRISE
  // ============================================================================

  private detectCrisis(content: string, emotions: Array<{ type: Emotion; intensity: number }>): string[] {
    const indicators: string[] = [];
    const lowerContent = content.toLowerCase();

    this.crisisPatterns.forEach(pattern => {
      if (pattern.pattern.test(lowerContent)) {
        indicators.push(pattern.type);
      }
    });

    // Verificar combinação de emoções perigosas
    const hasAnger = emotions.some(e => e.type === 'anger' && e.intensity > 0.6);
    const hasFrustration = emotions.some(e => e.type === 'frustration' && e.intensity > 0.7);
    const hasUrgency = emotions.some(e => e.type === 'urgency' && e.intensity > 0.8);

    if (hasAnger && hasUrgency) {
      indicators.push('anger_urgency_combo');
    }

    if (hasFrustration && hasUrgency) {
      indicators.push('frustration_crisis');
    }

    return [...new Set(indicators)];
  }

  private initializeCrisisPatterns(): CrisisPattern[] {
    return [
      { type: 'security_breach', pattern: /\b(hacked|breach|stolen data|leaked|compromised)\b/gi },
      { type: 'system_failure', pattern: /\b(completely down|total failure|not working at all|parou tudo)\b/gi },
      { type: 'data_loss', pattern: /\b(lost all|deleted|data gone|missing data|sumiu)\b/gi },
      { type: 'financial_threat', pattern: /\b(losing thousands|losing millions|financial disaster)\b/gi },
      { type: 'legal_threat', pattern: /\b(lawsuit|legal action|compliance violation|gdpr|regulatory)\b/gi },
      { type: 'reputation_threat', pattern: /\b(reputation|pr crisis|social media|viral|exposed)\b/gi },
    ];
  }

  // ============================================================================
  // CÁLCULO DE NÍVEL DE RISCO
  // ============================================================================

  private calculateRiskLevel(state: EmotionalState, crisisIndicators: string[]): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;

    // Frustração alta
    if (state.frustration > 0.8) score += 3;
    else if (state.frustration > 0.5) score += 1;

    // Sentimento muito negativo
    if (state.sentiment.overall < -0.5) score += 2;

    // Emoções de alto risco
    if (state.emotions.includes('anger')) score += 2;
    if (state.emotions.includes('urgency')) score += 1;

    // Indicadores de crise
    score += crisisIndicators.length * 2;

    if (score >= 7) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  // ============================================================================
  // GERAÇÃO DE VALIDAÇÃO EMOCIONAL
  // ============================================================================

  private generateEmotionalValidation(state: EmotionalState): string | undefined {
    if (state.frustration > 0.7) {
      return "Entendo sua frustração. Vamos resolver isso juntos.";
    }

    if (state.emotions.includes('concern') && state.emotions.includes('urgency')) {
      return "Entendo a urgência. Estou priorizando sua solicitação.";
    }

    if (state.emotions.includes('confusion')) {
      return "Vou explicar passo a passo para deixar tudo claro.";
    }

    if (state.sentiment.negative > 0.5) {
      return "Sinto muito pela dificuldade. Vou ajudar a resolver.";
    }

    return undefined;
  }

  // ============================================================================
  // SUPORTE PROATIVO
  // ============================================================================

  private generateProactiveSupport(state: EmotionalState, profile?: EmotionalProfile): string[] {
    const suggestions: string[] = [];

    if (state.frustration > 0.6) {
      suggestions.push("Posso escalar isso diretamente para um especialista.");
    }

    if (state.emotions.includes('confusion')) {
      suggestions.push("Posso fornecer documentação detalhada sobre este tópico.");
    }

    if (state.urgencyIndicators.includes('system_down')) {
      suggestions.push("Ativando protocolo de incidente crítico.");
    }

    if (profile && profile.triggers.some(t => state.emotions.includes(t as Emotion))) {
      suggestions.push("Detectei um padrão que causou problemas antes. Vamos evitar isso.");
    }

    return suggestions;
  }

  // ============================================================================
  // PERFIL DO USUÁRIO
  // ============================================================================

  private async updateUserProfile(
    userId: string,
    emotionalData: {
      sentiment: SentimentScore;
      emotions: Emotion[];
      frustration: number;
      confidence: number;
    }
  ): Promise<void> {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, this.createDefaultProfile(userId));
    }

    const profile = this.userProfiles.get(userId)!;

    // Atualizar baseline
    emotionalData.emotions.forEach(emotion => {
      const current = profile.baselineEmotions.get(emotion) || 0;
      profile.baselineEmotions.set(emotion, current + 1);
    });

    // Atualizar nível típico de frustração (média móvel)
    profile.typicalFrustrationLevel =
      (profile.typicalFrustrationLevel * 0.9) + (emotionalData.frustration * 0.1);

    // Adicionar snapshot
    profile.history.push({
      timestamp: new Date(),
      state: {
        sentiment: emotionalData.sentiment,
        emotions: emotionalData.emotions,
        frustration: emotionalData.frustration,
        confidence: emotionalData.confidence,
        urgencyIndicators: [],
      },
      context: 'interaction',
      interactionOutcome: 'neutral',
    });

    // Limitar histórico
    if (profile.history.length > 100) {
      profile.history = profile.history.slice(-100);
    }
  }

  private createDefaultProfile(userId: string): EmotionalProfile {
    return {
      userId,
      baselineEmotions: new Map(),
      typicalFrustrationLevel: 0.3,
      communicationStyle: 'casual',
      preferredTone: 'friendly',
      triggers: [],
      calmingPatterns: [],
      history: [],
    };
  }

  // ============================================================================
  // UTILITÁRIOS
  // ============================================================================

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  }

  private similarity(a: string, b: string): number {
    // Implementação simplificada de similaridade de cosseno
    const tokensA = new Set(this.tokenize(a));
    const tokensB = new Set(this.tokenize(b));

    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return intersection.size / union.size;
  }

  private selectLanguagePatterns(tone: ResponseTone): string[] {
    const patterns: Record<ResponseTone, string[]> = {
      'professional_neutral': ['technical precision', 'clear and concise'],
      'friendly_supportive': ['collaborative', 'encouraging'],
      'empathetic_understanding': ['acknowledging', 'validating', 'supportive'],
      'urgent_focused': ['direct', 'action-oriented', 'prioritized'],
      'reassuring_confident': ['confident', 'solution-focused', 'competent'],
      'collaborative': ['inclusive', 'questioning', 'exploratory'],
    };

    return patterns[tone];
  }

  private getSentimentLexicon(): { positive: string[]; negative: string[]; intensifiers: string[] } {
    return {
      positive: [
        'good', 'great', 'excellent', 'amazing', 'awesome', 'perfect', 'love', 'best',
        'fantastic', 'wonderful', 'outstanding', 'superb', 'brilliant', 'happy',
        'satisfied', 'pleased', 'grateful', 'thank', 'thanks', 'appreciate',
        'bom', 'ótimo', 'excelente', 'incrível', 'perfeito', 'amei', 'obrigado'
      ],
      negative: [
        'bad', 'terrible', 'awful', 'horrible', 'hate', 'worst', 'disappointing',
        'frustrating', 'annoying', 'useless', 'broken', 'fail', 'failed', 'error',
        'bug', 'issue', 'problem', 'wrong', 'stupid', 'ridiculous',
        'ruim', 'terrível', 'horrível', 'pior', 'erro', 'bug', 'falha', 'problema'
      ],
      intensifiers: [
        'very', 'extremely', 'really', 'totally', 'absolutely', 'completely',
        'quite', 'rather', 'pretty', 'fairly', 'definitely', 'certainly',
        'muito', 'extremamente', 'realmente', 'totalmente', 'completamente'
      ],
    };
  }
}

// ============================================================================
// INTERFACES DE SUPORTE
// ============================================================================

export interface EmotionalAnalysis {
  state: EmotionalState;
  intensity: number;
  crisisIndicators: string[];
  culturalFactors: CulturalFactors;
  recommendedResponse: EmpathyResponse;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface CrisisPattern {
  type: string;
  pattern: RegExp;
}

interface CulturalFactors {
  formalityLevel: 'low' | 'medium' | 'high';
  directness: 'direct' | 'indirect';
  emotionalExpression: 'expressive' | 'restrained';
}

// ============================================================================
// MOTOR DE CONTEXTO CULTURAL
// ============================================================================

class CulturalContextEngine {
  async analyze(content: string): Promise<CulturalFactors> {
    // Implementação simplificada
    // Na versão real, usaría detecção de cultura baseada em linguagem

    const factors: CulturalFactors = {
      formalityLevel: 'medium',
      directness: 'direct',
      emotionalExpression: 'expressive',
    };

    // Detectar formalidade
    const formalWords = ['dear', 'sir', 'madam', 'would you', 'could you', 'please', 'kindly'];
    const informalWords = ['hey', 'hi', 'yo', 'guys', ' ASAP', 'quick'];

    const formalCount = formalWords.filter(w => content.toLowerCase().includes(w)).length;
    const informalCount = informalWords.filter(w => content.toLowerCase().includes(w)).length;

    if (formalCount > informalCount) {
      factors.formalityLevel = 'high';
    } else if (informalCount > formalCount) {
      factors.formalityLevel = 'low';
    }

    return factors;
  }
}
