import type { FocusStripState, SitePulseActionId } from "@/types/sitepulse";

export function StickyFocusStrip({ strip, isHeroCollapsed, isAIFocused, onAction }: { strip: FocusStripState; isHeroCollapsed: boolean; isAIFocused: boolean; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <section className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0d12]/92 px-10 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1420px] items-center justify-between gap-4 rounded-[18px] border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
        <div className="flex min-w-0 items-center gap-3"><p className="truncate text-[14px] font-medium text-[#eef3f8]">{strip.primaryLabel}</p>{strip.chips.map((chip) => <span key={chip.label} className={chip.className}>{chip.label}</span>)}<span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#738095]">Hero {isHeroCollapsed ? "collapsed" : "expanded"}</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#738095]">AI {isAIFocused ? "focused" : "normal"}</span></div>
        <div className="flex items-center gap-2">{strip.actions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action.actionId)} className={action.className}>{action.label}</button>)}</div>
      </div>
    </section>
  );
}
