// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowUpRight, Download, Mail } from "lucide-react";
import { ScrollSequence } from "@/components/sequence/scroll-sequence";
import { profile } from "@/content/site";
import type { Dictionary } from "@/content/dictionaries";

/** The CV link only appears once the file is actually in public/. */
function cvAvailable() {
  return existsSync(path.join(process.cwd(), "public", profile.cvPath));
}

const linkClass =
  "group flex items-center justify-between gap-6 border-b border-line py-5 transition-colors hover:border-signal";

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <div id="contact" className="relative">
      <ScrollSequence id="lattice" span={2}>
        <div className="flex h-full items-center px-5 md:px-10">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="max-w-2xl">
              <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] font-extrabold leading-[0.9] tracking-[-0.02em] text-bone">
                {dict.contact.heading}
              </h2>
              <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-dim">
                {dict.contact.body}
              </p>

              <ul className="mt-12 border-t border-line">
                <li>
                  <a href={`mailto:${profile.email}`} className={linkClass}>
                    <span className="font-mono text-sm tracking-wide text-bone">
                      {profile.email}
                    </span>
                    <Mail
                      size={16}
                      className="shrink-0 text-dim transition-colors group-hover:text-signal"
                      aria-hidden="true"
                    />
                  </a>
                </li>
                {[
                  { label: "GitHub", href: profile.github },
                  { label: "LinkedIn", href: profile.linkedin },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      <span className="font-mono text-sm uppercase tracking-[0.18em] text-bone">
                        {link.label}
                      </span>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-dim transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
                {cvAvailable() && (
                  <li>
                    <a href={profile.cvPath} download className={linkClass}>
                      <span className="font-mono text-sm uppercase tracking-[0.18em] text-bone">
                        {dict.contact.cv}
                      </span>
                      <Download
                        size={16}
                        className="shrink-0 text-dim transition-colors group-hover:text-signal"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </ScrollSequence>
    </div>
  );
}
