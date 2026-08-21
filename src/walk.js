// The middle band of the crawl: the party walking, the landscape going by behind them,
// and the next node coming into view up ahead. It owns its own game objects and lives
// across redraws of the panel over it, because a scrolling background that is rebuilt on
// every keypress is not a scrolling background.
//
// Everything here is drawing. The run does not ask it anything and it does not tell the
// run anything — see src/run.js for what a node actually costs.

import { TUNING, COLORS } from '../tuning.js';
import { BAND, actorFrame, walkAnim, markKey } from './textures.js';
import { bodyOf, footOf, nodeArtFor, nodeFrame, nodeAnim } from './art.js';
import { charOf } from './party.js';
import { createLeaves } from './ambient.js';

const LAYERS = ['far', 'mid', 'near'];

export function createWalk(scene, rect, party, when, backdrop) {
  const night = when === 'night';
  const layer = scene.add.container(0, 0).setDepth(28900);
  // The road is where the party walks and where anything is placed against them. The
  // land is what is painted, which is everything the panels are not: it runs up behind
  // the bar and out behind the column, so nothing of the town shows through the gaps in
  // the ironwork. Both share a ground line, and that line belongs to the road.
  const land = rect.land || rect;
  const ground = rect.y + rect.h * TUNING.questWalkGroundFrac;

  // A zone with a painted landscape is drawn against it; a zone without one gets the
  // generated bands. The painting is missing until its file is in, so this asks.
  const painted = backdrop && scene.textures.exists(backdrop.image) ? backdrop : null;

  // Sky above the ground line, and packed earth all the way down below it, so the band
  // has no dead colour in it anywhere. Under a painting the earth is the painting's own
  // bottom edge, read off the image, so what runs out below it is the same ground.
  const floorColour = painted
    ? scene.textures.getPixel(0, scene.textures.get(painted.image).getSourceImage().height - 1,
      painted.image).color
    : COLORS.path[1];
  const sky = scene.add.graphics();
  sky.fillStyle(night ? COLORS.questSkyNight : COLORS.questSkyDay, 1);
  sky.fillRect(land.x, land.y, land.w, ground - land.y);
  sky.fillStyle(floorColour, 1);
  sky.fillRect(land.x, ground, land.w, land.y + land.h - ground);
  layer.add(sky);

  // The painting, at 1:1 and tiled across the width — scaling pixel art by a fraction is
  // how it stops being pixel art. It is cut along its own floor line and laid down as two
  // strips: the trees behind the party, drifting at the far rate, and the ground under
  // their feet, going past at the near rate. One image, two speeds, and the party stands
  // exactly where the painting says the ground is.
  const bands = [];
  if (painted) {
    const tall = scene.textures.get(painted.image).getSourceImage().height;
    const above = ground - land.y; // room between the top of the painting and the road
    const crop = Math.max(0, painted.ground - above); // what hangs off the top, cut off
    const top = land.y + Math.max(0, above - painted.ground);
    const strip = (y, h, from, rate) => {
      const t = scene.add.tileSprite(land.x, y, land.w, h, painted.image).setOrigin(0, 0);
      t.tilePositionY = from;
      if (night) t.setTint(COLORS.questNightTint);
      layer.add(t);
      bands.push({ t, rate });
      return t;
    };
    strip(top, painted.ground - crop, crop, TUNING.questParallax[0]);
    strip(ground, tall - painted.ground, painted.ground, TUNING.questParallax[2]);
  }

  // Each band is tiled across the width and scrolled at its own fraction of the near
  // ground's speed, which is the whole of the parallax. A painted zone brings its own.
  if (!painted) {
    LAYERS.forEach((name, i) => {
      const [, h] = BAND[name];
      const y = name === 'near' ? ground : ground - (name === 'mid' ? 4 : 12);
      const t = scene.add.tileSprite(land.x, y, land.w, h, `band_${name}`).setOrigin(0, name === 'near' ? 0 : 1);
      if (night) t.setTint(COLORS.questNightTint);
      layer.add(t);
      bands.push({ t, rate: TUNING.questParallax[i] });
    });
  }

  // The party stands on the near band, spread back from the leading walker. The player is
  // first in the list and so is first up the road.
  const bodies = party.map((id, i) => {
    const palette = charOf(id).palette;
    const foot = footOf(palette);
    const sp = scene.add.sprite(rect.x + 90 + i * 34, ground + 4, actorFrame(palette, 'right', 0));
    sp.setOrigin(0.5, foot);
    // a placeholder fills its frame and drawn art does not, so everyone is stood up by how
    // much of their frame is them rather than by the frame itself
    sp.setScale(TUNING.questBodyPx / (sp.frame.height * bodyOf(palette)));
    sp.setDepth(party.length - i); // whoever is in front overlaps whoever is behind
    if (night) sp.setTint(COLORS.questNightTint);
    layer.add(sp);
    return { sp, palette };
  });

  // The node ahead: it walks in from off the right and stops short of the leading body,
  // which is the whole of "the party arrives at it".
  const markFrom = rect.x + rect.w + 40;
  const markTo = rect.x + rect.w - TUNING.questMarkInset;
  // a sprite rather than an image: an encounter with art of its own has that art moving
  const mark = scene.add.sprite(markFrom, ground + 4, markKey('gather')).setOrigin(0.5, 1).setScale(TUNING.questMarkScale);
  mark.setVisible(false);
  if (night) mark.setTint(COLORS.questNightTint);
  layer.add(mark);

  // And whatever the place sheds, coming down over the lot of it: a wood is drawn with
  // leaves already on the ground, so leaves in the air are the same wood a moment earlier.
  // Created last, so they fall in front of the party and the node rather than behind them.
  const leaves = painted && painted.leaves
    ? createLeaves(scene, layer, land, land.y + land.h, night) : null;

  let moving = false;
  let arriving = null; // { until, total, onArrive }
  let standing = null; // the encounter whose own art is on the road, if it has any

  // Painted art is stood on the road by its own floor line, which every state has its own
  // measure of: the oak's roots run to the bottom of its frame and the trunk it becomes
  // sits well up inside its own. It is drawn at the size it was painted unless the state
  // asks for a whole multiple of that — the road has art painted at more than one size on
  // it, and a thicket painted at 80 is knee-high beside an oak painted at 256. The origin
  // is a fraction of the frame, so scaling turns the art about its floor line and what is
  // standing on the road stays standing on it.
  function wear(id, state) {
    const spec = nodeArtFor(id)[state];
    mark.setTexture(nodeFrame(id, state, 0));
    mark.setScale(spec.scale || 1).setOrigin(0.5, 1 - spec.ground / mark.frame.height);
    mark.anims.play(nodeAnim(id, state), true);
  }

  const api = {
    layer,

    // walking or standing still: the legs only move when the party is actually going
    // somewhere, and the bands drop to their idle drift when they are not
    setMoving(on) {
      if (on === moving) return;
      moving = on;
      for (const b of bodies) {
        if (on) b.sp.anims.play(walkAnim(b.palette, 'right'), true);
        else b.sp.anims.stop();
      }
    },

    // Start the next node walking into view; onArrive fires when it gets there. An
    // encounter with art of its own is drawn at the size it was painted and stood on the
    // road by its own floor line; everything else is the silhouette its nature gets,
    // which is drawn small and blown up.
    approach(kind, onArrive) {
      const art = nodeArtFor(kind && kind.id);
      standing = art ? kind.id : null;
      if (art) {
        wear(kind.id, 'stands');
      } else {
        mark.anims.stop();
        mark.setTexture(markKey((kind && kind.nature) || 'gather'));
        mark.setScale(TUNING.questMarkScale).setOrigin(0.5, 1);
      }
      mark.setVisible(true);
      mark.x = markFrom;
      arriving = { until: TUNING.questApproachMs, total: TUNING.questApproachMs, onArrive };
      api.setMoving(true);
    },

    // How far along the walk up to the next node they are, nothing to all of it. The
    // trail down the bottom of the screen reads it to slide the party along the road
    // between one node and the next, so both readouts are the same walk — eased, because
    // the road stops rather than being switched off: a tree that slides in at one speed
    // and halts on the frame it arrives reads as machinery moving it.
    coming() {
      return arriving ? Phaser.Math.Easing.Sine.Out(1 - Math.max(0, arriving.until) / arriving.total) : 1;
    },

    // The work is done and what was standing there is not standing any more: played
    // once and held, so it stays down while the party reads what it cost them.
    // whatever was standing there is not standing any more, for the ones the party
    // changes by working them; water is water afterwards
    felled() {
      if (standing && nodeArtFor(standing).done) wear(standing, 'done');
    },

    // it is behind them now
    pass() {
      mark.setVisible(false);
      mark.anims.stop();
      standing = null;
      arriving = null;
    },

    update(delta) {
      // The wood does not stop because the party has. Standing at a node the bands behind
      // them keep creeping, at a fraction of the walking pace, so a run at rest still has
      // air in it. The near ground is what their feet are on and holds still with them.
      const pace = moving ? 1 : TUNING.questIdleDrift;
      for (const b of bands) {
        if (!moving && b.rate >= 1) continue;
        b.t.tilePositionX += (TUNING.questScrollPxPerSec * b.rate * pace * delta) / 1000;
      }
      leaves?.update(delta);
      if (!arriving) return;
      arriving.until -= delta;
      mark.x = markFrom + (markTo - markFrom) * api.coming();
      if (arriving.until <= 0) {
        const { onArrive } = arriving;
        arriving = null;
        api.setMoving(false);
        onArrive?.();
      }
    },

    setVisible(on) {
      layer.setVisible(on);
    },

    // An activity draws at the scene's own depth, so the landscape drops below it and
    // the party stays visible at the tree while the work is done.
    depth(d) {
      layer.setDepth(d);
    },

    destroy() {
      leaves?.destroy();
      layer.destroy(true);
    },
  };

  api.setMoving(true);
  return api;
}
