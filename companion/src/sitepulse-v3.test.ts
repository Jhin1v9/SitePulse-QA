// SitePulse V3 — Integration Tests
// Run with: npx ts-node --esm sitepulse-v3.test.ts

import { 
  initializeV3, 
  getSystemFSM, 
  getAIConsciousness, 
  getProviderRegistry,
  getKnowledgeGraph,
  getAttackSurfaceAnalyzer,
  getVulnerabilityDNA,
  eventBus
} from './sitepulse-v3.js';

// Test utilities
const assert = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(`❌ ${message}`);
  console.log(`✅ ${message}`);
};

const test = async (name: string, fn: () => void | Promise<void>): Promise<void> => {
  try {
    await fn();
    console.log(`\n✅ Test passed: ${name}`);
  } catch (err) {
    console.error(`\n❌ Test failed: ${name}`);
    console.error(err);
    process.exit(1);
  }
};

// Test Suite
console.log('🧪 SitePulse V3 Integration Tests\n');

await test('Core Systems Initialization', () => {
  const { fsm, ai, registry, knowledge, events } = initializeV3();
  
  assert(fsm !== null, 'SystemFSM initialized');
  assert(ai !== null, 'AIConsciousness initialized');
  assert(registry !== null, 'ProviderRegistry initialized');
  assert(knowledge !== null, 'KnowledgeGraph initialized');
  assert(events !== null, 'EventBus initialized');
  
  assert(fsm.current === 'GENESIS', 'Initial state is GENESIS');
  assert(ai.current === 'DORMANT', 'Initial AI state is DORMANT');
});

await test('System State Machine Transitions', () => {
  const fsm = getSystemFSM();
  
  // Reset
  fsm.updateContext({
    mode: 'GENESIS',
    isOnline: true,
    hasReport: false,
    hasActiveRun: false
  });
  
  assert(fsm.canTransitionTo('RECONNAISSANCE'), 'Can transition to RECONNAISSANCE');
  
  const success = fsm.transition('RECONNAISSANCE');
  assert(success, 'Transition to RECONNAISSANCE succeeded');
  assert(fsm.current === 'RECONNAISSANCE', 'Current state is RECONNAISSANCE');
});

await test('AI Consciousness State Changes', () => {
  const ai = getAIConsciousness();
  
  // Reset state
  ai.forceState('DORMANT');
  assert(ai.current === 'DORMANT', 'AI state reset to DORMANT');
  
  const success = ai.trigger('USER_INTERACTION');
  assert(success, 'Trigger USER_INTERACTION succeeded');
  assert(ai.current === 'AWARE', 'AI transitioned to AWARE');
  
  assert(ai.config.color === '#818cf8', 'AWARE config has correct color');
});

await test('Event Bus Communication', async () => {
  let eventReceived = false;
  
  const unsubscribe = eventBus.on('AI_STATE_CHANGED', () => {
    eventReceived = true;
  });
  
  // Trigger state change
  const ai = getAIConsciousness();
  ai.trigger('ENGINE_STARTED');
  
  // Wait for async event
  await new Promise(resolve => setTimeout(resolve, 10));
  
  assert(eventReceived, 'Event was received by subscriber');
  
  unsubscribe();
});

await test('Knowledge Graph Operations', () => {
  const kg = getKnowledgeGraph();
  kg.clear();
  
  // Add nodes
  const bugId = kg.addNode({
    id: 'bug-1',
    type: 'bug',
    label: 'Test Bug',
    data: { severity: 'high' },
    weight: 1
  });
  
  const fixId = kg.addNode({
    id: 'fix-1',
    type: 'fix',
    label: 'Test Fix',
    data: { files: ['test.js'] },
    weight: 1
  });
  
  assert(kg.getNode('bug-1')?.type === 'bug', 'Bug node created');
  assert(kg.getNode('fix-1')?.type === 'fix', 'Fix node created');
  
  // Create relationship
  const edge = kg.addEdge({
    from: 'bug-1',
    to: 'fix-1',
    relation: 'fixed_by',
    strength: 0.95
  });
  
  assert(edge.relation === 'fixed_by', 'Edge created with correct relation');
  
  // Test suggestions
  const suggestions = kg.suggestFixes('bug-1');
  assert(suggestions.length > 0, 'Fix suggestions returned');
  assert(suggestions[0].confidence > 0, 'Suggestion has confidence score');
});

await test('Attack Surface Analyzer', () => {
  const analyzer = getAttackSurfaceAnalyzer();
  
  // Add nodes
  analyzer.addNode({
    id: 'node-1',
    type: 'endpoint',
    url: '/api/users',
    label: '/api/users',
    criticalityScore: 80
  });
  
  analyzer.addNode({
    id: 'node-2',
    type: 'endpoint',
    url: '/api/auth',
    label: '/api/auth',
    criticalityScore: 95
  });
  
  analyzer.addEdge('node-1', 'node-2', 'dataflow', 1);
  
  const stats = analyzer.stats;
  assert(stats.nodeCount === 2, 'Correct node count');
  assert(stats.edgeCount === 1, 'Correct edge count');
  
  // Test PageRank
  const ranks = analyzer.calculatePageRank();
  assert(ranks.size === 2, 'PageRank calculated for all nodes');
  
  // Test critical nodes
  const critical = analyzer.getCriticalNodes(0.5);
  assert(critical.length > 0, 'Critical nodes identified');
});

await test('Vulnerability DNA Scanner', () => {
  const dna = getVulnerabilityDNA();
  
  const testCode = `
    const query = "SELECT * FROM users WHERE id = " + userId;
    db.execute(query);
  `;
  
  const results = dna.scan(testCode, 'test.js');
  
  const hasSQLi = results.some(r => r.signature.id === 'SQLI-001');
  assert(hasSQLi, 'SQL Injection detected in code');
  
  if (results.length > 0) {
    assert(results[0].matches.length > 0, 'Match locations identified');
    assert(results[0].confidence > 0, 'Confidence score assigned');
  }
});

await test('Provider Registry (Mock Mode)', async () => {
  const registry = getProviderRegistry();
  
  // In mock mode (no API keys), should return offline response
  const response = await registry.chat([
    { role: 'user', content: 'Hello' }
  ]);
  
  assert(response.provider === 'offline', 'Offline provider used when no API keys');
  assert(response.content.includes('offline'), 'Offline message returned');
  
  const stats = registry.getStats();
  assert(typeof stats.totalCostUsd === 'number', 'Stats include cost');
  assert(typeof stats.totalTokens === 'number', 'Stats include tokens');
});

await test('Event Correlation', async () => {
  const events: string[] = [];
  
  const unsubscribe = eventBus.onAny((event) => {
    events.push(event.type);
  });
  
  // Trigger various events
  const fsm = getSystemFSM();
  fsm.transition('ANALYSIS');
  
  const ai = getAIConsciousness();
  ai.trigger('ENGINE_STARTED');
  
  await new Promise(resolve => setTimeout(resolve, 10));
  
  assert(events.includes('SYSTEM_MODE_CHANGED'), 'System mode change event recorded');
  assert(events.includes('AI_STATE_CHANGED'), 'AI state change event recorded');
  
  unsubscribe();
});

console.log('\n🎉 All tests passed!');
console.log('\n📊 Summary:');
console.log('  • Core Systems: ✅');
console.log('  • State Machines: ✅');
console.log('  • Event System: ✅');
console.log('  • Knowledge Graph: ✅');
console.log('  • Security Engine: ✅');
console.log('  • AI Providers: ✅');
