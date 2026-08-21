// Shared pixel UI kit helpers, imported from StarScape. Everything an engine draws comes
// through here, so an engine never names a texture, an inset or a colour of its own.
//
// Changed on import: the frames come from src/uiatlas.js — painted where they are
// furniture, generated where they are instruments — rather than from a painted ui.png
// that does not exist here, and the palettes below read tuning.js instead of carrying
// their own hex values. StarScape's own screen layout came with the kit and was never
// used by anything in this game, which drives its activities from the crawl and the
// bench; it is gone rather than kept warm. A StarScape engine still drops in unchanged.
import { TUNING, COLORS, hex } from '../../tuning.js';
import { ART, uiSource } from '../uiatlas.js';

const FRAME = {};
for (const f of ART.ui.frames) FRAME[f.name] = f;

// A 9-slice panel at (x,y) with the given size. `name` picks the frame (panel, track,
// bar_*_track, …). Falls back to a plain stretched image for a frame with no insets.
// Returns the game object (origin 0.5).
export function panel(scene, x, y, w, h, name = 'panel') {
  const src = uiSource(scene, name);
  if (!src) throw new Error(`ui frame "${name}" not found`);
  if (src.slice) {
    const [l, r, t, b] = src.slice;
    return scene.add.nineslice(x, y, src.key, src.frame, w, h, l, r, t, b);
  }
  return scene.add.image(x, y, src.key, src.frame).setDisplaySize(w, h);
}

// Palette tokens. Every value comes from COLORS.ui in tuning.js, so retinting the kit is
// an edit to that block and nothing here.
export const COLOR = {
  stage: COLORS.ui.stage,
  text: hex(COLORS.ui.text),
  muted: hex(COLORS.ui.muted),
  gold: hex(COLORS.ui.gold),
  goldBright: hex(COLORS.ui.goldBright),
  grass: hex(COLORS.ui.grass),
  danger: hex(COLORS.ui.danger),
  cool: hex(COLORS.ui.cool),
  warn: hex(COLORS.ui.warn),
  onWood: hex(COLORS.ui.text),
  ink: hex(COLORS.ui.ink),
};

// What an activity answers the player with — the tint on a marker, a band, a meter, and
// the word a swing is scored with. Numbers rather than strings, because these are tints
// and fills and not text colours; COLOR above is the strings. Same source, one block
// along, so retinting an activity is an edit to tuning.js and nothing here.
export const JUDGE = { ...COLORS.uiJudgment };

// A line drawn ON the painted plate rather than on the dark behind it. Same roles, ink
// instead of light: the swap src/frames.js already makes wherever a panel turns out to be
// a page, made here for the two engines that draw inside the plate. The hierarchy turns
// over with the ground — on the dark the brightest line is the strongest, and on paper it
// is the darkest — so the kit's brightest maps to the blackest ink and so on down.
const ON_PAPER = new Map([
  [COLORS.ui.goldBright, COLORS.inkText],
  [COLORS.ui.text, COLORS.inkText],
  [COLORS.ui.gold, COLORS.inkAccent],
  [COLORS.ui.muted, COLORS.inkDim],
  [COLORS.ui.rule, COLORS.inkRule],
  [COLORS.ui.cool, COLORS.inkMark],
  [COLORS.ui.grass, COLORS.inkFolk],
  [COLORS.ui.danger, COLORS.inkFolk],
]);
export const inkOn = (colour) => ON_PAPER.get(colour) ?? colour;

// The face, taken off tuning.js the same way the palette is, so an engine that reads its
// colours from the kit reads its lettering from it too.
export const FONT = TUNING.font;

// A feedback ribbon (PERFECT/CLEAN/GOOD/MISS/WILD): the colored fb_* container with
// the label rendered on top. Returns a container.
export function feedback(scene, cx, cy, kind) {
  const name = `fb_${kind.toLowerCase()}`;
  const ribbon = scene.add.image(0, 0, 'ui', FRAME[name] ? name : 'fb_good');
  const txt = scene.add.text(0, -1, kind.toUpperCase(), { fontFamily: FONT, fontSize: '13px', color: COLOR.ink }).setOrigin(0.5);
  return scene.add.container(cx, cy, [ribbon, txt]);
}

// A simple horizontal bar built from a *_track + *_fill pair. Returns
// { container, setValue(pct) } — setValue clips the fill width to 0..1.
export function bar(scene, x, y, w, h, kind = 'bar_hp') {
  const track = panel(scene, x, y, w, h, `${kind}_track`).setOrigin(0, 0.5);
  const f = FRAME[`${kind}_fill`];
  const inset = FRAME[`${kind}_track`]?.border?.left ?? 2;
  const fill = scene.add.image(x + inset, y, 'ui', `${kind}_fill`).setOrigin(0, 0.5);
  const usable = w - inset * 2;
  const setValue = (pct) => {
    const p = Math.max(0, Math.min(1, pct));
    fill.setDisplaySize(usable * p, h - inset * 2);
    fill.setCrop(0, 0, f.w * p, f.h);
    fill.setVisible(p > 0);
  };
  setValue(1);
  return { track, fill, setValue };
}

