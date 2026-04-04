/**
 * TIPOS DO INTENT ENGINE v3.0 Supremo
 */

import { Identifiable, Timestamped, ConfidenceLevel, SeverityLevel } from './engine-base';
import { UserInput, ConversationContext } from './user-input';

// ============================================================================
// INTENT
// ============================================================================

export interface Intent extends Identifiable, Timestamped {
  primary: PrimaryIntent;
  secondary?: Intent[];
  confidence: number;
  ambiguity: AmbiguityLevel;
  emotionalState: EmotionalState;
  urgency: UrgencyLevel;
  entities: EntityReference[];
  parameters: Record<string, unknown>;
  expectedOutcome: string;
}

export interface PrimaryIntent {
  category: IntentCategory;
  action: string;
  target?: string;
  scope?: string;
  constraints?: string[];
}

export type IntentCategory =
  // Análise e Scan
  | 'security_scan'
  | 'qa_analysis'
  | 'performance_test'
  | 'accessibility_check'
  | 'seo_analysis'
  
  // Consulta e Informação
  | 'information_request'
  | 'status_check'
  | 'report_view'
  | 'explanation_request'
  
  // Ação e Configuração
  | 'configuration'
  | 'action_execution'
  | 'automation_setup'
  | 'integration_request'
  
  // Gestão
  | 'project_management'
  | 'team_collaboration'
  | 'resource_management'
  
  // Suporte
  | 'help_request'
  | 'troubleshooting'
  | 'feedback'
  
  // Sistema
  | 'system_command'
  | 'navigation'
  | 'exit';

// ============================================================================
// NÍVEIS E ESTADOS
// ============================================================================

export type AmbiguityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type UrgencyLevel = 'low' | 'normal' | 'high' | 'critical' | 'emergency';

export interface EmotionalState {
  sentiment: SentimentScore;
  emotions: Emotion[];
  frustration: number; // 0-1
  confidence: number; // 0-1
  urgencyIndicators: string[];
}

export interface SentimentScore {
  overall: number; // -1 to 1
  positive: number;
  negative: number;
  neutral: number;
}

export type Emotion =
  | 'frustration'
  | 'confusion'
  | 'satisfaction'
  | 'urgency'
  | 'curiosity'
  | 'concern'
  | 'excitement'
  | 'disappointment'
  | 'anger'
  | 'fear';

// ============================================================================
// REFERÊNCIAS DE ENTIDADES
// ============================================================================

export interface EntityReference {
  name: string;
  type: string;
  value: unknown;
  confidence: number;
  required: boolean;
  resolved: boolean;
}

// ============================================================================
// RESULTADO DA ANÁLISE
// ============================================================================

export interface IntentAnalysisResult {
  intent: Intent;
  alternatives: AlternativeIntent[];
  clarificationNeeded: boolean;
  suggestedQuestions?: string[];
  estimatedComplexity: ComplexityLevel;
  estimatedDuration: number; // segundos
  requiredPermissions: string[];
}

export interface AlternativeIntent {
  intent: PrimaryIntent;
  confidence: number;
  reason: string;
}

export type ComplexityLevel = 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';

// ============================================================================
// API DO INTENT ENGINE
// ============================================================================

export interface IntentEngineAPI {
  understand(input: UserInput, context: ConversationContext): Promise<IntentAnalysisResult>;
  getConfidence(intent: Intent): number;
  getEmotionalState(input: UserInput): EmotionalState;
  disambiguate(ambiguousIntent: Intent, context: ConversationContext): Promise<ClarifiedIntent>;
  detectParallelIntents(input: UserInput): Promise<Intent[]>;
}

export interface ClarifiedIntent {
  originalIntent: Intent;
  clarifiedIntent: Intent;
  clarificationMethod: 'context' | 'history' | 'entity_resolution' | 'user_confirmation';
  confidence: number;
}
