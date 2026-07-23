// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { notFound } from "next/navigation";
import { isLocale } from "@/content/locale";
import { getDictionary } from "@/content/dictionaries";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Capabilities } from "@/components/sections/capabilities";
import { Work } from "@/components/sections/work";
import { Roles } from "@/components/sections/roles";
import { Internship } from "@/components/sections/internship";
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
      <Work locale={lang} dict={dict} />
      <Roles locale={lang} dict={dict} />
      <Internship locale={lang} dict={dict} />

      {/* Kept near the end, right before contact: an interactive close that
          lets the reader test the same 0.50 IoU threshold the metrics upstream
          were scored against, then reach out. */}
      <section className="border-t border-line bg-void px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1400px]">
          <div className="md:ml-[33.333%] md:w-[66.666%]">
            <DetectionChallenge dict={dict} />
          </div>
        </div>
      </section>

      <Contact dict={dict} />
    </>
  );
}
