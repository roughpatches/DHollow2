// The things a character is good at. Everyone picks three of these at level one.
//   id         — how src/party.js and any activity refers to the trait.
//   name       — shown in the menu and on a character's sheet.
//   activities — which activities the bonus applies to. Named here rather than in the
//                activity, so a new trait needs no change anywhere else.
//   bonus      — flat number added to those activities. Bigger is better.
//   draws      — quest tags this trait is drawn to. A character whose trait matches a
//                quest's tag is keener to come, and needs less of a bond to say yes.
//   unlocks    — extra options the trait puts in front of the player, one line each.
//   body       — what the trait is, in the world's voice. Yours to write.
// Add a trait by adding an entry. Nothing reads this list by position.

export const TRAITS = [
  {
    id: 'woodcraft',
    name: 'Woodcraft',
    activities: ['Felling', 'Sawing', 'Shaping'],
    bonus: 2,
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
    bonus: 2,
    draws: ['beasts', 'wild'],
    unlocks: [
      'Approach a spooked animal without it bolting.',
      'Read what an animal has been doing from its tracks.',
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'sailing',
    name: 'Sailing',
    activities: ['Rowing', 'Rigging', 'Navigation'],
    bonus: 2,
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
    bonus: 2,
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
    bonus: 2,
    draws: ['folk', 'road'],
    unlocks: [
      'Ask a second question where one was the limit.',
      'Get a price named before you have to name one.',
    ],
    body: ['[Placeholder Text]'],
  },
];
