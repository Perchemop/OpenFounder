# UI & Design Audit — OpenFounder

**Date:** 2026-10-25  
**Scope:** React 19 + Vite + Tailwind CSS v4, local-first IndexedDB workspace  
**Reviewer:** Design audit (code-level + structural review)  
**Status:** Baseline — first formal UI/design audit

---

## 1. Executive Summary

OpenFounder is a functional, local-first founder validation workspace with 18 feature pages, a tab-based layout shell, modals, a canvas, and an AI co-founder panel. The UI is **consistent but utilitarian**: it uses Tailwind utility classes with a zinc/emerald/amber/rose semantic palette and dark mode support, but lacks a formal design system, component library, or design tokens.

**Overall impression:** The app is usable and coherent, but feels like a "developer dashboard" rather than a polished founder tool. Visual hierarchy is flat, density is high, and many interactions lack motion, micro-interactions, or delight. Accessibility foundations exist (focus-visible, reduced-motion, role="alert") but the human QC pass has not been completed (see docs/qc/manual-qc.md).

---

## 2. Current State Inventory

### 2.1 Layout Shell

| Component | File | Lines | Notes |
|---|---|---|---|
| App shell | `src/App.tsx` | 377 | Single layout shell: Navbar + Sidebar + main content + modals + AI panel |
| Navbar | `src/components/layout/Navbar.tsx` | 150 | Brand, project selector, phase badge, command palette, theme, settings, AI toggle |
| Sidebar | `src/components/layout/Sidebar.tsx` | 187 | 19-tab navigation, badge counts, local-first footer |
| ProjectContext | `src/context/ProjectContext.tsx` | 438 | Monolithic context: theme, data, AI, modals, keyboard shortcuts |

### 2.2 Pages (18)

| Page | File | Lines | Primary Function |
|---|---|---|---|
| Dashboard | `src/pages/DashboardPage.tsx` | 522 | Landing: phases, evidence integrity, risk snapshot, next action, quick-launch |
| Phases | `src/pages/PhasesPage.tsx` | — | 10-step founder journey |
| Evidence Ledger | `src/pages/EvidencePage.tsx` | — | Claims, sources, verification status |
| Risk Register | `src/pages/RisksPage.tsx` | — | Probability × impact scoring, mitigation |
| Research | `src/pages/ResearchPage.tsx` | — | Source catalog |
| Competitors | `src/pages/CompetitorsPage.tsx` | — | Teardown matrix |
| Validation | `src/pages/ValidationPage.tsx` | — | Experiments, hypothesis tests |
| Interviews | `src/pages/InterviewsPage.tsx` | — | Customer discovery logging |
| Canvas | `src/pages/CanvasPage.tsx` | — | Node/edge visual graph |
| MVP Planner | `src/pages/MVPPlannerPage.tsx` | — | MoSCoW scope |
| Roadmap | `src/pages/RoadmapPage.tsx` | — | Milestone timeline |
| Goals | `src/pages/GoalsPage.tsx` | — | OKR scorecard |
| Advisors | `src/pages/AdvisorsPage.tsx` | — | Mentor log |
| Team | `src/pages/TeamPage.tsx` | — | Skills coverage |
| Business Model | `src/pages/BusinessModelPage.tsx` | — | Lean Canvas |
| GTM | `src/pages/GTMPage.tsx` | — | Go-to-market plan |
| Landing Page Studio | `src/pages/LandingPageStudio.tsx` | — | Spec builder |
| Documents | `src/pages/DocumentsPage.tsx` | — | Markdown/JSON export |

### 2.3 Components (11)

| Component | File | Lines | Notes |
|---|---|---|---|
| SettingsModal | `src/components/modals/SettingsModal.tsx` | 695 | Tabbed: AI providers, privacy, data, integrity audit |
| BugReportModal | `src/components/modals/BugReportModal.tsx` | 142 | Preview-then-send, no token |
| NewProjectModal | `src/components/modals/NewProjectModal.tsx` | 743 | 5-step wizard, AI autofill |
| CommandPalette | `src/components/modals/CommandPalette.tsx` | 357 | ⌘K search + quick nav |
| AICofounderPanel | `src/components/ai/AICofounderPanel.tsx` | 313 | Slide-in chat |
| AIAutoFillButton | `src/components/ai/AIAutoFillButton.tsx` | — | Subtle/primary/badge variants |
| ErrorBoundary | `src/components/ErrorBoundary.tsx` | — | Crash UI + report button |
| UpdateCheckPanel | `src/components/UpdateCheckPanel.tsx` | — | Version check UI |

### 2.4 Styling Approach

- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js`, no design token file
- **No CSS module/component library** — all styling is inline utility classes
- **Dark mode** via `dark:` variants, toggled on `<html>` element via `document.documentElement.classList`
- **Theme state** lives inside `ProjectContext` (monolithic), not a dedicated theme provider
- **Color semantics** (inferred, not documented): zinc (neutral), emerald (success), amber (warning), rose (danger), indigo/purple (AI/experiments)
- **Focus visible** — explicit `:focus-visible` outline in `src/index.css`
- **Reduced motion** — `prefers-reduced-motion` media query disables transitions/animations

---

## 3. Detailed UI Audit by Category

### 3.1 Layout & Shell — B-

**Strengths:**
- Sticky Navbar with backdrop blur feels modern
- Sidebar with grouped navigation (Overview / Workspaces) is logical
- Content area is `max-w-6xl mx-auto` — readable line length
- Local-first badge in sidebar footer sets expectations

**Weaknesses:**
- No page headers with breadcrumbs — users can't tell where they are within a deep flow
- Sidebar is fixed `w-64` — no collapsible variant for narrow screens
- AI panel slides in over content but there's no "docked" or "split" mode
- The empty state ("No project selected") is minimal — no guidance, no demo data call-to-action beyond a tiny text

**Recommendations:**
- Add page-level header with breadcrumb (e.g., Dashboard > Evidence Ledger)
- Make sidebar collapsible to icon-only on narrow viewports
- Add "dock AI panel" toggle for split-screen work

### 3.2 Navigation — B

**Strengths:**
- 19 tabs organized into two groups with clear section labels
- Active state uses strong contrast (zinc-900 / text-white)
- Badge counts (unverified, open risks, live experiments) provide at-a-glance status
- Command palette (⌘K) covers global search

**Weaknesses:**
- No visual indication of unsaved changes or dirty state in tabs
- Badges use raw text counts without color-coded severity (all amber for alerts)
- Tab labels are truncated but no tooltip on hover
- Mobile: sidebar is fixed width with no hamburger/drawer pattern

**Recommendations:**
- Add tooltip (title attribute) to truncated nav items
- Differentiate alert badge colors by severity (amber = warning, rose = critical)
- Add mobile drawer toggle for sidebar
- Add "recent" or "pinned" tabs for quick switching

### 3.3 Forms & Inputs — C+

**Strengths:**
- Consistent input styling across pages (bordered, rounded, dark mode support)
- NewProjectModal is a thorough 5-step wizard with progress
- AI autofill buttons reduce cognitive load

**Weaknesses:**
- No visible label/fieldset association pattern audit — some inputs may lack proper `<label>` elements
- Error states use `role="alert"` (good) but no consistent form validation UI pattern
- No inline character counters for long text areas (problem statement, success definition)
- Select dropdowns (project selector, stage, frequency) have minimal styling differentiation
- No "required" indicator (asterisk) on mandatory fields
- Loading states on form submissions are basic (console.error only in NewProjectModal)

**Recommendations:**
- Audit all inputs for explicit `<label>` + `htmlFor` association
- Add required field indicators
- Add inline validation with `aria-invalid` and error message association
- Add character counters to long text areas
- Add loading spinners on submit buttons during AI autofill

### 3.4 Modals & Overlays — B+

**Strengths:**
- All modals use `useFocusTrap` hook (keyboard accessible)
- Backdrop blur overlays (`bg-black/50 backdrop-blur-xs`)
- Consistent close button (X icon, `tabIndex={-1}`)
- Escape key closes overlays
- Focus returns to trigger on close

**Weaknesses:**
- No modal size variants — all modals use similar sizing
- SettingsModal (695 lines) is monolithic — should be split into sub-components per tab
- No modal animation (slide/fade) — instant appearance/disappearance
- No "don't show again" or preference persistence for modal state

**Recommendations:**
- Split SettingsModal into tab sub-components (AIProvidersTab, PrivacyTab, etc.)
- Add subtle scale/fade entrance animation (respecting reduced-motion)
- Add modal size variants (sm/md/lg/xl) based on content

### 3.5 Cards & Content Containers — B

**Strengths:**
- Consistent card pattern: `bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-xs`
- Shadow hierarchy: `shadow-xs` (cards), `shadow-lg` (modals), `shadow-2xs` (buttons)
- Stat tiles use color-coded backgrounds (emerald/amber/rose/zinc variants)

**Weaknesses:**
- Card padding inconsistent (p-4 vs p-5 vs p-3.5)
- No card elevation variants (hover lift, pressed state)
- Content containers lack section dividers — dense pages feel like "wall of text"
- No aspect-ratio handling for images/media (future-proofing)

**Recommendations:**
- Standardize card padding (p-4 default, p-5 for primary cards)
- Add hover lift (`hover:-translate-y-0.5`) on interactive cards
- Add section divider component (`<hr>` styled) for dense pages

### 3.6 Typography & Hierarchy — B

**Strengths:**
- Consistent type scale: `text-[10px]` captions, `text-xs` labels, `text-sm` body, `text-xl` headings
- Font weights: `font-semibold` (headings), `font-medium` (labels), `font-normal` (body)
- Dark mode text contrast is well-considered (zinc-900/100 pairing)

**Weaknesses:**
- No heading hierarchy enforcement (h1 vs h2 vs h3 usage is inconsistent across pages)
- Some text is `text-[11px]` — below comfortable reading size for body content (okay for captions)
- No line-height scale defined — relies on Tailwind defaults
- Page titles are `text-xl` — could be more prominent for a founder tool

**Recommendations:**
- Document heading hierarchy (h1 = page title, h2 = section, h3 = subsection)
- Increase page title to `text-2xl` with `font-bold`
- Add `leading-relaxed` to body text for readability
- Define a type scale in documentation

### 3.7 Color & Semantics — B+

**Strengths:**
- Clear semantic color mapping (emerald = success, amber = warning, rose = danger)
- Dark mode variants are well-applied throughout
- Badge/pill colors provide at-a-glance status

**Weaknesses:**
- Color is sometimes the only carrier of meaning (e.g., phase dots use color without text label for pending state)
- No documented color token system — changing a color requires find-and-replace across components
- No high-contrast mode consideration beyond dark/light toggle

**Recommendations:**
- Document the color semantics in `docs/design/brand.md`
- Add text labels alongside color-coded status indicators (redundant encoding)
- Consider a `docs/design/tokens.md` for color/spacing/shadow tokens

### 3.8 Icons & Imagery — B

**Strengths:**
- Consistent use of `lucide-react` icons throughout
- Icon sizes are consistent (`w-4 h-4` standard, `w-3.5 h-3.5` compact)
- Brand mark (Compass icon) in Navbar

**Weaknesses:**
- No icon size scale documented
- No custom illustrations or brand imagery beyond the logo
- SVG icons lack `aria-hidden="true"` on decorative icons (accessibility gap)

**Recommendations:**
- Add `aria-hidden="true"` to decorative icons
- Document icon size scale (sm: w-3.5, md: w-4, lg: w-5)
- Consider adding simple illustrations for empty states

### 3.9 Buttons & Interactions — B

**Strengths:**
- Consistent button pattern: `px-3 py-2 text-xs font-semibold rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800`
- Primary actions use color variants (amber for AI, emerald for positive)
- Disabled state: `disabled:opacity-40 disabled:cursor-not-allowed`
- Shadow on AI toggle button (`shadow-sm`) makes it feel pressed/active

**Weaknesses:**
- No button size variants (sm/md/lg)
- No loading state on buttons (spinner + disabled during async)
- No active/pressed state (`:active` transform)
- Link buttons (underline) vs action buttons not visually distinct enough

**Recommendations:**
- Add button size variants
- Add loading state pattern (spinner inside button + disabled)
- Add `:active scale-95` for tactile feedback
- Distinguish primary (filled) vs secondary (outline) vs ghost (text-only) buttons

### 3.10 Feedback States — C

**Strengths:**
- Error boundary with crash UI and report button
- `role="alert"` on inline form errors (announced to screen readers)
- Synthetic demo banner (amber) sets expectations
- Empty states with italic placeholder text

**Weaknesses:**
- No toast/notification system — status messages appear inline only
- Loading states are minimal (spinners on AI panel only)
- No success confirmation toasts (e.g., "Project saved")
- No skeleton loading states — content pops in
- Error messages are plain text without actionable recovery suggestions

**Recommendations:**
- Add toast notification system (top-right, auto-dismiss, actionable)
- Add skeleton loaders for list pages while data fetches from IndexedDB
- Add success toasts for save/import/export operations
- Add actionable error messages ("Fix this by...")

### 3.11 Accessibility — B (foundations done, QC pending)

**Strengths:**
- `:focus-visible` outline guarantee in `src/index.css`
- `prefers-reduced-motion` support
- `role="alert"` on inline form errors
- All modals use `useFocusTrap`
- Escape closes overlays
- Dark mode respects OS preference
- 24×24 touch targets on primary chrome (fixed in R-047)

**Weaknesses:**
- Human keyboard/screen-reader QC pass completed but not yet automated
- Decorative icons lack `aria-hidden="true"`
- No skip-to-content link
- No ARIA live regions for dynamic content (risk score updates, experiment status changes)
- Color contrast not measured against WCAG 2.2 AA
- Form fields may lack explicit label associations

**Recommendations:**
- Complete automated axe scan CI job (placeholder exists in `.github/workflows/a11y.yml`)
- Add `aria-hidden="true"` to decorative icons
- Add skip-to-content link
- Add ARIA live regions for status updates
- Measure contrast ratios against WCAG 2.2 AA

### 3.12 Responsive Design — C+

**Strengths:**
- Responsive breakpoints used (`sm:`, `md:`, `lg:`)
- Dashboard grid adapts (`grid-cols-1 md:grid-cols-3`)
- Navbar hides project selector on mobile (`hidden sm:inline-block`)

**Weaknesses:**
- Sidebar is fixed `w-64` — no mobile drawer/hamburger
- No mobile-specific layout for canvas or complex tables
- Command palette is `hidden md:flex` — no mobile search alternative
- Touch targets on dense pages (canvas, roadmap) not audited on mobile

**Recommendations:**
- Add mobile drawer for sidebar (hamburger menu)
- Add mobile search alternative to command palette
- Audit canvas/roadmap touch targets on mobile
- Test at 320px–375px widths

### 3.13 Canvas — Special Case — B

**Strengths:**
- Keyboard navigable (arrow keys, Tab, Enter/Space, Delete)
- Spatial navigation with lateral drift penalty
- Node labels and edge labels
- Node/edge colors by type

**Weaknesses:**
- No zoom/pan controls visible (keyboard only)
- Node size is fixed — no content-based sizing
- No node grouping/clustering
- No export to image (only JSON via workspace export)
- Canvas empty state is minimal

**Recommendations:**
- Add zoom slider and pan reset button
- Add node grouping by type/color
- Add canvas empty state with "Add your first node" guidance
- Add image export (PNG/SVG) option

---

## 4. Critical Issues (Needs Attention Before v1.0.0)

| # | Issue | Severity | Location |
|---|---|---|---|
| 1 | No automated accessibility scan in CI (axe placeholder exists but not wired) | High | `.github/workflows/a11y.yml` |
| 2 | Human QC pass completed but results not yet merged to main | High | `docs/qc/manual-qc.md` |
| 3 | Decorative icons lack `aria-hidden="true"` | Medium | All components |
| 4 | Form fields may lack explicit `<label>` associations | Medium | All form pages |
| 5 | No skip-to-content link | Medium | `src/App.tsx` |
| 6 | No toast/notification system | Medium | All pages |
| 7 | No mobile drawer for sidebar | Medium | `src/components/layout/Sidebar.tsx` |
| 8 | Color contrast not measured against WCAG 2.2 AA | Medium | All components |
| 9 | SettingsModal monolithic (695 lines) — maintainability risk | Low | `src/components/modals/SettingsModal.tsx` |
| 10 | No design token documentation | Low | `docs/design/` |

---

## 5. Improvement Plan

### Phase 1 — Accessibility & Compliance (Immediate, v0.2.0+)

**Goal:** Lock in WCAG 2.2 AA foundations before v1.0.0.

| Task | Effort | Priority |
|---|---|---|
| Wire up real axe-core Playwright scan in CI (replace placeholder) | 1 day | P0 |
| Add `aria-hidden="true"` to decorative icons | 0.5 day | P0 |
| Add skip-to-content link | 0.25 day | P0 |
| Add explicit `<label>` associations to all form inputs | 1 day | P0 |
| Measure and document contrast ratios | 0.5 day | P0 |
| Complete human keyboard/screen-reader QC sign-off | 0.5 day | P0 |

### Phase 2 — Design System Foundation (v0.3.0)

**Goal:** Establish reusable patterns so UI changes are consistent and fast.

| Task | Effort | Priority |
|---|---|---|
| Create `docs/design/tokens.md` (color, spacing, shadow, type scale) | 0.5 day | P1 |
| Create shared `Button` component (primary/secondary/ghost, sm/md/lg) | 1 day | P1 |
| Create shared `Card` component (consistent padding, hover lift) | 0.5 day | P1 |
| Create shared `Input` + `FormField` with label + error states | 1 day | P1 |
| Create shared `Badge` component (semantic colors) | 0.25 day | P1 |
| Split SettingsModal into tab sub-components | 1 day | P1 |

### Phase 3 — Interaction Polish (v0.4.0)

**Goal:** Make the app feel responsive and delightful.

| Task | Effort | Priority |
|---|---|---|
| Add toast notification system | 1 day | P1 |
| Add skeleton loaders for list pages | 0.5 day | P2 |
| Add loading states on async buttons (spinner + disabled) | 0.5 day | P2 |
| Add `:active` pressed state on buttons | 0.25 day | P2 |
| Add modal entrance animation (scale/fade, respects reduced-motion) | 0.5 day | P2 |
| Add section divider component | 0.25 day | P2 |

### Phase 4 — Responsive & Mobile (v0.5.0)

**Goal:** Make the app usable on tablets and phones.

| Task | Effort | Priority |
|---|---|---|
| Add mobile drawer/hamburger for sidebar | 1 day | P1 |
| Add mobile search alternative to command palette | 0.5 day | P2 |
| Audit canvas/roadmap touch targets on mobile | 0.5 day | P2 |
| Test at 320px–375px widths | 0.5 day | P2 |

### Phase 5 — Canvas Enhancement (v0.6.0)

**Goal:** Make the canvas a first-class visual tool.

| Task | Effort | Priority |
|---|---|---|
| Add zoom slider + pan reset button | 1 day | P2 |
| Add node grouping by type | 0.5 day | P2 |
| Add canvas empty state guidance | 0.25 day | P2 |
| Add image export (PNG/SVG) | 1 day | P3 |

### Phase 6 — Polish & Delight (v1.0.0+)

**Goal:** Ship a polished, founder-ready product.

| Task | Effort | Priority |
|---|---|---|
| Add illustrations for empty states | 1 day | P3 |
| Add page headers with breadcrumbs | 0.5 day | P3 |
| Add "dock AI panel" split mode | 1 day | P3 |
| Add recent/pinned tabs | 0.5 day | P3 |
| Character counters on long text areas | 0.25 day | P3 |

---

## 6. Design System Recommendations

### 6.1 Color Tokens (proposed)

```
--color-neutral-50:  zinc-50    (light bg)
--color-neutral-950: zinc-950   (dark bg)
--color-success:     emerald-500
--color-warning:     amber-500
--color-danger:      rose-500
--color-info:        indigo-500
--color-accent-ai:   amber-400
```

### 6.2 Type Scale (proposed)

| Use | Size | Weight | Leading |
|---|---|---|---|
| Page title | `text-2xl` | `font-bold` | `leading-tight` |
| Section heading | `text-xl` | `font-semibold` | `leading-snug` |
| Subsection | `text-lg` | `font-medium` | `leading-normal` |
| Body | `text-sm` | `font-normal` | `leading-relaxed` |
| Caption | `text-xs` | `font-medium` | `leading-normal` |
| Micro-copy | `text-[10px]` | `font-medium` | `leading-none` |

### 6.3 Spacing Scale (proposed)

Use Tailwind's default spacing (0.25rem increments) consistently:
- Card padding: `p-4` (default), `p-5` (primary), `p-3` (compact)
- Gap: `gap-4` (sections), `gap-2` (tight), `gap-6` (loose)
- Border radius: `rounded-lg` (cards), `rounded-xl` (modals), `rounded-full` (pills)

---

## 7. Success Metrics

- [ ] WCAG 2.2 AA contrast compliance on all text
- [ ] 100% keyboard navigability (verified by human QC)
- [ ] Zero critical accessibility violations in CI axe scan
- [ ] Consistent component usage (Button, Card, Input shared across all pages)
- [ ] Mobile-usable at 320px+ width
- [ ] Toast notifications for all save/import/export operations

---

## 8. Next Immediate Actions

1. **Replace axe placeholder** in `.github/workflows/a11y.yml` with real `@axe-core/playwright` + Playwright config + `bun.lock` update
2. **Create `docs/design/tokens.md`** documenting color, spacing, type scale
3. **Build shared `Button` + `Card` + `Input` components** in `src/components/ui/`
4. **Split `SettingsModal`** into tab sub-components
5. **Add `aria-hidden="true"`** to decorative icons across all components
6. **Add skip-to-content link** in `src/App.tsx`
