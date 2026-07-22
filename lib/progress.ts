// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useSyncExternalStore } from "react";
import { allObjectives } from "./objectives";

/**
 * Tracks what the visitor has actually reached, so the mission HUD can show
 * real progress rather than a decorative percentage.
 *
 * Objectives are plain string tokens recorded from wherever the thing happens:
 * a section scrolling into view, a project brief opening, an instrument being
 * used. State lives in localStorage and survives reloads; nothing is sent
 * anywhere.
 */

const STORAGE_KEY = "seb.progress.v1";

let seen: Set<string> | null = null;
const listeners = new Set<() => void>();

function load(): Set<string> {
  if (seen) return seen;
  if (typeof window === "undefined") return new Set();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    // Anything can be in localStorage — a hand-edited value or a stale shape
    // must degrade to "nothing seen yet", never throw during render.
    seen = new Set(Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : []);
  } catch {
    seen = new Set();
  }
  return seen;
}

function emit() {
  snapshot = null;
  for (const listener of listeners) listener();
}

/** Marks an objective reached. Repeat calls for the same token are free. */
export function record(objective: string) {
  const current = load();
  if (current.has(objective)) return;
  current.add(objective);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch {
    // Private mode or a full quota — progress just stops persisting.
  }
  emit();
}

export function reset() {
  seen = new Set();
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; the in-memory set is already cleared.
  }
  emit();
}

export type ProgressSnapshot = {
  seen: ReadonlySet<string>;
  done: number;
  total: number;
  complete: boolean;
};

let snapshot: ProgressSnapshot | null = null;

const EMPTY: ProgressSnapshot = {
  seen: new Set(),
  done: 0,
  total: allObjectives().length,
  complete: false,
};

function getSnapshot(): ProgressSnapshot {
  // useSyncExternalStore compares by identity, so the same object has to come
  // back until something actually changes.
  if (snapshot) return snapshot;
  const current = load();
  const total = allObjectives().length;
  const done = allObjectives().filter((o) => current.has(o)).length;
  snapshot = { seen: current, done, total, complete: done >= total };
  return snapshot;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): ProgressSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
