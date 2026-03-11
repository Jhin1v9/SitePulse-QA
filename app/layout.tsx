import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Sora } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/src/components/site-shell";
import { siteConfig } from "@/src/config/site";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const headingFont = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const previewImageUrl = new URL("/og/sitepulse-studio.svg", siteConfig.url).toString();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "SitePulse Studio | QA e SEO técnico para releases sem surpresa",
    template: "%s | SitePulse Studio",
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SitePulse Studio",
    description: siteConfig.description,
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: previewImageUrl,
        width: 1200,
        height: 630,
        alt: "SitePulse Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SitePulse Studio",
    description: siteConfig.description,
    images: [previewImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "software",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
