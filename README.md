# AMIA 2026 · VAHC Year in Review

A 3D web presentation for the Visual Analytics in Healthcare (VAHC) Working Group "Year in Review" at the AMIA 2026 Annual Symposium (Dallas, TX).
The deck flies the audience down a neon funnel: from thousands of candidate papers, through each screening stage, to the handful selected for the review.

Built with [impress.js](https://github.com/impress/impress.js) for the 3D camera, Vue 3 + TypeScript for the slide components, and Vite + Bun for tooling.
It is a pure static frontend.

## Quick start

```bash
bun install
bun run dev        # http://localhost:5173
bun run build      # type-check + production build into dist/
bun run preview    # serve dist/
```

Navigate with the arrow keys, Space, or the stage tracker at the bottom of the screen.

## Where to edit

| File | What it controls |
| --- | --- |
| `src/data/meta.ts` | Title, subtitle, presenters, review window |
| `src/data/pipeline.ts` | Funnel stages and their counts (currently placeholders) |
| `src/data/papers.ts` | The final selected papers (currently placeholders) |
| `src/data/layout.ts` | 3D placement: stage depth, spiral twist, ring radii |
| `src/styles/theme.css` | AMIA 2026 color tokens and typography |
| `src/assets/backdrop.svg` | Background waves echoing the AMIA 2026 slide template |
| `src/App.vue` | The ordered list of impress.js steps |

## Structure

- `ImpressStep.vue` wraps one impress.js step and maps props to `data-x/y/z/rotate/scale`.
- `StageSlide.vue` + `PaperField.vue` render one funnel stage: a canvas with one dot per incoming paper, where filtered-out papers drift away when the step becomes active.
- `FunnelRings.vue` places decorative neon rings in the 3D canvas, one per stage, shrinking with depth.
- `SelectedPapers.vue` is a rotating 3D carousel of the final picks.
- `PresentationHud.vue` is the fixed header and the clickable stage tracker.
- `composables/useImpress.ts` initialises impress.js and exposes the active step as shared state.

impress.js moves step elements into its own canvas after init, so `App.vue` must stay static; put reactive state in child components or the shared composable.

## Theme

Colors are sampled from the AMIA 2026 slide template: deep indigo `#2D066A`, violet `#6F74F5`, periwinkle `#8795F4`, neon cyan `#8EE9F2`, plus pink `#F27AC9` and green `#5EF0B5` from the Dallas skyline.
Official AMIA and institutional logos are not included in this repo.

## Deploy

`.github/workflows/pages.yml` builds with Bun and publishes `dist/` to GitHub Pages on every push to `main`.
Enable it once under Settings → Pages → Source: GitHub Actions.
