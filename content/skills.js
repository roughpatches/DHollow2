// The things a character is good at. A skill is a number of points, not a badge: at
// level one a character takes skillsAtLevelOne of these and spreads
// skillPointsAtLevelOne between them, and the rest of the list is what they are
// untrained at.
//   id         — how src/party.js and any activity refers to the skill.
//   name       — shown in the menu and on a character's sheet.
//   activities — which activities the points apply to. Named here rather than in the
//                activity, so a new skill needs no change anywhere else.
//   draws      — quest tags this skill is drawn to. A character with any points in it
//                is keener to come on work tagged this way, and needs less of a bond.
//   unlocks    — extra options the skill puts in front of the player, one line each.
//   body       — what the skill is, in the world's voice. Yours to write.
// What a point is worth is one number in tuning.js, the same for every skill: it adds
// skillBonusPerPoint to those activities, one to any roll against a DC for that skill,
// and skillYieldPerPoint to what the party carries out of work of that kind.
// Add a skill by adding an entry. Nothing reads this list by position.
//
// Animal Handling is last and is only here because Aldis's second skill is on it. Delete
// the block and move his two points whenever you want it gone.

export const SKILLS = [
  {
    id: 'alchemy',
    name: 'Alchemy',
    activities: ['Brewing', 'Distilling', 'Tincturing'],
    draws: ['fen', 'wild'],
    unlocks: [
      'Name what a plant does before it is boiled, not after.',
      'Get a second draught out of the same weight of leaf.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'woodcraft',
    name: 'Woodcraft',
    activities: ['Shaping', 'Joinery', 'Carving'],
    draws: ['forest', 'ruin'],
    unlocks: [
      'Read a tree\'s lean before the first cut.',
      'Salvage a botched cut instead of losing the stock.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'woodcutting',
    name: 'Woodcutting',
    activities: ['Felling', 'Sawing', 'Splitting'],
    draws: ['forest', 'timber'],
    unlocks: [
      'Drop a tree where you said it would go, with a crowd watching.',
      'Keep a saw out of the bind on the last third of a cut.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'sailing',
    name: 'Sailing',
    activities: ['Rowing', 'Rigging', 'Navigation'],
    draws: ['water', 'coast'],
    unlocks: [
      'Hold a course in weather that would beach a landsman.',
      'Judge a hull\'s soundness before boarding it.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'fishing',
    name: 'Fishing',
    activities: ['Casting', 'Hooking', 'Netting'],
    draws: ['water', 'fen'],
    unlocks: [
      'Spot a feeding lane from the bank.',
      'Set the hook on a feint without losing the fish.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'charisma',
    name: 'Charisma',
    activities: ['Haggling', 'Persuasion', 'Rumour'],
    draws: ['folk', 'road'],
    unlocks: [
      'Ask a second question where one was the limit.',
      'Get a price named before you have to name one.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'perception',
    name: 'Perception',
    activities: ['Watching', 'Tracking', 'Searching'],
    draws: ['dark', 'road'],
    unlocks: [
      'Notice the thing that has been moved before you notice it is missing.',
      'Call a halt before the party walks onto bad ground.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'animalhandling',
    name: 'Animal Handling',
    activities: ['Herding', 'Riding', 'Calming'],
    draws: ['beasts', 'wild'],
    unlocks: [
      'Approach a spooked animal without it bolting.',
      'Read what an animal has been doing from its tracks.',
    ],
    body: ['[Placeholder Text]'],
  },
];
