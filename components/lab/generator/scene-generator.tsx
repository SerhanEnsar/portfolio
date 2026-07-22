// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { record } from "@/lib/progress";
import { type Dictionary } from "@/content/dictionaries";
import { fill } from "@/lib/fill";
import {
  DEFAULT_PARAMS,
  renderScene,
  type SceneParams,
  type Target,
} from "@/lib/synthetic-scene";

/**
 * The training-data generator, in the browser.
 *
 * LAÇİN was not trained on frames someone went out and filmed. Most of them
 * were composed in Blender and OpenCV, which is what makes the labels exact
 * and what makes hard cases — dawn light, thick haze, a dying sensor —
 * something you can ask for rather than wait for.
 *
 * This is that pipeline at toy scale, and it exports what the real one
 * exports: the image, and the labels that go with it.
 */

const WIDTH = 1280;
const HEIGHT = 720;

type Control = {
  key: "altitude" | "timeOfDay" | "haze" | "noise" | "deadPixels";
  /** Shown next to the label, in the units the parameter actually means. */
  format: (value: number) => string;
};

const CONTROLS: Control[] = [
  { key: "altitude", format: (v) => `${Math.round(120 + v * 380)} m` },
  { key: "timeOfDay", format: (v) => `${String(5 + Math.round(v * 8)).padStart(2, "0")}:00` },
  { key: "haze", format: (v) => `${Math.round(v * 100)}%` },
  { key: "noise", format: (v) => `${Math.round(v * 100)}%` },
  { key: "deadPixels", format: (v) => `${Math.round(v * 100)}%` },
];

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // Revoking in the same tick has raced the download in more than one browser.
  // The blob is a frame's worth of bytes; holding it a moment costs nothing.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** One line per object: `class cx cy w h`, normalised — the YOLO convention. */
function toYolo(targets: Target[]) {
  return targets
    .map((t) =>
      [0, t.x + t.w / 2, t.y + t.h / 2, t.w, t.h]
        .map((n, i) => (i === 0 ? n : n.toFixed(6)))
        .join(" "),
    )
    .join("\n");
}

function drawTruth(ctx: CanvasRenderingContext2D, targets: Target[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#ffb020";
  ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';

  const scaleX = ctx.canvas.width;
  const scaleY = ctx.canvas.height;

  for (const target of targets) {
    const x = target.x * scaleX;
    const y = target.y * scaleY;
    const w = target.w * scaleX;
    const h = target.h * scaleY;

    // A plain rectangle, not the detector's brackets: this is where the object
    // was put, not where something guessed it might be.
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);

    const label = target.label.toUpperCase();
    ctx.fillStyle = "rgba(8,11,14,0.82)";
    ctx.fillRect(x, y - 15, ctx.measureText(label).width + 8, 15);
    ctx.fillStyle = "#ffb020";
    ctx.fillText(label, x + 4, y - 4);
  }
}

export function SceneGenerator({ dict }: { dict: Dictionary }) {
  const copy = dict.lab.generator;

  const sceneRef = useRef<HTMLCanvasElement>(null);
  const truthRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const targetsRef = useRef<Target[]>([]);

  const [params, setParams] = useState<SceneParams>({
    ...DEFAULT_PARAMS,
    seed: 4711,
    targets: 3,
  });
  const [showTruth, setShowTruth] = useState(true);

  const render = useCallback((next: SceneParams, truth: boolean) => {
    const scene = sceneRef.current;
    const overlay = truthRef.current;
    const ctx = scene?.getContext("2d");
    if (!scene || !overlay || !ctx) return;

    scene.width = WIDTH;
    scene.height = HEIGHT;
    overlay.width = WIDTH;
    overlay.height = HEIGHT;

    targetsRef.current = renderScene(ctx, WIDTH, HEIGHT, next);
    const overlayCtx = overlay.getContext("2d");
    if (overlayCtx) drawTruth(overlayCtx, truth ? targetsRef.current : []);
  }, []);

  // Dragging a slider fires far faster than a full per-pixel artifact pass can
  // finish, so renders are collapsed onto the next frame.
  useEffect(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => render(params, showTruth));
    return () => cancelAnimationFrame(frameRef.current);
  }, [params, showTruth, render]);

  const set = <K extends keyof SceneParams>(key: K, value: SceneParams[K]) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const saveImage = () => {
    sceneRef.current?.toBlob((blob) => {
      if (blob) download(blob, `synthetic-${params.seed}.png`);
      record("instrument:generator");
    }, "image/png");
  };

  const saveLabels = () => {
    download(
      new Blob([toYolo(targetsRef.current)], { type: "text/plain" }),
      `synthetic-${params.seed}.txt`,
    );
    record("instrument:generator");
  };

  return (
    <section className="border border-line bg-surface">
      <header className="border-b border-line px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
          {copy.eyebrow}
        </p>
        <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-dim">
          {copy.lead}
        </p>
      </header>

      <div className="grid gap-px bg-line lg:grid-cols-[1.6fr_1fr]">
        <div className="relative aspect-video w-full bg-void">
          <canvas
            ref={sceneRef}
            role="img"
            aria-label={copy.title}
            className="absolute inset-0 h-full w-full"
          />
          <canvas
            ref={truthRef}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="space-y-5 bg-surface px-5 py-5">
          <div className="flex gap-px border border-line bg-line">
            {(["eo", "ir"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => set("sensor", mode)}
                aria-pressed={params.sensor === mode}
                className={`flex-1 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  params.sensor === mode
                    ? "bg-signal text-void"
                    : "bg-surface text-dim hover:text-bone"
                }`}
              >
                {copy[mode]}
              </button>
            ))}
          </div>

          {CONTROLS.map((control) => {
            // Time of day is a lighting parameter; a thermal sensor does not
            // have one, so the control says so rather than quietly doing nothing.
            const disabled = control.key === "timeOfDay" && params.sensor === "ir";
            return (
              <label key={control.key} className={disabled ? "block opacity-35" : "block"}>
                <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                  <span>{copy[control.key]}</span>
                  <span className="text-ice">
                    {disabled ? copy.notApplicable : control.format(params[control.key])}
                  </span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  disabled={disabled}
                  value={params[control.key]}
                  onChange={(event) => set(control.key, Number(event.target.value))}
                  className="mt-2 w-full accent-signal"
                />
              </label>
            );
          })}

          <label className="block">
            <span className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
              <span>{copy.targets}</span>
              <span className="text-ice">{params.targets}</span>
            </span>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={params.targets}
              onChange={(event) => set("targets", Number(event.target.value))}
              className="mt-2 w-full accent-signal"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
              {fill(copy.seed, { seed: params.seed })}
            </span>
            <button
              type="button"
              onClick={() => set("seed", Math.floor(Math.random() * 100000))}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim transition-colors hover:text-signal"
            >
              {copy.newSeed}
            </button>
          </div>

          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            <input
              type="checkbox"
              checked={showTruth}
              onChange={(event) => setShowTruth(event.target.checked)}
              className="accent-signal"
            />
            {copy.showTruth}
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={saveImage}
              className="border border-signal px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-signal transition-colors hover:bg-signal hover:text-void"
            >
              {copy.saveImage}
            </button>
            <button
              type="button"
              onClick={saveLabels}
              className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim transition-colors hover:border-ice hover:text-ice"
            >
              {copy.saveLabels}
            </button>
          </div>
        </div>
      </div>

      <footer className="border-t border-line px-5 py-4">
        <p className="max-w-2xl text-[13px] leading-relaxed text-dim">{copy.note}</p>
      </footer>
    </section>
  );
}
