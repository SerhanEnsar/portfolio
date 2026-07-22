// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The pointer becomes a tracking reticle: it drifts toward the cursor, and
 * locks onto interactive elements with a bracket sized to their bounds.
 *
 * Positions are written straight to style — a component that re-rendered on
 * every mouse move would be the single jankiest thing on the page.
 */

const LOCKABLE = "a, button, [role='button'], input, summary, [data-reticle]";

/** How fast the reticle closes the gap to the cursor, per frame. */
const EASE = 0.22;

export function Reticle() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Pointer devices only, and never against the visitor's motion preference.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setEnabled(fine.matches && !still.matches);
    update();
    fine.addEventListener("change", update);
    still.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      still.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const box = boxRef.current;
    if (!dot || !box) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let locked: Element | null = null;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;

      const under = document.elementFromPoint(event.clientX, event.clientY);
      const next = under?.closest(LOCKABLE) ?? null;
      if (next !== locked) {
        locked = next;
        if (locked) {
          const rect = locked.getBoundingClientRect();
          box.style.opacity = "1";
          box.style.transform = `translate3d(${rect.left - 6}px, ${rect.top - 6}px, 0)`;
          box.style.width = `${rect.width + 12}px`;
          box.style.height = `${rect.height + 12}px`;
        } else {
          box.style.opacity = "0";
        }
      }
    };

    // A locked element can move out from under the reticle while scrolling.
    const onScroll = () => {
      if (!locked) return;
      const rect = locked.getBoundingClientRect();
      box.style.transform = `translate3d(${rect.left - 6}px, ${rect.top - 6}px, 0)`;
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      box.style.opacity = "0";
    };
    const onEnter = () => {
      dot.style.opacity = "1";
    };

    const tick = () => {
      x += (targetX - x) * EASE;
      y += (targetY - y) * EASE;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60]">
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-signal opacity-0 transition-opacity duration-200"
      />
      {/* Corner brackets, drawn as four borders on one box. */}
      <div
        ref={boxRef}
        className="absolute left-0 top-0 opacity-0 transition-opacity duration-200"
      >
        {[
          "left-0 top-0 border-l border-t",
          "right-0 top-0 border-r border-t",
          "left-0 bottom-0 border-l border-b",
          "right-0 bottom-0 border-r border-b",
        ].map((corner) => (
          <span key={corner} className={`absolute h-2.5 w-2.5 border-signal ${corner}`} />
        ))}
      </div>
    </div>
  );
}
