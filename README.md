# OpenFounder

**Evidence-driven AI co-founder workspace for startup validation.**

OpenFounder helps founders move from idea → validated problem → tested solution by treating every claim as an assumption until proven otherwise. It combines structured workflows (phases, evidence ledger, experiments, interviews, risk register) with a multi-provider AI co-founder that refuses to invent sources or customer quotes.

---

## Core Philosophy

- **Challenge unsupported claims**
- Clearly separate: **evidence** · **inference** · **assumption** · **hypothesis** · **recommendation**
- Prefer small, falsifiable experiments over large speculative plans
- Never invent market stats, customer quotes, or sources

---

## Features

### Workspace Modules
- **Dashboard** – Project health, risk snapshot (open / hot / mitigated), and highest-value next action
- **Phases** – Guided 10-phase founder journey with required tasks
- **Evidence Ledger** – Claims with status (unverified → experiment_confirmed)
- **Risk Register** – Impact × probability scoring, filters, mitigation & next tests
- **Research** – Structured source logging
- **Competitors** – Teardowns with strengths/weaknesses/complaints
- **Validation / Experiments** – Hypothesis → method → success/failure criteria
- **Customer Interviews** – Mom-Test style logging + verbatim quotes
- **Canvas** – Visual relationship mapping
- **MVP Planner** – MoSCoW prioritization
- **Roadmap** – Dependency-aware planning
- **Business Model** – Lean Canvas + unit economics
- **GTM** – Channel mapping & checklist
- **Landing Page Studio** – Smoke-test copy generation
- **Documents** – Exportable packages

### AI Co-Founder
Multiple providers with configurable models and graceful fallback:

| Provider | Notes |
|----------|--------|
| Server Gemini | Uses `GEMINI_API_KEY` (recommended for hosted) |
| Direct Gemini (BYOK) | Browser → Google; primary + ordered fallback models on 429/503 |
| OpenAI-compatible | OpenAI, Groq, Together, DeepSeek, LocalAI… |
| Anthropic Claude | Direct browser API |
| Ollama | Fully local / privacy-first |
| Offline Rules | 100% free, zero network, deterministic heuristics |

**Settings → AI Providers** lets you pick provider, model presets (or custom IDs), Gemini fallback list, temperature, and max tokens. Keys can stay session-only or persist in localStorage.

Keyboard shortcuts:
- `⌘/Ctrl + J` → Toggle AI Co-founder panel
- `⌘/Ctrl + K` → Command palette

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Local Database**: Dexie (IndexedDB) with Zod schema validation
- **State**: React Context (`ProjectContext` + `useProject` hook)
- **Server**: Express + optional Gemini (for `/api/ai/*` routes)
- **Testing**: Vitest (validation, risk scoring, model defaults, context builder, phases, IDs)
- **Deploy**: Static build → GitHub Pages (server routes fall back gracefully)

---

## Quick Start

```bash
git clone https://github.com/Perchemop/OpenFounder.git
cd OpenFounder

npm install          # or bun install

# Full stack (Express + Vite) – recommended
npm run dev

# Frontend only
npm run dev:vite

npm run lint         # tsc --noEmit
npm test             # vitest run
npm run build:static # production static assets
```

### Environment

Copy `.env.example` → `.env`:

```env
GEMINI_API_KEY=your_key_here   # optional – enables server-side AI
```

Without a server key the app still works fully offline or with user-provided keys (Settings → AI Providers).

---

## How the App Works

### 1. Boot & local data
1. `main.tsx` mounts React inside an `ErrorBoundary`.
2. `ProjectProvider` loads settings from `localStorage`, opens Dexie (`OpenFounderDB`), and optionally activates an existing project (never auto-seeds synthetic data without consent).
3. Entity tables (evidence, risks, experiments, …) load for the active project ID.

### 2. Layout shell
`App.tsx` is a thin shell:
- **Navbar** – project switcher, theme, settings, AI toggle
- **Sidebar** – workspace tabs with badges (unverified evidence, active experiments, open risks)
- **Main** – active page component
- **AICofounderPanel** – slide-over chat
- Modals: New Project, Settings, Command Palette

### 3. Validation workflow (intended path)
1. **New Project** – capture problem, user, constraints, starting point → stored in IndexedDB.
2. **Phases** – work through 10 founder phases; complete tasks and advance phase index.
3. **Evidence** – log claims; status starts as assumption/unverified; promote only with real signals.
4. **Risks** – score impact × probability (1–9); track mitigation and next tests. Dashboard prioritizes “hot” open risks (score ≥ 4).
5. **Research / Competitors / Interviews** – structured inputs that feed the AI context string.
6. **Experiments** – falsifiable tests with success/failure criteria; results feed evidence.
7. **MVP / Roadmap / GTM / Business / Landing** – plan only after riskiest assumptions are under test.

### 4. AI co-founder
1. `buildProjectContext()` serializes workspace data (within token budget).
2. User message + context + strong system prompt go to the active `AIProvider`.
3. Providers: Server/Direct Gemini (with model candidate fallback), OpenAI-compatible, Anthropic, Ollama, or Offline Rules.
4. Offline mode returns deterministic guidance from local counts (no network).

### 5. Privacy & backup
- All project data lives in **browser IndexedDB**.
- Export/import full JSON packages from Settings → Data.
- API keys: session-only by default, or opt-in localStorage.

### 6. Hosting modes
| Mode | Command | AI |
|------|---------|-----|
| Full stack | `npm run dev` | Server Gemini if `GEMINI_API_KEY` set; else BYOK / offline |
| Static (GitHub Pages) | `npm run build:static` | Direct Gemini / OpenAI / Anthropic / Ollama / Offline only |

---

## Architecture Highlights

### State (`src/context/ProjectContext.tsx`)
Centralized project, entities, AI config, theme, modals. Derived: evidence counts, open risks, AI context string.

### Data (`src/db/`)
Dexie tables, Zod validation, export/import with optional ID remapping, settings persistence.

### AI (`src/ai/`)
- `providerTypes` – interface + system prompt
- `providersGemini` / `OpenAI` / `Anthropic` / `Ollama` / `Offline`
- `modelDefaults` – presets, `buildGeminiModelCandidates`, parse/format fallbacks
- `contextBuilder` – workspace → prompt text

### Risks (`src/utils/riskScoring.ts` + `RisksPage` + Dashboard snapshot)
Pure scoring helpers; full CRUD register; dashboard strip for open/hot risks.

---

## Tests

```bash
npm test
```

Coverage includes:
- Zod / export validation
- Risk scoring (`riskScore`, hot/open, sort)
- Model defaults (`buildGeminiModelCandidates`, parse/format fallbacks)
- `buildProjectContext`
- `FOUNDER_PHASES` structure
- `generateId` uniqueness & format

---

## Roadmap

- [x] ProjectContext extraction
- [x] Error Boundary
- [x] Risk Register UI + Dashboard snapshot
- [x] Expanded unit tests
- [x] Configurable model lists, temperature, max tokens
- [ ] Accessibility audit
- [ ] Optional cloud sync (still local-first)

---

## License

Private / All rights reserved (update as needed).

---

Built for founders who prefer evidence over optimism.
