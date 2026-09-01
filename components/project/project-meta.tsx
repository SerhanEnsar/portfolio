// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { Readout } from "@/components/ui/marks";
import { teamLabel, type getDictionary } from "@/content/dictionaries";
import type { Locale } from "@/content/locale";
import type { Project } from "@/content/projects";

/**
 * The project's credentials, floated opposite the title.
 *
 * They used to hold a quarter of the page width down the left side, which left
 * a tall empty column under four short lines and squeezed everything else —
 * briefs, instruments, galleries, narratives — into two thirds of the page.
 * Here they cost nothing until asked for, and the body gets the full width.
 *
 * Hover and focus only, no JavaScript: a group with `focus-within` opens it for
 * a keyboard too, and the panel is `aria-hidden` until then so a screen reader
 * meets the readable copy below rather than this. Coarse pointers never see it
 * — `ProjectMetaInline` carries the same four values on small screens.
 */
export function ProjectMeta({
  project,
  locale,
  dict,
}: {
  project: Project;
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <div className="group relative hidden md:block">
      <button
        type="button"
        className="flex items-center gap-3 border border-line bg-void/70 px-4 py-2.5 backdrop-blur-sm transition-colors group-hover:border-signal group-focus-within:border-signal"
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim transition-colors group-hover:text-signal group-focus-within:text-signal">
          {dict.project.credentials}
        </span>
        <span className="h-px w-6 bg-line" aria-hidden="true" />
        <span className="font-mono text-[11px] text-signal">{project.years}</span>
      </button>

      {/* Floats above the trigger so it never pushes the title around, and is
          inert until opened so a stray pointer cannot catch it. */}
      <dl
        className="pointer-events-none absolute bottom-[calc(100%+0.6rem)] right-0 w-[21rem] translate-y-2 space-y-6 border border-line bg-void/92 p-6 opacity-0 shadow-2xl backdrop-blur-md transition duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
      >
        <Readout label={dict.project.program} value={project.program[locale]} />
        <Readout label={dict.project.role} value={project.role[locale]} />
        <Readout label={dict.project.team} value={teamLabel(dict, project.teamSize)} />
        <Readout label={dict.project.period} value={project.years} />
      </dl>
    </div>
  );
}

/** The same four values, laid out for screens that have no hover to give. */
export function ProjectMetaInline({
  project,
  locale,
  dict,
}: {
  project: Project;
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-8 gap-y-7 border-b border-line pb-10 md:hidden">
      <Readout label={dict.project.program} value={project.program[locale]} />
      <Readout label={dict.project.role} value={project.role[locale]} />
      <Readout label={dict.project.team} value={teamLabel(dict, project.teamSize)} />
      <Readout label={dict.project.period} value={project.years} />
    </dl>
  );
}
