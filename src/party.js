// What a playable character is right now: level, XP, the HP they have left, and what
// their skills are worth. content/party.js says what they start as; this says where
// they have got to. Every number it works from is in tuning.js.

import { TUNING } from '../tuning.js';
import { PARTY } from '../content/party.js';
import { SKILLS } from '../content/skills.js';
import { FEARS } from '../content/fears.js';
import * as story from './story.js';

const SKILL = Object.fromEntries(SKILLS.map((t) => [t.id, t]));
const FEAR = Object.fromEntries(FEARS.map((f) => [f.id, f]));

// Skills live here rather than in content/party.js because the player's are chosen in
// the hut and everyone's could move later; content says what they start as.
const state = new Map(PARTY.map((c) => [c.id, {
  level: 1, xp: 0, hp: c.hp, bond: c.bond || 0, skills: { ...c.skills },
}]));

// a misspent or misspelt skill list is a content mistake, and content mistakes are
// said out loud at boot rather than found later in a wrong bonus. The player's three
// are not written down anywhere to be wrong yet.
for (const c of PARTY.filter((x) => !x.you)) {
  const spent = Object.entries(c.skills);
  const bad = spent.filter(([t]) => !SKILL[t]).map(([t]) => t);
  if (bad.length) console.warn(`${c.name}: no such skill — ${bad.join(', ')}`);
  if (spent.length !== TUNING.skillsAtLevelOne) {
    console.warn(`${c.name}: ${spent.length} skills, expected ${TUNING.skillsAtLevelOne}`);
  }
  const points = spent.reduce((n, [, r]) => n + r, 0);
  if (points !== TUNING.skillPointsAtLevelOne) {
    console.warn(`${c.name}: ${points} skill points, expected ${TUNING.skillPointsAtLevelOne}`);
  }
}

// everyone who could ever be recruited, whether or not they are yet
export function everyone() {
  return PARTY.filter((c) => !c.you);
}

// and everyone who can be, right now
export function roster() {
  return everyone().filter((c) => story.ok(c));
}

// Who can fight. Night work will not go out without one of them; see content/party.js.
export function isCombat(id) {
  const c = charOf(id);
  return !!(c && c.combat);
}

export function fighters(ids) {
  return ids.filter((id) => isCombat(id));
}

// The player is nobody's recruit: they are on every run without being asked, and are
// left out of every list of who might come. This is the only place that knows which
// character they are.
export const YOU = PARTY.find((c) => c.you).id;

// what the hut scene hands back: three skills against the points put on each
export function setSkills(id, skills) {
  stateOf(id).skills = { ...skills };
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

// --- skills ---------------------------------------------------------------
// A skill is the points spent on it. Everything below is that number, read a different
// way: added to an activity, added to a die, or added up across a party.

// Content naming a skill that is not on the list is a mistake, but it is not worth a
// crash mid-run while the list is being rewritten: it rolls the die on its own and says
// so. The warning at boot is where the mistake gets fixed.
const UNTRAINED = { id: null, name: 'Untrained', activities: [], draws: [], unlocks: [], body: [] };

export function skillOf(skillId) {
  return SKILL[skillId] || UNTRAINED;
}

export function rankOf(id, skillId) {
  return stateOf(id).skills[skillId] || 0;
}

// what one point is worth to an activity, and so what a rank is worth
export function worthOf(rank) {
  return rank * TUNING.skillBonusPerPoint;
}

// best first, because a sheet is read for what somebody is good at
export function skillsOf(id) {
  return Object.entries(stateOf(id).skills)
    .filter(([t]) => SKILL[t])
    .map(([t, rank]) => ({ ...SKILL[t], rank }))
    .sort((a, b) => b.rank - a.rank);
}

export function has(id, skillId) {
  return rankOf(id, skillId) > 0;
}

// What an activity asks: how much is this character worth at it, and what extra can
// they do that somebody without the skill cannot. Two functions is the whole contract.
export function bonusFor(id, activity) {
  return skillsOf(id)
    .filter((t) => t.activities.includes(activity))
    .reduce((n, t) => n + worthOf(t.rank), 0);
}

// --- rolls and party scores ------------------------------------------------

// Who in a party is best at something, and how good the party is at it as a body. The
// first decides who makes a roll; the second decides what work of that kind pays.
export function bestAt(ids, skillId) {
  return ids.reduce((a, b) => (rankOf(b, skillId) > rankOf(a, skillId) ? b : a), ids[0]) || null;
}

export function scoreOf(ids, skillId) {
  return ids.reduce((n, id) => n + rankOf(id, skillId), 0);
}

// A check against a DC: a die, plus what the skill is worth, rolled by the party's best
// at it. A natural top holds whatever the DC, and a natural 1 never does, so a hard
// check is never impossible and an easy one is never free.
export function check(ids, skillId, dc) {
  const who = bestAt(ids, skillId);
  const rank = who ? rankOf(who, skillId) : 0;
  const die = 1 + Math.floor(Math.random() * TUNING.checkDie);
  const total = die + rank;
  return {
    name: who ? charOf(who).name : 'Nobody',
    you: who === YOU, // 'You roll', not 'You rolls'
    skill: skillOf(skillId),
    rank,
    die,
    total,
    dc,
    pass: die === TUNING.checkDie || (die > 1 && total >= dc),
  };
}

export function unlocksFor(id, activity) {
  return skillsOf(id)
    .filter((t) => !activity || t.activities.includes(activity))
    .flatMap((t) => t.unlocks);
}

// what a given set of people are worth as a body, best first — the readout behind
// deciding who to take
export function scoreLine(ids) {
  const scores = SKILLS.map((t) => [t.name, scoreOf(ids, t.id)])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  return scores.length ? scores.map(([n, v]) => `${n} ${v}`).join('   ') : 'Nothing between them.';
}

// --- menu rows ------------------------------------------------------------
// Rebuilt on every draw rather than held, because level and HP move while the game runs.

// the player first, because they are on every run, then whoever else can be asked
export function walking() {
  return [charOf(YOU), ...roster()];
}

export function partyRows() {
  return walking().map((c) => {
    const s = stateOf(c.id);
    const next = xpToNext(s.level);
    const skills = skillsOf(c.id);
    const fears = (c.fears || []).map((f) => FEAR[f]).filter(Boolean);
    return {
      label: c.name,
      note: `Lv ${s.level} · ${s.hp}/${hpMax(c.id)}`,
      body: [
        `Level ${s.level}    HP ${s.hp} of ${hpMax(c.id)}    `
          + (next === Infinity ? `XP ${s.xp}  (max level)` : `XP ${s.xp} of ${next}`),
        c.you
          ? 'On every run. Nobody has to be asked to bring you.'
          : `Bond: ${bandName(bandOf(c.id))} (${s.bond} points).`,
        skills.length
          ? skills.map((t) => `${t.name} ${t.rank} — +${worthOf(t.rank)} to ${t.activities.join(', ')}`).join('\n')
          : 'Nothing settled yet. Every roll is the die on its own.',
        fears.length
          ? fears.map((f) => `${f.name} — ${f.kind === 'scruple' ? 'will not do it' : 'will not face it'}`).join('\n')
          : `Nothing ${c.you ? 'you' : 'they'} will not walk into.`,
        ...c.body,
      ],
    };
  });
}

// Who has the points is the thing worth knowing about a skill, so the tab is rebuilt
// on every draw and says it out loud rather than describing the skill in the abstract.
export function skillRows() {
  return SKILLS.map((t) => {
    const held = walking()
      .filter((c) => has(c.id, t.id))
      .sort((a, b) => rankOf(b.id, t.id) - rankOf(a.id, t.id));
    const score = scoreOf(walking().map((c) => c.id), t.id);
    return {
      label: t.name,
      note: `${score} in town`,
      body: [
        `A point adds ${TUNING.skillBonusPerPoint} to ${t.activities.join(', ')}, one to any ${t.name} roll, `
          + `and ${Math.round(TUNING.skillYieldPerPoint * 100)}% to what work of that kind pays the party.`,
        held.length
          ? held.map((c) => `${c.name} ${rankOf(c.id, t.id)}`).join('\n')
          : 'Nobody in Dreadhollow has spent a point on this.',
        t.unlocks.map((u) => `— ${u}`).join('\n'),
        ...t.body,
      ],
    };
  });
}
