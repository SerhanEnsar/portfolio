// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motionValue, useScroll, type MotionValue } from "framer-motion";

/**
 * The shell every scene shares: a tall section that supplies scroll distance,
 * a sticky viewport-sized stage, scrims, and the overlay slot.
 *
 * What fills the stage — a decoded frame sequence or a live shader — is the
 * only thing that differs between scenes, so it is passed in.
 */

export const SequenceProgress = createContext<MotionValue<number>>(motionValue(0));
export const SceneActive = createContext(false);

/** Scrub position of the enclosing scene, 0 → 1. */
export function useSequenceProgress() {
  return useContext(SequenceProgress);
}

/** True once the scene is close enough to be worth starting work for. */
export function useSceneActive() {
  return useContext(SceneActive);
}

type Props = {
  /** Scroll distance the scene occupies, in viewport heights. */
  span?: number;
  /**
   * How hard to darken the scene under the copy. Photoreal frames are busy
   * and need "heavy"; a dark shader field only needs enough to seat the text.
   */
  scrim?: "heavy" | "light" | false;
  className?: string;
  /** What fills the stage. Rendered inside the active/progress contexts. */
  stage: ReactNode;
  /** Content that rides on top of the stage. */
  children?: ReactNode;
};

export function PinnedScene({
  span = 3,
  scrim = "heavy",
  className = "",
  stage,
  children,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Wake the scene about a viewport and a half out, so frames have time to
  // arrive and shaders have time to compile before anyone looks.
  useEffect(() => {
    const node = sectionRef.current;
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
      ref={sectionRef}
      style={{ height: `${span * 100}vh` }}
      className={`relative ${className}`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <SequenceProgress.Provider value={scrollYProgress}>
          <SceneActive.Provider value={active}>
            {stage}

            {/* Two scrims, not one. The vertical pass seats the scene into the
                page; the left-weighted pass guarantees the copy column keeps
                its contrast whatever the stage underneath is doing. */}
            {scrim && (
              <>
                <div
                  aria-hidden="true"
                  className={
                    scrim === "heavy"
                      ? "absolute inset-0 bg-gradient-to-b from-void/75 via-void/40 to-void"
                      : "absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void/70"
                  }
                />
                <div
                  aria-hidden="true"
                  className={
                    scrim === "heavy"
                      ? "absolute inset-0 bg-gradient-to-r from-void/85 via-void/30 to-transparent"
                      : "absolute inset-0 bg-gradient-to-r from-void/80 via-void/10 to-transparent"
                  }
                />
              </>
            )}

            {children && <div className="absolute inset-0">{children}</div>}
          </SceneActive.Provider>
        </SequenceProgress.Provider>
      </div>
    </section>
  );
}
