// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The course, the vehicle that drives itself down it, and what its camera
 * sees on the way.
 *
 * Geometry and rules only — the component owns the pixels. Everything here is
 * deterministic: the same run, replayed, puts the same cone in the same place,
 * jolts the camera the same way and hits the same barrier, which is the only
 * reason the identity switch counter means anything when compensation is
 * turned off and on again.
 *
 * The vehicle is a body, not a point. It has a width, it steers where the
 * answer to each station tells it to, and if that line runs through a cone or
 * a gate post it hits them — so a decision costs something visible rather than
 * a red dot in a list. Contact spends speed, adds damage and kicks the camera;
 * damage in turn makes the perception worse, which is where this demo started.
 *
 * The course is written for this page. It is shaped like the kind of task a
 * ground-vehicle competition sets — a slalom, a barrier, broken ground, a
 * sign, a gate, a ramp, a bay — but it is not a copy of any official course,
 * and the panel says so in its own copy.
 *
 * Coordinates: `x` across the track in metres, `y` up, `z` forward. The camera
 * sits on the chassis looking down the track.
 */

import type { Detection } from "@/lib/track";

export const CAM_HEIGHT = 1.35;
/**
 * Where the horizon sits in the frame. High enough that the ground — where
 * everything the vehicle has to decide about actually is — gets two thirds of
 * the picture, rather than an empty sky getting half.
 */
export const HORIZON = 0.34;
/** Nothing closer than this is drawn — it would be behind the lens. */
const NEAR = 1.2;
/** Half the driveable width, metres. */
export const LANE_HALF = 3.1;
/** How far ahead the camera sees; beyond it, props are not yet drawn. */
export const SIGHT = 78;
/** The run ends inside the parking bay, because that is where the task ends. */
export const COURSE_LENGTH = 402;

/** The chassis, in metres from the camera: it is this that touches things. */
export const VEHICLE = { halfWidth: 0.85, front: 1.1, rear: -1.4 };

export type PropKind = "cone" | "barrier" | "sign" | "gate" | "rock" | "ramp" | "bay";
/** What the vehicle can be in contact with — the ground included. */
export type ImpactKind = PropKind | "landing";

export type Prop = {
  id: number;
  /** Distance down the course, metres. */
  z: number;
  /** Offset from the track centreline, metres. */
  x: number;
  w: number;
  h: number;
  kind: PropKind;
};

export type Station = {
  id: "cones" | "barrier" | "rough" | "sign" | "gate" | "ramp" | "bay";
  /** Where the vehicle stops and asks. */
  z: number;
  options: number;
  correct: number;
  /** The class the perception layer is leaning on when it asks. */
  evidence: PropKind;
  confidence: number;
};

/**
 * Seven decisions, in the order the course presents them.
 *
 * `rough` is the one the whole demo is built around: it is where the visitor
 * chooses whether the tracker gets its motion compensation, and the counter
 * answers for itself over the next fifty metres.
 */
export const STATIONS: Station[] = [
  { id: "cones", z: 52, options: 2, correct: 0, evidence: "cone", confidence: 0.91 },
  { id: "barrier", z: 104, options: 3, correct: 1, evidence: "barrier", confidence: 0.87 },
  { id: "rough", z: 156, options: 2, correct: 0, evidence: "rock", confidence: 0.64 },
  { id: "sign", z: 218, options: 3, correct: 0, evidence: "sign", confidence: 0.88 },
  { id: "gate", z: 272, options: 2, correct: 0, evidence: "gate", confidence: 0.83 },
  { id: "ramp", z: 330, options: 2, correct: 0, evidence: "ramp", confidence: 0.79 },
  { id: "bay", z: 392, options: 2, correct: 0, evidence: "bay", confidence: 0.9 },
];

export const TARGET_SPEED = 11;

/** Where the broken ground starts and ends — the only place the camera fights. */
const ROUGH_FROM = 158;
const ROUGH_TO = 214;

/** The track wanders; a straight line would make the drive a screensaver. */
export function centreAt(z: number): number {
  return 2.6 * Math.sin(z / 41) + 1.1 * Math.sin(z / 17 + 1.7);
}

/** How hard the chassis is being thrown about at this point on the course. */
export function roughnessAt(z: number): number {
  if (z < ROUGH_FROM || z > ROUGH_TO) return 0.12;
  const into = (z - ROUGH_FROM) / (ROUGH_TO - ROUGH_FROM);
  // Ramps in and out so the section has edges rather than a switch.
  return 0.12 + 0.88 * Math.sin(Math.PI * Math.min(1, Math.max(0, into)));
}

/** Deterministic band-limited noise — a jolt profile, not white noise. */
function noise(t: number, seed: number): number {
  return (
    Math.sin(t * 7.3 + seed) * 0.55 +
    Math.sin(t * 17.1 + seed * 2.7) * 0.3 +
    Math.sin(t * 31.7 + seed * 5.1) * 0.15
  );
}

/** Stable pseudo-random in [0,1) from two integers — used for detector noise. */
function hash(a: number, b: number): number {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * The props on the course.
 *
 * Built once and never mutated: cones line the whole track so there is always
 * something to track, and each station gets the object it asks about.
 */
export const props: Prop[] = buildProps();

function buildProps(): Prop[] {
  const list: Prop[] = [];
  let id = 1;

  // Track edges — a cone every eight metres on both sides, except where the
  // barrier stands: the way past it is outside the cone line, and a course
  // that fenced in the only legal line would be punishing the right answer.
  for (let z = 20; z < COURSE_LENGTH; z += 8) {
    if (z > 96 && z < 132) continue;
    for (const side of [-1, 1] as const) {
      list.push({
        id: id++,
        z,
        x: centreAt(z) + side * (LANE_HALF - 0.35),
        w: 0.4,
        h: 0.6,
        kind: "cone",
      });
    }
  }

  const at = (z: number, x: number, w: number, h: number, kind: PropKind) => {
    list.push({ id: id++, z, x: centreAt(z) + x, w, h, kind });
  };

  // The slalom, set at ±1.35 m: the held line clears them by thirty
  // centimetres and the cut line goes straight through them. The margin is
  // deliberate — a demo where the right answer scrapes anyway teaches nothing.
  at(60, -1.35, 0.4, 0.6, "cone");
  at(66, 1.35, 0.4, 0.6, "cone");
  at(72, -1.35, 0.4, 0.6, "cone");

  at(112, 0.9, 2.6, 0.9, "barrier");

  // Broken ground: loose rock through the rough section. A rocker-bogie rides
  // over these — they shake the camera, they are not something to hit.
  for (let z = ROUGH_FROM + 4; z < ROUGH_TO; z += 9) {
    at(z, ((z * 7) % 5) / 2 - 1.2, 0.9, 0.35, "rock");
  }

  at(226, 2.2, 0.7, 0.7, "sign");
  at(280, -1.6, 0.3, 2.2, "gate");
  at(280, 1.6, 0.3, 2.2, "gate");
  at(340, 0, 5.0, 0.45, "ramp");
  at(400, 0, 2.6, 0.1, "bay");

  return list;
}

/**
 * What one answer makes the vehicle do until the next station.
 *
 * `lane` is where it puts itself relative to the centreline, and that single
 * number is what turns a decision into a consequence: the line either fits
 * between the cones or it does not.
 */
export type Manoeuvre = {
  lane: number;
  /**
   * Where the offset expires and the vehicle rejoins the centreline. Going
   * around a barrier is a detour, not a new lane — without this the swerve
   * would still be running forty metres later, out among the edge cones.
   */
  laneUntil: number;
  speedCap: number;
  /** Seconds held stationary before moving off. */
  hold: number;
  /** Seconds added to the run's penalty for choosing this. */
  penalty: number;
  /** Take the ramp without slowing, and leave the ground. */
  launch: boolean;
};

const CRUISE: Manoeuvre = {
  lane: 0,
  laneUntil: Infinity,
  speedCap: TARGET_SPEED,
  hold: 0,
  penalty: 0,
  launch: false,
};

const move = (m: Partial<Manoeuvre>): Manoeuvre => ({ ...CRUISE, ...m });

/**
 * One manoeuvre per answer, in the order the options are offered.
 *
 * Nothing here decides that an answer is wrong — the collision does. The
 * barrier's third option simply steers into the space the barrier occupies,
 * and the physics takes it from there.
 */
const MANOEUVRES: Record<Station["id"], Manoeuvre[]> = {
  // Hold the line, or cut across the slalom and take the cones with you.
  cones: [move({}), move({ lane: -1.5, laneUntil: 80 })],
  // Wait, go round, or drive at it.
  barrier: [
    move({ lane: -1.9, laneUntil: 126, hold: 3, penalty: 3 }),
    move({ lane: -1.9, laneUntil: 126 }),
    move({ lane: 1.2, laneUntil: 126 }),
  ],
  // The compensation switch. Nothing physical either way.
  rough: [move({}), move({})],
  // Stop, roll through, or ignore the sign entirely.
  sign: [move({ hold: 2 }), move({ speedCap: 4.5, penalty: 2 }), move({ penalty: 4 })],
  // Square up slowly, or thread it at speed and find the post.
  gate: [move({ speedCap: 4.5 }), move({ lane: 0.9, laneUntil: 292 })],
  // Take the ramp square and slow, or fly it.
  ramp: [move({ speedCap: 4.5 }), move({ launch: true })],
  // Stop in the bay, or drive past it.
  bay: [move({ speedCap: 5 }), move({})],
};

/** What contact with each class costs. Rock, ramp and bay are driven over. */
const CONTACT: Partial<Record<PropKind, { damage: number; force: number; slow: number }>> = {
  cone: { damage: 0.02, force: 1.0, slow: 0.06 },
  sign: { damage: 0.08, force: 2.0, slow: 0.28 },
  gate: { damage: 0.12, force: 2.6, slow: 0.4 },
  barrier: { damage: 0.14, force: 3.2, slow: 0.6 },
};

/** How far along the course a prop's own body reaches, metres. */
function depthOf(prop: Prop): number {
  return prop.kind === "barrier" ? 0.6 : Math.max(0.4, prop.w * 0.6);
}

export type Impact = { t: number; kind: ImpactKind; force: number; prop: number | null };

export type RunState = {
  /** Seconds since the run began. */
  t: number;
  z: number;
  /** Lateral position of the chassis. */
  x: number;
  speed: number;
  /** Camera angles, radians — this is what compensation has to undo. */
  yaw: number;
  pitch: number;
  roll: number;
  prevYaw: number;
  prevPitch: number;
  /** Height the chassis is carrying above its resting stance, metres. */
  lift: number;
  /** The manoeuvre currently being flown. */
  lane: number;
  laneUntil: number;
  speedCap: number;
  hold: number;
  launch: boolean;
  /** Seconds left in the air after a ramp taken at speed. */
  airborne: number;
  /** Spring state of the knock the chassis is still settling from. */
  shock: { yaw: number; pitch: number; roll: number; vy: number; vp: number; vr: number };
  /** Permanent camera misalignment left behind by damage. */
  bias: { yaw: number; pitch: number; roll: number };
  damage: number;
  hits: number;
  penalty: number;
  /** Prop id → the moment it was struck, so nothing is counted twice. */
  struck: Record<number, number>;
  /** The most recent contact, for the frame to react to. */
  impact: Impact | null;
  /** Index of the station being approached. */
  station: number;
  /** True while the vehicle is stopped waiting for a decision. */
  waiting: boolean;
  /** One entry per station: null until decided. */
  outcomes: (boolean | null)[];
  /** Whether the tracker is being handed a motion estimate. */
  compensate: boolean;
  done: boolean;
};

export function createRun(): RunState {
  return {
    t: 0,
    z: 0,
    x: centreAt(0),
    speed: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    prevYaw: 0,
    prevPitch: 0,
    lift: 0,
    lane: 0,
    laneUntil: Infinity,
    speedCap: TARGET_SPEED,
    hold: 0,
    launch: false,
    airborne: 0,
    shock: { yaw: 0, pitch: 0, roll: 0, vy: 0, vp: 0, vr: 0 },
    bias: { yaw: 0, pitch: 0, roll: 0 },
    damage: 0,
    hits: 0,
    penalty: 0,
    struck: {},
    impact: null,
    station: 0,
    waiting: false,
    outcomes: STATIONS.map(() => null),
    // Off to begin with, so the rough section has something to teach.
    compensate: false,
    done: false,
  };
}

/** Metres before a station where the vehicle comes to a stop. */
const STOP_BEFORE = 9;
/** Spring rate and damping of the chassis settling after a knock. */
const SHOCK_K = 150;
const SHOCK_C = 13;

/**
 * One tick of the run.
 *
 * The vehicle drives itself along the line its last answer chose: it holds
 * that offset, obeys the speed the answer implies, slows for the broken
 * ground, and stops short of the station it is approaching. The visitor's part
 * of the job is the decision, not the steering — but a decision is a line, and
 * a line either fits or it does not.
 */
export function step(state: RunState, dt: number): RunState {
  if (state.done) return state;

  const next: RunState = {
    ...state,
    t: state.t + dt,
    shock: { ...state.shock },
    bias: { ...state.bias },
  };
  const station = STATIONS[next.station];
  const stopAt = station ? station.z - STOP_BEFORE : COURSE_LENGTH;

  // Holding still at a sign or behind a barrier is time spent, and time spent
  // is the cheapest way for an answer to cost something.
  if (next.hold > 0) {
    next.hold = Math.max(0, next.hold - dt);
    next.speed = Math.max(0, next.speed - 16 * dt);
  } else if (next.waiting) {
    next.speed = Math.max(0, next.speed - 14 * dt);
  } else {
    const rough = roughnessAt(next.z);
    const limit = Math.min(next.speedCap, TARGET_SPEED) * (1 - 0.45 * rough);
    // Ease down as the stopping point comes up, so the halt is a stop and not
    // a wall.
    const room = Math.max(0, stopAt - next.z);
    const approach = Math.min(limit, Math.sqrt(Math.max(0, room) * 9));
    next.speed += (approach - next.speed) * Math.min(1, 3.2 * dt);
  }

  const wasZ = next.z;
  next.z += next.speed * dt;

  if (
    station &&
    next.z >= stopAt - 0.05 &&
    !next.waiting &&
    next.outcomes[next.station] === null
  ) {
    next.z = stopAt;
    next.waiting = true;
  }

  if (!station && next.z >= COURSE_LENGTH) {
    next.z = COURSE_LENGTH;
    next.done = true;
  }

  // Steering: hold the chosen offset from the centreline *here*, not twelve
  // metres ahead. Aiming down the road looks like driving and rides wide
  // through every curve, and a controller that drifts half a metre off line on
  // its own would clip cones the visitor never chose to clip.
  const lane = next.z > next.laneUntil ? 0 : next.lane;
  const aim = centreAt(next.z) + lane;
  const before = next.x;
  next.x += (aim - next.x) * Math.min(1, 3.4 * dt);
  const lateral = dt > 0 ? (next.x - before) / dt : 0;

  // A ramp taken at speed: the chassis leaves the ground and comes back down.
  const ramp = props.find((p) => p.kind === "ramp");
  if (
    ramp &&
    next.launch &&
    next.airborne <= 0 &&
    wasZ < ramp.z &&
    next.z >= ramp.z &&
    next.speed > 6
  ) {
    next.airborne = 0.55 + next.speed / 40;
    next.launch = false;
  }

  if (next.airborne > 0) {
    next.airborne = Math.max(0, next.airborne - dt);
    // A parabola in the air, and a landing worth feeling at the end of it.
    const phase = next.airborne;
    next.lift = Math.max(0, phase * (0.9 - phase * 0.45)) * 2.2;
    if (next.airborne === 0) {
      knock(next, "landing", 2.4 + next.speed / 8, null);
      next.damage = Math.min(1, next.damage + 0.08 * (0.6 + next.speed / TARGET_SPEED));
      next.bias.pitch += 0.004;
      next.hits += 1;
      next.lift = 0;
    }
  } else if (next.lift > 0) {
    next.lift = Math.max(0, next.lift - dt * 4);
  }

  contact(next);

  // The chassis settles from whatever last hit it: a damped spring, so a knock
  // rings out over about a second instead of snapping back to level.
  const s = next.shock;
  s.vy += (-SHOCK_K * s.yaw - SHOCK_C * s.vy) * dt;
  s.vp += (-SHOCK_K * s.pitch - SHOCK_C * s.vp) * dt;
  s.vr += (-SHOCK_K * 0.7 * s.roll - SHOCK_C * 0.8 * s.vr) * dt;
  s.yaw += s.vy * dt;
  s.pitch += s.vp * dt;
  s.roll += s.vr * dt;

  // The camera is bolted to a chassis crossing broken ground. Speed matters:
  // the same rock throws the frame further when it is hit faster. What the
  // lens shows is the sum of the terrain, the last knock, and whatever
  // alignment the damage has already cost.
  const rough = next.airborne > 0 ? 0 : roughnessAt(next.z);
  const energy = rough * (0.35 + next.speed / TARGET_SPEED);
  next.prevYaw = state.yaw;
  next.prevPitch = state.pitch;
  next.yaw = 0.022 * energy * noise(next.t, 1.7) + s.yaw + next.bias.yaw;
  next.pitch =
    0.03 * energy * noise(next.t * 1.31, 4.2) +
    s.pitch +
    next.bias.pitch -
    next.lift * 0.05;
  // Roll is the lean of the body: into the steering, plus the knock, plus what
  // the damage has bent. It is deliberately *not* handed to the compensation
  // stage — that stage estimates a translation, and a translation cannot undo
  // a rotation, which is the honest limit of the real thing.
  next.roll = lateral * 0.035 + s.roll + next.bias.roll;

  return next;
}

/** Kicks the chassis. Force is roughly the angular velocity it imparts. */
function knock(state: RunState, kind: ImpactKind, force: number, prop: number | null) {
  const side = hash(Math.round(state.z * 10), prop ?? 3) > 0.5 ? 1 : -1;
  state.shock.vy += force * 0.05 * side;
  state.shock.vp += force * 0.06;
  state.shock.vr += force * 0.07 * side;
  state.impact = { t: state.t, kind, force, prop };
}

/**
 * Contact between the chassis box and anything solid it overlaps.
 *
 * Each prop is only ever struck once: the vehicle grinds past it, and counting
 * every frame of that as a fresh impact would turn one mistake into forty.
 */
function contact(state: RunState) {
  const front = state.z + VEHICLE.front;
  const rear = state.z + VEHICLE.rear;

  for (const prop of props) {
    const cost = CONTACT[prop.kind];
    if (!cost || state.struck[prop.id] !== undefined) continue;
    if (prop.z > front + 2 || prop.z < rear - 2) continue;

    const half = depthOf(prop) / 2;
    if (prop.z + half < rear || prop.z - half > front) continue;
    if (Math.abs(state.x - prop.x) > VEHICLE.halfWidth + prop.w / 2) continue;

    // Speed decides how much of it is felt; a cone nudged at walking pace is
    // not the event a cone taken at eleven metres a second is.
    const bite = 0.35 + state.speed / TARGET_SPEED;
    state.struck = { ...state.struck, [prop.id]: state.t };
    state.hits += 1;
    state.damage = Math.min(1, state.damage + cost.damage * bite);
    state.speed = Math.max(0, state.speed * (1 - cost.slow * bite));
    // Damage leaves the camera pointing slightly wrong, for good. It is the
    // cost that outlives the moment: every frame after this is measured from a
    // mount that is no longer true.
    const lean = (hash(prop.id, 11) - 0.5) * cost.damage;
    state.bias.roll += lean * 0.5;
    state.bias.yaw += lean * 0.12;
    state.bias.pitch += (hash(prop.id, 23) - 0.5) * cost.damage * 0.08;
    knock(state, prop.kind, cost.force * bite, prop.id);
  }
}

/** Records a decision, sets the line the vehicle will take, and lets it go. */
export function resolve(state: RunState, choice: number): RunState {
  const station = STATIONS[state.station];
  if (!station || !state.waiting) return state;

  const outcomes = [...state.outcomes];
  outcomes[state.station] = choice === station.correct;

  const manoeuvre = MANOEUVRES[station.id][choice] ?? CRUISE;

  return {
    ...state,
    outcomes,
    waiting: false,
    station: state.station + 1,
    lane: manoeuvre.lane,
    laneUntil: manoeuvre.laneUntil,
    speedCap: manoeuvre.speedCap,
    hold: manoeuvre.hold,
    launch: manoeuvre.launch,
    penalty: state.penalty + manoeuvre.penalty,
    // The rough-ground question is the compensation switch itself: answering
    // it turns the stage on, and answering it wrong leaves it off.
    compensate:
      station.id === "rough" ? choice === station.correct : state.compensate,
  };
}

export type View = { w: number; h: number };

export type Projected = { x: number; y: number; scale: number };

/**
 * Focal length in pixels, from the frame width — about a 78° horizontal field,
 * which is the wide lens a vehicle this size actually carries. A longer lens
 * would put the whole course in a narrow band around the horizon and hide the
 * thing worth seeing: how much of the frame one jolt moves.
 */
function focal(view: View) {
  return view.w * 0.62;
}

/**
 * World point to frame point. Returns null for anything at or behind the lens.
 *
 * Yaw and pitch enter as a straight pixel offset, which is what makes them a
 * *global* image motion: every object in the frame moves by the same amount at
 * once, and that is precisely what a tracker cannot tell apart from everything
 * having moved on its own. Roll turns the frame about the horizon instead —
 * the lean of the body, and the tilt a damaged mount keeps.
 */
export function project(
  point: { x: number; y: number; z: number },
  state: RunState,
  view: View,
): Projected | null {
  const dz = point.z - state.z;
  if (dz <= NEAR) return null;
  const f = focal(view);
  const cx = view.w / 2;
  const cy = view.h * HORIZON;

  const px = cx + ((point.x - state.x) / dz) * f + state.yaw * f;
  const py = cy + ((CAM_HEIGHT + state.lift - point.y) / dz) * f + state.pitch * f;

  if (!state.roll) return { x: px, y: py, scale: f / dz };

  const sin = Math.sin(state.roll);
  const cos = Math.cos(state.roll);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
    scale: f / dz,
  };
}

/** Props the camera could see this frame, near ones last so they draw on top. */
export function inView(state: RunState): Prop[] {
  return props
    .filter((p) => p.z - state.z > NEAR && p.z - state.z < SIGHT)
    .sort((a, b) => b.z - a.z);
}

/**
 * How far the frame moved since the last tick, as the compensation stage would
 * estimate it.
 *
 * The real answer is known here because the scene is simulated; the estimate
 * is that answer with a little error on it, because a stage that reads the
 * motion off the image never gets it exactly and a demo that pretended
 * otherwise would be flattering itself.
 */
export function shiftEstimate(state: RunState, view: View): { x: number; y: number } {
  const f = focal(view);
  const dx = (state.yaw - state.prevYaw) * f;
  const dy = (state.pitch - state.prevPitch) * f;
  const error = 0.06;
  return {
    x: dx * (1 - error) + (hash(Math.round(state.t * 60), 3) - 0.5) * 0.8,
    y: dy * (1 - error) + (hash(Math.round(state.t * 60), 9) - 0.5) * 0.8,
  };
}

/** Detector range — past this a 40 cm cone is a few pixels and is not called. */
const DETECT_RANGE = 46;

/**
 * What the detector reports this frame.
 *
 * Boxes come from the projected geometry with jitter on them, and some frames
 * simply miss: recall falls with distance, falls again while the chassis is
 * being thrown about, and falls further as the vehicle takes damage — which is
 * how a bad decision at the barrier is still being paid for at the gate.
 */
export function detectionsFor(state: RunState, view: View): Detection[] {
  const frame = Math.round(state.t * 60);
  const shake = roughnessAt(state.z);
  const hurt = state.damage;
  const out: Detection[] = [];

  for (const prop of inView(state)) {
    const dz = prop.z - state.z;
    if (dz > DETECT_RANGE) continue;

    const base = project({ x: prop.x, y: 0, z: prop.z }, state, view);
    const top = project({ x: prop.x, y: prop.h, z: prop.z }, state, view);
    if (!base || !top) continue;

    const w = prop.w * base.scale;
    const h = Math.max(4, Math.abs(base.y - top.y));
    if (w < 3 || h < 3) continue;

    const miss = 0.02 + (dz / DETECT_RANGE) * 0.08 + shake * 0.12 + hurt * 0.25;
    if (hash(frame, prop.id) < miss) continue;

    const jitter = 1.0 + shake * 1.8 + hurt * 2.2;
    const jx = (hash(frame, prop.id * 7) - 0.5) * jitter;
    const jy = (hash(frame, prop.id * 13) - 0.5) * jitter;

    out.push({
      box: { x: base.x - w / 2 + jx, y: Math.min(base.y, top.y) + jy, w, h },
      score: Math.max(
        0.31,
        0.96 - (dz / DETECT_RANGE) * 0.4 - shake * 0.18 - hurt * 0.2,
      ),
      truth: prop.id,
      kind: prop.kind,
    });
  }

  return out;
}
