// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/content/locale";
import { locales } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";
import { cn } from "@/lib/utils";
import { useCinematicStore } from "@/lib/store/useCinematicStore";

const SECTIONS = ["about", "capabilities", "work", "roles", "contact"] as const;

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const { openCinematic } = useCinematicStore();

  // The bar is transparent over the hero scene and only takes on a surface
  // once the reader has left it.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onHome = pathname === `/${locale}`;
  const href = (id: string) => (onHome ? `#${id}` : `/${locale}#${id}`);

  /**
   * Same-page section jump from the mobile panel, driven by hand.
   *
   * Left to the browser, the jump is lost: closing the panel collapses its
   * height in the same tick, and the layout change cancels the scroll before
   * it has moved a pixel — the tap reads as a dead link. So the panel closes
   * first, and the scroll runs once it is out of the way. Off the home page
   * the link is a real navigation and is left alone.
   */
  const jump = (event: ReactMouseEvent<HTMLAnchorElement>, id: string) => {
    setOpen(false);
    if (!onHome) return;

    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    history.replaceState(null, "", `#${id}`);
    // Somebody who asked for less motion gets the section, not the journey.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" }),
      still ? 0 : 320,
    );
  };

  /** Same page, other language — swap only the locale segment. */
  const swapLocale = (next: Locale) => {
    const rest = pathname.replace(new RegExp(`^/${locale}`), "");
    return `/${next}${rest}`;
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        // Transparent only where there is a scene to be transparent over.
        // Every other route starts at the top of its own text.
        lifted || !onHome
          ? "border-b border-line bg-void/85 backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
        <Link
          href={`/${locale}`}
          onClick={() => setOpen(false)}
          className="group flex items-center gap-3"
        >
          {/* The photograph whole, at the ratio it was taken, in the one
              round frame on a site built entirely from square corners. That is
              a deliberate exception, not an oversight: a portrait is the one
              thing here that is a person rather than an instrument. */}
          <Image
            src="/profile/mark.jpg"
            alt=""
            width={512}
            height={512}
            priority
            sizes="32px"
            className="h-8 w-8 rounded-full border border-line object-cover grayscale transition-colors group-hover:border-signal md:h-9 md:w-9"
          />
          <span className="font-display text-lg font-bold uppercase tracking-[0.18em] text-bone">
            SEB<span className="text-signal">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={dict.nav.menu}>
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={href(id)}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-bone"
            >
              {dict.nav[id]}
            </a>
          ))}
          <button
            onClick={openCinematic}
            className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal transition-colors hover:text-bone flex items-center gap-1"
          >
            🚀 {dict.nav.cinematic}
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <div
            className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em]"
            role="group"
            aria-label={dict.a11y.switchLanguage}
          >
            {locales.map((code, i) => (
              <span key={code} className="flex items-center gap-1">
                {i > 0 && <span className="text-line">/</span>}
                <Link
                  href={swapLocale(code)}
                  hrefLang={code}
                  onClick={() => setOpen(false)}
                  aria-current={code === locale ? "true" : undefined}
                  className={cn(
                    "transition-colors",
                    code === locale ? "text-signal" : "text-dim hover:text-bone",
                  )}
                >
                  {code}
                </Link>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? dict.nav.close : dict.nav.menu}
            className="flex h-8 w-8 items-center justify-center text-dim transition-colors hover:text-bone lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-void/95 backdrop-blur-md lg:hidden"
            aria-label={dict.nav.menu}
          >
            <div className="flex flex-col px-5 py-2">
              {SECTIONS.map((id) => (
                <a
                  key={id}
                  href={href(id)}
                  onClick={(event) => jump(event, id)}
                  className="border-b border-line/60 py-4 font-display text-2xl font-bold uppercase tracking-tight text-bone last:border-0"
                >
                  {dict.nav[id]}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
