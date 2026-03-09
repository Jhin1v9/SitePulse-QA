import { NextRequest, NextResponse } from "next/server";

type Mode = "desktop" | "mobile";

function sample(mode: Mode) {
  return {
    meta: {
      project: "kuruma-site-home-audit",
      mode,
      generatedAt: new Date().toISOString(),
    },
    summary: {
      routesChecked: 1,
      buttonsChecked: mode === "mobile" ? 14 : 31,
      totalIssues: 3,
      visualSectionOrderInvalid: 1,
      buttonsNoEffect: 1,
      consoleErrors: 1,
    },
    assistantGuide: {
      replayCommand:
        mode === "mobile"
          ? 'node src/index.mjs --config "audit.kuruma.mobile.json" --fresh --live-log --human-log'
          : 'node src/index.mjs --config "audit.kuruma.json" --fresh --live-log --human-log',
      immediateSteps: [
        "Corrigir primeiro a ordem visual de secoes.",
        "Depois corrigir botoes sem efeito.",
        "Remover erro de console e revalidar.",
      ],
      quickStartPrompt: [
        "Atue como engenheiro de software senior com foco em causa raiz.",
        "Ataque: visual order -> buttons -> console.",
        "Revalide no final ate totalIssues=0.",
      ].join("\n"),
    },
    issues: [
      {
        id: "iss-1",
        code: "VISUAL_SECTION_ORDER_INVALID",
        severity: "high",
        route: "/",
        action: "layout_rule:faq-before-footer",
        detail: "service-details foi renderizado abaixo do footer no mobile.",
        recommendedResolution: "Revisar buildSectionRenderPlan e flags mobile/desktop.",
        assistantHint: {
          priority: "P0",
          firstChecks: [
            "Comparar ordem do DOM em mobile.",
            "Validar sectionOrderRules e section IDs.",
            "Garantir render da secao antes do footer.",
          ],
          commandHints: [
            'rg -n "buildSectionRenderPlan|service-details|footer" src',
            'rg -n "sectionOrderRules" qa',
          ],
        },
      },
      {
        id: "iss-2",
        code: "BTN_NO_EFFECT",
        severity: "medium",
        route: "/",
        action: "Info + FAQ",
        detail: "Clique sem efeito observavel (URL, DOM, request, dialog, scroll).",
        recommendedResolution: "Garantir scrollToSection com ID valido e feedback visual.",
        assistantHint: {
          priority: "P1",
          firstChecks: [
            "Verificar label versus alvo de scroll.",
            "Conferir se o ID da secao existe.",
            "Validar o comportamento em desktop e mobile.",
          ],
          commandHints: [
            'rg -n "scrollToSection|service-details|SectionDock" src',
          ],
        },
      },
      {
        id: "iss-3",
        code: "CONSOLE_ERROR",
        severity: "low",
        route: "/",
        action: "route_load",
        detail: "Mixed language fallback warning on FAQ copy.",
        recommendedResolution: "Padronizar copy por idioma em ServiceSummaries.",
        assistantHint: {
          priority: "P2",
          firstChecks: [
            "Inspecionar logs do navegador.",
            "Padronizar textos por idioma.",
            "Remover warnings ruidosos.",
          ],
          commandHints: ['rg -n "FAQ|placeholder|labels" src/components/sections'],
        },
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("mode") === "mobile" ? "mobile" : "desktop";
  return NextResponse.json(sample(mode));
}
