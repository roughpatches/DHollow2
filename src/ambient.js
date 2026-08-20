// What moves in a place when nothing is happening in it.
//
// Ambient movement is drawing and nothing else: nothing here is asked anything by the
// game and nothing here asks the game anything, which is why a leaf landing in the wrong
// place costs nothing to be wrong about. Everything is tuned from tuning.js.

import { TUNING, COLORS } from '../tuning.js';

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
