# SitePulse Studio v3.0 - Tutorial Completo

## Visao Geral

O **SitePulse Studio v3.0** e uma plataforma completa de QA e seguranca com 10 motores de IA.

---

## Os 10 Motores de IA

### 1. Intent Engine (Motor de Intencao)
Compreender comandos do usuario com analise de sentimento e contexto conversacional.

### 2. Context Engine (Motor de Contexto)
Manter consciencia do ambiente operacional com auto-descoberta e monitoramento.

### 3. Evidence Engine (Motor de Evidencias)
Coletar e analisar evidencias tecnicas para investigacoes.

### 4. Memory Engine (Motor de Memoria)
Aprender com experiencias passadas e reconhecer padroes.

### 5. Learning Engine (Motor de Aprendizado)
Melhorar continuamente com feedback e novos dados.

### 6. Decision Engine (Motor de Decisao)
Tomar decisoes otimas usando otimizacao multi-objetivo e teoria dos jogos.

### 7. Action Engine (Motor de Acao)
Executar acoes com circuit breaker, checkpoints e rollback.

### 8. Predictive Engine (Motor Preditivo)
Prever problemas com forecasting e deteccao de anomalias.

### 9. Autonomous QA Engine (Motor Autonomo)
Automacao completa de testes com geracao e self-healing.

### 10. CyberSenior Engine (Motor de Seguranca)
Red Team, Blue Team, Forense e Compliance.

---

## Exemplo Completo de Uso

```typescript
import { supremeOrchestrator } from '../src/bridge/engine-orchestrator';

async function exemploCompleto() {
  // 1. Inicializar
  await supremeOrchestrator.initialize({
    name: 'MeuConfig',
    version: '3.0.0',
    enabled: true,
    logging: { level: 'info', destination: 'console' },
    performance: { maxConcurrency: 4, timeoutMs: 30000 },
    security: { enableEncryption: true, allowedHosts: ['localhost'] },
    engines: {
      intent: { enabled: true },
      context: { enabled: true },
      evidence: { enabled: true },
      memory: { enabled: true },
      learning: { enabled: true },
      decision: { enabled: true },
      action: { enabled: true },
      predictive: { enabled: true },
      autonomous: { enabled: true },
      security: { enabled: true },
    },
    features: {
      parallelExecution: true,
      cacheEnabled: true,
      securityValidation: true,
      explainability: true,
      humanInTheLoop: false,
    },
    limits: {
      maxProcessingTime: 60000,
      maxContextLength: 10000,
      maxActionsPerRequest: 10,
    },
  });

  // 2. Processar entrada do usuario
  const resultado = await supremeOrchestrator.processUserInput({
    content: "Quero fazer um scan de seguranca no site https://exemplo.com",
    type: 'text',
    source: 'chat',
  });

  console.log('Resultado:', resultado);
}
```

---

## Uso Individual dos Engines

### Intent Engine

```typescript
import { IntentEngineSupremo } from '../src/ai/intent';

const engine = new IntentEngineSupremo();
await engine.initialize(config);

const resultado = await engine.analyzeIntent({
  content: "Scan de seguranca urgente",
  type: 'text',
  source: 'chat',
}, {
  conversationId: 'conv-123',
  turnNumber: 1,
  previousTurns: [],
});

console.log('Intencao:', resultado.primary);
console.log('Emocao:', resultado.emotion.state);
```

### Context Engine

```typescript
import { ContextEngineSupremo } from '../src/ai/context';

const engine = new ContextEngineSupremo();
const target = await engine.discoverTarget('https://exemplo.com');

console.log('Tecnologias:', target.technologies);
console.log('Endpoints:', target.endpoints);
```

### Decision Engine

```typescript
import { SupremeDecisionEngine } from '../src/ai/decision';

const engine = new SupremeDecisionEngine();

const framework = {
  objectives: [
    { name: 'custo', direction: 'minimize', weight: 0.3 },
    { name: 'qualidade', direction: 'maximize', weight: 0.7 },
  ],
  constraints: [],
  preferences: [],
};

const options = [
  { id: '1', name: 'Plano A', description: 'Economico', values: { custo: 100, qualidade: 70 } },
  { id: '2', name: 'Plano B', description: 'Premium', values: { custo: 200, qualidade: 95 } },
];

const decision = await engine.decideByOptimization(options, framework, context);
console.log('Melhor opcao:', decision.selectedOption);
```

### Action Engine

```typescript
import { SupremeActionEngine } from '../src/ai/action';

const engine = new SupremeActionEngine();

const action = {
  id: 'scan-action',
  type: 'scan' as const,
  name: 'Security Scan',
  description: 'Executar varredura',
  parameters: { depth: 'full' },
  target: { url: 'https://exemplo.com' },
  dependencies: [],
  timeout: 300000,
  retries: 3,
  riskLevel: 'medium' as const,
  requiresApproval: true,
  metadata: {},
};

const result = await engine.execute(action, {
  checkpointEnabled: true,
  rollbackOnFailure: true,
});
```

### Predictive Engine

```typescript
import { SupremePredictiveEngine } from '../src/ai/predictive';

const engine = new SupremePredictiveEngine();

const timeSeries = {
  id: 'cpu',
  name: 'CPU Usage',
  metric: 'percentage',
  data: [
    { timestamp: new Date(), value: 45 },
    { timestamp: new Date(), value: 48 },
  ],
  granularity: 'daily' as const,
};

const forecast = await engine.forecast(timeSeries, {
  horizon: 'medium',
  model: 'ensemble',
});

console.log('Previsao:', forecast.predictions);
```

### Autonomous QA Engine

```typescript
import { SupremeAutonomousQAEngine } from '../src/ai/autonomous';

const engine = new SupremeAutonomousQAEngine();

// Gerar testes automaticamente
const testSuite = await engine.generateTests([
  'Usuario deve fazer login',
  'Sistema deve validar campos',
], {
  coverage: 0.9,
  maxTests: 50,
});

// Executar
const results = await engine.executeSuite(testSuite);

// Curar testes quebrados
for (const failed of results.failed) {
  const healed = await engine.healTest(failed);
  if (healed.success) {
    console.log('Teste curado:', healed.test.id);
  }
}

// Verificar readiness
const readiness = await engine.assessReleaseReadiness('v1.0.0');
console.log('Pronto?', readiness.ready);
```

### CyberSenior Engine

```typescript
import { SupremeCyberSeniorEngine } from '../src/ai/security';

const engine = new SupremeCyberSeniorEngine();

const target = {
  id: 'target-1',
  name: 'Meu Site',
  type: 'web' as const,
  url: 'https://exemplo.com',
  scope: ['https://exemplo.com/*'],
  technologies: ['React', 'Node.js'],
};

// Pentest
const report = await engine.runPentest(target, 'full');
console.log('Risco:', report.executiveSummary.overallRisk);
console.log('Vulnerabilidades:', report.findings.length);

// Compliance
const compliance = await engine.assessCompliance('owasp_top_10', target);
console.log('Score:', compliance.score);
```

---

## Dicas Avancadas

### 1. Cache
```typescript
await supremeOrchestrator.initialize({
  features: { cacheEnabled: true },
});
```

### 2. Execucao Paralela
```typescript
const [intent, context] = await Promise.all([
  intentEngine.analyzeIntent(input),
  contextEngine.discoverTarget(url),
]);
```

### 3. Human-in-the-Loop
```typescript
const decision = await decisionEngine.decideByOptimization(options, framework, context);

if (decision.humanReview.required) {
  const feedback = await decisionEngine.requestHumanReview(decision.id, 60000);
  if (feedback === 'reject') {
    return { status: 'cancelled' };
  }
}
```

### 4. Metricas
```typescript
const health = await supremeOrchestrator.health();
const metrics = supremeOrchestrator.getMetrics();
console.log('Status:', health.status);
```

---

## Executando os Testes

```bash
# Todos os testes
npm test

# Teste especifico
npm test -- --testPathPattern=cybersenior

# Com cobertura
npm test -- --coverage
```

---

## Documentacao Adicional

- Veja os testes em `src/ai/**/__tests__/` para mais exemplos
- Consulte `src/shared/types/` para definicoes de tipos
- O orquestrador esta em `src/bridge/engine-orchestrator.ts`
