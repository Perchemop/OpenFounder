# Behavioural Summary — Cofounder, CoFoundersLab, MentorShow, Eightfold AI, Cascade

**Status:** approved by the repository owner on 2026-10-24 as the direction for capability work.
**Method:** public marketing pages fetched and summarised in-session (observer: this agent,
2026-10-23). Originals are linked below; nothing from them is reproduced here beyond a plain
behavioural description.

## Sources

- <https://cofounder.co>
- <https://www.cofounderslab.com>
- <https://www.mentorshow.com>
- <https://eightfold.ai>
- <https://cascade.app>

## Observed behaviour

### Cofounder (cofounder.co)

Markets itself as agent orchestration for running a company. Observable pattern: work is
organised as staged chapters (start, build, sell, scale); agents propose actions and the human
approves ones with side effects; departments are a grouping device for tasks; company context is
carried between tasks.

### CoFoundersLab (cofounderslab.com)

A community surface: matching by interests, skills, and location; access to advisors; pitch
preparation help. Observable pattern: people and advice are the assets, and the product is the
connection between them.

### MentorShow (mentorshow.com)

A subscription library of masterclasses and guided programmes in personal development, with
workbooks, progress tracking, and optional live coaching. Observable pattern: lessons grouped
into a path, each with an applied exercise, plus a review/rating surface per lesson.

### Eightfold AI (eightfold.ai)

Enterprise talent intelligence. Observable pattern: a skills graph drives matching; an AI agent
conducts structured interviews at scale and summarises them; bias audits are published as
trust evidence.

### Cascade (cascade.app)

Strategy execution software. Observable pattern: objectives decompose into measurable key
results; metrics are defined once and connected to initiatives; dashboards and risk sit beside
the plan; alignment views relate plans to each other.

## What OpenFounder adopted

| Capability | Adapted from | Where |
| --- | --- | --- |
| Objectives with measurable key results, derived progress | Cascade | `GoalsPage`, `src/utils/okr.ts` |
| Metrics with unit, direction, baseline, target, and provenance | Cascade | key results on the goals page |
| Scorecard summarising health | Cascade | goals summary cards |
| Advice log with sessions, verbatim quotes, and commitments | CoFoundersLab + MentorShow | `AdvisorsPage`, `src/utils/advisorLog.ts` |
| Skills coverage with explicit gaps | CoFoundersLab matching + Eightfold skills, local only | `TeamPage`, `src/utils/skillCoverage.ts` |
| Approval before side effects | Cofounder | evidence promotion guardrails, import/export confirmations |
| Guided path with applied exercises | MentorShow structure, our domain | guided phases with required tasks |

## What was deliberately not adopted

| Capability | Why |
| --- | --- |
| Cofounder/investor matching | Needs a two-sided network, identity, and moderation — not a local-first feature |
| Masterclass content and licensed programmes | MentorShow is a personal-development product; content is licensed and out of domain |
| AI interviewing at scale, published bias audits | Enterprise HR capability; no candidate data exists here |
| Autonomous outbound, incorporation, and spend | Requires external accounts, credentials, and money movement; simulating it would be fake functionality |
| Enterprise integrations and SSO | Static app with no backend and no OAuth secrets |
| Skills graph of real people | No such data; would be fabricated |

## Acceptance criteria used for the adopted work

1. Every derived number is computed from recorded data; none is hand-entered.
2. Unsupported states are visible rather than omitted (no silent promotion, no hidden gaps).
3. No surface claims a match, a score, or a source that the user did not record.
4. Each capability is covered by unit tests in CI.

## Edge cases recorded

- An objective with no key results must report that its progress cannot be measured, not 0%
  silently.
- Advisor-only skill coverage cannot count as coverage.
- A key result whose baseline equals its target must not divide by zero.
- An empty workspace's report states the absence of evidence rather than implying validation.
