// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Dictionary } from "@/content/dictionaries";

/**
 * A short systems check before the page resolves. Once per session, under a
 * second, and interruptible — a boot screen that cannot be skipped is a toll
 * booth, not an effect.
 */

const SESSION_KEY = "seb.booted";
const STEP_MS = 190;

/**
 * Whether to boot depends on sessionStorage and a media query, neither of which
 * exists on the server. `useSyncExternalStore` is how React wants client-only
 * state read: the server snapshot renders nothing, and the client swaps in
 * after hydration with no mismatch and no setState-in-effect.
 */
let decision: boolean | null = null;
const listeners = new Set<() => void>();

function shouldBoot() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return false;
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private mode: run the boot, just don't remember it.
  }
  return true;
}

const bootStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  // Memoised: this must return a stable value or React re-renders forever.
  getSnapshot() {
    if (decision === null) decision = shouldBoot();
    return decision;
  },
  getServerSnapshot() {
    return false;
  },
  dismiss() {
    if (decision === false) return;
    decision = false;
    for (const listener of listeners) listener();
  },
};

export function BootSequence({ dict }: { dict: Dictionary }) {
  const active = useSyncExternalStore(
    bootStore.subscribe,
    bootStore.getSnapshot,
    bootStore.getServerSnapshot,
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;

    const dismiss = () => bootStore.dismiss();
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);

    const total = dict.boot.lines.length;
    const timers = dict.boot.lines.map((_, i) =>
      window.setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)),
    );
    const done = window.setTimeout(dismiss, STEP_MS * total + 380);

    // The page underneath must not scroll while the overlay is up.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      timers.forEach(clearTimeout);
      clearTimeout(done);
      document.body.style.overflow = previous;
    };
  }, [active, dict.boot.lines]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="boot"
          // Decorative and transient: a screen reader should get the page, not this.
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col justify-center bg-void px-6 md:px-16"
        >
          <div className="deadpixels pointer-events-none absolute inset-0 opacity-[0.18]" />

          <ul className="relative space-y-2 font-mono text-xs uppercase tracking-[0.22em] md:text-sm">
            {dict.boot.lines.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0 }}
                animate={{ opacity: i < step ? 1 : 0 }}
                transition={{ duration: 0.12 }}
                className="flex items-center gap-4 text-dim"
              >
                <span className="h-px w-6 bg-signal" />
                {line}
                <span className="text-lock">{dict.boot.ok}</span>
              </motion.li>
            ))}
          </ul>

          <p className="relative mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-dim/50">
            {dict.boot.skip}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
