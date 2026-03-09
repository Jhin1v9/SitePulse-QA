import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

function sample(mode: Mode) {
  return {
    meta: {
      project: "external-site-audit-demo",
      mode,
      generatedAt: new Date().toISOString(),
      baseUrl: "https://your-site.com",
      auditScope: "full",
    },
    summary: {
      auditScope: "full",
      routesChecked: 1,
      buttonsChecked: mode === "mobile" ? 10 : 18,
      actionsMapped: mode === "mobile" ? 10 : 18,
      actionsWithEffect: mode === "mobile" ? 8 : 14,
      actionsNoEffectDetected: 1,
      actionsFailed: 1,
      actionsAnalysisOnly: 0,
      seoScore: 82,
      seoPagesAnalyzed: 1,
      seoCriticalIssues: 1,
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
    actionSweep: [
      {
        id: "act-1",
        route: "/",
        label: "WhatsApp",
        kind: "link",
        href: "https://wa.me/5511999999999",
        expectedFunction: "Abrir contato via WhatsApp",
        expectedForUser: "Permite iniciar conversa imediata com a empresa.",
        actualFunction: "Navegou para link externo do WhatsApp.",
        status: "clicked_effect",
        statusLabel: "Executou com efeito visivel",
        detail: "",
      },
      {
        id: "act-2",
        route: "/",
        label: "Ver mais",
        kind: "button",
        href: "",
        expectedFunction: "Expandir detalhes ou abrir pagina complementar",
        expectedForUser: "Mostra mais informacoes sobre o servico.",
        actualFunction: "Clique ocorreu, mas sem efeito observavel.",
        status: "clicked_no_effect",
        statusLabel: "Clique sem efeito visivel",
        detail: "Nenhuma mudanca de URL/DOM/request apos clique.",
      },
    ],
    seo: {
      overallScore: 82,
      pagesAnalyzed: 1,
      categoryScore: {
        technical: 88,
        content: 74,
        accessibility: 84,
      },
      issues: [
        {
          code: "SEO_META_DESCRIPTION_MISSING",
          severity: "high",
          detail: "Meta description ausente.",
          recommendation: "Adicionar meta description unica para melhorar CTR organico.",
          count: 1,
          affectedRoutes: ["/"],
        },
        {
          code: "SEO_IMG_ALT_MISSING",
          severity: "medium",
          detail: "2/8 imagens sem alt.",
          recommendation: "Preencher alt descritivo nas imagens principais.",
          count: 2,
          affectedRoutes: ["/"],
        },
      ],
      topRecommendations: [
        "Adicionar meta description unica por pagina.",
        "Preencher atributo alt das imagens principais.",
      ],
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
