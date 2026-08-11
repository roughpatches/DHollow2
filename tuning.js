// Every number and colour the game runs on. Nothing else holds a magic value.
// Edit freely; no code change is required to retune or retint anything here.

export const TUNING = {
  tileSize: 16,
  zoom: 3,
  viewWidth: 960,
  viewHeight: 640,

  walkSpeed: 78,
  walkFrameRate: 7,

  interactReach: 12,
  interactRange: 20,

  // A run is a line of nodes with a fork every so often. Node counts are [least, most]
  // and are rolled when the quest is accepted.
  questNodes: { short: [4, 8], medium: [8, 12], long: [12, 16] },
  questForkEvery: 3, // a fork before every nth node; 0 turns forks off
  questBiasWeight: 10, // taking a branch multiplies that encounter's weight by this
  questBonusFactor: 2, // finishing pays this many times over what the run itself paid
  questBonusXp: { short: 150, medium: 350, long: 700 }, // and this on top, flat
  questNightHurt: 1.25, // a node at night costs this much more HP
  questNightXp: 1.3, // and pays this much more for it

  questPipSize: 14,
  questPipGap: 8,
  questPad: 26,
  questTitleSize: 22,
  questBodySize: 16,
  questHintSize: 13,
  questRowHeight: 26,

  // Recruiting. A bond is counted in points; a band is bondPerBand of them, and the
  // bands are named below. Someone comes along if their band is at or above what the
  // job asks of them.
  bondPerBand: 3,
  bondNames: ['Stranger', 'Acquainted', 'Trusted', 'Sworn'],
  bondPerRun: 1, // points added to everyone who walked a run to the end
  recruitBase: 1, // the band an ordinary job asks for
  recruitDraw: 1, // each trait drawn to the work asks one band less
  recruitFear: 2, // each fear or scruple the work touches asks two bands more

  // Traits are points, not badges. A character spends traitPointsAtLevelOne of them
  // across content/traits.js; what they never put a point in they are untrained at.
  traitPointsAtLevelOne: 6,
  traitBonusPerPoint: 2, // what one point is worth to an activity
  traitYieldPerPoint: 0.15, // and to what a gathering node pays: every point in the
  // party's score for that work adds this much on top of the roll

  // Skill checks. A die, plus the trait, against a DC written on the encounter or the
  // job. The best in the party rolls it. A natural top always holds and a natural 1
  // never does, so no DC is a wall and none is a formality.
  checkDie: 20,
  checkPassXp: 1.25, // a check held pays this much more
  checkFailKeep: 0.5, // a check lost keeps this much of what was there to take
  checkFailHurt: 2, // and costs this much on top of the node's own wounds

  maxLevel: 10,
  hpPerLevel: 3, // added to a character's own HP for every level past the first
  xpBase: 40, // leaving level n costs xpBase * n, so levels get longer at a steady rate

  dialogueCharsPerSec: 45,
  dialogueBoxHeight: 128,
  dialogueBoxMargin: 16,
  dialogueFontSize: 20,
  dialogueNameSize: 18,

  dialoguePortraitSize: 128, // the portrait panel's side in screen pixels; art scales to fit it
  dialoguePortraitGap: 8, // space between portrait panel and dialogue box
  dialoguePortraitRise: 10, // how far the portrait travels as it pops up
  dialoguePortraitPopMs: 130,

  menuMargin: 26,
  menuPad: 20,
  menuTabStripHeight: 42,
  menuListWidth: 300,
  menuRowHeight: 26,
  menuRowsVisible: 13,
  menuTabSize: 16,
  menuTabGap: 22, // space between tab names; shrink it when a new tab crowds the strip
  menuTitleSize: 22,
  menuRowSize: 15,
  menuBodySize: 15,
  menuHintSize: 13,

  menuMapCell: 12, // a map tile's size on the Map tab; shrinks to fit a big map
  menuMapHeight: 208,
};

// [base, detail] per tile. Retint the whole world from this table.
export const COLORS = {
  bg: 0x0b0d10,
  dialogueFill: 0x14161b,
  dialogueEdge: 0x6b5a3a,
  dialogueText: 0xd9d3c4,
  dialogueName: 0xc9a95f,
  portraitFill: 0x14161b,
  portraitEdge: 0x6b5a3a,
  portraitBack: 0x1d1a16, // the wash behind a bust, so a dark palette still reads as a head

  menuFill: 0x101216,
  menuPanel: 0x171a20,
  menuEdge: 0x6b5a3a,
  menuRule: 0x2e3138,
  menuText: 0xd9d3c4,
  menuDim: 0x8b8578,
  menuAccent: 0xc9a95f,
  menuSelectFill: 0x2a2418,
  menuMapYou: 0xe8e2d2,
  menuMapDoor: 0xc9a95f,
  menuMapFolk: 0x9c5a46,
  menuMapMark: 0x7f9fa8,
  questNightFill: 0x0c0e14, // a run at night is drawn colder than one by day
  questNightEdge: 0x3f4a63,

  grass: [0x2f3d2b, 0x263422],
  path: [0x4f4a43, 0x413d37],
  dirt: [0x453a2e, 0x392f25],
  water: [0x1f3346, 0x2b4460],
  tree: [0x1b2a1c, 0x33261a],
  wall: [0x4a4642, 0x383533],
  roof: [0x352e2c, 0x27211f],
  door: [0x53381f, 0xb99154],
  wood: [0x453728, 0x392d21],
  stone: [0x434039, 0x36332e],
  well: [0x4f4b44, 0x101317],
  grave: [0x6a655d, 0x47433d],
  bar: [0x4e3c29, 0x6d5537],
  forge: [0x2b2825, 0xb04a1c],
  shelf: [0x40331f, 0x74603e],
  altar: [0x565046, 0x9c8c62],
  pew: [0x4a3826, 0x6a5136],
  crate: [0x574328, 0x3b2c1a],
  hearth: [0x33302c, 0xc4601f],
  rug: [0x5a2b2b, 0x8a4a3a],
  bed: [0x4a3b3a, 0x7a6a58],
  sand: [0x494235, 0x3c362b],
  flotsam: [0x494235, 0x362a1e], // small wreckage the tide left, walkable
  spar: [0x3d3124, 0x241c14], // a beam off a ship, big enough to walk around
};

// Actor placeholder palettes. Add an entry, reference its name from content/npcs.js.
export const PALETTES = {
  player: { body: 0x39566b, head: 0xc7a184, hair: 0x2a2119, trim: 0x8ba4b5 },
  hunter: { body: 0x3f4a33, head: 0xbb9670, hair: 0x35291b, trim: 0x7d8a63 },
  warden: { body: 0x3c4048, head: 0xb99175, hair: 0x1f1c19, trim: 0x8d8f96 },
  elder: { body: 0x4a4640, head: 0xc9b19a, hair: 0xb9b4ad, trim: 0x6e6a63 },
  sexton: { body: 0x2c3128, head: 0xa88a6d, hair: 0x2b2a24, trim: 0x5c6153 },
  barkeep: { body: 0x6a3f3a, head: 0xcaa387, hair: 0x54331f, trim: 0xb0785a },
  drunk: { body: 0x54492f, head: 0xbe9270, hair: 0x6d5a33, trim: 0x8a7a4e },
  smith: { body: 0x4b2f22, head: 0xb98a63, hair: 0x241c16, trim: 0xa9552a },
  herbalist: { body: 0x35513f, head: 0xd0b096, hair: 0x4b3a22, trim: 0x7fa384 },
  priest: { body: 0x23262c, head: 0xc5a68d, hair: 0xa8a49b, trim: 0xc0a45e },
  child: { body: 0x5b4a6b, head: 0xd2b193, hair: 0x3a2a1d, trim: 0x9782ab },
};

// Phaser text wants '#rrggbb'; every colour above is a number. Lives here so the
// two places that draw text don't each keep their own copy.
export function hex(n) {
  return `#${n.toString(16).padStart(6, '0')}`;
}
