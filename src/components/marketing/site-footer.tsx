import Link from "next/link";
import type { Locale } from "@/src/i18n/config";
import { buildLocalizedPath } from "@/src/i18n/path";
import type { SiteMessages } from "@/src/i18n/messages";
import { siteConfig } from "@/src/config/site";

interface SiteFooterProps {
  locale: Locale;
  messages: SiteMessages;
}

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  return (
    <footer className="border-t border-slate-300/70 dark:border-slate-800/70">
      <div className="content-shell grid min-w-0 gap-4 py-8 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] sm:items-end">
        <div className="min-w-0 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-800 dark:text-slate-100">{siteConfig.legalName}</p>
          <p>{messages.footer.tagline}</p>
          <p>
            {new Date().getUTCFullYear()} {siteConfig.name}. {messages.footer.rights}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap justify-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-200 sm:justify-end">
          <Link href={buildLocalizedPath(locale, "faq")} className="hover:text-studio-700 dark:hover:text-studio-100">
            {messages.footer.docs}
          </Link>
          <Link href={buildLocalizedPath(locale, "faq")} className="hover:text-studio-700 dark:hover:text-studio-100">
            {messages.footer.privacy}
          </Link>
          <Link href={buildLocalizedPath(locale, "contact")} className="hover:text-studio-700 dark:hover:text-studio-100">
            {messages.footer.contact}
          </Link>
        </div>
      </div>
    </footer>
  );
}
