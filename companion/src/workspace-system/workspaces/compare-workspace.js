import { WorkspaceBase } from "../shared/workspace-base.js";

export class CompareWorkspace extends WorkspaceBase {q
  getTemplate() {
    return `
      <div class="compare-workspace">
        <header class="ws-header">
          <div class="ws-header-main">
            <h1 class="ws-title">Delta Intelligence</h1>
            <p class="ws-subtitle">Comparative analysis and regression detection</p>
            <div class="ws-chip-row">
              <span class="ws-chip"><span class="ws-live-dot"></span>Engine live</span>
              <span class="ws-chip" data-shell="modeChip">Mode: desktop</span>
              <span class="ws-chip" data-shell="predictiveChip">Predictive watching</span>
            </div>
          </div>
        </header>
        <section class="delta-summary">
          <div class="delta-card improvement"><div class="delta-info"><span class="delta-value" data-delta-improvements>+0</span><span class="delta-label">Improvements</span></div></div>
          <div class="delta-card regression"><div class="delta-info"><span class="delta-value" data-delta-regressions>-0</span><span class="delta-label">Regressions</span></div></div>
        </section>
        <div class="compare-layout">
          <section class="timeline-section">
            <div class="section-header">
              <h3>Change Timeline</h3>
              <div class="timeline-filters">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="regressions">Regressions</button>
                <button class="filter-btn" data-filter="improvements">Improvements</button>
              </div>
            </div>
            <div class="timeline">
              <div class="timeline-item regression" data-kind="regressions"><div class="timeline-content"><h4>Route quality degraded</h4><p data-shell="stickyDeltaRisk">—</p></div></div>
              <div class="timeline-item improvement" data-kind="improvements"><div class="timeline-content"><h4>SEO delta improved</h4><p data-shell="stickyDeltaSeo">—</p></div></div>
            </div>
          </section>
          <aside class="breakdown-section">
            <div class="breakdown-card">
              <h4>By Category</h4>
              <div class="pred-metric"><span class="pred-label">Routes/Actions Delta</span><span class="pred-value" data-shell="stickyCompareRoutesActions">—</span></div>
              <div class="pred-metric"><span class="pred-label">Issue Delta</span><span class="pred-value" data-shell="stickyDeltaIssues">—</span></div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.container.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.container.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        e.currentTarget.classList.add("active");
        const mode = e.currentTarget.getAttribute("data-filter");
        this.container.querySelectorAll(".timeline-item").forEach((item) => {
          if (mode === "all") item.style.display = "";
          else item.style.display = item.getAttribute("data-kind") === mode ? "" : "none";
        });
      });
    });
  }

  render() {
    const p0p1 = Number(this.data?.p0p1 || 0);
    const predictive = Number(this.data?.predictiveHero || 0);
    const improvementsEl = this.container.querySelector("[data-delta-improvements]");
    const regressionsEl = this.container.querySelector("[data-delta-regressions]");
    if (improvementsEl) improvementsEl.textContent = `+${Math.max(0, 12 - p0p1)}`;
    if (regressionsEl) regressionsEl.textContent = `-${Math.max(0, predictive)}`;
  }
}
