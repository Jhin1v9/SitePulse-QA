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
    <header className="sticky top-0 z-50 border-b border-slate-300/70 bg-white/85 backdrop-blur dark:border-slate-800/70 dark:bg-slate-950/85">
      <div className="content-shell flex min-w-0 items-center gap-3 py-3">
        <Link
          href={buildLocalizedPath(locale, "home")}
          className="inline-flex min-w-0 items-center gap-3 rounded-full border border-slate-300 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:text-studio-200"
        >
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-studio-500/15 text-[0.68rem] font-bold uppercase tracking-wider text-studio-700 dark:text-studio-100">
            SP
          </span>
          <span className="truncate">{siteConfig.name}</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden min-w-0 flex-1 lg:block">
          <ul className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
            {navRoutes.map((route) => (
              <li key={route}>
                <Link
                  href={buildLocalizedPath(locale, route)}
                  className="inline-flex h-9 items-center justify-center rounded-full px-4 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:hover:bg-slate-800/70 dark:hover:text-white"
                >
                  {messages.nav[route]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <LanguageSwitcher locale={locale} label={messages.localeSwitcherLabel} />
          <ThemeToggle darkLabel={messages.themeToggleLabel.dark} lightLabel={messages.themeToggleLabel.light} />
          <Link
            href={buildLocalizedPath(locale, "demo")}
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 text-sm font-semibold text-slate-700 transition hover:border-studio-300 hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:text-studio-100"
          >
            {messages.nav.primaryCta}
          </Link>
          <Link
            href={buildLocalizedPath(locale, "downloads")}
            className="inline-flex h-10 items-center justify-center rounded-full border border-studio-400/70 bg-studio-500/20 px-4 text-sm font-semibold text-studio-700 transition hover:bg-studio-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:text-studio-100"
          >
            {messages.nav.secondaryCta}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-sm font-semibold text-slate-700 transition hover:border-studio-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? messages.nav.mobileClose : messages.nav.mobileOpen}
        >
          {mobileOpen ? "X" : "="}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-300/70 bg-white/95 px-4 pb-4 pt-3 dark:border-slate-800/70 dark:bg-slate-950/95 lg:hidden">
          <nav aria-label="Mobile navigation" className="content-shell">
            <ul className="grid gap-2 text-sm text-slate-700 dark:text-slate-200">
              {navRoutes.map((route) => (
                <li key={route}>
                  <Link
                    href={buildLocalizedPath(locale, route)}
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-10 w-full items-center rounded-xl border border-slate-300 bg-white px-3 font-medium transition hover:border-studio-300 dark:border-slate-700 dark:bg-slate-900/80"
                  >
                    {messages.nav[route]}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <LanguageSwitcher locale={locale} label={messages.localeSwitcherLabel} />
              <ThemeToggle darkLabel={messages.themeToggleLabel.dark} lightLabel={messages.themeToggleLabel.light} />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
