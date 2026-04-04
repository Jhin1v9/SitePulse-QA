#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const args = {
    configPath: "audit.default.json",
    noServer: false,
    baseUrl: "",
    passthrough: [],
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = String(argv[i] || "");
    if (token === "--config" && argv[i + 1]) {
      args.configPath = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--no-server") {
      args.noServer = true;
      continue;
    }
    if (token === "--base-url" && argv[i + 1]) {
      args.baseUrl = String(argv[i + 1]);
      i += 1;
      continue;
    }
    args.passthrough.push(token);
  }
  return args;
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealth(baseUrl, timeoutMs = 120000) {
  const normalizedBase = String(baseUrl || "").replace(/\/+$/, "");
  const targets = [
    `${normalizedBase}/`,
    `${normalizedBase}/health`,
    `${normalizedBase}/api/health`,
    `${normalizedBase}/ready`,
  ];
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    for (const target of targets) {
      try {
        const response = await fetch(target, { method: "GET" });
        if (response && response.ok) {
          return target;
        }
      } catch {
        // keep trying
      }
    }
    await sleep(1000);
  }
  throw new Error(`Servidor nao respondeu em ${baseUrl} apos ${timeoutMs}ms.`);
}

function spawnCmd(command, cwd, prefix) {
  const child = spawn("cmd.exe", ["/d", "/s", "/c", command], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    env: process.env,
  });
  child.stdout?.on("data", (chunk) => {
    process.stdout.write(`${prefix}${String(chunk)}`);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(`${prefix}${String(chunk)}`);
  });
  return child;
}

function spawnProcess(bin, argv, cwd, prefix) {
  const child = spawn(bin, argv, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    env: process.env,
  });
  child.stdout?.on("data", (chunk) => {
    process.stdout.write(`${prefix}${String(chunk)}`);
  });
  child.stderr?.on("data", (chunk) => {
    process.stderr.write(`${prefix}${String(chunk)}`);
  });
  return child;
}

async function killTree(pid) {
  if (!pid) return;
  await new Promise((resolve) => {
    const killer = spawn("cmd.exe", ["/d", "/s", "/c", `taskkill /PID ${pid} /T /F`], {
      stdio: "ignore",
      windowsHide: true,
    });
    killer.once("exit", () => resolve());
    killer.once("error", () => resolve());
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const qaRoot = process.cwd();
  const configAbs = path.resolve(qaRoot, args.configPath);
  const config = await readJson(configAbs);

  const baseUrl = args.baseUrl || String(config.baseUrl || "http://127.0.0.1:3110");
  const serverCommand = String(config.serverCommand || "npm run dev");
  const serverCwd = path.resolve(qaRoot, String(config.serverCwd || "."));

  let serverProc = null;
  try {
    if (!args.noServer) {
      process.stdout.write(`[oneclick] iniciando servidor: ${serverCommand}\n`);
      process.stdout.write(`[oneclick] cwd do servidor: ${serverCwd}\n`);
      serverProc = spawnCmd(serverCommand, serverCwd, "[server] ");
      const resolved = await waitForHealth(baseUrl, 120000);
      process.stdout.write(`[oneclick] health ok: ${resolved}\n`);
    } else {
      process.stdout.write(`[oneclick] modo no-server ativo.\n`);
    }

    process.stdout.write(`[oneclick] executando auditoria...\n`);
    const auditArgv = [
      "src/index.mjs",
      "--config",
      args.configPath,
      "--fresh",
      "--live-log",
      "--human-log",
      "--base-url",
      baseUrl,
      "--no-server",
      ...args.passthrough,
    ];
    const auditProc = spawnProcess("node", auditArgv, qaRoot, "[audit] ");
    const exitCode = await new Promise((resolve, reject) => {
      auditProc.once("error", reject);
      auditProc.once("exit", (code) => resolve(Number(code || 0)));
    });
    if (exitCode !== 0) {
      throw new Error(`Auditoria finalizou com erro (exit ${exitCode}).`);
    }
    process.stdout.write("[oneclick] auditoria concluida com sucesso.\n");
  } finally {
    if (serverProc && serverProc.pid) {
      process.stdout.write("[oneclick] encerrando servidor local...\n");
      await killTree(serverProc.pid);
    }
  }
}

main().catch((error) => {
  const message = error?.message || String(error);
  process.stderr.write(`[oneclick] erro: ${message}\n`);
  process.stderr.write(
    '[oneclick] dica: para auditar URL publica, use `npm --prefix qa run audit:oneclick -- --base-url "https://example.com" --no-server`.\n',
  );
  process.exit(1);
});
