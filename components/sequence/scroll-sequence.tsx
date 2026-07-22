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
import {
  useMotionValueEvent,
  useScroll,
  motionValue,
  type MotionValue,
} from "framer-motion";
import { posterPath, sequences, type SequenceId } from "@/content/sequences";
import { useFrameSequence } from "./use-frame-sequence";

/**
 * Scrub position of the enclosing scene, 0 → 1. Overlaid content reads this
 * to move with the shot instead of running its own scroll listener.
 */
const SequenceProgress = createContext<MotionValue<number>>(motionValue(0));

export function useSequenceProgress() {
  return useContext(SequenceProgress);
}

type Props = {
  id: SequenceId;
  /** Scroll distance the scene occupies, in viewport heights. */
  span?: number;
  /** Content that rides on top of the pinned canvas. */
  children?: ReactNode;
  /** Darkens the scene so overlaid text stays legible. */
  scrim?: boolean;
  className?: string;
};

/** Never render more backing pixels than a 2× display can show. */
const MAX_DPR = 2;

/**
 * A scene pinned to the viewport whose frames advance with scroll position.
 *
 * The tall outer section supplies the scroll distance; the sticky inner
 * element is what the reader actually sees. Frames are drawn to a canvas
 * rather than swapped as <img> so there is no decode on the critical path
 * and no flash between frames.
 */
export function ScrollSequence({
  id,
  span = 3,
  children,
  scrim = true,
  className = "",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const { frames, total, ready } = useFrameSequence(id, active);

  const framesRef = useRef(frames);
  framesRef.current = frames;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Start fetching once the scene is within about a viewport and a half.
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

  // Canvas backing store follows the element box and the display density.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(lastFrame.current);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [ready]);

  const lastFrame = useRef(0);
  const pending = useRef<number | null>(null);

  function draw(index: number) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    // Walk backwards to the nearest frame that has arrived, so scrubbing
    // through a partly-loaded scene holds instead of flickering to blank.
    let source = null;
    for (let i = index; i >= 0; i--) {
      const candidate = framesRef.current[i];
      if (candidate) {
        source = candidate;
        break;
      }
    }
    if (!source) return;

    const sw = "width" in source ? source.width : 0;
    const sh = "height" in source ? source.height : 0;
    if (!sw || !sh) return;

    // Cover fit — the scene always fills the viewport, never letterboxes.
    const scale = Math.max(canvas.width / sw, canvas.height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    ctx.drawImage(source, (canvas.width - dw) / 2, (canvas.height - dh) / 2, dw, dh);
  }

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const index = Math.min(total - 1, Math.max(0, Math.round(progress * (total - 1))));
    if (index === lastFrame.current) return;
    lastFrame.current = index;

    // One draw per animation frame, no matter how fast the wheel spins.
    if (pending.current !== null) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = null;
      draw(lastFrame.current);
    });
  });

  useEffect(() => {
    if (ready) draw(lastFrame.current);
  }, [ready, frames]);

  useEffect(
    () => () => {
      if (pending.current !== null) cancelAnimationFrame(pending.current);
    },
    [],
  );

  const spec = sequences[id];
  const showPoster = !ready;

  return (
    <section
      ref={sectionRef}
      style={{ height: `${span * 100}vh` }}
      className={`relative ${className}`}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Poster carries the scene until frames are drawable, and stays
            permanently for reduced-motion and data-saver visitors. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={posterPath(id)}
          alt={spec.posterAlt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            showPoster ? "opacity-100" : "opacity-0"
          }`}
        />

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${
            showPoster ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Two scrims, not one. The vertical pass seats the scene into the
            page; the left-weighted pass guarantees the copy column keeps its
            contrast whatever the frame underneath happens to be doing. */}
        {scrim && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-void/75 via-void/40 to-void"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/30 to-transparent"
            />
          </>
        )}

        {children && (
          <SequenceProgress.Provider value={scrollYProgress}>
            <div className="absolute inset-0">{children}</div>
          </SequenceProgress.Provider>
        )}
      </div>
    </section>
  );
}
