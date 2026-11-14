# Design Tokens — OpenFounder

Single source of truth for the visual language of OpenFounder. All values map to
Tailwind CSS v4 utilities actually used across the app; component code should
reference these semantic roles rather than raw Tailwind colour names.

## 1. Color

Semantic palette. Neutrals are zinc, status colours are emerald/amber/rose/
indigo.

| Token | Value | Role |
|---|---|---|
| `--color-neutral-50` | zinc-50 (`#fafafa`) | Light surface / page background |
| `--color-neutral-100` | zinc-100 (`#f4f4f5`) | Hover surface |
| `--color-neutral-200` | zinc-200 (`#e4e4e7`) | Borders (light) |
| `--color-neutral-700` | zinc-700 (`#3f3f46`) | Borders (dark) |
| `--color-neutral-800` | zinc-800 (`#27272a`) | Dark surface |
| `--color-neutral-900` | zinc-900 (`#18181b`) | Dark page background / primary text (light) |
| `--color-neutral-950` | zinc-950 (`#09090b`) | Deepest dark surface |
| `--color-success` | emerald-500 (`#10b981`) | Success / positive |
| `--color-warning` | amber-500 (`#f59e0b`) | Warning |
| `--color-danger` | rose-500 (`#f43f5e`) | Danger / destructive |
| `--color-info` | indigo-500 (`#6366f1`) | Info / experiments |
| `--color-accent-ai` | amber-400 (`#fbbf24`) | AI accent |

Dark-mode pairs follow the existing `dark:` variants (e.g. `text-zinc-900` /
`dark:text-zinc-100`).

## 2. Spacing

Tailwind default 0.25rem increments. Standardised card padding and gaps:

| Token | Value | Usage |
|---|---|---|
| `--spacing-1` | 0.25rem | Tight inline gaps |
| `--spacing-2` | 0.5rem | Compact gaps |
| `--spacing-3` | 0.75rem | Compact card padding |
| `--spacing-4` | 1rem | Default card padding / section gap |
| `--spacing-5` | 1.25rem | Primary card padding |
| `--spacing-6` | 1.5rem | Loose section gap |
| `--spacing-card` | 1rem | Default card padding (`p-4`) |
| `--spacing-card-primary` | 1.25rem | Primary card padding (`p-5`) |
| `--spacing-card-compact` | 0.75rem | Compact card padding (`p-3`) |

## 3. Typography

| Use | Size | Weight | Leading |
|---|---|---|---|
| Page title | `text-2xl` | `font-bold` | `leading-tight` |
| Section heading | `text-xl` | `font-semibold` | `leading-snug` |
| Subsection | `text-lg` | `font-medium` | `leading-normal` |
| Body | `text-sm` | `font-normal` | `leading-relaxed` |
| Caption | `text-xs` | `font-medium` | `leading-normal` |
| Micro-copy | `text-[10px]` | `font-medium` | `leading-none` |

## 4. Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 0.375rem | Inputs, small controls |
| `--radius-md` | 0.5rem | Buttons |
| `--radius-lg` | 0.75rem | Cards |
| `--radius-xl` | 1rem | Modals |
| `--radius-full` | 9999px | Pills, badges |

## 5. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | Tailwind `shadow-xs` | Cards |
| `--shadow-sm` | Tailwind `shadow-sm` | Buttons |
| `--shadow-lg` | Tailwind `shadow-lg` | Popovers |
| `--shadow-2xl` | Tailwind `shadow-2xl` | Modals |

## 6. Components

Shared primitives live in `src/components/ui/`: `Button`, `Card`, `Input`,
`ConfirmDialog`. Each accepts a `className` override and forwards props.
