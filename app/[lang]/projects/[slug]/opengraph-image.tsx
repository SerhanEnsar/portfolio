// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { ImageResponse } from "next/og";
import { getDictionary } from "@/content/dictionaries";
import { isLocale, locales, type Locale } from "@/content/locale";
import { getProject, projects, statusLabel } from "@/content/projects";
import { profile } from "@/content/site";
import { OG, OG_CONTENT_TYPE, OG_SIZE, caps, inlineImage, ogFonts } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Project";

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

/**
 * A project's share card, built from the same parts its page header is: the
 * status, the domain, the codename, the title, and the scene that plays behind
 * it. The scene arrives as the poster the sequence build already writes for
 * the runtime — no second asset, and no chance of a card showing a frame the
 * page does not.
 *
 * A project without a scene gets the ground alone, which is what its page does
 * too rather than borrowing an unrelated picture.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);
  const project = getProject(slug);

  const fonts = await ogFonts();

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: OG.void,
            color: OG.bone,
            fontFamily: "Saira Condensed",
            fontSize: 72,
          }}
        >
          {caps(profile.name, locale)}
        </div>
      ),
      { ...size, fonts },
    );
  }

  // The sharp card frame, not the runtime poster: that one is deliberately
  // blurred so it can stand in while frames decode, and a share card wants
  // the scene itself.
  const poster = project.sequence
    ? await inlineImage(`sequences/${project.sequence}/card.jpg`)
    : null;
  const live = project.status === "active";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: OG.void,
          color: OG.bone,
          fontFamily: "JetBrains Mono",
        }}
      >
        {poster && (
          <img
            src={poster}
            width={1200}
            height={630}
            style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
            alt=""
          />
        )}
        {/* The page's own two scrims: one seats the scene, one guarantees the
            copy its contrast whatever the frame underneath is doing. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: `linear-gradient(to right, ${OG.void} 26%, rgba(8,11,14,0.72) 54%, rgba(8,11,14,0.18) 100%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage: `linear-gradient(to bottom, rgba(8,11,14,0.5) 0%, rgba(8,11,14,0.1) 45%, rgba(8,11,14,0.78) 100%)`,
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 64px",
            width: 860,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{ width: 8, height: 8, backgroundColor: live ? OG.lock : OG.dim }}
            />
            <div style={{ fontSize: 19, letterSpacing: 4, color: OG.dim }}>
              {caps(statusLabel(project.status, dict), locale)}
            </div>
            <div style={{ width: 26, height: 1, backgroundColor: OG.line }} />
            <div style={{ fontSize: 19, letterSpacing: 4, color: OG.dim }}>
              {caps(project.domain[locale], locale)}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Saira Condensed",
              fontSize: 118,
              lineHeight: 0.88,
              letterSpacing: -2,
            }}
          >
            {project.codename}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Saira Condensed",
              fontSize: 34,
              letterSpacing: 0,
              color: OG.dim,
            }}
          >
            {caps(project.title[locale], locale)}
          </div>

          <div style={{ display: "flex", marginTop: 26, height: 2, width: 76, backgroundColor: OG.signal }} />

          <div style={{ display: "flex", marginTop: 22, fontSize: 20, letterSpacing: 2, color: OG.signal }}>
            {caps(project.headline[locale], locale)}
          </div>
        </div>

        {/* Whose work this is — the one thing a project card must not omit. */}
        <div
          style={{
            position: "absolute",
            left: 64,
            bottom: 44,
            display: "flex",
            fontSize: 18,
            letterSpacing: 3,
            color: OG.dim,
          }}
        >
          {caps(profile.name, locale)}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
