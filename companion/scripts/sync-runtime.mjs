import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const companionDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(companionDir, "..");

const sourceQaDir = path.join(repoDir, "qa");
const targetQaDir = path.join(companionDir, "runtime-source", "qa");

const sourceStandaloneDir = path.join(repoDir, ".next", "standalone");
const sourceStaticDir = path.join(repoDir, ".next", "static");
const sourcePublicDir = path.join(repoDir, "public");
const targetWebDir = path.join(companionDir, "runtime-source", "web");

const qaFilesToCopy = [
  "src",
  "node_modules",
  "package.json",
  "package-lock.json",
  "audit.default.json",
  "audit.default.mobile.json",
  "audit.sitepulse-hub.json",
  "audit.sitepulse-hub.mobile.json",
  "README.md",
];

function hasFlag(flag) {
  return process.argv.includes(flag);
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runCommand(command, args, cwd) {
  await new Promise((resolve, reject) => {
    const windowsCmd = process.env.comspec || "cmd.exe";
    const wrapForWindows = process.platform === "win32";
    const child = wrapForWindows
      ? spawn(windowsCmd, ["/d", "/s", "/c", command, ...args], {
          cwd,
          stdio: "inherit",
          windowsHide: false,
        })
      : spawn(command, args, {
          cwd,
          stdio: "inherit",
          windowsHide: false,
        });

    child.on("close", (code) => {
      if (code === 0) resolve(undefined);
      else reject(new Error(`${command} ${args.join(" ")} failed with code ${code}`));
    });
    child.on("error", (error) => reject(error));
  });
}

async function ensureWebBuild() {
  const standaloneServer = path.join(sourceStandaloneDir, "server.js");
  if (hasFlag("--skip-web-build") && (await fileExists(standaloneServer))) {
    process.stdout.write("[sitepulse-desktop] reusing existing Next standalone build.\n");
    return;
  }

  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  process.stdout.write("[sitepulse-desktop] building Next standalone runtime...\n");
  await runCommand(npmCmd, ["run", "build"], repoDir);
}

async function syncQaRuntime() {
  await fs.rm(targetQaDir, { recursive: true, force: true });
  await fs.mkdir(targetQaDir, { recursive: true });

  for (const entry of qaFilesToCopy) {
    const from = path.join(sourceQaDir, entry);
    const to = path.join(targetQaDir, entry);
    await fs.cp(from, to, { recursive: true, force: true });
  }

  const manifest = {
    copiedAt: new Date().toISOString(),
    sourceQaDir,
    targetQaDir,
  };
  await fs.writeFile(path.join(targetQaDir, "runtime-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  process.stdout.write(`[sitepulse-desktop] qa runtime synced to ${targetQaDir}\n`);
}

async function syncWebRuntime() {
  const standaloneServer = path.join(sourceStandaloneDir, "server.js");
  if (!(await fileExists(standaloneServer))) {
    throw new Error(`Next standalone build not found at ${standaloneServer}`);
  }

  await fs.rm(targetWebDir, { recursive: true, force: true });
  await fs.mkdir(targetWebDir, { recursive: true });

  await fs.cp(sourceStandaloneDir, targetWebDir, { recursive: true, force: true });
  await fs.cp(sourceStaticDir, path.join(targetWebDir, ".next", "static"), { recursive: true, force: true });
  await fs.cp(sourcePublicDir, path.join(targetWebDir, "public"), { recursive: true, force: true });

  const manifest = {
    copiedAt: new Date().toISOString(),
    sourceStandaloneDir,
    sourceStaticDir,
    sourcePublicDir,
    targetWebDir,
  };
  await fs.writeFile(path.join(targetWebDir, "runtime-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  process.stdout.write(`[sitepulse-desktop] web runtime synced to ${targetWebDir}\n`);
}

async function main() {
  await ensureWebBuild();
  await syncQaRuntime();
  await syncWebRuntime();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
