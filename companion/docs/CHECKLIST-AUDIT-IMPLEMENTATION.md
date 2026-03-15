# Checklist — Implementação AUDIT-ENGINE-VS-INTERFACE-AND-VISION

Checklist de verificação contra o documento oficial. Cada item é verificável no código; não inventar respostas.

**Referência:** `companion/docs/AUDIT-ENGINE-VS-INTERFACE-AND-VISION.md`  
**Limites (Bloco 12):** Não alterar QA runtime, assistant service, healing engine, data intelligence. Apenas shell, layout, superfícies, UI que consome dados existentes.

---

## Fase A — Paridade P2, P3, P1, P4

| # | Requisito | Onde verificar | Estado |
|---|-----------|----------------|--------|
| A1 | **P2 — Recommended actions clicáveis (Overview)** Executive summary action order: cada item abre Findings com filtro. | `renderer.js`: `executiveSummaryActionOrder` preenchido com `<button class="action-link open-findings-search" data-findings-search="...">`; listener delegado chama `openFindingsWithSearch(search)`. | ✅ |
| A2 | **P2 — Recommended actions clicáveis (Overview)** Priority queue: cada item clicável abre Findings focado no issue. | `renderer.js`: `priorityViewList` artigos com `explorer-item-clickable` e `data-findings-search="${item.issueCode}"`; mesmo listener. | ✅ |
| A3 | **P2 — Recommended actions clicáveis (Assistant)** Next action no strip do Assistant clicável → abre Findings. | `renderer.js`: `renderAssistantConsoleStrip`: quando `nextActions[0]?.issueCode` existe, `assistantConsoleNextActions` é botão com `data-findings-search`; mesmo listener. | ✅ |
| A4 | **P3 — Botão Do next** Existe e executa a próxima ação recomendada. | `renderer.html`: `#doNext` na barra de ações Overview. `renderer.js`: `executeDoNext()`, bind em `stateEl.doNext` click. | ✅ |
| A5 | **P3 — Regra §7 (1)** Se existir `autonomous.nextActions[0]` → usar esse. | `renderer.js` `executeDoNext()`: `lead = nextActions[0]` primeiro. | ✅ |
| A6 | **P3 — Regra §7 (2)** Senão, usar `RISK_STATE.recommendedActionOrder[0]`. | `renderer.js` `executeDoNext()`: se não `nextActions[0]`, usa `recommendedActionOrder[0]` como `{ issueCode: firstCode, route: "/", action: "" }`; depois fallback `priorityQueue[0]`. | ✅ |
| A7 | **P3 — Regra §7 (3–4)** Se healing eligible → Prepare healing; senão → abrir Findings focado. | `executeDoNext()`: `requestHealingPreparation(issue)` se eligibility in ["eligible_for_healing","assist_only"]; senão `openFindingsWithSearch(issueCode)`. | ✅ |
| A8 | **P3 — Regra §7 (5)** Se não houver issue acionável → Overview. | `executeDoNext()`: quando `!lead` chama `switchView("overview")`. | ✅ |
| A9 | **P1 — Engine strip expandido** Issues N · Memory N · Healing N ready · Predictive · Optimization · QC · Trajectory · Baseline. | `renderer.js` `renderEngineSummaryStrip()`: segmentos para Issues, Memory, Healing, Predictive (se >0), Optimization (se >0), QC (se >0), Trajectory, Baseline set/none. | ✅ |
| A10 | **P1 — Cada elemento com link** Navegação contextual para superfície correspondente. | `renderEngineSummaryStrip`: botões `engine-strip-link` com `data-view` (findings, settings, prompts, overview, compare); listener delegado `switchView(btn.dataset.view)`. | ✅ |
| A11 | **P4 — Memory e Healing sempre visíveis** Quando há report, strip mostra Memory N e Healing M ready. | `renderEngineSummaryStrip`: com report sempre adiciona Memory e Healing; strip visível quando há report. | ✅ |

---

## Fase B — P5, P7, P8

| # | Requisito | Onde verificar | Estado |
|---|-----------|----------------|--------|
| B1 | **P5 — Optimization e QC acionáveis** Navegação ao painel ou lista (drill path). | `renderer.html`: em cada painel Optimization e Quality control, `panel-drill-row` com botão `engine-strip-link` `data-view="findings"`. Engine strip já liga Optimization/QC a overview. | ✅ |
| B2 | **P7 — Indicador “Baseline set”** Workspace header: quando há baseline, mostrar “Baseline: [date]”. | `renderer.html`: `#baselineIndicatorWrap`, `#baselineIndicator`. `renderer.js` `renderWorkspaceHeader()`: quando `uiState.baseline` existe, texto `Baseline: ${formatLocalDate(baseline.stamp)}`; wrap oculto quando não há baseline. | ✅ |
| B3 | **P8 — Assistant actions operacionais** Open issue, Prepare healing, Open findings executam no app. | `renderer.js` `executeAssistantAction()`: `open-issue` → `openFindingsWithSearch(payload.issueCode)`; `prepare-healing` → `findVisibleIssue` + `requestHealingPreparation`; `findings-search` → switchView findings + filtro. | ✅ |
| B4 | **P8 — Aba Actions como ponte** Ações sugeridas com botão que executa no app. | `renderAssistantCards()` gera botões com `data-assistant-index`; click em `assistantActions` chama `executeAssistantAction(actions[index])`. | ✅ |

---

## Fase C — P6, V3

| # | Requisito | Onde verificar | Estado |
|---|-----------|----------------|--------|
| C1 | **P6 — Run history compacto** Last 4–8 runs no Overview ou Compare. | `renderer.html`: `#compactRunHistoryWrap`, `#compactRunHistory` no workspace header. `renderer.js` `renderCompactRunHistory()`: `uiState.history.slice(0, 6)` (dentro de 4–8). | ✅ |
| C2 | **P6 — Propósito operacional** Melhorar/piorar? qual baseline? última estável? | `renderCompactRunHistory`: propósito por comparação com run anterior (↓ better / ↑ worse / → stable); tag “baseline” quando `uiState.baseline?.stamp === item.stamp`. Não: “novo/persistente/recorrente” (exige comparação de conjuntos de issues). | ⚠️ Parcial |
| C3 | **P6 — Clicar: carregar report ou definir baseline** | Botões Load e Baseline com `data-history-index` e `data-history-action`; `handleHistoryAction` em `historyList` e `compactRunHistory` (load snapshot ou `persistBaseline`). | ✅ |
| C4 | **V3 — Mission status** Frase dinâmica no workspace header. | Já existente: `missionBrief` e `headlineStatus` em `renderer.html`; `renderMissionBrief()` atualiza conforme run/estado. | ✅ |

---

## Guardrails (§9)

| # | Requisito | Verificação | Estado |
|---|-----------|-------------|--------|
| G1 | Não duplicar o mesmo sinal em mais de duas superfícies sem justificativa. | Engine strip = dono de Issues/Memory/Healing/Predictive/Optimization/QC/Trajectory/Baseline; header tem Baseline e Run history; Overview tem painéis. Sem triplicação injustificada. | ✅ |
| G2 | Toda contagem com drill-down ou ação. | Strip: links para findings/settings/prompts/overview/compare. Optimization/QC: link Open Findings. | ✅ |
| G3 | Toda ação prioritária leva a superfície operacional real. | Do next → Findings ou Prepare healing. Recommended actions → openFindingsWithSearch. | ✅ |
| G4 | Run history serve à decisão (melhorar/piorar? baseline?). | Compact run history mostra tendência e baseline; botões Load/Baseline. | ✅ |
| G5 | Assistant actions como ponte real com o app. | executeAssistantAction: open-issue, prepare-healing, findings-search, open-memory, open-healing, etc. | ✅ |

---

## Limites técnicos (§10)

| # | Requisito | Estado |
|---|-----------|--------|
| L1 | Não modificar: QA runtime, assistant service, healing engine, data intelligence, contratos IPC. | Nenhuma alteração nesses módulos; apenas renderer (shell, layout, superfícies, UI). | ✅ |
| L2 | Modificar apenas: shell, layout, superfícies, navegação, UI logic que consome dados existentes. | Alterações em renderer.html, renderer.js, renderer.css; uso de buildDesktopIntelligenceSnapshot, stateEl, getVisibleReport, etc. | ✅ |

---

## Master Prompt (clareza operacional, não cosmético)

| # | Critério | Estado |
|---|----------|--------|
| M1 | Mudanças mínimas e pontuais; não quebrar integrações. | Alterações localizadas (strip, header, overview, assistant); sem mudança de runtime/assistant/healing. | ✅ |
| M2 | Conflito estética vs clareza operacional → priorizar clareza. | Links e botões explícitos (Do next, engine-strip-link, open-findings-search); sem redesenho visual. | ✅ |
| M3 | Objetivo: sistema legível e acionável, não “deixar bonito”. | Foco em clicabilidade, navegação e regra Do next; estilos só para links/botões necessários. | ✅ |

---

## Resumo

- **Fase A:** 11/11 ✅  
- **Fase B:** 4/4 ✅  
- **Fase C:** 3/4 ✅ (1 parcial: propósito “novo/persistente/recorrente” não implementado)  
- **Guardrails:** 5/5 ✅  
- **Limites:** 2/2 ✅  
- **Master Prompt:** 3/3 ✅  

**Único item parcial (C2):** Run history mostra melhor/pior/estável e baseline; “novo/persistente/recorrente” exigiria comparação explícita de conjuntos de issues entre runs (não implementado; aceitável como evolução futura).

---

*Checklist gerado para verificação objetiva. Revisar com o documento oficial e o código antes de dar por concluído.*
