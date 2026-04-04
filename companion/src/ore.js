/**
 * Operator Response Engine (ORE)
 * Substitui completamente o conteúdo de #workspaceShell por um painel premium
 * conectado aos dados reais do motor (data-shell).
 *
 * Sem inventar: só renderiza o que o renderer.js já espelha no DOM.
 */
(function () {
  "use strict";

  const ORE_CONFIG = {
    refreshIntervalMs: 1800,
    defaultPattern: "root-cause", // Root Cause primeiro
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getShell(key) {
    const el = document.querySelector(`[data-shell="${key}"]`);
    return el ? String(el.textContent || "").trim() : "";
  }

  function getShellInt(key) {
    const raw = getShell(key);
    const m = raw.match(/-?\d+/);
    return m ? Number(m[0]) : 0;
  }

  function getShellSafeNonDash(key) {
    const v = getShell(key);
    if (!v) return "—";
    return v;
  }

  function getQualityBarProgress() {
    const el = document.querySelector('[data-shell="qualityBar"]');
    if (!el || !(el instanceof HTMLElement)) return 0;
    const styleWidth = el.style && el.style.width ? String(el.style.width) : "";
    const m = styleWidth.match(/(\d+(\.\d+)?)%/);
    return m ? Number(m[1]) / 100 : 0;
  }

  function inferRuntimeState(engineChipRaw) {
    const engineChip = String(engineChipRaw || "").toLowerCase();
    if (!engineChip) return "awaiting";
    if (engineChip.includes("offline")) return "offline";
    if (engineChip.includes("ready") || engineChip.includes("engine ready")) return "processing";
    return "active";
  }

  function qualityColor(confidence) {
    if (confidence >= 90) return "#22C55E";
    if (confidence >= 70) return "#5B8CFF";
    if (confidence >= 50) return "#F59E0B";
    return "#EF4444";
  }

  function runtimeColors(runtime, onlineProbable) {
    if (onlineProbable) return { dot: "#22C55E", text: "ONLINE PROBABLE" };
    if (runtime === "active") return { dot: "#00F0FF", text: "MOTOR ACTIVE" };
    if (runtime === "processing") return { dot: "#F59E0B", text: "PROCESSING" };
    if (runtime === "offline") return { dot: "#8B95A5", text: "OFFLINE" };
    return { dot: "#22C55E", text: "ONLINE PROBABLE" };
  }

  const PATTERNS = [
    { id: "strategic-triage", label: "SEO Priority Brief", short: "SEO", color: "#5B8CFF" },
    { id: "root-cause", label: "Issue Explanation", short: "WHY", color: "#A855F7" },
    { id: "visual-evidence", label: "Screenshot Package", short: "PROOF", color: "#5CC8FF" },
    { id: "execution-protocol", label: "Fix Plan", short: "HEAL", color: "#22C55E" },
    { id: "delta-intelligence", label: "Comparison Report", short: "DELTA", color: "#F59E0B" },
  ];

  function readMotorSnapshot() {
    const engineChip = getShellSafeNonDash("engineChip");
    const runtimeState = inferRuntimeState(engineChip);
    const confidence = getShellInt("qualityScore");
    const progress = getQualityBarProgress();

    // Base identity
    const target = getShellSafeNonDash("target");
    const runBadge = getShellSafeNonDash("runBadge");
    const modeChip = getShellSafeNonDash("modeChip");

    // Impact bands
    const p0Count = getShellInt("p0Count");
    const p1Count = getShellInt("p1Count");
    const p2Count = getShellInt("p2Count");

    // Predictive intelligence
    const predictiveHighRiskAlerts = getShellInt("predictiveHighRiskAlerts");
    const predictiveMediumRiskAlerts = getShellInt("predictiveMediumRiskAlerts");
    const predictiveRecurringPatterns = getShellInt("predictiveRecurringPatterns");
    const predictiveDegradingIssues = getShellInt("predictiveDegradingIssues");
    const predictiveImprovingIssues = getShellInt("predictiveImprovingIssues");

    // Self-healing
    const healingEligibleCount = getShellInt("healingEligibleCount");
    const healingPendingCount = getShellInt("healingPending");
    const healingReadyCount = getShellInt("healingReadyCount");
    const healingCount = getShellInt("healingCount");

    // Evidence & compare
    const evidenceCount = getShellInt("evidenceCount");
    const refLabel = getShellSafeNonDash("stickyRef");
    const deltaIssues = getShellSafeNonDash("stickyDeltaIssues");
    const deltaSeo = getShellSafeNonDash("stickyDeltaSeo");
    const deltaRisk = getShellSafeNonDash("stickyDeltaRisk");
    const deltaRoutesActions = getShellSafeNonDash("stickyCompareRoutesActions");

    // Root Cause diagnosis: focus issue
    const focusIssueCode = getShellSafeNonDash("focusIssueCode");
    const focusIssueRoute = getShellSafeNonDash("focusIssueRoute");
    const focusIssueAction = getShellSafeNonDash("focusIssueAction");
    const focusIssueSeverity = getShellSafeNonDash("focusIssueSeverity");
    const focusIssueDiagnosisTitle = getShellSafeNonDash("focusIssueDiagnosisTitle");
    const focusIssueLaymanExplanation = getShellSafeNonDash("focusIssueLaymanExplanation");
    const focusIssueTechnicalExplanation = getShellSafeNonDash("focusIssueTechnicalExplanation");
    const focusIssueProbableCauses = getShellSafeNonDash("focusIssueProbableCauses");
    const focusIssueTechnicalChecks = getShellSafeNonDash("focusIssueTechnicalChecks");
    const focusIssueRecommendedActions = getShellSafeNonDash("focusIssueRecommendedActions");
    const focusIssueCommandHints = getShellSafeNonDash("focusIssueCommandHints");
    const focusIssueLikelyAreas = getShellSafeNonDash("focusIssueLikelyAreas");
    const focusIssueRecommendedResolution = getShellSafeNonDash("focusIssueRecommendedResolution");
    const focusIssueEvidenceCount = getShellInt("focusIssueEvidenceCount");

    const memoryEntries = getShellInt("memoryEntries");
    const qualityTrajectory = getShellSafeNonDash("qualityTrajectory");

    return {
      runtimeState,
      confidence,
      progress,
      target,
      runBadge,
      modeChip,
      p0Count,
      p1Count,
      p2Count,
      predictiveHighRiskAlerts,
      predictiveMediumRiskAlerts,
      predictiveRecurringPatterns,
      predictiveDegradingIssues,
      predictiveImprovingIssues,
      healingEligibleCount,
      healingPendingCount,
      healingReadyCount,
      healingCount,
      evidenceCount,
      refLabel,
      deltaIssues,
      deltaSeo,
      deltaRisk,
      deltaRoutesActions,
      focusIssueCode,
      focusIssueRoute,
      focusIssueAction,
      focusIssueSeverity,
      focusIssueDiagnosisTitle,
      focusIssueLaymanExplanation,
      focusIssueTechnicalExplanation,
      focusIssueProbableCauses,
      focusIssueTechnicalChecks,
      focusIssueRecommendedActions,
      focusIssueCommandHints,
      focusIssueLikelyAreas,
      focusIssueRecommendedResolution,
      focusIssueEvidenceCount,

      memoryEntries,
      qualityTrajectory,
    };
  }

  function computeReadiness(motor) {
    const hasDiagnosis = motor.focusIssueLaymanExplanation !== "—" && String(motor.focusIssueLaymanExplanation).trim() !== "";
    const hasProbable = motor.focusIssueProbableCauses !== "—";
    const rootCauseReady = hasDiagnosis && (hasProbable || motor.focusIssueTechnicalExplanation !== "—");

    const issuesTotal = motor.p0Count + motor.p1Count + motor.p2Count;
    const seoReady = issuesTotal > 0 || motor.predictiveHighRiskAlerts > 0 || motor.predictiveMediumRiskAlerts > 0;

    const evidenceReady = motor.evidenceCount > 0 || motor.focusIssueEvidenceCount > 0;

    const executionReady = motor.healingEligibleCount > 0 || motor.healingReadyCount > 0 || motor.healingPendingCount > 0;

    const compareReady =
      motor.refLabel !== "—" &&
      motor.deltaIssues !== "—" &&
      motor.deltaSeo !== "—" &&
      motor.deltaRisk !== "—" &&
      motor.deltaIssues !== "0";

    return {
      rootCauseReady,
      seoReady,
      evidenceReady,
      executionReady,
      compareReady,
      issuesTotal,
    };
  }

  function parseLines(raw) {
    const s = String(raw || "").trim();
    if (!s || s === "—") return [];
    return s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function renderBulletList(raw) {
    const lines = parseLines(raw);
    if (!lines.length) return `<div class="ore-muted">—</div>`;
    return lines.map((x) => `<div class="ore-bullet">• ${escapeHtml(x)}</div>`).join("");
  }

  function renderCompactPill(label, value, accentColor, enabled) {
    const val = value == null ? "—" : String(value);
    if (!enabled) {
      return `<div class="ore-chip ore-chip--muted"><span class="ore-chip-label">${escapeHtml(label)}</span><span class="ore-chip-value">${escapeHtml(val)}</span></div>`;
    }
    return `<div class="ore-chip" style="border-color:${accentColor}33;background:${accentColor}10">
      <span class="ore-chip-label">${escapeHtml(label)}</span>
      <span class="ore-chip-value" style="color:${accentColor}">${escapeHtml(val)}</span>
    </div>`;
  }

  function renderRail(motor, readiness, activePattern) {
    const badgeText = (id) => {
      if (id === "strategic-triage") return String(readiness.issuesTotal);
      if (id === "root-cause") return motor.focusIssueEvidenceCount > 0 ? String(motor.focusIssueEvidenceCount) : readiness.rootCauseReady ? "1" : "—";
      if (id === "visual-evidence") return String(motor.evidenceCount);
      if (id === "execution-protocol") return motor.healingReadyCount > 0 ? String(motor.healingReadyCount) : String(motor.healingPendingCount);
      if (id === "delta-intelligence") return motor.refLabel !== "—" ? "Δ" : "—";
      return "—";
    };

    const readinessFor = (id) => {
      if (id === "strategic-triage") return readiness.seoReady;
      if (id === "root-cause") return readiness.rootCauseReady;
      if (id === "visual-evidence") return readiness.evidenceReady;
      if (id === "execution-protocol") return readiness.executionReady;
      if (id === "delta-intelligence") return readiness.compareReady;
      return false;
    };

    return `
      <aside class="ore-rail">
        <div class="ore-rail-title">Cognitive Delivery Modes</div>

        <div class="ore-rail-list">
          ${PATTERNS.map((p) => {
            const isActive = p.id === activePattern;
            const ok = readinessFor(p.id);
            const b = badgeText(p.id);
            return `
              <button
                type="button"
                class="ore-mode ${isActive ? "is-active" : ""} ${ok ? "is-ready" : "is-blocked"}"
                data-ore-pattern="${escapeHtml(p.id)}"
              >
                <span class="ore-mode-accent" style="background:${p.color}"></span>
                <span class="ore-mode-main">
                  <span class="ore-mode-label">${escapeHtml(p.label)}</span>
                  <span class="ore-mode-sub">
                    ${escapeHtml(p.short)}
                    <span class="ore-mode-sep">•</span>
                    <span class="ore-mode-state">${ok ? "ready" : "waiting"}</span>
                  </span>
                </span>
                <span class="ore-mode-badge" style="border-color:${p.color}33;background:${p.color}10;color:${p.color}">
                  ${escapeHtml(b)}
                </span>
              </button>
            `;
          }).join("")}
        </div>

        <div class="ore-rail-footer">
          <div class="ore-mini">
            <div class="ore-mini-label">Run</div>
            <div class="ore-mini-value">${escapeHtml(motor.runBadge || "—")}</div>
          </div>
          <div class="ore-mini">
            <div class="ore-mini-label">Mode</div>
            <div class="ore-mini-value">${escapeHtml(motor.modeChip || "—")}</div>
          </div>
        </div>
      </aside>
    `;
  }

  function renderHeader(motor, readiness, activePattern) {
    const hasLiveSignals =
      motor.confidence > 0
      || motor.p0Count + motor.p1Count + motor.p2Count > 0
      || motor.evidenceCount > 0
      || motor.healingEligibleCount > 0
      || motor.healingReadyCount > 0
      || motor.healingPendingCount > 0
      || motor.focusIssueEvidenceCount > 0;
    const onlineProbable = motor.runtimeState === "offline" && hasLiveSignals;
    const r = runtimeColors(motor.runtimeState, onlineProbable);
    const c = qualityColor(motor.confidence);
    const statePill =
      activePattern === "root-cause"
        ? "causal"
        : activePattern === "visual-evidence"
          ? "evidence"
          : activePattern === "execution-protocol"
            ? "healing"
            : activePattern === "delta-intelligence"
              ? "delta"
              : "triage";

    const pipeline = [
      { label: "Diagnosis", ok: readiness.rootCauseReady, color: "#A855F7" },
      { label: "Evidence", ok: readiness.evidenceReady, color: "#5CC8FF" },
      { label: "Healing", ok: readiness.executionReady, color: "#22C55E" },
      { label: "Delta", ok: readiness.compareReady, color: "#F59E0B" },
    ];

    const blocked = pipeline.find((x) => !x.ok);
    const blockedLabel = blocked ? blocked.label : "All signals coherent";

    return `
      <header class="ore-header" data-ore-scope="${escapeHtml(statePill)}">
        <div class="ore-header-left">
          <div class="ore-title">
            <span class="ore-title-dot" style="background:${PATTERNS.find((p) => p.id === activePattern)?.color || c}"></span>
            <span class="ore-title-text">Adaptive Intelligence Delivery System</span>
          </div>
          <div class="ore-subtitle">
            <span class="ore-mono">target</span>
            <span class="ore-sub-sep">→</span>
            <span class="ore-sub-value">${escapeHtml(motor.target || "—")}</span>
          </div>
        </div>

        <div class="ore-header-right">
          <div class="ore-header-chip ore-header-chip--runtime">
            <span class="ore-dot" style="background:${r.dot}; box-shadow: 0 0 14px ${r.dot}66"></span>
            <span class="ore-header-chip-label">${escapeHtml(r.text)}</span>
          </div>

          <div class="ore-header-chip ore-header-chip--quality" style="border-color:${c}33;background:${c}10">
            <span class="ore-mono">confidence</span>
            <span class="ore-header-chip-value" style="color:${c}">${escapeHtml(String(motor.confidence || 0))}%</span>
          </div>

          <div class="ore-header-chip ore-header-chip--blocked">
            <span class="ore-mono">pipeline</span>
            <span class="ore-header-chip-value">${escapeHtml(blockedLabel)}</span>
          </div>
        </div>
      </header>
    `;
  }

  function renderStage(motor, readiness, activePattern) {
    if (activePattern === "strategic-triage") return renderSeoBrief(motor, readiness);
    if (activePattern === "root-cause") return renderIssueExplanation(motor, readiness);
    if (activePattern === "visual-evidence") return renderScreenshotPackage(motor, readiness);
    if (activePattern === "execution-protocol") return renderFixPlan(motor, readiness);
    return renderComparisonReport(motor, readiness);
  }

  function renderSeoBrief(motor, readiness) {
    const total = readiness.issuesTotal;
    const p0 = motor.p0Count;
    const p1 = motor.p1Count;
    const p2 = motor.p2Count;

    const maxP = Math.max(1, p0 + p1 + p2);
    const p0w = Math.round((p0 / maxP) * 100);
    const p1w = Math.round((p1 / maxP) * 100);
    const p2w = Math.round((p2 / maxP) * 100);

    return `
      <section class="ore-stage">
        <div class="ore-stage-top">
          <div>
            <div class="ore-stage-eyebrow">SEO Priority Brief</div>
            <div class="ore-stage-title">Impact-first delivery</div>
          </div>
          <div class="ore-stage-top-right">
            ${renderCompactPill("P0", p0, "#EF4444", p0 > 0)}
            ${renderCompactPill("P1", p1, "#F59E0B", p1 > 0)}
            ${renderCompactPill("P2", p2, "#5B8CFF", p2 > 0)}
          </div>
        </div>

        <div class="ore-panels">
          <div class="ore-panel">
            <div class="ore-panel-title">Priority bands</div>
            <div class="ore-meter">
              <div class="ore-meter-row">
                <div class="ore-meter-label">P0</div>
                <div class="ore-meter-bar ore-meter-bar--p0">
                  <span style="width:${p0w}%;"></span>
                </div>
                <div class="ore-meter-value">${escapeHtml(String(p0))}</div>
              </div>
              <div class="ore-meter-row">
                <div class="ore-meter-label">P1</div>
                <div class="ore-meter-bar ore-meter-bar--p1">
                  <span style="width:${p1w}%;"></span>
                </div>
                <div class="ore-meter-value">${escapeHtml(String(p1))}</div>
              </div>
              <div class="ore-meter-row">
                <div class="ore-meter-label">P2</div>
                <div class="ore-meter-bar ore-meter-bar--p2">
                  <span style="width:${p2w}%;"></span>
                </div>
                <div class="ore-meter-value">${escapeHtml(String(p2))}</div>
              </div>
            </div>

            <div class="ore-panel-subtle">
              total issues: <span class="ore-strong">${escapeHtml(String(total))}</span>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Predictive intelligence</div>
            <div class="ore-predict-grid">
              <div class="ore-predict">
                <div class="ore-predict-k">highRiskAlerts</div>
                <div class="ore-predict-v ore-accent">${escapeHtml(String(motor.predictiveHighRiskAlerts))}</div>
              </div>
              <div class="ore-predict">
                <div class="ore-predict-k">mediumRiskAlerts</div>
                <div class="ore-predict-v">${escapeHtml(String(motor.predictiveMediumRiskAlerts))}</div>
              </div>
              <div class="ore-predict">
                <div class="ore-predict-k">recurringPatterns</div>
                <div class="ore-predict-v">${escapeHtml(String(motor.predictiveRecurringPatterns))}</div>
              </div>
              <div class="ore-predict">
                <div class="ore-predict-k">degradingIssues</div>
                <div class="ore-predict-v ore-warn">${escapeHtml(String(motor.predictiveDegradingIssues))}</div>
              </div>
              <div class="ore-predict">
                <div class="ore-predict-k">improvingIssues</div>
                <div class="ore-predict-v ore-ok">${escapeHtml(String(motor.predictiveImprovingIssues))}</div>
              </div>
            </div>
            <div class="ore-panel-subtle">
              drift + recurring signals make this briefing operational for prioritization.
            </div>
          </div>
        </div>

        <div class="ore-action-layer">
          <button
            type="button"
            class="ore-btn ore-btn--primary"
            data-ore-action="open-findings"
          >
            Open findings (by focus queue)
          </button>
          <button
            type="button"
            class="ore-btn ore-btn--ghost"
            data-ore-action="open-prompts"
            ${motor.healingReadyCount > 0 ? "" : "aria-disabled=\"true\""}
          >
            Open fix plan / healing queue
          </button>
        </div>
      </section>
    `;
  }

  function renderIssueExplanation(motor, readiness) {
    const hasDiag = readiness.rootCauseReady;

    const causes = motor.focusIssueProbableCauses;
    const checks = motor.focusIssueTechnicalChecks;
    const recActs = motor.focusIssueRecommendedActions;
    const likelyAreas = motor.focusIssueLikelyAreas;

    const evidenceCount = motor.focusIssueEvidenceCount > 0 ? motor.focusIssueEvidenceCount : motor.evidenceCount;

    return `
      <section class="ore-stage">
        <div class="ore-stage-top">
          <div>
            <div class="ore-stage-eyebrow">Issue Explanation</div>
            <div class="ore-stage-title">Why this issue exists</div>
          </div>
          <div class="ore-stage-top-right">
            ${renderCompactPill("evidence", evidenceCount, "#5CC8FF", motor.evidenceCount > 0)}
            ${renderCompactPill("healing-ready", motor.healingReadyCount, "#22C55E", motor.healingReadyCount > 0)}
            ${renderCompactPill("confidence", motor.confidence, qualityColor(motor.confidence), motor.confidence > 0)}
          </div>
        </div>

        <div class="ore-issue-head">
          <div class="ore-issue-id">
            <div class="ore-issue-label">Focus</div>
            <div class="ore-issue-value">${escapeHtml(motor.focusIssueCode)}</div>
            <div class="ore-issue-meta">
              <span>${escapeHtml(motor.focusIssueDiagnosisTitle)}</span>
              <span class="ore-dot-sep">•</span>
              <span>${escapeHtml(motor.focusIssueSeverity)}</span>
              <span class="ore-dot-sep">•</span>
              <span>${escapeHtml(motor.focusIssueRoute)}</span>
            </div>
          </div>

          <div class="ore-issue-actions">
            <div class="ore-edge-light ore-edge-light--rootcause" data-ore-available="${hasDiag ? "1" : "0"}"></div>
            <button type="button" class="ore-btn ore-btn--primary" data-ore-action="open-findings-focus">
              Open findings for this issue
            </button>
            <button type="button" class="ore-btn ore-btn--ghost" data-ore-action="open-latest-evidence">
              Open latest evidence
            </button>
          </div>
        </div>

        <div class="ore-panels">
          <div class="ore-panel ore-panel--wide">
            <div class="ore-panel-title">Motor explanations</div>
            <div class="ore-two-col">
              <div class="ore-subpanel">
                <div class="ore-subpanel-title">Layman explanation</div>
                <div class="ore-rich" style="white-space:pre-wrap;">
                  ${motor.focusIssueLaymanExplanation !== "—" ? escapeHtml(motor.focusIssueLaymanExplanation) : `<span class="ore-muted">—</span>`}
                </div>
              </div>
              <div class="ore-subpanel">
                <div class="ore-subpanel-title">Technical explanation</div>
                <div class="ore-rich" style="white-space:pre-wrap;">
                  ${motor.focusIssueTechnicalExplanation !== "—" ? escapeHtml(motor.focusIssueTechnicalExplanation) : `<span class="ore-muted">—</span>`}
                </div>
              </div>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Probable causes</div>
            <div class="ore-rich">${renderBulletList(causes)}</div>
          </div>
          <div class="ore-panel">
            <div class="ore-panel-title">Technical checks</div>
            <div class="ore-rich">${renderBulletList(checks)}</div>
          </div>
          <div class="ore-panel">
            <div class="ore-panel-title">Likely areas</div>
            <div class="ore-rich">${renderBulletList(likelyAreas)}</div>
          </div>
          <div class="ore-panel">
            <div class="ore-panel-title">Recommended actions</div>
            <div class="ore-rich">${renderBulletList(recActs)}</div>
          </div>
        </div>

        <div class="ore-bottom-context">
          <div class="ore-context-block">
            <div class="ore-context-title">Command hints</div>
            <div class="ore-rich" style="white-space:pre-wrap;">
              ${motor.focusIssueCommandHints !== "—" ? escapeHtml(motor.focusIssueCommandHints) : `<span class="ore-muted">—</span>`}
            </div>
          </div>
          <div class="ore-context-block">
            <div class="ore-context-title">Best resolution (motor)</div>
            <div class="ore-rich" style="white-space:pre-wrap;">
              ${motor.focusIssueRecommendedResolution !== "—" ? escapeHtml(motor.focusIssueRecommendedResolution) : `<span class="ore-muted">—</span>`}
            </div>
          </div>
        </div>

        <div class="ore-action-layer">
          <button type="button" class="ore-btn ore-btn--primary" data-ore-action="open-prompts">
            Execution: open healing queue
          </button>
          <button type="button" class="ore-btn ore-btn--ghost" data-ore-action="open-compare">
            Insight: open delta report
          </button>
        </div>
      </section>
    `;
  }

  function renderScreenshotPackage(motor, readiness) {
    const hasEvidence = readiness.evidenceReady;
    const linked = motor.focusIssueEvidenceCount > 0 ? motor.focusIssueEvidenceCount : motor.evidenceCount;

    return `
      <section class="ore-stage">
        <div class="ore-stage-top">
          <div>
            <div class="ore-stage-eyebrow">Screenshot Package</div>
            <div class="ore-stage-title">Evidence lane (prove what you do)</div>
          </div>
          <div class="ore-stage-top-right">
            ${renderCompactPill("evidence", linked, "#5CC8FF", hasEvidence)}
            ${renderCompactPill("compare", motor.refLabel, "#F59E0B", motor.refLabel !== "—")}
            ${renderCompactPill("focus-issue", motor.focusIssueCode, "#5B8CFF", motor.focusIssueCode !== "—")}
          </div>
        </div>

        <div class="ore-panels">
          <div class="ore-panel ore-panel--wide">
            <div class="ore-panel-title">Evidence readiness</div>
            <div class="ore-evidence-grid">
              <div class="ore-evidence-tile">
                <div class="ore-evidence-k">Total evidence</div>
                <div class="ore-evidence-v ore-accent">${escapeHtml(String(motor.evidenceCount))}</div>
              </div>
              <div class="ore-evidence-tile">
                <div class="ore-evidence-k">Linked to focus issue</div>
                <div class="ore-evidence-v">${escapeHtml(String(motor.focusIssueEvidenceCount || 0))}</div>
              </div>
              <div class="ore-evidence-tile">
                <div class="ore-evidence-k">Root cause availability</div>
                <div class="ore-evidence-v ${readiness.rootCauseReady ? "ore-ok" : "ore-warn"}">${escapeHtml(readiness.rootCauseReady ? "ready" : "waiting")}</div>
              </div>
            </div>

            <div class="ore-panel-subtle">
              Open the evidence room to inspect artifacts. This module only reflects counts and pointers from the motor.
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Proof for operator</div>
            <div class="ore-rich">
              <div class="ore-bullet">
                Evidence artifacts: <span class="ore-strong">${escapeHtml(String(motor.evidenceCount))}</span>
              </div>
              <div class="ore-bullet">
                Focus issue: <span class="ore-strong">${escapeHtml(motor.focusIssueCode)}</span>
              </div>
              <div class="ore-bullet">
                Delta context: <span class="ore-strong">${escapeHtml(motor.refLabel)}</span>
              </div>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Next safe action</div>
            <div class="ore-rich">
              <div class="ore-muted">When evidence exists, Evidence mode becomes the proof gate for execution.</div>
              <div class="ore-action-inline">
                <span class="ore-inline-k">Recommended:</span>
                <span class="ore-inline-v">${escapeHtml(readiness.evidenceReady ? "Inspect evidence then heal" : "Generate evidence by running audit")}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ore-action-layer">
          <button type="button" class="ore-btn ore-btn--primary" data-ore-action="open-latest-evidence">
            Open latest evidence
          </button>
          <button type="button" class="ore-btn ore-btn--ghost" data-ore-action="open-findings-focus">
            Back to focus issue reasoning
          </button>
        </div>
      </section>
    `;
  }

  function renderFixPlan(motor, readiness) {
    return `
      <section class="ore-stage">
        <div class="ore-stage-top">
          <div>
            <div class="ore-stage-eyebrow">Fix Plan</div>
            <div class="ore-stage-title">Healing execution gate</div>
          </div>
          <div class="ore-stage-top-right">
            ${renderCompactPill("eligible", motor.healingEligibleCount, "#22C55E", motor.healingEligibleCount > 0)}
            ${renderCompactPill("pending", motor.healingPendingCount, "#F59E0B", motor.healingPendingCount > 0)}
            ${renderCompactPill("ready", motor.healingReadyCount, "#22C55E", motor.healingReadyCount > 0)}
          </div>
        </div>

        <div class="ore-panels">
          <div class="ore-panel ore-panel--wide">
            <div class="ore-panel-title">Healing queue (motor)</div>
            <div class="ore-heal-grid">
              <div class="ore-heal-tile">
                <div class="ore-heal-k">eligible_for_healing</div>
                <div class="ore-heal-v ore-ok">${escapeHtml(String(motor.healingEligibleCount))}</div>
              </div>
              <div class="ore-heal-tile">
                <div class="ore-heal-k">promptReady (pending)</div>
                <div class="ore-heal-v ore-warn">${escapeHtml(String(motor.healingPendingCount))}</div>
              </div>
              <div class="ore-heal-tile">
                <div class="ore-heal-k">promptReady (ready)</div>
                <div class="ore-heal-v ore-accent">${escapeHtml(String(motor.healingReadyCount))}</div>
              </div>
              <div class="ore-heal-tile">
                <div class="ore-heal-k">total ready healing</div>
                <div class="ore-heal-v">${escapeHtml(String(motor.healingCount))}</div>
              </div>
            </div>

            <div class="ore-panel-subtle">
              Root Cause readiness influences operator confidence. The execution gate never invents.
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Guardrails</div>
            <div class="ore-rich">
              <div class="ore-bullet">
                Root cause: <span class="ore-strong">${escapeHtml(readiness.rootCauseReady ? "ready" : "waiting")}</span>
              </div>
              <div class="ore-bullet">
                Evidence: <span class="ore-strong">${escapeHtml(readiness.evidenceReady ? String(motor.evidenceCount) : "—")}</span>
              </div>
              <div class="ore-bullet">
                Delta reference: <span class="ore-strong">${escapeHtml(motor.refLabel !== "—" ? "available" : "—")}</span>
              </div>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Fix plan actions</div>
            <div class="ore-rich">
              <div class="ore-muted">Use the Prompt workspace queue. ORE only routes you to the real engine UI.</div>
              <div class="ore-action-inline">
                <span class="ore-inline-k">Action-ready:</span>
                <span class="ore-inline-v">${escapeHtml(motor.healingReadyCount > 0 ? "yes" : "not yet")}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ore-action-layer">
          <button type="button" class="ore-btn ore-btn--primary" data-ore-action="open-prompts">
            Open prompts / healing queue
          </button>
          <button type="button" class="ore-btn ore-btn--ghost" data-ore-action="open-findings-focus">
            Inspect issue explanation again
          </button>
        </div>
      </section>
    `;
  }

  function renderComparisonReport(motor, readiness) {
    const ok = readiness.compareReady;
    return `
      <section class="ore-stage">
        <div class="ore-stage-top">
          <div>
            <div class="ore-stage-eyebrow">Comparison Report</div>
            <div class="ore-stage-title">Delta direction (read-only intelligence)</div>
          </div>
          <div class="ore-stage-top-right">
            ${renderCompactPill("ref", ok ? motor.refLabel : "—", "#F59E0B", ok)}
            ${renderCompactPill("issues Δ", motor.deltaIssues, "#EF4444", ok && motor.deltaIssues !== "—" && motor.deltaIssues !== "0")}
            ${renderCompactPill("risk Δ", motor.deltaRisk, "#F59E0B", ok && motor.deltaRisk !== "—")}
          </div>
        </div>

        <div class="ore-panels">
          <div class="ore-panel ore-panel--wide">
            <div class="ore-panel-title">Delta digest</div>
            <div class="ore-delta-grid">
              <div class="ore-delta-tile ore-delta-tile--issues">
                <div class="ore-delta-k">Issues</div>
                <div class="ore-delta-v">${escapeHtml(motor.deltaIssues)}</div>
              </div>
              <div class="ore-delta-tile ore-delta-tile--seo">
                <div class="ore-delta-k">SEO</div>
                <div class="ore-delta-v">${escapeHtml(motor.deltaSeo)}</div>
              </div>
              <div class="ore-delta-tile ore-delta-tile--risk">
                <div class="ore-delta-k">Risk</div>
                <div class="ore-delta-v">${escapeHtml(motor.deltaRisk)}</div>
              </div>
            </div>

            <div class="ore-panel-subtle">
              routes/actions delta context:
              <span class="ore-inline-v">${escapeHtml(motor.deltaRoutesActions)}</span>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">What this means operationally</div>
            <div class="ore-rich">
              <div class="ore-bullet">
                If deltas exist, they are a guidance layer for choosing which mode to unlock next.
              </div>
              <div class="ore-bullet">
                Ref label: <span class="ore-strong">${escapeHtml(motor.refLabel)}</span>
              </div>
            </div>
          </div>

          <div class="ore-panel">
            <div class="ore-panel-title">Readiness</div>
            <div class="ore-rich">
              <div class="ore-bullet">
                Compare reference: <span class="ore-strong">${escapeHtml(ok ? "available" : "missing")}</span>
              </div>
              <div class="ore-bullet">
                Evidence count: <span class="ore-strong">${escapeHtml(String(motor.evidenceCount))}</span>
              </div>
              <div class="ore-bullet">
                Healing ready: <span class="ore-strong">${escapeHtml(String(motor.healingReadyCount))}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ore-action-layer">
          <button type="button" class="ore-btn ore-btn--primary" data-ore-action="open-compare">
            Open compare view
          </button>
          <button type="button" class="ore-btn ore-btn--ghost" data-ore-action="open-latest-evidence">
            Back to evidence lane
          </button>
        </div>
      </section>
    `;
  }

  function renderPipelineFooter(motor, readiness, activePattern) {
    const pipeline = [
      { key: "root-cause", label: "Diagnosis", ok: readiness.rootCauseReady, color: "#A855F7" },
      { key: "visual-evidence", label: "Evidence", ok: readiness.evidenceReady, color: "#5CC8FF" },
      { key: "execution-protocol", label: "Healing", ok: readiness.executionReady, color: "#22C55E" },
      { key: "delta-intelligence", label: "Delta", ok: readiness.compareReady, color: "#F59E0B" },
    ];
    const nextBlocked = pipeline.find((x) => !x.ok);
    const nextText = nextBlocked ? `blocked: ${nextBlocked.label}` : "coherent: all gates open";

    return `
      <footer class="ore-footer">
        <div class="ore-footer-steps">
          ${pipeline
            .map(
              (s) => `
            <div class="ore-step ${s.ok ? "ok" : "wait"} ${s.key === activePattern ? "is-active" : ""}" style="--stepColor:${s.color}">
              <span class="ore-step-dot"></span>
              <span class="ore-step-label">${escapeHtml(s.label)}</span>
            </div>
          `,
            )
            .join("")}
        </div>
        <div class="ore-footer-status">
          <span class="ore-mono">status</span>
          <span class="ore-footer-status-value">${escapeHtml(nextText)}</span>
        </div>
      </footer>
    `;
  }

  function truncateOneLine(raw, maxLen = 90) {
    const s = String(raw || "").trim();
    if (!s || s === "—") return "—";
    const first = s.split("\n")[0].trim();
    if (first.length <= maxLen) return first;
    return first.slice(0, maxLen - 1) + "…";
  }

  function pickBandFromCounts(p0, p1, p2) {
    if (p0 > 0) return "P0";
    if (p1 > 0) return "P1";
    if (p2 > 0) return "P2";
    return "—";
  }

  function pickSecondBand(p0, p1, p2, first) {
    const candidates = [
      { id: "P0", n: p0 },
      { id: "P1", n: p1 },
      { id: "P2", n: p2 },
    ].filter((x) => x.n > 0);
    const ordered = candidates.sort((a, b) => b.n - a.n);
    const foundFirstIdx = ordered.findIndex((x) => x.id === first);
    if (foundFirstIdx === -1) return ordered[0]?.id || "—";
    return ordered[1]?.id || "—";
  }

  function qualityTrajectoryLabel(raw) {
    const s = String(raw || "").toLowerCase();
    if (!s || s === "—") return "stable";
    if (s.includes("degrad")) return "degrading";
    if (s.includes("improv")) return "improving";
    return "stable";
  }

  function bandToColor(band) {
    if (band === "P0") return { bg: "#EF4444", shadow: "0 0 12px rgba(239,68,68,0.55)" };
    if (band === "P1") return { bg: "#F59E0B", shadow: "0 0 12px rgba(245,158,11,0.55)" };
    if (band === "P2") return { bg: "#5B8CFF", shadow: "0 0 12px rgba(91,140,255,0.55)" };
    return { bg: "#8B95A5", shadow: "0 0 12px rgba(139,149,165,0.35)" };
  }

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.textContent = String(value == null ? "—" : value);
  }

  function updateOperatorBelowSticky(motor) {
    // 1) Intelligence Queue (troca textos fixos pelos dados do motor)
    const q0Title = motor.focusIssueCode !== "—" ? motor.focusIssueCode : motor.target;
    const q0SubtitleCandidate = motor.focusIssueLaymanExplanation !== "—" ? motor.focusIssueLaymanExplanation : motor.focusIssueTechnicalExplanation;

    const band0 = pickBandFromCounts(motor.p0Count, motor.p1Count, motor.p2Count);
    const band1 = pickSecondBand(motor.p0Count, motor.p1Count, motor.p2Count, band0);

    const trajectory = qualityTrajectoryLabel(motor.qualityTrajectory);
    const memoryLabel = motor.memoryEntries > 0 ? "validated memory" : "no memory";
    const healingLabel =
      motor.healingReadyCount > 0
        ? "healing ready"
        : motor.healingPendingCount > 0
          ? `healing pending (${motor.healingPendingCount})`
          : "no healing";

    setText('[data-ore-queue-0-title]', q0Title);
    setText('[data-ore-queue-0-band]', band0);
    setText('[data-ore-queue-0-trajectory]', trajectory);
    setText('[data-ore-queue-0-memory]', memoryLabel);
    setText('[data-ore-queue-0-healing]', healingLabel);
    setText('[data-ore-queue-0-route]', motor.focusIssueRoute !== "—" ? motor.focusIssueRoute : motor.target);
    setText('[data-ore-queue-0-subtitle]', truncateOneLine(q0SubtitleCandidate, 70));
    setText('[data-ore-queue-0-impact]', `impact: ${motor.confidence}%`);

    setText('[data-ore-queue-1-title]', band1 !== "—" ? `Next band ${band1}` : "Next operational signal");
    setText('[data-ore-queue-1-band]', band1);
    setText('[data-ore-queue-1-healing]', healingLabel);
    setText('[data-ore-queue-1-route]', motor.target);
    const q1Subtitle =
      motor.evidenceCount > 0
        ? `evidence available (${motor.evidenceCount})`
        : `evidence pending`;
    setText('[data-ore-queue-1-subtitle]', q1Subtitle);
    setText('[data-ore-queue-1-impact]', `impact: ${motor.confidence}%`);

    const dot0 = document.querySelector('[data-ore-queue-0-dot]');
    const dot1 = document.querySelector('[data-ore-queue-1-dot]');
    const c0 = bandToColor(band0);
    const c1 = bandToColor(band1);
    if (dot0) {
      dot0.style.background = c0.bg;
      dot0.style.boxShadow = c0.shadow;
    }
    if (dot1) {
      dot1.style.background = c1.bg;
      dot1.style.boxShadow = c1.shadow;
    }

    // 2) Operator Cards
    setText('[data-ore-op-memory-subtitle]', motor.memoryEntries > 0 ? `Validated resolutions: ${motor.memoryEntries} entries` : "No validated memory yet.");

    const healSubtitle = `Eligible: ${motor.healingEligibleCount} | Ready: ${motor.healingReadyCount} | Pending: ${motor.healingPendingCount}`;
    setText('[data-ore-op-heal-subtitle]', healSubtitle);
    const healState = motor.healingReadyCount > 0
      ? `Ready (${motor.healingReadyCount})`
      : motor.healingPendingCount > 0
        ? `Pending (${motor.healingPendingCount})`
        : "Waiting";
    setText('[data-ore-op-heal-state]', healState);

    const deltaIssues = truncateOneLine(motor.deltaIssues, 32);
    const deltaSeo = truncateOneLine(motor.deltaSeo, 32);
    setText('[data-ore-op-compare-subtitle]', `Insight: ${deltaIssues} · ${deltaSeo}`);

    const m = String(motor.deltaIssues || "").match(/-?\d+/);
    const deltaNum = m ? m[0] : "—";
    setText('[data-ore-op-compare-delta]', `Δ ${deltaNum} changes`);

    // 3) Evidence Package Grid - Fix Plan Pattern progress
    const stepEl = document.querySelector('[data-ore-fixplan-step-label]');
    const barEl = document.querySelector('[data-ore-fixplan-step-bar]');
    if (stepEl && barEl) {
      const step = motor.healingReadyCount > 0 ? 4 : (motor.healingPendingCount > 0 ? 2 : 1);
      stepEl.textContent = `Step ${step}/4`;
      barEl.style.width = `${Math.round((step / 4) * 100)}%`;
    }
  }

  function injectStyles() {
    if (document.getElementById("ore-inline-styles")) return;
    const style = document.createElement("style");
    style.id = "ore-inline-styles";
    style.textContent = `
      .ore-root {
        position: relative;
        font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        color: rgba(240,244,248,0.95);
      }

      .ore-root::after {
        content:"";
        position:absolute;
        inset:-1px;
        border-radius:24px;
        pointer-events:none;
        opacity:0.0;
        transition: opacity 220ms ease;
        background: radial-gradient(ellipse at top, var(--ore-glow, rgba(91,140,255,0.22)), transparent 68%);
        filter: blur(10px);
        z-index:0;
      }

      .ore-shell {
        position: relative;
        z-index:1;
        border-radius: 24px;
        overflow: hidden;
        background:
          linear-gradient(to bottom right, rgba(255,255,255,0.04), rgba(255,255,255,0.01)),
          radial-gradient(900px 320px at 12% 6%, rgba(91,140,255,0.10), transparent 60%),
          radial-gradient(900px 320px at 88% 20%, rgba(168,85,247,0.08), transparent 55%);
        border: 1px solid rgba(255,255,255,0.06);
        box-shadow:
          0 20px 60px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.08);
      }

      .ore-shell[data-ore-state="healing"] { --ore-glow: rgba(34,197,94,0.30); }
      .ore-shell[data-ore-state="causal"] { --ore-glow: rgba(168,85,247,0.30); }
      .ore-shell[data-ore-state="evidence"] { --ore-glow: rgba(92,200,255,0.30); }
      .ore-shell[data-ore-state="delta"] { --ore-glow: rgba(245,158,11,0.30); }
      .ore-shell[data-ore-state="triage"] { --ore-glow: rgba(91,140,255,0.30); }

      .ore-shell:hover::after { opacity: 1; }

      .ore-header {
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap: 14px;
        padding: 16px 18px 12px 18px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
        background: linear-gradient(to right, rgba(255,255,255,0.03), transparent);
      }
      .ore-title { display:flex; align-items:center; gap:10px; }
      .ore-title-dot { width:10px; height:10px; border-radius:50%; box-shadow: 0 0 18px var(--ore-glow); }
      .ore-title-text { font-weight: 700; letter-spacing: -0.01em; }

      .ore-subtitle { margin-top:6px; font-size:12px; color: rgba(139,149,165,0.95); }
      .ore-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .ore-sub-sep { opacity:0.7; margin: 0 8px; }
      .ore-sub-value { color: rgba(240,244,248,0.95); }

      .ore-header-right {
        display:flex;
        align-items:center;
        justify-content:flex-end;
        gap: 10px;
        flex-wrap: wrap;
      }

      .ore-header-chip {
        display:flex;
        align-items:center;
        gap: 10px;
        padding: 9px 12px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
        white-space: nowrap;
      }
      .ore-header-chip-label { font-size:12px; font-weight:600; opacity:0.95; }
      .ore-header-chip--runtime .ore-dot { width:10px; height:10px; border-radius:50%; }
      .ore-header-chip--runtime .ore-dot {
        animation: ore-runtime-pulse 1.55s ease-in-out infinite;
      }
      .ore-header-chip-value { font-weight:800; font-size:12px; }
      .ore-dot { width:10px; height:10px; border-radius:50%; }

      .ore-body {
        display:grid;
        grid-template-columns: 280px 1fr;
        min-height: 560px;
      }
      @media (max-width: 1024px) {
        .ore-body { grid-template-columns: 1fr; }
      }

      .ore-rail {
        padding: 14px;
        border-right: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.01);
      }
      @media (max-width: 1024px) {
        .ore-rail { border-right:none; border-bottom:1px solid rgba(255,255,255,0.06); }
      }

      .ore-rail-title {
        font-size:10px;
        text-transform: uppercase;
        letter-spacing: 0.14em;
        color: rgba(139,149,165,0.95);
        margin-bottom: 12px;
      }

      .ore-rail-list { display:flex; flex-direction:column; gap: 10px; }

      .ore-mode {
        position:relative;
        display:flex;
        align-items:center;
        gap: 12px;
        padding: 12px;
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.015);
        cursor:pointer;
        color: rgba(240,244,248,0.88);
        transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
      }
      .ore-mode:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.03); }
      .ore-mode.is-active { border-color: rgba(255,255,255,0.20); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 12px 36px rgba(0,0,0,0.25); }
      .ore-mode-accent { width: 6px; height: 36px; border-radius: 999px; opacity: 0.85; }
      .ore-mode-main { display:flex; flex-direction:column; gap: 3px; min-width:0; flex: 1; }
      .ore-mode-label { font-size:13px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .ore-mode-sub { font-size:10px; color: rgba(139,149,165,0.95); text-transform: uppercase; letter-spacing: 0.12em; display:flex; align-items:center; gap: 8px; }
      .ore-mode-sep { opacity:0.4; }
      .ore-mode-state { color: rgba(240,244,248,0.92); }
      .ore-mode-badge { font-size:10px; font-weight:900; padding: 5px 10px; border-radius:999px; border: 1px solid; }

      .ore-mode.is-blocked { opacity: 0.78; }
      .ore-mode.is-ready .ore-mode-state { color: rgba(34,197,94,0.95); }

      .ore-rail-footer {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px solid rgba(255,255,255,0.06);
        display:flex;
        gap: 10px;
      }

      @keyframes ore-runtime-pulse {
        0% { transform: scale(0.92); opacity: 0.75; }
        50% { transform: scale(1.18); opacity: 1; }
        100% { transform: scale(0.92); opacity: 0.75; }
      }
      .ore-mini { flex: 1; }
      .ore-mini-label { font-size:10px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(139,149,165,0.95); }
      .ore-mini-value { margin-top:6px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size:11px; color: rgba(240,244,248,0.95); }

      .ore-stage {
        padding: 16px 18px 12px 18px;
        display:flex;
        flex-direction:column;
        gap: 12px;
      }

      .ore-stage-top {
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap: 14px;
      }
      .ore-stage-eyebrow { font-size:10px; text-transform: uppercase; letter-spacing:0.14em; color: rgba(139,149,165,0.95); margin-bottom: 6px; }
      .ore-stage-title { font-size:16px; font-weight:800; letter-spacing: -0.01em; }

      .ore-stage-top-right { display:flex; gap: 10px; flex-wrap: wrap; justify-content:flex-end; }

      .ore-chip {
        display:flex;
        flex-direction:column;
        gap: 2px;
        padding: 8px 10px;
        border-radius: 14px;
        border: 1px solid rgba(255,255,255,0.08);
        min-width: 90px;
      }
      .ore-chip--muted { border-color: rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); opacity: 0.8; }
      .ore-chip-label { font-size:10px; text-transform: uppercase; letter-spacing:0.12em; color: rgba(139,149,165,0.95); }
      .ore-chip-value { font-size:12px; font-weight:900; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

      .ore-panels {
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .ore-panels .ore-panel--wide { grid-column: 1 / -1; }

      @media (max-width: 1024px) {
        .ore-panels { grid-template-columns: 1fr; }
        .ore-panels .ore-panel--wide { grid-column: auto; }
      }

      .ore-panel {
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.015);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
        padding: 14px;
      }

      .ore-panel-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: rgba(139,149,165,0.95);
        margin-bottom: 10px;
      }
      .ore-panel-subtle { font-size:12px; color: rgba(139,149,165,0.92); margin-top: 10px; }
      .ore-strong { color: rgba(240,244,248,0.95); font-weight: 900; }

      .ore-meter { display:flex; flex-direction:column; gap: 10px; }
      .ore-meter-row { display:grid; grid-template-columns: 44px 1fr 44px; gap: 10px; align-items:center; }
      .ore-meter-label { font-size:12px; font-weight:800; color: rgba(240,244,248,0.92); }
      .ore-meter-value { font-size:12px; font-weight:900; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: rgba(240,244,248,0.9); text-align:right; }
      .ore-meter-bar { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); overflow:hidden; }
      .ore-meter-bar span { display:block; height:100%; border-radius:999px; }
      .ore-meter-bar--p0 span { background: rgba(239,68,68,0.95); }
      .ore-meter-bar--p1 span { background: rgba(245,158,11,0.95); }
      .ore-meter-bar--p2 span { background: rgba(91,140,255,0.95); }

      .ore-predict-grid {
        display:grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
      }
      .ore-predict { padding: 10px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); }
      .ore-predict-k { font-size:10px; text-transform: uppercase; letter-spacing:0.12em; color: rgba(139,149,165,0.95); }
      .ore-predict-v { margin-top: 8px; font-size: 18px; font-weight: 1000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: rgba(240,244,248,0.95); }
      .ore-predict-v.ore-accent { color: rgba(91,140,255,0.95); }
      .ore-predict-v.ore-warn { color: rgba(245,158,11,0.95); }
      .ore-predict-v.ore-ok { color: rgba(34,197,94,0.95); }
      @media (max-width: 1024px) { .ore-predict-grid { grid-template-columns: 1fr 1fr; } }

      .ore-action-layer {
        display:flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 2px;
      }

      .ore-btn {
        border-radius: 16px;
        padding: 12px 14px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.03);
        color: rgba(240,244,248,0.95);
        font-weight: 850;
        cursor: pointer;
        transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease, border-color 180ms ease;
      }
      .ore-btn:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.06); }
      .ore-btn--primary { border-color: rgba(91,140,255,0.35); background: rgba(91,140,255,0.12); box-shadow: 0 16px 50px rgba(91,140,255,0.12); }
      .ore-btn--ghost { border-color: rgba(255,255,255,0.10); background: rgba(255,255,255,0.02); }

      .ore-muted { color: rgba(139,149,165,0.92); }
      .ore-bullet { font-size: 13px; color: rgba(240,244,248,0.92); margin: 6px 0; }
      .ore-rich { font-size: 13px; color: rgba(240,244,248,0.9); }
      .ore-two-col { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 1024px) { .ore-two-col { grid-template-columns: 1fr; } }
      .ore-subpanel-title { font-size: 11px; text-transform: uppercase; letter-spacing:0.12em; color: rgba(139,149,165,0.95); margin-bottom: 10px; }
      .ore-subpanel { min-width: 0; }

      .ore-issue-head {
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap: 16px;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 20px;
        background: rgba(255,255,255,0.01);
        padding: 14px;
        margin-top: 2px;
      }
      @media (max-width: 1024px) { .ore-issue-head { flex-direction:column; } }
      .ore-issue-label { font-size:10px; text-transform: uppercase; letter-spacing:0.12em; color: rgba(139,149,165,0.95); }
      .ore-issue-value { margin-top: 6px; font-size: 18px; font-weight: 1000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .ore-issue-meta { margin-top: 6px; font-size:12px; color: rgba(139,149,165,0.95); display:flex; gap: 10px; align-items:center; flex-wrap: wrap; }
      .ore-dot-sep { opacity: 0.35; }
      .ore-issue-actions { display:flex; gap: 10px; align-items:center; flex-wrap: wrap; justify-content:flex-end; }
      .ore-edge-light { width: 10px; height: 10px; border-radius: 50%; background: rgba(168,85,247,0.55); box-shadow: 0 0 16px rgba(168,85,247,0.50); }
      .ore-edge-light--rootcause[data-ore-available="0"] { opacity: 0.35; }

      .ore-bottom-context { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 1024px) { .ore-bottom-context { grid-template-columns: 1fr; } }
      .ore-context-block { border-radius:20px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); padding: 14px; }
      .ore-context-title { font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color: rgba(139,149,165,0.95); margin-bottom: 10px; }

      .ore-evidence-grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      @media (max-width: 1024px) { .ore-evidence-grid { grid-template-columns: 1fr; } }
      .ore-evidence-tile { padding: 10px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); }
      .ore-evidence-k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(139,149,165,0.95); }
      .ore-evidence-v { margin-top: 10px; font-size: 22px; font-weight: 1000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: rgba(240,244,248,0.95); }
      .ore-evidence-v.ore-accent { color: rgba(91,140,255,0.95); }
      .ore-evidence-v.ore-ok { color: rgba(34,197,94,0.95); }
      .ore-evidence-v.ore-warn { color: rgba(245,158,11,0.95); }

      .ore-action-inline { display:flex; align-items:baseline; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
      .ore-inline-k { font-size:12px; color: rgba(139,149,165,0.95); font-weight:900; text-transform: uppercase; letter-spacing:0.08em; }
      .ore-inline-v { color: rgba(240,244,248,0.95); font-weight: 950; }

      .ore-heal-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
      @media (max-width: 1024px) { .ore-heal-grid { grid-template-columns: 1fr 1fr; } }
      .ore-heal-tile { padding: 10px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); }
      .ore-heal-k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(139,149,165,0.95); }
      .ore-heal-v { margin-top: 10px; font-size: 20px; font-weight: 1000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: rgba(240,244,248,0.95); }
      .ore-heal-v.ore-ok { color: rgba(34,197,94,0.95); }
      .ore-heal-v.ore-warn { color: rgba(245,158,11,0.95); }
      .ore-heal-v.ore-accent { color: rgba(91,140,255,0.95); }

      .ore-delta-grid { display:grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
      @media (max-width: 1024px) { .ore-delta-grid { grid-template-columns: 1fr; } }
      .ore-delta-tile { padding: 10px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); background: rgba(0,0,0,0.15); }
      .ore-delta-k { font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: rgba(139,149,165,0.95); }
      .ore-delta-v { margin-top: 10px; font-size: 22px; font-weight: 1000; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: rgba(240,244,248,0.95); }
      .ore-delta-tile--issues .ore-delta-v { color: rgba(239,68,68,0.95); }
      .ore-delta-tile--seo .ore-delta-v { color: rgba(34,197,94,0.95); }
      .ore-delta-tile--risk .ore-delta-v { color: rgba(245,158,11,0.95); }

      .ore-footer {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap: 12px;
        padding: 12px 18px;
        border-top: 1px solid rgba(255,255,255,0.06);
        background: rgba(255,255,255,0.01);
      }
      .ore-footer-steps { display:flex; align-items:center; gap: 10px; flex-wrap: wrap; }
      .ore-step {
        display:flex;
        align-items:center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(255,255,255,0.02);
      }
      .ore-step-dot { width: 8px; height:8px; border-radius:50%; background: var(--stepColor, rgba(255,255,255,0.4)); box-shadow: 0 0 14px rgba(255,255,255,0.15); }
      .ore-step-label { font-size:12px; font-weight: 900; }
      .ore-step.ok { border-color: rgba(34,197,94,0.30); }
      .ore-step.wait { opacity: 0.75; }
      .ore-step.is-active { border-color: rgba(255,255,255,0.20); }
      .ore-footer-status { display:flex; gap: 10px; align-items:baseline; }
      .ore-footer-status-value { font-weight: 1000; }
    `;
    document.head.appendChild(style);
  }

  function decideOreState(motor, activePattern, readiness) {
    if (activePattern === "root-cause") return "causal";
    if (activePattern === "visual-evidence") return "evidence";
    if (activePattern === "execution-protocol") return "healing";
    if (activePattern === "delta-intelligence") return "delta";
    return "triage";
  }

  function openFindingsWithQuery(query) {
    const search = document.getElementById("findingsSearch");
    const btn = document.getElementById("sidebarFindings");
    // A navegação de views no SitePulse é feita por cliques nos botões do renderer.
    if (btn && typeof btn.click === "function") btn.click();
    if (search) {
      search.value = String(query || "").trim();
      search.dispatchEvent(new Event("input", { bubbles: true }));
      search.focus();
    }
  }

  function clickById(id) {
    const el = document.getElementById(id);
    if (el && typeof el.click === "function") el.click();
  }

  function executeAction(action, motor) {
    if (action === "open-findings") {
      // Como este módulo substitui completamente #workspaceShell, não delegamos para outra view.
      // Em vez disso, desbloqueamos o modo cognitivo que já contém a explicação do motor.
      state.activePattern = "root-cause";
      renderOnce();
      return;
    }
    if (action === "open-findings-focus") {
      state.activePattern = "root-cause";
      renderOnce();
      return;
    }
    if (action === "open-prompts") {
      clickById("dockGenerateFixPlan");
      return;
    }
    if (action === "open-latest-evidence") {
      setTimeout(() => {
        // `openLatestEvidence` pode existir apenas quando as seções são inicializadas.
        clickById("openLatestEvidence");
        if (window.sitePulseCompanion?.openLatestEvidence) {
          // fallback: abre evidencia via bridge; se o renderer precisar da view, o click DOM tende a resolver.
          window.sitePulseCompanion.openLatestEvidence().catch(() => {});
        }
      }, 120);
      return;
    }
    if (action === "open-compare") {
      state.activePattern = "delta-intelligence";
      renderOnce();
      return;
    }
  }

  function renderOnce() {
    const container = document.getElementById("workspaceShell");
    if (!container) return;

    const motor = readMotorSnapshot();
    const readiness = computeReadiness(motor);
    const activePattern = state.activePattern;
    const oreState = decideOreState(motor, activePattern, readiness);

    container.innerHTML = `
      <div class="ore-root">
        <div class="ore-shell" data-ore-state="${escapeHtml(oreState)}">
          ${renderHeader(motor, readiness, activePattern)}
          <div class="ore-body">
            ${renderRail(motor, readiness, activePattern)}
            <div class="ore-stage-wrap">${renderStage(motor, readiness, activePattern)}</div>
          </div>
          ${renderPipelineFooter(motor, readiness, activePattern)}
        </div>
      </div>
    `;

    // OperatorBelowSticky content is now driven by renderer.js [data-shell] bindings.
  }

  function bindOnce() {
    const container = document.getElementById("workspaceShell");
    if (!container) return;

    // Delegação de eventos: rail + actions
    container.addEventListener("click", (e) => {
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (!target) return;
      const modeBtn = target.closest("[data-ore-pattern]");
      if (modeBtn && modeBtn instanceof HTMLButtonElement) {
        const pattern = modeBtn.getAttribute("data-ore-pattern");
        if (pattern) {
          state.activePattern = pattern;
          renderOnce();
        }
        return;
      }

      const actionBtn = target.closest("[data-ore-action]");
      if (actionBtn && actionBtn instanceof HTMLButtonElement) {
        const action = actionBtn.getAttribute("data-ore-action");
        if (!action) return;
        const motor = readMotorSnapshot();
        executeAction(action, motor);
      }
    });
  }

  const state = {
    activePattern: ORE_CONFIG.defaultPattern,
  };

  injectStyles();

  document.addEventListener("DOMContentLoaded", () => {
    renderOnce();
    bindOnce();
    setInterval(() => {
      renderOnce();
    }, ORE_CONFIG.refreshIntervalMs);
  });
})();

