// The Prospect minigame, imported from StarScape. The read that opens a seam, and the
// odd one out of the digging verbs — a precision TAP, not a charge-swing:
//
//  - A needle sweeps the face. TAP SPACE to take a sounding while it is over the
//    resonance band: dead centre is a clear reading, the edges a faint one, off the band
//    a wasted tap.
//  - After each sounding the band JUMPS somewhere new and the needle QUICKENS, so every
//    reading is a fresh and tighter catch.
//  - CLARITY is the clock. The echo fades constantly and only a taken sounding refreshes
//    it; let it run out before the soundings are done and the rest read faint. No hard
//    fail — a neglected read banks a poor seam and the digging goes on.
//
// Changed on import: the text colours are the kit's tokens rather than StarScape's
// parchment hexes, its config comes from TUNING.quarry.prospect in tuning.js, and the v1
// document citations are stripped. The mechanic is untouched.

import { COLOR, FONT, JUDGE } from './ui.js';
import { trackWidget, meterBar, popFeedback } from './meters.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export class ProspectEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config; // { sampleCount, needleSpeed, bandWidth, clarityDrainPerSec, clarityPerSample, needleAccelPerSample, layout }
    this.judgments = [];
    this.completed = false;
    this.failed = false; // Prospect never hard-fails
    this.onComplete = null;
    this.startTime = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.clarity = 1;
    this.needlePos = 0;
    this.needleDir = 1;
    this.speed = this.config.needleSpeed;
    this.bandHalf = this.config.bandWidth / 2;
    this.bandCenter = this._newBand();
    this.startTime = null;

    const c = this.config;
    const L = c.layout;
    this.BW = L.barW ?? 340; // fills the plate when the hybrid supplies a width
    const bx = L.x;
    const inner = this.BW - 4;

    this.headText = this.scene.add.text(bx, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });

    // Seismograph: the sweeping needle over a relocating resonance band.
    this.scopeText = this.scene.add.text(bx, L.top + 30, 'Sounding — tap SPACE when the needle is on the band', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });
    this.scopeTrack = trackWidget(this.scene, bx, L.top + 64, this.BW, { height: 28 });
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 100 };

    // Clarity (the fading-read clock).
    this.clarityText = this.scene.add.text(bx, L.top + 128, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.grass });
    this.clarityBar = meterBar(this.scene, bx, L.top + 158, this.BW, 12, 'bar_stamina');

    this._layout();
  }

  _newBand() {
    return this.bandHalf + Math.random() * (1 - 2 * this.bandHalf);
  }

  // SPACE — take a sounding.
  sample() {
    if (this.completed || this.startTime === null) return;
    const dist = Math.abs(this.needlePos - this.bandCenter);
    let judgment, word, color;
    if (dist <= this.bandHalf * 0.45) {
      judgment = 'perfect';
      word = 'CLEAR READ!';
      color = JUDGE.perfect;
    } else if (dist <= this.bandHalf) {
      judgment = 'good';
      word = 'sounding';
      color = JUDGE.good;
    } else {
      judgment = 'miss';
      word = 'FAINT';
      color = JUDGE.glance;
    }
    this.judgments.push(judgment);
    this._popFeedback(word, color);

    // A taken sounding refreshes the echo; the band relocates and the read quickens.
    this.clarity = clamp01(this.clarity + this.config.clarityPerSample);
    this.bandCenter = this._newBand();
    this.speed *= this.config.needleAccelPerSample;

    if (this.judgments.length >= this.config.sampleCount) this._succeed();
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastAt = now;
    }
    const dt = Math.min(0.1, (now - this.lastAt) / 1000);
    this.lastAt = now;

    this.needlePos += this.needleDir * this.speed * dt;
    if (this.needlePos >= 1) { this.needlePos = 1; this.needleDir = -1; }
    else if (this.needlePos <= 0) { this.needlePos = 0; this.needleDir = 1; }

    this.clarity = clamp01(this.clarity - this.config.clarityDrainPerSec * dt);
    if (this.clarity <= 0 && !this.completed) return this._runOut();

    this._layout();
  }

  _runOut() {
    // The echo faded before the read was finished — remaining soundings are lost
    // (counted as faint), so a neglected read banks a poor seam.
    while (this.judgments.length < this.config.sampleCount) this.judgments.push('miss');
    this._succeed(true);
  }

  _succeed(fadedOut = false) {
    this.completed = true;
    this._popFeedback(fadedOut ? 'ECHO LOST' : 'READ DONE', fadedOut ? JUDGE.danger : JUDGE.held);
    this.scene.time.delayedCall(400, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _popFeedback(word) {
    if (!this.fbPos) return;
    const kind = /CLEAR/.test(word) ? 'perfect' : /DONE/.test(word) ? 'clean' : /sounding/.test(word) ? 'good' : 'miss';
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, kind);
  }

  _layout() {
    const onBand = Math.abs(this.needlePos - this.bandCenter) <= this.bandHalf;
    this.scopeTrack.setBand(this.bandCenter, this.bandHalf).setBandTint(JUDGE.held)
      .setMarker(this.needlePos).setMarkerTint(onBand ? JUDGE.held : null);

    this.headText.setText(`Soundings  ${this.judgments.length} / ${this.config.sampleCount}`);

    this.clarityBar.setValue(this.clarity);
    this.clarityBar.tint(this.clarity <= 0.25 ? JUDGE.danger : this.clarity <= 0.5 ? JUDGE.near : null);
    this.clarityText.setText('Clarity  (fades — keep taking soundings)');
    this.clarityText.setColor(this.clarity <= 0.25 ? COLOR.warn : COLOR.grass);
  }

  _cleanup() {
    [this.headText, this.scopeText, this.clarityText].forEach((g) => g?.destroy());
    [this.scopeTrack, this.clarityBar].forEach((w) => w?.destroy());
  }
}
