(function attachSitePulseAutonomousQa(globalScope) {
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

  function average(values) {
    const numeric = values.filter((value) => Number.isFinite(value));
    if (!numeric.length) return 0;
    return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
  }

  function unique(values) {
    return [...new Set(values)];
  }

  function safeDateValue(value) {
    const stamp = Date.parse(String(value || ""));
    return Number.isFinite(stamp) ? stamp : 0;
  }

  function emptyAutonomousSnapshot() {
    return {
      updatedAt: "",
      qualityScore: {
        total: 0,
        dimensions: {
          seoQuality: 0,
          uxQuality: 0,
          performanceQuality: 0,
          visualIntegrity: 0,
          technicalIntegrity: 0,
          trendStability: 0,
        },
        rationale: [],
      },
      qualityTrajectory: {
        direction: "stable",
        confidence: 0,
        currentScore: 0,
        previousScore: 0,
        evidence: [],
      },
      nextActions: [],
      playbooks: {},
      insights: {
        topRisks: [],
        topImprovements: [],
        criticalRegressions: [],
        recommendedActions: [],
      },
      observability: {
        loop: [],
      },
    };
  }

  function issueFamily(code) {
    const normalized = normalizeText(code).toUpperCase();
    if (normalized.startsWith("SEO_")) return "seo";
    if (normalized.startsWith("VISUAL_")) return "visual";
    if (normalized.startsWith("BTN_")) return "ux";
    if (["HTTP_", "NET_", "ROUTE_LOAD_FAIL"].some((prefix) => normalized.startsWith(prefix)) || normalized === "ROUTE_LOAD_FAIL") return "performance";
    if (["JS_", "CONSOLE_", "HTTP_", "NET_", "ROUTE_"].some((prefix) => normalized.startsWith(prefix))) return "technical";
    return "general";
  }

  function createPlaybookRegistry() {
    return {
      SEO_CANONICAL_MISSING: {
        title: "Canonical integrity playbook",
        diagnosticStep: "Inspect canonical generation on the affected route and verify whether multiple template layers emit conflicting canonicals.",
        healingStrategy: "Restore one canonical source of truth before revalidating the route.",
        promptTemplate: "Generate a code change that fixes canonical generation without altering unrelated metadata paths.",
        revalidationRule: "Rerun the same scope and confirm the canonical issue disappears with no new SEO regression.",
        learningRule: "Promote the final solution only after the rerun removes the issue cleanly.",
      },
      SEO_LANG_MISSING: {
        title: "Language consistency playbook",
        diagnosticStep: "Verify html lang, locale routing and translated UI fragments on the affected route.",
        healingStrategy: "Align document language, translations and route locale before revalidation.",
        promptTemplate: "Ask the coding agent to fix language metadata and remove hardcoded copy outside the i18n layer.",
        revalidationRule: "Rerun the same locale route and confirm the language issue is gone without introducing copy drift.",
        learningRule: "Mark validated only if the issue disappears and no language conflict reappears elsewhere.",
      },
      seo: {
        title: "SEO correction playbook",
        diagnosticStep: "Inspect metadata, structured SEO signals and the affected route template before changing code.",
        healingStrategy: "Apply the strongest validated SEO fix first and keep changes scoped to the route/template layer.",
        promptTemplate: "Generate a surgical SEO fix prompt tied to the current issue, route and validated memory.",
        revalidationRule: "Rerun the same scope and confirm the SEO issue disappears without reducing the SEO score.",
        learningRule: "Capture the fix outcome only after rerun evidence proves the issue is resolved or reduced.",
      },
      visual: {
        title: "Visual integrity playbook",
        diagnosticStep: "Inspect the captured evidence, compare spacing/layout against the baseline and identify the specific block causing drift.",
        healingStrategy: "Correct the structural layout cause first instead of masking the issue with cosmetic overrides.",
        promptTemplate: "Generate a layout fix prompt that names the affected block, the visual defect and the desired responsive behavior.",
        revalidationRule: "Rerun the same viewport and confirm the visual issue disappears without creating a new layout regression.",
        learningRule: "Promote the fix only when evidence shows a stable visual result in rerun screenshots.",
      },
      ux: {
        title: "UX action playbook",
        diagnosticStep: "Review the affected interaction path, expected action and captured evidence before suggesting a code change.",
        healingStrategy: "Fix the interaction contract first, then validate that the user-visible behavior matches the expected action.",
        promptTemplate: "Generate a UX-focused fix prompt anchored to the broken action and the observed user impact.",
        revalidationRule: "Rerun the affected action and verify that the expected behavior now occurs without side effects.",
        learningRule: "Record validated only when the action passes consistently in rerun evidence.",
      },
      performance: {
        title: "Performance and delivery playbook",
        diagnosticStep: "Review failing network/runtime checkpoints and identify whether the issue is server-side, request-level or route-loading related.",
        healingStrategy: "Address the narrowest failing dependency first and revalidate under the same audit conditions.",
        promptTemplate: "Generate a runtime/performance fix prompt tied to the failing request or route load path.",
        revalidationRule: "Rerun the same target and confirm that the failing checkpoint no longer appears.",
        learningRule: "Promote the fix only after rerun removes the failing runtime/performance issue.",
      },
      technical: {
        title: "Technical integrity playbook",
        diagnosticStep: "Use logs, runtime evidence and affected route context to isolate the failing subsystem before changing code.",
        healingStrategy: "Prefer validated runtime fixes and avoid failed patterns recorded in memory.",
        promptTemplate: "Generate a technical fix prompt that cites logs, issue code, route and previous failed attempts.",
        revalidationRule: "Rerun the same flow and verify the technical issue is no longer present.",
        learningRule: "Record the outcome with traceability and only promote validated evidence-backed fixes.",
      },
      general: {
        title: "General QA playbook",
        diagnosticStep: "Review the issue evidence, context and memory before proposing a change.",
        healingStrategy: "Start with the best validated lead, then scope the fix tightly.",
        promptTemplate: "Generate a narrowly scoped fix prompt based on current evidence and operational memory.",
        revalidationRule: "Rerun the same scope and compare against the previous snapshot.",
        learningRule: "Update memory only after the rerun proves validated, failed or partial outcome.",
      },
    };
  }

  function createSitePulseAutonomousQaService(options) {
    const issueSignature = typeof options?.issueSignature === "function"
      ? options.issueSignature
      : (issue) => `${normalizeText(issue?.code)}|${normalizeText(issue?.route || "/")}|${normalizeText(issue?.action)}|${normalizeText(issue?.viewportLabel)}`;
    const severityRank = typeof options?.severityRank === "function"
      ? options.severityRank
      : (severity) => (normalizeText(severity) === "high" ? 3 : normalizeText(severity) === "medium" ? 2 : 1);
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
    const registry = createPlaybookRegistry();

    function getComparableHistory(report, history) {
      const items = Array.isArray(history) ? history : [];
      return items
        .filter((entry) => entry?.report)
        .filter((entry) => normalizeText(entry.report.meta?.baseUrl) === normalizeText(report.meta?.baseUrl))
        .sort((left, right) => safeDateValue(left.stamp || left.report?.meta?.generatedAt) - safeDateValue(right.stamp || right.report?.meta?.generatedAt))
        .slice(-8);
    }

    function issueByCode(entries) {
      const map = new Map();
      (entries || []).forEach((entry) => {
        const code = normalizeText(entry.issueCode || entry.code).toUpperCase();
        if (code) map.set(code, entry);
      });
      return map;
    }

    function getPlaybook(issue) {
      const code = normalizeText(issue.code).toUpperCase();
      const family = issueFamily(code);
      return registry[code] || registry[family] || registry.general;
    }

    function computeQualityDimensions(report, predictive) {
      const issues = Array.isArray(report?.issues) ? report.issues : [];
      const seoIssues = issues.filter((issue) => issueFamily(issue.code) === "seo");
      const visualIssues = issues.filter((issue) => issueFamily(issue.code) === "visual");
      const uxIssues = issues.filter((issue) => ["visual", "ux"].includes(issueFamily(issue.code)));
      const performanceIssues = issues.filter((issue) => issueFamily(issue.code) === "performance");
      const technicalIssues = issues.filter((issue) => ["technical", "performance"].includes(issueFamily(issue.code)));
      const seoQuality = clamp(toNumber(report.summary?.seoScore, 0), 0, 100);
      const visualPenalty = clamp(average(visualIssues.map((issue) => toNumber(issue.impact?.impactScore, 0))) * 28 + visualIssues.length * 4 + visualIssues.filter((issue) => issue.severity === "high").length * 8, 0, 82);
      const uxPenalty = clamp(average(uxIssues.map((issue) => toNumber(issue.impact?.impactScore, 0))) * 26 + uxIssues.length * 3.5 + uxIssues.filter((issue) => issue.severity === "high").length * 7, 0, 82);
      const performancePenalty = clamp(average(performanceIssues.map((issue) => toNumber(issue.impact?.impactScore, 0))) * 28 + performanceIssues.length * 4.5 + performanceIssues.filter((issue) => issue.severity === "high").length * 9, 0, 86);
      const technicalPenalty = clamp(average(technicalIssues.map((issue) => toNumber(issue.impact?.impactScore, 0))) * 24 + technicalIssues.length * 4 + technicalIssues.filter((issue) => issue.severity === "high").length * 8, 0, 88);
      const trendPenalty = clamp((toNumber(predictive?.summary?.highRiskAlerts, 0) * 10) + (toNumber(predictive?.summary?.mediumRiskAlerts, 0) * 5) + (toNumber(predictive?.summary?.oscillatingIssues, 0) * 4), 0, 65);
      const dimensions = {
        seoQuality,
        uxQuality: clamp(100 - uxPenalty, 0, 100),
        performanceQuality: clamp(100 - performancePenalty, 0, 100),
        visualIntegrity: clamp(100 - visualPenalty, 0, 100),
        technicalIntegrity: clamp(100 - technicalPenalty, 0, 100),
        trendStability: clamp(100 - trendPenalty, 0, 100),
      };
      const total = clamp(Math.round(
        dimensions.seoQuality * 0.24
        + dimensions.uxQuality * 0.16
        + dimensions.performanceQuality * 0.14
        + dimensions.visualIntegrity * 0.16
        + dimensions.technicalIntegrity * 0.18
        + dimensions.trendStability * 0.12
      ), 0, 100);
      const rationale = [
        `SEO quality ${dimensions.seoQuality}/100 from the current SEO score and issue pressure.`,
        `UX quality ${dimensions.uxQuality}/100 from interaction and visual issue density.`,
        `Performance quality ${dimensions.performanceQuality}/100 from route, network and delivery failures.`,
        `Visual integrity ${dimensions.visualIntegrity}/100 from visual collision, overflow and spacing signals.`,
        `Technical integrity ${dimensions.technicalIntegrity}/100 from runtime, network and console pressure.`,
        `Trend stability ${dimensions.trendStability}/100 from predictive alerts and oscillation in recent runs.`,
      ];
      return { total, dimensions, rationale };
    }

    function readStoredQualityScore(report, fallback = Number.NaN) {
      const scoreCandidate = Number(
        report?.dataIntelligence?.QUALITY_STATE?.overallScore
        ?? report?.autonomous?.qualityScore?.total
      );
      return Number.isFinite(scoreCandidate) ? scoreCandidate : fallback;
    }

    function computeTrajectory(report, history, predictive, currentQualityScore) {
      const comparable = getComparableHistory(report, history)
        .map((entry) => entry.report)
        .filter(Boolean);
      const currentScore = Number.isFinite(currentQualityScore)
        ? currentQualityScore
        : computeQualityDimensions(report, predictive).total;
      const previousReport = comparable.length ? comparable[comparable.length - 1] : null;
      const previousScore = previousReport
        ? readStoredQualityScore(previousReport, computeQualityDimensions(previousReport, { summary: {} }).total)
        : currentScore;
      const delta = currentScore - previousScore;
      let direction = "stable";
      if (delta >= 3) direction = "improving";
      else if (delta <= -3) direction = "degrading";
      const confidence = clamp((comparable.length * 0.15) + 0.35, 0, 0.92);
      const evidence = [
        `Current quality score ${currentScore}.`,
        `Previous comparable score ${previousScore}.`,
      ];
      if (predictive?.summary?.highRiskAlerts) {
        evidence.push(`${predictive.summary.highRiskAlerts} high-risk predictive alert(s) currently active.`);
      }
      return {
        direction,
        confidence: Number(confidence.toFixed(2)),
        currentScore,
        previousScore,
        evidence,
      };
    }

    function buildNextActions(report, learningMemory, selfHealing, predictive) {
      const memoryMap = issueByCode(learningMemory?.entries);
      const healingMap = issueByCode(selfHealing?.issues);
      const predictiveSignals = predictive?.issueSignals || {};
      return (report?.issues || [])
        .map((issue) => {
          const memory = memoryMap.get(normalizeText(issue.code).toUpperCase()) || null;
          const healing = healingMap.get(normalizeText(issue.code).toUpperCase()) || null;
          const signal = predictiveSignals[issueSignature(issue)] || null;
          const priorityWeight = [1, 0.85, 0.65, 0.45, 0.25][priorityRank(issue.impact?.priorityLevel)];
          const impactWeight = clamp(toNumber(issue.impact?.impactScore, 0), 0, 1);
          const healingWeight = healing ? clamp(toNumber(healing.confidenceScore, 0) / 100, 0, 1) : 0;
          const predictiveWeight = signal ? clamp(toNumber(signal.riskConfidence, 0), 0, 1) : 0;
          const trendWeight = signal?.trendDirection === "degrading" ? 0.12 : signal?.trendDirection === "oscillating" ? 0.1 : signal?.trendDirection === "improving" ? -0.05 : 0;
          const unresolvedWeight = memory?.finalResolution ? 0 : 0.07;
          const score = clamp(
            priorityWeight * 0.3
            + impactWeight * 0.32
            + healingWeight * 0.14
            + predictiveWeight * 0.16
            + trendWeight
            + unresolvedWeight,
            0,
            1,
          );
          const playbook = getPlaybook(issue);
          const reasons = [
            `${issue.impact?.priorityLevel || "P4"} priority with impact ${(impactWeight || 0).toFixed(2)}.`,
            healing ? `Healing confidence ${healing.confidenceLabel || "n/a"} (${toNumber(healing.confidenceScore, 0)}/100).` : "No healing strategy is attached yet.",
            signal ? `${signal.trendDirection} trend with ${signal.riskLevel} predictive risk.` : "No predictive signal attached yet.",
          ];
          let actionLabel = `Investigate ${issue.code}`;
          let actionMode = "manual_investigation";
          if (healing && ["eligible_for_healing", "assist_only"].includes(normalizeText(healing.eligibility)) && healing.promptReady) {
            actionLabel = `Prepare healing for ${issue.code}`;
            actionMode = "prepare_healing";
          } else if (memory?.finalResolution) {
            actionLabel = `Apply validated fix for ${issue.code}`;
            actionMode = "validated_fix";
          } else if (healing?.promptReady) {
            actionLabel = `Generate assisted prompt for ${issue.code}`;
            actionMode = "prompt_assisted";
          }
          return {
            issueCode: issue.code,
            route: issue.route,
            action: issue.action || "",
            score: Number(score.toFixed(2)),
            actionLabel,
            actionMode,
            playbookTitle: playbook.title,
            playbook,
            reasons,
            predictiveRisk: signal ? `${signal.riskLevel} ${signal.riskCategory}` : "No predictive risk attached.",
            healingConfidence: healing?.confidenceLabel || "n/a",
          };
        })
        .sort((left, right) => right.score - left.score)
        .slice(0, 6);
    }

    function buildInsights(report, intelligence, predictive, nextActions) {
      const comparison = intelligence?.comparison || null;
      return {
        topRisks: Array.isArray(predictive?.alerts) && predictive.alerts.length
          ? predictive.alerts.slice(0, 4).map((item) => item.label)
          : (report?.intelligence?.executiveSummary?.topRisks || []).slice(0, 4),
        topImprovements: comparison
          ? [
              ...(comparison.resolvedIssues || []).slice(0, 2).map((issue) => `${issue.code} resolved since the reference run.`),
              ...(comparison.reducedIssues || []).slice(0, 2).map((issue) => `${issue.code} severity reduced on ${issue.route}.`),
            ].slice(0, 4)
          : [],
        criticalRegressions: comparison
          ? (comparison.criticalRegressions || []).slice(0, 4).map((issue) => `${issue.code} is a critical regression on ${issue.route}.`)
          : [],
        recommendedActions: nextActions.slice(0, 4).map((item, index) => `${index + 1}. ${item.actionLabel} | ${item.playbookTitle}`),
      };
    }

    function buildObservability(report, intelligence, predictive, nextActions, qualityTrajectory, selfHealing, learningMemory) {
      const loop = [];
      loop.push({
        stage: "audit_run",
        status: "complete",
        evidence: `${report.summary.totalIssues} issue(s), SEO ${report.summary.seoScore}, ${report.summary.routesChecked} route(s).`,
      });
      loop.push({
        stage: "analysis",
        status: "complete",
        evidence: `${report.summary.priorityP0 || 0} P0, ${report.summary.priorityP1 || 0} P1, top impact ${toNumber(report.summary.topImpactScore, 0).toFixed(2)}.`,
      });
      loop.push({
        stage: "impact_classification",
        status: "complete",
        evidence: `${report.intelligence?.summary?.highImpactIssues || 0} high-impact issue(s) classified.`,
      });
      loop.push({
        stage: "priority_classification",
        status: "complete",
        evidence: nextActions.length ? `Next action lead: ${nextActions[0].issueCode} (${nextActions[0].score}).` : "No next action candidate was generated.",
      });
      loop.push({
        stage: "healing_strategy",
        status: "complete",
        evidence: `${selfHealing?.summary?.eligible || 0} eligible | ${selfHealing?.summary?.assistOnly || 0} assist only | ${selfHealing?.summary?.pendingAttempts || 0} pending attempt(s).`,
      });
      loop.push({
        stage: "prompt_generation",
        status: "complete",
        evidence: `${selfHealing?.summary?.promptReady || 0} issue(s) are prompt-ready for assisted correction.`,
      });
      loop.push({
        stage: "learning",
        status: "complete",
        evidence: `${learningMemory?.summary?.validatedEntries || 0} validated memory entries | ${learningMemory?.summary?.failedEntries || 0} failed pattern(s).`,
      });
      loop.push({
        stage: "trend_update",
        status: "complete",
        evidence: `${predictive?.trendOverview?.seo?.text || "SEO trend unavailable."} ${predictive?.trendOverview?.runtime?.text || ""} ${predictive?.trendOverview?.ux?.text || ""}`.trim(),
      });
      loop.push({
        stage: "predictive_risk_update",
        status: "complete",
        evidence: `${predictive?.summary?.highRiskAlerts || 0} high-risk alert(s) and ${predictive?.summary?.recurringPatterns || 0} recurring pattern(s) detected.`,
      });
      loop.push({
        stage: "quality_trajectory",
        status: "complete",
        evidence: `Quality trajectory is ${qualityTrajectory.direction} (${qualityTrajectory.currentScore} vs ${qualityTrajectory.previousScore}).`,
      });
      return { loop };
    }

    function buildAutonomousQa(report, context) {
      if (!report) return emptyAutonomousSnapshot();
      const predictive = context?.predictive || { summary: {}, issueSignals: {}, alerts: [], systemicPatterns: [] };
      const intelligence = context?.intelligence || { comparison: null };
      const learningMemory = context?.learningMemory || { entries: [], summary: {} };
      const selfHealing = context?.selfHealing || { issues: [], summary: {} };
      const history = context?.runHistory || [];
      const snapshot = emptyAutonomousSnapshot();
      snapshot.updatedAt = String(report.meta?.generatedAt || "");
      snapshot.qualityScore = computeQualityDimensions(report, predictive);
      snapshot.qualityTrajectory = computeTrajectory(report, history, predictive, snapshot.qualityScore.total);
      snapshot.nextActions = buildNextActions(report, learningMemory, selfHealing, predictive);

      snapshot.playbooks = Object.fromEntries((report.issues || []).map((issue) => {
        const playbook = getPlaybook(issue);
        const action = snapshot.nextActions.find((entry) => normalizeText(entry.issueCode).toUpperCase() === normalizeText(issue.code).toUpperCase()) || null;
        return [issueSignature(issue), {
          issueCode: issue.code,
          title: playbook.title,
          diagnosticStep: playbook.diagnosticStep,
          healingStrategy: playbook.healingStrategy,
          promptTemplate: playbook.promptTemplate,
          revalidationRule: playbook.revalidationRule,
          learningRule: playbook.learningRule,
          nextActionScore: action?.score || 0,
          nextActionLabel: action?.actionLabel || "",
        }];
      }));

      snapshot.insights = buildInsights(report, intelligence, predictive, snapshot.nextActions);
      snapshot.observability = buildObservability(
        report,
        intelligence,
        predictive,
        snapshot.nextActions,
        snapshot.qualityTrajectory,
        selfHealing,
        learningMemory,
      );
      return snapshot;
    }

    return {
      createEmptyAutonomousSnapshot: emptyAutonomousSnapshot,
      buildAutonomousQa,
    };
  }

  globalScope.createSitePulseAutonomousQaService = createSitePulseAutonomousQaService;
})(window);
