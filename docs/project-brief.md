# Project Brief

## Product identity

- **Name:** OpenFounder
- **One sentence:** An evidence-driven AI co-founder workspace that helps founders take an idea to a validated problem and a tested solution.
- **Primary user:** Solo founders, indie hackers, and small product teams who need to validate demand before spending months building.
- **Problem it solves:** Founders confuse opinions, market folklore, and AI output with evidence. OpenFounder forces every belief into a claim with an explicit status, a falsification test, and a recorded source, and it refuses to invent sources or customer quotes.

## Working assumptions (recorded honestly)

These were reconstructed from the existing README, source tree, and git history when this
documentation baseline was added. They have **not** been re-confirmed by the human owner in
this session; treat them as assumptions until confirmed.

- The product is a **local-first desktop-class web app** (browser IndexedDB) with an optional
  Express server for server-side Gemini calls.
- Hosting target is **static web (GitHub Pages)** plus an optional self-hosted full stack.
- The product is intended to be **free and open source**.
- The AI layer is **BYOK**; the app stays fully usable offline with deterministic heuristics.

## Success definition

A founder can run the full loop inside one workspace:

1. Create a project and state the problem.
2. Record claims and mark them as assumptions, not facts.
3. Design a falsifiable experiment for the riskiest claim.
4. Log interviews and research sources against claims.
5. Update the claim only when real evidence exists.
6. Export the whole workspace as a portable JSON package.

## Non-goals

- Not a project-management or issue-tracking tool.
- Not a market-data vendor; no scraped proprietary datasets.
- Not an autonomous agent that fabricates research.
- No mandatory cloud account or telemetry.

## Open questions

See `docs/assumptions-and-questions.md`.
