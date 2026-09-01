// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Beat timing for the project narratives.
 *
 * A story is a short arc of beats that advance on their own, the way the
 * cinematic scenes do — but built from DOM rather than video, so there is
 * nothing to download and the whole thing still reads with motion switched
 * off. The pure part lives here; the components own the pixels.
 */

export type Beat = {
  /** Stable key, and the dictionary key its caption is read from. */
  id: string;
  /** How long this beat holds before the story moves on, in milliseconds. */
  hold: number;
};

/** Long enough to read a caption without the arc dragging. */
export const DEFAULT_HOLD = 3200;

export function beats(ids: string[], hold = DEFAULT_HOLD): Beat[] {
  return ids.map((id) => ({ id, hold }));
}

/**
 * Where the next step lands. Stories do not loop: the last beat is the
 * conclusion and staying there is the point — it is also the readable
 * end state someone with reduced motion is shown from the start.
 */
export function nextIndex(index: number, count: number): number {
  return Math.min(index + 1, count - 1);
}

export function prevIndex(index: number): number {
  return Math.max(index - 1, 0);
}

export function isLast(index: number, count: number): boolean {
  return index >= count - 1;
}

/** 0–1 across the whole arc, for the progress rail. */
export function arcProgress(index: number, count: number): number {
  if (count <= 1) return 1;
  return index / (count - 1);
}
