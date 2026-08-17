// Alchemy: the pot. Written here rather than imported — StarScape has no brewing engine —
// but it speaks the same contract every other activity does, so src/activity.js needs one
// line for it and nothing else in the game has to know it is new.
//
//  - Every ingredient the recipe calls for goes in one at a time. As it goes in, a shape
//    swells and shrinks in the pot, and an outline is set somewhere in that swell.
//  - TAP SPACE to stop it. Dead on the outline is a clean measure, near it is a rough one,
//    and anything else is spoiled — as is a shape left swelling until the pot goes off the
//    boil, which is the only clock there is.
//  - The outline is rolled fresh for every shape, and so is how fast that shape breathes:
//    a quick one, then a slow one, and the hand that knows the quick one is not the hand
//    that knows the slow one. That is the whole of what makes a hard potion hard — more
//    shapes, quicker, less evenly, in a tighter outline. See `brew` in tuning.js.
//  - No hard fail. A botched brew is a weak draught and not a lost pot: nothing here is
//    balanced yet, and a potion nobody can finish is a potion nobody plays twice.

import { COLOR, FONT, panel } from './ui.js';
import { popFeedback } from './meters.js';
import { COLORS } from '../../tuning.js';

// How many sides the shape has, one per ingredient in the order they go in. A circle is
// nought sides. They cycle, so a recipe with more ingredients than shapes here still gets
// a different shape each time round.
const SIDES = [0, 3, 4, 6, 5, 8];

// the shape at a given size, as points for a stroked polygon; a circle is drawn on its own
function corners(cx, cy, r, sides) {
  return Array.from({ length: sides }, (_, i) => {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  });
}

export class BrewEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false; // brewing never hard-fails
    this.onComplete = null;
  }

  start(onComplete) {
    const c = this.config;
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.at = 0; // which shape is in the pot
    this.startedAt = null;
    this.resolving = false;
    this.armed = true; // one measure to a press: a key held down is not a run of them

    // Every shape rolled before the first one is drawn, so the run of them is one thing
    // the player is being handed rather than a series of surprises.
    this.shapes = Array.from({ length: c.shapes }, (_, i) => ({
      sides: SIDES[i % SIDES.length],
      period: roll(c.periodMs),
      target: c.target[0] + Math.random() * (c.target[1] - c.target[0]),
      label: (c.labels || [])[i % Math.max(1, (c.labels || []).length)] || '',
    }));

    const L = c.layout;
    const w = L.barW ?? 340;
    this.cx = L.x + w / 2;
    this.cy = L.top + 78 + c.radius.max; // clear of the two lines written above the pot

    this.headText = this.scene.add.text(L.x, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.intoText = this.scene.add.text(L.x, L.top + 26, '', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });
    this.plate = panel(this.scene, this.cx, this.cy, c.radius.max * 2 + 56, c.radius.max * 2 + 56, 'panel');
    this.g = this.scene.add.graphics();
    this.fbPos = { x: this.cx, y: this.cy + c.radius.max + 22 };

    this._draw();
  }

  // SPACE — stop it where it stands. One press to a shape; the second is the next
  // ingredient's, and it does not come until this one has been read.
  chargeStart() {
    if (this.completed || this.resolving || !this.armed || this.startedAt === null) return;
    this.armed = false;
    this._resolve(this._pulse());
  }

  // the key came up, so the next press is a new measure. The arrows are nothing to a pot;
  // the contract asks for them, so it is here and does nothing
  strike() {
    this.armed = true;
  }

  setSide() {}

  update(now) {
    if (this.completed) return;
    if (this.startedAt === null) this.startedAt = now;
    this.now = now;
    // Left to swell too long and the measure is spoiled: the pot is the clock, and it is
    // the only one. Nothing is lost by it beyond the ingredient itself.
    if (!this.resolving && this._turns() >= this.config.cycles) this._resolve(null);
    this._draw();
  }

  // where the shape is in its swell, 0 at its smallest and 1 at its fullest. A cosine
  // rather than a ramp, so it hangs at the top and the bottom and moves quickest across
  // the middle — where the outline sits is half of how hard a shape is.
  _pulse() {
    return 0.5 - 0.5 * Math.cos(2 * Math.PI * this._turns());
  }

  _turns() {
    if (this.startedAt === null) return 0;
    return ((this.now || this.startedAt) - this.startedAt) / this.shapes[this.at].period;
  }

  _shape() {
    return this.shapes[this.at];
  }

  _radius(pulse) {
    const r = this.config.radius;
    return r.min + (r.max - r.min) * pulse;
  }

  // A stopped shape, judged on how near the outline it was stopped. Null is a shape never
  // stopped at all, which is the same answer said a different way.
  _resolve(pulse) {
    const c = this.config;
    const off = pulse === null ? Infinity : Math.abs(pulse - this._shape().target);
    const judgment = off <= c.perfTol ? 'perfect' : off <= c.goodTol ? 'good' : 'miss';
    this.judgments.push(judgment);
    this.stopped = pulse; // held so the shape stays where it was stopped while it is read
    this.resolving = true;
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, judgment);

    this.scene.time.delayedCall(c.settleMs, () => {
      if (this.completed) return;
      this.at += 1;
      this.stopped = null;
      this.resolving = false;
      this.startedAt = this.now;
      if (this.at >= this.shapes.length) this._succeed();
      else this._draw();
    });
  }

  _succeed() {
    this.completed = true;
    this.scene.time.delayedCall(300, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _draw() {
    if (this.completed || !this.g) return;
    const c = this.config;
    const s = this._shape();
    const pulse = this.stopped !== null && this.stopped !== undefined ? this.stopped : this._pulse();
    const off = Math.abs(pulse - s.target);
    const held = off <= c.goodTol;

    this.g.clear();
    // The outline, and the slack around it: the two faint edges are how far off the
    // outline still counts for something, which is a thing the player should be able to
    // see rather than learn.
    this._trace(this._radius(s.target + c.goodTol), s.sides, COLORS.ui.rule, 1, 0.7);
    this._trace(this._radius(Math.max(0, s.target - c.goodTol)), s.sides, COLORS.ui.rule, 1, 0.7);
    this._trace(this._radius(s.target), s.sides, COLORS.ui.gold, 2, 1);
    // and what is swelling inside it
    this._trace(this._radius(pulse), s.sides,
      held ? COLORS.ui.grass : COLORS.ui.cool, 3, 1);

    this.headText.setText(`Shapes  ${this.at + 1} / ${this.shapes.length}`);
    this.intoText.setText(s.label ? `Into the pot: ${s.label}` : 'Into the pot');
  }

  _trace(r, sides, colour, width, alpha) {
    this.g.lineStyle(width, colour, alpha);
    if (!sides) {
      this.g.strokeCircle(this.cx, this.cy, r);
      return;
    }
    this.g.strokePoints(corners(this.cx, this.cy, r, sides), true, true);
  }

  _cleanup() {
    [this.g, this.plate, this.headText, this.intoText].forEach((o) => o?.destroy());
    this.g = null;
  }
}

function roll([lo, hi]) {
  return lo + Math.random() * (hi - lo);
}
