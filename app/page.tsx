"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Mode = "desktop" | "mobile";
type AuditScope = "full" | "seo" | "experience";
type Severity = "high" | "medium" | "low";
type SeverityFilter = Severity | "all";

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
};

type ReportModel = {
  meta: {
    project: string;
    baseUrl: string;
    generatedAt: string;
    auditScope: AuditScope;
  };
  summary: {
    auditScope?: AuditScope;
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

type HistoryIssueModel = {
  code: string;
  severity: Severity;
  route: string;
  action: string;
  detail: string;
  recommendedResolution: string;
};

type ReportHistoryEntry = {
  id: string;
  savedAt: string;
  source: string;
  mode: Mode;
  baseUrl: string;
  summary: {
    routesChecked: number;
    buttonsChecked: number;
    totalIssues: number;
    riskScore: number;
    seoScore: number;
  };
  issues: HistoryIssueModel[];
  raw: unknown;
  fingerprint: string;
};

type HistoryComparison = {
  fixed: HistoryIssueModel[];
  unresolved: HistoryIssueModel[];
  added: HistoryIssueModel[];
};

type RunPlanResponse = {
  ok: boolean;
  mode: Mode;
  command: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  steps: string[];
  report?: unknown;
  usedFallback?: boolean;
  detail?: string;
  error?: string;
};

type SeoWatchDoc = {
  id: string;
  title: string;
  url: string;
  focus: string;
  lastUpdated: string;
  digest: string;
  status: "new" | "updated" | "unchanged" | "error";
  note: string;
};

type SeoWatchResponse = {
  ok: boolean;
  checkedAt: string;
  changedCount: number;
  docs: SeoWatchDoc[];
  prompt: string;
  sources: string[];
};

type AuditNotice = {
  level: "error" | "warn" | "info";
  code?: string;
  title: string;
  userMessage: string;
  recommendation: string;
  technical?: string;
};

type CmdLaunchResponse = {
  ok: boolean;
  mode?: Mode;
  message?: string;
  command?: string;
  recommendation?: string;
  recommendedCommand?: string;
  fullAudit?: boolean;
  elevated?: boolean;
  detail?: string;
  error?: string;
};

type LocalBridgeHealthResponse = {
  ok: boolean;
  service?: string;
  running?: boolean;
  runningTarget?: string | null;
  runningMode?: Mode | null;
  timestamp?: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type DesktopCompanionApi = {
  getState?: () => Promise<unknown>;
  openReports?: () => Promise<{ ok: boolean; error?: string }>;
};

const DEFAULT_TARGET_URL = "https://example.com";
const REPORT_FALLBACK_URL = "https://your-site.com";
const LAST_REPORT_STORAGE_KEY = "sitepulse:last-report-v1";
const CURRENT_REPORT_SESSION_KEY = "sitepulse:current-report-session-v1";
const REPORT_HISTORY_STORAGE_KEY = "sitepulse:report-history-v1";
const SEO_WATCH_SNAPSHOT_STORAGE_KEY = "sitepulse:seo-watch-snapshot-v1";
const SEO_WATCH_LAST_CHECK_STORAGE_KEY = "sitepulse:seo-watch-last-check-v1";
const MAX_REPORT_HISTORY = 12;
const LOCAL_BRIDGE_BASE_URL = "http://127.0.0.1:47891";
const LOCAL_BRIDGE_START_COMMAND = "npm run audit:bridge";
const LOCAL_COMPANION_HINT =
  "Instale o SitePulse Companion no Windows para auditoria local completa sem precisar do codigo-fonte. Em modo dev, rode npm run audit:bridge.";
const DEMO_USERS = [
  { username: "admin", password: "admin123" },
  { username: "mobile", password: "mobile123" },
];

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
};

function nowIso() {
  return new Date().toISOString();
}

function prependLog(previous: string[], line: string) {
  return [`${new Date().toLocaleTimeString()} ${line}`, ...previous].slice(0, 140);
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
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) {
    return "experience";
  }
  return "full";
}

function auditScopeLabel(scope: AuditScope) {
  if (scope === "seo") return "so SEO";
  if (scope === "experience") return "so site";
  return "completo";
}

function auditScopeHelp(scope: AuditScope) {
  if (scope === "seo") {
    return "Analisa SEO e ignora botoes, secoes e cliques para ganhar velocidade.";
  }
  if (scope === "experience") {
    return "Analisa botoes, secoes, runtime e requests. SEO fica ignorado nesta rodada.";
  }
  return "Analisa SEO, botoes, secoes, requests e comportamento.";
}

function getDesktopCompanionApi(): DesktopCompanionApi | null {
  if (typeof window === "undefined") return null;
  const maybe = (window as Window & typeof globalThis & { sitePulseCompanion?: DesktopCompanionApi }).sitePulseCompanion;
  return maybe ?? null;
}

function normalizeIssue(raw: unknown, index: number): IssueModel {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const code = String(item.code ?? "UNKNOWN");
  const severity = parseSeverity(item.severity, code);
  const route = String(item.route ?? "/");
  const action = String(item.action ?? "");
  const detail = String(item.detail ?? "No detail provided.");
  const recommendedResolution = String(item.recommendedResolution ?? "Review logs and fix root cause.");
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
  const group = ISSUE_GROUP[code] ?? "Other";
  return {
    id: String(item.id ?? `issue-${index + 1}`),
    code,
    severity,
    route,
    action,
    detail,
    recommendedResolution,
    assistantHint,
    group,
  };
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
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
      auditScope: normalizeAuditScope(summaryObj.auditScope ?? metaObj.auditScope),
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
      replayCommand: String(
        guideObj.replayCommand ??
          metaObj.replayCommand ??
          `node src/index.mjs --config "audit.default.${String(source.mode) === "mobile" ? "mobile.json" : "json"}" --fresh --live-log --human-log`
      ),
      immediateSteps: Array.isArray(guideObj.immediateSteps)
        ? guideObj.immediateSteps.map((v) => String(v))
        : ["Read top P0/P1 issues first.", "Fix root cause.", "Run auditor again."],
      quickStartPrompt: String(
        guideObj.quickStartPrompt ??
          guideObj.masterPrompt ??
          "Act as a senior engineer. Fix highest severity issues first and validate with a new audit run."
      ),
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
    },
    issues,
  };
}

function scoreFromIssues(issues: IssueModel[]): number {
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;
  const score = Math.min(100, high * 34 + medium * 14 + low * 6);
  return score;
}

function makeCommand(mode: Mode, targetUrl: string, noServer: boolean, headed: boolean, auditScope: AuditScope) {
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const parts = [
    "npm --prefix qa run audit:cmd --",
    `--config "${config}"`,
    "--fresh",
    "--live-log",
    "--human-log",
    `--scope "${auditScope}"`,
    `--base-url "${targetUrl}"`,
  ];
  if (noServer) parts.push("--no-server");
  if (headed) parts.push("--headed");
  return parts.join(" ");
}

function wizardCommand(mode: Mode, targetUrl: string, noServer: boolean, headed: boolean, auditScope: AuditScope) {
  const parts = [
    "npm --prefix qa run audit:hub --",
    `--mode ${mode}`,
    `--scope ${auditScope}`,
    `--url "${targetUrl}"`,
  ];
  if (noServer) parts.push("--no-server");
  if (headed) parts.push("--headed");
  return parts.join(" ");
}

function downloadJson(fileName: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function priorityPillClass(priority = "P2") {
  if (priority === "P0") return "pill pill-p0";
  if (priority === "P1") return "pill pill-p1";
  return "pill pill-p2";
}

function severityPillClass(severity: Severity) {
  if (severity === "high") return "pill pill-high";
  if (severity === "medium") return "pill pill-medium";
  return "pill pill-low";
}

function mapHealthChip(health: "idle" | "ok" | "bad") {
  if (health === "ok") return { label: "API OK", className: "dot ok" };
  if (health === "bad") return { label: "API com erro", className: "dot bad" };
  return { label: "API nao verificada", className: "dot" };
}

function mapBridgeChip(status: "idle" | "ok" | "bad", serviceName = "Bridge local") {
  if (status === "ok") return { label: `${serviceName} ON`, className: "dot ok" };
  if (status === "bad") return { label: `${serviceName} OFF`, className: "dot bad" };
  return { label: `${serviceName} nao checado`, className: "dot" };
}

function persistLastReport(raw: unknown) {
  try {
    localStorage.setItem(LAST_REPORT_STORAGE_KEY, JSON.stringify(raw));
  } catch {
    // ignore storage errors
  }
}

function splitLogList(value: string) {
  return String(value ?? "")
    .split(/\s+\|\s+|\s+\|\|\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractBaseUrlFromLog(text: string) {
  const urlMatch = text.match(/URL:\s*(https?:\/\/[^\s]+)/i) ?? text.match(/https?:\/\/[^\s)]+/i);
  if (!urlMatch) return REPORT_FALLBACK_URL;
  try {
    return new URL(urlMatch[1] ?? urlMatch[0]).origin;
  } catch {
    return REPORT_FALLBACK_URL;
  }
}

function parseIssueLogToReport(text: string, source: string) {
  const lines = String(text ?? "").replace(/\r/g, "").split("\n");
  const issues: Array<Record<string, unknown>> = [];
  let current: Record<string, unknown> | null = null;
  let currentField = "";
  let inPrompt = false;

  const flushCurrent = () => {
    if (!current) return;
    issues.push(current);
    current = null;
    currentField = "";
    inPrompt = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const headerMatch = line.match(/^\[([^\]]+)\]\s+\[(high|medium|low)\]\s+\[([A-Z0-9_]+)\]\s+(\S+)(?:\s+->\s+(.*))?$/);
    if (headerMatch) {
      flushCurrent();
      current = {
        id: `log-${issues.length + 1}`,
        timestamp: headerMatch[1],
        severity: headerMatch[2],
        code: headerMatch[3],
        route: headerMatch[4],
        action: headerMatch[5] ?? "",
        assistantHint: {},
      };
      continue;
    }

    if (!current) continue;

    if (line.startsWith("prompt_correcao:")) {
      inPrompt = true;
      current.recommendedPrompt = line.slice("prompt_correcao:".length).trim();
      currentField = "recommendedPrompt";
      continue;
    }

    const keyValueMatch = line.match(/^([a-z_]+):\s*(.*)$/i);
    if (keyValueMatch) {
      inPrompt = false;
      currentField = keyValueMatch[1];
      current[currentField] = keyValueMatch[2];
      continue;
    }

    if (!line.trim()) {
      if (inPrompt) {
        current.recommendedPrompt = `${String(current.recommendedPrompt ?? "")}\n`;
      }
      continue;
    }

    if (inPrompt) {
      const prev = String(current.recommendedPrompt ?? "");
      current.recommendedPrompt = prev ? `${prev}\n${line}` : line;
      continue;
    }

    if (currentField) {
      current[currentField] = `${String(current[currentField] ?? "")} ${line}`.trim();
    }
  }

  flushCurrent();

  if (!issues.length) return null;

  const baseUrl = extractBaseUrlFromLog(text);
  const routesChecked = new Set(issues.map((issue) => String(issue.route ?? "/"))).size;
  const buttonsChecked = issues.filter((issue) => String(issue.action ?? "").trim()).length;
  const codeCount = (code: string) => issues.filter((issue) => String(issue.code ?? "") === code).length;
  const grouped = new Map<string, number>();
  for (const issue of issues) {
    const code = String(issue.code ?? "UNKNOWN");
    grouped.set(code, (grouped.get(code) ?? 0) + 1);
  }
  const groupedTop = [...grouped.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const normalizedIssues = issues.map((issue, index) => {
    const detail = String(issue.detalhe ?? "Sem detalhe.");
    const checks = splitLogList(String(issue.checks_assistente ?? ""));
    const commandHints = splitLogList(String(issue.comandos_assistente ?? ""));
    const priority = String(issue.prioridade_assistente ?? "");
    const technicalTitle = String(issue.diagnostico_titulo ?? "");
    const technicalSubtype = String(issue.diagnostico_subtipo ?? "");
    const technicalExplanation = [
      technicalTitle,
      technicalSubtype ? `subtipo: ${technicalSubtype}` : "",
      detail,
    ]
      .filter(Boolean)
      .join(" | ");

    return {
      id: String(issue.id ?? `log-issue-${index + 1}`),
      code: String(issue.code ?? "UNKNOWN"),
      severity: parseSeverity(issue.severity, String(issue.code ?? "")),
      route: String(issue.route ?? "/"),
      action: String(issue.action ?? ""),
      detail,
      recommendedResolution: String(issue.resolucao_recomendada ?? "Revisar logs e corrigir causa raiz."),
      laymanExplanation: String(issue.leigo ?? ""),
      technicalExplanation,
      recommendedPrompt: String(issue.recommendedPrompt ?? ""),
      assistantHint: {
        priority: priority === "P0" || priority === "P1" || priority === "P2" ? priority : undefined,
        firstChecks: checks,
        commandHints,
        likelyAreas: [],
      },
    };
  });

  const dominantIssue = groupedTop[0];
  const quickPrompt =
    typeof normalizedIssues[0]?.recommendedPrompt === "string" && normalizedIssues[0].recommendedPrompt.trim()
      ? normalizedIssues[0].recommendedPrompt
      : `Atue como engenheiro senior. Corrija primeiro ${dominantIssue?.[0] ?? "a falha principal"} e revalide com nova auditoria.`;

  return {
    meta: {
      project: "sitepulse-log-import",
      baseUrl,
      generatedAt: nowIso(),
      startedAt: nowIso(),
      finishedAt: nowIso(),
      source,
    },
    summary: {
      routesChecked,
      routeLoadFailures: codeCount("ROUTE_LOAD_FAIL"),
      buttonsChecked,
      actionsMapped: buttonsChecked,
      actionsWithEffect: 0,
      actionsNoEffectDetected: codeCount("BTN_NO_EFFECT"),
      actionsFailed: codeCount("BTN_CLICK_ERROR"),
      actionsAnalysisOnly: 0,
      buttonsNoEffect: codeCount("BTN_NO_EFFECT"),
      http4xx: codeCount("HTTP_4XX"),
      http5xx: codeCount("HTTP_5XX"),
      netRequestFailed: codeCount("NET_REQUEST_FAILED"),
      jsRuntimeErrors: codeCount("JS_RUNTIME_ERROR"),
      consoleErrors: codeCount("CONSOLE_ERROR"),
      visualSectionOrderInvalid: codeCount("VISUAL_SECTION_ORDER_INVALID"),
      visualSectionMissing: codeCount("VISUAL_SECTION_MISSING"),
      seoScore: 0,
      seoPagesAnalyzed: 0,
      seoCriticalIssues: 0,
      seoTotalIssues: 0,
      totalIssues: normalizedIssues.length,
    },
    assistantGuide: {
      replayCommand: "Rode novamente via CMD para validar o fix e gerar novo report/issue log.",
      immediateSteps: groupedTop.length
        ? groupedTop.map(([code, count], index) => `Prioridade ${index + 1}: tratar ${code} (${count} ocorrencias).`)
        : ["Importe um novo log ou gere uma rodada completa para continuar."],
      quickStartPrompt: quickPrompt,
    },
    actionSweep: [],
    seo: {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: {
        technical: 0,
        content: 0,
        accessibility: 0,
      },
      issues: [],
      topRecommendations: [],
    },
    issues: normalizedIssues,
  };
}

function parseImportedPayload(text: string, source: string) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return parseIssueLogToReport(trimmed, source);
  }
}

function issueFingerprint(issue: { code: string; route: string; action: string }) {
  return `${issue.code}|${issue.route}|${issue.action || "_"}`;
}

function toHistoryIssue(issue: IssueModel): HistoryIssueModel {
  return {
    code: issue.code,
    severity: issue.severity,
    route: issue.route,
    action: issue.action,
    detail: issue.detail,
    recommendedResolution: issue.recommendedResolution,
  };
}

function reportFingerprint(report: Pick<ReportModel, "meta" | "summary" | "issues">) {
  return [
    report.meta.baseUrl,
    report.summary.totalIssues,
    report.summary.routesChecked,
    report.summary.buttonsChecked,
    report.issues.slice(0, 40).map((item) => issueFingerprint(item)).join(","),
  ].join("|");
}

function buildHistoryEntry(report: ReportModel, raw: unknown, source: string, mode: Mode): ReportHistoryEntry {
  const issues = report.issues.slice(0, 220).map(toHistoryIssue);
  const fingerprint = reportFingerprint(report);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: nowIso(),
    source,
    mode,
    baseUrl: report.meta.baseUrl,
    summary: {
      routesChecked: report.summary.routesChecked,
      buttonsChecked: report.summary.buttonsChecked,
      totalIssues: report.summary.totalIssues,
      riskScore: scoreFromIssues(report.issues),
      seoScore: report.summary.seoScore || report.seo.overallScore,
    },
    issues,
    raw,
    fingerprint,
  };
}

function parseHistoryIssue(raw: unknown): HistoryIssueModel {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const code = String(item.code ?? "UNKNOWN");
  return {
    code,
    severity: parseSeverity(item.severity, code),
    route: String(item.route ?? "/"),
    action: String(item.action ?? ""),
    detail: String(item.detail ?? "Sem detalhe."),
    recommendedResolution: String(item.recommendedResolution ?? "Revisar causa raiz."),
  };
}

function parseHistoryEntry(raw: unknown, index: number): ReportHistoryEntry | null {
  const item = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
  if (!item) return null;
  const summaryRaw = item.summary && typeof item.summary === "object" ? (item.summary as Record<string, unknown>) : {};
  const issuesRaw = Array.isArray(item.issues) ? item.issues : [];
  const issues = issuesRaw.map(parseHistoryIssue);
  const mode = item.mode === "mobile" ? "mobile" : "desktop";
  const baseUrl = String(item.baseUrl ?? REPORT_FALLBACK_URL);
  const totalIssues = toNumber(summaryRaw.totalIssues, issues.length);
  const routesChecked = toNumber(summaryRaw.routesChecked, 0);
  const buttonsChecked = toNumber(summaryRaw.buttonsChecked, 0);
  const riskScore = toNumber(summaryRaw.riskScore, Math.min(100, totalIssues * 10));
  const seoScore = toNumber(summaryRaw.seoScore, 0);
  const source = String(item.source ?? "unknown");
  const savedAt = String(item.savedAt ?? nowIso());
  const fingerprint = String(
    item.fingerprint ??
    [
      baseUrl,
      totalIssues,
      routesChecked,
      buttonsChecked,
      issues.slice(0, 40).map((issue) => issueFingerprint(issue)).join(","),
    ].join("|"),
  );

  return {
    id: String(item.id ?? `history-${index + 1}`),
    savedAt,
    source,
    mode,
    baseUrl,
    summary: {
      routesChecked,
      buttonsChecked,
      totalIssues,
      riskScore,
      seoScore,
    },
    issues,
    raw: item.raw ?? null,
    fingerprint,
  };
}

function readHistoryStorage(): ReportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(REPORT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item, index) => parseHistoryEntry(item, index))
      .filter((item): item is ReportHistoryEntry => !!item)
      .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
      .slice(0, MAX_REPORT_HISTORY);
  } catch {
    return [];
  }
}

function persistHistoryStorage(entries: ReportHistoryEntry[]) {
  try {
    localStorage.setItem(REPORT_HISTORY_STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_REPORT_HISTORY)));
  } catch {
    // ignore storage errors
  }
}

function persistCurrentSessionReport(raw: unknown) {
  try {
    sessionStorage.setItem(CURRENT_REPORT_SESSION_KEY, JSON.stringify(raw));
  } catch {
    // ignore storage errors
  }
}

function readCurrentSessionReport() {
  try {
    const raw = sessionStorage.getItem(CURRENT_REPORT_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function clearCurrentSessionReport() {
  try {
    sessionStorage.removeItem(CURRENT_REPORT_SESSION_KEY);
  } catch {
    // ignore storage errors
  }
}

function readSeoWatchSnapshot() {
  try {
    const raw = localStorage.getItem(SEO_WATCH_SNAPSHOT_STORAGE_KEY);
    if (!raw) return {} as Record<string, { digest: string; lastUpdated: string }>;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, { digest: string; lastUpdated: string }>)
      : {};
  } catch {
    return {} as Record<string, { digest: string; lastUpdated: string }>;
  }
}

function persistSeoWatchSnapshot(docs: SeoWatchDoc[]) {
  try {
    const snapshot = Object.fromEntries(
      docs.map((doc) => [doc.id, { digest: doc.digest, lastUpdated: doc.lastUpdated }]),
    );
    localStorage.setItem(SEO_WATCH_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    localStorage.setItem(SEO_WATCH_LAST_CHECK_STORAGE_KEY, nowIso());
  } catch {
    // ignore storage errors
  }
}

function readSeoWatchLastCheck() {
  try {
    return localStorage.getItem(SEO_WATCH_LAST_CHECK_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function buildHistoryComparison(previous: ReportHistoryEntry, current: ReportModel): HistoryComparison {
  const previousByKey = new Map<string, HistoryIssueModel>();
  for (const issue of previous.issues) {
    previousByKey.set(issueFingerprint(issue), issue);
  }

  const currentByKey = new Map<string, HistoryIssueModel>();
  for (const issue of current.issues.map(toHistoryIssue)) {
    currentByKey.set(issueFingerprint(issue), issue);
  }

  const fixed: HistoryIssueModel[] = [];
  const unresolved: HistoryIssueModel[] = [];
  const added: HistoryIssueModel[] = [];

  for (const [key, issue] of previousByKey) {
    if (currentByKey.has(key)) unresolved.push(issue);
    else fixed.push(issue);
  }
  for (const [key, issue] of currentByKey) {
    if (!previousByKey.has(key)) added.push(issue);
  }

  const bySeverity = { high: 0, medium: 1, low: 2 } as const;
  const sorter = (a: HistoryIssueModel, b: HistoryIssueModel) =>
    bySeverity[a.severity] - bySeverity[b.severity] || a.code.localeCompare(b.code);

  return {
    fixed: fixed.sort(sorter),
    unresolved: unresolved.sort(sorter),
    added: added.sort(sorter),
  };
}

function buildAiComparisonPrompt(previous: ReportHistoryEntry, current: ReportModel, diff: HistoryComparison) {
  const topUnresolved = diff.unresolved.slice(0, 8);
  const topAdded = diff.added.slice(0, 8);

  return [
    "Atue como engenheiro senior com foco em causa raiz e execucao rapida.",
    `Site: ${current.meta.baseUrl}`,
    `Comparacao: report anterior ${previous.savedAt} vs atual ${current.meta.generatedAt}.`,
    `Resumo: corrigidos=${diff.fixed.length}, pendentes=${diff.unresolved.length}, novos=${diff.added.length}.`,
    "",
    "Pendencias principais (P0/P1 primeiro):",
    ...topUnresolved.map((item, idx) => `${idx + 1}. [${item.code}] ${item.route} -> ${item.action || "route_load"} | ${item.detail}`),
    "",
    "Novos problemas detectados:",
    ...topAdded.map((item, idx) => `${idx + 1}. [${item.code}] ${item.route} -> ${item.action || "route_load"} | ${item.detail}`),
    "",
    "Entrega obrigatoria:",
    "- corrigir problemas high antes de medium/low",
    "- adicionar evidencias por arquivo/linha alterada",
    "- reexecutar auditoria e comprovar reducao de issues",
  ].join("\n");
}

function pickComparisonEntry(entries: ReportHistoryEntry[], current: ReportModel | null) {
  if (!entries.length) return "";
  if (!current) return entries[0]?.id ?? "";
  const candidate = entries.find(
    (entry) => entry.baseUrl === current.meta.baseUrl && entry.fingerprint !== reportFingerprint(current),
  );
  return candidate?.id ?? entries[0]?.id ?? "";
}

function classifyAuditNotice(input: {
  error?: string;
  detail?: string;
  usedFallback?: boolean;
  targetUrl: string;
}): AuditNotice {
  const code = String(input.error ?? "").trim();
  const detail = String(input.detail ?? "").trim();
  const signal = `${code} ${detail}`.toLowerCase();
  const technical = detail || undefined;

  if (input.usedFallback || code === "audit_engine_unavailable") {
    return {
      level: "warn",
      code: code || "audit_engine_unavailable",
      title: "Auditoria parcial no servidor",
      userMessage:
        "O sistema conseguiu validar a resposta HTTP do site, mas nao conseguiu executar toda a auditoria visual (botoes/layout) no servidor.",
      recommendation:
        "Use 'Rodar via CMD (janela)' no Windows local para auditoria completa e depois importe o JSON no painel.",
      technical,
    };
  }

  if (code === "baseUrl is required" || code === "invalid baseUrl") {
    return {
      level: "error",
      code: code || "invalid_base_url",
      title: "URL invalida",
      userMessage:
        "A URL informada nao esta no formato correto.",
      recommendation:
        "Digite a URL completa com protocolo, por exemplo: https://seusite.com.",
      technical,
    };
  }

  if (code === "local_bridge_unreachable") {
    return {
      level: "warn",
      code,
      title: "Bridge local indisponivel",
      userMessage:
        "A auditoria completa via browser precisa do companion local ou do bridge local ativo na sua maquina.",
      recommendation:
        `Use o SitePulse Companion. Em modo dev, abra um CMD na pasta do projeto e rode: ${LOCAL_BRIDGE_START_COMMAND}.`,
      technical,
    };
  }

  if (code === "bridge_busy") {
    return {
      level: "info",
      code,
      title: "Bridge local ocupado",
      userMessage:
        "Ja existe uma auditoria completa em execucao no seu computador.",
      recommendation:
        "Aguarde a rodada atual terminar e execute novamente.",
      technical,
    };
  }

  if (code === "audit_failed" || signal.includes("audit_failed")) {
    return {
      level: "error",
      code: "audit_failed",
      title: "Auditoria nao conseguiu gerar relatorio",
      userMessage:
        "A verificacao iniciou, mas nao conseguiu finalizar o relatorio automaticamente neste ambiente.",
      recommendation:
        "Rode a auditoria via CMD local para gerar o JSON completo e importe no painel.",
      technical,
    };
  }

  if (
    signal.includes("err_name_not_resolved") ||
    signal.includes("dns") ||
    signal.includes("name not resolved")
  ) {
    return {
      level: "error",
      code: code || "dns_error",
      title: "Dominio nao encontrado",
      userMessage:
        "Nao foi possivel localizar o dominio do site.",
      recommendation:
        "Confira se a URL esta correta e se o dominio esta ativo.",
      technical,
    };
  }

  if (
    signal.includes("err_connection_refused") ||
    signal.includes("econnrefused") ||
    signal.includes("connection refused")
  ) {
    return {
      level: "error",
      code: code || "connection_refused",
      title: "Servidor recusou conexao",
      userMessage:
        "O site existe, mas o servidor recusou a conexao no momento do teste.",
      recommendation:
        "Verifique se o servidor esta online e se nao ha bloqueio de rede/firewall.",
      technical,
    };
  }

  if (
    signal.includes("err_cert") ||
    signal.includes("ssl") ||
    signal.includes("tls") ||
    signal.includes("certificate")
  ) {
    return {
      level: "error",
      code: code || "ssl_error",
      title: "Erro de certificado SSL/TLS",
      userMessage:
        "A conexao segura do site falhou por problema de certificado.",
      recommendation:
        "Corrija/renove o certificado HTTPS do dominio e teste novamente.",
      technical,
    };
  }

  if (signal.includes("timeout") || signal.includes("timed out")) {
    return {
      level: "error",
      code: code || "timeout",
      title: "Tempo limite excedido",
      userMessage:
        "O site demorou mais do que o esperado para responder.",
      recommendation:
        "Teste de novo e verifique desempenho/estabilidade do servidor.",
      technical,
    };
  }

  if (signal.includes(" 403 ") || signal.includes("forbidden")) {
    return {
      level: "error",
      code: code || "http_403",
      title: "Acesso bloqueado (403)",
      userMessage:
        "O servidor bloqueou o acesso para esta verificacao.",
      recommendation:
        "Revise regras de firewall, WAF, CORS ou permissao da rota.",
      technical,
    };
  }

  if (signal.includes(" 404 ") || signal.includes("not found")) {
    return {
      level: "error",
      code: code || "http_404",
      title: "Pagina/rota nao encontrada (404)",
      userMessage:
        "A URL foi acessada, mas a rota solicitada nao existe no servidor.",
      recommendation:
        "Confirme o caminho da URL e se a rota esta publicada.",
      technical,
    };
  }

  if (signal.includes(" 500 ") || signal.includes("5xx")) {
    return {
      level: "error",
      code: code || "http_5xx",
      title: "Erro interno do servidor (5xx)",
      userMessage:
        "O servidor encontrou uma falha interna ao processar a requisicao.",
      recommendation:
        "Verifique logs do backend e dependencias externas.",
      technical,
    };
  }

  if (
    signal.includes("playwright") ||
    signal.includes("chromium") ||
    signal.includes("browsertype.launch")
  ) {
    return {
      level: "warn",
      code: code || "runner_unavailable",
      title: "Motor de browser indisponivel no ambiente",
      userMessage:
        "O ambiente atual nao conseguiu abrir o navegador da auditoria.",
      recommendation:
        "Execute a auditoria completa via CMD local e importe o JSON no Hub.",
      technical,
    };
  }

  if (signal.includes("failed to fetch") || signal.includes("networkerror")) {
    return {
      level: "error",
      code: code || "network_error",
      title: "Falha de rede na auditoria",
      userMessage:
        "Houve uma falha de comunicacao ao tentar verificar o site.",
      recommendation:
        "Confirme conexao, URL e bloqueios de rede, depois tente novamente.",
      technical,
    };
  }

  return {
    level: "error",
    code: code || "run_plan_failed",
    title: "Falha ao executar auditoria",
    userMessage:
      `Nao foi possivel concluir a verificacao de ${input.targetUrl}.`,
    recommendation:
      "Tente novamente. Se persistir, rode via CMD local para obter diagnostico completo.",
    technical,
  };
}

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoLogin = searchParams.get("autologin") === "1";
  const selfAudit = searchParams.get("selfaudit") === "1";
  const desktopMode = searchParams.get("desktop") === "1";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [mode, setMode] = useState<Mode>("desktop");
  const [auditScope, setAuditScope] = useState<AuditScope>("full");
  const [targetUrl, setTargetUrl] = useState(DEFAULT_TARGET_URL);
  const [noServer, setNoServer] = useState(true);
  const [headed, setHeaded] = useState(false);

  const [running, setRunning] = useState(false);
  const [openingCmd, setOpeningCmd] = useState(false);
  const [cmdFullAudit, setCmdFullAudit] = useState(true);
  const [cmdElevated, setCmdElevated] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(["[hub] ready"]);
  const [report, setReport] = useState<ReportModel | null>(null);
  const [reportRaw, setReportRaw] = useState<unknown>(null);
  const [health, setHealth] = useState<"idle" | "ok" | "bad">("idle");
  const [localBridgeHealth, setLocalBridgeHealth] = useState<"idle" | "ok" | "bad">("idle");
  const [localBridgeService, setLocalBridgeService] = useState("Bridge local");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");
  const [jsonPaste, setJsonPaste] = useState("");
  const [actionPulse, setActionPulse] = useState(0);
  const [auditNotice, setAuditNotice] = useState<AuditNotice | null>(null);
  const [pwaReady, setPwaReady] = useState(false);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<ReportHistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState("");
  const [seoWatchLoading, setSeoWatchLoading] = useState(false);
  const [seoWatch, setSeoWatch] = useState<SeoWatchResponse | null>(null);
  const [seoWatchError, setSeoWatchError] = useState("");
  const [desktopApiAvailable, setDesktopApiAvailable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoLoginAppliedRef = useRef(false);
  const restoredSessionReportRef = useRef(false);
  const installEventRef = useRef<InstallPromptEvent | null>(null);

  const directCmd = useMemo(
    () => makeCommand(mode, targetUrl, noServer, headed, auditScope),
    [mode, targetUrl, noServer, headed, auditScope],
  );
  const guidedCmd = useMemo(
    () => wizardCommand(mode, targetUrl, noServer, headed, auditScope),
    [mode, targetUrl, noServer, headed, auditScope],
  );

  const filteredIssues = useMemo(() => {
    if (!report) return [];
    return report.issues.filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (!search.trim()) return true;
      const hay = `${issue.code} ${issue.route} ${issue.action} ${issue.detail} ${issue.group}`.toLowerCase();
      return hay.includes(search.trim().toLowerCase());
    });
  }, [report, severityFilter, search]);

  const severityCounts = useMemo(() => {
    const source = report?.issues ?? [];
    return {
      high: source.filter((i) => i.severity === "high").length,
      medium: source.filter((i) => i.severity === "medium").length,
      low: source.filter((i) => i.severity === "low").length,
    };
  }, [report]);

  const riskScore = useMemo(() => scoreFromIssues(report?.issues ?? []), [report]);
  const healthChip = mapHealthChip(health);
  const bridgeChip = mapBridgeChip(localBridgeHealth, localBridgeService);
  const selectedHistory = useMemo(
    () => historyEntries.find((entry) => entry.id === selectedHistoryId) ?? null,
    [historyEntries, selectedHistoryId],
  );
  const historyDiff = useMemo(() => {
    if (!selectedHistory || !report) return null;
    return buildHistoryComparison(selectedHistory, report);
  }, [selectedHistory, report]);
  const historyAiPrompt = useMemo(() => {
    if (!selectedHistory || !report || !historyDiff) return "";
    return buildAiComparisonPrompt(selectedHistory, report, historyDiff);
  }, [selectedHistory, report, historyDiff]);

  function openReportPage(focus?: "routes" | "actions" | "issues" | "risk" | "seo") {
    const params = new URLSearchParams();
    if (focus) params.set("foco", focus);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    router.push(`/relatorio${suffix}`);
  }

  function pushLog(line: string) {
    setLogs((prev) => prependLog(prev, line));
  }

  async function installApp() {
    if (desktopMode) {
      pushLog("[desktop] voce ja esta usando o programa desktop real.");
      return;
    }
    if (pwaInstalled) {
      pushLog("[pwa] app ja esta no modo instalado.");
      return;
    }

    const deferredInstall = installEventRef.current;
    if (!deferredInstall) {
      pushLog("[pwa] instalacao direta indisponivel neste navegador.");
      pushLog("[pwa] abra menu do navegador e use: Instalar app / Adicionar a tela inicial.");
      return;
    }

    try {
      await deferredInstall.prompt();
      const choice = await deferredInstall.userChoice;
      if (choice.outcome === "accepted") {
        pushLog("[pwa] instalacao confirmada.");
      } else {
        pushLog("[pwa] instalacao cancelada.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "install_prompt_failed";
      pushLog(`[pwa] falha ao abrir instalacao: ${message}`);
    }
  }

  async function openDesktopReports() {
    const api = getDesktopCompanionApi();
    if (!api?.openReports) {
      pushLog("[desktop] API local de relatorios indisponivel.");
      return;
    }
    const result = await api.openReports();
    if (result.ok) {
      pushLog("[desktop] pasta de relatorios aberta.");
    } else {
      pushLog(`[desktop] falha ao abrir relatorios: ${result.error ?? "unknown"}`);
    }
  }

  async function checkHealth() {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) {
        setHealth("bad");
        pushLog("[health] api check failed");
        return;
      }
      setHealth("ok");
      pushLog("[health] api ok");
    } catch {
      setHealth("bad");
      pushLog("[health] api unreachable");
    }
  }

  async function checkLocalBridge(silent = false) {
    try {
      const res = await fetch(`${LOCAL_BRIDGE_BASE_URL}/health`, { cache: "no-store" });
      if (!res.ok) {
        setLocalBridgeHealth("bad");
        setLocalBridgeService("Bridge local");
        if (!silent) pushLog("[bridge] check failed");
        return false;
      }
      const payload = (await res.json()) as LocalBridgeHealthResponse;
      if (!payload.ok) {
        setLocalBridgeHealth("bad");
        setLocalBridgeService("Bridge local");
        if (!silent) pushLog("[bridge] respondeu com erro.");
        return false;
      }
      const serviceName = payload.service === "sitepulse-companion-bridge" ? "Companion local" : "Bridge local";
      setLocalBridgeService(serviceName);
      setLocalBridgeHealth("ok");
      if (!silent) {
        pushLog(payload.running ? `[bridge] ${serviceName} ativo (auditoria em andamento).` : `[bridge] ${serviceName} ativo e pronto.`);
      }
      return true;
    } catch {
      setLocalBridgeHealth("bad");
      setLocalBridgeService("Bridge local");
      if (!silent) {
        pushLog(`[bridge] offline. ${LOCAL_COMPANION_HINT}`);
      }
      return false;
    }
  }

  async function runPlanViaLocalBridge() {
    if (!targetUrl.trim()) return;
    setRunning(true);
    setProgress(0);
    setAuditNotice(null);
    setLogs([]);
    pushLog(`[run-local] iniciando auditoria via bridge local | escopo=${auditScope}...`);

    const bridgeReady = await checkLocalBridge(true);
    if (!bridgeReady) {
      const notice = classifyAuditNotice({
        error: "local_bridge_unreachable",
        detail: `Bridge URL: ${LOCAL_BRIDGE_BASE_URL}`,
        targetUrl: targetUrl.trim(),
      });
      setAuditNotice(notice);
      pushLog(`[run-local] ${notice.title}`);
      pushLog(`[run-local] acao recomendada: ${notice.recommendation}`);
      setProgress(0);
      setRunning(false);
      return;
    }

    try {
      const res = await fetch(`${LOCAL_BRIDGE_BASE_URL}/run`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          baseUrl: targetUrl.trim(),
          mode,
          scope: auditScope,
          noServer,
          headed,
          fullAudit: true,
        }),
      });
      const payload = (await res.json()) as RunPlanResponse;
      if (!res.ok || !payload.ok) {
        const notice = classifyAuditNotice({
          error: payload.error ?? "run_plan_failed",
          detail: payload.detail,
          usedFallback: payload.usedFallback,
          targetUrl: targetUrl.trim(),
        });
        setAuditNotice(notice);
        pushLog(`[run-local] failed: ${notice.title}`);
        pushLog(`[run-local] traducao: ${notice.userMessage}`);
        pushLog(`[run-local] acao recomendada: ${notice.recommendation}`);
        if (notice.technical) pushLog(`[run-local] detalhe tecnico: ${notice.technical.slice(0, 220)}`);
        setProgress(0);
        return;
      }

      setProgress(82);
      for (const step of payload.steps ?? []) {
        pushLog(`[run-local/step] ${step}`);
      }

      if (payload.usedFallback) {
        const notice = classifyAuditNotice({
          error: payload.error,
          detail: payload.detail,
          usedFallback: true,
          targetUrl: targetUrl.trim(),
        });
        setAuditNotice(notice);
        pushLog("[run-local] aviso: fallback HTTP detectado.");
      }
      if (payload.detail) pushLog(`[run-local] detalhe tecnico: ${payload.detail.slice(0, 220)}`);

      if (payload.report) {
        applyReport(payload.report, "local_bridge_full_audit");
        const totalIssues = Number((payload.report as { summary?: { totalIssues?: number } })?.summary?.totalIssues ?? 0);
        if (Number.isFinite(totalIssues) && totalIssues > 0) {
          pushLog(`[run-local] concluida com ${totalIssues} problema(s).`);
        } else {
          pushLog("[run-local] concluida sem problemas detectados.");
        }
      } else {
        pushLog("[run-local] finalizou sem report. Rode via CMD direto para diagnostico.");
      }
      setProgress(100);
      pushLog("[run-local] finalizada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "run_plan_failed";
      const notice = classifyAuditNotice({
        error: "run_plan_failed",
        detail: message,
        targetUrl: targetUrl.trim(),
      });
      setAuditNotice(notice);
      pushLog(`[run-local] failed: ${notice.title}`);
      pushLog(`[run-local] traducao: ${notice.userMessage}`);
      pushLog(`[run-local] acao recomendada: ${notice.recommendation}`);
      if (notice.technical) pushLog(`[run-local] detalhe tecnico: ${notice.technical.slice(0, 220)}`);
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }

  async function tryOpenCmdViaLocalBridge() {
    const bridgeReady = await checkLocalBridge(true);
    if (!bridgeReady) {
      const notice = classifyAuditNotice({
        error: "local_bridge_unreachable",
        detail: `Bridge URL: ${LOCAL_BRIDGE_BASE_URL}`,
        targetUrl: targetUrl.trim(),
      });
      setAuditNotice(notice);
      pushLog(`[cmd] ${notice.title}`);
      pushLog(`[cmd] ${notice.recommendation}`);
      return false;
    }

    const res = await fetch(`${LOCAL_BRIDGE_BASE_URL}/open-cmd`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        baseUrl: targetUrl.trim(),
        mode,
        scope: auditScope,
        noServer,
        headed,
        fullAudit: cmdFullAudit,
        elevated: cmdElevated,
      }),
    });
    const payload = (await res.json()) as CmdLaunchResponse;
    if (!res.ok || !payload.ok) {
      const detail = payload.detail ?? payload.error ?? "cmd_open_failed";
      pushLog(`[cmd] falha pelo bridge local: ${detail}`);
      if (payload.recommendedCommand) pushLog(`[cmd] comando recomendado: ${payload.recommendedCommand}`);
      return false;
    }

    setAuditNotice(null);
    pushLog(`[cmd] ${payload.message ?? "janela CMD aberta via bridge local."}`);
    if (payload.recommendedCommand) pushLog(`[cmd] comando recomendado: ${payload.recommendedCommand}`);
    if (payload.recommendation) pushLog(`[cmd] recomendacao: ${payload.recommendation}`);
    return true;
  }

  function validateLogin() {
    const valid = DEMO_USERS.some((u) => u.username === username && u.password === password);
    if (!valid) {
      setLoginError("Invalid login. Use admin/admin123 or mobile/mobile123.");
      return;
    }
    setLoginError("");
    setLogged(true);
    void checkHealth();
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      pushLog(`[copy] ${label}`);
    } catch {
      pushLog(`[copy] failed: ${label}`);
    }
  }

  async function checkSeoUpdates(options?: { silent?: boolean }) {
    setSeoWatchLoading(true);
    setSeoWatchError("");
    try {
      const previousSnapshot = readSeoWatchSnapshot();
      const res = await fetch("/api/seo-watch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ previousSnapshot }),
      });
      const payload = (await res.json()) as SeoWatchResponse & { error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error ?? "seo_watch_failed");
      }
      setSeoWatch(payload);
      persistSeoWatchSnapshot(payload.docs);
      if (!options?.silent) {
        pushLog(
          payload.changedCount > 0
            ? `[seo-watch] ${payload.changedCount} documento(s) oficiais do Google mudaram desde a ultima checagem.`
            : "[seo-watch] nenhuma mudanca nova encontrada nas docs oficiais do Google.",
        );
      } else if (payload.changedCount > 0) {
        pushLog(`[seo-watch] alerta: ${payload.changedCount} documento(s) oficiais mudaram.`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "seo_watch_failed";
      setSeoWatchError(message);
      if (!options?.silent) {
        pushLog(`[seo-watch] falha ao verificar docs oficiais: ${message}`);
      }
    } finally {
      setSeoWatchLoading(false);
    }
  }

  function loadHistoryEntry(entry: ReportHistoryEntry) {
    if (entry.raw == null) {
      pushLog("[history] este report salvo nao possui JSON bruto para recarregar.");
      return;
    }
    applyReport(entry.raw, `history:${entry.savedAt}`, {
      persistHistory: false,
      writeLastReport: true,
      persistSession: true,
      writeLog: true,
    });
    setSelectedHistoryId(entry.id);
  }

  function clearHistory() {
    setHistoryEntries([]);
    setSelectedHistoryId("");
    persistHistoryStorage([]);
    pushLog("[history] historico local removido.");
  }

  async function loadDemoReport() {
    const res = await fetch(`/api/demo-report?mode=${mode}`, { cache: "no-store" });
    const data = await res.json();
    applyReport(data, "demo_report");
    return normalizeReport(data);
  }

  async function runPlan() {
    if (!targetUrl.trim()) return;
    setRunning(true);
    setProgress(0);
    setAuditNotice(null);
    setLogs([]);
    pushLog(`[run] starting plan | escopo=${auditScope}`);
    try {
      const res = await fetch("/api/run-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          baseUrl: targetUrl.trim(),
          mode,
          scope: auditScope,
          noServer,
          headed,
        }),
      });
      const payload = (await res.json()) as RunPlanResponse;
      if (!res.ok || !payload.ok) {
        if (payload.report) {
          applyReport(payload.report, "api_error_report");
        }
        const notice = classifyAuditNotice({
          error: payload.error,
          detail: payload.detail,
          usedFallback: payload.usedFallback,
          targetUrl: targetUrl.trim(),
        });
        setAuditNotice(notice);
        pushLog(`[run] failed: ${notice.title}`);
        pushLog(`[run] traducao: ${notice.userMessage}`);
        pushLog(`[run] acao recomendada: ${notice.recommendation}`);
        if (payload.report) {
          pushLog("[run] relatorio parcial aplicado mesmo com erro HTTP.");
        }
        if (notice.technical) {
          pushLog(`[run] detalhe tecnico: ${notice.technical.slice(0, 220)}`);
        }
        setProgress(0);
        return;
      }

      setProgress(75);
      const steps = payload.steps ?? [];
      for (const step of steps) {
        pushLog(`[step] ${step}`);
      }
      if (payload.usedFallback) {
        const notice = classifyAuditNotice({
          error: payload.error,
          detail: payload.detail,
          usedFallback: true,
          targetUrl: targetUrl.trim(),
        });
        setAuditNotice(notice);
        pushLog("[run] aviso: auditoria parcial no servidor.");
      }
      if (payload.usedFallback) {
        pushLog("[run] fallback ativo no servidor (auditoria HTTP). Para auditoria completa, rode via CMD local.");
      }
      if (payload.detail) {
        pushLog(`[run] detalhe tecnico: ${payload.detail.slice(0, 220)}`);
      }

      if (payload.report) {
        applyReport(payload.report, "live_audit");
        const totalIssues = Number((payload.report as { summary?: { totalIssues?: number } })?.summary?.totalIssues ?? 0);
        if (Number.isFinite(totalIssues) && totalIssues > 0) {
          pushLog(`[run] concluida com ${totalIssues} problema(s) para revisar.`);
        } else {
          pushLog("[run] concluida sem problemas detectados.");
        }
      } else {
        pushLog("[report] no report returned, use CMD run and import JSON.");
      }
      setProgress(100);
      pushLog("[run] finalizada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      const notice = classifyAuditNotice({
        error: "run_plan_failed",
        detail: message,
        targetUrl: targetUrl.trim(),
      });
      setAuditNotice(notice);
      pushLog(`[run] failed: ${notice.title}`);
      pushLog(`[run] traducao: ${notice.userMessage}`);
      pushLog(`[run] acao recomendada: ${notice.recommendation}`);
      if (notice.technical) {
        pushLog(`[run] detalhe tecnico: ${notice.technical.slice(0, 220)}`);
      }
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }

  async function openCmdRun() {
    if (!targetUrl.trim()) {
      pushLog("[cmd] informe uma URL para abrir no CMD.");
      return;
    }
    setOpeningCmd(true);
    pushLog("[cmd] abrindo janela do CMD...");
    try {
      const res = await fetch("/api/open-cmd", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          baseUrl: targetUrl.trim(),
          mode,
          scope: auditScope,
          noServer,
          headed,
          fullAudit: cmdFullAudit,
          elevated: cmdElevated,
        }),
      });
      const payload = (await res.json()) as CmdLaunchResponse;
      if (!res.ok || !payload.ok) {
        if (payload.error === "unsupported_platform") {
          pushLog("[cmd] ambiente remoto nao pode abrir CMD. Tentando bridge local...");
          const opened = await tryOpenCmdViaLocalBridge();
          if (opened) return;
        }
        throw new Error(payload.detail ?? payload.error ?? "cmd_open_failed");
      }
      pushLog(`[cmd] ${payload.message ?? "janela CMD aberta."}`);
      if (payload.recommendedCommand) {
        pushLog(`[cmd] comando recomendado: ${payload.recommendedCommand}`);
      }
      if (payload.recommendation) {
        pushLog(`[cmd] recomendacao: ${payload.recommendation}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      pushLog(`[cmd] falha ao abrir CMD pela API: ${message}`);
      pushLog("[cmd] tentando bridge local...");
      try {
        const opened = await tryOpenCmdViaLocalBridge();
        if (!opened) pushLog("[cmd] bridge local tambem falhou.");
      } catch (bridgeError) {
        const bridgeMessage = bridgeError instanceof Error ? bridgeError.message : "bridge_cmd_open_failed";
        pushLog(`[cmd] falha final: ${bridgeMessage}`);
      }
    } finally {
      setOpeningCmd(false);
    }
  }

  function applyReport(
    raw: unknown,
    source: string,
    options?: {
      persistSession?: boolean;
      persistHistory?: boolean;
      writeLastReport?: boolean;
      writeLog?: boolean;
    },
  ) {
    try {
      const normalized = normalizeReport(raw);
      setReportRaw(raw);
      setReport(normalized);
      setAuditScope(normalized.meta.auditScope || "full");
      setTargetUrl(normalized.meta.baseUrl || targetUrl);
      if (options?.writeLastReport !== false) {
        persistLastReport(raw);
      }
      if (options?.persistSession !== false) {
        persistCurrentSessionReport(raw);
      }
      if (options?.persistHistory !== false) {
        const nextEntry = buildHistoryEntry(normalized, raw, source, mode);
        setHistoryEntries((prev) => {
          const merged = [nextEntry, ...prev.filter((entry) => entry.fingerprint !== nextEntry.fingerprint)];
          const limited = merged.slice(0, MAX_REPORT_HISTORY);
          persistHistoryStorage(limited);
          const suggested = limited.find(
            (entry) => entry.baseUrl === normalized.meta.baseUrl && entry.fingerprint !== nextEntry.fingerprint,
          );
          setSelectedHistoryId(suggested?.id ?? limited[1]?.id ?? "");
          return limited;
        });
      }
      setAuditNotice(null);
      setSeverityFilter("all");
      setSearch("");
      if (options?.writeLog !== false) {
        pushLog(`[report] imported from ${source}`);
      }
    } catch {
      pushLog("[report] invalid json");
    }
  }

  async function onReportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseImportedPayload(text, file.name);
    if (parsed) {
      applyReport(parsed, file.name);
    } else {
      pushLog("[report] could not parse selected file (json/log unsupported)");
    }
    event.target.value = "";
  }

  function importFromPaste() {
    if (!jsonPaste.trim()) return;
    const parsed = parseImportedPayload(jsonPaste, "paste");
    if (parsed) {
      applyReport(parsed, "paste");
    } else {
      pushLog("[report] pasted content is not valid json/log");
    }
  }

  const reportAvailable = !!report;
  const showDashboard = logged || autoLogin;
  const pasteReady = jsonPaste.trim().length > 1;

  useEffect(() => {
    if (!autoLogin) return;
    if (autoLoginAppliedRef.current) return;
    autoLoginAppliedRef.current = true;
    setLogged(true);
    void checkHealth();
    pushLog("[auth] autologin enabled by query param");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLogin]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const history = readHistoryStorage();
    setHistoryEntries(history);

    if (restoredSessionReportRef.current) return;
    restoredSessionReportRef.current = true;

    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry?.type === "reload") {
      clearCurrentSessionReport();
      setSelectedHistoryId(history[0]?.id ?? "");
      pushLog("[session] hard reload detectado. Estado ativo limpo.");
      return;
    }

    const sessionReport = readCurrentSessionReport();
    if (!sessionReport) {
      setSelectedHistoryId(history[0]?.id ?? "");
      return;
    }

    applyReport(sessionReport, "session_restore", {
      persistSession: false,
      persistHistory: false,
      writeLastReport: false,
      writeLog: false,
    });
    const normalized = normalizeReport(sessionReport);
    setSelectedHistoryId(pickComparisonEntry(history, normalized));
    pushLog("[session] ultimo report restaurado apos voltar.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lastCheck = readSeoWatchLastCheck();
    const elapsed = lastCheck ? Date.now() - new Date(lastCheck).getTime() : Number.POSITIVE_INFINITY;
    if (elapsed >= 1000 * 60 * 60 * 24) {
      void checkSeoUpdates({ silent: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const api = getDesktopCompanionApi();
    setDesktopApiAvailable(Boolean(api));
    if (desktopMode && api) {
      pushLog("[desktop] programa desktop local detectado.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktopMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
    const getStandaloneMode = () =>
      window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;

    setPwaInstalled(desktopMode ? true : getStandaloneMode());

    if (desktopMode) {
      setPwaReady(false);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      installEventRef.current = event as InstallPromptEvent;
      setPwaReady(true);
      setLogs((prev) => prependLog(prev, "[pwa] instalacao habilitada."));
    };

    const onAppInstalled = () => {
      installEventRef.current = null;
      setPwaReady(false);
      setPwaInstalled(true);
      setLogs((prev) => prependLog(prev, "[pwa] app instalado com sucesso."));
    };

    const onDisplayModeChange = () => {
      setPwaInstalled(getStandaloneMode());
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
    window.addEventListener("appinstalled", onAppInstalled);

    const displayMode = window.matchMedia("(display-mode: standalone)");
    if (typeof displayMode.addEventListener === "function") {
      displayMode.addEventListener("change", onDisplayModeChange);
    } else if (typeof displayMode.addListener === "function") {
      displayMode.addListener(onDisplayModeChange);
    }

    let swUpdateInterval: number | undefined;
    let onVisibilityChange: (() => void) | null = null;
    let onControllerChange: (() => void) | null = null;
    let didControllerReload = false;

    if ("serviceWorker" in navigator) {
      const activateWaitingWorker = (registration: ServiceWorkerRegistration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      };

      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          setLogs((prev) => prependLog(prev, "[pwa] service worker ativo."));

          registration.addEventListener("updatefound", () => {
            const installing = registration.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (installing.state !== "installed") return;
              if (navigator.serviceWorker.controller) {
                setLogs((prev) => prependLog(prev, "[pwa] nova versao detectada. Aplicando update automatico..."));
                activateWaitingWorker(registration);
              }
            });
          });

          if (registration.waiting) {
            setLogs((prev) => prependLog(prev, "[pwa] versao pendente encontrada. Atualizando agora..."));
            activateWaitingWorker(registration);
          }

          void registration.update().catch(() => {});
          swUpdateInterval = window.setInterval(() => {
            void registration.update().catch(() => {});
          }, 60_000);

          onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
              void registration.update().catch(() => {});
            }
          };
          document.addEventListener("visibilitychange", onVisibilityChange);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "sw_register_failed";
          setLogs((prev) => prependLog(prev, `[pwa] falha service worker: ${message}`));
        });

      onControllerChange = () => {
        if (didControllerReload) return;
        didControllerReload = true;
        setLogs((prev) => prependLog(prev, "[pwa] app atualizado. Recarregando para aplicar mudancas..."));
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    } else {
      setLogs((prev) => prependLog(prev, "[pwa] navegador sem suporte a service worker."));
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as EventListener);
      window.removeEventListener("appinstalled", onAppInstalled);
      if (typeof displayMode.removeEventListener === "function") {
        displayMode.removeEventListener("change", onDisplayModeChange);
      } else if (typeof displayMode.removeListener === "function") {
        displayMode.removeListener(onDisplayModeChange);
      }
      if (typeof swUpdateInterval === "number") {
        window.clearInterval(swUpdateInterval);
      }
      if (onVisibilityChange) {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      if (onControllerChange && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      }
    };
  }, [desktopMode]);

  if (!showDashboard) {
    return (
      <main className="page-shell">
        <div className="noise" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <section className="login-shell">
          <article className="login-card reveal">
            <header className="login-hero">
              <p className="small muted" style={{ margin: 0 }}>
                SitePulse Hub
              </p>
              <h1>App + CMD auditor command center.</h1>
              <p>Auditoria simples para qualquer URL, com resultado tecnico e resumo claro.</p>
            </header>
            <div className="login-body">
              <div className="field">
                <label>Username</label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="admin123" />
              </div>
              <div className="btn-row">
                <button className="btn-primary" type="button" onClick={validateLogin}>
                  Entrar
                </button>
              </div>
              <p className="small muted">Demo users: admin/admin123 and mobile/mobile123</p>
              {loginError ? <p className="error">{loginError}</p> : null}
            </div>
          </article>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="noise" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />

      <section className="wrap">
        <header className="topbar reveal" data-audit-ignore="true">
          <div className="brand">
            <div className="brand-mark">SP</div>
            <div>
              <h1 className="brand-title">SitePulse Hub</h1>
              <p className="brand-sub">Verifique erros de rota, botoes e requests em qualquer site.</p>
              <p className="small muted" style={{ margin: "2px 0 0" }}>ui pulse: {actionPulse}</p>
            </div>
          </div>
          <div className="chip-row">
            <span className="chip">
              <span className={healthChip.className} />
              {healthChip.label}
            </span>
            <span className="chip">
              <span className={bridgeChip.className} />
              {bridgeChip.label}
            </span>
            <span className="chip">
              <span className="dot ok" />
              mode: {mode}
            </span>
            <span className="chip">
              <span className="dot ok" />
              escopo: {auditScopeLabel(auditScope)}
            </span>
            <span className="chip">
              <span className={running ? "dot" : "dot ok"} />
              {running ? "auditoria em andamento" : "pronto"}
            </span>
            {desktopMode ? (
              <span className="chip">
                <span className="dot ok" />
                desktop app
              </span>
            ) : (
              <button type="button" className={`chip chip-action ${pwaInstalled ? "active" : ""}`} onClick={() => void installApp()}>
                <span className={pwaInstalled || pwaReady ? "dot ok" : "dot"} />
                {pwaInstalled ? "app instalado" : pwaReady ? "instalar app" : "modo app"}
              </button>
            )}
          </div>
        </header>

        <section className="dashboard" data-audit-ignore="true">
          <article className="card reveal d2">
            <header className="card-head">
              <h2 className="card-title">Painel</h2>
            </header>
            <div className="card-body">
              <div className="field">
                <label>URL do site</label>
                <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://your-site.com" />
              </div>

              <div className="field">
                <label>Modo de tela</label>
                <div className="segmented">
                  <button
                    type="button"
                    className={mode === "desktop" ? "active" : ""}
                    aria-pressed={mode === "desktop"}
                    onClick={() => setMode("desktop")}
                  >
                    desktop
                  </button>
                  <button
                    type="button"
                    className={mode === "mobile" ? "active" : ""}
                    aria-pressed={mode === "mobile"}
                    onClick={() => setMode("mobile")}
                  >
                    mobile
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Escopo da auditoria</label>
                <div className="segmented">
                  <button
                    type="button"
                    className={auditScope === "full" ? "active" : ""}
                    aria-pressed={auditScope === "full"}
                    onClick={() => setAuditScope("full")}
                  >
                    completo
                  </button>
                  <button
                    type="button"
                    className={auditScope === "seo" ? "active" : ""}
                    aria-pressed={auditScope === "seo"}
                    onClick={() => setAuditScope("seo")}
                  >
                    so SEO
                  </button>
                  <button
                    type="button"
                    className={auditScope === "experience" ? "active" : ""}
                    aria-pressed={auditScope === "experience"}
                    onClick={() => setAuditScope("experience")}
                  >
                    so site
                  </button>
                </div>
                <p className="small muted" style={{ margin: "8px 0 0" }}>
                  {auditScopeHelp(auditScope)}
                </p>
              </div>

              <label className="checkbox">
                <input type="checkbox" checked={noServer} onChange={(e) => setNoServer(e.target.checked)} />
                Usar --no-server (auditar URL externa)
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={headed} onChange={(e) => setHeaded(e.target.checked)} />
                Abrir navegador visivel
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={cmdFullAudit} onChange={(e) => setCmdFullAudit(e.target.checked)} />
                CMD completo ate finalizar (igual auditoria total)
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={cmdElevated} onChange={(e) => setCmdElevated(e.target.checked)} />
                Executar como administrador (UAC)
              </label>

              <div className="btn-row">
                <button
                  className="btn-primary"
                  type="button"
                  disabled={running || openingCmd || selfAudit}
                  onClick={runPlan}
                >
                  {running ? "Auditando..." : "Auditar URL agora"}
                </button>
                <button
                  className="btn-primary"
                  type="button"
                  disabled={running || openingCmd || selfAudit}
                  onClick={runPlanViaLocalBridge}
                >
                  {running ? "Auditando..." : "Auditar completo (Companion local)"}
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  disabled={running || openingCmd || selfAudit}
                  onClick={openCmdRun}
                >
                  {openingCmd ? "Abrindo CMD..." : "Rodar via CMD (janela)"}
                </button>
                <button className="btn-secondary" type="button" onClick={checkHealth}>
                  Checar API
                </button>
                <button className="btn-secondary" type="button" onClick={() => void checkLocalBridge()}>
                  Checar Companion local
                </button>
              </div>
              <p className="small muted" style={{ margin: 0 }}>
                "Rodar via CMD (janela)" abre no Windows local. Em deploy remoto (ex.: Vercel), use o comando recomendado.
              </p>
              <p className="small muted" style={{ margin: "4px 0 0" }}>
                {desktopMode
                  ? "Voce esta no SitePulse Desktop. O Hub roda dentro do programa e o bridge local e iniciado automaticamente."
                  : LOCAL_COMPANION_HINT}
              </p>
              <p className="small muted" style={{ margin: "4px 0 0" }}>
                Fallback de desenvolvimento: <code>{LOCAL_BRIDGE_START_COMMAND}</code>.
              </p>

              <div className="btn-row">
                <button type="button" onClick={() => void loadDemoReport()}>
                  Carregar exemplo
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  Importar JSON ou LOG
                </button>
                <button type="button" className="btn-secondary" onClick={() => void checkSeoUpdates()} disabled={seoWatchLoading}>
                  {seoWatchLoading ? "Checando docs SEO..." : "Procurar atualizacoes SEO"}
                </button>
                {desktopApiAvailable ? (
                  <button type="button" className="btn-secondary" onClick={() => void openDesktopReports()}>
                    Abrir relatorios locais
                  </button>
                ) : null}
              </div>
              <p className="small muted" style={{ margin: "4px 0 0" }}>
                {seoWatch
                  ? `Docs oficiais Google checadas em ${new Date(seoWatch.checkedAt).toLocaleString()} | mudancas detectadas: ${seoWatch.changedCount}`
                  : "O app pode verificar docs oficiais do Google Search Central e gerar prompt de atualizacao."}
              </p>
              {seoWatchError ? (
                <p className="small muted" style={{ margin: "4px 0 0" }}>
                  Falha ao checar docs SEO: {seoWatchError}
                </p>
              ) : null}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json,.log,.txt,text/plain"
                style={{ display: "none" }}
                onChange={onReportFileChange}
              />

              <div className="field">
                <label>Colar JSON ou log do CMD</label>
                <textarea
                  rows={5}
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                  placeholder='Cole o JSON completo ou o log parcial/final do CMD aqui e clique em "Aplicar".'
                />
              </div>
              <div className="btn-row">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={importFromPaste}
                  disabled={!pasteReady}
                >
                  Aplicar
                </button>
              </div>
            </div>
          </article>

          <article className="card reveal d3">
            <header className="card-head">
              <h2 className="card-title">Resultado da auditoria</h2>
            </header>
            <div className="card-body">
              {auditNotice ? (
                <section className={`audit-alert ${auditNotice.level}`}>
                  <div className="audit-alert-top">
                    <strong>{auditNotice.title}</strong>
                    {auditNotice.code ? <span className="pill">{auditNotice.code}</span> : null}
                  </div>
                  <p>{auditNotice.userMessage}</p>
                  <p className="small">{auditNotice.recommendation}</p>
                  {auditNotice.technical ? (
                    <details>
                      <summary>Mostrar detalhe tecnico</summary>
                      <div className="code-box mono">{auditNotice.technical}</div>
                      <div className="btn-row" style={{ marginTop: 8 }}>
                        <button type="button" onClick={() => void copyText(auditNotice.technical ?? "", "detalhe tecnico copied")}>
                          Copiar detalhe tecnico
                        </button>
                      </div>
                    </details>
                  ) : null}
                </section>
              ) : null}

              <div className="metrics">
                <button type="button" className="metric metric-action" onClick={() => openReportPage("routes")}>
                  <div className="value">{report?.summary.routesChecked ?? 0}</div>
                  <div className="label">Rotas</div>
                </button>
                <button type="button" className="metric metric-action" onClick={() => openReportPage("actions")}>
                  <div className="value">{report?.summary.actionsMapped ?? report?.summary.buttonsChecked ?? 0}</div>
                  <div className="label">Acoes</div>
                </button>
                <button type="button" className="metric metric-action" onClick={() => openReportPage("issues")}>
                  <div className="value">{report?.summary.totalIssues ?? 0}</div>
                  <div className="label">Problemas</div>
                </button>
                <button type="button" className="metric metric-action" onClick={() => openReportPage("seo")}>
                  <div className="value">{report?.summary.seoScore ?? report?.seo.overallScore ?? 0}</div>
                  <div className="label">SEO</div>
                </button>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Progresso
                </p>
                <div className="progress">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <p className="small muted" style={{ margin: "7px 0 0" }}>
                  {progress}% completo
                </p>
              </div>

              <div className="legend">
                <span className="pill pill-high">alto {severityCounts.high}</span>
                <span className="pill pill-medium">medio {severityCounts.medium}</span>
                <span className="pill pill-low">baixo {severityCounts.low}</span>
                <span className="pill">ordem visual errada {report?.summary.visualSectionOrderInvalid ?? 0}</span>
                <span className="pill">botoes sem resposta {report?.summary.buttonsNoEffect ?? 0}</span>
                <span className="pill">risco {riskScore}</span>
                <span className="pill">seo critico {report?.summary.seoCriticalIssues ?? 0}</span>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Log da auditoria
                </p>
                <div className="log mono">
                  {logs.map((line, idx) => (
                    <p className="log-line" key={`log-${idx}`}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              <div className="issues-head">
                <div className="field" style={{ minWidth: 220 }}>
                  <label>Filter severity</label>
                  <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}>
                    <option value="all">todos</option>
                    <option value="high">alto</option>
                    <option value="medium">medio</option>
                    <option value="low">baixo</option>
                  </select>
                </div>
                <div className="field" style={{ minWidth: 280 }}>
                  <label>Buscar problema</label>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="codigo, rota, acao ou detalhe..." />
                </div>
              </div>

              <div className="issues-grid">
                {!reportAvailable ? (
                  <div className="issue">
                    <p className="small muted">Nenhum relatorio carregado ainda. Rode a auditoria ou importe um JSON.</p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="issue">
                    <p className="small muted">Nenhum problema encontrado com os filtros atuais.</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => (
                    <article className="issue" key={issue.id}>
                      <div className="issue-top">
                        <span className="issue-code">{issue.code}</span>
                        <span className={severityPillClass(issue.severity)}>{issue.severity}</span>
                        <span className={priorityPillClass(issue.assistantHint.priority)}>{issue.assistantHint.priority ?? "P2"}</span>
                        <span className="pill">{issue.group}</span>
                      </div>
                      <p className="issue-route">
                        {issue.route}
                        {issue.action ? ` -> ${issue.action}` : ""}
                      </p>
                      <p className="issue-detail">{issue.detail}</p>
                      <p className="issue-meta">Resolucao recomendada: {issue.recommendedResolution}</p>
                      {issue.assistantHint.firstChecks?.length ? (
                        <div className="assistant-block">
                          <p className="small muted" style={{ marginTop: 0 }}>
                            Primeiras verificacoes
                          </p>
                          <ul className="assistant-list">
                            {issue.assistantHint.firstChecks.map((line, idx) => (
                              <li key={`check-${issue.id}-${idx}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {issue.assistantHint.commandHints?.length ? (
                        <div className="assistant-block">
                          <p className="small muted" style={{ marginTop: 0 }}>
                            Comandos uteis
                          </p>
                          <div className="code-box mono">{issue.assistantHint.commandHints.join("\n")}</div>
                          <div className="btn-row" style={{ marginTop: 8 }}>
                            <button type="button" onClick={() => void copyText(issue.assistantHint.commandHints?.join("\n") ?? "", "issue commands copied")}>
                              Copiar comandos
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  ))
                )}
              </div>
            </div>
          </article>

          <article className="card reveal d2">
            <header className="card-head">
              <h2 className="card-title">Companion + CMD + Guia</h2>
            </header>
            <div className="card-body">
              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Companion local (preferido)
                </p>
                <div className="assistant-block">
                  <p className="small muted" style={{ marginTop: 0 }}>
                    Instale e abra o SitePulse Companion para manter o bridge ativo no Windows sem depender do projeto fonte.
                  </p>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Fallback dev: inicializar bridge manual
                </p>
                <div className="code-box mono">{LOCAL_BRIDGE_START_COMMAND}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn-secondary" type="button" onClick={() => void copyText(LOCAL_BRIDGE_START_COMMAND, "bridge start command copied")}>
                    Copiar comando do bridge
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Comando guiado
                </p>
                <div className="code-box mono">{guidedCmd}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn-secondary" type="button" onClick={() => void copyText(guidedCmd, "guided cmd copied")}>
                    Copiar comando guiado
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Comando direto
                </p>
                <div className="code-box mono">{directCmd}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => void copyText(directCmd, "direct cmd copied")}>
                    Copiar comando direto
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Proximos passos
                </p>
                <div className="assistant-block">
                  <ul className="assistant-list">
                    {(report?.assistantGuide.immediateSteps ?? ["Load report and start with top P0/P1 issues."]).map((line, idx) => (
                      <li key={`step-${idx}`}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Prompt rapido
                </p>
                <div className="code-box mono">{report?.assistantGuide.quickStartPrompt ?? "No prompt yet."}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn-warn" type="button" onClick={() => void copyText(report?.assistantGuide.quickStartPrompt ?? "", "prompt copied")}>
                    Copiar prompt
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  SEO watch (Google docs oficiais)
                </p>
                <div className="assistant-block">
                  <p className="small muted" style={{ marginTop: 0 }}>
                    Use isso para descobrir mudancas nas docs oficiais do Google e gerar um prompt forte para atualizar as regras SEO do SitePulse.
                  </p>
                  <ul className="assistant-list">
                    {(seoWatch?.docs ?? []).slice(0, 6).map((doc) => (
                      <li key={`seo-doc-${doc.id}`}>
                        <strong>{doc.title}</strong> | status: {doc.status} | updated: {doc.lastUpdated || "n/a"} | foco: {doc.focus}
                      </li>
                    ))}
                    {!seoWatch?.docs?.length ? <li>Nenhuma checagem executada ainda.</li> : null}
                  </ul>
                </div>
                <div className="code-box mono">{seoWatch?.prompt ?? "Nenhum prompt de atualizacao SEO gerado ainda."}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button type="button" className="btn-secondary" onClick={() => void checkSeoUpdates()} disabled={seoWatchLoading}>
                    {seoWatchLoading ? "Checando..." : "Atualizar snapshot SEO"}
                  </button>
                  <button type="button" className="btn-warn" onClick={() => void copyText(seoWatch?.prompt ?? "", "seo watch prompt copied")}>
                    Copiar prompt SEO
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Comando para repetir auditoria
                </p>
                <div className="code-box mono">{report?.assistantGuide.replayCommand ?? "No replay command available."}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => void copyText(report?.assistantGuide.replayCommand ?? "", "replay command copied")}>
                    Copiar replay
                  </button>
                </div>
              </div>

              <div className="btn-row">
                <button
                  type="button"
                  disabled={!reportRaw}
                  onClick={() => {
                    if (!reportRaw) return;
                    setActionPulse((prev) => prev + 1);
                    pushLog("[export] report json downloaded");
                    downloadJson(`sitepulse-hub-report-${mode}.json`, reportRaw);
                  }}
                >
                  Baixar JSON do relatorio
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="history-grid" data-audit-ignore="true">
          <article className="card reveal">
            <header className="card-head">
              <h2 className="card-title">Ultimos reports</h2>
            </header>
            <div className="card-body">
              <div className="btn-row" style={{ justifyContent: "space-between" }}>
                <p className="small muted" style={{ margin: 0 }}>
                  Reports ficam salvos localmente para voce voltar, comparar e reutilizar solucao.
                </p>
                <button type="button" className="btn-secondary" onClick={clearHistory} disabled={!historyEntries.length}>
                  Limpar historico
                </button>
              </div>

              {!historyEntries.length ? (
                <div className="issue">
                  <p className="small muted">Nenhum report salvo ainda. Rode uma auditoria ou importe um JSON.</p>
                </div>
              ) : (
                <div className="history-list">
                  {historyEntries.map((entry) => (
                    <article
                      key={entry.id}
                      className={`history-item ${selectedHistoryId === entry.id ? "active" : ""}`}
                      onClick={() => setSelectedHistoryId(entry.id)}
                    >
                      <div className="issue-top">
                        <span className="issue-code">{entry.baseUrl}</span>
                        <span className="pill">{entry.mode}</span>
                        <span className="pill">issues {entry.summary.totalIssues}</span>
                        <span className="pill">seo {entry.summary.seoScore}</span>
                        <span className="pill">risco {entry.summary.riskScore}</span>
                      </div>
                      <p className="issue-meta">
                        Salvo em {new Date(entry.savedAt).toLocaleString()} | origem: {entry.source}
                      </p>
                      <p className="issue-detail">
                        Rotas: {entry.summary.routesChecked} | acoes: {entry.summary.buttonsChecked}
                      </p>
                      <div className="btn-row">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedHistoryId(entry.id);
                          }}
                        >
                          Comparar com atual
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            loadHistoryEntry(entry);
                          }}
                        >
                          Carregar este report
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="card reveal d2">
            <header className="card-head">
              <h2 className="card-title">Comparacao de reports</h2>
            </header>
            <div className="card-body">
              {!reportAvailable ? (
                <div className="issue">
                  <p className="small muted">Carregue um report atual para comparar com os anteriores.</p>
                </div>
              ) : !selectedHistory || !historyDiff ? (
                <div className="issue">
                  <p className="small muted">Selecione um report salvo para comparar o estado antigo com o atual.</p>
                </div>
              ) : (
                <>
                  <div className="metrics">
                    <div className="metric">
                      <div className="value">{historyDiff.fixed.length}</div>
                      <div className="label">Consertados</div>
                    </div>
                    <div className="metric">
                      <div className="value">{historyDiff.unresolved.length}</div>
                      <div className="label">Ainda abertos</div>
                    </div>
                    <div className="metric">
                      <div className="value">{historyDiff.added.length}</div>
                      <div className="label">Novos</div>
                    </div>
                    <div className="metric">
                      <div className="value">{selectedHistory.summary.totalIssues - (report?.summary.totalIssues ?? 0)}</div>
                      <div className="label">Delta issues</div>
                    </div>
                  </div>

                  <div className="assistant-block">
                    <p className="small muted" style={{ marginTop: 0 }}>Resumo para leigo</p>
                    <p className="issue-detail">
                      Antes o site tinha {selectedHistory.summary.totalIssues} problemas nessa rodada. Agora ele tem {report?.summary.totalIssues ?? 0}.
                      Foram corrigidos {historyDiff.fixed.length}, continuam {historyDiff.unresolved.length} e apareceram {historyDiff.added.length} novos.
                    </p>
                  </div>

                  <div className="comparison-grid">
                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>Para dev</p>
                      <ul className="assistant-list">
                        {historyDiff.unresolved.slice(0, 8).map((item, idx) => (
                          <li key={`unresolved-${idx}`}>
                            [{item.code}] {item.route} {item.action ? `-> ${item.action}` : ""} | {item.detail}
                          </li>
                        ))}
                        {!historyDiff.unresolved.length ? <li>Nenhum problema antigo ainda pendente.</li> : null}
                      </ul>
                    </div>

                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>Para IA</p>
                      <div className="code-box mono">{historyAiPrompt || "Sem prompt de comparacao disponivel."}</div>
                      <div className="btn-row" style={{ marginTop: 8 }}>
                        <button type="button" className="btn-warn" onClick={() => void copyText(historyAiPrompt, "comparison prompt copied")}>
                          Copiar prompt de comparacao
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="comparison-grid">
                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>O que foi consertado</p>
                      <ul className="assistant-list">
                        {historyDiff.fixed.slice(0, 8).map((item, idx) => (
                          <li key={`fixed-${idx}`}>
                            [{item.code}] {item.route} {item.action ? `-> ${item.action}` : ""} | {item.detail}
                          </li>
                        ))}
                        {!historyDiff.fixed.length ? <li>Nenhum item marcado como corrigido nessa comparacao.</li> : null}
                      </ul>
                    </div>

                    <div className="assistant-block">
                      <p className="small muted" style={{ marginTop: 0 }}>O que apareceu de novo</p>
                      <ul className="assistant-list">
                        {historyDiff.added.slice(0, 8).map((item, idx) => (
                          <li key={`added-${idx}`}>
                            [{item.code}] {item.route} {item.action ? `-> ${item.action}` : ""} | {item.detail}
                          </li>
                        ))}
                        {!historyDiff.added.length ? <li>Nenhum problema novo apareceu nessa comparacao.</li> : null}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={(
        <main className="page-shell">
          <section className="login-shell">
            <article className="login-card">
              <div className="login-body">
                <p className="small muted">Loading SitePulse Hub...</p>
              </div>
            </article>
          </section>
        </main>
      )}
    >
      <PageContent />
    </Suspense>
  );
}
