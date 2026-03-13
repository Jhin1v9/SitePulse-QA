function normalizeText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

const STRATEGIES = [
  {
    id: "seo_structural",
    description: "SEO structural issues with bounded code surface and strong prompt-assisted potential.",
    match: (code) => normalizeText(code).toUpperCase().startsWith("SEO_"),
    riskLevel: "low",
    defaultEligibility: "assist_only",
    supportedModes: ["suggest_only", "prompt_assisted", "orchestrated_healing"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "language_conflict",
    description: "Language conflicts and translation consistency issues.",
    match: (code) => normalizeText(code).toUpperCase() === "CONTENT_LANGUAGE_CONFLICT",
    riskLevel: "low",
    defaultEligibility: "eligible_for_healing",
    supportedModes: ["suggest_only", "prompt_assisted", "orchestrated_healing"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "interaction_feedback",
    description: "Interaction flows with missing feedback or no visible effect.",
    match: (code) => {
      const normalized = normalizeText(code).toUpperCase();
      return normalized === "BTN_NO_EFFECT" || normalized === "BTN_CLICK_ERROR";
    },
    riskLevel: "medium",
    defaultEligibility: "assist_only",
    supportedModes: ["suggest_only", "prompt_assisted", "orchestrated_healing"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "visual_composition",
    description: "Visual composition and layout structure issues.",
    match: (code) => normalizeText(code).toUpperCase().startsWith("VISUAL_"),
    riskLevel: "medium",
    defaultEligibility: "assist_only",
    supportedModes: ["suggest_only", "prompt_assisted"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "client_contract",
    description: "Client request and contract issues that may be fixable with narrow frontend changes.",
    match: (code) => normalizeText(code).toUpperCase() === "HTTP_4XX",
    riskLevel: "medium",
    defaultEligibility: "assist_only",
    supportedModes: ["suggest_only", "prompt_assisted"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "route_runtime",
    description: "Route/runtime failures with potential backend, auth or infrastructure risk.",
    match: (code) => {
      const normalized = normalizeText(code).toUpperCase();
      return normalized === "ROUTE_LOAD_FAIL"
        || normalized === "NET_REQUEST_FAILED"
        || normalized === "JS_RUNTIME_ERROR"
        || normalized === "CONSOLE_ERROR";
    },
    riskLevel: "high",
    defaultEligibility: "manual_only",
    supportedModes: ["suggest_only", "prompt_assisted"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "backend_failure",
    description: "Server-side or systemic failures that are not safe for automated correction.",
    match: (code) => normalizeText(code).toUpperCase() === "HTTP_5XX",
    riskLevel: "high",
    defaultEligibility: "unsafe",
    supportedModes: ["suggest_only"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
  {
    id: "fallback_general",
    description: "Fallback strategy when no specialized healing profile exists yet.",
    match: () => true,
    riskLevel: "medium",
    defaultEligibility: "manual_only",
    supportedModes: ["suggest_only", "prompt_assisted"],
    requiresConfirmation: true,
    directActionEnabled: false,
  },
];

export function getHealingStrategyProfile(issueCode) {
  const strategy = STRATEGIES.find((item) => item.match(issueCode)) || STRATEGIES[STRATEGIES.length - 1];
  return {
    ...strategy,
    supportedModes: [...strategy.supportedModes],
  };
}

export function listHealingStrategyProfiles() {
  return STRATEGIES.map((item) => ({
    id: item.id,
    description: item.description,
    riskLevel: item.riskLevel,
    defaultEligibility: item.defaultEligibility,
    supportedModes: [...item.supportedModes],
    requiresConfirmation: item.requiresConfirmation === true,
    directActionEnabled: item.directActionEnabled === true,
  }));
}
