// Every building in town, and what it takes to bring it back into working condition.
// One so far, and it needs nothing: everything the town could earn back is still to be
// written, so nothing currently spends the materials a run brings home.
//   id      — how src/town.js and content/places.js refer to it.
//   map     — the map the building stands on.
//   site    — the tile you stand on or face to work on it. Usually its door.
//   enter   — the interior map its door leads to, if it has one. Omit for a site
//             with no inside, like the docks.
//   level   — the stage it starts at. Index into stages.
//   stages  — what it is at each level, lowest first.
//       name  — the state, shown wherever the building is listed.
//       note  — one line on what the state means. Mechanical; rewrite freely.
//       open  — whether the door works at this level.
//       cost  — materials to reach the NEXT stage. The last stage has none.
//       patch — tiles this stage puts on the map, [x, y, legend character]. Stages
//               are applied lowest to current, so a later one can undo an earlier one.
//   body    — what the place is, in the world's voice. Yours to write.
// Add a building by adding a block. Nothing reads this list by position.

export const BUILDINGS = [
  {
    id: 'tavern',
    name: 'The Sea Hag',
    map: 'village',
    site: [7, 7],
    enter: 'tavern',
    level: 0,
    stages: [
      { name: 'Open', note: 'The only building in town still doing what it was built for.', open: true },
    ],
    body: ['[Placeholder Text]'],
  },
];
