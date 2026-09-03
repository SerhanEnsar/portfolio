// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { MetadataRoute } from "next";
import { locales } from "@/content/locale";
import { projects } from "@/content/projects";
import { siteUrl } from "@/lib/site-url";

/**
 * Every page worth finding, in both languages, each one declaring the other as
 * its alternate. The standalone `/lab` and `/sim` routes are deliberately left
 * out: they are reachable from the console and are not destinations.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const alternates = (path: string) => ({
    languages: Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
  });

  const home = locales.map((lang) => ({
    url: `${siteUrl}/${lang}`,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: alternates(""),
  }));

  const briefs = locales.flatMap((lang) =>
    projects.map((project) => ({
      url: `${siteUrl}/${lang}/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: alternates(`/projects/${project.slug}`),
    })),
  );

  return [...home, ...briefs];
}
