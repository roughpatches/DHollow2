// The Hook-set minigame, imported from StarScape. The second gate of a catch, and a
// wait-then-react pattern rather than a timing one: you watch the float and set the hook
// the instant the fish commits — but not before.
//
//  - The fish may REFUSE first: brief nibbles that look like a take and are not. Strike
//    one and you pull the fly out of its mouth.
//  - The real TAKE is a strong, sustained pull with a tight window. Set the hook inside
//    it and the fish is on; strike at nothing, strike a nibble, or miss the window and
//    it is gone (`failed = true`, the catch ends).
//
// Changed on import: the painted bobber and its animations are the kit's track and
// marker from src/uiatlas.js — the float sits on the line and dips when something pulls
// it — the colours are the kit's tokens, and the reactive water layer it signalled is
// not here. The waiting, the feints and both windows are untouched.

import { COLOR } from './ui.js';
import { trackWidget, popFeedback } from './meters.js';

export class HookSetEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.onComplete = null;
    this.startTime = null;
    this.state = 'calm';
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.state = 'calm';
    this.remainingFeints = this.config.refusals ?? 0;
    // seeded on the first update(): scene.time.now is 0 while a scene is still building
    this.startTime = null;

    const L = this.config.layout;
    this.BW = L.barW ?? 320;
    const bx = L.x;
    this.statusText = this.scene.add.text(bx, L.top,
      'Watch the float — set the hook (SPACE) on the real take, not a nibble',
      { fontSize: '16px', fontFamily: 'monospace', color: COLOR.muted });
    this.readText = this.scene.add.text(bx, L.top + 92, 'The water is quiet.',
      { fontSize: '18px', fontFamily: 'monospace', color: COLOR.text });
    // the line, with the float riding it. Nothing to aim at: the float only moves when
    // something below it moves.
    this.line = trackWidget(this.scene, bx, L.top + 140, this.BW, { height: 22, band: false });
    this.line.setMarker(0.5);
    this.restY = this.line.marker.y;
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 176 };
  }

  // the float is pulled under by however much is pulling it, and let back up after
  _dip(depth, tint) {
    this.line.marker.y = this.restY + depth;
    this.line.setMarkerTint(tint);
  }

  _rest() {
    this.line.marker.y = this.restY;
    this.line.setMarkerTint(null);
  }

  _scheduleNextEvent(now) {
    const [min, max] = this.config.calmMsRange;
    this.nextEventAt = now + min + Math.random() * (max - min);
    this.state = 'calm';
    this._rest();
    this._say('The water is quiet.', COLOR.text);
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this._scheduleNextEvent(now);
      return;
    }

    if (this.state === 'calm' && now >= this.nextEventAt) {
      if (this.remainingFeints > 0) {
        this.remainingFeints -= 1;
        this.state = 'feint';
        this.feintEndAt = now + this.config.feintMs;
        this._dip(5, 0xedc46b); // a nibble: a small, brief pull, and tempting
        this._say('…a nibble. Hold — is it committed?', COLOR.gold);
      } else {
        this.state = 'take';
        this.takeStartAt = now;
        this.takeWindowEnd = now + this.config.window.good;
        this._dip(14, 0xd0684f); // the float goes under and stays under
        this._say('TAKE! Set the hook — SPACE', COLOR.goldBright);
      }
    } else if (this.state === 'feint' && now >= this.feintEndAt) {
      this._scheduleNextEvent(now);
    } else if (this.state === 'take' && now >= this.takeWindowEnd) {
      this._fail('Too slow — the fish spat the fly and was gone.');
    }
  }

  // the player setting the hook
  set(now) {
    if (this.completed || this.startTime === null) return;
    if (this.state === 'calm') {
      this._fail('Struck at nothing — you spooked the fish.');
      return;
    }
    if (this.state === 'feint') {
      this._fail('Struck a nibble — you pulled the fly from its mouth.');
      return;
    }

    // inside the take window: earlier is cleaner
    const delta = now - this.takeStartAt;
    const { perfect, good } = this.config.window;
    if (delta <= perfect) this.judgments.push('perfect', 'perfect');
    else if (delta <= good) this.judgments.push('good', 'good');
    else {
      this._fail('Too slow — the fish spat the fly and was gone.');
      return;
    }
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, delta <= perfect ? 'perfect' : 'good');
    this._succeed('Hooked! The line goes tight.');
  }

  _succeed(message) {
    this.completed = true;
    this.failed = false;
    this._dip(10, 0xedc46b);
    this._setStatus(message, COLOR.grass);
    this.scene.time.delayedCall(450, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _fail(message) {
    this.completed = true;
    this.failed = true;
    this.judgments = [];
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, 'miss');
    this._rest();
    this._setStatus(message, COLOR.danger);
    this.scene.time.delayedCall(750, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _say(text, color) {
    this.readText?.setText(text).setColor(color);
  }

  _setStatus(text, color) {
    this.statusText?.setText(text).setColor(color);
  }

  _cleanup() {
    this.line?.destroy();
    this.readText?.destroy();
    this.statusText?.destroy();
  }
}
