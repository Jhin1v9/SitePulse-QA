(function attachSitePulseDataIntelligence(globalScope) {
  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function toNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function createEmptyDataIntelligenceSnapshot() {
    return {
      updatedAt: "",
      contextKey: "",
      SITE_STATE: {
        baseUrl: "",
        generatedAt: "",
        mode: "",
        scope: "",
        viewportLabel: "",
        totalIssues: 0,
        routesChecked: 0,
        actionsMapped: 0,
        historyDepth: 0,
      },
      QUALITY_STATE: {
        overallScore: 0,
        trajectory: "stable",
        trajectoryConfidence: 0,
        seoScore: 0,
        dimensions: {},
        qualityHistory: [],
      },
      RISK_STATE: {
        topRisks: [],
        predictiveAlerts: [],
        priorityCounts: { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 },
        highRiskAlertCount: 0,
        healingEligibleCount: 0,
        recommendedActionOrder: [],
      },
      TREND_STATE: {
        overallDirection: "stable",
        overallConfidence: 0,
        seo: { direction: "stable", text: "SEO = stable" },
        runtime: { direction: "stable", text: "Runtime = stable" },
        ux: { direction: "stable", text: "UX = stable" },
        predictiveOverview: {},
        systemicPatterns: [],
        recurringIssues: [],
      },
      ISSUE_STATE: [],
      ISSUE_MAP: {},
    };
  }

  function createSitePulseDataIntelligenceService(options) {
    const issueSignature = typeof options?.issueSignature === "function"
      ? options.issueSignature
      : (issue) => `${normalizeText(issue?.code)}|${normalizeText(issue?.route || "/")}|${normalizeText(issue?.action)}|${normalizeText(issue?.viewportLabel)}`;
    const priorityRank = typeof options?.priorityRank === "function"
      ? options.priorityRank
      : (priorityLevel) => {
          switch (normalizeText(priorityLevel).toUpperCase()) {
            case "P0": return 0;
            case "P1": return 1;
            case "P2": return 2;
            case "P3": return 3;
            default: return 4;
          }
        };

    function buildIssueState(issue, context) {
      const signature = issueSignature(issue);
      const predictiveMeta = context.predictive?.issueSignals?.[signature] || null;
      const intelligenceMeta = context.intelligence?.issueTrends?.[signature] || null;
      const healingMeta = (context.selfHealing?.issues || []).find((entry) => issueSignature(entry) === signature)
        || (context.selfHealing?.issues || []).find((entry) =>
          normalizeText(entry.issueCode).toUpperCase() === normalizeText(issue.code).toUpperCase()
          && normalizeText(entry.route || "/") === normalizeText(issue.route || "/"))
        || null;
      const playbookMeta = context.autonomous?.playbooks?.[signature] || null;
      const trendDirection = normalizeText(predictiveMeta?.trendDirection || intelligenceMeta?.trend || "stable");
      const trendStrength = toNumber(predictiveMeta?.trendStrength, trendDirection === "stable" ? 0.2 : 0.5);
      const trendConfidence = toNumber(predictiveMeta?.trendConfidence, 0);
      const history = {
        recurringCount: toNumber(predictiveMeta?.recurringCount, toNumber(intelligenceMeta?.recurringCount, 1)),
        runsObserved: toNumber(predictiveMeta?.runsObserved, 0),
        reappeared: predictiveMeta?.reappeared === true,
        validated: toNumber(issue.learningCounts?.validated, 0),
        failed: toNumber(issue.learningCounts?.failed, 0),
        partial: toNumber(issue.learningCounts?.partial, 0),
        lastValidatedAt: normalizeText(issue.lastValidatedAt),
        manualOverrideCount: toNumber(issue.manualOverrideCount, 0),
      };

      return {
        signature,
        issueCode: normalizeText(issue.code).toUpperCase(),
        route: normalizeText(issue.route || "/"),
        action: normalizeText(issue.action),
        severity: normalizeText(issue.severity || "low"),
        detail: normalizeText(issue.detail),
        impact: {
          score: toNumber(issue.impact?.impactScore, 0),
          category: normalizeText(issue.impact?.impactCategory),
          priority: normalizeText(issue.impact?.priorityLevel || "P4"),
          riskType: normalizeText(issue.impact?.riskType),
          confidence: normalizeText(issue.impact?.confidence),
          rationale: Array.isArray(issue.impact?.rationale) ? issue.impact.rationale.map((item) => normalizeText(item)).filter(Boolean) : [],
        },
        trend: {
          direction: trendDirection || "stable",
          strength: Number(trendStrength.toFixed(2)),
          confidence: Number(trendConfidence.toFixed(2)),
        },
        predictiveRisk: predictiveMeta
          ? {
              level: normalizeText(predictiveMeta.riskLevel),
              category: normalizeText(predictiveMeta.riskCategory),
              confidence: Number(toNumber(predictiveMeta.riskConfidence, 0).toFixed(2)),
              evidence: Array.isArray(predictiveMeta.evidence) ? predictiveMeta.evidence.map((item) => normalizeText(item)).filter(Boolean) : [],
            }
          : null,
        healing: healingMeta
          ? {
              eligibility: normalizeText(healingMeta.eligibility),
              confidenceScore: toNumber(healingMeta.confidenceScore, 0),
              confidenceLabel: normalizeText(healingMeta.confidenceLabel),
              mode: normalizeText(healingMeta.healingMode),
              promptReady: healingMeta.promptReady === true,
              resolutionLead: normalizeText(healingMeta.resolutionLead),
              suggestedNextStep: normalizeText(healingMeta.suggestedNextStep),
            }
          : null,
        history,
        playbook: playbookMeta
          ? {
              title: normalizeText(playbookMeta.title),
              diagnosticStep: normalizeText(playbookMeta.diagnosticStep),
              healingStrategy: normalizeText(playbookMeta.healingStrategy),
              promptTemplate: normalizeText(playbookMeta.promptTemplate),
              revalidationRule: normalizeText(playbookMeta.revalidationRule),
              learningRule: normalizeText(playbookMeta.learningRule),
              nextActionLabel: normalizeText(playbookMeta.nextActionLabel),
              nextActionScore: toNumber(playbookMeta.nextActionScore, 0),
            }
          : null,
      };
    }

    function buildQualityHistory(report, runHistory, autonomous) {
      const entries = Array.isArray(runHistory) ? runHistory : [];
      const history = entries
        .filter((entry) => entry?.report && normalizeText(entry.report.meta?.baseUrl) === normalizeText(report?.meta?.baseUrl))
        .slice(-7)
        .map((entry) => ({
          stamp: normalizeText(entry.stamp || entry.report?.meta?.generatedAt),
          seoScore: toNumber(entry.report?.summary?.seoScore, 0),
          totalIssues: toNumber(entry.report?.summary?.totalIssues, 0),
          topImpactScore: toNumber(entry.report?.summary?.topImpactScore, 0),
        }));
      const currentPoint = {
        stamp: normalizeText(report?.meta?.generatedAt),
        seoScore: toNumber(report?.summary?.seoScore, 0),
        totalIssues: toNumber(report?.summary?.totalIssues, 0),
        topImpactScore: toNumber(report?.summary?.topImpactScore, 0),
        qualityScore: toNumber(autonomous?.qualityScore?.total, 0),
      };
      const merged = [...history.filter((item) => item.stamp !== currentPoint.stamp), currentPoint];
      return merged.slice(-8);
    }

    function buildDataIntelligence(report, contextInput = {}) {
      if (!report) {
        return createEmptyDataIntelligenceSnapshot();
      }

      const context = {
        learningMemory: contextInput.learningMemory || null,
        selfHealing: contextInput.selfHealing || null,
        intelligence: contextInput.intelligence || null,
        predictive: contextInput.predictive || null,
        autonomous: contextInput.autonomous || null,
        runHistory: Array.isArray(contextInput.runHistory) ? contextInput.runHistory : [],
      };

      const issues = Array.isArray(report.issues) ? report.issues : [];
      const issueState = issues
        .map((issue) => buildIssueState(issue, context))
        .sort((left, right) =>
          priorityRank(left.impact.priority) - priorityRank(right.impact.priority)
          || right.impact.score - left.impact.score
          || right.history.recurringCount - left.history.recurringCount);
      const issueMap = Object.fromEntries(issueState.map((entry) => [entry.signature, entry]));
      const qualityHistory = buildQualityHistory(report, context.runHistory, context.autonomous);
      const topRisks = [
        ...(Array.isArray(context.autonomous?.insights?.topRisks) ? context.autonomous.insights.topRisks : []),
      ].slice(0, 5);
      const predictiveAlerts = Array.isArray(context.predictive?.alerts) ? context.predictive.alerts.slice(0, 6) : [];
      const priorityCounts = {
        P0: toNumber(report.summary?.priorityP0, 0),
        P1: toNumber(report.summary?.priorityP1, 0),
        P2: toNumber(report.summary?.priorityP2, 0),
        P3: toNumber(report.summary?.priorityP3, 0),
        P4: toNumber(report.summary?.priorityP4, 0),
      };
      const trajectoryDirection = normalizeText(context.autonomous?.qualityTrajectory?.direction || context.predictive?.trendOverview?.runtime?.direction || "stable");

      return {
        updatedAt: normalizeText(report.meta?.finishedAt || report.meta?.generatedAt),
        contextKey: [
          normalizeText(report.meta?.baseUrl),
          normalizeText(report.summary?.auditScope),
          normalizeText(report.meta?.viewportLabel || report.meta?.viewport),
          normalizeText(report.meta?.generatedAt),
        ].join("::"),
        SITE_STATE: {
          baseUrl: normalizeText(report.meta?.baseUrl),
          generatedAt: normalizeText(report.meta?.generatedAt),
          mode: normalizeText(report.meta?.auditMode || "desktop"),
          scope: normalizeText(report.summary?.auditScope),
          viewportLabel: normalizeText(report.meta?.viewportLabel || report.meta?.viewport),
          totalIssues: toNumber(report.summary?.totalIssues, issues.length),
          routesChecked: toNumber(report.summary?.routesChecked, 0),
          actionsMapped: toNumber(report.summary?.actionsMapped, 0),
          historyDepth: Math.max(0, qualityHistory.length - 1),
        },
        QUALITY_STATE: {
          overallScore: toNumber(context.autonomous?.qualityScore?.total, 0),
          trajectory: trajectoryDirection || "stable",
          trajectoryConfidence: Number(toNumber(context.autonomous?.qualityTrajectory?.confidence, 0).toFixed(2)),
          seoScore: toNumber(report.summary?.seoScore, 0),
          dimensions: context.autonomous?.qualityScore?.dimensions || {},
          rationale: Array.isArray(context.autonomous?.qualityScore?.rationale) ? context.autonomous.qualityScore.rationale : [],
          topImprovements: Array.isArray(context.autonomous?.insights?.topImprovements) ? context.autonomous.insights.topImprovements : [],
          qualityHistory,
        },
        RISK_STATE: {
          topRisks,
          predictiveAlerts,
          priorityCounts,
          highRiskAlertCount: predictiveAlerts.filter((item) => ["high", "critical"].includes(normalizeText(item?.riskLevel))).length,
          healingEligibleCount: toNumber(context.selfHealing?.summary?.eligible, 0),
          recommendedActionOrder: Array.isArray(context.autonomous?.insights?.recommendedActions) ? context.autonomous.insights.recommendedActions : [],
          highestImpactIssue: issueState[0] || null,
        },
        TREND_STATE: {
          overallDirection: trajectoryDirection || "stable",
          overallConfidence: Number(clamp(
            (toNumber(context.autonomous?.qualityTrajectory?.confidence, 0) + toNumber(context.predictive?.summary?.highRiskAlerts, 0) * 0.05),
            0,
            1,
          ).toFixed(2)),
          seo: context.intelligence?.trendSummary?.seo || { direction: "stable", text: "SEO = stable" },
          runtime: context.intelligence?.trendSummary?.runtime || { direction: "stable", text: "Runtime = stable" },
          ux: context.intelligence?.trendSummary?.ux || { direction: "stable", text: "UX = stable" },
          predictiveOverview: context.predictive?.trendOverview || {},
          systemicPatterns: Array.isArray(context.predictive?.systemicPatterns) ? context.predictive.systemicPatterns : [],
          recurringIssues: Array.isArray(context.intelligence?.recurringIssues)
            ? context.intelligence.recurringIssues.map((item) => ({
                issueCode: normalizeText(item.issue?.code).toUpperCase(),
                route: normalizeText(item.issue?.route || "/"),
                recurringCount: toNumber(item.recurringCount, 0),
              }))
            : [],
        },
        ISSUE_STATE: issueState,
        ISSUE_MAP: issueMap,
      };
    }

    function getIssueState(snapshot, issueLike) {
      const signature = issueSignature(issueLike);
      return snapshot?.ISSUE_MAP?.[signature] || null;
    }

    return {
      createEmptyDataIntelligenceSnapshot,
      buildDataIntelligence,
      getSiteState: (snapshot) => snapshot?.SITE_STATE || createEmptyDataIntelligenceSnapshot().SITE_STATE,
      getQualityState: (snapshot) => snapshot?.QUALITY_STATE || createEmptyDataIntelligenceSnapshot().QUALITY_STATE,
      getRiskState: (snapshot) => snapshot?.RISK_STATE || createEmptyDataIntelligenceSnapshot().RISK_STATE,
      getTrendState: (snapshot) => snapshot?.TREND_STATE || createEmptyDataIntelligenceSnapshot().TREND_STATE,
      getIssueState,
    };
  }

  globalScope.createSitePulseDataIntelligenceService = createSitePulseDataIntelligenceService;
}(window));
