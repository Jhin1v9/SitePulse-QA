/**
 * TIPOS DE ENTRADA DO USUÁRIO - Intent Engine v3.0
 */

import { Identifiable, Timestamped, SeverityLevel } from './engine-base';
import { Intent } from './intent';

// ============================================================================
// ENTRADA DO USUÁRIO
// ============================================================================

export interface UserInput extends Identifiable, Timestamped {
  content: string;
  type: InputType;
  source: InputSource;
  context?: ConversationContext;
  metadata?: InputMetadata;
}

export type InputType = 
  | 'text'
  | 'voice'
  | 'command'
  | 'file'
  | 'image'
  | 'structured';

export type InputSource = 
  | 'chat'
  | 'api'
  | 'webhook'
  | 'scheduled'
  | 'automation'
  | 'integration';

export interface InputMetadata {
  language: string;
  confidence: number;
  entities: Entity[];
  mentions: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: string;
  name: string;
  size: number;
  url: string;
  content?: string;
}

// ============================================================================
// CONTEXTO DA CONVERSAÇÃO
// ============================================================================

export interface ConversationContext {
  conversationId: string;
  turnNumber: number;
  previousTurns: ConversationTurn[];
  userProfile?: UserProfile;
  sessionContext?: SessionContext;
  systemContext?: SystemContext;
}

export interface ConversationTurn extends Timestamped {
  turnId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent?: Intent;
  actions?: ActionTaken[];
}

export interface UserProfile {
  userId: string;
  role: UserRole;
  preferences: UserPreferences;
  history: UserHistory;
  permissions: string[];
}

export type UserRole = 
  | 'admin'
  | 'analyst'
  | 'developer'
  | 'security_engineer'
  | 'qa_engineer'
  | 'viewer';

export interface UserPreferences {
  language: string;
  timezone: string;
  notificationSettings: NotificationSettings;
  uiPreferences: UiPreferences;
}

export interface NotificationSettings {
  email: boolean;
  slack: boolean;
  webhook?: string;
  severityThreshold: SeverityLevel;
}

export interface UiPreferences {
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  autoRefresh: boolean;
}

export interface UserHistory {
  totalInteractions: number;
  favoriteCommands: string[];
  commonIssues: string[];
  successRate: number;
}

export interface SessionContext {
  sessionId: string;
  startedAt: Date;
  currentView: string;
  selectedProject?: string;
  selectedTarget?: TargetReference;
}

export interface SystemContext {
  version: string;
  environment: 'development' | 'staging' | 'production';
  features: string[];
  limits: SystemLimits;
}

export interface SystemLimits {
  maxRequestsPerMinute: number;
  maxConcurrentScans: number;
  maxFileSize: number;
  maxConversationLength: number;
}

// ============================================================================
// ENTIDADES
// ============================================================================

export interface Entity {
  type: EntityType;
  value: string;
  startPos: number;
  endPos: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export type EntityType =
  | 'url'
  | 'ip_address'
  | 'domain'
  | 'email'
  | 'cve'
  | 'vulnerability'
  | 'technology'
  | 'severity'
  | 'date'
  | 'time'
  | 'file_path'
  | 'command'
  | 'person'
  | 'organization'
  | 'project'
  | 'target';

// ============================================================================
// REFERÊNCIAS
// ============================================================================

export interface TargetReference {
  id: string;
  type: 'url' | 'api' | 'mobile_app' | 'desktop_app' | 'cloud';
  name: string;
  url?: string;
}

export interface ActionTaken extends Timestamped {
  actionId: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: unknown;
}
