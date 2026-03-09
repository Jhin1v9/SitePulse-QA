# SitePulse Companion: Technology Evaluation

## Executive summary

For the current SitePulse stack, the best immediate architecture is:

- `web Hub` for orchestration and reports
- `Electron Windows companion` for local privileged execution
- existing `Node + Playwright` QA engine reused with minimal rewrite

This is the shortest path to:

- full local audits without requiring the source repo
- Windows installer delivery
- future migration from "companion" to "full desktop product"

## Options compared

### 1. Browser-only / PWA

Strengths:
- simplest distribution
- already available through Vercel

Hard limits:
- cannot become the privileged OS execution layer
- cannot reliably spawn Playwright, `cmd.exe`, or local processes
- cannot solve the browser sandbox problem just by being "installed"

Verdict:
- useful as the control panel
- not sufficient as the execution engine

### 2. Manual localhost bridge (`npm run audit:bridge`)

Strengths:
- already works for developers
- zero architectural rewrite

Weaknesses:
- depends on source code existing locally
- not acceptable for normal customers
- fragile onboarding

Verdict:
- keep only as a development fallback

### 3. Electron companion

Strengths:
- native Node-capable main process
- can reuse current QA engine directly
- supports installers, autostart, tray, deep links, local files
- prepares the codebase for a future desktop product

Tradeoffs:
- larger binary than Tauri
- packaging and updates need hardening later

Verdict:
- best current option

### 4. Tauri companion first

Strengths:
- smaller footprint
- strong security model

Tradeoffs for this stage:
- sidecar process management
- extra permission/capability plumbing
- more integration work before first customer-ready release

Verdict:
- good candidate for a later optimization pass
- not the fastest route right now

## Why Electron wins now

SitePulse already depends on:

- Node
- child processes
- Playwright
- local filesystem access

Electron fits that runtime shape directly.

That means less rewrite, faster packaging, and lower risk during the transition from browser product to real desktop software.

## Best-practice conclusion

Best practice for this product stage is not "force more power into the browser".

Best practice is:

1. keep browser as UI/control plane
2. move privileged execution to a local native layer
3. ship that layer first as a Windows companion
4. promote it later into the main desktop product

## Official references reviewed

- Electron process model: https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron launch from other apps / protocol flows: https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
- Playwright as a library: https://playwright.dev/docs/library
- Tauri sidecars: https://v2.tauri.app/learn/sidecar/
- Microsoft MSIX overview: https://learn.microsoft.com/en-us/windows/msix/overview
