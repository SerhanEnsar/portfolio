# Portfolio — Serhan Ensar Büdün

Next.js 16 · React 19 · Tailwind v4 · framer-motion. Bilingual (EN/TR), dark only.

The site's defining element is the **scroll-scrubbed scene**: a pinned canvas
whose frames advance with scroll position, the way a sensor feed advances with
time. Scenes are AI-generated clips converted to WebP frame tiers.

```bash
npm run dev      # http://localhost:3000 → redirects to /en or /tr
npm run build
npm run lint
```

## Layout

```
app/[lang]/                  locale-scoped routes; [lang]/layout.tsx is the root layout
  projects/[slug]/           14 static pages (7 projects × 2 locales)
proxy.ts                     sends locale-less URLs to /en or /tr
content/                     all copy and data, typed and bilingual
  sequences.json             frame counts — read by both the runtime and the build script
components/sequence/         the scroll-scrub engine
components/sections/         one file per page section
scripts/build-sequence.mjs   clip → frame tiers under public/
```

Next 16 notes that differ from older versions: the middleware convention is now
`proxy.ts` exporting `proxy()`, route `params` is a Promise, and `PageProps` /
`LayoutProps` are global type helpers generated from the route tree.

## Scenes

Four scenes — `aerial`, `terrain`, `board`, `lattice`. Each needs a short clip
with **one continuous camera move and no cuts**; a scrub only reads correctly if
the source is a single take. Prompts for both the still and the motion live in
`content/sequences.ts`.

```bash
higgsfield auth login                        # once per session
# generate a still, animate it to a ~5s clip, then:
npm run sequence aerial ~/Downloads/aerial.mp4
npm run sequence aerial -- --placeholder     # neutral stand-in, no AI needed
```

The script resamples the clip to an exact frame count, denoises (grain is close
to incompressible and dominates payload size), and writes two tiers — 1600w for
desktop, 900w for mobile — plus a blurred poster.

Loading rules the engine enforces:

- Only the hero scene loads eagerly; the rest wait until ~1.5 viewports away.
- Mobile plays every other frame from the 900w tier.
- The poster shows until 60% of frames are decoded.
- `prefers-reduced-motion`, data-saver and 2G **skip frames entirely** — the
  poster becomes the permanent state, and nothing is downloaded.

## CV

Drop the PDF at `public/cv/serhan-ensar-budun-cv.pdf`. The download link renders
only when that file exists.

## Deploying

Pushes to `main` deploy to the existing Vercel project, so the domain and its
settings carry over untouched. The previous version of the site is frozen at the
`v1-legacy` tag and branch.
