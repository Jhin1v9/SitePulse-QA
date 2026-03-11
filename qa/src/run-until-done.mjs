#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

let activeChild = null;
let externalPauseRequested = false;

function parseArgs(argv) {
  const args = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    args.push(token);
  }
  return args;
}

function readPauseRequestFileFromArgs(argv) {
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--pause-request-file" && argv[index + 1]) {
      return path.resolve(process.cwd(), String(argv[index + 1]));
    }
  }
  return "";
}

async function pauseRequestExists(pauseRequestFile) {
  if (!pauseRequestFile) return false;
  try {
    await fs.access(pauseRequestFile);
    return true;
  } catch {
    return false;
  }
}

async function runOnce(childArgs) {
  return await new Promise((resolve) => {
    const child = spawn(process.execPath, ["src/index.mjs", ...childArgs], {
      cwd: process.cwd(),
      stdio: "inherit",
      windowsHide: true,
    });
    activeChild = child;

    child.on("close", (code) => {
      if (activeChild === child) {
        activeChild = null;
      }
      resolve(typeof code === "number" ? code : 1);
    });
    child.on("error", () => {
      if (activeChild === child) {
        activeChild = null;
      }
      resolve(1);
    });
  });
}

function forwardPauseSignal(signal) {
  externalPauseRequested = true;
  if (!activeChild) return;
  try {
    activeChild.kill(signal);
  } catch {}
}

async function main() {
  const passthrough = parseArgs(process.argv.slice(2));
  const pauseRequestFile = readPauseRequestFileFromArgs(passthrough);
  let currentArgs = [...passthrough];

  const maxSegments = 100;
  for (let segment = 1; segment <= maxSegments; segment += 1) {
    const code = await runOnce(currentArgs);
    if (code === 2) {
      if (externalPauseRequested || (await pauseRequestExists(pauseRequestFile))) {
        process.exit(2);
        return;
      }
      process.stdout.write(`[SitePulse-QA] Segmento ${segment} pausado por tempo. Retomando...\n`);
      currentArgs = currentArgs.filter((item) => item !== "--fresh");
      continue;
    }

    process.exit(code);
    return;
  }

  process.stderr.write("[SitePulse-QA] Limite de segmentos atingido sem concluir.\n");
  process.exit(1);
}

process.on("SIGINT", () => {
  forwardPauseSignal("SIGINT");
});

process.on("SIGTERM", () => {
  forwardPauseSignal("SIGTERM");
});

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
