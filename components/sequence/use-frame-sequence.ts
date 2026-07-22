// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useRef, useState } from "react";
import {
  framePath,
  sequences,
  type SequenceId,
  type SequenceTier,
} from "@/content/sequences";

/** Simultaneous fetches. Higher just queues in the browser and starves nothing. */
const CONCURRENCY = 6;

/** Poster stays until this share of frames can be drawn. */
const READY_RATIO = 0.6;

export type FrameSequence = {
  /** Sparse until loading finishes; index maps 1:1 to frame number. */
  frames: (ImageBitmap | HTMLImageElement | null)[];
  /** Desktop frame count — callers map scroll progress against this. */
  total: number;
  /**
   * Enough frames decoded to swap the poster out. Stays false forever when
   * loading was skipped, which leaves the poster up — the intended fallback.
   */
  ready: boolean;
};

/**
 * Decodes a frame off the main thread where possible. `createImageBitmap`
 * keeps decode work off the compositor; the <img> path is the Safari-safe
 * fallback and still avoids a layout pass because it is never attached.
 */
async function decodeFrame(src: string, signal: AbortSignal) {
  if (typeof createImageBitmap === "function") {
    const response = await fetch(src, { signal });
    if (!response.ok) throw new Error(`frame ${src}: ${response.status}`);
    return createImageBitmap(await response.blob());
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`frame ${src}`));
    img.src = src;
  });
}

/** Reasons to never download a few megabytes of frames. */
function shouldSkip() {
  if (typeof window === "undefined") return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;

  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  if (connection?.saveData) return true;
  if (connection?.effectiveType && /^(slow-)?2g$/.test(connection.effectiveType)) {
    return true;
  }
  return false;
}

/**
 * Loads a scene's frames once `active` turns true, so off-screen sequences
 * cost nothing until the reader is nearly there.
 */
export function useFrameSequence(id: SequenceId, active: boolean): FrameSequence {
  const spec = sequences[id];
  const [frames, setFrames] = useState<(ImageBitmap | HTMLImageElement | null)[]>(
    () => new Array(spec.frames).fill(null),
  );
  const [ready, setReady] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!active || started.current) return;
    started.current = true;

    if (shouldSkip()) return;

    const controller = new AbortController();
    const tier: SequenceTier = window.innerWidth >= 1024 ? 1600 : 900;
    // Narrow screens play every other frame: half the bytes, and at phone
    // scroll speeds the dropped frames are not perceivable.
    const step = tier === 1600 ? 1 : 2;
    const indices = Array.from({ length: spec.frames }, (_, i) => i).filter(
      (i) => i % step === 0,
    );

    const loaded = new Array<ImageBitmap | HTMLImageElement | null>(spec.frames).fill(
      null,
    );
    let done = 0;
    let cursor = 0;
    let cancelled = false;

    async function worker() {
      while (!cancelled && cursor < indices.length) {
        const index = indices[cursor++];
        try {
          loaded[index] = await decodeFrame(
            framePath(id, tier, index),
            controller.signal,
          );
        } catch {
          // A missing frame is survivable — the scrubber holds the previous one.
        }
        done++;
        if (!cancelled && done >= indices.length * READY_RATIO) setReady(true);
      }
    }

    Promise.all(Array.from({ length: CONCURRENCY }, worker)).then(() => {
      if (cancelled) return;
      setFrames([...loaded]);
      setReady(true);
    });

    // Publish partial progress so early frames can draw before the tail lands.
    const tick = setInterval(() => {
      if (!cancelled) setFrames([...loaded]);
    }, 400);

    return () => {
      cancelled = true;
      clearInterval(tick);
      controller.abort();
    };
  }, [active, id, spec.frames]);

  return { frames, total: spec.frames, ready };
}
