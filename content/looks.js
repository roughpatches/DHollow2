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
export const STRUCTURES = [
  {
    // One stage: the Sea Hag is the one building in town that never needed repairing.
    // The export carries eight angles; the town is drawn from the front, so it is south.
    id: 'tavern',
    path: 'art/seahag',
    at: [3.22, 1.13],
    stages: ['base/rotations/south.png'],
  },
  {
    id: 'chapel',
    path: 'art/chapel',
    at: [27, 12.5],
    stages: [
      'base/rotations/unknown.png', // boarded: the roof is in the nave
      'wrapped_in_timber_sc/rotations/unknown.png', // shored: scaffolding and sheeting
      'roof_rebuilt_and_sla/rotations/unknown.png', // working: slated, and the lamps lit
    ],
  },
];
