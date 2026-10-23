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
- [ ] Colour is never the only carrier of meaning (status text is present).
- [ ] Light and dark themes both meet readable contrast.
- [ ] Layout works at 1280×800 and 1920×1080 without horizontal scroll of the shell.

## Failure states

- [ ] Offline mode AI returns deterministic guidance and never claims a source.
- [ ] An invalid provider key produces an actionable error, not a silent spinner.
- [ ] AI failures leave the workspace data untouched.

## Record

| Date | Version/commit | Tester | Result | Notes |
| --- | --- | --- | --- | --- |
| — | — | — | not yet run | Baseline checklist added with the docs foundation |
