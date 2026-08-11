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

  dialogueCharsPerSec: 45,
  dialogueBoxHeight: 128,
  dialogueBoxMargin: 16,
  dialogueFontSize: 20,
  dialogueNameSize: 18,
};

// [base, detail] per tile. Retint the whole world from this table.
export const COLORS = {
  bg: 0x0b0d10,
  dialogueFill: 0x14161b,
  dialogueEdge: 0x6b5a3a,
  dialogueText: 0xd9d3c4,
  dialogueName: 0xc9a95f,

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
};

// Actor placeholder palettes. Add an entry, reference its name from content/npcs.js.
export const PALETTES = {
  player: { body: 0x39566b, head: 0xc7a184, hair: 0x2a2119, trim: 0x8ba4b5 },
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
