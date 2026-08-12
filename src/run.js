// One quest, being walked. The nodes between the Sea Hag and the goal are drawn fresh
// every time a quest is accepted, so accepting the same job twice is not the same run.
//
// A run is a line with a fork every questForkEvery nodes. At a fork each branch leans
// toward one kind of encounter; a character whose skill matches that kind can read it
// off the ground, and taking that branch makes the kind much likelier at the node it
// leads to. That is the whole of the direction system.

import { TUNING } from '../tuning.js';
import { QUESTS } from '../content/quests.js';
import { ENCOUNTERS } from '../content/encounters.js';
import { SKILLS } from '../content/skills.js';
import {
  roster, charOf, award, raiseBond, conOf, conTotal,
  rankOf, scoreOf, check, skillOf, walking, fighters, YOU,
} from './party.js';
import { give, nameOf } from './town.js';
import * as story from './story.js';
import { asked } from './recruit.js';
import { hasEngine, qualityOf } from './activity.js';

const KIND = Object.fromEntries(ENCOUNTERS.map((e) => [e.id, e]));

// Nothing is fought by daylight. What comes out of the ground and what follows a party
// home only does either after dark, so a day run draws from the table with the combat
// kinds taken out of it and a night run draws from the whole of it.
// An authored kind is only ever reached by a quest naming it, so it is out of the table
// the road draws from whatever the hour is.
function poolAt(when) {
  return ENCOUNTERS.filter((e) => !e.only && (when === 'night' || e.nature !== 'combat'));
}

function readableAt(when) {
  return poolAt(when).filter((e) => e.read);
}

// A table naming a skill the list does not have, usually one left behind by a rewrite of
// content/skills.js. It rolls the die on its own until it is pointed at something real,
// so the run still walks; this is where the mistake is said out loud.
const SKILL_IDS = new Set(SKILLS.map((s) => s.id));
for (const e of ENCOUNTERS) {
  for (const named of [e.harvest, e.read && e.read.skill, e.check && e.check.skill]) {
    if (named && !SKILL_IDS.has(named)) console.warn(`${e.name}: no such skill — ${named}`);
  }
}
for (const q of QUESTS) {
  if (q.check && !SKILL_IDS.has(q.check.skill)) console.warn(`${q.label}: no such skill — ${q.check.skill}`);
}

// The first job — the only one the story offers with nothing raised yet — is day work
// with Aldis on it. He does not fight, and a night run needs somebody who does, so the
// game cannot open on one. Said at boot rather than found later in an unwalkable board.
for (const q of QUESTS.filter((x) => !x.needs)) {
  if (q.when !== 'day') console.warn(`${q.label}: the first job must be day work.`);
  if (!(q.must || []).includes('aldis')) console.warn(`${q.label}: the first job must have Aldis on it.`);
}

// how many times each job has been walked to the end. Gregorious keeps a standing
// board rather than a story: the same job can be taken again, which is what lets a
// bond grow far enough to crew the ones nobody will touch yet.
const walked = new Map();
let run = null;

function roll([lo, hi]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function questOf(id) {
  return QUESTS.find((q) => q.id === id);
}

export function kindOf(id) {
  return KIND[id];
}

export function timesWalked(id) {
  return walked.get(id) || 0;
}

// Everything known about and not set out for from somewhere else. Work does not run
// out, but it does have to be offered first.
export function offered() {
  return QUESTS.filter((q) => story.ok(q) && !q.at);
}

// every job the story has unlocked, wherever it is set out from
export function known() {
  return QUESTS.filter((q) => story.ok(q));
}

// Whether a job can be walked right now, and what is in the way if not. The reasons
// are the readout on the Map tab, so they say what to go and do about it.
export function blockers(id, when) {
  const q = questOf(id);
  const out = [];
  if (!q) return ['No such job.'];
  if (!story.ok(q)) return ['Nobody has offered this.'];
  if (q.ready && !story.has(q.ready)) out.push('Not agreed to yet.');

  const at = when || timesFor(q)[0];
  for (const cid of q.must || []) {
    const c = charOf(cid);
    if (!c) out.push('Somebody this job needs is not here.');
    else if (!roster().includes(c)) out.push(`${c.name} is not available.`);
    else if (!asked(cid, q, at).willing) out.push(`${c.name} will not come on this.`);
  }
  const willing = [YOU, ...roster().filter((c) => asked(c.id, q, at).willing).map((c) => c.id)];
  if (willing.length < q.party) out.push(`Needs ${q.party}; counting you, ${willing.length} will walk it.`);
  if (needsFighter(at) && !fighters(willing).length) out.push(fighterLine);
  return out;
}

// A run after dark has things on it that have to be fought, so one of the party has to
// be somebody who fights. By day there is nothing to fight and anybody can walk it.
export function needsFighter(when) {
  return when === 'night';
}

export function hasFighter(ids) {
  return fighters(ids).length > 0;
}

export const fighterLine = 'Needs somebody who can fight; nobody who will come after dark can.';

export function canStart(id, when) {
  return blockers(id, when).length === 0;
}

export function active() {
  return run;
}

export function sizeOf(q) {
  return TUNING.questNodes[q.size];
}

// a job fixed to one time can only be walked at that time; the rest are the party's call
export function timesFor(q) {
  return q.when === 'any' ? ['day', 'night'] : [q.when];
}

// what a run at this hour is mostly made of, so the choice is made on something
export function mixAt(when) {
  const by = {};
  for (const e of poolAt(when)) by[e.nature] = (by[e.nature] || 0) + e.weight[when];
  const total = Object.values(by).reduce((a, b) => a + b, 0);
  return Object.entries(by)
    .sort((a, b) => b[1] - a[1])
    .map(([nature, n]) => `${nature} ${Math.round((n / total) * 100)}%`)
    .join('   ');
}

// --- starting --------------------------------------------------------------

export function start(id, when, party) {
  const quest = questOf(id);
  const at = timesFor(quest).includes(when) ? when : timesFor(quest)[0];
  // The player and the recruited walk it: they take the wounds, earn the experience,
  // and are the only ones who can read anything at a fork. The player is on it whoever
  // else is, so their three skills are the three the party always has.
  const who = [YOU, ...(party && party.length ? party : roster().map((c) => c.id))]
    .filter((id, i, all) => all.indexOf(id) === i);
  const nodes = quest.line ? authored(quest.line) : drawn(quest);
  const con = conTotal(who);
  run = {
    quest, when: at, party: who, nodes, at: -1, state: 'running', bias: null,
    spoils: {}, xp: 0, con, conMax: con,
  };
  step();
  return run;
}

// A run the designer wrote out: every node is the kind named for it, and an entry that
// names two is a fork offering exactly those two ways on.
function authored(line) {
  return line.map((entry, i) => {
    const pair = Array.isArray(entry);
    return {
      fork: pair,
      pick: pair ? entry : null,
      only: pair ? null : entry,
      goal: i === line.length - 1,
    };
  });
}

// and one the road wrote: a length rolled at the gate and a fork every so often
function drawn(quest) {
  const count = roll(sizeOf(quest));
  return Array.from({ length: count }, (_, i) => ({
    // no fork in front of the first node, and none in front of the goal: the last
    // step of a job is not a choice about where the job is
    fork: TUNING.questForkEvery > 0 && i > 0 && i < count - 1 && i % TUNING.questForkEvery === 0,
    goal: i === count - 1,
  }));
}

export function abandon() {
  if (!run) return null;
  run.state = 'abandoned';
  return run;
}

// Constitution is a within-run resource and nothing carries out of the run: the question
// a run asks is whether the party has enough left to finish this one, not whether they
// have been worn down since the first. Move this the day beds and food cost something.
export function clear() {
  run = null;
}

// --- walking ---------------------------------------------------------------

export function step() {
  if (!run || run.state !== 'running') return run;
  run.at += 1;
  if (run.at >= run.nodes.length) return finish();

  const node = run.nodes[run.at];
  if (node.fork && !node.taken) {
    node.branches = branches(node.pick);
    run.phase = 'fork';
    return run;
  }
  resolve(node);
  return run;
}

// two ways on, each leaning toward something, and whatever the party can read about them.
// The two on offer are drawn against the hour, so a night fork offers night things.
function branches(pick) {
  let a;
  let b;
  if (pick) {
    [a, b] = pick.map((id) => KIND[id]);
  } else {
    const readable = readableAt(run.when);
    a = weighted(null, readable);
    b = weighted(null, readable);
    for (let i = 0; b === a && readable.length > 1 && i < 8; i++) b = weighted(null, readable);
  }
  return [a, b].map((kind, i) => ({
    kind: kind.id,
    side: i === 0 ? 'Left' : 'Right',
    read: readOf(kind),
  }));
}

export function walkers() {
  return run ? run.party.map((id) => charOf(id)) : walking();
}

// who on the run can see this coming, and what they say about it. The one with the most
// points in the skill speaks: a party carrying two who could tell you hears the better.
function readOf(kind) {
  const seen = walkers().filter((c) => rankOf(c.id, kind.read.skill) > 0);
  if (!seen.length) return null;
  const c = seen.reduce((a, b) => (rankOf(b.id, kind.read.skill) > rankOf(a.id, kind.read.skill) ? b : a));
  return { who: c.name, line: kind.read.line };
}

export function choose(i) {
  if (!run || run.phase !== 'fork') return run;
  const node = run.nodes[run.at];
  node.taken = node.branches[i];
  // An authored fork is the two ways it names, so taking one is taking that one. A
  // drawn fork only leans: the kind it points at gets much likelier, not certain.
  if (node.pick) node.only = node.taken.kind;
  else run.bias = node.taken.kind;
  resolve(node);
  return run;
}

function weighted(bias, from = poolAt(run.when)) {
  const of = (e) => e.weight[run.when] * (e.id === bias ? TUNING.questBiasWeight : 1);
  let r = Math.random() * from.reduce((n, e) => n + of(e), 0);
  for (const e of from) {
    r -= of(e);
    if (r <= 0) return e;
  }
  return from[from.length - 1];
}

// What the party's points are worth here: everyone's points in the skill this work is
// done with, added up, each one adding skillYieldPerPoint to what comes out of it. Who
// you take on a job is the loudest thing you say about what you want off it.
function harvestOf(node, e) {
  if (!e.harvest) return null;
  const score = scoreOf(run.party, e.harvest);
  return { skill: skillOf(e.harvest), score, more: score * TUNING.skillYieldPerPoint };
}

// The job's own test stands in front of the goal; anything else the road throws up
// brings its own. A node asks for at most one roll.
function checkOf(node, e) {
  const spec = (node.goal && run.quest.check) || e.check;
  if (!spec) return null;
  return { ...check(run.party, spec.skill, spec.dc), held: spec.held, lost: spec.lost };
}

function resolve(node) {
  const e = node.only ? KIND[node.only] : weighted(run.bias);
  run.bias = null;

  node.kind = e.id;
  node.conBefore = run.con;
  node.harvest = harvestOf(node, e);
  node.check = checkOf(node, e);

  // A node with an engine behind it does not pay out until it has been played. The run
  // waits here; the scene hands back what the player made of it.
  if (hasEngine(e.activity)) {
    run.phase = 'activity';
    return;
  }
  settle(null);
}

// What the node came to. `played` is what an engine handed back — { judgments, failed } —
// or null for a node nobody had to do anything at.
export function settle(played) {
  if (!run || run.at < 0) return run;
  const node = run.nodes[run.at];
  const e = KIND[node.kind];
  const night = run.when === 'night';
  run.phase = 'node';

  const failed = node.check && !node.check.pass;
  // points in the work swell what it pays; a check lost costs part of it
  let take = (1 + (node.harvest ? node.harvest.more : 0)) * (failed ? TUNING.checkFailKeep : 1);

  if (played) {
    node.played = true;
    node.failed = !!played.failed;
    node.quality = played.failed ? 0 : qualityOf(played.judgments);
    node.swings = (played.judgments || []).length;
    take *= node.failed
      ? TUNING.activityFailKeep
      : TUNING.activityKeepFloor + (1 - TUNING.activityKeepFloor) * node.quality;
  }

  node.spoils = {};
  for (const [m, range] of Object.entries(e.spoils)) {
    const n = Math.round(roll(range) * take);
    if (n > 0) {
      node.spoils[m] = n;
      run.spoils[m] = (run.spoils[m] || 0) + n;
      give(m, n);
    }
  }
  node.xp = Math.round(roll(e.xp)
    * (night ? TUNING.questNightXp : 1)
    * (node.check && node.check.pass ? TUNING.checkPassXp : 1));
  run.xp += node.xp;
  for (const c of walkers()) award(c.id, node.xp);

  // What the node did to the party, in one number: the road's standing cost, what the
  // encounter itself takes or puts back, how the party bore up in front of it, and how
  // well they did the work. They are kept apart so the readout can say which was which.
  const taken = roll(e.con);
  node.conRoad = -TUNING.questConDecay;
  node.conKind = taken < 0 && night ? -Math.round(-taken * TUNING.questNightCon) : taken;
  node.conCheck = node.check ? (node.check.pass ? TUNING.questConHeld : -TUNING.questConLost) : 0;
  node.conWork = !played ? 0
    : node.failed ? TUNING.activityConWorst
      : node.quality >= TUNING.activityConGood ? TUNING.activityConBest : 0;
  node.con = node.conRoad + node.conKind + node.conCheck + node.conWork;

  run.con = Math.max(0, Math.min(run.conMax, run.con + node.con));
  node.conAfter = run.con;
  // Nothing left in them: they turn for home from wherever they are standing.
  if (run.con <= 0) spend();
  return run;
}

// A run that ran out of constitution is over where it stands. Half of everything the
// party was carrying goes back — they came home light, and it is not a finished job.
function spend() {
  run.state = 'spent';
  run.lost = {};
  for (const [m, n] of Object.entries(run.spoils)) {
    const back = n - Math.floor(n * TUNING.questSpentKeep);
    if (back > 0) {
      run.lost[m] = back;
      run.spoils[m] = n - back;
      give(m, -back);
    }
  }
}

// --- finishing -------------------------------------------------------------

function finish() {
  run.state = 'done';
  walked.set(run.quest.id, timesWalked(run.quest.id) + 1);
  story.set(run.quest.sets);

  run.bonus = { spoils: {}, xp: TUNING.questBonusXp[run.quest.size] };
  for (const [m, n] of Object.entries(run.spoils)) {
    const extra = n * TUNING.questBonusFactor;
    run.bonus.spoils[m] = extra;
    give(m, extra);
  }
  for (const c of walkers()) {
    award(c.id, run.bonus.xp);
    raiseBond(c.id); // walking a job to the end is how anyone here comes to know you
  }
  return run;
}

// --- text ------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function listOf(spoils) {
  const parts = Object.entries(spoils).filter(([, n]) => n > 0).map(([m, n]) => `${n} ${nameOf(m)}`);
  return parts.length ? parts.join(', ') : 'nothing';
}

// what the Map tab says about somewhere a job is set out from
export function placeLines(id) {
  const q = questOf(id);
  if (!q) return ['No such job.'];
  if (!story.ok(q)) return ['Nothing here yet.'];
  const stop = blockers(id);
  const head = `${q.label} — ${q.size} work, ${q.when === 'any' ? 'day or night' : q.when + ' only'}.`;
  if (stop.length) return [head, q.goal, ...stop];
  return [head, q.goal, 'Ready. [Enter] to set out.'];
}

// a roll, said the way a table says it: die, what the skill added, and what it came to
export function checkLine(c) {
  return `${c.skill.name} DC ${c.dc} — ${c.name} ${c.you ? 'roll' : 'rolls'} ${c.die}${c.rank ? ` +${c.rank}` : ''}`
    + ` = ${c.total}. ${c.pass ? 'Held.' : 'Lost.'}`;
}

export function harvestLine(h) {
  if (!h || !h.score) return null;
  return `${h.skill.name} ${h.score} between you — ${Math.round(h.more * 100)}% more out of it.`;
}

// who is walking it and what each of them is worth to the pool — the readout under the
// crew screen and along the bottom of the crawl
export function partyLine(who = walkers()) {
  return who.map((c) => `${c.name} ${conOf(c.id)}`).join('    ');
}

// what the bar across the top of the crawl says next to itself
export function conLine(r = run) {
  return r ? `Constitution ${r.con} of ${r.conMax}` : '';
}

// what a node did to it, in the order it happened, for the card under the encounter
export function conLines(node) {
  const out = [];
  const say = (n, why) => { if (n) out.push(`${n > 0 ? '+' : ''}${n} ${why}`); };
  say(node.conRoad, 'walking it');
  say(node.conKind, node.conKind > 0 ? 'put back here' : 'taken here');
  say(node.conCheck, node.conCheck > 0 ? 'for holding' : 'for losing it');
  say(node.conWork, node.conWork > 0 ? 'for good work' : 'for botching it');
  return out.length ? `${out.join('    ')}    →  ${node.conAfter}` : '';
}

// the Quest Log, with whatever the run state has to say about each job on top of it
export function questRows() {
  return known().map((q) => {
    const live = run && run.quest.id === q.id ? run : null;
    const n = timesWalked(q.id);
    let note = n ? `Walked ${n}×` : 'Open';
    if (!n && q.ready && !story.has(q.ready)) note = 'Not agreed';
    if (live && live.state === 'running') note = `Node ${live.at + 1}/${live.nodes.length}`;
    else if (live && live.state === 'spent') note = 'Spent';
    else if (live && live.state === 'abandoned') note = 'Turned back';
    return {
      label: q.label,
      note,
      body: [
        `${q.size[0].toUpperCase()}${q.size.slice(1)} work — ${sizeOf(q)[0]} to ${sizeOf(q)[1]} nodes, ${q.party} to walk it, you included.`
          + (q.must ? `  ${q.must.map((m) => charOf(m).name).join(' and ')} must be on it.` : '')
          + (q.when === 'any' ? '  Day or night, your call.' : `  ${q.when === 'day' ? 'Daylight' : 'After dark'} only.`)
          + (q.when === 'day' ? '  Nothing to fight by daylight.' : '  After dark wants a fighter along.'),
        q.goal,
        ...q.body,
      ],
    };
  });
}
