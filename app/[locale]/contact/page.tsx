import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/src/components/marketing/contact-form";
import { siteConfig } from "@/src/config/site";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildLocalizedUrl, createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";

interface ContactPageProps {
  params: { locale: string };
  searchParams?: { topic?: string; package?: string };
}

export function generateMetadata({ params }: ContactPageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.contact.meta.title,
    description: messages.contact.meta.description,
    route: "contact",
  });
}

export default function ContactPage({ params, searchParams }: ContactPageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const canonicalUrl = buildLocalizedUrl(locale, "contact");
  const sourceLabel = locale === "en" ? "Source" : locale === "ca" ? "Origen" : "Origen";
  const salesLabel = locale === "en" ? "Sales" : locale === "ca" ? "Vendes" : "Ventas";
  const supportLabel = locale === "en" ? "Support" : locale === "ca" ? "Suport" : "Soporte";

  const sourceTopic = searchParams?.topic;
  const sourcePackage = searchParams?.package;
  const localizedSourceTopic =
    sourceTopic === "download"
      ? locale === "en"
        ? "download request"
        : locale === "ca"
          ? "sollicitud de descarrega"
          : "solicitud de descarga"
      : sourceTopic === "release-notes"
        ? locale === "en"
          ? "release notes"
          : locale === "ca"
            ? "notes de release"
            : "notas de release"
        : sourceTopic;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: messages.contact.meta.title,
    description: messages.contact.meta.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: buildLocalizedUrl(locale, ""),
    },
    mainEntity: {
      "@type": "Organization",
      name: siteConfig.legalName,
      email: siteConfig.email,
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: siteConfig.email,
        },
        {
          "@type": "ContactPoint",
          contactType: "support",
          email: siteConfig.supportEmail,
        },
      ],
    },
  };

  return (
    <div className="content-shell min-w-0 space-y-10 py-8 sm:space-y-12 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.contact.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.contact.title}</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.contact.description}</p>
        {sourceTopic ? (
          <p className="break-all text-sm font-medium text-studio-700 dark:text-studio-200">
            {sourceLabel}: {localizedSourceTopic} {sourcePackage ? `(${sourcePackage})` : ""}
          </p>
        ) : null}
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-8">
        <article className="panel min-w-0 rounded-[1.6rem] p-5 sm:p-7">
          <h2 className="font-heading text-[clamp(1.45rem,2.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.contact.directTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{messages.contact.directDescription}</p>
          <div className="mt-6 space-y-4 text-sm text-slate-700 dark:text-slate-300">
            <p>
              {salesLabel}: <a href={`mailto:${siteConfig.email}`} className="break-all font-semibold text-slate-900 hover:text-studio-700 dark:text-slate-100 dark:hover:text-studio-200">{siteConfig.email}</a>
            </p>
            <p>
              {supportLabel}: <a href={`mailto:${siteConfig.supportEmail}`} className="break-all font-semibold text-slate-900 hover:text-studio-700 dark:text-slate-100 dark:hover:text-studio-200">{siteConfig.supportEmail}</a>
            </p>
          </div>
        </article>

        <article className="panel min-w-0 rounded-[1.6rem] p-5 sm:p-7">
          <h2 className="font-heading text-[clamp(1.45rem,2.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.contact.formTitle}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{messages.contact.formDescription}</p>
          <ContactForm labels={messages.contact} />
        </article>
      </section>
    </div>
  );
}
