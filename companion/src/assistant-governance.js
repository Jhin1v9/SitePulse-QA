(function attachAssistantGovernance(globalScope) {
  /**
   * @typedef {Object} AssistantActionGovernance
   * @property {string} id
   * @property {string} label
   * @property {"allowed" | "blocked" | "needs_confirmation"} status
   * @property {string} reason
   */

  /**
   * Avalia as ações sugeridas pelo assistant à luz do contexto atual.
   * Nesta base inicial, apenas marca todas as ações como "allowed"
   * respeitando o filtro do modo já aplicado no assistant-service.
   *
   * Futuros blocos podem enriquecer com:
   * - estado do engine / bridge
   * - permissões do workspace
   * - limites de segurança
   *
   * @param {any} context
   * @param {{ result?: { actions?: { id?: string; label?: string }[] } } | null} envelope
   * @returns {AssistantActionGovernance[]}
   */
  function evaluateAssistantActions(context, envelope) {
    if (!envelope || !envelope.result) return [];
    const actions = Array.isArray(envelope.result.actions) ? envelope.result.actions : [];
    return actions.map((action) => ({
      id: String(action.id || ""),
      label: String(action.label || ""),
      status: "allowed",
      reason: "Action allowed by current assistant mode.",
    }));
  }

  globalScope.evaluateAssistantActions = evaluateAssistantActions;
})(window);

