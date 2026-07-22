// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

import { iou, type Box } from "@/lib/iou";

/**
 * Turns the model's raw tensor into boxes.
 *
 * The export leaves the head undecoded: every row is an offset from its grid
 * cell in units of that cell's stride, so the decode below is the browser's
 * copy of YOLOX's own `demo_postprocess`. Objectness and class scores already
 * have sigmoid applied inside the graph, which is why nothing here squashes
 * them again.
 */

export type Detection = Box & { score: number; cls: number };

/**
 * @param raw   flat [anchors × channels] tensor data
 * @param size  square input the model saw, in pixels
 * @returns boxes in that same input-pixel space, top-left origin
 */
export function decodeYolox(
  raw: Float32Array,
  size: number,
  strides: readonly number[],
  scoreThreshold: number,
): Detection[] {
  const anchors = strides.reduce((sum, s) => sum + (size / s) ** 2, 0);
  // Derived, not hard-coded: a model with a different class count decodes
  // without touching this file.
  const channels = raw.length / anchors;
  const classes = channels - 5;
  if (!Number.isInteger(channels) || classes < 1) return [];

  const out: Detection[] = [];
  let anchor = 0;

  for (const stride of strides) {
    const cells = size / stride;
    for (let gy = 0; gy < cells; gy++) {
      for (let gx = 0; gx < cells; gx++, anchor++) {
        const base = anchor * channels;

        const objectness = raw[base + 4];
        // Cheap reject before scanning 80 class scores — objectness alone
        // caps the final score, so anything hopeless here stays hopeless.
        if (objectness < scoreThreshold) continue;

        let best = 0;
        let bestScore = 0;
        for (let c = 0; c < classes; c++) {
          const s = raw[base + 5 + c];
          if (s > bestScore) {
            bestScore = s;
            best = c;
          }
        }

        const score = objectness * bestScore;
        if (score < scoreThreshold) continue;

        const cx = (raw[base] + gx) * stride;
        const cy = (raw[base + 1] + gy) * stride;
        const w = Math.exp(raw[base + 2]) * stride;
        const h = Math.exp(raw[base + 3]) * stride;

        out.push({ x: cx - w / 2, y: cy - h / 2, w, h, score, cls: best });
      }
    }
  }

  return out;
}

/**
 * Class-agnostic non-maximum suppression.
 *
 * Agnostic rather than per-class on purpose: when the same object is scored
 * as both `car` and `truck`, a viewer reads two stacked boxes as a bug, not as
 * two hypotheses.
 */
export function suppress(
  detections: Detection[],
  threshold: number,
  limit: number,
): Detection[] {
  const ranked = [...detections].sort((a, b) => b.score - a.score);
  const kept: Detection[] = [];

  for (const candidate of ranked) {
    if (kept.length >= limit) break;
    if (kept.some((k) => iou(k, candidate) > threshold)) continue;
    kept.push(candidate);
  }

  return kept;
}
