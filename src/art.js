// Real art, loaded off disk, standing in for the generated placeholder of the same
// name. src/textures.js draws everyone the game has no art for; this draws the rest.
// Both end up under the same texture keys, so nothing downstream knows the difference.

import { TUNING } from '../tuning.js';
import { LOOKS } from '../content/looks.js';
import { actorFrame, walkAnim, proneKey, portraitKey } from './textures.js';

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
    add(proneKey(look.id), look.down);
    add(portraitKey(look.id), look.portrait);
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
