# Changelog

All notable changes are recorded here. Format follows Keep a Changelog; the project follows
semantic versioning for its export schema and application releases.

## [Unreleased]

Nothing yet; entries appear here as work lands.

## [0.1.0] — 2026-10-24

First functional test build; limited scope. The workspace modules below are implemented and
CI-verified on Linux, macOS, and Windows, and the static build deploys to GitHub Pages. Not yet
done: the human keyboard and screen-reader pass (`docs/qc/manual-qc.md`), automated accessibility
scanning, and any multi-platform installer beyond the static web build.

### Baseline

Before the documentation and CI work recorded below, the project already contained: projects,
phases, evidence ledger, risk register, experiments, interviews, research, competitors, canvas,
MVP planner, roadmap, business model, GTM, landing-page studio, documents, and a multi-provider
AI co-founder with offline fallback.

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

- Modal focus trap (`src/hooks/useFocusTrap.ts`): Tab cycles inside the dialog, focus moves to
  the first tabbable element on open, Escape closes, and focus returns to the trigger on close.
  Applied to the command palette, New Project, and Settings.
- Command palette keyboard navigation: arrow keys, Home/End, Enter, and a selected-row highlight
  that is not colour-alone.

- Canvas keyboard navigation (`src/utils/spatialNavigation.ts`): arrow keys select the nearest
  node in that direction, nodes are reachable by Tab in reading order, Delete removes a node, and
  focus visibly indicates the selected node.

- Import remapping extracted into pure functions (`src/db/importRemap.ts`) with tests, closing
  the untested-import gap for objectives, advisors, team members, and skill requirements.

- Documentation and process baseline required by the operating guide: pull request template,
  `CONTRIBUTING.md`, `ROADMAP.md` with readiness percentages, `docs/design/brand.md`, an original
  SVG mark in `assets/`, and `docs/research/` notes with a recorded approval gate.
- Project is now dual licensed MIT OR Apache-2.0 (D-009).

- `.github/workflows/release.yml`: on a `v*.*.*` tag, runs the same gate as CI, packages the
  static build with SHA-256 checksums, and publishes a **draft** GitHub Release whose body is
  taken from the matching CHANGELOG entry.

- Crash / bug reporting: `src/bugReport.ts` builds a scrubbed, bounded report (home paths and long
  ids removed, stack capped) and a pre-filled GitHub issue URL, with no token held by the app.
  `BugReportModal` previews the exact payload before anything is opened, and is reachable from the
  error boundary and from Settings → Integrity Audit.

- Update check (`src/updateCheck.ts`, `UpdateCheckPanel` in Settings → Privacy): compares the
  running version with the newest stable GitHub release, caches for an hour, and fails soft —
  offline, rate-limited, or malformed responses report "unavailable" rather than "up to date".

### Accessibility

- `src/index.css` guarantees a visible focus indicator (`:focus-visible`) and honours
  `prefers-reduced-motion: reduce` for all CSS-driven animation.
- Inline form errors on the goals, advisors, and team pages now use `role="alert"` so they are
  announced, not only displayed.
- The three icon-only delete buttons below the 24×24 CSS-pixel minimum were enlarged.

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

### Known limitations

- No human keyboard-only or screen-reader pass has been executed yet; `docs/qc/manual-qc.md` is
  the outstanding checklist.
- Touch-target sizes and colour contrast have not been audited against WCAG 2.2 AA.
- The release workflow is exercised by this release for the first time; artefact names and notes
  are intentionally minimal.
- Data is local to the browser profile (IndexedDB); there is no sync or account system by
  design, and the AI co-founder works offline in fallback mode.
