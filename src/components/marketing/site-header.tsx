"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/src/i18n/config";
import { buildLocalizedPath, type RouteKey } from "@/src/i18n/path";
import type { SiteMessages } from "@/src/i18n/messages";
import { LanguageSwitcher } from "@/src/components/marketing/language-switcher";
import { ThemeToggle } from "@/src/components/marketing/theme-toggle";
import { siteConfig } from "@/src/config/site";

interface SiteHeaderProps {
  locale: Locale;
  messages: SiteMessages;
}

const navRoutes: readonly RouteKey[] = ["home", "demo", "downloads", "pricing", "faq", "contact"];

export function SiteHeader({ locale, messages }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/70 bg-white/78 shadow-[0_14px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/78 dark:shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
      <div className="content-shell flex min-w-0 items-center gap-3 py-4 lg:gap-4">
        <Link
          href={buildLocalizedPath(locale, "home")}
          className="inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-300/80 bg-white/82 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:text-studio-100"
        >
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-studio-500 to-cyan-500 text-[0.72rem] font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)]">
            SP
          </span>
          <span className="min-w-0 truncate">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 min-[1360px]:block">
          <ul className="flex min-w-0 items-center justify-center gap-1 text-sm text-slate-700 dark:text-slate-200">
            {navRoutes.map((route) => (
              <li key={route} className="min-w-0">
                <Link
                  href={buildLocalizedPath(locale, route)}
                  className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full px-3 text-sm transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                >
                  {messages.nav[route]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 min-[1360px]:flex">
          <LanguageSwitcher locale={locale} label={messages.localeSwitcherLabel} />
          <ThemeToggle darkLabel={messages.themeToggleLabel.dark} lightLabel={messages.themeToggleLabel.light} />
          <Link
            href={buildLocalizedPath(locale, "demo")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-studio-500 via-cyan-500 to-sky-500 px-5 text-sm font-semibold text-white shadow-[0_16px_42px_rgba(8,145,178,0.28)] transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
          >
            {messages.nav.primaryCta}
          </Link>
          <Link
            href={buildLocalizedPath(locale, "downloads")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/82 px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-studio-100"
          >
            {messages.nav.secondaryCta}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-300/80 bg-white/82 text-sm font-semibold text-slate-700 transition hover:border-studio-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 min-[1360px]:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? messages.nav.mobileClose : messages.nav.mobileOpen}
        >
          {mobileOpen ? "X" : "="}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-300/70 bg-white/95 px-4 pb-5 pt-4 dark:border-slate-800/70 dark:bg-slate-950/94 min-[1360px]:hidden">
          <nav aria-label="Mobile navigation" className="content-shell space-y-4">
            <ul className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
              {navRoutes.map((route) => (
                <li key={route}>
                  <Link
                    href={buildLocalizedPath(locale, route)}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 w-full items-center rounded-2xl border border-slate-300 bg-white px-4 font-medium transition hover:border-studio-300 hover:text-studio-700 dark:border-slate-700 dark:bg-slate-900/80 dark:hover:text-studio-100"
                  >
                    {messages.nav[route]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <LanguageSwitcher locale={locale} label={messages.localeSwitcherLabel} />
              <ThemeToggle darkLabel={messages.themeToggleLabel.dark} lightLabel={messages.themeToggleLabel.light} />
            </div>
            <div className="grid gap-2">
              <Link
                href={buildLocalizedPath(locale, "demo")}
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-studio-500 via-cyan-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-[0_16px_42px_rgba(8,145,178,0.28)] transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300"
              >
                {messages.nav.primaryCta}
              </Link>
              <Link
                href={buildLocalizedPath(locale, "downloads")}
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:text-studio-100"
              >
                {messages.nav.secondaryCta}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
