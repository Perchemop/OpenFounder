# Competitive Benchmark

Observed on **2026-10-23** from each product's public marketing site. This is a record of
capability claims, not an endorsement or a copy plan. Feature names below are the products' own;
nothing here is inferred beyond what the pages state.

Sources:

- <https://cofounder.co> (The General Intelligence Company of New York)
- <https://www.cofounderslab.com>
- <https://www.mentorshow.com> (French-language site)
- <https://eightfold.ai>
- <https://cascade.app>

## What each product is

### Cofounder (cofounder.co)

An "agent orchestration platform designed to run an entire business". The page advertises
agentic departments (strategy, finance, marketing, support, website, operations, design, sales),
human-in-the-loop approval for "potentially dangerous actions", and extensibility via MCP,
custom APIs, and custom skills. Its stated lifecycle is launch (positioning, brand, marketing
website, launch content), grow (customer research, prospect discovery, email outreach,
newsletters), and operate (LLC incorporation, product analytics, customer support, recurring
workflows). It also sells a founder guide split into Start, Build, Sell, and Scale chapters.

### CoFoundersLab

A startup community: cofounder matching by "interests, skills and location", access to advisors,
help preparing a pitch for funding, and a network across "200+ cities". It reports 700,000+
members. The product surface is network and marketplace, not a local workspace.

### MentorShow

A subscription library of masterclasses and guided programmes in French, covering wellbeing,
confidence, resilience, relationships, stress, sleep, and similar personal-development topics.
It advertises 70+ masterclasses, workbooks and exercises, a personalised path, weekly live
sessions, and certified coaching. **It is not a startup-mentor or cofounder product.** The only
transferable idea is the guided-programme structure (lessons plus applied exercises).

### Eightfold AI

Enterprise "talent intelligence": AI Interviewer, AI Interview Companion, Candidate Agent,
talent acquisition and management, resource management, workforce exchange, and TalentForge.
It is built on a large career/skills graph, sells to large employers, and publishes third-party
bias audits. It is an HR platform, not a founder operating system.

### Cascade

A "strategy-led performance platform": a planner for strategy, alignment and relationship views
between plans, a metrics library connected to initiatives, dashboards and reports, OKRs,
balanced scorecard, strategic portfolio management, risk management, and integrations with
Jira, Salesforce, Excel, Sheets, Slack, Teams, and others. It targets enterprises and PMOs.

## Capability map against OpenFounder

Status values: **Have** (already in this repository), **Add** (in scope, planned as a slice),
**Adapt** (in scope with a narrower local-first meaning), **Out** (explicitly not emulated).

| Capability | Source product | OpenFounder status | Decision |
| --- | --- | --- | --- |
| Guided founder phases and tasks | Cofounder guide, MentorShow programmes | Have | `PhasesPage`, `src/data/phases.ts` |
| Evidence-backed claims and experiments | Cofounder "customer research" | Have | Evidence ledger, validation experiments |
| Risk register with severity | Cascade risk management | Have | `RisksPage`, `riskScoring.ts` |
| Roadmap with dependencies | Cascade planner | Have | `RoadmapPage` |
| Landing-page copy and launch assets | Cofounder launch | Have | `LandingPageStudio` |
| AI co-founder with provider fallback | Cofounder agents | Have (local, no external actions) | `src/ai/*`, approval-free chat only |
| Objectives and key results | Cascade OKRs | **Add** | Goals page with measurable key results |
| Metrics library and scorecards | Cascade metrics/dashboards | **Add** | Key results carry unit, baseline, target, current |
| Strategy alignment view | Cascade alignment | Adapt | Canvas already relates problem/customer/solution nodes; no org hierarchy |
| Advisor and mentor CRM | CoFoundersLab advice, MentorShow coaching | **Add** | Local contact log, sessions, commitments; no marketplace |
| Team skills and gap analysis | CoFoundersLab matching, Eightfold skills | Adapt | Local "who do we have / what is missing"; no candidate graph |
| First-hire pipeline | Eightfold recruiting | Adapt | Local roles, candidates, stage, evidence notes; no AI interview or bias audit |
| Fundraising pitch preparation | CoFoundersLab funding | Adapt | Reuse report export and landing copy; no investor network |
| Cofounder/investor matching | CoFoundersLab | **Out** | Requires a two-sided network, identity, and moderation; not a local-first feature |
| Masterclasses and coaching marketplace | MentorShow | **Out** | Different domain (personal development); licensed video content cannot be cloned |
| Enterprise ATS and skills graph | Eightfold | **Out** | 1.6B-profile data asset and enterprise compliance; not a founder tool |
| Autonomous agents that email, incorporate, or spend | Cofounder | **Out for now** | Requires external accounts, credentials, and money movement; "no fake functionality" forbids a simulation |
| Enterprise integrations (Jira, Salesforce, SSO) | Cascade | **Out for now** | No backend, no OAuth secrets in a static app; local JSON import/export is the substitute |

## What we will actually build, in order

1. **Goals, key results, and scorecard** (Cascade OKRs + metrics, adapted to one founder team).
   Measurable key results with unit, direction, baseline, target, and current value; objective
   progress is derived, never typed in by hand.
2. **Advisor and mentor log** (CoFoundersLab advice + MentorShow coaching structure, local only).
   Contacts, sessions, advice received, commitments, and follow-up dates.
3. **Team and skills coverage** (CoFoundersLab matching + Eightfold skills, local only).
   Current team, required roles, skill coverage, and explicit gaps.
4. **First-hire pipeline** (Eightfold recruiting, local only).
   Roles, candidates, stages, and evidence notes — no automated interviewing or scoring.

Deliberately excluded, with reasons recorded in `DECISIONS.md` (D-008): two-sided marketplaces,
licensed content, autonomous external actions, and enterprise integrations.

## Honesty rules for this benchmark

- No product is claimed as "matched" until the capability exists, is wired to real data, and is
  covered by a test or CI.
- Screenshots, copy, and data from these products are not copied into this repository.
- Marketing claims (member counts, customer logos) are recorded as the vendor's claims only and
  are not used as evidence about our own product.
