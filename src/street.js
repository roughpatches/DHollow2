// Dreadhollow from the side. A street is one painted town laid end to end as many times
// as it is long, a line drawn across it to walk on, and everything standing on that line
// placed by how far along it stands. There is no grid, no seams and no collision map: the
// painting is the town, and the only thing you can do to it is stand somewhere along it.
// See `street` in content/maps.js for the definition this reads.

import { TUNING, COLORS, hex, blend } from '../tuning.js';
import { MAPS } from '../content/maps.js';
import { buildings } from './town.js';
import { createSmoke, createShimmer, createDrift, createFlicker, glowIn, skyward } from './ambient.js';

const TS = TUNING.tileSize;

// Draw order on a street. A side view has no depth to sort by — nobody is ever further up
// the road than anybody else — so the layers are named once here and never computed.
export const DEPTH = {
  weather: -10,
  town: 0,
  glow: 2, // the light behind a window in the painting, which is inside it rather than on it
  drift: 3, // the scud crossing the painted sky, the light on the painted water, and the
  shimmer: 4, // smoke over the roofs: all three lie on the painting, under everything
  smoke: 5, // standing in front of it, and in that order where they meet
  structure: 10,
  prop: 20,
  lamplight: 22, // what a lamp throws on the cobbles: over the post it comes off, and under
  shadow: 25, // the pools at people's feet, which are cast on the lit ground rather than
  // under it — over the painting, and under everyone standing on it
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
// them. That is what shows wherever a panel has a hole in it. A panel with no horizon
// is somewhere indoors and gets the two flat bands instead.
// Every copy after the first is flipped, so the join is a mirror — the two halves of a
// seam are the same edge, and the row of houses reads as a longer town rather than as the
// same town twice.
export function createStreet(scene, def) {
  const [w, h] = def.size;
  const width = w * def.repeats;
  let drawn = null; // the weather a panel draws for itself, where it has no painting

  if (def.horizon) {
    drawn = weatherFor(scene, width, h, def.horizon);
    scene.add.image(0, 0, drawn).setOrigin(0, 0).setDepth(DEPTH.weather);
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
    // below that. A painting covers all of it, and it is all a room that has not been
    // painted yet needs.
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
    // and the light anybody standing on it is lit by; see `light` in content/maps.js
    light: def.light ?? COLORS.streetLight,
    // and whatever moves on the panel without being asked to. All of it is read off the
    // painting — the sky a plume is coloured against, the water a glint is allowed to sit
    // on — so a panel with no painting in yet has none of it. See src/ambient.js.
    ambient: scene.textures.exists(def.art) ? [
      def.smoke && createSmoke(scene, vents(scene, def, w), DEPTH.smoke),
      def.water && createShimmer(scene, def.art, spread(def.water, def, w), DEPTH.shimmer),
      def.sky && createDrift(scene, def.art, spread(def.sky, def, w), DEPTH.drift),
      // a lit window gutters the same way a lamp does, so it is the same clock
      def.windows && createFlicker(glowIn(scene, def.art, spread(def.windows, def, w), DEPTH.glow)),
    ].filter(Boolean) : weatherMoving(scene, drawn, width, def),
  };
}

// What the game drew for itself, moved the way a painting is. A panel with a picture has
// its sky and its water read off that picture; a panel without one is looking straight at
// weatherFor's own dusk, and it gets the same two things over it — scud crossing the sky,
// and the light coming up and going on the water. Nothing here is new: it is the town's
// weather, pointed at the town's own canvas, so retuning one retunes both.
// The sea is handed over a row at a time because it is a gradient rather than a painted
// sea: a row is one colour all the way across, and the light on it is that colour brought
// up, where the whole band at once would be read as two colours and glint on two lines.
function weatherMoving(scene, key, width, def) {
  if (!key) return [];
  const sea = def.sill ?? def.size[1]; // where the water gives out and the strand starts
  // and on every third line of it, which is where the swell sat when it was baked into the
  // picture: a dash on every line is not a rougher sea, it is a lit one
  const rows = [];
  for (let y = def.horizon + 2; y < sea; y += 3) rows.push([0, y, width, 1]);
  return [
    createDrift(scene, key, [[0, 0, width, def.horizon]], DEPTH.drift),
    createShimmer(scene, key, rows, DEPTH.shimmer),
  ];
}

// A panel's rects — of water, of sky — laid along the whole street rather than in one copy
// of the painting, flipped the way the chimneys are and for the same reason.
function spread(rects, def, w) {
  const out = [];
  for (const [x, y, rw, rh] of rects) {
    for (let i = 0; i < def.repeats; i++) {
      out.push([i * w + (i % 2 ? w - x - rw : x), y, rw, rh]);
    }
  }
  return out;
}

// Where the chimneys are along the whole street rather than in one copy of the painting,
// and what colour each of them smokes. Every copy after the first is flipped, so a chimney
// in one of those is the same distance from the other end of the panel as it is from this
// one — but it is the same chimney against the same sky, so the colour is read once, off
// the painting, where the designer measured it.
function vents(scene, def, w) {
  const out = [];
  for (const [x, y] of def.smoke) {
    const colour = skyward(scene, def.art, x, y);
    for (let i = 0; i < def.repeats; i++) {
      out.push({ x: i * w + (i % 2 ? w - x : x), y, colour });
    }
  }
  return out;
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

// The dither the drawn sky and sea are laid down with. A ramp of a counted number of
// colours reads as bands; the same ramp with each pixel nudged to the step above or below
// it on a fixed 4x4 pattern reads as one colour going into another, and every pixel on it
// is one of the few colours the picture is made of. Ordered rather than random, because
// what is drawn once and looked at for an hour must not be noise.
const DITHER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Which colour of a ramp a pixel takes: the step the fraction falls on, and the one above
// it wherever this pixel's place in the pattern says to reach for it.
// The reaching is squeezed into the join between one step and the next rather than run
// across the whole of it, because a ramp dithered end to end is half one colour and half
// the other nearly everywhere, and what that reads as at this size is not a sky going
// from one colour to another — it is hatching laid over the lot of it. Squeezed, each
// colour has a run it holds on its own and they are mixed where they meet, which is how
// anybody drawing this by hand would have laid it down.
function stepAt(t, x, y) {
  const at = t * (TUNING.streetSkySteps - 1);
  const low = Math.floor(at);
  const mix = TUNING.streetSkyMix;
  const near = mix > 0 ? Math.min(1, Math.max(0, (at - low - 0.5) / mix + 0.5)) : 0;
  const up = near > (DITHER[y & 3][x & 3] + 0.5) / 16 ? 1 : 0;
  return Math.min(TUNING.streetSkySteps - 1, low + up);
}

// and the colours themselves, mixed once rather than per pixel
function ramp(from, to) {
  const n = TUNING.streetSkySteps;
  return Array.from({ length: n }, (_, i) => blend(from, to, i / (n - 1)));
}

// One sky and one sea, baked once per size and horizon and kept, since two panels the same
// shape are the same evening. Everything about it is drawn rather than painted, so it
// costs no files and retints out of tuning.js.
function weatherFor(scene, w, h, horizon) {
  const key = `weather_${w}_${h}_${horizon}`;
  if (scene.textures.exists(key)) return key;

  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();

  // Dusk overhead going to the last of the light at the water, and steel at the horizon
  // going darker as it comes in. Both are laid down in a counted number of colours with
  // the dither below carrying the rest, rather than a fresh colour on every row: a ramp
  // over three hundred rows of a picture drawn in whole pixels is the one thing on the
  // screen that is not pixel art, and it bands in stripes anyway.
  const sky = ramp(COLORS.skyHigh, COLORS.skyLow);
  const sea = ramp(COLORS.seaFar, COLORS.seaNear);
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    // Squared off above the horizon, so the light is a band low down rather than half
    // the sky; straight down below it.
    const up = y < horizon;
    const t = up ? (y / horizon) ** 2.2 : (y - horizon) / Math.max(1, h - horizon);
    for (let x = 0; x < w; x++) {
      const colour = (up ? sky : sea)[stepAt(t, x, y)];
      const i = (y * w + x) * 4;
      img.data[i] = (colour >> 16) & 255;
      img.data[i + 1] = (colour >> 8) & 255;
      img.data[i + 2] = colour & 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

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

  // The swell is not drawn here. It was a fixed pattern of dashes baked into the picture,
  // which is a sea that has been photographed rather than one that is moving; it is the
  // shimmer instead, which is the same dashes coming up and going out on their own clocks.
  // See weatherMoving above.

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
