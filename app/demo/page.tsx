import type { Metadata } from "next";
import Link from "next/link";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { createPageMetadata } from "@/src/config/seo";
import { appPreviews, usageSteps } from "@/src/config/showcase";

const demoFlow = [
  {
    title: "1. Selecao de alvo e escopo",
    description: "Defina URL, ambiente e checklist operacional para iniciar auditoria consistente entre releases.",
  },
  {
    title: "2. Execucao da engine local",
    description: "Acompanhe status de operacoes, progresso por estagio e eventos criticos sem sair do painel.",
  },
  {
    title: "3. Coleta de evidencias",
    description: "Relatorios tecnicos consolidam falhas, severidade e contexto para correcao objetiva.",
  },
  {
    title: "4. Decisao de release",
    description: "Com base no diagnostico, aprove, bloqueie ou replaneje deploy com transparencia.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Demo do SitePulse Studio",
  description:
    "Veja como funciona o fluxo completo de auditoria tecnica do SitePulse Studio, do alvo inicial a decisao de release com evidencias.",
  path: "/demo",
});

export default function DemoPage() {
  return (
    <div className="content-shell min-w-0 py-14 sm:py-16">
      <SectionHeading
        eyebrow="Demonstracao"
        title="Previews do produto e fluxo completo de uso"
        description="Mostre esta pagina para o cliente: ela explica como o app funciona e porque a compra gera retorno."
      >
        <div className="pt-2">
          <Link
            href="/downloads"
            className="inline-flex h-11 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-50 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Baixar para testar
          </Link>
        </div>
      </SectionHeading>

      <section className="mt-10 min-w-0">
        <h2 className="font-heading text-2xl text-slate-100">Screenshots do app</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          As capturas abaixo destacam os pontos que mais pesam na decisao de compra: controle operacional,
          evidencias de risco e baseline de SEO tecnico.
        </p>
        <div className="mt-5">
          <AppPreviewGrid previews={appPreviews} />
        </div>
      </section>

      <section className="mt-10 min-w-0">
        <h2 className="font-heading text-2xl text-slate-100">Fluxo da demo</h2>
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
          {demoFlow.map((step) => (
            <CalloutPanel key={step.title}>
              <h3 className="font-heading text-lg text-slate-100">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.description}</p>
            </CalloutPanel>
          ))}
        </div>
      </section>

      <section className="mt-10 min-w-0">
        <CalloutPanel>
          <h2 className="font-heading text-2xl text-slate-100">Como usar para vender melhor</h2>
          <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-300">
            {usageSteps.map((step) => (
              <li key={step.title}>
                <p className="font-semibold text-slate-100">{step.title}</p>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </CalloutPanel>
      </section>
    </div>
  );
}
