import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  defaultLocale,
  detectLocaleFromAcceptLanguage,
  isLocale,
  localeCookieName,
  normalizeLocale,
} from "@/src/i18n/config";

const PUBLIC_FILE = /\.[^/]+$/;

function resolveLocale(request: NextRequest): string {
  const cookieValue = request.cookies.get(localeCookieName)?.value;
  if (cookieValue) {
    return normalizeLocale(cookieValue);
  }
  return detectLocaleFromAcceptLanguage(request.headers.get("accept-language"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isLocale(firstSegment)) {
    const response = NextResponse.next();
    const cookieValue = request.cookies.get(localeCookieName)?.value;
    if (cookieValue !== firstSegment) {
      response.cookies.set(localeCookieName, firstSegment, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
    }
    return response;
  }

  const locale = resolveLocale(request) || defaultLocale;
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api).*)"],
};
