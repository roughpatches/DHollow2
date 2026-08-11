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

// a misspent or misspelt trait list is a content mistake, and content mistakes are
// said out loud at boot rather than found later in a wrong bonus
for (const c of PARTY) {
  const spent = Object.entries(c.traits);
  const bad = spent.filter(([t]) => !TRAIT[t]).map(([t]) => t);
  if (bad.length) console.warn(`${c.name}: no such trait — ${bad.join(', ')}`);
  if (spent.length !== TUNING.traitsAtLevelOne) {
    console.warn(`${c.name}: ${spent.length} traits, expected ${TUNING.traitsAtLevelOne}`);
  }
  const points = spent.reduce((n, [, r]) => n + r, 0);
  if (points !== TUNING.traitPointsAtLevelOne) {
    console.warn(`${c.name}: ${points} trait points, expected ${TUNING.traitPointsAtLevelOne}`);
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

// --- traits ---------------------------------------------------------------
// A trait is the points spent on it. Everything below is that number, read a different
// way: added to an activity, added to a die, or added up across a party.

export function traitOf(traitId) {
  return TRAIT[traitId];
}

export function rankOf(id, traitId) {
  return charOf(id).traits[traitId] || 0;
}

// what one point is worth to an activity, and so what a rank is worth
export function worthOf(rank) {
  return rank * TUNING.traitBonusPerPoint;
}

// best first, because a sheet is read for what somebody is good at
export function traitsOf(id) {
  return Object.entries(charOf(id).traits)
    .filter(([t]) => TRAIT[t])
    .map(([t, rank]) => ({ ...TRAIT[t], rank }))
    .sort((a, b) => b.rank - a.rank);
}

export function has(id, traitId) {
  return rankOf(id, traitId) > 0;
}

// What an activity asks: how much is this character worth at it, and what extra can
// they do that somebody without the trait cannot. Two functions is the whole contract.
export function bonusFor(id, activity) {
  return traitsOf(id)
    .filter((t) => t.activities.includes(activity))
    .reduce((n, t) => n + worthOf(t.rank), 0);
}

// --- rolls and party scores ------------------------------------------------

// Who in a party is best at something, and how good the party is at it as a body. The
// first decides who makes a roll; the second decides what work of that kind pays.
export function bestAt(ids, traitId) {
  return ids.reduce((a, b) => (rankOf(b, traitId) > rankOf(a, traitId) ? b : a), ids[0]) || null;
}

export function scoreOf(ids, traitId) {
  return ids.reduce((n, id) => n + rankOf(id, traitId), 0);
}

// A check against a DC: a die, plus what the trait is worth, rolled by the party's best
// at it. A natural top holds whatever the DC, and a natural 1 never does, so a hard
// check is never impossible and an easy one is never free.
export function check(ids, traitId, dc) {
  const who = bestAt(ids, traitId);
  const rank = who ? rankOf(who, traitId) : 0;
  const die = 1 + Math.floor(Math.random() * TUNING.checkDie);
  const total = die + rank;
  return {
    name: who ? charOf(who).name : 'Nobody',
    trait: TRAIT[traitId],
    rank,
    die,
    total,
    dc,
    pass: die === TUNING.checkDie || (die > 1 && total >= dc),
  };
}

export function unlocksFor(id, activity) {
  return traitsOf(id)
    .filter((t) => !activity || t.activities.includes(activity))
    .flatMap((t) => t.unlocks);
}

// what a given set of people are worth as a body, best first — the readout behind
// deciding who to take
export function scoreLine(ids) {
  const scores = TRAITS.map((t) => [t.name, scoreOf(ids, t.id)])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  return scores.length ? scores.map(([n, v]) => `${n} ${v}`).join('   ') : 'Nothing between them.';
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
        traits.map((t) => `${t.name} ${t.rank} — +${worthOf(t.rank)} to ${t.activities.join(', ')}`).join('\n'),
        fears.length
          ? fears.map((f) => `${f.name} — ${f.kind === 'scruple' ? 'will not do it' : 'will not face it'}`).join('\n')
          : 'Nothing they will not walk into.',
        ...c.body,
      ],
    };
  });
}

// Who has the points is the thing worth knowing about a trait, so the tab is rebuilt
// on every draw and says it out loud rather than describing the trait in the abstract.
export function traitRows() {
  return TRAITS.map((t) => {
    const held = roster()
      .filter((c) => has(c.id, t.id))
      .sort((a, b) => rankOf(b.id, t.id) - rankOf(a.id, t.id));
    const score = scoreOf(roster().map((c) => c.id), t.id);
    return {
      label: t.name,
      note: `${score} in town`,
      body: [
        `A point adds ${TUNING.traitBonusPerPoint} to ${t.activities.join(', ')}, one to any ${t.name} roll, `
          + `and ${Math.round(TUNING.traitYieldPerPoint * 100)}% to what work of that kind pays the party.`,
        held.length
          ? held.map((c) => `${c.name} ${rankOf(c.id, t.id)}`).join('\n')
          : 'Nobody in Dreadhollow has spent a point on this.',
        t.unlocks.map((u) => `— ${u}`).join('\n'),
        ...t.body,
      ],
    };
  });
}
