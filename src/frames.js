// The painted panels behind the quest screens. One sheet off disk, cut into the frames
// named in content/looks.js and stretched by nine-slice, so a panel is the same ironwork
// at any size it is asked for.

import { COLORS } from '../tuning.js';
import { UI } from '../content/looks.js';

export function preloadFrames(scene) {
  if (!scene.textures.exists(UI.sheet)) scene.load.image(UI.sheet, UI.sheet);
}

// The cuts, named on the sheet's own texture. Nothing is copied and no second texture is
// made: a frame is a rectangle with a name on it.
export function buildFrames(scene) {
  const tex = scene.textures.get(UI.sheet);
  for (const [name, f] of Object.entries(UI.frames)) {
    if (!tex.has(name)) tex.add(name, 0, ...f.at);
  }
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

// A frame at a rectangle, and the shade over its flat that lets text be read on it.
// Returns them back to front, for whatever is drawing to add in that order. A panel is
// never drawn smaller than its own edges: a short card grows to its frame rather than
// crushing it.
export function framed(scene, name, rect, night) {
  const f = UI.frames[name];
  const [l, r, t, b] = f.slice;
  const w = Math.max(rect.w, l + r);
  const h = Math.max(rect.h, t + b);
  const nine = scene.add
    .nineslice(rect.x, rect.y, UI.sheet, name, w, h, l, r, t, b)
    .setOrigin(0, 0);
  if (night) nine.setTint(COLORS.questNightTint); // the same cold the landscape takes
  // the board inside the rails, not the box the text is written in: a shade that stops
  // short of the rails reads as a second frame drawn inside the first
  const [fl, fr, ft, fb] = f.flat;
  const g = scene.add.graphics();
  g.fillStyle(night ? COLORS.questNightFill : COLORS.menuFill, f.shade);
  g.fillRect(rect.x + fl, rect.y + ft, w - fl - fr, h - ft - fb);
  return [nine, g];
}
