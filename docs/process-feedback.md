# Process Feedback

Append-only log of friction encountered while building under `guide.md` / `addendum.md`
(addendum §N). Feedback is advisory: it never waives clean-room, no-secrets, CI-before-client-try,
or the v0.1.0 structural gate.

---

PROCESS FEEDBACK
Date / session: 2026-10-26
What I was trying to do: land small UI slices (filter chips, empty states) and a PWA slice, verified by CI.
Block or friction: `ci.sh run` commits the working tree itself. Committing the same changes by hand first left nothing staged; the script then pushed a branch whose commits had already been squashed, and GitHub accepted pull requests #32 and #34 as **empty squash commits**. Both slices silently disappeared from `main` while the PRs looked green.
Why the current guide/addendum caused it (or did not cover it): neither document states whether the agent should commit before invoking `ci.sh`, and the script treats "no staged changes" as a soft, non-fatal condition that still proceeds to push.
Suggested change (one concrete edit): in `addendum.md` §I (or the `ci.sh` section), state "do not commit before `ci.sh run`; leave the working tree dirty" and make `ci.sh` refuse to push when the branch introduces no tree difference from the base.
Severity: slows-work
Workaround I used (if any): deleted the stale local `opencode/ci` branch before each run, let `ci.sh` do the commit, then verified the merged commit actually contained file changes (`git show --stat`) instead of trusting the PR title.
Confirm: did NOT violate clean-room / v0.1.0 gate / no-secrets / CI-before-client-try / no meta-guide push

---

PROCESS FEEDBACK
Date / session: 2026-10-26
What I was trying to do: record capability status honestly in `docs/parity.md`, `ROADMAP.md`, and `REQUIREMENTS_TRACEABILITY.md`.
Block or friction: tracking files drifted ahead of the code twice — checkmarks and percentages claimed slices that had not landed (see the empty-squash entry above). A reader could not tell "done" from "intended".
Why the current guide/addendum caused it (or did not cover it): the guide requires tracking updates in the same slice but does not require the evidence cell to name a merged commit or CI run.
Suggested change (one concrete edit): require every `Done` row to carry either a merged-commit SHA or a CI run URL, and forbid `Done` without one.
Severity: nice-to-have
Workaround I used (if any): re-verified each claim against `git show --stat origin/main` and corrected the files before marking anything done.
Confirm: did NOT violate clean-room / v0.1.0 gate / no-secrets / CI-before-client-try / no meta-guide push
