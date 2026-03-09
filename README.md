# SitePulse Studio

SitePulse Studio is now a desktop-first product.

This repository contains:
- `companion/`: the Windows desktop application shell
- `qa/`: the audit engine, bridge, CLI flows and report generation
- `docs/`: architecture, packaging and product notes

The old Next.js control panel has been removed. The product is no longer organized around a web app.

## Product direction
- native desktop shell
- local audit engine with Playwright
- bridge for controlled local execution
- evidence-first reports, prompts and replay commands
- positioning aimed at a serious commercial software product

## Local setup
```bash
npm install
npm run companion:install
```

## Main commands
```bash
npm run desktop:dev
npm run desktop:smoke
npm run desktop:build:win
npm run desktop:build:win:staging
```

## Audit engine commands
```bash
npm run audit:cmd
npm run audit:cmd:mobile
npm run audit:wizard
npm run audit:wizard:mobile
npm run audit:bridge
```

## Output
Default Windows artifacts:
- `companion/dist/SitePulse-Studio-1.0.0-Setup.exe`
- `companion/dist/win-unpacked/SitePulse Studio.exe`

Staging build output:
- `companion/dist-v3/`

## Current architecture
- the desktop shell talks directly to the local bridge
- the bridge runs the QA engine
- the renderer stores compact report snapshots locally
- the desktop UI is now responsible for overview, findings, reports and settings

## Validation
Core validation path:
```bash
node --check companion/src/main.cjs
node --check companion/src/preload.cjs
node --check companion/src/renderer.js
npm run desktop:smoke
```

## Notes
- if `companion/dist` is locked by a running executable, use `npm run desktop:build:win:staging`
- `companion/runtime-source` is generated input for the packaged desktop app
