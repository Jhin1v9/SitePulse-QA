import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rendererUrl = pathToFileURL(path.resolve(__dirname, "..", "src", "renderer.html")).href;

function fail(message) {
  throw new Error(`ui_contract_failed: ${message}`);
}

const mockState = {
  serviceName: "SitePulse Studio",
  version: "1.0.0",
  qaRuntimeDir: "C:\\Runtime\\qa",
  reportsDir: "C:\\Runtime\\qa\\reports",
  launchOnLogin: false,
  platform: process.platform,
  bridge: {
    running: true,
    host: "127.0.0.1",
    port: 47891,
    service: "sitepulse-desktop-bridge",
  },
  audit: {
    running: false,
    status: "idle",
    baseUrl: "",
    mode: "desktop",
    scope: "full",
    depth: "signal",
    startedAt: "",
    finishedAt: "",
    durationMs: 0,
    lastCommand: "",
    lastError: "",
    usedFallback: false,
    lastSummary: null,
    liveReport: null,
    hasLiveReport: false,
    timeline: [],
    stageBoard: [],
    progress: {
      percentage: 0,
      phase: "idle",
      phaseLabel: "Ready",
      detail: "Waiting for the next run.",
      routeIndex: 0,
      totalRoutes: 0,
      labelIndex: 0,
      totalLabels: 0,
      currentRoute: "",
      currentAction: "",
      lastEventType: "",
    },
  },
  logs: Array.from({ length: 120 }, (_, index) => `[studio] mocked runtime log line ${index + 1}`),
};

const mockAuditResponse = {
  ok: true,
  command: 'node src/index.mjs --config "audit.default.json" --base-url "https://example.com" --scope full --no-server',
  report: {
    meta: {
      baseUrl: "https://example.com",
      startedAt: "2026-03-10T00:00:00.000Z",
      finishedAt: "2026-03-10T00:00:05.000Z",
      replayCommand: 'node src/index.mjs --config "audit.default.json" --base-url "https://example.com" --scope full --no-server',
      auditMode: "desktop",
      auditDepth: "deep",
    },
    summary: {
      auditScope: "full",
      routesChecked: 12,
      buttonsChecked: 7,
      actionsMapped: 7,
      totalIssues: 2,
      seoScore: 88,
      seoCriticalIssues: 0,
      seoTotalIssues: 2,
      buttonsNoEffect: 1,
      visualSectionOrderInvalid: 0,
      visualLayoutOverflow: 0,
      visualLayerOverlap: 0,
      visualAlignmentDrift: 1,
      visualQualityIssues: 1,
      consoleErrors: 0,
      durationMs: 5000,
    },
    routeSweep: [
      { route: "/", loadOk: true, buttonsDiscovered: 4, buttonsClicked: 4 },
      { route: "/pricing", loadOk: true, buttonsDiscovered: 3, buttonsClicked: 3 },
    ],
    actionSweep: [
      {
        route: "/",
        label: "Primary CTA",
        expectedForUser: "Open contact flow for the operator.",
        actualFunction: "No visible response after click.",
      },
    ],
    issues: [
      {
        id: "issue-1",
        code: "BTN_NO_EFFECT",
        severity: "medium",
        route: "/",
        action: "Primary CTA",
        detail: "The main CTA does not trigger any visible action.",
        recommendedResolution: "Reconnect the CTA to the intended contact workflow and validate the click effect.",
        assistantHint: {
          priority: "P1",
          firstChecks: ["Inspect click binding", "Validate href/onClick target"],
        },
        diagnosis: {
          laymanExplanation: "The main button looks active but does nothing for the user.",
          technicalExplanation: "The CTA path is mounted without a visible effect or redirect.",
          technicalChecks: ["Inspect renderer binding for the CTA action"],
          commandHints: ["npm run desktop:smoke"],
          likelyAreas: ["companion/src/renderer.js"],
        },
        evidence: [
          {
            type: "screenshot",
            path: "C:\\mock\\artifacts\\cta-no-effect.png",
            label: "Primary CTA state",
            route: "/",
            code: "BTN_NO_EFFECT",
          },
        ],
      },
      {
        id: "issue-2",
        code: "VISUAL_ALIGNMENT_DRIFT",
        severity: "low",
        route: "/pricing",
        action: "visual_quality:alignment",
        detail: "pricing-section left=84px, drift=36px from the dominant content column.",
        recommendedResolution: "Normalize the left gutter and max-width for the pricing section.",
        assistantHint: {
          priority: "P2",
          firstChecks: ["Compare the pricing wrapper against the main content container", "Remove the isolated horizontal offset"],
        },
        diagnosis: {
          laymanExplanation: "One section is visually shifted and breaks the page rhythm.",
          technicalExplanation: "A major block does not align with the dominant content column used by the rest of the page.",
          technicalChecks: ["Inspect container width, padding and margin-left on the pricing wrapper"],
          commandHints: ["rg -n \"pricing|container|max-width|padding\" src"],
          likelyAreas: ["src/components/pricing/**"],
        },
        evidence: [
          {
            type: "screenshot",
            path: "C:\\mock\\artifacts\\pricing-alignment.png",
            label: "Pricing alignment drift",
            route: "/pricing",
            code: "VISUAL_ALIGNMENT_DRIFT",
          },
        ],
      },
    ],
    seo: {
      overallScore: 88,
      topRecommendations: ["Tighten metadata on the pricing page."],
    },
    assistantGuide: {
      status: "issues",
      issueCount: 2,
      immediateSteps: ["Reconnect the broken CTA.", "Normalize the pricing section alignment.", "Re-run the desktop smoke after the fix."],
      replayCommand: 'node src/index.mjs --config "audit.default.json" --base-url "https://example.com" --scope full --no-server',
      quickStartPrompt: "Act as a senior engineer and fix the CTA no-effect failure first, then normalize the pricing alignment drift.",
    },
  },
};

const browser = await chromium.launch({
  headless: true,
  args: ["--disable-web-security", "--allow-file-access-from-files"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
page.on("pageerror", (error) => {
  process.stderr.write(`PAGEERROR ${error?.stack || error?.message || error}\n`);
});

await page.addInitScript(
  ({ initialState, auditResponse }) => {
    localStorage.setItem("sitepulse-studio:onboarding-v1", JSON.stringify(true));
    localStorage.removeItem("sitepulse-studio:last-report-v1");
    localStorage.removeItem("sitepulse-studio:run-history-v1");
    localStorage.removeItem("sitepulse-studio:baseline-v1");
    localStorage.removeItem("sitepulse-studio:last-profile-v1");

    let currentState = structuredClone(initialState);
    const listeners = {
      log: [],
      state: [],
      liveReport: [],
      window: [],
    };

    const notifyState = () => {
      listeners.state.forEach((callback) => callback(structuredClone(currentState)));
    };

    let runCount = 0;

    window.sitePulseCompanion = {
      async getState() {
        return structuredClone(currentState);
      },
      async getWindowState() {
        return {
          focused: true,
          maximized: false,
          minimized: false,
        };
      },
      async startBridge() {
        currentState.bridge.running = true;
        notifyState();
        return { ok: true };
      },
      async stopBridge() {
        currentState.bridge.running = false;
        notifyState();
        return { ok: true };
      },
      async runAudit(payload) {
        runCount += 1;
        currentState.audit.running = true;
        currentState.audit.status = "running";
        currentState.audit.baseUrl = payload.baseUrl;
        currentState.audit.mode = payload.mode;
        currentState.audit.scope = payload.scope;
        currentState.audit.depth = payload.fullAudit ? "deep" : "signal";
        currentState.audit.progress = {
          percentage: 42,
          phase: "button_click_start",
          phaseLabel: "Testing action",
          detail: "Route 1/2 · action 1/1 · Primary CTA",
          routeIndex: 1,
          totalRoutes: 2,
          labelIndex: 1,
          totalLabels: 1,
          currentRoute: "/",
          currentAction: "Primary CTA",
          lastEventType: "button_click_start",
        };
        currentState.audit.timeline = [
          {
            id: `timeline-${runCount}-1`,
            stage: "boot",
            label: "Preparing runtime",
            status: "done",
            detail: "Runtime prepared and browser launch started.",
            route: "",
            action: "",
            at: `2026-03-10T00:00:0${runCount}.000Z`,
          },
          {
            id: `timeline-${runCount}-2`,
            stage: "actions",
            label: "Testing action",
            status: "active",
            detail: "Route 1/2 | action 1/1 | Primary CTA",
            route: "/",
            action: "Primary CTA",
            at: `2026-03-10T00:00:0${runCount}.500Z`,
          },
        ];
        currentState.audit.stageBoard = [
          { id: "boot", label: "Runtime boot", status: "done", detail: "Runtime prepared and browser launch started.", evidenceCount: 1, route: "", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.000Z` },
          { id: "discovery", label: "Route discovery", status: "done", detail: "Primary route map discovered.", evidenceCount: 1, route: "/", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.100Z` },
          { id: "routes", label: "Route loading", status: "done", detail: "Home route loaded successfully.", evidenceCount: 1, route: "/", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.200Z` },
          { id: "visual", label: "Visual validation", status: "idle", detail: "Waiting for this phase.", evidenceCount: 0, route: "", action: "", updatedAt: "" },
          { id: "actions", label: "Action mapping", status: "active", detail: "Primary CTA is under test.", evidenceCount: 1, route: "/", action: "Primary CTA", updatedAt: `2026-03-10T00:00:0${runCount}.500Z` },
          { id: "briefing", label: "Operator brief", status: "idle", detail: "Waiting for this phase.", evidenceCount: 0, route: "", action: "", updatedAt: "" },
          { id: "finish", label: "Finalization", status: "idle", detail: "Waiting for this phase.", evidenceCount: 0, route: "", action: "", updatedAt: "" },
        ];
        notifyState();
        const partialReport = structuredClone(auditResponse.report);
        partialReport.meta.startedAt = `2026-03-10T00:00:0${runCount}.000Z`;
        partialReport.meta.finishedAt = "";
        partialReport.meta.auditMode = payload.mode;
        partialReport.meta.auditDepth = payload.fullAudit ? "deep" : "signal";
        partialReport.summary.auditScope = payload.scope;
        partialReport.summary.routesChecked = 4;
        partialReport.summary.actionsMapped = 2;
        partialReport.summary.buttonsChecked = 2;
        partialReport.summary.totalIssues = runCount > 1 ? 0 : 2;
        partialReport.summary.seoScore = 71;
        partialReport.summary.visualAlignmentDrift = runCount > 1 ? 0 : 1;
        partialReport.summary.visualQualityIssues = runCount > 1 ? 0 : 1;
        partialReport.routeSweep = partialReport.routeSweep.slice(0, 1);
        partialReport.actionSweep = partialReport.actionSweep.slice(0, 1);
        partialReport.issues = runCount > 1 ? [] : partialReport.issues;
        currentState.audit.liveReport = structuredClone(partialReport);
        currentState.audit.hasLiveReport = true;
        listeners.liveReport.forEach((callback) => callback(structuredClone(partialReport)));
        notifyState();
        await new Promise((resolve) => setTimeout(resolve, 80));
        const report = structuredClone(auditResponse.report);
        report.meta.startedAt = `2026-03-10T00:00:0${runCount}.000Z`;
        report.meta.finishedAt = `2026-03-10T00:00:1${runCount}.000Z`;
        report.meta.replayCommand = auditResponse.command;
        report.meta.auditMode = payload.mode;
        report.meta.auditDepth = payload.fullAudit ? "deep" : "signal";
        report.summary.auditScope = payload.scope;

        if (runCount > 1) {
          report.summary.totalIssues = 0;
          report.summary.buttonsNoEffect = 0;
          report.summary.seoScore = 93;
          report.summary.routesChecked = 14;
          report.summary.actionsMapped = 8;
          report.summary.buttonsChecked = 8;
          report.issues = [];
          report.seo.overallScore = 93;
          report.assistantGuide.issueCount = 0;
          report.assistantGuide.status = "clean";
          report.assistantGuide.immediateSteps = ["Keep this run as the new baseline."];
          report.assistantGuide.quickStartPrompt = "Act as a release engineer and verify the clean baseline stays stable.";
        }

        currentState.audit = {
          ...currentState.audit,
          running: false,
          status: runCount > 1 ? "clean" : "issues",
          baseUrl: payload.baseUrl,
          mode: payload.mode,
          scope: payload.scope,
          depth: payload.fullAudit ? "deep" : "signal",
          durationMs: 5000,
          lastCommand: auditResponse.command,
          liveReport: null,
          hasLiveReport: false,
          timeline: [
            {
              id: `timeline-${runCount}-3`,
              stage: "finish",
              label: "Run finished",
              status: "done",
              detail: runCount > 1 ? "Run completed clean." : "Run completed with 1 issue(s).",
              route: "/pricing",
              action: "Primary CTA",
              at: `2026-03-10T00:00:1${runCount}.000Z`,
            },
            ...currentState.audit.timeline,
          ],
          stageBoard: [
            { id: "boot", label: "Runtime boot", status: "done", detail: "Runtime prepared and browser launch started.", evidenceCount: 1, route: "", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.000Z` },
            { id: "discovery", label: "Route discovery", status: "done", detail: "Primary route map discovered.", evidenceCount: 1, route: "/", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.100Z` },
            { id: "routes", label: "Route loading", status: "done", detail: "Pricing route loaded successfully.", evidenceCount: 2, route: "/pricing", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.700Z` },
            { id: "visual", label: "Visual validation", status: runCount > 1 ? "done" : "issue", detail: runCount > 1 ? "Visual pass completed without findings." : "CTA surface requires follow-up validation.", evidenceCount: 1, route: "/", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.750Z` },
            { id: "actions", label: "Action mapping", status: runCount > 1 ? "done" : "issue", detail: runCount > 1 ? "CTA behavior validated after fix." : "Primary CTA produced no visible effect.", evidenceCount: 2, route: "/", action: "Primary CTA", updatedAt: `2026-03-10T00:00:0${runCount}.800Z` },
            { id: "briefing", label: "Operator brief", status: "done", detail: "Immediate steps prepared for the operator.", evidenceCount: 1, route: "", action: "", updatedAt: `2026-03-10T00:00:0${runCount}.900Z` },
            { id: "finish", label: "Finalization", status: "done", detail: runCount > 1 ? "Run completed clean." : "Run completed with 1 issue(s).", evidenceCount: 1, route: "", action: "", updatedAt: `2026-03-10T00:00:1${runCount}.000Z` },
          ],
          progress: {
            percentage: 100,
            phase: "runner_finished",
            phaseLabel: "Run finished",
            detail: runCount > 1 ? "Run completed clean." : "Run completed with 1 issue(s).",
            routeIndex: 2,
            totalRoutes: 2,
            labelIndex: 1,
            totalLabels: 1,
            currentRoute: "/pricing",
            currentAction: "Primary CTA",
            lastEventType: "runner_finished",
          },
        };
        listeners.log.forEach((callback) => callback(`[studio] mocked audit for ${payload.baseUrl}`));
        notifyState();
        return {
          ok: true,
          command: auditResponse.command,
          report,
        };
      },
      async openCmdWindow() {
        currentState.audit.running = true;
        currentState.audit.status = "running";
        currentState.audit.baseUrl = "https://example.com";
        currentState.audit.progress = {
          ...currentState.audit.progress,
          percentage: 18,
          phase: "runner_ready",
          phaseLabel: "CMD flow opened",
          detail: "External CMD flow opened. Waiting for live checkpoints.",
        };
        notifyState();
        setTimeout(() => {
          currentState.audit.running = false;
          currentState.audit.status = "clean";
          currentState.audit.progress = {
            ...currentState.audit.progress,
            percentage: 100,
            phase: "runner_finished",
            phaseLabel: "Run finished",
            detail: "Run completed clean.",
          };
          notifyState();
        }, 120);
        listeners.log.forEach((callback) => callback("[studio] mocked cmd flow"));
        return { ok: true, message: "Mocked CMD flow launched." };
      },
      async openReports() {
        return { ok: true };
      },
      async openLatestEvidence() {
        return { ok: true, path: "C:\\Runtime\\qa\\reports\\latest.json" };
      },
      async openExternalUrl(value) {
        return { ok: true, url: value };
      },
      async copyBridgeUrl() {
        return { ok: true };
      },
      async copyText() {
        return { ok: true };
      },
      async pickReportFile() {
        return { ok: false, error: "file_pick_cancelled" };
      },
      async exportReportFile() {
        return { ok: true, path: "C:\\Runtime\\qa\\reports\\snapshot.json" };
      },
      async getLaunchOnLogin() {
        return { ok: true, enabled: false };
      },
      async setLaunchOnLogin(enabled) {
        currentState.launchOnLogin = enabled === true;
        notifyState();
        return { ok: true, enabled: currentState.launchOnLogin };
      },
      async minimizeWindow() {
        return { ok: true };
      },
      async toggleMaximizeWindow() {
        return { ok: true, maximized: false };
      },
      async closeWindow() {
        return { ok: true };
      },
      onLog(callback) {
        listeners.log.push(callback);
        return () => {};
      },
      onState(callback) {
        listeners.state.push(callback);
        return () => {};
      },
      onLiveReport(callback) {
        listeners.liveReport.push(callback);
        return () => {};
      },
      onWindowState(callback) {
        listeners.window.push(callback);
        setTimeout(() => callback({ focused: true, maximized: false, minimized: false }), 0);
        return () => {};
      },
    };
  },
  { initialState: mockState, auditResponse: mockAuditResponse },
);

try {
  await page.goto(rendererUrl);
  await page.waitForSelector(".studio-shell");
  await page.waitForSelector('[data-view-panel="overview"].active');
  const assistantOpen = await page.evaluate(() => document.getElementById("assistantWorkspace") && !document.getElementById("assistantWorkspace").classList.contains("hidden"));
  if (assistantOpen) {
    await page.getByRole("button", { name: "AI Inspector" }).click();
    await page.waitForTimeout(80);
  }

  const readNavigationState = async () =>
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("[data-view]"));
      const labels = buttons.map((button) => button.textContent?.trim() || "");
      const computed = getComputedStyle(document.querySelector(".workspace-body"));
      const shell = document.querySelector(".workspace-shell");
      const shellWidth = shell instanceof HTMLElement ? shell.getBoundingClientRect().width : 0;
      const viewportWidth = window.innerWidth || 0;
      const logView = document.querySelector(".log-view");
      const stepsList = document.querySelector(".steps-list");
      const dnaList = document.querySelector(".dna-list");
      const menuStrip = document.querySelector(".menu-strip");
      const menuButtons = Array.from(document.querySelectorAll(".menu-strip .menu-btn"));
      const tabButtons = Array.from(document.querySelectorAll(".workspace-tabbar .workspace-tab"));
      return {
        count: buttons.length,
        hasSettings: labels.some((label) => label.includes("Settings")),
        hasOperations: labels.some((label) => label.includes("Operations") || label.includes("Runs")),
        shellWidthRatio: viewportWidth > 0 ? shellWidth / viewportWidth : 0,
        workspaceOverflowY: computed.overflowY,
        logOverflowY: logView ? getComputedStyle(logView).overflowY : "missing",
        stepsOverflowY: stepsList ? getComputedStyle(stepsList).overflowY : "missing",
        dnaOverflowY: dnaList ? getComputedStyle(dnaList).overflowY : "missing",
        menuOverflowX: menuStrip ? getComputedStyle(menuStrip).overflowX : "missing",
        wrappedMenuButtons: menuButtons.filter((button) => button.getBoundingClientRect().height > 44).length,
        wrappedTabButtons: tabButtons.filter((button) => button.getBoundingClientRect().height > 50).length,
      };
    });

  const navigationState = await readNavigationState();

  if (navigationState.count < 5 || !navigationState.hasSettings || !navigationState.hasOperations) {
    fail(`navigation stack is incomplete (count=${navigationState.count}, settings=${navigationState.hasSettings}, operations=${navigationState.hasOperations})`);
  }

  if (navigationState.shellWidthRatio < 0.75) {
    fail("workspace shell is unexpectedly compressed for the viewport");
  }

  if (!["auto", "scroll"].includes(navigationState.workspaceOverflowY)) {
    fail("workspace overflow is not configured");
  }

  if (
    !["auto", "scroll"].includes(navigationState.logOverflowY) ||
    !["auto", "scroll"].includes(navigationState.stepsOverflowY) ||
    !["auto", "scroll"].includes(navigationState.dnaOverflowY)
  ) {
    fail("internal scroll surfaces are not configured");
  }

  if (!["auto", "scroll"].includes(navigationState.menuOverflowX)) {
    fail("menu strip horizontal overflow handling is missing");
  }

  if (navigationState.wrappedMenuButtons > 0 || navigationState.wrappedTabButtons > 0) {
    fail("menu or workspace tabs wrapped unexpectedly");
  }

  for (const viewportWidth of [1536, 1280, 1060]) {
    await page.setViewportSize({ width: viewportWidth, height: 760 });
    await page.waitForTimeout(30);
    const stateAtWidth = await readNavigationState();
    if (stateAtWidth.shellWidthRatio < 0.75) {
      fail(`workspace shell compressed at width ${viewportWidth}`);
    }
    if (stateAtWidth.wrappedMenuButtons > 0 || stateAtWidth.wrappedTabButtons > 0) {
      fail(`menu or workspace tabs wrapped at width ${viewportWidth}`);
    }
  }

  await page.setViewportSize({ width: 1280, height: 760 });

  const initialScroll = await page.evaluate(() => {
    const workspaceBody = document.querySelector(".workspace-body");
    if (!(workspaceBody instanceof HTMLElement)) {
      return { exists: false };
    }
    return {
      exists: true,
      scrollHeight: workspaceBody.scrollHeight,
      clientHeight: workspaceBody.clientHeight,
    };
  });

  if (!initialScroll.exists) {
    fail("workspace body missing");
  }

  if (initialScroll.scrollHeight <= initialScroll.clientHeight) {
    fail("workspace body is not scrollable");
  }

  const scrollTop = await page.evaluate(() => {
    const workspaceBody = document.querySelector(".workspace-body");
    if (!(workspaceBody instanceof HTMLElement)) return -1;
    workspaceBody.scrollTop = 520;
    return workspaceBody.scrollTop;
  });

  if (scrollTop <= 0) {
    fail("workspace body did not move after scroll");
  }

  await page.evaluate(() => {
    const input = document.getElementById("targetUrl");
    if (input) {
      input.value = "https://example.com";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(200);

  await page.getByRole("button", { name: "Run deep audit" }).click();
  await page.waitForFunction(() => Number(document.getElementById("issuesMetric")?.textContent?.trim() || "0") >= 1);
  await page.waitForFunction(() => document.querySelectorAll("#timelineList .timeline-entry").length >= 1);
  await page.waitForFunction(() => document.querySelectorAll("#stageBoard .stage-card").length >= 4);
  await page.waitForFunction(() => Number(document.getElementById("issuesMetric")?.textContent?.trim() || "0") >= 1);
  await page.locator('.app-sidebar button[data-view="findings"]').click({ force: true });
  await page.waitForSelector('[data-view-panel="findings"].active');
  await page.waitForFunction(() => document.getElementById("auditProgressPercent")?.textContent?.trim() === "100%");

  const findingsState = await page.evaluate(() => ({
    issuesMetric: document.getElementById("issuesMetric")?.textContent?.trim(),
    currentCommand: document.getElementById("currentCommand")?.textContent?.trim(),
    historyItems: document.querySelectorAll("[data-history-index]").length,
    routeSignal: document.getElementById("buttonSignal")?.textContent?.trim(),
    routeCards: document.querySelectorAll("#routeList .explorer-item").length,
    actionCards: document.querySelectorAll("#actionList .explorer-item").length,
    visualSignal: document.getElementById("visualSignal")?.textContent?.trim(),
    visualAlignment: document.getElementById("visualAlignmentCount")?.textContent?.trim(),
    visualHeadline: document.getElementById("visualQualityHeadline")?.textContent?.trim(),
    evidenceHeadline: document.getElementById("evidenceHeadline")?.textContent?.trim(),
    etaText: document.getElementById("auditProgressEta")?.textContent?.trim(),
    progressPercent: document.getElementById("auditProgressPercent")?.textContent?.trim(),
    progressLabel: document.getElementById("auditProgressLabel")?.textContent?.trim(),
    reportsHeadline: document.getElementById("reportsHeadline")?.textContent?.trim(),
    findingsHeadline: document.getElementById("findingsHeadline")?.textContent?.trim(),
    timelineItems: document.querySelectorAll("#timelineList .timeline-entry").length,
    stageItems: document.querySelectorAll("#stageBoard .stage-card").length,
  }));

  if (findingsState.issuesMetric !== "2") {
    fail("issues metric did not update");
  }

  if (!findingsState.currentCommand?.includes("node src/index.mjs")) {
    fail("replay command not rendered");
  }

  if (findingsState.historyItems < 1) {
    fail("history snapshot was not recorded");
  }

  if (findingsState.routeSignal !== "1") {
    fail("button signal did not reflect the mocked issue");
  }

  if (findingsState.visualSignal !== "1" || findingsState.visualAlignment !== "1") {
    fail("visual quality counters did not reflect the mocked visual issue");
  }

  if (!findingsState.visualHeadline?.includes("Alignment drift")) {
    fail("visual quality headline did not surface the top visual issue");
  }

  if (!findingsState.evidenceHeadline?.includes("screenshot")) {
    fail("evidence gallery did not acknowledge attached screenshot proof");
  }

  if (!findingsState.etaText || findingsState.etaText === "ETA calibrating") {
    fail("eta text did not move beyond calibration");
  }

  if (findingsState.routeCards < 1 || findingsState.actionCards < 1) {
    fail("coverage explorers were not populated");
  }

  if (findingsState.progressPercent !== "100%" || findingsState.progressLabel !== "Run finished") {
    fail("progress bar did not reflect the completed run");
  }

  if (!findingsState.reportsHeadline?.includes("stored snapshot")) {
    fail("final report headline did not switch back from live snapshot");
  }

  if (!findingsState.findingsHeadline?.includes("Top visible finding")) {
    fail("findings headline did not switch back to final issue messaging");
  }

  if (findingsState.timelineItems < 1 || findingsState.stageItems < 4) {
    fail("execution timeline or stage board did not render");
  }

  await page.locator('[data-view="operations"]').click();
  await page.waitForSelector('[data-view-panel="operations"].active');
  await page.waitForFunction(() => document.querySelectorAll("#timelineList .timeline-entry").length >= 1);

  await page.locator('[data-view="compare"]').click();
  await page.waitForSelector('[data-view-panel="compare"].active');
  await page.getByRole("button", { name: "Pin current as baseline" }).click();

  await page.getByRole("button", { name: "Overview" }).click();
  await page.getByRole("button", { name: "Run native audit" }).click();
  await page.waitForFunction(() => document.querySelectorAll("[data-history-index]").length >= 2);

  await page.locator('[data-view="compare"]').click();
  await page.waitForFunction(() => {
    const issueDelta = document.getElementById("compareIssueDelta")?.textContent?.trim();
    const seoDelta = document.getElementById("compareSeoDelta")?.textContent?.trim();
    const headline = document.getElementById("compareHeadline")?.textContent?.trim() || "";
    return issueDelta === "-2" && seoDelta === "+5" && !headline.toLowerCase().includes("live snapshot");
  });
  const comparisonState = await page.evaluate(() => ({
    compareHeadline: document.getElementById("compareHeadline")?.textContent?.trim(),
    compareIssueDelta: document.getElementById("compareIssueDelta")?.textContent?.trim(),
    compareSeoDelta: document.getElementById("compareSeoDelta")?.textContent?.trim(),
    issuesMetric: document.getElementById("issuesMetric")?.textContent?.trim(),
    resolvedCount: document.querySelectorAll("#compareResolvedIssuesList .explorer-item").length,
    persistentCount: document.querySelectorAll("#comparePersistentIssuesList .explorer-item").length,
    regressionCount: document.querySelectorAll("#compareRegressionIssuesList .explorer-item").length,
    persistentDelta: document.getElementById("comparePersistentDelta")?.textContent?.trim(),
    regressionDelta: document.getElementById("compareRegressionDelta")?.textContent?.trim(),
  }));

  if (!comparisonState.compareHeadline?.includes("baseline")) {
    fail("comparison headline did not bind to baseline");
  }

  if (comparisonState.compareIssueDelta !== "-2") {
    fail("comparison issue delta is incorrect");
  }

  if (comparisonState.issuesMetric !== "0") {
    fail("clean follow-up run did not replace the visible issue count");
  }

  if (comparisonState.compareSeoDelta !== "+5") {
    fail("comparison seo delta is incorrect");
  }

  if (comparisonState.resolvedCount < 1) {
    fail("resolved comparison list was not populated");
  }

  if (comparisonState.persistentCount !== 0 || comparisonState.regressionCount !== 0) {
    fail("comparison classification counts are incorrect");
  }

  if (comparisonState.persistentDelta !== "0" || comparisonState.regressionDelta !== "0") {
    fail("comparison classification metrics are incorrect");
  }

  await page.getByRole("button", { name: "Overview" }).click();
  await page.getByRole("button", { name: "Mobile" }).click();
  await page.waitForFunction(() => !document.getElementById("mobileSweepControls")?.classList.contains("hidden"));
  await page.getByRole("button", { name: "Family sweep" }).click();
  const mobileSweepState = await page.evaluate(() => ({
    hint: document.getElementById("mobileSweepHint")?.textContent?.trim() || "",
    runCmdDisabled: !!document.getElementById("runCmd")?.hasAttribute("disabled"),
    matrixVisible: !document.getElementById("mobileMatrixPanel")?.classList.contains("hidden"),
  }));

  if (!mobileSweepState.hint.toLowerCase().includes("family sweep")) {
    fail("mobile family hint did not update");
  }

  if (!mobileSweepState.runCmdDisabled) {
    fail("cmd flow should be disabled for mobile family sweep");
  }

  if (!mobileSweepState.matrixVisible) {
    fail("mobile matrix panel did not become visible in mobile mode");
  }

  await page.keyboard.press("Control+K");
  await page.waitForFunction(() => !document.getElementById("commandPaletteOverlay")?.classList.contains("hidden"));
  await page.fill("#commandPaletteSearch", "settings");
  await page.keyboard.press("Enter");
  await page.waitForSelector('[data-view-panel="settings"].active');

  await page.keyboard.press("?");
  await page.waitForFunction(() => !document.getElementById("shortcutsOverlay")?.classList.contains("hidden"));
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => document.getElementById("shortcutsOverlay")?.classList.contains("hidden"));

  await page.getByRole("button", { name: "Overview" }).click();
  await page.getByRole("button", { name: "Desktop" }).click();
  await page.getByRole("button", { name: "Open full CMD flow" }).click();
  await page.waitForFunction(() => document.getElementById("auditChip")?.textContent?.toLowerCase().includes("audit running"));

  await page.getByRole("button", { name: "Settings" }).click();
  await page.waitForSelector('[data-view-panel="settings"].active');
  await page.waitForFunction(() => document.getElementById("stopBridge") && !document.getElementById("stopBridge").disabled);
  await page.getByRole("button", { name: "Stop engine" }).click();
  await page.waitForFunction(() => document.getElementById("bridgeStatus")?.textContent?.trim() === "offline");
  await page.getByRole("button", { name: "Start engine" }).click();
  await page.waitForFunction(() => document.getElementById("bridgeStatus")?.textContent?.includes("127.0.0.1"));
} finally {
  await browser.close();
}

process.stdout.write("SITEPULSE_DESKTOP_UI_CONTRACT_OK\n");
