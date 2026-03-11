import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContactForm } from "@/src/components/marketing/contact-form";
import { siteConfig } from "@/src/config/site";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
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

  const sourceTopic = searchParams?.topic;
  const sourcePackage = searchParams?.package;

  return (
    <div className="content-shell min-w-0 space-y-8 py-8 sm:py-14">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.contact.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.contact.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.contact.description}</p>
        {sourceTopic ? (
          <p className="break-all text-sm font-medium text-studio-700 dark:text-studio-200">
            Source: {sourceTopic} {sourcePackage ? `(${sourcePackage})` : ""}
          </p>
        ) : null}
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <article className="panel min-w-0 p-4 sm:p-6">
          <h2 className="font-heading text-xl text-slate-900 dark:text-slate-100">{messages.contact.directTitle}</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{messages.contact.directDescription}</p>
          <div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              Sales: <a href={`mailto:${siteConfig.email}`} className="break-all font-semibold text-slate-900 hover:text-studio-700 dark:text-slate-100 dark:hover:text-studio-200">{siteConfig.email}</a>
            </p>
            <p>
              Support: <a href={`mailto:${siteConfig.supportEmail}`} className="break-all font-semibold text-slate-900 hover:text-studio-700 dark:text-slate-100 dark:hover:text-studio-200">{siteConfig.supportEmail}</a>
            </p>
          </div>
        </article>

        <article className="panel min-w-0 p-4 sm:p-6">
          <h2 className="font-heading text-xl text-slate-900 dark:text-slate-100">{messages.contact.formTitle}</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{messages.contact.formDescription}</p>
          <ContactForm labels={messages.contact} />
        </article>
      </section>
    </div>
  );
}
