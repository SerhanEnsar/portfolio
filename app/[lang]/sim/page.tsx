// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { notFound } from "next/navigation";
import { locales, isLocale } from "@/content/locale";
import { getDictionary } from "@/content/dictionaries";
import { RoverSim } from "@/components/sim/rover-sim";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function SimPage({ params }: PageProps<"/[lang]/sim">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = getDictionary(lang);

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-28 pt-36 md:px-10 md:pt-44">
      <h1 className="font-display text-[clamp(2.4rem,7vw,4.5rem)] font-extrabold uppercase tracking-tight text-bone">
        {dict.sim.title}
      </h1>
      <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
        {dict.sim.lead}
      </p>

      <div className="mt-14 md:mt-20">
        <RoverSim dict={dict} />
      </div>
    </div>
  );
}
