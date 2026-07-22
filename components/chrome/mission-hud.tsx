// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress, record, reset } from "@/lib/progress";
import {
  briefObjective,
  SECTION_OBJECTIVES,
  INSTRUMENT_OBJECTIVES,
} from "@/lib/objectives";
import { projects } from "@/content/projects";
import type { Dictionary } from "@/content/dictionaries";

/**
 * Watches anything marked `data-objective` and records it once the visitor has
 * actually seen it. One watcher for the whole document rather than a hook per
 * section.
 *
 * "Seen" cannot be a plain intersection ratio: a project page's <article> is
 * several screens tall, so it never reaches 35% visibility and would never be
 * credited. The rule is whichever comes first — a third of the element on
 * screen, or half a screen filled by it.
 */
function useObjectiveWatcher() {
  useEffect(() => {
    const candidates = new Set<Element>();
    let frame = 0;

    const seenEnough = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const visible = Math.min(rect.bottom, viewport) - Math.max(rect.top, 0);
      if (visible <= 0) return false;
      return visible >= Math.min(rect.height * 0.35, viewport * 0.5);
    };

    const evaluate = () => {
      frame = 0;
      for (const el of candidates) {
        if (!seenEnough(el)) continue;
        const token = el.getAttribute("data-objective");
        if (token) record(token);
        candidates.delete(el);
        observer.unobserve(el);
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(evaluate);
    };

    // The observer only decides who is worth measuring; the rule above decides
    // who is credited.
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) candidates.add(entry.target);
        else candidates.delete(entry.target);
      }
      schedule();
    });

    const scan = () => {
      document
        .querySelectorAll("[data-objective]")
        .forEach((node) => observer.observe(node));
    };
    scan();

    // Route changes swap the whole tree out; pick up whatever arrived.
    const mutation = new MutationObserver(scan);
    mutation.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      mutation.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
}

export function MissionHud({ dict }: { dict: Dictionary }) {
  useObjectiveWatcher();
  const { seen, done, total, complete } = useProgress();
  const [open, setOpen] = useState(false);

  const ratio = total === 0 ? 0 : done / total;
  const groups = [
    {
      label: dict.hud.sections,
      items: SECTION_OBJECTIVES.map((token) => ({
        token,
        label: dict.sections[token.split(":")[1] as keyof typeof dict.sections],
      })),
    },
    {
      label: dict.hud.briefs,
      items: projects.map((p) => ({
        token: briefObjective(p.slug),
        label: p.codename,
      })),
    },
    {
      label: dict.hud.instruments,
      items: INSTRUMENT_OBJECTIVES.map((token) => ({
        token,
        label: token.split(":")[1],
      })),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={dict.hud.open}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 border border-line bg-void/80 px-3 py-2 backdrop-blur-sm transition-colors hover:border-signal"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" className="text-line" />
          <circle
            cx="8"
            cy="8"
            r="6.5"
            fill="none"
            stroke="currentColor"
            className={complete ? "text-lock" : "text-signal"}
            strokeDasharray={`${ratio * 40.8} 40.8`}
            strokeLinecap="butt"
            transform="rotate(-90 8 8)"
          />
        </svg>
        <span className="font-mono text-[10px] tracking-[0.16em] text-dim">
          {done}/{total}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-20 right-5 z-40 w-[min(20rem,calc(100vw-2.5rem))] border border-line bg-surface/95 p-4 backdrop-blur-md"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
              {dict.hud.title}
            </p>

            <div className="mt-4 space-y-4">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-dim/70">
                    {group.label}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item.token}
                        className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                          seen.has(item.token) ? "text-bone" : "text-dim/45"
                        }`}
                      >
                        {seen.has(item.token) ? "▪" : "▫"} {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {complete && (
              <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] leading-relaxed text-lock">
                {dict.hud.complete}
              </p>
            )}

            <button
              type="button"
              onClick={reset}
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-dim transition-colors hover:text-signal"
            >
              {dict.hud.reset}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
