// One quest, being walked. The nodes between the Sea Hag and the goal are drawn fresh
// every time a quest is accepted, so accepting the same job twice is not the same run.
//
// A run is a line, and some of its nodes are reached by a fork instead of walked into.
// A fork offers two or three ways on and each way is a node: whoever can read that
// ground says what is down there, and taking it is taking that. Which nodes can be
// drawn at all is the zone, the hour and nothing else — see content/nodes.js.

import { TUNING } from '../tuning.js';
import { QUESTS } from '../content/quests.js';
import { PLACES } from '../content/places.js';
import { ENCOUNTERS } from '../content/encounters.js';
import { SKILLS } from '../content/skills.js';
import { DRAWN_KINDS } from './nodes.js';
import {
  roster, charOf, award, levelOf, raiseBond, conOf, conTotal, combatOf,
  rankOf, scoreOf, check, bestAt, skillOf, skillForActivity, walking, fighters, YOU,
  nameOf as whoIs, // town.js has a nameOf of its own, for materials
  carryTotal,
} from './party.js';
import { give, nameOf, heldOf } from './town.js';
import * as potions from './potions.js';
import * as food from './food.js';
import { RECIPES } from '../content/recipes.js';
import {
  canCook, cookLines, make as makeAt, playedAt,
} from './craft.js';
import {
  packedStones, packedKeys, packedTotal, drop as dropStone, clearPack,
  cycle as cycleCord, fullName as stoneName, worn,
} from './charm.js';
import * as story from './story.js';
import { asked } from './recruit.js';
import { hasEngine, qualityOf } from './activity.js';
import {
  begin, take, swapTo, stepIn, flee, canFlee, muster, hurtOf, spoilsOf, saidCount, foeOf,
  MOVES,
} from './combat.js';

// Everything a node can turn out to be: the ones a quest names by hand, and the ones the
// road draws. They are one shape and one lookup, so nothing downstream has to know which
// table a node came out of.
const KINDS = [...ENCOUNTERS, ...DRAWN_KINDS];
const KIND = Object.fromEntries(KINDS.map((e) => [e.id, e]));
// The zones a job can be walked in. Only a place a job sets out from needs an id.
const ZONE = Object.fromEntries(PLACES.filter((p) => p.id).map((p) => [p.id, p]));

// every skill a node names, wherever it names one
function skillsIn(e) {
  return [
    e.harvest,
    e.read && e.read.skill,
    e.check && e.check.skill,
    ...(e.harvests || []).map((h) => h.skill),
    ...(e.beats || []).flatMap((b) => (b.choose || []).map((o) => o.skill)),
  ].filter(Boolean);
}

// A node belongs somewhere twice over: it has to list the zone, and everything it asks of
// the party has to be on what that zone is made of. A place's `skills` list is how a
// Greywood full of timber and talk is told apart from a coast full of tide and rigging —
// the nodes are all written, and the place picks which of them are its. A zone with no
// list draws everything, and so does a run with no zone at all: a job handed over a bar
// rather than set out for has no ground to tell it otherwise.
function inZone(e, where) {
  if (!where) return true;
  if (e.zones && !e.zones.includes(where)) return false;
  const allowed = ZONE[where] && ZONE[where].skills;
  return !allowed || skillsIn(e).every((id) => allowed.includes(id));
}

// Nothing is fought by daylight. What comes out of the ground and what follows a party
// home only does either after dark, so a day run draws from the table with the combat
// kinds taken out of it and a night run draws from the whole of it.
// An authored kind is only ever reached by a quest naming it, so it is out of the table
// the road draws from whatever the hour is.
function poolAt(when, where) {
  return KINDS.filter((e) => !e.only && (when === 'night' || e.nature !== 'combat') && inZone(e, where));
}

// What the road may still put up. Two rules, and both of them are about not repeating
// yourself: never the kind they have just finished with, so the same stand of timber is
// not standing there again a hundred yards on, and never a kind marked `once` that this
// run has already had, so a party meets bad ground once a job and not four times.
// If the two of them between them leave nothing, the rules are dropped for that draw
// rather than the run stopping in the middle of the wood.
function drawableAt(when, where) {
  const pool = poolAt(when, where);
  const last = run && run.at > 0 ? run.nodes[run.at - 1].kind : null;
  const free = pool.filter((e) => e.id !== last && !(e.once && run.used.has(e.id)));
  return free.length ? free : pool;
}

function readableAt(when, where) {
  return drawableAt(when, where).filter((e) => e.read);
}

// A table naming a skill the list does not have, usually one left behind by a rewrite of
// content/skills.js. It rolls the die on its own until it is pointed at something real,
// so the run still walks; this is where the mistake is said out loud.
const SKILL_IDS = new Set(SKILLS.map((s) => s.id));
// The work a resource node is made of comes off the gathering half of content/skills.js
// and nowhere else: that is what separates a resource node from an encounter node, whose
// ways may name anything. Said here because it is a content mistake, not a crash.
const GATHERING = new Set(SKILLS.filter((s) => s.group === 'gathering').map((s) => s.id));
for (const e of KINDS) {
  for (const h of e.harvests || []) {
    if (!GATHERING.has(h.skill)) console.warn(`${e.name}: ${h.skill} is not a gathering skill.`);
  }
}
for (const e of KINDS) {
  for (const id of skillsIn(e)) {
    if (!SKILL_IDS.has(id)) console.warn(`${e.name}: no such skill — ${id}`);
  }
}
// and a zone naming one, usually left behind by a rewrite of content/skills.js
for (const z of PLACES.filter((p) => p.skills)) {
  for (const id of z.skills) {
    if (!SKILL_IDS.has(id)) console.warn(`${z.label}: no such skill — ${id}`);
  }
}
// A zone's shares and a zone's skills have to be the same list of gathering work, or one
// of them is a share of nothing and the other is work that never comes up.
for (const z of PLACES.filter((p) => p.gather)) {
  const wanted = (z.skills || [...GATHERING]).filter((id) => GATHERING.has(id));
  for (const id of Object.keys(z.gather)) {
    if (!wanted.includes(id)) console.warn(`${z.label}: a share of ${id}, which is not gathered here.`);
  }
  for (const id of wanted) {
    if (!z.gather[id]) console.warn(`${z.label}: ${id} is gathered here and has no share.`);
  }
}
// The resource table is meant to be full: a node for each gathering skill on its own, and
// a node for each pairing of two. That is what makes a point in any of them buy work
// nobody else can reach and a second specialist a question rather than dead weight. Add a
// gathering skill and this is what names the nodes it still wants; see content/nodes.js.
const pairings = new Set();
for (const e of KINDS) {
  if (e.harvests) pairings.add([...new Set(e.harvests.map((h) => h.skill))].sort().join('+'));
}
const gathering = [...GATHERING];
for (const [i, a] of gathering.entries()) {
  if (!pairings.has(a)) console.warn(`No resource node is ${a} alone.`);
  for (const b of gathering.slice(i + 1)) {
    if (!pairings.has([a, b].sort().join('+'))) console.warn(`No resource node pairs ${a} with ${b}.`);
  }
}

// A combat node with nothing to fight is a node that reads as a fight and then is not
// one, and a foe nobody wrote is a fight that cannot start. Both are content mistakes and
// both are cheap to say here.
for (const e of KINDS) {
  const band = e.foes || (e.foe ? [e.foe] : []);
  for (const entry of band) {
    const id = typeof entry === 'string' ? entry : entry.id;
    if (!foeOf(id)) console.warn(`${e.name}: no such foe — ${id}`);
  }
  if (e.nature === 'combat' && !band.length) console.warn(`${e.name}: a combat node with nothing to fight.`);
}

// Four a side. A job that asks for more than that is a job that cannot be crewed, and
// this is where that is cheap to say rather than found on the screen where they are picked.
for (const q of QUESTS) {
  if (q.party > TUNING.partyMax) console.warn(`${q.label}: asks for ${q.party}; ${TUNING.partyMax} is the most that walk out.`);
}

// Somewhere to set out for has to have something to walk. A zone open for work with
// nothing drawable in it by day is an empty run, and this is where that is cheap to say.
for (const z of PLACES.filter((p) => p.work)) {
  if (!poolAt('day', z.id).length) console.warn(`${z.label}: nothing in content/nodes.js is zoned here.`);
}
for (const q of QUESTS) {
  if (q.check && !SKILL_IDS.has(q.check.skill)) console.warn(`${q.label}: no such skill — ${q.check.skill}`);
}

// The first job — the only one the story offers with nothing raised yet — is day work
// with Aldis on it. He does not fight, and a night run needs somebody who does, so the
// game cannot open on one. Said at boot rather than found later in an unwalkable board.
for (const q of QUESTS.filter((x) => !x.needs)) {
  if (q.when !== 'day') console.warn(`${q.label}: the first job must be day work.`);
  if (!(q.must || []).includes('aldis')) console.warn(`${q.label}: the first job must have Aldis on it.`);
}

// how many times each job has been walked to the end. Gregorious keeps a standing
// board rather than a story: the same job can be taken again, which is what lets a
// bond grow far enough to crew the ones nobody will touch yet.
const walked = new Map();
let run = null;

function roll([lo, hi]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// How far the party's points bend a table toward its rare end. Zero leaves the odds as
// they were written; one would make every row equally likely, and the cap keeps it well
// short of that. See skillOddsPerPoint in tuning.js.
function tiltOf(score) {
  return Math.min(TUNING.skillOddsMost, score * TUNING.skillOddsPerPoint);
}

// A node that draws its yield rather than paying a fixed list of it: `count` things come
// off it, and each one of them is drawn against the odds. Knowing the work does two
// things here — it takes more off the node, through `take`, and it bends the table, by
// raising every weight to a lower power. A weight of 50 against one of 20 falls faster
// than the 20 does, so the scarce row rises without ever passing the common one, and a
// table already even stays even. See `draw` in content/encounters.js.
function offTable(table, take, tilt) {
  const odds = Object.entries(table.odds).map(([m, w]) => [m, w ** (1 - tilt)]);
  const total = odds.reduce((n, [, w]) => n + w, 0);
  // How many things come off it, with the part of the count that falls between two
  // things left as a chance at one more rather than rounded away. A party one point
  // better than another is a party who sometimes comes back with an extra fish, which
  // is what a point ought to feel like at the low end where whole fish are scarce.
  const wanted = roll(table.count) * take;
  let count = Math.floor(wanted);
  if (Math.random() < wanted - count) count++;

  const out = {};
  for (let i = count; i > 0; i--) {
    let r = Math.random() * total;
    let hit = odds[odds.length - 1];
    for (const o of odds) {
      r -= o[1];
      if (r <= 0) { hit = o; break; }
    }
    out[hit[0]] = (out[hit[0]] || 0) + 1;
  }
  return out;
}

// A stone at the end of a shift. Not part of the yield and not multiplied by anything:
// one roll, and either there is a stone in the spoil or there is not. How well the work
// went is the whole of whether — nothing under stoneFloor, climbing to stoneBest at
// perfect — and the table it is drawn from is read on the same tilt as any other, so who
// was brought decides which stone it is. Work no engine was played for finds none: a
// stone is what a good shift turns up, and nobody had a good shift they did not have.
function stoneFrom(table, quality, tilt) {
  if (!(quality > TUNING.stoneFloor)) return null;
  const chance = TUNING.stoneBest * (quality - TUNING.stoneFloor) / (1 - TUNING.stoneFloor);
  if (Math.random() >= chance) return null;
  return Object.keys(offTable({ odds: table, count: [1, 1] }, 1, tilt))[0] || null;
}

export function questOf(id) {
  return QUESTS.find((q) => q.id === id);
}

export function kindOf(id) {
  return KIND[id];
}

export function timesWalked(id) {
  return walked.get(id) || 0;
}

// Everything known about and not set out for from somewhere else. Work does not run
// out, but it does have to be offered first.
export function offered() {
  return QUESTS.filter((q) => story.ok(q) && !q.at);
}

// every job the story has unlocked, wherever it is set out from
export function known() {
  return QUESTS.filter((q) => story.ok(q));
}

// Whether a job can be walked right now, and what is in the way if not. The reasons
// are the readout on the Map tab, so they say what to go and do about it.
export function blockers(id, when) {
  const q = questOf(id);
  const out = [];
  if (!q) return ['No such job.'];
  if (!story.ok(q)) return ['Nobody has offered this.'];
  if (q.ready && !story.has(q.ready)) out.push('Not agreed to yet.');

  const at = when || timesFor(q)[0];
  for (const cid of q.must || []) {
    const c = charOf(cid);
    if (!c) out.push('Somebody this job needs is not here.');
    else if (!roster().includes(c)) out.push(`${whoIs(cid)} is not available.`);
    else if (!asked(cid, q, at).willing) out.push(`${whoIs(cid)} will not come on this.`);
  }
  const willing = [YOU, ...roster().filter((c) => asked(c.id, q, at).willing).map((c) => c.id)];
  if (willing.length < q.party) out.push(`Needs ${q.party}; counting you, ${willing.length} will walk it.`);
  if (needsFighter(at) && !fighters(willing).length) out.push(fighterLine);
  return out;
}

// A run after dark has things on it that have to be fought, so one of the party has to
// be somebody who fights. By day there is nothing to fight and anybody can walk it.
export function needsFighter(when) {
  return when === 'night';
}

export function hasFighter(ids) {
  return fighters(ids).length > 0;
}

export const fighterLine = 'Needs somebody who can fight; nobody who will come after dark can.';

export function canStart(id, when) {
  return blockers(id, when).length === 0;
}

export function active() {
  return run;
}

// How many nodes a job is, in [least, most]. A job the player sets the length of has no
// length of its own until they have set it, so before that it is the whole span.
export function sizeOf(q, size = q && q.size) {
  return TUNING.questNodes[size]
    || [TUNING.questNodes.short[0], TUNING.questNodes.long[1]];
}

export const SIZES = ['short', 'medium', 'long'];

// every hour a job could be walked at, open or not — the rows on the hour screen
export function allTimes(q) {
  return q.when === 'any' ? ['day', 'night'] : [q.when];
}

// A job whose length and place the player picks is work off the board rather than a
// written job, and there is nothing written to walk after dark yet. A job that names
// night itself is not affected: it was written with its own nights in it.
export function timeOpen(q, when) {
  return when !== 'night' || !q.procedural || TUNING.questNightOpen;
}

// a job fixed to one time can only be walked at that time; the rest are the party's call
export function timesFor(q) {
  return allTimes(q).filter((t) => timeOpen(q, t));
}

// everywhere work off the board can be walked, in the order content/places.js lists them
export function zones() {
  return PLACES.filter((p) => p.work && p.id);
}

export function zoneOf(id) {
  return ZONE[id] || null;
}

// how much of a run here is something in the way rather than work, or null where the zone
// has not said and it falls out of the nodes' own weights
export function troubleAt(where, when) {
  const share = (ZONE[where] || {}).trouble;
  return share && share[when] !== undefined ? share[when] : null;
}

// What a run at this hour and in this place is mostly made of, so the choice is made on
// something more than the word for it. Where the zone names its share, the two sides are
// counted against that rather than against each other's weights — otherwise the readout
// would say one thing and the road would do another.
export function mixAt(when, where) {
  const pool = poolAt(when, where);
  const share = troubleAt(where, when);
  const digging = pool.filter((e) => e.harvests);
  const trouble = pool.filter((e) => !e.harvests);
  const by = {};
  const add = (list, of) => {
    const total = list.reduce((n, e) => n + e.weight[when], 0) || 1;
    for (const e of list) by[e.nature] = (by[e.nature] || 0) + (e.weight[when] / total) * of;
  };
  if (share !== null && digging.length && trouble.length) {
    add(digging, 100 - share);
    add(trouble, share);
  } else {
    for (const e of pool) by[e.nature] = (by[e.nature] || 0) + e.weight[when];
  }
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  return Object.entries(by)
    .sort((a, b) => b[1] - a[1])
    .map(([nature, n]) => `${nature} ${Math.round((n / total) * 100)}%`)
    .join('   ');
}

// --- ground ----------------------------------------------------------------
// A job is walked somewhere, and somewhere is made of something. A party carrying the
// skill that reads that ground sets out with more in them than one that does not — which
// is the whole of why you take the woodsman into the wood. A job handed out over a bar
// rather than set out for from a place has no ground yet and this is worth nothing to it.

// Where a job is walked: the place it is set out from, or the one the player chose for
// work they picked the place of.
function placeOf(q, where) {
  const id = where || (q && q.at);
  return (id && ZONE[id]) || null;
}

export function terrainOf(q, where) {
  const zone = placeOf(q, where);
  return (zone && zone.terrain) || null;
}

// the painted landscape a job is walked against, if its zone has one
export function backdropOf(q, where) {
  const zone = placeOf(q, where);
  return (zone && zone.backdrop) || null;
}

// which skills read a given ground
export function readsGround(terrain) {
  return terrain ? SKILLS.filter((t) => t.terrain === terrain) : [];
}

// and what a set of people are worth on it, in constitution
export function groundCon(ids, terrain) {
  return readsGround(terrain).reduce((n, t) => n + scoreOf(ids, t.id), 0)
    * TUNING.conPerTerrainPoint;
}

// --- starting --------------------------------------------------------------

// `choice` is what the player picked on the way in — the length and the place — for work
// off the board. A written job carries its own and ignores both.
export function start(id, when, party, choice = {}, bring = {}) {
  const quest = questOf(id);
  const at = timesFor(quest).includes(when) ? when : timesFor(quest)[0];
  const size = quest.size || choice.size || 'short';
  const where = quest.at || choice.where || null;
  // The player and the recruited walk it: they take the wounds, earn the experience,
  // and are the only ones who can read anything at a fork. The player is on it whoever
  // else is, so their three skills are the three the party always has.
  const who = [YOU, ...(party && party.length ? party : roster().map((c) => c.id))]
    .filter((id, i, all) => all.indexOf(id) === i)
    .slice(0, TUNING.partyMax); // four walk out and no more, however they were picked
  const nodes = quest.line ? authored(quest.line) : drawn(size);
  // everyone's own constitution, what knowing this ground adds to it, and whatever was
  // drunk in town waiting on this job — see src/potions.js. A potion drunk at the bar
  // is in the pool at the gate and nowhere else: it is the next job out it was for.
  const dosed = potions.takeUp();
  const con = conTotal(who) + groundCon(who, terrainOf(quest, where)) + dosed;
  // What the crew can shift between them, and what of the town's stock is going out on
  // their backs. Counted in squares — see carryOf in src/party.js — with stackMax of one
  // thing to a square, and a stone one square of its own whether or not it is worn.
  const room = carryTotal(who);
  const pack = {};
  // Stones were put in the pack at the gate — see src/charm.js — and each one is a square
  // gone before any ore is counted, which is the whole cost of taking a charm out.
  const squares = () => packedTotal()
    + Object.values(pack).reduce((a, v) => a + Math.ceil(v / TUNING.stackMax), 0);
  for (const [m, n] of Object.entries(bring)) {
    const have = pack[m] || 0;
    const inLast = have % TUNING.stackMax;
    const spare = inLast ? TUNING.stackMax - inLast : 0;
    const take = Math.max(0, Math.min(n, heldOf(m), spare + (room - squares()) * TUNING.stackMax));
    if (take > 0) {
      pack[m] = have + take;
      give(m, -take); // it is off the shelf in town the moment they walk out with it
    }
  }
  run = {
    quest, size, where, when: at, party: who, nodes, at: -1, state: 'running',
    used: new Set(), // the kinds this run has had that it is only allowed one of
    // The pack is the whole of what comes home: nothing reaches the town's stock until
    // the party does. `brought` is what of it was carried out rather than found, so the
    // tally can tell one from the other.
    pack, brought: { ...pack }, room, left: {}, offer: null, delivered: false,
    spoils: {}, xp: 0, con, conMax: con, dosed,
    // Hit points are the fighters' own and are not pooled: the party shares a
    // constitution and nobody shares a rib. Full at the gate, spent down by whatever
    // they trade blows with, and forgotten when the run ends — the same as the pool.
    hp: Object.fromEntries(fighters(who).map((id) => [id, combatOf(id).hp])),
    fight: null, // the one going on right now, and null the rest of the time
    cooking: null, // and the pan on the camp fire, the same
  };
  step();
  return run;
}

// A run the designer wrote out: every node is the kind named for it, and an entry that
// names two is a fork offering exactly those two ways on.
function authored(line) {
  return line.map((entry, i) => {
    const pair = Array.isArray(entry);
    return {
      fork: pair,
      pick: pair ? entry : null,
      only: pair ? null : entry,
      goal: i === line.length - 1,
    };
  });
}

// and one the road wrote: a length rolled inside the band the chosen size names, and a
// fork rolled in front of each node after that
function drawn(size) {
  const count = roll(TUNING.questNodes[size] || TUNING.questNodes.short);
  return Array.from({ length: count }, (_, i) => ({
    // no fork in front of the first node, and none in front of the goal: the last
    // step of a job is not a choice about where the job is
    fork: i > 0 && i < count - 1 && Math.random() < TUNING.questForkChance,
    goal: i === count - 1,
  }));
}

// A potion drunk at a camp comes out of the pack, not off the town's shelves: what was
// left at home is no use out here. src/potions.js takes this and does not otherwise care
// which of the two stores it is spending.
const fromPack = {
  heldOf: (m) => (run ? run.pack[m] || 0 : 0),
  take: (m, n) => fromPack.give(m, -n),
  // Paid into as well as spent, because a fire on the road cooks into the same pack it
  // cooked out of. Nothing here argues with the room: what comes out of a pan is smaller
  // than what went into it, and a party who cannot fit their own dinner is a joke rather
  // than a rule.
  give: (m, n) => {
    if (!run) return;
    run.pack[m] = (run.pack[m] || 0) + n;
    if (run.pack[m] <= 0) delete run.pack[m];
  },
};

// --- the pack ---------------------------------------------------------------
// Counted in things and not in kinds: seven iron ore is seven of it. A run pays the town
// nothing until it is over, so what is in here at the gate is the whole of what the walk
// was worth.

export function packOf() {
  return run ? run.pack : {};
}

// How many squares a count of one thing takes up. Everything is stacked the same way, so
// this is the whole of the arithmetic: stackMax to a square and the remainder takes one
// more of its own.
export function slotsFor(n) {
  return Math.ceil(Math.max(0, n) / TUNING.stackMax);
}

export function packUsed() {
  if (!run) return 0;
  return packedTotal() + Object.values(run.pack).reduce((n, v) => n + slotsFor(v), 0);
}

// Squares with nothing in them. What the grid draws empty, and what a full pack has none
// of.
export function packRoom() {
  return run ? Math.max(0, run.room - packUsed()) : 0;
}

// How many more of one particular thing will go in: whatever is left in its own part-filled
// square, plus a whole square for every empty one. Asked per thing rather than in general
// because a pack with one square left has room for twenty ore and no room at all for one
// of anything else it is not already carrying.
export function roomFor(m) {
  if (!run) return 0;
  const have = run.pack[m] || 0;
  const inLast = have % TUNING.stackMax;
  const spare = inLast ? TUNING.stackMax - inLast : 0;
  return spare + packRoom() * TUNING.stackMax;
}

// What is standing in front of them that will not go in. Held on the run rather than paid
// or dropped, because which of the two it is is the player's to say.
export function offering() {
  return run && run.offer ? run.offer : null;
}

function putIn(m, n) {
  const fits = Math.max(0, Math.min(n, roomFor(m)));
  if (fits > 0) run.pack[m] = (run.pack[m] || 0) + fits;
  return fits;
}

// The pack as the grid draws it: one entry per square, and then the empty squares that
// are left over. A stack past stackMax is more than one square and is drawn as more than
// one, so what is on the screen is what the arithmetic says and not a summary of it.
export function packCells() {
  if (!run) return [];
  const cells = [];
  // The stones first, because they were packed first and because one of them is on the
  // cord: a square that is doing something is a square worth seeing before the ore.
  const on = worn();
  for (const s of packedStones()) {
    cells.push({
      id: s.gem.id, n: 1, stone: s.key, name: stoneName(s.gem, s.grade), note: on && on.key === s.key ? 'cord' : '',
    });
  }
  for (const [m, n] of Object.entries(run.pack)) {
    for (let left = n; left > 0; left -= TUNING.stackMax) {
      cells.push({ id: m, n: Math.min(left, TUNING.stackMax) });
    }
  }
  while (cells.length < run.room) cells.push(null);
  return cells;
}

// A square emptied onto the ground, and whatever was waiting for the room goes straight
// into it. The whole square goes rather than one thing off it: the point of the prompt is
// that a square is what is short, so freeing one is what answering it means.
export function dropSquare(i) {
  if (!run) return null;
  const cell = packCells()[i];
  if (!cell) return run;
  // A stone tipped out is a stone gone: it is not stock and it does not come home in
  // halves, so it is named where it was left rather than counted with the ore.
  if (cell.stone) {
    dropStone(cell.stone);
    run.stonesLeft = [...(run.stonesLeft || []), cell.name];
    const node = run.nodes[run.at];
    if (node) node.stonesLeft = [...(node.stonesLeft || []), cell.name];
    fillFromOffer();
    return run;
  }
  run.pack[cell.id] -= cell.n;
  if (run.pack[cell.id] <= 0) delete run.pack[cell.id];
  run.left[cell.id] = (run.left[cell.id] || 0) + cell.n;
  fillFromOffer();
  return run;
}

function fillFromOffer() {
  if (!run.offer) return;
  for (const [m, n] of Object.entries(run.offer)) {
    const took = putIn(m, n);
    if (took > 0) {
      run.offer[m] = n - took;
      if (run.offer[m] <= 0) delete run.offer[m];
    }
  }
  if (!Object.keys(run.offer).length) leaveOffer();
}

// The rest of it stays where it is. Said at the node afterwards, because a thing left on
// the ground is worth a line the same way work left standing is.
export function leaveOffer() {
  if (!run || !run.offer) return run;
  const node = run.nodes[run.at];
  for (const [m, n] of Object.entries(run.offer)) {
    if (n <= 0) continue;
    run.left[m] = (run.left[m] || 0) + n;
    if (node) node.left = { ...(node.left || {}), [m]: n };
  }
  run.offer = null;
  run.phase = 'node';
  return run;
}

// Everything on their backs, handed over at the town gate. Called on every way a run can
// end and guarded, because a run pays exactly once however it finished.
function carryHome() {
  if (!run || run.delivered) return;
  run.delivered = true;
  for (const [m, n] of Object.entries(run.pack)) if (n > 0) give(m, n);
}

export function abandon() {
  if (!run) return null;
  leaveOffer();
  run.state = 'abandoned';
  carryHome(); // they turned back, but they turned back carrying it
  return run;
}

// Constitution is a within-run resource and nothing carries out of the run: the question
// a run asks is whether the party has enough left to finish this one, not whether they
// have been worn down since the first. Move this the day beds and food cost something.
export function clear() {
  potions.clear(); // nothing drunk survives the run it was drunk into
  clearPack(); // and the stones that walked out come off the cord and back on the shelf
  run = null;
}

// --- the pack, on the road -------------------------------------------------
// A camp is the one node a party can open a pack at: they have stopped, there is a fire,
// and nobody drinks anything standing in front of a boar. Which nodes are camps is
// content — `camp: true` in content/nodes.js — so the day a second one is written this
// works there too.

export function atCamp() {
  if (!run || run.state !== 'running' || run.at < 0) return false;
  const node = run.nodes[run.at];
  if (!node || !KIND[node.kind] || !KIND[node.kind].camp) return false;
  // standing at it, rather than walking up to it or fighting something on it
  return run.phase === 'beat' || run.phase === 'node' || run.phase === 'choose';
}

// What can be drunk here and now, in the order the pack lists it.
export function drinkable() {
  return atCamp() ? potions.carried(fromPack).filter((mid) => potions.canDrink(mid, fromPack)) : [];
}

// Drunk at the fire: the constitution lands now, and anything standing goes to work for
// the rest of the run. Returns the line the card says about it, or null if it could not
// be drunk at all.
export function drink(mid) {
  if (!atCamp() || !potions.canDrink(mid, fromPack)) return null;
  const took = potions.drink(mid, true, fromPack);
  if (!took) return null;
  const con = took.effect.con || 0;
  if (con) {
    run.con = Math.max(0, Math.min(run.conMax, run.con + con));
  }
  return took;
}

// One meal to a fire. A camp is a party sitting down once, not a party eating their way
// down the pack until the pool is full: they get a dinner here, and the next one waits for
// the next fire. It is written on the node rather than on the run because that is what
// makes it a rule about the fire — a longer road is more fires and more dinners, which is
// the whole reason a party takes the longer road.
export function mealAt() {
  const node = run && run.at >= 0 ? run.nodes[run.at] : null;
  return (node && node.meal) || null;
}

// And what can be eaten here, by the same rule and out of the same pack. A meal is not a
// potion — see src/food.js — so nothing is held off because something like it is already
// working; what holds a second one off is that the first one was eaten at this fire.
export function edible() {
  return atCamp() && !mealAt() ? food.carried(fromPack) : [];
}

// Eaten at the fire. The constitution goes back into the pool, capped at what the run set
// out with, and the hit points go back to everybody still on their feet, each capped at
// their own. Nobody is got up off the ground by a meal: that is a black draught's job, and
// somebody being carried is not somebody eating.
export function eat(mid) {
  if (!atCamp() || mealAt() || !food.canEat(mid, fromPack)) return null;
  const ate = food.eat(mid, fromPack);
  if (!ate) return null;
  // and that is this fire's meal gone, whether it was carried out cooked or cooked here
  run.nodes[run.at].meal = { how: 'ate', name: ate.name };
  const { con = 0, hp = 0 } = ate.effect;
  if (con) run.con = Math.max(0, Math.min(run.conMax, run.con + con));
  if (hp) {
    for (const id of standing()) {
      run.hp[id] = Math.min(hpMaxOf(id), run.hp[id] + hp);
    }
  }
  return ate;
}

// --- cooking at the fire ----------------------------------------------------
// A camp is a fire, and a fire is a pan. What can be cooked at one is content — `fire` on
// a recipe in content/recipes.js — because a recipe is the only thing that knows whether
// it wants an oven. Nothing is burnt out of the pack and there is no clock on the work:
// the fire is already alight, which is what makes it a camp.
//
// Cooking and eating share the fire's one meal. A party can put a pan on or open something
// they carried, and either way they have had their hour here: turning three trout into a
// supper and then eating it is two sittings, and there is one to a fire.

// What could be cooked here, out of what is in the pack.
export function cookable() {
  if (!atCamp() || mealAt()) return [];
  return RECIPES.filter((r) => canCook(r, fromPack));
}

export function cookingAt() {
  return run ? run.cooking : null;
}

// Put the pan on. The meal is spent the moment it goes on and not when it comes off: a
// party who botched a supper have still sat here as long as one takes.
export function startCook(id) {
  const r = RECIPES.find((x) => x.id === id);
  if (!r || !atCamp() || mealAt() || !canCook(r, fromPack)) return null;
  run.cooking = { r, was: run.phase };
  run.nodes[run.at].meal = { how: 'cooked', name: r.name };
  if (!playedAt(r)) return cookPlayed(null);
  run.phase = 'activity';
  return run;
}

// And what came off it. The costs and the produce are the pack's, and the experience is
// the player's, the same as at any bench — see make in src/craft.js.
export function cookPlayed(played) {
  if (!run || !run.cooking) return run;
  const { r, was } = run.cooking;
  run.cooking = null;
  run.phase = was;
  const result = makeAt(r, played, { store: fromPack });
  run.nodes[run.at].meal = { how: 'cooked', name: r.name, result };
  return run;
}

// The pack at a fire, as one numbered list: what could go on the fire, then what is
// already cooked, then the bottles. One shape for all three, so the card numbers them
// without knowing what any of them is — and the row is handed back on the way in, because
// a recipe and a dish may well share an id.
//   kind — 'cook', 'eat' or 'drink'
//   id   — the recipe to put on, or the material to eat or drink
// The meal comes before the bottles because the meal is the perishable choice: there is
// one of it to a fire, and a bottle left in the pack can still be drunk at the next one or
// over the bar at home.
function handRows() {
  return [
    ...cookable().map((r) => ({
      kind: 'cook', id: r.id, name: r.name, body: cookLines(r, fromPack),
    })),
    ...edible().map((mid) => ({
      kind: 'eat', id: mid, name: nameOf(mid), body: food.linesFor(mid),
    })),
    ...drinkable().map((mid) => ({
      kind: 'drink', id: mid, name: nameOf(mid), body: potions.linesFor(mid),
    })),
  ];
}

// Nine of them, because nine is how many number keys there are. A row past that would be
// drawn with a number nobody can press, which is worse than not drawing it: what does not
// fit is counted instead — see handOver — and the next of it comes up as soon as something
// above it is taken.
const HAND = 9;

export function atHand() {
  return handRows().slice(0, HAND);
}

// and how much of the pack did not fit under a number
export function handOver() {
  return Math.max(0, handRows().length - HAND);
}

export function takeAtHand(row) {
  if (!row) return null;
  if (row.kind === 'cook') return startCook(row.id);
  return row.kind === 'eat' ? eat(row.id) : drink(row.id);
}

export function inForce() {
  return potions.forceRows();
}

// One potion, named and said in words, for whichever screen is asking — the pack in town
// or the card at the fire. Neither of them has to know what a potion is.
export function drinkRow(mid) {
  return { mid, name: nameOf(mid), body: potions.linesFor(mid) };
}

// The cord at a camp, for the same reason the pack is only opened at one: they have
// stopped, and nobody changes a stone over standing in front of a boar. What is on offer
// is what they packed — the charm left in town is still in town — so this is the gate's
// choice made again with better information about the road.
export function cordable() {
  return atCamp() ? packedKeys() : [];
}

// One press moves the cord on: the next stone they are carrying, and past the last of
// them, nothing.
export function changeCord() {
  if (!atCamp() || !cordable().length) return null;
  return cycleCord();
}

// What the card says about it: every stone in the pack, and which of them is on.
export function cordRows() {
  const on = worn();
  return packedStones().filter((s, i, all) => all.findIndex((o) => o.key === s.key) === i)
    .map((s) => ({ key: s.key, gem: s.gem, grade: s.grade, on: !!on && on.key === s.key }));
}

// --- walking ---------------------------------------------------------------

export function step() {
  if (!run || run.state !== 'running') return run;
  run.at += 1;
  if (run.at >= run.nodes.length) return finish();

  const node = run.nodes[run.at];
  if (node.fork && !node.taken) {
    node.branches = branches(node.pick);
    run.phase = 'fork';
    return run;
  }
  resolve(node);
  return run;
}

// What a fork of a given width calls its ways. A two-way fork is a left and a right; a
// three-way one has a road straight on between them.
const SIDES = { 1: ['Ahead'], 2: ['Left', 'Right'], 3: ['Left', 'Ahead', 'Right'] };

// Two or three ways on, and each way is the node at the end of it: whoever can read that
// ground says what is down there, and taking it is taking that. Only kinds that can be
// read are offered, because a fork nobody can see down is a coin toss with a card in
// front of it. The ways are drawn against the hour and the place, so a night fork in the
// wood offers the wood's nights.
function branches(pick) {
  let drew;
  if (pick) {
    drew = pick.map((id) => KIND[id]);
  } else {
    const readable = readableAt(run.when, run.where);
    const ways = Math.min(roll(TUNING.questForkWays), readable.length);
    drew = [];
    for (let i = 0; drew.length < ways && i < 40; i++) {
      const e = drawNode(readable);
      if (!drew.includes(e)) drew.push(e);
    }
  }
  const sides = SIDES[drew.length] || drew.map((_, i) => `Way ${i + 1}`);
  return drew.map((kind, i) => ({
    kind: kind.id,
    side: sides[i],
    read: readOf(kind),
  }));
}

export function walkers() {
  return run ? run.party.map((id) => charOf(id)) : walking();
}

// who on the run can see this coming, and what they say about it. The one with the most
// points in the skill speaks: a party carrying two who could tell you hears the better.
function readOf(kind) {
  const seen = walkers().filter((c) => rankOf(c.id, kind.read.skill) > 0);
  if (!seen.length) return null;
  const c = seen.reduce((a, b) => (rankOf(b.id, kind.read.skill) > rankOf(a.id, kind.read.skill) ? b : a));
  return { who: whoIs(c.id), line: kind.read.line };
}

export function choose(i) {
  if (!run || run.phase !== 'fork') return run;
  const node = run.nodes[run.at];
  node.taken = node.branches[i];
  // A way was named before it was taken, so it is that and not a lean toward it. The
  // party walked to the thing they were told was down there.
  node.only = node.taken.kind;
  resolve(node);
  return run;
}

function weighted(from) {
  const of = (e) => e.weight[run.when];
  let r = Math.random() * from.reduce((n, e) => n + of(e), 0);
  for (const e of from) {
    r -= of(e);
    if (r <= 0) return e;
  }
  return from[from.length - 1];
}

// Which work the party finds, out of the shares the zone was written with, counting only
// work something still drawable actually offers — a share spent on a node this run has
// already had would be a share spent on nothing.
function whichWork(table, from) {
  const live = Object.entries(table)
    .filter(([id]) => from.some((e) => e.harvests.some((h) => h.skill === id)));
  if (!live.length) return null;
  let r = Math.random() * live.reduce((n, [, w]) => n + w, 0);
  for (const [id, w] of live) {
    r -= w;
    if (r <= 0) return id;
  }
  return live[live.length - 1][0];
}

// which of the nodes offering a given piece of work it turns out to be
function workNode(gather, digging) {
  const skill = whichWork(gather, digging);
  const offering = digging.filter((e) => e.harvests.some((h) => h.skill === skill));
  return weighted(offering.length ? offering : digging);
}

// What the road puts up next, in two questions.
//
// First, work or something in the way. A zone that names its `trouble` share says that in
// one number an hour and it stays put however many nodes are written; a zone that does not
// falls back to the nodes' own weights, where every encounter added moved the shape of
// every run a little and a table could not be grown without retuning it.
//
// Then which. For work that is the zone's `gather` shares — the work first, then which of
// the nodes offering it. Those are shares of the work and not of the nodes, because a node
// with two harvests is two kinds of work standing in one place: it is reached by either of
// its rolls, so a wood that is two parts timber to one part fish puts up more mixed stands
// than a straight reading of the table would. That is the mixed stand doing its job. For
// trouble it is the nodes' own weights, which is all that is wanted there: they are
// already only competing with each other.
function drawNode(from) {
  const gather = (ZONE[run.where] || {}).gather;
  const digging = gather ? from.filter((e) => e.harvests) : [];
  if (!digging.length) return weighted(from);
  const rest = from.filter((e) => !e.harvests);
  if (!rest.length) return workNode(gather, digging);
  const share = troubleAt(run.where, run.when);
  if (share !== null) {
    return Math.random() * 100 < share ? weighted(rest) : workNode(gather, digging);
  }
  const of = (e) => e.weight[run.when];
  const all = from.reduce((n, e) => n + of(e), 0);
  const work = digging.reduce((n, e) => n + of(e), 0);
  if (Math.random() * all >= work) return weighted(rest);
  return workNode(gather, digging);
}

// The work a node has in it, and what the party's points are worth at each piece of it:
// everyone's points in that skill added up, each one adding skillYieldPerPoint to what
// comes out of it. Who you take on a job is the loudest thing you say about what you
// want off it — and at a node with two resources in it, taking one specialist and not
// the other is coming home with half of what was standing there.
// A kind written the older way, with one `harvest` and one list of spoils, reads as a
// node with a single piece of work whose yield is the kind's own.
function harvestsOf(e) {
  const listed = e.harvests || (e.harvest
    ? [{ skill: e.harvest, activity: e.activity, spoils: e.spoils, draw: e.draw, stones: e.stones, whole: true }]
    : []);
  return listed.map((h) => {
    const score = scoreOf(run.party, h.skill);
    return { ...h, skill: skillOf(h.skill), score, more: score * TUNING.skillYieldPerPoint };
  });
}

// The work at this node the party can actually do, best-known first. There is a day's
// light and one of it, so where there are two the party says which — see pickWork. The
// order is what the cursor opens on: what they are best at is the likelier answer.
function workedOf(node) {
  return node.harvests.filter((h) => h.score > 0).sort((a, b) => b.score - a.score);
}

// which engine a node hands over, once it is known what the party decided to work
export function activityOf(node) {
  return node.took ? node.took.activity : KIND[node.kind].activity;
}

// The skill whose picture stands for a node on the trail: the work they chose to do
// there, or — at an encounter, where there is no work — the skill of the way they took
// through it. Either way the mark says what they did, not what was standing there. A
// node that asked nothing of anybody keeps the silhouette of its nature.
export function skillAt(node) {
  if (node.took) return node.took.skill;
  if (node.check && node.check.skill) return node.check.skill;
  return skillForActivity(KIND[node.kind].activity);
}

// Two things standing here and time for one of them. Answered by index into the whole
// list, shut ones included, so the card and the answer count the same rows.
export function pickWork(i) {
  if (!run || run.phase !== 'choose') return run;
  const node = run.nodes[run.at];
  const h = node.harvests[i];
  if (!h || !h.score) return run;
  node.took = h;
  toWork(node);
  return run;
}

// and what happens once it is settled which work is being done: the engine, or straight
// to the tally where there is no engine for it yet
function toWork(node) {
  if (hasEngine(activityOf(node))) {
    run.phase = 'activity';
    return;
  }
  settle(null);
}

// The job's own test stands in front of the goal; anything else the road throws up
// brings its own. A node asks for at most one roll.
function checkOf(node, e) {
  const spec = (node.goal && run.quest.check) || e.check;
  if (!spec) return null;
  return { ...check(run.party, spec.skill, spec.dc, potions.steady()), held: spec.held, lost: spec.lost };
}

// An encounter that hands the party a choice is a scene rather than a job: it is walked
// through whatever anybody knows, and it is the ways through it that close. Everything
// else is work, and work nobody can do is work the party walks past.
function isScene(e) {
  return (e.beats || []).some((b) => b.choose);
}

function resolve(node) {
  const e = node.only ? KIND[node.only] : drawNode(drawableAt(run.when, run.where));

  node.kind = e.id;
  node.conBefore = run.con;
  if (e.once) run.used.add(e.id); // and this run will not put it up a second time
  node.harvests = harvestsOf(e);
  node.worked = workedOf(node);
  node.took = node.worked[0] || null; // until the party says otherwise, which they only
  // get to do where there is more than one thing here they could do

  // Nobody on the run has a single point in any of the work this node is. They do not
  // get to try it and fail at it — they stand and look at it and go on. Nothing is
  // rolled, nothing is taken, nothing is learned, and the walking is all it costs.
  if (node.harvests.length && !node.worked.length && !isScene(e)) {
    node.passed = true;
    node.check = null;
    settle(null);
    return;
  }

  node.check = checkOf(node, e);

  // A node written out beat by beat plays those beats first and settles at the end of
  // whichever one the party walked into. See content/encounters.js.
  if (e.beats) {
    node.beatSpoils = {};
    node.beatDraw = null;
    node.conBeat = 0;
    run.phase = 'beat';
    toBeat(node, e.beats[0].id);
    return;
  }

  // The party stops in front of it and reads it before anything is cut, cast for or dug.
  // Where two things here can be worked and there is light for one, that card is the
  // question; where there is only one, it is the account of what they have walked up to
  // and a key to get on with it. Either way the node is described before it is worked,
  // which is the only order the writing makes sense in.
  if (node.worked.length) {
    node.shown = true; // its account was read on the way in, so the tally does not repeat it
    run.phase = 'choose';
    return;
  }

  // A node with an engine behind it does not pay out until it has been played. The run
  // waits here; the scene hands back what the player made of it.
  toWork(node);
}

// --- beats -----------------------------------------------------------------
// An authored encounter: paragraphs, a choice or two, and a way through to the end of
// it. Nothing here is drawn or weighted — the whole shape is in the content. A beat
// carrying `spoils`, `con` or `flag` does that on the way through, and the node settles
// on the first beat with no way on.

function toBeat(node, id) {
  const b = KIND[node.kind].beats.find((x) => x.id === id);
  node.beat = b;
  if (!b) {
    outOfBeats(node); // a `then` pointing at nothing is the end of them
    return;
  }
  story.set(b.flag);
  // The beat the fight starts at. `true` is a beat that fights whatever the node names;
  // src/nodes.js writes the fuller form, with what the way through was worth to it.
  if (b.fight) node.fight = b.fight === true ? { foe: KIND[node.kind].foe } : b.fight;
  if (b.con) node.conBeat += b.con;
  if (b.spoils) Object.assign(node.beatSpoils, b.spoils);
  if (b.draw) node.beatDraw = b.draw; // the beat walked into decides which table, if any

  // Every way on closed to this party and no plain way past: there is nothing here they
  // can do, so the scene ends where it stands. Content that always writes one way through
  // needing nothing never reaches this.
  if (b.choose && b.choose.every(shutTo)) {
    node.passed = true;
    outOfBeats(node);
  }
}

// E on a beat: the next one it names, one of two if it tosses for it, or the one the
// roll already made decides.
export function advance() {
  if (!run || run.phase !== 'beat') return run;
  const node = run.nodes[run.at];
  const b = node.beat;
  if (b.choose) return run; // a choice is answered, not pressed past
  const next = b.result
    ? (node.check && node.check.pass ? b.result.hit : b.result.miss)
    : (b.toss ? pick(b.toss) : b.then);
  if (!next) outOfBeats(node);
  else toBeat(node, next);
  return run;
}

// The end of the beats is the end of the node — unless the way the party took walked
// them into a fight, or the encounter also names an activity, in which case the beats
// were the walk up to it and the player takes the controls now. That is how a node gets
// words in front of its minigame, and words in front of whatever is standing in the road.
function outOfBeats(node) {
  if (!node.passed && node.fight) {
    toFight(node);
    return;
  }
  if (!node.passed && hasEngine(activityOf(node))) {
    run.phase = 'activity';
    return;
  }
  settle(null);
}

// --- fighting ---------------------------------------------------------------
// A fight is 1v1: one combat character is up and the rest of the party stands off it.
// The rules are in src/combat.js and what is fought is in content/foes.js; this is only
// what a run does with the result. Hit points are the fighter's own — the pool hears
// about a fight when somebody goes down, and not before.

// who on the run can fight and is still on their feet
export function standing() {
  return run ? fighters(run.party).filter((id) => run.hp[id] > 0) : [];
}

export function hpOf(id) {
  return run && run.hp[id] !== undefined ? run.hp[id] : 0;
}

export function hpMaxOf(id) {
  const c = combatOf(id);
  return c ? c.hp : 0;
}

export function fightingAt() {
  return run ? run.fight : null;
}

// The party has walked up to something that has to be fought. Where more than one of them
// fights, which one steps up is the player's call — it is the only choice they get about
// a fight before it starts, and it is the whole of what a second fighter is for.
function toFight(node) {
  // What is standing there is rolled once, here, and the same band is what the whole
  // fight is against however many of the party have to be fed into it.
  node.band = node.band || muster(node.fight.band, node.fight.thin || 0);
  if (!node.band.length) { settle(null); return; } // said at boot; the run walks on
  const up = standing();
  if (!up.length) { rout(); return; }
  if (up.length === 1) stepUp(up[0]);
  else run.phase = 'fighter';
}

// Sending somebody to the front: the first one, or the one who steps over them when they
// go down. There is one fight and it is the same fight all the way through, so a fighter
// carried out of it leaves the thing standing there as wounded as they left it.
export function stepUp(id) {
  if (!run || !standing().includes(id)) return run;
  const node = run.nodes[run.at];
  if (run.fight) stepIn(run.fight, id);
  else {
    run.fight = begin(id, node.band, {
      pool: run.hp, weaken: node.fight.weaken || 0, ambush: !!node.fight.ambush,
    });
  }
  run.phase = 'fight';
  return afterTurn(node);
}

// And changing over mid-fight because you would rather the other one wore the next few.
// It costs the turn; see swapTo in src/combat.js.
export function swapIn(id) {
  if (!run || run.phase !== 'fight' || !run.fight || run.fight.over) return run;
  if (id === run.fight.who || !standing().includes(id)) return run;
  swapTo(run.fight, id);
  return afterTurn(run.nodes[run.at]);
}

// A move is played rather than declared: the engine it names opens where the party is
// standing, and what the player makes of it is what the blow is worth. A move with no
// engine behind it resolves on the spot, the way every node did before its engine landed.
export function fightMove(moveId) {
  if (!run || run.phase !== 'fight' || !run.fight || run.fight.over) return run;
  const move = MOVES.find((m) => m.id === moveId);
  if (move && hasEngine(move.play)) {
    run.fight.move = moveId;
    run.phase = 'activity';
    return run;
  }
  take(run.fight, moveId);
  return afterTurn(run.nodes[run.at]);
}

// and what the engine handed back, which is the rest of that same turn
export function fightPlayed(played) {
  if (!run || !run.fight || !run.fight.move) return run;
  const moveId = run.fight.move;
  run.fight.move = null;
  run.phase = 'fight';
  take(run.fight, moveId, played);
  return afterTurn(run.nodes[run.at]);
}

// Which engine the controls are being handed to: the move being played where a fight is
// on, and the work at the node everywhere else.
export function playing() {
  const held = run && run.fight && run.fight.move;
  if (held) return (MOVES.find((m) => m.id === held) || {}).play;
  if (run && run.cooking) return run.cooking.r.activity;
  return run && run.at >= 0 ? activityOf(run.nodes[run.at]) : null;
}

// Breaking off the whole thing, which is only on the card once whoever is up is badly
// hurt. It costs the turn and it is not promised; see flee in src/combat.js.
export function canBreakOff() {
  return canFlee(run && run.fight);
}

export function fightFlee() {
  if (!run || run.phase !== 'fight' || !canBreakOff()) return run;
  flee(run.fight);
  return afterTurn(run.nodes[run.at]);
}

// Whatever the turn came to. The fight is only over two ways: the thing goes down, or
// the fighter does.
function afterTurn(node) {
  const f = run.fight;
  if (!f || !f.over) return run;
  if (f.over === 'down') { faint(f.who); return run; }

  // Everything else is the fight being over: they are down, they ran, or the party did.
  // Whatever was felled along the way still pays — what got away does not.
  node.won = {
    foe: f.foe.name,
    felled: f.felled.length,
    broke: f.over === 'broke',
    fled: f.over === 'fled',
    rounds: f.round,
    hurt: hurtOf(f),
  };
  node.beatSpoils = { ...(node.beatSpoils || {}), ...spoilsOf(f) };
  // The party ran. They keep what they had already taken off it and pay for the running:
  // a party that came back down the road at a dead sprint is a party that is spent.
  if (f.over === 'fled') node.conBeat -= TUNING.combat.fleeCon;
  run.fight = null;
  settle(null);
  return run;
}

// A fighter at nothing is carried, and a body being carried is not a body walking: their
// constitution comes off the pool with them. Somebody else who fights steps up; nobody
// left who fights and the party is finished out here whatever the pool still says.
function faint(id) {
  const node = run.nodes[run.at];
  run.fight.who = null; // nothing standing in front of it, and the fight still going on
  // A black draught in force: the first one carried this run is got back on their feet
  // instead, on what the bottle has in it. The pool pays nothing, the thing in front of
  // them is still there, and the party is asked again who is going to stand in front of
  // it — which may well be the one who just got up.
  const rally = potions.spendRally();
  if (rally) {
    run.hp[id] = Math.max(1, Math.round(hpMaxOf(id) * rally));
    node.rallied = [...(node.rallied || []), whoIs(id)];
    run.phase = 'fighter';
    return;
  }
  const lost = Math.round(conOf(id) * TUNING.combat.faintCon);
  run.conMax = Math.max(0, run.conMax - lost);
  run.con = Math.max(0, Math.min(run.conMax, run.con - lost));
  node.fainted = [...(node.fainted || []), { who: whoIs(id), con: lost }];
  if (!standing().length) { rout(); return; }
  if (run.con <= 0) { run.fight = null; spend(); return; }
  run.phase = 'fighter'; // the thing is still standing there and somebody has to
}

// Nobody left who fights, with something in the road that has to be. They break off and
// come home from where they stand, the same as a party with nothing left in the pool.
function rout() {
  run.routed = true;
  run.fight = null;
  spend();
}

// A way through a scene that names work nobody on the run knows is a way the party
// cannot take. The words stay on the card — you are told what you are not equipped for —
// and the option simply will not answer. A way that names no skill is open to anybody.
export function shutTo(option) {
  return !!(option && option.skill) && !scoreOf(run.party, option.skill);
}

// An option that names a skill is rolled as it is taken, by whoever in the party is
// best at that skill. The beat it leads to narrates the attempt; a later beat's
// `result` reads the roll back and picks the way out.
export function pickBeat(i) {
  if (!run || run.phase !== 'beat') return run;
  const node = run.nodes[run.at];
  const opt = node.beat.choose && node.beat.choose[i];
  if (!opt || shutTo(opt)) return run;
  if (opt.skill) {
    node.actorId = bestAt(run.party, opt.skill);
    node.check = check(run.party, opt.skill, opt.dc, potions.steady());
  }
  toBeat(node, opt.then);
  return run;
}

// who would take a given option, so the party can be told before they take it
export function actorFor(skill) {
  return run ? bestAt(run.party, skill) : null;
}

// What the node came to. `played` is what an engine handed back — { judgments, failed } —
// or null for a node nobody had to do anything at.
export function settle(played) {
  if (!run || run.at < 0) return run;
  const node = run.nodes[run.at];
  const e = KIND[node.kind];
  const night = run.when === 'night';
  run.phase = 'node';

  const failed = node.check && !node.check.pass;
  if (played) {
    node.played = true;
    // A hard fail held off by what somebody drank. The floor comes up and the ceiling
    // stays where it was: the work is not botched, and it is not good either.
    node.saved = !!played.failed && potions.sure();
    node.failed = !!played.failed && !node.saved;
    node.quality = played.failed ? 0 : qualityOf(played.judgments);
    node.swings = (played.judgments || []).length;
  }
  // What a yield is multiplied by before it is handed over: points in the work that took
  // it, a check lost costing part of it, and how well the engine was played.
  const worth = !played ? 1
    : node.failed ? TUNING.activityFailKeep
      : TUNING.activityKeepFloor + (1 - TUNING.activityKeepFloor) * node.quality;
  const takeAt = (more) => (1 + more) * (failed ? TUNING.checkFailKeep : 1) * worth;
  const took = node.took || null;
  const take = takeAt(took ? took.more : 0);

  // Three things pay out here, and they are kept apart because they are three different
  // shapes: what the kind itself hands over, what the beats picked up on the way through,
  // and the one piece of work at the node the party decided to do. The other thing that
  // was standing here is left standing — there was only ever time for one of them.
  const paid = {};
  const put = (m, n) => { paid[m] = (paid[m] || 0) + n; };
  if (!node.passed) {
    for (const [m, range] of Object.entries({ ...e.spoils, ...(node.beatSpoils || {}) })) {
      put(m, Math.round(roll(range) * take));
    }
    const table = node.beatDraw || e.draw;
    if (table) {
      for (const [m, n] of Object.entries(offTable(table, take, tiltOf(took ? took.score : 0)))) put(m, n);
    }
    // The older shape's single harvest is the kind's own spoils and draw, already paid
    // just above, so it is not paid again here.
    if (took && !took.whole) {
      for (const [m, range] of Object.entries(took.spoils || {})) put(m, Math.round(roll(range) * take));
      if (took.draw) {
        for (const [m, n] of Object.entries(offTable(took.draw, take, tiltOf(took.score)))) put(m, n);
      }
    }
    // And the one thing the face does not owe anybody. A check lost on the way in does
    // not cost it — the stone is in the rock or it is not — but botched work finds
    // nothing, the same as work that went badly enough not to clear the floor.
    if (took && took.stones && !node.failed) {
      const stone = stoneFrom(took.stones, node.quality, tiltOf(took.score));
      if (stone) {
        node.stone = stone;
        put(stone, 1);
      }
    }
  }

  // What the node gave up, and then how much of it there was room for. Nothing goes to
  // the town here: it goes on their backs, and what will not fit is held in front of them
  // until the player says which of it they would rather have. See `offer` above.
  node.spoils = {};
  node.packed = {};
  const over = {};
  for (const [m, n] of Object.entries(paid)) {
    if (n <= 0) continue;
    node.spoils[m] = n;
    run.spoils[m] = (run.spoils[m] || 0) + n;
    const took = putIn(m, n);
    if (took > 0) node.packed[m] = took;
    if (n > took) over[m] = n - took;
  }
  if (Object.keys(over).length) run.offer = over;
  node.xp = node.passed ? 0 : Math.round(roll(e.xp)
    * (night ? TUNING.questNightXp : 1)
    * (node.check && node.check.pass ? TUNING.checkPassXp : 1)
    // half a fight is half a job: what you learn from a thing you ran from is what you
    // learned before you ran
    * (node.won && node.won.fled ? TUNING.combat.fleeXp : 1));
  run.xp += node.xp;
  // who the node's experience took to a new level, so the tally at the node can say so
  // where it happened rather than leaving it to be noticed on the crew screen later
  node.levelled = [];
  for (const c of walkers()) {
    if (award(c.id, node.xp)) node.levelled.push({ who: whoIs(c.id), level: levelOf(c.id) });
  }

  // What the node did to the party, in one number: the road's standing cost, what the
  // encounter itself takes or puts back, how the party bore up in front of it, and how
  // well they did the work. They are kept apart so the readout can say which was which.
  const taken = node.passed ? 0 : roll(e.con); // a node walked past takes nothing but the road
  node.conRoad = -TUNING.questConDecay;
  node.conKind = taken < 0 && night && !potions.daylight()
    ? -Math.round(-taken * TUNING.questNightCon) : taken;
  node.conCheck = node.check ? (node.check.pass ? TUNING.questConHeld : -TUNING.questConLost) : 0;
  node.conWork = !played ? 0
    : node.failed ? TUNING.activityConWorst
      : node.quality >= TUNING.activityConGood ? TUNING.activityConBest : 0;
  node.conBeat = node.conBeat || 0; // what an authored beat did on the way through
  node.con = node.conRoad + node.conKind + node.conCheck + node.conWork + node.conBeat;
  // And what a potion in force held off the whole of it. It never turns a node that took
  // something into a node that gave something back: the most it does is nothing happened.
  node.conGuard = node.con < 0 ? Math.min(potions.guard(), -node.con) : 0;
  node.con += node.conGuard;

  run.con = Math.max(0, Math.min(run.conMax, run.con + node.con));
  node.conAfter = run.con;
  // Nothing left in them: they turn for home from wherever they are standing, and what
  // they were still deciding about is left where it stands.
  if (run.con <= 0) { leaveOffer(); spend(); return run; }
  // A pack with something standing in front of it that will not fit is answered before
  // the tally is read: the decision is about the thing in your hands, not about a list.
  if (run.offer) run.phase = 'pack';
  return run;
}

// A run that ran out of constitution is over where it stands. Half of everything the
// party was carrying goes back — they came home light, and it is not a finished job.
// Nothing left in them. What they were carrying comes home short: a party helped back
// down that road did not carry all of it, and the pack is where that is felt now.
function spend() {
  run.state = 'spent';
  // What is on the cord is on a person, not on their back: the stones come home whole
  // however light the rest of it is.
  run.lost = {};
  for (const [m, n] of Object.entries(run.pack)) {
    const back = n - Math.floor(n * TUNING.questSpentKeep);
    if (back > 0) {
      run.lost[m] = back;
      run.pack[m] = n - back;
      if (run.pack[m] <= 0) delete run.pack[m];
    }
  }
  carryHome();
}

// --- finishing -------------------------------------------------------------

function finish() {
  run.state = 'done';
  carryHome();
  walked.set(run.quest.id, timesWalked(run.quest.id) + 1);
  story.set(run.quest.sets);

  // Paid over the counter rather than carried, so it is not against the pack: this is
  // what the job was worth on top of what came out of the ground.
  run.bonus = { spoils: {}, xp: TUNING.questBonusXp[run.size] };
  for (const [m, n] of Object.entries(run.pack)) {
    const extra = n * TUNING.questBonusFactor;
    run.bonus.spoils[m] = extra;
    give(m, extra);
  }
  for (const c of walkers()) {
    award(c.id, run.bonus.xp);
    raiseBond(c.id); // walking a job to the end is how anyone here comes to know you
  }
  return run;
}

// --- text ------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function listOf(spoils) {
  const parts = Object.entries(spoils).filter(([, n]) => n > 0).map(([m, n]) => `${n} ${nameOf(m)}`);
  return parts.length ? parts.join(', ') : 'nothing';
}

// what the Map tab says about somewhere a job is set out from
export function placeLines(id) {
  const q = questOf(id);
  if (!q) return ['No such job.'];
  if (!story.ok(q)) return ['Nothing here yet.'];
  const stop = blockers(id);
  const head = `${q.label} — ${q.size || 'whatever length you ask for'}, ${q.when === 'any' ? 'day or night' : q.when + ' only'}.`;
  const ground = groundLine(q, walking().map((c) => c.id));
  if (stop.length) return [head, q.goal, ...(ground ? [ground] : []), ...stop];
  return [head, q.goal, ...(ground ? [ground] : []), 'Ready. [Enter] to set out.'];
}

// What the ground is worth to a given crew, said where the crew is picked. Null when the
// job has no ground, so nothing is said about nothing.
export function groundLine(q, ids, where) {
  const terrain = terrainOf(q, where);
  if (!terrain) return null;
  const skills = readsGround(terrain);
  if (!skills.length) return `${terrain} ground. Nothing anybody knows reads it.`;
  const score = skills.reduce((n, t) => n + scoreOf(ids, t.id), 0);
  const named = skills.map((t) => t.name).join(' and ');
  const ground = `${terrain[0].toUpperCase()}${terrain.slice(1)} ground`;
  return score
    ? `${ground} — ${named} ${score} between you, and ${groundCon(ids, terrain)} constitution for it.`
    : `${ground} — nobody coming has a point of ${named}, and it is worth ${TUNING.conPerTerrainPoint} apiece out there.`;
}

// How the work went, in the words written for it. An engine hands back a quality and the
// band in tuning.js says which of the three lines that is; a node whose engine has not
// landed yet was never played, so it reads as the work going well — which is what the
// spoils it has just paid already said.
export function doneLine(node) {
  const said = node.took && node.took.done;
  if (!said || node.passed) return null;
  if (node.failed) return said.botched;
  if (node.quality === undefined) return said.well;
  return node.quality >= TUNING.workWellAt ? said.well : said.middling;
}

// How full they are, said wherever the pack is shown.
export function packLine() {
  if (!run) return null;
  const spare = packRoom();
  return `Pack ${packUsed()} of ${run.room} squares${spare ? '' : ' — full'}.`;
}

// What would not go in and was left where it fell. Said at the node, in the same voice
// as work left standing: it is the same kind of regret.
export function leftLine(node) {
  const left = (node && node.left) || {};
  const stones = (node && node.stonesLeft) || [];
  const said = [...Object.keys(left).length ? [listOf(left)] : [], ...stones];
  return said.length ? `Left on the ground: ${said.join(', ')}.` : null;
}

// The thing standing in front of a full pack, and the sentence that says what the choice
// is. Nobody is asked to read a table to work out that they are out of room.
export function offerLine() {
  const o = offering();
  if (!o) return null;
  return `No room for ${listOf(o)}.`;
}

// The one thing out of the spoil worth saying by name. A stone is not part of what the
// face owed and it is not turned up often, so it is said where it happened rather than
// left to be picked out of a list of ore.
export function stoneLine(node) {
  return node.stone ? `And something in the spoil that is not ore: ${nameOf(node.stone)}.` : null;
}

// What the work they chose was worth to them, in the one line that says why they chose it
export function harvestLine(node) {
  const h = node.took;
  if (!h || !h.score) return null;
  return `${h.skill.name} ${h.score} between you — ${Math.round(h.more * 100)}% more off it.`;
}

// And what is still standing here: what they turned down, and what nobody walking could
// have taken anyway. Two different sentences because they are two different regrets.
export function leftLines(node) {
  if (node.passed) return [];
  const named = (list) => list.map((h) => h.skill.name).join(' and ');
  const spare = (node.worked || []).filter((h) => h !== node.took);
  const shut = (node.harvests || []).filter((h) => !h.score);
  const out = [];
  if (spare.length) out.push(`${named(spare)} left where it stood. There was light for one of them.`);
  if (shut.length) out.push(`Nobody walking this knows ${named(shut)}. That much is left standing too.`);
  return out;
}

// Why a node gave up nothing: not a failure, an absence. Said in place of the roll and
// the take, because there was neither.
export function passedLine(node) {
  if (!node.passed) return null;
  const named = (node.harvests || []).map((h) => h.skill.name);
  const skill = named.length ? named.join(' or ') : 'this work';
  return `Nobody walking this knows ${skill}. The party looks at it a while and goes on.`;
}

// What the fight came to, on the tally afterwards: what went down, how long it took, and
// what it cost the one who was up. Null at a node where nothing was fought.
export function wonLine(node) {
  const w = node.won;
  if (!w) return null;
  const rounds = `${w.rounds} ${w.rounds === 1 ? 'round' : 'rounds'}`;
  // How it ended: the party ran, the last of them ran, or everything that was standing
  // there is down. What got away is named as got away, because it is still out there.
  const felled = w.felled === 1 ? 'one of them down'
    : `${saidCount(w.felled)} of them down`;
  const down = w.fled
    ? `You broke off and left it standing${w.felled ? `, with ${felled}` : ''}`
    : w.broke
      ? `The last of them breaks and goes${w.felled ? `, with ${felled} behind it` : ''}`
      : w.felled > 1
        ? `${w.felled === 2 ? 'Both' : `All ${saidCount(w.felled)}`} of them are down, ${w.foe} last`
        : `${w.foe} is down`;
  if (!w.hurt.length) return `${down}, in ${rounds}, and nothing laid a hand on anybody.`;
  const total = w.hurt.reduce((n, [, v]) => n + v, 0);
  const off = w.hurt.length > 1
    ? `between ${w.hurt.map(([id]) => whoIs(id)).join(' and ')}`
    : `off ${whoIs(w.hurt[0][0])}`;
  return `${down}. ${rounds}, and ${total} hit points ${off}.`;
}

// and who was carried out of it, and what the pool lost with them
export function faintLines(node) {
  return [
    ...(node.rallied || []).map((who) => `${who} goes down, and gets up again on what they drank.`),
    ...(node.fainted || []).map((f) => `${f.who} is carried. ${f.con} constitution off the pool.`),
  ];
}

// who is walking it and what each of them is worth to the pool — the readout under the
// crew screen and along the bottom of the crawl
export function partyLine(who = walkers()) {
  return who.map((c) => `${whoIs(c.id)} ${conOf(c.id)}`).join('    ');
}

// what a node did to it, in the order it happened, for the card under the encounter
export function conLines(node) {
  const out = [];
  const say = (n, why) => { if (n) out.push(`${n > 0 ? '+' : ''}${n} ${why}`); };
  say(node.conRoad, 'walking it');
  say(node.conKind, node.conKind > 0 ? 'put back here' : 'taken here');
  say(node.conBeat, node.conBeat > 0 ? 'put back in it' : 'taken in it');
  say(node.conCheck, node.conCheck > 0 ? 'for holding' : 'for losing it');
  say(node.conWork, node.conWork > 0 ? 'for good work' : 'for botching it');
  say(node.conGuard, 'held off by what you drank');
  return out.length ? `${out.join('    ')}    →  ${node.conAfter}` : '';
}

// the Quest Log, with whatever the run state has to say about each job on top of it
export function questRows() {
  return known().map((q) => {
    const live = run && run.quest.id === q.id ? run : null;
    const n = timesWalked(q.id);
    let note = n ? `Walked ${n}×` : 'Open';
    if (!n && q.ready && !story.has(q.ready)) note = 'Not agreed';
    if (live && live.state === 'running') note = `Node ${live.at + 1}/${live.nodes.length}`;
    else if (live && live.state === 'spent') note = 'Spent';
    else if (live && live.state === 'abandoned') note = 'Turned back';
    const size = q.size ? `${q.size[0].toUpperCase()}${q.size.slice(1)} work` : 'Work at whatever length you ask for';
    return {
      label: q.label,
      note,
      body: [
        `${size} — ${sizeOf(q)[0]} to ${sizeOf(q)[1]} nodes, ${q.party} to walk it, you included.`
          + (q.must ? `  ${q.must.map((m) => whoIs(m)).join(' and ')} must be on it.` : '')
          + (timesFor(q).length > 1 ? '  Day or night, your call.' : `  ${timesFor(q)[0] === 'day' ? 'Daylight' : 'After dark'} only.`)
          + (q.when === 'day' ? '  Nothing to fight by daylight.' : '  After dark wants a fighter along.'),
        q.goal,
        ...q.body,
      ],
    };
  });
}
