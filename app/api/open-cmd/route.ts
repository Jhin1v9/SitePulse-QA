import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeQuoted(value: string) {
  return value.replace(/"/g, '""');
}

function singleQuotedPowerShell(value: string) {
  return value.replace(/'/g, "''");
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
    `node ${runnerEntry} --config "${config}" --fresh --live-log --human-log --base-url "${safeQuoted(baseUrl)}"${noServer ? " --no-server" : ""}${headed ? " --headed" : ""}`,
  ];
  const runner = cmdParts.join(" && ");
  const argList = `/k "${safeQuoted(runner)}"`;
  const nonElevatedPsScript = `Start-Process -FilePath 'cmd.exe' -ArgumentList '${singleQuotedPowerShell(argList)}'`;
  const recommendedCommand = `cd /d "${qaDir}" && node ${runnerEntry.replace(/\\/g, "/")} --config "${config}" --fresh --live-log --human-log --base-url "${baseUrl}"${noServer ? " --no-server" : ""}${headed ? " --headed" : ""}`;

  let launchPreview = `powershell -NoProfile -ExecutionPolicy Bypass -Command "${nonElevatedPsScript}"`;
  if (elevated) {
    launchPreview = `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList '${singleQuotedPowerShell(argList)}'"`;
  }

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      message: "Dry run: comando de CMD gerado com sucesso.",
      mode,
      command: launchPreview,
      fullAudit,
      elevated,
      recommendedCommand,
      dryRun: true,
    });
  }

  let child;
  if (elevated) {
    const psScript = `Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList '${singleQuotedPowerShell(argList)}'`;
    child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
  } else {
    child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", nonElevatedPsScript], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
  }
  child.unref();

  return NextResponse.json({
    ok: true,
    message: elevated
      ? "Solicitacao de CMD admin enviada (UAC). Confirme a permissao para iniciar auditoria completa."
      : "Janela do CMD aberta com a auditoria configurada.",
    mode,
    fullAudit,
    elevated,
    command: launchPreview,
    recommendedCommand,
  });
}
