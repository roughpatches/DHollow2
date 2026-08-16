import { TUNING } from '../tuning.js';
import { actorFrame, walkAnim } from './textures.js';
import { bodyOf, fitBody, footOf, stand } from './art.js';
import { atTile } from './street.js';

const TS = TUNING.tileSize;

export function spawnActor(scene, palette, tx, ty, facing = 'down') {
  const s = scene.physics.add.sprite(tx * TS + TS / 2, ty * TS + TS, actorFrame(palette, facing, 0));
  s.setOrigin(0.5, footOf(palette));
  fitBody(s, 10, 8);
  s.palette = palette;
  s.facing = facing;
  stand(s, palette, facing);
  return s;
}

// The same actor on a street: placed by how far along it stands, and standing on the one
// line the street has instead of on a tile.
// A street is painted at the size the drawn characters are drawn at, not at a tile's size,
// so everyone is stood up to the same height from the feet in their own frames — a
// 16-pixel placeholder and a 60-pixel export are the same person tall, as in the crawl.
// How tall that is belongs to the panel and not to the person: a painted town seen down
// the length of a road and a room seen from across it are not painted at the same scale,
// so a panel that says so says it in `body` (see content/maps.js).
export function spawnStreetActor(scene, palette, tx, groundY, facing = 'left', bodyPx = TUNING.streetBodyPx) {
  const s = scene.physics.add.sprite(atTile(tx), groundY, actorFrame(palette, facing, 0));
  s.setOrigin(0.5, footOf(palette));
  s.setScale(bodyPx / (s.frame.height * bodyOf(palette)));
  fitBody(s, 10, 8);
  s.palette = palette;
  s.facing = facing;
  stand(s, palette, facing);
  return s;
}

export function createPlayer(scene, tx, ty) {
  const s = spawnActor(scene, 'player', tx, ty, 'down');
  s.setCollideWorldBounds(true);
  return s;
}

export function createStreetPlayer(scene, tx, groundY, bodyPx) {
  const s = spawnStreetActor(scene, 'player', tx, groundY, 'right', bodyPx);
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
  player.anims.play(walkAnim(player.palette, player.facing), true);
}

export function updatePlayer(player, keys) {
  const speed = TUNING.walkSpeed;
  let vx = 0;
  let vy = 0;

  if (keys.left.isDown || keys.a.isDown) vx -= 1;
  if (keys.right.isDown || keys.d.isDown) vx += 1;
  if (keys.up.isDown || keys.w.isDown) vy -= 1;
  if (keys.down.isDown || keys.s.isDown) vy += 1;

  if (vx !== 0 && vy !== 0) {
    vx *= Math.SQRT1_2;
    vy *= Math.SQRT1_2;
  }
  player.body.setVelocity(vx * speed, vy * speed);

  if (vx === 0 && vy === 0) {
    haltPlayer(player);
    return;
  }

  // horizontal wins ties, so walking diagonally reads as sideways
  if (vx < 0) player.facing = 'left';
  else if (vx > 0) player.facing = 'right';
  else if (vy < 0) player.facing = 'up';
  else player.facing = 'down';

  player.anims.play(walkAnim(player.palette, player.facing), true);
}

export function haltPlayer(player) {
  player.body.setVelocity(0, 0);
  stand(player, player.palette, player.facing);
}
