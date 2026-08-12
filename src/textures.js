// Placeholder art, generated at boot for everyone content/looks.js has no drawn art
// for. A character named there loads their frames from disk under these same key
// names instead — see src/art.js — so nothing downstream cares which they are.

import { TUNING, COLORS, PALETTES } from '../tuning.js';

const TS = TUNING.tileSize;
const AW = 16; // actor frame width
const AH = 22; // actor frame height
export const PORTRAIT_PX = 40; // portrait art is square and drawn once per palette

// Tile index in the generated strip == position in this list.
export const TILE_NAMES = [
  'grass', 'path', 'dirt', 'water', 'tree', 'wall', 'roof', 'door', 'wood', 'stone',
  'well', 'grave', 'bar', 'forge', 'shelf', 'altar', 'pew', 'crate', 'hearth', 'rug',
  'treetop', 'sand', 'flotsam', 'spar', 'bed',
];

export const TILE_INDEX = Object.fromEntries(TILE_NAMES.map((n, i) => [n, i]));

const DIRS = ['down', 'up', 'left', 'right'];

function fill(g, c, x, y, w, h, a = 1) {
  g.fillStyle(c, a);
  g.fillRect(x, y, w, h);
}

function base(g, ox, c) {
  fill(g, c, ox, 0, TS, TS);
}

function specks(g, ox, c, pts, w = 2, h = 1) {
  g.fillStyle(c, 1);
  for (const [x, y] of pts) g.fillRect(ox + x, y, w, h);
}

function stripes(g, ox, c, ys, h = 1) {
  g.fillStyle(c, 1);
  for (const y of ys) g.fillRect(ox, y, TS, h);
}

const TILE_DRAW = {
  grass: (g, o) => {
    base(g, o, COLORS.grass[0]);
    specks(g, o, COLORS.grass[1], [[2, 3], [9, 5], [5, 10], [12, 12], [7, 14], [13, 2]]);
  },
  path: (g, o) => {
    base(g, o, COLORS.path[0]);
    specks(g, o, COLORS.path[1], [[1, 2], [8, 4], [4, 9], [11, 11], [2, 13]], 4, 2);
  },
  dirt: (g, o) => {
    base(g, o, COLORS.dirt[0]);
    specks(g, o, COLORS.dirt[1], [[3, 2], [10, 6], [6, 11], [13, 13]]);
  },
  water: (g, o) => {
    base(g, o, COLORS.water[0]);
    specks(g, o, COLORS.water[1], [[2, 4], [9, 9], [5, 13]], 5, 1);
  },
  tree: (g, o) => {
    base(g, o, COLORS.grass[0]);
    fill(g, COLORS.tree[1], o + 7, 10, 2, 6);
    fill(g, COLORS.tree[0], o + 2, 1, 12, 10);
    fill(g, COLORS.tree[0], o + 1, 3, 14, 7);
    specks(g, o, COLORS.grass[1], [[4, 3], [10, 6], [6, 8]]);
  },
  wall: (g, o) => {
    base(g, o, COLORS.wall[0]);
    stripes(g, o, COLORS.wall[1], [5, 11]);
    g.fillStyle(COLORS.wall[1], 1);
    g.fillRect(o + 4, 0, 1, 5);
    g.fillRect(o + 11, 6, 1, 5);
    g.fillRect(o + 4, 12, 1, 4);
  },
  roof: (g, o) => {
    base(g, o, COLORS.roof[0]);
    stripes(g, o, COLORS.roof[1], [4, 9, 14]);
    specks(g, o, COLORS.roof[1], [[3, 6], [11, 11]], 3, 2);
  },
  door: (g, o) => {
    base(g, o, COLORS.wall[0]);
    fill(g, COLORS.door[0], o + 3, 2, 10, 14);
    fill(g, COLORS.door[1], o + 10, 8, 2, 2);
    fill(g, COLORS.door[1], o + 3, 5, 10, 1);
  },
  wood: (g, o) => {
    base(g, o, COLORS.wood[0]);
    stripes(g, o, COLORS.wood[1], [5, 11]);
  },
  stone: (g, o) => {
    base(g, o, COLORS.stone[0]);
    specks(g, o, COLORS.stone[1], [[0, 7], [8, 3], [8, 12]], 8, 1);
  },
  well: (g, o) => {
    base(g, o, COLORS.grass[0]);
    fill(g, COLORS.well[0], o + 1, 1, 14, 14);
    fill(g, COLORS.well[1], o + 4, 4, 8, 8);
  },
  grave: (g, o) => {
    base(g, o, COLORS.grass[0]);
    fill(g, COLORS.grave[1], o + 4, 12, 8, 2);
    fill(g, COLORS.grave[0], o + 5, 3, 6, 10);
  },
  bar: (g, o) => {
    base(g, o, COLORS.bar[0]);
    fill(g, COLORS.bar[1], o, 0, TS, 5);
  },
  forge: (g, o) => {
    base(g, o, COLORS.stone[0]);
    fill(g, COLORS.forge[0], o + 2, 3, 12, 13);
    fill(g, COLORS.forge[1], o + 5, 6, 6, 4);
  },
  shelf: (g, o) => {
    base(g, o, COLORS.wood[0]);
    fill(g, COLORS.shelf[0], o + 1, 1, 14, 14);
    specks(g, o, COLORS.shelf[1], [[2, 3], [6, 3], [10, 3], [2, 9], [6, 9], [10, 9]], 3, 4);
  },
  altar: (g, o) => {
    base(g, o, COLORS.stone[0]);
    fill(g, COLORS.altar[0], o + 3, 4, 10, 12);
    fill(g, COLORS.altar[1], o + 1, 2, 14, 3);
  },
  pew: (g, o) => {
    base(g, o, COLORS.wood[0]);
    fill(g, COLORS.pew[1], o, 3, TS, 2);
    fill(g, COLORS.pew[0], o, 6, TS, 6);
  },
  crate: (g, o) => {
    base(g, o, COLORS.wood[0]);
    fill(g, COLORS.crate[0], o + 2, 3, 12, 12);
    g.fillStyle(COLORS.crate[1], 1);
    g.fillRect(o + 2, 8, 12, 1);
    g.fillRect(o + 7, 3, 1, 12);
  },
  hearth: (g, o) => {
    base(g, o, COLORS.stone[0]);
    fill(g, COLORS.hearth[0], o + 1, 1, 14, 14);
    fill(g, COLORS.hearth[1], o + 5, 7, 6, 6);
  },
  rug: (g, o) => {
    base(g, o, COLORS.wood[0]);
    fill(g, COLORS.rug[0], o + 1, 2, 14, 12);
    fill(g, COLORS.rug[1], o + 4, 5, 8, 6);
  },
  bed: (g, o) => {
    base(g, o, COLORS.wood[0]);
    fill(g, COLORS.bed[0], o + 1, 2, 14, 13);
    fill(g, COLORS.bed[1], o + 2, 3, 12, 4);
  },
  sand: (g, o) => {
    base(g, o, COLORS.sand[0]);
    specks(g, o, COLORS.sand[1], [[2, 4], [9, 2], [5, 11], [12, 9], [7, 14]], 3, 1);
  },
  flotsam: (g, o) => {
    base(g, o, COLORS.sand[0]);
    specks(g, o, COLORS.sand[1], [[11, 3], [3, 13]], 3, 1);
    fill(g, COLORS.flotsam[1], o + 2, 6, 11, 2);
    fill(g, COLORS.flotsam[1], o + 6, 10, 8, 2);
    fill(g, COLORS.wood[0], o + 4, 2, 5, 2);
  },
  spar: (g, o) => {
    base(g, o, COLORS.sand[0]);
    fill(g, COLORS.spar[0], o + 1, 4, 14, 8);
    fill(g, COLORS.spar[1], o + 1, 6, 14, 1);
    fill(g, COLORS.spar[1], o + 1, 10, 14, 1);
  },
  // the slice of a tree that draws over actors: crown only, so someone standing
  // below the treeline loses their head to the leaves and not their whole body
  treetop: (g, o) => {
    fill(g, COLORS.tree[0], o + 2, 1, 12, 7);
    fill(g, COLORS.tree[0], o + 1, 3, 14, 5);
    specks(g, o, COLORS.grass[1], [[4, 3], [10, 6]]);
  },
};

function drawActor(g, p, dir, frame) {
  const lift = frame === 1 ? 1 : 0;

  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(8, 20, 12, 5);

  // legs: one strides forward on frame 1
  fill(g, p.trim, 4, 15, 3, frame === 1 ? 6 : 5);
  fill(g, p.trim, 9, 15, 3, frame === 1 ? 4 : 5);

  fill(g, p.head, 2, 9 - lift, 2, 5); // arms
  fill(g, p.head, 12, 9 - lift, 2, 5);

  fill(g, p.body, 3, 8 - lift, 10, 8);
  fill(g, p.trim, 3, 12 - lift, 10, 1);

  fill(g, p.head, 4, 2 - lift, 8, 7);

  if (dir === 'up') {
    fill(g, p.hair, 4, 1 - lift, 8, 7);
  } else if (dir === 'down') {
    fill(g, p.hair, 4, 1 - lift, 8, 3);
    fill(g, 0x15120f, 5, 6 - lift, 2, 1);
    fill(g, 0x15120f, 9, 6 - lift, 2, 1);
  } else if (dir === 'left') {
    fill(g, p.hair, 4, 1 - lift, 8, 3);
    fill(g, p.hair, 9, 1 - lift, 3, 6);
    fill(g, 0x15120f, 5, 6 - lift, 2, 1);
  } else {
    fill(g, p.hair, 4, 1 - lift, 8, 3);
    fill(g, p.hair, 4, 1 - lift, 3, 6);
    fill(g, 0x15120f, 9, 6 - lift, 2, 1);
  }
}

// Head-and-shoulders bust for the dialogue panel, front-on, built from the same four
// palette colours as the walking sprite so a face and its body always match.
function drawPortrait(g, p) {
  const P = PORTRAIT_PX;
  fill(g, COLORS.portraitBack, 0, 0, P, P);

  fill(g, p.body, 1, 30, 38, 10); // shoulders, run out to the frame so the bust doesn't float
  fill(g, p.body, 6, 28, 28, 2);
  fill(g, p.trim, 1, 30, 38, 2); // collar
  fill(g, p.head, 16, 25, 8, 6); // neck
  fill(g, 0x000000, 16, 25, 8, 2, 0.25); // and the jaw's shadow across it

  fill(g, p.head, 12, 7, 16, 20); // head
  fill(g, 0x000000, 12, 7, 3, 20, 0.16); // light comes from the right
  fill(g, 0x000000, 12, 24, 16, 3, 0.12); // under the cheekbones

  fill(g, p.hair, 11, 4, 18, 6); // crown
  fill(g, p.hair, 10, 5, 4, 13); // and a lock down each side
  fill(g, p.hair, 26, 5, 4, 13);
  fill(g, 0x000000, 12, 12, 16, 2, 0.22); // brow shadow

  fill(g, 0x15120f, 16, 15, 3, 2); // eyes
  fill(g, 0x15120f, 22, 15, 3, 2);
  fill(g, 0x000000, 19, 17, 2, 3, 0.18); // nose
  fill(g, 0x15120f, 18, 21, 4, 1); // mouth
}

// Face down where the tide left them. One frame; the scene does not need more.
function drawProne(g, p) {
  g.fillStyle(0x000000, 0.3);
  g.fillEllipse(9, 19, 15, 4);
  fill(g, p.trim, 1, 13, 5, 3); // legs
  fill(g, p.body, 3, 10, 9, 7); // back
  fill(g, p.trim, 6, 10, 2, 7);
  fill(g, p.head, 4, 16, 4, 2); // an arm out at an angle
  fill(g, p.head, 11, 9, 5, 6); // head, turned away
  fill(g, p.hair, 12, 8, 4, 4);
}

export function proneKey(palette) {
  return `prone_${palette}`;
}

export function portraitKey(palette) {
  return `portrait_${palette}`;
}

export function actorFrame(palette, dir, frame) {
  return `${palette}_${dir}_${frame}`;
}

export function walkAnim(palette, dir) {
  return `${palette}_walk_${dir}`;
}

export function buildTextures(scene) {
  if (scene.textures.exists('tiles16')) return;

  // the generated strip, at the size it is drawn at. src/art.js blows it up to tilePx
  // and paints real ground over whichever tiles have any.
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  TILE_NAMES.forEach((name, i) => TILE_DRAW[name](g, i * TS));
  g.generateTexture('tiles16', TILE_NAMES.length * TS, TS);
  g.destroy();

  for (const name of Object.keys(PALETTES)) {
    const pg = scene.make.graphics({ x: 0, y: 0 }, false);
    drawPortrait(pg, PALETTES[name]);
    pg.generateTexture(portraitKey(name), PORTRAIT_PX, PORTRAIT_PX);
    pg.destroy();

    const lg = scene.make.graphics({ x: 0, y: 0 }, false);
    drawProne(lg, PALETTES[name]);
    lg.generateTexture(proneKey(name), AW, AH);
    lg.destroy();

    for (const dir of DIRS) {
      for (const frame of [0, 1]) {
        const a = scene.make.graphics({ x: 0, y: 0 }, false);
        drawActor(a, PALETTES[name], dir, frame);
        a.generateTexture(actorFrame(name, dir, frame), AW, AH);
        a.destroy();
      }
      const key = walkAnim(name, dir);
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: [{ key: actorFrame(name, dir, 0) }, { key: actorFrame(name, dir, 1) }],
          frameRate: TUNING.walkFrameRate,
          repeat: -1,
        });
      }
    }
  }
}
