import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

type AuditRunResponse = {
  ok: boolean;
  paused?: boolean;
  summary?: Record<string, unknown>;
  jsonReport?: string;
  markdownReport?: string;
  issueLog?: string;
  assistantBrief?: string;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

async function runAudit(baseUrl: string, mode: Mode) {
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const command = `npm --prefix qa run audit:cmd -- --config "${config}" --base-url "${baseUrl}" --no-server`;
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();

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

  const child = spawn(process.execPath, args, {
    cwd: qaDir,
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
    child.on("error", () => resolve(1));
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

  return {
    ok: exitCode === 0 || exitCode === 2,
    mode,
    command,
    startedAt,
    finishedAt: new Date().toISOString(),
    durationMs: Date.now() - startedMs,
    steps,
    report,
    summary: parsed?.summary ?? null,
    error: exitCode === 0 || exitCode === 2 ? undefined : "audit_failed",
    detail: exitCode === 0 || exitCode === 2 ? undefined : stderr.trim().slice(0, 800),
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
    const status = payload.ok ? 200 : 500;
    return NextResponse.json(payload, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json(
      {
        ok: false,
        error: "run_plan_failed",
        detail: message,
      },
      { status: 500 }
    );
  }
}
