/**
 * Build the desktop app (pack:dir) and then launch the built executable.
 * Use this so you always run the real program, not dev mode.
 * Usage: node scripts/build-and-run.mjs
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const packageJsonPath = path.join(rootDir, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const productName = packageJson.build?.productName || packageJson.name || "SitePulse Studio";

function getBuiltExePath() {
  const platform = process.platform;
  const outDir = path.join(rootDir, "dist");
  if (platform === "win32") {
    const exe = path.join(outDir, "win-unpacked", `${productName}.exe`);
    return exe;
  }
  if (platform === "darwin") {
    return path.join(outDir, "mac", `${productName}.app`, "Contents", "MacOS", productName);
  }
  return path.join(outDir, "linux-unpacked", productName);
}

function runBuild() {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", "pack:dir"], {
      cwd: rootDir,
      shell: true,
      stdio: "inherit",
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`pack:dir exited ${code}`))));
    child.on("error", reject);
  });
}

function launchBuiltApp() {
  const exePath = getBuiltExePath();
  if (!fs.existsSync(exePath)) {
    console.error(`[build-and-run] Built executable not found: ${exePath}`);
    process.exit(1);
  }
  console.log(`[build-and-run] Launching: ${exePath}`);
  const child = spawn(exePath, [], {
    cwd: path.dirname(exePath),
    detached: true,
    stdio: "ignore",
  });
  child.unref();
}

async function main() {
  await runBuild();
  launchBuiltApp();
}

main().catch((err) => {
  console.error("[build-and-run]", err?.message || err);
  process.exit(1);
});
