/**
 * Unit Tests - Memory Engine v3.0 Supremo
 */

import { MemoryEngineSupremo } from '../../src/ai/memory';

describe('MemoryEngineSupremo', () => {
  let engine: MemoryEngineSupremo;

  beforeEach(async () => {
    engine = new MemoryEngineSupremo();
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(engine.name).toBe('MemoryEngineSupremo');
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

  describe('Knowledge Graph', () => {
    it('should add knowledge triple', async () => {
      const result = engine.addKnowledge(
        { type: 'vulnerability', name: 'SQL Injection', properties: {}, confidence: 0.9, sources: [] },
        'affects',
        { type: 'component', name: 'Login Module', properties: {}, confidence: 0.9, sources: [] }
      );

      expect(result).toHaveProperty('subject');
      expect(result).toHaveProperty('relationship');
      expect(result).toHaveProperty('object');
      expect(result.relationship.type).toBe('affects');
    });

    it('should find related entities', async () => {
      const kg = engine.getKnowledgeGraph();

      const entity1 = kg.addEntity({
        id: 'test-1',
        type: 'vulnerability',
        name: 'XSS',
        properties: {},
        confidence: 0.9,
        sources: [],
      });

      const entity2 = kg.addEntity({
        id: 'test-2',
        type: 'component',
        name: 'Web App',
        properties: {},
        confidence: 0.9,
        sources: [],
      });

      kg.addRelationship({
        source: entity1.id,
        target: entity2.id,
        type: 'affects',
        properties: {},
        confidence: 0.9,
        bidirectional: false,
        weight: 0.8,
      });

      const related = kg.findRelated(entity1.id);

      expect(related).toBeInstanceOf(Array);
      expect(related.length).toBeGreaterThan(0);
      expect(related[0].entity.id).toBe(entity2.id);
    });

    it('should perform semantic search', async () => {
      const kg = engine.getKnowledgeGraph();

      kg.addEntity({
        id: 'search-1',
        type: 'vulnerability',
        name: 'SQL Injection vulnerability in authentication',
        properties: {},
        confidence: 0.9,
        sources: [],
      });

      const results = kg.semanticSearch('database security vulnerability', 5);

      expect(results).toBeInstanceOf(Array);
    });

    it('should infer relationships', async () => {
      const kg = engine.getKnowledgeGraph();

      const a = kg.addEntity({ id: 'a', type: 'issue', name: 'A', properties: {}, confidence: 0.9, sources: [] });
      const b = kg.addEntity({ id: 'b', type: 'issue', name: 'B', properties: {}, confidence: 0.9, sources: [] });
      const c = kg.addEntity({ id: 'c', type: 'issue', name: 'C', properties: {}, confidence: 0.9, sources: [] });

      kg.addRelationship({ source: a.id, target: b.id, type: 'causes', properties: {}, confidence: 0.9, bidirectional: false, weight: 0.8 });
      kg.addRelationship({ source: b.id, target: c.id, type: 'causes', properties: {}, confidence: 0.9, bidirectional: false, weight: 0.8 });

      const inference = kg.infer(a.id);

      expect(inference).toHaveProperty('inferredRelationships');
      expect(inference).toHaveProperty('reasoning');
    });
  });

  describe('Pattern Learning', () => {
    it('should learn patterns from experiences', async () => {
      const pl = engine.getPatternLearning();

      // Adicionar experiencias sequenciais
      for (let i = 0; i < 5; i++) {
        pl.addExperience({
          id: `exp-${i}`,
          timestamp: new Date(),
          type: 'security_scan',
          data: { events: ['start', 'scan', 'report'] },
          outcome: 'success',
          context: {},
          duration: 1000,
          resources: [],
        });
      }

      const result = await pl.learn();

      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('statistics');
    });

    it('should predict based on context', async () => {
      const pl = engine.getPatternLearning();

      // Adicionar experiencias com causa-efeito
      for (let i = 0; i < 5; i++) {
        pl.addExperience({
          id: `causal-${i}`,
          timestamp: new Date(),
          type: 'deployment',
          data: { cause: 'config_change', effect: 'service_restart' },
          outcome: 'success',
          context: {},
          duration: 500,
          resources: [],
        });
      }

      await pl.learn();

      const predictions = pl.predict({ config_change: true });

      expect(predictions).toBeInstanceOf(Array);
    });

    it('should calculate pattern success rate', async () => {
      const pl = engine.getPatternLearning();

      for (let i = 0; i < 3; i++) {
        pl.addExperience({
          id: `success-${i}`,
          timestamp: new Date(),
          type: 'test',
          data: {},
          outcome: i < 2 ? 'success' : 'failure',
          context: {},
          duration: 100,
          resources: [],
        });
      }

      await pl.learn();
      const stats = pl.getStats();

      expect(stats.avgSuccessRate).toBeGreaterThanOrEqual(0);
      expect(stats.avgSuccessRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Recall Engine', () => {
    it('should store and retrieve memories', async () => {
      const re = engine.getRecallEngine();

      const memory = re.store({
        content: 'SQL injection vulnerability found in login form',
        type: 'observation',
        metadata: { severity: 'high' },
        importance: 0.9,
        tags: ['security', 'sql-injection'],
        relatedEntries: [],
      });

      expect(memory).toHaveProperty('id');
      expect(memory.content).toBe('SQL injection vulnerability found in login form');

      const retrieved = re.retrieve(memory.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(memory.id);
    });

    it('should search memories', async () => {
      const re = engine.getRecallEngine();

      re.store({
        content: 'Database connection pool exhausted',
        type: 'error',
        metadata: {},
        importance: 0.8,
        tags: ['database', 'error'],
        relatedEntries: [],
      });

      re.store({
        content: 'Login authentication failure',
        type: 'error',
        metadata: {},
        importance: 0.7,
        tags: ['auth', 'error'],
        relatedEntries: [],
      });

      const results = re.search({ query: 'database error', limit: 5 });

      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find similar memories', async () => {
      const re = engine.getRecallEngine();

      re.store({
        content: 'SQL injection in login form',
        type: 'observation',
        metadata: {},
        importance: 0.9,
        tags: ['security'],
        relatedEntries: [],
      });

      re.store({
        content: 'XSS vulnerability in search box',
        type: 'observation',
        metadata: {},
        importance: 0.8,
        tags: ['security'],
        relatedEntries: [],
      });

      const similar = re.findSimilar('injection vulnerability security', 5);

      expect(similar).toBeInstanceOf(Array);
    });

    it('should compress old memories', async () => {
      const re = engine.getRecallEngine();

      re.store({
        content: 'Old memory that should be compressed '.repeat(50),
        type: 'observation',
        metadata: {},
        importance: 0.1,
        tags: [],
        relatedEntries: [],
      });

      const compressed = re.compress({ minImportance: 0.3 });

      expect(typeof compressed).toBe('number');
    });
  });

  describe('Contextual Recall', () => {
    it('should retrieve contextual memory', async () => {
      await engine.storeExperience(
        'Previous security scan found 5 vulnerabilities',
        'observation',
        { projectId: 'proj-1', severity: 'high' }
      );

      const result = await engine.retrieve(
        { projectId: 'proj-1' },
        'security vulnerabilities'
      );

      expect(result).toHaveProperty('knowledge');
      expect(result).toHaveProperty('patterns');
      expect(result).toHaveProperty('memories');
      expect(result).toHaveProperty('recommendations');
    });

    it('should generate recommendations', async () => {
      const result = await engine.retrieve({}, 'test query');

      expect(result.recommendations).toBeInstanceOf(Array);
    });
  });

  describe('Stats', () => {
    it('should return combined stats', async () => {
      const stats = engine.getStats();

      expect(stats).toHaveProperty('entities');
      expect(stats).toHaveProperty('patterns');
      expect(stats).toHaveProperty('memories');
    });
  });

  describe('Metrics', () => {
    it('should track metrics', async () => {
      const initialMetrics = engine.getMetrics();

      await engine.retrieve({}, 'test');

      const finalMetrics = engine.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
    });
  });
});
