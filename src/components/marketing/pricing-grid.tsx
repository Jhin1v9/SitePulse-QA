import Link from "next/link";
import type { MarketingContent } from "@/src/config/marketing-content";
import type { Locale } from "@/src/i18n/config";
import type { PlanItem } from "@/src/i18n/messages";
import { buildLocalizedPath } from "@/src/i18n/path";

interface PricingGridProps {
  locale: Locale;
  plans: readonly PlanItem[];
  labels: MarketingContent["pricing"];
}

export function PricingGrid({ locale, plans, labels }: PricingGridProps) {
  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-3">
      {plans.map((plan) => {
        const badgeLabel = plan.recommended ? labels.recommendedBadge : labels.standardBadge;
        const accentLabel = plan.id === "starter" ? labels.entryLabel : plan.id === "pro" ? labels.primaryLabel : labels.enterpriseLabel;

        return (
          <article
            key={plan.id}
            className={`panel flex h-full min-w-0 flex-col rounded-[1.8rem] p-6 sm:p-7 ${
              plan.recommended
                ? "border-studio-400/80 bg-gradient-to-br from-white via-cyan-50/85 to-sky-50/90 shadow-[0_24px_70px_rgba(8,145,178,0.2)] dark:from-slate-900/92 dark:via-slate-900/82 dark:to-cyan-950/35"
                : ""
            }`}
          >
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{badgeLabel}</p>
                <h3 className="mt-3 break-words text-[clamp(1.5rem,4.2vw,1.9rem)] font-semibold text-slate-950 dark:text-slate-100">{plan.name}</h3>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] ${
                  plan.recommended
                    ? "border-studio-400/70 bg-studio-500/10 text-studio-700 dark:text-studio-100"
                    : "border-slate-300/80 text-slate-600 dark:border-slate-700/80 dark:text-slate-300"
                }`}
              >
                {accentLabel}
              </span>
            </div>

            <div className="mt-5 rounded-[1.35rem] border border-slate-300/80 bg-white/75 p-4 dark:border-slate-700/80 dark:bg-slate-950/50">
              <p className="text-3xl font-semibold text-slate-950 dark:text-slate-100">{plan.price}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{plan.billing}</p>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-700 dark:text-slate-300">{plan.description}</p>

            <ul className="mt-5 flex-1 space-y-3 text-sm text-slate-700 dark:text-slate-300">
              {plan.features.map((feature) => (
                <li key={feature} className="flex min-w-0 items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-studio-500" aria-hidden />
                  <span className="min-w-0 break-words">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={buildLocalizedPath(locale, plan.ctaRoute)}
              className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-studio-300 ${
                plan.recommended
                  ? "bg-gradient-to-r from-studio-500 via-cyan-500 to-sky-500 text-white shadow-[0_16px_44px_rgba(8,145,178,0.3)] hover:-translate-y-0.5 hover:brightness-110"
                  : "border border-slate-300 bg-white/80 text-slate-700 hover:border-studio-300 hover:text-studio-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:text-studio-100"
              }`}
            >
              {plan.ctaLabel}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
