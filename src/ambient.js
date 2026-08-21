// What moves in a place when nothing is happening in it.
//
// Ambient movement is drawing and nothing else: nothing here is asked anything by the
// game and nothing here asks the game anything, which is why a leaf landing in the wrong
// place costs nothing to be wrong about. Everything is tuned from tuning.js.

import { TUNING, COLORS, blend } from '../tuning.js';

// Leaves coming down through a wood. A fixed handful of them, each falling at its own
// rate and fluttering as it goes, put back above the band whenever one reaches the
// ground — so a wood that never stops shedding costs the same as one leaf falling once.
// They are drawn into the walk's own container, which is what gives them its depth and
// what takes them away with it.
export function createLeaves(scene, layer, rect, ground, night) {
  const [across, down] = TUNING.questLeafPx;
  const leaves = [];

  for (let i = 0; i < TUNING.questLeaves; i++) {
    // the four leaf colours in turn rather than at random, so a handful this small is
    // never all one colour by chance
    const colour = COLORS.questLeaf[i % COLORS.questLeaf.length];
    const sp = scene.add.rectangle(0, 0, across, down, night ? darkened(colour) : colour)
      .setOrigin(0.5, 0.5);
    layer.add(sp);
    const leaf = { sp, ...cast(rect) };
    // The first fall is spread down the whole band rather than started above it: the wood
    // is already shedding when it comes on screen, instead of filling up from empty over
    // the first few seconds of a run.
    leaf.y = rect.y + Math.random() * (ground - rect.y);
    leaves.push(leaf);
  }

  return {
    update(delta) {
      for (const leaf of leaves) {
        leaf.y += (leaf.fall * delta) / 1000;
        leaf.turn += (Math.PI * 2 * delta) / leaf.swayMs;
        if (leaf.y > ground) Object.assign(leaf, cast(rect));

        const swing = Math.sin(leaf.turn);
        // A leaf turning over as it swings: flat to the eye at the ends of a swing and
        // edge-on crossing the middle of it, which is one pixel wide. Whole pixels only —
        // a leaf half a pixel across is a smudge rather than a leaf.
        const face = 1 + Math.round((across - 1) * Math.abs(swing));
        if (face !== leaf.sp.width) leaf.sp.setSize(face, down);
        leaf.sp.x = Math.round(leaf.x + swing * leaf.sway);
        leaf.sp.y = Math.round(leaf.y);
        // A leaf waiting its turn is held above the band rather than drawn there: the
        // band is all the room this has, and the panel over it does not cover the top.
        leaf.sp.setVisible(leaf.y >= rect.y);
      }
    },

    destroy() {
      for (const leaf of leaves) leaf.sp.destroy();
      leaves.length = 0;
    },
  };
}

// One leaf let go: how fast it comes down, how far it swings, how long a swing takes and
// where across the band it falls, each rolled between the two ends tuning gives it. It
// starts above the band and is held there unseen, so leaves come back a few at a time
// rather than all together whenever the last of them lands.
// Where it is let go is inset by its own swing, so a leaf at the end of a swing is still
// inside the band rather than out over the ironwork beside it.
function cast(rect) {
  const sway = between(TUNING.questLeafSway);
  return {
    sway,
    x: rect.x + sway + Math.random() * Math.max(1, rect.w - sway * 2),
    y: rect.y - TUNING.questLeafPx[1] - Math.random() * rect.h * 0.3,
    fall: between(TUNING.questLeafFall),
    swayMs: between(TUNING.questLeafSwayMs),
    turn: Math.random() * Math.PI * 2,
  };
}

function between([low, high]) {
  return low + Math.random() * (high - low);
}

// After dark. Everything else in the band is a sprite and takes the night tint Phaser
// puts on it; a leaf is a shape and has no tint, so it is multiplied by the same colour
// here and comes out the same amount colder as the landscape behind it.
function darkened(colour) {
  const ch = (s) => Math.round((((colour >> s) & 255) * ((COLORS.questNightTint >> s) & 255)) / 255) << s;
  return ch(16) | ch(8) | ch(0);
}

// Smoke going up off a chimney. A column of puffs to a vent, evenly spaced and all of them
// climbing at the one pace, each widening and thinning as it goes and wrapping back to the
// pot at the top: a plume is one thing moving, not a race between puffs, and puffs given
// their own paces overtake each other and break the column into a row of squares.
// So the pace, the height and the lean belong to the vent — the wind is the wind — and
// what a puff has of its own is a wobble, which makes the column waver rather than fan.
// The lean is per pixel risen rather than per second, so it never wanders off the panel.
// What this is drawn over is a painting, so a puff steps between a few alphas rather than
// fading smoothly: a painting blended against continuously is a smear, and three greys
// laid over it are weather.
// Each vent brings its own colour, read off the sky it stands against; see skyward().
export function createSmoke(scene, vents, depth) {
  const puffs = [];
  const [swing, cycle] = TUNING.streetSmokeWobble;

  for (const vent of vents) {
    // rolled once, and once only: everything off this pot climbs together
    const climb = Math.max(4, Math.min(between(TUNING.streetSmokeClimb), vent.y - 4));
    const rise = between(TUNING.streetSmokeRise);
    const lean = between(TUNING.streetSmokeLean);
    for (let i = 0; i < TUNING.streetSmokePuffs; i++) {
      const sp = scene.add.rectangle(0, 0, 1, 1, vent.colour)
        .setOrigin(0.5, 1).setDepth(depth);
      // spread up the column by slot, which is what keeps it evenly spaced for ever
      puffs.push({
        sp, vent, climb, rise, lean,
        gone: (i / TUNING.streetSmokePuffs) * climb,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  return {
    update(delta) {
      const wide = TUNING.streetSmokePx;
      const steps = TUNING.streetSmokeSteps;
      for (const p of puffs) {
        p.gone += (p.rise * delta) / 1000;
        // wrapped rather than let go again: a slot that keeps its place keeps its spacing
        if (p.gone >= p.climb) p.gone -= p.climb;

        const t = p.gone / p.climb;
        // Widening fast off the pot and slower after: a puff that spends the first third of
        // its climb one pixel across leaves a gap at the bottom of the column, which is the
        // one part of a plume nobody will believe a gap in.
        const size = 1 + Math.round((wide - 1) * Math.sqrt(t));
        if (size !== p.sp.width) p.sp.setSize(size, size);
        p.sp.x = Math.round(p.vent.x + p.lean * p.gone + Math.sin(p.gone / cycle + p.phase) * swing);
        p.sp.y = Math.round(p.vent.y - p.gone);
        // Thinning in whole steps, so what the painting is blended with is three greys
        // rather than every grey between here and gone. It holds most of the way up and
        // goes at the end: the widest part of a column is also the part worth seeing, and
        // a puff that starts thinning the moment it leaves the pot is never anything.
        const left = 1 - t * t;
        p.sp.setAlpha((Math.max(1, Math.ceil(left * steps)) / steps) * TUNING.streetSmokeAlpha);
      }
    },

    destroy() {
      for (const p of puffs) p.sp.destroy();
      puffs.length = 0;
    },
  };
}

// What colour smoke is over a given chimney: the sky a little above the pot, read off the
// painting, and pushed away from itself — dark smoke against a pale sky and pale against a
// dark one. One rule rather than a colour per panel, because what a plume has to stand out
// against is not the town, it is whatever weather was painted behind that one roof.
export function skyward(scene, art, x, y) {
  const sky = scene.textures.getPixel(x, Math.max(0, y - TUNING.streetSmokeRead), art);
  if (!sky) return COLORS.streetSmoke;
  const lit = (sky.red * 0.3 + sky.green * 0.6 + sky.blue * 0.1) / 255;
  return blend(sky.color, lit > 0.5 ? 0x000000 : 0xffffff, TUNING.streetSmokeContrast);
}

// Light moving on water. Glints are set down inside a rect of a painted panel, each a dash
// of a pixel or three that comes up and goes again on its own clock. Nothing here scrolls:
// water sliding sideways is a river, and what a sea does under a low sky is catch the light
// in one place and lose it in another.
// A rect of sea has a boat and a jetty and the end of a roof in it, so a glint is not put
// down anywhere in the rect — only on one of the few colours the rect is mostly made of,
// which is the water. That is also what lets the rect be drawn generously by eye rather
// than traced round the things standing in it.
export function createShimmer(scene, art, rects, depth) {
  const glints = [];

  for (const rect of rects) {
    const sea = waterIn(scene, art, rect);
    if (!sea.spots.length) continue;
    // a crest is the water with the light on it, so it is the water's own colour brought up
    const colour = blend(sea.colour, 0xffffff, TUNING.streetGlintContrast);
    const many = Math.round((sea.spots.length / 1000) * TUNING.streetGlintPer);
    for (let i = 0; i < many; i++) {
      const [x, y] = sea.spots[Math.floor(Math.random() * sea.spots.length)];
      // as wide as the water it sits on allows, so a dash never runs off onto a hull
      let wide = 1;
      while (wide < TUNING.streetGlintPx && sea.wet.has(`${x + wide},${y}`)) wide++;
      const sp = scene.add.rectangle(x, y, 1, 1, colour)
        .setOrigin(0, 0).setDepth(depth).setVisible(false);
      glints.push({ sp, wide, at: Math.random() * Math.PI * 2, period: between(TUNING.streetGlintMs) });
    }
  }

  return {
    update(delta) {
      const steps = TUNING.streetGlintSteps;
      const cut = TUNING.streetGlintCut;
      for (const g of glints) {
        g.at += (Math.PI * 2 * delta) / g.period;
        // Dark for most of its turn and lit for a little of it. A glint that is on half the
        // time is a light rather than a glint, and a sea of them is a lit shop window.
        const lit = (Math.sin(g.at) - cut) / (1 - cut);
        if (lit <= 0) {
          g.sp.setVisible(false);
          continue;
        }
        g.sp.setVisible(true);
        const wide = 1 + Math.round((g.wide - 1) * lit);
        if (wide !== g.sp.width) g.sp.setSize(wide, 1);
        g.sp.setAlpha((Math.ceil(lit * steps) / steps) * TUNING.streetGlintAlpha);
      }
    },

    destroy() {
      for (const g of glints) g.sp.destroy();
      glints.length = 0;
    },
  };
}

// Which pixels of a rect of a painting are water, and what colour that water is. Read once,
// off the image, the way a building's pad below is measured in src/art.js.
// The water is taken to be the handful of colours most of the rect is made of: a sea drawn
// round by eye is four fifths water and one fifth whatever is floating on it, and the two
// are nowhere near each other in colour.
function waterIn(scene, art, [x, y, w, h]) {
  const img = scene.textures.get(art).getSourceImage();
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;

  const seen = new Map();
  const at = (i) => (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
  for (let i = 0; i < d.length; i += 4) seen.set(at(i), (seen.get(at(i)) || 0) + 1);
  const tones = [...seen.entries()].sort((a, b) => b[1] - a[1])
    .slice(0, TUNING.streetWaterTones).map(([colour]) => colour);

  const spots = [];
  const wet = new Set();
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      if (!tones.includes(at((row * w + col) * 4))) continue;
      spots.push([x + col, y + row]);
      wet.add(`${x + col},${y + row}`);
    }
  }
  return { spots, wet, colour: tones[0] };
}
