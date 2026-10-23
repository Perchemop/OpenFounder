# Progress Log

Newest first. Only claim what is recorded and verified. CI result is authoritative.

## 2026-10-23 — Foundation and evidence integrity

**Mode:** Task (execution). **Verifier:** GitHub Actions via `ci.sh`.

### Done in this session

- Read the updated `guide.md` and adopted its operating model (Chat → Task → PR; CI-only heavy work).
- Audited the repository: 66 tracked files, 12k lines of TS/TSX, no `docs/`, no PR CI, and a Pages
  workflow that could not install dependencies (`npm ci` without `package-lock.json`).
- Added the documentation and tracking baseline required by guide §6 and §11.
- Replaced the contradictory "all rights reserved" README licence note with MIT.
- Added PR CI: Bun frozen install, type check, Vitest, and static build; lint + tests on three OSes.
- Repaired the Pages deploy workflow to use Bun.
- Added repository agent role definitions.
- Implemented the evidence-integrity rule and wired it into the Evidence page.

### Verification

- CI result: **pending** — the first run is triggered by this pull request. This line is updated
  with the exact outcome after the run; do not treat the slice as verified before then.

### Known gaps

- Dashboard does not yet show the evidence-integrity score (R-031).
- Command palette does not search research/interviews/risks/roadmap (R-029).
- Manual QC checklist not yet executed (R-030).

## 2026-10-10 — Prior work (from git history)

Risk register UI and dashboard snapshot, configurable AI model lists with temperature and max
tokens, provider extraction, and expanded unit tests. Recorded here from commit messages; these
were not re-verified in this session beyond the current CI run.
