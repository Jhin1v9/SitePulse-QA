import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";
type Severity = "high" | "medium" | "low";
type Priority = "P0" | "P1" | "P2";

type AuditRunResponse = {
  ok: boolean;
  paused?: boolean;
  summary?: Record<string, unknown>;
  jsonReport?: string;
  markdownReport?: string;
  issueLog?: string;
  assistantBrief?: string;
};

type Issue = {
  id: string;
  code: string;
  severity: Severity;
  route: string;
  action: string;
  detail: string;
  recommendedResolution: string;
  assistantHint: {
    priority: Priority;
    firstChecks: string[];
    commandHints: string[];
    likelyAreas: string[];
  };
};

type FallbackReport = {
  meta: {
    project: string;
    baseUrl: string;
    generatedAt: string;
    finishedAt: string;
    replayCommand: string;
    mode: Mode;
    fallback: true;
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
  issues: Issue[];
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function nowIso() {
  return new Date().toISOString();
}

function issueId(seed: string) {
  return crypto.createHash("sha1").update(seed).digest("hex").slice(0, 12);
}

function trimText(value: string, maxLen = 1200) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}...`;
}

function stripAnsi(value: string) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function parseJsonTail(stdout: string): AuditRunResponse | null {
  const text = stdout.trim();
  let cursor = text.lastIndexOf("{");
  while (cursor >= 0) {
    const slice = text.slice(cursor);
    try {
      return JSON.parse(slice) as AuditRunResponse;
    } catch {
      cursor = text.lastIndexOf("{", cursor - 1);
    }
  }
  return null;
}

function classifyRunnerFailure(detail: string) {
  const lower = detail.toLowerCase();
  if (lower.includes("cannot find package 'playwright'") || lower.includes("cannot find module 'playwright'")) {
    return "playwright_missing";
  }
  if (lower.includes("executable doesn't exist") || lower.includes("browsertype.launch")) {
    return "chromium_missing";
  }
  if (lower.includes("spawn") && (lower.includes("enoent") || lower.includes("eacces"))) {
    return "spawn_failed";
  }
  if (lower.includes("not allowed") || lower.includes("operation not permitted")) {
    return "runtime_restricted";
  }
  return "runner_failed";
}

function makeIssue(input: {
  code: string;
  severity: Severity;
  route?: string;
  action?: string;
  detail: string;
  recommendedResolution: string;
  priority: Priority;
  firstChecks: string[];
  commandHints?: string[];
  likelyAreas?: string[];
}): Issue {
  return {
    id: issueId(`${input.code}|${input.route ?? "/"}|${input.action ?? ""}|${input.detail}`),
    code: input.code,
    severity: input.severity,
    route: input.route ?? "/",
    action: input.action ?? "",
    detail: input.detail,
    recommendedResolution: input.recommendedResolution,
    assistantHint: {
      priority: input.priority,
      firstChecks: input.firstChecks,
      commandHints: input.commandHints ?? [],
      likelyAreas: input.likelyAreas ?? [],
    },
  };
}

function countByCode(issues: Issue[], code: string) {
  return issues.filter((item) => item.code === code).length;
}

async function buildFallbackReport(input: {
  baseUrl: string;
  mode: Mode;
  replayCommand: string;
  runnerFailureKind: string;
  runnerFailureDetail: string;
}): Promise<FallbackReport> {
  const finalUrl = input.baseUrl;
  const issues: Issue[] = [];
  let buttonsChecked = 0;
  let statusCode = 0;
  let responsePath = input.baseUrl;
  const failureSnippet = input.runnerFailureDetail
    ? ` | detalhe: ${trimText(input.runnerFailureDetail, 220)}`
    : "";

  issues.push(
    makeIssue({
      code: "AUDIT_ENGINE_UNAVAILABLE",
      severity: "medium",
      action: "runtime",
      detail: `Runner browser indisponivel (${input.runnerFailureKind}). Foi ativado fallback HTTP.${failureSnippet}`,
      recommendedResolution:
        "Use o botao 'Rodar via CMD (janela)' no Windows local para auditoria completa de botoes, runtime e ordem visual.",
      priority: "P1",
      firstChecks: [
        "Se o deploy for Vercel, considere o fallback como leitura inicial, nao auditoria total.",
        "Para auditoria completa, execute o comando direto em maquina Windows com Playwright instalado.",
        "Importe o JSON completo no Hub apos rodar local.",
      ],
      commandHints: [
        `npm --prefix qa run audit:cmd -- --base-url "${input.baseUrl}" --no-server --fresh --live-log --human-log`,
      ],
      likelyAreas: ["qa/src/index.mjs", "app/api/run-plan/route.ts"],
    }),
  );

  try {
    const response = await fetch(finalUrl, {
      redirect: "follow",
      cache: "no-store",
      headers: {
        "user-agent": "SitePulse-Hub-Fallback/1.0",
      },
    });

    statusCode = response.status;
    responsePath = response.url || finalUrl;
    const detail = `${statusCode} GET ${responsePath}`;
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) {
      const html = await response.text();
      const matchButtons = html.match(/<button\b/gi);
      buttonsChecked = matchButtons?.length ?? 0;
    }

    if (statusCode >= 500) {
      issues.push(
        makeIssue({
          code: "HTTP_5XX",
          severity: "high",
          action: "fallback_http_probe",
          detail,
          recommendedResolution:
            "Investigar backend/dependencias para erro 5xx e validar com nova rodada da auditoria completa.",
          priority: "P0",
          firstChecks: [
            "Capturar logs do backend na mesma janela de tempo.",
            "Validar payload e dependencias do endpoint alvo.",
            "Aplicar tratamento de erro consistente no servidor.",
          ],
          commandHints: [
            "rg -n \"throw new Error|try\\s*\\{|catch\\s*\\(\" src/app/api src/lib",
          ],
          likelyAreas: ["src/app/api/**/route.ts", "src/lib/**"],
        }),
      );
    } else if (statusCode >= 400) {
      issues.push(
        makeIssue({
          code: "HTTP_4XX",
          severity: "medium",
          action: "fallback_http_probe",
          detail,
          recommendedResolution:
            "Conferir contrato da API, permissao e formato dos dados enviados pela interface.",
          priority: "P1",
          firstChecks: [
            "Validar URL, metodo e headers da requisicao.",
            "Conferir autenticacao/autorizacao.",
            "Revisar schema de payload esperado.",
          ],
          commandHints: [
            "rg -n \"fetch\\(|axios|Authorization|Content-Type\" src",
            "rg -n \"zod|schema|safeParse|parse\\(\" src",
          ],
          likelyAreas: ["src/components/**", "src/app/api/**/route.ts", "src/lib/**"],
        }),
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "request_failed";
    issues.push(
      makeIssue({
        code: "NET_REQUEST_FAILED",
        severity: "medium",
        action: "fallback_http_probe",
        detail: trimText(`GET ${finalUrl} :: ${message}`),
        recommendedResolution:
          "Verificar disponibilidade da URL, DNS/CORS/TLS e rerodar auditoria completa em ambiente local.",
        priority: "P1",
        firstChecks: [
          "Checar se a URL responde no navegador.",
          "Confirmar protocolo correto (https/http).",
          "Validar bloqueios de rede/firewall.",
        ],
        commandHints: [
          "rg -n \"baseUrl|API_URL|NEXT_PUBLIC\" src",
        ],
        likelyAreas: ["src/lib/**", "src/components/**"],
      }),
    );
  }

  const replayCommand = input.replayCommand;
  const immediateSteps = [
    "Leia primeiro issues P0/P1 do painel.",
    "Use fallback HTTP como triagem inicial.",
    "Rode via CMD local para auditoria total com cliques e layout.",
  ];

  const quickStartPrompt = [
    "Atue como engenheiro senior com foco em causa raiz.",
    "Esta rodada foi fallback HTTP no servidor (runner browser indisponivel).",
    "Use os erros mapeados para corrigir backend/rede primeiro.",
    "Depois execute auditoria completa local via CMD para validar botoes e secoes.",
    `Replay local: ${replayCommand}`,
  ].join("\n");

  return {
    meta: {
      project: "sitepulse-fallback-http-report",
      baseUrl: input.baseUrl,
      generatedAt: nowIso(),
      finishedAt: nowIso(),
      replayCommand,
      mode: input.mode,
      fallback: true,
    },
    summary: {
      routesChecked: 1,
      buttonsChecked,
      totalIssues: issues.length,
      visualSectionOrderInvalid: countByCode(issues, "VISUAL_SECTION_ORDER_INVALID"),
      buttonsNoEffect: countByCode(issues, "BTN_NO_EFFECT"),
      consoleErrors: countByCode(issues, "CONSOLE_ERROR"),
    },
    assistantGuide: {
      replayCommand,
      immediateSteps,
      quickStartPrompt,
    },
    issues,
  };
}

async function runAudit(baseUrl: string, mode: Mode) {
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const command = `npm --prefix qa run audit:cmd -- --config "${config}" --base-url "${baseUrl}" --no-server`;
  const startedAt = nowIso();
  const startedMs = Date.now();
  const runtimeEnv = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "0",
  };

  const qaDir = path.resolve(process.cwd(), "qa");
  const args = [
    "src/index.mjs",
    "--config",
    config,
    "--fresh",
    "--live-log",
    "--human-log",
    "--base-url",
    baseUrl,
    "--no-server",
  ];

  let spawnError = "";
  const child = spawn(process.execPath, args, {
    cwd: qaDir,
    env: runtimeEnv,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += String(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });

  const exitCode = await new Promise<number>((resolve) => {
    child.on("close", (code) => resolve(typeof code === "number" ? code : 1));
    child.on("error", (error) => {
      spawnError = error instanceof Error ? error.message : String(error);
      resolve(1);
    });
  });

  const parsed = parseJsonTail(stdout);
  let report: unknown = null;
  if (parsed?.jsonReport) {
    const reportPath = path.isAbsolute(parsed.jsonReport)
      ? parsed.jsonReport
      : path.resolve(qaDir, parsed.jsonReport);
    const raw = await fs.readFile(reportPath, "utf8");
    report = JSON.parse(raw);
  }

  const steps = [
    "URL validada.",
    "Auditoria executada para a URL informada.",
    "Relatorio consolidado com severidade e recomendacoes.",
  ];

  if (report) {
    return {
      ok: true,
      clean: exitCode === 0,
      exitCode,
      mode,
      command,
      startedAt,
      finishedAt: nowIso(),
      durationMs: Date.now() - startedMs,
      steps,
      report,
      summary: parsed?.summary ?? null,
    };
  }

  const rawFailure = [spawnError, stderr, stdout.split("\n").slice(-20).join("\n")]
    .filter(Boolean)
    .join("\n");
  const runnerFailureDetail = trimText(stripAnsi(rawFailure), 1200);
  const runnerFailureKind = classifyRunnerFailure(runnerFailureDetail);
  const fallbackReport = await buildFallbackReport({
    baseUrl,
    mode,
    replayCommand: command,
    runnerFailureKind,
    runnerFailureDetail,
  });

  return {
    ok: true,
    clean: false,
    exitCode,
    mode,
    command,
    startedAt,
    finishedAt: nowIso(),
    durationMs: Date.now() - startedMs,
    steps: [
      "URL validada.",
      "Runner browser falhou no servidor; fallback HTTP ativado.",
      "Relatorio fallback gerado. Rode via CMD local para auditoria completa.",
    ],
    report: fallbackReport,
    summary: fallbackReport.summary,
    usedFallback: true,
    error: "audit_engine_unavailable",
    detail: runnerFailureDetail,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const baseUrl = String(body?.baseUrl ?? "").trim();
  const mode: Mode = body?.mode === "mobile" ? "mobile" : "desktop";

  if (!baseUrl) {
    return NextResponse.json({ ok: false, error: "baseUrl is required" }, { status: 400 });
  }
  try {
    // Validate URL to avoid passing malformed values to runner.
    // eslint-disable-next-line no-new
    new URL(baseUrl);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid baseUrl" }, { status: 400 });
  }

  try {
    const payload = await runAudit(baseUrl, mode);
    const status = payload.report ? 200 : 500;
    return NextResponse.json(payload, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json(
      {
        ok: false,
        error: "run_plan_failed",
        detail: message,
      },
      { status: 500 },
    );
  }
}
