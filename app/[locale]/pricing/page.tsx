import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";
import { buildLocalizedPath } from "@/src/i18n/path";

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

  return (
    <div className="content-shell min-w-0 space-y-8 py-10 sm:py-14">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.pricing.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.2vw,3.2rem)] text-slate-900 dark:text-slate-100">{messages.pricing.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.pricing.description}</p>
        <p className="text-sm font-medium text-studio-700 dark:text-studio-200">{messages.pricing.strategy}</p>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-3">
        {messages.pricing.plans.map((plan) => (
          <article key={plan.id} className={`panel min-w-0 p-6 ${plan.recommended ? "border-studio-400/70" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
              {plan.recommended ? "Recommended" : "Plan"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h2>
            <p className="mt-1 text-xl font-semibold text-studio-700 dark:text-studio-100">{plan.price}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{plan.billing}</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{plan.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature}>- {feature}</li>
              ))}
            </ul>
            <Link
              href={buildLocalizedPath(locale, plan.ctaRoute)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 dark:text-studio-100"
            >
              {plan.ctaLabel}
            </Link>
          </article>
        ))}
      </section>

      <section className="panel min-w-0 p-6">
        <h2 className="font-heading text-2xl text-slate-900 dark:text-slate-100">{messages.pricing.guaranteeTitle}</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
          {messages.pricing.guaranteeItems.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
