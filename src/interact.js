import { TUNING } from '../tuning.js';

const FACING = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

// Nearest NPC to a probe point placed just ahead of the player's face. That is the
// whole interaction system; there are no trigger volumes to keep in sync with the map.
export function findTarget(player, npcs) {
  const [dx, dy] = FACING[player.facing];
  const px = player.x + dx * TUNING.interactReach;
  const py = player.y - 8 + dy * TUNING.interactReach;

  let best = null;
  let bestDist = TUNING.interactRange;
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
