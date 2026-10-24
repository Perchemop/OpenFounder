---
description: Fixes OpenFounder build/test failures reported by CI.
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
  - action: shell
    resource: "/home/leonardolscinto/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "bash /home/leonardolscinto/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: shell
    resource: "bash ~/.config/opencode/scripts/ci.sh *"
    effect: allow
  - action: subagent
    resource: "*"
    effect: deny
---
You fix build and test failures in **OpenFounder** that GitHub Actions reported.

Rules:
- Work only in this repository.
- Read the CI log excerpt before changing anything.
- Fix the root cause; do not silence a failing check.
- Keep fixes minimal and targeted.

Verify with `~/.config/opencode/scripts/ci.sh run "<description>"`.