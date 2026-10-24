# Progress Log

Newest first. Only claim what is recorded and verified. CI result is authoritative.

## 2026-10-25 · Example project for release testing (R-048)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- `assets/example-project-tradepulse.json` and `public/assets/example-project-tradepulse.json` — complete TradePulse demo workspace export covering evidence, competitors, experiments, interviews, risks, roadmap, canvas, business model, GTM plan, landing page, and decisions
- Settings → Export / Import Project: new "Import Example Project" button that loads the bundled demo workspace directly (`fetch` from `/assets/example-project-tradepulse.json` + `importProjectPackage`)
- `.github/workflows/release.yml`: release artefacts now include `example-project-tradepulse.json` alongside static build, checksums, and SBOM
- `CHANGELOG.md`, `IMPLEMENTATION_PLAN.md`, `REQUIREMENTS_TRACEABILITY.md` updated with R-048

### Verification

- CI green (required: verify ×3, build (static), summary, gitleaks, sbom)

## 2026-10-24 · Accessibility code pass (R-047)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- `src/index.css`: guaranteed `:focus-visible` indicator; `prefers-reduced-motion: reduce` disables
  all transitions and animation (no JS animation library is imported, so CSS covers everything).
- Inline form errors on the goals, advisors, and team pages use `role="alert"`.
- The three icon-only delete buttons under 24×24 CSS pixels were enlarged.
- `ACCESSIBILITY.md` written (WCAG 2.2 AA target, priorities, honest known limitations,
  environments, report path); accessibility acceptance criteria added to `docs/qc/manual-qc.md`.

### Known gaps

- No automated accessibility scan in CI (placeholder workflow exists; real Axe run needs `@axe-core/playwright` + updated `bun.lock`).
- Contrast is designed for AA in both themes but not measured.
- Human keyboard and screen-reader pass completed 2026-10-24 (recorded in `docs/qc/manual-qc.md`).

## 2026-10-24 · Guide compliance, bug reporting, update check, v0.1.0

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Pure, tested import remapping (`src/db/importRemap.ts`) wired into `importProjectPackage`
  (PR #10, R-035/038/040).
- Guide-compliance baseline (PR #11): `.github/PULL_REQUEST_TEMPLATE.md`, `CONTRIBUTING.md`,
  `ROADMAP.md`, `docs/design/brand.md`, original `assets/logo.svg`, `docs/research/` with a
  recorded human gate, dual licence MIT OR Apache-2.0 (D-009).
- `release.yml` (PR #12): semver tags run the full gate, package the static build with SHA-256
  checksums, and publish a draft GitHub Release with the CHANGELOG section.
- In-app bug reporting (PR #13, R-045, C-28): `src/bugReport.ts` builds a scrubbed, bounded
  report and a pre-filled issue URL with no token; `BugReportModal` previews the payload;
  entry points from the error boundary and Settings → Integrity Audit.
- Fail-soft update check (PR #14, R-046, C-29): `src/updateCheck.ts` + `UpdateCheckPanel`;
  offline, rate-limited, and malformed responses report "unavailable", never "up to date".
- Repository-local git identity set to `OpenFounder Dev <dev@example.com>` per the operating
  guide §5.5; existing history left untouched (the rule is adopted, not retro-applied).
- Version single-sourced as `CURRENT_APP_VERSION` (`0.1.0`) across package.json, the export
  metadata, the dossier template, Settings, and the error boundary.
- CHANGELOG restructured: `[Unreleased]` folded into `[0.1.0] — 2026-10-24`; the never-released
  `[1.0.0]` heading replaced by an honest Baseline subsection plus Known limitations.
- `v0.1.0` tagged and released via `release.yml` (see below for the run result).

### Verification

- PRs #10–#13 merged with every required check green (`verify` ×3, `build (static)`, `summary`).
- PR #14: first push failed the unit test on three platforms (the test factory kept the default
  `htmlUrl` when overriding `tagName`, so the URL assertion mismatched). Fixed the factory to
  derive the URL from the tag; re-ran green. The branch also needed rebasing onto main after an
  earlier squash merge left it on stale history; the rebase replayed only the slice commits.
- Identity on new commits verified: `git log --format='%an <%ae>'` shows `OpenFounder Dev`.

### Known gaps

- No human keyboard or screen-reader pass yet (R-030); no automated accessibility scanning in CI.
- GitHub account-level security settings (MFA enforcement, second admin, branch protection,
  private vulnerability reporting) are repo/account configuration and need the owner.

## 2026-10-24 · Canvas keyboard navigation (R-043)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `src/utils/spatialNavigation.ts` + tests: arrow keys select the nearest node in the
  requested direction; candidates are ranked by travel in that direction with lateral drift
  penalised, so a node directly below beats one diagonally below-and-far.
- `CanvasPage`: nodes are reachable by Tab in reading order, carry `aria-label`/`aria-pressed`,
  respond to arrows and Enter/Space, and Delete/Backspace removes the node and its edges.

### Verification

- CI run 1 **failed the type check**: stored canvas nodes have optional `width`/`height`, which
  the spatial descriptor required. The descriptor now treats size as optional with documented
  defaults rather than forcing callers to fake values.
- CI run 2 **failed one test** because my fixture put a node diagonally nearer in travel distance
  than the node I expected; the rule was right and the expectation was wrong. The fixture is now
  aligned in the same column, and two extra tests document the lateral-drift penalty explicitly.
- CI run 3 on commit `ef53e07` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Human keyboard and screen-reader pass is still not done (R-030 remains Partial).
- No automated accessibility (axe) check in CI.

## 2026-10-24 · Modal focus trap and palette keyboard navigation (R-041, R-042)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `src/utils/focusTrap.ts` (DOM-free tabbable filtering and wraparound maths) with tests, and
  `src/hooks/useFocusTrap.ts` wiring it: Tab cycles inside a dialog, focus moves to the first
  tabbable element on open, Escape closes, and focus returns to the trigger on close.
- Applied the trap to all three overlays (command palette, New Project, Settings).
- Added `src/utils/paletteNavigation.ts` and tests: one flat entry list over action, navigation,
  and search results, with Arrow/Home/End/Enter handling and a selected-row highlight that is not
  colour-alone.
- Recorded a **code-review** accessibility pass in `docs/qc/manual-qc.md`, explicitly stating that
  a human browser and screen-reader pass is still outstanding.

### Verification

- CI run 1 **failed the type check on my own new code**: `collectTabbable`'s callback was typed as
  returning a boolean while it should return the descriptor, `Element` needed casting to
  `HTMLElement` in the hook and tests, and a redeclared `normalisedQuery` survived an earlier
  reorder. CI caught all three; they are fixed in this push.
- CI run 2 on commit `ddaefc1` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Human keyboard and screen-reader pass is still not done (R-030 remains Partial).
- Canvas has no keyboard navigation.
- No automated accessibility (axe) check in CI.

## 2026-10-23 — One-page validation report (R-032)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `src/utils/validationReport.ts`: a pure builder for the one-page report covering the
  problem, riskiest unsupported assumptions, open risks, verified evidence, recorded decisions,
  and the next action.
- Every listed claim carries provenance (type, confidence, source, URL, recorded time); the
  unsupported list is capped and states how many more exist.
- Wired it into the Reports page as a template, with the demo-mode banner preserved for
  synthetic projects.

### Verification

- CI run 1 **failed the type check**: an earlier bulk edit had put `objectives`/`teamMembers`
  props on the dashboard instead of the Documents page. Reverted.
- CI run 2 **failed one test**, then run 3 failed again on the same test: the empty-evidence
  branch and the "no verified claims" branch used different sentences, so the report could say
  only one of the two things it needed to say. Both now print, and the test passes.
- CI run 4 on commit `4dc3154` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Import round trips for schema versions 4–6 still have no dedicated tests.
- Manual QC checklist not yet executed (R-030).

## 2026-10-23 — Team and skills coverage (R-039, R-040)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `TeamMember` and `SkillRequirement` types; export/import moved to schema version 6.
- Added `src/utils/skillCoverage.ts`: proficiency mapping, coverage status, derived gap list,
  and a summary. Explicitly no hidden per-person scoring: a listed skill counts as "working"
  level, and advisor-only coverage is capped at "thin".
- Added `TeamPage`: members (role, commitment, skills, focus), requirements (skill, why,
  importance, target level), derived coverage per skill, and a named gap list.
- Wired into the sidebar, command palette, workspace search, and `ProjectContext`.

### Verification

- CI run 1 **failed the type check**: `Users` was imported twice in the sidebar and the palette,
  the coverage summary was missing its `gaps` field, and `TeamPage` read it. All three fixed.
- CI run 2 **failed two unit tests**, both of which were the tests being wrong rather than the
  rules: skill matching needed whitespace normalisation (fixed in the rule, tested), and the
  advisor-only test gave a full-time member the same skill, so the rule could not have applied.
  That test now isolates advisor-only coverage and asserts the cap.
- CI run 3 on commit `6949064` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Import paths for the new schema versions have no round-trip tests (R-035, R-038, R-040).
- Manual QC checklist not yet executed (R-030).

## 2026-10-23 — Advisor and mentor log (R-037, R-038)

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Added `Advisor`, `AdvisorSession`, and `AdvisorCommitment` types; export/import moved to
  schema version 5 so advisor data survives a package round trip.
- Added `src/utils/advisorLog.ts`: ISO date maths, commitment urgency, open-commitment ordering
  by urgency then due date, and log summary.
- Added `AdvisorsPage`: add an advisor, log a session with advice and verbatim quotes, record
  commitments with due dates, toggle commitments, and delete an advisor.
- Wired the page into the sidebar, the command palette, and workspace search (quotes are
  searchable).
- Moved R-037, R-038, and C-25 to Done in the tracking files.

### Verification

- CI run 1 **failed one test** in `workspaceSearch.test.ts`: the new advisor search body did not
  include session quotes, so the assertion had nothing to match. The search was incomplete rather
  than the test wrong, so quotes were added to the candidate body.
- CI run 2 on commit `308fcfa` **succeeded** on every required check: `verify (ubuntu-latest)`,
  `verify (macos-latest)`, `verify (windows-latest)`, `build (static)`, and `summary`.

### Known gaps

- Import paths for the new schema versions have no round-trip tests (R-035, R-038).
- Manual QC checklist not yet executed (R-030).

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
