import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingGrid } from "@/src/components/marketing/pricing-grid";
import { getMarketingContent } from "@/src/config/marketing-content";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";

interface PricingPageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: PricingPageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.pricing.meta.title,
    description: messages.pricing.meta.description,
    route: "pricing",
  });
}

export default function PricingPage({ params }: PricingPageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const marketing = getMarketingContent(locale);

  return (
    <div className="content-shell min-w-0 space-y-10 py-8 sm:space-y-12 sm:py-14">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
          {messages.pricing.eyebrow}
        </p>
        <h1 className="font-heading text-[clamp(2rem,4.4vw,3.4rem)] text-slate-950 dark:text-slate-100">
          {messages.pricing.title}
        </h1>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.pricing.description}</p>
        <p className="text-sm font-medium text-studio-700 dark:text-studio-200">{messages.pricing.strategy}</p>
      </section>

      <PricingGrid locale={locale} plans={messages.pricing.plans} labels={marketing.pricing} />

      <section className="panel min-w-0 rounded-[1.8rem] p-6 sm:p-7">
        <h2 className="font-heading text-[clamp(1.5rem,3vw,2rem)] text-slate-950 dark:text-slate-100">{messages.pricing.guaranteeTitle}</h2>
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-3">
          {messages.pricing.guaranteeItems.map((item) => (
            <article key={item} className="rounded-[1.25rem] border border-slate-300/80 bg-white/75 p-4 text-sm leading-7 text-slate-700 dark:border-slate-700/80 dark:bg-slate-950/55 dark:text-slate-300">
              {item}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
