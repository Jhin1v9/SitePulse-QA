import process from "node:process";
import { loadHealingStore, saveHealingStore } from "./healing-store.mjs";
import { attachHealingSnapshot, createEmptySelfHealingSnapshot, prepareHealingAttempt } from "./healing-engine-service.mjs";

function readStdin() {
  return new Promise((resolve, reject) => {
    let buffer = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => {
      buffer += chunk;
    });
    process.stdin.on("end", () => resolve(buffer));
    process.stdin.on("error", reject);
  });
}

async function readPayload() {
  const raw = await readStdin();
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

async function runSnapshot(payload) {
  const reportDir = String(payload?.reportDir || "").trim();
  if (!reportDir) {
    throw new Error("healing_admin_requires_report_dir");
  }
  const loaded = await loadHealingStore(reportDir);
  const report = payload?.report && typeof payload.report === "object" ? payload.report : null;
  const snapshot = report
    ? attachHealingSnapshot(loaded.store, { ...report, issues: Array.isArray(report.issues) ? report.issues : [] }, loaded.storePath)
    : {
        ...createEmptySelfHealingSnapshot(),
        updatedAt: loaded.store.updatedAt,
        storePath: loaded.storePath,
        attempts: Array.isArray(loaded.store.attempts) ? loaded.store.attempts.slice(0, 18) : [],
      };
  return {
    ok: true,
    storePath: loaded.storePath,
    snapshot,
  };
}

async function runPrepareAttempt(payload) {
  const reportDir = String(payload?.reportDir || "").trim();
  if (!reportDir) {
    throw new Error("healing_prepare_requires_report_dir");
  }
  const loaded = await loadHealingStore(reportDir);
  const prepared = prepareHealingAttempt(loaded.store, payload);
  await saveHealingStore(reportDir, prepared.store);
  return {
    ok: true,
    attempt: prepared.attempt,
    snapshot: {
      updatedAt: prepared.store.updatedAt,
      attempts: prepared.store.attempts.slice(0, 18),
    },
  };
}

async function main() {
  const action = process.argv[2];
  const payload = await readPayload();

  if (action === "snapshot") {
    process.stdout.write(`${JSON.stringify(await runSnapshot(payload), null, 2)}\n`);
    return;
  }
  if (action === "prepare-attempt") {
    process.stdout.write(`${JSON.stringify(await runPrepareAttempt(payload), null, 2)}\n`);
    return;
  }
  throw new Error(`healing_admin_unknown_action:${action || "missing"}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error || "healing_admin_failed");
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
