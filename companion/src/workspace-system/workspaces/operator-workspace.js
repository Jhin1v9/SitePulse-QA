import { WorkspaceBase } from "../shared/workspace-base.js";
import { CDMAdapter } from "../integrations/cdm-adapter.js";

export class OperatorWorkspace extends WorkspaceBase {
  constructor(container, manager) {
    super(container, manager);
    this.cdm = null;
    this.activePattern = "strategic-triage";
  }

  getTemplate() {
    return `
      <div class="operator-workspace">
        <header class="ws-header">
          <div class="ws-header-main">
            <h1 class="ws-title">Operator Intelligence</h1>
            <p class="ws-subtitle">AI-driven analysis and execution workspace</p>
          </div>
          <div class="ws-header-meta">
            <span class="ws-badge mode">Cognitive Mode</span>
            <span class="ws-badge confidence" data-shell="qualityScore">--%</span>
          </div>
        </header>
        <div class="operator-layout">
          <section class="operator-main">
            <div class="cdm-container" id="cdm-operator"></div>
          </section>
          <aside class="operator-context">
            <div class="context-panel">
              <div class="panel-header"><h3>Predictive Intelligence</h3><span class="panel-status watching">Watching</span></div>
              <div class="pred-metric"><span class="pred-label">High/Critical Alerts</span><span class="pred-value" data-shell="predictiveHero">0</span></div>
              <div class="pred-metric"><span class="pred-label">Recurring Patterns</span><span class="pred-value" data-shell="systemStateMemory">0</span></div>
              <div class="pred-metric"><span class="pred-label">Trajectory</span><span class="pred-value" data-shell="qualityTrajectory">stable</span></div>
            </div>
            <div class="context-panel">
              <div class="panel-header"><h3>Self-Healing</h3><span class="panel-status pending">Pending</span></div>
              <div class="heal-stat"><span class="heal-label">Eligible</span><span class="heal-value" data-shell="healingCount">0</span></div>
              <div class="heal-stat"><span class="heal-label">Ready</span><span class="heal-value ready" data-shell="systemStateHealingReady">0</span></div>
              <div class="heal-stat"><span class="heal-label">Pending Validation</span><span class="heal-value" data-shell="healingPending">0</span></div>
              <div class="healing-actions">
                <button class="action-btn primary" id="heal-prepare">Prepare Healing</button>
                <button class="action-btn secondary" id="open-findings">Open Findings</button>
              </div>
            </div>
            <div class="context-panel">
              <div class="panel-header"><h3>Operational Context</h3></div>
              <div class="pred-metric"><span class="pred-label">Target</span><span class="pred-value" data-shell="target">—</span></div>
              <div class="pred-metric"><span class="pred-label">Run</span><span class="pred-value" data-shell="runBadge">—</span></div>
              <div class="pred-metric"><span class="pred-label">P0/P1</span><span class="pred-value" data-shell="p0p1">0</span></div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  async mount() {
    await super.mount();
    this.cdm = new CDMAdapter({
      container: this.container.querySelector("#cdm-operator"),
      onPatternChange: (pattern) => {
        this.activePattern = pattern;
      },
    });
    await this.cdm.init();
  }

  onActivate() {
    super.onActivate();
    this.cdm?.refresh();
  }

  bindEvents() {
    const healPrepare = this.container.querySelector("#heal-prepare");
    if (healPrepare) {
      healPrepare.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("healing-requested"));
      });
    }
    const openFindings = this.container.querySelector("#open-findings");
    if (openFindings) {
      openFindings.addEventListener("click", () => this.manager.switchTo("findings"));
    }
  }

  render() {
    const confidenceBadge = this.container.querySelector(".ws-badge.confidence");
    const score = parseInt(String(this.data?.qualityScore || "0"), 10);
    if (!confidenceBadge || Number.isNaN(score)) return;
    confidenceBadge.textContent = `${score}% conf`;
    confidenceBadge.style.color = score > 70 ? "#22C55E" : score > 50 ? "#5B8CFF" : "#F59E0B";
  }
}
