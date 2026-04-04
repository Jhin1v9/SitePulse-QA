# 🚀 SITEPULSE STUDIO v3.0 - ESPECIFICAÇÃO INTERGALÁTICA

> **Documento para Kimi K2 (Browser) - Geração Completa da Interface**
> 
> **Data:** 2026-04-02 | **Versão:** 3.0.0 | **Código Nome:** Oráculo Cibernético

---

## 📋 SUMÁRIO EXECUTIVO

SitePulse Studio v3.0 é uma aplicação Electron com interface React + TypeScript que orquestra **10 motores de IA especializados** para análise de segurança web. Esta especificação contém TUDO necessário para construir a interface visual completa.

**Stack Tecnológico:**
- React 18 + TypeScript
- Vite 8 (build tool)
- CSS Puro (Design System customizado - SEM Tailwind)
- React Router DOM
- Recharts (gráficos)
- Electron 40 (runtime)

---

## 🏗️ ARQUITETURA DOS 10 MOTORES

Cada motor é um agente especializado com IA própria. A interface precisa representar visualmente o estado, capacidades e outputs de cada um.

### 1️⃣ MOTOR DE INTENÇÃO (Intent Engine)
**Propósito:** Analisar intenções por trás de vulnerabilidades
**Cor:** `#EC4899` (Rosa/Magenta)
**Ícone:** `Target` ou `Crosshair`

```typescript
interface IntentEngine {
  id: 'intent';
  name: 'Motor de Intenção';
  description: 'Analisa o contexto e intenção por trás de cada vulnerabilidade';
  capabilities: [
    'pattern_recognition',      // Reconhece padrões de ataque
    'context_analysis',         // Analisa contexto do código
    'intent_classification',    // Classifica intenções (maliciosa/neutra)
    'severity_prediction'       // Prediz severidade baseada em intenção
  ];
  status: 'idle' | 'analyzing' | 'learning';
  metrics: {
    patternsRecognized: number;
    accuracyRate: number;      // 0-100%
    avgAnalysisTime: number;   // ms
  };
}
```

**Visual na Interface:**
- Card com glow rosa quando ativo
- Gráfico de radar mostrando padrões reconhecidos
- Lista de intenções detectadas com badges de severidade

---

### 2️⃣ MOTOR DE CONTEXTO (Context Engine)
**Propósito:** Entender contexto business da aplicação
**Cor:** `#8B5CF6` (Violeta)
**Ícone:** `Globe` ou `Network`

```typescript
interface ContextEngine {
  id: 'context';
  name: 'Motor de Contexto';
  description: 'Compreende o contexto de negócio e prioriza vulnerabilidades críticas';
  capabilities: [
    'business_context_mapping', // Mapeia contexto de negócio
    'asset_prioritization',     // Prioriza assets críticos
    'threat_landscape',         // Mapeia ameaças relevantes
    'compliance_mapping'        // Mapeia para compliance (GDPR, etc)
  ];
  status: 'idle' | 'mapping' | 'prioritizing';
  metrics: {
    contextNodes: number;      // Nós de contexto mapeados
    criticalAssets: number;    // Assets críticos identificados
    complianceScore: number;   // 0-100
  };
}
```

**Visual na Interface:**
- Diagrama de grafo mostrando relações de contexto
- Heatmap de assets por criticidade
- Compliance badges (GDPR, PCI-DSS, etc)

---

### 3️⃣ MOTOR DE EVIDÊNCIA (Evidence Engine)
**Propósito:** Coletar e estruturar evidências de vulnerabilidades
**Cor:** `#06B6D4` (Ciano)
**Ícone:** `FileSearch` ou `Microscope`

```typescript
interface EvidenceEngine {
  id: 'evidence';
  name: 'Motor de Evidência';
  description: 'Coleta, estrutura e valida evidências de vulnerabilidades';
  capabilities: [
    'payload_generation',       // Gera payloads de prova
    'exploit_validation',       // Valida se exploit é real
    'evidence_chain',           // Cadeia de evidências
    'false_positive_filter'     // Filtra falsos positivos
  ];
  status: 'idle' | 'collecting' | 'validating';
  metrics: {
    evidencesCollected: number;
    validationRate: number;    // % de validação bem-sucedida
    falsePositivesBlocked: number;
  };
}
```

**Visual na Interface:**
- Lista de evidências com preview de código
- Badge de validação (✅ Validado, ⏳ Pendente, ❌ Falso Positivo)
- Cadeia de evidências em timeline

---

### 4️⃣ MOTOR DE MEMÓRIA (Memory Engine)
**Propósito:** Aprender com análises anteriores
**Cor:** `#F59E0B` (Âmbar/Laranja)
**Ícone:** `Database` ou `Brain`

```typescript
interface MemoryEngine {
  id: 'memory';
  name: 'Motor de Memória';
  description: 'Armazena aprendizados e reconhece padrões históricos';
  capabilities: [
    'pattern_storage',          // Armazena padrões aprendidos
    'historical_analysis',      // Analisa histórico
    'similarity_detection',     // Detecta similaridades
    'knowledge_synthesis'       // Sintetiza conhecimento
  ];
  status: 'idle' | 'recalling' | 'storing';
  metrics: {
    patternsStored: number;
    recallAccuracy: number;    // % de acurácia na recuperação
    knowledgeGraphSize: number; // MB
  };
}
```

**Visual na Interface:**
- Visualização de grafo de conhecimento
- Timeline de aprendizados
- Similaridade com análises anteriores (%)

---

### 5️⃣ MOTOR DE APRENDIZADO (Learning Engine)
**Propósito:** Melhorar continuamente com feedback
**Cor:** `#10B981` (Esmeralda)
**Ícone:** `TrendingUp` ou `GraduationCap`

```typescript
interface LearningEngine {
  id: 'learning';
  name: 'Motor de Aprendizado';
  description: 'Aprende continuamente com feedback e novas ameaças';
  capabilities: [
    'feedback_integration',     // Integra feedback do usuário
    'model_retraining',         // Retreina modelos
    'adaptation_tracking',      // Tracking de adaptação
    'performance_optimization'  // Otimiza performance
  ];
  status: 'idle' | 'training' | 'optimizing';
  metrics: {
    modelsTrained: number;
    accuracyImprovement: number; // % de melhoria
    lastTraining: Date;
  };
}
```

**Visual na Interface:**
- Gráfico de evolução de acurácia
- Status de treinamento (barra de progresso)
- Métricas de melhoria ao longo do tempo

---

### 6️⃣ MOTOR DE DECISÃO (Decision Engine)
**Propósito:** Orquestrar ações entre motores
**Cor:** `#6366F1` (Índigo)
**Ícone:** `GitBranch` ou `Sitemap`

```typescript
interface DecisionEngine {
  id: 'decision';
  name: 'Motor de Decisão';
  description: 'Orquestra ações e toma decisões baseadas em múltiplas fontes';
  capabilities: [
    'multi_criteria_analysis',  // Análise multi-critério
    'action_prioritization',    // Priorização de ações
    'resource_allocation',      // Alocação de recursos
    'conflict_resolution'       // Resolução de conflitos
  ];
  status: 'idle' | 'deciding' | 'executing';
  metrics: {
    decisionsMade: number;
    avgDecisionTime: number;   // ms
    successRate: number;       // % de decisões bem-sucedidas
  };
}
```

**Visual na Interface:**
- Árvore de decisões
- Matriz de priorização
- Fluxograma de ações executadas

---

### 7️⃣ MOTOR DE AÇÃO (Action Engine)
**Propósito:** Executar ações corretivas
**Cor:** `#EF4444` (Vermelho)
**Ícone:** `Zap` ou `Play`

```typescript
interface ActionEngine {
  id: 'action';
  name: 'Motor de Ação';
  description: 'Executa ações corretivas e testa mitigações';
  capabilities: [
    'automated_remediation',    // Remediação automatizada
    'patch_generation',         // Geração de patches
    'rollback_capability',      // Capacidade de rollback
    'impact_simulation'         // Simulação de impacto
  ];
  status: 'idle' | 'executing' | 'verifying';
  metrics: {
    actionsExecuted: number;
    successRate: number;
    avgExecutionTime: number;
  };
}
```

**Visual na Interface:**
- Lista de ações executadas com status
- Botão de "Executar Ação" com confirmação
- Log de execuções em tempo real

---

### 8️⃣ MOTOR PREDITIVO (Predictive Engine)
**Propósito:** Prever vulnerabilidades futuras
**Cor:** `#3B82F6` (Azul)
**Ícone:** `CrystalBall` ou `Eye`

```typescript
interface PredictiveEngine {
  id: 'predictive';
  name: 'Motor Preditivo';
  description: 'Prevê vulnerabilidades futuras e tendências';
  capabilities: [
    'trend_analysis',           // Análise de tendências
    'vulnerability_forecast',   // Previsão de vulnerabilidades
    'risk_scoring',             // Scoring de risco
    'temporal_patterns'         // Padrões temporais
  ];
  status: 'idle' | 'forecasting' | 'analyzing';
  metrics: {
    predictionsMade: number;
    accuracyRate: number;
    forecastHorizon: number;   // dias
  };
}
```

**Visual na Interface:**
- Gráfico de previsões futuras
- Timeline de riscos previstos
- Heatmap de probabilidade de vulnerabilidades

---

### 9️⃣ MOTOR AUTÔNOMO (Autonomous Engine)
**Propósito:** Operação autônoma completa
**Cor:** `#14B8A6` (Teal)
**Ícone:** `Bot` ou `Cpu`

```typescript
interface AutonomousEngine {
  id: 'autonomous';
  name: 'Motor Autônomo';
  description: 'Opera de forma totalmente autônoma quando habilitado';
  capabilities: [
    'self_healing',             // Auto-cura de problemas
    'continuous_monitoring',    // Monitoramento contínuo
    'automatic_reporting',      // Relatórios automáticos
    'escalation_protocols'      // Protocolos de escalonamento
  ];
  status: 'idle' | 'autonomous' | 'monitoring';
  metrics: {
    uptime: number;            // %
    issuesAutoResolved: number;
    escalationCount: number;
  };
  settings: {
    autonomyLevel: 'none' | 'assisted' | 'semi' | 'full';
    maxConcurrentActions: number;
  };
}
```

**Visual na Interface:**
- Toggle de modo autônomo (ON/OFF)
- Dashboard de uptime
- Lista de ações autônomas tomadas
- Configuração de nível de autonomia

---

### 🔟 MOTOR DE SEGURANÇA (Security Engine)
**Propósito:** Proteger a própria plataforma
**Cor:** `#DC2626` (Vermelho Escuro)
**Ícone:** `Shield` ou `Lock`

```typescript
interface SecurityEngine {
  id: 'security';
  name: 'Motor de Segurança';
  description: 'Protege a plataforma contra ataques e garante integridade';
  capabilities: [
    'self_protection',          // Auto-proteção
    'integrity_verification',   // Verificação de integridade
    'threat_detection',         // Detecção de ameaças
    'audit_logging'             // Logging de auditoria
  ];
  status: 'idle' | 'protecting' | 'alert';
  metrics: {
    threatsBlocked: number;
    integrityChecks: number;
    auditLogSize: number;      // MB
  };
}
```

**Visual na Interface:**
- Shield animado quando protegendo
- Lista de ameaças bloqueadas
- Status de integridade (✅ Sistema Seguro)

---

## 🎨 DESIGN SYSTEM - ORÁCULO CIBERNÉTICO

### Paleta de Cores Principal

```css
:root {
  /* Cores Primárias */
  --sp-primary: #6366F1;
  --sp-primary-light: #818CF8;
  --sp-primary-dark: #4F46E5;
  
  /* Backgrounds */
  --sp-bg-primary: #0F172A;      /* Fundo principal - Azul escuro */
  --sp-bg-secondary: #1E293B;     /* Cards/secundário */
  --sp-bg-tertiary: #334155;      /* Elementos terciários */
  --sp-bg-glass: rgba(30, 41, 59, 0.7);  /* Efeito vidro */
  
  /* Texto */
  --sp-text-primary: #F8FAFC;     /* Branco */
  --sp-text-secondary: #CBD5E1;   /* Cinza claro */
  --sp-text-tertiary: #94A3B8;    /* Cinza médio */
  --sp-text-muted: #64748B;       /* Cinza escuro */
  
  /* Bordas */
  --sp-border-subtle: rgba(255, 255, 255, 0.05);
  --sp-border-light: rgba(255, 255, 255, 0.1);
  --sp-border-medium: rgba(255, 255, 255, 0.2);
  
  /* Cores dos Motores */
  --engine-intent: #EC4899;
  --engine-context: #8B5CF6;
  --engine-evidence: #06B6D4;
  --engine-memory: #F59E0B;
  --engine-learning: #10B981;
  --engine-decision: #6366F1;
  --engine-action: #EF4444;
  --engine-predictive: #3B82F6;
  --engine-autonomous: #14B8A6;
  --engine-security: #DC2626;
}
```

### Tipografia

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-display: 'Space Grotesk', sans-serif;
  
  /* Tamanhos */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
}
```

### Espaçamento

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
}
```

### Efeitos Visuais

```css
/* Glassmorphism */
.glass {
  background: var(--sp-bg-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--sp-border-light);
}

/* Glow Effects */
.glow-primary { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4); }
.glow-intent { box-shadow: 0 0 20px rgba(236, 72, 153, 0.4); }
.glow-action { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

/* Gradient Backgrounds */
.bg-gradient-1 {
  background: linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%);
}

/* Animações */
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-card-enter {
  animation: card-enter 0.4s ease-out forwards;
}
```

---

## 📁 ESTRUTURA DE COMPONENTES

### Árvore de Componentes

```
App
├── Layout
│   ├── Sidebar (navegação entre workspaces)
│   ├── Header (título, ações globais)
│   └── Main Content Area
│       └── Router Outlet
├── Workspaces (8 áreas)
│   ├── Dashboard (visão geral)
│   ├── Engines (controle dos 10 motores)
│   ├── Findings (vulnerabilidades)
│   ├── Scanner (escaneamento)
│   ├── Reports (relatórios)
│   ├── Settings (configurações)
│   └── Metrics (métricas avançadas)
├── Modais
│   ├── CommandPalette (Ctrl+K)
│   ├── EngineDetail (detalhes do motor)
│   └── SettingsModal
└── Overlays
    ├── ToastContainer
    └── LoadingScreen
```

### Componentes Essenciais

#### 1. EngineCard
```typescript
interface EngineCardProps {
  engine: Engine;
  isActive: boolean;
  onActivate: () => void;
  onViewDetails: () => void;
}

// Visual: Card com glow da cor do motor, status indicator,
// métricas principais, botão de ativar/desativar
```

#### 2. MetricCard
```typescript
interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ReactNode;
  color: string;
}

// Visual: Card com ícone, valor grande, tendência com seta
```

#### 3. StatusBadge
```typescript
interface StatusBadgeProps {
  status: 'idle' | 'active' | 'error' | 'warning' | 'success';
  text: string;
  pulse?: boolean;
}

// Visual: Badge com cor correspondente, ponto indicador
// opcionalmente com animação de pulse
```

#### 4. FindingRow
```typescript
interface FindingRowProps {
  finding: {
    id: string;
    title: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    engine: string;
    status: 'new' | 'investigating' | 'resolved' | 'false_positive';
    timestamp: Date;
  };
  onClick: () => void;
}

// Visual: Linha de tabela com indicador de severidade,
// badge do motor, status, data
```

---

## 📱 WORKSPACES (TELAS)

### Workspace 1: Dashboard
**Rota:** `/`
**Propósito:** Visão geral do sistema

**Elementos:**
1. **Grid de Status dos Motores** (10 cards em grid 5x2)
   - Cada card mostra: nome, status, métrica principal
   - Glow na cor do motor quando ativo
   - Clique leva ao workspace de Engines

2. **Métricas Principais** (4 cards na linha)
   - Total de Findings
   - Findings Críticos (P0)
   - Taxa de Acurácia
   - Tempo Médio de Análise

3. **Gráfico de Atividade**
   - Sparkline dos últimos 7 dias
   - Barras coloridas por tipo de atividade

4. **Últimos Findings** (lista)
   - Top 5 findings mais recentes
   - Severidade colorida
   - Link para ver todos

5. **Status do Sistema**
   - Barra lateral ou footer
   - Versão, uptime, último scan

---

### Workspace 2: Engines
**Rota:** `/engines`
**Propósito:** Controle detalhado dos 10 motores

**Elementos:**
1. **Lista/Grid de Motores**
   - Modo Grid: Cards grandes com gráficos
   - Modo Lista: Linhas compactas

2. **Detalhe do Motor Selecionado** (painel lateral ou modal)
   ```typescript
   interface EngineDetailPanel {
     engine: Engine;
     realtimeMetrics: Metric[];
     activityLog: LogEntry[];
     configuration: EngineConfig;
   }
   ```

3. **Ações por Motor**
   - Ativar/Desativar toggle
   - Configurar parâmetros
   - Ver logs
   - Executar ação manual (se aplicável)

4. **Visualizações Específicas por Motor:**
   - Intent: Gráfico radar de padrões
   - Context: Grafo de relacionamentos
   - Evidence: Timeline de evidências
   - Memory: Nuvem de conhecimento
   - Learning: Gráfico de evolução
   - Decision: Árvore de decisões
   - Action: Log de ações
   - Predictive: Gráfico de previsões
   - Autonomous: Status de autonomia
   - Security: Lista de ameaças bloqueadas

---

### Workspace 3: Findings
**Rota:** `/findings`
**Propósito:** Gerenciar vulnerabilidades descobertas

**Elementos:**
1. **Filtros e Busca**
   - Search bar
   - Filtro por severidade (chips)
   - Filtro por motor (dropdown)
   - Filtro por status
   - Date range picker

2. **Tabela de Findings**
   - Colunas: ID, Título, Severidade, Motor, Status, Data, Ações
   - Ordenação por coluna
   - Paginação ou infinite scroll
   - Seleção múltipla (checkbox)

3. **Ações em Lote**
   - Marcar como resolvido
   - Marcar como falso positivo
   - Exportar selecionados
   - Deletar

4. **Detalhe do Finding** (drawer ou modal)
   - Título e descrição completa
   - Código vulnerável (syntax highlighted)
   - Evidências
   - Recomendação de fix
   - Histórico de ações

---

### Workspace 4: Scanner
**Rota:** `/scanner`
**Propósito:** Configurar e executar scans

**Elementos:**
1. **Configuração de Scan**
   - Input de URL/Target
   - Seleção de motores a usar
   - Opções avançadas (accordion)
   - Templates de scan pré-definidos

2. **Status do Scan Atual**
   - Progress bar animada
   - Logs em tempo real (terminal-like)
   - Motores em execução (indicadores)
   - ETA e itens processados

3. **Histórico de Scans**
   - Lista de scans anteriores
   - Status (completed, failed, running)
   - Relatório rápido

---

### Workspace 5: Reports
**Rota:** `/reports`
**Propósito:** Gerar e visualizar relatórios

**Elementos:**
1. **Gerador de Relatório**
   - Seleção de período
   - Seleção de motores
   - Formato (PDF, HTML, JSON)
   - Template (executive, technical, compliance)

2. **Lista de Relatórios Gerados**
   - Preview thumbnail
   - Data de geração
   - Download/Compartilhar
   - Deletar

3. **Visualizador de Relatório**
   - Modo preview
   - Gráficos interativos
   - Export options

---

### Workspace 6: Metrics
**Rota:** `/metrics`
**Propósito:** Métricas avançadas e analytics

**Elementos:**
1. **Dashboard de Métricas**
   - Múltiplos gráficos (line, bar, pie, heatmap)
   - Time range selector
   - Comparativo períodos

2. **Métricas por Motor**
   - Drill-down em cada motor
   - Performance trends
   - Resource usage

3. **Exportação de Dados**
   - CSV, JSON, Excel

---

### Workspace 7: Settings
**Rota:** `/settings`
**Propósito:** Configurações da aplicação

**Elementos:**
1. **Tabs de Configuração**
   - Geral (tema, idioma, notificações)
   - Motores (configurações individuais)
   - Integrações (Slack, Jira, etc)
   - API Keys
   - Backup/Restore

2. **Configurações por Motor**
   - Sliders de sensibilidade
   - Toggle de features
   - Webhooks

---

### Workspace 8: Orchestrator
**Rota:** `/orchestrator`
**Propósito:** Visão global de orquestração

**Elementos:**
1. **Diagrama de Fluxo**
   - Visualização dos motores interconectados
   - Setas mostrando fluxo de dados
   - Animação de atividade

2. **Controles de Orquestração**
   - Play/Pause global
   - Modo autônomo toggle
   - Priorização global

3. **Status de Integração**
   - Health check de cada motor
   - Latência entre comunicações
   - Fila de processamento

---

## 🔌 INTEGRAÇÃO COM ELECTRON

### EventBus (Comunicação)

A interface se comunica com o main process via EventBus:

```typescript
// Eventos da Interface -> Main
interface ToMainEvents {
  'engine:activate': { engineId: string };
  'engine:deactivate': { engineId: string };
  'engine:configure': { engineId: string; config: any };
  'scan:start': { target: string; engines: string[] };
  'scan:stop': { scanId: string };
  'finding:update': { findingId: string; status: string };
  'report:generate': { format: string; period: DateRange };
}

// Eventos do Main -> Interface
interface ToRendererEvents {
  'engine:status': { engineId: string; status: EngineStatus };
  'engine:metrics': { engineId: string; metrics: Metrics };
  'finding:new': { finding: Finding };
  'finding:updated': { finding: Finding };
  'scan:progress': { scanId: string; progress: number };
  'scan:complete': { scanId: string; findings: Finding[] };
  'system:notification': { type: string; message: string };
}
```

### Global Store (Estado)

```typescript
interface GlobalState {
  engines: Record<string, Engine>;
  findings: Finding[];
  activeScan: Scan | null;
  systemStatus: {
    version: string;
    uptime: number;
    lastScan: Date | null;
  };
  settings: AppSettings;
}
```

---

## 🎯 PROMPTS PARA GERAÇÃO DE CÓDIGO

Use estes prompts com o Kimi K2 para gerar cada parte:

### Prompt 1: Setup Inicial
```
Crie uma aplicação React + TypeScript + Vite com a seguinte estrutura:

ESTRUTURA DE PASTAS:
src/
  components/
    common/          (Button, Card, Badge, etc)
    engines/         (EngineCard, EngineGrid, etc)
    layout/          (Sidebar, Header, Layout)
    charts/          (Sparkline, BarChart, Gauge)
  screens/
    Dashboard.tsx
    Engines.tsx
    Findings.tsx
    Scanner.tsx
    Reports.tsx
    Metrics.tsx
    Settings.tsx
    Orchestrator.tsx
  hooks/
    useEngines.ts
    useFindings.ts
    useEventBus.ts
  store/
    index.ts
  styles/
    globals.css
    design-tokens.css
  types/
    index.ts
  App.tsx
  main.tsx

REQUISITOS:
- Use CSS Modules ou CSS puro (NÃO use Tailwind)
- React Router DOM para navegação
- Design System com tema escuro "Oráculo Cibernético"
- Cores fornecidas na especificação
- Tipografia: Inter, JetBrains Mono, Space Grotesk
```

### Prompt 2: Design System
```
Crie o arquivo src/styles/design-tokens.css com:

1. Todas as variáveis CSS listadas na especificação
2. Classes utilitárias (.sp-flex, .sp-grid, .sp-gap-*, etc)
3. Componentes base (.sp-card, .sp-btn, .sp-input)
4. Animações (card-enter, pulse-glow, etc)
5. Efeitos de glassmorphism
6. Cores específicas dos 10 motores

REQUISITOS:
- CSS vanilla, sem frameworks
- Variáveis semânticas e consistentes
- Suporte a prefers-reduced-motion
- Classes com prefixo "sp-" para evitar conflito
```

### Prompt 3: Componente EngineCard
```
Crie o componente EngineCard em src/components/engines/EngineCard.tsx:

PROPS:
interface EngineCardProps {
  engine: {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    status: 'idle' | 'active' | 'error';
    metrics: {
      primary: number;
      secondary: number;
    };
    isActive: boolean;
  };
  onActivate: () => void;
  onViewDetails: () => void;
}

VISUAL:
- Card com fundo glassmorphism
- Borda com glow na cor do motor quando isActive=true
- Ícone do motor no topo
- Nome e descrição
- Métricas principais em destaque
- Toggle switch para ativar/desativar
- Botão "Ver detalhes"

ANIMAÇÕES:
- Hover: lift e aumento de glow
- Ativação: pulse na cor do motor
- Entrada: fade-in com stagger

ESTADO:
- Quando ativo, mostrar indicador pulsante
- Quando erro, mostrar badge vermelho
```

### Prompt 4: Dashboard Screen
```
Crie a tela Dashboard em src/screens/Dashboard.tsx:

LAYOUT:
- Header com título "SitePulse Studio" e versão
- Grid 5x2 dos 10 EngineCards
- Seção de métricas principais (4 cards)
- Gráfico de atividade (últimos 7 dias)
- Lista dos últimos 5 findings

DADOS MOCK:
Crie dados mock para todos os 10 motores com:
- Nomes, cores, ícones da especificação
- Métricas realistas
- Status variados

GRÁFICO:
Use Recharts para criar:
- Gráfico de barras mostrando findings por dia
- Cores das barras correspondem aos motores

INTERAÇÕES:
- Clique em EngineCard navega para /engines
- Clique em finding abre modal de detalhes
- Botão "Novo Scan" no header

REQUISITOS:
- Layout responsivo (grid adapta em telas menores)
- Animações de entrada suaves
- Glassmorphism nos cards
```

### Prompt 5: Sidebar de Navegação
```
Crie o componente Sidebar em src/components/layout/Sidebar.tsx:

ITENS DE NAVEGAÇÃO (8 workspaces):
1. Dashboard (LayoutDashboard icon)
2. Engines (Cpu icon)
3. Findings (ShieldAlert icon)
4. Scanner (ScanLine icon)
5. Reports (FileText icon)
6. Metrics (BarChart3 icon)
7. Settings (Settings icon)
8. Orchestrator (Network icon)

VISUAL:
- Largura fixa 280px
- Fundo glassmorphism
- Logo "SitePulse" no topo
- Lista de navegação com ícones
- Item ativo com highlight na cor primária
- Badge de notificações nos itens relevantes
- Footer com status do sistema

ANIMAÇÕES:
- Hover nos itens: deslize sutil à direita
- Indicador de ativo: barra lateral animada

INTERAÇÕES:
- Clique muda de rota
- Tooltip em collapsed mode
- Toggle para modo compacto (apenas ícones)
```

### Prompt 6: Tela de Findings
```
Crie a tela Findings em src/screens/Findings.tsx:

COMPONENTES:
1. Header com título e botão "Exportar"
2. Barra de filtros:
   - Search input
   - Chips de severidade (Critical, High, Medium, Low)
   - Dropdown de motor
   - Dropdown de status
3. Tabela de findings com colunas:
   - Checkbox (seleção múltipla)
   - ID (truncado)
   - Título
   - Severidade (badge colorido)
   - Motor (badge com cor)
   - Status (badge)
   - Data
   - Ações (ícones)
4. Paginação
5. Ações em lote (aparece quando itens selecionados)

DADOS MOCK:
Crie 20+ findings mock com:
- IDs realistas (CVE-2026-XXXX)
- Títulos variados
- Todas as severidades
- Diferentes motores
- Status variados
- Datas recentes

INTERAÇÕES:
- Ordenação por coluna
- Filtros aplicam em tempo real
- Clique abre drawer de detalhes
- Seleção múltipla habilita ações em lote
```

### Prompt 7: Sistema de Notificações (Toast)
```
Crie o sistema de Toast em src/components/common/Toast.tsx:

TIPOS DE TOAST:
- success (verde)
- error (vermelho)
- warning (âmbar)
- info (azul)

INTERFACE:
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

COMPONENTES:
1. ToastItem: Card individual com ícone, título, mensagem, botão fechar
2. ToastContainer: Container fixo no canto superior direito, empilha toasts

ANIMAÇÕES:
- Entrada: slide da direita + fade
- Saída: slide para direita + fade
- Auto-dismiss com barra de progresso

HOOK:
Create useToast() hook para:
- addToast(toast: Omit<Toast, 'id'>)
- removeToast(id: string)
- toasts: Toast[]

EXEMPLO DE USO:
const { addToast } = useToast();
addToast({ type: 'success', title: 'Scan completo!', message: '10 findings encontrados' });
```

### Prompt 8: Command Palette
```
Crie o Command Palette em src/components/common/CommandPalette.tsx:

FUNCIONALIDADE:
- Atalho Ctrl+K para abrir
- Overlay escuro com modal centralizado
- Input de busca no topo
- Lista de comandos filtráveis
- Navegação com arrow keys
- Enter para executar
- Esc para fechar

COMANDOS:
[
  { id: 'goto-dashboard', label: 'Ir para Dashboard', shortcut: '⌘1', action: () => {} },
  { id: 'goto-engines', label: 'Ir para Engines', shortcut: '⌘2', action: () => {} },
  { id: 'scan-start', label: 'Iniciar Scan', shortcut: '⌘⇧S', action: () => {} },
  { id: 'toggle-theme', label: 'Alternar Tema', action: () => {} },
  { id: 'engine-activate-all', label: 'Ativar Todos Motores', action: () => {} },
  // ... mais comandos
]

VISUAL:
- Modal com fundo glassmorphism
- Input com ícone de busca
- Itens destacados no hover/seleção
- Badges de atalho de teclado
- Categorias (Navegação, Ações, Configurações)

ANIMAÇÕES:
- Entrada: scale de 0.95 para 1 + fade
- Itens: highlight suave no hover
```

---

## 📦 CÓDIGOS DE REFERÊNCIA

### Estrutura de Tipos Completa

```typescript
// src/types/index.ts

export type EngineId = 
  | 'intent' | 'context' | 'evidence' | 'memory' | 'learning'
  | 'decision' | 'action' | 'predictive' | 'autonomous' | 'security';

export type EngineStatus = 'idle' | 'active' | 'error' | 'warning' | 'learning';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 'new' | 'investigating' | 'resolved' | 'false_positive' | 'accepted_risk';

export interface Engine {
  id: EngineId;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: EngineStatus;
  isActive: boolean;
  capabilities: string[];
  metrics: Record<string, number>;
  lastActivity?: Date;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  engine: EngineId;
  status: FindingStatus;
  target: string;
  evidence: Evidence[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  cwe?: string;
  cvss?: number;
}

export interface Evidence {
  id: string;
  type: 'code' | 'request' | 'response' | 'screenshot' | 'log';
  content: string;
  language?: string;
  timestamp: Date;
}

export interface Scan {
  id: string;
  target: string;
  engines: EngineId[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  findings: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface Metric {
  timestamp: Date;
  engineId: EngineId;
  name: string;
  value: number;
}
```

### Hook useEngines

```typescript
// src/hooks/useEngines.ts
import { useState, useEffect, useCallback } from 'react';
import { Engine, EngineId } from '../types';
import { eventBus } from '../lib/eventBus';

export function useEngines() {
  const [engines, setEngines] = useState<Record<EngineId, Engine>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento inicial
    const mockEngines: Record<EngineId, Engine> = {
      intent: {
        id: 'intent',
        name: 'Motor de Intenção',
        description: 'Analisa intenções por trás de vulnerabilidades',
        color: '#EC4899',
        icon: 'Target',
        status: 'idle',
        isActive: true,
        capabilities: ['pattern_recognition', 'context_analysis'],
        metrics: { patternsRecognized: 42, accuracyRate: 94 }
      },
      // ... outros motores
    };
    
    setEngines(mockEngines);
    setLoading(false);

    // Ouvir atualizações
    const unsubscribe = eventBus.on('engine:status', (data) => {
      setEngines(prev => ({
        ...prev,
        [data.engineId]: { ...prev[data.engineId as EngineId], status: data.status }
      }));
    });

    return unsubscribe;
  }, []);

  const activateEngine = useCallback((engineId: EngineId) => {
    eventBus.emit('engine:activate', { engineId });
  }, []);

  const deactivateEngine = useCallback((engineId: EngineId) => {
    eventBus.emit('engine:deactivate', { engineId });
  }, []);

  return {
    engines,
    loading,
    activateEngine,
    deactivateEngine,
    getActiveEngines: () => Object.values(engines).filter(e => e.isActive)
  };
}
```

### Mock de Dados

```typescript
// src/lib/mockData.ts

export const mockEngines = [
  {
    id: 'intent',
    name: 'Motor de Intenção',
    description: 'Analisa intenções por trás de vulnerabilidades',
    color: '#EC4899',
    icon: 'Target',
    status: 'idle',
    isActive: true,
    capabilities: ['pattern_recognition', 'context_analysis', 'intent_classification'],
    metrics: { patternsRecognized: 42, accuracyRate: 94, avgAnalysisTime: 120 }
  },
  {
    id: 'context',
    name: 'Motor de Contexto',
    description: 'Compreende o contexto de negócio',
    color: '#8B5CF6',
    icon: 'Globe',
    status: 'active',
    isActive: true,
    capabilities: ['business_context_mapping', 'asset_prioritization'],
    metrics: { contextNodes: 156, criticalAssets: 12, complianceScore: 87 }
  },
  // ... complete com todos os 10 motores
];

export const mockFindings = [
  {
    id: 'CVE-2026-1024',
    title: 'SQL Injection em login.php',
    description: 'Parâmetro "user" vulnerável a injeção SQL',
    severity: 'critical',
    engine: 'intent',
    status: 'new',
    target: 'https://exemplo.com/login.php',
    createdAt: new Date('2026-04-02T10:30:00'),
    evidence: []
  },
  // ... mais findings
];
```

---

## 🚀 CHECKLIST DE IMPLEMENTAÇÃO

Use esta lista para verificar progresso:

### Fase 1: Setup
- [ ] Criar estrutura de pastas
- [ ] Configurar Vite + React + TypeScript
- [ ] Configurar React Router
- [ ] Instalar dependências (recharts, lucide-react)

### Fase 2: Design System
- [ ] Criar design-tokens.css
- [ ] Criar componentes base (Button, Card, Badge)
- [ ] Criar tipografia
- [ ] Criar sistema de cores

### Fase 3: Layout
- [ ] Criar componente Layout
- [ ] Criar Sidebar com navegação
- [ ] Criar Header
- [ ] Implementar navegação entre workspaces

### Fase 4: Workspaces Principais
- [ ] Dashboard com grid de motores
- [ ] Engines com detalhes
- [ ] Findings com tabela
- [ ] Scanner com status

### Fase 5: Funcionalidades
- [ ] Command Palette (Ctrl+K)
- [ ] Sistema de Toast
- [ ] Modais
- [ ] Filtros e busca

### Fase 6: Polimento
- [ ] Animações
- [ ] Responsividade
- [ ] Acessibilidade
- [ ] Loading states
- [ ] Error states

---

## 📝 NOTAS IMPORTANTES

1. **NÃO use Tailwind CSS** - O projeto usa CSS puro com design system customizado

2. **Classes prefixadas com "sp-"** - Todas as classes utilitárias usam prefixo "sp-" para evitar conflito (ex: `.sp-flex`, `.sp-text-primary`)

3. **Cores dos motores** - Sempre use as cores exatas da especificação para cada motor

4. **Ícones** - Use Lucide React (`lucide-react` package)

5. **Glassmorphism** - Use `backdrop-filter: blur(12px)` para efeito de vidro

6. **Animações** - Prefira `transform` e `opacity` para performance

7. **Mock data** - Crie dados mock realistas para testar a interface

8. **EventBus** - Use pub/sub para comunicação entre componentes (simulando a integração futura com Electron)

---

## 🎓 EXEMPLO DE FLUXO COMPLETO

```
Usuário abre aplicação
    ↓
Dashboard carrega com:
  - 10 EngineCards (alguns ativos, alguns idle)
  - Métricas principais
  - Gráfico de atividade
  - Lista de últimos findings
    ↓
Usuário clica em "Motor de Intenção"
    ↓
Navega para /engines com foco no motor
    ↓
Painel de detalhes mostra:
  - Status em tempo real
  - Métricas detalhadas
  - Gráfico de padrões reconhecidos
  - Botão para ativar/desativar
    ↓
Usuário ativa o motor
    ↓
Toast aparece: "Motor de Intenção ativado"
    ↓
Card do motor ganha glow rosa pulsante
    ↓
Métricas começam a atualizar em tempo real
```

---

**FIM DA ESPECIFICAÇÃO**

> **Próximo passo:** Use os prompts acima com o Kimi K2 para gerar cada parte da interface. Depois que a interface estiver pronta, o Kimi CLI irá integrar com os motores reais do Electron.
