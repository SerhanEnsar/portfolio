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
    boot: {
      lines: [
        "sensor array",
        "detection model",
        "telemetry link",
        "mission archive",
      ],
      ok: "ok",
      skip: "press any key to skip",
    },
    hud: {
      title: "Mission progress",
      open: "Open mission log",
      close: "Close",
      sections: "Sections",
      briefs: "Project briefs",
      instruments: "Instruments",
      complete: "Debrief complete — you have seen everything.",
      reset: "Reset progress",
    },
    challenge: {
      eyebrow: "Try it",
      title: "Can you beat the model?",
      intro:
        "Drag a box around the vehicle. These frames are synthetic, so the correct box is known exactly — the same reason I generate training data rather than only collecting it.",
      start: "Start",
      round: "Round {n} of {total}",
      prompt: "Drag a box around the vehicle",
      yours: "You",
      truth: "Ground truth",
      iou: "IoU",
      next: "Next frame",
      finish: "See result",
      again: "Play again",
      resultTitle: "Mean IoU {score}",
      hit: "counts as a detection",
      miss: "below the threshold",
      explain:
        "A detection counts at IoU ≥ 0.50. That threshold is what the 50 in mAP@50 means — the 0.655 on this page is scored the same way, across 116K images.",
      skip: "Skip",
    },
    console: {
      open: "Open console",
      title: "Console",
      hint: "Type help. Esc closes.",
      placeholder: "command",
      unknown: "command not found: {cmd}",
      help: "Available commands",
      cleared: "cleared",
      noSuchProject: "no such project: {slug}",
      switched: "language switched",
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
    boot: {
      lines: [
        "sensör dizisi",
        "tespit modeli",
        "telemetri bağlantısı",
        "görev arşivi",
      ],
      ok: "hazır",
      skip: "geçmek için bir tuşa bas",
    },
    hud: {
      title: "Görev ilerlemesi",
      open: "Görev kaydını aç",
      close: "Kapat",
      sections: "Bölümler",
      briefs: "Proje künyeleri",
      instruments: "Enstrümanlar",
      complete: "Debrief tamam — her şeyi gördün.",
      reset: "İlerlemeyi sıfırla",
    },
    challenge: {
      eyebrow: "Dene",
      title: "Modeli yenebilir misin?",
      intro:
        "Aracın etrafına bir kutu sürükle. Bu kareler sentetik, yani doğru kutu tam olarak biliniyor — eğitim verisini yalnızca toplamak yerine üretmemin sebebi de bu.",
      start: "Başla",
      round: "Tur {n} / {total}",
      prompt: "Aracın etrafına kutu sürükle",
      yours: "Sen",
      truth: "Doğru kutu",
      iou: "IoU",
      next: "Sonraki kare",
      finish: "Sonucu gör",
      again: "Tekrar oyna",
      resultTitle: "Ortalama IoU {score}",
      hit: "tespit sayılır",
      miss: "eşiğin altında",
      explain:
        "Bir tespit IoU ≥ 0.50'de sayılır. mAP@50'deki 50 tam olarak bu eşik — bu sayfadaki 0.655 de 116 bin görüntüde aynı şekilde hesaplandı.",
      skip: "Geç",
    },
    console: {
      open: "Konsolu aç",
      title: "Konsol",
      hint: "help yaz. Esc kapatır.",
      placeholder: "komut",
      unknown: "komut bulunamadı: {cmd}",
      help: "Kullanılabilir komutlar",
      cleared: "temizlendi",
      noSuchProject: "böyle bir proje yok: {slug}",
      switched: "dil değiştirildi",
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
