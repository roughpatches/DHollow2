// The anvil, imported from StarScape. The largest engine here and the only one that asks
// for three things at once: the fire has to be right, the blow has to be timed, and the
// piece has to be kept whole while both are going on.
//
//  - PUMP (SPACE, tapped) works the bellows, the same fire the crucible uses. A blow off
//    a cold piece does almost nothing and chips it; a blow off a scorching one chips it
//    harder. The band in the middle is where the metal moves.
//  - THE HAMMER (hold SPACE, release to strike). The power marker winds up slowly while
//    held, and a target zone sweeps steadily along the bar. Release inside the zone and
//    the blow lands — dead centre, off a fire dead centre, is a perfect one. Release off
//    it and it glances. Hold past the top and it is a wild swing that costs the piece.
//    The bar vents fast afterwards, so the rhythm is wind, strike, wind.
//  - QUENCH (DOWN, toggled) puts the piece in the tub. It gives back what the heat has
//    been taking out of it, and takes the heat with it — so it is a decision about when,
//    not a thing to leave on.
//  - INTEGRITY is the piece. Held hot it drains; a bad blow chips it. At nothing the
//    piece cracks and the bar is gone. It is the only hard fail at a bench.
//
// Changed on import: the event bus and its scene are gone — this draws its own readouts
// with the kit, the way every other engine here does — and the hold-to-quench became a
// toggle, because the scene passes an arrow press and not an arrow held. The three verbs
// are the ones every engine here answers to: chargeStart, strike, setSide. The config
// comes from `forge` in tuning.js, and the fire is the bench's, so a pump is charged to
// the same clock the crucible and the kitchen keep. What StarScape called tiers are the
// three signature jobs, kept whole and named for what they are: the links of a mail, the
// two edges of a blade, and the work-hardening of raised plate.

import { COLOR, FONT } from './ui.js';
import { meterBar, heatGauge, trackWidget, popFeedback } from './meters.js';
import { COLORS, hex } from '../../tuning.js';
import { HeatCore } from './HeatCore.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

const ZONE = {
  cold: { say: 'Cold. The hammer is just noise.', colour: COLORS.ui.cool },
  cool: { say: 'Coming up.', colour: COLORS.ui.cool },
  sweet: { say: 'At heat. It will move.', colour: COLORS.ui.grass },
  warm: { say: 'Hot — it is going soft on you.', colour: COLORS.ui.warn },
  scorch: { say: 'Scorching. You are burning the piece.', colour: COLORS.ui.danger },
};

export class ForgeEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.onComplete = null;
  }

  start(onComplete) {
    const c = this.config;
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;

    this.heat = new HeatCore(c);
    this.progress = 0;
    this.integrity = 1;
    this.quenching = false;
    this.charge = 'idle'; // 'idle' | 'winding' | 'venting'
    this.power = 0;
    this.startTime = null; // seeded on the first update

    // The sweep opens at one end and runs at a constant pace: the same pass every time,
    // so what is being learnt is the rhythm and not the pattern.
    this.zoneAt = c.powerZone.min;
    this.zoneDir = 1;

    // --- the signature jobs, each one off `hard` in the recipe ---
    // links (mail): blows landed on the cadence chain, and each link is worth more.
    this.chain = 0;
    this.lastStrikeAt = null;
    // edges (a blade): the work turns over at halfway, and the two halves are compared.
    this.halves = [[], []];
    this.turned = false;
    // raising (plate): the metal hardens under the hammer until it is quenched soft.
    this.hardening = 0;

    const L = c.layout;
    const bx = L.x;
    this.BW = L.barW ?? 340;
    const row = (dy, str, colour = COLOR.text, size = '18px') => this.scene.add.text(
      bx, L.top + dy, str, { fontSize: size, fontFamily: FONT, color: colour },
    );

    this.progressText = row(0, '');
    this.progressBar = meterBar(this.scene, bx, L.top + 30, this.BW, 14, 'bar_atb');

    this.powerText = row(52, 'Hammer', COLOR.muted, '16px');
    this.powerTrack = trackWidget(this.scene, bx, L.top + 82, this.BW, { height: 14 });

    this.heatText = row(108, '', COLOR.muted, '16px');
    this.heatGauge = heatGauge(this.scene, bx, L.top + 140, this.BW, { height: 18 });
    // The band drawn where it actually is, the same as at the crucible: which stretch of
    // the gauge the work wants is not a thing to be learnt by cracking pieces.
    this.band = this.scene.add.rectangle(
      bx + this.BW * c.sweetBand.low, L.top + 140,
      this.BW * (c.sweetBand.high - c.sweetBand.low), 18, COLORS.ui.grass, 0.5,
    ).setOrigin(0, 0.5).setStrokeStyle(1, COLORS.ui.goldBright, 0.9);
    this.heatGauge.marker.setDepth(this.band.depth + 1);

    this.integrityText = row(170, '');
    this.integrityBar = meterBar(this.scene, bx, L.top + 200, this.BW, 14, 'bar_integrity');

    this.fbPos = { x: bx + this.BW / 2, y: L.top + 232 };
    this.statusText = row(254, '', COLOR.muted, '15px');

    this._layout();
  }

  // --- inputs ---
  // SPACE does both halves of the same motion: a tap works the bellows, and holding it
  // winds the hammer. Which one it was is known on release — a wind that never got
  // anywhere was a pump.
  chargeStart() {
    if (!this._live() || this.quenching) return;
    if (this.charge !== 'idle') return; // the bar has not vented yet
    this.charge = 'winding';
    this.power = 0;
  }

  strike() {
    if (!this._live()) return;
    const c = this.config;
    if (this.charge !== 'winding') return;
    // Too short a hold to be a swing: it was a pump, and the fire takes it.
    if (this.power < c.pumpBelow) {
      this.charge = 'idle';
      this.power = 0;
      this.heat.pump();
      c.fire?.take(c.pumpFuelSec); // the bellows are paid for out of the bench's fire
      return;
    }

    const power = this.power;
    const zone = this.heat.zone();
    const half = c.powerZone.width / 2;
    const inZone = Math.abs(power - this.zoneAt) <= half;
    const now = this.now ?? 0;
    // raising (plate): every blow leaves the metal harder, so every blow does less until
    // it is annealed. Applied to whatever progress this one was going to make.
    const hard = c.raising ? 1 - this.hardening : 1;

    if (zone === 'scorch') {
      this._resolve('miss', 'Burnt it', COLORS.ui.danger, () => {
        this.integrity = clamp01(this.integrity - c.scorchChip);
      });
    } else if (zone === 'cold') {
      this._resolve('miss', 'Stone cold', COLORS.ui.cool, () => {
        this.integrity = clamp01(this.integrity - c.coldChip);
        this.progress = clamp01(this.progress + c.progressPerStrike * 0.1 * hard);
      });
    } else if (power > c.overchargeAt) {
      this._resolve('miss', 'Wild', COLORS.ui.warn, () => {
        this.integrity = clamp01(this.integrity - c.wildChip);
        this.progress = clamp01(this.progress + c.progressPerStrike * 0.4 * hard);
      });
    } else if (inZone) {
      const off = Math.abs(power - this.zoneAt) / half; // 0 dead centre .. 1 at the edge
      const perfect = off <= c.perfectWithin && zone === 'sweet'
        && this.heat.centering() <= c.perfectHeatWithin;
      const heatQ = zone === 'sweet' ? 1 : 0.6;

      // links (mail): keep the cadence and the links multiply what the blow is worth.
      let links = 1;
      let word = perfect ? 'Dead on' : 'Landed';
      if (c.links) {
        const onCadence = this.lastStrikeAt !== null && now - this.lastStrikeAt <= c.links.windowMs;
        this.chain = onCadence ? this.chain + 1 : 1;
        links = 1 + Math.min(c.links.maxBonus, (this.chain - 1) * c.links.bonusPerLink);
        if (this.chain > 1) word = `Link x${this.chain}`;
      }

      this._resolve(perfect ? 'perfect' : 'good', word,
        perfect ? COLORS.ui.goldBright : COLORS.ui.grass, () => {
          this.progress = clamp01(this.progress
            + c.progressPerStrike * (perfect ? 1 : 0.8) * heatQ * links * hard);
        });
    } else {
      if (c.links) this.chain = 0; // a blow off the beat drops the links
      this._resolve('miss', 'Mistimed', COLORS.ui.muted, () => {
        this.progress = clamp01(this.progress + c.progressPerStrike * 0.2 * hard);
      });
    }
    this.lastStrikeAt = now;

    if (c.raising) this.hardening = Math.min(c.raising.max, this.hardening + c.raising.perStrike);

    // edges (a blade): say when the work turns over, so the second half is known to be
    // the second half while it is being done rather than afterwards.
    if (c.edges && !this.turned && this.progress >= 0.5) {
      this.turned = true;
      this._setStatus('Turned over. The other edge now, and it wants to match.', COLOR.text);
    }

    this.heat.cool(c.heatPerStrike);
    this.charge = 'venting'; // fast back to nothing before the next wind
    if (this.progress >= 1) this._finish();
  }

  // Down puts it in the tub and takes it out again. Left, right and up are nothing to an
  // anvil, and the scene passes every arrow, so they are ignored here.
  setSide(dir) {
    if (dir !== 'down' || !this._live()) return;
    this.quenching = !this.quenching;
    if (this.quenching) { this.charge = 'idle'; this.power = 0; }
  }

  update(now) {
    if (this.completed) return;
    if (this.startTime === null) {
      this.startTime = now;
      this.lastAt = now;
    }
    const c = this.config;
    const dt = Math.min(0.1, (now - this.lastAt) / 1000);
    this.lastAt = now;
    this.now = now; // the one clock, so a link reads on the beat the anvil is keeping

    // The zone sweeps end to end and turns round. One pace, every pass.
    const pz = c.powerZone;
    this.zoneAt += this.zoneDir * c.sweepSpeed * dt;
    if (this.zoneAt >= pz.max) { this.zoneAt = pz.max; this.zoneDir = -1; }
    else if (this.zoneAt <= pz.min) { this.zoneAt = pz.min; this.zoneDir = 1; }

    if (this.charge === 'winding') {
      this.power = Math.min(c.overchargeAt + 0.15, this.power + dt / (c.chargeDurationMs / 1000));
    } else if (this.charge === 'venting') {
      this.power = Math.max(0, this.power - c.ventPerSec * dt);
      if (this.power <= 0) this.charge = 'idle';
    }

    if (this.quenching) {
      this.heat.cool(c.quenchCoolPerSec * dt);
      this.integrity = clamp01(this.integrity + c.quenchRegenPerSec * dt);
      // The tub anneals what the hammer hardened, which is the plate's rhythm: strike,
      // strike, quench, strike.
      if (c.raising) this.hardening = Math.max(0, this.hardening - c.raising.annealPerSec * dt);
    } else {
      // A wind-up should not be punished for taking its time: while the hammer is being
      // wound, both the fire falling away and the hot metal's stress run at a fraction of
      // normal. Set your heat, then think about the blow — the risk is between them.
      const held = this.charge === 'winding' ? c.windHoldScale : 1;
      this.heat.decay(dt * held);
      if (this.heat.value > c.sweetBand.low) {
        this.integrity = clamp01(this.integrity - c.stressPerSec * dt * held * this.heat.value);
      }
    }

    if (this.integrity <= 0) return this._crack();

    this._layout();
  }

  // How far apart the two halves came out, 0 for a matched pair. Only the edges job asks.
  _symmetry() {
    const worth = (list) => (list.length
      ? list.reduce((n, j) => n + (j === 'perfect' ? 1 : j === 'good' ? 0.5 : 0), 0) / list.length
      : 0);
    return Math.abs(worth(this.halves[0]) - worth(this.halves[1]));
  }

  _resolve(judgment, word, colour, apply) {
    this.judgments.push(judgment);
    if (this.config.edges) this.halves[this.progress < 0.5 ? 0 : 1].push(judgment);
    apply();
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, judgment);
    this._setStatus(word, hex(colour));
  }

  _live() {
    return !this.completed && this.startTime !== null;
  }

  // The bench's fire went out with the piece still on the anvil. It is not cracked and it
  // is not finished, so it is judged on what was done to it and no more.
  stop() {
    this.completed = true;
    this._cleanup();
  }

  _finish() {
    this.completed = true;
    this._setStatus('Done. It has the shape you gave it.', hex(COLORS.ui.grass));
    // A pair whose halves do not match is a pair, and that is what it is marked on: the
    // gap is written into the judgments as misses rather than taken off a number nobody
    // can see.
    if (this.config.edges) {
      const owed = Math.round(this._symmetry() * this.config.edges.mismatchWeight);
      for (let i = 0; i < owed; i++) this.judgments.push('miss');
    }
    this.scene.time.delayedCall(this.config.settleMs, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  // The one hard fail at a bench. The bar is gone with it; see src/craft.js, which takes
  // the costs before anything is played for exactly this reason.
  _crack() {
    this.completed = true;
    this.failed = true;
    this._setStatus('It cracked under the hammer. That is the end of that bar.', hex(COLORS.ui.danger));
    this.scene.time.delayedCall(this.config.crackMs, () => {
      this._cleanup();
      this.onComplete?.(this.judgments);
    });
  }

  _setStatus(text, colour) {
    this.statusText?.setText(text).setColor(colour ?? COLOR.muted);
  }

  _layout() {
    if (!this.progressBar) return;
    const c = this.config;

    // What the piece is, and whichever of the three jobs is running said beside it.
    let job = '';
    if (c.links && this.chain > 1) job = `   Links x${this.chain}`;
    else if (c.raising && this.hardening > 0.3) job = `   Work-hardened ${Math.round(this.hardening * 100)}%`;
    else if (c.edges) job = this.turned ? '   Second edge' : '   First edge';
    this.progressBar.setValue(this.progress);
    this.progressText.setText(`Shape  ${Math.round(this.progress * 100)}%${job}`);

    const p = Math.min(this.power, 1);
    const half = c.powerZone.width / 2;
    const inZone = Math.abs(this.power - this.zoneAt) <= half;
    this.powerTrack.setBand(this.zoneAt, half)
      .setBandTint(inZone ? COLORS.ui.goldBright : COLORS.ui.grass)
      .setMarker(p)
      .setMarkerTint(this.power > c.overchargeAt ? COLORS.ui.danger : null);
    this.powerText.setText(this.quenching ? 'Hammer — down, it is in the tub'
      : this.charge === 'winding' ? 'Hammer — wound' : 'Hammer');

    const zone = ZONE[this.heat.zone()];
    this.heatText.setText(this.quenching ? 'In the tub. It is giving the stress back.' : zone.say)
      .setColor(hex(this.quenching ? COLORS.ui.cool : zone.colour));
    this.heatGauge.setValue(this.heat.value);
    this.heatGauge.setMarkerTint(this.quenching ? COLORS.ui.cool : zone.colour);

    const it = this.integrity;
    this.integrityBar.setValue(it);
    this.integrityText.setText(`Soundness  ${Math.round(it * 100)}%`)
      .setColor(hex(it > 0.4 ? COLORS.ui.grass : it > 0.2 ? COLORS.ui.warn : COLORS.ui.danger));
  }

  _cleanup() {
    [this.progressText, this.powerText, this.heatText,
      this.integrityText, this.statusText, this.band].forEach((o) => o?.destroy());
    [this.progressBar, this.powerTrack, this.heatGauge, this.integrityBar].forEach((w) => w?.destroy());
    this.progressBar = null;
  }
}
