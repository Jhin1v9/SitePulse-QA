import type { SitePulseState } from "@/types/sitepulse";

export function buildSitePulseMockState(): SitePulseState {
  return {
    context: { targetLabel: "sitepulse.io", syncLabel: "synced", metrics: [{ label: "Score", value: "72" }, { label: "P0/P1", value: "4" }, { label: "Run", value: "#284" }] },
    workspaces: [
      { id: "operator", label: "Operator", description: "AI workspace and command execution", badge: "active", icon: "◉", isActive: true, actionId: "open_operator" },
      { id: "findings", label: "Findings", description: "Priority queue and issue detail", badge: "15", icon: "≣", isActive: false, actionId: "open_findings" },
      { id: "seo", label: "SEO", description: "Visibility, metadata, indexing", badge: "7", icon: "↗", isActive: false, actionId: "open_seo" },
      { id: "compare", label: "Compare", description: "Regression and baseline diff", badge: "Δ", icon: "△", isActive: false, actionId: "open_compare" },
    ],
    engines: [
      { id: "data", label: "Data Intelligence", stateLabel: "live", toneClass: "text-green-300", actionId: "open_data_intelligence" },
      { id: "predictive", label: "Predictive", stateLabel: "watching", toneClass: "text-yellow-200", actionId: "open_predictive" },
      { id: "healing", label: "Healing", stateLabel: "3 pending", toneClass: "text-[#738095]", actionId: "open_healing" },
      { id: "memory", label: "Memory", stateLabel: "strong", toneClass: "text-green-300", actionId: "open_memory" },
    ],
    systemStatus: { summary: "Operator online · memory attached", settingsActionId: "open_settings" },
    topbar: {
      sessionLabel: "SitePulse AI Focus Session",
      windowControls: [{ id: "min", label: "—", actionId: "window_minimize" }, { id: "max", label: "□", actionId: "window_maximize" }, { id: "close", label: "×", actionId: "window_close" }],
      contextCard: { targetLabel: "sitepulse.io", runLabel: "#284", subtitle: "baseline-connected · production profile", actionId: "open_run_context" },
      statusChips: [
        { id: "ready", label: "engine ready", className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[#eef3f8]", leadingDot: "bg-green-500", actionId: "open_data_intelligence" },
        { id: "quality", label: "quality degrading", className: "inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-[12px] text-yellow-200", actionId: "open_findings" },
        { id: "predictive", label: "predictive risk high", className: "inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12px] text-red-200", actionId: "open_predictive" },
        { id: "healing", label: "healing 3 pending", className: "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[#9eabba]", actionId: "open_healing" },
      ],
      actions: [
        { id: "open-findings", label: "Open findings", className: "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]", actionId: "topbar_open_findings" },
        { id: "compare", label: "Compare", className: "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[12px] text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]", actionId: "topbar_compare" },
        { id: "run-audit", label: "Run Audit", className: "inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/12 px-4 py-2.5 text-[12px] font-medium text-blue-200 transition hover:border-blue-500/45 hover:bg-blue-500/18 active:scale-[0.98]", actionId: "topbar_run_audit" },
      ],
      profileActionId: "topbar_profile",
    },
    hero: {
      title: "sitepulse.io",
      description: "The system detected a high-confidence SEO and performance regression cluster. Template metadata gaps, LCP blockers and canonical trust issues are currently driving the worst quality trajectory.",
      tags: [
        { label: "Operator", className: "inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.10em] text-blue-200" },
        { label: "Critical", className: "inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.10em] text-red-200" },
        { label: "strategy advisor", className: "inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-[0.10em] text-[#9eabba]" },
      ],
      signals: [
        { label: "Top risk: commercial SEO leakage", className: "inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-red-200" },
        { label: "Trajectory: degrading", className: "inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-yellow-200" },
        { label: "Memory confidence: strong", className: "inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-green-200" },
      ],
      metrics: [
        { label: "Impact", value: "P0/P1", description: "4 high-priority issues", valueClassName: "text-red-400" },
        { label: "Predictive", value: "High", description: "regression risk", valueClassName: "text-yellow-300" },
        { label: "Healing", value: "3", description: "pending attempts", valueClassName: "text-[#eef3f8]" },
        { label: "Quality", value: "72", description: "score trending down", valueClassName: "text-[#eef3f8]" },
      ],
      collapseActionId: "toggle_hero_collapse",
    },
    summary: { title: "What matters right now", badgeLabel: "aligned", items: [{ label: "Top Opportunity", value: "Fix template-level metadata generation across commercial pages" }, { label: "Pattern", value: "Repeated SEO trust loss across high-intent templates" }, { label: "Recommended Order", value: "Metadata → LCP blockers → canonicals → rerun" }] },
    focusStrip: {
      primaryLabel: "sitepulse.io",
      chips: [
        { label: "Quality 72", className: "rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#9eabba]" },
        { label: "P0/P1: 4", className: "rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-red-200" },
        { label: "Predictive: High", className: "rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-yellow-200" },
        { label: "Healing: 3 pending", className: "rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#738095]" },
        { label: "Mode: strategy_advisor", className: "rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-green-200" },
      ],
      actions: [
        { label: "Expand overview", className: "inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[#9eabba] transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]", actionId: "expand_overview" },
        { label: "Focus AI", className: "inline-flex items-center gap-2 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-[12px] text-blue-200 transition hover:border-blue-500/40 hover:bg-blue-500/16", actionId: "focus_ai" },
      ],
    },
    responseFrame: {
      subtitle: "How the assistant should deliver results for the current request",
      tags: [{ label: "seo request", className: "rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-blue-200" }, { label: "professional mode", className: "rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1" }],
      patterns: [
        { id: "seo-brief", label: "SEO Priority Brief", isActive: true, actionId: "select_pattern_seo_brief" },
        { id: "issue-explanation", label: "Issue Explanation", isActive: false, actionId: "select_pattern_issue_explanation" },
        { id: "screenshot-package", label: "Screenshot Package", isActive: false, actionId: "select_pattern_screenshot_package" },
        { id: "fix-plan", label: "Fix Plan", isActive: false, actionId: "select_pattern_fix_plan" },
        { id: "comparison-report", label: "Comparison Report", isActive: false, actionId: "select_pattern_comparison_report" },
      ],
      activePatternTitle: "SEO Priority Brief",
      activeModeLabel: "strategy advisor",
      description: "The highest SEO risk is not route-by-route noise. It is a structural trust problem affecting commercial templates. Start by fixing metadata generation on pricing and related revenue pages, then address canonical consistency and only after that move to performance blockers that are hurting crawl efficiency and user trust together.",
      cards: [
        { label: "Priority", title: "Template metadata", detail: "Highest business impact", titleClassName: "text-red-400", actionId: "response_priority_card" },
        { label: "Why now", title: "Commercial SEO leakage", detail: "Affects index trust and CTR", titleClassName: "text-[#eef3f8]", actionId: "response_why_now_card" },
        { label: "Next action", title: "Open findings queue", detail: "Inspect P0/P1 issues first", titleClassName: "text-[#eef3f8]", actionId: "response_next_action_card" },
      ],
    },
    aiWorkspace: {
      subtitle: "Long-form conversation, cards, screenshots, plans and operational actions live here",
      headerActions: [
        { label: "Detach", className: "rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-[#9eabba] transition hover:border-white/15 hover:bg-white/[0.05] hover:text-[#eef3f8]", actionId: "ai_detach" },
        { label: "Fullscreen AI", className: "rounded-2xl border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-[12px] text-blue-200 transition hover:border-blue-500/40 hover:bg-blue-500/16", actionId: "ai_fullscreen" },
      ],
      blocks: [
        { title: "Conversation", badge: "scrollable focus region", content: ["When the user asks for SEO priorities, the workspace should answer with a structured intelligence brief, top opportunities, relevant P0/P1 items, memory-backed cautions, and a next-step action package. When the user asks for screenshots, the workspace should shift into an evidence package format with visual references, labels, context notes and recommended follow-up actions."] },
        { title: "Screenshot and plan patterns", content: [], cards: [
          { title: "Screenshot Package Pattern", description: "Preview area, annotated evidence, issue impact, route, confidence and next action.", actionId: "select_pattern_screenshot_package" },
          { title: "Fix Plan Pattern", description: "Action sequence, safe prompt, memory-backed warnings, revalidation checklist and healing eligibility.", actionId: "select_pattern_fix_plan" },
        ]},
        { title: "Operator Cards", content: [], operatorCards: [
          { title: "Open memory", description: "Show validated resolutions for SEO metadata issues", actionId: "ai_open_memory" },
          { title: "Prepare healing", description: "Prompt-assisted path for LCP blockers with revalidation step", actionId: "ai_prepare_healing" },
          { title: "Compare run", description: "Show what worsened versus the previous comparable run", actionId: "ai_compare_run" },
        ]},
      ],
    },
    queue: { subtitle: "Queue ordered by autonomous next action, impact band, predictive risk, healing confidence and memory outcome.", tags: ["P0–P4 aware", "memory aware", "healing aware"], items: [
      { id: "pricing-meta", title: "Missing meta description on", path: "/pricing", route: "/pricing", description: "CTR and trust loss on indexed commercial page", impactScore: "92", badges: [
        { label: "P0", className: "rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-red-200" },
        { label: "degrading", className: "rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-yellow-200" },
        { label: "validated memory", className: "rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-green-200" },
        { label: "assist-only healing", className: "rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-blue-200" },
      ], actionId: "queue_open_issue_pricing" },
    ]},
    contextPanel: { subtitle: "What the assistant currently knows", badgeLabel: "synced", rows: [
      { label: "Target", value: "https://sitepulse.io" },
      { label: "Cognitive mode", value: "strategy_advisor" },
      { label: "Loaded layers", chips: [
        { label: "data", actionId: "live_context_open_data" },
        { label: "impact", actionId: "live_context_open_impact" },
        { label: "predictive", actionId: "live_context_open_predictive" },
        { label: "healing", actionId: "live_context_open_healing" },
        { label: "memory", actionId: "live_context_open_memory" },
      ]},
    ]},
    commandDock: {
      subtitle: "The dock should adapt result delivery based on user intent: SEO brief, issue explanation, screenshot package, compare report, fix plan.",
      quickPrompts: [{ label: "Why is score down?", actionId: "dock_prompt_score" }, { label: "Show SEO issues", actionId: "dock_prompt_seo" }, { label: "Generate fix plan", actionId: "dock_prompt_fix_plan" }],
      placeholder: "Ask about your audit, SEO, performance, memory, healing, compare, or request operator actions...",
      primaryActionId: "dock_submit",
      statusChips: [{ label: "mode: strategy_advisor", actionId: "live_context_open_data" }, { label: "memory attached", actionId: "open_memory" }, { label: "healing queue loaded", actionId: "open_healing" }],
      footerLabel: "Operator ready · adaptive response formatting enabled",
    },
  };
}
