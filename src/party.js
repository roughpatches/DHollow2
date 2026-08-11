// What a playable character is right now: level, XP, the HP they have left, and what
// their traits are worth. content/party.js says what they start as; this says where
// they have got to. Every number it works from is in tuning.js.

import { TUNING } from '../tuning.js';
import { PARTY } from '../content/party.js';
import { TRAITS } from '../content/traits.js';
import { FEARS } from '../content/fears.js';
import * as story from './story.js';

const TRAIT = Object.fromEntries(TRAITS.map((t) => [t.id, t]));
const FEAR = Object.fromEntries(FEARS.map((f) => [f.id, f]));

const state = new Map(PARTY.map((c) => [c.id, { level: 1, xp: 0, hp: c.hp, bond: c.bond || 0 }]));

// a miscounted or misspelt trait list is a content mistake, and content mistakes are
// said out loud at boot rather than found later in a wrong bonus
for (const c of PARTY) {
  const bad = c.traits.filter((t) => !TRAIT[t]);
  if (bad.length) console.warn(`${c.name}: no such trait — ${bad.join(', ')}`);
  if (c.traits.length !== TUNING.traitsAtLevelOne) {
    console.warn(`${c.name}: ${c.traits.length} traits, expected ${TUNING.traitsAtLevelOne}`);
  }
}

// everyone who could ever be recruited, whether or not they are yet
export function everyone() {
  return PARTY;
}

// and everyone who can be, right now
export function roster() {
  return PARTY.filter((c) => story.ok(c));
}

export function charOf(id) {
  return PARTY.find((c) => c.id === id);
}

export function stateOf(id) {
  return state.get(id);
}

export function hpMax(id) {
  return charOf(id).hp + TUNING.hpPerLevel * (stateOf(id).level - 1);
}

// leaving a level costs more than leaving the one before it
export function xpToNext(level) {
  return level >= TUNING.maxLevel ? Infinity : TUNING.xpBase * level;
}

// returns how many levels were gained, so a caller can say so
export function award(id, xp) {
  const s = stateOf(id);
  if (s.level >= TUNING.maxLevel) return 0; // XP past the last level has nowhere to go
  s.xp += xp;
  let gained = 0;
  while (s.xp >= xpToNext(s.level)) {
    s.xp -= xpToNext(s.level);
    s.level += 1;
    s.hp += TUNING.hpPerLevel; // a level heals you by exactly what it gave you
    gained += 1;
  }
  return gained;
}

export function levelUp(id) {
  const s = stateOf(id);
  return award(id, Math.max(0, xpToNext(s.level) - s.xp));
}

export function damage(id, n) {
  const s = stateOf(id);
  s.hp = Math.max(0, s.hp - n);
  return s.hp;
}

export function heal(id, n) {
  const s = stateOf(id);
  s.hp = Math.min(hpMax(id), s.hp + n);
  return s.hp;
}

// --- bonds ----------------------------------------------------------------
// A number that goes up. Everything that reads it reads it through bandOf.

export function bandOf(id) {
  return Math.min(TUNING.bondNames.length - 1, Math.floor(stateOf(id).bond / TUNING.bondPerBand));
}

export function bandName(band) {
  return TUNING.bondNames[Math.max(0, Math.min(TUNING.bondNames.length - 1, band))];
}

export function raiseBond(id, n = TUNING.bondPerRun) {
  const s = stateOf(id);
  s.bond = Math.min(s.bond + n, (TUNING.bondNames.length - 1) * TUNING.bondPerBand);
  return s.bond;
}

export function traitsOf(id) {
  return charOf(id).traits.map((t) => TRAIT[t]).filter(Boolean);
}

export function has(id, traitId) {
  return charOf(id).traits.includes(traitId);
}

// What an activity asks: how much is this character worth at it, and what extra can
// they do that somebody without the trait cannot. Two functions is the whole contract.
export function bonusFor(id, activity) {
  return traitsOf(id)
    .filter((t) => t.activities.includes(activity))
    .reduce((n, t) => n + t.bonus, 0);
}

export function unlocksFor(id, activity) {
  return traitsOf(id)
    .filter((t) => !activity || t.activities.includes(activity))
    .flatMap((t) => t.unlocks);
}

// --- menu rows ------------------------------------------------------------
// Rebuilt on every draw rather than held, because level and HP move while the game runs.

export function partyRows() {
  return roster().map((c) => {
    const s = stateOf(c.id);
    const next = xpToNext(s.level);
    const traits = traitsOf(c.id);
    const fears = (c.fears || []).map((f) => FEAR[f]).filter(Boolean);
    return {
      label: c.name,
      note: `Lv ${s.level} · ${s.hp}/${hpMax(c.id)}`,
      body: [
        `Level ${s.level}    HP ${s.hp} of ${hpMax(c.id)}    `
          + (next === Infinity ? `XP ${s.xp}  (max level)` : `XP ${s.xp} of ${next}`),
        `Bond: ${bandName(bandOf(c.id))} (${s.bond} points).`,
        traits.map((t) => `${t.name} +${t.bonus} — ${t.activities.join(', ')}`).join('\n'),
        fears.length
          ? fears.map((f) => `${f.name} — ${f.kind === 'scruple' ? 'will not do it' : 'will not face it'}`).join('\n')
          : 'Nothing they will not walk into.',
        ...c.body,
      ],
    };
  });
}

export const TRAIT_ROWS = TRAITS.map((t) => ({
  label: t.name,
  note: `+${t.bonus}`,
  body: [
    `Adds ${t.bonus} to ${t.activities.join(', ')}.`,
    t.unlocks.map((u) => `— ${u}`).join('\n'),
    ...t.body,
  ],
}));
