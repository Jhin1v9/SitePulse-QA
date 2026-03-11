"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, supportedLocales, type Locale } from "@/src/i18n/config";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

const flags: Record<Locale, string> = {
  es: "ES",
  ca: "CA",
  en: "EN",
};

const names: Record<Locale, string> = {
  es: "Espanol",
  ca: "Catala",
  en: "English",
};

function buildLocalizedPath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${locale}`;
  segments[0] = locale;
  return `/${segments.join("/")}`;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
      <span className="hidden sm:inline">{label}</span>
      <select
        aria-label={label}
        className="h-10 rounded-full border border-slate-300 bg-white/80 px-3 text-xs font-semibold tracking-[0.1em] text-slate-700 outline-none transition focus-visible:ring-2 focus-visible:ring-studio-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const nextLocale = event.target.value as Locale;
          if (!supportedLocales.includes(nextLocale)) return;
          const localizedPath = buildLocalizedPath(pathname, nextLocale);
          document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
          startTransition(() => {
            router.push(localizedPath);
          });
        }}
      >
        {supportedLocales.map((entry) => (
          <option key={entry} value={entry}>{`${flags[entry]} - ${names[entry]}`}</option>
        ))}
      </select>
    </label>
  );
}
