// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Dictionary } from "@/content/dictionaries";

type InstrumentProps = { dict: Dictionary };

/**
 * Instruments live inside the project they belong to — found by opening a
 * brief, not advertised in the nav. Loaded per slug and only in the browser,
 * so a project page never ships an instrument meant for another.
 *
 * The synthetic scene generator sits under two projects: LAÇİN, whose training
 * data was composed rather than filmed, and EGE ODBARS, whose own dual-pipeline
 * generator does the same job — so it is referenced under both. The delivery
 * run belongs to EGENODE, the Robolig robot that picks up parcels and carries
 * them to an address; EGE ODBARS is an off-road course vehicle.
 */
const DetectionChallenge = dynamic(
  () =>
    import("@/components/challenge/detection-challenge").then(
      (m) => m.DetectionChallenge,
    ),
  { ssr: false },
);
const LiveDetector = dynamic(
  () =>
    import("@/components/lab/detector/live-detector").then(
      (m) => m.LiveDetector,
    ),
  { ssr: false },
);
const VisualOdometry = dynamic(
  () =>
    import("@/components/odometry/visual-odometry").then(
      (m) => m.VisualOdometry,
    ),
  { ssr: false },
);
const SceneGenerator = dynamic(
  () =>
    import("@/components/lab/generator/scene-generator").then(
      (m) => m.SceneGenerator,
    ),
  { ssr: false },
);
const RoverSim = dynamic(
  () => import("@/components/sim/rover-sim").then((m) => m.RoverSim),
  { ssr: false },
);

const INSTRUMENTS: Record<string, ComponentType<InstrumentProps>[]> = {
  lacin: [DetectionChallenge, SceneGenerator],
  tuygun: [LiveDetector, VisualOdometry],
  egenode: [RoverSim],
  "ege-odbars": [SceneGenerator],
};

export function ProjectInstrument({
  slug,
  dict,
}: {
  slug: string;
  dict: Dictionary;
}) {
  const list = INSTRUMENTS[slug];
  if (!list) return null;
  return (
    <div className="space-y-16">
      {list.map((Instrument, i) => (
        <section key={i} className="border-t border-line pt-14">
          <Instrument dict={dict} />
        </section>
      ))}
    </div>
  );
}
