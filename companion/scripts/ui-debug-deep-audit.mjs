import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rendererUrl = pathToFileURL(path.resolve(__dirname, "..", "src", "renderer.html")).href;

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
  logs: Array.from({ length: 20 }, (_, idx) => `[studio] mocked runtime log line ${idx + 1}`),
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
      { route: "/", label: "Primary CTA", expectedForUser: "Open contact flow for the operator.", actualFunction: "No visible response after click." },
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
      },
      {
        id: "issue-2",
        code: "VISUAL_ALIGNMENT_DRIFT",
        severity: "low",
        route: "/pricing",
        action: "Pricing hero",
        detail: "Visual alignment drift detected.",
        recommendedResolution: "Adjust layout spacing to match reference.",
      },
    ],
    // placeholders expected by renderer normalization/renderers
    routeSheets: [],
    timelines: [],
    stageBoard: [],
    evidence: [],
    // assistant guide-like data used by some renderers
    assistantGuide: {
      status: "issues",
      issueCount: 2,
      immediateSteps: ["Fix issue 1", "Fix issue 2"],
      replayCommand:
        'node src/index.mjs --config "audit.default.json" --base-url "https://example.com" --scope full --no-server',
      quickStartPrompt: "Act as a senior engineer and fix the issues.",
    },
  },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });

page.on("pageerror", (err) => {
  console.error("[pageerror]", err?.stack || err?.message || err);
});

await page.addInitScript(
  ({ initialState, auditResponse }) => {
    let currentState = structuredClone(initialState);
    const listeners = { state: [], log: [], liveReport: [], window: [] };
    const notify = (kind) => listeners[kind].forEach((cb) => cb(structuredClone(currentState)));

    window.sitePulseCompanion = {
      getState: async () => structuredClone(currentState),
      onLog: (cb) => {
        listeners.log.push(cb);
        return () => {};
      },
      onState: (cb) => {
        listeners.state.push(cb);
        cb(structuredClone(currentState));
        return () => {};
      },
      onLiveReport: (cb) => {
        listeners.liveReport.push(cb);
        return () => {};
      },
      onWindowState: (cb) => {
        listeners.window.push(cb);
        setTimeout(() => cb({ focused: true, maximized: false, minimized: false }), 0);
        return () => {};
      },
      async runAudit(payload) {
        currentState.audit.running = true;
        currentState.audit.status = "running";
        currentState.audit.baseUrl = payload?.baseUrl || currentState.audit.baseUrl;
        notify("state");
        // Simulate async completion.
        await new Promise((r) => setTimeout(r, 50));
        currentState.audit.running = false;
        currentState.audit.status = "idle";
        notify("state");
        return auditResponse;
      },
      async exportReportFile() {
        return { ok: true };
      },
      async loadReportFile() {
        return { ok: true };
      },
      async copyBridgeUrl() {
        return { ok: true };
      },
      async openLatestEvidence() {
        return { ok: true };
      },
      async openReports() {
        return { ok: true };
      },
      async openExternalUrl() {
        return { ok: true };
      },
      async minimizeWindow() {
        return { ok: true };
      },
      async maximizeWindow() {
        return { ok: true };
      },
      async closeWindow() {
        return { ok: true };
      },
      async startBridge() {
        currentState.bridge.running = true;
        notify("state");
        return { ok: true };
      },
      async stopBridge() {
        currentState.bridge.running = false;
        notify("state");
        return { ok: true };
      },
      async setLaunchOnLogin() {
        return { ok: true };
      },
    };
  },
  { initialState: mockState, auditResponse: mockAuditResponse },
);

await page.goto(rendererUrl);
await page.waitForSelector(".studio-shell", { timeout: 45000 });

const input = await page.$("#targetUrl");
if (input) {
  await input.fill("https://example.com");
  await page.evaluate(() => {
    const el = document.getElementById("targetUrl");
    if (!el) return;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

await page.locator("#deepAuditButton").scrollIntoViewIfNeeded();
await page.locator("#deepAuditButton").click({ force: true });

await page.waitForTimeout(500);

const issuesMetric = await page.evaluate(() => document.getElementById("issuesMetric")?.textContent?.trim() || "");
const activeView = await page.evaluate(() => document.querySelector('.view-panel.active')?.dataset?.viewPanel || null);
const headlineStatus = await page.evaluate(() => document.getElementById("headlineStatus")?.textContent?.trim() || "");
const auditChip = await page.evaluate(() => document.getElementById("auditChip")?.textContent?.trim() || "");

console.log("[ui-debug-deep-audit]", { issuesMetric, activeView, headlineStatus, auditChip });

await browser.close();

