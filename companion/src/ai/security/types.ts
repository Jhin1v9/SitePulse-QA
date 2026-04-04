/**
 * CYBERSENIOR SECURITY ENGINE TYPES - Semana 18 v3.0 Supremo
 */

export type ScanType = 'vulnerability' | 'penetration' | 'compliance' | 'malware' | 'config_review';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type AttackVector = 'network' | 'web' | 'api' | 'mobile' | 'cloud' | 'social' | 'physical';
export type ComplianceStandard = 'owasp_top_10' | 'pci_dss' | 'hipaa' | 'gdpr' | 'iso27001' | 'soc2' | 'nist';

export interface SecurityTarget {
  id: string;
  name: string;
  type: 'web' | 'api' | 'mobile' | 'desktop' | 'cloud' | 'network' | 'container';
  url?: string;
  ip?: string;
  domain?: string;
  technologies: Technology[];
  scope: string[];
  credentials?: Credential[];
  environment?: 'production' | 'staging' | 'development';
}

export interface Technology {
  name: string;
  version: string;
  category: 'web_server' | 'framework' | 'database' | 'language' | 'library' | 'cms' | 'cloud_service';
  vulnerabilities: string[];
  lastScan?: Date;
}

export interface Credential {
  type: 'basic' | 'api_key' | 'oauth' | 'jwt' | 'certificate';
  scope: string[];
  expiry?: Date;
}

export interface SecurityScan {
  id: string;
  target: SecurityTarget;
  type: ScanType;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  progress: number;
  findings: SecurityFinding[];
  metrics: ScanMetrics;
  logs: ScanLog[];
}

export interface SecurityFinding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  cvssScore: number;
  cvssVector?: string;
  cweId?: string;
  cveIds: string[];
  owaspCategory?: string;
  attackVector: AttackVector;
  evidence: Evidence[];
  remediation: Remediation;
  falsePositive: boolean;
  verified: boolean;
  firstSeen: Date;
  lastSeen: Date;
  occurrences: number;
  dna?: VulnerabilityDNA;
}

export interface Evidence {
  type: 'screenshot' | 'request' | 'response' | 'log' | 'file' | 'payload';
  data: string;
  description: string;
  timestamp: Date;
}

export interface Remediation {
  summary: string;
  detailedSteps: string[];
  codeExample?: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  references: string[];
  automatedFix?: boolean;
  fixScript?: string;
}

export interface VulnerabilityDNA {
  id: string;
  geneticCode: string;
  strain: string;
  family: string;
  variants: Variant[];
  behavior: BehaviorPattern;
  propagation: PropagationMethod;
  signature: Signature;
  evolution: EvolutionRecord[];
}

export interface Variant {
  id: string;
  name: string;
  differences: string[];
  firstSeen: Date;
  prevalence: number;
}

export interface BehaviorPattern {
  triggers: string[];
  actions: string[];
  indicators: string[];
  stealth: number;
  persistence: boolean;
}

export interface PropagationMethod {
  type: 'network' | 'file' | 'memory' | 'supply_chain';
  vectors: string[];
  speed: 'slow' | 'medium' | 'fast';
  scope: 'local' | 'network' | 'internet';
}

export interface Signature {
  hash: string;
  patterns: string[];
  iocs: string[];
  yara?: string;
}

export interface EvolutionRecord {
  timestamp: Date;
  change: string;
  from: string;
  to: string;
}

export interface AttackSurface {
  target: SecurityTarget;
  assets: Asset[];
  entryPoints: EntryPoint[];
  dependencies: Dependency[];
  exposedServices: ExposedService[];
  dataFlows: DataFlow[];
  trustBoundaries: TrustBoundary[];
  riskScore: number;
  lastUpdated: Date;
}

export interface Asset {
  id: string;
  type: 'server' | 'database' | 'api' | 'file' | 'user' | 'secret';
  name: string;
  value: 'critical' | 'high' | 'medium' | 'low';
  exposure: 'public' | 'internal' | 'private';
  protections: string[];
  vulnerabilities: string[];
}

export interface EntryPoint {
  id: string;
  type: 'url' | 'api_endpoint' | 'port' | 'form' | 'upload' | 'websocket';
  location: string;
  method?: string;
  parameters: string[];
  authRequired: boolean;
  riskLevel: Severity;
  tested: boolean;
}

export interface Dependency {
  id: string;
  name: string;
  version: string;
  type: 'direct' | 'transitive';
  vulnerabilities: number;
  outdated: boolean;
  licenseRisk: boolean;
}

export interface ExposedService {
  id: string;
  name: string;
  port: number;
  protocol: string;
  version: string;
  banner: string;
  vulnerabilities: string[];
}

export interface DataFlow {
  id: string;
  source: string;
  destination: string;
  protocol: string;
  encrypted: boolean;
  sensitive: boolean;
  validated: boolean;
}

export interface TrustBoundary {
  id: string;
  name: string;
  type: 'network' | 'application' | 'data' | 'user';
  controls: string[];
  gaps: string[];
}

export interface ComplianceResult {
  standard: ComplianceStandard;
  version: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  score: number;
  requirements: ComplianceRequirement[];
  gaps: ComplianceGap[];
  recommendations: string[];
  reportUrl?: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'pass' | 'fail' | 'partial' | 'not_applicable';
  evidence: string[];
  findings: string[];
}

export interface ComplianceGap {
  requirementId: string;
  severity: Severity;
  description: string;
  remediation: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface PentestReport {
  id: string;
  target: SecurityTarget;
  scope: string;
  methodology: string;
  executiveSummary: ExecutiveSummary;
  findings: SecurityFinding[];
  attackPaths: AttackPath[];
  exploitation: ExploitationResult[];
  recommendations: SecurityRecommendation[];
  appendices: Appendix[];
}

export interface ExecutiveSummary {
  overallRisk: Severity;
  keyFindings: string[];
  statistics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  businessImpact: string;
  immediateActions: string[];
  estimatedRemediationCost?: string;
  estimatedBreachCost?: string;
}

export interface AttackPath {
  id: string;
  name: string;
  description: string;
  entryPoint: string;
  steps: AttackStep[];
  impact: string;
  likelihood: number;
  complexity: 'easy' | 'moderate' | 'complex';
  prerequisites: string[];
}

export interface AttackStep {
  order: number;
  description: string;
  technique: string;
  tools: string[];
  evidence: string;
}

export interface ExploitationResult {
  findingId: string;
  exploited: boolean;
  method: string;
  impact: string;
  evidence: string[];
  video?: string;
  screenshots: string[];
}

export interface SecurityRecommendation {
  id: string;
  priority: number;
  category: string;
  title: string;
  description: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  impact: Severity;
  cost?: number;
  timeline?: string;
}

export interface Appendix {
  title: string;
  content: string;
}

export interface ScanMetrics {
  requests: number;
  pagesScanned: number;
  timeTaken: number;
  coverage: number;
  depth: number;
}

export interface ScanLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, unknown>;
}

export interface ThreatIntel {
  id: string;
  type: 'vulnerability' | 'exploit' | 'ioc' | 'ttp';
  source: string;
  timestamp: Date;
  data: unknown;
  confidence: number;
  relevance: number;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  type: 'password' | 'access' | 'data' | 'network' | 'audit';
  rules: PolicyRule[];
  enforced: boolean;
  exceptions: string[];
}

export interface PolicyRule {
  id: string;
  description: string;
  condition: string;
  action: 'allow' | 'deny' | 'alert' | 'block';
  severity: Severity;
}
