// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import { record } from "@/lib/progress";
import { fill } from "@/lib/fill";
import {
  PRESETS,
  atPeak,
  operate,
  peak,
  presetIds,
  stallTorque,
  sweep,
  type OperatingPoint,
  type Peak,
  type PresetId,
} from "@/lib/motor";
import type { Dictionary } from "@/content/dictionaries";

const AMBER = "#ffb020";
const ICE = "#8fc5dc";
const DIM = "#6e7c87";
const BONE = "#e6e9ec";
const LINE = "#1e262d";
const VOID = "#080b0e";
const ALERT = "#ff5c5c";

const CUT_W = 300;
const CUT_H = 300;
/** Under this width the chart drops its middle label and shortens its longest. */
const NARROW = 520;

type Run = {
  id: PresetId;
  volts: number;
  points: OperatingPoint[];
  best: Peak;
};

/**
 * The bench the TÜBİTAK project would have wanted.
 *
 * One question runs the whole thing: where does this motor actually work best?
 * The visitor adds load until the efficiency curve tops out — and the marker
 * for that top is hidden until they find it, because a peak you are handed is
 * a fact and a peak you hunt is an experiment.
 *
 * The second marker is the argument. Maximum *power* sits far to the right of
 * maximum *efficiency*, at nearly half the efficiency, and a motor sized by
 * power alone lands there without anyone deciding to.
 *
 * It is laid out to be *watched*. The controls stand beside the chart as
 * upright faders rather than stacked under it, so the hand that adds load and
 * the curve that answers are on screen together — a control you have to scroll
 * away from to see the result of is not an instrument.
 */
export function MotorBench({ dict }: { dict: Dictionary }) {
  const copy = dict.motor;
  const still = useReducedMotion();

  const [presetId, setPresetId] = useState<PresetId>("baseline");
  const [volts, setVolts] = useState(PRESETS.baseline.vNominal);
  /** Load as a fraction of stall, so dropping the supply can never strand it past stall. */
  const [fraction, setFraction] = useState(0.5);
  const [reference, setReference] = useState<Run | null>(null);
  // Reduced motion opens on the answer: the readable state is the point, and
  // nobody should have to hunt with a fader to reach it.
  const [found, setFound] = useState(false);
  const recorded = useRef(false);

  const spec = PRESETS[presetId];
  const stall = stallTorque(spec, volts);
  const load = fraction * stall;

  const points = useMemo(() => sweep(spec, volts), [spec, volts]);
  const best = useMemo(() => peak(points), [points]);
  const point = useMemo(() => operate(spec, volts, load), [spec, volts, load]);
  const maxPower = useMemo(
    () => points.reduce((a, b) => (b.pOut > a.pOut ? b : a), points[0]),
    [points],
  );

  const showMarks = found || Boolean(still);

  /**
   * The hunt is settled where it happens — in the control that moved. Deriving
   * it in an effect would mean a second render every time a fader twitches,
   * and React 19 rightly refuses to let that pass.
   */
  const claim = useCallback((id: PresetId, v: number, f: number) => {
    const build = PRESETS[id];
    const run = sweep(build, v);
    if (!atPeak(operate(build, v, f * stallTorque(build, v)), peak(run))) return;
    setFound(true);
    if (recorded.current) return;
    recorded.current = true;
    record("instrument:motor");
  }, []);

  const changeLoad = useCallback(
    (next: number) => {
      setFraction(next);
      claim(presetId, volts, next);
    },
    [claim, presetId, volts],
  );

  const changeVolts = useCallback(
    (next: number) => {
      setVolts(next);
      claim(presetId, next, fraction);
    },
    [claim, presetId, fraction],
  );

  const changeBuild = useCallback(
    (id: PresetId) => {
      setPresetId(id);
      setVolts(PRESETS[id].vNominal);
      claim(id, PRESETS[id].vNominal, fraction);
    },
    [claim, fraction],
  );

  // Reduced motion never hunts, so the objective is recorded on arrival.
  useEffect(() => {
    if (!still || recorded.current) return;
    recorded.current = true;
    record("instrument:motor");
  }, [still]);

  const pin = useCallback(() => {
    setReference((r) => (r ? null : { id: presetId, volts, points, best }));
  }, [presetId, volts, points, best]);

  /* ── the characteristic ──────────────────────────────────────────────── */

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartBoxRef = useRef<HTMLDivElement>(null);
  /**
   * Measured, and drawn in CSS pixels at device resolution. The chart holds a
   * constant height while its width follows the rail beside it; a bitmap drawn
   * at one size and stretched to another would blur the type it depends on.
   */
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const box = chartBoxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width || 720);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const narrow = width < NARROW;
  const height = narrow ? 280 : 316;

  useEffect(() => {
    const canvas = chartRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const L = 46;
    const R = 16;
    const T = 16;
    const B = 28;
    const w = width - L - R;
    const h = height - T - B;

    // Both runs share one x axis, or a pinned curve would silently be redrawn
    // to a different scale and the comparison would be a lie.
    const xMax = Math.max(stall, reference?.points.at(-1)?.load ?? 0) || 1;
    const rpmMax = Math.max(points[0].rpm, reference ? reference.points[0].rpm : 0) || 1;
    const ampMax =
      Math.max(
        points.at(-1)?.current ?? 0,
        reference?.points.at(-1)?.current ?? 0,
      ) || 1;

    const x = (torque: number) => L + (torque / xMax) * w;
    const y = (unit: number) => T + (1 - Math.max(0, Math.min(1, unit))) * h;

    ctx.fillStyle = VOID;
    ctx.fillRect(0, 0, width, height);
    ctx.font = "11px monospace";
    ctx.letterSpacing = "1.5px";
    ctx.textBaseline = "middle";

    // Grid: efficiency owns the y axis, so the gridlines are percent.
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    for (let p = 0; p <= 100; p += 25) {
      const gy = Math.round(y(p / 100)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(L, gy);
      ctx.lineTo(L + w, gy);
      ctx.stroke();
      ctx.fillStyle = DIM;
      ctx.textAlign = "right";
      ctx.fillText(`${p}%`, L - 9, gy);
    }

    const curve = (
      run: OperatingPoint[],
      pick: (p: OperatingPoint) => number,
      colour: string,
      lineWidth: number,
      alpha: number,
    ) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = colour;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      run.forEach((p, i) => {
        const px = x(p.load);
        const py = y(pick(p));
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    // The pinned run first and faint — a memory of the last build, not a rival.
    if (reference) {
      curve(reference.points, (p) => p.efficiency, AMBER, 1.5, 0.3);
      curve(reference.points, (p) => p.rpm / rpmMax, ICE, 1, 0.18);
    }

    curve(points, (p) => p.rpm / rpmMax, ICE, 1.5, 0.85);
    curve(points, (p) => p.current / ampMax, DIM, 1.5, 0.9);
    curve(points, (p) => p.efficiency, AMBER, 2.5, 1);

    // Markers, once the peak has been found — the hunt is the instrument.
    if (showMarks) {
      const mark = (
        p: { load: number; efficiency: number },
        colour: string,
        label: string,
        dashed: boolean,
      ) => {
        const px = x(p.load);
        ctx.save();
        ctx.strokeStyle = colour;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash(dashed ? [3, 4] : []);
        ctx.beginPath();
        ctx.moveTo(px, T);
        ctx.lineTo(px, T + h);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = colour;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, y(p.efficiency), 5, 0, Math.PI * 2);
        ctx.stroke();

        const flip = px > L + w * 0.68;
        ctx.fillStyle = colour;
        ctx.textAlign = flip ? "right" : "left";
        ctx.fillText(label.toUpperCase(), px + (flip ? -9 : 9), y(p.efficiency) - 15);
      };

      mark(maxPower, DIM, `${copy.maxPowerMark} ${maxPower.pOut.toFixed(0)} W`, true);
      mark(best, AMBER, `${copy.peakMark} ${(best.efficiency * 100).toFixed(1)}%`, false);
    }

    // Where the bench is standing right now.
    const cx = x(point.load);
    ctx.strokeStyle = BONE;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, T);
    ctx.lineTo(cx, T + h);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = BONE;
    ctx.beginPath();
    ctx.arc(cx, y(point.efficiency), 4, 0, Math.PI * 2);
    ctx.fill();

    // Axis: the sweep runs from an unloaded shaft to one the motor cannot turn.
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(L, T + h + 0.5);
    ctx.lineTo(L + w, T + h + 0.5);
    ctx.stroke();

    ctx.fillStyle = DIM;
    ctx.textAlign = "left";
    ctx.fillText(copy.noLoad.toUpperCase(), L, T + h + 16);
    // The stall torque is worth printing, but not at the price of running into
    // the label at the other end of a phone-width axis.
    ctx.textAlign = "right";
    ctx.fillText(
      narrow
        ? copy.stall.toUpperCase()
        : `${copy.stall.toUpperCase()} · ${xMax.toFixed(3)} N·m`,
      L + w,
      T + h + 16,
    );
    if (!narrow) {
      ctx.textAlign = "center";
      ctx.fillText(copy.axisLoad.toUpperCase(), L + w / 2, T + h + 16);
    }
  }, [
    points,
    point,
    reference,
    showMarks,
    best,
    maxPower,
    stall,
    copy,
    width,
    height,
    narrow,
  ]);

  /* ── the machine ─────────────────────────────────────────────────────── */

  const cutRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = cutRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const stallCurrent = volts / spec.R || 1;
    // Share of the drawn power going to copper, tinted gently: at heavy load
    // half the input becomes heat and that is ordinary, not an alarm.
    const heat = point.pIn > 0 ? point.copperLoss / point.pIn : 0;
    const drive = Math.min(1, point.current / stallCurrent);

    const draw = () => {
      ctx.clearRect(0, 0, CUT_W, CUT_H);
      const cx = CUT_W / 2;
      const cy = CUT_H / 2;

      // Casing. It reddens with copper loss, which is the loss the visitor is
      // otherwise least likely to picture: heat is where the missing watts go.
      ctx.strokeStyle = blend(LINE, ALERT, Math.min(0.55, heat * 0.6));
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 128, 0, Math.PI * 2);
      ctx.stroke();

      // Stator field, one pole each side.
      for (const side of [-1, 1] as const) {
        ctx.strokeStyle = side < 0 ? ICE : AMBER;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          108,
          side < 0 ? Math.PI * 0.62 : -Math.PI * 0.38,
          side < 0 ? Math.PI * 1.38 : Math.PI * 0.38,
        );
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Armature — three poles, because a two-pole rotor has a dead spot and
      // the machine this describes did not.
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angleRef.current);
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i / 3) * Math.PI * 2);
        ctx.strokeStyle = blend(LINE, AMBER, 0.15 + drive * 0.85);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -74);
        ctx.stroke();

        ctx.strokeStyle = blend(DIM, AMBER, drive);
        ctx.lineWidth = 2;
        for (let t = 0; t < 4; t++) {
          ctx.beginPath();
          ctx.ellipse(0, -50 - t * 8, 15 - t * 2, 5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      ctx.strokeStyle = LINE;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.rotate(Math.PI / 3);
        ctx.moveTo(0, -22);
        ctx.lineTo(0, -14);
        ctx.stroke();
      }
      ctx.restore();

      // Brushes stay still while the commutator turns under them.
      ctx.fillStyle = blend(DIM, AMBER, drive);
      ctx.fillRect(cx - 3, cy - 34, 6, 10);
      ctx.fillRect(cx - 3, cy + 24, 6, 10);

      ctx.fillStyle = point.stalled ? ALERT : DIM;
      ctx.font = "11px monospace";
      ctx.letterSpacing = "1.5px";
      ctx.textAlign = "center";
      ctx.fillText(
        point.stalled ? copy.stalled.toUpperCase() : `${Math.round(point.rpm)} RPM`,
        cx,
        CUT_H - 8,
      );
    };

    if (still) {
      draw();
      return;
    }

    // Geared down hard: at three thousand rpm an honest rotor is a grey disc,
    // and the thing worth seeing is that it slows as the load goes on.
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      angleRef.current += point.omega * dt * 0.06;
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [point, volts, spec, still, copy]);

  /* ── panel ───────────────────────────────────────────────────────────── */

  const usefulShare = point.pIn > 0 ? point.pOut / point.pIn : 0;
  const copperShare = point.pIn > 0 ? point.copperLoss / point.pIn : 0;
  const frictionShare = point.pIn > 0 ? point.frictionLoss / point.pIn : 0;

  return (
    <div className="border border-line bg-surface/40">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {copy.eyebrow}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {copy.presets[presetId]}
        </p>
      </div>

      <div className="px-5 pb-5 pt-4">
        {/* Title, intro and the builds share one band. Three stacked blocks of
            prose over a chart is how this panel outgrew the screen. */}
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="max-w-2xl">
            <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
              {copy.title}
            </h3>
            <p className="mt-2 text-[14px] leading-relaxed text-dim">{copy.intro}</p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-wrap gap-px border border-line bg-line">
              {presetIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => changeBuild(id)}
                  aria-pressed={presetId === id}
                  className={`px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                    presetId === id
                      ? "bg-signal text-void"
                      : "bg-surface text-dim hover:text-bone"
                  }`}
                >
                  {copy.presets[id]}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={pin}
              className="border border-line px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dim transition-colors hover:border-signal hover:text-signal"
            >
              {reference ? copy.unpin : copy.pin}
            </button>
            {reference && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                {fill(copy.pinned, {
                  build: copy.presets[reference.id],
                  volts: reference.volts.toFixed(1),
                })}
              </span>
            )}
            {/* What this build changed, beside the button that chose it. */}
            <p className="max-w-xs text-[13px] leading-relaxed text-dim/80">
              {copy.presetNotes[presetId]}
            </p>
          </div>
        </div>

        {/* The rail: what the hand touches, upright and beside the answer. */}
        <div className="mt-4 grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
          <div className="flex gap-3">
            <Fader
              label={copy.torque}
              value={`${(load * 1000).toFixed(0)} mN·m`}
              min={0}
              max={1}
              step={0.01}
              current={fraction}
              onChange={changeLoad}
            />
            <Fader
              label={copy.voltage}
              value={`${volts.toFixed(1)} V`}
              min={0}
              max={spec.vMax}
              step={0.5}
              current={volts}
              onChange={changeVolts}
            />

            <div className="flex w-[190px] shrink-0 flex-col gap-2 sm:w-[210px]">
              <div className="flex flex-1 items-center border border-line bg-void p-2">
                <canvas
                  ref={cutRef}
                  width={CUT_W}
                  height={CUT_H}
                  className="h-auto w-full"
                  role="img"
                  aria-label={copy.machine}
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                {copy.machine}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div ref={chartBoxRef} className="border border-line bg-void p-3">
              <canvas
                ref={chartRef}
                style={{ width: "100%", height }}
                className="block"
                role="img"
                aria-label={copy.chart}
              />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span className="text-signal">— {copy.legend.efficiency}</span>
              <span className="text-ice">
                — {copy.legend.speed} · {Math.round(points[0].rpm)} rpm
              </span>
              <span className="text-dim">
                — {copy.legend.current} · {(points.at(-1)?.current ?? 0).toFixed(1)} A
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 border border-line bg-void px-5 py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <Stat
              label={copy.efficiency}
              value={(point.efficiency * 100).toFixed(1)}
              unit="%"
              accent
            />
            <Stat label={copy.rpm} value={String(Math.round(point.rpm))} unit="rpm" />
            <Stat label={copy.current} value={point.current.toFixed(2)} unit="A" />
            <Stat label={copy.torque} value={(point.load * 1000).toFixed(0)} unit="mN·m" />
            <Stat label={copy.input} value={point.pIn.toFixed(1)} unit="W" />
            <Stat label={copy.output} value={point.pOut.toFixed(1)} unit="W" />
          </div>

          {/* Every watt drawn, split three ways. It always adds to the whole. */}
          <div className="mt-4">
            <div className="flex h-2.5 w-full overflow-hidden border border-line">
              <span style={{ width: `${usefulShare * 100}%` }} className="bg-signal" />
              <span style={{ width: `${copperShare * 100}%` }} className="bg-alert/70" />
              <span style={{ width: `${frictionShare * 100}%` }} className="bg-ice/60" />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em]">
              <span className="text-signal">
                {copy.losses.useful} {(usefulShare * 100).toFixed(0)}%
              </span>
              <span className="text-alert/80">
                {copy.losses.copper} {(copperShare * 100).toFixed(0)}%
              </span>
              <span className="text-ice">
                {copy.losses.friction} {(frictionShare * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <p
            aria-live="polite"
            className="mt-3.5 max-w-4xl text-[14px] leading-relaxed text-bone/85"
          >
            {showMarks
              ? fill(copy.found, {
                  efficiency: (best.efficiency * 100).toFixed(1),
                  torque: (best.load * 1000).toFixed(0),
                  rpm: Math.round(best.rpm),
                  power: maxPower.pOut.toFixed(0),
                  powerEfficiency: (maxPower.efficiency * 100).toFixed(0),
                })
              : copy.hunt}
          </p>
        </div>

        <p className="mt-3 max-w-4xl text-[12px] leading-relaxed text-dim/70">{copy.note}</p>
      </div>
    </div>
  );
}

/**
 * An upright fader, built rather than borrowed.
 *
 * A native range input stood on its end is a per-browser gamble, and lying flat
 * it costs the height this panel is trying to give back. This is a slider in
 * the accessibility tree — arrows, page keys and Home/End all work — and a
 * column of light on screen, which is the register the rest of the page keeps.
 */
function Fader({
  label,
  value,
  min,
  max,
  step,
  current,
  onChange,
}: {
  label: string;
  /** Shown above the track, and spoken as the slider's value. */
  value: string;
  min: number;
  max: number;
  step: number;
  current: number;
  onChange: (next: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const span = max - min || 1;
  const ratio = Math.max(0, Math.min(1, (current - min) / span));

  const quantise = useCallback(
    (raw: number) => {
      const stepped = Math.round(raw / step) * step;
      const clamped = Math.max(min, Math.min(max, stepped));
      // A step of 0.01 leaves a float tail that would surface in the readout.
      return Number(clamped.toFixed(6));
    },
    [max, min, step],
  );

  const fromPointer = useCallback(
    (clientY: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect || rect.height === 0) return;
      const from = 1 - (clientY - rect.top) / rect.height;
      onChange(quantise(min + from * span));
    },
    [min, onChange, quantise, span],
  );

  const grab = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      fromPointer(event.clientY);
    },
    [fromPointer],
  );

  const drag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      fromPointer(event.clientY);
    },
    [fromPointer],
  );

  const key = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const page = span / 10;
      const moves: Record<string, number> = {
        ArrowUp: current + step,
        ArrowRight: current + step,
        ArrowDown: current - step,
        ArrowLeft: current - step,
        PageUp: current + page,
        PageDown: current - page,
        Home: min,
        End: max,
      };
      if (!(event.key in moves)) return;
      event.preventDefault();
      onChange(quantise(moves[event.key]));
    },
    [current, max, min, onChange, quantise, span, step],
  );

  return (
    <div className="flex w-[3.25rem] shrink-0 flex-col items-center gap-2">
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.1em] text-ice">
        {value}
      </span>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={current}
        aria-valuetext={value}
        aria-orientation="vertical"
        onPointerDown={grab}
        onPointerMove={drag}
        onKeyDown={key}
        className="relative min-h-[170px] w-full flex-1 cursor-ns-resize touch-none border border-line bg-void transition-colors hover:border-dim"
      >
        {/* Filled from the bottom: the column reads as a quantity at a glance. */}
        <span
          aria-hidden="true"
          style={{ height: `${ratio * 100}%` }}
          className="absolute inset-x-0 bottom-0 bg-signal/10"
        />
        {[0.25, 0.5, 0.75].map((tick) => (
          <span
            key={tick}
            aria-hidden="true"
            style={{ bottom: `${tick * 100}%` }}
            className="absolute inset-x-0 h-px bg-line/80"
          />
        ))}
        <span
          aria-hidden="true"
          style={{ bottom: `calc(${ratio * 100}% - 1px)` }}
          className="absolute inset-x-0 h-0.5 bg-signal"
        />
      </div>
      <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
        {label}
      </span>
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
      <p className="mt-0.5 font-display text-[1.7rem] font-bold leading-none tracking-tight">
        <span className={accent ? "text-signal" : "text-bone"}>{value}</span>{" "}
        <span className="font-mono text-xs font-normal text-dim">{unit}</span>
      </p>
    </div>
  );
}

/** Mixes two hex colours — the canvas has no access to the CSS palette. */
function blend(from: string, to: string, amount: number) {
  const a = Number.parseInt(from.slice(1), 16);
  const b = Number.parseInt(to.slice(1), 16);
  const t = Math.max(0, Math.min(1, amount));
  const mix = (shift: number) => {
    const x = (a >> shift) & 255;
    const y = (b >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
}
