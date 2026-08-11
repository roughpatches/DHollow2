// What can be waiting at a node. A run draws from this table, so adding a kind here
// puts it into every quest without touching anything else.
//   id       — how src/run.js refers to it.
//   name     — shown at the top of the node.
//   nature   — gather, talk, combat, or hazard. Only used to say what a run is likely
//              to be made of before you set out.
//   activity — the activity this node will become once that engine is imported. Until
//              then the node names it, pays out, and moves on.
//   weight   — how often it comes up by day and by night, relative to the other
//              weights. Nothing is ever zero: a night run still has timber in it and a
//              day run can still be followed home.
//   read     — the trait that can spot this kind coming at a fork, and what they say.
//              A kind with no read is one nobody can see coming.
//   spoils   — materials taken, [least, most] each. Rolled per node.
//   xp       — experience, [least, most].
//   hurt     — HP it costs, [least, most]. Night multiplies this; see tuning.js.
//   body     — what the encounter is, in the world's voice. Yours to write.

export const ENCOUNTERS = [
  {
    id: 'woodland',
    name: 'Standing timber',
    nature: 'gather',
    activity: 'Felling',
    weight: { day: 5, night: 1 },
    read: { trait: 'woodcraft', line: 'Old cut stumps. Somebody worked this side, and there is more of it standing.' },
    spoils: { timber: [2, 4] },
    xp: [8, 14],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'crag',
    name: 'Broken crag',
    nature: 'gather',
    activity: 'Hauling',
    weight: { day: 4, night: 1 },
    read: null,
    spoils: { stone: [2, 4] },
    xp: [8, 14],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animal',
    name: 'Something living',
    nature: 'gather',
    activity: 'Calming',
    weight: { day: 4, night: 3 },
    read: { trait: 'animalhandling', line: 'Tracks. Something came through here on four legs and was not hurrying.' },
    // a cured hide is the same material as sailcloth to anyone patching a roof with it
    spoils: { canvas: [1, 2] },
    xp: [12, 20],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'wreck',
    name: 'Wreck on the shore',
    nature: 'gather',
    activity: 'Rigging',
    weight: { day: 3, night: 2 },
    read: { trait: 'sailing', line: 'The water runs wrong ahead. Something is aground on that side.' },
    spoils: { canvas: [1, 3], timber: [1, 2] },
    xp: [10, 18],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'water',
    name: 'Standing water',
    nature: 'gather',
    activity: 'Casting',
    weight: { day: 4, night: 2 },
    read: { trait: 'fishing', line: 'Rings on the surface, and they are not the rain. There is a lane feeding that way.' },
    spoils: { pitch: [1, 2] },
    xp: [10, 16],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'find',
    name: 'Left behind',
    nature: 'gather',
    activity: null,
    weight: { day: 3, night: 2 },
    read: null,
    spoils: { timber: [1, 2], nails: [1, 3] },
    xp: [6, 10],
    hurt: [0, 0],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'folk',
    name: 'Folk on the road',
    nature: 'talk',
    activity: 'Haggling',
    weight: { day: 5, night: 1 },
    read: { trait: 'charisma', line: 'Somebody has walked this recently and stopped to talk while they did.' },
    spoils: { nails: [2, 4] },
    xp: [10, 16],
    hurt: [0, 1],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'strangers',
    name: 'Strangers, and no lamp',
    nature: 'talk',
    activity: 'Persuasion',
    weight: { day: 2, night: 4 },
    read: { trait: 'charisma', line: 'Somebody stood here a while and did not want to be seen doing it.' },
    spoils: { nails: [1, 3] },
    xp: [12, 20],
    hurt: [0, 2],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'hazard',
    name: 'Bad ground',
    nature: 'hazard',
    activity: null,
    weight: { day: 2, night: 4 },
    read: null,
    spoils: {},
    xp: [4, 8],
    hurt: [1, 3],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'stalker',
    name: 'Something following',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 5 },
    read: { trait: 'animalhandling', line: 'Everything that should be making noise on that side has stopped.' },
    spoils: {},
    xp: [18, 28],
    hurt: [2, 4],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'unquiet',
    name: 'Out of the ground',
    nature: 'combat',
    activity: 'Fighting',
    weight: { day: 1, night: 4 },
    read: null,
    spoils: { nails: [0, 2] },
    xp: [16, 24],
    hurt: [1, 4],
    body: ['[Placeholder Text]'],
  },
];
