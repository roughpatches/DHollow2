// Maps are character grids. Editing the world means typing over characters.
// Every row of a map must be the same length and every character must be in LEGEND.
//
// A map with `street` instead of `rows` is not a grid at all: it is Dreadhollow seen from
// the side, one painted town with a line across it to walk along. Everything standing on a
// street — a door, a building, somebody waiting — is placed by how far along it stands and
// nothing else. See src/street.js.

// solid: blocks movement. above: a second tile drawn over actors standing here.
export const TILES = {
  grass: {},
  path: {},
  dirt: {},
  wood: {},
  stone: {},
  rug: {},
  door: {},
  water: { solid: true },
  tree: { solid: true, above: 'treetop' },
  wall: { solid: true },
  roof: { solid: true },
  well: { solid: true },
  grave: { solid: true },
  bar: { solid: true },
  forge: { solid: true },
  shelf: { solid: true },
  altar: { solid: true },
  pew: { solid: true },
  crate: { solid: true },
  hearth: { solid: true },
  bed: {}, // you can lie on it
  sand: {},
  flotsam: {}, // small wreckage; you walk over it
  spar: { solid: true }, // ship timber; you walk around it
  // the harbour
  deck: {}, // dock planking, sound enough to walk out on
  rot: {}, // planking that is mostly still there. You would not run on it
  piling: { solid: true }, // a post where a dock used to be
  wreck: { solid: true }, // a hull, half under
  post: { solid: true }, // a harbour lamp or a mooring bollard
  // the town, and what is taking it back
  rubble: { solid: true }, // a wall that came down
  scrub: {}, // dying grass, bracken, dead leaves
  bramble: { solid: true }, // thicket you go round
  stump: { solid: true },
  fence: { solid: true },
};

export const LEGEND = {
  '.': 'grass',
  ',': 'path',
  ':': 'dirt',
  '~': 'water',
  T: 'tree',
  '#': 'wall',
  '=': 'roof',
  D: 'door',
  _: 'wood',
  '+': 'stone',
  o: 'well',
  x: 'grave',
  b: 'bar',
  f: 'forge',
  s: 'shelf',
  a: 'altar',
  p: 'pew',
  c: 'crate',
  h: 'hearth',
  r: 'rug',
  B: 'bed',
  S: 'sand',
  w: 'flotsam',
  W: 'spar',
  '-': 'deck',
  ';': 'rot',
  i: 'piling',
  V: 'wreck',
  l: 'post',
  R: 'rubble',
  '"': 'scrub',
  '%': 'bramble',
  n: 'stump',
  '|': 'fence',
};

export const MAPS = {
  // Where the player wakes up the morning after. Aldis carried them here.
  hut: {
    name: 'Aldis Rooke\'s house',
    spawn: [8, 10],
    rows: [
      '##################',
      '#hh______________#',
      '#hh______________#',
      '#________________#',
      '#BBB_____cc______#',
      '#________cc______#',
      '#________________#',
      '#___ss___________#',
      '#______rrrr______#',
      '#______rrrr______#',
      '#________________#',
      '########D#########',
    ],
    doors: [{ x: 8, y: 11, to: 'village', spawn: [7] }],
  },

  // Where the game opens: the point, north up the coast from the town. The tide put the
  // player here and the storm put everything else; the track south runs down the beach
  // into the northeast corner of Dreadhollow.
  shore: {
    name: 'The point',
    spawn: [16, 8],
    rows: [
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      'SS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~SS',
      'SSSSS~~~~~~~~~~~~~~~~~~~~~~~~SSSSS',
      'SSSSSSSSwSSS~~~~~~~~~~~SSSSSSSSSSS',
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      'SSSwSSSSSSSSSSSSSSSSSSWSSSwSSSSSSS',
      'SSSSSSSSSSWSSSSSSSSSSSSSSSSSSSSSSS',
      'SSSSwSSSSSSSSSSSwSSSSSSSSSSSWSSSSS',
      'SSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS',
      '..SSSSSS..SSSS....SSSS..SSSSSS....',
      '.................,................',
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTT',
      'TTTTTTTTTTTTTTTTT,TTTTTTTTTTTTTTTT',
    ],
    doors: [{ x: 17, y: 15, to: 'wharf', spawn: [29] }],
  },

  // Dreadhollow itself: one street, seen from the side. The painting is the town behind —
  // the terraces, the hills and the ruined quay are in it, not standing on it — and the
  // cobbles in front are what is walked. Everything below is in tiles along that street.
  // The gap in the terrace was a painted church; it was taken out so the chapel that is
  // repaired could stand there instead of in front of one that never changes. The painting
  // wraps, so it was also rolled three tiles sideways to put its cut in the trees at the
  // east end rather than through the house at the west.
  //   art     — the painted town, drawn at 1:1 and laid end to end `repeats` times, every
  //             other copy flipped so the row of houses does not visibly restart.
  //   size    — how much of that painting the town is, in pixels: its width, and its height
  //             down to where its own ground runs out. The street is that many tiles wide
  //             times the repeat count; nothing else says how long the town is.
  //   ground  — how far down the painting the walking line sits. Measured off the image: it
  //             is what stands somebody on the cobbles rather than up against the doors.
  //   sill    — and how far down a building stands, which is not the same line: the town is
  //             built along the back of the pavement and walked along the cobbles in front
  //             of it. A building dropped in stands on this, so it sits in the row rather
  //             than out in the road. Left out, it is the walking line.
  //   edges   — what lies off each end: { right: 'wharf', left: 'village' }. A street is a
  //             panel, not a stretch of something longer — walk into the end of one and the
  //             next is what is on the screen, standing you at its far end. Painted towns
  //             are painted a panel at a time and are not the same size as each other, so
  //             this is how one is put beside another rather than joined to it.
  // A door on a street has an x and nothing else, and is opened with [E] rather than
  // walked onto: on a street you would cross every doorway in town going to the tavern.
  // A door into a building (see content/buildings.js) is not listed here — the building
  // is its own door, and its repair state is what decides whether it opens.
  village: {
    name: 'Dreadhollow',
    street: {
      art: 'art/town/backdrop.png',
      size: [688, 338], // the painting is 384 tall; below 338 it is empty
      ground: 328, // the cobbles, a little in front of the kerb
      sill: 272, // and the back of the pavement, where the terrace stands
      repeats: 1, // one composed scene; laid twice it would be the same town twice
      edges: { right: 'wharf' },
    },
    spawn: [21],
    doors: [
      { x: 7, to: 'hut', label: 'Aldis Rooke\'s house' },
    ],
  },

  // The next panel east: timber-framed shops, a jetty, and a boat nobody has taken out in
  // a while. Painted smaller than the west end and at the same scale, so it is its own
  // panel rather than more of the same street.
  wharf: {
    name: 'The wharf',
    street: {
      art: 'art/town/wharf.png',
      size: [512, 288],
      ground: 278,
      sill: 238,
      repeats: 1,
      edges: { left: 'village' },
    },
    spawn: [2],
    doors: [
      { x: 30, to: 'shore', spawn: [17, 14], label: 'The track north' },
    ],
  },

  tavern: {
    name: 'The Sea Hag',
    spawn: [9, 13],
    rows: [
      '######################',
      '#hh__________________#',
      '#hh__________________#',
      '#____________________#',
      '#__bbbbbbbb__________#',
      '#__bbbbbbbb__________#',
      '#____________________#',
      '#___cc_____cc____cc__#',
      '#____________________#',
      '#___cc_____cc____cc__#',
      '#____________________#',
      '#_____rrrrrrrr_______#',
      '#_____rrrrrrrr_______#',
      '#____________________#',
      '#########D############',
    ],
    doors: [{ x: 9, y: 14, to: 'village', spawn: [34] }],
  },

  // Inside the chapel. The door is shut until the roof is back on, so this is what the
  // last stage of the repair opens: swept flags, the pews that survived, and the altar.
  chapel: {
    name: 'The chapel',
    spawn: [10, 13],
    rows: [
      '######################',
      '#++++++++++++++++++++#',
      '#+++++++++aa+++++++++#',
      '#++++++++++++++++++++#',
      '#++++pppp++pppp++++++#',
      '#++++pppp++pppp++++++#',
      '#++++++++++++++++++++#',
      '#++++pppp++pppp++++++#',
      '#++++pppp++pppp++++++#',
      '#++++++++++++++++++++#',
      '#++++pppp++pppp++++++#',
      '#++++pppp++pppp++++++#',
      '#++++++++++++++++++++#',
      '#++++++++++++++++++++#',
      '##########D###########',
    ],
    doors: [{ x: 10, y: 14, to: 'village', spawn: [20] }],
  },
};
