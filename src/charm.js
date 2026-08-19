// The stones that have been cut, which of them went out on this job, and the one being
// worn. A rough stone comes off a mining node and goes in the pack with everything else;
// the moment it is cut it stops being a material and becomes one of these, because a worn
// thing is not a stack of anything. content/gems.js says what a stone is worth; this says
// which ones exist and where each one is.
//
// A stone is carried before it is worn. Taking one out of town costs a square of the pack
// the same as a stack of ore does — it is a thing, and things are carried — and only what
// is in the pack can go on the cord. Both are decided at the gate, on the packing screen
// in src/scenes/Quest.js, because they are decisions about the job you are about to walk
// rather than about a shelf in town. What is packed and what is worn are emptied when the
// run ends: the next job out is packed for on its own terms.

import { TUNING } from '../tuning.js';
import { GEMS } from '../content/gems.js';
import { SKILLS } from '../content/skills.js';

const GEM = Object.fromEntries(GEMS.map((g) => [g.id, g]));
const SKILL = Object.fromEntries(SKILLS.map((t) => [t.id, t]));

// The five numbers that are not skills, and what they are called when a stone is read.
// Anything else a gem names has to be a skill, or it moves nothing and boot says so.
const BODY = {
  con: 'Constitution', hp: 'Hit points', hit: 'Hit', guard: 'Guard', harm: 'Harm',
};

// Cut stones, by gem and grade: 'sapphire:fine'. Counted, because two identical stones are
// two stones — one can be carried and the other left at home. `inPack` is however many of
// each went out on this job, so the shelf is what is held less what is packed.
const held = new Map();
const inPack = new Map();
let wornKey = null;

// Content mistakes are said at boot, the way src/craft.js says a recipe's are: a stone
// cut from a material that is not there, a tier that does not match what it moves, or a
// stat that is neither one of the five nor a skill anybody could have.
const MATERIAL_IDS = new Set();
export function validate(materialIds) {
  for (const id of materialIds) MATERIAL_IDS.add(id);
  for (const g of GEMS) {
    if (!MATERIAL_IDS.has(g.rough)) console.warn(`${g.name}: no such material — ${g.rough}`);
    if (g.stats.length !== g.tier) {
      console.warn(`${g.name}: tier ${g.tier} moves ${g.stats.length} stat(s); a tier is the count.`);
    }
    for (const s of g.stats) {
      if (!BODY[s] && !SKILL[s]) console.warn(`${g.name}: no such stat or skill — ${s}`);
    }
  }
}

export function gemOf(id) {
  return GEM[id];
}

export function gradeOf(id) {
  return TUNING.gem.grades.find((g) => g.id === id);
}

// What the wheel made of it. The grades are written best first, so a cut is the first one
// it clears — and the last is written at zero, so there is always one it does.
export function gradeFor(quality) {
  return TUNING.gem.grades.find((g) => quality >= g.at) || TUNING.gem.grades[TUNING.gem.grades.length - 1];
}

export function keyOf(gemId, gradeId) {
  return `${gemId}:${gradeId}`;
}

function partsOf(key) {
  const [gemId, gradeId] = key.split(':');
  return { gem: GEM[gemId], grade: gradeOf(gradeId) };
}

// A stone comes off the wheel. Returns what it turned out to be, so the bench can say so.
export function cut(gemId, quality) {
  const gem = GEM[gemId];
  if (!gem) return null;
  const grade = gradeFor(quality);
  const key = keyOf(gemId, grade.id);
  held.set(key, (held.get(key) || 0) + 1);
  return { gem, grade, key };
}

export function countOf(key) {
  return held.get(key) || 0;
}

// every cut stone in the pack, best grade first and then by tier: a list is read for the
// best thing in it
export function cutStones() {
  return [...held.entries()]
    .filter(([, n]) => n > 0)
    .map(([key, n]) => ({ key, n, ...partsOf(key) }))
    .sort((a, b) => b.grade.worth - a.grade.worth || b.gem.tier - a.gem.tier);
}

// --- the pack -------------------------------------------------------------
// One square per stone, whatever grade it is: a stone does not stack, so two of them are
// two squares. The screen that packs is the one that counts the squares — see
// src/scenes/Quest.js at the gate and src/run.js out on the road — and this only says
// where each stone is.

export function packedCount(key) {
  return inPack.get(key) || 0;
}

// How many squares the stones are worth altogether, which is what a pack has less of.
export function packedTotal() {
  return [...inPack.values()].reduce((n, v) => n + v, 0);
}

export function shelfCount(key) {
  return countOf(key) - packedCount(key);
}

// And what went out, best first, one entry per stone rather than per kind: the pack draws
// a square for each.
export function packedStones() {
  return cutStones()
    .filter((s) => packedCount(s.key) > 0)
    .flatMap((s) => Array.from({ length: packedCount(s.key) }, () => ({
      key: s.key, gem: s.gem, grade: s.grade,
    })));
}

// Off the shelf and into the pack. The caller has already decided there is a square for
// it: room is the pack's arithmetic, not the stone's.
export function take(key) {
  if (shelfCount(key) < 1) return false;
  inPack.set(key, packedCount(key) + 1);
  return true;
}

// And back onto it. Putting the last one back takes it off the cord with it: you cannot
// wear what you did not bring.
export function putBack(key) {
  if (packedCount(key) < 1) return false;
  const left = packedCount(key) - 1;
  if (left) inPack.set(key, left); else inPack.delete(key);
  if (wornKey === key && !packedCount(key)) wornKey = null;
  return true;
}

// Tipped out on the ground to make a square, which is the one way a cut stone is lost.
// It does not come home, so it comes off the count of what is owned as well.
export function drop(key) {
  if (packedCount(key) < 1) return false;
  putBack(key); // out of the pack, and off the cord if that was the last one
  const rest = countOf(key) - 1;
  if (rest > 0) held.set(key, rest); else held.delete(key);
  return true;
}

// The run is over however it ended: everything carried is home on the shelf and the cord
// is empty. Packing is per job, so nothing about it survives the job.
export function clearPack() {
  inPack.clear();
  wornKey = null;
}

// The distinct stones in the pack, which is the whole of what can go on the cord: two of
// one stone are two squares and one choice.
export function packedKeys() {
  return [...new Set(packedStones().map((s) => s.key))];
}

// Changing the cord out on the road, at a fire. The next stone in the pack takes the
// place of the one on it, and past the last of them is nothing — so a party at a camp can
// put a charm on, swap it for another, or take it off, with one key and no list to walk.
export function cycle() {
  const keys = packedKeys();
  if (!keys.length) return worn();
  const at = keys.indexOf(wornKey);
  wornKey = at < 0 ? keys[0] : keys[at + 1] || null;
  return worn();
}

export function worn() {
  return wornKey ? { key: wornKey, ...partsOf(wornKey) } : null;
}

// Wearing is not spending: the stone stays in the pack and the pack is where it goes back
// to. Only what is in the pack can be worn — a charm left in town is doing nothing for
// anybody. Wearing the one already on takes it off, so one key does both.
export function wear(key) {
  if (packedCount(key) < 1) return null;
  wornKey = wornKey === key ? null : key;
  return worn();
}

export function takeOff() {
  wornKey = null;
}

// What the worn stone adds to one number. Every stat on it moves by the same amount —
// the grade's worth — so a tier three stone is three numbers at once rather than one
// bigger number.
export function bonus(stat) {
  const w = worn();
  return w && w.gem.stats.includes(stat) ? w.grade.worth : 0;
}

// --- text -----------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function nameOfStat(stat) {
  return BODY[stat] || (SKILL[stat] ? SKILL[stat].name : stat);
}

export function fullName(gem, grade) {
  return `${grade.name} ${gem.name}`;
}

// what a stone does, as one line: '+2 Guard, +2 Investigation'
export function worthLine(gem, grade) {
  return gem.stats.map((s) => `+${grade.worth} ${nameOfStat(s)}`).join(', ');
}

// And the squares the Inventory tab gives them, above the materials. A readout and no
// more: which stone goes on the cord is answered at the gate, not here. A stone being
// worn still says so, so the shelf never disagrees with the road. The icon is the gem's
// own id — see src/icons.js — so all three grades of a stone share one picture.
export function cutRows() {
  return cutStones().map((s) => ({
    label: fullName(s.gem, s.grade),
    note: s.key === wornKey ? 'Worn' : packedCount(s.key) ? 'Packed' : `x${s.n}`,
    n: s.n,
    key: s.key,
    icon: s.gem.id,
    body: [
      worthLine(s.gem, s.grade)
        + (s.key === wornKey ? ', and on the cord.' : packedCount(s.key) ? ', and out on the road.' : '.'),
      ...s.gem.body,
    ],
  }));
}
