(function attachAssistantMemoryEngine(globalScope) {
  /**
   * Constrói um snapshot compacto da memória operacional e healing
   * para ser usado por intents e pelo Prompt Workspace.
   *
   * @param {any} learningMemory
   * @param {any} selfHealing
   * @returns {{
   *   totalEntries: number;
   *   validatedTotal: number;
   *   failedTotal: number;
   *   partialTotal: number;
   *   healingEligible: number;
   *   promptReady: number;
   * }} snapshot
   */
  function buildAssistantMemorySnapshot(learningMemory, selfHealing) {
    const entries = Array.isArray(learningMemory?.entries) ? learningMemory.entries : [];
    const issues = Array.isArray(selfHealing?.issues) ? selfHealing.issues : [];

    let validatedTotal = 0;
    let failedTotal = 0;
    let partialTotal = 0;

    entries.forEach((entry) => {
      validatedTotal += Number(entry.learningCounts?.validated || 0);
      failedTotal += Number(entry.learningCounts?.failed || 0);
      partialTotal += Number(entry.learningCounts?.partial || 0);
    });

    const healingEligible = issues.filter(
      (issue) => issue.eligibility === "eligible_for_healing" || issue.eligibility === "assist_only",
    ).length;
    const promptReady = issues.filter((issue) => issue.promptReady === true).length;

    return {
      totalEntries: entries.length,
      validatedTotal,
      failedTotal,
      partialTotal,
      healingEligible,
      promptReady,
    };
  }

  globalScope.buildAssistantMemorySnapshot = buildAssistantMemorySnapshot;
})(window);

