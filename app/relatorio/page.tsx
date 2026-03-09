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
  };
  assistantGuide: {
    replayCommand: string;
    immediateSteps: string[];
    quickStartPrompt: string;
  };
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

  const issuesRaw = Array.isArray(source.issues) ? source.issues : [];
  const issues = issuesRaw.map((issue, index) => normalizeIssue(issue, index));
  const bySeverityWeight = { high: 0, medium: 1, low: 2 } as const;
  issues.sort((a, b) => {
    const severityCmp = bySeverityWeight[a.severity] - bySeverityWeight[b.severity];
    if (severityCmp !== 0) return severityCmp;
    return a.code.localeCompare(b.code);
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
    },
    assistantGuide: {
      replayCommand: String(guideObj.replayCommand ?? metaObj.replayCommand ?? "indisponivel"),
      immediateSteps: Array.isArray(guideObj.immediateSteps)
        ? guideObj.immediateSteps.map((v) => String(v))
        : ["Comece por problemas P0/P1.", "Corrija causa raiz.", "Rode novamente para validar."],
      quickStartPrompt: String(guideObj.quickStartPrompt ?? "Sem prompt rapido nesta rodada."),
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

function ReportPageContent() {
  const searchParams = useSearchParams();
  const focus = searchParams.get("foco");
  const [report, setReport] = useState<ReportModel | null>(null);
  const [rawText, setRawText] = useState("");
  const [showDev, setShowDev] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

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
      : focus === "buttons"
      ? "sec-buttons"
      : focus === "issues"
      ? "sec-issues"
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
                <div className="value">{report.summary.buttonsChecked}</div>
                <div className="label">Botoes checados</div>
              </div>
              <div className="metric">
                <div className="value">{report.summary.totalIssues}</div>
                <div className="label">Problemas</div>
              </div>
              <div className="metric">
                <div className="value">{score}</div>
                <div className="label">Risco</div>
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
            <h2 className="card-title">Botoes</h2>
          </header>
          <div className="card-body">
            <p>
              Botoes checados: <strong>{report.summary.buttonsChecked}</strong>
            </p>
            <p>
              Botoes sem resposta: <strong>{report.summary.buttonsNoEffect}</strong>
            </p>
            <p className="small muted">
              Se houver falha de botao, veja a secao de problemas para comparar acao esperada vs acao atual.
            </p>
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
