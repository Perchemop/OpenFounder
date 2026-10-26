# Current Model Map

Discovered at session start (re-checked 2026-10-26) via the OpenCode model catalogue. Tier order
is fixed by `guide.md` §5: **OpenCode free → NVIDIA free → paid keys last resort**. No paid
provider is used, and no local model hosting (Ollama) is used for agent work even though the app
itself supports Ollama for users.

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
