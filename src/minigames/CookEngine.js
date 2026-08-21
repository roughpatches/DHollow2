// The Cook minigame, imported from StarScape. One doneness bar, filling one way, and
// one decisive input to commit it:
//
//  - DONENESS fills at a CONSTANT rate to a fixed burn point, so a cook takes the same
//    time every run. Nothing ever rewinds it.
//  - A PULL WINDOW sits just under the burn point. Its high edge never moves; widening
//    it pushes the low edge earlier. SPACE is the pull: inside the window it scores by
//    how near the centre it landed, under it is a graceful underdone meal, and climbing
//    past it — pulling late, or not at all — burns it to something barely edible.
//  - CUES tend the pot on the way up: a verb, answered with the matching arrow inside a
//    generous window, WIDENS the pull window; a wrong or missed answer narrows it. They
//    all resolve before the marker can reach the window, so what you have to hit is
//    settled before you have to hit it.
//
// The only difficulty levers are the window's width and how many cues there are — never
// the fill rate, and never the time allowed to answer.
//
// Changed on import: the text colours are the kit's tokens, its config comes from
// TUNING.meal.cook in tuning.js, and the painted cook bar and cue cards StarScape skinned
// this with are not here — the generic track, bar and a line of text stand in for all
// three, which is the fallback the engine already carried. The mechanic is untouched.

import { COLOR, FONT, JUDGE } from './ui.js';
import { trackWidget, meterBar, popFeedback } from './meters.js';

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

// The safety margin (in doneness units) kept between the last cue's resolution
// and the earliest the marker could enter the window — so no cue ever resolves
// after the marker reaches the low edge, and the window can't be resized once the
// marker is committing. Must exceed the largest single reward (widthReward +
// precisionBonus = 0.12) so a cue's own reward can never push the low edge past
// its resolution point.
const CUE_SAFETY_MARGIN = 0.14;
// A burnt (overshoot) dish still cooks to a floor-tier salvage, not a total loss
// (unless BURN_OUTCOME is flipped) — a barely-passable quality.
const BURN_QUALITY = 0.1;
// Which arrow answers which verb. Flip takes either horizontal; baste/season the
// verticals. SPACE is reserved for the pull and never routed here.
const KEY_TO_VERB = { left: 'flip', right: 'flip', up: 'baste', down: 'season' };
const VERB_LABEL = { flip: 'FLIP', baste: 'BASTE', season: 'SEASON' };
const VERB_KEYHINT = { flip: '← / →', baste: '↑', season: '↓' };

export class CookEngine {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.judgments = [];
    this.completed = false;
    this.burned = false;
    this.pulled = false;
    this.quality = 0;
    this.onComplete = null;
    this.startTime = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.judgments = [];
    this.completed = false;
    this.burned = false;
    this.pulled = false;
    this.quality = 0;
    this.doneness = 0;
    this.startTime = null;
    this.windowFrozen = false; // once true, the window can't be resized (marker is committing)
    this.maxCueResolveDoneness = 0; // for verification: the latest doneness any cue resolved at

    const c = this.config;
    this.burnAt = c.burnAt;
    this.windowHigh = c.burnAt - c.window.highOffset; // FIXED, never moves
    this.windowWidth = Math.max(c.window.floor, Math.min(c.window.ceil, c.window.base));

    this._scheduleCues();

    const L = c.layout;
    this.BW = L.barW ?? 320; // fills the plate when the hybrid supplies a width
    const bx = L.x;
    this.barY = L.top + 122;

    // Doneness readout + the single unified cook bar (marker climbs into the pull window).
    this.doneText = this.scene.add.text(bx, L.top, '', { fontSize: '18px', fontFamily: FONT, color: COLOR.text });
    this.fbPos = { x: bx + this.BW / 2, y: this.barY - 28 };
    this.statusText = this.scene.add.text(bx, L.top + 152, 'SPACE to pull · arrows to tend', { fontSize: '15px', fontFamily: FONT, color: COLOR.muted });

    this.doneBar = meterBar(this.scene, bx, L.top + 30, this.BW, 14, 'bar_atb');
    this.windowTrack = trackWidget(this.scene, bx, this.barY, this.BW, { height: 20 });
    // what the pot is asking for, while it is asking
    this.cueText = this.scene.add.text(bx, L.top + 40, '', { fontSize: '20px', fontFamily: FONT, color: COLOR.gold }).setOrigin(0, 0);

    this._layout();
  }

  // Place a fixed count of cues across the early/mid climb, scheduled against the
  // NOMINAL (base-width) window rather than the widest — so the last cue sits close
  // to where the pull window actually opens (no long dead stretch before the commit).
  // A run-time freeze (see update) keeps the window stable if tends widen it past
  // base: once the marker nears the low edge, the window can no longer be resized
  // and no new cue activates, so no cue ever resolves after the marker commits.
  _scheduleCues() {
    const c = this.config;
    const cu = c.cues;
    this.respDone = (cu.responseWindowMs / 1000) * c.doneRatePerSec; // doneness climbed during a response window
    // Freeze the window this far ahead of the (current) low edge: enough that any
    // in-flight cue resolves before the marker reaches the window.
    this.freezeLead = CUE_SAFETY_MARGIN + this.respDone;
    const nominalWindowLow = this.windowHigh - c.window.base; // low edge at the starting width
    const latestCueAt = Math.max(cu.firstAtDoneness, nominalWindowLow - this.freezeLead);
    const verbs = cu.verbs ?? ['flip'];

    this.cueQueue = [];
    for (let i = 0; i < cu.count; i++) {
      const frac = cu.count > 1 ? i / (cu.count - 1) : 0;
      const at = cu.firstAtDoneness + (latestCueAt - cu.firstAtDoneness) * frac;
      // Avoid an immediate verb repeat so a run doesn't read as one held key.
      let verb = verbs[Math.floor(Math.random() * verbs.length)];
      if (i > 0 && verb === this.cueQueue[i - 1].verb && verbs.length > 1) {
        verb = verbs[(verbs.indexOf(verb) + 1) % verbs.length];
      }
      this.cueQueue.push({ at, verb, state: 'pending', activatedAt: 0 });
    }
    this.activeCue = null;
  }

  // --- inputs ---
  // SPACE: the single decisive commit.
  pull() {
    if (this.completed || this.startTime === null || this.pulled) return;
    this.pulled = true;
    const d = this.doneness;
    const windowLow = this.windowHigh - this.windowWidth;

    if (d > this.windowHigh) {
      // Pulled too late — past the safe window. Overcooked, same floor as a burn.
      return this._burn('Pulled a beat too late — overcooked.');
    }

    let quality;
    if (d < windowLow) {
      // Undercooked: graceful. Nearer the window scores better; continuous with
      // the in-window low edge (both meet at 0.5 at windowLow).
      quality = windowLow > 0 ? 0.5 * clamp01(d / windowLow) : 0.5;
      this._commit(quality, `Pulled early — a touch underdone (quality ${quality.toFixed(2)}).`, COLOR.gold);
    } else {
      // In the window: score by proximity to centre (perfect at centre → good at
      // the edges).
      const center = this.windowHigh - this.windowWidth / 2;
      const half = this.windowWidth / 2;
      const normDist = half > 0 ? Math.min(1, Math.abs(d - center) / half) : 0;
      quality = 0.5 + 0.5 * (1 - normDist);
      const word = quality >= 0.9 ? 'Perfect pull!' : quality >= 0.7 ? 'Great pull.' : 'Good pull.';
      this._commit(quality, `${word}  (quality ${quality.toFixed(2)})`, COLOR.grass);
    }
  }

  // An arrow answers the active cue. Ignored when no cue is up (arrows never
  // touch the bar or the pull).
  answerCue(key) {
    if (this.completed || this.startTime === null) return;
    const cue = this.activeCue;
    if (!cue) return;
    // If the window has frozen (the marker is committing), the cue can no longer move
    // anything — resolve it silently so feedback never decouples from a no-op resize.
    // Normally unreachable: the freeze is gated to not trip while a cue is active (see
    // update), so an in-flight tend always applies its effect first — but guard anyway.
    if (this.windowFrozen) { this._resolveCue(cue); return; }
    const c = this.config.cues;
    const elapsed = this.scene.time.now - cue.activatedAt;
    const correct = KEY_TO_VERB[key] === cue.verb;
    if (correct) {
      let gain = c.widthReward;
      // A PROMPT read (answered early in the generous window) earns a little extra —
      // the base reward still spans the full response window, so this rewards reading
      // the cue cleanly, not hitting a blind mid-window instant.
      const prompt = elapsed <= c.responseWindowMs * 0.33;
      if (prompt) gain += c.precisionBonus;
      this._resizeWindow(gain);
      this._cueFeedback(prompt ? 'perfect' : 'good');
    } else {
      this._resizeWindow(-c.widthPenalty);
      this._cueFeedback('miss');
    }
    this._resolveCue(cue);
  }

  // Mark a cue done (answered or timed out) and record the doneness for verification.
  _resolveCue(cue) {
    cue.state = 'resolved';
    this.maxCueResolveDoneness = Math.max(this.maxCueResolveDoneness, this.doneness);
    this.activeCue = null;
    this._setCueText('');
  }

  _resizeWindow(delta) {
    if (this.windowFrozen) return; // the window is locked once the marker is committing
    const w = this.config.window;
    this.windowWidth = Math.max(w.floor, Math.min(w.ceil, this.windowWidth + delta));
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

    // Constant one-way fill. No heat input, ever.
    this.doneness = clamp01(this.doneness + c.doneRatePerSec * dt);

    // Freeze the window once the marker nears the (current) low edge — but only when
    // no cue is mid-answer, so an in-flight tend always gets to apply its resize
    // first. After freezing, resizes are no-ops and no new cue activates, so the
    // window is locked before the marker commits and no cue resolves inside it.
    if (!this.windowFrozen && !this.activeCue) {
      const windowLow = this.windowHigh - this.windowWidth;
      if (this.doneness >= windowLow - this.freezeLead) this.windowFrozen = true;
    }

    // Cue lifecycle: activate the next pending cue when the marker reaches it (never
    // once frozen); time out an unanswered active cue after its (fixed, generous)
    // response window.
    if (this.activeCue) {
      if (now - this.activeCue.activatedAt >= c.cues.responseWindowMs) {
        if (!this.windowFrozen) { // a frozen window can't be penalised — and no phantom miss
          this._resizeWindow(-c.cues.widthPenalty); // missed tend
          this._cueFeedback('miss');
        }
        this._resolveCue(this.activeCue);
      }
    } else if (!this.windowFrozen) {
      const next = this.cueQueue.find((q) => q.state === 'pending');
      if (next && this.doneness >= next.at) {
        next.state = 'active';
        next.activatedAt = now;
        this.activeCue = next;
        this._showCue(next);
      }
    }

    // Overshoot: climbed past the burn point with no pull → burnt (floor salvage).
    if (this.doneness >= this.burnAt && !this.pulled) {
      return this._burn('It climbed past the window — burnt, but edible.');
    }

    this._layout();
  }

  _commit(quality, statusText, color) {
    this.quality = quality;
    this.judgments = judgmentsFor(quality);
    this.completed = true;
    this.burned = false;
    this._setCueText('');
    this._setStatus(statusText, color);
    this.scene.time.delayedCall(450, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _burn(statusText) {
    this.quality = BURN_QUALITY;
    this.judgments = judgmentsFor(BURN_QUALITY);
    this.completed = true;
    this.burned = true;
    this._setCueText('');
    this._setStatus(statusText, COLOR.danger);
    this._popFeedback('wild');
    this.scene.time.delayedCall(700, () => { this._cleanup(); this.onComplete?.(this.judgments); });
  }

  _showCue(cue) {
    const c = this.config.cues;
    if (c.visualOnly) { this._setCueText(''); return; } // art tell only (high tier)
    const label = VERB_LABEL[cue.verb] ?? cue.verb.toUpperCase();
    this._setCueText(c.showKeyHint ? `${label}!   (${VERB_KEYHINT[cue.verb]})` : `${label}!`);
  }

  _setCueText(text) {
    this.cueText?.setText(text);
  }

  _cueFeedback(kind) {
    this._popFeedback(kind);
  }

  _popFeedback(kind) {
    if (!this.fbPos) return;
    popFeedback(this.scene, this.fbPos.x, this.fbPos.y, kind);
  }

  _setStatus(text, color) {
    this.statusText?.setText(text).setColor(color ?? COLOR.muted);
  }

  _layout() {
    this.doneText.setText(`Doneness  ${Math.round(this.doneness * 100)}%`);

    const windowLow = this.windowHigh - this.windowWidth;
    const center = this.windowHigh - this.windowWidth / 2;
    const inWindow = this.doneness >= windowLow && this.doneness <= this.windowHigh;
    const past = this.doneness > this.windowHigh;

    this.doneBar.setValue(this.doneness);
    this.windowTrack
      .setBand(center, this.windowWidth / 2)
      .setBandTint(inWindow ? JUDGE.held : JUDGE.good)
      .setMarker(this.doneness)
      .setMarkerTint(past ? JUDGE.danger : inWindow ? JUDGE.held : null);
  }

  _cleanup() {
    [this.doneText, this.cueText, this.statusText].forEach((g) => g?.destroy());
    [this.doneBar, this.windowTrack].forEach((w) => w?.destroy());
  }
}

// Express a continuous pull quality (0..1) as a short judgments array whose mean
// reproduces it through the shared computeQualityScore (mean of perfect=1 / good=
// 0.5 / miss=0) — so the single decisive pull feeds the same quality→tier→XP
// pipeline as every other activity, unchanged. Greedy to eighths.
function judgmentsFor(quality) {
  const N = 4;
  const out = [];
  let remaining = clamp01(quality) * N;
  for (let i = 0; i < N; i++) {
    if (remaining >= 0.75) { out.push('perfect'); remaining -= 1; }
    else if (remaining >= 0.25) { out.push('good'); remaining -= 0.5; }
    else out.push('miss');
  }
  return out;
}
