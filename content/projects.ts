// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { L10n } from "./locale";
import type { SequenceId } from "./sequences";

export type ProjectStatus = "active" | "complete";

export type Project = {
  /** URL segment for /[lang]/projects/[slug] */
  slug: string;
  /** Team/project codename — never translated. */
  codename: string;
  title: L10n<string>;
  domain: L10n<string>;
  status: ProjectStatus;
  years: string;
  role: L10n<string>;
  teamSize: number;
  program: L10n<string>;
  /** The one number or fact worth reading if nothing else is. */
  headline: L10n<string>;
  summary: L10n<string>;
  work: L10n<string[]>;
  stack: string[];
  /** Scene that plays behind this project's detail page, if any. */
  sequence?: SequenceId;
};

export const projects: Project[] = [
  {
    slug: "lacin",
    codename: "LAÇİN",
    title: {
      en: "Aerial AI Object Detection System",
      tr: "Havadan Yapay Zekâ ile Nesne Tespit Sistemi",
    },
    domain: { en: "AI · Aviation", tr: "Yapay Zekâ · Havacılık" },
    status: "active",
    years: "2025–2026",
    role: { en: "Team Captain", tr: "Takım Kaptanı" },
    teamSize: 5,
    program: {
      en: "TEKNOFEST 2026 — AI in Aviation",
      tr: "TEKNOFEST 2026 — Havacılıkta Yapay Zekâ",
    },
    headline: {
      en: "mAP@50 = 0.655 across 116K images",
      tr: "116 bin görüntüde mAP@50 = 0.655",
    },
    summary: {
      en: "Leading a five-person team building a YOLOv11 aerial detection system. I own the training pipeline on a dataset fusing VisDrone, UAVDT, Stanford Drone, DOTAv2 and our own UAP/UAI labels, plus a custom augmentation stage that injects Gaussian blur and synthetic dead pixels so the model meets sensor failure before the flight line does.",
      tr: "YOLOv11 tabanlı bir havadan tespit sistemi kuran beş kişilik ekibi yönetiyorum. VisDrone, UAVDT, Stanford Drone, DOTAv2 ve kendi UAP/UAI etiketlerimizi birleştiren veri kümesi üzerindeki eğitim hattı bana ait. Buna, modelin sensör arızasıyla uçuş hattında değil eğitimde tanışması için Gaussian bulanıklık ve sentetik ölü piksel enjekte eden özel bir augmentation katmanı ekledim.",
    },
    work: {
      en: [
        "YOLOv11 training pipeline over a 116K-image dataset, reaching mAP@50 = 0.655",
        "Custom augmentation stage: Gaussian blur plus synthetic dead pixels",
        "Data augmentation and label visualizer GUI in CustomTkinter and OpenCV",
        "JSONtoYOLO converter mapping Supervisely exports into YOLOv11 structure",
        "JSON API server layer the rest of the team integrates against",
      ],
      tr: [
        "116 bin görüntülük veri kümesi üzerinde YOLOv11 eğitim hattı, mAP@50 = 0.655",
        "Özel augmentation katmanı: Gaussian bulanıklık ve sentetik ölü piksel",
        "CustomTkinter ve OpenCV ile veri artırma ve etiket görselleştirme arayüzü",
        "Supervisely çıktılarını YOLOv11 yapısına çeviren JSONtoYOLO dönüştürücü",
        "Ekibin geri kalanının entegre olduğu JSON API sunucu katmanı",
      ],
    },
    stack: ["YOLOv11", "Python", "OpenCV", "SAHI", "CustomTkinter", "PyInstaller"],
    sequence: "aerial",
  },
  {
    slug: "tuygun",
    codename: "TUYGUN",
    title: { en: "Aerial AI System", tr: "Havadan Yapay Zekâ Sistemi" },
    domain: { en: "AI · Aviation", tr: "Yapay Zekâ · Havacılık" },
    status: "active",
    years: "2025–2026",
    role: {
      en: "Team Captain · Systems Integration",
      tr: "Takım Kaptanı · Sistem Entegrasyonu",
    },
    teamSize: 5,
    program: {
      en: "TEKNOFEST 2026 — AI in Aviation",
      tr: "TEKNOFEST 2026 — Havacılıkta Yapay Zekâ",
    },
    headline: {
      en: "Visual odometry for when GPS drops out",
      tr: "GPS kesildiğinde görsel odometri",
    },
    summary: {
      en: "The second TEKNOFEST 2026 Aviation AI team I captain, five of us. Its mission is Task 2 of the category — keeping a UAV localised when GPS is denied — solved with a visual-odometry pipeline that estimates the aircraft's 3D trajectory from the camera alone, tracked frame by frame against ground truth. We cleared the Preliminary Design Report at 87.5 and completed the Online Competition Simulation round. I run the team and own system integration, fusing detection, position estimation and odometry into one pipeline.",
      tr: "TEKNOFEST 2026 Havacılıkta Yapay Zekâ'da kaptanı olduğum ikinci takım, beş kişiyiz. Görevimiz kategorinin 2. görevi: GPS kesildiğinde İHA'nın konumunu koruması — bunu yalnızca kameradan aracın 3B yörüngesini kestiren, gerçek rotaya karşı kare kare izlenen bir görsel odometri hattıyla çözüyoruz. Ön Tasarım Raporu'nu 87,5 ile geçip Çevrimiçi Yarışma Simülasyonu etabını tamamladık. Takımı yönetiyor ve sistem entegrasyonunu üstleniyorum; tespit, pozisyon kestirimi ve odometriyi tek hatta birleştiriyorum.",
    },
    work: {
      en: [
        "Task 2: sustain UAV localisation through GPS loss with camera-only visual odometry",
        "3D trajectory estimation tracked against ground truth, frame by frame",
        "Object detection and reference-object matching feeding the position estimate",
        "System integration across five people — detection, position estimation and odometry into one pipeline",
        "Cleared the Preliminary Design Report at 87.5, into the online simulation round",
      ],
      tr: [
        "2. görev: GPS kaybında İHA konumunu yalnızca kamerayla, görsel odometriyle sürdürmek",
        "Gerçek rotaya karşı kare kare izlenen 3B yörünge kestirimi",
        "Pozisyon kestirimini besleyen nesne tespiti ve referans obje eşleme",
        "Beş kişilik ekipte sistem entegrasyonu — tespit, pozisyon kestirimi ve odometriyi tek hatta birleştirme",
        "Ön Tasarım Raporu'nu 87,5 ile geçip çevrimiçi simülasyon etabına yükselme",
      ],
    },
    stack: ["Python", "OpenCV", "YOLOv11", "NumPy", "Matplotlib"],
    sequence: "thermal",
  },
  {
    slug: "ege-odbars",
    codename: "EGE ODBARS",
    title: {
      en: "Autonomous Unmanned Ground Vehicle",
      tr: "Otonom İnsansız Kara Aracı",
    },
    domain: { en: "Robotics · UGV", tr: "Robotik · İKA" },
    status: "active",
    years: "2025–2026",
    role: {
      en: "Embedded Software & Computer Vision",
      tr: "Gömülü Yazılım ve Görüntü İşleme",
    },
    teamSize: 13,
    program: {
      en: "TEKNOFEST 2026 — Unmanned Ground Vehicle",
      tr: "TEKNOFEST 2026 — İnsansız Kara Aracı",
    },
    headline: {
      en: "6×4 rocker-bogie platform with a live ground station",
      tr: "Canlı yer istasyonlu 6×4 rocker-bogie platform",
    },
    summary: {
      en: "Part of a thirteen-person multidisciplinary team building a 6×4 rocker-bogie UGV. I built ODBARS NEXUS — the ground control station — along with a dual-pipeline synthetic dataset generator and the tracking stack that keeps detections stable while the vehicle itself is moving.",
      tr: "6×4 rocker-bogie bir İKA geliştiren on üç kişilik disiplinlerarası ekibin parçasıyım. Yer kontrol istasyonu ODBARS NEXUS'u, çift hatlı sentetik veri kümesi üreticisini ve araç hareket hâlindeyken tespitleri kararlı tutan takip yığınını geliştirdim.",
    },
    work: {
      en: [
        "ODBARS NEXUS ground station in React, Vite and Electron with three MJPEG camera feeds",
        "Live telemetry — speed, battery, pitch and roll — beside a seven-mission task manager",
        "Synthetic dataset generator running two pipelines: Blender bpy in 3D, OpenCV in 2D",
        "Procedural 40×40 m terrain rendered through GPU Cycles at 1920×1080",
        "YOLOv8 with ByteTrack and custom global motion compensation for ego-motion",
      ],
      tr: [
        "React, Vite ve Electron ile üç MJPEG kamera akışlı ODBARS NEXUS yer istasyonu",
        "Hız, batarya, yunuslama ve yalpa telemetrisi ile yedi görevlik görev yöneticisi",
        "İki hat üzerinde çalışan sentetik veri üreteci: 3B tarafında Blender bpy, 2B tarafında OpenCV",
        "GPU Cycles ile 1920×1080 render edilen prosedürel 40×40 m arazi",
        "Ego-hareket telafisi için YOLOv8, ByteTrack ve özel global hareket dengeleme",
      ],
    },
    stack: [
      "React",
      "Vite",
      "Electron",
      "YOLOv8",
      "ByteTrack",
      "Blender bpy",
      "OpenCV",
      "Python",
    ],
    sequence: "terrain",
  },
  {
    slug: "egenode",
    codename: "EGENODE",
    title: {
      en: "Dynamic Logistics Mobile Robot",
      tr: "Dinamik Lojistik Mobil Robotu",
    },
    domain: { en: "Embedded · Robotics", tr: "Gömülü Sistemler · Robotik" },
    status: "active",
    years: "2025–2026",
    role: {
      en: "Embedded Software & HW-SW Lead",
      tr: "Gömülü Yazılım ve Donanım-Yazılım Sorumlusu",
    },
    teamSize: 5,
    program: { en: "TEKNOFEST 2026 — Robolig", tr: "TEKNOFEST 2026 — Robolig" },
    headline: {
      en: "RFID, IMU and a 4-DOF arm on one 240 MHz dual-core",
      tr: "Tek 240 MHz çift çekirdek üzerinde RFID, IMU ve 4 eksenli kol",
    },
    summary: {
      en: "Embedded software and hardware-software optimisation lead on a five-person team. The firmware runs on a Deneyap Kart (ESP32, 240 MHz dual-core) and has to do two things at once: hold autonomous delivery alignment while still accepting manual RC control over iBUS.",
      tr: "Beş kişilik ekipte gömülü yazılım ve donanım-yazılım optimizasyonu sorumlusuyum. Firmware, Deneyap Kart (ESP32, 240 MHz çift çekirdek) üzerinde çalışıyor ve aynı anda iki işi birden yapmak zorunda: otonom teslimat hizalamasını korurken iBUS üzerinden manuel RC kontrolünü de kabul etmek.",
    },
    work: {
      en: [
        "Deneyap Kart firmware with multitasking across a 240 MHz dual-core",
        "RFID parcel verification over SPI alongside an LSM6DSM six-axis IMU",
        "Four-DOF robotic arm driving six servos into a cage end-effector",
        "H-bridge DC motor drivers with iBUS RC over 2.4 GHz",
        "Mission flow: RFID pickup, safe carry, autonomous delivery, zipline handoff",
      ],
      tr: [
        "240 MHz çift çekirdek üzerinde çoklu görev yürüten Deneyap Kart firmware'i",
        "SPI üzerinden RFID kargo doğrulaması ve LSM6DSM altı eksen IMU",
        "Altı servo ile kafes uç işlevcisini süren 4 eksenli robot kol",
        "H-köprü DC motor sürücüleri ve 2.4 GHz üzerinden iBUS RC",
        "Görev akışı: RFID ile alım, güvenli taşıma, otonom teslimat, zipline aktarımı",
      ],
    },
    stack: ["C++", "ESP32", "Deneyap", "RFID", "IMU", "Arduino", "iBUS"],
    sequence: "logistics",
  },
  {
    slug: "homeagent",
    codename: "HomeAgent",
    title: {
      en: "AI-Powered Smart Home Ecosystem",
      tr: "Yapay Zekâ Destekli Akıllı Ev Ekosistemi",
    },
    domain: { en: "IoT · AI · Full-stack", tr: "IoT · Yapay Zekâ · Full-stack" },
    status: "complete",
    years: "2025",
    role: { en: "Solo Developer", tr: "Tek Geliştirici" },
    teamSize: 1,
    program: { en: "Personal project", tr: "Kişisel proje" },
    headline: {
      en: "One Raspberry Pi hub, four client surfaces",
      tr: "Tek Raspberry Pi merkez, dört istemci yüzeyi",
    },
    summary: {
      en: "A smart home server on a Raspberry Pi acting as hub for Android, Wear OS, an ESP32 touch panel and a Telegram bot. FastAPI handles async REST with JWT auth; Google Gemini turns voice and text into home control decisions.",
      tr: "Android, Wear OS, ESP32 dokunmatik panel ve Telegram botu için merkez görevi gören, Raspberry Pi üzerinde çalışan bir akıllı ev sunucusu. FastAPI, JWT kimlik doğrulamalı asenkron REST'i yürütüyor; Google Gemini ses ve metni ev kontrol kararlarına çeviriyor.",
    },
    work: {
      en: [
        "FastAPI backend with JWT auth, 20+ endpoints and CPU, RAM and disk monitoring",
        "Full file manager: upload, download, move, copy, rename, trash and preview",
        "Docker container management with a network status dashboard",
        "Google Gemini driving autonomous home control decisions",
        "Wear OS app in Kotlin and Jetpack Compose with bezel navigation and 3s refresh",
        "ESP32 with an ILI9341 TFT touchscreen menu over WiFi",
        "Telegram bot exposing /status, /reboot, /shutdown, /ip and /disk",
      ],
      tr: [
        "JWT kimlik doğrulaması, 20+ uç nokta ve CPU, RAM, disk izleme sunan FastAPI arka ucu",
        "Tam dosya yöneticisi: yükleme, indirme, taşıma, kopyalama, yeniden adlandırma, çöp kutusu ve önizleme",
        "Ağ durumu paneliyle birlikte Docker konteyner yönetimi",
        "Otonom ev kontrol kararlarını yürüten Google Gemini entegrasyonu",
        "Kotlin ve Jetpack Compose ile, bezel navigasyonlu ve 3 sn yenilemeli Wear OS uygulaması",
        "WiFi üzerinden ILI9341 TFT dokunmatik menü sunan ESP32",
        "/status, /reboot, /shutdown, /ip ve /disk komutlu Telegram botu",
      ],
    },
    stack: [
      "Python",
      "FastAPI",
      "Kotlin",
      "Jetpack Compose",
      "C++",
      "ESP32",
      "Gemini",
      "Raspberry Pi",
    ],
    sequence: "desk",
  },
  {
    slug: "telemetry",
    codename: "TELEMETRY",
    title: { en: "Smart Telemetry System", tr: "Akıllı Telemetri Sistemi" },
    domain: { en: "Embedded · IoT", tr: "Gömülü Sistemler · IoT" },
    status: "complete",
    years: "2025",
    role: { en: "Solo Developer", tr: "Tek Geliştirici" },
    teamSize: 1,
    program: { en: "Personal project", tr: "Kişisel proje" },
    headline: {
      en: "Wear OS to ESP32 to Nextion HMI at 1 Hz",
      tr: "1 Hz'te Wear OS'tan ESP32'ye, oradan Nextion HMI'ya",
    },
    summary: {
      en: "A telemetry pipeline streaming heart rate, SpO2, accelerometer and gyroscope data at 1 Hz from a Wear OS watch over HTTP/JSON to an ESP32, which drives a live browser dashboard and a Nextion TFT with gauges and IMU waveforms simultaneously.",
      tr: "Wear OS saatinden HTTP/JSON üzerinden ESP32'ye 1 Hz'te nabız, SpO2, ivmeölçer ve jiroskop verisi akıtan bir telemetri hattı. ESP32 aynı anda hem canlı tarayıcı panelini hem de göstergeler ve IMU dalga formları taşıyan Nextion TFT ekranı sürüyor.",
    },
    work: {
      en: [
        "1 Hz biometric stream: heart rate, SpO2, accelerometer, gyroscope",
        "Wear OS to ESP32 transport over HTTP/JSON",
        "Live browser dashboard with CSV log download",
        "Nextion TFT rendering visual gauges and IMU waveform graphs",
      ],
      tr: [
        "1 Hz biyometrik akış: nabız, SpO2, ivmeölçer, jiroskop",
        "HTTP/JSON üzerinden Wear OS'tan ESP32'ye aktarım",
        "CSV kayıt indirmeli canlı tarayıcı paneli",
        "Görsel göstergeler ve IMU dalga formu grafikleri çizen Nextion TFT",
      ],
    },
    stack: ["Kotlin", "C++", "ESP32", "Wear OS", "Nextion HMI", "HTTP/JSON"],
    sequence: "desk",
  },
  {
    slug: "tubitak",
    codename: "TÜBİTAK",
    title: { en: "Electric Motor Innovation", tr: "Elektrik Motoru İnovasyonu" },
    domain: { en: "R&D · Electromechanics", tr: "Ar-Ge · Elektromekanik" },
    status: "complete",
    years: "2019",
    role: { en: "Co-Researcher", tr: "Ortak Araştırmacı" },
    teamSize: 2,
    program: { en: "TÜBİTAK R&D project", tr: "TÜBİTAK Ar-Ge projesi" },
    headline: {
      en: "The first project — motor efficiency, age 14",
      tr: "İlk proje — 14 yaşında motor verimliliği",
    },
    summary: {
      en: "A two-person R&D project analysing electric motor efficiency and dynamic force development through comparative experiments. The starting point for everything after it.",
      tr: "Karşılaştırmalı deneylerle elektrik motoru verimliliğini ve dinamik kuvvet gelişimini inceleyen iki kişilik bir Ar-Ge projesi. Sonrasında gelen her şeyin başlangıç noktası.",
    },
    work: {
      en: [
        "Comparative experiments on motor efficiency",
        "Dynamic force development analysis",
        "Optimisation of foundational motor mechanics",
      ],
      tr: [
        "Motor verimliliği üzerine karşılaştırmalı deneyler",
        "Dinamik kuvvet gelişimi analizi",
        "Temel motor mekaniğinin optimizasyonu",
      ],
    },
    stack: ["Electromechanics", "R&D", "Experimental Design"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const activeCount = projects.filter((p) => p.status === "active").length;
export const completeCount = projects.filter((p) => p.status === "complete").length;
