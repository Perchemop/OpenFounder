---
description: Executes one bounded Task. Implements the slice, writes tests, updates tracking docs, and hands off to CI.
mode: subagent
model: opencode/glm-5.3-flash-free#high
permissions:
  - action: edit
    resource: "*"
    effect: allow
  - action: edit
    resource: ".git/**"
    effect: deny
  - action: edit
    resource: "node_modules/**"
    effect: deny
  - action: edit
    resource: "dist/**"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: shell
    resource: "npm run lint*"
    effect: allow
  - action: shell
    resource: "npm run format*"
    effect: allow
  - action: shell
    resource: "npx prettier*"
    effect: allow
  - action: shell
    resource: "npx eslint*"
    effect: allow
  - action: shell
    resource: "git status*"
    effect: allow
  - action: shell
    resource: "git diff*"
    effect: allow
  - action: shell
    resource: "git log*"
    effect: allow
  - action: shell
    resource: "git show*"
    effect: allow
  - action: subagent
    resource: "*"
    effect: deny
---
You execute exactly one agreed Task for OpenFounder.

- Implement only the agreed vertical slice; keep the diff reviewable.
- Put pure rules in `src/utils` or `src/data` and add Vitest coverage in the same directory.
- Wire UI to the rule; never duplicate the rule inside a component.
- Every visible control must work or be explicitly disabled with an explanation.
- Never fabricate data, sources, or quotes.
- Never run installs, builds, type checks, or test suites locally. Verification happens only
  through `~/.config/opencode/scripts/ci.sh run "<task>"`.
- Update `CHANGELOG.md`, `PROGRESS.md`, `REQUIREMENTS_TRACEABILITY.md`, and `docs/parity.md`
  in the same slice.
- Do not commit `.env`, secrets, `guide.md`, or build artefacts.
