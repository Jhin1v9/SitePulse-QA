// SitePulse V3 — Security Module Exports

export { AttackSurfaceAnalyzer, getAttackSurfaceAnalyzer } from './attack-surface.js';
export { 
  VulnerabilityDNA, 
  getVulnerabilityDNA, 
  VULNERABILITY_SIGNATURES,
  type VulnerabilitySignature,
  type MatchResult 
} from './vulnerability-dna.js';
