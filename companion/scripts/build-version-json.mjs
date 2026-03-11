import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readArg(name, fallback = "") {
  const prefix = `--${name}=`;
  const direct = process.argv.find((value) => value.startsWith(prefix));
  if (direct) return direct.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0 && process.argv[index + 1]) return process.argv[index + 1];
  return fallback;
}

async function main() {
  const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const packageJsonPath = path.join(rootDir, "package.json");
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));

  const outputDir = path.resolve(rootDir, readArg("output-dir", "dist"));
  const baseUrl = readArg("base-url", "https://cdn.sitepulse.app/releases/");
  const notes = readArg("notes", "");
  const version = String(packageJson.version || "").trim();
  if (!version) {
    throw new Error("package_version_missing");
  }

  const entries = await fs.readdir(outputDir, { withFileTypes: true });
  const zipFile = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".zip"))
    .map((entry) => entry.name)
    .sort()
    .at(-1);

  if (!zipFile) {
    throw new Error(`zip_artifact_missing_in_${outputDir}`);
  }

  const payload = {
    version,
    url: new URL(zipFile, baseUrl).toString(),
    notes: notes || `SitePulse Studio ${version}`,
  };

  const versionDir = path.join(outputDir, "update");
  await fs.mkdir(versionDir, { recursive: true });
  await fs.writeFile(path.join(versionDir, "version.json"), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  process.stdout.write(`${path.join(versionDir, "version.json")}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error || "build_version_json_failed");
  process.stderr.write(`build-version-json failed: ${message}\n`);
  process.exitCode = 1;
});
