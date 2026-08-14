// Placeholder item icons, generated at boot the way src/textures.js draws everything
// else the game has no art for. An icon is one shape and one pair of colours, and no
// more than that: a drawn icon loaded under the same key later replaces it and nothing
// downstream knows the difference.
//
// A material's icon is its id, so content/materials.js names none. Anything else names
// one — see `icon` in content/character.js. Anything naming an icon that isn't here
// still gets a square, drawn as UNKNOWN.

import { COLORS } from '../tuning.js';
import { SKILL_ART } from '../content/looks.js';

const PX = 16; // drawn small and scaled up in the menu, like every other placeholder here

function fill(g, c, x, y, w, h) {
  g.fillStyle(c, 1);
  g.fillRect(x, y, w, h);
}

// Each takes the two colours of its ink: the body of the thing, and the mark on it.
const SHAPES = {
  planks: (g, [a, b]) => {
    for (const y of [3, 7, 11]) {
      fill(g, a, 1, y, 14, 3);
      fill(g, b, 1, y, 14, 1);
    }
  },
  block: (g, [a, b]) => {
    fill(g, a, 2, 4, 12, 9);
    fill(g, b, 2, 4, 12, 2);
    fill(g, b, 8, 8, 4, 1);
  },
  spikes: (g, [a, b]) => {
    for (const x of [3, 7, 11]) {
      fill(g, a, x, 4, 2, 9);
      fill(g, b, x - 1, 3, 4, 2);
    }
  },
  pot: (g, [a, b]) => {
    fill(g, a, 3, 5, 10, 9);
    fill(g, b, 5, 2, 6, 3);
    fill(g, b, 3, 8, 10, 1);
  },
  sheet: (g, [a, b]) => {
    fill(g, a, 2, 3, 12, 11);
    fill(g, b, 2, 6, 12, 1);
    fill(g, b, 2, 10, 12, 1);
  },
  sack: (g, [a, b]) => {
    fill(g, a, 3, 5, 10, 9);
    fill(g, b, 5, 2, 6, 3);
    fill(g, b, 3, 5, 10, 1);
  },
  loaf: (g, [a, b]) => {
    fill(g, a, 2, 6, 12, 7);
    fill(g, a, 4, 4, 8, 2);
    fill(g, b, 5, 8, 2, 1);
    fill(g, b, 9, 9, 2, 1);
  },
  taper: (g, [a, b]) => {
    fill(g, a, 7, 4, 3, 11);
    fill(g, b, 8, 1, 1, 3);
  },
  shard: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(3, 14, 9, 2, 14, 12);
    fill(g, b, 8, 7, 2, 5);
  },
  coil: (g, [a, b]) => {
    for (const y of [4, 8, 12]) {
      g.fillStyle(a, 1);
      g.fillEllipse(8, y, 13, 4);
      g.fillStyle(b, 1);
      g.fillEllipse(8, y, 6, 2);
    }
  },
  pin: (g, [a, b]) => {
    fill(g, a, 7, 3, 2, 12);
    fill(g, b, 4, 1, 8, 2);
  },
  slip: (g, [a, b]) => {
    fill(g, a, 4, 2, 8, 12);
    for (const y of [5, 8, 11]) fill(g, b, 6, y, 4, 1);
  },
  sprig: (g, [a, b]) => {
    fill(g, a, 7, 3, 2, 11);
    fill(g, b, 3, 5, 4, 2);
    fill(g, b, 9, 7, 4, 2);
    fill(g, b, 3, 9, 4, 2);
  },
  fish: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(9, 8, 12, 7);
    g.fillTriangle(1, 4, 1, 12, 6, 8);
    fill(g, b, 6, 7, 6, 1);
    fill(g, b, 12, 6, 1, 1);
  },
  branch: (g, [a, b]) => {
    for (let i = 0; i < 6; i++) fill(g, a, 2 + i * 2, 12 - i * 2, 3, 3);
    fill(g, b, 6, 6, 2, 3);
    fill(g, b, 10, 9, 3, 2);
  },
  log: (g, [a, b]) => {
    fill(g, a, 3, 5, 11, 7);
    g.fillStyle(b, 1);
    g.fillEllipse(4, 8, 5, 7);
  },
  grain: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 14, 14);
    g.fillStyle(b, 1);
    g.fillEllipse(8, 8, 9, 9);
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 4, 4);
  },
  trumpet: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillTriangle(3, 4, 13, 4, 8, 15);
    fill(g, b, 3, 3, 10, 2);
  },
  cap: (g, [a, b]) => {
    fill(g, b, 7, 8, 3, 6);
    g.fillStyle(a, 1);
    g.fillEllipse(8, 7, 13, 8);
  },
  feather: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 7, 8, 12);
    fill(g, b, 8, 2, 1, 13);
  },
  shell: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 10, 13, 11);
    fill(g, b, 2, 9, 12, 1); // broken open, and open from the outside
    fill(g, b, 6, 11, 2, 2);
  },
  arrows: (g, [a, b]) => {
    for (const x of [4, 10]) {
      fill(g, a, x, 3, 2, 12);
      g.fillStyle(b, 1);
      g.fillTriangle(x - 2, 4, x + 4, 4, x + 1, 0);
      fill(g, b, x - 1, 11, 4, 1);
    }
  },
  // One apiece for the skills, for the column down the side of the road. Drawn to be
  // told apart at a glance rather than to be looked at: a hand-drawn one under the same
  // key replaces any of them without a line changing anywhere.
  flask: (g, [a, b]) => {
    fill(g, b, 6, 1, 4, 4);
    g.fillStyle(a, 1);
    g.fillTriangle(2, 15, 14, 15, 8, 4);
    fill(g, b, 5, 11, 6, 1);
  },
  frond: (g, [a, b]) => {
    fill(g, b, 7, 2, 2, 13);
    g.fillStyle(a, 1);
    for (const y of [3, 6, 9]) {
      g.fillTriangle(7, y, 7, y + 4, 1, y + 4);
      g.fillTriangle(9, y, 9, y + 4, 15, y + 4);
    }
  },
  axe: (g, [a, b]) => {
    fill(g, b, 9, 1, 2, 14);
    g.fillStyle(a, 1);
    g.fillTriangle(9, 2, 9, 9, 2, 6);
    fill(g, b, 2, 5, 2, 2);
  },
  sail: (g, [a, b]) => {
    fill(g, b, 8, 1, 1, 12);
    g.fillStyle(a, 1);
    g.fillTriangle(8, 2, 8, 12, 1, 12);
    fill(g, b, 2, 13, 12, 2);
  },
  hook: (g, [a, b]) => {
    fill(g, b, 9, 1, 4, 2); // the eye, across the top of the shank
    fill(g, a, 10, 2, 2, 8); // the shank
    fill(g, a, 8, 9, 2, 3); // round the bend
    fill(g, a, 5, 11, 3, 2);
    fill(g, a, 4, 7, 2, 5); // and up to the point
    fill(g, b, 2, 5, 4, 2); // the barb
  },
  speech: (g, [a, b]) => {
    fill(g, a, 1, 3, 14, 8);
    g.fillStyle(a, 1);
    g.fillTriangle(4, 11, 9, 11, 4, 15);
    for (const x of [4, 7, 10]) fill(g, b, x, 6, 2, 2);
  },
  eye: (g, [a, b]) => {
    g.fillStyle(a, 1);
    g.fillEllipse(8, 8, 15, 9);
    g.fillStyle(b, 1);
    g.fillEllipse(8, 8, 6, 6);
  },
  hammer: (g, [a, b]) => {
    fill(g, b, 6, 5, 2, 10); // the haft, off-centre, so the head is not a letter T
    fill(g, a, 2, 2, 11, 4); // the head, longer on the peen side
    fill(g, a, 13, 3, 1, 2);
    fill(g, b, 2, 2, 11, 1);
  },
};

// [shape, ink]. Ink names a pair in COLORS.icon, so retinting every wooden thing at
// once is one edit in tuning.js.
const ICONS = {
  timber: ['planks', 'wood'],
  stone: ['block', 'stone'],
  nails: ['spikes', 'iron'],
  pitch: ['pot', 'pitch'],
  canvas: ['sheet', 'cloth'],
  brooktrout: ['fish', 'trout'],
  perch: ['fish', 'perch'],
  bluegill: ['fish', 'bluegill'],
  oakbranch: ['branch', 'wood'],
  oaklog: ['log', 'wood'],
  heartwood: ['grain', 'heart'],
  blacktrumpet: ['trumpet', 'soot'],
  oystermushroom: ['cap', 'bone'],
  heronfeather: ['feather', 'ash'],
  eggshell: ['shell', 'shell'],
  greyarrow: ['arrows', 'ash'],
  bread: ['loaf', 'food'],
  candle: ['taper', 'bone'],
  flint: ['shard', 'stone'],
  rope: ['coil', 'cloth'],
  powder: ['pot', 'glass'],
  gravepin: ['pin', 'iron'],
  bellshard: ['shard', 'bronze'],
  tally: ['slip', 'bone'],
  mint: ['sprig', 'herb'],
  waterskin: ['sack', 'wood'],
  // The skills, by their id in content/skills.js — a skill's icon is its id, the way a
  // material's is. These are what stands in for a skill the painted sheet has no cell
  // for, or for all of them until the sheet is in.
  woodcraft: ['frond', 'herb'],
  woodcutting: ['axe', 'iron'],
  fishing: ['hook', 'ash'],
  sailing: ['sail', 'cloth'],
  alchemy: ['flask', 'glass'],
  perception: ['eye', 'glass'],
  charisma: ['speech', 'bone'],
  smithing: ['hammer', 'bronze'],
};

const UNKNOWN = ['block', 'cloth'];

function keyOf(name) {
  return `icon_${name}`;
}

// The texture for a thing, or the unknown square for a thing with no icon named.
export function iconKeyFor(name) {
  return keyOf(ICONS[name] ? name : 'unknown');
}

export function preloadIcons(scene) {
  const { sheet } = SKILL_ART;
  if (sheet && !scene.textures.exists(sheet)) scene.load.image(sheet, sheet);
}

// One cell off the painted sheet, under the name the drawn shape would have had. Returns
// false if there is no cell for this one or the sheet is not in the repo yet, which is
// what sends it back to the generator.
function cutIcon(scene, name) {
  const at = SKILL_ART.at[name];
  if (!at || !scene.textures.exists(SKILL_ART.sheet)) return false;
  const px = SKILL_ART.cell;
  const tex = scene.textures.createCanvas(keyOf(name), px, px);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(scene.textures.get(SKILL_ART.sheet).getSourceImage(),
    (at[0] - 1) * px, (at[1] - 1) * px, px, px, 0, 0, px, px);
  tex.refresh();
  return true;
}

// Painted where there is paint for it, drawn where there is not, and the same key either
// way — so nothing that puts an icon on the screen knows or cares which it got.
export function buildIcons(scene) {
  for (const [name, spec] of [...Object.entries(ICONS), ['unknown', UNKNOWN]]) {
    const key = keyOf(name);
    if (scene.textures.exists(key)) continue;
    if (cutIcon(scene, name)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    SHAPES[spec[0]](g, COLORS.icon[spec[1]]);
    g.generateTexture(key, PX, PX);
    g.destroy();
  }
}
