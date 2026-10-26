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
- [x] Filter chips per entity page with URL-state-free local persistence — shared
      `src/components/ui/FilterChip.tsx`; evidence status, research category, risk status/category,
      interview severity, team commitment
- [x] Empty states that name the next action — evidence, MVP planner, roadmap, interviews, team

## Phase 3 — Accessibility

- [x] Focus trap and restore for all modals (`useFocusTrap`)
- [x] Keyboard navigation for the canvas (spatial arrow selection, Delete, Enter)
- [x] Contrast pass in both themes; automated axe check in CI — `.github/workflows/a11y.yml` runs Playwright + axe-core; critical contrast violations fixed
- [x] Complete `docs/qc/manual-qc.md` keyboard section — code-review pass recorded 2026-10-24; human pass completed 2026-10-25

## Phase 4 — Reporting

- [x] One-page validation report (problem, riskiest assumptions, evidence, decision)
  - `src/utils/validationReport.ts` builds the report from real workspace data
  - Every listed claim carries provenance (type, confidence, source, url, recorded time)
  - No decision is reported unless an experiment outcome was entered
- [x] Export as Markdown from one action (Markdown copy already existed)
- [x] Export as JSON from the same action — DocumentsPage offers Download .json alongside Download .md

## Data integrity hardening

- [x] Pure `src/db/importRemap.ts` covering every nested ID rewrite (objectives, advisors with
  sessions and commitments, team, skills, roadmap, risks), extracted from `importProjectPackage`

## Phase 5 — Polish and packaging

- [ ] Performance pass at 500+ rows per table
- [x] PWA/offline install — `public/manifest.json`, `public/sw.js` offline shell, install icons;
      registered from `src/main.tsx` in production builds only
- [x] Screenshots and a truthful README walkthrough — `assets/screenshots/` (desktop/tablet/mobile/empty-state) + README walkthrough section

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

## Guide compliance (2026-10-24 review of the operating manual)

- [x] `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`, `ROADMAP.md`
- [x] `docs/design/brand.md` + original `assets/logo.svg`
- [x] `docs/research/` notes with a recorded human gate
- [x] Dual licence MIT OR Apache-2.0 (D-009)
- [x] `release.yml` for semver tags (draft GitHub Release with CHANGELOG section + checksums)
- [x] In-app crash / bug reporting (`src/bugReport.ts` + `BugReportModal`, error boundary entry point
  and a manual entry point in Settings)
- [x] In-app update check (`src/updateCheck.ts` + `UpdateCheckPanel`, fail-soft, hour cache)
- [x] `v0.1.0` GitHub Release (published 2026-10-24; v0.2.0 published 2026-10-25)

## Accessibility (Part II §21)

- [x] `ACCESSIBILITY.md` (WCAG 2.2 AA target, known limitations, report path)
- [x] Reduced motion, visible focus, `role="alert"` errors, 24×24 touch targets
- [x] Accessibility issue template and label; PR checklist for UI changes
- [x] Human keyboard and screen-reader pass (R-030) — completed 2026-10-25
- [x] Phase 1 code-level fixes: skip-to-content link, `aria-hidden` on decorative icons, `aria-label` on icon-only buttons
- [x] Automated accessibility scan in CI — `.github/workflows/a11y.yml` runs Playwright + axe-core on homepage and demo dashboard; critical violations fail the build

## Example project for release testing (2026-10-25)

- [x] `assets/example-project-tradepulse.json` — complete TradePulse demo workspace export covering evidence, competitors, experiments, interviews, risks, roadmap, canvas, business model, GTM plan, and landing page
- [x] `public/assets/example-project-tradepulse.json` — same file served as a static asset for in-app fetching
- [x] Settings → "Import Example Project" button that loads the bundled demo workspace
- [x] Release artefacts include `example-project-tradepulse.json` alongside build, checksums, and SBOM

## Working agreement

- One slice per pull request; no mixed refactors.
- No heavy local builds. `~/.config/opencode/scripts/ci.sh run "<task>"` is the verifier.
- Update tracking files in the same slice as the code.
