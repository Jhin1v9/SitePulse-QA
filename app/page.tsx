"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";

type Mode = "desktop" | "mobile";
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

type RunPlanResponse = {
  ok: boolean;
  mode: Mode;
  command: string;
  startedAt: string;
  steps: string[];
  error?: string;
};

const DEFAULT_URL = "https://projeto-web-profissional-kuruma-net.vercel.app";
const DEMO_USERS = [
  { username: "admin", password: "admin123" },
  { username: "mobile", password: "mobile123" },
];

const ISSUE_GROUP: Record<string, string> = {
  ROUTE_LOAD_FAIL: "Flow break",
  BTN_CLICK_ERROR: "Broken interaction",
  BTN_NO_EFFECT: "Unexpected or missing action",
  HTTP_4XX: "API contract/auth issue",
  HTTP_5XX: "Backend failure",
  NET_REQUEST_FAILED: "Network/CORS/connectivity",
  JS_RUNTIME_ERROR: "Frontend runtime",
  CONSOLE_ERROR: "Frontend runtime",
  VISUAL_SECTION_ORDER_INVALID: "Visual and functional layout",
  VISUAL_SECTION_MISSING: "Visual and functional layout",
};

function nowIso() {
  return new Date().toISOString();
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
      baseUrl: String(metaObj.baseUrl ?? source.baseUrl ?? DEFAULT_URL),
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
      replayCommand: String(
        guideObj.replayCommand ??
          metaObj.replayCommand ??
          `node src/index.mjs --config "audit.kuruma.${String(source.mode) === "mobile" ? "mobile" : "json"}" --fresh --live-log --human-log`
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

function makeCommand(mode: Mode, targetUrl: string, noServer: boolean, headed: boolean) {
  const config = mode === "mobile" ? "audit.kuruma.mobile.json" : "audit.kuruma.json";
  const parts = [
    "npm --prefix qa run audit:cmd --",
    `--config "${config}"`,
    "--fresh",
    "--live-log",
    "--human-log",
    `--base-url "${targetUrl}"`,
  ];
  if (noServer) parts.push("--no-server");
  if (headed) parts.push("--headed");
  return parts.join(" ");
}

function wizardCommand(mode: Mode, targetUrl: string, noServer: boolean, headed: boolean) {
  const parts = [
    "npm --prefix qa run audit:hub --",
    `--mode ${mode}`,
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
  if (health === "ok") return { label: "API healthy", className: "dot ok" };
  if (health === "bad") return { label: "API offline/error", className: "dot bad" };
  return { label: "API not checked", className: "dot" };
}

function PageContent() {
  const searchParams = useSearchParams();
  const autoLogin = searchParams.get("autologin") === "1";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [mode, setMode] = useState<Mode>("desktop");
  const [targetUrl, setTargetUrl] = useState(DEFAULT_URL);
  const [noServer, setNoServer] = useState(true);
  const [headed, setHeaded] = useState(false);

  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(["[hub] ready"]);
  const [report, setReport] = useState<ReportModel | null>(null);
  const [reportRaw, setReportRaw] = useState<unknown>(null);
  const [health, setHealth] = useState<"idle" | "ok" | "bad">("idle");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const [search, setSearch] = useState("");
  const [jsonPaste, setJsonPaste] = useState("");
  const [actionPulse, setActionPulse] = useState(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoLoginAppliedRef = useRef(false);

  const directCmd = useMemo(() => makeCommand(mode, targetUrl, noServer, headed), [mode, targetUrl, noServer, headed]);
  const guidedCmd = useMemo(() => wizardCommand(mode, targetUrl, noServer, headed), [mode, targetUrl, noServer, headed]);

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

  function pushLog(line: string) {
    setLogs((prev) => [`${new Date().toLocaleTimeString()} ${line}`, ...prev].slice(0, 140));
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

  async function loadDemoReport() {
    const res = await fetch(`/api/demo-report?mode=${mode}`, { cache: "no-store" });
    const data = await res.json();
    const normalized = normalizeReport(data);
    setReportRaw(data);
    setReport(normalized);
    setSeverityFilter("all");
    setSearch("");
    pushLog(`[report] demo loaded (${normalized.issues.length} issues)`);
    return normalized;
  }

  async function runPlan() {
    if (!targetUrl.trim()) return;
    setRunning(true);
    setProgress(0);
    setReport(null);
    setReportRaw(null);
    setLogs([]);
    pushLog("[run] starting plan");
    try {
      const res = await fetch("/api/run-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          baseUrl: targetUrl.trim(),
          mode,
        }),
      });
      const payload = (await res.json()) as RunPlanResponse;
      if (!res.ok || !payload.ok) throw new Error(payload.error ?? "run_plan_failed");

      const steps = payload.steps ?? [];
      const total = Math.max(steps.length, 1);
      for (let i = 0; i < steps.length; i += 1) {
        pushLog(`[step] ${steps[i]}`);
        setProgress(Math.round(((i + 1) / total) * 82));
        await wait(450);
      }

      await loadDemoReport();
      setProgress(100);
      pushLog("[run] completed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown_error";
      pushLog(`[run] failed: ${message}`);
      setProgress(0);
    } finally {
      setRunning(false);
    }
  }

  function applyReport(raw: unknown, source: string) {
    try {
      const normalized = normalizeReport(raw);
      setReportRaw(raw);
      setReport(normalized);
      setSeverityFilter("all");
      setSearch("");
      pushLog(`[report] imported from ${source}`);
    } catch {
      pushLog("[report] invalid json");
    }
  }

  async function onReportFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      applyReport(parsed, file.name);
    } catch {
      pushLog("[report] could not parse selected file");
    } finally {
      event.target.value = "";
    }
  }

  function importFromPaste() {
    if (!jsonPaste.trim()) return;
    try {
      const parsed = JSON.parse(jsonPaste);
      applyReport(parsed, "paste");
    } catch {
      pushLog("[report] paste is not valid json");
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
              <p>Built for rapid detection of missing, unexpected and broken actions.</p>
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
                  Enter command center
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
        <header className="topbar reveal">
          <div className="brand">
            <div className="brand-mark">SP</div>
            <div>
              <h1 className="brand-title">SitePulse Hub</h1>
              <p className="brand-sub">High signal dashboard for audits, unexpected actions and root-cause playbooks.</p>
              <p className="small muted" style={{ margin: "2px 0 0" }}>ui pulse: {actionPulse}</p>
            </div>
          </div>
          <div className="chip-row">
            <span className="chip">
              <span className={healthChip.className} />
              {healthChip.label}
            </span>
            <span className="chip">
              <span className="dot ok" />
              mode: {mode}
            </span>
            <span className="chip">
              <span className={running ? "dot" : "dot ok"} />
              {running ? "run active" : "idle"}
            </span>
          </div>
        </header>

        <section className="dashboard">
          <article className="card reveal d2">
            <header className="card-head">
              <h2 className="card-title">Control Center</h2>
            </header>
            <div className="card-body">
              <div className="field">
                <label>Target URL</label>
                <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://your-site.com" />
              </div>

              <div className="field">
                <label>Viewport mode</label>
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

              <label className="checkbox">
                <input type="checkbox" checked={noServer} onChange={(e) => setNoServer(e.target.checked)} />
                use --no-server (external URL mode)
              </label>
              <label className="checkbox">
                <input type="checkbox" checked={headed} onChange={(e) => setHeaded(e.target.checked)} />
                headed browser mode
              </label>

              <div className="btn-row">
                <button className="btn-primary" type="button" disabled={running} onClick={runPlan}>
                  {running ? "Running plan..." : "Run plan (demo flow)"}
                </button>
                <button className="btn-secondary" type="button" onClick={checkHealth}>
                  Check API
                </button>
              </div>

              <div className="btn-row">
                <button type="button" onClick={() => void loadDemoReport()}>
                  Load demo report
                </button>
                <button type="button" onClick={() => fileInputRef.current?.click()}>
                  Import JSON file
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: "none" }}
                onChange={onReportFileChange}
              />

              <div className="field">
                <label>Paste JSON report</label>
                <textarea
                  rows={5}
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                  placeholder='Paste full report JSON here and click "Apply pasted JSON".'
                />
              </div>
              <div className="btn-row">
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={importFromPaste}
                  disabled={!pasteReady}
                >
                  Apply pasted JSON
                </button>
              </div>
            </div>
          </article>

          <article className="card reveal d3">
            <header className="card-head">
              <h2 className="card-title">Live Run + Metrics</h2>
            </header>
            <div className="card-body">
              <div className="metrics">
                <div className="metric">
                  <div className="value">{report?.summary.routesChecked ?? 0}</div>
                  <div className="label">Routes</div>
                </div>
                <div className="metric">
                  <div className="value">{report?.summary.buttonsChecked ?? 0}</div>
                  <div className="label">Buttons</div>
                </div>
                <div className="metric">
                  <div className="value">{report?.summary.totalIssues ?? 0}</div>
                  <div className="label">Issues</div>
                </div>
                <div className="metric">
                  <div className="value">{riskScore}</div>
                  <div className="label">Risk score</div>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Progress
                </p>
                <div className="progress">
                  <div style={{ width: `${progress}%` }} />
                </div>
                <p className="small muted" style={{ margin: "7px 0 0" }}>
                  {progress}% complete
                </p>
              </div>

              <div className="legend">
                <span className="pill pill-high">high {severityCounts.high}</span>
                <span className="pill pill-medium">medium {severityCounts.medium}</span>
                <span className="pill pill-low">low {severityCounts.low}</span>
                <span className="pill">visual order invalid {report?.summary.visualSectionOrderInvalid ?? 0}</span>
                <span className="pill">no effect buttons {report?.summary.buttonsNoEffect ?? 0}</span>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Run log
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
                    <option value="all">all</option>
                    <option value="high">high</option>
                    <option value="medium">medium</option>
                    <option value="low">low</option>
                  </select>
                </div>
                <div className="field" style={{ minWidth: 280 }}>
                  <label>Search issue text</label>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="code, route, action or detail..." />
                </div>
              </div>

              <div className="issues-grid">
                {!reportAvailable ? (
                  <div className="issue">
                    <p className="small muted">No report loaded yet. Run plan or import a JSON report.</p>
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="issue">
                    <p className="small muted">No issue matches current filters.</p>
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
                      <p className="issue-meta">Recommended resolution: {issue.recommendedResolution}</p>
                      {issue.assistantHint.firstChecks?.length ? (
                        <div className="assistant-block">
                          <p className="small muted" style={{ marginTop: 0 }}>
                            First checks
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
                            Command hints
                          </p>
                          <div className="code-box mono">{issue.assistantHint.commandHints.join("\n")}</div>
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
              <h2 className="card-title">CMD + Assistant</h2>
            </header>
            <div className="card-body">
              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Guided wizard command
                </p>
                <div className="code-box mono">{guidedCmd}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn-secondary" type="button" onClick={() => void copyText(guidedCmd, "guided cmd copied")}>
                    Copy guided CMD
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Direct command
                </p>
                <div className="code-box mono">{directCmd}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button type="button" onClick={() => void copyText(directCmd, "direct cmd copied")}>
                    Copy direct CMD
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Assistant immediate steps
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
                  Quick-start prompt
                </p>
                <div className="code-box mono">{report?.assistantGuide.quickStartPrompt ?? "No prompt yet."}</div>
                <div className="btn-row" style={{ marginTop: 8 }}>
                  <button className="btn-warn" type="button" onClick={() => void copyText(report?.assistantGuide.quickStartPrompt ?? "", "prompt copied")}>
                    Copy prompt
                  </button>
                </div>
              </div>

              <div>
                <p className="small muted" style={{ margin: "0 0 6px" }}>
                  Replay command
                </p>
                <div className="code-box mono">{report?.assistantGuide.replayCommand ?? "No replay command available."}</div>
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
                  Download current report JSON
                </button>
              </div>
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
