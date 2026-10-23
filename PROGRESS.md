# Progress Log

Newest first. Only claim what is recorded and verified. CI result is authoritative.

## 2026-10-23 — Competitive benchmark and goals/key results (R-034…R-036)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Read the public marketing sites of five products the user named as references
  (cofounder.co, cofounderslab.com, mentorshow.com, eightfold.ai, cascade.app) and recorded
  what each actually does in `docs/competitive-benchmark.md`.
- Recorded the scope decision in `DECISIONS.md` D-008: emulate capability classes that fit a
  local-first founder workspace; do not fake marketplaces, licensed content, enterprise
  integrations, or autonomous external actions.
- Added `Objective` and `KeyResult` types with unit, direction, baseline, target, and current
  value, and moved the export package to schema version 4 so objectives survive export/import.
- Added `src/utils/okr.ts` (progress, status bands, objective health, scorecard summary, pure
  measured-value updates) and unit tests.
- Added `GoalsPage`: create objectives with dynamic key results, record current values with an
  optional source, set status, delete, and see a derived summary.
- Wired the goals page into the sidebar, the command palette, and workspace search.

Two of the five named products are not founder tools: MentorShow is a French personal-development
masterclass subscription, and Eightfold AI is enterprise talent intelligence. Their transferable
capabilities are logged in the benchmark rather than copied.

### Verification

- CI run 1 **failed one unit test** in `okr.test.ts`: the `summarizeOkrs` expectation was wrong,
  not the code — a 50 % key result is `at_risk` under the documented bands, and an earlier test
  in the same file already asserted that. Fixed.
- CI run 2 on commit `25c3021` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Manual QC checklist not yet executed (R-030).
- One-page validation report export is still partial (R-032).
- The objectives import path has no dedicated test (R-035).

## 2026-10-23 — Full-text workspace search (R-029)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `src/utils/workspaceSearch.ts`: pure, tokenised, case-insensitive search over evidence,
  research, interviews, risks, roadmap, experiments, competitors, and features. Title matches
  rank above body matches and results are capped per entity type.
- Rewired the command palette to use it, grouped results by entity with the owning page as the
  destination, added the four missing data sources from `App`, and added an explicit no-match
  state.
- Added `src/utils/workspaceSearch.test.ts` covering short queries, case-insensitivity, every
  entity type, body matching, token order, tab mapping, ranking, per-kind limits, and grouping.

### Verification

- CI run 1 **failed on the type check**: two fixtures were incomplete (`CustomerInterview`
  requires `surprisesOrObjections`; `commercial` is not a `RiskCategory`). Fixed.
- CI run 2 **failed one unit test**: the grouping test forgot that the experiment hypothesis
  also contains "late payments", so four groups are returned, not three. The test was wrong,
  not the search. Fixed.
- CI run 3 on commit `9ffe4c7` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Manual QC checklist not yet executed (R-030).

## 2026-10-23 — Dashboard evidence integrity (R-031)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added an Evidence Integrity panel to the dashboard: supported-claim coverage, supported /
  verified / unsupported counts, and the weakest claim type, each linking to the ledger.
- Reused `summarizeEvidenceIntegrity` rather than recomputing the numbers in the component, so
  the dashboard and the ledger cannot disagree.

### Verification

- CI on this slice **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Manual QC checklist not yet executed (R-030).

## 2026-10-23 — Foundation and evidence integrity

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Read the updated `guide.md` and adopted its operating model (Chat → Task → PR; CI-only heavy work).
- Audited the repository: 66 tracked files, 12k lines of TS/TSX, no `docs/`, no PR CI, and a Pages
  workflow that could not install dependencies (`npm ci` without `package-lock.json`).
- Added the documentation and tracking baseline required by guide §6 and §11.
- Replaced the contradictory "all rights reserved" README licence note with MIT.
- Added PR CI: Bun frozen install, type check, Vitest, and static build; lint + tests on three OSes.
- Repaired the Pages deploy workflow to use Bun.
- Added repository agent role definitions.
- Implemented the evidence-integrity rule and wired it into the Evidence page.

### Verification

- First CI run (PR #2) **failed**, and proved why the gate was needed: `tsc` had never run in
  CI, so it surfaced two pre-existing defects — `ErrorBoundary` had no React type declarations
  (`@types/react` was absent from `devDependencies`), and `validation.test.ts` imported
  `validateWorkspaceReferences`, which did not exist. Both are fixed in this slice.
- Second CI run **failed on the type check again**, exposing five defects that the untyped
  `react` fallback had hidden: a wrong callback prop on the Phases page, a second (conflicting)
  experiment-method vocabulary in the Validation page, and three non-existent fields in the
  Documents export templates. All five are fixed in this slice.
- Third CI run on commit `3f99972` **succeeded** on every required check:
  `verify (ubuntu-latest)`, `verify (macos-latest)`, `verify (windows-latest)`,
  `build (static)`, and `summary`. The static build artefact also uploaded successfully.

### Known gaps

- Dashboard does not yet show the evidence-integrity score (R-031).
- Command palette does not search research/interviews/risks/roadmap (R-029).
- Manual QC checklist not yet executed (R-030).

## 2026-10-10 — Prior work (from git history)

Risk register UI and dashboard snapshot, configurable AI model lists with temperature and max
tokens, provider extraction, and expanded unit tests. Recorded here from commit messages; these
were not re-verified in this session beyond the current CI run.
