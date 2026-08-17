// The Mine minigame, imported from StarScape. A charge-swing pick into a face that
// fights back with shock. Where the axe steered a drifting lean, this paces blows
// against heating rock:
//
//  - SWING (hold SPACE to wind up, release to strike): the power marker winds up SLOW
//    and vents FAST while a WEAK POINT sweeps the bar. Release on it for a clean break
//    that drives the FRACTURE (the win); off it glances; overcharge is a wild swing that
//    spikes shock and chips stability.
//  - GEAR (left shallow / right deep) is a per-swing risk dial. Deep blows fracture
//    faster and heat the shock faster; shallow blows are safe and slow.
//  - SHOCK is the managed resource. It cools on its own, so the pause between blows is
//    the release valve. Strike into red shock and the face CRACKS — stability drains,
//    and at zero the face CAVES: a soft collapse, reduced haul, never a dead loss.
//
// Changed on import: the text colours are the kit's tokens, the config comes from
// TUNING.quarry.mine in tuning.js, and the bespoke pick-marker, swing-pip and gear-toggle
// art StarScape skinned this with is not here — the generic kit draws all three. The
// mechanic is untouched.

import { COLOR, FONT } from './ui.js';
import { trackWidget, meterBar, popFeedback, resolveBarKind, resolveFrame } from './meters.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// What the engine calls the things it draws. The same blow breaks a face in the quarry
// and lands on something in the dark, so a caller can hand it another set through
// `words` in its config; anything it does not name keeps the word below. Labels only —
// the mechanic underneath is the same either way.
const WORDS = {
  fracture: 'Fracture',
  shock: 'Shock  (let it cool between blows)',
  stability: 'Stability',
  power: 'Swing — hold SPACE, strike the glinting seam',
  deep: 'Digging DEEP — fast, and it heats the face    [Left] ease off',
  shallow: 'Digging SHALLOW — safe, and slow    [Right] bite deeper',
  wild: 'WILD SWING',
  perfect: 'CLEAN BREAK!',
  good: 'STRIKE',
  glance: 'GLANCING',
};

export class MineEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.collapsed = false; // soft-fail: the face caved before the ore broke free
    this.onComplete = null;
    this.startTime = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.collapsed = false;
    this.fracture = 0;
    this.shock = 0;
    this.stability = 1;
    // Presentation side-channels (read by the diorama/FX layer, never by scoring):
    // a monotonic count of red-zone cracks, and the sub-kind of the last 'miss'
    // judgment ('wild' overcharge vs 'glance' off-zone) so the FX watcher can pick
    // spark_wild vs glance_thud — judgments[] itself stays the canonical 3 values.
    this.crackCount = 0;
    this.lastMiss = null;
    this.gear = 'deep'; // start on the eager gear so the first blow bites
    this.chargeState = 'idle';
    this.power = 0;
    this.startTime = null;

    const c = this.config;
    this.words = { ...WORDS, ...(c.words || {}) };
    const pz = c.powerZone;
    // Weak-point travel bounds, kept inside the bar.
    this.zoneCenter = (pz.min + pz.max) / 2;
    this.zoneLo = Math.max(pz.min, pz.width / 2);
    this.zoneHi = Math.min(pz.max, 1 - pz.width / 2);
    this.zoneDir = 1;

    const L = c.layout;
    this.BW = L.barW ?? 320; // fills the plate when the hybrid supplies a width
    const bx = L.x;
    const inner = this.BW - 4;

    // Fracture: how far through the face they are, and the win.
    this.fracText = this.scene.add.text(bx, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.fracBar = meterBar(this.scene, bx, L.top + 30, this.BW, 14, resolveBarKind(this.scene, 'bar_mine', 'bar_atb'));

    // Shock: the managed resource, with the red end of it drawn in behind the bar.
    this.shockText = this.scene.add.text(bx, L.top + 56, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.shockBar = meterBar(this.scene, bx, L.top + 86, this.BW, 16, resolveBarKind(this.scene, 'bar_shock', 'bar_quality'));
    this.shockRed = this.scene.add.rectangle(bx + 2 + inner * c.shockRedAt, L.top + 86, inner * (1 - c.shockRedAt), 16, 0xd97a6a, 0.3).setOrigin(0, 0.5);

    // Stability (soft collapse gate).
    this.stabText = this.scene.add.text(bx, L.top + 112, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.grass });
    this.stabBar = meterBar(this.scene, bx, L.top + 142, this.BW, 12, 'bar_integrity');

    // The wind-up, with the weak point sweeping across it.
    this.powerText = this.scene.add.text(bx, L.top + 170, this.words.power, { fontSize: '16px', fontFamily: FONT, color: COLOR.muted });
    this.powerTrack = trackWidget(this.scene, bx, L.top + 202, this.BW, { height: 22, markerKey: resolveFrame(this.scene, 'ui', ['pick_marker', 'marker']) });
    this.fbPos = { x: bx + this.BW / 2, y: L.top + 238 };

    this.gearText = this.scene.add.text(bx, L.top + 264, '', { fontSize: '17px', fontFamily: FONT, color: COLOR.gold });
    // Left empty until there is something to say: which gear is armed is on the line
    // above, and the keys are on the hint under the road.
    this.statusText = this.scene.add.text(bx, L.top + 296, '', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });

    this._layout();
  }

  // --- inputs ---
  // Left and right pick the gear; the scene passes every arrow, and the two this does
  // not answer to are left alone.
  setGear(dir) {
    if (this.completed || this.startTime === null) return;
    if (dir !== 'left' && dir !== 'right') return;
    this.gear = dir === 'left' ? 'shallow' : 'deep';
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
    const deep = this.gear === 'deep';
    const fracGear = deep ? c.deepFractureMult : c.shallowFractureMult;
    const shockGear = deep ? c.deepShockMult : c.shallowShockMult;
    // Striking into already-shocked rock is what cracks the face.
    const intoRed = this.shock >= c.shockRedAt;

    if (power > c.overchargeAt) {
      this.lastMiss = 'wild';
      this._resolve('miss', this.words.wild, 0xff8c42, () => {
        this.stability = clamp01(this.stability - c.wildChip);
        this.shock = clamp01(this.shock + c.shockPerStrike * c.wildShockMult);
        this.fracture = clamp01(this.fracture + c.fracturePerStrike * c.glanceFractureMult);
      });
    } else if (inZone) {
      const precision = Math.abs(power - this.zoneCenter) / half;
      const perfect = precision <= 0.5;
      this._resolve(perfect ? 'perfect' : 'good', perfect ? this.words.perfect : this.words.good, perfect ? 0xffffff : 0xffd700, () => {
        this.fracture = clamp01(this.fracture + c.fracturePerStrike * fracGear * (perfect ? 1 : 0.82));
        this.shock = clamp01(this.shock + c.shockPerStrike * shockGear);
      });
    } else {
      this.lastMiss = 'glance';
      this._resolve('miss', this.words.glance, 0x99a0b0, () => {
        this.fracture = clamp01(this.fracture + c.fracturePerStrike * c.glanceFractureMult);
        this.shock = clamp01(this.shock + c.shockPerStrike * c.glanceShockMult);
      });
    }

    // Striking into the red cracks the face regardless of how true the blow was.
    if (intoRed) {
      this.stability = clamp01(this.stability - c.stabilityCrackOnStrike);
      this.crackCount++;
      this._popFeedback('CRACK', 0xff5555);
    }

    this.chargeState = 'venting';
    if (this.fracture >= 1) return this._succeed();
    if (this.stability <= 0) return this._collapse();
  }

  _resolve(judgment, word, color, apply) {
    this.judgments.push(judgment);
    apply();
    this._popFeedback(word, color);
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

    // The weak-point sweeps back and forth across the face.
    this.zoneCenter += this.zoneDir * c.zoneSpeed * dt;
    if (this.zoneCenter >= this.zoneHi) { this.zoneCenter = this.zoneHi; this.zoneDir = -1; }
    else if (this.zoneCenter <= this.zoneLo) { this.zoneCenter = this.zoneLo; this.zoneDir = 1; }

    // Shock cools on its own — the pause between blows is the release valve.
    this.shock = clamp01(this.shock - c.shockDecayPerSec * dt);
    // A face left sitting in the red frets itself open; a settled face knits back.
    if (this.shock >= c.shockRedAt) this.stability = clamp01(this.stability - c.stabilityDrainPerSecInRed * dt);
    else this.stability = clamp01(this.stability + c.stabilityRegenPerSec * dt);
    if (this.stability <= 0 && !this.completed) return this._collapse();

    this._layout();
  }

  _succeed() {
    this.completed = true;
    this.collapsed = false;
    this._setStatus('The ore breaks free — clean work.', COLOR.grass);
    this.scene.time.delayedCall(500, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _collapse() {
    this.completed = true;
    this.collapsed = true;
    this._setStatus('The face caves in — you scrape out what you can.', COLOR.danger);
    this.scene.time.delayedCall(800, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _popFeedback(word) {
    if (!this.fbPos) return;
    const kind = /CLEAN|PERFECT/.test(word) ? 'perfect' : /STRIKE/.test(word) ? 'good' : /WILD|CRACK/.test(word) ? 'wild' : 'miss';
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, kind);
  }

  _setStatus(text, color) {
    this.statusText?.setText(text).setColor(color ?? COLOR.muted);
  }

  _layout() {
    const L = this.config.layout;
    const bx = L.x;
    const inner = this.BW - 4;
    const c = this.config;

    this.fracBar.setValue(this.fracture);
    this.fracText.setText(`${this.words.fracture}  ${Math.round(this.fracture * 100)}%`);

    const shockRed = this.shock >= c.shockRedAt;
    this.shockBar.setValue(this.shock);
    this.shockBar.tint(shockRed ? 0xd97a6a : this.shock >= c.shockRedAt * 0.7 ? 0xf2913a : 0xedc46b);
    this.shockText.setText(this.words.shock);
    this.shockText.setColor(shockRed ? COLOR.warn : COLOR.text);

    // Stability's own low-warning tint, plus a coupling cue: red shock pulses the stability bar so
    // the deep-gear → shock → stability → collapse causality reads without being inferred.
    this.stabBar.setValue(this.stability);
    this.stabBar.tint(this.stability <= 0.3 || shockRed ? 0xd97a6a : this.stability <= 0.6 ? 0xf2913a : null);
    this.stabText.setText(this.words.stability);
    this.stabText.setColor(this.stability <= 0.3 ? COLOR.warn : COLOR.grass);

    const p = Math.min(this.power, 1);
    const half = c.powerZone.width / 2;
    const inZone = this.power >= this.zoneCenter - half && this.power <= this.zoneCenter + half;
    this.powerTrack.setBand(this.zoneCenter, half).setBandTint(inZone ? 0xffffff : 0x9ad06f)
      .setMarker(p).setMarkerTint(this.power > c.overchargeAt ? 0xd97a6a : null);

    this.gearText.setText(this.gear === 'deep' ? this.words.deep : this.words.shallow);

  }

  _cleanup() {
    [this.fracText, this.shockText, this.shockRed, this.stabText, this.powerText, this.gearText, this.statusText].forEach((g) => g?.destroy());
    [this.fracBar, this.shockBar, this.stabBar, this.powerTrack].forEach((w) => w?.destroy());
  }
}
