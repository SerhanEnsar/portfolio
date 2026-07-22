// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { motion } from "framer-motion";
import { SectionMark } from "@/components/ui/marks";
import { skillGroups } from "@/content/site";
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";

export function Capabilities({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section
      id="capabilities"
      className="relative border-t border-line bg-surface py-28 md:py-40"
    >
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-4">
          <SectionMark index="02" label={dict.sections.capabilities} />
        </div>

        <div className="md:col-span-8">
          <ul className="border-t border-line">
            {skillGroups.map((group) => (
              <motion.li
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="border-b border-line py-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
                    {group.title[locale]}
                  </h3>
                  <span className="font-mono text-[11px] tracking-[0.2em] text-signal">
                    {group.depth}
                  </span>
                </div>

                {/* The bar is a reading of the number beside it, nothing more. */}
                <div className="mt-4 h-px w-full bg-line" aria-hidden="true">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: group.depth / 100 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    style={{ transformOrigin: "left" }}
                    className="h-px bg-signal"
                  />
                </div>

                <p className="mt-5 max-w-xl text-sm leading-relaxed text-dim">
                  {group.note[locale]}
                </p>

                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {group.tools.map((tool) => (
                    <li
                      key={tool}
                      className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
