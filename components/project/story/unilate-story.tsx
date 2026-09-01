// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { motion } from "framer-motion";
import { StoryStage } from "./story-stage";
import { beats } from "@/lib/story";
import { COURSE, derive, marksAfter, type Mark } from "@/lib/attendance";
import { fill } from "@/lib/fill";
import type { Dictionary } from "@/content/dictionaries";

const IDS = ["schedule", "derive", "miss", "accumulate", "edge", "over"];
const STORY = beats(IDS);

/** How far the term has been taught at each beat. */
const WEEKS_AT: Record<string, number> = {
  schedule: 0,
  derive: 2,
  miss: 4,
  accumulate: 10,
  edge: 12,
  over: 13,
};

function Week({ mark, n }: { mark: Mark; n: number }) {
  const tone =
    mark === "absent"
      ? "border-alert text-alert"
      : mark === "present"
        ? "border-line text-bone"
        : "border-line/50 text-dim/40";
  return (
    <motion.span
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex aspect-square items-center justify-center border font-mono text-[10px] ${tone}`}
    >
      {mark === "absent" ? "×" : mark === "present" ? "•" : n}
    </motion.span>
  );
}

export function UnilateStory({ dict }: { dict: Dictionary }) {
  const copy = dict.stories.unilate;

  const visual = (i: number) => {
    const id = IDS[i];
    const taught = WEEKS_AT[id];
    const marks = marksAfter(COURSE, taught);
    const d = derive(COURSE, marks);

    const barTone =
      d.state === "failed" ? "bg-alert" : d.state === "warning" ? "bg-signal" : "bg-ice";

    return (
      <div className="flex h-full flex-col justify-center gap-4 p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-bone">
            {COURSE.code}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
            {fill(copy.meta, {
              weeks: String(COURSE.weeks),
              hours: String(COURSE.hoursPerWeek),
              limit: String(Math.round(COURSE.limitRatio * 100)),
            })}
          </p>
        </div>

        {/* The schedule is the only thing stored; every mark below it is a
            week that has actually been taught. */}
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${COURSE.weeks}, minmax(0, 1fr))` }}
        >
          {marks.map((m, k) => (
            <Week key={k} mark={m} n={k + 1} />
          ))}
        </div>

        {/* Everything from here down is derived, never stored. */}
        <div className="space-y-2">
          <div className="relative h-1.5 w-full bg-line">
            <motion.span
              className={`absolute inset-y-0 left-0 ${barTone}`}
              initial={false}
              animate={{ width: `${d.consumed * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                {copy.missed}
              </span>
              <span className="font-mono text-xs text-bone">
                {d.missedHours} / {d.limitHours.toFixed(1)}
              </span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                {copy.remaining}
              </span>
              <span
                className={`font-mono text-xs ${
                  d.state === "failed" ? "text-alert" : "text-signal"
                }`}
              >
                {d.remainingHours.toFixed(1)}
              </span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                {copy.state}
              </span>
              <span
                className={`font-mono text-xs uppercase tracking-[0.14em] ${
                  d.state === "failed"
                    ? "text-alert"
                    : d.state === "warning"
                      ? "text-signal"
                      : "text-ice"
                }`}
              >
                {copy.states[d.state]}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <StoryStage
      token="story:unilate"
      eyebrow={copy.eyebrow}
      title={copy.title}
      beats={STORY}
      captions={copy.beats}
      dict={dict}
    >
      {visual}
    </StoryStage>
  );
}
