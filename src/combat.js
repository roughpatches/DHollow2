// One fight: one fighter, one foe, and blows traded until one of them is down. Where
// there is a band of them, it is still one at a time — theirs send the next one forward
// the moment the one in front goes down, the same way yours do.
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

// A count, said rather than printed. Nothing on either side of a fight is ever more than
// partyMax, so the list is short and anything past it falls back to the figure.
const SAID = ['no', 'one', 'two', 'three', 'four', 'five', 'six'];

export function saidCount(n) {
  return SAID[n] || `${n}`;
}

// A foe's name is written as a title — The thing that was following — and a title dropped
// into the middle of a sentence reads as a shout. This is the same name said mid-line.
function named(foe) {
  return foe.name.replace(/^The /, 'the ');
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
// What is actually standing there, out of what the node named. An entry is a foe id, or
// an id with how many of it turn up — rolled here, when the party walks into it, so the
// same node is not the same band twice. Never more than a party's worth of them.
export function muster(band, thin = 0) {
  const out = [];
  for (const entry of band) {
    const foe = FOE[typeof entry === 'string' ? entry : entry.id];
    if (!foe) continue;
    const many = typeof entry === 'string' ? 1 : roll(entry.many || [1, 1]);
    for (let i = 0; i < many; i++) out.push(foe);
  }
  const most = Math.max(1, Math.min(TUNING.partyMax, out.length - thin));
  return out.slice(0, most);
}

// `foes` is everything standing there, in the order it comes on. The one in front is the
// fight; the rest are waiting, and what the ways in were worth lands on the one in front
// — the party never sees the back of the band until they have got through what is ahead.
export function begin(who, foes, { pool, weaken = 0, ambush = false }) {
  const [foe, ...rest] = foes;
  const fight = {
    who, // whoever is standing in front of it, and null while nobody is
    foe, // and whoever is standing in front of them
    // The ones behind it, in the order they come on, each carrying what it has left:
    // one that pulled back wounded comes forward again wounded.
    rest: rest.map((f) => ({ foe: f, hp: f.hp, max: f.hp })),
    felled: [], // and the ones already put down, for what is taken off them
    pool,
    foeMax: foe.hp,
    foeHp: Math.max(1, foe.hp - weaken),
    weakened: weaken,
    round: 1,
    steady: 0, // what a turn spent guarding is worth to the next swing
    opening: 0, // and what their own changeover is worth to it
    hurt: {}, // what it has taken off each of them, for the tally afterwards
    over: null, // 'won' once they are all down, 'down' once whoever is up is
    log: [],
  };
  fight.log.push([foe.body[0], 'them']);
  if (rest.length) {
    fight.log.push([`There are ${saidCount(rest.length + 1)} of them.`, 'them']);
  }
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

// One of them is down. The next comes forward if there is one, which costs neither side
// a turn — the blow that put the last one down was that turn. Returns whether the fight
// is still going, and ends it where nothing is left standing.
function nextUp(fight) {
  fight.felled.push(fight.foe);
  if (!fight.rest.length) {
    fight.over = 'won';
    return false;
  }
  comeForward(fight);
  fight.log.push([fight.rest.length
    ? `Another comes forward, and there are ${saidCount(fight.rest.length + 1)} of them left.`
    : 'The last of them comes forward.', 'them']);
  return true;
}

// the next one out of the queue, with whatever it has left, standing in front
function comeForward(fight) {
  const next = fight.rest.shift();
  fight.foe = next.foe;
  fight.foeMax = next.max;
  fight.foeHp = next.hp;
}

// Their own changeover. A band written to work as one pulls its hurt one out from the
// front rather than letting you finish it, and something fresher takes its place — but
// it costs them the blow they were going to throw, and a changeover is an opening
// whoever is facing it can use, the same as it is when the party does it.
function pullsBack(fight) {
  const foe = fight.foe;
  if (!foe.pulls || !fight.rest.length) return false;
  if (fight.foeHp / fight.foeMax > TUNING.combat.foePullsAt) return false;
  const fresher = fight.rest.some((f) => f.hp / f.max > fight.foeHp / fight.foeMax);
  if (!fresher) return false;
  // it goes to the back as hurt as it is, and the freshest of them comes across
  fight.rest.sort((a, b) => b.hp / b.max - a.hp / a.max);
  fight.rest.push({ foe, hp: fight.foeHp, max: fight.foeMax });
  comeForward(fight);
  // where the one coming across is the same kind of thing, it is another of them rather
  // than a second reading of the same name
  const across = fight.foe.name === foe.name ? 'another of them' : named(fight.foe);
  fight.log.push([`${foe.name} breaks off out of your reach, and ${across} comes across in front of it.`, 'them']);
  fight.opening = TUNING.combat.swapOpens;
  return true;
}

// One turn: the move the player took, and the foe's answer to it. A move that does not
// swing is a move that takes the weight of what comes back and steadies the next one.
export function take(fight, moveId) {
  const move = MOVES.find((m) => m.id === moveId);
  if (!fight || fight.over || !move) return fight;
  fight.log = [];
  const me = combatOf(fight.who);

  if (move.harm > 0) {
    const s = swing(me.hit + move.hit + fight.steady + fight.opening, fight.foe.guard);
    const hurt = s.lands ? Math.max(1, Math.round(roll(me.harm) * move.harm)) : 0;
    fight.log.push([swingLine(nameOf(fight.who), s, hurt, 'it'), 'us']);
    fight.foeHp = Math.max(0, fight.foeHp - hurt);
    fight.steady = 0;
  } else {
    fight.log.push([`${nameOf(fight.who)} takes the turn to cover up and find their feet.`, 'us']);
  }
  fight.opening = 0; // taken, or let go: either way the moment was this turn

  if (fight.foeHp <= 0) {
    fight.log.push([pick(fight.foe.felled), 'said']);
    nextUp(fight);
    return fight;
  }

  // They may change over instead of answering, which costs them the blow
  if (!pullsBack(fight)) answer(fight, move.opens, move.keep);
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
  fight.opening = 0; // and any opening left standing was not taken
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
  fight.opening = 0;
  fight.log = [[`${nameOf(id)} steps over them and takes the front.`, 'us']];
  return fight;
}

// what it has taken out of the party over the whole fight, and off whom
export function hurtOf(fight) {
  return Object.entries(fight.hurt).filter(([, n]) => n > 0);
}

// And what is taken off them: every one of them pays what it was written to pay, so a
// band of three hands over three of everything. Ranges are added rather than rolled here,
// because the node rolls its spoils in one place and this is one more range to roll.
export function spoilsOf(fight) {
  const out = {};
  for (const foe of fight.felled) {
    for (const [m, [lo, hi]] of Object.entries(foe.spoils || {})) {
      const [a, b] = out[m] || [0, 0];
      out[m] = [a + lo, b + hi];
    }
  }
  return out;
}

// What a move is worth, in the numbers rather than the words — printed under it so the
// choice is made on something more than the verb.
export function moveLine(move, fight) {
  const me = fight ? combatOf(fight.who) : null;
  const bits = [];
  if (move.harm > 0) {
    const harm = me ? `${Math.round(me.harm[0] * move.harm)}–${Math.round(me.harm[1] * move.harm)}` : 'harm';
    bits.push(`${harm} harm`);
    const hit = move.hit + (fight ? fight.steady + fight.opening : 0);
    if (hit) bits.push(`${hit > 0 ? '+' : ''}${hit} to hit`);
  } else bits.push('no swing');
  if (move.opens) bits.push(`it answers at +${move.opens}`);
  if (move.keep < 1) bits.push(`its blow cut to ${Math.round(move.keep * 100)}%`);
  if (move.steady) bits.push(`+${move.steady} to your next`);
  return bits.join(', ');
}
