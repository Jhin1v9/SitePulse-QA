import Link from "next/link";
import { getMarketingContent } from "@/src/config/marketing-content";
import { siteConfig } from "@/src/config/site";
import type { Locale } from "@/src/i18n/config";
import type { SiteMessages } from "@/src/i18n/messages";
import { localizeHref } from "@/src/i18n/path";

interface SiteFooterProps {
  locale: Locale;
  messages: SiteMessages;
}

export function SiteFooter({ locale, messages }: SiteFooterProps) {
  const marketing = getMarketingContent(locale);

  return (
    <footer className="border-t border-slate-300/70 dark:border-slate-800/70">
      <div className="content-shell grid min-w-0 gap-8 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:py-14">
        <div className="min-w-0 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 dark:text-slate-100">{siteConfig.legalName}</p>
            <p className="max-w-xl leading-7">{marketing.footer.description}</p>
          </div>
          <div className="space-y-1">
            <p className="break-words">{messages.footer.tagline}</p>
            <p>
              {new Date().getUTCFullYear()} {siteConfig.name}. {messages.footer.rights}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 sm:grid-cols-3">
          {marketing.footer.groups.map((group) => (
            <div key={group.title} className="min-w-0 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{group.title}</p>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {group.links.map((link) => {
                  const href = link.external ? link.href : localizeHref(locale, link.href);
                  const commonClassName = "inline-flex min-w-0 break-words transition hover:text-studio-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 dark:hover:text-studio-100";

                  return (
                    <li key={`${group.title}-${link.label}`}>
                      {link.external ? (
                        <a href={href} target="_blank" rel="noreferrer" className={commonClassName}>
                          {link.label}
                        </a>
                      ) : (
                        <Link href={href} className={commonClassName}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
