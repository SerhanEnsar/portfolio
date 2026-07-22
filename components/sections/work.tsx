// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionMark, StatusDot } from "@/components/ui/marks";
import { projects, activeCount, completeCount } from "@/content/projects";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

export function Work({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section
      id="work"
      data-objective="section:work"
      className="relative border-t border-line bg-void py-28 md:py-40"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <SectionMark index="03" label={dict.sections.work} />
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
              {activeCount} {dict.work.active} · {completeCount} {dict.work.complete}
            </p>
          </div>

          {/* A list, not a card grid — these are entries in a log and the
              codenames should line up so they can be scanned in one pass. */}
          <ul className="border-t border-line md:col-span-8">
            {projects.map((project) => (
              <li key={project.slug} className="border-b border-line">
                <Link
                  href={`/${locale}/projects/${project.slug}`}
                  className="group flex flex-col gap-4 py-7 transition-colors md:flex-row md:items-baseline md:gap-8"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-display text-2xl font-bold tracking-tight text-bone transition-colors group-hover:text-signal md:text-4xl">
                        {project.codename}
                      </h3>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                        <StatusDot live={project.status === "active"} />
                        {project.status === "active"
                          ? dict.work.active
                          : dict.work.complete}
                      </span>
                    </div>

                    <p className="text-sm text-dim">{project.title[locale]}</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-signal/80">
                      {project.headline[locale]}
                    </p>
                  </div>

                  {/* Meta spans the row on narrow screens; only once it sits
                      in its own column does right-alignment read as a column. */}
                  <div className="flex items-center justify-between gap-6 md:shrink-0 md:justify-start">
                    <div className="space-y-1 md:text-right">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
                        {project.years}
                      </p>
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
                        {project.role[locale]}
                      </p>
                    </div>
                    <ArrowUpRight
                      size={20}
                      className="shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
