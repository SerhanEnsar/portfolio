// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Visual-odometry puzzle logic, kept free of the DOM so it can be reasoned
 * about and tested on its own — the component owns the pixels, this owns the
 * geometry and the scoring.
 *
 * A UAV flew one path over a world and sampled overlapping frames along it.
 * With GPS gone, the only way back to the path is to register each frame
 * against the last. Because every frame is a crop of the same world, the
 * correct placement of frame i relative to i-1 is exactly the true motion
 * between them — so a player's placement error is, honestly, the registration
 * error visual odometry fights, and it accumulates into drift the same way.
 */

export type Vec = { x: number; y: number };

/** Frames in one run; there are VO_FRAMES-1 registrations to solve. */
export const VO_FRAMES = 5;
/** Side of the world bitmap the frames are cropped from (px). */
export const WORLD = 1200;
/** Side of a single frame crop (world px). */
export const FRAME = 360;
/**
 * Ground sampling distance implied by the altitude — turns pixel drift into a
 * distance the reader can feel, the way TUYGUN is scored against ground truth.
 */
export const METERS_PER_PX = 0.32;

/** Alignment error (world px) at or below which a frame can be locked. */
export const LOCK_TOL = 16;
/** Error beyond which the alignment meter reads zero. */
export const ALIGN_MAX = 170;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const len = (a: Vec) => Math.hypot(a.x, a.y);

/**
 * The true flight path, as frame-centre positions in world coords. It drifts
 * steadily across the world with a gentle vertical wander, and every centre is
 * kept far enough from the edge that the whole crop stays inside the world and
 * consecutive frames keep a large shared overlap to align on.
 */
export function flightPath(seed: number): Vec[] {
  const r = rng(seed);
  const half = FRAME / 2;
  const lo = half + 26;
  const hi = WORLD - half - 26;
  const pts: Vec[] = [];
  let x = lo + r() * 40;
  let y = (lo + hi) / 2 + (r() - 0.5) * (hi - lo) * 0.35;
  for (let i = 0; i < VO_FRAMES; i += 1) {
    pts.push({ x: clamp(x, lo, hi), y: clamp(y, lo, hi) });
    x += FRAME * 0.44;
    y += (r() - 0.5) * FRAME * 0.5;
  }
  return pts;
}

/** True motion between frame i and i-1. */
export const stepOffset = (path: Vec[], i: number): Vec =>
  sub(path[i], path[i - 1]);

/** A plausible first guess for a step — the truth, knocked off by a jitter the
 *  player has to correct. */
export function jitter(magnitude = 58): Vec {
  return {
    x: (Math.random() - 0.5) * 2 * magnitude,
    y: (Math.random() - 0.5) * 2 * magnitude,
  };
}

/** Meter reading 0..1 from a placement error in world px. */
export const alignment = (err: number) => clamp(1 - err / ALIGN_MAX, 0, 1);

export type VoTier = "precise" | "solid" | "loose" | "lost";

export function tierFor(driftMeters: number): VoTier {
  if (driftMeters < 2) return "precise";
  if (driftMeters < 5) return "solid";
  if (driftMeters < 10) return "loose";
  return "lost";
}

/** Accumulated drift, in metres, from the per-step placement errors. */
export function drift(errors: Vec[]): number {
  const sum = errors.reduce(add, { x: 0, y: 0 });
  return len(sum) * METERS_PER_PX;
}
