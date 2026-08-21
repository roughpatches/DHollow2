import { TUNING, COLORS } from '../tuning.js';
import { bodyOf, drawnBody, faceFrame, fitBody, footOf, stand, walking } from './art.js';
import { atTile, DEPTH } from './street.js';

const TS = TUNING.tileSize;

// An actor on a panel: placed by how far along it stands, and standing on the one line the
// panel has. Everyone is stood up to the same height from the feet in their own frames — a
// 16-pixel placeholder and a 128-pixel export are the same person tall, as in the crawl.
// How tall that is belongs to the panel and not to the person: a painted town seen down
// the length of a road and a room seen from across it are not painted at the same scale,
// so a panel that says so says it in `body` (see content/maps.js).
export function spawnStreetActor(scene, palette, tx, groundY, facing = 'left', bodyPx = TUNING.streetBodyPx) {
  const s = scene.physics.add.sprite(atTile(tx), groundY, faceFrame(palette, facing)[0]);
  s.setOrigin(0.5, footOf(palette));
  s.setScale(bodyPx / (s.frame.height * bodyOf(palette)));
  fitBody(s, 10, 8);
  s.palette = palette;
  s.facing = facing;
  stand(s, palette, facing);
  // An export is painted at full strength and the panel it walks into is an evening. Lit
  // by the panel's own light it is in the picture rather than laid on top of it, which is
  // the whole difference between a character and a sticker.
  s.setTint(COLORS.streetLight);
  s.shade = shadeUnder(scene, s, bodyPx);
  return s;
}

// The pool at somebody's feet. A painted panel has no floor to catch a shadow and nothing
// else in the game says a body is standing on the ground rather than in front of it. It is
// centred on the line they stand on, so half of it lies in front of their boots.
// A generated body has one drawn into its frames already and is not given a second.
function shadeUnder(scene, sprite, bodyPx) {
  if (!drawnBody(sprite.palette)) return null;
  const wide = bodyPx * TUNING.streetShadowWide;
  return scene.add.ellipse(sprite.x, sprite.y, wide, wide * TUNING.streetShadowDeep,
    COLORS.streetShadow, TUNING.streetShadowAlpha).setDepth(DEPTH.shadow);
}

export function createStreetPlayer(scene, tx, groundY, bodyPx, palette = 'player') {
  const s = spawnStreetActor(scene, palette, tx, groundY, 'right', bodyPx);
  s.setCollideWorldBounds(true);
  return s;
}

// What shows of somebody standing behind something painted. A panel is one picture with
// nothing drawn over the top of it, so being behind the bar is not a depth — it is a line
// across them, above which they are the room's and below which they are the painting's.
export function cutBelow(sprite, line) {
  const top = sprite.y - sprite.displayHeight * sprite.originY;
  sprite.setCrop(0, 0, sprite.frame.width, Math.max(0, (line - top) / sprite.scaleY));
}

// Left and right, and nothing else: a street has one line on it and the whole of walking
// a street is which way along it you are going.
export function updateStreetPlayer(player, keys) {
  let vx = 0;
  if (keys.left.isDown || keys.a.isDown) vx -= 1;
  if (keys.right.isDown || keys.d.isDown) vx += 1;
  player.body.setVelocity(vx * TUNING.walkSpeed, 0);

  if (vx === 0) {
    haltPlayer(player);
    return;
  }
  player.facing = vx < 0 ? 'left' : 'right';
  walking(player, player.palette, player.facing);
}

export function haltPlayer(player) {
  player.body.setVelocity(0, 0);
  stand(player, player.palette, player.facing);
}
