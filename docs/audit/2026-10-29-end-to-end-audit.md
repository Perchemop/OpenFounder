# End-to-end audit — OpenFounder

**Date:** 2026-10-29
**Scope:** the whole product — domain/data, AI layer, security & privacy, accessibility, design/GUI, code quality, documentation, and the verification posture.
**Method:** static analysis of the tracked source, tests and workflows; the CI-rendered screenshots (1280/768/390 viewports plus the error state); the axe-core results; and the repository's own records (`IMPLEMENTATION_PLAN.md`, `REQUIREMENTS_TRACEABILITY.md`, `docs/capability-inventory.md`, `docs/design/ui-audit-and-improvement-plan.md`).
**Constraint:** heavy toolchains (builds, installs, test runners) run only in GitHub Actions, so every claim here is derived from source/artefact inspection, not from a locally executed build. Where a claim depends on runtime behaviour it is marked.

This audit supersedes the design-only review in `docs/design/ui-audit-and-improvement-plan.md` (2026-10-25), which is itself now partly stale — see finding **DOC-06**.

---

## 0. Evidence used

| Evidence | Where |
|---|---|
| Rendered UI at 1280×800, 768×1024, 390×844 | CI artefact `visual-evidence` (run 40856168461); committed copies in `assets/screenshots/` |
| Error-boundary screen | CI artefact `error-state.png` (`?__forceError=1`) |
| Accessibility scan | `.github/workflows/a11y.yml` + `tests/a11y.spec.ts` (axe-core, `wcag2a/wcag2aa/section508`) |
| Unit tests | 23 test files under `src/**` |
| Required checks | `.ci-required.txt` |
| Domain/data source | `src/db/**`, `src/utils/**`, `src/context/ProjectContext.tsx` |
| AI source | `src/ai/**`, `src/components/ai/**`, `server.ts` |
| Design source | `src/**/*.tsx` utility-class survey, `src/index.css`, `docs/design/**` |

---

## 1. Executive summary

OpenFounder is a **genuinely working, coherent product** — not a mock-up. All 50 items in `IMPLEMENTATION_PLAN.md` are ticked; there are 19 feature pages over a real IndexedDB schema with 23 tables; export/import, an integrity audit, an offline-first AI path, a command palette, a keyboard-navigable canvas, and a required CI gate set (type-check, unit tests, static build × 3 OS, secret scan, SBOM + licence class, action pinning, and a personal-data scan over tree, history and release assets).

The gaps that matter are concentrated and concrete:

1. **The phone layout is broken.** At 390 px the fixed 256 px sidebar plus a non-wrapping navbar produce horizontal overflow; body copy wraps one word per line and buttons are clipped (see §7.1). This is the single most visible defect and it is provable from the committed screenshot.
2. **The bundled example project cannot be imported.** It uses JSON `null` for fields the Zod schema declares `.optional()`, which accepts only `undefined`. The headline "Import Example Project" path therefore fails (**DATA-01**).
3. **Two privacy-critical claims are not true in code.** Auto-fill always posts workspace data (including verbatim customer quotes) to the app's own server regardless of the selected provider (**AI-01**), and `ACCESSIBILITY.md` / `SECURITY.md` describe a posture that no longer matches the repo (**DOC-01**, **DOC-02**).
4. **The automated a11y/visual checks are not gates** and cover only two of nineteen screens (**VER-01**).

**Scorecard**

| Area | Grade | One-line verdict |
|---|---|---|
| Product completeness | A− | Every planned item shipped; broad, real surface |
| Domain & data integrity | C+ | Schema is safe, but example import fails and import/export has real edge defects |
| AI layer | C | Providers are real, but provider choice is bypassed, calls can hang forever, failures are masked |
| Security & privacy | B− | Strong scan/CI posture; a data-egress defect and inaccurate docs |
| Accessibility | B | Solid foundations (focus, reduced-motion, labels, skip link, axe in CI); modal semantics and coverage gaps |
| Design / GUI | C+ | Coherent and consistent, but mobile is unusable and there is no token/primitive layer |
| Code quality | B− | Clean overall; template cruft, duplicated helpers, some dead code |
| Documentation truthfulness | C+ | Comprehensive, but several statements are stale or contradicted by code |
| Verification posture | B | Excellent unit/build/lint CI; no functional end-to-end test; a11y not required |

---

## 2. Product & scope completeness — A−

- 19 pages, 6 layout/modal/AI components, 23 IndexedDB tables, 27 utils.
- Every checkbox in `IMPLEMENTATION_PLAN.md` is `[x]`; `ROADMAP.md` matches `CHANGELOG.md`.
- The competitive-parity work (first-hire pipeline, command-palette coverage) is implemented *and* tested.
- Usage friction: the app opens directly into the empty state (there is no separate marketing landing page); "landing" and "empty state" are therefore the *same* screen, which is why `landing-desktop.png` and `empty-state.png` are byte-identical (79 634 B). The visual evidence set is smaller than it looks.

**Gap:** the only "no project" experience is a centred heading, one line, and two buttons inside an otherwise empty 1024 px canvas. It is functional but thin for a first-run screen.

---

## 3. Domain & data integrity

### 3.1 Schema — sound
Dexie version **7** (`src/db/index.ts:83–121`). Every migration is **additive**: v2 only extends the `chatMessages` index list, v3–v7 add tables. No table/index/PK is removed, so there is no data-loss path on upgrade. **No `.upgrade()` handlers exist**, which is fine for an append-only schema but means a *future* rename/removal would silently leave old rows behind.

### 3.2 Findings

- **DATA-01 · High · The bundled example project cannot be imported.**
  `assets/example-project-tradepulse.json` sets `null` for `sourceTitle` (lines 42, 57, 72, 87), `endDate` (205), `width`/`height` (285–286, 296–297, 307–308). Those fields are `z.string().optional()` / `z.number().optional()` (`src/db/validation.ts:111, 219, 293–294`), and `.optional()` accepts `undefined`, not `null`. `validateExportPackage` rejects the file, so the Settings → Data **"Import Example Project"** button fails. No test loads the asset, which is why this survived. *Fix:* `nullish()`/preprocess, or strip nulls from the asset; add a test that parses the real file.
- **DATA-02 · Medium · No runtime validation on any write path.** Zod runs only inside `importProjectPackage` (`src/db/index.ts:364`). All page writes (`db.evidence.put`, `db.risks.put`, …) persist unvalidated objects, so the app can emit a package its own importer would reject.
- **DATA-03 · Medium · "Import as new" drops cross-references.** On remap, canvas nodes get new ids but edges keep the original `fromNodeId`/`toNodeId` (`src/db/index.ts:486–503`); same omission for `experiments.evidenceId`, `roadmap.dependencies` (`src/db/importRemap.ts:60`), `research.claimLinkedIds`, `decisions.evidenceConsideredIds`, `teamMembers.advisorId`. Latent while the remap path is unreachable (see DATA-04).
- **DATA-04 · High · Import silently replaces data; collision handling is dead code.** `SettingsModal.tsx:159–188` calls `importProjectPackage(pkg)` with no options, so the non-remap path deletes **all rows for `pkg.project.id`** before inserting (`src/db/index.ts:395–421`). `checkImportCollision` (`src/db/index.ts:259–276`) is never imported; there is no confirmation dialog; and `importAsNew` is unwired. Because the demo/example projects use fixed ids, importing one over a newer edit destroys it.
- **DATA-05 · Medium · Canvas keyboard delete orphans edges.** `handleDeleteNode` deletes the connected edges (`CanvasPage.tsx:137–144`), but the Delete/Backspace key handler deletes only the node (`CanvasPage.tsx:151–161`). Orphan edges persist and are then correctly reported by the integrity audit — i.e. the audit looks like it is producing false positives when it is describing a real bug.
- **DATA-06 · Medium · "Wipe everything" leaves data behind.** `wipeAllLocalData` (`src/db/index.ts:604–607`) drops the IndexedDB but leaves `localStorage` (`openfounder_active_project_id`, `openfounder_settings_v1`, the update cache) and `sessionStorage` keys.
- **DATA-07 · Low · Duplicated/dead modules.** Two `generateId` implementations (`src/db/index.ts:49` used in production; `src/utils/id.ts:2` used only by a test — so the *tested* copy is not the *used* copy). Two `DEFAULT_AI_CONFIG` definitions (`src/db/index.ts:182–200` vs the unused `src/db/defaultAiConfig.ts`). `src/db/seedData.ts` is never called. The `communityInsights` table is exported/imported but never written by any UI path.
- **DATA-08 · Low · Naive XSS pre-check.** `validateExportPackage` rejects any import whose serialised text contains `<script` or `javascript:` (`src/db/validation.ts:608–615`): over-inclusive (a claim *about* `javascript:` fails) and unnecessary (all rendering is React-escaped; there is no `dangerouslySetInnerHTML` in `src/`). URL fields are already correctly constrained by `SafeUrlSchema`.
- **DATA-09 · Low · Three independent "7"s.** The Dexie version, the exported `schemaVersion` literal, and `ExportPackageSchema`'s `.max(7)` are separate literals that can drift.

### 3.3 Test coverage
All 13 `src/utils` modules are unit-tested, as are `importRemap`, `validation`, the AI context builder, phases, update-check and bug-report. **Untested:** the entire export/import public surface in `src/db/index.ts`, `seedData`, `defaultAiConfig`, `sampleProject`, `ProjectContext`, and `DocumentsPage`. The bundled example asset is not exercised (the direct cause of DATA-01).

---

## 4. AI layer

### 4.1 What is real
Six providers exist and are genuinely implemented: server-proxied Gemini, direct Gemini (`@google/genai`), OpenAI-compatible, Anthropic, Ollama, and a deterministic offline rule-based engine that is the **default**, so no network call happens until the user opts in. Keys default to **session-only** storage and are sent only to the chosen vendor.

### 4.2 Findings

- **AI-01 · High · Auto-fill bypasses the selected provider and egresses project data.** Every "AI Suggest / Auto-Fill" action calls `POST /api/ai/autocomplete` unconditionally (`src/ai/autoCompleteService.ts:23`) — no `aiConfig` is read anywhere in `src/pages/**`. That payload includes the serialized project context, which contains **verbatim customer quotes and interviewee identifiers** (`src/ai/contextBuilder.ts:96–111`). When `GEMINI_API_KEY` is set the server forwards it to Google (`server.ts:244–299`). A user who chose *Offline Rules* — or *Ollama (100% Offline & Private)* — still sends data to the app server. This directly contradicts the UI copy "Nothing is sent to third parties unless you configure an external AI provider" (`SettingsModal.tsx:539`) and the local-first positioning.
- **AI-02 · High · No timeout or abort on any AI call.** No `AbortController`/timeout exists in any provider, in `autoCompleteService`, or on the server. A blackholed host or a stalled Ollama leaves the Co-Founder composer disabled and every auto-fill button spinning **indefinitely**, with no cancel path.
- **AI-03 · Medium · Direct Anthropic calls cannot work in a browser.** The header sent is `dangerously-allow-browser: true` (`src/ai/providersAnthropic.ts:42, 80`); Anthropic requires `anthropic-dangerous-direct-browser-access: true`. Requests will be blocked by CORS.
- **AI-04 · Medium · Failures are masked as model output.** On generation failure `/api/ai/chat` returns HTTP 200 with a canned assessment and `fallback: true` (`server.ts:176–187`), and the client ignores `fallback` (`providersGemini.ts:39–42`). Separately, `callServerAutocomplete` swallows all errors and returns `null` (`autoCompleteService.ts:29–34`); pages then substitute a deterministic template and still present it as a success. The user cannot tell AI content from canned content.
- **AI-05 · Medium · Chat errors are invisible.** `errorNotice` is declared (`AICofounderPanel.tsx:50`) and assigned, but **never rendered** — a thrown error in `handleSendMessage` produces no visible feedback.
- **AI-06 · Medium · Sensitive data sent without disclosure or redaction.** The context builder includes customer quotes and interviewee identifiers; there is no consent step or redaction toggle.
- **AI-07 · Low · Model/config drift.** Two divergent system prompts (client `providerTypes.ts:23–60` vs server `server.ts:49–90`). Server model ids `gemini-3.1-flash-lite` / `gemini-3.8-flash` (`server.ts:45, 93`) do not correspond to known public Gemini ids, and `/api/ai/status` advertises a model the client path overrides. Dead endpoints `/api/ai/analyze` and `/api/health`. `User-Agent: 'aistudio-build'` (`server.ts:24`).
- **AI-08 · Low · Unbounded history.** The full chat transcript is re-sent every turn (`AICofounderPanel.tsx:117, 125`); only the context string is truncated.

---

## 5. Security & privacy — B−

**Strengths.** The required **Personal data scan** gate now covers the tree, the whole history and the commit metadata, and the release job scans the extracted tarball and asset directory; known published findings are matched by SHA-256 only (`.github/workflows/pii.yml`, `scripts/scan-personal-data.sh`, `docs/security/known-historical-findings.json`). Gitleaks, CodeQL, `action pinning`, SBOM + licence class, and dependency-review all run. There is no `dangerouslySetInnerHTML` anywhere; imports are Zod-validated with `SafeIdSchema`/`SafeUrlSchema`.

**Findings (beyond the AI/privacy defects above).**

- **SEC-01 · Medium · No Content-Security-Policy.** `index.html` ships no CSP (meta or documented header strategy) for a static SPA that holds user API keys. A CSP would meaningfully reduce the blast radius of any future injection. No `og:image` and no `color-scheme` meta either.
- **SEC-02 · Medium · Architecture claim in the security policy is false.** `SECURITY.md:29–30` states "There is no server component, no database, and no account system", yet the repo ships an optional Express server (`server.ts`, `package.json` `build:server`/`start`) with AI proxy endpoints. The threat model is misstated in the document meant to define it.
- **SEC-03 · Low · Licence gate narrower than documented.** `scripts/licence-check.js` forbids only the substrings `GPL-`, `AGPL-`, `BUSL-`, `SSPL`; `ATTRIBUTION.md:58` claims it rejects "non-permissive classes" generally (LGPL, CC-BY-NC, proprietary would pass).
- **SEC-04 · Low · Missing privacy notice.** There is no `PRIVACY.md`, despite local key storage, optional `localStorage` key persistence, crash-report submission, and a release record that *cites* a "privacy note" that does not exist (`docs/releases/v0.2.0.md:22`).

---

## 6. Accessibility — B

**Foundations are good and verified in CI:** explicit `:focus-visible` outline, global `prefers-reduced-motion` handling, a skip-to-content link (`src/App.tsx:92–97`), `aria-hidden` on decorative icons (83 uses), `aria-label` on icon-only controls (39 uses), `role="alert"` on inline errors, focus trapping in all four modals, `lang="en"`, dark mode following OS preference, and a real axe-core scan that fails on **critical** violations.

**Findings.**

- **A11Y-01 · Medium · Modals have no dialog semantics.** None of the four modals set `role="dialog"` or `aria-modal="true"` (grep: zero occurrences in `src/`), and there is no `aria-labelledby`. Focus is trapped, but assistive tech is not told that a dialog opened or that the rest of the page is inert.
- **A11Y-02 · Medium · No live region for dynamic results.** `aria-live` appears zero times. Risk-score changes, experiment-status changes, toast-style confirmations and chat replies are not announced.
- **A11Y-03 · Medium · Scan coverage is narrow.** `tests/a11y.spec.ts` scans only two states (homepage, demo dashboard). The 17 other pages, all four modals, and the dark theme are unscanned. No contrast measurement is recorded.
- **A11Y-04 · Medium · The scan is not a gate.** `.ci-required.txt` lists neither `a11y` nor `visual`, and `a11y.yml` runs only on `pull_request` to `main` (never on push), so a critical violation does not block a merge and "passing" on `main` is not re-verified — even though `ROADMAP.md:55` and `IMPLEMENTATION_PLAN.md:106` describe it as a gate.
- **A11Y-05 · Low · `htmlFor` used once.** 136 `<label>` elements but 1 explicit `htmlFor`: association is implicit (wrapping) in most cases, which is valid, but it is unaudited and fragile.

---

## 7. Design / GUI — C+

This section is based on the CI-rendered screenshots plus a utility-class survey of `src/**` (not on opinion alone).

### 7.1 The mobile layout is broken — **UI-01 · High**
At 390 × 844 the fixed `w-64` sidebar (`Sidebar.tsx`) consumes 256 px, leaving ~134 px of content. Consequences, visible in `assets/screenshots/landing-phone.png`:
- the empty-state heading wraps to **one word per line** ("No / active / project / selected");
- the primary buttons are **clipped** ("eate / ew / oject", "Load Dem / Workspac / (TradePuls");
- the navbar runs off the right edge (project selector + icons + AI button overflow).
The full-page screenshot is **514 px wide for a 390 px viewport**, i.e. the page has horizontal overflow. There is also no mobile search (the command palette is `hidden md:flex`) and no sidebar drawer, so on a phone the app is not usable.

### 7.2 Other design findings
- **UI-02 · Medium · No design-token layer.** `src/index.css` contains only the Tailwind import plus two accessibility rules — no `@theme`, no CSS variables. There are **281 arbitrary bracketed utilities** (spacing/type one-offs). `docs/design/brand.md` documents intent, but nothing enforces it.
- **UI-03 · Medium · Destructive actions use native browser dialogs.** `window.confirm`/`alert` appear in 11+ places (`SettingsModal.tsx:155,192,200`, `AdvisorsPage:132`, `CompetitorsPage:148`, `GoalsPage:181`, `ResearchPage:93`, `ValidationPage:176`, `InterviewsPage:182`, `TeamPage:98,125`, `EvidencePage:335`, `RisksPage:149`). They are unstyled, un-themeable, untestable, inconsistent with the app's own modal system, and inconsistent for screen readers.
- **UI-04 · Medium · No toast/notification system.** Save/import/export feedback is inline-only; there are zero skeletons. (`toast` appears twice in `src/`.)
- **UI-05 · Low · Type scale is small and top-light.** `text-[10px]` ×115 and `text-[11px]` ×153 vs `text-xl` ×21 and `text-2xl` ×4. Page titles are `text-xl`; the audit plan recommends `text-2xl`.
- **UI-06 · Low · Navbar is cramped at tablet width.** At 768 px the search field is clipped against the ⌘K badge and the AI button wraps to two lines.
- **UI-07 · Low · Radius/shadow inconsistency.** `rounded-lg` ×266 vs `rounded-xl` ×88 (plan says lg = cards, xl = modals); only two `shadow-lg`.
- **UI-08 · Low · Badges carry colour but not severity**, and truncated nav labels have no `title` tooltip.
- **UI-09 · Low · Error screen is top-aligned**, not vertically centred, on a 800 px-tall viewport.
- **UI-10 · Low · Visual evidence is thin and partly duplicated:** landing === empty state; nothing behind the workspace tabs is captured because there are no stable selectors (`tests/visual.spec.ts` header comment says so).

**What is good:** consistent zinc/emerald/amber/rose semantics, dark mode applied throughout (1 668 `dark:` variants), a real card pattern, `sm:`-first responsiveness on the pages, and a coherent icon language (lucide, consistent sizes).

---

## 8. Code quality — B−

- **CQ-01 · Medium · Build-template cruft in a public repo.** `vite.config.ts` carries an `aistudioMediaPlugin` wrapped in Google-internal `LINT.IfChange(... //depot/google3/...)` markers, and comments referencing "AI Studio" and "agent edits" (lines 9–63). `server.ts:24` sets `User-Agent: 'aistudio-build'`. None of it belongs in a FOSS product.
- **CQ-02 · Medium · Duplicated/dead modules** — see DATA-07.
- **CQ-03 · Low · `any` escapes (32).** Mostly `catch (err: any)` in providers and a few `e.target.value as any` casts in `NewProjectModal` that should be typed enums.
- **CQ-04 · Low · `Math.random()` for ids in 15 places**, duplicated instead of using one helper (`src/utils/id.ts` exists but is bypassed).
- **Positive:** no `console.log` leftovers, no `TODO/FIXME`, no `@ts-ignore`, no empty catch blocks, no `dangerouslySetInnerHTML`, no `alert()`-driven control flow beyond UI-03.

---

## 9. Documentation truthfulness — C+

The documentation set is unusually complete (governance, security, accessibility, attribution, decisions, releases). The problems are staleness and over-claiming:

- **DOC-01 · High · `ACCESSIBILITY.md` describes work that is done as undone.** Lines 35–37 claim there is "no automated accessibility scan in CI yet" and "no human screen-reader pass has been executed", while `docs/qc/manual-qc.md:64,103–116`, `.github/workflows/a11y.yml` and `tests/a11y.spec.ts` show both are complete. It is the document a user reads to judge accessibility.
- **DOC-02 · High · `SECURITY.md` misstates the architecture** — see SEC-02.
- **DOC-03 · Medium · Version drift.** The bundled example exports declare `appVersion: "0.1.0"` (both copies, line 4) while the app is 0.2.0; `CITATION.cff:9–10` is 0.1.0 / 2026-10-24; `metadata.json` has no version field; `CHANGELOG.md:87` claims a single source of truth.
- **DOC-04 · Medium · Requirements marked Done without tests.** `REQUIREMENTS_TRACEABILITY.md:3–4` defines "Done = implemented and unit-tested", yet R-003, R-004, R-009–R-018 and R-036 are marked Done with "—" in the Tests column.
- **DOC-05 · Medium · Required-check / workflow counts disagree across docs** ("eight required checks" vs the nine in `.ci-required.txt`; "all six workflows pinned" vs seven workflow files; the branch-protection example lists seven).
- **DOC-06 · Medium · The UI audit doc is stale** and still presented as current ("Critical Issues … Before v1.0.0") while several of its critical issues are fixed.
- **DOC-07 · Low · Date and cross-reference errors:** the human a11y pass is dated 2026-10-24 in `manual-qc.md` but 2026-10-25 in four other docs; `docs/scope.md:10` cites R-021 for evidence integrity when that is R-005; `docs/parity.md:37` vs `docs/capability-inventory.md:45` disagree on C-23; `CAP-031` has no parity row (breaking the stated 1:1 rule).
- **DOC-08 · Low · Missing standard files:** `PRIVACY.md`, `SUPPORT.md`, `CODEOWNERS`, `NOTICE`; `ROADMAP.md:19` claims a format check that does not exist.
- **DOC-09 · Low · `ATTRIBUTION.md` says "no images … are bundled"** while four PNGs are tracked and embedded in the README.

---

## 10. Verification posture — B

**Strong:** required type-check + unit tests on three operating systems, required static build, required secret scan, required SBOM + licence class, required action pinning, required personal-data scan (tree + history + assets). 23 test files cover the domain utilities well. `dependency review` is advisory by recorded decision.

**Gaps:**
- **VER-01 · Medium · No functional end-to-end test.** Nothing exercises the product's core loop (create a project → record evidence → blocked promotion → export → import). The Playwright specs are accessibility/visual only. This is the single biggest verification gap for a guide that asks for end-to-end evidence.
- **VER-02 · Medium · The a11y/visual jobs are not required and do not run on `main`** (see A11Y-04).
- **VER-03 · Low · Coverage is unmeasured** (no coverage tooling), so "unit-tested" is asserted by file presence.
- **VER-04 · Low · No performance test** at scale (the plan's "500+ rows" item is unaddressed; no pagination/virtualisation evidence).

---

## 11. Findings register

| ID | Sev | Area | Title |
|---|---|---|---|
| UI-01 | High | Design | Mobile/phone layout is broken (overflow, clipped content, one-word-per-line text) |
| DATA-01 | High | Data | Bundled example project cannot be imported (`null` vs `.optional()`) |
| DATA-04 | High | Data | Import silently replaces existing data; collision handling is dead code |
| AI-01 | High | AI/Privacy | Auto-fill bypasses provider choice and egresses project data |
| AI-02 | High | AI | No timeout/abort on any AI call |
| DOC-01 | High | Docs | `ACCESSIBILITY.md` describes completed work as undone |
| DOC-02 / SEC-02 | High | Security/Docs | `SECURITY.md` says there is no server component |
| UI-02 | Medium | Design | No design-token layer |
| UI-03 | Medium | Design | Native `confirm()`/`alert()` for destructive actions |
| UI-04 | Medium | Design | No toast/notification system |
| A11Y-01 | Medium | A11y | Modals lack `role="dialog"`/`aria-modal` |
| A11Y-02 | Medium | A11y | No live region for dynamic results |
| A11Y-03 | Medium | A11y | axe scan covers 2 of 19 screens; modals/dark unchecked |
| A11Y-04 | Medium | A11y/CI | a11y scan is not a required check and never runs on `main` |
| DATA-02 | Medium | Data | No runtime validation on write paths |
| DATA-03 | Medium | Data | "Import as new" drops cross-references |
| DATA-05 | Medium | Data | Canvas keyboard delete orphans edges |
| DATA-06 | Medium | Data | "Wipe everything" leaves local/session storage |
| AI-03 | Medium | AI | Wrong Anthropic browser header → CORS failure |
| AI-04 | Medium | AI | Failures masked as model output / silent template fallback |
| AI-05 | Medium | AI | Chat errors never rendered (`errorNotice`) |
| AI-06 | Medium | Privacy | Sensitive data sent with no consent/redaction |
| SEC-01 | Medium | Security | No CSP |
| CQ-01 | Medium | Code | AI-Studio template cruft in a public repo |
| CQ-02 | Medium | Code | Duplicated/dead modules |
| DOC-03 | Medium | Docs | Version drift (example exports, CITATION, metadata) |
| DOC-04 | Medium | Docs | Requirements "Done" without tests |
| DOC-05 | Medium | Docs | Required-check/workflow counts disagree |
| DOC-06 | Medium | Docs | UI audit doc stale but presented as current |
| VER-01 | Medium | Verify | No functional end-to-end test |
| VER-02 | Medium | Verify | a11y/visual not required checks |
| (Low) | Low | — | UI-05…UI-10, A11Y-05, DATA-07/08/09, AI-07/08, SEC-03/04, CQ-03/04, DOC-07/08/09, VER-03/04 |

---

## 12. Remediation plan

Sequenced so each step is a small, reviewable PR with CI evidence, highest user impact first.

**Phase 1 — Stop the bleeding (correctness & privacy)**
1. `DATA-01`: make the example project importable (`nullish`/preprocess) **and** add a test that runs the real asset through `validateExportPackage`.
2. `AI-01`: route auto-fill through the selected provider; block server calls unless an external provider is deliberately chosen; add an explicit notice.
3. `AI-02`: add `AbortController` + timeout to every provider and to auto-fill; expose a cancel/retry.
4. `DOC-01`/`DOC-02`: correct `ACCESSIBILITY.md` and `SECURITY.md` to the truth.

**Phase 2 — Make the phone work**
5. `UI-01`: off-canvas sidebar drawer + hamburger; make the navbar shrink/wrap; add a mobile search entry point. Add a Playwright assertion that no page overflows horizontally at 390 px (landing and a workspace page).

**Phase 3 — Accessibility as a gate**
6. `A11Y-01`: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` on all modals.
7. `UI-04`/`A11Y-02`: a small toast system backed by an `aria-live="polite"` region; use it for save/import/export.
8. `A11Y-03`/`A11Y-04`/`VER-02`: extend the axe scan across pages, modals and dark mode; run it on `main` and make it a required check.

**Phase 4 — Data integrity hardening**
9. `DATA-04` + `DATA-03`: an import dialog with collision detection, a confirmation, and a working "import as copy" (with full id remapping).
10. `DATA-02`: validate on write (or at least on export, so the app cannot emit an invalid package).
11. `DATA-05`, `DATA-06`, `DATA-07`.

**Phase 5 — Design system**
12. `UI-02`: `docs/design/tokens.md` + a Tailwind v4 `@theme` block; then shared `Button`/`Card`/`Input`.
13. `UI-03`: replace native `confirm()`/`alert()` with an accessible in-app `ConfirmDialog`.
14. `UI-05`…`UI-09`.

**Phase 6 — Verification & hygiene**
15. `VER-01`: a functional Playwright spec for the core loop (create → evidence → blocked promotion → export → import).
16. `CQ-01`, `CQ-02`, `DOC-03`…`DOC-09`, `SEC-01`, `SEC-03`, `SEC-04`, `VER-03`, `VER-04`.

---

*Findings that depend on runtime behaviour (e.g. the exact failure message when importing the example project) are stated as source-derived and are to be confirmed by the CI check added with the fix.*
