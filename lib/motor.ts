// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The brushed DC motor the bench runs on.
 *
 * This is a model, not a record. The 2019 project's own measurements are gone;
 * what survives is the question it asked — where does a motor actually run at
 * its best? — so the bench answers that question from the machine's equations
 * instead of pretending to replay a notebook nobody kept. Everything below is
 * the textbook steady-state model, and the page says so in its own copy.
 *
 *   τ = k·I                      torque is current, scaled by the machine
 *   V = I·R + k·ω                supply splits into resistive drop and back-EMF
 *   τ = τ_load + τ_f + b·ω       what the shaft makes, the shaft spends
 *
 * Solving those three for ω is the whole simulation. The interesting part is
 * what falls out of it: efficiency is zero at both ends — no load means no work
 * done, stall means no motion — so it must peak somewhere in between, and that
 * peak is nowhere near the load where the motor makes the most power.
 */

/** One motor configuration. Two of these differ the way two builds differ. */
export type MotorSpec = {
  /** Torque constant kt (N·m/A), numerically the back-EMF constant ke (V·s/rad). */
  k: number;
  /** Winding resistance, ohms. */
  R: number;
  /** Brush and bearing drag that does not depend on speed, N·m. */
  friction: number;
  /** Viscous damping — windage and bearing losses that do, N·m·s/rad. */
  damping: number;
  /** Highest supply the bench will offer for this build, volts. */
  vMax: number;
  /** Where the voltage slider starts. */
  vNominal: number;
};

export type PresetId = "baseline" | "rewound" | "bearings";

/**
 * Three builds of the same small machine, which is what a comparative
 * experiment actually looks like: change one thing, sweep the load again.
 *
 * `rewound` adds turns — more torque per amp, but a longer, thinner wire has
 * more resistance, so it pays for that torque in copper. `bearings` leaves the
 * electrical machine alone and only takes drag out of the mechanics. The two
 * improve very different ends of the curve, and the bench is the only place
 * that becomes obvious.
 */
export const PRESETS: Record<PresetId, MotorSpec> = {
  baseline: { k: 0.035, R: 1.2, friction: 0.004, damping: 2.0e-5, vMax: 24, vNominal: 12 },
  rewound: { k: 0.05, R: 2.0, friction: 0.004, damping: 2.0e-5, vMax: 24, vNominal: 12 },
  bearings: { k: 0.035, R: 1.2, friction: 0.0012, damping: 8.0e-6, vMax: 24, vNominal: 12 },
};

export const presetIds = ["baseline", "rewound", "bearings"] as const;

export const RAD_TO_RPM = 60 / (2 * Math.PI);

export type OperatingPoint = {
  /** Load torque asked of the shaft, N·m — the sweep's x axis. */
  load: number;
  /** Shaft speed, rad/s. */
  omega: number;
  rpm: number;
  /** Winding current, amps. */
  current: number;
  /** Torque the machine develops, N·m — load plus what drag eats. */
  torque: number;
  /** Electrical power in, watts. */
  pIn: number;
  /** Mechanical power delivered to the load, watts. */
  pOut: number;
  /** I²R, watts. */
  copperLoss: number;
  /** Coulomb plus viscous drag, watts. */
  frictionLoss: number;
  /** pOut / pIn, 0–1. Zero at both ends of the sweep, by definition. */
  efficiency: number;
  /** True when the load has stopped the shaft — current is at its maximum. */
  stalled: boolean;
};

/** Load the shaft can hold at a standstill: everything the winding can make. */
export function stallTorque(spec: MotorSpec, volts: number): number {
  return Math.max(0, (spec.k * volts) / spec.R - spec.friction);
}

/** Speed with nothing on the shaft — the right end of the speed line. */
export function noLoadRpm(spec: MotorSpec, volts: number): number {
  return operate(spec, volts, 0).rpm;
}

/**
 * The steady state at one supply and one load.
 *
 * Every degenerate case is closed here rather than left to a ternary at a call
 * site: no supply, a load past stall, and the zero-power division that would
 * otherwise hand the page a NaN to render.
 */
export function operate(spec: MotorSpec, volts: number, load: number): OperatingPoint {
  const { k, R, friction, damping } = spec;
  const v = Math.max(0, volts);
  const asked = Math.max(0, load);

  // ω from the three equations above. Negative means the load wins: the shaft
  // never turns, so the model switches to the stalled branch rather than
  // reporting a motor running backwards under its own supply.
  const omegaRaw = ((k * v) / R - asked - friction) / (damping + (k * k) / R);
  const stalled = !(omegaRaw > 0);
  const omega = stalled ? 0 : omegaRaw;

  const current = (v - k * omega) / R;
  const torque = k * current;

  const pIn = v * current;
  const pOut = asked * omega;
  const copperLoss = current * current * R;
  const frictionLoss = friction * omega + damping * omega * omega;

  return {
    load: asked,
    omega,
    rpm: omega * RAD_TO_RPM,
    current,
    torque,
    pIn,
    pOut,
    copperLoss,
    frictionLoss,
    efficiency: pIn > 0 ? Math.max(0, Math.min(1, pOut / pIn)) : 0,
    stalled,
  };
}

/**
 * The load sweep, 0 → stall, which is the experiment itself: hold the supply,
 * add load a step at a time, write down what the machine does.
 */
export function sweep(spec: MotorSpec, volts: number, steps = 160): OperatingPoint[] {
  const max = stallTorque(spec, volts);
  if (max <= 0) return [operate(spec, volts, 0)];
  return Array.from({ length: steps + 1 }, (_, i) =>
    operate(spec, volts, (i / steps) * max),
  );
}

export type Peak = { load: number; efficiency: number; rpm: number };

/** The best point on a sweep — the thing the visitor is looking for. */
export function peak(points: OperatingPoint[]): Peak {
  let best = points[0];
  for (const p of points) if (p.efficiency > best.efficiency) best = p;
  return { load: best.load, efficiency: best.efficiency, rpm: best.rpm };
}

/**
 * Whether a load sits close enough to the peak to call it found. Measured in
 * efficiency rather than torque: near a flat maximum a wide band of loads is
 * genuinely as good, and the point being made is about efficiency, not about
 * landing a slider on a pixel.
 */
export const PEAK_BAND = 0.02;

export function atPeak(point: OperatingPoint, best: Peak): boolean {
  return best.efficiency > 0 && best.efficiency - point.efficiency <= PEAK_BAND;
}
