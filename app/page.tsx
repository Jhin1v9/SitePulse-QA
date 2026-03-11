import type { Metadata } from "next";
import Link from "next/link";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { createPageMetadata } from "@/src/config/seo";
import {
  appPreviews,
  buyerReasons,
  caseSnapshots,
  socialProofItems,
  usageSteps,
} from "@/src/config/showcase";

const valueStats = [
  {
    value: "38%",
    label: "menos retrabalho pos-release",
    detail: "Falhas sao encontradas antes do cliente final impactar a operacao.",
  },
  {
    value: "2.4x",
    label: "mais velocidade para validar mudancas",
    detail: "Auditoria tecnica local e repetivel para cada ciclo de entrega.",
  },
  {
    value: "+94%",
    label: "evidencias de QA rastreaveis",
    detail: "Relatorios e logs unem diagnostico, decisao e historico de execucao.",
  },
];

const technicalProofs = [
  "Engine local com execucao previsivel e independencia de ambiente externo.",
  "Coleta estruturada de evidencias com relatorio de incidentes por etapa.",
  "Workflow guiado para auditoria tecnica com checkpoints claros.",
  "Integracao de SEO tecnico para garantir baseline antes do deploy.",
];

export const metadata: Metadata = createPageMetadata({
  title: "Software de QA e SEO tecnico para releases confiaveis",
  description:
    "Consolide qualidade, auditoria e evidencias em uma operacao unica com SitePulse Studio. Menos retrabalho e mais previsibilidade de release.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="min-w-0">
      <section className="content-shell py-16 sm:py-20">
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-stretch">
          <div className="min-w-0 space-y-8">
            <span className="inline-flex w-fit items-center rounded-full border border-studio-300/60 bg-studio-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-studio-100">
              Release Intelligence Platform
            </span>
            <div className="space-y-5">
              <h1 className="font-heading text-balance text-[clamp(2rem,4.8vw,4.2rem)] leading-[1.03] text-slate-50">
                Reduza falhas em producao e acelere entregas com governanca tecnica real.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
                SitePulse Studio une QA operacional, auditoria continua e SEO tecnico para equipes que precisam
                lancar com confianca. Toda execucao gera evidencias acionaveis para decisao de release.
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-3">
              <Link
                href="/demo"
                className="inline-flex h-12 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-6 text-sm font-semibold text-studio-50 transition hover:border-studio-200 hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Ver demo
              </Link>
              <Link
                href="/downloads"
                className="inline-flex h-12 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/70 px-6 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Baixar instalador
              </Link>
            </div>
          </div>

          <CalloutPanel className="flex min-h-[18rem] flex-col justify-between">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-200">Live Operations</p>
              <h2 className="font-heading text-2xl leading-tight text-slate-50 sm:text-3xl">
                Controle total da execucao e do impacto em negocio.
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                Acompanhe protocolo, estagio, evidencias e status em tempo real para tomar decisao antes da release.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-6">
              <div className="rounded-xl border border-studio-300/40 bg-studio-400/15 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-studio-100">Engine</p>
                <p className="mt-2 text-lg font-semibold text-slate-50">Online</p>
              </div>
              <div className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-100">Audit</p>
                <p className="mt-2 text-lg font-semibold text-slate-50">Running</p>
              </div>
            </div>
          </CalloutPanel>
        </div>
      </section>

      <section className="content-shell pb-8 sm:pb-12">
        <SectionHeading
          eyebrow="Por que comprar"
          title="Resultados de negocio medidos no fluxo de release"
          description="A plataforma foi desenhada para reduzir custo de falha e aumentar throughput com lastro tecnico."
        />
        <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {valueStats.map((item) => (
            <CalloutPanel key={item.label}>
              <p className="text-3xl font-bold text-slate-50">{item.value}</p>
              <p className="mt-3 text-base font-semibold text-slate-200">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.detail}</p>
            </CalloutPanel>
          ))}
        </div>
      </section>

      <section className="content-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Prova social"
          title="Times tecnicos compram quando enxergam impacto de negocio"
          description="Depoimentos e numeros de impacto que ajudam o cliente a decidir com criterio executivo."
        />
        <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-3">
          {socialProofItems.map((item) => (
            <CalloutPanel key={`${item.company}-${item.role}`}>
              <p className="text-sm leading-relaxed text-slate-200">
                <span aria-hidden>&ldquo;</span>
                {item.quote}
                <span aria-hidden>&rdquo;</span>
              </p>
              <p className="mt-4 text-sm font-semibold text-slate-100">{item.company}</p>
              <p className="text-xs text-slate-400">{item.role}</p>
              <p className="mt-3 inline-flex rounded-full border border-emerald-300/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                {item.impact}
              </p>
            </CalloutPanel>
          ))}
        </div>
      </section>

      <section className="content-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Previews e screenshots"
          title="Veja telas do app para entender o valor antes da compra"
          description="A galeria abaixo mostra como o cliente acompanha operacao, evidencias e saude de SEO tecnico."
        />
        <div className="mt-8">
          <AppPreviewGrid previews={appPreviews} />
        </div>
      </section>

      <section className="content-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Como usa"
          title="Uso simples para times tecnicos com foco em resultado"
          description="Fluxo curto para sair do diagnostico e chegar na decisao de release com seguranca."
        />
        <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-2">
          <CalloutPanel>
            <h3 className="font-heading text-xl text-slate-100">Passo a passo de uso</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-300">
              {usageSteps.map((step) => (
                <li key={step.title}>
                  <p className="font-semibold text-slate-100">{step.title}</p>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
          </CalloutPanel>
          <CalloutPanel>
            <h3 className="font-heading text-xl text-slate-100">Informacoes que convencem o cliente</h3>
            <div className="mt-4 space-y-4">
              {buyerReasons.map((reason) => (
                <div key={reason.title} className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-4">
                  <p className="text-sm font-semibold text-slate-100">{reason.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{reason.detail}</p>
                </div>
              ))}
            </div>
          </CalloutPanel>
        </div>
      </section>

      <section className="content-shell py-10 sm:py-12">
        <SectionHeading
          eyebrow="Cases"
          title="Resultados por segmento para reduzir objecao comercial"
          description="Use estes snapshots na call de vendas para mostrar retorno de forma objetiva."
        />
        <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-3">
          {caseSnapshots.map((item) => (
            <CalloutPanel key={item.name}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-200">{item.segment}</p>
              <h3 className="mt-3 font-heading text-xl text-slate-100">{item.name}</h3>
              <p className="mt-3 text-2xl font-bold text-emerald-200">{item.result}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.summary}</p>
            </CalloutPanel>
          ))}
        </div>
      </section>

      <section className="content-shell py-10 sm:py-14">
        <SectionHeading
          eyebrow="Antes vs Depois"
          title="Menos ruido operacional, mais previsibilidade de entrega"
        />
        <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2">
          <CalloutPanel className="border-rose-400/35 bg-rose-900/20">
            <h3 className="font-heading text-xl text-rose-100">Antes</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-rose-50/90">
              <li>Checklist disperso e sem rastreabilidade.</li>
              <li>Descoberta tardia de falha critica em producao.</li>
              <li>Time pressionado por rollback e retrabalho.</li>
            </ul>
          </CalloutPanel>
          <CalloutPanel className="border-emerald-400/35 bg-emerald-900/15">
            <h3 className="font-heading text-xl text-emerald-100">Depois</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-emerald-50/95">
              <li>Fluxo unico de auditoria com protocolo claro.</li>
              <li>Validacao tecnica e SEO antes de publicar.</li>
              <li>Release aprovada com evidencia para gestao e engenharia.</li>
            </ul>
          </CalloutPanel>
        </div>
      </section>

      <section className="content-shell py-8 sm:py-12">
        <SectionHeading
          eyebrow="Prova tecnica"
          title="Arquitetura pensada para times que operam qualidade em escala"
          description="O produto desktop roda localmente, protege contexto sensivel e mantem performance estavel em auditorias longas."
        />
        <div className="mt-8 grid min-w-0 gap-4 md:grid-cols-2">
          {technicalProofs.map((proof) => (
            <CalloutPanel key={proof}>
              <p className="text-sm leading-relaxed text-slate-200">{proof}</p>
            </CalloutPanel>
          ))}
        </div>
      </section>

      <section className="content-shell py-14 sm:py-16">
        <CalloutPanel className="flex min-w-0 flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-200">Proximo passo</p>
            <h2 className="font-heading text-balance text-2xl leading-tight text-slate-50 sm:text-3xl">
              Agende uma demo comercial e inicie a operacao com instalador oficial ainda hoje.
            </h2>
          </div>
          <div className="flex min-w-0 shrink-0 flex-wrap gap-3">
            <Link
              href="/demo"
              className="inline-flex h-11 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-50 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Ver demo
            </Link>
            <Link
              href="/downloads"
              className="inline-flex h-11 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 px-5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Baixar instalador
            </Link>
          </div>
        </CalloutPanel>
      </section>
    </div>
  );
}
