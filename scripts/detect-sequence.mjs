#!/usr/bin/env node
// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Runs the detector over a built frame sequence and writes what it found.
 *
 *   node scripts/detect-sequence.mjs aerial
 *
 * The point is that the boxes on the hero scene are not decoration. They are
 * this model's actual output on these actual frames, computed once here and
 * shipped as data, so the page can draw them without loading 3.6 MB of weights
 * on a visit that never asked for the detector.
 *
 * Preprocessing has to match the browser worker exactly or the boxes land in
 * the wrong place: letterbox to the top-left on flat 114 grey, no mean/std
 * normalisation, planar BGR. ffmpeg does the letterbox and hands back raw
 * RGB24, which keeps this script free of any image-decoding dependency.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MODEL, className } from "../components/lab/detector/model.config.ts";
import { decodeYolox, suppress } from "../components/lab/detector/postprocess.ts";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const SIZE = MODEL.inputSize;
const AREA = SIZE * SIZE;

function fail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/**
 * One frame as planar BGR, plus the letterbox ratio needed to map boxes back.
 * `pad` places the image at the top-left, matching the worker.
 */
async function loadFrame(file) {
  const { stdout } = await run(
    "ffmpeg",
    [
      "-y", "-hide_banner", "-loglevel", "error",
      "-i", file,
      "-vf",
      `scale=${SIZE}:${SIZE}:force_original_aspect_ratio=decrease,` +
        `pad=${SIZE}:${SIZE}:0:0:color=0x727272`,
      "-f", "rawvideo", "-pix_fmt", "rgb24",
      "-",
    ],
    { encoding: "buffer", maxBuffer: 1 << 28 },
  );

  const rgb = stdout;
  const input = new Float32Array(3 * AREA);
  for (let i = 0; i < AREA; i++) {
    const p = i * 3;
    input[i] = rgb[p + 2];
    input[AREA + i] = rgb[p + 1];
    input[2 * AREA + i] = rgb[p];
  }
  return input;
}

async function frameSize(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "csv=p=0",
    file,
  ]);
  const [w, h] = stdout.trim().split(",").map(Number);
  return { width: w, height: h };
}

const id = process.argv[2];
if (!id) fail("usage: detect-sequence.mjs <aerial|terrain|board>");

const dir = path.join(root, "public/sequences", id, "1600");
if (!existsSync(dir)) fail(`no built frames at ${dir} — run build-sequence first`);

const files = (await readdir(dir))
  .filter((f) => f.endsWith(".webp"))
  .sort()
  .map((f) => path.join(dir, f));

console.log(`\n  ${id} — ${files.length} frames`);

const { width, height } = await frameSize(files[0]);
const ratio = Math.min(SIZE / width, SIZE / height);

const ort = await import("onnxruntime-web");
ort.env.wasm.numThreads = 1;
ort.env.logLevel = "error";

const session = await ort.InferenceSession.create(
  path.join(root, "public/models", path.basename(MODEL.url)),
  { executionProviders: ["wasm"] },
);
const inputName = session.inputNames[0];

const frames = [];
let total = 0;

for (let i = 0; i < files.length; i++) {
  const input = await loadFrame(files[i]);
  const output = await session.run({
    [inputName]: new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]),
  });
  const raw = output[session.outputNames[0]].data;

  const decoded = decodeYolox(raw, SIZE, MODEL.strides, MODEL.scoreThreshold);
  const kept = suppress(decoded, MODEL.nmsThreshold).slice(0, MODEL.maxDetections);

  // Normalised to the frame so the page can draw at whatever size it renders.
  frames.push(
    kept.map((d) => ({
      x: +(d.x / ratio / width).toFixed(4),
      y: +(d.y / ratio / height).toFixed(4),
      w: +(d.w / ratio / width).toFixed(4),
      h: +(d.h / ratio / height).toFixed(4),
      s: +d.score.toFixed(3),
      l: className(d.cls),
    })),
  );
  total += kept.length;

  if ((i + 1) % 12 === 0 || i === files.length - 1) {
    process.stdout.write(`\r  ${i + 1}/${files.length} frames, ${total} detections`);
  }
}

const out = path.join(root, "content/detections", `${id}.json`);
await writeFile(out, JSON.stringify({ id, frames }) + "\n");
const size = (await readFile(out)).byteLength;

console.log(
  `\n  ${total} detections, ${(total / files.length).toFixed(1)} per frame` +
    `\n  written to content/detections/${id}.json (${Math.round(size / 1024)} KB)\n`,
);
