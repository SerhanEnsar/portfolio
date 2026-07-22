// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * The smallest WebGL2 surface the scenes need: compile a fragment shader,
 * draw it over the viewport, keep the backing store honest, and stop when
 * nobody is looking.
 *
 * Deliberately not a 3D library. Everything on this site is either a
 * fullscreen fragment shader or 2D canvas, and three.js would cost more than
 * the scenes it would draw.
 */

/** Never render more backing pixels than a 2× display can show. */
export const MAX_DPR = 2;

/**
 * One triangle covering the viewport. Larger than the screen on purpose —
 * a single triangle avoids the diagonal seam two triangles can show and
 * costs one less vertex.
 */
const VERTEX_SOURCE = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export type FullscreenProgram = {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  /** Cached uniform lookup — `getUniformLocation` is not free per frame. */
  uniform: (name: string) => WebGLUniformLocation | null;
  /** Resizes the backing store to match layout. True when it changed. */
  fit: () => boolean;
  draw: () => void;
  dispose: () => void;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // Surfacing this matters: a silent shader failure looks like a blank scene.
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Returns null whenever WebGL2 is unavailable or the shader fails to build,
 * so callers can fall back rather than render nothing.
 */
export function createFullscreenProgram(
  canvas: HTMLCanvasElement,
  fragmentSource: string,
): FullscreenProgram | null {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  gl.useProgram(program);
  // WebGL2 requires a bound VAO to draw, even with no attributes.
  gl.bindVertexArray(gl.createVertexArray());

  const locations = new Map<string, WebGLUniformLocation | null>();

  return {
    gl,
    program,
    uniform(name) {
      if (!locations.has(name)) {
        locations.set(name, gl.getUniformLocation(program, name));
      }
      return locations.get(name) ?? null;
    },
    fit() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (width === canvas.width && height === canvas.height) return false;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      return true;
    },
    draw() {
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

/**
 * A render loop that only runs when it should: paused while the tab is hidden
 * or the scene is off screen, and reduced to a single frame when the visitor
 * has asked for less motion.
 *
 * `frame` receives seconds since start. Returns a stop function.
 */
export function startRenderLoop(
  element: Element,
  frame: (seconds: number) => void,
): () => void {
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) {
    // One frame, so the scene is composed rather than blank, then nothing.
    frame(0);
    return () => {};
  }

  let raf = 0;
  let visible = !document.hidden;
  let onScreen = false;
  const start = performance.now();

  const tick = () => {
    frame((performance.now() - start) / 1000);
    raf = requestAnimationFrame(tick);
  };

  const sync = () => {
    const shouldRun = visible && onScreen;
    if (shouldRun && !raf) raf = requestAnimationFrame(tick);
    if (!shouldRun && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  observer.observe(element);

  const onVisibility = () => {
    visible = !document.hidden;
    sync();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    if (raf) cancelAnimationFrame(raf);
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

/**
 * Pointer position as -1..1 across the viewport, eased toward the target so
 * the scene drifts rather than snaps. Falls back to a slow automatic sweep on
 * touch devices — asking for gyroscope permission unprompted would be rude,
 * and a motionless scene reads as broken.
 */
export function createPointerTracker() {
  const value = { x: 0, y: 0 };
  let targetX = 0;
  let targetY = 0;
  let pointerSeen = false;

  const onPointer = (event: PointerEvent) => {
    pointerSeen = true;
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    targetY = (event.clientY / window.innerHeight) * 2 - 1;
  };

  // Android reports orientation without a prompt; iOS stays silent, which the
  // automatic sweep below covers.
  const onOrientation = (event: DeviceOrientationEvent) => {
    if (event.gamma === null || event.beta === null) return;
    pointerSeen = true;
    targetX = Math.max(-1, Math.min(1, event.gamma / 45));
    targetY = Math.max(-1, Math.min(1, (event.beta - 45) / 45));
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("deviceorientation", onOrientation);

  return {
    /** Call once per frame before reading `value`. */
    update(seconds: number) {
      if (!pointerSeen) {
        targetX = Math.sin(seconds * 0.11) * 0.5;
        targetY = Math.cos(seconds * 0.08) * 0.3;
      }
      value.x += (targetX - value.x) * 0.04;
      value.y += (targetY - value.y) * 0.04;
      return value;
    },
    dispose() {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onOrientation);
    },
  };
}
