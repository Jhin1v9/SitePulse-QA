(function attachSitePulseQualityControl(globalScope) {
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

  function priorityWeight(priorityLevel) {
    switch (normalizeText(priorityLevel).toUpperCase()) {
      case "P0":
        return 1;
      case "P1":
        return 0.8;
      case "P2":
        return 0.6;
      case "P3":
        return 0.4;
      default:
        return 0.2;
    }
  }

  function riskWeight(level) {
    switch (normalizeText(level).toLowerCase()) {
      case "critical":
        return 1;
      case "high":
        return 0.8;
      case "medium":
        return 0.55;
      case "low":
        return 0.3;
      default:
        return 0.15;
    }
  }

  function createEmptyQualityControlSnapshot() {
    return {
      updatedAt: "",
      contextKey: "",
      summary: {
        suspectedFalsePositives: 0,
        inconsistentIssues: 0,
        validationWarnings: 0,
      },
      issues: [],
      issueMap: {},
      topWarnings: [],
    };
  }

  function createSitePulseQualityControlEngine() {
    function buildIssueControl(issue) {
      const impactScore = toNumber(issue?.impact?.score, 0);
      const priority = normalizeText(issue?.impact?.priority || "P4");
      const priorityScore = priorityWeight(priority);
      const riskLevel = normalizeText(issue?.predictiveRisk?.level || "low");
      const riskConfidence = toNumber(issue?.predictiveRisk?.confidence, 0);
      const riskScore = riskWeight(riskLevel) * riskConfidence;
      const recurringCount = toNumber(issue?.history?.recurringCount, 0);
      const runsObserved = toNumber(issue?.history?.runsObserved, 0);
      const failedCount = toNumber(issue?.history?.failed, 0);
      const validatedCount = toNumber(issue?.history?.validated, 0);
      const trendDirection = normalizeText(issue?.trend?.direction || "stable");
      const trendConfidence = toNumber(issue?.trend?.confidence, 0);
      const conflicts = [];
      const validationWarnings = [];
      const falsePositiveSignals = [];

      if (impactScore <= 0.24 && priorityScore >= 0.8 && riskScore < 0.4 && recurringCount < 2) {
        conflicts.push("Low impact score is paired with critical priority without strong predictive or recurring evidence.");
      }
      if (impactScore >= 0.72 && priorityScore <= 0.4) {
        conflicts.push("High impact score is paired with low operational priority.");
      }
      if (riskWeight(riskLevel) >= 0.8 && riskConfidence < 0.45) {
        conflicts.push("High predictive risk is attached with weak confidence.");
      }
      if (["stable", "improving"].includes(trendDirection) && riskWeight(riskLevel) >= 0.8 && recurringCount < 2) {
        conflicts.push("Predictive risk is high while trend does not show degrading behavior or strong recurrence.");
      }

      if ((priority === "P0" || priority === "P1") && !Array.isArray(issue?.impact?.rationale)) {
        validationWarnings.push("Priority is high but impact rationale is missing.");
      }
      if (issue?.predictiveRisk && (!Array.isArray(issue.predictiveRisk.evidence) || issue.predictiveRisk.evidence.length === 0)) {
        validationWarnings.push("Predictive risk exists without explicit evidence lines.");
      }
      if (trendConfidence > 0.65 && runsObserved < 2) {
        validationWarnings.push("Trend confidence is high despite limited comparable run history.");
      }

      if (failedCount >= 2 && validatedCount === 0) {
        falsePositiveSignals.push("Repeated failed attempts with no validated outcome suggest a noisy or misclassified issue.");
      }
      if (failedCount >= 3 && impactScore < 0.35) {
        falsePositiveSignals.push("The issue remains low-impact after several failed attempts, which increases false-positive suspicion.");
      }

      const suspectedFalsePositive = falsePositiveSignals.length > 0;
      const status = conflicts.length ? "inconsistent" : suspectedFalsePositive ? "suspect" : validationWarnings.length ? "watch" : "ok";
      const controlScore = clamp(
        1
        - conflicts.length * 0.28
        - validationWarnings.length * 0.12
        - falsePositiveSignals.length * 0.18,
        0,
        1,
      );

      return {
        signature: normalizeText(issue.signature),
        issueCode: normalizeText(issue.issueCode).toUpperCase(),
        route: normalizeText(issue.route || "/"),
        status,
        controlScore: Number(controlScore.toFixed(2)),
        suspectedFalsePositive,
        falsePositiveSignals,
        conflicts,
        validationWarnings,
        summary: suspectedFalsePositive
          ? falsePositiveSignals[0]
          : conflicts[0] || validationWarnings[0] || "No quality-control warning detected.",
      };
    }

    function buildQualityControlSnapshot(report, contextInput = {}) {
      if (!report) {
        return createEmptyQualityControlSnapshot();
      }

      const issueState = Array.isArray(contextInput?.dataIntelligence?.ISSUE_STATE)
        ? contextInput.dataIntelligence.ISSUE_STATE
        : [];
      const issues = issueState.map(buildIssueControl);
      const issueMap = Object.fromEntries(issues.map((item) => [item.signature, item]));
      const topWarnings = [...issues]
        .filter((item) => item.status !== "ok")
        .sort((left, right) => left.controlScore - right.controlScore)
        .slice(0, 8)
        .map((item) => `${item.issueCode}: ${item.summary}`);

      return {
        updatedAt: normalizeText(report?.meta?.generatedAt),
        contextKey: `${normalizeText(report?.meta?.baseUrl)}|${normalizeText(report?.meta?.generatedAt)}`,
        summary: {
          suspectedFalsePositives: issues.filter((item) => item.suspectedFalsePositive).length,
          inconsistentIssues: issues.filter((item) => item.conflicts.length > 0).length,
          validationWarnings: issues.filter((item) => item.validationWarnings.length > 0).length,
        },
        issues,
        issueMap,
        topWarnings,
      };
    }

    return {
      createEmptyQualityControlSnapshot,
      buildQualityControlSnapshot,
    };
  }

  globalScope.createSitePulseQualityControlEngine = createSitePulseQualityControlEngine;
})(window);
