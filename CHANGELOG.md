# Changelog

All notable changes are recorded here. Format follows Keep a Changelog; the project follows
semantic versioning for its export schema and application releases.

## [Unreleased]

### Added

- Process foundation: `docs/` brief, scope, inspiration, architecture, parity, assumptions,
  development guide, model map, and manual QC checklist.
- Tracking files: `IMPLEMENTATION_PLAN.md`, `REQUIREMENTS_TRACEABILITY.md`, `DECISIONS.md`,
  `PROGRESS.md`, `ATTRIBUTION.md`.
- MIT `LICENSE`.
- GitHub Actions verification workflow (`.github/workflows/ci.yml`): frozen Bun install,
  type check, Vitest, static build; lint and tests across Ubuntu, macOS, and Windows.
- `.ci-required.txt` declaring the authoritative checks.
- Agent role definitions in `.opencode/agents/`.
- Evidence integrity rules (`src/utils/evidenceIntegrity.ts`) with unit tests.
- Evidence page: guarded status promotion, "evidence required" dialog, claim editing,
  and an integrity summary strip.
- Dashboard evidence-integrity panel: supported-claim coverage, verified and unsupported
  counts, and the weakest claim type, linked to the ledger.
- Workspace search (`src/utils/workspaceSearch.ts`) behind the command palette, covering
  research, interviews, risks, and roadmap in addition to existing entities, with grouped
  results and an explicit no-match state.

- Objectives with measurable key results (`Objective`, `KeyResult`), a goals page, and a
  derived scorecard on the sidebar.
- `docs/competitive-benchmark.md`: a sourced capability map of Cofounder, CoFoundersLab,
  MentorShow, Eightfold AI, and Cascade, with explicit in-scope and out-of-scope decisions.

- Advisor and mentor log (`Advisor`, `AdvisorSession`, `AdvisorCommitment`) with pages,
  command-palette search, and schema version 5 export/import.
- `src/utils/advisorLog.ts`: commitment urgency, open-commitment ordering, and log summary.

- Team and skills coverage (`TeamMember`, `SkillRequirement`) with derived coverage status
  and a gap list; schema version 6.

- One-page validation report built by `src/utils/validationReport.ts` and selectable in the
  Reports page; per-claim provenance and an explicit "no recorded decision" state.

### Changed

- Pages deploy workflow now installs with Bun instead of `npm ci`, which failed because the
  repository has no `package-lock.json`.
- README licence section now states MIT and links the new docs.

### Fixed

- Claims can no longer be marked research-backed, customer-confirmed, or experiment-confirmed
  without the corresponding notes and source.
- Restored `validateWorkspaceReferences`, which the test suite imported but no longer existed;
  it now powers `runWorkspaceDiagnostics` instead of reporting unconditional success.
- Added the missing `@types/react` and `@types/react-dom` dev dependencies, so the type check
  actually resolves React's class-component API (the previous `any` fallback hid real errors).
- Phases page now receives `onProjectUpdated`; it was passed `onPhaseUpdated`, so advancing a
  phase or ticking a task called an undefined callback at runtime.
- Validation page now stores the canonical `ExperimentMethod` values (`customer_interview`,
  `smoke_landing_page`, `concierge_mvp`, `clickable_prototype`, `pre_order`) instead of a second
  vocabulary, so generated and manually created experiments agree.
- Documents export reads real fields (`estimatedDays`, `solvesProblem`, `productDescription`)
  instead of non-existent `effort`, `rationale`, and `description` properties.

## [1.0.0] — 2026-10-10

Baseline before this documentation and CI work: projects, phases, evidence ledger, risk register,
experiments, interviews, research, competitors, canvas, MVP planner, roadmap, business model,
GTM, landing-page studio, documents, and multi-provider AI co-founder with offline fallback.
