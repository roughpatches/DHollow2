// The 'ui' atlas the minigame kit draws from, generated at boot the way everything else
// in src/textures.js is. StarScape shipped this as a painted ui.png plus a generated
// manifest; neither exists here, so the frames are drawn instead. Same texture key, same
// frame names, same 9-slice borders — src/minigames/ui.js cannot tell the difference.
//
// The frame table is built at module load so ART.ui.frames is ready for anything that
// reads it at import time. buildUiAtlas(scene) is what actually paints the canvas.

import { COLORS, hex } from '../tuning.js';

const U = COLORS.ui;
const ATLAS_W = 256;
const PAD = 2;

// left/right/top/bottom insets that must not stretch when a frame is 9-sliced
const B = (l, r = l, t = l, b = t) => ({ left: l, right: r, top: t, bottom: b });

function box(ctx, x, y, w, h, fill, edge, inner) {
  ctx.fillStyle = hex(fill);
  ctx.fillRect(x, y, w, h);
  if (edge) {
    ctx.strokeStyle = hex(edge);
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  if (inner) {
    ctx.strokeStyle = hex(inner);
    ctx.strokeRect(x + 2.5, y + 2.5, w - 5, h - 5);
  }
}

// a plain colour block, for the fills and markers that are never sliced
const solid = (fill) => (ctx, x, y, w, h) => {
  ctx.fillStyle = hex(fill);
  ctx.fillRect(x, y, w, h);
};

function hatched(ctx, x, y, w, h, c) {
  ctx.strokeStyle = hex(c);
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = -h; i < w; i += 4) {
    ctx.moveTo(x + i + 0.5, y + h);
    ctx.lineTo(x + i + h + 0.5, y);
  }
  ctx.stroke();
}

// A ribbon behind a judgment word. The engines pop these on every scored input, so they
// are wide enough for PERFECT and flat enough to read at a glance.
const ribbon = (fill) => (ctx, x, y, w, h) => {
  ctx.fillStyle = hex(fill);
  ctx.beginPath();
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + w - 5, y);
  ctx.lineTo(x + w, y + h / 2);
  ctx.lineTo(x + w - 5, y + h);
  ctx.lineTo(x + 5, y + h);
  ctx.lineTo(x, y + h / 2);
  ctx.closePath();
  ctx.fill();
};

const barTrack = (ctx, x, y, w, h) => box(ctx, x, y, w, h, U.inset, U.edge);

// cold at one end, the band you want in the middle, scorch at the other
function heat(ctx, x, y, w, h) {
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, hex(U.cool));
  g.addColorStop(0.45, hex(U.gold));
  g.addColorStop(0.6, hex(U.goldBright));
  g.addColorStop(1, hex(U.danger));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = hex(U.edge);
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

// The face a plumb-bob swings across: an arc with the safe centre marked. src/minigames
// hangs the marker from the top of this and swings it, so only the dial is drawn here.
function leanFace(ctx, x, y, w, h) {
  const cx = x + w / 2;
  const cy = y + h * 0.08;
  ctx.strokeStyle = hex(U.rule);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, h * 0.62, Math.PI * 0.25, Math.PI * 0.75);
  ctx.stroke();
  ctx.strokeStyle = hex(U.edge);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + h * 0.62);
  ctx.stroke();
}

// name, size, optional 9-slice border, and how it is painted
const SPEC = [
  ['panel', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, U.panel, U.edge, U.rule)],
  ['panel_inset', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, U.inset, U.rule)],
  ['hud_plate', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, U.inset, U.edge)],
  ['dialogue_box', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, COLORS.dialogueFill, COLORS.dialogueEdge)],

  // all four button states share one geometry, so the kit can swap frames on hover
  ['btn', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, COLORS.menuSelectFill, U.gold)],
  ['btn_hover', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, U.panel, U.goldBright, U.gold)],
  ['btn_pressed', 24, 24, B(8), (c, x, y, w, h) => box(c, x, y, w, h, U.inset, U.gold)],
  ['btn_locked', 24, 24, B(8), (c, x, y, w, h) => {
    box(c, x, y, w, h, U.inset, U.rule);
    hatched(c, x + 2, y + 2, w - 4, h - 4, U.rule);
  }],

  ['track', 24, 14, B(6, 6, 3, 3), (c, x, y, w, h) => box(c, x, y, w, h, U.inset, U.edge)],
  ['sweetspot_band', 16, 12, B(3, 3, 0, 0), (c, x, y, w, h) => {
    c.globalAlpha = 0.45;
    c.fillStyle = hex(U.grass);
    c.fillRect(x, y, w, h);
    c.globalAlpha = 1;
  }],
  ['marker', 6, 16, null, solid(U.goldBright)],

  ['slot', 24, 24, B(6), (c, x, y, w, h) => box(c, x, y, w, h, U.inset, U.edge)],
  ['slot_equipped', 24, 24, B(6), (c, x, y, w, h) => box(c, x, y, w, h, U.panel, U.gold)],
  ['slot_empty', 24, 24, B(6), (c, x, y, w, h) => box(c, x, y, w, h, U.stage, U.rule)],

  ['heat_gauge', 64, 16, null, heat],
  ['lean_gauge', 48, 48, null, leanFace],
  ['lean_band', 10, 14, null, solid(U.grass)],
  ['lean_marker', 6, 26, null, solid(U.goldBright)],
];

for (const [name, colour] of Object.entries(COLORS.uiRibbons)) {
  SPEC.push([name, 64, 20, null, ribbon(colour)]);
}

// every bar kind is a track and a fill, and nothing else
for (const [kind, colour] of Object.entries(COLORS.uiBars)) {
  SPEC.push([`${kind}_track`, 24, 12, B(3), barTrack]);
  SPEC.push([`${kind}_fill`, 16, 8, null, solid(colour)]);
}

// Shelf-packed left to right, wrapping at ATLAS_W. Nothing reads the positions but the
// atlas itself, so the packing only has to not overlap.
const frames = [];
let penX = PAD;
let penY = PAD;
let shelf = 0;
for (const [name, w, h, border, draw] of SPEC) {
  if (penX + w + PAD > ATLAS_W) {
    penX = PAD;
    penY += shelf + PAD;
    shelf = 0;
  }
  frames.push({ name, x: penX, y: penY, w, h, ...(border ? { border } : {}), draw });
  penX += w + PAD;
  shelf = Math.max(shelf, h);
}
const ATLAS_H = penY + shelf + PAD;

// Shaped like the manifest StarScape generated from its painted sheet, because
// src/minigames/ui.js reads ART.ui.frames for names and 9-slice borders.
export const ART = {
  ui: { w: ATLAS_W, h: ATLAS_H, frames: frames.map(({ draw, ...f }) => f) },
};

export function buildUiAtlas(scene) {
  if (scene.textures.exists('ui')) return;
  const tex = scene.textures.createCanvas('ui', ATLAS_W, ATLAS_H);
  const ctx = tex.getContext();
  for (const f of frames) f.draw(ctx, f.x, f.y, f.w, f.h);
  tex.refresh();
  for (const f of frames) tex.add(f.name, 0, f.x, f.y, f.w, f.h);
}
