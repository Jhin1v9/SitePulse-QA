/**
 * WORKSPACE MANAGER - Sistema de Workspaces Independentes
 *
 * Sidebar = navegacao global (estado visual).
 * Workspace = experiencia independente e detalhada.
 *
 * NUNCA espelha conteudo da sidebar no workspace.
 */

const WORKSPACE_REGISTRY = {
  operator: {
    id: "operator",
    label: "Operator",
    description: "AI workspace and command execution",
    hasCDM: true,
    defaultPattern: "strategic-triage",
  },
  findings: {
    id: "findings",
    label: "Findings",
    description: "Priority queue and issue detail",
    hasCDM: false,
    layout: "issue-explorer",
  },
  seo: {
    id: "seo",
    label: "SEO",
    description: "Visibility, metadata, indexing",
    hasCDM: false,
    layout: "seo-dashboard",
  },
  compare: {
    id: "compare",
    label: "Compare",
    description: "Regression and baseline diff",
    hasCDM: false,
    layout: "delta-analyzer",
  },
};

function shellText(key, fallback = "—") {
  const el = document.querySelector(`[data-shell="${key}"]`);
  const value = String(el?.textContent || "").trim();
  return value || fallback;
}

export class WorkspaceManager {
  constructor() {
    this.activeWorkspace = "";
    this.workspaceHistory = [];
    this.containers = new Map();
    this.host = null;
    this.initialized = false;
  }

  init(defaultWorkspace = "operator") {
    if (this.initialized) return this;
    this.injectStyles();
    this.host = document.getElementById("workspace-area")
      || document.getElementById("workspace-host")
      || this.createWorkspaceHost();

    this.bindSidebarEvents();
    this.bindKeyboardShortcuts();
    this.bindDataUpdates();
    this.ensureContainer("operator");
    this.switchTo(defaultWorkspace);
    this.initialized = true;
    return this;
  }

  createWorkspaceHost() {
    const host = document.createElement("main");
    host.id = "workspace-area";
    host.className = "workspace-host";
    const mainGrid = document.getElementById("mainGrid");
    if (mainGrid?.parentNode) {
      mainGrid.classList.add("hidden");
      mainGrid.parentNode.insertBefore(host, mainGrid);
    } else {
      document.body.appendChild(host);
    }
    return host;
  }

  ensureContainer(workspaceId) {
    if (this.containers.has(workspaceId)) return this.containers.get(workspaceId);
    const container = document.createElement("section");
    container.id = `workspace-${workspaceId}`;
    container.className = "workspace-container";
    container.dataset.workspace = workspaceId;
    container.style.display = "none";
    container.style.opacity = "0";
    container.style.transform = "translateY(10px)";
    this.host.appendChild(container);
    this.containers.set(workspaceId, container);
    return container;
  }

  switchTo(rawId) {
    const workspaceId = rawId === "overview" ? "operator" : String(rawId || "").toLowerCase();
    if (!WORKSPACE_REGISTRY[workspaceId]) return;
    if (workspaceId === this.activeWorkspace) return;

    const previous = this.activeWorkspace || null;
    const nextContainer = this.ensureContainer(workspaceId);
    const currentContainer = previous ? this.containers.get(previous) : null;

    if (currentContainer) {
      currentContainer.style.transition = "opacity 250ms ease, transform 250ms ease";
      currentContainer.style.opacity = "0";
      currentContainer.style.transform = "translateY(-8px)";
      window.setTimeout(() => {
        currentContainer.style.display = "none";
      }, 250);
    }

    if (!nextContainer.hasChildNodes()) {
      this.renderWorkspaceContent(workspaceId, nextContainer, WORKSPACE_REGISTRY[workspaceId]);
    }

    nextContainer.style.display = "block";
    nextContainer.style.transition = "opacity 250ms ease, transform 250ms ease";
    requestAnimationFrame(() => {
      nextContainer.style.opacity = "1";
      nextContainer.style.transform = "translateY(0)";
    });

    this.updateSidebarActiveState(workspaceId);
    this.workspaceHistory.push({ from: previous, to: workspaceId, timestamp: Date.now() });
    this.activeWorkspace = workspaceId;

    window.dispatchEvent(new CustomEvent("workspace-changed", {
      detail: { workspace: workspaceId, config: WORKSPACE_REGISTRY[workspaceId], from: previous },
    }));
  }

  updateActiveWorkspace() {
    if (!this.activeWorkspace) return;
    const container = this.containers.get(this.activeWorkspace);
    if (!container) return;
    const scroll = container.scrollTop;
    this.renderWorkspaceContent(this.activeWorkspace, container, WORKSPACE_REGISTRY[this.activeWorkspace]);
    container.scrollTop = scroll;
  }

  bindDataUpdates() {
    window.addEventListener("data-bridge-updated", () => this.updateActiveWorkspace());
    window.addEventListener("motor-data-updated", () => this.updateActiveWorkspace());
    window.setInterval(() => this.updateActiveWorkspace(), 2000);
  }

  bindSidebarEvents() {
    const buttons = document.querySelectorAll("[data-view], .workspace-nav .nav-item");
    buttons.forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const view = String(btn.getAttribute("data-view") || "").toLowerCase();
        if (!view) return;
        const target = view === "overview" ? "operator" : view;
        if (!WORKSPACE_REGISTRY[target]) return;
        event.preventDefault();
        event.stopPropagation();
        this.switchTo(target);
      });
    });
  }

  bindKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      if (!event.altKey) return;
      if (event.key === "1") this.switchTo("operator");
      if (event.key === "2") this.switchTo("findings");
      if (event.key === "3") this.switchTo("seo");
      if (event.key === "4") this.switchTo("compare");
    });
  }

  updateSidebarActiveState(activeId) {
    document.querySelectorAll("[data-view], .workspace-nav .nav-item").forEach((btn) => {
      const raw = String(btn.getAttribute("data-view") || "").toLowerCase();
      const view = raw === "overview" ? "operator" : raw;
      btn.classList.toggle("active", view === activeId);
    });
  }

  renderWorkspaceContent(workspaceId, container, config) {
    if (workspaceId === "operator") this.renderOperatorWorkspace(container, config);
    if (workspaceId === "findings") this.renderFindingsWorkspace(container, config);
    if (workspaceId === "seo") this.renderSEOWorkspace(container, config);
    if (workspaceId === "compare") this.renderCompareWorkspace(container, config);
  }

  renderOperatorWorkspace(container) {
    container.innerHTML = `
      <div class="operator-workspace">
        <header class="workspace-header">
          <div class="workspace-title">
            <h1>Operator Intelligence</h1>
            <p>AI-driven analysis and execution workspace</p>
          </div>
          <div class="workspace-meta">
            <span class="mode-badge">Cognitive Mode</span>
            <span class="confidence-indicator">${shellText("qualityScore", "0")}% conf</span>
          </div>
        </header>
        <div class="operator-grid">
          <div class="cdm-section">
            <div id="cdm-root-operator"></div>
          </div>
          <aside class="context-panel">
            <div class="context-section">
              <h3>Predictive Intelligence</h3>
              <div class="pred-card"><span>High/Critical Alerts</span><strong>${shellText("predictiveHero", "0")}</strong></div>
              <div class="pred-card"><span>Trajectory</span><strong>${shellText("qualityTrajectory", "stable")}</strong></div>
              <div class="pred-card"><span>Recurring Patterns</span><strong>${shellText("systemStateMemory", "0")}</strong></div>
            </div>
            <div class="context-section">
              <h3>Self-Healing Status</h3>
              <div class="heal-row"><span>Eligible</span><strong>${shellText("healingCount", "0")}</strong></div>
              <div class="heal-row"><span>Pending</span><strong>${shellText("healingPending", "0")}</strong></div>
              <div class="heal-row"><span>Ready</span><strong>${shellText("systemStateHealingReady", "0")}</strong></div>
              <div class="ctx-actions">
                <button type="button" class="ctx-btn" data-open-findings>Open Findings</button>
                <button type="button" class="ctx-btn primary" data-open-compare>Open Compare</button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;

    container.querySelector("[data-open-findings]")?.addEventListener("click", () => this.switchTo("findings"));
    container.querySelector("[data-open-compare]")?.addEventListener("click", () => this.switchTo("compare"));

    const cdmRoot = container.querySelector("#cdm-root-operator");
    if (cdmRoot) {
      if (window.CDM?.init && typeof window.CDM.init === "function") {
        window.CDM.init("#cdm-root-operator");
      } else {
        cdmRoot.innerHTML = `
          <div class="cdm-fallback">
            <h3>Cognitive Delivery Matrix</h3>
            <p>CDM global nao encontrado. Fallback ativo.</p>
            <ul>
              <li>Strategic Triage</li>
              <li>Root Cause</li>
              <li>Visual Evidence</li>
              <li>Execution Protocol</li>
              <li>Delta Intelligence</li>
            </ul>
          </div>
        `;
      }
    }
  }

  renderFindingsWorkspace(container) {
    const focusTitle = shellText("focusIssueDiagnosisTitle", "Operational issue requires attention");
    const focusRoute = shellText("focusIssueRoute", "/");
    const focusCode = shellText("focusIssueCode", "ISSUE");
    const focusAction = shellText("focusIssueAction", "review");
    const focusSeverity = shellText("focusIssueSeverity", "P1");
    const focusRec = shellText("focusIssueRecommendedActions", "Validate route and apply targeted fix.");

    container.innerHTML = `
      <div class="findings-workspace">
        <header class="workspace-header">
          <div class="workspace-title">
            <h1>Findings Explorer</h1>
            <p>Deep issue analysis and operational queue</p>
          </div>
          <div class="workspace-actions">
            <button class="action-btn" data-filter="p0">P0 Only</button>
            <button class="action-btn" data-filter="healing">Healing Ready</button>
            <button class="action-btn" data-filter="memory">With Memory</button>
          </div>
        </header>
        <div class="findings-layout">
          <aside class="findings-filters">
            <div class="filter-group">
              <h4>Priority</h4>
              <label><input type="checkbox" checked> P0 Critical</label>
              <label><input type="checkbox" checked> P1 High</label>
              <label><input type="checkbox"> P2 Medium</label>
            </div>
            <div class="filter-group">
              <h4>Intelligence</h4>
              <label><input type="checkbox"> Predictive Risk</label>
              <label><input type="checkbox"> Healing Eligible</label>
              <label><input type="checkbox"> Validated Memory</label>
            </div>
          </aside>
          <main class="findings-list">
            <article class="issue-card expanded">
              <div class="issue-header">
                <span class="issue-priority ${String(focusSeverity).toLowerCase().includes("p0") ? "p0" : "p1"}">${focusSeverity}</span>
                <h3 class="issue-title">${focusTitle}</h3>
                <div class="issue-badges">
                  <span class="badge healing">Healing ${shellText("healingCount", "0")}</span>
                  <span class="badge memory">Memory ${shellText("systemStateMemory", "0")}</span>
                </div>
              </div>
              <div class="issue-preview">
                <section class="preview-section">
                  <h4>Technical Context</h4>
                  <code class="code-block">${focusCode} @ ${focusRoute}</code>
                  <p>${shellText("focusIssueTechnicalExplanation", "Technical verification required.")}</p>
                </section>
                <section class="preview-section">
                  <h4>Impact Analysis</h4>
                  <div class="impact-metrics">
                    <div class="metric"><span>Priority</span><strong>${focusSeverity}</strong></div>
                    <div class="metric"><span>Action</span><strong>${focusAction}</strong></div>
                    <div class="metric"><span>P0/P1</span><strong>${shellText("p0p1", "0")}</strong></div>
                  </div>
                </section>
                <section class="preview-section">
                  <h4>Recommended Resolution</h4>
                  <p>${focusRec}</p>
                </section>
              </div>
              <div class="issue-actions">
                <button class="action-primary" type="button" data-open-operator>Open in CDM</button>
                <button class="action-secondary" type="button" data-open-compare>Compare Delta</button>
              </div>
            </article>
          </main>
        </div>
      </div>
    `;

    container.querySelector("[data-open-operator]")?.addEventListener("click", () => this.switchTo("operator"));
    container.querySelector("[data-open-compare]")?.addEventListener("click", () => this.switchTo("compare"));
  }

  renderSEOWorkspace(container) {
    container.innerHTML = `
      <div class="seo-workspace">
        <header class="workspace-header">
          <div class="workspace-title">
            <h1>SEO Intelligence</h1>
            <p>Visibility, indexing and search performance</p>
          </div>
        </header>
        <div class="seo-grid">
          <section class="seo-card">
            <h3>Visibility Health</h3>
            <div class="radar-placeholder">
              <div class="radar-metric"><span>SEO Score</span><strong>${shellText("qualityScore", "0")}</strong></div>
              <div class="radar-metric"><span>Trajectory</span><strong>${shellText("qualityTrajectory", "stable")}</strong></div>
            </div>
          </section>
          <section class="seo-card">
            <h3>Indexing Status</h3>
            <div class="stat-row"><span>Issues</span><strong>${shellText("issuesMetric", "0")}</strong></div>
            <div class="stat-row"><span>P0/P1</span><strong>${shellText("p0p1", "0")}</strong></div>
            <div class="stat-row"><span>Target</span><strong>${shellText("target", "—")}</strong></div>
          </section>
          <section class="seo-card">
            <h3>Critical SEO Issues</h3>
            <div class="seo-issue-card"><span>Focus Code</span><strong>${shellText("focusIssueCode", "—")}</strong></div>
            <div class="seo-issue-card"><span>Route</span><strong>${shellText("focusIssueRoute", "—")}</strong></div>
            <button type="button" class="ctx-btn" data-go-findings>Open Findings</button>
          </section>
        </div>
      </div>
    `;
    container.querySelector("[data-go-findings]")?.addEventListener("click", () => this.switchTo("findings"));
  }

  renderCompareWorkspace(container) {
    container.innerHTML = `
      <div class="compare-workspace">
        <header class="workspace-header">
          <div class="workspace-title">
            <h1>Delta Intelligence</h1>
            <p>Comparative analysis and regression detection</p>
          </div>
          <div class="compare-selector">
            <select class="compare-select">
              <option>Current vs Previous Run</option>
              <option>Current vs Baseline</option>
              <option>Custom Comparison...</option>
            </select>
          </div>
        </header>
        <div class="delta-summary">
          <div class="delta-card improvement"><span class="delta-icon">↑</span><div><strong class="delta-value">${shellText("stickyDeltaSeo", "+0")}</strong><span class="delta-label">SEO Delta</span></div></div>
          <div class="delta-card regression"><span class="delta-icon">↓</span><div><strong class="delta-value">${shellText("stickyDeltaRisk", "-0")}</strong><span class="delta-label">Risk Delta</span></div></div>
          <div class="delta-card neutral"><span class="delta-icon">⇄</span><div><strong class="delta-value">${shellText("stickyDeltaIssues", "0")}</strong><span class="delta-label">Issue Delta</span></div></div>
        </div>
        <section class="delta-timeline">
          <h3>Change Timeline</h3>
          <div class="timeline-item regression"><time>Current</time><span>Risk signal: ${shellText("predictiveChip", "predictive")}</span><span class="severity">${shellText("focusIssueSeverity", "P1")}</span></div>
          <div class="timeline-item improvement"><time>Current</time><span>Route/Action: ${shellText("stickyCompareRoutesActions", "—")}</span><span class="severity">${shellText("modeChip", "desktop")}</span></div>
        </section>
      </div>
    `;
  }

  injectStyles() {
    if (document.getElementById("workspace-manager-styles")) return;
    const style = document.createElement("style");
    style.id = "workspace-manager-styles";
    style.textContent = `
      .workspace-host { position: relative; flex: 1; overflow: hidden; background: #0f1622; }
      .workspace-container { position: absolute; inset: 0; overflow-y: auto; padding: 24px 32px; background: #0f1622; font-family: "Segoe UI Variable Text", "Segoe UI", sans-serif; }
      .workspace-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,.08); }
      .workspace-title h1 { margin: 0 0 6px; color: #f0f4f8; font-size: 30px; letter-spacing: -.02em; }
      .workspace-title p { margin: 0; color: #8b95a5; font-size: 13px; }
      .mode-badge,.confidence-indicator { padding: 6px 10px; border-radius: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
      .mode-badge { border: 1px solid rgba(88,166,255,.25); background: rgba(88,166,255,.12); color: #58a6ff; }
      .confidence-indicator { border: 1px solid rgba(34,197,94,.25); background: rgba(34,197,94,.12); color: #22c55e; margin-left: 8px; display: inline-block; }
      .operator-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
      .cdm-section,.context-section,.findings-filters,.issue-card,.seo-card,.delta-card,.delta-timeline { border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: rgba(255,255,255,.02); }
      .context-panel { display: flex; flex-direction: column; gap: 12px; }
      .context-section { padding: 14px; }
      .context-section h3 { margin: 0 0 10px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8b95a5; }
      .pred-card,.heal-row,.stat-row,.seo-issue-card,.metric,.radar-metric { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 12px; color: #cbd5e1; }
      .pred-card strong,.heal-row strong,.stat-row strong,.seo-issue-card strong,.metric strong,.radar-metric strong { color: #f0f4f8; }
      .pred-card:last-child,.heal-row:last-child,.stat-row:last-child,.seo-issue-card:last-child,.metric:last-child,.radar-metric:last-child { border-bottom: none; }
      .ctx-actions { display: flex; gap: 8px; margin-top: 10px; }
      .ctx-btn,.action-btn,.action-primary,.action-secondary,.action-tertiary { border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.04); color: #d9e2ec; border-radius: 10px; padding: 8px 10px; cursor: pointer; font-size: 12px; }
      .ctx-btn.primary,.action-primary { border-color: rgba(88,166,255,.35); background: rgba(88,166,255,.16); color: #58a6ff; }
      .findings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 20px; }
      .findings-filters { padding: 14px; height: fit-content; }
      .filter-group { margin-bottom: 16px; }
      .filter-group h4 { margin: 0 0 8px; font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #8b95a5; }
      .filter-group label { display: block; font-size: 12px; color: #cbd5e1; margin-bottom: 6px; }
      .issue-card { padding: 16px; }
      .issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
      .issue-priority { padding: 4px 8px; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
      .issue-priority.p0 { color: #ef4444; background: rgba(239,68,68,.16); }
      .issue-priority.p1 { color: #f59e0b; background: rgba(245,158,11,.16); }
      .issue-title { margin: 0; color: #f0f4f8; font-size: 16px; flex: 1; }
      .issue-badges { display: flex; gap: 6px; }
      .badge { padding: 3px 8px; border-radius: 999px; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
      .badge.healing { color: #22c55e; background: rgba(34,197,94,.16); }
      .badge.memory { color: #a855f7; background: rgba(168,85,247,.16); }
      .issue-preview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
      .preview-section { border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 10px; background: rgba(0,0,0,.2); }
      .preview-section h4 { margin: 0 0 8px; color: #8b95a5; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
      .preview-section p { margin: 0; color: #cbd5e1; font-size: 12px; }
      .code-block { display: block; margin: 0 0 8px; background: rgba(0,0,0,.35); border-radius: 8px; padding: 8px; color: #79c0ff; font-size: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace; }
      .issue-actions { display: flex; gap: 8px; }
      .seo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      .seo-card { padding: 14px; }
      .seo-card h3 { margin: 0 0 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #8b95a5; }
      .delta-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 14px; }
      .delta-card { padding: 12px; display: flex; align-items: center; gap: 10px; }
      .delta-card.improvement { border-color: rgba(34,197,94,.3); background: rgba(34,197,94,.12); }
      .delta-card.regression { border-color: rgba(239,68,68,.3); background: rgba(239,68,68,.12); }
      .delta-card.neutral { border-color: rgba(88,166,255,.3); background: rgba(88,166,255,.12); }
      .delta-icon { font-size: 20px; color: #cbd5e1; }
      .delta-value { display: block; color: #f0f4f8; font-size: 22px; font-weight: 700; }
      .delta-label { display: block; color: #8b95a5; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
      .delta-timeline { padding: 14px; }
      .delta-timeline h3 { margin: 0 0 10px; color: #f0f4f8; font-size: 14px; }
      .timeline-item { display: grid; grid-template-columns: 90px 1fr auto; gap: 10px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.06); font-size: 12px; color: #cbd5e1; }
      .timeline-item:last-child { border-bottom: none; }
      .timeline-item time { color: #8b95a5; }
      .severity { padding: 2px 8px; border-radius: 999px; background: rgba(255,255,255,.08); font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
      @media (max-width: 1200px) {
        .operator-grid,.findings-layout,.seo-grid,.issue-preview,.delta-summary { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }
}

export function createWorkspaceManager() {
  const manager = new WorkspaceManager();
  window.workspaceManager = manager;
  return manager;
}
