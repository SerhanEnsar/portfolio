// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { Locale } from "./locale";

/**
 * Interface strings only — page content lives in `site.ts` and `projects.ts`.
 * Labels name what the reader sees, in the register of an instrument panel:
 * short, declarative, no marketing voice.
 */
export const dictionaries = {
  en: {
    nav: {
      about: "About",
      capabilities: "Capabilities",
      work: "Work",
      roles: "Roles",
      contact: "Contact",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      scroll: "Scroll",
      status: "Competing at TEKNOFEST 2026",
    },
    sections: {
      about: "About",
      capabilities: "Capabilities",
      work: "Work",
      roles: "Roles",
      contact: "Contact",
    },
    work: {
      active: "Active",
      complete: "Complete",
      countLabel: "projects",
      open: "Open brief",
      /* {n} is substituted at render — dictionaries cross the server/client
         boundary, so every value here has to be serialisable. */
      team: "Team of {n}",
      solo: "Solo",
    },
    project: {
      back: "All work",
      brief: "Brief",
      contribution: "What I built",
      stack: "Stack",
      program: "Programme",
      role: "Role",
      team: "Team",
      period: "Period",
      next: "Next project",
    },
    contact: {
      heading: "Let's build something",
      body: "Open to work on robotics, computer vision and embedded systems. Deep in TEKNOFEST 2026 right now, but always reading messages.",
      email: "Email",
      cv: "Download CV",
    },
    footer: {
      rights: "All rights reserved.",
      built: "Built with Next.js",
    },
    a11y: {
      switchLanguage: "Switch language",
      sequenceLoading: "Loading scene",
    },
  },
  tr: {
    nav: {
      about: "Hakkımda",
      capabilities: "Yetkinlikler",
      work: "Projeler",
      roles: "Görevler",
      contact: "İletişim",
      menu: "Menü",
      close: "Kapat",
    },
    hero: {
      scroll: "Kaydır",
      status: "TEKNOFEST 2026'da yarışıyor",
    },
    sections: {
      about: "Hakkımda",
      capabilities: "Yetkinlikler",
      work: "Projeler",
      roles: "Görevler",
      contact: "İletişim",
    },
    work: {
      active: "Devam ediyor",
      complete: "Tamamlandı",
      countLabel: "proje",
      open: "Künyeyi aç",
      team: "{n} kişilik ekip",
      solo: "Tek kişi",
    },
    project: {
      back: "Tüm projeler",
      brief: "Künye",
      contribution: "Geliştirdiklerim",
      stack: "Teknolojiler",
      program: "Program",
      role: "Görev",
      team: "Ekip",
      period: "Dönem",
      next: "Sonraki proje",
    },
    contact: {
      heading: "Birlikte bir şey kuralım",
      body: "Robotik, görüntü işleme ve gömülü sistemler alanında çalışmaya açığım. Şu anda TEKNOFEST 2026'nın içindeyim ama mesajları hep okuyorum.",
      email: "E-posta",
      cv: "CV indir",
    },
    footer: {
      rights: "Tüm hakları saklıdır.",
      built: "Next.js ile geliştirildi",
    },
    a11y: {
      switchLanguage: "Dili değiştir",
      sequenceLoading: "Sahne yükleniyor",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

/** Renders the team-size label for a project. */
export function teamLabel(dict: Dictionary, size: number) {
  return size > 1 ? dict.work.team.replace("{n}", String(size)) : dict.work.solo;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
