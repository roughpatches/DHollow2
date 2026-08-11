// The things a character is good at. A trait is a number of points, not a badge: a
// character puts traitPointsAtLevelOne of them across this list at level one, and what
// they never spent on is what they are untrained at.
//   id         — how src/party.js and any activity refers to the trait.
//   name       — shown in the menu and on a character's sheet.
//   activities — which activities the points apply to. Named here rather than in the
//                activity, so a new trait needs no change anywhere else.
//   draws      — quest tags this trait is drawn to. A character with any points in it
//                is keener to come on work tagged this way, and needs less of a bond.
//   unlocks    — extra options the trait puts in front of the player, one line each.
//   body       — what the trait is, in the world's voice. Yours to write.
// What a point is worth is one number in tuning.js, the same for every trait: it adds
// traitBonusPerPoint to those activities, one to any roll against a DC for that trait,
// and traitYieldPerPoint to what the party carries out of work of that kind.
// Add a trait by adding an entry. Nothing reads this list by position.

export const TRAITS = [
  {
    id: 'woodcraft',
    name: 'Woodcraft',
    activities: ['Felling', 'Sawing', 'Shaping'],
    draws: ['forest', 'timber'],
    unlocks: [
      'Read a tree\'s lean before the first cut.',
      'Salvage a botched cut instead of losing the stock.',
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
    id: 'smithing',
    name: 'Smithing',
    activities: ['Smelting', 'Forging', 'Salvage'],
    draws: ['iron', 'ruin'],
    unlocks: [
      'Tell sound iron from rusted-through at a glance.',
      'Make a broken tool hold for one more day\'s work.',
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
];
