import { WorkspaceBase } from "../shared/workspace-base.js";

export class SEOWorkspace extends WorkspaceBase {
  getTemplate() {
    return `
      <div class="seo-workspace">
        <header class="ws-header">
          <div class="ws-header-main">
            <h1 class="ws-title">SEO Intelligence</h1>
            <p class="ws-subtitle">Visibility, indexing and search performance</p>
          </div>
          <div class="ws-header-meta">
            <span class="seo-score"><span class="score-value" data-shell="qualityScore">0</span> <span class="score-label">Health Score</span></span>
          </div>
        </header>
        <div class="seo-grid">
          <section class="seo-card">
            <h3>Visibility Health</h3>
            <div class="pred-metric"><span class="pred-label">Trajectory</span><span class="pred-value" data-shell="qualityTrajectory">stable</span></div>
            <div class="pred-metric"><span class="pred-label">Quality</span><span class="pred-value" data-shell="qualityScore">0</span></div>
          </section>
          <section class="seo-card">
            <h3>Indexing Status</h3>
            <div class="pred-metric"><span class="pred-label">Issues</span><span class="pred-value" data-shell="issuesMetric">0</span></div>
            <div class="pred-metric"><span class="pred-label">P0/P1</span><span class="pred-value" data-shell="p0p1">0</span></div>
          </section>
          <section class="seo-card">
            <h3>Critical SEO Issues</h3>
            <div class="pred-metric"><span class="pred-label">Focus Code</span><span class="pred-value" data-shell="focusIssueCode">—</span></div>
            <div class="pred-metric"><span class="pred-label">Route</span><span class="pred-value" data-shell="focusIssueRoute">—</span></div>
            <button class="action-btn secondary" data-nav="findings">Open in Findings</button>
          </section>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll("[data-nav='findings']").forEach((item) => {
      item.addEventListener("click", () => this.manager.switchTo("findings"));
    });
  }

  render() {
    const scoreEl = this.container.querySelector(".score-value");
    const score = parseInt(String(this.data?.qualityScore || "0"), 10);
    if (!scoreEl || Number.isNaN(score)) return;
    scoreEl.textContent = String(score);
    scoreEl.style.color = score > 80 ? "#22C55E" : score > 60 ? "#F59E0B" : "#EF4444";
  }
}
