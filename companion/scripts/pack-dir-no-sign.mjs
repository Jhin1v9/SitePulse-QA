/**
 * Build unpacked app without code signing (avoids ERR_ELECTRON_BUILDER_CANNOT_EXECUTE
 * when signtool is missing or blocked). Use for local testing.
 * Usage: node scripts/pack-dir-no-sign.mjs
 */
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const env = { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: "false" };

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn("npm", ["run", script, ...args], {
      cwd: rootDir,
      shell: true,
      stdio: "inherit",
      env,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`))));
    child.on("error", reject);
  });
}

async function main() {
  await run("sync:runtime");
  await new Promise((resolve, reject) => {
    const child = spawn("npx", ["electron-builder", "--dir"], {
      cwd: rootDir,
      shell: true,
      stdio: "inherit",
      env,
    });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`electron-builder exited ${code}`))));
    child.on("error", reject);
  });
}

main().catch((err) => {
  console.error("[pack-dir-no-sign]", err?.message || err);
  process.exit(1);
});
