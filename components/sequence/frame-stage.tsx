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
  const pending = useRef<number | null>(null);

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

  useMotionValueEvent(progress, "change", (value) => {
    const index = Math.min(total - 1, Math.max(0, Math.round(value * (total - 1))));
    if (index === lastFrame.current) return;
    lastFrame.current = index;

    // One draw per animation frame, no matter how fast the wheel spins.
    if (pending.current !== null) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = null;
      draw(lastFrame.current);
    });
  });

  useEffect(() => {
    if (ready) draw(lastFrame.current);
  }, [ready, frames]);

  useEffect(
    () => () => {
      if (pending.current !== null) cancelAnimationFrame(pending.current);
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
