// Real art, loaded off disk, standing in for the generated placeholder of the same
// name. src/textures.js draws everyone the game has no art for; this draws the rest.
// Both end up under the same texture keys, so nothing downstream knows the difference.

import { TUNING } from '../tuning.js';
import { LOOKS, NODE_ART, STRUCTURES, GROUND, PROPS, EDGES } from '../content/looks.js';
import { PLACES } from '../content/places.js';
import { MAPS } from '../content/maps.js';
import { actorFrame, walkAnim, proneKey, portraitKey, TILE_INDEX, TILE_NAMES } from './textures.js';
import { buildingOf, levelOf } from './town.js';
import { DEPTH, atTile } from './street.js';

// the game says up, down, left, right; the export says north, south, west, east
const DIRS = { down: 'south', up: 'north', left: 'west', right: 'east' };
// and art painted from one side is only ever exported two of those ways
const SIDES = { down: 'south', right: 'east' };
// which of the two a one-sided character wears facing each way, and whether it is drawn
// the wrong way round: a side profile is turned by mirroring it, and has no back to show.
const FACE = {
  right: ['right', false], left: ['right', true], down: ['down', false], up: ['down', false],
};

const LOOK = Object.fromEntries(LOOKS.map((l) => [l.id, l]));

// the ways this character is painted, and the folder each is exported under
function dirsOf(look) {
  return Object.entries(look.sides ? SIDES : DIRS);
}

// and the loops they have: everyone stands still, and only somebody who goes anywhere walks
function setsOf(look, dir) {
  return [['idle', look.idle], ['walk', look.walk]]
    .filter(([, spec]) => spec && (!dir || !spec.dirs || spec.dirs.includes(dir)));
}

// Somebody painted twice is one person with two looks: a map that says it is indoors gets
// the room-sized one. Everything downstream is handed the id this returns and never knows
// there was a choice.
export function lookIn(palette, indoors) {
  const look = LOOK[palette];
  return indoors && look && look.indoors ? look.indoors : palette;
}

// The texture a character wears facing this way: the frame, whether it is drawn flipped,
// and the direction their art actually calls it. Everything that stands somebody up or
// turns them goes through here, so one-sided art is turned in one place.
export function faceFrame(palette, dir) {
  const look = LOOK[palette];
  if (!look || !look.sides) return [actorFrame(palette, dir, 0), false, dir];
  const [use, flip] = FACE[dir];
  return [actorFrame(palette, use, 0), flip, use];
}

export function lookOf(id) {
  return LOOK[id];
}

// frame 0 of a set is the still one, so a standing character is not a walking pose
function key(look, set, dir, i) {
  return set === 'idle' ? actorFrame(look.id, dir, i) : `${look.id}_walking_${dir}_${i}`;
}

// Every file this character is made of. Called from a scene's preload; a restart runs
// it again, and anything already loaded is left alone.
export function preloadArt(scene) {
  for (const look of LOOKS) {
    const add = (k, path) => {
      if (!scene.textures.exists(k)) scene.load.image(k, `${look.path}/${path}`);
    };
    for (const [dir, folder] of dirsOf(look)) {
      // Somebody with no idle loop of their own stands on the painted rotation for the way
      // they are facing, out of the export's own rotations folder. It goes under the same
      // key frame 0 of an idle would, so nothing downstream knows the difference.
      if (look.still) add(actorFrame(look.id, dir, 0), `${look.still}/${folder}.png`);
      for (const [set, spec] of setsOf(look, dir)) {
        for (let i = 0; i < spec.frames; i++) {
          add(key(look, set, dir, i), `${spec.folder}/${folder}/frame_${String(i).padStart(3, '0')}.png`);
        }
      }
    }
    if (look.down) add(proneKey(look.id), look.down); // only somebody who gets laid out needs one
    if (look.portrait) add(portraitKey(look.id), look.portrait);
  }
  for (const s of STRUCTURES) {
    s.stages.forEach((path, i) => {
      const k = stageKey(s, i);
      if (!scene.textures.exists(k)) scene.load.image(k, `${s.path}/${path}`);
    });
  }
  for (const g of [...GROUND, ...EDGES]) {
    if (!scene.textures.exists(g.sheet)) scene.load.image(g.sheet, g.sheet);
  }
  for (const p of PROPS) {
    if (!scene.textures.exists(propKey(p.art))) {
      scene.load.image(propKey(p.art), `art/props/${p.art}.png`);
    }
  }
  // what stands at a node, for the encounters that have art for it
  for (const [id, art] of Object.entries(NODE_ART)) {
    for (const [state, spec] of nodeStates(art)) {
      for (let i = 0; i < spec.frames; i++) {
        // art that has to be turned is loaded under its own name and turned into the one
        // everything else asks for, so nothing downstream knows it was painted sideways
        const k = dressed(spec) ? `${nodeFrame(id, state, i)}_asis` : nodeFrame(id, state, i);
        if (!scene.textures.exists(k)) {
          scene.load.image(k, `${art.path}/${spec.folder}/frame_${String(i).padStart(3, '0')}.png`);
        }
      }
    }
  }
  // a zone's painted landscape, loaded by its own path the way the ground sheets are
  for (const place of PLACES) {
    const key = place.backdrop && place.backdrop.image;
    if (key && !scene.textures.exists(key)) scene.load.image(key, key);
  }
  // and a side-on map's painted town, the same way
  for (const map of Object.values(MAPS)) {
    const key = map.street && map.street.art;
    if (key && !scene.textures.exists(key)) scene.load.image(key, key);
  }
}

// The animations, once the files are in. Standing still is an animation too — a
// character who breathes is worth the four frames it costs.
export function buildArt(scene) {
  buildNodeArt(scene);
  for (const look of LOOKS) {
    for (const [dir] of dirsOf(look)) {
      for (const [set, spec] of setsOf(look, dir)) {
        const k = set === 'idle' ? idleAnim(look.id, dir) : walkAnim(look.id, dir);
        if (scene.anims.exists(k)) continue;
        scene.anims.create({
          key: k,
          frames: Array.from({ length: spec.frames }, (_, i) => ({ key: key(look, set, dir, i) })),
          frameRate: set === 'idle' ? TUNING.artIdleFrameRate : TUNING.artWalkFrameRate,
          yoyo: !!spec.yoyo,
          // something done now and then is played once each time it comes round; a loop
          // somebody is always in runs for ever
          repeat: spec.every ? 0 : -1,
        });
      }
    }
  }
}

// What stands at a node, and what is left of it afterwards. The standing loop runs
// while the party is at it; the finished one is played once and held, because a tree
// that has come down does not come down again.
export function nodeFrame(id, state, i) {
  return `node_${id}_${state}_${i}`;
}

export function nodeAnim(id, state) {
  return `node_${id}_${state}`;
}

export function nodeArtFor(id) {
  return NODE_ART[id] || null;
}

// the states an encounter's art actually has: everything has one it stands in, and only
// some have one they are left in
function nodeStates(art) {
  return ['stands', 'done'].filter((k) => art[k]).map((k) => [k, art[k]]);
}

// whether a state's art is used as painted, or has something done to it first
function dressed(spec) {
  return !!(spec.turn || spec.trim || spec.fade || spec.shade);
}

// One frame, turned, shaded, cut back and feathered into what it is standing on. A right
// angle on a square canvas moves pixels without touching them, so the turn costs the art
// nothing; the shade is a multiply toward the light of the place; the trim takes an end
// off something painted longer than the ground it has to cross; the feather is an alpha
// ramp on whichever sides are named, for art painted as a self-contained rectangle that
// would otherwise sit on the landscape with a seam round it.
//
// Trim runs before feather so the feather lands on the cut, not on the end that was cut
// off: a shortened brook still comes out of the trees rather than starting at a wall.
function dressFrame(scene, key, spec) {
  if (scene.textures.exists(key)) return;
  const src = scene.textures.get(`${key}_asis`).getSourceImage();
  const turned = spec.turn % 2 === 1;
  const w = turned ? src.height : src.width;
  const h = turned ? src.width : src.height;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(w / 2, h / 2);
  if (spec.turn) ctx.rotate((Math.PI / 2) * spec.turn);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (spec.shade || spec.trim || spec.fade) {
    const img = ctx.getImageData(0, 0, w, h);
    if (spec.shade) shaded(img, spec.shade);
    if (spec.trim) trimmed(img, w, h, spec.trim);
    if (spec.fade) feather(img, w, h, spec.fade);
    ctx.putImageData(img, 0, 0);
  }
  tex.refresh();
}

// The rectangle the paint actually occupies, which is not the canvas it came on: an
// export carries whatever air the exporter felt like, and everything below has to work
// from the paint.
function boundsOf(img, w, h) {
  let x0 = w; let x1 = -1; let y0 = h; let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!img.data[(y * w + x) * 4 + 3]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return { x0, x1, y0, y1 };
}

// Paint cut off each side, for a thing painted longer than the ground it has to cross.
// Where it is registered against the road does not move, because that is measured off
// the frame and the frame is not what is being cut.
function trimmed(img, w, h, [tl, tr, tt, tb]) {
  const { x0, x1, y0, y1 } = boundsOf(img, w, h);
  if (x1 < 0) return;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (x - x0 < tl || x1 - x < tr || y - y0 < tt || y1 - y < tb) {
        img.data[(y * w + x) * 4 + 3] = 0;
      }
    }
  }
}

// Art painted under a light the place does not have, multiplied toward the light it does
// rather than repainted — the same treatment the pale seawater sheet gets in bakeTiles.
// A multiply only ever takes away, so cold art warms by losing its blue and nothing on
// the sheet can come out brighter than it was painted.
function shaded(img, shade) {
  const r = (shade >> 16) & 0xff;
  const g = (shade >> 8) & 0xff;
  const b = shade & 0xff;
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = (img.data[i] * r) / 255;
    img.data[i + 1] = (img.data[i + 1] * g) / 255;
    img.data[i + 2] = (img.data[i + 2] * b) / 255;
  }
}

// The alpha ramp, measured from where the art is rather than from where its frame is:
// an export carries whatever air the exporter felt like and the feather has to bite into
// the painting, not into the empty margin around it.
function feather(img, w, h, [fl, fr, ft, fb]) {
  const { x0, x1, y0, y1 } = boundsOf(img, w, h);
  if (x1 < 0) return;
  // A bank is not a ruled line. How far each row's fade reaches wanders slowly along the
  // edge, so where the art runs out is ragged the way ground is; it is a function of the
  // pixel and not of chance, so all nine frames of a loop run out in the same place.
  const wander = (n) => (Math.sin(n * 0.19) + Math.sin(n * 0.071)) / 5;
  const ramp = (n, over, at) => (over ? Math.min(1, Math.max(0, n / over + wander(at))) : 1);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const k = Math.min(
        ramp(x - x0, fl, y), ramp(x1 - x, fr, y + 500),
        ramp(y - y0, ft, x + 900), ramp(y1 - y, fb, x + 1300),
      );
      if (k < 1) img.data[(y * w + x) * 4 + 3] *= k;
    }
  }
}

function buildNodeArt(scene) {
  for (const [id, art] of Object.entries(NODE_ART)) {
    for (const [state, spec] of nodeStates(art)) {
      if (dressed(spec)) {
        for (let i = 0; i < spec.frames; i++) dressFrame(scene, nodeFrame(id, state, i), spec);
      }
      const k = nodeAnim(id, state);
      if (scene.anims.exists(k)) continue;
      scene.anims.create({
        key: k,
        frames: Array.from({ length: spec.frames }, (_, i) => ({ key: nodeFrame(id, state, i) })),
        frameRate: TUNING.artIdleFrameRate,
        repeat: state === 'stands' ? -1 : 0,
      });
    }
  }
}

export function idleAnim(id, dir) {
  return `${id}_idle_${dir}`;
}

// standing still: the idle loop for anyone who is always in one, the one still frame for
// anyone who is not, and either of them mirrored where the art is painted from one side.
// Somebody whose idle is something they do now and then stands on its first frame between
// times — what plays it, and when, is the scene's (see World.idles).
export function stand(sprite, palette, dir) {
  const [frame, flip, use] = faceFrame(palette, dir);
  sprite.setFlipX(flip);
  const look = LOOK[palette];
  if (look && look.idle && !look.idle.every) {
    sprite.anims.play(idleAnim(palette, use), true);
    return;
  }
  sprite.anims.stop();
  sprite.setTexture(frame);
}

// Walking: the cycle for whoever has one this way, and the standing frame for anyone who
// does not — art painted for a room may only have been walked the one way anybody walks
// in it, and a direction it was never painted for still has to go somewhere.
export function walking(sprite, palette, dir) {
  const [frame, flip, use] = faceFrame(palette, dir);
  sprite.setFlipX(flip);
  const key = walkAnim(palette, use);
  if (sprite.scene.anims.exists(key)) {
    sprite.anims.play(key, true);
    return;
  }
  sprite.anims.stop();
  sprite.setTexture(frame);
}

// The idle somebody plays now and then rather than always: which animation it is the way
// they are facing, and the [least, most] they stand still between one run and the next.
// Nothing for anyone whose idle is a loop they are always in.
export function occasionalIdle(palette, dir) {
  const look = LOOK[palette];
  if (!look || !look.idle || !look.idle.every) return null;
  return { key: idleAnim(palette, faceFrame(palette, dir)[2]), every: look.idle.every };
}

// The frame around a character is not the character: art frames carry a lot of air. A
// body is placed off where the feet are instead of off the frame, so a 60-pixel export
// and a 16-pixel placeholder stand on the same ground. `below` is how far past the feet
// the body reaches — an NPC's reaches further, so you stop beside them, not inside them.
export function fitBody(sprite, w, h, below = 0) {
  const foot = sprite.frame.height * sprite.originY;
  sprite.body.setSize(w, h).setOffset((sprite.frame.width - w) / 2, foot - h + below);
}

// where the ground is in this character's frames, as a fraction of the frame
export function footOf(palette) {
  const look = LOOK[palette];
  return look ? look.foot / look.size : 1;
}

// And how much of the frame is the person: head to feet, as a fraction of it, which is
// what stands two exports the same height as each other. Where a look measures its own
// `head` that is exact; where it does not, the air over the head is taken to be the
// quarter of the frame the crawl already corrects drawn art by.
export function bodyOf(palette) {
  const look = LOOK[palette];
  if (!look) return 1; // a placeholder is drawn to the edges of its own frame
  if (look.head !== undefined) return (look.foot - look.head) / look.size;
  return look.foot / look.size / TUNING.questArtScale;
}

// --- ground ----------------------------------------------------------------
// One strip of tiles for the map to draw from, at tilePx a tile: the generated ones
// blown up to that size, and painted ground cut in over the top of them. A painted tile
// gets four patches rather than one, laid two by two across the map, so a field does
// not repeat every step.

const SLOT = {};
const SEAM = {}; // 'grass|dirt' -> { high: Set, codes: { 0: slot, ... } }

function seamKey(a, b) {
  return [a, b].sort().join('|');
}

// The baked tiles are laid out in rows rather than one long strip: a strip of every tile
// the town needs is wider than a graphics card will take as one texture, and an oversized
// texture does not fail loudly — it draws black.
export const TILE_COLS = 16;

export function bakeTiles(scene) {
  if (scene.textures.exists('tiles')) return;
  const P = TUNING.tilePx;
  const extra = GROUND.reduce((n, g) => n + g.cells.length - 1, 0)
    + EDGES.reduce((n, e) => n + Object.keys(e.cells).length, 0);
  const rows = Math.ceil((TILE_NAMES.length + extra) / TILE_COLS);
  const tex = scene.textures.createCanvas('tiles', TILE_COLS * P, rows * P);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  // where a tile index sits in the baked grid
  const px = (slot) => (slot % TILE_COLS) * P;
  const py = (slot) => Math.floor(slot / TILE_COLS) * P;

  const drawn = scene.textures.get('tiles16').getSourceImage();
  const TS = TUNING.tileSize;
  TILE_NAMES.forEach((name, i) => ctx.drawImage(drawn, i * TS, 0, TS, TS, px(i), py(i), P, P));

  let next = TILE_NAMES.length;
  for (const g of GROUND) {
    const sheet = scene.textures.get(g.sheet).getSourceImage();
    SLOT[g.tile] = g.cells.map(([sx, sy], i) => {
      const slot = i === 0 ? TILE_INDEX[g.tile] : next++;
      ctx.drawImage(sheet, sx, sy, P, P, px(slot), py(slot), P, P);
      // A sheet painted lighter than the world wants it is multiplied down here rather
      // than repainted: the seawater keeps its swell and stops reading as pale stone.
      if (g.shade) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `#${g.shade.toString(16).padStart(6, '0')}`;
        ctx.fillRect(px(slot), py(slot), P, P);
        ctx.globalCompositeOperation = 'source-over';
      }
      return slot;
    });
  }

  // Seam tiles. A seam holds both grounds at once, so it cannot be shaded with one
  // multiply the way a plain patch is: each side is tinted by its own shade, and which
  // side a pixel belongs to is read off its hue.
  for (const e of EDGES) {
    const sheet = scene.textures.get(e.sheet).getSourceImage();
    const codes = {};
    for (const [code, [sx, sy]] of Object.entries(e.cells)) {
      const slot = next++;
      codes[code] = slot;
      ctx.drawImage(sheet, sx, sy, P, P, px(slot), py(slot), P, P);
      if (!e.low.shade && !e.high.shade) continue;
      const img = ctx.getImageData(px(slot), py(slot), P, P);
      const d = img.data;
      const [c0, c1] = { rg: [0, 1], gb: [1, 2], rb: [0, 2] }[e.split.channels];
      for (let i = 0; i < d.length; i += 4) {
        const side = d[i + c0] - d[i + c1] > e.split.over ? e.high : e.low;
        if (!side.shade) continue;
        d[i] = (d[i] * ((side.shade >> 16) & 0xff)) / 255;
        d[i + 1] = (d[i + 1] * ((side.shade >> 8) & 0xff)) / 255;
        d[i + 2] = (d[i + 2] * (side.shade & 0xff)) / 255;
      }
      ctx.putImageData(img, px(slot), py(slot));
    }
    for (const a of e.low.tiles) {
      for (const b of e.high.tiles) SEAM[seamKey(a, b)] = { high: new Set(e.high.tiles), codes };
    }
  }
  tex.refresh();
}

// which patch of a tile belongs at this square
export function slotFor(name, x, y) {
  const slots = SLOT[name];
  if (!slots) return TILE_INDEX[name];
  return slots[((x % 2) + (y % 2) * 2) % slots.length];
}

// The tile for the corner four squares share, given what ground each of them is: the one
// painted with both materials meeting the way these four do. -1 where there is nothing to
// draw — one ground, more than two, a pair no sheet was painted for, or one of the two
// diagonals no sheet paints.
export function seamFor(nw, ne, sw, se) {
  const names = [nw, ne, sw, se];
  const both = [...new Set(names)];
  if (both.length !== 2) return -1;
  const seam = SEAM[seamKey(both[0], both[1])];
  if (!seam) return -1;
  const code = names.reduce((n, name, i) => n | (seam.high.has(name) ? 1 << i : 0), 0);
  const slot = seam.codes[code];
  return slot === undefined ? -1 : slot;
}

// --- buildings -------------------------------------------------------------
// A building is one picture per stage of repair, hung over the tiles the map already
// has. Nothing about walking into it changes: the tiles are still what stops you. It
// sorts by the bottom of its picture, like anyone else, so you pass behind its roof.

function stageKey(s, i) {
  return `built_${s.id}_${i}`;
}

// How much empty frame a picture carries under it. An export is padded out to a square and
// the padding is not the same on every stage — the burnt chapel has eight pixels of nothing
// below it and the scaffolded one has three — so a building hung by the bottom of its frame
// floats off the pavement, and hops when it is repaired. Read off the image once and kept,
// the way a character's `foot` is measured in content/looks.js, except that this one can be
// measured rather than eyed.
const PAD = {};

function padBelow(scene, key) {
  if (PAD[key] !== undefined) return PAD[key];
  const img = scene.textures.get(key).getSourceImage();
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, img.width, img.height).data;
  let pad = 0;
  for (let y = img.height - 1; y >= 0; y--) {
    let any = false;
    for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4 + 3] > 0) {
        any = true;
        break;
      }
    }
    if (any) break;
    pad++;
  }
  PAD[key] = pad;
  return pad;
}

export function raiseStructures(scene, mapKey) {
  const out = {};
  for (const s of STRUCTURES) {
    const b = buildingOf(s.id);
    if (!b || b.map !== mapKey) continue;
    // On a street the picture stands along the back of the pavement, in the row with the
    // painted terrace rather than out in the road, at the building's own place along it.
    // There are no tiles under it to clear: the painting is already the town.
    const img = scene.street
      ? scene.add.image(atTile(s.at[0]), scene.sillY, stageKey(s, 0))
        .setOrigin(0.5, 1).setDepth(DEPTH.structure)
      : scene.add.image(s.at[0] * TUNING.tileSize, s.at[1] * TUNING.tileSize, stageKey(s, 0))
        .setOrigin(0, 0);
    if (!scene.street) img.setDepth(img.y + img.height);
    out[s.id] = { spec: s, img, scene, sill: scene.street ? scene.sillY : undefined };
    restate(out, s.id);
    if (!scene.street) clearUnder(scene, s, img);
  }
  return out;
}

// The tiles the picture stands on give up their own drawing and keep their collision:
// the walls are still what stops you, but nothing of the placeholder building shows
// past the edges of the art.
function clearUnder(scene, spec, img) {
  const TS = TUNING.tileSize;
  const x0 = Math.floor(img.x / TS);
  const y0 = Math.floor(img.y / TS);
  for (let y = y0; y < Math.ceil((img.y + img.height) / TS); y++) {
    for (let x = x0; x < Math.ceil((img.x + img.width) / TS); x++) {
      const tile = scene.ground.getTileAt(x, y);
      if (!tile) continue;
      const solid = tile.collides;
      scene.ground.putTileAt(slotFor(spec.under || 'grass', x, y), x, y).setCollision(solid);
    }
  }
}

// --- props -----------------------------------------------------------------
// A crate, a cask, a lamp post. One picture, centred on the tile it stands on and
// standing on the bottom of it, sorted by its feet like an actor — so you walk behind a
// stack of crates and in front of the next one down the quay. The tile underneath is
// what stops you; nothing here touches collision.

function propKey(art) {
  return `prop_${art}`;
}

export function raiseProps(scene, mapKey) {
  const TS = TUNING.tileSize;
  for (const p of PROPS.filter((q) => q.map === mapKey)) {
    // a street has one line to stand on, so a prop on one only says how far along it is
    const img = scene.street
      ? scene.add.image(atTile(p.at[0]), scene.groundY, propKey(p.art))
        .setOrigin(0.5, 1).setDepth(DEPTH.prop)
      : scene.add.image(p.at[0] * TS + TS / 2, (p.at[1] + 1) * TS, propKey(p.art))
        .setOrigin(0.5, 1);
    if (!scene.street) img.setDepth(img.y);
  }
}

// the picture for whatever stage the building has got to; repairing it changes what is
// standing there without rebuilding the map
export function restate(built, id) {
  const e = built[id];
  if (!e) return;
  const key = stageKey(e.spec, Math.min(levelOf(id), e.spec.stages.length - 1));
  e.img.setTexture(key);
  // on a street it is stood on its own feet rather than on the bottom of its frame, and
  // where its feet are inside that frame changes with the stage
  if (e.sill !== undefined) e.img.setY(e.sill + padBelow(e.scene, key));
}
