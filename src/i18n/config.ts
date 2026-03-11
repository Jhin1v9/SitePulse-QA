export const supportedLocales = ["es", "ca", "en"] as const;

export type Locale = (typeof supportedLocales)[number];

export const defaultLocale: Locale = "es";
export const localeCookieName = "sitepulse_locale";

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function normalizeLocale(input: string | null | undefined): Locale {
  if (!input) return defaultLocale;
  const normalized = input.toLowerCase().trim();
  if (isLocale(normalized)) return normalized;
  return defaultLocale;
}

export function detectLocaleFromAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) return defaultLocale;

  const tags = headerValue
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of tags) {
    if (tag.startsWith("ca")) return "ca";
    if (tag.startsWith("en")) return "en";
    if (tag.startsWith("es")) return "es";
  }

  return defaultLocale;
}
