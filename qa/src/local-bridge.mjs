#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const HOST = process.env.SITEPULSE_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.SITEPULSE_BRIDGE_PORT || "47891");
const QA_DIR = process.cwd();

/** @type {{running: boolean, startedAt: string | null, baseUrl: string | null, mode: "desktop" | "mobile" | null}} */
const state = {
  running: false,
  startedAt: null,
  baseUrl: null,
  mode: null,
};

function nowIso() {
  return new Date().toISOString();
}

function safeQuoted(value) {
  return String(value).replace(/"/g, '""');
}

function singleQuotedPowerShell(value) {
  return String(value).replace(/'/g, "''");
}

function trimText(value, maxLen = 1500) {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}...`;
}

function stripAnsi(value) {
  return String(value || "").replace(/\u001b\[[0-9;]*m/g, "");
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

function makeCommandParts(input) {
  const mode = input.mode === "mobile" ? "mobile" : "desktop";
  const config = mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
  const runnerEntry = input.fullAudit === false ? "src/index.mjs" : "src/run-until-done.mjs";
  const args = [
    runnerEntry,
    "--config",
    config,
    "--fresh",
    "--live-log",
    "--human-log",
    "--base-url",
    input.baseUrl,
  ];
  if (input.noServer !== false) args.push("--no-server");
  if (input.headed === true) args.push("--headed");

  const recommendedCommand = [
    "npm --prefix qa run audit:cmd --",
    `--config \"${config}\"`,
    "--fresh",
    "--live-log",
    "--human-log",
    `--base-url \"${safeQuoted(input.baseUrl)}\"`,
    input.noServer !== false ? "--no-server" : "",
    input.headed === true ? "--headed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    mode,
    config,
    runnerEntry,
    args,
    recommendedCommand,
  };
}

async function runAudit(input) {
  const command = makeCommandParts(input);
  const startedAt = nowIso();
  const startedMs = Date.now();
  const runtimeEnv = {
    ...process.env,
    PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH ?? "0",
  };

  const child = spawn(process.execPath, command.args, {
    cwd: QA_DIR,
    env: runtimeEnv,
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += String(chunk);
  });
  child.stderr.on("data", (chunk) => {
    stderr += String(chunk);
  });

  const exitCode = await new Promise((resolve) => {
    child.on("close", (code) => resolve(typeof code === "number" ? code : 1));
    child.on("error", () => resolve(1));
  });

  const parsed = parseJsonTail(stdout);
  if (parsed?.jsonReport) {
    const reportPath = path.isAbsolute(parsed.jsonReport)
      ? parsed.jsonReport
      : path.resolve(QA_DIR, parsed.jsonReport);
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
      source: "local_bridge",
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
    source: "local_bridge",
  };
}

function openCmdWindow(input) {
  if (process.platform !== "win32") {
    const command = makeCommandParts(input);
    return {
      ok: false,
      error: "unsupported_platform",
      detail: "Abrir janela de CMD automatico funciona apenas no Windows.",
      recommendedCommand: command.recommendedCommand,
    };
  }

  const command = makeCommandParts(input);
  const cmdParts = [
    `cd /d \"${safeQuoted(QA_DIR)}\"`,
    `node ${command.runnerEntry.replace(/\//g, "\\")} --config \"${command.config}\" --fresh --live-log --human-log --base-url \"${safeQuoted(input.baseUrl)}\"${input.noServer !== false ? " --no-server" : ""}${input.headed === true ? " --headed" : ""}`,
  ];
  const runner = cmdParts.join(" && ");
  const startCommand = `start \"SitePulse QA\" cmd /k \"${safeQuoted(runner)}\"`;

  if (input.elevated === true) {
    const argList = `/k \"${safeQuoted(runner)}\"`;
    const psScript = `Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList '${singleQuotedPowerShell(argList)}'`;
    const elevatedChild = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript], {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    elevatedChild.unref();
    return {
      ok: true,
      message: "Solicitacao de CMD admin enviada (UAC). Confirme para iniciar.",
      mode: command.mode,
      command: psScript,
      recommendedCommand: command.recommendedCommand,
      elevated: true,
      fullAudit: input.fullAudit !== false,
    };
  }

  const child = spawn("cmd.exe", ["/c", startCommand], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();
  return {
    ok: true,
    message: "Janela CMD aberta com a auditoria configurada.",
    mode: command.mode,
    command: startCommand,
    recommendedCommand: command.recommendedCommand,
    elevated: false,
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
      source: "local_bridge",
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

  const payload = openCmdWindow({
    baseUrl,
    mode: body.mode === "mobile" ? "mobile" : "desktop",
    noServer: body.noServer !== false,
    headed: body.headed === true,
    fullAudit: body.fullAudit !== false,
    elevated: body.elevated === true,
  });
  writeJson(res, payload.ok ? 200 : 400, payload);
}

const server = http.createServer(async (req, res) => {
  const method = req.method || "GET";
  const urlObj = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (method === "OPTIONS") {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  if (method === "GET" && urlObj.pathname === "/health") {
    writeJson(res, 200, {
      ok: true,
      service: "sitepulse-local-bridge",
      host: HOST,
      port: PORT,
      platform: process.platform,
      running: state.running,
      runningTarget: state.baseUrl,
      runningMode: state.mode,
      startedAt: state.startedAt,
      qaDir: QA_DIR,
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

server.listen(PORT, HOST, () => {
  process.stdout.write(`[sitepulse-bridge] listening on http://${HOST}:${PORT}\n`);
  process.stdout.write(`[sitepulse-bridge] qa directory: ${QA_DIR}\n`);
  process.stdout.write("[sitepulse-bridge] endpoints: GET /health | POST /run | POST /open-cmd\n");
});
