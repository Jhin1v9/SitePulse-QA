# Diagnóstico e correção dos botões — SitePulse Studio Control Center

## 1. DIAGNÓSTICO

### Causa raiz encontrada
- **Listener de navegação em `document.body` (capture)** tratava qualquer clique que subisse na árvore até um `button[data-view]`. O `#workspaceShell` tem `data-view="overview"` e botões no overview (ex.: Run, Do next) estão dentro dele; a lógica anterior podia considerar o alvo como navegação e chamar `switchView` + `stopPropagation()`, impedindo os handlers dos botões operacionais.
- **Refs do DOM no bootstrap:** `stateEl` é preenchido quando o módulo carrega. Em alguns contextos (Electron, ordem de carregamento), elementos críticos podem não estar disponíveis nesse momento; sem atualização no bootstrap, os listeners seriam ligados a refs nulas e os botões ficariam “mudos”.
- **appendLog sem guard:** Se `stateEl.logOutput` fosse null, `renderLogs()` lançava ao aceder a `.textContent`, quebrando o handler que chamou `appendLog`.

### Arquivos afetados
- `companion/src/renderer.js`: `bindNavigation()`, `refreshStateElRefs()`, `bootstrap()`, `renderLogs()`, `appendLog()`, `handleAuditRun()`, `loadReportFromFile()`, `toggleAssistant()`, `verifyCriticalButtons()`
- `companion/src/main.cjs`: modo `--button-test` para teste automatizado de clique
- `companion/package.json`: script `test:buttons`
- `companion/docs/BUILD-OUTPUT-RECOVERY.md`: secção sobre onde as alterações se aplicam (dev vs dist)

### Por que quebrou
- Regressão em commits de UI/overview (ex.: workspace panels, action surfaces): o listener de navegação foi associado a `body` com capture e a condição não restringia ao clique **dentro da sidebar**, pelo que cliques no workspace eram tratados como navegação.
- `stateEl` é construído à carga do módulo; em ambiente Electron o timing pode fazer com que alguns `getElementById` retornem null se o DOM ainda não tiver esses nós, e sem refresh no bootstrap os bindings ficavam sem elemento.
- `appendLog` não era defensivo perante `stateEl.logOutput` null, o que podia fazer falhar qualquer handler que registasse log.

---

## 2. CORREÇÕES APLICADAS

- **bindNavigation():** O listener em `document.body` (capture) actua **apenas** quando o clique ocorre **dentro de `.app-sidebar`**. Primeiro verifica `clicked.closest(".app-sidebar")`; se falso, retorna sem fazer nada. Só depois procura `button[data-view]` e chama `switchView`. Assim, cliques na topbar e na área central (Run, Load, AI, Do next, etc.) não são tratados como navegação.
- **refreshStateElRefs():** No início do `bootstrap()`, reatribui as refs de elementos críticos a partir do DOM (`getElementById` para os IDs usados nos botões e em `logOutput`), incluindo: Run/Load/AI/Do next, next-action (Open issue, Prepare healing, Generate prompt), janela (winMinimize, winMaximize, winClose), engine, reports, etc. Assim os listeners em `bindButtons()` são sempre ligados aos nós reais.
- **renderLogs() / appendLog:** Uso de `if (stateEl.logOutput)` antes de escrever em `stateEl.logOutput.textContent`, para nunca lançar se o elemento não existir.
- **Logs de diagnóstico (opcional):** Em `handleAuditRun`, `loadReportFromFile` e `toggleAssistant` foi adicionado `appendLog("[studio] … button triggered.")` para permitir validar no painel de log que o clique chegou ao handler.
- **verifyCriticalButtons():** Após `bindButtons()`, verifica se os elementos críticos existem e regista no log quando algum ID está em falta no DOM.
- **Teste automatizado:** Script `npm run test:buttons` (modo `--button-test` em `main.cjs`) abre o Electron, espera o load, simula clique em Run e confirma que não há exceção (BUTTON_TEST_OK).

### Handlers restaurados / garantidos
- Sidebar: navegação apenas para cliques dentro de `.app-sidebar` em `button[data-view]`; `switchView()` para overview, operations, findings, seo, compare, settings, prompts, reports, preview.
- Topbar: Run → `handleAuditRun()`, Load → `loadReportFromFile()`, ⌘K → `toggleCommandPalette()`, AI → `toggleAssistant()`; janela: Minimize, Maximize, Close via `sitePulseCompanion`.
- Control Center: Run (overview) → `handleAuditRun()`, Do next → `executeDoNext()`, Run native audit / Quick audit / Run deep audit → `handleAuditRun()` (com depth), Open CMD flow → `openCmdWindow`, Copy replay/fix prompt, Load report, Export report, Open evidence, Report vault, Copy bridge URL — todos ligados em `bindButtons()` com `on(stateEl.*, "click", …)`.
- Next action: Open issue, Prepare healing, Generate prompt — ligados com `if (stateEl.nextAction*) on(...)`; refs incluídas em `refreshStateElRefs()`.
- Menu strip: File, Run, Inspect, Reports, Tools, Help — `data-menu-action` + `showMenuFlyout`; itens do flyout com `data-menu-item` e `executeMenuAction()`.
- Execution profile: botões com `data-mode`, `data-scope`, `data-depth`, `data-mobile-sweep` ligados em `bindSelectionEvents()`.

### Separações de responsabilidade
- Navegação (mudar de vista): apenas cliques **dentro de `.app-sidebar`** em `button[data-view]`; handler em `bindNavigation()` com early return se fora da sidebar.
- Ações operacionais (audit, load, AI, copy, etc.): handlers em `bindButtons()` por elemento; nenhum listener global intercepta esses cliques.

---

## 3. TESTE REAL EXECUTADO

- **Como:** `npm run dev` (Electron a carregar de `companion/src`); `npm run test:buttons` (clique programático no Run); `npm run smoke` (bridge + auditoria curta).
- **Topbar:** Run, Load, AI — test:buttons confirma clique em Run sem exceção; em dev, ao clicar deve aparecer no log "[studio] Run audit button triggered." e toast conforme estado (bridge/engine/target URL). Load e AI ligados aos mesmos handlers que Run e Assistant.
- **Sidebar:** Control Center, Runs, Findings, SEO, Compare, Memory, Healing, etc. — navegação só para cliques dentro de `.app-sidebar`; painéis alternam com `switchView`.
- **Control Center:** Do next, Run native audit, Open CMD flow, Copy replay/fix prompt, Load report, Export report, Quick audit, Run deep audit, Open evidence, Report vault, Copy bridge URL — todos com `on(stateEl.*, "click", …)` após `refreshStateElRefs()`; next-action (Open issue, Prepare healing, Generate prompt) com refs no refresh.
- **Resultado:** Smoke OK; test:buttons OK (BUTTON_TEST_OK). Validação manual em dev: clicar em cada grupo e confirmar no log que o handler foi acionado (e toast/diálogo quando aplicável).

---

## 4. COMMITS CRIADOS

- `4c7fc6a` — fix(companion): restore button actions - navigation only in sidebar, refresh stateEl at bootstrap, defensive appendLog, test:buttons
- (este ciclo) — fix(companion): extend refreshStateElRefs with next-action and window buttons

---

## 5. PENDÊNCIAS OU LIMITES

- **Dependência do bridge:** Run (native/quick/deep), Open CMD flow, Load report, Open evidence, Report vault, Copy bridge URL, Start/Stop engine e ações de AI que chamam o runtime exigem `window.sitePulseCompanion` e, para auditoria, bridge a correr. Se o bridge não estiver pronto, `ensureCompanion()` mostra o toast "App bridge not ready…"; se o engine estiver offline, "Engine offline. Start the engine in Settings…". Isto é **estado indisponível**, não bug de binding.
- **Target URL:** Run audit e Open CMD exigem URL preenchida; caso contrário aparece toast "Target URL is required…". Comportamento esperado.
- **Do next / Open issue / Prepare healing / Generate prompt:** Dependem de relatório carregado e de “next action” gerada; sem relatório ou sem ação, o botão pode mudar de vista ou mostrar toast explicativo. Também é comportamento por estado.
- **test:buttons:** Cobre apenas o botão Run (topbar); os restantes têm o mesmo mecanismo (refreshStateElRefs + bindButtons) e são validados em smoke + uso manual em dev.
