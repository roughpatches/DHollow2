// Maps are character grids. Editing the world means typing over characters.
// Every row of a map must be the same length and every character must be in LEGEND.

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
    doors: [{ x: 8, y: 11, to: 'village', spawn: [58, 26] }],
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
    doors: [{ x: 17, y: 15, to: 'village', spawn: [94, 1] }],
  },

  // Dreadhollow itself, and the whole of the walkable town. The terrain is the designer's
  // map export, read back at its own scale: 26 by 14 painted tiles of 64 pixels is 104 by
  // 56 of the world's own, so one painted tile is four by four here.
  // The water is east and southeast. The Sea Hag stands at the foot of the shore road
  // where the bank runs out onto the foreshore, Aldis Rooke's is the next door up it, and
  // the chapel shuts off the north end of the paving. Nothing else is built here yet.
  village: {
    name: 'Dreadhollow',
    spawn: [58, 26],
    rows: [
      '............................................::::::::::::::::::::::::............::::::::SSSSSSSSSSSS~~~~',
      '............................................::::::::::::::::::::::::............::::::::SSSSSSSSSSSS~~~~',
      '............................................::::::::::::::::::::::::............::::::::SSSSSSSSSSSS~~~~',
      '............................................::::::::::::::::::::::::............::::::::SSSSSSSSSSSS~~~~',
      '............,,,,,,,,,,,,....................................................::::::::::::SSSSSSSSSSSSSSSS',
      '............,,,,,,,,,,,,....................................................::::::::::::SSSSSSSSSSSSSSSS',
      '............,,,,,,,,,,,,....................................................::::::::::::SSSSSSSSSSSSSSSS',
      '............,,,,,,,,,,,,....................................................::::::::::::SSSSSSSSSSSSSSSS',
      '............,,,,,,,,,,,,................,,,,,,,,,,,,....,,,,................::::SSSSSSSSSSSSSSSSSSSS~~~~',
      '............,,,,,,,,,,,,................,,,,,,,,,,,,....,,,,................::::SSSSSSSSSSSSSSSSSSSS~~~~',
      '............,,,,,,,,,,,,................,,,,,,,,,,,,....,,,,................::::SSSSSSSSSSSSSSSSSSSS~~~~',
      '............,,,,,,,,,,,,................,,,,,,,,,,,,....,,,,................::::SSSSSSSSSSSSSSSSSSSS~~~~',
      '............,,,,,,,,,,,,................,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSS~~~~~~~~SSSS~~~~~~~~',
      '............,,,,,,,,,,,,....======......,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSS~~~~~~~~SSSS~~~~~~~~',
      '............,,,,,,,,,,,,....======......,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSS~~~~~~~~SSSS~~~~~~~~',
      '............,,,,,,,,,,,,....======......,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSS~~~~~~~~SSSS~~~~~~~~',
      '................,,,,....,,,,======,,,,,,,,,,........,,,,,,,,........::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,######,,,,,,,,,,........,,,,,,,,........::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,######,,,,,,,,,,........,,,,,,,,........::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,##D###,,,,,,,,,,........,,,,,,,,........::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,....,,,,,,,,,,,,........::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,....,,,,,,,,,,,,........::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,....,,,,,,,,======......::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,....,,,,,,,,======......::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....######..::::::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,....##D###..::::::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.....:::....::::::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.....:::....::::::::SSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........::::::::::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........:=======::::SSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........:=======SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........:#######SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........:###D###SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,....,,,,,,,,,,,,,,,,,,,,,,,,........:+++++++SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,............,,,,,,,,,,,,,,,,........:+++++++~~~~~~~~SSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,............,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~SSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,............,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~SSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '................,,,,............,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~SSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,........::::SSSS~~~~~~~~~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,............::::::::SSSSSSSS~~~~~~~~~~~~~~~~SSSS::::SSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,............::::::::SSSSSSSS~~~~~~~~~~~~~~~~SSSS::::SSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,............::::::::SSSSSSSS~~~~~~~~~~~~~~~~SSSS::::SSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,,,,,,,,,,,,,............::::::::SSSSSSSS~~~~~~~~~~~~~~~~SSSS::::SSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,........................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,........................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,........................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '............,,,,,,,,,,,,,,,,........................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~SSSSSSSSSSSS~~~~~~~~',
      '....................................................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '....................................................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '....................................................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
      '....................................................::::SSSSSSSSSSSSSSSS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~',
    ],
    doors: [
      { x: 60, y: 34, to: 'tavern', spawn: [9, 13] },
      { x: 58, y: 25, to: 'hut', spawn: [8, 10] },
      { x: 30, y: 19, to: 'chapel', spawn: [10, 13] },
      { x: 94, y: 0, to: 'shore', spawn: [17, 14] },
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
    doors: [{ x: 9, y: 14, to: 'village', spawn: [60, 35] }],
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
    doors: [{ x: 10, y: 14, to: 'village', spawn: [30, 20] }],
  },
};
