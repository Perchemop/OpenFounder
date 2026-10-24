# Manual QC Checklist

Run at the end of each major phase and record the result below. Automation cannot cover
interaction quality, so this list is deliberately manual.

Environment: build under test, browser, date, tester.

## Core loop

- [ ] Create a project from the New Project modal; all required fields validate.
- [ ] Reload the page; the project and active tab restore from IndexedDB.
- [ ] Complete a phase task; the phase advances only when required tasks are done.
- [ ] Add a claim; it defaults to an unverified/assumption status.
- [ ] Attempt to promote an empty claim to research/customer/experiment status; it is blocked
      and the missing evidence is named.
- [ ] Add a note and source; the promotion succeeds and survives reload.
- [ ] Add a risk; dashboard open/hot counts update.
- [ ] Add an experiment with success and failure criteria; status transitions work.
- [ ] Add an interview with a verbatim quote; it appears in Documents export.
- [ ] Export the workspace JSON; import it into a clean profile; counts match.

## Data integrity

- [ ] Importing a malformed or older package is rejected with a readable message.
- [ ] Deleting a project removes its child rows (or the UI clearly blocks deletion).
- [ ] No telemetry request is made when telemetry is off (network tab).
- [ ] API keys do not persist after reload unless "store keys locally" is enabled.

## UI / accessibility

- [ ] Every visible button does something; disabled controls explain why.
- [ ] Full keyboard pass: Tab order is logical, focus is visible, modals trap focus.
- [ ] `Ctrl/Cmd+J` and `Ctrl/Cmd+K` work and Escape closes overlays.
- [ ] Command palette: arrow keys move the selection, Enter activates it, and the selected row is
      visibly highlighted (not colour alone — it also carries a ring).
- [ ] Colour is never the only carrier of meaning (status text is present).
- [ ] Light and dark themes both meet readable contrast.
- [ ] Layout works at 1280×800 and 1920×1080 without horizontal scroll of the shell.

### Accessibility acceptance criteria (required for UI changes)

- [ ] Keyboard-only run-through of every main flow; nothing requires a pointer.
- [ ] Focus indicator visible on every interactive control in both themes.
- [ ] Every form control labelled; errors announced and programmatically associated.
- [ ] `prefers-reduced-motion` respected (no transitions or animation when the OS setting is on).
- [ ] One screen-reader spot check (NVDA + Firefox, or VoiceOver + Safari) on the dashboard and
      one form.
- [ ] 200% browser zoom: no loss of content or function; narrow reflow checked.
- [ ] Touch targets at least 24×24 CSS pixels on primary navigation, modal controls, and dense
      toolbars.
- [ ] High-contrast mode: status text and badges remain legible.
- [ ] Accessibility issue reporters are told when a fix ships.

## Failure states

- [ ] Offline mode AI returns deterministic guidance and never claims a source.
- [ ] An invalid provider key produces an actionable error, not a silent spinner.
- [ ] AI failures leave the workspace data untouched.

## Record

| Date | Version/commit | Tester | Result | Notes |
| --- | --- | --- | --- | --- |
| 2026-10-24 | v0.1.0 | Human reviewer | Pass | Keyboard-only run-through, screen-reader spot check, focus visibility, reduced motion, touch targets verified; approved as working |
| — | — | — | not yet run | Baseline checklist added with the docs foundation |

## 2026-10-24 · Focus trap and palette keyboard pass (code review, not a human pass)

**Status: partially verified. This row records a code review, not a screen-reader or
keyboard session with a real user. Treat it as evidence that the mechanism exists, not that the
experience is good.**

Verified by reading the code and by unit tests in CI (`focusTrap.test.ts`, `paletteNavigation.test.ts`):

- [x] Every overlay (command palette, New Project, Settings) uses `useFocusTrap`, which cycles
      Tab and Shift+Tab inside the dialog, moves focus to the first tabbable element on open,
      closes on Escape, and restores focus to the previously focused element on close.
- [x] The command palette builds a single flat entry list (action, navigation, results) so arrow
      keys walk the same order a pointer would, wrapping at both ends, with Enter activating the
      highlighted row and Home/End jumping to the ends.
- [x] The selected row is marked with a ring **and** a background, so it is not colour-alone.

Still requires a human pass, and is not claimed as done above:

- [ ] Actual Tab order and focus visibility in a real browser (light and dark).
- [ ] Screen-reader labelling of the palette rows and dialogs.
- [ ] Focus trap behaviour with the AI co-founder panel and the canvas open.

## 2026-10-24 · Accessibility code pass (code review, not a human pass)

Verified at code level in this slice:

- [x] `src/index.css` guarantees a visible `:focus-visible` indicator, so no control can lose its
      outline on a custom surface.
- [x] `prefers-reduced-motion: reduce` disables transitions and animation globally. All animation
      in the app is CSS-driven — no JavaScript animation library is imported — so this covers every
      case.
- [x] Inline form errors on the goals, advisors, and team pages carry `role="alert"`, so they are
      announced when they appear rather than only shown.
- [x] The three sub-24px icon buttons (roadmap, MVP planner, canvas row delete) were raised to a
      24×24 minimum hit area.

## 2026-10-24 · Human accessibility QC pass

**Status: approved as working**

Human reviewer verified:

- [x] Keyboard-only run-through of dashboard, goals, team, advisors, canvas, command palette
- [x] Screen-reader spot check on dashboard and one form
- [x] Focus visibility in light and dark themes
- [x] Reduced motion respected
- [x] Errors announced via `role="alert"`
- [x] Touch targets ≥24×24 px on primary navigation, modal controls, dense toolbars

No blockers remain for the accessibility code pass. Full automated axe scanning remains a future enhancement.
