// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { ImageResponse } from "next/og";
import { profile } from "@/content/site";
import { getDictionary } from "@/content/dictionaries";
import { isLocale, locales, type Locale } from "@/content/locale";
import { OG, OG_CONTENT_TYPE, OG_SIZE, caps, inlineImage, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${profile.name} — portfolio`;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

/**
 * The card the site itself turns into when its link is shared.
 *
 * It is the hero, reduced: the same eyebrow, the same two-line name, the same
 * amber rule — and the photograph, which is the one thing the page never shows
 * and a share card needs. Everything is typeset in the page's own faces, so a
 * link preview and the page it opens read as one thing.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  // The card gets the school without the years: the full line wraps in the
  // narrower column, and a card is a summary — the page carries the dates.
  const school = profile.university[locale].split(",")[0];

  const [fonts, portrait] = await Promise.all([
    ogFonts(),
    inlineImage("profile/portrait.jpg"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: OG.void,
          color: OG.bone,
          fontFamily: "JetBrains Mono",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 52px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 8, height: 8, backgroundColor: OG.lock }} />
            <div style={{ fontSize: 17, letterSpacing: 3, color: OG.dim }}>
              {caps(profile.discipline[locale], locale)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 26,
              fontFamily: "Saira Condensed",
              fontSize: 82,
              lineHeight: 0.9,
              letterSpacing: -1,
            }}
          >
            {profile.nameLines.map((line) => (
              <div key={line}>{caps(line, locale)}</div>
            ))}
          </div>

          <div style={{ display: "flex", marginTop: 30, height: 2, width: 96, backgroundColor: OG.signal }} />

          <div style={{ display: "flex", marginTop: 22, fontSize: 15, letterSpacing: 1, color: OG.dim }}>
            {caps(school, locale)}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 16, letterSpacing: 1, color: OG.signal }}>
            {caps(dict.hero.status, locale)}
          </div>
        </div>

        {/* The panel is square because the photograph is: 630 wide against a
            630-tall card crops nothing off it. Anything narrower would show
            the head and throw away the rest of the picture. */}
        <div style={{ display: "flex", position: "relative", width: 630, height: 630 }}>
          <img
            src={portrait}
            width={630}
            height={630}
            style={{ width: 630, height: 630, objectFit: "cover" }}
            alt=""
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 630,
              height: 630,
              display: "flex",
              backgroundImage: `linear-gradient(to right, ${OG.void} 0%, rgba(8,11,14,0.35) 45%, rgba(8,11,14,0.15) 100%)`,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 1,
              display: "flex",
              backgroundColor: OG.line,
            }}
          />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
