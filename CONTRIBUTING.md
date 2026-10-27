# Contributing

Thanks for looking at OpenFounder. This file states the licence terms for contributions and how
to work on the repository.

## Licence terms for pull requests

By submitting a pull request, you agree that your contribution is licensed under the same terms
as the project: **MIT OR Apache-2.0**, at the user's choice (see `LICENSE-MIT` and
`LICENSE-APACHE`). You also confirm that you have the right to submit the work under those terms.

If you need a different arrangement, say so in the pull request before it is merged.

## How to work on this repository

1. Open an issue describing the change, or state the intent in the pull request.
2. Branch from `main`. Keep each pull request to one bounded slice.
3. Add or update tests for behaviour changes. Pure rules live in `src/utils/` and `src/db/`
   and are unit-tested without a browser.
4. Verification is CI. Heavy builds never run on this machine: use `~/.config/opencode/scripts/ci.sh run "<what changed>"` to commit, push, and wait for GitHub Actions.
   Contributors on other machines run their own CI; never require contributors to run costly builds locally.
5. Update tracking files in the same pull request: `REQUIREMENTS_TRACEABILITY.md`,
   `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`, `ROADMAP.md`, and `docs/parity.md`.
6. Fill in the pull request template honestly, including the "Local verification" section.

### Filing a bug

Use the Bug report issue template. Include app version from Settings, steps to reproduce, expected vs actual, environment, and a preview from the in-app bug reporter if you used it. Security issues follow SECURITY.md, not public issues.

### Proposing a feature

Use the Feature request template and check it against `VISION.md` and `docs/scope.md`. Features that require proprietary assets or fake capability will be declined.

### Setting up

```bash
git clone https://github.com/Perchemop/OpenFounder.git
cd OpenFounder
bun install
```
Run the app with `bun run dev:vite`. No backend is required for development.

### Running the checks locally

```bash
bun run lint        # TypeScript type check
bun run test        # Vitest unit suite
bun run build:static  # production static build
```

These are the same commands CI runs, so please run them before opening a pull request.

**On this project's maintenance setup specifically:** the maintainer's laptop is
memory-constrained and restarts under load, so the maintainer runs builds and tests in GitHub
Actions (via `~/.config/opencode/scripts/ci.sh`) and treats the CI result as authoritative. That
restriction applies to *this* machine only — contributors are expected and encouraged to run the
commands above locally, and a local green run is a normal part of the workflow for everyone else.

The end-to-end accessibility scan needs Playwright browsers; `bunx playwright install chromium`
once, then `bunx playwright test tests/a11y.spec.ts tests/visual.spec.ts` with the app served on
`http://localhost:4173`.

### Expectations and tone

- Discuss in the issue before large changes.
- Review feedback with kindness, and give kind review.
- Decisions are recorded; see `DECISIONS.md`, `GOVERNANCE.md`, and `CODE_OF_CONDUCT.md`.
- The maintainer aims to respond to non-security issues within 7 days and to accessibility reports with priority.

## Clean-room rules

Contributions must not include proprietary source, assets, or substantial copied text, and must
not reproduce third-party trademarks or visual identity. Research notes belong in
`docs/research/` as original behavioural summaries with URLs, and require explicit human approval
before dependent feature work.

## Developer Certificate of Origin

Signed-off-by is welcome but not required. The project uses inbound = outbound with the MIT OR Apache-2.0 licence; no CLA is required.

## Definition of done

A change is done when it has real behaviour, tests, a green CI run, updated tracking files, and
no fake success states. Pull requests claiming a capability that does not exist will be rejected.

## Secrets

Never commit API keys, tokens, or credentials. GitHub secret scanning and `gitleaks` are
recommended for local pre-commit checks.
