import type { MetadataRoute } from "next";
import { siteConfig } from "@/src/config/site";
import { supportedLocales } from "@/src/i18n/config";

const routes = ["", "demo", "downloads", "pricing", "faq", "contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return supportedLocales.flatMap((locale) =>
    routes.map((route) => {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      return {
        url: new URL(path, siteConfig.url).toString(),
        lastModified: now,
        changeFrequency: route === "" ? "weekly" : "monthly",
        priority: route === "" ? 1 : 0.8,
      };
    }),
  );
}
