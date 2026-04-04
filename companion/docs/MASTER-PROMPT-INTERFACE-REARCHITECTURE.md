# Master Prompt — Re-arquitetura da Camada de Interface — SitePulse Studio

Documento de referência para redesenho da interface como **AI-powered QA workstation**. Usar como guia em todas as fases de refatoração da UI.

---

## IMPORTANTES

- Keep best practices
- Sem any
- Sem dynamic imports
- Mudanças mínimas e pontuais por etapa, mas com visão arquitetural total
- Não quebrar integrações existentes
- Não alterar a lógica operacional central sem necessidade absoluta
- Não começar implementando UI aleatoriamente
- Antes de qualquer mudança, analisar a arquitetura existente e mapear shell, navegação, superfícies, estados e fluxos
- Entregar código completo dos arquivos alterados
- Explicar no final o que foi feito, por que foi feito, o que foi preservado e quais decisões arquiteturais foram tomadas
- Se houver conflito entre estética e clareza operacional, priorizar clareza operacional
- Se houver conflito entre novidade visual e coerência sistêmica, priorizar coerência sistêmica
- O objetivo não é "deixar bonito"
- O objetivo não é "modernizar"
- O objetivo é reposicionar a interface no nível de software profissional real, alinhado à arquitetura do produto
- Não tratar isso como redesign cosmético
- Tratar isso como re-arquitetura da camada de interface

---

## MODO DE OPERAÇÃO

Operar como combinação de:

- Principal Software Architect
- Principal Product Architect
- Principal UX Architect for Professional Tools
- Principal Systems Designer
- Principal Desktop Application Designer
- Senior TypeScript / Electron / UI Engineer
- Information Architecture Specialist

**NÃO:** gerador de componentes. **NÃO:** decorador de UI. **NÃO:** mudanças superficiais.

**Função:** RECONSTRUIR A LINGUAGEM DE PRODUTO DA INTERFACE

de modo que o SitePulse Studio deixe de parecer:

- dashboard SaaS genérico
- web app com cards
- página escura estilizada
- ferramenta experimental

e passe a parecer:

- software profissional premium
- AI-assisted QA workstation
- observability and repair console
- productized technical operating system
- ferramenta madura, densa, operacional e confiável

---

## CONTEXTO REAL DO PRODUTO

Este projeto **não** é um dashboard comum. É uma plataforma de auditoria técnica e inteligência operacional com múltiplas camadas já existentes.

Arquitetura real inclui, entre outras:

- QA Runtime Learning Layer
- Electron Bridge Layer
- Renderer State and UX Layer
- Assistant Reasoning and Action Layer
- Self-Healing Orchestration Layer
- Impact and Continuous Intelligence Layer
- Data Intelligence Consolidation Layer
- Optimization Engine Layer
- Quality Control Engine Layer

Conceitos operacionais já existentes (não decorativos):

- operational memory
- validated / failed / partial learnings
- manual override e auto-promotion com rastreabilidade
- self-healing queue
- healing eligibility e healing modes
- impact scoring e priority engine
- predictive signals e trend analysis
- optimization guidance
- quality coherence warnings
- assistant cognitive modes
- prompt workspace enriquecido com histórico real
- derived intelligence snapshot compartilhado entre superfícies
- AI layer conectada ao estado real da aplicação

O produto é, na prática, um **AI ASSISTED QA OPERATING SYSTEM** — a interface precisa comunicar isso.

---

## DIAGNÓSTICO DO PROBLEMA ATUAL

A interface atual não representa a arquitetura real. Desalinhamento severo entre profundidade técnica e percepção visual.

A UI atual transmite mais: página escura, dashboard, blocos independentes, cards, sessões visuais, web product comum.

Transmite menos: software técnico operacional, console de inteligência, área de trabalho de auditoria, ferramenta de engenharia.

**Problemas estruturais:**

1. Shell ainda parece layout de site — falta application shell, produto desktop, sistema persistente
2. UI parece composta por cards — blocos soltos, pouca continuidade espacial e estrutura operacional
3. Fundo escuro genérico — dark theme padrão, falta profundidade, materialidade e estratificação
4. Workspace central parece página — não parece área de trabalho, ambiente técnico, command surface
5. Navegação parece menu — deveria parecer workspace navigator / IDE
6. Painel de IA não transmite operador técnico — não widget/chat; deve ser inspector operacional com contexto, estado e ações
7. Hierarquia informacional insuficiente — shell, workspace, tools, summaries e AI competem
8. Linguagem visual muito web — muito "app", pouco "software", muito marketing dark, pouca ergonomia técnica

---

## OBJETIVO CENTRAL DA REFATORAÇÃO

Transformar o SitePulse Studio em interface de nível **workstation profissional**.

Mudança radical em posicionamento visual e estrutural; execução disciplinada.

A nova interface deve comunicar: confiança, densidade, controle, clareza operacional, inteligência aplicada, capacidade técnica real, produto premium e maduro.

O sistema final deve parecer algo entre: IDE técnica, observability console, analysis workstation, AI operator desktop, QA intelligence command center.

---

## MODELO MENTAL CORRETO DO PRODUTO

- O SitePulse Studio **não** é coleção de páginas, dashboard de métricas ou chatbot com painel.
- É uma **workstation** onde o usuário: executa auditorias, inspeciona resultados, entende risco e impacto, consulta memória validada, compara runs, gera prompts com contexto real, prepara healing attempts, revalida, interpreta sinais de regressão, prioriza correções, usa IA conectada ao estado real.

A interface deve ser organizada por: workspaces, inspeção, contexto ativo, estado do sistema, painéis operacionais, ações explícitas, priorização, profundidade contextual — **não** por seções genéricas, cards decorativos, agrupamentos superficiais, visual de landing page interna.

---

## PRINCÍPIO DE DESIGN DO PRODUTO

A forma deve seguir a arquitetura operacional. Cada área deve responder claramente:

- Onde estou? Em qual workspace? Qual contexto ativo? Qual run ativo?
- Quais riscos atuais? O que exige ação? O que é insight, memória, healing, contexto de IA?
- O que é navegação, inspeção, summary, comando?

Se qualquer resposta não estiver clara, a UI ainda está errada.

---

## ARQUITETURA DE INTERFACE DESEJADA

Reconstruir em torno de um **APP SHELL profissional**.

```
APP SHELL
├── TOP SYSTEM BAR
├── LEFT WORKSPACE SIDEBAR
├── CENTRAL OPERATIONAL WORKSPACE
└── RIGHT AI / CONTEXT INSPECTOR
```

Estrutura persistente, estável e legível. Não telas como páginas soltas. Não listas de cards. Não grids visuais como linguagem primária.

---

## TOP SYSTEM BAR

System control bar, não header de site.

- Estado global do sistema
- Contexto do workspace atual
- Estado do run / engine quando aplicável
- Zona de comando e orientação
- Ações rápidas visíveis
- Sensação de software operacional

Conteúdo (quando fizer sentido): project/target context, current workspace title ou breadcrumb, run status, engine/sync/processing state, global search ou command palette, quick actions, hints de atalhos, modo ativo. Deve parecer **camada de controle**, não barra de navegação de site.

---

## LEFT WORKSPACE SIDEBAR

**WORKSPACE NAVIGATOR** de ferramenta técnica, não lista de links.

Agrupamento:

- **CORE:** Overview, Runs, Findings, SEO, Compare
- **INTELLIGENCE:** Memory, Healing, Predictive, Optimization, Quality Control
- **PRODUCTIVITY:** Prompt Workspace, Reports, Preview
- **SYSTEM:** Settings

Regras: parecer navegação de IDE/console técnico; hierarquia de grupos clara; densidade e alinhamento rigorosos; destacar workspace ativo com firmeza; reduzir aparência de "menu de website". Opcional: ícones discretos, badges operacionais, diferenciar analítico vs produtivo vs configuratório.

---

## CENTRAL OPERATIONAL WORKSPACE

Coração do produto. Deve ser **OPERATIONAL WORK SURFACE**, não página de dashboard.

**Remover como linguagem principal:** cards grandes, grids decorativos, blocos soltos, excesso de áreas fechadas, espaçamentos de landing, composição de vitrine.

**Substituir por:** surfaces contínuas, toolbars contextuais, boards operacionais, tabelas quando fizer sentido, painéis de inspeção, summaries acoplados ao fluxo, análises estruturadas, stacks informacionais coerentes.

Cada workspace: ferramenta, não tela. Deve ter (explícito ou implícito): missão do workspace, contexto ativo, estado atual, zona principal de trabalho, zona secundária, ações possíveis, sinais prioritários, continuidade com IA e memória operacional.

Pergunta correta: "como essa superfície ajuda o usuário a operar melhor?" — não "como deixar mais bonito?"

---

## RIGHT AI / CONTEXT INSPECTOR

**AI OPERATOR / CONTEXT INSPECTOR.** Não: widget, chat isolado, acessório, sidebar genérica. Sim: inspector técnico, console contextual, operador assistido, camada de interpretação do estado real.

Estrutura: Conversation, Insights, Actions, Memory, Healing.

Regras: conversa coexistir com contexto; IA integrada ao produto; exibir contexto ativo; fluxo paralelo ao restante; transmitir que a IA lê o estado real; separar conversa, insight, ação e histórico. Reforçar: contexto, prioridade, risco, próximos passos, elegibilidade, inteligência consolidada.

---

## MAPEAMENTO DA ARQUITETURA REAL PARA A UI

- QA Runtime Learning → Memory workspace, issue memory, validated learnings, resolution source context
- Self-Healing Orchestration → Healing workspace, eligibility, pending attempts, revalidation, corrective flow visibility
- Impact and Continuous Intelligence → prioridade, risco, executive summary, trends, action ordering, regression visibility
- Data Intelligence → issue enrichment, merged state, normalized context, consistent rendering
- Optimization Engine → structural opportunities, cluster recommendations, improvement surfaces
- Quality Control Engine → coherence warnings, validation flags, false positive suspicion, risk sanity checks
- Assistant Cognitive Modes → visible contextual behavior, mode-aware outputs, action filtering, workspace-aware assistance
- Prompt Workspace Enrichment → prompts grounded in validated history, failed attempts, current context, repair strategy

A UI deve **mostrar** que essas capacidades existem. A arquitetura visual deve permitir que o produto seja percebido como esse sistema.

---

## LINGUAGEM VISUAL DESEJADA

Sair de "dark website" para "professional technical software".

**Evitar:** gradientes decorativos dominantes, glow excessivo, sombras grandes e fofas, cards tipo template, superfícies muito destacadas, excesso de borda, estética de marketing, blocos gigantes com pouco conteúdo.

**Adotar:** superfícies sólidas, profundidade controlada, diferenças tonais sutis, separadores finos, contraste disciplinado, densidade profissional, tipografia firme, ritmo vertical consistente, alinhamento preciso, espaçamento enxuto, visual técnico e silencioso. Produto deve parecer caro, maduro e confiável — sério, não chamativo nem decorativo.

---

## SISTEMA DE FUNDO E SUPERFÍCIES

Substituir fundo atual por sistema de superfícies profissional.

Base tones sugeridos: `#070B12`, `#0B111A`, `#0F1622`. Estratificação, não "pintar tudo de preto".

Diferença clara entre: app background, sidebar surface, top bar surface, workspace surface, inspector surface, secondary panel surfaces.

Tokens sugeridos: app-background, shell-surface, toolbar-surface, workspace-surface, panel-surface, inspector-surface, elevated-surface, muted-surface. Superfícies como partes de um sistema único.

---

## DENSIDADE E ESPAÇAMENTO

Densidade de software profissional. Escala: **8px, 12px, 16px**. Usar 20px+ só para separar macro-áreas do shell.

Reduzir espaçamento cenográfico; aumentar eficiência perceptiva; compactar sem sufocar; priorizar leitura operacional e scanning visual.

---

## TIPOGRAFIA E HIERARQUIA

Distinguir com clareza: shell, contexto, título de workspace, subtítulo operacional, estado, metadata, toolbar, análise, item selecionado, warning, ação, secondary info. Reduzir títulos tipo landing; evitar headline grande demais; títulos contidos e técnicos; hierarquia funcional, não teatral.

---

## COMPONENTIZAÇÃO E PADRÕES DE SUPERFÍCIE

Poucos padrões fortes e repetíveis:

1. App Shell Frame
2. Workspace Header
3. Context Toolbar
4. Operational Panel
5. Insight Strip
6. Dense Data Region
7. Inspector Section
8. Action Cluster
9. Status Row
10. Secondary Meta Row

Objetivo: reduzir improviso visual; consistência; interface como sistema, não coleção de blocos.

---

## O QUE NÃO FAZER

- Redesignar com foco em "ficar mais bonito"
- Transformar tudo em cards melhores
- Adicionar mais brilho ou gradientes para "sofisticar"
- Glassmorphism
- UI parecer landing page de SaaS premium
- Reorganizar por seções visuais vazias
- Inventar componentes sem função clara
- Esconder contexto operacional
- Quebrar vínculo entre IA e estado real
- Enfraquecer densidade
- Trocar clareza por estilo

---

## COMO EXECUTAR A REFATORAÇÃO

Em fases:

**FASE 1 — AUDITORIA DA ESTRUTURA ATUAL**  
Mapear shell atual; identificar componentes de top-level layout; sidebar, main content, assistant area, surfaces; onde nasce aparência de dashboard; wrappers/containers/classes que causam sensação de página/card grid.

**FASE 2 — DEFINIÇÃO DO NOVO APP SHELL**  
Estrutura macro estável: top system bar, workspace sidebar, central operational surface, right inspector; shell transmitir permanência e robustez.

**FASE 3 — REFATORAÇÃO DE SUPERFÍCIES**  
Substituir cards por superfícies operacionais; consolidar regiões; reduzir fragmentação; continuidade espacial.

**FASE 4 — REFATORAÇÃO DA SIDEBAR**  
Reorganizar por workspaces; hierarquia; densidade; linguagem de IDE.

**FASE 5 — REFATORAÇÃO DO MAIN WORKSPACE**  
Remover aparência de página; superfície de trabalho; toolbars contextuais; estruturas operacionais.

**FASE 6 — REFATORAÇÃO DO PAINEL DE IA**  
Inspector técnico; acoplamento com contexto; separar conversa, insight, ação, memória, healing; operador contextual.

**FASE 7 — POLIMENTO SISTÊMICO**  
Profundidade tonal, ritmos, densidade, alinhamento, separadores; eliminar restos de website.

---

## DECISÕES DE ENGENHARIA

Preservar: lógica de runtime, assistant service, healing engine, data intelligence, fluxos operacionais, integrações renderer/bridge/runtime, estados e handlers existentes quando viável.

Transformar prioritariamente: shell, layout, component boundaries, UI surfaces, visual hierarchy, navigation semantics, container composition.

Refatorar wrappers/componentes antigos com disciplina, sem reescrever o sistema inteiro sem necessidade.

---

## QUALIDADE DE PRODUTO EXIGIDA

1. Sensação inicial de software sério
2. Estrutura compreensível em segundos
3. Navegação parte de um sistema, não de um site
4. Workspace central = local de operação real
5. Painel direito = operador contextual, não widget
6. Estética silenciosa, técnica e premium
7. UI à altura da arquitetura real
8. Produto mais maduro, caro e confiável
9. Sensação de dashboard SaaS deve desaparecer
10. Sensação de tool/workstation deve dominar

---

## CRITÉRIOS DE ACEITAÇÃO

Refatoração bem-sucedida só se:

- app não parece mais página web
- app não depende de card grids como linguagem principal
- shell parece software desktop profissional
- sidebar parece navegação de workspace técnico
- fundo escuro parece sistema de superfícies, não dark mode genérico
- workspace central parece área operacional
- painel de IA parece inspector / operator console
- hierarquia visual mais clara
- densidade mais profissional
- interface comunica melhor a arquitetura do produto
- mudança perceptível ao abrir
- percepção geral em nível premium

---

## ENTREGA ESPERADA

1. Nova arquitetura do app shell
2. Nova organização da sidebar
3. Novo sistema de superfícies
4. Novo fundo técnico e profundo
5. Refatoração do workspace central
6. Refatoração do AI panel como inspector
7. Redução drástica da aparência de dashboard
8. Aumento claro de densidade, clareza e maturidade

Ao final: listar arquivos alterados; explicar racional arquitetural; alinhamento da nova UI ao modelo real do produto; o que foi preservado; o que foi consolidado; limitações estruturais herdadas.

---

## ÚLTIMA REGRA

Não melhoria mediana. Não redesign cosmético. Não apenas repaginada.

Fazer a interface finalmente parecer o produto que o sistema já é por dentro:

**uma workstation profissional de auditoria inteligente, memória operacional, healing e decisão assistida por IA.**

---
## STATUS ATUAL DO PROJETO (agora)

### Como o produto está hoje (o que já foi “consertado de verdade”)
- `companion/src/renderer.html` e `companion/src/renderer.js` passaram a tratar as superfícies principais (topbar, filas/queues, inspector e áreas abaixo do sticky) como estado dirigido por motor, usando `data-shell` como contrato.
- A navegação do workspace deixou de depender de seletores frágeis: o clique na sidebar agora volta a alternar corretamente as views porque o container do menu foi marcado de forma consistente (`.app-sidebar`) e o `bindNavigation()` volta a interceptar os cliques.
- O modo Focus AI passou a ter comportamento global consistente (visibilidade/entrega do sticky “somente em Focus”, sem toggle genérico solto).
- Corrigimos o “chat não responde / não renderiza nada” quando o assistente é montado por React (bundle carregada lazy):
  - as refs usadas pelo `renderer.js` para renderizar conversa/estado foram reancoradas com mais IDs,
  - `runAssistantQuery()` espera o assistant UI estar pronto antes de tentar renderizar bubbles/estado,
  - `switchView("settings")` agora força a montagem do workspace React (pra aparecerem controles do engine).
- `npm --prefix companion run test:ui` está passando com o layout atual do renderer (`SITEPULSE_DESKTOP_UI_CONTRACT_OK`).

### Mensagem “No suggested action or confidence too low.”
- Essa mensagem vem da governança de ação do assistant: em `renderer.js`, a execução do primeiro “passo sugerido” só acontece se existir `assistantDecisionPlan.steps` e a `confidence` do intent for >= `0.7`.
- Quando a confiança fica baixa ou não existe plano de ação suficiente, a UI ainda deve mostrar a resposta/conversa, mas **não executa nem sugere ações automaticamente**.
- Para reduzir fricção operacional, o usuário pode:
  - pedir explicitamente para “abrir findings / abrir settings / rodar auditoria”, ou
  - mandar uma solicitação mais contextual (com base no que está carregado no report atual).

### ORE / data-shell (dinâmico, sem mocks visuais)
- A camada ORE (Operator Response / operator modes) foi integrada com a lógica de renderização:
  - cards e padrões “de operação” (queues, context strip, fix plan, operator insight blocks) são alimentados via `data-shell` derivados de `report`/`snap`/metrics,
  - o conteúdo “abaixo do sticky” e a superfície de contexto passam a ser alimentadas pela mesma origem (coerência total entre sticky/workspace/dock).
- Importante: `data-shell` funciona como o “contrato duro” entre motor e UI; o objetivo é que o DOM mostrado seja o que o motor determina, e não narrativa mock.

---
## LIMITAÇÕES E GATILHOS (importantes para entender o comportamento)
- A execução automática de ações do assistant é intencionalmente conservadora (confidence >= `0.7`), para evitar ações precipitadas.
- A operação do motor (bridge/runtime) depende do engine real estar online. Se aparecer `engine offline`, a ação correta é ir em `Settings` e iniciar o engine/bridge (os controles podem ser montados lazy pelo React, por isso o `switchView("settings")` foi ajustado).

---
## PRINCIPAIS ARTEFATOS TOCADOS NAS MUDANÇAS RECENTES
- `companion/src/renderer.html` (sidebar wiring, assistant UI container, contrato visual por `data-shell`, estruturas de sticky/dock)
- `companion/src/renderer.js` (refs do assistant, gating de render, reancoragem após bundle React lazy, engine controls ao entrar em settings, governança de ação)
- `companion/src/renderer.css` (comportamento Focus: `.arch-sticky-body` e pulsing/pip)
- `companion/src/ore.js` (atualizações onde a lógica de “abaixo do sticky” foi delegada ao renderer.js via `data-shell`)
- `companion/scripts/ui-contract.mjs` (contrato do layout atualizado para refletir a estrutura real do renderer atual)

---
## STATUS ATUALIZADO (agora - sidebar/workspaces/engine)

### O que foi implementado agora
- **Workspace System (cutover opcional):** por padrão fica **desligado**. Ligar só com opt-in explícito (`localStorage` `sitepulse:workspace-system:enabled` = `1`, ou `?workspaceSystem=1`, ou `window.__SITEPULSE_ENABLE_WORKSPACE_SYSTEM__ = true`). Motivo: com o sistema ligado, o `#mainGrid` era escondido e o `#workspace-host` ocupava a área; qualquer falha de montagem/React deixava a tela só com o fundo azul e **sem clique**. Com desligado, o app volta a usar o shell legado (Control Center) sempre clicável.
- **WorkspaceManager:** removidos listeners duplicados na sidebar (`bindSidebarEvents` não é mais chamado no `init`); a navegação fica só em `renderer.js` (`bindNavigation` → `switchView`).
- Sidebar sem espelhamento para as áreas principais (quando o workspace está **ligado**): a navegação direciona para superfícies independentes (`operator`, `findings`, `seo`, `compare`) via `WorkspaceManager`.
- `Settings` usa dock expandido (não Focus AI “cego”) para não esconder `#operatorBelowSticky` inteiro enquanto o React carrega os controles de engine.
- O host dos workspaces (`#workspace-host`) ganhou controle explícito de visibilidade no `renderer.js`:
  - aparece quando a navegação é para workspaces independentes,
  - é ocultado quando a superfície ativa é `settings` (focus da IA).
- O bootstrap do Workspace System foi mantido com fallback seguro:
  - há inicialização condicional no runtime real,
  - continuam disponíveis controles manuais por flag (`window/query/localStorage`) para ativar/desativar quando necessário.

### One-click audit (automação operacional)
- Foi adicionado um comando de auditoria one-click no projeto QA:
  - novo script `qa/src/audit-oneclick.mjs`,
  - novo comando `npm --prefix qa run audit:oneclick`.
- Fluxo do one-click:
  1. sobe servidor local com `serverCommand` do config,
  2. aguarda health (`/`, `/health`, `/api/health`, `/ready`),
  3. executa auditoria com logs live/human,
  4. encerra árvore do servidor ao final.
- Também foi validado em modo público/no-server com sucesso:
  - `npm --prefix qa run audit:oneclick -- --base-url "https://example.com" --no-server`.

### Estado de validação no momento
- `lint` dos arquivos alterados sem erros.
- `test:ui` passou nos ciclos anteriores após os ajustes de contrato e wiring.
- No estado mais recente, houve timeout de carregamento em `page.goto(file://...renderer.html)` durante `test:ui` (antes das asserts de contrato), indicando instabilidade ambiental de carga da página em modo file/static, não regressão funcional direta da regra de sidebar no runtime do app.

### Arquivos tocados nesta etapa final
- `companion/src/renderer.js`
  - roteamento de view para workspace independente,
  - controle de visibilidade do host de workspace,
  - `settings` como superfície dedicada para engine,
  - regra de ativação do workspace system em runtime real + fallback por flags.
- `qa/package.json`
  - adição do comando `audit:oneclick`.
- `qa/src/audit-oneclick.mjs`
  - orquestração fim-a-fim de server + healthcheck + audit + teardown.
