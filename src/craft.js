// Making something at a workstation. content/recipes.js says what can be made; this says
// whether it can be made now, takes what it costs, and hands back what came of it.
//
// A recipe is gated on two things and they are deliberately different things: how far the
// town has rebuilt the workstation, and how far the player has levelled. One is what
// everybody's runs paid for, the other is what this character is. Neither buys the other.

import { TUNING } from '../tuning.js';
import { RECIPES } from '../content/recipes.js';
import { MATERIALS } from '../content/materials.js';
import { SKILLS } from '../content/skills.js';
import {
  award, levelOf as levelYou, rankOf, skillOf, YOU,
} from './party.js';
import {
  buildingOf, levelOf as stageAt, give, heldOf, nameOf, remaining,
} from './town.js';
import { hasEngine, qualityOf, hardLine } from './activity.js';
import {
  cut, gemOf, validate, fullName, worthLine,
} from './charm.js';

const MATERIAL = new Set(MATERIALS.map((m) => m.id));
// and the stones are checked against the same list, from the other end
validate(MATERIAL);
const SKILL = new Set(SKILLS.map((t) => t.id));

// Content mistakes are said at boot rather than found later in a recipe nobody can reach:
// a bench that is not a building, a stage that never crafts, a material off the list, or a
// skill left behind by a rewrite of content/skills.js.
for (const r of RECIPES) {
  const b = buildingOf(r.at);
  if (!b) console.warn(`${r.name}: no such building — ${r.at}`);
  else if (!(b.stages[r.stage] || {}).craft) console.warn(`${r.name}: ${b.name} does not craft at stage ${r.stage}.`);
  if (!SKILL.has(r.skill)) console.warn(`${r.name}: no such skill — ${r.skill}`);
  if (!r.makes === !r.cuts) console.warn(`${r.name}: wants exactly one of makes and cuts.`);
  if (r.cuts && !gemOf(r.cuts)) console.warn(`${r.name}: no such gem — ${r.cuts}`);
  for (const m of [...Object.keys(r.costs), ...Object.keys(r.makes || {})]) {
    if (!MATERIAL.has(m)) console.warn(`${r.name}: no such material — ${m}`);
  }
}

// Whether standing at this building hands the player a bench at all. It is the stage and
// nothing else: a workstation is a building far enough rebuilt to work in.
export function worksAt(id) {
  const b = buildingOf(id);
  return !!(b && (b.stages[stageAt(id)] || {}).craft);
}

// Everything this bench could ever make, in the order it is written — including what the
// building is not rebuilt enough for and what the player is not levelled enough for,
// because a list of what you cannot do yet is the only thing that says what to go and do.
export function recipesAt(id) {
  return RECIPES.filter((r) => r.at === id);
}

// What is standing between the player and this recipe, one line each and nothing if it can
// be made. The order is the order they are fixed in: rebuild the bench, level the
// character, learn the work, then go and dig up what it takes.
export function blockers(r) {
  const out = [];
  const b = buildingOf(r.at);
  if (stageAt(r.at) < r.stage) out.push(`Wants ${b.name} rebuilt to ${b.stages[r.stage].name}.`);
  if (levelYou(YOU) < r.level) out.push(`Wants level ${r.level}; you are ${levelYou(YOU)}.`);
  const want = r.rank || 0;
  if (rankOf(YOU, r.skill) < want) {
    out.push(`Wants ${want} point${want === 1 ? '' : 's'} of ${skillOf(r.skill).name}; you have ${rankOf(YOU, r.skill)}.`);
  }
  const short = Object.entries(r.costs).filter(([m, n]) => heldOf(m) < n);
  if (short.length) {
    out.push(`Short of ${short.map(([m, n]) => `${n - heldOf(m)} ${nameOf(m)}`).join(', ')}.`);
  }
  return out;
}

export function canMake(r) {
  return blockers(r).length === 0;
}

// Whether anything in the pack is wanted toward the stage above this bench's. A stage can
// be part-paid, here as at any door in town, so this asks for one of anything rather than
// for the whole cost.
export function canPay(id) {
  const rem = remaining(id);
  return !!rem && Object.entries(rem).some(([m, n]) => n > 0 && heldOf(m) > 0);
}

// What the player's points are worth at this bench: the same skillYieldPerPoint every
// gathering node pays, because it is the same question — how much comes off the work.
export function moreOf(r) {
  return rankOf(YOU, r.skill) * TUNING.skillYieldPerPoint;
}

// Whether making this hands over the controls, or is simply done. A recipe naming work
// with no engine yet is made on the spot, the way a node with no engine pays out.
export function playedAt(r) {
  return hasEngine(r.activity);
}

// What the recipe itself has to say about how it is played: how hard it is, and what goes
// in. Only the pot reads either at the moment — a brew is a shape an ingredient at a time —
// and an engine that wants neither is handed both and ignores them.
export function optionsFor(r) {
  return { hard: r.hard, labels: Object.keys(r.costs).map((m) => nameOf(m)) };
}

// Make it. `played` is what an engine handed back — { judgments, failed } — or null for
// work there is no engine for. The costs are already gone by then: they are taken here,
// before anything is played, because a botched smelt is ore lost and not ore returned.
export function make(r, played) {
  if (!canMake(r)) return null;
  for (const [m, n] of Object.entries(r.costs)) give(m, -n);

  const quality = !played ? null : (played.failed ? 0 : qualityOf(played.judgments));
  // The same arithmetic a node's yield gets: a botched job keeps a quarter of it, and
  // anything else keeps the floor plus however well it went.
  const worth = !played ? 1
    : played.failed ? TUNING.activityFailKeep
      : TUNING.activityKeepFloor + (1 - TUNING.activityKeepFloor) * quality;
  const take = (1 + moreOf(r)) * worth;

  // A cut is one stone whatever anybody's points are: what the work decides is the grade,
  // and the grade is the wheel's own reading of it and nothing else's.
  const stone = r.cuts ? cut(r.cuts, quality ?? 0) : null;

  const made = {};
  for (const [m, n] of Object.entries(r.makes || {})) {
    const got = Math.round(n * take);
    if (got > 0) {
      made[m] = got;
      give(m, got);
    }
  }
  const xp = Math.round(r.xp * worth);
  // Crafting is the player's own work and nobody else's: they are the one standing at the
  // bench, so the experience is theirs and so are the points it comes to.
  return {
    made, stone, xp, quality, failed: !!(played && played.failed), levels: award(YOU, xp),
  };
}

// --- text -----------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function list(pairs) {
  return pairs.map(([m, n]) => `${n} ${nameOf(m)}`).join(', ');
}

// what a recipe costs and pays, with what the player's points add to the paying
export function recipeLines(r) {
  const more = moreOf(r);
  const hard = hardLine(r.activity, r.hard);
  const gem = r.cuts && gemOf(r.cuts);
  const out = [
    `Takes: ${list(Object.entries(r.costs))}.`,
    gem
      // Points do not make a bigger stone, so the line says what the stone is worth at
      // each grade instead: the whole of what a cut is for is which of the three it is.
      ? `Makes: one ${gem.name}, ${TUNING.gem.grades.map((g) => `${g.name} ${worthLine(gem, g)}`).join(' / ')}.`
      : `Makes: ${list(Object.entries(r.makes))}${more ? `, and ${Math.round(more * 100)}% more for your ${skillOf(r.skill).name}` : ''}.`,
    playedAt(r)
      ? `${r.activity}${hard ? `, ${hard}` : ''}. Worth ${r.xp} to your level, and worth doing well.`
      : `${r.activity} — worth ${r.xp} to your level. Waiting on that engine; for now it is simply done.`,
  ];
  const stop = blockers(r);
  out.push(stop.length ? stop.join('  ') : 'Ready. [Enter] to make it.');
  return out;
}

// and how it came out, once it is out
export function madeLines(r, result) {
  const out = [];
  if (result.failed) out.push('Botched it.');
  else if (result.quality !== null) out.push(`${Math.round(result.quality * 100)}% of what the work was worth.`);
  if (result.stone) {
    out.push(`${fullName(result.stone.gem, result.stone.grade)}. ${worthLine(result.stone.gem, result.stone.grade)} while it is worn.`);
  }
  const got = Object.entries(result.made);
  if (got.length) out.push(`You have ${list(got)}.`);
  else if (!result.stone) out.push('Nothing came off the bench worth carrying.');
  out.push(`${result.xp} toward your level.`);
  if (result.levels) {
    out.push(`Level ${levelYou(YOU)}. ${result.levels * TUNING.skillPointsPerLevel} points to spend.`);
  }
  return out;
}
