export type SitePulseActionId =
  | "new_session" | "open_operator" | "open_findings" | "open_seo" | "open_compare"
  | "open_data_intelligence" | "open_predictive" | "open_healing" | "open_memory" | "open_settings"
  | "window_minimize" | "window_maximize" | "window_close" | "open_run_context"
  | "topbar_open_findings" | "topbar_compare" | "topbar_run_audit" | "topbar_profile"
  | "toggle_hero_collapse" | "toggle_ai_focus" | "expand_overview" | "focus_ai"
  | "select_pattern_seo_brief" | "select_pattern_issue_explanation" | "select_pattern_screenshot_package"
  | "select_pattern_fix_plan" | "select_pattern_comparison_report"
  | "response_priority_card" | "response_why_now_card" | "response_next_action_card"
  | "resize_ai_workspace" | "ai_detach" | "ai_fullscreen" | "ai_open_memory" | "ai_prepare_healing" | "ai_compare_run"
  | "queue_open_issue_pricing"
  | "live_context_open_data" | "live_context_open_impact" | "live_context_open_predictive" | "live_context_open_healing" | "live_context_open_memory"
  | "dock_prompt_score" | "dock_prompt_seo" | "dock_prompt_fix_plan" | "dock_submit";

export interface MetricItem { label: string; value: string; }
export interface LoadedContext { targetLabel: string; syncLabel: string; metrics: MetricItem[]; }
export interface SidebarWorkspaceItem { id: string; label: string; description: string; badge: string; icon: string; isActive: boolean; actionId: SitePulseActionId; }
export interface EngineStatusItem { id: string; label: string; stateLabel: string; toneClass: string; actionId: SitePulseActionId; }
export interface SystemStatusCard { summary: string; settingsActionId: SitePulseActionId; }
export interface TopbarWindowControl { id: string; label: string; actionId: SitePulseActionId; }
export interface TopbarStatusChip { id: string; label: string; className: string; leadingDot?: string; actionId: SitePulseActionId; }
export interface TopbarAction { id: string; label: string; className: string; actionId: SitePulseActionId; }
export interface TopbarContextCard { targetLabel: string; runLabel: string; subtitle: string; actionId: SitePulseActionId; }
export interface TopbarState { sessionLabel: string; windowControls: TopbarWindowControl[]; contextCard: TopbarContextCard; statusChips: TopbarStatusChip[]; actions: TopbarAction[]; profileActionId: SitePulseActionId; }
export interface HeroTag { label: string; className: string; }
export interface HeroSignal { label: string; className: string; }
export interface HeroMetric { label: string; value: string; description: string; valueClassName: string; }
export interface HeroOverviewState { title: string; description: string; tags: HeroTag[]; signals: HeroSignal[]; metrics: HeroMetric[]; collapseActionId: SitePulseActionId; }
export interface SummaryItem { label: string; value: string; }
export interface SummaryState { title: string; badgeLabel: string; items: SummaryItem[]; }
export interface FocusStripChip { label: string; className: string; }
export interface FocusStripAction { label: string; className: string; actionId: SitePulseActionId; }
export interface FocusStripState { primaryLabel: string; chips: FocusStripChip[]; actions: FocusStripAction[]; }
export interface ResponsePattern { id: string; label: string; isActive: boolean; actionId: SitePulseActionId; }
export interface ResponseCard { label: string; title: string; detail: string; titleClassName: string; actionId: SitePulseActionId; }
export interface FrameTag { label: string; className: string; }
export interface AdaptiveResponseFrameState { subtitle: string; tags: FrameTag[]; patterns: ResponsePattern[]; activePatternTitle: string; activeModeLabel: string; description: string; cards: ResponseCard[]; }
export interface AIWorkspaceCard { title: string; description: string; actionId: SitePulseActionId; }
export interface AIWorkspaceBlock { title: string; badge?: string; content: string[]; cards?: AIWorkspaceCard[]; operatorCards?: AIWorkspaceCard[]; }
export interface AIAgentWorkspaceHeaderAction { label: string; className: string; actionId: SitePulseActionId; }
export interface AIAgentWorkspaceState { subtitle: string; headerActions: AIAgentWorkspaceHeaderAction[]; blocks: AIWorkspaceBlock[]; }
export interface QueueBadge { label: string; className: string; }
export interface QueueItem { id: string; title: string; path: string; route: string; description: string; impactScore: string; badges: QueueBadge[]; actionId: SitePulseActionId; }
export interface IntelligenceQueueState { subtitle: string; tags: string[]; items: QueueItem[]; }
export interface ContextChip { label: string; actionId: SitePulseActionId; }
export interface LiveContextRow { label: string; value?: string; chips?: ContextChip[]; }
export interface LiveContextPanelState { subtitle: string; badgeLabel: string; rows: LiveContextRow[]; }
export interface DockPrompt { label: string; actionId: SitePulseActionId; }
export interface CommandDockState { subtitle: string; quickPrompts: DockPrompt[]; placeholder: string; primaryActionId: SitePulseActionId; statusChips: DockPrompt[]; footerLabel: string; }
export interface SitePulseState { context: LoadedContext; workspaces: SidebarWorkspaceItem[]; engines: EngineStatusItem[]; systemStatus: SystemStatusCard; topbar: TopbarState; hero: HeroOverviewState; summary: SummaryState; focusStrip: FocusStripState; responseFrame: AdaptiveResponseFrameState; aiWorkspace: AIAgentWorkspaceState; queue: IntelligenceQueueState; contextPanel: LiveContextPanelState; commandDock: CommandDockState; }
