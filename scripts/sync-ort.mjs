#!/usr/bin/env node
// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Copies the onnxruntime-web WASM runtime into public/ so the browser can
 * fetch it from our own origin (ort.env.wasm.wasmPaths = "/ort/").
 *
 * Run from `postinstall` and `prebuild` rather than committing the binary:
 * it is 13 MB, and a copy in git would silently drift from the installed
 * package version. public/ort/ is gitignored for the same reason.
 *
 * Only the plain SIMD build ships. The `.jsep` build adds WebGPU but costs
 * 6.3 MB over the wire against 3.5 MB — and the CPU build already measured
 * 31 FPS single-threaded on YOLOX-Nano at 416×416, which is above what the
 * live demo needs. Threads are not an option regardless: they would require
 * COOP/COEP headers across the whole site.
 */

import { mkdir, copyFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = path.join(root, "node_modules/onnxruntime-web/dist");
const to = path.join(root, "public/ort");

const FILES = ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"];

if (!existsSync(from)) {
  // Not an error: `npm install` runs this before every dependency is present
  // in some flows, and the prebuild pass will catch it.
  console.log("  onnxruntime-web not installed yet — skipping ORT sync");
  process.exit(0);
}

await mkdir(to, { recursive: true });

let total = 0;
for (const file of FILES) {
  await copyFile(path.join(from, file), path.join(to, file));
  total += (await readFile(path.join(to, file))).byteLength;
}

console.log(`  ORT runtime synced to public/ort (${(total / 1048576).toFixed(1)} MB)`);
