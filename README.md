# Belentani Experience Tour — Living UI Library

A **living UI/UX library catalog** with a *thick glossy red glassmorphism* aesthetic.
It indexes **161 assets** — 11 in-house Belentani components plus **127 components and
23 libraries** extracted from the [21st.dev community registry](https://21st.dev/community/components).

## Features

- **Search** across titles, descriptions, categories, authors and feature tags.
- **Category sidebar** with live counts (Heroes, Pricing, Buttons, AI & Auth, Shaders…).
- **Sort** by featured / A→Z / category / author, plus **grid and list** views.
- **Bookmarks** persisted to `localStorage`, with a dedicated "Saved Assets" view.
- **⌘K / Ctrl+K** focuses search, **Esc** clears it.
- **Detail modal** with syntax-highlighted source, author, tags and a one-click copy prompt.
- **Accessible**: skip link, keyboard-navigable cards, focus rings, ARIA labels and
  full `prefers-reduced-motion` support.
- **Resilient states**: shimmer skeleton loaders, a retryable error state and a reset-able empty state.
- **Code-split modal** so the syntax highlighter never blocks first paint.

## Stack

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · GSAP · Motion · Express · lucide-react.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional: set `GEMINI_API_KEY` in `.env.local` for server-side Gemini features.

```bash
npm run lint       # tsc --noEmit
npm run build      # vite build + bundled Express server
npm start          # run the production server
```

## Catalog data

- `src/data/featured.ts` — in-house Belentani components (real source code).
- `src/data/registry.ts` — **auto-generated** 21st.dev catalog (components + libraries).
- `src/data/catalog.ts` — combines both, defines category order, counts and stats.
- `server.ts` — Express API: `/api/assets` (with `q`, `category`, `author`, `kind`, `sort`),
  `/api/assets/:id`, `/api/categories`, `/api/stats`.

### Regenerating the registry

`registry.ts` is generated from a saved copy of the 21st.dev community page:

```bash
npm run gen:registry -- path/to/saved-page.htm
```

The generator reads the component cards (`href`, `aria-label`) and library links,
derives a category and feature tags from each slug, and emits typed `Asset` entries.

## Daily generator (autonomous, no API)

The library grows by itself: every day **one brand-new React component** is
appended to the catalog. No LLM, no network — a deterministic procedural
generator in Python (`generator/daily.py`, stdlib only).

- **Append-only store**: `data/generated.jsonl`, one JSON object per line.
  Nothing is ever rewritten or deleted; a forced regeneration appends a new
  line and the newest one wins on read.
- **Deterministic**: the seed is the date (`YYYYMMDD`), so a given day always
  produces the same component.
- **Idempotent**: re-running the same day is a no-op.
- **Grammar**: 9 component types (button, card, badge, banner, stat, input,
  avatar, toast, chip) × 10 palettes × 7 animations × radii/layouts — thousands
  of valid TSX combinations.

```bash
npm run generate          # today's asset
npm run generate:week     # backfill the last 7 days
python generator/daily.py --dry-run         # preview without writing
python generator/daily.py --stats           # store statistics
```

### Automatic scheduling

```bash
npm run task:install      # register a daily Windows task (09:00)
npm run task:uninstall    # remove it
```

The task runs `generator/run-daily.cmd`, which appends the day's asset and logs
to `data/generator.log`. As a safety net the server also calls `ensureToday()`
on boot, so a missed schedule self-heals the next time it starts.

### Manual trigger from the UI

`POST /api/generate` (optionally `?days=7` / `?force=true`) runs the generator;
the "Generate now" button in the hero calls it.

## Attribution

Component metadata and links belong to their respective authors on
[21st.dev](https://21st.dev/community/components). Each registry entry keeps its
canonical source URL and author handle.
