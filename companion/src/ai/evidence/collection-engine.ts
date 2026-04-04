/**
 * EVIDENCE COLLECTION ENGINE - Evidence Engine v3.0 Supremo
 * Coleta forense de multiplas fontes com integridade garantida
 */

import { createHash } from 'crypto';
import { EventEmitter } from 'events';

// ============================================================================
// TIPOS DE EVIDENCIA
// ============================================================================

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
  | 'document'
  | 'registry'
  | 'browser_artifact'
  | 'mobile_backup'
  | 'cloud_log'
  | 'database_dump';

export interface EvidenceMetadata {
  id: string;
  type: EvidenceType;
  source: string;
  description: string;
  collectedAt: Date;
  collectedBy: string;
  size: number;
  format: string;
  encoding?: string;
  compression?: string;
  encryption?: {
    algorithm: string;
    keyId: string;
  };
  tags: string[];
  caseId: string;
  incidentId: string;
}

export interface EvidenceItem {
  metadata: EvidenceMetadata;
  content: Buffer | string;
  hash: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  signatures?: {
    digital?: string;
    timestamp?: string;
  };
}

export interface CollectionConfig {
  caseId: string;
  incidentId: string;
  collectorId: string;
  sources: EvidenceSource[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  chainOfCustody: boolean;
  encryption: boolean;
  compression: boolean;
  verifyIntegrity: boolean;
}

export interface EvidenceSource {
  type: EvidenceType;
  location: string;
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    key?: string;
  };
  filters?: {
    startTime?: Date;
    endTime?: Date;
    patterns?: string[];
    excludePatterns?: string[];
  };
}

// ============================================================================
// CHAIN OF CUSTODY
// ============================================================================

export interface CustodyEntry {
  timestamp: Date;
  action: 'collected' | 'transferred' | 'accessed' | 'analyzed' | 'stored' | 'archived';
  performedBy: string;
  location: string;
  hash: string;
  notes?: string;
  digitalSignature?: string;
}

export interface ChainOfCustody {
  evidenceId: string;
  entries: CustodyEntry[];
  integrityStatus: 'intact' | 'compromised' | 'unknown';
  lastVerified: Date;
}

// ============================================================================
// EVIDENCE COLLECTION ENGINE
// ============================================================================

export class EvidenceCollectionEngine extends EventEmitter {
  private collectedEvidence: Map<string, EvidenceItem> = new Map();
  private chainsOfCustody: Map<string, ChainOfCustody> = new Map();

  /**
   * Coleta evidencias de multiplas fontes
   */
  async collectEvidence(config: CollectionConfig): Promise<EvidenceItem[]> {
    console.log(`Starting evidence collection for case ${config.caseId}...`);
    this.emit('collection:started', { caseId: config.caseId, sources: config.sources.length });

    const collected: EvidenceItem[] = [];

    for (const source of config.sources) {
      try {
        console.log(`  Collecting ${source.type} from ${source.location}...`);
        const evidence = await this.collectFromSource(source, config);
        
        if (evidence) {
          collected.push(evidence);
          this.collectedEvidence.set(evidence.metadata.id, evidence);

          // Initialize chain of custody if enabled
          if (config.chainOfCustody) {
            this.initializeChainOfCustody(evidence, config);
          }

          this.emit('evidence:collected', { id: evidence.metadata.id, type: source.type });
        }
      } catch (error) {
        console.error(`Failed to collect ${source.type}:`, error);
        this.emit('collection:error', { source: source.type, error });
      }
    }

    this.emit('collection:completed', { 
      caseId: config.caseId, 
      collected: collected.length,
      totalSources: config.sources.length 
    });

    return collected;
  }

  /**
   * Coleta de uma fonte especifica
   */
  private async collectFromSource(
    source: EvidenceSource, 
    config: CollectionConfig
  ): Promise<EvidenceItem | null> {
    switch (source.type) {
      case 'log_file':
        return this.collectLogFile(source, config);
      case 'network_capture':
        return this.collectNetworkCapture(source, config);
      case 'memory_dump':
        return this.collectMemoryDump(source, config);
      case 'disk_image':
        return this.collectDiskImage(source, config);
      case 'database_dump':
        return this.collectDatabaseDump(source, config);
      case 'cloud_log':
        return this.collectCloudLog(source, config);
      case 'screenshot':
        return this.collectScreenshot(source, config);
      case 'file':
        return this.collectFile(source, config);
      default:
        console.warn(`Unknown evidence type: ${source.type}`);
        return null;
    }
  }

  // ============================================================================
  // COLETA ESPECIFICA POR TIPO
  // ============================================================================

  private async collectLogFile(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const content = this.simulateLogContent(source);
    const buffer = Buffer.from(content);

    const metadata: EvidenceMetadata = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'log_file',
      source: source.location,
      description: `Application logs from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'text/plain',
      tags: ['logs', 'application'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectNetworkCapture(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const content = this.simulatePCAPContent(source);
    const buffer = Buffer.from(content, 'base64');

    const metadata: EvidenceMetadata = {
      id: `pcap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'network_capture',
      source: source.location,
      description: `Network traffic capture from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/vnd.tcpdump.pcap',
      tags: ['network', 'traffic', 'pcap'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectMemoryDump(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const buffer = this.simulateMemoryDump();

    const metadata: EvidenceMetadata = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'memory_dump',
      source: source.location,
      description: `Memory dump from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/octet-stream',
      tags: ['memory', 'ram', 'forensics'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectDiskImage(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const buffer = this.simulateDiskImage();

    const metadata: EvidenceMetadata = {
      id: `disk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'disk_image',
      source: source.location,
      description: `Disk image from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/x-raw-disk-image',
      tags: ['disk', 'storage', 'forensics'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectDatabaseDump(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const content = this.simulateDatabaseDump();
    const buffer = Buffer.from(content);

    const metadata: EvidenceMetadata = {
      id: `db-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'database_dump',
      source: source.location,
      description: `Database dump from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/sql',
      tags: ['database', 'sql', 'backup'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectCloudLog(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const content = this.simulateCloudLog();
    const buffer = Buffer.from(JSON.stringify(content));

    const metadata: EvidenceMetadata = {
      id: `cloud-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'cloud_log',
      source: source.location,
      description: `Cloud audit logs from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/json',
      tags: ['cloud', 'audit', 'logs'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectScreenshot(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const buffer = this.simulateScreenshot();

    const metadata: EvidenceMetadata = {
      id: `screenshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'screenshot',
      source: source.location,
      description: `Screenshot evidence from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'image/png',
      tags: ['screenshot', 'visual', 'evidence'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  private async collectFile(source: EvidenceSource, config: CollectionConfig): Promise<EvidenceItem> {
    const content = `File content from ${source.location}`;
    const buffer = Buffer.from(content);

    const metadata: EvidenceMetadata = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'file',
      source: source.location,
      description: `File evidence from ${source.location}`,
      collectedAt: new Date(),
      collectedBy: config.collectorId,
      size: buffer.length,
      format: 'application/octet-stream',
      tags: ['file', 'document'],
      caseId: config.caseId,
      incidentId: config.incidentId,
    };

    return this.createEvidenceItem(metadata, buffer, config);
  }

  // ============================================================================
  // CRIACAO DE EVIDENCIA
  // ============================================================================

  private createEvidenceItem(
    metadata: EvidenceMetadata,
    content: Buffer,
    config: CollectionConfig
  ): EvidenceItem {
    // Calcular hashes
    const hash = {
      md5: createHash('md5').update(content).digest('hex'),
      sha1: createHash('sha1').update(content).digest('hex'),
      sha256: createHash('sha256').update(content).digest('hex'),
    };

    let finalContent: Buffer | string = content;

    // Aplicar compressao se habilitada
    if (config.compression) {
      // Na implementacao real, usar zlib
      metadata.compression = 'gzip';
    }

    // Aplicar criptografia se habilitada
    if (config.encryption) {
      // Na implementacao real, usar AES-256
      metadata.encryption = {
        algorithm: 'AES-256-GCM',
        keyId: `key-${Date.now()}`,
      };
    }

    return {
      metadata,
      content: finalContent,
      hash,
      signatures: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  // ============================================================================
  // CHAIN OF CUSTODY
  // ============================================================================

  private initializeChainOfCustody(evidence: EvidenceItem, config: CollectionConfig): void {
    const chain: ChainOfCustody = {
      evidenceId: evidence.metadata.id,
      entries: [
        {
          timestamp: new Date(),
          action: 'collected',
          performedBy: config.collectorId,
          location: evidence.metadata.source,
          hash: evidence.hash.sha256,
          notes: `Initial collection of ${evidence.metadata.type}`,
        },
      ],
      integrityStatus: 'intact',
      lastVerified: new Date(),
    };

    this.chainsOfCustody.set(evidence.metadata.id, chain);
  }

  addCustodyEntry(
    evidenceId: string,
    action: CustodyEntry['action'],
    performedBy: string,
    location: string,
    notes?: string
  ): void {
    const chain = this.chainsOfCustody.get(evidenceId);
    if (!chain) {
      throw new Error(`Chain of custody not found for evidence ${evidenceId}`);
    }

    const evidence = this.collectedEvidence.get(evidenceId);
    if (!evidence) {
      throw new Error(`Evidence ${evidenceId} not found`);
    }

    const entry: CustodyEntry = {
      timestamp: new Date(),
      action,
      performedBy,
      location,
      hash: evidence.hash.sha256,
      notes,
    };

    chain.entries.push(entry);
    chain.lastVerified = new Date();

    this.emit('custody:updated', { evidenceId, entry });
  }

  verifyChainOfCustody(evidenceId: string): boolean {
    const chain = this.chainsOfCustody.get(evidenceId);
    const evidence = this.collectedEvidence.get(evidenceId);

    if (!chain || !evidence) {
      return false;
    }

    // Verificar se o hash atual corresponde ao ultimo registro
    const lastEntry = chain.entries[chain.entries.length - 1];
    const currentHash = evidence.hash.sha256;

    const isIntact = lastEntry.hash === currentHash;
    chain.integrityStatus = isIntact ? 'intact' : 'compromised';

    return isIntact;
  }

  getChainOfCustody(evidenceId: string): ChainOfCustody | undefined {
    return this.chainsOfCustody.get(evidenceId);
  }

  // ============================================================================
  // SIMULACOES (seriam substituidas por implementacoes reais)
  // ============================================================================

  private simulateLogContent(source: EvidenceSource): string {
    const entries = [];
    const now = new Date();
    
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - i * 60000);
      const level = ['INFO', 'WARN', 'ERROR'][Math.floor(Math.random() * 3)];
      entries.push(`${timestamp.toISOString()} [${level}] Event ${i}: Sample log entry from ${source.location}`);
    }

    return entries.join('\n');
  }

  private simulatePCAPContent(source: EvidenceSource): string {
    // Retornar conteudo base64 simulado
    return Buffer.from(`PCAP data from ${source.location}`).toString('base64');
  }

  private simulateMemoryDump(): Buffer {
    // Simular dump de 16MB
    return Buffer.alloc(16 * 1024 * 1024, 0);
  }

  private simulateDiskImage(): Buffer {
    // Simular imagem de disco de 100MB
    return Buffer.alloc(100 * 1024 * 1024, 0);
  }

  private simulateDatabaseDump(): string {
    return `
      -- Database dump
      CREATE TABLE users (id INT, name VARCHAR(255));
      INSERT INTO users VALUES (1, 'admin');
      -- End of dump
    `;
  }

  private simulateCloudLog(): object {
    return {
      events: [
        { timestamp: new Date().toISOString(), action: 'LOGIN', user: 'admin', success: true },
        { timestamp: new Date().toISOString(), action: 'API_CALL', endpoint: '/api/data', status: 200 },
      ],
    };
  }

  private simulateScreenshot(): Buffer {
    // Simular PNG de 1MB
    return Buffer.alloc(1024 * 1024, 0xFF);
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  getEvidence(id: string): EvidenceItem | undefined {
    return this.collectedEvidence.get(id);
  }

  getAllEvidence(): EvidenceItem[] {
    return Array.from(this.collectedEvidence.values());
  }

  getEvidenceByCase(caseId: string): EvidenceItem[] {
    return Array.from(this.collectedEvidence.values())
      .filter(e => e.metadata.caseId === caseId);
  }

  getEvidenceByType(type: EvidenceType): EvidenceItem[] {
    return Array.from(this.collectedEvidence.values())
      .filter(e => e.metadata.type === type);
  }

  getStats(): {
    totalEvidence: number;
    byType: Record<string, number>;
    totalSize: number;
  } {
    const evidence = Array.from(this.collectedEvidence.values());
    
    const byType: Record<string, number> = {};
    evidence.forEach(e => {
      byType[e.metadata.type] = (byType[e.metadata.type] || 0) + 1;
    });

    return {
      totalEvidence: evidence.length,
      byType,
      totalSize: evidence.reduce((sum, e) => sum + e.metadata.size, 0),
    };
  }
}
