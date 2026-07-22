// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, isLocale } from "@/content/locale";

/**
 * Sends locale-less URLs to a language. Turkish visitors land on /tr,
 * everyone else on /en. Kept dependency-free — the Accept-Language header
 * is simple enough to read directly, and Proxy runs on every request.
 */
function preferredLocale(header: string | null) {
  if (!header) return defaultLocale;

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.split("=")[1]) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale(request.headers.get("accept-language"))}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals and anything served straight out of public/.
  matcher: ["/((?!_next|sequences|cv|favicon.ico|icon.svg|.*\\.[a-z0-9]+$).*)"],
};
