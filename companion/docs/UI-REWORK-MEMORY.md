# SitePulse Desktop — UI Rework Memory

Contexto para retomar o rework sem quebrar o código.

## Ordem dos prompts (suite final)

1. **Prompt 1** — App Shell profissional ✅
2. **Prompt 2A** — Overview + Findings + Compare ✅
3. **Prompt 3** — AI Workspace + chat humanizado ✅
4. **Prompt 4** — AI Autonomous Operator Mode ✅
5. **Prompt 2B** — Memory + Healing + Prompts + Reports + Settings ✅
6. **Prompt 5** — AI Memory & Conversation Persistence ✅

## Decisões de arquitetura

- **Opção A**: primeiro rework visual (HTML/CSS/JS), depois migração para React + TypeScript.
- **Renderer**: continua HTML + CSS + JS; navegação usa `[data-view]` e `[data-view-panel]`; `renderer.js` faz `querySelectorAll("[data-view]")` para `navButtons` e `switchView(viewName)` aplica classe `active` nos botões e nos painéis.
- **Shell atual**:
  - `#shellGrid` com grid: `260px minmax(0, 1fr)` ou com AI: `260px minmax(0, 1fr) minmax(420px, 480px)`.
  - `.app-sidebar`: navegação em grupos (Core, Intelligence, Productivity, System); itens com `data-view` e classe `sidebar-item`; estado ativo com classe `active`.
  - `.workspace-shell`: contém `.workbench-bar` (agora só `.top-toolbar` com menu-strip + utility), `#menuFlyout`, `.workspace-header`, `.workspace-body` com `.view-panel[data-view-panel]`.
  - Painel direito: `#assistantWorkspace.assistant-workspace.right-context-panel`; visibilidade com `shellGrid.assistant-open` / `assistant-expanded`.

## O que NÃO mudar sem alinhar

- **main.cjs** e preload: não alterar.
- **Engines** (assistant-service, memory, healing, predictive, etc.): não reescrever.
- **Contratos**: IDs de elementos usados em `renderer.js` (stateEl.*) devem ser preservados ao reorganizar HTML.
- **data-view** e **data-view-panel**: valores devem bater com `VIEW_META` (overview, preview, operations, findings, seo, prompts, compare, reports, settings).

## Prompt 1 — Checklist (satisfeito)

- [x] UI atual auditada
- [x] Problemas estruturais listados
- [x] App shell implementado (sidebar + grid + top toolbar)
- [x] Sidebar profissional criada (Core, Intelligence, Productivity, System; tooltips)
- [x] Top toolbar criada (command bar com menu + utility)
- [x] Workspace central reorganizado (mantido como área de scroll com view-panels; conteúdo interno será refinado no 2A)
- [x] Painel lateral contextual implementado (assistant-workspace como right-context-panel)
- [x] Visual menos “dashboard web” (grid de fundo suavizado; shell com sidebar fixa)
- [ ] Build validado (sync:runtime ok; commit/push a cargo do usuário)

## Prompt 2A — Checklist (satisfeito)

- [x] Overview reorganizado como mission control (mission-control-board, header compacto, product DNA removido, hero-badges removidos)
- [x] Findings com layout table/detail profissional (findings-split-layout; lista + inspector)
- [x] Filters bar implementada (já existia; mantida)
- [x] Inspector panel implementado (findingsInspectorPanel, findingsInspector, findingsInspectorPlaceholder)
- [x] Compare com split comparison real (compare-split-workspace, compare-split-header Baseline / Current)
- [x] Visual dos módulos parece software profissional
- [ ] Sem regressões (validar manualmente)
- [ ] Build validado
- [ ] Commit / Push (a cargo do usuário)

## Prompt 2B — Checklist (satisfeito)

- [x] Memory com workspace operacional (memory-workspace-panel, memory-filters)
- [x] Healing como queue operacional (healing-queue-panel, healing-queue-list)
- [x] Prompts com header de workspace (prompt-workspace, prompt-workspace-header)
- [x] Reports com reports-workspace
- [x] Settings com settings-workspace
- [x] CSS para painéis operacionais

## Prompt 5 — Checklist (satisfeito)

- [x] Modelo de conversa: conversationId, title, message history, context binding (persistência por conversa)
- [x] Lista de conversas persistida (assistantConversationList, assistantConversationMessages, assistantCurrentConversationId)
- [x] Sidebar de histórico no AI workspace: New chat, busca por título, lista recent/pinned
- [x] Nova conversa (createNewConversation), seleção (selectConversation), retomada ao carregar
- [x] Auto-título a partir da primeira mensagem do utilizador
- [x] Migração da conversa legada (single key) para o novo modelo multi-conversa

## Verificação dos prompts (conforme enviados)

Conferência em código (renderer.html / renderer.js / renderer.css):

| Prompt | Descrição | Estado | Evidência no código |
|--------|-----------|--------|---------------------|
| **1** | App Shell profissional | ✅ Cumprido | `.app-sidebar`, `#shellGrid`, `data-view`, `right-context-panel`, top toolbar |
| **2A** | Overview + Findings + Compare | ✅ Cumprido | `.mission-control-board`, `.findings-split-layout`, `#findingsInspectorPanel`, `.compare-split-workspace` |
| **3** | AI Workspace + chat humanizado | ✅ Cumprido | `#assistantResponse.assistant-chat-thread`, bubbles user/assistant, quick tools + action cards |
| **4** | AI Autonomous Operator Mode | ✅ Cumprido | `#assistantOperatorStatus`, `.assistant-operator-status`, refs em stateEl e renderer.js |
| **2B** | Memory + Healing + Prompts + Reports + Settings | ✅ Cumprido | `.memory-workspace-panel`, `.healing-queue-panel`, `.prompt-workspace`, `.reports-workspace`, `.settings-workspace` |
| **5** | AI Memory & Conversation Persistence | ✅ Cumprido | `.assistant-conversation-history`, `#assistantNewChat`, `#assistantConversationList`, `createNewConversation`, `selectConversation`, storage list/messages/currentId |

**Conclusão:** Todos os 6 prompts da suíte foram implementados e estão presentes no código atual.

## Próximo passo

Suite concluída. Validar build (sync:runtime; fechar o app se der "Acesso negado" em pack:dir) e testes manuais; commit/push a cargo do usuário. Ver `BUILD-OUTPUT-RECOVERY.md` para recuperar o build.
