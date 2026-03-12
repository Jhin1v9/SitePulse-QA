import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPreviewGrid } from "@/src/components/app-preview-grid";
import { getAppPreviews } from "@/src/config/showcase";
import { isLocale, type Locale } from "@/src/i18n/config";
import { createLocalizedMetadata } from "@/src/i18n/metadata";
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

  return (
    <div className="content-shell min-w-0 space-y-8 py-8 sm:space-y-10 sm:py-14">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-studio-600 dark:text-studio-200">{messages.demo.eyebrow}</p>
        <h1 className="font-heading text-[clamp(1.9rem,4.4vw,3.4rem)] text-slate-900 dark:text-slate-100">{messages.demo.title}</h1>
        <p className="max-w-3xl text-base text-slate-700 dark:text-slate-300">{messages.demo.description}</p>
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

      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-slate-900 dark:text-slate-100">{messages.demo.screenshotTitle}</h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">{messages.demo.screenshotDescription}</p>
        <AppPreviewGrid previews={appPreviews} />
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <article className="panel min-w-0 p-4 sm:p-6">
          <h2 className="font-heading text-2xl text-slate-900 dark:text-slate-100">{messages.demo.flowTitle}</h2>
          <div className="mt-4 grid gap-3">
            {messages.demo.flow.map((step) => (
              <div key={step.title} className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel min-w-0 p-4 sm:p-6">
          <h2 className="font-heading text-2xl text-slate-900 dark:text-slate-100">{messages.demo.walkthroughTitle}</h2>
          <div className="mt-4 grid gap-3">
            {messages.demo.walkthrough.map((step) => (
              <div key={step.title} className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
