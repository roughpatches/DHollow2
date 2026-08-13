// Anything in the world with real art instead of a generated placeholder: people below,
// buildings at the foot of the file. Everyone not named here is still drawn out of
// PALETTES in tuning.js, and nothing has to change for them.
//   id       — the name the rest of the game calls this look by. Put it in the
//              `palette` field of content/npcs.js and content/party.js.
//   path     — the folder under art/ the export was unzipped into, as exported.
//   size     — the side of one frame in pixels. Every frame in a set is square.
//   foot     — how far down the frame the ground is. Measured once off the art: it is
//              what stands the character on the tile rather than floating over it.
//   walk     — folder of the walk cycle, and how many frames each direction has.
//   idle     — the same for standing still. Frame 0 is what they wear when nothing is
//              happening to them.
//   down     — one image, for when they are laid out on the floor. Leave it out for
//              anyone the game never puts on the floor; nothing else asks for it.
//   portrait — the face shown while they speak.
// The four direction folders are named the way the export names them; src/art.js maps
// them onto up, down, left and right. Add a character by dropping the export under
// art/ and adding a block.

export const LOOKS = [
  {
    id: 'aldis',
    path: 'art/aldis',
    size: 60,
    foot: 47,
    walk: { folder: 'Walking/animations/Walking', frames: 6 },
    idle: { folder: 'Idle/animations/Breathing_Idle', frames: 4 },
    down: 'Collapsed_in_a_heap/rotations/south.png',
    portrait: 'Idle/portrait.png',
  },
  {
    id: 'gregorious',
    path: 'art/gregorious',
    size: 60,
    foot: 46,
    walk: { folder: 'Walking/animations/Walk', frames: 6 },
    idle: { folder: 'Idle/animations/Breathing_Idle', frames: 4 },
    portrait: 'Idle/portrait.png',
  },
];

// Buildings with a picture per repair stage. The map's tiles stay where they are —
// they are what you walk into, and repairing still moves them — but where a building
// is named here the picture is what you see standing on them.
//   id     — the building in content/buildings.js. Its stages and this list line up in
//            order: first picture for the first stage, and so on down.
//   path   — the folder under art/ the export was unzipped into.
//   at     — where the top-left corner of the picture sits, in tiles. Fractions are
//            fine: it is placed by eye against the walls it is standing on.
//   under  — the tile drawn under the picture, in place of whatever the map had there.
//            Defaults to grass. The tiles keep their collision either way: the walls
//            still stop you, they just stop drawing themselves.
//   stages — one image per stage of repair, lowest first. A stage past the end of the
//            list keeps the last picture.
// Ground drawn from a painted sheet instead of the tile generator in src/textures.js.
// The sheets are painted at tilePx (see tuning.js) to a tile — four times the size of a
// tile in the world — and the ground is drawn at that resolution and scaled down, so
// the grass keeps its blades instead of turning to soup.
//   tile  — the tile name from the LEGEND in content/maps.js.
//   sheet — the painted sheet under art/.
//   cells — [x, y] of each patch to cut, in sheet pixels. Four of them, laid out two by
//           two across the map, so a field of grass does not repeat every tile. Cut
//           from parts of the sheet that are all one material.
//   shade — optional colour multiplied over the patches, for a sheet painted lighter than
//           the world wants it. Darkens and tints without flattening the paint.
export const GROUND = [
  {
    tile: 'grass', // kept ground: verges, yards, the strip along a street
    sheet: 'art/ground/grass-and-granite.png',
    cells: [[112, 328], [112, 448], [0, 328], [96, 0]],
    shade: 0x8e9c8c, // cool, and darker than the sheet: this town is not having a good year
  },
  {
    tile: 'path', // the town street: small grey granite, worn
    sheet: 'art/ground/grass-and-granite.png',
    cells: [[512, 0], [960, 0], [704, 64], [768, 64]],
  },
  {
    tile: 'dirt', // packed damp earth, off the street
    sheet: 'art/ground/grass-and-dirt.png',
    cells: [[296, 168], [552, 40], [936, 32], [1320, 424]],
    shade: 0xb0a89c,
  },
  {
    tile: 'stone', // the square's flagstones: the same granite as the street, laid larger
    sheet: 'art/ground/grass-and-granite.png',
    cells: [[704, 192], [768, 256], [1152, 128], [1216, 192]],
  },
  {
    // Grass gone over: tufts, dead leaves, and bare earth between them. This is the tile
    // the town turns into on the way out to the treeline.
    tile: 'scrub',
    sheet: 'art/ground/grass-and-dirt.png',
    cells: [[1344, 192], [1280, 128], [96, 384], [96, 0]],
    shade: 0xb2a37e, // kept warm and a shade darker: dead growth, not a ripe field
  },
  {
    tile: 'sand', // tan-grey mud at the tide line
    sheet: 'art/ground/water-and-sand.png',
    cells: [[1440, 400], [1048, 296], [920, 424], [920, 40]],
    shade: 0xbdb4a6,
  },
  {
    // Grey-green seawater, three patches — the sheet has no fourth clean of foam. It is
    // painted the value of a bright afternoon, so it is shaded down to harbour water:
    // undarkened it reads as pale stone against the granite quay.
    tile: 'water',
    sheet: 'art/ground/water-and-sand.png',
    cells: [[96, 0], [1280, 128], [96, 336]],
    shade: 0x5c7796,
  },
];

// Where two grounds meet, the tile drawn over the seam. These sheets are painted with
// both their materials meeting along an organic edge, so every way two grounds can meet
// at the four corners of a tile is somewhere in the sheet already — below are the windows
// they were found at. The seam tile is laid half a tile up and left of the square it
// belongs to, so it straddles the four squares whose corners it is drawn from.
//   low / high — the two sides. `tiles` are the ground names on that side: several where
//                they are the same paint, since the street and the square are one granite.
//                `shade` is that side's shade, exactly as in GROUND above.
//   split      — how the sheet's own pixels are told apart. `channels` is which two to
//                subtract, and a pixel over `over` belongs to the high side. Hue, not
//                brightness: shading in the paint must not read as the other material.
//   cells      — [x, y] per corner code. The code's bits are northwest, northeast,
//                southwest and southeast, and a set bit means the high side is there.
//                6 and 9 are the two diagonals; no sheet paints them, and a seam that
//                wants one is left hard. So is any seam where more than two grounds meet.
// Add a pair by adding a block. A pair with no block is a hard edge, which is right where
// somebody built the edge — a quay wall, a dock, a kerb — and wrong where nothing did.
export const EDGES = [
  {
    low: { tiles: ['path', 'stone'] }, // worn granite, unshaded
    high: { tiles: ['grass'], shade: 0x8e9c8c },
    sheet: 'art/ground/grass-and-granite.png',
    split: { channels: 'rg', over: 0 },
    cells: {
      0: [732, 64], 1: [1372, 228], 2: [1238, 210], 3: [1284, 224], 4: [1366, 88],
      5: [480, 0], 7: [1040, 42], 8: [1244, 100], 10: [992, 0], 11: [1436, 22],
      12: [1284, 96], 13: [490, 44], 14: [1434, 430], 15: [96, 0],
    },
  },
  {
    // the same sheet and the same windows: scrub is the same paint as grass, one shade
    // warmer, so only the tint on the high side changes
    low: { tiles: ['path', 'stone'] },
    high: { tiles: ['scrub'], shade: 0xb2a37e },
    sheet: 'art/ground/grass-and-granite.png',
    split: { channels: 'rg', over: 0 },
    cells: {
      0: [732, 64], 1: [1372, 228], 2: [1238, 210], 3: [1284, 224], 4: [1366, 88],
      5: [480, 0], 7: [1040, 42], 8: [1244, 100], 10: [992, 0], 11: [1436, 22],
      12: [1284, 96], 13: [490, 44], 14: [1434, 430], 15: [96, 0],
    },
  },
  {
    low: { tiles: ['dirt'], shade: 0xb0a89c },
    high: { tiles: ['grass'], shade: 0x8e9c8c },
    sheet: 'art/ground/grass-and-dirt.png',
    split: { channels: 'gb', over: 20 },
    cells: {
      0: [512, 0], 1: [1378, 216], 2: [1242, 210], 3: [1284, 216], 4: [1376, 104],
      5: [506, 112], 7: [4, 402], 8: [588, 58], 10: [1254, 142], 11: [72, 394],
      12: [1284, 102], 13: [136, 336], 14: [64, 436], 15: [1298, 144],
    },
  },
  {
    low: { tiles: ['dirt'], shade: 0xb0a89c },
    high: { tiles: ['scrub'], shade: 0xb2a37e },
    sheet: 'art/ground/grass-and-dirt.png',
    split: { channels: 'gb', over: 20 },
    cells: {
      0: [512, 0], 1: [1378, 216], 2: [1242, 210], 3: [1284, 216], 4: [1376, 104],
      5: [506, 112], 7: [4, 402], 8: [588, 58], 10: [1254, 142], 11: [72, 394],
      12: [1284, 102], 13: [136, 336], 14: [64, 436], 15: [1298, 144],
    },
  },
  {
    low: { tiles: ['water'], shade: 0x5c7796 },
    high: { tiles: ['sand'], shade: 0xbdb4a6 },
    sheet: 'art/ground/water-and-sand.png',
    split: { channels: 'rg', over: 3 },
    cells: {
      0: [1320, 128], 1: [68, 322], 2: [126, 324], 3: [172, 332], 4: [58, 4],
      5: [64, 54], 7: [1262, 86], 8: [6, 4], 10: [0, 282], 11: [254, 68],
      12: [848, 4], 13: [1244, 220], 14: [258, 124], 15: [512, 0],
    },
  },
  {
    low: { tiles: ['path', 'stone'] },
    high: { tiles: ['dirt'], shade: 0xb0a89c },
    sheet: 'art/ground/dirt-and-granite.png',
    split: { channels: 'rg', over: 0 },
    cells: {
      0: [1152, 60], 1: [1376, 228], 2: [1238, 214], 3: [1432, 2], 4: [512, 86],
      5: [1024, 196], 7: [124, 12], 8: [1240, 102], 10: [64, 282], 11: [430, 376],
      12: [210, 330], 13: [134, 334], 14: [68, 324], 15: [1302, 132],
    },
  },
  {
    low: { tiles: ['dirt'], shade: 0xb0a89c },
    high: { tiles: ['sand'], shade: 0xbdb4a6 },
    sheet: 'art/ground/sand-and-dirt.png',
    split: { channels: 'rb', over: 30 },
    cells: {
      0: [512, 0], 1: [1386, 208], 2: [1258, 230], 3: [1308, 222], 4: [1380, 102],
      5: [1014, 208], 7: [118, 10], 8: [1262, 88], 10: [68, 424], 11: [56, 378],
      12: [1340, 98], 13: [120, 340], 14: [54, 352], 15: [1332, 156],
    },
  },
];

export const STRUCTURES = [
  {
    // One stage: the Sea Hag is the one building in town that never needed repairing.
    // The export carries eight angles; the town is drawn from the front, so it is south.
    id: 'tavern',
    path: 'art/seahag',
    at: [28.06, 36.13],
    under: 'stone',
    stages: ['base/rotations/south.png'],
  },
  {
    // Three stages and the art carries all of them: burnt out, wrapped in scaffolding,
    // then roofed and lit. 128 pixels of picture over the chapel's seven rows of tiles.
    id: 'chapel',
    path: 'art/chapel',
    at: [61.94, 8.5],
    under: 'stone',
    stages: [
      'base/rotations/unknown.png',
      'wrapped_in_timber_sc/rotations/unknown.png',
      'roof_rebuilt_and_sla/rotations/unknown.png',
    ],
  },
];

// Things standing about the town: cargo nobody came back for, casks nobody emptied, and
// the harbour lamps. A prop is only a picture — the tile it stands on is what stops you,
// so a crate goes on a crate tile and a lamp on a post tile (see content/maps.js).
//   art — the file under art/props/, without the extension.
//   map — the map it stands on.
//   at  — the tile it stands on. The picture is centred on that tile and stands on the
//         bottom of it, so it sorts against actors like anything else in the world.
// Add a prop by adding a line. Placing several of the same picture is fine and cheap.
export const PROPS = [
  // the quay, and the one dock still worth walking out on
  { art: 'crates_1', map: 'village', at: [21, 44] },
  { art: 'crates_2', map: 'village', at: [24, 43] },
  { art: 'crates_3', map: 'village', at: [27, 45] },
  { art: 'crates_4', map: 'village', at: [34, 45] },
  { art: 'crates_5', map: 'village', at: [36, 47] },
  { art: 'crates_6', map: 'village', at: [36, 53] },
  { art: 'barrel_1', map: 'village', at: [22, 45] },
  { art: 'barrel_2', map: 'village', at: [26, 43] },
  { art: 'barrel_3', map: 'village', at: [33, 44] },
  { art: 'barrel_4', map: 'village', at: [36, 50] },
  { art: 'barrel_5', map: 'village', at: [20, 44] },
  { art: 'lamp_lit', map: 'village', at: [23, 43] },
  { art: 'lamp_lit', map: 'village', at: [31, 50] },
  { art: 'lamp_lit', map: 'village', at: [32, 56] },
  { art: 'lamp_lit', map: 'village', at: [37, 44] },
  // the terrace, and the harbour road up out of the water
  { art: 'barrel_6', map: 'village', at: [29, 43] },
  { art: 'crates_7', map: 'village', at: [25, 44] },
  { art: 'lamp_lit', map: 'village', at: [41, 42] },
  { art: 'lamp_lit', map: 'village', at: [48, 38] },
  { art: 'barrel_7', map: 'village', at: [39, 34] },
  { art: 'crates_8', map: 'village', at: [44, 33] },
  // the square, and what is left of the market on it
  { art: 'lamp_lit', map: 'village', at: [59, 17] },
  { art: 'lamp_lit', map: 'village', at: [72, 17] },
  { art: 'lamp_lit', map: 'village', at: [59, 27] },
  { art: 'lamp_lit', map: 'village', at: [73, 27] },
  { art: 'crates_9', map: 'village', at: [70, 18] },
  { art: 'crates_10', map: 'village', at: [71, 25] },
  { art: 'crates_1', map: 'village', at: [67, 22] },
  { art: 'barrel_1', map: 'village', at: [62, 18] },
  { art: 'barrel_2', map: 'village', at: [69, 26] },
  { art: 'barrel_3', map: 'village', at: [61, 24] },
  { art: 'crates_2', map: 'village', at: [76, 21] },
  // the lanes: fishermen's row, the netmakers' lane, and the road out
  { art: 'barrel_4', map: 'village', at: [44, 49] },
  { art: 'crates_3', map: 'village', at: [43, 55] },
  { art: 'barrel_5', map: 'village', at: [52, 47] },
  { art: 'barrel_6', map: 'village', at: [35, 26] },
  { art: 'crates_4', map: 'village', at: [30, 22] },
  { art: 'barrel_7', map: 'village', at: [67, 33] },
  { art: 'crates_5', map: 'village', at: [79, 22] },
];
