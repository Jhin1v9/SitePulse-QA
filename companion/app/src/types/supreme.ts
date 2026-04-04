/**
 * SitePulse SUPREME - TypeScript Types
 * Supreme type definitions for the ultimate security platform
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
  | 'dormant'      // Completely inactive
  | 'initializing' // Starting up
  | 'active'       // Fully operational
  | 'processing'   // Currently working
  | 'learning'     // Acquiring new patterns
  | 'optimizing'   // Self-improving
  | 'warning'      // Issues detected
  | 'critical';    // Requires attention

export interface Engine {
  id: EngineId;
  name: string;
  codename: string;
  description: string;
  longDescription: string;
  color: string;
  gradient: string;
  icon: string;
  status: EngineStatus;
  isActive: boolean;
  power: number; // 0-100
  efficiency: number; // 0-100
  capabilities: Capability[];
  metrics: EngineMetrics;
  lastActivity: Date;
  neuralSignature: string; // Visual hash
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  level: number; // 1-10
}

export interface EngineMetrics {
  operationsPerSecond: number;
  accuracyRate: number;
  responseTime: number; // ms
  memoryUsage: number; // MB
  patternsRecognized?: number;
  threatsDetected?: number;
  predictionsMade?: number;
  decisionsTaken?: number;
  [key: string]: number | undefined;
}

// ============================================
// FINDING TYPES - DISCOVERED VULNERABILITIES
// ============================================

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'new' | 'analyzing' | 'confirmed' | 'mitigated' | 'resolved' | 'false_positive';

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: FindingStatus;
  engine: EngineId;
  target: string;
  cwe?: string;
  cvss?: number;
  evidence: Evidence[];
  discoveredAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  tags: string[];
}

export interface Evidence {
  id: string;
  type: 'code' | 'request' | 'response' | 'screenshot' | 'payload' | 'log';
  content: string;
  language?: string;
  timestamp: Date;
}

// ============================================
// SCAN TYPES - ACTIVE OPERATIONS
// ============================================

export type ScanStatus = 'pending' | 'initializing' | 'running' | 'pausing' | 'completed' | 'failed' | 'cancelled';

export interface Scan {
  id: string;
  name: string;
  target: string;
  engines: EngineId[];
  status: ScanStatus;
  progress: number;
  findingsCount: number;
  startTime?: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number; // seconds
  logs: ScanLog[];
}

export interface ScanLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  engine?: EngineId;
}

// ============================================
// SYSTEM TYPES - PLATFORM HEALTH
// ============================================

export interface SystemHealth {
  status: 'optimal' | 'healthy' | 'degraded' | 'critical';
  uptime: number; // seconds
  version: string;
  build: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
}

export interface NeuralMetrics {
  totalFindings: number;
  criticalFindings: number;
  scansCompleted: number;
  averageAccuracy: number;
  threatDetectionRate: number;
  falsePositiveRate: number;
}

// ============================================
// UI TYPES - INTERFACE ELEMENTS
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

// ============================================
// ANIMATION TYPES - MOTION PRESETS
// ============================================

export interface AnimationConfig {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: object;
}

export const fadeInUp: AnimationConfig = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

export const fadeInScale: AnimationConfig = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};
