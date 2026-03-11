import type { Locale } from "@/src/i18n/config";

export const routeSegments = {
  home: "",
  demo: "demo",
  downloads: "downloads",
  pricing: "pricing",
  faq: "faq",
  contact: "contact",
} as const;

export type RouteKey = keyof typeof routeSegments;

export function buildLocalizedPath(locale: Locale, route: RouteKey): string {
  const segment = routeSegments[route];
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}

export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${locale}`;
  segments[0] = locale;
  return `/${segments.join("/")}`;
}
