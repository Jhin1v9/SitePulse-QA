export const Components = {
  MetricCard({ label, value, trend = "", trendUp = true, icon = "", color = "blue" }) {
    const card = document.createElement("div");
    card.className = `ws-metric-card ws-metric-${color}`;
    card.innerHTML = `
      <div class="ws-metric-icon">${icon}</div>
      <div class="ws-metric-content">
        <span class="ws-metric-label">${label}</span>
        <strong class="ws-metric-value">${value}</strong>
        ${trend ? `<span class="ws-metric-trend ${trendUp ? "up" : "down"}">${trendUp ? "↑" : "↓"} ${trend}</span>` : ""}
      </div>
    `;
    return card;
  },

  PriorityBadge(level) {
    const badge = document.createElement("span");
    const normalized = String(level || "P3").toUpperCase();
    badge.className = `ws-priority-badge ws-priority-${normalized.toLowerCase()}`;
    badge.textContent = normalized;
    return badge;
  },

  StatusIndicator(status, label) {
    const palette = {
      active: "#22C55E",
      warning: "#F59E0B",
      error: "#EF4444",
      pending: "#A855F7",
      inactive: "#8B95A5",
    };
    const root = document.createElement("div");
    root.className = "ws-status-indicator";
    root.innerHTML = `
      <span class="ws-status-dot" style="background:${palette[status] || palette.inactive}"></span>
      <span class="ws-status-label">${label || status}</span>
    `;
    return root;
  },

  ActionButton({ label, icon = "", variant = "primary", onClick, disabled = false }) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `ws-action-btn ws-action-${variant}`;
    button.disabled = !!disabled;
    button.innerHTML = `${icon ? `<span class="ws-btn-icon">${icon}</span>` : ""}<span>${label}</span>`;
    if (onClick) button.addEventListener("click", onClick);
    return button;
  },

  Modal({ title, content, onClose, actions = [] }) {
    const overlay = document.createElement("div");
    overlay.className = "ws-modal-overlay";
    overlay.innerHTML = `
      <div class="ws-modal-dialog" role="dialog" aria-modal="true">
        <div class="ws-modal-header">
          <h3>${title}</h3>
          <button type="button" class="ws-modal-close" aria-label="Close">×</button>
        </div>
        <div class="ws-modal-body"></div>
        <div class="ws-modal-footer"></div>
      </div>
    `;

    const body = overlay.querySelector(".ws-modal-body");
    if (typeof content === "string") body.innerHTML = content;
    else if (content) body.appendChild(content);

    const footer = overlay.querySelector(".ws-modal-footer");
    actions.forEach((action) => {
      footer.appendChild(this.ActionButton(action));
    });

    const close = () => {
      if (onClose) onClose();
      overlay.remove();
    };
    overlay.querySelector(".ws-modal-close").addEventListener("click", close);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close();
    });

    return overlay;
  },

  Skeleton({ lines = 3 }) {
    const root = document.createElement("div");
    root.className = "ws-skeleton";
    for (let i = 0; i < lines; i += 1) {
      const line = document.createElement("div");
      line.className = "ws-skeleton-line";
      root.appendChild(line);
    }
    return root;
  },

  Toast({ message, type = "info", duration = 3200 }) {
    const toast = document.createElement("article");
    const tone = type === "error" ? "bad" : type === "warning" ? "warn" : "ok";
    toast.className = `toast ${tone}`;
    toast.textContent = String(message || "");
    const stack = document.getElementById("toastStack") || document.body;
    stack.appendChild(toast);
    window.setTimeout(() => toast.remove(), duration);
    return toast;
  },
};

export function injectComponentStyles() {
  if (document.getElementById("ws-components-styles")) return;
  const style = document.createElement("style");
  style.id = "ws-components-styles";
  style.textContent = `
    .ws-metric-card { display:flex; gap:10px; padding:12px; border-radius:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); }
    .ws-metric-icon { width:20px; text-align:center; }
    .ws-metric-label { display:block; color:#8B95A5; font-size:12px; }
    .ws-metric-value { color:#F0F4F8; font-size:20px; }
    .ws-metric-trend.up { color:#22C55E; font-size:11px; }
    .ws-metric-trend.down { color:#EF4444; font-size:11px; }

    .ws-priority-badge { padding:4px 8px; border-radius:8px; font-size:10px; letter-spacing:.08em; text-transform:uppercase; border:1px solid rgba(255,255,255,0.12); }
    .ws-priority-p0 { color:#EF4444; background:rgba(239,68,68,0.15); border-color:rgba(239,68,68,0.3); }
    .ws-priority-p1 { color:#F59E0B; background:rgba(245,158,11,0.15); border-color:rgba(245,158,11,0.3); }
    .ws-priority-p2 { color:#58A6FF; background:rgba(88,166,255,0.15); border-color:rgba(88,166,255,0.3); }
    .ws-priority-p3,.ws-priority-p4 { color:#8B95A5; background:rgba(139,149,165,0.15); border-color:rgba(139,149,165,0.3); }

    .ws-status-indicator { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:#D9E2EC; }
    .ws-status-dot { width:8px; height:8px; border-radius:50%; box-shadow:0 0 8px currentColor; }
    .ws-action-btn { padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); color:#F0F4F8; cursor:pointer; }
    .ws-action-btn:hover { background:rgba(255,255,255,0.06); }

    .ws-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.56); display:flex; align-items:center; justify-content:center; z-index:10000; }
    .ws-modal-dialog { width:min(680px,92vw); background:#0F1622; border:1px solid rgba(255,255,255,0.1); border-radius:14px; overflow:hidden; }
    .ws-modal-header,.ws-modal-footer { padding:12px 14px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.08); }
    .ws-modal-body { padding:14px; color:#D9E2EC; }
    .ws-modal-footer { border-top:1px solid rgba(255,255,255,0.08); border-bottom:none; justify-content:flex-end; gap:8px; }
    .ws-modal-close { border:none; background:transparent; color:#8B95A5; font-size:20px; cursor:pointer; }

    .ws-skeleton { display:flex; flex-direction:column; gap:8px; }
    .ws-skeleton-line { height:10px; border-radius:6px; background:rgba(255,255,255,0.1); animation:ws-pulse 1.4s ease-in-out infinite; }
    @keyframes ws-pulse { 0%,100% { opacity:.45; } 50% { opacity:1; } }
  `;
  document.head.appendChild(style);
}
