export function injectGlobalStyles() {
  if (document.getElementById("workspace-system-styles")) return;
  const style = document.createElement("style");
  style.id = "workspace-system-styles";
  style.textContent = `
    .workspace-host {
      position: relative;
      flex: 1;
      overflow: hidden;
      background: radial-gradient(1200px 500px at 20% -10%, rgba(91,140,255,0.12), transparent), #0f1622;
      font-family: Inter, "Segoe UI Variable Text", "Segoe UI", sans-serif;
    }
    .workspace-container {
      position: absolute;
      inset: 0;
      overflow-y: auto;
      padding: 24px 40px;
      background: linear-gradient(180deg, rgba(255,255,255,0.015), rgba(255,255,255,0));
      animation: ws-fade-in 240ms ease;
    }
    .ws-header { display: flex; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06); backdrop-filter: blur(6px); }
    .ws-title { margin: 0 0 6px; font-size: 28px; color: #F0F4F8; }
    .ws-subtitle { margin: 0; font-size: 14px; color: #8B95A5; }
    .ws-badge { padding: 6px 10px; border-radius: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
    .ws-badge.mode { background: rgba(88,166,255,0.1); color: #58a6ff; border: 1px solid rgba(88,166,255,0.2); }
    .ws-badge.confidence { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2); box-shadow: 0 0 16px rgba(34,197,94,0.16); }
    .operator-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; }
    .operator-context { display: flex; flex-direction: column; gap: 16px; }
    .context-panel, .seo-card, .breakdown-card, .issue-card, .timeline-item {
      background: linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.015));
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 12px 28px rgba(0,0,0,0.24);
      transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease;
    }
    .context-panel:hover, .seo-card:hover, .breakdown-card:hover, .issue-card:hover, .timeline-item:hover {
      transform: translateY(-2px);
      border-color: rgba(91,140,255,0.24);
      box-shadow: 0 18px 36px rgba(0,0,0,0.28), 0 0 0 1px rgba(91,140,255,0.14);
    }
    .panel-header { display: flex; justify-content: space-between; margin-bottom: 10px; }
    .panel-header h3 { margin: 0; font-size: 12px; text-transform: uppercase; color: #5A6578; }
    .panel-status { font-size: 10px; padding: 3px 8px; border-radius: 8px; }
    .panel-status.watching { background: rgba(245,158,11,0.1); color: #F59E0B; }
    .panel-status.pending { background: rgba(168,85,247,0.1); color: #A855F7; }
    .pred-metric, .heal-stat { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
    .pred-label, .heal-label { font-size: 12px; color: #8B95A5; }
    .pred-value, .heal-value { font-size: 14px; color: #F0F4F8; font-weight: 600; }
    .heal-value.ready { color: #22C55E; }
    .healing-actions { margin-top: 10px; display:flex; gap:8px; }
    .action-btn { border-radius:10px; padding:8px 10px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.03); color:#F0F4F8; cursor:pointer; transition: all .2s ease; }
    .action-btn:hover { transform: translateY(-1px); border-color: rgba(255,255,255,0.22); }
    .action-btn.primary { border-color: rgba(34,197,94,0.3); color:#22C55E; background:rgba(34,197,94,0.1); }

    .findings-layout, .compare-layout { display: grid; grid-template-columns: 260px 1fr; gap: 24px; }
    .compare-layout { grid-template-columns: 1fr 360px; }
    .findings-sidebar { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius:16px; padding:16px; }
    .filter-section h4 { margin:0; font-size:11px; text-transform:uppercase; color:#8B95A5; letter-spacing:.08em; }
    .filter-chips { display:flex; gap:8px; }
    .filter-chip { border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); color:#8B95A5; border-radius:999px; padding:6px 12px; font-size:12px; }
    .filter-chip.active { border-color:rgba(88,166,255,0.35); color:#58a6ff; background:rgba(88,166,255,0.12); }
    .issue-card { margin-bottom: 12px; }
    .issue-header { display:flex; align-items:center; gap:12px; cursor:pointer; }
    .issue-priority { padding:4px 10px; border-radius:8px; font-size:11px; font-weight:700; }
    .issue-priority.p0 { color:#ef4444; background:rgba(239,68,68,0.15); }
    .issue-priority.p1 { color:#f59e0b; background:rgba(245,158,11,0.15); }
    .issue-title { margin:0; flex:1; font-size:15px; color:#f0f4f8; }
    .issue-expand { border:0; background:transparent; color:#8B95A5; cursor:pointer; }
    .issue-actions-bar { display:flex; gap:8px; margin-top:12px; }
    .issue-card.collapsed .issue-body { display:none; }

    .seo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .delta-summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
    .delta-card.improvement { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.15); }
    .delta-card.regression { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); }
    .delta-card { border-radius:16px; padding:16px; position: relative; overflow: hidden; }
    .delta-card::after {
      content: "";
      position: absolute;
      inset: -60% -40%;
      background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 45%);
      transform: translateX(-65%);
      animation: ws-sweep 5s linear infinite;
      pointer-events: none;
    }
    .delta-value { font-size:24px; font-weight:600; color:#F0F4F8; }
    .delta-label { font-size:12px; color:#8B95A5; }
    .section-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
    .timeline-filters { display:flex; gap:6px; }
    .filter-btn { border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.02); border-radius:999px; color:#8B95A5; padding:5px 10px; font-size:11px; cursor:pointer; }
    .filter-btn.active { color:#58a6ff; border-color:rgba(88,166,255,.35); background:rgba(88,166,255,.12); }
    .timeline { display:flex; flex-direction:column; gap:10px; }
    .timeline-item.regression { border-left:3px solid #ef4444; }
    .timeline-item.improvement { border-left:3px solid #22c55e; }
    .timeline-content h4 { margin:0 0 6px; font-size:14px; color:#f0f4f8; }
    .timeline-content p { margin:0; color:#8B95A5; font-size:12px; }

    .cdm-embedded { border:1px solid rgba(255,255,255,0.06); border-radius:16px; background:rgba(255,255,255,0.02); overflow:hidden; }
    .cdm-rail { display:flex; gap:6px; padding:10px; border-bottom:1px solid rgba(255,255,255,0.06); flex-wrap:wrap; }
    .cdm-pattern-btn { border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.02); border-radius:999px; color:#8B95A5; padding:6px 10px; font-size:11px; cursor:pointer; }
    .cdm-pattern-btn.active { border-color:rgba(88,166,255,0.35); background:rgba(88,166,255,0.12); color:#58a6ff; }
    .cdm-stage { padding:16px; min-height:320px; }
    .pattern-content h3 { margin:0 0 8px; color:#f0f4f8; }
    .pattern-content p { margin:0; color:#8B95A5; }

    .ws-live-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #22C55E;
      box-shadow: 0 0 10px rgba(34,197,94,0.8);
      animation: ws-live-pulse 1.8s ease-in-out infinite;
      display: inline-block;
      margin-right: 8px;
    }
    .ws-chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    .ws-chip {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      border-radius: 999px;
      color: #D9E2EC;
      font-size: 11px;
      padding: 5px 10px;
    }

    @keyframes ws-live-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(0.85); opacity: 0.66; }
    }
    @keyframes ws-sweep {
      from { transform: translateX(-65%); }
      to { transform: translateX(120%); }
    }
    @keyframes ws-fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .ws-page { max-width: 1200px; margin: 0 auto; }
    .ws-page-head { margin-bottom: 28px; }
    .ws-page-eyebrow { margin: 0 0 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #8B95A5; }
    .ws-page-title { margin: 0 0 8px; font-size: 28px; color: #F0F4F8; }
    .ws-page-desc { margin: 0; font-size: 14px; color: #8B95A5; line-height: 1.5; max-width: 720px; }
    .ws-settings-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
    .ws-settings-card {
      background: linear-gradient(180deg, rgba(255,255,255,0.028), rgba(255,255,255,0.015));
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 18px;
    }
    .ws-settings-card-wide { grid-column: 1 / -1; }
    .ws-settings-h2 { margin: 0 0 8px; font-size: 15px; color: #F0F4F8; }
    .ws-settings-lead { margin: 0 0 14px; font-size: 13px; color: #8B95A5; line-height: 1.45; }
    .ws-engine-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; justify-content: space-between; }
    .ws-engine-status { min-width: 140px; }
    .ws-status-label { display: block; font-size: 11px; text-transform: uppercase; color: #8B95A5; letter-spacing: 0.08em; }
    .ws-status-value { font-size: 18px; color: #F0F4F8; }
    .ws-settings-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .ws-mini-metrics { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 14px; font-size: 12px; }
    .ws-dl { margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .ws-dl > div { display: grid; grid-template-columns: 100px 1fr; gap: 10px; font-size: 13px; }
    .ws-dl dt { margin: 0; color: #8B95A5; }
    .ws-dl dd { margin: 0; color: #E6EDF5; }
    .ws-hint { margin: 12px 0 0; font-size: 12px; color: #6B7685; }
    .ws-diag-row { display: flex; flex-wrap: wrap; gap: 8px; }
    .muted { color: #8B95A5; }

    .findings-explorer-layout {
      display: grid;
      grid-template-columns: 240px minmax(0, 1fr) 280px;
      gap: 20px;
      align-items: start;
    }
    .findings-explorer-filters, .findings-explorer-preview {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px;
      padding: 16px;
    }
    .findings-explorer-main { min-width: 0; }
    .findings-queue-meta { margin-top: 16px; font-size: 12px; display: flex; flex-direction: column; gap: 4px; }
    .findings-preview-title { margin: 8px 0 12px; font-size: 16px; color: #F0F4F8; line-height: 1.35; }
    .findings-preview-body { font-size: 13px; line-height: 1.5; margin-bottom: 12px; }
    .issue-detail { margin: 10px 0 0; font-size: 13px; color: #C5CFDA; line-height: 1.45; }
    .issue-card-selected { outline: 1px solid rgba(88,166,255,0.35); box-shadow: 0 0 0 1px rgba(88,166,255,0.2); }
    .findings-empty { padding: 24px; text-align: center; }

    @media (max-width: 1200px) {
      .operator-layout, .findings-layout, .compare-layout, .seo-grid { grid-template-columns: 1fr; }
      .findings-explorer-layout { grid-template-columns: 1fr; }
      .ws-settings-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(style);
}
