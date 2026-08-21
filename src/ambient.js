// What moves in a place when nothing is happening in it.
//
// Ambient movement is drawing and nothing else. Nothing here is asked anything by the
// game and nothing here asks the game anything, so a leaf landing in the wrong place
// costs nothing to be wrong about. Everything is tuned from tuning.js.

import { TUNING, COLORS, blend, hex } from '../tuning.js';

// Leaves coming down through a wood. A fixed handful of them, each falling at its own
// rate and fluttering as it goes, put back above the band whenever one reaches the
// ground — so a wood that never stops shedding costs the same as one leaf falling
// once. They are drawn into the walk's own container, which gives them its depth and
// takes them away with it.
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
    // The first fall is spread down the whole band rather than started above it, so the
    // wood is already shedding when it comes on screen instead of filling up from empty
    // over the first few seconds of a run.
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
// Where it is let go is inset by its own swing and by half its own width, so a leaf at
// the end of a swing is still inside the band and not out over the ironwork beside it.
// Both halves matter: inset by the swing alone and the far edge of the leaf still hangs
// over.
function cast(rect) {
  const sway = between(TUNING.questLeafSway);
  const edge = sway + TUNING.questLeafPx[0] / 2;
  return {
    sway,
    x: rect.x + edge + Math.random() * Math.max(1, rect.w - edge * 2),
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
// what a puff has of its own is a wobble, which makes the column waver instead of
// fanning. The lean is per pixel risen rather than per second, so it never wanders off
// the panel. What this is drawn over is a painting, so a puff steps between a few
// alphas rather than fading smoothly: blending continuously against a painting gives
// a smear, and three greys laid over it give weather.
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
// painting and pushed away from itself. One rule rather than a colour per panel, because
// what a plume has to stand out against is not the town, it is whatever weather was
// painted behind that one roof.
export function skyward(scene, art, x, y) {
  const sky = scene.textures.getPixel(x, Math.max(0, y - TUNING.streetSmokeRead), art);
  return sky ? awayFrom(sky.color, TUNING.streetSmokeContrast) : COLORS.streetSmoke;
}

// A colour that will be seen against another: the one pushed away from the other, dark
// against a pale ground and pale against a dark one. What the smoke and the scud are both
// coloured by, because both are laid over a painting that was not painted for them.
function awayFrom(colour, amount) {
  const lit = (((colour >> 16) & 255) * 0.3 + ((colour >> 8) & 255) * 0.6
    + (colour & 255) * 0.1) / 255;
  return blend(colour, lit > 0.5 ? 0x000000 : 0xffffff, amount);
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
function waterIn(scene, art, rect) {
  const [x, y] = rect;
  const pix = pixelsOf(scene, art, rect);
  const tones = tonesIn(pix, TUNING.streetWaterTones);
  const spots = [];
  const wet = new Set();
  for (let row = 0; row < pix.h; row++) {
    for (let col = 0; col < pix.w; col++) {
      if (!tones.includes(pix.at(col, row))) continue;
      spots.push([x + col, y + row]);
      wet.add(`${x + col},${y + row}`);
    }
  }
  return { spots, wet, colour: tones[0] };
}

// Scud going across a painted sky. Thin streaks, low and pale, crossing under the weather
// the panel was painted with rather than moving it: the cloud banks in these skies are
// part of the picture and cannot be shifted, but something passing under them reads as
// weather where a painting that never changes reads as a photograph.
//
// A streak lives inside the rect it was given and is clipped to it, so it slides in from
// one edge and out of the other rather than appearing whole, and it never reaches over the
// roofs below. The rect is the designer's promise that everything in it is sky; unlike the
// water there is nothing to read here, because on these panels a slate roof and a rain
// cloud are the same grey and no rule would tell them apart.
export function createDrift(scene, art, rects, depth) {
  const streaks = [];

  for (const rect of rects) {
    const [x, y, w, h] = rect;
    const colour = awayFrom(tonesIn(pixelsOf(scene, art, rect), 1)[0], TUNING.streetDriftContrast);
    const many = Math.round(((w * h) / 1000) * TUNING.streetDriftPer);
    for (let i = 0; i < many; i++) {
      const sp = scene.add.rectangle(0, 0, 1, 1, colour)
        .setOrigin(0, 0).setDepth(depth).setVisible(false);
      const s = { sp, rect, ...adrift(rect) };
      // already halfway across when the panel comes up, rather than a sky that fills from
      // one side over the first minute of standing in it
      s.x = x - s.long + Math.random() * (w + s.long);
      streaks.push(s);
    }
  }

  return {
    update(delta) {
      const steps = TUNING.streetDriftSteps;
      const fade = TUNING.streetDriftFade;
      for (const s of streaks) {
        const [x, , w] = s.rect;
        s.x += (s.pace * delta) / 1000;
        if (s.x > x + w) Object.assign(s, adrift(s.rect), { x: x - s.long });

        // clipped to the rect, so what is over the roofs is not drawn rather than drawn
        // and hoped about
        const from = Math.max(s.x, x);
        const to = Math.min(s.x + s.long, x + w);
        const wide = Math.round(to - from);
        if (wide <= 0) {
          s.sp.setVisible(false);
          continue;
        }
        s.sp.setVisible(true);
        if (wide !== s.sp.width) s.sp.setSize(wide, s.tall);
        s.sp.x = Math.round(from);
        s.sp.y = s.y;
        // and thinned as it comes in and goes out, so nothing appears at the edge of a rect
        // that stops short of the edge of the panel
        const near = Math.min(to - x, x + w - from) / fade;
        s.sp.setAlpha((Math.ceil(Math.min(1, near) * steps) / steps) * TUNING.streetDriftAlpha);
      }
    },

    destroy() {
      for (const s of streaks) s.sp.destroy();
      streaks.length = 0;
    },
  };
}

// One streak: which row of the sky it crosses, how long it is, how thick, and how fast it
// goes. Rolled again each time one has crossed, so the sky is never the same twice.
function adrift([, y, , h]) {
  const tall = Math.round(between(TUNING.streetDriftTall));
  return {
    tall,
    y: Math.round(y + Math.random() * (h - tall)),
    long: Math.round(between(TUNING.streetDriftLong)),
    pace: between(TUNING.streetDriftPace),
  };
}

// A lamp guttering. The picture is drawn twice — the dark one always, the lit one over it
// at a wavering strength — so the flame comes up and dies down without the lamp ever going
// out, and neither picture is touched. Both were painted for this: the lit one differs from
// the dark one down the whole post, not only at the glass, so what wavers is the light on
// the ironwork as well as the flame in it.
//
// The waver is two slow sines at lengths that do not divide into each other, which never
// come round together and so never repeat. A flame on a clean sine is a pulse, and a row
// of lamps on the same pulse is a row of lamps wired together.
export function createFlicker(lamps) {
  const lit = lamps.map((sp, i) => ({
    sp,
    // each lamp started at its own point in both sines, so no two are ever the same lamp
    at: Math.random() * Math.PI * 2,
    also: Math.random() * Math.PI * 2,
  }));

  return {
    update(delta) {
      const [slow, quick] = TUNING.streetFlickerMs;
      const [low, high] = TUNING.streetFlickerRange;
      const steps = TUNING.streetFlickerSteps;
      for (const l of lit) {
        l.at += (Math.PI * 2 * delta) / slow;
        l.also += (Math.PI * 2 * delta) / quick;
        // Stepped along the waver rather than along the alpha, so the steps land inside
        // the range instead of rounding through it: quantising the alpha itself puts the
        // bottom step below `low`, and a lamp somebody keeps lit is down rather than out.
        const up = 0.5 + 0.3 * Math.sin(l.at) + 0.2 * Math.sin(l.also);
        l.sp.setAlpha(low + (high - low) * (Math.round(up * steps) / steps));
      }
    },

    destroy() {
      for (const l of lit) l.sp.destroy();
      lit.length = 0;
    },
  };
}

// What a lamp throws. createFlicker above gutters the picture and nothing else: the flame
// came up and died down and the street it stood in never changed. This is the rest of it —
// a pool of light on the cobbles, anybody near it carried off the panel's own light toward
// the flame's colour, and their shadow thrown away from the post rather than sitting under
// their boots wherever they stand.
//
// Nothing here keeps a clock. The lamp is already guttering on two slow sines that never
// come round together, and its alpha is read off the picture every frame: a pool given a
// waver of its own would be a second flame in the same glass, and the two would drift.
// The flicker is stepped, so the light on the ground and on a face is stepped with it.
//
// It owns where a body's shadow lies, which is why it is updated after the scene has put
// that shadow under their feet — see World.update. A panel with no lit prop on it has none
// of this and the shadow stays where the scene put it.
export function createLamplight(scene, lamps, depth) {
  // The pool is a few rings inside one another rather than one shape, each adding its own
  // share of the light: brightest under the post where all of them lie over each other, and
  // giving out in steps toward the edge. One ellipse is a hard line drawn round the light,
  // which reads as a shape painted on the cobbles rather than as anything falling on them —
  // and stepping it is what the smoke and the glints already do, for the same reason.
  // Each is filled solid and carried on its object alpha, which is where the flame is read
  // in: a shape's fill alpha and its object alpha multiply, so a ring built with its fill
  // at nothing stays at nothing however bright the lamp gets.
  const steps = TUNING.streetLampPoolSteps;
  const pools = [];
  for (const lamp of lamps) {
    for (let i = steps; i > 0; i--) {
      const reach = (TUNING.streetLampPool * i) / steps;
      pools.push({
        lamp,
        ring: scene.add.ellipse(lamp.x, lamp.y,
          reach * 2, reach * 2 * TUNING.streetShadowDeep, COLORS.streetGlow)
          .setDepth(depth).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0),
      });
    }
  }

  // How much of the nearest lamp is on somebody standing at x, and how far it throws their
  // shadow. The light is nothing outside the reach, all of it at the foot of the post, and
  // the flame's own strength scales both.
  // The throw is not which side of the post they are on: it is nothing directly under it,
  // longest about halfway out, and nothing again at the edge of the reach — which is what
  // a light overhead does, and is also the only shape that does not jump. On the sign
  // alone a shadow the length of itself swaps ends the moment somebody walks past a lamp.
  // In whole pixels, because everything else on this panel is.
  function nearest(x) {
    let most = 0;
    let cast = 0;
    for (const sp of lamps) {
      const out = (x - sp.x) / TUNING.streetLampReach;
      if (Math.abs(out) >= 1) continue;
      const near = (1 - Math.abs(out)) ** TUNING.streetLampFall * sp.alpha;
      if (near <= most) continue;
      most = near;
      cast = Math.round(4 * out * (1 - Math.abs(out)) * TUNING.streetLampCast * sp.alpha);
    }
    return [most, cast];
  }

  return {
    // `light` is the panel's own, which is what anybody out of reach of every lamp keeps
    update(bodies, light) {
      // every ring its own share, so where all of them lie together the light is whole
      for (const p of pools) {
        p.ring.setAlpha((p.lamp.alpha * TUNING.streetLampPoolAlpha) / steps);
      }

      for (const b of bodies) {
        // measured off the physics body rather than the sprite, the way the scene measures
        // where to put the shadow, and for the same reason: the sprite catches up a frame late
        const [near, cast] = nearest(b.body ? b.body.center.x : b.x);
        b.setTint(near > 0 ? blend(light, COLORS.streetGlow, near * TUNING.streetLampWarm) : light);
        const shade = b.shade;
        if (!shade) continue;
        if (shade.base === undefined) shade.base = shade.width;
        // Half the stretch on the centre and the whole of it on the width, so the end
        // under their boots stays where it is and only the far end reaches.
        if (shade.width !== shade.base + Math.abs(cast)) {
          shade.setSize(shade.base + Math.abs(cast), shade.height);
        }
        shade.x += cast / 2;
      }
    },

    destroy() {
      for (const p of pools) p.ring.destroy();
      pools.length = 0;
    },
  };
}

// A room lit behind a window somebody painted dark. Everything else here moves what the
// painting already has; this puts something in it that was never there, so it is done as
// carefully as that deserves: the light is laid only on the pixels the painting drew as
// empty glass, and never on the sash bars across them. What comes out is light behind a
// broken window rather than a lit rectangle stuck on a wall, and the window is still the
// window that was painted.
// The images are handed back rather than driven here, because what a lit window does is
// exactly what a lamp does — see createFlicker.
export function glowIn(scene, art, rects, depth) {
  return rects.map((rect) => {
    const [x, y, w, h] = rect;
    const key = `glow_${art}_${x}_${y}_${w}_${h}`;
    if (!scene.textures.exists(key)) {
      const pix = pixelsOf(scene, art, rect);
      const tex = scene.textures.createCanvas(key, w, h);
      const ctx = tex.getContext();
      ctx.fillStyle = hex(COLORS.streetGlow);
      for (let row = 0; row < h; row++) {
        for (let col = 0; col < w; col++) {
          const c = pix.at(col, row);
          const lit = ((c >> 16) & 255) * 0.3 + ((c >> 8) & 255) * 0.6 + (c & 255) * 0.1;
          if (lit < TUNING.streetGlowDark) ctx.fillRect(col, row, 1, 1);
        }
      }
      tex.refresh();
    }
    return scene.add.image(x, y, key).setOrigin(0, 0).setDepth(depth);
  });
}

// The pixels of a rect of a painting, read once off the image the way a building's pad
// below is measured in src/art.js.
function pixelsOf(scene, art, [x, y, w, h]) {
  const img = scene.textures.get(art).getSourceImage();
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const at = (col, row) => {
    const i = (row * w + col) * 4;
    return (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
  };
  return { at, w, h };
}

// and the colours that rect is most made of, commonest first
function tonesIn(pix, many) {
  const seen = new Map();
  for (let row = 0; row < pix.h; row++) {
    for (let col = 0; col < pix.w; col++) {
      const v = pix.at(col, row);
      seen.set(v, (seen.get(v) || 0) + 1);
    }
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).slice(0, many).map(([v]) => v);
}
