import { WorkspaceBase } from "../shared/workspace-base.js";

/**
 * Settings — superfície dedicada (não partilha #workspaceShell / miolo do Control Center).
 * Ações de motor: window.sitepulseShellActions (definido em renderer.js).
 */
export class SettingsWorkspace extends WorkspaceBase {
  getTemplate() {
    return `
      <div class="settings-workspace ws-page">
        <header class="ws-page-head">
          <div>
            <p class="ws-page-eyebrow">System</p>
            <h1 class="ws-page-title">Settings</h1>
            <p class="ws-page-desc">Engine, runtime, audit behaviour e diagnósticos. Independente da sidebar — só navegação global.</p>
          </div>
          <div class="ws-chip-row">
            <span class="ws-chip"><span class="ws-live-dot"></span><span data-shell="engineChip">engine</span></span>
            <span class="ws-chip" data-shell="modeChip">mode</span>
            <span class="ws-chip" data-shell="runBadge">run</span>
          </div>
        </header>

        <div class="ws-settings-grid">
          <section class="ws-settings-card" data-settings-section="engine">
            <h2 class="ws-settings-h2">Engine control</h2>
            <p class="ws-settings-lead">Ligar ou parar o bridge local. Estado reflecte o motor real (não é mock).</p>
            <div class="ws-engine-row">
              <div class="ws-engine-status">
                <span class="ws-status-label">Bridge</span>
                <strong class="ws-status-value" id="wsSettingsBridgeState">—</strong>
              </div>
              <div class="ws-settings-actions">
                <button type="button" class="action-btn primary" id="wsBtnStartEngine">Start engine</button>
                <button type="button" class="action-btn" id="wsBtnStopEngine">Stop engine</button>
                <button type="button" class="action-btn" id="wsBtnCopyBridge">Copy bridge URL</button>
              </div>
            </div>
            <div class="ws-mini-metrics">
              <div><span class="muted">Quality</span> <strong data-shell="qualityScore">—</strong></div>
              <div><span class="muted">Healing ready</span> <strong data-shell="healingCount">—</strong></div>
              <div><span class="muted">Memory</span> <strong data-shell="memoryEntries">—</strong></div>
            </div>
          </section>

          <section class="ws-settings-card" data-settings-section="runtime">
            <h2 class="ws-settings-h2">Runtime / bridge / services</h2>
            <p class="ws-settings-lead">Valores ligados ao estado operacional (data-shell + companion quando disponível).</p>
            <dl class="ws-dl">
              <div><dt>Target</dt><dd class="font-mono truncate" data-shell="target">—</dd></div>
              <div><dt>Trajectory</dt><dd data-shell="qualityTrajectory">—</dd></div>
              <div><dt>Predictive</dt><dd data-shell="predictiveHero">—</dd></div>
              <div><dt>Issues</dt><dd data-shell="issuesMetric">—</dd></div>
            </dl>
          </section>

          <section class="ws-settings-card" data-settings-section="audit">
            <h2 class="ws-settings-h2">Audit behaviour</h2>
            <p class="ws-settings-lead">Perfil e profundidade continuam no painel de perfil; aqui atalhos seguros.</p>
            <div class="ws-settings-actions">
              <button type="button" class="action-btn" id="wsBtnRunAudit">Run audit (current profile)</button>
              <button type="button" class="action-btn" id="wsBtnOpenReports">Open reports</button>
            </div>
            <p class="ws-hint">Use Cmd/Ctrl+K para command palette com mais presets.</p>
          </section>

          <section class="ws-settings-card" data-settings-section="assistant">
            <h2 class="ws-settings-h2">Assistant / cognitive layer</h2>
            <p class="ws-settings-lead">Dock de IA permanece disponível via botão do header; não duplicamos a sidebar aqui.</p>
            <div class="ws-settings-actions">
              <button type="button" class="action-btn primary" id="wsBtnOpenAssistant">Open AI workspace</button>
            </div>
          </section>

          <section class="ws-settings-card ws-settings-card-wide" data-settings-section="diagnostics">
            <h2 class="ws-settings-h2">Diagnostics / maintenance</h2>
            <div class="ws-diag-row">
              <button type="button" class="action-btn" id="wsBtnReload">Reload renderer shell</button>
              <button type="button" class="action-btn" id="wsBtnFocusLog">Scroll to app log</button>
            </div>
            <p class="ws-hint">Logs completos: painel Operations / ficheiro em userData.</p>
          </section>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const shell = () => window.sitepulseShellActions || {};
    if (this.container.querySelector("#wsBtnStartEngine")) {
      this.container.querySelector("#wsBtnStartEngine").addEventListener("click", () => {
        const fn = shell().startEngine;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnStopEngine")) {
      this.container.querySelector("#wsBtnStopEngine").addEventListener("click", () => {
        const fn = shell().stopEngine;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnCopyBridge")) {
      this.container.querySelector("#wsBtnCopyBridge").addEventListener("click", () => {
        const fn = shell().copyBridgeUrl;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnRunAudit")) {
      this.container.querySelector("#wsBtnRunAudit").addEventListener("click", () => {
        const fn = shell().runAudit;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnOpenReports")) {
      this.container.querySelector("#wsBtnOpenReports").addEventListener("click", () => {
        const fn = shell().openReportsVault;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnOpenAssistant")) {
      this.container.querySelector("#wsBtnOpenAssistant").addEventListener("click", () => {
        const fn = shell().openAssistant;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnReload")) {
      this.container.querySelector("#wsBtnReload").addEventListener("click", () => {
        const fn = shell().reloadShell;
        if (typeof fn === "function") fn();
      });
    }
    if (this.container.querySelector("#wsBtnFocusLog")) {
      this.container.querySelector("#wsBtnFocusLog").addEventListener("click", () => {
        const fn = shell().scrollToLog;
        if (typeof fn === "function") fn();
      });
    }
  }

  render() {
    const fromMain = (key) => {
      const src = document.querySelector(`#mainGrid [data-shell="${key}"]`) || document.querySelector(`[data-shell="${key}"]`);
      return src ? String(src.textContent || "").trim() : "";
    };
    const keys = [
      "engineChip",
      "modeChip",
      "runBadge",
      "qualityScore",
      "healingCount",
      "memoryEntries",
      "target",
      "qualityTrajectory",
      "predictiveHero",
      "issuesMetric",
    ];
    keys.forEach((key) => {
      const el = this.container.querySelector(`[data-shell="${key}"]`);
      if (!el) return;
      const v = fromMain(key) || this.data?.[key] || "—";
      el.textContent = v || "—";
    });
    const bridge = this.container.querySelector("#wsSettingsBridgeState");
    if (bridge) {
      const t = fromMain("engineChip") || this.data?.engineChip || "—";
      bridge.textContent = t;
    }
  }
}
