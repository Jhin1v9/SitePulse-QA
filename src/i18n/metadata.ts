import type { Metadata } from "next";
import { siteConfig } from "@/src/config/site";
import { supportedLocales, type Locale } from "@/src/i18n/config";

interface LocalizedMetadataInput {
  locale: Locale;
  title: string;
  description: string;
  route: "" | "demo" | "downloads" | "pricing" | "faq" | "contact";
}

function localePath(locale: Locale, route: LocalizedMetadataInput["route"]): string {
  return route ? `/${locale}/${route}` : `/${locale}`;
}

export function buildLocalizedUrl(locale: Locale, route: LocalizedMetadataInput["route"]): string {
  return new URL(localePath(locale, route), siteConfig.url).toString();
}

export function createLocalizedMetadata({
  locale,
  title,
  description,
  route,
}: LocalizedMetadataInput): Metadata {
  const canonicalUrl = buildLocalizedUrl(locale, route);
  const previewImageUrl = new URL("/og/sitepulse-studio.svg", siteConfig.url).toString();

  const languageAlternates = Object.fromEntries(
    supportedLocales.map((code) => [code, buildLocalizedUrl(code, route)]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: "website",
      locale,
      images: [
        {
          url: previewImageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImageUrl],
    },
  };
}
