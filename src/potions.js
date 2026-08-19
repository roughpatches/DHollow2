// What a potion does, and how long it does it for.
//
// A potion is drunk in two places and nowhere else: in town, where it takes the next job
// out, and at a camp on the road, where it takes the rest of the one being walked. The
// bottle is gone either way, and nothing that has been drunk is carried home.
//
// A potion is a material in content/materials.js carrying `drink`, and `drink` is what it
// does, all of it optional:
//   con      — constitution straight into the pool. On the road it lands the moment it is
//              drunk; drunk in town it is in the pool at the gate.
//   guard    — this much less off the pool at every node for the rest of the run.
//   steady   — this much on every skill check the party rolls for the rest of the run.
//   daylight — the dark stops costing extra: a node at night takes what it would take by
//              day for the rest of the run.
//   sure     — work cannot be botched for the rest of the run. It raises the floor and
//              never the ceiling: nobody is made good at anything by drinking something.
//   rally    — the first fighter carried this run gets up instead, on this much of their
//              hit points. Once a run however many are drunk, because a party that can
//              stand everybody back up twice is not in a fight.
// Nothing else in the game reads a potion. A new potion is one entry in
// content/materials.js and a recipe to make it; a new kind of potion is a field here and
// the one line in src/run.js that reads it.
//
// One of each in force at a time. A second bottle of something already working is not
// drunk rather than drunk for nothing, so nobody pours four salves into one road.

import { MATERIALS } from '../content/materials.js';
import { heldOf, give, nameOf } from './town.js';

// Where the bottle comes from. In town it is the shelves; at a camp on the road it is the
// pack the party is carrying, which src/run.js hands in — a potion left at home is not a
// potion you can drink out there. Nothing else about drinking one changes with the store.
const SHELF = { heldOf, take: (mid, n) => give(mid, -n) };

const POTION = Object.fromEntries(MATERIALS.filter((m) => m.drink).map((m) => [m.id, m]));

// Drunk in town and waiting on the next job out, and drunk on the road and working now.
// Nothing here survives the run it was drunk into; see clear().
const waiting = new Set();
const working = new Set();
let rallied = false; // whether the one getting-up this run has been spent

export function isPotion(mid) {
  return !!POTION[mid];
}

export function effectOf(mid) {
  return (POTION[mid] && POTION[mid].drink) || {};
}

export function potions() {
  return Object.values(POTION);
}

// What is in the given store that could be drunk at all, whether or not it can be drunk
// now.
export function carried(store = SHELF) {
  return Object.keys(POTION).filter((mid) => store.heldOf(mid) > 0);
}

// Already drunk and not yet spent: a second one would do nothing, so it is not offered.
export function taken(mid) {
  return waiting.has(mid) || working.has(mid);
}

export function canDrink(mid, store = SHELF) {
  return isPotion(mid) && store.heldOf(mid) > 0 && !taken(mid);
}

// Drink one. `onRun` is the party standing at a camp with a run under them: it goes to
// work now. Otherwise it is drunk in town and goes to work at the gate of the next job.
// Returns what it did, so the screen that asked can say so.
export function drink(mid, onRun = false, store = SHELF) {
  if (!canDrink(mid, store)) return null;
  store.take(mid, 1);
  (onRun ? working : waiting).add(mid);
  return { mid, name: nameOf(mid), effect: effectOf(mid), now: onRun };
}

// Called by src/run.js at the gate. Everything drunk in town goes to work on this run,
// and what it puts in the pool before the first node is the number handed back.
export function takeUp() {
  let con = 0;
  for (const mid of waiting) {
    working.add(mid);
    con += effectOf(mid).con || 0;
  }
  waiting.clear();
  return con;
}

// A run is over: whatever was working is used up. Constitution is a within-run resource
// and so is everything that was ever going to change it.
export function clear() {
  working.clear();
  rallied = false;
}

function sum(field) {
  return [...working].reduce((n, mid) => n + (effectOf(mid)[field] || 0), 0);
}

export function guard() {
  return sum('guard');
}

export function steady() {
  return sum('steady');
}

function any(field) {
  return [...working].some((mid) => effectOf(mid)[field]);
}

export function daylight() {
  return any('daylight');
}

export function sure() {
  return any('sure');
}

// The best getting-up in force, handed over once and then gone. Spent rather than read,
// because a rally that could be read twice is a party that never falls over.
export function spendRally() {
  if (rallied) return 0;
  const best = [...working].reduce((n, mid) => Math.max(n, effectOf(mid).rally || 0), 0);
  if (!best) return 0;
  rallied = true;
  return best;
}

// What is in force, and what is drunk and waiting — both as rows the pack and the card
// can show without either of them knowing what a potion is.
export function forceRows() {
  return [...working].map((mid) => ({ mid, name: nameOf(mid), body: linesFor(mid) }));
}

export function waitingRows() {
  return [...waiting].map((mid) => ({ mid, name: nameOf(mid), body: linesFor(mid) }));
}

// A potion's numbers said in words, because a number on its own on a card is a puzzle.
export function linesFor(mid) {
  const e = effectOf(mid);
  const out = [];
  if (e.con) out.push(`${e.con} constitution back into the pool.`);
  if (e.guard) out.push(`${e.guard} less off the pool at every node.`);
  if (e.steady) out.push(`${e.steady} on every check the party rolls.`);
  if (e.daylight) out.push('The dark stops costing extra.');
  if (e.sure) out.push('The work cannot be botched.');
  if (e.rally) out.push('The first one carried gets up again.');
  return out;
}
