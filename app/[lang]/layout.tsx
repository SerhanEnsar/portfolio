// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { Metadata } from "next";
import { Saira_Condensed, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import { locales, isLocale, type Locale } from "@/content/locale";
import { siteUrl } from "@/lib/site-url";
import { getDictionary } from "@/content/dictionaries";
import { profile } from "@/content/site";
import { SiteHeader } from "@/components/chrome/site-header";
import { SiteFooter } from "@/components/chrome/site-footer";
import { Reticle } from "@/components/chrome/reticle";
import { MissionHud } from "@/components/chrome/mission-hud";
import { BootSequence } from "@/components/chrome/boot-sequence";
import { CommandConsole } from "@/components/console/command-console";
import { OrientationHint } from "@/components/chrome/orientation-hint";
import { MotionProvider } from "@/components/chrome/motion-provider";
import { CinematicPlayer } from "@/components/CinematicPlayer";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";

/* latin-ext carries ğ ş İ ı — without it the Turkish copy renders in fallback. */
const display = Saira_Condensed({
  variable: "--font-saira-condensed",
  subsets: ["latin", "latin-ext"],
  /* 600/700/800 only — nothing in the site sets display type lighter,
     and each unused weight is two more files across latin + latin-ext. */
  weight: ["600", "700", "800"],
  display: "swap",
});

const sans = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";

  // What the site is, not who he is: this line is the one a link preview and a
  // search result show under the title, and both are describing a page.
  const description =
    locale === "tr"
      ? "Serhan Ensar Büdün'ün portföy sitesi. Havacılıkta yapay zekâ, otonom kara araçları ve gömülü sistemler üzerine projeleri ve çalışmaları burada."
      : "The portfolio of Serhan Ensar Büdün — projects and work in AI for aviation, autonomous ground vehicles and embedded systems.";

  return {
    // Absolute URLs for the share cards; without this the images resolve
    // relatively and no platform can fetch them.
    metadataBase: new URL(siteUrl),
    title: {
      default: `${profile.name} — ${locale === "tr" ? "Portföy" : "Portfolio"}`,
      template: `%s · ${profile.name}`,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: profile.name,
      description,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      type: "profile",
      siteName: profile.name,
    },
    twitter: {
      card: "summary_large_image",
      title: profile.name,
      description,
    },
    // Search Console owns the sitemap submission and the reindex requests;
    // it will only talk to a property it can prove belongs to this site, and
    // the tag has to be on every page it might land on.
    verification: {
      google: "rz4NsH0QeGZDlkIKCM1lSGuy9CadMVnArcyDTBdQGtE",
    },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="atmosphere">
        <MotionProvider>
          {/* First thing in the tab order on every page: the nav is seven
              links deep and repeats on all of them. */}
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-signal focus:bg-void focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-signal"
          >
            {dict.a11y.skipToContent}
          </a>
          <BootSequence dict={dict} />
          <SiteHeader locale={lang} dict={dict} />
          <main id="content" className="relative z-10">
            {children}
          </main>
          <SiteFooter locale={lang} dict={dict} />

          {/* Instrument layer — sits above the page, below the boot overlay. */}
          <Reticle />
          <CommandConsole locale={lang} dict={dict} />
          <MissionHud dict={dict} />
          <OrientationHint dict={dict} />
          <CinematicPlayer />
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
