// One fight: one fighter, one foe, and blows traded until one of them is down.
//
// Nothing here knows about runs, nodes or constitution — src/run.js walks a fight up to
// this and reads back what happened. What is fought and what a move is worth is in
// content/foes.js; the die and the fighter defaults are in tuning.js. This file is the
// rule: a blow is a d20 plus what the swinger is worth against what the other one's
// guard is, and that is the same roll the rest of the game makes.

import { TUNING } from '../tuning.js';
import { FOES, MOVES } from '../content/foes.js';
import { combatOf, nameOf } from './party.js';

const FOE = Object.fromEntries(FOES.map((f) => [f.id, f]));

export { MOVES };

export function foeOf(id) {
  return FOE[id] || null;
}

function roll([lo, hi]) {
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// A blow. Natural top always lands and natural 1 never does, the same as any check.
function swing(hit, guard) {
  const die = 1 + Math.floor(Math.random() * TUNING.checkDie);
  const total = die + hit;
  return {
    die, hit, guard, total, lands: die === TUNING.checkDie || (die > 1 && total >= guard),
  };
}

// how a blow reads on the card: the roll spelled out, the way a check is
function swingLine(who, s, harm, onto) {
  const add = s.hit ? ` ${s.hit > 0 ? '+' : ''}${s.hit}` : '';
  return `${who}: ${s.die}${add} = ${s.total} against ${s.guard}. `
    + (s.lands ? `${harm} off ${onto}.` : 'Nothing in it.');
}

// The state of a fight, handed back to whoever started it. `pool` is the hit points of
// everybody on the run who can fight, kept outside the fight because a fighter carries
// their wounds to the next one; the fight only ever writes the one who is up.
export function begin(who, foe, { pool, weaken = 0, ambush = false }) {
  const fight = {
    who, // whoever is standing in front of it, and null while nobody is
    foe,
    pool,
    foeMax: foe.hp,
    foeHp: Math.max(1, foe.hp - weaken),
    weakened: weaken,
    round: 1,
    steady: 0, // what a turn spent guarding is worth to the next swing
    hurt: {}, // what it has taken off each of them, for the tally afterwards
    over: null, // 'won' once it is down, 'down' once whoever is up is
    log: [],
  };
  fight.log.push([foe.body[0], 'them']);
  if (weaken) fight.log.push([`It comes on ${weaken} the worse for it.`, 'us']);
  // Walked into blind: it has the first blow and it does not have to earn the opening.
  if (ambush) {
    fight.log.push(['It is on you before anybody has drawn.', 'them']);
    answer(fight, TUNING.combat.ambushHit, 1);
  }
  return fight;
}

// The foe's half of a turn: it swings, and what is left of the blow after the move the
// fighter made is what lands.
function answer(fight, opens, keep) {
  const me = combatOf(fight.who);
  const s = swing(fight.foe.hit + opens, me.guard);
  const hurt = s.lands ? Math.max(1, Math.round(roll(fight.foe.harm) * keep)) : 0;
  fight.log.push([swingLine(fight.foe.name, s, hurt, nameOf(fight.who)), 'them']);
  fight.log.push([pick(s.lands ? fight.foe.lands : fight.foe.misses), 'said']);
  if (!hurt) return;
  fight.pool[fight.who] = Math.max(0, fight.pool[fight.who] - hurt);
  fight.hurt[fight.who] = (fight.hurt[fight.who] || 0) + hurt;
  if (fight.pool[fight.who] <= 0) {
    fight.over = 'down';
    fight.log.push([`${nameOf(fight.who)} goes down and does not get back up.`, 'us']);
  }
}

// One turn: the move the player took, and the foe's answer to it. A move that does not
// swing is a move that takes the weight of what comes back and steadies the next one.
export function take(fight, moveId) {
  const move = MOVES.find((m) => m.id === moveId);
  if (!fight || fight.over || !move) return fight;
  fight.log = [];
  const me = combatOf(fight.who);

  if (move.harm > 0) {
    const s = swing(me.hit + move.hit + fight.steady, fight.foe.guard);
    const hurt = s.lands ? Math.max(1, Math.round(roll(me.harm) * move.harm)) : 0;
    fight.log.push([swingLine(nameOf(fight.who), s, hurt, 'it'), 'us']);
    fight.foeHp = Math.max(0, fight.foeHp - hurt);
    fight.steady = 0;
  } else {
    fight.log.push([`${nameOf(fight.who)} takes the turn to cover up and find their feet.`, 'us']);
  }

  if (fight.foeHp <= 0) {
    fight.over = 'won';
    fight.log.push([pick(fight.foe.felled), 'said']);
    return fight;
  }

  answer(fight, move.opens, move.keep);
  fight.steady = move.steady || fight.steady;
  fight.round += 1;
  return fight;
}

// Somebody else takes the front, in the middle of the fight, on purpose. It costs the
// whole turn — nobody swings — and the one coming in is the one who wears whatever the
// foe makes of the changeover. What a second fighter buys is somewhere to put the damage.
export function swapTo(fight, id) {
  if (!fight || fight.over || id === fight.who) return fight;
  const out = fight.who;
  fight.log = [[`${nameOf(id)} comes across and ${nameOf(out)} falls back out of it, and the changeover is the turn.`, 'us']];
  fight.who = id;
  fight.steady = 0; // whatever the last one had found their feet on, they took with them
  answer(fight, TUNING.combat.swapOpens, 1);
  fight.round += 1;
  return fight;
}

// And somebody stepping over one who is already down. The blow that put the last one
// there was that turn, so this one costs nothing: the fight is simply carried on, and it
// is carried on where it stood — the foe keeps every wound the one being carried put in.
export function stepIn(fight, id) {
  if (!fight || fight.over === 'won') return fight;
  fight.who = id;
  fight.over = null; // the fighter was finished; the fight was not
  fight.steady = 0;
  fight.log = [[`${nameOf(id)} steps over them and takes the front.`, 'us']];
  return fight;
}

// what it has taken out of the party over the whole fight, and off whom
export function hurtOf(fight) {
  return Object.entries(fight.hurt).filter(([, n]) => n > 0);
}

// What a move is worth, in the numbers rather than the words — printed under it so the
// choice is made on something more than the verb.
export function moveLine(move, fight) {
  const me = fight ? combatOf(fight.who) : null;
  const bits = [];
  if (move.harm > 0) {
    const harm = me ? `${Math.round(me.harm[0] * move.harm)}–${Math.round(me.harm[1] * move.harm)}` : 'harm';
    bits.push(`${harm} harm`);
    const hit = move.hit + (fight ? fight.steady : 0);
    if (hit) bits.push(`${hit > 0 ? '+' : ''}${hit} to hit`);
  } else bits.push('no swing');
  if (move.opens) bits.push(`it answers at +${move.opens}`);
  if (move.keep < 1) bits.push(`its blow cut to ${Math.round(move.keep * 100)}%`);
  if (move.steady) bits.push(`+${move.steady} to your next`);
  return bits.join(', ');
}
