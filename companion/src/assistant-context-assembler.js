(function attachAssistantContextAssembler(globalScope) {
  /**
   * Build the structured assistant app context from primitives provided by the renderer.
   *
   * This function is intentionally dumb: it does not reach into uiState or the DOM.
   * The renderer is responsible for passing snapshots that already reflect the current state.
   *
   * @param {Object} params
   * @param {string} params.activeView
   * @param {any} params.report
   * @param {any} params.intelligenceSnapshot
   * @param {string[]} params.logs
   * @param {any} params.intentSnapshot
   * @param {any} params.contextSnapshot
   * @param {any} params.evidenceSnapshot
   * @param {any} params.patternMemory
   * @param {any} params.learningSnapshot
   * @param {any} params.predictiveState
   * @param {any} params.investigationPlan
   * @param {any} params.decisionPlan
   * @param {string} params.rawQuery
   * @param {{ stamp: string; baseUrl: string; totalIssues: number; seoScore: number }[]} params.runHistory
   * @param {{ id: string; label: string; description: string }[]} params.availableCommands
   * @param {Record<string, any>} params.workspaceHelp
   * @param {() => { languageKey: string }} params.getAssistantLanguageState
   * @param {(issueCode: string) => string} params.buildIssuePrompt
   * @param {any} params.compareDigest
   * @param {{ type: string; message: string; filename?: string; lineno?: number; colno?: number; stack?: string } | null} params.lastJsError
   * @returns {any}
   */
  function buildAssistantAppContext(params) {
    const intelligenceSnapshot = params.intelligenceSnapshot || {};
    const learningMemory = intelligenceSnapshot.learningMemory || null;
    const selfHealing = intelligenceSnapshot.selfHealing || null;
    const intelligence = intelligenceSnapshot.intelligence || null;
    const predictive = intelligenceSnapshot.predictive || null;
    const autonomous = intelligenceSnapshot.autonomous || null;
    const dataIntelligence = intelligenceSnapshot.dataIntelligence || null;
    const optimization = intelligenceSnapshot.optimization || null;
    const qualityControl = intelligenceSnapshot.qualityControl || null;

    return {
      activeView: params.activeView,
      report: params.report || null,
      learningMemory,
      selfHealing,
      intelligence,
      predictive,
      autonomous,
      dataIntelligence,
      optimization,
      qualityControl,
      assistantLanguage: params.getAssistantLanguageState(),
      logs: Array.isArray(params.logs) ? [...params.logs] : [],
      intentSnapshot: params.intentSnapshot || null,
      contextSnapshot: params.contextSnapshot || null,
      evidenceSnapshot: params.evidenceSnapshot || null,
      patternMemory: params.patternMemory || null,
      learningSnapshot: params.learningSnapshot || null,
      predictiveState: params.predictiveState || null,
      investigationPlan: params.investigationPlan || null,
      decisionPlan: params.decisionPlan || null,
      rawQuery: params.rawQuery || "",
      compareDigest: params.compareDigest || null,
      runHistory: Array.isArray(params.runHistory) ? params.runHistory : [],
      availableCommands: Array.isArray(params.availableCommands) ? params.availableCommands : [],
      workspaceHelp: params.workspaceHelp || {},
      buildIssuePrompt: params.buildIssuePrompt,
      lastJsError: params.lastJsError ?? null,
    };
  }

  globalScope.buildAssistantAppContext = buildAssistantAppContext;
})(window);

