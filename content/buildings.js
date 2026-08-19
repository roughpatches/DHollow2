// Every building in town, and what it takes to bring it back into working condition.
//   id      — how src/town.js and content/places.js refer to it.
//   map     — the map the building stands on.
//   site    — where the building is: one number, how far along the panel it stands.
//             Standing there and pressing [E] is how it is reached.
//   enter   — the interior map its door leads to, if it has one. Omit for a site
//             with no inside, like the docks.
//   level   — the stage it starts at. Index into stages.
//   stages  — what it is at each level, lowest first.
//       name  — the state, shown wherever the building is listed.
//       note  — one line on what the state means. Mechanical; rewrite freely.
//       open  — whether the door works at this level.
//       craft — whether the workstation inside works at this level. A building with this
//               on a stage is a workstation from that stage on, and standing at it opens
//               what can be made there; see content/recipes.js.
//       cost  — materials to reach the NEXT stage. The last stage has none.
//   body    — what the place is, in the world's voice. Yours to write.
// A building whose id is also in STRUCTURES in content/looks.js has a picture per stage,
// and repairing it changes the picture where it stands.
// Add a building by adding a block. Nothing reads this list by position.

export const BUILDINGS = [
  {
    id: 'tavern',
    name: 'The Sea Hag',
    map: 'harbourroad',
    site: [16], // the doorway under the sign, measured off the painting
    enter: 'tavern',
    level: 0,
    stages: [
      { name: 'Open', note: 'The only building in town still doing what it was built for.', open: true },
    ],
    body: [
      'A clock that stopped over a door that did not. It is the last lit window at the west end of the town, and the only building on that stretch anybody has kept the rain out of.',
    ],
  },
  {
    // Three stages, three pictures. The door is shut until the roof is back on: there is
    // nothing inside a burnt chapel but weather.
    id: 'chapel',
    name: 'The chapel',
    map: 'woodend',
    site: [37], // among the graves, at the east end of the burying ground
    enter: 'chapel',
    level: 0,
    stages: [
      {
        name: 'Burnt out',
        note: 'The roof is in the nave and the door is boarded over.',
        cost: { timber: 14, nails: 30, canvas: 4 },
      },
      {
        name: 'Shored up',
        note: 'Scaffolded, sheeted, and dry for the first winter in years.',
        cost: { timber: 22, stone: 16, nails: 40, pitch: 6 },
      },
      {
        name: 'Roofed and lit',
        note: 'Slated, swept, and open. You can hear how big it is from the door.',
        open: true,
      },
    ],
    body: [
      'Soot-black stone at the north end of the paving, with the burnt ends of its rafters still standing up out of the nave like ribs.',
      'Nobody will say what year it went up, only that it went up at night.',
    ],
  },
  {
    // The first workstation. Two working stages: a hearth anybody can smelt at, and the
    // furnace behind it, which is what the second repair buys and what the recipes gated
    // at stage 2 are waiting for.
    id: 'forge',
    name: 'The smithy',
    map: 'searow',
    site: [31], // the open-fronted shed at the east end of the row, off the cobbles
    level: 0,
    stages: [
      {
        name: 'Cold',
        note: 'The roof is off the shed and the hearth is full of rain.',
        cost: { timber: 10, stone: 12, nails: 20 },
      },
      {
        name: 'Hearth lit',
        note: 'Sheeted over, the hearth swept, the bellows patched, and the treadle wheel turning again in the corner.',
        craft: true,
        cost: { stone: 18, bronzebar: 3, pitch: 4 },
      },
      {
        name: 'Furnace standing',
        note: 'A stack tall enough to hold its heat, coal in the top of it, and bronze coming out of the bottom by the bar.',
        craft: true,
      },
    ],
    body: [
      'An open-fronted shed with a stone hearth at the back of it and an anvil nobody could be bothered to steal.',
      'The last smith in Dreadhollow left the tongs where they were. They are still where they were.',
    ],
  },
  {
    // The last shopfront in Dreadhollow, at the east end of the field road — the one with
    // its sign worn past reading. Two working stages: a bench anybody can steep at, and
    // the still itself, which is what the wicked recipes are waiting for.
    id: 'stillroom',
    name: 'The still room',
    map: 'fieldroad',
    site: [36], // the shop door, under the sign nobody can read
    level: 0,
    stages: [
      {
        name: 'Shuttered',
        note: 'Boarded at the front and going green at the back. The shelves are still up.',
        cost: { timber: 8, stone: 6, canvas: 4, nails: 10 },
      },
      {
        name: 'Bench and stove',
        note: 'Swept, glazed, and warm enough to hold a steep at temperature.',
        craft: true,
        cost: { stone: 12, bronzebar: 2, canvas: 6 },
      },
      {
        name: 'Still standing',
        note: 'Copper head, worm tub, and a bench long enough to lay a whole recipe out on.',
        craft: true,
      },
    ],
    body: [
      'An apothecary\'s shop with its sign worn past reading and its window boarded from the inside, which is not how a shop is usually boarded.',
      'Whatever was on the shelves went with whoever left. The shelves stayed.',
    ],
  },
  {
    // Inside the Sea Hag, at the far end of the bar. A workstation on an interior map
    // needs nothing the street's do not: a site, and a stage that crafts.
    id: 'kitchen',
    name: 'The Sea Hag\'s kitchen',
    map: 'tavern',
    site: [6], // the range behind the west end of the bar
    level: 0,
    stages: [
      {
        name: 'Cold hearth',
        note: 'The range is out and has been out long enough to be a shelf.',
        cost: { timber: 8, nails: 12, pitch: 2 },
      },
      {
        name: 'Lit',
        note: 'Drawing properly, with a pan on it and somebody willing to lend you the pan.',
        craft: true,
      },
    ],
    body: [
      'A cast range at the west end of the bar with a flue that has not been swept in the landlord\'s lifetime.',
      'There is nothing wrong with it that a day\'s work and something worth cooking would not fix.',
    ],
  },
];
