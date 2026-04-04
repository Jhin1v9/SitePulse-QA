# SitePulse V3 — Arquitetura Completa

## Resumo das 7 Fases Implementadas

### ✅ FASE 1 — Fundação Técnica
**Arquivos:** `companion/src/core/`

- `types.ts` — Tipos TypeScript strict para todo o sistema
- `system-state-machine.ts` — Máquina de estados finita (8 modos: GENESIS, RECONNAISSANCE, ANALYSIS, SIMULATION, HEALING, VALIDATION, STASIS, CRISIS)
- `ai-consciousness-machine.ts` — FSM de consciência da IA (8 estados com configurações visuais)
- `event-bus.ts` — Barramento de eventos tipado com integração ao DataBridge legado

**Características:**
- Zero `any` types
- Guards em todas as transições
- Eventos correlacionados (correlationId/causationId)

---

### ✅ FASE 2 — AI Provider Abstraction
**Arquivos:** `companion/src/providers/`

- `ai-provider.ts` — Classe abstrata base
- `openai-adapter.ts` — Adapter OpenAI (GPT-4o, GPT-4o-mini)
- `deepseek-adapter.ts` — Adapter DeepSeek (deepseek-chat, deepseek-coder)
- `intelligent-router.ts` — Roteamento inteligente baseado em heurísticas
- `provider-registry.ts` — Cascata com fallback automático

**Características:**
- Estimativa de custos em tempo real
- Fallback automático (DeepSeek → OpenAI → Offline)
- Métricas de latência e taxa de sucesso
- Modo offline com respostas heurísticas

---

### ✅ FASE 3 — AI Entity Visual
**Arquivos:** `companion/src/components/`

- `ai-operator-entity.ts` — Componente de entidade 3D
- `ai-operator-entity.css` — Animações CSS 3D

**Estados Visuais:**
| Estado | Cor | Animação |
|--------|-----|----------|
| DORMANT | Indigo (#6366f1) | Respiração lenta |
| AWARE | Violeta (#818cf8) | Pulso suave |
| ANALYZING | Rosa (#ec4899) | Rápido, intenso |
| HYPOTHESIZING | Púrpura (#a855f7) | Orbital acelerado |
| EXECUTING | Esmeralda (#10b981) | Rápido, estável |
| REFLECTING | Azul cielo (#38bdf8) | Respiração média |
| WARNING | Rojo (#f43f5e) | Pulso urgente |
| TEACHING | Ámbar (#f59e0b) | Pulso educativo |

**Recursos:**
- Orbital ring com partículas
- Core orb com glow dinâmico
- Variantes: orb, cube
- Tamanhos: default, compact, large

---

### ✅ FASE 4 — Healing UI + Connector
**Arquivos:** `companion/src/components/`

- `healing-connector.ts` — Conector ao healing-engine-service.mjs

**APIs Conectadas:**
- `analyzeFinding()` — Análise de viabilidade
- `generateStrategies()` — Gera estratégias de healing
- `applyHealing()` — Aplica correção (shadow/staging/autonomous)
- `rollbackHealing()` — Reverte alterações
- `verifyHealing()` — Verifica com testes
- `getHealingHistory()` — Histórico de sesiones

**Modos de Operação:**
- `shadow` — Simulação, sem alterações
- `staging` — Aplica em ambiente de teste
- `autonomous` — Aplicação direta com rollback automático

---

### ✅ FASE 5 — Security Engine
**Arquivos:** `companion/src/security/`

- `attack-surface.ts` — Analisador de superficie de ataque
  - PageRank para identificar nós críticos
  - Busca de caminhos de ataque (BFS)
  - Métricas de densidade e grau médio

- `vulnerability-dna.ts` — Banco de assinaturas de vulnerabilidades
  - SQL Injection (CWE-89)
  - XSS Reflejado (CWE-79)
  - Autenticação débil (CWE-916)
  - Criptografia quebrada (CWE-327)
  - Configuração insegura (CWE-489)
  - Vazamento de informação (CWE-200)
  - Race conditions (CWE-362)

**Exportação SARIF** compatível com ferramentas de segurança enterprise.

---

### ✅ FASE 6 — Knowledge Graph
**Arquivos:** `companion/src/memory/`

- `knowledge-graph.ts` — Grafo em memória

**Tipos de Nós:**
- `bug` — Problemas detectados
- `fix` — Correções aplicadas
- `pattern` — Padrões aprendidos
- `decision` — Decisões arquiteturais
- `file` — Arquivos do projeto

**Relações:**
- `caused_by` → Causalidade
- `fixed_by` → Correção
- `similar_to` → Similaridade
- `depends_on` → Dependência
- `introduced_by` → Origem
- `mitigated_by` → Mitigação

**Recursos:**
- Busca de bugs similares
- Sugestão de fixes baseada em histórico
- Exportação Cytoscape/GEXF/JSON

---

### ✅ FASE 7 — CommandBar + DiffViewer
**Arquivos:** `companion/src/components/`

- `command-bar.ts` — Paleta de comandos Cmd+K
  - Navegação rápida entre workspaces
  - Atalhos configuráveis
  - Categorização automática
  - Busca fuzzy

- `diff-viewer.ts` — Visualizador de diffs premium
  - Syntax highlighting
  - Números de linha
  - Estatísticas (+/-)
  - Ações: Aplicar, Copiar, Rechazar
  - Formato unified diff

---

## Como Usar

### Inicialização
```typescript
import { initializeV3 } from './sitepulse-v3.js';

const { fsm, ai, registry, knowledge, events } = initializeV3({
  openaiApiKey: 'sk-...',
  deepseekApiKey: 'sk-...',
  defaultProvider: 'deepseek'
});
```

### Transições de Estado
```typescript
fsm.transition('ANALYSIS'); // GENESIS → ANALYSIS
fsm.canTransitionTo('HEALING'); // boolean
```

### Consciência da IA
```typescript
ai.trigger('ENGINE_STARTED'); // DORMANT → ANALYZING
ai.setPersonality('surgeon'); // engineer | guardian | optimizer | oracle | surgeon
```

### Chat com Roteamento
```typescript
const response = await registry.chat(
  [{ role: 'user', content: 'Analiza este código' }],
  'CODE_ANALYSIS',
  7 // complexidade 1-10
);
```

### Visualização da Entidade
```typescript
import { createAIOperatorEntity } from './components/ai-operator-entity.js';

const entity = createAIOperatorEntity({
  container: document.getElementById('ai-avatar'),
  size: 'default',
  showStatus: true
});
```

### CommandBar
```typescript
import { getCommandBar } from './components/command-bar.js';

const cmd = getCommandBar();
cmd.register({
  id: 'custom.action',
  label: 'Minha Ação',
  category: 'Custom',
  action: () => console.log('Executado!')
});
// Cmd+K para abrir
```

### DiffViewer
```typescript
import { createDiffViewer } from './components/diff-viewer.js';

const viewer = createDiffViewer({
  container: document.getElementById('diff-container'),
  diff: { hunks: [...], fromFile: 'a.js', toFile: 'b.js', summary: '...' },
  showLineNumbers: true
});
```

---

## Integração com Código Legado

O DataBridge existente continua funcionando. O Event Bus converte automaticamente eventos legados em DomainEvents tipados:

```javascript
// Código legado (JS)
workspaceDataBridge.write('focusIssueCode', 'XSS-001');

// Código novo (TS) recebe automaticamente
eventBus.on('FINDING_DISCOVERED', (event) => {
  console.log(event.payload); // { key: 'focusIssueCode', data: 'XSS-001' }
});
```

---

## Estatísticas

| Métrica | Valor |
|---------|-------|
| Linhas de Código TypeScript | ~3,500 |
| Módulos | 15 |
| Cobertura de Estados | 16 FSM states |
| Providers AI | 2 (OpenAI, DeepSeek) |
| Assinaturas de Vulnerabilidade | 7 CWEs |
| Tipos de Nó KG | 5 |
| Relações KG | 6 |

---

## Próximos Passos

1. **Integração com renderer.js** — Substituir chamadas legadas por V3 APIs
2. **Workspaces UI** — Implementar HealingWorkspace e SecurityWorkspace
3. **Persistência** — Salvar Knowledge Graph em IndexedDB
4. **Streaming** — Adicionar suporte a streaming de respostas AI
5. **Testes** — Suite de testes unitários para todos os módulos

---

**Versão:** 3.0.0  
**Data:** 2026-04-02  
**Autor:** Claude Code + Cursor
