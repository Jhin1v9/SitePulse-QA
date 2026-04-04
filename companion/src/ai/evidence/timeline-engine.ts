/**
 * TIMELINE ENGINE - Evidence Engine v3.0 Supremo
 * Reconstrucao de timeline e analise de eventos
 */

import { EventEmitter } from 'events';
import { EvidenceItem } from './collection-engine';

// ============================================================================
// TIPOS DE EVENTOS DE TIMELINE
// ============================================================================

export interface TimelineEvent {
  id: string;
  timestamp: Date;
  type: 'file_access' | 'network' | 'process' | 'registry' | 'log' | 'user_action' | 'system';
  source: string;
  description: string;
  details: Record<string, unknown>;
  evidenceIds: string[];
  entities: string[];
  confidence: number;
}

export interface TimelineGap {
  start: Date;
  end: Date;
  duration: number;
  possibleExplanation?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface EventCorrelation {
  sourceEventId: string;
  targetEventId: string;
  correlationType: 'causal' | 'temporal' | 'logical';
  strength: number;
  description: string;
}

export interface AttackPhase {
  name: string;
  startTime: Date;
  endTime: Date;
  events: TimelineEvent[];
  description: string;
  mitreTactic?: string;
  mitreTechnique?: string;
}

export interface SuperTimeline {
  events: TimelineEvent[];
  gaps: TimelineGap[];
  correlations: EventCorrelation[];
  attackPhases: AttackPhase[];
  statistics: {
    totalEvents: number;
    timeRange: { start: Date; end: Date };
    sources: string[];
    eventTypes: Record<string, number>;
  };
}

// ============================================================================
// TIMELINE ENGINE
// ============================================================================

export class TimelineEngine extends EventEmitter {
  private events: TimelineEvent[] = [];

  /**
   * Constroi super timeline a partir de evidencias
   */
  async buildTimeline(evidenceItems: EvidenceItem[]): Promise<SuperTimeline> {
    console.log(`Building timeline from ${evidenceItems.length} evidence items...`);
    this.emit('timeline:building', { evidenceCount: evidenceItems.length });

    // Extrair eventos de cada evidencia
    for (const evidence of evidenceItems) {
      const extractedEvents = await this.extractEvents(evidence);
      this.events.push(...extractedEvents);
    }

    // Ordenar por timestamp
    this.events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Detectar gaps
    const gaps = this.detectGaps();

    // Correlacionar eventos
    const correlations = this.correlateEvents();

    // Identificar fases de ataque
    const attackPhases = this.identifyAttackPhases();

    // Calcular estatisticas
    const statistics = this.calculateStatistics();

    const timeline: SuperTimeline = {
      events: this.events,
      gaps,
      correlations,
      attackPhases,
      statistics,
    };

    this.emit('timeline:completed', { 
      eventCount: timeline.events.length,
      gaps: timeline.gaps.length,
      correlations: timeline.correlations.length
    });

    return timeline;
  }

  /**
   * Extrai eventos de uma evidencia
   */
  private async extractEvents(evidence: EvidenceItem): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    switch (evidence.metadata.type) {
      case 'log_file':
        events.push(...this.extractFromLogFile(evidence));
        break;
      case 'network_capture':
        events.push(...this.extractFromNetworkCapture(evidence));
        break;
      case 'memory_dump':
        events.push(...this.extractFromMemoryDump(evidence));
        break;
      case 'file':
        events.push(...this.extractFromFile(evidence));
        break;
      case 'cloud_log':
        events.push(...this.extractFromCloudLog(evidence));
        break;
    }

    return events;
  }

  private extractFromLogFile(evidence: EvidenceItem): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    const content = evidence.content.toString();
    const lines = content.split('\n');

    for (const line of lines) {
      const timestamp = this.parseTimestamp(line);
      if (timestamp) {
        events.push({
          id: `event-${Date.now()}-${Math.random()}`,
          timestamp,
          type: 'log',
          source: evidence.metadata.source,
          description: line.substring(0, 200),
          details: { rawLine: line },
          evidenceIds: [evidence.metadata.id],
          entities: this.extractEntities(line),
          confidence: 0.9,
        });
      }
    }

    return events;
  }

  private extractFromNetworkCapture(evidence: EvidenceItem): TimelineEvent[] {
    // Simulacao: Na implementacao real, parseria PCAP
    return [
      {
        id: `net-${Date.now()}`,
        timestamp: new Date(),
        type: 'network',
        source: evidence.metadata.source,
        description: 'Network connection established',
        details: { protocol: 'TCP', srcPort: 12345, dstPort: 443 },
        evidenceIds: [evidence.metadata.id],
        entities: ['192.168.1.1', '93.184.216.34'],
        confidence: 0.95,
      },
    ];
  }

  private extractFromMemoryDump(evidence: EvidenceItem): TimelineEvent[] {
    // Simulacao: Na implementacao real, usaria Volatility
    return [
      {
        id: `mem-${Date.now()}`,
        timestamp: new Date(),
        type: 'process',
        source: evidence.metadata.source,
        description: 'Process found in memory',
        details: { pid: 1234, name: 'suspicious.exe' },
        evidenceIds: [evidence.metadata.id],
        entities: ['suspicious.exe'],
        confidence: 0.8,
      },
    ];
  }

  private extractFromFile(evidence: EvidenceItem): TimelineEvent[] {
    return [
      {
        id: `file-${Date.now()}`,
        timestamp: evidence.metadata.collectedAt,
        type: 'file_access',
        source: evidence.metadata.source,
        description: `File accessed: ${evidence.metadata.source}`,
        details: { size: evidence.metadata.size, hash: evidence.hash.sha256 },
        evidenceIds: [evidence.metadata.id],
        entities: [evidence.metadata.source],
        confidence: 0.95,
      },
    ];
  }

  private extractFromCloudLog(evidence: EvidenceItem): TimelineEvent[] {
    const events: TimelineEvent[] = [];
    
    try {
      const content = JSON.parse(evidence.content.toString());
      
      if (content.events && Array.isArray(content.events)) {
        for (const event of content.events) {
          events.push({
            id: `cloud-${Date.now()}-${Math.random()}`,
            timestamp: new Date(event.timestamp),
            type: 'user_action',
            source: evidence.metadata.source,
            description: `${event.action} by ${event.user}`,
            details: event,
            evidenceIds: [evidence.metadata.id],
            entities: [event.user],
            confidence: 0.95,
          });
        }
      }
    } catch (e) {
      // Ignorar parsing errors
    }

    return events;
  }

  // ============================================================================
  // DETECAO DE GAPS
  // ============================================================================

  private detectGaps(): TimelineGap[] {
    const gaps: TimelineGap[] = [];
    
    if (this.events.length < 2) return gaps;

    const threshold = 300000; // 5 minutos em ms

    for (let i = 1; i < this.events.length; i++) {
      const current = this.events[i];
      const previous = this.events[i - 1];

      const gap = current.timestamp.getTime() - previous.timestamp.getTime();

      if (gap > threshold) {
        gaps.push({
          start: previous.timestamp,
          end: current.timestamp,
          duration: gap,
          possibleExplanation: this.inferGapExplanation(previous, current),
          severity: gap > 900000 ? 'high' : gap > 600000 ? 'medium' : 'low',
        });
      }
    }

    return gaps;
  }

  private inferGapExplanation(before: TimelineEvent, after: TimelineEvent): string {
    if (before.type === 'log' && after.type === 'log') {
      return 'Possible log rotation or system downtime';
    }
    if (before.type === 'network' && after.source !== before.source) {
      return 'Network segment transition';
    }
    return 'Activity gap - further investigation needed';
  }

  // ============================================================================
  // CORRELACAO DE EVENTOS
  // ============================================================================

  private correlateEvents(): EventCorrelation[] {
    const correlations: EventCorrelation[] = [];

    for (let i = 0; i < this.events.length; i++) {
      for (let j = i + 1; j < this.events.length; j++) {
        const source = this.events[i];
        const target = this.events[j];

        const correlation = this.analyzeCorrelation(source, target);
        if (correlation) {
          correlations.push(correlation);
        }
      }
    }

    return correlations;
  }

  private analyzeCorrelation(source: TimelineEvent, target: TimelineEvent): EventCorrelation | null {
    const timeDiff = target.timestamp.getTime() - source.timestamp.getTime();
    
    // Correlacao temporal: eventos proximos no tempo
    if (timeDiff < 60000) { // 1 minuto
      // Verificar se sao do mesmo tipo ou relacionados
      if (this.areRelated(source, target)) {
        return {
          sourceEventId: source.id,
          targetEventId: target.id,
          correlationType: 'temporal',
          strength: Math.max(0, 1 - timeDiff / 60000),
          description: 'Events occurred in close temporal proximity',
        };
      }
    }

    // Correlacao causal: um evento parece causar o outro
    if (this.isLikelyCausal(source, target)) {
      return {
        sourceEventId: source.id,
        targetEventId: target.id,
        correlationType: 'causal',
        strength: 0.7,
        description: 'Possible causal relationship',
      };
    }

    return null;
  }

  private areRelated(event1: TimelineEvent, event2: TimelineEvent): boolean {
    // Mesma entidade
    const sharedEntities = event1.entities.filter(e => event2.entities.includes(e));
    if (sharedEntities.length > 0) return true;

    // Mesma origem
    if (event1.source === event2.source) return true;

    // Tipos relacionados
    const relatedTypes: Record<string, string[]> = {
      'network': ['file_access', 'process'],
      'log': ['user_action', 'system'],
    };

    return relatedTypes[event1.type]?.includes(event2.type) || false;
  }

  private isLikelyCausal(cause: TimelineEvent, effect: TimelineEvent): boolean {
    // Login -> File access
    if (cause.type === 'user_action' && cause.description.includes('LOGIN') &&
        effect.type === 'file_access') {
      return true;
    }

    // Network connection -> File download
    if (cause.type === 'network' && effect.type === 'file_access') {
      return true;
    }

    // Error -> Process termination
    if (cause.type === 'log' && cause.description.includes('ERROR') &&
        effect.type === 'process') {
      return true;
    }

    return false;
  }

  // ============================================================================
  // FASES DE ATAQUE
  // ============================================================================

  private identifyAttackPhases(): AttackPhase[] {
    const phases: AttackPhase[] = [];

    // Definir padroes de fases
    const phasePatterns = [
      {
        name: 'Initial Access',
        indicators: ['phishing', 'login', 'authentication'],
        mitreTactic: 'TA0001',
      },
      {
        name: 'Execution',
        indicators: ['process', 'command', 'script'],
        mitreTactic: 'TA0002',
      },
      {
        name: 'Persistence',
        indicators: ['registry', 'startup', 'service'],
        mitreTactic: 'TA0003',
      },
      {
        name: 'Data Exfiltration',
        indicators: ['upload', 'transfer', 'email'],
        mitreTactic: 'TA0010',
      },
    ];

    for (const pattern of phasePatterns) {
      const phaseEvents = this.events.filter(event =>
        pattern.indicators.some(indicator =>
          event.description.toLowerCase().includes(indicator) ||
          event.type.toLowerCase().includes(indicator)
        )
      );

      if (phaseEvents.length > 0) {
        phaseEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        phases.push({
          name: pattern.name,
          startTime: phaseEvents[0].timestamp,
          endTime: phaseEvents[phaseEvents.length - 1].timestamp,
          events: phaseEvents,
          description: `${pattern.name} phase with ${phaseEvents.length} events`,
          mitreTactic: pattern.mitreTactic,
        });
      }
    }

    return phases.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  // ============================================================================
  // ESTATISTICAS
  // ============================================================================

  private calculateStatistics(): SuperTimeline['statistics'] {
    const sources = [...new Set(this.events.map(e => e.source))];
    const eventTypes: Record<string, number> = {};

    this.events.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      timeRange: {
        start: this.events[0]?.timestamp || new Date(),
        end: this.events[this.events.length - 1]?.timestamp || new Date(),
      },
      sources,
      eventTypes,
    };
  }

  // ============================================================================
  // UTILITARIOS
  // ============================================================================

  private parseTimestamp(line: string): Date | null {
    // Tentar diferentes formatos de timestamp
    const patterns = [
      /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/,
      /(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/,
      /(\w{3}\s+\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4})/,
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  private extractEntities(text: string): string[] {
    const entities: string[] = [];

    // IPs
    const ipMatches = text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
    if (ipMatches) entities.push(...ipMatches);

    // Emails
    const emailMatches = text.match(/[\w.-]+@[\w.-]+\.\w+/g);
    if (emailMatches) entities.push(...emailMatches);

    // URLs
    const urlMatches = text.match(/https?:\/\/[^\s]+/g);
    if (urlMatches) entities.push(...urlMatches);

    return [...new Set(entities)];
  }

  // ============================================================================
  // FILTROS E BUSCA
  // ============================================================================

  filterByTimeRange(start: Date, end: Date): TimelineEvent[] {
    return this.events.filter(
      e => e.timestamp >= start && e.timestamp <= end
    );
  }

  filterByType(type: TimelineEvent['type']): TimelineEvent[] {
    return this.events.filter(e => e.type === type);
  }

  filterByEntity(entity: string): TimelineEvent[] {
    return this.events.filter(e => e.entities.includes(entity));
  }

  search(query: string): TimelineEvent[] {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(
      e =>
        e.description.toLowerCase().includes(lowerQuery) ||
        e.source.toLowerCase().includes(lowerQuery)
    );
  }

  // ============================================================================
  // EXPORTACAO
  // ============================================================================

  exportToJSON(timeline: SuperTimeline): string {
    return JSON.stringify(timeline, null, 2);
  }

  generateReport(timeline: SuperTimeline): string {
    const lines = [
      'SUPER TIMELINE REPORT',
      '=' .repeat(50),
      '',
      `Total Events: ${timeline.statistics.totalEvents}`,
      `Time Range: ${timeline.statistics.timeRange.start.toISOString()} to ${timeline.statistics.timeRange.end.toISOString()}`,
      `Sources: ${timeline.statistics.sources.join(', ')}`,
      '',
      'Event Types:',
      ...Object.entries(timeline.statistics.eventTypes).map(([type, count]) => `  ${type}: ${count}`),
      '',
      `Gaps Detected: ${timeline.gaps.length}`,
      ...timeline.gaps.map(g => `  - ${g.duration}ms gap: ${g.possibleExplanation}`),
      '',
      `Correlations Found: ${timeline.correlations.length}`,
      '',
      `Attack Phases Identified: ${timeline.attackPhases.length}`,
      ...timeline.attackPhases.map(p => `  - ${p.name} (${p.events.length} events)`),
    ];

    return lines.join('\n');
  }
}
