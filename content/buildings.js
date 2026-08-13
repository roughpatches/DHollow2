// Every building in town, and what it takes to bring it back into working condition.
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
// A building whose id is also in STRUCTURES in content/looks.js has a picture per stage,
// and repairing it changes the picture where it stands.
// Add a building by adding a block. Nothing reads this list by position.

export const BUILDINGS = [
  {
    id: 'tavern',
    name: 'The Sea Hag',
    map: 'village',
    site: [32, 42],
    enter: 'tavern',
    level: 0,
    stages: [
      { name: 'Open', note: 'The only building in town still doing what it was built for.', open: true },
    ],
    body: [
      'Tarred timber, low slate, and the only lit windows on the harbour. It stands where the dock meets the quay, which is where a tavern goes in a town that was ever paid for by the sea.',
    ],
  },
  {
    // Three stages, three pictures. The door is shut until the roof is back on: there is
    // nothing inside a burnt chapel but weather.
    id: 'chapel',
    name: 'The chapel',
    map: 'village',
    site: [65, 15],
    enter: 'chapel',
    level: 0,
    stages: [
      {
        name: 'Burnt out',
        note: 'The roof is in the nave and the door is boarded over.',
        cost: { timber: 14, nails: 30, canvas: 4 },
      },
      {
        name: 'Shored up',
        note: 'Scaffolded, sheeted, and dry for the first winter in years.',
        cost: { timber: 22, stone: 16, nails: 40, pitch: 6 },
      },
      {
        name: 'Roofed and lit',
        note: 'Slated, swept, and open. You can hear how big it is from the door.',
        open: true,
        patch: [[62, 27, '+'], [73, 17, '+']], // the square swept back to its flagstones
      },
    ],
    body: [
      'Soot-black stone at the north end of the square, with the burnt ends of its rafters still standing up out of the nave like ribs.',
      'Nobody will say what year it went up, only that it went up at night.',
    ],
  },
  {
    // No inside: the docks are somewhere you stand, not somewhere you enter. Repairing
    // them lays decking back over the water a berth at a time.
    id: 'dock',
    name: 'The Dreadhollow docks',
    map: 'village',
    site: [31, 46],
    level: 0,
    stages: [
      {
        name: 'One berth sound',
        note: 'One dock takes a boat. The rest are posts and rot.',
        cost: { timber: 18, nails: 36, pitch: 4 },
      },
      {
        name: 'Two berths working',
        note: 'The second dock is decked end to end and holds a man\'s weight.',
        cost: { timber: 26, stone: 10, nails: 48, pitch: 8 },
        patch: [
          [25, 46, '-'], [26, 46, '-'], [25, 47, '-'], [26, 47, '-'], [25, 48, '-'],
          [26, 48, '-'], [25, 49, '-'], [26, 49, '-'], [25, 50, '-'], [26, 50, '-'],
          [25, 51, '-'], [26, 51, '-'], [25, 52, '-'], [26, 52, '-'], [25, 53, '-'],
          [26, 53, '-'], [25, 54, '-'], [26, 54, '-'], [25, 55, '-'], [26, 55, '-'],
          [25, 56, '-'], [26, 56, '-'],
        ],
      },
      {
        name: 'The harbour working',
        note: 'Three berths and the cargo pier. Enough to unload a ship, if one came.',
        patch: [
          [21, 46, '-'], [22, 46, '-'], [21, 47, '-'], [22, 47, '-'], [21, 48, '-'],
          [22, 48, '-'], [21, 49, '-'], [22, 49, '-'], [21, 50, '-'], [22, 50, '-'],
          [21, 51, '-'], [22, 51, '-'], [21, 52, '-'], [22, 52, '-'], [21, 53, '-'],
          [22, 53, '-'],
          [17, 60, '-'], [18, 60, '-'], [19, 60, '-'], [20, 60, '-'], [21, 60, '-'],
          [22, 60, '-'], [23, 60, '-'], [24, 60, '-'], [25, 60, '-'], [26, 60, '-'],
          [27, 60, '-'], [28, 60, '-'], [29, 60, '-'],
        ],
      },
    ],
    body: [
      'Four docks and a cargo pier, built for a harbour that took ships twice a year and could have taken more.',
      'One of them is sound. Two are decking with the sea showing through it. The last is a line of posts with the crossbeams gone, and the hull that was tied to it is still there, under the water, at its own mooring.',
    ],
  },
];
