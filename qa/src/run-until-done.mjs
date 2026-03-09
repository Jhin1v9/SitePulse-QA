#!/usr/bin/env node
import { spawn } from "node:child_process";
import process from "node:process";

function parseArgs(argv) {
  const args = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    args.push(token);
  }
  return args;
}

async function runOnce(childArgs) {
  return await new Promise((resolve) => {
    const child = spawn(process.execPath, ["src/index.mjs", ...childArgs], {
      cwd: process.cwd(),
      stdio: "inherit",
      windowsHide: true,
    });

    child.on("close", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
    child.on("error", () => {
      resolve(1);
    });
  });
}

async function main() {
  const passthrough = parseArgs(process.argv.slice(2));
  let currentArgs = [...passthrough];

  const maxSegments = 100;
  for (let segment = 1; segment <= maxSegments; segment += 1) {
    const code = await runOnce(currentArgs);
    if (code === 2) {
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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
