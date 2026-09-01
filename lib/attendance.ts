// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The rule UniLate is built around, reduced to arithmetic.
 *
 * The app stores no `Session` table. A term is a schedule plus a set of marks,
 * and every session — and therefore every absence total — is *derived* from
 * those two on each change. That is the decision the story dramatises, so the
 * derivation lives here as a pure function, DOM-free and testable in isolation.
 */

export type Mark = "present" | "absent" | "pending";

export type Course = {
  code: string;
  /** Teaching weeks in the term. */
  weeks: number;
  /** Contact hours per week — a 3-hour course burns 3 hours per missed week. */
  hoursPerWeek: number;
  /** Share of total hours a student may miss before failing on attendance. */
  limitRatio: number;
};

/** A mid-size undergraduate course: 14 weeks, 3 hours, the usual 30% ceiling. */
export const COURSE: Course = {
  code: "BLM303",
  weeks: 14,
  hoursPerWeek: 3,
  limitRatio: 0.3,
};

export type Derived = {
  /** Hours the term is worth in total. */
  totalHours: number;
  /** Hours that may be missed before the course is lost. */
  limitHours: number;
  /** Hours missed so far. */
  missedHours: number;
  /** Hours still available to miss; negative once the limit is breached. */
  remainingHours: number;
  /** 0–1 of the budget consumed, clamped for display. */
  consumed: number;
  state: "safe" | "warning" | "failed";
};

/**
 * Recomputes the whole term from the marks. There is no incremental update —
 * the dataset is one term wide, so a full pass is cheap and cannot drift out
 * of sync with the marks the way a running total would.
 */
export function derive(course: Course, marks: Mark[]): Derived {
  const totalHours = course.weeks * course.hoursPerWeek;
  const limitHours = totalHours * course.limitRatio;
  const missedHours =
    marks.filter((m) => m === "absent").length * course.hoursPerWeek;
  const remainingHours = limitHours - missedHours;

  return {
    totalHours,
    limitHours,
    missedHours,
    remainingHours,
    consumed: Math.min(1, limitHours === 0 ? 1 : missedHours / limitHours),
    state:
      remainingHours < 0
        ? "failed"
        : remainingHours < course.hoursPerWeek
          ? "warning"
          : "safe",
  };
}

/**
 * The term the story walks through, chosen so the arc has a shape: a clean
 * start, absences that accumulate quietly, then a week where the budget runs
 * out. Index is the week number minus one.
 */
export const STORY_ABSENT_WEEKS = [3, 6, 10, 12, 13];

/** Marks as they stand once `upTo` weeks have been taught. */
export function marksAfter(course: Course, upTo: number): Mark[] {
  return Array.from({ length: course.weeks }, (_, i) => {
    if (i >= upTo) return "pending";
    return STORY_ABSENT_WEEKS.includes(i + 1) ? "absent" : "present";
  });
}
