(function attachAssistantToolRegistry(globalScope) {
  /**
   * @typedef {Object} AssistantTool
   * @property {string} id
   * @property {string} label
   * @property {string} category
   * @property {string} description
   */

  /** @type {Record<string, AssistantTool>} */
  const TOOL_REGISTRY = {
    "switch-overview": {
      id: "switch-overview",
      label: "Open overview",
      category: "navigation",
      description: "Switch workspace to Control Center.",
    },
    "switch-findings": {
      id: "switch-findings",
      label: "Open findings",
      category: "navigation",
      description: "Open the Findings workspace focused on issues.",
    },
    "switch-seo": {
      id: "switch-seo",
      label: "Open SEO",
      category: "navigation",
      description: "Open the SEO workspace for search diagnostics.",
    },
    "switch-prompts": {
      id: "switch-prompts",
      label: "Open Prompt Workspace",
      category: "navigation",
      description: "Open the Prompt Workspace with healing queue and prompts.",
    },
    "switch-compare": {
      id: "switch-compare",
      label: "Open compare",
      category: "navigation",
      description: "Open the Compare workspace for baseline vs current run.",
    },
    "switch-reports": {
      id: "switch-reports",
      label: "Open reports",
      category: "navigation",
      description: "Open the Reports workspace.",
    },
    "switch-settings": {
      id: "switch-settings",
      label: "Open settings",
      category: "navigation",
      description: "Open Settings for engine, memory and paths.",
    },
    "run-audit": {
      id: "run-audit",
      label: "Run audit",
      category: "command",
      description: "Start a new audit run using the current execution profile.",
    },
    "prepare-healing": {
      id: "prepare-healing",
      label: "Prepare healing",
      category: "command",
      description: "Prepare a healing attempt for the focused issue.",
    },
    "generate-prompt": {
      id: "generate-prompt",
      label: "Generate prompt",
      category: "command",
      description: "Generate a fix prompt for the current issue and memory.",
    },
  };

  globalScope.getAssistantToolRegistry = function getAssistantToolRegistry() {
    return TOOL_REGISTRY;
  };
})(window);

