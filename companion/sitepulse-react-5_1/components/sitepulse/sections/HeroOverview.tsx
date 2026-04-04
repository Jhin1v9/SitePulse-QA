import type { HeroOverviewState, SitePulseActionId, SummaryState } from "@/types/sitepulse";

export function HeroOverview({ hero, summary, onAction }: { hero: HeroOverviewState; summary: SummaryState; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <section className="border-b border-white/10 px-10 py-7">
      <div className="mx-auto grid w-full max-w-[1420px] grid-cols-[1.32fr,0.68fr] gap-6">
        <div className="rounded-[22px] border border-white/10 bg-gradient-to-b from-white/[0.025] to-white/[0.01] px-7 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <div className="mb-4 flex flex-wrap items-center gap-2.5">{hero.tags.map((tag) => <span key={tag.label} className={tag.className}>{tag.label}</span>)}</div>
          <div className="grid grid-cols-[1fr,360px] gap-8 items-start">
            <div>
              <div className="mb-4 flex items-center justify-between gap-4"><h1 className="text-[44px] font-semibold tracking-[-0.045em] text-[#eef3f8]">{hero.title}</h1><button type="button" onClick={() => onAction(hero.collapseActionId)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] text-[#9eabba] transition hover:border-white/15 hover:bg-white/10 hover:text-[#eef3f8]">Collapse to strip</button></div>
              <p className="max-w-3xl text-[15px] leading-8 text-[#9eabba]">{hero.description}</p>
              <div className="mt-5 flex flex-wrap gap-2.5 text-[12px]">{hero.signals.map((signal) => <span key={signal.label} className={signal.className}>{signal.label}</span>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">{hero.metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"><p className="text-[10px] uppercase tracking-[0.12em] text-[#738095]">{metric.label}</p><p className={`mt-2 text-[28px] font-semibold tracking-[-0.03em] ${metric.valueClassName}`}>{metric.value}</p><p className="mt-1 text-[11px] text-[#738095]">{metric.description}</p></div>)}</div>
          </div>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-6 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">System Summary</p><p className="mt-1 text-[14px] text-[#eef3f8]">{summary.title}</p></div><span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-green-300">{summary.badgeLabel}</span></div>
          <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-[13px]">{summary.items.map((item) => <div key={item.label}><p className="text-[10px] uppercase tracking-[0.12em] text-[#738095]">{item.label}</p><p className="mt-1 text-[#eef3f8]">{item.value}</p></div>)}</div>
        </div>
      </div>
    </section>
  );
}
