// Gem Cutting: the wheel. Written here rather than imported — StarScape has no lapidary
// engine — and it speaks the same contract as every other activity, so src/activity.js
// needs one line for it.
//
//  - The rough stone is drawn fresh every time: a lumpy blob, no two alike, and always
//    big enough to hold the shape it is meant to become. That shape is laid over it in
//    gold, and the whole of the work is bringing one down onto the other.
//  - LEFT/RIGHT walks the nodes round the rim. SPACE cuts at the node you are on: a flat
//    facet, taken down to where the shape's own edge lies in that direction.
//  - A cut takes a run of nodes, not the one you picked, and how many is rolled — so is
//    where the run sits around your node. The facet is the plane across whatever the wheel
//    actually took, which is why a wide cut that straddles a corner of the shape takes the
//    corner with it. UP/DOWN is the bite: shallow takes less and slips less, deep clears a
//    face in one and may cost you the next one. That is the whole of the risk.
//  - Cuts are counted and there are never enough to be careful with all of them. Nothing
//    grows back: material cut away below the shape is gone, and the score says so.
//  - Scored at the end, face by face, on how near the stone sits to the shape it was
//    given. No hard fail — a badly cut stone is a badly cut stone.

import { COLOR, FONT, panel, inkOn } from './ui.js';
import { meterBar, popFeedback } from './meters.js';
import { COLORS } from '../../tuning.js';

const TAU = Math.PI * 2;

function mod(a, n) {
  return ((a % n) + n) % n;
}

// the shortest way round between two angles
function between(a, b) {
  return mod(a - b + Math.PI, TAU) - Math.PI;
}

// The shape's boundary in a given direction. A regular polygon is its apothem over the
// cosine of how far round its own face you are looking — flat in the middle of a face and
// furthest out at a corner.
function faceAt(theta, sides, rot, apothem) {
  const step = TAU / sides;
  return apothem / Math.cos(mod(theta - rot + step / 2, step) - step / 2);
}

function rollInt([lo, hi]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

export class GemEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false; // a stone cut badly is still a stone
    this.onComplete = null;
  }

  start(onComplete) {
    const c = this.config;
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.left = c.cuts;
    this.node = 0;
    this.deep = false;
    this.armed = true; // one cut to a press; a held key is not a run of them
    this.dirty = true;

    this.rot = Math.random() * TAU; // where the shape sits, and so where its faces are
    this._rough();
    this._score();

    const L = c.layout;
    const w = L.barW ?? 340;
    this.cx = L.x + w / 2;
    this.cy = L.top + 96 + c.radius;

    this.headText = this.scene.add.text(L.x, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.biteText = this.scene.add.text(L.x, L.top + 26, '', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });
    this.fitText = this.scene.add.text(L.x, L.top + 50, '', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });
    this.fitBar = meterBar(this.scene, L.x + 120, L.top + 58, w - 140, 10, 'bar_quality');
    this.plate = panel(this.scene, this.cx, this.cy, c.radius * 2 + 60, c.radius * 2 + 60, 'panel');
    this.g = this.scene.add.graphics();
    this.fbPos = { x: this.cx, y: this.cy + c.radius + 48 }; // clear of the plate's rail

    this._draw();
  }

  // The rough stone: a circle with a few slow waves taken out of it, so it is lumpy in a
  // way that is different every time and never so lumpy that the shape will not fit inside
  // it. The shape is then grown until it touches the tightest point, which is what makes
  // every stone a stone that can be cut properly and none of them one that can be cut
  // easily.
  _rough() {
    const c = this.config;
    const waves = [2, 3, 5].map((k, i) => ({
      k,
      amp: (c.rough / (i + 1.6)) * (0.6 + Math.random() * 0.8),
      phase: Math.random() * TAU,
    }));
    this.r = Array.from({ length: c.segments }, (_, i) => {
      const th = this._angleAt(i);
      let v = 1;
      for (const w of waves) v -= w.amp * (0.5 + 0.5 * Math.sin(w.k * th + w.phase));
      return Math.max(0.5, v);
    });
    // as big as the shape can be and still be inside the stone everywhere
    let apothem = Infinity;
    for (let i = 0; i < c.segments; i++) {
      const th = this._angleAt(i);
      const step = TAU / c.sides;
      const off = mod(th - this.rot + step / 2, step) - step / 2;
      apothem = Math.min(apothem, this.r[i] * Math.cos(off));
    }
    this.apothem = apothem * c.inset;
    this.t = Array.from({ length: c.segments }, (_, i) =>
      faceAt(this._angleAt(i), c.sides, this.rot, this.apothem));
  }

  _angleAt(i) {
    return this.rot + (i * TAU) / this.config.segments;
  }

  _nodeAngle(j) {
    return this.rot + (j * TAU) / this.config.nodes;
  }

  // --- the controls -----------------------------------------------------------

  setSide(dir) {
    if (this.completed) return;
    const n = this.config.nodes;
    if (dir === 'left') this.node = mod(this.node - 1, n);
    else if (dir === 'right') this.node = mod(this.node + 1, n);
    else if (dir === 'up') this.deep = true; // the greedy one
    else if (dir === 'down') this.deep = false;
    this.dirty = true;
  }

  chargeStart() {
    if (this.completed || !this.armed) return;
    this.armed = false;
    this._cut();
  }

  strike() {
    this.armed = true; // the key came up: the next press is a new cut
  }

  update() {
    if (this.completed || !this.dirty) return;
    this._draw();
  }

  // --- the cut ----------------------------------------------------------------

  _cut() {
    const c = this.config;
    const bite = this.deep ? c.deep : c.shallow;
    const span = rollInt(bite.nodes);
    // Where the wheel actually bit: a run of that many nodes covering the one you chose,
    // and which of them it starts on is not yours to say.
    const from = this.node - Math.floor(Math.random() * span);
    const phi = this._nodeAngle(from + (span - 1) / 2); // the facet's own direction
    // and how far past the line it goes, which is the price of leaning on the wheel
    const depth = faceAt(phi, c.sides, this.rot, this.apothem) - bite.over;

    const per = c.segments / c.nodes;
    let took = 0;
    let into = 0;
    for (let s = 0; s < span * per; s++) {
      const i = mod(Math.round(from * per) + s, c.segments);
      const chord = depth / Math.cos(between(this._angleAt(i), phi));
      if (chord <= 0 || chord >= this.r[i]) continue;
      const was = this.r[i];
      this.r[i] = chord;
      took += Math.max(0, was - Math.max(chord, this.t[i])); // excess, off
      into += Math.max(0, Math.min(was, this.t[i]) - chord); // below the shape, and gone
    }

    this.left -= 1;
    this._score();
    // What the wheel made of it, said where it happened. Only the stone at the end is
    // scored; this is so the player can see which cuts were the ones that cost them.
    const kind = into > c.cutGouge ? 'miss' : took > c.cutTook ? 'perfect' : 'good';
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, kind);
    this.dirty = true;
    if (this.left <= 0) this._finish();
  }

  // How near the stone is to the shape, as one number. Material still standing proud is
  // work not done; material taken from under the shape is work that cannot be undone, and
  // counts for more.
  _score() {
    const c = this.config;
    let err = 0;
    for (let i = 0; i < c.segments; i++) err += this._errAt(i);
    this.fit = Math.max(0, Math.min(1, 1 - err / c.segments / c.fitSpan));
    return this.fit;
  }

  _errAt(i) {
    const over = Math.max(0, this.r[i] - this.t[i]);
    const under = Math.max(0, this.t[i] - this.r[i]);
    return over + this.config.gougeWeight * under;
  }

  // The stone, read face by face: a facet sitting on the shape is a clean face, near it is
  // a rough one, and one still standing proud — or cut away under the line — is a face the
  // stone does not have. That list is what the bench is paid on.
  _finish() {
    const c = this.config;
    const per = c.segments / c.sides;
    for (let f = 0; f < c.sides; f++) {
      let err = 0;
      for (let s = 0; s < per; s++) err += this._errAt(mod(Math.round(f * per - per / 2) + s, c.segments));
      err /= per;
      this.judgments.push(err <= c.facePerfect ? 'perfect' : err <= c.faceGood ? 'good' : 'miss');
    }
    this.completed = true;
    this._draw();
    this.scene.time.delayedCall(c.settleMs, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  // --- drawing ----------------------------------------------------------------

  _points(radii) {
    const R = this.config.radius;
    return radii.map((v, i) => ({
      x: this.cx + Math.cos(this._angleAt(i)) * v * R,
      y: this.cy + Math.sin(this._angleAt(i)) * v * R,
    }));
  }

  _draw() {
    if (!this.g) return;
    const c = this.config;
    this.dirty = false;
    this.g.clear();

    // the stone as it stands
    const stone = this._points(this.r);
    this.g.fillStyle(inkOn(COLORS.ui.cool), 0.28);
    this.g.fillPoints(stone, true);
    this.g.lineStyle(2, inkOn(COLORS.ui.cool), 1);
    this.g.strokePoints(stone, true, true);
    // and the shape it is meant to be, over the top of it
    this.g.lineStyle(2, inkOn(COLORS.ui.gold), 1);
    this.g.strokePoints(this._points(this.t), true, true);

    // the nodes round the rim, and the plane the wheel would take at the one you are on
    if (!this.completed) {
      const phi = this._nodeAngle(this.node);
      const depth = faceAt(phi, c.sides, this.rot, this.apothem) * c.radius;
      const px = this.cx + Math.cos(phi) * depth;
      const py = this.cy + Math.sin(phi) * depth;
      const reach = c.radius * 0.9;
      this.g.lineStyle(1, inkOn(COLORS.ui.goldBright), 0.65);
      this.g.lineBetween(px - Math.sin(phi) * reach, py + Math.cos(phi) * reach,
        px + Math.sin(phi) * reach, py - Math.cos(phi) * reach);

      for (let j = 0; j < c.nodes; j++) {
        const a = this._nodeAngle(j);
        const at = c.radius * 1.12;
        const on = j === this.node;
        this.g.fillStyle(inkOn(on ? COLORS.ui.goldBright : COLORS.ui.muted), on ? 1 : 0.85);
        this.g.fillCircle(this.cx + Math.cos(a) * at, this.cy + Math.sin(a) * at, on ? 5 : 3);
      }
    }

    this.headText.setText(`Cuts  ${Math.max(0, this.left)} left`);
    const bite = this.deep ? this.config.deep : this.config.shallow;
    this.biteText.setText(`Bite  ${this.deep ? 'deep' : 'shallow'} — ${bite.nodes[0]} to ${bite.nodes[1]} nodes, ${this.deep ? 'and it takes a little of the stone' : 'and it barely touches it'}`);
    this.fitText.setText(`Fit  ${Math.round(this.fit * 100)}%`);
    this.fitBar.setValue(this.fit);
  }

  _cleanup() {
    [this.g, this.plate, this.headText, this.biteText, this.fitText].forEach((o) => o?.destroy());
    this.fitBar?.destroy();
    this.g = null;
  }
}
