"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { localeCookieName, supportedLocales, type Locale } from "@/src/i18n/config";
import { replaceLocaleInPath } from "@/src/i18n/path";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

const localeMeta: Record<Locale, { name: string }> = {
  es: { name: "Espanol" },
  ca: { name: "Catala" },
  en: { name: "English" },
};

interface FlagIconProps {
  locale: Locale;
}

function FlagIcon({ locale }: FlagIconProps) {
  if (locale === "es") {
    return (
      <svg aria-hidden viewBox="0 0 24 18" className="h-4 w-5 overflow-hidden rounded-[0.35rem] shadow-sm">
        <rect width="24" height="18" fill="#AA151B" />
        <rect y="4.5" width="24" height="9" fill="#F1BF00" />
      </svg>
    );
  }

  if (locale === "ca") {
    return (
      <svg aria-hidden viewBox="0 0 24 18" className="h-4 w-5 overflow-hidden rounded-[0.35rem] shadow-sm">
        <rect width="24" height="18" fill="#F9D64A" />
        <rect y="1" width="24" height="2" fill="#C62828" />
        <rect y="5" width="24" height="2" fill="#C62828" />
        <rect y="9" width="24" height="2" fill="#C62828" />
        <rect y="13" width="24" height="2" fill="#C62828" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 24 18" className="h-4 w-5 overflow-hidden rounded-[0.35rem] shadow-sm">
      <rect width="24" height="18" fill="#0A3A8A" />
      <path d="M0 0 L10 0 L24 10 L24 18 L14 18 L0 8 Z" fill="#fff" opacity="0.95" />
      <path d="M24 0 L14 0 L0 10 L0 18 L10 18 L24 8 Z" fill="#fff" opacity="0.95" />
      <path d="M0 0 L8 0 L24 12 L24 18 L16 18 L0 6 Z" fill="#C62828" />
      <path d="M24 0 L16 0 L0 12 L0 18 L8 18 L24 6 Z" fill="#C62828" />
      <rect x="9" width="6" height="18" fill="#fff" />
      <rect y="6" width="24" height="6" fill="#fff" />
      <rect x="10" width="4" height="18" fill="#C62828" />
      <rect y="7" width="24" height="4" fill="#C62828" />
    </svg>
  );
}

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
              <FlagIcon locale={entry} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
