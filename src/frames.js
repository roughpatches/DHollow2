// The painted panels behind the quest screens. One sheet off disk, cut into the frames
// named in content/looks.js and stretched by nine-slice, so a panel is the same ironwork
// at any size it is asked for.

import { COLORS } from '../tuning.js';
import { UI } from '../content/looks.js';

// what each frame is actually drawn from once boot has had its way with it
const SOURCE = {};

// A line written for a dark board, read back on paper. Same roles, ink instead of light:
// nothing that builds a line has to know which panel it is going to land on.
const INK = new Map([
  [COLORS.menuText, COLORS.inkText],
  [COLORS.menuDim, COLORS.inkDim],
  [COLORS.menuAccent, COLORS.inkAccent],
  [COLORS.menuRule, COLORS.inkRule],
  [COLORS.menuMapFolk, COLORS.inkFolk],
  [COLORS.menuMapMark, COLORS.inkMark],
  [COLORS.menuSelectFill, COLORS.inkSelectFill],
]);

export function preloadFrames(scene) {
  if (!scene.textures.exists(UI.sheet)) scene.load.image(UI.sheet, UI.sheet);
}

// The cuts, named on the sheet's own texture. Nothing is copied and no second texture is
// made for a frame used as painted: it is a rectangle with a name on it. A frame with
// placeholder printing inside it is the exception — that one is washed and kept.
export function buildFrames(scene) {
  const tex = scene.textures.get(UI.sheet);
  for (const [name, f] of Object.entries(UI.frames)) {
    if (!tex.has(name)) tex.add(name, 0, ...f.at);
    SOURCE[name] = f.paper ? { key: washed(scene, name, f) } : { key: UI.sheet, frame: name };
  }
}

// The panel with its printing washed off: the page in the colour the page already is,
// read off a clean patch of it rather than named anywhere, so recolouring the sheet
// recolours this too.
function washed(scene, name, f) {
  const key = `ui_${name}`;
  if (scene.textures.exists(key)) return key;
  const [ax, ay, aw, ah] = f.at;
  const tex = scene.textures.createCanvas(key, aw, ah);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scene.textures.get(UI.sheet).getSourceImage(), ax, ay, aw, ah, 0, 0, aw, ah);

  const [fl, fr, ft, fb] = f.flat;
  const m = f.wash;
  ctx.fillStyle = paperOf(ctx, f.paper[0] - ax, f.paper[1] - ay, f.paper[2], f.paper[3]);
  ctx.fillRect(fl + m, ft + m, aw - fl - fr - m * 2, ah - ft - fb - m * 2);
  tex.refresh();
  return key;
}

// the commonest colour in a patch: what the page is, under its stains
function paperOf(ctx, x, y, w, h) {
  const { data } = ctx.getImageData(x, y, w, h);
  const seen = new Map();
  let best = '#000000';
  let most = 0;
  for (let i = 0; i < data.length; i += 4) {
    const c = `#${[data[i], data[i + 1], data[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
    const n = (seen.get(c) || 0) + 1;
    seen.set(c, n);
    if (n > most) { most = n; best = c; }
  }
  return best;
}

// where the flat of the frame starts, on each side
export function padOf(name) {
  const [l, r, t, b] = UI.frames[name].pad;
  return { l, r, t, b };
}

// the smallest a frame can be drawn: the edges it never stretches, back to back
export function minOf(name) {
  const [l, r, t, b] = UI.frames[name].slice;
  return { w: l + r, h: t + b };
}

// what colour a line takes on this panel
export function inkOf(name, colour) {
  return UI.frames[name].ink ? INK.get(colour) ?? colour : colour;
}

// A frame at a rectangle, and the shade over its board that lets text be read on it.
// Returns them back to front, for whatever is drawing to add in that order. A panel is
// never drawn smaller than its own edges: a short card grows to its frame rather than
// crushing it.
export function framed(scene, name, rect, night) {
  const f = UI.frames[name];
  const [l, r, t, b] = f.slice;
  const w = Math.max(rect.w, l + r);
  const h = Math.max(rect.h, t + b);
  const src = SOURCE[name];
  const nine = scene.add
    .nineslice(rect.x, rect.y, src.key, src.frame, w, h, l, r, t, b)
    .setOrigin(0, 0);
  // The panels take the same cold the landscape does after dark. A page does not: it is
  // held up and read, and ink on a cold page cannot be.
  if (night && !f.ink) nine.setTint(COLORS.questNightTint);
  if (!f.shade) return [nine];
  // the board inside the rails, not the box the text is written in: a shade that stops
  // short of the rails reads as a second frame drawn inside the first
  const [fl, fr, ft, fb] = f.flat;
  const g = scene.add.graphics();
  g.fillStyle(night ? COLORS.questNightFill : COLORS.menuFill, f.shade);
  g.fillRect(rect.x + fl, rect.y + ft, w - fl - fr, h - ft - fb);
  return [nine, g];
}
