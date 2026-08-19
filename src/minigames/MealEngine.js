// Cooking: the two imported StarScape engines, sequenced. Cut what you are carrying on
// the board, then cook it over the fire and pull it before it burns. Neither phase can
// lose the node — a ragged prep makes a rougher meal and a burnt one is still edible —
// so a fire is never a thing that goes wrong, only a thing done well or badly.
//
// This file is the only Dreadhollow-side part of the import: it turns the layout the
// crawl hands an activity into the two phases' coordinates and speaks the contract
// src/activity.js and the Quest scene already use. The cook's tending cues answer to the
// arrows, which is why the crawl hands over all four of them and not just the two the
// axe steers with.

import { COLOR, FONT } from './ui.js';
import { PhaseSequenceEngine } from './PhaseSequenceEngine.js';
import { PrepEngine } from './PrepEngine.js';
import { CookEngine } from './CookEngine.js';

const HEAD = 26; // the phase heading sits above whatever the phase draws

export class MealEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.failed = false;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.failed = false;

    const L = this.config.layout;
    const inner = { ...L, top: L.top + HEAD };
    this.headText = this.scene.add.text(L.x, L.top, '', {
      fontSize: '18px', fontFamily: FONT, color: COLOR.gold,
    });

    const phases = [
      {
        type: 'prep',
        label: 'Board',
        makeEngine: (s) => new PrepEngine(s, { ...this.config.prep, layout: inner }),
      },
      {
        type: 'cook',
        label: 'Fire',
        // The cook rolls its own tend count, so the config is read fresh for every meal
        // rather than shared: two fires on one run are not the same fire twice.
        makeEngine: (s) => new CookEngine(s, { ...this.config.cook, cues: { ...this.config.cook.cues, count: this._cueCount() }, layout: inner }),
      },
    ];

    this.seq = new PhaseSequenceEngine(this.scene, phases);
    this.seq.start(
      (judgments) => this._end(judgments),
      (phase) => this.headText?.setText(phases
        .map((p) => (p.label === phase.label ? `[${p.label}]` : ` ${p.label} `))
        .join('   ')),
    );
  }

  // how many times the pot asks for something this cook, between the two in tuning.js
  _cueCount() {
    const { countMin, countMax } = this.config.cook.cues;
    return countMin + Math.floor(Math.random() * (countMax - countMin + 1));
  }

  // The fire under the kitchen went out: the board or the pot is cleared away and nothing
  // that was already in flight is allowed to report anything.
  stop() {
    // What the board scored before the pot was taken off is still what the board scored.
    this.judgments = [...(this.seq?.allJudgments || [])];
    this.completed = true;
    this.seq?.stop();
    this.headText?.destroy();
    this.headText = null;
  }

  _end(judgments) {
    if (this.completed) return;
    this.judgments = judgments;
    this.completed = true;
    this.headText?.destroy();
    this.headText = null;
    this.onComplete?.(judgments);
  }

  update(now) {
    if (!this.completed) this.seq?.update(now);
  }

  chargeStart() {
    this.seq?.onPress(this.scene.time.now);
  }

  strike() {
    this.seq?.onRelease();
  }

  setSide(dir) {
    this.seq?.onDirection(dir);
  }
}
