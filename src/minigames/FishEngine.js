// Fishing: the three imported StarScape engines, sequenced. Cast to find a fish, set the
// hook when it takes, then hold the line while it fights. Every phase is a gate — blow
// the cast and there is nothing to hook, strike a nibble and it is gone, run the line out
// and it snaps — so a lost catch ends the node where it stands.
//
// This file is the only Dreadhollow-side part of the import: it turns the layout the
// crawl hands an activity into the three phases' coordinates, and speaks the contract
// src/activity.js and the Quest scene already use — start(onComplete), update(now),
// public judgments / completed / failed, and the same press/release the axe answers to.
// The engines themselves know nothing about any of it.

import { COLOR, FONT } from './ui.js';
import { PhaseSequenceEngine } from './PhaseSequenceEngine.js';
import { CastEngine } from './CastEngine.js';
import { HookSetEngine } from './HookSetEngine.js';
import { TensionBarEngine } from './TensionBarEngine.js';

const HEAD = 26; // the phase heading sits above whatever the phase draws

export class FishEngine {
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
        type: 'cast',
        label: 'Cast',
        gated: true,
        makeEngine: (s) => new CastEngine(s, { ...this.config.cast, layout: inner }),
      },
      {
        type: 'hook-set',
        label: 'Hook',
        gated: true,
        makeEngine: (s) => new HookSetEngine(s, { ...this.config.hook, layout: inner }),
      },
      {
        type: 'tension-bar',
        label: 'Reel',
        gated: true,
        makeEngine: (s) => new TensionBarEngine(s, { ...this.config.reel, layout: inner }),
      },
    ];

    this.seq = new PhaseSequenceEngine(this.scene, phases);
    this.seq.start(
      (judgments) => this._end(judgments, false),
      // all three phases named, the one being played in brackets, so a catch reads as
      // one act with a place in it rather than three unrelated screens
      (phase) => this.headText?.setText(phases
        .map((p) => (p.label === phase.label ? `[${p.label}]` : ` ${p.label} `))
        .join('   ')),
      (phase, judgments) => this._end(judgments, true, phase),
    );
  }

  // A gated phase that failed ends the catch: what was scored before it still counts, and
  // the node settles as botched work. See src/run.js.
  _end(judgments, failed) {
    this.judgments = judgments;
    this.completed = true;
    this.failed = failed;
    this.headText?.destroy();
    this.headText = null;
    this.onComplete?.(judgments);
  }

  update(now) {
    if (!this.completed) this.seq?.update(now);
  }

  // the axe's names, because the crawl already presses and releases in those words
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
