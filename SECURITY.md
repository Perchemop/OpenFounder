# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a vulnerability.** Report it privately:

1. Use GitHub's **private vulnerability reporting** on this repository
   (Security → Report a vulnerability). This creates a private fork and a draft advisory that
   only the maintainer can see.
2. If private reporting is unavailable to you, use the "Report content" control on the relevant
   code or contact the maintainer via the repository owner's GitHub profile
   ([@Perchemop](https://github.com/Perchemop)) and ask for a private channel before disclosing
   details.

Please include: what you found, how to reproduce it, affected versions or URLs, and your
assessment of impact. If you have a proposed fix, say so — but do not open a public pull request
for it before the issue is triaged.

## What to expect

- **Acknowledgement within 7 days.**
- An assessment and a severity decision within 14 days of acknowledgement.
- A fix or mitigation for accepted issues in a patch release, coordinated with you before it is
  published.
- Credit in the release notes if you wish (you may stay anonymous).

## Scope and threat model

OpenFounder is a **static, local-first web application**. There is no server component, no
database, and no account system. This is what the project does and does not trust — use it to
judge what counts as a vulnerability here:

**In scope:**

- Anything that lets data leave the user's browser without explicit consent — the app's core
  promise is that project data stays local (IndexedDB) until the user exports it or configures
  an external AI provider.
- Injection in the app's own surface: rendered Markdown, generated documents, the report and
  dossier templates, or the AI co-founder output paths.
- Secrets handling: the app stores user-supplied API keys for optional external AI providers.
  Weak storage of those keys, keys leaking into exports, logs, or bug-report payloads are
  vulnerabilities. (Bug reports built by `src/bugReport.ts` must never contain user content or
  keys; that module also scrubs paths and ids before anything is shown to the user.)
- Supply-chain risk in the bundled static build: a vulnerability in a bundled dependency that is
  reachable at runtime.
- The release artefacts: anything that lets a tag produce an artefact that differs from the
  tagged source.

**Out of scope (by design, not by neglect):**

- The user's own browser profile and machine: if an attacker already has access to the user's
  IndexedDB, that is a compromised machine, not an OpenFounder vulnerability.
- Third-party AI providers the user configures: their APIs, their uptime, and their handling of
  prompts are governed by the user's relationship with those providers. The app never sends data
  to them unless the user configures the provider.
- GitHub Pages availability, and GitHub itself.
- The absence of authentication between the user and their own browser.

## Dependency and build posture

- Dependencies are kept within permissive licence classes and are recorded in `ATTRIBUTION.md`.
- CI runs secret scanning, static analysis (CodeQL), dependency review on pull requests, and
  generates an SBOM; see `.github/workflows/`.
- Release artefacts are built in CI from the tagged commit, with SHA-256 checksums; the
  published draft release is reviewed by the maintainer before it goes public.
- No privileged token is ever embedded in the client: bug reporting opens a pre-filled issue URL
  in the user's own GitHub session, and update checks call the public Releases API anonymously.

## Incident response

1. **Triage** — the maintainer (or a security subteam member, once one exists) confirms the
   report, reproduces it, and assigns a severity: Critical (data leaves the browser or remote
   code execution), High (secret exposure, injection), Medium (data integrity, broken isolation),
   Low (hardening, defence in depth).
2. **Mitigation** — a fix is prepared on a private branch if the issue is Critical or High;
   otherwise a normal pull request. Security fixes are verified by CI like any other change.
3. **Disclosure** — a patch release is published with the fix in its notes; the reporter is
   credited unless they prefer anonymity. Where downstream users are affected, the release
   notes state plainly which versions are affected and what to do.
4. **Record** — the advisory and its resolution are recorded via GitHub security advisories so
   the history is auditable.

## Still to do (maintainer account-level actions)

These are GitHub account/repository settings that only the repository owner can perform, and are
tracked in `docs/launch-checklist.md`: enabling private vulnerability reporting, verifying secret
scanning and push protection are on, enabling branch protection with required checks, and MFA on
the owner account.
