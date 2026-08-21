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
// have to spell out eight of them to ask one question: what is standing there, the ways
// out of it, the attempt, and the two ends of each way. Every encounter is set up, asked,
// and answered in that order, and the writing and the question are never on the same card:
// a body with the ways printed under it is a description you read past to get to the menu.
// The body is spent on the first card, so the node keeps none.
// A node carrying a foe fights it at the end of whichever way was taken, unless that
// way was one that avoids it. A beat carrying `fight` is where the fight starts, and how
// it starts is what the way was worth: held and the foe may come on weakened, lost and it
// has the first blow. A node with no foe never writes one of these and nothing changes.
function fromEncounter(n) {
  // What is standing there, normalised: a node names one `foe` or a `foes` band, and the
  // beats carry the band either way. How many of each turn up is rolled when the party
  // walks into it; see muster in src/combat.js.
  const band = n.foes || (n.foe ? [n.foe] : null);
  const fight = (extra) => (band ? { band, ...extra } : null);
  const beats = [
    { id: 'in', text: n.body, then: 'ways' },
    {
      id: 'ways',
      // a way naming no skill is not rolled: it walks straight into whatever is standing there
      choose: n.ways.map((w, i) => ({
        text: w.text, skill: w.skill, dc: w.dc, then: w.skill ? `try${i}` : `met${i}`,
      })),
    },
  ];
  n.ways.forEach((w, i) => {
    if (!w.skill) {
      beats.push({
        id: `met${i}`, text: [w.met], spoils: w.spoils || {}, con: w.con || 0, fight: fight(),
      });
      return;
    }
    beats.push({ id: `try${i}`, text: [w.tried], result: { hit: `held${i}`, miss: `lost${i}` } });
    beats.push({
      id: `held${i}`,
      text: [w.held],
      spoils: w.spoils || {},
      con: w.con || 0,
      fight: w.avoids ? null : fight({ weaken: w.weakens || 0, thin: w.thins || 0 }),
    });
    beats.push({
      id: `lost${i}`, text: [w.lost], con: -(w.lostCon || 0), fight: fight({ ambush: true }),
    });
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
