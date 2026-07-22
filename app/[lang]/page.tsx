// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { notFound } from "next/navigation";
import { isLocale } from "@/content/locale";
import { getDictionary } from "@/content/dictionaries";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Capabilities } from "@/components/sections/capabilities";
import { Work } from "@/components/sections/work";
import { Roles } from "@/components/sections/roles";
import { Contact } from "@/components/sections/contact";
import { DetectionChallenge } from "@/components/challenge/detection-challenge";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <>
      <Hero locale={lang} dict={dict} />
      <About locale={lang} dict={dict} />
      <Capabilities locale={lang} dict={dict} />

      {/* Sits directly after the capability claims and before the projects
          that back them, so "mAP@50 = 0.655" is legible by the time it is
          read as a headline. */}
      <section className="border-t border-line bg-void px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="md:ml-[33.333%] md:w-[66.666%]">
            <DetectionChallenge dict={dict} />
          </div>
        </div>
      </section>

      <Work locale={lang} dict={dict} />
      <Roles locale={lang} dict={dict} />
      <Contact dict={dict} />
    </>
  );
}
