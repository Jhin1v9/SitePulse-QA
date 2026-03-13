(function attachSitePulseAssistant(globalScope) {
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

  function prioritizeIssues(report) {
    const issues = Array.isArray(report?.issues) ? report.issues : [];
    return [...issues].sort((left, right) => {
      const severityRankLeft = left.severity === "high" ? 3 : left.severity === "medium" ? 2 : 1;
      const severityRankRight = right.severity === "high" ? 3 : right.severity === "medium" ? 2 : 1;
      if (severityRankRight !== severityRankLeft) return severityRankRight - severityRankLeft;
      const validatedLeft = Number(left.learningCounts?.validated || 0);
      const validatedRight = Number(right.learningCounts?.validated || 0);
      if (validatedLeft !== validatedRight) return validatedLeft - validatedRight;
      return normalizeText(left.code).localeCompare(normalizeText(right.code));
    });
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

    const topIssues = prioritizeIssues(report).slice(0, 3);
    const lines = topIssues.length
      ? topIssues.map((issue, index) => {
          const memory = summarizeMemory(context.learningMemory, issue.code);
          const suffix = memory?.finalResolution
            ? `Final resolution available (${memory.finalResolutionOrigin || "runtime"}).`
            : memory?.failed
            ? `There are ${memory.failed} failed attempt(s); avoid repeating them blindly.`
            : "No validated fix is attached yet.";
          return `${index + 1}. ${issue.code} on ${issue.route}${issue.action ? ` -> ${issue.action}` : ""}. ${suffix}`;
        })
      : ["No issues are currently loaded."];

    return {
      title: "What to do first",
      summary: `Current report has ${report.summary.totalIssues} issue(s) with SEO ${report.summary.seoScore}.`,
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

    const seoIssues = (report.issues || []).filter((issue) => normalizeText(issue.code).startsWith("SEO_"));
    const top = seoIssues.slice(0, 4);
    return {
      title: "SEO priorities",
      summary: `SEO score ${report.summary.seoScore}. ${report.summary.seoCriticalIssues || 0} critical SEO issue(s).`,
      analysis: top.length
        ? top.map((issue, index) => `${index + 1}. ${issue.code} | ${issue.route} | ${issue.detail}`)
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
      summary: "The desktop already has comparison data available.",
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
      summary: "Current regression view against the active baseline.",
      analysis: context.compareDigest.split("\n").slice(0, 12),
      actions: [{ id: "switch-compare", label: "Open compare" }],
    };
  }

  function buildIssueExplanation(context, query) {
    const issueCode = inferIssueCode(query, context);
    const issue = findIssueByCode(context, issueCode);
    const memory = summarizeMemory(context.learningMemory, issueCode);
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
      lines.push(`Recommended fix: ${issue.recommendedResolution}`);
    }
    if (memory?.finalResolution) {
      lines.push(`Final resolution: ${memory.finalResolution}`);
    } else if (memory?.possibleResolution) {
      lines.push(`Current best hypothesis: ${memory.possibleResolution}`);
    }
    if (memory?.avoidText) {
      lines.push(`Avoid this: ${memory.avoidText}`);
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
    return {
      title: `Prompt intelligence${issueCode ? ` | ${issueCode}` : ""}`,
      summary: "Generated from the current report plus operational memory.",
      analysis: [
        "The prompt below prioritizes validated solutions, cites failed attempts when they exist and stays anchored to the current run.",
      ],
      promptText,
      actions: [
        { id: "copy-text", label: "Copy prompt", payload: { text: promptText, successMessage: "[studio] learning-aware prompt copied." } },
        { id: "switch-prompts", label: "Open prompts" },
      ],
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

  function buildAuditSiteResponse(query) {
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
    return {
      title: "Audit target detected",
      summary: `The assistant can prepare and run an audit for ${baseUrl}.`,
      analysis: ["This action uses the real engine and the current desktop profile."],
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
    return {
      title: "Latest loaded run",
      summary: `${report.meta.baseUrl} | ${report.summary.totalIssues} issue(s) | SEO ${report.summary.seoScore}`,
      analysis: [
        `Generated: ${report.meta.generatedAt}`,
        `Routes checked: ${report.summary.routesChecked}`,
        `Actions mapped: ${report.summary.actionsMapped}`,
      ],
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

  function resolveIntent(query) {
    if (!query) return "priorities";
    if (matchesAny(query, ["painel de memoria", "memory panel", "painel de aprendizados"])) return "memory_guide";
    if (matchesAny(query, ["como usar", "how do i use", "como usar o painel", "guide", "what does", "me ensine", "ensine"])) return "guide";
    if (matchesAny(query, ["analise o log", "analyze the log", "problemas prioritarios de seo", "seo priorities"])) return "seo";
    if (matchesAny(query, ["o que significa", "what means", "explain", "explique"])) return "issue_explain";
    if (matchesAny(query, ["ainda nao tem solucao", "still lack", "sem solucao validada", "without final resolution"])) return "unresolved_critical";
    if (matchesAny(query, ["quais problemas criticos", "critical issues", "solucao validada"])) return "validated";
    if (matchesAny(query, ["quais solucoes falharam", "failed solutions", "failed attempts"])) return "failed";
    if (matchesAny(query, ["promova", "manual override", "promote solution"])) return "manual_override";
    if (matchesAny(query, ["o que piorou", "what got worse", "piorou"])) return "regression";
    if (matchesAny(query, ["compare", "comparar", "compare a run", "run atual com a anterior"])) return "compare";
    if (matchesAny(query, ["gere um prompt", "generate a prompt", "crie um prompt"])) return "prompt";
    if (matchesAny(query, ["abra a memoria", "open memory", "aprendizados validados"])) return "memory";
    if (matchesAny(query, ["ultima run", "latest run", "open last run", "abrir ultima run"])) return "latest_run";
    if (matchesAny(query, ["me diga o que devo fazer primeiro", "what should i do first", "prioritize"])) return "priorities";
    if (matchesAny(query, ["audite", "run audit", "audit "])) return "audit";
    if (matchesAny(query, ["log", "logs"])) return "logs";
    return "priorities";
  }

  globalScope.createSitePulseAssistantService = function createSitePulseAssistantService(options) {
    return {
      respond(rawQuery) {
        const context = options.getContext();
        const query = toLower(rawQuery);
        const intent = resolveIntent(query);
        if (intent === "memory_guide") return buildMemoryGuideResponse(context);
        if (intent === "guide") return buildGuideResponse(context);
        if (intent === "seo") return buildSeoResponse(context);
        if (intent === "issue_explain") return buildIssueExplanation(context, rawQuery);
        if (intent === "unresolved_critical") return buildUnresolvedCriticalResponse(context);
        if (intent === "validated") return buildValidatedResponse(context);
        if (intent === "failed") return buildFailedResponse(context, rawQuery);
        if (intent === "manual_override") return buildManualOverrideResponse(context, rawQuery);
        if (intent === "regression") return buildRegressionResponse(context);
        if (intent === "compare") return buildCompareResponse(context);
        if (intent === "prompt") return buildPromptResponse(context, rawQuery);
        if (intent === "memory") return buildMemoryResponse(context, rawQuery);
        if (intent === "latest_run") return buildLatestRunResponse(context);
        if (intent === "audit") return buildAuditSiteResponse(rawQuery);
        if (intent === "logs") return buildLogsResponse(context);
        return buildPrioritiesResponse(context);
      },
    };
  };
})(window);
