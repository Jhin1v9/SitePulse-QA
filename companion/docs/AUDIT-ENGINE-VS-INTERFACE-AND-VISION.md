# SitePulse Studio — Auditoria Motor vs Interface, Arquitetura de Interface e Plano de Evolução

**Documento oficial consolidado.** Alinha o motor operacional e as superfícies de interface, garantindo que o poder real do sistema seja exposto, compreensível e acionável na UI.

Define: estado atual do motor; o que a interface expõe; lacunas de paridade; evolução além da paridade; **modelo de informação (Estado / Comando / Insight)**; **regras de localização** por superfície; **regra determinística do Do Next**; **guardrails de implementação**; plano de implementação faseado.

**Nenhuma implementação deve começar antes da aprovação deste documento.**

---

## 1. Resumo executivo

O motor do SitePulse já possui:

- runtime learning  
- self-healing  
- predictive intelligence  
- autonomous QA  
- optimization engine  
- quality control  
- data intelligence  
- assistant com contexto completo  

A interface atual consome grande parte dessas capacidades, mas há dois problemas principais:

1. **Comunicação sistémica fraca** — A UI não deixa claro que todos os motores estão ativos e cooperando.
2. **Baixa acionabilidade** — A informação aparece, mas nem sempre se transforma em ação direta em um clique.

Objetivo desta evolução:

- tornar o sistema **legível como um todo**  
- transformar **inteligência em ação imediata**  
- dar ao utilizador a sensação de **operar um sistema integrado**  

### 1.1 Mudança de produto: Dashboard → Software de operação

O produto muda de:

- **Dashboard com IA** — informação e gráficos, com assistente ao lado.

Para:

- **Software de operação com IA** — motor forte exposto como **superfície de ação**: cada insight conduz a um comando executável.

O motor já existe e é forte. O que falta é:

- **ACTION SURFACE**  
  Ou seja: **INTELLIGENCE → ACTION**.

Toda superfície de interface deve responder: *o que posso fazer agora com esta informação?* Estado e insight sem ação próxima são incompletos. A prioridade da evolução da UI é fechar o circuito **Intelligence → Action** em cada bloco (system state, next action, priority queue, run history, assistant suggestions).

### 1.2 Arquitetura de layout (estrutura fixa)

O layout base do programa **não** é `sidebar | main | AI sidebar`. É:

```
┌───────────────────────────────────────────────┐
│ Top bar                                       │
├──────────┬────────────────────────────────────┤
│ Sidebar  │ Workspace (header + body por vista) │
│          │                                    │
├──────────┴────────────────────────────────────┤
│ AI Workspace (dock inferior, largura total)   │
└───────────────────────────────────────────────┘
```

- **AI em baixo, nunca em sidebar direita.** O chat precisa largura total (800–1200px) para parecer operador do sistema, não plugin. Implementação: `app-body` em 2 linhas quando o inspector está aberto; segunda linha = `#assistantWorkspace.ai-workspace-dock`.
- **Bloco Mission brief / Run status** (hero) aparece **apenas em Overview**. Nas outras vistas cada workspace tem layout próprio (Findings = filtros + tabela; SEO = score + signals; etc.). Classe `workspace-header-overview` no header e `.workspace-summary` escondido quando não Overview.
- **Classe por vista** em `#workspaceShell`: `workspace-view-overview`, `workspace-view-findings`, etc., para CSS e futuros layouts específicos.
- **Densidade de ferramenta:** padding e gaps reduzidos (main-grid, workspace-header, workspace-body, op-panel, system-state-strip) para sensação de software técnico (Linear, Datadog), não dashboard web.

**Não** reintroduzir AI como terceira coluna. **Não** mostrar hero em todas as páginas.

---

## 2. Modelo de informação da UI

Toda superfície da interface deve pertencer claramente a um dos três papéis abaixo. **Nenhum elemento deve existir sem se encaixar em um deles.**

### Estado

Mostra **o que o sistema sabe agora**.

Exemplos: report carregado, número de issues, trajectory, baseline set, optimization opportunities, QC warnings, predictive alerts, learning memory count, healing ready.

**Estado nunca executa ação.** Estado apenas informa.

### Comando

Representa **algo que o utilizador pode fazer agora**.

Exemplos: run audit, open findings, prepare healing, open compare, export report, set baseline, **Do next**.

Comando **sempre** resulta em mudança de contexto ou execução operacional.

### Insight

Representa **interpretação do sistema**.

Exemplos: highest risk is runtime failure, quality trajectory degrading, 3 structural optimization opportunities, 2 suspected false positives.

Insight responde: *o que significa o estado atual*. Insights devem estar ligados a navegação, drill-down ou ação.

---

## 3. Regras de localização (evitar duplicação)

Cada tipo de informação tem **um lugar principal**. Repetir o mesmo sinal em mais de duas superfícies exige justificativa.

| Superfície | O que mostra | O que não deve conter |
|------------|--------------|------------------------|
| **Topbar** | Apenas **estado global** do sistema (engine status, run state, memory/healing/predictive quando relevante, command palette). | Insights detalhados; comandos contextuais da vista. |
| **Workspace header** | **Contexto da vista atual** + **mission status** (frase dinâmica: onde estou e o que está a acontecer) + ações principais da vista. | Contagens repetidas que já estão no engine strip. |
| **Engine strip** | **Resumo denso dos motores** (Issues, Memory, Healing, Predictive, Optimization, QC, Trajectory, Baseline) com **links rápidos** para as superfícies operacionais. | Conteúdo longo; insights narrativos. |
| **Workspace principal** | **Operação primária** da vista (Overview: painéis; Findings: lista e filtros; Prompts: fila; Compare: delta; Settings: formulários). | Estado que já está na topbar ou no engine strip, salvo reforço contextual. |
| **Assistant panel** | **Contexto assistido** (mode, intent, run state, risk) + **ações contextuais** (suggested actions com Open issue / Prepare healing). | Duplicar blocos de estado que já existem no workspace. |

**Regra:** Não espalhar a mesma informação (baseline set, memory count, next action, optimization, QC, trajectory) em todo o lado; atribuir **um dono** por tipo de sinal e referenciar a partir das outras superfícies quando necessário.

---

## 4. Arquitetura das superfícies

### 4.1 Topbar

Função: **estado global do sistema.**

Deve comunicar: engine status, audit state, workspace context, memory/healing/predictive quando há report, command palette (⌘K), quick actions (Run, Load, AI). Não deve conter insights detalhados.

### 4.2 Workspace header

Função: **contexto da vista atual.**

Contém: nome da vista, descrição curta, **mission status**, ações principais da vista.

**Mission status** é uma frase dinâmica que responde: *onde estou e o que está a acontecer?*

Exemplos:

- No report loaded  
- Report loaded — 12 issues, 2 P0  
- Run in progress  
- Baseline set — compare available  
- 3 healing attempts ready  

### 4.3 Engine summary strip

Função: **resumo denso dos motores e navegação contextual.**

Elementos (quando há dados): Issues N · Memory N · Healing N ready · Predictive N alerts · Optimization N opportunities · QC N warnings · Trajectory ↑/↓ · Baseline set/none.

Cada elemento deve permitir **navegação contextual** (ex.: Optimization → scroll ao painel Optimization; QC → painel QC; Memory → Settings memória; Healing → Prompts fila).

### 4.4 Workspace principal

Área **operacional primária**. Cada vista (Overview, Findings, Prompts, Compare, Settings) tem header contextual, painéis operacionais e listas acionáveis. Evitar excesso de widgets, fragmentação em cards e repetição de informação já presente na topbar ou no engine strip.

### 4.5 Assistant panel

Função: **operador cognitivo** — contexto assistido + ação contextual.

Camadas:

- **System context:** mode, intent, run state, scope, risk level.  
- **Focus:** current issue, priority focus, trajectory.  
- **Suggested actions:** lista de ações sugeridas pela IA; **cada ação deve ter** Open issue, Prepare healing, Open findings ou Run compare conforme o caso.  
- **Conversation:** diálogo com histórico. A conversa não deve dominar; o painel é ferramenta operacional assistida, não um chat.

**Regra:** Toda ação sugerida no Assistant deve, sempre que possível, resultar em **navegação, foco, preparação ou execução contextual dentro do app**. A aba Actions funciona como **ponte** entre IA e app, não como lista isolada de texto.

---

## 5. Matriz Motor vs Interface

| # | Capacidade do motor | Onde vive | Interface atual | Lacuna |
|---|---------------------|-----------|------------------|--------|
| 1 | Run audit, open CMD | main.cjs, preload | Topbar Run, Overview, command palette | OK |
| 2 | Load report | main.cjs pickReportFile | Topbar Load, File menu | OK |
| 3 | Export report | main.cjs exportReportFile | Export, Ctrl+S | OK |
| 4 | getLearningMemory | main.cjs runLearningAdmin | Settings Memory; engine strip | Visibilidade constante quando há report |
| 5 | applyLearningManualOverride | main.cjs runLearningAdmin | Findings/Settings | OK; toast + refresh strip opcional |
| 6 | getHealingSnapshot | main.cjs runHealingAdmin | Prompts; engine strip | Acesso rápido e visibilidade |
| 7 | prepareHealingAttempt | main.cjs runHealingAdmin | Por issue em Findings | Atalho “Prepare next” a partir da recommended order |
| 8 | buildDesktopIntelligenceSnapshot | renderer.js, data-intelligence-service, predictive, autonomous, optimization, quality-control | Overview, Findings, Assistant | Vista unificada (Control Center) opcional; strips por motor |
| 9 | SITE_STATE, QUALITY_STATE, RISK_STATE, TREND_STATE, ISSUE_MAP | data-intelligence-service.js | Executive, risk map, priority, trends, issue cards | trajectory + confidence em destaque |
| 10 | autonomous.nextActions, qualityScore, playbooks, insights | autonomous-qa-service.js | Overview, Prompt workspace, Assistant | Next action **clicável**; botão **Do next** |
| 11 | optimization (topImprovements, clusters, opportunityGroups) | optimization-engine-service.js | Overview painel Optimization; Assistant | Strip; **drill path:** resumo → cluster → issues afetadas → ação |
| 12 | qualityControl (topWarnings, false positives, inconsistencies) | quality-control-engine.js | Overview painel QC; Assistant | Strip; **drill path:** resumo → warning → issues relacionadas → validação operacional |
| 13 | predictive (alerts, systemicPatterns, issueSignals) | predictive-intelligence-service.js | Executive, Findings filtro, Assistant | Strip “Predictive N” quando N > 0 |
| 14 | Assistant respond(getContext()) | assistant-service.js | Conversation, Insights, Actions, Memory, Healing; strip | Intent e suggested action no strip; ações com link real para o app |
| 15 | Compare, buildCompareDigest | renderer.js loadBaseline, buildCompareDigest | Compare view | OK; indicador “Baseline set” no header |
| 16 | Run history (last N runs) | buildComparableHistoryContext, runHistory no snapshot | Compare e assistant context; não listado na UI | **Run history com propósito operacional:** estamos a melhorar ou a piorar? problema novo, persistente ou recorrente? qual run como baseline? última run estável? Não é só lista decorativa. |
| 17 | SEO source | main.cjs getSeoSource, saveSeoSource, refreshSeoSource | Settings | OK |
| 18 | Open evidence, artifact file/path | main.cjs | Reports / evidence | OK |
| 19 | Command palette | renderer.js getCommandPaletteItems | Ctrl+K | OK |
| 20 | VIEW_META | renderer.js | Workspace header, topbar context | OK |

---

## 6. Paridade necessária (P1–P8)

A interface deve atingir **paridade** com o motor antes de evoluir além.

| Id | Ação | Onde | Descrição |
|----|------|------|-----------|
| **P1** | Engine strip expandido | Workspace header | Incluir Optimization N, QC M, Predictive K (quando há dados); Trajectory; Baseline set/none. Cada elemento com link para a superfície correspondente. |
| **P2** | Recommended actions clicáveis | Overview (priority queue, executive action order) e Assistant (next actions) | Cada item com Open issue, Prepare healing ou Open findings conforme o caso. |
| **P3** | Botão **Do next** | Overview ou topbar | Comando universal que executa a próxima ação recomendada (ver secção 7). |
| **P4** | Memory e Healing sempre visíveis | Engine strip / topbar | Quando há report: Memory N · Healing M ready; atualizar após override ou load report. |
| **P5** | Optimization e QC como superfícies acionáveis | Engine strip ou op-state-strip | “Optimization: N opportunities” e “QC: M warnings” com navegação ao painel ou lista; **drill path definido** (Optimization: resumo → cluster → issues → ação; QC: resumo → warning → issues → validação). |
| **P6** | Run history compacto | Overview ou Compare ou dropdown | Last 4–8 runs (timestamp, totalIssues, baseUrl); **propósito operacional:** melhorar/piorar? novo/persistente/recorrente? qual baseline? última estável? Clicar: carregar report ou definir baseline. |
| **P7** | Indicador “Baseline set” | Workspace header ou Compare | Quando há baseline em localStorage: “Baseline: [date]” ou ícone. |
| **P8** | Assistant actions operacionais | Assistant tab Actions | Cada ação sugerida com botão que executa no app (Open issue, Prepare healing, Open findings). A aba Actions é **ponte** entre IA e app. |

Nenhuma destas exige alterar QA runtime, assistant service, healing engine ou data intelligence (apenas shell, layout, superfícies — Bloco 12).

---

## 7. Regra determinística do Do next

O comando **Do next** deve seguir uma lógica **determinística** para ser previsível.

1. Se existir **autonomous.nextActions[0]** com ação executável → usar esse.
2. Senão, usar **RISK_STATE.recommendedActionOrder[0]** (primeira issue da fila recomendada).
3. Se a issue for **healing eligible** → priorizar **Prepare healing** (abrir Prompts / fluxo de prepare attempt para essa issue).
4. Se não for healing eligible → **abrir Findings** já focado nessa issue.
5. Se não houver issue acionável → cair para **Overview** com foco em insights ou para **Compare** se fizer sentido.

Implementação não deve inventar ordem diferente; esta regra é a referência única.

---

## 8. Evolução além da paridade (V1–V8)

Após paridade, a interface pode evoluir.

| Id | Ideia | Descrição |
|----|--------|-----------|
| **V1** | **Control Center** (não “Intelligence at a glance”) | Vista única de **estado + prioridade + acionabilidade**: SITE_STATE, QUALITY_STATE, RISK_STATE, TREND_STATE, next actions, Memory, Healing, Optimization, QC. Nome mental: centro de comando / system state / intelligence console — não “mais uma página resumo”. |
| **V2** | Engine strips avançados | Linha de motores: Memory · Healing · Predictive · Optimization · QC com contagens e cor; clique → superfície correspondente. |
| **V3** | Mission status | Frase dinâmica no workspace header (já em P6/P7; reforçar como padrão). |
| **V4** | Priority queue acionável | Priority queue como lista de **ações** (próxima ação por issue) com Open e Prepare (quando healing eligible). |
| **V5** | Assistant intent + ação aplicável | Strip do Assistant: intent e suggested action; botão “Apply” que executa (ex.: switchView("findings")). |
| **V6** | Run history avançado | Runs + baseline numa superfície; decisão (baseline, última estável, tendência). |
| **V7** | Optimization drill-down | Cluster → issues afetadas → ação (path definido desde o desenho). |
| **V8** | QC drill-down | Warning → issues relacionadas → validação operacional (path definido desde o desenho). |

**Optimization e QC:** nascer já com caminho de drill-down definido (resumo → cluster/warning → issues → ação/validação); não implementar só o resumo e deixar o fluxo para depois.

---

## 9. Guardrails de implementação

Durante a implementação, obrigatório:

1. **Não duplicar** o mesmo sinal em mais de duas superfícies sem justificativa explícita.  
2. **Toda contagem** relevante (Memory, Healing, Optimization, QC, Predictive) deve ter drill-down ou ação associada.  
3. **Toda ação prioritária** (Do next, recommended action) deve levar a uma superfície operacional real (Findings, Prompts, Compare).  
4. **Nenhuma nova superfície** pode existir sem papel explícito: **Estado**, **Comando** ou **Insight**.  
5. **Run history** deve servir à **decisão** (melhorar/piorar? baseline? última estável?), não apenas à memória visual.  
6. **Optimization e QC** devem nascer com **caminho de drill-down previsto** (cluster → issues → ação; warning → issues → validação).  
7. **Assistant actions** devem operar como **ponte real** com o app (navegação, foco, preparação, execução).  

Qualquer desvio exige justificativa no mesmo documento ou em anexo aprovado.

---

## 10. Limites técnicos

**Não modificar:**

- QA runtime  
- assistant service  
- healing engine  
- data intelligence  
- contratos de IPC  

**Modificar apenas:**

- shell  
- layout  
- superfícies  
- navegação  
- UI logic que consome dados já existentes (snapshot, stateEl, IPC atuais)  

Novos IDs e elementos de UI (strips, botão Do next, links em priority queue e Assistant actions, run history list, mission status) são permitidos.

---

## 11. Plano de implementação

Fases na ordem abaixo. Cada fase fecha antes de passar à seguinte.

| Fase | Itens | Conteúdo |
|------|--------|----------|
| **A** | P2, P3, P1, P4 | Recommended actions clicáveis; botão Do next (regra secção 7); engine strip expandido; memory/healing status estável. |
| **B** | P5, P7, P8 | Strips Optimization e QC com drill path; indicador Baseline set; Assistant actions operacionais (ponte com o app). |
| **C** | P6, V3 | Run history compacto com propósito operacional; mission status no header. |
| **D** | V1–V8 conforme prioridade | Control Center; assistant intent/Apply; priority queue acionável; optimization e QC drill-down; engine strips avançados; run history avançado. |

A implementação deve seguir **exatamente** este plano; não alterar a direção a meio de uma fase.

---

## 12. Conclusão

O motor do SitePulse já possui as capacidades necessárias para um sistema de auditoria inteligente completo. O objetivo desta evolução da interface é:

- tornar o sistema **compreensível como um todo**  
- reduzir a **fricção** entre insight e ação  
- transformar **inteligência em operação**  
- expor uma **Action Surface** clara: **INTELLIGENCE → ACTION** em cada superfície.

Após a implementação destas mudanças, o SitePulse Studio deve ser percebido não como um dashboard com IA, mas como **software de operação com IA** — um sistema integrado de inteligência técnica onde cada bloco de informação oferece ação imediata (Open issue, Prepare healing, Run audit, Set baseline, etc.).

---

*Documento consolidado e endurecido para servir como referência única antes de qualquer implementação. Versão final oficial.*
