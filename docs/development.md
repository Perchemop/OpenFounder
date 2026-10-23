# Development

## Golden rule

**No heavy build or test command runs on the local machine.** The workstation is
memory-constrained. All installs, builds, type checks, and test suites run in GitHub Actions
through the repository CI workflow.

Local is limited to: editing files, reading files and CI logs, `git status/diff/log/show`,
committing, pushing, and running the CI helper.

```bash
~/.config/opencode/scripts/ci.sh run "feat: what changed"
```

`ci.sh` commits the worktree to `opencode/ci`, pushes, opens or updates the pull request, and
waits for the required checks. The CI result is the only verification that counts.

## Commands (run in CI, documented for contributors)

```bash
bun install --frozen-lockfile
bun run lint        # tsc --noEmit
bun run test        # vitest run
bun run build:static
bun run build       # adds dist/server.cjs
bun run dev         # express + vite (local development, opt-in)
bun run dev:vite    # frontend only
```

## Branch and PR flow

1. Plan the slice (Chat/orchestrator), with acceptance criteria.
2. Implement the slice on `opencode/ci` via `ci.sh run`.
3. CI must be green; the PR stays open for human review.
4. Update `PROGRESS.md`, `REQUIREMENTS_TRACEABILITY.md`, `CHANGELOG.md`, and
   `docs/parity.md` in the same slice.
5. Human merges.

## Adding a feature

- Add or extend the pure rule in `src/utils` or `src/data` first, with Vitest coverage.
- Wire the page to the rule; do not duplicate logic in JSX.
- Update the entity type in `src/types/index.ts` and the Dexie schema only with a version bump.
- Add an entry to `REQUIREMENTS_TRACEABILITY.md`.
- Never add a control that does nothing.

## Environment

Copy `.env.example` to `.env` for server-side Gemini. Without a key the app remains fully
functional offline or with a user-provided key in Settings. Never commit `.env`.

## Manual QC

Run the checklist in `docs/qc/manual-qc.md` at the end of each major phase. Record the result
with a date in that file; unrecorded checks count as not done.
