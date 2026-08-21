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
//       cost  — materials to reach the NEXT stage. The last stage has none, and no stage
//               has one at the moment: the materials repairs used to be written in are
//               gone and the new ones are not written yet, so nothing levels until they
//               are. Every stage below is what a building IS at that level; what it takes
//               to get there is the hole.
//       cap   — the level nobody can pass while the building stands like this. It is how
//               a repair is worth something to a character rather than only to the town:
//               the highest cap standing anywhere is the party's, and rebuilding is the
//               only thing that moves it. See levelCap in src/town.js. A stage without one
//               holds nobody back.
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
    // It is also what holds the party's level down. Nothing else in town carries a `cap`,
    // so the chapel sets it alone: three at a ruin, six shored up, nine roofed.
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
        cap: 3,
      },
      {
        name: 'Shored up',
        note: 'Scaffolded, sheeted, and dry for the first winter in years.',
        cap: 6,
      },
      {
        name: 'Roofed and lit',
        note: 'Slated, swept, and open. You can hear how big it is from the door.',
        cap: 9,
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
    // It starts at the hearth rather than cold, because no stage in town has a repair cost
    // written yet: left at stage 0 the crucible would be a thing nobody could reach.
    id: 'forge',
    name: 'The smithy',
    map: 'searow',
    site: [31], // the open-fronted shed at the east end of the row, off the cobbles
    level: 1,
    stages: [
      {
        name: 'Cold',
        note: 'The roof is off the shed and the hearth is full of rain.',
      },
      {
        name: 'Hearth lit',
        note: 'Sheeted over, the hearth swept, the bellows patched, and a fire in it that will hold all day.',
        craft: true,
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
      },
      {
        name: 'Bench and stove',
        note: 'Swept, glazed, and warm enough to hold a steep at temperature.',
        craft: true,
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
    // Inside the Sea Hag, at the far end of the bar, and the only workstation in town
    // there is no way of seeing from the road. A workstation on an interior map needs
    // nothing the street's do not: a site, and a stage that crafts.
    // Two working stages: a range anybody can put a pan on, and the smokehouse in the
    // yard behind it, which is what the second repair buys and what the keeping food is
    // waiting for.
    id: 'kitchen',
    name: 'The Sea Hag\'s kitchen',
    map: 'tavern',
    site: [6], // the range behind the west end of the bar
    level: 0,
    stages: [
      {
        name: 'Cold hearth',
        note: 'The range is out and has been out long enough to be a shelf.',
      },
      {
        name: 'Lit',
        note: 'Drawing properly, with a pan on it and somebody willing to lend you the pan.',
        craft: true,
      },
      {
        name: 'Range and smokehouse',
        note: 'An oven that holds its heat, and a shed in the yard hung to the roof.',
        craft: true,
      },
    ],
    body: [
      'A cast range at the west end of the bar with a flue that has not been swept in the landlord\'s lifetime.',
      'There is nothing wrong with it that a day\'s work and something worth cooking would not fix.',
    ],
  },
  {
    // The gem cutter's bench, in the house east of the Sea Hag with its windows out —
    // which is why it is that house: cutting is done in daylight or not at all. Two
    // working stages: a hand wheel anybody can grind on, and the treadle mill behind it,
    // which is what the second repair buys and what the faceted stones are waiting for.
    // It starts at the hand wheel for the same reason the smithy starts lit: no stage in
    // town has a repair cost written yet, and the nine stones would otherwise be a list
    // nobody could reach.
    id: 'studio',
    name: 'The Artisan\'s Studio',
    map: 'harbourroad',
    site: [29], // the door east of the tavern, under the window with the glass gone
    level: 1,
    stages: [
      {
        name: 'Windows out',
        note: 'Glass gone from the front and the weather coming in where the light should.',
      },
      {
        name: 'Bench and hand wheel',
        note: 'Glazed, swept, and a wheel on the bench that turns as fast as an arm can turn it.',
        craft: true,
      },
      {
        name: 'Treadle mill standing',
        note: 'A wheel driven from the floor, so both hands are free for the stone.',
        craft: true,
      },
    ],
    body: [
      'A shopfront with its glass out and its shutters gone, which is the worst thing that can happen to a room and the best thing that can happen to the light in one.',
      'The bench is still against the window. Whoever worked at it took the wheel and left the bench.',
    ],
  },
  {
    // The east end of town, where the paving runs out over the mud. Nothing is made here
    // yet: three stages of repair and no `craft` on any of them, so standing at it only
    // repairs it, until there is work written for it.
    id: 'docks',
    name: 'The docks',
    map: 'quay',
    site: [34], // the head of the old jetty, where the paving gives out over the mud
    level: 0,
    stages: [
      {
        name: 'Washed out',
        note: 'Half the piles are down and the deck of it is on the mud in pieces.',
      },
      {
        name: 'Piled and decked',
        note: 'Driven, decked and railed, and it will take a man walking out to the end of it.',
      },
      {
        name: 'Working wharf',
        note: 'Bollards, a crane post, and water enough under it to lay a boat alongside.',
      },
    ],
    body: [
      'A jetty going out over the flat on legs that are mostly not there any more, with the deck of it lying about underneath in the mud it fell into.',
      'A harbour was cut here once and the shape of the ground still says where. Everything else about it has to be put back.',
    ],
  },
];
