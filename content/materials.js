// Everything the player carries: what buildings are repaired with, and what the nodes
// of a run pay out. Buildings name these ids in their costs; encounters name them in
// their spoils.
//   id    — how content/buildings.js, content/encounters.js and src/town.js refer to it.
//   name  — shown wherever a cost or a stock is listed, and under its square in the pack.
//   start — how much the player is carrying at the start of the game.
//   body  — what it is, in the world's voice. Yours to write.
// The square a thing takes on the Inventory tab is drawn for its id in src/icons.js.
// One with no icon there gets a blank square rather than nothing.
// Add a material by adding an entry. Nothing reads this list by position.

export const MATERIALS = [
  { id: 'timber', name: 'Timber', start: 6, body: ['[Placeholder Text]'] },
  { id: 'stone', name: 'Cut stone', start: 4, body: ['[Placeholder Text]'] },
  { id: 'nails', name: 'Nails', start: 12, body: ['[Placeholder Text]'] },
  { id: 'pitch', name: 'Pitch', start: 0, body: ['[Placeholder Text]'] },
  { id: 'canvas', name: 'Canvas', start: 0, body: ['[Placeholder Text]'] },

  // --- what comes off a face -------------------------------------------------
  // Mining pays these; Smithing and Gem Cutting are what they are waiting for.
  // Ore runs in three tiers, and a tier is a place rather than a number: everything in a
  // tier comes out of the same ground, so finding the ground is what unlocks the metal.
  //   Tier one is the Greywood — copper, tin and coal, which is bronze and the fire to
  //     melt it, and it is all the smithy can reach today.
  //   Tier two is iron, mithril and adamantium, and tier three is dwarven, elvish and
  //     holy. Neither has its zone yet. They are written and carried and craftable at
  //     nothing, the way a node zoned to a place that is not open is content waiting on
  //     the place. Give them a zone in content/places.js and a node in content/nodes.js
  //     that draws them, and they are in the game the same hour.
  // Nothing in code reads a tier: what makes an ore second-tier is that only second-tier
  // ground pays it out. Add the recipes when the ground lands.

  // tier one — the Greywood
  {
    id: 'copperore',
    name: 'Copper Ore',
    start: 0,
    body: [
      'Green-crusted lumps the colour of a church roof, breaking salmon-pink where the hammer has been at them.',
      'Soft, common, and worth nothing much on its own. It is what it is put with that matters.',
    ],
  },
  {
    id: 'tinore',
    name: 'Tin Ore',
    start: 0,
    body: [
      'Small black pebbles out of the stream gravel, dull as slag and twice the weight they look.',
      'The other half of bronze, and the half nobody notices is short until the bar comes out soft.',
    ],
  },
  {
    id: 'coal',
    name: 'Coal',
    start: 0,
    body: [
      'Dull black, light in the hand, and it marks everything it is carried next to.',
      'It burns hotter than a clamp of charcoal and nobody has to sit up two nights making it.',
    ],
  },

  // tier two — somewhere not yet open
  {
    id: 'ironore',
    name: 'Iron Ore',
    start: 0,
    body: [
      'Rusty-brown lumps with the grain of the seam still on them, heavy out of all proportion to their size.',
      'There is none of it in the Greywood. Whatever ground it comes out of, nobody here has walked it.',
    ],
  },
  {
    id: 'mithrilore',
    name: 'Mithril Ore',
    start: 0,
    body: [
      'Pale rock with a bright thread running through it that has not tarnished in whatever time it has been lying there.',
      'A full sack of it carries like a half one. Men have killed each other over a half one.',
    ],
  },
  {
    id: 'adamantiumore',
    name: 'Adamantium Ore',
    start: 0,
    body: [
      'Blue-black, and the pick comes off it ringing with nothing to show for the swing.',
      'It holds its edge in ground where every other rock has gone to gravel. No fire in Dreadhollow will touch it.',
    ],
  },

  // tier three — somewhere not yet open
  {
    id: 'dwarvenore',
    name: 'Dwarven Ore',
    start: 0,
    body: [
      'Squared blocks of ore, cut rather than broken, out of ground that was being worked before anybody here had a word for working ground.',
      'Whoever raised it stacked it and left it stacked. They did not come back.',
    ],
  },
  {
    id: 'elvishore',
    name: 'Elvish Ore',
    start: 0,
    body: [
      'Ore, or root, or whatever it was before the rock closed over it — green in the grain and warm to hold.',
      'It was grown and not laid down, and it has not stopped behaving like something grown.',
    ],
  },
  {
    id: 'holyore',
    name: 'Holy Ore',
    start: 0,
    body: [
      'White stone shot through with a metal that stays bright in the wet and takes the cold off the hand holding it.',
      'There is one thing in the world it gets made into. This town had one, once, and it hung in the chapel.',
    ],
  },
  {
    id: 'roughgem',
    name: 'Rough Stone',
    start: 0,
    body: [
      'A clouded lump with one face that catches the light and five that do not.',
      'It is worth nothing at all until somebody who knows where it wants to break has broken it.',
    ],
  },
  // Everything above is what a building is repaired with, and comes off the road's own
  // encounters. Everything below is what a node of the first job hands over by name.

  // --- what comes off a bench ------------------------------------------------
  // Nothing on the road pays these out: they are made in town, at a workstation, out of
  // what a run brought home. See content/recipes.js.
  // A material carrying `drink` is a potion, and drinking one is the only thing in the
  // game that spends a material anywhere but a building or a bench. It is drunk in town,
  // where it takes the next job out, or at a camp on the road, where it takes the rest of
  // the one being walked — see src/potions.js for what the three numbers do. Tune them
  // here: a potion is content, the way a node's constitution is.
  {
    id: 'charcoal',
    name: 'Charcoal',
    start: 0,
    body: [
      'Light, black, and ringing when two pieces knock together — wood with everything but the burning taken out of it.',
      'It is half the weight of what went into the clamp and four times the heat.',
    ],
  },
  {
    id: 'bronzebar',
    name: 'Bronze Bar',
    start: 0,
    body: [
      'A hand\'s length of cast bronze, gold where the light is on it and dull brown where it is not, with the mould line still down one side.',
      'This is the first metal anybody has drawn in Dreadhollow since the smithy went cold.',
    ],
  },
  {
    // Waiting on tier-two ore, the way the ore is waiting on its ground.
    id: 'ironbar',
    name: 'Iron Bar',
    start: 0,
    body: [
      'A hand\'s length of worked iron, square in section, with the hammer still legible along it.',
      'Harder than bronze, cheaper than bronze wherever there is iron to be had, and there is none to be had here.',
    ],
  },
  {
    id: 'cabochon',
    name: 'Cabochon',
    start: 0,
    body: [
      'A domed stone worked to eight soft flats, polished until it holds the light rather than throwing it.',
      'Worth having. Not worth what the same stone would have been in better hands.',
    ],
  },
  {
    id: 'tablegem',
    name: 'Table-Cut Stone',
    start: 0,
    body: [
      'Six faces and a broad flat top, cut to be looked into rather than looked at.',
      'The first thing off that wheel in a generation that anybody would call a gem.',
    ],
  },
  {
    id: 'brilliant',
    name: 'Brilliant',
    start: 0,
    body: [
      'Twelve faces, and every one of them doing something to the light on its way back out.',
      'Somebody who can cut one of these does not stay in a town like this. That is the usual order of it.',
    ],
  },
  {
    id: 'tonic',
    name: 'Steeped Tonic',
    start: 0,
    drink: { con: 6 },
    body: [
      'A stoppered bottle of something dark that smells of the forest floor and tastes worse than it smells.',
      'It does what it does whether or not anybody enjoys it.',
    ],
  },
  {
    id: 'salve',
    name: 'Field Salve',
    start: 0,
    // Two, where the copse broth below it holds off one: the broth is what a party boils
    // in the wood, and this is what a bench and a pot of pitch are for.
    drink: { guard: 2 },
    body: [
      'Grey-black, stiff at the top of the pot and softer underneath, and it goes on cold.',
      'Made to be carried by somebody who is going to need it a long way from the person who made it.',
    ],
  },
  {
    id: 'cordial',
    name: 'Heartwood Cordial',
    start: 0,
    drink: { steady: 2 },
    body: [
      'Clear, amber, and heavier in the hand than a bottle that size ought to be.',
      'The first thing to come off that still in twenty years, and the shop it came out of is not open.',
    ],
  },

  // --- the six the wood pays for ---------------------------------------------
  // Tier one at the still: two ingredients apiece, both of them out of the Greywood, and
  // between them the three things Herblore brings home. Three pairs and six potions,
  // because a pair reads two ways depending on which of them there is more of.
  {
    id: 'woodsdraught',
    name: 'Woodsman\'s Draught',
    start: 0,
    drink: { con: 10 },
    body: [
      'Trumpets and oyster caps boiled down together and drunk hot out of whatever is nearest.',
      'It is not medicine and nobody has ever called it that. It is an hour of daylight nobody had.',
    ],
  },
  {
    id: 'copsebroth',
    name: 'Copse Broth',
    start: 0,
    drink: { guard: 1 },
    body: [
      'Thin, grey, and more caps than water, kept simmering while whoever made it decided what else was going in.',
      'It puts nothing back. It stops so much of it going, which is cheaper and is the whole point of it.',
    ],
  },
  {
    id: 'blackdraught',
    name: 'Black Draught',
    start: 0,
    drink: { rally: 0.5 },
    body: [
      'Trumpets steeped black with the root ground through them, thick enough to coat the glass.',
      'Somebody who has stopped will get up on this. What it costs them is not paid on the day they drink it.',
    ],
  },
  {
    id: 'nightwash',
    name: 'Nightshade Wash',
    start: 0,
    drink: { daylight: true },
    body: [
      'Rubbed round the eyes and the back of the neck, cold, and stinging for a good while after.',
      'The dark stops being something that is happening to you. It is still dark.',
    ],
  },
  {
    id: 'steadyhand',
    name: 'Steady Hand',
    start: 0,
    drink: { sure: true },
    body: [
      'Pale caps and white root worked to a paste and taken off the back of a knife.',
      'It does not make anybody better at anything. It makes the worst thing that can happen stop happening.',
    ],
  },
  {
    id: 'bitterwash',
    name: 'Bitter Wash',
    start: 0,
    drink: { steady: 1 },
    body: [
      'Almost all root, barely cut, and it is drunk in one because it cannot be drunk in two.',
      'Everything gets a little further away and a little clearer, and the hand goes where it is sent.',
    ],
  },

  {
    id: 'friedfish',
    name: 'Fried Fish',
    start: 0,
    body: [
      'Crisped on the skin side, folded onto a board, and eaten standing up before it stops being hot.',
    ],
  },
  {
    id: 'woodstew',
    name: 'Forager\'s Stew',
    start: 0,
    body: [
      'Fish and fungus cooked down together until neither is arguing with the other.',
      'Thin, dark, and the best-smelling thing to come out of that kitchen in years.',
    ],
  },
  {
    id: 'smokedfish',
    name: 'Smoked Trout',
    start: 0,
    body: [
      'Stiff, mahogany-dark, and dry enough to carry in a pocket for a week.',
      'Food that keeps is the difference between a day out and a night out.',
    ],
  },

  // --- the stream -----------------------------------------------------------
  {
    id: 'brooktrout',
    name: 'Brook Trout',
    start: 0,
    body: [
      'Cold-water fish, red-spotted along the flank, none of them longer than a hand.',
      'The stream is full of them, which tells you how long it has been since anybody walked out there to fish it.',
    ],
  },
  {
    id: 'perch',
    name: 'Yellow Perch',
    start: 0,
    body: [
      'Barred down the side, spiny along the back, and bonier than it looks on the plate.',
      'Keeps three days salted and two without.',
    ],
  },
  {
    id: 'bluegill',
    name: 'Bluegill',
    start: 0,
    body: [
      'A palm-sized panfish with a black tab at the gill. Caught in numbers or not at all.',
    ],
  },

  // --- the oak --------------------------------------------------------------
  {
    id: 'oakbranch',
    name: 'Oak Branch',
    start: 0,
    body: [
      'Limb wood off the storm-torn shoulder, cut down to arm lengths.',
      'Burns hot and quick. Too knotted to build with, which nobody minds in a village this cold.',
    ],
  },
  {
    id: 'oaklog',
    name: 'Oak Log',
    start: 0,
    body: [
      'Trunk wood, squared enough at the ends to be carried and no further.',
      'This is what a roof beam is before anyone has decided that is what it is.',
    ],
  },
  {
    id: 'heartwood',
    name: 'Oak Heartwood',
    start: 0,
    body: [
      'The dark dry core out of the middle of the break, sound the whole way through.',
      'Harder than the rest of the tree and worth more than the rest of the tree.',
    ],
  },

  // --- the mushroom copse ---------------------------------------------------
  {
    id: 'blacktrumpet',
    name: 'Black Trumpets',
    start: 0,
    body: [
      'Funnels of near-black, easier to smell than to see, growing where the light already gave up.',
      'They dry down to nothing and come back with water.',
    ],
  },
  {
    id: 'oystermushroom',
    name: 'Oyster Mushrooms',
    start: 0,
    body: [
      'Pale shelf caps cut where they meet the bark of a fallen trunk.',
      'The ones that bruised blue under the knife were buried deep enough that nothing else finds them.',
    ],
  },
  {
    // The third thing Herblore brings home, and the only one that is not a fungus: it is
    // dug rather than picked, so it comes off damp ground and ground nothing has walked
    // on rather than off rot and fallen trunks. Scarcer than either mushroom in every
    // table it is in, which is what points in the skill are for.
    id: 'bitterroot',
    name: 'Bitterroot',
    start: 0,
    body: [
      'A pale forked root out of wet ground, snapping white and wet, and the smell of it comes up the moment it is broken.',
      'It is in every second thing an apothecary ever wrote down, and nobody has ever claimed to like it.',
    ],
  },

  // --- the heron's nest -----------------------------------------------------
  {
    id: 'heronfeather',
    name: 'Heron Feathers',
    start: 0,
    body: [
      'Long grey flight feathers, trimmed at the quill by somebody who wanted them whole.',
      'Somebody is shooting the Greywood for these, and they are not eating what they shoot.',
    ],
  },
  {
    id: 'eggshell',
    name: 'Egg Shell',
    start: 0,
    body: [
      'Pale green, thick as a thumbnail, and broken open from the outside.',
      'Whatever emptied that nest had no use for the shells and left them where they fell.',
    ],
  },
  {
    id: 'greyarrow',
    name: 'Grey Arrows',
    start: 0,
    body: [
      'Grey-fletched, iron-headed, set low on the body where they would not spoil the plumage.',
      'The fletching is heron. Whoever makes these is paying for them twice out of the same bird.',
    ],
  },

  // --- off what is fought after dark -----------------------------------------
  {
    id: 'bone',
    name: 'Bone',
    start: 0,
    body: [
      'Taken off something that was standing up an hour ago and is not standing now.',
      'Not all of it is the shape bone is supposed to be.',
    ],
  },
];
