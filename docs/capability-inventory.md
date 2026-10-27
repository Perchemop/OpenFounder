# Capability Inventory

Single list of what OpenFounder is designed to do (guide §II.27.3). A capability that is not
listed here can be neither claimed done nor reported missing.

**Rows.** One row per capability: `CAP-nnn` (stable, never reused), the public behaviour it
delivers, how we know it works (acceptance criteria), where the inspiration behaviour was observed
(public URL or an explicit "original design"), and its status.

**Status values.** `implemented` · `partial` · `not started` · `out of scope` (with a reason).

**Evidence.** Implementation evidence (test name, page, CI run) lives in `docs/parity.md`, keyed by
the `Parity` column below. Readiness moves only from verified evidence, never from intention.

**Mapping rule.** `CAP-nnn` is the inventory identity; `C-nn` is the parity identity in
`docs/parity.md`. They are 1:1 and both are permanent: this file answers *what should exist*, the
parity file answers *what exists and how it is evidenced*.

## Capabilities

| ID | Capability | Observable behaviour | Acceptance criteria | Source | Status | Parity |
| --- | --- | --- | --- | --- | --- | --- |
| CAP-001 | Create and switch founder workspaces | A founder creates a project, switches between projects, and the choice survives a reload | Projects persist in IndexedDB; switching reloads that project's rows | Original design | implemented | C-01 |
| CAP-002 | Guided phases with required tasks | The app walks through ten founder phases; a phase advances only when its required tasks are complete | `phases.ts` data drives the UI; completion is derived, not typed in | Original design | implemented | C-02 |
| CAP-003 | Evidence ledger | Claims are recorded with a status, confidence, source, and a next falsification test | Every claim row persists and reloads with its fields intact | Original design | implemented | C-03 |
| CAP-004 | Evidence promotion guardrails | A claim cannot be promoted to research/customer/experiment status without matching evidence | Promotion without evidence is blocked in the UI with a stated reason | Original design | implemented | C-04 |
| CAP-005 | Risk register | Risks carry category, probability × impact, mitigation, next test, and status | Open and hot risks are counted on the dashboard from the same data | Risk matrix (standard 3×3 practice) | implemented | C-05 |
| CAP-006 | Validation experiments | An experiment records hypothesis, method, sample size, success and failure criteria, and results | Status transitions work and results are stored per project | Build-Measure-Learn (public method) | implemented | C-06 |
| CAP-007 | Customer discovery log | Interviews record pain severity, workarounds, willingness to pay, and verbatim quotes | Quotes appear in the exported document | The Mom Test (public method) | implemented | C-07 |
| CAP-008 | Research source register | Sources record type, category, findings, relevance, and confidence | Sources persist and filter by category | Original design | implemented | C-08 |
| CAP-009 | Competitor teardowns | Each competitor records pricing, strengths, weaknesses, and customer complaints | Teardowns persist per project | Original design | implemented | C-09 |
| CAP-010 | Relationship canvas | Nodes and labelled edges describe relationships between ideas, people, and evidence | Nodes and edges persist and are keyboard-navigable | Notion / Airtable — workspace navigation expectations (<https://www.notion.so>) | implemented | C-10 |
| CAP-011 | MoSCoW MVP planner | Features are prioritised Must/Should/Could/Won't with complexity and status | Columns group features by priority | MoSCoW (public method) | implemented | C-11 |
| CAP-012 | Dependency-aware roadmap | Milestones carry status, priority, ordering, and dependencies | Items group by stage; dependency fields persist | Original design | implemented | C-12 |
| CAP-013 | Lean Canvas and unit economics | Per-project business model canvas and unit economics | Values persist and export | Lean Canvas (Ash Maurya, public framework) | implemented | C-13 |
| CAP-014 | Go-to-market plan | Channels and a checklist are stored per project | Checklist state persists | Original design | implemented | C-14 |
| CAP-015 | Landing-page copy studio | A structured spec for headline, subhead, proof, and call to action | Spec persists and exports | Original design | implemented | C-15 |
| CAP-016 | Export package and documents | The workspace exports as a versioned JSON package and as Markdown/JSON documents | Export round-trips through import | Original design | implemented | C-16 |
| CAP-017 | JSON import with validation | An imported package is schema-validated and rejected with a readable message when malformed | Invalid or too-new packages are refused; valid ones load | Original design | implemented | C-17 |
| CAP-018 | AI co-founder with provider fallback | A side panel answers with project context, falling back across providers | Server, direct-key, and offline paths each work; failures are actionable | Original design | implemented | C-18 |
| CAP-019 | Offline deterministic guidance | With no provider configured the assistant returns rule-based guidance and never invents sources | Offline answers contain no fabricated citation | Original design | implemented | C-19 |
| CAP-020 | Keyboard command palette | `Ctrl/Cmd + K` opens a palette that navigates and searches core entities | Arrow keys move, Enter activates, Escape closes | Notion / Airtable — command palette expectations (<https://www.notion.so>) | implemented | C-20 |
| CAP-021 | Accessibility | Keyboard, screen-reader, contrast, and reduced-motion behaviour on the main flows | WCAG 2.2 AA target; human pass recorded; axe scan in CI | WCAG 2.2 (public standard, <https://www.w3.org/TR/WCAG22/>) | implemented | C-21 |
| CAP-022 | Full-text workspace search | Search covers evidence, research, interviews, risks, roadmap, goals, advisors, team, hiring roles and candidates, experiments, competitors, and features | Query returns grouped, ranked results; a result activates the tab that owns it | Original design | implemented | C-22 |
| CAP-023 | Cloud sync / multi-device | Not implemented: the app is local-first by decision | — | Out of scope for v1 (D-008): local-first avoids a server and account model | out of scope | C-23 |
| CAP-024 | Objectives and key results | Objectives carry measurable key results with derived progress and health | Progress is computed from measured values | Cascade-style OKRs (public category, <https://cascade.app>) | implemented | C-24 |
| CAP-025 | Advisor and mentor log | Advisors, sessions, verbatim advice, and commitments with follow-up state | Commitments show as open/done; ordering is derived | CoFoundersLab-style advice log (<https://www.cofounderslab.com>) | implemented | C-25 |
| CAP-026 | Team skills coverage | Members and required skills produce derived coverage and gaps | Coverage is derived from members, never hand-typed | Team capability mapping (public category) | implemented | C-26 |
| CAP-027 | One-page validation report | A report summarises problem, riskiest assumptions, evidence, and the decision | Every claim carries provenance; no decision without a recorded outcome | Original design | implemented | C-27 |
| CAP-028 | In-app bug reporting | A crash or manual report previews a scrubbed payload before anything is sent | No token is stored; the user can cancel | Original design | implemented | C-28 |
| CAP-029 | Update check | The app compares its version with the latest GitHub Release and fails soft offline | Offline shows a clear state, no spinner trap | Original design | implemented | C-29 |
| CAP-030 | First-hire pipeline | Roles and candidates are tracked locally with guarded stage moves | A candidate cannot jump straight to Hired; export/import carries both | Original design (decision log, not an ATS) | implemented | C-30 |
| CAP-031 | Installable PWA with offline shell | The app installs and keeps working offline after first load | Production-only service worker; API responses never cached | Original design | implemented | — |

## Recorded exclusions

| Capability | Reason | Reference |
| --- | --- | --- |
| MentorShow coaching content and Eightfold AI talent-graph behaviour | Licensed/enterprise capabilities; out of domain and not reproducible clean-room | `docs/competitive-benchmark.md`, `docs/research/cofounder-and-peers.md`, D-008 |
| Two-sided cofounder/investor matching | Requires a network and accounts; conflicts with local-first | `docs/scope.md` |
| Autonomous external actions (email, payments, incorporation) | Safety: the product records decisions, it does not act on the founder's behalf | `docs/scope.md` |

## Maintenance

- Add a row before implementing a capability that is not listed here.
- Never renumber or reuse an ID; mark a dropped capability `out of scope` with its reason.
- Keep the `Parity` column pointing at a real row in `docs/parity.md`.
