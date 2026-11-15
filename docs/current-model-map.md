# Current Model Map

Discovered at session start (re-checked 2026-10-26) via the OpenCode model catalogue. Tier order
is fixed by `guide.md` §5: **OpenCode free → NVIDIA free → paid keys last resort**. No paid
provider is used, and no local model hosting (Ollama) is used for agent work even though the app
itself supports Ollama for users.

## Guide synchronization — 2026-11-15

Per guide §12.3 and the standing rule to read every section of the guide in full, this session
read the guide completely and synchronized the ruleset.

| Field | Value |
| --- | --- |
| Guide sources | `~/guide.md` (4,127 bytes, modified 2026-11-15 17:54) + `~/guide.md_appendix.txt` (36,285 bytes, merged addendum; `~/addendum.md.archive` retained) |
| Guide content | §19 Claude Code / Codex Skills (top-10 catalog + integration patterns) and the closing **hard rule on dead code**; the appendix carries client mode (A–B), implementation procedure (C), MCP setup (D), task/release templates (E–F), failure playbook (G), quality bar (H), agent constraints (J), Rust QA (K incl. K.14 non-Rust translation), demolition findings (M.1–M.8), process feedback (N), priority card (O), canonical session prompt (L). Parts I–II and Section 12 are carried in the agent ruleset (`~/.config/opencode/AGENTS.md`, synced 2026-11-15). |
| Guide never committed | Confirmed — `guide.md`, `guide.md_appendix.txt`, `addendum.md.archive` stay local; nothing from them is pushed. |
| Ruleset sync | Global ruleset appended guide §19 (skills) and §20 (dead-code prohibition) verbatim; repository `AGENTS.md` gains the dead-code prohibition and skills discipline. |

### Sections read in full this session

- `~/guide.md` — complete (all 30 lines): §19 skills catalog, remaining-skills note, skill
  integration patterns, and the dead-code hard rule.
- `~/guide.md_appendix.txt` — complete: A (role model), B (client playbook), C (implementation
  procedure), D (MCP setup), E (task brief template), F (release notes template), G (failure
  playbook), H (quality bar), J (final constraints), K (Rust autonomous QA incl. K.14 non-Rust
  translation), M (demolition findings M.1–M.8), N (process feedback), O (priority card),
  L (canonical session prompt).

### New obligations adopted from this guide revision

1. **Dead-code prohibition** — no agent fixes an issue by creating new code or leaving behind
   dead code; every write is planned, integrated, tested for integration, free of leftover
   stubs/fallbacks, and verified end-to-end before merge. Adopted into the repository `AGENTS.md`
   and the global ruleset.
2. **Skills discipline (§19)** — skills follow role routing; no skill requiring `cargo` or heavy
   local builds; no skill conflicting with clean-room rules; installed skills documented in
   `DECISIONS.md`.


## Live free catalogue at discovery time

OpenCode free (7 IDs; `big-pickle` is free but not named `-free`):

- `opencode/big-pickle`
- `opencode/flint-40b-free`
- `opencode/nemotron-3.5-super-vl-free` (vision)
- `opencode/beam-free`
- `opencode/mimo-v2.6-flash-free`
- `opencode/deepseek-v4.1-flash-free`
- `opencode/glm-5.3-flash-free`

NVIDIA free (12 IDs):

- `nvidia/z-ai/glm-5.3`, `nvidia/z-ai/glm-5.3-flash`
- `nvidia/deepseek-ai/deepseek-v4.1-flash`
- `nvidia/stepfun-ai/step-5-preview`
- `nvidia/minimaxai/minimax-m3.1-flash`
- `nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b` (vision)
- `nvidia/openai/gpt-oss-20b`
- `nvidia/meta/muse-glimmer-30b`
- `nvidia/poolside/laguna-xs-2.1`
- `nvidia/google/diffusiongemma-26b-a4b-it`
- `nvidia/meta/llama-guard-4-12b`, `nvidia/google/google-paligemma` (guard/vision models, not for coding)

## Role assignment

| Role | Primary | Fallbacks | Why |
| --- | --- | --- | --- |
| Orchestrator / planner | `opencode/big-pickle` | `nvidia/stepfun-ai/step-5-preview`, `nvidia/z-ai/glm-5.3-flash` | Strongest reasoning + tool calling available in this session |
| Coder | `opencode/big-pickle` | `nvidia/z-ai/glm-5.3-flash`, `nvidia/deepseek-ai/deepseek-v4.1-flash` | Multi-file edits, TypeScript |
| Fixer | `opencode/big-pickle` | `nvidia/z-ai/glm-5.3-flash`, `nvidia/openai/gpt-oss-20b` | Reads CI logs, applies small diffs |
| Domain dev | `opencode/deepseek-v4.1-flash-free` | `nvidia/z-ai/glm-5.3-flash` | Pure logic + tests |
| UI dev | `opencode/glm-5.3-flash-free` | `nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b` | UI edits; vision fallback for screenshots |
| Explorer | `opencode/mimo-v2.6-flash-free` | `nvidia/openai/gpt-oss-20b` | Fast read-only search |
| Reviewer | `opencode/glm-5.3-flash-free` | `nvidia/z-ai/glm-5.3-flash` | Cheap, solid read-only review |
| Test writer | `opencode/deepseek-v4.1-flash-free` | `nvidia/z-ai/glm-5.3-flash` | Vitest specs |
| Docs writer | `opencode/beam-free` | `nvidia/openai/gpt-oss-20b` | Tracking files |
| CI runner | `opencode/glm-5.3-flash-free` | `nvidia/openai/gpt-oss-20b` | Interprets workflow output |
| Designer / visual review | `opencode/nemotron-3.5-super-vl-free` | `nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b` | Vision-capable for screenshot artefacts |

Routing lives in `~/.config/opencode/failover.json` (`fallbacksByAgent`). This table is a record,
not a hard-coded dependency: when a model disappears, re-discover and update both files.

## Research method used for documentation

Public competitive research and name-conflict checks are recorded in `docs/research/` with summaries
and original URLs only (per guide §2.4). Web search is performed via the agent's websearch tool and
results are summarised in prose; URLs are retained for verification but no content is copied.
Human approval is required before research findings are used to justify feature work
(`docs/research/README.md`).
