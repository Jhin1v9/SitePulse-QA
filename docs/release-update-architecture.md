# SitePulse Desktop Update Architecture

## Distribution Model

- Installer target: `nsis-web`
- Release channel: `https://cdn.sitepulse.app/releases/`
- Version manifest: `https://cdn.sitepulse.app/update/version.json`
- In-app updater: `electron-updater` with generic provider

## Why this architecture

- `nsis-web` keeps the bootstrap installer small.
- `electron-updater` gives safe Windows update application and differential download support via blockmaps.
- `version.json` gives a stable metadata contract for UI, manual checks and future CI/CD automation.

## Release Artifacts

The release pipeline should publish:

- `latest.yml`
- `*.blockmap`
- `SitePulse-Studio-<version>-Setup.exe`
- `SitePulse-Studio-<version>-Setup.zip`
- `update/version.json`

## Build Commands

From the repository root:

```powershell
npm run desktop:build:win:staging
npm run desktop:build:update:metadata
```

## version.json Shape

```json
{
  "version": "1.0.3",
  "url": "https://cdn.sitepulse.app/releases/SitePulse-Studio-1.0.3-Setup.zip",
  "notes": "Bug fixes and performance improvements"
}
```

## Future CI/CD

GitHub Actions only needs to:

1. build the Windows release
2. upload the generated release artifacts to the CDN
3. upload `update/version.json`

The desktop app does not need code changes per release if the CDN contract stays the same.
