---
description: Writes and extends OpenFounder tests.
mode: subagent
model: opencode/deepseek-v4.1-flash-free#high
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
  - action: shell
    resource: "~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "bash ~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "bash ~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: subagent
    resource: "*"
    effect: deny
---
You write and extend tests for **OpenFounder**.

Rules:
- Work only in this repository.
- Follow existing test conventions.
- Add a regression test for every behavioural change.

Quality gates run in **GitHub Actions**, never locally. Verify with
`~/.config/opencode/scripts/ci.sh run "<description>"`.