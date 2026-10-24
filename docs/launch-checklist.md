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
| Labels: bug, user-report, accessibility, good first issue, help wanted, documentation, security | GitHub labels | Pending | Human |
| Response expectations documented in README/CONTRIBUTING | README Contributing section | Done | Maintainer |
| CONTRIBUTING.md covers bug/feature/setup/tests/tone | CONTRIBUTING.md | Done | Maintainer |
| ATTRIBUTION.md updated for non-code assets + AI terms | ATTRIBUTION.md | Done | Maintainer |

## Security and CI

| Requirement | Evidence | Status | Owner |
|---|---|---|---|
| SAST in CI (CodeQL) | .github/workflows/codeql.yml | Done | Maintainer |
| Secret scanning in CI (gitleaks) | ci.yml job | Done | Maintainer |
| Dependency review on PRs | dependency-review-action | Done | Maintainer |
| SBOM generated and licence-class gate | CI job + release.yml | Done | Maintainer |
| Dependabot configured | .github/dependabot.yml | Done | Maintainer |
| Action SHAs pinned | All workflow actions pinned | Done | Maintainer |
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
| Automated a11y scanning in CI | n/a | Pending | Maintainer |
| Human keyboard and screen-reader pass | docs/qc/manual-qc.md | Pending | Human |

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

Last updated: 2026-10-25
