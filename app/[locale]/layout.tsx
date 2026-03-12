import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { supportedLocales, type Locale, isLocale } from "@/src/i18n/config";
import { getMessages } from "@/src/i18n/messages";
import { LocaleDocument } from "@/src/components/marketing/locale-document";
import { MarketingLayout } from "@/src/components/marketing/site-layout";

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as Locale;
  const messages = getMessages(locale);

  return (
    <>
      <LocaleDocument locale={locale} />
      <MarketingLayout locale={locale} messages={messages}>{children}</MarketingLayout>
    </>
  );
}
