// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent } from "framer-motion";
import {
  createFullscreenProgram,
  createPointerTracker,
  startRenderLoop,
} from "@/lib/gl";
import { useSceneActive, useSequenceProgress } from "./pinned-scene";

/**
 * A depth field of luminous points on a loose grid, pushed through by scroll
 * and parallaxed by the pointer.
 *
 * Twelve depth slices, each a jittered hash grid scaled by its distance.
 * Points near a cell centre glow; the faint cell edges give the field its
 * lattice reading. Warm bone by default with amber nodes — the page's own
 * amber-on-near-black language — and only a rare ice-blue spark, so the
 * field sits with the rest of the site instead of reading cold against it.
 */
const FRAGMENT = `#version 300 es
precision highp float;

out vec4 fragColor;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uPointer;
uniform float uProgress;

const int SLICES = 12;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 col = vec3(0.0);
  // Scroll drives the field forward; time keeps it alive when parked.
  float travel = uTime * 0.035 + uProgress * 1.6;

  for (int i = 0; i < SLICES; i++) {
    float fi = float(i);
    float z = fract(fi / float(SLICES) + travel);

    // Far slices are dense and small, near ones sparse and large.
    float scale = mix(9.0, 0.9, z);
    // Fade in from the horizon and out past the camera, so nothing pops.
    float fade = smoothstep(0.0, 0.18, z) * smoothstep(1.0, 0.72, z);

    vec2 p = uv * scale
           + uPointer * (1.0 - z) * 1.4
           + vec2(fi * 13.7, fi * 7.3);

    vec2 cell = floor(p);
    vec2 f = fract(p) - 0.5;

    float h = hash21(cell);
    vec2 jitter = (vec2(h, fract(h * 57.31)) - 0.5) * 0.72;

    float d = length(f - jitter);
    float glow = 0.016 / (d + 0.014);

    // Warm bone field, amber nodes as the accent, and a rare ice spark for
    // depth — the same warm-on-black balance the rest of the page holds.
    vec3 tint = vec3(0.82, 0.79, 0.72);
    if (h > 0.90) tint = vec3(1.00, 0.69, 0.13);
    else if (h < 0.05) tint = vec3(0.56, 0.77, 0.86);

    col += tint * glow * fade * 0.55;

    // Hairline cell edges — the links between points, cheaply.
    float edge = min(abs(f.x), abs(f.y));
    col += tint * smoothstep(0.035, 0.0, edge) * fade * 0.022;
  }

  // Seat the field on the site's ground colour and vignette the corners.
  vec3 ground = vec3(0.031, 0.043, 0.055);
  float vignette = 1.0 - 0.55 * dot(uv, uv);
  fragColor = vec4((ground + col) * vignette, 1.0);
}`;

export function LatticeStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const active = useSceneActive();
  const progress = useSequenceProgress();
  const progressRef = useRef(0);
  const [failed, setFailed] = useState(false);

  useMotionValueEvent(progress, "change", (value) => {
    progressRef.current = value;
  });

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = createFullscreenProgram(canvas, FRAGMENT);
    if (!scene) {
      // No WebGL2, or the shader would not build: fall back to the flat
      // gradient rather than leaving a black hole in the page.
      setFailed(true);
      return;
    }

    const pointer = createPointerTracker();
    const uResolution = scene.uniform("uResolution");
    const uTime = scene.uniform("uTime");
    const uPointer = scene.uniform("uPointer");
    const uProgress = scene.uniform("uProgress");

    const stop = startRenderLoop(canvas, (seconds) => {
      scene.fit();
      const { x, y } = pointer.update(seconds);
      scene.gl.uniform2f(uResolution, canvas.width, canvas.height);
      scene.gl.uniform1f(uTime, seconds);
      scene.gl.uniform2f(uPointer, x, y);
      scene.gl.uniform1f(uProgress, progressRef.current);
      scene.draw();
    });

    return () => {
      stop();
      pointer.dispose();
      scene.dispose();
    };
  }, [active]);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_20%,#141a20,#080b0e)]"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
