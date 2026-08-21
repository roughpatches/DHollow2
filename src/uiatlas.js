// What the minigame kit draws its widgets from. Two sources, because a widget is one of
// two things.
//
// The furniture — the square an activity is worked on and the trough a marker runs along
// — is painted, cut from the same parchment sheet every screen in Dreadhollow is drawn
// on. StarScape shipped these as part of a painted ui.png that does not exist here, and
// they used to be drawn in code: a grey box with a thin outline, landing on top of the
// painted page a bench had already opened. Now the bench and the work on it are the same
// paper.
//
// The instruments are still generated. A gradient that runs cold to scorch, a dial a
// plumb bob swings across, a bar that fills — these change shape as they are played and
// are read rather than looked at, so there is nothing to paint. They are drawn into a
// canvas at boot the way everything in src/textures.js is, under the same 'ui' texture
// key and the same frame names StarScape used, so an imported engine cannot tell.

import { COLORS, hex } from '../tuning.js';
import { UI } from '../content/looks.js';

const U = COLORS.ui;
const ATLAS_W = 256;
const PAD = 2;

// left/right/top/bottom insets that must not stretch when a frame is 9-sliced
const B = (l, r = l, t = l, b = t) => ({ left: l, right: r, top: t, bottom: b });

// The painted furniture: where it is cut from the town's parchment sheet, and the edges
// that must not stretch. Both were sitting unused on that sheet — the trough at the top
// of it and the square at the bottom right — and both are the shape they are being asked
// to be, so nothing is being stretched into a proportion it was never painted in.
const SHEET = UI.sheets.town;
const PAINTED = {
  panel: { at: [160, 168, 57, 57], slice: [6, 6, 6, 6] },
  track: { at: [80, 32, 161, 17], slice: [6, 6, 3, 3] },
};

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

// a plain colour block, for the fills and bands that are never sliced
const solid = (fill) => (ctx, x, y, w, h) => {
  ctx.fillStyle = hex(fill);
  ctx.fillRect(x, y, w, h);
};

// A marker is read against painted parchment now, which is nearly as pale as the marker
// used to be. So it is a light core inside a dark edge: the core takes whatever an engine
// tints it, and the edge stays dark whatever that tint is — multiplying a near-black by a
// colour leaves it near-black — so a marker keeps its outline on the paper whichever
// thing it is currently saying.
const pipped = (core, edge) => (ctx, x, y, w, h) => {
  ctx.fillStyle = hex(edge);
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = hex(core);
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
};

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
  ['sweetspot_band', 16, 12, B(3, 3, 0, 0), (c, x, y, w, h) => {
    c.globalAlpha = 0.45;
    c.fillStyle = hex(U.grass);
    c.fillRect(x, y, w, h);
    c.globalAlpha = 1;
  }],
  ['marker', 6, 16, null, pipped(U.goldBright, U.ink)],

  ['heat_gauge', 64, 16, null, heat],
  ['lean_gauge', 48, 48, null, leanFace],
  ['lean_band', 10, 14, null, solid(U.grass)],
  ['lean_marker', 6, 26, null, pipped(U.goldBright, U.ink)],
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

// Where a frame is drawn from, and the edges that must not stretch: a texture key, a name
// on it, and the four insets. Generated and painted frames come back the same shape, so
// whatever is drawing does not have to know which it asked for.
//
// A painted cut is named on the sheet's own texture the first time it is wanted, not at
// boot — the sheet is still loading while the atlas is generated (src/scenes/Dialogue.js
// says the same of its own panel), and nothing asks for one of these until an activity
// starts, which is long after the town is standing. Named with a prefix so the kit can
// never collide with a frame content/looks.js cuts from the same sheet.
export function uiSource(scene, name) {
  const p = PAINTED[name];
  if (p) {
    const frame = `ui_${name}`;
    const tex = scene.textures.get(SHEET);
    if (!tex.has(frame)) tex.add(frame, 0, ...p.at);
    return { key: SHEET, frame, slice: p.slice };
  }
  const f = ART.ui.frames.find((o) => o.name === name);
  if (!f) return null;
  const b = f.border;
  return { key: 'ui', frame: name, slice: b && [b.left, b.right, b.top, b.bottom] };
}
