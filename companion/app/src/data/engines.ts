/**
 * SitePulse SUPREME - Engine Data
 * The 10 Neural Engines - Each with unique personality and power
 */

import type { Engine, Finding, Scan, SystemHealth, NeuralMetrics } from '@/types/supreme';

// ============================================
// THE 10 NEURAL ENGINES
// ============================================

export const engines: Engine[] = [
  {
    id: 'intent',
    name: 'Intent Engine',
    codename: 'ORACLE',
    description: 'Pattern recognition & intent analysis',
    longDescription: 'Analyzes the underlying intent behind every vulnerability, recognizing attack patterns and predicting adversarial behavior through deep neural analysis.',
    color: '#ff2d95',
    gradient: 'linear-gradient(135deg, #ff2d95 0%, #ff0066 100%)',
    icon: 'Target',
    status: 'active',
    isActive: true,
    power: 94,
    efficiency: 91,
    capabilities: [
      { id: 'pattern', name: 'Pattern Recognition', description: 'Identifies attack signatures', level: 10 },
      { id: 'context', name: 'Context Analysis', description: 'Understands code semantics', level: 9 },
      { id: 'classification', name: 'Intent Classification', description: 'Categorizes threat types', level: 9 },
      { id: 'prediction', name: 'Severity Prediction', description: 'Predicts impact scope', level: 8 },
    ],
    metrics: {
      operationsPerSecond: 12500,
      accuracyRate: 94.7,
      responseTime: 12,
      memoryUsage: 456,
      patternsRecognized: 2847,
    },
    lastActivity: new Date(),
    neuralSignature: '0x7a3f...9e2d',
  },
  {
    id: 'context',
    name: 'Context Engine',
    codename: 'SAGE',
    description: 'Business context & asset mapping',
    longDescription: 'Comprehends the business context of applications, mapping critical assets and prioritizing vulnerabilities based on organizational impact.',
    color: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
    icon: 'Globe',
    status: 'active',
    isActive: true,
    power: 88,
    efficiency: 93,
    capabilities: [
      { id: 'mapping', name: 'Asset Mapping', description: 'Maps critical infrastructure', level: 9 },
      { id: 'prioritization', name: 'Risk Prioritization', description: 'Ranks by business impact', level: 10 },
      { id: 'landscape', name: 'Threat Landscape', description: 'Monitors threat evolution', level: 8 },
      { id: 'compliance', name: 'Compliance Mapping', description: 'Maps to regulations', level: 9 },
    ],
    metrics: {
      operationsPerSecond: 8400,
      accuracyRate: 91.2,
      responseTime: 18,
      memoryUsage: 672,
      patternsRecognized: 1563,
    },
    lastActivity: new Date(),
    neuralSignature: '0x8b4e...1f7a',
  },
  {
    id: 'evidence',
    name: 'Evidence Engine',
    codename: 'PROOF',
    description: 'Evidence collection & validation',
    longDescription: 'Collects, structures, and validates vulnerability evidence with forensic precision, filtering false positives through multi-layer verification.',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    icon: 'Microscope',
    status: 'processing',
    isActive: true,
    power: 96,
    efficiency: 89,
    capabilities: [
      { id: 'payload', name: 'Payload Generation', description: 'Creates proof-of-concept', level: 10 },
      { id: 'validation', name: 'Exploit Validation', description: 'Verifies exploitability', level: 10 },
      { id: 'chain', name: 'Evidence Chain', description: 'Maintains forensic integrity', level: 9 },
      { id: 'filter', name: 'False Positive Filter', description: 'Eliminates noise', level: 10 },
    ],
    metrics: {
      operationsPerSecond: 15200,
      accuracyRate: 96.3,
      responseTime: 8,
      memoryUsage: 384,
      patternsRecognized: 4521,
    },
    lastActivity: new Date(),
    neuralSignature: '0x9c5f...2e8b',
  },
  {
    id: 'memory',
    name: 'Memory Engine',
    codename: 'MNEMOS',
    description: 'Pattern storage & historical analysis',
    longDescription: 'Stores learned patterns and recognizes historical similarities, building a knowledge graph of security intelligence over time.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    icon: 'Database',
    status: 'active',
    isActive: true,
    power: 82,
    efficiency: 95,
    capabilities: [
      { id: 'storage', name: 'Pattern Storage', description: 'Archives learned patterns', level: 10 },
      { id: 'historical', name: 'Historical Analysis', description: 'Compares with past data', level: 9 },
      { id: 'similarity', name: 'Similarity Detection', description: 'Finds related patterns', level: 9 },
      { id: 'synthesis', name: 'Knowledge Synthesis', description: 'Builds intelligence graph', level: 8 },
    ],
    metrics: {
      operationsPerSecond: 6200,
      accuracyRate: 89.5,
      responseTime: 24,
      memoryUsage: 2048,
      patternsRecognized: 12847,
    },
    lastActivity: new Date(),
    neuralSignature: '0xad6g...3f9c',
  },
  {
    id: 'learning',
    name: 'Learning Engine',
    codename: 'EVOLVE',
    description: 'Continuous learning & adaptation',
    longDescription: 'Learns continuously from feedback and new threats, retraining models and optimizing performance through reinforcement learning.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: 'Brain',
    status: 'learning',
    isActive: true,
    power: 91,
    efficiency: 87,
    capabilities: [
      { id: 'feedback', name: 'Feedback Integration', description: 'Learns from user input', level: 9 },
      { id: 'retraining', name: 'Model Retraining', description: 'Updates neural weights', level: 10 },
      { id: 'adaptation', name: 'Adaptive Learning', description: 'Adjusts to new threats', level: 9 },
      { id: 'optimization', name: 'Performance Optimization', description: 'Self-improves efficiency', level: 8 },
    ],
    metrics: {
      operationsPerSecond: 7800,
      accuracyRate: 92.8,
      responseTime: 32,
      memoryUsage: 896,
      patternsRecognized: 342,
    },
    lastActivity: new Date(),
    neuralSignature: '0xbe7h...4g0d',
  },
  {
    id: 'decision',
    name: 'Decision Engine',
    codename: 'ARBITER',
    description: 'Multi-criteria decision making',
    longDescription: 'Orchestrates actions and makes decisions based on multiple intelligence sources, resolving conflicts and prioritizing responses.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    icon: 'GitBranch',
    status: 'active',
    isActive: true,
    power: 89,
    efficiency: 92,
    capabilities: [
      { id: 'multicriteria', name: 'Multi-Criteria Analysis', description: 'Evaluates all factors', level: 10 },
      { id: 'prioritization', name: 'Action Prioritization', description: 'Ranks responses', level: 9 },
      { id: 'allocation', name: 'Resource Allocation', description: 'Optimizes resource use', level: 8 },
      { id: 'resolution', name: 'Conflict Resolution', description: 'Resolves engine conflicts', level: 9 },
    ],
    metrics: {
      operationsPerSecond: 11200,
      accuracyRate: 93.5,
      responseTime: 6,
      memoryUsage: 512,
      decisionsTaken: 8934,
    },
    lastActivity: new Date(),
    neuralSignature: '0xcf8i...5h1e',
  },
  {
    id: 'action',
    name: 'Action Engine',
    codename: 'EXECUTOR',
    description: 'Automated remediation & response',
    longDescription: 'Executes corrective actions and tests mitigations, with full rollback capability and impact simulation before deployment.',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    icon: 'Zap',
    status: 'dormant',
    isActive: false,
    power: 0,
    efficiency: 0,
    capabilities: [
      { id: 'remediation', name: 'Auto-Remediation', description: 'Fixes vulnerabilities', level: 10 },
      { id: 'patch', name: 'Patch Generation', description: 'Creates security patches', level: 9 },
      { id: 'rollback', name: 'Rollback Capability', description: 'Reverts changes', level: 10 },
      { id: 'simulation', name: 'Impact Simulation', description: 'Tests before deploy', level: 9 },
    ],
    metrics: {
      operationsPerSecond: 0,
      accuracyRate: 0,
      responseTime: 0,
      memoryUsage: 0,
      patternsRecognized: 0,
    },
    lastActivity: new Date(Date.now() - 86400000),
    neuralSignature: '0xdg9j...6i2f',
  },
  {
    id: 'predictive',
    name: 'Predictive Engine',
    codename: 'PROPHET',
    description: 'Threat forecasting & trend analysis',
    longDescription: 'Predicts future vulnerabilities and threat trends through temporal pattern analysis and risk scoring algorithms.',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    icon: 'Eye',
    status: 'active',
    isActive: true,
    power: 86,
    efficiency: 88,
    capabilities: [
      { id: 'trend', name: 'Trend Analysis', description: 'Identifies patterns', level: 9 },
      { id: 'forecast', name: 'Vulnerability Forecast', description: 'Predicts future issues', level: 10 },
      { id: 'scoring', name: 'Risk Scoring', description: 'Calculates risk levels', level: 9 },
      { id: 'temporal', name: 'Temporal Patterns', description: 'Time-based analysis', level: 8 },
    ],
    metrics: {
      operationsPerSecond: 5400,
      accuracyRate: 87.3,
      responseTime: 45,
      memoryUsage: 768,
      predictionsMade: 2156,
    },
    lastActivity: new Date(),
    neuralSignature: '0xeh0k...7j3g',
  },
  {
    id: 'autonomous',
    name: 'Autonomous Engine',
    codename: 'SENTINEL',
    description: 'Self-healing & autonomous operation',
    longDescription: 'Operates fully autonomously when enabled, with self-healing capabilities, continuous monitoring, and intelligent escalation protocols.',
    color: '#14b8a6',
    gradient: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    icon: 'Bot',
    status: 'active',
    isActive: true,
    power: 78,
    efficiency: 96,
    capabilities: [
      { id: 'healing', name: 'Self-Healing', description: 'Auto-fixes issues', level: 9 },
      { id: 'monitoring', name: 'Continuous Monitoring', description: '24/7 surveillance', level: 10 },
      { id: 'reporting', name: 'Auto-Reporting', description: 'Generates reports', level: 8 },
      { id: 'escalation', name: 'Smart Escalation', description: 'Alerts when needed', level: 9 },
    ],
    metrics: {
      operationsPerSecond: 9600,
      accuracyRate: 95.1,
      responseTime: 2,
      memoryUsage: 320,
      patternsRecognized: 156,
    },
    lastActivity: new Date(),
    neuralSignature: '0xfi1l...8k4h',
  },
  {
    id: 'security',
    name: 'Security Engine',
    codename: 'GUARDIAN',
    description: 'Platform protection & integrity',
    longDescription: 'Protects the platform itself against attacks, ensuring system integrity through continuous verification and threat detection.',
    color: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    icon: 'Shield',
    status: 'active',
    isActive: true,
    power: 98,
    efficiency: 94,
    capabilities: [
      { id: 'protection', name: 'Self-Protection', description: 'Defends platform', level: 10 },
      { id: 'integrity', name: 'Integrity Verification', description: 'Checks system health', level: 10 },
      { id: 'detection', name: 'Threat Detection', description: 'Identifies attacks', level: 10 },
      { id: 'audit', name: 'Audit Logging', description: 'Records all activity', level: 9 },
    ],
    metrics: {
      operationsPerSecond: 18500,
      accuracyRate: 98.7,
      responseTime: 1,
      memoryUsage: 256,
      threatsDetected: 127,
    },
    lastActivity: new Date(),
    neuralSignature: '0xgj2m...9l5i',
  },
];

// ============================================
// MOCK FINDINGS
// ============================================

export const findings: Finding[] = [
  {
    id: 'CVE-2026-8842',
    title: 'SQL Injection in Authentication Flow',
    description: 'User input is directly concatenated into SQL queries without proper sanitization, allowing attackers to bypass authentication and extract sensitive data.',
    severity: 'critical',
    status: 'confirmed',
    engine: 'intent',
    target: 'https://api.target.com/v1/auth',
    cwe: 'CWE-89',
    cvss: 9.8,
    evidence: [
      {
        id: 'ev-1',
        type: 'code',
        content: `const query = "SELECT * FROM users WHERE email = '" + req.body.email + "'";`,
        language: 'javascript',
        timestamp: new Date(),
      },
    ],
    discoveredAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
    tags: ['sql-injection', 'authentication', 'critical'],
  },
  {
    id: 'CVE-2026-8843',
    title: 'Reflected XSS in Search Parameter',
    description: 'The search parameter reflects user input without proper encoding, enabling cross-site scripting attacks.',
    severity: 'high',
    status: 'analyzing',
    engine: 'evidence',
    target: 'https://app.target.com/search',
    cwe: 'CWE-79',
    cvss: 7.1,
    evidence: [
      {
        id: 'ev-2',
        type: 'request',
        content: 'GET /search?q=<script>alert(1)</script> HTTP/1.1',
        timestamp: new Date(),
      },
    ],
    discoveredAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(),
    tags: ['xss', 'reflected', 'search'],
  },
  {
    id: 'CVE-2026-8844',
    title: 'Insecure Direct Object Reference',
    description: 'API endpoints allow access to resources by incrementing IDs without proper authorization checks.',
    severity: 'high',
    status: 'new',
    engine: 'context',
    target: 'https://api.target.com/v1/users',
    cwe: 'CWE-639',
    cvss: 6.5,
    evidence: [],
    discoveredAt: new Date(Date.now() - 10800000),
    updatedAt: new Date(),
    tags: ['idor', 'authorization', 'api'],
  },
  {
    id: 'CVE-2026-8845',
    title: 'Missing Security Headers',
    description: 'Multiple security headers are missing from HTTP responses, reducing the security posture of the application.',
    severity: 'medium',
    status: 'mitigated',
    engine: 'security',
    target: 'https://target.com',
    cwe: 'CWE-693',
    cvss: 4.3,
    evidence: [],
    discoveredAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    tags: ['headers', 'configuration', 'hardening'],
  },
  {
    id: 'CVE-2026-8846',
    title: 'Weak Password Policy',
    description: 'Password policy allows weak passwords that can be easily compromised through brute force attacks.',
    severity: 'medium',
    status: 'new',
    engine: 'predictive',
    target: 'https://target.com/register',
    cwe: 'CWE-521',
    cvss: 5.3,
    evidence: [],
    discoveredAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(),
    tags: ['password', 'policy', 'brute-force'],
  },
];

// ============================================
// MOCK ACTIVE SCAN
// ============================================

export const activeScan: Scan = {
  id: 'scan-' + Date.now(),
  name: 'Deep Security Assessment',
  target: 'https://api.target.com',
  engines: ['intent', 'context', 'evidence', 'security'],
  status: 'running',
  progress: 67,
  findingsCount: 3,
  startTime: new Date(Date.now() - 1800000),
  estimatedTimeRemaining: 540,
  logs: [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 1800000),
      level: 'info',
      message: 'Initializing scan sequence...',
    },
    {
      id: 'log-2',
      timestamp: new Date(Date.now() - 1750000),
      level: 'success',
      message: 'Intent Engine activated - Pattern recognition online',
      engine: 'intent',
    },
    {
      id: 'log-3',
      timestamp: new Date(Date.now() - 1200000),
      level: 'success',
      message: 'Critical vulnerability detected in authentication flow',
      engine: 'intent',
    },
    {
      id: 'log-4',
      timestamp: new Date(Date.now() - 600000),
      level: 'warning',
      message: 'Rate limiting detected - Adjusting scan speed',
    },
    {
      id: 'log-5',
      timestamp: new Date(Date.now() - 120000),
      level: 'info',
      message: 'Analyzing API endpoints...',
      engine: 'evidence',
    },
  ],
};

// ============================================
// SYSTEM HEALTH
// ============================================

export const systemHealth: SystemHealth = {
  status: 'optimal',
  uptime: 452340,
  version: '3.0.0',
  build: 'supreme-2026.04.04',
  cpuUsage: 34,
  memoryUsage: 62,
  diskUsage: 45,
  networkLatency: 12,
  activeConnections: 847,
};

// ============================================
// NEURAL METRICS
// ============================================

export const neuralMetrics: NeuralMetrics = {
  totalFindings: 2847,
  criticalFindings: 127,
  scansCompleted: 893,
  averageAccuracy: 94.2,
  threatDetectionRate: 98.7,
  falsePositiveRate: 2.1,
};

// ============================================
// HELPERS
// ============================================

export const getEngineById = (id: string): Engine | undefined => {
  return engines.find(e => e.id === id);
};

export const getActiveEngines = (): Engine[] => {
  return engines.filter(e => e.isActive);
};

export const getFindingsBySeverity = (severity: string): Finding[] => {
  return findings.filter(f => f.severity === severity);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};
