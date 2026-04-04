/**
 * DEMO COMPLETO - SitePulse Studio v3.0
 * 
 * Este exemplo demonstra como usar todos os 10 motores de IA
 * em um fluxo de trabalho real de QA e Seguranca.
 * 
 * Para executar:
 *   npx ts-node examples/demo-completo.ts
 */

import { supremeOrchestrator } from '../src/bridge/engine-orchestrator';
import { IntentEngineSupremo } from '../src/ai/intent';
import { ContextEngineSupremo } from '../src/ai/context';
import { SupremeDecisionEngine } from '../src/ai/decision';
import { SupremeActionEngine } from '../src/ai/action';
import { SupremePredictiveEngine } from '../src/ai/predictive';
import { SupremeAutonomousQAEngine } from '../src/ai/autonomous';
import { SupremeCyberSeniorEngine } from '../src/ai/security';

// ============================================================================
// CONFIGURACAO
// ============================================================================

const TARGET_URL = 'https://demo.sitepulse.com';

const orchestratorConfig = {
  name: 'DemoConfig',
  version: '3.0.0',
  enabled: true,
  logging: { level: 'info' as const, destination: 'console' as const },
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
};

// ============================================================================
// DEMO 1: Intent Engine - Compreendendo o Usuario
// ============================================================================

async function demoIntentEngine() {
  console.log('\n========================================');
  console.log('DEMO 1: Intent Engine');
  console.log('========================================\n');

  const engine = new IntentEngineSupremo();
  await engine.initialize(orchestratorConfig);

  const inputs = [
    'Quero fazer um scan de seguranca no meu site',
    'URGENTE: Site esta lento, preciso de ajuda!',
    'Gere testes automaticos para a funcionalidade de login',
  ];

  for (const content of inputs) {
    console.log(`\nUsuario: "${content}"`);
    
    const result = await engine.analyzeIntent({
      content,
      type: 'text' as const,
      source: 'chat' as const,
    }, {
      conversationId: 'demo-conv-1',
      turnNumber: 1,
      previousTurns: [],
    });

    console.log(`  Intencao primaria: ${result.primary.category} - ${result.primary.action}`);
    console.log(`  Urgencia: ${result.urgency.level} (${result.urgency.score})`);
    console.log(`  Emocao: ${result.emotion.state} (${result.emotion.intensity})`);
    console.log(`  Confiança: ${(result.confidence * 100).toFixed(1)}%`);
  }
}

// ============================================================================
// DEMO 2: Context Engine - Descobrindo o Ambiente
// ============================================================================

async function demoContextEngine() {
  console.log('\n========================================');
  console.log('DEMO 2: Context Engine');
  console.log('========================================\n');

  const engine = new ContextEngineSupremo();
  await engine.initialize(orchestratorConfig);

  console.log(`Descobrindo target: ${TARGET_URL}`);
  
  const target = await engine.discoverTarget(TARGET_URL);
  
  console.log('\nResultados da descoberta:');
  console.log(`  Nome: ${target.name}`);
  console.log(`  Tipo: ${target.type}`);
  console.log(`  Tecnologias: ${target.technologies.map(t => t.name).join(', ')}`);
  console.log(`  Endpoints: ${target.endpoints.length}`);
  console.log(`  Dependencias: ${target.dependencies.length}`);
}

// ============================================================================
// DEMO 3: Decision Engine - Tomando Decisoes Otimas
// ============================================================================

async function demoDecisionEngine() {
  console.log('\n========================================');
  console.log('DEMO 3: Decision Engine');
  console.log('========================================\n');

  const engine = new SupremeDecisionEngine();

  console.log('Cenario: Escolher estrategia de teste\n');

  const framework = {
    objectives: [
      { name: 'custo', direction: 'minimize' as const, weight: 0.25, priority: 2 },
      { name: 'cobertura', direction: 'maximize' as const, weight: 0.45, priority: 1 },
      { name: 'tempo', direction: 'minimize' as const, weight: 0.30, priority: 3 },
    ],
    constraints: [],
    preferences: [],
  };

  const options = [
    { 
      id: 'smoke', 
      name: 'Smoke Tests', 
      description: 'Testes rapidos basicos',
      values: { custo: 10, cobertura: 30, tempo: 5 }
    },
    { 
      id: 'integration', 
      name: 'Integration Tests', 
      description: 'Testes de integracao',
      values: { custo: 50, cobertura: 70, tempo: 30 }
    },
    { 
      id: 'full', 
      name: 'Full Suite', 
      description: 'Suite completa de testes',
      values: { custo: 100, cobertura: 95, tempo: 120 }
    },
    { 
      id: 'autonomous', 
      name: 'AI Generated Tests', 
      description: 'Testes gerados por IA',
      values: { custo: 40, cobertura: 85, tempo: 45 }
    },
  ];

  const context = {
    timestamp: new Date(),
    domain: 'qa',
    constraints: ['budget < 60'],
  };

  const decision = await engine.decideByOptimization(options, framework, context);

  console.log('Resultado da decisao:');
  console.log(`  Melhor opcao: ${decision.selectedOption?.name}`);
  console.log(`  Score: ${decision.score}`);
  console.log(`  Frente de Pareto: ${decision.paretoFront.length} opcoes`);
  
  console.log('\n  Analise de Trade-offs:');
  for (const trade of decision.tradeOffs.pairs) {
    console.log(`    ${trade.objective1} vs ${trade.objective2}: ${trade.correlation}`);
  }
}

// ============================================================================
// DEMO 4: Action Engine - Executando com Seguranca
// ============================================================================

async function demoActionEngine() {
  console.log('\n========================================');
  console.log('DEMO 4: Action Engine');
  console.log('========================================\n');

  const engine = new SupremeActionEngine();

  console.log('Demonstrando Circuit Breaker:\n');
  
  const circuitBreaker = engine.getCircuitBreaker('demo-circuit');
  
  console.log('Estado inicial:', circuitBreaker.getState());
  
  for (let i = 0; i < 3; i++) {
    try {
      await circuitBreaker.execute(async () => {
        console.log(`  Execucao ${i + 1}: Sucesso`);
        return { success: true };
      });
    } catch (err) {
      console.log(`  Execucao ${i + 1}: Falha`);
    }
  }

  console.log('Estado final:', circuitBreaker.getState());
}

// ============================================================================
// DEMO 5: Predictive Engine - Prevendo o Futuro
// ============================================================================

async function demoPredictiveEngine() {
  console.log('\n========================================');
  console.log('DEMO 5: Predictive Engine');
  console.log('========================================\n');

  const engine = new SupremePredictiveEngine();

  const now = new Date();
  const dataPoints = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const baseValue = 40 + (30 - i) * 0.5;
    const noise = Math.random() * 10 - 5;
    
    dataPoints.push({
      timestamp: date,
      value: Math.round(baseValue + noise),
    });
  }

  const timeSeries = {
    id: 'response-time',
    name: 'API Response Time',
    metric: 'ms',
    data: dataPoints,
    granularity: 'daily' as const,
  };

  console.log('Dados historicos:', dataPoints.length, 'pontos');

  const forecast = await engine.forecast(timeSeries, {
    horizon: 'short',
    model: 'ensemble',
  });

  console.log('\nPrevisao para proximos 7 dias:');
  for (const point of forecast.predictions.slice(0, 7)) {
    console.log(`  ${point.timestamp.toDateString()}: ${Math.round(point.value)}ms`);
  }

  console.log(`\nTendencia: ${forecast.trend}`);
  console.log(`Direcao: ${forecast.direction}`);
}

// ============================================================================
// DEMO 6: Autonomous QA Engine - Testes Autonomos
// ============================================================================

async function demoAutonomousQA() {
  console.log('\n========================================');
  console.log('DEMO 6: Autonomous QA Engine');
  console.log('========================================\n');

  const engine = new SupremeAutonomousQAEngine();

  console.log('Gerando testes a partir de requisitos...\n');

  const requirements = [
    'Usuario deve fazer login com email e senha validos',
    'Sistema deve rejeitar credenciais invalidas',
    'Usuario pode recuperar senha via email',
  ];

  const testSuite = await engine.generateTests(requirements, {
    coverage: 0.9,
    maxTests: 20,
    testTypes: ['unit', 'integration'],
  });

  console.log('Suite de testes gerada:');
  console.log(`  Total de testes: ${testSuite.tests.length}`);
  console.log(`  Cobertura estimada: ${(testSuite.coverage * 100).toFixed(1)}%`);

  const byType = testSuite.tests.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('  Distribuicao por tipo:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`    - ${type}: ${count}`);
  }

  console.log('\nAvaliacao de Release Readiness:');
  
  const readiness = await engine.assessReleaseReadiness('v1.0.0', {
    qualityGates: ['tests', 'coverage', 'performance'],
    thresholds: { minCoverage: 80, maxFailures: 2 },
  });

  console.log(`  Pronto para release: ${readiness.ready ? 'SIM' : 'NAO'}`);
  console.log(`  Score geral: ${(readiness.overallScore * 100).toFixed(1)}%`);
  console.log(`  Risco: ${readiness.riskLevel}`);
  
  console.log('\n  Gates de qualidade:');
  for (const gate of readiness.gates) {
    const status = gate.passed ? '✓' : '✗';
    console.log(`    ${status} ${gate.name}`);
  }
}

// ============================================================================
// DEMO 7: CyberSenior Engine - Seguranca
// ============================================================================

async function demoCyberSenior() {
  console.log('\n========================================');
  console.log('DEMO 7: CyberSenior Engine');
  console.log('========================================\n');

  const engine = new SupremeCyberSeniorEngine();

  const target = {
    id: 'demo-target',
    name: 'Demo Application',
    type: 'web' as const,
    url: TARGET_URL,
    scope: [`${TARGET_URL}/*`],
    technologies: ['React', 'Node.js', 'PostgreSQL'],
  };

  console.log('Analisando DNA de vulnerabilidades:\n');

  const vulnerabilities = [
    {
      name: 'SQL Injection',
      location: `${TARGET_URL}/api/users`,
      severity: 'critical' as const,
      evidence: ['error message exposed', 'time-based blind confirmed'],
    },
    {
      name: 'Cross-Site Scripting (XSS)',
      location: `${TARGET_URL}/search`,
      severity: 'high' as const,
      evidence: ['script tag reflected', 'alert executed'],
    },
  ];

  for (const vuln of vulnerabilities) {
    const dna = await engine.analyzeVulnerabilityDNA(vuln);
    console.log(`  ${vuln.name} (${vuln.severity})`);
    console.log(`    DNA ID: ${dna.id}`);
    console.log(`    Marcadores geneticos: ${dna.geneticMarkers.length}`);
    console.log(`    Vetores de propagacao: ${dna.propagationVectors.length}`);
    console.log('');
  }

  console.log('Mapeamento de Attack Surface:\n');
  
  const attackSurface = await engine.mapAttackSurface(target);
  console.log(`  Superficie de ataque: ${attackSurface.name}`);
  console.log(`  Pontos de entrada: ${attackSurface.entryPoints.length}`);
  console.log(`  Vulnerabilidades encontradas: ${attackSurface.vulnerabilities.length}`);
  console.log(`  Pontuacao de risco: ${attackSurface.riskScore}/100`);

  console.log('\nAvaliacao de Compliance (OWASP Top 10):');
  
  const compliance = await engine.assessCompliance('owasp_top_10', target);
  console.log(`  Score: ${(compliance.score * 100).toFixed(1)}%`);
  console.log(`  Status: ${compliance.status}`);
  
  if (compliance.nonCompliant.length > 0) {
    console.log(`  Itens nao conformes: ${compliance.nonCompliant.length}`);
  }

  console.log('\nRelatorio de Pentest:');
  
  const pentest = await engine.generatePentestReport(target);
  console.log(`  Risco geral: ${pentest.executiveSummary.overallRisk}`);
  console.log(`  Estatisticas: C:${pentest.executiveSummary.statistics.critical} H:${pentest.executiveSummary.statistics.high} M:${pentest.executiveSummary.statistics.medium}`);
  console.log(`  Total de findings: ${pentest.findings.length}`);
}

// ============================================================================
// MAIN - Executar todos os demos
// ============================================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     SitePulse Studio v3.0 - Demonstracao Completa           ║');
  console.log('║     10 Motores de IA para QA e Seguranca                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  try {
    await demoIntentEngine();
    await demoContextEngine();
    await demoDecisionEngine();
    await demoActionEngine();
    await demoPredictiveEngine();
    await demoAutonomousQA();
    await demoCyberSenior();

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     Demonstracao concluida com sucesso!                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n✗ Erro na demonstracao:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { main };
