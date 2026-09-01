// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

/**
 * HomeAgent's topology, and what happens when something is asked of it.
 *
 * The project's claim is one hub and a set of client surfaces that stay in
 * agreement. A still diagram cannot show agreement — it only shows wiring. So
 * this models the part that matters: a request leaves one surface, the hub
 * authorises it, acts, and the new state fans back out to *every* surface at
 * once. The surfaces are only in harmony because none of them holds state.
 *
 * Geometry is normalised to the viewBox below so the component maps rather
 * than computes, and the whole module stays DOM-free.
 */

export const VIEW = { w: 1200, h: 460 };

export type SurfaceId = "web" | "phone" | "watch" | "panel" | "telegram";
export type ResourceId = "files" | "docker" | "system";
export type NodeId = SurfaceId | ResourceId | "hub" | "ai";

export type Node = {
  id: NodeId;
  x: number;
  y: number;
  /** Transport this client actually speaks to the hub over. */
  transport?: string;
};

/** Surfaces down the left, the hub in the middle, what it acts on at the right. */
export const NODES: Node[] = [
  { id: "web", x: 120, y: 62, transport: "HTTP" },
  { id: "phone", x: 120, y: 146, transport: "HTTP" },
  { id: "watch", x: 120, y: 230, transport: "HTTP · 3 s" },
  { id: "panel", x: 120, y: 314, transport: "HTTP" },
  { id: "telegram", x: 120, y: 398, transport: "Bot API" },

  { id: "ai", x: 580, y: 74 },
  { id: "hub", x: 580, y: 250 },

  { id: "files", x: 1070, y: 130 },
  { id: "docker", x: 1070, y: 250 },
  { id: "system", x: 1070, y: 370 },
];

export const SURFACES: SurfaceId[] = ["web", "phone", "watch", "panel", "telegram"];
export const RESOURCES: ResourceId[] = ["files", "docker", "system"];

export function nodeAt(id: NodeId): Node {
  const n = NODES.find((v) => v.id === id);
  if (!n) throw new Error(`unknown node: ${id}`);
  return n;
}

/** The readings every surface shows. One copy, held by the hub. */
export type HomeState = {
  diskPercent: number;
  containers: number;
  files: number;
  lamp: boolean;
};

export const INITIAL: HomeState = {
  diskPercent: 62,
  containers: 4,
  files: 1284,
  lamp: false,
};

export type Action = {
  id: string;
  /** Which surface the request starts from. */
  from: SurfaceId;
  /** Which resource the hub ends up touching. */
  to: ResourceId;
  /** The route the hub serves it on — these are the app's real ones. */
  endpoint: string;
  /**
   * Natural language goes through the model first; a button press does not.
   * The model decides *what was meant*, never what the answer is — the reading
   * still comes from the machine.
   */
  viaAi?: boolean;
  apply: (s: HomeState) => HomeState;
};

export const ACTIONS: Action[] = [
  {
    id: "disk",
    from: "watch",
    to: "system",
    endpoint: "GET /api/status",
    apply: (s) => ({ ...s, diskPercent: s.diskPercent }),
  },
  {
    id: "upload",
    from: "phone",
    to: "files",
    endpoint: "POST /api/files/upload",
    apply: (s) => ({ ...s, files: s.files + 1 }),
  },
  {
    id: "docker",
    from: "web",
    to: "docker",
    endpoint: "POST /api/docker/stop",
    apply: (s) => ({ ...s, containers: Math.max(0, s.containers - 1) }),
  },
  {
    id: "lamp",
    from: "telegram",
    to: "system",
    endpoint: "POST /api/chat",
    viaAi: true,
    apply: (s) => ({ ...s, lamp: !s.lamp }),
  },
  {
    id: "trash",
    from: "panel",
    to: "files",
    endpoint: "POST /api/files/trash",
    apply: (s) => ({ ...s, files: Math.max(0, s.files - 1) }),
  },
];

/**
 * A run is a sequence of legs. Every leg is a packet crossing one edge, so the
 * component only ever has to animate "from this node to that one".
 */
export type Leg = { from: NodeId; to: NodeId; label: string; ms: number };

export function legsFor(action: Action, t: (key: string) => string): Leg[] {
  const legs: Leg[] = [
    { from: action.from, to: "hub", label: t("request"), ms: 620 },
    { from: "hub", to: "hub", label: t("auth"), ms: 380 },
  ];
  if (action.viaAi) {
    legs.push({ from: "hub", to: "ai", label: t("intent"), ms: 520 });
    legs.push({ from: "ai", to: "hub", label: t("decision"), ms: 520 });
  }
  legs.push({ from: "hub", to: action.to, label: action.endpoint, ms: 560 });
  legs.push({ from: action.to, to: "hub", label: t("result"), ms: 460 });
  return legs;
}

/** The fan-out is one leg per surface, run together rather than in turn. */
export function fanOut(t: (key: string) => string): Leg[] {
  return SURFACES.map((id) => ({
    from: "hub" as NodeId,
    to: id as NodeId,
    label: t("sync"),
    ms: 700,
  }));
}
