import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { getAppPreviews } from "@/src/config/showcase";
import { siteConfig } from "@/src/config/site";
import { isLocale, type Locale } from "@/src/i18n/config";
import { buildLocalizedUrl, createLocalizedMetadata } from "@/src/i18n/metadata";
import { getMessages } from "@/src/i18n/messages";
import { buildLocalizedPath } from "@/src/i18n/path";

interface DemoPageProps {
  params: { locale: string };
  searchParams?: { target?: string };
}

export function generateMetadata({ params }: DemoPageProps): Metadata {
  if (!isLocale(params.locale)) {
    return {};
  }
  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  return createLocalizedMetadata({
    locale,
    title: messages.demo.meta.title,
    description: messages.demo.meta.description,
    route: "demo",
  });
}

export default function DemoPage({ params, searchParams }: DemoPageProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);
  const target = searchParams?.target?.trim();
  const appPreviews = getAppPreviews(locale);
  const targetLabel = locale === "en" ? "Target" : locale === "ca" ? "Objectiu" : "Objetivo";
  const canonicalUrl = buildLocalizedUrl(locale, "demo");
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: messages.demo.meta.title,
    description: messages.demo.meta.description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: buildLocalizedUrl(locale, ""),
    },
  };

  return (
    <div className="content-shell min-w-0 space-y-10 py-8 sm:space-y-12 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.demo.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.4vw,3.4rem)] text-slate-900 dark:text-slate-100">{messages.demo.title}</h1>
        <p className="max-w-3xl text-base leading-8 text-slate-700 dark:text-slate-300">{messages.demo.description}</p>
        {target ? (
          <p className="break-all text-sm font-medium text-studio-700 dark:text-studio-200">{targetLabel}: {target}</p>
        ) : null}
        <div className="flex min-w-0 flex-wrap gap-3">
          <Link
            href={buildLocalizedPath(locale, "downloads")}
            prefetch={false}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 dark:text-studio-100 sm:w-auto"
          >
            {messages.demo.ctaPrimary}
          </Link>
          <Link
            href={buildLocalizedPath(locale, "contact")}
            prefetch={false}
            className="inline-flex h-10 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 sm:w-auto"
          >
            {messages.demo.ctaSecondary}
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-heading text-2xl text-slate-900 dark:text-slate-100">{messages.demo.screenshotTitle}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">{messages.demo.screenshotDescription}</p>
        <AppPreviewGrid previews={appPreviews} />
      </section>

      <section className="grid min-w-0 gap-6 lg:grid-cols-2 xl:gap-8">
        <article className="panel min-w-0 rounded-[1.65rem] p-5 sm:p-7">
          <h2 className="font-heading text-[clamp(1.55rem,3vw,2rem)] text-slate-900 dark:text-slate-100">{messages.demo.flowTitle}</h2>
          <div className="mt-5 grid gap-4">
            {messages.demo.flow.map((step) => (
              <div key={step.title} className="rounded-[1.2rem] border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel min-w-0 rounded-[1.65rem] p-5 sm:p-7">
          <h2 className="font-heading text-[clamp(1.55rem,3vw,2rem)] text-slate-900 dark:text-slate-100">{messages.demo.walkthroughTitle}</h2>
          <div className="mt-5 grid gap-4">
            {messages.demo.walkthrough.map((step) => (
              <div key={step.title} className="rounded-[1.2rem] border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
