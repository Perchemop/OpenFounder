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

## [1.0.0] — 2026-10-10

Baseline before this documentation and CI work: projects, phases, evidence ledger, risk register,
experiments, interviews, research, competitors, canvas, MVP planner, roadmap, business model,
GTM, landing-page studio, documents, and multi-provider AI co-founder with offline fallback.
