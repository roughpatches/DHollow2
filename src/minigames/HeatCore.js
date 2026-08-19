// The bellows fire, imported from StarScape, where Smelt and Forge shared it so that both
// heated the same way. Only the crucible uses it here; it stays its own file because the
// forging engine is the next one that will want it.
//
// Pump and the heat jumps; leave it and it falls away steadily. In the middle is the band
// the work wants, with a tolerance either side of it before the charge is properly cold or
// properly burning.
//
// Changed on import: the fuel note is gone — the fuel is the crucible's and pumping is
// charged for there — and so is the centering read, which nothing here asks for. The
// numbers and the zones are untouched.

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export class HeatCore {
  constructor({ sweetBand, warmTolerance = 0.1, decayPerSec, pumpBurst }) {
    this.value = 0;
    this.sweetBand = sweetBand;
    this.warmTolerance = warmTolerance;
    this.decayPerSec = decayPerSec;
    this.pumpBurst = pumpBurst;
  }

  pump() {
    this.value = clamp01(this.value + this.pumpBurst);
  }

  cool(amount) {
    this.value = clamp01(this.value - amount);
  }

  decay(dt) {
    this.value = clamp01(this.value - this.decayPerSec * dt);
  }

  // 'cold' | 'cool' | 'sweet' | 'warm' | 'scorch' — which of the five the fire is in, and
  // the whole of what the rest of the game asks a fire.
  zone() {
    const b = this.sweetBand;
    if (this.value < b.low - this.warmTolerance) return 'cold';
    if (this.value < b.low) return 'cool';
    if (this.value <= b.high) return 'sweet';
    if (this.value <= b.high + this.warmTolerance) return 'warm';
    return 'scorch';
  }
}
