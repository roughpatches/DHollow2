// What can be waiting at a node. A run draws from this table, so adding a kind here
// puts it into every quest without touching anything else.
//   id       — how src/run.js refers to it.
//   name     — shown at the top of the node.
//   nature   — gather, talk, combat, or hazard. Says what a run is likely to be made of
//              before you set out, and does one thing besides: a combat kind is drawn
//              only after dark, so a day run never puts one up whatever its weight says.
//   activity — the activity this node will become once that engine is imported. Until
//              then the node names it, pays out, and moves on.
//   weight   — how often it comes up by day and by night, relative to the other
//              weights. Nothing is ever zero: a night run still has timber in it. A
//              combat kind's day weight is never read, because nothing is fought by
//              daylight; leave it written for the day it is wanted.
//   read     — the skill that can spot this kind coming at a fork, and what they say.
//              A kind with no read is one nobody can see coming. Whoever has the most
//              points in it is the one who speaks.
//   harvest  — the skill this work is done with. Every point the walking party has in
//              it adds skillYieldPerPoint to the spoils, so who you take decides what
//              you carry home. A kind with no harvest pays the same to anybody.
//   check    — a roll against a difficulty, in the manner of the table: the party's
//              best at the skill rolls a die and adds their points, and needs the DC.
//              `held` and `lost` are the line said either way. What holding and losing
//              are worth is in tuning.js, not here.
//   spoils   — materials taken, [least, most] each. Rolled per node.
//   xp       — experience, [least, most].
//   con      — what it does to the party's constitution, [least, most]. Negative takes
//              and positive gives, so a spring or a dry barn can be written as a kind
//              that puts something back. Night multiplies what it takes; see tuning.js.
//   body     — what the encounter is, in the world's voice. Yours to write.

export const ENCOUNTERS = [
  {
    id: 'woodland',
    name: 'Standing timber',
    nature: 'gather',
    activity: 'Felling',
    weight: { day: 5, night: 1 },
    read: { skill: 'woodcraft', line: 'Old cut stumps. Somebody worked this side, and there is more of it standing.' },
    harvest: 'woodcraft',
    check: {
      skill: 'woodcraft',
      dc: 12,
      held: 'It comes down where it was told to.',
      lost: 'It goes over the wrong way, takes a second tree with it, and most of the good wood is under both.',
    },
    spoils: { timber: [2, 4] },
    xp: [8, 14],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'crag',
    name: 'Broken crag',
    nature: 'gather',
    activity: 'Hauling',
    weight: { day: 4, night: 1 },
    read: null,
    harvest: 'smithing',
    check: {
      skill: 'smithing',
      dc: 12,
      held: 'The face splits where it was struck and the blocks come away square.',
      lost: 'The face shatters. What is left is rubble, and one of you was standing under it.',
    },
    spoils: { stone: [2, 4] },
    xp: [8, 14],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animal',
    name: 'Something living',
    nature: 'gather',
    activity: 'Calming',
    weight: { day: 4, night: 3 },
    read: { skill: 'animalhandling', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    harvest: 'animalhandling',
    check: {
      skill: 'animalhandling',
      dc: 13,
      held: 'It stands still long enough to be worth the standing still.',
      lost: 'It bolts, and it does not bolt away from you first.',
    },
    // a cured hide is the same material as sailcloth to anyone patching a roof with it
    spoils: { canvas: [1, 2] },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'wreck',
    name: 'Wreck on the shore',
    nature: 'gather',
    activity: 'Rigging',
    weight: { day: 3, night: 2 },
    read: { skill: 'sailing', line: 'The water runs wrong ahead. Something is aground on that side.' },
    harvest: 'sailing',
    check: {
      skill: 'sailing',
      dc: 13,
      held: 'She holds while you strip her.',
      lost: 'She shifts on the tide with the party still aboard her.',
    },
    spoils: { canvas: [1, 3], timber: [1, 2] },
    xp: [10, 18],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'water',
    name: 'Standing water',
    nature: 'gather',
    activity: 'Casting',
    weight: { day: 4, night: 2 },
    read: { skill: 'fishing', line: 'Rings on the surface, and they are not the rain. There is a lane feeding that way.' },
    harvest: 'fishing',
    check: {
      skill: 'fishing',
      dc: 11,
      held: 'The lane is where somebody said it was.',
      lost: 'An hour of wet standing for nothing, and the light going while you do it.',
    },
    spoils: { pitch: [1, 2] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'find',
    name: 'Left behind',
    nature: 'gather',
    activity: 'Searching',
    weight: { day: 3, night: 2 },
    read: { skill: 'perception', line: 'Something is stacked too neatly on that side to have got there by weather.' },
    harvest: 'perception',
    check: {
      skill: 'perception',
      dc: 10,
      held: 'The rest of it is under the sacking, where anybody would have put it.',
      lost: 'You take what is on top and walk past the rest without ever knowing it was there.',
    },
    spoils: { timber: [1, 2], nails: [1, 3] },
    xp: [6, 10],
    con: [0, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'oldiron',
    name: 'Iron in the ditch',
    nature: 'gather',
    activity: 'Salvage',
    weight: { day: 3, night: 2 },
    read: { skill: 'smithing', line: 'There is a cart axle in that ditch, and axles do not come out here on their own.' },
    harvest: 'smithing',
    check: {
      skill: 'smithing',
      dc: 12,
      held: 'Half of it is sound under the scale, and the sound half comes free.',
      lost: 'It is rust holding hands with rust. It comes apart in the lifting.',
    },
    spoils: { nails: [2, 5], stone: [0, 1] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'folk',
    name: 'Folk on the road',
    nature: 'talk',
    activity: 'Haggling',
    weight: { day: 5, night: 1 },
    read: { skill: 'charisma', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    harvest: 'charisma',
    check: null,
    spoils: { nails: [2, 4] },
    xp: [10, 16],
    con: [-1, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'strangers',
    name: 'Strangers, and no lamp',
    nature: 'talk',
    activity: 'Persuasion',
    weight: { day: 2, night: 4 },
    read: { skill: 'charisma', line: 'Somebody stood here a while and did not want to be seen doing it.' },
    harvest: 'charisma',
    check: {
      skill: 'charisma',
      dc: 14,
      held: 'They decide, out loud, that you are nobody worth the trouble.',
      lost: 'They decide the other thing, and they decide it first.',
    },
    spoils: { nails: [1, 3] },
    xp: [12, 20],
    con: [-2, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'hazard',
    name: 'Bad ground',
    nature: 'hazard',
    activity: null,
    weight: { day: 2, night: 4 },
    read: null,
    harvest: null,
    check: {
      skill: 'perception',
      dc: 12,
      held: 'Somebody calls the halt a pace before it matters.',
      lost: 'Nobody calls anything, and the ground takes the first one across it.',
    },
    spoils: {},
    xp: [4, 8],
    con: [-3, -1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'stalker',
    name: 'Something following',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 5 },
    read: { skill: 'animalhandling', line: 'Everything that should be making noise on that side has stopped.' },
    harvest: null,
    check: {
      skill: 'perception',
      dc: 14,
      held: 'You see it before it means you to, and it goes back to being weather in the trees.',
      lost: 'The first anybody knows of it is the weight of it.',
    },
    spoils: {},
    xp: [18, 28],
    con: [-4, -2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'unquiet',
    name: 'Out of the ground',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 4 },
    read: null,
    harvest: null,
    check: {
      skill: 'perception',
      dc: 15,
      held: 'The turned earth is noticed while it is still only turned earth.',
      lost: 'It is noticed afterwards, from the far side of it.',
    },
    spoils: { nails: [0, 2] },
    xp: [16, 24],
    con: [-4, -1],
    body: ['[Placeholder Text]'],
  },
];
