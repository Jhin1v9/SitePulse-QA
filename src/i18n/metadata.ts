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

export function createLocalizedMetadata({
  locale,
  title,
  description,
  route,
}: LocalizedMetadataInput): Metadata {
  const canonicalPath = localePath(locale, route);
  const canonicalUrl = new URL(canonicalPath, siteConfig.url).toString();
  const previewImageUrl = new URL("/og/sitepulse-studio.svg", siteConfig.url).toString();

  const languageAlternates = Object.fromEntries(
    supportedLocales.map((code) => [code, new URL(localePath(code, route), siteConfig.url).toString()]),
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
