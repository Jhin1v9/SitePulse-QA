/**
 * Smoke: localStorage phase1 + navegação Findings/Settings → workspace-host.
 * Requer o mesmo ambiente que ui-contract.mjs (file:// + ES modules + bridge mock).
 *
 *   node scripts/phase1-workspace-smoke.mjs
 */
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererUrl = pathToFileURL(path.resolve(__dirname, "..", "src", "renderer.html")).href;

console.log("[phase1-smoke] renderer:", rendererUrl);

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
  logs: ["[studio] smoke log"],
};

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ["--disable-web-security", "--allow-file-access-from-files"],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 760 } });
  page.on("pageerror", (e) => console.error("PAGEERROR", e?.message || e));
  page.on("console", (msg) => {
    const t = msg.text();
    if (t.includes("error") || t.includes("Error") || t.includes("nav")) console.log("BROWSER_CONSOLE:", t);
  });

  await page.addInitScript(({ initialState }) => {
  localStorage.setItem("sitepulse-studio:onboarding-v1", JSON.stringify(true));
  localStorage.setItem("sitepulse:workspace-phase1", "1");

  window.sitePulseCompanion = {
    async getState() {
      return structuredClone(initialState);
    },
    async getWindowState() {
      return { focused: true, maximized: false, minimized: false };
    },
    async startBridge() {
      return { ok: true };
    },
    async stopBridge() {
      return { ok: true };
    },
    async runAudit() {
      return { ok: true, report: null };
    },
    async openReports() {
      return { ok: true };
    },
    async copyBridgeUrl() {
      return { ok: true };
    },
    onLog() {
      return () => {};
    },
    onState() {
      return () => {};
    },
    onLiveReport() {
      return () => {};
    },
    onWindowState(cb) {
      setTimeout(() => cb({ focused: true, maximized: false, minimized: false }), 0);
      return () => {};
    },
  };
  }, { initialState: mockState });

  await page.goto(rendererUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("#appBody", { timeout: 60000 });
  await page.waitForFunction(() => window.__SITEPULSE_RENDERER_BOOT === true, null, { timeout: 60000 });
  await page.waitForFunction(
    () => typeof window.sitePulseWorkspaceSystem?.navigateToView === "function",
    null,
    { timeout: 30000 },
  );
  await page.waitForTimeout(500);
  // Evita corrida com o fim do bootstrap / primeiro paint
  await page.waitForTimeout(2000);

  const before = await page.evaluate(() => {
    const host = document.getElementById("workspace-host");
    return {
      hostHidden: host ? host.classList.contains("hidden") : null,
      mainHidden: document.getElementById("mainGrid")?.classList.contains("hidden"),
    };
  });
  console.log("after boot (phase1):", before);

  // Navegação no próximo task: evita que page.evaluate fique preso se o motor do Playwright
  // serializar/esperar microtasks em conjunto com switchView/manager.switchTo.
  await page.evaluate(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          window.sitePulseWorkspaceSystem.navigateToView("findings");
        } catch (e) {
          console.error("[phase1-smoke] findings nav", e);
        }
        resolve();
      }, 0);
    });
  });
  await page.waitForFunction(
    () => {
      const inner = document.getElementById("workspaceSurfaceInner");
      const text = inner?.textContent || "";
      return text.includes("Issue command board") || text.includes("Findings workspace");
    },
    null,
    { timeout: 20000 },
  );
  const afterFindings = await page.evaluate(() => {
    const inner = document.getElementById("workspaceSurfaceInner");
    const text = inner?.textContent?.trim() || "";
    return {
      hostHidden: document.getElementById("workspace-host")?.classList.contains("hidden") ?? null,
      mainHidden: document.getElementById("mainGrid")?.classList.contains("hidden"),
      findingsTitle: text.includes("Issue command board") ? "Issue command board" : text.slice(0, 80),
      container: !!document.getElementById("workspaceSurfaceInner"),
    };
  });
  console.log("after findings:", afterFindings);

  const dbg = await page.evaluate(() => ({
    phase1Key: localStorage.getItem("sitepulse:workspace-phase1"),
    isPhase1: typeof window.sitePulseWorkspaceSystem?.isPhase1 === "function" ? window.sitePulseWorkspaceSystem.isPhase1() : null,
    active: window.workspaceManager?.activeWorkspace ?? null,
  }));
  console.log("[phase1-smoke] before settings nav:", dbg);

  // Mesmo padrão que findings (setTimeout 0): devolve o evaluate de imediato e evita
  // bloqueio do Playwright; switchView → manager.switchTo monta Settings.
  await page.evaluate(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          window.sitePulseWorkspaceSystem.navigateToView("settings");
        } catch (e) {
          console.error("[phase1-smoke] settings nav", e);
        }
        resolve();
      }, 0);
    });
  });

  try {
    await page.waitForFunction(
      () => {
        const inner = document.getElementById("workspaceSurfaceInner");
        const text = inner?.textContent || "";
        return text.includes("Runtime and intelligence policy") || text.includes("Settings workspace");
      },
      null,
      { timeout: 30000 },
    );
  } catch (e) {
    const dump = await page.evaluate(() => ({
      phase1: localStorage.getItem("sitepulse:workspace-phase1"),
      legacyWs: localStorage.getItem("sitepulse:workspace-system:enabled"),
      enabled: window.sitePulseWorkspaceSystem?.isEnabled?.(),
      phase1Fn: window.sitePulseWorkspaceSystem?.isPhase1?.(),
      active: window.workspaceManager?.activeWorkspace ?? null,
      hostDisplay: document.getElementById("workspace-host")?.style.display ?? null,
      hasSettingsClass: !!document.querySelector(".settings-workspace"),
      shellDataView: document.getElementById("workspaceShell")?.getAttribute("data-view") ?? null,
    }));
    console.error("[phase1-smoke] settings workspace não montou. Debug:", dump);
    throw e;
  }
  const afterSettings = await page.evaluate(() => {
    const inner = document.getElementById("workspaceSurfaceInner");
    const text = inner?.textContent?.trim() || "";
    return {
      hostHidden: document.getElementById("workspace-host")?.classList.contains("hidden") ?? null,
      settingsTitle: text.includes("Runtime and intelligence policy")
        ? "Runtime and intelligence policy"
        : text.slice(0, 80),
      container: !!document.getElementById("workspaceSurfaceInner"),
    };
  });
  console.log("after settings:", afterSettings);

  // Fase 1: só Findings + Settings (round-trip overview pode ser smoke separado — evita hang
  // em alguns ambientes no evaluate + navigateToView("overview") após Settings).

  const ok =
    afterFindings.findingsTitle === "Issue command board"
    && afterSettings.settingsTitle === "Runtime and intelligence policy";

  if (ok) {
    console.log("PHASE1_SMOKE_OK");
    process.exitCode = 0;
  } else {
    console.error("PHASE1_SMOKE_FAIL", { afterFindings, afterSettings });
    process.exitCode = 1;
  }
} catch (err) {
  console.error("PHASE1_SMOKE_ERROR", err?.message || err);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
}
process.exit(process.exitCode ?? 0);
