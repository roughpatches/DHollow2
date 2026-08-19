// What a potion does, and how long it does it for.
//
// A potion is drunk in two places and nowhere else: in town, where it takes the next job
// out, and at a camp on the road, where it takes the rest of the one being walked. The
// bottle is gone either way, and nothing that has been drunk is carried home.
//
// A potion is a material in content/materials.js carrying `drink`, and `drink` is three
// numbers, all of them optional:
//   con    — constitution straight into the pool. On the road it lands the moment it is
//            drunk; drunk in town it is in the pool at the gate.
//   guard  — this much less off the pool at every node for the rest of the run.
//   steady — this much on every skill check the party rolls for the rest of the run.
// Nothing else in the game reads a potion. A new potion is one entry in
// content/materials.js and a recipe to make it; a new kind of potion is a field here and
// the one line in src/run.js that reads it.
//
// One of each in force at a time. A second bottle of something already working is not
// drunk rather than drunk for nothing, so nobody pours four salves into one road.

import { MATERIALS } from '../content/materials.js';
import { heldOf, give, nameOf } from './town.js';

const POTION = Object.fromEntries(MATERIALS.filter((m) => m.drink).map((m) => [m.id, m]));

// Drunk in town and waiting on the next job out, and drunk on the road and working now.
// Nothing here survives the run it was drunk into; see clear().
const waiting = new Set();
const working = new Set();

export function isPotion(mid) {
  return !!POTION[mid];
}

export function effectOf(mid) {
  return (POTION[mid] && POTION[mid].drink) || {};
}

export function potions() {
  return Object.values(POTION);
}

// What is in the pack that could be drunk at all, whether or not it can be drunk now.
export function carried() {
  return Object.keys(POTION).filter((mid) => heldOf(mid) > 0);
}

// Already drunk and not yet spent: a second one would do nothing, so it is not offered.
export function taken(mid) {
  return waiting.has(mid) || working.has(mid);
}

export function canDrink(mid) {
  return isPotion(mid) && heldOf(mid) > 0 && !taken(mid);
}

// Drink one. `onRun` is the party standing at a camp with a run under them: it goes to
// work now. Otherwise it is drunk in town and goes to work at the gate of the next job.
// Returns what it did, so the screen that asked can say so.
export function drink(mid, onRun = false) {
  if (!canDrink(mid)) return null;
  give(mid, -1);
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
  return out;
}
