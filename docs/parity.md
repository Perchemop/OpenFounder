# Capability Parity

Parity here means "the capability exists and is wired to real data", not visual similarity to
any product. Status values: **Done** (implemented, test or CI covered), **Partial** (works but
has a known gap), **Planned**.

| ID | Capability | Status | Where |
| --- | --- | --- | --- |
| C-01 | Create and switch founder projects | Done | `NewProjectModal`, `Navbar`, `ProjectContext` |
| C-02 | Guided phases with required tasks | Done | `PhasesPage`, `src/data/phases.ts` |
| C-03 | Evidence ledger with statuses and sources | Done | `EvidencePage`, `db.evidence` |
| C-04 | Evidence promotion guardrails | Done | `src/utils/evidenceIntegrity.ts` — enforced in `EvidencePage`, scored on `DashboardPage` |
| C-05 | Risk register with probability × impact | Done | `RisksPage`, `riskScoring.ts`, `DashboardPage` |
| C-06 | Experiments with success/failure criteria | Done | `ValidationPage` |
| C-07 | Customer interview log with verbatim quotes | Done | `InterviewsPage` |
| C-08 | Research source register | Done | `ResearchPage` |
| C-09 | Competitor teardowns | Done | `CompetitorsPage` |
| C-10 | Relationship canvas | Done | `CanvasPage` |
| C-11 | MoSCoW MVP planner | Done | `MVPPlannerPage` |
| C-12 | Dependency-aware roadmap | Done | `RoadmapPage` |
| C-13 | Lean Canvas + unit economics | Done | `BusinessModelPage` |
| C-14 | GTM channels and checklist | Done | `GTMPage` |
| C-15 | Landing-page copy studio | Done | `LandingPageStudio` |
| C-16 | Export package / documents | Done | `DocumentsPage`, `db.exportPackage` |
| C-17 | JSON import with schema validation | Done | `db.importPackage`, `validation.ts` |
| C-18 | AI co-founder with provider fallback | Done | `src/ai/*` |
| C-19 | Offline deterministic guidance | Done | `providersOffline.ts` |
| C-20 | Keyboard command palette | Done | `CommandPalette` |
| C-21 | Accessibility audit | Done | `ACCESSIBILITY.md`; reduced motion, `:focus-visible`, `role="alert"` errors, 24×24 targets; human keyboard + screen-reader pass recorded 2026-10-25 in `docs/qc/manual-qc.md`; automated axe scan in `.github/workflows/a11y.yml` |
| C-24 | Objectives and key results with derived progress | Done | `GoalsPage`, `src/utils/okr.ts` |
| C-27 | One-page validation report with provenance | Done | `src/utils/validationReport.ts` |
| C-25 | Advisor and mentor log with commitments | Done | `AdvisorsPage`, `src/utils/advisorLog.ts` |
| C-26 | Team skills coverage with gaps | Done | `TeamPage`, `src/utils/skillCoverage.ts` |
| C-28 | Bug / crash reporting from inside the app | Done | `src/bugReport.ts`, `BugReportModal` |
| C-29 | Update check against releases | Done | `src/updateCheck.ts`, `UpdateCheckPanel` |
| C-22 | Full-text workspace search | Done | `src/utils/workspaceSearch.ts`, `CommandPalette` |
| C-23 | Cloud sync / multi-device | Planned (out of scope v1) | — |

## Known gaps recorded honestly

- No pixel-baseline visual regression: `visual.yml` uploads screenshots as artefacts for review
  instead of failing on font-metric drift.
- Cloud sync / multi-device (C-23) is deliberately out of scope for v1; the app is local-first.
- Performance: dense tables render a bounded window with an explicit "Show more" (D-012). No
  runtime profiling is run on the development machine — builds and tests run in GitHub Actions by
  policy — so the guarantee is bounded render work plus unit-tested paging, not a published
  benchmark.
- The optional Express server is not deployed by the static GitHub Pages workflow, so `/api/ai/*`
  falls back to browser providers or offline rules when hosted statically.
