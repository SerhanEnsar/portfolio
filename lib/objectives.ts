// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { projects } from "@/content/projects";

/**
 * Objective tokens — pure data, deliberately kept out of `lib/progress.ts`.
 * That module is client-only, and server components need to stamp
 * `data-objective` attributes while rendering.
 */

export const SECTION_OBJECTIVES = [
  "section:about",
  "section:capabilities",
  "section:work",
  "section:roles",
  "section:contact",
] as const;

export const INSTRUMENT_OBJECTIVES = [
  "instrument:challenge",
  "instrument:detector",
  "instrument:generator",
  "instrument:odometry",
  "instrument:sim",
  "instrument:mesh",
  "instrument:telemetry",
  "instrument:motor",
] as const;

/** Narratives, one per project that carries one — see `ProjectStory`. */
export const STORY_OBJECTIVES = [
  "story:eye2s",
  "story:unilate",
] as const;

export const briefObjective = (slug: string) => `brief:${slug}`;

/** Every objective that counts toward completion. */
export function allObjectives(): string[] {
  return [
    ...SECTION_OBJECTIVES,
    ...projects.map((p) => briefObjective(p.slug)),
    ...INSTRUMENT_OBJECTIVES,
    ...STORY_OBJECTIVES,
  ];
}
