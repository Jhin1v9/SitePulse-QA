import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/src/components/marketing/faq-accordion";
import { siteConfig } from "@/src/config/site";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildLocalizedUrl, createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";

interface FaqPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: FaqPageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.faq.meta.title,
    description: messages.faq.meta.description,
    route: "faq",
  });
}

export default function FaqPage({ params }: FaqPageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const canonicalUrl = buildLocalizedUrl(locale, "faq");
  const resourceContent =
    locale === "en"
      ? {
          docsTitle: "Docs",
          docsText: "Use the demo flow, downloads page, and contact form as the public operating guide for evaluation, rollout, and installer access.",
          securityTitle: "Security",
          securityText: "The product runs desktop-first with a local engine, signed package distribution, and controlled installer publication.",
          privacyTitle: "Privacy",
          privacyText: "Commercial forms only collect the fields required for contact and pre-sales qualification. Audit execution remains local to the desktop product.",
        }
      : locale === "ca"
        ? {
            docsTitle: "Documentacio",
            docsText: "Fes servir la demo, la pagina d instal.ladors i el formulari de contacte com a guia publica d avaluacio, rollout i acces a paquets.",
            securityTitle: "Seguretat",
            securityText: "El producte funciona desktop-first amb engine local, distribucio de paquets signats i publicacio controlada dels instal.ladors.",
            privacyTitle: "Privacitat",
            privacyText: "Els formularis comercials nomes recullen els camps necessaris per contacte i pre-venda. L execucio de l auditoria continua sent local al producte desktop.",
          }
        : {
            docsTitle: "Documentacion",
            docsText: "Usa la demo, la pagina de instaladores y el formulario de contacto como guia publica de evaluacion, rollout y acceso a paquetes.",
            securityTitle: "Seguridad",
            securityText: "El producto funciona desktop-first con engine local, distribucion de paquetes firmados y publicacion controlada de instaladores.",
            privacyTitle: "Privacidad",
            privacyText: "Los formularios comerciales solo recogen los campos necesarios para contacto y preventa. La ejecucion de la auditoria sigue siendo local al producto desktop.",
        };
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: messages.faq.meta.title,
    description: messages.faq.meta.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: buildLocalizedUrl(locale, ""),
    },
    mainEntity: messages.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <div className="content-shell min-w-0 space-y-10 py-8 sm:space-y-12 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.faq.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.faq.title}</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.faq.description}</p>
      </section>

      <section>
        <FaqAccordion items={messages.faq.items} />
      </section>

      <section className="grid min-w-0 gap-6 md:grid-cols-3 xl:gap-7">
        <article id="docs" className="panel min-w-0 rounded-[1.55rem] p-5 scroll-mt-28 sm:p-7">
          <h2 className="font-heading text-[clamp(1.45rem,2.6vw,1.85rem)] text-slate-900 dark:text-slate-100">{resourceContent.docsTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{resourceContent.docsText}</p>
        </article>
        <article id="security" className="panel min-w-0 rounded-[1.55rem] p-5 scroll-mt-28 sm:p-7">
          <h2 className="font-heading text-[clamp(1.45rem,2.6vw,1.85rem)] text-slate-900 dark:text-slate-100">{resourceContent.securityTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{resourceContent.securityText}</p>
        </article>
        <article id="privacy" className="panel min-w-0 rounded-[1.55rem] p-5 scroll-mt-28 sm:p-7">
          <h2 className="font-heading text-[clamp(1.45rem,2.6vw,1.85rem)] text-slate-900 dark:text-slate-100">{resourceContent.privacyTitle}</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{resourceContent.privacyText}</p>
        </article>
      </section>
    </div>
  );
}
