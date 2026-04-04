export class DataBridge {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map();
    this.mutationObserver = null;
    this.root = null;
    this.translationMap = {
      qualityScore: ["qualityScore", "data-score", "score"],
      target: ["target", "currentTarget", "data-target"],
      issuesMetric: ["issuesMetric", "issues", "data-issues"],
      systemStateMemory: ["systemStateMemory", "memoryEntries", "memoryCount"],
      healingCount: ["healingCount", "healingEligibleCount"],
      healingPending: ["healingPending", "systemStateHealingPending"],
      healingReady: ["healingReady", "healingReadyCount", "systemStateHealingReady"],
      predictiveHero: ["predictiveHero", "predictiveHighRiskAlerts"],
    };
    this.poller = null;
  }

  init() {
    this.root = document.body;
    if (this.mutationObserver) this.mutationObserver.disconnect();
    this.mutationObserver = new MutationObserver((mutations) => {
      let changed = null;
      for (const mutation of mutations) {
        const target = mutation.target?.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target;
        const key = target?.getAttribute?.("data-shell");
        if (key) {
          changed = key;
          break;
        }
      }
      this.notifySubscribers(changed);
    });
    this.mutationObserver.observe(this.root, { childList: true, subtree: true, characterData: true });
    if (this.poller) window.clearInterval(this.poller);
    this.poller = window.setInterval(() => this.notifySubscribers(), 2000);
  }

  read(key) {
    if (this.cache.has(key)) return this.cache.get(key);
    const lookup = this.translationMap[key] || [key];
    let value = null;
    for (const candidate of lookup) {
      const el = document.querySelector(`[data-shell="${candidate}"]`) || document.querySelector(`[data-${candidate}]`);
      if (el) {
        const raw = el.getAttribute(`data-${candidate}`) || el.textContent || "";
        value = this.parseValue(String(raw).trim());
        break;
      }
    }
    if (value == null) return null;
    this.cache.set(key, value);
    return value;
  }

  readAll() {
    const data = {};
    document.querySelectorAll("[data-shell]").forEach((el) => {
      const key = el.getAttribute("data-shell");
      if (!key) return;
      data[key] = this.parseValue(String(el.textContent || "").trim());
    });
    Object.keys(this.translationMap).forEach((canonical) => {
      if (!(canonical in data)) {
        const value = this.read(canonical);
        if (value != null) data[canonical] = value;
      }
    });
    return data;
  }

  write(key, value) {
    let el = document.querySelector(`[data-shell="${key}"]`);
    if (!el) {
      el = document.createElement("span");
      el.setAttribute("data-shell", key);
      el.className = "hidden";
      document.body.appendChild(el);
    }
    el.textContent = typeof value === "object" ? JSON.stringify(value) : String(value);
    this.cache.set(key, value);
    this.notifySubscribers(key);
  }

  subscribe(key, callback) {
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key).add(callback);
    return () => this.subscribers.get(key)?.delete(callback);
  }

  subscribeAll(callback) {
    const id = "__all__";
    if (!this.subscribers.has(id)) this.subscribers.set(id, new Set());
    this.subscribers.get(id).add(callback);
    return () => this.subscribers.get(id)?.delete(callback);
  }

  notifySubscribers(changedKey = null) {
    this.cache.clear();
    if (changedKey && this.subscribers.has(changedKey)) {
      const value = this.read(changedKey);
      this.subscribers.get(changedKey).forEach((cb) => cb(value, changedKey));
    }
    if (this.subscribers.has("__all__")) {
      const snapshot = this.readAll();
      this.subscribers.get("__all__").forEach((cb) => cb(snapshot, changedKey));
    }
    window.dispatchEvent(new CustomEvent("data-bridge-updated", { detail: { key: changedKey, data: this.readAll() } }));
  }

  parseValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;
    if (value !== "" && !Number.isNaN(Number(value))) return Number(value);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  getSnapshot() {
    const data = this.readAll();
    const keys = Object.keys(data);
    const required = ["qualityScore", "target", "issuesMetric", "systemStateMemory", "healingCount", "healingPending", "healingReady", "predictiveHero"];
    const found = required.filter((k) => data[k] != null).length;
    return {
      timestamp: Date.now(),
      data,
      quality: required.length ? Math.round((found / required.length) * 100) : 0,
      keys,
    };
  }

  destroy() {
    if (this.mutationObserver) this.mutationObserver.disconnect();
    if (this.poller) window.clearInterval(this.poller);
    this.cache.clear();
    this.subscribers.clear();
  }
}

export const dataBridge = new DataBridge();
