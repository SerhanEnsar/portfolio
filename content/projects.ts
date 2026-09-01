// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import type { L10n } from "./locale";
import type { SequenceId } from "./sequences";

export type ProjectStatus = "active" | "complete" | "delivered";

/**
 * Somewhere the finished thing can actually be looked at. `kind` picks the
 * label, so a store listing and a live site do not both read "visit".
 */
export type ProjectLink = { href: string; kind: "site" };

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
  /** Where the shipped work lives, when it is public. */
  link?: ProjectLink;
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
    status: "complete",
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
      en: "Serhan captains a five-person team building a YOLOv11 aerial detection system. He owns the training pipeline on a dataset fusing VisDrone, UAVDT, Stanford Drone, DOTAv2 and the team's own UAP/UAI labels, plus a custom augmentation stage that injects Gaussian blur and synthetic dead pixels so the model meets sensor failure before the flight line does.",
      tr: "Serhan, YOLOv11 tabanlı bir havadan tespit sistemi kuran beş kişilik ekibin kaptanı. VisDrone, UAVDT, Stanford Drone, DOTAv2 ve ekibin kendi UAP/UAI etiketlerini birleştiren veri kümesi üzerindeki eğitim hattı ona ait. Buna, modelin sensör arızasıyla uçuş hattında değil eğitimde tanışması için Gaussian bulanıklık ve sentetik ölü piksel enjekte eden özel bir augmentation katmanı ekledi.",
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
    status: "complete",
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
      en: "The second TEKNOFEST 2026 Aviation AI team Serhan captains — five of them, running Task 2 of the category: holding a UAV's position when GPS is denied. He designed the visual-odometry pipeline that estimates the aircraft's 3D trajectory from the camera alone and tracks it frame by frame against ground truth, and built the tooling the team's data flows through — LabelForge, a labelling and dataset-management interface written from scratch, and JSONtoYOLO, a converter that turns mixed label exports into YOLO training data in seconds. The team cleared the Preliminary Design Report at 87.5 and completed the Online Competition Simulation round. Alongside the engineering he runs the team: task planning, milestones and cross-team coordination.",
      tr: "TEKNOFEST 2026 Havacılıkta Yapay Zekâ'da Serhan'ın kaptanı olduğu ikinci takım — beş kişiler, kategorinin 2. görevini yürütüyorlar: GPS kesildiğinde İHA'nın konumunu koruması. Aracın 3B yörüngesini yalnızca kameradan kestiren ve gerçek rotaya karşı kare kare izleyen görsel odometri hattını Serhan tasarladı; ekibin verisinin aktığı araçları da o geliştirdi — sıfırdan yazdığı etiketleme ve veri seti yönetim arayüzü LabelForge ve karışık etiket çıktılarını saniyeler içinde YOLO eğitim verisine çeviren JSONtoYOLO. Takım, Ön Tasarım Raporu'nu 87,5 ile geçip Çevrimiçi Yarışma Simülasyonu etabını tamamladı. Mühendisliğin yanında takımı da o yönetiyor: görev planı, kilometre taşları ve takımlar arası koordinasyon.",
    },
    work: {
      en: [
        "Visual-odometry pipeline estimating the UAV's 3D trajectory from the camera alone",
        "Trajectory tracked frame by frame against ground truth to score the localisation error",
        "LabelForge — a labelling and dataset-management GUI built from scratch to standardise QC on complex aerial data",
        "JSONtoYOLO — converts mixed JSON label exports straight into YOLO (.txt) format, cutting dataset turnaround to seconds",
        "System integration across five people, plus captaincy: task planning, milestones, cross-team coordination",
        "Cleared the Preliminary Design Report at 87.5, into the online simulation round",
      ],
      tr: [
        "Aracın 3B yörüngesini yalnızca kameradan kestiren görsel odometri hattı",
        "Konumlandırma hatasını ölçmek için gerçek rotaya karşı kare kare izlenen yörünge",
        "LabelForge — karmaşık hava verisinde kalite kontrolü standartlaştırmak için sıfırdan yazılan etiketleme ve veri seti yönetim arayüzü",
        "JSONtoYOLO — karışık JSON etiket çıktılarını doğrudan YOLO (.txt) formatına çeviren, veri hazırlığını saniyelere indiren dönüştürücü",
        "Beş kişilik ekipte sistem entegrasyonu ve kaptanlık: görev planı, kilometre taşları, takımlar arası koordinasyon",
        "Ön Tasarım Raporu'nu 87,5 ile geçip çevrimiçi simülasyon etabına yükselme",
      ],
    },
    stack: ["Python", "OpenCV", "YOLOv11", "CustomTkinter", "NumPy", "Matplotlib"],
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
    status: "complete",
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
      en: "Serhan is part of a thirteen-person multidisciplinary team building a 6×4 rocker-bogie UGV, owning the vehicle's software chain end to end: ODBARS NEXUS, the tactical ground control station; a dual-pipeline synthetic dataset generator that renders and labels its own training data; a built-in review tool for inspecting those labels before they reach the model; and the tracking stack that keeps detections stable while the vehicle itself is moving.",
      tr: "6×4 rocker-bogie bir İKA geliştiren on üç kişilik disiplinlerarası ekibin bir parçası olan Serhan, aracın yazılım zincirini uçtan uca üstleniyor: taktik yer kontrol istasyonu ODBARS NEXUS; kendi eğitim verisini render edip etiketleyen çift hatlı sentetik veri üreticisi; bu etiketleri modele gitmeden önce inceleten yerleşik bir kontrol aracı; ve araç hareket hâlindeyken tespitleri kararlı tutan takip yığını.",
    },
    work: {
      en: [
        "ODBARS NEXUS ground station in React, Vite and Electron with three MJPEG camera feeds",
        "Live telemetry — speed, battery, pitch and roll — beside a seven-mission task manager",
        "Synthetic dataset generator running two pipelines: Blender bpy in 3D, OpenCV in 2D",
        "Procedural 40×40 m terrain rendered through GPU Cycles at 1920×1080",
        "In-app dataset review — bounding-box inspection, class filtering and image/label match validation",
        "YOLOv8 with ByteTrack and custom global motion compensation for ego-motion",
      ],
      tr: [
        "React, Vite ve Electron ile üç MJPEG kamera akışlı ODBARS NEXUS yer istasyonu",
        "Hız, batarya, yunuslama ve yalpa telemetrisi ile yedi görevlik görev yöneticisi",
        "İki hat üzerinde çalışan sentetik veri üreteci: 3B tarafında Blender bpy, 2B tarafında OpenCV",
        "GPU Cycles ile 1920×1080 render edilen prosedürel 40×40 m arazi",
        "Uygulama içi veri seti kontrolü — kutu inceleme, sınıf filtreleme ve görüntü/etiket eşleşme doğrulaması",
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
    status: "complete",
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
      en: "Serhan leads embedded software and hardware-software optimisation on a five-person team. The firmware runs on a Deneyap Kart (ESP32, 240 MHz dual-core) and has to do two things at once: hold autonomous delivery alignment while still accepting manual RC control over iBUS.",
      tr: "Serhan, beş kişilik ekipte gömülü yazılım ve donanım-yazılım optimizasyonu sorumlusu. Firmware, Deneyap Kart (ESP32, 240 MHz çift çekirdek) üzerinde çalışıyor ve aynı anda iki işi birden yapmak zorunda: otonom teslimat hizalamasını korurken iBUS üzerinden manuel RC kontrolünü de kabul etmek.",
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
    slug: "unilate",
    codename: "UniLate",
    title: {
      en: "University Attendance & Grade Tracker",
      tr: "Üniversite Devamsızlık ve Not Takip Uygulaması",
    },
    domain: { en: "Mobile · Product", tr: "Mobil · Ürün" },
    status: "active",
    years: "2026",
    role: { en: "Solo Developer", tr: "Tek Geliştirici" },
    teamSize: 1,
    program: {
      en: "Google Play — closed testing",
      tr: "Google Play — kapalı test",
    },
    headline: {
      en: "The first one shipped to a store, not a jury",
      tr: "Jüriye değil, mağazaya çıkan ilk proje",
    },
    summary: {
      en: "An Android app for tracking university attendance, schedule and grades — the first thing Serhan built for a store rather than a competition. It is local-first by design: everything lives in on-device SQLite with no account and no server, and sessions are derived from the schedule rather than stored, so a term stays internally consistent after every edit. The home-screen widget is a native Android module he wrote himself and wired into Expo, and he took the app the whole way through Play Console — his own signing key, app bundle, store listing and a published privacy policy.",
      tr: "Üniversite devamsızlığını, ders programını ve notları takip eden bir Android uygulaması — Serhan'ın yarışma için değil, mağaza için yaptığı ilk iş. Tasarım gereği yerel-öncelikli: her şey cihazdaki SQLite'ta duruyor, hesap da sunucu da yok. Oturumlar saklanmıyor, programdan türetiliyor; böylece her düzenlemeden sonra dönem kendi içinde tutarlı kalıyor. Ana ekran widget'ı, kendi yazıp Expo'ya bağladığı yerel bir Android modülü. Uygulamayı Play Console sürecinin sonuna kadar da o götürdü — kendi imzalama anahtarı, app bundle, mağaza girişi ve yayımlanmış gizlilik politikası.",
    },
    work: {
      en: [
        "Expo SDK 57 and expo-router app in TypeScript, local-first on device SQLite — no account, no backend",
        "Pure-TypeScript domain layer (attendance, grading, schedule, timeline) that never touches React or SQLite, unit-tested with Vitest",
        "Sessions derived from the schedule instead of stored: one full recompute per change keeps the term consistent",
        "unilate-widget — an Android home-screen widget written as a custom native Expo module with its own provider, drawing and config screen",
        "Local notification scheduling on separate Android channels for reminders and the Pomodoro timer",
        "Full Play Console path: own upload key, signed app bundle, generated icon, splash and screenshot sets, hosted privacy policy",
        "Closed testing live — 12 testers on Google's 14-day requirement",
      ],
      tr: [
        "TypeScript ile Expo SDK 57 ve expo-router uygulaması; hesapsız, sunucusuz, cihaz içi SQLite üzerinde yerel-öncelikli",
        "React'i de SQLite'ı da görmeyen saf TypeScript alan katmanı (devamsızlık, notlandırma, program, geçmiş), Vitest ile birim testli",
        "Oturumların saklanmak yerine programdan türetilmesi: her değişiklikte tam yeniden hesap, dönem tutarlı kalıyor",
        "unilate-widget — kendi provider'ı, çizimi ve yapılandırma ekranıyla, yerel Expo modülü olarak yazılmış Android ana ekran widget'ı",
        "Hatırlatıcılar ve pomodoro sayacı için ayrı Android kanallarında yerel bildirim zamanlaması",
        "Uçtan uca Play Console süreci: kendi yükleme anahtarı, imzalı app bundle, üretilmiş ikon, açılış ekranı ve mağaza görselleri, yayımlanmış gizlilik politikası",
        "Kapalı test yayında — Google'ın 14 günlük şartında 12 testçi",
      ],
    },
    stack: [
      "TypeScript",
      "React Native",
      "Expo",
      "SQLite",
      "Kotlin",
      "Vitest",
      "Play Console",
    ],
    sequence: "unilate",
  },
  {
    slug: "stetoskop-akademi",
    codename: "STETOSKOP",
    title: {
      en: "Stetoskop Akademi — Brand Website",
      tr: "Stetoskop Akademi — Marka Sitesi",
    },
    domain: { en: "Web · Client work", tr: "Web · Müşteri işi" },
    status: "delivered",
    years: "2026",
    role: { en: "Freelance Developer", tr: "Freelance Geliştirici" },
    teamSize: 1,
    program: { en: "Client project", tr: "Müşteri projesi" },
    headline: {
      en: "Five pages, zero dependencies",
      tr: "Beş sayfa, sıfır bağımlılık",
    },
    summary: {
      en: "A five-page site for a tutoring brand whose entire teaching staff are medical students who placed nationally in their own entrance exam — Serhan's first build delivered to a paying client rather than a competition. Plain HTML, CSS and vanilla JS: no framework, no build step, no CDN. PHP does exactly two jobs, sending the contact form and reading the content folders. Fonts are served from the site's own server instead of Google, because pulling them would send every visitor's IP abroad — a cross-border transfer the brand's KVKK notice would then have to declare. Copy, prices and the twenty-three instructors live in plain text files the client edits without opening any code.",
      tr: "Kadrosunun tamamı, girdiği sınavda Türkiye derecesi yapmış tıp fakültesi öğrencilerinden oluşan bir özel ders markası için beş sayfalık site — Serhan'ın yarışmaya değil, ödeme yapan bir müşteriye teslim ettiği ilk iş. Saf HTML, CSS ve vanilla JS: çatı yok, derleme adımı yok, CDN yok. PHP yalnızca iki iş yapıyor: iletişim formunu göndermek ve içerik klasörlerini okumak. Yazı tipleri Google'dan değil sitenin kendi sunucusundan geliyor; aksi hâlde her ziyaretçinin IP'si yurt dışına gider ve markanın KVKK metninde beyan etmesi gereken bir aktarım doğardı. Metinler, fiyatlar ve yirmi üç eğitmen, müşterinin hiç kod açmadan düzenlediği düz metin dosyalarında duruyor.",
    },
    work: {
      en: [
        "Five real pages on real URLs — home, about, services, FAQ, contact — no JS routing, so every page is indexable and shareable",
        "Plain HTML, CSS and vanilla JS: no framework, no build step, no node_modules, no third-party library or CDN",
        "PHP kept to two jobs — SMTP delivery for the contact form, and reading the content and instructor folders into shared header/footer includes",
        "Self-hosted fonts replacing Google Fonts, removing a cross-border transfer of visitor IPs that KVKK would require declaring",
        "A content model non-developers can edit: copy and settings in one folder, each of the 23 instructors a .txt file plus a photo",
        "cPanel and FTP deployment, with the HTTPS redirect in .htaccess switched on once the certificate issues",
      ],
      tr: [
        "Gerçek URL'lerde beş gerçek sayfa — ana sayfa, hakkımızda, hizmetler, SSS, iletişim — JS yönlendirmesi yok, her sayfa indekslenebilir ve paylaşılabilir",
        "Saf HTML, CSS ve vanilla JS: çatı yok, derleme adımı yok, node_modules yok, üçüncü parti kütüphane veya CDN yok",
        "İki işle sınırlı PHP — iletişim formunun SMTP gönderimi ve içerik/eğitmen klasörlerinin ortak header/footer parçalarına okunması",
        "Google Fonts yerine kendi sunucusundan sunulan yazı tipleri; KVKK'da beyan gerektirecek yurt dışı IP aktarımı böylece ortadan kalktı",
        "Geliştirici olmayanın düzenleyebildiği içerik yapısı: metin ve ayarlar tek klasörde, 23 eğitmenin her biri bir .txt dosyası ve bir fotoğraf",
        "cPanel ve FTP ile yayın; sertifika çıktığında .htaccess içindeki HTTPS yönlendirmesinin açılması",
      ],
    },
    stack: ["HTML", "CSS", "JavaScript", "PHP", "SMTP", "cPanel"],
    sequence: "stetoskop",
    link: { href: "https://stetoskopakademi.com", kind: "site" },
  },
  {
    slug: "eye2s",
    codename: "Eye2S",
    title: {
      en: "Few-Shot AR Desktop Perception",
      tr: "Az Örnekle Öğrenen AR Masaüstü Algı Sistemi",
    },
    domain: { en: "Computer Vision · AR", tr: "Görüntü İşleme · AR" },
    status: "complete",
    years: "2026",
    role: { en: "Solo Developer", tr: "Tek Geliştirici" },
    teamSize: 1,
    program: { en: "Personal project", tr: "Kişisel proje" },
    headline: {
      en: "Learns a new object in six frames",
      tr: "Yeni bir nesneyi altı karede öğreniyor",
    },
    summary: {
      en: "A real-time augmented-reality perception system running on a MacBook's own camera. Where a detector normally has to be retrained to know a new object, Eye2S learns one from six frames held up to the lens: GrabCut isolates the object from the fingers holding it, and DINOv2 embeddings recognise it afterwards at instance level — not \"a pen\" but that particular pen. Hands are read as gestures rather than used to drive a cursor, and behaviour is attached to an object by dropping a Python file into a folder, hot-loaded without a restart.",
      tr: "MacBook'un kendi kamerası üzerinde çalışan, gerçek zamanlı bir artırılmış gerçeklik algı sistemi. Bir dedektörün yeni bir nesneyi tanıması normalde yeniden eğitim isterken Eye2S, kameraya tutulan altı kareden öğreniyor: GrabCut cismi onu tutan parmaklardan ayırıyor, DINOv2 gömüleri sonrasında onu örnek düzeyinde tanıyor — \"bir kalem\" değil, o kalem. Eller imleç sürmüyor, jest olarak okunuyor; bir nesneye davranış bağlamak ise bir klasöre Python dosyası bırakmaktan ibaret, yeniden başlatmadan canlı yükleniyor.",
    },
    work: {
      en: [
        "Few-shot object learning: six frames, GrabCut segmentation to cut the object out of the hand holding it, a named identity added at runtime",
        "Instance-level recognition on DINOv2 embeddings (fp16 on Apple MPS), with YOLOE visual-prompt detection so learned objects are found hands-free",
        "MediaPipe hand tracking and learned gestures — recorded over four takes, matched by a representation invariant to speed, position and distance",
        "Hot-reloading plugin system: drop a .py file in and it loads live; a faulty plugin is quarantined so the HUD never goes down with it",
        "Code-free automation rules — on sight of an object, run a shell command, AppleScript, Shortcut, app or webhook",
        "Identity arbitration so one physical object stays one detection: nested boxes merged, ties resolved by score, an unresolved label marked and excluded from automation",
        "Threaded render loop with Kalman-extrapolated boxes to keep the overlay smooth while inference runs behind it",
      ],
      tr: [
        "Az örnekle nesne öğrenme: altı kare, cismi onu tutan elden ayıran GrabCut segmentasyonu ve çalışma anında eklenen isimli bir kimlik",
        "DINOv2 gömüleri üzerinde örnek düzeyinde tanıma (Apple MPS'te fp16); öğrenilmiş nesnelerin elsiz de bulunması için YOLOE görsel-istem tespiti",
        "MediaPipe el takibi ve öğrenilen jestler — dört tekrarda kaydedilir, hızdan, konumdan ve uzaklıktan bağımsız bir temsille eşleştirilir",
        "Canlı yüklenen eklenti sistemi: bir .py dosyası bırakmak yeterli; bozuk eklenti karantinaya alınır, HUD onunla birlikte düşmez",
        "Kod yazmadan otomasyon kuralları — bir nesne görüldüğünde kabuk komutu, AppleScript, Kısayol, uygulama veya webhook çalıştırma",
        "Bir cismin tek tespit olarak kalmasını sağlayan kimlik hakemliği: iç içe kutuların birleştirilmesi, berabere kalan etiketin skorla çözülmesi, çözülemezse işaretlenip otomasyondan çıkarılması",
        "Çıkarım arkada koşarken kaplamanın akıcı kalması için Kalman ile ekstrapole edilen kutular ve ayrı iş parçacıklı render döngüsü",
      ],
    },
    stack: [
      "Python",
      "PyTorch",
      "DINOv2",
      "YOLOE",
      "MediaPipe",
      "OpenCV",
      "Apple MPS",
    ],
    sequence: "optics",
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
      en: "A smart home server on a Raspberry Pi 5 (16 GB) acting as hub for four client surfaces — an Android app, a Wear OS watch app, an ESP32-S3 wall panel and a Telegram bot. FastAPI handles async REST with JWT auth; Google Gemini 2.5 Flash turns voice and text into home control decisions.",
      tr: "Raspberry Pi 5 (16 GB) üzerinde çalışan, dört istemci yüzeyine — Android uygulaması, Wear OS saat uygulaması, ESP32-S3 duvar paneli ve Telegram botu — merkez görevi gören bir akıllı ev sunucusu. FastAPI, JWT kimlik doğrulamalı asenkron REST'i yürütüyor; Google Gemini 2.5 Flash ses ve metni ev kontrol kararlarına çeviriyor.",
    },
    work: {
      en: [
        "FastAPI backend with JWT auth, 20+ endpoints and CPU, RAM and disk monitoring",
        "Full file manager: upload, download, move, copy, rename, trash and preview",
        "Docker container management with a network status dashboard",
        "Google Gemini 2.5 Flash driving autonomous home control decisions",
        "Wear OS app in Kotlin and Jetpack Compose with bezel navigation and 3s refresh",
        "ESP32-S3 wall panel with a 2.4\" TFT touchscreen: file explorer, on-screen keyboard, trash and system controls",
        "Telegram bot exposing /status, /reboot, /shutdown, /ip and /disk",
      ],
      tr: [
        "JWT kimlik doğrulaması, 20+ uç nokta ve CPU, RAM, disk izleme sunan FastAPI arka ucu",
        "Tam dosya yöneticisi: yükleme, indirme, taşıma, kopyalama, yeniden adlandırma, çöp kutusu ve önizleme",
        "Ağ durumu paneliyle birlikte Docker konteyner yönetimi",
        "Otonom ev kontrol kararlarını yürüten Google Gemini 2.5 Flash entegrasyonu",
        "Kotlin ve Jetpack Compose ile, bezel navigasyonlu ve 3 sn yenilemeli Wear OS uygulaması",
        "2,4\" TFT dokunmatik ekranlı ESP32-S3 duvar paneli: dosya gezgini, ekran klavyesi, çöp kutusu ve sistem kontrolleri",
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
    sequence: "motor",
  },
];

/**
 * Folds a slug or codename to one comparable key: lowercase, accents stripped.
 * Turkish "İ" lowercases to "i̇" (i + combining dot) in a locale-aware fold, so
 * the NFD decomposition has to happen after `toLowerCase`, not before.
 */
function fold(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Resolves by slug *or* codename, ignoring case and accents — the console is a
 * place people type "LAÇİN" and "Eye2S", not URL segments. The route uses the
 * same lookup, so a codename in the address bar resolves too.
 */
export function getProject(query: string): Project | undefined {
  const key = fold(query);
  return projects.find((p) => fold(p.slug) === key || fold(p.codename) === key);
}

/** Status → the dictionary label for it, so no caller re-derives the mapping. */
export function statusLabel(
  status: ProjectStatus,
  dict: { work: { active: string; complete: string; delivered: string } },
): string {
  return dict.work[status];
}

export const activeCount = projects.filter((p) => p.status === "active").length;
export const completeCount = projects.filter((p) => p.status === "complete").length;
export const deliveredCount = projects.filter((p) => p.status === "delivered").length;
