# OpenFounder

**Evidence-driven AI co-founder workspace for startup validation.**

OpenFounder helps founders move from idea → validated problem → tested solution by treating every claim as an assumption until proven otherwise. It combines structured workflows (phases, evidence ledger, experiments, interviews) with a multi-provider AI co-founder that refuses to invent sources or customer quotes.

---

## Core Philosophy

- **Challenge unsupported claims**
- Clearly separate: **evidence** · **inference** · **assumption** · **hypothesis** · **recommendation**
- Prefer small, falsifiable experiments over large speculative plans
- Never invent market stats, customer quotes, or sources

---

## Features

### Workspace Modules
- **Dashboard** – Project health at a glance
- **Phases** – Guided founder journey with required tasks
- **Evidence Ledger** – Claims with status (unverified → experiment_confirmed)
- **Risk Register** – Impact × probability scoring, mitigation & next tests
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
Multiple providers with graceful fallback:

| Provider              | Notes                                      |
|-----------------------|--------------------------------------------|
| Server Gemini         | Uses `GEMINI_API_KEY` (recommended for hosted) |
| Direct Gemini (BYOK)  | Browser → Google AI Studio                 |
| OpenAI-compatible     | OpenAI, Groq, Together, DeepSeek, LocalAI… |
| Anthropic Claude      | Direct browser API                         |
| Ollama                | Fully local / privacy-first                |
| Offline Rules         | 100% free, zero network, deterministic     |

Keyboard shortcuts:
- `⌘/Ctrl + J` → Toggle AI Co-founder panel
- `⌘/Ctrl + K` → Command palette

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS 4
- **Local Database**: Dexie (IndexedDB) with Zod schema validation
- **State**: React Context (`ProjectContext` + `useProject` hook)
- **Server**: Express + optional Gemini (for `/api/ai/*` routes)
- **Testing**: Vitest
- **Deploy**: Static build → GitHub Pages (server routes fall back gracefully)

---

## Quick Start

```bash
# Clone
git clone https://github.com/Perchemop/OpenFounder.git
cd OpenFounder

# Install
npm install          # or bun install

# Development (full stack – recommended)
npm run dev

# Frontend only
npm run dev:vite

# Typecheck
npm run lint

# Tests
npm test

# Production static build
npm run build:static
```

### Environment

Copy `.env.example` → `.env`:

```env
GEMINI_API_KEY=your_key_here   # optional – enables server-side AI
```

Without a server key the app still works fully offline or with user-provided keys (Settings → AI Providers).

---

## Architecture Highlights

### State Management (`src/context/ProjectContext.tsx`)
- Centralized project, entity, AI, theme, and modal state
- `useProject()` hook for clean consumption anywhere in the tree
- Derived values (evidence counts, open risks, AI context string) memoized

### Data Layer (`src/db/`)
- Dexie tables for every entity
- Zod schemas with safe ID/URL validation
- Referential integrity checks on import
- Full project export/import with ID remapping
- Session-only or localStorage API key storage (user choice)

### AI System (`src/ai/`)
- Provider abstraction (`AIProvider` interface)
- Context builder that respects token budgets
- Strong system prompt that enforces evidence discipline
- Automatic model fallback on 429 / 503

### Offline-First
Everything lives in the browser’s IndexedDB. Export a JSON package any time for backup or sharing.

---

## Development Notes

- Core application state lives in `ProjectContext` (see `src/context/ProjectContext.tsx`).
- `App.tsx` is a thin layout shell that consumes the context.
- Server AI routes are only available when running `npm run dev` or a Node host.
- Static GitHub Pages deploy deliberately uses `build:static` so the app remains usable without a backend.
- An `ErrorBoundary` wraps the root to keep the UI resilient.

---

## Roadmap / Known Gaps

- [x] Extract ProjectContext + custom hooks from App.tsx
- [x] Error Boundary + better loading/error states
- [x] Surface Risks more prominently in UI
- [ ] Expand test coverage beyond validation
- [ ] Accessibility audit
- [ ] Configurable model lists

---

## License

Private / All rights reserved (update as needed).

---

Built for founders who prefer evidence over optimism.
