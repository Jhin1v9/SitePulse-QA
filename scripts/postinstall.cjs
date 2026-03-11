const { spawnSync } = require("node:child_process");

function shouldSkipQaBootstrap() {
  return process.env.VERCEL === "1";
}

function runQaBootstrap() {
  const result = spawnSync("npm", ["run", "qa:bootstrap"], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

if (shouldSkipQaBootstrap()) {
  process.stdout.write("[postinstall] skipping qa bootstrap on vercel.\n");
} else {
  runQaBootstrap();
}
