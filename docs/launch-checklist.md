# Launch Checklist (pre-launch requirements §25.1)

This checklist maps the guide's pre-launch requirements to evidence and owner.

## Repository and process

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| CODE_OF_CONDUCT.md present | File exists | Done | Maintainer |
| SECURITY.md present | File exists | Done | Maintainer |
| ACCESSIBILITY.md present | File exists | Done | Maintainer |
| VISION.md present | File exists | Done | Maintainer |
| GOVERNANCE.md present | File exists | Done | Maintainer |
| CONTRIBUTORS.md present | File exists | Done | Maintainer |
| CITATION.cff present | File exists | Done | Maintainer |
| Issue templates for bug, feature, accessibility | .github/ISSUE_TEMPLATE/* | Done | Maintainer |
| PR template with accessibility checklist | .github/pull_request_template.md | Done | Maintainer |
| Labels: bug, user-report, accessibility, good first issue, help wanted, documentation, security | GitHub labels | Done | Maintainer |
| Response expectations documented in README/CONTRIBUTING | README Contributing section | Done | Maintainer |
| CONTRIBUTING.md covers bug/feature/setup/tests/tone | CONTRIBUTING.md | Done | Maintainer |
| ATTRIBUTION.md updated for non-code assets + AI terms | ATTRIBUTION.md | Done | Maintainer |

## Security and CI

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| SAST in CI (CodeQL) | .github/workflows/codeql.yml | Done | Maintainer |
| Secret scanning in CI (gitleaks) | ci.yml job | Done | Maintainer |
| Dependency review on PRs | dependency-review-action (pinned `v4.9.0`); advisory until Dependency graph is enabled | Advisory | Human |
| SBOM generated and licence-class gate | CI job + release.yml | Done | Maintainer |
| Dependabot configured | .github/dependabot.yml | Done | Maintainer |
| Action SHAs pinned | All six workflows pinned; enforced by the `action pinning` CI job | Done | Maintainer |
| Toolchain pinned | Bun pinned to `1.4.4` in every workflow | Done | Maintainer |
| Branch protection + required checks | Repo settings | Human action required | Human |
| Two administrators | Repo settings | Human action required | Human |
| MFA on owner account | Account settings | Human action required | Human |
| Private vulnerability reporting enabled | Repo settings | Human action required | Human |
| Secret scanning + push protection enabled | Repo settings | Human action required | Human |

## Accessibility

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| prefers-reduced-motion respected | src/index.css | Done | Maintainer |
| Focus visible | src/index.css | Done | Maintainer |
| Inline errors use role="alert" | Goals/Advisors/Team pages | Done | Maintainer |
| Touch targets ≥24px on primary chrome | Code changes | Done | Maintainer |
| Automated a11y scanning in CI | `.github/workflows/a11y.yml` (Playwright + axe-core) | Done | Maintainer |
| Human keyboard and screen-reader pass | docs/qc/manual-qc.md | Done | Human |

## Legal / community

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| Licence scanning + SBOM in CI | CI job | Done | Maintainer |
| No fake functionality | PROGRESS.md + ROADMAP | Done | Maintainer |
| Legal checklist per release | ATTRIBUTION.md, docs | Done | Maintainer |
| Name conflict check recorded | docs/product-name.md | Done | Maintainer |
| Handles/domains reserved | n/a | Human action required | Human |

## Release

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| v0.2.0 tagged and released | GitHub Release v0.2.0 | Done | Maintainer |
| CHANGELOG entry for 0.2.0 | CHANGELOG.md | Done | Maintainer |
| Release notes honest, no hype | Release page | Done | Maintainer |
| Example project included in release artefacts | `assets/example-project-tradepulse.json`, release.yml | Done | Maintainer |

## Human action commands

The following GitHub settings require owner approval. The commands below are documented for the owner to run; attempts via the current API token failed with validation errors, so they are left as human actions.

## Owner steps — numbered click path (preferred)

These settings live in the GitHub web UI and need repository-admin access. Do them in this order.

1. **Turn on Dependency graph** (this is why the `dependency review` check reports failure).
   Open `https://github.com/Perchemop/OpenFounder/settings/security_analysis` → under
   *Dependency graph* click **Enable**. Refresh the page; the “Dependency graph” badge changes
   from *Disabled* to *Enabled*.
2. **Turn on secret scanning and push protection** — same page, under *Secret scanning*:
   click **Enable** for *Secret scanning*, then **Enable** for *Push protection*.
   (Push protection blocks a commit containing a detected secret before it reaches the remote.)
3. **Turn on private vulnerability reporting** — same page, under *Private vulnerability
   reporting*, click **Enable**. `SECURITY.md` already points reporters at this route.
4. **Require checks on `main`** — open
   `https://github.com/Perchemop/OpenFounder/settings/branches`, click **Add branch protection
   rule** (or edit the existing rule for `main`), then:
   - tick **Require a pull request before merging** (1 approval);
   - tick **Require status checks to pass before merging**, then **Require branches to be up to
     date**, and select these checks by name:
     `verify (ubuntu-latest)`, `verify (macos-latest)`, `verify (windows-latest)`,
     `build (static)`, `summary`, `gitleaks`, `sbom`, `action pinning`;
   - tick **Do not allow bypassing the above settings** so the rule applies to admins too;
   - click **Create**/**Save changes**.
   Note: the check names only appear in the picker after each has run at least once on a PR —
   all eight have, so they should be listed.
5. **Add a second administrator** — open
   `https://github.com/Perchemop/OpenFounder/settings/access` → **Add people** → set the person’s
   role to **Admin** → **Add**. A second admin is the recovery path if the owner account loses
   access.
6. **Require two-factor authentication** — open
   `https://github.com/settings/security` → *Two-factor authentication* → **Enable 2FA**. To force
   it for the organisation/account, use *Settings → Organizations* or the account-wide setting
   your plan exposes.
7. **Confirm it worked** — reply in the session (or paste the output) after running:
   `gh api repos/Perchemop/OpenFounder --jq '.security_and_analysis'` and
   `gh api repos/Perchemop/OpenFounder/branches/main/protection --jq '.required_status_checks.contexts'`.
   The first should show secret scanning and push protection `enabled`; the second should list the
   eight checks.

If a step is refused by GitHub (for example a plan limitation on private repositories), stop and
tell me which step failed with the message shown — I will adjust the checklist rather than guess.

### Branch protection

```bash
gh api repos/Perchemop/OpenFounder/branches/main/protection \
  -X PUT \
  -F required_status_checks='{"strict":true,"contexts":["verify (ubuntu-latest)","verify (macos-latest)","verify (windows-latest)","build (static)","summary","gitleaks","sbom"]}' \
  -F enforce_admins=true \
  -F required_pull_request_reviews='{"required_approving_review_count":1}'
```

### Private vulnerability reporting

```bash
gh api repos/Perchemop/OpenFounder -X PATCH -f private_vulnerability_reporting='{"enabled":true}'
```

### Secret scanning & push protection

Enable via repository Settings → Security → Secret scanning. The REST API currently returns 422 for `security_and_analysis` updates with the current token scope.

### Two administrators / MFA

* Add a second admin in Settings → Manage access
* Enforce MFA on the owner account in GitHub Settings → Password and authentication

### Status of these owner actions (2026-10-26)

Still unconfigured: Dependency graph, secret scanning + push protection, private vulnerability
reporting, branch protection with required checks, second administrator, MFA. The numbered click
path above is the current instruction; `gh api` attempts from this agent fail (422) because the
available token is not repository-admin scoped.

Last updated: 2026-10-26
