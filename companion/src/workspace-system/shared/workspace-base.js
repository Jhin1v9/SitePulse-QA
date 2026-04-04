import { dataBridge } from "../integrations/data-bridge.js";

export class WorkspaceBase {
  constructor(container, manager) {
    this.container = container;
    this.manager = manager;
    this.id = container?.dataset?.workspace || "";
    this.isMounted = false;
    this.data = {};
  }

  async mount() {
    this.container.innerHTML = this.getTemplate();
    this.bindEvents();
    this.isMounted = true;
    this.updateData();
    this.render();
  }

  async onActivate() {
    this.updateData();
    this.render();
  }

  async onDeactivate() {}

  onDataUpdate() {
    this.updateData();
    this.render();
  }

  updateData() {
    this.data = this.readDataShell();
  }

  readDataShell() {
    const data = dataBridge.readAll();
    if (!Object.keys(data).length) {
      document.querySelectorAll("[data-shell]").forEach((el) => {
        const key = el.getAttribute("data-shell");
        if (key) data[key] = String(el.textContent || "").trim();
      });
    }
    return data;
  }

  getTemplate() {
    return `<div class="workspace-placeholder">Workspace ${this.id}</div>`;
  }

  render() {}

  bindEvents() {}

  createElement(tag, classes = "", content = "") {
    const el = document.createElement(tag);
    if (classes) el.className = classes;
    if (content) el.innerHTML = content;
    return el;
  }

  formatCurrency(value, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  getPriorityColor(level) {
    const colors = { P0: "#EF4444", P1: "#F59E0B", P2: "#5B8CFF", P3: "#8B95A5", P4: "#5A6578" };
    return colors[String(level || "").toUpperCase()] || "#8B95A5";
  }
}
