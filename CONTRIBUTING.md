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
4. Run CI, not a local build: `~/.config/opencode/scripts/ci.sh run "<what changed>"` is the
   verification entry point. The repository never requires a local full build.
5. Update tracking files in the same pull request: `REQUIREMENTS_TRACEABILITY.md`,
   `IMPLEMENTATION_PLAN.md`, `CHANGELOG.md`, `ROADMAP.md`, and `docs/parity.md`.
6. Fill in the pull request template honestly, including the "Local verification" section.

## Clean-room rules

Contributions must not include proprietary source, assets, or substantial copied text, and must
not reproduce third-party trademarks or visual identity. Research notes belong in
`docs/research/` as original behavioural summaries with URLs, and require explicit human approval
before dependent feature work.

## Definition of done

A change is done when it has real behaviour, tests, a green CI run, updated tracking files, and
no fake success states. Pull requests claiming a capability that does not exist will be rejected.

## Secrets

Never commit API keys, tokens, or credentials. GitHub secret scanning and `gitleaks` are
recommended for local pre-commit checks.
