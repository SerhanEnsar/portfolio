// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { locales, isLocale, type Locale } from "@/content/locale";
import { getDictionary, teamLabel } from "@/content/dictionaries";
import { projects, getProject } from "@/content/projects";
import { StatusDot, Readout } from "@/components/ui/marks";
import { briefObjective } from "@/lib/objectives";
import { ScrollSequence } from "@/components/sequence/scroll-sequence";
import { ProjectInstrument } from "@/components/project/project-instrument";

/** Projects whose page carries a live, playable instrument at the end. */
const INSTRUMENT_SLUGS = new Set(["lacin", "tuygun", "egenode", "ege-odbars"]);

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
        <ScrollSequence id={project.sequence} span={2}>
          <div className="flex h-full items-end px-5 pb-20 md:px-10">
            <Header project={project} locale={locale} dict={dict} live={live} />
          </div>
        </ScrollSequence>
      ) : (
        <div className="px-5 pb-16 pt-40 md:px-10 md:pt-52">
          <Header project={project} locale={locale} dict={dict} live={live} />
        </div>
      )}

      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-12 md:grid-cols-12">
          <dl className="grid h-fit grid-cols-2 gap-8 md:col-span-4 md:grid-cols-1 md:gap-7">
            <Readout label={dict.project.program} value={project.program[locale]} />
            <Readout label={dict.project.role} value={project.role[locale]} />
            <Readout
              label={dict.project.team}
              value={teamLabel(dict, project.teamSize)}
            />
            <Readout label={dict.project.period} value={project.years} />
          </dl>

          <div className="space-y-14 md:col-span-8">
            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
                {dict.project.brief}
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-bone/85">
                {project.summary[locale]}
              </p>
            </section>

            <section>
              <h2 className="font-mono text-[10px] uppercase tracking-[0.28em] text-dim">
                {dict.project.contribution}
              </h2>
              <ul className="mt-5 border-t border-line">
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
    <div className="mx-auto w-full max-w-[1400px]">
      <p className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
        <StatusDot live={live} />
        {live ? dict.work.active : dict.work.complete}
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
    </div>
  );
}
