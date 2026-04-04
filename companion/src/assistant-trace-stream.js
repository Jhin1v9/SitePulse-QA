(function attachAssistantTraceStream(globalScope) {
  /**
   * @typedef {Object} AssistantTraceEvent
   * @property {string} id
   * @property {string} type
   * @property {string} label
   * @property {string} detail
   * @property {string} at
   */

  /**
   * Build a base trace for a single assistant response.
   * This is kept minimal; future blocks can extend event types.
   *
   * @param {Object} payload
   * @param {string} payload.modeKey
   * @param {string} payload.intentId
   * @param {any} payload.context
   * @returns {AssistantTraceEvent[]}
   */
  function buildAssistantTrace(payload) {
    const now = new Date().toISOString();
    const events = [];

    events.push({
      id: "intent_resolved",
      type: "intent",
      label: "Intent resolved",
      detail: payload.intentId || "unknown",
      at: now,
    });

    events.push({
      id: "mode_selected",
      type: "mode",
      label: "Mode selected",
      detail: payload.modeKey || "strategy_advisor",
      at: now,
    });

    if (payload.context && payload.context.report && payload.context.report.summary) {
      const report = payload.context.report;
      const summary = report.summary;
      events.push({
        id: "context_report",
        type: "context",
        label: "Report context",
        detail: `${report.meta?.baseUrl || "unknown"} | issues ${summary.totalIssues || 0} | SEO ${summary.seoScore || 0}`,
        at: now,
      });
    }

    return events;
  }

  globalScope.buildAssistantTrace = buildAssistantTrace;
})(window);

