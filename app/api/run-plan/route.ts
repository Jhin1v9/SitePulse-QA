import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const baseUrl = String(body?.baseUrl ?? "").trim();
  const mode: Mode = body?.mode === "mobile" ? "mobile" : "desktop";
  if (!baseUrl) {
    return NextResponse.json({ ok: false, error: "baseUrl is required" }, { status: 400 });
  }

  const config = mode === "mobile" ? "audit.kuruma.mobile.json" : "audit.kuruma.json";
  const command = `npm --prefix qa run audit:cmd -- --config "${config}" --base-url "${baseUrl}" --no-server`;

  const steps = [
    "Validar URL e modo de execucao.",
    "Rodar varredura de secoes visuais.",
    "Testar interacoes de botoes e requests.",
    "Consolidar issues + prompt pack + assistant guide.",
    "Gerar relatorios JSON, MD, LOG e Assistant Brief.",
  ];

  return NextResponse.json({
    ok: true,
    mode,
    command,
    startedAt: new Date().toISOString(),
    steps,
  });
}
