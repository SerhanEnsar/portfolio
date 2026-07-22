// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Makes `prefers-reduced-motion` actually reach the motion components.
 *
 * The global rule in `globals.css` collapses CSS animations and transitions,
 * but framer-motion drives transforms from JavaScript and never consults a
 * stylesheet — so every reveal, drawer and overlay in the site ignored the
 * preference entirely. `reducedMotion="user"` keeps opacity fades (which do
 * not induce motion sickness) and drops transform and layout animation.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
