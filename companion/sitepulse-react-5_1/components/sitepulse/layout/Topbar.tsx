import type { SitePulseActionId, TopbarState } from "@/types/sitepulse";

interface TopbarProps {
  topbar: TopbarState;
  onAction: (actionId: SitePulseActionId) => void;
}

export function Topbar({ topbar, onAction }: TopbarProps) {
  return (
    <header className="border-b border-white/10 bg-[#0f141c]/95 backdrop-blur-xl">
      <div className="flex h-9 items-center justify-between border-b border-white/[0.04] px-4">
        <div className="flex items-center gap-2">
          {topbar.windowControls.map((control) => (
            <button key={control.id} type="button" onClick={() => onAction(control.actionId)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-[#738095] transition hover:border-white/15 hover:bg-white/10 hover:text-[#eef3f8]">{control.label}</button>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-[#9eabba]">{topbar.sessionLabel}</div>
        <div className="w-[104px]" />
      </div>
      <div className="grid h-[72px] grid-cols-[1.1fr,0.9fr] items-center gap-6 px-5">
        <div className="flex min-w-0 items-center gap-4">
          <button type="button" onClick={() => onAction(topbar.contextCard.actionId)} className="flex min-w-0 items-center gap-3 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-left shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">◎</div>
            <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><p className="truncate font-mono text-[13px] text-[#eef3f8]">{topbar.contextCard.targetLabel}</p><span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#9eabba]">{topbar.contextCard.runLabel}</span></div><p className="truncate text-[11px] text-[#738095]">{topbar.contextCard.subtitle}</p></div>
          </button>
          <div className="hidden 2xl:flex items-center gap-2">
            {topbar.statusChips.map((chip) => (
              <button key={chip.id} type="button" onClick={() => onAction(chip.actionId)} className={chip.className}>{chip.leadingDot ? <span className={`h-2 w-2 rounded-full ${chip.leadingDot}`} /> : null}{chip.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2.5">
          {topbar.actions.map((action) => (
            <button key={action.id} type="button" onClick={() => onAction(action.actionId)} className={action.className}>{action.label}</button>
          ))}
          <button type="button" onClick={() => onAction(topbar.profileActionId)} className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">◌</button>
        </div>
      </div>
    </header>
  );
}
