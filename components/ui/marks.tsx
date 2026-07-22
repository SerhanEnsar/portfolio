// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * The page's structural vocabulary, borrowed from the detection overlay the
 * models in these projects produce. Every mark carries information — a real
 * metric, a real count, a real state. Nothing here is decorative.
 */

/** Section eyebrow: an index and a name, the way a mission log labels a leg. */
export function SectionMark({
  index,
  label,
  className,
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-dim",
        className,
      )}
    >
      <span className="text-signal">{index}</span>
      <span className="h-px w-8 bg-line" aria-hidden="true" />
      {label}
    </p>
  );
}

/**
 * Detection bracket. `confidence` is only ever passed a number that exists
 * somewhere real — a measured mAP, a counted team, a shipped project.
 */
export function Bracket({
  children,
  confidence,
  className,
}: {
  children: ReactNode;
  confidence?: string;
  className?: string;
}) {
  return (
    <div className={cn("bracket px-4 py-3", className)}>
      {confidence && (
        <span className="absolute -top-2 right-3 bg-void px-1.5 font-mono text-[10px] tracking-widest text-signal">
          {confidence}
        </span>
      )}
      {children}
    </div>
  );
}

/** Live status. The only element on the page allowed to pulse. */
export function StatusDot({ live }: { live: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        live ? "status-live bg-lock" : "bg-dim",
      )}
      aria-hidden="true"
    />
  );
}

/** Monospace data readout — the register used for anything measured. */
export function Readout({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{label}</p>
      <p className="font-mono text-sm text-bone">{value}</p>
    </div>
  );
}
