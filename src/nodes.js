// content/nodes.js is written the way a designer says a node: a resource node is a list
// of harvests, an encounter node is two ways through. src/run.js walks one shape — the
// kind documented in content/encounters.js — so the two tables are folded into that shape
// once, here, at load. Nothing is made per run: what is written is what the road hands
// out, and a node can be read off the content file without running the game.

import { RESOURCE_NODES, ENCOUNTER_NODES } from '../content/nodes.js';

// A resource node keeps its harvests as they were written. run.js gates each one on
// whether anybody walking can do that work and pays each one on its own, so the node
// itself has no single harvest, no roll, and no list of spoils.
function fromResource(n) {
  return {
    ...n,
    harvest: null,
    check: null,
    spoils: {},
    draw: null,
    // What the node is called before anybody has been gated. Once the party is known,
    // the work they can actually do decides which engine opens; see activityOf in run.js.
    activity: n.harvests[0].activity,
  };
}

// An encounter node is two skill checks and a choice between them, which is what a beat
// carrying `choose` already is. The cards are laid out here so the content file does not
// have to spell out seven of them to ask one question: the way in, the attempt, and the
// two ends of each way. The body is spent on the first card, so the node keeps none.
function fromEncounter(n) {
  const beats = [{
    id: 'in',
    text: n.body,
    choose: n.ways.map((w, i) => ({ text: w.text, skill: w.skill, dc: w.dc, then: `try${i}` })),
  }];
  n.ways.forEach((w, i) => {
    beats.push({ id: `try${i}`, text: [w.tried], result: { hit: `held${i}`, miss: `lost${i}` } });
    beats.push({ id: `held${i}`, text: [w.held], spoils: w.spoils || {}, con: w.con || 0 });
    beats.push({ id: `lost${i}`, text: [w.lost], con: -(w.lostCon || 0) });
  });
  return {
    ...n, harvest: null, check: null, spoils: {}, draw: null, activity: null, body: [], beats,
    // Once a job, whatever the length. A resource node is a place and there is more than
    // one clearing in a wood; an encounter is a thing that happened, and the same thing
    // happening twice on one walk out reads as the road running short of ideas.
    once: true,
  };
}

// everything a run draws from, in the order the content files list it
export const DRAWN_KINDS = [
  ...RESOURCE_NODES.map(fromResource),
  ...ENCOUNTER_NODES.map(fromEncounter),
];
