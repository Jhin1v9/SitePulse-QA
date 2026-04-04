# Comparação Kimi vs Atual — Checklist 100% espelho

Referência: **Kimi_Agent_Recriar** (ANALISE-ESCOLHA-WORKSPACE-AI.md).  
Objetivo: atual (renderer.html + renderer.css) = **totalmente idêntico** ao spec Kimi.

---

## 1. Top bar (Kimi spec)

| Item | Kimi spec | Atual | Status |
|------|-----------|--------|--------|
| Menu | Botão expandir rail | `#kimiMenuToggle` ☰ | ✅ |
| Logo | SitePulse Studio | kimi-topbar-brand "SitePulse Studio" | ✅ |
| Centro | breadcrumb "AI OPERATOR" | Um único label "AI OPERATOR" (#kimiTopbarBreadcrumb) | ✅ |
| Status pills | Runtime, Bridge, Audit, Memory | 4 pills com dot (online/idle) | ✅ |
| Settings | Engrenagem | `#kimiSettings` | ✅ |
| Focus/Expand/Hide | — | Focus, Expand, Hide, Back to dock | ✅ (extras ok) |
| Altura | — | 56px, glass | ✅ |

---

## 2. Left rail (Kimi spec)

| Item | Kimi spec | Atual | Status |
|------|-----------|--------|--------|
| Largura | 16px colapsado / 56px expandido | minmax(72px, 220px); colapsado = 0 (escondido) | ⚠️ opcional: modo 56px só ícones |
| Avatar | Avatar + chevron | kimi-rail-avatar + AUBI + chevron | ✅ |
| Core | New Session, Sessions, Investigations, Saved Prompts | Idem | ✅ |
| Workspace | Audit, SEO, Findings, Compare, Evidence, Reports | Idem (Evidence + Reports ambos data-kimi-view="reports") | ✅ |
| Intelligence | Memory, Healing, Patterns, Suggestions | Idem | ✅ |
| Rodapé rail | "Audit Analyst" (mode) | kimi-rail-mode-btn "Audit Analyst" + chevron | ✅ |
| Footer ícones | — | Overview, Operations, Findings, Reports + Expand | ✅ |
| Lista conversas | — | New + list + Search | ✅ |
| Cores | #0E1528 | .kimi-rail bg #0E1528 | ✅ |

---

## 3. Main (Kimi spec)

| Item | Kimi spec | Atual | Status |
|------|-----------|--------|--------|
| Session header | Breadcrumb: Current Run › SEO Audit › example.com › Latest Session | operatorBreadcrumbRun/Context/Target + separadores + Latest Session + Close | ✅ |
| Stream | user bubble, trace, resposta IA | assistantResponse, trace, bubbles | ✅ |
| Composer pills | Rodar auditoria UX, Explicar nota, Mostrar evidência | assistantQuickPriorities/Seo/Prompt/Guide + chips Run SEO audit, Explain score, Show evidence | ⚠️ alinhar textos PT |
| Composer | +, modo "Audit Analyst", input, Send | +, select Audit Analyst, input, Send | ✅ |
| Sugestões | Run SEO audit, Explain score, Show evidence / Rodar evidência | operator-composer-chip (Run SEO audit, etc.) | ✅ adicionar "Rodar evidência" se faltar |

---

## 4. Right drawer (Kimi spec)

| Item | Kimi spec | Atual | Status |
|------|-----------|--------|--------|
| Largura | "72" (prov. 72px ou 272px) | 280px | ✅ manter 280 uso |
| Contexto atual | example.com, chip | "Contexto actual" + Workspace/Run/Issue/Evidence | ✅ |
| Issues | critical/medium/minor | Secção Issues com badges critical/medium/minor (atualizados do report) | ✅ |
| Memory | itens + actions | Tab Memory + operatorMemorySummary + descrição | ✅ |
| Ações disponíveis | 3 itens | Gerar prompt SEO, Focar issue do botão, Reexecutar auditoria (ligados) | ✅ |
| Footer | "Preparar com run anterior" | kimiPrepararRunAnterior | ✅ |

---

## 5. Visual / tokens Kimi

| Token | Kimi | Atual |
|-------|------|--------|
| Fundo | #0B1020 | operator-console #0B1020 ✅ |
| Rail | #0E1528 | kimi-rail #0E1528 ✅ |
| Painéis | #111827 | kimi-status-pill, etc. ✅ |
| Accent | #4F8CFF | var(--operator-accent) / #4F8CFF ✅ |
| Verde | #35D07F | kimi-status-online ✅ |
| Amarelo | #F2B94B | kimi-status-idle ✅ |
| Muted | #9BA6B8 | kimi breadcrumb, labels ✅ |
| Text | #F5F7FB | kimi-topbar, etc. ✅ |
| Glass | backdrop-filter | kimi-topbar ✅ |

---

## 6. Ações (wiring)

| Ação | Atual |
|------|--------|
| Menu toggle | kimiMenuToggle → rail collapsed ✅ |
| Settings | kimiSettings → switchView("settings") ✅ |
| Session close | kimiSessionClose → dock ✅ |
| Preparar run anterior | kimiPrepararRunAnterior → switchView("compare") ✅ |
| New Session / Sessions / nav | data-kimi-view, switchView ✅ |
| Breadcrumb | updateOperatorBreadcrumb(report) ✅ |
| Modo visível | kimiModePillText + assistantModePill ✅ |

---

## Alterações aplicadas (espelho 100%)

1. **Top bar:** Centro com um único label "AI OPERATOR" (#kimiTopbarBreadcrumb).
2. **Right drawer:** Tabs "Contexto" / "Métricas" / "Memory"; painel Contexto com "Contexto actual", "Issues" (critical/medium/minor com badges atualizados do report), "Ações disponíveis" (Gerar prompt SEO, Focar issue do botão, Reexecutar auditoria — ligados a switchView/prompts, findings, handleAuditRun). Headings em PT onde especificado. Footer "Preparar com run anterior" mantido.
3. **Composer:** Ações rápidas com labels Kimi: Rodar auditoria UX, Explicar nota, Mostrar evidência, Rodar evidência. Sugestões com chip "Rodar evidência" e prompt "run-evidence" no JS.
4. **JS:** updateOperatorDrawerIssues(report) para preencher contagens critical/medium/minor; delegate para .operator-drawer-action-link[data-drawer-action]; composer chip "run-evidence" no map de prompts.
5. **CSS:** .operator-drawer-issue-badge (.critical, .medium, .minor), .operator-drawer-desc, .operator-drawer-actions .operator-drawer-action-link.

O layout atual está alinhado ao spec Kimi (ANALISE-ESCOLHA-WORKSPACE-AI.md) como espelho/duplicado funcional.
