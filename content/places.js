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
//   at       — optional [x, y] tile to ring on that map, for a landmark inside a larger place.
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
      'A harbour, a road up out of it, and a square at the top with a burnt chapel across the north end. That is the whole plan of the place, and it was laid out for four times the people who are left in it.',
      'It reads west to east like a tide going out. Down at the quay the windows are lit and the stone is swept. By the square the doors are boarded. Past the square the lanes still have names and nothing else, and the wood is standing in the gardens.',
    ],
  },
  {
    // The harbour, and the reason there was ever a town here at all.
    id: 'harbour',
    terrain: 'water',
    label: 'The harbour',
    note: 'Dockside',
    map: 'village',
    at: [31, 52],
    building: 'dock',
    body: [
      'Deep water, a stone quay, and four docks. One of them you can walk out on.',
      'The basin was cut back into the shore by somebody with money and a reason. Both are gone; the basin is not.',
    ],
  },
  {
    label: 'The town square',
    note: 'Open ground',
    map: 'village',
    at: [66, 22],
    body: [
      'Imperial flagstones, a dry well, and the frames of market stalls that nobody has bothered to take away for firewood, which tells you something about how much firewood there is.',
      'Big enough for a market day. It has not had one in eleven years.',
    ],
  },
  {
    label: 'The chapel',
    note: 'Ruin',
    map: 'village',
    at: [65, 15],
    building: 'chapel',
    body: [
      'It shuts off the north end of the square, and it is the tallest thing left standing in Dreadhollow even with its roof in the nave.',
      'The stone is sound. Everything above the stone is not.',
    ],
  },
  {
    label: 'The burying ground',
    note: 'Walled',
    map: 'village',
    at: [74, 9],
    body: [
      'A walled acre east of the chapel, mown to the fence line by one man with no particular reason to keep doing it.',
      'Forty-one stones. Wick will tell you the newest ones are the ones to read.',
    ],
  },
  {
    label: 'Fishermen\'s row',
    note: 'Lane',
    map: 'village',
    at: [43, 52],
    body: [
      'Nine doors down the east side of the basin, and one of them opens.',
      '[Placeholder Text]',
    ],
  },
  {
    label: 'The old imperial road',
    note: 'Lane',
    map: 'village',
    at: [88, 14],
    body: [
      'Northeast out of the square, over the ridge, and shut. Two hundred years of imperial stonework going green a course at a time.',
      'You can follow it as far as the treeline. Past that it is a suggestion.',
    ],
  },
  {
    // West out of the village lane. The strand the player washed up on is a headland
    // north up the coast, so the coast track is what joins the two.
    label: 'The point',
    note: 'Open ground',
    map: 'shore',
    body: [
      'A north-facing spit of muddy sand at the top of the coast track, out of sight of the harbour.',
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
