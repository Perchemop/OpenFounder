# AGENTS.md

Guidance for AI coding agents working on **OpenFounder**.

This repository is built under the local build guide (`guide.md` — kept outside
the repo and never committed). Read the repository's own records first:
`ROADMAP.md`, `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`,
`REQUIREMENTS_TRACEABILITY.md`, `DECISIONS.md`, `CHANGELOG.md`, `README.md`.

- **Heavy work runs in GitHub Actions only.** Never run a build, test, lint or
  any `cargo` command on this machine — not even `cargo fmt`. Verify with
  `~/.config/opencode/scripts/ci.sh run "<description>"`.
- **Git actions are authored as** `"<App Name> Dev" <dev@example.com>`.
- Suggested subagents live in `.opencode/agents/`; the `orchestrator` plans and
  delegates, and never edits code itself.

## Completion mandate (mandatory)

Every agent in this repository works **each slice and each step through to
overall completion of the application**, not to a convenient stopping point.

- The queue is the repository's own records: `ROADMAP.md`,
  `IMPLEMENTATION_PLAN.md`, `PROGRESS.md`, `REQUIREMENTS_TRACEABILITY.md`. If an
  in-scope item is unfinished, the work is unfinished.
- Do not pause between slices to ask whether to continue. Continue.
- Never present a summary as though the work were finished while items remain.
- The application is complete only when the quality gates pass (guide Part I §9,
  the §2.5 per-release legal checklist, and CI green on the default branch).

## Release currency — latest release must be up to date with `main`

Before declaring a session complete (or leaving work awaiting user
verification), confirm that the latest GitHub Release is current with `main`.
A release is **not** current if `main` contains commits not reachable from the
release tag:

```bash
git merge-base --is-ancestor <latest-tag> origin/main && echo green
# or
git log --oneline <latest-tag>..origin/main | head
```

- If `main` has unreleased commits, either cut a new release tag and publish
  installable artefacts (per the installable-builds directive) **or** record
  the pending work explicitly in `PROGRESS.md` / `ROADMAP.md` so the next
  session knows what still needs releasing.
- Never leave `main` ahead of the latest release without either publishing a
  release or documenting the gap.

## Questions and user input — always via the question tool

If you need a decision, clarification, or input from the owner, **present it
with the `question` tool**. Never bury a question in prose, never assume an
answer, and never stall silently.

Ask only when genuinely blocked (an unconfirmed destructive action, two
readings of the requirement that imply different implementations, or a fact
that exists nowhere in the repo or the docs). Offer concrete options with a
recommendation first, then act on the answer and carry on.
