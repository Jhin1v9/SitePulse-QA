#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import readline from "node:readline/promises";

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function color(text, tone) {
  const toneCode = ANSI[tone] ?? "";
  return `${toneCode}${text}${ANSI.reset}`;
}

function parseArgs(argv) {
  const parsed = {
    mode: "",
    url: "",
    noServer: null,
    headed: null,
    fresh: true,
    configPath: "",
    nonInteractive: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = String(argv[i] ?? "");
    if (token === "--mode" && argv[i + 1]) {
      parsed.mode = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--url" && argv[i + 1]) {
      parsed.url = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--no-server") {
      parsed.noServer = true;
      continue;
    }
    if (token === "--server") {
      parsed.noServer = false;
      continue;
    }
    if (token === "--headed") {
      parsed.headed = true;
      continue;
    }
    if (token === "--headless") {
      parsed.headed = false;
      continue;
    }
    if (token === "--fresh") {
      parsed.fresh = true;
      continue;
    }
    if (token === "--no-fresh") {
      parsed.fresh = false;
      continue;
    }
    if (token === "--config" && argv[i + 1]) {
      parsed.configPath = String(argv[i + 1]);
      i += 1;
      continue;
    }
    if (token === "--non-interactive" || token === "--yes") {
      parsed.nonInteractive = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      parsed.help = true;
      continue;
    }
  }

  return parsed;
}

function printHelp() {
  console.log("SitePulse CMD Hub");
  console.log("");
  console.log("Usage:");
  console.log("  node src/cmd-hub.mjs [options]");
  console.log("");
  console.log("Options:");
  console.log("  --mode <desktop|mobile>");
  console.log("  --url <baseUrl>");
  console.log("  --no-server | --server");
  console.log("  --headed | --headless");
  console.log("  --fresh | --no-fresh");
  console.log("  --config <file>");
  console.log("  --non-interactive");
  console.log("  --help");
}

function pickConfig(mode, explicitPath) {
  if (explicitPath) return explicitPath;
  return mode === "mobile" ? "audit.default.mobile.json" : "audit.default.json";
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const sanitized = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  return JSON.parse(sanitized);
}

function toAbsoluteMaybe(value, baseDir) {
  if (!value || typeof value !== "string") return "";
  return path.isAbsolute(value) ? value : path.resolve(baseDir, value);
}

function yesNo(value) {
  return value ? "yes" : "no";
}

function parseBoolAnswer(answer, fallback) {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return fallback;
  if (["y", "yes", "s", "sim", "1", "true"].includes(normalized)) return true;
  if (["n", "no", "0", "false"].includes(normalized)) return false;
  return fallback;
}

function parseModeAnswer(answer, fallback) {
  const normalized = answer.trim().toLowerCase();
  if (!normalized) return fallback;
  if (["1", "d", "desktop"].includes(normalized)) return "desktop";
  if (["2", "m", "mobile"].includes(normalized)) return "mobile";
  return fallback;
}

function severityWeight(severity) {
  if (severity === "high") return 0;
  if (severity === "medium") return 1;
  return 2;
}

function findLatestByPattern(entries, prefix, suffix, startedAtMs) {
  const candidates = entries
    .filter((entry) => entry.isFile)
    .filter((entry) => entry.name.startsWith(prefix) && entry.name.endsWith(suffix))
    .filter((entry) => entry.mtimeMs >= startedAtMs - 5000)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.name ?? "";
}

function formatIssueLine(issue, index) {
  const severityTone = issue.severity === "high" ? "red" : issue.severity === "medium" ? "yellow" : "cyan";
  const actionPart = issue.action ? ` -> ${issue.action}` : "";
  const text = `${index + 1}. [${issue.code}] (${issue.severity}) ${issue.route}${actionPart} | ${issue.detail}`;
  return color(text, severityTone);
}

async function runAudit(workingDir, args) {
  const commandArgs = ["src/index.mjs", ...args];
  return await new Promise((resolve) => {
    const child = spawn(process.execPath, commandArgs, {
      cwd: workingDir,
      stdio: ["inherit", "pipe", "pipe"],
      windowsHide: true,
    });

    child.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      process.stderr.write(chunk);
    });

    child.on("close", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
    child.on("error", () => {
      resolve(1);
    });
  });
}

async function resolveLatestArtifacts(reportDir, startedAtMs) {
  const entries = await fs.readdir(reportDir, { withFileTypes: true }).catch(() => []);
  const stats = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(reportDir, entry.name);
      const st = await fs.stat(fullPath).catch(() => null);
      return st
        ? { name: entry.name, isFile: entry.isFile(), mtimeMs: st.mtimeMs }
        : null;
    })
  );
  const validEntries = stats.filter((entry) => !!entry);

  const reportJsonName = findLatestByPattern(validEntries, "", "-sitepulse-report-final.json", startedAtMs)
    || findLatestByPattern(validEntries, "", "-sitepulse-report-partial.json", startedAtMs);
  const assistantName = findLatestByPattern(validEntries, "", "-sitepulse-assistant-final.txt", startedAtMs)
    || findLatestByPattern(validEntries, "", "-sitepulse-assistant-partial.txt", startedAtMs);
  const issueLogName = findLatestByPattern(validEntries, "", "-sitepulse-issues-final.log", startedAtMs)
    || findLatestByPattern(validEntries, "", "-sitepulse-issues-partial.log", startedAtMs);

  return {
    reportJsonPath: reportJsonName ? path.join(reportDir, reportJsonName) : "",
    assistantPath: assistantName ? path.join(reportDir, assistantName) : "",
    issueLogPath: issueLogName ? path.join(reportDir, issueLogName) : "",
  };
}

function printHeader() {
  console.log("");
  console.log(color("SITEPULSE CMD HUB", "bold"));
  console.log(color("Guided runner for quick audits + actionable summary", "dim"));
  console.log("");
}

function printRunConfig(info) {
  console.log(color("Run config", "cyan"));
  console.log(`- mode: ${info.mode}`);
  console.log(`- baseUrl: ${info.baseUrl}`);
  console.log(`- config: ${info.configPath}`);
  console.log(`- no-server: ${yesNo(info.noServer)}`);
  console.log(`- headed: ${yesNo(info.headed)}`);
  console.log(`- fresh: ${yesNo(info.fresh)}`);
  console.log("");
}

function printSummary(report, artifacts, exitCode) {
  if (!report) {
    console.log(color("Could not load report json for summary.", "red"));
    if (artifacts.reportJsonPath) {
      console.log(`- report json: ${artifacts.reportJsonPath}`);
    }
    return;
  }

  const summary = report.summary ?? {};
  const issues = Array.isArray(report.issues) ? [...report.issues] : [];
  issues.sort((a, b) => {
    const severityCmp = severityWeight(String(a.severity)) - severityWeight(String(b.severity));
    if (severityCmp !== 0) return severityCmp;
    return String(a.code ?? "").localeCompare(String(b.code ?? ""));
  });

  const statusLine =
    exitCode === 0
      ? color("PASS (no issues)", "green")
      : exitCode === 2
      ? color("PARTIAL (paused)", "yellow")
      : color("FAIL (issues found)", "red");

  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;

  console.log("");
  console.log(color("CMD HUB SUMMARY", "bold"));
  console.log(`- result: ${statusLine}`);
  console.log(`- routesChecked: ${Number(summary.routesChecked ?? 0)}`);
  console.log(`- buttonsChecked: ${Number(summary.buttonsChecked ?? 0)}`);
  console.log(`- totalIssues: ${Number(summary.totalIssues ?? issues.length)}`);
  console.log(`- severity: high=${high} medium=${medium} low=${low}`);
  console.log("");

  if (issues.length) {
    console.log(color("Top issues", "magenta"));
    issues.slice(0, 6).forEach((issue, idx) => {
      console.log(formatIssueLine(issue, idx));
    });
    console.log("");
  } else {
    console.log(color("No issues detected in this run.", "green"));
    console.log("");
  }

  const immediate = report.assistantGuide?.immediateSteps;
  if (Array.isArray(immediate) && immediate.length) {
    console.log(color("Immediate steps", "cyan"));
    immediate.slice(0, 5).forEach((step, idx) => {
      console.log(`${idx + 1}. ${step}`);
    });
    console.log("");
  }

  if (typeof report.assistantGuide?.replayCommand === "string" && report.assistantGuide.replayCommand.trim()) {
    console.log(color("Replay command", "cyan"));
    console.log(report.assistantGuide.replayCommand);
    console.log("");
  }

  console.log(color("Artifacts", "cyan"));
  if (artifacts.reportJsonPath) console.log(`- report: ${artifacts.reportJsonPath}`);
  if (artifacts.assistantPath) console.log(`- assistant brief: ${artifacts.assistantPath}`);
  if (artifacts.issueLogPath) console.log(`- issue log: ${artifacts.issueLogPath}`);
  console.log("");
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    return;
  }

  let mode = parsed.mode === "mobile" ? "mobile" : "desktop";
  const cwd = process.cwd();
  let configPath = path.resolve(cwd, pickConfig(mode, parsed.configPath));
  let configDir = path.dirname(configPath);
  let configRaw = await readJson(configPath);
  let reportDir = toAbsoluteMaybe(configRaw.reportDir, configDir) || path.resolve(configDir, "reports");
  const baseUrlFromConfig = String(configRaw.baseUrl ?? "http://127.0.0.1:3000");

  let baseUrl = parsed.url || baseUrlFromConfig;
  let noServer = parsed.noServer ?? false;
  let headed = parsed.headed ?? false;
  let fresh = parsed.fresh;

  if (!parsed.nonInteractive) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    printHeader();

    const modeAnswer = await rl.question(`Mode [1=desktop, 2=mobile] (${mode}): `);
    mode = parseModeAnswer(modeAnswer, mode);
    configPath = path.resolve(cwd, pickConfig(mode, parsed.configPath));
    configDir = path.dirname(configPath);
    configRaw = await readJson(configPath);
    reportDir = toAbsoluteMaybe(configRaw.reportDir, configDir) || path.resolve(configDir, "reports");
    baseUrl = parsed.url || String(configRaw.baseUrl ?? baseUrl);
    noServer = parsed.noServer ?? noServer;

    const urlAnswer = await rl.question(`Base URL (${baseUrl}): `);
    if (urlAnswer.trim()) baseUrl = urlAnswer.trim();

    const noServerAnswer = await rl.question(`Use --no-server? [y/n] (${yesNo(noServer)}): `);
    noServer = parseBoolAnswer(noServerAnswer, noServer);

    const headedAnswer = await rl.question(`Run headed browser? [y/n] (${yesNo(headed)}): `);
    headed = parseBoolAnswer(headedAnswer, headed);

    const freshAnswer = await rl.question(`Run fresh checkpoint? [y/n] (${yesNo(fresh)}): `);
    fresh = parseBoolAnswer(freshAnswer, fresh);

    const startAnswer = await rl.question("Start audit now? [y/n] (yes): ");
    const start = parseBoolAnswer(startAnswer, true);
    rl.close();

    if (!start) {
      console.log(color("Audit cancelled by user.", "yellow"));
      return;
    }
  } else {
    printHeader();
  }

  const args = ["--config", configPath];
  if (fresh) args.push("--fresh");
  if (headed) args.push("--headed");
  args.push("--live-log", "--human-log");
  if (baseUrl) {
    args.push("--base-url", baseUrl);
  }
  if (noServer) args.push("--no-server");

  printRunConfig({
    mode,
    baseUrl,
    configPath,
    noServer,
    headed,
    fresh,
  });

  const startedAtMs = Date.now();
  const exitCode = await runAudit(cwd, args);
  const artifacts = await resolveLatestArtifacts(reportDir, startedAtMs);

  let report = null;
  if (artifacts.reportJsonPath) {
    report = await readJson(artifacts.reportJsonPath).catch(() => null);
  }

  printSummary(report, artifacts, exitCode);
  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
