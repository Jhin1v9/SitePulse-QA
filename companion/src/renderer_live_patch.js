/**
 * ============================================================
 * SITEPULSE STUDIO — LIVE WORKSPACE PATCH
 * Cola no final do renderer.js (antes do último })
 *
 * O que faz:
 * 1. Intercepta renderLiveReportState → atualiza workspaces
 *    premium em tempo real sem esperar o fim da run
 * 2. Injeta renderWorkspaceLive() que atualiza só os dados
 *    dinâmicos (métricas, listas, badges da sidebar) sem
 *    recriar o HTML inteiro — mantém performance
 * 3. Hook em renderSystemStateStrip para propagar counters
 *    nos badges da sidebar nova (Memory, Healing)
 * 4. Hook em syncOperatorShell para sincronizar o campo URL
 *    visível do dock premium com o targetUrl do motor
 * ============================================================
 */

(function installLiveWorkspacePatch() {
  // ── Guarda as funções originais ────────────────────────────
  const _origRenderLiveReportState = typeof renderLiveReportState === "function"
    ? renderLiveReportState : null;
  const _origRenderAllReportState = typeof renderAllReportState === "function"
    ? renderAllReportState : null;
  const _origRenderSystemStateStrip = typeof renderSystemStateStrip === "function"
    ? renderSystemStateStrip : null;
  const _origSyncOperatorShell = typeof syncOperatorShell === "function"
    ? syncOperatorShell : null;

  // ── Throttle helper ────────────────────────────────────────
  let _liveThrottleTimer = null;
  let _lastLiveRenderMs = 0;
  const LIVE_RENDER_INTERVAL_MS = 800; // máx 1.25x/segundo

  function throttledLiveRender(report) {
    const now = Date.now();
    clearTimeout(_liveThrottleTimer);
    if (now - _lastLiveRenderMs >= LIVE_RENDER_INTERVAL_MS) {
      _lastLiveRenderMs = now;
      _applyLiveWorkspaceUpdate(report);
    } else {
      _liveThrottleTimer = setTimeout(() => {
        _lastLiveRenderMs = Date.now();
        _applyLiveWorkspaceUpdate(report);
      }, LIVE_RENDER_INTERVAL_MS - (now - _lastLiveRenderMs));
    }
  }

  // ── Extrai dados do report ao vivo ─────────────────────────
  function _extractLiveData(report) {
    const summary = report?.summary || {};
    const snap = (typeof buildDesktopIntelligenceSnapshot === "function" && report)
      ? buildDesktopIntelligenceSnapshot(report) : null;

    const di = snap?.dataIntelligence || {};
    const riskState = di.RISK_STATE || {};
    const qualityState = di.QUALITY_STATE || {};
    const trendState = di.TREND_STATE || {};

    const totalIssues = Number(summary.totalIssues || 0);
    const routesChecked = Number(summary.routesChecked || summary.totalRoutes || 0);
    const seoScore = Number(summary.seoScore || report?.seo?.score || 0);
    const quality = Number(qualityState.overallScore ?? snap?.autonomous?.qualityScore?.total ?? summary.overallScore ?? 0);
    const trajectory = qualityState.trajectory || trendState.trajectory || summary.trajectory || "—";
    const memory = Number(snap?.learningMemory?.summary?.entries ?? 0);
    const healingReady = Number(snap?.selfHealing?.summary?.promptReady ?? snap?.selfHealing?.summary?.readyCount ?? 0);
    const riskHigh = Number(snap?.predictive?.summary?.highRiskAlerts ?? riskState.highRiskCount ?? 0);
    const p0 = Number(summary.priorityP0 || 0);
    const p1 = Number(summary.priorityP1 || 0);
    const baseUrl = (typeof getReportBaseUrl === "function" ? getReportBaseUrl(report) : null)
      || report?.meta?.baseUrl || report?.meta?.targetUrl || "";
    const mode = report?.meta?.auditMode || "";
    const scope = report?.summary?.auditScope || "";
    const depth = report?.meta?.auditDepth || "";

    const seoTrend = trendState.seoTrend || snap?.continuous?.trends?.seo || "stable";
    const runtimeTrend = trendState.runtimeTrend || snap?.continuous?.trends?.runtime || "stable";

    const issues = Array.isArray(report?.issues) ? report.issues : [];
    const topIssues = issues.slice().sort((a, b) => {
      const rank = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
      const sev = (i) => String(i?.severity || i?.priority || "").toLowerCase();
      return (rank[sev(b)] || 0) - (rank[sev(a)] || 0);
    }).slice(0, 6);

    return {
      totalIssues, routesChecked, seoScore, quality: Math.round(quality),
      trajectory, memory, healingReady, riskHigh, p0, p1,
      baseUrl, mode, scope, depth, seoTrend, runtimeTrend,
      topIssues,
    };
  }

  // ── Helper para patch seguro de texto num elemento ─────────
  function _setText(el, text) {
    if (!el) return;
    const s = String(text ?? "—");
    if (el.textContent !== s) el.textContent = s;
  }

  function _setTextQ(selector, text) {
    document.querySelectorAll(selector).forEach(el => _setText(el, text));
  }

  // ── Atualiza APENAS os dados dinâmicos do workspace ────────
  function _applyLiveWorkspaceUpdate(report) {
    if (!report) return;
    const d = _extractLiveData(report);

    // ── 1. Sidebar badges (novos) ──────────────────────────
    _setText(document.getElementById("systemStateMemorySidebar"), d.memory);
    _setText(document.getElementById("systemStateHealingReadySidebar"), d.healingReady);
    _setText(document.getElementById("findingsCountBadge"), d.totalIssues);
    _setText(document.getElementById("seoMetric"), d.seoScore);
    _setText(document.getElementById("qualityDashboardOverall"), d.quality);

    // ── 2. Command dock URL sync ───────────────────────────
    const cmdUrl = document.getElementById("commandTargetUrl");
    const targetUrl = document.getElementById("targetUrl");
    if (cmdUrl && targetUrl && !cmdUrl.matches(":focus")) {
      const val = targetUrl.value || d.baseUrl;
      if (val && cmdUrl.value !== val) cmdUrl.value = val;
    }

    // ── 3. Workspace surface inline patch ─────────────────
    //    Atualiza os números já renderizados no HTML do workspace
    //    sem recriar o DOM inteiro (preserva transições CSS)
    const surface = document.getElementById("workspaceSurfaceInner");
    if (!surface || !surface.innerHTML) return;

    // Métricas: procura .sp-ws-live-metric[data-metric="X"]
    // (adicionamos data-metric ao HTML para este patch)
    _patchMetricCards(surface, d);
    _patchLivePosture(surface, d);
    _patchLivePills(surface, d);
    _patchLiveListItems(surface, d);
  }

  function _patchMetricCards(surface, d) {
    // Procura todos os cards de métrica e actualiza o número grande
    // A identificação é feita pelo data-metric attribute que
    // o renderWorkspaceSurface já injeta
    const metricMap = {
      quality:       String(d.quality),
      routes:        String(d.routesChecked),
      memory:        String(d.memory),
      trajectory:    d.trajectory,
      totalIssues:   String(d.totalIssues),
      seo:           String(d.seoScore),
      "high-risk":   String(d.riskHigh),
      "healing":     String(d.healingReady),
      new:           "—",
    };
    surface.querySelectorAll("[data-live-metric]").forEach(el => {
      const key = el.dataset.liveMetric;
      if (metricMap[key] !== undefined) _setText(el, metricMap[key]);
    });
  }

  function _patchLivePosture(surface, d) {
    const targetEl = surface.querySelector("[data-live-target]");
    if (targetEl && d.baseUrl) _setText(targetEl, d.baseUrl);
    const profileEl = surface.querySelector("[data-live-profile]");
    if (profileEl && d.mode) _setText(profileEl, `Mode ${d.mode} · scope ${d.scope} · depth ${d.depth}`);
    const signalEl = surface.querySelector("[data-live-signal]");
    if (signalEl) _setText(signalEl, `SEO ${d.seoTrend} · Runtime ${d.runtimeTrend}`);
    const memEl = surface.querySelector("[data-live-memory]");
    if (memEl) _setText(memEl, `${d.memory} entries · ${d.healingReady} healing-ready`);
  }

  function _patchLivePills(surface, d) {
    surface.querySelectorAll("[data-live-pill]").forEach(el => {
      const key = el.dataset.livePill;
      if (key === "critical") _setText(el, `critical ${d.topIssues.filter(i => String(i?.severity||"").toLowerCase() === "critical").length}`);
      if (key === "high")     _setText(el, `high ${d.topIssues.filter(i => String(i?.severity||"").toLowerCase() === "high").length}`);
      if (key === "medium")   _setText(el, `medium ${d.topIssues.filter(i => String(i?.severity||"").toLowerCase() === "medium").length}`);
      if (key === "low")      _setText(el, `low ${d.topIssues.filter(i => String(i?.severity||"").toLowerCase() === "low").length}`);
    });
  }

  function _patchLiveListItems(surface, d) {
    // Atualiza a lista de priority pressure ao vivo
    const listEl = surface.querySelector("[data-live-priority-list]");
    if (!listEl || !d.topIssues.length) return;
    const newRows = d.topIssues.map((issue, i) => {
      const code = String(issue?.code || issue?.issueCode || `Issue ${i+1}`);
      const sev = String(issue?.severity || issue?.priority || "unknown").toLowerCase();
      const route = String(issue?.route || issue?.page || issue?.url || "—");
      return `<div class="workspace-list-item" style="animation:none">
        <span class="workspace-list-index">${i+1}</span>
        <div class="min-w-0">
          <p class="text-[13px] font-medium text-text-primary">${escapeHtml ? escapeHtml(code) : code}</p>
          <p class="mt-1 text-[12px] leading-6 text-text-tertiary">${escapeHtml ? escapeHtml(sev) : sev} · ${escapeHtml ? escapeHtml(route) : route}</p>
        </div>
      </div>`;
    }).join("");
    if (listEl.innerHTML !== newRows) listEl.innerHTML = newRows;
  }

  // ── Patch renderLiveReportState ────────────────────────────
  if (typeof window !== "undefined") {
    // Sobrescreve no escopo global (renderer.js usa var/function)
    const origFn = window.renderLiveReportState;
    window.renderLiveReportState = function patchedRenderLiveReportState(report) {
      // Chama o original primeiro
      if (typeof origFn === "function") {
        try { origFn(report); } catch(e) {}
      } else if (_origRenderLiveReportState) {
        try { _origRenderLiveReportState(report); } catch(e) {}
      }
      // Depois actualiza os workspaces premium em tempo real
      throttledLiveRender(report);
    };

    // Patch renderAllReportState para atualizar após fim da run
    const origAll = window.renderAllReportState;
    window.renderAllReportState = function patchedRenderAllReportState(report) {
      if (typeof origAll === "function") {
        try { origAll(report); } catch(e) {}
      } else if (_origRenderAllReportState) {
        try { _origRenderAllReportState(report); } catch(e) {}
      }
      // Força re-render completo do workspace no fim da run
      clearTimeout(_liveThrottleTimer);
      _lastLiveRenderMs = 0;
      if (typeof renderWorkspaceSurface === "function" && typeof getVisibleReport === "function") {
        try {
          const activeView = typeof uiState !== "undefined" ? (uiState.activeView || "overview") : "overview";
          const r = report || (typeof getVisibleReport === "function" ? getVisibleReport() : null);
          if (r) {
            renderWorkspaceSurface(activeView, r);
          }
        } catch(e) {}
      }
    };

    // Patch renderSystemStateStrip para propagar nos badges da sidebar premium
    const origStrip = window.renderSystemStateStrip;
    window.renderSystemStateStrip = function patchedRenderSystemStateStrip(report) {
      if (typeof origStrip === "function") {
        try { origStrip(report); } catch(e) {}
      } else if (_origRenderSystemStateStrip) {
        try { _origRenderSystemStateStrip(report); } catch(e) {}
      }
      // Propaga nos novos badges
      try {
        const memEl = document.getElementById("systemStateMemory");
        const healEl = document.getElementById("systemStateHealingReady");
        const memSide = document.getElementById("systemStateMemorySidebar");
        const healSide = document.getElementById("systemStateHealingReadySidebar");
        if (memEl && memSide && memEl.textContent !== memSide.textContent)
          memSide.textContent = memEl.textContent;
        if (healEl && healSide && healEl.textContent !== healSide.textContent)
          healSide.textContent = healEl.textContent;
        // Findings badge
        if (report) {
          const fi = document.getElementById("findingsCountBadge");
          if (fi) fi.textContent = String(report?.summary?.totalIssues ?? 0);
          const si = document.getElementById("seoMetric");
          if (si) si.textContent = String(report?.summary?.seoScore ?? 0);
          const qi = document.getElementById("qualityDashboardOverall");
          if (qi) {
            const snap = typeof buildDesktopIntelligenceSnapshot === "function"
              ? buildDesktopIntelligenceSnapshot(report) : null;
            const q = snap?.dataIntelligence?.QUALITY_STATE?.overallScore
              ?? snap?.autonomous?.qualityScore?.total ?? 0;
            qi.textContent = String(Math.round(Number(q) || 0));
          }
        }
      } catch(e) {}
    };

    // Patch syncOperatorShell para sincronizar campo URL do dock
    const origShell = window.syncOperatorShell;
    window.syncOperatorShell = function patchedSyncOperatorShell(report) {
      if (typeof origShell === "function") {
        try { origShell(report); } catch(e) {}
      } else if (_origSyncOperatorShell) {
        try { _origSyncOperatorShell(report); } catch(e) {}
      }
      // Sincroniza commandTargetUrl com targetUrl do motor
      try {
        const cmdUrl = document.getElementById("commandTargetUrl");
        const targetUrl = document.getElementById("targetUrl");
        if (cmdUrl && targetUrl && !cmdUrl.matches(":focus")) {
          const val = targetUrl.value || "";
          if (val && cmdUrl.value !== val) cmdUrl.value = val;
        }
      } catch(e) {}
    };
  }

  // ── Adiciona data-live-* attributes ao buildWorkspaceSurface ──
  // Monkey-patches o HTML gerado para incluir os markers de live update
  if (typeof window !== "undefined") {
    const origBuild = window.buildWorkspaceSurface;
    if (typeof origBuild === "function") {
      window.buildWorkspaceSurface = function patchedBuildWorkspaceSurface(viewName, report) {
        let html = origBuild(viewName, report);
        if (typeof html !== "string") return html;

        // Injeta data-live-* nos elementos chave via regex cirúrgico
        // Target na live posture card
        html = html.replace(
          /(<p class="mt-1 text-\[12px\] text-text-tertiary">)((?:https?:\/\/|—)[^<]*?)(<\/p>)/,
          '$1<span data-live-target="">$2</span>$3'
        );

        // Execution profile
        html = html.replace(
          /(Mode [a-z]+ · scope [a-z]+ · depth [a-z]+)/,
          '<span data-live-profile="">$1</span>'
        );

        // Signal pulse
        html = html.replace(
          /(SEO \w+ · Runtime \w+ · UX \w+)/,
          '<span data-live-signal="">$1</span>'
        );

        // System memory
        html = html.replace(
          /(\d+ entries · \d+ healing-ready · \d+ report assets)/,
          '<span data-live-memory="">$1</span>'
        );

        // Priority list container
        html = html.replace(
          /(<div class="workspace-list mt-4">)([\s\S]*?)(<\/div>\s*<\/section>\s*<section class="workspace-card">\s*<div class="workspace-kicker">Group<\/div>\s*<h3 class="mt-1 workspace-zone-title">Mission frame<\/h3>)/,
          '$1<div data-live-priority-list="">$2</div>$3'
        );

        return html;
      };
    }
  }

  // ── Live ticker: atualiza counters da sidebar a cada 1.5s ──
  // sem depender de nenhum evento — garante que os badges
  // ficam em sincronia mesmo quando nenhum render é disparado
  setInterval(function liveSidebarTicker() {
    try {
      const memEl = document.getElementById("systemStateMemory");
      const healEl = document.getElementById("systemStateHealingReady");
      _setText(document.getElementById("systemStateMemorySidebar"), memEl?.textContent ?? "0");
      _setText(document.getElementById("systemStateHealingReadySidebar"), healEl?.textContent ?? "0");

      // Audit chip — audit status ao vivo
      const auditChip = document.getElementById("auditChip");
      const auditStatus = document.querySelector("[data-shell='engineChip']");
      if (auditChip && auditStatus) {
        const isRunning = typeof uiState !== "undefined" && uiState.companionState?.audit?.running === true;
        if (isRunning) {
          const routes = typeof uiState !== "undefined"
            ? (uiState.liveReport?.summary?.routesChecked ?? 0) : 0;
          _setText(auditChip, `${routes} routes`);
          auditChip.closest(".ws-live-badge")?.style && (auditChip.closest(".ws-live-badge").style.borderColor = "rgba(52,211,153,0.35)");
        } else {
          _setText(auditChip, auditChip.dataset.status === "idle" ? "idle" : "ready");
          auditChip.closest(".ws-live-badge")?.style && (auditChip.closest(".ws-live-badge").style.borderColor = "");
        }
      }
    } catch(e) {}
  }, 1500);

  if (typeof appendLog === "function") {
    appendLog("[live-patch] workspace live update patch installed.");
  }
})();
