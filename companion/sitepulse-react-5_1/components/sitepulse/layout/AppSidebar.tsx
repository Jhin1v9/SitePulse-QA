import type { EngineStatusItem, LoadedContext, SidebarWorkspaceItem, SitePulseActionId, SystemStatusCard } from "@/types/sitepulse";

interface AppSidebarProps {
  context: LoadedContext;
  workspaces: SidebarWorkspaceItem[];
  engines: EngineStatusItem[];
  systemStatus: SystemStatusCard;
  onAction: (actionId: SitePulseActionId) => void;
}

export function AppSidebar({ context, workspaces, engines, systemStatus, onAction }: AppSidebarProps) {
  return (
    <aside className="relative z-10 flex h-full w-[256px] shrink-0 flex-col border-r border-white/10 bg-[#0f141c]/95 backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 pb-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
              <span className="text-sm font-semibold text-white">S</span>
            </div>
            <div className="pt-0.5">
              <p className="text-[15px] font-semibold tracking-[-0.02em] text-[#eef3f8]">SitePulse</p>
              <p className="mt-0.5 text-[11px] text-[#738095]">Intelligence Operating System</p>
            </div>
          </div>
          <button type="button" onClick={() => onAction("new_session")} className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#738095] transition hover:border-white/15 hover:bg-white/10 hover:text-[#eef3f8]">+</button>
        </div>
        <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] p-3.5 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[10px] uppercase tracking-[0.14em] text-[#738095]">Loaded Context</p><p className="mt-1 font-mono text-[12px] text-[#eef3f8]">{context.targetLabel}</p></div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-green-300"><span className="h-1.5 w-1.5 rounded-full bg-green-500" />{context.syncLabel}</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {context.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.10em] text-[#738095]">{metric.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#eef3f8]">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <SectionTitle>Workspaces</SectionTitle>
        <div className="space-y-1.5">
          {workspaces.map((workspace) => (
            <button key={workspace.id} type="button" onClick={() => onAction(workspace.actionId)} className={["flex w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-left transition", workspace.isActive ? "border border-white/10 bg-white/[0.05] shadow-[0_10px_24px_rgba(0,0,0,0.16)]" : "border border-transparent hover:bg-white/[0.025]"].join(" ")}>
              <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-sm text-[#eef3f8]">{workspace.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2"><span className="text-[13px] font-medium text-[#eef3f8]">{workspace.label}</span><span className="text-[10px] uppercase tracking-[0.08em] text-[#9eabba]">{workspace.badge}</span></div>
                <p className="mt-0.5 truncate text-[11px] text-[#738095]">{workspace.description}</p>
              </div>
            </button>
          ))}
        </div>
        <SectionTitle className="mt-6">Engines</SectionTitle>
        <div className="space-y-1.5 text-[12px]">
          {engines.map((engine) => (
            <button key={engine.id} type="button" onClick={() => onAction(engine.actionId)} className="flex w-full items-center justify-between rounded-[20px] px-3 py-2.5 text-left transition hover:bg-white/[0.025]"><span className="text-[#9eabba]">{engine.label}</span><span className={engine.toneClass}>{engine.stateLabel}</span></button>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">System Status</p>
          <p className="mt-1 text-[12px] text-[#eef3f8]">{systemStatus.summary}</p>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3"><button type="button" onClick={() => onAction(systemStatus.settingsActionId)} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[#9eabba] transition hover:border-white/15 hover:bg-white/10 hover:text-[#eef3f8]">Settings</button><div className="h-8 w-8 rounded-full border border-white/10 bg-white/[0.03]" /></div>
        </div>
      </div>
    </aside>
  );
}

function SectionTitle({ children, className = "" }: { children: string; className?: string }) {
  return <p className={`mb-2 px-2 text-[11px] uppercase tracking-[0.14em] text-[#738095] ${className}`}>{children}</p>;
}
