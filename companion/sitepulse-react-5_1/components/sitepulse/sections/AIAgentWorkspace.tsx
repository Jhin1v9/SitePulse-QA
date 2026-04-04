import type { AIAgentWorkspaceState, SitePulseActionId } from "@/types/sitepulse";

export function AIAgentWorkspace({ workspace, height, onAction }: { workspace: AIAgentWorkspaceState; height: number; onAction: (actionId: SitePulseActionId) => void; }) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] shadow-[0_10px_24px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4"><div><p className="text-[11px] uppercase tracking-[0.14em] text-[#738095]">AI Agent Workspace</p><p className="mt-1 text-[14px] text-[#eef3f8]">{workspace.subtitle}</p></div><div className="flex items-center gap-2">{workspace.headerActions.map((action) => <button key={action.label} type="button" onClick={() => onAction(action.actionId)} className={action.className}>{action.label}</button>)}</div></div>
      <div className="overflow-y-auto px-6 py-6" style={{ maxHeight: `${height}px` }}>
        <div className="space-y-5">
          {workspace.blocks.map((block) => (
            <div key={block.title} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-[#738095]"><span>{block.title}</span>{block.badge ? <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 normal-case tracking-normal text-[10px] text-[#738095]">{block.badge}</span> : null}</div>
              {block.content.map((paragraph) => <p key={paragraph} className="text-[15px] leading-8 text-[#eef3f8]">{paragraph}</p>)}
              {block.cards?.length ? <div className="mt-4 grid grid-cols-2 gap-4">{block.cards.map((card) => <button key={card.title} type="button" onClick={() => onAction(card.actionId)} className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:border-white/15 hover:bg-white/[0.05]"><p className="text-[10px] uppercase tracking-[0.12em] text-[#738095]">{card.title}</p><p className="mt-3 text-[14px] text-[#eef3f8]">{card.description}</p></button>)}</div> : null}
              {block.operatorCards?.length ? <div className="mt-4 grid grid-cols-3 gap-3">{block.operatorCards.map((card) => <button key={card.title} type="button" onClick={() => onAction(card.actionId)} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.05]"><p className="text-[10px] uppercase tracking-[0.12em] text-[#738095]">{card.title}</p><p className="mt-2 text-[13px] text-[#eef3f8]">{card.description}</p></button>)}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
