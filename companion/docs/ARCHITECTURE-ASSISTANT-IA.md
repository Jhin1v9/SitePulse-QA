# Arquitetura da IA do Assistente — Nível CTO

Documento estratégico que descreve a arquitetura da camada de IA do SitePulse Studio: decisões, riscos, evolução e princípios de engenharia aplicados.

---

## 1. Análise da ideia

O assistente não é um “chatbot genérico”. É um **operador técnico** integrado ao estado real da aplicação:

- **Contexto real**: report carregado, memória operacional, self-healing, histórico de runs, estado da UI (view ativa, URL alvo).
- **Ações reais**: iniciar auditoria (com depth: default/signal/deep), abrir painéis, preparar healing, gerar prompts, mostrar último erro de JS.
- **Respostas humanizadas**: copy em PT/ES/EN/CA, frases ligadas à run atual (baseUrl, totalIssues, seoScore) e não texto genérico.
- **Stream operacional**: quando o utilizador pede uma auditoria pela IA, a run é disparada e o progresso (rotas, issues, SEO) é injetado no chat em tempo real, em linguagem humana.

Objetivo: o utilizador sente que está a falar com um **colega técnico** que vê o mesmo ecrã, executa ações e explica o que está a acontecer.

---

## 2. Riscos técnicos e mitigações

| Risco | Mitigação |
|-------|-----------|
| **Estado de streaming desalinhado** (run termina noutro contexto, conversação trocada) | `clearAssistantRunStreamingState()` centralizado; chamado em sucesso, falha e no `finally` de `appendAssistantRunFinishedMessage`. |
| **Telemetria quebra o render** | Chamadas a `appendAssistantLiveRunUpdate` e `appendAssistantRunFinishedMessage` no path de telemetria envolvidas em `try/catch` para nunca quebrar `renderCompanionState`. |
| **Spam de mensagens no chat** | Throttle por conteúdo (`lastAssistantLiveUpdateKey`: routesChecked + totalIssues + seoScore) e por tempo (`ASSISTANT_LIVE_UPDATE_MIN_INTERVAL_MS`, e.g. 2s). |
| **Copy duplicado e inconsistente** | Uma única fonte: `ASSISTANT_RUN_COPY` (renderer) para ciclo de vida da run; `AUDIT_INTENT_COPY` (assistant-service) para o intent de auditoria. |
| **Dois pontos de entrada para “run audit”** | Ponto único: `runAuditFromAssistant(payload)`. Usado por `executeAssistantAction` (clique no card) e por `getAssistantStepRunner().runAudit` (ação sugerida). |
| **Falha na run não limpa estado** | Em `handleAuditRun`, em `!payload?.ok` e no `catch`, chama-se `getAssistantRunMessage("runFailed")` + `clearAssistantRunStreamingState()`. |

---

## 3. Arquitetura recomendada

### 3.1 Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│  UI (renderer)                                                   │
│  - Chat, cards, progress messages, audit live line               │
│  - runAuditFromAssistant(), appendAssistantLiveRunUpdate(),     │
│    clearAssistantRunStreamingState(), getAssistantRunMessage()   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  Context & telemetry                                             │
│  - renderCompanionState(payload) → liveReport + assistantRun…    │
│  - buildAssistantAppContext() → report, lastJsError, runHistory  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│  Assistant service (intent + response)                           │
│  - getIntentDefinition(), buildAuditSiteResponse(),              │
│  - buildConversationalEnvelope(), wrapModeResult()               │
│  - HUMAN_COPY, AUDIT_INTENT_COPY, ACTION_CARD_COPY               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Fluxo “pedir auditoria à IA”

1. Utilizador escreve “faz uma auditoria” ou “run an audit” (com ou sem URL).
2. **Intent** “audit” é resolvido; **builder** `buildAuditSiteResponse(context, rawQuery)`:
   - Se não houver URL nem run carregada → resposta “Falta o alvo” + ação “Abrir Overview”.
   - Se houver URL (na mensagem ou em `context.report.meta.baseUrl`) → resposta “Auditoria pronta” + 3 ações: run padrão, rápida (signal), profunda (deep).
3. Utilizador clica numa ação “run” → `executeAssistantAction` chama `runAuditFromAssistant(payload)`.
4. **runAuditFromAssistant**: define `assistantRunStreaming = true`, adiciona mensagem de início (ASSISTANT_RUN_COPY.runStart), chama `handleAuditRun(depth)`.
5. **Telemetria** envia `liveReport` → `renderCompanionState` → (try/catch) `appendAssistantLiveRunUpdate` (throttled) → linhas no chat: “A analisar: X rotas, Y issues, SEO Z.”
6. Run termina (telemetria com `finishedAt` ou `handleAuditRun` com report) → `appendAssistantRunFinishedMessage` → mensagem de conclusão + `clearAssistantRunStreamingState()`.

### 3.3 Separação de responsabilidades

- **Renderer**: orquestra UI, estado de streaming, mensagens de progresso e ponto único de execução da run a partir da IA (`runAuditFromAssistant`). Não contém lógica de intent nem copy do serviço.
- **Assistant-service**: intents, builders, envelope conversacional, copy de respostas (HUMAN_COPY, AUDIT_INTENT_COPY). Não acede a DOM nem a `uiState`.
- **Context-assembler**: monta o objeto de contexto (report, lastJsError, runHistory, etc.) a partir de parâmetros passados pelo renderer.

---

## 4. Stack e contexto

- **Frontend**: Electron renderer (HTML/CSS/JS), sem React; estado em `uiState` e elementos em `stateEl`.
- **IA**: modelo “local” por intents (sem LLM externo); respostas construídas por builders que usam contexto (report, memory, healing).
- **Copy**: multi-idioma (PT, ES, EN, CA) em objetos únicos (ASSISTANT_RUN_COPY, AUDIT_INTENT_COPY, HUMAN_COPY) para manutenção e consistência.
- **Run engine**: invocado via IPC (`runAudit`); progresso via telemetria (companion state com `audit.liveReport`).

Para um futuro SaaS ou produto web, a mesma arquitetura pode ser preservada: o “assistant service” pode ser uma API ou um worker que recebe contexto e devolve envelope; o “stream” pode ser Server-Sent Events ou WebSockets.

---

## 5. Melhorias e diferenciação

- **Respostas ligadas ao contexto**: primeira frase do corpo referencia a run (`Olhei a run de {baseUrl}, memória, healing e histórico…`) quando há `meta.context.report`.
- **Stream que altera estado**: não é só estética; a run é realmente iniciada e o progresso reflete dados vivos (routesChecked, totalIssues, seoScore).
- **Clareza operacional**: opções explícitas (run padrão / rápida / profunda) em vez de um único botão; mensagens de falha e conclusão sempre no mesmo idioma do assistente.
- **Resiliência**: telemetria não pode derrubar a UI; throttle evita sobrecarga de mensagens; estado de streaming sempre limpo em todos os caminhos de saída.

---

## 6. Próximos passos práticos

1. **Testes**: automatizar fluxo “pedir auditoria → clicar run → ver progresso → ver mensagem de conclusão” e cenários de falha (engine offline, run falhada).
2. **Métricas**: contagem de runs iniciadas pela IA vs. pelo botão; tempo até primeira mensagem de progresso.
3. **Evolução do “stream”**: se no futuro houver LLM com streaming de tokens, manter o mesmo contrato de “progress entries” no chat para não quebrar a UX atual.
4. **Documentação de copy**: manter AUDIT_INTENT_COPY e ASSISTANT_RUN_COPY como referência para traduções e novos idiomas.

---

*Documento alinhado ao MASTER-PROMPT-INTERFACE-REARCHITECTURE.md e à visão de AI-powered QA workstation.*
