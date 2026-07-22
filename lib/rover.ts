// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * A six-wheel rover crossing broken ground, and the delivery run it is on.
 *
 * Simulation only — no canvas, no DOM, no React. The component above it draws
 * whatever state this returns and feeds input back in, which keeps the physics
 * readable and lets the mission rules sit next to the forces that break them.
 *
 * The vehicle is EGE ODBARS in profile: a rocker-bogie chassis whose three
 * wheels per side ride independently, which is exactly why it can cross a
 * ridge that would beach a rigid axle. Suspension is modelled as three
 * spring-dampers rather than a linkage solver — the articulation reads
 * correctly, and a linkage solver would be a week of work for a demo.
 */

import { fill } from "@/lib/fill";

export const WORLD = {
  /** Ground level with no relief, in world pixels, y down. */
  datum: 520,
  length: 5400,
  /** Where the rover starts, and where the run is timed from. */
  start: 220,
  depot: 5150,
};

/** Sits on the ground, waits to be collected. */
export type Parcel = {
  id: string;
  x: number;
  /** 100 at rest, falls with every hard landing while it is aboard. */
  integrity: number;
  state: "waiting" | "aboard" | "delivered";
};

export const PARCEL_POSITIONS = [820, 1840, 2960, 4180];

const GRAVITY = 1500;
/** Spring rate and damping of one wheel station. */
const SPRING = 46;
const DAMPING = 11;
export const REST = 26;
export const WHEEL_RADIUS = 15;
/** Moment of inertia about the chassis centre, in the same arbitrary units. */
const INERTIA = 2600;
const ENGINE = 620;
const AIR_TORQUE = 1500;
const MAX_SPEED = 330;

/** Wheel stations along the chassis, front last. */
export const WHEELS = [-46, 0, 46];

/**
 * Load at the cargo bay, in g, above which the parcels start to suffer.
 *
 * This is not a taste knob. Three struts at full travel can carry
 * `3 · SPRING · REST / GRAVITY` = 2.39 g, so anything past it is the hull
 * itself taking the hit — and measurement agrees: a careful run never once
 * crosses it, a flat-out run crosses it on the hard compressions.
 */
export const SHOCK_LIMIT = 2.4;
/** Integrity points lost per g-second above the limit. */
const SHOCK_RATE = 300;
/** Loud enough to be worth a line in the log. */
const NOTE_LOAD = 2.8;

export type Rover = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radians, canvas convention: positive is clockwise on screen. */
  angle: number;
  omega: number;
  /** Per wheel: 0 fully extended, 1 fully compressed. */
  compression: number[];
  contact: boolean[];
  /** Force through the struts as a multiple of gravity — 1 g standing still. */
  load: number;
};

/**
 * Templates for the telemetry log, so the simulation can write lines in the
 * reader's language without importing the dictionaries.
 */
export type LogCopy = {
  /** `{id}` */
  aboard: string;
  /** `{id}`, `{integrity}` */
  delivered: string;
  /** `{load}` */
  shock: string;
  recovery: string;
};

export type Mission = {
  rover: Rover;
  parcels: Parcel[];
  copy: LogCopy;
  /** Seconds since the run started, including penalties. */
  elapsed: number;
  penalty: number;
  banked: number;
  /** Elapsed at the last shock written to the log, so it is not spammed. */
  lastNoted: number;
  state: "running" | "complete";
  /** Newest first — the component renders the top few. */
  log: string[];
};

/* ---------------------------------------------------------------- terrain */

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Value noise with cosine interpolation — smooth enough to drive on. */
function noise(x: number, octave: number) {
  const i = Math.floor(x);
  const f = x - i;
  const a = hash(i + octave * 1013);
  const b = hash(i + 1 + octave * 1013);
  const t = (1 - Math.cos(f * Math.PI)) / 2;
  return a + (b - a) * t;
}

/**
 * Ground height at a world x, y down. Relief fades in over the first stretch
 * so the rover is never dropped onto a slope it did not choose.
 */
export function groundAt(x: number) {
  const ramp = Math.min(1, Math.max(0, (x - WORLD.start) / 620));
  // Four octaves, and the third is the one that matters. A rocker-bogie
  // deliberately averages away anything narrower than its wheelbase, so only
  // crests wider than 92 px are felt at all — and a crest launches the rover
  // when its radius falls under v²/g, about 70 px at full throttle. The 130 px
  // octave is sized to sit just inside that: airborne if you commit, planted
  // if you lift off.
  const relief =
    150 * (noise(x / 620, 1) - 0.5) +
    76 * (noise(x / 215, 2) - 0.5) +
    44 * (noise(x / 130, 3) - 0.5) +
    16 * (noise(x / 68, 4) - 0.5);
  return WORLD.datum - relief * ramp;
}

/** Surface angle, for seating objects and drawing tracks. */
export function slopeAt(x: number) {
  return Math.atan2(groundAt(x + 6) - groundAt(x - 6), 12);
}

/* -------------------------------------------------------------- mission */

export function createMission(copy: LogCopy): Mission {
  return {
    copy,
    rover: {
      x: WORLD.start,
      // Placed at the compression the springs settle to, so the run does not
      // open with a bounce nobody asked for.
      y: groundAt(WORLD.start) - WHEEL_RADIUS - REST + 11,
      vx: 0,
      vy: 0,
      angle: 0,
      omega: 0,
      compression: [0, 0, 0],
      contact: [false, false, false],
      load: 1,
    },
    parcels: PARCEL_POSITIONS.map((x, i) => ({
      id: `0x${(0x4a17 + i * 0x1d3).toString(16).toUpperCase()}`,
      x,
      integrity: 100,
      state: "waiting",
    })),
    elapsed: 0,
    penalty: 0,
    banked: 0,
    lastNoted: -10,
    state: "running",
    log: [],
  };
}

export type Input = {
  /** -1 reverse, 0 coast, 1 forward. Doubles as pitch control in the air. */
  drive: number;
  /** Consumed once: rights the rover at a time cost. */
  recover: boolean;
};

function note(mission: Mission, line: string) {
  mission.log.unshift(line);
  if (mission.log.length > 6) mission.log.pop();
}

/** Advances the world by one fixed step. Call at a fixed rate, not per frame. */
export function step(mission: Mission, dt: number, input: Input) {
  if (mission.state === "complete") return;

  const rover = mission.rover;
  mission.elapsed += dt;

  if (input.recover) {
    rover.angle = slopeAt(rover.x);
    rover.omega = 0;
    rover.vy = Math.min(rover.vy, 0);
    rover.y = groundAt(rover.x) - REST - WHEEL_RADIUS - 6;
    mission.penalty += 5;
    note(mission, mission.copy.recovery);
  }

  rover.vy += GRAVITY * dt;

  const cos = Math.cos(rover.angle);
  const sin = Math.sin(rover.angle);
  let grounded = 0;
  /** Total upward force through the struts this step — what the bay feels. */
  let support = 0;

  WHEELS.forEach((offset, index) => {
    // Station position in the world, with the chassis rotated under it.
    const ax = rover.x + offset * cos;
    const ay = rover.y + offset * sin;
    const ground = groundAt(ax);

    const extension = ground - ay - WHEEL_RADIUS;
    const compression = REST - extension;
    if (compression <= 0) {
      rover.compression[index] = 0;
      rover.contact[index] = false;
      return;
    }

    grounded++;
    rover.compression[index] = Math.min(1, compression / REST);
    rover.contact[index] = true;

    // Vertical velocity of this station, chassis rotation included. Positive is
    // downward, which is also the direction that compresses the strut — so the
    // damper pushes back up, and the two terms add.
    const stationVy = rover.vy + rover.omega * offset * cos;
    const force = SPRING * Math.min(compression, REST) + DAMPING * stationVy;
    // A strut can push the chassis up; it cannot pull it down through a wheel
    // that would simply lift off instead.
    if (force <= 0) return;

    support += force;
    rover.vy -= force * dt;
    // r × F with F pointing up: a bump under the nose pitches the nose up.
    rover.omega += (-(offset * cos) * force * dt) / INERTIA;
  });

  if (grounded > 0) {
    const traction = grounded / WHEELS.length;
    rover.vx += input.drive * ENGINE * traction * cos * dt;
    rover.vy += input.drive * ENGINE * traction * sin * dt;

    // Rolling resistance, plus enough grip that a slope is a challenge rather
    // than a slide.
    const drag = input.drive === 0 ? 1.6 : 0.5;
    rover.vx -= rover.vx * drag * traction * dt;
    // The chassis settles to the ground angle instead of spinning freely.
    const target = slopeAt(rover.x);
    rover.omega += (target - rover.angle) * 9 * traction * dt;
    rover.omega -= rover.omega * 3.2 * traction * dt;
  } else {
    // Airborne: the same key that drives also trims the attitude, which is
    // the only way to land a six-wheeler nose-up off a ridge.
    rover.omega += (input.drive * AIR_TORQUE * dt) / INERTIA;
  }

  rover.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, rover.vx));
  rover.x += rover.vx * dt;
  rover.y += rover.vy * dt;
  rover.angle += rover.omega * dt;

  // Hard floor: the springs can bottom out, the hull cannot pass through rock.
  const floor = groundAt(rover.x) - WHEEL_RADIUS - 4;
  if (rover.y > floor) {
    const impact = rover.vy;
    rover.y = floor;
    rover.vy = 0;
    // Bottoming out is the one shock the struts never got to absorb, so it
    // arrives at the bay whole.
    if (impact > 0) support += impact / dt;
  }

  rover.x = Math.max(WORLD.start - 60, Math.min(WORLD.length, rover.x));

  rover.load = support / GRAVITY;
  if (rover.load > SHOCK_LIMIT) damageCargo(mission, rover.load, dt);

  collect(mission);
  deliver(mission);
}

/**
 * Cargo does not care how fast the rover is going — it cares how hard the bay
 * is shoved. Damage is the g-seconds above the limit, so one violent landing
 * and a long stretch of hammering both count, and easing off before a crest is
 * the whole skill of the run.
 */
function damageCargo(mission: Mission, load: number, dt: number) {
  const loss = (load - SHOCK_LIMIT) * SHOCK_RATE * dt;

  let hit = false;
  for (const parcel of mission.parcels) {
    if (parcel.state !== "aboard") continue;
    parcel.integrity = Math.max(0, parcel.integrity - loss);
    hit = true;
  }
  if (!hit) return;

  // One line per knock, not one per step.
  if (load > NOTE_LOAD && mission.elapsed - mission.lastNoted > 1.2) {
    mission.lastNoted = mission.elapsed;
    note(mission, fill(mission.copy.shock, { load: load.toFixed(1) }));
  }
}

function collect(mission: Mission) {
  for (const parcel of mission.parcels) {
    if (parcel.state !== "waiting") continue;
    if (Math.abs(parcel.x - mission.rover.x) > 40) continue;
    if (Math.abs(groundAt(parcel.x) - mission.rover.y) > 90) continue;

    parcel.state = "aboard";
    note(mission, fill(mission.copy.aboard, { id: parcel.id }));
  }
}

function deliver(mission: Mission) {
  if (Math.abs(mission.rover.x - WORLD.depot) > 70) return;

  const aboard = mission.parcels.filter((p) => p.state === "aboard");
  for (const parcel of aboard) {
    parcel.state = "delivered";
    mission.banked += parcel.integrity;
    note(
      mission,
      fill(mission.copy.delivered, {
        id: parcel.id,
        integrity: Math.round(parcel.integrity),
      }),
    );
  }

  if (mission.parcels.every((p) => p.state === "delivered")) {
    mission.state = "complete";
  }
}

/** Delivered integrity, less a second per second. Floor of zero. */
export function score(mission: Mission) {
  const time = mission.elapsed + mission.penalty;
  return Math.max(0, Math.round(mission.banked - time));
}
