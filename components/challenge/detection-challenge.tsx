// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DEFAULT_PARAMS,
  renderScene,
  type SceneParams,
  type Target,
} from "@/lib/synthetic-scene";
import { iou, type Box } from "@/lib/iou";
import { record } from "@/lib/progress";
import { type Dictionary } from "@/content/dictionaries";
import { fill } from "@/lib/fill";

const ROUNDS = 5;

/** The threshold that defines mAP@50 — the whole point of the exercise. */
const DETECTION_THRESHOLD = 0.5;

const RENDER_WIDTH = 1200;
const RENDER_HEIGHT = 675;

/** Rounds get harder: higher altitude, thicker haze, more sensor damage. */
function roundParams(round: number): SceneParams {
  const t = round / (ROUNDS - 1);
  return {
    ...DEFAULT_PARAMS,
    seed: 1337 + round * 977,
    altitude: 0.25 + t * 0.55,
    haze: 0.2 + t * 0.35,
    noise: 0.15 + t * 0.3,
    deadPixels: t * 0.35,
    sensor: round % 2 === 1 ? "ir" : "eo",
    targets: 1,
  };
}

export function DetectionChallenge({ dict }: { dict: Dictionary }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [truth, setTruth] = useState<Target | null>(null);
  const [drag, setDrag] = useState<Box | null>(null);
  const [guess, setGuess] = useState<Box | null>(null);
  const [scores, setScores] = useState<number[]>([]);

  // Driven by the round counter, not by scores.length: ending on the fifth
  // guess would swap in the result screen before the player ever saw their
  // last box measured against the truth.
  const done = round >= ROUNDS;

  // Paint the round. Redrawing only when the round changes keeps the
  // per-pixel artifact pass off the interaction path.
  useEffect(() => {
    if (!started || done) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = RENDER_WIDTH;
    canvas.height = RENDER_HEIGHT;
    const targets = renderScene(ctx, RENDER_WIDTH, RENDER_HEIGHT, roundParams(round));
    setTruth(targets[0] ?? null);
    setGuess(null);
    setDrag(null);
  }, [started, round, done]);

  /** Pointer position as a fraction of the frame, clamped to it. */
  const toLocal = useCallback((event: React.PointerEvent) => {
    const rect = frameRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
    };
  }, []);

  const origin = useRef({ x: 0, y: 0 });

  const onPointerDown = (event: React.PointerEvent) => {
    if (guess) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = toLocal(event);
    origin.current = p;
    setDrag({ x: p.x, y: p.y, w: 0, h: 0 });
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag || guess) return;
    const p = toLocal(event);
    setDrag({
      x: Math.min(origin.current.x, p.x),
      y: Math.min(origin.current.y, p.y),
      w: Math.abs(p.x - origin.current.x),
      h: Math.abs(p.y - origin.current.y),
    });
  };

  const onPointerUp = () => {
    if (!drag || guess || !truth) return;
    // A tap rather than a drag is not an answer.
    if (drag.w < 0.01 || drag.h < 0.01) {
      setDrag(null);
      return;
    }
    setGuess(drag);
    setScores((prev) => [...prev, iou(drag, truth)]);
  };

  const skip = () => {
    if (guess || !truth) return;
    setGuess({ x: 0, y: 0, w: 0, h: 0 });
    setScores((prev) => [...prev, 0]);
  };

  const advance = () => setRound((r) => r + 1);

  const restart = () => {
    setScores([]);
    setRound(0);
    setGuess(null);
    setDrag(null);
  };

  useEffect(() => {
    if (done) record("instrument:challenge");
  }, [done]);

  const mean = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const current = scores[round] ?? 0;

  const asPercent = (box: Box | Target) => ({
    left: `${box.x * 100}%`,
    top: `${box.y * 100}%`,
    width: `${box.w * 100}%`,
    height: `${box.h * 100}%`,
  });

  return (
    <div className="border border-line bg-surface">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            {dict.challenge.eyebrow}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
            {dict.challenge.title}
          </h3>
        </div>
        {started && !done && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            {fill(dict.challenge.round, { n: round + 1, total: ROUNDS })}
          </p>
        )}
      </div>

      {!started ? (
        <div className="space-y-6 px-5 py-8">
          <p className="max-w-2xl text-[15px] leading-relaxed text-dim">
            {dict.challenge.intro}
          </p>
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="border border-signal px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
          >
            {dict.challenge.start}
          </button>
        </div>
      ) : done ? (
        <div className="space-y-5 px-5 py-8">
          <p className="font-display text-4xl font-extrabold tracking-tight text-bone md:text-5xl">
            {fill(dict.challenge.resultTitle, { score: mean.toFixed(2) })}
          </p>
          <ul className="flex flex-wrap gap-2">
            {scores.map((score, i) => (
              <li
                key={i}
                className={`border px-2.5 py-1 font-mono text-[11px] ${
                  score >= DETECTION_THRESHOLD
                    ? "border-lock/40 text-lock"
                    : "border-line text-dim"
                }`}
              >
                {score.toFixed(2)}
              </li>
            ))}
          </ul>
          <p className="max-w-2xl text-sm leading-relaxed text-dim">
            {dict.challenge.explain}
          </p>
          <button
            type="button"
            onClick={restart}
            className="border border-line px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-dim transition-colors hover:border-signal hover:text-signal"
          >
            {dict.challenge.again}
          </button>
        </div>
      ) : (
        <div className="px-5 py-5">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={`relative aspect-[16/9] w-full touch-none select-none overflow-hidden ${
              guess ? "cursor-default" : "cursor-crosshair"
            }`}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={dict.challenge.prompt}
              className="absolute inset-0 h-full w-full"
            />

            {/* The visitor's box, live while dragging. */}
            {(drag || guess) && (
              <div
                style={asPercent(guess ?? drag!)}
                className="absolute border border-ice"
              >
                {/* Below the box: the ground-truth label sits above its own,
                    and a good guess puts the two boxes nearly on top of each
                    other — exactly when colliding labels would be unreadable. */}
                <span className="absolute -bottom-5 left-0 bg-void/80 px-1 font-mono text-[10px] text-ice">
                  {dict.challenge.yours}
                </span>
              </div>
            )}

            {/* Ground truth appears only after the answer is locked in. */}
            <AnimatePresence>
              {guess && truth && (
                <motion.div
                  key="verdict"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={asPercent(truth)}
                  className="absolute border-2 border-signal"
                >
                  <span className="absolute -top-5 right-0 bg-void/80 px-1 font-mono text-[10px] text-signal">
                    {dict.challenge.truth}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            {!guess ? (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                  {dict.challenge.prompt}
                </p>
                <button
                  type="button"
                  onClick={skip}
                  className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim transition-colors hover:text-signal"
                >
                  {dict.challenge.skip}
                </button>
              </>
            ) : (
              <>
                <p className="font-mono text-sm">
                  <span className="text-dim">{dict.challenge.iou} </span>
                  <span
                    className={
                      current >= DETECTION_THRESHOLD ? "text-lock" : "text-alert"
                    }
                  >
                    {current.toFixed(2)}
                  </span>
                  <span className="ml-2 text-[11px] uppercase tracking-[0.16em] text-dim">
                    {current >= DETECTION_THRESHOLD
                      ? dict.challenge.hit
                      : dict.challenge.miss}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={advance}
                  className="border border-signal px-5 py-2 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
                >
                  {round + 1 >= ROUNDS
                    ? dict.challenge.finish
                    : dict.challenge.next}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
