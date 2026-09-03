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
npm run sequence <id> wide.mp4 -- --portrait tall.mp4   # see "Two compositions"
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
- `content/projects.ts` — the `Project[]`. Beyond the copy: `status` is
  `active | complete | delivered` (read it through `statusLabel`, never a
  ternary — there are three call sites and a ternary silently mislabels the
  third), an optional `sequence` id, and an optional `link` for work that is
  publicly reachable.

`getProject` resolves a **slug or a codename**, case- and accent-insensitively,
so `open LAÇİN` and `open Eye2S` work in the console. Anything navigating from
it must use the resolved `project.slug` — only slugs are real URL segments.

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

A `SequenceSpec` also carries an optional `scrim`. The default `heavy` pass
veils the middle of the frame, which is right for a photographic plate and fatal
for a scene meant to be *read* — those want `"light"`.

**Adding a scene:** add `{ frames }` to `sequences.json`, add the id to
`sequenceIds` + a `SequenceSpec` in `sequences.ts`, add a color `GRADES` entry in
`build-sequence.mjs` (generated footage never arrives in-palette), run
`npm run sequence <id> <clip.mp4>`, then set `sequence: "<id>"` on a project.

### Two compositions for one scene

`FrameStage` cover-fits every frame from its own dimensions, so **nothing
requires the two tiers to share an aspect ratio** — and a phone only ever
downloads the 900 tier. A scene whose content has to be read can therefore be
composed twice, wide at 1600x900 and portrait at 900x1600, in one pass:

```bash
npm run sequence unilate wide.mp4 -- --portrait tall.mp4
```

A photographic plate does not need this; cropping a landscape is what cover-fit
is for. Two scenes are captures rather than generated plates: `stetoskop` is the
delivered client site scrolled in a browser, started below its hero because the
instructor slider there carries named photographs of real people; `unilate` is
the app's interface **redrawn** for a wide frame from
`scripts/unilate-scene.html` (`?mode=tall` gives the portrait pass). A 9:16
phone screen dropped into a 16:9 plate either floats in empty margins or is
magnified past legibility — rebuilding the layout is the only way out.

## Interactive instruments live *inside* projects

The playable pieces (detection challenge, live YOLO detector, synthetic scene
generator, rover delivery sim, visual-odometry puzzle, HomeAgent mesh,
telemetry dual-render, motor bench, ODBARS course run) are **not** top-nav
destinations — they are embedded in the project they belong to, discovered by
opening a brief. The wiring:

- `components/project/project-instrument.tsx` maps `slug → ComponentType[]`, each
  dynamically imported with `ssr: false`. A project page renders
  `<ProjectInstrument>` when its slug is in `INSTRUMENT_SLUGS`
  (`app/[lang]/projects/[slug]/page.tsx`). The map can point two projects at
  one component, but a borrowed instrument is a smell: EGE ODBARS used to
  mount LAÇİN's scene generator and now runs its own course, which is the
  thing only it can show.
- Each instrument is a self-contained `"use client"` component that calls
  `record("instrument:<name>")` from `lib/progress.ts` on completion.
- The standalone `/lab` and `/sim` routes still exist and are reachable via the
  console (`open lab|sim`) but are intentionally out of the nav.

EGE ODBARS carries two views of the same vehicle and they must stay distinct:
`lib/rover.ts` drives it in profile with a suspension model (EGENODE's delivery
run), while `lib/course.ts` + `lib/track.ts` sit behind its camera. The course
run's point is the tracking stack — one jolt moves every box in the frame at
once, and the visitor decides at the third station whether the tracker gets its
global motion compensation. `lib/track.ts` needs both a per-track motion model
and that compensation to behave: with either missing the identity-switch count
is noise, and the demo would be blaming the terrain for the tracker's own gap.

The call itself is made **on the frame**: `Decision` in `odbars-run.tsx` floats
over the canvas, anchored to the projected top of the object the station is
asking about (`anchorFor`), with a stem down to it. Two things it must keep: the
anchor skips props closer than seven metres, because the nearest cone of all is
the one level with the front wheels and off the side of the picture; and a
phone-width frame is given extra height, since a 200-pixel frame with a panel
across the bottom is a panel, not a view.

Each answer there is a **manoeuvre**, not a score: it sets the line the vehicle
drives (`MANOEUVRES` in `lib/course.ts`), and a chassis box with a real width
either fits through the gap or hits it. Nothing marks an answer wrong — the
collision does. Two consequences of that are easy to break: a steering
controller that aims down the road rides wide through curves and clips cones
the visitor never chose to clip (it holds the centreline *here*, deliberately),
and a lane offset with no expiry is still swerving forty metres later, which is
what `laneUntil` is for. Contact costs speed and damage, and damage is
permanent: it bends the camera mount (`bias`) and makes the detector miss more,
so a bad call at the barrier is still being paid for at the gate.

TÜBİTAK's bench is the one instrument with nothing behind it to measure: the
2019 experiments left no numbers, so `lib/motor.ts` runs the textbook
steady-state model instead and the panel's own copy says exactly that. A demo
may model what was never recorded; it may not present the model as a record.

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
hand. When a demo simplifies something the real system does properly, the page
says so in its own copy rather than leaving the reader to assume it.

Where the work speaks for itself a shelf of shipped screens stands alone:
`components/project/project-gallery.tsx` exports `UnilateGallery` and
`StetoskopGallery` over one shared `Shelf`, and both mount through the
`ProjectStory` map like everything else on that side.

**Adding a story:** build the component around `StoryStage`, add its token to
`STORY_OBJECTIVES` in `lib/objectives.ts`, add it to the `ProjectStory` map and
to `STORY_SLUGS` on the page, and add a `stories.<name>` block with one caption
per beat in both locales.

## The cinematic is a *second*, separate video system

Easy to confuse with the scene engine; they share nothing. `components/Cinematic*`
plus `lib/store/useCinematicStore.ts` (zustand) play a seven-clip story from
`public/cinematic/sahne1..7.mp4` in a full-screen overlay, opened from the header
button and `CinematicFooterTrigger`. Scenes do not auto-advance: each one ends on
a gesture gate in `CinematicInteractions.tsx` — swipe up, hold to scan, rotate a
dial — and only then does `advanceScene()` fire. The player preloads
`sahne{n+1}` in a hidden `<video>` while `sahne{n}` plays.

`scripts/generate-ffmpeg.mjs` regenerates `encode.sh` (which concatenates the
clips into `full_story.mp4`) and rewrites the scene start times inside
`CinematicPlayer.tsx`. Run it after retrimming, not by hand.

Two things about it break the rules the rest of the site keeps, deliberately
noted so nobody "fixes" one by accident or copies the pattern into new work:
its copy is a hardcoded `t` object in `CinematicInteractions.tsx` rather than
`content/dictionaries.ts`, and its Tailwind uses cyan/emerald rather than the
palette below.

## Progress, HUD, console

`lib/progress.ts` persists seen "objectives" to `localStorage`. `lib/objectives.ts`
enumerates them (sections, project briefs, instruments) — the completion set.
`MissionHud` (`components/chrome/`) watches `data-objective` attributes across the
document and records them; server components stamp those attributes while
rendering. The command console (`components/console/`) reads the same content
modules the page renders from, so there is no second copy of the project list.

## Logic vs pixels

`lib/` holds DOM-free, dependency-light modules — `rover.ts`, `vo.ts`,
`synthetic-scene.ts`, `iou.ts`, `fill.ts` for the older instruments, and
`homeagent.ts` (topology and run sequencing), `telemetry.ts` (signal model and
display scales), `motor.ts` (the DC machine's steady state), `attendance.ts`,
`eye2s-data.ts`, `story.ts` for the newer ones — that own geometry, scoring and simulation; the components own the canvas
and React state. Keep new game logic in
`lib/` and pixels in the component — it is the established split and keeps the
math reasonable in isolation.

## ONNX detector

`onnxruntime-web` runs the live detector in a Web Worker; the WASM binaries are
copied into `public/ort/` by `scripts/sync-ort.mjs` (a `prebuild`/`postinstall`
hook — do not commit or hand-edit `public/ort`). Class list and input size come
from a single `model.config.ts` so swapping weights touches one file. No
COOP/COEP headers (single-thread WASM by design).

## Share cards, and the mark

A link to this site turns into an image, and both are generated at build time
by `next/og` (satori, not a browser):

- `app/[lang]/opengraph-image.tsx` — the hero reduced: eyebrow, the two-line
  name, the amber rule, and the portrait, which is the one thing the page never
  shows and a share card needs.
- `app/[lang]/projects/[slug]/opengraph-image.tsx` — the project header
  reduced, over that project's own scene.

`lib/og.ts` holds what they share. Three things satori will not forgive:
**fonts must be bytes** (vendored under `assets/fonts/`, not `next/font`),
**images must be inlined** as data URIs (there is no origin to fetch from mid
build), and **absolutely-positioned boxes need explicit geometry** — the
`inset` shorthand is ignored, so a scrim written with it renders as nothing at
all. Text is pre-uppercased through `caps()` for the same reason the canvas
overlays are: JavaScript's default fold spells "İ" as "I".

The scene on a project card is `card.jpg`, written by
`scripts/build-sequence.mjs` alongside the poster — a third of the way into the
scene and sharp. The poster is deliberately blurred for the runtime and makes a
poor card.

`lib/site-url.ts` resolves the absolute origin the cards, canonicals,
`app/sitemap.ts` and `app/robots.ts` all need: `NEXT_PUBLIC_SITE_URL` if set,
else Vercel's production hostname, else localhost. Set it on the deployment
when the custom domain is what should appear.

The header carries the same photograph as a small round mark
(`public/profile/mark.jpg`, the whole 1:1 frame). It is the **only** curve on
a site otherwise built from square corners — a deliberate exception, because a
portrait is the one thing here that is a person rather than an instrument.
Leave it round.

If the photograph is ever recropped, **rename the file**. The optimizer and
every browser key their cache on the URL, so replacing the bytes under a stable
name leaves visitors looking at the old picture with no way to know it.

## Design tokens

Dark-only. Palette (Tailwind theme names): `void` `#080b0e`, `surface`, `signal`
(amber `#ffb020`), `ice` `#8fc5dc`, `bone`, `dim`, `line`, `lock`. Fonts: Saira
Condensed (display), Inter Tight (sans), JetBrains Mono (mono) — latin-ext
subsets carry the Turkish glyphs (`ç İ ğ ş ü ö`). Zero border-radius, hairline
borders, instrument-panel register — keep new UI in that language.
