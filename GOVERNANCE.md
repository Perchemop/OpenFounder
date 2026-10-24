# Governance

How decisions get made in OpenFounder, who can make them, and how someone earns more
responsibility.

## Roles

Defined broadly, because documentation, triage, testing, design, and translation are all
contributions:

| Role | Who | What they do |
| --- | --- | --- |
| **User** | anyone | Uses the app, reports bugs, asks questions. |
| **Contributor** | anyone who adds value | An issue, a triage comment, a doc fix, a test, or a merged patch. |
| **Maintainer** | listed in `CONTRIBUTORS.md` | Feels responsible for the project's direction; reviews pull requests, sets priorities, cuts releases. Coding is not required. |
| **Committer** | maintainer(s) with write access | Can merge to `main` — today, the maintainer only. |

## Model for now: single maintainer, liberal contribution

This project currently has one human maintainer and an agent development team. The governing
model is deliberately simple and written down so it can be replaced rather than improvised:

- **Direction** is set by the maintainer, guided by `VISION.md` and `docs/scope.md`. Those two
  files act as the project's constitution: a debate about a feature is re-anchored on them, which
  keeps disagreement about the work rather than about people.
- **Day-to-day contributions** are decided on their merits by consensus-seeking review
  (see below), not by status. A pull request from a first-time contributor is judged the same as
  one from the maintainer.
- **Tiebreaker:** when consensus is not reached, the maintainer decides, and records the reason
  in `DECISIONS.md`. This is the fallback, not the default.

The three models used by open-source projects are BDFL (one final say), meritocracy (earned
votes), and liberal contribution (influence tracks current work, decisions by consensus-seeking).
This project sits between the first and the third, and will move toward liberal contribution as
maintainers are added.

## Consensus seeking

Discuss until the serious concerns have been heard and answered; move on when only minor concerns
remain. Prefer this over voting — voting creates winners and losers and under-represents people
who never speak up. Reserve voting for a tie that consensus cannot break.

## How to become a maintainer

There is no application form. The path is:

1. Make a few substantive contributions (code, tests, documentation, or triage) that show
   judgement, not just effort.
2. Show you can take review feedback, and give it kindly.
3. Ask, or be invited. The maintainer will say what is missing if the answer is "not yet".

Once there is more than one maintainer, areas can be owned outright (security, accessibility,
triage, documentation) and those owners decide within their area. People self-organise into
areas; they are not assigned.

## Conflict resolution

- The maintainer is a moderator, not a combatant — set the bar for kindness.
- Re-anchor disputes on `VISION.md` and `docs/scope.md`.
- Keep conversations on action ("what brings this closer to resolution?"); close threads that are
  not converging, with an explanation.
- A single loud voice is not the community; consider the silent users.
- Behavioural issues follow `CODE_OF_CONDUCT.md`, and are handled privately.

## Commercial participation

Paid contributions are welcome and get no special treatment: every contribution is judged on its
merits, and discussion stays about the contribution, not about who funds whom. If the project
ever gains commercial sponsorship or a company contributes staff time, it will be recorded here.

## Money and legal entity

No money flows through this project today, so there is no legal entity, no donation button, and no
fiscal sponsor. If sustained maintainer time becomes necessary, the first step recorded here
would be GitHub Sponsors, and any entity or fiscal sponsor after that.

## Access and bus factor

- Commit access is granted only to maintainers; the `main` branch is expected to be protected
  with required checks (an owner action tracked in `docs/launch-checklist.md`).
- **At least two administrators** are required for resilience (bus factor). Today there is one
  maintainer, so this is recorded as an open requirement, not a satisfied one.
