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

## D-010 · 2026-10-24 · Governance: single maintainer with liberal contribution, tiebreaker recorded

Project uses a single maintainer model with liberal contribution principles moving toward
merit-based maintainers. Direction is set by VISION.md and scope.md; day-to-day decisions are by
consensus seeking where possible, with the maintainer as tiebreaker and recorder of reasons in
DECISIONS.md. This is described in GOVERNANCE.md.

*Why:* matches current team size and the guide's recommendation to record governance explicitly;
prevents implicit power and makes growth paths clear.
*Rejected:* BDFL with no written process; pure meritocracy with formal voting without recorded
rationale.

## D-011 · 2026-10-24 · DCO is welcome but not required

Signed-off-by is encouraged for contributors who want it, but the project does not require DCO
signatures. Inbound = outbound licensing is enforced by the CONTRIBUTING.md terms.

*Why:* lowers friction for first-time contributors while keeping the licence clean. No CLA is used.
*Rejected:* mandatory DCO for every commit; requiring a CLA.

## D-012 · 2026-10-26 · Bounded rendering instead of a virtual-scroll dependency

Dense tables (Evidence ledger, Risk register) render a window of 25 rows by default with an
explicit "Show more" control, driven by a pure, unit-tested helper (`src/utils/pagination.ts`).
The row count shown to the user is always stated ("Showing 25 of 500 claims · 475 hidden"), so a
truncated view is never mistaken for the whole list.

*Why:* a founder workspace can accumulate hundreds of claims per project; the fix is to keep
rendered work proportional to what is on screen without adding a windowing library. The helper is
pure and testable in Vitest, which runs in CI, so the behaviour is verifiable without profiling on
the development machine (heavy work runs in GitHub Actions by policy).
*Rejected:* adding `react-window`/`virtua` (new dependency, CSS/measurement complexity for a table
whose height is not fixed); silently limiting rows without telling the user.

## D-013 · 2026-10-27 · Git identity applies to commits; PR authorship follows the pushing account

Guide §5.5 ("every commit, pull request, merge and tag is authored as `<App Name> Dev`
<dev@example.com>") is enforced where it is enforceable and recorded where it is not:

- **Enforced:** the commit object. `ci.sh` asserts the repository-local identity is
  `OpenFounder Dev <dev@example.com>` before committing and refuses a mismatch.
- **Not enforceable:** a pull request's author and the "merged by" line. GitHub derives both from
  the account whose credential pushed the branch, and offers no override. On this setup that is the
  owner's account (`Perchemop`), so a PR shows `Perchemop` regardless of the commit metadata.

Raised by guide §II.26.7, which asked for a decision. Chosen with the owner: option (a).
*Why:* a rule that no available mechanism can satisfy is worse than a narrower rule that holds;
this keeps the public claim true.
*Rejected:* (b) a machine account whose token performs the push — it would satisfy §5.5 end to end
but adds a push-capable credential to create, store, and rotate; (c) leaving the wording as written
and recording an exception, which keeps a public rule that is partly unmet.

## D-014 · 2026-10-27 · GitHub integration stays on the `gh` CLI; the GitHub MCP remains disabled

Addendum §D.1 lists the GitHub MCP in the minimum tool set. The global OpenCode config has it
present but disabled with a placeholder token, and the owner chose to leave it that way.

- Every GitHub action (pull requests, merges, workflow logs, release inspection) is performed with
  the authenticated `gh` CLI, which is already the flow `ci.sh` depends on and is auditable from the
  session log.
- Context7 MCP stays enabled for library documentation.

*Why:* avoids introducing a second long-lived credential (a PAT in the agent config) that would
have to be created, stored, and rotated for no capability this repository needs today.
*Rejected:* enabling the MCP with a fine-scoped PAT now; it can be revisited if a workflow needs
MCP-only features (for example server-side issue search) that `gh` cannot express.

## D-015 · 2026-10-28 · One personal-data scanner, extended with history and release-asset coverage

Guide §II.29 (owner directive 2026-10-27) makes a personal-data and secret scan mandatory. A
parallel branch of work had already added `scripts/scan-personal-data.sh` plus the required
**Personal data scan** check (PR #55). Rather than ship a second, competing scanner, that single
scanner was extended:

- `--history` scans every commit's added lines **and the commit metadata**, because a value deleted
  from `HEAD` stays readable in the earlier commit (§II.29.2 part 2 and part 4).
- The same job runs it, so the required check keeps its name and the gate stays one gate.
- `release.yml` runs the scanner with `--path` over the extracted tarball and the asset directory
  before a draft release is published (§II.29.6, §II.24.3).
- Known history findings are matched by the **SHA-256** of the value, listed in
  `docs/security/known-historical-findings.json`, so the gate stays red for anything new without
  re-publishing the value it is meant to contain.

Classification stays explicit: synthetic values (`dev@example.com`, `/home/runner`, `/home/user`),
documented placeholders, `git@host` SSH remotes, and service mailboxes (`noreply@…`, `*-bot@…`) are
allowed with a reason; everything else fails.

*Pending owner decision:* purging history for the two recorded findings. That needs a force-push
and `enforce_admins` lifted temporarily, so it is an owner-approved action, not a reflex.
*Rejected:* two scanners with two pattern sets (drift); a tree-only gate (a suggestion, not a gate);
listing the known values in clear text in the baseline; scanning every ref (`git log --all`) — it
would fail a pull request because of a leak on somebody else's unmerged branch, which is exactly
how a gate earns a reputation for being flaky and gets switched off. The scope is the ancestry of
the checked-out commit: base branch plus pull-request commits on a PR, the published history on
`main` and on a release tag.
