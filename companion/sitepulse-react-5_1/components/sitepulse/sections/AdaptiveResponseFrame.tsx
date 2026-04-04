import type { AdaptiveResponseFrameState, SitePulseActionId } from "@/types/sitepulse";

export function AdaptiveResponseFrame({ frame, onAction }: { frame: AdaptiveResponseFrameState; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-white/[0.03] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4"><div><p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">Adaptive Response Frame</p><p className="mt-1 text-[14px] text-[#eef3f8]">{frame.subtitle}</p></div><div className="flex items-center gap-2 text-[11px] text-[#738095]">{frame.tags.map((tag) => <span key={tag.label} className={tag.className}>{tag.label}</span>)}</div></div>
      <div className="grid grid-cols-[220px,1fr] gap-0">
        <div className="border-r border-white/10 bg-white/[0.015] p-4"><p className="mb-3 text-[10px] uppercase tracking-[0.12em] text-[#738095]">Delivery Patterns</p><div className="space-y-2 text-[12px]">{frame.patterns.map((pattern) => <button key={pattern.id} type="button" onClick={() => onAction(pattern.actionId)} className={[ "w-full rounded-2xl px-3 py-2 text-left transition", pattern.isActive ? "border border-white/10 bg-white/[0.04] text-[#eef3f8]" : "border border-transparent text-[#9eabba] hover:bg-white/[0.025]" ].join(" ")}>{pattern.label}</button>)}</div></div>
        <div className="p-6">
          <div className="mb-4 flex items-start gap-4"><div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-gradient-to-br from-blue-500 to-cyan-400 text-[11px] font-semibold text-white">AI</div><div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2"><span className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">{frame.activePatternTitle}</span><span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#738095]">{frame.activeModeLabel}</span></div><p className="text-[15px] leading-8 text-[#eef3f8]">{frame.description}</p></div></div>
          <div className="grid grid-cols-3 gap-3">{frame.cards.map((card) => <button key={card.label} type="button" onClick={() => onAction(card.actionId)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"><p className="text-[10px] uppercase tracking-[0.12em] text-[#738095]">{card.label}</p><p className={`mt-2 text-[14px] font-medium ${card.titleClassName}`}>{card.title}</p><p className="mt-2 text-[12px] text-[#738095]">{card.detail}</p></button>)}</div>
        </div>
      </div>
    </section>
  );
}
