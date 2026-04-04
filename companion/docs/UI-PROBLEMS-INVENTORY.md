# Inventário: 10 Problemas da Interface Atual

Documento que identifica **onde** cada problema aparece na interface atual (HTML/CSS/estrutura). Estes problemas fazem o produto parecer **experimental** em vez de uma **Operations Workstation** profissional e devem ser corrigidos.

---

## 1. UI baseada em cards

**Onde aparece:**

- **Overview:** `.metric-card` (routes, actions, issues, SEO, risk) — `renderer.html` L188–212; `.overview-launchpad-panel`, `.overview-watch-panel`, `.overview-brief-panel`, `.overview-summary-panel` como `<article class="panel">` em grid — L212–358; `.info-card` em “quality dashboard”, “risk map”, “quality control” — L346–473.
- **Findings:** `.issue-card` (renderer.js, lista de issues); `.issue-evidence-card`; `.issue-distribution-panel` com `.group-grid`; `.findings-inspector-panel`, `.signals-panel`, `.visual-quality-panel`, `.explorer-panel` como painéis com cabeçalho + corpo.
- **SEO, Compare, Reports, Settings:** `.info-card`, `.report-grid`, `.comparison-metrics-grid`, `.setting-card`, `.evidence-card`, `.route-sheet-card`.
- **Prompts:** múltiplos `<article class="panel prompt-panel">` em `.prompt-workspace-grid` — cada bloco (fix prompt, healing queue, autonomous QA, etc.) é um “card” com panel-head + prompt-box.
- **Assistant:** `.assistant-stage-card`, `.assistant-conversation-card`, `.assistant-quick-actions-card`, `.assistant-insight-card`, `.assistant-prompt-card`, `.assistant-action-card` — `renderer.css` (e.g. `.assistant-stage-card` border-radius 22px, padding 16–18px).
- **CSS:** `.panel` com `border-radius: 24px`, `padding: 24px`, `box-shadow`, gradientes decorativos (`.panel::before`, `.panel::after`); `.metric-card`, `.info-card`, `.setting-card`, `.stat-tile` com `border-radius: 18px`, `padding: 16px` — `renderer.css` L1072–1105, L1644–1655.

**Problema:** Quase toda a informação está dentro de “cards” ou “panels” com cantos arredondados e sombra. Falta linguagem de **listas, tabelas, inspectores e painéis de ferramenta** (bordas discretas, densidade, menos “tile” por bloco).

---

## 2. Layout com aparência de dashboard

**Onde aparece:**

- **Overview:** `.mission-control-board` contém `.control-panel` + `.metrics-grid` (5 métricas em linha) + `.overview-grid` com **grid 2 colunas** de painéis: Launchpad, Runtime health, Viewport matrix, Next actions, Impact and trend summary, **Quality dashboard**, Quality timeline, Risk map, Issue priority view, Optimization engine, Quality control engine — `renderer.html` L108–358. Um único “view” mostra dezenas de blocos em grid, típico de dashboard.
- **CSS:** `.overview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }` — `renderer.css` L907; `.metrics-grid` para métricas em linha; `.report-grid`, `.comparison-metrics-grid`, `.comparison-quad-grid` (2x2); `.reports-grid`, `.prompt-workspace-grid` com múltiplos cards.
- **Findings:** `.findings-grid.findings-split-layout` tem estrutura list/detail, mas a zona central ainda inclui “Issue distribution” como grid de grupos e a lista de issues como cards.
- **Compare:** `.comparison-metrics-grid` + `.comparison-quad-grid` (4 painéis: new / resolved / persistent / regression) — layout de “quadros” em vez de split claro baseline vs current.
- **Eyebrow “quality dashboard”:** `renderer.html` L341 — uso explícito da palavra “dashboard” no rótulo.

**Problema:** A disposição é de “muitos widgets em grid”, não de **workspace com área principal + barras/rails laterais** (como IDE ou ferramenta de operações). Overview concentra demasiados blocos iguais em hierarquia visual.

---

## 3. Fundo escuro genérico

**Onde aparece:**

- **CSS :root e body:** `renderer.css` L1–62. `color-scheme: dark`; `--bg: #080d14`, `--bg-2: #0d1520`; `body` com `background:` múltiplos `radial-gradient` (azul/verde nos cantos) + `linear-gradient(180deg, #06090f 0%, #0b1118 100%)`; `body::before` com grid de linhas subtis (opacity 0.06) e máscara radial. Estética de “dark theme genérico” com glow suave.
- **Sidebar:** `.app-sidebar` com `border-radius: 22px`, `box-shadow: var(--shadow-lg)`, gradiente e borda — `renderer.css` L276–288.
- **Assistant:** `.assistant-workspace-shell` com `border-radius: 28px`, `radial-gradient` + `linear-gradient` e `box-shadow: var(--shadow-xl)` — L452–465.
- **Panels:** Uso sistemático de `var(--surface)`, gradientes e `backdrop-filter: blur(18px)` — sensação de “glass” uniforme.

**Problema:** O fundo e as superfícies não comunicam **contexto de aplicação desktop profissional** (ex.: áreas de conteúdo vs chrome bem definidas, menos “glow” decorativo). Parece tema escuro de site/SaaS, não de workstation.

---

## 4. Pouca densidade informacional

**Onde aparece:**

- **Overview:** Cada painel tem `padding: 24px` (`.panel`), cabeçalhos com `margin-bottom: 16px` (`.panel-head`); `.metric-card` com `padding: 16px` e `strong` com `margin-top: 12px` e `font-size: 32px` — muito espaço para poucos números. Listas como “Top risks”, “Top opportunities” em `.explorer-item` com títulos e listas separadas por blocos.
- **Findings:** A lista de issues (`.issues-list`) e o inspector (`.findings-inspector-body`) têm espaço generoso; os filtros ocupam várias linhas (`.filters-row` + `.findings-tools-row`) com segmentos e selects grandes.
- **Prompts:** Cada prompt-panel é um bloco alto com cabeçalho + prompt-box; muitos painéis na mesma vista (grid) em vez de lista compacta + detalhe.
- **Settings:** `.settings-grid`, `.memory-filters` com muitos campos em grid; lista de memória (`.history-list`) com items que poderiam ser mais compactos.
- **CSS:** Valores como `gap: 18px`, `padding: 24px`, `min-height: 34px` para sidebar items, `padding: 16px 16px 18px` para assistant-stage-card — `renderer.css` em vários blocos.

**Problema:** Muito whitespace e tamanhos de tipo grandes para a quantidade de informação. Falta **densidade operacional** (mais linhas por ecrã, listas/tabelas compactas, inspector com mais dados visíveis de uma vez).

---

## 5. Navegação com aparência de site

**Onde aparece:**

- **Sidebar:** `.app-sidebar` com botões `.sidebar-item` (Overview, Operations, Findings, etc.) — `renderer.html` L37–60. Estilo: `border-radius: 12px`, hover com `transform: translateY(-1px)`, estado active com glow — `renderer.css` L305–336. Parece menu de “app” ou site (um item por página).
- **Estrutura:** Um clique troca o “view-panel” ativo; não há breadcrumb, nem indicação de “onde estou na árvore” (mission → evidence → actions). Os labels “Mission”, “Evidence”, “Actions”, “System” são agrupamentos mas visualmente tratados como menu lateral de site.
- **Menu strip:** `.workbench-bar` com “File”, “Run”, “Inspect”, “Reports”, “Tools”, “Help” — L64–71. Assemelha-se a menu de site/app, não a barra de ferramentas de workstation (ações concretas, atalhos visíveis).
- **Assistant:** Abre como “AI workspace” (botão na titlebar); dentro, tabs “Conversation” / “Insights” — padrão de “página” dentro do painel.

**Problema:** A navegação transmite “ir para outra página” em vez de **mudar de contexto de trabalho** (workspace) com hierarquia clara (mission → evidence → intelligence → actions). Falta sensação de “estação de trabalho” com áreas fixas e contexto sempre visível.

---

## 6. IA parecendo widget

**Onde aparece:**

- **Acesso:** Um botão “AI workspace” na titlebar (`renderer.html` L26) — `id="openAssistant"` — ao lado de “command palette”. A IA é **um botão entre chips de estado**, não parte estrutural do layout.
- **Comportamento:** O painel do assistant é um `<aside id="assistantWorkspace" class="assistant-workspace right-context-panel hidden">` — aparece/desaparece; quando aberto, o `shell-grid` ganha terceira coluna (`.assistant-open`, `.assistant-expanded`) — `renderer.css` L269–274. Ou seja: “coluna extra” que pode ser fechada.
- **Visual:** `.assistant-workspace-shell` com `border-radius: 28px`, sombra forte, gradientes — destaca-se como “caixa” flutuante. Interior: “Conversation” e “Insights” em cards (`.assistant-stage-card`), quick actions em grid, composer no rodapé. Parece um **widget de chat** encaixado na lateral.
- **Narrativa:** Não há indicação de que o assistant é **uma das superfícies do mesmo derived snapshot** (como Findings ou Prompts). Aparece como “ferramenta extra” acionável por botão.

**Problema:** A IA é percebida como **widget opcional** (chat lateral) e não como **parte do sistema operacional** (reasoning layer sobre o mesmo report/memory/healing). A estrutura e o estilo reforçam “painel de IA” em vez de “workspace de reasoning integrado”.

---

## 7. Pouca sensação de sistema operacional

**Onde aparece:**

- **Chrome da janela:** Titlebar com brand, status chips e window controls — existe, mas o conteúdo principal (shell-grid) é uma área única com sidebar + workspace; não há “barra de título do documento” ou “contexto de run” sempre visível como em IDE (ex.: “Run: 2024-03-14 | Target: https://…”).
- **Workspace header:** `.workspace-header` com eyebrow, title, description e opcional `#engineSummaryStrip` — `renderer.html` L82–104. É genérico (“Overview”, “Findings”) e o engine summary só aparece com report; não há “frame” forte de “sistema” (processos, run atual, estado dos motores).
- **Workbench:** `.workbench-bar` com menu File/Run/Inspect etc. e uma única linha de utilidade (“Ctrl+K … Ctrl+J”) — L62–78. Não há barra de ferramentas com ícones/atalhos de “Run audit”, “Load report”, “Compare”, etc.
- **Estado:** Os chips “engine offline”, “audit idle”, “studio build” estão na titlebar mas não há **status bar** no rodapé (como em IDEs) com run actual, target, memory count, etc.
- **Estrutura:** Falta um “centro” visual inequívoco (ex.: “Report actual” ou “Run actual”) e rails laterais claros (navegação vs. inspector vs. assistant). Tudo isso reduz a sensação de **OS/IDE**.

**Problema:** A aplicação não se apresenta como **sistema operacional** (chrome claro, contexto de run sempre visível, barras de ferramentas/status, áreas fixas). Parece uma “app de várias páginas” com um menu lateral.

---

## 8. Workspace central pouco estruturado

**Onde aparece:**

- **Estrutura HTML:** `.workspace-shell` contém `.workbench-bar` + `.workspace-header` + `.workspace-body`; `.workspace-body` contém todos os `.view-panel` (overview, operations, findings, seo, prompts, compare, reports, preview, settings) — `renderer.html` L62–906. O “body” é um contentedor que mostra **um** view-panel por vez; não há sub-estrutura (ex.: painel esquerdo fixo + área central + painel direito).
- **Overview:** Dentro do view-panel “overview”, `.mission-control-board` inclui um bloco de configuração, depois `.metrics-grid`, depois `.overview-grid` — uma única coluna de conteúdo com grid 2 colunas de painéis. Não há **split** (ex.: configuração à esquerda, resumo à direita) nem **list + detail**.
- **Findings:** Tem `.findings-grid.findings-split-layout` com `.findings-main` e `.findings-side` — é o view mais estruturado (list + inspector). Mesmo assim, “findings-main” contém dois painéis empilhados (distribution + issues list) e o “side” vários painéis (inspector, signals, visual quality, route explorer, action explorer) sem hierarquia clara (qual é o principal vs. secundário).
- **CSS:** `.workspace-body { display: grid; align-content: start; gap: 18px; }` — `renderer.css` L822; `.view-panel.active { display: grid; }` com `align-content: start; gap: 18px`. Ou seja: o workspace central é **um grid de blocos** que cresce para baixo, sem estrutura fixa de “main + side” ou “toolbar + content + status”.

**Problema:** O workspace central não tem **estrutura de workstation** (ex.: barra de ferramentas da vista + área principal + rail opcional). Cada vista é um conjunto de painéis em grid ou stack; falta padrão claro de “área principal” vs. “detalhe/inspector” vs. “lista”.

---

## 9. Baixa separação entre contextos

**Onde aparece:**

- **Cores e bordas:** Panels e cards usam a mesma família de superfícies (`--surface`, `--surface-2`), bordas `rgba(255,255,255,0.06)` e gradientes semelhantes — `renderer.css`. Não há **cores ou pesos visuais distintos** para “evidência” vs. “inteligência” vs. “ação” vs. “sistema”.
- **Sidebar:** Todos os itens (Overview, Operations, Findings, …) têm o mesmo estilo; o grupo (Mission, Evidence, Actions, System) só muda o label (`.sidebar-label`), não a separação visual (ex.: divisores, fundo diferente).
- **Workspace header:** O eyebrow/title/description mudam por vista, mas o estilo do header é o mesmo em todas as vistas; não há “strip” ou cor por tipo (mission vs. evidence vs. actions).
- **View panels:** Cada view-panel é `display: none` ou `display: grid`; ao mudar de vista, todo o conteúdo é trocado. Não há **bordas ou zonas** que digam “isto é evidência”, “isto é resultado dos motores”, “isto é acção”.
- **Assistant:** Quando aberto, é uma coluna à direita; não há linha ou fundo que separe claramente “área principal” de “área de reasoning”. O mesmo para a sidebar à esquerda.

**Problema:** **Contextos** (mission, evidence, intelligence, actions, system) não estão **visualmente separados** (cor, borda, densidade, posição). Tudo parece o mesmo “tipo” de conteúdo, o que reduz clareza operacional.

---

## 10. Pouca hierarquia visual

**Onde aparece:**

- **Tipografia:** `.panel h2`, `.panel h3` partilham a mesma família; `.eyebrow` (10px, uppercase) é usado em todo o lado; títulos de secção (h3) e títulos de cards (h4 no assistant) não têm escala forte (ex.: um único “H1” por vista, depois H2/H3 bem diferenciados). `renderer.css` L131–136, L154–163.
- **Tamanhos:** `.metric-card strong` com `font-size: 32px` — números grandes; outros blocos com `font-size: 20px` para valores (`.signal-item strong`, etc.) — `renderer.css` L1657–1663, L1724–1728. A hierarquia é mais “número grande vs. resto” do que “nível 1 / nível 2 / nível 3” de informação.
- **Overview:** Muitos painéis no mesmo nível (Launchpad, Runtime health, Next actions, Impact summary, Quality dashboard, etc.) com o mesmo padrão (eyebrow + h3 + conteúdo). Não há **um** bloco claramente “principal” (ex.: run status + target) e outros “secundários”.
- **Espaçamento:** `gap: 18px` de forma consistente entre blocos; `padding: 24px` nos panels. Pouca variação de **espaço** para indicar importância (ex.: menos espaço entre título e conteúdo principal, mais entre secções).
- **Contraste:** Uso de `--muted` para texto secundário; bordas e superfícies muito próximas em luminosidade. Falta **contraste claro** entre “primário” e “secundário” (ex.: labels vs. valores, título da vista vs. conteúdo).

**Problema:** A interface não comunica **ordem de leitura** nem **importância relativa** (o que é centro vs. suporte). Tudo parece “mesmo nível”, o que aumenta a sensação de dashboard e reduz a de workstation orientada por tarefa.

---

## Resumo e consequência

| # | Problema | Consequência |
|---|----------|--------------|
| 1 | UI baseada em cards | Parece conjunto de tiles; pouco list/detail e inspector. |
| 2 | Layout tipo dashboard | Muitos blocos em grid; pouco workspace estruturado. |
| 3 | Fundo escuro genérico | Estética de site/app; pouco “desktop profissional”. |
| 4 | Pouca densidade | Muito espaço para pouca informação; pouco operacional. |
| 5 | Navegação tipo site | “Páginas” em vez de contextos de workstation. |
| 6 | IA como widget | Chat lateral; não integrado como camada do sistema. |
| 7 | Pouco “OS” | Falta chrome, status bar, contexto de run sempre visível. |
| 8 | Workspace central pouco estruturado | Grid de painéis; falta main + rail + inspector claro. |
| 9 | Baixa separação entre contextos | Mission/evidence/actions não distinguidos visualmente. |
| 10 | Pouca hierarquia visual | Tudo no mesmo nível; falta ordem de leitura e importância. |

Em conjunto, estes problemas fazem o produto parecer **experimental** (demo, dashboard, widget de IA) em vez de **AI Assisted QA Operating System** com sensação de **Operations Workstation** e ferramenta profissional. **Isto deve ser corrigido** em fases de reestruturação da interface, com base nos princípios em `INTERFACE-ARCHITECTURE-ALIGNMENT.md` e `PRODUCT-MODEL-AND-UI-GAP-ANALYSIS.md`.
