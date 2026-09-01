// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { locales, isLocale, type Locale } from "@/content/locale";
import { getDictionary } from "@/content/dictionaries";
import { projects, getProject, statusLabel } from "@/content/projects";
import { StatusDot } from "@/components/ui/marks";
import { briefObjective } from "@/lib/objectives";
import { ScrollSequence } from "@/components/sequence/scroll-sequence";
import { sequences } from "@/content/sequences";
import { ProjectInstrument } from "@/components/project/project-instrument";
import { ProjectStory } from "@/components/project/project-story";
import {
  ProjectMeta,
  ProjectMetaInline,
} from "@/components/project/project-meta";

/** Projects whose page carries a live, playable instrument at the end. */
const INSTRUMENT_SLUGS = new Set(["lacin", "tuygun", "egenode", "ege-odbars"]);

/**
 * Projects whose page carries a gallery, a narrative, or both — everything
 * `ProjectStory` mounts. Listed here rather than exported from that module for
 * the same reason the instruments are: it is `"use client"`, and a Set does not
 * survive the boundary as a Set — it arrives as a client reference and blows up
 * at prerender.
 */
const STORY_SLUGS = new Set(["eye2s", "unilate", "stetoskop-akademi"]);

export function generateStaticParams() {
  return locales.flatMap((lang) => projects.map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/projects/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const project = getProject(slug);
  if (!project || !isLocale(lang)) return {};

  return {
    title: `${project.codename} — ${project.title[lang]}`,
    description: project.headline[lang],
    alternates: {
      canonical: `/${lang}/projects/${slug}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `/${l}/projects/${slug}`]),
      ),
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[lang]/projects/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const project = getProject(slug);
  if (!project) notFound();

  const locale: Locale = lang;
  const dict = getDictionary(locale);
  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];
  const live = project.status === "active";

  return (
    <article data-objective={briefObjective(project.slug)}>
      {/* Projects with a scene of their own open on it; the rest open on
          type alone rather than borrowing an unrelated image. */}
      {project.sequence ? (
        <ScrollSequence
          id={project.sequence}
          span={2}
          scrim={sequences[project.sequence].scrim}
        >
          <div className="flex h-full items-end px-5 pb-20 md:px-10">
            <Header project={project} locale={locale} dict={dict} live={live} />
          </div>
        </ScrollSequence>
      ) : (
        <div className="px-5 pb-16 pt-40 md:px-10 md:pt-52">
          <Header project={project} locale={locale} dict={dict} live={live} />
        </div>
      )}

      {/* Full width. The credentials moved into the header's floating panel, so
          nothing here has to share the page with a four-line column — and the
          instruments, galleries and narratives get the room they were built
          for. Prose still gets a measure; only the wide things go wide. */}
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <div className="space-y-14">
          <ProjectMetaInline project={project} locale={locale} dict={dict} />

          <div className="space-y-14">
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
                {dict.project.brief}
              </h2>
              <p className="mt-5 max-w-3xl text-[17px] leading-relaxed text-bone/85">
                {project.summary[locale]}
              </p>
            </section>

            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
                {dict.project.contribution}
              </h2>
              <ul className="mt-5 max-w-4xl border-t border-line">
                {project.work[locale].map((item, i) => (
                  <li
                    key={item}
                    className="flex gap-5 border-b border-line py-4 text-[15px] leading-relaxed text-dim"
                  >
                    <span className="shrink-0 font-mono text-[11px] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
                {dict.project.stack}
              </h2>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                {project.stack.map((tool) => (
                  <li
                    key={tool}
                    className="font-mono text-xs uppercase tracking-[0.14em] text-bone"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </section>

            {/* The project's live proof — the challenge, detector, generator
                or rover run that belongs to it, each mounted only in the
                browser and found by opening the brief rather than the nav. */}
            {INSTRUMENT_SLUGS.has(project.slug) && (
              <ProjectInstrument slug={project.slug} dict={dict} />
            )}

            {/* The projects that came after the competitions have something to
                show rather than a control to hand over — shipped screens, and
                where there is a decision worth walking through, a narrative. */}
            {STORY_SLUGS.has(project.slug) && (
              <ProjectStory slug={project.slug} dict={dict} />
            )}
          </div>
        </div>
      </div>

      <nav className="border-t border-line">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-5 py-10 md:px-10">
          <Link
            href={`/${locale}#work`}
            className="group flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-bone"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden="true"
            />
            {dict.project.back}
          </Link>

          <Link
            href={`/${locale}/projects/${next.slug}`}
            className="group flex items-center gap-4 text-right"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
              {dict.project.next}
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-bone transition-colors group-hover:text-signal">
              {next.codename}
            </span>
            <ArrowRight
              size={14}
              className="text-dim transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </nav>
    </article>
  );
}

function Header({
  project,
  locale,
  dict,
  live,
}: {
  project: NonNullable<ReturnType<typeof getProject>>;
  locale: Locale;
  dict: ReturnType<typeof getDictionary>;
  live: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-end justify-between gap-10">
      <div>
      <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
        <StatusDot live={live} />
        {statusLabel(project.status, dict)}
        <span className="h-px w-6 bg-line" aria-hidden="true" />
        {project.domain[locale]}
      </p>
      <h1 className="mt-5 font-display text-[clamp(2.8rem,8vw,6.5rem)] font-extrabold leading-[0.88] tracking-[-0.02em] text-bone">
        {project.codename}
      </h1>
      <p className="mt-4 max-w-2xl font-display text-xl font-semibold uppercase tracking-tight text-dim md:text-2xl">
        {project.title[locale]}
      </p>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-signal">
        {project.headline[locale]}
      </p>

      {/* Only for work that is publicly reachable — a dead link on a portfolio
          costs more than the link ever gained. */}
      {project.link && (
        <a
          href={project.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-7 inline-flex items-center gap-3 border border-signal px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
        >
          {dict.project.visit[project.link.kind]}
          <ExternalLink
            size={13}
            className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </a>
      )}
      </div>

      <ProjectMeta project={project} locale={locale} dict={dict} />
    </div>
  );
}
