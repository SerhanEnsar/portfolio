// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { SectionMark } from "@/components/ui/marks";
import { SceneBackdrop } from "@/components/sequence/scene-backdrop";
import { internship } from "@/content/site";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

/**
 * The internship reads as one built thing rather than a job history, so it gets
 * its own block. The lattice field behind it is a network of nodes — the same
 * shape as the automation flow it describes — which is why this scene, and not
 * a photoreal one, sits here.
 */
export function Internship({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const steps = internship.steps[locale];

  return (
    <SceneBackdrop
      id="lattice"
      anchor="internship"
      className="border-t border-line py-28 md:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionMark index="05" label={dict.credentials.internship} />
          <p className="mt-6 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
            {internship.org}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-signal/80">
            {internship.title[locale]}
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
            {internship.period[locale]}
          </p>
        </div>

        <div className="md:col-span-8">
          <h3 className="max-w-2xl font-display text-3xl font-bold leading-[1.05] tracking-tight text-bone md:text-4xl">
            {internship.headline[locale]}
          </h3>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-dim">
            {internship.body[locale]}
          </p>

          {/* The stages, in order — read left to right they are the flow. */}
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.24em] text-dim/70">
            {dict.credentials.pipeline}
          </p>
          <ol className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-3">
            {steps.map((step, i) => (
              <li key={step} className="flex items-center gap-2">
                <span className="border border-line bg-void/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-bone">
                  <span className="text-signal">{String(i + 1).padStart(2, "0")}</span>{" "}
                  {step}
                </span>
                {i < steps.length - 1 && (
                  <span className="text-signal/50" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>

          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-dim">
            {internship.note[locale]}
          </p>

          <ul className="mt-8 flex flex-wrap gap-2">
            {internship.stack.map((tool) => (
              <li
                key={tool}
                className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-dim"
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneBackdrop>
  );
}
