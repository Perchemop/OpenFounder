# Scope

## In scope — first major version

| Area | Capability |
| --- | --- |
| Projects | Create, select, update, delete a founder workspace; stage tracking |
| Phases | Ten guided founder phases with tasks, completion criteria, and phase history |
| Evidence ledger | Claims with six evidence statuses, confidence, notes, source, next test |
| Evidence integrity | Block unsupported promotion to research/customer/experiment status (see R-021) |
| Risk register | Category, probability × impact score, mitigation, next test, status |
| Experiments | Hypothesis, method, sample size, success/failure criteria, results |
| Interviews | Mom-Test style interview log, pain points, verbatim quotes, willingness to pay |
| Research | Structured sources with type, category, findings, relevance, confidence |
| Competitors | Teardowns with pricing, strengths, weaknesses, complaints, differentiation |
| Planning | Canvas, MoSCoW MVP planner, dependency-aware roadmap |
| Business | Lean Canvas + unit economics, GTM channels/checklist, landing-page copy studio |
| Documents | Exportable project package (Markdown / JSON) |
| AI co-founder | Server Gemini, direct Gemini, OpenAI-compatible, Anthropic, Ollama, offline rules |
| Data control | Local IndexedDB storage, JSON export/import with validation, no telemetry by default |
| Platform | Static web build (GitHub Pages) and optional Node server |

## Out of scope — first major version

- Multi-user collaboration, real-time sync, comments and permissions
- Hosted accounts, billing, or a managed cloud database
- Native mobile apps (mobile web only)
- Automatic web scraping or market-data ingestion
- Proprietary datasets, licensed competitor intelligence, reverse-engineered internals
- Autonomous background agents that act without a human trigger
- Analytics/telemetry beyond explicit opt-in (currently none)

## Constraints

- All heavy verification runs in GitHub Actions; the local machine only edits and reviews.
- Public repository, permissive dependencies, no secrets in the tree.
- Every visible control must work or be explicitly disabled with an explanation.
- No fabricated data: synthetic demo data is labelled `isSynthetic` and only loads on request.
