import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SitePulse Hub",
  description: "App + CMD command center for SitePulse QA",
  applicationName: "SitePulse Hub",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "SitePulse Hub",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/sitepulse-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/sitepulse-icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${sora.variable} ${jetBrainsMono.variable}`}>{children}</body>
    </html>
  );
}
