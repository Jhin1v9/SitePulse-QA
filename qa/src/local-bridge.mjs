#!/usr/bin/env node
import process from "node:process";
import { startLocalBridgeServer } from "./local-bridge-core.mjs";

const HOST = process.env.SITEPULSE_BRIDGE_HOST || "127.0.0.1";
const PORT = Number(process.env.SITEPULSE_BRIDGE_PORT || "47891");
const QA_DIR = process.cwd();

await startLocalBridgeServer({
  host: HOST,
  port: PORT,
  qaDir: QA_DIR,
  serviceName: "sitepulse-local-bridge",
  logger(message) {
    process.stdout.write(`[sitepulse-bridge] ${message}\n`);
  },
});
