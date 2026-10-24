# Research Notes

Original behavioural summaries of public products, used as capability inspiration. Each note is
a behavioural description with URLs — no scraped manuals, no screenshots, no verbatim marketing
copy, and no instruction to clone a vendor's interface.

## Human gate

The guide requires a human to approve research notes before implementation that depends on them.
Approvals are recorded here so the gate is auditable rather than assumed.

| Note | Reviewed by | Date | Decision | Implemented in |
| --- | --- | --- | --- | --- |
| `cofounder-and-peers.md` | repository owner (direct request in session) | 2026-10-24 | Approved as direction; MentorShow and Eightfold AI recorded as out-of-domain, not copied | Goals/KRs, advisor log, team skills, benchmark doc |

## Rules for notes in this directory

1. Describe behaviour, not pixels. "Filing a bug report previews the payload before sending" is
   fine; a screenshot or a layout description is not.
2. Cite URLs. Acceptance criteria and edge cases are welcome; quoted text is not.
3. Record what is **out of scope** and why, so a later session does not re-litigate it.
4. When a note drives work, update `docs/parity.md` and `REQUIREMENTS_TRACEABILITY.md` in the
   same pull request.
