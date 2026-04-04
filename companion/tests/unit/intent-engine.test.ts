/**
 * Unit Tests - Intent Engine v3.0 Supremo
 */

import { IntentEngineSupremo } from '../../src/ai/intent';
import type { UserInput, ConversationContext } from '../../src/shared/types';

describe('IntentEngineSupremo', () => {
  let engine: IntentEngineSupremo;

  beforeEach(async () => {
    engine = new IntentEngineSupremo();
    await engine.initialize();
  });

  afterEach(async () => {
    await engine.reset();
  });

  describe('Initialization', () => {
    it('should have correct name and version', () => {
      expect(engine.name).toBe('IntentEngineSupremo');
      expect(engine.version).toBe('3.0.0');
    });

    it('should start with ready status after initialization', async () => {
      expect(engine.status).toBe('ready');
    });

    it('should emit ready event on initialization', (done) => {
      const newEngine = new IntentEngineSupremo();
      newEngine.on('ready', () => {
        expect(newEngine.status).toBe('ready');
        done();
      });
      newEngine.initialize();
    });
  });

  describe('Basic Intent Recognition', () => {
    it('should recognize security scan intent', async () => {
      const input: UserInput = {
        id: 'test-1',
        content: 'Scan example.com for vulnerabilities',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-1',
      };

      const context: ConversationContext = {
        conversationId: 'conv-1',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.understand(input, context);

      expect(result.intent.primary.category).toBe('security_scan');
      expect(result.intent.confidence).toBeGreaterThan(0.7);
    });

    it('should recognize QA analysis intent', async () => {
      const input: UserInput = {
        id: 'test-2',
        content: 'Run QA tests on my app',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-2',
      };

      const context: ConversationContext = {
        conversationId: 'conv-2',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.understand(input, context);

      expect(result.intent.primary.category).toBe('qa_analysis');
    });

    it('should recognize information request intent', async () => {
      const input: UserInput = {
        id: 'test-3',
        content: 'How do I configure the scanner?',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-3',
      };

      const context: ConversationContext = {
        conversationId: 'conv-3',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.understand(input, context);

      expect(result.intent.primary.category).toBe('information_request');
    });
  });

  describe('Entity Extraction', () => {
    it('should extract URLs from input', async () => {
      const input: UserInput = {
        id: 'test-4',
        content: 'Scan https://example.com and https://test.com',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-4',
      };

      const context: ConversationContext = {
        conversationId: 'conv-4',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      const urlEntities = result.intent.entities.filter(e => e.type === 'url');
      expect(urlEntities.length).toBeGreaterThanOrEqual(1);
    });

    it('should extract CVEs from input', async () => {
      const input: UserInput = {
        id: 'test-5',
        content: 'Check CVE-2024-1234 and CVE-2024-5678',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-5',
      };

      const context: ConversationContext = {
        conversationId: 'conv-5',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      const cveEntities = result.intent.entities.filter(e => e.type === 'cve');
      expect(cveEntities.length).toBe(2);
    });
  });

  describe('Emotional Analysis', () => {
    it('should detect frustration', async () => {
      const input: UserInput = {
        id: 'test-6',
        content: 'This is not working AGAIN! So frustrating!',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-6',
      };

      const context: ConversationContext = {
        conversationId: 'conv-6',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      expect(result.emotionalAnalysis.state.frustration).toBeGreaterThan(0.5);
      expect(result.emotionalAnalysis.state.emotions).toContain('frustration');
    });

    it('should detect urgency', async () => {
      const input: UserInput = {
        id: 'test-7',
        content: 'URGENT! Production is down! Help ASAP!',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-7',
      };

      const context: ConversationContext = {
        conversationId: 'conv-7',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      expect(result.emotionalAnalysis.state.emotions).toContain('urgency');
      expect(result.intent.urgency).toMatch(/high|critical|emergency/);
    });

    it('should generate empathy response for frustrated user', async () => {
      const input: UserInput = {
        id: 'test-8',
        content: 'This is broken and I am very frustrated!',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-8',
      };

      const context: ConversationContext = {
        conversationId: 'conv-8',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      expect(result.empathyResponse.tone).toBe('empathetic_understanding');
      expect(result.empathyResponse.emotionalValidation).toBeDefined();
    });
  });

  describe('Multi-Intent Detection', () => {
    it('should detect multiple intents in complex input', async () => {
      const input: UserInput = {
        id: 'test-9',
        content: 'Scan example.com for vulnerabilities and then send me a report via email',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-9',
      };

      const context: ConversationContext = {
        conversationId: 'conv-9',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      expect(result.multiIntent).toBeDefined();
      expect(result.multiIntent!.secondaryIntents.length).toBeGreaterThan(0);
    });

    it('should identify dependencies between intents', async () => {
      const input: UserInput = {
        id: 'test-10',
        content: 'Scan the site and generate a report with the results',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-10',
      };

      const context: ConversationContext = {
        conversationId: 'conv-10',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      if (result.multiIntent) {
        const hasDependency = result.multiIntent.relationships.some(
          r => r.type === 'dependent' || r.type === 'sequential'
        );
        expect(hasDependency).toBe(true);
      }
    });
  });

  describe('Context Retention', () => {
    it('should retrieve relevant context from conversation history', async () => {
      const context: ConversationContext = {
        conversationId: 'conv-11',
        turnNumber: 1,
        previousTurns: [],
      };

      // Primeira interação
      const input1: UserInput = {
        id: 'test-11a',
        content: 'I want to scan my website example.com',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-11a',
      };

      await engine.analyze(input1, context);

      // Segunda interação - referência implícita
      const input2: UserInput = {
        id: 'test-11b',
        content: 'What were the results?',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-11b',
      };

      context.turnNumber = 2;

      const result = await engine.analyze(input2, context);

      expect(result.retrievedContext.turns.length).toBeGreaterThan(0);
    });

    it('should track entities across conversation', async () => {
      const context: ConversationContext = {
        conversationId: 'conv-12',
        turnNumber: 1,
        previousTurns: [],
      };

      const input: UserInput = {
        id: 'test-12',
        content: 'Check https://example.com for security issues',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-12',
      };

      await engine.analyze(input, context);

      const entities = engine.getContextRetention().getActiveEntities();
      const urlEntities = entities.filter(e => e.type === 'url');

      expect(urlEntities.length).toBeGreaterThan(0);
    });
  });

  describe('Disambiguation', () => {
    it('should use context to disambiguate ambiguous intent', async () => {
      const context: ConversationContext = {
        conversationId: 'conv-13',
        turnNumber: 1,
        previousTurns: [
          {
            turnId: 'prev-1',
            role: 'user',
            content: 'Scan example.com',
            createdAt: new Date(Date.now() - 60000),
          },
        ],
      };

      const ambiguousInput: UserInput = {
        id: 'test-13',
        content: 'What about the results?',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-13',
      };

      const clarified = await engine.disambiguate(
        {
          id: 'ambiguous-1',
          primary: { category: 'information_request', action: 'provide' },
          confidence: 0.5,
          ambiguity: 'high',
          emotionalState: {
            sentiment: { overall: 0, positive: 0.5, negative: 0.5, neutral: 0 },
            emotions: [],
            frustration: 0,
            confidence: 0.5,
            urgencyIndicators: [],
          },
          urgency: 'normal',
          entities: [],
          parameters: {},
          expectedOutcome: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '3.0',
          correlationId: ambiguousInput.id,
        },
        context
      );

      expect(clarified.clarificationMethod).toBe('history');
      expect(clarified.clarifiedIntent.confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Parallel Intent Detection', () => {
    it('should detect parallel intents in complex command', async () => {
      const input: UserInput = {
        id: 'test-14',
        content: 'Scan the API endpoints and check the database for vulnerabilities',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-14',
      };

      const intents = await engine.detectParallelIntents(input);

      expect(intents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Health and Metrics', () => {
    it('should return health status', async () => {
      const health = await engine.health();

      expect(health.status).toBe('healthy');
      expect(health.checks.length).toBeGreaterThan(0);
      expect(health.checks.every(c => c.status === 'pass')).toBe(true);
    });

    it('should track metrics correctly', async () => {
      const initialMetrics = engine.getMetrics();

      const input: UserInput = {
        id: 'test-metrics',
        content: 'Hello',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-metrics',
      };

      const context: ConversationContext = {
        conversationId: 'conv-metrics',
        turnNumber: 1,
        previousTurns: [],
      };

      await engine.understand(input, context);

      const finalMetrics = engine.getMetrics();

      expect(finalMetrics.totalRequests).toBe(initialMetrics.totalRequests + 1);
    });
  });

  describe('Multilingual Support', () => {
    it('should understand Portuguese commands', async () => {
      const input: UserInput = {
        id: 'test-pt',
        content: 'Escaneie example.com por vulnerabilidades',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-pt',
      };

      const context: ConversationContext = {
        conversationId: 'conv-pt',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.understand(input, context);

      expect(result.intent.primary.category).toBe('security_scan');
    });

    it('should understand Spanish commands', async () => {
      const input: UserInput = {
        id: 'test-es',
        content: 'Analizar la seguridad de example.com',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-es',
      };

      const context: ConversationContext = {
        conversationId: 'conv-es',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.understand(input, context);

      expect(['security_scan', 'qa_analysis']).toContain(result.intent.primary.category);
    });
  });

  describe('Crisis Detection', () => {
    it('should detect crisis situation requiring human handoff', async () => {
      const input: UserInput = {
        id: 'test-crisis',
        content: 'WE ARE BEING HACKED! CRITICAL SECURITY BREACH!',
        type: 'text',
        source: 'chat',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
        correlationId: 'test-corr-crisis',
      };

      const context: ConversationContext = {
        conversationId: 'conv-crisis',
        turnNumber: 1,
        previousTurns: [],
      };

      const result = await engine.analyze(input, context);

      expect(result.requiresHumanHandoff).toBe(true);
      expect(result.emotionalAnalysis.riskLevel).toMatch(/high|critical/);
    });
  });
});
