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
