import type { CommandDockState, SitePulseActionId } from "@/types/sitepulse";

export function CommandDock({ dock, onAction }: { dock: CommandDockState; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#0f141c]/96 px-10 py-5 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1420px] flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">Operator Command Dock</p><p className="mt-2 text-[14px] text-[#9eabba]">{dock.subtitle}</p></div><div className="flex flex-wrap gap-2">{dock.quickPrompts.map((prompt) => <button key={prompt.label} type="button" onClick={() => onAction(prompt.actionId)} className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-[12px] text-[#9eabba] transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]">{prompt.label}</button>)}</div></div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <div className="grid grid-cols-[1fr,86px] gap-4 items-center"><div className="flex min-h-[72px] items-center rounded-[18px] border border-white/10 bg-[#0a0d12]/90 px-5 py-4"><input type="text" placeholder={dock.placeholder} className="w-full bg-transparent text-[15px] text-[#eef3f8] outline-none placeholder:text-[#738095]" /></div><button type="button" onClick={() => onAction(dock.primaryActionId)} className="h-[72px] w-[86px] rounded-[18px] border border-blue-500/25 bg-blue-500/10 text-blue-200 transition hover:border-blue-500/40 hover:bg-blue-500/16 active:scale-[0.98]">→</button></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2 text-[11px] text-[#738095]">{dock.statusChips.map((chip) => <button key={chip.label} type="button" onClick={() => onAction(chip.actionId)} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]">{chip.label}</button>)}</div><p className="text-[11px] text-[#738095]">{dock.footerLabel}</p></div>
        </div>
      </div>
    </div>
  );
}
