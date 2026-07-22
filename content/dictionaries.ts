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
      lab: "Lab",
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
    lab: {
      title: "Lab",
      lead: "Instruments, not screenshots. Everything here runs in your browser — no server does any of the work, and nothing loads until you switch it on.",
      detector: {
        eyebrow: "Instrument 01",
        title: "Live detection",
        activate: "Activate sensor",
        useFile: "Use a photo or clip",
        loading: "Loading model…",
        stop: "Stop sensor",
        denied:
          "No camera available here. Pick a photo or a clip instead — it runs on exactly the same code path.",
        unsupported:
          "This browser can't run the detector: it needs Web Workers and OffscreenCanvas.",
        failed: "The detector stopped:",
        statInference: "Inference",
        statFps: "Frames / s",
        statObjects: "Tracks",
        statBackend: "Backend",
        privacy:
          "Frames never leave this device. No upload, no recording, no server.",
        model:
          "{model} ({licence}) at {size}×{size}, executing on WebAssembly in a worker so the page never stalls. The class list and input size live in one config file, so my own trained weights can replace it without touching anything else.",
      },
      generator: {
        eyebrow: "Instrument 02",
        title: "Synthetic scene generator",
        lead: "Most of what LAÇİN learned from was composed, not filmed. Compose a frame here and take it with you — the image, and the labels that belong to it.",
        altitude: "Altitude",
        timeOfDay: "Time of day",
        haze: "Haze",
        noise: "Sensor noise",
        deadPixels: "Dead pixels",
        targets: "Vehicles",
        eo: "EO",
        ir: "IR",
        notApplicable: "n/a",
        seed: "Seed {seed}",
        newSeed: "New seed",
        showTruth: "Show labels",
        saveImage: "Download PNG",
        saveLabels: "Download labels",
        note: "Labels export in YOLO format — one line per object, class and box normalised to the frame. Because the scene is composed, those boxes are where the vehicles were placed, not an estimate of where they ended up. That is the whole argument for generating training data: the hard cases are something you ask for, and the truth comes free.",
      },
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
      lab: "Laboratuvar",
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
    lab: {
      title: "Laboratuvar",
      lead: "Ekran görüntüsü değil, çalışan aletler. Buradaki her şey senin tarayıcında koşuyor — hiçbir işi sunucu yapmıyor ve sen açmadan hiçbir şey inmiyor.",
      detector: {
        eyebrow: "Alet 01",
        title: "Canlı tespit",
        activate: "Sensörü etkinleştir",
        useFile: "Fotoğraf ya da klip kullan",
        loading: "Model yükleniyor…",
        stop: "Sensörü durdur",
        denied:
          "Burada kamera yok. Bunun yerine bir fotoğraf ya da klip seç — tam olarak aynı kod yolundan geçiyor.",
        unsupported:
          "Bu tarayıcı dedektörü çalıştıramıyor: Web Worker ve OffscreenCanvas gerekiyor.",
        failed: "Dedektör durdu:",
        statInference: "Çıkarım",
        statFps: "Kare / sn",
        statObjects: "İz",
        statBackend: "Arka uç",
        privacy:
          "Kareler bu cihazdan hiç çıkmıyor. Yükleme yok, kayıt yok, sunucu yok.",
        model:
          "{model} ({licence}), {size}×{size} girdiyle ve bir worker içinde WebAssembly üzerinde koşuyor; böylece sayfa hiç takılmıyor. Sınıf listesi ve girdi boyutu tek bir yapılandırma dosyasında, yani kendi eğittiğim ağırlıklar başka hiçbir yere dokunmadan yerine geçebiliyor.",
      },
      generator: {
        eyebrow: "Alet 02",
        title: "Sentetik sahne üreteci",
        lead: "LAÇİN'in öğrendiği karelerin çoğu çekilmedi, kuruldu. Burada bir kare kur ve yanında götür — hem görüntüyü hem de ona ait etiketleri.",
        altitude: "İrtifa",
        timeOfDay: "Günün saati",
        haze: "Pus",
        noise: "Sensör gürültüsü",
        deadPixels: "Ölü piksel",
        targets: "Araç",
        eo: "EO",
        ir: "IR",
        notApplicable: "yok",
        seed: "Tohum {seed}",
        newSeed: "Yeni tohum",
        showTruth: "Etiketleri göster",
        saveImage: "PNG indir",
        saveLabels: "Etiketleri indir",
        note: "Etiketler YOLO formatında iniyor — her nesne için bir satır, sınıf ve kutu kareye göre normalize. Sahne kurulduğu için o kutular araçların konduğu yer; nereye düştüklerine dair bir tahmin değil. Eğitim verisi üretmenin bütün gerekçesi bu: zor durumları isteyerek elde ediyorsun, doğru etiket de üstüne bedava geliyor.",
      },
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

/**
 * Substitutes `{placeholder}` tokens in a dictionary string.
 * Dictionary values have to stay serialisable to cross the server/client
 * boundary, so interpolation happens here rather than in the strings.
 */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}

/** Renders the team-size label for a project. */
export function teamLabel(dict: Dictionary, size: number) {
  return size > 1 ? dict.work.team.replace("{n}", String(size)) : dict.work.solo;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
