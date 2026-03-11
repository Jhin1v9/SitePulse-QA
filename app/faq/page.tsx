import type { Metadata } from "next";
import { CalloutPanel } from "@/src/components/callout-panel";
import { SectionHeading } from "@/src/components/section-heading";
import { createPageMetadata } from "@/src/config/seo";

const faqItems = [
  {
    question: "O SitePulse Studio roda localmente ou em nuvem?",
    answer:
      "A aplicação desktop é local, com foco em previsibilidade operacional e proteção de contexto técnico sensível durante auditorias.",
  },
  {
    question: "Preciso de internet para auditar?",
    answer:
      "O fluxo principal é local. Dependências externas variam por cenário de validação e podem ser planejadas por política de ambiente.",
  },
  {
    question: "Como funciona a atualização de instaladores?",
    answer:
      "A seção de downloads centraliza versão, data e links diretos em uma configuração única para atualização rápida e rastreável.",
  },
  {
    question: "Existe suporte para equipes com múltiplos projetos?",
    answer:
      "Sim. A estrutura comercial contempla operação escalável com onboarding e governança para times maiores.",
  },
  {
    question: "A plataforma cobre SEO técnico também?",
    answer:
      "Sim. A proposta é incluir SEO técnico no mesmo ciclo de auditoria para reduzir risco de regressão orgânica após release.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "FAQ do SitePulse Studio",
  description:
    "Perguntas frequentes sobre execução local, atualização, SEO técnico e uso comercial do SitePulse Studio.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <div className="content-shell min-w-0 py-14 sm:py-16">
      <SectionHeading
        eyebrow="FAQ"
        title="Perguntas frequentes sobre produto, operação e suporte"
        description="Respostas objetivas para acelerar decisão de compra e adoção técnica."
      />

      <section className="mt-10 min-w-0">
        <div className="grid min-w-0 gap-4">
          {faqItems.map((item) => (
            <CalloutPanel key={item.question}>
              <details className="group">
                <summary className="cursor-pointer list-none text-left text-lg font-semibold text-slate-100 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-600 text-xs text-slate-300 transition group-open:rotate-45 group-open:text-studio-200"
                    >
                      +
                    </span>
                    <span>{item.question}</span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{item.answer}</p>
              </details>
            </CalloutPanel>
          ))}
        </div>
      </section>
    </div>
  );
}
