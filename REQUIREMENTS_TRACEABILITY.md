# Requirements Traceability

Status values: **Done** = implemented and unit-tested, **Partial** = implemented with a known
gap, **Planned** = not implemented. "CI" reflects the first verification run of this baseline;
see `PROGRESS.md` for the current result.

| ID | Requirement | Implementation | Tests | Status |
| --- | --- | --- | --- | --- |
| R-001 | Create, select, and persist founder projects locally | `src/context/ProjectContext.tsx`, `src/components/modals/NewProjectModal.tsx`, `src/db/index.ts` | `src/db/validation.test.ts`, `src/db/generateId.test.ts` | Done |
| R-002 | Ten guided founder phases with required tasks | `src/data/phases.ts`, `src/pages/PhasesPage.tsx` | `src/data/phases.test.ts` | Done |
| R-003 | Claims carry an explicit evidence status and confidence | `src/pages/EvidencePage.tsx`, `src/types/index.ts` | — (no rule tests yet) | Done |
| R-004 | Claims record notes, source title/URL, and a next falsification test | `src/pages/EvidencePage.tsx` | — | Done |
| R-005 | A claim cannot be promoted to research/customer/experiment status without supporting evidence | `src/utils/evidenceIntegrity.ts`, `src/pages/EvidencePage.tsx` | `src/utils/evidenceIntegrity.test.ts` | Done |
| R-006 | Evidence integrity summary reports verified vs unsupported claims | `src/utils/evidenceIntegrity.ts`, `EvidencePage` | `src/utils/evidenceIntegrity.test.ts` | Done |
| R-007 | Risk register scores probability × impact and classifies hot risks | `src/utils/riskScoring.ts`, `src/pages/RisksPage.tsx` | `src/utils/riskScoring.test.ts` | Done |
| R-008 | Dashboard shows open/hot risks and the highest-value next action | `src/pages/DashboardPage.tsx` | `riskScoring.test.ts` (scoring only) | Partial |
| R-009 | Experiments define hypothesis, method, sample size, success and failure criteria | `src/pages/ValidationPage.tsx`, `src/types/index.ts` | — | Done |
| R-010 | Customer interviews capture pain, workarounds, willingness to pay, verbatim quotes | `src/pages/InterviewsPage.tsx` | — | Done |
| R-011 | Research sources capture type, category, findings, relevance, confidence | `src/pages/ResearchPage.tsx` | — | Done |
| R-012 | Competitor teardowns capture pricing, strengths, weaknesses, complaints | `src/pages/CompetitorsPage.tsx` | — | Done |
| R-013 | Canvas supports nodes and labelled edges | `src/pages/CanvasPage.tsx`, `db.canvasNodes`, `db.canvasEdges` | — | Done |
| R-014 | MoSCoW MVP planner with complexity and status | `src/pages/MVPPlannerPage.tsx` | — | Done |
| R-015 | Roadmap supports dependencies and ordering | `src/pages/RoadmapPage.tsx` | — | Done |
| R-016 | Lean Canvas and unit economics are stored per project | `src/pages/BusinessModelPage.tsx` | — | Done |
| R-017 | GTM channels and checklist are stored per project | `src/pages/GTMPage.tsx` | — | Done |
| R-018 | Landing-page copy studio stores a complete spec | `src/pages/LandingPageStudio.tsx` | — | Done |
| R-019 | Workspace exports as a versioned JSON package | `src/db/index.ts` (`exportPackage`), `DocumentsPage` | `src/db/validation.test.ts` | Done |
| R-020 | Import validates the package and remaps IDs safely | `src/db/index.ts` (`importPackage`), `src/db/validation.ts` | `validation.test.ts` | Done |
| R-033 | Workspace diagnostics report real referential integrity issues | `validateWorkspaceReferences`, `runWorkspaceDiagnostics` | `validation.test.ts` | Done |
| R-021 | AI co-founder supports six providers including offline rules | `src/ai/*` | `modelDefaults.test.ts`, `contextBuilder.test.ts` | Done |
| R-022 | AI context is a deterministic serialisation within a token budget | `src/ai/contextBuilder.ts` | `contextBuilder.test.ts` | Done |
| R-023 | Gemini model candidates include ordered fallbacks | `src/ai/modelDefaults.ts` | `modelDefaults.test.ts` | Done |
| R-024 | Command palette navigates pages and searches core entities | `src/components/modals/CommandPalette.tsx`, `src/utils/workspaceSearch.ts` | `workspaceSearch.test.ts` | Done |
| R-025 | No telemetry by default; keys session-only by default | `src/db/index.ts`, `src/types/index.ts`, `SettingsModal` | `validation.test.ts` (config defaults) | Done |
| R-026 | Static build deployable to GitHub Pages | `vite.config.ts`, `.github/workflows/deploy.yml` | CI build job | Done |
| R-044 | Semver tags publish a GitHub Release with notes and checksums | `.github/workflows/release.yml` | CHANGELOG extraction verified locally; release run not yet exercised | Partial |
| R-027 | Pull requests are verified by CI (lint, tests, build) | `.github/workflows/ci.yml` | CI itself | Done |
| R-028 | Project is MIT licensed with attribution | `LICENSE`, `ATTRIBUTION.md` | — | Done |
| R-029 | Command palette searches research, interviews, risks, roadmap | `src/utils/workspaceSearch.ts`, `CommandPalette` | `workspaceSearch.test.ts` | Done |
| R-030 | Accessibility audit and keyboard pass recorded | `docs/qc/manual-qc.md`, `src/hooks/useFocusTrap.ts`, `CanvasPage` | `focusTrap.test.ts`, `paletteNavigation.test.ts`, `spatialNavigation.test.ts` | Partial (code-review pass recorded; human pass outstanding) |
| R-031 | Dashboard surfaces the evidence integrity score | `DashboardPage`, `src/utils/evidenceIntegrity.ts` | `src/utils/evidenceIntegrity.test.ts` | Done |
| R-032 | One-page validation report export | `src/utils/validationReport.ts`, `DocumentsPage` | `validationReport.test.ts` | Done |

| R-034 | Objectives carry measurable key results with derived progress | `src/utils/okr.ts`, `GoalsPage` | `okr.test.ts` | Done |
| R-035 | Export and import cover objectives with schema version 4 | `src/db/index.ts`, `src/db/importRemap.ts` | `importRemap.test.ts` | Done |
| R-036 | Competitive benchmark records what is and is not emulated | `docs/competitive-benchmark.md`, D-008 | — | Done |

| R-037 | Advisor log records people, sessions, verbatim advice, and commitments | `src/utils/advisorLog.ts`, `AdvisorsPage` | `advisorLog.test.ts` | Done |
| R-038 | Export and import cover advisors with schema version 5 | `src/db/index.ts`, `src/db/importRemap.ts` | `importRemap.test.ts` | Done |

| R-039 | Team and skills coverage with derived gap analysis | `src/utils/skillCoverage.ts`, `TeamPage` | `skillCoverage.test.ts` | Done |
| R-040 | Export and import cover team and skills with schema version 6 | `src/db/index.ts`, `src/db/importRemap.ts` | `importRemap.test.ts` | Done |

| R-041 | All overlays trap focus, close on Escape, and restore focus | `src/hooks/useFocusTrap.ts`, CommandPalette, NewProjectModal, SettingsModal | `focusTrap.test.ts` | Done |
| R-042 | Command palette is fully keyboard navigable | `src/components/modals/CommandPalette.tsx`, `src/utils/paletteNavigation.ts` | `paletteNavigation.test.ts` | Done |

| R-043 | Canvas is keyboard navigable with spatial arrow movements | `src/pages/CanvasPage.tsx`, `src/utils/spatialNavigation.ts` | `spatialNavigation.test.ts` | Done |

| R-045 | In-app crash/bug reporting with a pre-send preview and no stored token | `src/bugReport.ts`, `BugReportModal`, `ErrorBoundary`, SettingsModal | `bugReport.test.ts` | Done |

| R-046 | Update check against GitHub Releases, failing soft | `src/updateCheck.ts`, `UpdateCheckPanel` | `updateCheck.test.ts` | Done |
