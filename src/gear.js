// What has been forged, and which of it is on. content/gear.js says what a piece is;
// tuning.js says what a grade is worth; this says which pieces exist and where each one
// is.
//
// The one way this is not src/charm.js: a piece of gear costs the pack nothing. A stone
// is a thing in a bag and takes a square like any other thing in a bag, but mail is on
// the body and a sword is on the belt, and neither of them is being carried. So there is
// no packing here — only three slots, filled at the gate on the packing screen because
// that is where every decision about a job is made, and left filled afterwards because
// taking your armour off between jobs is not a decision anybody makes.
//
// Three slots and one thing in each. Two pieces that share a slot are a question the
// party is asked — the mail or the plate, the dagger or the sword — and a piece in a slot
// nothing else fills is just an upgrade with extra steps.

import { TUNING } from '../tuning.js';
import { GEAR } from '../content/gear.js';

const PIECE = Object.fromEntries(GEAR.map((g) => [g.id, g]));

// The slots, in the order they are read and drawn. A piece naming anything else is
// content said at boot rather than a piece nobody can put on.
export const SLOTS = ['weapon', 'offhand', 'body'];

// The five numbers a piece can move, and what each is called on a readout. The same list
// src/charm.js keeps, because a stone and a shield are read on one screen and have to be
// spelled the same way.
const BODY = {
  con: 'Constitution', hp: 'Hit points', hit: 'Hit', guard: 'Guard', harm: 'Harm',
};

// Forged pieces, by piece and grade: 'bronzedagger:sound'. Counted, because two swords
// are two swords even if only one of them is ever on.
const held = new Map();
// slot -> key, or nothing in it
const on = new Map();

// Content mistakes are said at boot the way src/craft.js and src/charm.js say theirs.
for (const g of GEAR) {
  if (!SLOTS.includes(g.slot)) console.warn(`${g.name}: no such slot — ${g.slot}`);
  if (!BODY[g.stat]) console.warn(`${g.name}: no such stat — ${g.stat}`);
  if (TUNING.gear.scale[g.stat] === undefined) {
    console.warn(`${g.name}: ${g.stat} has no step in gear.scale in tuning.js, so the piece moves nothing.`);
  }
}

export function pieceOf(id) {
  return PIECE[id];
}

export function gradeOf(id) {
  return TUNING.gear.grades.find((g) => g.id === id);
}

// What the anvil made of it. The grades are written best first, so a piece is the first
// one it clears — and the last is written at zero, so a botched forge is a poor piece and
// never nothing. Bronze is dear enough that losing the bar as well would make the bench a
// thing nobody touches twice.
export function gradeFor(quality) {
  return TUNING.gear.grades.find((g) => quality >= g.at)
    || TUNING.gear.grades[TUNING.gear.grades.length - 1];
}

export function keyOf(pieceId, gradeId) {
  return `${pieceId}:${gradeId}`;
}

function partsOf(key) {
  const [pieceId, gradeId] = key.split(':');
  return { piece: PIECE[pieceId], grade: gradeOf(gradeId) };
}

// A piece comes off the anvil. Returns what it turned out to be, so the bench can say so.
export function forge(pieceId, quality) {
  const piece = PIECE[pieceId];
  if (!piece) return null;
  const grade = gradeFor(quality);
  const key = keyOf(pieceId, grade.id);
  held.set(key, (held.get(key) || 0) + 1);
  return { piece, grade, key };
}

export function countOf(key) {
  return held.get(key) || 0;
}

// Everything forged, best grade first: a list is read for the best thing in it.
export function forged() {
  return [...held.entries()]
    .filter(([, n]) => n > 0)
    .map(([key, n]) => ({ key, n, ...partsOf(key) }))
    .sort((a, b) => b.grade.worth - a.grade.worth || a.piece.slot.localeCompare(b.piece.slot));
}

export function anyForged() {
  return forged().length > 0;
}

// --- the slots --------------------------------------------------------------

export function wornIn(slot) {
  const key = on.get(slot);
  return key ? { key, ...partsOf(key) } : null;
}

// Everything on, in slot order, skipping the empty ones.
export function wornAll() {
  return SLOTS.map((s) => wornIn(s)).filter(Boolean);
}

export function isWorn(key) {
  const piece = partsOf(key).piece;
  return !!(piece && on.get(piece.slot) === key);
}

// On and off with one key, the way the cord is: putting on the piece already in the slot
// takes it off, and putting on a second one displaces the first back onto the shelf. What
// is displaced is not lost — nothing here is spent, only moved.
export function wear(key) {
  const { piece } = partsOf(key);
  if (!piece || countOf(key) < 1) return null;
  if (on.get(piece.slot) === key) on.delete(piece.slot);
  else on.set(piece.slot, key);
  return wornIn(piece.slot);
}

export function takeOffAll() {
  on.clear();
}

// What everything on adds to one number. Two pieces moving the same number both count —
// a shield and a plate are two different things in front of you — and a piece's step is
// its grade's worth times what that stat is scaled at in tuning.js.
export function bonus(stat) {
  return wornAll().reduce((n, w) => (
    w.piece.stat === stat ? n + w.grade.worth * (TUNING.gear.scale[stat] || 0) : n
  ), 0);
}

// --- text -------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function nameOfStat(stat) {
  return BODY[stat] || stat;
}

export function fullName(piece, grade) {
  return `${grade.name} ${piece.name}`;
}

export function slotName(slot) {
  return slot === 'offhand' ? 'Offhand' : slot[0].toUpperCase() + slot.slice(1);
}

// what a piece does, as one line: '+2 Guard'
export function worthLine(piece, grade) {
  return `+${grade.worth * (TUNING.gear.scale[piece.stat] || 0)} ${nameOfStat(piece.stat)}`;
}

// And the squares the Inventory tab gives them, above the stones. A readout and no more:
// which piece goes on is answered at the gate, not here.
export function gearRows() {
  return forged().map((w) => ({
    label: fullName(w.piece, w.grade),
    note: isWorn(w.key) ? 'Worn' : `x${w.n}`,
    n: w.n,
    key: w.key,
    icon: w.piece.id,
    body: [
      `${slotName(w.piece.slot)}. ${worthLine(w.piece, w.grade)}${isWorn(w.key) ? ', and on.' : '.'}`,
      ...w.piece.body,
    ],
  }));
}
