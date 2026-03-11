export type InstallerKind = "full_setup" | "web_setup" | "portable_zip";
export type InstallerPlatform = "windows";
export type InstallerAvailability = "available" | "request_only";

export interface InstallerPackage {
  id: string;
  kind: InstallerKind;
  platform: InstallerPlatform;
  architecture: "x64";
  version: string;
  releaseDate: string;
  fileSize: string;
  checksumSha256: string | null;
  downloadUrl: string | null;
  releaseNotesUrl: string | null;
  availability: InstallerAvailability;
}

export const downloadFeed = {
  channel: "stable",
  updatedAt: "2026-03-11",
};

export const officialInstallers: readonly InstallerPackage[] = [
  {
    id: "win-full-setup",
    kind: "full_setup",
    platform: "windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "158 MB",
    checksumSha256: null,
    downloadUrl: null,
    releaseNotesUrl: null,
    availability: "request_only",
  },
  {
    id: "win-bootstrap-setup",
    kind: "web_setup",
    platform: "windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "8 MB",
    checksumSha256: null,
    downloadUrl: null,
    releaseNotesUrl: null,
    availability: "request_only",
  },
  {
    id: "win-portable-zip",
    kind: "portable_zip",
    platform: "windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "149 MB",
    checksumSha256: null,
    downloadUrl: null,
    releaseNotesUrl: null,
    availability: "request_only",
  },
];
