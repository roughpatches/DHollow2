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
  // The seven grounds of the designer's map export, each a seamless 64-pixel tile painted
  // for the terrain it is. One patch apiece and no need for more: seamless art laid over a
  // field does not repeat the way four hand-cut windows of a larger sheet do. The seam
  // tiles in EDGES below are painted from these same terrains, so a field and the edge
  // that leaves it are the same paint.
  {
    tile: 'grass', // patchy dying autumn grass: most of the town stands on it
    sheet: 'art/ground/autumn-grass.png',
    cells: [[0, 0]],
    shade: 0x8e9c8c, // cool, and darker than the sheet: this town is not having a good year
  },
  {
    tile: 'scrub', // the same grass, kept warm and dry: ground nobody walks any more
    sheet: 'art/ground/autumn-grass.png',
    cells: [[0, 0]],
    shade: 0xb2a37e,
  },
  {
    tile: 'dirt', // packed damp earth, and the bank down to the water
    sheet: 'art/ground/earth.png',
    cells: [[0, 0]],
    shade: 0xb0a89c,
  },
  {
    tile: 'path', // worn granite setts, wet after rain
    sheet: 'art/ground/street.png',
    cells: [[0, 0]],
  },
  {
    tile: 'stone', // the same granite, for a quay or a forecourt
    sheet: 'art/ground/street.png',
    cells: [[0, 0]],
  },
  {
    tile: 'sand', // tan-grey muddy seashore, at the tide line
    sheet: 'art/ground/shore.png',
    cells: [[0, 0]],
    shade: 0xbdb4a6,
  },
  {
    // Grey-green seawater, painted the value of a bright afternoon and shaded down to
    // harbour water: undarkened it reads as pale stone against a granite quay.
    tile: 'water',
    sheet: 'art/ground/sea.png',
    cells: [[0, 0]],
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
    // Off the map export: a 4x4 wang set, sixteen cells, one per corner case, so these
    // coordinates are the tileset's own rather than windows found by looking. The bit set
    // in a code means the seashore side, which is how the set was painted.
    low: { tiles: ['water'], shade: 0x5c7796 },
    high: { tiles: ['sand'], shade: 0xbdb4a6 },
    sheet: 'art/ground/wang-water-and-sand.png',
    split: { channels: 'rg', over: 3 },
    cells: {
      0: [128, 64], 1: [64, 64], 2: [128, 0], 3: [192, 0], 4: [128, 128], 5: [64, 0],
      6: [0, 64], 7: [64, 192], 8: [192, 64], 9: [128, 192], 10: [192, 128], 11: [0, 0],
      12: [64, 128], 13: [0, 128], 14: [192, 192], 15: [0, 192],
    },
  },
  {
    // The same set for grass against earth, and the bit set is the earth side here.
    low: { tiles: ['grass'], shade: 0x8e9c8c },
    high: { tiles: ['dirt'], shade: 0xb0a89c },
    sheet: 'art/ground/wang-grass-and-dirt.png',
    split: { channels: 'gb', over: 14 },
    cells: {
      0: [128, 64], 1: [64, 64], 2: [128, 0], 3: [192, 0], 4: [128, 128], 5: [64, 0],
      6: [0, 64], 7: [64, 192], 8: [192, 64], 9: [128, 192], 10: [192, 128], 11: [0, 0],
      12: [64, 128], 13: [0, 128], 14: [192, 192], 15: [0, 192],
    },
  },
  {
    low: { tiles: ['scrub'], shade: 0xb2a37e },
    high: { tiles: ['dirt'], shade: 0xb0a89c },
    sheet: 'art/ground/wang-grass-and-dirt.png',
    split: { channels: 'gb', over: 14 },
    cells: {
      0: [128, 64], 1: [64, 64], 2: [128, 0], 3: [192, 0], 4: [128, 128], 5: [64, 0],
      6: [0, 64], 7: [64, 192], 8: [192, 64], 9: [128, 192], 10: [192, 128], 11: [0, 0],
      12: [64, 128], 13: [0, 128], 14: [192, 192], 15: [0, 192],
    },
  },
  {
    // The rest are windows found in the larger sheets, which carry no wang layout. The
    // export has a grass-against-street set too, but three of its sixteen cells are the
    // only ones with any granite painted in them, so the street keeps these.
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
    at: [56.06, 28.13],
    under: 'dirt',
    stages: ['base/rotations/south.png'],
  },
  {
    // Three stages and the art carries all of them: burnt out, wrapped in scaffolding,
    // then roofed and lit. 128 pixels of picture over the chapel's seven rows of tiles.
    id: 'chapel',
    path: 'art/chapel',
    at: [26.94, 12.5],
    under: 'grass',
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
  // Nothing is dressed on the town map yet: the export is terrain, and where the crates,
  // the casks and the harbour lamps go is the designer's to say. art/props/ holds nineteen
  // pictures ready for it — one line each, and the tile under it is what stops you.
];
