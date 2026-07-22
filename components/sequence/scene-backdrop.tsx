// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useScroll } from "framer-motion";
import type { SequenceId } from "@/content/sequences";
import { FrameStage } from "./frame-stage";
import { SceneActive, SequenceProgress } from "./pinned-scene";

/**
 * A scene that sits *behind* an ordinary content section rather than pinning
 * the viewport to it. The frames scrub against the section's own scroll, so a
 * block of text that would otherwise be flat dark gains slow ambient motion
 * without turning into a full scroll-stop or shifting a single line of copy.
 *
 * The backdrop reuses the same {@link FrameStage} as the pinned scenes — it
 * only supplies the progress and active contexts that stage reads from, and
 * scrims itself far harder, because here legibility of the copy wins over the
 * image every time.
 */
export function SceneBackdrop({
  id,
  anchor,
  objective,
  children,
  className = "",
}: {
  /** Which scene to run behind the content. */
  id: SequenceId;
  /** Optional `id` for the underlying section, for in-page anchors. */
  anchor?: string;
  /** Optional `data-objective` marker, for the progress HUD. */
  objective?: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  // Runs the full frame range across the span where the section is on screen,
  // from its top meeting the bottom of the viewport to its bottom leaving it.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={anchor}
      data-objective={objective}
      className={`relative isolate ${className}`}
    >
      <SequenceProgress.Provider value={scrollYProgress}>
        <SceneActive.Provider value={active}>
          {/* Absolute wrapper is as tall as the section, so the sticky stage
              inside it stays pinned to the viewport for the whole section
              instead of only its first screen. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="sticky top-0 h-screen w-full overflow-hidden">
              <FrameStage id={id} />
              {/* Heavier than a pinned scene's scrim: the picture is only ever
                  atmosphere here, and the words on top must always read. */}
              <div className="absolute inset-0 bg-void/82" />
              <div className="absolute inset-0 bg-gradient-to-b from-void via-void/70 to-void" />
            </div>
          </div>
          {children}
        </SceneActive.Provider>
      </SequenceProgress.Provider>
    </section>
  );
}
