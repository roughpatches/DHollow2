// The stones that have been cut, and the one being worn. A rough stone comes off a mining
// node and goes in the pack with everything else; the moment it is cut it stops being a
// material and becomes one of these, because a worn thing is not a stack of anything.
// content/gems.js says what a stone is worth; this says which ones exist and which one is
// on. Only the player wears a charm — one at a time, in the slot that is already on the
// Equipment tab.

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
// two stones — one can be worn and the other kept.
const held = new Map();
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

export function worn() {
  return wornKey ? { key: wornKey, ...partsOf(wornKey) } : null;
}

// Wearing is not spending: the stone stays in the pack and the pack is where it goes back
// to. Wearing the one already on takes it off, so one key does both.
export function wear(key) {
  if (!held.has(key) || countOf(key) < 1) return null;
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

// The Charm row on the Equipment tab, in the {label, note, body} shape every tab uses.
// With nothing on, it says what the slot is for rather than saying nothing.
export function charmRow() {
  const w = worn();
  if (!w) {
    return {
      label: 'Charm',
      note: 'Empty',
      body: [
        'Nothing on the cord. The slot a cut stone goes in, and the only one that changes a number rather than describing you.',
        'Cut something at the wheel in the corner of the smithy and it can go here.',
      ],
    };
  }
  return {
    label: 'Charm',
    note: fullName(w.gem, w.grade),
    body: [worthLine(w.gem, w.grade) + '.', ...w.gem.body],
  };
}

// And the squares the Inventory tab gives them, above the materials. A stone being worn
// says so where it sits, so the pack never disagrees with the slot. The icon is the gem's
// own id — see src/icons.js — so all three grades of a stone share one picture.
export function cutRows() {
  return cutStones().map((s) => ({
    label: fullName(s.gem, s.grade),
    note: s.key === wornKey ? 'Worn' : `x${s.n}`,
    icon: s.gem.id,
    gem: s.key, // what the menu reads to put it on with [Enter]
    body: [
      worthLine(s.gem, s.grade) + (s.key === wornKey ? ', and on.' : '.'),
      ...s.gem.body,
    ],
  }));
}
