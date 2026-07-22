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
      <Contact dict={dict} />
    </>
  );
}
