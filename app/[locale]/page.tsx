import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { UrlAuditForm } from "@/src/components/marketing/url-audit-form";
import { appPreviews } from "@/src/config/showcase";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";
import { buildLocalizedPath } from "@/src/i18n/path";

interface HomePageProps {
  params: { locale: string };
}

export function generateMetadata({ params }: HomePageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.home.meta.title,
    description: messages.home.meta.description,
    route: "",
  });
}

export default function HomePage({ params }: HomePageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);

  return (
    <div className="content-shell min-w-0 space-y-12 py-8 sm:space-y-16 sm:py-14">
      <section className="grid min-w-0 gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="min-w-0 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.hero.eyebrow}
          </p>
          <h1 className="text-balance font-heading text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.05] text-slate-900 dark:text-slate-50">
            {messages.home.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {messages.home.hero.subtitle}
          </p>
          <UrlAuditForm
            locale={locale}
            inputLabel={messages.home.hero.inputLabel}
            inputPlaceholder={messages.home.hero.inputPlaceholder}
            submitLabel={messages.home.hero.primaryCta}
            secondaryLabel={messages.home.finalCta.secondaryButton}
            errorText={messages.home.hero.urlError}
            loadingText={messages.home.hero.loading}
            successText={messages.home.hero.success}
          />
          <div className="flex min-w-0 flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] leading-relaxed text-slate-600 dark:text-slate-300">
            {messages.home.hero.trustBadges.map((badge) => (
              <span key={badge} className="rounded-full border border-slate-300 bg-white/70 px-3 py-1 dark:border-slate-700 dark:bg-slate-900/70">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="panel min-w-0 p-4 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-studio-600 dark:text-studio-200">
            {messages.home.dashboard.eyebrow}
          </p>
          <h2 className="mt-2 text-[clamp(1.3rem,4.4vw,1.5rem)] font-semibold text-slate-900 dark:text-slate-100">{messages.home.dashboard.title}</h2>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{messages.home.dashboard.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {messages.home.dashboard.cards.map((card) => (
              <article key={card.label} className="rounded-xl border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{card.detail}</p>
              </article>
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {messages.home.dashboard.recommendations.map((item) => (
              <li key={item} className="rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.problem.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.problem.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.problem.description}</p>
        <div className="grid min-w-0 gap-4 md:grid-cols-3">
          {messages.home.problem.stats.map((stat) => (
            <article key={stat.label} className="panel min-w-0 p-4 sm:p-5">
              <p className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
              <p className="mt-2 font-medium text-slate-800 dark:text-slate-100">{stat.label}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <article className="panel min-w-0 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">{messages.home.beforeAfter.beforeTitle}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            {messages.home.beforeAfter.beforeList.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </article>
        <article className="panel min-w-0 border-studio-400/70 p-4 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-studio-700 dark:text-studio-200">{messages.home.beforeAfter.afterTitle}</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-300">
            {messages.home.beforeAfter.afterList.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.solution.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.solution.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.solution.description}</p>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {messages.home.solution.steps.map((step) => (
            <article key={step.title} className="panel min-w-0 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.features.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.features.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.features.description}</p>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {messages.home.features.items.map((feature) => (
            <article key={feature.title} className="panel min-w-0 p-4 sm:p-5">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.demo.screenshotTitle}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.demo.screenshotDescription}</p>
        <AppPreviewGrid previews={appPreviews} />
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.benefits.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.benefits.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.benefits.description}</p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {messages.home.benefits.items.map((benefit) => (
            <article key={benefit} className="panel min-w-0 p-4 text-sm text-slate-700 dark:text-slate-300">
              {benefit}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.socialProof.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.socialProof.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.socialProof.description}</p>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {messages.home.socialProof.quotes.map((quote) => (
            <article key={`${quote.author}-${quote.impact}`} className="panel min-w-0 p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span aria-hidden>&ldquo;</span>
                {quote.quote}
                <span aria-hidden>&rdquo;</span>
              </p>
              <p className="mt-4 font-semibold text-slate-900 dark:text-slate-100">{quote.author}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{quote.role}</p>
              <p className="mt-2 break-words text-xs font-semibold uppercase tracking-[0.12em] text-studio-600 dark:text-studio-200">{quote.impact}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel min-w-0 p-4 sm:p-8">
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.finalCta.title}</h2>
        <p className="mt-2 max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.finalCta.subtitle}</p>
        <div className="mt-5">
          <UrlAuditForm
            locale={locale}
            inputLabel={messages.home.finalCta.inputLabel}
            inputPlaceholder={messages.home.finalCta.inputPlaceholder}
            submitLabel={messages.home.finalCta.button}
            secondaryLabel={messages.home.finalCta.secondaryButton}
            errorText={messages.home.hero.urlError}
            loadingText={messages.home.hero.loading}
            successText={messages.home.hero.success}
            compact
          />
        </div>
      </section>

      <section className="space-y-5 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.home.pricing.eyebrow}</p>
        <h2 className="font-heading text-[clamp(1.55rem,4.8vw,1.9rem)] text-slate-900 dark:text-slate-100">{messages.home.pricing.title}</h2>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.home.pricing.description}</p>
        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {messages.pricing.plans.map((plan) => (
            <article key={plan.id} className={`panel min-w-0 p-4 sm:p-5 ${plan.recommended ? "border-studio-400/70" : ""}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                {plan.recommended ? "Recommended" : "Plan"}
              </p>
              <h3 className="mt-2 break-words text-[clamp(1.35rem,4.2vw,1.5rem)] font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h3>
              <p className="mt-1 text-lg font-semibold text-studio-700 dark:text-studio-100">{plan.price}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{plan.billing}</p>
              <p className="mt-3 break-words text-sm text-slate-700 dark:text-slate-300">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Link
                href={buildLocalizedPath(locale, plan.ctaRoute)}
                className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 dark:text-studio-100 sm:w-auto"
              >
                {plan.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
