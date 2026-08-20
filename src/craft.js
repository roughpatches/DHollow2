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
  award, atCap, levelOf as levelYou, rankOf, skillOf, YOU,
} from './party.js';
import {
  buildingOf, levelOf as stageAt, give, heldOf, nameOf, remaining, levelCap, capHeldBy,
} from './town.js';
import {
  hasEngine, qualityOf, hardLine, firedWork,
} from './activity.js';
import { lay, burnSeconds, layLine } from './fuel.js';
import {
  cut, gemOf, validate, fullName, worthLine,
} from './charm.js';
import {
  forge, pieceOf, fullName as gearName, worthLine as gearWorth, slotName, socketLine,
} from './gear.js';

// Where a bench spends from and pays into. A fire on the road spends the pack the party
// carried out instead, and hands its own in — see the camp section of src/run.js. Nothing
// else about making a thing changes with the store.
const SHELF = { heldOf, give };

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
  // Three ways for a bench to pay and never two at once: a count of materials, a graded
  // stone off the wheel, or a graded piece off the anvil.
  const pays = [r.makes, r.cuts, r.forges].filter(Boolean).length;
  if (pays !== 1) console.warn(`${r.name}: wants exactly one of makes, cuts and forges.`);
  if (r.cuts && !gemOf(r.cuts)) console.warn(`${r.name}: no such gem — ${r.cuts}`);
  if (r.forges && !pieceOf(r.forges)) console.warn(`${r.name}: no such gear — ${r.forges}`);
  for (const m of [...Object.keys(r.costs), ...Object.keys(r.makes || {})]) {
    if (!MATERIAL.has(m)) console.warn(`${r.name}: no such material — ${m}`);
  }
  // Work over a fire with no fuel written is work with no clock on it, which is the one
  // way a fired recipe can be wrong and still run.
  if (firedWork(r.activity) && !r.fuel) console.warn(`${r.name}: ${r.activity} is done over a fire and wants a fuel.`);
  if (r.fuel && !firedWork(r.activity)) console.warn(`${r.name}: ${r.activity} is not done over a fire, so its fuel is never burnt.`);
  // A camp is a fire and nothing else. Work that is not done over one could not be done
  // at a camp whatever the recipe says, and a stone cannot be cut by firelight.
  if (r.fire && !firedWork(r.activity)) console.warn(`${r.name}: ${r.activity} is not done over a fire, so it cannot be made at a camp.`);
  if (r.fire && r.cuts) console.warn(`${r.name}: a camp grades nothing; drop its fire.`);
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
  if (levelYou(YOU) < r.level) {
    out.push(`Wants level ${r.level}; you are ${levelYou(YOU)}.`);
    // and where the town is what is stopping the levelling rather than the walking, say so:
    // no amount of work in the wood answers a cap.
    const held = capHeldBy();
    if (r.level > levelCap() && held) out.push(`Nobody passes level ${levelCap()} until ${held.name} is rebuilt.`);
  }
  const want = r.rank || 0;
  if (rankOf(YOU, r.skill) < want) {
    out.push(`Wants ${want} point${want === 1 ? '' : 's'} of ${skillOf(r.skill).name}; you have ${rankOf(YOU, r.skill)}.`);
  }
  const short = Object.entries(r.costs).filter(([m, n]) => heldOf(m) < n);
  if (short.length) {
    out.push(`Short of ${short.map(([m, n]) => `${n - heldOf(m)} ${nameOf(m)}`).join(', ')}.`);
  }
  // The fire is the last of it and the plainest: work done over heat wants something to
  // burn, and nothing in the pack burns hot enough or long enough for this one.
  if (fuelFor(r) && layFor(r).short) out.push('Nothing left in the pack will hold a fire that long.');
  return out;
}

// How much fuel this work wants. Written on the recipe, because how long a job takes is a
// thing about the job: a clamp is an afternoon and a furnace run is a day.
// Work that is not done over a fire wants none, whatever the recipe says.
export function fuelFor(r) {
  return firedWork(r.activity) ? (r.fuel || 0) : 0;
}

// And what would go on that fire, out of what is carried and is not already spent on the
// recipe itself. Asked three times over — by the bench before it will offer the work, by
// the engine to know how long it has, and by the making to take it — and it answers the
// same every time, because nothing touches the pack in between.
export function layFor(r) {
  return lay(fuelFor(r), r.costs);
}

export function canMake(r) {
  return blockers(r).length === 0;
}

// The same recipe, at a fire on the road. Three things are different and nothing else is:
// what is spent is the pack rather than the town's shelves; there is no building out there
// to be rebuilt, because a fire is a fire; and nothing is burnt, because the fire is
// already lit and there is no clock on it. The character still has to be levelled and
// still has to know the work — sitting down beside a fire teaches nobody anything.
export function campBlockers(r, store) {
  const out = [];
  if (levelYou(YOU) < r.level) out.push(`Wants level ${r.level}; you are ${levelYou(YOU)}.`);
  const want = r.rank || 0;
  if (rankOf(YOU, r.skill) < want) {
    out.push(`Wants ${want} point${want === 1 ? '' : 's'} of ${skillOf(r.skill).name}; you have ${rankOf(YOU, r.skill)}.`);
  }
  const short = Object.entries(r.costs).filter(([m, n]) => store.heldOf(m) < n);
  if (short.length) {
    out.push(`Short of ${short.map(([m, n]) => `${n - store.heldOf(m)} ${nameOf(m)}`).join(', ')}.`);
  }
  return out;
}

// Whether it can be cooked here and now. `fire` on the recipe is the first half of it and
// content's half: an oven and a smokehouse are not a campfire.
export function canCook(r, store) {
  return !!r.fire && campBlockers(r, store).length === 0;
}

// What the fire says about a dish before the pan goes on. Shorter than a bench's account
// because there is nothing to decide out there: what it takes, what it makes, and what
// eating it is worth, which is the only reason anybody is cooking on a road.
export function cookLines(r, store) {
  const more = moreOf(r);
  const dish = MATERIALS.find((m) => m.id === Object.keys(r.makes)[0]);
  const eat = (dish || {}).eat;
  return [
    `${list(Object.entries(r.costs))} — ${list(Object.entries(r.makes))}${more ? ` and ${Math.round(more * 100)}% more for your points` : ''}.`,
    eat ? `${eat.con || 0} constitution and ${eat.hp || 0} hit points a helping.` : '',
    `Worth ${r.xp} to your level, and worth doing well.`,
    ...campBlockers(r, store),
  ].filter(Boolean);
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
  const want = fuelFor(r);
  return {
    hard: r.hard,
    labels: Object.keys(r.costs).map((m) => nameOf(m)),
    // How long the fire under it is alight for. Nought is work that is not over a fire,
    // and src/activity.js hands that engine over bare.
    burnSeconds: want ? burnSeconds(layFor(r).worth) : 0,
  };
}

// Make it. `played` is what an engine handed back — { judgments, failed } — or null for
// work there is no engine for. The costs are already gone by then: they are taken here,
// before anything is played, because a botched smelt is ore lost and not ore returned.
export function make(r, played, opts = {}) {
  // A store passed in is a fire on the road: it is spent and paid instead of the town's
  // shelves, and there is nothing under it to burn.
  const store = opts.store || SHELF;
  const camp = !!opts.store;
  if (camp ? !canCook(r, store) : !canMake(r)) return null;
  // The fire is laid before the pot is charged, so what is burnt is what the bench quoted
  // and not what is left after the ingredients have gone. Both go whether the work came
  // off or not: wood burnt is wood burnt. A camp burns nothing — it was already alight.
  const burnt = !camp && fuelFor(r) ? layFor(r).take : [];
  for (const [m, n] of Object.entries(r.costs)) store.give(m, -n);
  for (const [m, n] of burnt) give(m, -n);

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
  // And a forge is one piece, on the same bargain — except that the anvil is the one
  // bench with a hard fail in it. A piece cracked under the hammer is no piece: the metal
  // is in two halves on the floor and the bars that went into it are gone, which is what
  // makes the soundness bar worth watching. Everything short of that is a piece, and how
  // well the work went decides which grade of it.
  const cracked = !!(played && played.failed);
  const piece = r.forges && !cracked ? forge(r.forges, quality ?? 0) : null;

  const made = {};
  for (const [m, n] of Object.entries(r.makes || {})) {
    const got = Math.round(n * take);
    if (got > 0) {
      made[m] = got;
      store.give(m, got);
    }
  }
  const xp = Math.round(r.xp * worth);
  // Crafting is the player's own work and nobody else's: they are the one standing at the
  // bench, so the experience is theirs and so are the points it comes to.
  return {
    made, stone, piece, cracked: cracked && !!r.forges, xp, quality, burnt,
    failed: cracked, levels: award(YOU, xp),
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
  const kit = r.forges && pieceOf(r.forges);
  const fire = fuelFor(r) ? layLine(fuelFor(r), layFor(r)) : null;
  const out = [
    `Takes: ${list(Object.entries(r.costs))}.`,
    gem
      // Points do not make a bigger stone, so the line says what the stone is worth at
      // each grade instead: the whole of what a cut is for is which of the three it is.
      ? `Makes: one ${gem.name}, ${TUNING.gem.grades.map((g) => `${g.name} ${worthLine(gem, g)}`).join(' / ')}.`
      : kit
        // The same for a piece off the anvil, and for the same reason: one comes off it
        // however good the smith is, and how good the smith is decides which one. Except
        // where it does not: jewellery is settings and nothing else, and a setting is a
        // setting at any standard, so its line is said once rather than three times over.
        ? (kit.sockets
          ? `Makes: one ${kit.name} — ${kit.sockets} setting${kit.sockets === 1 ? '' : 's'}, `
            + 'whatever it comes off the anvil like.'
          : `Makes: one ${kit.name} for the ${slotName(kit.slot).toLowerCase()}, `
            + `${TUNING.gear.grades.map((g) => `${g.name} ${gearWorth(kit, g)}`).join(' / ')}`
            + `. At ${TUNING.gear.grades[0].name.toLowerCase()} it also takes a stone.`)
        : `Makes: ${list(Object.entries(r.makes))}${more ? `, and ${Math.round(more * 100)}% more for your ${skillOf(r.skill).name}` : ''}.`,
    playedAt(r)
      ? `${r.activity}${hard ? `, ${hard}` : ''}. Worth ${r.xp} to your level, and worth doing well.`
      : `${r.activity} — worth ${r.xp} to your level. Waiting on that engine; for now it is simply done.`,
  ];
  if (fire) out.splice(1, 0, fire);
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
  if (result.piece) {
    const w = result.piece;
    const holds = w.sockets.length
      ? ` ${w.sockets.length} setting${w.sockets.length === 1 ? '' : 's'} in it: ${socketLine(w)}.`
      : '';
    out.push(`${gearName(w.piece, w.grade)}. ${gearWorth(w.piece, w.grade)} while it is on,`
      + `${holds} It goes on at the gate.`);
  } else if (result.cracked) {
    out.push('It cracked. There is nothing on the anvil and the metal is gone with it.');
  }
  // What went under it is said whichever way it went: a fire that was lit is wood that is
  // gone, and a job lost to one is the player being told what it cost them.
  if (result.burnt.length) out.push(`Burnt: ${list(result.burnt)}.`);
  const got = Object.entries(result.made);
  // A cut says what came off the wheel above this, so a bench that made only a stone is
  // not also told it made nothing.
  if (got.length) out.push(`You have ${list(got)}.`);
  else if (!result.stone && !result.piece && !result.cracked) out.push('Nothing came off the bench worth carrying.');
  // Work done at the cap pays what it pays in materials and nothing to the level, and is
  // said so here rather than left to be noticed on the crew screen.
  const held = capHeldBy();
  out.push(atCap(YOU) && held
    ? `Worth ${result.xp} to your level, and nothing counts until ${held.name} is rebuilt.`
    : `${result.xp} toward your level.`);
  if (result.levels) {
    out.push(`Level ${levelYou(YOU)}. ${result.levels * TUNING.skillPointsPerLevel} points to spend.`);
  }
  return out;
}
