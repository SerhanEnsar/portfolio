// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Where this site lives, absolutely.
 *
 * Share cards, canonical links, the sitemap and robots all need a full URL,
 * and a relative one silently produces a card no platform can fetch.
 *
 * The order matters. `NEXT_PUBLIC_SITE_URL` wins so a preview deployment can
 * describe itself rather than claiming to be production. The real address is
 * next. Vercel's own hostname is the fallback for a deployment that is neither,
 * and localhost is last, so nothing has to be true about the internet to run
 * `next dev`.
 */
const DOMAIN = "https://serhanensar.me";

export const siteUrl = (() => {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return DOMAIN;
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
})();
