"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Severity = "high" | "medium" | "low";
type SeverityFilter = Severity | "all";
type AuditScope = "full" | "seo" | "experience";

type AssistantHint = {
  priority?: "P0" | "P1" | "P2";
  firstChecks?: string[];
  commandHints?: string[];
  likelyAreas?: string[];
};

type IssueModel = {
  id: string;
  code: string;
  severity: Severity;
  route: string;
  action: string;
  detail: string;
  recommendedResolution: string;
  laymanExplanation: string;
  technicalExplanation: string;
  recommendedPrompt: string;
  assistantHint: AssistantHint;
  group: string;
};

type ActionSweepModel = {
  id: string;
  route: string;
  label: string;
  kind: string;
  href: string;
  expectedFunction: string;
  expectedForUser: string;
  actualFunction: string;
  status: string;
  statusLabel: string;
  detail: string;
};

type SeoIssueModel = {
  code: string;
  severity: Severity;
  detail: string;
  recommendation: string;
  count: number;
  affectedRoutes: string[];
};

type SeoModel = {
  overallScore: number;
  pagesAnalyzed: number;
  categoryScore: {
    technical: number;
    content: number;
    accessibility: number;
  };
  issues: SeoIssueModel[];
  topRecommendations: string[];
  checklist: {
    id: string;
    label: string;
    why: string;
    status: "ok" | "missing";
    recommendation: string;
  }[];
  fixPrompt: string;
};

type ReportModel = {
  meta: {
    project: string;
    baseUrl: string;
    generatedAt: string;
    auditScope: AuditScope;
  };
  summary: {
    routesChecked: number;
    buttonsChecked: number;
    totalIssues: number;
    visualSectionOrderInvalid: number;
    buttonsNoEffect: number;
    consoleErrors: number;
    actionsMapped: number;
    actionsWithEffect: number;
    actionsNoEffectDetected: number;
    actionsFailed: number;
    actionsAnalysisOnly: number;
    seoScore: number;
    seoPagesAnalyzed: number;
    seoCriticalIssues: number;
  };
  assistantGuide: {
    replayCommand: string;
    immediateSteps: string[];
    quickStartPrompt: string;
  };
  actionSweep: ActionSweepModel[];
  seo: SeoModel;
  issues: IssueModel[];
};

const REPORT_FALLBACK_URL = "https://your-site.com";
const LAST_REPORT_STORAGE_KEY = "sitepulse:last-report-v1";

const ISSUE_GROUP: Record<string, string> = {
  ROUTE_LOAD_FAIL: "Pagina nao abriu",
  BTN_CLICK_ERROR: "Botao com erro",
  BTN_NO_EFFECT: "Botao sem reacao",
  HTTP_4XX: "Erro de requisicao (4xx)",
  HTTP_5XX: "Erro do servidor (5xx)",
  NET_REQUEST_FAILED: "Falha de rede",
  JS_RUNTIME_ERROR: "Erro de JavaScript",
  CONSOLE_ERROR: "Erro no console",
  VISUAL_SECTION_ORDER_INVALID: "Ordem visual errada",
  VISUAL_SECTION_MISSING: "Secao ausente",
  AUDIT_ENGINE_UNAVAILABLE: "Ambiente de auditoria parcial",
};

function nowIso() {
  return new Date().toISOString();
}

function parseSeverity(value: unknown, fallbackCode = ""): Severity {
  if (value === "high" || value === "medium" || value === "low") return value;
  if (fallbackCode === "HTTP_5XX" || fallbackCode === "JS_RUNTIME_ERROR" || fallbackCode === "VISUAL_SECTION_ORDER_INVALID") {
    return "high";
  }
  if (fallbackCode === "HTTP_4XX" || fallbackCode === "BTN_CLICK_ERROR" || fallbackCode === "NET_REQUEST_FAILED") {
    return "medium";
  }
  return "low";
}

function normalizeAuditScope(value: unknown): AuditScope {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "seo") return "seo";
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) return "experience";
  return "full";
}

function auditScopeLabel(scope: AuditScope) {
  if (scope === "seo") return "so SEO";
  if (scope === "experience") return "so site";
  return "completo";
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function scoreFromIssues(issues: IssueModel[]): number {
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;
  return Math.min(100, high * 34 + medium * 14 + low * 6);
}

function normalizeIssue(raw: unknown, index: number): IssueModel {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const code = String(item.code ?? "UNKNOWN");
  const severity = parseSeverity(item.severity, code);
  const route = String(item.route ?? "/");
  const action = String(item.action ?? "");
  const detail = String(item.detail ?? "Sem detalhe.");
  const recommendedResolution = String(item.recommendedResolution ?? "Revisar logs e causa raiz.");
  const laymanExplanation = String(item.laymanExplanation ?? "");
  const technicalExplanation = String(item.technicalExplanation ?? "");
  const recommendedPrompt = String(item.recommendedPrompt ?? "");
  const hintObj = item.assistantHint && typeof item.assistantHint === "object"
    ? (item.assistantHint as Record<string, unknown>)
    : {};
  const assistantHint: AssistantHint = {
    priority:
      hintObj.priority === "P0" || hintObj.priority === "P1" || hintObj.priority === "P2"
        ? hintObj.priority
        : severity === "high"
        ? "P0"
        : severity === "medium"
        ? "P1"
        : "P2",
    firstChecks: Array.isArray(hintObj.firstChecks) ? hintObj.firstChecks.map((v) => String(v)) : [],
    commandHints: Array.isArray(hintObj.commandHints) ? hintObj.commandHints.map((v) => String(v)) : [],
    likelyAreas: Array.isArray(hintObj.likelyAreas) ? hintObj.likelyAreas.map((v) => String(v)) : [],
  };
  return {
    id: String(item.id ?? `issue-${index + 1}`),
    code,
    severity,
    route,
    action,
    detail,
    recommendedResolution,
    laymanExplanation,
    technicalExplanation,
    recommendedPrompt,
    assistantHint,
    group: ISSUE_GROUP[code] ?? "Outro",
  };
}

function normalizeReport(raw: unknown): ReportModel {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const metaObj = source.meta && typeof source.meta === "object" ? (source.meta as Record<string, unknown>) : {};
  const summaryObj = source.summary && typeof source.summary === "object" ? (source.summary as Record<string, unknown>) : {};
  const guideObj =
    source.assistantGuide && typeof source.assistantGuide === "object"
      ? (source.assistantGuide as Record<string, unknown>)
      : source.promptPack && typeof source.promptPack === "object"
      ? (source.promptPack as Record<string, unknown>)
      : {};
  const actionSweepRaw = Array.isArray(source.actionSweep) ? source.actionSweep : [];
  const seoObj = source.seo && typeof source.seo === "object" ? (source.seo as Record<string, unknown>) : {};
  const seoCategoryObj =
    seoObj.categoryScore && typeof seoObj.categoryScore === "object"
      ? (seoObj.categoryScore as Record<string, unknown>)
      : {};
  const seoIssuesRaw = Array.isArray(seoObj.issues) ? seoObj.issues : [];
  const topRecommendationsRaw = Array.isArray(seoObj.topRecommendations) ? seoObj.topRecommendations : [];
  const seoChecklistRaw = Array.isArray(seoObj.checklist) ? seoObj.checklist : [];

  const issuesRaw = Array.isArray(source.issues) ? source.issues : [];
  const issues = issuesRaw.map((issue, index) => normalizeIssue(issue, index));
  const bySeverityWeight = { high: 0, medium: 1, low: 2 } as const;
  issues.sort((a, b) => {
    const severityCmp = bySeverityWeight[a.severity] - bySeverityWeight[b.severity];
    if (severityCmp !== 0) return severityCmp;
    return a.code.localeCompare(b.code);
  });

  const actionSweep = actionSweepRaw.map((item, index) => {
    const rawItem = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      id: String(rawItem.id ?? `action-${index + 1}`),
      route: String(rawItem.route ?? "/"),
      label: String(rawItem.label ?? "acao sem nome"),
      kind: String(rawItem.kind ?? "button"),
      href: String(rawItem.href ?? ""),
      expectedFunction: String(rawItem.expectedFunction ?? "Executar acao esperada do elemento."),
      expectedForUser: String(rawItem.expectedForUser ?? "Deve entregar resposta clara para o usuario."),
      actualFunction: String(rawItem.actualFunction ?? "Sem resultado registrado."),
      status: String(rawItem.status ?? "unknown"),
      statusLabel: String(rawItem.statusLabel ?? String(rawItem.status ?? "unknown")),
      detail: String(rawItem.detail ?? ""),
    } as ActionSweepModel;
  });

  const seoIssues = seoIssuesRaw.map((item) => {
    const rawItem = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
    return {
      code: String(rawItem.code ?? "SEO_UNKNOWN"),
      severity: parseSeverity(rawItem.severity, "CONSOLE_ERROR"),
      detail: String(rawItem.detail ?? "Sem detalhe."),
      recommendation: String(rawItem.recommendation ?? "Sem recomendacao."),
      count: toNumber(rawItem.count, 1),
      affectedRoutes: Array.isArray(rawItem.affectedRoutes) ? rawItem.affectedRoutes.map((v) => String(v)) : [],
    } as SeoIssueModel;
  });

  return {
    meta: {
      project: String(metaObj.project ?? "sitepulse-report"),
      baseUrl: String(metaObj.baseUrl ?? source.baseUrl ?? REPORT_FALLBACK_URL),
      generatedAt: String(metaObj.finishedAt ?? metaObj.generatedAt ?? nowIso()),
      auditScope: normalizeAuditScope(metaObj.auditScope ?? summaryObj.auditScope),
    },
    summary: {
      routesChecked: toNumber(summaryObj.routesChecked, 0),
      buttonsChecked: toNumber(summaryObj.buttonsChecked, 0),
      totalIssues: toNumber(summaryObj.totalIssues, issues.length),
      visualSectionOrderInvalid: toNumber(summaryObj.visualSectionOrderInvalid, 0),
      buttonsNoEffect: toNumber(summaryObj.buttonsNoEffect, 0),
      consoleErrors: toNumber(summaryObj.consoleErrors, 0),
      actionsMapped: toNumber(summaryObj.actionsMapped, actionSweep.length),
      actionsWithEffect: toNumber(summaryObj.actionsWithEffect, 0),
      actionsNoEffectDetected: toNumber(summaryObj.actionsNoEffectDetected, 0),
      actionsFailed: toNumber(summaryObj.actionsFailed, 0),
      actionsAnalysisOnly: toNumber(summaryObj.actionsAnalysisOnly, 0),
      seoScore: toNumber(summaryObj.seoScore, toNumber(seoObj.overallScore, 0)),
      seoPagesAnalyzed: toNumber(summaryObj.seoPagesAnalyzed, toNumber(seoObj.pagesAnalyzed, 0)),
      seoCriticalIssues: toNumber(
        summaryObj.seoCriticalIssues,
        seoIssues.filter((item) => item.severity === "high").length,
      ),
    },
    assistantGuide: {
      replayCommand: String(guideObj.replayCommand ?? metaObj.replayCommand ?? "indisponivel"),
      immediateSteps: Array.isArray(guideObj.immediateSteps)
        ? guideObj.immediateSteps.map((v) => String(v))
        : ["Comece por problemas P0/P1.", "Corrija causa raiz.", "Rode novamente para validar."],
      quickStartPrompt: String(guideObj.quickStartPrompt ?? "Sem prompt rapido nesta rodada."),
    },
    actionSweep,
    seo: {
      overallScore: toNumber(seoObj.overallScore, 0),
      pagesAnalyzed: toNumber(seoObj.pagesAnalyzed, 0),
      categoryScore: {
        technical: toNumber(seoCategoryObj.technical, 0),
        content: toNumber(seoCategoryObj.content, 0),
        accessibility: toNumber(seoCategoryObj.accessibility, 0),
      },
      issues: seoIssues,
      topRecommendations: topRecommendationsRaw.map((v) => String(v)),
      checklist: seoChecklistRaw.map((item, index) => {
        const rawItem = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        const status = String(rawItem.status ?? "ok").toLowerCase() === "missing" ? "missing" : "ok";
        return {
          id: String(rawItem.id ?? `seo-check-${index + 1}`),
          label: String(rawItem.label ?? "Checklist SEO"),
          why: String(rawItem.why ?? "Sem explicacao."),
          status,
          recommendation: String(rawItem.recommendation ?? "Sem recomendacao."),
        } as SeoModel["checklist"][number];
      }),
      fixPrompt: String(seoObj.fixPrompt ?? ""),
    },
    issues,
  };
}

function severityLabel(severity: Severity) {
  if (severity === "high") return "alto";
  if (severity === "medium") return "medio";
  return "baixo";
}

function shortText(value: string, maxLen = 180) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen)}...`;
}

function parseFailedRequest(detail: string) {
  const match = String(detail ?? "").match(/^([A-Z]+)\s+(.+?)\s+::\s+(.+)$/);
  if (!match) return null;
  return { method: match[1], requestUrl: match[2], error: match[3] };
}

function parseHttpDetail(detail: string) {
  const match = String(detail ?? "").match(/^(\d{3})\s+([A-Z]+)\s+(.+)$/);
  if (!match) return null;
  return { status: match[1], method: match[2], requestUrl: match[3] };
}

function extractSourceLocation(detail: string) {
  const normalized = String(detail ?? "");
  const stackWithParen = normalized.match(/\(([^()]+):(\d+):(\d+)\)/);
  if (stackWithParen) {
    return {
      file: stackWithParen[1],
      line: Number(stackWithParen[2]),
      column: Number(stackWithParen[3]),
      raw: `${stackWithParen[1]}:${stackWithParen[2]}:${stackWithParen[3]}`,
    };
  }

  const direct = normalized.match(/([A-Za-z0-9_./:-]+):(\d+):(\d+)/);
  if (direct) {
    return {
      file: direct[1],
      line: Number(direct[2]),
      column: Number(direct[3]),
      raw: `${direct[1]}:${direct[2]}:${direct[3]}`,
    };
  }

  return null;
}

function parseWhatsappNumber(detail: string) {
  const match = String(detail ?? "").match(/wa\.me\/(\d+)/i) ?? String(detail ?? "").match(/phone=(\d+)/i);
  if (!match) return "";
  return match[1];
}

function buildDeveloperLineHint(issue: IssueModel) {
  const location = extractSourceLocation(issue.detail);
  const actionLower = issue.action.toLowerCase();

  if (actionLower.includes("whatsapp")) {
    const detectedNumber = parseWhatsappNumber(issue.detail);
    const safeNumber = detectedNumber || "34685093192";
    return {
      location,
      wrongLine: `window.open("https://wa.me/${safeNumber}", "_blank");`,
      correctLine:
        `window.open("https://wa.me/${safeNumber}?text=${encodeURIComponent("Ola, quero informacoes")}", "_blank", "noopener,noreferrer");`,
      why:
        "Para WhatsApp funcionar bem, use link valido com texto inicial e protecao noopener/noreferrer.",
    };
  }

  const requestFail = parseFailedRequest(issue.detail);
  if (issue.code === "NET_REQUEST_FAILED" && requestFail) {
    return {
      location,
      wrongLine: `await fetch("${requestFail.requestUrl}");`,
      correctLine:
        `const response = await fetch("${requestFail.requestUrl}", { cache: "no-store" });\nif (!response.ok) throw new Error(\`HTTP \${response.status}\`);`,
      why:
        "Validar response.ok e tratar erro evita falha silenciosa de rede no frontend.",
    };
  }

  const httpFail = parseHttpDetail(issue.detail);
  if ((issue.code === "HTTP_4XX" || issue.code === "HTTP_5XX") && httpFail) {
    return {
      location,
      wrongLine: `const response = await fetch("${httpFail.requestUrl}"); // sem validar status`,
      correctLine:
        `const response = await fetch("${httpFail.requestUrl}");\nif (!response.ok) { throw new Error(\`Request failed: ${httpFail.status}\`); }`,
      why:
        "Sem checar status HTTP, o fluxo segue quebrado e o usuario fica sem feedback claro.",
    };
  }

  if (issue.code === "BTN_NO_EFFECT") {
    return {
      location,
      wrongLine: `<button onClick={() => {}}>CTA</button>`,
      correctLine:
        `<button onClick={handleCtaClick}>CTA</button>\n// handleCtaClick: navegar, abrir modal ou enviar acao real`,
      why:
        "Um botao precisa executar uma acao real; callback vazio gera clique sem efeito.",
    };
  }

  if (issue.code === "BTN_CLICK_ERROR") {
    return {
      location,
      wrongLine: `onClick={() => executarAcao()}`,
      correctLine:
        `onClick={async () => {\n  try { await executarAcao(); }\n  catch (error) { setUiError("Falha ao executar acao"); }\n}}`,
      why:
        "Try/catch no clique evita quebra do fluxo e mostra retorno para o usuario.",
    };
  }

  if (issue.code === "ROUTE_LOAD_FAIL") {
    return {
      location,
      wrongLine: `const route = "/rota-tal"; // pode estar errada`,
      correctLine:
        `const route = resolveSafeRoute("/rota-tal");\nif (!route) throw new Error("Rota invalida");`,
      why:
        "Validar rota antes de usar evita erro de carregamento por typo ou path inexistente.",
    };
  }

  return {
    location,
    wrongLine: `// linha atual com comportamento incorreto\n${shortText(issue.detail, 120)}`,
    correctLine:
      `// linha sugerida (ajuste manual)\n// 1) tratar erro explicitamente\n// 2) validar status/retorno\n// 3) atualizar UI com feedback ao usuario`,
    why:
      "Ajuste para garantir que a acao tenha resultado claro para usuario e logs para dev.",
  };
}

function explainTarget(issue: IssueModel) {
  const action = issue.action.trim();
  if (!action || action === "route_load") {
    return `a pagina ${issue.route}`;
  }
  return `o botao "${action}"`;
}

function expectedAction(issue: IssueModel) {
  const actionLower = issue.action.toLowerCase();
  const target = explainTarget(issue);

  if (issue.laymanExplanation) {
    return issue.laymanExplanation;
  }

  if (actionLower.includes("whatsapp")) {
    return `Ao clicar em ${target}, deveria abrir o WhatsApp da empresa para a pessoa enviar mensagem sem erro.`;
  }
  if (actionLower.includes("contato") || actionLower.includes("contact")) {
    return `Ao clicar em ${target}, deveria levar para contato e mostrar formas reais de falar com a empresa.`;
  }
  if (actionLower.includes("menu")) {
    return `Ao clicar em ${target}, deveria abrir/fechar o menu para a pessoa navegar no site.`;
  }
  if (actionLower.includes("ver mais") || actionLower.includes("saiba mais")) {
    return `Ao clicar em ${target}, deveria mostrar mais informacoes do servico sem quebrar a pagina.`;
  }

  if (issue.code === "ROUTE_LOAD_FAIL") {
    return `Quando alguem abre ${target}, tudo deveria carregar normalmente para a pessoa usar o site.`;
  }
  if (issue.code === "HTTP_4XX" || issue.code === "HTTP_5XX") {
    return `Quando a pessoa usa ${target}, a requisicao principal deveria retornar sucesso (2xx), nao erro.`;
  }
  if (issue.code === "NET_REQUEST_FAILED") {
    return `Quando a pessoa usa ${target}, o site deveria conseguir se comunicar com o servidor sem queda de rede.`;
  }
  if (issue.code === "BTN_NO_EFFECT") {
    return `Quando a pessoa clica em ${target}, algo deveria acontecer na tela (abrir, navegar, enviar ou confirmar).`;
  }
  if (issue.code === "BTN_CLICK_ERROR") {
    return `Quando a pessoa clica em ${target}, a acao deveria terminar sem travar e sem erro de script.`;
  }
  if (issue.code === "VISUAL_SECTION_ORDER_INVALID") {
    return "As secoes deveriam aparecer na ordem certa para nao confundir quem esta lendo.";
  }
  if (issue.code === "VISUAL_SECTION_MISSING") {
    return "A secao importante deveria estar visivel para a pessoa encontrar a informacao.";
  }
  if (issue.code === "AUDIT_ENGINE_UNAVAILABLE") {
    return "A auditoria completa deveria abrir o navegador automatizado e testar cliques/ordem visual.";
  }
  return `Quando a pessoa usa ${target}, deveria funcionar sem erro.`;
}

function currentAction(issue: IssueModel) {
  const target = explainTarget(issue);
  const requestFail = parseFailedRequest(issue.detail);
  const httpFail = parseHttpDetail(issue.detail);

  if (issue.code === "NET_REQUEST_FAILED" && requestFail) {
    return `Ao usar ${target}, o site tentou ${requestFail.method} em ${requestFail.requestUrl}, mas falhou com "${requestFail.error}".`;
  }
  if ((issue.code === "HTTP_4XX" || issue.code === "HTTP_5XX") && httpFail) {
    return `Ao usar ${target}, o servidor respondeu ${httpFail.status} em ${httpFail.requestUrl}, entao a acao nao concluiu.`;
  }
  if (issue.code === "BTN_NO_EFFECT") {
    return `Ao clicar em ${target}, nada mudou na tela (sem abrir, sem navegar e sem confirmar).`;
  }
  if (issue.code === "BTN_CLICK_ERROR") {
    return `Ao clicar em ${target}, ocorreu falha de clique: ${shortText(issue.detail)}`;
  }
  if (issue.code === "ROUTE_LOAD_FAIL") {
    return `Ao abrir ${target}, a pagina nao carregou como deveria: ${shortText(issue.detail)}`;
  }
  if (issue.code === "CONSOLE_ERROR" || issue.code === "JS_RUNTIME_ERROR") {
    return `Durante ${target}, apareceu erro de codigo no navegador: ${shortText(issue.detail)}`;
  }
  if (issue.code === "AUDIT_ENGINE_UNAVAILABLE") {
    return `Nesta rodada, o ambiente nao conseguiu abrir o navegador de teste e ficou apenas na verificacao parcial.`;
  }
  return shortText(issue.detail || issue.action || "Sem detalhe de execucao.");
}

function actionStatusPill(status: string) {
  if (status === "clicked_effect") return "pill pill-low";
  if (status === "clicked_no_effect") return "pill pill-medium";
  if (status === "click_error") return "pill pill-high";
  if (status === "skipped_not_visible" || status === "skipped_disabled" || status === "skipped_already_active") {
    return "pill pill-medium";
  }
  return "pill";
}

function fallbackSeoChecklistFromIssues(seo: SeoModel) {
  const codeSet = new Set((seo.issues ?? []).map((item) => item.code));
  const rows = [
    {
      id: "title",
      label: "Title unico e com tamanho ideal",
      why: "E o titulo que aparece no Google.",
      missing: codeSet.has("SEO_TITLE_MISSING") || codeSet.has("SEO_TITLE_LENGTH"),
      recommendation: "Defina title unico por pagina (30-65 caracteres).",
    },
    {
      id: "meta_description",
      label: "Meta description clara",
      why: "Explica a pagina no resultado de busca.",
      missing: codeSet.has("SEO_META_DESCRIPTION_MISSING") || codeSet.has("SEO_META_DESCRIPTION_LENGTH"),
      recommendation: "Escreva meta description objetiva (70-170 caracteres).",
    },
    {
      id: "h1",
      label: "Um H1 principal por pagina",
      why: "Organiza o tema principal da pagina.",
      missing: codeSet.has("SEO_H1_MISSING") || codeSet.has("SEO_H1_MULTIPLE"),
      recommendation: "Mantenha um H1 e use H2/H3 para secoes.",
    },
    {
      id: "technical",
      label: "Lang + viewport + canonical",
      why: "Garante indexacao correta e boa experiencia mobile.",
      missing:
        codeSet.has("SEO_LANG_MISSING") ||
        codeSet.has("SEO_VIEWPORT_MISSING") ||
        codeSet.has("SEO_CANONICAL_MISSING"),
      recommendation: "Defina lang, viewport e canonical em todas as paginas indexaveis.",
    },
    {
      id: "indexing",
      label: "Indexacao correta (sem noindex indevido)",
      why: "Paginas importantes precisam poder aparecer no Google.",
      missing: codeSet.has("SEO_NOINDEX"),
      recommendation: "Remova noindex de paginas que devem ranquear.",
    },
    {
      id: "assets",
      label: "Imagens com alt + schema JSON-LD",
      why: "Melhora acessibilidade e rich snippets.",
      missing: codeSet.has("SEO_IMG_ALT_MISSING") || codeSet.has("SEO_STRUCTURED_DATA_MISSING"),
      recommendation: "Adicione alt descritivo e schema (LocalBusiness/Service/FAQ).",
    },
    {
      id: "content_links",
      label: "Conteudo suficiente + links internos",
      why: "Ajuda rastreamento e relevancia semantica.",
      missing: codeSet.has("SEO_CONTENT_THIN") || codeSet.has("SEO_INTERNAL_LINKS_LOW"),
      recommendation: "Expanda conteudo util e crie links internos estrategicos.",
    },
    {
      id: "social",
      label: "Open Graph + Twitter Card",
      why: "Melhora compartilhamento e taxa de clique.",
      missing: codeSet.has("SEO_OPEN_GRAPH_INCOMPLETE") || codeSet.has("SEO_TWITTER_CARD_MISSING"),
      recommendation: "Complete og:title/description/image/type e twitter:card.",
    },
  ];

  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    why: row.why,
    status: row.missing ? "missing" : "ok",
    recommendation: row.recommendation,
  })) as SeoModel["checklist"];
}

function buildSeoPrompt(report: ReportModel) {
  const checklist = report.seo.checklist.length ? report.seo.checklist : fallbackSeoChecklistFromIssues(report.seo);
  const missing = checklist.filter((item) => item.status === "missing");
  const topIssues = report.seo.issues.slice(0, 20);
  if (!missing.length && !topIssues.length) {
    return [
      "Atue como especialista SEO senior.",
      `Site: ${report.meta.baseUrl}`,
      "Nao ha gaps SEO relevantes nesta rodada.",
      "Objetivo: manter baseline e evitar regressao.",
    ].join("\n");
  }

  return [
    "Atue como especialista SEO senior com foco em execucao real, sem fix cosmetico.",
    `Site: ${report.meta.baseUrl}`,
    `Score atual: ${report.seo.overallScore}/100`,
    "",
    "Corrigir itens pendentes do checklist:",
    ...missing.map((item, idx) => `${idx + 1}. ${item.label} | por que importa: ${item.why} | acao: ${item.recommendation}`),
    "",
    "Issues SEO detectadas:",
    ...topIssues.map((item, idx) => `${idx + 1}. [${item.code}] (${item.severity}) ${item.detail} | recomendacao: ${item.recommendation}`),
    "",
    "Entrega obrigatoria:",
    "- implementar ajustes com evidencias por arquivo",
    "- validar novamente e mostrar melhoria de score/checklist",
  ].join("\n");
}

function CopyableCodeBox({
  text,
  label,
}: {
  text: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="code-box mono">{text}</div>
      <div className="btn-row" style={{ marginTop: 8 }}>
        <button type="button" onClick={() => void handleCopy()}>
          {copied ? `${label} copiado` : `Copiar ${label}`}
        </button>
      </div>
    </>
  );
}

function ReportPageContent() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("foco");
  const desktopMode = searchParams.get("desktop") === "1";
  const desktopShellV2 = searchParams.get("shell") === "v2";
  const [report, setReport] = useState<ReportModel | null>(null);
  const [rawText, setRawText] = useState("");
  const [showDev, setShowDev] = useState(false);
  const [showErrorAnalysis, setShowErrorAnalysis] = useState(true);
  const [showSeoAnalysis, setShowSeoAnalysis] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [actionSearch, setActionSearch] = useState("");
  const [actionStatusFilter, setActionStatusFilter] = useState("all");

  useEffect(() => {
    const raw = localStorage.getItem(LAST_REPORT_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const normalized = normalizeReport(parsed);
      setReport(normalized);
      setRawText(JSON.stringify(parsed, null, 2));
    } catch {
      setReport(null);
      setRawText("");
    }
  }, []);

  useEffect(() => {
    if (!focus) return;
    const target = focus === "routes"
      ? "sec-routes"
      : focus === "actions" || focus === "buttons"
      ? "sec-actions"
      : focus === "issues"
      ? "sec-issues"
      : focus === "seo"
      ? "sec-seo"
      : focus === "risk"
      ? "sec-risk"
      : "";
    if (!target) return;
    const element = document.getElementById(target);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focus, report]);

  const score = useMemo(() => scoreFromIssues(report?.issues ?? []), [report]);
  const routesFromIssues = useMemo(() => {
    if (!report) return [];
    return Array.from(new Set(report.issues.map((issue) => issue.route))).sort();
  }, [report]);

  const issuesFiltered = useMemo(() => {
    if (!report) return [];
    if (severityFilter === "all") return report.issues;
    return report.issues.filter((issue) => issue.severity === severityFilter);
  }, [report, severityFilter]);

  const actionFiltered = useMemo(() => {
    if (!report) return [];
    const query = actionSearch.trim().toLowerCase();
    return report.actionSweep.filter((action) => {
      if (actionStatusFilter !== "all" && action.status !== actionStatusFilter) return false;
      if (!query) return true;
      const hay = `${action.route} ${action.label} ${action.expectedFunction} ${action.actualFunction} ${action.statusLabel}`.toLowerCase();
      return hay.includes(query);
    });
  }, [report, actionSearch, actionStatusFilter]);

  const seoChecklist = useMemo(() => {
    if (!report) return [];
    if (report.seo.checklist.length) return report.seo.checklist;
    return fallbackSeoChecklistFromIssues(report.seo);
  }, [report]);

  const seoFixPrompt = useMemo(() => {
    if (!report) return "";
    return report.seo.fixPrompt || buildSeoPrompt(report);
  }, [report]);

  const topTechnicalIssues = useMemo(() => {
    if (!report || !showErrorAnalysis) return [];
    return report.issues.slice(0, 6);
  }, [report, showErrorAnalysis]);

  const topSeoIssues = useMemo(() => {
    if (!report || !showSeoAnalysis) return [];
    return report.seo.issues.slice(0, 6);
  }, [report, showSeoAnalysis]);

  if (!report) {
    return (
      <main className="page-shell">
        <div className="noise" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <section className="report-wrap">
          <article className="card report-card">
            <header className="card-head">
              <h2 className="card-title">Relatorio detalhado</h2>
            </header>
            <div className="card-body">
              <p className="small muted">Nenhum relatorio salvo no navegador ainda.</p>
              <p className="small muted">Rode uma auditoria na tela inicial e clique novamente nas metricas.</p>
              <div className="btn-row">
                <Link className="btn-link" href="/">
                  Voltar para auditoria
                </Link>
              </div>
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className={`page-shell ${desktopMode ? "embedded-mode" : ""} ${desktopShellV2 ? "embedded-shell-v2" : ""}`}>
      <div className="noise" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <section className={`report-wrap ${desktopMode ? "wrap-embedded" : ""} ${desktopShellV2 ? "wrap-shell-v2" : ""}`}>
        <header className={`topbar topbar-hero reveal ${desktopMode ? "topbar-embedded" : ""} ${desktopShellV2 ? "topbar-shell-v2" : ""}`}>
          <div className="brand">
            <div className="brand-mark">SP</div>
            <div className="brand-copy">
              <span className="brand-eyebrow">deep report and decision layer</span>
              <h1 className="brand-title">Relatorio detalhado</h1>
              <p className="brand-sub">Leitura completa do resultado em linguagem simples.</p>
              <p className="hero-note">Resumo executivo, leitura para leigo e trilha tecnica no mesmo painel.</p>
            </div>
          </div>
          <div className="btn-row">
            <button type="button" onClick={() => setShowDev((prev) => !prev)}>
              {showDev ? "Ocultar codigo de dev" : "Ver codigo de desenvolvedor"}
            </button>
            <Link className="btn-link" href="/">
              Voltar
            </Link>
          </div>
        </header>

        <article className="card report-card summary-card reveal d2">
          <header className="card-head">
            <h2 className="card-title">Resumo geral</h2>
          </header>
          <div className="card-body">
            <div className="metrics report-metrics">
              <div className="metric">
                <div className="value">{report.summary.routesChecked}</div>
                <div className="label">Rotas averiguadas</div>
              </div>
              <div className="metric">
                <div className="value">{report.summary.actionsMapped || report.summary.buttonsChecked}</div>
                <div className="label">Acoes mapeadas</div>
              </div>
              <div className="metric">
                <div className="value">{report.summary.totalIssues}</div>
                <div className="label">Problemas</div>
              </div>
              <div className="metric">
                <div className="value">{report.summary.seoScore || report.seo.overallScore}</div>
                <div className="label">SEO score</div>
              </div>
            </div>
            <p className="small muted">Site: {report.meta.baseUrl}</p>
            <p className="small muted">Gerado em: {new Date(report.meta.generatedAt).toLocaleString()}</p>
            <p className="small muted">Escopo da rodada: {auditScopeLabel(report.meta.auditScope)}</p>
          </div>
        </article>

        <article className="card report-card analysis-card reveal d2">
          <header className="card-head">
            <h2 className="card-title">Analise geral (possiveis erros + SEO)</h2>
          </header>
          <div className="card-body">
            <div className="btn-row">
              <label className="checkbox">
                <input type="checkbox" checked={showErrorAnalysis} onChange={(e) => setShowErrorAnalysis(e.target.checked)} />
                Exibir erros no relatorio
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={showSeoAnalysis} onChange={(e) => setShowSeoAnalysis(e.target.checked)} />
                Exibir SEO no relatorio
              </label>
            </div>

            {!showErrorAnalysis && !showSeoAnalysis ? (
              <div className="issue">
                <p className="small muted">Marque pelo menos uma opcao para montar a analise geral.</p>
              </div>
            ) : (
              <>
                <div className="metrics report-metrics">
                  {showErrorAnalysis ? (
                    <>
                      <div className="metric">
                        <div className="value">{report.summary.totalIssues}</div>
                        <div className="label">Possiveis erros</div>
                      </div>
                      <div className="metric">
                        <div className="value">{score}</div>
                        <div className="label">Risco tecnico</div>
                      </div>
                    </>
                  ) : null}
                  {showSeoAnalysis ? (
                    <>
                      <div className="metric">
                        <div className="value">{report.seo.overallScore}</div>
                        <div className="label">SEO score</div>
                      </div>
                      <div className="metric">
                        <div className="value">{report.summary.seoCriticalIssues}</div>
                        <div className="label">SEO critico</div>
                      </div>
                    </>
                  ) : null}
                </div>

                <div className="assistant-block">
                  <p className="small muted" style={{ marginTop: 0 }}>
                    {showErrorAnalysis && showSeoAnalysis
                      ? "Leitura combinada: funcionamento do site + pontos que afetam o Google."
                      : showSeoAnalysis
                      ? "Modo SEO: esta leitura mostra apenas o que afeta indexacao, conteudo e estrutura para busca."
                      : "Modo erros tecnicos: esta leitura mostra apenas falhas de funcionamento, fluxo e interface."}
                  </p>
                </div>

                <div className="comparison-grid">
                  {showErrorAnalysis ? (
                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>Possiveis erros principais</p>
                      {topTechnicalIssues.length ? (
                        <ul className="assistant-list">
                          {topTechnicalIssues.map((issue) => (
                            <li key={`general-issue-${issue.id}`}>
                              <strong>{issue.group}:</strong> {currentAction(issue)} | corrigir: {issue.recommendedResolution}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small muted">Nenhum erro tecnico relevante nesta rodada.</p>
                      )}
                    </div>
                  ) : null}

                  {showSeoAnalysis ? (
                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>Principais pontos de SEO</p>
                      {topSeoIssues.length ? (
                        <ul className="assistant-list">
                          {topSeoIssues.map((seoIssue) => (
                            <li key={`general-seo-${seoIssue.code}`}>
                              <strong>{seoIssue.code}:</strong> {seoIssue.detail} | melhorar: {seoIssue.recommendation}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="small muted">Nenhum problema SEO relevante nesta rodada.</p>
                      )}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </article>

        {showErrorAnalysis ? (
        <article id="sec-routes" className="card report-card routes-card reveal d2">
          <header className="card-head">
            <h2 className="card-title">Rotas averiguadas</h2>
          </header>
          <div className="card-body">
            <p>
              Total de rotas verificadas: <strong>{report.summary.routesChecked}</strong>
            </p>
            <p className="small muted">
              Rotas identificadas no resultado atual: {routesFromIssues.length || 0}
            </p>
            <div className="report-tags">
              {routesFromIssues.length ? routesFromIssues.map((route) => <span key={route} className="pill">{route}</span>) : <span className="small muted">Sem rotas listadas por issue.</span>}
            </div>
          </div>
        </article>
        ) : null}

        {showErrorAnalysis ? (
        <article id="sec-buttons" className="card report-card actions-summary-card reveal d3">
          <header className="card-head">
            <h2 className="card-title">Botoes e Acoes</h2>
          </header>
          <div className="card-body">
            <p>
              Botoes checados: <strong>{report.summary.buttonsChecked}</strong>
            </p>
            <p>
              Acoes mapeadas com contexto: <strong>{report.summary.actionsMapped || report.actionSweep.length}</strong>
            </p>
            <p>
              Acoes com efeito visivel: <strong>{report.summary.actionsWithEffect ?? report.actionSweep.filter((a) => a.status === "clicked_effect").length}</strong>
            </p>
            <p>
              Acoes sem efeito: <strong>{report.summary.actionsNoEffectDetected ?? report.actionSweep.filter((a) => a.status === "clicked_no_effect").length}</strong>
            </p>
            <p>
              Botoes sem resposta: <strong>{report.summary.buttonsNoEffect}</strong>
            </p>
            <p className="small muted">
              Cada acao abaixo mostra: funcao esperada, funcao que executou e status real.
            </p>
          </div>
        </article>
        ) : null}

        {showErrorAnalysis ? (
        <article id="sec-actions" className="card report-card action-map-card reveal d3">
          <header className="card-head">
            <h2 className="card-title">Mapa Humanizado De Acoes</h2>
          </header>
          <div className="card-body">
            <div className="issues-head">
              <div className="field" style={{ minWidth: 220 }}>
                <label>Filtrar status da acao</label>
                <select value={actionStatusFilter} onChange={(e) => setActionStatusFilter(e.target.value)}>
                  <option value="all">todos</option>
                  <option value="clicked_effect">executou com efeito</option>
                  <option value="clicked_no_effect">sem efeito</option>
                  <option value="click_error">erro no clique</option>
                  <option value="skipped_not_visible">nao visivel</option>
                  <option value="skipped_disabled">desabilitado</option>
                  <option value="skipped_already_active">ja ativo</option>
                  <option value="analysis_only">mapeado sem clique</option>
                  <option value="route_limit">nao executado (limite)</option>
                </select>
              </div>
              <div className="field" style={{ minWidth: 280 }}>
                <label>Buscar acao</label>
                <input
                  value={actionSearch}
                  onChange={(e) => setActionSearch(e.target.value)}
                  placeholder="whatsapp, ver mais, contato, rota..."
                />
              </div>
            </div>

            <div className="issues-grid">
              {actionFiltered.length === 0 ? (
                <div className="issue">
                  <p className="small muted">Nenhuma acao encontrada com os filtros atuais.</p>
                </div>
              ) : (
                actionFiltered.slice(0, 600).map((action) => (
                  <article className="issue" key={action.id}>
                    <div className="issue-top">
                      <span className="issue-code">{action.label}</span>
                      <span className={actionStatusPill(action.status)}>{action.statusLabel}</span>
                      <span className="pill">{action.kind}</span>
                    </div>
                    <p className="issue-route">Rota: {action.route}</p>
                    <p className="issue-detail">
                      <strong>Funcao que deveria fazer:</strong> {action.expectedFunction}
                    </p>
                    <p className="issue-detail">
                      <strong>Traducao para leigo:</strong> {action.expectedForUser}
                    </p>
                    <p className="issue-detail">
                      <strong>Funcao que executou:</strong> {action.actualFunction}
                    </p>
                    {action.href ? (
                      <p className="issue-meta">
                        <strong>Destino:</strong> {action.href}
                      </p>
                    ) : null}
                    {action.detail ? (
                      <p className="issue-meta">
                        <strong>Detalhe tecnico:</strong> {action.detail}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
            {actionFiltered.length > 600 ? (
              <p className="small muted">Mostrando 600 registros. Refine a busca para ver mais detalhes.</p>
            ) : null}
          </div>
        </article>
        ) : null}

        {showErrorAnalysis ? (
        <article id="sec-issues" className="card report-card issues-card reveal d3">
          <header className="card-head">
            <h2 className="card-title">Problemas encontrados</h2>
          </header>
          <div className="card-body">
            <div className="issues-head">
              <div className="field" style={{ minWidth: 220 }}>
                <label>Filtrar severidade</label>
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}>
                  <option value="all">todos</option>
                  <option value="high">alto</option>
                  <option value="medium">medio</option>
                  <option value="low">baixo</option>
                </select>
              </div>
            </div>

            <div className="issues-grid">
              {issuesFiltered.length === 0 ? (
                <div className="issue">
                  <p className="small muted">Nenhum problema para este filtro.</p>
                </div>
              ) : (
                issuesFiltered.map((issue) => {
                  const devLine = buildDeveloperLineHint(issue);
                  return (
                    <article className="issue" key={issue.id}>
                      <div className="issue-top">
                        <span className="issue-code">{issue.group}</span>
                        <span className={`pill ${issue.severity === "high" ? "pill-high" : issue.severity === "medium" ? "pill-medium" : "pill-low"}`}>
                          {severityLabel(issue.severity)}
                        </span>
                        <span className="pill">{issue.assistantHint.priority ?? "P2"}</span>
                      </div>
                      <p className="issue-route">Rota: {issue.route}{issue.action ? ` -> ${issue.action}` : ""}</p>
                      <p className="issue-detail">
                        <strong>Acao que deveria fazer:</strong> {expectedAction(issue)}
                      </p>
                      <p className="issue-detail">
                        <strong>Acao que esta realizando:</strong> {currentAction(issue)}
                      </p>
                      <p className="issue-meta">
                        <strong>Resolucao recomendada:</strong> {issue.recommendedResolution}
                      </p>
                      {showDev ? (
                        <div className="assistant-block">
                          <p className="small muted" style={{ marginTop: 0 }}>Dados de desenvolvedor</p>
                          <p className="small muted">Codigo: {issue.code}</p>
                          <p className="small muted">Explicacao tecnica: {issue.technicalExplanation || "Sem explicacao tecnica detalhada."}</p>
                          {devLine.location ? (
                            <>
                              <p className="small muted">Arquivo detectado: {devLine.location.file}</p>
                              <p className="small muted">Linha: {devLine.location.line} | Coluna: {devLine.location.column}</p>
                            </>
                          ) : (
                            <p className="small muted">Linha do erro detectada: Nao detectada automaticamente no stack.</p>
                          )}
                          <p className="small muted">Linha possivelmente errada:</p>
                          <CopyableCodeBox text={devLine.wrongLine} label="linha errada" />
                          <p className="small muted" style={{ marginTop: 8 }}>Linha sugerida para trocar manualmente:</p>
                          <CopyableCodeBox text={devLine.correctLine} label="linha sugerida" />
                          <p className="small muted">Por que essa troca: {devLine.why}</p>
                          {issue.recommendedPrompt ? (
                            <>
                              <p className="small muted" style={{ marginTop: 8 }}>Prompt de correcao sugerido:</p>
                              <CopyableCodeBox text={issue.recommendedPrompt} label="prompt de correcao" />
                            </>
                          ) : null}
                          {issue.assistantHint.firstChecks?.length ? (
                            <ul className="assistant-list">
                              {issue.assistantHint.firstChecks.map((line, idx) => (
                                <li key={`${issue.id}-dev-check-${idx}`}>{line}</li>
                              ))}
                            </ul>
                          ) : null}
                          {issue.assistantHint.commandHints?.length ? (
                            <CopyableCodeBox text={issue.assistantHint.commandHints.join("\n")} label="comandos uteis" />
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </article>
        ) : null}

        {showSeoAnalysis ? (
        <article id="sec-seo" className="card report-card seo-card reveal d3">
          <header className="card-head">
            <h2 className="card-title">Analise SEO Total</h2>
          </header>
          <div className="card-body">
            <p>
              Pontuacao SEO geral: <strong>{report.seo.overallScore}/100</strong>
            </p>
            <p>
              Paginas analisadas: <strong>{report.seo.pagesAnalyzed}</strong>
            </p>
            <p>
              Categoria tecnica: <strong>{report.seo.categoryScore.technical}/100</strong> | conteudo:{" "}
              <strong>{report.seo.categoryScore.content}/100</strong> | acessibilidade:{" "}
              <strong>{report.seo.categoryScore.accessibility}/100</strong>
            </p>
            <p className="small muted">
              Esta analise aponta gaps de SEO on-page (title, meta, H1, alt, canonical, noindex, links internos etc).
            </p>

            {seoChecklist.length ? (
              <div className="assistant-block">
                <p className="small muted" style={{ marginTop: 0 }}>Checklist SEO completo (explicado de forma simples)</p>
                <ul className="assistant-list">
                  {seoChecklist.map((item) => (
                    <li key={item.id}>
                      <strong>{item.status === "ok" ? "OK" : "FALTANDO"}:</strong> {item.label}
                      {" | "}por que importa: {item.why}
                      {item.status === "missing" ? ` | como corrigir: ${item.recommendation}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {report.seo.topRecommendations.length ? (
              <div className="assistant-block">
                <p className="small muted" style={{ marginTop: 0 }}>Prioridades SEO recomendadas</p>
                <ul className="assistant-list">
                  {report.seo.topRecommendations.slice(0, 8).map((line, idx) => (
                    <li key={`seo-top-${idx}`}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {seoFixPrompt ? (
              <div className="assistant-block">
                <p className="small muted" style={{ marginTop: 0 }}>Prompt recomendado para corrigir SEO</p>
                <CopyableCodeBox text={seoFixPrompt} label="prompt SEO" />
              </div>
            ) : null}

            <div className="issues-grid">
              {report.seo.issues.length === 0 ? (
                <div className="issue">
                  <p className="small muted">Sem problemas SEO relevantes nesta rodada.</p>
                </div>
              ) : (
                report.seo.issues.map((seoIssue) => (
                  <article className="issue" key={`seo-${seoIssue.code}`}>
                    <div className="issue-top">
                      <span className="issue-code">{seoIssue.code}</span>
                      <span className={severityLabel(seoIssue.severity) === "alto" ? "pill pill-high" : severityLabel(seoIssue.severity) === "medio" ? "pill pill-medium" : "pill pill-low"}>
                        {severityLabel(seoIssue.severity)}
                      </span>
                      <span className="pill">{seoIssue.count} ocorrencias</span>
                    </div>
                    <p className="issue-detail">{seoIssue.detail}</p>
                    <p className="issue-meta">
                      <strong>Como melhorar:</strong> {seoIssue.recommendation}
                    </p>
                    {seoIssue.affectedRoutes.length ? (
                      <p className="issue-meta">
                        <strong>Rotas afetadas:</strong> {seoIssue.affectedRoutes.slice(0, 10).join(", ")}
                      </p>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </article>
        ) : null}

        {showErrorAnalysis ? (
        <article id="sec-risk" className="card report-card risk-card reveal d3">
          <header className="card-head">
            <h2 className="card-title">Risco</h2>
          </header>
          <div className="card-body">
            <p>
              Pontuacao de risco atual: <strong>{score}</strong>/100
            </p>
            <p className="small muted">
              Quanto maior o risco, maior a prioridade de tratar erros de severidade alta primeiro.
            </p>
            <div className="assistant-block">
              <p className="small muted" style={{ marginTop: 0 }}>Proximos passos sugeridos</p>
              <ul className="assistant-list">
                {report.assistantGuide.immediateSteps.map((step, idx) => (
                  <li key={`step-${idx}`}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
        ) : null}

        {showDev ? (
          <article className="card report-card dev-card reveal">
            <header className="card-head">
              <h2 className="card-title">JSON tecnico bruto</h2>
            </header>
            <div className="card-body">
              <CopyableCodeBox text={rawText || "Sem JSON bruto carregado."} label="JSON tecnico" />
            </div>
          </article>
        ) : null}
      </section>
    </main>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={(
        <main className="page-shell">
          <section className="login-shell">
            <article className="login-card">
              <div className="login-body">
                <p className="small muted">Carregando relatorio...</p>
              </div>
            </article>
          </section>
        </main>
      )}
    >
      <ReportPageContent />
    </Suspense>
  );
}
