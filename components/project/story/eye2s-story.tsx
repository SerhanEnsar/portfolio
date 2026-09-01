// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { StoryStage } from "./story-stage";
import { beats } from "@/lib/story";
import {
  CONFUSABLE,
  EMBED_DIM,
  EMBEDDER,
  OBJECTS,
  SAMPLES,
  between,
  frames,
} from "@/lib/eye2s-data";
import { fill } from "@/lib/fill";
import type { Dictionary } from "@/content/dictionaries";

const IDS = ["hold", "cut", "capture", "embed", "match", "twin", "refuse"];
const STORY = beats(IDS);

const earbuds = OBJECTS.find((o) => o.id === "earbuds")!;
const budscase = OBJECTS.find((o) => o.id === "budscase")!;
const phone = OBJECTS.find((o) => o.id === "phone")!;
const twinScore = between(CONFUSABLE.a, CONFUSABLE.b);

/**
 * A crop, always framed the same way so beats cut cleanly against each other.
 *
 * `contain`, not `cover`: these are already tight crops straight off the
 * detector, and cropping them again turns a recognisable object into an
 * abstract shape — which would undercut a story about recognising objects.
 */
function Crop({
  src,
  alt,
  className = "",
  dim = false,
}: {
  src: string;
  alt: string;
  className?: string;
  dim?: boolean;
}) {
  return (
    <span className={`relative block overflow-hidden bg-void ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 30vw, 200px"
        className={`object-contain ${dim ? "opacity-40 grayscale" : ""}`}
      />
    </span>
  );
}

/** Tailwind only sees class names it can read as literals — never build one. */
function Readout({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">{label}</span>
      <span className={`font-mono text-xs ${accent ? "text-signal" : "text-ice"}`}>{value}</span>
    </span>
  );
}

export function Eye2sStory({ dict }: { dict: Dictionary }) {
  const copy = dict.stories.eye2s;
  const earbudsFrames = frames(earbuds.dir);
  const budsFrames = frames(budscase.dir);
  const phoneFrames = frames(phone.dir);

  const visual = (i: number) => {
    const id = IDS[i];

    // 1 — an object in front of the lens, and nothing known about it yet.
    if (id === "hold") {
      return (
        <div className="flex h-full items-center justify-center p-6">
          <div className="relative h-full max-h-[220px] w-[46%] max-w-[200px]">
            <Crop src={earbudsFrames[0]} alt="" className="h-full w-full" />
            <span className="absolute inset-0 border border-signal/70" />
            <span className="absolute -top-2 left-2 bg-void px-1.5 font-mono text-[10px] tracking-widest text-signal">
              ?
            </span>
          </div>
        </div>
      );
    }

    // 2 — the hand is not the object; GrabCut cuts one out of the other.
    if (id === "cut") {
      return (
        <div className="flex h-full items-center justify-center gap-6 p-6">
          <div className="relative h-full max-h-[200px] w-[38%] max-w-[180px]">
            <Crop src={earbudsFrames[0]} alt="" className="h-full w-full" dim />
            <span className="absolute inset-x-[18%] inset-y-[22%] border border-dashed border-ice/80" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">→</span>
          <div className="relative h-full max-h-[200px] w-[38%] max-w-[180px]">
            <Crop src={earbudsFrames[1]} alt="" className="h-full w-full" />
            <span className="absolute inset-0 border border-ice" />
          </div>
        </div>
      );
    }

    // 3 — six frames is the whole cost of teaching it something new.
    if (id === "capture") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-5">
          <div className="grid w-full max-w-[420px] grid-cols-6 gap-1.5">
            {earbudsFrames.map((src, k) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: k * 0.18, duration: 0.3 }}
                className="aspect-square"
              >
                <Crop src={src} alt="" className="h-full w-full" />
              </motion.div>
            ))}
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
            {fill(copy.frameCount, { n: String(SAMPLES) })}
          </p>
        </div>
      );
    }

    // 4 — the six collapse into one vector, and its own spread becomes the bar.
    if (id === "embed") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <div className="flex w-full max-w-[420px] items-center gap-3">
            <div className="grid flex-1 grid-cols-6 gap-1">
              {earbudsFrames.map((src) => (
                <div key={src} className="aspect-square">
                  <Crop src={src} alt="" className="h-full w-full" />
                </div>
              ))}
            </div>
            <span className="font-mono text-[10px] text-dim">→</span>
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-signal px-3 py-2 text-center"
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim">
                {EMBED_DIM}-d
              </p>
              <p className="font-mono text-sm text-signal">{earbuds.label}</p>
            </motion.div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
            <Readout label={copy.embedder} value={EMBEDDER} />
            <Readout label="tau" value={earbuds.tau.toFixed(3)} accent />
            <Readout label={copy.worst} value={earbuds.worstSelf.toFixed(3)} />
          </div>
        </div>
      );
    }

    // 5 — a distinct object scores far below the bar; the right one clears it.
    if (id === "match") {
      const rows = [
        { label: earbuds.label, src: earbudsFrames[4], score: earbuds.tau, hit: true },
        { label: phone.label, src: phoneFrames[0], score: between("earbuds", "phone"), hit: false },
      ];
      return (
        <div className="flex h-full flex-col justify-center gap-4 p-6">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center gap-4">
              <Crop src={r.src} alt="" className="h-14 w-14 shrink-0" />
              <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-bone">
                {r.label}
              </span>
              <span className="relative h-1 flex-1 bg-line">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${r.score * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={`absolute inset-y-0 left-0 ${r.hit ? "bg-signal" : "bg-dim"}`}
                />
                <span
                  className="absolute inset-y-[-4px] w-px bg-ice"
                  style={{ left: `${earbuds.tau * 100}%` }}
                />
              </span>
              <span
                className={`w-12 text-right font-mono text-xs ${r.hit ? "text-signal" : "text-dim"}`}
              >
                {r.score.toFixed(3)}
              </span>
            </div>
          ))}
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ice">
            | {copy.threshold}
          </p>
        </div>
      );
    }

    // 6 — the buds and the case they live in. Two identities, one silhouette.
    if (id === "twin") {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Crop src={earbudsFrames[2]} alt="" className="h-24 w-24 md:h-28 md:w-28" />
              <p className="mt-1.5 font-mono text-[10px] text-bone">{earbuds.label}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-display text-3xl font-extrabold text-alert"
              >
                {twinScore.toFixed(3)}
              </motion.span>
              <span className="h-px w-16 bg-alert" />
            </div>
            <div className="text-center">
              <Crop src={budsFrames[1]} alt="" className="h-24 w-24 md:h-28 md:w-28" />
              <p className="mt-1.5 font-mono text-[10px] text-bone">{budscase.label}</p>
            </div>
          </div>
          <p className="max-w-sm text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-dim">
            {fill(copy.tighter, {
              pair: twinScore.toFixed(3),
              self: earbuds.tau.toFixed(3),
            })}
          </p>
        </div>
      );
    }

    // 7 — unresolved means unresolved: the label says so and nothing fires.
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <div className="border border-alert px-5 py-3 text-center">
          <p className="font-mono text-lg text-alert">{earbuds.label} ?</p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim line-through">
            {copy.automation}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
            {copy.held}
          </p>
        </div>
      </div>
    );
  };

  return (
    <StoryStage
      token="story:eye2s"
      eyebrow={copy.eyebrow}
      title={copy.title}
      beats={STORY}
      captions={copy.beats}
      dict={dict}
    >
      {visual}
    </StoryStage>
  );
}
