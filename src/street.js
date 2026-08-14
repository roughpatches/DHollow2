// Dreadhollow from the side. A street is one painted town laid end to end as many times
// as it is long, a line drawn across it to walk on, and everything standing on that line
// placed by how far along it stands. There is no grid, no seams and no collision map: the
// painting is the town, and the only thing you can do to it is stand somewhere along it.
// See `street` in content/maps.js for the definition this reads.

import { TUNING, COLORS } from '../tuning.js';
import { MAPS } from '../content/maps.js';
import { buildings } from './town.js';

const TS = TUNING.tileSize;

// Draw order on a street. A side view has no depth to sort by — nobody is ever further up
// the road than anybody else — so the layers are named once here and never computed.
export const DEPTH = {
  town: 0,
  structure: 10,
  prop: 20,
  npc: 30,
  player: 40,
  hint: 50,
};

// where along the street a tile sits, in world pixels: the middle of it, so a door placed
// at a tile is reached from either side of it
export function atTile(tx) {
  return tx * TS + TS / 2;
}

// The painting, at 1:1 and laid end to end. Every other copy is flipped, so the join is a
// mirror — the two halves of a seam are the same edge, and the row of houses reads as a
// longer town rather than as the same town twice.
// The art is missing until its file is in, so this asks: without it the street is the two
// flat bands it would otherwise be behind, which is enough to walk along and place things
// against while the painting is being made.
export function createStreet(scene, def) {
  const [w, h] = def.size;
  const width = w * def.repeats;

  if (scene.textures.exists(def.art)) {
    for (let i = 0; i < def.repeats; i++) {
      const img = scene.add.image(i * w, 0, def.art).setOrigin(0, 0).setDepth(DEPTH.town);
      if (i % 2) img.setFlipX(true);
    }
  } else {
    const g = scene.add.graphics().setDepth(DEPTH.town);
    g.fillStyle(COLORS.questSkyDay, 1);
    g.fillRect(0, 0, width, def.ground);
    g.fillStyle(COLORS.path[0], 1);
    g.fillRect(0, def.ground, width, h - def.ground);
  }

  return { width, height: h, ground: def.ground };
}

// What the player is standing at: the nearest building or door within reach, or nothing.
// A building with a door of its own is not in the map's door list — it answers for itself,
// because whether it opens is a question about its repair rather than about the street.
export function focusNear(mapKey, px) {
  let best = null;
  let bestDist = TUNING.streetReach;

  const consider = (tx, item) => {
    const d = Math.abs(atTile(tx) - px);
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  };

  for (const b of buildings().filter((q) => q.map === mapKey)) {
    consider(b.site[0], { kind: 'building', building: b, name: b.name });
  }
  for (const d of MAPS[mapKey].doors) {
    consider(d.x, { kind: 'door', door: d, name: d.label || MAPS[d.to].name });
  }
  return best;
}
