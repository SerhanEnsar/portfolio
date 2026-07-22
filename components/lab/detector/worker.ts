// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
/// <reference lib="webworker" />

import { MODEL, className } from "./model.config";
import { decodeYolox, suppress } from "./postprocess";
import type { DetectorRequest, DetectorResponse } from "./protocol";

/**
 * The model lives here so the page never blocks on it.
 *
 * A 32 ms forward pass on the main thread would eat every frame budget on the
 * page — the scroll, the reticle, the shader. Off the main thread it costs the
 * visitor nothing but a worker.
 *
 * Preprocessing runs here too, on an OffscreenCanvas: the page hands over an
 * ImageBitmap and gets boxes back, and no pixel data is ever copied across the
 * boundary in the slow direction.
 */

const scope = self as unknown as DedicatedWorkerGlobalScope;

const SIZE = MODEL.inputSize;
const AREA = SIZE * SIZE;

/* The `onnxruntime-web` root entry resolves to the bundle that can also drive
   WebGPU, and that build reaches for `ort-wasm-simd-threaded.jsep.wasm` —
   6.3 MB this site deliberately does not ship. The `/wasm` subpath is the
   single-backend build, and it is the one F0 measured. */
type Ort = typeof import("onnxruntime-web/wasm");

let ort: Ort | null = null;
let session: import("onnxruntime-web").InferenceSession | null = null;

/** Letterbox target. Allocated once — a new canvas per frame would thrash. */
let canvas: OffscreenCanvas | null = null;
let context: OffscreenCanvasRenderingContext2D | null = null;
const input = new Float32Array(3 * AREA);

function reply(message: DetectorResponse, transfer?: Transferable[]) {
  scope.postMessage(message, transfer ?? []);
}

async function init() {
  const started = performance.now();

  ort = await import("onnxruntime-web/wasm");
  ort.env.wasm.wasmPaths = "/ort/";
  // The site sends no COOP/COEP headers, so cross-origin isolation — and with
  // it WASM threads — is unavailable by design. One thread is the real target.
  ort.env.wasm.numThreads = 1;

  session = await ort.InferenceSession.create(MODEL.url, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });

  canvas = new OffscreenCanvas(SIZE, SIZE);
  // Every frame ends in getImageData, which is the whole point of this canvas.
  context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("2d context unavailable in worker");

  reply({
    type: "ready",
    loadMs: Math.round(performance.now() - started),
    backend: "wasm · 1 thread",
    inputSize: SIZE,
  });
}

/**
 * Letterbox the frame into the model's square input and write it out as
 * planar BGR. Returns the scale factor, which the caller needs to map boxes
 * back onto the original frame.
 */
function preprocess(bitmap: ImageBitmap) {
  const ctx = context!;
  const ratio = Math.min(SIZE / bitmap.width, SIZE / bitmap.height);

  ctx.fillStyle = `rgb(${MODEL.padValue},${MODEL.padValue},${MODEL.padValue})`;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.drawImage(bitmap, 0, 0, bitmap.width * ratio, bitmap.height * ratio);

  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
  for (let i = 0; i < AREA; i++) {
    const p = i * 4;
    input[i] = data[p + 2];
    input[AREA + i] = data[p + 1];
    input[2 * AREA + i] = data[p];
  }

  return ratio;
}

async function detect(bitmap: ImageBitmap) {
  if (!ort || !session) return;

  const { width, height } = bitmap;
  const ratio = preprocess(bitmap);
  bitmap.close();

  const started = performance.now();
  const feeds = {
    [session.inputNames[0]]: new ort.Tensor("float32", input, [1, 3, SIZE, SIZE]),
  };
  const output = await session.run(feeds);
  const inferenceMs = performance.now() - started;

  const raw = output[session.outputNames[0]].data as Float32Array;
  const decoded = decodeYolox(raw, SIZE, MODEL.strides, MODEL.scoreThreshold);
  const kept = suppress(decoded, MODEL.nmsThreshold, MODEL.maxDetections);

  reply({
    type: "result",
    inferenceMs: Math.round(inferenceMs),
    // Undo the letterbox, then normalise: the overlay scales with the element
    // and never needs to know the input size.
    boxes: kept.map((d) => ({
      x: d.x / ratio / width,
      y: d.y / ratio / height,
      w: d.w / ratio / width,
      h: d.h / ratio / height,
      score: d.score,
      label: className(d.cls),
    })),
  });
}

scope.onmessage = async (event: MessageEvent<DetectorRequest>) => {
  try {
    if (event.data.type === "init") await init();
    else if (event.data.type === "frame") await detect(event.data.bitmap);
  } catch (error) {
    reply({
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
