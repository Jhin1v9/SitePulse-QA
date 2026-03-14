(function attachSitePulsePredictiveIntelligence(globalScope) {
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

  function severityLabel(rank) {
    if (rank >= 3) return "high";
    if (rank >= 2) return "medium";
    return "low";
  }

  function issueFamily(code) {
    const normalized = normalizeText(code).toUpperCase();
    if (normalized.startsWith("SEO_")) return "seo";
    if (normalized.startsWith("VISUAL_") || normalized.startsWith("BTN_")) return "ux";
    if (["HTTP_", "NET_", "JS_", "ROUTE_"].some((prefix) => normalized.startsWith(prefix))) return "runtime";
    return "operational";
  }

  function familyRiskCategory(family) {
    switch (family) {
      case "seo":
        return "SEO regression risk";
      case "ux":
        return "UX regression risk";
      case "runtime":
        return "Runtime stability risk";
      default:
        return "Operational recurrence risk";
    }
  }

  function riskLevelFromScore(score) {
    if (score >= 0.85) return "critical";
    if (score >= 0.65) return "high";
    if (score >= 0.45) return "medium";
    return "low";
  }

  function directionSymbol(direction) {
    if (direction === "improving") return "▲";
    if (direction === "degrading") return "▼";
    if (direction === "oscillating") return "~";
    return "=";
  }

  function createEmptyPredictiveSnapshot() {
    return {
      updatedAt: "",
      contextKey: "",
      historyDepth: 0,
      summary: {
        degradingIssues: 0,
        improvingIssues: 0,
        oscillatingIssues: 0,
        stableIssues: 0,
        highRiskAlerts: 0,
        mediumRiskAlerts: 0,
        recurringPatterns: 0,
      },
      trendOverview: {
        seo: {
          direction: "stable",
          strength: 0,
          confidence: 0,
          text: "SEO = stable",
        },
        runtime: {
          direction: "stable",
          strength: 0,
          confidence: 0,
          text: "Runtime = stable",
        },
        ux: {
          direction: "stable",
          strength: 0,
          confidence: 0,
          text: "UX = stable",
        },
      },
      alerts: [],
      systemicPatterns: [],
      issueSignals: {},
      topPredictiveRisks: [],
    };
  }

  function createSitePulsePredictiveIntelligenceService(options) {
    const getHistory = typeof options?.getHistory === "function" ? options.getHistory : () => [];
    const getComparableSeriesOverride = typeof options?.getComparableSeries === "function" ? options.getComparableSeries : null;
    const getReferenceSnapshot = typeof options?.getReferenceSnapshot === "function" ? options.getReferenceSnapshot : () => null;
    const issueSignature = typeof options?.issueSignature === "function"
      ? options.issueSignature
      : (issue) => `${normalizeText(issue?.code)}|${normalizeText(issue?.route || "/")}|${normalizeText(issue?.action)}|${normalizeText(issue?.viewportLabel)}`;
    const severityRank = typeof options?.severityRank === "function"
      ? options.severityRank
      : (severity) => (normalizeText(severity) === "high" ? 3 : normalizeText(severity) === "medium" ? 2 : 1);

    function isComparableReport(currentReport, candidateReport) {
      if (!currentReport || !candidateReport) return false;
      if (normalizeText(currentReport.meta?.baseUrl) !== normalizeText(candidateReport.meta?.baseUrl)) return false;
      if (normalizeText(currentReport.meta?.auditMode || "desktop") !== normalizeText(candidateReport.meta?.auditMode || "desktop")) return false;
      const currentScope = normalizeText(currentReport.summary?.auditScope);
      const candidateScope = normalizeText(candidateReport.summary?.auditScope);
      if (currentScope && candidateScope && currentScope !== candidateScope) return false;
      const currentSweep = normalizeText(currentReport.meta?.mobileSweep?.id);
      const candidateSweep = normalizeText(candidateReport.meta?.mobileSweep?.id);
      if (currentSweep && candidateSweep && currentSweep !== candidateSweep) return false;
      return true;
    }

    function getComparableSeries(report) {
      if (!report) return [];
      if (typeof getComparableSeriesOverride === "function") {
        const providedSeries = getComparableSeriesOverride(report);
        if (Array.isArray(providedSeries) && providedSeries.length) {
          return providedSeries;
        }
      }
      const reference = getReferenceSnapshot(report);
      const snapshots = getHistory()
        .filter((entry) => entry?.report && isComparableReport(report, entry.report))
        .map((entry) => ({
          stamp: String(entry.stamp || entry.report?.meta?.generatedAt || ""),
          report: entry.report,
        }));
      if (reference?.snapshot?.report && isComparableReport(report, reference.snapshot.report)) {
        snapshots.push({
          stamp: String(reference.snapshot.stamp || reference.snapshot.report?.meta?.generatedAt || ""),
          report: reference.snapshot.report,
        });
      }
      snapshots.push({
        stamp: String(report.meta?.generatedAt || ""),
        report,
      });
      return unique(snapshots
        .filter((entry) => entry.report)
        .map((entry) => `${entry.stamp}::${normalizeText(entry.report.meta?.baseUrl)}`))
        .map((key) => snapshots.find((entry) => `${entry.stamp}::${normalizeText(entry.report.meta?.baseUrl)}` === key))
        .filter(Boolean)
        .sort((left, right) => safeDateValue(left.stamp) - safeDateValue(right.stamp))
        .slice(-8);
    }

    function deriveSeriesDirection(values, threshold = 1) {
      const numeric = values.map((value) => toNumber(value, Number.NaN)).filter((value) => Number.isFinite(value));
      if (numeric.length < 2) {
        return { direction: "stable", strength: 0, confidence: numeric.length ? 0.35 : 0 };
      }
      const deltas = [];
      for (let index = 1; index < numeric.length; index += 1) {
        deltas.push(numeric[index] - numeric[index - 1]);
      }
      const positive = deltas.filter((value) => value > threshold).length;
      const negative = deltas.filter((value) => value < -threshold).length;
      const neutral = deltas.length - positive - negative;
      const maxSpan = Math.max(...numeric) - Math.min(...numeric);
      const normalizedMagnitude = clamp(maxSpan / Math.max(1, Math.abs(numeric[0]) + 2), 0, 1);
      const confidence = clamp(0.35 + (numeric.length * 0.1), 0, 0.95);
      if (positive && negative) {
        return {
          direction: "oscillating",
          strength: clamp(0.45 + normalizedMagnitude * 0.4 + (Math.min(positive, negative) * 0.08), 0, 1),
          confidence,
        };
      }
      if (positive > 0 && neutral <= positive) {
        return {
          direction: "degrading",
          strength: clamp(0.4 + normalizedMagnitude * 0.45 + (positive * 0.05), 0, 1),
          confidence,
        };
      }
      if (negative > 0 && neutral <= negative) {
        return {
          direction: "improving",
          strength: clamp(0.35 + normalizedMagnitude * 0.45 + (negative * 0.05), 0, 1),
          confidence,
        };
      }
      return {
        direction: "stable",
        strength: clamp(0.2 + normalizedMagnitude * 0.2, 0, 1),
        confidence,
      };
    }

    function buildTrendOverview(series) {
      const families = {
        seo: [],
        runtime: [],
        ux: [],
      };
      series.forEach((entry) => {
        const counts = {
          seo: 0,
          runtime: 0,
          ux: 0,
        };
        (entry.report?.issues || []).forEach((issue) => {
          const family = issueFamily(issue.code);
          if (family in counts) counts[family] += 1;
        });
        families.seo.push(counts.seo);
        families.runtime.push(counts.runtime);
        families.ux.push(counts.ux);
      });

      function buildFamilyTrend(label, values) {
        const signal = deriveSeriesDirection(values, 1);
        const firstValue = values[0] || 0;
        const lastValue = values[values.length - 1] || 0;
        return {
          direction: signal.direction,
          strength: signal.strength,
          confidence: signal.confidence,
          text: `${label} ${directionSymbol(signal.direction)} ${signal.direction} (${firstValue} -> ${lastValue} across ${values.length} run(s))`,
        };
      }

      return {
        seo: buildFamilyTrend("SEO", families.seo),
        runtime: buildFamilyTrend("Runtime", families.runtime),
        ux: buildFamilyTrend("UX", families.ux),
      };
    }

    function buildCodePatternMap(series) {
      const patterns = new Map();
      series.forEach((entry, index) => {
        const grouped = new Map();
        (entry.report?.issues || []).forEach((issue) => {
          const code = normalizeText(issue.code).toUpperCase();
          if (!code) return;
          if (!grouped.has(code)) {
            grouped.set(code, {
              code,
              issues: [],
            });
          }
          grouped.get(code).issues.push(issue);
        });

        grouped.forEach((bucket, code) => {
          if (!patterns.has(code)) {
            patterns.set(code, []);
          }
          const routes = unique(bucket.issues.map((issue) => normalizeText(issue.route || "/")));
          const severities = bucket.issues.map((issue) => severityRank(issue.severity));
          const impacts = bucket.issues.map((issue) => toNumber(issue.impact?.impactScore, 0));
          patterns.get(code).push({
            runIndex: index,
            stamp: entry.stamp,
            present: true,
            routeCount: routes.length,
            issueCount: bucket.issues.length,
            maxSeverity: Math.max(...severities),
            avgImpact: average(impacts),
          });
        });
      });

      return patterns;
    }

    function buildIssueSignal(issue, series, codePatternPoints) {
      const signature = issueSignature(issue);
      const presenceSeries = series.map((entry) => {
        const exact = (entry.report?.issues || []).find((candidate) => issueSignature(candidate) === signature) || null;
        const byCode = (entry.report?.issues || []).filter((candidate) => normalizeText(candidate.code).toUpperCase() === normalizeText(issue.code).toUpperCase());
        return {
          stamp: entry.stamp,
          issue: exact,
          present: Boolean(exact),
          codePresent: byCode.length > 0,
          routeCount: unique(byCode.map((candidate) => normalizeText(candidate.route || "/"))).length,
          maxSeverity: byCode.length ? Math.max(...byCode.map((candidate) => severityRank(candidate.severity))) : 0,
          avgImpact: byCode.length ? average(byCode.map((candidate) => toNumber(candidate.impact?.impactScore, 0))) : 0,
        };
      });

      const runsObserved = presenceSeries.length;
      const recurringCount = presenceSeries.filter((entry) => entry.present).length;
      const codeRecurringCount = presenceSeries.filter((entry) => entry.codePresent).length;
      const transitions = presenceSeries.reduce((count, entry, index, values) => {
        if (index === 0) return count;
        return count + (entry.codePresent !== values[index - 1].codePresent ? 1 : 0);
      }, 0);
      const reappeared = presenceSeries.map((entry) => (entry.codePresent ? "1" : "0")).join("").includes("101");
      const previousComparable = [...presenceSeries].reverse().find((entry, index) => index > 0 && entry.codePresent);
      const currentComparable = presenceSeries[presenceSeries.length - 1];
      const severityDelta = previousComparable ? currentComparable.maxSeverity - previousComparable.maxSeverity : 0;
      const routeSpreadDelta = previousComparable ? currentComparable.routeCount - previousComparable.routeCount : 0;
      const impactDelta = previousComparable ? currentComparable.avgImpact - previousComparable.avgImpact : 0;

      let trendDirection = "stable";
      if (reappeared || transitions >= 2) {
        trendDirection = "oscillating";
      } else if (severityDelta > 0 || routeSpreadDelta > 0 || impactDelta >= 0.12) {
        trendDirection = "degrading";
      } else if (severityDelta < 0 || routeSpreadDelta < 0 || impactDelta <= -0.12) {
        trendDirection = "improving";
      }

      const baseConfidence = clamp(0.3 + runsObserved * 0.08 + codeRecurringCount * 0.05, 0, 0.96);
      const trendStrength = clamp(
        (trendDirection === "stable" ? 0.2 : 0.4)
        + Math.max(0, recurringCount - 1) * 0.08
        + Math.max(0, routeSpreadDelta) * 0.08
        + Math.max(0, severityDelta) * 0.1
        + (reappeared ? 0.15 : 0),
        0,
        1,
      );

      const failedCount = toNumber(issue.learningCounts?.failed, 0);
      const validatedCount = toNumber(issue.learningCounts?.validated, 0);
      const predictiveRiskScore = clamp(
        toNumber(issue.impact?.impactScore, 0) * 0.5
        + trendStrength * 0.22
        + Math.min(0.2, codeRecurringCount * 0.05)
        + (reappeared ? 0.08 : 0)
        + Math.max(0, routeSpreadDelta) * 0.05
        + (failedCount > validatedCount ? 0.06 : 0),
        0,
        1,
      );
      const riskCategory = familyRiskCategory(issueFamily(issue.code));
      const evidence = [];
      if (codeRecurringCount >= 2) {
        evidence.push(`Seen in ${codeRecurringCount} of the last ${runsObserved} comparable run(s).`);
      }
      if (reappeared) {
        evidence.push("The issue family disappeared and then returned in a later run.");
      }
      if (severityDelta > 0) {
        evidence.push(`Severity increased from ${severityLabel(previousComparable?.maxSeverity || 1)} to ${severityLabel(currentComparable.maxSeverity)}.`);
      } else if (severityDelta < 0) {
        evidence.push(`Severity reduced from ${severityLabel(previousComparable?.maxSeverity || 1)} to ${severityLabel(currentComparable.maxSeverity)}.`);
      }
      if (routeSpreadDelta > 0) {
        evidence.push(`Affected route count increased from ${previousComparable?.routeCount || 0} to ${currentComparable.routeCount}.`);
      }
      if (routeSpreadDelta < 0) {
        evidence.push(`Affected route count dropped from ${previousComparable?.routeCount || 0} to ${currentComparable.routeCount}.`);
      }
      if (!evidence.length) {
        evidence.push("No strong directional change was observed in the comparable run history.");
      }

      const patternPoints = Array.isArray(codePatternPoints) ? codePatternPoints : [];
      const maxPatternRoutes = patternPoints.length ? Math.max(...patternPoints.map((point) => point.routeCount)) : currentComparable.routeCount;

      return {
        signature,
        issueCode: normalizeText(issue.code).toUpperCase(),
        route: normalizeText(issue.route || "/"),
        action: normalizeText(issue.action),
        trendDirection,
        trendStrength: Number(trendStrength.toFixed(2)),
        trendConfidence: Number(baseConfidence.toFixed(2)),
        riskLevel: riskLevelFromScore(predictiveRiskScore),
        riskCategory,
        riskConfidence: Number(clamp((baseConfidence + trendStrength) / 2, 0, 1).toFixed(2)),
        recurringCount: codeRecurringCount,
        runsObserved,
        reappeared,
        affectedRouteCount: currentComparable.routeCount,
        maxAffectedRouteCount: maxPatternRoutes,
        evidence,
      };
    }

    function buildSystemicPatterns(series, codePatternMap) {
      const patterns = [];
      codePatternMap.forEach((points, code) => {
        const routeSeries = series.map((entry, index) => {
          const match = points.find((point) => point.runIndex === index);
          return match ? match.routeCount : 0;
        });
        const issueSeries = series.map((entry, index) => {
          const match = points.find((point) => point.runIndex === index);
          return match ? match.issueCount : 0;
        });
        const direction = deriveSeriesDirection(routeSeries, 0);
        const runsSeen = points.length;
        const reappeared = routeSeries.map((value) => (value > 0 ? "1" : "0")).join("").includes("101");
        const riskScore = clamp(
          0.3
          + Math.min(0.3, runsSeen * 0.08)
          + direction.strength * 0.2
          + (reappeared ? 0.1 : 0)
          + Math.min(0.2, Math.max(...routeSeries) * 0.08),
          0,
          1,
        );
        if (runsSeen < 2 && Math.max(...routeSeries) < 2) return;
        const family = issueFamily(code);
        const label = Math.max(...routeSeries) > 1
          ? `${code} is affecting more pages across ${runsSeen} comparable run(s).`
          : reappeared
          ? `${code} reappears after previously disappearing from the run history.`
          : `${code} keeps recurring across ${runsSeen} comparable run(s).`;
        patterns.push({
          id: `predictive-${code}`,
          type: "predictive_pattern",
          code,
          label,
          count: runsSeen,
          direction: direction.direction,
          trendStrength: Number(direction.strength.toFixed(2)),
          trendConfidence: Number(direction.confidence.toFixed(2)),
          riskLevel: riskLevelFromScore(riskScore),
          riskCategory: familyRiskCategory(family),
          riskConfidence: Number(clamp((direction.confidence + direction.strength) / 2, 0, 1).toFixed(2)),
          evidence: [
            `Seen in ${runsSeen} of the last ${series.length} comparable run(s).`,
            `Affected routes per run: ${routeSeries.join(" -> ")}.`,
            `Issue count per run: ${issueSeries.join(" -> ")}.`,
          ],
        });
      });

      const familySeries = ["seo", "runtime", "ux"].map((family) => {
        const values = series.map((entry) => (entry.report?.issues || []).filter((issue) => issueFamily(issue.code) === family).length);
        const direction = deriveSeriesDirection(values, 1);
        return {
          family,
          values,
          direction,
        };
      });

      familySeries.forEach((entry) => {
        if (entry.values.filter((value) => value > 0).length < 2) return;
        if (!["degrading", "oscillating"].includes(entry.direction.direction)) return;
        patterns.push({
          id: `predictive-family-${entry.family}`,
          type: "predictive_family",
          code: entry.family.toUpperCase(),
          label: `${entry.family.toUpperCase()} signals are ${entry.direction.direction} across recent runs.`,
          count: entry.values.length,
          direction: entry.direction.direction,
          trendStrength: Number(entry.direction.strength.toFixed(2)),
          trendConfidence: Number(entry.direction.confidence.toFixed(2)),
          riskLevel: riskLevelFromScore(clamp(0.35 + entry.direction.strength * 0.4, 0, 1)),
          riskCategory: familyRiskCategory(entry.family),
          riskConfidence: Number(clamp((entry.direction.confidence + entry.direction.strength) / 2, 0, 1).toFixed(2)),
          evidence: [`Issue counts per run: ${entry.values.join(" -> ")}.`],
        });
      });

      return patterns
        .sort((left, right) => right.riskConfidence - left.riskConfidence || right.count - left.count)
        .slice(0, 8);
    }

    function buildPredictiveAlerts(issueSignals, systemicPatterns) {
      const alerts = [];
      Object.values(issueSignals)
        .filter((signal) => ["degrading", "oscillating"].includes(signal.trendDirection) || ["high", "critical"].includes(signal.riskLevel))
        .sort((left, right) => right.riskConfidence - left.riskConfidence || right.trendStrength - left.trendStrength)
        .slice(0, 5)
        .forEach((signal) => {
          const familyLabel = signal.riskCategory || "Operational regression risk";
          const verb = signal.trendDirection === "oscillating" ? "keeps reappearing" : "is degrading";
          alerts.push({
            id: `alert-${signal.signature}`,
            label: `Potential ${familyLabel.toLowerCase()} detected: ${signal.issueCode} ${verb}.`,
            issueCode: signal.issueCode,
            riskLevel: signal.riskLevel,
            riskCategory: signal.riskCategory,
            riskConfidence: signal.riskConfidence,
            evidence: signal.evidence.slice(0, 3),
          });
        });

      systemicPatterns
        .filter((pattern) => ["high", "critical"].includes(pattern.riskLevel))
        .slice(0, 3)
        .forEach((pattern) => {
          alerts.push({
            id: `alert-pattern-${pattern.id}`,
            label: pattern.label,
            issueCode: pattern.code,
            riskLevel: pattern.riskLevel,
            riskCategory: pattern.riskCategory,
            riskConfidence: pattern.riskConfidence,
            evidence: pattern.evidence.slice(0, 2),
          });
        });

      return alerts.slice(0, 6);
    }

    function buildPredictiveIntelligence(report) {
      if (!report) return createEmptyPredictiveSnapshot();
      const series = getComparableSeries(report);
      const snapshot = createEmptyPredictiveSnapshot();
      snapshot.updatedAt = String(report.meta?.generatedAt || "");
      snapshot.contextKey = [normalizeText(report.meta?.baseUrl), normalizeText(report.meta?.auditMode || "desktop"), normalizeText(report.summary?.auditScope || "")].join("::");
      snapshot.historyDepth = Math.max(0, series.length - 1);
      if (series.length < 2) {
        return snapshot;
      }

      const codePatternMap = buildCodePatternMap(series);
      const issueSignals = {};
      (report.issues || []).forEach((issue) => {
        const code = normalizeText(issue.code).toUpperCase();
        issueSignals[issueSignature(issue)] = buildIssueSignal(issue, series, codePatternMap.get(code));
      });

      const systemicPatterns = buildSystemicPatterns(series, codePatternMap);
      const alerts = buildPredictiveAlerts(issueSignals, systemicPatterns);
      const trendOverview = buildTrendOverview(series);
      const signals = Object.values(issueSignals);

      snapshot.summary = {
        degradingIssues: signals.filter((signal) => signal.trendDirection === "degrading").length,
        improvingIssues: signals.filter((signal) => signal.trendDirection === "improving").length,
        oscillatingIssues: signals.filter((signal) => signal.trendDirection === "oscillating").length,
        stableIssues: signals.filter((signal) => signal.trendDirection === "stable").length,
        highRiskAlerts: alerts.filter((alert) => ["high", "critical"].includes(alert.riskLevel)).length,
        mediumRiskAlerts: alerts.filter((alert) => alert.riskLevel === "medium").length,
        recurringPatterns: systemicPatterns.length,
      };
      snapshot.trendOverview = trendOverview;
      snapshot.alerts = alerts;
      snapshot.systemicPatterns = systemicPatterns;
      snapshot.issueSignals = issueSignals;
      snapshot.topPredictiveRisks = signals
        .sort((left, right) => right.riskConfidence - left.riskConfidence || right.trendStrength - left.trendStrength)
        .slice(0, 6);
      return snapshot;
    }

    return {
      createEmptyPredictiveSnapshot,
      buildPredictiveIntelligence,
    };
  }

  globalScope.createSitePulsePredictiveIntelligenceService = createSitePulsePredictiveIntelligenceService;
})(window);
