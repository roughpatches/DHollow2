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
    id: 'nails',
    name: 'Draw nails',
    at: 'forge',
    stage: 1,
    level: 2,
    skill: 'smithing',
    rank: 1,
    activity: 'Forging',
    costs: { ironbar: 1, charcoal: 1 },
    makes: { nails: 10 },
    xp: 14,
    body: [
      'A bar drawn down to rod, the rod cut to lengths, and every length headed over the hardy hole while it is still orange.',
      'Nobody has made a nail in Dreadhollow in twenty years, and every roof in it is waiting on one.',
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
