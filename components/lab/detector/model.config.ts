// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Everything that is specific to the detector's weights, in one file.
 *
 * The demo ships YOLOX-Nano because it is Apache-2.0: an Ultralytics YOLO
 * would put the whole public repo into an AGPL-3.0 conversation for the sake
 * of a portfolio toy. Swapping in my own LAÇİN weights means exporting to
 * ONNX and editing this file — nothing else in `components/lab/detector/`
 * knows what the model is.
 *
 * The output layout below is the one thing that is not free to change: the
 * decoder in `postprocess.ts` assumes a YOLOX head (raw grid offsets, sigmoid
 * already applied to objectness and class scores).
 */

export const MODEL = {
  url: "/models/yolox_nano.onnx",
  name: "YOLOX-Nano",
  licence: "Apache-2.0",

  /** Square input. 416 measured at 32 ms per pass on WASM; see the F0 commit. */
  inputSize: 416,

  /** Feature-map strides the head emits, coarse to fine order as exported. */
  strides: [8, 16, 32],

  /**
   * YOLOX preprocessing: letterbox onto a flat 114-grey field, no mean/std
   * normalisation, and BGR channel order — the training pipeline reads frames
   * with OpenCV and never converts them.
   */
  padValue: 114,
  channelOrder: "bgr",

  /** Below this the boxes are noise; above 0.45 IoU they are the same object. */
  scoreThreshold: 0.35,
  nmsThreshold: 0.45,

  /** Most boxes to draw. A crowd scene should not turn into a wall of amber. */
  maxDetections: 24,
} as const;

/** COCO 80, in the order the exported head scores them. */
export const CLASSES = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck",
  "boat", "traffic light", "fire hydrant", "stop sign", "parking meter", "bench",
  "bird", "cat", "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra",
  "giraffe", "backpack", "umbrella", "handbag", "tie", "suitcase", "frisbee",
  "skis", "snowboard", "sports ball", "kite", "baseball bat", "baseball glove",
  "skateboard", "surfboard", "tennis racket", "bottle", "wine glass", "cup",
  "fork", "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
  "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair", "couch",
  "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse",
  "remote", "keyboard", "cell phone", "microwave", "oven", "toaster", "sink",
  "refrigerator", "book", "clock", "vase", "scissors", "teddy bear",
  "hair drier", "toothbrush",
] as const;

export function className(index: number) {
  return CLASSES[index] ?? `class ${index}`;
}
