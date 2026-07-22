// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Intersection over union — the metric behind mAP@50.
 *
 * Its own module because two places need exactly the same definition: the
 * annotation challenge, which scores a drawn box against known truth, and the
 * detector's NMS, which uses it to suppress duplicates. One metric, one
 * implementation.
 */

/** Axis-aligned box. Units are the caller's — both boxes must share them. */
export type Box = { x: number; y: number; w: number; h: number };

export function iou(a: Box, b: Box) {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);

  const overlap = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  if (overlap <= 0) return 0;

  const union = a.w * a.h + b.w * b.h - overlap;
  return union <= 0 ? 0 : overlap / union;
}
