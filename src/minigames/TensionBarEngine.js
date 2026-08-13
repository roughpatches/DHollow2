// The tension-bar minigame, imported from StarScape. Continuous hold-against-gravity:
// keep an indicator inside a slowly drifting band while the line is under strain. Unlike
// a swing (press anytime) or a take (wait then react), this is continuous control sampled
// at a fixed interval — but each sample still resolves to perfect / good / miss, so it
// pays out through the same arithmetic as everything else.
//
// `lineIntegrity` is opt-in: with it, every miss chips the buffer and emptying it snaps
// the line (`failed = true`). Leave it out of the config and the engine never fails,
// which is what a phase that is only scored wants.
//
// Generic on purpose — it is the reel here, and it is whatever else needs a hold against
// a drifting band later.
//
// Changed on import: the painted rod-and-line gauge is the kit's track, band and marker
// from src/uiatlas.js and runs across rather than up — the same 0..1 held against the
// same drift — the integrity pips are one of the kit's bars, and the reactive water layer
// it signalled is not here. The physics and the sampling are untouched.

import { COLOR } from './ui.js';
import { trackWidget, meterBar, resolveBarKind } from './meters.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export class TensionBarEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.onComplete = null;
    this.startTime = null;
    this.holding = false;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.holding = false;

    // Time fields are seeded on the first update(): scene.time.now is 0 while a scene is
    // still building, which would fire every tick at once on the first live frame.
    this.startTime = null;
    this.totalTicks = Math.round(this.config.durationMs / this.config.tickIntervalMs);

    this.indicatorPos = 0.5;
    this.indicatorVelocity = 0;
    this.zoneCenter = 0.5;
    this.zoneTarget = this._randomZoneCenter();

    const L = this.config.layout;
    this.BW = L.barW ?? 320;
    const bx = L.x;
    this.statusText = this.scene.add.text(bx, L.top,
      'Hold SPACE to keep the line in the band — too many slips and it snaps',
      { fontSize: '16px', fontFamily: 'monospace', color: COLOR.muted });
    this.lineLabel = this.scene.add.text(bx, L.top + 34, 'line',
      { fontSize: '15px', fontFamily: 'monospace', color: COLOR.text });

    this.failed = false;
    if (this.config.lineIntegrity != null) {
      this.integrity = this.config.lineIntegrity;
      this.integrityBar = meterBar(this.scene, bx, L.top + 64, this.BW, 14,
        resolveBarKind(this.scene, 'bar_integrity', 'bar_hp'));
    }

    this.tensionText = this.scene.add.text(bx, L.top + 92, '',
      { fontSize: '18px', fontFamily: 'monospace', color: COLOR.text });
    this.bar = trackWidget(this.scene, bx, L.top + 140, this.BW, { height: 22 });

    this._drawIntegrity();
    this._layout();
  }

  _drawIntegrity() {
    if (!this.integrityBar) return;
    const left = this.integrity / this.config.lineIntegrity;
    this.integrityBar.setValue(left);
    this.integrityBar.tint(this.integrity > 1 ? null : 0xf2913a);
  }

  _randomZoneCenter() {
    const half = this.config.zoneWidth / 2;
    return half + Math.random() * (1 - this.config.zoneWidth);
  }

  setHolding(isHolding) {
    this.holding = isHolding;
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastUpdateAt = now;
      this.nextTickAt = now + this.config.tickIntervalMs;
      this.nextZoneWanderAt = now + this.config.zoneWanderIntervalMs;
    }

    const dt = (now - this.lastUpdateAt) / 1000;
    this.lastUpdateAt = now;

    if (now >= this.nextZoneWanderAt) {
      this.zoneTarget = this._randomZoneCenter();
      this.nextZoneWanderAt = now + this.config.zoneWanderIntervalMs;
    }
    const zoneLerp = clamp(dt * this.config.zoneDriftSpeed, 0, 1);
    this.zoneCenter += (this.zoneTarget - this.zoneCenter) * zoneLerp;

    // holding hauls the line one way; left alone it falls back the other
    const accel = this.holding ? this.config.indicatorAccel : -this.config.gravity;
    this.indicatorVelocity = clamp(this.indicatorVelocity + accel * dt,
      -this.config.maxVelocity, this.config.maxVelocity);
    this.indicatorPos += this.indicatorVelocity * dt;
    if (this.indicatorPos <= 0) {
      this.indicatorPos = 0;
      this.indicatorVelocity = 0;
    } else if (this.indicatorPos >= 1) {
      this.indicatorPos = 1;
      this.indicatorVelocity = 0;
    }

    this._layout();

    while (now >= this.nextTickAt && !this.completed) {
      this._sampleTick();
      this.nextTickAt += this.config.tickIntervalMs;
    }
  }

  _sampleTick() {
    const half = this.config.zoneWidth / 2;
    const distance = Math.abs(this.indicatorPos - this.zoneCenter);

    let judgment;
    if (distance > half) judgment = 'miss';
    else if (distance <= half * 0.4) judgment = 'perfect';
    else judgment = 'good';
    this.judgments.push(judgment);

    // line integrity: a slip chips the buffer, and emptying it snaps the line
    if (this.integrity != null && judgment === 'miss') {
      this.integrity -= 1;
      this._drawIntegrity();
      if (this.integrity <= 0) {
        this.completed = true;
        this.failed = true;
        this.statusText?.setText('The line snapped. It is gone.').setColor(COLOR.danger);
        this.onComplete?.(this.judgments);
        this._cleanup();
        return;
      }
    }

    if (this.judgments.length >= this.totalTicks) {
      this.completed = true;
      this.onComplete?.(this.judgments);
      this._cleanup();
    }
  }

  _layout() {
    this.bar.setBand(this.zoneCenter, this.config.zoneWidth / 2);
    this.bar.setMarker(this.indicatorPos);
    const half = this.config.zoneWidth / 2;
    const inBand = Math.abs(this.indicatorPos - this.zoneCenter) <= half;
    this.bar.setMarkerTint(inBand ? null : 0xf2913a);
    this.tensionText?.setText(inBand ? 'The rod is bent and holding.' : 'The line is running away from you.');
    this.tensionText?.setColor(inBand ? COLOR.text : COLOR.warn);
  }

  _cleanup() {
    this.bar?.destroy();
    this.integrityBar?.destroy();
    this.lineLabel?.destroy();
    this.tensionText?.destroy();
    this.statusText?.destroy();
  }
}
