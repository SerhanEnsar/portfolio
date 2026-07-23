// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { renderScene, DEFAULT_PARAMS } from "@/lib/synthetic-scene";
import { record } from "@/lib/progress";
import { fill } from "@/lib/fill";
import { type Dictionary } from "@/content/dictionaries";
import {
  VO_FRAMES,
  WORLD,
  FRAME,
  LOCK_TOL,
  add,
  sub,
  len,
  alignment,
  drift,
  flightPath,
  jitter,
  stepOffset,
  tierFor,
  type Vec,
  type VoTier,
} from "@/lib/vo";

/** Stage backing store — the visible reconstruction canvas. */
const STAGE_W = 960;
const STAGE_H = 600;
const PAD = 44;

const VOID = "#080b0e";
const AMBER = "#ffb020";
const ICE = "#8fc5dc";
const LINE = "#232c33";
const LOCK_GREEN = "#7fe0a0";

type Phase = "idle" | "playing" | "done";
type Fit = { scale: number; minX: number; minY: number; padX: number; padY: number };

function computeFit(path: Vec[]): Fit {
  const half = FRAME / 2;
  const minX = Math.min(...path.map((p) => p.x)) - half;
  const maxX = Math.max(...path.map((p) => p.x)) + half;
  const minY = Math.min(...path.map((p) => p.y)) - half;
  const maxY = Math.max(...path.map((p) => p.y)) + half;
  const bw = maxX - minX;
  const bh = maxY - minY;
  const scale = Math.min((STAGE_W - 2 * PAD) / bw, (STAGE_H - 2 * PAD) / bh);
  return {
    scale,
    minX,
    minY,
    padX: (STAGE_W - bw * scale) / 2,
    padY: (STAGE_H - bh * scale) / 2,
  };
}

export function VisualOdometry({ dict }: { dict: Dictionary }) {
  const copy = dict.vo;

  const stageRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [path, setPath] = useState<Vec[]>([]);
  const [fit, setFit] = useState<Fit | null>(null);
  /** Locked step offsets, one per registration solved so far. */
  const [placed, setPlaced] = useState<Vec[]>([]);
  /** Offset of the frame being aligned, relative to the last locked one. */
  const [floating, setFloating] = useState<Vec>({ x: 0, y: 0 });
  const [result, setResult] = useState<{ meters: number; tier: VoTier } | null>(null);

  const curIndex = placed.length + 1; // frame currently being aligned
  const trueOffset =
    phase === "playing" && path.length ? stepOffset(path, curIndex) : { x: 0, y: 0 };
  const error = len(sub(floating, trueOffset));
  const align = alignment(error);
  const canLock = phase === "playing" && error <= LOCK_TOL;

  /** Locked frame centres, frame 0 anchored on the world's true start so a
   *  perfect run reconstructs the world exactly. */
  const centres = useCallback(
    (offsets: Vec[]) => {
      const cs: Vec[] = [path[0]];
      for (let i = 0; i < offsets.length; i += 1) cs.push(add(cs[i], offsets[i]));
      return cs;
    },
    [path],
  );

  const draw = useCallback(() => {
    const stage = stageRef.current;
    const world = worldRef.current;
    const ctx = stage?.getContext("2d");
    if (!stage || !world || !fit || !ctx || path.length === 0) return;

    const toStage = (p: Vec) => ({
      x: (p.x - fit.minX) * fit.scale + fit.padX,
      y: (p.y - fit.minY) * fit.scale + fit.padY,
    });

    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    const fs = FRAME * fit.scale;
    const drawFrame = (worldCentre: Vec, destCentre: Vec, alpha: number, border: string) => {
      const d = toStage(destCentre);
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        world,
        worldCentre.x - FRAME / 2,
        worldCentre.y - FRAME / 2,
        FRAME,
        FRAME,
        d.x - fs / 2,
        d.y - fs / 2,
        fs,
        fs,
      );
      ctx.globalAlpha = 1;
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.strokeRect(d.x - fs / 2, d.y - fs / 2, fs, fs);
    };

    const cross = (p: Vec, color: string) => {
      const s = toStage(p);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x - 7, s.y);
      ctx.lineTo(s.x + 7, s.y);
      ctx.moveTo(s.x, s.y - 7);
      ctx.lineTo(s.x, s.y + 7);
      ctx.stroke();
    };

    const polyline = (pts: Vec[], color: string, dash: number[]) => {
      if (pts.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const s = toStage(p);
        if (i === 0) ctx.moveTo(s.x, s.y);
        else ctx.lineTo(s.x, s.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      pts.forEach((p) => {
        const s = toStage(p);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    if (phase === "done") {
      const cs = centres(placed);
      cs.forEach((c, k) => drawFrame(path[k], c, 0.5, LINE));
      polyline(path, ICE, [5, 4]);
      polyline(cs, AMBER, []);
      const a = toStage(path[path.length - 1]);
      const b = toStage(cs[cs.length - 1]);
      ctx.strokeStyle = "#ff5a4d";
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const cs = centres(placed);
    cs.forEach((c, k) => drawFrame(path[k], c, 0.85, LINE));

    const floatingCentre = add(cs[cs.length - 1], floating);
    drawFrame(path[curIndex], floatingCentre, 0.62, canLock ? LOCK_GREEN : AMBER);

    // Feature crosshairs: the same two landmarks seen through the last locked
    // frame (ice) and the one being placed (amber). They meet on alignment.
    const prev = path[curIndex - 1];
    const cur = path[curIndex];
    const mid = { x: (prev.x + cur.x) / 2, y: (prev.y + cur.y) / 2 };
    const delta = sub(cur, prev);
    const dl = len(delta) || 1;
    const perp = { x: -delta.y / dl, y: delta.x / dl };
    [0.16, -0.16].forEach((k) => {
      const L = { x: mid.x + perp.x * FRAME * k, y: mid.y + perp.y * FRAME * k };
      cross(add(cs[cs.length - 1], sub(L, prev)), ICE);
      cross(add(floatingCentre, sub(L, cur)), canLock ? LOCK_GREEN : AMBER);
    });

    polyline([...cs, floatingCentre], AMBER, [4, 4]);
  }, [phase, placed, floating, canLock, curIndex, centres, path, fit]);

  useEffect(() => {
    draw();
  }, [draw]);

  const begin = () => {
    const seed = Math.floor(Math.random() * 1e9);
    const nextPath = flightPath(seed);

    // Render the world the frames are cropped from — one seeded synthetic
    // terrain, rich enough that overlaps have real features to line up.
    const w = document.createElement("canvas");
    w.width = WORLD;
    w.height = WORLD;
    const wctx = w.getContext("2d");
    if (wctx)
      renderScene(wctx, WORLD, WORLD, {
        ...DEFAULT_PARAMS,
        seed,
        altitude: 0.42,
        haze: 0.14,
        noise: 0.05,
        deadPixels: 0,
        sensor: "eo",
        targets: 8,
      });
    worldRef.current = w;

    setPath(nextPath);
    setFit(computeFit(nextPath));
    setResult(null);
    setPlaced([]);
    setFloating(add(stepOffset(nextPath, 1), jitter()));
    setPhase("playing");
  };

  const lock = () => {
    if (!canLock) return;
    const next = [...placed, floating];
    if (next.length >= VO_FRAMES - 1) {
      const errors = next.map((o, i) => sub(o, stepOffset(path, i + 1)));
      const meters = drift(errors);
      setPlaced(next);
      setResult({ meters, tier: tierFor(meters) });
      setPhase("done");
      record("instrument:odometry");
      return;
    }
    setPlaced(next);
    setFloating(add(stepOffset(path, next.length + 1), jitter()));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "playing") return;
    (e.target as Element).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !fit) return;
    const stage = stageRef.current!;
    const rect = stage.getBoundingClientRect();
    const sx = STAGE_W / rect.width / fit.scale;
    const sy = STAGE_H / rect.height / fit.scale;
    const dx = (e.clientX - dragRef.current.x) * sx;
    const dy = (e.clientY - dragRef.current.y) * sy;
    dragRef.current = { x: e.clientX, y: e.clientY };
    setFloating((f) => ({ x: f.x + dx, y: f.y + dy }));
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            {copy.eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
            {copy.title}
          </h2>
        </div>
        {phase === "playing" && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            {fill(copy.step, { n: curIndex + 1, total: VO_FRAMES })}
          </p>
        )}
      </div>

      {phase === "idle" ? (
        <div className="space-y-6 px-5 py-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-dim">{copy.intro}</p>
          <button
            type="button"
            onClick={begin}
            className="border border-signal px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
          >
            {copy.start}
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          <div className="relative aspect-[8/5] w-full touch-none select-none overflow-hidden">
            <canvas
              ref={stageRef}
              width={STAGE_W}
              height={STAGE_H}
              role="img"
              aria-label={copy.title}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              className={`absolute inset-0 h-full w-full ${
                phase === "playing" ? "cursor-grab active:cursor-grabbing" : ""
              }`}
            />
          </div>

          {phase === "playing" ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm leading-relaxed text-dim">{copy.drag}</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex min-w-[12rem] flex-1 items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                    {copy.align}
                  </span>
                  <span className="h-1 flex-1 bg-line">
                    <span
                      className="block h-1 transition-[width,background-color] duration-150"
                      style={{
                        width: `${Math.round(align * 100)}%`,
                        backgroundColor: canLock ? LOCK_GREEN : AMBER,
                      }}
                    />
                  </span>
                  <span className="w-10 text-right font-mono text-[11px] text-ice">
                    {Math.round(align * 100)}%
                  </span>
                </div>
                <button
                  type="button"
                  onClick={lock}
                  disabled={!canLock}
                  className="border px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:border-line disabled:text-dim/50 enabled:border-signal enabled:text-signal enabled:hover:bg-signal enabled:hover:text-void"
                >
                  {copy.lock}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-5">
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
                <p className="font-display text-4xl font-extrabold tracking-tight text-bone md:text-5xl">
                  {fill(copy.resultTitle, { drift: result!.meters.toFixed(1) })}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">
                  {copy.grade[result!.tier]}
                </p>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-ice">— {copy.truth}</span>
                <span className="text-signal">— {copy.recovered}</span>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-dim">{copy.explain}</p>
              <button
                type="button"
                onClick={begin}
                className="border border-line px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-dim transition-colors hover:border-signal hover:text-signal"
              >
                {copy.again}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
