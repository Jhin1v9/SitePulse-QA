import { spawn } from "node:child_process";

export function singleQuotedPowerShell(value) {
  return String(value).replace(/'/g, "''");
}

export function trimText(value, maxLen = 1500) {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen)}...`;
}

export function stripAnsi(value) {
  return String(value || "").replace(/\u001b\[[0-9;]*m/g, "");
}

function toPowerShellArray(values) {
  return `@(${values.map((value) => `'${singleQuotedPowerShell(value)}'`).join(", ")})`;
}

export function makePowerShellLaunchScript(argList, elevated, workingDirectory = "") {
  const normalizedArgs = Array.isArray(argList) ? argList.map((value) => String(value)) : [String(argList)];
  const psArgs = toPowerShellArray(normalizedArgs);
  const workingDirClause = workingDirectory ? ` -WorkingDirectory '${singleQuotedPowerShell(workingDirectory)}'` : "";
  const base = elevated
    ? `Start-Process -FilePath 'cmd.exe' -Verb RunAs -ArgumentList ${psArgs}${workingDirClause} -ErrorAction Stop | Out-Null`
    : `Start-Process -FilePath 'cmd.exe' -ArgumentList ${psArgs}${workingDirClause} -ErrorAction Stop | Out-Null`;

  return [
    "$ErrorActionPreference = 'Stop'",
    "try {",
    `  ${base}`,
    "  Write-Output 'SITEPULSE_CMD_OK'",
    "  exit 0",
    "} catch {",
    "  $message = $_.Exception.Message",
    "  if (-not $message) { $message = $_.ToString() }",
    "  Write-Error $message",
    "  exit 1",
    "}",
  ].join("; ");
}

export async function runPowerShellLaunch(psScript, options = {}) {
  const detailLimit = Number.isFinite(options.detailLimit) ? Number(options.detailLimit) : 900;

  return await new Promise((resolve) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", psScript], {
      windowsHide: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      resolve({
        ok: false,
        detail: trimText(error instanceof Error ? error.message : String(error || "cmd_launch_failed"), detailLimit),
      });
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true, detail: trimText(stripAnsi(stdout), detailLimit) });
        return;
      }
      resolve({
        ok: false,
        detail: trimText(stripAnsi(stderr || stdout || `powershell_exit_${code ?? "unknown"}`), detailLimit),
      });
    });
  });
}
