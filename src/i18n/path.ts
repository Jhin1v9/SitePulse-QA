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

export function resolveRouteKeyFromPathname(pathname: string): RouteKey | null {
  const segments = pathname.split("?")[0]?.split("#")[0]?.split("/").filter(Boolean) ?? [];

  if (segments.length === 1) {
    return "home";
  }

  const routeSegment = segments[1];
  const matchedRoute = Object.entries(routeSegments).find(([, segment]) => segment === routeSegment);
  return (matchedRoute?.[0] as RouteKey | undefined) ?? null;
}

export function resolveRouteKeyFromHref(href: string): RouteKey | null {
  const normalizedHref = href.split("#")[0];

  if (normalizedHref === "/") {
    return "home";
  }

  const routeSegment = normalizedHref.replace(/^\//, "");
  const matchedRoute = Object.entries(routeSegments).find(([, segment]) => segment === routeSegment);
  return (matchedRoute?.[0] as RouteKey | undefined) ?? null;
}
