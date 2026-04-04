# Alinhamento: Arquitetura de Software ↔ Modelo Mental ↔ Interface

Documento de re-arquitetura da camada de interface para refletir o sistema real: auditoria assistida por IA com múltiplos motores.

---

## 0. Posicionamento e modelo mental do produto

**SitePulse Studio** não é um dashboard. É um **AI Assisted QA Operating System**.

O modelo mental correto é **OPERATIONS WORKSTATION**: uma estação de trabalho onde o utilizador:

- executa auditorias
- analisa issues
- consulta memória operacional
- gera prompts de correção
- executa healing attempts
- analisa impacto
- observa tendências
- recebe recomendações da IA

A interface deve parecer uma **ferramenta profissional**, não uma página. Isto implica:

- Densidade operacional, list/detail, split, inspector — não “cards” e “landing”.
- Centro explícito (evidência atual) e lentes sobre esse centro — não navegação de “páginas” soltas.
- Linguagem e hierarquia de workstation (mission → evidence → intelligence → actions), não de dashboard SaaS.

---

## 1. Arquitetura de software (sistema real)

O produto é composto por **nove camadas** que não são “telas”, mas **dimensões do mesmo artefacto** (o relatório de auditoria + histórico):

| Camada | Responsabilidade | Onde aparece hoje |
|--------|------------------|-------------------|
| 1. QA runtime learning | Memória operacional, validated/failed/partial, manual override | Settings (painel de memória) |
| 2. Electron bridge | IPC, getLearningMemory, getHealingSnapshot, prepareHealingAttempt | Invisível |
| 3. Renderer state and UX | Normalização do report, snapshot de inteligência derivada | Todo o renderer |
| 4. Assistant reasoning and action | Modos cognitivos, intents, ações seguras | Painel direito (AI workspace) |
| 5. Self-Healing orchestration | Elegibilidade, healing mode, prompts, revalidação | Prompts (fila) + Findings (por issue) |
| 6. Impact and continuous intelligence | P0–P4, tendências, executive summary | Overview, Findings, Assistant |
| 7. Data Intelligence | SITE_STATE, QUALITY_STATE, RISK_STATE, ISSUE_MAP consolidado | Findings, Assistant |
| 8. Optimization Engine | Clusters, topImprovements, structuralRecommendations | Assistant, dados no snapshot |
| 9. Quality Control Engine | False positives, topWarnings, coerência de sinais | Dados no snapshot |

**Fluxo de dados real:**  
Target → Run → **Report** → (Learning, Healing, Impact, Predictive, Autonomous QA, Optimization, QC) → **Derived snapshot** → Findings / Compare / Prompts / Assistant / Settings.

---

## 2. Modelo mental do produto

O utilizador não “navega por módulos” ao acaso. Ele segue um **fluxo operacional**:

1. **Mission** — Definir alvo e executar a auditoria (Overview + Run).
2. **Evidence** — Ver o resultado da run: relatório, timeline, stage board (Operations) e os artefactos derivados: **Findings** (issues), **Compare** (delta vs baseline), **SEO** (fatia SEO).
3. **Intelligence** — Os motores não são “uma página”: são estado derivado do report. Surfaces onde esse estado é **visível e acionável**:
   - **Memory** → em Settings (learnings validados, override).
   - **Healing** → em Prompts (fila, prepare attempt) e em cada issue nos Findings.
   - Predictive, Optimization, QC → alimentam Findings, Compare e Assistant (não são vistas isoladas).
4. **Actions** — O que o operador faz com a evidência: **Prompts** (pack, healing, replay), **Reports** (cofre), **Preview** (alvo ao vivo).
5. **System** — Configuração do runtime, paths, memória (Settings).

Hierarquia informacional:

- **Nível 0:** Target + Run (entrada).
- **Nível 1:** Evidence = Report + timeline + stage (saída da run).
- **Nível 2:** Intelligence = todas as dimensões derivadas (memory, healing, impact, predictive, optimization, QC) sobre o mesmo report.
- **Nível 3:** Actions = prompts, healing attempt, compare, memory override, export.

---

## 3. Princípios da interface alinhada

- **Ferramenta profissional, não página** — A UI é uma workstation: painéis, listas, inspectores, estado dos motores. Evitar estética de “landing”, “dashboard” ou “app de uma página”.
- **Estrutura** — A navegação e os agrupamentos devem seguir Mission → Evidence → Intelligence (surfaces) → Actions → System, não grupos genéricos (Core / Productivity).
- **Fluxo** — A ordem visual e a descoberta devem refletir “configurar → correr → ver evidência → ver inteligência → agir”.
- **Hierarquia** — O report é o centro; Findings, Compare, SEO, Memory, Healing são **vistas sobre o mesmo report** (ou sobre histórico). O header/contexto deve deixar claro “sobre o quê” está cada vista.
- **Densidade informacional** — Surfaces operacionais (Findings, Compare, Prompts, Settings) devem mostrar estado dos motores (contagens, status) de forma compacta, não decorativa.
- **Clareza operacional** — Cada área deve responder: “O que posso fazer aqui?” e “Qual o estado do motor relevante?”.

---

## 4. Arquitetura de interface proposta

### 4.1 Navegação principal (sidebar)

Agrupamento: **Core**, **Intelligence**, **Productivity**, **System**.

| Grupo | Itens | data-view | Notas |
|-------|--------|-----------|--------|
| **Core** | Overview, Runs, Findings, SEO, Compare | overview, operations, findings, seo, compare | Runs = progresso e timeline (operations). |
| **Intelligence** | Memory, Healing, Predictive, Optimization, Quality Control | settings, prompts, overview | Memory → Settings (painel memória). Healing → Prompts (fila). Predictive / Optimization / QC → Overview (dados no snapshot). |
| **Productivity** | Prompt Workspace, Reports, Preview | prompts, reports, preview | |
| **System** | Settings | settings | Engine, paths, memória. |

Opcional: na barra de contexto (workspace header ou strip por baixo) mostrar um **resumo dos motores** para o report atual, por exemplo:  
`Memory 12 · Healing 3 ready · Impact P0–P4 · Predictive active`  
para que a existência e o estado dos motores sejam visíveis sem ser uma “página” por motor.

### 4.2 Workspace header (contexto)

- **Sempre visível:** target atual (ou “no report”), estado da run (idle / running / completed), e **eyebrow + title + description** da vista atual (VIEW_META).
- **Opcional — Engine summary strip:** uma linha compacta com contagens do derived snapshot (learning memory entries, healing-ready, etc.) quando há report carregado, para reforçar que há múltiplos motores por trás da mesma evidência.

### 4.3 Painel direito (Assistant)

- Mantém-se como **contexto operacional**: conversa, insights, ações. Não é “uma página a mais”, é a superfície de **reasoning and action** sobre o mesmo report e snapshot.

### 4.4 Workspace central como superfície operacional

Cada workspace deve ter: **mission**, **current state**, **analysis surface**, **actions**.

- **Remover:** card grids, UI decorativa, blocos isolados.
- **Substituir por:** operational panels (`.op-panel`), issue boards (`.op-board`), inspection views (`.op-inspection`), data tables (`.op-table`), cluster analysis (`.op-cluster-list`).
- **Padrão:** `.op-workspace` com `.op-state-strip` (estado atual), `.op-actions` (ações), `.op-surface` (área de análise com painéis operacionais).

O Overview foi refatorado com este padrão: state strip (Routes, Actions, Issues, SEO, Risk), barra de ações, superfície em split (perfil de execução | análise com Runtime, Next actions, Impact, Quality, Risk, Priority queue, Optimization, Quality control).

### 4.5 Densidade e padrões

- **List/detail** em Findings (lista de issues + inspector).
- **Split** em Compare (baseline vs current).
- **Table/detail** ou list + detail em Memory (Settings) e Healing (Prompts).
- **Inspector** para “detalhe de um item” (issue, learning entry, healing attempt).

---

## 5. Fase 1 (implementação imediata) — FEITO

1. **Sidebar:** Reordenado e renomeado para **Mission | Evidence | Actions | System**; removidos os quatro botões desabilitados (Memory, Healing, Predictive, Optimization). Mission = Overview, Operations; Evidence = Findings, Compare, SEO; Actions = Prompts, Reports, Preview; System = Settings.
2. **Workspace header:** Adicionada faixa **Engine summary** (`#engineSummaryStrip`): quando há report, mostra contagens compactas (Memory N · Healing M ready · Issues K · Predictive risk). Oculta quando não há report. Atualizada em `renderWorkspaceHeader` e `renderAllReportState`.
3. **Contratos:** Mantidos todos os `data-view` e `data-view-panel`; nenhuma nova vista adicionada.

Fases seguintes (fora do âmbito desta fase):

- Expor “Memory” e “Healing” como atalhos explícitos (ex.: “Memory” que abre Settings e faz scroll/focus ao painel de memória; “Healing” que abre Prompts e foca a fila).
- Refinar a “Engine summary” com ícones ou badges por motor (Learning, Healing, Impact, Predictive, Optimization, QC) quando houver dados.

---

## 6. Bloco 12 — Constraints (âmbito das alterações)

O rework da interface tem **limites explícitos**: alterar apenas a camada de apresentação; não alterar motores nem contratos de dados.

**Não alterar:**

- **QA runtime** — Lógica de execução de auditorias, normalização de report, ciclo run → report.
- **Assistant service** — Serviço de reasoning, intents, ações, integração com o snapshot.
- **Healing engine** — Orquestração de healing, elegibilidade, prepare attempt, revalidação.
- **Data intelligence** — SITE_STATE, QUALITY_STATE, RISK_STATE, ISSUE_MAP, derived snapshot.

**Modificar apenas:**

- **App shell** — Topbar, sidebar, main-grid, app-body, estrutura do documento (renderer.html).
- **Layout** — Grids, splits, workspace central, painel do assistant; não a lógica que alimenta as vistas.
- **UI surfaces** — Sistema de superfícies (app-background, workspace-surface, panel-surface, inspector-surface), componentes visuais, densidade.
- **Hierarquia visual** — Tipografia, espaçamento (8/12/16), separadores, padrões op-* (state strip, actions, surface).

Qualquer alteração que toque em IPC, contratos main ↔ renderer, ou na implementação dos motores (learning, healing, impact, predictive, optimization, QC) fica **fora do âmbito** do Bloco 12.

---

## 7. Resumo

- **Arquitetura de software:** 9 camadas; report + histórico como centro; motores como dimensões derivadas.
- **Modelo mental:** Mission → Evidence → Intelligence (surfaces) → Actions → System.
- **Interface:** Navegação e hierarquia alinhadas a esse fluxo; remoção de “Intelligence” como grupo de botões mortos; opcional resumo dos motores no header; densidade e padrões operacionais (list/detail, split, inspector) em todas as superfícies.
- **Constraints (Bloco 12):** Alterar apenas app shell, layout, UI surfaces e hierarquia visual; não alterar QA runtime, assistant service, healing engine nem data intelligence.
- **Resultado final (Bloco 13):** A interface deve parecer um **AI Audit Operating System**, não um dashboard.
- **Execução (Bloco 14):** Refatoração em 6 fases: (1) app shell, (2) sidebar navigation, (3) workspace restructuring, (4) AI inspector panel, (5) surface system, (6) UI density tuning.

Assim a interface deixa de ser um conjunto de “páginas” e passa a **representar uma Operations Workstation** — ferramenta profissional de AI Assisted QA, não um dashboard.

---

## 8. Bloco 13 — Resultado final esperado

A interface final deve parecer:

**AI AUDIT OPERATING SYSTEM**

não um dashboard.

Ou seja: densidade operacional, superfícies de trabalho (workspace, panels, inspector), estado dos motores visível, fluxo mission → evidence → intelligence → actions. Nada de cards de marketing, hero sections, ou layout de landing. O utilizador deve reconhecer imediatamente que está perante uma **estação de trabalho de auditoria assistida por IA**, não perante um painel de métricas ou um site de produto.

---

## 9. Bloco 14 — Execução

A refatoração da interface deve ser executada em **fases**, na ordem abaixo:

| Fase | Âmbito |
|------|--------|
| **Fase 1** | App shell — topbar, main-grid, app-body, estrutura base (renderer.html / renderer.css). |
| **Fase 2** | Sidebar navigation — grupos (Core / Intelligence / Productivity / System), itens, estados ativos. |
| **Fase 3** | Workspace restructuring — workspace central, state strip, op-* (mission, state, surface, actions), padrões list/detail e split. |
| **Fase 4** | AI inspector panel — painel inferior como AI Operator Console, strip (context, risk, priority, next actions), tabs (Conversation, Insights, Actions, Memory, Healing). |
| **Fase 5** | Surface system — camadas app-background, workspace-surface, panel-surface, inspector-surface; cores e superfícies sólidas. |
| **Fase 6** | UI density tuning — escala de spacing (8 / 12 / 16), remoção de espaçamento tipo landing, hierarquia visual e separadores. |

Cada fase conclui-se antes de avançar para a seguinte; alterações limitam-se ao âmbito do Bloco 12 (shell, layout, UI surfaces, hierarquia visual).

---

## 10. Resultado esperado — Mudança de percepção

A percepção do produto deve mudar de:

**dashboard SaaS**

para:

**AI-powered QA workstation**

Ou seja: quem usa deve sentir que está numa ferramenta de trabalho (workstation) de QA potenciada por IA — não num painel genérico de métricas ou num produto SaaS de uma página.

---

## 11. Nota do arquiteto de produto

A arquitetura descrita neste documento é **muito forte**. Poucas ferramentas têm:

- runtime learning  
- healing orchestration  
- predictive intelligence  
- optimization engine  
- quality control engine  
- cognitive modes  

A interface atual **ainda não comunica esse poder**. Quando a UI refletir a arquitetura (superfícies operacionais, estado dos motores visível, fluxo mission → evidence → intelligence → actions, densidade e hierarquia de workstation), o produto passa automaticamente a parecer **ordens de grandeza mais avançado**.

**Master Prompt:** O documento `companion/docs/MASTER-PROMPT-INTERFACE-REARCHITECTURE.md` contém o prompt de referência para orientar o redesenho do SitePulse Studio para nível de produto de referência (Datadog / Linear / JetBrains). Usar como guia em todas as fases de refatoração da UI.
