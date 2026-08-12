// The middle band of the crawl: the party walking, the landscape going by behind them,
// and the next node coming into view up ahead. It owns its own game objects and lives
// across redraws of the panel over it, because a scrolling background that is rebuilt on
// every keypress is not a scrolling background.
//
// Everything here is drawing. The run does not ask it anything and it does not tell the
// run anything — see src/run.js for what a node actually costs.

import { TUNING, COLORS } from '../tuning.js';
import { BAND, actorFrame, walkAnim, markKey } from './textures.js';
import { footOf } from './art.js';
import { charOf } from './party.js';

const LAYERS = ['far', 'mid', 'near'];

export function createWalk(scene, rect, party, when) {
  const night = when === 'night';
  const layer = scene.add.container(0, 0).setDepth(28900);
  const ground = rect.y + rect.h * TUNING.questWalkGroundFrac;

  // sky above the ground line, and packed earth all the way down below it, so the band
  // has no dead colour in it anywhere
  const sky = scene.add.graphics();
  sky.fillStyle(night ? COLORS.questSkyNight : COLORS.questSkyDay, 1);
  sky.fillRect(rect.x, rect.y, rect.w, ground - rect.y);
  sky.fillStyle(COLORS.path[1], 1); // the road's own colour, so the band has no seam in it
  sky.fillRect(rect.x, ground, rect.w, rect.y + rect.h - ground);
  layer.add(sky);

  // Each band is tiled across the width and scrolled at its own fraction of the near
  // ground's speed, which is the whole of the parallax.
  const bands = LAYERS.map((name, i) => {
    const [, h] = BAND[name];
    const y = name === 'near' ? ground : ground - (name === 'mid' ? 4 : 12);
    const t = scene.add.tileSprite(rect.x, y, rect.w, h, `band_${name}`).setOrigin(0, name === 'near' ? 0 : 1);
    if (night) t.setTint(COLORS.questNightTint);
    layer.add(t);
    return { t, rate: TUNING.questParallax[i] };
  });

  // The party stands on the near band, spread back from the leading walker. The player is
  // first in the list and so is first up the road.
  const bodies = party.map((id, i) => {
    const palette = charOf(id).palette;
    const foot = footOf(palette);
    const sp = scene.add.sprite(rect.x + 90 + i * 34, ground + 4, actorFrame(palette, 'right', 0));
    sp.setOrigin(0.5, foot);
    // a placeholder fills its frame and drawn art does not, so drawn art is lifted to
    // stand the same height as the rest of the party
    const drawn = foot < 1 ? TUNING.questArtScale : 1;
    sp.setScale((TUNING.questBodyPx / (sp.frame.height * foot)) * drawn);
    sp.setDepth(party.length - i); // whoever is in front overlaps whoever is behind
    if (night) sp.setTint(COLORS.questNightTint);
    layer.add(sp);
    return { sp, palette };
  });

  // The node ahead: it walks in from off the right and stops short of the leading body,
  // which is the whole of "the party arrives at it".
  const markFrom = rect.x + rect.w + 40;
  const markTo = rect.x + rect.w * 0.66;
  const mark = scene.add.image(markFrom, ground + 4, markKey('gather')).setOrigin(0.5, 1).setScale(TUNING.questMarkScale);
  mark.setVisible(false);
  if (night) mark.setTint(COLORS.questNightTint);
  layer.add(mark);

  let moving = false;
  let arriving = null; // { until, total, onArrive }

  const api = {
    layer,

    // walking or standing still: the bands only scroll and the legs only move when the
    // party is actually going somewhere
    setMoving(on) {
      if (on === moving) return;
      moving = on;
      for (const b of bodies) {
        if (on) b.sp.anims.play(walkAnim(b.palette, 'right'), true);
        else b.sp.anims.stop();
      }
    },

    // start the next node walking into view; onArrive fires when it gets there
    approach(nature, onArrive) {
      mark.setTexture(markKey(nature || 'gather')).setVisible(true);
      mark.x = markFrom;
      arriving = { until: TUNING.questApproachMs, total: TUNING.questApproachMs, onArrive };
      api.setMoving(true);
    },

    // it is behind them now
    pass() {
      mark.setVisible(false);
      arriving = null;
    },

    update(delta) {
      if (moving) {
        for (const b of bands) b.t.tilePositionX += (TUNING.questScrollPxPerSec * b.rate * delta) / 1000;
      }
      if (!arriving) return;
      arriving.until -= delta;
      const done = 1 - Math.max(0, arriving.until) / arriving.total;
      mark.x = markFrom + (markTo - markFrom) * done;
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
      layer.destroy(true);
    },
  };

  api.setMoving(true);
  return api;
}
