// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { record } from "@/lib/progress";
import { type Dictionary } from "@/content/dictionaries";
import { fill } from "@/lib/fill";
import {
  PARCEL_POSITIONS,
  SHOCK_LIMIT,
  WORLD,
  createMission,
  score,
  step,
  type Input,
  type Mission,
} from "@/lib/rover";
import { drawMission, routeProgress } from "./draw";

/**
 * The delivery run, playable.
 *
 * EGE ODBARS's mission is not "drive somewhere" — it is read a tag, carry the
 * parcel without wrecking it, and hand it over. That middle part is the part
 * that is hard to explain in a sentence and immediate the moment you land a
 * six-wheeler badly and watch the cargo readout drop.
 *
 * The physics runs at a fixed 120 Hz regardless of the display, so the same
 * jump clears the same ridge on every machine.
 */

const STEP = 1 / 120;
/** Never simulate more than this per frame — a backgrounded tab must not
 *  return and run a thousand steps at once. */
const MAX_STEPS = 8;

type Phase = "idle" | "running" | "complete";

const clock = (seconds: number) => {
  const total = Math.floor(seconds);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

export function RoverSim({ dict }: { dict: Dictionary }) {
  const copy = dict.sim;

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState({ score: 0, time: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const missionRef = useRef<Mission | null>(null);
  const inputRef = useRef<Input>({ drive: 0, recover: false });
  const frameRef = useRef(0);
  const lastRef = useRef(0);
  const accRef = useRef(0);
  const logLengthRef = useRef(0);

  const clockRef = useRef<HTMLSpanElement>(null);
  const cargoRef = useRef<HTMLSpanElement>(null);
  const loadRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLUListElement>(null);

  const paintHud = useCallback((mission: Mission) => {
    const aboard = mission.parcels.filter((p) => p.state === "aboard");
    const delivered = mission.parcels.filter((p) => p.state === "delivered");

    if (clockRef.current) {
      clockRef.current.textContent = clock(mission.elapsed + mission.penalty);
    }
    if (cargoRef.current) {
      const integrity = aboard.length
        ? Math.round(
            aboard.reduce((sum, p) => sum + p.integrity, 0) / aboard.length,
          )
        : 100;
      cargoRef.current.textContent = `${aboard.length} · ${integrity}%`;
    }
    // The one number the player has to learn to read: over the limit, the
    // struts are out of travel and the parcels are taking it.
    if (loadRef.current) {
      const load = mission.rover.load;
      loadRef.current.textContent = `${load.toFixed(1)} g`;
      loadRef.current.style.color = load > SHOCK_LIMIT ? "#ff5c4d" : "";
    }
    if (scoreRef.current) {
      scoreRef.current.textContent = `${delivered.length}/${mission.parcels.length}`;
    }
    if (barRef.current) {
      barRef.current.style.width = `${routeProgress(mission) * 100}%`;
    }

    // The log only changes when something happens, so it is the one part of
    // the HUD that can afford real DOM writes.
    if (logRef.current && mission.log.length !== logLengthRef.current) {
      logLengthRef.current = mission.log.length;
      logRef.current.replaceChildren(
        ...mission.log.slice(0, 4).map((line, index) => {
          const item = document.createElement("li");
          item.textContent = line;
          item.style.opacity = String(1 - index * 0.24);
          return item;
        }),
      );
    }
  }, []);

  const stop = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    inputRef.current = { drive: 0, recover: false };
  }, []);

  /** Starts the render/simulate loop. */
  const run = useCallback(() => {
    const frame = (now: number) => {
      frameRef.current = requestAnimationFrame(frame);

      const canvas = canvasRef.current;
      const mission = missionRef.current;
      if (!canvas || !mission) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const elapsed = (now - (lastRef.current || now)) / 1000;
      lastRef.current = now;
      accRef.current = Math.min(accRef.current + elapsed, STEP * MAX_STEPS);

      while (accRef.current >= STEP) {
        step(mission, STEP, inputRef.current);
        // A recovery is a single event, not a held state.
        inputRef.current.recover = false;
        accRef.current -= STEP;
      }

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawMission(
          ctx,
          mission,
          canvas.clientWidth,
          canvas.clientHeight,
          copy.depot,
        );
      }
      paintHud(mission);

      if (mission.state === "complete") {
        stop();
        setResult({
          score: score(mission),
          time: mission.elapsed + mission.penalty,
        });
        setPhase("complete");
        record("instrument:sim");
      }
    };

    frameRef.current = requestAnimationFrame(frame);
  }, [copy.depot, paintHud, stop]);

  const start = () => {
    missionRef.current = createMission(copy.log);
    logLengthRef.current = 0;
    lastRef.current = 0;
    accRef.current = 0;
    setPhase("running");
    run();
  };

  useEffect(() => stop, [stop]);

  // Arrow keys belong to the page until the run starts, and are taken back the
  // moment it ends.
  useEffect(() => {
    if (phase !== "running") return;

    const keys = new Set<string>();
    const apply = () => {
      const forward = keys.has("ArrowRight") || keys.has("d");
      const back = keys.has("ArrowLeft") || keys.has("a");
      inputRef.current.drive = Number(forward) - Number(back);
    };
    const down = (event: KeyboardEvent) => {
      if (event.key === "r" || event.key === "R") {
        inputRef.current.recover = true;
        return;
      }
      if (!["ArrowRight", "ArrowLeft", "d", "a"].includes(event.key)) return;
      event.preventDefault();
      keys.add(event.key);
      apply();
    };
    const up = (event: KeyboardEvent) => {
      keys.delete(event.key);
      apply();
    };
    const blur = () => {
      keys.clear();
      apply();
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [phase]);

  const setDrive = useCallback((drive: number) => {
    inputRef.current.drive = drive;
  }, []);

  return (
    <section className="border border-line bg-surface">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            {copy.eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
            {copy.simTitle}
          </h2>
        </div>
        {phase === "running" && (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
            {copy.controls}
          </p>
        )}
      </header>

      {/* Portrait on a phone, cinematic on a desktop — a 16/9 strip 390 px wide
          leaves no room for the readouts and the ground at the same time. The
          viewport cap is the other end of the same problem: at desktop widths
          a plain 16/9 box is taller than the screen, which buries the HUD
          under the fixed header. */}
      <div className="relative aspect-[5/6] max-h-[66vh] w-full overflow-hidden bg-void sm:aspect-[16/10] lg:aspect-[16/9]">
        <canvas
          ref={canvasRef}
          // Canvas has no implicit role, so a bare aria-label is liable to be
          // dropped. The live text alternative is the readout list and the
          // event log beside it, which is where the run state actually is.
          role="img"
          aria-label={copy.simTitle}
          className="absolute inset-0 h-full w-full touch-none"
        />

        {/* Route bar: how far along, and where the tags are. */}
        <div className="absolute inset-x-0 top-0 h-px bg-line">
          <div ref={barRef} className="h-px w-0 bg-signal" />
          {PARCEL_POSITIONS.map((x) => (
            <span
              key={x}
              style={{
                left: `${((x - WORLD.start) / (WORLD.depot - WORLD.start)) * 100}%`,
              }}
              className="absolute top-0 h-2 w-px -translate-x-1/2 bg-ice/60"
            />
          ))}
        </div>

        {phase === "running" && (
          <>
            <dl className="pointer-events-none absolute left-3 top-3 space-y-0.5 font-mono text-[10px] uppercase tracking-[0.12em] md:left-4 md:top-4 md:space-y-1 md:text-[11px] md:tracking-[0.16em]">
              {[
                { label: copy.time, ref: clockRef, tone: "text-bone" },
                { label: copy.cargo, ref: cargoRef, tone: "text-signal" },
                { label: copy.load, ref: loadRef, tone: "text-bone" },
                { label: copy.delivered, ref: scoreRef, tone: "text-lock" },
              ].map((row) => (
                <div key={row.label} className="flex gap-2">
                  <dt className="w-16 text-dim md:w-24">{row.label}</dt>
                  <dd className={row.tone}>
                    <span ref={row.ref}>—</span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* Under the readouts on a phone, opposite them on a desktop —
                either way it never lands on the ground the player is reading. */}
            <ul
              ref={logRef}
              aria-live="polite"
              className="pointer-events-none absolute left-3 top-[5.5rem] space-y-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ice md:left-auto md:right-4 md:top-4 md:space-y-1 md:text-right md:text-[10px] md:tracking-[0.14em]"
            />

            {/* Touch controls. Hidden from pointer devices, where the keys are
                both faster and already documented in the header. */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-4 [@media(pointer:fine)]:hidden">
              <button
                type="button"
                aria-label={copy.reverse}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDrive(-1);
                }}
                onPointerUp={() => setDrive(0)}
                onPointerCancel={() => setDrive(0)}
                className="h-16 w-24 border border-line bg-void/70 font-mono text-lg text-dim active:border-signal active:text-signal"
              >
                ◄
              </button>
              <button
                type="button"
                aria-label={copy.forward}
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setDrive(1);
                }}
                onPointerUp={() => setDrive(0)}
                onPointerCancel={() => setDrive(0)}
                className="h-16 w-24 border border-line bg-void/70 font-mono text-lg text-signal active:bg-signal active:text-void"
              >
                ►
              </button>
            </div>
          </>
        )}

        {phase !== "running" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-void/80 px-6 text-center">
            {phase === "complete" ? (
              <>
                <p className="font-display text-4xl font-extrabold tracking-tight text-bone md:text-5xl">
                  {fill(copy.result, { score: result.score })}
                </p>
                <p className="max-w-md font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                  {fill(copy.resultDetail, { time: clock(result.time) })}
                </p>
              </>
            ) : (
              <p className="max-w-md text-[15px] leading-relaxed text-dim">
                {copy.intro}
              </p>
            )}
            <button
              type="button"
              onClick={start}
              className="border border-signal px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
            >
              {phase === "complete" ? copy.again : copy.start}
            </button>
          </div>
        )}
      </div>

      <footer className="border-t border-line px-5 py-4">
        <p className="max-w-2xl text-[13px] leading-relaxed text-dim">
          {copy.note}
        </p>
      </footer>
    </section>
  );
}
