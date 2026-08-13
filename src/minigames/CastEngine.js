// The Cast minigame, imported from StarScape. The first gate of a catch, and the one
// minigame about projecting to a target at a distance rather than timing something in
// place:
//
//  - HOLD to pay out line: the fly's REACH grows, and the pay-out SLOWS as more line
//    extends. RELEASE to present the fly at whatever reach it has got to.
//  - The feeding LANE drifts along the water and has to be tracked and committed to.
//  - A PRESENTATION meter decays from the moment the fly is in the air. Work the cast
//    too long and the fish moves off; present crisply and the fish you find is better.
//
// A hard gate: present inside the lane and a fish is located; fall short, overshoot, or
// run the presentation out and there is no fish (`failed = true`, the catch ends).
//
// Changed on import: the painted cast track, lie marker and fly are the kit's generic
// track / band / marker from src/uiatlas.js, the colours are the kit's tokens rather
// than StarScape's parchment hexes, its config comes from TUNING.fish in tuning.js, and
// the reactive water layer it signalled is not here. The mechanic is untouched.

import { COLOR, FONT } from './ui.js';
import { trackWidget, meterBar, clamp01 } from './meters.js';

export class CastEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.onComplete = null;
    this.startTime = null;
    this.reach = 0;
    this.holding = false;
    this.presented = false;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.presented = false;
    this.reach = 0;
    this.holding = false;
    this.presentation = 1;
    // seeded on the first update(): scene.time.now is 0 while a scene is still building
    this.startTime = null;

    const c = this.config;
    this.laneCenter = c.lane.start + c.lane.width / 2;
    this.laneTarget = this.laneCenter;

    const L = c.layout;
    this.BW = L.barW ?? 320;
    const bx = L.x;
    this.statusText = this.scene.add.text(bx, L.top, 'Hold SPACE to pay out line — release to present the fly in the lane',
      { fontSize: '16px', fontFamily: FONT, color: COLOR.muted });
    this.presLabel = this.scene.add.text(bx, L.top + 34, 'presentation',
      { fontSize: '15px', fontFamily: FONT, color: COLOR.text });
    this.presBar = meterBar(this.scene, bx, L.top + 64, this.BW, 14, 'bar_atb');
    this.lineText = this.scene.add.text(bx, L.top + 92, '',
      { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    // one widget for the whole water: the track is the reach, the band is the feeding
    // lane, the marker is the fly
    this.water = trackWidget(this.scene, bx, L.top + 140, this.BW, { height: 22 });

    this._layout();
  }

  _laneBounds() {
    const half = this.config.lane.width / 2;
    return [this.laneCenter - half, this.laneCenter + half];
  }

  setHolding(isHolding) {
    if (this.completed || this.presented) return;
    if (isHolding) {
      this.holding = true;
    } else if (this.holding) {
      // release = present the fly wherever the reach currently sits
      this.holding = false;
      this._present(this.scene.time.now);
    }
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastAt = now;
      this.lastWanderAt = now;
    }
    const c = this.config;
    const dt = Math.min(0.1, (now - this.lastAt) / 1000);
    this.lastAt = now;

    // the presentation window degrades; run it out and the fish moves off
    this.presentation = Math.max(0, this.presentation - dt * (1000 / c.presentationMs));
    if (this.presentation <= 0 && !this.presented) {
      this._fail('The fish moved off — you worked the cast too long.');
      return;
    }

    // drift the lane
    if (now - this.lastWanderAt >= c.lane.wanderIntervalMs) {
      const half = c.lane.width / 2;
      this.laneTarget = half + Math.random() * (1 - c.lane.width);
      this.lastWanderAt = now;
    }
    this.laneCenter += (this.laneTarget - this.laneCenter) * clamp01(dt * c.lane.driftSpeed * 6);

    // pay out line while holding; the rate slows as more of it extends
    if (this.holding) {
      const rate = c.payOutRateStart + (c.payOutRateEnd - c.payOutRateStart) * this.reach;
      this.reach = clamp01(this.reach + rate * dt);
      if (this.reach >= 1) this._present(now); // the line ran out — a forced, overshot cast
    }

    this._layout();
  }

  _present() {
    if (this.presented || this.completed) return;
    this.presented = true;
    const [laneStart, laneEnd] = this._laneBounds();

    if (this.reach < laneStart) {
      this._fail('Fell short — the fly never reached the lie.');
      return;
    }
    if (this.reach > laneEnd) {
      this._fail('Overshot — you lined the fish and spooked it.');
      return;
    }

    // presented in the lane: a fish is located. Quality is how centred it was and how
    // much presentation was left — a crisp, confident cast presents best.
    const centerDist = Math.abs(this.reach - this.laneCenter) / (this.config.lane.width / 2);
    const quality = (1 - centerDist) * 0.6 + this.presentation * 0.4;
    // two judgments, so the cast carries real weight in what the catch is worth
    const j = quality >= 0.75 ? 'perfect' : quality >= 0.4 ? 'good' : 'miss';
    this.judgments.push(j, j);
    this.water.setMarkerTint(0xedc46b);
    this._succeed('Presented in the lie — a fish rises to look.');
  }

  _succeed(message) {
    this.completed = true;
    this.failed = false;
    this._setStatus(message, COLOR.grass);
    this.scene.time.delayedCall(500, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _fail(message) {
    this.completed = true;
    this.failed = true;
    this.judgments = [];
    this.water.setMarkerTint(0xd0684f);
    this._setStatus(message, COLOR.danger);
    this.scene.time.delayedCall(800, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _setStatus(text, color) {
    this.statusText?.setText(text).setColor(color);
  }

  _layout() {
    const [laneStart, laneEnd] = this._laneBounds();
    this.water.setBand((laneStart + laneEnd) / 2, this.config.lane.width / 2);
    this.water.setMarker(this.reach);
    this.presBar.setValue(clamp01(this.presentation));
    this.presBar.tint(this.presentation > 0.35 ? null : 0xf2913a);
    this.lineText?.setText(`Line out ${Math.round(this.reach * 100)}%`);
  }

  _cleanup() {
    this.water?.destroy();
    this.presBar?.destroy();
    this.presLabel?.destroy();
    this.lineText?.destroy();
    this.statusText?.destroy();
  }
}
