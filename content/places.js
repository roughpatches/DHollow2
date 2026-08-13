// The Map tab. Same label/note/body as the other tabs, plus the fields it alone reads:
//   id       — how a quest's `at` names this place. Only a zone a job is walked in needs one.
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
      'One road in, one road out, and the second one is shut. Four doors worth knocking on, a well nobody drinks from, and a graveyard with three stones too many.',
      'The whole of it walks end to end in under two minutes. People here say that like it is a comfort.',
    ],
  },
  {
    // West out of the village lane. The strand you washed up on is the western edge of
    // the town, so it is one place and this is what it is called.
    label: 'The Dreadhollow outskirts',
    note: 'Open ground',
    map: 'shore',
    body: ['[Placeholder Text]'],
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
