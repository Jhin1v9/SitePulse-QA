import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

function sample(mode: Mode) {
  return {
    meta: {
      project: "external-site-audit-demo",
      mode,
      generatedAt: new Date().toISOString(),
      baseUrl: "https://your-site.com",
    },
    summary: {
      routesChecked: 1,
      buttonsChecked: mode === "mobile" ? 10 : 18,
      totalIssues: 2,
      visualSectionOrderInvalid: 0,
      buttonsNoEffect: 1,
      consoleErrors: 1,
    },
    assistantGuide: {
      replayCommand:
        mode === "mobile"
          ? 'node src/index.mjs --config "audit.default.mobile.json" --fresh --live-log --human-log'
          : 'node src/index.mjs --config "audit.default.json" --fresh --live-log --human-log',
      immediateSteps: [
        "Corrigir botoes sem resposta primeiro.",
        "Depois corrigir erros do console.",
        "Rodar auditoria novamente para confirmar.",
      ],
      quickStartPrompt: [
        "Atue como engenheiro de software senior.",
        "Priorize problemas de alto impacto.",
        "Valide com nova auditoria ate totalIssues = 0.",
      ].join("\n"),
    },
    issues: [
      {
        id: "iss-1",
        code: "BTN_NO_EFFECT",
        severity: "medium",
        route: "/",
        action: "Botao principal",
        detail: "O clique nao gerou mudanca visivel (rota, DOM, request ou scroll).",
        recommendedResolution: "Ligar o botao a uma acao real e validar alvo/ID.",
        assistantHint: {
          priority: "P1",
          firstChecks: [
            "Confirmar se onClick existe.",
            "Verificar seletor/alvo correto.",
            "Checar se o botao nao esta desabilitado por estado.",
          ],
          commandHints: ['rg -n "onClick|scrollTo|router.push|href" app src'],
        },
      },
      {
        id: "iss-2",
        code: "CONSOLE_ERROR",
        severity: "low",
        route: "/",
        action: "route_load",
        detail: "Erro no console durante carregamento da pagina.",
        recommendedResolution: "Corrigir import/props nulos e validar fallback.",
        assistantHint: {
          priority: "P2",
          firstChecks: [
            "Abrir console e pegar stacktrace.",
            "Mapear arquivo/linha de origem.",
            "Aplicar correção e validar novamente.",
          ],
          commandHints: ['rg -n "console.error|throw new Error|undefined|null" app src'],
        },
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") === "mobile" ? "mobile" : "desktop";
  return NextResponse.json(sample(mode));
}
