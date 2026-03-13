import type { Locale } from "@/src/i18n/config";

const dateLocales: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
  ca: "ca-ES",
};

export function formatIsoDate(dateString: string, locale: Locale = "en"): string {
  const formatted = new Intl.DateTimeFormat(dateLocales[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dateString}T00:00:00.000Z`));

  return formatted;
}
