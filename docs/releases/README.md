# Release Records

One file per published release: `vX.Y.Z.md`. Each file is the evidence that the guide's legal
checklist (Part I §2.5, deepened by §II.19.5) was run *before* the release was cut, and links the
release back to the CI run that produced its artefacts.

A release is not cut until every row of the checklist in that file is filled in and the CI run is
named. The checklist is the guide's §2.5 table verbatim in intent; if a row cannot be evidenced,
it is marked **not evidenced** with the reason rather than left blank or invented.

Format:

```markdown
# vX.Y.Z — YYYY-MM-DD

- Release: <url>
- Tag CI run: <run id / url> (workflow: Release)
- Assets: <list with sizes/checksums file>
- Checksums verified: <command and result>

## §2.5 legal checklist

| Area | Check | Result | Evidence |
| --- | --- | --- | --- |
| ... | ... | pass / not evidenced | ... |

## Notes / limitations
```

Related: `CHANGELOG.md` carries the user-facing notes; `PROGRESS.md` records the session that cut
the release.
