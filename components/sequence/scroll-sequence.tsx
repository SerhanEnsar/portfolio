// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import type { ReactNode } from "react";
import { sequences, type SequenceId } from "@/content/sequences";
import { PinnedScene } from "./pinned-scene";
import { FrameStage } from "./frame-stage";
import { LatticeStage } from "./lattice-stage";

export { useSequenceProgress } from "./pinned-scene";

type Props = {
  id: SequenceId;
  /** Scroll distance the scene occupies, in viewport heights. */
  span?: number;
  /** Content that rides on top of the scene. */
  children?: ReactNode;
  /** Darkens the scene so overlaid text stays legible. */
  scrim?: "heavy" | "light" | false;
  className?: string;
};

/**
 * A scene pinned to the viewport, advanced by scroll.
 *
 * Call sites name a scene and stay out of how it is produced: `content/
 * sequences.ts` decides whether it scrubs decoded frames or runs a live
 * shader, and the shared shell in `pinned-scene.tsx` is identical either way.
 */
export function ScrollSequence({ id, span = 3, children, scrim, className }: Props) {
  const shader = sequences[id].kind === "shader";
  const stage = shader ? <LatticeStage /> : <FrameStage id={id} />;

  return (
    <PinnedScene
      span={span}
      scrim={scrim ?? (shader ? "light" : "heavy")}
      className={className}
      stage={stage}
    >
      {children}
    </PinnedScene>
  );
}
