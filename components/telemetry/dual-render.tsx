// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { record } from "@/lib/progress";
import {
  ACCEL_RANGE,
  CSV_HEADER,
  GYRO_RANGE,
  WINDOW,
  nextSample,
  push,
  seedWindow,
  toCsvRow,
  toJson,
  type Activity,
  type Sample,
} from "@/lib/telemetry";
import type { Dictionary } from "@/content/dictionaries";

const AMBER = "#ffb020";
const ICE = "#8fc5dc";
const LINE = "#232c33";
const BONE = "#e8e4dd";
const DIM = "#6b7076";

/**
 * The Nextion is a 2.4" 320x240 TFT driven by the ESP32 over serial. Its
 * palette and its pixels are its own — drawing it smooth and on-palette would
 * quietly erase the thing worth showing, which is that one packet lands on two
 * screens with nothing in common.
 */
const TFT_W = 320;
const TFT_H = 240;
const TFT_BG = "#04070a";
const TFT_GRID = "#0e2430";
const TFT_CYAN = "#25d0e0";
const TFT_GREEN = "#39e08a";
const TFT_AMBER = "#f0a020";

const ACTIVITIES: Activity[] = ["rest", "walk", "sprint"];

export function DualRender({ dict }: { dict: Dictionary }) {
  const copy = dict.telemetry;
  const still = useReducedMotion();

  const [activity, setActivity] = useState<Activity>("rest");
  const [window_, setWindow] = useState<Sample[]>(() => seedWindow("rest"));
  const [running, setRunning] = useState(false);
  const [rows, setRows] = useState(WINDOW);
  const seen = useRef(false);
  const tftRef = useRef<HTMLCanvasElement>(null);

  const latest = window_[window_.length - 1];

  // One clock at the real rate. Both screens read the same array, so they
  // cannot drift apart — which is exactly the claim the ESP32 makes.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setWindow((w) => push(w, nextSample(w[w.length - 1], activity)));
      setRows((n) => n + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, activity]);

  const start = useCallback(() => {
    if (!seen.current) {
      seen.current = true;
      record("instrument:telemetry");
    }
    setRunning((r) => !r);
  }, []);

  /** Step once, for when motion is unwelcome or the reader wants one frame. */
  const stepOnce = useCallback(() => {
    if (!seen.current) {
      seen.current = true;
      record("instrument:telemetry");
    }
    setWindow((w) => push(w, nextSample(w[w.length - 1], activity)));
    setRows((n) => n + 1);
  }, [activity]);

  // The embedded screen, drawn at its own resolution and scaled up with
  // smoothing off so the pixels stay pixels.
  useEffect(() => {
    const canvas = tftRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = TFT_BG;
    ctx.fillRect(0, 0, TFT_W, TFT_H);

    ctx.fillStyle = TFT_CYAN;
    ctx.font = "10px monospace";
    ctx.fillText("TELEMETRY  1 Hz", 6, 13);
    ctx.fillStyle = TFT_GRID;
    ctx.fillRect(0, 18, TFT_W, 1);

    // Blocky meters — a bar the panel can redraw cheaply, not a smooth arc.
    const hr = Math.round(latest.hr);
    const spo2 = Math.round(latest.spo2);
    ctx.fillStyle = TFT_AMBER;
    ctx.font = "bold 28px monospace";
    ctx.fillText(String(hr), 8, 52);
    ctx.font = "9px monospace";
    ctx.fillStyle = TFT_GRID;
    ctx.fillText("BPM", 62, 52);

    ctx.fillStyle = TFT_GREEN;
    ctx.font = "bold 28px monospace";
    ctx.fillText(String(spo2), 120, 52);
    ctx.font = "9px monospace";
    ctx.fillStyle = TFT_GRID;
    ctx.fillText("SPO2 %", 174, 52);

    for (let i = 0; i < 24; i++) {
      const on = i / 24 < (hr - 50) / 140;
      ctx.fillStyle = on ? TFT_AMBER : TFT_GRID;
      ctx.fillRect(8 + i * 12, 62, 8, 6);
    }

    // Two traces, one column per sample. At 1 Hz the steps are visible and
    // that is honest: the panel is not drawing anything it was not sent.
    const plot = (
      top: number,
      height: number,
      pick: (s: Sample) => number,
      range: number,
      colour: string,
      label: string,
    ) => {
      ctx.fillStyle = TFT_GRID;
      ctx.fillRect(0, top, TFT_W, 1);
      ctx.fillRect(0, top + height, TFT_W, 1);
      ctx.font = "9px monospace";
      ctx.fillText(label, 6, top + 11);

      const step = TFT_W / (WINDOW - 1);
      const yAt = (s: Sample) => {
        const v = Math.max(-range, Math.min(range, pick(s)));
        return Math.round(top + height / 2 - (v / range) * (height / 2 - 3));
      };
      ctx.strokeStyle = colour;
      ctx.lineWidth = 1;
      ctx.beginPath();
      window_.forEach((s, i) => {
        const x = Math.round(i * step) + 0.5;
        const y = yAt(s) + 0.5;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    plot(84, 66, (s) => s.ax, ACCEL_RANGE, TFT_CYAN, "ACC X  g");
    plot(162, 66, (s) => s.gx, GYRO_RANGE, TFT_GREEN, "GYR X  dps");
  }, [window_, latest]);

  const chip = (a: Activity) => (
    <button
      key={a}
      type="button"
      onClick={() => setActivity(a)}
      aria-pressed={activity === a}
      className={`border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
        activity === a
          ? "border-signal text-signal"
          : "border-line text-dim hover:border-dim hover:text-bone"
      }`}
    >
      {copy.activities[a]}
    </button>
  );

  // A minute of history around the dial, one tick per second.
  const dial = window_.map((s, i) => {
    const angle = (i / WINDOW) * Math.PI * 2 - Math.PI / 2;
    const lit = (s.hr - 55) / 130;
    const r1 = 74;
    const r2 = 74 + 6 + Math.max(2, Math.min(20, lit * 22));
    return {
      key: s.t,
      x1: 100 + Math.cos(angle) * r1,
      y1: 100 + Math.sin(angle) * r1,
      x2: 100 + Math.cos(angle) * r2,
      y2: 100 + Math.sin(angle) * r2,
      head: i === window_.length - 1,
    };
  });

  return (
    <div className="border border-line bg-surface/40">
      <div className="border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {copy.eyebrow}
        </p>
      </div>

      <div className="px-5 pb-6 pt-5">
        <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
          {copy.title}
        </h3>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-dim">{copy.intro}</p>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {ACTIVITIES.map(chip)}
          <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
          <button
            type="button"
            onClick={still ? stepOnce : start}
            className="border border-signal px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-signal transition-colors hover:bg-signal hover:text-void"
          >
            {still ? copy.step : running ? copy.pause : copy.start}
          </button>
        </div>

        {/* Three renderings of the same second: the round face it leaves, the
            browser panel, and the panel on the wall. */}
        <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,22rem)]">
          {/* 1 · the watch */}
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 200 200" className="w-full max-w-[15rem]" role="img" aria-label={copy.watch}>
              <circle cx="100" cy="100" r="98" fill="#0b0f13" stroke={LINE} />
              <circle cx="100" cy="100" r="72" fill="none" stroke={LINE} strokeDasharray="2 6" />
              {dial.map((d) => (
                <line
                  key={d.key}
                  x1={d.x1}
                  y1={d.y1}
                  x2={d.x2}
                  y2={d.y2}
                  stroke={d.head ? BONE : AMBER}
                  strokeOpacity={d.head ? 1 : 0.5}
                  strokeWidth={d.head ? 3 : 2}
                />
              ))}
              <text x="100" y="96" textAnchor="middle" fill={BONE} fontSize="38" fontFamily="var(--font-mono, monospace)">
                {Math.round(latest.hr)}
              </text>
              <text x="100" y="114" textAnchor="middle" fill={DIM} fontSize="10" letterSpacing="3" fontFamily="var(--font-mono, monospace)">
                BPM
              </text>
              <text x="100" y="140" textAnchor="middle" fill={ICE} fontSize="14" fontFamily="var(--font-mono, monospace)">
                {Math.round(latest.spo2)}% SpO₂
              </text>
            </svg>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {copy.watch}
            </p>
          </div>

          {/* 2 · the browser panel */}
          <div className="flex flex-col gap-3">
            <div className="flex-1 border border-line bg-void p-5">
              <div className="flex flex-wrap gap-x-10 gap-y-4">
                <Stat label={copy.hr} value={`${Math.round(latest.hr)}`} unit="bpm" accent />
                <Stat label={copy.spo2} value={`${Math.round(latest.spo2)}`} unit="%" />
                <Stat label={copy.rows} value={String(rows)} unit={copy.rowsUnit} />
              </div>

              {/* Smooth where the TFT is blocky — same numbers, other idiom. */}
              <svg viewBox={`0 0 ${WINDOW - 1} 100`} preserveAspectRatio="none" className="mt-5 h-28 w-full">
                <polyline
                  fill="none"
                  stroke={AMBER}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                  points={window_
                    .map((s, i) => `${i},${50 - (s.ax / ACCEL_RANGE) * 46}`)
                    .join(" ")}
                />
                <polyline
                  fill="none"
                  stroke={ICE}
                  strokeWidth={1.2}
                  vectorEffect="non-scaling-stroke"
                  points={window_
                    .map((s, i) => `${i},${50 - (s.gx / GYRO_RANGE) * 46}`)
                    .join(" ")}
                />
              </svg>
              <div className="mt-2 flex gap-6 font-mono text-[10px] uppercase tracking-[0.18em]">
                <span className="text-signal">— {copy.accel}</span>
                <span className="text-ice">— {copy.gyro}</span>
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {copy.browser}
            </p>
          </div>

          {/* 3 · the wall panel */}
          <div className="flex flex-col gap-3">
            <div className="border border-line bg-void p-4">
              <canvas
                ref={tftRef}
                width={TFT_W}
                height={TFT_H}
                className="h-auto w-full"
                style={{ imageRendering: "pixelated" }}
                role="img"
                aria-label={copy.nextion}
              />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
              {copy.nextion}
            </p>
          </div>
        </div>

        {/* The packet itself — the only thing that actually crosses the wire. */}
        <div className="mt-7 border border-line bg-void px-5 py-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            {copy.packet}
          </p>
          <p className="mt-2 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-bone">
            {toJson(latest)}
          </p>
          <p className="mt-3 font-mono text-[10px] text-dim">
            {CSV_HEADER}
          </p>
          <p className="font-mono text-[10px] text-dim/70">{toCsvRow(latest)}</p>
        </div>

        <p className="mt-5 max-w-3xl text-[13px] leading-relaxed text-dim/80">{copy.note}</p>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold tracking-tight">
        <span className={accent ? "text-signal" : "text-bone"}>{value}</span>{" "}
        <span className="font-mono text-xs font-normal text-dim">{unit}</span>
      </p>
    </div>
  );
}
