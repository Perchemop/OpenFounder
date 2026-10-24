# Brand

Original design notes for OpenFounder. No competitor marks, icons, or trade dress are used or
copied: the app is inspired by other products' *behaviour* only (see
`docs/competitive-benchmark.md` for what was and was not adopted).

## Mark

The mark is a **caliper around a question mark**: a measuring instrument wrapped around the
symbol of an open question. It encodes the product promise — an assumption is measured before it
is trusted.

- Shapes: circle (the caliper's frame), two jaw strokes, a question mark as the measured object.
- No text inside the mark; the wordmark sits beside it.
- Hand-authored SVG, generated from the source in `assets/`.

## Wordmark

- Display form: `OpenFounder` (one word, capital O and F).
- Tagline: *Evidence-driven AI co-founder workspace for startup validation.*

## Colour tokens

| Token | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--ink` | zinc-900 | zinc-100 | Primary text |
| `--paper` | white | zinc-900 | Surfaces |
| `--hairline` | zinc-200 | zinc-800 | Borders |
| `--verified` | emerald-500 | emerald-500 | Supported evidence |
| `--assumed` | amber-500 | amber-500 | Assumption / unverified |
| `--unsupported` | rose-500 | rose-500 | Unsupported claim or risk |
| `--signal` | sky-500 | sky-500 | Neutral information |

Status is always carried by **text plus shape**, never colour alone: every status badge has a
label and, where it is a progress measure, a numeric value.

## Type and density

- Interface text: system sans, 11–13px for dense workspaces, 16–20px for headings.
- Monospace for numbers, IDs, and dates so columns align.
- Information-dense but uncluttered: one primary action per surface, secondary actions as
  icon buttons with tooltips.

## Iconography

`lucide-react` (ISC licensed, listed in `ATTRIBUTION.md`) supplies UI icons. The application
mark itself is original and lives in `assets/`.

## Dark theme

Both themes are first-class. Contrast is checked for text and for borders in both, and progress
bars carry a numeric percentage next to the bar so the value never depends on colour.
