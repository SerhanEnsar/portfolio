// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { record } from "@/lib/progress";
import { fill } from "@/lib/fill";
import {
  COURSE_LENGTH,
  HORIZON,
  LANE_HALF,
  STATIONS,
  VEHICLE,
  centreAt,
  createRun,
  detectionsFor,
  inView,
  project,
  resolve,
  roughnessAt,
  shiftEstimate,
  step,
  type ImpactKind,
  type Prop,
  type RunState,
  type View,
} from "@/lib/course";
import { createTracker, update, type Tracker } from "@/lib/track";
import type { Dictionary } from "@/content/dictionaries";

const AMBER = "#ffb020";
const ICE = "#8fc5dc";
const DIM = "#6e7c87";
const LINE = "#1e262d";
const VOID = "#080b0e";
const ALERT = "#ff5c5c";

/** Under this frame width the decision sits along the bottom instead. */
const NARROW_FRAME = 520;

const STEP = 1 / 60;
/** A backgrounded tab must not come back and simulate a thousand ticks at once. */
const MAX_STEPS = 6;
/** Frames a track is drawn as new — long enough to see an identity churn. */
const FRESH = 8;

type Phase = "idle" | "running" | "waiting" | "done";

/**
 * The course run, from inside the vehicle.
 *
 * ODBARS drives itself; the visitor's job is the call at each station, which
 * is the honest division of labour — nobody hands a competition vehicle a
 * steering wheel, they hand it a decision policy and watch what it does.
 *
 * What the frame shows is not footage. It is the perception layer's own view:
 * ground grid, wireframe geometry, and over it the boxes the detector reports
 * with the identity the tracker has given each one. A box that has just been
 * issued a new id is drawn in alert red, so the third station — where the
 * ground breaks up and the visitor decides whether the tracker gets its motion
 * compensation — can be watched rather than read about.
 */
export function OdbarsRun({ dict }: { dict: Dictionary }) {
  const copy = dict.course;
  const still = useReducedMotion();

  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runRef = useRef<RunState>(createRun());
  const trackerRef = useRef<Tracker>(createTracker());
  const viewRef = useRef<View>({ w: 860, h: 420 });

  const [width, setWidth] = useState(860);
  const [phase, setPhase] = useState<Phase>("idle");
  const [station, setStation] = useState(0);
  const [outcomes, setOutcomes] = useState<(boolean | null)[]>(
    STATIONS.map(() => null),
  );
  const [readout, setReadout] = useState({
    speed: 0,
    tracks: 0,
    switches: 0,
    compensate: false,
    progress: 0,
    rough: false,
    hits: 0,
    damage: 0,
    penalty: 0,
  });
  /** The contact the frame is still reacting to. */
  const flashRef = useRef<{ at: number; kind: ImpactKind | null; held: boolean }>({
    at: -99,
    kind: null,
    held: false,
  });
  const lastImpact = useRef(-1);
  const [verdict, setVerdict] = useState<string | null>(null);
  /**
   * The verdict waits for its own consequence. Printing "it came down hard"
   * while the vehicle is still climbing the ramp tells the visitor the ending
   * before the manoeuvre has played, and the manoeuvre is the whole point.
   */
  const pending = useRef<string | null>(null);
  const recorded = useRef(false);

  // A phone-width frame gets extra height rather than the 16:8 it would
  // otherwise take: the decision sits on the picture there, and a 200-pixel
  // frame with a panel across the bottom of it is a panel, not a view.
  const height = Math.round(
    Math.max(width < NARROW_FRAME ? 360 : 260, Math.min(430, width * 0.52)),
  );

  // The canvas draws from a ref because it draws outside React's render, so
  // the measured size is copied there rather than assigned mid-render.
  useEffect(() => {
    viewRef.current = { w: width, h: height };
  }, [width, height]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width || 860);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  /* ── drawing ─────────────────────────────────────────────────────────── */

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    const view = viewRef.current;
    const run = runRef.current;

    const dpr = Math.min(3, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(view.w * dpr)) {
      canvas.width = Math.round(view.w * dpr);
      canvas.height = Math.round(view.h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, view.w, view.h);
    ctx.font = "10px monospace";
    ctx.letterSpacing = "1.2px";
    ctx.textBaseline = "alphabetic";

    // Horizon. Everything above it is out of the sensor's world — and it
    // leans with the body, because a horizon that stayed level while the
    // ground rotated under it would be the one line in the frame lying.
    const horizon = view.h * HORIZON + run.pitch * view.w * 0.62;
    const rolled = (draw: () => void) => {
      ctx.save();
      ctx.translate(view.w / 2, view.h * HORIZON);
      ctx.rotate(run.roll);
      ctx.translate(-view.w / 2, -view.h * HORIZON);
      draw();
      ctx.restore();
    };

    rolled(() => {
      ctx.strokeStyle = LINE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-view.w, horizon);
      ctx.lineTo(view.w * 2, horizon);
      ctx.stroke();
    });

    // Ground: lateral ribs every four metres, on a grid that keeps its
    // spacing in the world rather than on screen — which is what makes the
    // approach read as distance.
    const first = Math.ceil(run.z / 4) * 4;
    ctx.strokeStyle = LINE;
    for (let z = first; z < run.z + 70; z += 4) {
      const left = project({ x: centreAt(z) - LANE_HALF, y: 0, z }, run, view);
      const right = project({ x: centreAt(z) + LANE_HALF, y: 0, z }, run, view);
      if (!left || !right) continue;
      ctx.globalAlpha = Math.max(0.08, 1 - (z - run.z) / 70);
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Track edges, drawn as two continuous rails.
    for (const side of [-1, 1] as const) {
      ctx.strokeStyle = ICE;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let z = run.z + 2; z < run.z + 70; z += 2) {
        const p = project({ x: centreAt(z) + side * LANE_HALF, y: 0, z }, run, view);
        if (!p) continue;
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // The world's geometry, as wireframe. Far things first so near ones cover.
    // Anything the vehicle has already hit stays marked for the rest of the
    // run: the course keeps the evidence.
    for (const prop of inView(run)) {
      drawProp(ctx, prop, run, view, run.struck[prop.id] !== undefined);
    }

    // What the perception layer makes of it.
    for (const track of trackerRef.current.tracks) {
      if (track.misses > 0) continue;
      const fresh = track.age <= FRESH;
      const colour = fresh ? ALERT : AMBER;
      ctx.strokeStyle = colour;
      ctx.lineWidth = fresh ? 1.6 : 1.2;
      ctx.strokeRect(track.box.x, track.box.y, track.box.w, track.box.h);

      if (track.box.w > 22) {
        ctx.fillStyle = colour;
        // Already uppercase in the dictionary: `toUpperCase` is not
        // locale-aware and would spell the Turkish "koni" as "KONI".
        ctx.fillText(
          `${copy.plates[track.kind as keyof typeof copy.plates] ?? track.kind} ${String(track.id).padStart(2, "0")}`,
          track.box.x,
          track.box.y - 4,
        );
      }
    }

    // Corner brackets and a horizon ladder: the frame is a camera's, and an
    // empty upper half should still look like one.
    ctx.strokeStyle = DIM;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    const inset = 10;
    const arm = 14;
    for (const [sx, sy] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ] as const) {
      const px = sx > 0 ? inset : view.w - inset;
      const py = sy > 0 ? inset : view.h - inset;
      ctx.beginPath();
      ctx.moveTo(px + sx * arm, py);
      ctx.lineTo(px, py);
      ctx.lineTo(px, py + sy * arm);
      ctx.stroke();
    }

    rolled(() => {
      ctx.strokeStyle = DIM;
      ctx.globalAlpha = 0.4;
      for (const side of [-1, 1] as const) {
        for (let i = 1; i <= 3; i++) {
          const px = view.w / 2 + side * (60 + i * 42);
          ctx.beginPath();
          ctx.moveTo(px, horizon - 4);
          ctx.lineTo(px, horizon + 4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    });

    ctx.fillStyle = DIM;
    ctx.globalAlpha = 0.7;
    ctx.fillText(copy.hud.camera, inset + 4, inset + 14);
    ctx.globalAlpha = 1;

    // The vehicle's own width, thrown forward along the ground. Contact is
    // decided by this corridor, so it is drawn: a limit the visitor cannot see
    // is a limit they cannot be held to.
    const hot = flashRef.current.kind !== null && run.t - flashRef.current.at < 0.7;
    for (const side of [-1, 1] as const) {
      ctx.strokeStyle = hot ? ALERT : ICE;
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      let open = false;
      for (let ahead = 2; ahead < 24; ahead += 2) {
        const p = project(
          { x: run.x + side * VEHICLE.halfWidth, y: 0, z: run.z + ahead },
          run,
          view,
        );
        if (!p) continue;
        if (!open) {
          ctx.moveTo(p.x, p.y);
          open = true;
        } else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }

    // The bonnet, so the frame is somewhere rather than nowhere.
    const nose = project({ x: run.x, y: 0, z: run.z + VEHICLE.front + 0.6 }, run, view);
    if (nose) {
      const halfNose = VEHICLE.halfWidth * nose.scale;
      ctx.strokeStyle = DIM;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(nose.x - halfNose * 1.35, view.h);
      ctx.lineTo(nose.x - halfNose, nose.y);
      ctx.lineTo(nose.x + halfNose, nose.y);
      ctx.lineTo(nose.x + halfNose * 1.35, view.h);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Reticle — the frame is a camera, and a camera has a centre.
    ctx.strokeStyle = DIM;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    const cx = view.w / 2;
    const cy = view.h * 0.62;
    ctx.beginPath();
    ctx.moveTo(cx - 9, cy);
    ctx.lineTo(cx - 3, cy);
    ctx.moveTo(cx + 3, cy);
    ctx.lineTo(cx + 9, cy);
    ctx.moveTo(cx, cy - 9);
    ctx.lineTo(cx, cy - 3);
    ctx.moveTo(cx, cy + 3);
    ctx.lineTo(cx, cy + 9);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Damage stays on the glass. The count follows the damage figure and the
    // shapes are derived from it, so a given amount of damage always leaves
    // the same scars — it is a record, not decoration.
    const scars = Math.floor(run.damage * 16);
    if (scars > 0) {
      ctx.strokeStyle = ALERT;
      ctx.globalAlpha = 0.16;
      ctx.lineWidth = 1;
      for (let i = 0; i < scars; i++) {
        const sx = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * view.w;
        const sy = ((Math.sin(i * 78.233) * 12345.6789) % 1) * view.h;
        ctx.beginPath();
        ctx.moveTo(Math.abs(sx), Math.abs(sy) % view.h);
        ctx.lineTo(Math.abs(sx) + 14 + (i % 5) * 6, (Math.abs(sy) % view.h) + 9 - (i % 3) * 7);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // Contact: the frame takes it. A red edge that decays, and a stamp, so the
    // moment is unmissable even if the visitor was reading the mission list.
    const flash = flashRef.current;
    const since = run.t - flash.at;
    const fade = flash.held ? 0.8 : Math.max(0, 1 - since / 0.7);
    if (flash.kind && fade > 0) {
      ctx.strokeStyle = ALERT;
      ctx.globalAlpha = fade;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, view.w - 4, view.h - 4);
      ctx.globalAlpha = fade * 0.9;
      ctx.fillStyle = ALERT;
      ctx.font = "bold 15px monospace";
      ctx.letterSpacing = "4px";
      ctx.textAlign = "center";
      ctx.fillText(copy.impact, view.w / 2, view.h * 0.5);
      ctx.font = "10px monospace";
      ctx.letterSpacing = "1.2px";
      ctx.fillText(
        copy.kinds[flash.kind as keyof typeof copy.kinds] ?? copy.landing,
        view.w / 2,
        view.h * 0.5 + 18,
      );
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
  }, [copy]);

  /* ── the loop ────────────────────────────────────────────────────────── */

  const tick = useCallback(
    (dt: number) => {
      const view = viewRef.current;
      const steps = Math.min(MAX_STEPS, Math.max(1, Math.round(dt / STEP)));
      for (let i = 0; i < steps; i++) {
        const before = runRef.current;
        if (before.waiting || before.done) break;
        const next = step(before, STEP);
        runRef.current = next;
        trackerRef.current = update(
          trackerRef.current,
          detectionsFor(next, view),
          next.compensate ? shiftEstimate(next, view) : null,
        );
      }
    },
    [],
  );

  /**
   * Picks up a contact that happened since the last look. The frame flash, the
   * stamp and the phone's own buzz all hang off this — a hit the visitor did
   * not feel is a hit that taught them nothing.
   */
  const noteImpact = useCallback(
    (held: boolean) => {
      const impact = runRef.current.impact;
      if (!impact || impact.t === lastImpact.current) return false;
      lastImpact.current = impact.t;
      flashRef.current = { at: impact.t, kind: impact.kind, held };
      if (!held && typeof navigator !== "undefined") {
        // Guarded: most desktops have no vibrator, and a phone that does may
        // still refuse without a gesture. Either way it must not throw.
        try {
          navigator.vibrate?.(impact.force > 2 ? [30, 40, 60] : 35);
        } catch {
          // A device that will not buzz is not a reason to stop the run.
        }
      }
      return true;
    },
    [],
  );

  const reveal = useCallback(() => {
    if (!pending.current) return;
    setVerdict(pending.current);
    pending.current = null;
  }, []);

  const mirror = useCallback(() => {
    const run = runRef.current;
    setReadout({
      speed: run.speed,
      tracks: trackerRef.current.tracks.filter((t) => t.misses === 0).length,
      switches: trackerRef.current.switches,
      compensate: run.compensate,
      progress: Math.min(1, run.z / COURSE_LENGTH),
      rough: roughnessAt(run.z) > 0.4,
      hits: run.hits,
      damage: run.damage,
      penalty: run.penalty,
    });
    if (run.waiting) {
      setStation(run.station);
      setPhase("waiting");
      reveal();
    } else if (run.done) {
      setPhase("done");
      reveal();
    }
  }, [reveal]);

  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    let last = performance.now();
    let sinceMirror = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tick(dt);
      const hit = noteImpact(false);
      if (hit) reveal();
      draw();
      sinceMirror += dt;
      if (hit || sinceMirror > 0.1 || runRef.current.waiting || runRef.current.done) {
        sinceMirror = 0;
        mirror();
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [phase, tick, draw, mirror, noteImpact, reveal]);

  // Reduced motion: the run is stepped to the next station without animating,
  // and the frame is drawn once. The decisions are the demo; the driving
  // between them is not a prerequisite for making them.
  const advanceStill = useCallback(() => {
    const view = viewRef.current;
    let guard = 0;
    while (!runRef.current.waiting && !runRef.current.done && guard < 60 * 120) {
      const next = step(runRef.current, STEP);
      runRef.current = next;
      trackerRef.current = update(
        trackerRef.current,
        detectionsFor(next, view),
        next.compensate ? shiftEstimate(next, view) : null,
      );
      guard += 1;
    }
    // The still frame keeps the mark rather than playing it: with motion off
    // there is no moment to catch, so the contact is simply visible.
    noteImpact(true);
    draw();
    mirror();
  }, [draw, mirror, noteImpact]);

  const begin = useCallback(() => {
    runRef.current = createRun();
    trackerRef.current = createTracker();
    flashRef.current = { at: -99, kind: null, held: false };
    lastImpact.current = -1;
    pending.current = null;
    setOutcomes(STATIONS.map(() => null));
    setVerdict(null);
    if (still) {
      setPhase("waiting");
      advanceStill();
      return;
    }
    setPhase("running");
  }, [advanceStill, still]);

  const answer = useCallback(
    (choice: number) => {
      const run = runRef.current;
      const current = STATIONS[run.station];
      if (!current || !run.waiting) return;

      const right = choice === current.correct;
      runRef.current = resolve(run, choice);
      setOutcomes(runRef.current.outcomes);
      // One verdict per option: a three-way station whose two wrong answers
      // share a sentence explains neither of them. It is held until the
      // manoeuvre has actually happened.
      pending.current = right
        ? copy.stations[current.id].right
        : copy.stations[current.id].wrong[choice];
      setVerdict(null);

      if (still) {
        setPhase("waiting");
        advanceStill();
      } else {
        setPhase("running");
      }
    },
    [advanceStill, copy.stations, still],
  );

  useEffect(() => {
    if (phase !== "done" || recorded.current) return;
    recorded.current = true;
    record("instrument:course");
  }, [phase]);

  // First paint, so the panel is a frame rather than a black rectangle.
  useEffect(() => {
    draw();
  }, [draw, width, height]);

  const current = STATIONS[station];
  const idle = phase === "idle";
  const correct = outcomes.filter(Boolean).length;

  return (
    <div className="border border-line bg-surface/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {copy.eyebrow}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {fill(copy.progress, {
            done: outcomes.filter((o) => o !== null).length,
            total: STATIONS.length,
          })}
        </p>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-3">
          <div className="max-w-2xl">
            <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
              {copy.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-dim">{copy.intro}</p>
          </div>

          <button
            type="button"
            onClick={begin}
            className="border border-signal px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal transition-colors hover:bg-signal hover:text-void"
          >
            {idle ? copy.start : copy.restart}
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
          <div className="flex flex-col gap-3">
            <div ref={boxRef} className="relative border border-line bg-void">
              <canvas
                ref={canvasRef}
                style={{ width: "100%", height }}
                className="block"
                role="img"
                aria-label={copy.frame}
              />
              {idle && (
                <div className="absolute inset-0 flex items-center justify-center bg-void/70">
                  <p className="max-w-sm px-6 text-center font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-dim">
                    {copy.standby}
                  </p>
                </div>
              )}

              {/* The call is made on the frame, beside the thing it is about —
                  a decision panel under the picture asks the visitor to look
                  away from the only evidence they have. */}
              <AnimatePresence>
                {phase === "waiting" && current && (
                  <Decision
                    key={current.id}
                    narrow={width < NARROW_FRAME}
                    still={Boolean(still)}
                    eyebrow={fill(copy.evidence, {
                      kind: copy.kinds[current.evidence],
                      score: current.confidence.toFixed(2),
                    })}
                    question={copy.stations[current.id].question}
                    options={copy.stations[current.id].options}
                    hint={copy.keys}
                    onChoose={answer}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* The readouts that matter while it drives: what it is doing, and
                what the tracker is paying for the terrain. */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 border border-line bg-void px-4 py-3">
              <Reading label={copy.hud.speed} value={readout.speed.toFixed(1)} unit="m/s" />
              <Reading label={copy.hud.tracks} value={String(readout.tracks)} unit="" />
              <Reading
                label={copy.hud.hits}
                value={String(readout.hits)}
                unit=""
                alert={readout.hits > 0}
              />
              <Reading
                label={copy.hud.damage}
                value={String(Math.round(readout.damage * 100))}
                unit="%"
                alert={readout.damage > 0.3}
              />
              <Reading
                label={copy.hud.switches}
                value={String(readout.switches)}
                unit=""
                alert={readout.switches > 0 && !readout.compensate}
              />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  {copy.hud.compensation}
                </p>
                <p
                  className={`mt-1 font-mono text-[13px] uppercase tracking-[0.16em] ${
                    readout.compensate ? "text-lock" : "text-alert"
                  }`}
                >
                  {readout.compensate ? copy.hud.on : copy.hud.off}
                </p>
              </div>
              {readout.rough && phase !== "idle" && (
                <p className="self-center font-mono text-[10px] uppercase tracking-[0.2em] text-alert">
                  {copy.hud.rough}
                </p>
              )}
            </div>

            {/* The decision, or what came of the last one. */}
            {phase === "done" && (
              <div className="border border-line bg-void px-5 py-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-signal">
                  {copy.result.eyebrow}
                </p>
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-bone/90">
                  {fill(copy.result.line, {
                    correct,
                    total: STATIONS.length,
                    switches: readout.switches,
                  })}
                </p>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-dim">
                  {readout.hits === 0
                    ? copy.result.clean
                    : fill(copy.result.cost, {
                        hits: readout.hits,
                        damage: Math.round(readout.damage * 100),
                        penalty: readout.penalty,
                      })}
                </p>
                <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-dim">
                  {readout.compensate ? copy.result.compensated : copy.result.raw}
                </p>
              </div>
            )}

            {/* What the last call turned out to be. It stays up while the
                next one is being made — the decision moved onto the frame, so
                there is nothing here for it to fight with. */}
            {verdict && (
              <p aria-live="polite" className="max-w-3xl text-[14px] leading-relaxed text-dim">
                {verdict}
              </p>
            )}
          </div>

          {/* The task manager, which is a real part of NEXUS and the reason a
              run is a sequence rather than a drive. */}
          <div className="border border-line bg-void px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {copy.missions}
            </p>
            <ol className="mt-3 space-y-2.5">
              {STATIONS.map((s, i) => {
                const state = outcomes[i];
                const active = phase === "waiting" && i === station;
                return (
                  <li key={s.id} className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`h-1.5 w-1.5 shrink-0 ${
                        state === true
                          ? "bg-lock"
                          : state === false
                            ? "bg-alert"
                            : active
                              ? "bg-signal"
                              : "bg-line"
                      }`}
                    />
                    <span
                      className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
                        active ? "text-signal" : state === null ? "text-dim" : "text-bone"
                      }`}
                    >
                      {copy.stations[s.id].name}
                    </span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-4 h-1 w-full bg-line">
              <span
                style={{ width: `${readout.progress * 100}%` }}
                className="block h-full bg-signal"
              />
            </div>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
              {fill(copy.hud.distance, {
                z: Math.round(readout.progress * COURSE_LENGTH),
                total: COURSE_LENGTH,
              })}
            </p>
          </div>
        </div>

        <p className="mt-4 max-w-4xl text-[12px] leading-relaxed text-dim/70">{copy.note}</p>
      </div>
    </div>
  );
}

/**
 * The call, made on the picture.
 *
 * Not a dialog and not a card: the question is set the way a subtitle is —
 * centred low in the frame, over a scrim rather than a box, so the scene it is
 * about stays visible behind it. The options arrive underneath it one after
 * another, each with a line drawn under it and a single pass of light across
 * it. That entrance is the whole of the treatment; the palette stays the
 * page's own, because a panel that glowed cyan here would belong to a
 * different site.
 */
function Decision({
  narrow,
  still,
  eyebrow,
  question,
  options,
  hint,
  onChoose,
}: {
  narrow: boolean;
  still: boolean;
  eyebrow: string;
  question: string;
  options: readonly string[];
  hint: string;
  onChoose: (index: number) => void;
}) {
  // Number keys pick an option. The index in front of each line is the
  // shortcut, so nothing has to be explained twice.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // The site has a command console with a text field in it. A digit typed
      // there is a digit, not a decision.
      const target = event.target as HTMLElement | null;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target?.isContentEditable ||
        (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= options.length) return;
      event.preventDefault();
      onChoose(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChoose, options.length]);

  const rise = still ? {} : { y: 14 };

  return (
    <motion.div
      role="group"
      aria-label={question}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.16 } }}
      transition={{ duration: 0.25 }}
      className="absolute inset-x-0 bottom-0 flex flex-col items-center"
    >
      {/* The scrim, not a panel: legibility without drawing a shape. */}
      {/* On a phone the text takes most of the frame, so the scrim under it
          has to be nearly solid or the road draws lines through the words. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[190%] bg-gradient-to-t to-transparent ${
          narrow ? "from-void via-void/95" : "from-void via-void/85"
        }`}
      />

      <div
        className={`w-[min(46rem,90%)] text-center ${narrow ? "pb-3" : "pb-6"}`}
      >
        <motion.p
          initial={{ opacity: 0, ...rise }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: still ? 0.15 : 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-signal"
        >
          <span aria-hidden="true" className="h-px w-6 bg-signal/50" />
          {eyebrow}
          <span aria-hidden="true" className="h-px w-6 bg-signal/50" />
        </motion.p>

        <motion.p
          initial={{ opacity: 0, ...rise }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: still ? 0.15 : 0.4,
            delay: still ? 0 : 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`mx-auto mt-2 max-w-[38rem] leading-snug text-bone [text-shadow:0_1px_10px_rgba(8,11,14,0.9)] ${
            narrow ? "text-[14px]" : "text-[16.5px]"
          }`}
        >
          {question}
        </motion.p>

        <div
          className={`mt-4 flex flex-col gap-1.5 ${
            narrow ? "items-stretch" : "items-center"
          }`}
        >
          {options.map((option, i) => (
            <Option
              key={option}
              index={i}
              label={option}
              still={still}
              narrow={narrow}
              onChoose={onChoose}
            />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: still ? 0 : 0.15 + options.length * 0.07 }}
          className="mt-2.5 font-mono text-[9.5px] uppercase tracking-[0.2em] text-dim/70"
        >
          {hint}
        </motion.p>
      </div>
    </motion.div>
  );
}

/** One line of the choice: an index, a label, and a light passing over it. */
function Option({
  index,
  label,
  still,
  narrow,
  onChoose,
}: {
  index: number;
  label: string;
  still: boolean;
  narrow: boolean;
  onChoose: (index: number) => void;
}) {
  const delay = still ? 0 : 0.12 + index * 0.07;

  return (
    <motion.button
      type="button"
      onClick={() => onChoose(index)}
      initial={{ opacity: 0, y: still ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: still ? 0.15 : 0.34, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex items-center gap-3 overflow-hidden text-left font-mono text-[11px] uppercase leading-tight tracking-[0.14em] text-dim transition-colors hover:text-void focus-visible:text-void ${
        narrow ? "min-h-11 w-full px-3 py-3" : "min-w-[15rem] px-5 py-2.5"
      }`}
    >
      {/* The fill sweeps in from the left rather than switching on. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 origin-left scale-x-0 bg-signal transition-transform duration-200 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100"
      />
      {/* Corner hooks instead of a border: a frame that never closes. */}
      {(
        [
          "left-0 top-0 border-l border-t",
          "right-0 top-0 border-r border-t",
          "left-0 bottom-0 border-b border-l",
          "right-0 bottom-0 border-b border-r",
        ] as const
      ).map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={`pointer-events-none absolute h-2 w-2 border-dim/70 transition-colors group-hover:border-signal group-focus-visible:border-signal ${corner}`}
        />
      ))}
      {/* The rule under the line draws itself once, left to right. */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: still ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: still ? 0 : 0.4, delay: delay + 0.05 }}
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-line group-hover:bg-signal"
      />
      {/* One pass of light across the row as it arrives. */}
      {!still && (
        <motion.span
          aria-hidden="true"
          initial={{ x: "-110%" }}
          animate={{ x: "130%" }}
          transition={{ duration: 0.6, delay: delay + 0.08, ease: "easeOut" }}
          className="pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-signal/25 to-transparent"
        />
      )}

      <span className="relative z-10 text-signal transition-colors group-hover:text-void group-focus-visible:text-void">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}

/**
 * The props, as the world actually is — line geometry, not sprites. The point
 * of drawing them under the boxes is that the boxes can then be seen to be
 * *wrong* sometimes, which a scene made of the boxes themselves could never
 * show.
 */
function drawProp(
  ctx: CanvasRenderingContext2D,
  prop: Prop,
  run: RunState,
  view: View,
  struck: boolean,
) {
  const base = project({ x: prop.x, y: 0, z: prop.z }, run, view);
  const top = project({ x: prop.x, y: prop.h, z: prop.z }, run, view);
  if (!base || !top) return;

  const w = prop.w * base.scale;
  const h = base.y - top.y;
  if (w < 1.5 || h < 1.5) return;

  ctx.strokeStyle = struck ? ALERT : DIM;
  ctx.globalAlpha = struck ? 1 : 0.85;
  ctx.lineWidth = struck ? 1.6 : 1;
  ctx.beginPath();

  switch (prop.kind) {
    case "cone":
      ctx.moveTo(base.x - w / 2, base.y);
      ctx.lineTo(base.x, base.y - h);
      ctx.lineTo(base.x + w / 2, base.y);
      ctx.closePath();
      break;
    case "rock":
      ctx.moveTo(base.x - w / 2, base.y);
      ctx.lineTo(base.x - w / 4, base.y - h);
      ctx.lineTo(base.x + w / 3, base.y - h * 0.8);
      ctx.lineTo(base.x + w / 2, base.y);
      ctx.closePath();
      break;
    case "ramp":
      ctx.moveTo(base.x - w / 2, base.y);
      ctx.lineTo(base.x - w / 4, base.y - h);
      ctx.lineTo(base.x + w / 4, base.y - h);
      ctx.lineTo(base.x + w / 2, base.y);
      ctx.closePath();
      break;
    case "bay": {
      // A bay is painted on the ground, so it is drawn on the ground: four
      // corners projected, not a rectangle pinned to the screen.
      const far = project({ x: prop.x, y: 0, z: prop.z + 5 }, run, view);
      if (!far) return;
      const farW = prop.w * far.scale;
      ctx.moveTo(base.x - w / 2, base.y);
      ctx.lineTo(far.x - farW / 2, far.y);
      ctx.lineTo(far.x + farW / 2, far.y);
      ctx.lineTo(base.x + w / 2, base.y);
      ctx.closePath();
      break;
    }
    default:
      ctx.rect(base.x - w / 2, base.y - h, w, h);
  }

  ctx.stroke();
  ctx.globalAlpha = 1;
}

function Reading({
  label,
  value,
  unit,
  alert = false,
}: {
  label: string;
  value: string;
  unit: string;
  alert?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold leading-none tracking-tight">
        <span className={alert ? "text-alert" : "text-bone"}>{value}</span>{" "}
        {unit && <span className="font-mono text-[11px] font-normal text-dim">{unit}</span>}
      </p>
    </div>
  );
}
