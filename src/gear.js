// What has been forged, what is in it, and which of it is on. content/gear.js says what a
// piece is; tuning.js says what a grade is worth; content/gems.js says what a stone is;
// this says which pieces exist, where each one is, and which stones are set in it.
//
// Two ways this is not src/charm.js, which is now only the wheel and the shelf of cut
// stones it fills:
//
// A piece costs the pack nothing. A stone is a thing in a bag, but mail is on the body and
// a sword is on the belt, and neither of them is being carried. So there is no packing
// here — four slots, filled at the gate on the packing screen because that is where every
// decision about a job is made, and left filled afterwards because taking your armour off
// between jobs is not a decision anybody makes.
//
// And a piece is a thing rather than a kind of thing. Two masterwork daggers are two
// daggers with two different stones in them, so every piece forged gets its own number and
// is tracked one at a time. That is the whole reason this file does not count.
//
// A socket is what a masterwork piece is for. Everything short of the top grade holds
// nothing, and the exception is jewellery, which is nothing but sockets and holds them at
// any standard — see content/gear.js.
//
// And where a stone is set decides what it does. Jewellery is worn against the skin and a
// stone in it sharpens the wearer — skills, and a check rolled against them. A weapon or a
// piece of armour is metal, and a stone in metal does what metal does — the numbers a
// fight is decided on. The stone is the same stone; the setting is the question. See
// content/gems.js, which is where both halves of every stone are written.

import { TUNING } from '../tuning.js';
import { GEAR } from '../content/gear.js';
import {
  gemOf, gradeOf as gemGradeOf, countOf as cutCount, fullName as stoneName,
  nameOfStat as statName, statsFor, sideLine,
} from './charm.js';

const PIECE = Object.fromEntries(GEAR.map((g) => [g.id, g]));

// The slots, in the order they are read and drawn. A piece naming anything else is
// content said at boot rather than a piece nobody can put on.
export const SLOTS = ['weapon', 'offhand', 'body', 'jewellery'];

// The five numbers a piece or a stone can move, and what each is called on a readout.
const BODY = {
  con: 'Constitution', hp: 'Hit points', hit: 'Hit', guard: 'Guard', harm: 'Harm',
};

// Everything forged, oldest first, one entry per object:
//   { uid, pieceId, gradeId, sockets: [stoneKey | null, ...] }
const made = [];
let nextUid = 1;
// slot -> uid, or nothing in it
const on = new Map();

function topGrade() {
  return TUNING.gear.grades[0].id;
}

// Content mistakes are said at boot the way src/craft.js and src/charm.js say theirs.
for (const g of GEAR) {
  if (!SLOTS.includes(g.slot)) console.warn(`${g.name}: no such slot — ${g.slot}`);
  if (g.stat && !BODY[g.stat]) console.warn(`${g.name}: no such stat — ${g.stat}`);
  if (g.stat && TUNING.gear.scale[g.stat] === undefined) {
    console.warn(`${g.name}: ${g.stat} has no step in gear.scale in tuning.js, so the piece moves nothing.`);
  }
  // A piece that neither moves a number nor holds a stone is a piece with nothing to it.
  if (!g.stat && !g.sockets) console.warn(`${g.name}: moves nothing and holds nothing.`);
  if (!g.holds) console.warn(`${g.name}: no holds, so no stone will ever go in it.`);
}

export function pieceOf(id) {
  return PIECE[id];
}

export function gradeOf(id) {
  return TUNING.gear.grades.find((g) => g.id === id);
}

// What the anvil made of it. The grades are written best first, so a piece is the first
// one it clears — and the last is written at zero, so a finished piece is always a piece.
// A cracked one never reaches here; see src/craft.js.
export function gradeFor(quality) {
  return TUNING.gear.grades.find((g) => quality >= g.at)
    || TUNING.gear.grades[TUNING.gear.grades.length - 1];
}

// How many stones this object holds: what jewellery says, or the masterwork allowance for
// everything else, and nothing at all below the top grade.
export function socketsOn(w) {
  if (!w || !w.piece) return 0;
  if (w.piece.sockets) return w.piece.sockets;
  return w.grade.id === topGrade() ? TUNING.gear.socketsAtMasterwork : 0;
}

function shape(m) {
  return {
    uid: m.uid, piece: PIECE[m.pieceId], grade: gradeOf(m.gradeId), sockets: m.sockets,
  };
}

function rawOf(uid) {
  return made.find((m) => m.uid === uid);
}

// A piece comes off the anvil, with its sockets empty. Returns the object, so the bench
// can say what it turned out to be.
export function forge(pieceId, quality) {
  const piece = PIECE[pieceId];
  if (!piece) return null;
  const grade = gradeFor(quality);
  const m = { uid: nextUid++, pieceId, gradeId: grade.id, sockets: [] };
  made.push(m);
  const w = shape(m);
  m.sockets = Array.from({ length: socketsOn(w) }, () => null);
  return shape(m);
}

// Everything forged, best grade first and then by slot: a list is read for the best thing
// in it.
export function forged() {
  return made.map(shape)
    .sort((a, b) => b.grade.worth - a.grade.worth
      || SLOTS.indexOf(a.piece.slot) - SLOTS.indexOf(b.piece.slot)
      || a.uid - b.uid);
}

export function pieceAt(uid) {
  const m = rawOf(uid);
  return m ? shape(m) : null;
}

export function anyForged() {
  return made.length > 0;
}

// --- the slots --------------------------------------------------------------

export function wornIn(slot) {
  const uid = on.get(slot);
  return uid === undefined ? null : pieceAt(uid);
}

// Everything on, in slot order, skipping the empty ones.
export function wornAll() {
  return SLOTS.map((s) => wornIn(s)).filter(Boolean);
}

export function isWorn(uid) {
  const w = pieceAt(uid);
  return !!(w && on.get(w.piece.slot) === uid);
}

// On and off with one key: putting on the piece already in the slot takes it off, and
// putting on a second one displaces the first back onto the shelf. Nothing is lost either
// way, and a displaced piece keeps whatever is set in it.
export function wear(uid) {
  const w = pieceAt(uid);
  if (!w) return null;
  if (on.get(w.piece.slot) === uid) on.delete(w.piece.slot);
  else on.set(w.piece.slot, uid);
  return wornIn(w.piece.slot);
}

export function takeOffAll() {
  on.clear();
}

// --- the sockets ------------------------------------------------------------

// Every socket in the game, worn or not, as one flat list. `at` is which socket of that
// piece it is, so a bracelet's two are told apart.
export function allSockets() {
  return forged().flatMap((w) => w.sockets.map((key, at) => ({ w, at, key })));
}

// How many of one cut stone are set in something, so the shelf can say what is left. The
// screen that draws the shelf does the subtraction: this file knows where stones are and
// src/charm.js knows how many were ever cut.
export function setCount(stoneKey) {
  return allSockets().filter((s) => s.key === stoneKey).length;
}

export function shelfCount(stoneKey) {
  return cutCount(stoneKey) - setCount(stoneKey);
}

// Where a stone is, said in one line, for the Inventory tab.
export function setIn(stoneKey) {
  const at = allSockets().find((s) => s.key === stoneKey);
  return at ? at.w : null;
}

// Whether this piece could hold this stone at all: it has to have a socket free, and the
// stone has to be no finer than the metal will carry. Bronze holds tier one, which is what
// the Greywood pays out; a tier two stone in a bronze setting is a stone waiting for iron.
// This asks nothing about whether such a stone is to hand — moving one that is already set
// is the same question, and it is already out of the drawer.
export function couldHold(uid, stoneKey) {
  const w = pieceAt(uid);
  if (!w) return null;
  if (!w.sockets.length) return 'nosocket';
  if (w.sockets.every((k) => k !== null)) return 'full';
  const gem = gemOf(stoneKey.split(':')[0]);
  if (!gem) return 'nogem';
  if (gem.tier > (w.piece.holds || 0)) return 'toofine';
  return 'yes';
}

// And whether it will take one now, which is that plus having one on the shelf.
export function willTake(uid, stoneKey) {
  if (shelfCount(stoneKey) < 1) return 'none';
  return couldHold(uid, stoneKey);
}

// Set a stone into the first free socket of a piece. Returns which socket took it.
export function setStone(uid, stoneKey) {
  if (willTake(uid, stoneKey) !== 'yes') return null;
  const m = rawOf(uid);
  const at = m.sockets.indexOf(null);
  m.sockets[at] = stoneKey;
  return at;
}

// And back out onto the shelf. A setting is not a weld: a stone goes in and comes out, and
// the piece is unchanged by having held one.
export function pullStone(uid, at) {
  const m = rawOf(uid);
  if (!m || !m.sockets[at]) return null;
  const key = m.sockets[at];
  m.sockets[at] = null;
  return key;
}

// Every setting this stone could go into, jewellery first: jewellery is what a setting is
// for, so it is the one offered before the rest. A socket already holding this stone is in
// the list too, which is what lets one key walk it along them.
function couldTake(stoneKey) {
  const order = [...wornAll()].sort(
    (a, b) => (b.piece.slot === 'jewellery') - (a.piece.slot === 'jewellery'),
  );
  return order.filter((w) => couldHold(w.uid, stoneKey) === 'yes'
    || w.sockets.includes(stoneKey));
}

// Where the next press would put it. Nothing if there is nowhere for it to go.
export function firstTaking(stoneKey) {
  const list = couldTake(stoneKey);
  const at = list.findIndex((w) => w.sockets.includes(stoneKey));
  return at < 0 ? (list[0] || null) : (list[at + 1] || null);
}

// One key walks a stone along every setting that will have it and then off the end of
// them, which is how the cord used to work and is the same reason: a player who wants the
// stone in the sword rather than the ring should not have to be asked a question to say
// so. Returns where it ended up, or nothing for taken out.
export function cycleStone(stoneKey) {
  const list = couldTake(stoneKey);
  const at = list.findIndex((w) => w.sockets.includes(stoneKey));
  // Out first and in second, so the shelf has it back before setStone asks for it.
  if (at >= 0) pullStone(list[at].uid, list[at].sockets.indexOf(stoneKey));
  const next = at < 0 ? list[0] : list[at + 1];
  if (!next) return null;
  setStone(next.uid, stoneKey);
  return pieceAt(next.uid);
}

// --- what it is all worth ---------------------------------------------------

// What everything on adds to one number: each piece's own step, and every stone set in it.
// Two pieces moving the same number both count — a shield and a plate are two different
// things in front of you — and so do two stones saying the same thing.
export function bonus(stat) {
  let n = 0;
  for (const w of wornAll()) {
    if (w.piece.stat === stat) n += w.grade.worth * (TUNING.gear.scale[stat] || 0);
    for (const key of w.sockets) {
      if (!key) continue;
      const [gemId, gradeId] = key.split(':');
      const gem = gemOf(gemId);
      const grade = gemGradeOf(gradeId);
      // A stone is worth what it was cut to, in whichever of its two halves this setting
      // reads: skills against the skin, the fighting numbers in metal. So the same stone
      // in a ring and in a sword adds to two different things and never to both.
      // A body stat is scaled the same way the piece's own is — a point of hit points is
      // not a point of guard, and a stone in the metal is moving the metal's numbers, so
      // it moves them in the metal's units. A skill has no scale and takes none: a point
      // of Insight is a point of Insight wherever it came from.
      if (gem && grade && statsFor(gem, w.piece.slot).includes(stat)) {
        n += grade.worth * (TUNING.gear.scale[stat] ?? 1);
      }
    }
  }
  return n;
}

// --- text -------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function nameOfStat(stat) {
  return BODY[stat] || statName(stat);
}

export function fullName(piece, grade) {
  return `${grade.name} ${piece.name}`;
}

export function slotName(slot) {
  return slot[0].toUpperCase() + slot.slice(1);
}

// what a piece does on its own, before anything is set in it: '+2 Guard', or what its
// sockets are for where it does nothing else
export function worthLine(piece, grade) {
  if (!piece.stat) {
    const n = piece.sockets || 0;
    return `${n} setting${n === 1 ? '' : 's'}, and nothing else`;
  }
  return `+${grade.worth * (TUNING.gear.scale[piece.stat] || 0)} ${nameOfStat(piece.stat)}`;
}

// and the sockets, said as what is in them and what it is doing there, because a stone in
// a ring and the same stone in a sword are not the same stone to look at:
// '[Flawless Garnet, +3 Fording] [empty]'
export function socketLine(w) {
  if (!w.sockets.length) return '';
  return w.sockets.map((key) => {
    if (!key) return '[empty]';
    const [gemId, gradeId] = key.split(':');
    const gem = gemOf(gemId);
    const grade = gemGradeOf(gradeId);
    return `[${stoneName(gem, grade)}, ${sideLine(gem, grade, w.piece.slot)}]`;
  }).join(' ');
}


// One piece, said in full: what it is, what it does, and what is in it.
export function pieceLine(w) {
  const sockets = socketLine(w);
  return `${fullName(w.piece, w.grade)} — ${worthLine(w.piece, w.grade)}${sockets ? `  ${sockets}` : ''}`;
}

// And the squares the Inventory tab gives them, above the stones. A readout and no more:
// what is worn and what is set in it is answered at the gate, not here.
export function gearRows() {
  return forged().map((w) => ({
    label: fullName(w.piece, w.grade),
    note: isWorn(w.uid) ? 'Worn' : '',
    n: 1,
    key: `gear:${w.uid}`,
    icon: w.piece.id,
    body: [
      `${slotName(w.piece.slot)}. ${worthLine(w.piece, w.grade)}${isWorn(w.uid) ? ', and on.' : '.'}`,
      w.sockets.length
        ? `${w.sockets.length} setting${w.sockets.length === 1 ? '' : 's'}: ${socketLine(w)}`
        : 'No settings — it did not come off the anvil good enough to take one.',
      ...w.piece.body,
    ],
  }));
}
