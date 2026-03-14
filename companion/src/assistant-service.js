(function attachSitePulseAssistant(globalScope) {
  const MODE_REGISTRY = {
    operator: {
      key: "operator",
      name: "Operator",
      description: "Executes supported workstation actions, confirms operational steps and keeps the user in control.",
      capabilities: ["run-audit", "open-memory", "open-run", "manual-override", "switch-workspace"],
      allowedActions: [
        "run-audit",
        "switch-overview",
        "switch-operations",
        "switch-findings",
        "switch-seo",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-settings",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "revalidate-healing",
        "manual-override",
        "generate-prompt",
      ],
      contextSources: ["ui", "report", "commands", "history"],
      priorityRules: [
        "Prefer actions that can be executed safely right now.",
        "Confirm operational context before changing memory.",
      ],
      responseStyle: "directive",
    },
    audit_analyst: {
      key: "audit_analyst",
      name: "Audit Analyst",
      description: "Interprets the current run, logs, issue severity and operational memory to explain technical risk.",
      capabilities: ["analyze-issues", "triage-severity", "read-logs", "use-memory"],
      allowedActions: [
        "switch-findings",
        "switch-seo",
        "switch-operations",
        "switch-compare",
        "switch-settings",
        "open-memory",
        "open-healing",
        "findings-search",
        "generate-prompt",
      ],
      contextSources: ["report", "issues", "logs", "memory", "predictive", "data-intelligence", "optimization"],
      priorityRules: [
        "Prioritize high severity and SEO-impacting failures first.",
        "Use validated memory before generic recommendations.",
      ],
      responseStyle: "analytical",
    },
    prompt_engineer: {
      key: "prompt_engineer",
      name: "Prompt Engineer",
      description: "Builds fix prompts from the active issue, validated memory and failed patterns to avoid weak guidance.",
      capabilities: ["generate-prompt", "cite-memory", "avoid-failed-patterns"],
      allowedActions: [
        "copy-text",
        "switch-prompts",
        "switch-findings",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "generate-prompt",
      ],
      contextSources: ["report", "memory", "prompt-workspace"],
      priorityRules: [
        "Prefer validated fixes when they exist.",
        "Call out failed patterns before proposing another attempt.",
      ],
      responseStyle: "structured",
    },
    product_guide: {
      key: "product_guide",
      name: "Product Guide",
      description: "Explains the interface, workspaces and operational flows using the actual desktop surface and available actions.",
      capabilities: ["explain-ui", "guide-workspace", "teach-memory-panel"],
      allowedActions: [
        "switch-overview",
        "switch-operations",
        "switch-findings",
        "switch-seo",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-settings",
        "open-memory",
        "open-healing",
      ],
      contextSources: ["ui", "workspace-help", "commands"],
      priorityRules: [
        "Keep explanations tied to the active workspace.",
        "Prefer the shortest path that gets the user unstuck.",
      ],
      responseStyle: "instructional",
    },
    strategy_advisor: {
      key: "strategy_advisor",
      name: "Strategy Advisor",
      description: "Prioritizes what to fix first using critical issues, business risk signals, SEO impact and run history.",
      capabilities: ["prioritize-work", "compare-runs", "sequence-actions"],
      allowedActions: [
        "switch-findings",
        "switch-prompts",
        "switch-compare",
        "switch-reports",
        "switch-seo",
        "open-memory",
        "open-healing",
        "prepare-healing",
        "generate-prompt",
      ],
      contextSources: ["report", "issues", "memory", "history", "compare", "predictive", "data-intelligence", "optimization"],
      priorityRules: [
        "Sequence fixes by severity, validation gap and business impact.",
        "Use comparison context when available before recommending the next move.",
      ],
      responseStyle: "prioritized",
    },
  };

  const INTENT_DEFINITIONS = [
    { id: "memory_guide", mode: "product_guide", terms: ["painel de memoria", "memory panel", "painel de aprendizados", "painel de memoria"], builder: (context) => buildMemoryGuideResponse(context) },
    { id: "guide", mode: "product_guide", terms: ["como usar", "how do i use", "como usar o painel", "guide", "what does", "me ensine", "ensine", "painel atual"], builder: (context) => buildGuideResponse(context) },
    { id: "seo", mode: "audit_analyst", terms: ["analise o log", "analyze the log", "problemas prioritarios de seo", "seo priorities"], builder: (context) => buildSeoResponse(context) },
    { id: "issue_explain", mode: "audit_analyst", terms: ["o que significa", "what means", "explain", "explique"], builder: (context, rawQuery) => buildIssueExplanation(context, rawQuery) },
    { id: "unresolved_critical", mode: "audit_analyst", terms: ["ainda nao tem solucao", "still lack", "sem solucao validada", "without final resolution"], builder: (context) => buildUnresolvedCriticalResponse(context) },
    { id: "validated", mode: "audit_analyst", terms: ["quais problemas criticos", "critical issues", "solucao validada"], builder: (context) => buildValidatedResponse(context) },
    { id: "failed", mode: "audit_analyst", terms: ["quais solucoes falharam", "failed solutions", "failed attempts"], builder: (context, rawQuery) => buildFailedResponse(context, rawQuery) },
    { id: "manual_override", mode: "operator", terms: ["promova", "manual override", "promote solution"], builder: (context, rawQuery) => buildManualOverrideResponse(context, rawQuery) },
    { id: "healing_candidates", mode: "strategy_advisor", terms: ["auto-curadas", "auto curadas", "healing available", "healing candidates", "maior chance de resolucao automatica", "eligible for healing"], builder: (context) => buildHealingCandidatesResponse(context) },
    { id: "healing_strategy", mode: "strategy_advisor", terms: ["melhor estrategia", "best strategy", "healing strategy", "melhor forma de corrigir", "best fix strategy"], builder: (context, rawQuery) => buildHealingStrategyResponse(context, rawQuery) },
    { id: "healing_decision", mode: "strategy_advisor", terms: ["manualmente ou assistida", "manual or assisted", "assistida ou manual", "deve ser corrigida manualmente"], builder: (context, rawQuery) => buildHealingDecisionResponse(context, rawQuery) },
    { id: "healing_failures", mode: "audit_analyst", terms: ["falhou nas tentativas anteriores", "what failed before", "tentativas anteriores", "healing failed"], builder: (context, rawQuery) => buildHealingFailureResponse(context, rawQuery) },
    { id: "healing_revalidate", mode: "operator", terms: ["revalide a ultima tentativa", "revalidate the last attempt", "revalidar a correcao", "revalidate this fix"], builder: (context, rawQuery) => buildHealingRevalidateResponse(context, rawQuery) },
    { id: "predictive_risk", mode: "strategy_advisor", terms: ["existe risco de regressao", "risk of regression", "predictive alert", "risco preditivo"], builder: (context) => buildPredictiveRiskResponse(context) },
    { id: "worsening", mode: "audit_analyst", terms: ["quais problemas estao piorando", "what is getting worse", "worsening issues", "problemas piorando"], builder: (context) => buildWorseningResponse(context) },
    { id: "trend", mode: "strategy_advisor", terms: ["qual tendencia estou vendo", "what trend am i seeing", "trend analysis", "tendencia"], builder: (context) => buildTrendResponse(context) },
    { id: "systemic_patterns", mode: "strategy_advisor", terms: ["padroes sistemicos", "systemic patterns", "historico sistemico", "historical patterns"], builder: (context) => buildSystemicPatternsResponse(context) },
    { id: "next_step", mode: "strategy_advisor", terms: ["qual e o proximo passo ideal", "next ideal step", "next action", "proximo passo"], builder: (context) => buildNextStepResponse(context) },
    { id: "quality_trajectory", mode: "strategy_advisor", terms: ["site esta melhorando", "site esta piorando", "quality trajectory", "quality score", "trajectory"], builder: (context) => buildQualityTrajectoryResponse(context) },
    { id: "biggest_risk", mode: "strategy_advisor", terms: ["qual e o maior risco atual", "biggest current risk", "maior risco atual"], builder: (context) => buildBiggestRiskResponse(context) },
    { id: "regression", mode: "strategy_advisor", terms: ["o que piorou", "what got worse", "piorou"], builder: (context) => buildRegressionResponse(context) },
    { id: "compare", mode: "strategy_advisor", terms: ["compare", "comparar", "compare a run", "run atual com a anterior"], builder: (context) => buildCompareResponse(context) },
    { id: "impact", mode: "strategy_advisor", terms: ["maior impacto", "highest impact", "issues tem maior impacto", "which issues have the highest impact"], builder: (context) => buildImpactResponse(context) },
    { id: "seo_risk", mode: "strategy_advisor", terms: ["maior risco de seo", "biggest seo risk", "seo risk now"], builder: (context) => buildSeoRiskResponse(context) },
    { id: "optimization_opportunities", mode: "strategy_advisor", terms: ["seo opportunities", "ux improvements", "performance gains", "optimization opportunities", "top improvements", "oportunidades"], builder: (context) => buildOptimizationResponse(context) },
    { id: "structural_improvements", mode: "strategy_advisor", terms: ["melhorias estruturais", "structural improvements", "template logic", "recommend fixing template logic"], builder: (context) => buildStructuralRecommendationsResponse(context) },
    { id: "prompt", mode: "prompt_engineer", terms: ["gere um prompt", "generate a prompt", "crie um prompt"], builder: (context, rawQuery) => buildPromptResponse(context, rawQuery) },
    { id: "memory", mode: "audit_analyst", terms: ["abra a memoria", "open memory", "aprendizados validados"], builder: (context, rawQuery) => buildMemoryResponse(context, rawQuery) },
    { id: "latest_run", mode: "operator", terms: ["ultima run", "latest run", "open last run", "abrir ultima run"], builder: (context) => buildLatestRunResponse(context) },
    { id: "priorities", mode: "strategy_advisor", terms: ["me diga o que devo fazer primeiro", "what should i do first", "prioritize"], builder: (context) => buildPrioritiesResponse(context) },
    { id: "audit", mode: "operator", terms: ["audite", "run audit", "audit "], builder: (context, rawQuery) => buildAuditSiteResponse(context, rawQuery) },
    { id: "logs", mode: "audit_analyst", terms: ["log", "logs"], builder: (context) => buildLogsResponse(context) },
  ];

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function toLower(value) {
    return normalizeText(value).toLowerCase();
  }

  function matchesAny(query, terms) {
    return terms.some((term) => query.includes(term));
  }

  function findIssueByCode(context, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    return (context.report?.issues || []).find((issue) => normalizeText(issue.code).toUpperCase() === code) || null;
  }

  function inferIssueCode(query, context) {
    const match = normalizeText(query).toUpperCase().match(/\b[A-Z]{2,}(?:_[A-Z0-9]+)+\b/);
    if (match) return match[0];
    return context.report?.issues?.[0]?.code || "";
  }

  function summarizeMemory(memory, issueCode) {
    const entry = (memory?.entries || []).find((item) => normalizeText(item.issueCode).toUpperCase() === normalizeText(issueCode).toUpperCase());
    if (!entry) return null;
    return {
      issueCode: entry.issueCode,
      category: normalizeText(entry.category),
      severity: normalizeText(entry.severity),
      validated: Number(entry.learningCounts?.validated || 0),
      failed: Number(entry.learningCounts?.failed || 0),
      partial: Number(entry.learningCounts?.partial || 0),
      finalResolution: normalizeText(entry.finalResolution),
      possibleResolution: normalizeText(entry.possibleResolution),
      finalResolutionOrigin: normalizeText(entry.finalResolutionOrigin),
      avoidText: normalizeText(entry.avoidText),
      latestValidatedFix: normalizeText(entry.latestValidatedFix),
      learningSource: normalizeText(entry.learningSource),
    };
  }

  function summarizeHealing(selfHealing, issueCode) {
    const issues = Array.isArray(selfHealing?.issues) ? selfHealing.issues : [];
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const issue = issues.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!issue) return null;
    return {
      issueCode: issue.issueCode,
      route: normalizeText(issue.route || "/"),
      action: normalizeText(issue.action),
      severity: normalizeText(issue.severity),
      eligibility: normalizeText(issue.eligibility),
      healingMode: normalizeText(issue.healingMode),
      confidenceScore: Number(issue.confidenceScore || 0),
      confidenceLabel: normalizeText(issue.confidenceLabel),
      strategyId: normalizeText(issue.strategyId),
      strategyDescription: normalizeText(issue.strategyDescription),
      resolutionLead: normalizeText(issue.resolutionLead),
      resolutionSource: normalizeText(issue.resolutionSource),
      promptReady: issue.promptReady === true,
      suggestedNextStep: normalizeText(issue.suggestedNextStep),
      avoidText: normalizeText(issue.avoidText),
      promptText: normalizeText(issue.promptText),
      rationale: Array.isArray(issue.rationale) ? issue.rationale.map((entry) => normalizeText(entry)).filter(Boolean) : [],
      lastAttempt: issue.lastAttempt && typeof issue.lastAttempt === "object"
        ? {
            outcome: normalizeText(issue.lastAttempt.outcome),
            status: normalizeText(issue.lastAttempt.status),
            updatedAt: normalizeText(issue.lastAttempt.updatedAt),
            healingMode: normalizeText(issue.lastAttempt.healingMode),
          }
        : null,
    };
  }

  function summarizePredictive(predictive, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const entries = Object.values(predictive?.issueSignals || {});
    const issue = entries.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!issue) return null;
    return {
      issueCode: issue.issueCode,
      trendDirection: normalizeText(issue.trendDirection),
      trendStrength: Number(issue.trendStrength || 0),
      trendConfidence: Number(issue.trendConfidence || 0),
      riskLevel: normalizeText(issue.riskLevel),
      riskCategory: normalizeText(issue.riskCategory),
      riskConfidence: Number(issue.riskConfidence || 0),
      recurringCount: Number(issue.recurringCount || 0),
      evidence: Array.isArray(issue.evidence) ? issue.evidence.map((entry) => normalizeText(entry)).filter(Boolean) : [],
    };
  }

  function summarizeAutonomous(autonomous, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const playbooks = autonomous?.playbooks && typeof autonomous.playbooks === "object" ? autonomous.playbooks : {};
    const entry = Object.values(playbooks).find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
    if (!entry) return null;
    return {
      issueCode: entry.issueCode,
      title: normalizeText(entry.title),
      diagnosticStep: normalizeText(entry.diagnosticStep),
      healingStrategy: normalizeText(entry.healingStrategy),
      promptTemplate: normalizeText(entry.promptTemplate),
      revalidationRule: normalizeText(entry.revalidationRule),
      learningRule: normalizeText(entry.learningRule),
      nextActionScore: Number(entry.nextActionScore || 0),
      nextActionLabel: normalizeText(entry.nextActionLabel),
    };
  }

  function summarizeDataIssue(dataIntelligence, issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (!code) return null;
    const issues = Array.isArray(dataIntelligence?.ISSUE_STATE) ? dataIntelligence.ISSUE_STATE : [];
    return issues.find((item) => normalizeText(item.issueCode).toUpperCase() === code) || null;
  }

  function getHealingCandidates(selfHealing, appContext = {}) {
    const issues = Array.isArray(selfHealing?.issues) ? selfHealing.issues : [];
    const maps = buildOperationalPriorityMaps(appContext);
    return [...issues]
      .filter((item) => ["eligible_for_healing", "assist_only"].includes(normalizeText(item.eligibility)))
      .sort((left, right) => {
        const leftEntry = getOperationalEntry({ code: left.issueCode, route: left.route, action: left.action }, maps);
        const rightEntry = getOperationalEntry({ code: right.issueCode, route: right.route, action: right.action }, maps);
        if (rightEntry.nextAction.score !== leftEntry.nextAction.score) return rightEntry.nextAction.score - leftEntry.nextAction.score;
        if (rightEntry.priority.score !== leftEntry.priority.score) return rightEntry.priority.score - leftEntry.priority.score;
        return Number(right.confidenceScore || 0) - Number(left.confidenceScore || 0);
      })
      .slice(0, 8);
  }

  function priorityRank(priorityLevel) {
    switch (normalizeText(priorityLevel).toUpperCase()) {
      case "P0":
        return 0;
      case "P1":
        return 1;
      case "P2":
        return 2;
      case "P3":
        return 3;
      default:
        return 4;
    }
  }

  function buildOperationalPriorityMaps(appContext) {
    const nextActionMap = new Map();
    const nextActionByCode = new Map();
    const priorityMap = new Map();
    const priorityByCode = new Map();
    const nextActions = Array.isArray(appContext?.autonomous?.nextActions) ? appContext.autonomous.nextActions : [];
    nextActions.forEach((item, index) => {
      const code = normalizeText(item.issueCode).toUpperCase();
      const key = [code, normalizeText(item.route || "/"), normalizeText(item.action)].join("|");
      const payload = { score: Number(item.score || 0), rank: index };
      nextActionMap.set(key, payload);
      if (!nextActionByCode.has(code)) nextActionByCode.set(code, payload);
    });
    const queue = Array.isArray(appContext?.dataIntelligence?.RISK_STATE?.priorityQueue) ? appContext.dataIntelligence.RISK_STATE.priorityQueue : [];
    queue.forEach((item, index) => {
      const code = normalizeText(item.issueCode).toUpperCase();
      const key = [code, normalizeText(item.route || "/"), normalizeText(item.action)].join("|");
      const payload = { score: Number(item.compositeScore || 0), rank: index };
      priorityMap.set(key, payload);
      if (!priorityByCode.has(code)) priorityByCode.set(code, payload);
    });
    return { nextActionMap, nextActionByCode, priorityMap, priorityByCode };
  }

  function getOperationalEntry(issue, maps) {
    const code = normalizeText(issue?.code).toUpperCase();
    const route = normalizeText(issue?.route || "/");
    const action = normalizeText(issue?.action);
    const key = [code, route, action].join("|");
    return {
      nextAction: maps.nextActionMap.get(key) || maps.nextActionByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
      priority: maps.priorityMap.get(key) || maps.priorityByCode.get(code) || { score: 0, rank: Number.MAX_SAFE_INTEGER },
    };
  }

  function prioritizeIssues(report, appContext = {}) {
    const issues = Array.isArray(report?.issues) ? report.issues : [];
    const maps = buildOperationalPriorityMaps(appContext);
    return [...issues].sort((left, right) => {
      const leftEntry = getOperationalEntry(left, maps);
      const rightEntry = getOperationalEntry(right, maps);
      if (rightEntry.nextAction.score !== leftEntry.nextAction.score) return rightEntry.nextAction.score - leftEntry.nextAction.score;
      if (leftEntry.nextAction.rank !== rightEntry.nextAction.rank) return leftEntry.nextAction.rank - rightEntry.nextAction.rank;
      if (rightEntry.priority.score !== leftEntry.priority.score) return rightEntry.priority.score - leftEntry.priority.score;
      if (leftEntry.priority.rank !== rightEntry.priority.rank) return leftEntry.priority.rank - rightEntry.priority.rank;
      const byPriority = priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel);
      if (byPriority !== 0) return byPriority;
      const byImpact = Number(right.impact?.impactScore || 0) - Number(left.impact?.impactScore || 0);
      if (byImpact !== 0) return byImpact;
      const severityRankLeft = left.severity === "high" ? 3 : left.severity === "medium" ? 2 : 1;
      const severityRankRight = right.severity === "high" ? 3 : right.severity === "medium" ? 2 : 1;
      if (severityRankRight !== severityRankLeft) return severityRankRight - severityRankLeft;
      const validatedLeft = Number(left.learningCounts?.validated || 0);
      const validatedRight = Number(right.learningCounts?.validated || 0);
      if (validatedLeft !== validatedRight) return validatedLeft - validatedRight;
      return normalizeText(left.code).localeCompare(normalizeText(right.code));
    });
  }

  function getIntentDefinition(query) {
    if (!query) {
      return INTENT_DEFINITIONS.find((definition) => definition.id === "priorities");
    }
    return INTENT_DEFINITIONS.find((definition) => matchesAny(query, definition.terms))
      || INTENT_DEFINITIONS.find((definition) => definition.id === "priorities");
  }

  function filterActionsForMode(modeKey, actions) {
    const mode = MODE_REGISTRY[modeKey];
    if (!mode || !Array.isArray(actions)) return [];
    const allowed = new Set(mode.allowedActions);
    return actions.filter((action) => allowed.has(String(action?.id || "")));
  }

  function buildModeContext(modeKey, appContext, rawQuery) {
    const report = appContext.report || null;
    const issueCode = inferIssueCode(rawQuery, appContext);
    const prioritizedIssues = prioritizeIssues(report, appContext);
    const issue = findIssueByCode(appContext, issueCode);
    const issueMemory = summarizeMemory(appContext.learningMemory, issueCode);
    const issueHealing = summarizeHealing(appContext.selfHealing, issueCode);
    const issuePredictive = summarizePredictive(appContext.predictive, issueCode);
    const issueAutonomous = summarizeAutonomous(appContext.autonomous, issueCode);
    const history = Array.isArray(appContext.runHistory) ? appContext.runHistory : [];
    const availableCommands = Array.isArray(appContext.availableCommands) ? appContext.availableCommands : [];
    const intelligence = appContext.intelligence && typeof appContext.intelligence === "object" ? appContext.intelligence : null;
    const predictive = appContext.predictive && typeof appContext.predictive === "object" ? appContext.predictive : null;
    const autonomous = appContext.autonomous && typeof appContext.autonomous === "object" ? appContext.autonomous : null;
    const dataIntelligence = appContext.dataIntelligence && typeof appContext.dataIntelligence === "object" ? appContext.dataIntelligence : null;
    const optimization = appContext.optimization && typeof appContext.optimization === "object" ? appContext.optimization : null;
    const dataIssue = summarizeDataIssue(dataIntelligence, issueCode);

    const baseContext = {
      ...appContext,
      mode: MODE_REGISTRY[modeKey],
      modeKey,
      rawQuery,
      issueCode,
      issue,
      issueMemory,
      issueHealing,
      issuePredictive,
      issueAutonomous,
      prioritizedIssues,
      criticalIssues: prioritizedIssues.filter((entry) => entry.severity === "high"),
      runHistory: history,
      availableCommands,
      intelligence,
      predictive,
      autonomous,
      dataIntelligence,
      optimization,
      dataIssue,
    };

    if (modeKey === "operator") {
      return {
        ...baseContext,
        operatorContext: {
          activeView: appContext.activeView,
          commands: availableCommands.slice(0, 12),
          currentRun: report
            ? {
                baseUrl: report.meta.baseUrl,
                totalIssues: report.summary.totalIssues,
                seoScore: report.summary.seoScore,
              }
            : null,
          healingSummary: appContext.selfHealing?.summary || null,
        },
      };
    }

    if (modeKey === "audit_analyst") {
      return {
        ...baseContext,
        auditContext: {
          topIssues: prioritizedIssues.slice(0, 8),
          logs: Array.isArray(appContext.logs) ? appContext.logs.slice(-12) : [],
          memorySummary: appContext.learningMemory?.summary || null,
          healingSummary: appContext.selfHealing?.summary || null,
          impactSummary: intelligence?.executiveSummary || null,
          predictiveSummary: predictive?.summary || null,
          autonomousSummary: autonomous?.qualityScore || null,
          dataSummary: dataIntelligence?.RISK_STATE || null,
          optimizationSummary: optimization?.summary || null,
        },
      };
    }

    if (modeKey === "prompt_engineer") {
      return {
        ...baseContext,
        promptContext: {
          issueCode,
          issue,
          issueMemory,
          issueHealing,
          promptWorkspaceReady: typeof appContext.buildIssuePrompt === "function",
        },
      };
    }

    if (modeKey === "product_guide") {
      return {
        ...baseContext,
        guideContext: {
          activeView: appContext.activeView,
          workspaceHelp: appContext.workspaceHelp || {},
          commands: availableCommands.slice(0, 10),
        },
      };
    }

    return {
      ...baseContext,
      strategyContext: {
        topIssues: prioritizedIssues.slice(0, 5),
        compareDigest: appContext.compareDigest || "",
        runHistory: history.slice(0, 5),
        healingSummary: appContext.selfHealing?.summary || null,
        healingCandidates: getHealingCandidates(appContext.selfHealing, appContext),
        intelligence,
        predictive,
        autonomous,
        dataIntelligence,
        optimization,
      },
    };
  }

  function wrapModeResult(modeKey, intentId, result) {
    const mode = MODE_REGISTRY[modeKey] || MODE_REGISTRY.strategy_advisor;
    return {
      ...result,
      modeKey: mode.key,
      modeName: mode.name,
      modeDescription: mode.description,
      modeCapabilities: [...mode.capabilities],
      modeContextSources: [...mode.contextSources],
      modePriorityRules: [...mode.priorityRules],
      responseStyle: mode.responseStyle,
      intentId,
      actions: filterActionsForMode(mode.key, Array.isArray(result.actions) ? result.actions : []),
    };
  }

  function buildGuideResponse(context) {
    const activeView = normalizeText(context.activeView || "overview");
    const workspaceHelp = context.workspaceHelp?.[activeView];
    if (!workspaceHelp) {
      return {
        title: "App guide",
        summary: "No workspace-specific help was found for the current surface.",
        analysis: ["Open Overview, Findings, SEO, Prompts, Compare, Reports or Settings for guided help."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: `${workspaceHelp.title || "App guide"} help`,
      summary: workspaceHelp.description || "Use the active workspace to operate the audit flow.",
      analysis: workspaceHelp.steps || [],
      actions: workspaceHelp.actions || [],
    };
  }

  function buildMemoryGuideResponse(context) {
    const help = context.workspaceHelp?.settings;
    return {
      title: "Memory panel guide",
      summary: "The memory panel lives in Settings and shows validated, failed, partial, auto-promoted and manual override patterns.",
      analysis: help?.steps || [
        "Use filters to isolate validated, failed or partial patterns.",
        "Focus a specific issue code to inspect its history.",
        "Use Promote solution only when you want a deliberate manual override with traceability.",
      ],
      actions: [{ id: "switch-settings", label: "Open learning memory" }],
    };
  }

  function describeImpact(issue) {
    const priority = normalizeText(issue?.impact?.priorityLevel || "P4");
    const impactScore = Number(issue?.impact?.impactScore || 0).toFixed(2);
    const riskType = normalizeText(issue?.impact?.riskType || issue?.impact?.impactCategory || "operational risk");
    return `${priority} | impact ${impactScore} | ${riskType}`;
  }

  function buildPrioritiesResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No audit loaded",
        summary: "There is no report loaded. Run or load an audit first.",
        analysis: ["Prepare a target URL and run a native audit to unlock prioritization."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const autonomousActions = Array.isArray(context.autonomous?.nextActions) ? context.autonomous.nextActions : [];
    const topIssues = context.strategyContext?.topIssues || prioritizeIssues(report, context).slice(0, 3);
    const executive = context.intelligence?.executiveSummary;
    const lines = autonomousActions.length
      ? autonomousActions.slice(0, 4).map((item, index) => `${index + 1}. ${item.actionLabel} | score ${Number(item.score || 0).toFixed(2)} | ${item.playbookTitle}`)
      : topIssues.length
      ? topIssues.map((issue, index) => {
          const memory = summarizeMemory(context.learningMemory, issue.code);
          const suffix = memory?.finalResolution
            ? `Final resolution available (${memory.finalResolutionOrigin || "runtime"}).`
            : memory?.failed
            ? `There are ${memory.failed} failed attempt(s); avoid repeating them blindly.`
            : "No validated fix is attached yet.";
          return `${index + 1}. ${issue.code} on ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}. ${describeImpact(issue)}. ${suffix}`;
        })
      : ["No issues are currently loaded."];

    if (context.strategyContext?.runHistory?.length > 1) {
      lines.push(`Recent history loaded: ${context.strategyContext.runHistory.length} snapshot(s).`);
    }
    if (context.autonomous?.qualityScore?.total) {
      lines.push(`Current SitePulse Quality Score: ${context.dataIntelligence?.QUALITY_STATE?.overallScore || context.autonomous.qualityScore.total}. Trajectory: ${context.dataIntelligence?.QUALITY_STATE?.trajectory || context.autonomous.qualityTrajectory?.direction || "stable"}.`);
    }
    if (Array.isArray(executive?.recommendedActionOrder) && executive.recommendedActionOrder.length) {
      lines.push("Recommended action order:");
      executive.recommendedActionOrder.slice(0, 4).forEach((step) => lines.push(step));
    }

    return {
      title: "What to do first",
      summary: executive?.headline || `Current report has ${report.summary.totalIssues} issue(s) with SEO ${report.summary.seoScore}.`,
      analysis: lines,
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildSeoResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report to analyze.",
        analysis: ["Run or load an audit before asking for SEO priorities."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const seoIssues = (report.issues || [])
      .filter((issue) => normalizeText(issue.code).startsWith("SEO_"))
      .sort((left, right) =>
        priorityRank(left.impact?.priorityLevel) - priorityRank(right.impact?.priorityLevel)
        || Number(right.impact?.impactScore || 0) - Number(left.impact?.impactScore || 0));
    const top = seoIssues.slice(0, 4);
    return {
      title: "SEO priorities",
      summary: `SEO score ${report.summary.seoScore}. ${report.summary.seoCriticalIssues || 0} critical SEO issue(s).`,
      analysis: top.length
        ? top.map((issue, index) => `${index + 1}. ${issue.code} | ${describeImpact(issue)} | ${issue.route} | ${issue.detail}`)
        : ["No dedicated SEO issue is loaded in the current report."],
      actions: [
        { id: "switch-seo", label: "Open SEO workspace" },
        { id: "findings-search", label: "Filter SEO findings", payload: { query: "SEO_" } },
      ],
    };
  }

  function buildCompareResponse(context) {
    if (!context.compareDigest || /^No baseline/i.test(context.compareDigest)) {
      return {
        title: "No comparison baseline",
        summary: "There is no baseline or previous run to compare against.",
        analysis: ["Pin the current report as baseline or load a previous snapshot first."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "Run comparison",
      summary: context.intelligence?.trendSummary?.seo?.text || "The desktop already has comparison data available.",
      analysis: context.compareDigest.split("\n").slice(0, 10),
      actions: [{ id: "switch-compare", label: "Open compare" }],
    };
  }

  function buildRegressionResponse(context) {
    if (!context.compareDigest || /^No baseline/i.test(context.compareDigest)) {
      return {
        title: "No comparison baseline",
        summary: "The assistant cannot tell what worsened without a baseline or previous run.",
        analysis: ["Pin a baseline or load a previous snapshot first."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "What worsened",
      summary: context.predictive?.alerts?.[0]?.label || context.intelligence?.trendSummary?.seo?.text || "Current regression view against the active baseline.",
      analysis: [
        context.intelligence?.trendSummary?.runtime?.text || "Runtime trend unavailable.",
        context.intelligence?.trendSummary?.ux?.text || "UX trend unavailable.",
        ...(context.predictive?.alerts?.length ? context.predictive.alerts.slice(0, 2).map((alert) => `${alert.label} | confidence ${Number(alert.riskConfidence || 0).toFixed(2)}`) : []),
        ...context.compareDigest.split("\n").slice(0, 12),
      ],
      actions: [{ id: "switch-compare", label: "Open compare" }],
    };
  }

  function buildImpactResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "Load a run before asking for impact prioritization.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const topIssues = prioritizeIssues(report, context).slice(0, 5);
    return {
      title: "Highest-impact issues",
      summary: context.intelligence?.executiveSummary?.headline || context.predictive?.alerts?.[0]?.label || "Impact Engine sorted the current issues by operational pressure.",
      analysis: topIssues.length
        ? topIssues.map((issue, index) => {
            const predictive = summarizePredictive(context.predictive, issue.code);
            return `${index + 1}. ${issue.code} | ${describeImpact(issue)}${predictive ? ` | ${predictive.riskLevel} ${predictive.riskCategory}` : ""} | ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}`;
          })
        : ["No issue is currently loaded."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildSeoRiskResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no SEO context to analyze yet.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const seoLead = prioritizeIssues(report, context).find((issue) => normalizeText(issue.code).startsWith("SEO_"));
    if (!seoLead) {
      return {
        title: "No SEO issue loaded",
        summary: "The current report does not expose a dedicated SEO issue.",
        analysis: ["Use the SEO workspace to confirm the score and checklist."],
        actions: [{ id: "switch-seo", label: "Open SEO workspace" }],
      };
    }
    return {
      title: "Biggest SEO risk",
      summary: `${seoLead.code} is currently the highest-impact SEO risk.`,
      analysis: [
        describeImpact(seoLead),
        seoLead.detail,
        ...(Array.isArray(seoLead.impact?.rationale) ? seoLead.impact.rationale.slice(0, 3) : []),
      ],
      actions: [
        { id: "switch-seo", label: "Open SEO workspace" },
        { id: "generate-prompt", label: "Generate prompt", payload: { issueCode: seoLead.code } },
      ],
    };
  }

  function buildOptimizationResponse(context) {
    const optimization = context.optimization;
    if (!optimization?.topImprovements?.length) {
      return {
        title: "No optimization opportunity",
        summary: "There is not enough clustered evidence yet to suggest structural improvements.",
        analysis: ["Run an audit with related issues across routes or keep comparable history for the same target."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Optimization opportunities",
      summary: `${optimization.summary?.seoOpportunities || 0} SEO, ${optimization.summary?.uxImprovements || 0} UX and ${optimization.summary?.performanceGains || 0} performance opportunity cluster(s) detected.`,
      analysis: optimization.topImprovements.slice(0, 5).map((item, index) =>
        `${index + 1}. ${item.title} | score ${Number(item.compositeScore || 0).toFixed(2)} | ${item.issueCount} issue(s) across ${item.routesAffected} route(s) | ${item.recommendation}`),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildStructuralRecommendationsResponse(context) {
    const optimization = context.optimization;
    const recommendations = Array.isArray(optimization?.structuralRecommendations) ? optimization.structuralRecommendations : [];
    if (!recommendations.length) {
      return {
        title: "No structural recommendation",
        summary: "No structural recommendation is attached to the current optimization snapshot.",
        analysis: ["The engine needs repeated or clustered issues before it can recommend a shared template or pipeline fix."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    return {
      title: "Structural improvements",
      summary: "The optimization engine found repeated issue clusters that should be fixed structurally instead of route by route.",
      analysis: recommendations.slice(0, 5),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildPredictiveRiskResponse(context) {
    const predictive = context.predictive;
    if (!predictive?.alerts?.length) {
      return {
        title: "No predictive alert",
        summary: "There is not enough comparable run history to raise a predictive regression alert yet.",
        analysis: ["Load at least one previous comparable run or keep building history for the same target."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }

    return {
      title: "Predictive regression risk",
      summary: predictive.alerts[0].label,
      analysis: predictive.alerts.slice(0, 4).flatMap((alert, index) => [
        `${index + 1}. ${alert.label} | ${alert.riskLevel} | confidence ${Number(alert.riskConfidence || 0).toFixed(2)}`,
        ...(Array.isArray(alert.evidence) ? alert.evidence.slice(0, 2).map((item) => `   - ${item}`) : []),
      ]),
      actions: [
        { id: "switch-compare", label: "Open compare" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildWorseningResponse(context) {
    const degrading = Object.values(context.predictive?.issueSignals || {})
      .filter((signal) => ["degrading", "oscillating"].includes(normalizeText(signal.trendDirection)))
      .sort((left, right) => Number(right.riskConfidence || 0) - Number(left.riskConfidence || 0))
      .slice(0, 5);
    if (!degrading.length) {
      return {
        title: "No worsening pattern",
        summary: "No current issue is showing a degrading or oscillating trend with enough evidence.",
        analysis: ["The current history suggests stable or improving behavior for the loaded issues."],
        actions: [{ id: "switch-compare", label: "Open compare" }],
      };
    }
    return {
      title: "Problems getting worse",
      summary: `${degrading[0].issueCode} is the strongest worsening signal right now.`,
      analysis: degrading.map((signal, index) => `${index + 1}. ${signal.issueCode} | ${signal.trendDirection} | ${signal.riskLevel} | ${signal.evidence[0] || "No evidence attached."}`),
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildTrendResponse(context) {
    const predictive = context.predictive;
    if (!predictive) {
      return {
        title: "No predictive trend context",
        summary: "The predictive intelligence layer is not available in the current state.",
        analysis: ["Load a report and its recent history first."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    const overview = predictive.trendOverview || {};
    return {
      title: "Trend overview",
      summary: "Directional trends are computed only from comparable run history for the active target.",
      analysis: [
        context.dataIntelligence?.TREND_STATE?.seo?.text || overview.seo?.text || "SEO trend unavailable.",
        context.dataIntelligence?.TREND_STATE?.runtime?.text || overview.runtime?.text || "Runtime trend unavailable.",
        context.dataIntelligence?.TREND_STATE?.ux?.text || overview.ux?.text || "UX trend unavailable.",
        `Predictive alerts: ${predictive.summary?.highRiskAlerts || 0} high-risk and ${predictive.summary?.mediumRiskAlerts || 0} medium-risk.`,
      ],
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildSystemicPatternsResponse(context) {
    const patterns = Array.isArray(context.predictive?.systemicPatterns) ? context.predictive.systemicPatterns : [];
    if (!patterns.length) {
      return {
        title: "No systemic pattern",
        summary: "The current history does not show a recurring systemic pattern yet.",
        analysis: ["Keep loading comparable runs for the same target if you want pattern detection to become stronger."],
        actions: [{ id: "switch-reports", label: "Open reports" }],
      };
    }
    return {
      title: "Systemic patterns",
      summary: patterns[0].label,
      analysis: patterns.slice(0, 5).map((pattern, index) => `${index + 1}. ${pattern.label} | ${pattern.riskLevel} | confidence ${Number(pattern.riskConfidence || 0).toFixed(2)}`),
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-findings", label: "Open findings" },
      ],
    };
  }

  function buildNextStepResponse(context) {
    const actions = Array.isArray(context.autonomous?.nextActions) ? context.autonomous.nextActions : [];
    if (!actions.length) {
      return {
        title: "No next action available",
        summary: "The autonomous QA engine could not derive a next action from the current state.",
        analysis: ["Load a report with issues, impact and healing context first."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    const lead = actions[0];
    return {
      title: "Next ideal step",
      summary: `${lead.actionLabel} is the current lead action.`,
      analysis: [
        `Score ${Number(lead.score || 0).toFixed(2)} | ${lead.playbookTitle}`,
        ...(Array.isArray(lead.reasons) ? lead.reasons.slice(0, 3) : []),
      ],
      actions: [
        lead.actionMode === "prepare_healing"
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: lead.issueCode, route: lead.route, action: lead.action } }
          : { id: "switch-findings", label: "Open findings" },
        { id: "switch-prompts", label: "Open prompts" },
      ],
    };
  }

  function buildQualityTrajectoryResponse(context) {
    const autonomous = context.autonomous;
    if (!autonomous) {
      return {
        title: "No autonomous QA state",
        summary: "The autonomous QA engine is not available for the current report.",
        analysis: ["Load a report first."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Quality trajectory",
      summary: `SitePulse Quality Score ${context.dataIntelligence?.QUALITY_STATE?.overallScore || autonomous.qualityScore?.total || 0} | ${context.dataIntelligence?.QUALITY_STATE?.trajectory || autonomous.qualityTrajectory?.direction || "stable"}.`,
      analysis: [
        ...(context.dataIntelligence?.QUALITY_STATE?.qualityHistory?.length
          ? [`Quality history depth: ${context.dataIntelligence.QUALITY_STATE.qualityHistory.length} comparable snapshot(s).`]
          : []),
        ...(Array.isArray(autonomous.qualityScore?.rationale) ? autonomous.qualityScore.rationale.slice(0, 4) : []),
        ...(Array.isArray(autonomous.qualityTrajectory?.evidence) ? autonomous.qualityTrajectory.evidence : []),
      ],
      actions: [
        { id: "switch-overview", label: "Open overview" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildBiggestRiskResponse(context) {
    const autonomous = context.autonomous;
    const predictive = context.predictive;
    const risk = context.dataIntelligence?.RISK_STATE?.topRisks?.[0] || autonomous?.insights?.topRisks?.[0] || predictive?.alerts?.[0]?.label || "";
    if (!risk) {
      return {
        title: "No dominant risk",
        summary: "There is no dominant risk signal attached to the current report.",
        analysis: ["Run another comparable audit if you need stronger risk ranking."],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    return {
      title: "Biggest current risk",
      summary: risk,
      analysis: [
        ...(predictive?.alerts?.[0]?.evidence || []).slice(0, 3),
        ...(Array.isArray(autonomous?.insights?.recommendedActions) ? autonomous.insights.recommendedActions.slice(0, 2) : []),
      ],
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "switch-compare", label: "Open compare" },
      ],
    };
  }

  function buildIssueExplanation(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const autonomous = summarizeAutonomous(context.autonomous, issueCode);
    if (!issue && !memory) {
      return {
        title: "Issue not found",
        summary: `No issue matching ${issueCode || "the requested code"} is loaded right now.`,
        analysis: ["Load a report that contains the issue or specify the exact issue code."],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }

    const lines = [];
    if (issue) {
      lines.push(`What it means: ${issue.detail}`);
      lines.push(`Impact: ${issue.diagnosis?.laymanExplanation || issue.recommendedResolution}`);
      lines.push(`Priority: ${issue.severity || "unknown"}`);
    }
    if (memory?.finalResolution) {
      lines.push(`Final resolution: ${memory.finalResolution}`);
    } else if (memory?.possibleResolution) {
      lines.push(`Current best hypothesis: ${memory.possibleResolution}`);
    }
    if (memory?.avoidText) {
      lines.push(`Avoid this: ${memory.avoidText}`);
    }
    if (autonomous?.title) {
      lines.push(`Playbook: ${autonomous.title}`);
      if (autonomous.diagnosticStep) lines.push(`Diagnostic step: ${autonomous.diagnosticStep}`);
      if (autonomous.revalidationRule) lines.push(`Revalidation rule: ${autonomous.revalidationRule}`);
    }
    if (context.dataIssue?.history?.runsObserved) {
      lines.push(`History: ${context.dataIssue.history.runsObserved} comparable run(s) observed; recurring ${context.dataIssue.history.recurringCount || 0} time(s).`);
    }

    return {
      title: issueCode || issue?.code || "Issue explanation",
      summary: `Operational explanation for ${issueCode || issue?.code || "the requested issue"}.`,
      analysis: lines,
      actions: [
        { id: "switch-findings", label: "Open findings" },
        { id: "open-memory", label: "Open learning memory", payload: { issueCode: issueCode || issue?.code || "" } },
      ],
    };
  }

  function buildPromptResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const promptText = context.buildIssuePrompt(issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    const autonomous = summarizeAutonomous(context.autonomous, issueCode);
    const analysis = [
      "The prompt below prioritizes validated solutions, cites failed attempts when they exist and stays anchored to the current run.",
    ];
    if (memory?.failed) {
      analysis.push(`This issue has ${memory.failed} failed attempt(s) in memory; the prompt is expected to avoid them.`);
    }
    if (healing) {
      analysis.push(`Self-healing says ${healing.issueCode} is ${healing.eligibility || "blocked"} with ${healing.confidenceLabel || "n/a"} confidence.`);
      if (healing.avoidText) {
        analysis.push(`Healing avoid list: ${healing.avoidText}`);
      }
    }
    if (autonomous?.nextActionLabel) {
      analysis.push(`Autonomous next action: ${autonomous.nextActionLabel}`);
    }
    if (context.dataIssue?.predictiveRisk?.level) {
      analysis.push(`Data Intelligence risk: ${context.dataIssue.predictiveRisk.level} ${context.dataIssue.predictiveRisk.category} with confidence ${Number(context.dataIssue.predictiveRisk.confidence || 0).toFixed(2)}.`);
    }
    return {
      title: `Prompt intelligence${issueCode ? ` | ${issueCode}` : ""}`,
      summary: "Generated from the current report plus operational memory.",
      analysis,
      promptText,
      actions: [
        { id: "copy-text", label: "Copy prompt", payload: { text: promptText, successMessage: "[studio] learning-aware prompt copied." } },
        healing && ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing flow", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
        { id: "open-healing", label: "Open self-healing queue" },
        { id: "switch-prompts", label: "Open prompts" },
      ].filter(Boolean),
    };
  }

  function buildHealingCandidatesResponse(context) {
    const summary = context.strategyContext?.healingSummary;
    const candidates = context.strategyContext?.healingCandidates || [];
    if (!summary || candidates.length === 0) {
      return {
        title: "No healing candidates",
        summary: "No issue is currently marked as eligible or assist-only for self-healing.",
        analysis: ["Run a fresh audit or strengthen operational memory to unlock safer healing strategies."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    return {
      title: "Self-healing candidates",
      summary: `${summary.eligible} eligible | ${summary.assistOnly} assist only | ${summary.promptReady} prompt-ready | ${summary.pendingAttempts} pending attempt(s).`,
      analysis: candidates.map((item, index) => `${index + 1}. ${item.issueCode} | ${item.route}${item.action ? ` | ${item.action}` : ""} | ${item.eligibility} | ${item.healingMode} | ${item.confidenceLabel || "n/a"}${item.resolutionLead ? ` | lead ${item.resolutionLead}` : ""}`),
      actions: [
        { id: "open-healing", label: "Open self-healing queue" },
        candidates[0] ? { id: "prepare-healing", label: "Prepare top candidate", payload: { issueCode: candidates[0].issueCode, route: candidates[0].route, action: candidates[0].action } } : null,
      ].filter(Boolean),
    };
  }

  function buildHealingStrategyResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    if (!issue || !healing) {
      return {
        title: "Healing strategy unavailable",
        summary: `No self-healing strategy is loaded for ${issueCode || "the requested issue"}.`,
        analysis: ["Load a report that contains the issue or ask the assistant which issues are eligible for healing."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    const analysis = [
      `Eligibility: ${healing.eligibility}`,
      `Healing mode: ${healing.healingMode}`,
      `Confidence: ${healing.confidenceLabel || "n/a"} (${healing.confidenceScore}/100)`,
      `Strategy: ${healing.strategyDescription || healing.strategyId || "n/a"}`,
      healing.resolutionLead ? `Best known correction: ${healing.resolutionLead}` : "No correction lead is locked yet.",
      healing.avoidText ? `Avoid this: ${healing.avoidText}` : "No failed pattern is recorded for this issue yet.",
      ...(Array.isArray(healing.rationale) ? healing.rationale.slice(0, 3) : []),
    ].filter(Boolean);

    return {
      title: `Healing strategy | ${healing.issueCode}`,
      summary: healing.suggestedNextStep || "Operational healing strategy prepared from runtime memory.",
      analysis,
      actions: [
        ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
        healing.promptReady ? { id: "generate-prompt", label: "Generate healing-aware prompt", payload: { issueCode: healing.issueCode } } : null,
        { id: "open-healing", label: "Open self-healing queue" },
      ].filter(Boolean),
    };
  }

  function buildHealingDecisionResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    if (!healing) {
      return {
        title: "Healing decision unavailable",
        summary: `No self-healing decision context is loaded for ${issueCode || "the requested issue"}.`,
        analysis: ["Ask which issues are eligible for healing or load a report that contains the target issue."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    const verdict = healing.eligibility === "eligible_for_healing"
      ? "This issue is a candidate for assisted correction and can be prepared safely."
      : healing.eligibility === "assist_only"
      ? "This issue should stay prompt-assisted and human-reviewed before revalidation."
      : healing.eligibility === "manual_only"
      ? "This issue should stay manual until the memory is stronger."
      : healing.eligibility === "unsafe"
      ? "This issue is unsafe for automated correction."
      : "This issue is blocked until more context is available.";

    return {
      title: `Healing decision | ${healing.issueCode}`,
      summary: verdict,
      analysis: [
        `Mode: ${healing.healingMode}`,
        `Confidence: ${healing.confidenceLabel || "n/a"} (${healing.confidenceScore}/100)`,
        healing.resolutionLead ? `Correction lead: ${healing.resolutionLead}` : "No correction lead is currently stored.",
        healing.avoidText ? `Avoid: ${healing.avoidText}` : "No failed pattern is stored for this issue.",
      ],
      actions: [
        { id: "open-healing", label: "Open self-healing queue" },
        ["eligible_for_healing", "assist_only"].includes(healing.eligibility)
          ? { id: "prepare-healing", label: "Prepare healing", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }
          : null,
      ].filter(Boolean),
    };
  }

  function buildHealingFailureResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    const lines = [];
    if (memory?.failed) {
      lines.push(`Operational memory shows ${memory.failed} failed attempt(s).`);
    }
    if (memory?.avoidText) {
      lines.push(`Avoid this pattern: ${memory.avoidText}`);
    }
    if (healing?.lastAttempt) {
      lines.push(`Last healing attempt: ${healing.lastAttempt.outcome || healing.lastAttempt.status}${healing.lastAttempt.updatedAt ? ` | ${healing.lastAttempt.updatedAt}` : ""}`);
    }
    if (!lines.length) {
      lines.push("No failed healing pattern is currently recorded for this issue.");
    }

    return {
      title: issueCode ? `What failed before | ${issueCode}` : "What failed before",
      summary: "Review failed patterns before repeating a correction attempt.",
      analysis: lines,
      actions: [
        issueCode ? { id: "open-memory", label: "Open learning memory", payload: { issueCode } } : null,
        { id: "open-healing", label: "Open self-healing queue" },
      ].filter(Boolean),
    };
  }

  function buildHealingRevalidateResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const healing = summarizeHealing(context.selfHealing, issueCode)
      || getHealingCandidates(context.selfHealing).find((item) => item.lastAttempt && item.lastAttempt.outcome === "pending")
      || null;
    if (!healing || healing.lastAttempt?.outcome !== "pending") {
      return {
        title: "No pending healing attempt",
        summary: "There is no pending self-healing attempt ready for revalidation.",
        analysis: ["Prepare a healing attempt first, apply the fix, then rerun the audit through the operator mode."],
        actions: [{ id: "open-healing", label: "Open self-healing queue" }],
      };
    }

    return {
      title: `Revalidate healing | ${healing.issueCode}`,
      summary: "The assistant can trigger a new audit so the Self-Healing Engine can resolve the pending attempt.",
      analysis: [
        `Pending attempt mode: ${healing.lastAttempt.healingMode || healing.healingMode}`,
        healing.resolutionLead ? `Expected correction: ${healing.resolutionLead}` : "No correction lead is stored.",
        "Only trigger this after the actual fix has been applied.",
      ],
      actions: [{ id: "revalidate-healing", label: "Revalidate now", payload: { issueCode: healing.issueCode, route: healing.route, action: healing.action } }],
    };
  }

  function buildValidatedResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report available.",
        analysis: ["Run or load an audit before asking which critical issues already have validated solutions."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const items = (report.issues || [])
      .filter((issue) => issue.severity === "high" && normalizeText(issue.finalResolution))
      .slice(0, 6);
    return {
      title: "Critical issues with final resolution",
      summary: items.length ? `${items.length} critical issue(s) already have a final resolution attached.` : "No critical issue with final resolution is loaded.",
      analysis: items.length
        ? items.map((issue, index) => `${index + 1}. ${issue.code} | ${issue.route} | ${issue.finalResolution}`)
        : ["Use manual override or revalidation to strengthen the memory for critical items that are still unresolved."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildUnresolvedCriticalResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No report loaded",
        summary: "There is no audit report available.",
        analysis: ["Run or load an audit before asking which critical issues still lack a final resolution."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }
    const items = (report.issues || [])
      .filter((issue) => issue.severity === "high" && !normalizeText(issue.finalResolution))
      .slice(0, 6);
    return {
      title: "Critical issues without final resolution",
      summary: items.length ? `${items.length} critical issue(s) still do not have a final resolution.` : "All critical issues currently loaded already have a final resolution.",
      analysis: items.length
        ? items.map((issue, index) => `${index + 1}. ${issue.code} | ${issue.route} | ${issue.detail}`)
        : ["Use compare and memory to confirm what still needs technical validation."],
      actions: [{ id: "switch-findings", label: "Open findings" }],
    };
  }

  function buildFailedResponse(context, query) {
    const lower = toLower(query);
    const categoryMatch = lower.match(/\b(seo|visual|network|runtime|interaction|content|http|general)\b/);
    const requestedCategory = categoryMatch ? categoryMatch[1] : "";
    const entries = (context.learningMemory?.entries || []).filter((entry) => {
      if (Number(entry.learningCounts?.failed || 0) <= 0) return false;
      if (!requestedCategory) return true;
      return toLower(entry.category) === requestedCategory;
    }).slice(0, 8);

    return {
      title: requestedCategory ? `Failed patterns | ${requestedCategory}` : "Failed patterns",
      summary: entries.length
        ? `${entries.length} learned pattern(s) contain failed attempts${requestedCategory ? ` in ${requestedCategory}` : ""}.`
        : "No failed pattern matched the requested scope.",
      analysis: entries.length
        ? entries.map((entry, index) => `${index + 1}. ${entry.issueCode} | fail ${entry.learningCounts.failed}${entry.avoidText ? ` | avoid ${entry.avoidText}` : ""}`)
        : ["Try another category or run more audits to accumulate failure memory."],
      actions: [{ id: "switch-settings", label: "Open learning memory" }],
    };
  }

  function buildAuditSiteResponse(context, query) {
    const match = normalizeText(query).match(/https?:\/\/[^\s]+/i);
    if (!match) {
      return {
        title: "Audit target missing",
        summary: "No URL was found in the request.",
        analysis: ["Ask again with a full URL, for example: audite https://example.com"],
        actions: [{ id: "switch-overview", label: "Open overview" }],
      };
    }
    const baseUrl = match[0];
    const commandCount = context.operatorContext?.commands?.length || 0;
    return {
      title: "Audit target detected",
      summary: `The assistant can prepare and run an audit for ${baseUrl}.`,
      analysis: [
        "This action uses the real engine and the current desktop profile.",
        commandCount ? `Operator mode currently sees ${commandCount} actionable workstation command(s).` : "Operator mode is ready to dispatch the audit through the desktop engine.",
      ],
      actions: [{ id: "run-audit", label: "Run audit now", payload: { baseUrl } }],
    };
  }

  function buildLatestRunResponse(context) {
    const report = context.report;
    if (!report) {
      return {
        title: "No run loaded",
        summary: "There is no current or last run loaded in the desktop.",
        analysis: ["Run or load an audit first."],
        actions: [{ id: "switch-overview", label: "Prepare audit" }],
      };
    }

    const lines = [
      `Generated: ${report.meta.generatedAt}`,
      `Routes checked: ${report.summary.routesChecked}`,
      `Actions mapped: ${report.summary.actionsMapped}`,
    ];
    if (Array.isArray(context.runHistory) && context.runHistory.length > 1) {
      lines.push(`History available: ${context.runHistory.length} snapshot(s).`);
    }

    return {
      title: "Latest loaded run",
      summary: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${report.summary.seoScore}`,
      analysis: lines,
      actions: [{ id: "switch-reports", label: "Open reports" }],
    };
  }

  function buildMemoryResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const memory = summarizeMemory(context.learningMemory, issueCode);
    if (!memory) {
      return {
        title: "Memory not found",
        summary: `No operational memory entry matched ${issueCode || "the requested issue"}.`,
        analysis: ["Run more audits or specify another issue code."],
        actions: [{ id: "switch-settings", label: "Open learning memory" }],
      };
    }

    const lines = [
      `Validated: ${memory.validated}`,
      `Failed: ${memory.failed}`,
      `Partial: ${memory.partial}`,
    ];
    if (memory.finalResolution) lines.push(`Final resolution: ${memory.finalResolution}`);
    if (memory.possibleResolution) lines.push(`Possible resolution: ${memory.possibleResolution}`);
    if (memory.avoidText) lines.push(`Avoid: ${memory.avoidText}`);

    return {
      title: `Learning memory | ${memory.issueCode}`,
      summary: memory.learningSource || "Operational memory loaded from the local store.",
      analysis: lines,
      actions: [{ id: "open-memory", label: "Open memory panel", payload: { issueCode: memory.issueCode } }],
    };
  }

  function buildManualOverrideResponse(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    if (!issue) {
      return {
        title: "Issue code required",
        summary: "The assistant needs an issue code loaded in the current report before asking for a manual override.",
        analysis: ["Example: promova manualmente SEO_CANONICAL_MISSING"],
        actions: [{ id: "switch-findings", label: "Open findings" }],
      };
    }
    return {
      title: `Manual override | ${issue.code}`,
      summary: "A manual override should only be applied when you deliberately want to mark a final resolution with traceability.",
      analysis: [
        `Current recommendation: ${issue.recommendedResolution}`,
        issue.possibleResolution ? `Possible resolution: ${issue.possibleResolution}` : "No possible resolution is attached yet.",
      ],
      actions: [{ id: "manual-override", label: "Promote solution", payload: { issueCode: issue.code } }],
    };
  }

  function buildLogsResponse(context) {
    const lines = (context.logs || []).slice(-8);
    return {
      title: "Recent engine log",
      summary: lines.length ? "Latest log entries from the desktop runtime." : "No runtime log is loaded.",
      analysis: lines.length ? lines : ["No runtime log is available yet."],
      actions: [{ id: "switch-operations", label: "Open operations" }],
    };
  }

  function routeQuery(rawQuery, appContext) {
    const normalizedQuery = toLower(rawQuery);
    const intentDefinition = getIntentDefinition(normalizedQuery);
    const modeKey = intentDefinition?.mode || "strategy_advisor";
    const modeContext = buildModeContext(modeKey, appContext, rawQuery);
    const result = intentDefinition?.builder
      ? intentDefinition.builder(modeContext, rawQuery)
      : buildPrioritiesResponse(modeContext);
    return wrapModeResult(modeKey, intentDefinition?.id || "priorities", result);
  }

  globalScope.createSitePulseAssistantService = function createSitePulseAssistantService(options) {
    return {
      getModeRegistry() {
        return MODE_REGISTRY;
      },
      respond(rawQuery) {
        const context = options.getContext();
        return routeQuery(rawQuery, context);
      },
    };
  };
})(window);
