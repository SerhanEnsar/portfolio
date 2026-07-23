# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js **16** / React **19** / Tailwind **v4**. The framework version has breaking
changes from older ones — read `node_modules/next/dist/docs/` before touching
routing, middleware, or `params`/`PageProps`. Concretely: middleware is
`proxy.ts` exporting `proxy()` (locale-less URLs → `/en` or `/tr`); route
`params` is a Promise you must `await`; `PageProps<"/[lang]/...">` and
`LayoutProps` are global helpers generated from the route tree.

## Commands

```bash
npm run dev                              # dev server, :3000
npm run build                            # prebuild syncs ORT wasm → public/ort, then next build
npm run lint                             # eslint — must be clean; CI-equivalent gate
npm run sequence <id> <clip.mp4>         # build a scroll-scrub scene from a clip
npm run sequence <id> -- --placeholder   # neutral stand-in scene, no asset needed
```

There are no unit tests. The verification loop is: `npm run build` **and**
`npm run lint` clean, then `npx next start -p <port>` for a production preview
(frame sequences only exist after a build/asset step, so `next start` is the
honest check). Deploy = push to `main`; Vercel builds production automatically.
The v1 site is frozen at the `v1-legacy` tag/branch.

## Content is data, components are renderers

All copy and structured data lives in `content/`, typed and bilingual. Nothing
user-facing is hardcoded in a component.

- `content/locale.ts` — `L10n<T> = { en: T; tr: T }`. Every visible string is `L10n`.
- `content/dictionaries.ts` — interface/label strings (`Dictionary`), one tree per locale.
- `content/site.ts` — profile, about, `skillGroups`, `roles`, `internship`, `certificates`.
- `content/projects.ts` — the `Project[]`; each may carry an optional `sequence` id.

Sections/pages are near-dumb components that take `{ locale, dict }` (and read
the relevant content module) and render. When adding copy, add it to the content
module in **both** locales; the `Dictionary` type will flag a missing key. Prose
is written in the **third person, named** ("Serhan" / "he" / "o"), not first
person — match that voice.

## The scroll-scrub scene engine (`components/sequence/`)

The site's signature is a scene whose frames advance with scroll. A
`SequenceSpec` (`content/sequences.ts`) has `kind: "frames" | "shader"`:

- **frames** — WebP tiers under `public/sequences/<id>/{1600,900}/` decoded and
  scrubbed. Built from a clip by `scripts/build-sequence.mjs`.
- **shader** — a live WebGL fragment shader (`lattice`, via `LatticeStage`); zero
  download, reacts to the pointer.

`content/sequences.json` is the **shared source of truth for frame counts**, read
by both the runtime (`sequences.ts`) and the build script — never let the two
drift. Two ways a scene mounts:

- `SceneBackdrop` — ambient, non-pinned, sits behind normal-flow content; only
  works for sections taller than the viewport. Used by home sections.
- `ScrollSequence` / `PinnedScene` — a pinned full-viewport scene. Used as a
  project page's header when `project.sequence` is set.

Both expose `SequenceProgress` / `SceneActive` React contexts. Loading is
deliberately conservative (only the hero eager-loads; reduced-motion / data-saver
skip frame download entirely and keep the poster) — see README "Scenes".

**Adding a scene:** add `{ frames }` to `sequences.json`, add the id to
`sequenceIds` + a `SequenceSpec` in `sequences.ts`, add a color `GRADES` entry in
`build-sequence.mjs` (generated footage never arrives in-palette), run
`npm run sequence <id> <clip.mp4>`, then set `sequence: "<id>"` on a project.

## Interactive instruments live *inside* projects

The playable pieces (detection challenge, live YOLO detector, synthetic scene
generator, rover delivery sim, visual-odometry puzzle) are **not** top-nav
destinations — they are embedded in the project they belong to, discovered by
opening a brief. The wiring:

- `components/project/project-instrument.tsx` maps `slug → ComponentType[]`, each
  dynamically imported with `ssr: false`. A project page renders
  `<ProjectInstrument>` when its slug is in `INSTRUMENT_SLUGS`
  (`app/[lang]/projects/[slug]/page.tsx`). One instrument can appear under two
  projects (the scene generator is under both `lacin` and `ege-odbars`).
- Each instrument is a self-contained `"use client"` component that calls
  `record("instrument:<name>")` from `lib/progress.ts` on completion.
- The standalone `/lab` and `/sim` routes still exist and are reachable via the
  console (`open lab|sim`) but are intentionally out of the nav.

**Adding a game:** build the component (record its own token), add the token to
`INSTRUMENT_OBJECTIVES` in `lib/objectives.ts`, add it to the `ProjectInstrument`
map and `INSTRUMENT_SLUGS`, and add its strings as a dict block in both locales.

## Progress, HUD, console

`lib/progress.ts` persists seen "objectives" to `localStorage`. `lib/objectives.ts`
enumerates them (sections, project briefs, instruments) — the completion set.
`MissionHud` (`components/chrome/`) watches `data-objective` attributes across the
document and records them; server components stamp those attributes while
rendering. The command console (`components/console/`) reads the same content
modules the page renders from, so there is no second copy of the project list.

## Logic vs pixels

`lib/` holds DOM-free, dependency-light modules (`rover.ts`, `vo.ts`,
`synthetic-scene.ts`, `iou.ts`, `fill.ts`) that own geometry/scoring/rendering
math; the components own the canvas and React state. Keep new game logic in
`lib/` and pixels in the component — it is the established split and keeps the
math reasonable in isolation.

## ONNX detector

`onnxruntime-web` runs the live detector in a Web Worker; the WASM binaries are
copied into `public/ort/` by `scripts/sync-ort.mjs` (a `prebuild`/`postinstall`
hook — do not commit or hand-edit `public/ort`). Class list and input size come
from a single `model.config.ts` so swapping weights touches one file. No
COOP/COEP headers (single-thread WASM by design).

## Design tokens

Dark-only. Palette (Tailwind theme names): `void` `#080b0e`, `surface`, `signal`
(amber `#ffb020`), `ice` `#8fc5dc`, `bone`, `dim`, `line`, `lock`. Fonts: Saira
Condensed (display), Inter Tight (sans), JetBrains Mono (mono) — latin-ext
subsets carry the Turkish glyphs (`ç İ ğ ş ü ö`). Zero border-radius, hairline
borders, instrument-panel register — keep new UI in that language.
