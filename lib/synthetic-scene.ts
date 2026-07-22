// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Draws synthetic aerial frames with exact ground truth.
 *
 * This mirrors the Blender/OpenCV dataset generator behind LAÇİN and EGE
 * ODBARS: the scene is composed, so the label is known rather than eyeballed.
 * That is the whole point of synthetic data — and it is why the annotation
 * challenge can score a guess against a box that is provably correct.
 *
 * Canvas 2D rather than WebGL. Objects have to land at exact coordinates and
 * the result has to be readable back out as a PNG, both of which are simpler
 * on a 2D context than in a shader.
 */

export type SensorMode = "eo" | "ir";

export type SceneParams = {
  /** Same seed, same scene — rounds are reproducible and shareable. */
  seed: number;
  /** 0 = low pass, targets large. 1 = high altitude, targets small. */
  altitude: number;
  /** 0 = dawn, 1 = midday. Ignored in IR. */
  timeOfDay: number;
  /** Atmospheric haze between camera and ground. */
  haze: number;
  sensor: SensorMode;
  /** Sensor grain. */
  noise: number;
  /** Stuck pixels — the failure LAÇİN's augmentation trains against. */
  deadPixels: number;
  /** How many vehicles to place. */
  targets: number;
};

export type Target = {
  /** Normalised 0..1, top-left origin. */
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
};

export const DEFAULT_PARAMS: SceneParams = {
  seed: 1,
  altitude: 0.5,
  timeOfDay: 0.6,
  haze: 0.35,
  sensor: "eo",
  noise: 0.25,
  deadPixels: 0.1,
  targets: 1,
};

/** Small, fast, deterministic. Good enough for scene layout. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Ground colour before haze, per sensor and time of day. */
function groundTone(params: SceneParams, rng: Rng) {
  if (params.sensor === "ir") {
    const v = 14 + rng() * 10;
    return `rgb(${v}, ${v + 2}, ${v + 4})`;
  }
  // Dawn is browner and darker; midday is greyer and flatter.
  const warm = 1 - params.timeOfDay;
  const base = lerp(38, 72, params.timeOfDay);
  return `rgb(${Math.round(base + warm * 22)}, ${Math.round(base + warm * 8)}, ${Math.round(base - warm * 4)})`;
}

function drawTerrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: SceneParams,
  rng: Rng,
) {
  ctx.fillStyle = groundTone(params, rng);
  ctx.fillRect(0, 0, w, h);

  // Soft overlapping blobs read as fields and scrub at this scale, and cost
  // far less than real noise.
  const patches = 90;
  for (let i = 0; i < patches; i++) {
    const cx = rng() * w;
    const cy = rng() * h;
    const r = (0.04 + rng() * 0.16) * Math.min(w, h);
    const shade = rng();

    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const tint =
      params.sensor === "ir"
        ? `rgba(${40 + shade * 40}, ${44 + shade * 42}, ${48 + shade * 44},`
        : `rgba(${60 + shade * 55}, ${58 + shade * 50}, ${46 + shade * 38},`;
    gradient.addColorStop(0, `${tint} ${0.16 + shade * 0.14})`);
    gradient.addColorStop(1, `${tint} 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // A road or two gives the eye scale and something to mistake for a target.
  const roads = 1 + Math.floor(rng() * 2);
  for (let i = 0; i < roads; i++) {
    ctx.save();
    ctx.translate(rng() * w, rng() * h);
    ctx.rotate((rng() - 0.5) * Math.PI);
    ctx.fillStyle =
      params.sensor === "ir" ? "rgba(70,74,80,0.35)" : "rgba(120,116,104,0.30)";
    ctx.fillRect(-w, -h * 0.012, w * 2, h * 0.024);
    ctx.restore();
  }
}

function drawVehicle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  width: number,
  angle: number,
  params: SceneParams,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  if (params.sensor === "ir") {
    // Engine block runs hot; the body is warm against cold ground.
    ctx.fillStyle = "rgba(232,236,240,0.88)";
    ctx.fillRect(-length / 2, -width / 2, length, width);
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.fillRect(length * 0.1, -width / 2, length * 0.32, width);
  } else {
    ctx.fillStyle = "rgba(26,28,32,0.92)";
    ctx.fillRect(-length / 2, -width / 2, length, width);
    // Specular top face — what actually makes it read as a vehicle from above.
    ctx.fillStyle = "rgba(150,155,162,0.5)";
    ctx.fillRect(-length * 0.28, -width * 0.32, length * 0.5, width * 0.64);
    // Cast shadow, offset by sun position.
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(-length / 2 + width * 0.35, width / 2, length, width * 0.4);
  }

  ctx.restore();
}

/** Per-pixel pass: haze, grain and stuck pixels, in that order. */
function applySensorArtifacts(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: SceneParams,
  rng: Rng,
) {
  if (params.noise <= 0 && params.deadPixels <= 0) return;

  const image = ctx.getImageData(0, 0, w, h);
  const data = image.data;
  const grain = params.noise * 46;

  for (let i = 0; i < data.length; i += 4) {
    if (grain > 0) {
      const n = (rng() - 0.5) * grain;
      data[i] = Math.max(0, Math.min(255, data[i] + n));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + n));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + n));
    }
  }

  // Dead pixels are sparse and absolute — either stuck bright or stuck black.
  const count = Math.round(params.deadPixels * w * h * 0.0016);
  for (let i = 0; i < count; i++) {
    const p = (Math.floor(rng() * h) * w + Math.floor(rng() * w)) * 4;
    const stuckWhite = rng() > 0.45;
    data[p] = data[p + 1] = data[p + 2] = stuckWhite ? 255 : 0;
  }

  ctx.putImageData(image, 0, 0);
}

/**
 * Renders a scene and returns its targets in normalised coordinates.
 * The returned boxes are the ground truth — they are where the objects were
 * drawn, not an estimate of where they ended up.
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  params: SceneParams,
): Target[] {
  const rng = mulberry32(params.seed);

  drawTerrain(ctx, w, h, params, rng);

  const targets: Target[] = [];
  const placed: Target[] = [];

  // Higher altitude means smaller objects — the reason small-object detection
  // is the hard part of the aerial problem.
  const scale = lerp(0.11, 0.035, params.altitude);

  for (let i = 0; i < params.targets; i++) {
    let box: Target | null = null;

    // A few attempts to avoid overlap; targets that cannot find room are
    // dropped rather than stacked.
    for (let attempt = 0; attempt < 24 && !box; attempt++) {
      const length = scale * w * (0.85 + rng() * 0.4);
      const width = length * (0.4 + rng() * 0.12);
      const angle = rng() * Math.PI * 2;

      // Axis-aligned bounds of the rotated body.
      const cos = Math.abs(Math.cos(angle));
      const sin = Math.abs(Math.sin(angle));
      const bw = length * cos + width * sin;
      const bh = length * sin + width * cos;

      const cx = lerp(bw, w - bw, rng());
      const cy = lerp(bh, h - bh, rng());

      const candidate: Target = {
        x: (cx - bw / 2) / w,
        y: (cy - bh / 2) / h,
        w: bw / w,
        h: bh / h,
        label: "vehicle",
      };

      const clashes = placed.some(
        (other) =>
          Math.abs(other.x - candidate.x) < (other.w + candidate.w) * 0.8 &&
          Math.abs(other.y - candidate.y) < (other.h + candidate.h) * 0.8,
      );
      if (clashes) continue;

      drawVehicle(ctx, cx, cy, length, width, angle, params);
      box = candidate;
    }

    if (box) {
      placed.push(box);
      targets.push(box);
    }
  }

  // Haze sits over everything, including the targets — that is what makes
  // altitude hard rather than just small.
  if (params.haze > 0) {
    const tone = params.sensor === "ir" ? "18,22,28" : "150,160,172";
    ctx.fillStyle = `rgba(${tone},${params.haze * 0.42})`;
    ctx.fillRect(0, 0, w, h);
  }

  applySensorArtifacts(ctx, w, h, params, rng);

  return targets;
}

/** Intersection over union, the metric behind mAP@50. */
export function iou(a: Target, b: Target) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  const overlap = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (overlap <= 0) return 0;

  const union = a.w * a.h + b.w * b.h - overlap;
  return union <= 0 ? 0 : overlap / union;
}
