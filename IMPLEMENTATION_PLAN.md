# Implementation Plan

Created 2026-10-23 from the updated `guide.md` (§8 vertical slices). Each phase is delivered as
small reviewable Tasks with CI verification and a pull request.

## Phase 0 — Process foundation ✅ (this Task)

- [x] Discovery docs (`docs/project-brief.md`, `scope.md`, `inspiration.md`, `product-name.md`)
- [x] Architecture, parity, assumptions docs
- [x] Tracking files (`IMPLEMENTATION_PLAN`, `REQUIREMENTS_TRACEABILITY`, `DECISIONS`,
      `PROGRESS`, `CHANGELOG`, `ATTRIBUTION`)
- [x] QC checklist (`docs/qc/manual-qc.md`)
- [x] Open-source licence (MIT) and README correction
- [x] GitHub Actions verification workflow for pull requests + multi-OS
- [x] Repair the Pages deploy workflow (it used `npm ci` against a Bun-only lockfile)
- [x] Agent role definitions in `.opencode/agents/`

Acceptance: CI produces required checks on the pull request and they pass.

## Phase 1 — Evidence integrity ✅

- [x] Pure rule module `src/utils/evidenceIntegrity.ts`
- [x] Unit tests for allowed/blocked promotions and integrity summary
- [x] Evidence page: guarded status changes, blocker dialog, edit flow
- [x] Integrity summary strip (verified vs unsupported, riskiest claim type)
- [x] Dashboard integration of the integrity score

Acceptance: promoting a claim without the required evidence is blocked in the UI and the rule
is covered by tests.

## Phase 2 — Search and navigation

- [x] Full-text search across research, interviews, risks, roadmap
- [ ] Filter chips per entity page with URL-state-free local persistence
- [ ] Empty states that name the next action

## Phase 3 — Accessibility

- [ ] Focus trap and restore for all modals
- [ ] Keyboard navigation for the canvas
- [ ] Contrast pass in both themes; automated axe check in CI
- [ ] Complete `docs/qc/manual-qc.md` keyboard section

## Phase 4 — Reporting

- [x] One-page validation report (problem, riskiest assumptions, evidence, decision)
  - `src/utils/validationReport.ts` builds the report from real workspace data
  - Every listed claim carries provenance (type, confidence, source, url, recorded time)
  - No decision is reported unless an experiment outcome was entered
- [x] Export as Markdown from one action (Markdown copy already existed)
- [ ] Export as JSON from the same action

## Phase 5 — Polish and packaging

- [ ] Performance pass at 500+ rows per table
- [ ] PWA/offline install
- [ ] Screenshots and a truthful README walkthrough

## Phase 1b — Capability additions from the competitive benchmark (2026-10-23)

- [x] `docs/competitive-benchmark.md` with sourced capability map and scope decision (D-008)
- [x] Goals, key results, and scorecard (Cascade OKRs + metrics, local-first)
  - `Objective` / `KeyResult` types, schema version 4 export package
  - `src/utils/okr.ts` (progress, health, summary, measured-value updates) + tests
  - `GoalsPage` with create objective, record measured value, source tracking, status
- [x] Advisor and mentor log (CoFoundersLab advice + MentorShow coaching, local only)
  - `src/utils/advisorLog.ts` (urgency, summaries, ordering) + tests
  - `AdvisorsPage` with sessions, verbatim quotes, commitments, and follow-up state
- [x] Team skills coverage (local only)
  - `src/utils/skillCoverage.ts` (coverage status, gaps, summary) + tests
  - `TeamPage` with members, requirements, and derived coverage
- [ ] First-hire pipeline (local only)

## Working agreement

- One slice per pull request; no mixed refactors.
- No heavy local builds. `~/.config/opencode/scripts/ci.sh run "<task>"` is the verifier.
- Update tracking files in the same slice as the code.
