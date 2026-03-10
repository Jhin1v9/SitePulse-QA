import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import {
  makePowerShellLaunchScript,
  runPowerShellLaunch,
  stripAnsi,
  trimText,
} from "../shared/windows-cmd-launch.js";

function nowIso() {
  return new Date().toISOString();
}

function safeQuoted(value) {
  return String(value).replace(/"/g, '""');
}

function normalizeAuditScope(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "seo") return "seo";
  if (["experience", "ux", "actions", "action", "buttons", "site"].includes(raw)) {
    return "experience";
  }
  return "full";
}

function parseJsonTail(stdout) {
  const text = String(stdout || "").trim();
  let cursor = text.lastIndexOf("{");
  while (cursor >= 0) {
    const slice = text.slice(cursor);
    try {
      return JSON.parse(slice);
    } catch {
      cursor = text.lastIndexOf("{", cursor - 1);
    }
  }
  return null;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Private-Network": "true",
    "Cache-Control": "no-store",
  };
}

function writeJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    ...corsHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > 1024 * 1024) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(text));
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", (error) => reject(error));
  });
}

function defaultRecommendedCommand(input) {
  return [
    "npm --prefix qa run audit:cmd --",
    `--config "${input.config}"`,
    "--fresh",
    "--live-log",
    "--human-log",
    `--scope "${normalizeAuditScope(input.scope)}"`,
    `--base-url "${safeQuoted(input.baseUrl)}"`,
    input.noServer !== false ? "--no-server" : "",
    input.headed === true ? "--headed" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function makeCommandParts(input, options) {
  const mode = input.mode === "mobile" ? "mobile" : "desktop";
  const scope = normalizeAuditScope(input.scope);
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const runnerEntry = input.fullAudit === false ? "src/index.mjs" : "src/run-until-done.mjs";
  const args = [
    runnerEntry,
    "--config",
    config,
    "--fresh",
    "--live-log",
    "--human-log",
    "--scope",
    scope,
    "--base-url",
    input.baseUrl,
  ];
  if (input.noServer !== false) args.push("--no-server");
  if (input.headed === true) args.push("--headed");

  const recommendedCommand = typeof options.recommendedCommandFactory === "function"
    ? options.recommendedCommandFactory({
        baseUrl: input.baseUrl,
        mode,
        config,
        noServer: input.noServer !== false,
        headed: input.headed === true,
        fullAudit: input.fullAudit !== false,
        scope,
      })
    : defaultRecommendedCommand({
        baseUrl: input.baseUrl,
        mode,
        config,
        noServer: input.noServer !== false,
        headed: input.headed === true,
        scope,
      });

  const runnerPath = path.join(options.qaDir, ...runnerEntry.split("/"));
  const shellCommandParts = [];
  if (options.runAsNode === true) {
    shellCommandParts.push("set ELECTRON_RUN_AS_NODE=1");
  }
  shellCommandParts.push(`"${safeQuoted(options.nodeExecPath)}" "${safeQuoted(runnerPath)}" --config "${safeQuoted(config)}" --fresh --live-log --human-log --scope "${safeQuoted(scope)}" --base-url "${safeQuoted(input.baseUrl)}"${input.noServer !== false ? " --no-server" : ""}${input.headed === true ? " --headed" : ""}`);

  return {
    mode,
    scope,
    config,
    runnerEntry,
    args,
    runnerPath,
    recommendedCommand,
    shellRunner: shellCommandParts.join(" && "),
  };
}

function createLogger(logger) {
  return typeof logger === "function" ? logger : () => {};
}

function createLiveEventSink(callback) {
  return typeof callback === "function" ? callback : () => {};
}

function tryParseLiveEvent(line) {
  const text = String(line || "").trim();
  if (!text.startsWith("SPLIVE ")) return null;
  try {
    return JSON.parse(text.slice(7));
  } catch {
    return null;
  }
}

async function writeCmdLaunchScript(options, command) {
  const scriptName = "sitepulse-launch.cmd";
  const scriptPath = path.join(options.qaDir, scriptName);
  const scriptBody = [
    "@echo off",
    "setlocal",
    "cd /d \"%~dp0\"",
    command.shellRunner,
    "",
  ].join("\r\n");
  await fs.writeFile(scriptPath, scriptBody, "utf8");
  return { scriptName, scriptPath };
}

export async function startLocalBridgeServer(userOptions = {}) {
  const options = {
    host: userOptions.host || process.env.SITEPULSE_BRIDGE_HOST || "127.0.0.1",
    port: Number(userOptions.port || process.env.SITEPULSE_BRIDGE_PORT || "47891"),
    qaDir: userOptions.qaDir || process.cwd(),
    serviceName: userOptions.serviceName || "sitepulse-local-bridge",
    nodeExecPath: userOptions.nodeExecPath || process.execPath,
    runAsNode: userOptions.runAsNode === true,
    logger: createLogger(userOptions.logger),
    liveEvent: createLiveEventSink(userOptions.liveEvent),
    extraEnv: userOptions.extraEnv && typeof userOptions.extraEnv === "object" ? userOptions.extraEnv : {},
    recommendedCommandFactory:
      typeof userOptions.recommendedCommandFactory === "function" ? userOptions.recommendedCommandFactory : null,
  };

  const state = {
    running: false,
    startedAt: null,
    baseUrl: null,
    mode: null,
  };

  async function runAudit(input) {
    const command = makeCommandParts(input, options);
    const startedAt = nowIso();
    const startedMs = Date.now();
    const forceServerlessChromium =
      process.platform === "linux"
        ? "1"
        : String(process.env.SITEPULSE_FORCE_SERVERLESS_CHROMIUM || "");
    const runtimeEnv = {
      ...process.env,
      ...options.extraEnv,
      PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "0",
      SITEPULSE_FORCE_SERVERLESS_CHROMIUM: forceServerlessChromium,
    };
    if (options.runAsNode === true) {
      runtimeEnv.ELECTRON_RUN_AS_NODE = "1";
    }
    if (runtimeEnv.NODE_PATH) {
      runtimeEnv.NODE_PATH = String(runtimeEnv.NODE_PATH);
    }

    const child = spawn(options.nodeExecPath, command.args, {
      cwd: options.qaDir,
      env: runtimeEnv,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    let stdoutBuffer = "";
    let stderrBuffer = "";

    function processLine(kind, line) {
      const normalized = String(line || "").trimEnd();
      if (!normalized) return;

      if (kind === "stdout") {
        const liveEvent = tryParseLiveEvent(normalized);
        if (liveEvent) {
          options.liveEvent(liveEvent);
          return;
        }
      }

      options.logger(`[audit ${kind}] ${normalized}`);
    }

    function pushStreamChunk(kind, chunk) {
      const text = String(chunk);
      if (kind === "stdout") stdout += text;
      else stderr += text;

      if (kind === "stdout") {
        stdoutBuffer += text;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() ?? "";
        lines.forEach((line) => processLine(kind, line));
        return;
      }

      stderrBuffer += text;
      const lines = stderrBuffer.split(/\r?\n/);
      stderrBuffer = lines.pop() ?? "";
      lines.forEach((line) => processLine(kind, line));
    }

    child.stdout.on("data", (chunk) => {
      pushStreamChunk("stdout", chunk);
    });
    child.stderr.on("data", (chunk) => {
      pushStreamChunk("stderr", chunk);
    });

    const exitCode = await new Promise((resolve) => {
      child.on("close", (code) => resolve(typeof code === "number" ? code : 1));
      child.on("error", () => resolve(1));
    });

    processLine("stdout", stdoutBuffer);
    processLine("stderr", stderrBuffer);

    const parsed = parseJsonTail(stdout);
    if (parsed?.jsonReport) {
      const reportPath = path.isAbsolute(parsed.jsonReport)
        ? parsed.jsonReport
        : path.resolve(options.qaDir, parsed.jsonReport);
      const raw = await fs.readFile(reportPath, "utf8");
      const report = JSON.parse(raw);
      return {
        ok: true,
        mode: command.mode,
        command: command.recommendedCommand,
        startedAt,
        finishedAt: nowIso(),
        durationMs: Date.now() - startedMs,
        steps: parsed.steps ?? ["Auditoria completa executada via bridge local."],
        report,
        summary: parsed.summary ?? report?.summary ?? null,
        usedFallback: parsed.usedFallback === true,
        detail: parsed.detail,
        exitCode,
        source: options.serviceName,
      };
    }

    const tail = [stderr, stdout.split("\n").slice(-40).join("\n")].filter(Boolean).join("\n");
    return {
      ok: false,
      mode: command.mode,
      command: command.recommendedCommand,
      startedAt,
      finishedAt: nowIso(),
      durationMs: Date.now() - startedMs,
      steps: ["Falha ao consolidar relatorio via bridge local."],
      error: "audit_failed",
      detail: trimText(stripAnsi(tail), 1400),
      exitCode,
      source: options.serviceName,
    };
  }

  async function openCmdWindow(input) {
    if (process.platform !== "win32") {
      const command = makeCommandParts(input, options);
      return {
        ok: false,
        error: "unsupported_platform",
        detail: "Abrir janela de CMD automatico funciona apenas no Windows.",
        recommendedCommand: command.recommendedCommand,
      };
    }

    const command = makeCommandParts(input, options);
    const launchScript = await writeCmdLaunchScript(options, command);
    const argList = ["/d", "/k", launchScript.scriptName];
    const psScript = makePowerShellLaunchScript(argList, input.elevated === true, options.qaDir);
    const launchResult = await runPowerShellLaunch(psScript);

    if (!launchResult.ok) {
      return {
        ok: false,
        error: input.elevated === true ? "uac_request_failed" : "cmd_launch_failed",
        detail:
          input.elevated === true
            ? `O Windows nao confirmou a elevacao do CMD. Detalhe: ${launchResult.detail}`
            : `O Windows nao conseguiu abrir a janela de CMD. Detalhe: ${launchResult.detail}`,
        mode: command.mode,
        recommendedCommand: command.recommendedCommand,
        scriptPath: launchScript.scriptPath,
        recommendation:
          input.elevated === true
            ? "Clique novamente e aceite o UAC. Se continuar sem abrir nada, desmarque 'Executar como administrador (UAC)' ou rode o comando manualmente em um CMD admin."
            : "Tente novamente ou execute o comando recomendado manualmente em um CMD local.",
        elevated: input.elevated === true,
        fullAudit: input.fullAudit !== false,
      };
    }

    return {
      ok: true,
      message:
        input.elevated === true
          ? "Pedido de permissao do Windows confirmado. A janela de CMD admin foi solicitada."
          : "Janela CMD aberta com a auditoria configurada.",
      mode: command.mode,
      command: psScript,
      recommendedCommand: command.recommendedCommand,
      scriptPath: launchScript.scriptPath,
      recommendation:
        input.elevated === true
          ? "Se a janela nao vier para frente, procure o prompt UAC atras de outras janelas ou na barra de tarefas."
          : undefined,
      elevated: input.elevated === true,
      fullAudit: input.fullAudit !== false,
    };
  }

  async function handleRun(req, res) {
    if (state.running) {
      writeJson(res, 409, {
        ok: false,
        error: "bridge_busy",
        detail: "Ja existe uma auditoria rodando no bridge local.",
        running: {
          startedAt: state.startedAt,
          baseUrl: state.baseUrl,
          mode: state.mode,
        },
      });
      return;
    }

    const body = await collectBody(req).catch((error) => {
      writeJson(res, 400, { ok: false, error: String(error?.message || "invalid_request") });
      return null;
    });
    if (!body) return;

    const baseUrl = String(body.baseUrl || "").trim();
    if (!baseUrl) {
      writeJson(res, 400, { ok: false, error: "baseUrl is required" });
      return;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(baseUrl);
    } catch {
      writeJson(res, 400, { ok: false, error: "invalid baseUrl" });
      return;
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      writeJson(res, 400, { ok: false, error: "only http/https are supported" });
      return;
    }

    const mode = body.mode === "mobile" ? "mobile" : "desktop";
    const runInput = {
      baseUrl,
      mode,
      scope: normalizeAuditScope(body.scope),
      noServer: body.noServer !== false,
      headed: body.headed === true,
      fullAudit: body.fullAudit !== false,
    };

    state.running = true;
    state.startedAt = nowIso();
    state.baseUrl = baseUrl;
    state.mode = mode;

    try {
      const payload = await runAudit(runInput);
      const status = payload.ok ? 200 : 500;
      writeJson(res, status, payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error || "run_failed");
      writeJson(res, 500, {
        ok: false,
        error: "run_failed",
        detail: trimText(message),
        source: options.serviceName,
      });
    } finally {
      state.running = false;
      state.startedAt = null;
      state.baseUrl = null;
      state.mode = null;
    }
  }

  async function handleOpenCmd(req, res) {
    const body = await collectBody(req).catch((error) => {
      writeJson(res, 400, { ok: false, error: String(error?.message || "invalid_request") });
      return null;
    });
    if (!body) return;

    const baseUrl = String(body.baseUrl || "").trim();
    if (!baseUrl) {
      writeJson(res, 400, { ok: false, error: "baseUrl is required" });
      return;
    }

    try {
      const parsed = new URL(baseUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        writeJson(res, 400, { ok: false, error: "only http/https are supported" });
        return;
      }
    } catch {
      writeJson(res, 400, { ok: false, error: "invalid baseUrl" });
      return;
    }

    const payload = await openCmdWindow({
      baseUrl,
      mode: body.mode === "mobile" ? "mobile" : "desktop",
      scope: normalizeAuditScope(body.scope),
      noServer: body.noServer !== false,
      headed: body.headed === true,
      fullAudit: body.fullAudit !== false,
      elevated: body.elevated === true,
    });
    writeJson(res, payload.ok ? 200 : 400, payload);
  }

  const server = http.createServer(async (req, res) => {
    const method = req.method || "GET";
    const urlObj = new URL(req.url || "/", `http://${req.headers.host || `${options.host}:${options.port}`}`);

    if (method === "OPTIONS") {
      res.writeHead(204, corsHeaders());
      res.end();
      return;
    }

    if (method === "GET" && urlObj.pathname === "/health") {
      writeJson(res, 200, {
        ok: true,
        service: options.serviceName,
        host: options.host,
        port: options.port,
        platform: process.platform,
        running: state.running,
        runningTarget: state.baseUrl,
        runningMode: state.mode,
        startedAt: state.startedAt,
        qaDir: options.qaDir,
        timestamp: nowIso(),
      });
      return;
    }

    if (method === "POST" && urlObj.pathname === "/run") {
      await handleRun(req, res);
      return;
    }

    if (method === "POST" && urlObj.pathname === "/open-cmd") {
      await handleOpenCmd(req, res);
      return;
    }

    writeJson(res, 404, {
      ok: false,
      error: "not_found",
      detail: `Route ${method} ${urlObj.pathname} not found.`,
    });
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => resolve(undefined));
  });

  options.logger(`[bridge] listening on http://${options.host}:${options.port}`);
  options.logger(`[bridge] qa directory: ${options.qaDir}`);
  options.logger("[bridge] endpoints: GET /health | POST /run | POST /open-cmd");

  return {
    host: options.host,
    port: options.port,
    qaDir: options.qaDir,
    serviceName: options.serviceName,
    state,
    server,
    async stop() {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
      options.logger("[bridge] stopped");
    },
  };
}
