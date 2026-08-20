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
    // Melovia, the herbalist with the staff and the leather satchel, out on the road. Her
    // export carries no face — the room-sized one below has it — so she talks with that,
    // the way Aldis does.
    id: 'melovia',
    path: 'art/melovia',
    size: 64,
    foot: 64, // her boots reach the bottom row of the frame, so the ground is below it
    head: 2, // and the crown of her head, which the staff tips out over and is not
    walk: { folder: 'Idle/animations/Walk', frames: 6 },
    still: 'Idle/rotations',
    portrait: '../melovia-indoors/Idle/portrait.png',
    indoors: 'melovia-indoors',
  },
  {
    // The same herbalist at the size a room is painted at, painted all eight ways and
    // walking none of them: indoors she stands where she is put. The face is hers.
    id: 'melovia-indoors',
    path: 'art/melovia-indoors',
    size: 128,
    foot: 125,
    head: 3, // the crown of her head; the staff tops out level with it
    still: 'Idle/rotations',
    portrait: 'Idle/portrait.png',
  },
  {
    // Aethelwynn, the blacksmith with the hammer on her shoulder, out on the road. Her
    // walk was exported on a bigger canvas than her rotations — 88 and 92 pixels against
    // 64 — and one frame size per look is what stands a character still while she walks,
    // so every frame of this export was re-canvassed to 66 about its own centre. Nothing
    // was painted over or cut: 66 is simply the smallest square the widest swing of the
    // hammer fits in. Like Melovia she talks with the room-sized export's face.
    id: 'aethelwynn',
    path: 'art/aethelwynn',
    size: 66,
    foot: 64,
    head: 2,
    walk: { folder: 'Walking/animations/The_character_walks_forward_with_a_steady_rhythmic', frames: 9 },
    still: 'Idle/rotations',
    portrait: '../aethelwynn-indoors/Idle/portrait.png',
    indoors: 'aethelwynn-indoors',
  },
  {
    // The same smith at the size a room is painted at, painted all eight ways, standing
    // still. Bigger in the frame than the other indoor exports — 148 against 128 — which
    // is only the canvas she came on; `head` and `foot` are what she is drawn by.
    id: 'aethelwynn-indoors',
    path: 'art/aethelwynn-indoors',
    size: 148,
    foot: 137,
    head: 12,
    still: 'Idle/rotations',
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
//   shell  — instead of `path` and `stages`, for a building with no export yet: a drawn
//            placeholder, one per stage, generated at boot by src/textures.js.
//              size  — the finished thing, in pixels: how wide it stands and how tall.
//              roof  — whether the last stage is capped with one. A jetty is not.
//              built — how much of it is standing at each stage, lowest first, 0 to 1.
//                     How many numbers are on this line is how many stages it has.
//            It is drawn see-through and hatched on purpose: it stands over a painted
//            town, and it should read as somewhere art is going rather than as art.
//            Swap it for `path` and `stages` when the export arrives; nothing else changes.
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
  {
    // No export yet. A shopfront bay — the door and the window beside it — rather than
    // the whole house, so the painted terrace it stands in front of is still readable.
    id: 'studio',
    at: [29], // the door east of the tavern, the same tile the building is reached at
    shell: { size: [76, 132], roof: true, built: [0.18, 0.62, 1] },
  },
  {
    // No export yet either, and a jetty rather than a house: wide, low, and finished with
    // a rail along it instead of a roof over it.
    id: 'docks',
    at: [34], // the head of the old jetty, where the paving gives out
    shell: { size: [150, 34], roof: false, built: [0.3, 0.7, 1] },
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

// A stone is painted twice — the lump it comes out of the ground as, and the same stone
// off the wheel — and both come out of one export, under the two names below. Colour is
// not what an export decides: the painting is put through that stone's own pair from
// COLORS.icon on the way to the screen, which is exactly how the drawn placeholders
// already worked. So an export is a shape, and every stone cut to that shape shares it.
//   folder under art/gems → the stones painted in it
// A stone left off keeps the shape src/icons.js draws for it and nothing else changes.
// Tier one is here because tier one is what is dug so far.
const STONE_ART = {
  // A crust of points on the rough and a faceted stone off the wheel.
  crystal: ['amethyst'],
  // A river-stone nodule on the rough and a domed cabochon off the wheel.
  nodule: ['garnet'],
  // A layered lump on the rough and a flat slab off the wheel, ringed either way.
  banded: ['agate'],
};
const ROUGH_STONE = 'An_uncut_gem_recently_mined/rotations/An_uncut_gem_recently_mined.png';
const CUT_STONE = 'Cut_and_polished_int/rotations/Cut_and_polished_int.png';

// And the things a pack holds that are not stones: icon name → the export, each under its
// own folder in art/items because two exports asked for at different times come back under
// the same name often enough. No ink named, so these go up as painted — a thing painted in
// its own colour has nothing to be put through. A stone is a shape any number of stones
// can be cut to; everything else is only itself.
const PAINTED_ITEMS = {
  oakbranch: 'art/items/oakbranch/An_Oak_log/rotations/An_Oak_log.png',
  oaklog: 'art/items/oaklog/An_Oak_log/rotations/An_Oak_log.png',
  heartwood: 'art/items/heartwood/An_Oak_log/rotations/An_Oak_log.png',
  copperore: 'art/items/copperore/Ore_rough_and_unfinished/rotations/Ore_rough_and_unfinished.png',
  tinore: 'art/items/tinore/Ore_rough_and_unfinished/rotations/Ore_rough_and_unfinished.png',
  coal: 'art/items/coal/Ore_rough_and_unfinished/rotations/Ore_rough_and_unfinished.png',
  bronzebar: 'art/items/bronzebar/A_metal_bar_for_use_in_blacksm/rotations/A_metal_bar_for_use_in_blacksm.png',
  // Written and unreachable until its ground is, but painted: see content/materials.js.
  ironbar: 'art/items/ironbar/A_metal_bar_for_use_in_blacksm_2/rotations/A_metal_bar_for_use_in_blacksm_2.png',
  // Each fish and the dish it is the whole of: the trout supper, the bluegill off the
  // embers and the pan-fried perch. The other four dishes have more than one thing in
  // them and keep their drawn shapes.
  brooktrout: 'art/items/brooktrout/Brook_Trout/rotations/Brook_Trout.png',
  troutsupper: 'art/items/troutsupper/Cooked_and_served_a/rotations/Cooked_and_served_a.png',
  bluegill: 'art/items/bluegill/A_single_Fish_freshly_caught/rotations/A_single_Fish_freshly_caught.png',
  coalfish: 'art/items/coalfish/Barbequed_for_dinner/rotations/Barbequed_for_dinner.png',
  perch: 'art/items/perch/A_single_Fish_freshly_caught/rotations/A_single_Fish_freshly_caught.png',
  friedfish: 'art/items/friedfish/Fried_for_dinner/rotations/Fried_for_dinner.png',
  // The six the wood pays for, each in the glass it is kept in: the round amber flask, the
  // green cone, the tall dark bottle, the purple round, the tall clear one and the squat
  // blue. Six vessels rather than six inks on one flask, which is what a shelf of them
  // has to be to be read at a glance.
  copsebroth: 'art/items/copsebroth/Copse_Draught/rotations/Copse_Draught.png',
  woodsdraught: 'art/items/woodsdraught/Woodsdraught/rotations/Woodsdraught.png',
  blackdraught: 'art/items/blackdraught/Blackdraught/rotations/Blackdraught.png',
  nightwash: 'art/items/nightwash/Nightshade_Wash/rotations/Nightshade_Wash.png',
  bitterwash: 'art/items/bitterwash/Bitterdraught/rotations/Bitterdraught.png',
  steadyhand: 'art/items/steadyhand/Steady_Hand/rotations/Steady_Hand.png',
  // And the three that were on the shelf before the wood was worked. These exports came
  // back unnamed, so each went to the potion whose own words claim its colour: the green
  // to the tonic that smells of the forest floor, the near-black to the grey-black salve,
  // the amber to the cordial that says it is amber.
  tonic: 'art/items/tonic/A_single_potion/rotations/A_single_potion.png',
  salve: 'art/items/salve/A_single_potion/rotations/A_single_potion.png',
  cordial: 'art/items/cordial/A_single_potion/rotations/A_single_potion.png',
  // What the forge turns the bars into. Both shirts came out of one export as `base` and
  // `_2`: the ringed one is the chainmail and the plated one is the platemail.
  bronzedagger: 'art/items/bronzedagger/Bronze_Dagger/rotations/Bronze_Dagger.png',
  bronzesword: 'art/items/bronzesword/Bronze_Sword/rotations/Bronze_Sword.png',
  bronzechainmail: 'art/items/bronzechainmail/Chainmail_chest_armor/rotations/Chainmail_chest_armor.png',
  bronzeplatemail: 'art/items/bronzeplatemail/Chainmail_chest_armor_2/rotations/Chainmail_chest_armor_2.png',
  bronzeshield: 'art/items/bronzeshield/A_single_metal_shield/rotations/A_single_metal_shield.png',
  // The three settings, out of one export as `base`, `_2` and `_3`: the open cuff is the
  // bracelet that closes with a pin, the closed band with a raised face is the ring, and
  // the one hanging on a cord is the amulet.
  bronzering: 'art/items/bronzering/A_single_piece_of_simple_bronz_2/rotations/A_single_piece_of_simple_bronz_2.png',
  bronzebracelet: 'art/items/bronzebracelet/A_single_piece_of_simple_bronz/rotations/A_single_piece_of_simple_bronz.png',
  bronzeamulet: 'art/items/bronzeamulet/A_single_piece_of_simple_bronz_3/rotations/A_single_piece_of_simple_bronz_3.png',
  // The three things Herblore brings home, all of them fungus now: the flat grey trumpet,
  // the domed oyster on its fat pale stem, and the dark red bittercap with a ring round
  // the stem. They are one family and read as one, so the ring is what tells the third.
  blacktrumpet: 'art/items/blacktrumpet/Black_Trumpet/rotations/Black_Trumpet.png',
  oystermushroom: 'art/items/oystermushroom/Oyster_Mushroom/rotations/Oyster_Mushroom.png',
  bittercap: 'art/items/bittercap/A_single_mushroom/rotations/A_single_mushroom.png',
};

// And the same for the things a pack holds: materials by their id from
// content/materials.js, cut stones by their gem id from content/gems.js. Same shape as
// SKILL_ART and read by the same code, so a sheet dropped under art/ and a column of
// [column, row] here is the whole of putting painted icons in the game. Until then every
// square keeps the shape src/icons.js draws for it, and nothing else changes either way.
// `at` is empty because the sheet is not painted yet: that is the hole, and it closes by
// filling this in rather than by touching any code.
export const ITEM_ART = {
  sheet: null, // 'art/…-item-icons.png' once it exists
  cell: 32,
  at: {},
  // And art that came back as its own file rather than as a cell on a sheet: icon name →
  // the painting, and the ink out of COLORS.icon to put it through. Read before `at`, so a
  // name with a painting of its own wins over the same name on a sheet.
  files: {
    ...Object.fromEntries(Object.entries(PAINTED_ITEMS).map(([id, path]) => [id, [path]])),
    ...Object.fromEntries(Object.entries(STONE_ART).flatMap(([shape, stones]) => stones
      .flatMap((id) => [
        [`rough${id}`, [`art/gems/${shape}/${ROUGH_STONE}`, id]],
        [id, [`art/gems/${shape}/${CUT_STONE}`, id]],
      ]))),
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
    // Painted a good deal brighter and oranger than the wood behind it, so it is knocked
    // back toward the trunks it is standing among rather than sitting in front of them.
    shade: 0xbcc6f5,
    folder: 'A_large_ancient_oak_treee_w/animations/Tree_is_cut_town_the_trunk_collapsing_to_the_righ/unknown',
    frames: 9,
    ground: 7,
  },
  done: {
    // Measured off the frame it settles on rather than the bounding box: the last rows
    // of these frames are twigs thrown clear of the trunk, and registering on those hung
    // the whole felled tree forty pixels over the path. Nothing showed it — a done state
    // is only ever seen after an activity finishes.
    folder: 'Tree_is_cut_town_th/animations/Tree_is_cut_down_the_trunk_crashing_to_the_ground/unknown',
    frames: 9,
    ground: 67,
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
    shade: 0xe4a387,
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
  // Grey-purple bird on a pale woven nest, luma 72 against the wood's 41.
  stands: {
    shade: 0xe0c5cb,
    folder: 'A_giant_grey-purple_heron_gu/animations/The_heron_shifts_its_weight_slightly_on_the_branch/unknown',
    frames: 9,
    ground: 12,
  },
  done: {
    shade: 0xe0c5cb,
    folder: 'The_heron_flies_off/animations/The_Heron_flies_off_from_the_nest_and_into_the_dis/unknown',
    frames: 9,
    ground: 12,
  },
};

// The fern stand, with the mushrooms it pays out sitting at the foot of it. It carries its
// own mossy footing and stops well inside its frame on every side, so nothing is dressed.
const BRACKEN = {
  path: 'art/bracken',
  stands: {
    still: 'A_copse_of_ferns_and_undergrow/rotations/A_copse_of_ferns_and_undergrow.png',
    ground: 7,
    shade: 0xe3d8f1,
  },
};

// The cart that went over and stayed over. Two generations and an overgrown dressing of
// the first; the overgrown one is what the node wants, because twenty years is what it
// says and twenty years is what has grown through this. The other two ship with it — the
// same cart clean, and a second generation that went into a cut ditch instead.
const CART = {
  path: 'art/cart',
  stands: {
    still: 'A_broken_overturned_cart_in_a/Overgrown/rotations/Overgrown.png',
    ground: 19,
    // Twenty years of green is greener than anything the wood paints, so the green is what
    // is taken; the oak under it keeps most of what it has.
    shade: 0xe8cce5,
  },
};

// Dry ground: a flat gone to cracked plates with the grass yellow on it and a length or
// two of timber lying where somebody left it. Same band shape as the marsh and feathered
// the same way — what makes it a hazard is that it is the marsh with a lid on.
const DRYGROUND = {
  path: 'art/dryground',
  stands: {
    still: 'A_stretch_of_marshy_soggy_gro/rotations/A_stretch_of_marshy_soggy_gro.png',
    ground: 83,
    scale: 2,
    // Left as painted. It measures brighter and yellower than the wood, but the yellow in
    // it is the same yellow the wood's dying grass is painted in, and taking it back only
    // cost the grass its life. Not everything that measures wrong looks wrong.
    fade: [30, 30, 20, 20],
  },
};

// The same two travellers, met three ways. Two of them with packs and stopping to talk;
// the same two with the packs off and nothing in their hands; and two more standing in the
// dark with no light on them, which is a second generation of the one prompt rather than a
// dressing of the first. Nobody here has a hard edge, so nothing is feathered.
const traveller = (name) => ({
  path: 'art/travellers',
  // The brightest thing measured anywhere in the wood at luma 77, most of it the pale
  // patch of ground they are painted standing on rather than the people themselves.
  stands: { still: `${name}/rotations/${name}.png`, ground: 22, shade: 0xd3c2ce },
});

const STRANGERS = {
  path: 'art/strangers',
  stands: { still: 'Two_people_heavily/rotations/Two_people_heavily.png', ground: 29 },
};

// Soggy ground, and the same soggy ground with a dozen mounds risen out of it. A band
// rather than a thing, running off both sides of its frame, so it is feathered on the two
// sides and the top; the bottom is the road. Warm enough as painted to want no shade.
// Two nodes share the plain one: bad ground and the ground giving way are the same
// stretch of marsh, met by two parties asking it two different questions.
const marsh = (name) => ({
  path: 'art/marsh',
  stands: {
    still: `${name}/rotations/${name}.png`,
    // Bad ground is ground the road goes into, not ground beyond the road. Its floor line
    // sits at the middle of the band rather than the bottom of it, so the far edge is back
    // among the trunks and the near edge runs on past the party, and it is drawn at twice
    // the size it was painted, which is the width a stretch thirty yards across wants.
    ground: 83,
    scale: 2,
    // The near edge is in view now, where it used to sit on the road line and be hidden,
    // so it is feathered too — all four sides, where before the bottom took none.
    fade: [30, 30, 20, 20],
  },
});

// A derelict holding, painted at 80 and stood at twice that so a hut with a doorway in it
// reads as something a person could have walked out of. It carries its own footing — the
// stone courses at the base are the ground it stands on — so nothing is feathered.
const COTTAGE = {
  path: 'art/cottage',
  stands: {
    still: 'A_single_derelict_fen_cottage/rotations/A_single_derelict_fen_cottage.png',
    ground: 10,
    scale: 2,
    // Pale and green-grey against a wood that has no neutral in it anywhere.
    shade: 0xe6dcd8,
  },
};

// A hollow where the ground has given way, and the same hollow filled with what came down
// into it afterwards. Painted as a full square of ground like the stream, so it is
// feathered on the three sides that show; unlike the stream it came back warm, so nothing
// is multiplied — a shade here only dulls the green on the banks and buys nothing.
const hollow = (name) => ({
  path: 'art/hollow',
  stands: {
    still: `${name}/rotations/${name}.png`,
    // A hole in the ground is a hole the road runs to the lip of, so its floor line goes
    // to the middle of the paint rather than the bottom of it: the far rim stays back
    // among the trunks and the near rim comes on past the party, which is what makes it
    // read as something you are looking down into rather than a patch beyond the path.
    ground: 84,
    // The moss. The wood has no green in it at all — not one pixel of the backdrop's floor
    // band is green-dominant, where a sixth of this export is — so there is nothing to
    // match it to and the only question is how far to take it. Green alone turns the roots
    // magenta, because taking green out of red-brown wood leaves red and blue; taking a
    // little blue with it keeps them brown. Further than this and the moss stops being
    // moss.
    shade: 0xf1adcc,
    // A hollow the width of a barn, painted at 168, is a puddle. Doubled, it is a barn.
    scale: 2,
    // Feathered on all four sides now: the near rim is in view where it used to sit on
    // the road line and be hidden.
    fade: [34, 34, 34, 34],
  },
});

// The two beasts, one export each. The wolf stands on its own ground and needs nothing
// doing to it. The boar's turned earth runs off both sides of its frame — the animal stops
// well inside it, at 159 — so only the earth is feathered, and only far enough out to stop
// it ending in a straight line, which turned ground never does.
const WOLF = {
  path: 'art/wolf',
  stands: { still: 'A_dark_shadow_of_a_wild_beast/rotations/A_dark_shadow_of_a_wild_beast.png', ground: 22 },
};

const BOAR = {
  path: 'art/boar',
  stands: {
    still: 'A_large_boar_standing_in_the/rotations/A_large_boar_standing_in_the.png',
    ground: 0,
    fade: [16, 8, 0, 0],
  },
};

// A stretch of stream, dressed nine ways. Unlike everything else standing on the road this
// is painted as a full square of ground rather than as a thing with air round it, so every
// state needs the two corrections the brook needs and for the same reasons: feathered at
// the edges so it does not sit on the landscape as a rectangle, and multiplied toward the
// wood's light, which is warm where this was painted cold. The bottom is not feathered
// because the bottom is the road, and nothing of that edge is ever seen.
const stream = (name) => ({
  path: 'art/stream',
  stands: {
    still: `${name}/rotations/${name}.png`,
    // A stream crosses the road; it does not sit beyond it. The floor line goes two thirds
    // of the way down the frame rather than at the bottom of it, so the far bank comes out
    // of the trees and the near water runs on past the party — the same registration the
    // brook uses, which puts its own floor line halfway up itself for the same reason.
    ground: 110,
    // and painted at 168 it is a puddle at the side of the road. Doubled, it spans the
    // treeline to the path, which is the width a stream wants to be crossed at.
    scale: 2,
    // Blue-dominant where the wood is red-dominant, and already darker than the wood, so
    // only the blue is taken. Cutting green with it made an asset that was too dark to
    // begin with dingier without pulling it any further into the wood.
    shade: 0xffffc0,
    fade: [26, 26, 26, 0],
  },
});

// One dead fire in a ring of stones, dressed four ways: with the wood nobody burned beside
// it, with four people crowded round it, with a tent and racks behind it, and with a bread
// oven standing over it. Every state registers differently because the dressing is what
// decides how far up the frame the paint stops, so each is measured off its own art.
// `shade` is optional here and only the oven takes one. The four objects on this export
// are not one brightness: the oven measures luma 68 against the wood's 41 and wants taking
// back, while the fire ring and the people round it are already at the dim end of legible
// and a multiply would only push them under.
const camp = (name, ground, shade) => ({
  path: 'art/fire',
  stands: { still: `${name}/rotations/${name}.png`, ground, ...(shade ? { shade } : {}) },
});

// One boulder, painted four times: as it stands, with a block split off it, with water
// coming out of it, and with somebody's stack of flat stones against its side. The vein is
// in all four, which is why the same rock can be the ore, the spring and the marker. Every
// state registers the same, because it is the same rock in the same place each time.
const boulder = (name) => ({
  path: 'art/boulder',
  // Measures luma 74 against the wood's 41 — the brightest family on the road after the
  // travellers, and the one seven nodes ride on, so a small correction here is worth more
  // than a large one anywhere else.
  stands: { still: `${name}/rotations/${name}.png`, ground: 19, shade: 0xd6c4d0 },
});

// Thin deciduous trees, painted at 80 and stood up to three times that so a stand reads as
// a stand beside an oak. Two exports of the one prompt, each carrying its own second half:
// the leafy wall and the leafy wall half cut, the bare stand and the bare stand with one
// tree still in leaf. What is left of each export is the half nobody asked a node for.
const thicket = (path, name, ground) => ({
  path,
  // The brightest orange on the road by some way; knocked back harder than the oak, which
  // is the same colour problem at a third of the size.
  stands: { still: `${name}/rotations/${name}.png`, ground, scale: 3, shade: 0xd2d8f0 },
});

// The rest of the oaks: the same tree dressed four ways, each painted once rather than
// looped, because none of them does anything while the party is standing at it. `still` is
// a state that is one picture instead of a folder of frames; see src/art.js. `ground` is
// the empty pixels under the paint, the same measure every other state takes — the two
// lying down float well up inside their frames and the two standing do not.
// `shade` is optional and only the mushroom trunk needs its own: the fallen oak, the
// bundle at the root and the bleeding tree all measure between luma 49 and 62, and the
// pale fungus on the trunk measures 71, which is a different correction rather than more
// of the same one — it is grey where the others are orange.
const oak = (name, ground, shade = 0xd9e0ff) => ({
  path: 'art/oak',
  stands: { still: `${name}/rotations/${name}.png`, ground, shade },
});

// The same export's third object: the nest on its own, with the bird taken out of the
// picture rather than flown out of it. The flying-off loop keeps the heron in the sky for
// all nine of its frames, so nothing in it is a nest nobody is coming back to; this is.
const EMPTYNEST = {
  path: 'art/heron',
  stands: { still: 'Remove_the_heron/rotations/Remove_the_heron.png', ground: 12, shade: 0xe0c5cb },
};

export const NODE_ART = {
  woodland: OAK, // Standing timber, the one the road rolls
  secondcut: OAK, // and The oak, the one the first job is taken for
  heron: HERON, // The heron's nest, one way through the fork
  water: BROOK, // Standing water, rolled
  firstcast: BROOK, // and The stream, the first node of the first job
  deadfall: oak('Deadfall', 67), // An oak gone over in the wind, root plate up
  mushrooms: oak('Mushrooms', 81, 0xddc6d0), // The mushroom copse, the same trunk gone over with them
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
  fire: camp('A_stack_of_firewood', 33, 0xdcc8cd), // A fire, and what you carry
  camp: camp('Four_figures_crowded', 32), // A fire that is not yours
  burner: camp('Racks_of_drying_leav', 30, 0xd3bec4), // A man camped alone, and his racks
  bakehouse: camp('A_dilapidated_stone', 7, 0xdfc9ce), // A bread oven standing in nothing
  deadwater: stream('A_stretch_of_stream_rocky_and'), // the stream with nothing in it
  pool: stream('Pool'), // A deep pool under the bank
  shallows: stream('Gravel_Shallows'), // Gravel shallows
  flood: stream('Overrun'), // The path is under water for a hundred yards
  logjam: stream('Logjam'), // A jam in the narrows
  nets: stream('Fishing_Debris'), // Somebody's nets, and nobody's boat
  barrels: stream('Barrels'), // Barrels in the shallows
  panners: stream('Goblins_Panning'), // Two goblins, working the water
  ferry: stream('Footbridge'), // A troll, a bridge, and a price
  animal: WOLF, // A wolf, and what it has killed
  boar: BOAR, // A boar, in the ground you wanted
  nest: EMPTYNEST, // Something emptied a nest here
  slip: hollow('boulders_and_trees_collapsed_i'), // Where the ground gave way
  rockfall: hollow('Covered_in_stone_and'), // The path is under the stone
  find: COTTAGE, // Left behind
  oldiron: CART, // A cart nobody came back for
  bracken: BRACKEN, // Fern and bracken under the eaves
  hazard: DRYGROUND, // Bad ground: the same flat with a crust on it
  mire: marsh('A_stretch_of_marshy_soggy_gro'), // The ground gives
  unquiet: marsh('A_number_of_dark_ea'), // Out of the ground
  folk: traveller('Traveler_s_with_pack'), // Folk on the road
  hungry: traveller('Two_bedraggled_travelers_in_w'), // and the same two with the packs off
  strangers: STRANGERS, // Strangers, and no lamp
};
