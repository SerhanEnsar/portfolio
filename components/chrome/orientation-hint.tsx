// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import type { Dictionary } from "@/content/dictionaries";

const DISMISSED_KEY = "orientation-hint-dismissed";

/**
 * The scenes are shot 16:9. On a portrait phone a cover-fit crops most of that
 * width away, so a touch visitor holding the phone upright is offered — once —
 * the chance to turn it sideways and see the whole frame. It never shows on a
 * desktop pointer, never in landscape, and not again once dismissed.
 *
 * It waits until the reader is past the first screen so it reads as a note
 * about the scenes they are scrolling through, not a modal on arrival.
 */
export function OrientationHint({ dict }: { dict: Dictionary }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;
    // Touch only, and pointless where the frames are never downloaded.
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const portrait = window.matchMedia("(orientation: portrait)");

    const update = () => {
      setShow(portrait.matches && window.scrollY > window.innerHeight * 0.6);
    };

    // Rotating to landscape answers the hint — retire it for the session.
    const onOrientation = () => {
      if (!portrait.matches) dismiss();
      else update();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    portrait.addEventListener("change", onOrientation);
    return () => {
      window.removeEventListener("scroll", update);
      portrait.removeEventListener("change", onOrientation);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try {
      sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private mode without storage — the hint simply reappears next visit.
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="orientation-hint"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-5 md:hidden"
        >
          <div className="flex items-center gap-3 border border-line bg-void/90 px-3.5 py-2.5 backdrop-blur-md">
            <motion.span
              animate={{ rotate: [0, -90, -90, 0] }}
              transition={{ duration: 2.4, times: [0, 0.3, 0.7, 1], repeat: Infinity, repeatDelay: 1.2 }}
              className="shrink-0 text-signal"
              aria-hidden="true"
            >
              <RotateCcw size={15} />
            </motion.span>
            <p className="font-mono text-[10px] uppercase leading-tight tracking-[0.14em] text-bone">
              {dict.a11y.rotate}
            </p>
            <button
              type="button"
              onClick={dismiss}
              aria-label={dict.a11y.dismiss}
              className="shrink-0 text-dim transition-colors hover:text-signal"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
