// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Dictionary } from "@/content/dictionaries";

/**
 * A shelf of real screens — what the project actually looks like, shipped.
 *
 * Not a carousel and not a lightbox: nothing here is hidden behind an
 * interaction, because the point is to be seen at a glance rather than
 * explored. The only control that exists is UniLate's theme toggle, and it
 * earns its place by being evidence — the same six screens were captured in
 * both themes, so flipping it proves the dark theme is real work and not an
 * inverted screenshot.
 */

type Shot = { name: string; label: string };

function Shelf({
  eyebrow,
  shots,
  src,
  /** Portrait for phone screens, landscape for pages. */
  portrait,
  columns,
  control,
}: {
  eyebrow: string;
  shots: Shot[];
  src: (name: string) => string;
  portrait: boolean;
  columns: string;
  control?: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-surface/40">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {eyebrow}
        </p>
        {control}
      </div>

      <ul className={`grid gap-5 px-5 py-6 ${columns}`}>
        {shots.map((shot, i) => (
          <li key={shot.name}>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className={`relative w-full overflow-hidden border border-line bg-void ${
                portrait ? "aspect-[9/16]" : "aspect-[16/11]"
              }`}
            >
              <Image
                src={src(shot.name)}
                alt={shot.label}
                fill
                sizes={portrait ? "(max-width: 640px) 45vw, 260px" : "(max-width: 640px) 90vw, 380px"}
                className="object-cover object-top"
              />
            </motion.div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dim">
              {shot.label}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const UNILATE_SCREENS = [
  "01-bugun",
  "02-dersler",
  "03-program",
  "04-takvim",
  "05-notlar",
  "06-gecmis",
] as const;

export function UnilateGallery({ dict }: { dict: Dictionary }) {
  const copy = dict.gallery.unilate;
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <Shelf
      eyebrow={copy.eyebrow}
      portrait
      columns="grid-cols-2 sm:grid-cols-3"
      shots={UNILATE_SCREENS.map((name) => ({ name, label: copy.screens[name] }))}
      src={(name) => `/gallery/unilate/${theme}/${name}.webp`}
      control={
        <div
          role="group"
          aria-label={copy.theme}
          className="flex border border-line font-mono text-[10px] uppercase tracking-[0.18em]"
        >
          {(["light", "dark"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              aria-pressed={theme === t}
              className={`px-3 py-1.5 transition-colors ${
                theme === t ? "bg-signal text-void" : "text-dim hover:text-bone"
              }`}
            >
              {copy[t]}
            </button>
          ))}
        </div>
      }
    />
  );
}

const STETOSKOP_PAGES = ["fark", "hizmetler", "sss", "iletisim"] as const;

export function StetoskopGallery({ dict }: { dict: Dictionary }) {
  const copy = dict.gallery.stetoskop;

  return (
    <Shelf
      eyebrow={copy.eyebrow}
      portrait={false}
      columns="grid-cols-1 sm:grid-cols-2"
      shots={STETOSKOP_PAGES.map((name) => ({ name, label: copy.pages[name] }))}
      src={(name) => `/gallery/stetoskop/${name}.webp`}
    />
  );
}
