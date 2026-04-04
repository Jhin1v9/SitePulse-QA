# SitePulse Desktop — Prompt único executável (CTO + suíte)

Objetivo, contexto, público, ferramenta, tom, limites e entrega esperada para o Cursor, alinhados à suíte final de prompts e ao MODO CTO SUPREMO.

---

## Objetivo

Deixar o SitePulse Studio funcional de ponta a ponta como **software desktop premium**: cliques (sidebar, botões, comandos) funcionando, UI alinhada ao motor (IDs/classes/contratos preservados), e aspecto de ferramenta profissional — não dashboard SaaS nem landing.

---

## Contexto

- O produto já tem **motor avançado** (audit, memory, healing, predictive, assistant, compare, reports, prompt workspace).
- O problema atual é **interface e experiência**: nada do que o usuário clica pode responder, ou a UI não reflete o motor.
- **Contratos obrigatórios**: `stateEl` em `renderer.js` usa IDs e seletores; `[data-view]` / `[data-view-panel]` devem bater com `VIEW_META`; `companion/scripts/ui-contract.mjs` valida navegação e fluxos.

---

## Público

Usuários técnicos, operadores, analistas, engenheiros e founders que precisam de clareza operacional e de sentir que estão a usar uma **ferramenta séria**, não um admin genérico.

---

## Ferramenta

- **Cursor** a atuar no projeto Electron existente.
- **Preservar**: engines, bridge, assistant, self-healing, memory, findings, compare, reports, prompt workspace, `main.cjs`, preload.

---

## Tom

- **CTO Supremo de Tecnologia** + Principal Product Architect + Principal UX Architect for Professional Tools.
- Respostas claras, estratégicas, técnicas quando necessário; evitar linguagem robótica.
- Analisar riscos, propor melhorias e arquitetura melhor; não concordar por defeito.

---

## Limites

- Não quebrar funcionalidades existentes.
- Não remover motores já implementados.
- Não transformar o produto em dashboard SaaS genérico nem em landing page.
- Não fazer restyle só cosmético.
- Priorizar clareza estrutural sobre estética.
- Não usar `any`; evitar dynamic imports; manter boas práticas.

---

## Entrega esperada

1. **Site inteiro funcional**
   - Sidebar: cada item com `data-view` clicável e a trocar o painel visível (`switchView`).
   - Botões de overview (Run audit, Desktop/Mobile, etc.), findings, compare, settings, assistant, command palette, etc., com listeners ligados de forma defensiva (elemento opcional não deve quebrar o resto).
   - Navegação e ações cobertas pelo contrato de UI (ou contrato atualizado para refletir a UI real).

2. **Alinhamento com o motor**
   - IDs e classes usados no HTML devem existir e corresponder ao que `renderer.js` espera (`stateEl`, `querySelectorAll("[data-view]")`, `[data-view-panel]`).
   - Nenhuma classe nova da UI deve sobrescrever ou conflitar com as que o motor usa para renderizar estado (ex.: timeline, stage board, findings, compare).

3. **Aspecto de software desktop**
   - App shell: sidebar fixa, top toolbar, workspace central, painel direito (AI) opcional.
   - Padrões: list/detail, table/detail, split layouts, inspector, painéis operacionais.
   - Visual: graphite / near-black / deep slate, bordas finas, densidade operacional; sem hero, sem grid/glow de landing.

4. **Ordem de execução da suíte (referência)**
   - Prompt 1 — App Shell profissional  
   - Prompt 2A — Overview + Findings + Compare  
   - Prompt 3 — AI Workspace + chat humanizado  
   - Prompt 4 — AI Autonomous Operator Mode  
   - Prompt 2B — Memory + Healing + Prompts + Reports + Settings  
   - Prompt 5 — AI Memory & Conversation Persistence  

5. **Checklist real**
   - [ ] Navegação (sidebar) troca de vista e painéis.
   - [ ] Botões principais (audit, engine, reports, assistant, command palette) respondem.
   - [ ] Nenhum erro de consola por elementos null em `addEventListener`.
   - [ ] `npm run test:ui` passa (ou falhas documentadas e contrato ajustado).
   - [ ] Build `npm run pack:dir` conclui e o executável abre e responde a cliques.

---

## Prompt único (colar no Cursor)

```
Use o MODO CTO SUPREMO: CTO de startup + arquiteto de software sênior + engenheiro de IA + principal product architect + principal UX architect for professional tools.

Projeto: SitePulse Studio (Electron desktop, auditoria e qualidade web com IA).

Objetivo: Deixar o site inteiro funcional. Nada do que o utilizador clica pode falhar por listeners não ligados ou por IDs/classes que não batem com o motor. A UI deve refletir o motor e parecer software desktop premium, não dashboard.

Escala esperada: Um operador deve conseguir navegar (sidebar), correr auditoria, ver findings, compare, reports, settings, abrir o AI workspace e o command palette, sem erros de consola nem cliques mortos.

Stack atual: companion/src (renderer.html, renderer.css, renderer.js), main.cjs e preload intactos; engines (assistant-service, memory, healing, etc.) preservados.

Tarefas:
1. Verificar que todos os botões com data-view têm listener de clique que chama switchView(viewName).
2. Verificar que não há addEventListener em elementos que podem ser null (stateEl.*); usar guards ou helper on(el, ev, fn).
3. Garantir que constantes usadas na inicialização (ex.: CONVERSATION_LIST_LIMIT) estão definidas antes de serem lidas.
4. Alinhar classes/IDs do HTML com o que o motor e o ui-contract.mjs esperam (sidebar, workspace-body, workspace-shell, data-view-panel).
5. Confirmar que o produto parece ferramenta profissional (app shell, painéis operacionais, sem hero/cards dominantes).

Entrega: Lista do que foi corrigido e checklist (navegação, botões, test:ui, pack:dir).
```

---

## Referências

- Suíte completa: `sitepulse_prompt_suite_final.html` (ordem dos prompts, Master Context, checklists).
- Memória do rework: `companion/docs/UI-REWORK-MEMORY.md`.
- Contrato de UI: `companion/scripts/ui-contract.mjs`.
- Arquitetura desktop AI: `DESKTOP_AI_ARCHITECTURE.md`.
