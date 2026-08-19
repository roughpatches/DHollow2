import { GEMS } from './gems.js';

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
//   cuts     — a gem id from content/gems.js, for work that grades its output instead of
//              counting it. A recipe has this or `makes`, never both: one stone goes on
//              the wheel and one stone comes off, and what the work decides is which
//              grade it is. See src/charm.js.
//   xp       — what finishing it is worth to the player's level, at full quality.
//   body     — what the work is, in the world's voice. Yours to write.
// Add a recipe by adding an entry. Nothing reads this list by position.

// What a tier of stone costs the player before the wheel is even turned on. `hard` is the
// tier in `gem` in tuning.js — how many faces the stone is cut to and how near each has
// to sit.
//   also  — anything the rough stone is not, added to the cost.
const CUTTING = {
  1: {
    stage: 1, level: 2, rank: 1, hard: 'basic', xp: 18, also: {},
    body: (g) => [
      `Eight flats worked round a ${g.name.toLowerCase()} until the light stops catching on the corners.`,
      'The shape a stone is given when nobody is sure yet what is inside it. It is also the only shape anybody in Dreadhollow has cut in twenty years.',
    ],
  },
  2: {
    stage: 2, level: 4, rank: 2, hard: 'fine', xp: 32, also: { charcoal: 1 },
    body: (g) => [
      `Six faces on a ${g.name.toLowerCase()}, worked wide and taken down flat, with the top left broad enough to look into.`,
      'Six faces means six corners, and a wheel that runs past one of them has taken it.',
    ],
  },
  3: {
    stage: 2, level: 7, rank: 3, hard: 'master', xp: 60, also: { charcoal: 2 },
    body: (g) => [
      `Twelve faces on a ${g.name.toLowerCase()}, none of them wide, every one of them wanted.`,
      'There is no second stone if this one goes. That is the whole of what makes it the work it is.',
    ],
  },
};

export const RECIPES = [
  // --- the smithy ------------------------------------------------------------
  // Bronze is the one chain in town that runs end to end: the wood and the coal pay for
  // the fire, the fire pays for the bar, and the bar is what the chapel roof is nailed on
  // with. It is tier-one work, because tier one is all the Greywood has in it — copper
  // and tin and coal. Iron is written and unreachable until its ground is; see
  // content/materials.js.
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
    // Two ores in one crucible, which is why the wood pays for both halves of a run: a
    // party that only came home with copper has come home with half a bar.
    id: 'bronzebar',
    name: 'Cast a bronze bar',
    at: 'forge',
    stage: 1,
    level: 1,
    skill: 'smithing',
    rank: 1,
    activity: 'Smelting',
    costs: { copperore: 2, tinore: 1, charcoal: 2 },
    makes: { bronzebar: 1 },
    xp: 16,
    body: [
      'Copper down first and held there, the tin in last so it does not burn off, and the whole of it poured before anybody has time to argue about the proportion.',
      'Nine parts to one. Get it wrong the other way and what comes out is a bar that bends.',
    ],
  },
  {
    // The second stage of the smithy in one line: the same ore, and half again as much of
    // it comes out as metal. This is what rebuilding the furnace bought, and it is the
    // first thing in town that coal is burnt in rather than charcoal.
    id: 'furnace',
    name: 'Run the furnace',
    at: 'forge',
    stage: 2,
    level: 4,
    skill: 'smithing',
    rank: 2,
    activity: 'Smelting',
    costs: { copperore: 4, tinore: 2, coal: 3 },
    makes: { bronzebar: 3 },
    xp: 34,
    body: [
      'A stack tall enough to hold its own heat, charged from the top and tapped at the bottom, and fed for as long as there is anybody to feed it.',
      'Coal takes it further than charcoal ever did. One man can work it. Two men can work it properly.',
    ],
  },

  // --- the Artisan's Studio --------------------------------------------------
  // A rough stone comes off a mining node about one time in eight, so every one of these
  // is a stone the player walked a long way for and gets one go at. Three shapes and three
  // tiers; what the stone is worth is how near it ends up to the shape it was given.
  // The hand wheel does the cabochon. The two faceted shapes want the treadle mill, which
  // is the studio's second repair.

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

  // Tier one at the still: two ingredients apiece, both out of the Greywood, and between
  // them the three things Herblore brings home. The three older potions above are one and
  // three ingredients and stay as they were — these are the pairs, and a pair reads two
  // ways depending on which of the two there is more of.
  {
    // Trumpets and oysters, weighted to the oysters. The cheap one, and the one a party
    // that has not got as far as the still yet can still make.
    id: 'copsebroth',
    name: 'Set a copse broth',
    at: 'stillroom',
    stage: 1,
    level: 1,
    skill: 'alchemy',
    rank: 1,
    activity: 'Brewing',
    hard: 'simple',
    costs: { oystermushroom: 3, blacktrumpet: 1 },
    makes: { copsebroth: 1 },
    xp: 12,
    body: [
      'Caps in first and left to give up what they have, trumpets in at the end so they are not cooked to nothing, and the pot never allowed to boil.',
      'It is the first thing anybody is taught and the last thing anybody bothers to do well.',
    ],
  },
  {
    // The same two the other way up, and hot rather than warm.
    id: 'woodsdraught',
    name: 'Boil a woodsman\'s draught',
    at: 'stillroom',
    stage: 1,
    level: 2,
    skill: 'alchemy',
    rank: 1,
    activity: 'Brewing',
    hard: 'simple',
    costs: { blacktrumpet: 3, oystermushroom: 2 },
    makes: { woodsdraught: 1 },
    xp: 18,
    body: [
      'Trumpets down hard until the water is black, the caps in after them, and the whole of it taken off before it catches.',
      'Four people can drink one of these standing in the rain and go on. That is all it is for.',
    ],
  },
  {
    // Root and oyster: the pale pair, and the only potion in the game that touches how
    // the work itself goes rather than how the party stands up to it.
    id: 'steadyhand',
    name: 'Work a steady hand',
    at: 'stillroom',
    stage: 2,
    level: 5,
    skill: 'alchemy',
    rank: 2,
    activity: 'Brewing',
    hard: 'tricky',
    costs: { oystermushroom: 2, bitterroot: 2 },
    makes: { steadyhand: 1 },
    xp: 34,
    body: [
      'Caps and root ground together dry and let down with as little water as will carry it, until it is a paste and not a drink.',
      'Five measures and none of them forgiving. There is a joke in the trade about what it takes to make one of these.',
    ],
  },
  {
    // Mostly root. Expensive in the scarce half of the pantry, which is the price of a
    // check that was going to be lost being held instead.
    id: 'bitterwash',
    name: 'Draw a bitter wash',
    at: 'stillroom',
    stage: 1,
    level: 3,
    skill: 'alchemy',
    rank: 2,
    activity: 'Brewing',
    hard: 'tricky',
    costs: { bitterroot: 2, oystermushroom: 1 },
    makes: { bitterwash: 1 },
    xp: 22,
    body: [
      'Root cut coarse, drawn cold over a day, and one cap in it for no reason anybody has ever been able to give.',
      'Nothing is added to make it drinkable. Adding something is how it stops working.',
    ],
  },
  {
    // Trumpets and root, the dark pair. Trumpets grow where the light gave up, and this
    // is what that is for.
    id: 'nightwash',
    name: 'Steep a nightshade wash',
    at: 'stillroom',
    stage: 1,
    level: 4,
    skill: 'alchemy',
    rank: 2,
    activity: 'Brewing',
    hard: 'tricky',
    costs: { blacktrumpet: 3, bitterroot: 1 },
    makes: { nightwash: 1 },
    xp: 28,
    body: [
      'Trumpets steeped until the water will not go any darker, and a finger of root in it to hold it there.',
      'It is not drunk so much as worn. Whoever made the first one was not trying to make this.',
    ],
  },
  {
    // The strong one, and the still is what it is waiting for.
    id: 'blackdraught',
    name: 'Draw a black draught',
    at: 'stillroom',
    stage: 2,
    level: 6,
    skill: 'alchemy',
    rank: 3,
    activity: 'Brewing',
    hard: 'wicked',
    costs: { blacktrumpet: 4, bitterroot: 3 },
    makes: { blackdraught: 1 },
    xp: 40,
    body: [
      'Trumpets drawn off the still black as tar with the root ground in at the last, and taken off the heat at a moment nobody can describe.',
      'Two ingredients and seven measures. What is difficult about it is not what is in it.',
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
    stage: 2,
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
  {
    // What the oven is for. Everything else in this kitchen is eaten where it is cooked;
    // this is the first thing off it that is meant to be carried out of the room.
    id: 'shorepie',
    name: 'Bake a shore pie',
    at: 'kitchen',
    stage: 2,
    level: 5,
    skill: 'cooking',
    rank: 2,
    activity: 'Cooking',
    costs: { perch: 2, bluegill: 2, oystermushroom: 2 },
    makes: { shorepie: 2 },
    xp: 34,
    body: [
      'Fish off the bone and shelf caps under a lid of paste, and an oven hot enough that it is out of your hands the moment the door shuts.',
      'A pie is the only cooking in this town nobody stands over. That is the whole difficulty of it.',
    ],
  },

  // --- the wheel, in the corner of the smithy --------------------------------
  // Nine stones and one job: put the rough on the wheel and bring it down onto the shape.
  // What comes off is the same stone at Regular, Fine or Flawless, and that is what the
  // work is for — there is no cutting a garnet badly into something else.
  // The nine are not written out one at a time. A tier is what a stone costs, what it is
  // gated on and how hard the wheel reads it; edit the three rows in CUTTING to retune
  // all nine, and a tenth gem in content/gems.js arrives here with no line written.
  ...GEMS.map((g) => ({
    id: `cut${g.id}`,
    name: `Cut ${'aeiou'.includes(g.name[0].toLowerCase()) ? 'an' : 'a'} ${g.name.toLowerCase()}`,
    at: 'forge',
    skill: 'gemcutting',
    activity: 'Cutting',
    cuts: g.id,
    costs: { [g.rough]: 1, ...CUTTING[g.tier].also },
    stage: CUTTING[g.tier].stage,
    level: CUTTING[g.tier].level,
    rank: CUTTING[g.tier].rank,
    hard: CUTTING[g.tier].hard,
    xp: CUTTING[g.tier].xp,
    body: CUTTING[g.tier].body(g),
  })),
];
