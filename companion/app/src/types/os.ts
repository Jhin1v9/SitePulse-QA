/**
 * SitePulse OS - TypeScript Types
 * Web Operating System type definitions
 */

// ============================================
// ENGINE TYPES - THE 10 INTELLIGENCES
// ============================================

export type EngineId =
  | 'intent'
  | 'context'
  | 'evidence'
  | 'memory'
  | 'learning'
  | 'decision'
  | 'action'
  | 'predictive'
  | 'autonomous'
  | 'security';

export type EngineStatus =
  | 'dormant'
  | 'initializing'
  | 'active'
  | 'processing'
  | 'learning'
  | 'optimizing'
  | 'warning'
  | 'critical';

export interface Engine {
  id: EngineId;
  name: string;
  codename: string;
  description: string;
  color: string;
  gradient: string;
  icon: string;
  status: EngineStatus;
  isActive: boolean;
  power: number;
  efficiency: number;
  metrics: EngineMetrics;
}

export interface EngineMetrics {
  operationsPerSecond: number;
  accuracyRate: number;
  responseTime: number;
  memoryUsage: number;
  patternsRecognized?: number;
  threatsDetected?: number;
  predictionsMade?: number;
  decisionsTaken?: number;
}

// ============================================
// WINDOW SYSTEM TYPES
// ============================================

export type WindowType = 'engine' | 'audit' | 'finder' | 'ai' | 'dashboard' | 'settings';

export type WindowState = 'focused' | 'blurred' | 'minimized' | 'maximized';

export interface WindowInstance {
  id: string;
  type: WindowType;
  engineId?: EngineId;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
  zIndex: number;
  data?: Record<string, unknown>;
}

export interface WindowManagerState {
  windows: WindowInstance[];
  focusedWindowId: string | null;
  nextZIndex: number;
}

// ============================================
// DESKTOP TYPES
// ============================================

export interface DesktopIcon {
  id: string;
  name: string;
  icon: string;
  color: string;
  position: { x: number; y: number };
  badge?: 'running' | 'alert' | 'updating';
  onDoubleClick?: () => void;
}

export interface DesktopState {
  wallpaper: string;
  icons: DesktopIcon[];
  selectedIconIds: string[];
}

// ============================================
// DOCK TYPES
// ============================================

export interface DockItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  isPinned: boolean;
  isRunning: boolean;
  windowCount: number;
  hasBadge: boolean;
  onClick?: () => void;
}

// ============================================
// FINDER TYPES
// ============================================

export type FileType = 'folder' | 'file';

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  extension?: string;
  size?: number;
  modifiedAt: Date;
  parentId: string | null;
  icon?: string;
  content?: string;
}

// ============================================
// AI ASSISTANT TYPES
// ============================================

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AIAssistantState {
  position: { x: number; y: number };
  state: AIState;
  message?: string;
  isOpen: boolean;
}

// ============================================
// SPOTLIGHT TYPES
// ============================================

export interface SpotlightCommand {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: 'motor' | 'file' | 'system' | 'action';
}

// ============================================
// SYSTEM TYPES
// ============================================

export interface SystemState {
  clock: Date;
  notifications: Notification[];
  aiStatus: AIState;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read?: boolean;
}

// ============================================
// AUDIT TYPES
// ============================================

export type ScanStatus = 'idle' | 'selecting' | 'scanning' | 'completed' | 'error';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  file?: string;
  line?: number;
  column?: number;
  engine: string;
  timestamp: Date;
  evidence?: string;
  code?: string;
}

export interface AuditState {
  status: ScanStatus;
  target?: string;
  targetType?: 'url' | 'folder';
  selectedEngines: EngineId[];
  progress: number;
  findings: Finding[];
  logs: string[];
  estimatedTime: number;
  startTime?: Date;
  endTime?: Date;
}

// ============================================
// MENU TYPES
// ============================================

export interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  submenu?: MenuItem[];
  separator?: boolean;
  disabled?: boolean;
}
