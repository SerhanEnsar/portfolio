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
generator, rover delivery sim, visual-odometry puzzle, HomeAgent mesh) are
**not** top-nav
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

## A project page is full width

The body used to be a 12-column grid: four columns of credentials down the left,
eight for everything else. Four short lines left a tall empty column, and the
instruments, galleries and narratives — the things worth room — were squeezed
into two thirds of the page.

The credentials now live in `components/project/project-meta.tsx`, floated
opposite the title in the header and opened on hover. It is pure CSS (`group` +
`group-hover` + `group-focus-within`), so there is no client component and a
keyboard reaches it; the panel is inert until opened. Coarse pointers never get
a hover, so `ProjectMetaInline` renders the same four values as a plain grid
under `md`, and the floating one is `hidden md:block`.

The body is a single full-width stack. Prose still gets a measure — the brief is
`max-w-3xl`, the contribution list `max-w-4xl` — and only the wide things go
wide. Keep that split when adding a section: text stays readable, canvases and
shelves take the page.

## Narratives sit beside the instruments

`components/project/project-story.tsx` maps `slug → ComponentType[]` exactly the
way `project-instrument.tsx` does, and the page renders `<ProjectStory>` when the
slug is in `STORY_SLUGS` (declared in `app/[lang]/projects/[slug]/page.tsx`, not
exported from the client module — a `Set` does not survive the client boundary
as a `Set`).

The distinction is deliberate: an **instrument** asks the visitor to do
something; a **story** argues the decision the project turned on and plays
whether or not it is touched. A project gets a story only when its point *is* a
decision worth walking through — six frames instead of retraining, derived
sessions instead of stored ones. Where the work speaks for itself, the shelf of
shipped screens (`project-gallery.tsx`) stands alone; STETOSKOP is mounted that
way.

Stories run in one shell, `components/project/story/story-stage.tsx`: beats
that auto-advance once the stage scrolls into view, a caption, and a rail that
doubles as a scrubber. Under `prefers-reduced-motion` the stage renders its
**final** beat and never advances — the conclusion is the readable state, so the
arc is never a prerequisite for the point. Beat timing is pure (`lib/story.ts`);
each story's own arithmetic is pure too (`lib/attendance.ts`,
`lib/eye2s-data.ts`).

Numbers in a story are measured, never invented. `lib/eye2s-data.ts` carries
cosine similarities computed from the registry the Eye2S desktop app writes at
`~/.eye2s/registry`, and `public/story/eye2s/` holds the actual crops that
taught those objects — only the ones containing nothing but an object and a
hand. Two scenes are captures rather than generated plates: `stetoskop` is the
delivered site itself, scrolled in a browser below its hero (the instructor
slider there carries named photographs of real people), and `unilate` is the
app's interface **redrawn** — `scripts/unilate-scene.html` is the source. A 9:16
phone screen cannot be dropped into a 16:9 plate without either floating in
empty margins or being magnified past legibility; rebuilding the layout is what
makes it fill the frame and stay crisp.

That scene is also composed **twice**. `FrameStage` cover-fits every frame from
its own dimensions, so nothing requires the two tiers to share an aspect ratio —
and a phone only ever downloads the 900 tier. So `unilate` ships a 1600x900 wide
tier and a 900x1600 portrait one, captured from the same source file at
`?mode=tall`, and built in one pass:

```bash
npm run sequence unilate wide.mp4 -- --portrait tall.mp4
```

Use it for any scene whose content has to be *read*. A photographic plate does
not need it — cropping a landscape is what cover-fit is for.

**Adding a story:** build the component around `StoryStage`, add its token to
`STORY_OBJECTIVES` in `lib/objectives.ts`, add it to the `ProjectStory` map and
to `STORY_SLUGS` on the page, and add a `stories.<name>` block with one caption
per beat in both locales.

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
