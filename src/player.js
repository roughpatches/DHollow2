import { TUNING } from '../tuning.js';
import { actorFrame, walkAnim } from './textures.js';

const TS = TUNING.tileSize;

export function spawnActor(scene, palette, tx, ty, facing = 'down') {
  const s = scene.physics.add.sprite(tx * TS + TS / 2, ty * TS + TS, actorFrame(palette, facing, 0));
  s.setOrigin(0.5, 1);
  s.body.setSize(10, 8).setOffset(3, 14);
  s.palette = palette;
  s.facing = facing;
  return s;
}

export function createPlayer(scene, tx, ty) {
  const s = spawnActor(scene, 'player', tx, ty, 'down');
  s.setCollideWorldBounds(true);
  return s;
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

  player.anims.play(walkAnim('player', player.facing), true);
}

export function haltPlayer(player) {
  player.body.setVelocity(0, 0);
  player.anims.stop();
  player.setTexture(actorFrame('player', player.facing, 0));
}
