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
//              it out for somebody who stands where they are put and never walks; a
//              direction with no cycle behind it is walked in the standing frame.
//   indoors  — the look this one becomes on a map that says it is indoors (see
//              content/maps.js). Somebody painted twice — once small for the road, once
//              at the size a room is painted at — is one person with two looks.
//   idle     — the same for standing still. Frame 0 is what they wear when nothing is
//              happening to them. `yoyo` runs it out and back rather than round: a loop
//              that ends somewhere else than it started pops when it repeats. `every` is
//              [least, most] milliseconds of standing still between one run of it and the
//              next, for an idle that is something somebody does now and then rather than
//              a loop they are always in; they breathe on frame 0 in between, and the
//              wait is counted from the end of one run rather than the start of it.
//   still    — the folder of painted rotations somebody stands on when they have no idle
//              loop of their own. Used instead of `idle`; the walk cycle is unaffected.
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
    // You: the wanderer in the poncho and the wide hat, everywhere in Dreadhollow — the
    // road, the town and every room in it. One export at the size a room is painted at,
    // walked all four ways, with a face of its own. There is no idle loop in it and a
    // standing figure does not need one, so the painted rotations are what you stand in.
    id: 'player',
    path: 'art/player',
    size: 128,
    foot: 125, // the boots, three rows up from the bottom of the frame
    head: 4, // and the crown of the hat
    walk: { folder: 'Idle/animations/Walk', frames: 6 },
    still: 'Idle/rotations',
    portrait: 'Idle/portrait.png',
  },
  {
    // Aldis, the hooded hunter with the bow, out on the road. His own export carries no
    // face and nothing to lay him out on the floor with, so the face is the indoor
    // export's hooded one — he is hooded out here — and the fall is still the oldest
    // export's. Those are the only two things in this list that reach outside their own
    // folder.
    id: 'aldis',
    path: 'art/aldis-hunter',
    size: 64,
    foot: 63,
    head: 1,
    walk: { folder: 'Idle/animations/Walk', frames: 6 },
    still: 'Idle/rotations',
    down: '../aldis/Collapsed_in_a_heap/rotations/south.png',
    portrait: '../aldis-indoors/Idle/portrait.png',
    indoors: 'aldis-indoors',
  },
  {
    // And indoors, at the size a room is painted at: the hood down, arms crossed and the
    // bow on his back, which is a hunter in somebody's house rather than one in the wood.
    // The export's other state — hood up, bow in hand — is in the same folder if a scene
    // ever wants him ready indoors.
    id: 'aldis-indoors',
    path: 'art/aldis-indoors',
    size: 128,
    foot: 125,
    head: 2,
    still: 'Arms_crossed_bow_on/rotations',
    portrait: 'Arms_crossed_bow_on/portrait.png',
    down: '../aldis/Collapsed_in_a_heap/rotations/south.png',
  },
  {
    id: 'gregorious',
    path: 'art/gregorious',
    size: 60,
    foot: 46,
    walk: { folder: 'Walking/animations/Walk', frames: 6 },
    idle: { folder: 'Idle/animations/Breathing_Idle', frames: 4 },
    portrait: 'Idle/portrait.png',
    indoors: 'gregorious-bar', // behind his own bar he is painted at the room's size
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
      every: [8000, 12000], // and he does it now and then, not for ever: a man polishing
      // one glass without stopping is a man with something wrong with him
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
//   stages — one image per stage of repair, lowest first. A stage past the end of the
//            list keeps the last picture.
export const STRUCTURES = [
  // The Sea Hag has no entry: it is painted into the harbour road, sign and all, and a
  // building that is already in the picture does not want a second one standing on it.
  // The export it used to be drawn from is still in art/seahag if it is wanted elsewhere.
  {
    // Three stages and the art carries all of them: burnt out, wrapped in scaffolding,
    // then roofed and lit. 128 pixels of picture over the chapel's seven rows of tiles.
    id: 'chapel',
    path: 'art/chapel',
    at: [37], // standing in the burying ground painted along the back of the wood end
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
  // The sheet was painted for the eight skills there used to be. Six of them kept their
  // names and two were renamed onto the cell that was already the right picture — the eye
  // is Investigation now and the speech bubble is Persuasion. The other eight skills have
  // no cell on it and keep the shape src/icons.js draws, which is what a skill with no
  // entry here always did.
  at: {
    woodcraft: [1, 1],
    woodcutting: [1, 2],
    fishing: [1, 3],
    sailing: [3, 4],
    alchemy: [1, 5],
    investigation: [1, 6],
    persuasion: [1, 7],
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
//   still  — a state's single export, out of its rotations folder, instead of `folder` and
//            `frames`. What a thing that does nothing while you stand at it comes back as.
//   scale  — a whole multiple to draw the art at, for art painted smaller than the road it
//            has to stand on. Everything here is painted at whatever size it was asked for
//            and a thicket painted at 80 is knee-high beside an oak painted at 256. Keep it
//            whole: pixel art scaled by a fraction stops being pixel art.
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

// One boulder, painted four times: as it stands, with a block split off it, with water
// coming out of it, and with somebody's stack of flat stones against its side. The vein is
// in all four, which is why the same rock can be the ore, the spring and the marker. Every
// state registers the same, because it is the same rock in the same place each time.
const boulder = (name) => ({
  path: 'art/boulder',
  stands: { still: `${name}/rotations/${name}.png`, ground: 19 },
});

// Thin deciduous trees, painted at 80 and stood up to three times that so a stand reads as
// a stand beside an oak. Two exports of the one prompt, each carrying its own second half:
// the leafy wall and the leafy wall half cut, the bare stand and the bare stand with one
// tree still in leaf. What is left of each export is the half nobody asked a node for.
const thicket = (path, name, ground) => ({
  path,
  stands: { still: `${name}/rotations/${name}.png`, ground, scale: 3 },
});

// The rest of the oaks: the same tree dressed four ways, each painted once rather than
// looped, because none of them does anything while the party is standing at it. `still` is
// a state that is one picture instead of a folder of frames; see src/art.js. `ground` is
// the empty pixels under the paint, the same measure every other state takes — the two
// lying down float well up inside their frames and the two standing do not.
const oak = (name, ground) => ({
  path: 'art/oak',
  stands: { still: `${name}/rotations/${name}.png`, ground },
});

export const NODE_ART = {
  woodland: OAK, // Standing timber, the one the road rolls
  secondcut: OAK, // and The oak, the one the first job is taken for
  heron: HERON, // The heron's nest, one way through the fork
  water: BROOK, // Standing water, rolled
  firstcast: BROOK, // and The stream, the first node of the first job
  deadfall: oak('Deadfall', 45), // An oak gone over in the wind, root plate up
  mushrooms: oak('Mushrooms', 43), // The mushroom copse, the same trunk gone over with them
  offering: oak('Offering', 7), // Somebody has left something at the foot of that tree
  sap: oak('Sap', 7), // A tree that is bleeding, the stripe painted down its trunk
  // The thicket, the wall of it across the road
  thorn: thicket('art/thicket', 'A_thicket_of_dense_thin_deci', 6),
  // Somebody is cutting here: the same wall, half of it down and the cut stacked
  claim: thicket('art/thicket', 'Half_the_trees_cut_d', 3),
  // Something has gone through this stand: bare the wrong month, one tree still in leaf
  blight: thicket('art/blight', 'A_single_tree_in_ful', 6),
  // The boulder, whole and then opened: the only encounter here the party changes by
  // working it, so it is the only one of the three that has a second state.
  crag: {
    ...boulder('A_large_lichen_covered_boulde'),
    done: { still: 'Broken_Crag/rotations/Broken_Crag.png', ground: 19 },
  },
  spring: boulder('Water_Spring'), // Water coming out of the rock
  cairn: boulder('A_cairn_of_piled_sto'), // A cairn nobody has added to
  seam: boulder('Split'), // A boulder split in two, the vein open on both walls of the gap
  adit: boulder('Shaft'), // A hole under the boulder somebody made
  cutting: boulder('Troll'), // A troll, and the rock in the path
};
