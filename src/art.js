// Real art, loaded off disk, standing in for the generated placeholder of the same
// name. src/textures.js draws everyone the game has no art for; this draws the rest.
// Both end up under the same texture keys, so nothing downstream knows the difference.

import { TUNING } from '../tuning.js';
import { LOOKS, STRUCTURES } from '../content/looks.js';
import { actorFrame, walkAnim, proneKey, portraitKey, TILE_INDEX } from './textures.js';
import { buildingOf, levelOf } from './town.js';

// the game says up, down, left, right; the export says north, south, west, east
const DIRS = { down: 'south', up: 'north', left: 'west', right: 'east' };

const LOOK = Object.fromEntries(LOOKS.map((l) => [l.id, l]));

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
    for (const [dir, folder] of Object.entries(DIRS)) {
      for (const [set, spec] of [['idle', look.idle], ['walk', look.walk]]) {
        for (let i = 0; i < spec.frames; i++) {
          add(key(look, set, dir, i), `${spec.folder}/${folder}/frame_${String(i).padStart(3, '0')}.png`);
        }
      }
    }
    if (look.down) add(proneKey(look.id), look.down); // only somebody who gets laid out needs one
    add(portraitKey(look.id), look.portrait);
  }
  for (const s of STRUCTURES) {
    s.stages.forEach((path, i) => {
      const k = stageKey(s, i);
      if (!scene.textures.exists(k)) scene.load.image(k, `${s.path}/${path}`);
    });
  }
}

// The animations, once the files are in. Standing still is an animation too — a
// character who breathes is worth the four frames it costs.
export function buildArt(scene) {
  for (const look of LOOKS) {
    for (const dir of Object.keys(DIRS)) {
      for (const [set, spec, rate] of [
        ['idle', look.idle, TUNING.artIdleFrameRate],
        ['walk', look.walk, TUNING.artWalkFrameRate],
      ]) {
        const k = set === 'idle' ? idleAnim(look.id, dir) : walkAnim(look.id, dir);
        if (scene.anims.exists(k)) continue;
        scene.anims.create({
          key: k,
          frames: Array.from({ length: spec.frames }, (_, i) => ({ key: key(look, set, dir, i) })),
          frameRate: rate,
          repeat: -1,
        });
      }
    }
  }
}

export function idleAnim(id, dir) {
  return `${id}_idle_${dir}`;
}

// standing still: the idle loop for anyone who has one, the one still frame for anyone
// who does not
export function stand(sprite, palette, dir) {
  if (LOOK[palette]) sprite.anims.play(idleAnim(palette, dir), true);
  else {
    sprite.anims.stop();
    sprite.setTexture(actorFrame(palette, dir, 0));
  }
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

// --- buildings -------------------------------------------------------------
// A building is one picture per stage of repair, hung over the tiles the map already
// has. Nothing about walking into it changes: the tiles are still what stops you. It
// sorts by the bottom of its picture, like anyone else, so you pass behind its roof.

function stageKey(s, i) {
  return `built_${s.id}_${i}`;
}

export function raiseStructures(scene, mapKey) {
  const out = {};
  for (const s of STRUCTURES) {
    const b = buildingOf(s.id);
    if (!b || b.map !== mapKey) continue;
    const img = scene.add.image(s.at[0] * TUNING.tileSize, s.at[1] * TUNING.tileSize, stageKey(s, 0));
    img.setOrigin(0, 0).setDepth(img.y + img.height);
    out[s.id] = { spec: s, img };
    restate(out, s.id);
    clearUnder(scene, s, img);
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
      scene.ground.putTileAt(TILE_INDEX[spec.under || 'grass'], x, y).setCollision(solid);
    }
  }
}

// the picture for whatever stage the building has got to; repairing it changes what is
// standing there without rebuilding the map
export function restate(built, id) {
  const e = built[id];
  if (!e) return;
  e.img.setTexture(stageKey(e.spec, Math.min(levelOf(id), e.spec.stages.length - 1)));
}
