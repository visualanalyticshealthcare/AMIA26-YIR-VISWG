# AMIA 2026 · VAHC Year in Review

A 3D web presentation for the Visual Analytics in Healthcare (VAHC) Working Group "Year in Review" at the AMIA 2026 Annual Symposium (Dallas, TX).
It walks from the PubMed search, through manual screening, to the shortlist of papers the working group discussed.

Live: https://visualanalyticshealthcare.github.io/AMIA26-YIR-VISWG/

## Architecture

Two independent layers:

- **Text slides: impress.js + Vue.** impress.js only moves the text slides through 3D space (a spiral dive along -z). Headlines and the search query type themselves out with [typed.js](https://github.com/mattboldt/typed.js) the first time a slide is entered.
- **Paper cloud: Three.js.** A fixed full-screen WebGL canvas with one glowing point per reviewed paper, inside a faint background of 6,700 points, one per visualization / dashboard paper published in the same window. It has its own render loop; each slide only selects a layout (journal clusters, screening sphere, selection ring, closing funnel), and the points ease toward it. impress.js never touches it.
- **Interaction.** Hovering the cloud pauses its rotation; clicking a dot opens a panel with that paper's title, journal, authors, and PubMed / DOI links. A legend under the cloud explains each scene's colors.
- **Navigation.** Arrow keys or Space, the home button (top left), the stage tracker (bottom center), or the toolbar (bottom right: first, previous, next, last, full screen).

Slides that the camera is about to fly through are faded out first (`cullBehindCamera` in `src/composables/useImpress.ts`), which prevents perspective blow-up flashes during transitions.

## Quick start

```bash
bun install
bun run dev        # http://localhost:5173
bun run build      # type-check + production build into dist/
bun run preview    # serve dist/
```

## Data

All counts come from the working-group review spreadsheet, so slides never disagree with it.

```bash
uv run scripts/extract_records.py "/path/to/YIR VAHC AMIA 2026.xlsx"
```

This writes `src/data/records.json`: one entry per paper in the full review set (bibliographic fields, furthest stage reached, and the Novelty / Importance / Presentability score). Reviewer comments are not exported.

| File | What it controls |
| --- | --- |
| `src/data/search.ts` | PubMed query, review window, inclusion / exclusion criteria, scoring rubric |
| `src/data/pipeline.ts` | Funnel stages, counted from `records.json` |
| `src/data/meta.ts` | Title, subtitle, presenters |
| `src/data/layout.ts` | 3D path of the text slides |
| `src/three/PaperCloud.ts` | Point-cloud layouts per scene and the WebGL shader |
| `src/App.vue` | Slide order and which cloud scene each slide shows |
| `src/styles/theme.css` | AMIA 2026 color tokens and typography |

## Theme

Colors are sampled from the AMIA 2026 slide template: deep indigo `#2D066A`, violet `#6F74F5`, periwinkle `#8795F4`, neon cyan `#8EE9F2`, plus pink `#F27AC9` and green `#5EF0B5` from the Dallas skyline.
Official AMIA and institutional logos are not included in this repo.

## Deploy

`.github/workflows/pages.yml` builds with Bun and publishes `dist/` to GitHub Pages on every push to `main`.
