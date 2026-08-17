import { TUNING } from '../tuning.js';

const FACING = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

// Nearest NPC to a probe point placed just ahead of the player's face. That is the
// whole interaction system; there are no trigger volumes to keep in sync with the map.
// How far ahead that probe sits is the panel's business: reaching somebody is a matter of
// arms and shoulders, so in a room painted from across it — where a person is five times
// the height they are out in the town — everything about reaching them is five times as
// far. `scale` is that ratio; a panel drawn at the town's own size passes 1.
export function findTarget(player, npcs, scale = 1) {
  const [dx, dy] = FACING[player.facing];
  const px = player.x + dx * TUNING.interactReach * scale;
  const py = player.y - 8 + dy * TUNING.interactReach * scale;

  let best = null;
  let bestDist = TUNING.interactRange * scale;
  for (const npc of npcs) {
    const d = Math.hypot(px - npc.x, py - (npc.y - 8));
    if (d < bestDist) {
      bestDist = d;
      best = npc;
    }
  }
  return best;
}

export function faceToward(npc, player) {
  const dx = player.x - npc.x;
  const dy = player.y - npc.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'up' : 'down';
}
