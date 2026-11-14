# Roadmap

Readiness percentages are updated **only from verified evidence** (green CI, merged code, and —
where the guide requires it — a human pass). A capability listed as Done has code behind it and
tests behind the code.

Current stage: **v0.2.0 released (2026-10-25); v0.3.0 pending release.** `main` is ahead of the
`v0.2.0` tag with unreleased, CI-verified work (AI providers, responsive shell, a11y fixes, E2E
specs, docs sweep). `release.yml` builds a draft release from the tagged commit; a maintainer
reviews and publishes it. The gap is recorded in `PROGRESS.md` per the release-currency
directive; the sections below are the path to v1.0.0.

## v0.1.0 — first functional test build (release gate)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Runnable build for the primary platform | Ready | `bun run build:static` + `deploy.yml` publish to GitHub Pages; CI `build (static)` green |
| One real workflow with real persistence | Done | Evidence ledger with guarded promotion; Dexie persistence |
| App identity, theme, window title | Done | `OpenFounder`, light/dark theme |
| Crash / error boundary | Done | `ErrorBoundary` + `BugReportModal` with scrubbed payload |
| Update check | Done | `src/updateCheck.ts`, fail-soft with an hour cache |
| CI green (type check `tsc --noEmit`, tests, build) | Done | `.github/workflows/ci.yml`, `.ci-required.txt` |
| README with build and run instructions | Done | `README.md` |
| CHANGELOG entry for 0.1.0 | Done | `## [0.1.0] — 2026-10-24` section |
| Legal baseline (LICENSE, ATTRIBUTION, no secrets) | Done | dual licence MIT OR Apache-2.0 (D-009); ATTRIBUTION current |
| GitHub Release `v0.1.0` published | Done | tagged `v0.1.0`; draft built by `release.yml`, then published |

## v0.2.0 — reporting and polish

| Capability | Status |
| --- | --- |
| Crash / bug reporting that files a GitHub issue from the app | Done |
| Update check against GitHub Releases, failing soft offline | Done |
| Export the validation report as JSON | Done |
| Accessibility: human keyboard and screen-reader pass (R-030) | Done |
| Import round trip exercised end-to-end by a human | Planned — owner deferred the QC pass on 2026-10-26 |

## v1.0.0 — capability completeness

| Capability | Status |
| --- | --- |
| Every in-scope capability in `docs/scope.md` implemented and verified | Done |
| `docs/parity.md` has no Planned rows for v1 scope | Done (C-23 cloud sync is explicitly out of scope) |
| Manual QC checklist executed and recorded | Done |

## Missing standard files (follow-ups, not yet present)

The following community/privacy files are referenced by the audit and launch checklist but do
not exist yet; they are tracked here rather than being invented:

- `PRIVACY.md` — privacy notice (local key storage, optional key persistence, crash-report
  submission) — see `SECURITY.md` SEC-04 / audit SEC-04
- `SUPPORT.md` — support and contact guidance
- `CODEOWNERS` — code ownership routing
- `NOTICE` — third-party attribution notice

## Follow-ups recorded by the 2026-10-29 documentation-truthfulness sweep (DOC-03)

- **2026-11-14 · Example-project version drift.** Both shipped copies of
  `assets/example-project-tradepulse.json` and `public/assets/example-project-tradepulse.json`
  still declare `appVersion: "0.1.0"` while the application is at 0.2.0. The import path
  does not read `appVersion`, so this is cosmetic, but the asset and the app version must agree
  before the next release. Tracked here; the asset itself is updated in a code slice, not in
  this documentation pass.

## Out of scope (recorded, not forgotten)

Two-sided cofounder or investor matching, licensed course content, enterprise integrations, and
autonomous external actions (sending email, moving money, incorporating companies) — see
`docs/competitive-benchmark.md` and `DECISIONS.md` D-008.

## Readiness

- **Workspace modules:** 100% of the modules listed in `docs/scope.md` are implemented and
  verified in CI.
- **Reporting and operations:** ~40% (report content built, Markdown and JSON export; no
  reporting-to-maintainers yet).
- **Accessibility:** code-level work done (focus traps, canvas keyboard navigation, skip-to-content, ARIA labels, reduced motion, visible focus, announced errors, 24×24 touch targets); human audit completed 2026-10-24 (see `docs/qc/manual-qc.md`); automated axe CI scan passing.
- **Overall to v1.0.0:** roughly 90%, with remaining items being performance tuning at scale,
  the human import round-trip check, and the owner-only GitHub security settings.
- **PWA:** installable with an offline app shell (`public/manifest.json`, `public/sw.js`).
