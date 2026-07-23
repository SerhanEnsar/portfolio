// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { Locale } from "@/content/locale";
import type { Dictionary } from "@/content/dictionaries";
import { profile } from "@/content/site";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <footer id="site-footer" className="relative z-10 border-t border-line bg-void">
      {/* Extra bottom padding keeps the copyright and location clear of the
          two fixed corner instruments (console, mission log), which float at
          z-40 over the footer once the page bottoms out. */}
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 pt-8 pb-20 font-mono text-[11px] uppercase tracking-[0.2em] text-dim md:flex-row md:items-center md:justify-between md:px-10">
        <p>
          © 2026 {profile.name} — {dict.footer.rights}
        </p>
        <p>{profile.location[locale]}</p>
      </div>
    </footer>
  );
}
