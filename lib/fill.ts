// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Substitutes `{name}` placeholders in a dictionary string.
 *
 * Its own module rather than a corner of `utils`: the rover simulation writes
 * its telemetry through this, and that file is deliberately free of every
 * dependency — no DOM, no React, no class-name machinery.
 */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match,
  );
}
