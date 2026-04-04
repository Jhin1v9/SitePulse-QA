import type { Dispatch, SetStateAction } from "react";
import type { SitePulseActionId, SitePulseState } from "@/types/sitepulse";

interface CreateDefaultActionRegistryOptions {
  getState: () => SitePulseState;
  setState: Dispatch<SetStateAction<SitePulseState>>;
  onToggleHeroCollapse: () => void;
  onToggleAIFocus: () => void;
  onSetAIFocus: (value: boolean) => void;
  onSetAIWorkspaceHeight: (value: number) => void;
}

export type ActionRegistry = Record<SitePulseActionId, () => void>;

function announce(actionId: SitePulseActionId, description: string) {
  console.info(`[sitepulse-action] ${actionId}: ${description}`);
}

export function createDefaultActionRegistry({ getState, setState, onToggleHeroCollapse, onToggleAIFocus, onSetAIFocus, onSetAIWorkspaceHeight }: CreateDefaultActionRegistryOptions): ActionRegistry {
  return {
    new_session: () => announce("new_session", "Create new AI operator session"),
    open_operator: () => announce("open_operator", "Switch to Operator workspace"),
    open_findings: () => announce("open_findings", "Switch to Findings workspace"),
    open_seo: () => announce("open_seo", "Switch to SEO workspace"),
    open_compare: () => announce("open_compare", "Switch to Compare workspace"),
    open_data_intelligence: () => announce("open_data_intelligence", "Open Data Intelligence surface"),
    open_predictive: () => announce("open_predictive", "Open Predictive Intelligence surface"),
    open_healing: () => announce("open_healing", "Open Healing queue"),
    open_memory: () => announce("open_memory", "Open Memory panel"),
    open_settings: () => announce("open_settings", "Open Settings workspace"),
    window_minimize: () => announce("window_minimize", "Minimize desktop window"),
    window_maximize: () => announce("window_maximize", "Toggle maximize desktop window"),
    window_close: () => announce("window_close", "Close desktop window"),
    open_run_context: () => announce("open_run_context", "Open run context details"),
    topbar_open_findings: () => announce("topbar_open_findings", "Open findings from topbar"),
    topbar_compare: () => announce("topbar_compare", "Open compare from topbar"),
    topbar_run_audit: () => announce("topbar_run_audit", "Run audit"),
    topbar_profile: () => announce("topbar_profile", "Open operator profile"),
    toggle_hero_collapse: () => onToggleHeroCollapse(),
    toggle_ai_focus: () => onToggleAIFocus(),
    expand_overview: () => onToggleHeroCollapse(),
    focus_ai: () => onToggleAIFocus(),
    select_pattern_seo_brief: () => announce("select_pattern_seo_brief", "Select SEO priority brief pattern"),
    select_pattern_issue_explanation: () => announce("select_pattern_issue_explanation", "Select issue explanation pattern"),
    select_pattern_screenshot_package: () => announce("select_pattern_screenshot_package", "Select screenshot package pattern"),
    select_pattern_fix_plan: () => announce("select_pattern_fix_plan", "Select fix plan pattern"),
    select_pattern_comparison_report: () => announce("select_pattern_comparison_report", "Select comparison report pattern"),
    response_priority_card: () => announce("response_priority_card", "Open priority rationale"),
    response_why_now_card: () => announce("response_why_now_card", "Open why-now rationale"),
    response_next_action_card: () => announce("response_next_action_card", "Open next action"),
    resize_ai_workspace: () => { onSetAIWorkspaceHeight(620); announce("resize_ai_workspace", "Resize AI workspace"); },
    ai_detach: () => announce("ai_detach", "Detach AI workspace"),
    ai_fullscreen: () => onSetAIFocus(true),
    ai_open_memory: () => announce("ai_open_memory", "Open memory from AI card"),
    ai_prepare_healing: () => announce("ai_prepare_healing", "Prepare healing from AI card"),
    ai_compare_run: () => announce("ai_compare_run", "Compare previous run from AI card"),
    queue_open_issue_pricing: () => announce("queue_open_issue_pricing", "Open /pricing issue detail"),
    live_context_open_data: () => announce("live_context_open_data", "Open data layer context"),
    live_context_open_impact: () => announce("live_context_open_impact", "Open impact layer context"),
    live_context_open_predictive: () => announce("live_context_open_predictive", "Open predictive layer context"),
    live_context_open_healing: () => announce("live_context_open_healing", "Open healing layer context"),
    live_context_open_memory: () => announce("live_context_open_memory", "Open memory layer context"),
    dock_prompt_score: () => { announce("dock_prompt_score", "Prefill score prompt"); setState((current) => current); },
    dock_prompt_seo: () => { announce("dock_prompt_seo", "Prefill SEO prompt"); setState((current) => current); },
    dock_prompt_fix_plan: () => { announce("dock_prompt_fix_plan", "Prefill fix plan prompt"); setState((current) => current); },
    dock_submit: () => { announce("dock_submit", `Submit prompt for ${getState().context.targetLabel}`); },
  };
}
