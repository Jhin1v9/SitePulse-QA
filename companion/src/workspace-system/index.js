/**
 * WORKSPACE SYSTEM - Entry Point
 *
 * Inicializa o sistema de workspaces independentes.
 * NÃO auto executa. O cutover é manual.
 *
 * USO:
 * import { initWorkspaceSystem } from "./workspace-system/index.js";
 * const manager = initWorkspaceSystem();
 */

import { WorkspaceManager } from "./workspace-manager.js";
import { OperatorWorkspace } from "./workspaces/operator-workspace.js";
import { FindingsWorkspace } from "./workspaces/findings-workspace.js";
import { SEOWorkspace } from "./workspaces/seo-workspace.js";
import { CompareWorkspace } from "./workspaces/compare-workspace.js";
import { SettingsWorkspace } from "./workspaces/settings-workspace.js";
import { injectGlobalStyles } from "./shared/styles.js";
import { injectComponentStyles } from "./shared/components.js";
import { dataBridge } from "./integrations/data-bridge.js";

export function detectEnvironment() {
  const report = {
    dataShell: {
      found: !!document.querySelector("[data-shell]"),
      keys: Array.from(new Set(Array.from(document.querySelectorAll("[data-shell]")).map((el) => el.dataset.shell))).filter(Boolean),
      sample: document.querySelector("[data-shell]")?.outerHTML?.substring(0, 100) || "",
    },
    cdmGlobal: {
      candidates: Object.keys(window).filter((k) => /cdm|cognitive|matrix/i.test(k)),
      windowCDM: typeof window.CDM,
    },
    containers: {
      workspaceHost: !!document.getElementById("workspace-host"),
      mainContent: !!document.getElementById("main-content"),
      appContainer: !!document.getElementById("app-container"),
      mainGrid: !!document.getElementById("mainGrid"),
    },
    sidebar: {
      dataViewButtons: document.querySelectorAll("[data-view]").length,
      navButtons: document.querySelectorAll(".nav-btn, .sidebar button, .app-sidebar button").length,
    },
  };
  console.log("[WorkspaceSystem] Environment Detection:", report);
  return report;
}

export function initWorkspaceSystem(options = {}) {
  const skipInitial = options.skipInitialSwitch === true;
  const defaultWorkspace = skipInitial ? null : String(options.defaultWorkspace || "operator");
  const env = detectEnvironment();

  injectGlobalStyles();
  injectComponentStyles();
  dataBridge.translationMap = {
    ...dataBridge.translationMap,
    ...(options.translationMap || {}),
  };
  dataBridge.init();

  const manager = new WorkspaceManager({
    operator: OperatorWorkspace,
    findings: FindingsWorkspace,
    seo: SEOWorkspace,
    compare: CompareWorkspace,
    settings: SettingsWorkspace,
  });

  manager.init(defaultWorkspace);

  window.workspaceManager = manager;
  window.workspaceDataBridge = dataBridge;
  window.workspaceEnvironment = env;
  console.log("[WorkspaceSystem] Inicializado (manual cutover)");
  return manager;
}
