import { WorkspaceBase } from "../shared/workspace-base.js";

export class FindingsWorkspace extends WorkspaceBase {
  constructor(container, manager) {
    super(container, manager);
    this.expandedIssue = null;
    this.issues = [];
    this.filterSeverities = new Set(["P0", "P1"]);
  }

  getTemplate() {
    return `
      <div class="findings-workspace ws-page">
        <header class="ws-page-head">
          <div>
            <p class="ws-page-eyebrow">Analysis</p>
            <h1 class="ws-page-title">Findings Explorer</h1>
            <p class="ws-page-desc">Fila operacional e fila de issues — independente da sidebar do Control Center (validação de desacoplamento).</p>
          </div>
          <div class="ws-chip-row">
            <span class="ws-chip"><span class="ws-live-dot"></span><span data-shell="issuesMetric">—</span> issues</span>
            <span class="ws-chip" data-shell="runBadge">run</span>
          </div>
        </header>

        <div class="findings-explorer-layout">
          <aside class="findings-explorer-filters">
            <h2 class="ws-settings-h2">Priority</h2>
            <p class="ws-settings-lead">Filtrar a lista; o painel à direita segue o cartão seleccionado.</p>
            <div class="filter-chips findings-filter-chips" role="group" aria-label="Priority filters">
              <button type="button" class="filter-chip findings-filter" data-severity="P0">P0 Critical</button>
              <button type="button" class="filter-chip findings-filter" data-severity="P1">P1 High</button>
              <button type="button" class="filter-chip findings-filter" data-severity="P2">P2 Medium</button>
            </div>
            <div class="findings-queue-meta">
              <span class="muted">Context</span>
              <span class="font-mono truncate" data-shell="target">—</span>
            </div>
          </aside>

          <div class="findings-explorer-main">
            <div class="issues-list" id="issues-container"></div>
          </div>

          <aside class="findings-explorer-preview" id="findings-preview-panel" aria-label="Issue preview">
            <p class="ws-page-eyebrow">Preview</p>
            <h3 class="findings-preview-title" id="findings-preview-title">Select an issue</h3>
            <div class="findings-preview-body muted" id="findings-preview-body"></div>
            <div class="findings-preview-metrics" id="findings-preview-metrics"></div>
          </aside>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll(".findings-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sev = String(btn.dataset.severity || "").toUpperCase();
        if (this.filterSeverities.has(sev)) this.filterSeverities.delete(sev);
        else this.filterSeverities.add(sev);
        btn.classList.toggle("active", this.filterSeverities.has(sev));
        this.renderIssues();
        this.syncPreview();
      });
    });

    this.container.addEventListener("click", (e) => {
      const row = e.target.closest(".issue-card");
      if (row?.dataset?.issueId) {
        this.expandedIssue = row.dataset.issueId;
        this.syncPreview();
        this.renderIssues();
        return;
      }
      const expandBtn = e.target.closest(".issue-expand");
      if (expandBtn) {
        const card = expandBtn.closest(".issue-card");
        if (card?.dataset?.issueId) this.toggleIssue(card.dataset.issueId);
      }
      const actionBtn = e.target.closest("[data-action]");
      if (actionBtn) this.handleIssueAction(actionBtn.dataset.action, actionBtn.closest(".issue-card")?.dataset.issueId);
    });
  }

  buildIssueList() {
    const primaryRoute = this.data?.focusIssueRoute || "/";
    const primaryCode = this.data?.focusIssueCode || "ISSUE";
    const primarySeverity = String(this.data?.focusIssueSeverity || "P1").toUpperCase().includes("P0") ? "P0" : "P1";
    const primaryTitle = this.data?.focusIssueDiagnosisTitle || this.data?.focusIssueLaymanExplanation || "Operational issue requires attention";
    const secondaryTitle = this.data?.focusIssueTechnicalExplanation || "Technical verification recommended";
    return [
      {
        id: "ISS-PRIMARY",
        code: primaryCode,
        route: primaryRoute,
        title: primaryTitle,
        detail: this.data?.focusIssueRecommendedActions || "Validate route and apply targeted fix.",
        severity: primarySeverity,
      },
      {
        id: "ISS-SECONDARY",
        code: "RISK-TREND",
        route: this.data?.target || "/",
        title: secondaryTitle,
        detail: this.data?.predictiveChip || "Monitor regression risk and compare latest runs.",
        severity: "P1",
      },
    ];
  }

  getFilteredIssues() {
    return this.issues.filter((i) => this.filterSeverities.has(String(i.severity || "").toUpperCase()));
  }

  renderIssues() {
    const container = this.container.querySelector("#issues-container");
    if (!container) return;
    const list = this.getFilteredIssues();
    container.innerHTML = list
      .map(
        (issue) => `
          <div class="issue-card ${this.expandedIssue === issue.id ? "expanded" : "collapsed"} ${this.expandedIssue === issue.id ? "issue-card-selected" : ""}" data-issue-id="${issue.id}">
            <div class="issue-header">
              <div class="issue-priority ${issue.severity.toLowerCase()}">${issue.severity}</div>
              <h3 class="issue-title">${issue.title}</h3>
              <button class="issue-expand" type="button" aria-label="Expand">▼</button>
            </div>
            <div class="issue-body">
              <div class="pred-metric"><span class="pred-label">Code</span><span class="pred-value">${issue.code}</span></div>
              <div class="pred-metric"><span class="pred-label">Route</span><span class="pred-value">${issue.route}</span></div>
              <p class="issue-detail">${issue.detail}</p>
              <div class="issue-actions-bar">
                <button type="button" class="action-primary" data-action="heal">Auto-Heal</button>
                <button type="button" class="action-secondary" data-action="cdm">Open in CDM</button>
                <button type="button" class="action-secondary" data-action="compare">Compare</button>
              </div>
            </div>
          </div>
        `,
      )
      .join("");
    if (!list.length) {
      container.innerHTML = `<p class="muted findings-empty">No issues for the current filters.</p>`;
    }
  }

  syncPreview() {
    const titleEl = this.container.querySelector("#findings-preview-title");
    const bodyEl = this.container.querySelector("#findings-preview-body");
    const metricsEl = this.container.querySelector("#findings-preview-metrics");
    const issue = this.issues.find((i) => i.id === this.expandedIssue) || this.getFilteredIssues()[0];
    if (!issue) {
      if (titleEl) titleEl.textContent = "Select an issue";
      if (bodyEl) bodyEl.textContent = "";
      if (metricsEl) metricsEl.innerHTML = "";
      return;
    }
    if (titleEl) titleEl.textContent = issue.title;
    if (bodyEl) bodyEl.textContent = issue.detail;
    if (metricsEl) {
      metricsEl.innerHTML = `
        <div class="pred-metric"><span class="pred-label">Severity</span><span class="pred-value">${issue.severity}</span></div>
        <div class="pred-metric"><span class="pred-label">Code</span><span class="pred-value">${issue.code}</span></div>
        <div class="pred-metric"><span class="pred-label">Route</span><span class="pred-value">${issue.route}</span></div>
      `;
    }
  }

  toggleIssue(issueId) {
    const card = this.container.querySelector(`[data-issue-id="${issueId}"]`);
    if (!card) return;
    const isExpanded = card.classList.contains("expanded");
    card.classList.toggle("expanded", !isExpanded);
    card.classList.toggle("collapsed", isExpanded);
    this.expandedIssue = isExpanded ? null : issueId;
    this.syncPreview();
  }

  handleIssueAction(action, issueId) {
    if (action === "heal") {
      window.dispatchEvent(new CustomEvent("healing-requested", { detail: { issueId } }));
    }
    if (action === "cdm") {
      if (this.manager) this.manager.switchTo("operator");
      window.dispatchEvent(new CustomEvent("cdm-focus-issue", { detail: { issueId } }));
    }
    if (action === "compare") {
      if (this.manager) this.manager.switchTo("compare");
    }
  }

  render() {
    this.issues = this.buildIssueList();
    this.container.querySelectorAll(".findings-filter").forEach((btn) => {
      const sev = String(btn.dataset.severity || "").toUpperCase();
      btn.classList.toggle("active", this.filterSeverities.has(sev));
    });
    if (!this.expandedIssue && this.issues[0]) this.expandedIssue = this.issues[0].id;
    this.renderIssues();
    this.syncPreview();

    const fromMain = (key) => {
      const src = document.querySelector(`#mainGrid [data-shell="${key}"]`) || document.querySelector(`[data-shell="${key}"]`);
      return src ? String(src.textContent || "").trim() : "";
    };
    ["issuesMetric", "runBadge", "target"].forEach((key) => {
      const el = this.container.querySelector(`[data-shell="${key}"]`);
      if (!el) return;
      const v = fromMain(key) || this.data?.[key] || "—";
      el.textContent = v || "—";
    });
  }
}
