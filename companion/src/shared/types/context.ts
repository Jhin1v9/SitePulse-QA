/**
 * TIPOS DO CONTEXT ENGINE v3.0 Supremo
 */

import { Identifiable, Timestamped, HealthStatus } from './engine-base';

// ============================================================================
// CONTEXTO SUPREMO
// ============================================================================

export interface SupremeContext extends Identifiable, Timestamped {
  temporal: TemporalContext;
  spatial: SpatialContext;
  business: BusinessContext;
  technical: TechnicalContext;
  user: UserContext;
  predictive: PredictiveContext;
}

// ============================================================================
// CONTEXTO TEMPORAL
// ============================================================================

export interface TemporalContext {
  currentTime: Date;
  timezone: string;
  businessHours: BusinessHours;
  maintenanceWindows: MaintenanceWindow[];
  historicalPatterns: TemporalPattern[];
  upcomingEvents: ScheduledEvent[];
}

export interface BusinessHours {
  timezone: string;
  workDays: number[]; // 0-6 (Sunday-Saturday)
  workHours: { start: string; end: string };
  holidays: Date[];
}

export interface MaintenanceWindow {
  id: string;
  start: Date;
  end: Date;
  type: 'planned' | 'emergency' | 'routine';
  impact: 'none' | 'low' | 'medium' | 'high';
  description: string;
}

export interface TemporalPattern {
  pattern: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  peakTimes: string[];
  lowTimes: string[];
  confidence: number;
}

export interface ScheduledEvent {
  id: string;
  name: string;
  scheduledTime: Date;
  type: string;
  impact: 'none' | 'low' | 'medium' | 'high';
}

// ============================================================================
// CONTEXTO ESPACIAL
// ============================================================================

export interface SpatialContext {
  targetLocation: GeoLocation;
  userLocation: GeoLocation;
  cdnLocations: CDNLocation[];
  dataCenterRegions: string[];
  latencyMap: LatencyMap;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  coordinates: { lat: number; lng: number };
  timezone: string;
}

export interface CDNLocation {
  provider: string;
  location: GeoLocation;
  health: HealthStatus;
}

export interface LatencyMap {
  [region: string]: {
    latency: number;
    packetLoss: number;
    jitter: number;
  };
}

// ============================================================================
// CONTEXTO DE NEGÓCIO
// ============================================================================

export interface BusinessContext {
  revenue: RevenueMetrics;
  users: UserMetrics;
  transactions: TransactionMetrics;
  criticalFlows: CriticalFlow[];
  slaTargets: SLATargets;
  riskFactors: RiskFactor[];
}

export interface RevenueMetrics {
  revenuePerMinute: number;
  revenuePerHour: number;
  revenuePerDay: number;
  currency: string;
  trend: 'up' | 'down' | 'stable';
}

export interface UserMetrics {
  activeUsers: number;
  concurrentUsers: number;
  newUsers: number;
  returningUsers: number;
  churnRisk: number;
  vipUsers: number;
}

export interface TransactionMetrics {
  checkoutsPerHour: number;
  cartAbandonmentRate: number;
  averageOrderValue: number;
  conversionRate: number;
}

export interface CriticalFlow {
  name: string;
  path: string[];
  revenueImpact: number;
  userImpact: number;
  currentStatus: 'healthy' | 'degraded' | 'failing';
}

export interface SLATargets {
  availability: number; // percentage
  responseTime: number; // ms
  errorRate: number; // percentage
  currentStatus: 'meeting' | 'at_risk' | 'breached';
}

export interface RiskFactor {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  potentialImpact: string;
  mitigationStatus: string;
}

// ============================================================================
// CONTEXTO TÉCNICO
// ============================================================================

export interface TechnicalContext {
  infrastructure?: InfrastructureState;
  dependencies?: DependencyGraph;
  dataFlows?: DataFlow[];
  networkTopology?: NetworkTopology;
  securityPosture?: SecurityPosture;
  recentChanges?: ChangeEvent[];
}

export interface InfrastructureState {
  loadBalancers: LoadBalancer[];
  appServers: Server[];
  databases: Database[];
  cacheLayer: CacheStatus;
  cdn: CDNStatus;
  overallHealth: HealthStatus;
}

export interface LoadBalancer {
  id: string;
  name: string;
  healthy: boolean;
  activeConnections: number;
  throughput: number;
  algorithm: string;
}

export interface Server {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  cpu: number;
  memory: number;
  disk: number;
  requestsPerSecond: number;
  errorRate: number;
  region: string;
}

export interface Database {
  id: string;
  name: string;
  type: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  replicationLag: number;
  connections: number;
  slowQueries: number;
  diskUsage: number;
}

export interface CacheStatus {
  type: 'redis' | 'memcached' | 'custom';
  hitRate: number;
  memoryUsage: number;
  evictions: number;
  connections: number;
}

export interface CDNStatus {
  provider: string;
  hitRate: number;
  bandwidth: number;
  cacheInvalidations: number;
  errors: number;
}

export interface DependencyGraph {
  services: ServiceDependency[];
  externalApis: ExternalAPI[];
  databases: DatabaseDependency[];
  messageQueues: MessageQueue[];
}

export interface ServiceDependency {
  name: string;
  version: string;
  health: HealthStatus;
  latency: number;
  errorRate: number;
  critical: boolean;
}

export interface ExternalAPI {
  name: string;
  endpoint: string;
  health: HealthStatus;
  quotaRemaining: number;
  averageLatency: number;
}

export interface DatabaseDependency {
  name: string;
  type: string;
  health: HealthStatus;
  connectionPoolUsage: number;
}

export interface MessageQueue {
  name: string;
  type: string;
  messageCount: number;
  consumerLag: number;
  health: HealthStatus;
}

export interface DataFlow {
  source: string;
  destination: string;
  protocol: string;
  volume: number;
  latency: number;
  encryption: boolean;
  piiInvolved: boolean;
}

export interface NetworkTopology {
  segments: NetworkSegment[];
  firewalls: FirewallRule[];
  vpns: VPNConnection[];
  dmz: DMZConfig;
}

export interface NetworkSegment {
  name: string;
  cidr: string;
  vlan: number;
  purpose: string;
  trafficVolume: number;
}

export interface FirewallRule {
  id: string;
  source: string;
  destination: string;
  port: string;
  action: 'allow' | 'deny';
  hits: number;
}

export interface VPNConnection {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  peers: string[];
  traffic: number;
}

export interface DMZConfig {
  publicIPs: string[];
  exposedServices: string[];
  wafEnabled: boolean;
  ddosProtection: boolean;
}

export interface SecurityPosture {
  vulnerabilities: VulnerabilitySummary;
  certificates: CertificateStatus[];
  accessControls: AccessControlStatus;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAudit: Date;
}

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  lastScan: Date;
}

export interface CertificateStatus {
  domain: string;
  issuer: string;
  expiry: Date;
  daysRemaining: number;
  valid: boolean;
}

export interface AccessControlStatus {
  privilegedUsers: number;
  activeSessions: number;
  failedLogins: number;
  mfaAdoption: number;
}

export interface ChangeEvent {
  id: string;
  timestamp: Date;
  type: 'deployment' | 'config_change' | 'infrastructure' | 'security';
  description: string;
  author: string;
  impact: 'none' | 'low' | 'medium' | 'high';
  rollbackAvailable: boolean;
}

// ============================================================================
// CONTEXTO DO USUÁRIO
// ============================================================================

export interface UserContext {
  profile: ContextUserProfile;
  currentJourney: UserJourney;
  recentActions: UserAction[];
  preferences: ContextUserPreferences;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  permissions: string[];
}

export interface ContextUserProfile {
  userId: string;
  displayName: string;
  email: string;
  role: string;
  department: string;
  timezone: string;
}

export interface UserJourney {
  currentStep: string;
  completedSteps: string[];
  pendingSteps: string[];
  goal: string;
  estimatedCompletion: Date;
}

export interface UserAction {
  timestamp: Date;
  action: string;
  target: string;
  result: 'success' | 'failure' | 'pending';
  duration: number;
}

export interface ContextUserPreferences {
  notificationChannels: string[];
  dashboardLayout: string;
  defaultView: string;
  autoRefresh: boolean;
  theme: 'light' | 'dark' | 'system';
}

// ============================================================================
// CONTEXTO PREDITIVO
// ============================================================================

export interface PredictiveContext {
  loadForecast: LoadForecast;
  failurePredictions: FailurePrediction[];
  securityThreats: ThreatPrediction[];
  userBehavior: BehaviorPrediction[];
  recommendedActions: RecommendedAction[];
}

export interface LoadForecast {
  nextHour: number;
  nextDay: number;
  nextWeek: number;
  confidence: number;
  peakTimes: Date[];
}

export interface FailurePrediction {
  component: string;
  probability: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendedAction?: string;
}

export interface ThreatPrediction {
  threatType: string;
  probability: number;
  target: string;
  indicators: string[];
  mitigationSuggestions: string[];
}

export interface BehaviorPrediction {
  userSegment: string;
  predictedAction: string;
  probability: number;
  businessImpact: string;
}

export interface RecommendedAction {
  action: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedBenefit: string;
  estimatedEffort: string;
  confidence: number;
}

// ============================================================================
// API DO CONTEXT ENGINE
// ============================================================================

export interface ContextEngineAPI {
  buildFullContext(target: Target): Promise<SupremeContext>;
  updateContext(contextId: string, updates: Partial<SupremeContext>): Promise<SupremeContext>;
  getRealTimeContext(contextId: string): Promise<LiveContext>;
  subscribeToContextChanges(contextId: string, callback: (update: ContextUpdate) => void): void;
}

export interface Target {
  id: string;
  url: string;
  name: string;
  type: 'web' | 'api' | 'mobile' | 'desktop' | 'cloud';
  scope: 'single' | 'subdomain' | 'domain' | 'full';
}

export interface LiveContext {
  timestamp: Date;
  metrics: LiveMetrics;
  alerts: Alert[];
  events: ContextSystemEvent[];
}

export interface LiveMetrics {
  rps: number;
  latencyP95: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  source: string;
  timestamp: Date;
}

export interface ContextSystemEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: unknown;
}

export interface ContextUpdate {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: Date;
  source: string;
  correlationId?: string;
}

export interface SystemTopology {
  id: string;
  name: string;
  nodes?: TopologyNode[];
  connections?: TopologyConnection[];
  infrastructure?: InfrastructureState;
  dependencies?: DependencyGraph;
  dataFlows?: DataFlow[];
  networkTopology?: NetworkTopology;
  securityPosture?: SecurityPosture;
  recentChanges?: ChangeEvent[];
}

export interface TopologyNode {
  id: string;
  type: 'server' | 'database' | 'cache' | 'cdn' | 'loadbalancer';
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

export interface TopologyConnection {
  from: string;
  to: string;
  type: 'http' | 'https' | 'tcp' | 'udp';
  latency: number;
}
