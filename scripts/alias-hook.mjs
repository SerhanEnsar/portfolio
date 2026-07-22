// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * Teaches plain `node` the `@/` path alias that tsconfig gives the app.
 *
 *   node --import ./scripts/alias-hook.mjs --experimental-strip-types script.mjs
 *
 * Build scripts import application modules directly — the detection pass runs
 * the very same decode and NMS the browser does — and this is what makes that
 * possible without a second copy of the logic drifting out of sync.
 */

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register(new URL("./alias-resolver.mjs", import.meta.url), pathToFileURL("./"));
