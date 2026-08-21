// The Prep minigame, imported from StarScape. The cutting board: quick cuts, highly
// synchronised.
//
//  - A blade sweeps at a steady TEMPO and crosses the cut line at the centre on every
//    beat. TAP SPACE as it crosses — dead on is a clean cut, a little off is ragged, and
//    way off (or a missed beat) is a botched one.
//  - FLOW is the reward for keeping time: every clean on-beat cut extends it, and one
//    mistimed cut breaks it.
//  - The tempo is steady and telegraphed on purpose. No hard fail — a sloppy prep just
//    makes a rougher meal.
//
// Changed on import: the text colours are the kit's tokens, its config comes from
// TUNING.meal.prep in tuning.js, and the board is dropped ten pixels because this game is
// set in a taller face and the line above it was running into the board's own top rail.
// The mechanic is untouched.

import { COLOR, FONT, JUDGE, panel } from './ui.js';
import { popFeedback } from './meters.js';

export class PrepEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false; // Prep never hard-fails
    this.onComplete = null;
    this.startTime = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.flow = 0;
    this.maxFlow = 0;
    this.misses = 0;
    this.beat = 0; // beats (cuts) resolved so far
    this.pos = 0;
    this.dir = 1;
    this.bestOffset = Infinity; // closest a tap has come to the line since the last beat
    this.startTime = null;

    const c = this.config;
    // Marker sweeps the board so a centre-crossing lands every beatIntervalMs.
    this.speed = 1000 / c.beatIntervalMs; // board-widths per second
    this.prevRel = this.pos - 0.5;

    const L = c.layout;
    this.BW = L.barW ?? 340; // fills the plate when the hybrid supplies a width
    const bx = L.x;
    const inner = this.BW - 4;

    this.headText = this.scene.add.text(bx, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });

    this.boardText = this.scene.add.text(bx, L.top + 30, 'Tap SPACE as the blade crosses the line — stay on the beat', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });
    this.boardBack = panel(this.scene, bx + this.BW / 2, L.top + 78, this.BW, 48, 'track');
    // The cut line at centre, with the on-beat tolerance band around it.
    this.goodBand = this.scene.add.rectangle(bx + 2 + inner * 0.5, L.top + 78, inner * c.goodTol * 2, 40, JUDGE.held, 0.25).setOrigin(0.5);
    this.cutLine = this.scene.add.rectangle(bx + 2 + inner * 0.5, L.top + 78, 3, 44, JUDGE.edge, 0.8).setOrigin(0.5);
    this.blade = this.scene.add.rectangle(bx + 2, L.top + 78, 5, 52, JUDGE.good).setOrigin(0.5);
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 118 };

    this.flowText = this.scene.add.text(bx, L.top + 148, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.grass });

    this._layout();
  }

  // SPACE — attempt a cut; keep the closest tap to the line for this beat.
  cut() {
    if (this.completed || this.startTime === null) return;
    const offset = Math.abs(this.pos - 0.5);
    if (offset < this.bestOffset) this.bestOffset = offset;
    // A crisp visual on the tap itself.
    this.blade.setScale(1, 1.15);
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastAt = now;
    }
    const dt = Math.min(0.1, (now - this.lastAt) / 1000);
    this.lastAt = now;

    this.pos += this.dir * this.speed * dt;
    if (this.pos >= 1) { this.pos = 1; this.dir = -1; }
    else if (this.pos <= 0) { this.pos = 0; this.dir = 1; }

    // A centre crossing IS the beat — resolve the cut against the best tap.
    const rel = this.pos - 0.5;
    if (this.prevRel <= 0 && rel > 0 || this.prevRel >= 0 && rel < 0) this._resolveBeat();
    this.prevRel = rel;

    this._layout();
  }

  _resolveBeat() {
    const c = this.config;
    const off = this.bestOffset;
    let judgment, word, color;
    if (off <= c.perfTol) {
      judgment = 'perfect';
      word = 'CLEAN!';
      color = JUDGE.perfect;
      this.flow++;
    } else if (off <= c.goodTol) {
      judgment = 'good';
      word = 'cut';
      color = JUDGE.good;
      this.flow++;
    } else {
      judgment = 'miss';
      word = off === Infinity ? 'MISSED' : 'RAGGED';
      color = JUDGE.wild;
      this.flow = 0;
      this.misses++;
    }
    this.judgments.push(judgment);
    this.maxFlow = Math.max(this.maxFlow, this.flow);
    this.bestOffset = Infinity;
    this._popFeedback(word, color);
    this._flashLine(color);

    this.beat++;
    if (this.beat >= c.cutCount) this._succeed();
  }

  _succeed() {
    this.completed = true;
    this.scene.time.delayedCall(400, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _popFeedback(word) {
    if (!this.fbPos) return;
    const kind = /CLEAN/.test(word) ? 'perfect' : /cut/.test(word) ? 'good' : 'miss';
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, kind);
  }

  _flashLine(color) {
    if (!this.cutLine) return;
    this.cutLine.setFillStyle(color, 1);
    this.scene.tweens.add({ targets: this.cutLine, alpha: 0.8, duration: 180, onComplete: () => this.cutLine?.setFillStyle(JUDGE.edge, 0.8) });
  }

  _layout() {
    const L = this.config.layout;
    const bx = L.x;
    const inner = this.BW - 4;

    this.blade.x = bx + 2 + inner * this.pos;
    const onBeat = Math.abs(this.pos - 0.5) <= this.config.goodTol;
    this.blade.setFillStyle(onBeat ? JUDGE.held : JUDGE.good);
    this.blade.scaleY += (1 - this.blade.scaleY) * 0.2; // settle the tap pop

    this.headText.setText(`Cuts  ${Math.min(this.beat, this.config.cutCount)} / ${this.config.cutCount}`);
    this.flowText.setText(this.flow > 1 ? `Flow  x${this.flow}` : 'Flow  —');
    this.flowText.setColor(this.flow >= 4 ? COLOR.gold : this.flow >= 2 ? COLOR.grass : COLOR.muted);
  }

  _cleanup() {
    [this.headText, this.boardText, this.boardBack, this.goodBand, this.cutLine, this.blade, this.flowText].forEach((g) => g?.destroy());
  }
}
