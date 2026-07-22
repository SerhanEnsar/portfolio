// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { SectionMark } from "@/components/ui/marks";
import { roles } from "@/content/site";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

export function Roles({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="roles" className="relative border-t border-line bg-surface py-28 md:py-40">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionMark index="04" label={dict.sections.roles} />
        </div>

        {/* Ordered because the order is real — this is a chronology, and the
            numbering tells the reader which came first. */}
        <ol className="relative md:col-span-8">
          {roles.map((role, i) => (
            <li key={role.org} className="relative border-l border-line pb-14 pl-8 last:pb-0">
              <span
                className="absolute -left-[3px] top-1.5 h-1.5 w-1.5 rounded-full bg-signal"
                aria-hidden="true"
              />
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
                {String(roles.length - i).padStart(2, "0")} · {role.period[locale]}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
                {role.org}
              </h3>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-signal">
                {role.title[locale]}
              </p>
              <ul className="mt-5 space-y-2.5">
                {role.points[locale].map((point) => (
                  <li
                    key={point}
                    className="flex gap-3 text-sm leading-relaxed text-dim"
                  >
                    <span className="mt-2 h-px w-3 shrink-0 bg-line" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
