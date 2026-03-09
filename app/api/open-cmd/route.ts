import path from "node:path";
import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeQuoted(value: string) {
  return value.replace(/"/g, '""');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const baseUrl = String(body?.baseUrl ?? "").trim();
  const mode: Mode = body?.mode === "mobile" ? "mobile" : "desktop";
  const noServer = body?.noServer !== false;
  const headed = body?.headed === true;
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
    return NextResponse.json(
      {
        ok: false,
        error: "unsupported_platform",
        detail: "Abrir janela de CMD automatico funciona apenas em Windows local.",
      },
      { status: 400 }
    );
  }

  const qaDir = path.resolve(process.cwd(), "qa");
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";

  const cmdParts = [
    `cd /d "${safeQuoted(qaDir)}"`,
    `node src\\index.mjs --config "${config}" --fresh --live-log --human-log --base-url "${safeQuoted(baseUrl)}"${noServer ? " --no-server" : ""}${headed ? " --headed" : ""}`,
  ];
  const runner = cmdParts.join(" && ");
  const startCommand = `start "SitePulse QA" cmd /k "${safeQuoted(runner)}"`;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      message: "Dry run: comando de CMD gerado com sucesso.",
      mode,
      command: startCommand,
      dryRun: true,
    });
  }

  const child = spawn("cmd.exe", ["/c", startCommand], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();

  return NextResponse.json({
    ok: true,
    message: "Janela do CMD aberta com a auditoria configurada.",
    mode,
    command: startCommand,
  });
}
