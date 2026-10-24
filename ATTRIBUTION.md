# Attribution

OpenFounder source code is dual licensed, MIT OR Apache-2.0 (see `LICENSE`, `LICENSE-MIT`,
`LICENSE-APACHE`). Third-party packages are used under their own permissive licences. No
proprietary assets, icons, fonts, or datasets are bundled.

## Original assets

| Asset | Path | Licence |
| --- | --- | --- |
| OpenFounder mark (caliper and question mark) | `assets/logo.svg` | Project licence (MIT OR Apache-2.0), authored for this repository |

## Runtime dependencies

| Package | Licence | Use |
| --- | --- | --- |
| react, react-dom | MIT | UI runtime |
| vite | MIT | Build tooling / dev server |
| @vitejs/plugin-react | MIT | React transform |
| @tailwindcss/vite, tailwindcss | MIT | Styling |
| dexie | Apache-2.0 | IndexedDB wrapper |
| zod | MIT | Schema validation |
| lucide-react | ISC | Icons (ISC-licensed icon set) |
| motion | MIT | UI animation |
| express | MIT | Optional server |
| dotenv | BSD-2-Clause | Server env loading |
| @google/genai | Apache-2.0 | Gemini client (optional) |

## Development dependencies

| Package | Licence |
| --- | --- |
| typescript | Apache-2.0 |
| vitest | MIT |
| tsx | MIT |
| esbuild | MIT |
| autoprefixer | MIT |
| @types/node | MIT |
| @types/express | MIT |
| @types/react | MIT |
| @types/react-dom | MIT |
| csstype | MIT |
| @types/* (other transitive) | MIT |

## Product frameworks (ideas, not code)

Lean Canvas, Customer Development, The Mom Test, MoSCoW, and the probability × impact risk
matrix are publicly documented methods. See `docs/inspiration.md`. No text or asset from those
works is reproduced.

## Assets

- No image, font, sound, or illustration files are bundled in this repository.
- Icons are rendered from `lucide-react` at runtime under ISC.
- Demo data is original and synthetic; every synthetic row carries `isSynthetic: true`.

If a dependency is added or replaced, update this file in the same pull request.
