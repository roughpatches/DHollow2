// Which activities have an engine behind them, and what playing one was worth.
//
// An encounter names an `activity` in content/encounters.js. If there is an engine for
// that name here, the node stops and hands the player the controls; if there is not, the
// node says the name and pays out as it always did. That is the whole of the contract,
// so importing the next StarScape engine is a line in the table below.

import { TUNING } from '../tuning.js';
import { FellEngine } from './minigames/FellEngine.js';
import { FishEngine } from './minigames/FishEngine.js';
import { QuarryEngine } from './minigames/QuarryEngine.js';
import { MealEngine } from './minigames/MealEngine.js';
import { MineEngine } from './minigames/MineEngine.js';
import { TensionBarEngine } from './minigames/TensionBarEngine.js';

// The crawl presses and releases in the axe's names, because that is what it had first.
// A continuous hold answers to setHolding instead, so it is wrapped here rather than
// given a special case in the scene — the same translation FishEngine makes for its reel.
class Held {
  constructor(engine) {
    this.engine = engine;
  }

  start(onComplete) {
    this.engine.start(onComplete);
  }

  update(now) {
    this.engine.update(now);
  }

  chargeStart() {
    this.engine.setHolding(true);
  }

  strike() {
    this.engine.setHolding(false);
  }

  setSide() {} // a hold has no sides

  get failed() {
    return this.engine.failed;
  }

  get judgments() {
    return this.engine.judgments;
  }
}

const ENGINES = {
  Felling: {
    make: (scene, layout) => new FellEngine(scene, { ...TUNING.fell, layout }),
    // what the player is holding while they do it, said on the screen
    hint: '[Hold Space] Swing    [Left/Right] Face or back cut',
  },
  Casting: {
    make: (scene, layout) => new FishEngine(scene, { ...TUNING.fish, layout }),
    // one key does all three phases; each of them says on screen what it wants of it
    hint: '[Hold Space] Cast, and hold the line    [Space] Set the hook',
  },
  Mining: {
    make: (scene, layout) => new QuarryEngine(scene, { ...TUNING.quarry, layout }),
    hint: '[Space] Take a sounding    [Hold Space] Swing    [Left/Right] Shallow or deep',
  },
  Cooking: {
    make: (scene, layout) => new MealEngine(scene, { ...TUNING.meal, layout }),
    hint: '[Space] Cut, and pull it off the fire    [Arrows] Tend it',
  },

  // --- and what a blow in a fight is ------------------------------------------
  // The same engines, in the numbers a single blow needs: an axe swing that fells its
  // tree in one, a pick blow that breaks the face in one, and a hold short enough to be
  // one turn of covering up. A move in content/foes.js names one of these, and how well
  // it is played is the whole of what the blow does — see src/combat.js.
  Swing: {
    make: (scene, layout) => new FellEngine(scene, { ...TUNING.fell, ...TUNING.combat.swing, layout }),
    hint: '[Hold Space] Swing    [Left/Right] Come in high or low',
  },
  Drive: {
    make: (scene, layout) => new MineEngine(scene, { ...TUNING.quarry.mine, ...TUNING.combat.drive, layout }),
    hint: '[Hold Space] Drive it in    [Left/Right] Short or all the way through',
  },
  Cover: {
    make: (scene, layout) => new Held(
      new TensionBarEngine(scene, { ...TUNING.fish.reel, ...TUNING.combat.cover, layout }),
    ),
    hint: '[Hold Space] Keep it covered',
  },
};

export function hasEngine(name) {
  return !!(name && ENGINES[name]);
}

export function engineFor(name, scene, layout) {
  return ENGINES[name].make(scene, layout);
}

export function hintFor(name) {
  return ENGINES[name]?.hint || '';
}

// Every judgment an engine handed back, averaged into one 0..1. What each judgment is
// worth is in tuning.js; an engine that returned nothing counts as the floor rather
// than as nothing, because a node nobody swung at is not a node they did well.
export function qualityOf(judgments) {
  if (!judgments || !judgments.length) return 0;
  const worth = TUNING.activityWorth;
  const total = judgments.reduce((n, j) => n + (worth[j] ?? worth.miss), 0);
  return total / judgments.length;
}

// how it reads on the card afterwards
export function qualityLine(node) {
  if (node.quality === undefined) return null;
  if (node.failed) return 'Botched it.';
  const pct = Math.round(node.quality * 100);
  const said = node.quality >= 0.9 ? 'Clean work.'
    : node.quality >= TUNING.activityConGood ? 'Well done.'
      : node.quality >= 0.5 ? 'It came down.' : 'Hard going.';
  return `${said}  ${pct}% of what the work was worth.`;
}
