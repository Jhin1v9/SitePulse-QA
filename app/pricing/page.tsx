import type { Metadata } from "next";
import Link from "next/link";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { createPageMetadata } from "@/src/config/seo";

const plans = [
  {
    name: "Starter Team",
    price: "Sob consulta",
    description: "Para squads que precisam padronizar QA e reduzir incidentes de release.",
    features: [
      "1 workspace de auditoria",
      "Relatórios técnicos exportáveis",
      "Suporte comercial por e-mail",
    ],
    highlight: false,
  },
  {
    name: "Scale Ops",
    price: "Sob consulta",
    description: "Para operação contínua com maior volume de releases e governança formal.",
    features: [
      "Múltiplos fluxos de auditoria",
      "Evidências com trilha operacional",
      "Prioridade de suporte e onboarding",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Para organizações com requisitos avançados de compliance e integração interna.",
    features: [
      "Políticas e playbooks dedicados",
      "Acompanhamento técnico consultivo",
      "Condições de implantação customizada",
    ],
    highlight: false,
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "Planos e preços do SitePulse Studio",
  description:
    "Estrutura comercial do SitePulse Studio para squads, operações e enterprise. Prepare seu time para releases previsíveis.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="content-shell min-w-0 py-14 sm:py-16">
      <SectionHeading
        eyebrow="Pricing"
        title="Estrutura comercial preparada para venda consultiva"
        description="Enquanto o preço final é validado, a página já está pronta para publicar os planos oficiais sem retrabalho estrutural."
      />

      <section className="mt-10 grid min-w-0 gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <CalloutPanel
            key={plan.name}
            className={plan.highlight ? "border-studio-300/70 bg-studio-950/45" : undefined}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-studio-200">
              {plan.highlight ? "Mais escolhido" : "Plano"}
            </p>
            <h2 className="mt-3 font-heading text-2xl text-slate-50">{plan.name}</h2>
            <p className="mt-2 text-lg font-semibold text-studio-100">{plan.price}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{plan.description}</p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-slate-600 bg-slate-900/70 px-5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Falar com vendas
            </Link>
          </CalloutPanel>
        ))}
      </section>
    </div>
  );
}
