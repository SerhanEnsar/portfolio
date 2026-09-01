// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Measurements taken from the running Eye2S system, not invented for the page.
 *
 * Every number below was computed from the registry the desktop app writes at
 * `~/.eye2s/registry`: the stored fp16 embeddings were L2-normalised, averaged
 * per object into a prototype, and compared by cosine similarity. The frames
 * shown alongside them under `public/story/eye2s/` are the actual crops that
 * taught each object.
 *
 * Only objects whose six frames contain nothing but the object and a hand were
 * exported. Frames with a person in shot, and the medication the system was
 * also taught, are deliberately not part of the site.
 */

export const EMBEDDER = "dinov2_vits14";
export const EMBED_DIM = 768;
/** Frames the system takes to learn one object — the fixed cost of teaching. */
export const SAMPLES = 6;

export type LearnedObject = {
  id: string;
  /** Folder under `public/story/eye2s/` holding its six frames. */
  dir: string;
  label: string;
  /**
   * The object's own consistency: mean cosine similarity between its six
   * frames. The system stores this as `tau_self` and uses it as the bar a
   * candidate has to clear to be called this object.
   */
  tau: number;
  /** Worst pair among its own six frames — how far one object can stretch. */
  worstSelf: number;
};

export const OBJECTS: LearnedObject[] = [
  { id: "earbuds", dir: "earbuds", label: "earbuds", tau: 0.657, worstSelf: 0.527 },
  { id: "budscase", dir: "budscase", label: "BudsCase", tau: 0.611, worstSelf: 0.439 },
  { id: "phone", dir: "phone", label: "Phone", tau: 0.472, worstSelf: 0.258 },
];

/** Cosine similarity between object prototypes, keyed "a:b". */
export const BETWEEN: Record<string, number> = {
  "earbuds:budscase": 0.903,
  "earbuds:phone": 0.449,
  "budscase:phone": 0.505,
};

export function between(a: string, b: string): number {
  return BETWEEN[`${a}:${b}`] ?? BETWEEN[`${b}:${a}`] ?? 0;
}

/**
 * The pair the system flags. `earbuds` and `BudsCase` are the buds and the case
 * they live in — two identities that sit at 0.903, closer to each other than
 * `earbuds` is to its own six frames (0.657). A candidate matching both cannot
 * be resolved by score, so the label is shown as uncertain and automation is
 * held back rather than fired on a guess.
 */
export const CONFUSABLE = { a: "earbuds", b: "budscase" } as const;

export function frames(dir: string): string[] {
  return Array.from({ length: SAMPLES }, (_, i) => `/story/eye2s/${dir}/${i}.webp`);
}
