// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The shared parts of the share cards — the images a link to this site turns
 * into when it is pasted into LinkedIn, X or a message.
 *
 * Cards are rendered at build time by `next/og`, which runs the layout through
 * satori rather than a browser. Two consequences shape everything here: fonts
 * have to be handed over as bytes, and images have to be inlined, because
 * there is no origin to fetch from while the site is still being built. Both
 * files therefore live in the repo and are read off disk.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

/** The size every platform crops from; 1.91:1 is the common denominator. */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** The page's own tokens, repeated here because satori has no stylesheet. */
export const OG = {
  void: "#080b0e",
  surface: "#0e1317",
  line: "#1e262d",
  dim: "#6e7c87",
  bone: "#e6e9ec",
  signal: "#ffb020",
  lock: "#3ddc84",
} as const;

/**
 * Turkish uppercase, since the cards are typeset in caps and JavaScript's
 * default fold turns "i" into "I" — the site has learned this lesson once
 * already, on the canvas overlays.
 */
export function caps(value: string, locale: string) {
  return locale === "tr" ? value.toLocaleUpperCase("tr") : value.toUpperCase();
}

export async function ogFonts() {
  const [display, mono] = await Promise.all([
    readFile(path.join(process.cwd(), "assets/fonts/SairaCondensed-Bold.ttf")),
    readFile(path.join(process.cwd(), "assets/fonts/JetBrainsMono-Regular.ttf")),
  ]);

  return [
    { name: "Saira Condensed", data: display, weight: 700 as const, style: "normal" as const },
    { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

/** A file from `public/`, inlined — satori cannot fetch from the origin. */
export async function inlineImage(relative: string) {
  const data = await readFile(path.join(process.cwd(), "public", relative));
  return `data:image/jpeg;base64,${data.toString("base64")}`;
}
