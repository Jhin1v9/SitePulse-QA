"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

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
    },
    issues,
  };
}

function severityLabel(severity: Severity) {
  if (severity === "high") return "alto";
  if (severity === "medium") return "medio";
  return "baixo";
}

function expectedAction(issue: IssueModel) {
  if (issue.code === "BTN_NO_EFFECT") {
    return "Ao clicar, o botao deve executar uma acao visivel (abrir, navegar, enviar, confirmar).";
  }
  if (issue.code === "BTN_CLICK_ERROR") {
    return "Ao clicar, o botao deve concluir a funcao sem erro de script.";
  }
  if (issue.code === "ROUTE_LOAD_FAIL") {
    return "A rota deve abrir dentro do tempo esperado.";
  }
  if (issue.code === "HTTP_4XX" || issue.code === "HTTP_5XX") {
    return "A chamada deveria retornar sucesso (2xx) para o fluxo principal.";
  }
  if (issue.code === "NET_REQUEST_FAILED") {
    return "A comunicacao com o servidor deveria acontecer sem queda de rede.";
  }
  if (issue.code === "VISUAL_SECTION_ORDER_INVALID") {
    return "As secoes devem aparecer na ordem correta para nao confundir o usuario.";
  }
  if (issue.code === "VISUAL_SECTION_MISSING") {
    return "A secao obrigatoria deveria estar visivel.";
  }
  if (issue.code === "AUDIT_ENGINE_UNAVAILABLE") {
    return "A auditoria completa deveria rodar com navegador automatizado.";
  }
  return "O fluxo deveria completar sem erro funcional.";
}

function currentAction(issue: IssueModel) {
  if (issue.action) return issue.action;
  return issue.detail;
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

function ReportPageContent() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("foco");
  const [report, setReport] = useState<ReportModel | null>(null);
  const [rawText, setRawText] = useState("");
  const [showDev, setShowDev] = useState(false);
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
    <main className="page-shell">
      <div className="noise" />
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <section className="report-wrap">
        <header className="topbar reveal">
          <div className="brand">
            <div className="brand-mark">SP</div>
            <div>
              <h1 className="brand-title">Relatorio detalhado</h1>
              <p className="brand-sub">Leitura completa do resultado em linguagem simples.</p>
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

        <article className="card report-card reveal d2">
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
          </div>
        </article>

        <article id="sec-routes" className="card report-card reveal d2">
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

        <article id="sec-buttons" className="card report-card reveal d3">
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

        <article id="sec-actions" className="card report-card reveal d3">
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

        <article id="sec-issues" className="card report-card reveal d3">
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
                issuesFiltered.map((issue) => (
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
                        {issue.assistantHint.firstChecks?.length ? (
                          <ul className="assistant-list">
                            {issue.assistantHint.firstChecks.map((line, idx) => (
                              <li key={`${issue.id}-dev-check-${idx}`}>{line}</li>
                            ))}
                          </ul>
                        ) : null}
                        {issue.assistantHint.commandHints?.length ? (
                          <div className="code-box mono">{issue.assistantHint.commandHints.join("\n")}</div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </article>

        <article id="sec-seo" className="card report-card reveal d3">
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

        <article id="sec-risk" className="card report-card reveal d3">
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

        {showDev ? (
          <article className="card report-card reveal">
            <header className="card-head">
              <h2 className="card-title">JSON tecnico bruto</h2>
            </header>
            <div className="card-body">
              <div className="code-box mono">{rawText || "Sem JSON bruto carregado."}</div>
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
