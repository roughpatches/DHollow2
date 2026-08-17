// Placeholder art, generated at boot for everyone content/looks.js has no drawn art
// for: a body, a face, and the shape they are laid out in. A character named there loads
// their frames from disk under these same key names instead — see src/art.js — so nothing
// downstream cares which they are.

import { TUNING, COLORS, PALETTES } from '../tuning.js';
import { LOOKS } from '../content/looks.js';
import { buildUiAtlas } from './uiatlas.js';

// A palette can have drawn art under the same name — the player does. What the export
// carries is not generated for it: a generated frame cannot be laid over a loaded one, and
// a generated walk cycle would be the animation the drawn one never gets to replace.
const DRAWN = Object.fromEntries(LOOKS.map((l) => [l.id, l]));

const AW = 16; // actor frame width
const AH = 22; // actor frame height
export const PORTRAIT_PX = 40; // portrait art is square and drawn once per palette

const DIRS = ['down', 'up', 'left', 'right'];

function fill(g, c, x, y, w, h, a = 1) {
  g.fillStyle(c, a);
  g.fillRect(x, y, w, h);
}

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

// --- the crawl's landscape --------------------------------------------------
// Three bands the walking party moves past, tiled and scrolled at three speeds, and one
// silhouette per encounter nature for the node that walks into view. Placeholder art in
// the same spirit as everything above it: shapes that read at a glance and no more.

export const BAND = { far: [128, 56], mid: [128, 44], near: [128, 76] };
const MARK = [26, 34];

export function markKey(nature) {
  return `mark_${nature}`;
}

const BAND_DRAW = {
  // a ridge of conifers a long way off, flattened by the distance
  far: (g, [w, h]) => {
    g.fillStyle(COLORS.tree[0], 1);
    for (let i = 0; i < 10; i++) {
      const x = i * 13;
      const top = h - 12 - (14 + ((i * 11) % 16));
      g.fillTriangle(x - 2, h - 10, x + 7, top, x + 16, h - 10);
    }
    g.fillRect(0, h - 12, w, 12);
  },
  // the near treeline, and a boulder or two out of the same dark
  mid: (g, [w, h]) => {
    g.fillStyle(COLORS.tree[1], 1);
    for (let i = 0; i < 6; i++) {
      const x = i * 22;
      const top = h - 8 - (20 + ((i * 13) % 14));
      g.fillTriangle(x - 4, h - 6, x + 9, top, x + 22, h - 6);
    }
    g.fillStyle(COLORS.stone[0], 1);
    g.fillRect(70, h - 14, 13, 8);
    g.fillRect(18, h - 11, 9, 5);
    g.fillStyle(COLORS.tree[1], 1);
    g.fillRect(0, h - 6, w, 6);
  },
  // The ground going by under their feet: the verge they walk on, then the road opening
  // out toward the bottom of the screen, so the band has depth in it rather than a line.
  near: (g, [w, h]) => {
    g.fillStyle(COLORS.dirt[0], 1);
    g.fillRect(0, 0, w, h);
    g.fillStyle(COLORS.grass[0], 1);
    for (let i = 0; i < 16; i++) g.fillRect(i * 8 + ((i * 5) % 6), 0, 3, 5);
    g.fillStyle(COLORS.path[1], 1);
    g.fillRect(0, 8, w, h - 8);
    g.fillStyle(COLORS.path[0], 1);
    for (const [x, y, ww, hh] of [[6, 14, 22, 3], [46, 26, 30, 4], [90, 18, 24, 3],
      [16, 42, 34, 4], [70, 54, 40, 5], [0, 66, 28, 5], [100, 70, 26, 4]]) g.fillRect(x, y, ww, hh);
    g.fillStyle(COLORS.dirt[1], 1);
    for (const [x, y] of [[34, 34], [82, 46], [12, 58], [118, 30]]) g.fillRect(x, y, 6, 3);
  },
};

const MARK_DRAW = {
  // a cut stump: something to work at
  gather: (g, [w, h]) => {
    g.fillStyle(COLORS.wood[0], 1);
    g.fillRect(w / 2 - 7, h - 16, 14, 16);
    g.fillStyle(COLORS.wood[1], 1);
    g.fillRect(w / 2 - 9, h - 20, 18, 5);
  },
  // two of them, standing about
  talk: (g, [w, h]) => {
    g.fillStyle(COLORS.menuMapFolk, 1);
    g.fillRect(w / 2 - 10, h - 22, 6, 22);
    g.fillRect(w / 2 - 11, h - 27, 8, 6);
    g.fillStyle(COLORS.menuDim, 1);
    g.fillRect(w / 2 + 3, h - 19, 6, 19);
    g.fillRect(w / 2 + 2, h - 24, 8, 6);
  },
  // something with a shape to it, and nothing friendly in the shape
  combat: (g, [w, h]) => {
    g.fillStyle(COLORS.menuMapFolk, 1);
    g.fillTriangle(w / 2 - 12, h, w / 2, h - 30, w / 2 + 12, h);
    g.fillStyle(COLORS.questNightEdge, 1);
    g.fillRect(w / 2 - 5, h - 18, 3, 3);
    g.fillRect(w / 2 + 2, h - 18, 3, 3);
  },
  // ground that is not where it looks
  hazard: (g, [w, h]) => {
    g.fillStyle(COLORS.water[0], 1);
    g.fillRect(w / 2 - 12, h - 8, 24, 8);
    g.fillStyle(COLORS.stone[1], 1);
    g.fillRect(w / 2 - 13, h - 11, 8, 4);
    g.fillRect(w / 2 + 5, h - 10, 9, 4);
  },
};

function buildLandscape(scene) {
  for (const [name, size] of Object.entries(BAND)) {
    const key = `band_${name}`;
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    BAND_DRAW[name](g, size);
    g.generateTexture(key, size[0], size[1]);
    g.destroy();
  }
  for (const nature of Object.keys(MARK_DRAW)) {
    if (scene.textures.exists(markKey(nature))) continue;
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    MARK_DRAW[nature](g, MARK);
    g.generateTexture(markKey(nature), MARK[0], MARK[1]);
    g.destroy();
  }
}

export function buildTextures(scene) {
  buildLandscape(scene);
  // the minigame kit's atlas is drawn here too, so an imported activity engine works
  // without any wiring of its own
  buildUiAtlas(scene);

  // Every palette that is not already painted gets a body drawn for it. Each piece is
  // asked for by its own key rather than the whole pass being skipped on one of them:
  // the player has real art and their portrait exists from the first boot, and a single
  // guard on that used to turn the whole generator off — which is only noticed the day
  // somebody walks out of Dreadhollow with nothing painted for them yet.
  for (const name of Object.keys(PALETTES)) {
    const look = DRAWN[name];
    // an export with no face in it still gets one, and so does anyone the game may lay on
    // the floor without art for it
    if ((!look || !look.portrait) && !scene.textures.exists(portraitKey(name))) {
      const pg = scene.make.graphics({ x: 0, y: 0 }, false);
      drawPortrait(pg, PALETTES[name]);
      pg.generateTexture(portraitKey(name), PORTRAIT_PX, PORTRAIT_PX);
      pg.destroy();
    }
    if ((!look || !look.down) && !scene.textures.exists(proneKey(name))) {
      const lg = scene.make.graphics({ x: 0, y: 0 }, false);
      drawProne(lg, PALETTES[name]);
      lg.generateTexture(proneKey(name), AW, AH);
      lg.destroy();
    }
    if (look && (look.walk || look.idle || look.still)) continue; // the body is drawn

    for (const dir of DIRS) {
      for (const frame of [0, 1]) {
        if (scene.textures.exists(actorFrame(name, dir, frame))) continue;
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
