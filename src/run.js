// One quest, being walked. The nodes between the Sea Hag and the goal are drawn fresh
// every time a quest is accepted, so accepting the same job twice is not the same run.
//
// A run is a line with a fork every questForkEvery nodes. At a fork each branch leans
// toward one kind of encounter; a character whose trait matches that kind can read it
// off the ground, and taking that branch makes the kind much likelier at the node it
// leads to. That is the whole of the direction system.

import { TUNING } from '../tuning.js';
import { QUESTS } from '../content/quests.js';
import { ENCOUNTERS } from '../content/encounters.js';
import { roster, stateOf, damage, award, traitsOf, hpMax } from './party.js';
import { give, nameOf } from './town.js';

const KIND = Object.fromEntries(ENCOUNTERS.map((e) => [e.id, e]));
const READABLE = ENCOUNTERS.filter((e) => e.read);

const done = new Set();
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

export function completed(id) {
  return done.has(id);
}

// what Gregorious still has on the board
export function offered() {
  return QUESTS.filter((q) => !done.has(q.id));
}

export function active() {
  return run;
}

export function sizeOf(q) {
  return TUNING.questNodes[q.size];
}

// --- starting --------------------------------------------------------------

export function start(id) {
  const quest = questOf(id);
  const count = roll(sizeOf(quest));
  const nodes = [];
  for (let i = 0; i < count; i++) {
    nodes.push({
      // no fork in front of the first node, and none in front of the goal: the last
      // step of a job is not a choice about where the job is
      fork: TUNING.questForkEvery > 0 && i > 0 && i < count - 1 && i % TUNING.questForkEvery === 0,
      goal: i === count - 1,
    });
  }
  run = { quest, nodes, at: -1, state: 'running', bias: null, spoils: {}, xp: 0 };
  step();
  return run;
}

export function abandon() {
  if (!run) return null;
  run.state = 'abandoned';
  return run;
}

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
    node.branches = branches();
    run.phase = 'fork';
    return run;
  }
  resolve(node);
  return run;
}

// two ways on, each leaning toward something, and whatever the party can read about them
function branches() {
  const a = pick(READABLE);
  let b = pick(READABLE);
  while (b === a && READABLE.length > 1) b = pick(READABLE);
  return [a, b].map((kind, i) => ({
    kind: kind.id,
    side: i === 0 ? 'Left' : 'Right',
    read: readOf(kind),
  }));
}

// who in the party can see this coming, and what they say about it
function readOf(kind) {
  for (const c of roster()) {
    if (traitsOf(c.id).some((t) => t.id === kind.read.trait)) {
      return { who: c.name, line: kind.read.line };
    }
  }
  return null;
}

export function choose(i) {
  if (!run || run.phase !== 'fork') return run;
  const node = run.nodes[run.at];
  node.taken = node.branches[i];
  run.bias = node.taken.kind;
  resolve(node);
  return run;
}

function weighted(bias) {
  const total = ENCOUNTERS.reduce((n, e) => n + e.weight * (e.id === bias ? TUNING.questBiasWeight : 1), 0);
  let r = Math.random() * total;
  for (const e of ENCOUNTERS) {
    r -= e.weight * (e.id === bias ? TUNING.questBiasWeight : 1);
    if (r <= 0) return e;
  }
  return ENCOUNTERS[ENCOUNTERS.length - 1];
}

function resolve(node) {
  const e = weighted(run.bias);
  run.bias = null;
  run.phase = 'node';

  node.kind = e.id;
  node.spoils = {};
  for (const [m, range] of Object.entries(e.spoils)) {
    const n = roll(range);
    if (n > 0) {
      node.spoils[m] = n;
      run.spoils[m] = (run.spoils[m] || 0) + n;
      give(m, n);
    }
  }
  node.xp = roll(e.xp);
  run.xp += node.xp;
  for (const c of roster()) award(c.id, node.xp);

  node.hurt = roll(e.hurt);
  if (node.hurt > 0) node.hurtWho = takeHit(node.hurt);
  if (partyDown()) run.state = 'failed';
}

// the one still on their feet with the most left in them takes it
function takeHit(n) {
  const standing = roster().filter((c) => stateOf(c.id).hp > 0);
  if (!standing.length) return null;
  const who = standing.reduce((a, b) => (stateOf(a.id).hp >= stateOf(b.id).hp ? a : b));
  damage(who.id, n);
  return who.name;
}

function partyDown() {
  return roster().every((c) => stateOf(c.id).hp <= 0);
}

// --- finishing -------------------------------------------------------------

function finish() {
  run.state = 'done';
  done.add(run.quest.id);

  run.bonus = { spoils: {}, xp: TUNING.questBonusXp[run.quest.size] };
  for (const [m, n] of Object.entries(run.spoils)) {
    const extra = n * TUNING.questBonusFactor;
    run.bonus.spoils[m] = extra;
    give(m, extra);
  }
  for (const c of roster()) award(c.id, run.bonus.xp);
  return run;
}

// --- text ------------------------------------------------------------------
// Flat and mechanical on purpose: this is a readout, not a voice. Rewrite freely.

export function listOf(spoils) {
  const parts = Object.entries(spoils).map(([m, n]) => `${n} ${nameOf(m)}`);
  return parts.length ? parts.join(', ') : 'nothing';
}

export function partyLine() {
  return roster().map((c) => `${c.name} ${stateOf(c.id).hp}/${hpMax(c.id)}`).join('    ');
}

// the Quest Log, with whatever the run state has to say about each job on top of it
export function questRows() {
  return QUESTS.map((q) => {
    const live = run && run.quest.id === q.id ? run : null;
    let note = done.has(q.id) ? 'Done' : 'Open';
    if (live && live.state === 'running') note = `Node ${live.at + 1}/${live.nodes.length}`;
    else if (live && live.state === 'failed') note = 'Lost';
    else if (live && live.state === 'abandoned') note = 'Turned back';
    return {
      label: q.label,
      note,
      body: [
        `${q.size[0].toUpperCase()}${q.size.slice(1)} work — ${sizeOf(q)[0]} to ${sizeOf(q)[1]} nodes.`,
        q.goal,
        ...q.body,
      ],
    };
  });
}
