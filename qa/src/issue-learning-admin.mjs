#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { loadIssueLearningStore, saveIssueLearningStore } from "./issue-learning-store.mjs";
import { applyManualResolutionOverride, attachLearningSnapshot } from "./issue-learning-service.mjs";

async function readStdinJson() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

function createSyntheticReport(payload = {}) {
  const timestamp = new Date().toISOString();
  return {
    meta: {
      baseUrl: String(payload.baseUrl || ""),
      auditScope: String(payload.auditScope || "full"),
      viewportLabel: String(payload.viewportLabel || ""),
      startedAt: timestamp,
      finishedAt: timestamp,
    },
    summary: {
      auditScope: String(payload.auditScope || "full"),
    },
  };
}

async function run() {
  const action = String(process.argv[2] || "").trim();
  const payload = await readStdinJson();
  const reportDir = String(payload.reportDir || "").trim();
  if (!reportDir) {
    throw new Error("learning_admin_requires_report_dir");
  }

  const { storePath, store } = await loadIssueLearningStore(reportDir);

  if (action === "snapshot") {
    const snapshot = attachLearningSnapshot(store, createSyntheticReport(payload), storePath);
    process.stdout.write(`${JSON.stringify({ ok: true, storePath, snapshot })}\n`);
    return;
  }

  if (action === "manual-override") {
    const { store: nextStore, entry } = applyManualResolutionOverride(store, payload.override);
    const savedStorePath = await saveIssueLearningStore(reportDir, nextStore);
    const snapshot = attachLearningSnapshot(nextStore, createSyntheticReport(payload.override || payload), savedStorePath);
    process.stdout.write(`${JSON.stringify({ ok: true, storePath: savedStorePath, entry, snapshot })}\n`);
    return;
  }

  throw new Error(`learning_admin_unknown_action:${action || "missing"}`);
}

run().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error || "learning_admin_failed");
  try {
    await fs.writeFile(process.stderr.fd, `${message}\n`);
  } catch {
    process.stderr.write(`${message}\n`);
  }
  process.exit(1);
});
