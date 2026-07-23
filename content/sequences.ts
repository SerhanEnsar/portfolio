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

export const sequenceIds = [
  "aerial",
  "thermal",
  "terrain",
  "logistics",
  "desk",
  "optics",
  "signal",
  "lattice",
  "motor",
] as const;

export type SequenceId = (typeof sequenceIds)[number];

export type SequenceSpec = {
  id: SequenceId;
  /**
   * How the scene is produced. "frames" scrubs a decoded WebP sequence;
   * "shader" runs live on the GPU — no download, and it reacts to the pointer.
   * Photoreal scenes have to be frames; abstract ones are better as shaders.
   */
  kind: "frames" | "shader";
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
    kind: "frames",
    frames: manifest.sequences.aerial.frames,
    keyframePrompt:
      "Cinematic aerial reconnaissance still from a fixed-wing UAV electro-optical camera, looking down at a coastal Aegean industrial area at dusk. Cold desaturated slate and graphite tones, thin atmospheric haze between camera and ground, faint amber highlights on roads. Shot on a long lens, slight barrel distortion, fine sensor grain. No text, no overlays, no UI, no people visible.",
    motionPrompt:
      "One continuous slow descent. The camera loses altitude steadily and the ground detail resolves from soft haze into sharp structure. No cuts, no rotation, no speed change, constant single direction throughout.",
    posterAlt:
      "Aerial reconnaissance view descending toward a coastal industrial area at dusk",
  },
  thermal: {
    id: "thermal",
    kind: "frames",
    frames: manifest.sequences.thermal.frames,
    keyframePrompt:
      "Infrared thermal camera still from a fixed-wing UAV, white-hot palette on a near-black ground, looking down at a coastal industrial area at night. A few warm figures and vehicles glow bright against cold graphite structures. Faint amber bloom on the hottest points, heavy sensor grain, thin atmospheric wash. No text, no overlays, no UI.",
    motionPrompt:
      "One continuous slow descent with a gentle lateral drift. Warm signatures resolve out of the cold field and grow as the camera loses altitude. No cuts, no rotation, no speed change.",
    posterAlt:
      "Thermal infrared reconnaissance view of warm signatures over a cold industrial area at night",
  },
  terrain: {
    id: "terrain",
    kind: "frames",
    frames: manifest.sequences.terrain.frames,
    keyframePrompt:
      "Low ground-level tracking still of a six-wheeled rocker-bogie unmanned ground vehicle on a marked off-road test course, a raised loose-rock mound directly in its path. A red octagonal STOP sign on a steel post and course marker poles stand at the track edge. Overcast flat light, cold graphite and dust tones, shallow depth of field with dust in the air. Documentary field-test look, not a render. No text, no overlays, no UI, no people visible.",
    motionPrompt:
      "One continuous low tracking shot alongside the vehicle as it drives straight up and over the rock mound in its path, front wheels lifting and the chassis pitching nose-up before it tips over the crest. It stays centred on the marked track and does not steer around the obstacle. Foreground rocks sweep past low and close. No cuts, no zoom, no direction change.",
    posterAlt:
      "Six-wheeled rocker-bogie ground vehicle climbing a rock mound on a marked test course",
  },
  logistics: {
    id: "logistics",
    kind: "frames",
    frames: manifest.sequences.logistics.frames,
    keyframePrompt:
      "Low three-quarter still of a compact autonomous delivery robot on a warehouse test floor: a four-axis servo arm folded over a small cargo bay, an RFID reader panel on the front, a zipline hook stowed on top. Brushed dark chassis, cold key light with a single warm amber status LED. Shallow depth of field, industrial matte floor. Documentary look, not a render. No text, no logos, no overlays.",
    motionPrompt:
      "One continuous slow arc around the robot as the servo arm lifts a parcel toward the cargo bay. The camera orbits close so the arm and RFID panel sweep across frame and grow. No cuts, no rack focus jumps, constant speed and direction.",
    posterAlt:
      "Autonomous delivery robot with a servo arm lifting a parcel on a warehouse floor",
  },
  desk: {
    id: "desk",
    kind: "frames",
    frames: manifest.sequences.desk.frames,
    keyframePrompt:
      "Low macro still across an embedded-systems workbench at night: an ESP32 board on a breadboard wired to sensors, a soldering iron and jumper leads, a laptop screen glowing cold blue-grey out of focus behind. A single warm amber status LED on the board. Deep shadows, near-black surfaces, shallow depth of field, fine grain. Documentary look, not a render. No text, no logos, no overlays.",
    motionPrompt:
      "One continuous low dolly along the workbench, following the jumper wires from the board toward the glowing laptop. Foreground components sweep past close while the screen resolves behind. No cuts, no rack focus jumps, constant speed and direction.",
    posterAlt:
      "Macro view travelling along an embedded-systems workbench with a wired microcontroller at night",
  },
  optics: {
    id: "optics",
    kind: "frames",
    frames: manifest.sequences.optics.frames,
    keyframePrompt:
      "Extreme macro still of a precision camera optic — the front element of a lens or an electro-optical sensor module — dark anodised metal housing, concentric machined rings, a deep glass element catching a thin rim of cold light. Near-black background, desaturated graphite and gunmetal tones, a single warm amber specular glint on the glass edge and one faint ice-blue reflection deep in the lens. Very shallow depth of field, dust-free studio macro, fine grain. No text, no logos, no UI.",
    motionPrompt:
      "One continuous slow orbit around the lens element, the camera arcing close so the machined rings and the glass sweep across frame and the amber glint travels along the rim as the angle changes. No cuts, no focus jumps, constant speed and a single direction.",
    posterAlt: "Macro view orbiting a precision camera lens catching a thin rim of light",
  },
  signal: {
    id: "signal",
    kind: "frames",
    frames: manifest.sequences.signal.frames,
    keyframePrompt:
      "Abstract dark field of countless small out-of-focus light points suspended in deep three-dimensional space, like a loose constellation or a network of nodes seen through haze. Near-black background. Most points are soft warm bone-white and pale amber; only a few cold ice-blue sparks for depth. Heavy bokeh, volumetric atmosphere, fine grain, denser toward the centre and thinning to pure black at the edges. Cinematic, shot on a long lens wide open. No text, no UI, no recognisable objects.",
    motionPrompt:
      "One continuous slow forward push through the field of light points. Near points drift past the camera and blur out while deeper layers resolve and grow, giving strong parallax and depth. Gentle drift, points twinkling softly. No cuts, no rotation, no speed change.",
    posterAlt: "Abstract field of warm out-of-focus light points receding into darkness",
  },
  lattice: {
    id: "lattice",
    kind: "shader",
    frames: 0,
    keyframePrompt:
      "Abstract dark field of fine luminous particles connected by hairline links, forming a loose irregular lattice in three-dimensional depth. Cold ice-blue points with occasional amber nodes on a near-black ground. Volumetric, softly out of focus toward the edges. No text, no geometry that reads as a logo, no UI.",
    motionPrompt:
      "One continuous forward push through the particle field, depth layers parallaxing past the camera. Constant speed, no rotation, no cuts.",
    posterAlt: "Abstract field of luminous particles connected by hairline links",
  },
  motor: {
    id: "motor",
    kind: "frames",
    frames: manifest.sequences.motor.frames,
    keyframePrompt:
      "Cinematic technical cutaway of an electric motor, seen straight-on and centered. Laminated graphite-grey steel stator, tightly wound copper coils glowing only as a faint muted ember — desaturated warm amber, not bright gold. A rotor sits inside a barely-there magnetic field drawn as thin dim luminous lines. Fine engineering-schematic overlays sit over the surface like a quiet instrument readout. Heavily desaturated near-monochrome palette: matte graphite, gunmetal and bone-white steel dominate, the only colour a restrained amber ember. Very dark near-black background, low brightness, low contrast, matte industrial finish, subtle sensor grain. No text, no logos, no UI.",
    motionPrompt:
      "One continuous slow rotation of the motor around its fixed central axis, a single unbroken turn at constant speed. The amber ember pulses gently in sync; the field lines drift softly. No camera movement, no zoom, no cuts, no speed change.",
    posterAlt:
      "Technical cutaway of an electric motor with faintly glowing copper coils on a near-black ground",
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
