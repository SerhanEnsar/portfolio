// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { notFound } from "next/navigation";
import { locales, isLocale } from "@/content/locale";
import { getDictionary } from "@/content/dictionaries";
import { LiveDetector } from "@/components/lab/detector/live-detector";
import { SceneGenerator } from "@/components/lab/generator/scene-generator";
import { ScrollSequence } from "@/components/sequence/scroll-sequence";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LabPage({ params }: PageProps<"/[lang]/lab">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <>
      {/* A short lens-macro intro — the eye of the system — before the tools. */}
      <ScrollSequence id="optics" span={1.6}>
        <div className="flex h-full items-center px-5 md:px-10">
          <div className="mx-auto w-full max-w-[1400px]">
            <h1 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold uppercase tracking-tight text-bone">
              {dict.lab.title}
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
              {dict.lab.lead}
            </p>
          </div>
        </div>
      </ScrollSequence>

      <div className="mx-auto max-w-[1400px] px-5 pb-28 md:px-10">
        <div className="space-y-14 md:space-y-20">
          <LiveDetector dict={dict} />
          <SceneGenerator dict={dict} />
        </div>
      </div>
    </>
  );
}
