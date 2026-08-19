// The stones that have been cut, and nothing else. A rough stone comes off a mining node
// and goes in the pack with everything else; the moment it is cut it stops being a
// material and becomes one of these, because a stone that is going to be set in something
// is not a stack of anything. content/gems.js says what a stone is worth; this says which
// ones exist.
//
// Where a stone is is not here any more. There is no cord: a cut stone is set into a
// socket of something worn — a masterwork weapon or piece of armour, or any jewellery at
// all — and src/gear.js is what knows which stone is in which piece. So a stone costs the
// pack nothing now either: it is in the sword, and nobody carries a sword in a bag.

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
// two stones — one can be set in a ring and the other left in a drawer. How many of each
// are in a setting is src/gear.js's business, and the shelf is this less that.
const held = new Map();

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
// more: which stone goes into which setting is answered at the gate, not here. `where` is
// the one thing this file cannot answer for itself — src/gear.js knows what is set in
// what — so the caller hands it in rather than this reaching across for it. The icon is
// the gem's own id — see src/icons.js — so all three grades of a stone share one picture.
export function cutRows(where = () => null) {
  return cutStones().map((s) => {
    const set = where(s.key);
    return {
      label: fullName(s.gem, s.grade),
      note: set ? 'Set' : `x${s.n}`,
      n: s.n,
      key: s.key,
      icon: s.gem.id,
      body: [
        `${worthLine(s.gem, s.grade)}${set ? `, and set in your ${set.toLowerCase()}.` : '.'}`,
        ...s.gem.body,
      ],
    };
  });
}
