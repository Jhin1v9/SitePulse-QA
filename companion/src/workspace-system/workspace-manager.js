export class WorkspaceManager {
  constructor(workspaceRegistry = {}) {
    this.registry = workspaceRegistry;
    this.instances = new Map();
    this.activeWorkspace = null;
    this.hostElement = null;
    this.history = [];
    this.isTransitioning = false;
    this.pendingWorkspaceId = null;
  }

  normalizeWorkspaceId(id) {
    const value = String(id || "").toLowerCase();
    if (value === "overview") return "operator";
    return value;
  }

  init(defaultWorkspaceId = "operator") {
    this.hostElement =
      document.getElementById("workspace-host") ||
      document.getElementById("main-content") ||
      document.getElementById("app-container") ||
      this.createHostElement();
    this.prepareContainers();
    // Navegação da sidebar: só renderer.js (bindNavigation → switchView). Não duplicar listeners aqui.
    this.bindDataUpdates();
    if (defaultWorkspaceId) this.switchTo(defaultWorkspaceId);
  }

  createHostElement() {
    const host = document.createElement("div");
    host.id = "workspace-host";
    host.className = "workspace-host";

    const mainGrid = document.getElementById("mainGrid");
    if (mainGrid && mainGrid.parentNode) {
      mainGrid.parentNode.insertBefore(host, mainGrid);
      // Visibilidade de #mainGrid vs host: só renderer.js (switchView) — evita ecrã vazio no init lazy.
    } else {
      document.body.appendChild(host);
    }
    return host;
  }

  prepareContainers() {
    Object.keys(this.registry).forEach((id) => {
      const container = document.createElement("div");
      container.id = `workspace-${id}`;
      container.className = "workspace-container";
      container.dataset.workspace = id;
      container.style.display = "none";
      container.style.opacity = "0";
      container.style.transform = "translateY(10px)";
      this.hostElement.appendChild(container);
    });
  }

  async switchTo(workspaceId) {
    const normalizedId = this.normalizeWorkspaceId(workspaceId);
    if (!this.registry[normalizedId]) return;
    if (this.isTransitioning) {
      this.pendingWorkspaceId = normalizedId;
      // Importante: devolver Promise para o renderer poder await (evita race com switchView).
      return this.waitUntilWorkspaceActive(normalizedId);
    }
    if (this.activeWorkspace === normalizedId) return;

    await this.runOneSwitch(normalizedId);
    while (this.pendingWorkspaceId) {
      const next = this.pendingWorkspaceId;
      this.pendingWorkspaceId = null;
      if (next === this.activeWorkspace) continue;
      await this.runOneSwitch(next);
    }
  }

  /** Espera até activeWorkspace === id e não haver transição em curso (inclui drain de pending). */
  waitUntilWorkspaceActive(id) {
    const started = Date.now();
    return new Promise((resolve) => {
      const tick = () => {
        if (this.activeWorkspace === id && !this.isTransitioning) {
          resolve();
          return;
        }
        if (Date.now() - started > 30000) {
          console.warn("[WorkspaceManager] waitUntilWorkspaceActive timeout", id);
          resolve();
          return;
        }
        setTimeout(tick, 16);
      };
      setTimeout(tick, 0);
    });
  }

  async runOneSwitch(normalizedId) {
    if (this.activeWorkspace === normalizedId) return;
    this.isTransitioning = true;
    const previousId = this.activeWorkspace;
    try {
      if (previousId) await this.deactivateWorkspace(previousId);
      await this.activateWorkspace(normalizedId);
      this.updateSidebarIndicator(normalizedId);
      this.history.push({ from: previousId, to: normalizedId, timestamp: Date.now() });
      this.activeWorkspace = normalizedId;
      window.dispatchEvent(new CustomEvent("workspace-changed", { detail: { from: previousId, to: normalizedId, manager: this } }));
    } finally {
      this.isTransitioning = false;
    }
  }

  async activateWorkspace(workspaceId) {
    const container = document.getElementById(`workspace-${workspaceId}`);
    if (!container) return;
    if (!this.instances.has(workspaceId)) {
      const WorkspaceClass = this.registry[workspaceId];
      const instance = new WorkspaceClass(container, this);
      this.instances.set(workspaceId, instance);
      await instance.mount();
    }
    const instance = this.instances.get(workspaceId);
    container.style.display = "block";
    void container.offsetHeight;
    container.style.transition = "opacity 250ms ease, transform 250ms ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
    if (instance?.onActivate) await instance.onActivate();
  }

  async deactivateWorkspace(workspaceId) {
    const container = document.getElementById(`workspace-${workspaceId}`);
    if (!container) return;
    const instance = this.instances.get(workspaceId);
    if (instance?.onDeactivate) await instance.onDeactivate();
    container.style.transition = "opacity 250ms ease, transform 250ms ease";
    container.style.opacity = "0";
    container.style.transform = "translateY(-8px)";
    await new Promise((resolve) => setTimeout(resolve, 250));
    container.style.display = "none";
  }

  updateSidebarIndicator(activeId) {
    document.querySelectorAll("[data-view], .nav-btn[data-page], #sidebarOperator, #sidebarFindings, #sidebarSeo, #sidebarCompare, #sidebarSettings").forEach((btn) => {
      const rawView = String(btn.getAttribute("data-view") || "");
      const rawPage = String(btn.getAttribute("data-page") || "");
      const candidate = rawView || rawPage;
      const normalizedCandidate = this.normalizeWorkspaceId(candidate);
      const isActive = this.normalizeWorkspaceId(rawView) === activeId;
      const isPageActive = normalizedCandidate === activeId;
      btn.classList.toggle("active", isActive || isPageActive);
      const indicator = btn.querySelector(".active-indicator");
      if (indicator) indicator.style.opacity = isActive || isPageActive ? "1" : "0";
    });
  }

  bindSidebarEvents() {
    document.querySelectorAll("[data-view], .nav-btn[data-page], #sidebarOperator, #sidebarFindings, #sidebarSeo, #sidebarCompare, #sidebarSettings").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        let view = String(btn.getAttribute("data-view") || btn.getAttribute("data-page") || "");
        if (!view) {
          if (btn.id === "sidebarOperator") view = "operator";
          if (btn.id === "sidebarFindings") view = "findings";
          if (btn.id === "sidebarSeo") view = "seo";
          if (btn.id === "sidebarCompare") view = "compare";
        }
        const normalized = this.normalizeWorkspaceId(view);
        if (this.registry[normalized]) {
          e.preventDefault();
          e.stopPropagation();
          this.switchTo(normalized);
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (!e.altKey) return;
      if (e.key === "1") this.switchTo("operator");
      if (e.key === "2") this.switchTo("findings");
      if (e.key === "3") this.switchTo("seo");
      if (e.key === "4") this.switchTo("compare");
    });
  }

  bindDataUpdates() {
    window.addEventListener("motor-data-updated", () => this.refresh());
    window.addEventListener("data-bridge-updated", () => this.refresh());
    setInterval(() => this.refresh(), 2000);
  }

  refresh() {
    // Durante switchTo, activeWorkspace ainda aponta para o workspace anterior enquanto o novo
    // monta — data-bridge-updated + refresh() reentrava em findings e podia bloquear o thread.
    if (this.isTransitioning) return;
    const active = this.instances.get(this.activeWorkspace);
    if (active?.onDataUpdate) active.onDataUpdate();
  }

  goBack() {
    if (this.history.length > 1) {
      const previous = this.history[this.history.length - 2];
      if (previous?.from) this.switchTo(previous.from);
    }
  }
}
