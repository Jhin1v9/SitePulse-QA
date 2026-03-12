"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, supportedLocales, type Locale } from "@/src/i18n/config";
import { replaceLocaleInPath } from "@/src/i18n/path";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

const localeMeta: Record<Locale, { flag: string; code: string; name: string }> = {
  es: { flag: "🇪🇸", code: "ES", name: "Espanol" },
  ca: { flag: "🏴", code: "CA", name: "Catala" },
  en: { flag: "🇬🇧", code: "EN", name: "English" },
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (nextLocale: Locale) => {
    if (nextLocale === locale) {
      return;
    }

    const localizedPath = replaceLocaleInPath(pathname, nextLocale);
    document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.push(localizedPath);
    });
  };

  return (
    <div className="inline-flex min-w-0 items-center gap-2">
      <span className="hidden text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:inline">
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex items-center gap-1 rounded-full border border-slate-300/80 bg-white/80 p-1 dark:border-slate-700/80 dark:bg-slate-900/70"
      >
        {supportedLocales.map((entry) => {
          const active = entry === locale;
          const meta = localeMeta[entry];

          return (
            <button
              key={entry}
              type="button"
              aria-pressed={active}
              aria-label={`${label}: ${meta.name}`}
              disabled={isPending}
              onClick={() => handleChange(entry)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 ${
                active
                  ? "bg-studio-500 text-white shadow-[0_10px_24px_rgba(8,145,178,0.28)]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
              }`}
            >
              <span aria-hidden>{meta.flag}</span>
              <span>{meta.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
