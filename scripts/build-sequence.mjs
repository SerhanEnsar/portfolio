#!/usr/bin/env node
// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Turns a source clip into the scroll-scrubbable frame tiers under public/.
 *
 *   node scripts/build-sequence.mjs aerial ~/Downloads/aerial.mp4
 *   node scripts/build-sequence.mjs aerial --placeholder
 *
 * The AI step happens outside this script — generate a still, animate it to a
 * short clip, then hand the clip here. `--placeholder` synthesises a neutral
 * moving gradient so the site can be built and reviewed before any clip exists.
 *
 * ffmpeg has no webp encoder in the common Homebrew build, so frames land as
 * PNG and cwebp does the conversion.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, rm, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "node:os";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const manifest = JSON.parse(
  await readFile(path.join(root, "content/sequences.json"), "utf8"),
);

/** Quality per tier. The mobile tier leans harder because it is never full-bleed on a large display. */
const TIER_QUALITY = { 1600: 72, 900: 65 };

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/**
 * Per-scene colour grade, applied at frame extraction so it is reproducible
 * and so every tier is graded identically.
 *
 * Generated footage does not arrive in the site's palette and cannot be asked
 * to. `aerial` came back as bright warm daylight and needed the most work:
 * pulled down, cooled, desaturated, blacks crushed, so it sits beside the
 * near-black surfaces the rest of the page is built from. The other two were
 * close already and only get a nudge — over-grading them would cost the
 * shadow detail the detection pass needs to find anything.
 */
const GRADES = {
  aerial: [
    "eq=brightness=-0.15:contrast=1.32:saturation=0.38",
    "colorbalance=rs=-0.06:bs=0.11:rm=-0.06:bm=0.09:rh=-0.03:bh=0.06",
    "curves=all='0/0 0.25/0.10 0.6/0.54 1/0.92'",
  ].join(","),
  thermal: [
    // IR footage comes in warm and bright; pull it toward the cold near-black
    // palette but keep the hot signatures readable for the detection pass.
    "eq=brightness=-0.10:contrast=1.22:saturation=0.30",
    "colorbalance=rs=-0.04:bs=0.08:rm=-0.05:bm=0.07:rh=0.04:bh=-0.02",
  ].join(","),
  terrain: [
    "eq=brightness=-0.06:contrast=1.14:saturation=0.62",
    "colorbalance=bs=0.06:bm=0.03",
  ].join(","),
  logistics: "eq=brightness=-0.05:contrast=1.10:saturation=0.72",
  desk: [
    "eq=brightness=-0.08:contrast=1.12:saturation=0.66",
    "colorbalance=bs=0.05:bm=0.03",
  ].join(","),
  // Studio macro, close already — a light crush and desaturate to seat the
  // metal on near-black without killing the amber glint.
  optics: "eq=brightness=-0.07:contrast=1.14:saturation=0.70",
  // The closing field is warm by design; keep it warm, only deepen the black
  // between the points so it reads against the void.
  signal: "eq=brightness=-0.06:contrast=1.16:saturation=0.82",
  lattice: "",
  // Generated render comes back warmer and more saturated than the page — pull
  // it down, desaturate hard, and crush the background to near-black so the
  // motor sits on the void with only the amber ember surviving the grade.
  motor: [
    "eq=brightness=-0.10:contrast=1.20:saturation=0.55",
    "curves=all='0/0 0.28/0.12 0.6/0.55 1/0.94'",
  ].join(","),
};

async function requireBinary(name) {
  try {
    await run("which", [name]);
  } catch {
    fail(`${name} not found on PATH. Install it and run again.`);
  }
}

/**
 * A neutral stand-in scene: slow-drifting gradient in the site palette with
 * light grain. Not meant to ship — it exists so layout and scrub behaviour can
 * be reviewed without waiting on generation.
 */
async function synthesiseClip(target, seconds) {
  // Deliberately grain-free. Per-pixel noise is close to incompressible and
  // would make this stand-in far heavier than the footage it stands in for,
  // which would give a misleading read on the real payload budget.
  const filter = [
    `gradients=s=1920x1080:c0=0x080b0e:c1=0x1e262d:c2=0x121a22:nb_colors=3:speed=0.015:d=${seconds}:r=30`,
    "hue=s=0.25",
    "eq=brightness=-0.06",
    "vignette=PI/4.2",
  ].join(",");

  await run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-f", "lavfi",
    "-i", filter,
    "-frames:v", String(seconds * 30),
    "-pix_fmt", "yuv420p",
    target,
  ]);
}

async function clipDuration(clip) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    clip,
  ]);
  const duration = Number(stdout.trim());
  if (!duration) fail(`could not read a duration from ${clip}`);
  return duration;
}

async function extractFrames(clip, dir, count, grade = "") {
  await mkdir(dir, { recursive: true });
  // Resample onto exactly `count` frames whatever the clip's own rate is, so
  // scroll position maps to a frame by plain index lookup with no drift.
  const rate = (count / (await clipDuration(clip))).toFixed(6);
  // hqdn3d before encoding is the single biggest lever on payload size: film
  // grain is close to incompressible, and at these dimensions removing it is
  // invisible while cutting each frame roughly in half.
  await run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", clip,
    // Grade before denoise: hqdn3d on already-crushed blacks is far more
    // effective than denoising first and then crushing the noise it left.
    "-vf", [
      `fps=${rate}`,
      // Cover, then centre-crop. Generators do not all return exactly 16:9 —
      // 1928x1076 is common — and scaling on width alone leaves a frame too
      // short to crop 1080 out of.
      "scale=1920:1080:force_original_aspect_ratio=increase",
      "crop=1920:1080",
      ...(grade ? [grade] : []),
      "hqdn3d=4:3:6:4.5",
    ].join(","),
    "-frames:v", String(count),
    path.join(dir, "src-%04d.png"),
  ]);
}

async function encodeTier(sourceDir, outDir, width, quality) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const sources = (await readdir(sourceDir)).filter((f) => f.endsWith(".png")).sort();
  const limit = Math.max(2, os.cpus().length - 1);
  let cursor = 0;
  let bytes = 0;

  async function worker() {
    while (cursor < sources.length) {
      const i = cursor++;
      const out = path.join(outDir, `frame-${String(i).padStart(4, "0")}.webp`);
      await run("cwebp", [
        "-quiet",
        "-q", String(quality),
        "-resize", String(width), "0",
        "-m", "6",
        path.join(sourceDir, sources[i]),
        "-o", out,
      ]);
      bytes += (await readFile(out)).byteLength;
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return { count: sources.length, bytes };
}

async function writePoster(sourceDir, target) {
  const sources = (await readdir(sourceDir)).filter((f) => f.endsWith(".png")).sort();
  // First frame, blurred and dimmed — it stands in for the scene rather than
  // competing with it, and hides that it is a still.
  await run("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error",
    "-i", path.join(sourceDir, sources[0]),
    "-vf", "scale=1280:-2,gblur=sigma=8,eq=brightness=-0.04",
    "-q:v", "6",
    target,
  ]);
}

const [id, source] = process.argv.slice(2);

if (!id || !manifest.sequences[id]) {
  fail(
    `usage: build-sequence.mjs <${Object.keys(manifest.sequences).join("|")}> <clip.mp4 | --placeholder>`,
  );
}
if (!source) fail("pass a source clip path, or --placeholder");

await requireBinary("ffmpeg");
await requireBinary("cwebp");

const frames = manifest.sequences[id].frames;
const outRoot = path.join(root, "public/sequences", id);
const work = path.join(os.tmpdir(), `sequence-${id}-${Date.now()}`);

console.log(`\n  ${id} — ${frames} frames`);

let clip = source;
if (source === "--placeholder") {
  await mkdir(work, { recursive: true });
  clip = path.join(work, "clip.mp4");
  console.log("  synthesising placeholder clip");
  await synthesiseClip(clip, 5);
} else if (!existsSync(clip)) {
  fail(`no such clip: ${clip}`);
}

const framesDir = path.join(work, "frames");
// A placeholder is synthesised in the palette already; grading it would be
// grading our own gradient.
const grade = source === "--placeholder" ? "" : (GRADES[id] ?? "");
console.log(`  extracting frames${grade ? " (graded)" : ""}`);
await extractFrames(clip, framesDir, frames, grade);

await mkdir(outRoot, { recursive: true });
for (const tier of manifest.tiers) {
  const { count, bytes } = await encodeTier(
    framesDir,
    path.join(outRoot, String(tier)),
    tier,
    TIER_QUALITY[tier],
  );
  console.log(
    `  ${tier}w — ${count} frames, ${(bytes / 1048576).toFixed(1)} MB ` +
      `(${Math.round(bytes / count / 1024)} KB avg)`,
  );
}

await writePoster(framesDir, path.join(outRoot, "poster.jpg"));
await writeFile(
  path.join(outRoot, "manifest.json"),
  JSON.stringify(
    { id, frames, tiers: manifest.tiers, generated: new Date().toISOString(), placeholder: source === "--placeholder" },
    null,
    2,
  ) + "\n",
);

await rm(work, { recursive: true, force: true });
console.log(`  written to public/sequences/${id}\n`);
