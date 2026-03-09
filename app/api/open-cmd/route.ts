import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { makePowerShellLaunchScript, runPowerShellLaunch } from "../../../qa/shared/windows-cmd-launch.js";

type Mode = "desktop" | "mobile";
type AuditScope = "full" | "seo" | "experience";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeQuoted(value: string) {
  return value.replace(/"/g, '""');
}

function normalizeAuditScope(value: unknown): AuditScope {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "seo") return "seo";
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) {
    return "experience";
  }
  return "full";
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const baseUrl = String(body?.baseUrl ?? "").trim();
  const mode: Mode = body?.mode === "mobile" ? "mobile" : "desktop";
  const noServer = body?.noServer !== false;
  const headed = body?.headed === true;
  const fullAudit = body?.fullAudit !== false;
  const elevated = body?.elevated === true;
  const dryRun = body?.dryRun === true;
  const scope = normalizeAuditScope(body?.scope);

  if (!baseUrl) {
    return NextResponse.json({ ok: false, error: "baseUrl is required" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid baseUrl" }, { status: 400 });
  }
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    return NextResponse.json({ ok: false, error: "only http/https are supported" }, { status: 400 });
  }

  if (process.platform !== "win32") {
    const configForCommand = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
    const recommendedCommand = [
      "npm --prefix qa run audit:cmd --",
      `--config "${configForCommand}"`,
      "--fresh",
      "--live-log",
      "--human-log",
      `--scope "${scope}"`,
      `--base-url "${safeQuoted(baseUrl)}"`,
      noServer ? "--no-server" : "",
      headed ? "--headed" : "",
    ]
      .filter(Boolean)
      .join(" ");
    return NextResponse.json(
      {
        ok: false,
        error: "unsupported_platform",
        detail:
          "Abrir janela de CMD automatico funciona apenas quando o app esta rodando localmente no Windows.",
        recommendation:
          "Rode o SitePulse local no Windows e use o botao de CMD, ou execute manualmente o comando recomendado.",
        recommendedCommand,
      },
      { status: 400 }
    );
  }

  const qaDir = path.resolve(process.cwd(), "qa");
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";

  const runnerEntry = fullAudit ? "src\\run-until-done.mjs" : "src\\index.mjs";
  const cmdParts = [
    `cd /d "${safeQuoted(qaDir)}"`,
    `node ${runnerEntry} --config "${config}" --fresh --live-log --human-log --scope "${scope}" --base-url "${safeQuoted(baseUrl)}"${noServer ? " --no-server" : ""}${headed ? " --headed" : ""}`,
  ];
  const runner = cmdParts.join(" && ");
  const argList = `/k "${safeQuoted(runner)}"`;
  const recommendedCommand = `cd /d "${qaDir}" && node ${runnerEntry.replace(/\\/g, "/")} --config "${config}" --fresh --live-log --human-log --scope "${scope}" --base-url "${baseUrl}"${noServer ? " --no-server" : ""}${headed ? " --headed" : ""}`;
  const psScript = makePowerShellLaunchScript(argList, elevated);

  const launchPreview = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"')}"`;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      message: "Dry run: comando de CMD gerado com sucesso.",
      mode,
      command: launchPreview,
      fullAudit,
      elevated,
      recommendedCommand,
      scope,
      dryRun: true,
    });
  }

  const launchResult = await runPowerShellLaunch(psScript);
  if (!launchResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: elevated ? "uac_request_failed" : "cmd_launch_failed",
        detail: elevated
          ? `O Windows nao confirmou a elevacao do CMD. Detalhe: ${launchResult.detail}`
          : `O Windows nao conseguiu abrir a janela de CMD. Detalhe: ${launchResult.detail}`,
        recommendation: elevated
          ? "Clique novamente e aceite o UAC. Se continuar sem abrir nada, desmarque 'Executar como administrador (UAC)' ou rode o comando manualmente em um CMD admin."
          : "Tente novamente ou execute o comando recomendado manualmente em um CMD local.",
        recommendedCommand,
        elevated,
        fullAudit,
        scope,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: elevated
      ? "Pedido de permissao do Windows confirmado. A janela de CMD admin foi solicitada."
      : "Janela do CMD aberta com a auditoria configurada.",
    mode,
    fullAudit,
    elevated,
    command: launchPreview,
    recommendedCommand,
    scope,
  });
}
