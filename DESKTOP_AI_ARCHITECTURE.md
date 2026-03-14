# Desktop AI Architecture

## Purpose

This document is the internal technical reference for the SitePulse Desktop AI layer.
It exists to keep future changes anchored to the real architecture instead of ad-hoc UI work.

Update this file whenever the desktop AI, operational memory, Prompt Workspace enrichment,
Electron bridge, or Self-Healing Engine changes.

## Objectives

The desktop AI layer is not a generic chat widget.
It exists to:

- use the real application state
- help users interpret runs, issues, logs, and memory
- improve prompt generation with validated operational history
- expose safe actions inside the app
- preserve traceability for learned resolutions
- orchestrate safe healing flows with explicit revalidation

## Core Principles

- Keep the assistant connected to real app state.
- Prefer operational answers over decorative language.
- Never claim an action ran if it did not run.
- Preserve compatibility with the current QA engine, Prompt Workspace, and curated learning base.
- Keep manual override and auto-promotion clearly distinguishable.
- Maintain full traceability for learning changes.

## Architecture Overview

The desktop AI system is split into these layers:

1. QA runtime learning layer
2. Electron bridge layer
3. Renderer state and UX layer
4. Assistant reasoning and action layer
5. Self-Healing orchestration layer
6. Impact and continuous intelligence layer
7. Data Intelligence consolidation layer
8. Optimization Engine layer
9. Quality Control Engine layer

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
- `getHealingSnapshot`
- `prepareHealingAttempt`

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
- expose the Self-Healing queue inside the Prompt Workspace
- reuse a shared derived intelligence snapshot per visible report to avoid drift between UI surfaces

### Derived Intelligence Snapshot

The renderer now consolidates derived intelligence through a shared snapshot builder in
[renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js).

That snapshot groups:

- operational memory
- self-healing snapshot
- continuous intelligence
- predictive intelligence
- autonomous QA
- optimization engine
- quality control engine

This exists for two reasons:

- avoid recomputing the same derived signals across Overview, Findings, Prompt Workspace and Assistant
- keep those surfaces aligned to the same cached intelligence state during a render cycle

### Comparable History Context And Pruning

The renderer now builds one comparable history context per visible report before handing data to:

- continuous intelligence
- predictive intelligence
- autonomous QA
- data intelligence

This context is responsible for:

- grouping runs by comparable target key (`baseUrl + mode + scope + mobile sweep`)
- reusing the same comparable run series across engines
- exposing one `reference` snapshot and one `previousComparable` snapshot
- reducing repeated history filtering and mapping work in the renderer

History persistence is also pruned deterministically:

- keep a bounded global history
- keep a bounded number of snapshots per target
- deduplicate by comparable target + stamp

This preserves run history features while limiting storage growth and avoiding stale comparisons against unrelated targets.

### Data Intelligence Layer

Files:

- [data-intelligence-service.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\data-intelligence-service.js)
- [renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js)

Responsibilities:

- consolidate runs, issues, impact, predictive signals, healing state, memory state and quality history
- expose one normalized context model for downstream consumers
- enrich each issue with a single merged state instead of forcing each consumer to stitch signals independently

Context model:

- `SITE_STATE`
- `QUALITY_STATE`
- `RISK_STATE`
- `TREND_STATE`
- `ISSUE_STATE`
- `ISSUE_MAP`

Per-issue enrichment currently includes:

- impact
- priority
- trend
- predictive risk
- healing confidence
- history

The assistant consumes this layer as `dataIntelligence`, and Findings now uses the same merged issue context when rendering cards.

### Optimization Engine

Files:

- [optimization-engine-service.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\optimization-engine-service.js)
- [renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js)

Responsibilities:

- detect SEO opportunities, UX improvements and performance gains from clustered issue evidence
- group related issues into structural clusters instead of route-by-route noise
- produce top structural improvements from the current audit state
- recommend shared fixes such as template logic, schema generation or layout system corrections

Current outputs:

- `summary`
- `clusters`
- `topImprovements`
- `structuralRecommendations`
- `opportunityGroups`

The Optimization Engine is downstream from Data Intelligence.
It does not recompute impact, predictive or healing logic from scratch.
It consumes the normalized issue state and turns it into structural improvement guidance.

### Quality Control Engine

Files:

- [quality-control-engine.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\quality-control-engine.js)
- [renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js)

Responsibilities:

- detect suspected false positives from operational memory outcomes
- flag inconsistencies between impact, priority and predictive risk
- apply validation rules to issue scoring, trend signals and risk classification
- surface top warnings in Overview and on individual finding cards

Current outputs:

- `summary`
- `issues`
- `issueMap`
- `topWarnings`

The Quality Control Engine is downstream from Data Intelligence and does not replace it.
Its purpose is to verify the coherence of the signals already produced by the other engines.

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

### Self-Healing Panel

The Prompt Workspace now includes a Self-Healing queue.

It should answer:

- which issues are eligible for assisted correction
- which ones are assist-only, manual-only, blocked or unsafe
- what the best known correction lead is
- which prompt is ready to copy
- whether a pending healing attempt is waiting for revalidation

The panel is intentionally operational:

- prepare healing
- copy healing prompt
- revalidate the latest pending attempt
- jump to operational memory

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
- impact scoring and priority
- operational memory snapshot
- self-healing snapshot and attempt queue
- compare digest
- continuous intelligence snapshot
- active workspace
- logs and summaries
- Prompt Workspace helpers

### Supported Intent Classes

- app guide
- memory guide
- audit intelligence
- prompt intelligence
- self-healing strategy and eligibility
- self-healing revalidation
- action requests
- issue explanation
- run comparison
- SEO prioritization
- impact prioritization
- regression and improvement trend analysis

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
- which issues can be auto-healed?
- what is the best healing strategy for issue X?
- should this issue stay manual or prompt-assisted?
- revalidate the latest healing attempt

Example mappings:

- `audite https://example.com` -> `operator`
- `analise o log da ultima execucao` -> `audit_analyst`
- `gere um prompt para corrigir SEO_CANONICAL_MISSING` -> `prompt_engineer`
- `como usar o painel de memoria?` -> `product_guide`
- `o que devo corrigir primeiro?` -> `strategy_advisor`
- `quais issues tem maior impacto?` -> `strategy_advisor`
- `qual e o maior risco de SEO agora?` -> `strategy_advisor`
- `quais issues podem ser auto-curadas?` -> `strategy_advisor`
- `qual a melhor estrategia para esta issue?` -> `strategy_advisor`
- `revalide a ultima tentativa` -> `operator`

## 5. Self-Healing Orchestration Layer

Files:

- [healing-engine-service.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\healing-engine-service.mjs)
- [healing-store.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\healing-store.mjs)
- [healing-strategy-registry.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\healing-strategy-registry.mjs)
- [healing-admin.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\healing-admin.mjs)

Responsibilities:

- classify issue eligibility
- choose healing mode
- compute confidence
- build healing prompts from current evidence and memory
- persist healing attempts
- revalidate pending attempts on the next completed run
- feed healing outcomes back into operational memory

### Healing Eligibility

Each issue can be classified as:

- `eligible_for_healing`
- `assist_only`
- `manual_only`
- `blocked`
- `unsafe`

This classification must drive whether the desktop prepares a healing flow or stays conservative.

### Healing Modes

Implemented modes:

- `suggest_only`
- `prompt_assisted`
- `orchestrated_healing`

`direct_action` is kept as a structural placeholder only. It is not used as an automatic path today.

### Healing Attempt Lifecycle

1. issue receives a self-healing strategy
2. operator prepares a healing attempt
3. attempt is persisted as pending
4. fix is applied outside the desktop
5. operator reruns the audit
6. runtime resolves the attempt as `validated`, `failed` or `partial`
7. outcome is recorded back into operational memory

### Safety Rules For Self-Healing

- never claim a fix was applied by the desktop if it only prepared a prompt
- never call a pending attempt validated without a completed rerun
- never hide failed or partial outcomes
- never auto-promote dangerous patterns into action
- keep operator confirmation explicit before preparing corrective flows

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

Healing attempts must also retain:

- strategy id
- healing mode
- confidence score and label
- attempted resolution
- outcome summary
- collateral regression count
- replay command

## Confidence Hierarchy

The recommendation hierarchy should remain:

1. curated final resolution
2. manual override final resolution
3. auto-promoted final resolution with sufficient validation
4. possible resolution with positive evidence
5. generic fallback guidance

Previously failed patterns should always be surfaced when relevant.

Self-healing should consume this hierarchy instead of bypassing it.

## 6. Impact And Continuous Intelligence Layer

Files:

- [impact-engine-service.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\impact-engine-service.mjs)
- [index.mjs](C:\Users\Administrador\Documents\SitePulse-QA\qa\src\index.mjs)
- [renderer.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\renderer.js)
- [assistant-service.js](C:\Users\Administrador\Documents\SitePulse-QA\companion\src\assistant-service.js)

Responsibilities:

- compute per-issue impact metadata
- classify issues into `P0` to `P4`
- explain why something is a priority
- generate executive summary blocks from the current run
- compare current report with baseline/previous run to detect regressions and improvements
- surface recurring patterns from history
- feed the assistant with the same impact and trend signals shown in the UI

### Impact Engine

Each issue can now carry:

- `impactScore`
- `impactCategory`
- `priorityLevel`
- `riskType`
- `confidence`
- `rationale`

These fields are attached inside the QA runtime before prompt pack, assistant guide and summary are finalized.

The runtime finalize flow also guarantees that `summary` is refreshed before `assistantGuide` is generated.
That prevents stale counts or stale priority metadata from leaking into the assistant brief.

### Priority Engine

Priority levels are operational:

- `P0` critical
- `P1` high priority
- `P2` medium
- `P3` low
- `P4` monitor

The renderer uses these levels to sort and display issues.
The assistant uses the same levels when answering "what should I fix first?" style questions.

### Continuous Intelligence

Continuous intelligence is intentionally split:

- runtime computes current-run impact and executive summary
- renderer computes comparison- and history-based trend context

This keeps one source of truth for issue impact while still using local baseline/history for drift detection.

Current continuous signals:

- new issues
- resolved issues
- persistent issues
- reduced/improving issues
- critical regressions
- recurring issues across recent snapshots
- SEO / Runtime / UX trend descriptors

### Executive Summary

The Overview surface now renders:

- top risks
- top opportunities
- recommended action order
- detected patterns
- trend chips for SEO, Runtime and UX

This summary should help the user understand what matters before reading the entire issue board.

## Current UX Entry Points

- Findings issue actions
- Settings memory panel
- Prompt Workspace prompt generation
- Prompt Workspace self-healing queue
- Assistant drawer
- keyboard shortcut `Ctrl+J`

## Safety Rules

- Do not invent missing data.
- Do not hide whether a recommendation is validated or hypothetical.
- Do not promote solutions silently.
- Do not mutate memory without traceability.
- Do not bypass confirmation for manual overrides.
- Do not claim a healing attempt succeeded until a rerun proves it.

## Validation Checklist

When changing this architecture, validate at minimum:

- `node --check qa/src/index.mjs`
- `node --check qa/src/issue-learning-service.mjs`
- `node --check qa/src/issue-learning-store.mjs`
- `node --check qa/src/issue-learning-admin.mjs`
- `node --check qa/src/healing-engine-service.mjs`
- `node --check qa/src/healing-store.mjs`
- `node --check qa/src/healing-strategy-registry.mjs`
- `node --check qa/src/healing-admin.mjs`
- `node --check qa/src/impact-engine-service.mjs`
- `node --check companion/src/predictive-intelligence-service.js`
- `node --check companion/src/autonomous-qa-service.js`
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
- direct-action support only after explicit safety gating and deterministic validation
- richer impact heuristics tied to page/business criticality once the product stores stronger project metadata
- predictive intelligence filters and deeper historical forecasting once project metadata becomes richer
- autonomous QA policy controls before introducing any future unattended execution

## Change Log

### 2026-03-13

Initial version created after these desktop AI commits:

- `18d1406` `feat(desktop): add persistent operational learning memory`
- `aab1c48` `feat(desktop): add operational assistant and manual memory override`
- `a781339` `fix(desktop): cover memory guide and latest run assistant intents`

### 2026-03-14

- `925f268` `feat(desktop): add impact engine and continuous intelligence`
- `ffee84f` `feat(desktop): add predictive intelligence engine`
- `83996cd` `feat(desktop): add autonomous qa engine`
- runtime finalize ordering and renderer derived-intelligence cache consolidation

### 2026-03-13

Assistant cognitive modes added:

- mode registry
- automatic mode detection
- mode-specific context routing
- UI display for active mode and detected intent

### 2026-03-14

Impact and continuous intelligence added:

- runtime Impact Engine with per-issue impact scoring and `P0`-`P4` priority
- executive summary attached to reports
- renderer-side continuous intelligence using baseline and run history
- overview panel for impact, trends and action order
- assistant responses upgraded to use impact, priority and trend context

### 2026-03-14

Predictive intelligence added:

- renderer-side predictive intelligence service based only on comparable run history
- issue-level trend analysis with `improving`, `stable`, `degrading` and `oscillating`
- predictive regression alerts with evidence lines and confidence
- systemic pattern detection across recurring issue codes and families
- assistant responses upgraded to answer regression-risk, worsening and history-pattern questions

### 2026-03-14

Autonomous QA Engine added:

- autonomous QA loop with traceable stages from audit analysis through predictive update
- playbook engine per issue family and code
- next action engine combining impact, priority, healing confidence and predictive risk
- quality score and quality trajectory summaries
- autonomous insights for top risks, improvements, regressions and action order
- prompt workspace panels for autonomous summary and loop observability
- assistant responses upgraded to answer next-step, quality-trajectory and biggest-risk questions

### 2026-03-13

Self-Healing Engine added:

- healing strategy registry
- healing store
- healing admin bridge
- self-healing queue in Prompt Workspace
- preparation of healing attempts
- revalidation outcome ingestion into operational memory
