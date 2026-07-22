// Copyright (c) 2026 Serhan Ensar Büdün. All rights reserved.

import {
  REST,
  WHEELS,
  WHEEL_RADIUS,
  WORLD,
  groundAt,
  slopeAt,
  type Mission,
} from "@/lib/rover";

/**
 * Everything the mission looks like. Kept apart from the simulation so the
 * physics never reaches for a canvas, and apart from the component so the
 * component is only a loop and some input.
 */

const SKY_TOP = "#080b0e";
const SKY_LOW = "#131a20";
const GROUND = "#090d11";
const RIDGE_FAR = "#0e141a";
const RIDGE_NEAR = "#101820";

/** World pixels the view shows across, once a canvas is wider than this. */
const MIN_VIEW = 780;

const LINE = "#26313a";
const SIGNAL = "#ffb020";
const ICE = "#8fc5dc";
const BONE = "#e6e9ec";
const DIM = "#6e7c87";

/**
 * A ridge line across the viewport, scrolling at a fraction of the camera so
 * the distance reads. Drawn in screen space; `offsetY` carries the same world
 * to screen shift the foreground uses.
 */
function ridge(
  ctx: CanvasRenderingContext2D,
  camera: number,
  width: number,
  height: number,
  factor: number,
  offsetY: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let sx = 0; sx <= width; sx += 12) {
    ctx.lineTo(sx, groundAt(camera * factor + sx) + offsetY);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

function drawRover(ctx: CanvasRenderingContext2D, mission: Mission) {
  const { rover } = mission;
  const aboard = mission.parcels.filter((p) => p.state === "aboard").length;

  const cos = Math.cos(rover.angle);
  const sin = Math.sin(rover.angle);

  // Wheels and rocker links are drawn in world space: each station hangs from
  // the chassis by however much its spring is extended, which is the whole
  // visual point of a rocker-bogie.
  WHEELS.forEach((offset, index) => {
    const ax = rover.x + offset * cos;
    const ay = rover.y + offset * sin;
    // Seated on the ground where there is ground, hanging at full droop where
    // there is not — but never further up than the strut can physically go, or
    // a steep climb pulls the wheel clean through the hull.
    const wheelY = Math.max(
      ay + 14,
      Math.min(groundAt(ax) - WHEEL_RADIUS, ay + REST),
    );

    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax, wheelY);
    ctx.stroke();

    ctx.fillStyle = "#0d1216";
    ctx.strokeStyle = rover.contact[index] ? ICE : DIM;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ax, wheelY, WHEEL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // A spoke, so the wheels visibly turn.
    const spin = rover.x / 15;
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, wheelY);
    ctx.lineTo(ax + Math.cos(spin) * 11, wheelY + Math.sin(spin) * 11);
    ctx.stroke();
  });

  ctx.save();
  ctx.translate(rover.x, rover.y);
  ctx.rotate(rover.angle);

  ctx.fillStyle = "#161d23";
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-56, 6);
  ctx.lineTo(-48, -12);
  ctx.lineTo(40, -12);
  ctx.lineTo(58, 4);
  ctx.lineTo(52, 10);
  ctx.lineTo(-52, 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cargo bay: one lit cell per parcel aboard.
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = LINE;
    ctx.strokeRect(-40 + i * 17, -9, 13, 13);
    if (i < aboard) {
      ctx.fillStyle = SIGNAL;
      ctx.fillRect(-38 + i * 17, -7, 9, 9);
    }
  }

  // Sensor mast, aimed the way it is driving.
  ctx.strokeStyle = ICE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(34, -12);
  ctx.lineTo(34, -30);
  ctx.lineTo(48, -30);
  ctx.stroke();

  ctx.restore();
}

function drawParcels(ctx: CanvasRenderingContext2D, mission: Mission) {
  ctx.font = '600 10px "JetBrains Mono", ui-monospace, monospace';

  for (const parcel of mission.parcels) {
    if (parcel.state !== "waiting") continue;
    const y = groundAt(parcel.x);

    ctx.save();
    ctx.translate(parcel.x, y);
    ctx.rotate(slopeAt(parcel.x));

    ctx.fillStyle = "#141a20";
    ctx.strokeStyle = SIGNAL;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-13, -26, 26, 26);
    ctx.strokeRect(-13, -26, 26, 26);
    ctx.strokeStyle = SIGNAL;
    ctx.beginPath();
    ctx.moveTo(-13, -18);
    ctx.lineTo(13, -18);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = SIGNAL;
    ctx.fillText(parcel.id, parcel.x - 18, y - 34);
  }
}

/**
 * Rocks strewn on the surface. They carry no physics — they are here because
 * an unbroken line gives the eye nothing to measure speed against.
 */
function drawScatter(ctx: CanvasRenderingContext2D, camera: number, width: number) {
  const first = Math.floor((camera - 40) / 70);
  const last = Math.ceil((camera + width + 40) / 70);

  for (let i = first; i <= last; i++) {
    const jitter = Math.abs(Math.sin(i * 91.7) * 1000) % 1;
    const x = i * 70 + jitter * 60;
    const size = 2 + jitter * 5;
    const y = groundAt(x);

    ctx.fillStyle = jitter > 0.72 ? "#1b242c" : "#141b21";
    ctx.beginPath();
    ctx.ellipse(x, y - size * 0.4, size, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDepot(ctx: CanvasRenderingContext2D, label: string) {
  const y = groundAt(WORLD.depot);

  ctx.strokeStyle = SIGNAL;
  ctx.lineWidth = 2;
  for (const side of [-1, 1]) {
    const x = WORLD.depot + side * 62;
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x, y - 54);
    ctx.lineTo(x - side * 22, y - 54);
    ctx.stroke();
  }

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "rgba(255,176,32,0.45)";
  ctx.beginPath();
  ctx.moveTo(WORLD.depot - 62, y - 2);
  ctx.lineTo(WORLD.depot + 62, y - 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = SIGNAL;
  ctx.font = '600 11px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText(label, WORLD.depot - ctx.measureText(label).width / 2, y - 66);
}

export function drawMission(
  ctx: CanvasRenderingContext2D,
  mission: Mission,
  width: number,
  height: number,
  depotLabel: string,
) {
  const sky = ctx.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(1, SKY_LOW);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height);

  // A phone-width canvas showing world pixels one-for-one would put barely two
  // chassis lengths of ground ahead of the rover — not enough warning to lift
  // off before a crest, which is the whole skill of the run. So narrow
  // viewports zoom out until they show the same stretch of world a desktop
  // does, and everything below works in world units.
  const scale = Math.min(1, width / MIN_VIEW);
  const view = width / scale;
  const viewHeight = height / scale;

  ctx.save();
  ctx.scale(scale, scale);

  // The camera keeps the rover left of centre so the ground it is about to
  // meet is always the part you can see most of.
  const camera = mission.rover.x - view * 0.38;
  // World y to screen y. The ground sits just under halfway down, leaving room
  // above for a rover that has just left a ridge.
  const lift = viewHeight * 0.46 - WORLD.datum;

  ridge(ctx, camera, view, viewHeight, 0.35, lift - 66, RIDGE_FAR);
  ridge(ctx, camera, view, viewHeight, 0.62, lift - 28, RIDGE_NEAR);

  ctx.save();
  ctx.translate(-camera, lift);

  // Ground, drawn only across the visible span. The body gets a gradient so
  // the mass below the surface reads as rock the rover is standing on rather
  // than as the bottom of the frame running out.
  // World coordinates: this runs inside the camera transform.
  const rock = ctx.createLinearGradient(0, WORLD.datum - 190, 0, viewHeight - lift);
  rock.addColorStop(0, GROUND);
  rock.addColorStop(1, "#05080a");
  ctx.fillStyle = rock;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(camera - 20, viewHeight * 2);
  for (let x = camera - 20; x <= camera + view + 20; x += 6) {
    ctx.lineTo(x, groundAt(x));
  }
  ctx.lineTo(camera + view + 20, viewHeight * 2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  for (let x = camera - 20; x <= camera + view + 20; x += 6) {
    ctx.lineTo(x, groundAt(x));
  }
  ctx.stroke();

  drawScatter(ctx, camera, view);
  drawDepot(ctx, depotLabel);
  drawParcels(ctx, mission);
  drawRover(ctx, mission);

  ctx.restore();
  ctx.restore();
}

/** Progress along the route, 0..1 — drawn as a thin bar by the component. */
export function routeProgress(mission: Mission) {
  return Math.min(
    1,
    Math.max(0, (mission.rover.x - WORLD.start) / (WORLD.depot - WORLD.start)),
  );
}
