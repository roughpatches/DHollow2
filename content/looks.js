// Anything in the world with real art instead of a generated placeholder: people below,
// buildings at the foot of the file. Everyone not named here is still drawn out of
// PALETTES in tuning.js, and nothing has to change for them.
//   id       — the name the rest of the game calls this look by. Put it in the
//              `palette` field of content/npcs.js and content/party.js.
//   path     — the folder under art/ the export was unzipped into, as exported.
//   size     — the side of one frame in pixels. Every frame in a set is square.
//   foot     — how far down the frame the ground is. Measured once off the art: it is
//              what stands the character on the tile rather than floating over it.
//   head     — and how far down it the top of their head is. Given, they are drawn the
//              height they are asked for exactly; left out, the air over the head is
//              taken to be the quarter of the frame the crawl's art usually carries.
//   walk     — folder of the walk cycle, and how many frames each direction has. Leave
//              it out for somebody who stands where they are put and never walks.
//   idle     — the same for standing still. Frame 0 is what they wear when nothing is
//              happening to them. `yoyo` runs it out and back rather than round: a loop
//              that ends somewhere else than it started pops when it repeats.
//   sides    — art painted from one side only. Its east is loaded and flipped for west,
//              and its south does for anything facing away; nothing else is asked for.
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
  {
    // The same man behind his own bar, at the size the room is painted at: he unfolds his
    // arms, takes up a glass and polishes it, and folds them again. Painted from the side,
    // so his west is his east flipped. He keeps the face above for talking — this export
    // has none, and a landlord does not need two.
    id: 'gregorious-bar',
    path: 'art/gregorious-bar',
    size: 168,
    foot: 143, // the boards; the animation frames carry 22 pixels of air all round
    head: 26, // and the top of his head, so he is drawn the height he is asked for
    sides: true,
    idle: {
      folder: 'Idle/animations/The_barkeep_stands_with_a_steady_posture_his_arms',
      frames: 9,
      yoyo: true, // he ends holding the glass and starts with folded arms; run it back
    },
  },
];

// Buildings with a picture per repair stage. The map's tiles stay where they are —
// they are what you walk into, and repairing still moves them — but where a building
// is named here the picture is what you see standing on them.
//   id     — the building in content/buildings.js. Its stages and this list line up in
//            order: first picture for the first stage, and so on down.
//   path   — the folder under art/ the export was unzipped into.
//   at     — where the picture sits, in tiles. On a grid, its top-left corner; on a
//            street, one number — how far along it stands, with its feet on the walking
//            line. Fractions are fine: it is placed by eye against what it stands on.
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

// Where two grounds meet, the tile drawn over the seam, laid half a tile up and left of
// the square it belongs to so it straddles the four squares whose corners it is drawn from.
// Most of these are 4x4 wang sets — sixteen cells, one per way two grounds can meet at the
// four corners of a tile — and their coordinates and corner meanings come from the map
// export's own tileset descriptors. The rest are windows found by searching a larger sheet
// that carries no wang layout.
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
    // Off the map export, and the cells and corner meanings are the tileset descriptor's
    // own: a bit set in a code is the seashore side, because that is the set's upper
    // terrain. Sixteen cells, one per way two grounds meet at a tile's four corners.
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
    // The same, for grass against earth. The bit set is the earth side: it is this set's
    // upper terrain, which is not something to be guessed at — the names in the descriptor
    // do not follow the codes.
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
    // The street keeps windows out of the larger sheet. The export's own grass-against-
    // street set is the one the designer's map uses, and its table is exact, but only three
    // of its sixteen cells have any granite painted into them — so it cannot be drawn from
    // until it is generated again.
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
    // Seashore against earth, off the export: a wang set, exact. Both sides take the one
    // shade because they are the same value of brown — telling them apart by hue, the way
    // the other seams are shaded, is not something these two allow, and at the same shade
    // it makes no difference which side a pixel is called.
    low: { tiles: ['sand'], shade: 0xb6aea1 },
    high: { tiles: ['dirt'], shade: 0xb6aea1 },
    sheet: 'art/ground/wang-sand-and-dirt.png',
    split: { channels: 'rb', over: 28 },
    cells: {
      0: [128, 64], 1: [64, 64], 2: [128, 0], 3: [192, 0], 4: [128, 128], 5: [64, 0],
      6: [0, 64], 7: [64, 192], 8: [192, 64], 9: [128, 192], 10: [192, 128], 11: [0, 0],
      12: [64, 128], 13: [0, 128], 14: [192, 192], 15: [0, 192],
    },
  },
];

export const STRUCTURES = [
  // The Sea Hag has no entry: it is painted into the west panel, under the clock, and a
  // building that is already in the picture does not want a second one standing on it.
  // The export it used to be drawn from is still in art/seahag if it is wanted elsewhere.
  {
    // Three stages and the art carries all of them: burnt out, wrapped in scaffolding,
    // then roofed and lit. 128 pixels of picture over the chapel's seven rows of tiles.
    id: 'chapel',
    path: 'art/chapel',
    at: [19.75],
    under: 'stone', // it stands on the paving, so what its picture clears is paving
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
//   hang  — how far the leaves fall below the bottom rail, in pixels. A panel lined up
//           against another is lined up by its ironwork, not by the leaves hanging off
//           it, so whatever does that lining up adds this back.
//   sheet — which sheet below it is cut from.
export const UI = {
  // Two schemes, and where the party is standing decides which. The autumn ironwork is
  // the road and the wood: leaves, because that is what is around them out there. The
  // parchment is Dreadhollow — plain paper and plain iron, because a town is not a season.
  sheets: {
    autumn: 'art/Autumn-leafy-vines-twined-around-wrought-iron-framing.png',
    town: 'art/Neutral-faded-aged-parchment.png',
  },
  frames: {
    // A whole screen of the autumn ironwork. Cut to the ironwork rather than to the
    // leaves, because a leaf hanging off the side is a leaf drawn down the whole side once
    // the panel is stretched to a screen. Nothing asks for it since the board, the hour
    // and the crew went onto the town's parchment; it is kept for the day something
    // full-screen belongs to the road rather than to Dreadhollow.
    page: {
      sheet: 'autumn',
      at: [107, 97, 480, 172], slice: [158, 320, 113, 57],
      flat: [24, 31, 39, 35], pad: [42, 46, 50, 62], shade: 0.8,
    },
    // A band across the crawl: over the road, under it, and stood on its end beside it.
    // Washed like the plaque, for the same reason in a different key — the board inside
    // it is painted with stains and highlights, and a nine-slice pulls a two-pixel slice
    // of those the width of a screen, which is where the pale shapes came from.
    band: {
      sheet: 'autumn',
      at: [196, 11, 295, 81], slice: [183, 110, 43, 36],
      flat: [21, 21, 21, 21], pad: [66, 68, 24, 22], shade: 0.3,
      paper: [310, 37, 47, 34], wash: 1,
    },
    // the card that opens at each node: paper, and written on in ink
    plaque: {
      sheet: 'autumn',
      at: [196, 269, 295, 110], slice: [173, 120, 54, 54],
      flat: [18, 27, 19, 18], pad: [38, 38, 28, 26], hang: 10,
      paper: [372, 328, 33, 31], wash: 2, ink: true,
    },

    // Dreadhollow's own. Every screen the player opens while they are standing in the
    // town is this one panel at whatever size it is asked for: parchment inside a plain
    // iron frame, with a corner bracket at each of the four corners. Washed like the
    // others, because the paint has a mottle in it that a nine-slice would pull into
    // streaks the length of a screen.
    parchment: {
      sheet: 'town',
      at: [15, 87, 131, 112], slice: [22, 22, 22, 22],
      flat: [8, 8, 8, 8], pad: [24, 24, 20, 20],
      paper: [56, 120, 40, 40], wash: 2, ink: true,
    },
    // The square off the same sheet: what a face or an icon is set in. The one frame
    // used on both sides of the game — a speaker's portrait in the town, a walked node
    // down on the trail — so it takes the cold after dark the way the road's own
    // ironwork does rather than staying a warm square on a cold band.
    plate: {
      sheet: 'town',
      at: [160, 168, 57, 57], slice: [6, 6, 6, 6],
      flat: [5, 5, 5, 5], pad: [10, 10, 10, 10],
    },
  },
};

// The skills, cut from one painted sheet of them. A cell is named by its column and row,
// counted from one at the top-left, which is how a sheet is read off the page.
//   sheet — the painted sheet under art/.
//   cell  — the side of one icon on it, in pixels. Every cell is square and they abut.
//   at    — [column, row] per skill id from content/skills.js. A skill with no entry —
//           or every skill, until the sheet is actually in the repo — keeps the shape
//           src/icons.js draws for it, and nothing else changes either way.
export const SKILL_ART = {
  sheet: 'art/pixellab-Skill-Icons-for-the-following--1786668947352.png',
  cell: 32,
  at: {
    woodcraft: [1, 1],
    woodcutting: [1, 2],
    fishing: [1, 3],
    sailing: [3, 4],
    alchemy: [1, 5],
    perception: [1, 6],
    charisma: [1, 7],
    smithing: [1, 8],
  },
};

// What is standing at a node, for the encounters that have art instead of the silhouette
// src/textures.js draws for their nature. Keyed by the encounter id in
// content/encounters.js, and two of them can share one export.
//   path   — the folder under art/ the export was unzipped into, as exported.
//   stands — the loop it plays while it is still there: the folder of frames as
//            exported, how many there are, and how far up the image its own floor sits.
//   done   — the same for once the party has finished with it. Played once and held, so
//            a tree that has come down stays down. Leave it out for anything the party
//            does not change by working it: water is water afterwards.
//   turn   — quarter turns clockwise to give the art before it is used, for a thing
//            painted lying one way and wanted the other. A brook painted as a channel
//            running across the frame is a brook running down the screen once it has been
//            stood on its end, which is what a brook crossing a road looks like.
//   shade  — a colour to multiply the art by, for art painted under a light the place
//            does not have. A multiply only takes away, so this warms cold art by losing
//            its blue rather than by adding anything; nothing comes out brighter.
//   trim   — [left, right, top, bottom] pixels of paint to cut off, for a thing painted
//            longer than the ground it has to cross. Where it stands against the road
//            does not move: `ground` is measured off the frame, and the frame is not
//            what is being cut.
//   fade   — [left, right, top, bottom] pixels of the painting to ramp out to nothing on
//            each side. Art that comes back as a self-contained rectangle — its banks
//            painted hard to the edge of the paint — sits on the landscape with a seam
//            round it otherwise. Measured from the paint, not from the frame around it,
//            and applied after the turn, so the sides are the sides it ends up with.
// `ground` is per state because a state is drawn where it is drawn: the oak's roots run
// to the bottom of its frame and the felled trunk sits well up inside its own, and both
// have to meet the same road. Measure it off the art once — it is the empty pixels under
// the paint — and nothing has to be recut.
const OAK = {
  path: 'art/oak',
  stands: {
    folder: 'A_large_ancient_oak_treee_w/animations/Tree_is_cut_town_the_trunk_collapsing_to_the_righ/unknown',
    frames: 9,
    ground: 7,
  },
  done: {
    folder: 'Tree_is_cut_town_th/animations/Tree_is_cut_down_the_trunk_crashing_to_the_ground/unknown',
    frames: 9,
    ground: 35,
  },
};

// Painted as a channel running across its frame, and turned a quarter so it runs down
// the screen instead: out of the trees at the top, over the road in the middle, and off
// the bottom of it. Its floor line is the middle of the water, because the middle of the
// water is what the road runs into.
const BROOK = {
  path: 'art/brook',
  stands: {
    folder: 'A_rocky_gurgling_brook_running/animations/Water_gurgling_and_moving_slowly_through_the_brook/unknown',
    frames: 9,
    ground: 128,
    turn: 1,
    // Painted cold — grey rock and cyan water — under a wood that is all warm brown and
    // amber, so it is pulled toward the Greywood's light rather than repainted.
    shade: 0xffcda0,
    // It is painted long enough to reach halfway up the trunks, which is further into the
    // wood than a brook crossing a road wants to be seen coming from. The far end is cut
    // back so it comes out of the trees just above the path; the near end is left, because
    // that is the one running off under the card.
    trim: [0, 0, 44, 0],
    // Its banks are painted hard to the edge of the paint, so they are eaten back into
    // the forest floor either side and into the trees it comes out of. The left bank
    // takes the most because it is the squarest; the bottom takes none, because the
    // card is over it and nothing of that edge is ever seen.
    fade: [44, 26, 26, 0],
  },
};

// The nest, with the bird on it and then without. Both states are painted standing on
// the same ground — the bottom of the nest is in the same row in every frame of both —
// so the nest does not jump when the heron goes off it.
const HERON = {
  path: 'art/heron',
  stands: {
    folder: 'A_giant_grey-purple_heron_gu/animations/The_heron_shifts_its_weight_slightly_on_the_branch/unknown',
    frames: 9,
    ground: 12,
  },
  done: {
    folder: 'The_heron_flies_off/animations/The_Heron_flies_off_from_the_nest_and_into_the_dis/unknown',
    frames: 9,
    ground: 12,
  },
};

export const NODE_ART = {
  woodland: OAK, // Standing timber, the one the road rolls
  secondcut: OAK, // and The oak, the one the first job is taken for
  heron: HERON, // The heron's nest, one way through the fork
  water: BROOK, // Standing water, rolled
  firstcast: BROOK, // and The stream, the first node of the first job
};
