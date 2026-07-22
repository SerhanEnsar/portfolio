// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/** The only contract between the page and the worker running the model. */

export type DetectorRequest =
  | { type: "init" }
  | { type: "frame"; bitmap: ImageBitmap };

/** A drawn box: normalised 0..1 against the source frame, so the overlay can
 *  scale with the element without knowing anything about the model. */
export type DetectorBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  score: number;
  label: string;
};

export type DetectorResponse =
  | { type: "ready"; loadMs: number; backend: string; inputSize: number }
  | { type: "result"; boxes: DetectorBox[]; inferenceMs: number }
  | { type: "error"; message: string };
