// Quarrying: the two imported StarScape mining engines, sequenced. Sound the face to
// find where it will break, then swing the pick into it. Neither phase can lose the node
// — a read left to fade banks a poor seam and a face that caves still gives up what can
// be scraped out of it — so the work is only ever worth more or less, never nothing.
//
// This file is the only Dreadhollow-side part of the import: it turns the layout the
// crawl hands an activity into the two phases' coordinates and speaks the contract
// src/activity.js and the Quest scene already use — start(onComplete), update(now),
// public judgments / completed / failed, and the same press, release and arrows the axe
// answers to. The engines themselves know nothing about any of it.

import { COLOR, FONT } from './ui.js';
import { PhaseSequenceEngine } from './PhaseSequenceEngine.js';
import { ProspectEngine } from './ProspectEngine.js';
import { MineEngine } from './MineEngine.js';

const HEAD = 26; // the phase heading sits above whatever the phase draws

export class QuarryEngine {
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
        type: 'prospect',
        label: 'Sound',
        makeEngine: (s) => new ProspectEngine(s, { ...this.config.prospect, layout: inner }),
      },
      {
        type: 'mine',
        label: 'Break',
        makeEngine: (s) => new MineEngine(s, { ...this.config.mine, layout: inner }),
      },
    ];

    this.seq = new PhaseSequenceEngine(this.scene, phases);
    this.seq.start(
      (judgments) => this._end(judgments),
      // both phases named, the one being worked in brackets, so a dig reads as one act
      // with a place in it rather than two unrelated screens
      (phase) => this.headText?.setText(phases
        .map((p) => (p.label === phase.label ? `[${p.label}]` : ` ${p.label} `))
        .join('   ')),
    );
  }

  _end(judgments) {
    this.judgments = judgments;
    this.completed = true;
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
