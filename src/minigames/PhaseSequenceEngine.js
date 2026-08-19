// Generic multi-phase orchestrator, imported from StarScape. It implements no minigame:
// it sequences a list of sub-engines one at a time and aggregates every phase's
// perfect/good/miss judgments into one list for the caller. A whole multi-step activity
// is built by composing engines that already exist, and none of them are changed for it.
//
// Each phase is { type, label, instructions, gated, makeEngine(scene) }. Sub-engines take
// input by slightly different names, so it is routed by the current phase's `type`; a new
// engine is one line in the routers at the bottom.
//
// Changed on import: the routing table names only the engines this game has, and the v1
// document citations are stripped. The sequencing is untouched.

export class PhaseSequenceEngine {
  constructor(scene, phases) {
    this.scene = scene;
    this.phases = phases;
    this.current = null;
    this.currentType = null;
    this.phaseIndex = 0;
    this.allJudgments = [];
    this.completed = false;
    this.onComplete = null;
    this.onPhaseStart = null;
  }

  start(onComplete, onPhaseStart, onFail) {
    this.onComplete = onComplete;
    this.onPhaseStart = onPhaseStart;
    // Called when a `gated` phase's engine reports failure: the sequence aborts and no
    // later phase runs. An engine that never sets `.failed` always passes its phase.
    this.onFail = onFail;
    this.allJudgments = [];
    this.phaseIndex = 0;
    this.completed = false;
    this._startPhase();
  }

  // Stopped where it stands — the fire under it went out. The running phase is torn down
  // and nothing pending is allowed to start another or report one finished.
  stop() {
    this.stopped = true;
    this.completed = true;
    this.current?._cleanup?.();
    this.current = null;
  }

  _startPhase() {
    if (this.stopped) return;
    const phase = this.phases[this.phaseIndex];
    this.currentType = phase.type;
    this.current = phase.makeEngine(this.scene);
    this.onPhaseStart?.(phase);
    this.current.start((judgments) => this._onPhaseComplete(judgments));
  }

  _onPhaseComplete(judgments) {
    if (this.stopped) return;
    this.allJudgments.push(...judgments);
    const phase = this.phases[this.phaseIndex];
    const failed = this.current?.failed === true;
    this.current = null; // the gap between phases: there is nothing to route input to

    if (phase.gated && failed) {
      this.completed = true;
      this.onFail?.(phase, this.allJudgments);
      return;
    }

    this.phaseIndex += 1;
    if (this.phaseIndex >= this.phases.length) {
      this.completed = true;
      this.onComplete?.(this.allJudgments);
      return;
    }

    // a small pause so the finished phase's cleanup settles before the next one draws
    this.scene.time.delayedCall(400, () => this._startPhase());
  }

  update(now) {
    if (!this.stopped && this.current) this.current.update(now);
  }

  // --- input routing ----------------------------------------------------------

  onPress(now) {
    if (!this.current) return;
    if (this._isHold(this.currentType)) this.current.setHolding(true);
    else if (this.currentType === 'hook-set') this.current.set(now);
    else if (this.currentType === 'prospect') this.current.sample();
    else if (this.currentType === 'prep') this.current.cut();
    else if (this.currentType === 'cook') this.current.pull();
    else if (this.currentType === 'axe-fell' || this.currentType === 'mine') this.current.chargeStart();
  }

  onRelease() {
    if (!this.current) return;
    if (this._isHold(this.currentType)) this.current.setHolding(false);
    else if (this.currentType === 'axe-fell' || this.currentType === 'mine') this.current.strike();
  }

  onDirection(dir) {
    if (!this.current) return;
    if (this.currentType === 'axe-fell') this.current.setSide(dir);
    else if (this.currentType === 'mine') this.current.setGear(dir);
    else if (this.currentType === 'cook') this.current.answerCue(dir);
  }

  _isHold(type) {
    return type === 'cast' || type === 'tension-bar';
  }
}
