import type { LiveContextPanelState, SitePulseActionId } from "@/types/sitepulse";

export function LiveContextPanel({ contextPanel, onAction }: { contextPanel: LiveContextPanelState; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">Live Context</p><p className="mt-1 text-[14px] text-[#eef3f8]">{contextPanel.subtitle}</p></div><span className="text-[10px] text-green-300">{contextPanel.badgeLabel}</span></div>
      <div className="mt-4 space-y-4 border-t border-white/10 pt-4 text-[13px]">
        {contextPanel.rows.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] uppercase tracking-[0.10em] text-[#738095]">{row.label}</p>
            {row.chips?.length ? <div className="mt-2 flex flex-wrap gap-2">{row.chips.map((chip) => <button key={chip.label} type="button" onClick={() => onAction(chip.actionId)} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.08em] text-[#eef3f8] transition hover:border-white/15 hover:bg-white/[0.05]">{chip.label}</button>)}</div> : <p className="mt-1 font-mono text-[#eef3f8]">{row.value}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
