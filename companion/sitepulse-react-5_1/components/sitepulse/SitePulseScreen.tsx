"use client";

import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/sitepulse/layout/AppSidebar";
import { Topbar } from "@/components/sitepulse/layout/Topbar";
import { HeroOverview } from "@/components/sitepulse/sections/HeroOverview";
import { StickyFocusStrip } from "@/components/sitepulse/sections/StickyFocusStrip";
import { AdaptiveResponseFrame } from "@/components/sitepulse/sections/AdaptiveResponseFrame";
import { ResizeHandle } from "@/components/sitepulse/sections/ResizeHandle";
import { AIAgentWorkspace } from "@/components/sitepulse/sections/AIAgentWorkspace";
import { IntelligenceQueue } from "@/components/sitepulse/sections/IntelligenceQueue";
import { LiveContextPanel } from "@/components/sitepulse/panels/LiveContextPanel";
import { CommandDock } from "@/components/sitepulse/sections/CommandDock";
import { createDefaultActionRegistry, type ActionRegistry, type SitePulseActionId } from "@/lib/sitepulse-actions";
import type { SitePulseState } from "@/types/sitepulse";

interface SitePulseScreenProps {
  initialState: SitePulseState;
}

export function SitePulseScreen({ initialState }: SitePulseScreenProps) {
  const [state, setState] = useState<SitePulseState>(initialState);
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [isAIFocused, setIsAIFocused] = useState(false);
  const [aiWorkspaceHeight, setAiWorkspaceHeight] = useState<number>(520);

  const actions = useMemo<ActionRegistry>(() => createDefaultActionRegistry({
    getState: () => state,
    setState,
    onToggleHeroCollapse: () => setIsHeroCollapsed((current) => !current),
    onToggleAIFocus: () => setIsAIFocused((current) => !current),
    onSetAIFocus: (value) => setIsAIFocused(value),
    onSetAIWorkspaceHeight: (value) => setAiWorkspaceHeight(value),
  }), [state]);

  const handleAction = (actionId: SitePulseActionId) => {
    actions[actionId]?.();
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-[#0a0d12] text-[#eef3f8] antialiased">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-[16%] top-[-120px] h-[340px] w-[340px] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute right-[10%] top-[160px] h-[220px] w-[220px] rounded-full bg-cyan-400/10 blur-[110px]" />
      </div>

      <AppSidebar context={state.context} workspaces={state.workspaces} engines={state.engines} systemStatus={state.systemStatus} onAction={handleAction} />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col bg-[#0a0d12]">
        <Topbar topbar={state.topbar} onAction={handleAction} />
        <main className="flex min-h-0 flex-1 flex-col">
          {!isHeroCollapsed ? <HeroOverview hero={state.hero} summary={state.summary} onAction={handleAction} /> : null}
          <StickyFocusStrip strip={state.focusStrip} isHeroCollapsed={isHeroCollapsed} isAIFocused={isAIFocused} onAction={handleAction} />
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-10 pb-[18rem] pt-6">
              <div className={["mx-auto grid w-full max-w-[1420px] gap-6", isAIFocused ? "grid-cols-1" : "grid-cols-[1fr,320px]"].join(" ")}>
                <div className="space-y-4">
                  <AdaptiveResponseFrame frame={state.responseFrame} onAction={handleAction} />
                  <ResizeHandle aiWorkspaceHeight={aiWorkspaceHeight} onHeightChange={(value) => setAiWorkspaceHeight(value)} />
                  <AIAgentWorkspace workspace={state.aiWorkspace} height={aiWorkspaceHeight} onAction={handleAction} />
                  <IntelligenceQueue queue={state.queue} onAction={handleAction} />
                </div>
                {!isAIFocused ? <div className="space-y-4"><LiveContextPanel contextPanel={state.contextPanel} onAction={handleAction} /></div> : null}
              </div>
            </div>
            <CommandDock dock={state.commandDock} onAction={handleAction} />
          </div>
        </main>
      </div>
    </div>
  );
}
