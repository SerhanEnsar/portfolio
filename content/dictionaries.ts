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
      sim: "Sim",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      scroll: "Scroll",
      status: "4 TEKNOFEST teams · 2 as captain",
    },
    sections: {
      about: "About",
      capabilities: "Capabilities",
      work: "Work",
      roles: "Roles",
      contact: "Contact",
    },
    credentials: {
      internship: "Internship",
      pipeline: "The pipeline",
      certifications: "Certifications",
    },
    capability: {
      appliedIn: "Applied in",
    },
    work: {
      active: "Active",
      complete: "Complete",
      delivered: "Delivered · Sold",
      deliveredShort: "Sold",
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
      contribution: "What he built",
      stack: "Stack",
      program: "Programme",
      role: "Role",
      team: "Team",
      period: "Period",
      next: "Next project",
      credentials: "Details",
      visit: { site: "Visit the site" },
    },
    contact: {
      heading: "Let's build something",
      body: "Serhan is open to work on robotics, computer vision and embedded systems. Four TEKNOFEST campaigns are behind him and the work has moved to products that ship — he is always reading messages.",
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
        "Drag a box around the vehicle. These frames are synthetic, so the correct box is known exactly — the same reason Serhan generates training data rather than only collecting it.",
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
    vo: {
      eyebrow: "Recover the path",
      title: "Visual odometry",
      intro:
        "GPS is gone. The only fix left is the camera: a UAV flew one path and shot overlapping frames along it. Drag each new frame onto the last so the ground lines up — every registration rebuilds a little more of the route. This is TUYGUN's Task 2, by hand.",
      start: "Start",
      step: "Frame {n} / {total}",
      drag: "Drag the floating frame so its ground matches the frame already laid down. The crosshairs meet when it is aligned; then lock it in.",
      align: "Alignment",
      lock: "Lock frame",
      resultTitle: "{drift} m drift",
      truth: "True path",
      recovered: "Recovered",
      grade: {
        precise: "Locked on",
        solid: "Solid track",
        loose: "Drifting",
        lost: "Lost the fix",
      },
      explain:
        "Every small mis-registration carries forward, and the errors stack into the drift you see between the two paths. Closing that gap without GPS — frame against frame, scored against ground truth — is the whole of TUYGUN's visual-odometry task.",
      again: "Fly it again",
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
          "{model} ({licence}) at {size}×{size}, executing on WebAssembly in a worker so the page never stalls. The class list and input size live in one config file, so his own trained weights can replace it without touching anything else.",
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
    sim: {
      title: "Delivery run",
      lead: "EGENODE's job is a delivery: read each parcel's tag, pick it up and carry it to the address in one piece. This is that mission, at toy scale.",
      eyebrow: "Field exercise",
      simTitle: "Delivery run",
      intro:
        "Collect four tagged parcels and get them to the depot. Watch the bay load: past 2.4 g the chassis is out of give and the cargo takes the hit directly, so flat out costs more than it saves. Arrow keys or A / D to drive, and the same keys trim the chassis in the air; R rights the robot for five seconds of penalty.",
      controls: "← → drive · R recover",
      start: "Begin run",
      again: "Run it again",
      time: "Elapsed",
      cargo: "Cargo",
      load: "Bay load",
      delivered: "Delivered",
      depot: "DEPOT",
      forward: "Drive forward",
      reverse: "Reverse",
      result: "Score {score}",
      resultDetail: "All parcels delivered in {time}. Score is cargo integrity, less a point per second.",
      // Telemetry, so it keeps the terse lowercase register of a device log.
      log: {
        aboard: "rfid {id} · aboard",
        delivered: "{id} · delivered at {integrity}%",
        shock: "shock · {load} g",
        recovery: "recovery · +5 s",
      },
      note: "EGENODE reads each parcel's RFID tag on pickup and has to hand it over intact — the whole difficulty is the middle part, carrying it without wrecking it. The 2.4 g limit is not a difficulty setting: past it the chassis stops absorbing and the parcel takes the load directly, so a hard landing costs integrity you cannot earn back. Physics runs at a fixed 120 Hz regardless of your display, so the same crest throws you the same way on every machine.",
    },
    story: {
      play: "Play",
      pause: "Pause",
      previous: "Previous beat",
      next: "Next beat",
      replay: "Play again",
    },
    gallery: {
      unilate: {
        eyebrow: "Shipped screens",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        screens: {
          "01-bugun": "Today",
          "02-dersler": "Courses",
          "03-program": "Schedule",
          "04-takvim": "Calendar",
          "05-notlar": "Grades",
          "06-gecmis": "History",
        },
      },
      stetoskop: {
        eyebrow: "The delivered site",
        pages: {
          fark: "What sets it apart",
          hizmetler: "Services",
          sss: "FAQ",
          iletisim: "Contact",
        },
      },
    },
    stories: {
      eye2s: {
        eyebrow: "How it learns",
        title: "Six frames, one identity",
        embedder: "Embedder",
        worst: "Worst pair",
        threshold: "Its own consistency, used as the bar",
        frameCount: "{n} frames — the whole cost of teaching it",
        tighter:
          "Two identities at {pair}, closer than earbuds is to its own six frames at {self}",
        automation: "Run the rule",
        held: "Held — the label is not resolved",
        beats: {
          hold:
            "An object goes up in front of the camera. Nothing in the model knows what it is: it is not a COCO class, and no amount of retraining is about to happen while someone stands there holding it.",
          cut:
            "The hand is not the object. GrabCut cuts the thing being held out of the fingers holding it, so what gets learned is the object and not a grip.",
          capture:
            "Six frames, taken from a few angles. That is the entire cost of teaching Eye2S something new — no dataset, no labelling pass, no training run.",
          embed:
            "The six frames become one 768-dimensional prototype from DINOv2. How tightly they agree with each other becomes the object's own threshold: earbuds holds together at 0.657, so 0.657 is the bar a candidate has to clear to be called earbuds.",
          match:
            "Now recognition is a comparison, not a classification. A phone lands at 0.449 and is nowhere near the bar. The right object clears it, and is named — not \"a pair of earbuds\" but this one.",
          twin:
            "Then the hard case, and it was in the real registry all along: the earbuds and the case they live in. Their prototypes sit at 0.903 — the two objects are more like each other than earbuds is like its own six frames.",
          refuse:
            "So the system does not guess. A candidate matching both is shown with the label marked uncertain, and the automation bound to that object is held back. Refusing to fire is the feature — a rule that runs on the wrong object is worse than one that waits.",
        },
      },
      unilate: {
        eyebrow: "The rule behind it",
        title: "A term that recomputes itself",
        meta: "{weeks} weeks · {hours} h/week · {limit}% ceiling",
        missed: "Missed",
        remaining: "Remaining",
        state: "State",
        states: { safe: "Clear", warning: "At the edge", failed: "Lost" },
        beats: {
          schedule:
            "A course is entered once: fourteen weeks, three hours each, the usual thirty-percent attendance ceiling. This is the only thing the app stores.",
          derive:
            "There is no sessions table. Each taught week is derived from the schedule the moment it is needed — which is why the numbers under it can never disagree with the schedule above them.",
          miss:
            "A week is missed. Three hours come off a budget of twelve point six, and the whole term is recomputed rather than a running total nudged.",
          accumulate:
            "Weeks accumulate. Because every change triggers a full recompute, correcting a mark from six weeks ago is the same operation as adding today's — there is no stale total to repair.",
          edge:
            "Four absences in, and the remaining budget is under one session. The state changes on its own; nothing had to be flagged by hand.",
          over:
            "The fifth absence takes it past the ceiling. This is the number the app exists to show before it happens, and it costs one derivation to know.",
        },
      },
    },
    mesh: {
      eyebrow: "One hub, five surfaces",
      title: "One request, everything updates",
      intro:
        "Send a request from any of the five clients. It goes to the Pi, the session is checked, the work is done, and the result goes back to all five at once. The clients don't keep their own copy — they all read the hub's. The Telegram one is a sentence rather than a button, so it goes through the model first.",
      idle: "Idle — pick a request",
      actions: {
        disk: "How much disk is left?",
        upload: "Upload a file",
        docker: "Stop a container",
        lamp: "\"Turn off the living room\"",
        trash: "Send a file to trash",
      },
      legs: {
        request: "Request",
        auth: "Session check",
        intent: "Read the intent",
        decision: "Decision",
        result: "Result",
        sync: "Push to every surface",
      },
      nodes: {
        web: "Web panel",
        phone: "Phone",
        watch: "Watch",
        panel: "Wall panel",
        telegram: "Telegram",
        hub: "Hub",
        ai: "Model",
        files: "Files",
        docker: "Containers",
        system: "System",
      },
      state: { containers: "containers", on: "lit", off: "dark" },
    },
    telemetry: {
      eyebrow: "One packet, two screens",
      title: "The same data, on two screens",
      intro:
        "The watch takes a reading once a second and sends it to the ESP32 as JSON. The ESP32 draws that same reading in two places at once: a browser dashboard and a 2.4\" Nextion TFT. Pick a state below and start the stream.",
      activities: { rest: "Resting", walk: "Walking", sprint: "Sprinting" },
      start: "Stream",
      pause: "Hold",
      step: "One tick",
      watch: "Wear OS watch",
      browser: "Browser dashboard",
      nextion: "Nextion TFT · 320×240",
      hr: "Heart rate",
      spo2: "SpO₂",
      rows: "Log",
      rowsUnit: "rows",
      accel: "Accel X",
      gyro: "Gyro X",
      packet: "What crosses the wire",
      note:
        "The samples are generated for this page; the real ones come from the watch's sensors. The rate is real — one sample a second — which is why the trace is coarse. Heart rate climbs to its new level gradually, the way it does in life.",
    },
    motor: {
      eyebrow: "Where the motor works best",
      title: "Find the load it likes",
      intro:
        "A brushed DC motor turns fastest with nothing on the shaft and makes the most torque when it cannot turn at all — and at both of those ends it wastes nearly everything it draws. Somewhere between them it works at its best. Add load until you find that point.",
      presets: {
        baseline: "As built",
        rewound: "More turns",
        bearings: "Better bearings",
      },
      presetNotes: {
        baseline:
          "The motor as it came: 0.035 N·m per amp through a 1.2 Ω winding.",
        rewound:
          "More turns on the armature. Every amp makes more torque, but the longer, thinner wire has more resistance — the torque is paid for in copper.",
        bearings:
          "Same electrical machine, less drag. Nothing about the winding changed; only what the shaft has to fight before it reaches the load.",
      },
      pin: "Pin this curve",
      unpin: "Clear the pinned curve",
      pinned: "Pinned · {build} at {volts} V",
      machine: "Armature, field, brushes",
      chart: "Load sweep — efficiency, speed and current against load torque",
      legend: { efficiency: "Efficiency", speed: "Speed", current: "Current" },
      axisLoad: "Load torque",
      noLoad: "No load",
      stall: "Stall",
      stalled: "Stalled",
      peakMark: "Peak",
      maxPowerMark: "Most power",
      load: "Load torque",
      voltage: "Supply",
      efficiency: "Efficiency",
      rpm: "Speed",
      current: "Current",
      torque: "Load",
      input: "Drawn",
      output: "Delivered",
      losses: { useful: "Work", copper: "Heat in the winding", friction: "Friction" },
      hunt:
        "Drag the load. Watch the efficiency curve rise, top out, and fall away — park on the top and the bench will mark it.",
      found:
        "Best at {efficiency}% — {torque} mN·m, {rpm} rpm. The motor makes its most power somewhere else entirely: {power} W further right, where it is only {powerEfficiency}% efficient. Size a motor by power alone and it lands there.",
      note:
        "This bench runs on the standard steady-state equations for a brushed DC motor, not on measurements from the 2019 experiments — those numbers were never kept. What is carried over is the question the project asked and the way it asked it: change one thing, sweep the load again, compare.",
    },
    course: {
      eyebrow: "The vehicle's own view",
      title: "Take the run, make the calls",
      intro:
        "ODBARS drives itself down the course. At each station it stops, shows what its perception layer has found, and asks you what to do about it. The frame is not footage — it is what the detector and the tracker see: geometry, boxes, and the identity each object has been given.",
      start: "Begin the run",
      restart: "Run it again",
      standby: "Standby — the camera is live once the run begins",
      frame: "Forward camera with detection and tracking overlay",
      progress: "{done} / {total} decided",
      missions: "Task manager",
      evidence: "Detected · {kind} {score}",
      impact: "CONTACT",
      landing: "hard landing",
      keys: "click, or press 1–3",
      kinds: {
        cone: "cone",
        barrier: "barrier",
        sign: "sign",
        gate: "gate post",
        rock: "rock",
        ramp: "ramp",
        bay: "bay",
      },
      /** Drawn on the frame, so already in the case they are shown in. */
      plates: {
        cone: "CONE",
        barrier: "BARRIER",
        sign: "SIGN",
        gate: "POST",
        rock: "ROCK",
        ramp: "RAMP",
        bay: "BAY",
      },
      hud: {
        speed: "Speed",
        tracks: "Tracked",
        switches: "ID switches",
        compensation: "Motion compensation",
        on: "On",
        off: "Off",
        rough: "Broken ground",
        distance: "{z} / {total} m",
        camera: "CAM 01 · 60 HZ",
        hits: "Contacts",
        damage: "Damage",
      },
      stations: {
        cones: {
          name: "Cone slalom",
          question:
            "The track narrows between two rows of cones. There is room, but not much of it.",
          options: ["Hold the line between them", "Cut the corner"],
          right: "Right. The cones are the track — the gap between them is the task, and the vehicle fits through it with thirty centimetres to spare.",
          wrong: [
            "",
            "The short line went through the slalom rather than around it: two cones down, and the chassis took both.",
          ],
        },
        barrier: {
          name: "Barrier",
          question: "A barrier closes the right of the lane. The left is open by about two metres.",
          options: ["Stop and wait", "Go around to the left", "Push through on the right"],
          right: "Right. The gap on the left is real, and the vehicle went round it without touching anything.",
          wrong: [
            "Three seconds of waiting, and then it had to go round the left anyway. A barrier does not move for patience.",
            "",
            "There was no room on the right — that is where the barrier is. The vehicle hit it, lost most of its speed, and the mount has been off ever since.",
          ],
        },
        rough: {
          name: "Broken ground",
          question:
            "The surface breaks up ahead. The camera is about to be thrown around, and every box in the frame will move at once — not because the objects moved, but because the vehicle did.",
          options: ["Turn on motion compensation", "Carry on without it"],
          right:
            "Right. The stage estimates how the whole frame moved and shifts the tracks by it before matching. Watch the switch counter through the rough section.",
          wrong: [
            "",
            "Left off. Association is now matching this frame's boxes against where things were before the jolt — the counter will tell you how that goes.",
          ],
        },
        sign: {
          name: "Stop sign",
          question: "A stop sign is read on the right at 0.88. The junction behind it is clear.",
          options: ["Come to a full stop", "Slow down and roll through", "Ignore it"],
          right: "Right. A sign the vehicle reads is a sign the vehicle obeys, empty junction or not.",
          wrong: [
            "",
            "Rolling through costs two seconds. The junction being clear is not the point — the run is scored on obeying what it reads.",
            "Ignoring a sign the vehicle read perfectly well costs four seconds, and it is the one failure that says the perception was fine and the policy was not.",
          ],
        },
        gate: {
          name: "Narrow gate",
          question: "Two posts, 3.2 metres apart, on a line the vehicle is not quite squared up to.",
          options: ["Slow down and centre first", "Keep the speed and thread it"],
          right: "Right. Straightening before the gate costs a second and saves a post.",
          wrong: [
            "",
            "At this speed the correction inside the gate was wider than the gate: the vehicle caught the right-hand post.",
          ],
        },
        ramp: {
          name: "Ramp",
          question: "A ramp crosses the full width of the track.",
          options: ["Slow down and take it square", "Keep the speed"],
          right: "Right. Square and slow keeps all six wheels loaded and the camera pointing forward.",
          wrong: [
            "",
            "It left the ground and came down hard. A rocker-bogie is built for the terrain, not for the landing.",
          ],
        },
        bay: {
          name: "Parking bay",
          question: "The bay is detected on the ground ahead, 2.6 metres wide.",
          options: ["Line up and stop inside it", "Drive through and stop past it"],
          right: "Right. The run ends inside the bay or it does not end.",
          wrong: [
            "",
            "Past the bay is not in the bay, and the task manager can tell the difference.",
          ],
        },
      },
      result: {
        eyebrow: "Run complete",
        line: "{correct} of {total} calls right, and {switches} identity switches on the way.",
        clean: "Nothing was touched: the vehicle came through the course without a single contact, and the camera is still pointing where it was bolted.",
        cost: "{hits} contacts, {damage}% damage and {penalty} seconds of penalty. Damage does not stay in the past — a knocked mount reads the world at a slight angle, and the detector misses more of it for the rest of the run.",
        compensated:
          "With compensation on, the tracker kept its identities through the broken ground — the boxes moved with the frame instead of being mistaken for new objects.",
        raw: "Without compensation, most of those switches happened in one fifty-metre stretch. That stretch is why the stage exists.",
      },
      note:
        "The course is written for this page. It is shaped like the tasks a ground-vehicle competition sets, but it is not a copy of any official course, and the frame is a drawing of the perception layer rather than a recording from the vehicle. The tracking, the compensation and the switch counter are real code running on the scene in front of you.",
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
      skipToContent: "Skip to content",
      rotate: "Turn your phone sideways for the full scene",
      dismiss: "Dismiss",
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
      sim: "Sim",
      menu: "Menü",
      close: "Kapat",
    },
    hero: {
      scroll: "Kaydır",
      status: "4 TEKNOFEST takımı · 2 kaptanlık",
    },
    sections: {
      about: "Hakkımda",
      capabilities: "Yetkinlikler",
      work: "Projeler",
      roles: "Görevler",
      contact: "İletişim",
    },
    credentials: {
      internship: "Staj",
      pipeline: "Akış",
      certifications: "Sertifikalar",
    },
    capability: {
      appliedIn: "Kullanıldığı projeler",
    },
    work: {
      active: "Devam ediyor",
      complete: "Tamamlandı",
      delivered: "Teslim edildi · Satıldı",
      deliveredShort: "Satıldı",
      countLabel: "proje",
      open: "Künyeyi aç",
      team: "{n} kişilik ekip",
      solo: "Tek kişi",
    },
    project: {
      back: "Tüm projeler",
      brief: "Künye",
      contribution: "Geliştirdikleri",
      stack: "Teknolojiler",
      program: "Program",
      role: "Görev",
      team: "Ekip",
      period: "Dönem",
      next: "Sonraki proje",
      credentials: "Bilgi",
      visit: { site: "Siteyi incele" },
    },
    contact: {
      heading: "Birlikte bir şey kuralım",
      body: "Serhan robotik, görüntü işleme ve gömülü sistemler alanında çalışmaya açık. Dört TEKNOFEST dönemi geride kaldı, iş artık yayına çıkan ürünlerde — mesajları hep okuyor.",
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
        "Aracın etrafına bir kutu sürükle. Bu kareler sentetik, yani doğru kutu tam olarak biliniyor — eğitim verisini yalnızca toplamak yerine üretmesinin sebebi de bu.",
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
    vo: {
      eyebrow: "Rotayı geri kazan",
      title: "Görsel odometri",
      intro:
        "GPS yok. Elde kalan tek çözüm kamera: bir İHA tek bir rota uçup boyunca üst üste binen kareler çekti. Her yeni kareyi bir öncekiyle, zemin örtüşecek şekilde sürükle — her hizalama rotanın biraz daha fazlasını geri kurar. Bu, TUYGUN'un 2. görevi; elle.",
      start: "Başla",
      step: "Kare {n} / {total}",
      drag: "Yüzen kareyi, zemini önceden yerleştirilen kareyle örtüşecek şekilde sürükle. Hizalanınca artılar üst üste gelir; sonra kilitle.",
      align: "Hizalama",
      lock: "Kareyi kilitle",
      resultTitle: "{drift} m sapma",
      truth: "Gerçek rota",
      recovered: "Kurtarılan",
      grade: {
        precise: "Kilitlendi",
        solid: "Sağlam iz",
        loose: "Kayıyor",
        lost: "İz kayboldu",
      },
      explain:
        "Her küçük hizalama hatası ileriye taşınır ve hatalar birikerek iki rota arasında gördüğün sapmaya dönüşür. GPS olmadan bu farkı kapatmak — kareyi kareye, gerçek rotaya göre puanlayarak — TUYGUN'un görsel odometri görevinin tam kendisi.",
      again: "Tekrar uç",
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
          "{model} ({licence}), {size}×{size} girdiyle ve bir worker içinde WebAssembly üzerinde koşuyor; böylece sayfa hiç takılmıyor. Sınıf listesi ve girdi boyutu tek bir yapılandırma dosyasında, yani kendi eğittiği ağırlıklar başka hiçbir yere dokunmadan yerine geçebiliyor.",
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
    sim: {
      title: "Teslimat turu",
      lead: "EGENODE'un görevi bir teslimat: her kargonun etiketini oku, al ve adrese tek parça hâlinde ulaştır. Bu da o görevin küçültülmüş hâli.",
      eyebrow: "Saha tatbikatı",
      simTitle: "Teslimat turu",
      intro:
        "Etiketli dört kargoyu topla ve depoya ulaştır. Yük göstergesini izle: 2,4 g'nin ötesinde gövdenin esnekliği biter ve darbeyi doğrudan kargo yer, yani sonuna kadar basmak kazandırdığından fazlasını götürür. Yön tuşları ya da A / D ile sür; havadayken aynı tuşlar gövdeyi dengeler. R robotu doğrultur, karşılığı beş saniye ceza.",
      controls: "← → sür · R doğrult",
      start: "Turu başlat",
      again: "Tekrar sür",
      time: "Süre",
      cargo: "Kargo",
      load: "Yük",
      delivered: "Teslim",
      depot: "DEPO",
      forward: "İleri sür",
      reverse: "Geri sür",
      result: "Skor {score}",
      resultDetail: "Bütün kargolar {time} içinde teslim edildi. Skor, kargo bütünlüğünden saniye başına bir puan düşülerek hesaplanıyor.",
      log: {
        aboard: "rfid {id} · yüklendi",
        delivered: "{id} · %{integrity} ile teslim",
        shock: "darbe · {load} g",
        recovery: "doğrultma · +5 sn",
      },
      note: "EGENODE her kargonun RFID etiketini alırken okuyor ve onu bütünlüğü bozulmadan teslim etmek zorunda — bütün zorluk ortadaki kısımda, yani onu hırpalamadan taşımakta. 2,4 g sınırı bir zorluk ayarı değil: sınırı geçince gövde soğurmayı bırakır ve yükü doğrudan kargo taşır, dolayısıyla sert bir iniş geri kazanamayacağın bütünlük götürür. Fizik, ekranından bağımsız olarak sabit 120 Hz'de koşuyor; yani aynı sırt her makinede seni aynı şekilde savuruyor.",
    },
    story: {
      play: "Oynat",
      pause: "Duraklat",
      previous: "Önceki adım",
      next: "Sonraki adım",
      replay: "Baştan oynat",
    },
    gallery: {
      unilate: {
        eyebrow: "Yayına çıkan ekranlar",
        theme: "Tema",
        light: "Açık",
        dark: "Koyu",
        screens: {
          "01-bugun": "Bugün",
          "02-dersler": "Dersler",
          "03-program": "Program",
          "04-takvim": "Takvim",
          "05-notlar": "Notlar",
          "06-gecmis": "Geçmiş",
        },
      },
      stetoskop: {
        eyebrow: "Teslim edilen site",
        pages: {
          fark: "Farkımız",
          hizmetler: "Hizmetler",
          sss: "SSS",
          iletisim: "İletişim",
        },
      },
    },
    stories: {
      eye2s: {
        eyebrow: "Nasıl öğreniyor",
        title: "Altı kare, bir kimlik",
        embedder: "Gömücü",
        worst: "En kötü çift",
        threshold: "Kendi tutarlılığı, eşik olarak kullanılıyor",
        frameCount: "{n} kare — öğretmenin tüm maliyeti",
        tighter:
          "İki kimlik {pair} benzerlikte; earbuds'ın kendi altı karesine benzerliği ise {self}",
        automation: "Kuralı çalıştır",
        held: "Bekletildi — etiket çözülemedi",
        beats: {
          hold:
            "Kameranın önüne bir nesne kalkıyor. Modelin onun ne olduğuna dair hiçbir bilgisi yok: COCO sınıflarından biri değil ve biri onu elinde tutarken yeniden eğitim yapılacak hâli de yok.",
          cut:
            "El, nesnenin kendisi değil. GrabCut tutulan cismi onu tutan parmaklardan kesip ayırıyor; böylece öğrenilen şey nesne oluyor, tutuş biçimi değil.",
          capture:
            "Birkaç açıdan altı kare. Eye2S'e yeni bir şey öğretmenin tüm maliyeti bu — veri seti yok, etiketleme turu yok, eğitim koşusu yok.",
          embed:
            "Altı kare, DINOv2'den gelen tek bir 768 boyutlu prototipe dönüşüyor. Birbirleriyle ne kadar sıkı uyuştukları nesnenin kendi eşiği oluyor: earbuds 0.657'de duruyor, dolayısıyla earbuds denebilmesi için bir adayın aşması gereken çıta da 0.657.",
          match:
            "Artık tanıma bir sınıflandırma değil, bir karşılaştırma. Telefon 0.449'da kalıyor, çıtanın yanından bile geçmiyor. Doğru nesne çıtayı aşıyor ve adlandırılıyor — \"bir kulaklık\" değil, bu kulaklık.",
          twin:
            "Sonra zor vaka geliyor, üstelik gerçek kayıtta baştan beri duruyordu: kulaklık ve içinde yaşadığı kutu. Prototipleri 0.903'te — iki nesne, earbuds'ın kendi altı karesine benzediğinden daha çok birbirine benziyor.",
          refuse:
            "Bu yüzden sistem tahmin yürütmüyor. İkisine birden uyan bir aday, etiketi kararsız işaretlenerek gösteriliyor ve o nesneye bağlı otomasyon bekletiliyor. Çalışmayı reddetmek özelliğin kendisi — yanlış nesnede tetiklenen bir kural, bekleyen bir kuraldan kötüdür.",
        },
      },
      unilate: {
        eyebrow: "Arkasındaki kural",
        title: "Kendini yeniden hesaplayan dönem",
        meta: "{weeks} hafta · haftada {hours} saat · %{limit} sınır",
        missed: "Devamsızlık",
        remaining: "Kalan hak",
        state: "Durum",
        states: { safe: "Temiz", warning: "Sınırda", failed: "Kaldı" },
        beats: {
          schedule:
            "Ders bir kez giriliyor: on dört hafta, haftada üç saat, alışılmış yüzde otuzluk devamsızlık sınırı. Uygulamanın sakladığı tek şey bu.",
          derive:
            "Oturum tablosu yok. İşlenen her hafta, ihtiyaç duyulduğu anda programdan türetiliyor — altındaki sayıların üstündeki programla çelişebilmesinin imkânsız olmasının nedeni de bu.",
          miss:
            "Bir hafta kaçırılıyor. On iki virgül altılık haktan üç saat düşüyor ve yürüyen bir toplam dürtülmek yerine dönemin tamamı yeniden hesaplanıyor.",
          accumulate:
            "Haftalar birikiyor. Her değişiklik tam yeniden hesap tetiklediği için, altı hafta önceki bir işareti düzeltmek bugünkünü eklemekle aynı işlem — onarılacak bayat bir toplam yok.",
          edge:
            "Dördüncü devamsızlıktan sonra kalan hak bir dersin altına düşüyor. Durum kendiliğinden değişiyor; elle işaretlenmesi gereken bir şey olmadı.",
          over:
            "Beşinci devamsızlık sınırı aşıyor. Uygulamanın var olma sebebi tam da bu sayıyı olmadan önce göstermek ve bunu bilmenin maliyeti tek bir türetme.",
        },
      },
    },
    mesh: {
      eyebrow: "Tek merkez, beş yüzey",
      title: "Bir istek, hepsi güncelleniyor",
      intro:
        "Beş istemciden biriyle istek gönder. İstek Pi'ye gidiyor, oturum kontrol ediliyor, iş yapılıyor ve sonuç aynı anda beşine birden dönüyor. İstemciler veriyi kendileri tutmuyor, hepsi merkezdekini okuyor. Telegram'daki istek düğme değil cümle olduğu için önce modele uğruyor.",
      idle: "Beklemede — bir istek seç",
      actions: {
        disk: "Diskte ne kadar yer kaldı?",
        upload: "Dosya yükle",
        docker: "Konteyneri durdur",
        lamp: "\"Salonu karart\"",
        trash: "Dosyayı çöpe at",
      },
      legs: {
        request: "İstek",
        auth: "Oturum kontrolü",
        intent: "Niyeti oku",
        decision: "Karar",
        result: "Sonuç",
        sync: "Bütün yüzeylere yay",
      },
      nodes: {
        web: "Web paneli",
        phone: "Telefon",
        watch: "Saat",
        panel: "Duvar paneli",
        telegram: "Telegram",
        hub: "Merkez",
        ai: "Model",
        files: "Dosyalar",
        docker: "Konteynerler",
        system: "Sistem",
      },
      state: { containers: "konteyner", on: "açık", off: "kapalı" },
    },
    telemetry: {
      eyebrow: "Tek paket, iki ekran",
      title: "Aynı veri, iki ekranda",
      intro:
        "Saat saniyede bir ölçüm alıp ESP32'ye JSON olarak gönderiyor. ESP32 aynı ölçümü iki yere birden çiziyor: tarayıcı paneline ve 2,4\" Nextion TFT'ye. Aşağıdan bir durum seç ve akışı başlat.",
      activities: { rest: "Dinlenme", walk: "Yürüyüş", sprint: "Sprint" },
      start: "Akıt",
      pause: "Duraklat",
      step: "Tek tık",
      watch: "Wear OS saati",
      browser: "Tarayıcı paneli",
      nextion: "Nextion TFT · 320×240",
      hr: "Nabız",
      spo2: "SpO₂",
      rows: "Kayıt",
      rowsUnit: "satır",
      accel: "İvme X",
      gyro: "Jiro X",
      packet: "Telden geçen şey",
      note:
        "Veriler bu sayfa için üretiliyor; gerçekleri saatin sensörlerinden geliyor. Hız gerçek — saniyede bir örnek — iz bu yüzden kaba. Nabız yeni seviyesine, gerçekte olduğu gibi, yavaş yavaş çıkıyor.",
    },
    motor: {
      eyebrow: "Motor en iyi nerede çalışır",
      title: "Sevdiği yükü bul",
      intro:
        "Fırçalı bir DC motor mil boştayken en hızlı döner, hiç dönemediğinde en çok torku üretir — ve bu iki uçta da çektiği enerjinin neredeyse tamamını harcar. En iyi çalıştığı yer ikisinin arasındadır. Yükü artır ve o noktayı bul.",
      presets: {
        baseline: "Kurulduğu hâli",
        rewound: "Daha çok sarım",
        bearings: "İyi rulman",
      },
      presetNotes: {
        baseline:
          "Motorun geldiği hâli: 1,2 Ω sargıdan amper başına 0,035 N·m.",
        rewound:
          "Rotorda daha çok sarım. Her amper daha çok tork üretiyor, ama uzayan ve incelen tel daha dirençli — tork bakırla ödeniyor.",
        bearings:
          "Elektriksel makine aynı, sürtünme daha az. Sargıda hiçbir şey değişmedi; değişen, milin yüke ulaşmadan önce yenmesi gereken direnç.",
      },
      pin: "Bu eğriyi sabitle",
      unpin: "Sabit eğriyi kaldır",
      pinned: "Sabit · {build}, {volts} V",
      machine: "Rotor, alan, fırçalar",
      chart: "Yük süpürmesi — yük torkuna karşı verim, devir ve akım",
      legend: { efficiency: "Verim", speed: "Devir", current: "Akım" },
      axisLoad: "Yük torku",
      noLoad: "Boşta",
      stall: "Durma",
      stalled: "Durdu",
      peakMark: "Tepe",
      maxPowerMark: "En çok güç",
      load: "Yük torku",
      voltage: "Besleme",
      efficiency: "Verim",
      rpm: "Devir",
      current: "Akım",
      torque: "Yük",
      input: "Çekilen",
      output: "Verilen",
      losses: { useful: "İş", copper: "Sargıdaki ısı", friction: "Sürtünme" },
      hunt:
        "Yükü gezdir. Verim eğrisi yükseliyor, tepe yapıyor ve düşüyor — tepeye park et, tezgâh orayı işaretlesin.",
      found:
        "En iyisi %{efficiency} — {torque} mN·m, {rpm} dev/dk. Motor en çok gücü bambaşka bir yerde üretiyor: daha sağda {power} W, ama orada verim yalnızca %{powerEfficiency}. Bir motoru yalnızca güce bakarak seçersen oraya düşersin.",
      note:
        "Bu tezgâh, fırçalı DC motorun standart kararlı hâl denklemleriyle çalışır; 2019 deneylerinin ölçümleriyle değil — o sayılar saklanmadı. Devralınan şey projenin sorduğu soru ve sorma biçimi: tek şeyi değiştir, yükü yeniden süpür, karşılaştır.",
    },
    course: {
      eyebrow: "Aracın kendi görüşü",
      title: "Turu al, kararları sen ver",
      intro:
        "ODBARS parkurda kendi gidiyor. Her istasyonda duruyor, algı katmanının ne bulduğunu gösteriyor ve ne yapacağını sana soruyor. Ekrandaki görüntü bir kayıt değil — tespit ve takip katmanının gördüğü şey: geometri, kutular ve her nesneye verilen kimlik.",
      start: "Turu başlat",
      restart: "Turu yeniden al",
      standby: "Beklemede — tur başlayınca kamera devrede",
      frame: "Tespit ve takip bindirmeli ön kamera",
      progress: "{done} / {total} karar verildi",
      missions: "Görev yöneticisi",
      evidence: "Tespit · {kind} {score}",
      impact: "TEMAS",
      landing: "sert iniş",
      keys: "tıkla ya da 1–3 tuşlarına bas",
      kinds: {
        cone: "koni",
        barrier: "bariyer",
        sign: "levha",
        gate: "geçit direği",
        rock: "taş",
        ramp: "rampa",
        bay: "park kutusu",
      },
      /** Kareye çizilir; JS'in toUpperCase'i "İ" bilmediği için hazır büyük. */
      plates: {
        cone: "KONİ",
        barrier: "BARİYER",
        sign: "LEVHA",
        gate: "DİREK",
        rock: "TAŞ",
        ramp: "RAMPA",
        bay: "KUTU",
      },
      hud: {
        speed: "Hız",
        tracks: "İzlenen",
        switches: "Kimlik takası",
        compensation: "Hareket telafisi",
        on: "Açık",
        off: "Kapalı",
        rough: "Engebeli zemin",
        distance: "{z} / {total} m",
        camera: "KAMERA 01 · 60 HZ",
        hits: "Temas",
        damage: "Hasar",
      },
      stations: {
        cones: {
          name: "Koni slalomu",
          question:
            "Şerit iki koni sırası arasında daralıyor. Yer var, ama bol değil.",
          options: ["Aradaki çizgiyi koru", "Virajı kısa kes"],
          right: "Doğru. Koniler şeridin kendisi — aradan geçmek görevin ta kendisi ve araç oradan otuz santim payla geçiyor.",
          wrong: [
            "",
            "Kısa çizgi slalomun etrafından değil içinden geçti: iki koni devrildi, ikisini de şasi aldı.",
          ],
        },
        barrier: {
          name: "Bariyer",
          question: "Bariyer şeridin sağını kapatıyor. Solda yaklaşık iki metre açıklık var.",
          options: ["Dur ve bekle", "Soldan dolan", "Sağdan zorla"],
          right: "Doğru. Soldaki açıklık gerçekti; araç hiçbir yere değmeden dolandı.",
          wrong: [
            "Üç saniye beklendi ve sonunda yine soldan dolaşmak gerekti. Bariyer sabra çekilmiyor.",
            "",
            "Sağda geçecek yer yoktu — orası bariyerin kendisi. Araç ona girdi, hızının çoğunu kaybetti ve kamera o günden beri eğik bakıyor.",
          ],
        },
        rough: {
          name: "Engebeli zemin",
          question:
            "İleride zemin bozuluyor. Kamera sarsılacak ve karedeki bütün kutular aynı anda kayacak — nesneler kımıldadığı için değil, araç kımıldadığı için.",
          options: ["Hareket telafisini aç", "Telafisiz devam et"],
          right:
            "Doğru. Katman tüm karenin ne kadar kaydığını kestirip izleri eşleştirmeden önce o kadar kaydırıyor. Engebeli bölüm boyunca takas sayacını izle.",
          wrong: [
            "",
            "Kapalı bırakıldı. Eşleştirme artık bu karenin kutularını, sarsıntıdan önceki yerleriyle karşılaştırıyor — sonucu sayaç anlatacak.",
          ],
        },
        sign: {
          name: "DUR levhası",
          question: "Sağda 0,88 skorla bir DUR levhası okundu. Arkasındaki kavşak boş.",
          options: ["Tam duruş yap", "Yavaşlayıp geç", "Yok say"],
          right: "Doğru. Aracın okuduğu levha, aracın uyduğu levhadır — kavşak boş olsa da.",
          wrong: [
            "",
            "Yavaşlayıp geçmek iki saniye ceza. Kavşağın boş olması ölçüt değil; tur, okuduğuna uymakla puanlanıyor.",
            "Gayet net okunmuş bir levhayı yok saymak dört saniye ceza — ve algının değil, kararın hatalı olduğunu söyleyen tek başarısızlık bu.",
          ],
        },
        gate: {
          name: "Dar geçit",
          question: "Aralarında 3,2 metre olan iki direk; araç henüz tam hizalanmış değil.",
          options: ["Yavaşla ve önce ortala", "Hızı koru, aradan süz"],
          right: "Doğru. Geçitten önce doğrulmak bir saniyeye mal olur, bir direği kurtarır.",
          wrong: [
            "",
            "Bu hızda geçidin içindeki düzeltme geçitten geniş kaldı: araç sağ direğe takıldı.",
          ],
        },
        ramp: {
          name: "Rampa",
          question: "Rampa şeridi baştan başa kesiyor.",
          options: ["Yavaşla ve dik gir", "Hızı koru"],
          right: "Doğru. Dik ve yavaş girmek altı tekerleği de yüklü, kamerayı da ileri bakar tutar.",
          wrong: [
            "",
            "Araç yerden kesildi ve sert indi. Rocker-bogie arazi için yapıldı, iniş için değil.",
          ],
        },
        bay: {
          name: "Park kutusu",
          question: "İleride zeminde 2,6 metre genişliğinde park kutusu algılandı.",
          options: ["Hizalan ve içinde dur", "İçinden geçip ilerde dur"],
          right: "Doğru. Tur ya kutunun içinde biter ya da bitmez.",
          wrong: [
            "",
            "Kutuyu geçmek kutuya girmek değil, ve görev yöneticisi farkı görüyor.",
          ],
        },
      },
      result: {
        eyebrow: "Tur tamamlandı",
        line: "{total} kararın {correct} tanesi doğru ve yol boyunca {switches} kimlik takası.",
        clean: "Hiçbir şeye değilmedi: araç parkuru tek bir temas olmadan tamamladı ve kamera hâlâ vidalandığı yere bakıyor.",
        cost: "{hits} temas, %{damage} hasar ve {penalty} saniye ceza. Hasar geçmişte kalmıyor — sarsılan bir mount dünyayı hafif eğik okur, tespit de turun geri kalanında daha çoğunu kaçırır.",
        compensated:
          "Telafi açıkken takip, engebeli zemin boyunca kimliklerini korudu — kutular kareyle birlikte kaydı, yeni nesne sanılmadı.",
        raw: "Telafi kapalıyken bu takasların çoğu elli metrelik tek bir bölümde oldu. O bölüm, katmanın var olma sebebi.",
      },
      note:
        "Parkur bu sayfa için yazıldı. Bir kara aracı yarışmasının verdiği görevlerin biçiminde, ama hiçbir resmî parkurun kopyası değil; ekrandaki kare de araçtan bir kayıt değil, algı katmanının çizimi. Takip, telafi ve takas sayacı ise önündeki sahne üzerinde gerçekten çalışan kodun kendisi.",
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
      skipToContent: "İçeriğe geç",
      rotate: "Sahnenin tamamı için telefonu yatay çevir",
      dismiss: "Kapat",
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
