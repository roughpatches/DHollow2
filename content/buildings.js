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
  {
    id: 'smithy',
    name: 'The Smithy',
    map: 'village',
    site: [31, 7],
    enter: 'smithy',
    level: 0,
    stages: [
      {
        name: 'Boarded',
        note: 'Shut. The door is planked over from the inside.',
        open: false,
        cost: { timber: 8, nails: 10 },
        patch: [[31, 7, '#']],
      },
      {
        name: 'Shored',
        note: 'Open, and the roof will hold. The forge is still cold.',
        open: true,
        cost: { stone: 12, nails: 16 },
        patch: [[31, 7, 'D']],
      },
      { name: 'Working', note: 'Forge lit. Iron can be worked here.', open: true },
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'chapel',
    name: 'Chapel of the Quiet Hour',
    map: 'village',
    site: [30, 19],
    enter: 'chapel',
    level: 0,
    stages: [
      {
        name: 'Boarded',
        note: 'Shut. Nobody has sat the Quiet Hour inside it in some time.',
        open: false,
        cost: { stone: 10, timber: 6 },
        patch: [[30, 19, '#']],
      },
      {
        name: 'Shored',
        note: 'Open to the weather but open. The pews are usable.',
        open: true,
        cost: { stone: 14, canvas: 4 },
        patch: [[30, 19, 'D']],
      },
      { name: 'Working', note: 'Roofed, dry, and the doors stay open on purpose.', open: true },
    ],
    body: ['[Placeholder Text]'],
  },
  {
    id: 'docks',
    name: 'The Docks',
    map: 'village',
    site: [7, 22],
    level: 0,
    stages: [
      {
        name: 'Derelict',
        note: 'Rotted out. There is nothing here to stand on.',
        open: false,
        cost: { timber: 10, nails: 8 },
      },
      {
        name: 'Pilings',
        note: 'Two posts and a plank. It holds a person and nothing else.',
        open: false,
        cost: { timber: 14, pitch: 6 },
        patch: [[6, 23, '_'], [7, 23, '_']],
      },
      {
        name: 'Jetty',
        note: 'Long enough to fish from. Not long enough to tie up to.',
        open: false,
        cost: { timber: 10, canvas: 6, pitch: 4 },
        patch: [[6, 24, '_'], [7, 24, '_']],
      },
      {
        name: 'Working',
        note: 'A boat can come alongside.',
        open: false,
        patch: [[5, 23, '_'], [5, 24, '_'], [5, 25, '_'], [6, 25, '_'], [7, 25, '_']],
      },
    ],
    body: ['[Placeholder Text]'],
  },
];
