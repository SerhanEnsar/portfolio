// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { notFound } from "next/navigation";
import { locales, isLocale } from "@/content/locale";
import { OrtSpike } from "@/components/lab/ort-spike";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LabPage({ params }: PageProps<"/[lang]/lab">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-5 pb-24 pt-40 md:px-10">
      <h1 className="font-display text-[clamp(2.4rem,6vw,4rem)] font-extrabold tracking-tight text-bone">
        Lab
      </h1>
      <p className="mt-4 max-w-xl text-sm text-dim">
        Instrument bay. Currently running the F0 inference benchmark — the live
        detector and scene generator land here next.
      </p>
      <div className="mt-12">
        <OrtSpike />
      </div>
    </div>
  );
}
