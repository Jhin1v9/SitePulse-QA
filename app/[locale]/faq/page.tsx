import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/src/components/marketing/faq-accordion";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
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

  return (
    <div className="content-shell min-w-0 space-y-8 py-8 sm:py-14">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.faq.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.faq.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.faq.description}</p>
      </section>

      <section>
        <FaqAccordion items={messages.faq.items} />
      </section>
    </div>
  );
}
