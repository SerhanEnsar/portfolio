// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

import type { DetectorBox } from "./protocol";

/**
 * Draws boxes in the site's own detection language: corner brackets rather
 * than closed rectangles, so the object stays visible through its own label.
 *
 * Colours are the design tokens by value — a canvas cannot read Tailwind
 * classes, and resolving custom properties every frame would cost more than
 * the four strings are worth.
 */

const SIGNAL = "#ffb020";
const BONE = "#e6e9ec";
const VOID = "rgba(8,11,14,0.82)";

/** Where a `object-contain` media element actually puts its pixels. */
export function contentRect(
  naturalWidth: number,
  naturalHeight: number,
  boxWidth: number,
  boxHeight: number,
) {
  const scale = Math.min(boxWidth / naturalWidth, boxHeight / naturalHeight);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  return {
    left: (boxWidth - width) / 2,
    top: (boxHeight - height) / 2,
    width,
    height,
  };
}

export function drawDetections(
  ctx: CanvasRenderingContext2D,
  boxes: DetectorBox[],
  frame: { left: number; top: number; width: number; height: number },
) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.lineWidth = 1.5;
  ctx.lineJoin = "miter";
  ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
  ctx.textBaseline = "alphabetic";

  /** Chips already on screen, so a later one can stand down. */
  const chips: { x: number; y: number; w: number; h: number }[] = [];

  for (const box of boxes) {
    const x = frame.left + box.x * frame.width;
    const y = frame.top + box.y * frame.height;
    const w = box.w * frame.width;
    const h = box.h * frame.height;

    // Legs stay proportional so a small box does not become a solid square.
    const leg = Math.max(6, Math.min(18, Math.min(w, h) * 0.26));

    ctx.strokeStyle = SIGNAL;
    ctx.beginPath();
    for (const [cx, cy, sx, sy] of [
      [x, y, 1, 1],
      [x + w, y, -1, 1],
      [x, y + h, 1, -1],
      [x + w, y + h, -1, -1],
    ] as const) {
      ctx.moveTo(cx + sx * leg, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + sy * leg);
    }
    ctx.stroke();

    // Confidence as a bar along the top edge — readable at a glance, and it
    // does not add another number to a frame that already has several.
    ctx.strokeStyle = SIGNAL;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(x, y - 3);
    ctx.lineTo(x + w * box.score, y - 3);
    ctx.stroke();
    ctx.globalAlpha = 1;

    const label = `${box.label.toUpperCase()} ${box.score.toFixed(2)}`;
    const textWidth = ctx.measureText(label).width;

    // Labels sit inside their own box wherever there is room, rather than
    // floating above it where a neighbouring box would claim the same strip.
    const inside = h > 40;
    const labelX = x + (inside ? leg + 5 : 3);
    const labelY = inside ? y + 15 : y - 10 < 14 ? y + h + 16 : y - 10;
    const chip = { x: labelX - 4, y: labelY - 11, w: textWidth + 8, h: 15 };

    // In a crowd the boxes still overlap. Boxes arrive best-score-first, so
    // dropping the collided label keeps the confident one legible — half a
    // word under another word reads as a rendering bug, not as density.
    const collides = chips.some(
      (other) =>
        chip.x < other.x + other.w &&
        chip.x + chip.w > other.x &&
        chip.y < other.y + other.h &&
        chip.y + chip.h > other.y,
    );
    if (collides) continue;
    chips.push(chip);

    ctx.fillStyle = VOID;
    ctx.fillRect(chip.x, chip.y, chip.w, chip.h);
    ctx.fillStyle = BONE;
    ctx.fillText(label, labelX, labelY);
  }
}
