import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const companionDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(companionDir, "..");

const sourceQaDir = path.join(repoDir, "qa");
const targetRuntimeDir = path.join(companionDir, "runtime-source");
const targetQaDir = path.join(targetRuntimeDir, "qa");
const targetLegacyWebDir = path.join(targetRuntimeDir, "web");

const qaFilesToCopy = [
  "src",
  "shared",
  "node_modules",
  "package.json",
  "package-lock.json",
  "audit.default.json",
  "audit.default.mobile.json",
  "README.md",
];

async function removePathSafe(targetPath) {
  await fs.rm(targetPath, {
    recursive: true,
    force: true,
    maxRetries: 12,
    retryDelay: 250,
  });
}

async function syncQaRuntime() {
  await removePathSafe(targetQaDir);
  await fs.mkdir(targetQaDir, { recursive: true });

  for (const entry of qaFilesToCopy) {
    const from = path.join(sourceQaDir, entry);
    const to = path.join(targetQaDir, entry);
    await removePathSafe(to);
    await fs.cp(from, to, { recursive: true, force: true });
  }

  const manifest = {
    copiedAt: new Date().toISOString(),
    sourceQaDir,
    targetQaDir,
    desktopMode: "native-only",
  };
  await fs.writeFile(path.join(targetQaDir, "runtime-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  process.stdout.write(`[sitepulse-studio] qa runtime synced to ${targetQaDir}\n`);
}

async function cleanupLegacyWebRuntime() {
  await removePathSafe(targetLegacyWebDir);
}

async function main() {
  await fs.mkdir(targetRuntimeDir, { recursive: true });
  await syncQaRuntime();
  await cleanupLegacyWebRuntime();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
