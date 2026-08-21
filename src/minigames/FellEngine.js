// The Fell minigame, imported from StarScape. ONE live event juggling two systems:
//
//  - SWING (hold SPACE to wind up, release to strike): the power marker winds up
//    SLOW and vents FAST; a bite target MOVES along the bar (further/faster on
//    older trees). Release in the zone for a strong precise bite that deepens the
//    CUT. Off-zone is a glancing blow; overcharge is a wild swing that splinters
//    the trunk (chips SOUNDNESS).
//  - LEAN (← face cut / → back cut): every swing lands on the chosen side and
//    shifts the tree's LEAN that way, while the tree naturally tips toward its
//    fall over time. Keep the lean inside its safe band (steer your cut sides
//    against the drift); let it stray and the trunk strains — SOUNDNESS drains,
//    and at zero the tree BINDS/SPLITS and the log is lost (`failed = true`).
//
// Meters: cut (0..1, the win — the tree falls), lean (with safe band), soundness
// (the break gate). Loud PERFECT/BITE/etc. feedback per swing.
//
// The contract every activity engine keeps: start(onComplete), update(now), and
// public `judgments` / `completed` / `failed`. src/activity.js is what drives it.
//
// Changed on import: the text colours are the kit's tokens rather than StarScape's
// parchment hexes, the config its caller hands it comes from TUNING.fell in
// tuning.js, and the v1 document citations are stripped. The mechanic is untouched.

import { COLOR, FONT, JUDGE } from './ui.js';
import { trackWidget, arcGauge, meterBar, popFeedback, ribbonKind, resolveFrame, resolveBarKind } from './meters.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// What the engine calls the things it draws. The same swing is a tree coming down in the
// wood and a blow landing in a fight, so a caller can hand it another set through
// `words` in its config; anything it does not name keeps the word below. Nothing here
// touches the mechanic — these are labels on the same meters.
const WORDS = {
  cut: 'Cut',
  lean: 'Lean  (keep it in the band)',
  face: 'Cutting: ◄ FACE   (→ to back-cut)',
  back: 'Cutting: BACK ►   (← to face-cut)',
  power: 'Swing — hold SPACE, release in the moving bite',
  sound: 'Soundness',
  status: '← face cut   → back cut',
  wild: 'WILD SWING',
  perfect: 'PERFECT!',
  good: 'BITE',
  glance: 'GLANCING',
};

export class FellEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.onComplete = null;
    this.startTime = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
    this.cut = 0;
    this.lean = 0.5;
    this.soundness = 1;
    this.side = 'back'; // start countering the tree's tip
    this.chargeState = 'idle';
    this.power = 0;
    this.startTime = null;

    const c = this.config;
    this.words = { ...WORDS, ...(c.words || {}) };
    const pz = c.powerZone;
    this.zoneCenter = (pz.min + pz.max) / 2;
    // Swing-zone travel bounds, kept inside the bar (fixes the zone overrunning it).
    this.zoneLo = Math.max(pz.min, pz.width / 2);
    this.zoneHi = Math.min(pz.max, 1 - pz.width / 2);
    this.zoneDir = 1;

    // The lean safe-band itself sweeps slowly (a moving target); track its centre.
    this.bandHalf = (c.leanBand.high - c.leanBand.low) / 2;
    this.bandCenter = (c.leanBand.low + c.leanBand.high) / 2;
    this.bandDir = 1;
    this.bandMin = Math.max(this.bandHalf + 0.02, this.bandCenter - c.leanBandRoam);
    this.bandMax = Math.min(1 - this.bandHalf - 0.02, this.bandCenter + c.leanBandRoam);

    const L = c.layout;
    this.BW = L.barW ?? 320; // fills the plate when the hybrid supplies a width
    const bx = L.x;
    // Cut progress — the bespoke `bar_fell` (Amber/Leaf) once baked, else `bar_atb`.
    this.cutText = this.scene.add.text(bx, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.cutBar = meterBar(this.scene, bx, L.top + 30, this.BW, 14, resolveBarKind(this.scene, 'bar_fell', 'bar_atb'));

    // A pip row reading `cut` quantized, right-aligned on the cut row. No-op until
    // strike_pip art is in the atlas.
    this.pips = [];
    const pipN = c.strikePips ?? 0;
    if (pipN && this.scene.textures.get('ui')?.has('strike_pip_full')) {
      for (let i = 0; i < pipN; i++) {
        this.pips.push(this.scene.add.image(bx + this.BW - (pipN - i) * 15, L.top + 8, 'ui', 'strike_pip_full').setOrigin(0, 0.5).setScale(1.6));
      }
    }

    // Lean read — the bespoke `lean_gauge` arc (plumb-bob marker + roaming safe-band) once
    // baked, else the generic linear track. Both expose the same setBand/setMarker API.
    this.leanText = this.scene.add.text(bx, L.top + 48, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.leanGauge = this.scene.textures.get('ui')?.has('lean_gauge')
      ? arcGauge(this.scene, bx + this.BW / 2, L.top + 92, { scale: 1.7 })
      : trackWidget(this.scene, bx, L.top + 86, this.BW, { height: 20 });
    this.sideText = this.scene.add.text(bx, L.top + 128, '', { fontSize: '17px', fontFamily: FONT, color: COLOR.gold });

    // Swing power track with moving bite-zone + marker. The bite window uses the bespoke
    // grain-gold "good cut" band and the axe-bit marker once baked, else the generic pair.
    this.powerText = this.scene.add.text(bx, L.top + 146, this.words.power, { fontSize: '16px', fontFamily: FONT, color: COLOR.muted });
    this.powerTrack = trackWidget(this.scene, bx, L.top + 178, this.BW, {
      height: 22,
      markerKey: resolveFrame(this.scene, 'ui', ['axe_marker', 'marker']),
      bandKey: resolveFrame(this.scene, 'ui', ['grain_band', 'sweetspot_band']),
    });
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 214 };

    // Soundness (break gate). The grove_split overlay on the trunk IS the gauge now — it
    // retires the generic bar_integrity for this activity; keep a small numeric readout here.
    this.soundText = this.scene.add.text(bx, L.top + 244, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.grass });
    this.statusText = this.scene.add.text(bx, L.top + 276, this.words.status, { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });

    this._layout();
  }

  // --- inputs ---
setSide(dir) {
    if (this.completed || this.startTime === null) return;
    // Left and right pick the side of the cut; the crawl hands over every arrow, and the
    // two this has no use for are left alone.
    if (dir !== 'left' && dir !== 'right') return;
    this.side = dir === 'left' ? 'face' : 'back';
  }

  chargeStart() {
    if (this.completed || this.startTime === null || this.chargeState !== 'idle') return;
    this.chargeState = 'charging';
    this.power = 0;
  }

  strike() {
    if (this.chargeState !== 'charging' || this.completed) return;
    const c = this.config;
    const power = this.power;
    const half = c.powerZone.width / 2;
    const inZone = power >= this.zoneCenter - half && power <= this.zoneCenter + half;

    if (power > c.overchargeAt) {
      this._resolve('miss', this.words.wild, JUDGE.wild, () => { this.soundness = clamp01(this.soundness - c.wildChip); this.cut = clamp01(this.cut + c.cutPerSwing * 0.3); this._applyLean(0.5); });
    } else if (inZone) {
      const precision = Math.abs(power - this.zoneCenter) / half;
      const perfect = precision <= 0.5;
      this._resolve(perfect ? 'perfect' : 'good', perfect ? this.words.perfect : this.words.good, perfect ? JUDGE.perfect : JUDGE.good, () => {
        this.cut = clamp01(this.cut + c.cutPerSwing * (perfect ? 1 : 0.85));
        this._applyLean(1);
      });
    } else {
      this._resolve('miss', this.words.glance, JUDGE.glance, () => { this.cut = clamp01(this.cut + c.cutPerSwing * 0.2); this._applyLean(0.5); });
    }

    // The bite moves forward/back with each swing — a face cut nudges it forward
    // (right), a back cut back (left); alternating sides makes it sweep.
    const shift = (this.side === 'face' ? 1 : -1) * this.config.zoneShiftPerSwing;
    this.zoneCenter = Math.max(this.zoneLo, Math.min(this.zoneHi, this.zoneCenter + shift));

    // The lean safe-band sweeps gradually with each hit (a moving target).
    this.bandCenter += this.bandDir * this.config.bandStepPerSwing;
    if (this.bandCenter >= this.bandMax) { this.bandCenter = this.bandMax; this.bandDir = -1; }
    else if (this.bandCenter <= this.bandMin) { this.bandCenter = this.bandMin; this.bandDir = 1; }

    this.chargeState = 'venting';
    if (this.cut >= 1) this._succeed();
  }

  _applyLean(strength) {
    const step = this.config.leanStep * strength;
    this.lean = clamp01(this.lean + (this.side === 'face' ? step : -step));
  }

  _resolve(judgment, word, color, apply) {
    this.judgments.push(judgment);
    apply();
    this._popFeedback(judgment);
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

    if (this.chargeState === 'charging') this.power = Math.min(1.15, this.power + dt / (c.chargeDurationMs / 1000));
    else if (this.chargeState === 'venting') { this.power = Math.max(0, this.power - c.ventPerSec * dt); if (this.power <= 0) this.chargeState = 'idle'; }

    // The lean cursor DRIFTS in the direction of the current cut — a face cut
    // pushes it forward, a back cut back — so you steer it by holding a side.
    this.lean = clamp01(this.lean + (this.side === 'face' ? 1 : -1) * c.leanDrift * dt);

    // Straining the trunk (lean outside the sweeping safe-band) drains soundness;
    // a balanced cut lets it recover.
    const bLow = this.bandCenter - this.bandHalf;
    const bHigh = this.bandCenter + this.bandHalf;
    if (this.lean < bLow || this.lean > bHigh) {
      const dist = this.lean < bLow ? bLow - this.lean : this.lean - bHigh;
      this.soundness = clamp01(this.soundness - c.soundnessDrainPerSec * dt * (0.3 + dist * 2));
    } else {
      this.soundness = clamp01(this.soundness + c.soundnessRegenPerSec * dt);
    }
    if (this.soundness <= 0 && !this.completed) return this._fail();

    this._layout();
  }

  _succeed() {
    this.completed = true;
    this.failed = false;
    this._setStatus('Timber! The tree comes down clean.', COLOR.grass);
    this.scene.time.delayedCall(500, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _fail() {
    this.completed = true;
    this.failed = true;
    this._setStatus('The trunk split as it went — the timber is ruined.', COLOR.danger);
    this.scene.time.delayedCall(800, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _popFeedback(judgment) {
    if (this.fbPos) popFeedback(this.scene, this.fbPos.x, this.fbPos.y, ribbonKind(judgment));
  }

  _setStatus(text, color) {
    this.statusText?.setText(text).setColor(color ?? COLOR.muted);
  }

  _layout() {
    this.cutBar.setValue(this.cut);
    this.cutText.setText(`${this.words.cut}  ${Math.round(this.cut * 100)}%`);
    if (this.pips.length) {
      const spent = Math.floor(this.cut * this.pips.length);
      this.pips.forEach((p, i) => p.setFrame(i < spent ? 'strike_pip_spent' : 'strike_pip_full'));
    }

    const balanced = this.lean >= this.bandCenter - this.bandHalf && this.lean <= this.bandCenter + this.bandHalf;
    this.leanGauge.setBand(this.bandCenter, this.bandHalf).setBandTint(JUDGE.held)
      .setMarker(this.lean).setMarkerTint(balanced ? null : JUDGE.danger);
    this.leanText.setText(this.words.lean);
    this.sideText.setText(this.side === 'face' ? this.words.face : this.words.back);

    const p = Math.min(this.power, 1);
    const half = this.config.powerZone.width / 2;
    const inZone = this.power >= this.zoneCenter - half && this.power <= this.zoneCenter + half;
    this.powerTrack.setBand(this.zoneCenter, half).setBandTint(inZone ? null : JUDGE.held)
      .setMarker(p).setMarkerTint(this.power > this.config.overchargeAt ? JUDGE.danger : null);

    this.soundText.setText(`${this.words.sound}  ${Math.round(this.soundness * 100)}%`);
    this.soundText.setColor(this.soundness <= 0.3 ? COLOR.warn : this.soundness <= 0.6 ? COLOR.gold : COLOR.grass);
  }

  _cleanup() {
    [this.cutText, this.leanText, this.sideText, this.powerText, this.soundText, this.statusText].forEach((g) => g?.destroy());
    this.pips?.forEach((p) => p?.destroy());
    [this.cutBar, this.leanGauge, this.powerTrack, this.soundBar].filter(Boolean).forEach((w) => w?.destroy());
  }
}
