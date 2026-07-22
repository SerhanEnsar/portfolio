// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { SectionMark } from "@/components/ui/marks";
import { about, metrics } from "@/content/site";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

export function About({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section
      id="about"
      data-objective="section:about"
      className="relative border-t border-line bg-void py-28 md:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionMark index="01" label={dict.sections.about} />
        </div>

        <div className="space-y-8 md:col-span-8">
          {/* First paragraph carries the display face — it is the statement,
              the rest is elaboration. */}
          <p className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold uppercase leading-[1.06] tracking-tight text-bone">
            {about[locale][0]}
          </p>

          <div className="grid gap-6 text-[15px] leading-relaxed text-dim md:grid-cols-2">
            {about[locale].slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4">
            {metrics.map((metric) => (
              // Values sit on a shared baseline even when a label wraps.
              <div key={metric.value} className="flex flex-col bg-void px-4 py-5">
                <dt className="font-mono text-[10px] uppercase leading-tight tracking-[0.16em] text-dim">
                  {metric.label[locale]}
                </dt>
                <dd className="mt-auto pt-3 font-display text-3xl font-bold text-signal">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
