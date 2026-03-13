# Desktop AI Architecture

## Purpose

This document is the internal technical reference for the SitePulse Desktop AI layer.
It exists to keep future changes anchored to the real architecture instead of ad-hoc UI work.

Update this file whenever the desktop AI, operational memory, Prompt Workspace enrichment,
or Electron bridge changes.

## Objectives

The desktop AI layer is not a generic chat widget.
It exists to:

- use the real application state
- help users interpret runs, issues, logs, and memory
- improve prompt generation with validated operational history
- expose safe actions inside the app
- preserve traceability for learned resolutions

## Core Principles

- Keep the assistant connected to real app state.
- Prefer operational answers over decorative language.
- Never claim an action ran if it did not run.
- Preserve compatibility with the current QA engine, Prompt Workspace, and curated learning base.
- Keep manual override and auto-promotion clearly distinguishable.
- Maintain full traceability for learning changes.

## Architecture Overview

The desktop AI system is split into four layers:

1. QA runtime learning layer
2. Electron bridge layer
3. Renderer state and UX layer
4. Assistant reasoning and action layer

### 1. QA Runtime Learning Layer

Files:

- [index.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\index.mjs)
- [issue-learning-store.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\issue-learning-store.mjs)
- [issue-learning-service.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\issue-learning-service.mjs)
- [issue-learning-library.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\issue-learning-library.mjs)
- [issue-learning-admin.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\issue-learning-admin.mjs)

Responsibilities:

- persist operational learning between runs
- merge curated knowledge with runtime evidence
- track `validated`, `failed`, and `partial` outcomes
- promote `possibleResolution` to `finalResolution` when revalidation evidence is strong enough
- track the origin of a final resolution
- expose snapshots and manual override operations

### Learning Sources

The learning model supports these resolution origins:

- `curated`
- `auto_promoted`
- `manual_override`

### Key Learning Fields

Issues and memory entries can carry:

- `learningStatus`
- `learningCounts`
- `learningCases`
- `possibleResolution`
- `finalResolution`
- `finalResolutionOrigin`
- `resolutionConfidence`
- `promotionSource`
- `promotionCount`
- `lastValidatedAt`
- `manualOverrideCount`
- `lastManualOverrideAt`
- `lastManualOverrideBy`
- `lastManualOverrideNote`
- `learningSource`

### Promotion Logic

Auto-promotion is evidence-based.
It should only happen when:

- a prior issue had a `possibleResolution`
- the same context is revalidated
- the issue disappears in the next equivalent run

Manual override is explicit and traceable.
It should be used when an operator knows a solution must be treated as final.

## 2. Electron Bridge Layer

Files:

- [main.cjs](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\main.cjs)
- [preload.cjs](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\preload.cjs)

Responsibilities:

- expose safe IPC methods to the renderer
- call QA runtime administration commands
- keep renderer access narrow and explicit

Current memory-related IPC:

- `getLearningMemory`
- `applyLearningManualOverride`

## 3. Renderer State and UX Layer

Files:

- [renderer.html](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.html)
- [renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js)

Responsibilities:

- normalize current report state
- render issue memory in Findings and Settings
- expose filters over learned memory
- enrich Prompt Workspace with real learning history
- host the assistant drawer and action UI

### Memory Panel

The validated learnings panel is operational, not decorative.
It should help the user answer:

- what usually works
- what failed before
- what is only a hypothesis
- which issues have the strongest validation history

Implemented filters:

- `validated`
- `failed`
- `partial`
- `auto-promoted`
- `manual override`
- `source`
- `issue code`
- `category`
- `severity`
- `recent`
- `most validated`
- `most failed`

### Prompt Workspace Enrichment

The Prompt Workspace must use real history.

Prompt generation should consider:

- issue code
- validated resolutions
- failed attempts to avoid
- partial attempts
- final resolution when available
- current run context

The goal is to reduce generic prompts and repeated bad suggestions.

## 4. Assistant Reasoning and Action Layer

File:

- [assistant-service.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\assistant-service.js)

Responsibilities:

- interpret user intents using real application context
- produce operational answers
- suggest next actions
- trigger app actions when they are safe and supported

This is not a generic chatbot.
It uses the current app state passed from the renderer.

### Cognitive Modes

The assistant now routes each request through an explicit cognitive mode instead of treating all requests as one generic assistant flow.

Implemented modes:

- `operator`
- `audit_analyst`
- `prompt_engineer`
- `product_guide`
- `strategy_advisor`

Each mode declares:

- name
- description
- capabilities
- allowed actions
- context sources
- priority rules
- response style

This lives in the mode registry inside [assistant-service.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\assistant-service.js).

### Mode Routing

The assistant request flow is now:

1. detect intent
2. select the matching cognitive mode
3. build mode-specific context
4. execute the mode handler
5. filter suggested actions against the mode's allowed action list

This keeps operator-like requests from behaving like prompt generation, and keeps strategy answers separate from UI help.

### Assistant Context Inputs

The assistant can consume:

- current report
- loaded run
- issue list
- severity and category data
- operational memory snapshot
- compare digest
- active workspace
- logs and summaries
- Prompt Workspace helpers

### Supported Intent Classes

- app guide
- memory guide
- audit intelligence
- prompt intelligence
- action requests
- issue explanation
- run comparison
- SEO prioritization

### Examples of Supported Commands

- analyze the last run log and tell me the SEO priorities
- explain `SEO_LANG_MISSING`
- which critical issues already have a validated solution?
- which solutions failed in this category?
- compare the current run with the previous one
- generate a prompt for issue X
- open memory for issue Y
- teach me how to use the memory panel
- open the latest run
- promote this solution manually

Example mappings:

- `audite https://example.com` -> `operator`
- `analise o log da ultima execucao` -> `audit_analyst`
- `gere um prompt para corrigir SEO_CANONICAL_MISSING` -> `prompt_engineer`
- `como usar o painel de memoria?` -> `product_guide`
- `o que devo corrigir primeiro?` -> `strategy_advisor`

## Manual Override Flow

Manual override is available from issue-level actions and memory-level actions.

Expected flow:

1. user chooses promote/manual override
2. app asks for confirmation
3. optional note is recorded
4. override is persisted through the QA admin layer
5. the memory snapshot is refreshed
6. the issue and memory views reflect the updated final resolution

Traceability must always include:

- issue code
- chosen solution
- origin as `manual_override`
- timestamp
- actor/context if available
- optional note

## Confidence Hierarchy

The recommendation hierarchy should remain:

1. curated final resolution
2. manual override final resolution
3. auto-promoted final resolution with sufficient validation
4. possible resolution with positive evidence
5. generic fallback guidance

Previously failed patterns should always be surfaced when relevant.

## Current UX Entry Points

- Findings issue actions
- Settings memory panel
- Prompt Workspace prompt generation
- Assistant drawer
- keyboard shortcut `Ctrl+J`

## Safety Rules

- Do not invent missing data.
- Do not hide whether a recommendation is validated or hypothetical.
- Do not promote solutions silently.
- Do not mutate memory without traceability.
- Do not bypass confirmation for manual overrides.

## Validation Checklist

When changing this architecture, validate at minimum:

- `node --check qa/src/index.mjs`
- `node --check qa/src/issue-learning-service.mjs`
- `node --check qa/src/issue-learning-store.mjs`
- `node --check qa/src/issue-learning-admin.mjs`
- `node --check companion/src/main.cjs`
- `node --check companion/src/preload.cjs`
- `node --check companion/src/renderer.js`
- `node --check companion/src/assistant-service.js`
- `npm --prefix companion run sync:runtime:fast`
- `npm --prefix companion run test:ui`
- `npm --prefix companion run smoke`

Run packaging when the renderer, bridge, or startup behavior changes:

- `npm --prefix companion run pack:dir`

## Known Extension Points

Recommended next steps that fit the current design:

- explicit focused-issue context for assistant actions
- compare view enriched with learned memory deltas
- manual promotion history viewer
- richer prompt templates by issue family
- guided repair plans per issue cluster

## Change Log

### 2026-03-13

Initial version created after these desktop AI commits:

- `18d1406` `feat(desktop): add persistent operational learning memory`
- `aab1c48` `feat(desktop): add operational assistant and manual memory override`
- `a781339` `fix(desktop): cover memory guide and latest run assistant intents`

### 2026-03-13

Assistant cognitive modes added:

- mode registry
- automatic mode detection
- mode-specific context routing
- UI display for active mode and detected intent
