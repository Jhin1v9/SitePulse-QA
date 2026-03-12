import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { HeroExperience } from "@/src/components/marketing/hero-experience";
import { PricingGrid } from "@/src/components/marketing/pricing-grid";
import { UrlAuditForm } from "@/src/components/marketing/url-audit-form";
import { getMarketingContent } from "@/src/config/marketing-content";
import { getAppPreviews } from "@/src/config/showcase";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";

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
  const marketing = getMarketingContent(locale);
  const appPreviews = getAppPreviews(locale);

  return (
    <div className="content-shell min-w-0 space-y-14 py-8 sm:space-y-20 sm:py-14">
      <HeroExperience
        locale={locale}
        eyebrow={messages.home.hero.eyebrow}
        content={marketing.hero}
        inputLabel={messages.home.hero.inputLabel}
        inputPlaceholder={messages.home.hero.inputPlaceholder}
        submitLabel={messages.home.hero.primaryCta}
        secondaryLabel={messages.nav.secondaryCta}
        trustBadges={messages.home.hero.trustBadges}
        errorText={messages.home.hero.urlError}
        loadingText={messages.home.hero.loading}
        successText={messages.home.hero.success}
        previewRecommendation={messages.home.dashboard.recommendations[0]}
      />

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.problem.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.problem.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.problem.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-3">
          {messages.home.problem.stats.map((stat) => (
            <article key={stat.label} className="panel flex h-full min-w-0 flex-col rounded-[1.6rem] p-5 sm:p-6">
              <p className="text-4xl font-semibold text-slate-950 dark:text-slate-100">{stat.value}</p>
              <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{stat.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{stat.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="platform" className="scroll-mt-28 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {marketing.platform.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {marketing.platform.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{marketing.platform.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {marketing.platform.blocks.map((block, index) => (
            <article key={block.title} className="panel flex h-full min-w-0 flex-col rounded-[1.7rem] p-6 sm:p-7">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-studio-600 dark:text-studio-200">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 text-[clamp(1.3rem,3vw,1.6rem)] font-semibold text-slate-950 dark:text-slate-100">
                    {block.title}
                  </h3>
                </div>
                <span className="rounded-full border border-studio-400/35 bg-studio-500/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-studio-700 dark:text-studio-100">
                  {marketing.platform.eyebrow}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700 dark:text-slate-300">{block.detail}</p>
              <div className="mt-5 rounded-[1.2rem] border border-slate-300/80 bg-white/75 p-4 text-sm font-medium text-slate-700 dark:border-slate-700/80 dark:bg-slate-950/55 dark:text-slate-200">
                {block.outcome}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.beforeAfter.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.beforeAfter.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">
            {messages.home.beforeAfter.description}
          </p>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <article className="panel min-w-0 rounded-[1.7rem] p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
              {messages.home.beforeAfter.beforeTitle}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
              {messages.home.beforeAfter.beforeList.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </article>
          <article className="panel min-w-0 rounded-[1.7rem] border-studio-400/70 p-6 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-studio-700 dark:text-studio-200">
              {messages.home.beforeAfter.afterTitle}
            </p>
            <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-300">
              {messages.home.beforeAfter.afterList.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.solution.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.solution.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.solution.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {messages.home.solution.steps.map((step, index) => (
            <article key={step.title} className="panel flex h-full min-w-0 flex-col rounded-[1.7rem] p-6 sm:p-7">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-studio-600 dark:text-studio-200">0{index + 1}</span>
              <h3 className="mt-3 text-[clamp(1.25rem,3vw,1.5rem)] font-semibold text-slate-950 dark:text-slate-100">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.features.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.features.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.features.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {messages.home.features.items.map((feature) => (
            <article key={feature.title} className="panel flex h-full min-w-0 flex-col rounded-[1.7rem] p-6 sm:p-7">
              <h3 className="text-[clamp(1.2rem,2.8vw,1.45rem)] font-semibold text-slate-950 dark:text-slate-100">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-700 dark:text-slate-300">{feature.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.demo.screenshotTitle}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.demo.screenshotDescription}</p>
        </div>
        <AppPreviewGrid previews={appPreviews} />
      </section>

      <section className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.benefits.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.benefits.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.benefits.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {messages.home.benefits.items.map((benefit) => (
            <article key={benefit} className="panel flex h-full min-w-0 items-start rounded-[1.6rem] p-5 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:p-6">
              {benefit}
            </article>
          ))}
        </div>
      </section>

      <section id="proof" className="scroll-mt-28 space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {marketing.social.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {marketing.social.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{marketing.social.description}</p>
        </div>

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {marketing.social.metrics.map((metric) => (
            <article key={metric.label} className="panel flex h-full min-w-0 flex-col rounded-[1.7rem] p-6 sm:p-7">
              <p className="text-4xl font-semibold text-slate-950 dark:text-slate-100">{metric.value}</p>
              <p className="mt-3 font-semibold text-slate-900 dark:text-slate-100">{metric.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{metric.detail}</p>
            </article>
          ))}
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-3">
          {marketing.social.quotes.map((quote) => (
            <article key={`${quote.company}-${quote.metric}`} className="panel flex h-full min-w-0 flex-col rounded-[1.7rem] p-6 sm:p-7">
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                <span aria-hidden>&ldquo;</span>
                {quote.quote}
                <span aria-hidden>&rdquo;</span>
              </p>
              <div className="mt-6">
                <p className="font-semibold text-slate-950 dark:text-slate-100">{quote.company}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{quote.role}</p>
              </div>
              <div className="mt-4 rounded-full border border-studio-400/35 bg-studio-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-studio-700 dark:text-studio-100">
                {quote.metric}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6 pb-2">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">
            {messages.home.pricing.eyebrow}
          </p>
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.pricing.title}
          </h2>
          <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.pricing.description}</p>
        </div>

        <PricingGrid locale={locale} plans={messages.pricing.plans} labels={marketing.pricing} />
      </section>

      <section className="panel min-w-0 rounded-[1.9rem] p-5 sm:p-8">
        <div className="max-w-3xl space-y-3">
          <h2 className="font-heading text-[clamp(1.75rem,4.8vw,2.4rem)] text-slate-950 dark:text-slate-100">
            {messages.home.finalCta.title}
          </h2>
          <p className="text-base leading-8 text-slate-700 dark:text-slate-300">{messages.home.finalCta.subtitle}</p>
        </div>
        <div className="mt-6">
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
    </div>
  );
}
