// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { record } from "@/lib/progress";
import {
  ACTIONS,
  INITIAL,
  RESOURCES,
  SURFACES,
  VIEW,
  fanOut,
  legsFor,
  nodeAt,
  type Action,
  type HomeState,
  type Leg,
  type NodeId,
} from "@/lib/homeagent";
import type { Dictionary } from "@/content/dictionaries";

const AMBER = "#ffb020";
const ICE = "#8fc5dc";
const LINE = "#232c33";
const BONE = "#e8e4dd";
const DIM = "#6b7076";

const NODE_W = 190;
const NODE_H = 62;

type Run = { action: Action; legs: Leg[]; index: number; fan: boolean };

/** Where a node's edge anchor sits — links meet boxes, not their centres. */
function anchor(id: NodeId, towardX: number) {
  const n = nodeAt(id);
  const half = NODE_W / 2;
  if (Math.abs(towardX - n.x) < 4) return { x: n.x, y: n.y };
  return { x: n.x + (towardX > n.x ? half : -half), y: n.y };
}

function Box({
  id,
  label,
  sub,
  active,
  children,
}: {
  id: NodeId;
  label: string;
  sub?: string;
  active: boolean;
  children?: React.ReactNode;
}) {
  const n = nodeAt(id);
  const w = id === "hub" ? NODE_W + 40 : NODE_W;
  const h = id === "hub" ? NODE_H + 26 : NODE_H;
  return (
    <g transform={`translate(${n.x - w / 2}, ${n.y - h / 2})`}>
      <rect
        width={w}
        height={h}
        fill="#0b0f13"
        stroke={active ? AMBER : LINE}
        strokeWidth={1}
        style={{ transition: "stroke 200ms" }}
      />
      <text
        x={14}
        y={22}
        fill={active ? AMBER : DIM}
        fontSize={10}
        letterSpacing={2}
        style={{ fontFamily: "var(--font-mono, monospace)", transition: "fill 200ms" }}
      >
        {label.toUpperCase()}
      </text>
      {sub && (
        <text
          x={14}
          y={42}
          fill={BONE}
          fontSize={13}
          style={{ fontFamily: "var(--font-mono, monospace)" }}
        >
          {sub}
        </text>
      )}
      {children}
    </g>
  );
}

export function HomeMesh({ dict }: { dict: Dictionary }) {
  const copy = dict.mesh;
  const still = useReducedMotion();

  const [state, setState] = useState<HomeState>(INITIAL);
  const [run, setRun] = useState<Run | null>(null);
  const seen = useRef(false);

  const legText = useCallback(
    (key: string) => copy.legs[key as keyof typeof copy.legs] ?? key,
    [copy],
  );

  const fire = useCallback(
    (action: Action) => {
      if (!seen.current) {
        seen.current = true;
        record("instrument:mesh");
      }
      // With motion switched off the packets would be invisible anyway, so the
      // hub simply answers: the state lands and the readings agree at once.
      if (still) {
        setState((s) => action.apply(s));
        return;
      }
      setRun({ action, legs: legsFor(action, legText), index: 0, fan: false });
    },
    [still, legText],
  );

  // One timer per leg. Every setState here runs from the timeout, never from
  // the effect body, so the run advances without cascading renders.
  useEffect(() => {
    if (!run) return;
    const ms = run.fan ? 700 : run.legs[run.index].ms;
    const timer = window.setTimeout(() => {
      setRun((prev) => {
        if (!prev) return null;
        if (prev.fan) return null;
        const next = prev.index + 1;
        if (next < prev.legs.length) return { ...prev, index: next };
        // Last leg home: the hub commits, then tells everyone at once.
        setState((s) => prev.action.apply(s));
        return { ...prev, fan: true };
      });
    }, ms);
    return () => window.clearTimeout(timer);
  }, [run]);

  const leg = run && !run.fan ? run.legs[run.index] : null;
  const activeIds = new Set<NodeId>();
  if (run) {
    activeIds.add(run.action.from);
    activeIds.add("hub");
    if (run.fan) SURFACES.forEach((s) => activeIds.add(s));
    if (leg) {
      activeIds.add(leg.from);
      activeIds.add(leg.to);
    }
  }

  const reading = (id: string) =>
    id === "watch"
      ? `${state.diskPercent}%`
      : id === "web"
        ? `${state.containers} ${copy.state.containers}`
        : id === "phone"
          ? `${state.files}`
          : id === "panel"
            ? state.lamp
              ? copy.state.on
              : copy.state.off
            : `${state.diskPercent}%`;

  return (
    <div className="border border-line bg-surface/40">
      <div className="border-b border-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-signal">
          {copy.eyebrow}
        </p>
      </div>

      <div className="px-5 pb-6 pt-5">
        <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
          {copy.title}
        </h3>
        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-dim">{copy.intro}</p>

        {/* Fire from any surface. Which one it starts at is part of the point —
            the hub does not care, and the answer still reaches all five. */}
        <div className="mt-6 flex flex-wrap gap-2.5">
          {ACTIONS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => fire(a)}
              disabled={Boolean(run)}
              className="border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-dim transition-colors enabled:hover:border-signal enabled:hover:text-signal disabled:opacity-40"
            >
              {copy.actions[a.id as keyof typeof copy.actions]}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto">
          <svg
            viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
            className="h-auto w-full min-w-[720px]"
            role="img"
            aria-label={copy.title}
          >
            {/* Every client speaks to the hub, and the hub to every resource.
                Drawn once, dim, so the live leg reads against them. */}
            {SURFACES.map((s) => {
              const a = anchor(s, nodeAt("hub").x);
              const b = anchor("hub", nodeAt(s).x);
              return (
                <line
                  key={`l-${s}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={LINE}
                  strokeWidth={1}
                />
              );
            })}
            {RESOURCES.map((r) => {
              const a = anchor("hub", nodeAt(r).x);
              const b = anchor(r, nodeAt("hub").x);
              return (
                <line
                  key={`r-${r}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={LINE}
                  strokeWidth={1}
                />
              );
            })}
            <line
              x1={nodeAt("hub").x}
              y1={nodeAt("hub").y - (NODE_H + 26) / 2}
              x2={nodeAt("ai").x}
              y2={nodeAt("ai").y + NODE_H / 2}
              stroke={LINE}
              strokeWidth={1}
              strokeDasharray="4 5"
            />

            {SURFACES.map((s) => (
              <Box
                key={s}
                id={s}
                label={copy.nodes[s as keyof typeof copy.nodes]}
                sub={reading(s)}
                active={activeIds.has(s)}
              >
                <text
                  x={NODE_W - 14}
                  y={42}
                  textAnchor="end"
                  fill={DIM}
                  fontSize={9}
                  letterSpacing={1}
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {nodeAt(s).transport}
                </text>
              </Box>
            ))}
            {RESOURCES.map((r) => (
              <Box
                key={r}
                id={r}
                label={copy.nodes[r as keyof typeof copy.nodes]}
                active={activeIds.has(r)}
              />
            ))}
            <Box id="ai" label={copy.nodes.ai} sub="Gemini 2.5 Flash" active={activeIds.has("ai")} />
            <Box
              id="hub"
              label={copy.nodes.hub}
              sub="Raspberry Pi 5 · FastAPI"
              active={activeIds.has("hub")}
            />

            {/* The packet. One per leg; five at once for the fan-out, which is
                the only moment where the whole point is visible. */}
            {leg &&
              (() => {
                const a = anchor(leg.from, nodeAt(leg.to).x);
                const b = anchor(leg.to, nodeAt(leg.from).x);
                if (leg.from === leg.to) return null;
                return (
                  <motion.circle
                    key={`${run?.action.id}-${run?.index}`}
                    r={5}
                    fill={AMBER}
                    initial={{ cx: a.x, cy: a.y }}
                    animate={{ cx: b.x, cy: b.y }}
                    transition={{ duration: leg.ms / 1000, ease: "linear" }}
                  />
                );
              })()}

            {run?.fan &&
              fanOut(legText).map((f) => {
                const a = anchor(f.from, nodeAt(f.to).x);
                const b = anchor(f.to, nodeAt(f.from).x);
                return (
                  <motion.circle
                    key={`fan-${f.to}`}
                    r={5}
                    fill={ICE}
                    initial={{ cx: a.x, cy: a.y }}
                    animate={{ cx: b.x, cy: b.y }}
                    transition={{ duration: f.ms / 1000, ease: "linear" }}
                  />
                );
              })}
          </svg>
        </div>

        {/* What the hub is doing right now, in its own words. */}
        <p
          aria-live="polite"
          className="mt-5 min-h-[1.5rem] font-mono text-[11px] tracking-[0.18em] text-signal"
        >
          {run
            ? run.fan
              ? `${copy.legs.sync} → ${SURFACES.length}`
              : `${leg?.label}`
            : copy.idle}
        </p>
      </div>
    </div>
  );
}
