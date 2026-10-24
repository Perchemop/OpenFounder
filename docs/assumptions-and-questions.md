# Facts, Assumptions, Questions

## Facts (verifiable in this repository)

- The app is React 19 + TypeScript + Vite, persisted in IndexedDB via Dexie.
- Tests run with Vitest and cover validation, risk scoring, model defaults, context building,
  phase definitions, and ID generation.
- The AI layer supports six providers, including a fully offline rule-based mode.
- Export/import uses a versioned `ExportPackage` validated with Zod.
- Demo data is synthetic and labelled (`isSynthetic`), and only loads on explicit request.
- The repository had no CI workflow for pull requests when this baseline was written; the only
  workflow deployed to Pages and failed at `npm ci` because the repository ships `bun.lock`.

## Assumptions (need confirmation)

| # | Assumption | Risk if wrong |
| --- | --- | --- |
| A-1 | The product should be MIT licensed and fully open source | Ownership/legal expectations differ |
| A-2 | Browser-only storage is acceptable for v1; no accounts or sync | Users expect multi-device continuity |
| A-3 | GitHub Pages is the canonical public deployment | A different host is expected |
| A-4 | BYOK AI is acceptable; no hosted keys are shipped | Users expect a turnkey AI without keys |
| A-5 | The ten-phase journey reflects the intended founder workflow | Workflow needs redesign |
| A-6 | English-only UI is acceptable for v1 | Localisation required |

## Open questions

1. **Resolved 2026-10-24 (D-009):** dual licensed MIT OR Apache-2.0.
2. Is a hosted AI proxy with a free quota ever in scope, or is BYOK permanent?
3. Which accessibility standard is the target (WCAG 2.2 AA appears reasonable)?
4. Is cloud sync still out of scope after v1, or should the data layer prepare for it now?
5. Should evidence promotion be a hard block or a warning the founder can override with a reason?

## Decision rule

Assumptions never become requirements silently. When an assumption is confirmed or rejected,
move it into `DECISIONS.md` with a date, and update `docs/scope.md`.
