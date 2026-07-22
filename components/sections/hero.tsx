// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { motion, useTransform } from "framer-motion";
import { ScrollSequence, useSequenceProgress } from "@/components/sequence/scroll-sequence";
import { StatusDot } from "@/components/ui/marks";
import { profile, metrics } from "@/content/site";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

/**
 * Instrument rail. Reads out where the reader is in the descent and the two
 * numbers that matter most — both measured, neither invented.
 */
function Rail() {
  const progress = useSequenceProgress();
  const height = useTransform(progress, [0, 1], ["0%", "100%"]);
  const altitude = useTransform(progress, (p) => `${Math.round(420 - p * 400)} m`);

  return (
    <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-6 md:flex md:right-10">
      <div className="flex items-center gap-3">
        <motion.span className="font-mono text-[11px] tracking-[0.2em] text-dim">
          {altitude}
        </motion.span>
        <div className="relative h-40 w-px bg-line">
          <motion.div
            style={{ height }}
            className="absolute inset-x-0 top-0 bg-signal"
          />
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-2xl text-bone">{metrics[0].value}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          mAP@50
        </p>
      </div>
    </div>
  );
}

function HeroCopy({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const progress = useSequenceProgress();
  // The title clears out as the camera comes down, handing the frame to the scene.
  const opacity = useTransform(progress, [0, 0.45, 0.7], [1, 1, 0]);
  const y = useTransform(progress, [0, 0.7], [0, -60]);

  return (
    <div className="relative flex h-full flex-col justify-center px-5 md:px-10">
      <motion.div style={{ opacity, y }} className="mx-auto w-full max-w-[1400px]">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mb-6 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] text-dim"
          >
            <StatusDot live />
            {dict.hero.status}
          </motion.p>

          <h1 className="font-display text-[clamp(3.2rem,11vw,9rem)] font-extrabold leading-[0.86] tracking-[-0.02em] text-bone">
            {profile.nameLines.map((line, i) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="block"
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"
          >
            <span className="h-px w-12 bg-signal" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-bone">
              {profile.discipline[locale]}
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-bone/55"
          >
            {profile.university[locale]}
          </motion.p>
        </div>
      </motion.div>

      <motion.p
        style={{ opacity }}
        className="absolute bottom-10 left-5 font-mono text-[10px] uppercase tracking-[0.3em] text-dim md:left-10"
      >
        {dict.hero.scroll} ↓
      </motion.p>

      <Rail />
    </div>
  );
}

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <ScrollSequence id="aerial" span={3.5}>
      <HeroCopy locale={locale} dict={dict} />
    </ScrollSequence>
  );
}
