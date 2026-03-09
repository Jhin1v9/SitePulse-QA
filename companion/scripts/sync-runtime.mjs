import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const companionDir = path.resolve(__dirname, "..");
const repoDir = path.resolve(companionDir, "..");
const sourceQaDir = path.join(repoDir, "qa");
const targetQaDir = path.join(companionDir, "runtime-source", "qa");

const filesToCopy = [
  "src",
  "audit.default.json",
  "audit.default.mobile.json",
  "audit.sitepulse-hub.json",
  "audit.sitepulse-hub.mobile.json",
  "README.md"
];

async function main() {
  await fs.rm(targetQaDir, { recursive: true, force: true });
  await fs.mkdir(targetQaDir, { recursive: true });

  for (const entry of filesToCopy) {
    const from = path.join(sourceQaDir, entry);
    const to = path.join(targetQaDir, entry);
    await fs.cp(from, to, { recursive: true, force: true });
  }

  const manifest = {
    copiedAt: new Date().toISOString(),
    sourceQaDir,
    targetQaDir
  };
  await fs.writeFile(path.join(targetQaDir, "runtime-manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  process.stdout.write(`[sitepulse-companion] qa runtime synced to ${targetQaDir}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
