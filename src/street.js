// Dreadhollow from the side. A street is one painted town laid end to end as many times
// as it is long, a line drawn across it to walk on, and everything standing on that line
// placed by how far along it stands. There is no grid, no seams and no collision map: the
// painting is the town, and the only thing you can do to it is stand somewhere along it.
// See `street` in content/maps.js for the definition this reads.

import { TUNING, COLORS, hex, blend } from '../tuning.js';
import { MAPS } from '../content/maps.js';
import { buildings } from './town.js';

const TS = TUNING.tileSize;

// Draw order on a street. A side view has no depth to sort by — nobody is ever further up
// the road than anybody else — so the layers are named once here and never computed.
export const DEPTH = {
  weather: -10,
  town: 0,
  structure: 10,
  prop: 20,
  shadow: 25, // the pools at people's feet: over the painting, under everyone standing on it
  npc: 30,
  player: 40,
  hint: 50,
};

// where along the street a tile sits, in world pixels: the middle of it, so a door placed
// at a tile is reached from either side of it
export function atTile(tx) {
  return tx * TS + TS / 2;
}

// Weather behind the town, and then the painting laid over the top of it at 1:1. The
// paintings carry no sky of their own, so what is behind is drawn: a dusk going to the
// last of the light at the water, banks of cloud lying across it, and a steely sea under
// them, which is what you are looking at wherever a panel has a hole in it. A panel with
// no horizon is somewhere indoors and gets the two flat bands instead.
// Every copy after the first is flipped, so the join is a mirror — the two halves of a
// seam are the same edge, and the row of houses reads as a longer town rather than as the
// same town twice.
export function createStreet(scene, def) {
  const [w, h] = def.size;
  const width = w * def.repeats;

  if (def.horizon) {
    scene.add.image(0, 0, weatherFor(scene, width, h, def.horizon))
      .setOrigin(0, 0).setDepth(DEPTH.weather);
    // The weather is sky and water and nothing else, so the ground the panel is walked on
    // is laid over the bottom of it, from the line where the water gives out. A painting
    // covers both; without one this is a shore rather than a man standing on the sea.
    if (def.sill && def.sill < h) {
      const g = scene.add.graphics().setDepth(DEPTH.weather + 1);
      g.fillStyle(COLORS.sand[0], 1);
      g.fillRect(0, def.sill, width, h - def.sill);
    }
  } else {
    // A panel with no horizon is a room, or a town painted with a sky of its own. Either
    // way what goes behind it is a wall down to where the wall meets the floor and boards
    // below that — which a painting covers completely, and which is the whole of a room
    // that has not been painted yet.
    const sill = def.sill ?? def.ground;
    const g = scene.add.graphics().setDepth(DEPTH.weather);
    g.fillStyle(COLORS.wall[0], 1);
    g.fillRect(0, 0, width, sill);
    g.fillStyle(COLORS.wood[0], 1);
    g.fillRect(0, sill, width, h - sill);
  }

  // missing until its file is in, so this asks: without it the street is the bands alone,
  // which is enough to walk along and place things against
  if (scene.textures.exists(def.art)) {
    for (let i = 0; i < def.repeats; i++) {
      const img = scene.add.image(i * w, 0, def.art).setOrigin(0, 0).setDepth(DEPTH.town);
      if (i % 2) img.setFlipX(true);
    }
  }

  return {
    width,
    height: h,
    ground: def.ground,
    sill: def.sill ?? def.ground,
    body: def.body ?? TUNING.streetBodyPx,
  };
}

// A mug painted into the room, taken off it. The painting cannot be moved and nothing can
// be lifted out of it, so what is lifted is the eye: a patch of bare counter is cut from
// somewhere else along the same bar and laid over where the mug stands, at the same rows,
// so the shadow, the lit top and the lip all line up and only the mug goes. Whoever is
// holding it is drawn over the top of it, which is the point.
export function coverPatch(scene, art, take) {
  const [x, y, w, h] = take.mug;
  const [sx, sy] = take.counter;
  const name = `bare_${sx}_${sy}_${w}_${h}`;
  const tex = scene.textures.get(art);
  if (!tex.has(name)) tex.add(name, 0, sx, sy, w, h);
  return scene.add.image(x, y, art, name)
    .setOrigin(0, 0).setDepth(DEPTH.town + 1).setVisible(false);
}

// One sky and one sea, baked once per size and horizon and kept, since two panels the same
// shape are the same evening. Everything about it is drawn rather than painted, so it
// costs no files and retints out of tuning.js.
function weatherFor(scene, w, h, horizon) {
  const key = `weather_${w}_${h}_${horizon}`;
  if (scene.textures.exists(key)) return key;

  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  const band = (y, colour) => {
    ctx.fillStyle = hex(colour);
    ctx.fillRect(0, y, w, 1);
  };

  // Dusk overhead going to the last of the light at the water. Squared off, so the light
  // is a band low down rather than half the sky.
  for (let y = 0; y < horizon; y++) band(y, blend(COLORS.skyHigh, COLORS.skyLow, (y / horizon) ** 2.2));
  // and steel at the horizon, darker as it comes in
  for (let y = horizon; y < h; y++) band(y, blend(COLORS.seaFar, COLORS.seaNear, (y - horizon) / Math.max(1, h - horizon)));

  // Cloud lying in banks rather than piled up: this is weather that has been here a while.
  // Each bank is drawn a column at a time, thinning away at both ends and with its edge
  // wandering, so it reads as painted rather than as a rectangle. The lower a bank sits the
  // more of the light it is catching.
  const bank = (top, deep, from, span) => {
    const lit = Math.min(1, (top / horizon) ** 1.5 + 0.1);
    ctx.fillStyle = hex(blend(COLORS.skyCloud, COLORS.skyCloudLit, lit));
    for (let x = from; x < from + span; x++) {
      const taper = Math.min(1, Math.sin((Math.PI * (x - from)) / span) * 1.7);
      const wander = Math.sin(x / 13 + top) * 1.6 + Math.sin(x / 4.7 + top) * 0.9;
      const d = Math.round(deep * taper);
      if (d > 0) ctx.fillRect(x, Math.round(top + wander), 1, d);
    }
  };
  // seven of them, spread down the sky and along it, at no two the same height or length
  for (let i = 0; i < 7; i++) {
    const down = 0.12 + 0.72 * ((i * 0.37) % 1);
    bank(horizon * down, 3 + ((i * 5) % 9), Math.round(w * ((i * 0.29) % 1)) - w * 0.2,
      Math.round(w * (0.25 + 0.3 * ((i * 0.53) % 1))));
  }

  // and the swell, which is a dash of light on a line of water and nothing more
  ctx.fillStyle = hex(COLORS.seaCrest);
  for (let y = horizon + 2; y < h; y += 3) {
    const gap = 9 + ((y * 5) % 17);
    for (let x = (y * 7) % gap; x < w; x += gap) ctx.fillRect(x, y, 2 + ((x + y) % 3), 1);
  }

  tex.refresh();
  return key;
}

// What the player is standing at: the nearest building or door within reach, or nothing.
// Reach is the panel's, the way it is for people: a doorway across a room painted from
// across it is further off in pixels than one across a street. See findTarget.
// A building with a door of its own is not in the map's door list — it answers for itself,
// because whether it opens is a question about its repair rather than about the street.
export function focusNear(mapKey, px, scale = 1) {
  let best = null;
  let bestDist = TUNING.streetReach * scale;

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
