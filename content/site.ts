// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { L10n } from "./locale";

export const profile = {
  name: "Serhan Ensar Büdün",
  /** Wraps onto two display lines in the hero. */
  nameLines: ["Serhan Ensar", "Büdün"],
  email: "serhanensar0@gmail.com",
  github: "https://github.com/SerhanEnsar",
  linkedin: "https://linkedin.com/in/serhan-ensar-budun/",
  location: { en: "İzmir, Türkiye", tr: "İzmir, Türkiye" } as L10n<string>,
  university: {
    en: "Ege University — Computer Engineering, 2024–2029",
    tr: "Ege Üniversitesi — Bilgisayar Mühendisliği, 2024–2029",
  } as L10n<string>,
  discipline: {
    en: "Computer vision · Embedded systems",
    tr: "Görüntü işleme · Gömülü sistemler",
  } as L10n<string>,
  /** CV is only linked when this file exists in public/. */
  cvPath: "/cv/serhan-ensar-budun-cv.pdf",
} as const;

/**
 * Numbers shown on the page must be real. Each one traces to something
 * verifiable in a project or role — no invented metrics.
 */
export const metrics = [
  {
    value: "0.655",
    label: { en: "mAP@50, LAÇİN", tr: "mAP@50, LAÇİN" } as L10n<string>,
  },
  {
    value: "116K",
    label: { en: "Labelled images", tr: "Etiketli görüntü" } as L10n<string>,
  },
  {
    value: "4",
    label: {
      en: "Concurrent TEKNOFEST teams",
      tr: "Eşzamanlı TEKNOFEST takımı",
    } as L10n<string>,
  },
  {
    value: "6",
    label: {
      en: "Sub-teams led at IEEE",
      tr: "IEEE'de yönetilen alt ekip",
    } as L10n<string>,
  },
];

export const about: L10n<string[]> = {
  en: [
    "I am a Computer Engineering student at Ege University in İzmir, working on AI-driven robotics, computer vision and embedded systems.",
    "Right now I captain two TEKNOFEST 2026 teams — LAÇİN and TUYGUN — and lead embedded work on two more. Four competition projects running at once.",
    "As Computer Society Chairperson at IEEE Ege University I lead six technical sub-teams and teach Arduino and embedded systems to other students.",
    "I build end to end: Deneyap firmware at one end, React and Electron ground stations packaged as standalone executables at the other.",
  ],
  tr: [
    "İzmir'de Ege Üniversitesi Bilgisayar Mühendisliği öğrencisiyim; yapay zekâ tabanlı robotik, görüntü işleme ve gömülü sistemler üzerine çalışıyorum.",
    "Şu anda iki TEKNOFEST 2026 takımının — LAÇİN ve TUYGUN — kaptanıyım, iki takımda daha gömülü tarafı yürütüyorum. Aynı anda dört yarışma projesi.",
    "IEEE Ege Üniversitesi'nde Computer Society Başkanı olarak altı teknik alt ekibi yönetiyor, diğer öğrencilere Arduino ve gömülü sistemler anlatıyorum.",
    "Uçtan uca geliştiriyorum: bir uçta Deneyap firmware'i, diğer uçta bağımsız çalıştırılabilir hâlde paketlenmiş React ve Electron yer istasyonları.",
  ],
};

export type SkillGroup = {
  id: string;
  title: L10n<string>;
  note: L10n<string>;
  /** Self-assessed depth, used for the bar width. Honest, not flattering. */
  depth: number;
  tools: string[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: "vision",
    title: { en: "Computer Vision", tr: "Görüntü İşleme" },
    note: {
      en: "Detection and tracking pipelines, from raw labels to a deployed model",
      tr: "Ham etiketten yayına alınmış modele kadar tespit ve takip hatları",
    },
    depth: 88,
    tools: ["YOLOv8 / v11", "ByteTrack", "SAHI", "OpenCV", "Roboflow", "GMC"],
  },
  {
    id: "python",
    title: { en: "Python & AI", tr: "Python ve Yapay Zekâ" },
    note: {
      en: "Training pipelines, data tooling, desktop GUIs and API layers",
      tr: "Eğitim hatları, veri araçları, masaüstü arayüzler ve API katmanları",
    },
    depth: 90,
    tools: ["Python", "FastAPI", "Flask", "CustomTkinter", "PyInstaller", "Blender bpy"],
  },
  {
    id: "embedded",
    title: { en: "Embedded & IoT", tr: "Gömülü Sistemler ve IoT" },
    note: {
      en: "Firmware where timing, sensors and radio links have to hold together",
      tr: "Zamanlama, sensörler ve telsiz bağlantısının birlikte tutması gereken firmware",
    },
    depth: 85,
    tools: ["C++", "ESP32", "Deneyap", "Arduino", "Raspberry Pi", "STM32", "IMU", "RFID", "LoRa"],
  },
  {
    id: "interfaces",
    title: { en: "Interfaces", tr: "Arayüzler" },
    note: {
      en: "Ground stations and dashboards that stay readable under load",
      tr: "Yük altında okunabilir kalan yer istasyonları ve paneller",
    },
    depth: 78,
    tools: ["React", "TypeScript", "Vite", "Electron", "Kotlin", "Jetpack Compose", "Nextion HMI"],
  },
];

export type Role = {
  org: string;
  title: L10n<string>;
  period: L10n<string>;
  points: L10n<string[]>;
};

export const roles: Role[] = [
  {
    org: "IEEE Ege University Student Branch",
    title: { en: "Computer Society Chairperson", tr: "Computer Society Başkanı" },
    period: { en: "Sept 2024 — present", tr: "Eylül 2024 — devam ediyor" },
    points: {
      en: [
        "Lead the Computer Society committee and its six technical sub-teams",
        "Designed and taught a five-week Arduino and circuit design course in C++",
        "Coordinated branch events and represented the university at CSCAMP and the Ege Regional Meeting",
      ],
      tr: [
        "Computer Society komitesini ve altı teknik alt ekibini yönetiyorum",
        "C++ ile beş haftalık Arduino ve devre tasarımı eğitimini tasarlayıp verdim",
        "Kol etkinliklerini koordine ettim; üniversiteyi CSCAMP ve Ege Bölgesel Toplantısı'nda temsil ettim",
      ],
    },
  },
  {
    org: "TEKNOFEST 2026",
    title: {
      en: "Team Captain ×2 · Embedded Lead ×2",
      tr: "Takım Kaptanı ×2 · Gömülü Sorumlusu ×2",
    },
    period: { en: "2025 — 2026", tr: "2025 — 2026" },
    points: {
      en: [
        "LAÇİN and TUYGUN — aerial AI systems: airborne detection and GPS-denied visual odometry",
        "EGE ODBARS — autonomous UGV, the ODBARS NEXUS ground station, synthetic dataset generation",
        "EGENODE — logistics robot, Deneyap firmware, RFID with IMU and a 4-DOF arm",
      ],
      tr: [
        "LAÇİN ve TUYGUN — havadan yapay zekâ sistemleri: havadan tespit ve GPS'siz görsel odometri",
        "EGE ODBARS — otonom İKA, ODBARS NEXUS yer istasyonu, sentetik veri üretimi",
        "EGENODE — lojistik robotu, Deneyap firmware'i, IMU ve 4 eksenli kolla RFID",
      ],
    },
  },
  {
    org: "IEEEXtreme · Google DevFest",
    title: { en: "Competitor · Attendee", tr: "Yarışmacı · Katılımcı" },
    period: { en: "2024 — 2025", tr: "2024 — 2025" },
    points: {
      en: [
        "IEEEXtreme — the global 24-hour algorithmic programming competition",
        "Google DevFest — sessions with industry engineers on emerging technology",
      ],
      tr: [
        "IEEEXtreme — küresel 24 saatlik algoritmik programlama yarışması",
        "Google DevFest — sektör mühendisleriyle yeni teknolojiler üzerine oturumlar",
      ],
    },
  },
];
