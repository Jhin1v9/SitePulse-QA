# ADR 0001: Windows Companion Architecture

## Status

Accepted

## Decision

SitePulse will use a `Windows local companion app` backed by `Electron` as the privileged execution layer for local audits.

The browser Hub remains the orchestration and reporting UI.

The companion app becomes the local runtime that:

- starts the localhost bridge
- runs the QA engine locally
- manages files, logs, and Windows-specific operations

## Context

The current system already has:

- a Next.js Hub for orchestration and report reading
- a Node/Playwright QA engine
- a localhost bridge script

The gap is packaging and local execution for end users who do not have the project source tree available.

## Why Electron

Electron is the most pragmatic choice for the current stack because:

- it has a native Node-capable main process
- it can manage windows, tray, deep links, autostart, and updates
- it can reuse the existing Node-based QA engine with minimal rewrite
- it is the shortest path from "local companion" to "full desktop product"

## Why not browser-only

Browser apps, including installed PWAs, do not get unrestricted OS execution.

So a browser-only approach cannot reliably:

- run Playwright locally
- spawn `cmd.exe` or PowerShell freely
- manage privileged filesystem/process flows

## Why not Tauri first

Tauri is attractive for size and security, but for SitePulse right now it would require:

- sidecar process management
- extra permissions/capability plumbing
- a Rust-centric packaging layer on top of the current Node/Playwright engine

That makes it a slower path for the current product stage.

## Consequences

Positive:

- fast reuse of current QA engine
- direct path to a future desktop app
- Windows-native features now become practical

Tradeoff:

- larger app footprint than Tauri
- packaging and update flow still need hardening in later phases

## References

Official references used for this decision:

- Electron process model: https://www.electronjs.org/docs/latest/tutorial/process-model
- Electron auto updater: https://www.electronjs.org/docs/latest/api/auto-updater
- Electron deep-link/custom protocol support: https://www.electronjs.org/docs/latest/tutorial/launch-app-from-url-in-another-app
- Tauri sidecars: https://v2.tauri.app/learn/sidecar/
- Tauri updater plugin: https://v2.tauri.app/plugin/updater/
- Playwright as a library: https://playwright.dev/docs/library
- Microsoft MSIX overview: https://learn.microsoft.com/en-us/windows/msix/overview
