// The crucible, imported from StarScape. Slow and watchful where every other engine here
// is quick: nothing is aimed at and nothing is timed to a beat. There is a fire, a charge
// sitting in it, and a decision about when what is in the pot is as good as it is going to
// get.
//
//  - PUMP (SPACE) works the bellows. Heat is what melts the charge, and the band in the
//    middle of the gauge is where it melts cleanest: above it the pool oxidises and the
//    purity goes down while you watch.
//  - THE FIRE is the clock, and it is the only one. It is not the crucible's own any more:
//    it is the bench's, laid with what the recipe's `fuel` was worth out of the pack and
//    drawn across the top of the screen by src/minigames/Fired.js, the same as at the
//    kitchen and the still. A pump costs a little on top of the burning. Run dry with
//    metal still in the pot and the whole charge is lost.
//  - MOLTEN is how much of the charge has run. Half of it is the least that can be poured,
//    and pouring at the least is a poor bar rather than no bar.
//  - SKIM (UP) lifts the oldest clump of dross off the surface. Fresh, it comes away clean
//    and the purity goes up; left until it sets, it comes away dirty — half the purity and
//    twice the heat. There are only so many skims in a charge.
//  - Let the surface fill and the next clump to surface sinks the oldest into the metal,
//    which is a purity loss nothing takes back.
//  - POUR (DOWN) ends it.
//
// Changed on import: the event bus and its scene are gone — this draws its own readouts
// with the kit, the way every other engine here does — the config comes from TUNING.smelt
// in tuning.js, and the charge's mass and the double pour it bought went with it, because
// a recipe at a bench makes what it says it makes. What is left of overheating is the
// oxide, which is enough for the fire to be worth watching. The judgments are new: the
// game reads work as perfect / good / miss, so a clean skim is a perfect one, a set skim a
// good one, a clump sunk a miss, and the pour itself is worth several of them — see
// `pourWeight` in tuning.js. Changed since: the fuel reserve it carried is the bench's
// fire now, so a pump is charged to that and the bar it used to draw is drawn once, above
// every fired activity, rather than three times over.

import { COLOR, FONT } from './ui.js';
import { meterBar, heatGauge, popFeedback } from './meters.js';
import { COLORS, hex } from '../../tuning.js';
import { HeatCore } from './HeatCore.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// How fast the charge runs in each zone. Cold does nothing; the band is the honest one.
// Hotter melts quicker, which is the whole of the temptation — and it is exactly where the
// pool is being spoiled.
const HEAT_FACTOR = { cold: 0, cool: 0.45, sweet: 1, warm: 1.15, scorch: 1.25 };

const ZONE = {
  cold: { say: 'Cold. Nothing is running.', colour: COLORS.ui.cool },
  cool: { say: 'Coming up.', colour: COLORS.ui.cool },
  sweet: { say: 'At heat.', colour: COLORS.ui.grass },
  warm: { say: 'Hot — it is oxidising.', colour: COLORS.ui.warn },
  scorch: { say: 'Scorching. You are burning the pot.', colour: COLORS.ui.danger },
};

export class SmeltEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false; // nothing the crucible does loses a charge; the fire going out does
    this.onComplete = null;
  }

  start(onComplete) {
    const c = this.config;
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;

    this.heat = new HeatCore(c);
    this.molten = 0;
    this.purity = c.purity0;
    this.skims = c.baseSkims;
    this.dross = []; // [{ spawnedAt, slot }], oldest first
    this.nextDrossAt = null; // not seeded until the charge starts to run
    this.armed = true; // one pump to a press: a key held down is not a bellows
    this.startTime = null; // seeded on the first update

    const L = c.layout;
    const bx = L.x;
    this.BW = L.barW ?? 340;
    const row = (dy, str, colour = COLOR.text, size = '18px') => this.scene.add.text(
      bx, L.top + dy, str, { fontSize: size, fontFamily: FONT, color: colour },
    );

    this.moltenText = row(0, '');
    this.moltenBar = meterBar(this.scene, bx, L.top + 30, this.BW, 14, 'bar_integrity');
    this.purityText = row(52, '');
    this.purityBar = meterBar(this.scene, bx, L.top + 82, this.BW, 14, 'bar_quality');

    this.heatText = row(108, '', COLOR.muted, '16px');
    this.heatGauge = heatGauge(this.scene, bx, L.top + 140, this.BW, { height: 18 });
    // The band, drawn over the gauge where it actually is: which stretch of the gradient
    // the work wants is not a thing to be learnt by losing charges.
    const band = this.scene.add.rectangle(
      bx + this.BW * c.sweetBand.low, L.top + 140,
      this.BW * (c.sweetBand.high - c.sweetBand.low), 18, COLORS.ui.grass, 0.5,
    ).setOrigin(0, 0.5).setStrokeStyle(1, COLORS.ui.goldBright, 0.9);
    this.heatGauge.marker.setDepth(band.depth + 1);
    this.band = band;

    this.surfaceText = row(170, '', COLOR.muted, '16px');
    this.g = this.scene.add.graphics();
    this.surfaceY = L.top + 204;
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 238 };
    this.statusText = row(260, '', COLOR.muted, '15px');

    this._layout();
  }

  // --- inputs ---
  // SPACE pumps. Held down it does nothing after the first: a bellows is worked.
  chargeStart() {
    if (!this._live() || !this.armed) return;
    const c = this.config;
    this.armed = false;
    this.heat.pump();
    c.fire?.take(c.pumpFuelSec); // the bellows are paid for out of the bench's fire
  }

  strike() {
    this.armed = true;
  }

  // Up lifts the oldest clump off the surface; down tips the pot. Left and right are
  // nothing to a crucible, and the scene passes every arrow, so they are ignored here.
  setSide(dir) {
    if (dir === 'up') this._skim();
    else if (dir === 'down') this._pour();
  }

  _skim() {
    if (!this._live()) return;
    const c = this.config;
    if (this.skims <= 0) return this._setStatus('No skims left. Pour, or let it ride.', COLOR.danger);
    if (!this.dross.length) return this._setStatus('Nothing on the surface yet.', COLOR.muted);

    const clump = this.dross.shift();
    const set = this._isSet(clump);
    this.skims -= 1;
    this.purity = Math.min(c.purityCeiling, this.purity + (set ? c.skimPurityGainSet : c.skimPurityGain));
    this.heat.cool(set ? c.skimHeatCostSet : c.skimHeatCost);
    this._judge(set ? 'good' : 'perfect');
    this._setStatus(set
      ? 'That clump had set — half the purity and twice the heat. Take them fresh.'
      : 'Clean skim.', set ? COLOR.warn : COLOR.grass);
  }

  _pour() {
    if (!this._live()) return;
    const c = this.config;
    if (this.molten < c.minMoltenToPour) {
      return this._setStatus('Not enough of the charge has run yet.', COLOR.muted);
    }
    // What came out of the pot, as the game reads work: the purity, docked for anything
    // still sitting in the pot unmelted. It is written several times over because the bar
    // is what the whole thing was for — a run of clean skims is not a good pour on its own.
    const score = clamp01(this.purity * (0.7 + 0.3 * this.molten));
    const judgment = score >= c.pourPerfectAt ? 'perfect' : score >= c.pourGoodAt ? 'good' : 'miss';
    for (let i = 0; i < c.pourWeight; i++) this.judgments.push(judgment);
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, judgment);
    this.completed = true;
    this._setStatus('Poured.', COLOR.grass);
    this._finish();
  }

  update(now) {
    if (this.completed || this.failed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastAt = now;
    }
    const c = this.config;
    const dt = Math.min(0.1, (now - this.lastAt) / 1000);
    this.lastAt = now;
    this.now = now; // the one clock, so a skim reads set against the same time the pot does

    this.heat.decay(dt);

    const zone = this.heat.zone();
    this.molten = clamp01(this.molten + c.meltRatePerSec * HEAT_FACTOR[zone] * dt);
    // Held above the band, the pool takes air and the purity goes with it. Scorching costs
    // more than merely hot, which is what makes the top of the gauge a place to visit
    // rather than a place to sit.
    if (zone === 'warm' || zone === 'scorch') {
      this.purity = Math.max(0, this.purity - c.oxidePerSec * (zone === 'scorch' ? 1 : 0.4) * dt);
    }

    this._surface(now);
    this._layout();
  }

  // Clumps come up on a jittered interval once the charge starts to run. A full surface is
  // the hoarding tax: the next one up sinks the oldest, and that is gone into the metal.
  _surface(now) {
    const c = this.config;
    if (this.molten <= 0.15) return;
    if (this.nextDrossAt === null) {
      this.nextDrossAt = now + c.drossIntervalMs;
      return;
    }
    if (now < this.nextDrossAt) return;

    if (this.dross.length >= c.maxSurfaceDross) {
      this.dross.shift();
      this.purity = Math.max(0, this.purity - c.drossSinkPenalty);
      this._judge('miss');
      this._setStatus('A clump sank in. The pour will read it.', COLOR.danger);
    }
    const used = new Set(this.dross.map((d) => d.slot));
    let slot = 0;
    while (used.has(slot) && slot < c.maxSurfaceDross - 1) slot += 1;
    this.dross.push({ spawnedAt: now, slot });
    this.nextDrossAt = now + c.drossIntervalMs + (Math.random() * 2 - 1) * c.drossJitterMs;
  }

  _isSet(clump) {
    return (this.now ?? clump.spawnedAt) - clump.spawnedAt >= this.config.drossSetMs;
  }

  _live() {
    return !this.completed && !this.failed && this.startTime !== null;
  }

  _judge(judgment) {
    this.judgments.push(judgment);
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, judgment);
  }

  // The bench's fire went out with metal still in the pot: the charge is lost, which is
  // the same as it always was — it is the fire that says so now rather than the crucible.
  stop() {
    this.completed = true;
    this._cleanup();
  }

  _finish() {
    this.scene.time.delayedCall(this.config.settleMs, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _setStatus(text, colour) {
    this.statusText?.setText(text).setColor(colour ?? COLOR.muted);
  }

  _layout() {
    if (!this.g) return;
    const c = this.config;
    const bx = c.layout.x;

    this.moltenBar.setValue(this.molten);
    this.moltenText.setText(`Molten  ${Math.round(this.molten * 100)}%`
      + (this.molten < c.minMoltenToPour ? `  (${Math.round(c.minMoltenToPour * 100)}% before it will pour)` : ''));
    this.purityBar.setValue(this.purity);
    this.purityText.setText(`Purity  ${Math.round(this.purity * 100)}%`);

    const zone = ZONE[this.heat.zone()];
    this.heatText.setText(zone.say).setColor(hex(zone.colour));
    this.heatGauge.setValue(this.heat.value);
    this.heatGauge.setMarkerTint(zone.colour);

    this.surfaceText.setText(`Surface — ${this.skims} skim${this.skims === 1 ? '' : 's'} left`);
    // The surface: a socket for every place a clump can sit, filled where one is. A fresh
    // clump is pale and a set one is dark, because which it is is the whole of the decision.
    this.g.clear();
    const held = new Map(this.dross.map((d) => [d.slot, d]));
    for (let i = 0; i < c.maxSurfaceDross; i++) {
      const x = bx + 14 + i * 34;
      this.g.lineStyle(1, COLORS.ui.rule, 1);
      this.g.strokeCircle(x, this.surfaceY, 11);
      const clump = held.get(i);
      if (!clump) continue;
      this.g.fillStyle(this._isSet(clump) ? COLORS.ui.danger : COLORS.ui.goldBright, 1);
      this.g.fillCircle(x, this.surfaceY, 9);
    }
  }

  _cleanup() {
    [this.moltenText, this.purityText, this.heatText,
      this.surfaceText, this.statusText, this.band, this.g].forEach((o) => o?.destroy());
    [this.moltenBar, this.purityBar, this.heatGauge].forEach((w) => w?.destroy());
    this.g = null;
  }
}
