# SitePulse V3 — Guia de API Completo

## Índice
1. [Inicialização](#inicialização)
2. [System State Machine](#system-state-machine)
3. [AI Consciousness](#ai-consciousness)
4. [AI Providers](#ai-providers)
5. [Event Bus](#event-bus)
6. [Knowledge Graph](#knowledge-graph)
7. [Security Engine](#security-engine)
8. [UI Components](#ui-components)

---

## Inicialização

```typescript
import { initializeV3 } from './sitepulse-v3.js';

// Inicialização completa
const v3 = initializeV3({
  openaiApiKey: 'sk-...',
  deepseekApiKey: 'sk-...',
  defaultProvider: 'deepseek'
});

const { fsm, ai, registry, knowledge, events } = v3;
```

---

## System State Machine

### Estados
```typescript
type SystemMode = 
  | 'GENESIS'      // Inicialização
  | 'RECONNAISSANCE' // Mapeando projeto
  | 'ANALYSIS'     // Analisando
  | 'SIMULATION'   // Simulando ataques
  | 'HEALING'      // Aplicando correções
  | 'VALIDATION'   // Validando correções
  | 'STASIS'       // Modo offline
  | 'CRISIS';      // Erro crítico
```

### API
```typescript
// Transição de estado
const success = fsm.transition('ANALYSIS');

// Verificar se pode transicionar
if (fsm.canTransitionTo('HEALING')) {
  // ...
}

// Atualizar contexto
fsm.updateContext({ 
  hasReport: true,
  threatLevel: 'high' 
});

// Auto-transição (primeira válida)
fsm.autoTransition();

// Escutar mudanças
const unsubscribe = fsm.onTransition((from, to, context) => {
  console.log(`${from} → ${to}`);
});

// Histórico
console.log(fsm.history);
```

---

## AI Consciousness

### Estados
```typescript
type AIConsciousnessState =
  | 'DORMANT'      // Ocioso
  | 'AWARE'        // Ativo
  | 'ANALYZING'    // Analisando
  | 'HYPOTHESIZING' // Hipotetizando
  | 'EXECUTING'    // Executando
  | 'REFLECTING'   // Refletindo
  | 'WARNING'      // Alerta
  | 'TEACHING';    // Explicando
```

### Personalidades
```typescript
type PersonalityMode = 
  | 'engineer'   // Focado em código
  | 'guardian'   // Focado em segurança
  | 'optimizer'  // Focado em performance
  | 'oracle'     // Focado em previsões
  | 'surgeon';   // Focado em correções precisas
```

### API
```typescript
// Configurar personalidade
ai.setPersonality('surgeon');

// Definir carga cognitiva (0-100)
ai.setCognitiveLoad(75);

// Definir foco atual
ai.setFocus([
  'Analisando vulnerabilidades',
  'Otimizando queries SQL'
]);

// Definir nível de ameaça
ai.setThreatLevel('high');

// Trigger de transição
ai.trigger('CRITICAL_FINDING'); // DORMANT → WARNING
ai.trigger('ENGINE_STARTED');   // DORMANT → ANALYZING
ai.trigger('ANALYSIS_COMPLETE'); // ANALYZING → HYPOTHESIZING

// Forçar estado
ai.forceState('TEACHING');

// Configuração visual do estado atual
const config = ai.config;
console.log(config.color);           // #ec4899
console.log(config.label);           // 'Analizando'
console.log(config.animationClass);  // 'ai-state--analyzing'
console.log(config.breathingDurationMs); // 1200

// Escutar mudanças
const unsubscribe = ai.onStateChange((state, config) => {
  console.log(`Novo estado: ${state}`);
});
```

---

## AI Providers

### Uso Básico
```typescript
import { getProviderRegistry, OpenAIAdapter, DeepSeekAdapter } from './sitepulse-v3.js';

const registry = getProviderRegistry();

// Registrar providers
registry.registerProvider(new OpenAIAdapter({ 
  apiKey: 'sk-...',
  defaultModel: 'gpt-4o'
}));

registry.registerProvider(new DeepSeekAdapter({
  apiKey: 'sk-...',
  defaultModel: 'deepseek-coder'
}));

// Chat com roteamento automático
const response = await registry.chat(
  [
    { role: 'system', content: 'Você é um especialista em segurança.' },
    { role: 'user', content: 'Analise este código...' }
  ],
  'SECURITY_ANALYSIS', // Tipo de tarefa
  8                    // Complexidade (1-10)
);

console.log(response.content);
console.log(response.provider);     // 'openai' | 'deepseek' | 'offline'
console.log(response.costEstimate); // Custo em USD
console.log(response.latencyMs);    // Latência

// Estatísticas
const stats = registry.getStats();
console.log(stats.totalCostUsd);
console.log(stats.totalTokens);
console.log(stats.metrics); // Por provider
```

### Uso Direto de Provider
```typescript
import { OpenAIAdapter } from './sitepulse-v3.js';

const openai = new OpenAIAdapter({ apiKey: 'sk-...' });

// Análise de código
const analysis = await openai.analyzeCode(
  code,
  { language: 'typescript', filePath: 'src/app.ts', surrounding: '...' }
);

// Gerar patch
const patch = await openai.generatePatch(finding, projectContext);

// Explicar finding
const explanation = await openai.explainFinding(finding, 'pt');

// Health check
const status = await openai.checkHealth();
console.log(status.healthy, status.latencyMs);
```

---

## Event Bus

### Tipos de Eventos
```typescript
type DomainEventType =
  | 'FINDING_DISCOVERED'
  | 'PATCH_GENERATED'
  | 'SECURITY_BREACH_SIMULATED'
  | 'BASELINE_SHIFTED'
  | 'AI_STATE_CHANGED'
  | 'ENGINE_COMPLETED'
  | 'SYSTEM_MODE_CHANGED'
  | 'HEALING_STARTED'
  | 'HEALING_COMPLETED'
  | 'HEALING_ROLLED_BACK'
  | 'PROVIDER_SWITCHED'
  | 'PROVIDER_FAILED';
```

### API
```typescript
import { eventBus } from './sitepulse-v3.js';

// Escutar evento específico
const unsubscribe = eventBus.on('HEALING_COMPLETED', (event) => {
  console.log(event.payload.sessionId);
  console.log(event.payload.success);
  console.log(event.metadata.correlationId);
});

// Escutar todos os eventos
const unsubscribeAll = eventBus.onAny((event) => {
  console.log(`[${event.type}]`, event.payload);
});

// Emitir evento
eventBus.emit({
  type: 'FINDING_DISCOVERED',
  payload: { finding: { id: 'XSS-001', severity: 'high' } }
});

// Evento único (auto-unsubscribe)
eventBus.once('AI_STATE_CHANGED', (event) => {
  // Só executa uma vez
});

// Histórico recente
const recent = eventBus.recent(10); // Últimos 10 eventos
const healingEvents = eventBus.recent(5, 'HEALING_COMPLETED');

// Cleanup
unsubscribe();
unsubscribeAll();
```

---

## Knowledge Graph

### API
```typescript
import { getKnowledgeGraph } from './sitepulse-v3.js';

const kg = getKnowledgeGraph();

// Adicionar nós
const bugId = kg.addNode({
  id: 'bug-1',
  type: 'bug',
  label: 'SQL Injection in auth',
  data: { severity: 'critical', code: 'SQLI-001' },
  weight: 1
});

const fixId = kg.addNode({
  id: 'fix-1',
  type: 'fix',
  label: 'Use parameterized queries',
  data: { files: ['auth.js'] },
  weight: 1
});

// Criar relação
kg.addEdge({
  from: 'bug-1',
  to: 'fix-1',
  relation: 'fixed_by',
  strength: 0.95
});

// Buscar bugs similares
const similar = kg.findSimilarBugs('bug-1', 5);
similar.forEach(({ node, similarity }) => {
  console.log(`${node.label}: ${similarity * 100}% similar`);
});

// Sugerir correções
const suggestions = kg.suggestFixes('bug-1');
suggestions.forEach(({ fix, confidence, source }) => {
  console.log(`${fix.label} (${source}): ${confidence * 100}%`);
});

// Reforçar relação (aumenta peso)
kg.reinforceEdge('bug-1', 'fix-1', 'fixed_by');

// Estatísticas
const stats = kg.stats;
console.log(stats.nodeCount, stats.edgeCount);
console.log(stats.nodeTypes);
console.log(stats.avgEdgeWeight);

// Exportar
const json = kg.export('json');
const cytoscape = kg.export('cytoscape');
```

---

## Security Engine

### Attack Surface Analyzer
```typescript
import { getAttackSurfaceAnalyzer } from './sitepulse-v3.js';

const analyzer = getAttackSurfaceAnalyzer();

// Adicionar nós
analyzer.addNode({
  id: 'endpoint-1',
  type: 'endpoint',
  url: '/api/users',
  label: 'Users API',
  criticalityScore: 80
});

// Criar conexões
analyzer.addEdge('endpoint-1', 'endpoint-2', 'dataflow', 0.8);

// Calcular PageRank
const ranks = analyzer.calculatePageRank();
ranks.forEach((rank, nodeId) => {
  console.log(`${nodeId}: ${rank}`);
});

// Encontrar caminhos de ataque
const paths = analyzer.findAttackPaths(5);
paths.forEach(path => {
  console.log(`Risco: ${path.riskScore}`);
  console.log(`Complexidade: ${path.complexity}`);
  console.log(`Nós: ${path.nodes.join(' → ')}`);
});

// Nós críticos
const critical = analyzer.getCriticalNodes(0.8);
```

### Vulnerability DNA
```typescript
import { getVulnerabilityDNA } from './sitepulse-v3.js';

const dna = getVulnerabilityDNA();

// Escanear código
const results = dna.scan(code, 'src/app.js');

results.forEach(({ signature, matches, confidence }) => {
  console.log(`🔴 ${signature.name} (${signature.cweId})`);
  console.log(`   Confiança: ${confidence * 100}%`);
  console.log(`   ${signature.description}`);
  
  matches.forEach(match => {
    console.log(`   Linha ${match.line}: ${match.context}`);
  });
});

// Adicionar assinatura customizada
dna.addSignature({
  id: 'CUSTOM-001',
  name: 'Custom Pattern',
  cweId: 'CWE-000',
  cweName: 'Custom',
  severity: 'medium',
  category: 'logic',
  patterns: [/customPattern/g],
  description: '...',
  impact: '...',
  remediation: '...',
  references: [],
  confidence: 0.9
});

// Exportar SARIF
const sarif = dna.exportToSARIF();
```

---

## UI Components

### AI Operator Entity
```typescript
import { createAIOperatorEntity } from './sitepulse-v3.js';

const entity = createAIOperatorEntity({
  container: document.getElementById('ai-avatar')!,
  size: 'default',  // 'default' | 'compact' | 'large'
  showStatus: true,
  variant: 'orb'    // 'orb' | 'cube'
});

// Forçar estado visual
entity.setState('ANALYZING');

// Pulsar animação
entity.pulse();

// Cleanup
entity.destroy();
```

**CSS necessário:**
```html
<link rel="stylesheet" href="components/ai-operator-entity.css">
```

### Command Bar
```typescript
import { getCommandBar } from './sitepulse-v3.js';

const cmd = getCommandBar();

// Abrir (ou Cmd+K)
cmd.open();
cmd.close();
cmd.toggle();

// Registrar comando
cmd.register({
  id: 'my.command',
  label: 'Minha Ação',
  description: 'Descrição detalhada',
  category: 'Custom',
  shortcut: 'Ctrl+Shift+M',
  action: () => {
    console.log('Executado!');
  }
});

// Remover comando
cmd.unregister('my.command');
```

### Diff Viewer
```typescript
import { createDiffViewer } from './sitepulse-v3.js';

const viewer = createDiffViewer({
  container: document.getElementById('diff')!,
  diff: {
    hunks: [{
      startLine: 1,
      endLine: 10,
      lines: [
        { type: 'removed', lineNumber: 1, content: 'old code' },
        { type: 'added', lineNumber: 1, content: 'new code' }
      ]
    }],
    fromFile: 'src/old.js',
    toFile: 'src/new.js',
    summary: 'Fixed null pointer'
  },
  showLineNumbers: true,
  language: 'typescript'
});

// Atualizar diff
viewer.updateDiff(newDiff);

// Eventos
document.getElementById('diff')!.addEventListener('diff:apply', (e) => {
  console.log('Aplicar:', e.detail.diff);
});

document.getElementById('diff')!.addEventListener('diff:reject', () => {
  console.log('Rejeitado');
});

// Cleanup
viewer.destroy();
```

### Healing Connector
```typescript
import { getHealingConnector } from './sitepulse-v3.js';

const healing = getHealingConnector();

// Analisar finding
const analysis = await healing.analyzeFinding('finding-1');
console.log(analysis.analyzable, analysis.complexity);

// Gerar estratégias
const strategies = await healing.generateStrategies('finding-1');
strategies.forEach(s => {
  console.log(`${s.approach}: ${s.confidence * 100}% confiança`);
});

// Aplicar healing
const result = await healing.applyHealing('session-1', 'staging');
// Modos: 'shadow' | 'staging' | 'autonomous'

if (result.success) {
  console.log('Arquivos modificados:', result.filesModified);
}

// Verificar
const verification = await healing.verifyHealing('session-1');
console.log(`${verification.testsPassed}/${verification.testsRun} testes passaram`);

// Rollback se necessário
if (!verification.passed) {
  await healing.rollbackHealing('session-1');
}
```

---

## Exemplos Completos

### Workflow: Análise → Correção → Validação
```typescript
import { 
  initializeV3, 
  getSystemFSM, 
  getAIConsciousness,
  getProviderRegistry,
  getHealingConnector
} from './sitepulse-v3.js';

// 1. Inicializar
const { fsm, ai } = initializeV3({
  openaiApiKey: 'sk-...',
  deepseekApiKey: 'sk-...'
});

const registry = getProviderRegistry();
const healing = getHealingConnector();

// 2. Iniciar análise
fsm.transition('ANALYSIS');
ai.trigger('ENGINE_STARTED');

// 3. Quando finding é descoberto
const finding = { id: 'XSS-001', code: '...', severity: 'high' };

ai.setCognitiveLoad(80);
ai.setFocus(['Analisando XSS-001', 'Gerando estratégias']);

// 4. Analisar
const analysis = await healing.analyzeFinding(finding.id);

if (analysis.analyzable) {
  // 5. Gerar estratégias
  ai.trigger('ANALYSIS_COMPLETE'); // ANALYZING → HYPOTHESIZING
  
  const strategies = await healing.generateStrategies(finding.id);
  const bestStrategy = strategies[0];
  
  // 6. Aplicar correção
  fsm.transition('HEALING');
  ai.trigger('STRATEGY_SELECTED'); // HYPOTHESIZING → EXECUTING
  
  const result = await healing.applyHealing(
    bestStrategy.id, 
    'staging' // Primeiro em staging
  );
  
  // 7. Validar
  fsm.transition('VALIDATION');
  ai.trigger('ACTION_COMPLETE'); // EXECUTING → REFLECTING
  
  const verification = await healing.verifyHealing(result.sessionId!);
  
  if (verification.passed) {
    // Sucesso!
    fsm.transition('STASIS');
    ai.trigger('REFLECTION_DONE'); // REFLECTING → AWARE
    ai.setCognitiveLoad(20);
  } else {
    // Rollback
    await healing.rollbackHealing(result.sessionId!);
    fsm.transition('ANALYSIS');
    ai.trigger('NEEDS_REVISION'); // REFLECTING → HYPOTHESIZING
  }
}
```

---

## Dicas e Boas Práticas

1. **Sempre faça cleanup:** Chame `destroy()` ou `unsubscribe()` quando componentes forem desmontados
2. **Use o Event Bus:** Para comunicação entre módulos desacoplados
3. **Prefira `try-catch`:** Em operações de rede (AI providers, healing)
4. **Monitore custos:** Use `registry.getStats()` para acompanhar gastos
5. **Use staging primeiro:** Sempre teste healing em staging antes de autonomous

---

## Changelog

### v3.0.0
- ✅ System State Machine (8 estados)
- ✅ AI Consciousness (8 estados + 5 personalidades)
- ✅ AI Providers (OpenAI, DeepSeek) com roteamento inteligente
- ✅ Event Bus tipado
- ✅ Knowledge Graph (bug-fix-decision)
- ✅ Attack Surface Analyzer
- ✅ Vulnerability DNA (7 assinaturas CWE)
- ✅ AI Entity Visual (CSS 3D)
- ✅ Command Bar (Cmd+K)
- ✅ Diff Viewer
- ✅ Healing Connector
