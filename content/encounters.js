// What can be waiting at a node. A run draws from this table, so adding a kind here
// puts it into every quest without touching anything else.
//   id       — how src/run.js refers to it.
//   name     — shown at the top of the node.
//   activity — the activity this node will become once that engine is imported. Until
//              then the node names it, pays out, and moves on.
//   weight   — how often it comes up. Relative to the other weights, not a percentage.
//   read     — the trait that can spot this kind coming at a fork, and what they say.
//              A kind with no read is one nobody can see coming.
//   spoils   — materials taken, [least, most] each. Rolled per node.
//   xp       — experience, [least, most].
//   hurt     — HP it costs, [least, most]. The whole reason a long quest is a gamble.
//   body     — what the encounter is, in the world's voice. Yours to write.

export const ENCOUNTERS = [
  {
    id: 'woodland',
    name: 'Standing timber',
    activity: 'Felling',
    weight: 4,
    read: { trait: 'woodcraft', line: 'Old cut stumps. Somebody worked this side, and there is more of it standing.' },
    spoils: { timber: [2, 4] },
    xp: [8, 14],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'crag',
    name: 'Broken crag',
    activity: 'Hauling',
    weight: 3,
    read: null,
    spoils: { stone: [2, 4] },
    xp: [8, 14],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animal',
    name: 'Something living',
    activity: 'Calming',
    weight: 4,
    read: { trait: 'animalhandling', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    // a cured hide is the same material as sailcloth to anyone patching a roof with it
    spoils: { canvas: [1, 2] },
    xp: [12, 20],
    hurt: [0, 3],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'wreck',
    name: 'Wreck on the shore',
    activity: 'Rigging',
    weight: 2,
    read: { trait: 'sailing', line: 'The water runs wrong ahead. Something is aground on that side.' },
    spoils: { canvas: [1, 3], timber: [1, 2] },
    xp: [10, 18],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'water',
    name: 'Standing water',
    activity: 'Casting',
    weight: 3,
    read: { trait: 'fishing', line: 'Rings on the surface, and they are not the rain. There is a lane feeding that way.' },
    spoils: { pitch: [1, 2] },
    xp: [10, 16],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'folk',
    name: 'Folk on the road',
    activity: 'Haggling',
    weight: 3,
    read: { trait: 'charisma', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    spoils: { nails: [2, 4] },
    xp: [10, 16],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'find',
    name: 'Left behind',
    activity: null,
    weight: 2,
    read: null,
    spoils: { timber: [1, 2], nails: [1, 3] },
    xp: [6, 10],
    hurt: [0, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'hazard',
    name: 'Bad ground',
    activity: null,
    weight: 3,
    read: null,
    spoils: {},
    xp: [4, 8],
    hurt: [2, 5],
    body: ['[Placeholder Text]'],
  },
];
