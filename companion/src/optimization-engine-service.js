(function attachSitePulseOptimizationEngine(globalScope) {
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

  function unique(values) {
    return [...new Set(values.filter(Boolean))];
  }

  function issueFamily(issueCode) {
    const code = normalizeText(issueCode).toUpperCase();
    if (code.startsWith("SEO_")) return "seo";
    if (code.startsWith("VISUAL_") || code.startsWith("BTN_")) return "ux";
    if (code.startsWith("ROUTE_LOAD_FAIL") || code.startsWith("HTTP_") || code.startsWith("NET_")) return "performance";
    if (code.startsWith("JS_") || code.startsWith("CONSOLE_") || code.startsWith("ROUTE_")) return "technical";
    return "technical";
  }

  function clusterConfig(issue) {
    const code = normalizeText(issue?.issueCode).toUpperCase();
    const family = issueFamily(code);
    if (["SEO_CANONICAL_MISSING", "SEO_LANG_MISSING", "SEO_META_DESCRIPTION_LENGTH"].includes(code)
      || code.includes("CANONICAL")
      || code.includes("HREFLANG")
      || code.includes("LANG")
      || code.includes("META_DESCRIPTION")) {
      return {
        key: "seo_metadata_template",
        family: "seo",
        title: "SEO metadata cluster",
        opportunityType: "seo_opportunity",
        recommendation: "Multiple metadata issues detected across pages. Recommend fixing shared template metadata logic instead of patching routes one by one.",
      };
    }
    if (code.includes("STRUCTURED_DATA") || code.includes("SCHEMA")) {
      return {
        key: "seo_structured_data",
        family: "seo",
        title: "Structured data cluster",
        opportunityType: "seo_opportunity",
        recommendation: "Recurring structured data issues suggest centralizing schema generation in the shared page template or CMS mapping layer.",
      };
    }
    if (family === "ux" && (code.includes("VISUAL_") || code.includes("OVERFLOW") || code.includes("HIERARCHY") || code.includes("SPACING"))) {
      return {
        key: "ux_layout_system",
        family: "ux",
        title: "UX layout system cluster",
        opportunityType: "ux_improvement",
        recommendation: "Repeated layout density and collision issues suggest fixing shared spacing, card sizing and responsive layout rules in common components.",
      };
    }
    if (family === "ux" && code.includes("BTN_")) {
      return {
        key: "ux_interaction_contract",
        family: "ux",
        title: "UX interaction contract cluster",
        opportunityType: "ux_improvement",
        recommendation: "Repeated CTA and interaction issues indicate the shared action contract should be corrected once in the component or routing layer.",
      };
    }
    if (family === "performance") {
      return {
        key: "performance_delivery_pipeline",
        family: "performance",
        title: "Performance delivery cluster",
        opportunityType: "performance_gain",
        recommendation: "Route loading and delivery issues are recurring. Recommend hardening shared route-loading, caching and deployment pipeline logic.",
      };
    }
    if (family === "technical") {
      return {
        key: "technical_runtime_stability",
        family: "technical",
        title: "Technical runtime cluster",
        opportunityType: "performance_gain",
        recommendation: "Runtime and console issues across routes suggest a shared bootstrap or integration problem worth fixing structurally.",
      };
    }
    return {
      key: `${family}_general_cluster`,
      family,
      title: `${family.toUpperCase()} structural cluster`,
      opportunityType: family === "seo" ? "seo_opportunity" : family === "ux" ? "ux_improvement" : "performance_gain",
      recommendation: "Multiple related issues were detected. Recommend addressing the shared structural source before local patches.",
    };
  }

  function priorityWeight(priorityLevel) {
    switch (normalizeText(priorityLevel).toUpperCase()) {
      case "P0":
        return 1;
      case "P1":
        return 0.82;
      case "P2":
        return 0.62;
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
        return 0.58;
      case "low":
        return 0.3;
      default:
        return 0.15;
    }
  }

  function createEmptyOptimizationSnapshot() {
    return {
      updatedAt: "",
      contextKey: "",
      summary: {
        seoOpportunities: 0,
        uxImprovements: 0,
        performanceGains: 0,
        structuralRecommendations: 0,
      },
      clusters: [],
      topImprovements: [],
      structuralRecommendations: [],
      opportunityGroups: {
        seo: [],
        ux: [],
        performance: [],
      },
    };
  }

  function createSitePulseOptimizationEngineService() {
    function buildClusters(issueState) {
      const grouped = new Map();
      (Array.isArray(issueState) ? issueState : []).forEach((issue) => {
        const config = clusterConfig(issue);
        const current = grouped.get(config.key) || {
          key: config.key,
          title: config.title,
          family: config.family,
          opportunityType: config.opportunityType,
          recommendation: config.recommendation,
          issues: [],
        };
        current.issues.push(issue);
        grouped.set(config.key, current);
      });

      return [...grouped.values()]
        .map((cluster) => {
          const routesAffected = unique(cluster.issues.map((issue) => normalizeText(issue.route || "/")));
          const issueCodes = unique(cluster.issues.map((issue) => normalizeText(issue.issueCode).toUpperCase()));
          const averageImpact = cluster.issues.length
            ? cluster.issues.reduce((sum, issue) => sum + toNumber(issue.impact?.score, 0), 0) / cluster.issues.length
            : 0;
          const averagePredictive = cluster.issues.length
            ? cluster.issues.reduce((sum, issue) => sum + (toNumber(issue.predictiveRisk?.confidence, 0) * riskWeight(issue.predictiveRisk?.level)), 0) / cluster.issues.length
            : 0;
          const averageHealing = cluster.issues.length
            ? cluster.issues.reduce((sum, issue) => sum + clamp(toNumber(issue.healing?.confidenceScore, 0) / 100, 0, 1), 0) / cluster.issues.length
            : 0;
          const topPriorityWeight = cluster.issues.reduce((best, issue) => Math.max(best, priorityWeight(issue.impact?.priority)), 0);
          const breadth = clamp(routesAffected.length / 5, 0, 1);
          const compositeScore = clamp(
            averageImpact * 0.36
            + averagePredictive * 0.22
            + averageHealing * 0.14
            + topPriorityWeight * 0.18
            + breadth * 0.1,
            0,
            1,
          );
          const confidence = clamp(
            averagePredictive * 0.45
            + averageHealing * 0.2
            + Math.min(cluster.issues.length / 4, 1) * 0.2
            + Math.min(routesAffected.length / 3, 1) * 0.15,
            0,
            1,
          );
          const recommendation = routesAffected.length > 1
            ? `${cluster.recommendation} Affected routes: ${routesAffected.length}.`
            : cluster.recommendation;
          return {
            key: cluster.key,
            title: cluster.title,
            family: cluster.family,
            opportunityType: cluster.opportunityType,
            issueCount: cluster.issues.length,
            routesAffected: routesAffected.length,
            routeList: routesAffected.slice(0, 5),
            issueCodes: issueCodes.slice(0, 6),
            averageImpact: Number(averageImpact.toFixed(2)),
            predictiveScore: Number(averagePredictive.toFixed(2)),
            healingConfidence: Number((averageHealing * 100).toFixed(0)),
            topPriorityWeight: Number(topPriorityWeight.toFixed(2)),
            confidence: Number(confidence.toFixed(2)),
            compositeScore: Number(compositeScore.toFixed(2)),
            recommendation,
            structural: cluster.issues.length > 1 || routesAffected.length > 1,
          };
        })
        .sort((left, right) => right.compositeScore - left.compositeScore);
    }

    function buildOptimizationSnapshot(report, contextInput = {}) {
      if (!report) {
        return createEmptyOptimizationSnapshot();
      }

      const dataIntelligence = contextInput.dataIntelligence && typeof contextInput.dataIntelligence === "object"
        ? contextInput.dataIntelligence
        : null;
      const issueState = Array.isArray(dataIntelligence?.ISSUE_STATE) ? dataIntelligence.ISSUE_STATE : [];
      const clusters = buildClusters(issueState);
      const topImprovements = clusters.slice(0, 5).map((cluster, index) => ({
        rank: index + 1,
        title: cluster.title,
        family: cluster.family,
        recommendation: cluster.recommendation,
        compositeScore: cluster.compositeScore,
        confidence: cluster.confidence,
        issueCount: cluster.issueCount,
        routesAffected: cluster.routesAffected,
        issueCodes: cluster.issueCodes,
      }));
      const structuralRecommendations = clusters
        .filter((cluster) => cluster.structural)
        .slice(0, 5)
        .map((cluster) => `${cluster.title}: ${cluster.recommendation}`);
      const opportunityGroups = {
        seo: clusters.filter((cluster) => cluster.family === "seo").slice(0, 4),
        ux: clusters.filter((cluster) => cluster.family === "ux").slice(0, 4),
        performance: clusters.filter((cluster) => ["performance", "technical"].includes(cluster.family)).slice(0, 4),
      };

      return {
        updatedAt: normalizeText(report?.meta?.generatedAt),
        contextKey: `${normalizeText(report?.meta?.baseUrl)}|${normalizeText(report?.meta?.generatedAt)}`,
        summary: {
          seoOpportunities: opportunityGroups.seo.length,
          uxImprovements: opportunityGroups.ux.length,
          performanceGains: opportunityGroups.performance.length,
          structuralRecommendations: structuralRecommendations.length,
        },
        clusters,
        topImprovements,
        structuralRecommendations,
        opportunityGroups,
      };
    }

    return {
      createEmptyOptimizationSnapshot,
      buildOptimizationSnapshot,
    };
  }

  globalScope.createSitePulseOptimizationEngineService = createSitePulseOptimizationEngineService;
})(window);
