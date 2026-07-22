// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import type { Locale } from "@/content/locale";
import { locales } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";
import { cn } from "@/lib/utils";

const SECTIONS = ["about", "capabilities", "work", "roles", "contact"] as const;

/** Routes rather than sections — the parts of the site that run something. */
const INSTRUMENTS = ["lab", "sim"] as const;

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

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
          className="font-display text-lg font-bold uppercase tracking-[0.18em] text-bone"
        >
          SEB<span className="text-signal">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={dict.nav.menu}>
          {SECTIONS.map((id) => (
            <a
              key={id}
              href={href(id)}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-bone"
            >
              {dict.nav[id]}
            </a>
          ))}
          {/* Routes, not anchors — and the only nav items that run code, so
              they carry the signal colour the instruments use. */}
          {INSTRUMENTS.map((id) => (
            <Link
              key={id}
              href={`/${locale}/${id}`}
              className={cn(
                "font-mono text-[11px] uppercase tracking-[0.2em] transition-colors",
                pathname.startsWith(`/${locale}/${id}`)
                  ? "text-signal"
                  : "text-dim hover:text-signal",
              )}
            >
              {dict.nav[id]}
            </Link>
          ))}
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
            className="flex h-8 w-8 items-center justify-center text-dim transition-colors hover:text-bone md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-void/95 backdrop-blur-md md:hidden"
            aria-label={dict.nav.menu}
          >
            <div className="flex flex-col px-5 py-2">
              {SECTIONS.map((id) => (
                <a
                  key={id}
                  href={href(id)}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-4 font-display text-2xl font-bold uppercase tracking-tight text-bone last:border-0"
                >
                  {dict.nav[id]}
                </a>
              ))}
              {INSTRUMENTS.map((id) => (
                <Link
                  key={id}
                  href={`/${locale}/${id}`}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/60 py-4 font-display text-2xl font-bold uppercase tracking-tight text-signal last:border-0"
                >
                  {dict.nav[id]}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
