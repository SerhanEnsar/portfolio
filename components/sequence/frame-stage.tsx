// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent } from "framer-motion";
import { posterPath, sequences, type SequenceId } from "@/content/sequences";
import { useFrameSequence } from "./use-frame-sequence";
import { useSceneActive, useSequenceProgress } from "./pinned-scene";

/** Never render more backing pixels than a 2× display can show. */
const MAX_DPR = 2;

/**
 * The scrub does not jump straight to the scrolled-to frame; it eases there.
 * `SMOOTH_TAU` is the time constant of that ease (smaller = snappier), and
 * `MAX_FPS` is a hard ceiling on how fast frames may advance however violently
 * the wheel is thrown — a fast flick then plays through as a smooth run rather
 * than a blur of skipped frames. `SNAP` ends the loop once close enough.
 */
const SMOOTH_TAU = 0.08;
const MAX_FPS = 110;
const SNAP = 0.25;

/**
 * Stage that scrubs a decoded frame sequence against scroll position.
 *
 * Frames are drawn to a canvas rather than swapped as <img> so there is no
 * decode on the critical path and no flash between frames.
 */
export function FrameStage({ id }: { id: SequenceId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useSceneActive();
  const progress = useSequenceProgress();
  const { frames, total, ready } = useFrameSequence(id, active);

  // `draw` runs from rAF and scroll callbacks, so it reads frames through a
  // ref rather than a closure that would go stale. Synced in an effect, which
  // is declared first so it lands before the effects below redraw.
  const framesRef = useRef(frames);
  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  const lastFrame = useRef(0);
  // Fractional frame the scrub is easing from, the frame it is easing toward,
  // the running rAF id, and the timestamp of the previous tick.
  const current = useRef(0);
  const target = useRef(0);
  const raf = useRef<number | null>(null);
  const lastTs = useRef(0);

  function draw(index: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    // Walk backwards to the nearest frame that has arrived, so scrubbing
    // through a partly-loaded scene holds instead of flickering to blank.
    let source = null;
    for (let i = index; i >= 0; i--) {
      const candidate = framesRef.current[i];
      if (candidate) {
        source = candidate;
        break;
      }
    }
    if (!source) return;

    const sw = source.width;
    const sh = source.height;
    if (!sw || !sh) return;

    // Cover fit — the scene always fills the viewport, never letterboxes.
    const scale = Math.max(canvas.width / sw, canvas.height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.drawImage(source, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  }

  // Canvas backing store follows the element box and the display density.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(lastFrame.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [ready]);

  // Eased scrub loop: ease `current` toward `target`, capped so a hard flick
  // plays through smoothly rather than snapping. Runs only while there is
  // ground to cover, then parks itself until the next scroll.
  function step(ts: number) {
    const dt = lastTs.current ? Math.min((ts - lastTs.current) / 1000, 0.05) : 0.016;
    lastTs.current = ts;

    const delta = target.current - current.current;
    const eased = delta * (1 - Math.exp(-dt / SMOOTH_TAU));
    const cap = MAX_FPS * dt;
    current.current += Math.sign(eased) * Math.min(Math.abs(eased), cap);

    if (Math.abs(target.current - current.current) < SNAP) current.current = target.current;

    const index = Math.min(total - 1, Math.max(0, Math.round(current.current)));
    if (index !== lastFrame.current) {
      lastFrame.current = index;
      draw(index);
    }

    if (current.current !== target.current) {
      raf.current = requestAnimationFrame(step);
    } else {
      raf.current = null;
      lastTs.current = 0;
    }
  }

  useMotionValueEvent(progress, "change", (value) => {
    target.current = Math.min(total - 1, Math.max(0, value * (total - 1)));
    if (raf.current === null && target.current !== current.current) {
      lastTs.current = 0;
      raf.current = requestAnimationFrame(step);
    }
  });

  useEffect(() => {
    if (ready) draw(lastFrame.current);
  }, [ready, frames]);

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  const showPoster = !ready;

  return (
    <>
      {/* Poster carries the scene until frames are drawable, and stays
          permanently for reduced-motion and data-saver visitors. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterPath(id)}
        alt={sequences[id].posterAlt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
          showPoster ? "opacity-100" : "opacity-0"
        }`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
          showPoster ? "opacity-0" : "opacity-100"
        }`}
      />
    </>
  );
}
