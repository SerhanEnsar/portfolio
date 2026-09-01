// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The signal TELEMETRY carries, and the shape it travels in.
 *
 * The system's character is its rate: one packet a second, from a Wear OS
 * watch to an ESP32 over HTTP/JSON, and the ESP32 draws it in two places at
 * once — a browser dashboard and a Nextion TFT. At 1 Hz a waveform is coarse
 * by definition; that coarseness is the specification, not a shortcut, so the
 * demo runs at the real rate rather than a flattering one.
 *
 * The samples here are generated, not recorded — the real ones come off the
 * watch's sensors. What is modelled rather than randomised is the part that
 * makes it read as a body: heart rate lags, it does not jump, and SpO2 falls a
 * little as effort rises.
 */

export type Activity = "rest" | "walk" | "sprint";

export type Sample = {
  /** Seconds since the stream started — one per tick, by definition. */
  t: number;
  /** Beats per minute. */
  hr: number;
  /** Oxygen saturation, percent. */
  spo2: number;
  /** Accelerometer, g. */
  ax: number;
  ay: number;
  az: number;
  /** Gyroscope, degrees per second. */
  gx: number;
  gy: number;
  gz: number;
};

type Profile = {
  hr: number;
  spo2: number;
  /** Peak accelerometer excursion away from 1 g, in g. */
  accel: number;
  /** Peak angular rate, dps. */
  gyro: number;
  /** Steps per second — what the limbs are doing. */
  cadence: number;
};

const PROFILES: Record<Activity, Profile> = {
  rest: { hr: 66, spo2: 98, accel: 0.03, gyro: 4, cadence: 0.25 },
  walk: { hr: 104, spo2: 97, accel: 0.35, gyro: 45, cadence: 1.8 },
  sprint: { hr: 164, spo2: 95, accel: 1.2, gyro: 190, cadence: 3.1 },
};

/** One minute of history, which is what the Nextion's trace holds. */
export const WINDOW = 60;
export const HZ = 1;

/** Small deterministic noise so a reload does not redraw a different body. */
function noise(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export const START: Sample = {
  t: 0,
  hr: PROFILES.rest.hr,
  spo2: PROFILES.rest.spo2,
  ax: 0,
  ay: 0,
  az: 1,
  gx: 0,
  gy: 0,
  gz: 0,
};

/**
 * The next tick. Heart rate eases toward the activity's target — a body takes
 * the better part of a minute to catch up, and stepping it instantly is the
 * single thing that would give the model away.
 */
export function nextSample(prev: Sample, activity: Activity): Sample {
  const p = PROFILES[activity];
  const t = prev.t + 1;
  const phase = t * p.cadence * Math.PI * 2;

  return {
    t,
    hr: prev.hr + (p.hr - prev.hr) * 0.12 + noise(t) * 0.9,
    spo2: Math.min(99, Math.max(92, prev.spo2 + (p.spo2 - prev.spo2) * 0.2 + noise(t + 7) * 0.2)),
    ax: Math.sin(phase) * p.accel + noise(t + 1) * p.accel * 0.25,
    ay: Math.cos(phase * 0.7) * p.accel * 0.6 + noise(t + 2) * p.accel * 0.25,
    az: 1 + Math.sin(phase * 2) * p.accel * 0.5 + noise(t + 3) * p.accel * 0.2,
    gx: Math.sin(phase * 1.1) * p.gyro + noise(t + 4) * p.gyro * 0.2,
    gy: Math.cos(phase) * p.gyro * 0.8 + noise(t + 5) * p.gyro * 0.2,
    gz: Math.sin(phase * 0.6) * p.gyro * 0.5 + noise(t + 6) * p.gyro * 0.2,
  };
}

/** A minute of history, so the trace is populated the moment it is watched. */
export function seedWindow(activity: Activity): Sample[] {
  const out: Sample[] = [START];
  for (let i = 0; i < WINDOW - 1; i++) out.push(nextSample(out[out.length - 1], activity));
  return out;
}

export function push(window: Sample[], sample: Sample): Sample[] {
  const next = [...window, sample];
  return next.length > WINDOW ? next.slice(next.length - WINDOW) : next;
}

/** The packet as it actually goes over the wire. */
export function toJson(s: Sample): string {
  return JSON.stringify({
    t: s.t,
    hr: Math.round(s.hr),
    spo2: Math.round(s.spo2),
    acc: [+s.ax.toFixed(2), +s.ay.toFixed(2), +s.az.toFixed(2)],
    gyr: [Math.round(s.gx), Math.round(s.gy), Math.round(s.gz)],
  });
}

export const CSV_HEADER = "t,hr,spo2,ax,ay,az,gx,gy,gz";

export function toCsvRow(s: Sample): string {
  return [
    s.t,
    Math.round(s.hr),
    Math.round(s.spo2),
    s.ax.toFixed(3),
    s.ay.toFixed(3),
    s.az.toFixed(3),
    Math.round(s.gx),
    Math.round(s.gy),
    Math.round(s.gz),
  ].join(",");
}

/** Fixed scales, so a trace cannot flatter itself by rescaling as it moves. */
export const ACCEL_RANGE = 1.5;
export const GYRO_RANGE = 240;
