export class CDMAdapter {
  constructor(options = {}) {
    this.container = options.container;
    this.onPatternChange = options.onPatternChange || (() => {});
    this.patterns = ["strategic-triage", "root-cause", "visual-evidence", "execution-protocol", "delta-intelligence"];
    this.activePattern = "strategic-triage";
    this.syncingFromGlobal = false;
  }

  async init() {
    if (!this.container) return;
    const globalCdm = this.resolveGlobalCDM();
    if (globalCdm) {
      this.bindToGlobalCDM(globalCdm);
      return;
    }
    this.renderStandalone();
  }

  resolveGlobalCDM() {
    if (window.CDM && typeof window.CDM === "object") return window.CDM;
    if (window.cdm && typeof window.cdm === "object") return window.cdm;
    if (window.App?.CDM && typeof window.App.CDM === "object") return window.App.CDM;
    if (window.cognitiveMatrix && typeof window.cognitiveMatrix === "object") return window.cognitiveMatrix;
    const candidateKey = Object.keys(window).find((k) => /cdm|cognitive|matrix/i.test(k));
    if (candidateKey && typeof window[candidateKey] === "object") return window[candidateKey];
    return null;
  }

  bindToGlobalCDM(cdmInstance) {
    this.container.innerHTML = `
      <div class="cdm-embedded">
        <div class="cdm-rail">
          ${this.patterns
            .map((p) => `<button class="cdm-pattern-btn ${p === this.activePattern ? "active" : ""}" data-pattern="${p}">${this.getPatternLabel(p)}</button>`)
            .join("")}
        </div>
        <div class="cdm-stage">
          <div class="cdm-stage-content" data-pattern="${this.activePattern}">
            <div class="pattern-content">
              <h3>${this.getPatternLabel(this.activePattern)}</h3>
              <p>Bound to global CDM runtime.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    this.bindEvents();

    const methods = ["switchPattern", "setPattern", "openPattern"];
    const switcher = methods.find((m) => typeof cdmInstance[m] === "function");
    if (!switcher) return;
    const original = cdmInstance[switcher].bind(cdmInstance);
    cdmInstance[switcher] = (pattern, ...rest) => {
      const result = original(pattern, ...rest);
      if (this.patterns.includes(pattern)) {
        this.syncingFromGlobal = true;
        this.setPattern(pattern);
        this.syncingFromGlobal = false;
      }
      return result;
    };
  }

  renderStandalone() {
    this.container.innerHTML = `
      <div class="cdm-embedded">
        <div class="cdm-rail">
          ${this.patterns.map((p) => `<button class="cdm-pattern-btn ${p === this.activePattern ? "active" : ""}" data-pattern="${p}">${this.getPatternLabel(p)}</button>`).join("")}
        </div>
        <div class="cdm-stage"><div class="cdm-stage-content" data-pattern="${this.activePattern}">${this.renderPatternContent(this.activePattern)}</div></div>
      </div>
    `;
    this.bindEvents();
  }

  getPatternLabel(pattern) {
    const labels = {
      "strategic-triage": "Strategic Triage",
      "root-cause": "Root Cause",
      "visual-evidence": "Visual Evidence",
      "execution-protocol": "Execution",
      "delta-intelligence": "Delta",
    };
    return labels[pattern] || pattern;
  }

  renderPatternContent(pattern) {
    const base = {
      "strategic-triage": {
        title: "Strategic Triage",
        body: "Prioritize by P0/P1 pressure, predictive risk and operational impact.",
      },
      "root-cause": {
        title: "Root Cause",
        body: "Inspect technical checks, probable causes and route-level context from data-shell.",
      },
      "visual-evidence": {
        title: "Visual Evidence",
        body: "Correlate screenshot evidence and finding detail before deciding fix strategy.",
      },
      "execution-protocol": {
        title: "Execution Protocol",
        body: "Sequence actions: prepare healing, apply fix, revalidate and compare deltas.",
      },
      "delta-intelligence": {
        title: "Delta Intelligence",
        body: "Track issues/SEO/risk deltas across runs and detect regressions early.",
      },
    }[pattern] || { title: this.getPatternLabel(pattern), body: "Operational mode." };
    return `<div class="pattern-content"><h3>${base.title}</h3><p>${base.body}</p></div>`;
  }

  bindEvents() {
    this.container.querySelectorAll(".cdm-pattern-btn").forEach((btn) => {
      btn.addEventListener("click", () => this.setPattern(btn.dataset.pattern));
    });
  }

  setPattern(pattern) {
    if (!this.patterns.includes(pattern)) return;
    this.activePattern = pattern;
    this.container.querySelectorAll(".cdm-pattern-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.pattern === pattern);
    });
    const stageContent = this.container.querySelector(".cdm-stage-content");
    if (stageContent) stageContent.innerHTML = this.renderPatternContent(pattern);
    const globalCdm = this.resolveGlobalCDM();
    if (globalCdm && !this.syncingFromGlobal) {
      if (typeof globalCdm.switchPattern === "function") globalCdm.switchPattern(pattern);
      else if (typeof globalCdm.setPattern === "function") globalCdm.setPattern(pattern);
    }
    this.onPatternChange(pattern);
  }

  refresh() {
    const stageContent = this.container?.querySelector(".cdm-stage-content");
    if (stageContent) stageContent.innerHTML = this.renderPatternContent(this.activePattern);
  }
}
