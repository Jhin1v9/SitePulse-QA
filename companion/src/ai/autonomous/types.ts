/**
 * AUTONOMOUS QA ENGINE TYPES - Semana 16-17 v3.0 Supremo
 */

export type TestType = 'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility';
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'healed' | 'quarantined';
export type HealingStrategy = 'selector_update' | 'wait_adjustment' | 'retry_logic' | 'data_refresh' | 'manual_review';
export type RemediationType = 'auto_fix' | 'rollback' | 'config_update' | 'alert_team' | 'create_ticket';

export interface TestCase {
  id: string;
  name: string;
  description: string;
  type: TestType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: TestStatus;
  code: string;
  selectors: Selector[];
  dependencies: string[];
  expectedResult: ExpectedResult;
  metadata: TestMetadata;
  healingHistory: HealingAttempt[];
}

export interface Selector {
  id: string;
  type: 'css' | 'xpath' | 'id' | 'text' | 'test_id' | 'aria';
  value: string;
  confidence: number;
  alternatives: string[];
  lastWorkingVersion?: string;
}

export interface ExpectedResult {
  assertions: Assertion[];
  screenshots?: ScreenshotComparison[];
  performanceMetrics?: PerformanceThreshold[];
}

export interface Assertion {
  id: string;
  type: 'exists' | 'equals' | 'contains' | 'visible' | 'enabled' | 'css_property' | 'api_response';
  target: string;
  expectedValue: unknown;
  tolerance?: number;
}

export interface ScreenshotComparison {
  baselinePath: string;
  threshold: number;
  ignoreRegions: BoundingBox[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PerformanceThreshold {
  metric: 'load_time' | 'ttfb' | 'fcp' | 'lcp' | 'cls' | 'fid';
  maxValue: number;
}

export interface TestMetadata {
  createdAt: Date;
  updatedAt: Date;
  author: string;
  lastRun?: Date;
  runCount: number;
  passRate: number;
  avgDuration: number;
  flakyScore: number;
}

export interface HealingAttempt {
  id: string;
  timestamp: Date;
  originalError: string;
  strategy: HealingStrategy;
  changes: CodeChange[];
  success: boolean;
  validationResult?: ValidationResult;
}

export interface CodeChange {
  file: string;
  line: number;
  original: string;
  modified: string;
  description: string;
}

export interface ValidationResult {
  passed: boolean;
  testRunId: string;
  duration: number;
  screenshots?: string[];
}

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  tests: TestCase[];
  setup?: string;
  teardown?: string;
  parallel: boolean;
  maxConcurrency: number;
  timeout: number;
}

export interface TestExecution {
  id: string;
  suite: TestSuite;
  status: 'queued' | 'running' | 'completed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  results: TestResult[];
  environment: TestEnvironment;
  coverage?: CoverageReport;
}

export interface TestResult {
  testId: string;
  status: TestStatus;
  duration: number;
  error?: TestError;
  screenshots: string[];
  logs: string[];
  performanceData?: PerformanceMetrics;
  retries: number;
  healed: boolean;
  healingApplied?: HealingAttempt;
}

export interface TestError {
  message: string;
  stackTrace?: string;
  type: 'assertion' | 'timeout' | 'selector_not_found' | 'network' | 'unknown';
  screenshot?: string;
  recoverable: boolean;
}

export interface TestEnvironment {
  browser?: string;
  browserVersion?: string;
  os?: string;
  resolution?: string;
  url: string;
  variables: Record<string, string>;
}

export interface PerformanceMetrics {
  loadTime: number;
  ttfb: number;
  fcp: number;
  lcp: number;
  cls: number;
  fid: number;
}

export interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncovered: UncoveredLine[];
}

export interface UncoveredLine {
  file: string;
  line: number;
  type: 'statement' | 'branch' | 'function';
}

export interface ReleaseReadiness {
  status: 'approved' | 'rejected' | 'conditional' | 'pending';
  confidence: number;
  version: string;
  timestamp: Date;
  metrics: QualityMetrics;
  assessments: RiskAssessment[];
  blockers: ReleaseBlocker[];
  recommendations: string[];
}

export interface QualityMetrics {
  testPassRate: number;
  testCoverage: number;
  criticalFailures: number;
  flakyTests: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  defectDensity: number;
  mttr: number; // Mean Time To Recovery
  changeFailureRate: number;
}

export interface RiskAssessment {
  category: 'technical' | 'business' | 'security' | 'performance';
  risk: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
}

export interface ReleaseBlocker {
  id: string;
  type: 'test_failure' | 'security_vuln' | 'performance_regression' | 'critical_bug' | 'compliance';
  severity: 'critical' | 'high';
  description: string;
  ticketId?: string;
  autoResolvable: boolean;
}

export interface AutoRemediation {
  id: string;
  type: RemediationType;
  status: 'detected' | 'analyzing' | 'executing' | 'completed' | 'failed' | 'rolled_back';
  issue: DetectedIssue;
  actions: RemediationAction[];
  validation: ValidationResult;
  rollbackAvailable: boolean;
}

export interface DetectedIssue {
  id: string;
  type: 'test_failure' | 'performance_regression' | 'security_vuln' | 'config_drift';
  source: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  context: Record<string, unknown>;
}

export interface RemediationAction {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executedAt?: Date;
  result?: unknown;
  rollbackData?: unknown;
}

export interface FlakyTestAnalysis {
  testId: string;
  flakinessScore: number;
  pattern: 'timing' | 'order_dependency' | 'external_dependency' | 'data_dependency' | 'environment' | 'unknown';
  occurrences: FlakyOccurrence[];
  rootCause?: string;
  suggestedFix?: string;
}

export interface FlakyOccurrence {
  timestamp: Date;
  environment: string;
  previousResult: TestStatus;
  currentResult: TestStatus;
  diff?: string;
}

export interface TestGenerationConfig {
  target: string;
  type: TestType;
  coverage: 'high' | 'medium' | 'low';
  priority: 'critical' | 'high' | 'medium' | 'low';
  existingTests: string[];
  constraints: string[];
}

export interface GeneratedTest {
  id: string;
  name: string;
  code: string;
  coverage: number;
  confidence: number;
  similarTo?: string[];
  validationStatus: 'pending' | 'valid' | 'invalid';
}
