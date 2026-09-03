// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Multi-object tracking, and the thing that breaks it: the camera moving.
 *
 * A tracker keeps an identity on a thing across frames by matching this
 * frame's boxes to last frame's tracks. Matching is done in the image, so it
 * quietly assumes the image holds still — and on a rocker-bogie chassis
 * crossing broken ground it does not. One hard jolt moves every box at once,
 * the overlap that association depends on collapses, and the tracker concludes
 * it is looking at new objects. The identities scatter.
 *
 * Global motion compensation is the fix ODBARS ships: estimate how the whole
 * frame moved, shift the tracks by it, and match afterwards. This module keeps
 * both paths so the difference can be watched rather than asserted — pass a
 * shift to compensate, pass `null` to run without.
 *
 * `truth` is carried on both detections and tracks only because the scene is
 * simulated and therefore known. It never steers the matching; it exists so an
 * identity switch can be *counted* instead of estimated.
 */

import { iou, type Box } from "@/lib/iou";

export type Detection = {
  box: Box;
  score: number;
  /** Which prop this came from — ground truth, for scoring only. */
  truth: number;
  kind: string;
};

export type Track = {
  id: number;
  box: Box;
  kind: string;
  /** Per-frame box velocity, smoothed — this track's own motion model. */
  vx: number;
  vy: number;
  vw: number;
  vh: number;
  /** Frames since it was last matched. */
  misses: number;
  /** Frames it has survived. */
  age: number;
  truth: number;
};

export type Tracker = {
  tracks: Track[];
  nextId: number;
  frame: number;
  /** Times a known object came back under a different id. */
  switches: number;
  /**
   * The id each object last wore, and when. The frame matters: an object that
   * drove out of range and came back a second later is a re-identification
   * problem, not an association failure, and counting it would drown the
   * number this demo is actually about.
   */
  seen: Record<number, { id: number; frame: number }>;
};

/** Overlap below which two boxes are not the same thing. */
export const MATCH_IOU = 0.3;
/** Frames a track survives unmatched before it is dropped. */
const MAX_MISSES = 6;
/** How much of the new frame-to-frame delta the velocity estimate takes. */
const VELOCITY_GAIN = 0.55;
/** A fresh id after a gap longer than this is not counted as a switch. */
const SWITCH_GAP = 12;

export function createTracker(): Tracker {
  return { tracks: [], nextId: 1, frame: 0, switches: 0, seen: {} };
}

/**
 * Where a track expects to be this frame: its own motion carried forward, then
 * the global shift on top if the compensation stage supplied one.
 *
 * The motion model matters as much as the compensation. A cone eight metres
 * ahead grows and slides across the frame quickly; matched against where it
 * was last frame rather than where it was going, it would be lost on a still
 * camera too, and the demo would blame the terrain for the tracker's own gap.
 */
function predict(track: Track, shift: { x: number; y: number } | null): Box {
  const dx = track.vx + (shift?.x ?? 0);
  const dy = track.vy + (shift?.y ?? 0);
  return {
    x: track.box.x + dx,
    y: track.box.y + dy,
    w: Math.max(2, track.box.w + track.vw),
    h: Math.max(2, track.box.h + track.vh),
  };
}

/**
 * One frame.
 *
 * `shift` is the estimated global image motion since the last frame — the
 * output of the compensation stage. `null` means the stage is off, and the
 * tracker matches this frame's boxes against where things were *before* the
 * camera moved, which is the failure this demo is about.
 *
 * Association is greedy on IoU rather than Hungarian: with a handful of
 * targets on screen the two agree, and greedy is readable.
 */
export function update(
  state: Tracker,
  detections: Detection[],
  shift: { x: number; y: number } | null,
): Tracker {
  const frame = state.frame + 1;
  const predicted = state.tracks.map((t) => ({ ...t, box: predict(t, shift) }));

  const pairs: { track: number; det: number; score: number }[] = [];
  predicted.forEach((track, ti) => {
    detections.forEach((det, di) => {
      if (track.kind !== det.kind) return;
      const overlap = iou(track.box, det.box);
      if (overlap >= MATCH_IOU) pairs.push({ track: ti, det: di, score: overlap });
    });
  });
  pairs.sort((a, b) => b.score - a.score);

  const takenTracks = new Set<number>();
  const takenDets = new Set<number>();
  const matched = new Map<number, number>();
  for (const pair of pairs) {
    if (takenTracks.has(pair.track) || takenDets.has(pair.det)) continue;
    takenTracks.add(pair.track);
    takenDets.add(pair.det);
    matched.set(pair.track, pair.det);
  }

  const tracks: Track[] = [];
  const seen = { ...state.seen };
  let nextId = state.nextId;
  let switches = state.switches;

  predicted.forEach((track, ti) => {
    const di = matched.get(ti);
    if (di === undefined) {
      // Unmatched: kept alive briefly, because a detector that misses one
      // frame has not made the object disappear.
      if (track.misses + 1 <= MAX_MISSES) {
        tracks.push({ ...track, misses: track.misses + 1, age: track.age + 1 });
      }
      return;
    }
    const det = detections[di];
    const previous = state.tracks[ti].box;
    // Velocity is measured against where the track actually was, not against
    // the prediction, or the estimate would chase its own tail — and with the
    // camera's own motion taken back out, so what is left is the object's
    // motion in the world. Leaving the jolt in would teach every track to
    // expect the last bump to happen again.
    const blend = (was: number, delta: number) =>
      was * (1 - VELOCITY_GAIN) + delta * VELOCITY_GAIN;
    tracks.push({
      ...track,
      box: det.box,
      vx: blend(track.vx, det.box.x - previous.x - (shift?.x ?? 0)),
      vy: blend(track.vy, det.box.y - previous.y - (shift?.y ?? 0)),
      vw: blend(track.vw, det.box.w - previous.w),
      vh: blend(track.vh, det.box.h - previous.h),
      truth: det.truth,
      misses: 0,
      age: track.age + 1,
    });
    seen[det.truth] = { id: track.id, frame };
  });

  detections.forEach((det, di) => {
    if (takenDets.has(di)) return;
    const id = nextId++;
    // An object that was just here, arriving under a fresh id, is exactly an
    // identity switch — the association failed while it was still in view.
    const last = seen[det.truth];
    if (last && last.id !== id && frame - last.frame <= SWITCH_GAP) switches += 1;
    seen[det.truth] = { id, frame };
    tracks.push({
      id,
      box: det.box,
      kind: det.kind,
      truth: det.truth,
      vx: 0,
      vy: 0,
      vw: 0,
      vh: 0,
      misses: 0,
      age: 1,
    });
  });

  return { tracks, nextId, frame, switches, seen };
}
