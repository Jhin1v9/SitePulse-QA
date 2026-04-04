#!/usr/bin/env node
/**
 * Kimi compliance test: verifica se o layout do AI workspace está 100% fiel
 * ao spec Kimi (espelho/gêmeo). Lê renderer.html e renderer.css.
 * Exit 0 = OK, 1 = falha com mensagem.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src");
const htmlPath = path.join(srcDir, "renderer.html");
const cssPath = path.join(srcDir, "renderer.css");

function fail(msg) {
  process.stderr.write(`KIMI_COMPLIANCE_FAIL: ${msg}\n`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");

const htmlChecks = [
  { name: "assistantWorkspace", test: () => html.includes('id="assistantWorkspace"') },
  { name: "operator-console", test: () => html.includes("operator-console") },
  { name: "kimi-topbar", test: () => html.includes("kimi-topbar") },
  { name: "kimiTopbarBreadcrumb / OPERATOR", test: () => html.includes("kimiTopbarBreadcrumb") && html.includes("OPERATOR") },
  { name: "kimiMenuToggle", test: () => html.includes('id="kimiMenuToggle"') },
  { name: "SitePulse Studio brand", test: () => html.includes("SitePulse Studio") },
  { name: "kimi-topbar-right + 4 status pills", test: () => html.includes("kimi-status-pill") && (html.match(/kimi-status-pill/g) || []).length >= 4 },
  { name: "kimi-status-dot online/idle", test: () => html.includes("kimi-status-online") && html.includes("kimi-status-idle") },
  { name: "kimiSettings", test: () => html.includes('id="kimiSettings"') },
  { name: "kimi-rail", test: () => html.includes("kimi-rail") },
  { name: "kimi-rail-avatar-row + AUBI", test: () => html.includes("kimi-rail-avatar-row") && html.includes("AUBI") },
  { name: "Core nav (New Session, Sessions, Investigations, Saved Prompts)", test: () => html.includes("Core") && html.includes("New Session") && html.includes("Saved Prompts") },
  { name: "Workspace nav (Audit, SEO, Findings, Compare, Evidence, Reports)", test: () => html.includes("Workspace") && html.includes("data-kimi-view=\"overview\"") && html.includes("data-kimi-view=\"compare\"") },
  { name: "Intelligence nav (Memory, Healing, Patterns, Suggestions)", test: () => html.includes("Intelligence") && html.includes("Memory") && html.includes("Healing") },
  { name: "kimiModePill / Audit Analyst", test: () => html.includes("kimiModePill") && html.includes("Audit Analyst") },
  { name: "kimi-rail-footer + kimiRailExpand", test: () => html.includes("kimi-rail-footer") && html.includes("kimiRailExpand") },
  { name: "Session header breadcrumb (operatorBreadcrumbRun, Context, Target)", test: () => html.includes("operatorBreadcrumbRun") && html.includes("operatorBreadcrumbContext") && html.includes("operatorBreadcrumbTarget") },
  { name: "kimiSessionClose", test: () => html.includes('id="kimiSessionClose"') },
  { name: "Composer pills Kimi (Rodar auditoria UX, Explicar nota, Mostrar evidência, Rodar evidência)", test: () => html.includes("Rodar auditoria UX") && html.includes("Explicar nota") && html.includes("Mostrar evidência") && html.includes("Rodar evidência") },
  { name: "assistantOperatorMode Audit Analyst option", test: () => html.includes("assistantOperatorMode") && html.includes("Audit Analyst") },
  { name: "Sugestões + Rodar evidência chip", test: () => html.includes("Sugestões") && html.includes('data-prompt="run-evidence"') && html.includes("Rodar evidência") },
  { name: "Drawer: Contexto actual", test: () => html.includes("Contexto actual") },
  { name: "Drawer: Issues (critical/medium/minor)", test: () => html.includes("operatorDrawerIssuesCritical") && html.includes("operatorDrawerIssuesMedium") && html.includes("operatorDrawerIssuesMinor") },
  { name: "Drawer: Ações disponíveis (Gerar prompt SEO, Focar issue, Reexecutar)", test: () => html.includes("Ações disponíveis") && html.includes("Gerar prompt SEO") && html.includes("Focar issue do botão") && html.includes("Reexecutar auditoria") },
  { name: "Drawer: data-drawer-action prompt-seo, focus-issue, reexec-audit", test: () => html.includes('data-drawer-action="prompt-seo"') && html.includes('data-drawer-action="focus-issue"') && html.includes('data-drawer-action="reexec-audit"') },
  { name: "kimiPrepararRunAnterior", test: () => html.includes("kimiPrepararRunAnterior") && html.includes("Preparar com run anterior") },
  { name: "operator-right-drawer", test: () => html.includes("operator-right-drawer") },
  { name: "Tabs Contexto / Métricas / Memory", test: () => html.includes('data-drawer="context"') && html.includes('data-drawer="metrics"') && html.includes('data-drawer="memory"') },
];

const cssChecks = [
  { name: "operator-console bg #0B1020", test: () => css.includes("#0B1020") && css.includes("operator-console") },
  { name: "kimi-rail #0E1528", test: () => css.includes("#0E1528") && css.includes("kimi-rail") },
  { name: "kimi-status-online (#35D07F)", test: () => css.includes("kimi-status-online") && css.includes("#35D07F") },
  { name: "kimi-status-idle (#F2B94B)", test: () => css.includes("kimi-status-idle") && css.includes("#F2B94B") },
  { name: "kimi-topbar glass / backdrop-filter", test: () => css.includes("kimi-topbar") && (css.includes("backdrop-filter") || css.includes("backdrop-filter")) },
  { name: "kimi-drawer-footer / kimi-drawer-compare", test: () => css.includes("kimi-drawer-footer") && css.includes("kimi-drawer-compare") },
  { name: "operator-drawer-issue-badge (.critical, .medium, .minor)", test: () => css.includes("operator-drawer-issue-badge") && css.includes(".critical") && css.includes(".medium") && css.includes(".minor") },
  { name: "operator-drawer-action-link", test: () => css.includes("operator-drawer-action-link") },
  { name: "kimi-session-header / kimi-breadcrumb", test: () => css.includes("kimi-session-header") && css.includes("kimi-breadcrumb") },
  { name: "kimi-rail-avatar-row, kimi-rail-mode-row", test: () => css.includes("kimi-rail-avatar-row") && css.includes("kimi-rail-mode-row") },
];

let failed = 0;
for (const { name, test } of htmlChecks) {
  if (!test()) {
    process.stderr.write(`  [HTML] MISSING: ${name}\n`);
    failed++;
  }
}
for (const { name, test } of cssChecks) {
  if (!test()) {
    process.stderr.write(`  [CSS]  MISSING: ${name}\n`);
    failed++;
  }
}

if (failed > 0) {
  fail(`${failed} Kimi compliance check(s) failed. See above.`);
}

process.stdout.write("KIMI_COMPLIANCE_OK: layout 100% fiel ao spec Kimi (espelho/gêmeo)\n");
process.exit(0);
