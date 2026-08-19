// A fire under an activity. Wraps any engine and puts it on a clock: what was laid on the
// fire burns down while the work is done, and work still going when it burns through is
// work lost. The bar across the top is that clock, and the engine underneath it never has
// to know it is there — every input and every judgment passes straight through.
//
// One wrapper rather than a bar written into each engine, because the fire is the same
// fire at all three benches and a rule kept in one place stays one rule. An engine that
// spends fuel of its own — the crucible's bellows — is handed `fire` in its config and
// takes seconds off the clock with it.

import { COLOR, FONT } from './ui.js';
import { meterBar } from './meters.js';
import { TUNING } from '../../tuning.js';

export const FUEL_HEAD = 52; // the room the bar takes above whatever the engine draws

export class Fired {
  // `seconds` is how long what was laid on lasts; `make(layout, fire)` builds the engine
  // against the layout left under the bar.
  constructor(scene, layout, seconds, make) {
    this.scene = scene;
    this.layout = layout;
    this.seconds = seconds;
    this.left = seconds;
    this.out = false;
    this.done = false;
    this.engine = make({ ...layout, top: layout.top + FUEL_HEAD }, {
      take: (sec) => { this.left = Math.max(0, this.left - sec); },
    });
  }

  start(onComplete) {
    this.onComplete = onComplete;
    const L = this.layout;
    this.text = this.scene.add.text(L.x, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.bar = meterBar(this.scene, L.x, L.top + 30, L.barW ?? 340, 14, 'bar_hp');
    this._draw();
    // The engine finishing first is the ordinary way out; a fire that has already gone out
    // has finished it for them, so anything arriving after that is dropped.
    this.engine.start((judgments) => this._end(judgments));
  }

  update(now) {
    if (this.out || this.done) return;
    if (this.last === undefined) this.last = now;
    this.left = Math.max(0, this.left - Math.min(0.1, (now - this.last) / 1000));
    this.last = now;
    this.engine.update(now);
    this._draw();
    // Work that is already finished is finished: a pot poured with two seconds left is not
    // taken back off the player while the engine settles.
    if (this.left <= 0 && !this.engine.completed) this._burnThrough();
  }

  // The fire goes out and takes the work with it. The engine is stopped where it stands
  // and whatever it had already judged is handed back, because a job three quarters done
  // is not a job never started — `failed` is what says the rest of it was lost.
  _burnThrough() {
    this.out = true;
    this.engine.stop?.(); // stopped first, so what it had judged is settled before it is read
    const judgments = [...(this.engine.judgments || [])];
    this.bar.setValue(0);
    this.text.setText('The fire is out, and the work with it.').setColor(COLOR.danger);
    this.scene.time.delayedCall(TUNING.fuel.outMs, () => this._end(judgments));
  }

  _end(judgments) {
    if (this.done) return;
    this.done = true;
    this.text?.destroy();
    this.bar?.destroy();
    this.text = null;
    this.bar = null;
    this.onComplete?.(judgments);
  }

  _draw() {
    if (!this.bar) return;
    const pct = this.seconds ? this.left / this.seconds : 0;
    const low = pct <= TUNING.fuel.warnAt;
    this.bar.setValue(pct);
    this.text.setText(`Fire  ${Math.ceil(this.left)}s${low ? '  — it is going' : ''}`)
      .setColor(low ? COLOR.danger : COLOR.text);
  }

  // --- everything else is the engine's ---------------------------------------

  chargeStart() { if (!this.out) this.engine.chargeStart?.(); }

  strike() { if (!this.out) this.engine.strike?.(); }

  setSide(dir) { if (!this.out) this.engine.setSide?.(dir); }

  get judgments() { return this.engine.judgments; }

  get completed() { return this.done; }

  // A fire that burned through is a botched job whatever the engine made of it.
  get failed() { return this.out || !!this.engine.failed; }
}
