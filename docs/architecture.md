# Architecture

## Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| UI | React 19 + TypeScript, Vite 6 | Function components, pages under `src/pages` |
| Styling | Tailwind CSS 4 via `@tailwindcss/vite` | Utility classes, dark mode by class |
| Persistence | Dexie 4 (IndexedDB) | Three schema versions, per-project tables |
| Validation | Zod 4 | Export packages validated before import |
| AI | Provider interface + six implementations | Server Gemini, direct Gemini, OpenAI-compatible, Anthropic, Ollama, offline rules |
| Server | Express (optional) | `server.ts` serves the API and static build |
| Tests | Vitest 5 | Pure logic: validation, scoring, context builder, defaults, phases, IDs |
| CI | GitHub Actions | `.github/workflows/ci.yml` (verify + build), `deploy.yml` (Pages) |

## Runtime shape

```
index.html
└── src/main.tsx            ErrorBoundary + React root
    └── src/App.tsx         Layout shell only
        ├── ProjectProvider  src/context/ProjectContext.tsx
        │   ├── db           src/db/index.ts  (Dexie + settings + export/import)
        │   ├── seed demo    src/data/sampleProject.ts (explicit only)
        │   └── AI config    src/ai/*
        ├── Navbar / Sidebar / AICofounderPanel
        ├── page components  src/pages/*
        └── modals           New Project, Settings, Command Palette
```

## Data model

`src/types/index.ts` is the single source of truth for entities:

- `Project` — identity, problem, desired outcome, founder context, phase index
- `EvidenceItem` — claim, type, status, notes, source, confidence, next test
- `RiskItem` — category, probability, impact, mitigation, status, next test
- `Experiment`, `CustomerInterview`, `ResearchSource`, `Competitor`, `FeatureItem`, `RoadmapItem`
- `CanvasNode` / `CanvasEdge`, `BusinessModelData`, `GTMPlan`, `LandingPageSpec`
- `ProjectDecision`, `AIChatMessage`, `ExportPackage`

Every project-scoped row carries `projectId`. All mutation goes through the `db` object or a
page handler that writes to `db` and then calls the context refresh callback.

## Domain rules vs UI

Pure rules live outside React so they are testable and cannot be bypassed by presentation
code:

| Module | Responsibility |
| --- | --- |
| `src/utils/riskScoring.ts` | Score, hot/open classification, ordering |
| `src/utils/evidenceIntegrity.ts` | Whether a claim may move to a stronger evidence status |
| `src/db/validation.ts` | Export/import schema validation |
| `src/data/phases.ts` | Phase definitions and required-task rules |
| `src/ai/modelDefaults.ts` | Model presets and fallback-candidate construction |
| `src/ai/contextBuilder.ts` | Deterministic workspace → prompt serialisation |

Pages call these helpers; they do not re-implement the rules inline.

## AI provider contract

`src/ai/providerTypes.ts` defines `AIProvider.sendMessage(messages, config)`. Dispatch lives in
`providersDispatch.ts` and selects one implementation. Offline rules always remain available
and never perform network calls. Secrets are session-only unless the user opts into local
storage.

## Error handling

- `ErrorBoundary` wraps the app shell.
- Dexie operations are awaited; page handlers surface failures instead of silently succeeding.
- Import rejects packages that fail Zod validation.
- No telemetry. No panic-style `throw` in render paths.

## Build and hosting

- `bun run build:static` → `dist/` uploaded to GitHub Pages.
- `bun run build` → static assets plus `dist/server.cjs` for self-hosting.
- `base` is configurable with `VITE_BASE_PATH` so the app works from a project sub-path.
