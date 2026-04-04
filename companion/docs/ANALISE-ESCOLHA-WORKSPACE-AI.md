# Análise: escolha do workspace AI (sitepulse_prompt_suite_final vs Kimi_Agent_Recriar)

## Objetivo
Escolher **uma** das duas referências para implementar no SitePulse como novo visual do AI Operator, em **tela cheia**, com **todos os botões ligados** às ações reais e **100% funcional**.

---

## 1. sitepulse_prompt_suite_final.html

**O que é:** Um único arquivo HTML estático com ~650 linhas de CSS embutido. Mockup visual completo.

**Estrutura:**
- **Topbar:** brand "SitePulse Studio", menu ☰, centro "AI OPERATOR", status pills (Runtime online, Bridge connected, Audit idle, Memory synced), engrenagem.
- **Sidebar (286px):** avatar, profile "AUBT", nav Core (New Session, Sessions, Investigations, Saved Prompts), nav Workspace (Audit, SEO, Findings, Compare, Evidence, Reports, Memory, Healing, Patterns, Suggestions), mode pill "Audit Analyst + Operator", footer icons.
- **Main:** breadcrumbs (Current Run › SEO Audit › example.com › Latest Session), conversation card com user bubble, trace list (6 itens), result card (headline + 3 metric cards SEO/Performance/UX + grid pontos positivos/problemas + evidence-mini com thumb), composer (＋, 👤, mode "Audit Analyst", input, Send, action pills: Rodar auditoria UX, Explicar nota, Mostrar evidência, Rodar evidência).
- **Rightbar (334px):** Contexto atual (domain, chips, incidences), Issues (Critest/Mostam/Minor), Memory (textos + tags), Ações disponíveis (Gerar prompt SEO, Focar issue do botão, Reexecutar auditoria), footer "Preparar com run anterior".

**Visual:** Gradientes escuros, bordas 24–28px, glass, sombras fortes, paleta #060b14 / #0a1020 / #4F8CFF / #35D07F etc. Muito polido, “Apple + Linear”.

**Prós:**
- Zero dependências; cola direto no `renderer.html` + `renderer.css`.
- Integração imediata com o JS atual: só mapear IDs/classes e eventos.
- Nenhuma mudança de stack (continua tudo vanilla no Electron).

**Contras:**
- Não é React; é só referência visual. Você prefere Kimi.

---

## 2. Kimi_Agent_Recriar (pasta app)

**O que é:** App React + TypeScript + Vite + Tailwind + Lucide. Um único `App.tsx` (~430 linhas) com todo o layout do AI Operator.

**Estrutura (igual em ideia ao HTML, com pequenas diferenças):**
- **Top bar:** Menu (expandir rail), logo SitePulse Studio, breadcrumb "AI OPERATOR", status pills, Settings.
- **Left rail:** Largura 16px (colapsado) ou 56 (expandido). Avatar, Core (New Session, Sessions, Investigations, Saved Prompts), Workspace (Audit, SEO, Findings, Compare, Evidence, Reports), Intelligence (Memory, Healing, Patterns, Suggestions), rodapé "Audit Analyst".
- **Main:** Session header (breadcrumb Current Run › SEO Audit › example.com › Latest Session), stream: user bubble, trace (6 linhas), resposta IA (headline, 3 metric cards + delta, pontos positivos, principais problemas, evidence card com thumbnail mock), composer: pills (Rodar auditoria UX, Explicar nota, Mostrar evidência), input + Plus/Paperclip, modo "Audit Analyst", sugestões (Run SEO audit, Explain score, Show evidence), "Rodar evidência", Send.
- **Right drawer (72):** Contexto atual (example.com, chip, Tdlendee), Issues (critical/medium/minor), Memory (itens + actions), Ações disponíveis (3 itens), "Preparar com run anterior".

**Visual:** Tailwind com tokens #0B1020, #0E1528, #111827, #4F8CFF, #35D07F, etc. Classes `.glass`, `.custom-scrollbar`, ícones Lucide. Mesma direção “futurista/tecnológico” do HTML.

**Prós:**
- É a sua **preferência**.
- Layout já componentizado (estado do rail, lista de trace, metric cards, evidence card).
- Fácil de manter e evoluir em React, se o projeto migrar para React no futuro.

**Contras:**
- Companion hoje é **100% vanilla** (sem React). Incluir Kimi “tal qual” = adicionar React + Vite ao Electron (nova build, dependências, ponte estado/relatório/assistant).
- Alternativa: **não** usar React e **reproduzir o visual e a estrutura do Kimi em HTML + CSS** dentro do SitePulse atual, ligando tudo ao `renderer.js`. Aí você fica com o “código Kimi” como referência, mas a implementação é vanilla.

---

## 3. Comparação direta

| Critério | sitepulse_prompt_suite_final.html | Kimi_Agent_Recriar (app) |
|----------|-----------------------------------|---------------------------|
| **Stack** | HTML + CSS puro | React + TS + Vite + Tailwind |
| **Integração no SitePulse** | Trivial (copiar HTML/CSS + IDs) | Ou portar para HTML/CSS ou integrar React no Electron |
| **Visual** | Muito bom, consistente com spec | Muito bom, mesmo espírito |
| **Left rail expansível** | Não (sidebar fixa) | Sim (16px ↔ 56px) |
| **Ícones** | Emoji/símbolos (✦, ◫, ⌁) | Lucide (Eye, BarChart3, Send…) |
| **Seu gosto** | — | **Preferido** |

---

## 4. Recomendações (Passo 1 – escolher junto)

### Opção A – Kimi como referência, implementação **vanilla** no SitePulse (recomendado)
- **Escolha:** Kimi (layout + comportamento + estilo).
- **Implementação:** Não usar React no companion. Traduzir o **layout e o visual** do Kimi (e do HTML do prompt_suite onde fizer sentido) para **HTML + CSS** no `renderer.html` / `renderer.css`.
- **Comportamento:**
  - Abrir o AI em **tela cheia** (esconder sidebar principal e conteúdo; só mostrar o frame do AI Operator com top bar + left rail + main + right drawer).
  - Todos os botões e links ligados às funções existentes: New Session, Sessions, Audit, SEO, Findings, Compare, Evidence, Reports, Memory, Healing, etc. → `switchView(...)` e listas; Send → `runAssistantQuery`; pills → prompts e ações; drawer → contexto/métricas/memória reais.
- **Vantagem:** Você fica com o “Kimi” na prática (visual e fluxo), sem mudar a stack do SitePulse. Menos risco e menos trabalho que introduzir React.

### Opção B – Kimi em React dentro do Electron
- **Escolha:** Kimi.
- **Implementação:** Adicionar React (e build Vite ou similar) ao processo renderer do Electron; carregar o `App` do Kimi (ou uma versão adaptada) quando o usuário abrir o AI; expor relatório, assistant, navegação via `window` ou contexto.
- **Vantagem:** Código Kimi “original” rodando dentro do app.
- **Desvantagem:** Mais trabalho (build, preload, ponte de estado), mais dependências e dois “mundos” (vanilla + React) no mesmo app.

### Opção C – sitepulse_prompt_suite_final.html
- **Escolha:** O HTML estático.
- **Implementação:** Substituir o bloco do AI workspace no `renderer.html` pelo conteúdo do `sitepulse_prompt_suite_final.html` (ajustando IDs/classes para o JS atual), copiar os estilos para `renderer.css`, ligar todos os botões.
- **Vantagem:** Rápido, zero React, visual já muito bom.
- **Desvantagem:** Não é o Kimi que você preferiu; rail não é expansível como no Kimi.

---

## 5. Decisão sugerida (Passo 1)

- **Escolher:** **Kimi** (como referência de layout, fluxo e estilo).
- **Implementar como:** **Opção A** – mesmo visual e estrutura do Kimi em **HTML + CSS** no SitePulse, com **tela cheia** ao abrir o AI e **todos os botões ligados** às ações reais.

Assim você tem “exatamente” a ideia e o visual do Kimi, com o SitePulse funcionando de verdade, sem introduzir React no projeto.

Se confirmar essa escolha, o **Passo 2** é: colocar esse layout a rodar no SitePulse (substituir/encaixar o markup do AI workspace, estilos, e wiring completo dos botões + modo tela cheia).
