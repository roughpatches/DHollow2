// The Map tab. Same label/note/body as the other tabs, plus the fields it alone reads:
//   id       — how a quest's `at` names this place. Only a zone a job is walked in needs one.
//   backdrop — a painted landscape for runs walked in this zone, and how far down the
//              image its ground line sits. Drawn at 1:1 and tiled across, so it wants to
//              be pixel art at the game's own scale; `ground` is what registers its floor
//              to the road the party walks on. A zone without one gets the generated
//              bands. See src/walk.js.
//   terrain  — the ground a zone is: forest, water, and whatever else gets walked on.
//              A skill that reads that ground is worth constitution to everyone who sets
//              out here; see `terrain` in content/skills.js and conPerTerrainPoint in
//              tuning.js. A place with no terrain gives nobody anything.
//   map      — which grid in content/maps.js to draw. Required; an entry without it is a list row.
//   at       — optional tile to ring on that map, for a landmark inside a larger place.
//              [x, y] on a grid; one number on a street, which is how far along it stands.
//   quest    — optional id from content/quests.js. The entry becomes somewhere you set
//              out for: its state is read live, and Enter starts the job when it can be.
//   building — optional id from content/buildings.js. The building's repair state and what
//              it still wants are shown above the prose, read live from the town.
// Doors, everyone standing on the map, and the player's own position are drawn from the
// live world, so a place only needs writing about once and never needs its pins updating.

export const PLACES = [
  {
    label: 'Dreadhollow',
    note: 'Open ground',
    map: 'village',
    body: [
      'Dying grass over most of it, a granite pavement in the middle laid for more people than are left to stand on it, and a bank of packed earth running down the east side to the water.',
      'It reads west to east like a tide going out — or in. The wood is at your back, the sea is in front of you, and everything anybody ever built here is on the ground between.',
    ],
  },
  {
    label: 'The paving',
    note: 'Open ground',
    map: 'village',
    at: [22],
    body: [
      'Imperial setts, laid wide enough for a market and a road out of it, going green in the joints a course at a time.',
      'It is the only part of town that was ever finished.',
    ],
  },
  {
    label: 'The chapel',
    note: 'Ruin',
    map: 'village',
    at: [17],
    building: 'chapel',
    body: [
      'It shuts off the north end of the paving, and it is the tallest thing left standing in Dreadhollow even with its roof in the nave.',
      'The stone is sound. Everything above the stone is not.',
    ],
  },
  {
    // The east side of town. No dock stands on it yet, which is the point of it.
    terrain: 'water',
    label: 'The foreshore',
    note: 'Shore',
    map: 'village',
    at: [26],
    body: [
      'The bank runs out into a broad muddy flat and the flat runs out into deep water. There is nothing built on any of it.',
      'A harbour was worth cutting here once. You can see where from the shape of the ground.',
    ],
  },
  {
    // North up the coast from the town, and the beach is how you walk between them.
    label: 'The point',
    note: 'Open ground',
    map: 'shore',
    body: [
      'A north-facing spit of muddy sand at the top of the beach, out of sight of the town.',
      'This is where the tide put you.',
    ],
  },
  {
    label: 'Aldis Rooke\'s house',
    note: 'Indoors',
    map: 'hut',
    body: ['[Placeholder Text]'],
  },
  {
    // No walkable map: the Greywood is where a run happens, not somewhere you stroll.
    // `quest` makes the entry somewhere you set out for — Enter starts the job.
    id: 'greywood',
    terrain: 'forest',
    backdrop: { image: 'art/greywood/backdrop.png', ground: 318 },
    label: 'The Greywood',
    note: 'Wilds',
    quest: 'firstday',
    body: ['[Placeholder Text]'],
  },
  {
    label: 'The Sea Hag',
    note: 'Indoors',
    map: 'tavern',
    building: 'tavern',
    body: ['[Placeholder Text]'],
  },
];
