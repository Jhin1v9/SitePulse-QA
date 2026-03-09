import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";
type AuditScope = "full" | "seo" | "experience";
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
    auditScope: AuditScope;
    fallback: true;
  };
  summary: {
    auditScope: AuditScope;
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
    seoTotalIssues: number;
  };
  assistantGuide: {
    replayCommand: string;
    immediateSteps: string[];
    quickStartPrompt: string;
  };
  actionSweep: Array<Record<string, unknown>>;
  seo: {
    overallScore: number;
    pagesAnalyzed: number;
    categoryScore: {
      technical: number;
      content: number;
      accessibility: number;
    };
    issues: Array<Record<string, unknown>>;
    topRecommendations: string[];
    checklist: Array<Record<string, unknown>>;
    fixPrompt: string;
    pages: Array<Record<string, unknown>>;
    skipped?: boolean;
    skippedReason?: string;
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

function normalizeAuditScope(value: unknown): AuditScope {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "seo") return "seo";
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) {
    return "experience";
  }
  return "full";
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

function cleanHtmlText(value: string) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function matchMetaContent(html: string, pattern: RegExp) {
  const match = html.match(pattern);
  return cleanHtmlText(match?.[1] ?? "");
}

function buildFallbackSeoFromHtml(html: string, pageUrl: string, enabled: boolean) {
  if (!enabled) {
    return {
      overallScore: 0,
      pagesAnalyzed: 0,
      categoryScore: { technical: 0, content: 0, accessibility: 0 },
      issues: [],
      topRecommendations: ["SEO ignorado nesta rodada pelo escopo selecionado."],
      checklist: [],
      fixPrompt: "",
      pages: [],
      skipped: true,
      skippedReason: "audit_scope_disabled_seo",
    };
  }

  const textContent = cleanHtmlText(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
  const words = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0;
  const title = cleanHtmlText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const metaDescription = matchMetaContent(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i,
  );
  const canonicalUrl = matchMetaContent(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["'][^>]*>/i,
  );
  const lang = cleanHtmlText(html.match(/<html[^>]+lang=["']([^"']+)["']/i)?.[1] ?? "");
  const robots = matchMetaContent(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  const imagesTotal = (html.match(/<img\b/gi) ?? []).length;
  const imagesMissingAlt = (html.match(/<img\b(?:(?!alt=)[^>])*>/gi) ?? []).length;
  const hasStructuredData = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
  const structuredDataCount = (html.match(/<script[^>]+type=["']application\/ld\+json["']/gi) ?? []).length;
  const internalLinks = (html.match(/<a\b[^>]+href=["'](\/|#)[^"']*["']/gi) ?? []).length;
  const ogTitle = matchMetaContent(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const ogDescription = matchMetaContent(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const ogImage = matchMetaContent(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const ogType = matchMetaContent(html, /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']*)["'][^>]*>/i);
  const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
  const hasMetaRobots = /<meta[^>]+name=["']robots["']/i.test(html);
  const robotsNoindex = /(^|[\s,])noindex([\s,]|$)/i.test(robots);

  const issues: Array<Record<string, unknown>> = [];
  let overall = 100;
  let technical = 100;
  let content = 100;
  let accessibility = 100;

  const applyPenalty = (input: {
    code: string;
    severity: Severity;
    category: "technical" | "content" | "accessibility";
    weight: number;
    detail: string;
    recommendation: string;
  }) => {
    issues.push({
      ...input,
      count: 1,
      affectedRoutes: ["/"],
    });
    overall = Math.max(0, overall - input.weight);
    if (input.category === "technical") technical = Math.max(0, technical - input.weight);
    if (input.category === "content") content = Math.max(0, content - input.weight);
    if (input.category === "accessibility") accessibility = Math.max(0, accessibility - input.weight);
  };

  if (!title) {
    applyPenalty({
      code: "SEO_TITLE_MISSING",
      severity: "high",
      category: "content",
      weight: 18,
      detail: "Pagina sem <title> definido.",
      recommendation: "Defina um title unico e claro para cada pagina.",
    });
  } else if (title.length < 30 || title.length > 65) {
    applyPenalty({
      code: "SEO_TITLE_LENGTH",
      severity: "medium",
      category: "content",
      weight: 6,
      detail: `Title com ${title.length} caracteres (ideal: 30-65).`,
      recommendation: "Ajuste o tamanho do title para melhorar leitura no Google.",
    });
  }

  if (!metaDescription) {
    applyPenalty({
      code: "SEO_META_DESCRIPTION_MISSING",
      severity: "high",
      category: "content",
      weight: 16,
      detail: "Meta description ausente.",
      recommendation: "Adicione meta description unica com proposta clara da pagina.",
    });
  }

  if (h1Count === 0) {
    applyPenalty({
      code: "SEO_H1_MISSING",
      severity: "high",
      category: "content",
      weight: 14,
      detail: "Nenhum H1 encontrado na pagina.",
      recommendation: "Inclua 1 H1 claro descrevendo o tema principal da pagina.",
    });
  }

  if (!lang) {
    applyPenalty({
      code: "SEO_LANG_MISSING",
      severity: "medium",
      category: "technical",
      weight: 7,
      detail: "Atributo lang ausente em <html>.",
      recommendation: "Defina lang no HTML para melhorar indexacao e acessibilidade.",
    });
  }

  if (!hasViewport) {
    applyPenalty({
      code: "SEO_VIEWPORT_MISSING",
      severity: "high",
      category: "technical",
      weight: 10,
      detail: "Meta viewport ausente.",
      recommendation: "Adicione meta viewport para boa experiencia mobile.",
    });
  }

  if (!canonicalUrl) {
    applyPenalty({
      code: "SEO_CANONICAL_MISSING",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: "Link canonical ausente.",
      recommendation: "Defina canonical para evitar duplicidade de URL.",
    });
  }

  if (!hasMetaRobots) {
    applyPenalty({
      code: "SEO_META_ROBOTS_MISSING",
      severity: "low",
      category: "technical",
      weight: 3,
      detail: "Meta robots ausente.",
      recommendation: "Defina meta robots explicita para controle de indexacao.",
    });
  }

  if (robotsNoindex) {
    applyPenalty({
      code: "SEO_NOINDEX",
      severity: "high",
      category: "technical",
      weight: 25,
      detail: "Meta robots contem noindex.",
      recommendation: "Remova noindex das paginas que precisam aparecer no Google.",
    });
  }

  if (imagesTotal > 0 && imagesMissingAlt > 0) {
    applyPenalty({
      code: "SEO_IMG_ALT_MISSING",
      severity: imagesMissingAlt / imagesTotal >= 0.35 ? "high" : "medium",
      category: "accessibility",
      weight: imagesMissingAlt / imagesTotal >= 0.35 ? 16 : 8,
      detail: `${imagesMissingAlt}/${imagesTotal} imagens sem alt.`,
      recommendation: "Preencha atributo alt descritivo nas imagens relevantes.",
    });
  }

  if (!hasStructuredData) {
    applyPenalty({
      code: "SEO_STRUCTURED_DATA_MISSING",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: "Nenhum JSON-LD encontrado.",
      recommendation: "Considere schema.org relevante para melhorar rich results.",
    });
  }

  if (!(ogTitle && ogDescription && ogImage && ogType)) {
    applyPenalty({
      code: "SEO_OPEN_GRAPH_INCOMPLETE",
      severity: "medium",
      category: "content",
      weight: 6,
      detail: "Open Graph incompleto.",
      recommendation: "Complete as metas Open Graph para melhorar compartilhamento e CTR.",
    });
  }

  if (!hasTwitterCard) {
    applyPenalty({
      code: "SEO_TWITTER_CARD_MISSING",
      severity: "low",
      category: "content",
      weight: 3,
      detail: "Twitter Card ausente.",
      recommendation: "Adicione meta twitter:card e metadados sociais complementares.",
    });
  }

  if (words < 80) {
    applyPenalty({
      code: "SEO_CONTENT_THIN",
      severity: "medium",
      category: "content",
      weight: 7,
      detail: `Conteudo textual curto (${words} palavras).`,
      recommendation: "Adicione conteudo util e especifico sobre servico/local para SEO local.",
    });
  }

  if (internalLinks < 2) {
    applyPenalty({
      code: "SEO_INTERNAL_LINKS_LOW",
      severity: "low",
      category: "technical",
      weight: 4,
      detail: `Poucos links internos (${internalLinks}).`,
      recommendation: "Aumente links internos para melhorar rastreio e distribuicao de autoridade.",
    });
  }

  const topRecommendations = issues.slice(0, 8).map((item) => String(item.recommendation));
  const checklist = [
    {
      id: "titles",
      label: "Titulos e descriptions",
      why: "Controlam entendimento da pagina e CTR.",
      recommendation: title && metaDescription ? "Baseline OK nesta URL." : "Corrigir title e meta description.",
      status: title && metaDescription ? "pass" : "fail",
    },
    {
      id: "semantics",
      label: "H1, lang e viewport",
      why: "Ajudam semantica, mobile e indexacao.",
      recommendation: h1Count > 0 && lang && hasViewport ? "Baseline OK nesta URL." : "Corrigir semantica base e mobile hints.",
      status: h1Count > 0 && lang && hasViewport ? "pass" : "fail",
    },
    {
      id: "structured",
      label: "Schema, canonical e links internos",
      why: "Ajudam rastreio, canonicalizacao e rich results.",
      recommendation:
        canonicalUrl && hasStructuredData && internalLinks >= 2
          ? "Baseline OK nesta URL."
          : "Corrigir sinais tecnicos de SEO.",
      status: canonicalUrl && hasStructuredData && internalLinks >= 2 ? "pass" : "warn",
    },
  ];
  const fixPrompt = [
    "Atue como especialista SEO senior com foco em Search Central oficial do Google.",
    `URL auditada: ${pageUrl}`,
    `Score SEO atual: ${Math.max(0, Math.round(overall))}/100.`,
    "Corrija os gaps tecnicos e de conteudo abaixo com impacto real em indexacao, CTR e rich results.",
    "",
    ...issues.map(
      (issue, index) =>
        `${index + 1}. [${String(issue.code)}] ${String(issue.detail)} | recomendacao: ${String(issue.recommendation)}`,
    ),
    "",
    "Entrega obrigatoria:",
    "- listar arquivos alterados",
    "- explicar o motivo tecnico de cada ajuste",
    "- validar novamente e provar melhora de score",
  ].join("\n");

  return {
    overallScore: Math.max(0, Math.round(overall)),
    pagesAnalyzed: 1,
    categoryScore: {
      technical: Math.max(0, Math.round(technical)),
      content: Math.max(0, Math.round(content)),
      accessibility: Math.max(0, Math.round(accessibility)),
    },
    issues,
    topRecommendations,
    checklist,
    fixPrompt,
    pages: [
      {
        route: "/",
        url: pageUrl,
        title,
        metaDescription,
        canonicalUrl,
        lang,
        h1Count,
        imagesTotal,
        imagesMissingAlt,
        hasStructuredData,
        structuredDataCount,
        internalLinks,
        wordCount: words,
        score: Math.max(0, Math.round(overall)),
      },
    ],
  };
}

async function buildFallbackReport(input: {
  baseUrl: string;
  mode: Mode;
  scope: AuditScope;
  replayCommand: string;
  runnerFailureKind: string;
  runnerFailureDetail: string;
}): Promise<FallbackReport> {
  const finalUrl = input.baseUrl;
  const issues: Issue[] = [];
  const shouldAnalyzeSeo = input.scope !== "experience";
  const shouldAnalyzeExperience = input.scope !== "seo";
  let buttonsChecked = 0;
  let statusCode = 0;
  let responsePath = input.baseUrl;
  let html = "";
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
        `npm --prefix qa run audit:cmd -- --scope "${input.scope}" --base-url "${input.baseUrl}" --no-server --fresh --live-log --human-log`,
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
      html = await response.text();
      if (shouldAnalyzeExperience) {
        const matchButtons = html.match(/<button\b/gi);
        buttonsChecked = matchButtons?.length ?? 0;
      }
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
    shouldAnalyzeSeo ? "Use os sinais SEO HTTP como triagem inicial." : "Use fallback HTTP como triagem inicial.",
    shouldAnalyzeExperience
      ? "Rode via CMD local para auditoria total com cliques e layout."
      : "Se quiser validar cliques e comportamento, rode uma rodada de experience depois.",
  ];

  const quickStartPrompt = [
    "Atue como engenheiro senior com foco em causa raiz.",
    "Esta rodada foi fallback HTTP no servidor (runner browser indisponivel).",
    "Use os erros mapeados para corrigir backend/rede primeiro.",
    shouldAnalyzeExperience
      ? "Depois execute auditoria completa local via CMD para validar botoes e secoes."
      : "Depois execute uma rodada experience se precisar validar botoes, secoes e comportamento.",
    `Replay local: ${replayCommand}`,
  ].join("\n");

  const seo = buildFallbackSeoFromHtml(html, responsePath || input.baseUrl, shouldAnalyzeSeo);

  return {
    meta: {
      project: "sitepulse-fallback-http-report",
      baseUrl: input.baseUrl,
      generatedAt: nowIso(),
      finishedAt: nowIso(),
      replayCommand,
      mode: input.mode,
      auditScope: input.scope,
      fallback: true,
    },
    summary: {
      auditScope: input.scope,
      routesChecked: 1,
      buttonsChecked: shouldAnalyzeExperience ? buttonsChecked : 0,
      totalIssues: issues.length,
      visualSectionOrderInvalid: countByCode(issues, "VISUAL_SECTION_ORDER_INVALID"),
      buttonsNoEffect: countByCode(issues, "BTN_NO_EFFECT"),
      consoleErrors: countByCode(issues, "CONSOLE_ERROR"),
      actionsMapped: 0,
      actionsWithEffect: 0,
      actionsNoEffectDetected: 0,
      actionsFailed: 0,
      actionsAnalysisOnly: 0,
      seoScore: seo.overallScore,
      seoPagesAnalyzed: seo.pagesAnalyzed,
      seoCriticalIssues: seo.issues.filter((item) => String(item.severity) === "high").length,
      seoTotalIssues: seo.issues.length,
    },
    assistantGuide: {
      replayCommand,
      immediateSteps,
      quickStartPrompt,
    },
    actionSweep: [],
    seo,
    issues,
  };
}

async function runAudit(baseUrl: string, mode: Mode, scope: AuditScope, options: { noServer: boolean; headed: boolean }) {
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const commandParts = [
    "npm --prefix qa run audit:cmd --",
    `--config "${config}"`,
    `--scope "${scope}"`,
    `--base-url "${baseUrl}"`,
    options.noServer ? "--no-server" : "",
    options.headed ? "--headed" : "",
  ].filter(Boolean);
  const command = commandParts.join(" ");
  const startedAt = nowIso();
  const startedMs = Date.now();
  const forceServerlessChromium =
    process.platform === "linux"
      ? "1"
      : String(process.env.SITEPULSE_FORCE_SERVERLESS_CHROMIUM ?? "");
  const runtimeEnv = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "0",
    SITEPULSE_FORCE_SERVERLESS_CHROMIUM: forceServerlessChromium,
  };

  const qaDir = path.resolve(process.cwd(), "qa");
  const args = [
    "src/index.mjs",
    "--config",
    config,
    "--fresh",
    "--live-log",
    "--human-log",
    "--scope",
    scope,
    "--base-url",
    baseUrl,
  ];
  if (options.noServer) args.push("--no-server");
  if (options.headed) args.push("--headed");

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
    scope,
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
  const scope = normalizeAuditScope(body?.scope);
  const noServer = body?.noServer !== false;
  const headed = body?.headed === true;

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
    const payload = await runAudit(baseUrl, mode, scope, { noServer, headed });
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
