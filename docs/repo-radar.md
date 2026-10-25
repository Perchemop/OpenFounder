# Repository radar

Periodic build-vs-adopt pass over public GitHub projects (guide.md §4A). One
section per pass; verdicts are `adopt`, `pilot`, `watch` or `reject`, and a
rejected candidate is not re-proposed unless its reason has changed.

## 2026-10-25 — first pass

Scope: local persistence, end-to-end and accessibility testing, editor
capability, and the build/lint/test toolchain.

Already covered in this repository (no action, do not re-propose): Dexie for
local data, Vitest for unit tests, Playwright with `@axe-core/playwright` for
the end-to-end and accessibility gate, gitleaks and SBOM workflows.

| Candidate | Verdict | Reason |
| --- | --- | --- |
| `biomejs/biome` | **watch** | There is no ESLint/Prettier stack today, so this would be an addition rather than a replacement. Adopt when formatting drift shows up as review noise. |
| `ueberdosis/tiptap` | **reject** | The app does not need a rich-text editor; a structured form is the right model for this data. |
| `loro-dev/loro` / `automerge/automerge` | **reject (for now)** | Local-first is already served by Dexie; collaborative editing is not a requirement, and CRDTs would add a second consistency model. |

Re-check date for the radar as a whole: 2027-01-25.
