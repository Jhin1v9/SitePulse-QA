export type InstallerKind = "Setup completo" | "Setup web/bootstrap" | "ZIP";
export type InstallerPlatform = "Windows";

export interface InstallerPackage {
  id: string;
  name: string;
  kind: InstallerKind;
  platform: InstallerPlatform;
  architecture: "x64";
  version: string;
  releaseDate: string;
  fileSize: string;
  link: string;
  checksumSha256: string;
  notes: string;
}

export const downloadFeed = {
  channel: "stable",
  updatedAt: "2026-03-11",
};

export const officialInstallers: readonly InstallerPackage[] = [
  {
    id: "win-full-setup",
    name: "SitePulse Studio Setup",
    kind: "Setup completo",
    platform: "Windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "158 MB",
    link: "https://github.com/sitepulse/studio-releases/releases/download/v1.0.0/SitePulse-Studio-Setup-1.0.0.exe",
    checksumSha256: "PREENCHER_COM_HASH_OFICIAL_DO_ARQUIVO",
    notes:
      "Instalador completo com runtime incluso. Recomendado para máquinas sem dependências prévias.",
  },
  {
    id: "win-bootstrap-setup",
    name: "SitePulse Studio Web Setup",
    kind: "Setup web/bootstrap",
    platform: "Windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "8 MB",
    link: "https://github.com/sitepulse/studio-releases/releases/download/v1.0.0/SitePulse-Studio-WebSetup-1.0.0.exe",
    checksumSha256: "PREENCHER_COM_HASH_OFICIAL_DO_ARQUIVO",
    notes:
      "Bootstrap leve que baixa componentes na instalação. Ideal para distribuição rápida.",
  },
  {
    id: "win-portable-zip",
    name: "SitePulse Studio Portable",
    kind: "ZIP",
    platform: "Windows",
    architecture: "x64",
    version: "1.0.0",
    releaseDate: "2026-03-11",
    fileSize: "149 MB",
    link: "https://github.com/sitepulse/studio-releases/releases/download/v1.0.0/SitePulse-Studio-Portable-1.0.0.zip",
    checksumSha256: "PREENCHER_COM_HASH_OFICIAL_DO_ARQUIVO",
    notes:
      "Versão portátil para laboratório, validação interna e ambientes bloqueados por política.",
  },
];
