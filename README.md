# Portfolio — Serhan Ensar Büdün

Next.js 16 · React 19 · Tailwind v4 · framer-motion. Bilingual (EN/TR), dark only.

The site's defining element is the **scroll-scrubbed scene**: a pinned canvas
whose frames advance with scroll position, the way a sensor feed advances with
time. Scenes are AI-generated clips — or screen captures — converted to WebP
frame tiers.

```bash
npm run dev      # http://localhost:3000 → redirects to /en or /tr
npm run build    # prebuild syncs the ORT wasm into public/ort first
npm run lint
```

There are no unit tests. The check that counts is `npm run build` and
`npm run lint` clean, then `npx next start` for a production preview — frame
sequences only exist after the build/asset step, so `next start` is the honest
look.

## Layout

```
app/[lang]/                  locale-scoped routes; [lang]/layout.tsx is the root layout
  projects/[slug]/           20 static pages (10 projects × 2 locales)
  lab/ sim/                  standalone instrument routes, off the nav, reachable from the console
  opengraph-image.tsx        the share card — one for the site, one per project
app/sitemap.ts robots.ts     what crawlers are told
app/icon.png favicon.ico     the mark, from the same photograph
proxy.ts                     sends locale-less URLs to /en or /tr
content/                     all copy and data, typed and bilingual
  projects.ts site.ts        the work, the profile
  dictionaries.ts            every interface string, one tree per locale
  sequences.json             frame counts — read by both the runtime and the build script
components/sequence/         the scroll-scrub engine
components/sections/         one file per home section
components/project/          project page parts: meta, gallery, instruments, stories
lib/                         DOM-free logic — simulation, geometry, scoring, progress
  og.ts site-url.ts          what the share cards and the crawlers are built from
scripts/build-sequence.mjs   clip → frame tiers under public/
assets/fonts/                the two faces the cards are typeset in, as bytes
public/profile/              the photograph: mark.jpg for the header, portrait.jpg for the card
```

Next 16 notes that differ from older versions: the middleware convention is now
`proxy.ts` exporting `proxy()`, route `params` is a Promise, and `PageProps` /
`LayoutProps` are global type helpers generated from the route tree.

Nothing user-facing is hardcoded in a component — copy lives in `content/`,
typed as `L10n<T> = { en: T; tr: T }` so a missing translation is a type error.
Prose is third person, named ("Serhan" / "o"), in both locales.

## Scenes

Ten frame scenes — `aerial`, `thermal`, `terrain`, `logistics`, `desk`,
`optics`, `signal`, `stetoskop`, `unilate`, `motor` — plus `lattice`, which is
a live WebGL shader rather than frames and so downloads nothing. Generated
scenes need a clip with **one continuous camera move and no cuts**; a scrub only
reads correctly if the source is a single take. Prompts for both the still and
the motion live in `content/sequences.ts`.

```bash
higgsfield auth login                        # once per session
# generate a still, animate it to a ~5s clip, then:
npm run sequence aerial ~/Downloads/aerial.mp4
npm run sequence aerial -- --placeholder     # neutral stand-in, no AI needed
npm run sequence unilate wide.mp4 -- --portrait tall.mp4
```

The script resamples the clip to an exact frame count, grades it into the
palette, denoises (grain is close to incompressible and dominates payload size),
and writes two tiers — 1600w for desktop, 900w for mobile — plus two stills: a
blurred `poster.jpg` for the runtime to hold while frames decode, and a sharp
`card.jpg` from a third of the way in, which is what the project's share card
shows.

Nothing requires the two tiers to share an aspect ratio: `FrameStage` cover-fits
each frame from its own dimensions, and a phone only ever downloads the 900
tier. So a scene whose content has to be *read* — `unilate`, `stetoskop` — is
composed twice in one pass, wide and portrait, with `--portrait`. A photographic
plate does not need that; cropping a landscape is what cover-fit is for.

Loading rules the engine enforces:

- Only the hero scene loads eagerly; the rest wait until 1.5 viewports away.
- Mobile plays every other frame from the 900w tier.
- The poster shows until 60% of frames are decoded.
- `prefers-reduced-motion`, data-saver and 2G **skip frames entirely** — the
  poster becomes the permanent state, and nothing is downloaded.

`scripts/detect-sequence.mjs` runs the real detector over a built sequence
offline — the same decode and NMS the browser worker uses, imported directly —
and writes the boxes to `content/detections/<id>.json`. It exists so detections
over a scene can be real without a visit paying for 3.6 MB of weights; nothing
in the runtime reads that data today (`terrain.json` is the one pass kept).

## Instruments and stories

The playable pieces live *inside* the project they belong to, found by opening a
brief rather than advertised in the nav — a detection challenge, the live YOLO
detector, a synthetic scene generator, a rover delivery run, a visual-odometry
puzzle, the HomeAgent mesh, the telemetry dual render, a DC motor bench where
the visitor hunts for the load the machine runs best at, and a run down ODBARS'
own course seen from behind its camera, where every station is a decision and
one of them is whether the tracker gets its motion compensation. Each is
client-only and maps from a slug in
`components/project/project-instrument.tsx`.

Beside them sit **stories**: an instrument asks the visitor to do something, a
story argues the decision the project turned on and plays whether or not it is
touched. They run in one shell (`components/project/story/story-stage.tsx`) and
render their final beat under `prefers-reduced-motion`, so the conclusion is
never gated on the arc. Numbers in a story are measured, never invented.

The live detector runs `onnxruntime-web` in a Web Worker; its WASM binaries are
copied into `public/ort/` by `scripts/sync-ort.mjs` on `postinstall` and
`prebuild` — that directory is generated, never committed or hand-edited.

`localStorage` keeps which objectives a visitor has seen (`lib/progress.ts`);
the HUD watches `data-objective` attributes, and the command console reads the
same content modules the page renders from, so there is no second copy of the
project list. `open`, `ls`, `cat`, `lang` — `help` lists them.

## The cinematic

A second, separate video system that shares nothing with the scene engine:
`components/Cinematic*` and a zustand store play a seven-clip story from
`public/cinematic/` in a full-screen overlay, opened from the header button or
the footer trigger. Scenes do not auto-advance — each ends on a gesture gate
(swipe up, hold to scan, rotate a dial). After retrimming clips, regenerate
`encode.sh` and the scene start times with `node scripts/generate-ffmpeg.mjs`
rather than editing either by hand.

Its copy is the one part of the site that does not come from `content/`: the
strings sit in the cinematic's own components and pick a locale from the route
params. That is deliberate, but it is also why a line there can be left in one
language while every other string on the page follows the switch — check both
locales after touching it.

## Share cards

Both the home page and every project generate an Open Graph image at build
time, so a pasted link renders as a designed card rather than a bare URL. They
are typeset in the site's own faces from `assets/fonts/`, and a project's card
uses that project's scene — `card.jpg`, written by the sequence build next to
the poster.

The absolute origin lives in `lib/site-url.ts`: `NEXT_PUBLIC_SITE_URL` wins so a
preview deployment can describe itself rather than claiming to be production,
then the real domain, then Vercel's own hostname, then localhost. Cards,
canonical links, `sitemap.xml` and `robots.txt` all resolve against it.

Three things `next/og` will not forgive, all of them silent: fonts have to be
handed over as bytes (hence `assets/fonts/`, not `next/font`), images have to be
inlined as data URIs because there is no origin to fetch from mid-build, and
absolutely-positioned boxes need an explicit width and height — the `inset`
shorthand is ignored, so a scrim written with it renders as nothing at all.

The photograph in `public/profile/` is also the site's mark: round in the
header, whole in the card, and the icon a link preview shows. If it is ever
recropped, **rename the file** — browsers and the image optimizer key their
caches on the URL, and replacing the bytes under a stable name leaves visitors
looking at the old picture with no way to know it.

## CV

Drop the PDF at `public/cv/serhan-ensar-budun-cv.pdf`. The download link renders
only when that file exists.

## Deploying

Pushes to `main` deploy to the existing Vercel project at
[serhanensar.me](https://serhanensar.me), so the domain and its settings carry
over untouched. The previous version of the site is frozen at the
`v1-legacy` tag and branch.
