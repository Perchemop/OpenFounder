# Decisions

Format: ID · date · decision · rationale · alternatives rejected. Decisions are append-only;
superseding entries say so.

## D-001 · 2026-10-23 · Adopt the updated guide.md operating model

Use Chat (plan) → Task (execute) → Pull Request (review) with GitHub Actions as the only Task
Runner. No heavy builds locally; free-model tiers in the order OpenCode free → NVIDIA free.

*Why:* the local machine is resource-constrained and previous sessions froze under build load.
*Rejected:* local builds for "quick checks"; paid model tiers; local model hosting.

## D-002 · 2026-10-23 · Keep React + Vite + Dexie as the stack

The application already implements a broad workspace in this stack, with 12k lines of tested
logic. Rewriting in Rust/egui (the guide's generic default) would discard working functionality.

*Why:* the guide's stack recommendation is a default for new projects, not a mandate.
*Rejected:* a Rust rewrite; a full framework migration.

## D-003 · 2026-10-23 · Licence the project under MIT

`LICENSE` is MIT, `ATTRIBUTION.md` lists third-party licences. The README's former
"Private / All rights reserved" line contradicted the open-source mission.

*Why:* simplest permissive licence, compatible with all current dependencies.
*Rejected:* dual MIT OR Apache-2.0 (can be revisited — see open question 1); GPL (more friction
for a tool founders may embed).

## D-004 · 2026-10-23 · Bun is the canonical package manager in CI

The repository ships `bun.lock` but no `package-lock.json`; the old Pages workflow used
`npm ci`, which fails without a lockfile. CI now installs with Bun and a frozen lockfile.

*Why:* makes CI deterministic and matches the committed lockfile.
*Rejected:* generating and maintaining a second npm lockfile.

## D-005 · 2026-10-23 · Evidence promotion is a hard block, not a warning

Promotion to `research_backed`, `customer_confirmed`, or `experiment_confirmed` requires the
evidence that status claims. The UI blocks the change and names what is missing.

*Why:* the product's core promise is that unsupported claims stay visibly unsupported.
*Rejected:* a dismissible warning (too easy to ignore); silent promotion (status becomes
decoration). An "override with written reason" flow is a candidate follow-up (open question 5).

## D-006 · 2026-10-23 · Domain rules live in pure modules

`riskScoring`, `evidenceIntegrity`, `validation`, `phases`, `modelDefaults`, and `contextBuilder`
are framework-free and unit-tested; pages only render and call them.

*Why:* rules must be testable in CI without a browser and impossible to bypass in one page only.
*Rejected:* inline rules in components.

## D-007 · 2026-10-23 · Multi-OS CI, with required checks declared

`verify` runs lint + tests on Ubuntu, macOS, and Windows; `build` runs the static build on
Ubuntu. `.ci-required.txt` names the authoritative checks so a secret-dependent workflow cannot
mask a failure.

*Why:* catch platform-specific path and test issues early; make the verdict unambiguous.
*Rejected:* Ubuntu-only verification (misses Windows path bugs); no required-check list.

## D-008 · 2026-10-23 · Emulate capability classes, not whole products

The request to "emulate" cofounder.co, CoFoundersLab, MentorShow, Eightfold AI, and Cascade is
interpreted as: adopt the capabilities that fit a local-first founder workspace, and record the
rest as out of scope. `docs/competitive-benchmark.md` maps every capability with its source.

In scope (in order): goals/key results and a scorecard (Cascade); advisor and mentor log
(CoFoundersLab); team skills coverage (CoFoundersLab/Eightfold, local only); first-hire pipeline
(Eightfold, local only).

Out of scope, permanently or until a backend exists: two-sided cofounder/investor matching,
licensed masterclass content (MentorShow is a personal-development product, not a startup
mentor network), an enterprise skills graph or ATS, autonomous agents that send email, move
money, or incorporate a company, and enterprise OAuth integrations.

*Why:* marketplaces need network effects and moderation; content is licensed; autonomous external
actions need credentials, spend controls, and liability decisions. Simulating any of them would
violate the "no fake functionality" rule.
*Rejected:* copying product surfaces we cannot make real; claiming parity we have not verified.

## D-009 · 2026-10-24 · Dual licence MIT OR Apache-2.0

MIT is retained and Apache-2.0 is added, so the project is dual licensed at the user's option.

*Why:* the build guide prefers MIT OR Apache-2.0; Apache-2.0 adds an explicit patent grant, which
matters for a tool founders may embed, and MIT keeps integration friction low for permissive
stacks. This also closes open question 1 in `docs/assumptions-and-questions.md`.
*Rejected:* MIT alone (no express patent grant); GPL (incompatible with permissive embedding).
