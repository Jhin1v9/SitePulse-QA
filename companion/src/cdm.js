/**
 * Cognitive Delivery Matrix (CDM) - vanilla JS
 * Objetivo: renderizar patterns com 100% de dados vindos do motor (via data-shell DOM).
 * Sem simulação e sem números hardcoded que não existam no motor.
 */
(function () {
  "use strict";

  const CDM_CONFIG = {
    refreshIntervalMs: 2000,
    activePattern: "root-cause",
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  const safeText = (value) => (value == null ? "" : String(value));

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
    return el ? safeText(el.textContent).trim() : "";
  }

  function getShellInt(key) {
    const raw = getShell(key);
    const m = raw.match(/-?\d+/);
    return m ? Number(m[0]) : 0;
  }

  function getShellProgressFromQualityBar() {
    const el = document.querySelector(`[data-shell="qualityBar"]`);
    if (!el) return 0;
    // O renderer.js seta style.width no elemento. Aqui lemos essa largura.
    const styleWidth = el.style && el.style.width ? String(el.style.width) : "";
    const m = styleWidth.match(/(\d+(\.\d+)?)%/);
    if (m) return Number(m[1]) / 100;
    return 0;
  }

  function inferRuntimeStateFromEngineChip() {
    const engineChip = getShell("engineChip").toLowerCase();
    if (!engineChip) return "awaiting";
    if (engineChip.includes("offline")) return "offline";
    if (engineChip.includes("ready") || engineChip.includes("engine ready")) return "processing";
    return "active";
  }

  function readMotorFromShell() {
    const runtimeState = inferRuntimeStateFromEngineChip();
    const confidence = getShellInt("qualityScore");
    const progress = getShellProgressFromQualityBar();
    const target = getShell("target") || "/";
    const runBadge = getShell("runBadge") || "—";

    const p0Count = getShellInt("p0Count");
    const p1Count = getShellInt("p1Count");
    const p2Count = getShellInt("p2Count");

    const predictiveHighRiskAlerts = getShellInt("predictiveHighRiskAlerts");
    const predictiveMediumRiskAlerts = getShellInt("predictiveMediumRiskAlerts");
    const predictiveRecurringPatterns = getShellInt("predictiveRecurringPatterns");
    const predictiveDegradingIssues = getShellInt("predictiveDegradingIssues");
    const predictiveImprovingIssues = getShellInt("predictiveImprovingIssues");

    const healingEligibleCount = getShellInt("healingEligibleCount");
    const healingPendingCount = getShellInt("healingPending");
    const healingReadyCount = getShellInt("healingReadyCount");
    const healingCount = getShellInt("healingCount");

    const evidenceCount = getShellInt("evidenceCount");

    const deltaIssues = getShell("stickyDeltaIssues") || "—";
    const deltaSeo = getShell("stickyDeltaSeo") || "—";
    const deltaRisk = getShell("stickyDeltaRisk") || "—";
    const deltaRoutesActions = getShell("stickyCompareRoutesActions") || "—";

    const refLabel = getShell("stickyRef") || "—";

    const focusIssueCode = getShell("focusIssueCode") || "—";
    const focusIssueRoute = getShell("focusIssueRoute") || "—";
    const focusIssueAction = getShell("focusIssueAction") || "—";
    const focusIssueSeverity = getShell("focusIssueSeverity") || "—";
    const focusIssueDiagnosisTitle = getShell("focusIssueDiagnosisTitle") || "—";
    const focusIssueLaymanExplanation = getShell("focusIssueLaymanExplanation") || "—";
    const focusIssueTechnicalExplanation = getShell("focusIssueTechnicalExplanation") || "—";
    const focusIssueProbableCauses = getShell("focusIssueProbableCauses") || "—";
    const focusIssueTechnicalChecks = getShell("focusIssueTechnicalChecks") || "—";
    const focusIssueRecommendedActions = getShell("focusIssueRecommendedActions") || "—";
    const focusIssueCommandHints = getShell("focusIssueCommandHints") || "—";
    const focusIssueLikelyAreas = getShell("focusIssueLikelyAreas") || "—";
    const focusIssueRecommendedResolution = getShell("focusIssueRecommendedResolution") || "—";
    const focusIssueEvidenceCount = getShellInt("focusIssueEvidenceCount");

    return {
      runtimeState,
      confidence,
      progress,
      target,
      runBadge,
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
      deltaIssues,
      deltaSeo,
      deltaRisk,
      deltaRoutesActions,
      refLabel,

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
    };
  }

  function qualityColor(confidence) {
    if (confidence >= 90) return "#22C55E";
    if (confidence >= 70) return "#5B8CFF";
    if (confidence >= 50) return "#F59E0B";
    return "#EF4444";
  }

  function renderSignalStrip(motor) {
    const runtime = motor.runtimeState;
    const stateLabels = {
      active: "MOTOR ACTIVE",
      processing: "PROCESSING",
      awaiting: "AWAITING",
      paused: "PAUSED",
      offline: "OFFLINE",
    };
    const runtimeColors = {
      active: "#00F0FF",
      processing: "#F59E0B",
      awaiting: "#5A6578",
      paused: "#5A6578",
      offline: "#5A6578",
    };
    const c = qualityColor(motor.confidence);
    const dotPulse = runtime === "active" ? "1.2s" : runtime === "processing" ? "0.6s" : "0s";
    const pulseStyle = dotPulse !== "0s" ? `animation: cdm-dot-pulse ${dotPulse} ease-in-out infinite;` : "";

    const impactBand = motor.p0Count > 0
      ? "critical"
      : motor.confidence < 50
        ? "high"
        : "stable";
    const impactText = impactBand === "critical" ? "Δ CRITICAL" : impactBand === "high" ? "Δ HIGH" : "Δ STABLE";
    const impactColor = impactBand === "critical" ? "#EF4444" : impactBand === "high" ? "#F59E0B" : "#8B95A5";

    return `
      <div class="cdm-signal-strip">
        <div class="cdm-signal-left">
          <div class="cdm-signal-runtime">
            <span class="cdm-runtime-dot" style="background:${runtimeColors[runtime]}; box-shadow:0 0 8px ${runtimeColors[runtime]}80; ${pulseStyle}"></span>
            <span class="cdm-runtime-label" style="color:${runtimeColors[runtime]};">${stateLabels[runtime] || "—"}</span>
          </div>
          <div class="cdm-confidence">
            <span class="cdm-confidence-orb" style="background:conic-gradient(${c} ${motor.confidence}%, transparent ${motor.confidence}%); border-color:${c}; box-shadow:0 0 10px ${c}40;"></span>
            <span class="cdm-confidence-text" style="color:${c};">${motor.confidence}%</span>
          </div>
        </div>

        <div class="cdm-signal-center">
          <span class="cdm-schema">Schema</span>
          <span class="cdm-target" title="${motor.target}">${motor.target}</span>
          <span class="cdm-run-badge">${motor.runBadge}</span>
        </div>

        <div class="cdm-signal-right">
          <span class="cdm-impact" style="background:${impactColor}15; color:${impactColor}; border-color:${impactColor}30;">${impactText}</span>
        </div>
      </div>
    `;
  }

  function renderPatternRail(motor) {
    // Não existe "recommendedPattern" via data-shell no HTML atual;
    // então o rail destaca apenas o padrão ativo e mostra badges do motor quando disponível.
    const active = CDM_CONFIG.activePattern;

    const p0p1 = motor.p0Count + motor.p1Count;
    const triageBadge = p0p1 > 0 ? String(p0p1) : "0";

    const evidenceBadge = String(motor.evidenceCount || 0);
    const planBadge = motor.healingPendingCount > 0 ? String(motor.healingPendingCount) : "0";
    const compareBadge = motor.deltaIssues !== "—" ? "Δ" : "—";

    return `
      <div class="cdm-rail">
        <div class="cdm-rail-title">Cognitive Delivery</div>

        <div class="cdm-rail-caps">
          ${renderRailButton("strategic-triage", "Strategic Triage", "#5B8CFF", triageBadge)}
          ${renderRailButton("root-cause", "Root Cause", "#A855F7", "")}
          ${renderRailButton("visual-evidence", "Visual Evidence", "#5CC8FF", evidenceBadge)}
          ${renderRailButton("execution-protocol", "Execution Protocol", "#22C55E", planBadge)}
          ${renderRailButton("delta-intelligence", "Delta Intelligence", "#F59E0B", compareBadge)}
        </div>

        <div class="cdm-rail-memory">
          <span class="cdm-muted">ref</span>
          <span class="cdm-rail-memory-value" title="${motor.refLabel}">${motor.refLabel}</span>
        </div>
      </div>
    `;
  }

  function renderRailButton(patternId, label, color, badgeText) {
    const active = CDM_CONFIG.activePattern === patternId;
    const disabled = false;
    return `
      <button
        type="button"
        class="cdm-rail-btn ${active ? "active" : ""} ${disabled ? "disabled" : ""}"
        data-pattern="${patternId}"
        style="${active ? `border-color:${color}55; background:${color}10; color:#EAF2FF;` : ""}"
        ${disabled ? "disabled" : ""}
      >
        <span class="cdm-rail-btn-dot" style="background:${color};"></span>
        <span class="cdm-rail-btn-label">${label}</span>
        ${badgeText ? `<span class="cdm-rail-btn-badge" style="border-color:${color}30; background:${color}10; color:${color}">${badgeText}</span>` : ""}
      </button>
    `;
  }

  function renderStage(motor) {
    const p0 = motor.p0Count || 0;
    const p1 = motor.p1Count || 0;
    const p2 = motor.p2Count || 0;

    if (CDM_CONFIG.activePattern === "strategic-triage") {
      return `
        <div class="cdm-stage">
          <div class="cdm-stage-header">
            <h2>Strategic Triage</h2>
            <span class="cdm-stage-chip" style="border-color:#5B8CFF30; background:#5B8CFF10; color:#93bbfc;">P0 ${p0} · P1 ${p1} · P2 ${p2}</span>
          </div>

          <div class="cdm-card-grid">
            <div class="cdm-card">
              <div class="cdm-card-title">Predictive</div>
              <div class="cdm-card-body">
                <div>High/critical alerts: <strong>${motor.predictiveHighRiskAlerts}</strong></div>
                <div>Medium alerts: <strong>${motor.predictiveMediumRiskAlerts}</strong></div>
                <div>Recurring patterns: <strong>${motor.predictiveRecurringPatterns}</strong></div>
              </div>
            </div>
            <div class="cdm-card">
              <div class="cdm-card-title">Self-healing</div>
              <div class="cdm-card-body">
                <div>Eligible: <strong>${motor.healingEligibleCount}</strong></div>
                <div>Pending (promptReady): <strong>${motor.healingPendingCount}</strong></div>
                <div>Ready: <strong>${motor.healingReadyCount}</strong></div>
                <div>Total ready (healingCount): <strong>${motor.healingCount}</strong></div>
              </div>
            </div>
          </div>

          <div class="cdm-actions">
            <button class="cdm-action" type="button" id="cdm-openPrompts">Open prompts / healing</button>
            <button class="cdm-action-ghost" type="button" id="cdm-openFindings">Open findings</button>
          </div>
        </div>
      `;
    }

    if (CDM_CONFIG.activePattern === "root-cause") {
      const issueCode = escapeHtml(motor.focusIssueCode || "—");
      const severity = escapeHtml(motor.focusIssueSeverity || "—");
      const layman = escapeHtml(motor.focusIssueLaymanExplanation || "—");
      const technical = escapeHtml(motor.focusIssueTechnicalExplanation || "—");
      const diagnosisTitle = escapeHtml(motor.focusIssueDiagnosisTitle || "—");

      const toList = (raw) => {
        const s = String(raw || "").trim();
        if (!s || s === "—") return [];
        const parts = s.split("\n").map((x) => x.trim()).filter(Boolean);
        return parts.length ? parts : [s];
      };

      const probableCauses = toList(motor.focusIssueProbableCauses);
      const technicalChecks = toList(motor.focusIssueTechnicalChecks);
      const recommendedActions = toList(motor.focusIssueRecommendedActions);
      const commandHints = toList(motor.focusIssueCommandHints);
      const likelyAreas = toList(motor.focusIssueLikelyAreas);

      const evidenceCount = Number.isFinite(Number(motor.focusIssueEvidenceCount)) ? motor.focusIssueEvidenceCount : 0;

      return `
        <div class="cdm-stage">
          <div class="cdm-stage-header">
            <h2>Root Cause Deconstructor</h2>
            <span class="cdm-stage-chip" style="border-color:#A855F730; background:#A855F720; color:#D8B4FE;">
              ${diagnosisTitle} · ${issueCode} · ${severity}
            </span>
          </div>

          <div class="cdm-card-grid">
            <div class="cdm-card">
              <div class="cdm-card-title">Layman explanation</div>
              <div class="cdm-card-body">
                <div style="white-space:pre-wrap;">${layman}</div>
              </div>
            </div>
            <div class="cdm-card">
              <div class="cdm-card-title">Technical explanation</div>
              <div class="cdm-card-body">
                <div style="white-space:pre-wrap;">${technical}</div>
              </div>
            </div>
          </div>

          <div class="cdm-card-grid">
            <div class="cdm-card">
              <div class="cdm-card-title">Probable causes</div>
              <div class="cdm-card-body">
                ${probableCauses.length
                  ? probableCauses.map((x) => `<div>• ${escapeHtml(x)}</div>`).join("")
                  : `<div style="color:#8B95A5;">—</div>`
                }
              </div>
            </div>
            <div class="cdm-card">
              <div class="cdm-card-title">Technical checks</div>
              <div class="cdm-card-body">
                ${technicalChecks.length
                  ? technicalChecks.map((x) => `<div>• ${escapeHtml(x)}</div>`).join("")
                  : `<div style="color:#8B95A5;">—</div>`
                }
              </div>
            </div>
          </div>

          <div class="cdm-card-grid">
            <div class="cdm-card">
              <div class="cdm-card-title">Recommended actions</div>
              <div class="cdm-card-body">
                ${recommendedActions.length
                  ? recommendedActions.map((x) => `<div>• ${escapeHtml(x)}</div>`).join("")
                  : `<div style="color:#8B95A5;">—</div>`
                }
              </div>
            </div>
            <div class="cdm-card">
              <div class="cdm-card-title">Likely areas</div>
              <div class="cdm-card-body">
                ${likelyAreas.length
                  ? likelyAreas.map((x) => `<div>• ${escapeHtml(x)}</div>`).join("")
                  : `<div style="color:#8B95A5;">—</div>`
                }
              </div>
            </div>
          </div>

          <div class="cdm-actions">
            <button class="cdm-action" type="button" id="cdm-openFindings2">Open findings</button>
            <button class="cdm-action-ghost" type="button" id="cdm-openReportsRootCause">
              Open reports (${evidenceCount} evidence)
            </button>
          </div>

          ${
            commandHints.length
              ? `
            <div class="cdm-empty" style="padding-top:16px;">
              <div class="cdm-empty-title">Command hints</div>
              <div class="cdm-empty-text" style="white-space:pre-wrap;">${commandHints.map((x) => `• ${escapeHtml(x)}`).join("\n")}</div>
            </div>
          `
              : ""
          }
        </div>
      `;
    }

    if (CDM_CONFIG.activePattern === "visual-evidence") {
      return `
        <div class="cdm-stage">
          <div class="cdm-stage-header">
            <h2>Visual Evidence System</h2>
            <span class="cdm-stage-chip" style="border-color:#5CC8FF30; background:#5CC8FF10; color:#7CDEFF;">evidence: ${motor.evidenceCount}</span>
          </div>
          <div class="cdm-empty">
            <div class="cdm-empty-title">Evidence package is in Reports</div>
            <div class="cdm-empty-text">Open the Reports view to inspect the latest evidence artifacts selected by the motor.</div>
            <div class="cdm-actions">
              <button class="cdm-action" type="button" id="cdm-openReports">Open reports</button>
            </div>
          </div>
        </div>
      `;
    }

    if (CDM_CONFIG.activePattern === "execution-protocol") {
      return `
        <div class="cdm-stage">
          <div class="cdm-stage-header">
            <h2>Execution Protocol</h2>
            <span class="cdm-stage-chip" style="border-color:#22C55E30; background:#22C55E10; color:#A7F3D0;">pending: ${motor.healingPendingCount}</span>
          </div>

          <div class="cdm-card-grid">
            <div class="cdm-card">
              <div class="cdm-card-title">Healing queue</div>
              <div class="cdm-card-body">
                <div>Eligible: <strong>${motor.healingEligibleCount}</strong></div>
                <div>Pending: <strong>${motor.healingPendingCount}</strong></div>
                <div>Ready: <strong>${motor.healingReadyCount}</strong></div>
              </div>
            </div>
            <div class="cdm-card">
              <div class="cdm-card-title">Priority signals</div>
              <div class="cdm-card-body">
                <div>P0 issues: <strong>${motor.p0Count}</strong></div>
                <div>P1 issues: <strong>${motor.p1Count}</strong></div>
                <div>High risk alerts: <strong>${motor.predictiveHighRiskAlerts}</strong></div>
              </div>
            </div>
          </div>

          <div class="cdm-actions">
            <button class="cdm-action" type="button" id="cdm-openPrompts2">Open prompts / healing</button>
            <button class="cdm-action-ghost" type="button" id="cdm-openFindings3">Open findings</button>
          </div>
        </div>
      `;
    }

    // delta-intelligence
    return `
      <div class="cdm-stage">
        <div class="cdm-stage-header">
          <h2>Delta Intelligence</h2>
          <span class="cdm-stage-chip" style="border-color:#F59E0B30; background:#F59E0B10; color:#FCD34D;">${motor.refLabel}</span>
        </div>

        <div class="cdm-delta-list">
          <div class="cdm-delta-item"><span class="cdm-delta-label">Issues</span><span class="cdm-delta-value">${motor.deltaIssues}</span></div>
          <div class="cdm-delta-item"><span class="cdm-delta-label">SEO</span><span class="cdm-delta-value">${motor.deltaSeo}</span></div>
          <div class="cdm-delta-item"><span class="cdm-delta-label">Risk</span><span class="cdm-delta-value">${motor.deltaRisk}</span></div>
          <div class="cdm-delta-item"><span class="cdm-delta-label">Routes/Actions</span><span class="cdm-delta-value">${motor.deltaRoutesActions}</span></div>
        </div>

        <div class="cdm-actions">
          <button class="cdm-action" type="button" id="cdm-openCompare">Open compare</button>
        </div>
      </div>
    `;
  }

  function bindStageActions() {
    const btnOpenPrompts = document.getElementById("cdm-openPrompts");
    if (btnOpenPrompts) {
      btnOpenPrompts.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("prompts"));
    }
    const btnOpenPrompts2 = document.getElementById("cdm-openPrompts2");
    if (btnOpenPrompts2) {
      btnOpenPrompts2.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("prompts"));
    }
    const btnOpenFindings = document.getElementById("cdm-openFindings");
    if (btnOpenFindings) {
      btnOpenFindings.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("findings"));
    }
    const btnOpenFindings2 = document.getElementById("cdm-openFindings2");
    if (btnOpenFindings2) {
      btnOpenFindings2.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("findings"));
    }
    const btnOpenFindings3 = document.getElementById("cdm-openFindings3");
    if (btnOpenFindings3) {
      btnOpenFindings3.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("findings"));
    }
    const btnOpenReports = document.getElementById("cdm-openReports");
    if (btnOpenReports) {
      btnOpenReports.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("reports"));
    }
    const btnOpenReportsRootCause = document.getElementById("cdm-openReportsRootCause");
    if (btnOpenReportsRootCause) {
      btnOpenReportsRootCause.addEventListener("click", () => {
        window.sitepulseRenderer?.switchView?.("reports");
        setTimeout(() => {
          const latest = document.getElementById("openLatestEvidence");
          if (latest) latest.click();
        }, 250);
      });
    }
    const btnOpenCompare = document.getElementById("cdm-openCompare");
    if (btnOpenCompare) {
      btnOpenCompare.addEventListener("click", () => window.sitepulseRenderer?.switchView?.("compare"));
    }
  }

  function bindRailEvents() {
    $$(".cdm-rail-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pattern = btn.getAttribute("data-pattern");
        if (!pattern) return;
        CDM_CONFIG.activePattern = pattern;
        renderOnce();
      });
    });
  }

  function injectStyles() {
    if (document.getElementById("cdm-inline-styles")) return;
    const style = document.createElement("style");
    style.id = "cdm-inline-styles";
    style.textContent = `
      .cdm-root { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
      .cdm-grid { display: grid; grid-template-columns: 280px 1fr; min-height: 600px; }
      @media (max-width: 1024px) { .cdm-grid { grid-template-columns: 1fr; } }
      .cdm-signal-strip { height: 48px; display:flex; align-items:center; justify-content:space-between; padding:0 20px; border-bottom:1px solid rgba(255,255,255,0.06); background: linear-gradient(to right, rgba(255,255,255,0.02), transparent); }
      .cdm-signal-left,.cdm-signal-right,.cdm-signal-center { display:flex; align-items:center; gap:16px; }
      .cdm-signal-center { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
      .cdm-runtime-dot { width: 8px; height: 8px; border-radius: 50%; }
      @keyframes cdm-dot-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.9);} }
      .cdm-confidence { display:flex; align-items:center; gap:6px; padding:4px 10px; border-radius:12px; background: rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); }
      .cdm-confidence-orb { width: 12px; height: 12px; border-radius: 50%; border: 2px solid; }
      .cdm-confidence-text { font-size: 11px; font-weight: 500; }
      .cdm-schema { font-size:10px; color:#5A6578; text-transform:uppercase; }
      .cdm-target { font-size:12px; color:#F0F4F8; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .cdm-run-badge { font-size:10px; color:#5A6578; }
      .cdm-impact { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 4px 10px; border-radius: 12px; border: 1px solid; }
      .cdm-rail { border-right:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.015); padding:16px; display:flex; flex-direction:column; gap:12px; }
      .cdm-rail-title { font-size:10px; text-transform:uppercase; letter-spacing:0.12em; color:#5A6578; }
      .cdm-rail-caps { display:flex; flex-direction:column; gap:8px; }
      .cdm-rail-btn { width:100%; display:flex; align-items:center; gap:10px; padding:12px; border-radius:16px; border:1px solid transparent; background: transparent; color: rgba(226,232,240,0.85); cursor:pointer; transition: background 0.16s ease, border-color 0.16s ease, transform 0.16s ease; text-align:left; }
      .cdm-rail-btn:hover { background: rgba(255,255,255,0.03); transform: translateY(-1px); }
      .cdm-rail-btn.active { border-color: rgba(91,140,255,0.6); background: rgba(91,140,255,0.08); color: #EAF2FF; }
      .cdm-rail-btn-dot { width: 10px; height: 10px; border-radius: 50%; }
      .cdm-rail-btn-label { font-size: 13px; font-weight: 600; }
      .cdm-rail-btn-badge { margin-left:auto; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid; }
      .cdm-rail-memory { margin-top:auto; padding-top:16px; border-top:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:6px; }
      .cdm-muted { font-size:10px; color:#5A6578; text-transform:uppercase; letter-spacing:0.08em; }
      .cdm-rail-memory-value { font-size:12px; color:#8B95A5; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
      .cdm-stage { padding:24px; background: linear-gradient(to bottom right, rgba(255,255,255,0.01), transparent); position:relative; overflow:hidden; }
      .cdm-stage-header { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.06); }
      .cdm-stage-header h2 { margin:0; font-size:20px; font-weight:700; color:#F0F4F8; }
      .cdm-stage-chip { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; padding:4px 10px; border-radius:12px; border:1px solid; font-weight:600; }
      .cdm-card-grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:20px; }
      @media (max-width: 1024px) { .cdm-card-grid { grid-template-columns: 1fr; } }
      .cdm-card { padding:16px; border-radius:16px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); }
      .cdm-card-title { font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color:#5A6578; margin-bottom:10px; }
      .cdm-card-body { font-size:13px; color:#8B95A5; display:flex; flex-direction:column; gap:8px; }
      .cdm-card-body strong { color:#F0F4F8; }
      .cdm-actions { display:flex; gap:12px; flex-wrap:wrap; }
      .cdm-action { padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.12); background: rgba(34,197,94,0.12); color:#A7F3D0; font-weight:600; cursor:pointer; }
      .cdm-action-ghost { padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color:#F0F4F8; font-weight:600; cursor:pointer; }
      .cdm-empty { padding:30px 0; display:flex; flex-direction:column; gap:12px; }
      .cdm-empty-title { font-size:14px; font-weight:700; color:#F0F4F8; }
      .cdm-empty-text { font-size:13px; color:#8B95A5; max-width:520px; }
      .cdm-delta-list { display:flex; flex-direction:column; gap:10px; }
      .cdm-delta-item { display:flex; justify-content:space-between; gap:16px; padding:12px 14px; border-radius:14px; border:1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); }
      .cdm-delta-label { font-size:11px; text-transform:uppercase; letter-spacing:0.12em; color:#5A6578; }
      .cdm-delta-value { font-size:13px; color:#F0F4F8; text-align:right; }
    `;
    document.head.appendChild(style);
  }

  function renderOnce() {
    const container = document.getElementById("workspaceShell");
    if (!container) return;
    const motor = readMotorFromShell();

    container.innerHTML = `
      <div class="cdm-root">
        ${renderSignalStrip(motor)}
        <div class="cdm-grid">
          ${renderPatternRail(motor)}
          ${renderStage(motor)}
        </div>
      </div>
    `;

    bindRailEvents();
    bindStageActions();
  }

  function init() {
    injectStyles();
    renderOnce();
    setInterval(() => {
      renderOnce();
    }, CDM_CONFIG.refreshIntervalMs);
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Se o renderer.js ainda não rodou, os data-shells continuam placeholders;
    // ainda assim o CDM renderiza (sem inventar).
    init();
  });
})();

