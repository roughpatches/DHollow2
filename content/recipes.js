// What can be made in town, and what it takes to make it. A recipe is offered at one
// workstation, and a workstation is a building with `craft` on the stage it works at —
// so bringing the smithy back up a stage is what puts new work in front of the player.
//   id       — how src/craft.js refers to it. Nothing else names a recipe.
//   name     — shown on the workstation's list and over the work while it is done.
//   at       — the building id from content/buildings.js this is made at.
//   stage    — the level that building has to have reached. The stage must be one that
//              crafts, or the recipe could never be reached and src/craft.js says so at
//              boot.
//   level    — the level the player has to have reached. Experience only ever goes to a
//              level, so this is the one thing every recipe is gated on twice: the
//              building the town rebuilt, and the character the player levelled.
//   skill    — which skill's work this is, from content/skills.js. Every point the player
//              has in it adds skillYieldPerPoint to what comes off the bench.
//   rank     — points in that skill the recipe will not be attempted without. Nobody
//              guesses at a smelt. Leave it out for work anybody can do.
//   activity — the engine that gets played, by the name src/activity.js knows it as. A
//              recipe naming work with no engine yet is made on the spot, the way a node
//              with no engine pays out and moves on.
//   hard     — how hard the work is, where the engine takes a difficulty. Brewing does: it
//              names a tier in `brew` in tuning.js, which is how many shapes go in the pot
//              and how fast and how evenly they swell. Left out, it is the first tier.
//   costs    — what is taken out of the pack, and taken before anything is played.
//   makes    — what goes back into it, before the maker's points and how well it went.
//   xp       — what finishing it is worth to the player's level, at full quality.
//   body     — what the work is, in the world's voice. Yours to write.
// Add a recipe by adding an entry. Nothing reads this list by position.

export const RECIPES = [
  // --- the smithy ------------------------------------------------------------
  // Iron is the one chain in town that runs end to end: the wood pays for the fire, the
  // fire pays for the bar, and the bar is what the chapel roof is nailed on with.
  {
    id: 'charcoal',
    name: 'Burn a clamp',
    at: 'forge',
    stage: 1,
    level: 1,
    skill: 'smithing',
    rank: 1,
    activity: 'Smelting',
    costs: { oakbranch: 4 },
    makes: { charcoal: 3 },
    xp: 8,
    body: [
      'Limb wood stacked round a stake, turfed over, lit from the middle and starved of air for a day and a night.',
      'It is the cheapest thing a forge does and nothing else a forge does happens without it.',
    ],
  },
  {
    id: 'ironbar',
    name: 'Smelt a bar',
    at: 'forge',
    stage: 1,
    level: 1,
    skill: 'smithing',
    rank: 1,
    activity: 'Smelting',
    costs: { ironore: 3, charcoal: 2 },
    makes: { ironbar: 1 },
    xp: 16,
    body: [
      'Ore and charcoal fed in by turns until what is left at the bottom is a bloom, and the bloom beaten out until what is left is iron.',
      'Most of what goes in comes out as slag. That is not a fault in the method.',
    ],
  },
  {
    // The second stage of the smithy in one line: the same ore, and twice as much of it
    // comes out as iron. This is what rebuilding the bloomery bought.
    id: 'bloomery',
    name: 'Run the bloomery',
    at: 'forge',
    stage: 2,
    level: 4,
    skill: 'smithing',
    rank: 2,
    activity: 'Smelting',
    costs: { ironore: 6, charcoal: 3 },
    makes: { ironbar: 3 },
    xp: 34,
    body: [
      'A stack tall enough to hold its own heat, tapped at the bottom and fed for as long as there is anybody to feed it.',
      'One man can work it. Two men can work it properly.',
    ],
  },

  // --- the wheel, in the corner of the smithy --------------------------------
  // A rough stone comes off a mining node about one time in eight, so every one of these
  // is a stone the player walked a long way for and gets one go at. Three shapes and three
  // tiers; what the stone is worth is how near it ends up to the shape it was given.
  {
    id: 'cabochon',
    name: 'Grind a cabochon',
    at: 'forge',
    stage: 1,
    level: 2,
    skill: 'gemcutting',
    rank: 1,
    activity: 'Cutting',
    hard: 'basic',
    costs: { roughgem: 1 },
    makes: { cabochon: 1 },
    xp: 18,
    body: [
      'No facets to speak of — eight flats worked round until the light stops catching on the corners.',
      'The shape a stone is given when nobody is sure yet what is inside it.',
    ],
  },
  {
    id: 'tablegem',
    name: 'Cut a table stone',
    at: 'forge',
    stage: 2,
    level: 4,
    skill: 'gemcutting',
    rank: 2,
    activity: 'Cutting',
    hard: 'fine',
    costs: { roughgem: 1, charcoal: 1 },
    makes: { tablegem: 1 },
    xp: 32,
    body: [
      'Six faces, worked wide and taken down flat, with the top left broad enough to look into.',
      'Six faces means six corners, and a wheel that runs past one of them has taken it.',
    ],
  },
  {
    id: 'brilliant',
    name: 'Cut a brilliant',
    at: 'forge',
    stage: 2,
    level: 7,
    skill: 'gemcutting',
    rank: 3,
    activity: 'Cutting',
    hard: 'master',
    costs: { roughgem: 2, charcoal: 2 },
    makes: { brilliant: 1 },
    xp: 60,
    body: [
      'Twelve faces, none of them wide, every one of them wanted.',
      'Two stones go on the wheel because one of them is expected not to come off it.',
    ],
  },

  // --- the still room --------------------------------------------------------
  // Three potions and three tiers, which is what the pot is for: the same hands at three
  // difficulties, so what a tier costs the player is a thing that can be felt rather than
  // read off a table.
  {
    id: 'tonic',
    name: 'Steep a tonic',
    at: 'stillroom',
    stage: 1,
    level: 1,
    skill: 'alchemy',
    rank: 1,
    activity: 'Brewing',
    hard: 'simple',
    costs: { blacktrumpet: 3 },
    makes: { tonic: 1 },
    xp: 12,
    body: [
      'Trumpets steeped at just under a boil until the water goes the colour of strong tea and twice as bitter.',
      'Three shapes and a slow hand. This is the one an apprentice is given.',
    ],
  },
  {
    id: 'salve',
    name: 'Ash and oyster salve',
    at: 'stillroom',
    stage: 1,
    level: 3,
    skill: 'alchemy',
    rank: 2,
    activity: 'Brewing',
    hard: 'tricky',
    costs: { oystermushroom: 4, charcoal: 2 },
    makes: { salve: 1 },
    xp: 24,
    body: [
      'Caps rendered down and charcoal ground through them while it is all still too hot to touch.',
      'Five measures, and none of them at the pace of the one before.',
    ],
  },
  {
    id: 'cordial',
    name: 'Draw a heartwood cordial',
    at: 'stillroom',
    stage: 2,
    level: 6,
    skill: 'alchemy',
    rank: 3,
    activity: 'Brewing',
    hard: 'wicked',
    costs: { heartwood: 2, blacktrumpet: 3, eggshell: 2 },
    makes: { cordial: 1 },
    xp: 46,
    body: [
      'Heartwood shavings drawn off the still with the shell in the tub to hold the bitterness down, and the trumpets in last so they are not cooked out of it.',
      'Seven measures, quick and uneven, and the still will not forgive one of them. There is a reason nobody has made this since the shop shut.',
    ],
  },

  // --- the Sea Hag's kitchen -------------------------------------------------
  // Everything the Greywood pays out in fish and fungus arrives raw. This is the only
  // place in town it stops being raw.
  {
    id: 'friedperch',
    name: 'Pan-fried perch',
    at: 'kitchen',
    stage: 1,
    level: 1,
    skill: 'cooking',
    rank: 1,
    activity: 'Cooking',
    costs: { perch: 2 },
    makes: { friedfish: 1 },
    xp: 10,
    body: [
      'Scaled, gutted, floured with whatever there is, and put in a pan hot enough to take the skin off it.',
      'A perch is bonier than it looks. Nobody who eats one here says so.',
    ],
  },
  {
    id: 'woodstew',
    name: 'Forager\'s stew',
    at: 'kitchen',
    stage: 1,
    level: 2,
    skill: 'cooking',
    rank: 1,
    activity: 'Cooking',
    costs: { bluegill: 2, oystermushroom: 2 },
    makes: { woodstew: 1 },
    xp: 18,
    body: [
      'Panfish off the bone, shelf caps torn rather than cut, and the pot left long enough that neither is recognisable.',
      'It is what four people carrying nothing much each can eat together.',
    ],
  },
  {
    id: 'smokedtrout',
    name: 'Smoke a run of trout',
    at: 'kitchen',
    stage: 1,
    level: 4,
    skill: 'cooking',
    rank: 2,
    activity: 'Cooking',
    costs: { brooktrout: 4, blacktrumpet: 2 },
    makes: { smokedfish: 3 },
    xp: 30,
    body: [
      'Split, salted, hung over a smother of trumpet and green wood, and left in the smoke until they go stiff.',
      'A fish smoked properly keeps until the weather turns. A fish smoked badly keeps until somebody eats it.',
    ],
  },
];
