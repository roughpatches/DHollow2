// Scripted scenes. A scene plays the first time its map is entered and never again.
// One verb per step:
//   wait    — milliseconds of nothing.
//   walk    — { walk: npcId, to: [x, y] } moves them there at walking pace.
//   face    — { face: npcId, dir: 'down' } turns them on the spot.
//   say     — { say: npcId, lines: [...] } opens the dialogue box with their portrait.
//   narrate — { narrate: [...] } the same box with nobody speaking, for what the player
//             notices rather than what anyone says to them.
//   prone   — { prone: true } lays the player out; false stands them up.
//   traits  — { traits: true } hands the player the trait sheet and waits while they
//             fill it in. Once, in the hut. See src/scenes/Traits.js.
//   fade    — { fade: 'out' | 'in', ms }.
//   go      — { go: mapKey, spawn: [x, y] } ends the scene and loads that map.
//   flag    — { flag: 'name' } raises a story flag. See src/story.js.
// 'player' works anywhere an npcId does, for walk and face.
// `beat` on a say or narrate is a note to whoever writes the lines. It is never shown.
// The first scene's map is where the game boots. Add a scene by adding a block.

export const SCENES = [
  {
    id: 'washedup',
    map: 'shore',
    steps: [
      { prone: true },
      { wait: 1400 },
      { walk: 'aldis', to: [24, 8] },
      { wait: 500 },
      { walk: 'aldis', to: [19, 8] },
      { face: 'aldis', dir: 'left' },
      { wait: 700 },
      {
        say: 'aldis',
        beat: 'Out on the strand after the storm. Sees the body, takes it for a dead one.',
        lines: ['[Placeholder Text]'],
      },
      { walk: 'aldis', to: [18, 8] },
      { wait: 900 },
      {
        say: 'aldis',
        beat: 'Finds they are breathing. Surprise, then straight to what has to be done about it.',
        lines: ['[Placeholder Text]'],
      },
      {
        say: 'aldis',
        beat: 'Picking them up. The warning: it is not safe out after dark, town limits or not.',
        lines: ['[Placeholder Text]'],
      },
      { fade: 'out', ms: 1100 },
      { go: 'hut', spawn: [2, 4] },
    ],
  },
  {
    id: 'morning',
    map: 'hut',
    steps: [
      { prone: true },
      { fade: 'in', ms: 1400 },
      { wait: 900 },
      {
        say: 'aldis',
        beat: 'Morning. He has been up with them all night. Where they are, who he is.',
        lines: ['[Placeholder Text]'],
      },
      {
        narrate: ['[Placeholder Text]'],
        beat: 'The amnesia. What they reach for and do not find — name, ship, why they were at sea.',
      },
      {
        narrate: ['[Placeholder Text]'],
        beat: 'What is still there. Not memories — the hands know things the head has lost, and they know them before you decide anything.',
      },
      { traits: true },
      { prone: false },
      { face: 'aldis', dir: 'right' },
      { wait: 500 },
      {
        say: 'aldis',
        beat: 'The state of the place. Dreadhollow has been emptying for years, and what is outside has been coming further in every season.',
        lines: ['[Placeholder Text]'],
      },
      {
        say: 'aldis',
        beat: 'Blighthaven. The trade road there was cut, and everything got faster after that.',
        lines: ['[Placeholder Text]'],
      },
      {
        say: 'aldis',
        beat: 'Sends them to the Sea Hag. Gregorious has work — for the town, or just for the coin to get wherever they were going.',
        lines: ['[Placeholder Text]'],
      },
    ],
  },
  {
    id: 'seahag',
    map: 'tavern',
    steps: [
      { wait: 400 },
      { walk: 'player', to: [12, 7] },
      { face: 'player', dir: 'up' },
      { wait: 500 },
      {
        say: 'gregorious',
        beat: 'Takes them in. Word travels; he knows who Aldis pulled off the strand.',
        lines: ['[Placeholder Text]'],
      },
      {
        say: 'gregorious',
        beat: 'The history. How Dreadhollow got to be in this state, and how long it took.',
        lines: ['[Placeholder Text]'],
      },
      {
        say: 'gregorious',
        beat: 'What he wants: provisions and timber enough to put the Sea Hag right. Work, and pay for it.',
        lines: ['[Placeholder Text]'],
      },
      { flag: 'firstday-offered' },
      {
        say: 'gregorious',
        beat: 'Take Aldis. He knows the Greywood and they do not. Go and ask him.',
        lines: ['[Placeholder Text]'],
      },
    ],
  },
];

// where the game boots
export const OPENING = SCENES[0];
