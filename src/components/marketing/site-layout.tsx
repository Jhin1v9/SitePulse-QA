import type { ReactNode } from "react";
import type { Locale } from "@/src/i18n/config";
import type { SiteMessages } from "@/src/i18n/messages";
import { SiteHeader } from "@/src/components/marketing/site-header";
import { SiteFooter } from "@/src/components/marketing/site-footer";

interface MarketingLayoutProps {
  locale: Locale;
  messages: SiteMessages;
  children: ReactNode;
}

export function MarketingLayout({ locale, messages, children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} messages={messages} />
      <main id="top" className="min-w-0 flex-1">{children}</main>
      <SiteFooter locale={locale} messages={messages} />
    </div>
  );
}
