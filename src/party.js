// What a playable character is right now: level, XP, what their constitution is worth,
// and what their skills are worth. content/party.js says what they start as; this says
// where they have got to. Every number it works from is in tuning.js.
//
// Constitution is not tracked here. A run pools everyone's into one number and spends it
// down (src/run.js); between runs there is nothing to remember, because a party that got
// home is a party that got home.

import { TUNING } from '../tuning.js';
import { PARTY } from '../content/party.js';
import { SKILLS } from '../content/skills.js';
import { FEARS } from '../content/fears.js';
import * as story from './story.js';
import { bonus as charmBonus, worn } from './charm.js';

const SKILL = Object.fromEntries(SKILLS.map((t) => [t.id, t]));
const FEAR = Object.fromEntries(FEARS.map((f) => [f.id, f]));

// Skills live here rather than in content/party.js because the player's are chosen in
// the hut and everyone's could move later; content says what they start as.
// The name is here for the same reason: everyone else is named in content, and the
// player is named in the hut, by the player.
const state = new Map(PARTY.map((c) => [c.id, {
  level: 1, xp: 0, bond: c.bond || 0, skills: { ...c.skills }, name: c.name, points: 0,
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

// What a fighter is worth in a fight, at the level they have reached. Their own block
// says whatever it wants to say and tuning.js says the rest, so a character written as
// `combat: {}` is a fighter of exactly the default size. Nobody else has any of this:
// a character who cannot fight has no hit points, which is why a night job needs one.
export function combatOf(id) {
  const c = charOf(id);
  if (!c || !c.combat) return null;
  const d = TUNING.combat.fighter;
  const own = c.combat === true ? {} : c.combat;
  // A worn stone is worth the same to a blow as to the thing taking it, so harm moves at
  // both ends rather than widening: a Ruby makes every swing better, not luckier.
  const harm = own.harm || d.harm;
  return {
    hp: (own.hp ?? d.hp) + TUNING.combat.hpPerLevel * (stateOf(id).level - 1) + charmOn(id, 'hp'),
    hit: (own.hit ?? d.hit) + charmOn(id, 'hit'),
    guard: (own.guard ?? d.guard) + charmOn(id, 'guard'),
    harm: [harm[0] + charmOn(id, 'harm'), harm[1] + charmOn(id, 'harm')],
  };
}

// The player is nobody's recruit: they are on every run without being asked, and are
// left out of every list of who might come. This is the only place that knows which
// character they are.
export const YOU = PARTY.find((c) => c.you).id;

// Only the player wears a charm — one stone, one slot — so everybody else reads zero and
// every number below can ask without first asking who it is asking about.
function charmOn(id, stat) {
  return id === YOU ? charmBonus(stat) : 0;
}

// what the hut scene hands back: three skills against the points put on each
export function setSkills(id, skills) {
  stateOf(id).skills = { ...skills };
}

// and the name typed in front of it. Everything that shows a name reads it through
// nameOf, so the player's is not a special case anywhere else.
export function nameOf(id) {
  return stateOf(id).name;
}

export function setName(id, name) {
  const n = name.trim().slice(0, TUNING.nameMaxLength);
  if (n) stateOf(id).name = n;
}

// Everyone is they/them unless their block says otherwise: put `they: 'she'` on a
// character in content/party.js and the three forms follow from it.
const PRONOUNS = {
  they: ['they', 'them', 'their'],
  he: ['he', 'him', 'his'],
  she: ['she', 'her', 'her'],
};

// The tokens any authored line can carry, resolved as the line is shown rather than
// when it is written: the player has no name until the hut, and who attempts a check
// is not known until the party is standing in front of it. `actor` is whoever that
// turned out to be — leave it out and there is nobody to be.
export function fill(text, actor) {
  const c = actor ? charOf(actor) : null;
  const [they, them, their] = PRONOUNS[(c && c.they) || 'they'];
  return text
    .split('{playerName}').join(nameOf(YOU))
    .split('{skillActor}').join(actor ? nameOf(actor) : 'Somebody')
    .split('{they}').join(they)
    .split('{them}').join(them)
    .split('{their}').join(their);
}

export function charOf(id) {
  return PARTY.find((c) => c.id === id);
}

export function stateOf(id) {
  return state.get(id);
}

// What this character is worth to a run's constitution: their own score, and what every
// level past the first added to it.
export function conOf(id) {
  return charOf(id).con + TUNING.conPerLevel * (stateOf(id).level - 1) + charmOn(id, 'con');
}

// How many slots one person is worth, and how many a crew is. The grid a run walks out
// with is everybody's added together: taking a fourth walker is squares as much as it is
// what they can do.
export function carryOf(id) {
  const c = charOf(id);
  return (c && c.carry) ?? TUNING.carryDefault;
}

export function carryTotal(ids) {
  return ids.reduce((n, id) => n + carryOf(id), 0);
}

// what a set of people are worth as a body — the number a run starts with
export function conTotal(ids) {
  return ids.reduce((n, id) => n + conOf(id), 0);
}

// leaving a level costs more than leaving the one before it
export function xpToNext(level) {
  return level >= TUNING.maxLevel ? Infinity : TUNING.xpBase * level;
}

// Experience goes to the level and to nothing else: no skill is ever practised into
// existence. A level hands back skillPointsPerLevel points, and what those are spent on
// is a decision somebody makes — the player at the sheet, everybody else on the spot.
// Returns how many levels were gained, so a caller can say so.
export function award(id, xp) {
  const s = stateOf(id);
  if (s.level >= TUNING.maxLevel) return 0; // XP past the last level has nowhere to go
  s.xp += xp;
  let gained = 0;
  while (s.xp >= xpToNext(s.level)) {
    s.xp -= xpToNext(s.level);
    s.level += 1;
    gained += 1;
  }
  if (gained) {
    s.points += gained * TUNING.skillPointsPerLevel;
    if (id !== YOU) autoSpend(id);
  }
  return gained;
}

// There is one character sheet the player fills in, and it is theirs. Everyone else
// spends as they earn, and broadens rather than deepens: the point goes on whichever of
// the things they already know they are worst at, so a companion stays the shape they
// were recruited as instead of turning into a specialist nobody asked for.
function autoSpend(id) {
  const s = stateOf(id);
  const known = Object.keys(s.skills).filter((t) => SKILL[t]);
  if (!known.length) return;
  while (s.points > 0) {
    const t = known.reduce((a, b) => (s.skills[b] < s.skills[a] ? b : a));
    s.skills[t] += 1;
    s.points -= 1;
  }
}

// what level somebody has reached — the crew screen says it, and so does the tally at a
// node where the experience took somebody to a new one
export function levelOf(id) {
  return stateOf(id).level;
}

export function levelUp(id) {
  const s = stateOf(id);
  return award(id, Math.max(0, xpToNext(s.level) - s.xp));
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

// Whose work a piece of work is. An activity is claimed by whichever skill lists it, so
// an encounter that names one has already said which skill it belongs to and does not
// have to say it twice. Nothing claims Fighting or Hauling, and null is the answer.
export function skillForActivity(activity) {
  return (activity && SKILLS.find((t) => t.activities.includes(activity))) || null;
}

// A rank is what was spent there plus what is worn. Everything downstream — whether the
// skill is had at all, what a check rolls, what a node pays, who speaks at a fork — reads
// this one function, so a stone that grants a point grants all of it: a Sapphire is a way
// onto work the player could not otherwise take. Spending points is untouched by it; the
// bank in stateOf is what a level hands over and a stone never goes near it.
export function rankOf(id, skillId) {
  return (stateOf(id).skills[skillId] || 0) + charmOn(id, skillId);
}

// what a level handed over and nobody has spent yet
export function pointsOf(id) {
  return stateOf(id).points;
}

// Points off the bank and onto skills, as {skillId: points}. The whole sheet is committed
// at once, so a point moved onto something and off it again never left the bank. Returns
// how many were spent, and spends none of them if the sheet asks for more than there are.
export function spendPoints(id, spent) {
  const s = stateOf(id);
  const wanted = Object.entries(spent).filter(([t, n]) => SKILL[t] && n > 0);
  const n = wanted.reduce((a, [, v]) => a + v, 0);
  if (!n || n > s.points) return 0;
  for (const [t, v] of wanted) s.skills[t] = (s.skills[t] || 0) + v;
  s.points -= n;
  return n;
}

// what one point is worth to an activity, and so what a rank is worth
export function worthOf(rank) {
  return rank * TUNING.skillBonusPerPoint;
}

// best first, because a sheet is read for what somebody is good at. A skill the worn
// stone grants and nobody spent a point on is on the sheet too — it is a skill they have.
export function skillsOf(id) {
  const ids = new Set(Object.keys(stateOf(id).skills));
  const w = id === YOU ? worn() : null;
  if (w) for (const st of w.gem.stats) if (SKILL[st]) ids.add(st);
  return [...ids]
    .filter((t) => SKILL[t])
    .map((t) => ({ ...SKILL[t], rank: rankOf(id, t) }))
    .filter((t) => t.rank > 0)
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
    name: who ? nameOf(who) : 'Nobody',
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

// Who has the points is the thing worth knowing about a skill, so the tab is rebuilt
// on every draw and says it out loud rather than describing the skill in the abstract.
export function skillRows() {
  return SKILLS.map((t) => {
    const held = walking()
      .filter((c) => has(c.id, t.id))
      .sort((a, b) => rankOf(b.id, t.id) - rankOf(a.id, t.id));
    const score = scoreOf(walking().map((c) => c.id), t.id);
    const yours = rankOf(YOU, t.id);
    const bank = pointsOf(YOU);
    return {
      label: t.name,
      note: `${score} in town`,
      skill: t.id, // and so [Enter] on this row is a point spent on it; see src/scenes/Menu.js
      body: [
        (yours ? `You have ${yours}.` : 'You have none.')
          + (bank ? `  ${bank} point${bank === 1 ? '' : 's'} to spend — [Enter] to spend ${bank === 1 ? 'it' : 'them'}.`
            : '  Nothing to spend; a level is what hands the points over.'),
        `A point adds ${TUNING.skillBonusPerPoint} to ${t.activities.join(', ')}, one to any ${t.name} roll, `
          + `and ${Math.round(TUNING.skillYieldPerPoint * 100)}% to what work of that kind pays the party. `
          + 'It also turns up the scarcer things more often, where the work has any.',
        held.length
          ? held.map((c) => `${nameOf(c.id)} ${rankOf(c.id, t.id)}`).join('\n')
          : 'Nobody in Dreadhollow has spent a point on this.',
        t.unlocks.map((u) => `— ${u}`).join('\n'),
        ...t.body,
      ],
    };
  });
}
