# Accessibility Statement

OpenFounder is a keyboard-first working tool, and accessibility is treated as functionality, not
polish: an unusable-for-some interface is a broken interface. Reports from people with
disabilities are expertise we need, not complaints.

## Target standard

**WCAG 2.2 level AA** where feasible for a static web application, with these priorities in order:

1. **Keyboard** — everything interactive is reachable and usable by keyboard alone, with a visible
   focus indicator and a logical tab order.
2. **Semantics** — native elements (`button`, `a`, `input`, `label`, `h1`–`h6`) over ARIA; "no
   ARIA is better than bad ARIA".
3. **Errors and labels** — every control labelled; errors announced and programmatically
   associated; required-ness stated in text.
4. **Colour** — meaning is never carried by colour alone; every status badge has a text label and
   progress measures carry a numeric value.
5. **Motion** — the OS "reduce motion" preference is respected; nothing flashes or auto-advances.

## What is implemented and verified

- Modal dialogs (`useFocusTrap`) trap Tab focus, close on Escape, and return focus on close.
- The canvas supports full keyboard operation: Tab reaches nodes in reading order, arrows select
  the nearest node in that direction, Enter/Space activate, Delete removes (`spatialNavigation`).
- The command palette is operable by keyboard with an explicit no-match state.
- Status is always text-plus-shape: the evidence ledger, risk register, and skills coverage all
  label states in words.
- `prefers-reduced-motion` disables transitions and animation globally (see
  `src/index.css`).
- This documentation set uses logical heading order and descriptive links.

## Known limitations (honest list)

- **Modal dialog semantics.** The four modals trap focus and close on Escape, but none declares
  `role="dialog"` / `aria-modal="true"` or an `aria-labelledby`, so assistive tech is not told
  that a dialog opened or that the rest of the page is inert (audit A11Y-01).
- **Contrast is unmeasured.** No contrast audit against WCAG 2.2 AA has been recorded for
  either theme; the token set in `docs/design/brand.md` is designed for it but is not yet proven
  by measurement (audit A11Y-03).
- **Scan coverage is narrow.** The automated axe scan (`.github/workflows/a11y.yml`,
  `tests/a11y.spec.ts`) runs `wcag2a`/`wcag2aa`/`section508` on only two states — the empty
  homepage and the demo dashboard — and only in light mode; the other 17 pages, the four modals,
  and dark mode are unscanned (audit A11Y-03).
- **The scan is not a gate.** `a11y.yml` runs only on pull requests to `main` and is not listed
  in `.ci-required.txt`, so a critical violation does not block a merge and `main` is not
  re-verified (audit A11Y-04, VER-02).
- **No live regions** for dynamic results: `aria-live` is not used, so risk-score, experiment
  status, toast-style confirmations, and chat replies are not announced (audit A11Y-02).
- **Touch targets:** several icon-only buttons in dense toolbars are smaller than the 24×24 CSS
  pixel minimum. Primary navigation, modal close buttons, and tab bars meet it; a full audit of
  every dense surface has not been done.
- **Drag-and-drop** on the canvas has keyboard alternatives (arrow navigation, Delete, and the
  palette), which is the workaround rather than a native reordering pattern.

## What is already verified

- **Automated scan in CI:** `.github/workflows/a11y.yml` runs `@axe-core/playwright`
  (`tests/a11y.spec.ts`, tags `wcag2a`/`wcag2aa`/`section508`) and fails on critical
  violations. It is not yet a required check (see above).
- **Human screen-reader pass:** recorded and approved as working on 2026-10-24 in
  `docs/qc/manual-qc.md` (keyboard-only run-through, screen-reader spot check, focus visibility
  in light/dark, reduced motion, announced errors, ≥24×24 touch targets).

## Supported environments

- **Web (primary):** current Chrome, Firefox, Edge, and Safari. This is the only supported
  surface today; there is no native app.
- **Screen readers:** NVDA + Firefox/Chrome and VoiceOver + Safari are the intended
  configurations; a human spot check was recorded and approved on 2026-10-24 (see
  `docs/qc/manual-qc.md`).
- **Zoom/reflow:** the layout is expected to work at 200% zoom; narrow-viewport reflow has not
  been systematically checked.

## How to report an accessibility problem

Use the **Accessibility issue template** (`.github/ISSUE_TEMPLATE/accessibility_report.yml`), or
from inside the running app: Settings → Integrity Audit → "Report a problem" — the preview shows
you exactly what will be sent. Accessibility reports are labelled `accessibility`, triaged ahead
of feature work, and the reporter is told when the fix ships. If a report is time-sensitive for
your work, say so in the report and it will be treated as high severity.
