// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { Dictionary } from "@/content/dictionaries";

type StoryProps = { dict: Dictionary };

/**
 * The narratives, mounted the same way instruments are: per slug, in the
 * browser only, so a project page never ships the story that belongs to
 * another one.
 *
 * These are the counterpart to the instruments rather than more of them. An
 * instrument asks the visitor to do something; a story tells them what the
 * project decided and why, and runs whether or not they touch it. The three
 * projects that arrived after the TEKNOFEST run carry stories because their
 * point is a decision — six frames instead of retraining, derived sessions
 * instead of stored ones, a dependency list kept at zero.
 */
const Eye2sStory = dynamic(
  () => import("./story/eye2s-story").then((m) => m.Eye2sStory),
  { ssr: false },
);
const UnilateStory = dynamic(
  () => import("./story/unilate-story").then((m) => m.UnilateStory),
  { ssr: false },
);
const UnilateGallery = dynamic(
  () => import("./project-gallery").then((m) => m.UnilateGallery),
  { ssr: false },
);
const StetoskopGallery = dynamic(
  () => import("./project-gallery").then((m) => m.StetoskopGallery),
  { ssr: false },
);

const STORIES: Record<string, ComponentType<StoryProps>[]> = {
  eye2s: [Eye2sStory],
  // UniLate leads with the shipped screens, then the rule behind them.
  unilate: [UnilateGallery, UnilateStory],
  // A gallery on its own: the site is a design deliverable, and showing it is
  // the whole argument — a second layer narrating the same decisions read as
  // one explanation too many.
  "stetoskop-akademi": [StetoskopGallery],
};

export function ProjectStory({ slug, dict }: { slug: string; dict: Dictionary }) {
  const list = STORIES[slug];
  if (!list) return null;
  return (
    <div className="space-y-16">
      {list.map((Story, i) => (
        <section key={i} className="border-t border-line pt-14">
          <Story dict={dict} />
        </section>
      ))}
    </div>
  );
}
