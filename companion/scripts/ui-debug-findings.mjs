import path from "node:path";
import process from "node:process";
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
    // Minimal placeholders for renderer.js
    routeSheets: [],
    timelines: [],
    stageBoard: [],
    evidence: [],
  },
};

const browser = await chromium.launch();
const page = await browser.newPage();

await page.exposeFunction("notifyWindowReady", () => {});

await page.goto(rendererUrl);

// Install mock bridge after navigation (renderer.js will pick it up).
await page.addInitScript((state, auditResponse) => {
  window.sitepulseRenderer = {
    getState: async () => state,
    runAuditFromAssistant: async () => ({ ok: true }),
    runAudit: async () => auditResponse,
    loadReportFile: async () => ({ ok: true }),
    exportCurrentReport: async () => ({ ok: true }),
    minimizeWindow: async () => ({ ok: true }),
    maximizeWindow: async () => ({ ok: true }),
    closeWindow: async () => ({ ok: true }),
    onLog: () => {},
    onState: () => {},
    onLiveReport: () => {},
    onWindowState: () => {},
  };
}, mockState, mockAuditResponse);

await page.waitForSelector(".studio-shell", { timeout: 45000 });
await page.waitForSelector('[data-view-panel="overview"].active', { timeout: 45000 });

await page.waitForTimeout(300);
await page.evaluate(() => {
  const input = document.getElementById("targetUrl");
  if (input) {
    input.value = "https://example.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
});

await page.locator('.app-sidebar button[data-view="findings"]').click({ force: true });
await page.waitForTimeout(250);

const findingsInfoBeforeAudit = await page.evaluate(() => {
  const panel = document.querySelector('[data-view-panel="findings"]');
  const isActive = panel?.classList.contains("active") ?? false;
  const display = panel ? getComputedStyle(panel).display : null;
  const activePanels = Array.from(document.querySelectorAll("[data-view-panel].active")).map((el) => el.dataset.viewPanel);
  const sidebarActive = Array.from(document.querySelectorAll(".app-sidebar button[data-view].active")).map((el) => el.dataset.view);
  return { exists: !!panel, isActive, display, activePanels, sidebarActive };
});

console.log("[ui-debug-findings::before-audit]", findingsInfoBeforeAudit);

await page.locator("#deepAuditButton").scrollIntoViewIfNeeded();
await page.locator("#deepAuditButton").click({ force: true });
await page.waitForTimeout(250);

await page.locator('.app-sidebar button[data-view="findings"]').click({ force: true });
await page.waitForTimeout(250);

const findingsInfoAfterAudit = await page.evaluate(() => {
  const panel = document.querySelector('[data-view-panel="findings"]');
  const isActive = panel?.classList.contains("active") ?? false;
  const display = panel ? getComputedStyle(panel).display : null;
  const activePanels = Array.from(document.querySelectorAll("[data-view-panel].active")).map((el) => el.dataset.viewPanel);
  const sidebarActive = Array.from(document.querySelectorAll(".app-sidebar button[data-view].active")).map((el) => el.dataset.view);
  return { exists: !!panel, isActive, display, activePanels, sidebarActive };
});

console.log("[ui-debug-findings::after-audit]", findingsInfoAfterAudit);

await browser.close();

