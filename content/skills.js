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
//   terrain    — the ground this skill reads, matched against a zone's terrain in
//                content/places.js. Every point somebody has in it is worth
//                conPerTerrainPoint constitution to a party setting out on that ground.
//                A skill with no terrain is worth the same everywhere.
//   unlocks    — extra options the skill puts in front of the player, one line each.
//   body       — what the skill is, in the world's voice. Yours to write.
// What a point is worth is one number in tuning.js, the same for every skill: it adds
// skillBonusPerPoint to those activities, one to any roll against a DC for that skill,
// and skillYieldPerPoint to what the party carries out of work of that kind.
// A skill's icon is its id, the way a material's is: SKILL_ART in content/looks.js says
// which cell of the painted sheet it is cut from, and src/icons.js draws a stand-in
// until there is paint for it. Neither wants anything named here.
// Add a skill by adding an entry. Nothing reads this list by position.

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
    body: [
      'The ability to identify natural ingredients and combine them into potions and medicines.',
      '(Allows for the creation of potions, etc. STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    // Animal Handling folded into this one: the forest's creatures are the forest, and
    // Calming and the spooked-animal line came across with them.
    id: 'woodcraft',
    name: 'Woodcraft',
    activities: ['Shaping', 'Joinery', 'Carving', 'Calming'],
    draws: ['forest', 'ruin'],
    terrain: 'forest',
    unlocks: [
      'Read a tree\'s lean before the first cut.',
      'Salvage a botched cut instead of losing the stock.',
      'Approach a spooked animal without it bolting.',
    ],
    body: [
      'Knowledge of the forest, its creatures, and its habitats.',
      '(Provides bonus to Constitution in forest areas)',
    ],
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
    body: [
      'The ability to identify, fell, and shape wood.',
      '(Provides bonus to loot drops from woodcutting nodes)',
    ],
  },
  {
    id: 'sailing',
    name: 'Sailing',
    activities: ['Rowing', 'Rigging', 'Navigation'],
    draws: ['water', 'coast'],
    terrain: 'water',
    unlocks: [
      'Hold a course in weather that would beach a landsman.',
      'Judge a hull\'s soundness before boarding it.',
    ],
    body: [
      'Knowledge of the sea and navigable waters.',
      '(Provides bonus to Constitution in water areas)',
    ],
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
    body: [
      'The ability to read water and catch fish.',
      '(Provides bonus to loot drops from fishing nodes)',
    ],
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
    body: [
      'The ability to influence others through manner and speech.',
      '(STILL UNDER DEVELOPMENT)',
    ],
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
    body: [
      'The ability to notice what is there, and to understand what it means.',
      '(STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    // Back on the list. Broken crag and Iron in the ditch have been asking for it all
    // along — they name it as what the work is done with and what the roll is against —
    // and with no such skill they rolled on the die alone and said so at boot. Nobody in
    // town has spent a point on it: Krael's three are still on Alchemy, one word away in
    // content/party.js if they should come back here.
    id: 'smithing',
    name: 'Smithing',
    activities: ['Smelting', 'Forging', 'Salvage'],
    draws: ['ruin', 'road'],
    unlocks: [
      'Tell sound iron from rust before it is carried anywhere.',
      'Get a second pull out of a bloom that would have gone to scrap.',
    ],
    body: [
      'The ability to smelt and forge items from workable ores and other materials.',
      '(Allows for the creation of smithing items, etc. STILL UNDER DEVELOPMENT)',
    ],
  },
];
