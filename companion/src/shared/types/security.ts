/**
 * TIPOS DO CYBERSENIOR ENGINE v3.0 Supremo
 * Red Team, Blue Team, Forensics, Threat Intel, Compliance, SOAR
 */

import { Identifiable, Timestamped, SeverityLevel, HealthStatus, AsyncResult } from './engine-base';

// ============================================================================
// CONFIGURAÇÃO DE SCAN
// ============================================================================

export interface SecurityScanConfig {
  target: SharedSecurityTarget;
  scanTypes: ScanType[];
  intensity: ScanIntensity;
  complianceFrameworks: ComplianceFramework[];
  authentication?: AuthenticationConfig;
  scope: ScanScope;
  schedule?: ScanSchedule;
}

export interface SharedSecurityTarget {
  id: string;
  url: string;
  name: string;
  type: 'web' | 'api' | 'mobile' | 'desktop' | 'cloud' | 'network' | 'container';
  scope: 'single' | 'subdomain' | 'domain' | 'full' | 'network';
  technologies?: string[];
  credentials?: CredentialSet;
  environment?: 'production' | 'staging' | 'development';
}

/** @deprecated Use SharedSecurityTarget instead */
export type SecurityTarget = SharedSecurityTarget;

export interface CredentialSet {
  username?: string;
  password?: string;
  apiKey?: string;
  token?: string;
  cookies?: Record<string, string>;
}

export type ScanType =
  | 'sqli'           // SQL Injection
  | 'xss'            // Cross-Site Scripting
  | 'csrf'           // Cross-Site Request Forgery
  | 'ssrf'           // Server-Side Request Forgery
  | 'idor'           // Insecure Direct Object Reference
  | 'auth'           // Authentication/Authorization
  | 'headers'        // Security Headers
  | 'ssl'            // SSL/TLS Configuration
  | 'dependencies'   // Dependency Vulnerabilities
  | 'secrets'        // Secret Leakage
  | 'business_logic' // Business Logic Flaws
  | 'api'            // API Security
  | 'cloud'          // Cloud Configuration
  | 'container'      // Container Security
  | 'network';       // Network Security

export type ScanIntensity = 'passive' | 'active' | 'aggressive';
export type ComplianceFramework = 'owasp10' | 'pci_dss' | 'gdpr' | 'iso27001' | 'nist' | 'soc2' | 'hipaa';

export interface AuthenticationConfig {
  type: 'none' | 'basic' | 'bearer' | 'cookie' | 'oauth' | 'api_key';
  credentials: CredentialSet;
  loginUrl?: string;
  logoutUrl?: string;
}

export interface ScanScope {
  includePaths: string[];
  excludePaths: string[];
  maxDepth: number;
  maxPages: number;
  respectRobotsTxt: boolean;
  followRedirects: boolean;
}

export interface ScanSchedule {
  enabled: boolean;
  frequency: 'once' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  startTime?: Date;
  timezone: string;
}

// ============================================================================
// VULNERABILIDADE
// ============================================================================

export interface Vulnerability extends Identifiable, Timestamped {
  type: VulnerabilityType;
  name: string;
  description: string;
  severity: SeverityLevel;
  cvss: CVSS_Score;
  location: VulnerabilityLocation;
  evidence: VulnerabilityEvidence;
  impact: VulnerabilityImpact;
  remediation: RemediationPlan;
  references: string[];
  cwe?: string;
  cve?: string;
  verified: boolean;
  falsePositive: boolean;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
}

export type VulnerabilityType =
  | 'sql_injection'
  | 'xss_reflected'
  | 'xss_stored'
  | 'xss_dom'
  | 'csrf'
  | 'ssrf'
  | 'idor'
  | 'path_traversal'
  | 'command_injection'
  | 'ldap_injection'
  | 'xml_injection'
  | 'xpath_injection'
  | 'nosql_injection'
  | 'deserialization'
  | 'authentication_bypass'
  | 'authorization_bypass'
  | 'insecure_cookies'
  | 'missing_headers'
  | 'ssl_misconfiguration'
  | 'sensitive_data_exposure'
  | 'security_misconfiguration'
  | 'outdated_component'
  | 'insufficient_logging'
  | 'race_condition'
  | 'business_logic'
  | 'api_vulnerability'
  | 'cloud_misconfiguration'
  | 'container_escape'
  | 'privilege_escalation'
  | 'information_disclosure';

export interface CVSS_Score {
  score: number;
  vector: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  version: '2.0' | '3.0' | '3.1' | '4.0';
  baseScore: number;
  temporalScore?: number;
  environmentalScore?: number;
}

export interface VulnerabilityLocation {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  parameter?: string;
  header?: string;
  body?: string;
  lineNumber?: number;
  filePath?: string;
}

export interface VulnerabilityEvidence {
  request: string;
  response: string;
  payload: string;
  proof: string;
  screenshots?: string[];
  httpTraffic: HTTP_Traffic[];
}

export interface HTTP_Traffic {
  timestamp: Date;
  request: string;
  response: string;
  duration: number;
}

export interface VulnerabilityImpact {
  confidentiality: 'none' | 'low' | 'high' | 'complete';
  integrity: 'none' | 'low' | 'high' | 'complete';
  availability: 'none' | 'low' | 'high' | 'complete';
  dataExposure: boolean;
  authBypass: boolean;
  rcePotential: boolean;
  businessImpact: string;
}

export interface RemediationPlan {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  codeExample?: string;
  estimatedEffort: 'hours' | 'days' | 'weeks';
  complexity: 'low' | 'medium' | 'high';
}

// ============================================================================
// RELATÓRIO DE SCAN
// ============================================================================

export interface SecurityScanResult extends Identifiable, Timestamped {
  config: SecurityScanConfig;
  status: ScanStatus;
  duration: number;
  summary: ScanSummary;
  vulnerabilities: Vulnerability[];
  findings: Finding[];
  attackSurface: AttackSurface;
  complianceResults: ComplianceResult[];
  riskScore: number;
  executiveSummary: string;
}

export type ScanStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface ScanSummary {
  totalRequests: number;
  pagesScanned: number;
  vulnerabilitiesFound: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  scanCoverage: number;
}

export interface Finding {
  id: string;
  type: 'vulnerability' | 'information' | 'configuration' | 'behavior';
  title: string;
  description: string;
  severity: SeverityLevel;
  location: string;
  evidence?: string;
  recommendation?: string;
}

export interface AttackSurface {
  endpoints: Endpoint[];
  parameters: Parameter[];
  headers: Header[];
  cookies: Cookie[];
  technologies: Technology[];
  exposedFiles: string[];
}

export interface Endpoint {
  url: string;
  method: string;
  parameters: string[];
  authentication: boolean;
  tested: boolean;
}

export interface Parameter {
  name: string;
  location: 'query' | 'body' | 'header' | 'cookie' | 'path';
  type: string;
  reflected: boolean;
  stored: boolean;
}

export interface Header {
  name: string;
  value: string;
  securityRelevant: boolean;
}

export interface Cookie {
  name: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  expiration: Date;
}

export interface Technology {
  name: string;
  version: string;
  category: string;
  vulnerabilities: number;
}

export interface ComplianceResult {
  framework: ComplianceFramework;
  compliant: boolean;
  score: number;
  passedChecks: number;
  failedChecks: number;
  findings: ComplianceFinding[];
}

export interface ComplianceFinding {
  control: string;
  description: string;
  status: 'pass' | 'fail' | 'partial';
  evidence: string;
  remediation?: string;
}

// ============================================================================
// RED TEAM - PENTEST
// ============================================================================

export interface PentestConfig {
  target: SharedSecurityTarget;
  scope: PentestScope;
  phases: PentestPhase[];
  rulesOfEngagement: RulesOfEngagement;
}

export interface PentestScope {
  inScope: string[];
  outOfScope: string[];
  testingWindows: TimeWindow[];
  emergencyContact: ContactInfo;
}

export interface TimeWindow {
  start: Date;
  end: Date;
  timezone: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export type PentestPhase = 
  | 'reconnaissance'
  | 'scanning'
  | 'vulnerability_assessment'
  | 'exploitation'
  | 'post_exploitation'
  | 'reporting';

export interface RulesOfEngagement {
  authorizedBy: string;
  authorizationDate: Date;
  allowDenialOfService: boolean;
  allowSocialEngineering: boolean;
  allowPhysicalAccess: boolean;
  dataHandling: string;
  reportingRequirements: string[];
}

export interface PentestReport extends Identifiable, Timestamped {
  config: PentestConfig;
  phases: PhaseResult[];
  vulnerabilities: Vulnerability[];
  attackPaths: AttackPath[];
  executiveSummary: ExecutiveSummary;
  technicalDetails: TechnicalDetails;
  riskMatrix: RiskMatrix;
  recommendations: Recommendation[];
}

export interface PhaseResult {
  phase: PentestPhase;
  status: 'completed' | 'partial' | 'skipped';
  findings: Finding[];
  duration: number;
  activities: Activity[];
}

export interface Activity {
  timestamp: Date;
  description: string;
  tool?: string;
  result?: string;
}

export interface AttackPath {
  id: string;
  name: string;
  description: string;
  steps: AttackStep[];
  impact: string;
  likelihood: 'low' | 'medium' | 'high';
  complexity: 'low' | 'medium' | 'high';
}

export interface AttackStep {
  order: number;
  technique: string;
  description: string;
  prerequisites: string[];
  result: string;
  mitreTactic?: string;
  mitreTechnique?: string;
}

export interface ExecutiveSummary {
  overallRisk: 'critical' | 'high' | 'medium' | 'low';
  keyFindings: string[];
  businessImpact: string;
  immediateActions: string[];
  estimatedRemediationCost: string;
  estimatedBreachCost: string;
}

export interface TechnicalDetails {
  scopeValidation: string;
  testingMethodology: string;
  toolsUsed: string[];
  timeSpent: Record<string, number>;
  limitations: string[];
}

export interface RiskMatrix {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface Recommendation {
  priority: number;
  title: string;
  description: string;
  affectedSystems: string[];
  remediationSteps: string[];
  estimatedEffort: string;
  estimatedCost: string;
}

// ============================================================================
// BLUE TEAM - DETECÇÃO E RESPOSTA
// ============================================================================

export interface Threat extends Identifiable, Timestamped {
  type: ThreatType;
  severity: SeverityLevel;
  confidence: number;
  description: string;
  indicators: Indicator[];
  affectedAssets: string[];
  status: ThreatStatus;
  assignedTo?: string;
  mitreTactics: string[];
  mitreTechniques: string[];
}

export type ThreatType =
  | 'malware'
  | 'phishing'
  | 'intrusion'
  | 'data_exfiltration'
  | 'ddos'
  | 'insider_threat'
  | 'apt'
  | 'ransomware'
  | 'supply_chain'
  | 'credential_abuse';

export type ThreatStatus = 'new' | 'under_investigation' | 'contained' | 'resolved' | 'false_positive';

export interface Indicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'signature';
  value: string;
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  source: string;
}

export interface Incident extends Identifiable, Timestamped {
  title: string;
  description: string;
  severity: SeverityLevel;
  category: IncidentCategory;
  status: IncidentStatus;
  threats: Threat[];
  affectedSystems: string[];
  timeline: IncidentEvent[];
  responseActions: ResponseAction[];
  lessonsLearned?: string;
}

export type IncidentCategory =
  | 'security_breach'
  | 'data_loss'
  | 'service_outage'
  | 'compliance_violation'
  | 'insider_threat'
  | 'malware_outbreak'
  | 'phishing_campaign';

export type IncidentStatus = 'detected' | 'acknowledged' | 'contained' | 'eradicated' | 'recovered' | 'closed';

export interface IncidentEvent {
  timestamp: Date;
  type: string;
  description: string;
  source: string;
  data: unknown;
}

export interface ResponseAction {
  timestamp: Date;
  action: string;
  performedBy: string;
  result: 'success' | 'failure' | 'partial';
  notes?: string;
}

export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  type: 'signature' | 'anomaly' | 'behavioral' | 'threshold';
  severity: SeverityLevel;
  query: string;
  enabled: boolean;
  falsePositiveRate: number;
  lastModified: Date;
}

// ============================================================================
// FORENSE
// ============================================================================

export interface Evidence extends Identifiable, Timestamped {
  type: EvidenceType;
  source: string;
  description: string;
  hash: string;
  size: number;
  collectedBy: string;
  collectedAt: Date;
  chainOfCustody: CustodyEntry[];
  metadata: Record<string, unknown>;
  content?: string | Buffer;
}

export type EvidenceType =
  | 'disk_image'
  | 'memory_dump'
  | 'log_file'
  | 'network_capture'
  | 'file'
  | 'email'
  | 'screenshot'
  | 'video'
  | 'audio'
  | 'document';

export interface CustodyEntry {
  timestamp: Date;
  action: 'collected' | 'transferred' | 'accessed' | 'analyzed' | 'stored';
  performedBy: string;
  location: string;
  hash: string;
  notes?: string;
}

export interface ForensicTimeline {
  events: ForensicEvent[];
  gaps: TimeGap[];
  correlations: EventCorrelation[];
}

export interface ForensicEvent {
  timestamp: Date;
  source: string;
  type: string;
  description: string;
  evidence: string[];
  entities: string[];
}

export interface TimeGap {
  start: Date;
  end: Date;
  duration: number;
  possibleExplanation?: string;
}

export interface EventCorrelation {
  events: string[];
  correlationType: 'causal' | 'temporal' | 'logical';
  confidence: number;
}

// ============================================================================
// THREAT INTELLIGENCE
// ============================================================================

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string[];
  origin: string;
  motivation: string[];
  firstSeen: Date;
  lastSeen: Date;
  ttps: TTP[];
  targets: string[];
  tools: string[];
  iocs: Indicator[];
  confidence: number;
}

export interface TTP {
  tactic: string;
  technique: string;
  procedure: string;
  frequency: 'common' | 'occasional' | 'rare';
}

export interface IntelligenceFeed {
  id: string;
  name: string;
  provider: string;
  type: 'open_source' | 'commercial' | 'government' | 'isac';
  iocs: Indicator[];
  lastUpdate: Date;
  reliability: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
}

// ============================================================================
// SOAR
// ============================================================================

export interface Playbook {
  id: string;
  name: string;
  description: string;
  trigger: PlaybookTrigger;
  steps: PlaybookStep[];
  enabled: boolean;
  executionCount: number;
  successRate: number;
}

export interface PlaybookTrigger {
  type: 'scheduled' | 'event' | 'manual' | 'threshold';
  condition: string;
  schedule?: string;
}

export interface PlaybookStep {
  order: number;
  name: string;
  action: string;
  parameters: Record<string, unknown>;
  condition?: string;
  onSuccess: string;
  onFailure: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  condition: string;
  actions: string[];
  enabled: boolean;
  executionCount: number;
  lastExecuted?: Date;
}

// ============================================================================
// API DO CYBERSENIOR ENGINE
// ============================================================================

export interface CyberSeniorAPI {
  // Red Team
  runPentest(config: PentestConfig): Promise<AsyncResult<PentestReport>>;
  runVulnerabilityScan(config: SecurityScanConfig): Promise<AsyncResult<SecurityScanResult>>;
  simulateAttack(attackType: string, target: SharedSecurityTarget): Promise<AsyncResult<AttackResult>>;
  
  // Blue Team
  detectThreats(): Promise<Threat[]>;
  getActiveIncidents(): Promise<Incident[]>;
  respondToIncident(incidentId: string, action: ResponseAction): Promise<AsyncResult<void>>;
  createDetectionRule(rule: DetectionRule): Promise<AsyncResult<void>>;
  
  // Forensics
  collectEvidence(incidentId: string, sources: string[]): Promise<AsyncResult<Evidence[]>>;
  analyzeEvidence(evidenceId: string): Promise<AsyncResult<EvidenceAnalysis>>;
  generateTimeline(incidentId: string): Promise<AsyncResult<ForensicTimeline>>;
  
  // Threat Intel
  searchThreatIntel(query: string): Promise<ThreatActor[]>;
  getIOCs(threatActorId?: string): Promise<Indicator[]>;
  enrichIOC(ioc: Indicator): Promise<Indicator>;
  
  // Compliance
  generateComplianceReport(framework: ComplianceFramework, target: SharedSecurityTarget): Promise<AsyncResult<ComplianceResult>>;
  runComplianceCheck(framework: ComplianceFramework): Promise<ComplianceResult[]>;
  
  // SOAR
  executePlaybook(playbookId: string, context: unknown): Promise<AsyncResult<void>>;
  getPlaybooks(): Promise<Playbook[]>;
  createAutomationRule(rule: AutomationRule): Promise<AsyncResult<void>>;
}

export interface AttackResult {
  success: boolean;
  technique: string;
  target: string;
  evidence: string;
  impact: string;
  remediation: string;
}

export interface EvidenceAnalysis {
  evidenceId: string;
  findings: string[];
  iocs: Indicator[];
  attribution?: string;
  confidence: number;
}
