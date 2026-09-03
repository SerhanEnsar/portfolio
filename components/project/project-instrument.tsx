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
 * Each project has its own. The scene generator belongs to LAÇİN, whose
 * training data was composed rather than filmed; EGE ODBARS used to borrow it
 * and now has the run down its own course, which is the thing only it can
 * show. The delivery run belongs to EGENODE, the Robolig robot that carries
 * parcels to an address; EGE ODBARS is an off-road course vehicle, and its
 * two demos look at the same vehicle from different places — the rover sim
 * from outside, in profile, and the course run from behind its camera.
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
const HomeMesh = dynamic(
  () => import("@/components/mesh/home-mesh").then((m) => m.HomeMesh),
  { ssr: false },
);
const DualRender = dynamic(
  () => import("@/components/telemetry/dual-render").then((m) => m.DualRender),
  { ssr: false },
);
const RoverSim = dynamic(
  () => import("@/components/sim/rover-sim").then((m) => m.RoverSim),
  { ssr: false },
);
const MotorBench = dynamic(
  () => import("@/components/motor/motor-bench").then((m) => m.MotorBench),
  { ssr: false },
);
const OdbarsRun = dynamic(
  () => import("@/components/course/odbars-run").then((m) => m.OdbarsRun),
  { ssr: false },
);

const INSTRUMENTS: Record<string, ComponentType<InstrumentProps>[]> = {
  lacin: [DetectionChallenge, SceneGenerator],
  tuygun: [LiveDetector, VisualOdometry],
  egenode: [RoverSim],
  "ege-odbars": [OdbarsRun],
  homeagent: [HomeMesh],
  telemetry: [DualRender],
  tubitak: [MotorBench],
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
