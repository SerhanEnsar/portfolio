// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Resolver half of `alias-hook.mjs`. Maps `@/x` to `<repo>/x`, trying the
 * extensions a TypeScript import is allowed to omit.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXTENSIONS = ["", ".ts", ".tsx", ".mjs", ".js", "/index.ts"];

export function resolve(specifier, context, next) {
  if (!specifier.startsWith("@/")) return next(specifier, context);

  const base = path.join(root, specifier.slice(2));
  for (const ext of EXTENSIONS) {
    const candidate = base + ext;
    if (existsSync(candidate)) {
      return next(pathToFileURL(candidate).href, context);
    }
  }
  return next(specifier, context);
}
