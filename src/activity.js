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
import { BrewEngine } from './minigames/BrewEngine.js';
import { GemEngine } from './minigames/GemEngine.js';
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

// Some work is harder than other work of the same kind, and where it is, the difficulty is
// written on the work rather than on the engine: a recipe names one of the tiers in
// tuning.js and that is the whole of what makes one potion or one stone harder than the
// next. An engine with `tiers` below reads it; anything arriving without one — a node on
// the road, a recipe that leaves it out — gets the first tier written.
function tierOf(name, hard) {
  const tiers = ENGINES[name] && ENGINES[name].tiers;
  return tiers ? (tiers[hard] || Object.values(tiers)[0]) : {};
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
  Brewing: {
    // `hard` is the tier and `labels` are what goes in, both off the recipe; see
    // optionsFor in src/craft.js.
    make: (scene, layout, opts) => new BrewEngine(scene, {
      ...TUNING.brew, ...tierOf('Brewing', opts.hard), labels: opts.labels, layout,
    }),
    hint: '[Space] Stop the shape inside the outline',
    tiers: TUNING.brew.tiers,
    says: (t) => `${t.shapes} shapes, ${sec(t.periodMs[0])} to ${sec(t.periodMs[1])} apiece`,
  },
  Cutting: {
    make: (scene, layout, opts) => new GemEngine(scene, {
      ...TUNING.gem, ...tierOf('Cutting', opts.hard), layout,
    }),
    hint: '[Left/Right] Round the stone    [Up/Down] Deep or shallow    [Space] Cut',
    tiers: TUNING.gem.tiers,
    says: (t) => `${t.sides} faces, ${t.cuts} cuts, ${t.deep.nodes[0]} to ${t.deep.nodes[1]} nodes a deep one`,
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

const sec = (ms) => `${Math.round(ms / 100) / 10}s`;

export function hasEngine(name) {
  return !!(name && ENGINES[name]);
}

// `opts` is whatever the work itself has to say about how it is played — a brew's tier and
// its ingredients. Work that has nothing to say passes nothing, which is every node on the
// road: an engine reached from the crawl is the same engine at the same difficulty.
export function engineFor(name, scene, layout, opts = {}) {
  return ENGINES[name].make(scene, layout, opts);
}

export function hintFor(name) {
  return ENGINES[name]?.hint || '';
}

// What a tier amounts to, in the one sentence a bench puts in front of the player before
// they commit the materials. Work with no tiers says nothing, which is most of it.
export function hardLine(name, hard) {
  const e = ENGINES[name];
  if (!e || !e.says || !hard) return '';
  return `${hard} — ${e.says(tierOf(name, hard))}`;
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
