// Every building in town, and what it takes to bring it back into working condition.
//   id      — how src/town.js and content/places.js refer to it.
//   map     — the map the building stands on.
//   site    — where the building is. On a grid, the tile you stand on or face to work
//             on it, usually its door. On a street (see content/maps.js) one number: how
//             far along it stands. Standing there and pressing [E] is how it is reached.
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
    site: [46],
    enter: 'tavern',
    level: 0,
    stages: [
      { name: 'Open', note: 'The only building in town still doing what it was built for.', open: true },
    ],
    body: [
      'Tarred timber, low slate, and the only lit windows on the shore road. It stands at the foot of the bank where the road runs out onto the foreshore, which is where a tavern goes in a town that was ever paid for by the sea.',
    ],
  },
  {
    // Three stages, three pictures. The door is shut until the roof is back on: there is
    // nothing inside a burnt chapel but weather.
    id: 'chapel',
    name: 'The chapel',
    map: 'village',
    site: [30],
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
      },
    ],
    body: [
      'Soot-black stone at the north end of the paving, with the burnt ends of its rafters still standing up out of the nave like ribs.',
      'Nobody will say what year it went up, only that it went up at night.',
    ],
  },
];
