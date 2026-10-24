# Roadmap

Readiness percentages are updated **only from verified evidence** (green CI, merged code, and —
where the guide requires it — a human pass). A capability listed as Done has code behind it and
tests behind the code.

Current stage: **pre-v0.1.0**. Everything below the v0.1.0 gate is the release blocker list.

## v0.1.0 — first functional test build (release gate)

| Requirement | Status | Evidence |
| --- | --- | --- |
| Runnable build for the primary platform | Ready | `bun run build:static` + `deploy.yml` publish to GitHub Pages; CI `build (static)` green |
| One real workflow with real persistence | Done | Evidence ledger with guarded promotion; Dexie persistence |
| App identity, theme, window title | Done | `OpenFounder`, light/dark theme |
| Crash / error boundary | **To do** | `ErrorBoundary` exists but cannot report a bug |
| Update check | **To do** | not implemented |
| CI green (format/type check, tests, build) | Done | `.github/workflows/ci.yml`, `.ci-required.txt` |
| README with build and run instructions | Done | `README.md` |
| CHANGELOG entry for 0.1.0 | **To do** | created when the tag is cut |
| Legal baseline (LICENSE, ATTRIBUTION, no secrets) | **To do** | dual licence not yet in place |
| GitHub Release `v0.1.0` published | **To do** | needs `release.yml` first |

## v0.2.0 — reporting and polish

| Capability | Status |
| --- | --- |
| Crash / bug reporting that files a GitHub issue from the app | Planned |
| Update check against GitHub Releases, failing soft offline | Planned |
| Export the validation report as JSON | Planned |
| Accessibility: human keyboard and screen-reader pass (R-030) | Planned |
| Import round trip exercised end-to-end by a human | Planned |

## v1.0.0 — capability completeness

| Capability | Status |
| --- | --- |
| Every in-scope capability in `docs/scope.md` implemented and verified | In progress |
| `docs/parity.md` has no Planned rows for v1 scope | In progress |
| Manual QC checklist executed and recorded | Not started |

## Out of scope (recorded, not forgotten)

Two-sided cofounder or investor matching, licensed course content, enterprise integrations, and
autonomous external actions (sending email, moving money, incorporating companies) — see
`docs/competitive-benchmark.md` and `DECISIONS.md` D-008.

## Readiness

- **Workspace modules:** ~95% of the modules listed in `docs/scope.md` are implemented and
  verified in CI.
- **Reporting and operations:** ~35% (report content built; no reporting-to-maintainers yet).
- **Accessibility:** code-level work done (focus traps, canvas keyboard navigation), no human
  audit yet.
- **Overall to v1.0.0:** roughly 70%, and deliberately not rounded up.
