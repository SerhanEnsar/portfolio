// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { record } from "@/lib/progress";
import { arcProgress, isLast, nextIndex, prevIndex, type Beat } from "@/lib/story";
import type { Dictionary } from "@/content/dictionaries";

/**
 * The shell every project narrative runs in.
 *
 * Three stories share it so they read as one device rather than three
 * one-offs: a stage that swaps a visual per beat, a caption under it, and a
 * rail that doubles as a scrubber. It advances itself, because a story that
 * waits to be clicked is a slideshow.
 *
 * With reduced motion the arc does not auto-advance and the stage opens on its
 * final beat — the conclusion is the readable state, so nobody has to sit
 * through movement to reach the point.
 */
export function StoryStage({
  token,
  eyebrow,
  title,
  beats,
  captions,
  dict,
  children,
}: {
  /** Progress token recorded once the visitor reaches the last beat. */
  token: string;
  eyebrow: string;
  title: string;
  beats: Beat[];
  /** Caption per beat, already localised, indexed by beat id. */
  captions: Record<string, string>;
  dict: Dictionary;
  /** Renders the visual for a beat index. */
  children: (index: number) => ReactNode;
}) {
  const still = useReducedMotion();
  const copy = dict.story;

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const seenRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Reduced motion pins the view to the conclusion — derived, not stored, so
  // the preference flipping mid-visit is respected without a state sync.
  const shown = still ? beats.length - 1 : index;
  const atEnd = isLast(shown, beats.length);

  // Start only once the story is actually on screen; an arc that ran while
  // scrolled past would be over before it was ever looked at.
  useEffect(() => {
    if (still) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [still]);

  useEffect(() => {
    if (!playing || still || atEnd) return;
    const t = window.setTimeout(
      () => setIndex((i) => nextIndex(i, beats.length)),
      beats[shown].hold,
    );
    return () => window.clearTimeout(t);
  }, [playing, still, atEnd, shown, beats]);

  // A ref, not state: reaching the end is worth recording once and changes
  // nothing on screen, so it has no business triggering a render.
  useEffect(() => {
    if (seenRef.current || !atEnd) return;
    seenRef.current = true;
    record(token);
  }, [atEnd, token]);

  const go = useCallback((i: number) => {
    setPlaying(false);
    setIndex(i);
  }, []);

  const beat = beats[shown];
  const running = playing && !atEnd;

  return (
    <div ref={rootRef} className="border border-line bg-surface/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {eyebrow}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {shown + 1} / {beats.length}
        </p>
      </div>

      <div className="px-5 pb-6 pt-5">
        <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
          {title}
        </h3>

        {/* Fixed aspect so the caption never jumps as beats swap. */}
        <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden border border-line bg-void sm:aspect-[16/9] md:aspect-[12/5]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={beat.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {children(shown)}
            </motion.div>
          </AnimatePresence>
        </div>

        <p
          aria-live="polite"
          className="mt-5 min-h-[3.5rem] max-w-2xl text-[15px] leading-relaxed text-dim"
        >
          {captions[beat.id]}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => go(prevIndex(shown))}
            disabled={shown === 0}
            aria-label={copy.previous}
            className="border border-line p-2 text-dim transition-colors enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-40"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => (atEnd ? go(0) : setPlaying((p) => !p))}
            aria-label={atEnd ? copy.replay : running ? copy.pause : copy.play}
            className="border border-line p-2 text-dim transition-colors hover:border-signal hover:text-signal"
          >
            {running ? (
              <Pause size={14} aria-hidden="true" />
            ) : (
              <Play size={14} aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => go(nextIndex(shown, beats.length))}
            disabled={atEnd}
            aria-label={copy.next}
            className="border border-line p-2 text-dim transition-colors enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-40"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>

          {/* The rail is the scrubber: one hit target per beat, so a reader
              can go straight back to the step they want to re-read. */}
          <div className="ml-1 flex flex-1 items-center gap-1.5">
            {beats.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}. ${captions[b.id]}`}
                aria-current={i === shown}
                className="group h-4 flex-1"
              >
                <span
                  className={`block h-1 w-full transition-colors ${
                    i <= shown ? "bg-signal" : "bg-line group-hover:bg-dim"
                  }`}
                />
              </button>
            ))}
          </div>

          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            {Math.round(arcProgress(shown, beats.length) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
