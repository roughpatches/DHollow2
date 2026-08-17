// The things a character is good at. A skill is a number of points, not a badge: at
// level one a character takes skillsAtLevelOne of these and spreads
// skillPointsAtLevelOne between them, and the rest of the list is what they are
// untrained at.
//   id         — how src/party.js and any activity refers to the skill.
//   name       — shown in the menu and on a character's sheet.
//   group      — terrain, social, gathering or crafting. It is what a skill is for:
//                terrain buys constitution on ground of its kind, social and terrain
//                skills are rolled at encounter nodes, gathering skills are the work a
//                resource node is made of, and crafting is what is done with what comes
//                home. Only gathering may be named by a resource node's `harvests`, and
//                src/run.js says so at boot if anything else is.
//   activities — which activities the points apply to. Named here rather than in the
//                activity, so a new skill needs no change anywhere else. A skill rolled
//                rather than played — every terrain and social skill — names none.
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
  // --- terrain: what the ground is worth to you -------------------------------
  {
    id: 'woodcraft',
    name: 'Woodcraft',
    group: 'terrain',
    activities: [],
    draws: ['forest', 'wild'],
    terrain: 'forest',
    unlocks: [
      'Read a tree\'s lean before the first cut.',
      'Approach a spooked animal without it bolting.',
    ],
    body: [
      'Knowledge of the forest, its creatures, and its habitats.',
      '(Provides bonus to Constitution in forest areas)',
    ],
  },
  {
    id: 'sailing',
    name: 'Sailing',
    group: 'terrain',
    activities: [],
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
    id: 'mountaineering',
    name: 'Mountaineering',
    group: 'terrain',
    activities: [],
    draws: ['road', 'wild'],
    terrain: 'mountain',
    unlocks: [
      'Pick the line up a face before anybody is standing on it.',
      'Hear loose rock in the moment there is still somewhere to stand.',
    ],
    body: [
      'Knowledge of mountainous and rocky terrain.',
      '(Provides bonus to Constitution in mountain areas)',
    ],
  },
  {
    id: 'fording',
    name: 'Fording',
    group: 'terrain',
    activities: [],
    draws: ['fen', 'water'],
    terrain: 'wetland',
    unlocks: [
      'Tell standing water with a bottom from standing water without one.',
      'Find the crossing a marsh has rather than the one it looks like it has.',
    ],
    body: [
      'Knowledge of wetlands and marshy terrain.',
      '(Provides bonus to Constitution in wetland areas)',
    ],
  },

  // --- social: what you can do about other people ------------------------------
  {
    id: 'intimidation',
    name: 'Intimidation',
    group: 'social',
    activities: [],
    draws: ['dark', 'wild'],
    unlocks: [
      'End a conversation nobody wanted to be having.',
      'Make something back off that had already decided not to.',
    ],
    body: [
      'The ability to threaten or scare other living things.',
      '(STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    id: 'persuasion',
    name: 'Persuasion',
    group: 'social',
    activities: [],
    draws: ['folk', 'road'],
    unlocks: [
      'Get a price named before you have to name one.',
      'Ask a second question where one was the limit.',
    ],
    body: [
      'The ability to negotiate or convince other living things.',
      '(STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    id: 'investigation',
    name: 'Investigation',
    group: 'social',
    activities: [],
    draws: ['ruin', 'dark'],
    unlocks: [
      'Notice the thing that has been moved before you notice it is missing.',
      'Say what happened somewhere from what is still lying in it.',
    ],
    body: [
      'The ability to perceive an environment or setting and understand what has happened or is happening there.',
      '(STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    id: 'insight',
    name: 'Insight',
    group: 'social',
    activities: [],
    draws: ['folk', 'ruin'],
    unlocks: [
      'Tell a man who is lying from a man who is only frightened.',
      'Know which of two people standing together is the one to talk to.',
    ],
    body: [
      'The ability to read the emotions of living things and to understand social dynamics.',
      '(STILL UNDER DEVELOPMENT)',
    ],
  },

  // --- gathering: the work a resource node is made of --------------------------
  // These four and no others may be named by a resource node's `harvests`, and each of
  // them is a StarScape engine where there is one imported. Herblore has none yet: a
  // Foraging node says its name, pays out and moves on until that engine lands.
  {
    id: 'woodcutting',
    name: 'Woodcutting',
    group: 'gathering',
    activities: ['Felling', 'Shaping'],
    draws: ['forest', 'timber'],
    unlocks: [
      'Drop a tree where you said it would go, with a crowd watching.',
      'Keep a saw out of the bind on the last third of a cut.',
    ],
    body: [
      'The ability to identify, fell, and shape wood.',
      '(Provides ability to engage with woodcutting nodes, and provides bonus drops from Woodcutting nodes based on level)',
    ],
  },
  {
    id: 'fishing',
    name: 'Fishing',
    group: 'gathering',
    activities: ['Casting', 'Hooking', 'Netting'],
    draws: ['water', 'fen'],
    unlocks: [
      'Spot a feeding lane from the bank.',
      'Set the hook on a feint without losing the fish.',
    ],
    body: [
      'The ability to read water and catch fish.',
      '(Provides ability to engage with fishing nodes, and provides bonus drops from fishing nodes based on level)',
    ],
  },
  {
    id: 'mining',
    name: 'Mining',
    group: 'gathering',
    activities: ['Mining'],
    draws: ['ruin', 'mountain'],
    unlocks: [
      'Sound a face and say what is behind it before it is opened.',
      'Break a seam out square instead of into rubble.',
    ],
    body: [
      'The ability to identify and mine for ores and gems.',
      '(Provides ability to engage with mining nodes, and provides bonus drops from mining nodes based on level)',
    ],
  },
  {
    id: 'herblore',
    name: 'Herblore',
    group: 'gathering',
    activities: ['Foraging'],
    draws: ['fen', 'wild'],
    unlocks: [
      'Name what a plant does before it is boiled, not after.',
      'Cut a stand so it is still a stand next season.',
    ],
    body: [
      'The ability to identify and gather usable herbs and ingredients.',
      '(Provides ability to engage with herblore nodes, and provides bonus drops from herblore nodes based on level)',
    ],
  },

  // --- crafting: what is done with what comes home -----------------------------
  {
    id: 'alchemy',
    name: 'Alchemy',
    group: 'crafting',
    activities: ['Brewing', 'Distilling', 'Tincturing'],
    draws: ['fen', 'ruin'],
    unlocks: [
      'Get a second draught out of the same weight of leaf.',
      'Hold a mixture at heat without losing what was worth having in it.',
    ],
    body: [
      'The ability to identify natural ingredients and combine them into potions and medicines.',
      '(Allows for the creation of potions, etc. STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    id: 'smithing',
    name: 'Smithing',
    group: 'crafting',
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
  {
    id: 'cooking',
    name: 'Cooking',
    group: 'crafting',
    activities: ['Cooking'],
    draws: ['folk', 'wild'],
    unlocks: [
      'Get a meal out of what four people were each carrying separately.',
      'Pull a pot off the fire on the last turn it was worth pulling.',
    ],
    body: [
      'The ability to cook food and other recipes from collected ingredients.',
      '(Allows for the creation of cooked items, etc. STILL UNDER DEVELOPMENT)',
    ],
  },
  {
    id: 'gemcutting',
    name: 'Gem Cutting',
    group: 'crafting',
    activities: ['Cutting', 'Polishing'],
    draws: ['mountain', 'ruin'],
    unlocks: [
      'Find the plane a stone wants to break on rather than the one you wanted.',
      'Take a flawed stone down to the sound part of it and no further.',
    ],
    body: [
      'The ability to cut and shape gemstones.',
      '(Allows for the creation of finished gemstones, etc. STILL UNDER DEVELOPMENT)',
    ],
  },
];

// The four headings above, in the order they are written, for anything that shows the
// list grouped rather than flat. Read off the list so a new group needs nothing here.
export const SKILL_GROUPS = [...new Set(SKILLS.map((t) => t.group))];

export const GROUP_NAMES = {
  terrain: 'Terrain',
  social: 'Social',
  gathering: 'Gathering',
  crafting: 'Crafting',
};
