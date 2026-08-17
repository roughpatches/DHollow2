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
  {
    id: 'ironore',
    name: 'Iron Ore',
    start: 0,
    body: [
      'Rusty-brown lumps with the grain of the seam still on them, heavy out of all proportion to their size.',
      'Nobody in Dreadhollow has lit a smelter in living memory. The ore does not care.',
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
    id: 'ironbar',
    name: 'Iron Bar',
    start: 0,
    body: [
      'A hand\'s length of worked iron, square in section, with the hammer still legible along it.',
      'This is the first iron anybody has drawn in Dreadhollow since the smithy went cold.',
    ],
  },
  {
    id: 'tonic',
    name: 'Steeped Tonic',
    start: 0,
    body: [
      'A stoppered bottle of something dark that smells of the forest floor and tastes worse than it smells.',
      'It does what it does whether or not anybody enjoys it.',
    ],
  },
  {
    id: 'salve',
    name: 'Field Salve',
    start: 0,
    body: [
      'Grey-black, stiff at the top of the pot and softer underneath, and it goes on cold.',
      'Made to be carried by somebody who is going to need it a long way from the person who made it.',
    ],
  },
  {
    id: 'cordial',
    name: 'Heartwood Cordial',
    start: 0,
    body: [
      'Clear, amber, and heavier in the hand than a bottle that size ought to be.',
      'The first thing to come off that still in twenty years, and the shop it came out of is not open.',
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
];
