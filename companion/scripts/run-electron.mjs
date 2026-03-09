import { spawn } from "node:child_process";
import process from "node:process";
import electronPath from "electron";

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electronPath, process.argv.slice(2), {
  cwd: process.cwd(),
  env,
  stdio: "inherit",
  windowsHide: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(typeof code === "number" ? code : 1);
});

child.on("error", (error) => {
  process.stderr.write(`[sitepulse-companion] failed to launch electron: ${error.message}\n`);
  process.exit(1);
});
