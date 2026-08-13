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
export const GROUND = [
  {
    tile: 'grass',
    sheet: 'art/ground/grass-and-granite.png',
    cells: [[112, 328], [112, 448], [0, 328], [96, 0]],
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
  },
];

export const STRUCTURES = [
  {
    // One stage: the Sea Hag is the one building in town that never needed repairing.
    // The export carries eight angles; the town is drawn from the front, so it is south.
    id: 'tavern',
    path: 'art/seahag',
    at: [3.22, 1.13],
    stages: ['base/rotations/south.png'],
  },
];

// The painted panels the quest screens are drawn in: one sheet with the frames laid out
// on it, cut by rectangle and stretched to whatever a screen needs. A frame is stretched
// as a nine-slice, so its corners — where all the ironwork and most of the leaves are —
// are drawn at their own size and only a plain run of rail in the middle is pulled.
//   at    — [x, y, w, h] of this frame on the sheet.
//   slice — [left, right, top, bottom]: how much of each edge is never stretched. What
//           is left in the middle is what stretches, so it is cut on a run of rail with
//           no rivet and no leaf on it — a couple of pixels is enough, and anything
//           wider drags an ornament out of shape.
//   flat  — [left, right, top, bottom] from the edge of the frame in to the board inside
//           it, where the rails stop and the panel is one colour.
//   pad   — the same four, but in as far as text can start: the corners carry ironwork
//           and leaves that reach further in than the rails do, and a line written at
//           `flat` runs over them.
//   shade — how far the board is darkened before anything is written on it, 0 to 1. The
//           page is painted warm wood and the game's text is written for something dark;
//           the ironwork and the leaves keep their own colour. Leave it out for a panel
//           that wants its own colour.
//   paper — [x, y, w, h] of a clean patch of the panel's own surface. The plaque was
//           generated with a page of placeholder printing on it — lorem, a compass, a
//           map — and at boot the inside is washed over in the commonest colour of this
//           patch, which paints the printing out. Recolour the sheet and the wash follows
//           it. Leave it out and the panel is used as painted.
//   wash  — how far inside `flat` the washing stops, so the shadow the paper casts
//           against its own rails survives it.
//   ink   — true if this panel is a page rather than a board: what is written on it is
//           written in the ink colours from tuning.js instead of the light ones.
export const UI = {
  sheet: 'art/Autumn-leafy-vines-twined-around-wrought-iron-framing.png',
  frames: {
    // The whole screen: the board, the hour, the crew. Cut to the ironwork rather than to
    // the leaves, because a leaf hanging off the side is a leaf drawn down the whole side
    // once the panel is stretched to a screen.
    page: {
      at: [107, 97, 480, 172], slice: [158, 320, 113, 57],
      flat: [24, 31, 39, 35], pad: [42, 46, 50, 62], shade: 0.8,
    },
    // a band across the crawl, over and under the road
    band: {
      at: [196, 11, 295, 81], slice: [183, 110, 43, 36],
      flat: [21, 21, 21, 21], pad: [62, 62, 24, 22], shade: 0.3,
    },
    // the card that opens at each node: paper, and written on in ink
    plaque: {
      at: [196, 269, 295, 110], slice: [173, 120, 54, 54],
      flat: [18, 27, 19, 18], pad: [38, 38, 28, 26],
      paper: [372, 328, 33, 31], wash: 2, ink: true,
    },
  },
};
