/**
 * Unit Tests - Evidence Engine v3.0 Supremo
 */

import { EvidenceEngineSupremo } from '../../src/ai/evidence';
import type { CollectionConfig } from '../../src/ai/evidence/collection-engine';

describe('EvidenceEngineSupremo', () => {
  let engine: EvidenceEngineSupremo;

  beforeEach(async () => {
    engine = new EvidenceEngineSupremo();
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(engine.name).toBe('EvidenceEngineSupremo');
      expect(engine.version).toBe('3.0.0');
    });

    it('should start with ready status', async () => {
      expect(engine.status).toBe('ready');
    });

    it('should have all components operational', async () => {
      const health = await engine.health();
      expect(health.checks).toHaveLength(3);
      expect(health.checks.every(c => c.status === 'pass')).toBe(true);
    });
  });

  describe('Evidence Collection', () => {
    it('should collect evidence from multiple sources', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-001',
        incidentId: 'INC-001',
        collectorId: 'analyst-john',
        sources: [
          { type: 'log_file', location: '/var/log/app.log' },
          { type: 'network_capture', location: '/captures/traffic.pcap' },
          { type: 'file', location: '/suspicious/file.exe' },
        ],
        priority: 'high',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const evidence = await engine.collectEvidence(config);

      expect(evidence).toBeInstanceOf(Array);
      expect(evidence.length).toBeGreaterThan(0);
    });

    it('should calculate hashes for evidence', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-002',
        incidentId: 'INC-002',
        collectorId: 'analyst-jane',
        sources: [{ type: 'file', location: '/test/file.txt' }],
        priority: 'medium',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const evidence = await engine.collectEvidence(config);

      expect(evidence[0].hash).toHaveProperty('md5');
      expect(evidence[0].hash).toHaveProperty('sha1');
      expect(evidence[0].hash).toHaveProperty('sha256');
    });

    it('should initialize chain of custody', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-003',
        incidentId: 'INC-003',
        collectorId: 'analyst-mike',
        sources: [{ type: 'log_file', location: '/var/log/syslog' }],
        priority: 'critical',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const evidence = await engine.collectEvidence(config);
      const chain = engine.getCollectionEngine().getChainOfCustody(evidence[0].metadata.id);

      expect(chain).toBeDefined();
      expect(chain?.entries.length).toBeGreaterThan(0);
      expect(chain?.integrityStatus).toBe('intact');
    });
  });

  describe('Timeline Reconstruction', () => {
    it('should build timeline from evidence', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-004',
        incidentId: 'INC-004',
        collectorId: 'analyst-sarah',
        sources: [
          { type: 'log_file', location: '/var/log/app.log' },
          { type: 'cloud_log', location: 'cloudtrail' },
        ],
        priority: 'high',
        chainOfCustody: false,
        encryption: false,
        compression: false,
        verifyIntegrity: false,
      };

      const evidence = await engine.collectEvidence(config);
      const timeline = await engine.buildTimeline(evidence);

      expect(timeline).toHaveProperty('events');
      expect(timeline).toHaveProperty('gaps');
      expect(timeline).toHaveProperty('correlations');
      expect(timeline).toHaveProperty('attackPhases');
      expect(timeline).toHaveProperty('statistics');
    });

    it('should detect gaps in timeline', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-005',
        incidentId: 'INC-005',
        collectorId: 'analyst-tom',
        sources: [{ type: 'log_file', location: '/var/log/gaps.log' }],
        priority: 'medium',
        chainOfCustody: false,
        encryption: false,
        compression: false,
        verifyIntegrity: false,
      };

      const evidence = await engine.collectEvidence(config);
      const timeline = await engine.buildTimeline(evidence);

      expect(timeline.gaps).toBeInstanceOf(Array);
    });

    it('should correlate events', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-006',
        incidentId: 'INC-006',
        collectorId: 'analyst-lisa',
        sources: [
          { type: 'log_file', location: '/var/log/app.log' },
          { type: 'network_capture', location: '/captures/net.pcap' },
        ],
        priority: 'high',
        chainOfCustody: false,
        encryption: false,
        compression: false,
        verifyIntegrity: false,
      };

      const evidence = await engine.collectEvidence(config);
      const timeline = await engine.buildTimeline(evidence);

      expect(timeline.correlations).toBeInstanceOf(Array);
    });
  });

  describe('Malware Analysis', () => {
    it('should perform static analysis', async () => {
      const sample = Buffer.alloc(1024, 0x90); // NOP sled simulado
      const result = await engine.analyzeMalware(sample, 'test-sample.exe');

      expect(result).toHaveProperty('static');
      expect(result.static).toHaveProperty('hashes');
      expect(result.static).toHaveProperty('fileInfo');
      expect(result.static).toHaveProperty('classification');
    });

    it('should calculate file entropy', async () => {
      const sample = Buffer.alloc(1024, 0x90);
      const result = await engine.analyzeMalware(sample, 'test.exe');

      expect(result.static.fileInfo.entropy).toBeGreaterThanOrEqual(0);
      expect(result.static.fileInfo.entropy).toBeLessThanOrEqual(8);
    });

    it('should classify malware type', async () => {
      // Sample com strings de ransomware
      const sample = Buffer.from('CryptEncrypt ransom bitcoin payment', 'utf8');
      const result = await engine.analyzeMalware(sample, 'ransomware.exe');

      expect(result.static.classification).toHaveProperty('type');
      expect(result.static.classification.confidence).toBeGreaterThan(0);
    });

    it('should extract IOCs', async () => {
      const sample = Buffer.from('Connect to 192.168.1.1 or evil.com for C2', 'utf8');
      const result = await engine.analyzeMalware(sample, 'trojan.exe');

      expect(result.static.indicators.length).toBeGreaterThan(0);
    });

    it('should calculate threat score', async () => {
      const sample = Buffer.from('CryptEncrypt CreateRemoteThread', 'utf8');
      const result = await engine.analyzeMalware(sample, 'malware.exe');

      expect(result.threatScore).toBeGreaterThanOrEqual(0);
      expect(result.threatScore).toBeLessThanOrEqual(100);
    });

    it('should provide recommendations', async () => {
      const sample = Buffer.from('CryptEncrypt', 'utf8');
      const result = await engine.analyzeMalware(sample, 'suspected.exe');

      expect(result.recommendations).toBeInstanceOf(Array);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Chain of Custody', () => {
    it('should add custody entries', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-007',
        incidentId: 'INC-007',
        collectorId: 'analyst-alex',
        sources: [{ type: 'file', location: '/evidence/file.bin' }],
        priority: 'high',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const evidence = await engine.collectEvidence(config);
      const evidenceId = evidence[0].metadata.id;

      engine.addCustodyEntry(
        evidenceId,
        'transferred',
        'forensic-lab',
        'Lab Storage Room A',
        'Transferred for analysis'
      );

      const chain = engine.getCollectionEngine().getChainOfCustody(evidenceId);
      expect(chain?.entries.length).toBe(2);
    });

    it('should verify chain integrity', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-008',
        incidentId: 'INC-008',
        collectorId: 'analyst-emma',
        sources: [{ type: 'file', location: '/evidence/data.bin' }],
        priority: 'high',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const evidence = await engine.collectEvidence(config);
      const isIntact = engine.verifyChainOfCustody(evidence[0].metadata.id);

      expect(isIntact).toBe(true);
    });
  });

  describe('Complete Forensic Analysis', () => {
    it('should perform full forensic analysis', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-009',
        incidentId: 'INC-009',
        collectorId: 'analyst-david',
        sources: [
          { type: 'log_file', location: '/var/log/secure' },
          { type: 'file', location: '/malware/sample.exe' },
        ],
        priority: 'critical',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const result = await engine.performForensicAnalysis(config);

      expect(result).toHaveProperty('caseId');
      expect(result).toHaveProperty('evidence');
      expect(result).toHaveProperty('timeline');
      expect(result).toHaveProperty('findings');
      expect(result).toHaveProperty('report');
    });

    it('should generate forensic report', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-010',
        incidentId: 'INC-010',
        collectorId: 'analyst-sophia',
        sources: [{ type: 'log_file', location: '/var/log/auth.log' }],
        priority: 'high',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const result = await engine.performForensicAnalysis(config);

      expect(result.report).toHaveProperty('executiveSummary');
      expect(result.report).toHaveProperty('technicalDetails');
      expect(result.report).toHaveProperty('legalCompliance');
      expect(result.report.legalCompliance).toHaveProperty('chainOfCustodyIntact');
      expect(result.report.legalCompliance).toHaveProperty('admissible');
    });

    it('should generate findings', async () => {
      const config: CollectionConfig = {
        caseId: 'CASE-2024-011',
        incidentId: 'INC-011',
        collectorId: 'analyst-ryan',
        sources: [
          { type: 'log_file', location: '/var/log/errors.log' },
          { type: 'network_capture', location: '/captures/suspicious.pcap' },
        ],
        priority: 'critical',
        chainOfCustody: true,
        encryption: false,
        compression: false,
        verifyIntegrity: true,
      };

      const result = await engine.performForensicAnalysis(config);

      expect(result.findings).toBeInstanceOf(Array);
    });
  });

  describe('Event Emission', () => {
    it('should emit evidence collected event', (done) => {
      engine.on('evidence:collected', (data) => {
        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('type');
        done();
      });

      const config: CollectionConfig = {
        caseId: 'CASE-2024-012',
        incidentId: 'INC-012',
        collectorId: 'analyst-olivia',
        sources: [{ type: 'file', location: '/test.txt' }],
        priority: 'low',
        chainOfCustody: false,
        encryption: false,
        compression: false,
        verifyIntegrity: false,
      };

      engine.collectEvidence(config);
    });
  });

  describe('Metrics', () => {
    it('should track metrics', async () => {
      const initialMetrics = engine.getMetrics();

      const config: CollectionConfig = {
        caseId: 'CASE-2024-013',
        incidentId: 'INC-013',
        collectorId: 'analyst-jack',
        sources: [{ type: 'file', location: '/metric.txt' }],
        priority: 'low',
        chainOfCustody: false,
        encryption: false,
        compression: false,
        verifyIntegrity: false,
      };

      await engine.performForensicAnalysis(config);

      const finalMetrics = engine.getMetrics();
      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
    });
  });
});
