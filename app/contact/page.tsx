import type { Metadata } from "next";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { createPageMetadata } from "@/src/config/seo";
import { siteConfig } from "@/src/config/site";

export const metadata: Metadata = createPageMetadata({
  title: "Contato comercial",
  description:
    "Entre em contato com o time comercial do SitePulse Studio para demo guiada, proposta e distribuição do software desktop.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="content-shell min-w-0 py-14 sm:py-16">
      <SectionHeading
        eyebrow="Contato"
        title="Fale com o time comercial do SitePulse Studio"
        description="Use o formulário para receber proposta, suporte de implantação e orientação de rollout."
      />

      <section className="mt-10 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <CalloutPanel>
          <h2 className="font-heading text-xl text-slate-100">Canais diretos</h2>
          <div className="mt-5 space-y-4 text-sm text-slate-300">
            <p>
              Comercial:{" "}
              <a
                href={`mailto:${siteConfig.email}`}
                className="font-semibold text-slate-100 transition hover:text-studio-200"
              >
                {siteConfig.email}
              </a>
            </p>
            <p>
              Suporte técnico:{" "}
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="font-semibold text-slate-100 transition hover:text-studio-200"
              >
                {siteConfig.supportEmail}
              </a>
            </p>
            <p className="text-slate-400">
              Para processos de compras corporativas, inclua no e-mail: volume de licenças, ambiente-alvo e prazo
              estimado de rollout.
            </p>
          </div>
        </CalloutPanel>

        <CalloutPanel>
          <h2 className="font-heading text-xl text-slate-100">Solicitar contato</h2>
          <form className="mt-5 grid min-w-0 gap-4" action={`mailto:${siteConfig.email}`} method="post" encType="text/plain">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium text-slate-200">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="h-11 rounded-xl border border-slate-600 bg-slate-950/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
                placeholder="Seu nome"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-200">
                E-mail corporativo
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="h-11 rounded-xl border border-slate-600 bg-slate-950/70 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
                placeholder="voce@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="message" className="text-sm font-medium text-slate-200">
                Contexto do projeto
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                className="rounded-xl border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
                placeholder="Conte equipe, volume de releases e principal desafio atual."
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center rounded-full border border-studio-300/70 bg-studio-500/20 px-5 text-sm font-semibold text-studio-50 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Enviar solicitação
            </button>
          </form>
        </CalloutPanel>
      </section>
    </div>
  );
}
