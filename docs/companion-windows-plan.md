# SitePulse Companion For Windows

## Goal

Build a Windows companion app that removes the need for users to have the SitePulse source repo on disk just to run full local audits.

The companion app must:

- run the existing QA engine locally with Playwright
- expose a localhost bridge that the SitePulse Hub can call from the browser
- open the reports folder and surface live logs
- support Windows-first usage with no manual `npm run audit:bridge` requirement
- prepare the codebase for the next phase: a full desktop product

## Why this is needed

Browser apps and PWAs cannot safely spawn local processes like `cmd.exe`, `node`, or Playwright browsers by themselves.

That means the current browser-only flow is inherently limited:

- remote web app can read reports and orchestrate actions
- remote web app cannot become the privileged execution layer
- the privileged execution layer must live on the user's machine

## Recommended architecture

Use a local Windows companion app plus a localhost bridge.

Flow:

1. User installs `SitePulse Companion`.
2. Companion starts a local bridge on `127.0.0.1:47891`.
3. SitePulse Hub checks that local bridge.
4. Hub triggers full local audits through that bridge.
5. Bridge runs the QA engine and returns the resulting report.

## Technology decision

For this codebase, the best immediate choice is `Electron`.

Reason:

- the current QA engine is already `Node.js + Playwright`
- Electron main process already supports Node APIs directly
- Electron can manage tray, windows, child processes, local files, deep links, and future updater flows
- this minimizes rework before the later full desktop phase

`Tauri` remains a strong future option, but for the current engine it adds sidecar and Rust integration complexity too early.

## Delivery phases

### Phase 1: Companion foundation

- refactor the bridge into a reusable core module
- create `companion/` Electron project
- add a simple status window
- start/stop the local bridge from the app
- stream logs into the window
- open SitePulse Hub and reports folder
- add a smoke-test mode for validation

### Phase 2: Hub integration

- detect companion automatically in the web Hub
- improve messaging when the bridge is absent
- prefer companion language over raw `npm run audit:bridge`

### Phase 3: Product hardening

- writable runtime sync for QA files
- packaged Windows build
- autostart option
- signed updates
- licensing/account integration

## Acceptance criteria

- user can launch the companion app without cloning the repo manually
- companion can expose `/health`, `/run`, and `/open-cmd` through localhost
- browser Hub can trigger a full local audit through the companion
- reports are written to a user-accessible folder
- a smoke test proves the bridge starts and responds

## Constraints

- browser alone will never gain local process privileges
- PWA install does not solve local execution restrictions
- the privileged layer must be native/local
