// Placeholder item icons, generated at boot the way src/textures.js draws everything
// else the game has no art for. An icon is one shape and one pair of colours, and no
// more than that: a drawn icon loaded under the same key later replaces it and nothing
// downstream knows the difference.
//
// A material's icon is its id, so content/materials.js names none. Anything else names
// one — see `icon` in content/character.js. Anything naming an icon that isn't here
// still gets a square, drawn as UNKNOWN.

import { COLORS } from '../tuning.js';

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
};

// [shape, ink]. Ink names a pair in COLORS.icon, so retinting every wooden thing at
// once is one edit in tuning.js.
const ICONS = {
  timber: ['planks', 'wood'],
  stone: ['block', 'stone'],
  nails: ['spikes', 'iron'],
  pitch: ['pot', 'pitch'],
  canvas: ['sheet', 'cloth'],
  provisions: ['sack', 'food'],
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
};

const UNKNOWN = ['block', 'cloth'];

function keyOf(name) {
  return `icon_${name}`;
}

// The texture for a thing, or the unknown square for a thing with no icon named.
export function iconKeyFor(name) {
  return keyOf(ICONS[name] ? name : 'unknown');
}

export function buildIcons(scene) {
  for (const [name, spec] of [...Object.entries(ICONS), ['unknown', UNKNOWN]]) {
    const key = keyOf(name);
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    SHAPES[spec[0]](g, COLORS.icon[spec[1]]);
    g.generateTexture(key, PX, PX);
    g.destroy();
  }
}
