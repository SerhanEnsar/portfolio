// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useState } from "react";

/**
 * F0 spike — measurement harness kept as the record of a decision, to be
 * replaced by the real detector in F4.
 *
 * Measured on this machine, YOLOX-Nano at 416×416, single thread:
 *
 *   webgpu   12 ms median (80 fps)   — needs the 6.3 MB jsep wasm
 *   wasm     32 ms median (31 fps)   — needs the 3.5 MB simd wasm
 *
 * WASM ships. 31 fps already exceeds what a live video overlay needs, and the
 * WebGPU path would nearly double the download for frames nobody perceives.
 * WebGPU also paid 633 ms on its first inference compiling kernels, which a
 * visitor would feel as a stall right after granting camera permission.
 *
 * Timing uses a random input tensor — only the cost of a forward pass is
 * being measured here, not preprocessing correctness.
 */

type Result = {
  provider: string;
  status: "ok" | "failed";
  detail: string;
  loadMs?: number;
  firstMs?: number;
  medianMs?: number;
  fps?: number;
};

const RUNS = 12;

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

export function OrtSpike() {
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const [shapes, setShapes] = useState<string>("");

  async function measure(provider: "wasm"): Promise<Result> {
    const ort = await import("onnxruntime-web");

    ort.env.wasm.wasmPaths = "/ort/";
    // No COOP/COEP on this site, so threads are unavailable by design.
    ort.env.wasm.numThreads = 1;

    const loadStart = performance.now();
    let session;
    try {
      session = await ort.InferenceSession.create("/models/yolox_nano.onnx", {
        executionProviders: [provider],
        graphOptimizationLevel: "all",
      });
    } catch (error) {
      return {
        provider,
        status: "failed",
        detail: error instanceof Error ? error.message : String(error),
      };
    }
    const loadMs = performance.now() - loadStart;

    setShapes(
      `in: ${session.inputNames.join(", ")} · out: ${session.outputNames.join(", ")}`,
    );

    const size = 416;
    const data = new Float32Array(1 * 3 * size * size);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 255;
    const feeds = {
      [session.inputNames[0]]: new ort.Tensor("float32", data, [1, 3, size, size]),
    };

    const timings: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const t = performance.now();
      await session.run(feeds);
      timings.push(performance.now() - t);
    }
    await session.release();

    // First run carries kernel compilation; steady state is what the demo feels.
    const [firstMs, ...rest] = timings;
    const med = median(rest);
    return {
      provider,
      status: "ok",
      detail: `${size}×${size}, ${RUNS} runs, 1 thread`,
      loadMs: Math.round(loadMs),
      firstMs: Math.round(firstMs),
      medianMs: Math.round(med),
      fps: Math.round((1000 / med) * 10) / 10,
    };
  }

  async function run() {
    setBusy(true);
    setResults([]);

    const result = await measure("wasm");
    setResults([result]);
    setBusy(false);
  }

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="border border-signal px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-signal transition-colors hover:bg-signal hover:text-void disabled:opacity-40"
      >
        {busy ? "measuring…" : "run benchmark"}
      </button>

      {shapes && <p className="font-mono text-[11px] text-dim">{shapes}</p>}

      {results.length > 0 && (
        <table className="w-full border-collapse font-mono text-xs">
          <thead>
            <tr className="border-b border-line text-left text-dim">
              {["provider", "load", "first", "median", "fps", "detail"].map((h) => (
                <th key={h} className="py-2 pr-4 font-normal uppercase tracking-[0.16em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.provider} className="border-b border-line/60">
                <td className="py-2 pr-4 text-bone">{r.provider}</td>
                <td className="py-2 pr-4 text-dim">{r.loadMs ? `${r.loadMs} ms` : "—"}</td>
                <td className="py-2 pr-4 text-dim">
                  {r.firstMs ? `${r.firstMs} ms` : "—"}
                </td>
                <td className="py-2 pr-4 text-signal">
                  {r.medianMs ? `${r.medianMs} ms` : "—"}
                </td>
                <td className="py-2 pr-4 text-signal">{r.fps ?? "—"}</td>
                <td className="py-2 pr-4 text-dim">{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
