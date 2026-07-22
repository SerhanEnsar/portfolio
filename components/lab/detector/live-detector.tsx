// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { record } from "@/lib/progress";
import { type Dictionary } from "@/content/dictionaries";
import { fill } from "@/lib/fill";
import { MODEL } from "./model.config";
import { contentRect, drawDetections } from "./overlay";
import type { DetectorBox, DetectorRequest, DetectorResponse } from "./protocol";

/**
 * Live object detection, entirely on the visitor's device.
 *
 * Nothing downloads until the sensor is switched on: the 3.6 MB model and the
 * runtime that executes it are behind the button, which is the whole reason
 * this lives on its own route rather than on the home page.
 *
 * If the camera is unavailable — no permission, no device, an embedded
 * browser — the demo does not degrade into an apology. It runs on a file the
 * visitor picks instead, on the same code path, still without a single byte
 * leaving the machine.
 */

type Phase = "idle" | "starting" | "live" | "denied" | "unsupported" | "failed";

type Source = HTMLVideoElement | HTMLCanvasElement;

export function LiveDetector({ dict }: { dict: Dictionary }) {
  const copy = dict.lab.detector;

  const [phase, setPhase] = useState<Phase>("idle");
  const [note, setNote] = useState("");
  const [backend, setBackend] = useState("");
  /** Which element is showing. Mirrored into state because the render needs it
   *  and refs are not readable during render. */
  const [kind, setKind] = useState<"video" | "still" | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sourceRef = useRef<Source | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const rafRef = useRef(0);
  /** One frame in flight at a time — the model, not the display, sets the pace. */
  const busyRef = useRef(false);
  /** A photo has one frame in it; detecting it sixty times a second would burn
   *  a core to redraw the identical boxes. */
  const singleShotRef = useRef(false);
  const lastResultRef = useRef(0);
  const fpsRef = useRef(0);

  const msStat = useRef<HTMLSpanElement>(null);
  const fpsStat = useRef<HTMLSpanElement>(null);
  const countStat = useRef<HTMLSpanElement>(null);

  /** Per-frame numbers go straight to the DOM; re-rendering at 30 Hz to print
   *  three integers would be the most expensive thing on the page. */
  const paint = useCallback((boxes: DetectorBox[], inferenceMs: number) => {
    const overlay = overlayRef.current;
    const source = sourceRef.current;
    if (!overlay || !source) return;

    const naturalWidth =
      source instanceof HTMLVideoElement ? source.videoWidth : source.width;
    const naturalHeight =
      source instanceof HTMLVideoElement ? source.videoHeight : source.height;
    if (!naturalWidth || !naturalHeight) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(overlay.clientWidth * dpr);
    const height = Math.round(overlay.clientHeight * dpr);
    if (overlay.width !== width || overlay.height !== height) {
      overlay.width = width;
      overlay.height = height;
    }

    const ctx = overlay.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawDetections(
      ctx,
      boxes,
      contentRect(naturalWidth, naturalHeight, overlay.clientWidth, overlay.clientHeight),
    );

    const now = performance.now();
    if (lastResultRef.current) {
      const instant = 1000 / Math.max(1, now - lastResultRef.current);
      // Smoothed: an unsmoothed counter is unreadable and reads as instability.
      fpsRef.current = fpsRef.current ? fpsRef.current * 0.8 + instant * 0.2 : instant;
    }
    lastResultRef.current = now;

    if (msStat.current) msStat.current.textContent = `${inferenceMs}`;
    // Left at its placeholder for a still: a frame rate would be a fiction.
    if (fpsStat.current && fpsRef.current)
      fpsStat.current.textContent = fpsRef.current.toFixed(0);
    if (countStat.current) countStat.current.textContent = `${boxes.length}`;
  }, []);

  const release = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
      video.removeAttribute("src");
      video.load();
    }
    sourceRef.current = null;
    busyRef.current = false;
    lastResultRef.current = 0;
    fpsRef.current = 0;
  }, []);

  useEffect(() => release, [release]);

  /** Starts the frame pump: hand a frame over whenever the worker is free. */
  const pump = useCallback(() => {
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const worker = workerRef.current;
      const source = sourceRef.current;
      if (!worker || !source || busyRef.current) return;
      if (source instanceof HTMLVideoElement && source.readyState < 2) return;

      busyRef.current = true;
      createImageBitmap(source).then(
        (bitmap) => {
          const message: DetectorRequest = { type: "frame", bitmap };
          worker.postMessage(message, [bitmap]);
        },
        () => {
          busyRef.current = false;
        },
      );
    };
    tick();
  }, []);

  const startWorker = useCallback(
    () =>
      new Promise<void>((resolve, reject) => {
        const worker = new Worker(new URL("./worker.ts", import.meta.url), {
          type: "module",
        });

        worker.onmessage = (event: MessageEvent<DetectorResponse>) => {
          const message = event.data;
          if (message.type === "ready") {
            setBackend(message.backend);
            resolve();
          } else if (message.type === "result") {
            busyRef.current = false;
            if (singleShotRef.current) cancelAnimationFrame(rafRef.current);
            paint(message.boxes, message.inferenceMs);
          } else {
            busyRef.current = false;
            reject(new Error(message.message));
          }
        };
        worker.onerror = () => reject(new Error("worker failed to start"));

        workerRef.current = worker;
        const init: DetectorRequest = { type: "init" };
        worker.postMessage(init);
      }),
    [paint],
  );

  const begin = useCallback(
    async (attach: () => Promise<Source>) => {
      if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") {
        setPhase("unsupported");
        return;
      }

      setNote("");
      setPhase("starting");
      try {
        // The source is attached first: the model download and the camera
        // permission prompt then overlap instead of queueing.
        const [source] = await Promise.all([attach(), startWorker()]);
        sourceRef.current = source;
        singleShotRef.current = !(source instanceof HTMLVideoElement);
        setKind(source instanceof HTMLVideoElement ? "video" : "still");
        setPhase("live");
        record("instrument:detector");
        pump();
      } catch (error) {
        release();
        const name = error instanceof DOMException ? error.name : "";
        if (name === "NotAllowedError" || name === "NotFoundError") {
          setPhase("denied");
        } else {
          setPhase("failed");
          setNote(error instanceof Error ? error.message : String(error));
        }
      }
    },
    [pump, release, startWorker],
  );

  const startCamera = () =>
    begin(async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();
      return video;
    });

  const startFile = (file: File) =>
    begin(async () => {
      if (file.type.startsWith("image/")) {
        const bitmap = await createImageBitmap(file);
        const canvas = stillRef.current!;
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
        bitmap.close();
        return canvas;
      }

      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      const video = videoRef.current!;
      video.srcObject = null;
      video.src = url;
      video.loop = true;
      await video.play();
      return video;
    });

  const stop = () => {
    release();
    overlayRef.current
      ?.getContext("2d")
      ?.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
    setKind(null);
    setPhase("idle");
  };

  const showVideo = phase === "live" && kind === "video";
  const showStill = phase === "live" && kind === "still";

  return (
    <section className="border border-line bg-surface">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal">
            {copy.eyebrow}
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
            {copy.title}
          </h2>
        </div>
        {phase === "live" && (
          <button
            type="button"
            onClick={stop}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim transition-colors hover:text-alert"
          >
            {copy.stop}
          </button>
        )}
      </header>

      <div className="relative aspect-video w-full overflow-hidden bg-void">
        <video
          ref={videoRef}
          playsInline
          muted
          aria-label={copy.title}
          className={`absolute inset-0 h-full w-full object-contain ${
            showVideo ? "" : "invisible"
          }`}
        />
        <canvas
          ref={stillRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-contain ${
            showStill ? "" : "invisible"
          }`}
        />
        <canvas
          ref={overlayRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {phase !== "live" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
            {phase === "starting" ? (
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
                {copy.loading}
              </p>
            ) : (
              <>
                {phase !== "idle" && (
                  <p className="max-w-sm font-mono text-[11px] leading-relaxed text-dim">
                    {phase === "denied" && copy.denied}
                    {phase === "unsupported" && copy.unsupported}
                    {phase === "failed" && `${copy.failed} ${note}`}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {phase !== "unsupported" && (
                    <>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="border border-signal px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void"
                      >
                        {copy.activate}
                      </button>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="border border-line px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-dim transition-colors hover:border-ice hover:text-ice"
                      >
                        {copy.useFile}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        // The labelled button above is the control; leaving the raw input in
        // the tree would offer the same action twice, once unnamed.
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file twice still fires a change.
          event.target.value = "";
          if (file) startFile(file);
        }}
      />

      <dl className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
        {[
          { label: copy.statInference, ref: msStat, unit: "ms" },
          { label: copy.statFps, ref: fpsStat, unit: "" },
          { label: copy.statObjects, ref: countStat, unit: "" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface px-5 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
              {stat.label}
            </dt>
            <dd className="mt-1 font-mono text-lg text-signal">
              <span ref={stat.ref}>—</span>
              {stat.unit && <span className="ml-1 text-xs text-dim">{stat.unit}</span>}
            </dd>
          </div>
        ))}
        <div className="bg-surface px-5 py-3">
          <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
            {copy.statBackend}
          </dt>
          <dd className="mt-1 font-mono text-sm text-ice">{backend || "—"}</dd>
        </div>
      </dl>

      <footer className="space-y-2 border-t border-line px-5 py-4">
        <p className="font-mono text-[11px] leading-relaxed text-lock">{copy.privacy}</p>
        <p className="max-w-2xl text-[13px] leading-relaxed text-dim">
          {fill(copy.model, {
            model: MODEL.name,
            licence: MODEL.licence,
            size: MODEL.inputSize,
          })}
        </p>
      </footer>
    </section>
  );
}
