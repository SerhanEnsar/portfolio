// Copyright (c) 2026 Serhan Ensar. All rights reserved.
"use client";

import { useState } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import CinematicThemeSwitcher from "@/components/ui/cinematic-theme-switcher";
import { StatsCard, StatsCardProps } from "@/components/ui/stats-card-1";
import SystemMonitor from "@/components/ui/system-monitor";
import { HeroBackground } from "@/components/ui/shape-landing-hero";
import {
  Mail,
  Brain,
  Cpu,
  Zap,
  Rocket,
  Home,
  Radio,
  Battery,
  ChevronDown,
  ChevronRight,
  X,
  Terminal,
  Shield,
  Wifi,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Inline SVG icons ────────────────────────────────────────────────────────
const Github = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const Linkedin = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Project data ─────────────────────────────────────────────────────────────
const projects = [
  {
    id: 1,
    codename: "LAÇİN",
    fullName: "Aerial AI Object Detection System",
    category: "AI / AVIATION",
    status: "ACTIVE" as const,
    year: "2025–2026",
    role: "Team Captain",
    team: 5,
    contest: "TEKNOFEST 2026 – AI in Aviation",
    icon: Brain,
    highlight: "mAP@50 = 0.655 on 116K images",
    description:
      "Leading a 5-member team building a YOLOv11-based aerial object detection system. Built the full training pipeline on a 25K-image dataset fusing VisDrone, UAVDT, Stanford Drone, DOTAv2 and custom UAP/UAI labels. Developed a custom augmentation pipeline applying Gaussian blur and synthetic dead pixels to simulate real-field sensor failures.",
    bullets: [
      "YOLOv11 training pipeline — 116K image dataset, mAP@50 = 0.655",
      "Custom augmentation: Gaussian blur + synthetic dead pixels",
      "Data Augmentation & Label Visualizer GUI (CustomTkinter + OpenCV)",
      "JSONtoYOLO Converter — Supervisely → YOLOv11 structure",
      "JSON API server communication layer for team integration",
    ],
    tech: ["YOLOv11", "Python", "OpenCV", "SAHI", "CustomTkinter", "PyInstaller"],
  },
  {
    id: 2,
    codename: "TUYGUN",
    fullName: "Aerial AI System",
    category: "AI / AVIATION",
    status: "ACTIVE" as const,
    year: "2025–2026",
    role: "Team Captain",
    team: 4,
    contest: "TEKNOFEST 2026 – AI in Aviation",
    icon: Rocket,
    highlight: "Independent team — same category as LAÇİN",
    description:
      "Serving as Team Captain of a 4-member team competing independently in the same TEKNOFEST category as LAÇİN. Responsible for team organization, task distribution, milestone planning, and cross-team technical coordination.",
    bullets: [
      "Coordinating two separate competing teams simultaneously",
      "Cross-team technical alignment and milestone sync",
      "Task distribution and milestone planning",
    ],
    tech: ["YOLOv11", "Python", "FastAPI"],
  },
  {
    id: 3,
    codename: "EGE ODBARS",
    fullName: "Autonomous Unmanned Ground Vehicle",
    category: "ROBOTICS / UGV",
    status: "ACTIVE" as const,
    year: "2025–2026",
    role: "Embedded SW & CV Member",
    team: 13,
    contest: "TEKNOFEST 2026 – Unmanned Ground Vehicle",
    icon: Cpu,
    highlight: "6×4 Rocker-Bogie UGV with real-time GCS",
    description:
      "Contributing to a 13-member multidisciplinary team building a 6×4 Rocker-Bogie UGV. Built ODBARS NEXUS — a military-aesthetic tactical HUD with React, Vite and Electron — plus a dual-pipeline synthetic dataset generator and YOLOv8+ByteTrack+GMC computer vision stack.",
    bullets: [
      "ODBARS NEXUS GCS: React + Vite + Electron, 3-camera MJPEG streaming",
      "Real-time telemetry: speed, battery, pitch/roll + 7-mission task manager",
      "Synthetic Dataset Gen: Blender bpy (3D pipeline) + OpenCV (2D pipeline)",
      "Procedural 40×40m terrain, GPU Cycles rendering at 1920×1080",
      "YOLOv8 + ByteTrack + custom GMC for ego-motion compensation",
    ],
    tech: ["React", "Vite", "Electron", "YOLOv8", "ByteTrack", "Blender bpy", "OpenCV", "Python"],
  },
  {
    id: 4,
    codename: "EGENODE",
    fullName: "Dynamic Logistics Mobile Robot",
    category: "EMBEDDED / ROBOTICS",
    status: "ACTIVE" as const,
    year: "2025–2026",
    role: "Embedded SW & HW-SW Lead",
    team: 5,
    contest: "TEKNOFEST 2026 – Robolig",
    icon: Zap,
    highlight: "RFID + IMU + 4-DOF arm on 240MHz dual-core",
    description:
      "Embedded Software & Hardware-Software Optimization Lead on a 5-member team. Responsible for firmware on Deneyap Kart (ESP32, 240 MHz dual-core): multitasking for simultaneous autonomous delivery alignment and manual RC control via iBUS.",
    bullets: [
      "Deneyap Kart firmware: 240MHz dual-core multitasking",
      "RFID parcel verification (SPI) + LSM6DSM 6-axis IMU",
      "4-DOF robotic arm with 6 servo motors + cage end-effector",
      "H-bridge DC motor drivers + iBUS RC over 2.4 GHz",
      "Mission flow: RFID pickup → safe-carry → autonomous delivery → zipline",
    ],
    tech: ["C++", "ESP32", "Deneyap", "RFID", "IMU", "Arduino", "iBUS"],
  },
  {
    id: 5,
    codename: "HomeAgent",
    fullName: "AI-Powered Smart Home Ecosystem",
    category: "IoT / AI / FULL-STACK",
    status: "COMPLETE" as const,
    year: "2025",
    role: "Solo Developer",
    team: 1,
    contest: "Personal Project",
    icon: Home,
    highlight: "Gemini AI + Raspberry Pi + Wear OS + ESP32",
    description:
      "Built a central smart home server on Raspberry Pi serving as hub for Android and Wear OS clients. FastAPI async REST with JWT auth, Google Gemini AI for voice/text command understanding, Kotlin Wear OS app for Samsung Galaxy Watch 4, and a C++ ESP32 touchscreen panel.",
    bullets: [
      "FastAPI backend: JWT auth, 20+ endpoints, CPU/RAM/disk monitoring",
      "Full file manager: upload, download, move, copy, rename, trash, preview",
      "Docker container management + network status dashboard",
      "Google Gemini AI for autonomous home control decisions",
      "Wear OS (Kotlin/Jetpack Compose): bezel nav, 3s auto-refresh",
      "ESP32 + ILI9341 TFT touchscreen menu over WiFi",
      "Telegram Bot: /status, /reboot, /shutdown, /ip, /disk commands",
    ],
    tech: ["Python", "FastAPI", "Kotlin", "Jetpack Compose", "C++", "ESP32", "Gemini AI", "Raspberry Pi"],
  },
  {
    id: 6,
    codename: "TELEMETRY",
    fullName: "Smart Telemetry System",
    category: "EMBEDDED / IoT",
    status: "COMPLETE" as const,
    year: "2025",
    role: "Solo Developer",
    team: 1,
    contest: "Personal Project",
    icon: Radio,
    highlight: "WearOS → ESP32 → Nextion HMI @ 1Hz",
    description:
      "Real-time telemetry pipeline streaming HR, SpO2, accelerometer and gyroscope data at 1Hz from Wear OS via HTTP/JSON to ESP32. Simultaneously drives a live browser dashboard with CSV log download and a Nextion TFT display with visual gauges and IMU waveform graphs.",
    bullets: [
      "1Hz biometric data stream: HR, SpO2, accelerometer, gyroscope",
      "Wear OS → ESP32 via HTTP/JSON",
      "Live browser dashboard with CSV log download",
      "Nextion TFT: visual gauges + IMU waveform graphs",
    ],
    tech: ["Kotlin", "C++", "ESP32", "Wear OS", "Nextion HMI", "HTTP/JSON"],
  },
  {
    id: 7,
    codename: "TÜBİTAK",
    fullName: "Electric Motor Innovation",
    category: "R&D / ELECTROMECHANICS",
    status: "COMPLETE" as const,
    year: "2019",
    role: "Co-Researcher",
    team: 2,
    contest: "TÜBİTAK R&D Project",
    icon: Battery,
    highlight: "Electric motor efficiency research",
    description:
      "Co-designed a 2-person R&D project analyzing electric motor efficiency and dynamic force development. Conducted comparative experiments to optimize foundational motor mechanics.",
    bullets: [
      "Comparative experiments on motor efficiency",
      "Dynamic force development analysis",
      "Optimization of foundational motor mechanics",
    ],
    tech: ["Electromechanics", "R&D", "Experimental Design"],
  },
];

// ── Skill chart data ──────────────────────────────────────────────────────────
const pythonData: StatsCardProps["chartData"] = [
  { name: "CV", value: 90, color: "bg-emerald-500" },
  { name: "AI", value: 95, color: "bg-emerald-500" },
  { name: "GUI", value: 80, color: "bg-emerald-400" },
  { name: "API", value: 85, color: "bg-emerald-500" },
  { name: "IoT", value: 75, color: "bg-emerald-400" },
  { name: "3D", value: 70 },
];

const embeddedData: StatsCardProps["chartData"] = [
  { name: "ESP32", value: 90, color: "bg-cyan-500" },
  { name: "Ardn", value: 85, color: "bg-cyan-400" },
  { name: "RPi", value: 80, color: "bg-cyan-500" },
  { name: "IMU", value: 75, color: "bg-cyan-400" },
  { name: "RFID", value: 70, color: "bg-cyan-300" },
  { name: "LoRa", value: 65 },
];

const webData: StatsCardProps["chartData"] = [
  { name: "React", value: 80, color: "bg-teal-500" },
  { name: "TS", value: 60, color: "bg-teal-400" },
  { name: "Vite", value: 75, color: "bg-teal-500" },
  { name: "Elec", value: 70, color: "bg-teal-400" },
  { name: "API", value: 85, color: "bg-teal-500" },
  { name: "UI", value: 65 },
];

const aiData: StatsCardProps["chartData"] = [
  { name: "YOLO", value: 90, color: "bg-emerald-500" },
  { name: "Trk", value: 80, color: "bg-emerald-400" },
  { name: "CV", value: 85, color: "bg-emerald-500" },
  { name: "Aug", value: 75, color: "bg-emerald-400" },
  { name: "3D", value: 70, color: "bg-emerald-300" },
  { name: "LLM", value: 65 },
];

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
};

// ── Project card component ────────────────────────────────────────────────────
function ProjectCard({
  project,
  index,
  isOpen,
  onToggle,
}: {
  project: (typeof projects)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = project.icon;
  const isActive = project.status === "ACTIVE";

  return (
    <motion.div
      layout
      variants={fadeUp}
      className={`rounded-lg border bg-card glow-border transition-all duration-300 cursor-pointer overflow-hidden ${
        isOpen
          ? "border-emerald-500/50 shadow-[0_0_24px_rgba(34,197,94,0.08)]"
          : "border-border hover:border-emerald-500/30"
      }`}
      onClick={onToggle}
    >
      {/* Card header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Number + icon */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div
                className={`w-9 h-9 rounded-md flex items-center justify-center ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon size={18} />
              </div>
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-mono font-bold text-base text-foreground tracking-wider">
                  {project.codename}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-active" />
                  )}
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {project.fullName}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400/80 tracking-widest bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                  {project.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {project.year}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {project.role}
                  {project.team > 1 ? ` · ${project.team}p` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Expand chevron */}
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 text-muted-foreground mt-1"
          >
            <ChevronRight size={16} />
          </motion.div>
        </div>

        {/* Highlight + tech tags (always visible) */}
        <div className="mt-3 pl-12">
          <p className="text-xs text-muted-foreground italic">{project.highlight}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tech.slice(0, 5).map((t) => (
              <span
                key={t}
                className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-muted/40 text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {project.tech.length > 5 && (
              <span className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground">
                +{project.tech.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-t border-border/60 mx-5 mb-5 pt-4 space-y-4">
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2 flex items-center gap-2">
                  <Terminal size={10} /> Mission Brief
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {project.description}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
                  ▸ Key Objectives
                </p>
                <ul className="space-y-1.5">
                  {project.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-emerald-500 mt-[3px] shrink-0 font-mono text-xs">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-2">
                  ▸ Tech Stack
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/40">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {project.contest}
                </span>
                {project.team > 1 && (
                  <span className="text-[10px] font-mono text-muted-foreground">
                    TEAM SIZE: {project.team}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [openProject, setOpenProject] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-6 md:px-12 py-3.5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Terminal size={14} className="text-emerald-500" />
            <span className="text-base font-mono font-bold tracking-tight">
              SE<span className="text-emerald-500">_</span>
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground mr-4 font-mono">
              {["about", "skills", "projects", "contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item}`}
                  className="hover:text-emerald-400 transition-colors tracking-wide"
                >
                  ./{item}
                </a>
              ))}
            </div>
            <CinematicThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </motion.div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden md:hidden border-t border-border/50"
            >
              <div className="flex flex-col px-6 py-4 gap-1 font-mono text-sm">
                {["about", "skills", "projects", "experience", "contact"].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      setTimeout(() => {
                        document.getElementById(item)?.scrollIntoView({ behavior: "smooth" });
                      }, 260);
                    }}
                    className="flex items-center gap-2 py-2.5 px-3 rounded text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/5 transition-colors tracking-wide"
                  >
                    <span className="text-emerald-500/50 text-xs">./</span>{item}
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Hero — ContainerScroll ── */}
      <section className="pt-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <HeroBackground />
        </div>
        {/* Gradient fade so the dark hero blends into the page background below */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent to-background z-[1] pointer-events-none" aria-hidden="true" />
        <div className="relative z-10">
        <ContainerScroll
          titleComponent={
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/5 text-emerald-500 font-mono text-xs tracking-widest uppercase"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 status-active" />
                Computer Engineer · Computer Vision · Embedded Systems
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-[5.5rem] font-bold tracking-tight leading-none text-white"
              >
                Serhan Ensar
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Büdün
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-light"
              >
                Building AI systems for aerial robotics, autonomous UGVs,
                and embedded IoT ecosystems —{" "}
                <span className="text-emerald-500 font-medium">competing at TEKNOFEST 2026.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-1.5 text-xs font-mono text-muted-foreground pt-2"
              >
                <ChevronDown size={14} className="animate-bounce text-emerald-500" />
                scroll to explore
              </motion.div>
            </div>
          }
        >
          {/* Terminal inside the scroll card */}
          <div className="w-full h-full flex flex-col bg-[#0b0e13] rounded-2xl font-mono overflow-hidden">
            {/* Terminal title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-zinc-500 text-[11px] tracking-wide">
                SerhanEnsar@TEKNOFEST-2026 — zsh
              </span>
            </div>

            {/* Terminal body */}
            <div className="flex-1 p-5 md:p-8 space-y-4 overflow-auto text-sm">
              {[
                {
                  prompt: "SerhanEnsar@dev:~$",
                  cmd: "whoami",
                  output: "Serhan Ensar Büdün · Computer Eng. St. @ Ege University, İzmir (2024–2029)",
                  outColor: "text-emerald-400",
                },
                {
                  prompt: "SerhanEnsar@dev:~$",
                  cmd: "cat roles.txt",
                  output: "Team Captain [×2]  ·  Embedded Lead [×2]  ·  CV Engineer  ·  Full-Stack",
                  outColor: "text-cyan-400",
                },
                {
                  prompt: "SerhanEnsar@dev:~$",
                  cmd: "ls /projects",
                  output: "LAÇİN/  TUYGUN/  EGE_ODBARS/  EGENODE/  HomeAgent/  TELEMETRY/  TÜBITAK/",
                  outColor: "text-teal-400",
                },
                {
                  prompt: "SerhanEnsar@dev:~$",
                  cmd: "python train.py --dataset 25K --model yolov11",
                  output: "Epoch 300/300 ── mAP@50: 0.655  ·  mAP@50-95: 0.421  ✓",
                  outColor: "text-amber-400",
                },
                {
                  prompt: "SerhanEnsar@dev:~$",
                  cmd: "cat /etc/status",
                  output: 'COMPETING: "TEKNOFEST 2026"  |  OPEN_TO: "collaborations"',
                  outColor: "text-emerald-300",
                },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.22 }}
                  className="space-y-0.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 text-xs">{line.prompt}</span>
                    <span className="text-zinc-200">{line.cmd}</span>
                  </div>
                  <div className={`pl-4 text-xs leading-relaxed ${line.outColor}`}>
                    {line.output}
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.1, delay: 1.8 }}
                className="text-emerald-400 text-base leading-none"
              >
                █
              </motion.div>
            </div>
          </div>
        </ContainerScroll>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 px-6 md:px-12 max-w-5xl mx-auto scroll-mt-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-1">
            <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
              // about
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Who I Am</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-muted-foreground leading-relaxed text-[15px]">
            <div className="space-y-4">
              <p>
                First-year Computer Engineering student at{" "}
                <span className="text-foreground font-medium">Ege University, İzmir</span>{" "}
                with a deep focus on AI-driven robotics, computer vision, and embedded systems.
              </p>
              <p>
                Currently captaining two TEKNOFEST 2026 teams —{" "}
                <span className="text-emerald-400 font-medium">LAÇİN</span> and{" "}
                <span className="text-emerald-400 font-medium">TUYGUN</span> — while
                serving as Embedded Lead in two more. That's four simultaneous competition projects.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                As{" "}
                <span className="text-foreground font-medium">Computer Society Chairperson</span>{" "}
                at IEEE Ege University, I lead 6 technical sub-teams and teach Arduino &
                embedded systems to fellow students.
              </p>
              <p>
                I build end-to-end: Writing Deneyap firmware, to shipping React+Electron GCS apps and
                packaging desktop tools as standalone executables.
              </p>
            </div>
          </div>

        </motion.div>
      </section>

      {/* ── Skills ── */}
      <section id="skills" className="py-24 px-6 md:px-12 bg-muted/20 border-y border-border/50 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-1"
          >
            <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
              // skills
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Technical Arsenal</h2>
          </motion.div>

          <motion.div
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {[
              {
                title: "Python · AI · Vision",
                value: 90,
                data: pythonData,
                desc: <>Advanced Python: <span className="font-semibold text-emerald-500">CV, AI, IoT, GUI</span></>,
                def: "bg-emerald-500/15",
                hi: "bg-emerald-500",
              },
              {
                title: "Embedded & IoT",
                value: 85,
                data: embeddedData,
                desc: <>ESP32, RPi, Arduino, <span className="font-semibold text-cyan-500">Deneyap, IMU</span></>,
                def: "bg-cyan-500/15",
                hi: "bg-cyan-500",
              },
              {
                title: "Web & Desktop",
                value: 78,
                data: webData,
                desc: <>React, Vite, Electron, <span className="font-semibold text-teal-500">FastAPI</span></>,
                def: "bg-teal-500/15",
                hi: "bg-teal-500",
              },
              {
                title: "AI & Computer Vision",
                value: 88,
                data: aiData,
                desc: <>YOLOv11, ByteTrack, <span className="font-semibold text-emerald-400">SAHI, GMC</span></>,
                def: "bg-emerald-500/15",
                hi: "bg-emerald-400",
              },
            ].map((s) => (
              <motion.div key={s.title} variants={fadeUp}>
                <StatsCard
                  title={s.title}
                  currentValue={s.value}
                  valuePostfix="%"
                  chartData={s.data}
                  description={s.desc}
                  defaultBarColor={s.def}
                  highlightedBarColor={s.hi}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Tech tags */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap gap-2"
          >
            {[
              "Python","C++","Kotlin","TypeScript","React","Electron","Vite",
              "FastAPI","Flask","OpenCV","YOLOv8/v11","ByteTrack","SAHI",
              "Blender bpy","PyInstaller","Arduino","ESP32","Raspberry Pi",
              "Deneyap","Nextion HMI","Wear OS","RFID","IMU","STM32","LoRa",
              "Fusion 360","SolidWorks","Docker","Git","Roboflow",
            ].map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-[11px] font-mono rounded border border-border bg-muted/40 text-muted-foreground hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-default"
              >
                {tech}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Projects — Mission Archive ── */}
      <section id="projects" className="py-24 px-6 md:px-12 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex items-end justify-between gap-4 flex-wrap"
          >
            <div className="space-y-1">
              <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
                // projects
              </p>
              <h2 className="text-3xl md:text-4xl font-bold">Mission Archive</h2>
              <p className="text-muted-foreground text-sm font-mono">
                {projects.filter((p) => p.status === "ACTIVE").length} active ·{" "}
                {projects.filter((p) => p.status === "COMPLETE").length} complete ·{" "}
                <span className="text-muted-foreground/60">click to expand brief</span>
              </p>
            </div>
            {openProject !== null && (
              <button
                onClick={() => setOpenProject(null)}
                className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-emerald-400 transition-colors border border-border rounded px-3 py-1.5 hover:border-emerald-500/30"
              >
                <X size={12} /> collapse all
              </button>
            )}
          </motion.div>

          <motion.div
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                isOpen={openProject === project.id}
                onToggle={() =>
                  setOpenProject(openProject === project.id ? null : project.id)
                }
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Experience ── */}
      <section id="experience" className="py-24 px-6 md:px-12 bg-muted/20 border-y border-border/50 scroll-mt-20">
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-1"
          >
            <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
              // experience
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Activities & Roles</h2>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                org: "IEEE Ege University Student Branch",
                role: "Computer Society Chairperson",
                period: "Sept 2024 – Present",
                icon: Shield,
                borderColor: "border-emerald-500/40",
                points: [
                  "Led the Computer Society committee, managing 6 technical sub-teams",
                  "Designed and instructed a 5-week Arduino & Circuit Design training course (C++ / Embedded)",
                  "Coordinated major events; represented university at CSCAMP & Ege Regional Meeting",
                ],
              },
              {
                org: "TEKNOFEST 2026",
                role: "Team Captain ×2 · Embedded Lead ×2",
                period: "2025–2026",
                icon: Rocket,
                borderColor: "border-cyan-500/40",
                points: [
                  "LAÇİN & TUYGUN — Aerial AI systems, YOLOv11 detection, custom data pipelines",
                  "EGE ODBARS — Autonomous UGV, ODBARS NEXUS GCS (React+Vite+Electron), Synthetic Dataset Gen",
                  "EGENODE — Dynamic Logistics Robot, Deneyap firmware, RFID + IMU + 4-DOF arm system",
                ],
              },
              {
                org: "Competitions & Conferences",
                role: "Competitor · Attendee",
                period: "2024–2025",
                icon: Wifi,
                borderColor: "border-teal-500/40",
                points: [
                  "IEEEXtreme — Global 24-hour algorithmic programming hackathon",
                  "Google DevFest — Industry professionals & emerging technologies engagement",
                ],
              },
            ].map((exp, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`rounded-lg border ${exp.borderColor} bg-card p-5 space-y-3`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <exp.icon size={15} className="text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{exp.org}</h3>
                      <p className="text-emerald-500 text-xs font-mono mt-0.5">{exp.role}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <ul className="space-y-1.5 pl-11">
                  {exp.points.map((p, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-emerald-500/60 mt-[3px] shrink-0 text-xs font-mono">▸</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 md:px-12 scroll-mt-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-emerald-500 font-mono text-xs tracking-widest uppercase">
              // contact
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">Let&apos;s Build Something</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Open to collaboration on robotics, AI, and embedded systems projects.
              Currently deep in TEKNOFEST 2026 — but always interested in meaningful connections.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <a
              href="mailto:serhanensar0@gmail.com"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors text-sm font-medium"
            >
              <Mail size={15} /> serhanensar0@gmail.com
            </a>
            <a
              href="https://linkedin.com/in/serhan-ensar-budun/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors text-sm"
            >
              <Linkedin size={15} /> LinkedIn
            </a>
            <a
              href="https://github.com/SerhanEnsar"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-colors text-sm"
            >
              <Github size={15} /> GitHub
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-6 px-6 text-center text-xs font-mono text-muted-foreground">
        <p>
          © 2026 · Serhan Ensar Büdün
        </p>
      </footer>

      {/* ── Fixed System Monitor ── */}
      <SystemMonitor />
    </main>
  );
}
