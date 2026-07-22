// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import manifest from "./sequences.json";

/**
 * Scroll-scrubbed scenes. Frames live in `public/sequences/<id>/<width>/`
 * and are produced by `scripts/build-sequence.mjs`.
 *
 * Frame counts and tier widths live in `sequences.json` because the build
 * script needs them too — one source, read from both sides. The prompts and
 * copy below are runtime/authoring concerns and stay here.
 */

export const sequenceIds = ["aerial", "terrain", "board", "lattice"] as const;

export type SequenceId = (typeof sequenceIds)[number];

export type SequenceSpec = {
  id: SequenceId;
  /** Frames in the desktop tier. Mobile plays every other frame. */
  frames: number;
  /** Prompt for the still that seeds the shot. */
  keyframePrompt: string;
  /**
   * Camera instruction for image-to-video. One continuous move, no cuts —
   * a scrub has to read as a single take or it feels broken.
   */
  motionPrompt: string;
  /** Shown while frames decode, and the permanent fallback on reduced motion. */
  posterAlt: string;
};

export const sequences: Record<SequenceId, SequenceSpec> = {
  aerial: {
    id: "aerial",
    frames: manifest.sequences.aerial.frames,
    keyframePrompt:
      "Cinematic aerial reconnaissance still from a fixed-wing UAV electro-optical camera, looking down at a coastal Aegean industrial area at dusk. Cold desaturated slate and graphite tones, thin atmospheric haze between camera and ground, faint amber highlights on roads. Shot on a long lens, slight barrel distortion, fine sensor grain. No text, no overlays, no UI, no people visible.",
    motionPrompt:
      "One continuous slow descent. The camera loses altitude steadily and the ground detail resolves from soft haze into sharp structure. No cuts, no rotation, no speed change, constant single direction throughout.",
    posterAlt:
      "Aerial reconnaissance view descending toward a coastal industrial area at dusk",
  },
  terrain: {
    id: "terrain",
    frames: manifest.sequences.terrain.frames,
    keyframePrompt:
      "Low ground-level tracking still of a six-wheeled rocker-bogie unmanned ground vehicle crossing dry rocky terrain. Overcast flat light, cold graphite and dust tones, shallow depth of field with dust suspended in air. Documentary field-test look, not a render. No text, no overlays, no UI, no people visible.",
    motionPrompt:
      "One continuous lateral tracking shot alongside the vehicle as it drives forward over uneven ground. Camera holds constant height and speed. No cuts, no zoom, no direction change.",
    posterAlt:
      "Six-wheeled rocker-bogie ground vehicle crossing rocky terrain in flat overcast light",
  },
  board: {
    id: "board",
    frames: manifest.sequences.board.frames,
    keyframePrompt:
      "Extreme macro still of a dark green development microcontroller board, ESP32-class module with castellated edges, fine copper traces and surface-mount components. Very shallow depth of field, cold key light with a single warm amber specular highlight on a solder joint. Dust-free studio macro. No text, no logos, no overlays.",
    motionPrompt:
      "One continuous slow dolly across the board surface, following the traces. Focus plane travels with the camera. No cuts, no rack focus jumps, constant speed and direction.",
    posterAlt: "Macro view travelling across the copper traces of a microcontroller board",
  },
  lattice: {
    id: "lattice",
    frames: manifest.sequences.lattice.frames,
    keyframePrompt:
      "Abstract dark field of fine luminous particles connected by hairline links, forming a loose irregular lattice in three-dimensional depth. Cold ice-blue points with occasional amber nodes on a near-black ground. Volumetric, softly out of focus toward the edges. No text, no geometry that reads as a logo, no UI.",
    motionPrompt:
      "One continuous forward push through the particle field, depth layers parallaxing past the camera. Constant speed, no rotation, no cuts.",
    posterAlt: "Abstract field of luminous particles connected by hairline links",
  },
};

/** Tier widths in pixels — desktop first, mobile second. */
export const sequenceTiers = manifest.tiers as readonly number[];
export type SequenceTier = 1600 | 900;

export function framePath(id: SequenceId, tier: SequenceTier, index: number) {
  return `/sequences/${id}/${tier}/frame-${String(index).padStart(4, "0")}.webp`;
}

export function posterPath(id: SequenceId) {
  return `/sequences/${id}/poster.jpg`;
}
